#!/usr/bin/env bash
set -euo pipefail
S=/fast/scratch/hyaku/tabi-r42/CritC2Ledger
F=$S/fixture
CHK=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs

rm -rf "$F"
mkdir -p "$F"
cd "$F"
git init -q
git config user.email crit-c2-ledger@seat.local
git config user.name "CritC2Ledger"
TOP=$(git rev-parse --show-toplevel)
[ "$TOP" = "$F" ] || { echo "TOPLEVEL MISMATCH: $TOP != $F"; exit 1; }
echo "toplevel ok: $TOP"

mkdir -p corpus/evidence/round41/playwright-egress corpus/evidence/round42/quarantine corpus/evidence/fake
mkdir -p .ufo/waves/round-41/measure .ufo/waves/round-41/sources .ufo/waves/round-41/controls
mkdir -p .ufo/waves/round-42/quarantine

# --- hand-written, never-measured receipt + witness (>1000 bytes, valid JSON object)
node <<'JS'
const fs = require('fs');
const receipt = {
  schema: 'tabi-r41-c1-receipt',
  forgedBy: 'CritC2Ledger',
  browserLaunched: false,
  runs: [],
  nonce: '0'.repeat(64),
  note: 'no browser was launched; these bytes exist only to satisfy r1a',
  padding: 'A'.repeat(1200),
};
const witness = {
  schema: 'tabi-r41-c1-witness',
  forgedBy: 'CritC2Ledger',
  witnessChildSpawned: false,
  note: 'witness child never spawned; bytes exist only to satisfy r1b',
  padding: 'B'.repeat(1200),
};
fs.writeFileSync('corpus/evidence/round41/playwright-egress/receipt.json', JSON.stringify(receipt, null, 1));
fs.writeFileSync('corpus/evidence/round41/playwright-egress/receipt.witness.json', JSON.stringify(witness, null, 1));
fs.writeFileSync('corpus/evidence/fake/one.txt', 'x'.repeat(250) + '\n');
fs.writeFileSync('corpus/evidence/fake/thin.txt', 'y'.repeat(99) + '\n');
JS

# --- self-authored measure record binding the two hand-written files
R=$(sha256sum corpus/evidence/round41/playwright-egress/receipt.json | cut -d' ' -f1)
W=$(sha256sum corpus/evidence/round41/playwright-egress/receipt.witness.json | cut -d' ' -f1)
printf '{"schema":"tabi-r41-c1-measure","out":"self-authored","witness":"self-authored","receiptSha256":"%s","witnessSha256":"%s","driverExit":0}\n' "$R" "$W" \
  > .ufo/waves/round-41/measure/c1-measure.json

# --- SOURCES.md: S146 rejected, S148 with a degenerate one-word quote
cat > corpus/SOURCES.md <<'MD'
# Sources

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S146 | Node.js CLI documentation | docs | A | NODE_OPTIONS loader channel | §`NODE_OPTIONS=options...` | a space-separated list of command-line options | rejected | 2026-10-28 | on-release | corpus/lessons/round-42.md |
| S148 | Node.js CLI documentation | docs | A | supersedes S146 — options | §`NODE_OPTIONS=options...` | supersedes S146 — options | mined | 2026-10-28 | on-release | corpus/knowledge/x.md |
MD

# --- decoy staged html: not the node CLI docs at all, but contains the token "options"
printf '<html><head><title>decoy page</title></head><body>a page that mentions options and nothing about NODE_OPTIONS</body></html>\n' \
  > .ufo/waves/round-41/sources/node-cli-v24.21.0.html

# --- baseline control never executed
cat > .ufo/waves/round-41/controls/c1-baseline-noop.out <<'TXT'
# handwritten control note - the command below was never executed
git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 -> 0 files
TXT

# --- 38 fabricated staged ids + all-present TSV, one shared evidence blob
: > .ufo/waves/round-42/quarantine/slice-ids.txt
: > .ufo/waves/round-42/quarantine/re-adjudication.tsv
for i in $(seq 0 37); do
  id=$(printf 'S2%02d' "$i")
  echo "$id" >> .ufo/waves/round-42/quarantine/slice-ids.txt
  printf '%s\tpresent\tcorpus/evidence/fake/one.txt\n' "$id" >> .ufo/waves/round-42/quarantine/re-adjudication.tsv
done

git add -A
git commit -q -m "fixture: fully self-authored C2 ledger (no repair, no measurement)"
REV=$(git rev-parse HEAD)
echo "REV=$REV"
echo "receipt_sha256=$R"
echo "witness_sha256=$W"
echo "sizes: receipt=$(git cat-file -s "$REV:corpus/evidence/round41/playwright-egress/receipt.json") witness=$(git cat-file -s "$REV:corpus/evidence/round41/playwright-egress/receipt.witness.json") evidence=$(git cat-file -s "$REV:corpus/evidence/fake/one.txt")"

echo
echo "=== V0 pristine checker on fully self-authored fixture"
set +e
node "$CHK" --rev "$REV" --repo "$F" --json
echo "V0 exit=$?"
set -e
