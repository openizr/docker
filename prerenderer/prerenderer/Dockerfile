FROM openizr/node:3.0.0-dev as build-stage
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /var/www/html/
COPY ./src ./src
COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./tsconfig.json ./
RUN yarn
RUN yarn run build

FROM openizr/node:3.0.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /var/www/html/
USER root
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont
USER node
COPY --from=build-stage /var/www/html/dist/ /var/www/html/
RUN yarn
CMD node main.js