#!/usr/bin/env bash
# Owned loopback CDP capture. Writes into OUT and removes the browser and server it started.
set -u
OUT="${1:?usage: driver.sh OUT_DIR [--check]}"
CHECK="${2:-}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTTP_PORT=18751
CDP_PORT=18752
mkdir -p "$OUT"
PROFILE=""
HTTP_PID=""

cleanup() {
  if [ -n "$HTTP_PID" ]; then kill "$HTTP_PID" 2>/dev/null || true; fi
  if [ -n "$PROFILE" ]; then
    mapfile -t pids < <(ps -eo pid=,args= | while read -r pid args; do
      case "$args" in
        *"--user-data-dir=${PROFILE}"*) printf '%s\n' "$pid" ;;
      esac
    done)
    if [ "${#pids[@]}" -gt 0 ]; then
      kill "${pids[@]}" 2>/dev/null || true
      sleep 0.4
      kill -9 "${pids[@]}" 2>/dev/null || true
    fi
    rm -rf "$PROFILE"
  fi
}
trap cleanup EXIT

if ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\\b" >/dev/null; then
  echo "FATAL ports $HTTP_PORT/$CDP_PORT busy" >&2
  exit 10
fi

python3 -m http.server "$HTTP_PORT" --bind 127.0.0.1 --directory "$ROOT/site" >"$OUT/http.log" 2>&1 &
HTTP_PID=$!
http_ready=0
for _ in $(seq 1 50); do
  if curl -sf "http://127.0.0.1:$HTTP_PORT/page.html" >/dev/null; then
    http_ready=1
    break
  fi
  sleep 0.1
done
if [ "$http_ready" -ne 1 ]; then
  echo "FATAL http server not up" >&2
  exit 13
fi
PROFILE="$(mktemp -d /var/tmp/tabi-pstack-adjacent.XXXXXX)"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking about:blank >"$OUT/chromium.log" 2>&1 &

ready=0
for _ in $(seq 1 50); do
  if curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >"$OUT/cdp-live.json"; then
    ready=1
    break
  fi
  sleep 0.2
done
if [ "$ready" -ne 1 ]; then
  echo "FATAL cdp endpoint not up" >&2
  exit 11
fi
echo "CDP_LIVE port=$CDP_PORT" | tee "$OUT/cdp-endpoint.txt"

node "$ROOT/../../pstack-20261015-r01/cdp/capture.mjs" --cdp "$CDP_PORT" --url "http://127.0.0.1:$HTTP_PORT/page.html" --out "$OUT" --mode loopback
capture_status=$?

cleanup
HTTP_PID=""
PROFILE=""
trap - EXIT

survivors=0
if ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\\b" >/dev/null; then
  survivors=1
fi
{
  echo "ports_closed=$([ "$survivors" -eq 0 ] && echo yes || echo no)"
  echo "http_port=$HTTP_PORT"
  echo "cdp_port=$CDP_PORT"
} | tee "$OUT/closure.txt"
if [ "$survivors" -ne 0 ]; then
  echo "FATAL owned ports still listening" >&2
  exit 12
fi
if [ "$capture_status" -ne 0 ]; then exit "$capture_status"; fi
if [ "$CHECK" = "--check" ]; then
  node "$ROOT/verify-pin.mjs" "$ROOT/pins.json" "$OUT/dom.txt" "$OUT/screenshot.png"
fi
