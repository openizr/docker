FROM node:14-alpine as build-stage
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /var/www/html/
COPY ./ ./
RUN yarn && yarn run build

FROM node:14-alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /var/www/html/
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont
COPY --from=build-stage /var/www/html/dist/ /var/www/html/
RUN yarn
CMD node main.js