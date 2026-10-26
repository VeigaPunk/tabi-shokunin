#!/usr/bin/env bash
# run-matrix.sh — ExecNoHarmTip, round 30 w2 (milestone noharm).
# Same command set as w1/ExecNoHarmBaseline/run-matrix.sh (rows 1-38 + the
# supplementary rows 39-47 documented in that seat's report §3/§3a), re-pointed
# at the landed tip. Read-only against the lane: everything runs in $S/clone.
set -u
S=${S:?S required}
C="$S/clone"
OUT=${OUT:?OUT required}
REV=${REV:?REV required}
TMPDIR_RUN="$S/tmp"
mkdir -p "$TMPDIR_RUN" "$OUT/raw"
export TMPDIR="$TMPDIR_RUN"
export TZ=UTC
cd "$C" || exit 9

TSV="$OUT/matrix-tip.tsv"
printf 'row\tseat\trev\tscript\tmode\texit\ttally\tcommand\n' > "$TSV"

n=0
run() {
  local label="$1"; local mode="$2"; shift 2
  n=$((n+1))
  local tag
  tag=$(printf '%02d' "$n")
  local slug
  slug=$(printf '%s' "$label-$mode" | tr -c 'A-Za-z0-9._-' '_')
  local out="$OUT/raw/${tag}-${slug}.out"
  local err="$OUT/raw/${tag}-${slug}.err"
  local t0 t1
  t0=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  timeout 900 "$@" >"$out" 2>"$err"
  local rc=$?
  t1=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local tally
  tally=$(grep -hoE '([A-Z0-9_]*SELFTEST[A-Z0-9_]*|[A-Z0-9_]*_GATE|[A-Z0-9_]*_CONTRACT|verdict=[a-z-]+|clean=(true|false)|valid=(true|false)|cases=[0-9]+( passed=[0-9]+)?|fault_survivors=[0-9]+|benign_killed=[0-9]+|population=[0-9]+|admitted=[0-9]+|nonconformant=[0-9]+|mismatches=[0-9]+|unresolved=[0-9]+|rows=[0-9]+|findings=[0-9]+|matched=[0-9]+|restored=[0-9]+|reopened=[0-9]+|classes=[0-9]+|ok=(true|false))' "$out" "$err" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g;s/ $//')
  [ -z "$tally" ] && tally="(no tally; see raw)"
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$n" "ExecNoHarmTip" "$REV" "$label" "$mode" "$rc" "$tally" "$*" >> "$TSV"
  printf '%s %s %s -> exit=%s %s [%s..%s]\n' "$tag" "$label" "$mode" "$rc" "$tally" "$t0" "$t1" >&2
}

# ---------- self-tests (17 scripts carrying a self-test flag) ----------
run check-adjacency selftest node scripts/check-adjacency.mjs --self-test
run check-aria-metadata selftest node scripts/check-aria-metadata.mjs --self-test
run check-bfcache-receipt selftest node scripts/check-bfcache-receipt.mjs --selftest
run check-freshness selftest node scripts/check-freshness.mjs --self-test
run check-frontier-admission selftest node scripts/check-frontier-admission.mjs --selftest
run check-gate-mutants selftest node scripts/check-gate-mutants.mjs --selftest
run check-gate-registry selftest node scripts/check-gate-registry.mjs --selftest
run check-measurement-binding selftest node scripts/check-measurement-binding.mjs --self-test
run check-release-pins selftest node scripts/check-release-pins.mjs --selftest
run check-round-contract selftest node scripts/check-round-contract.mjs --self-test
run check-s106-evidence selftest node scripts/check-s106-evidence.mjs --selftest
run check-selfassessment selftest node scripts/check-selfassessment.mjs --selftest
run check-source-reopen-receipt selftest node scripts/check-source-reopen-receipt.mjs --selftest
run check-sources selftest node scripts/check-sources.mjs --self-test
run check-user-round-contract selftest node scripts/check-user-round-contract.mjs --self-test
run freshness-witness selftest node scripts/freshness-witness.mjs --self-test
run round-evidence-audit selftest node scripts/round-evidence-audit.mjs --selftest

# ---------- production modes ----------
run check-adjacency production node scripts/check-adjacency.mjs --repo "$C" --at "$REV" --fleet /home/vgpnk/Projects/shokunin --json
run check-aria-metadata production node scripts/check-aria-metadata.mjs
run check-aria-metadata witness node scripts/check-aria-metadata.mjs --witness
run check-bfcache-receipt production node scripts/check-bfcache-receipt.mjs --repo "$C" --rev "$REV" --json
run check-freshness production-witness node scripts/check-freshness.mjs --witness "$REV" --repo "$C"
run check-freshness production-worktree node scripts/check-freshness.mjs --worktree --repo "$C"
run check-frontier-admission production-offline node scripts/check-frontier-admission.mjs --repo "$C" --rev "$REV" --frontier rate-tos-signal --since 2026-10-26 --json
run check-gate-mutants production node scripts/check-gate-mutants.mjs --repo "$C" --rev "$REV" --work "$S/work" --json
run check-gate-registry production node scripts/check-gate-registry.mjs --repo "$C" --rev "$REV" --json
run check-measurement-binding production-check node scripts/check-measurement-binding.mjs --repo "$C" --check corpus/evidence/round-16/measurement-binding.json --reproduce --json
run check-measurement-binding production-legacy node scripts/check-measurement-binding.mjs --repo "$C" --legacy corpus/evidence/round-15/measurements.json --at "$REV" --json
run check-release-pins production node scripts/check-release-pins.mjs --repo "$C" --rev "$REV" --stable 156.0.8078.47 --json
run check-round-contract production node scripts/check-round-contract.mjs
run check-s106-evidence production node scripts/check-s106-evidence.mjs --repo "$C" --rev "$REV" --json
run check-selfassessment production node scripts/check-selfassessment.mjs --repo "$C" --rev "$REV" --json
run check-source-reopen-receipt production node scripts/check-source-reopen-receipt.mjs --repo "$C" --rev "$REV" --json
run check-sources production node scripts/check-sources.mjs --root "$C" --file corpus/SOURCES.md
run check-user-round-contract production node scripts/check-user-round-contract.mjs
run freshness-witness production node scripts/freshness-witness.mjs --rev "$REV"
run round-evidence-audit production node scripts/round-evidence-audit.mjs --rev "$REV" --round 29 --round-cap 24 --json

# ---------- supplementary rows 38-47 (w1 report §3, §3a) ----------
run check-frontier-admission production-live node scripts/check-frontier-admission.mjs --repo "$C" --rev "$REV" --frontier rate-tos-signal --since 2026-10-26 --live --json
run report-contract production-round-29 node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md
run sources-census.sh validate-root-tabi /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
run check-claim-record selftest node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --self-test
run measure-c1-r21 selftest node .ufo/waves/round-21/measure-c1.mjs --selftest
run check-review-chronology selftest node .ufo/waves/round-22/check-review-chronology.mjs --selftest
run measure-c1-r22 selftest node .ufo/waves/round-22/measure-c1.mjs --selftest
run measure-c1-r21 production node .ufo/waves/round-21/measure-c1.mjs "$REV"
run measure-c1-r22 production node .ufo/waves/round-22/measure-c1.mjs "$REV"
run sources-census.sh validate-file-clone /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$C/corpus/SOURCES.md"

echo "matrix rows: $n" >&2
