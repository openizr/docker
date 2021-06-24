/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * App configuration.
 */
export default {
  // Mode (development|preproduction|production).
  mode: process.env.ENV,
  // Server's port.
  port: parseInt(process.env.PORT || '9000', 10),
  // Logging options.
  logger: {
    level: (process.env.ENV === 'development') ? 'info' : 'error',
  },
  // Server's options.
  keepAliveTimeout: 2000,
  connectionTimeout: 3000,
  ignoreTrailingSlash: true,
};
