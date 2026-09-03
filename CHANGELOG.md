## node:9.0.0 (2026-09-03)

### Breaking changes
- Upgrade `node` version to `26.8.1`
- Run as numeric user `1000` instead of `node`
- Switch to the Docker Hardened Image base (`dhi.io/node`)

### Improvements
- Replace the shell entrypoint with `docker-entrypoint.js`
- Use base images digests and signed packages to prevent supply-chain attacks


## node:9.0.0-dev (2026-09-03)

### Breaking changes
- Run as the non-root `node` user
- Upgrade `node` version to `26.8.1`
- Switch to the Docker Hardened Image base (`dhi.io/node`)
- Remove `SSH_PRIVATE_KEY` and `SSH_PUBLIC_KEY` environment variables
- Replace `ssh-keyscan` at start-up with `/etc/ssh/ssh_known_hosts`

### Bugs
- Fix `dsync` failing on paths containing spaces
- Fix `register_ssh` replacing key newlines by spaces in the written key
- Fix container silently exiting at start-up when offline and SSH keys are set

### Improvements
- Stop hiding `rsync` errors in `dsync`
- Add `yarn` and `pnpm` through Corepack
- Remove useless `rsync` compression in `dsync`
- Remove network access and ~3s of latency from start-up


## nginx:5.0.0 (2026-09-03)

### Breaking changes
- Change `CSP` default value
- Run as the non-root `nginx` user
- Upgrade `nginx` version to `1.31.4`
- Change `FRONTEND_PORT` default value
- Serve HTML with `Cache-Control: no-cache`
- Remove `/health` location in static mode
- Change `CORS_ALLOWED_ORIGINS` default value
- Disable assets pre-compressing at container start
- Write access and error logs in the container's streams
- Switch to the Docker Hardened Image base (`dhi.io/nginx`)
- Replace back end URL matching pattern to `/api/` instead of `/api`
- Route `BACKEND_URI` and `PRERENDERER_URI` through `upstream` blocks
- Never cache fixed-name assets such as `favicon.ico` or the service worker
- Move configuration templates to `/etc/nginx/templates/{common,dynamic,static}/`
- Move live configuration to `/var/lib/nginx/generated` rather than `/etc/nginx/conf.d`
- Validate every environment variable at start-up, making invalid value abort the container

### Features
- Add new `precompress-assets` script
- Add new `HSTS` environment variable
- Add new `CORS_MAX_AGE` environment variable
- Add new `MAX_BODY_SIZE` environment variable
- Add new `STATIC_MAX_AGE` environment variable
- Add new `TRUSTED_PROXIES` environment variable
- Add new `PERMISSIONS_POLICY` environment variable
- Add new `CORS_EXPOSED_HEADERS` environment variable
- Add new `PRECOMPRESSED_ASSETS_DIRECTORY` environment variable
- Add new `Permissions-Policy` and `Cross-Origin-Opener-Policy` headers in responses

### Bugs
- Fix CORS origin regex
- Fix MIME types list for compressed assets
- Fix files pattern for assets pre-compression
- Fix main `index.html` entrypoint cache policy
- Fix `Host` sent to the back end losing its port
- Fix the back end receiving no proxy headers at all
- Fix sourcemaps location pattern that was too broad
- Fix `.cjs` files served as `application/octet-stream`
- Fix systematic TCP connection reopening on each request
- Fix `gzip_vary` parameter always sending compressed assets
- Correctly clean existing assets before pre-compressing new ones
- Fix an invalid CORS preflight response containing `Content-Length` on a `204`
- Fix main-context errors (worker crashes, `setrlimit` failures) not reaching `stderr`
- Fix empty `BOT_USER_AGENTS` or `CORS_ALLOWED_ORIGINS` matching all values by default
- Fix a directory without `index.html` answering `403` instead of the application shell
- Fix missing `Vary: Origin` on responses containing `Access-Control-Allow-Origin` header
- Fix an untrusted peer's `X-Forwarded-For` being forwarded when `TRUSTED_PROXIES` is set
- Add `worker_rlimit_nofile`, without which `worker_connections` could exceed the descriptor limit

