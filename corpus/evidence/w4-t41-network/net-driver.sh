#!/usr/bin/env bash
# TABI lane T4-1 driver — one full network-rung run (server + browser + journey + cleanup + closure proof).
# usage: bash net-driver.sh <run-dir-name> [cold|warm]
#   cold: fresh profile (rm -rf)
#   warm: copy run1/profile as this run's profile (cache + Last-Modified revalidation path)
set -u
RUN="${1:?usage: net-driver.sh <run-dir-name> [cold|warm|warm-nc]}"
MODE="${2:-cold}"
ROOT=/tmp/w4-t41-network
OUT="$ROOT/$RUN"
HTTP_PORT=19431
CDP_PORT=19432
mkdir -p "$OUT"

exec > >(tee "$OUT/driver.log") 2>&1
echo "== driver run $RUN ($MODE) start $(date -u +%Y-%m-%dT%H:%M:%SZ) local $(date -Is)"

if [ "$MODE" = "warm" ] || [ "$MODE" = "warm-nc" ]; then
  echo "== warm profile: copying $ROOT/run1/profile -> $OUT/profile"
  rm -rf "$OUT/profile"
  cp -a "$ROOT/run1/profile" "$OUT/profile"
else
  echo "== fresh profile: removing $OUT/profile ($MODE cache per run)"
  rm -rf "$OUT/profile"
fi

echo "== port precheck (must be empty)"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"

SERVER_EXTRA=""
{ [ "$MODE" = "warm-nc" ] || [ "$MODE" = "reval" ]; } && SERVER_EXTRA="no-cache"
echo "== start fixture server (loopback only, slow=400ms, extra='$SERVER_EXTRA')"
python3 "$ROOT/server.py" "$ROOT/site" "$HTTP_PORT" 400 $SERVER_EXTRA > "$OUT/http.log" 2>&1 &
HTTP_PID=$!
echo "http.pid=$HTTP_PID"

echo "== start chromium"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$OUT/profile" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > "$OUT/chromium.log" 2>&1 &
CHROMIUM_LAUNCH_PID=$!
echo "chromium.launch.pid=$CHROMIUM_LAUNCH_PID"

for i in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$CDP_PORT/json/version" > "$OUT/json-version.json" && break
  sleep 0.2
done
curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }

echo "== listening lines (evidence)"
ss -ltnp | grep -E ":($HTTP_PORT|$CDP_PORT)\b"

echo "== effective child process line (evidence)"
ps -eo pid,ppid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile"
CHROMIUM_PIDS=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')
echo "chromium pids: $CHROMIUM_PIDS"

if [ "$MODE" = "reval" ]; then
  echo "== prepass journey (same session: populate cache WITH no-cache headers so the recorded journey revalidates)"
  mkdir -p "$OUT/prepass"
  node "$ROOT/net-journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$HTTP_PORT" --out="$OUT/prepass"
fi

echo "== run journey"
node "$ROOT/net-journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$HTTP_PORT" --out="$OUT"
JOURNEY_EXIT=$?
echo "journey.exit=$JOURNEY_EXIT"

echo "== http.log (whole)"
cat "$OUT/http.log"

echo "== chromium.log (first 12 lines)"
head -12 "$OUT/chromium.log"
echo "== chromium.log network-ish lines"
grep -Ei 'google|gcm|http|connect' "$OUT/chromium.log" | head -10 || echo "(no network-ish lines)"

echo "== cleanup"
kill $CHROMIUM_LAUNCH_PID $CHROMIUM_PIDS 2>/dev/null
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
echo "== driver run $RUN end $(date -u +%Y-%m-%dT%H:%M:%SZ) journey.exit=$JOURNEY_EXIT"
exit "$JOURNEY_EXIT"