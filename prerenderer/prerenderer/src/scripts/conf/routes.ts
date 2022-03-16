/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { FastifyInstance } from 'fastify';
import getHealth from 'scripts/routes/getHealth';
import prerender from 'scripts/routes/prerender';

/**
 * App endpoints declaration.
 */
export default (server: FastifyInstance): void => {
  /**
   * V1 API endpoints.
   */
  server.register((app, _options, done) => {
    app.get('*', prerender);
    app.head('*', (_request, response) => { response.send(); });
    done();
  }, { prefix: '' });

  /**
   * Health check endpoint.
   */
  server.get('/health', getHealth);
};