### Improvements
- Raise `proxy_buffer_size` to `16k`
- Remove deprecated `Expect-CT` header
- Forward `Upgrade` for WebSocket only
- Log upstream response time and request time
- Move `server_tokens off` to the `http` context
- Replace `envsubst` with a shell renderer, dropping `gettext`
- Drop back end fingerprint headers such as `X-Powered-By`
- Send preflight-only CORS headers on `OPTIONS` responses only
- Deduplicate the security and CORS headers into included snippets
- Raise `keepalive_requests` to nginx's own current default of 1000
- Derive `worker_processes` from the cgroup CPU quota instead of `auto`
- Prevent supply chain attacks using nginx and brotli official signatures
- Document `X-Accel-Buffering: no` for streams and the pre-renderer user agent loop
- Document that the back end idle timeout must exceed the 60s keepalive pool
- Add Slowloris-relevant timeouts, `open_file_cache`, `absolute_redirect off` and `port_in_redirect off`


## nginx:5.0.0-dev (2026-09-03)

### Breaking changes
- Update `CSP` default value
- Run as the non-root `nginx` user
- Raise `error_log` level to `info`
- Upgrade `nginx` version to `1.31.4`
- Change `FRONTEND_PORT` default value
- Serve HTML with `Cache-Control: no-cache`
- Remove `/health` location in static mode
- Update `CORS_ALLOWED_ORIGINS` default value to `""`
- Write access and error logs in the container's streams
- Switch to the Docker Hardened Image base (`dhi.io/nginx`)
- Replace back end URL matching pattern to `/api/` instead of `/api`
- Route `BACKEND_URI` and `PRERENDERER_URI` through `upstream` blocks
- Disable `sendfile`, `gzip_static`, `brotli_static` and `open_file_cache`
- Never cache fixed-name assets such as `favicon.ico` or the service worker
- Move configuration templates to `/etc/nginx/templates/{common,dynamic,static}/`
- Move live configuration to `/var/lib/nginx/generated` rather than `/etc/nginx/conf.d`
- Validate every environment variable at start-up, making invalid value abort the container

### Features
- Add new `precompress-assets` script
- Add new `HSTS` environment variable
- Add new `CORS_MAX_AGE` environment variable
- Add new `MAX_BODY_SIZE` environment variable
- Add new `STATIC_MAX_AGE` environment variable
- Add new `TRUSTED_PROXIES` environment variable
- Add new `PERMISSIONS_POLICY` environment variable
- Add new `CORS_EXPOSED_HEADERS` environment variable
- Add new `PRECOMPRESSED_ASSETS_DIRECTORY` environment variable
- Add new `Permissions-Policy` and `Cross-Origin-Opener-Policy` headers in responses

### Bugs
- Fix CORS origin regex
- Fix MIME types list for compressed assets
- Fix files pattern for assets pre-compression
- Fix main `index.html` entrypoint cache policy
- Fix `Host` sent to the back end losing its port
- Fix the back end receiving no proxy headers at all
- Fix `.cjs` files served as `application/octet-stream`
- Fix systematic TCP connection reopening on each request
- Fix `gzip_vary` parameter always sending compressed assets
- Correctly clean existing assets before pre-compressing new ones
- Fix an invalid CORS preflight response containing `Content-Length` on a `204`
- Fix main-context errors (worker crashes, `setrlimit` failures) not reaching `stderr`
- Fix empty `BOT_USER_AGENTS` or `CORS_ALLOWED_ORIGINS` matching all values by default
- Fix a directory without `index.html` answering `403` instead of the application shell
- Fix missing `Vary: Origin` on responses containing `Access-Control-Allow-Origin` header
- Fix an untrusted peer's `X-Forwarded-For` being forwarded when `TRUSTED_PROXIES` is set
- Add `worker_rlimit_nofile`, without which `worker_connections` could exceed the descriptor limit

