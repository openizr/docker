/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import prerender from 'scripts/routes/prerender';
import { FastifyRequest as Request, FastifyReply as Reply } from 'fastify';

jest.mock('fastify');
jest.mock('puppeteer');

describe('routes/prerender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REDIRECT;
  });

  test('correctly handles request - 200', async () => {
    const send = jest.fn();
    const header = jest.fn(() => ({ send }));
    const status = jest.fn(() => ({ header }));
    await prerender.handler({ headers: {} } as Request, { status, header } as unknown as Reply);
    expect(prerender.schema).toMatchSnapshot();
    expect(header).toHaveBeenCalledTimes(1);
    expect(header).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('<html><head><link rel="stylesheet" href="/style.css" /></head><body>HELLO</body></html>');
  });

  test('correctly handles request - 301', async () => {
    process.env.REDIRECT = 'true';
    const send = jest.fn();
    const header = jest.fn(() => ({ send }));
    const status = jest.fn(() => ({ header }));
    await prerender.handler({ headers: { host: 'frontend:5000' } } as Request, { status, header } as unknown as Reply);
    expect(prerender.schema).toMatchSnapshot();
    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(301);
    expect(header).toHaveBeenCalledTimes(2);
    expect(header).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(header).toHaveBeenCalledWith('Location', 'https://test.com');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('<html><head><link rel="stylesheet" href="/style.css" /></head><body>HELLO</body></html>');
  });
});
