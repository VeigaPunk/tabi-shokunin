#!/usr/bin/env bash
# round-37 measurement: clean clone of REV, frozen counters (taken from the FREEZE commit,
# not the worktree), raw outputs to OUT. Repairs the round-36 harness's two routed defects:
#   - OUT is resolved to an absolute path up front, and the numstat runs inside the clone
#     with an absolute output path (round-36 measure.sh wrote its numstat to a path that no
#     longer existed after the harness changed directory into the clone);
#   - check-freshness is invoked per its usage contract (--worktree with --repo), not with
#     the invalid `--worktree --rev` combination that exited 2 (round-36 no-harm harness leg).
# Usage: measure.sh <40-hex REV> <OUT> <FREEZE>
set -u -o pipefail
REV=$1; OUT=$(realpath -m "$2"); FREEZE=$3
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FLEET=/home/vgpnk/Projects/shokunin
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/L1/m
rm -rf -- "$S"; mkdir -p "$S/tmp" "$S/k" "$OUT"; export TMPDIR="$S/tmp"
trap 'rm -rf -- "$S"' EXIT
d="$S/c"; git clone -q --shared "$LANE" "$d" && git -C "$d" checkout -q --detach "$REV"
[ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || exit 9
short=$(git -C "$d" rev-parse --short=7 HEAD)
full=$(git -C "$d" rev-parse HEAD)
C1=.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs
C2=.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs
R36C1=.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs
R36C2=.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs
R35C1=.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs
R35C2=.ufo/waves/round-35/counters/c2-firefox-bidi.mjs
mkdir -p "$S/k/.ufo/waves/round-37/counters" "$S/k/.ufo/waves/round-36/counters" "$S/k/.ufo/waves/round-35/counters"
for f in $C1 $C2; do git -C "$LANE" show "$FREEZE:$f" > "$S/k/$f"; done
git -C "$LANE" show "$FREEZE:$R36C1" > "$S/k/r36c1.mjs"; git -C "$LANE" show "$FREEZE:$R36C2" > "$S/k/r36c2.mjs"
git -C "$LANE" show "$FREEZE:$R35C1" > "$S/k/r35c1.mjs"; git -C "$LANE" show "$FREEZE:$R35C2" > "$S/k/r35c2.mjs"
P="$OUT/provenance-$short.txt"
{
  echo "rev=$full freeze=$FREEZE"
  echo "porcelain=$(git -C "$d" status --porcelain | wc -l)"
  for f in $C1 $C2; do echo "sha256 $f(freeze) $(sha256sum "$S/k/$f" | cut -d' ' -f1) at-rev $(git -C "$d" show HEAD:$f 2>/dev/null | sha256sum | cut -d' ' -f1)"; done
  for p in scripts/check-adjacency.mjs scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs; do echo "sha256 $p $(sha256sum "$d/$p" | cut -d' ' -f1)"; done
  echo "firefox $(/home/vgpnk/.local/opt/firefox-158.0.1/firefox --version 2>&1) sha256 $(sha256sum /home/vgpnk/.local/opt/firefox-158.0.1/firefox-bin | cut -d' ' -f1)"
  echo "geckodriver $(/home/vgpnk/.local/bin/geckodriver --version 2>&1 | head -1) sha256 $(sha256sum /home/vgpnk/.local/bin/geckodriver | cut -d' ' -f1)"
} > "$P"
node "$S/k/$C1" --rev "$full" --repo "$d" --fleet "$FLEET" --json > "$OUT/c1-at-$short.json" 2> "$OUT/c1-at-$short.stderr"; echo "c1 exit=$?" >> "$P"
node "$S/k/$C2" --rev "$full" --repo "$d" --json > "$OUT/c2-at-$short.json" 2> "$OUT/c2-at-$short.stderr"; echo "c2 exit=$?" >> "$P"
node "$S/k/r36c1.mjs" --rev "$full" --repo "$d" --fleet "$FLEET" --json > "$OUT/r36c1-at-$short.json" 2> "$OUT/r36c1-at-$short.stderr"; echo "r36-c1 (no-harm: honest state still predicate-true under v4) exit=$?" >> "$P"
node "$S/k/r36c2.mjs" --rev "$full" --repo "$d" --json > "$OUT/r36c2-at-$short.json" 2> "$OUT/r36c2-at-$short.stderr"; echo "r36-c2 (no-harm: honest evidence still admitted under v2) exit=$?" >> "$P"
node "$S/k/r35c1.mjs" --rev "$full" --repo "$d" --fleet "$FLEET" --json > "$OUT/r35c1-at-$short.json" 2> "$OUT/r35c1-at-$short.stderr"; echo "r35-c1 (no-harm: unaccounted stays 0) exit=$?" >> "$P"
node "$S/k/r35c2.mjs" --rev "$full" --repo "$d" --json > "$OUT/r35c2-at-$short.json" 2> "$OUT/r35c2-at-$short.stderr"; echo "r35-c2 (no-harm: honest evidence still admitted under v1) exit=$?" >> "$P"
(cd "$d" && node scripts/check-selfassessment.mjs --rev HEAD --json) > "$OUT/selfassessment-at-$short.json" 2>&1; echo "selfassessment exit=$?" >> "$P"
{
  cd "$d"
  for c in "node scripts/check-adjacency.mjs --at $full --fleet $FLEET" \
           "node scripts/check-gate-registry.mjs --rev HEAD" \
           "node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47" \
           "node scripts/check-s106-evidence.mjs --rev HEAD" \
           "node scripts/check-frontier-admission.mjs --rev HEAD --frontier rate-tos-signal --since 2026-10-27" \
           "node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md" \
           "node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md" \
           "node scripts/check-freshness.mjs --worktree --repo $d" \
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
# numstat stays inside the clone's cwd but writes through the absolute OUT path; the diff
# runs against the clone (not the live lane worktree).
git -C "$d" diff --numstat "11c64b96f357de106c30a71c5e21ca44a3eacdc0" "$full" -- SKILL.md SCORECARD.md LOG.md corpus/README.md corpus/QUALITY.md corpus/SOURCES.md corpus/adjacency.tsv corpus/adjacency-screen.tsv corpus/adjacency-screen-browser.tsv corpus/adjacency-screen-drift.tsv corpus/knowledge corpus/lessons scripts > "$OUT/numstat-at-$short.txt"
echo "measured $short"