### Improvements
- Raise `proxy_buffer_size` to `16k`
- Remove deprecated `Expect-CT` header
- Forward `Upgrade` for WebSocket only
- Log upstream response time and request time
- Move `server_tokens off` to the `http` context
- Replace `envsubst` with a shell renderer, dropping `gettext`
- Drop back end fingerprint headers such as `X-Powered-By`
- Send preflight-only CORS headers on `OPTIONS` responses only
- Deduplicate the security and CORS headers into included snippets
- Raise `keepalive_requests` to nginx's own current default of 1000
- Derive `worker_processes` from the cgroup CPU quota instead of `auto`
- Prevent supply chain attacks using nginx and brotli official signatures
- Document `X-Accel-Buffering: no` for streams and the pre-renderer user agent loop
- Document that the back end idle timeout must exceed the 60s keepalive pool
- Add Slowloris-relevant timeouts, `open_file_cache`, `absolute_redirect off` and `port_in_redirect off`


## node:8.0.1-dev (2025-01-31)

### Bugs
- Fix `github.com` SSH host registration in `register_ssh` script


## nginx:4.1.0 (2025-01-19)

### Features
- Add native support for ARM64 architectures

### Improvements
- Upgrade `nginx` version to `1.27.3`
- Increase static assets caching TTL to 97 days by default
- Increase CORS preflight requests caching TTL to 86400 seconds by default


## nginx:4.1.0-dev (2025-01-19)

### Features
- Add native support for ARM64 architectures

### Improvements
- Upgrade `nginx` version to `1.27.3`
- Increase static assets caching TTL to 97 days by default
- Increase CORS preflight requests caching TTL to 86400 seconds by default


## node:8.0.0 (2025-01-19)

### Breaking changes
- Upgrade `node` version to `23.6.0`

### Features
- Add native support for ARM64 architectures


## node:8.0.0-dev (2025-01-19)

### Breaking changes
- Upgrade `node` version to `23.6.0`

### Features
- Add native support for ARM64 architectures


## node:7.0.0-dev (2024-07-17)

### Breaking changes
- Upgrade `node` version to `22.4.1`


## node:7.0.0 (2024-07-17)

### Breaking changes
- Upgrade `node` version to `22.4.1`


## nginx:4.0.3 (2024-07-17)

### Improvements
- Upgrade `nginx` version to `1.27.0`


## nginx:4.0.3-dev (2024-07-17)

### Improvements
- Upgrade `nginx` version to `1.27.0`


## node:6.0.0-dev (2023-11-10)

### Breaking changes
- Upgrade `node` version to `20.9.0`


## node:6.0.0 (2023-11-10)

### Breaking changes
- Upgrade `node` version to `20.9.0`


## nginx:4.0.2-dev (2023-11-10)

### Improvements
- Upgrade `nginx` version to `1.25.3`


## nginx:4.0.2 (2023-11-10)

### Improvements
- Upgrade `nginx` version to `1.25.3`


## node:5.0.0-dev (2023-03-08)

### Breaking changes
- Upgrade `node` version to `19.7.0`

### Improvements
- Add SSH management for the `node` user
- Add support for `gitlab.com` SSH host


## node:5.0.0 (2023-03-08)

### Breaking changes
- Upgrade `node` version to `19.7.0`

### Improvements
- Add SSH management for the `node` user
- Add support for `gitlab.com` SSH host


## nginx:4.0.1-dev (2023-03-08)

### Bugs
- Fix a typo in default CORS authorized headers
- Fix public main entrypoint (index.html) caching policy (it is not cached anymore)

### Improvements
- Upgrade `nginx` version to `1.23.3`


## nginx:4.0.1 (2023-03-08)

### Bugs
- Fix a typo in default CORS authorized headers
- Fix public main entrypoint (index.html) caching policy (it is not cached anymore)

