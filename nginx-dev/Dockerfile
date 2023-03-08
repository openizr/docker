FROM nginx:1.23.3-alpine as brotli
RUN apk add --no-cache make git gcc g++ pcre-dev zlib-dev openssl-dev brotli brotli-libs
RUN git clone https://github.com/google/ngx_brotli.git
WORKDIR /ngx_brotli
RUN git submodule update --init
WORKDIR /
RUN wget https://nginx.org/download/nginx-1.23.3.tar.gz && tar zxvf nginx-1.23.3.tar.gz
WORKDIR /nginx-1.23.3
RUN ./configure \
  --prefix=/etc/nginx \
  --sbin-path=/usr/sbin/nginx \
  --modules-path=/usr/lib/nginx/modules \
  --conf-path=/etc/nginx/nginx.conf \
  --error-log-path=/var/log/nginx/error.log \
  --http-log-path=/var/log/nginx/access.log \
  --pid-path=/var/run/nginx.pid \
  --lock-path=/var/run/nginx.lock \
  --http-client-body-temp-path=/var/cache/nginx/client_temp \
  --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
  --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
  --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
  --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
  --with-perl_modules_path=/usr/lib/perl5/vendor_perl \
  --user=nginx \
  --group=nginx--with-file-aio \
  --with-threads \
  --with-http_addition_module \
  --with-http_auth_request_module \
  --with-http_dav_module \
  --with-http_flv_module \
  --with-http_gunzip_module \
  --with-http_gzip_static_module \
  --with-http_mp4_module \
  --with-http_random_index_module \
  --with-http_realip_module \
  --with-http_secure_link_module \
  --with-http_slice_module \
  --with-http_ssl_module \
  --with-http_stub_status_module \
  --with-http_sub_module \
  --with-http_v2_module \
  --with-mail \
  --with-mail_ssl_module \
  --with-stream \
  --with-stream_realip_module \
  --with-stream_ssl_module \
  --with-stream_ssl_preread_module \
  --with-cc-opt='-Os -fomit-frame-pointer -g' \
  --with-ld-opt=-Wl,--as-needed,-O1,--sort-common \
  --with-compat \
  --add-dynamic-module=../ngx_brotli
RUN make && make install

FROM nginx:1.23.3-alpine
ENV CSP="default-src 'self' https: data:; base-uri 'self'; frame-ancestors 'self'; object-src 'none';"
ENV BOT_USER_AGENTS=___
ENV FRONTEND_HOST=localhost
ENV BACKEND_URI=http://localhost:9000
ENV PRERENDERER_URI=http://localhost:9001
ENV CORS_ALLOWED_ORIGINS=(.*)
ENV CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
ENV CORS_ALLOWED_HEADERS=Authorization,Accept,Content-Type

COPY --from=brotli /usr/bin/brotli /usr/bin/brotli
COPY --from=brotli /usr/lib/nginx/modules/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/ngx_http_brotli_static_module.so
COPY --from=brotli /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./extra.conf /etc/nginx/conf.d/extra.conf
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ./80.conf.template /etc/nginx/templates/80.conf.template
COPY ./80.static.conf.template /etc/nginx/templates/80.static.conf.template

# Run nginx as non-root user.
RUN chown -R nginx:nginx /etc/nginx && chown -R nginx:nginx /var/cache/nginx
USER nginx
