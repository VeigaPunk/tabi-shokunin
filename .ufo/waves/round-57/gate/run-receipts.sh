#!/usr/bin/env bash
# gate/run-receipts.sh — reproduce every receipt in this directory (round 57, seat R57Gate).
#
# Writes receipts ONLY inside this gate dir, and the selftest's throwaway fixtures ONLY
# under $SCRATCH (honours TMPDIR; override with GATE_SCRATCH or --scratch <dir>).
# Every command is read-only git; the instrument itself writes nothing.
#
# usage: bash gate/run-receipts.sh [--scratch <dir>]
set -u

LANE=$(cd "$(dirname "$0")/../../../.." && pwd)
GATE=$(cd "$(dirname "$0")" && pwd)
V1="$LANE/scripts/check-cited-receipts.mjs"
V2="$LANE/scripts/check-cited-receipts-v2.mjs"
R55=545b251d0c370fa1b75f312a4b3feb5c902d0ac6
HEAD=ef43ececde883cc0368c6c7cfbabe30ef937b717

SCRATCH=${GATE_SCRATCH:-${TMPDIR:-${HOME:-.}}/tabi-gate-v2-scratch}
if [ "${1:-}" = "--scratch" ] && [ -n "${2:-}" ]; then SCRATCH=$2; fi
mkdir -p "$SCRATCH" || { echo "cannot create scratch $SCRATCH" >&2; exit 90; }

# Every receipt command's exit code is recorded inside its receipt file and in
# provenance.txt. A non-zero exit here is a RESULT, not an error.
code() { "$@" >/dev/null 2>&1; echo $?; }

cd "$LANE" || exit 90

# --- red-before: the r55 close revision, the two citing docs the r56 gate read.
node "$V1" --repo "$LANE" --round 55 --json \
  --doc "$R55:corpus/lessons/round-55.md" --doc "$R55:SCORECARD.md" \
  > "$GATE/v1-at-545b251d.json" 2> "$GATE/v1-at-545b251d.stderr.txt"
V1_R55=$?
node "$V2" --repo "$LANE" --round 55 --json \
  --doc "$R55:corpus/lessons/round-55.md" --doc "$R55:SCORECARD.md" \
  > "$GATE/v2-red-before-545b251d.json" 2> "$GATE/v2-red-before-545b251d.stderr.txt"
V2_R55=$?
node "$V2" --repo "$LANE" --round 55 \
  --doc "$R55:corpus/lessons/round-55.md" --doc "$R55:SCORECARD.md" \
  > "$GATE/v2-red-before-545b251d.txt" 2>&1
node "$GATE/classify-relative-misses.mjs" --repo "$LANE" --rev "$R55" \
  --receipt "$GATE/v2-red-before-545b251d.json" --json \
  > "$GATE/r55-classification.json" 2> "$GATE/r55-classification.stderr.txt"

# --- head: v1 green, v2 measured over the same two docs (round 56 = the closed round).
node "$V1" --repo "$LANE" --round 56 --json \
  --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/v1-at-head-round56.json" 2> "$GATE/v1-at-head-round56.stderr.txt"
V1_HEAD56=$?
node "$V1" --repo "$LANE" --round 56 \
  --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/v1-at-head-round56.txt" 2>&1
node "$V2" --repo "$LANE" --round 56 --json \
  --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/v2-at-head-round56.json" 2> "$GATE/v2-at-head-round56.stderr.txt"
V2_HEAD56=$?
node "$V2" --repo "$LANE" --round 56 \
  --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/v2-at-head-round56.txt" 2>&1
node "$GATE/classify-relative-misses.mjs" --repo "$LANE" --rev "$HEAD" \
  --receipt "$GATE/v2-at-head-round56.json" --json \
  > "$GATE/head-round56-classification.json" 2> "$GATE/head-round56-classification.stderr.txt"

# --- head: the same two docs at the round they were written for.
node "$V2" --repo "$LANE" --round 55 --json \
  --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/v2-at-head-round55.json" 2> "$GATE/v2-at-head-round55.stderr.txt"
V2_HEAD55=$?

# --- per-document split at the r55 close: the round's OWN document vs the cumulative one.
# The frozen relative rule resolves at the gate round, so a cumulative document carries
# every older round's relative citations into this round's check; the split is the
# measured evidence for that statement.
slug() { printf '%s' "$1" | tr '/' '_'; }
for doc in corpus/lessons/round-55.md SCORECARD.md; do
  s=$(slug "$doc")
  node "$V1" --repo "$LANE" --round 55 --json --doc "$R55:$doc" \
    > "$GATE/v1-perdoc-r55-${s}.json" 2>/dev/null
  node "$V2" --repo "$LANE" --round 55 --json --doc "$R55:$doc" \
    > "$GATE/v2-perdoc-r55-${s}.json" 2>/dev/null
  node "$V2" --repo "$LANE" --round 56 --json --doc "$HEAD:$doc" \
    > "$GATE/v2-perdoc-head56-${s}.json" 2>/dev/null