### Improvements
- Upgrade `nginx` version to `1.23.3`


## nginx:4.0.0-dev (2022-09-04)

### Breaking changes
- [brotli](https://github.com/google/brotli) is now the default compression algorithm, `gzip` is used as a fallback for clients that don't support `br`

### Improvements
- Upgrade `nginx` version to `1.23.1`
- Static assets are now pre-compressed at server start to improve response times


## nginx:4.0.0 (2022-09-04)

### Breaking changes
- [brotli](https://github.com/google/brotli) is now the default compression algorithm, `gzip` is used as a fallback for clients that don't support `br`

### Improvements
- Upgrade `nginx` version to `1.23.1`
- Static assets are now pre-compressed at server start to improve response times


## node:4.0.0-dev (2022-09-03)

### Breaking changes
- Upgrade `node` version to `18.8`


## node:4.0.0 (2022-09-03)

### Breaking changes
- Upgrade `node` version to `18.8`


## prerenderer:3.0.1 (2022-03-17)

### Improvements
- Improve performance (up to 30%) by using a pages pool system

### Bugs
- Fix incorrect rendering generation under heavy loads (more than 10req/sec)


## prerenderer:3.0.0 (2022-03-16)

### Breaking changes
- Prerenderer now listens for the `#prerender` selector before considering the page as fully rendered
- Major dependencies update

### Improvements
- Massive performance improvement (up to x10)


## nginx:3.1.2-dev (2022-03-16)

### Improvements
- Improve default CSP directive


## nginx:3.1.2 (2022-03-16)

### Improvements
- Improve default CSP directive


## node:3.0.0-dev (2022-02-24)

### Breaking changes
- Upgrade node version to `17.6`


## node:3.0.0 (2022-02-24)

### Breaking changes
- Upgrade node version to `17.6`


## nginx:3.1.1-dev (2021-08-02)

### Bugs
- Fix CORS and security headers in static assets responses


## nginx:3.1.1 (2021-08-02)

### Bugs
- Fix CORS and security headers in static assets responses


## nginx:3.1.0-dev (2021-07-19)

### Features
- It is now possible to add or override nginx directives using the `/etc/nginx/conf.d/extra.conf` file


## nginx:3.1.0 (2021-07-19)

### Features
- It is now possible to add or override nginx directives using the `/etc/nginx/conf.d/extra.conf` file


## node:2.0.1-dev (2021-07-17)

### Features
- Add new `register_ssh` script that allows to manually register SSH keys

### Improvements
- Update node version


## node:2.0.1 (2021-07-17)

### Improvements
- Update node version


## nginx:3.0.2-dev (2021-07-17)

### Features
- Add `CORS_ALLOWED_HEADERS` and `CORS_ALLOWED_METHODS` environment variables

### Improvements
- Update Nginx version
- Improve CORS policy with static assets

### Bugs
- Fix `BOT_USER_AGENTS` environment variable default value


## nginx:3.0.2 (2021-07-17)

### Features
- Add `CORS_ALLOWED_HEADERS` and `CORS_ALLOWED_METHODS` environment variables

### Improvements
- Update Nginx version
- Improve CORS policy with static assets

### Bugs
- Fix `BOT_USER_AGENTS` environment variable default value


## prerenderer:2.0.2 (2021-06-24)

### Improvements
- Improve pre-rendering performance
- Update dependencies and nodeJS version


## nginx:3.0.1-dev (2021-06-24)

### Improvements
- Update `nginx` to version 1.21


## nginx:3.0.1 (2021-06-24)

### Improvements
- Update `nginx` to version 1.21


## node:3.0.0-dev (2021-05-21)

### Breaking changes
- `BACKEND_PORT` and `BACKEND_HOST` environment variables are now `BACKEND_URI`
- `PRERENDERER_PORT` and `PRERENDERER_HOST` environment variables are now `PRERENDERER_URI`
- `CORS_ALLOWED_ORIGINS` environment variable now takes a regular expression, to allow multiple domains
- Nginx is now run as a non-root user, for better security

### Features
- Add a new `CSP` environment variable, allowing you to specify server's Content Security Policy

### Improvements
- Improve CORS handling, add CORS headers for static assets
- All environment variables, except `FRONTEND_PORT` now have a default value


## node:3.0.0 (2021-05-21)

### Breaking changes
- `BACKEND_PORT` and `BACKEND_HOST` environment variables are now `BACKEND_URI`
- `PRERENDERER_PORT` and `PRERENDERER_HOST` environment variables are now `PRERENDERER_URI`
- `CORS_ALLOWED_ORIGINS` environment variable now takes a regular expression, to allow multiple domains
- Nginx is now run as a non-root user, for better security

### Features
- Add a new `CSP` environment variable, allowing you to specify server's Content Security Policy

### Improvements
- Improve CORS handling, add CORS headers for static assets
- All environment variables, except `FRONTEND_PORT` now have a default value


## node:2.0.0-dev (2021-04-13)

### Breaking changes
- Upgrade `node` major version to `15`

### Improvements
- `dsync` utility now performs a first synchronization when started, and can also synchronize two files


## node:2.0.0 (2021-04-13)

### Breaking changes
- Upgrade `node` major version to `15`


## node:1.1.0-dev (2021-03-20)

### Features
- Add new `dsync` command, that keep 2 directories synchronized in real-time using


## node:1.0.2-dev (2021-03-09)

### Bugs
- Fix permission issues with SSH keys


## node:1.0.1-dev (2021-03-06)

### Bugs
- Sharing volumes between host and container was generating permissions issues, this is now fixed

### Improvements
- `NODE_ENV` environment variable is now defined to `development` by default


## node:1.0.1 (2021-03-06)

### Improvements
- `NODE_ENV` environment variable is now defined to `production` by default


## nginx:2.0.2-dev (2021-03-05)

### Bugs
- Dynamic configuration was properly redirecting requests to `index.html`, this is now fixed


## nginx:2.0.2 (2021-03-05)

### Bugs
- Dynamic configuration was properly redirecting requests to `index.html`, this is now fixed


## node:1.0.0-dev (2021-02-21)

### General
- Initial stable release


## node:1.0.0-dev (2021-02-21)

### General
- Initial stable release


## node:1.0.0 (2021-02-21)

### General
- Initial stable release


## 2.0.1 (2021-02-05)

### Improvements
- Enable logging for static assets requests in production (`nginx`)
- Remove CSP header from requests (it should rather be defined at the application level) (`nginx`, `nginx-dev`)


## 2.0.0 (2021-01-28)

### Beaking changes
- List of allowed origins for CORS must now be specified in the new `CORS_ALLOWED_ORIGINS`  environment variable (`nginx`, `nginx-dev`)

### Features
- Add a new `/health` endpoint for monitoring and integration in Cloud environments (`nginx`, `nginx-dev`)
- Add a new static serving mode for statically generated websites (`nginx`, `nginx-dev`)
- Add a new `NGINX_ENTRYPOINT_STATIC_SERVER` environment variable to define in which mode to start nginx (`nginx`, `nginx-dev`)

### Improvements
- Unnecessary information such as static assets requests are not logged anymore with production image (`nginx`)
- Improve Nginx configurations and legibility (`nginx`, `nginx-dev`)

### Bugs
- Sourcemaps are now correctly served when using Nginx development image (`nginx-dev`)


## 1.1.1 (2021-01-09)

### Improvements
- Fontend host to pass to pre-renderer is now defined through environment variables
- Remove unused files
- Prevents showing sourcemaps in production


## 1.1.0 (2020-12-23)

### Features
- Dynamic web pages can now be pre-rendered by the new pre-renderer service


## 1.0.0 (2020-12-16)

### General
- Initial stable release
