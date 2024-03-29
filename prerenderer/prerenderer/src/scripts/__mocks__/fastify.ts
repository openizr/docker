/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Fastify mock.
 */
const addHook = jest.fn((_event, callback) => callback({
  headers: {},
  method: (process.env.FASTIFY_REQUEST_TYPE || 'OPTIONS'),
}, {
  header: jest.fn(),
  status: jest.fn(() => ({ send: jest.fn() })),
}, jest.fn()));

const register = jest.fn((callback) => callback({
  post: jest.fn(),
  get: jest.fn(),
  head: jest.fn((_endpoint, headCallback) => headCallback({}, { send: jest.fn() })),
}, null, jest.fn()));

const setValidatorCompiler = jest.fn((callback) => callback({ schema: {} }));

const listen = jest.fn((_a, _b, callback) => callback(
  (process.env.ENV === 'production')
    ? 'error'
    : undefined,
));

const fastify = jest.fn(() => ({
  addHook,
  register,
  get: jest.fn(),
  listen,
  setValidatorCompiler,
  log: { fatal: jest.fn(), error: jest.fn() },
  setErrorHandler: jest.fn(),
  setNotFoundHandler: jest.fn(),
  setSchemaErrorFormatter: jest.fn(),
  addContentTypeParser: jest.fn((_type, callback) => callback({}, {
    headers: {
      'content-type': (process.env.FASTIFY_CONTENT_TYPE || 'multipart/form-data'),
    },
    on: jest.fn((_event, onCallback) => onCallback()),
  }, () => null)),
}));

export {
  fastify,
  addHook,
  register,
  listen,
};
export default fastify;
