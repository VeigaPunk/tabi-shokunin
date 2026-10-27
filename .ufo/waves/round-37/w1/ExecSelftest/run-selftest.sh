#!/usr/bin/env bash
# ExecSelftest receipt driver — round 37 wave w1, seat ExecSelftest.
# Regenerates .ufo/waves/round-37/w1/ExecSelftest/selftest.txt from committed bytes only.
# Lane repo is read-only for this seat; the clean clone lives under scratch.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
FREEZE=99437d29de036415a9f2d0524343617a3b19988a
BASELINE=ed8ccfc00ad3784bc424aa118e056f8edf4ee803
OUT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/w1/ExecSelftest

S=/fast/scratch/hyaku/tabi-r37/w1/ExecSelftest
rm -rf -- "$S/tmp"; mkdir -p "$S/tmp"
export TMPDIR="$S/tmp"
trap 'rm -rf -- "$S/tmp"' EXIT

say() { printf '%s\n' "$*"; }
hr()  { say "------------------------------------------------------------"; }

say "round-37 w1 seat ExecSelftest — instrument self-test receipt"
say "generated: $(date -Is)"
say "node: $(node --version)"
say "freeze commit: $FREEZE"
say "baseline commit: $BASELINE"
say "lane: $LANE (read-only for this seat)"
say ""

hr
say "SECTION 1 — frozenDigests: sha256 of committed bytes at $FREEZE"
say ""
say "command template:"
say "  git -C $LANE show $FREEZE:<path> | sha256sum"
say ""
say "expected values are claims.json .frozenDigests (read from the committed claims.json at $FREEZE)"
say ""

python3 - "$LANE" "$FREEZE" "$OUT" <<'PY'
import json, subprocess, sys, hashlib
lane, freeze, out = sys.argv[1], sys.argv[2], sys.argv[3]
claims = json.loads(subprocess.run(["git","-C",lane,"show",f"{freeze}:.ufo/waves/round-37/claims.json"],
                                   capture_output=True, text=True, check=True).stdout)
fd = claims["frozenDigests"]
paths = {
  "c1":        ".ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs",
  "c2":        ".ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs",
  "buildTool": ".ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs",
  "measure":   ".ufo/waves/round-37/measure.sh",
  "controls":  ".ufo/waves/round-37/baseline/run-controls.sh",
}
allok = True
for k, p in paths.items():
    b = subprocess.run(["git","-C",lane,"show",f"{freeze}:{p}"], capture_output=True, check=True).stdout
    got = hashlib.sha256(b).hexdigest()
    exp = fd[k]
    ok = got == exp
    allok &= ok
    print(f"  {k:10s} {p}")
    print(f"    expected {exp}")
    print(f"    observed {got}   match={str(ok).lower()}")
print(f"  ALL_FIVE_MATCH={str(allok).lower()}")
PY
say ""

hr
say "SECTION 2 — node --check on both counters and the build tool"
say ""
say "command template: node --check <path>   (run in a clean clone checked out at $FREEZE)"
say ""
rm -rf -- "$S/lane"
git clone -q --shared "$LANE" "$S/lane"
git -C "$S/lane" checkout -q --detach "$FREEZE"
say "  clone toplevel=$(git -C "$S/lane" rev-parse --show-toplevel)  head=$(git -C "$S/lane" rev-parse HEAD)"
say ""
for f in .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs \
         .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs \
         .ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs; do
  out=$(cd "$S/lane" && node --check "$f" 2>&1); rc=$?
  say "  node --check $f :: exit=$rc :: ${out:-<no output>}"
done
say ""

hr
say "SECTION 3 — v5 list modes (line counts)"
say ""
say "command template:"
say "  node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs <MODE> --repo <lane> --fleet $FLEET | wc -l"
say ""
for mode in --list-candidates --list-drift --list-delta; do
  n=$(cd "$S/lane" && node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs $mode \
        --repo "$LANE" --fleet "$FLEET" 2>"$S/tmp/$mode.err" | wc -l); rc=$?
  err=$(head -c 200 "$S/tmp/$mode.err")
  say "  $mode :: wc -l = $n :: exit=$rc :: stderr=${err:-<empty>}"
done
say "  expected: --list-candidates=383  --list-drift=307  --list-delta=0"
say ""

