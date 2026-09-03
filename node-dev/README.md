# node-dev

This Docker image is a safer, non-root, Node.js environment, with extra development tools.
*Use it only in a development environment, do not deploy it in production.*

It runs as the `node` user (UID 1000). Derived images needing `apk` must switch to `USER root` first.

`npm`, `yarn` and `pnpm` are available. `yarn` and `pnpm` are Corepack shims: they use the version
pinned in the project's `packageManager` field (downloaded on first use), or the built-in one otherwise.


## Useful commands

- `register_ssh < path/to/private_key`: writes the key to `~/.ssh/id_rsa` (also accepts `printf '%s' "$KEY" | register_ssh`)
- `dsync path/to/source path/to/destination`: keep 2 directories or files synchronized in real-time using `rsync`


## Environment variables

None.
