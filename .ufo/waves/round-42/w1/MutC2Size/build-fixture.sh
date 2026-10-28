#!/usr/bin/env bash
set -euo pipefail
S=/fast/scratch/hyaku/tabi-r42/MutC2Size
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
CHECKER=$LANE/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs

mkdir -p "$S"

# 1) copy lane counter bytes (never edit lane)
cp "$CHECKER" "$S/check-pristine-copy.mjs"   # byte-identical reference copy
cp "$CHECKER" "$S/check-mutant.mjs"
echo "== lane sha256 =="; sha256sum "$CHECKER"
echo "== scratch copies sha256 (pre-mutation) =="; sha256sum "$S/check-pristine-copy.mjs" "$S/check-mutant.mjs"

# 2) fixture repo
D=$(mktemp -d "$S/fixture.XXXXXXXX")
echo "$D" > "$S/fixture.path"
echo "FIXTURE_DIR=$D"

git init -q "$D"
TOP=$(git -C "$D" rev-parse --show-toplevel)
echo "rev-parse --show-toplevel = $TOP"
[ "$TOP" = "$D" ] || { echo "REFUSING: toplevel != fixture dir"; exit 3; }
echo "toplevel guard: OK"

mkdir -p "$D/corpus/evidence/round41/playwright-egress" \
         "$D/.ufo/waves/round-41/measure" \
         "$D/.ufo/waves/round-41/sources" \
         "$D/.ufo/waves/round-41/controls" \
         "$D/.ufo/waves/round-42/quarantine" \
         "$D/corpus/evidence/round42-quarantine"

# 2a) tiny non-JSON receipt (12 bytes) and witness (10 bytes)
printf 'not-json-12b' > "$D/corpus/evidence/round41/playwright-egress/receipt.json"
printf 'witness-10'   > "$D/corpus/evidence/round41/playwright-egress/receipt.witness.json"
wc -c "$D/corpus/evidence/round41/playwright-egress/receipt.json" \
      "$D/corpus/evidence/round41/playwright-egress/receipt.witness.json"

# 2b) self-authored measure record with matching sha256 of the tiny blobs
RH=$(sha256sum "$D/corpus/evidence/round41/playwright-egress/receipt.json" | cut -d' ' -f1)
WH=$(sha256sum "$D/corpus/evidence/round41/playwright-egress/receipt.witness.json" | cut -d' ' -f1)
printf '{"schema":"mutc2size-fixture-measure","receiptSha256":"%s","witnessSha256":"%s"}\n' "$RH" "$WH" \
  > "$D/.ufo/waves/round-41/measure/c1-measure.json"
echo "receiptSha256=$RH"; echo "witnessSha256=$WH"
cat "$D/.ufo/waves/round-41/measure/c1-measure.json"

# 2c) R2: SOURCES.md (header + S146 rejected + S148 supersedes with verbatim quote)
printf '%s\n' \
'| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |' \
'|---|---|---|---|---|---|---|---|---|---|---|' \
'| S146 | Node.js CLI documentation | docs | A | NODE_OPTIONS loader channel | section | loader channel notes | rejected | 2026-10-28 | - | - |' \
'| S148 | Node.js CLI documentation | docs | A | NODE_OPTIONS loader channel, corrected quote | section | supersedes S146 — A space-separated list of command-line options. | active | 2026-10-28 | - | - |' \
> "$D/corpus/SOURCES.md"
cat > "$D/.ufo/waves/round-41/sources/node-cli-v24.21.0.html" <<'HTML'
<html><body><h2>NODE_OPTIONS=options...</h2>
<p>A space-separated list of command-line options. NODE_OPTIONS is read by node at startup.</p>
</body></html>
HTML

# 2d) R3 baseline control: records ls-tree command and the digit 0
printf 'git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 | wc -l\n0\n' \
  > "$D/.ufo/waves/round-41/controls/c1-baseline-noop.out"

# 2e) R4: 38 slice ids + re-adjudication TSV + one 240-byte evidence blob
: > "$D/.ufo/waves/round-42/quarantine/slice-ids.txt"
: > "$D/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
for i in $(seq 1 38); do
  id=$(printf 'S%d' $((100 + i)))
  printf '%s\n' "$id" >> "$D/.ufo/waves/round-42/quarantine/slice-ids.txt"
  printf '%s\t%s\t%s\n' "$id" present "corpus/evidence/round42-quarantine/probe.txt" \
    >> "$D/.ufo/waves/round-42/quarantine/re-adjudication.tsv"
done
python3 - "$D/corpus/evidence/round42-quarantine/probe.txt" <<'PY'
import sys
open(sys.argv[1], 'w').write("quarantine evidence probe line\n" * 8)
PY
wc -c "$D/corpus/evidence/round42-quarantine/probe.txt"
wc -l "$D/.ufo/waves/round-42/quarantine/slice-ids.txt" "$D/.ufo/waves/round-42/quarantine/re-adjudication.tsv"

# 3) commit with explicit identity (no global config mutation)
git -C "$D" add -A
git -C "$D" -c user.name=MutC2Size -c user.email=mutc2size@localhost \
  -c commit.gpgsign=false commit -q -m "fixture: tiny receipt+witness, self-authored measure, synthetic r2/r3/r4"
REV=$(git -C "$D" rev-parse HEAD)
echo "$REV" > "$S/fixture.rev"
echo "FIXTURE_REV=$REV"
git -C "$D" show --stat --oneline HEAD | cat
