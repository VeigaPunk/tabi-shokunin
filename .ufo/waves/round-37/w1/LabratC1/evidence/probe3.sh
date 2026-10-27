#!/usr/bin/env bash
# LabratC1 probe part 3: isolate SCREEN-at-HEAD, build-tool unbound read, and the
# exit-code contract for the list modes.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out
V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"
export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe3.log"; }
run() { local label=$1; shift; local o rc
  o=$("$@" 2>"$OUT/e.tmp"); rc=$?
  printf '%s :: exit=%s :: lines=%s :: stderr=%s\n' "$label" "$rc" "$(printf '%s' "$o" | grep -c '')" "$(head -2 "$OUT/e.tmp" | tr '\n' ' ' | cut -c1-200)" | tee -a "$OUT/probe3.log"
  printf '%s' "$o" > "$OUT/$label.stdout"; cp "$OUT/e.tmp" "$OUT/$label.stderr"; }

run base-drift node "$V5" --list-drift --repo "$LANE" --fleet "$FLEET"

# ---- CASE 14: APPEND (not replace) one screen row for a DRIFTED lane, committed at HEAD.
D14=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D14"
[ "$(git -C "$D14" rev-parse --show-toplevel)" = "$D14" ] || exit 9
first=$(sed -n '2p' "$D14/corpus/adjacency-screen-browser.tsv")
echo "CASE14 appending screen row: $first"
printf '%s\n' "$first" >> "$D14/corpus/adjacency-screen-browser.tsv"
git -C "$D14" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: duplicate one screen row'
run c14-drift node "$V5" --list-drift --repo "$D14" --fleet "$FLEET"
note "CASE14 drift=$(grep -c '' "$OUT/c14-drift.stdout") vs base=$(grep -c '' "$OUT/base-drift.stdout")  (308 => the SCREEN ledger is read at HEAD, not at --rev)"
run c14-pred node "$V5" --rev "$(git -C "$D14" rev-parse HEAD)" --repo "$D14" --fleet "$FLEET" --json

# ---- CASE 15: the BUILD TOOL (c1-drift-audit-build-v2.mjs) reads pins from HEAD/disk with
# NO digest binding, and its OUTPUT (the drift ledger) is what the counter audits.
BT=$LANE/.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs
note "CASE15 build tool sha256=$(sha256sum "$BT" | cut -d' ' -f1)"
grep -n "DELTA_PINS_PATH\|pinsBuf\|readFileSync(join(repo, DELTA_PINS_PATH))\|sha256\|DELTA_PINS_SHA256" "$BT" | tee -a "$OUT/probe3.log"
D15=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D15"
[ "$(git -C "$D15" rev-parse --show-toplevel)" = "$D15" ] || exit 9
# de-pin chousa in the clone's pins file, committed at HEAD (unfrozen digest)
python3 - "$D15" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
v5 = pathlib.Path('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs').read_text()
block = v5.split('const PINS = Object.freeze({',1)[1].split('});',1)[0]
PINS = dict(re.findall(r"'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'", block))
p = root / '.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
for sib, head in d.items():
    if head != PINS[sib]:
        d[sib] = PINS[sib]; print(f'de-pinned: {sib}'); break
p.write_text(json.dumps(d, indent=2) + '\n')
PY
git -C "$D15" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: de-pin chousa'
R15=$(git -C "$D15" rev-parse HEAD)
node "$BT" --repo "$D15" --fleet "$FLEET" --out "$OUT/ledger-depinned.tsv" > "$OUT/bt15.stdout" 2>&1; rc=$?
note "CASE15 build tool on de-pinned clone: exit=$rc :: $(head -1 "$OUT/bt15.stdout")"
node "$BT" --repo "$LANE" --fleet "$FLEET" --out "$OUT/ledger-honest.tsv" > "$OUT/bt15h.stdout" 2>&1; rc=$?
note "CASE15 build tool on honest lane:      exit=$rc :: $(head -1 "$OUT/bt15h.stdout")"
note "CASE15 ledger differs? $(cmp -s "$OUT/ledger-depinned.tsv" "$OUT/ledger-honest.tsv" && echo IDENTICAL || echo DIFFERS)"
diff <(cut -f2 "$OUT/ledger-honest.tsv" | sort | uniq -c) <(cut -f2 "$OUT/ledger-depinned.tsv" | sort | uniq -c) | tee -a "$OUT/probe3.log"
# now: does the de-pinned ledger make the FROZEN counter's predicate go false or stay true?
cp "$OUT/ledger-depinned.tsv" "$D15/corpus/adjacency-screen-drift.tsv"
git -C "$D15" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: adopt de-pinned ledger'
R15b=$(git -C "$D15" rev-parse HEAD)
run c15-pred node "$V5" --rev "$R15b" --repo "$D15" --fleet "$FLEET" --json

# ---- CASE 16: exit-code contract for list modes with a corrupt (non-JSON) pins file at HEAD
D16=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D16"
[ "$(git -C "$D16" rev-parse --show-toplevel)" = "$D16" ] || exit 9
echo 'not json {{{' > "$D16/.ufo/waves/round-36/baseline/c1-delta-pins.json"
git -C "$D16" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: corrupt pins'
run c16-drift node "$V5" --list-drift --repo "$D16" --fleet "$FLEET"
note "CASE16 stderr head: $(head -3 "$OUT/c16-drift.stderr" | tr '\n' ' ')"

rm -rf -- "$D14" "$D15" "$D16"
note "=== probe3 done ==="
