#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

FROM dhi.io/node:26.8.1-alpine3.24-dev@sha256:568938d6b7b45704a4bd6b86604bbd3363623d7505875449ba431bb7cd6f0796 AS dumb-init

# See https://github.com/Yelp/dumb-init.
RUN apk add --no-cache dumb-init
# Prepared here: the runtime image has no shell, so `RUN chown` can't happen there.
RUN mkdir -p /var/www/html


FROM dhi.io/node:26.8.1-alpine3.24@sha256:33c8aa3a66d8b227e75e8bec0a8c8a022cfcd96e0732d6e4abdde13e574ba1e7

ENV NODE_ENV=production

# Using `chmod` prevents depending on the build context's executable bits.
COPY --from=dumb-init /usr/bin/dumb-init /usr/local/bin/dumb-init
COPY --chmod=755 ./docker-entrypoint.js /usr/local/bin/
COPY --from=dumb-init --chown=1000:1000 /var/www/html /var/www/html

WORKDIR /var/www/html
USER 1000

ENTRYPOINT ["/usr/local/bin/dumb-init", "--", "node", "/usr/local/bin/docker-entrypoint.js"]
CMD ["node"]
