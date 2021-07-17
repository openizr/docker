FROM nginx:1.21.1-alpine

ENV CSP="default-src 'self' https: data: 'unsafe-inline'; base-uri 'self'; block-all-mixed-content; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests"
ENV BOT_USER_AGENTS=___
ENV FRONTEND_HOST=localhost
ENV BACKEND_URI=http://localhost:9000
ENV PRERENDERER_URI=http://localhost:9001
ENV CORS_ALLOWED_ORIGINS=(.*)
ENV CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
ENV CORS_ALLOWED_HEADERS=Auhtorization,Accept,Content-Type

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ./80.conf.template /etc/nginx/templates/80.conf.template
COPY ./80.static.conf.template /etc/nginx/templates/80.static.conf.template

# Run nginx as non-root user.
RUN chown -R nginx:nginx /etc/nginx && chown -R nginx:nginx /var/cache/nginx
USER nginx