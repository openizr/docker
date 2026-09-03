# nginx

Pre-configured non-root nginx, serving static or dynamic pages, APIs and assets.
*Optimized for production. For development features, see the development image.*

It fronts APIs, websites and SPAs with secure defaults for headers, routing, connection sizing and timeouts.
Put a WAF or load balancer in front for TLS, rate limiting, connection limiting and DDoS defense.

| | production | development |
|---|---|---|
| `sendfile` | on | **off** — a bind mount can serve stale bytes after an edit |
| file metadata cache | 60s | **off** — it would hide an edited file |
| `gzip_static` / `brotli_static` | on | **off** — a stale `.gz` would shadow the new file |
| `STATIC_MAX_AGE` | `1y` | **`epoch`** — nothing is cached |
| fixed-name assets | 1 day | **`epoch`** — an edited favicon shows up at once |
| source maps | hidden | **served** |
| `HSTS` | 2 years | **empty** — it would pin localhost to HTTPS |
| `CSP` | strict | allows `unsafe-eval` and `ws:` for HMR |
| `error_log` | `warn` | `info` |


## Serving modes

- **dynamic** (default): SPA. Unmatched paths serve `index.html`. Crawlers matching `BOT_USER_AGENTS` go to the pre-renderer. The API lives under `/api/`.
- **static**: files on disk are served, everything else goes to the back end. Set `NGINX_ENTRYPOINT_STATIC_SERVER=1`.

In both modes: source maps are hidden (the shell answers in dynamic mode, the back end in static mode), HTML is `Cache-Control: no-cache`, other assets get `STATIC_MAX_AGE`.
Dotfiles are not filtered; configure that per project.

WebSocket handshakes on `/api/` are forwarded. Any other `Upgrade` (e.g. `h2c`) is stripped: it would turn nginx into a tunnel that bypasses routing and limits. A connection silent for 60s (`proxy_read_timeout`) is closed, so the application must ping.
The same applies to streams (SSE, chunked progress), which are also buffered unless the back end sends `X-Accel-Buffering: no`.


## Listening port

The container listens on **`8080`**. It runs as `nginx`, not root, and a port below 1024 is only bindable where the runtime allows it: Docker does by default, Kubernetes does not. To listen on `80` there, grant `NET_BIND_SERVICE` or set the `net.ipv4.ip_unprivileged_port_start=0` sysctl; otherwise map the port at the service or load balancer.


## Additional nginx configuration

`/etc/nginx/conf.d/extra.conf` is empty by default and included at the end of the `server` block.

- Use `extra.conf` to add a few locations. Replace the template for different behaviour.
- Do not enable `proxy_intercept_errors` in dynamic mode: the pre-renderer is selected by an internal `418`, so a genuine `418` from your back end would be pre-rendered.
- New locations must include the common headers:

```nginx
location /example {
  include /var/lib/nginx/generated/snippets/security-headers.conf;
  add_header 'X-Example' 'value' always;
}
```


## Pre-compressing assets

nginx serves an existing `.gz` or `.br` sibling instead of compressing on the fly. Produce them at build time so the work lives in a layer shared by every replica:

```dockerfile
FROM openizr/nginx
COPY --chown=nginx:nginx ./dist /var/www/html/public
RUN  precompress-assets /var/www/html/public
```

`--chown` is required: `COPY` gives files to root, and the script runs as `nginx`, writing next to each file.

`precompress-assets` skips files under 1 KB and drops any output not smaller than its source, since `gzip_static` never compares sizes. It first removes the `.gz` and `.br` siblings of every file it handles, so a stale one never shadows a new build. Genuine archives with no uncompressed sibling are left alone.


## Healthcheck

`GET /health` returns `200 ok` in dynamic mode. In static mode, it goes to the back end like any other unmatched path. No `HEALTHCHECK` is declared: the hardened base has no HTTP client. Wire it from your orchestrator.


## Environment variables

Every value is interpolated into the nginx configuration and validated at start-up. Defaults are the image's `ENV`; an empty value where one is required, a stray quote, backslash, dollar sign or newline aborts the container naming the variable.

### Routing

- *`FRONTEND_PORT`*: listening port. Defaults to `8080`.
- *`FRONTEND_HOST`*: `Host` sent to the pre-renderer. Defaults to `localhost`.
- *`BACKEND_URI`*: back-end `http://host:port` for API requests. Defaults to `http://localhost:9000`.
- *`PRERENDERER_URI`*: pre-renderer `http://host:port` (dynamic mode). Defaults to `http://localhost:9001`.
- *`BOT_USER_AGENTS`*: regexp of user agents to pre-render (dynamic mode). Defaults to `""`: nothing is pre-rendered. It must not match the pre-renderer's own user agent (e.g. `HeadlessChrome`), or requests loop forever.
- *`NGINX_ENTRYPOINT_STATIC_SERVER`*: set for static mode, leave empty for dynamic.

`BACKEND_URI` and `PRERENDERER_URI` **must** use `http`, not `https`. Any path is ignored. Their host names are resolved once, at start-up, so the back end must be resolvable before this container starts and is redeployed together with it.

