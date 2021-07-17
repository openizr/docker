/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { FastifyInstance } from 'fastify';
import prerender from 'scripts/routes/prerender';

/**
 * App endpoints declaration.
 */
export default (server: FastifyInstance): void => {
  server.get('*', prerender);
};
