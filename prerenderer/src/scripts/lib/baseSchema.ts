/**
 * Copyright (c) ...
 * All rights reserved.
 */

/**
 * Fastify validation and serialization schema used as a basis for every endpoint.
 */
export default {
  body: {
    additionalProperties: false,
    errorMessage: {
      type: 'Request body should be a valid object',
    },
  },
};
