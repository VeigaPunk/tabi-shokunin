#!/usr/bin/env bash
# run-driver.sh — one pid-scoped footprint measurement of the tabi r35 lane driver.
set -u
S=/fast/scratch/hyaku/tabi-r35/SentinelDriverEgress
rm -rf "$S/tmp" "$S/out2"; mkdir -p "$S/tmp" "$S/out2"
find ~/.mozilla ~/.cache/mozilla ~/.config/mozilla ~/.local/share/mozilla -xdev -printf '%T@ %s %p\n' 2>/dev/null | sort > "$S/home-before2.txt"
TMPDIR="$S/tmp" node "$S/clone/scripts/bidi-firefox-loopback-round35.mjs" --out "$S/out2" > "$S/driver2.out" 2> "$S/driver2.err" &
DRIVER=$!
echo "driver_pid=$DRIVER"
echo "$DRIVER" > "$S/driver.pid"
node "$S/monitor2.mjs" "$DRIVER" "$S/monitor2.json" "$S/tmp" 200000 > "$S/monitor2.err" 2>&1 &
MON=$!
START=$(date +%s%N)
wait "$DRIVER"
RC=$?
END=$(date +%s%N)
sleep 1
kill "$MON" 2>/dev/null
sleep 1
echo "driver_exit=$RC elapsed_ms=$(( (END-START)/1000000 ))"
cat "$S/driver2.err"
echo "--- out2 ---"; ls -l "$S/out2"
echo "--- survivor check (profile-root in scratch) ---"
pgrep -a -f -- "--profile-root $S/tmp" ; echo "pgrep_profile_root_exit=$?"
pgrep -a -f -- "geckodriver.*--binary $S" ; echo "pgrep_geckodriver_exit=$?"
echo "--- tmp left ---"; find "$S/tmp" -mindepth 1 | head
echo "--- home after diff ---"
find ~/.mozilla ~/.cache/mozilla ~/.config/mozilla ~/.local/share/mozilla -xdev -printf '%T@ %s %p\n' 2>/dev/null | sort > "$S/home-after2.txt"
diff -u "$S/home-before2.txt" "$S/home-after2.txt"; echo "home_diff_exit=$?"
