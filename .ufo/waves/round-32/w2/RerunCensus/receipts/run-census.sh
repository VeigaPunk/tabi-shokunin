#!/usr/bin/env bash
# RerunCensus seat — frontier-step conformance at REV b234a589 vs freeze 4181fff.
# Read-only everywhere except $S (scratch) and receipts dir.
set -u
S=/fast/scratch/hyaku/tabi-r32/RerunCensus
OUT=$S/receipts
mkdir -p "$OUT"
export TMPDIR="$S"
FREEZE=4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
REV=b234a58920134424e0d104f137311ff54a16d26b
FLEET=/home/vgpnk/Projects/shokunin
LANE=$FLEET/tabi-shokunin
CENSUS=$FLEET/scripts/sources-census.sh

step() { # step <label> <cmd...>  — output+rc to receipts/<label>.txt
  local label=$1; shift
  local f="$OUT/$label.txt"
  {
    echo "== $label"
    echo "\$ $*"
    echo "-- utc: $(date -u +%FT%TZ)"
  } > "$f"
  "$@" >> "$f" 2>&1
  local rc=$?
  echo "rc=$rc" >> "$f"
  printf '%-46s rc=%s\n' "$label" "$rc"
}

manual_census() { # manual_census <label> <dir>
  local label=$1
  local dir=$2
  local f="$OUT/manual-$label.txt"
  {
    echo "== frozen manual census ($label) dir=$dir"
    echo "-- utc: $(date -u +%FT%TZ)"
    cd "$dir" || { echo "cd failed"; exit 9; }
    echo "HEAD: $(git rev-parse HEAD)"
    echo "porcelain-lines: $(git status --porcelain | wc -l)"
    echo
    echo '--- rows (grep -cE) ---'
    grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md; echo "rc=$?"
    echo '--- malformed rows NF!=13 (must print 0) ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
    echo '--- tier histogram ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; gsub(/[[:space:]]/,"",t); n[t]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
    echo '--- status histogram ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
    echo '--- duplicate ids (must print nothing) ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d
    echo '--- enum violations and tier inflation (must print nothing) ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {i=$2;k=$4;t=$5;s=$9; gsub(/[[:space:]]/,"",i); gsub(/[[:space:]]/,"",k); gsub(/[[:space:]]/,"",t); gsub(/[[:space:]]/,"",s); if (t !~ /^[ABC]$/) print "tier", i, t; if (s !~ /^(queued|mined|rejected)$/) print "status", i, s; if (k !~ /^(spec|docs|paper|code|tool|dataset|talk|book|community|own-work)$/) print "kind", i, k; if (t=="A" && k=="community") print "tier-inflation", i}' corpus/SOURCES.md
    echo '--- mined rows whose used-by paths do not exist (must print nothing) ---'
    awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF==13 {s=$9; gsub(/[[:space:]]/,"",s); if (s=="mined") {n=split($12, a, /[,;]/); for (j=1;j<=n;j++) {p=a[j]; gsub(/^[[:space:]]+|[[:space:]]+$/,"",p); if (p!="" && p!="—") print p}}}' corpus/SOURCES.md | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done
    echo "manual-census-block-rc=$?"
  } > "$f" 2>&1
  rc=$?
  printf '%-46s rc=%s\n' "manual-$label" "$rc"
}

echo "=== A. freeze $FREEZE (before) ==="
manual_census freeze "$S/freeze"
step sha-check-sources-freeze sha256sum "$S/freeze/scripts/check-sources.mjs"
step validate-file-freeze  "$CENSUS" validate --file "$S/freeze/corpus/SOURCES.md"

echo "=== B. REV $REV (after) ==="
manual_census rev "$S/clone"
step sha-check-sources-rev sha256sum "$S/clone/scripts/check-sources.mjs"
step validate-file-rev     "$CENSUS" validate --file "$S/clone/corpus/SOURCES.md"

echo "=== C. fleet/lane forms ==="
step lane-head "git" -C "$LANE" rev-parse HEAD
step validate-lane-form   "$CENSUS" validate --root "$FLEET" tabi

echo "=== D. per-checkout node gate ==="
( cd "$S/freeze" && TMPDIR="$S" node scripts/check-sources.mjs > "$OUT/check-sources-freeze.txt" 2>&1; echo "check-sources-freeze rc=$?" )
( cd "$S/clone"  && TMPDIR="$S" node scripts/check-sources.mjs > "$OUT/check-sources-rev.txt" 2>&1; echo "check-sources-rev rc=$?" )

echo "=== E. SOURCES.md delta freeze..REV ==="
git -C "$S/clone" diff "$FREEZE" "$REV" -- corpus/SOURCES.md > "$OUT/sources-diff.txt" 2>&1; echo "sources-diff rc=$?"
git -C "$S/clone" diff "$FREEZE" "$REV" --stat -- scripts/ >> "$OUT/sources-diff.txt" 2>&1

echo "=== F. leftover processes owned by this seat ==="
pgrep -fa 'chromedriver|chromium' > "$OUT/pgrep.txt" 2>&1; echo "pgrep rc=$? (1 = none)"
echo DONE
