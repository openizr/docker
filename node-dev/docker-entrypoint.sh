#!/bin/sh
set -e

# Registering SSH keys if needed...
if [ ! -z "${SSH_PRIVATE_KEY:-}" ] && [ ! -z "${SSH_PUBLIC_KEY:-}" ]; then
  echo -e $SSH_PRIVATE_KEY > $HOME/.ssh/id_rsa
  chmod 600 $HOME/.ssh/id_rsa
  echo -e $SSH_PUBLIC_KEY > $HOME/.ssh/id_rsa.pub
  chmod 644 $HOME/.ssh/id_rsa.pub
  ssh-keyscan -H 'github.com' > $HOME/.ssh/known_hosts 2> /dev/null
  chmod 644 $HOME/.ssh/known_hosts
  chmod 700 $HOME/.ssh
  echo "Successfully registered SSH keys"
fi

# Default node entrypoint.
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

exec "$@"