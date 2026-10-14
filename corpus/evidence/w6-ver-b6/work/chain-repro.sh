#!/bin/bash
# VER-B6 — independent re-run, tabi fixture v2 chain cell + fixture-byte checks.
# Uses MY ports (19741/19743) and MY copies (frozen/) so no live seat is disturbed.
set -u
W=/tmp/w6-ver-b6
F=$W/frozen
E=$W/evidence
PA=19741
PB=19743
mkdir -p "$E"
LOG=$E/chain-repro.out
: > "$LOG"

say() { echo "$@" | tee -a "$LOG"; }
req() { # req <file-tag> <curl-args...>
  local tag="$1"; shift
  curl -sS -o "$E/$tag.body" -D "$E/$tag.hdr" "$@" 2>"$E/$tag.err"
  local rc=$?
  say "--- $tag rc=$rc"
  head -1 "$E/$tag.hdr" | tr -d '\r' | sed 's/^/    status: /' | tee -a "$LOG"
  grep -iE '^(location|retry-after|cache-control|content-type):' "$E/$tag.hdr" | tr -d '\r' | sed 's/^/    /' | tee -a "$LOG"
  echo "    body-sha256=$(sha256sum < "$E/$tag.body" | awk '{print $1}') body-bytes=$(stat -c%s "$E/$tag.body")" | tee -a "$LOG"
}

say "== VER-B6 chain repro start $(date -u +%Y-%m-%dT%H:%M:%SZ) ports $PA/$PB"
say "== port precheck"
if ss -ltn | grep -qE ":($PA|$PB)\b"; then say "FATAL: my ports busy"; exit 10; else say "ports free"; fi

python3 "$F/server.py" "$F/site-a" "$PA" "http://127.0.0.1:$PB/chain/landed.html" >"$E/http-a.log" 2>&1 &
APID=$!
python3 "$F/server.py" "$F/site-b" "$PB" >"$E/http-b.log" 2>&1 &
BPID=$!
say "server-a pid=$APID server-b pid=$BPID"
for i in $(seq 1 50); do curl -sf -o /dev/null "http://127.0.0.1:$PA/__ready" && break; sleep 0.2; done
say "server-a ready code: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PA/__ready)"
say "server-b ready code: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PB/__ready)"

say ""
say "== RUN 1 — chain hops, step by step (no redirect following)"
req r1-start   "http://127.0.0.1:$PA/chain/start"
req r1-hop1    "http://127.0.0.1:$PA/chain/hop1"
req r1-hop2    "http://127.0.0.1:$PA/deep/path/hop2"
req r1-landing "http://127.0.0.1:$PB/chain/landed.html"
say "    landing title line: $(grep -o '<title>[^<]*</title>' "$E/r1-landing.body")"
say "    landing origin note: $(grep -o 'port [0-9]* to [0-9]*' "$E/r1-landing.body")"
say "== frozen-vs-repro landing bytes"
say "    frozen site-b landed.html sha256 = $(sha256sum "$F/site-b/chain/landed.html" | awk '{print $1}')"

say ""
say "== RUN 1 — redirect-followed chain (curl -L)"
curl -sS -L --max-redirs 10 -o "$E/r1-follow.body" -D "$E/r1-follow.hdr" -w 'curl_exit=%{exitcode} final_code=%{http_code} url_effective=%{url_effective} redirects=%{num_redirects}\n' "http://127.0.0.1:$PA/chain/start" 2>&1 | tee -a "$LOG"
say "    followed-body-sha256=$(sha256sum < "$E/r1-follow.body" | awk '{print $1}')"

say ""
say "== RUN 1 — robots bytes (the stop-rule input)"
req r1-robots "http://127.0.0.1:$PA/robots.txt"
say "    robots frozen sha256 = $(sha256sum "$F/site-a/robots.txt" | awk '{print $1}')"
say "    disallow prefixes: $(grep -i '^Disallow:' "$E/r1-robots.body" | tr -d '\r')"

say ""
say "== RUN 1 — instrument classes"
req r1-429 "http://127.0.0.1:$PA/rate/429"
req r1-403 "http://127.0.0.1:$PA/rate/403"
req r1-inter "http://127.0.0.1:$PA/gate/interstitial"
say "    interstitial marker present: $(grep -c 'data-tabi-gate="interstitial"' "$E/r1-inter.body")"
say "    interstitial title: $(grep -o '<title>[^<]*</title>' "$E/r1-inter.body")"
req r1-m307 -X POST --data 'cell=307' "http://127.0.0.1:$PA/m/307"
req r1-mecho -X POST --data 'cell=307' "http://127.0.0.1:$PA/m/echo"
say "    m/echo body: $(cat "$E/r1-mecho.body")"

say ""
say "== RUN 2 — identical cell, HTTP-level determinism"
req r2-start   "http://127.0.0.1:$PA/chain/start"
req r2-landing "http://127.0.0.1:$PB/chain/landed.html"
say "== RUN1-vs-RUN2 (status+location+body sha)"
for t in start landing; do
  s1=$(head -1 "$E/r1-$t.hdr" | tr -d '\r'); s2=$(head -1 "$E/r2-$t.hdr" | tr -d '\r')
  h1=$(sha256sum < "$E/r1-$t.body" | awk '{print $1}'); h2=$(sha256sum < "$E/r2-$t.body" | awk '{print $1}')
  [ "$s1" = "$s2" ] && [ "$h1" = "$h2" ] && say "  $t: IDENTICAL ($s1; $h1)" || say "  $t: DIFFER ($s1/$h1 vs $s2/$h2)"
done

say ""
say "== cleanup (kill by PID)"
kill "$APID" "$BPID" 2>/dev/null; sleep 1
kill -0 "$APID" 2>/dev/null && { say "server-a survived TERM; kill -9"; kill -9 "$APID" 2>/dev/null; } || say "server-a gone"
kill -0 "$BPID" 2>/dev/null && { say "server-b survived TERM; kill -9"; kill -9 "$BPID" 2>/dev/null; } || say "server-b gone"
sleep 0.5
say "== closure"
if ss -ltn | grep -qE ":($PA|$PB)\b"; then say "FAIL: my ports still listening"; else say "pass: ports $PA/$PB not listening"; fi
curl -s -o /dev/null "http://127.0.0.1:$PA/chain/start"; say "curl server-a exit=$? (7 = closed)"
curl -s -o /dev/null "http://127.0.0.1:$PB/chain/landed.html"; say "curl server-b exit=$? (7 = closed)"

say ""
say "== request-log witness (server-a)</b>"
say "server-a request lines: $(wc -l < "$E/http-a.log")"
say "hits on disallowed path /private/instrument/probe: $(grep -c -F '/private/instrument/probe' "$E/http-a.log")"
say "hits on /chain/start: $(grep -c -F '/chain/start' "$E/http-a.log")"
say "hits on /rate/429: $(grep -c -F '/rate/429' "$E/http-a.log")"
say "-- server-a log:"; sed 's/^/    /' "$E/http-a.log" | tee -a "$LOG"
say "-- server-b log:"; sed 's/^/    /' "$E/http-b.log" | tee -a "$LOG"
say "== VER-B6 chain repro end $(date -u +%Y-%m-%dT%H:%M:%SZ)"