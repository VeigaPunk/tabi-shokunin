#!/usr/bin/env bash
set -u
S=/fast/scratch/hyaku/tabi-r31/ExecLiveStability
OUT="$S/raw"; mkdir -p "$OUT"
META="$S/fetch-meta.tsv"; : > "$META"
printf 'fetch\tpage\tutc\turl\thttp_status\teffective_url\tsize_download\tcurl_rc\n' > "$META"
declare -A URLS=(
 [S119]="https://www.rfc-editor.org/rfc/rfc9309.txt"
 [S120]="https://www.rfc-editor.org/rfc/rfc6585.txt"
 [S121]="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
 [S122]="https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api"
)
for round in 1 2 3; do
  if [ "$round" -gt 1 ]; then
    echo "sleep 130s before fetch round $round; wake $(date -u -d '+130 seconds' +%Y-%m-%dT%H:%M:%SZ)"
    sleep 130
  fi
  for page in S119 S120 S121 S122; do
    url="${URLS[$page]}"
    f="$OUT/$page.$round.bin"
    utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    w=$(curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 \
          -o "$f" -w '%{http_code}\t%{url_effective}\t%{size_download}' "$url")
    rc=$?
    echo "round=$round page=$page rc=$rc $w"
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$round" "$page" "$utc" "$url" "$w" "$rc" >> "$META"
  done
done
echo "FETCH-DONE $(date -u +%Y-%m-%dT%H:%M:%SZ)"
