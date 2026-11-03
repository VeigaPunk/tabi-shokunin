#!/usr/bin/env bash
# Round-56 labrat run harness: one hypothesis, one fresh profile, one fresh server.
# usage: runner.sh H1 1
set -u
HYP="${1:?hypothesis H1|H2}"
RUN="${2:?run number}"
VAR="${3:-default}"
S="/fast/scratch/hyaku/tabi-r56/R56LabProbe"
OUT="$S/runs/${HYP}-run${RUN}-${VAR}"
rm -rf -- "$OUT"
mkdir -p "$OUT/profile"

# --- pick a port, prove it free with ss -ltn ---
PORT=""
for cand in $(seq 45123 45240); do
  if ! ss -ltn "sport = :$cand" 2>/dev/null | grep -q LISTEN; then PORT="$cand"; break; fi
done
[ -n "$PORT" ] || { echo '{"error":"no free port"}' >&2; exit 97; }
echo "PORT=$PORT free-by-ss=1" > "$OUT/port.txt"

cleanup() {
  if [ -n "${SROVPID:-}" ]; then kill -TERM "$SROVPID" 2>/dev/null; wait "$SROVPID" 2>/dev/null; fi
  if [ -n "${CHPID:-}" ]; then kill -TERM "$CHPID" 2>/dev/null; wait "$CHPID" 2>/dev/null; fi
  return 0
}
trap 'cleanup' EXIT INT TERM

# --- loopback fixture server ---
cd "$S/fixture" || exit 98
/usr/bin/python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$S/fixture" \
  > "$OUT/server.log" 2>&1 &
SROVPID=$!

# --- chromium 155 headless, throwaway profile, loopback devtools ---
/usr/bin/chromium \
  --headless=new \
  --remote-debugging-port=0 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$OUT/profile" \
  --no-first-run --no-default-browser-check --no-service-autorun \
  --disable-extensions --disable-sync --disable-background-networking \
  --disable-component-update --disable-domain-reliability \
  --disable-client-side-phishing-detection --disable-default-apps \
  --metrics-recording-only --mute-audio --disable-gpu --no-sandbox \
  --host-resolver-rules="MAP * 127.0.0.1:$PORT,EXCLUDE 127.0.0.1" \
  "http://127.0.0.1:$PORT/form.html" \
  > "$OUT/chromium.log" 2>&1 &
CHPID=$!
echo "SROVPID=$SROVPID CHPID=$CHPID" >> "$OUT/port.txt"

# --- drive ---
node "$S/driver.mjs" --hypothesis "$HYP" --run "$RUN" --profile "$OUT/profile" \
  --http-port "$PORT" --server-log "$OUT/server.log" --variant "$VAR" > "$OUT/result.json" 2>"$OUT/driver.err"
DRC=$?
echo "driver_exit=$DRC" >> "$OUT/port.txt"

cleanup
unset SROVPID CHPID

# --- prove zero survivors ---
sleep 1
SURV_CH="$(pgrep -af "user-data-dir=$OUT/profile" | grep -v pgrep | wc -l)"
SURV_SRV="$(pgrep -af "http.server $PORT --bind 127.0.0.1" | grep -v pgrep | wc -l)"
SURV_PORT="$(ss -ltn "sport = :$PORT" 2>/dev/null | grep -c LISTEN)"
{
  echo "survivors_chromium=$SURV_CH"
  echo "survivors_server=$SURV_SRV"
  echo "survivors_port_listen=$SURV_PORT"
} >> "$OUT/port.txt"
cat "$OUT/result.json" 2>/dev/null
printf '{"run_dir":"%s","driver_exit":%d,"survivors_chromium":%d,"survivors_server":%d,"survivors_port_listen":%d,"hypothesis":"%s","run":%d,"variant":"%s"}\n' \
  "$OUT" "$DRC" "$SURV_CH" "$SURV_SRV" "$SURV_PORT" "$HYP" "$RUN" "$VAR" > "$OUT/survivors.json"
