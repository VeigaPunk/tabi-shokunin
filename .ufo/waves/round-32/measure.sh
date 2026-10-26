#!/usr/bin/env bash
# round-32 after-measurement: clean clone of REV, frozen counters, raw outputs to OUT.
# Usage: measure.sh <REV> <OUT>
set -u -o pipefail
REV=$1; OUT=$2
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FREEZE=4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
B=d805d1d6132430118b206a848b85753ab35d1014
ENTRY=corpus/knowledge/webdriver-bidi-runtime-round-32.md
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r32/L1/m
rm -rf -- "$S"; mkdir -p "$S/tmp" "$OUT"; export TMPDIR="$S/tmp"
trap 'rm -rf -- "$S"' EXIT
d="$S/c"; git clone -q --shared "$LANE" "$d" && git -C "$d" checkout -q --detach "$REV"
[ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || exit 9
short=$(git -C "$d" rev-parse --short=7 HEAD)
{
  echo "rev=$(git -C "$d" rev-parse HEAD)"
  echo "porcelain=$(git -C "$d" status --porcelain | wc -l)"
  for p in scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs; do echo "sha256 $p $(sha256sum "$d/$p" | cut -d' ' -f1)"; done
  echo "frozen-counters-diff-files=$(git -C "$d" diff --name-only "$FREEZE" HEAD -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs | wc -l)"
} > "$OUT/provenance-$short.txt"
(cd "$d" && node scripts/check-bidi-runtime.mjs --rev HEAD --baseline "$B" --entry "$ENTRY" --live --json) > "$OUT/c1-live-at-$short.json" 2> "$OUT/c1-live-at-$short.stderr"; echo "c1-live exit=$?" >> "$OUT/provenance-$short.txt"
(cd "$d" && node scripts/check-bidi-runtime.mjs --rev HEAD --baseline "$B" --entry "$ENTRY" --json) > "$OUT/c1-offline-at-$short.json" 2>&1; echo "c1-offline exit=$?" >> "$OUT/provenance-$short.txt"
(cd "$d" && node scripts/check-selfassessment.mjs --rev HEAD --json) > "$OUT/c2-at-$short.json" 2> "$OUT/c2-at-$short.stderr"; echo "c2 exit=$?" >> "$OUT/provenance-$short.txt"
git -C "$d" diff --numstat "$FREEZE" HEAD -- SKILL.md corpus/README.md SCORECARD.md LOG.md > "$OUT/c2-numstat-at-$short.txt"
# no-harm (offline gates; same commands as w1 ExecNoHarmBase)
{
  cd "$d"
  for c in "node scripts/check-gate-registry.mjs --rev HEAD" \
           "node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47" \
           "node scripts/check-s106-evidence.mjs --rev HEAD" \
           "node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26" \
           "node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md" \
           "node scripts/check-sources.mjs" \
           "/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file $d/corpus/SOURCES.md"; do
    out=$($c 2>&1 | tail -1); echo "$c :: exit=$? :: $out"
  done
  for g in scripts/check-*.mjs scripts/round-evidence-audit.mjs; do
    f=$(grep -oE -- '--self-?test' "$g" | head -1); [ -n "$f" ] || continue
    out=$(node "$g" "$f" 2>&1 | grep -E '_SELFTEST|cases' | tail -1); echo "$g $f :: exit=$? :: $out"
  done
} > "$OUT/noharm-at-$short.txt" 2>&1
echo "measured $short"
