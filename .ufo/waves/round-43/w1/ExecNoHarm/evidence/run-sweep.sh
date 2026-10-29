#!/usr/bin/env bash
# no-harm gate sweep runner (ExecNoHarm, tabi round-43 w1)
# Runs each read-only gate in a clean clone and records stdout/stderr/exit.
set -u
S=/fast/scratch/hyaku/tabi-r43/ExecNoHarm
OUT="$S/out"
mkdir -p "$OUT" "$S/tmp"
export TMPDIR="$S/tmp"

run() { # run <label> <clone-dir> <args...>
  local label="$1"; shift
  local dir="$1"; shift
  local log="$OUT/${label}.log"
  {
    echo "### CMD: node $*"
    echo "### CWD: $dir"
    echo "### REV: $(git -C "$dir" rev-parse HEAD)"
    echo "### START_UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } > "$log"
  ( cd "$dir" && node "$@" ) >> "$log" 2>&1
  local rc=$?
  {
    echo "### EXIT: $rc"
    echo "### END_UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } >> "$log"
  printf '%s exit=%s log=%s\n' "$label" "$rc" "$log"
}

clone="$1"; tag="$2"
run "$tag.check-sources"            "$clone" scripts/check-sources.mjs
run "$tag.check-selfassessment"     "$clone" scripts/check-selfassessment.mjs
run "$tag.check-freshness-selftest" "$clone" scripts/check-freshness.mjs --self-test
run "$tag.check-freshness-worktree" "$clone" scripts/check-freshness.mjs --worktree
run "$tag.check-frontier-admission" "$clone" scripts/check-frontier-admission.mjs
run "$tag.check-c2-knowledge"       "$clone" scripts/check-c2-knowledge-round41.mjs --root "$clone"
