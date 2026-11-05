#!/usr/bin/env bash
# run-controls-r65.sh - tabi round 65, wave w1, seat R65Executor3.
#
# Runs every C1 (adjacency) and C2 (calibration) control, including the
# do-nothing and positive rows, from the lane root. One receipt per control.
#
#   run-controls-r65.sh --rev <40-hex> --out <absolute dir>
#
# Writes into --out, for each control NAME:
#   NAME.stdout, NAME.stderr   raw bytes of the control's streams
#   NAME.command.json          tabi-command-receipt-v1
#   matrix-NAME.json           tabi-command-matrix-v1; input = NAME.command.json
# and producers.json           sha256 of every instrument that ran.
#
# Exit: 0  every control ran and every input resolved at --rev
#       3  controls ran and receipts were written, but at least one input is
#          absent at --rev; such receipts are not freeze-valid
#       2  usage or precondition failure; no control was run
#
# Preconditions (checked before any control runs): the lane containing this
# script has HEAD == --rev, and every input committed at --rev is byte-identical
# in the lane worktree.
# Input bytes are read with `git show <rev>:<path>`; directory inputs expand to
# every committed file below them.
# Limits: inputs are the paths named in each argv (checked against argv at run
# time). Files an instrument reads on its own (its imports, and sibling repos
# under --fleet, which lie outside the lane) are not enumerated.
set -euo pipefail

die() { printf 'run-controls-r65: %s\n' "$2" >&2; exit "$1"; }
usage() { die 2 "usage: $0 --rev <40-hex> --out <absolute dir>"; }

REV=""
OUT=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --rev) [ "$#" -ge 2 ] || usage; REV="$2"; shift 2 ;;
    --out) [ "$#" -ge 2 ] || usage; OUT="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ "$REV" =~ ^[0-9a-f]{40}$ ]] || usage
