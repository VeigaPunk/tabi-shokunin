#!/usr/bin/env bash
# ExecPinsBinding — supplementary: C1 (v5) replace-ref depth leg.
#
# v5's pins read is `git show <REV>:<path>` with GIT_NO_REPLACE_OBJECTS=1 on every git
# call.  This leg grafts the pins blob in the clone's GIT DIR (no commit, no tree change)
# and shows v5 still measures the frozen digest and still returns predicate true — the
# pins binding is to the blob AT REV under replace-objects disabled, so neither a
# worktree edit nor a git-dir graft can move it.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
V5="$SEAT/counters/c1-adjacency-sweep-v5.mjs"
EV="$SEAT/evidence"
PINS=.ufo/waves/round-36/baseline/c1-delta-pins.json

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }

D=$(mktemp -d -p "$S" v5r.XXXXXX)
git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FATAL toplevel"; exit 9; }
git -C "$D" checkout -q master
M=$(git -C "$D" rev-parse master)

OLD=$(git -C "$D" rev-parse "$M:$PINS")
python3 - "$D" "$PINS" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
old = json.loads((d / rel).read_text())
new = dict(sorted(old.items()))
new['zzz-forged-lane'] = '0' * 40
(out / 'forged-pins.json').write_text(json.dumps(new, indent=1) + '\n')
PY
NEW=$(git -C "$D" hash-object -w "$S/forged-pins.json")
git -C "$D" replace "$OLD" "$NEW"

say "clone=$D master=$M"
say "replace ref: refs/replace/$OLD -> $NEW"
say "  tree at master : $(git -C "$D" rev-parse "$M^{tree}")"
say "  HEAD           : $(git -C "$D" rev-parse HEAD)"
say "  worktree status: [$(git -C "$D" status --porcelain)]"
say "  git show (graft honoured)        : $(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "  GIT_NO_REPLACE_OBJECTS=1 git show: $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "  frozen digest                   : 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655"

out=$(node "$V5" --rev "$M" --repo "$D" --fleet "$FLEET" --json 2>&1); rc=$?
say ""
say "v5 WITH the pins graft in the clone's git dir: exit=$rc"
printf '%s\n' "$out" > "$EV/V5-E-replace-ref-on-pins.out"
printf '%s\n' "$rc" > "$EV/V5-E-replace-ref-on-pins.exit"
python3 -c "
import json
try:
    d=json.load(open('$EV/V5-E-replace-ref-on-pins.out'))
    print('  predicate',d['predicate'],'deltaPinsSha256',d['deltaPinsSha256'],'drift.total',d['drift']['total'])
except Exception as e:
    print('  (non-JSON output)')
"
printf '%s\n' "$out" | tail -2
