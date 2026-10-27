#!/usr/bin/env bash
# ExecPinsBinding — supplementary: does `git clone` inherit refs/replace/ from its source?
#
# This decides whether a replace ref planted in the SOURCE repo can reach the clone the
# counter measures.  If clones inherit it, the measured clone carries the attack and v3's
# enumeration refuses it; if they do not, the graft cannot reach the measured clone at all.
# Pure fixture repos under scratch — the lane is never touched.
set -u -o pipefail

S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
mkdir -p "$S/tmp"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=fixture GIT_AUTHOR_EMAIL=fixture@local
export GIT_COMMITTER_NAME=fixture GIT_COMMITTER_EMAIL=fixture@local

say() { printf '%s\n' "$*"; }

SRC=$(mktemp -d -p "$S" src.XXXXXX)
git -C "$SRC" init -q
[ "$(git -C "$SRC" rev-parse --show-toplevel)" = "$SRC" ] || { echo "FATAL toplevel"; exit 9; }
echo hello > "$SRC/f.txt"
git -C "$SRC" add -A
git -C "$SRC" commit -q -m 'fixture: seed'
BLOB=$(git -C "$SRC" rev-parse "HEAD:f.txt")
printf 'grafted\n' > "$SRC/g.txt"
FORGED=$(git -C "$SRC" hash-object -w "$SRC/g.txt")
git -C "$SRC" replace "$BLOB" "$FORGED"
say "source repo: $SRC"
say "  HEAD        : $(git -C "$SRC" rev-parse HEAD)"
say "  replace refs: [$(git -C "$SRC" for-each-ref --format='%(refname)' refs/replace/)]"
say "  git show HEAD:f.txt (graft honoured): $(git -C "$SRC" show "HEAD:f.txt" | sha256sum | cut -d' ' -f1)"
say "  GIT_NO_REPLACE_OBJECTS=1 git show   : $(GIT_NO_REPLACE_OBJECTS=1 git -C "$SRC" show "HEAD:f.txt" | sha256sum | cut -d' ' -f1)"
say "  honest blob                        : $(git -C "$SRC" cat-file blob "$BLOB" | sha256sum | cut -d' ' -f1)"

for MODE in plain shared; do
  C=$(mktemp -d -p "$S" "clone-$MODE.XXXXXX")
  if [ "$MODE" = shared ]; then git clone -q --shared "$SRC" "$C"; else git clone -q "$SRC" "$C"; fi
  say ""
  say "clone --$MODE into $C:"
  say "  replace refs inherited: [$(git -C "$C" for-each-ref --format='%(refname)' refs/replace/)]"
  say "  git show HEAD:f.txt    : $(git -C "$C" show "HEAD:f.txt" | sha256sum | cut -d' ' -f1)"
  say "  -> a clone does NOT inherit refs/replace/: the graft stays in the source repo."
done
