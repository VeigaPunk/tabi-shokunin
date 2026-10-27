#!/usr/bin/env bash
# ExecPinsBinding — supplementary: C2 (v3) state-vs-tree proof, with the digest labels
# computed correctly (git cat-file ALSO honours replace refs, so the honest bytes must
# be read with GIT_NO_REPLACE_OBJECTS=1).
#
#   1. clean clone at master: record tree oid, HEAD, replace-ref list, receipt bytes
#   2. add refs/replace/<old> -> <new> in the clone's GIT DIR only:
#        - no commit, no tree object changed, worktree still clean
#      then re-record: tree oid, HEAD, replace-ref list
#   3. show the graft is LIVE and would have laundered the receipt:
#        git show <rev>:<path>                     -> forged bytes   (graft honoured)
#        GIT_NO_REPLACE_OBJECTS=1 git show <rev>:<path> -> honest bytes
#        GIT_NO_REPLACE_OBJECTS=1 git cat-file blob <old> -> honest bytes
#        git cat-file blob <new>                  -> forged bytes
#   4. run the frozen v3 -> exit 2, refs/replace refusal
#   5. remove the replace ref -> v3 runs again (control: the refusal is caused by the
#      ref state alone)
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
V3="$SEAT/counters/c2-firefox-bidi-v3.mjs"
EV="$SEAT/evidence"
RECEIPT=corpus/evidence/round-35/bidi-firefox/receipt.json

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }

D=$(mktemp -d -p "$S" v3c.XXXXXX)
git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FATAL toplevel"; exit 9; }
git -C "$D" checkout -q master
M=$(git -C "$D" rev-parse master)

say "clone=$D master=$M"
say "BEFORE replace ref:"
say "  tree at master : $(git -C "$D" rev-parse "$M^{tree}")"
say "  HEAD           : $(git -C "$D" rev-parse HEAD)"
say "  replace refs   : [$(git -C "$D" for-each-ref --format='%(refname)' refs/replace/)]"
say "  worktree status: [$(git -C "$D" status --porcelain)]"

OLD=$(git -C "$D" rev-parse "$M:$RECEIPT")
python3 - "$D" "$RECEIPT" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
rec = json.loads((d / rel).read_text())
for o in rec['runs'][0]['observed']:
    if o['step'] == 'captureScreenshot':
        o['value']['sha256'] = ('0' if o['value']['sha256'][0] != '0' else '1') + o['value']['sha256'][1:]
(out / 'forged-receipt.json').write_text(json.dumps(rec, indent=1) + '\n')
PY
NEW=$(git -C "$D" hash-object -w "$S/forged-receipt.json")
git -C "$D" replace "$OLD" "$NEW"

say "AFTER adding refs/replace/$OLD -> $NEW (git dir only, no commit):"
say "  tree at master : $(git -C "$D" rev-parse "$M^{tree}")"
say "  HEAD           : $(git -C "$D" rev-parse HEAD)"
say "  replace refs   : [$(git -C "$D" for-each-ref --format='%(refname)' refs/replace/)]"
say "  worktree status: [$(git -C "$D" status --porcelain)]"
say "  tree unchanged vs BEFORE: $( [ "$(git -C "$D" rev-parse "$M^{tree}")" = "0c408589e0b0831dba858aa4419a90cc0e14261f" ] && echo YES || echo 'see log' )"
say ""
say "GRAFT LIVENESS (receipt path):"
say "  git show <rev>:<path>                       -> $(git -C "$D" show "$M:$RECEIPT" | sha256sum | cut -d' ' -f1)   (graft honoured)"
say "  GIT_NO_REPLACE_OBJECTS=1 git show           -> $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$RECEIPT" | sha256sum | cut -d' ' -f1)   (honest)"
say "  GIT_NO_REPLACE_OBJECTS=1 git cat-file blob OLD -> $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" cat-file blob "$OLD" | sha256sum | cut -d' ' -f1)   (honest)"
say "  git cat-file blob NEW                      -> $(git -C "$D" cat-file blob "$NEW" | sha256sum | cut -d' ' -f1)   (forged)"
say "  (lane's committed receipt blob sha256      -> $(git -C "$LANE" show "$M:$RECEIPT" | sha256sum | cut -d' ' -f1))"

out=$(node "$V3" --rev "$M" --repo "$D" --json 2>&1); rc=$?
say ""
say "v3 WITH replace ref: exit=$rc"
printf '%s\n' "$out" | tail -3
printf '%s\n' "$out" > "$EV/V3-C-replace-ref-state.out"
printf '%s\n' "$rc" > "$EV/V3-C-replace-ref-state.exit"

# control: remove the ref -> v3 must run again
git -C "$D" update-ref -d "refs/replace/$OLD"
say ""
say "replace ref removed; replace refs now: [$(git -C "$D" for-each-ref --format='%(refname)' refs/replace/)]"
out=$(node "$V3" --rev "$M" --repo "$D" --json 2>&1); rc=$?
say "v3 WITHOUT replace ref: exit=$rc"
printf '%s\n' "$out" > "$EV/V3-D-replace-ref-removed.out"
printf '%s\n' "$rc" > "$EV/V3-D-replace-ref-removed.exit"
python3 -c "
import json,sys
try:
    d=json.load(open('$EV/V3-D-replace-ref-removed.out'))
    print('  predicate',d['predicate'],'admitted',d['admitted'],'failing',d['failing'],'survivors',d['survivors'],'egress',d['egressNonLoopback'])
except Exception as e:
    print('  parse:',e)
"
