#!/usr/bin/env bash
# ExecPinsBinding — supplementary: WHICH layer defeats a non-default-namespace graft, and
# is the tree at REV provably unchanged?
#
# Part 1 — layer attribution for a graft parked OUTSIDE refs/replace/:
#   a) plain `git show` with GIT_REPLACE_REF_BASE set          -> graft HONOURED (attack live)
#   b) GIT_NO_REPLACE_OBJECTS=1 git show, same base            -> graft INERT
#   c) git show with the base unset, graft in refs/evil-replace/ -> graft INERT (wrong base)
#   The counters build their git env from scratch and never spread process.env, so they
#   get (c) AND (b): no GIT_REPLACE_REF_BASE, plus GIT_NO_REPLACE_OBJECTS=1.  Either
#   alone defeats the graft; the counter has both.
#
# Part 2 — tree identity at REV before/after the default-namespace replace ref:
#   full `git ls-tree -r` listing hashed, tree oid, HEAD, and the worktree status — so the
#   claim "no tree object changed" is measured, not asserted.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
EV="$SEAT/evidence"
PINS=.ufo/waves/round-36/baseline/c1-delta-pins.json

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }

D=$(mktemp -d -p "$S" layer.XXXXXX)
git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FATAL toplevel"; exit 9; }
git -C "$D" checkout -q master
M=$(git -C "$D" rev-parse master)

OLDP=$(git -C "$D" rev-parse "$M:$PINS")
python3 - "$D" "$PINS" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
old = json.loads((d / rel).read_text())
new = dict(sorted(old.items())); new['zzz-forged-lane'] = '0' * 40
(out / 'forged-pins.json').write_text(json.dumps(new, indent=1) + '\n')
PY
NEWP=$(git -C "$D" hash-object -w "$S/forged-pins.json")

say "=== Part 1: layer attribution ==="
say "grafted pins blob $OLDP -> $NEWP"

# (b1) graft in the DEFAULT namespace
git -C "$D" update-ref "refs/replace/$OLDP" "$NEWP"
say "a) default namespace refs/replace/, plain git show          : $(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "b) default namespace, GIT_NO_REPLACE_OBJECTS=1 git show    : $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
git -C "$D" update-ref -d "refs/replace/$OLDP"

# (c) graft OUTSIDE the default namespace, base points at it
git -C "$D" update-ref "refs/evil-replace/$OLDP" "$NEWP"
say "c) custom namespace, base=refs/evil-replace/, git show      : $(GIT_REPLACE_REF_BASE=refs/evil-replace/ git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "d) custom namespace, base=refs/evil-replace/, GIT_NO_REPLACE_OBJECTS=1 : $(GIT_REPLACE_REF_BASE=refs/evil-replace/ GIT_NO_REPLACE_OBJECTS=1 git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "e) custom namespace, base UNSET, git show (counter's env)  : $(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "f) frozen digest                                           : 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655"
say "   (the counters' env: PATH/HOME/TMPDIR/GIT_CONFIG_NOSYSTEM/GIT_CONFIG_GLOBAL/LC_ALL + GIT_NO_REPLACE_OBJECTS=1; no GIT_REPLACE_REF_BASE)"

say ""
say "=== Part 2: tree identity at REV, default-namespace replace ref ==="
git -C "$D" update-ref -d "refs/evil-replace/$OLDP"
BEFORE_TREE=$(git -C "$D" rev-parse "$M^{tree}")
BEFORE_LS=$(git -C "$D" ls-tree -r "$M" | sha256sum | cut -d' ' -f1)
BEFORE_HEAD=$(git -C "$D" rev-parse HEAD)
BEFORE_STATUS=$(git -C "$D" status --porcelain)
git -C "$D" update-ref "refs/replace/$OLDP" "$NEWP"
AFTER_TREE=$(git -C "$D" rev-parse "$M^{tree}")
AFTER_LS=$(git -C "$D" ls-tree -r "$M" | sha256sum | cut -d' ' -f1)
AFTER_HEAD=$(git -C "$D" rev-parse HEAD)
AFTER_STATUS=$(git -C "$D" status --porcelain)
say "tree oid   before=$BEFORE_TREE after=$AFTER_TREE  identical=$([ "$BEFORE_TREE" = "$AFTER_TREE" ] && echo YES || echo NO)"
say "ls-tree -r digest before=$BEFORE_LS after=$AFTER_LS  identical=$([ "$BEFORE_LS" = "$AFTER_LS" ] && echo YES || echo NO)"
say "HEAD       before=$BEFORE_HEAD after=$AFTER_HEAD  identical=$([ "$BEFORE_HEAD" = "$AFTER_HEAD" ] && echo YES || echo NO)"
say "worktree status before=[$BEFORE_STATUS] after=[$AFTER_STATUS]"
say "reflog/refs changed: replace refs = [$(git -C "$D" for-each-ref --format='%(refname)' refs/replace/)]"
say ""
say "=> the only thing that changed is the clone's REF STATE; every tree object, the"
say "   commit, and the worktree are byte-identical."
