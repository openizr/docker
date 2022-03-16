/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import getHealth from 'scripts/routes/getHealth';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('fastify');

describe('routes/getHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('correctly handles request', () => {
    const send = jest.fn();
    getHealth.handler({} as FastifyRequest, { send } as unknown as FastifyReply);
    expect(getHealth.schema).toMatchSnapshot();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith();
  });
});