Idle connections to the back end are pooled for **60s**. The back end's own idle timeout must be longer (Node's default is 5s), or a connection it just closed gets reused and the request fails with `502`.

### Security

- *`CSP`*: Content Security Policy. Defaults to `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'`.
- *`HSTS`*: `Strict-Transport-Security` value. Defaults to `max-age=63072000; includeSubDomains`.
- *`PERMISSIONS_POLICY`*: `Permissions-Policy` value. Defaults to `camera=(), microphone=(), geolocation=(), payment=()`.
- *`TRUSTED_PROXIES`*: comma-separated addresses or CIDRs of the proxies in front. Defaults to `""`.

Framework fingerprints sent by the back end (`X-Powered-By`, `X-AspNet-Version`, `X-AspNetMvc-Version`, `X-Runtime`) are dropped.

**`Host` is not validated.** `server_name _` answers any `Host` and forwards it unchanged. Only your application knows its own host names, and it should build absolute URLs from its own configuration. `X-Forwarded-Host` is not sent. Reject unknown hosts at the load balancer, or with your own `server_name`.

**Set `TRUSTED_PROXIES` whenever something proxies to this image.** Unset, an inbound `X-Forwarded-For` is discarded and replaced by the peer address, so the logs record the balancer, and `X-Forwarded-Proto` says `http` even for HTTPS clients. That breaks `secure` cookies, absolute URLs and OAuth redirects. Set, and only when the peer is in the list, `$remote_addr` is resolved from the chain and `X-Forwarded-Proto` and `-Port` are passed on; the back end receives the chain plus the peer. A peer outside the list is treated as a client. The entrypoint warns when it is unset.

### CORS

- *`CORS_ALLOWED_ORIGINS`*: regexp alternation of allowed origins. Defaults to `""`.
- *`CORS_ALLOWED_METHODS`*: defaults to `GET,POST,PUT,PATCH,DELETE,OPTIONS`.
- *`CORS_ALLOWED_HEADERS`*: defaults to `Authorization,Accept,Content-Type`.
- *`CORS_EXPOSED_HEADERS`*: defaults to `""`.
- *`CORS_MAX_AGE`*: preflight cache in seconds. Defaults to `86400`.

`CORS_ALLOWED_ORIGINS` is matched anchored against the whole `Origin`. Escape the dots:

```
CORS_ALLOWED_ORIGINS='https://app\.example\.com|https://admin\.example\.com'
```

Unescaped, `https://app.example.com` also matches `https://appXexampleXcom`, a registrable domain. A match is reflected with `Access-Control-Allow-Credentials: true`, so that would be full credentialed access to your API.

Non-matching origins get no CORS header. Every response carries `Vary: Origin`. Preflights are answered with `204` and never reach the back end.

**nginx owns CORS.** Any `Access-Control-*` header sent by the back end is dropped: kept, it would duplicate nginx's and browsers reject a repeated `Access-Control-Allow-Origin`. Disable CORS middleware in the application.

### Limits and caching

- *`MAX_BODY_SIZE`*: maximum request body. Defaults to `16m`.
- *`STATIC_MAX_AGE`*: `expires` for static assets. Defaults to `1y`.
- *`PRECOMPRESSED_ASSETS_DIRECTORY`*: directory to pre-compress at start-up instead of build time. Defaults to ``.

`STATIC_MAX_AGE` suits content-addressed bundles, whose name changes with their bytes. Fixed-name files get **one day** with an `ETag`, so the daily check is a `304`. This does not follow `STATIC_MAX_AGE`, or new icons and crawl rules would reach visitors a year later:

```
/favicon.ico   /robots.txt   /sitemap.xml   /humans.txt
/browserconfig.xml   /apple-touch-icon*.png   /*.webmanifest
/service-worker.js   /sw.js
```

`/.well-known/` is **never cached**: its paths are fixed by spec and often short-lived. Override per file if needed:

```nginx
location = /.well-known/apple-app-site-association { expires 1h; }
```

### Traffic policy belongs upstream

There is no rate limiting and no per-IP connection limiting here, by design.

A rate limit needs context nginx lacks (user, tenant, API key) and sees only one replica's share of traffic. Per-IP is the wrong key: CGNAT hides thousands of users behind one address, while an attacker rotates addresses for free. Behind a load balancer, nginx's peer *is* the balancer, so a connection limit would treat all clients as one.

Still enforced here, because it is per-connection work nginx must do itself: `MAX_BODY_SIZE`, `client_header_timeout`, `client_body_timeout` and `send_timeout` (15s each, against slowloris), `keepalive_timeout`, and `worker_connections` as the descriptor ceiling.


## Tuning

`worker_processes` is derived from the container's cgroup CPU quota, capped by its cpuset, falling back to `auto`. `auto` alone counts the *host's* cores: a 1-CPU limit on a 64-core node would spawn 64 workers, each with its own caches and keepalive pool.

`worker_rlimit_nofile` is `32768`: `open_file_cache` (up to 10000 per worker) plus two descriptors per connection. As non-root, nginx cannot exceed the inherited hard limit. A low runtime limit logs `setrlimit(RLIMIT_NOFILE, 32768) failed` at start-up and stays in force.
