#!/usr/bin/env bash
# Reproduce every number in R64Revenger.md.
#
#   ./run_all.sh [SCRATCH_DIR]
#
# Scratch defaults to /fast/scratch/hyaku/tabi-r64/R64Revenger and is NOT
# removed here (the seat removes it at the end of its own turn).  Nothing in
# this script writes to a frozen instrument; the counters are only executed.
set -uo pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
SEAT="$LANE/.ufo/waves/round-64/w1/R64Revenger"
S=${1:-/fast/scratch/hyaku/tabi-r64/R64Revenger}
mkdir -p "$S" "$SEAT/counter-runs"
cd "$LANE" || exit 2

DRIVER64=scripts/chrome-cdp-loopback-round64.mjs
DRIVER63=scripts/chrome-cdp-loopback-round63.mjs
PIN64=1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5
PIN63=b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040
C64=.ufo/waves/round-64/counters/chromium-wheel-r64.mjs
C63=.ufo/waves/round-63/counters/chromium-wheel-r63.mjs
R63=corpus/evidence/round63/chromium-wheel-scroll

echo "== pins =="
sha256sum "$DRIVER64" "$C64" .ufo/waves/round-64/counters/png-r64.mjs scripts/verify-live-r64.mjs \
          .ufo/waves/round-64/controls/smoke/receipt.json | tee "$SEAT/counter-runs/pins.txt"

echo "== phase 1: python pixel verification of the committed smoke shots =="
python3 "$SEAT/verify_pixels.py" \
  --receipt .ufo/waves/round-64/controls/smoke/receipt.json \
  --shots .ufo/waves/round-64/controls/smoke \
  --driver "$DRIVER64" --predict \
  --r63-receipt "$R63/receipt.json" --r63-shots "$R63" --r63-driver "$DRIVER63" \
  --forge-dir "$S/forge" --json-out "$SEAT/pixels-smoke.json" > /dev/null
echo "python verdict on smoke: $(python3 -c 'import json,sys;print(json.load(open("'"$SEAT"'/pixels-smoke.json"))["verdict"])')"

echo "== phase 2: counters on the committed receipts =="
node "$C63" "$R63/receipt.json" --driver "$DRIVER63" --expect-driver-sha256 "$PIN63" \
  --shot "$R63" --json > "$SEAT/counter-runs/r63-counter-on-r63-receipt.json"; echo "r63 counter on r63 receipt exit=$?"
node "$C64" "$R63/receipt.json" --driver "$DRIVER64" --expect-driver-sha256 "$PIN64" \
  --shot "$R63" --json > "$SEAT/counter-runs/r64-counter-on-r63-receipt.json"; echo "r64 counter on r63 receipt exit=$?"
node "$C64" .ufo/waves/round-64/controls/smoke/receipt.json --driver "$DRIVER64" \
  --expect-driver-sha256 "$PIN64" --shot .ufo/waves/round-64/controls/smoke --json \
  > "$SEAT/counter-runs/r64-counter-on-smoke.json"; echo "r64 counter on smoke exit=$?"

echo "== phase 3: r63 counter accepts four 1x1 PNGs =="
python3 - "$S/r63-onebyone" <<'PY'
import json, hashlib, os, sys
sys.path.insert(0, '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/w1/R64Revenger')
from verify_pixels import encode_png
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
png = encode_png(1, 1, bytearray(b'\x00\x00\x00\xff'))
r = json.load(open('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round63/chromium-wheel-scroll/receipt.json'))
for step in r['steps']:
    open(os.path.join(out, step['png']), 'wb').write(png)
    step['sha256'] = hashlib.sha256(png).hexdigest()
    step['bytes'] = len(png)
json.dump(r, open(os.path.join(out, 'receipt.json'), 'w'), indent=1)
print('1x1 png bytes=%d sha256=%s' % (len(png), hashlib.sha256(png).hexdigest()))
PY
node "$C63" "$S/r63-onebyone/receipt.json" --driver "$DRIVER63" --expect-driver-sha256 "$PIN63" \
  --shot "$S/r63-onebyone" --json > "$SEAT/counter-runs/r63-counter-on-one-by-one.json"; echo "r63 counter on 4x 1x1 exit=$?"
node "$C64" "$S/r63-onebyone/receipt.json" --driver "$DRIVER64" --expect-driver-sha256 "$PIN64" \
  --shot "$S/r63-onebyone" --json > "$SEAT/counter-runs/r64-counter-on-one-by-one.json"; echo "r64 counter on 4x 1x1 exit=$?"

