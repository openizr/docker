#!/bin/sh
set -e

# Default node entrypoint. Scripts are always `node` arguments, even with an executable bit.
case "${1-}" in
  -*|*.js|*.mjs|*.cjs|'') set -- node "$@" ;;
  *)
    if [ -z "$(command -v "$1")" ]; then
      # A `node` argument only if it exists on disk: a typo would otherwise surface as a
      # confusing MODULE_NOT_FOUND from `node`.
      [ -e "$1" ] || [ -e "$1.js" ] || [ -e "$1.cjs" ] || [ -e "$1.mjs" ] || {
        echo "docker-entrypoint: $1: command not found" >&2
        exit 127
      }
      set -- node "$@"
    fi ;;
esac

exec "$@"
