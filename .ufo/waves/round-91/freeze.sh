#!/usr/bin/env bash
# Round-91 instrument freeze: pins the six instruments, the two prior probes and the prior set.
# Writes freeze-<digest>.txt and never truncates an earlier freeze; freeze.txt is a copy of the
# latest freeze (the D3 bytes). The scored receipt's nonce is read from claims.json once it exists:
# a re-freeze never renames a receipt and never claims a nonce of its own (Sentinel F3, round 91).
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
cd "$LANE"
W=.ufo/waves/round-91
sha256sum \
  scripts/chrome-cdp-showpicker-proxy-round91.mjs \
  scripts/check-showpicker-proxy-round91.mjs \
  scripts/negatives-showpicker-proxy-round91.mjs \
  scripts/kill-power-proxy-round91.mjs \
  scripts/selftest-r91-gates.mjs \
  scripts/check-record-drift-round91.mjs \
  .ufo/waves/round-91/controls/c1/probes/probe4.json \
  .ufo/waves/round-91/controls/c1/probes/probe5.json \
  .ufo/waves/round-91/controls/c1/prior-set.txt > "$W/freeze.new"
DIGEST=$(head -6 "$W/freeze.new" | sha256sum | cut -c1-12)
OUT="$W/freeze-${DIGEST}.txt"
if [ -e "$OUT" ]; then
  echo "freeze ${DIGEST} already exists; refusing to overwrite (a new freeze needs new instrument bytes)" >&2
  rm -f "$W/freeze.new"
  exit 3
fi
cp "$W/freeze.new" "$OUT"
rm -f "$W/freeze.new"
echo "# digest ${DIGEST} (sha256 of the six instrument pin lines, first 12 hex)" >> "$OUT"
SCORED=$(python3 -c "import json;print(json.load(open('$W/claims.json'))['nonce'])" 2>/dev/null || true)
if [ -n "$SCORED" ]; then
  echo "# the scored receipt's nonce is ${SCORED} (read from claims.json; a re-freeze never renames a receipt)" >> "$OUT"
else
  echo "# no claims.json nonce yet: tabi-r91-l1-${DIGEST} is this freeze's candidate nonce, used only if a scored receipt is produced after it" >> "$OUT"
fi
cp "$OUT" "$W/freeze.txt"
echo "digest=${DIGEST}"
echo "artifact=${OUT}"
