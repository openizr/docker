FROM nginx:1.19-alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ./80.conf.template /etc/nginx/templates/80.conf.template
COPY ./80.static.conf.template /etc/nginx/templates/80.static.conf.template
