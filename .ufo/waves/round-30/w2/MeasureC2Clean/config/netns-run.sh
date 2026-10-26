#!/bin/sh
S=/fast/scratch/hyaku/tabi-r30/MeasureC2Clean
ip link set lo up 2>&1 || echo "lo_up_failed"
ip -brief addr show lo
rm -f "$S/srv/access.log"
SRV="$S/srv" node "$S/srv/server.mjs" &
SRVPID=$!
i=0
while [ $i -lt 100 ]; do grep -q LISTEN "$S/srv/access.log" 2>/dev/null && break; sleep 0.1; i=$((i+1)); done
echo "server_ready=$(grep -c LISTEN "$S/srv/access.log" 2>/dev/null)"
curl -sS --max-time 3 -o /dev/null -w 'external_curl_http=%{http_code}\n' https://www.ietf.org/ 2>&1 || echo "external_curl_exit=$?"
cd "$S/clone" || exit 9
HOME="$S/hostilehome" TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --frontier rate-tos-signal --since 2026-10-26 --live --json > "$S/c2-live-netns-localcurlrc.json"
echo "counter_exit=$?"
kill $SRVPID 2>/dev/null
sleep 0.2
echo "--- access.log:"; cat "$S/srv/access.log"
