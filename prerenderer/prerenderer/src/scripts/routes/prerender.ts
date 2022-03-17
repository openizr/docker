/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import puppeteer, { Page } from 'puppeteer';
import configuration from 'scripts/conf/app';
import { FastifyRequest, FastifyReply } from 'fastify';
import createSchema from 'scripts/helpers/createSchema';

type Callback = (result: Result) => void;
type Item = { url: string; callback: Callback; };
type Result = { status: number; content: string; redirect?: string; };

const queue: Item[] = [];
const pages: Page[] = [];
let host = 'localhost:5000';
const args = ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'];
const pageStatuses = (new Array(10)).fill(true);
const launchPromise = puppeteer.launch({ headless: true, args }).then(async (browser) => {
  await Promise.all(pageStatuses.map(async () => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (puppeteerRequest) => {
      // Optimizing loading speed by skipping unecessary assets...
      if (/image|font|stylesheet/i.test(puppeteerRequest.resourceType())) {
        puppeteerRequest.respond({ body: '' });
      } else {
        puppeteerRequest.continue();
      }
    });
    pages.push(page);
  }));
});

/**
 * Processes next item in the queue, if any.
 *
 * @returns {Promise<void>}
 */
async function processQueue(): Promise<void> {
  const firstAvailablePage = pageStatuses.indexOf(true);
  // Item processing can only happen if a puppeteer page is available for prerendering.
  if (queue.length > 0 && firstAvailablePage >= 0) {
    pageStatuses[firstAvailablePage] = false;
    const nextItem = <Item>queue.shift();
    await launchPromise;
    const page = pages[firstAvailablePage];
    await page.goto(nextItem.url);
    const frame = await page.waitForSelector('#prerender', { timeout: configuration.connectionTimeout - 100 });
    const props: Record<string, string> = await page.evaluate(
      (element) => {
        const attributes = Array.from(element.attributes, ({ name, value }) => [name, value]);
        return attributes.reduce((finalAttributes, attribute) => Object.assign(finalAttributes, {
          [attribute[0]]: attribute[1],
        }), {});
      },
      frame,
    );
    const redirect = props['data-redirect'];
    const status = parseInt(props['data-status'], 10) || 200;
    const content = (await page.content()).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<link\b[^<]*rel="modulepreload"[^<]*>/gi, '');
    nextItem.callback({
      status,
      content,
      redirect,
    });
    pageStatuses[firstAvailablePage] = true;
    processQueue();
  }
}

/**
 * Pushes `url` into the prerendering queue.
 *
 * @param {string} url URL to prerender.
 *
 * @param {Callback} callback Callback to call as soon as prerendering is done.
 *
 * @returns {void}
 */
function pushToQueue(url: string, callback: Callback): void {
  queue.push({ url, callback });
  processQueue();
}

/**
 * `GET *` endpoint handler.
 */
export default {
  handler: async (request: FastifyRequest, response: FastifyReply): Promise<void> => {
    host = request.headers.host || host;
    const result = await new Promise<Result>((resolve) => {
      pushToQueue(`http://${host}${request.url}`, resolve);
    });
    if (result.status === 301 && result.redirect) {
      response.header('Location', result.redirect);
    }
    response.status(result.status).header('Content-Type', 'text/html').send(result.content);
  },
  schema: createSchema({
    response: {
      200: {
        type: 'string',
      },
    },
  }),
};
