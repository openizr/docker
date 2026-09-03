#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM openizr/nginx:5.0.0@sha256:e803a976f8df363d4790cb87dd675aa7161d49959788bbea2f0034d5e768c411

ENV HSTS=""
ENV MAX_BODY_SIZE=64m
ENV STATIC_MAX_AGE=epoch
ENV CORS_ALLOWED_ORIGINS=""
ENV CSP="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"

COPY ./nginx.conf  /etc/nginx/nginx.conf
COPY ./templates/  /etc/nginx/templates/
