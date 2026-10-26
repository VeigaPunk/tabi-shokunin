#!/bin/bash
# usage: run-selftests.sh <revdir-name> <flag-table>
S=/fast/scratch/hyaku/tabi-r29/ExecNoHarm
name=$1
root="$S/$name"
tmp="$S/tmp-$name"; rm -rf "$tmp"; mkdir -p "$tmp"
out="$S/out/$name"; mkdir -p "$out"
export TMPDIR="$tmp"
table="check-adjacency.mjs:--self-test
check-aria-metadata.mjs:--self-test
check-bfcache-receipt.mjs:--selftest
check-freshness.mjs:--self-test
check-gate-registry.mjs:--selftest
check-measurement-binding.mjs:--self-test
check-release-pins.mjs:--selftest
check-round-contract.mjs:--self-test
check-s106-evidence.mjs:--selftest
check-selfassessment.mjs:--selftest
check-source-reopen-receipt.mjs:--selftest
check-sources.mjs:--self-test
check-user-round-contract.mjs:--self-test
freshness-witness.mjs:--self-test
round-evidence-audit.mjs:--selftest"
while IFS=: read -r script flag; do
  [ -z "$script" ] && continue
  f="$root/scripts/$script"
  if [ ! -f "$f" ]; then echo "ABSENT $script exit=n/a"; continue; fi
  ( cd "$root" && timeout 600 node "scripts/$script" "$flag" >"$out/$script.out" 2>"$out/$script.err" ; echo $? >"$out/$script.exit" )
  ec=$(cat "$out/$script.exit")
  last=$(grep -v '^[[:space:]]*$' "$out/$script.out" | tail -1)
  echo "$script exit=$ec | $last"
done <<< "$table"
rm -rf "$tmp"
