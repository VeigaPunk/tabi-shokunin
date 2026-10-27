#!/usr/bin/env bash
# ExecPinsBinding — supplementary falsifier: a replace graft hidden OUTSIDE the default
# namespace, with the caller exporting GIT_REPLACE_REF_BASE.
#
# Git honours GIT_REPLACE_REF_BASE to move the replacement namespace away from
# refs/replace/.  v3 refuses a clone by enumerating refs/replace/ — so a graft parked in a
# custom namespace would NOT be enumerated.  The question this leg answers is the C2 kill
# rule's second half: does v3 then READ THROUGH that graft?
#
#   V3-F / V5-F  graft parked under $GIT_REPLACE_REF_BASE, caller exports the variable:
#                 - is the graft honoured by a plain `git show` in the clone?  (attack live)
#                 - does the counter honour it?                           (attack effective)
#                 - is the clone refused?                                   (clone state)
#
# Both counters build their git env from scratch (PATH/HOME/TMPDIR/GIT_CONFIG_NOSYSTEM/
# GIT_CONFIG_GLOBAL/LC_ALL/GIT_NO_REPLACE_OBJECTS=1) and never spread process.env, so the
# caller's GIT_REPLACE_REF_BASE cannot reach them, and GIT_NO_REPLACE_OBJECTS=1 makes the
# graft inert for every read they make.  This leg measures that rather than assuming it.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
V5="$SEAT/counters/c1-adjacency-sweep-v5.mjs"
V3="$SEAT/counters/c2-firefox-bidi-v3.mjs"
EV="$SEAT/evidence"
PINS=.ufo/waves/round-36/baseline/c1-delta-pins.json
RECEIPT=corpus/evidence/round-35/bidi-firefox/receipt.json

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }
export GIT_REPLACE_REF_BASE=refs/evil-replace/
say "caller exports GIT_REPLACE_REF_BASE=$GIT_REPLACE_REF_BASE"

D=$(mktemp -d -p "$S" v5f.XXXXXX)
git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FATAL toplevel"; exit 9; }
git -C "$D" checkout -q master
M=$(git -C "$D" rev-parse master)

# graft the pins blob into the custom namespace
OLDP=$(git -C "$D" rev-parse "$M:$PINS")
python3 - "$D" "$PINS" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
old = json.loads((d / rel).read_text())
new = dict(sorted(old.items())); new['zzz-forged-lane'] = '0' * 40
(out / 'forged-pins.json').write_text(json.dumps(new, indent=1) + '\n')
PY
NEWP=$(git -C "$D" hash-object -w "$S/forged-pins.json")
git -C "$D" update-ref "refs/evil-replace/$OLDP" "$NEWP"

# and graft the receipt blob into the custom namespace too
OLDR=$(git -C "$D" rev-parse "$M:$RECEIPT")
python3 - "$D" "$RECEIPT" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
rec = json.loads((d / rel).read_text())
for o in rec['runs'][0]['observed']:
    if o['step'] == 'captureScreenshot':
        o['value']['sha256'] = ('0' if o['value']['sha256'][0] != '0' else '1') + o['value']['sha256'][1:]
(out / 'forged-receipt2.json').write_text(json.dumps(rec, indent=1) + '\n')
PY
NEWR=$(git -C "$D" hash-object -w "$S/forged-receipt2.json")
git -C "$D" update-ref "refs/evil-replace/$OLDR" "$NEWR"

say "clone=$D master=$M"
say "refs/replace/       : [$(git -C "$D" for-each-ref --format='%(refname)' refs/replace/)]"
say "refs/evil-replace/  : [$(git -C "$D" for-each-ref --format='%(refname)' refs/evil-replace/)]"
say "  (git resolves the custom base: GIT_REPLACE_REF_BASE=$GIT_REPLACE_REF_BASE)"
say "  git show pins    (custom base honoured): $(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "  git show receipt (custom base honoured): $(git -C "$D" show "$M:$RECEIPT" | sha256sum | cut -d' ' -f1)"
say "  honest pins blob sha256                : $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "  honest receipt blob sha256             : $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$RECEIPT" | sha256sum | cut -d' ' -f1)"
say "  tree at master                         : $(git -C "$D" rev-parse "$M^{tree}")"
say "  worktree status                        : [$(git -C "$D" status --porcelain)]"

out=$(node "$V5" --rev "$M" --repo "$D" --fleet "$FLEET" --json 2>&1); rc=$?
say ""
say "v5 with the custom-namespace graft: exit=$rc"
printf '%s\n' "$out" > "$EV/V5-F-custom-replace-namespace.out"
printf '%s\n' "$rc" > "$EV/V5-F-custom-replace-namespace.exit"
python3 -c "
import json
try:
    d=json.load(open('$EV/V5-F-custom-replace-namespace.out'))
    print('  predicate',d['predicate'],'deltaPinsSha256',d['deltaPinsSha256'])
except Exception:
    print('  (non-JSON):'); print(open('$EV/V5-F-custom-replace-namespace.out').read().strip()[-300:])
"

out=$(node "$V3" --rev "$M" --repo "$D" --json 2>&1); rc=$?
say ""
say "v3 with the custom-namespace graft: exit=$rc"
printf '%s\n' "$out" > "$EV/V3-F-custom-replace-namespace.out"
printf '%s\n' "$rc" > "$EV/V3-F-custom-replace-namespace.exit"
python3 -c "
import json
try:
    d=json.load(open('$EV/V3-F-custom-replace-namespace.out'))
    print('  predicate',d['predicate'],'admitted',d['admitted'],'failing',d['failing'],'survivors',d['survivors'],'egress',d['egressNonLoopback'],'receiptFinding',d['receiptFinding'])
except Exception:
    print('  (non-JSON):'); print(open('$EV/V3-F-custom-replace-namespace.out').read().strip()[-300:])
"
