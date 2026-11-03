#!/usr/bin/env bash
# gate/run-fixtures.sh — R56Gate self-test driver for scripts/check-cited-receipts.mjs
#
# Builds ONE sandbox git fixture (mktemp -d, its own toplevel, asserted before the
# first commit), lays the four fixture documents and the receipts they cite into it
# at the same repo-relative paths the lane uses, commits, then runs the gate at that
# commit once per case.
#
# Writes only under $S (scratch) and, when --keep is absent, nothing survives.
# usage: bash gate/run-fixtures.sh [--keep]
set -u

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FIX=$LANE/.ufo/waves/round-56/gate-fixtures
GATE_MJS=$LANE/scripts/check-cited-receipts.mjs
BASE=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r56/R56Gate
mkdir -p "$BASE"
KEEP=${1:-}
trap '[ "$KEEP" = "--keep" ] || rm -rf -- "$D"' EXIT
D=$(mktemp -d -p "$BASE" fixture.XXXXXX) || { echo "FIXTURE-SETUP-FAIL mktemp"; exit 90; }

git -C "$D" init -q || { echo "FIXTURE-SETUP-FAIL git-init"; exit 90; }
TOP=$(git -C "$D" rev-parse --show-toplevel)
[ "$TOP" = "$D" ] || { echo "FIXTURE-SETUP-FAIL toplevel=$TOP want=$D"; exit 90; }
echo "fixture=$D"
echo "toplevel-assert=$TOP (equals fixture)"

REL=.ufo/waves/round-56
mkdir -p "$D/$REL/measure"
cp "$FIX"/a-mixed.md "$FIX"/b-present-only.md "$FIX"/c-trailing-punct.md \
   "$FIX"/d-code-fence.md "$D/$REL/gate-fixtures/" 2>/dev/null || {
  mkdir -p "$D/$REL/gate-fixtures"
  cp "$FIX"/*.md "$D/$REL/gate-fixtures/"
}
printf 'present receipt\n' > "$D/$REL/measure/present.txt"
printf 'second receipt\n' > "$D/$REL/measure/second.txt"
git -C "$D" add -- . || { echo "FIXTURE-SETUP-FAIL git-add"; exit 90; }
git -C "$D" -c user.name=TabiFixture -c user.email=tabi-fixture@example.invalid \
  commit -q --no-verify -m 'gate fixtures' || { echo "FIXTURE-SETUP-FAIL git-commit"; exit 90; }
REV=$(git -C "$D" rev-parse HEAD)
echo "fixture-rev=$REV"
echo "committed-tree:"
git -C "$D" ls-tree -r --name-only "$REV" | sed 's/^/  /'
echo

FAILN=0
# Assertion helper: compare the gate's own JSON fields against the expectation.
# $1 name  $2 expected exit  $3 expected distinct-missing JSON array  $4 expected checked count
# $5 doc, $6 round (default 56)
run() {
  local name=$1 expect=$2 wantMissing=$3 wantChecked=$4 doc=$5
  local rnd=${6:-56}
  local out code gotMissing gotChecked
  out=$(node "$GATE_MJS" --repo "$D" --round "$rnd" --json --doc "$REV:$doc" 2>"$D/$name.err")
  code=$?
  gotMissing=$(printf '%s' "$out" | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)["missing"]))' 2>/dev/null || echo '<PARSE-FAIL>')
  gotChecked=$(printf '%s' "$out" | python3 -c 'import json,sys; print(json.load(sys.stdin)["checked"])' 2>/dev/null || echo '<PARSE-FAIL>')
  local verdict=PASS
  [ "$code" = "$expect" ] || verdict=FAIL
  [ "$gotMissing" = "$wantMissing" ] || verdict=FAIL
  [ "$gotChecked" = "$wantChecked" ] || verdict=FAIL
  [ "$verdict" = PASS ] || FAILN=$((FAILN+1))
  printf '=== CASE %s\n' "$name"
  printf 'cmd: node scripts/check-cited-receipts.mjs --repo <fixture> --round %s --json --doc %s:%s\n' "$rnd" "$REV" "$doc"
  printf 'exit=%d expect=%s | missing=%s expect=%s | checked=%s expect=%s | %s\n' \
    "$code" "$expect" "$gotMissing" "$wantMissing" "$gotChecked" "$wantChecked" "$verdict"
  [ -s "$D/$name.err" ] && printf 'stderr: %s\n' "$(cat "$D/$name.err")"
  printf 'stdout: %s\n\n' "$out"
}

run A-mixed          1 '[".ufo/waves/round-56/measure/missing.txt"]'             2 "$REL/gate-fixtures/a-mixed.md"
run B-present-only   0 '[]'                                                     4 "$REL/gate-fixtures/b-present-only.md"
run C-trailing-punct 1 '[".ufo/waves/round-56/measure/missing.txt"]'             7 "$REL/gate-fixtures/c-trailing-punct.md"
run D-code-fence     1 '[".ufo/waves/round-56/measure/missing-fenced.txt"]'      3 "$REL/gate-fixtures/d-code-fence.md"
run E-round-55       0 '[]'                                                     0 "$REL/gate-fixtures/e-round-prefix.md" 55
run E-round-56       0 '[]'                                                     1 "$REL/gate-fixtures/e-round-prefix.md" 56

# usage / unreadable-doc classes (exit 2)
chk2() {
  local name=$1; shift
  local code
  node "$GATE_MJS" "$@" >/dev/null 2>&1
  code=$?
  printf '=== CASE %s\nexit=%d expect=2 %s\n\n' "$name" "$code" "$([ "$code" = 2 ] && echo PASS || echo FAIL)"
  [ "$code" = 2 ] || FAILN=$((FAILN+1))
}
chk2 F-usage-missing-round --repo "$D" --doc "$REV:$REL/gate-fixtures/b-present-only.md"
chk2 G-unreadable-doc --repo "$D" --round 56 --doc "$REV:$REL/gate-fixtures/absent.md"
chk2 H-usage-doc-no-colon --repo "$D" --round 56 --doc "$REL/gate-fixtures/b-present-only.md"
chk2 I-usage-bad-rev --repo "$D" --round 56 --doc "0000000000000000000000000000000000000000:$REL/gate-fixtures/b-present-only.md"
chk2 J-usage-no-doc --repo "$D" --round 56

printf 'fixture-cases-failing=%d\n' "$FAILN"
exit "$FAILN"
