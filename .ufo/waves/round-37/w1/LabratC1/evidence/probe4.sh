#!/usr/bin/env bash
# LabratC1 probe part 4: make --list-delta emit rows from UNFROZEN bytes.
set -u -o pipefail
S=/fast/scratch/hyaku/tabi-r37/w1/LabratC1
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
OUT=$S/out; V5=$S/v5.mjs
mkdir -p "$OUT" "$S/tmp" "$S/fx"; export TMPDIR="$S/tmp"; export GIT_CONFIG_NOSYSTEM=1
note() { printf '%s\n' "$*" | tee -a "$OUT/probe4.log"; }

# Find a sibling whose master head carries a BG non-tabi line absent from the pin set.
# Use the counter's own exported helpers (frozen bytes) to search.
cat > "$S/find-delta.mjs" <<'JS'
import { deltaCandidates, pinLines, BG } from '/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs';
import { execFileSync } from 'node:child_process';
const FLEET='/home/vgpnk/Projects/shokunin';
const sibs = Object.keys((await import('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs')).PINS ?? {});
console.log('PINS export?', sibs.length);
JS
# simpler: derive from the counter's own PINS block with python, then try each sibling master
python3 - <<'PY'
import re, pathlib, json, subprocess
v5 = pathlib.Path('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/v5.mjs').read_text()
block = v5.split('const PINS = Object.freeze({',1)[1].split('});',1)[0]
PINS = dict(re.findall(r"'?([a-z0-9-]+)'?\s*:\s*'([0-9a-f]{40})'", block))
print('siblings:', len(PINS))
out={}
for sib in PINS:
    r = subprocess.run(['git','-C',f'/home/vgpnk/Projects/shokunin/{sib}-shokunin','rev-parse','master'],
                       capture_output=True,text=True)
    if r.returncode==0 and r.stdout.strip()!=PINS[sib]:
        out[sib]=r.stdout.strip()
print('lanes whose master != PINS pin:', json.dumps(out, indent=1))
pathlib.Path('/fast/scratch/hyaku/tabi-r37/w1/LabratC1/out/master-heads.json').write_text(json.dumps(out))
PY

# Build an unfrozen pins file that repoints EVERY sibling to its master head.
D=$(mktemp -d -p "$S/fx"); git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || exit 9
python3 - "$D" <<'PY'
import json, pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1])
p = root/'.ufo/waves/round-36/baseline/c1-delta-pins.json'
d = json.loads(p.read_text())
for sib in list(d):
    r = subprocess.run(['git','-C',f'/home/vgpnk/Projects/shokunin/{sib}-shokunin','rev-parse','master'],
                       capture_output=True,text=True)
    if r.returncode==0: d[sib]=r.stdout.strip()
p.write_text(json.dumps(d, indent=2)+'\n')
PY
git -C "$D" -c user.name=fixture -c user.email=fixture@local commit -q -am 'fixture: repoint all delta pins to sibling masters'
R=$(git -C "$D" rev-parse HEAD)
note "unfrozen pins HEAD digest=$(git -C "$D" show HEAD:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum | cut -d' ' -f1)"
note "frozen digest = 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655"
TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$D" --fleet "$FLEET" > "$OUT/d-unfrozen-delta.stdout" 2> "$OUT/d-unfrozen-delta.stderr"
note "--list-delta over UNFROZEN pins: exit=$? lines=$(grep -c '' "$OUT/d-unfrozen-delta.stdout")"
head -3 "$OUT/d-unfrozen-delta.stdout" | tee -a "$OUT/probe4.log"
TMPDIR="$S/tmp" node "$V5" --list-delta --repo "$LANE" --fleet "$FLEET" > "$OUT/d-frozen-delta.stdout" 2>&1
note "--list-delta over FROZEN pins: lines=$(grep -c '' "$OUT/d-frozen-delta.stdout")"
TMPDIR="$S/tmp" node "$V5" --list-drift --repo "$D" --fleet "$FLEET" > "$OUT/d-unfrozen-drift.stdout" 2>&1
note "--list-drift over UNFROZEN pins: lines=$(grep -c '' "$OUT/d-unfrozen-drift.stdout")"
TMPDIR="$S/tmp" node "$V5" --rev "$R" --repo "$D" --fleet "$FLEET" --json > "$OUT/d-unfrozen-pred.json" 2> "$OUT/d-unfrozen-pred.stderr"
note "--rev predicate over UNFROZEN pins: exit=$? :: $(head -c 200 "$OUT/d-unfrozen-pred.stderr")"
rm -rf -- "$D"

# header documentation check: what does the v5 header SAY about inputs?
note "--- v5 header, Inputs paragraph (lines 41-49) ---"
grep -n "" "$V5" | sed -n '41,49p' | tee -a "$OUT/probe4.log"
note "--- v5 header, Usage list (lines 35-40) ---"
grep -n "" "$V5" | sed -n '35,40p' | tee -a "$OUT/probe4.log"
note "=== probe4 done ==="