case "$OUT" in /*) ;; *) usage ;; esac

SELF_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
LANE="$(git -C "$SELF_DIR" rev-parse --show-toplevel 2>/dev/null)" || die 2 "script is not inside a git lane"
HEAD_SHA="$(git -C "$LANE" rev-parse HEAD)"
[ "$HEAD_SHA" = "$REV" ] || die 2 "lane HEAD $HEAD_SHA differs from --rev $REV"
mkdir -p -- "$OUT"
OUT="$(cd -- "$OUT" && pwd -P)"

# --fleet is an absolute path outside the lane: passed to the instruments, not hashed.
FLEET_ROOT="${FLEET_ROOT:-/home/vgpnk/Projects/shokunin}"

# Instruments and fixtures (repo-relative).
SCORED_REV=e3f5215615f68490230bd0c6db94f7d84f0fc084
V21=.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs
V22=.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs
V2=.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs
V1=scripts/check-receipt-provenance.mjs
SNAP=.ufo/waves/round-62/c1/snapshot-r62.tsv
AUDIT=corpus/adjacency-host-audit-r62.tsv
DELTA_DUP=.ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv
DELTA_R62_CONFLICT=.ufo/waves/round-62/w1/R62Reviewer/real-conflicting-delta.tsv
DELTA_R62=corpus/adjacency-host-delta-r62.tsv
FAB_DIR=.ufo/waves/round-65/controls/c1-fab
SCORED_DIR=.ufo/waves/round-64/controls/scored
HONEST_DIR=.ufo/waves/round-65/w1/R65Executor2/c1-honest

# Node programs that write the JSON artifacts (no interpolation; args via argv).
read -r -d '' JS_RECEIPT <<'JS' || true
const fs = require('fs');
const [, outFile, name, rev, rc, stdoutFile, stdoutSha, stderrFile, stderrSha, inputsTsv, ...argv] = process.argv;
const inputs = inputsTsv.split('\n').filter((l) => l !== '').map((l) => {
  const [p, s] = l.split('\t');
  return { path: p, sha256: s ? s : null };
});
const receipt = {
  schema: 'tabi-command-receipt-v1',
  name, argv, cwd: '.', exit: Number(rc),
  stdoutFile, stdoutSha256: stdoutSha, stderrFile, stderrSha256: stderrSha,
  inputs, inputsResolved: inputs.every((i) => i.sha256 !== null), rev,
};
fs.writeFileSync(outFile, JSON.stringify(receipt, null, 2) + '\n');
JS

read -r -d '' JS_MATRIX <<'JS' || true
const fs = require('fs');
const [, outFile, name, rev, inputPath, inputSha] = process.argv;
fs.writeFileSync(outFile, JSON.stringify({ schema: 'tabi-command-matrix-v1', name, rev, input: { path: inputPath, sha256: inputSha } }, null, 2) + '\n');
JS

read -r -d '' JS_PRODUCERS <<'JS' || true
const fs = require('fs');
const [, outFile, rev, runnerSha, ...rows] = process.argv;
const producers = rows.map((r) => {
  const [name, instrument, s] = r.split('\t');
  return { name, instrument, sha256: s ? s : null };
});
fs.writeFileSync(outFile, JSON.stringify({ schema: 'tabi-producers-r65', rev, runner: { path: 'run-controls-r65.sh', sha256: runnerSha }, producers }, null, 2) + '\n');
JS

ARGV=()
INPUTS=()
INPUT_ROWS=()
PRODUCERS=()
UNRESOLVED=0
RUN_COUNT=0
MODE=""

# meter INSTRUMENT DELTA: adjacency meter argv (v21 or v22 with the shared fixtures).
meter() {
  ARGV=(node "$1" --repo . --rev "$REV" --fleet "$FLEET_ROOT" --snapshot "$SNAP" --audit "$AUDIT" --delta "$2" --json)
  INPUTS=("$1" "$SNAP" "$AUDIT" "$2")
}

# gate INSTRUMENT DIR REV MIN: provenance gate argv (v1 or v2).
gate() {
  ARGV=(node "$1" --dir "$2" --repo . --rev "$3" --require-committed --min-receipts "$4" --json)
  INPUTS=("$1" "$2")
}

# check_argv_covered NAME: every path-like argv value must be a listed input.
check_argv_covered() {
  local name="$1" a p found
  for a in "${ARGV[@]:1}"; do
    case "$a" in -*|.|/*|[0-9]*) continue ;; esac
    if [[ "$a" =~ ^[0-9a-f]{40}$ ]]; then continue; fi
    case "$a" in */*|*.mjs|*.tsv|*.json) ;; *) continue ;; esac
    found=0
    for p in "${INPUTS[@]}"; do
      if [ "$p" = "$a" ]; then found=1; fi
    done
    if [ "$found" != 1 ]; then die 2 "$name: argv path '$a' is not listed in its inputs"; fi
  done
}

# guard_inputs: refuse if any input committed at REV differs in the worktree.
guard_inputs() {
  local p
  for p in "${INPUTS[@]}"; do
    if [ -z "$(git -C "$LANE" cat-file -t "$REV:$p" 2>/dev/null || true)" ]; then continue; fi
    if [ -n "$(git -C "$LANE" diff --name-only --no-ext-diff "$REV" -- "$p")" ] || \
       [ -n "$(git -C "$LANE" ls-files --others --exclude-standard -- "$p")" ]; then
      die 2 "lane worktree differs from $REV at $p; commit or restore it before running"
    fi
  done
}

# add_input PATH: append {path, sha256} rows for PATH at REV (directories expand to files).
add_input() {
  local p="$1" type files f sha
  type="$(git -C "$LANE" cat-file -t "$REV:$p" 2>/dev/null || true)"
  if [ -z "$type" ]; then
    INPUT_ROWS+=("$p"$'\t')
    UNRESOLVED=$((UNRESOLVED + 1))
    return 0
  fi
  if [ "$type" = blob ]; then
    sha="$(git -C "$LANE" show "$REV:$p" | sha256sum | cut -d' ' -f1)"
    INPUT_ROWS+=("$p"$'\t'"$sha")
  else
    files="$(git -C "$LANE" ls-tree -r --name-only "$REV" -- "$p")"
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      sha="$(git -C "$LANE" show "$REV:$f" | sha256sum | cut -d' ' -f1)"
      INPUT_ROWS+=("$f"$'\t'"$sha")
    done <<< "$files"
  fi
}

