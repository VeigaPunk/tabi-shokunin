#!/bin/bash
S=/fast/scratch/hyaku/tabi-r29/ExecNoHarm
name=$1; root="$S/$name"; tmp="$S/gtmp-$name"; rm -rf "$tmp"; mkdir -p "$tmp"
out="$S/gates/$name"; mkdir -p "$out"; export TMPDIR="$tmp"
sha=$(git -C "$root" rev-parse HEAD)
run() { # label cmd...
  local label=$1; shift
  ( cd "$root" && timeout 600 "$@" >"$out/$label.out" 2>"$out/$label.err"; echo $? >"$out/$label.exit" )
  local ec=$(cat "$out/$label.exit")
  local last=$(grep -v '^[[:space:]]*$' "$out/$label.out" | tail -1 | cut -c1-200)
  echo "$label exit=$ec | $last"
}
run gate-registry node scripts/check-gate-registry.mjs --rev "$sha" --json
run freshness-witness-rev node scripts/check-freshness.mjs --witness "$sha"
run freshness-witness node scripts/freshness-witness.mjs --rev "$sha"
run bfcache-receipt node scripts/check-bfcache-receipt.mjs --rev "$sha" --json
run s106-evidence node scripts/check-s106-evidence.mjs --rev "$sha" --json
run selfassessment node scripts/check-selfassessment.mjs --rev "$sha" --json
run source-reopen node scripts/check-source-reopen-receipt.mjs --rev "$sha" --json
run adjacency node scripts/check-adjacency.mjs --at "$sha" --json
run release-pins node scripts/check-release-pins.mjs --rev "$sha" --stable 156.0.8078.47 --json
run aria-bare node scripts/check-aria-metadata.mjs
run sources-bare node scripts/check-sources.mjs
run round-evidence-audit node scripts/round-evidence-audit.mjs --rev "$sha" --round 28 --round-cap 24 --json
rm -rf "$tmp"
