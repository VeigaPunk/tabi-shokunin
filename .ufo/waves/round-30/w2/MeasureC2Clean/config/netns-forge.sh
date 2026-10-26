#!/bin/sh
S=/fast/scratch/hyaku/tabi-r30/MeasureC2Clean
ip link set lo up 2>/dev/null
rm -f "$S/srv2/access.log"
SRV="$S/srv2" node "$S/srv2/server.mjs" & P=$!
i=0; while [ $i -lt 100 ]; do grep -q LISTEN "$S/srv2/access.log" 2>/dev/null && break; sleep 0.1; i=$((i+1)); done
curl -sS --max-time 3 -o /dev/null -w 'external_curl_http=%{http_code}\n' https://www.ietf.org/ 2>&1 || echo "external_curl_exit=$?"
cd "$S/t1" || exit 9
HOME="$S/hostilehome2" TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26 --live --json > "$S/t1-live-forged.json"
echo "forged_counter_exit=$?"
kill $P 2>/dev/null; sleep 0.2
echo "--- access.log:"; cat "$S/srv2/access.log"
