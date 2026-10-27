#!/usr/bin/env bash
# Documented historical counter self-tests (SKILL.md registry rows), run inside
# the scratch clone at tip so any receipt write lands in scratch, not the lane.
set -u
S=/fast/scratch/hyaku/tabi-r39/ExecNoHarm
REPO="$S/hist"
OUT="$S/out/historical-counters.txt"
mkdir -p "$S/out"
cd "$REPO" || exit 90

run() {
  local name="$1"; shift
  {
    printf '$ %s\n' "$*"
    node "$@" 2>&1
    printf 'EXIT=%s\n' "$?"
  } >> "$OUT"
}

: > "$OUT"
run r18-c1  .ufo/waves/round-18/measure-c1.mjs --self-test
run r18-c3  .ufo/waves/round-18/measure-c3.mjs --self-test
run r19-c1  .ufo/waves/round-19/measure-c1.mjs --self-test
run r19-c3  .ufo/waves/round-19/measure-c3.mjs --self-test
run r19-isolation .ufo/waves/round-19/isolation/check-isolation.mjs --self-test
run r20-c1  .ufo/waves/round-20/measure-c1.mjs --selftest
run r20-wave .ufo/waves/round-20/check-wave.mjs --selftest
run r21-c1  .ufo/waves/round-21/measure-c1.mjs --selftest
run r22-c1  .ufo/waves/round-22/measure-c1.mjs --selftest
run r22-chronology .ufo/waves/round-22/check-review-chronology.mjs --selftest
grep -n "EXIT=" "$OUT"
echo "--- scratch clone worktree dirt (writes landed in scratch) ---"
cd "$REPO" && git status --porcelain | head -20
