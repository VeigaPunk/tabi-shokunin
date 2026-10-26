#!/usr/bin/env bash
# run5.sh — driver run with pid-scoped socket sampling AND a concurrent non-loopback
# positive control (a held TCP session to an allowed public host) in the same window.
set -u
S=/fast/scratch/hyaku/tabi-r35/SentinelDriverEgress
cd "$S" || exit 9
rm -rf "$S/tmp5" "$S/out5"; mkdir -p "$S/tmp5" "$S/out5"
TMPDIR="$S/tmp5" node "$S/clone/scripts/bidi-firefox-loopback-round35.mjs" --out "$S/out5" > "$S/driver5.out" 2> "$S/driver5.err" &
DRIVER=$!
echo "driver_pid=$DRIVER"
node "$S/monitor2.mjs" "$DRIVER" "$S/monitor5.json" "$S/tmp5" 200000 > "$S/monitor5.err" 2>&1 &
MON=$!
python3 "$S/control.py" > "$S/control-out5.json" 2>&1 &
CTL=$!
START=$(date +%s%N)
wait "$DRIVER"; RC=$?
END=$(date +%s%N)
wait "$CTL"; CTLRC=$?
sleep 1
kill "$MON" 2>/dev/null
sleep 1
echo "driver_exit=$RC control_exit=$CTLRC elapsed_ms=$(( (END-START)/1000000 ))"
cat "$S/driver5.err"
echo "--- control ---"; cat "$S/control-out5.json"
echo "--- survivors ---"
pgrep -a -f -- "--profile-root $S/tmp5"; echo "pgrep_exit=$?"
echo "--- tmp left ---"; find "$S/tmp5" -mindepth 1 | head
