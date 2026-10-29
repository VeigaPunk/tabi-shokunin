#!/usr/bin/env bash
# ExecNoHarm supplementary capture: argument-correct forms + usage-contract probes.
set -u
S=/fast/scratch/hyaku/tabi-r43/ExecNoHarm
OUT="$S/out"
export TMPDIR="$S/tmp"
mkdir -p "$OUT" "$S/tmp"

run() {
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
  { echo "### EXIT: $rc"; echo "### END_UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; } >> "$log"
  printf '%s exit=%s\n' "$label" "$rc"
}

for pair in "freeze 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc" "baseline ab592825cd195599822ca227f7768914df208201"; do
  set -- $pair; tag=$1; rev=$2
  run "$tag.selfassessment-rev"      "$S/$tag" scripts/check-selfassessment.mjs --rev "$rev"
  run "$tag.frontier-full-args"      "$S/$tag" scripts/check-frontier-admission.mjs --rev "$rev" --frontier rate-tos-signal --since 2026-10-26 --json
  run "$tag.sources-explicit-root"   "$S/$tag" scripts/check-sources.mjs --root "$S/$tag"
  run "$tag.freshness-witness-rev"   "$S/$tag" scripts/check-freshness.mjs --witness "$rev"
done

# usage-contract probes (freeze clone)
run "probe.freshness-no-mode"        "$S/freeze" scripts/check-freshness.mjs
run "probe.freshness-cross-repo"     "$S/freeze" scripts/check-freshness.mjs --worktree --repo "$S/baseline"
run "probe.sources-bad-flag"         "$S/freeze" scripts/check-sources.mjs --nope
run "probe.selfassessment-help"      "$S/freeze" scripts/check-selfassessment.mjs --help
run "probe.frontier-help"            "$S/freeze" scripts/check-frontier-admission.mjs --help
