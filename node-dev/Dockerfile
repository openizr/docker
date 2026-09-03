#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM dhi.io/node:26.8.1-alpine3.24-dev@sha256:568938d6b7b45704a4bd6b86604bbd3363623d7505875449ba431bb7cd6f0796

ENV NODE_ENV=development \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# See https://github.com/Yelp/dumb-init.
RUN apk add --no-cache openssh-client git inotify-tools rsync dumb-init

# Corepack shims honour the project's `packageManager` field; the `node` user's cache is
# pre-filled so these default versions work offline.
RUN mkdir -p /usr/local/bin \
    && corepack enable --install-directory /usr/local/bin \
    && HOME=/home/node corepack install -g yarn@4.18.0 pnpm@11.25.0 \
    && chown -R node:node /home/node

COPY ./known_hosts /etc/ssh/ssh_known_hosts
# Using `chmod` prevents depending on the build context's executable bits.
COPY --chmod=755 ./docker-entrypoint.sh ./dsync ./register_ssh /usr/local/bin/

WORKDIR /var/www/html
RUN chown 1000:1000 /var/www/html
USER 1000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "docker-entrypoint.sh"]
CMD ["node"]
