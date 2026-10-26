#!/bin/bash
S=/fast/scratch/hyaku/tabi-r29/ExecNoHarm
name=$1; root="$S/$name"; tmp="$S/mtmp-$name"; rm -rf "$tmp"; mkdir -p "$tmp"; out="$S/more/$name"; mkdir -p "$out"; export TMPDIR="$tmp"
sha=$(git -C "$root" rev-parse HEAD)
run(){ local label=$1; shift; ( cd "$root" && timeout 300 "$@" >"$out/$label.out" 2>"$out/$label.err"; echo $? >"$out/$label.exit" ); echo "$label exit=$(cat "$out/$label.exit") | $(grep -v '^[[:space:]]*$' "$out/$label.out" 2>/dev/null | tail -1 | cut -c1-140)"; }
for f in pstack-aggregate.mjs pstack-seat.mjs user-aggregate.mjs user-seat.mjs report-contract.mjs aria-loopback-round13.mjs webmcp-lifecycle-round21.mjs webmcp-validation-round19.mjs; do run "${f%.mjs}-bare" node "scripts/$f"; done
run aria-witness node scripts/check-aria-metadata.mjs --witness
run measurement-binding-legacy node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at "$sha" --json
rm -rf "$tmp"
