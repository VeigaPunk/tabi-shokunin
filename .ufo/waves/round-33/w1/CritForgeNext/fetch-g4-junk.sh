#!/usr/bin/env bash
# fetch-g4-junk.sh — the one real HTTPS GET behind forgery G4.
#
# Fetches an irrelevant page (Chromium's chrome/test/chromedriver/BUILD.gn, a GN build
# manifest) from the same host as the honest S125 source, and records the provenance the
# lane's Gate rows carry: URL, UTC time, HTTP status, byte count, sha256 — plus a verbatim
# quote located in the decoded bytes. Read-only GET, no cookies, no credentials.
#
# Usage: fetch-g4-junk.sh <outdir>
# Writes <outdir>/g4-fetch.json, g4-fetch.body.txt (wire bytes), g4-fetch.decoded.txt.
set -euo pipefail
OUT=${1:?usage: fetch-g4-junk.sh <outdir>}
mkdir -p "$OUT"
URL='https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/BUILD.gn?format=TEXT'
BODY="$OUT/g4-fetch.body.txt"
HDR="$OUT/g4-fetch.headers.txt"
DEC="$OUT/g4-fetch.decoded.txt"
UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STATUS=$(curl -q -sS --proto =https -D "$HDR" -o "$BODY" -w '%{http_code}' "$URL")
BYTES=$(wc -c < "$BODY" | tr -d ' ')
SHA=$(sha256sum "$BODY" | cut -d' ' -f1)
base64 -d < "$BODY" > "$DEC"
DSHA=$(sha256sum "$DEC" | cut -d' ' -f1)
DBYTES=$(wc -c < "$DEC" | tr -d ' ')
# A verbatim span from the decoded bytes (line 2 of the file, comment marker stripped).
QUOTE=$(sed -n '2p' "$DEC" | sed -e 's/^# //')
if ! grep -qF "$QUOTE" "$DEC"; then echo "quote not located in decoded bytes" >&2; exit 1; fi
HOST=$(printf '%s' "$URL" | sed -E 's#^https://([^/]+)/.*#\1#')
jq -n --arg url "$URL" --arg utc "$UTC" --argjson status "$STATUS" --argjson bytes "$BYTES" \
      --arg sha "$SHA" --argjson decodedBytes "$DBYTES" --arg decodedSha "$DSHA" \
      --arg quote "$QUOTE" --arg host "$HOST" \
  '{url:$url, utc:$utc, status:$status, bytes:$bytes, sha256:$sha, decodedBytes:$decodedBytes, decodedSha256:$decodedSha, quote:$quote, host:$host, method:"GET", proto:"https"}' \
  > "$OUT/g4-fetch.json"
cat "$OUT/g4-fetch.json"
