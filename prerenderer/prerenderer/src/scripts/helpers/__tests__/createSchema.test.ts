/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import createSchema from 'scripts/helpers/createSchema';

describe('helpers/createSchema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('with body', async () => {
    expect(createSchema({ body: { required: ['test'] } })).toMatchSnapshot();
  });

  test('with query', async () => {
    expect(createSchema({ query: { required: ['test'] } })).toMatchSnapshot();
  });

  test('with params', async () => {
    expect(createSchema({ params: { required: ['test'] } })).toMatchSnapshot();
  });
});
