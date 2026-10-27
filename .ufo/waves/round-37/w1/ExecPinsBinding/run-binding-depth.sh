#!/usr/bin/env bash
# ExecPinsBinding — B1 binding-depth receipt driver (tabi round 37, wave w1).
#
# Counter bytes are the FROZEN bytes from commit 99437d29de036415a9f2d0524343617a3b19988a,
# extracted into ./counters/ (digests verified against claims.json frozenDigests.c1/.c2).
#
# Question A (C1 / v5): does the frozen delta-pins digest check read the blob AT REV,
# or the worktree file?
#   V5-L  literal `--rev master`                      -> record (counter demands 40-hex)
#   V5-0  clean clone at master                       -> expect exit 0, predicate true
#   V5-1  WORKTREE pins rewritten, uncommitted        -> expect exit 0, predicate true
#         (worktree bytes != REV bytes: the worktree is invisible)
#   V5-2  same rewrite COMMITTED; run at the new commit-> expect exit 2, digest refusal
#   V5-3  run at the OLD commit (branch tip moved on) -> expect exit 0, predicate true
#         (binding is to REV, not to the branch tip)
#   V5-4  worktree restored to the FROZEN bytes, run at the rewritten commit
#         -> expect exit 2, and the quoted digest must be the REWRITTEN blob's
#            digest => the digest was taken from the committed blob AT REV.
#
# Question B (C2 / v3): is the replace-ref refusal about the clone STATE, or about a
# tree change?
#   V3-L  literal `--rev master`                      -> record
#   V3-A  clean clone at master, no replace ref       -> expect NO refs/replace refusal
#   V3-B  same clone + refs/replace/<sha> in its GIT DIR only (no commit, no tree
#         object changed, worktree clean)             -> expect exit 2, refs/replace refusal
#   V3-C  the graft is live: `git show` WITHOUT GIT_NO_REPLACE_OBJECTS returns the
#         forged receipt bytes; WITH it, the honest bytes.  The refusal is therefore
#         about the clone's ref state, not about a tree difference.
#
# Every git call names -C "$D"; the fixture clones live under the seat scratch root.
# The lane and every sibling repo are read-only here.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
V5="$SEAT/counters/c1-adjacency-sweep-v5.mjs"
V3="$SEAT/counters/c2-firefox-bidi-v3.mjs"
EV="$SEAT/evidence"
PINS=.ufo/waves/round-36/baseline/c1-delta-pins.json
FROZEN_PINS_SHA=810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }
hr()  { printf '\n=== %s ===\n' "$*"; }

run() { # label cmd...
  local label=$1; shift
  local out rc
  out=$("$@" 2>&1); rc=$?
  printf '### %s exit=%s\n' "$label" "$rc"
  printf '%s\n' "$out"
  printf '### end %s\n\n' "$label"
  printf '%s\n' "$out" > "$EV/$label.out"
  printf '%s\n' "$rc" > "$EV/$label.exit"
}

say "=== ExecPinsBinding B1 binding-depth receipt ==="
say "date: $(date -Is)"
say "node: $(node --version)  git: $(git --version)"
say "freeze commit: 99437d29de036415a9f2d0524343617a3b19988a"
say "v5 sha256: $(sha256sum "$V5" | cut -d' ' -f1)"
say "v3 sha256: $(sha256sum "$V3" | cut -d' ' -f1)"
say "frozen delta-pins digest (v5 DELTA_PINS_SHA256): $FROZEN_PINS_SHA"

# ---------------------------------------------------------------- C1 / v5 legs
hr "C1 (v5) — fixture clone"
D1=$(mktemp -d -p "$S" c1clone.XXXXXX)
git clone -q --shared "$LANE" "$D1"
[ "$(git -C "$D1" rev-parse --show-toplevel)" = "$D1" ] || { echo "FATAL: toplevel mismatch"; exit 9; }
git -C "$D1" checkout -q master
M1=$(git -C "$D1" rev-parse master)
say "clone=$D1 toplevel=$(git -C "$D1" rev-parse --show-toplevel) master=$M1"

run V5-L-master-literal node "$V5" --rev master --repo "$D1" --fleet "$FLEET" --json
run V5-0-clean-at-master node "$V5" --rev "$M1" --repo "$D1" --fleet "$FLEET" --json

# V5-1: rewrite the WORKTREE pins file, uncommitted.
python3 - "$D1" "$PINS" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]
p = d / rel
old = json.loads(p.read_text())
p.write_text(json.dumps(dict(sorted(old.items())), indent=1) + '\n')
print('worktree pins rewritten (keys sorted, indent=1) — semantically identical, different bytes')
PY
say "worktree pins sha256: $(sha256sum "$D1/$PINS" | cut -d' ' -f1)"
say "REV blob  pins sha256: $(git -C "$D1" show "$M1:$PINS" | sha256sum | cut -d' ' -f1)"
say "git status: [$(git -C "$D1" status --porcelain)]"
run V5-1-worktree-dirty-at-REV node "$V5" --rev "$M1" --repo "$D1" --fleet "$FLEET" --json

