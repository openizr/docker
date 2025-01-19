FROM node:23.6.0-alpine3.21

ARG TARGETARCH

ENV NODE_ENV=production

# See https://github.com/Yelp/dumb-init.
RUN extension=$([ $TARGETARCH = "arm64" ] && echo "aarch64" || echo "x86_64") && \
  dumb_init_url="https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_$extension" && \
  wget -O /usr/local/bin/dumb-init $dumb_init_url \
  && chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "docker-entrypoint.sh"]

WORKDIR /var/www/html

RUN chown -R node:node /var/www/html

USER node
