/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import puppeteer from 'puppeteer';
import { FastifyRequest, FastifyReply } from 'fastify';

const args = ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'];
const launchPromise = puppeteer.launch({ headless: true, args });

/** Periodically checks for the given condition to be fulfilled. */
const waitUntil = (condition: () => boolean, callback: () => void): void => {
  if (condition() === true) {
    callback();
  } else {
    setTimeout(() => {
      waitUntil(condition, callback);
    }, 50);
  }
};

/** Adds the given request to the queue, waiting for it to fulfill. */
const queueRequest = (request: puppeteer.HTTPRequest): Promise<void> => new Promise((resolve) => {
  waitUntil(() => (request.response() !== null), resolve);
});

/**
 * `GET *` endpoint handler.
 */
export default {
  handler: async (request: FastifyRequest, response: FastifyReply): Promise<void> => {
    const queuedRequests: Promise<void>[] = [];
    const browser = await launchPromise;
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (puppeteerRequest) => {
      // Optimizing loading speed by skipping unecessary assets...
      if (/image|font|stylesheet/i.test(puppeteerRequest.resourceType())) {
        puppeteerRequest.abort();
      } else {
        puppeteerRequest.continue();
        queuedRequests.push(queueRequest(puppeteerRequest));
      }
    });
    await page.goto(`http://${(request.headers.host || 'localhost')}${request.url}`);
    await Promise.all(queuedRequests);
    const content = (await page.content()).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    response.status(200).header('Content-Type', 'text/html').send(content);
  },
  schema: {
    response: {
      200: {
        type: 'string',
      },
    },
  },
};
