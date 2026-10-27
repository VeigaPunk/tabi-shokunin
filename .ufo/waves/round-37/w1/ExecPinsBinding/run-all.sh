#!/usr/bin/env bash
# ExecPinsBinding — canonical driver: runs every leg of the B1 binding-depth receipt in
# order and writes each leg's output into the seat's evidence directory (retained).
#
# Usage:  run-all.sh
# Env:    HYAKU_SCRATCH (default /fast/scratch/hyaku) — scratch root for fixture clones;
#         every fixture clone is created with mktemp -d under it and removed on exit.
#
# Legs (see report.md for the reading of each):
#   C1 / v5   V5-L  literal `--rev master`
#             V5-0  clean clone at master
#             V5-1  WORKTREE pins rewritten, uncommitted
#             V5-2  the same rewrite COMMITTED, run at the new commit
#             V5-3  run at the OLD commit (branch tip moved on)
#             V5-4  frozen bytes back in the worktree, run at the rewritten commit
#             V5-E  replace ref grafting the pins blob (default namespace)
#             V5-F  replace ref grafting the pins blob (custom GIT_REPLACE_REF_BASE)
#   C2 / v3   V3-L  literal `--rev master`
#             V3-A  clean clone at master (live Firefox session)
#             V3-B  replace ref in the clone's GIT DIR only (no commit, no tree change)
#             V3-C  graft liveness: honoured vs GIT_NO_REPLACE_OBJECTS=1
#             V3-D  the same clone after the replace ref is removed
#             V3-F  custom-namespace graft
#   extras    layer attribution; config-knob falsifier; clone inheritance.
set -u -o pipefail

SEAT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/w1/ExecPinsBinding
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
EV="$SEAT/evidence"
mkdir -p "$EV" "$S/tmp"
export TMPDIR="$S/tmp"
cleanup() { rm -rf -- "$S"; }
trap cleanup EXIT

for leg in run-binding-depth.sh run-v3c-state-vs-tree.sh run-v5-replace-ref.sh run-custom-replace-namespace.sh run-layer-attribution.sh run-config-knob-falsifier.sh run-clone-inheritance.sh; do
  printf '\n########## %s ##########\n' "$leg" | tee -a "$EV/all-legs.log"
  bash "$SEAT/$leg" 2>&1 | tee -a "$EV/all-legs.log"
  printf '########## end %s (exit %s) ##########\n' "$leg" "${PIPESTATUS[0]}" | tee -a "$EV/all-legs.log"
done
echo "all legs done -> $EV/all-legs.log"
