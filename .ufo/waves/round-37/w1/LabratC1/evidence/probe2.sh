#!/usr/bin/env bash
# LabratC1 probe part 2: decisive divergence fixtures + crash detail.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out
V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe2.log"; }
run() { local label=$1; shift
  local o rc
  o=$("$@" 2>"$OUT/e.tmp"); rc=$?
  printf '%s :: exit=%s :: lines=%s :: stderr=%s\n' "$label" "$rc" "$(printf '%s' "$o" | grep -c '')" "$(head -3 "$OUT/e.tmp" | tr '\n' ' ' | cut -c1-260)" | tee -a "$OUT/probe2.log"
  printf '%s' "$o" > "$OUT/$label.stdout"; cp "$OUT/e.tmp" "$OUT/$label.stderr"; }

# baseline
run base-delta node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET"
run base-drift node "$V5" --list-drift --repo "$LANE" --fleet "$FLEET"
note "BASE delta=$(grep -c '' "$OUT/base-delta.stdout") drift=$(grep -c '' "$OUT/base-drift.stdout")"

# ---- CASE 7: committed pins that DE-PIN one drifted lane back to its round-35 PINS value.
# The drifted set is {sib : deltaPins[sib] !== PINS[sib]}; setting the delta head back to
# the PINS value removes that lane from the drifted set -> --list-drift MUST shrink.
D7=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D7"
[ "$(git -C "$D7" rev-parse --show-toplevel)" = "$D7" ] || exit 9
python3 - "$D7" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
v5 = pathlib.Path('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs').read_text()
block = v5.split('const PINS = Object.freeze({',1)[1].split('});',1)[0]
PINS = dict(re.findall(r"'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'", block))
p = root / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
# pick a lane that IS drifted under the frozen pins, and re-pin it to its PINS value
for sib, head in d.items():
    if head != PINS[sib]:
        d[sib] = PINS[sib]
        print(f'de-pinned lane: {sib} -> {PINS[sib]}')
        break
p.write_text(json.dumps(d, indent=2) + '\n')
PY
git -C "$D7" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: de-pin one drifted lane'
R7=$(git -C "$D7" rev-parse HEAD)
note "CASE7 rev=$R7 HEADpins=$(git -C "$D7" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)"
run c7-drift node "$V5" --list-drift --repo "$D7" --fleet "$FLEET"
run c7-delta node "$V5" --list-delta --repo "$D7" --fleet "$FLEET"
note "CASE7 drift=$(grep -c '' "$OUT/c7-drift.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  DELTAVERS=$(cmp -s "$OUT/base-drift.stdout" "$OUT/c7-drift.stdout" && echo identical || echo DIFFERS)"
note "CASE7 rows dropped: $(comm -13 <(sort "$OUT/base-drift.stdout") <(sort "$OUT/c7-drift.stdout") | wc -l)"
run c7-predicate node "$V5" --rev "$R7" --repo "$D7" --fleet "$FLEET" --json

# ---- CASE 8: on-disk fallback with a SEMANTICALLY DIFFERENT (de-pinned) file, HEAD lacks path
D8=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D8"
[ "$(git -C "$D8" rev-parse --show-toplevel)" = "$D8" ] || exit 9
git -C "$D8" checkout -q --detach 11c64b96f357de106c30a71c5e21ca44a3eacdc0
mkdir -p "$D8/.ufo/waves/round-36/baseline"
cp "$D7/.ufo/waves/round-36/baseline/c1-delta-pins.json" "$D8/.ufo/waves/round-36/baseline/c1-delta-pins.json"
note "CASE8 HEAD=$(git -C "$D8" rev-parse HEAD) on-disk pins=$(sha256sum "$D8/.ufo/waves/round-36/baseline/c1-delta-pins.json" | cut -d' ' -f1)"
run c8-drift node "$V5" --list-drift --repo "$D8" --fleet "$FLEET"
note "CASE8 drift=$(grep -c '' "$OUT/c8-drift.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  DELTAVERS=$(cmp -s "$OUT/base-drift.stdout" "$OUT/c8-drift.stdout" && echo identical || echo DIFFERS)"

