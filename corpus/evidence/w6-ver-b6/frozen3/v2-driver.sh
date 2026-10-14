#!/usr/bin/env bash
# TABI lane B6-1 driver — one run of the external-class fixture v2 (loopback only).
# usage: bash v2-driver.sh <run-name> <mode>
#   mode: chain | probe-robots | probe-429 | probe-403 | probe-captcha
set -u
RUN="${1:?usage: v2-driver.sh <run> <mode>}"
MODE="${2:?usage: v2-driver.sh <run> <mode>}"
ROOT=/tmp/w6-tabi-b61
SITE_A="$ROOT/site-a"
SITE_B="$ROOT/site-b"
OUT="$ROOT/$RUN"
PORT_A=19541
PORT_B=19543
CDP_PORT=19542
mkdir -p "$OUT"
exec > >(tee "$OUT/driver.log") 2>&1
echo "== run $RUN mode $MODE start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "== UID $(id -u) host $(hostname) cwd $(pwd)"

echo "== port precheck (must be empty)"
ss -ltn | grep -E ":($PORT_A|$PORT_B|$CDP_PORT)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"

echo "== fresh profile"
rm -rf "$OUT/profile" "$OUT/journey.json" "$OUT/trip.json" "$OUT/http-a.log" "$OUT/http-b.log" "$OUT/closure.txt"

echo "== start server A (site-a, port $PORT_A, hop target -> B)"
python3 "$ROOT/server.py" "$SITE_A" "$PORT_A" "http://127.0.0.1:$PORT_B/chain/landed.html" > "$OUT/http-a.log" 2>&1 &
HTTP_A_PID=$!
echo "http-a.pid=$HTTP_A_PID"
HTTP_B_PID=""
if [ "$MODE" = "chain" ]; then
  echo "== start server B (site-b, port $PORT_B)"
  python3 "$ROOT/server.py" "$SITE_B" "$PORT_B" > "$OUT/http-b.log" 2>&1 &
  HTTP_B_PID=$!
  echo "http-b.pid=$HTTP_B_PID"
fi

for i in $(seq 1 50); do curl -sf -o /dev/null "http://127.0.0.1:$PORT_A/__ready" && break; sleep 0.2; done
curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:$PORT_A/__ready" | sed 's/^/server-a ready code: /'
if [ "$MODE" = "chain" ]; then
  for i in $(seq 1 50); do curl -sf -o /dev/null "http://127.0.0.1:$PORT_B/__ready" && break; sleep 0.2; done
  curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:$PORT_B/__ready" | sed 's/^/server-b ready code: /'
fi

echo "== start chromium (fresh profile)"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$OUT/profile" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > "$OUT/chromium.log" 2>&1 &
CHROMIUM_LAUNCH_PID=$!
echo "chromium.launch.pid=$CHROMIUM_LAUNCH_PID"

for i in $(seq 1 50); do curl -sf "http://127.0.0.1:$CDP_PORT/json/version" > "$OUT/json-version.json" && break; sleep 0.2; done
curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }

echo "== listening lines (evidence)"
ss -ltnp 2>/dev/null | grep -E ":($PORT_A|$PORT_B|$CDP_PORT)\b"
echo "== effective child process line (evidence)"
CHROMIUM_PIDS=$(ps -eo pid,args | grep "[c]hromium" | grep -- "user-data-dir=$OUT/profile" | awk '{print $1}')
echo "chromium pids: $CHROMIUM_PIDS"
ps -eo pid,ppid,args | grep "[c]hromium" | grep -- "user-data-dir=$OUT/profile" | head -3

echo "== run journey ($MODE)"
node "$ROOT/v2-journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$PORT_A" --hop="http://127.0.0.1:$PORT_B/chain/landed.html" --mode="$MODE" --out="$OUT"
JOURNEY_EXIT=$?
echo "journey.exit=$JOURNEY_EXIT"

echo "== http-a.log (whole)"
cat "$OUT/http-a.log"
if [ "$MODE" = "chain" ]; then echo "== http-b.log (whole)"; cat "$OUT/http-b.log"; fi

echo "== chromium egress-ish log lines (informative)"
grep -Eic 'google|gcm|accounts' "$OUT/chromium.log" | sed 's/^/egress-ish line count: /'

echo "== cleanup (kill by PID from the process table; pgrep never matches itself)"
PIDS=$(pgrep -f -- "user-data-dir=$OUT/profile" || true)
echo "pgrep chromium pids: ${PIDS:-none}"
if [ -n "${PIDS:-}" ]; then kill $PIDS 2>/dev/null; sleep 1; fi
SURV=$(pgrep -f -- "user-data-dir=$OUT/profile" || true)
if [ -n "${SURV:-}" ]; then echo "escalating kill -9: $SURV"; kill -9 $SURV 2>/dev/null; sleep 1; fi
kill "$HTTP_A_PID" 2>/dev/null
if [ -n "${HTTP_B_PID:-}" ]; then kill "$HTTP_B_PID" 2>/dev/null; fi
sleep 1

{
  echo "== closure verification"
  if pgrep -f -- "user-data-dir=$OUT/profile" >/dev/null; then echo "FAIL: chromium process still present"; else echo "pass: no chromium process for $OUT/profile"; fi
  if ss -ltn | grep -E ":($PORT_A|$PORT_B|$CDP_PORT)\b"; then echo "FAIL: port still listening"; else echo "pass: ports $PORT_A/$PORT_B/$CDP_PORT not listening"; fi
  curl -s -o /dev/null "http://127.0.0.1:$CDP_PORT/json/version"; echo "curl cdp exit=$?"
  curl -s -o /dev/null "http://127.0.0.1:$PORT_A/index.html"; echo "curl http-a exit=$?"
  if [ "$MODE" = "chain" ]; then curl -s -o /dev/null "http://127.0.0.1:$PORT_B/chain/landed.html"; echo "curl http-b exit=$?"; fi
  echo "== stop-rule verification (server log)"
  if [ -f "$OUT/trip.json" ]; then
    NOTEX=$(node -e "const r=require('$OUT/trip.json');console.log((r.notExecuted||[]).join(','))")
    echo "trip class: $(node -e "console.log(require('$OUT/trip.json').class)")"
    echo "not-executed cells: ${NOTEX:-none}"
    TOTAL=$(wc -l < "$OUT/http-a.log")
    echo "server-a request lines: $TOTAL"
    if [ "$MODE" = "probe-robots" ]; then
      echo "requests to the disallowed intended path: $(grep -c -F '/private/instrument/probe' "$OUT/http-a.log")"
    fi
    if [ "$MODE" = "probe-429" ] || [ "$MODE" = "probe-403" ]; then
      echo "requests to the skipped follow-up /gate/interstitial: $(grep -c -F '/gate/interstitial' "$OUT/http-a.log")"
    fi
    if [ "$MODE" = "probe-captcha" ]; then
      echo "requests to the skipped follow-up /rate/429: $(grep -c -F '/rate/429' "$OUT/http-a.log")"
    fi
  else
    echo "no trip in this run (chain mode)"
    echo "server-a request lines: $(wc -l < "$OUT/http-a.log")"
  fi
} | tee "$OUT/closure.txt"

echo "== run $RUN end $(date -u +%Y-%m-%dT%H:%M:%SZ) journey.exit=$JOURNEY_EXIT"
exit "$JOURNEY_EXIT"