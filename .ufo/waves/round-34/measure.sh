#!/usr/bin/env bash
# round-34 measurement: clean clone of REV, frozen counters (taken from the FREEZE commit,
# not the worktree), raw outputs to OUT.  Usage: measure.sh <40-hex REV> <OUT> <FREEZE>
set -u -o pipefail
REV=$1; OUT=$2; FREEZE=$3
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r34/L1/m
rm -rf -- "$S"; mkdir -p "$S/tmp" "$S/k" "$OUT"; export TMPDIR="$S/tmp"
trap 'rm -rf -- "$S"' EXIT
d="$S/c"; git clone -q --shared "$LANE" "$d" && git -C "$d" checkout -q --detach "$REV"
[ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || exit 9
short=$(git -C "$d" rev-parse --short=7 HEAD)
C1=.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs
C2=.ufo/waves/round-34/counters/c2-gate-mutants.mjs
R33C1=.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs
git -C "$LANE" show "$FREEZE:$C1" > "$S/k/c1.mjs"; git -C "$LANE" show "$FREEZE:$C2" > "$S/k/c2.mjs"; git -C "$LANE" show "$FREEZE:$R33C1" > "$S/k/r33c1.mjs"
P="$OUT/provenance-$short.txt"
{
  echo "rev=$(git -C "$d" rev-parse HEAD) freeze=$FREEZE"
  echo "porcelain=$(git -C "$d" status --porcelain | wc -l)"
  echo "sha256 c1-counter(freeze) $(sha256sum "$S/k/c1.mjs" | cut -d' ' -f1) at-rev $(git -C "$d" show HEAD:$C1 | sha256sum | cut -d' ' -f1)"
  echo "sha256 c2-counter(freeze) $(sha256sum "$S/k/c2.mjs" | cut -d' ' -f1) at-rev $(git -C "$d" show HEAD:$C2 | sha256sum | cut -d' ' -f1)"
  for p in scripts/check-adjacency.mjs scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs; do echo "sha256 $p $(sha256sum "$d/$p" | cut -d' ' -f1)"; done
} > "$P"
node "$S/k/c1.mjs" --rev "$(git -C "$d" rev-parse HEAD)" --repo "$d" --fleet "$FLEET" --json > "$OUT/c1-at-$short.json" 2> "$OUT/c1-at-$short.stderr"; echo "c1 exit=$?" >> "$P"
node "$S/k/c2.mjs" --rev "$(git -C "$d" rev-parse HEAD)" --repo "$d" --json > "$OUT/c2-at-$short.json" 2> "$OUT/c2-at-$short.stderr"; echo "c2 exit=$?" >> "$P"
node "$S/k/r33c1.mjs" --rev "$(git -C "$d" rev-parse HEAD)" --repo "$d" --fleet "$FLEET" --json > "$OUT/r33c1-at-$short.json" 2> "$OUT/r33c1-at-$short.stderr"; echo "r33-c1 (no-harm: unaccounted stays 0) exit=$?" >> "$P"
(cd "$d" && node scripts/check-selfassessment.mjs --rev HEAD --json) > "$OUT/selfassessment-at-$short.json" 2>&1; echo "selfassessment exit=$?" >> "$P"
{
  cd "$d"
  for c in "node scripts/check-adjacency.mjs --at $(git rev-parse HEAD) --fleet $FLEET" \
           "node scripts/check-gate-registry.mjs --rev HEAD" \
           "node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47" \
           "node scripts/check-s106-evidence.mjs --rev HEAD" \
           "node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-26" \
           "node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md" \
           "node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md" \
           "node scripts/check-selfassessment.mjs --rev HEAD" \
           "node scripts/check-sources.mjs" \
           "/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file $d/corpus/SOURCES.md"; do
    out=$($c 2>&1); rc=$?; echo "$c :: exit=$rc :: $(printf '%s\n' "$out" | grep -v '^finding\|^ROW\|W04' | tail -1)"
  done
  for g in scripts/check-*.mjs scripts/round-evidence-audit.mjs; do
    f=$(grep -oE -- '--self-?test' "$g" | head -1); [ -n "$f" ] || continue
    out=$(node "$g" "$f" 2>&1); rc=$?; echo "$g $f :: exit=$rc :: $(printf '%s\n' "$out" | grep -E '_SELFTEST|cases' | tail -1)"
  done
} > "$OUT/noharm-at-$short.txt" 2>&1
echo "measured $short"
