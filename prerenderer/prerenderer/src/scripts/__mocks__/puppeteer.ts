/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Puppeteer mock.
 */

export default {
  launch: jest.fn(() => Promise.resolve({
    newPage: jest.fn(() => Promise.resolve({
      setRequestInterception: jest.fn(),
      on: jest.fn((_event, callback) => {
        callback({ respond: jest.fn(), continue: jest.fn(), resourceType: jest.fn(() => 'image') });
        callback({ respond: jest.fn(), continue: jest.fn(), resourceType: jest.fn(() => 'script') });
      }),
      goto: jest.fn(),
      content: jest.fn(() => Promise.resolve('<html><head><script>console.log("ok");</script><link rel="stylesheet" href="/style.css" /><link rel="modulepreload" src="/test.js" /></head><body>HELLO</body></html>')),
      waitForSelector: jest.fn(),
      evaluate: jest.fn((callback) => Promise.resolve(callback({ attributes: [{ name: 'data-redirect', value: 'https://test.com' }].concat((process.env.REDIRECT === 'true') ? [{ name: 'data-status', value: '301' }] : []) }))),
    })),
  })),
};
