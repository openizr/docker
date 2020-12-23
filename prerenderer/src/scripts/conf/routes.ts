/**
 * Copyright (c) ...
 * All rights reserved.
 */

import { FastifyInstance } from 'fastify';
import v1GetPrerendered from 'scripts/routes/v1/getPrerendered';

/**
 * App endpoints declaration.
 */
export default (server: FastifyInstance): void => {
  server.get('*', v1GetPrerendered);
};
