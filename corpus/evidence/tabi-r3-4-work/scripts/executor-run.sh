#!/usr/bin/env bash
# TABI-R3-4 executor capture: self-launched chromium + data: fixture + CDP :9232.
set -u
WORK=/tmp/tabi-r3-4-work
EV="$WORK/evidence"
FIXTURE="${FIXTURE:-$WORK/fixture/fixture-v1.html}"
mkdir -p "$EV"
NOTE() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]" "$*" | tee -a "$EV/session.log"; }

NAV_URL="$(python3 "$WORK/scripts/build-dataurl.py" "$FIXTURE")"
printf '%s\n' "$NAV_URL" > "$EV/nav-url.txt"
python3 - "$FIXTURE" > "$EV/fixture.sha-bytes.txt" <<'PY'
import sys, hashlib
b = open(sys.argv[1], 'rb').read()
print(hashlib.sha256(b).hexdigest(), len(b))
PY
sha256sum "$WORK/scripts/capture.mjs" "$WORK/scripts/build-dataurl.py" "$WORK/scripts/compare.py" "$FIXTURE" > "$EV/methodology-sha.txt"
{ ss -ltnp 2>/dev/null | grep ':9232' && echo "LISTENING-PRE"; } > "$EV/pre-listening.txt" || echo "port 9232 not listening pre-launch" > "$EV/pre-listening.txt"

for RUN in run1 run2; do
  OUT="$EV/$RUN"; mkdir -p "$OUT"
  PROFILE="$WORK/profile-$RUN"; rm -rf "$PROFILE"; mkdir -p "$PROFILE"
  NOTE "run=$RUN launching chromium"
  /usr/bin/chromium --headless --remote-debugging-port=9232 --remote-debugging-address=127.0.0.1 \
    --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check \
    --disable-background-networking --window-size=800,600 about:blank \
    > "$OUT/chromium-stderr.log" 2>&1 &
  PID=$!
  printf '%s\n' "$PID" > "$OUT/chromium-pid.txt"
  ok=0
  for _ in $(seq 1 150); do
    if curl -sf --max-time 2 http://127.0.0.1:9232/json/version > "$OUT/json-version.json" 2>/dev/null; then ok=1; break; fi
    sleep 0.2
  done
  if [ "$ok" != 1 ]; then NOTE "run=$RUN debug endpoint never came up; skipping"; kill -TERM "$PID" 2>/dev/null; continue; fi
  sleep 0.5
  curl -s http://127.0.0.1:9232/json/list > "$OUT/json-list.json"
  collect() { local p=$1; ps -o pid,ppid,args -p "$p" --no-headers 2>/dev/null; for c in $(pgrep -P "$p" 2>/dev/null); do collect "$c"; done; }
  collect "$PID" > "$OUT/ps-tree.txt"
  PAGE_WS="$(python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print([t['webSocketDebuggerUrl'] for t in d if t.get('type')=='page'][0])" "$OUT/json-list.json")"
  printf '%s\n' "$PAGE_WS" > "$OUT/page-ws.txt"
  NOTE "run=$RUN page target ws captured; driving capture"
  PAGE_WS="$PAGE_WS" NAV_URL="$NAV_URL" OUT="$OUT" timeout 90 node "$WORK/scripts/capture.mjs" > "$OUT/capture.json" 2> "$OUT/capture-node-stderr.log"
  rc=$?
  NOTE "run=$RUN capture rc=$rc"
  kill -TERM "$PID" 2>/dev/null
  for _ in $(seq 1 50); do kill -0 "$PID" 2>/dev/null || break; sleep 0.1; done
  if kill -0 "$PID" 2>/dev/null; then kill -KILL "$PID" 2>/dev/null; NOTE "run=$RUN SIGKILL fallback used on pid $PID"; fi
  sleep 0.5
  { sleep 0.3; curl -s --max-time 3 -o /dev/null -w 'http_code=%{http_code}\n' http://127.0.0.1:9232/json/version; echo "curl_exit=$?"; } > "$OUT/post-kill-curl.txt" 2>&1
  { ss -ltnp 2>/dev/null | grep ':9232' && echo "LISTENING-POST"; } > "$OUT/post-kill-listening.txt" || echo "9232 not listening post-kill" > "$OUT/post-kill-listening.txt"
  echo "survivor-pids: $(pgrep -P "$PID" 2>/dev/null | tr '\n' ' ')" > "$OUT/post-kill-children.txt"
done

python3 "$WORK/scripts/compare.py" "$EV/run1" "$EV/run2" > "$EV/cross-run-compare.json"
NOTE "cross-run compare written"
echo "=== cross-run-compare.json ==="
cat "$EV/cross-run-compare.json"