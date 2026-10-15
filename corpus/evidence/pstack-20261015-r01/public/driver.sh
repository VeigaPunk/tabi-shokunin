#!/usr/bin/env bash
# Observation-only CDP capture of one public page. No clicks, no typed input, no form submit.
set -u
OUT="${1:?usage: driver.sh OUT_DIR}"
URL="${2:-https://example.com/}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
CDP_PORT=18741
mkdir -p "$OUT"
PROFILE=""

cleanup() {
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

if ss -ltn | grep -E ":${CDP_PORT}\\b" >/dev/null; then
  echo "FATAL port $CDP_PORT busy" >&2
  exit 10
fi

PROFILE="$(mktemp -d /var/tmp/tabi-pstack-public.XXXXXX)"
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

node "$ROOT/../cdp/capture.mjs" --cdp "$CDP_PORT" --url "$URL" --out "$OUT" --mode public
capture_status=$?
cleanup
PROFILE=""
trap - EXIT

if ss -ltn | grep -E ":${CDP_PORT}\\b" >/dev/null; then
  echo "ports_closed=no" | tee "$OUT/closure.txt"
  echo "FATAL owned port still listening" >&2
  exit 12
fi
echo "ports_closed=yes" | tee "$OUT/closure.txt"
echo "cdp_port=$CDP_PORT" | tee -a "$OUT/closure.txt"
exit "$capture_status"
