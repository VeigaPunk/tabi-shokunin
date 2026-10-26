#!/usr/bin/env bash
# Demo driver for assemble.mjs receipts. Scratch only.
set -u
S=/fast/scratch/hyaku/tabi-r33/ExecScreenTool
TOOL=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ExecScreenTool/assemble.mjs
FLEET=/home/vgpnk/Projects/shokunin
LANE=$FLEET/tabi-shokunin
BASE=e6b0a9074d434ccc307badd312ae7379d1193fea
export TMPDIR="$S/tmp"
mkdir -p "$S/tmp" "$S/receipts" "$S/receipts/merged-dry"
cd "$S" || exit 1

fresh() { # $1 = dir
  rm -rf "$1"
  git clone --shared "$LANE" "$1" >/dev/null 2>&1
  git -C "$1" checkout -q --detach "$BASE"
}

# D1: dry merge into a target dir
rm -rf out1
node "$TOOL" --repo "$S/clone" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv \
  --out "$S/out1" > receipts/01-dry-merge.txt 2>&1
echo "exit=$?" >> receipts/01-dry-merge.txt
cp out1/corpus/adjacency.tsv out1/corpus/adjacency-screen.tsv receipts/merged-dry/ 2>/dev/null

# D2: verify on a fresh clone at the baseline revision
fresh clone
node "$TOOL" --repo "$S/clone" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv \
  --verify "$S/clone" > receipts/02-verify-merge.txt 2>&1
echo "exit=$?" >> receipts/02-verify-merge.txt
MERGE1=$(git -C clone rev-parse HEAD)
{
  echo "merge1=$MERGE1"
  git -C clone show --stat --oneline HEAD
} >> receipts/02-verify-merge.txt

# D3: idempotent re-run at the merged revision (refuses to double-merge)
node "$TOOL" --repo "$S/clone" --fleet "$FLEET" --rev "$MERGE1" \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv \
  --verify "$S/clone" > receipts/03-verify-rerun.txt 2>&1
echo "exit=$?" >> receipts/03-verify-rerun.txt
echo "head-after=$(git -C clone rev-parse HEAD)" >> receipts/03-verify-rerun.txt

# D4: --prefer draft-b resolves the three-way conflict in favour of draft-b
fresh clone2
node "$TOOL" --repo "$S/clone2" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv \
  --prefer draft-b --verify "$S/clone2" > receipts/04-prefer-draft-b.txt 2>&1
echo "exit=$?" >> receipts/04-prefer-draft-b.txt
echo "head=$(git -C "$S/clone2" rev-parse HEAD)" >> receipts/04-prefer-draft-b.txt

# D5: machine-readable report
node "$TOOL" --repo "$S/clone2" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv \
  --out "$S/out5" --json > receipts/05-json.json 2> receipts/05-json.stderr
echo "exit=$?" >> receipts/05-json.stderr

# D6: lane guards (no write must happen)
node "$TOOL" --repo "$S/clone2" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --out "$LANE/corpus" > receipts/06a-refuse-lane-out.txt 2>&1
echo "exit=$?" >> receipts/06a-refuse-lane-out.txt
node "$TOOL" --repo "$S/clone2" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --verify "$LANE" > receipts/06b-refuse-lane-verify.txt 2>&1
echo "exit=$?" >> receipts/06b-refuse-lane-verify.txt

# D7: a base-map defect is reported by the gate, mapped back to the base row
fresh clone3
printf '%s\n' "$(git -C clone3 show e6b0a9074d434ccc307badd312ae7379d1193fea:corpus/adjacency.tsv | sed -n '5p')" >> clone3/corpus/adjacency.tsv
git -C clone3 -c user.name=ExecScreenTool -c user.email=ExecScreenTool@scratch.local \
  commit -q -am "scratch: duplicate an existing map row to exercise the gate handoff"
BASEDUP=$(git -C clone3 rev-parse HEAD)
{
  echo "basedup=$BASEDUP"
  git -C clone3 show --stat --oneline HEAD
} > receipts/07-gate-finding-base-duplicate.txt
node "$TOOL" --repo "$S/clone3" --fleet "$FLEET" --rev "$BASEDUP" \
  --draft fixtures/draft-a --l0 fixtures/l0.tsv \
  --verify "$S/clone3" >> receipts/07-gate-finding-base-duplicate.txt 2>&1
echo "exit=$?" >> receipts/07-gate-finding-base-duplicate.txt

echo "done"