# ---- CASE 9: same de-pinned file COMMITTED at HEAD (not just on disk)
D9=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D9"
[ "$(git -C "$D9" rev-parse --show-toplevel)" = "$D9" ] || exit 9
cp "$D7/.ufo/waves/round-36/baseline/c1-delta-pins.json" "$D9/.ufo/waves/round-36/baseline/c1-delta-pins.json"
git -C "$D9" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: de-pin committed'
R9=$(git -C "$D9" rev-parse HEAD)
run c9-drift node "$V5" --list-drift --repo "$D9" --fleet "$FLEET"
note "CASE9 drift=$(grep -c '' "$OUT/c9-drift.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  DELTAVERS=$(cmp -s "$OUT/base-drift.stdout" "$OUT/c9-drift.stdout" && echo identical || echo DIFFERS)"

# ---- CASE 10: does --list-drift read the SCREEN ledger from HEAD (not --rev)? mutate it.
D10=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D10"
[ "$(git -C "$D10" rev-parse --show-toplevel)" = "$D10" ] || exit 9
head -1 "$D10/corpus/adjacency-screen-browser.tsv" > "$D10/corpus/adjacency-screen-browser.tsv.new"
echo "zombie-shokunin@$(printf '0%.0s' {1..40}):corpus/knowledge/x.md:1" >> "$D10/corpus/adjacency-screen-browser.tsv.new"
mv "$D10/corpus/adjacency-screen-browser.tsv.new" "$D10/corpus/adjacency-screen-browser.tsv"
git -C "$D10" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: add one screen row'
R10=$(git -C "$D10" rev-parse HEAD)
run c10-drift node "$V5" --list-drift --repo "$D10" --fleet "$FLEET"
note "CASE10 drift=$(grep -c '' "$OUT/c10-drift.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  DELTAVERS=$(cmp -s "$OUT/base-drift.stdout" "$OUT/c10-drift.stdout" && echo identical || echo DIFFERS)"
note "CASE10 the injected row is NOT a drifted lane -> count unchanged means the ledger IS read from HEAD"

# ---- CASE 11: --rev is IGNORED by the list modes: pass a rev whose tree has no pins file
run c11-drift-oldrev node "$V5" --list-drift --repo "$LANE" --fleet "$FLEET" --rev 11c64b96f357de106c30a71c5e21ca44a3eacdc0
note "CASE11 drift=$(grep -c '' "$OUT/c11-drift-oldrev.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  (same => --rev ignored, HEAD used)"

# ---- CASE 12: crash detail when neither HEAD blob nor disk file exists
D12=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D12"
[ "$(git -C "$D12" rev-parse --show-toplevel)" = "$D12" ] || exit 9
git -C "$D12" checkout -q --detach 11c64b96f357de106c30a71c5e21ca44a3eacdc0
node "$V5" --list-delta --repo "$D12" --fleet "$FLEET" > "$OUT/c12.stdout" 2> "$OUT/c12.stderr"; rc=$?
note "CASE12 exit=$rc (documented: 2 = could-not-evaluate) stderr:"
head -12 "$OUT/c12.stderr" | tee -a "$OUT/probe2.log"

# ---- CASE 13: does the list path reach evaluate()? instrument.
run c13-marker-list node "$S/v5-marked.mjs" --list-delta --repo "$LANE" --fleet "$FLEET"
run c13-marker-drift node "$S/v5-marked.mjs" --list-drift --repo "$LANE" --fleet "$FLEET"
run c13-marker-pred  node "$S/v5-marked.mjs" --rev master --repo "$LANE" --fleet "$FLEET" --json
note "CASE13 marker present in list stderr? $(grep -c MARKER "$OUT/c13-marker-list.stderr" "$OUT/c13-marker-drift.stderr" | tr '\n' ' ')  in predicate stderr? $(grep -c MARKER "$OUT/c13-marker-pred.stderr")"

rm -rf -- "$D7" "$D8" "$D9" "$D10" "$D12"
note "=== probe2 done ==="
