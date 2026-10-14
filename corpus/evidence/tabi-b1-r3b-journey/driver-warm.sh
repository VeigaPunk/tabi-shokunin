#!/usr/bin/env bash
# TABI-B1 warm-cache pass — same recipe as driver.sh but NO profile removal
# (carries run2's HTTP cache), per multi-step-journey.md §4/§5 warm methodology.
set -u
ROOT=/tmp/tabi-b1-r3b-journey
OUT="$ROOT/run3-warm"
HTTP_PORT=19481
CDP_PORT=19482
mkdir -p "$OUT"
exec > >(tee "$OUT/driver-warm.log") 2>&1
echo "== warm pass start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
test -d "$OUT" # profile of run2 (with cache) deliberately reused:
PROFILE="$ROOT/run2/profile"
echo "== reusing profile $PROFILE (no rm — cache carried), cache bytes: $(du -sh "$PROFILE/Default/Cache" 2>/dev/null | cut -f1 || echo n/a)"
echo "== port precheck"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"
python3 -m http.server "$HTTP_PORT" --bind 127.0.0.1 --directory "$ROOT/site" > "$OUT/http.log" 2>&1 &
HTTP_PID=$!
echo "http.pid=$HTTP_PID"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PROFILE" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > "$OUT/chromium.log" 2>&1 &
echo "chromium.launch.pid=$!"
for i in $(seq 1 50); do curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null && break; sleep 0.2; done
curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }
echo "== run journey (warm)"
node "$ROOT/journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$HTTP_PORT" --out="$OUT"
echo "== http.log (whole)"
cat "$OUT/http.log"
echo "== cleanup"
CHROMIUM_PIDS=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$PROFILE" | awk '{print $1}')
kill $CHROMIUM_PIDS 2>/dev/null
kill "$HTTP_PID" 2>/dev/null
sleep 1
SURV=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$PROFILE" | awk '{print $1}')
[ -n "$SURV" ] && { echo "escalating kill -9: $SURV"; kill -9 $SURV; sleep 1; } || echo "no chromium survivors after TERM"
ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$PROFILE" && echo "FAIL: chromium still present" || echo "pass: no chromium process for $PROFILE"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && echo "FAIL: port still listening" || echo "pass: ports $HTTP_PORT/$CDP_PORT not listening"
curl -s -o /dev/null "http://127.0.0.1:$CDP_PORT/json/version"; echo "curl cdp exit=$?"
curl -s -o /dev/null "http://127.0.0.1:$HTTP_PORT/index.html"; echo "curl http exit=$?"
echo "== warm pass end $(date -u +%Y-%m-%dT%H:%M:%SZ)"
