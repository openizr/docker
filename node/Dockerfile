#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM dhi.io/node:26.12.1-alpine3.24-dev@sha256:0614d22bcdfe1f5fbf985e68b455e61aefba8bc697894a6e91a8542a3e5f26b4 AS dumb-init

# See https://github.com/Yelp/dumb-init.
RUN apk add --no-cache dumb-init
# Prepared here: the runtime image has no shell, so `RUN chown` can't happen there.
RUN mkdir -p /var/www/html


FROM dhi.io/node:26.12.1-alpine3.24@sha256:9d778a01d260a1b9d9656e6ca289e9a352def10b255f85e23050a5c71a6cd42e

ENV NODE_ENV=production

# Using `chmod` prevents depending on the build context's executable bits.
COPY --from=dumb-init /usr/bin/dumb-init /usr/local/bin/dumb-init
COPY --chmod=755 ./docker-entrypoint.js /usr/local/bin/
COPY --from=dumb-init --chown=1000:1000 /var/www/html /var/www/html

WORKDIR /var/www/html
USER 1000

ENTRYPOINT ["/usr/local/bin/dumb-init", "--", "node", "/usr/local/bin/docker-entrypoint.js"]
CMD ["node"]
