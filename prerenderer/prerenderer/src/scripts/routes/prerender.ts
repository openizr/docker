/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import puppeteer from 'puppeteer';
import configuration from 'scripts/conf/app';
import { FastifyRequest, FastifyReply } from 'fastify';
import createSchema from 'scripts/helpers/createSchema';

let host = 'localhost:5000';
const args = ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'];

const launchPromise = puppeteer.launch({ headless: true, args }).then(async (browser) => {
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
  return page;
});

/**
 * `GET *` endpoint handler.
 */
export default {
  handler: async (request: FastifyRequest, response: FastifyReply): Promise<void> => {
    host = request.headers.host || host;
    const page = await launchPromise;
    await page.goto(`http://${host}${request.url}`);
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
    const status = parseInt(props['data-status'], 10) || 200;
    const content = (await page.content()).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<link\b[^<]*rel="modulepreload"[^<]*>/gi, '');
    if (status === 301 && props['data-redirect']) {
      response.header('Location', props['data-redirect']);
    }
    response.status(status).header('Content-Type', 'text/html').send(content);
  },
  schema: createSchema({
    response: {
      200: {
        type: 'string',
      },
    },
  }),
};
