FROM node:14-alpine

COPY ./docker-entrypoint.sh /usr/local/bin/
RUN apk add --no-cache openssh-client git

# See https://github.com/Yelp/dumb-init.
RUN dumb_init_url=https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
  wget -O /usr/local/bin/dumb-init $dumb_init_url \
  && chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "docker-entrypoint.sh"]

WORKDIR /var/www/html

RUN mkdir /home/node/.ssh \
  && chown -R node:node /home/node/.ssh \
  && chown -R node:node /var/www/html

USER node