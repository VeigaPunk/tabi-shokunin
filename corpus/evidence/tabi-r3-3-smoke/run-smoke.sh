#!/usr/bin/env bash
# TABI-R3-3 smoke: replay the SKILL.md runbook command chain end-to-end (loopback only).
set -u
ROOT=/tmp/tabi-r3-3-smoke
OUT="$ROOT/out"
HTTP_PORT=19411
CDP_PORT=19412
mkdir -p "$OUT" "$ROOT/site"
cp /tmp/tabi-r2-1-capture/site/page.html "$ROOT/site/page.html"
exec > "$OUT/driver.log" 2>&1
echo "== step2 precheck"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"
echo "== step1 fixture sha"
sha256sum "$ROOT/site/page.html"
echo "== step3 server"
python3 -m http.server "$HTTP_PORT" --bind 127.0.0.1 --directory "$ROOT/site" > "$OUT/http.log" 2>&1 &
HTTP_PID=$!
echo "http.pid=$HTTP_PID"
echo "== step4 chromium"
setsid nohup chromium --headless=new --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$OUT/profile" \
  --no-first-run --no-default-browser-check --disable-gpu \
  --disable-background-networking \
  about:blank > "$OUT/chromium.log" 2>&1 &
echo "chromium.launch.pid=$!"
echo "== step5 endpoint wait"
for i in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$CDP_PORT/json/version" > "$OUT/json-version.json" && break
  sleep 0.2
done
curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; exit 11; }
echo "== listening lines"
ss -ltnp | grep -E ":($HTTP_PORT|$CDP_PORT)\b"
echo "== step6 child line"
ps -eo pid,ppid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile"
CHROMIUM_PIDS=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')
echo "chromium pids: $CHROMIUM_PIDS"
echo "== step9 capture (round-2 measured harness, read-only exec)"
node /tmp/tabi-r2-1-capture/capture.mjs --phase=det --cdp="$CDP_PORT" \
  --url="http://127.0.0.1:$HTTP_PORT/page.html?nondet=off" --out="$OUT"
echo "capture.exit=$?"
echo "== artifacts"
sha256sum "$OUT/det-before.png" "$OUT/det-after.png" "$OUT/det-before.shape.txt" "$OUT/det-after.shape.txt"
echo "== step13 cleanup"
kill $CHROMIUM_PIDS 2>/dev/null
kill "$HTTP_PID" 2>/dev/null
sleep 1
SURV=$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')
if [ -n "$SURV" ]; then echo "escalating kill -9: $SURV"; kill -9 $SURV; sleep 1; fi
echo "== closure proof"
ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" && echo "FAIL: survivor" || echo "pass: no chromium"
ss -ltn | grep -E ":($HTTP_PORT|$CDP_PORT)\b" && echo "FAIL: port listening" || echo "pass: ports not listening"
curl -s -o /dev/null "http://127.0.0.1:$CDP_PORT/json/version"; echo "curl cdp exit=$?"
curl -s -o /dev/null "http://127.0.0.1:$HTTP_PORT/page.html"; echo "curl http exit=$?"
echo "== smoke done"