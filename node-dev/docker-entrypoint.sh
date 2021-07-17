#!/bin/sh
set -e

# Registering SSH keys if needed...
register_ssh

# Default node entrypoint.
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

exec "$@"