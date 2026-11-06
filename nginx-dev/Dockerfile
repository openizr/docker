#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM openizr/nginx:5.0.2@sha256:7a5d6bd3021b1a4c63c826d0c58196341f2b40b8aed76907bb8051a0b3eae16d

ENV HSTS=""
ENV MAX_BODY_SIZE=64m
ENV STATIC_MAX_AGE=epoch
ENV CORS_ALLOWED_ORIGINS=""
ENV CSP="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'"

COPY ./nginx.conf  /etc/nginx/nginx.conf
COPY ./templates/  /etc/nginx/templates/
