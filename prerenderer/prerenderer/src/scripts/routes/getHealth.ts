/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import createSchema from 'scripts/helpers/createSchema';

/**
 * `GET /health` endpoint handler.
 */
export default {
  handler: (_request: FastifyRequest, response: FastifyReply): void => {
    response.send();
  },
  schema: createSchema({
    response: {
      200: {
        type: 'string',
      },
    },
  }),
};
