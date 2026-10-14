#!/usr/bin/env bash
# TABI lane B9-1 — run the replay matrix: each cell x 2 cold reps.
set -u
ROOT=/tmp/w9-tabi-b91
CELLS="replay-guard-skip replay-consumed-pre replay-consumed-post replay-unknown-token replay-terminus double-apply-fresh-token replay-307 xclient-consume xclient-sessions"
: > "$ROOT/run-all.log"
for cell in $CELLS; do
  for rep in 1 2; do
    echo "=== $cell rep$rep $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$ROOT/run-all.log"
    bash "$ROOT/driver.sh" "$cell" "$rep" >> "$ROOT/run-all.log" 2>&1
    rc=$?
    echo "=== $cell rep$rep exit=$rc $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$ROOT/run-all.log"
  done
done
echo "ALL DONE $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$ROOT/run-all.log"