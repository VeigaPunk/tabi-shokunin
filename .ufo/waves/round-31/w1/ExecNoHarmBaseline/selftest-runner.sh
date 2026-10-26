#!/usr/bin/env bash
# round-31 w1 ExecNoHarmBaseline: run every registry gate's self-test at the freeze rev.
set -u
S=/fast/scratch/hyaku/tabi-r31/ExecNoHarmBaseline
C=$S/clone
R=9505a10eb80b2a0b273ebaba3f7f872ad302192d
export TMPDIR=$S/tmp
mkdir -p "$TMPDIR" "$S/raw/selftest"
cd "$C" || exit 9
: > "$S/raw/selftest/exit.raw"

run_one() {
  local slug=$1 script=$2 flag=$3
  local t0 t1 ec
  t0=$(date +%s)
  timeout 1500 node "$script" "$flag" > "$S/raw/selftest/$slug.out" 2> "$S/raw/selftest/$slug.err"
  ec=$?
  t1=$(date +%s)
  printf '%s\t%s\t%s\t%ss\n' "$slug" "node $script $flag" "$ec" "$((t1 - t0))" >> "$S/raw/selftest/exit.raw"
}

# lane scripts/* gates (registry rows 2471-2546 at REV)
run_one check-adjacency          scripts/check-adjacency.mjs            --self-test &
run_one check-aria-metadata      scripts/check-aria-metadata.mjs        --self-test &
run_one check-bfcache-receipt    scripts/check-bfcache-receipt.mjs      --selftest &
run_one check-decision-table     scripts/check-decision-table.mjs       --selftest &
run_one check-freshness          scripts/check-freshness.mjs            --self-test &
run_one check-frontier-admission scripts/check-frontier-admission.mjs   --selftest &
run_one check-gate-registry      scripts/check-gate-registry.mjs        --selftest &
run_one check-measurement-binding scripts/check-measurement-binding.mjs --self-test &
wait
run_one check-release-pins       scripts/check-release-pins.mjs         --selftest &
run_one check-round-contract     scripts/check-round-contract.mjs       --self-test &
run_one check-s106-evidence      scripts/check-s106-evidence.mjs        --selftest &
run_one check-selfassessment     scripts/check-selfassessment.mjs       --selftest &
run_one check-source-reopen-receipt scripts/check-source-reopen-receipt.mjs --selftest &
run_one check-sources            scripts/check-sources.mjs              --self-test &
run_one check-user-round-contract scripts/check-user-round-contract.mjs --self-test &
run_one round-evidence-audit     scripts/round-evidence-audit.mjs       --selftest &
wait
run_one check-gate-mutants       scripts/check-gate-mutants.mjs         --selftest &
run_one wave-r21-measure-c1      .ufo/waves/round-21/measure-c1.mjs     --selftest &
run_one wave-r22-review-chronology .ufo/waves/round-22/check-review-chronology.mjs --selftest &
run_one wave-r22-measure-c1      .ufo/waves/round-22/measure-c1.mjs     --selftest &
wait
# check-claim-record has no self-test flag at all (grep recorded in the report)
run_one wave-r12-claim-record    .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --selftest
sort -o "$S/raw/selftest/exit.tsv" "$S/raw/selftest/exit.raw"
cat "$S/raw/selftest/exit.tsv"
echo "--- clone status after selftests ---"
git -C "$C" status --porcelain | wc -l
