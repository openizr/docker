FROM nginx:1.19-alpine

ENV CSP="default-src 'self' https: data: 'unsafe-inline'; base-uri 'self'; block-all-mixed-content; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests"
ENV BOT_USER_AGENTS=_
ENV FRONTEND_HOST=localhost
ENV BACKEND_URI=http://localhost:9000
ENV PRERENDERER_URI=http://localhost:9001
ENV CORS_ALLOWED_ORIGINS=(.*)

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ./80.conf.template /etc/nginx/templates/80.conf.template
COPY ./80.static.conf.template /etc/nginx/templates/80.static.conf.template

# Run nginx as non-root user.
RUN chown -R nginx:nginx /etc/nginx && chown -R nginx:nginx /var/cache/nginx
USER nginx