FROM node:23.6.0-alpine3.21

ARG TARGETARCH

ENV NODE_ENV=development

RUN apk add --no-cache openssh-client git inotify-tools rsync
RUN mkdir -p /root/.ssh
RUN mkdir -p /home/node/.ssh && chown -R node:node /home/node/.ssh
COPY ./docker-entrypoint.sh /usr/local/bin/
COPY ./dsync /usr/local/bin/
COPY ./register_ssh /usr/local/bin/

# See https://github.com/Yelp/dumb-init.
RUN extension=$([ $TARGETARCH = "arm64" ] && echo "aarch64" || echo "x86_64") && \
  dumb_init_url="https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_$extension" && \
  wget -O /usr/local/bin/dumb-init $dumb_init_url \
  && chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "docker-entrypoint.sh"]

WORKDIR /var/www/html
