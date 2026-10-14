#!/usr/bin/env bash
# TABI-R4-1 warm driver — same journey, but the browser profile carries run2's cache
# (revalidation pass: the wire should answer 304 while the client composes 200s).
# usage: bash driver-warm.sh
set -u
ROOT=/tmp/tabi-r4-1-network
OUT="$ROOT/run3-warm"
HTTP_PORT=19441
CDP_PORT=19442
mkdir -p "$OUT"

exec > >(tee "$OUT/driver.log") 2>&1
echo "== driver warm run start $(date -u +%Y-%m-%dT%H:%M:%SZ) local $(date -Is)"

echo "== carry run2 profile cache into $OUT/profile (warm cache, not cold)"
rm -rf "$OUT/profile"
cp -a "$ROOT/run2/profile" "$OUT/profile"

echo "== port precheck (must be empty)"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"

echo "== start http.server (loopback only)"
python3 -m http.server "$HTTP_PORT" --bind 127.0.0.1 --directory "$ROOT/site" > "$OUT/http.log" 2>&1 &
HTTP_PID=$!
echo "http.pid=$HTTP_PID"

echo "== start chromium"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$OUT/profile" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > "$OUT/chromium.log" 2>&1 &
echo "chromium.launch.pid=$!"

for i in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$CDP_PORT/json/version" > "$OUT/json-version.json" && break
  sleep 0.2
done
curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }

echo "== listening lines (evidence)"
ss -ltnp | grep -E ":($HTTP_PORT|$CDP_PORT)\b"

CHROMIUM_PIDS=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')
echo "chromium pids: $CHROMIUM_PIDS"

echo "== run journey (warm)"
node "$ROOT/journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$HTTP_PORT" --out="$OUT" --site="$ROOT/site"

echo "== http.log (whole)"
cat "$OUT/http.log"

echo "== cleanup"
kill $CHROMIUM_PIDS 2>/dev/null
kill "$HTTP_PID" 2>/dev/null
sleep 1
SURV=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')
if [ -n "$SURV" ]; then
  echo "escalating kill -9: $SURV"
  kill -9 $SURV
  sleep 1
else
  echo "no chromium survivors after TERM"
fi

echo "== closure verification"
if ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile"; then
  echo "FAIL: chromium process still present"
else
  echo "pass: no chromium process for $OUT/profile"
fi
if ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b"; then
  echo "FAIL: port still listening"
else
  echo "pass: ports $HTTP_PORT/$CDP_PORT not listening"
fi
curl -s -o /dev/null "http://127.0.0.1:$CDP_PORT/json/version"; echo "curl cdp exit=$?"
curl -s -o /dev/null "http://127.0.0.1:$HTTP_PORT/index.html"; echo "curl http exit=$?"
echo "== driver warm run end $(date -u +%Y-%m-%dT%H:%M:%SZ)"