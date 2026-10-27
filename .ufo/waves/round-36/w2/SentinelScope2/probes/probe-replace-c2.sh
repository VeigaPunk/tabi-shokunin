#!/usr/bin/env bash
# w2 / SentinelScope2 — A7 reproducer: does refs/replace redirect the frozen C2 counter's git reads,
# and does GIT_NO_REPLACE_OBJECTS in the INHERITED env read through?
# Writes everything under $S (default: a scratch dir); never touches the lane.
set -u -o pipefail
S=${1:-/fast/scratch/hyaku/tabi-r36/SentinelScope2/repro}
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FREEZE=2e7b7a8920bff47fae6f75c3d06e48e37767099e
E=corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
COUNTER=.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs
mkdir -p "$S/tmp"
cleanup() { pgrep -af 'geckodriver|firefox' 2>/dev/null | grep -F "$S" | awk '{print $1}' | xargs -r kill -KILL 2>/dev/null; rm -rf -- "$S"; }
trap cleanup EXIT

git clone -q --shared "$LANE" "$S/clone" || { echo "clone failed"; exit 9; }
[ "$(git -C "$S/clone" rev-parse --show-toplevel)" = "$S/clone" ] || { echo "BOUNDARY FAIL"; exit 9; }
git -C "$LANE" show "$FREEZE:$COUNTER" > "$S/c2.mjs"
echo "counter sha256: $(sha256sum "$S/c2.mjs" | cut -d' ' -f1)  (frozen: 15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764)"

git -C "$S/clone" show "$FREEZE:$E" > "$S/entry-honest.md"
# Insert a first `source:` line citing an unregistered id; the counter reads only the FIRST
# /^source:/ line, so this removes the s1 witness without touching any table row.
awk 'NR==5 && !d {print "source: S999 (forge - unregistered id, no URL, first source: line)"; d=1} {print}' "$S/entry-honest.md" > "$S/entry-forged.md"
HONEST=$(git -C "$S/clone" rev-parse "$FREEZE:$E")
FORGED=$(git -C "$S/clone" hash-object -w "$S/entry-forged.md")
echo "honest entry blob: $HONEST"; echo "forged entry blob: $FORGED"

run() { tag=$1; rev=$2; shift 2
  TMPDIR="$S/tmp" env "$@" node "$S/c2.mjs" --repo "$S/clone" --rev "$rev" --json > "$S/$tag.json" 2> "$S/$tag.err"; rc=$?
  echo "== $tag exit=$rc"
  python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print({k:d.get(k) for k in ('rev','population','admitted','failing','entryFinding','binding','egressNonLoopback','predicate')})" "$S/$tag.json"
}

git -C "$S/clone" replace -d "$HONEST" >/dev/null 2>&1 || true
run 1-freeze-clean "$FREEZE"

git -C "$S/clone" replace "$HONEST" "$FORGED"
echo "replace refs: $(git -C "$S/clone" for-each-ref --format='%(refname:short) %(objectname:short)' refs/replace | tr '\n' ' ')"
echo "--- git show $FREEZE:$E under exactly the counter's git() env:"
env -i PATH="$PATH" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null LC_ALL=C git -C "$S/clone" show "$FREEZE:$E" | sha256sum
echo "--- same env + GIT_NO_REPLACE_OBJECTS=1:"
env -i PATH="$PATH" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null LC_ALL=C GIT_NO_REPLACE_OBJECTS=1 git -C "$S/clone" show "$FREEZE:$E" | sha256sum
run 2-freeze-blob-replaced "$FREEZE"
run 3-freeze-blob-replaced-parent-env "$FREEZE" GIT_NO_REPLACE_OBJECTS=1
git -C "$S/clone" replace -d "$HONEST"

# A revision whose COMMITTED entry is the forged blob (a genuinely failing REV).
GIT_INDEX_FILE="$S/idx" git -C "$S/clone" read-tree "$FREEZE"
GIT_INDEX_FILE="$S/idx" git -C "$S/clone" update-index --cacheinfo 100644,"$FORGED","$E"
TREE=$(GIT_INDEX_FILE="$S/idx" git -C "$S/clone" write-tree)
REVF=$(GIT_AUTHOR_NAME=r GIT_AUTHOR_EMAIL=r@r GIT_COMMITTER_NAME=r GIT_COMMITTER_EMAIL=r@r git -C "$S/clone" commit-tree "$TREE" -p "$FREEZE" -m "w2 SentinelScope2 repro: broken entry source line")
echo "failing revision REVF: $REVF (tree $TREE)"
run 4-failing-rev-committed "$REVF"

git -C "$S/clone" replace "$FORGED" "$HONEST"
run 5-failing-rev-entry-replaced "$REVF"
run 6-failing-rev-entry-replaced-parent-env "$REVF" GIT_NO_REPLACE_OBJECTS=1
git -C "$S/clone" replace -d "$FORGED"

# Commit-level replacement: the whole tree of the measured REV is swapped while rev-parse
# still prints the pinned REV.
REVG=$(GIT_AUTHOR_NAME=r GIT_AUTHOR_EMAIL=r@r GIT_COMMITTER_NAME=r GIT_COMMITTER_EMAIL=r@r git -C "$S/clone" commit-tree "$TREE" -m "w2 SentinelScope2 repro: substituted tree")
git -C "$S/clone" replace "$FREEZE" "$REVG"
echo "rev-parse '$FREEZE^{commit}' -> $(git -C "$S/clone" rev-parse --verify "$FREEZE^{commit}")  (pinned REV still printed)"
run 7-freeze-commit-replaced "$FREEZE"
git -C "$S/clone" replace -d "$FREEZE"
echo "done"
