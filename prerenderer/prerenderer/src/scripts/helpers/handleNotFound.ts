/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { NotFound } from 'scripts/lib/errors';

/**
 * Handles HTTP 404 errors.
 *
 * @returns {void}
 */
export default function handleNotFound(): void {
  throw new NotFound('not_found', 'Not Found.');
}
