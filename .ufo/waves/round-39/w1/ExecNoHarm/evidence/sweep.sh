#!/usr/bin/env bash
# Lane documented self-test sweep at tip. Runs each documented self-test command
# inside an isolated scratch clone; records command, exit code and stable output.
# Does not touch the lane working tree.
set -u
S=/fast/scratch/hyaku/tabi-r39/ExecNoHarm
REPO="$S/tip"
OUT="$S/out"
mkdir -p "$OUT"

cd "$REPO" || exit 90

run() {
  local name="$1"; shift
  local log="$OUT/$name.txt"
  {
    printf '$ %s\n' "$*"
  } > "$log"
  node "$@" >> "$log" 2>&1
  local rc=$?
  printf 'EXIT=%s\n' "$rc" >> "$log"
  printf '%s\t%s\t%s\n' "$name" "$rc" "$log"
}

{
run adjacency          scripts/check-adjacency.mjs --self-test
run aria-metadata      scripts/check-aria-metadata.mjs --self-test
run bfcache-receipt    scripts/check-bfcache-receipt.mjs --selftest
run bidi-runtime       scripts/check-bidi-runtime.mjs --selftest
run decision-table     scripts/check-decision-table.mjs --selftest
run freshness          scripts/check-freshness.mjs --self-test
run frontier-admission scripts/check-frontier-admission.mjs --selftest
run gate-mutants       scripts/check-gate-mutants.mjs --selftest
run gate-registry      scripts/check-gate-registry.mjs --selftest
run measurement-binding scripts/check-measurement-binding.mjs --self-test
run release-pins       scripts/check-release-pins.mjs --selftest
run round-contract     scripts/check-round-contract.mjs --self-test
run s106-evidence      scripts/check-s106-evidence.mjs --selftest
run selfassessment     scripts/check-selfassessment.mjs --selftest
run source-reopen      scripts/check-source-reopen-receipt.mjs --selftest
run sources            scripts/check-sources.mjs --self-test
run user-round-contract scripts/check-user-round-contract.mjs --self-test
run round-evidence-audit scripts/round-evidence-audit.mjs --selftest
run freshness-witness  scripts/freshness-witness.mjs --self-test
run selftest-measurement-binding scripts/selftest-measurement-binding.mjs
} | tee "$OUT/summary.tsv"
