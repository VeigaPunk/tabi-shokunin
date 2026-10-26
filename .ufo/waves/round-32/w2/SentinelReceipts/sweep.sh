#!/bin/sh
# SentinelReceipts — reproducible secret/PII sweep over the files wave 1 committed.
# usage: sweep.sh <clean clone at b234a58920134424e0d104f137311ff54a16d26b>
# Reads only; prints counts. No network, no writes outside stdout.
set -u
C=${1:?clone path}
cd "$C" || exit 2
LIST=$(mktemp) || exit 2
git diff --name-only 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 b234a58920134424e0d104f137311ff54a16d26b > "$LIST"
echo "== scope: $(wc -l < "$LIST") files added by wave 1, 0 deleted"

echo "== 1. credential formats in the lane's own gate set (op://, PEM, ghp_, AKIA, xox)"
xargs -a "$LIST" -d '\n' grep -lE 'op://|ghp_[A-Za-z0-9]+|\bAKIA[A-Z0-9]+\b|xox[baprs]-[A-Za-z0-9-]+' 2>/dev/null | wc -l

echo "== 2. Google API keys (AIza) by file"
for f in $(xargs -a "$LIST" -d '\n' grep -lE 'AIza[0-9A-Za-z_-]{33,39}' 2>/dev/null); do
  printf '%6d  %s\n' "$(grep -cE 'AIza[0-9A-Za-z_-]{33,39}' "$f")" "$f"
done
echo "-- distinct AIza values (whole committed set):"
xargs -a "$LIST" -d '\n' grep -hoE 'AIza[0-9A-Za-z_-]{33,39}' 2>/dev/null | sort -u | wc -l
echo "-- occurrences total:"
xargs -a "$LIST" -d '\n' grep -hoE 'AIza[0-9A-Za-z_-]{33,39}' 2>/dev/null | wc -l
echo "-- same key compiled into the host browser binary (provenance):"
strings -a /usr/lib/chromium/chromium 2>/dev/null | grep -cF 'AIzaSyDwr302FpOSkGRpLlUpPThNTDPbXcIn_FM'

echo "== 3. host account name under /home"
echo "-- occurrences / lines / files:"
xargs -a "$LIST" -d '\n' grep -ho '/home/[A-Za-z0-9_.-]*' 2>/dev/null | wc -l
xargs -a "$LIST" -d '\n' grep -h '/home/[A-Za-z0-9_.-]*' 2>/dev/null | wc -l
xargs -a "$LIST" -d '\n' grep -l '/home/[A-Za-z0-9_.-]*' 2>/dev/null | wc -l

echo "== 4. cookie material committed"
echo "-- cookie domains seen:"
xargs -a "$LIST" -d '\n' grep -rhoE '"domain": *"[^"]*"' 2>/dev/null | sort | uniq -c | sort -rn | head -5
echo "-- non-fixture cookie names (expect none):"
xargs -a "$LIST" -d '\n' grep -rhoE '"name":"[^"]*"' 2>/dev/null | grep -vE 'tabi_fixture|Chromium|direct://|gws' | sort -u | head

echo "== 5. authorisation material"
xargs -a "$LIST" -d '\n' grep -rhoiE 'authorization: *[A-Za-z0-9+/=]{4,}|bearer [A-Za-z0-9._-]{8,}' 2>/dev/null | grep -v 'Basic Og==' | sort -u | head

echo "== 6. chromedriver session ids"
echo "-- distinct \"sessionId\" values:"
xargs -a "$LIST" -d '\n' grep -rhoE '"sessionId": *"[0-9a-f]{32}"' 2>/dev/null | grep -oE '[0-9a-f]{32}' | sort -u | wc -l
echo "-- distinct session/<id> links:"
xargs -a "$LIST" -d '\n' grep -rhoE 'session/[0-9a-f]{32}' 2>/dev/null | sort -u | wc -l

echo "== 7. environment capture"
echo "-- strace syscalls per file (execve/environ must be absent):"
for f in .ufo/waves/round-32/w1/ExecNoNetwork/trace-*.out; do
  printf '%s: ' "$(basename "$f")"
  grep -oE '^[0-9]+ +[a-z_]+' "$f" | sed -E 's/^[0-9]+ +//' | sort -u | tr '\n' ' '; echo
done
echo "-- netlog header fields that identify the host:"
grep -oE '"(command_line|os_type|environment)"' .ufo/waves/round-32/w1/ExecNoNetwork/netlog-*.json | sort -u
echo "-- non-loopback inet_addr targets in traces (count of distinct):"
for f in .ufo/waves/round-32/w1/ExecNoNetwork/trace-*.out; do
  n=$(grep -oE 'inet_addr\("[0-9.]+"\)' "$f" | grep -v '127.0.0.1' | sort -u | wc -l)
  printf '%s: %s\n' "$(basename "$f")" "$n"
done

echo "== 8. licence notices retained in the copied third-party bytes"
echo "-- W3C spec copy (copyright + licence link):"
grep -cE 'Copyright</a> © 2026|W3C Software and Document License' .ufo/waves/round-32/w1/ScribeSrcBidiSpec/webdriver-bidi-20261008.html
echo "-- Chrome docs pages (CC BY 4.0 notice):"
grep -lE 'Creative Commons Attribution 4.0 License' .ufo/waves/round-32/w1/ScribeSrcChromeDriver/raw/*.html | wc -l
echo "-- Chromium sources (BSD header):"
head -3 .ufo/waves/round-32/w1/ScribeSrcChromeDriver/capabilities.cc.154.0.8037.97 | grep -c 'Chromium Authors'

echo "== 9. plaintext service bodies recoverable from the netlogs"
python3 - <<'PY'
import re,base64
def blobs(f):
    for i,l in enumerate(open(f,encoding='utf-8',errors='replace'),1):
        for m in re.finditer(r'"byte_count":(\d+),"bytes":"([A-Za-z0-9+/=]{100,})"',l):
            try: yield i,int(m.group(1)),base64.b64decode(m.group(2))
            except Exception: pass
tags={'updater-json':b'"request"','autofill-error':b'Autofill API','tls-record':b'\x16\x03\x01'}
hit={k:0 for k in tags}
for f in ['.ufo/waves/round-32/w1/ExecNoNetwork/netlog-default.json','.ufo/waves/round-32/w1/ExecNoNetwork/netlog-suppress-min.json']:
    for i,n,raw in blobs(f):
        for k,p in tags.items():
            if raw.startswith(p) or p in raw: hit[k]+=1
print(' '.join(f'{k}={v}' for k,v in hit.items()))
PY

echo "== 10. .git/ credential-bearing file types committed (expect 0)"
xargs -a "$LIST" -d '\n' basename -a 2>/dev/null | grep -cE '^\.(env|npmrc|netrc|git-credentials)|id_rsa|\.pem$|\.key$|\.p12$|\.kdbx$'

rm -f "$LIST"
echo "== done exit 0"
