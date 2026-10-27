#!/usr/bin/env bash
# One frozen-counter invocation with a process-tree watcher (A8: teardown / orphan check).
# usage: run.sh <TAG> <REV> [ENV_ASSIGNMENT]
set -u
S=/fast/scratch/hyaku/tabi-r36/SentinelScope2
TAG=$1; REV=$2
OUT=$S/runs/$TAG
mkdir -p "$OUT"
LOG=$OUT/watch.log; : > "$LOG"
P() { pgrep -af 'geckodriver|firefox' 2>/dev/null | grep -F 'SentinelScope2' || true; }
P > "$OUT/before.txt"
export TMPDIR=$S/tmp
if [ "$#" -ge 3 ] && [ -n "$3" ]; then export "$3"; echo "$3" > "$OUT/env_extra.txt"; fi
node "$S/c2-firefox-bidi-v2.mjs" --repo "$S/clone" --rev "$REV" --json > "$OUT/out.json" 2> "$OUT/err.txt" &
N=$!
while kill -0 $N 2>/dev/null; do
  { printf '%s ' "$(date +%s.%N)"; P | tr '\n' '|'; echo; } | tee -a "$LOG"
  sleep 0.2
done
wait $N; rc=$?
echo "$rc" > "$OUT/exit"
P > "$OUT/after0.txt"
sleep 0.5; P > "$OUT/after500ms.txt"
sleep 2; P > "$OUT/after2500ms.txt"
ls -d "$S/tmp"/tabi-r36-* > "$OUT/tmpdirs_after.txt" 2>/dev/null || echo none > "$OUT/tmpdirs_after.txt"
printf "node_exit %s\n" "$(date +%s.%N)" >> "$LOG"
wc -l < "$LOG" > "$OUT/watch_samples.txt"
echo "TAG=$TAG rc=$rc"
