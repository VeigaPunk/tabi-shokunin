#!/bin/sh
S=/fast/scratch/hyaku/tabi-r30/MeasureC2Clean
ip link set lo up 2>/dev/null
curl -sS --max-time 3 -o /dev/null -w 'external_curl_http=%{http_code}\n' https://www.ietf.org/ 2>&1 || echo "external_curl_exit=$?"
cd "$S/t3" || exit 9
HOME="$S/emptyhome" TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26 --live --json > "$S/t3-live-netns.json"
echo "t3 netns live exit=$?"
