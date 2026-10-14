#!/usr/bin/env bash
# TABI lane B9-1 — the cross-client replay arm (two independent clients, one server;
# no browser). Records statuses, page counters and jar shapes; token and cookie
# values are never printed (length + charset class only).
# usage: bash curl-replay.sh <cell> <out-dir> <port>
set -u
CELL="${1:?usage: curl-replay.sh <cell> <out> <port>}"
OUT="${2:?usage: curl-replay.sh <cell> <out> <port>}"
PORT="${3:?usage: curl-replay.sh <cell> <out> <port>}"
BASE="http://127.0.0.1:$PORT"
JAR_A="$OUT/clientA.jar"
JAR_B="$OUT/clientB.jar"
curl --version | head -1 | sed 's/^/curl: /'

token_of() { grep -o 'name="token" value="[0-9a-f]*"' "$1" | sed 's/.*value="//;s/"//'; }
token_shape() { local t="$1"; echo "len=${#t} class=$(case "$t" in (*[!0-9a-f]*) echo other;; (*) echo lower-hex;; esac)"; }
jar_shape() {
  awk -v j="$(basename "$1")" 'NF>=7 && ($0 !~ /^#/ || $0 ~ /^#HttpOnly_/) { pfx = ($0 ~ /^#HttpOnly_/) ? "yes" : "no"; gsub(/^#HttpOnly_/, "", $1); printf "jar=%s name=%s httpOnlyPrefix=%s domain=%s path=%s secure=%s expires=%s valueLen=%d valueClass=%s\n", j, $6, pfx, $1, $3, $4, $5, length($7), ($7 ~ /^[0-9a-f]+$/ ? "lower-hex" : "other") }' "$1"
}

if [ "$CELL" = "xclient-consume" ]; then
  echo "== client A: form render (mints token T in A's request; A gets session s1)"
  curl -s -o "$OUT/a-form.html" -c "$JAR_A" -w 'A form status=%{http_code}\n' "$BASE/form"
  TA=$(token_of "$OUT/a-form.html")
  echo "A token shape: $(token_shape "$TA")"
  echo "== client B: fresh jar, never rendered the form; presents A's token (same body bytes for all submits)"
  curl -s -D "$OUT/b-submit1.headers" -o /dev/null -c "$JAR_B" -w 'B submit status=%{http_code}\n' --data "token=$TA&note=xclient" "$BASE/submit"
  grep -i '^location:' "$OUT/b-submit1.headers" | sed 's/^/B submit header /' || true
  echo "== client B: replays the same request"
  curl -s -o /dev/null -b "$JAR_B" -c "$JAR_B" -w 'B replay status=%{http_code}\n' --data "token=$TA&note=xclient" "$BASE/submit"
  echo "== client A: replays the same request"
  curl -s -o /dev/null -b "$JAR_A" -c "$JAR_A" -w 'A replay status=%{http_code}\n' --data "token=$TA&note=xclient" "$BASE/submit"
  echo "== client B: result page"
  curl -s -o "$OUT/b-result.html" -b "$JAR_B" -c "$JAR_B" -w 'B result status=%{http_code}\n' "$BASE/result"
  grep -o 'data-counter="[0-9]*"' "$OUT/b-result.html" | sed 's/^/B result page /' || true
  echo "== cookie jar shapes (values redacted)"
  jar_shape "$JAR_A"
  jar_shape "$JAR_B"
elif [ "$CELL" = "xclient-sessions" ]; then
  echo "== client A: visit 1"
  curl -s -o "$OUT/a-v1.html" -c "$JAR_A" -w 'A visit1 status=%{http_code}\n' "$BASE/"
  grep -o 'data-visits="[0-9]*"' "$OUT/a-v1.html" | sed 's/^/A visit1 page /'
  echo "== client B: visit 1 (fresh jar; independent client)"
  curl -s -o "$OUT/b-v1.html" -c "$JAR_B" -w 'B visit1 status=%{http_code}\n' "$BASE/"
  grep -o 'data-visits="[0-9]*"' "$OUT/b-v1.html" | sed 's/^/B visit1 page /'
  echo "== client A: visit 2 (same jar)"
  curl -s -o "$OUT/a-v2.html" -b "$JAR_A" -c "$JAR_A" -w 'A visit2 status=%{http_code}\n' "$BASE/"
  grep -o 'data-visits="[0-9]*"' "$OUT/a-v2.html" | sed 's/^/A visit2 page /'
  echo "== cookie jar shapes (values redacted)"
  jar_shape "$JAR_A"
  jar_shape "$JAR_B"
else
  echo "FATAL: unknown curl cell $CELL"; exit 12
fi

echo "== curl-replay end $(date -u +%Y-%m-%dT%H:%M:%SZ)"