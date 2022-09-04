#!/bin/sh
# vim:sw=4:ts=4:et

set -e

if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
    exec 3>&1
else
    exec 3>/dev/null
fi

if [ -z "${NGINX_ENTRYPOINT_STATIC_SERVER:-}" ]; then
  echo >&3 "$0: Nginx configured for dynamic pages rendering"
  rm -f /etc/nginx/templates/80.static.conf.template
else
  echo >&3 "$0: Nginx configured for static pages rendering"
  if [ -f /etc/nginx/templates/80.static.conf.template ]; then
    mv /etc/nginx/templates/80.static.conf.template /etc/nginx/templates/80.conf.template
  fi
fi

# Pre-compressing static assets (see https://expeditedsecurity.com/blog/nginx-brotli/)...
old_ifs=$ifs
ifs=$'\n'
for file in $(find /var/www/html/public -type f -iname '*.css' -o -iname '*.js' -o -iname '*.svg' -o -iname '*.json' -o -iname '*.txt' -o -iname '*.html' -o -iname '*.xml' -o -iname '*.ttf' -o -iname '*.otf'); do
    echo -n "Compressing ${file}..."
    gzip --force -9 -k ${file};
    brotli ${file} --force -o ${file}.br;
    echo "done."
done
ifs=$old_ifs

if [ "$1" = "nginx" -o "$1" = "nginx-debug" ]; then
    if /usr/bin/find "/docker-entrypoint.d/" -mindepth 1 -maxdepth 1 -type f -print -quit 2>/dev/null | read v; then
        echo >&3 "$0: /docker-entrypoint.d/ is not empty, will attempt to perform configuration"

        echo >&3 "$0: Looking for shell scripts in /docker-entrypoint.d/"
        find "/docker-entrypoint.d/" -follow -type f -print | sort -n | while read -r f; do
            case "$f" in
                *.sh)
                    if [ -x "$f" ]; then
                        echo >&3 "$0: Launching $f";
                        "$f"
                    else
                        # warn on shell scripts without exec bit
                        echo >&3 "$0: Ignoring $f, not executable";
                    fi
                    ;;
                *) echo >&3 "$0: Ignoring $f";;
            esac
        done

        echo >&3 "$0: Configuration complete; ready for start up"
    else
        echo >&3 "$0: No files found in /docker-entrypoint.d/, skipping configuration"
    fi
fi

exec "$@"
