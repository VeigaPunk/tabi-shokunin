#!/usr/bin/env bash
# Rebuild the exact scratch trees used by seat R70Mut2 (tabi round 70) for
# mutation-testing scripts/verify-live-r70.mjs. Writes only under $S.
# Usage: setup.sh [S]      default S=/fast/scratch/hyaku/tabi-r70/R70Mut2
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
S=${1:-/fast/scratch/hyaku/tabi-r70/R70Mut2}
mkdir -p "$S"

# s/: pristine lane copy (scripts + the two evidence receipts + the committed forger)
rm -rf "$S/s" "$S/d" "$S/e" "$S/t"
mkdir -p "$S/s"
cp -a "$LANE/scripts" "$S/s/"
mkdir -p "$S/s/corpus/evidence/round69/chromium-synth-scroll-gesture" \
         "$S/s/corpus/evidence/round70/chromium-synth-tap-gesture"
cp "$LANE/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json" \
   "$S/s/corpus/evidence/round69/chromium-synth-scroll-gesture/"
cp "$LANE/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json" \
   "$S/s/corpus/evidence/round70/chromium-synth-tap-gesture/"
cp "$LANE/.ufo/waves/round-70/controls/forgers/forger.mjs" "$S/s/forger.mjs"

# d/: counter-swap probe tree (pinned r69 counter replaced by an exit-9 stub)
cp -a "$S/s" "$S/d"
printf '#!/usr/bin/env node\nprocess.exit(9);\n' > "$S/d/scripts/check-synthscroll-r69.mjs"

# e/: missing-evidence probe tree (r70 evidence receipt removed)
cp -a "$S/s" "$S/e"
rm -f "$S/e/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json"

# t/: control drivers -- byte-identical copy and a tampered copy of the frozen r69 driver
mkdir -p "$S/t"
cp "$S/s/scripts/chrome-cdp-synthscroll-round69.mjs" "$S/t/copy-r69.mjs"
cp "$S/s/scripts/chrome-cdp-synthscroll-round69.mjs" "$S/t/tampered-r69.mjs"
printf '\n// tampered\n' >> "$S/t/tampered-r69.mjs"

# assert the pins the verifier enforces
test "$(sha256sum "$S/s/scripts/verify-live-r70.mjs" | cut -c1-64)" = 99442a2c385387148d12167072cafb764590def99ef0172e41c0f90ed75376b8
test "$(sha256sum "$S/s/scripts/check-synthscroll-r69.mjs" | cut -c1-64)" = c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795
test "$(sha256sum "$S/s/scripts/chrome-cdp-synthscroll-round69.mjs" | cut -c1-64)" = 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3
test "$(sha256sum "$S/s/scripts/check-synthtap-r70.mjs" | cut -c1-64)" = a2ed7619ca6ea165a3877308c3d87c41a27f6b2a7f24a7fca4f879073a39756e
test "$(sha256sum "$S/s/scripts/chrome-cdp-synthtap-round70.mjs" | cut -c1-64)" = 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577
echo "trees ready under $S"