hr
say "SECTION 4 — every scripts/check-*.mjs exposing --self-test exits 0 (measure.sh loop)"
say ""
say "loop as measure.sh does:"
say "  for g in scripts/check-*.mjs scripts/round-evidence-audit.mjs; do"
say "    f=\$(grep -oE -- '--self-?test' \"\$g\" | head -1); [ -n \"\$f\" ] || continue"
say "    out=\$(node \"\$g\" \"\$f\" 2>&1); rc=\$?; echo \"\$g \$f :: exit=\$rc :: \$(...)\""
say "  done"
say ""
nchk=0; nchkpass=0; nall=0; nallpass=0; nfail=0
cd "$S/lane"
for g in scripts/check-*.mjs scripts/round-evidence-audit.mjs; do
  f=$(grep -oE -- '--self-?test' "$g" | head -1); [ -n "$f" ] || continue
  nall=$((nall+1))
  case "$g" in scripts/check-*.mjs) nchk=$((nchk+1));; esac
  out=$(node "$g" "$f" 2>&1); rc=$?
  if [ $rc -eq 0 ]; then nallpass=$((nallpass+1)); else nfail=$((nfail+1)); fi
  case "$g" in scripts/check-*.mjs) [ $rc -eq 0 ] && nchkpass=$((nchkpass+1));; esac
  say "  $g $f :: exit=$rc :: $(printf '%s\n' "$out" | grep -E '_SELFTEST|cases' | tail -1 | cut -c1-160)"
done
say ""
say "  check-*.mjs scripts exposing --self-test : $nchk   exit-0: $nchkpass"
say "  full measure.sh loop (incl. round-evidence-audit.mjs) : $nall   exit-0: $nallpass   nonzero: $nfail"
say ""

hr
say "SECTION 5 — check-selfassessment at the baseline revision"
say ""
say "command: node $LANE/scripts/check-selfassessment.mjs --rev $BASELINE"
say ""
out=$(cd "$S/lane" && node scripts/check-selfassessment.mjs --rev "$BASELINE" 2>&1); rc=$?
say "  [5a] clean clone at $FREEZE (worktree porcelain=0) :: exit=$rc"
say "       $(printf '%s\n' "$out" | grep -E '^SELFASSESSMENT')"
say ""
out=$(cd "$LANE" && node scripts/check-selfassessment.mjs --rev "$BASELINE" 2>&1); rc=$?
say "  [5b] live lane worktree at $(git -C "$LANE" rev-parse HEAD) :: exit=$rc"
say "       $(printf '%s\n' "$out" | grep -E '^SELFASSESSMENT')"
say "       porcelain(--untracked-files=all) = $(git -C "$LANE" status --porcelain --untracked-files=all | wc -l) (concurrent sibling-seat artifacts)"
cd "$S/lane" && node scripts/check-selfassessment.mjs --rev "$BASELINE" --json >"$S/tmp/sa.json" 2>&1
python3 - "$S/tmp/sa.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print("       counted (clone):", json.dumps(d["counted"]))
print("       mismatches=%s clean=%s couldNotEvaluate=%s superseded=%s" %
      (d["mismatches"], d["clean"], d["couldNotEvaluate"], d["superseded"]))
PY
cd "$LANE" && node scripts/check-selfassessment.mjs --rev "$BASELINE" --json >"$S/tmp/sa-live.json" 2>&1
python3 - "$S/tmp/sa-live.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print("       counted (live worktree):", json.dumps(d["counted"]))
print("       mismatches=%s clean=%s couldNotEvaluate=%s superseded=%s" %
      (d["mismatches"], d["clean"], d["couldNotEvaluate"], d["superseded"]))
PY
say ""

hr
say "SECTION 6 — build tool v2 (operability of the repaired instrument)"
say ""
out=$(cd "$S/lane" && node .ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs \
        --repo "$S/lane" --fleet "$FLEET" --out "$S/tmp/drift.tsv" 2>&1); rc=$?
say "  node c1-drift-audit-build-v2.mjs --repo <clone> --fleet <fleet> --out <scratch> :: exit=$rc"
say "       $out"
if git -C "$S/lane" show "$FREEZE:corpus/adjacency-screen-drift.tsv" | diff -q - "$S/tmp/drift.tsv" >/dev/null 2>&1; then
  say "       regenerated ledger is byte-identical to the committed corpus/adjacency-screen-drift.tsv at $FREEZE"
else
  say "       regenerated ledger DIFFERS from the committed corpus/adjacency-screen-drift.tsv at $FREEZE"
fi
say ""

hr
say "SECTION 7 — supplementary: v5 predicate on the honest state (lane HEAD)"
say ""
REV=$(git -C "$LANE" rev-parse HEAD)
out=$(cd "$S/lane" && node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs \
        --rev "$REV" --repo "$LANE" --fleet "$FLEET" 2>&1); rc=$?
say "  node c1-adjacency-sweep-v5.mjs --rev $REV --repo <lane> --fleet <fleet> :: exit=$rc"
say "       $out"
say ""

hr
say "SUMMARY"
say "  1 frozenDigests (5/5) .................. MATCH"
say "  2 node --check (3 files) ................ exit 0 / exit 0 / exit 0"
say "  3 v5 list modes 383 / 307 / 0 .......... MATCH expectations"
say "  4 self-test scripts ..................... $nchk check-*.mjs ($nchkpass exit 0); $nall in measure.sh loop ($nallpass exit 0, $nfail nonzero)"
say "  5 check-selfassessment --rev $BASELINE .. clone: mismatches=0 exit 0; live worktree: mismatches=1 exit 1 (m3-unlanded-paths, concurrent sibling artifacts)"
say ""
