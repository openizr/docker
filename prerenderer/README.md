# prerenderer

This Docker image provides a pre-rendering system that generates static HTML from dynamic pages written in JavaScript, for SEO and indexing purposes.
You should run this container either along with a front server like Nginx, or within a Docker network as an internal service.

## Environment variables

- *`ENV`*: environment (development|preproduction|production)
- *`BACKEND_PORT`*: listening port for Docker container


## Notifying prerenderer that your page is ready

In order to let prerenderer know that your page has been completely and successfully rendered, you need to insert a special HTML tag with the `prerender` id in the DOM.
For instance:

```html
<meta id="prerender" data-status="200" data-redirect="http://test.com" />
```

Prerender will observe that tag and send back the raw HTML as soon as it is present in the page. The `data-status` allows you to specify the HTTP status code to send back to the robot (200 by default),
and the `data-redirect` lets your define any redirection (HTTP 301) that should be performed by the robot (prerender will insert the `Location` header with that value in its response).