#!/usr/bin/env bash
# TABI lane B9-1 replay driver — a copy of lane B8-1's driver (pin 3f6c09a748c8b387)
# with ports 19881/19882 and the curl cross-client branch; one run, loopback only.
# usage: bash driver.sh <cell> <rep>
set -u
CELL="${1:?usage: driver.sh <cell> <rep>}"
REP="${2:?usage: driver.sh <cell> <rep>}"
ROOT=/tmp/w9-tabi-b91
OUT="$ROOT/runs/$CELL/rep$REP"
PORT=19881
CDP_PORT=19882
mkdir -p "$OUT"
rm -rf "$OUT/profile"; rm -f "$OUT"/*.json "$OUT"/*.log "$OUT"/*.png "$OUT"/*.txt "$OUT"/*.jar "$OUT"/*.html
exec > >(tee "$OUT/driver.log") 2>&1
echo "== run $CELL rep$REP start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "== UID $(id -u) host $(hostname) cwd $(pwd)"
echo "== chromium $(chromium --version 2>&1) | node $(node --version) | python $(python3 --version 2>&1)"
echo "== pins: server.py $(sha256sum "$ROOT/server.py" | cut -c1-16) journey.mjs $(sha256sum "$ROOT/journey.mjs" | cut -c1-16)"

echo "== port precheck (must be empty)"
ss -ltn | grep -E ":(19881|19882)\b" && { echo "FATAL: ports busy"; exit 10; } || echo "ports free"

python3 "$ROOT/server.py" "$PORT" > "$OUT/http.log" 2>&1 &
HTTP_PID=$!
echo "http.pid=$HTTP_PID"
for i in $(seq 1 50); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/__ready" && break; sleep 0.2; done
curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:$PORT/__ready" | sed 's/^/server ready code: /'
curl -s "http://127.0.0.1:$PORT/__ledger" > "$OUT/ledger-before.json"
echo "ledger-before: $(cat "$OUT/ledger-before.json")"

if [ "$CELL" = "curl-control" ]; then
  echo "== curl control phase (no browser)"
  bash "$ROOT/curl-control.sh" "$OUT" "$PORT"
  JOURNEY_EXIT=$?
elif [ "$CELL" = "xclient-consume" ] || [ "$CELL" = "xclient-sessions" ]; then
  echo "== curl cross-client phase (no browser; two independent clients)"
  bash "$ROOT/curl-replay.sh" "$CELL" "$OUT" "$PORT"
  JOURNEY_EXIT=$?
else
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
  curl -sf "http://127.0.0.1:$CDP_PORT/json/version" >/dev/null || { echo "FATAL: cdp endpoint not up"; kill "$HTTP_PID"; exit 11; }

  echo "== listening lines (evidence)"
  ss -ltnp 2>/dev/null | grep -E ":(19881|19882)\b"
  echo "== chromium process lines (evidence)"
  ps -eo pid,ppid,args | grep "[c]hromium" | grep -- "user-data-dir=$OUT/profile" | head -3

  echo "== run journey ($CELL rep$REP)"
  node "$ROOT/journey.mjs" --cdp="$CDP_PORT" --base="http://127.0.0.1:$PORT" --cell="$CELL" --rep="$REP" --out="$OUT"
  JOURNEY_EXIT=$?
  echo "journey.exit=$JOURNEY_EXIT"
fi

curl -s "http://127.0.0.1:$PORT/__ledger" > "$OUT/ledger-after.json"
echo "ledger-after: $(cat "$OUT/ledger-after.json")"

echo "== http.log (whole)"
cat "$OUT/http.log"

echo "== chromium egress-ish log lines (informative)"
grep -Eic 'google|gcm|accounts' "$OUT/chromium.log" | sed 's/^/egress-ish line count: /' || true

echo "== cleanup (kill by PID from the process table; pgrep never matches itself)"
PIDS=$(pgrep -f -- "user-data-dir=$OUT/profile" || true)
echo "pgrep chromium pids: ${PIDS:-none}"
if [ -n "${PIDS:-}" ]; then kill $PIDS 2>/dev/null; sleep 1; fi
SURV=$(pgrep -f -- "user-data-dir=$OUT/profile" || true)
if [ -n "${SURV:-}" ]; then echo "escalating kill -9: $SURV"; kill -9 $SURV 2>/dev/null; sleep 1; fi
kill "$HTTP_PID" 2>/dev/null
sleep 1

{
  echo "== closure verification"
  if pgrep -f -- "user-data-dir=$OUT/profile" >/dev/null; then echo "FAIL: chromium process still present"; else echo "pass: no chromium process for $OUT/profile"; fi
  if ss -ltn | grep -E ":(19881|19882)\b"; then echo "FAIL: port still listening"; else echo "pass: ports $PORT/$CDP_PORT not listening"; fi
  curl -s -o /dev/null "http://127.0.0.1:$CDP_PORT/json/version"; echo "curl cdp exit=$?"
  curl -s -o /dev/null "http://127.0.0.1:$PORT/"; echo "curl http exit=$?"
  echo "== request-line counts (server log)"
  echo "all instrument lines: $(wc -l < "$OUT/http.log")"
  for p in "/submit" "/result" "/form" "/slow-hop1" "/slow-hop2" "/away" "/echo307" "/echo307-target"; do
    echo "  $p: $(grep -c -F " $p " "$OUT/http.log" || true)"
    echo "  $p (query form): $(grep -c -F " $p?" "$OUT/http.log" || true)"
  done
  echo "aborted-write markers: $(grep -c 'ABORTED response write' "$OUT/http.log" || true)"
} | tee "$OUT/closure.txt"

echo "== run $CELL rep$REP end $(date -u +%Y-%m-%dT%H:%M:%SZ) journey.exit=$JOURNEY_EXIT"
exit "$JOURNEY_EXIT"