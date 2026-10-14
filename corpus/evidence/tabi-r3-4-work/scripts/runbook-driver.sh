#!/usr/bin/env bash
# TABI-R3-4 executor — steps 0-6, 13 (+ step 11 compare) of the upgraded SKILL.md §Runbook.
set -u
WORK=/tmp/tabi-r3-4-work
EV="$WORK/evidence-runbook"
SITE="$WORK/site"
SD="$WORK/scripts"
mkdir -p "$EV" "$SITE"
NOTE() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]" "$*" | tee -a "$EV/session.log"; }

# ---- step 1 (fixture half): copy the fixture in, pin its bytes now ----
cp /tmp/tabi-r2-1-capture/site/page.html "$SITE/page.html"
FIXTURE_SHA="$(sha256sum "$SITE/page.html" | awk '{print $1}')"
NOTE "fixture pinned sha256=$FIXTURE_SHA (copied from the doc-named /tmp/tabi-r2-1-capture/site/page.html)"

# ---- step 0: inventory ----
{ echo "node --version: $(node --version)"; echo "node typeof WebSocket: $(node -e 'console.log(typeof WebSocket)')";
  echo "chromium --version: $(chromium --version)"; echo "python3 --version: $(python3 --version)"; } > "$EV/step0-inventory.txt"

# ---- step 1: methodology sha pins ----
sha256sum "$SITE/page.html" "$SD/runbook-capture.mjs" "$SD/runbook-driver.sh" "$SD/runbook-compare.py" > "$EV/methodology-sha.txt"

for RUN in run1 run2; do
  OUT="$EV/$RUN"; mkdir -p "$OUT"
  # ---- step 2: port precheck ----
  if ss -ltn | grep -qE ':(19411|19412)\b'; then echo "FATAL: ports busy" > "$OUT/step2-ports.txt"; NOTE "run=$RUN ports busy FATAL"; exit 10; fi
  echo "ports free (19411, 19412)" > "$OUT/step2-ports.txt"

  # ---- step 3: serve the fixture, loopback only ----
  python3 -m http.server 19411 --bind 127.0.0.1 --directory "$SITE" > "$OUT/http.log" 2>&1 &
  HTTP_PID=$!
  for _ in $(seq 1 50); do ss -ltn 2>/dev/null | grep -qE ':19411\b' && break; sleep 0.2; done
  { ss -ltnp 2>/dev/null | grep -E ':19411\b' || echo "no listen line"; } > "$OUT/step3-listen-line.txt"
  curl -s -o /dev/null -w 'page.html http_code=%{http_code}\n' "http://127.0.0.1:19411/page.html" >> "$OUT/step3-listen-line.txt"
  NOTE "run=$RUN fixture server up pid=$HTTP_PID"

  # ---- step 4: fresh headless chromium, own profile (doc command verbatim) ----
  setsid nohup chromium --headless=new --remote-debugging-port=19412 \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir="$OUT/profile" \
    --no-first-run --no-default-browser-check --disable-gpu \
    --disable-background-networking \
    about:blank > "$OUT/chromium.log" 2>&1 &
  LAUNCH_PID=$!
  echo "launch-shell-pid(dollar-bang)=$LAUNCH_PID" > "$OUT/step4-launch-pid.txt"

  # ---- step 5: wait for CDP endpoint, bounded ----
  for _ in $(seq 1 50); do curl -sf "http://127.0.0.1:19412/json/version" > "$OUT/json-version.json" 2>/dev/null && break; sleep 0.2; done
  if ! curl -sf "http://127.0.0.1:19412/json/version" >/dev/null; then NOTE "run=$RUN FATAL: cdp endpoint not up"; exit 11; fi

  # ---- step 6: effective child line + kill list ----
  ps -eo pid,ppid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" > "$OUT/step6-child-lines.txt"
  CHROMIUM_PIDS="$(awk '{print $1}' "$OUT/step6-child-lines.txt" | tr '\n' ' ')"
  echo "$CHROMIUM_PIDS" > "$OUT/step6-kill-list.txt"
  NOTE "run=$RUN child lines=$(wc -l < "$OUT/step6-child-lines.txt") kill-list=[$CHROMIUM_PIDS]"
  curl -s http://127.0.0.1:19412/json/list > "$OUT/json-list-pre.json"

  # ---- step 7-12: CDP capture session ----
  PAGE_WS="$(python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print([t['webSocketDebuggerUrl'] for t in d if t.get('type')=='page'][0])" "$OUT/json-list-pre.json")"
  BROWSER_WS="$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['webSocketDebuggerUrl'])" "$OUT/json-version.json")"
  printf '%s\n' "$PAGE_WS" > "$OUT/page-ws.txt"; printf '%s\n' "$BROWSER_WS" > "$OUT/browser-ws.txt"
  PAGE_WS="$PAGE_WS" BROWSER_WS="$BROWSER_WS" OUT="$OUT" RUN="$RUN" FIXTURE_SHA="$FIXTURE_SHA" \
    BASE_URL="http://127.0.0.1:19411/page.html" VOLATILE_URL="http://127.0.0.1:19411/page.html?nondet=on" \
    timeout 90 node "$SD/runbook-capture.mjs" > "$OUT/capture.json" 2> "$OUT/capture-node-stderr.log"
  NOTE "run=$RUN capture rc=$?"

  # ---- step 13: cleanup + closure proof ----
  kill $CHROMIUM_PIDS 2>/dev/null
  kill "$HTTP_PID" 2>/dev/null
  sleep 1
  SURV="$(ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" | awk '{print $1}')"
  if [ -n "$SURV" ]; then echo "escalating kill -9: $SURV" > "$OUT/step13-escalation.txt"; kill -9 $SURV; sleep 1; fi
  ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=$OUT/profile" > "$OUT/step13-survivors.txt"
  ss -ltn | grep -E ":(19411|19412)\b" > "$OUT/step13-ports.txt"
  { curl -s -o /dev/null "http://127.0.0.1:19412/json/version"; echo "curl cdp exit=$?";
    curl -s -o /dev/null "http://127.0.0.1:19411/page.html"; echo "curl http exit=$?"; } > "$OUT/step13-closure.txt"
  NOTE "run=$RUN closure: survivors=$(wc -l < "$OUT/step13-survivors.txt") ports=$(wc -l < "$OUT/step13-ports.txt") $(tr '\n' ' ' < "$OUT/step13-closure.txt")"
done

# ---- step 11: compare across runs, mechanically ----
python3 "$SD/runbook-compare.py" "$EV/run1" "$EV/run2" > "$EV/compare.tsv"
NOTE "step 11 compare.tsv written"
echo "=== compare.tsv ==="
cat "$EV/compare.tsv"