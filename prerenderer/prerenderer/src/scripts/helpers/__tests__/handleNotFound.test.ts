/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { NotFound } from 'scripts/lib/errors';
import handleNotFound from 'scripts/helpers/handleNotFound';

describe('helpers/handleNotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('correctly handles not found errors', async () => {
    await expect(async () => {
      await handleNotFound();
    }).rejects.toThrowError(new NotFound('not_found', 'Not Found.'));
  });
});
