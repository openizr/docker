FROM node:22.4.1-alpine3.19

ENV NODE_ENV=development

RUN apk add --no-cache openssh-client git inotify-tools rsync
RUN mkdir -p /root/.ssh
RUN mkdir -p /home/node/.ssh && chown -R node:node /home/node/.ssh
COPY ./docker-entrypoint.sh /usr/local/bin/
COPY ./dsync /usr/local/bin/
COPY ./register_ssh /usr/local/bin/

# See https://github.com/Yelp/dumb-init.
RUN dumb_init_url=https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
  wget -O /usr/local/bin/dumb-init $dumb_init_url \
  && chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "docker-entrypoint.sh"]

WORKDIR /var/www/html
