#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

# To get the SHA256, run:
#   curl -O https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz{,.asc}
#   curl -O https://nginx.org/keys/pluknet.key && gpg --import pluknet.key
#   gpg --verify nginx-${NGINX_VERSION}.tar.gz.asc nginx-${NGINX_VERSION}.tar.gz
#   shasum -a 256 nginx-${NGINX_VERSION}.tar.gz
ARG NGX_BROTLI_REF=a71f9312c2deb28875acc7bacfdd5695a111aa53
ARG NGINX_SHA256=e6f20b644a17a643f059ae6467a1971fe2811587d025e071068753a1f1e3b3c3
ARG NGINX_DEV_DIGEST=sha256:e1584d7c95abf3d0f059242914b0a8bdeb90da3addd1bf3d1c873da78c6f8e4d
ARG NGINX_DIGEST=sha256:5f15a5d2b700fb705602754419a5851194f9cf9226cdda22f28d859832a2bd82
ARG ALPINE_VERSION=3.24
ARG NGINX_VERSION=1.31.4

FROM dhi.io/nginx:${NGINX_VERSION}-alpine${ALPINE_VERSION}-dev@${NGINX_DEV_DIGEST} AS brotli

# Global ARGs are empty inside a stage unless redeclared.
ARG NGINX_VERSION NGINX_SHA256 NGX_BROTLI_REF

RUN apk add --no-cache \
  make git gcc g++ pcre2-dev zlib-dev openssl-dev brotli brotli-dev linux-headers

# Fetches the pinned commit only, not the whole history.
RUN git init -q /ngx_brotli \
  && git -C /ngx_brotli fetch -q --depth 1 https://github.com/google/ngx_brotli "${NGX_BROTLI_REF}" \
  && git -C /ngx_brotli checkout -q FETCH_HEAD \
  && git -C /ngx_brotli submodule update --init --recursive --depth 1 \
  && echo "ngx_brotli at $(git -C /ngx_brotli rev-parse HEAD)"

RUN wget -q "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" \
  && echo "${NGINX_SHA256}  nginx-${NGINX_VERSION}.tar.gz" | sha256sum -c - \
  && tar zxf "nginx-${NGINX_VERSION}.tar.gz" \
  && mv "nginx-${NGINX_VERSION}" /nginx-src

WORKDIR /nginx-src
RUN ./configure --with-compat --add-dynamic-module=/ngx_brotli \
  && make modules \
  && mkdir -p /modules \
  && cp objs/ngx_http_brotli_filter_module.so objs/ngx_http_brotli_static_module.so /modules/

# Writable state for the non-root user: rendered configuration, spool directories.
RUN mkdir -p /state/generated/snippets \
      /state/tmp/client /state/tmp/proxy /state/tmp/fastcgi /state/tmp/uwsgi /state/tmp/scgi \
  && chmod 700 /state/generated /state/tmp/*


FROM dhi.io/nginx:${NGINX_VERSION}-alpine${ALPINE_VERSION}@${NGINX_DIGEST}

# Routing.
ENV FRONTEND_PORT=8080
ENV BOT_USER_AGENTS=""
ENV FRONTEND_HOST=localhost
ENV BACKEND_URI=http://localhost:9000
ENV PRERENDERER_URI=http://localhost:9001

# Caching, limits and pre-compression.
ENV STATIC_MAX_AGE=1y
ENV MAX_BODY_SIZE=16m
ENV PRECOMPRESSED_ASSETS_DIRECTORY=

# CORS.
ENV CORS_MAX_AGE=86400
ENV CORS_ALLOWED_ORIGINS=""
ENV CORS_EXPOSED_HEADERS=""
ENV CORS_ALLOWED_HEADERS=Authorization,Accept,Content-Type
ENV CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS

# Security.
ENV TRUSTED_PROXIES=""
ENV HSTS="max-age=63072000; includeSubDomains"
ENV PERMISSIONS_POLICY="camera=(), microphone=(), geolocation=(), payment=()"
ENV CSP="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"

COPY ./nginx.conf             /etc/nginx/nginx.conf
COPY ./conf.d/                /etc/nginx/conf.d/
COPY ./templates/             /etc/nginx/templates/
COPY ./docker-entrypoint.sh   /docker-entrypoint.sh
COPY ./bin/precompress-assets /usr/local/bin/precompress-assets

COPY --from=brotli --chown=nginx:nginx /state/ /var/lib/nginx/
COPY --from=brotli /usr/bin/brotli /usr/bin/brotli
COPY --from=brotli /usr/lib/libbrotlicommon.so.1* /usr/lib/libbrotlidec.so.1* /usr/lib/libbrotlienc.so.1* /usr/lib/
COPY --from=brotli /modules/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/ngx_http_brotli_static_module.so
COPY --from=brotli /modules/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so

USER nginx
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
