#!/bin/sh

#
# Copyright (c) Openizr. All Rights Reserved.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
#

set -eu

if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
  exec 3>&1
else
  exec 3>/dev/null
fi

log()   { echo >&3 "$0: $*"; }
warn()  { echo >&2 "$0: WARNING: $*"; }
fatal() { echo >&2 "$0: FATAL: $*"; exit 1; }

# Owned by `nginx`, mode 700, not world-writable /tmp: this is what nginx trusts on
# reload. `nginx.conf` includes these paths literally, hence not configurable.
OUTPUT_DIR=/var/lib/nginx/generated
SNIPPETS_DIR="$OUTPUT_DIR/snippets"
TEMPLATE_SUFFIX=.template
TEMPLATE_ROOT=/etc/nginx/templates

if [ -z "${NGINX_ENTRYPOINT_STATIC_SERVER:-}" ]; then
  MODE=dynamic
  log "serving dynamic pages (set NGINX_ENTRYPOINT_STATIC_SERVER=1 for static)"
else
  MODE=static
  log "serving static pages"
fi


####################################################################################################
# ENVIRONMENT VARIABLE VALIDATION.
####################################################################################################
NL='
'

# For values inserted in a double-quoted nginx string, where `$` starts a variable.
check_string() {
  case "$2" in
    *"$NL"*) fatal "$1 must not contain a newline." ;;
    *'"'*)  fatal "$1 must not contain a double quote: $2" ;;
    *'\'*)  fatal "$1 must not contain a backslash: $2" ;;
    *'$'*)  fatal "$1 must not contain a dollar sign: $2" ;;
  esac
  return 0
}

check_regex() {
  case "$2" in
    *"$NL"*) fatal "$1 must not contain a newline." ;;
    *'"'*) fatal "$1 must not contain a double quote: $2" ;;
  esac
  return 0
}

check_int() {
  case "$2" in
    ''|*[!0-9]*) fatal "$1 must be a positive integer, got: $2" ;;
  esac
  return 0
}

check_port() {
  check_int "$1" "$2"
  if [ "$2" -lt 1 ] || [ "$2" -gt 65535 ]; then
    fatal "$1 must be between 1 and 65535, got: $2"
  fi
  return 0
}

check_size() {
  _digits="${2%[kKmMgG]}"
  case "$_digits" in
    ''|*[!0-9]*) fatal "$1 must be a size such as 16m, got: $2" ;;
  esac
  return 0
}

check_token_list() {
  _tokens=$(printf '%s' "$2" | tr -d ' ')
  case "$_tokens" in
    *[!A-Za-z0-9,._*-]*) fatal "$1 may only contain comma-separated header or method names, got: $2" ;;
  esac
  return 0
}

check_hostname() {
  case "$2" in
    ''|*[!A-Za-z0-9.-]*) fatal "$1 must be a host name, got: $2" ;;
  esac
  return 0
}

check_duration() {
  _digits="${2%[smhdwMy]}"
  case "$_digits" in
    ''|*[!0-9]*) fatal "$1 must be epoch, off, max or a duration such as 1y, got: $2" ;;
  esac
  return 0
}

check_port      FRONTEND_PORT          "${FRONTEND_PORT:-}"
check_hostname  FRONTEND_HOST          "${FRONTEND_HOST:-}"
check_size      MAX_BODY_SIZE          "${MAX_BODY_SIZE:-}"
check_int       CORS_MAX_AGE           "${CORS_MAX_AGE:-}"
check_token_list CORS_ALLOWED_METHODS  "${CORS_ALLOWED_METHODS:-}"
check_token_list CORS_ALLOWED_HEADERS  "${CORS_ALLOWED_HEADERS:-}"
check_token_list CORS_EXPOSED_HEADERS  "${CORS_EXPOSED_HEADERS:-}"
check_string    HSTS                   "${HSTS:-}"
check_string    CSP                    "${CSP:-}"
check_string    PERMISSIONS_POLICY     "${PERMISSIONS_POLICY:-}"
check_regex     BOT_USER_AGENTS        "${BOT_USER_AGENTS:-}"
check_regex     CORS_ALLOWED_ORIGINS   "${CORS_ALLOWED_ORIGINS:-}"

case "${STATIC_MAX_AGE:-}" in
  epoch|off|max) ;;
  *) check_duration STATIC_MAX_AGE "${STATIC_MAX_AGE:-}" ;;
esac

# An empty regexp matches everything: for BOT_USER_AGENTS that pre-renders all traffic,
# for CORS_ALLOWED_ORIGINS it allows every origin with credentials.
NEVER_MATCHES='(?!)'
[ -n "${BOT_USER_AGENTS:-}" ]      || BOT_USER_AGENTS="$NEVER_MATCHES"
[ -n "${CORS_ALLOWED_ORIGINS:-}" ] || CORS_ALLOWED_ORIGINS="$NEVER_MATCHES"
export BOT_USER_AGENTS CORS_ALLOWED_ORIGINS