done

# --- head: the r56 close document set, at round 56 (what a close-run would see today).
node "$V2" --repo "$LANE" --round 56 --json \
  --doc "$HEAD:corpus/lessons/round-56.md" --doc "$HEAD:SCORECARD.md" --doc "$HEAD:LOG.md" \
  > "$GATE/v2-at-head-r56close-round56.json" 2> "$GATE/v2-at-head-r56close-round56.stderr.txt"
V2_R56CLOSE=$?

# --- selftest at the working bytes.
node "$V2" --selftest --scratch "$SCRATCH" > "$GATE/selftest-at-freeze.txt" 2>&1
SELFTEST=$?
node "$V2" --selftest --scratch "$SCRATCH" --json > "$GATE/selftest-at-freeze.json" 2>&1

# --- measurement annex (NOT the gate contract): the scoped proposal's numbers, so the
# frozen rule's cost and the alternative's cost are both on the record.
node "$GATE/annex-scope-v3.mjs" --repo "$LANE" --round 55 --json   --doc "$R55:corpus/lessons/round-55.md" --doc "$R55:SCORECARD.md" \
  > "$GATE/annex-scope-v3-545b251d.json" 2>/dev/null
node "$GATE/annex-scope-v3.mjs" --repo "$LANE" --round 56 --json   --doc "$HEAD:corpus/lessons/round-55.md" --doc "$HEAD:SCORECARD.md" \
  > "$GATE/annex-scope-v3-head56.json" 2>/dev/null

# --- CLI / exit-class probes (exit 2 classes and the short-hash revision form).
{
  echo "# CLI probes for scripts/check-cited-receipts-v2.mjs (exit 2 = usage error)"
  probe() { local name=$1; shift; "$@" >/dev/null 2>&1; echo "$name exit=$?"; }
  probe "P1-no-round"        node "$V2" --repo "$LANE" --doc "$R55:SCORECARD.md"
  probe "P2-no-doc"          node "$V2" --repo "$LANE" --round 55
  probe "P3-doc-no-colon"    node "$V2" --repo "$LANE" --round 55 --doc "SCORECARD.md"
  probe "P4-unreadable-doc"  node "$V2" --repo "$LANE" --round 55 --doc "$R55:corpus/lessons/absent.md"
  probe "P5-bad-rev"         node "$V2" --repo "$LANE" --round 55 --doc "0000000000000000000000000000000000000000:SCORECARD.md"
  probe "P6-not-a-repo"      node "$V2" --repo "$SCRATCH" --round 55 --doc "$R55:SCORECARD.md"
  probe "P7-unknown-arg"     node "$V2" --repo "$LANE" --round 55 --frobnicate
  echo "P8-short-hash-rev (must run, not exit 2):"
  node "$V2" --repo "$LANE" --round 55 --doc 545b251d:corpus/lessons/round-55.md 2>&1 | tail -2
} > "$GATE/cli-probes.txt" 2>&1

# --- provenance: hashes and exit codes.
{
  echo "seat: R57Gate"
  echo "lane: $LANE"
  echo "host: $(uname -sr) $(uname -m); node $(node --version)"
  echo "scratch: $SCRATCH"
  echo "v1: $V1 sha256=$(sha256sum "$V1" | cut -d' ' -f1)"
  echo "v2: $V2 sha256=$(sha256sum "$V2" | cut -d' ' -f1)"
  echo "classifier sha256=$(sha256sum "$GATE/classify-relative-misses.mjs" | cut -d' ' -f1)"
  echo "annex sha256=$(sha256sum "$GATE/annex-scope-v3.mjs" | cut -d' ' -f1)"
  echo "cases.json sha256=$(sha256sum "$GATE/fixtures/cases.json" | cut -d' ' -f1)"
  echo "fixture-tree per-file sha256 (sorted by path):"
  ( cd "$GATE/fixtures/trees" && find . -type f -print0 | sort -z | xargs -0 sha256sum ) | sed "s|^|  |"
  echo "exit v1-at-545b251d=$V1_R55"
  echo "exit v2-red-before-545b251d=$V2_R55"
  echo "exit v1-at-head-round56=$V1_HEAD56"
  echo "exit v2-at-head-round56=$V2_HEAD56"
  echo "exit v2-at-head-round55=$V2_HEAD55"
  echo "exit v2-at-head-r56close-round56=$V2_R56CLOSE"
  echo "exit selftest-at-freeze=$SELFTEST"
} > "$GATE/provenance.txt"

echo "receipts written to $GATE"
echo "v1@545b251d exit=$V1_R55  v2@545b251d exit=$V2_R55"
echo "v1@head-round56 exit=$V1_HEAD56  v2@head-round56 exit=$V2_HEAD56"
echo "v2@head-round55 exit=$V2_HEAD55  v2@head-r56close-round56 exit=$V2_R56CLOSE"
echo "selftest exit=$SELFTEST"
exit 0
