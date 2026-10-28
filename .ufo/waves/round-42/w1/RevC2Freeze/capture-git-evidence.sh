#!/usr/bin/env bash
# RevC2Freeze evidence capture — read-only git inspection of the tabi round-42 freeze.
# Every command below is a read-only git query; nothing is written to the repo.
set -u
REPO=/home/vgpnk/Projects/shokunin/tabi-shokunin
FREEZE=9b6de3a19de11abdb80e82a1310abc64a40215bb
BASE=34e177959d1b7ce04afb85a001420e02631ce79e
DISPATCH=236c4f49f6cf8be7fd2efc71c7e89b7465b47a27

h() { printf '\n===== %s =====\n' "$1"; }

cd "$REPO" || exit 1

h "A1. commit ordering (newest first)"
git log --format='%H %cI %s' -n 4

h "A1. ancestry: freeze -> dispatch -> HEAD"
git merge-base --is-ancestor "$FREEZE" "$DISPATCH" \
  && echo "PASS: freeze is an ancestor of dispatch $DISPATCH" \
  || echo "FAIL: freeze is NOT an ancestor of dispatch"
git merge-base --is-ancestor "$FREEZE" HEAD \
  && echo "PASS: freeze is an ancestor of HEAD" \
  || echo "FAIL: freeze is NOT an ancestor of HEAD"

h "A1. commits between freeze and dispatch (reverse)"
git log --format='%H %cI %s' "$FREEZE..$DISPATCH" --reverse

h "A1. round-42 w1 seat data present in the freeze tree (must be empty)"
git ls-tree -r --name-only "$FREEZE" -- .ufo/waves/round-42/w1
echo "[end of listing]"

h "A1. round-42 files present at the freeze commit"
git ls-tree -r --name-only "$FREEZE" -- .ufo/waves/round-42/

h "A2. frozen blob identities: claims.json"
echo "freeze   $(git rev-parse "$FREEZE:.ufo/waves/round-42/claims.json")"
echo "HEAD     $(git rev-parse "HEAD:.ufo/waves/round-42/claims.json")"
echo "worktree $(git hash-object .ufo/waves/round-42/claims.json)"
echo "sha256(worktree bytes) $(sha256sum .ufo/waves/round-42/claims.json | cut -d' ' -f1)"

h "A2. frozen blob identities: counter"
echo "freeze   $(git rev-parse "$FREEZE:.ufo/waves/round-42/counters/check-routed-defects-round42.mjs")"
echo "HEAD     $(git rev-parse "HEAD:.ufo/waves/round-42/counters/check-routed-defects-round42.mjs")"
echo "worktree $(git hash-object .ufo/waves/round-42/counters/check-routed-defects-round42.mjs)"

h "A2. every commit on every ref that touched claims.json or the counter"
git log --all --format='%H %cI %s' -- .ufo/waves/round-42/claims.json
echo "--"
git log --all --format='%H %cI %s' -- .ufo/waves/round-42/counters/
echo "-- claims.json blob per such commit (all must equal the freeze blob):"
for c in $(git log --all --format='%H' -- .ufo/waves/round-42/claims.json); do
  printf '%s %s\n' "$c" "$(git rev-parse "$c:.ufo/waves/round-42/claims.json" 2>/dev/null || echo MISSING)"
done

h "A2. C2 predicate sentence as frozen (claims.json -> claims[C2].predicate)"
python3 - <<'PY'
import json, subprocess
b = subprocess.run(['git','show','9b6de3a19de11abdb80e82a1310abc64a40215bb:.ufo/waves/round-42/claims.json'], capture_output=True).stdout
d = json.loads(b)
c2 = [c for c in d['claims'] if c['id'] == 'C2'][0]
print(c2['predicate'])
PY

h "A2. checker header comment, lines 6-29"
sed -n '6,29p' .ufo/waves/round-42/counters/check-routed-defects-round42.mjs

h "A2. SOURCES.md column header (defines teaches=cell 7, status=cell 8)"
git show HEAD:corpus/SOURCES.md | sed -n '13,14p'

h "A2. S146/S148 teaches and status cells"
git show HEAD:corpus/SOURCES.md | grep -E '^\| S(146|148) \|' | awk -F'|' '{printf "%s teaches=[%s] status=[%s]\n", $2, $8, $9}'

h "A3. diff of frozen paths, freeze..HEAD (must be empty)"
git diff --stat "$FREEZE..HEAD" -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/
echo "diff bytes: $(git diff "$FREEZE..HEAD" -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/ | wc -c)"

h "A3. status of frozen paths in the worktree (must be empty)"
git status --porcelain=v1 -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/ .ufo/waves/round-42/controls/
echo "[end of status]"

h "A3. every round-42 change since the freeze that is NOT a pure addition"
git diff --name-status "$FREEZE..HEAD" -- .ufo/waves/round-42/ | grep -v '^A'
echo "[end: empty means additions only]"

h "A3. frozen C2 control blob, freeze vs HEAD"
echo "freeze   $(git rev-parse "$FREEZE:.ufo/waves/round-42/controls/c2-baseline-red.json")"
echo "HEAD     $(git rev-parse "HEAD:.ufo/waves/round-42/controls/c2-baseline-red.json")"

h "A4. committed baseline red control (c2-baseline-red.json)"
git show "$FREEZE:.ufo/waves/round-42/controls/c2-baseline-red.json"

h "A4. committed baseline red control exit record (c2-baseline-red.exit)"
git show "$FREEZE:.ufo/waves/round-42/controls/c2-baseline-red.exit"

h "A4. live checker at baseline $BASE"
node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev "$BASE" --repo "$REPO" --json
echo "exit=$?"

h "A4b. frozen blob of the checker, run at baseline (control reproduction)"
node /fast/scratch/hyaku/tabi-r42/RevC2Freeze/checker-freeze.mjs --rev "$BASE" --repo "$REPO" --json > /fast/scratch/hyaku/tabi-r42/RevC2Freeze/run-baseline-frozenblob.json
echo "exit=$?"
cmp /fast/scratch/hyaku/tabi-r42/RevC2Freeze/run-baseline-frozenblob.json /fast/scratch/hyaku/tabi-r42/RevC2Freeze/control-baseline.json \
  && echo "PASS: frozen-blob output is byte-identical to the committed control" \
  || echo "FAIL: frozen-blob output differs from the committed control"

h "A5. checker at the freeze revision (design: only r4 red)"
node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev "$FREEZE" --repo "$REPO" --json
echo "exit=$?"

h "A5. c2-at-freeze control committed with the dispatch"
git show HEAD:.ufo/waves/round-42/controls/c2-at-freeze.json
git show HEAD:.ufo/waves/round-42/controls/c2-at-freeze.exit

h "A5. S149 staged copy digest vs the digest frozen in claims.json"
echo "actual   $(git show "$FREEZE:.ufo/waves/round-42/sources/git-ls-tree.html" | sha256sum | cut -d' ' -f1)"
echo "in claims 2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64"

h "A6. slice-ids.txt line count at the freeze (expect 38)"
git show "$FREEZE:.ufo/waves/round-42/quarantine/slice-ids.txt" | grep -c .

h "A7. checker write surface (grep for filesystem mutation)"
grep -nE 'writeFile|appendFile|mkdir|rmSync|unlink|createWriteStream|openSync|fs\.' \
  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
echo "[end: no matches means the checker writes nothing]"

h "A7. git invocations the checker makes"
grep -n "spawnSync('git'" .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
