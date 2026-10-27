#!/usr/bin/env bash
# w2 / SentinelScope2 — A8 reproducer: normal teardown vs SIGTERM-to-node teardown.
# usage: probe-teardown.sh <mode: normal|sigterm> [S]
set -u
MODE=${1:-normal}
S=${2:-/fast/scratch/hyaku/tabi-r36/SentinelScope2/repro-a8}
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FREEZE=2e7b7a8920bff47fae6f75c3d06e48e37767099e
COUNTER=.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs
mkdir -p "$S/tmp"; export TMPDIR="$S/tmp"
# browser tree only: geckodriver binary or the firefox install (never node, whose script name
# contains "firefox").
P() { pgrep -af 'geckodriver|/opt/firefox' 2>/dev/null | grep -F "$S" || true; }
cleanup() { P | awk '{print $1}' | xargs -r kill -KILL 2>/dev/null; rm -rf -- "$S"; }
trap cleanup EXIT

git clone -q --shared "$LANE" "$S/clone" || exit 9
[ "$(git -C "$S/clone" rev-parse --show-toplevel)" = "$S/clone" ] || { echo "BOUNDARY FAIL"; exit 9; }
git -C "$LANE" show "$FREEZE:$COUNTER" > "$S/c2.mjs"
echo "counter sha256: $(sha256sum "$S/c2.mjs" | cut -d' ' -f1)"

node "$S/c2.mjs" --repo "$S/clone" --rev "$FREEZE" --json > "$S/out.json" 2> "$S/err.txt" &
N=$!
if [ "$MODE" = sigterm ]; then
  for i in $(seq 1 300); do P | grep -q '/opt/firefox' && break; sleep 0.05; done
  echo "browser tree before kill: $(P | wc -l) processes"
  P > "$S/before_kill.txt"
  kill -TERM "$N"
fi
while kill -0 "$N" 2>/dev/null; do sleep 0.05; done
wait "$N" 2>/dev/null; rc=$?
for t in 1 3; do
  sleep "$t" >/dev/null 2>&1 || true
  echo "processes at +$t s after node exit: $(P | wc -l)"
done
P
echo "scratch dirs at +3 s: $(ls -d "$S"/tmp/tabi-r36-* 2>/dev/null | wc -l)"
echo "node exit=$rc"
