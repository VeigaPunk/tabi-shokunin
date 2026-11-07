#!/usr/bin/env bash
# Frozen scored run for tabi round 81 (C1 predicate C1-SHOWPICKER-R81, legs a-c).
# The arguments are the frozen ones: driver pin, nonce tabi-r81-l1-a2183a933622, the committed
# prior set, the scored receipt, the battery and the kill power. Run from the lane root.
set -euo pipefail
LANE="$(cd "$(dirname "$0")/.." && pwd)"
L1="${1:-$LANE}"
DRV="$(sha256sum "$LANE/scripts/chrome-cdp-showpicker-round81.mjs" | cut -d' ' -f1)"
REC="$LANE/corpus/evidence/round81/chromium-showpicker/receipt.json"
FIX="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).fixture.sha256)" "$REC")"
PS="$LANE/.ufo/waves/round-81/controls/c1/prior-set.txt"
node "$LANE/scripts/check-showpicker-r81.mjs" --lane "$L1" --receipt "$REC" \
  --expect-driver-sha256 "$DRV" --expect-nonce tabi-r81-l1-a2183a933622 --expect-fixture-sha256 "$FIX" \
  --prior-set "$PS" --json
node "$LANE/scripts/negatives-showpicker-r81.mjs" --lane "$L1" --real "$REC" \
  --expect-driver-sha256 "$DRV" --expect-nonce tabi-r81-l1-a2183a933622 --expect-fixture-sha256 "$FIX" \
  --prior-set "$PS" --work "${TMPDIR:-/tmp}/tabi-r81-scored-battery" --json
node "$LANE/scripts/kill-power-r81.mjs" --lane "$L1" --real "$REC" \
  --expect-driver-sha256 "$DRV" --expect-nonce tabi-r81-l1-a2183a933622 --expect-fixture-sha256 "$FIX" \
  --prior-set "$PS" --work "${TMPDIR:-/tmp}/tabi-r81-scored-kp" --json
