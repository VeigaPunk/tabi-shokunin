#!/usr/bin/env bash
# run-all.sh — reproduce the round-33 C2 next-generation forgeries and score them.
#
# For each construction (G1, G2, G3, G4, plus the calibration arm G1 --ids golden):
#   1. reset the scratch clone to <rev> and clean it;
#   2. run the construction's builder, which makes ONE variant commit;
#   3. score the variant with the lane's gate AT the variant commit (offline receipt leg);
#   4. score it with v2-predict, the literal reading of the v2 rule text.
# Nothing outside <clone> and <out> is written; the lane checkout is never touched.
#
# The clone MUST be a disposable `git clone --shared` of the lane: step 1 runs
# `git reset --hard` and `git clean -fdx`.
#
# Usage: run-all.sh <clone> <rev> <outdir> [--live]
#   e.g. run-all.sh /fast/scratch/hyaku/tabi-r33/CritForgeNext/clone \
#          e6b0a9074d434ccc307badd312ae7379d1193fea <outdir>
set -euo pipefail
REPO=${1:?usage: run-all.sh <clone> <rev> <outdir> [--live]}
REV=${2:?usage: run-all.sh <clone> <rev> <outdir> [--live]}
OUT=${3:?usage: run-all.sh <clone> <rev> <outdir> [--live]}
LIVE=${4:-}
HERE=$(cd "$(dirname "$0")" && pwd)
BASE=d805d1d6132430118b206a848b85753ab35d1014
ENTRY=corpus/knowledge/webdriver-bidi-runtime-round-32.md
mkdir -p "$OUT"

TOP=$(git -C "$REPO" rev-parse --show-toplevel)
[ "$TOP" = "$(cd "$REPO" && pwd -P)" ] || { echo "refusing: $REPO is not a clone toplevel ($TOP)" >&2; exit 2; }
case "$REV" in (*[!0-9a-f]*|'') echo "refusing: --rev must be 40 lowercase hex" >&2; exit 2;; esac
[ ${#REV} -eq 40 ] || { echo "refusing: --rev must be 40 hex chars" >&2; exit 2; }

# The one real fetch behind G4 (read-only GET, provenance recorded).
if [ ! -f "$OUT/g4-fetch.json" ]; then "$HERE/fetch-g4-junk.sh" "$OUT"; fi

reset_clone() {
  git -C "$REPO" reset -q --hard "$REV"
  git -C "$REPO" clean -q -fdx
  [ "$(git -C "$REPO" rev-parse --show-toplevel)" = "$TOP" ] || { echo "toplevel changed" >&2; exit 2; }
}

score() { # $1=label $2=variant-commit
  node "$HERE/run-gate.mjs" --repo "$REPO" --rev "$2" --out "$OUT/$1.gate.json" ${LIVE:+--live}
  node "$HERE/v2-predict.mjs" --repo "$REPO" --rev "$2" --json > "$OUT/$1.v2predict.json"
  jq -r --arg l "$1" '"V2_PREDICT \($l) wouldPass=\(.wouldPass) " + ([.clauses|to_entries[]|"\(.key)=\(.value.ok)"]|join(" "))' "$OUT/$1.v2predict.json"
}

build() { # $1=label  $2..=builder args
  local label=$1; shift
  reset_clone
  local c
  node "$HERE/$@" --repo "$REPO" --rev "$REV" --json > "$OUT/$label.build.json"
  c=$(jq -r .commit "$OUT/$label.build.json")
  echo "BUILT $label commit=$c"
  score "$label" "$c"
}

build G1 build-G1-golden-sessions.mjs --tmp "$OUT/.tmp" --ids real
build G2 build-G2-honest-body-edit.mjs
build G3 build-G3-inert-driver.mjs
build G4 build-G4-junk-gate-row.mjs --fetch-receipt "$OUT/g4-fetch.json" --sid S180
build G1-calib-golden-ids build-G1-golden-sessions.mjs --tmp "$OUT/.tmp" --ids golden

reset_clone
echo "DONE variants scored under $OUT"
