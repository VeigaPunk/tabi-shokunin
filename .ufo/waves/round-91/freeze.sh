#!/usr/bin/env bash
# Round-91 D1 freeze: pins the six instruments, the two prior probes and the prior set; derives
# the scored-receipt nonce from the six instrument pins (r90 convention).
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
cd "$LANE"
OUT=.ufo/waves/round-91/freeze.txt
sha256sum \
  scripts/chrome-cdp-showpicker-proxy-round91.mjs \
  scripts/check-showpicker-proxy-round91.mjs \
  scripts/negatives-showpicker-proxy-round91.mjs \
  scripts/kill-power-proxy-round91.mjs \
  scripts/selftest-r91-gates.mjs \
  scripts/check-record-drift-round91.mjs \
  .ufo/waves/round-91/controls/c1/probes/probe4.json \
  .ufo/waves/round-91/controls/c1/probes/probe5.json \
  .ufo/waves/round-91/controls/c1/prior-set.txt > "$OUT"
DIGEST=$(head -6 "$OUT" | sha256sum | cut -c1-12)
echo "# digest ${DIGEST} (sha256 of the six instrument pin lines, first 12 hex; the scored nonce is tabi-r91-l1-${DIGEST})" >> "$OUT"
echo "digest=${DIGEST}"
echo "nonce=tabi-r91-l1-${DIGEST}"
