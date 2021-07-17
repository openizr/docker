FROM node:15.14-alpine as build-stage
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /var/www/html/
COPY ./ ./
RUN yarn && yarn run build

FROM node:15.14-alpine
ENV ENV=production \
  NODE_ENV=production \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# See https://github.com/Yelp/dumb-init.
RUN dumb_init_url=https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && \
  wget -O /usr/local/bin/dumb-init $dumb_init_url \
  && chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["/usr/local/bin/dumb-init", "docker-entrypoint.sh"]
WORKDIR /var/www/html
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont
RUN chown -R node:node /var/www/html
USER node
COPY --from=build-stage /var/www/html/dist/ /var/www/html/
RUN yarn
CMD node main.js
