#!/usr/bin/env bash
# Second demo driver: pending/l0 edge cases, candidate fallback, --prefer guard.
set -u
S=/fast/scratch/hyaku/tabi-r33/ExecScreenTool
TOOL=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ExecScreenTool/assemble.mjs
FLEET=/home/vgpnk/Projects/shokunin
BASE=e6b0a9074d434ccc307badd312ae7379d1193fea
export TMPDIR="$S/tmp"
cd "$S" || exit 1

fresh() {
  rm -rf "$1"
  git clone --shared "$FLEET/tabi-shokunin" "$1" >/dev/null 2>&1
  git -C "$1" checkout -q --detach "$BASE"
}

# D8a: l0 mapping that points at a fleet line which is not a tabi round row
rm -rf clone4 out8
fresh clone4
printf '%s\t%s\t%s\n' "draft-b:2" \
  "fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:1" \
  "kasegi | round-12" > fixtures/l0-not-tabi.tsv
node "$TOOL" --repo "$S/clone4" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-b --l0 fixtures/l0-not-tabi.tsv \
  --out "$S/out8" > receipts/08a-l0-not-tabi.txt 2>&1
echo "exit=$?" >> receipts/08a-l0-not-tabi.txt

# D8b: l0 mapping whose quote is not on the l0 line
node "$TOOL" --repo "$S/clone4" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-b --l0 fixtures/l0-bad-quote.tsv \
  --out "$S/out8b" > receipts/08b-l0-bad-quote.txt 2>&1
echo "exit=$?" >> receipts/08b-l0-bad-quote.txt

# D9: candidate list fallback when the fleet has no sibling repositories
rm -rf fakefleet out9
mkdir -p fakefleet
node "$TOOL" --repo "$S/clone4" --fleet "$S/fakefleet" --rev "$BASE" \
  --draft fixtures/draft-a \
  --candidates "$FLEET/tabi-shokunin/.ufo/waves/round-33/baseline/c1-candidates.tsv" \
  --out "$S/out9" > receipts/09-candidate-fallback.txt 2>&1
echo "exit=$?" >> receipts/09-candidate-fallback.txt

# D10: --prefer naming a draft that is not supplied
node "$TOOL" --repo "$S/clone4" --fleet "$FLEET" --rev "$BASE" \
  --draft fixtures/draft-a --prefer draft-z --out "$S/out10" \
  > receipts/10-prefer-unknown.txt 2>&1
echo "exit=$?" >> receipts/10-prefer-unknown.txt

# D11: usage
node "$TOOL" --help > receipts/11-help.txt 2>&1
echo "exit=$?" >> receipts/11-help.txt

# D12: fixture provenance — every cited candidate key must be in the frozen list
for k in kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:323 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:362 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:338 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:304 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:440 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:373 \
         kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:420 \
         kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md:20 \
         kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md:59; do
  if grep -qF "$k" "$FLEET/tabi-shokunin/.ufo/waves/round-33/baseline/c1-candidates.tsv"; then
    echo "candidate $k present"
  else
    echo "candidate $k ABSENT"
  fi
done > receipts/12-fixture-provenance.txt 2>&1
echo "done"