# V5-2: commit the rewrite; run at the new commit.
git -C "$D1" add -A
git -C "$D1" commit -q -m 'fixture: rewrite delta pins bytes (unfrozen)'
M2=$(git -C "$D1" rev-parse HEAD)
REWRITTEN_SHA=$(git -C "$D1" show "$M2:$PINS" | sha256sum | cut -d' ' -f1)
say "committed rewrite -> $M2 ; tree=$(git -C "$D1" rev-parse "$M2^{tree}")"
say "pins blob sha256 at M2: $REWRITTEN_SHA"
run V5-2-committed-at-new-commit node "$V5" --rev "$M2" --repo "$D1" --fleet "$FLEET" --json

# V5-3: run at the OLD commit while the branch tip is the rewritten one.
say "branch tip now: $(git -C "$D1" rev-parse master)  (worktree == M2 tree)"
run V5-3-old-commit-branch-tip-moved node "$V5" --rev "$M1" --repo "$D1" --fleet "$FLEET" --json

# V5-4: restore the FROZEN bytes into the worktree, run at the rewritten commit.
git -C "$D1" checkout -q "$M1" -- "$PINS"
say "worktree pins sha256 (restored to frozen): $(sha256sum "$D1/$PINS" | cut -d' ' -f1)"
say "M2 blob  pins sha256 (rewritten):          $REWRITTEN_SHA"
run V5-4-frozen-worktree-unfrozen-commit node "$V5" --rev "$M2" --repo "$D1" --fleet "$FLEET" --json

# ---------------------------------------------------------------- C2 / v3 legs
hr "C2 (v3) — fixture clone"
D2=$(mktemp -d -p "$S" c2clone.XXXXXX)
git clone -q --shared "$LANE" "$D2"
[ "$(git -C "$D2" rev-parse --show-toplevel)" = "$D2" ] || { echo "FATAL: toplevel mismatch"; exit 9; }
git -C "$D2" checkout -q master
M3=$(git -C "$D2" rev-parse master)
say "clone=$D2 toplevel=$(git -C "$D2" rev-parse --show-toplevel) master=$M3"

RECEIPT=corpus/evidence/round-35/bidi-firefox/receipt.json
say "receipt blob at master: $(git -C "$D2" rev-parse "$M3:$RECEIPT")"

run V3-L-master-literal node "$V3" --rev master --repo "$D2" --json
run V3-A-clean-at-master node "$V3" --rev "$M3" --repo "$D2" --json

# V3-B: add a replace ref in the clone's GIT DIR only.  No commit, no tree change.
python3 - "$D2" "$RECEIPT" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
rec = json.loads((d / rel).read_text())
for o in rec['runs'][0]['observed']:
    if o['step'] == 'captureScreenshot':
        o['value']['sha256'] = ('0' if o['value']['sha256'][0] != '0' else '1') + o['value']['sha256'][1:]
(out / 'forged-receipt.json').write_text(json.dumps(rec, indent=1) + '\n')
print('forged receipt written')
PY
OLD=$(git -C "$D2" rev-parse "$M3:$RECEIPT")
NEW=$(git -C "$D2" hash-object -w "$S/forged-receipt.json")
say "replace: $OLD -> $NEW"
git -C "$D2" replace "$OLD" "$NEW"
say "replace refs now: [$(git -C "$D2" for-each-ref --format='%(refname)' refs/replace/)]"
say "tree at master (unchanged): $(git -C "$D2" rev-parse "$M3^{tree}")"
say "HEAD: $(git -C "$D2" rev-parse HEAD)   worktree status (clean): [$(git -C "$D2" status --porcelain)]"
say "V3-C graft is live:"
say "  git show (graft honoured):        $(git -C "$D2" show "$M3:$RECEIPT" | sha256sum | cut -d' ' -f1)"
say "  GIT_NO_REPLACE_OBJECTS=1 git show: $(GIT_NO_REPLACE_OBJECTS=1 git -C "$D2" show "$M3:$RECEIPT" | sha256sum | cut -d' ' -f1)"
say "  honest blob sha256:                $(git -C "$D2" cat-file blob "$OLD" | sha256sum | cut -d' ' -f1)"
say "  forged blob sha256:                $(git -C "$D2" cat-file blob "$NEW" | sha256sum | cut -d' ' -f1)"
run V3-B-replace-ref-in-git-dir node "$V3" --rev "$M3" --repo "$D2" --json

say "done"
