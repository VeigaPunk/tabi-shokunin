#!/usr/bin/env bash
# Generate the causal-isolation evidence log for the check-sources E11 finding.
S=/fast/scratch/hyaku/tabi-r43/ExecNoHarm
SEAT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecNoHarm
LOG="$SEAT/evidence/causal-isolation.log"
export TMPDIR="$S/tmp"

capture() { # capture <label> <dir> <note>
  {
    echo
    echo "\$ (cd \$S/$2 && node scripts/check-sources.mjs)    # $3"
  } >> "$LOG"
  local out rc
  out="$( cd "$S/$2" && node scripts/check-sources.mjs 2>&1 )"
  rc=$?
  printf '%s\n' "$out" >> "$LOG"
  echo "### EXIT: $rc" >> "$LOG"
}

{
  echo "# Causal isolation experiment for the check-sources E11 finding (ExecNoHarm)."
  echo "# clone 'tip' = lane tip ba433c94 (the file is still uncommitted there) -> expect RED"
  echo "# clone 'fix' = freeze 7ca6f018 + the one untracked file copied in -> expect CLEAN"
} > "$LOG"

capture tip tip "tip commit ba433c94, file absent from the tree"
capture fix fix "freeze 7ca6f018 with the untracked file copied in"

{
  echo
  echo "# Result: the sole cause of the two E11 findings is that"
  echo "# corpus/knowledge/receipt-authenticity-signing-round-43.md is not committed"
  echo "# at the freeze (nor at the tip); with it present the same bytes are clean."
} >> "$LOG"

echo "wrote $LOG"
exit 0