echo "== phase 4: independent live driver run, timed =="
mkdir -p "$S/driver-run"
/usr/bin/time -f "WALL %e s MAXRSS %M KB" node "$DRIVER64" --scratch "$S/driver-run" \
  --out "$S/driver-run/receipt.json" --nonce tabi-r64-revenger-one \
  --http-port 18641 --cdp-port 19641 > "$S/driver-run.stdout" 2> "$S/driver-run.time"
echo "driver exit=$?"; cat "$S/driver-run.time"
node "$C64" "$S/driver-run/receipt.json" --driver "$DRIVER64" --expect-driver-sha256 "$PIN64" \
  --shot "$S/driver-run" --json > "$SEAT/counter-runs/r64-counter-on-live-sample.json"; echo "counter on live sample exit=$?"
python3 "$SEAT/verify_pixels.py" --receipt "$S/driver-run/receipt.json" --shots "$S/driver-run" \
  --driver "$DRIVER64" --predict --json-out "$SEAT/pixels-live-sample.json" > /dev/null
echo "python verdict on live sample: $(python3 -c 'import json;print(json.load(open("'"$SEAT"'/pixels-live-sample.json"))["verdict"])')"

echo "== phase 5: python-forged shots vs the frozen counter =="
python3 - "$S/forge" "$S/forge/receipt.json" <<'PY'
import json, hashlib, os, sys
sys.path.insert(0, '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/w1/R64Revenger')
forge, out = sys.argv[1], sys.argv[2]
r = json.load(open('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/controls/smoke/receipt.json'))
for leg in r['legs']:
    b = open(os.path.join(forge, leg['shot']), 'rb').read()
    leg['shotSha256'] = hashlib.sha256(b).hexdigest()
    leg['shotBytes'] = len(b)
json.dump(r, open(out, 'w'), indent=1)
PY
node "$C64" "$S/forge/receipt.json" --driver "$DRIVER64" --expect-driver-sha256 "$PIN64" \
  --shot "$S/forge" --json > "$SEAT/counter-runs/r64-counter-on-python-forged.json"; echo "counter on python-forged shots exit=$?"

echo "== phase 6: python predictor vs node counter, six receipts =="
: > "$SEAT/agreement.txt"
for pair in \
  "smoke:.ufo/waves/round-64/controls/smoke:.ufo/waves/round-64/controls/smoke/receipt.json:$SEAT/counter-runs/r64-counter-on-smoke.json" \
  "red-one-by-one:.ufo/waves/round-64/controls/red-before/one-by-one:.ufo/waves/round-64/controls/red-before/one-by-one/receipt.json:.ufo/waves/round-64/controls/red-one-by-one.stdout" \
  "red-borrowed-shots:.ufo/waves/round-64/controls/red-before/borrowed-shots:.ufo/waves/round-64/controls/red-before/borrowed-shots/receipt.json:.ufo/waves/round-64/controls/red-borrowed-shots.stdout" \
  "red-no-shots:.ufo/waves/round-64/controls/red-before/no-shots:.ufo/waves/round-64/controls/red-before/no-shots/receipt.json:.ufo/waves/round-64/controls/red-no-shots.stdout" \
  "red-synthetic:.ufo/waves/round-64/controls/red-before/synthetic-rendering:.ufo/waves/round-64/controls/red-before/synthetic-rendering/receipt.json:.ufo/waves/round-64/controls/red-synthetic-rendering.stdout" \
  "r63-committed:$R63:$R63/receipt.json:$SEAT/counter-runs/r64-counter-on-r63-receipt.json" \
  "live-sample:$S/driver-run:$S/driver-run/receipt.json:$SEAT/counter-runs/r64-counter-on-live-sample.json" \
  "python-forged:$S/forge:$S/forge/receipt.json:$SEAT/counter-runs/r64-counter-on-python-forged.json" ; do
  name=${pair%%:*}; rest=${pair#*:}; dir=${rest%%:*}; rest=${rest#*:}; rec=${rest%%:*}; nodeout=${rest#*:}
  python3 "$SEAT/verify_pixels.py" --receipt "$rec" --shots "$dir" --driver "$DRIVER64" \
    --predict --json-out "$S/agree-$name.json" > /dev/null 2>&1
  python3 - "$name" "$S/agree-$name.json" "$nodeout" >> "$SEAT/agreement.txt" <<'PY'
import json, sys
name, pyf, nodef = sys.argv[1], sys.argv[2], sys.argv[3]
py = json.load(open(pyf))['predicted']['main']
node = json.load(open(nodef))['findings']
print('%-22s python=%2d node=%2d match=%s %s' % (name, len(py), len(node), py == node,
      '' if py == node else ('python-only=%s node-only=%s' % (sorted(set(py)-set(node)), sorted(set(node)-set(py))))))
PY
done
cat "$SEAT/agreement.txt"
