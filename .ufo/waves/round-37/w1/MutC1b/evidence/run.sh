#!/usr/bin/env bash
# MutC1b — mutation-test the C1 v5 counter's unchanged v4 semantics (regression guard).
# Same bounded detector (evaluate() at REV, honest + fixture trees) on pristine/mutant bytes.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/MutC1b
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
REV=ed8ccfc00ad3784bc424aa118e056f8edf4ee803
export TMPDIR="$S/tmp" GIT_CONFIG_NOSYSTEM=1
mkdir -p "$S/out"

run_one() { # tag counter repo rev
  local tag=$1 ctr=$2 repo=$3 rev=$4
  local rc=0
  TMPDIR="$S/tmp" node "$ctr" --rev "$rev" --repo "$repo" --fleet "$FLEET" --json \
    > "$S/out/${tag}.json" 2> "$S/out/${tag}.stderr" || rc=$?
  python3 - "$tag" "$rc" "$ctr" "$repo" <<'PY' >> "$S/out/results.tsv"
import json, sys, hashlib, pathlib
tag, rc, ctr, repo = sys.argv[1:5]
body = pathlib.Path(ctr).read_bytes()
sha = hashlib.sha256(body).hexdigest()
d = None
try:
    d = json.loads(open(sys.argv[0] if False else f"{tag}", ).read()) if False else None
except Exception:
    pass
import os
out = os.environ.get('S_OUT', '')
try:
    d = json.load(open(f"/fast/scratch/hyaku/tabi-r37/w1/MutC1b/out/{tag}.json"))
    row = [tag, str(rc), sha[:16], str(d['predicate']),
           d['adjacency']['verdict'], str(d['completeness']['unaccounted']),
           str(d['drift']['total']), str(d['drift']['auditCoverage']),
           str(len(d['drift']['auditFindings'])), str(len(d['drift']['staleFindings'])),
           str(d['delta']['total']), str(d['delta']['unaccounted']),
           str(len(d['delta']['screenFindings'])),
           ';'.join(sorted({f['reason'] for f in d['delta']['screenFindings'] + d['drift']['auditFindings']})) or '-']
except Exception as e:
    err = ''
    try:
        err = open(f"/fast/scratch/hyaku/tabi-r37/w1/MutC1b/out/{tag}.stderr").read().strip().replace('\t', ' ')[:120]
    except Exception:
        pass
    row = [tag, str(rc), sha[:16], 'REFUSED', '-', '-', '-', '-', '-', '-', '-', '-', '-', err or repr(e)[:100]]
print('\t'.join(row))
PY
}

: > "$S/out/results.tsv"
printf 'tag\texit\tsha256_16\tpredicate\tadj\tcomp.unacc\tdrift.total\tcover\tauditF\tstaleF\tdelta.total\tdelta.unacc\tdeltaSF\tfinding-reasons\n' > "$S/out/results.header"

# ---- fixture B: truthful decoy-token moved note (run-controls.sh recipe) ----
B="$S/B"; rm -rf "$B"
git clone -q --shared "$LANE" "$B" || exit 9
[ "$(git -C "$B" rev-parse --show-toplevel)" = "$B" ] || exit 9
git -C "$B" checkout -q "$REV" || exit 9
N_SUB=$(python3 -c "
import pathlib, sys
p = pathlib.Path('$B') / 'corpus/adjacency-screen-drift.tsv'
ls = p.read_text().split('\n')
n = 0
for i, l in enumerate(ls):
    if l.endswith('\tmoved\tverbatim at :748'):
        ls[i] = l.replace('\tmoved\tverbatim at :748', '\tmoved\tpin :585 moved verbatim at :748')
        n += 1
assert n == 1, f'expected exactly 1 decoy target row, got {n}'
p.write_text('\n'.join(ls))
print(n)
") || exit 9
git -C "$B" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: decoy-token moved note' || exit 9
RB=$(git -C "$B" rev-parse HEAD)

# ---- fixture E: junk delta-screen row on the honest tree ----
E="$S/E"; rm -rf "$E"
git clone -q --shared "$LANE" "$E" || exit 9
[ "$(git -C "$E" rev-parse --show-toplevel)" = "$E" ] || exit 9
git -C "$E" checkout -q "$REV" || exit 9
python3 -c "
import pathlib
p = pathlib.Path('$E') / 'corpus/adjacency-screen-delta.tsv'
p.write_text('sibling_ref\treason\tsurface\tquote\tnote\nkaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:SKILL.md:585\tnot-browser-sense\t-\tjunk\t-\n')
" || exit 9
git -C "$E" add corpus/adjacency-screen-delta.tsv || exit 9
git -C "$E" -c user.name=fixture -c user.email=fixture@local commit -q -m 'fixture: junk delta-screen row citing a real candidate ref' || exit 9
RE=$(git -C "$E" rev-parse HEAD)
echo "fixtures: decoy-substitutions=$N_SUB RB=$RB RE=$RE" | tee "$S/out/fixtures.txt"

# ---- honest tree runs (repo = lane worktree, same as frozen J3 methodology) ----
run_one honest-pristine  "$S/pristine.mjs" "$LANE" "$REV"
run_one honest-m1        "$S/m1.mjs"       "$LANE" "$REV"
run_one honest-m2        "$S/m2.mjs"       "$LANE" "$REV"
run_one honest-m3        "$S/m3.mjs"       "$LANE" "$REV"
run_one honest-m4        "$S/m4.mjs"       "$LANE" "$REV"
cp "$S/pristine.mjs" "$S/restored.mjs"
run_one honest-restored  "$S/restored.mjs" "$LANE" "$REV"

# ---- fixture B runs: pristine must reproduce c1r37-J2-decoy-note-v5 (exit 0) ----
run_one decoy-pristine   "$S/pristine.mjs" "$B" "$RB"
run_one decoy-m3         "$S/m3.mjs"       "$B" "$RB"

# ---- fixture E runs: pristine must refuse the junk row (exit 1) ----
run_one junk-pristine    "$S/pristine.mjs" "$E" "$RE"
run_one junk-m4          "$S/m4.mjs"       "$E" "$RE"

cat "$S/out/results.header" "$S/out/results.tsv"
echo "RB=$RB RE=$RE" > "$S/out/fixture-revs.txt"
sha256sum "$S"/*.mjs > "$S/out/counter-hashes.txt"
diff -u "$S/pristine.mjs" "$S/m1.mjs" > "$S/out/m1.diff" || true
diff -u "$S/pristine.mjs" "$S/m2.mjs" > "$S/out/m2.diff" || true
diff -u "$S/pristine.mjs" "$S/m3.mjs" > "$S/out/m3.diff" || true
diff -u "$S/pristine.mjs" "$S/m4.mjs" > "$S/out/m4.diff" || true
sha256sum "$LANE/.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs" >> "$S/out/counter-hashes.txt"
