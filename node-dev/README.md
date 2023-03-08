# node-dev

This Docker image is a safer, nodeJS environment that allows you to install NPM dependencies
from private git repositories, using SSH keys.
*Use it only in a development environment, do not deploy it in production.*

## Useful commands

- `dsync path/to/source/directory path/to/dest/directory`: keep 2 directories synchronized in real-time using `rsync`
- `register_ssh`: registers SSH keys from environment variables (automatically performed on start-up) - works with github.com and gitlab.com


## Environment variables

- *`SSH_PRIVATE_KEY`*: private SSH key used to authenticate against private git repositories (optional)
- *`SSH_PUBLIC_KEY`*: public SSH key used to authenticate against private git repositories (optional)
