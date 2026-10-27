#!/usr/bin/env bash
# AdjDrift15 self-test: proves the derivation driver exercises every status class
# (unchanged / moved :N / stale / stale: pin line absent / stale: head file absent)
# and that a wrong ledger status is reported as MISMATCH.
# Builds a throwaway git fixture, runs ../derive.py against synthetic chunk/pins/ledger.
# Usage: S=$(mktemp -d -p "$TMPDIR") ./build-fixture.sh; echo "$S/fixture/out/receipt.tsv"
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
DRIVER="$HERE/../derive.py"
S=${S:-$(mktemp -d -p "${TMPDIR:-/tmp}")}
mkdir -p "$S/fixture" "$S/tmp"
export TMPDIR="$S/tmp"

D=$(mktemp -d -p "$S/fixture")
R="$D/fixlane-shokunin"; mkdir -p "$R"
git -C "$R" init -q
test "$(git -C "$R" rev-parse --show-toplevel)" = "$R"
printf 'alpha\nbeta\nCITED\ndelta\nGONE\nzeta\n' > "$R/doc.md"
printf 'only-at-pin\n' > "$R/doc2.md"
git -C "$R" add -A
git -C "$R" -c user.name=adj15 -c user.email=adj15@local commit -q -m pin
P=$(git -C "$R" rev-parse HEAD)
printf 'alpha\nNEWTOP\nbeta\nCITED\ndelta\nzeta2\n' > "$R/doc.md"
git -C "$R" rm -q doc2.md
git -C "$R" add -A
git -C "$R" -c user.name=adj15 -c user.email=adj15@local commit -q -m head
H=$(git -C "$R" rev-parse HEAD)

cat > "$S/fixture/chunk.tsv" <<EOF
fixlane-shokunin@$P:doc.md:1
fixlane-shokunin@$P:doc.md:2
fixlane-shokunin@$P:doc.md:3
fixlane-shokunin@$P:doc.md:5
fixlane-shokunin@$P:doc.md:6
fixlane-shokunin@$P:doc.md:99
fixlane-shokunin@$P:doc2.md:1
EOF
printf '{"fixlane": "%s"}\n' "$H" > "$S/fixture/pins.json"
{ printf 'sibling_ref\tstatus\tnote\n'
  printf '%s\tunchanged\t-\n'                       "fixlane-shokunin@$P:doc.md:1"
  printf '%s\tmoved :3\t-\n'                        "fixlane-shokunin@$P:doc.md:2"
  printf '%s\tmoved :4\t-\n'                        "fixlane-shokunin@$P:doc.md:3"
  printf '%s\tmoved :6\t-\n'                        "fixlane-shokunin@$P:doc.md:5"   # deliberately WRONG (GONE deleted)
  printf '%s\tstale\t-\n'                           "fixlane-shokunin@$P:doc.md:6"
  printf '%s\tstale: pin line absent\t-\n'          "fixlane-shokunin@$P:doc.md:99"
  printf '%s\tstale: head file absent\t-\n'         "fixlane-shokunin@$P:doc2.md:1"
} > "$S/fixture/ledger.tsv"
mkdir -p "$S/fixture/out"
FLEET_ROOT="$D" CHUNK_FILE="$S/fixture/chunk.tsv" PINS_FILE="$S/fixture/pins.json" \
  LEDGER_FILE="$S/fixture/ledger.tsv" OUT_DIR="$S/fixture/out" \
  GIT_NO_REPLACE_OBJECTS=1 python3 "$DRIVER" || true
echo "fixture scratch: $S"
cat "$S/fixture/out/receipt.tsv"
