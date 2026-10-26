#!/bin/bash
# driver for round-35 C2 determinism falsifier; writes $S/sessions.jsonl
set -u
S=/fast/scratch/hyaku/tabi-r35/ExecFirefoxDeterminism
OUT=$S/sessions.jsonl
export R35_CLONE=$S/clone
export R35_FIREFOX=/home/vgpnk/.local/opt/firefox-158.0.1/firefox
export R35_GECKO=/home/vgpnk/.local/bin/geckodriver
export R35_OUT=$OUT

mkdir -p "$S/tmpA" "$S/tmpB-0123456789012345678901234567890123456789/pad/pad/pad/pad"

run() { # tag n group tmpdir [langmode]
  local tag=$1 n=$2 g=$3 td=$4 lm=${5:-keep}
  local rc
  if [ "$lm" = nolang ]; then
    env -u LANG -u LANGUAGE TMPDIR="$td" R35_TAG="$tag" R35_N="$n" R35_G="$g" \
      node "$S/sessions.mjs"; rc=$?
  else
    TMPDIR="$td" R35_TAG="$tag" R35_N="$n" R35_G="$g" node "$S/sessions.mjs"; rc=$?
  fi
  echo "driver tag=$tag n=$n g=$g tmpdir=$td lang=$lm exit=$rc"
}

echo "driver start $(date -u +%Y-%m-%dT%H:%M:%SZ) node=$(node --version) firefox=$($R35_FIREFOX --version 2>/dev/null) geckodriver=$($R35_GECKO --version)"
run seq       6 1 "$S/tmpA" keep
run conc      6 2 "$S/tmpA" keep
run tmplong   1 1 "$S/tmpB-0123456789012345678901234567890123456789/pad/pad/pad/pad" keep
run nolang    1 1 "$S/tmpA" nolang
echo "driver done $(date -u +%Y-%m-%dT%H:%M:%SZ) lines=$(wc -l < "$OUT")"
