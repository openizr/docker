/**
 * Copyright (c) ...
 * All rights reserved.
 */

import { deepMerge } from 'basx';
import schema from 'scripts/lib/baseSchema';
import puppeteer, { Request } from 'puppeteer';
import { FastifyRequest, FastifyReply } from 'fastify';

const args = ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'];

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
const queueRequest = (request: Request): Promise<void> => new Promise((resolve) => {
  waitUntil(() => (request.response() !== null), resolve);
});

/**
 * `GET *` endpoint handler.
 */
export default {
  handler: async (_request: FastifyRequest, response: FastifyReply): Promise<void> => {
    const queuedRequests: Promise<void>[] = [];
    const browser = await puppeteer.launch({ headless: true, args });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request: puppeteer.Request) => {
      // Optimizing loading speed by skipping unecessary assets...
      if (/image|font|stylesheet/i.test(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
        queuedRequests.push(queueRequest(request));
      }
    });
    await page.goto(`http://${(_request.headers.host || 'localhost')}${_request.url}`);
    await Promise.all(queuedRequests);
    const content = (await page.content()).replace(/(<script[^>]*>[^<]*<\/script>)/ig, '');
    await browser.close();
    response.status(200).header('Content-Type', 'text/html').send(content);
  },
  schema: deepMerge(schema,
    {
      body: undefined,
      response: {
        200: {
          type: 'string',
        },
      },
    }),
};
