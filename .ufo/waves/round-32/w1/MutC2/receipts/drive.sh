#!/usr/bin/env bash
# drive.sh — MutC2 mutation protocol: pristine legs -> per-mutant legs with
# byte restoration -> restored legs. Clone working tree is restored to the
# frozen bytes (sha256 checked) between every mutant.
set -u
S=/fast/scratch/hyaku/tabi-r32/MutC2
CLONE="$S/clone"
CNT="$CLONE/scripts/check-selfassessment.mjs"
PRIS="$S/pristine-check-selfassessment.mjs"
FROZEN="77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9"
R="$S/receipts"
mkdir -p "$R" "$S/tmp" "$S/fx"
export TMPDIR="$S/tmp" FXBASE="$S/fx"

legA() { node "$1" --selftest --json > "$2.A.json" 2> "$2.A.err"; echo "$?" > "$2.A.exit"; }
legB() { COUNTER="$1" node "$S/suite.mjs" > "$2.B.jsonl" 2> "$2.B.err"; echo "$?" > "$2.B.exit"; }
legC() { node "$1" --repo "$CLONE" --rev HEAD --json > "$2.C.json" 2> "$2.C.err"; echo "$?" > "$2.C.exit"; }
restore() {
  cp "$PRIS" "$CNT"
  local h; h="$(sha256sum "$CNT" | cut -d' ' -f1)"
  if [ "$h" != "$FROZEN" ]; then echo "RESTORE-FAIL sha256=$h"; exit 9; fi
  echo "restored sha256=$h"
}

echo "== pristine legs"
restore
legA "$CNT" "$R/pristine"; echo "A-exit=$(cat "$R/pristine.A.exit")"
legB "$CNT" "$R/pristine"; echo "B-exit=$(cat "$R/pristine.B.exit")"
legC "$CNT" "$R/pristine"; echo "C-exit=$(cat "$R/pristine.C.exit")"

for m in m01-window-offbyone m02-saturation-gt m03-drop-table-parsing m04-drop-prose-parsing m05-supersession-no-citation m06-supersession-any-state m07-self-supersession m08-drop-verdict-refusal m09-drop-nonzero-exit-refusal m10-group-by-section; do
  echo "== mutant $m"
  cp "$S/mutants/$m.mjs" "$CNT"
  echo "mutated sha256=$(sha256sum "$CNT" | cut -d' ' -f1)"
  legA "$CNT" "$R/$m"; echo "A-exit=$(cat "$R/$m.A.exit")"
  legB "$CNT" "$R/$m"; echo "B-exit=$(cat "$R/$m.B.exit")"
  restore
  legC "$S/mutants/$m.mjs" "$R/$m"; echo "C-exit=$(cat "$R/$m.C.exit")"
done

echo "== restored legs"
legA "$CNT" "$R/restored"; echo "A-exit=$(cat "$R/restored.A.exit")"
legB "$CNT" "$R/restored"; echo "B-exit=$(cat "$R/restored.B.exit")"
legC "$CNT" "$R/restored"; echo "C-exit=$(cat "$R/restored.C.exit")"
echo "== clone porcelain lines: $(git -C "$CLONE" status --porcelain | wc -l)"
echo "== done"
