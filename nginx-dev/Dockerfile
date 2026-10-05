#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM openizr/nginx:5.0.1@sha256:67e0d081812e16cc9a8bba6b53c898fb2e384ce39e32d8d68cf61eb0dbd4ac74

ENV HSTS=""
ENV MAX_BODY_SIZE=64m
ENV STATIC_MAX_AGE=epoch
ENV CORS_ALLOWED_ORIGINS=""
ENV CSP="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"

COPY ./nginx.conf  /etc/nginx/nginx.conf
COPY ./templates/  /etc/nginx/templates/
