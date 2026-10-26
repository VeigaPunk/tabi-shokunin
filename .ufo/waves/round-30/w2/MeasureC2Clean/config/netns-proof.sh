#!/bin/sh
S=/fast/scratch/hyaku/tabi-r30/MeasureC2Clean
echo "utc_start=$(date -u +%FT%TZ)"
ip link set lo up 2>/dev/null
echo "netns_link=$(ip -brief link show lo | tr -s ' ')"
echo "netns_routes=$(ip route show | wc -l)"
curl -sS --max-time 3 -o /dev/null -w 'probe_https_ietf_http=%{http_code}\n' https://www.ietf.org/ 2>&1; echo "probe_curl_exit=$?"
cd "$S/clone" || exit 9
TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --frontier rate-tos-signal --since 2026-10-26 --live --json > "$S/netns-live-tip.json" 2>"$S/netns-live-tip.stderr"
echo "counter_live_exit=$?"
TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --frontier rate-tos-signal --since 2026-10-26 --json > "$S/netns-offline-tip.json" 2>&1
echo "counter_offline_exit=$?"
echo "utc_end=$(date -u +%FT%TZ)"
