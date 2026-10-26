#!/usr/bin/env bash
# ReopenS128 — independent re-fetch of S128's pinned bytes (read-only HTTPS GETs, allowed hosts only)
set -u
S=/fast/scratch/hyaku/tabi-r33/ReopenS128
D="$S/receipts"
mkdir -p "$D" "$S/tmp"
export TMPDIR="$S/tmp"
tsv="$D/fetch-receipts.tsv"
printf 'name\turl\tutc\tstatus\tbytes\tsha256\n' > "$tsv"
fetch() {
  local name="$1" url="$2" out="$D/$1" utc code rc bytes sha
  utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  code=$(curl -q -sS --proto =https -o "$out" -w '%{http_code}' "$url")
  rc=$?
  if [ "$rc" -ne 0 ]; then
    printf '%s\t%s\t%s\tCURL_FAIL_rc=%s\t-\t-\n' "$name" "$url" "$utc" "$rc" >> "$tsv"
    return 1
  fi
  bytes=$(wc -c < "$out")
  sha=$(sha256sum "$out" | cut -d' ' -f1)
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$url" "$utc" "$code" "$bytes" "$sha" >> "$tsv"
}
fetch PKGBUILD.871c2ad9 'https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD'
fetch launcher.c.a7ed2cb8 'https://raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c'
fetch Makefile.a7ed2cb8 'https://raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/Makefile'
fetch launcher.c.tag-v8 'https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/launcher.c'
fetch Makefile.tag-v8 'https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/Makefile'
fetch gitlab-commits-154.0.8037.97-1.atom 'https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/commits/154.0.8037.97-1?format=atom'
fetch github-commits-v8.atom 'https://github.com/foutrelis/chromium-launcher/commits/v8.atom'
rc=0
grep -q 'CURL_FAIL' "$tsv" && rc=1
cat "$tsv"
exit $rc
