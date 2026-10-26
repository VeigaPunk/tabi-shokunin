#!/usr/bin/env bash
# ScribeErrataS128 (tabi r34 w1) — read-only HTTPS GETs for the S128 supersede draft.
# Every fetch: URL, UTC stamp, HTTP status, byte count, sha256 appended to fetch-receipts.tsv.
set -u
S=/fast/scratch/hyaku/tabi-r34/ScribeErrataS128
R=$S/receipts
mkdir -p "$R"
TSV=$S/fetch-receipts.tsv
: > "$TSV"
printf 'name\turl\tutc\thttp\tbytes\tsha256\n' >> "$TSV"

get() { # get <name> <url>
  local name=$1 url=$2 out="$R/$1" code utc bytes sha
  utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  code=$(curl -q -sS --proto =https -o "$out" -w '%{http_code}' "$url" 2>"$S/curl.err.$name")
  local rc=$?
  bytes=$(stat -c %s "$out")
  if [ "$code" = "200" ]; then
    sha=$(sha256sum "$out" | cut -d' ' -f1)
  else
    sha="404-BODY-RECORDED-IN-TEXT"   # 404 bodies vary per request: recorded by body text, not sha
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$url" "$utc" "$code" "$bytes" "$sha" >> "$TSV"
  printf '%-28s http=%s bytes=%-7s sha=%s rc=%s\n' "$name" "$code" "$bytes" "$sha" "$rc"
}

PKG_COMMIT=871c2ad960ad54af03579cb90a1c9656485ea598
LCH_COMMIT=a7ed2cb89fe28c91199524c828866201c9d6b5e5

get PKGBUILD.$PKG_COMMIT \
  "https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/$PKG_COMMIT/PKGBUILD"
get launcher.c.$LCH_COMMIT \
  "https://raw.githubusercontent.com/foutrelis/chromium-launcher/$LCH_COMMIT/launcher.c"
get Makefile.$LCH_COMMIT \
  "https://raw.githubusercontent.com/foutrelis/chromium-launcher/$LCH_COMMIT/Makefile"
get launcher.c.tag-v8 \
  "https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/launcher.c"
get Makefile.tag-v8 \
  "https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/Makefile"
get gitlab-commits-154.0.8037.97-1.atom \
  "https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/commits/154.0.8037.97-1?format=atom"
get github-commits-v8.atom \
  "https://github.com/foutrelis/chromium-launcher/commits/v8.atom"
get PKGBUILD.ref-154.0.8037.97-1 \
  "https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/154.0.8037.97-1/PKGBUILD"