# Splits a URI into scheme and authority, to give `host:port` to `upstream`.
split_uri() {
  _name="$1"
  _uri="$2"
  case "$_uri" in
    *://*) ;;
    *) _uri="http://$_uri" ;;
  esac
  _scheme="${_uri%%://*}"
  _authority="${_uri#*://}"
  _authority="${_authority%%/*}"
  case "$_scheme" in
    http) ;;
    https) fatal "${_name}_URI must use http: this image is the TLS-terminating front end and speaks plain HTTP to the services behind it, got: $2" ;;
    *) fatal "${_name}_URI must use http, got: $2" ;;
  esac
  [ -n "$_authority" ] || fatal "${_name}_URI has no host: $2"
  case "$_authority" in
    *[!]A-Za-z0-9.:_@[-]*) fatal "${_name}_URI has an invalid host: $2" ;;
  esac
  eval "${_name}_AUTHORITY=\$_authority"
}

split_uri BACKEND     "${BACKEND_URI:-}"
split_uri PRERENDERER "${PRERENDERER_URI:-}"
export BACKEND_AUTHORITY PRERENDERER_AUTHORITY


####################################################################################################
# tuning.conf GENERATION.
####################################################################################################
rm -rf "$OUTPUT_DIR"/* 2>/dev/null || true
mkdir -p "$SNIPPETS_DIR" || fatal "cannot create $SNIPPETS_DIR"
[ -w "$OUTPUT_DIR" ] || fatal "$OUTPUT_DIR is not writable"

# `auto` counts the host's cores, not the container's quota: a 1-CPU limit on a 64-core
# node would start 64 workers, each with its own caches and keepalive pool.
detect_worker_processes() {
  _quota=''
  _period=''
  if [ -r /sys/fs/cgroup/cpu.max ]; then
    read -r _quota _period < /sys/fs/cgroup/cpu.max || true
  elif [ -r /sys/fs/cgroup/cpu/cpu.cfs_quota_us ] && [ -r /sys/fs/cgroup/cpu/cpu.cfs_period_us ]; then
    read -r _quota < /sys/fs/cgroup/cpu/cpu.cfs_quota_us || true
    read -r _period < /sys/fs/cgroup/cpu/cpu.cfs_period_us || true
  fi
  # `max` (v2), `-1` (v1) and anything unparseable all mean no quota.
  case "$_quota" in
    ''|*[!0-9]*) echo auto; return 0 ;;
  esac
  case "$_period" in
    ''|0|*[!0-9]*) echo auto; return 0 ;;
  esac
  # Rounded up, so a 0.5-CPU limit still gets one worker.
  _workers=$(( (_quota + _period - 1) / _period ))
  # A cpuset can be tighter than the quota; `nproc` honours it.
  _cpus=$(nproc 2>/dev/null || echo 0)
  case "$_cpus" in
    ''|*[!0-9]*) _cpus=0 ;;
  esac
  if [ "$_cpus" -gt 0 ] && [ "$_workers" -gt "$_cpus" ]; then
    _workers=$_cpus
  fi
  echo "$_workers"
}

WORKER_PROCESSES=$(detect_worker_processes)

# Two connections per proxied request, so ~2000 concurrent per worker.
WORKER_CONNECTIONS=4096

{
  echo "worker_processes $WORKER_PROCESSES;"
  echo "events {"
  echo "  worker_connections $WORKER_CONNECTIONS;"
  echo "}"
} > "$OUTPUT_DIR/tuning.conf"

log "worker_processes $WORKER_PROCESSES, worker_connections $WORKER_CONNECTIONS"


####################################################################################################
# forwarded.conf GENERATION.
####################################################################################################
# With a trusted proxy, its X-Forwarded-* describe the client and $remote_addr is
# resolved from the chain. Without one, the client's own X-Forwarded-For must be
# REPLACED, not appended, or it can forge addresses.
REAL_IP_CONF="$SNIPPETS_DIR/real-ip.conf"
FORWARDED_CONF="$SNIPPETS_DIR/forwarded.conf"

if [ -n "${TRUSTED_PROXIES:-}" ]; then
  # No globbing: a `*` in the value must reach the validation below, not expand.
  set -f
  IFS=', '
  CIDRS=''
  for cidr in ${TRUSTED_PROXIES}; do
    [ -n "$cidr" ] || continue
    case "$cidr" in
      *[!0-9a-fA-F.:/]*) fatal "TRUSTED_PROXIES entries must be addresses or CIDRs, got: $cidr" ;;
    esac
    CIDRS="$CIDRS $cidr"
  done
  unset IFS
  set +f
  [ -n "$CIDRS" ] || fatal "TRUSTED_PROXIES contains no address: $TRUSTED_PROXIES"

  {
    echo "# Generated from TRUSTED_PROXIES=$TRUSTED_PROXIES"
    for cidr in $CIDRS; do echo "set_real_ip_from $cidr;"; done
    echo "real_ip_header    X-Forwarded-For;"
    echo "real_ip_recursive on;"
  } > "$REAL_IP_CONF"

  # This container only speaks plain HTTP, so `$scheme` is always `http` and
  # `$server_port` is always FRONTEND_PORT. But the client may have spoken HTTPS to the
  # balancer in front. If the back end is told `http`, `secure` cookies, absolute URLs and
  # OAuth redirects break. So when the peer is a trusted proxy, its X-Forwarded-Proto and
  # X-Forwarded-Port are passed on. When it is not, our own values are sent.
  #
  # X-Forwarded-For: the received chain, plus the peer that connected to us
  # (`$realip_remote_addr`). `$proxy_add_x_forwarded_for` is not used because it appends
  # `$remote_addr`, which realip has already changed to the client address: the client
  # would appear twice. An untrusted peer's chain is dropped, as when TRUSTED_PROXIES is
  # unset.
  {
    echo "# Generated from TRUSTED_PROXIES=$TRUSTED_PROXIES"
    echo 'geo $realip_remote_addr $from_trusted_proxy {'
    echo '  default 0;'
    for cidr in $CIDRS; do echo "  $cidr 1;"; done
    echo '}'
    cat <<'FORWARDED'

map "$from_trusted_proxy:$http_x_forwarded_proto" $forwarded_proto {
  default            $scheme;
  "~*^1:\s*https\b"  https;
  "~*^1:\s*http\b"   http;
}

map "$from_trusted_proxy:$http_x_forwarded_port" $forwarded_port {
  default                     $server_port;
  "~^1:(?<port>[0-9]{1,5})$"  $port;
}

map "$from_trusted_proxy:$http_x_forwarded_for" $forwarded_for {
  default              $realip_remote_addr;
  "~^1:(?<chain>.+)$"  "$chain, $realip_remote_addr";
}
FORWARDED
  } > "$FORWARDED_CONF"

  X_FORWARDED_FOR_VALUE='$forwarded_for'
  X_FORWARDED_PROTO_VALUE='$forwarded_proto'
  X_FORWARDED_PORT_VALUE='$forwarded_port'
  log "trusting X-Forwarded-For, -Proto and -Port from$CIDRS"
else
  echo "# TRUSTED_PROXIES is unset, so no proxy is trusted to set X-Forwarded-For." > "$REAL_IP_CONF"
  echo "# TRUSTED_PROXIES is unset, so no proxy is trusted to describe the client connection." > "$FORWARDED_CONF"
  X_FORWARDED_FOR_VALUE='$remote_addr'
  X_FORWARDED_PROTO_VALUE='$scheme'
  X_FORWARDED_PORT_VALUE='$server_port'
  log "no trusted proxies: X-Forwarded-For sent upstream will be the peer address"
  warn "TRUSTED_PROXIES is unset: if a proxy sits in front, access logs will record the proxy rather than the client."
fi
export X_FORWARDED_FOR_VALUE X_FORWARDED_PROTO_VALUE X_FORWARDED_PORT_VALUE


####################################################################################################
# 80.conf GENERATION.
####################################################################################################
# Replaces `envsubst`, so gettext and libintl stay out of the image.
is_variable_name() {
  case "$1" in
    ''|*[!A-Za-z0-9_]*|[0-9]*) return 1 ;;
  esac
  return 0
}

substitute() {
  while IFS= read -r _line || [ -n "$_line" ]; do
    _rendered=''
    while :; do
      case "$_line" in
        *'${'*)
          _head="${_line%%'${'*}"
          _tail="${_line#*'${'}"
          case "$_tail" in
            *'}'*) ;;
            *)
              # Unterminated `${`.
              _rendered="$_rendered$_head\${"
              _line="$_tail"
              continue
              ;;
          esac
          _name="${_tail%%'}'*}"
          _rest="${_tail#*'}'}"
          if is_variable_name "$_name" && eval "[ \"\${$_name+set}\" = set ]"; then
            eval "_value=\$$_name"
            _rendered="$_rendered$_head$_value"
          else
            _rendered="$_rendered$_head\${$_name}"
          fi
          _line="$_rest"
          ;;
        *)
          _rendered="$_rendered$_line"
          break
          ;;
      esac
    done
    printf '%s\n' "$_rendered"
  done
}

render_templates() {
  _dir="$1"
  [ -d "$_dir" ] || return 0

  find "$_dir" -follow -type f -name "*$TEMPLATE_SUFFIX" -print | sort | while read -r template; do
    _relative="${template#"$_dir/"}"
    _output="$OUTPUT_DIR/${_relative%"$TEMPLATE_SUFFIX"}"
    mkdir -p "$(dirname "$_output")"
    log "rendering $template -> $_output"
    substitute < "$template" > "$_output" || fatal "could not render $template"
  done
}

render_templates "$TEMPLATE_ROOT/common"
render_templates "$TEMPLATE_ROOT/$MODE"

[ -f "$OUTPUT_DIR/80.conf" ] || fatal "no server configuration was rendered into $OUTPUT_DIR"


####################################################################################################
# PRECOMPRESSION.
####################################################################################################
if [ -n "${PRECOMPRESSED_ASSETS_DIRECTORY:-}" ]; then
  log "pre-compressing assets at start-up; prefer doing this at build time"
  /usr/local/bin/precompress-assets "${PRECOMPRESSED_ASSETS_DIRECTORY}"
fi

exec "$@"
