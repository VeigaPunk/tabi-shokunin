#!/usr/bin/env bash
# LabratC1 probe part 9: make --list-delta EMIT rows from unfrozen pins bytes.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe9.log"; }

KAGI=8a6ec1665778
FULL=$(git -C "$FLEET/kagi-shokunin" rev-parse "$KAGI" 2>/dev/null)
note "kagi commit full = $FULL"
note "PINS.kagi (round-35 pin) = 69b61db46be4ed955994f6f1d1cba522bc5f4e97"
echo "$FULL" > "$OUT/kagi-commit.txt"

D=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9
python3 - "$D" "$FULL" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])/'.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
d['kagi'] = sys.argv[2]
p.write_text(json.dumps(d, indent=2)+'\n')
PY
git -C "$D" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: repoint kagi delta head to a commit with new BG lines'
R=$(git -C "$D" rev-parse HEAD)
note "fixture rev=$R"
note "HEAD pins digest=$(git -C "$D" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)  frozen=810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655"

TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$D" --fleet "$FLEET" > "$OUT/g-delta-unfrozen.stdout" 2> "$OUT/g-delta-unfrozen.stderr"
rc=$?; note "--list-delta over UNFROZEN pins: exit=$rc lines=$(grep -c '' "$OUT/g-delta-unfrozen.stdout")"
head -3 "$OUT/g-delta-unfrozen.stdout" | tee -a "$OUT/probe9.log"
head -2 "$OUT/g-delta-unfrozen.stderr" | tee -a "$OUT/probe9.log"

TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET" > "$OUT/g-delta-frozen.stdout" 2>&1
note "--list-delta over FROZEN pins: lines=$(grep -c '' "$OUT/g-delta-frozen.stdout")"
note "DIVERGES? $(cmp -s "$OUT/g-delta-frozen.stdout" "$OUT/g-delta-unfrozen.stdout" && echo identical || echo DIFFERS)"

TMPDIR="$S/tmp" node "$V5" --list-drift --repo "$D" --fleet "$FLEET" > "$OUT/g-drift-unfrozen.stdout" 2>&1
note "--list-drift over UNFROZEN pins: lines=$(grep -c '' "$OUT/g-drift-unfrozen.stdout")  (base=307)"

TMPDIR="$S/tmp" node "$V5" --rev "$R" --repo "$D" --fleet "$FLEET" --json > "$OUT/g-pred.json" 2> "$OUT/g-pred.stderr"
note "--rev PREDICATE over the same unfrozen clone: exit=$? :: $(head -c 200 "$OUT/g-pred.stderr")"

# and the ON-DISK fallback variant of the same fixture
D2=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D2"
[ "$(git -C "$D2" rev-parse --show-toplevel)" = "$D2" ] || exit 9
git -C "$D2" checkout -q --detach 11c64b96f357de106c30a71c5e21ca44a3eacdc0
mkdir -p "$D2/.ufo/waves/round-36/baseline"
cp "$D/.ufo/waves/round-36/baseline/c1-delta-pins.json" "$D2/.ufo/waves/round-36/baseline/c1-delta-pins.json"
TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$D2" --fleet "$FLEET" > "$OUT/g-delta-disk.stdout" 2>&1
note "--list-delta via the ON-DISK fallback (cat, line 611): lines=$(grep -c '' "$OUT/g-delta-disk.stdout")  DIVERGES from frozen? $(cmp -s "$OUT/g-delta-frozen.stdout" "$OUT/g-delta-disk.stdout" && echo identical || echo DIFFERS)"
head -3 "$OUT/g-delta-disk.stdout" | tee -a "$OUT/probe9.log"
rm -rf -- "$D" "$D2"
note "=== probe9 done ==="