# run_control NAME: run ARGV from the lane root and write receipt, matrix and producer rows.
run_control() {
  local name="$1" rc row inputs_tsv="" stdout_f stderr_f cmd_f cmd_sha cmd_ref
  local stdout_sha stderr_sha instr instr_sha p
  stdout_f="$OUT/$name.stdout"
  stderr_f="$OUT/$name.stderr"
  cmd_f="$OUT/$name.command.json"

  INPUT_ROWS=()
  for p in "${INPUTS[@]}"; do add_input "$p"; done
  for row in "${INPUT_ROWS[@]}"; do inputs_tsv+="$row"$'\n'; done

  set +e
  (cd -- "$LANE" && "${ARGV[@]}") >"$stdout_f" 2>"$stderr_f"
  rc=$?
  set -e

  stdout_sha="$(sha256sum -- "$stdout_f" | cut -d' ' -f1)"
  stderr_sha="$(sha256sum -- "$stderr_f" | cut -d' ' -f1)"
  node -e "$JS_RECEIPT" -- "$cmd_f" "$name" "$REV" "$rc" "$name.stdout" "$stdout_sha" \
    "$name.stderr" "$stderr_sha" "$inputs_tsv" "${ARGV[@]}"

  cmd_sha="$(sha256sum -- "$cmd_f" | cut -d' ' -f1)"
  case "$cmd_f" in
    "$LANE"/*) cmd_ref="${cmd_f#"$LANE"/}" ;;
    *) cmd_ref="$cmd_f" ;;
  esac
  node -e "$JS_MATRIX" -- "$OUT/matrix-$name.json" "$name" "$REV" "$cmd_ref" "$cmd_sha"

  instr="${ARGV[1]}"
  instr_sha=""
  if [ -f "$LANE/$instr" ]; then instr_sha="$(sha256sum -- "$LANE/$instr" | cut -d' ' -f1)"; fi
  PRODUCERS+=("$name"$'\t'"$instr"$'\t'"$instr_sha")

  RUN_COUNT=$((RUN_COUNT + 1))
  printf '%-10s exit=%s\n' "$name" "$rc"
}

# step NAME: in guard mode check the control's argv and inputs; in run mode execute it.
step() {
  check_argv_covered "$1"
  if [ "$MODE" = guard ]; then guard_inputs; else run_control "$1"; fi
}

# each_control guard|run: every control, in order, with its argv and inputs.
each_control() {
  MODE="$1"
  meter "$V22" "$DELTA_DUP";            step C1-A
  meter "$V22" "$DELTA_R62_CONFLICT";   step C1-B
  meter "$V22" "$DELTA_R62";            step C1-C
  meter "$V21" "$DELTA_DUP";            step C1-DN-A
  meter "$V21" "$DELTA_R62_CONFLICT";   step C1-DN-B
  gate  "$V2" "$FAB_DIR" "$REV" 12;     step C2-A
  gate  "$V2" "$SCORED_DIR" "$SCORED_REV" 12; step C2-B
  gate  "$V2" "$HONEST_DIR" "$REV" 1;   step C2-C
  gate  "$V1" "$FAB_DIR" "$REV" 12;     step C2-DN
}

# Pass 1 refuses before anything is written; pass 2 runs every control.
each_control guard
each_control run

RUNNER_SHA="$(sha256sum -- "${BASH_SOURCE[0]}" | cut -d' ' -f1)"
node -e "$JS_PRODUCERS" -- "$OUT/producers.json" "$REV" "$RUNNER_SHA" "${PRODUCERS[@]}"
printf 'wrote %s control receipts to %s\n' "$RUN_COUNT" "$OUT"

if [ "$UNRESOLVED" -gt 0 ]; then
  printf 'run-controls-r65: %s input row(s) absent at %s; receipts written but not freeze-valid\n' "$UNRESOLVED" "$REV" >&2
  exit 3
fi
exit 0
