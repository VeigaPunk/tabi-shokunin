#!/usr/bin/env bash
# ExecReplayAll — replay r39..r42 C1 receipts through the frozen round-43 counter v5.
# The counter is executed IN PLACE from the lane repo (frozen bytes, read-only):
# its self-digest check uses fileURLToPath(import.meta.url), so a scratch copy
# would inject a spurious digest-mismatch finding. It reads CLAIMS from the
# hardcoded lane path /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json.
#
# fds 3 and 4 are CLOSED for every invocation (3>&- 4>&-): the counter's
# challenge-response channel is wrapper-only, so a direct offline invocation
# cannot answer it and must refuse.
set -u
S=/fast/scratch/hyaku/tabi-r43/ExecReplayAll
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
COUNTER=$LANE/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs

run() {
  local label="$1"; shift
  local receipt="$1"; shift
  local measure="$1"; shift
  local tag="$1"; shift
  echo "===== $label ====="
  echo "CMD: node $COUNTER <receipt> --measure <measure>   (fd3/fd4 closed)"
  echo "RECEIPT: $receipt"
  echo "MEASURE: $measure"
  ( cd "$S" && node "$COUNTER" "$receipt" --measure "$measure" 3>&- 4>&- >"$S/out/$tag.stdout" 2>"$S/out/$tag.stderr" )
  local ec=$?
  echo "EXIT: $ec"
  echo "STDOUT (first 1200 bytes):"
  head -c 1200 "$S/out/$tag.stdout"; echo
  echo "STDERR (first 600 bytes):"
  head -c 600 "$S/out/$tag.stderr"; echo
  echo "$ec" > "$S/out/$tag.exit"
  echo
}

# r39: round-39 committed NO signed measure record (verified across all history).
run "r39 / no-measure-record (round-39 own measure slot is absent)" \
    "$S/r39/receipt.json" "$S/r39/measure-ABSENT.json" r39-nomeasure
# r39 second pass: cross-round, r40's own measure record against the r39 receipt.
run "r39 / cross-round measure (r40 own measure vs r39 receipt)" \
    "$S/r39/receipt.json" "$S/r40/measure.json" r39-xround
# r40: own measure record, committed in the same commit as the receipt.
run "r40 / own measure record" \
    "$S/r40/receipt.json" "$S/r40/measure.json" r40-own
# r41: own measure record.
run "r41 / own measure record" \
    "$S/r41/receipt.json" "$S/r41/measure.json" r41-own
# r42: own measure record.
run "r42 / own measure record" \
    "$S/r42/receipt.json" "$S/r42/measure.json" r42-own
# Positive control: the GENUINE round-43 receipt+measure (direct invocation).
run "r43-positive-control / genuine round-43 receipt (direct invocation still refuses)" \
    "$S/r43/receipt.json" "$LANE/.ufo/waves/round-43/measure/c1-measure-r43.json" r43-own

echo "===== SUMMARY ====="
for t in r39-nomeasure r39-xround r40-own r41-own r42-own r43-own; do
  printf '%-16s exit=%s\n' "$t" "$(cat "$S/out/$t.exit")"
done
