# CritScreenKake receipts (commands + exit codes)

## clone
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
exit 0; git -C $S/clone rev-parse HEAD -> 04f9623dde8ad35d470cecf766e421eafbcb47fa

## C1 counter (frozen bytes, sha256 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e)
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 04f9623... --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
exit 0 -> c1-at-04f9623.json (predicate true, candidates 67, mapped 5, screened 62, unaccounted 0, newMapped 4 = rows 15,16,17,18, adjacency clean rows 17 verified 17, screenFindings [])

## per-row quote-at-pin check (node, git show kake@0440485:<path>, line N includes quote)
exit 0; 11/11 actualLineHasQuote=true (see below)
