# nginx-dev

This Docker image is a pre-configured nginx server ready to serve static or dynamic pages, APIs, and static assets.
*Use it only in a development environment, do not deploy it in production.*


## Additional nginx configuration

If needed, you can add or override nginx directives, by using the `/etc/nginx/conf.d/extra.conf` file (empty by default).
This file is automatically imported by nginx at startup.


## Environment variables

- *`CSP`*: Content Security Policy. Default is `default-src 'self' https: data: 'unsafe-inline'; base-uri 'self'; block-all-mixed-content; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests`
- *`BOT_USER_AGENTS`*: regular expression defining which user agent is considered as a robot and should trigger pre-rendering (used only when serving dynamic pages). Default is `_`
- *`FRONTEND_PORT`*: front-end port listening for incoming HTTP requests
- *`FRONTEND_HOST`*: front-end host listening for incoming HTTP requests. Default is `localhost`
- *`BACKEND_URI`*: back-end host and port to which forward incoming HTTP requests (other than static assets). Default is `http://localhost:9000`
- *`PRERENDERER_URI`*: prerendering service host to which forward robots HTTP requests (used only when serving dynamic pages). Default is `http://localhost:9001`
- *`CORS_ALLOWED_ORIGINS`*: regular expression containing allowed origins for CORS. Default is `(.*)`
- *`CORS_ALLOWED_HEADERS`*: list of allowed HTTP headers for CORS. Default is `Auhtorization,Accept,Content-Type`
- *`CORS_ALLOWED_METHODS`*: list of allowed HTTP methods for CORS. Default is `GET,POST,PUT,PATCH,DELETE,OPTIONS`
- *`NGINX_ENTRYPOINT_STATIC_SERVER`*: whether to configure this server to serve static pages (leave empty to serve dynamic pages by default)
