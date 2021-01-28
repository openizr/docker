# nginx-dev

This Docker image is a pre-configured nginx server ready to serve static or dynamic pages, APIs, and static assets.
*Use it only in a development environment, do not deploy it in production.*

## Environment variables

- *`ENV`*: environment (development|preproduction|production)
- *`BACKEND_PORT`*: back-end port to which forward incoming HTTP requests (other than static assets)
- *`BACKEND_HOST`*: back-end host to which forward incoming HTTP requests (other than static assets)
- *`FRONTEND_PORT`*: front-end port listening for incoming HTTP requests
- *`FRONTEND_HOST`*: front-end host listening for incoming HTTP requests
- *`PRERENDERER_HOST`*: prerendering service host to which forward robots HTTP requests (used only when serving dynamic pages)
- *`PRERENDERER_PORT`*: prerendering service port to which forward robots HTTP requests (used only when serving dynamic pages)
- *`BOT_USER_AGENTS`*: regular expression defining which user agent is considered as a robot and should trigger pre-rendering (used only when serving dynamic pages)
- *`CORS_ALLOWED_ORIGINS`*: coma-separated list of allowed origins for CORS
- *`NGINX_ENTRYPOINT_STATIC_SERVER`*: whether to configure this server to serve static pages (leave empty to serve dynamic pages by default)
