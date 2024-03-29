/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { captureError } from 'scripts/helpers/monitoring';
import Ajv from 'ajv';
import fastify from 'fastify';
import ajvErrors from 'ajv-errors';
import configuration from 'scripts/conf/app';
import declareRoutes from 'scripts/conf/routes';
import handleError from 'scripts/helpers/handleError';
import formatError from 'scripts/helpers/formatError';
import handleNotFound from 'scripts/helpers/handleNotFound';
import { FastifyValidationResult } from 'fastify/types/schema.d';

// Initializing validator compiler...
const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
});
ajvErrors(ajv);

// Initializing fastify server...
const app = fastify({
  logger: configuration.logger,
  trustProxy: configuration.trustedProxies,
  keepAliveTimeout: configuration.keepAliveTimeout,
  connectionTimeout: configuration.connectionTimeout,
  ignoreTrailingSlash: configuration.ignoreTrailingSlash,
});

// Default errors handlers.
app.setErrorHandler(handleError);
app.setNotFoundHandler(handleNotFound);
app.setSchemaErrorFormatter(formatError);

// Handles CORS in development mode.
if (configuration.mode === 'development') {
  app.addHook('onRequest', (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', '*');
    response.header('Access-Control-Allow-Methods', '*');
    if (request.method === 'OPTIONS') {
      response.status(200).send();
    } else {
      next();
    }
  });
}

// Applies custom validator compiler.
app.setValidatorCompiler(({ schema }) => (
  <FastifyValidationResult>ajv.compile(schema)
));

// Logs requests timeouts.
app.addHook('onTimeout', (request, _response, done) => {
  const error = new Error(`Request "${request.method} ${request.url}" timed out.`);
  app.log.error(error);
  captureError('error', configuration.appId, {
    code: 'request_timeout',
    message: error.message,
    stack: error.stack,
    statusCode: 504,
    url: request.url,
    method: request.method,
    headers: Object.keys(request.headers),
  });
  done();
});

// Catch-all for unsupported content types. Prevents fastify from throwing HTTP 500 when dealing
// with unknown payloads. See https://www.fastify.io/docs/latest/ContentTypeParser/.
app.addContentTypeParser('*', (_request, payload, next) => {
  if (/^multipart\/form-data/.test(payload.headers['content-type'] as string)) {
    next(null, payload);
  } else {
    let data = '';
    payload.on('data', (chunk) => { data += chunk; });
    payload.on('end', () => { next(null, data); });
  }
});

// Adding app routes...
declareRoutes(app);

// Starting server...
app.listen(configuration.port, '0.0.0.0', (error) => {
  if (error) {
    app.log.fatal(error);
    captureError('fatal', configuration.appId, { message: error.message, stack: error.stack });
    process.exit(1);
  }
});
