#!/usr/bin/env bash
# TABI lane B8-1 — the curl control arm (no browser): same state machinery,
# a non-browser client. Records status codes and cookie shape only (never values).
# usage: bash curl-control.sh <out-dir> <port>
set -u
OUT="${1:?usage: curl-control.sh <out> <port>}"
PORT="${2:?usage: curl-control.sh <out> <port>}"
BASE="http://127.0.0.1:$PORT"
JAR="$OUT/cookies.jar"
curl --version | head -1 | sed 's/^/curl: /'

echo "== visit 1 (cold, no cookie)"
curl -s -D "$OUT/visit1.headers" -o "$OUT/visit1.html" -c "$JAR" -w 'visit1 status=%{http_code}\n' "$BASE/"
echo "set-cookie shape (value redacted):"
grep -i '^set-cookie:' "$OUT/visit1.headers" | sed -E 's/tabi_sid=[0-9a-f]+/tabi_sid=<VALUE>/' || echo "  (none)"

echo "== visit 2 (same jar)"
curl -s -o /dev/null -b "$JAR" -c "$JAR" -w 'visit2 status=%{http_code}\n' "$BASE/"
grep -o 'data-visits="[0-9]*"' "$OUT/visit1.html" | sed 's/^/visit1 page /'

echo "== form render (token minted)"
curl -s -o "$OUT/form.html" -b "$JAR" -c "$JAR" -w 'form status=%{http_code}\n' "$BASE/form"
TOKEN=$(grep -o 'name="token" value="[0-9a-f]*"' "$OUT/form.html" | sed 's/.*value="//;s/"//')
echo "token shape: len=${#TOKEN} class=$(case "$TOKEN" in (*[!0-9a-f]*) echo other;; (*) echo lower-hex;; esac)"

echo "== submit 1 (fresh token)"
curl -s -o /dev/null -b "$JAR" -c "$JAR" -w 'submit1 status=%{http_code}\n' --data "token=$TOKEN&note=curl" "$BASE/submit"
echo "== submit 2 (same token replayed)"
curl -s -o /dev/null -b "$JAR" -c "$JAR" -w 'submit2 status=%{http_code}\n' --data "token=$TOKEN&note=curl" "$BASE/submit"

echo "== result page"
curl -s -o "$OUT/result.html" -b "$JAR" -c "$JAR" -w 'result status=%{http_code}\n' "$BASE/result"
grep -o 'data-counter="[0-9]*"' "$OUT/result.html" | sed 's/^/result page /'
grep -o 'data-visits="[0-9]*"' "$OUT/result.html" | sed 's/^/result page /'

echo "== cookie jar shape (values redacted)"
awk 'NF>=7 && ($0 !~ /^#/ || $0 ~ /^#HttpOnly_/) { gsub(/^#HttpOnly_/, "", $1); printf "jar cookie name=%s domain=%s path=%s secure=%s expires=%s valueLen=%d valueClass=%s\n", $6, $1, $3, $4, $5, length($7), ($7 ~ /^[0-9a-f]+$/ ? "lower-hex" : "other"); if ($5 == "0") print "  session-cookie: yes (expires=0)"; else print "  session-cookie: no (expires=" $5 ")"; h = ($0 ~ /^#HttpOnly_/) ? "yes" : "no"; print "  httpOnly-prefix: " h }' "$JAR"

echo "== curl control end $(date -u +%Y-%m-%dT%H:%M:%SZ)"