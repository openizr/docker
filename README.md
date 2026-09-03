# Openizr Docker images

Hardened, non-root Docker images for building and running web applications, published under the `openizr/*` namespace on Docker Hub.
Each image ships in a production flavor and a `-dev` flavor with extra tooling and development-friendly defaults.

All images are built from Docker Hardened Image bases (`dhi.io/*`), pinned by digest, and updated in lockstep.
Images are independent: each directory holds its own Dockerfile and a complete README.


## Table of contents

| Image | Path | Purpose |
|---|---|---|
| `openizr/node` | [`node/`](./node) | Minimal non-root Node.js runtime for production. |
| `openizr/node:*-dev` | [`node-dev/`](./node-dev) | Node.js with `npm`, `yarn`, `pnpm`, SSH helpers and `dsync` for live file sync. |
| `openizr/nginx` | [`nginx/`](./nginx) | Non-root nginx fronting SPAs, static sites and APIs with secure defaults. |
| `openizr/nginx:*-dev` | [`nginx-dev/`](./nginx-dev) | Same nginx, tuned for bind mounts and HMR (no caching, source maps served). |
| `openizr/prerenderer` | [`prerenderer/`](./prerenderer) | Headless pre-renderer producing static HTML from JavaScript pages for crawlers. |


## Usage

Pull a tag from Docker Hub and read the image README for its environment variables and entrypoint behavior:

```sh
docker pull openizr/nginx:5.0.0
docker pull openizr/node:9.0.0-dev
```


## Changelog

See [CHANGELOG.md](./CHANGELOG.md).


## Sponsor

Love this project and want to support it?


[❤️ Sponsor Perseid](https://github.com/sponsors/openizr), or 🌟 star the project on GitHub


## Authors

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150" src="https://avatars.githubusercontent.com/u/29428247?v=4&s=150">
        </br>
        <a href="https://github.com/matthieujabbour">Matthieu Jabbour</a>
      </td>
    </tr>
  <tbody>
</table>


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) Openizr. All Rights Reserved.