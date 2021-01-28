# prerenderer

This Docker image provides a pre-rendering system that generates static HTML from dynamic pages written in JavaScript, for SEO and indexing purposes.
You should run this container either along with a front server like Nginx, or within a Docker network as an internal service.

## Environment variables

- *`ENV`*: environment (development|preproduction|production)
- *`BACKEND_PORT`*: listening port for Docker container
