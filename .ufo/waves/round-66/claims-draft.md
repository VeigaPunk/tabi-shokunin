# Round 66 — claim draft (NOT frozen; pins are filled only after wave w1 lands)

Base revision: 2816adb359a50c2fd83fa975e39f0650aa189984. Pre-freeze controls: commit 4bea87d5.

## C1 — adjacency (lowest owned axis, score 8)

Claim: the sibling-overlap ledger, rebound to the live-head snapshot, is refused by the
frozen r65 meter v22 only where a real finding remains; after the adjudicated rebind the
meter reports predicate true with zero findings.

- Surface moved: the r62 sibling ledger (`corpus/adjacency-host-delta-r62.tsv`,
  `corpus/adjacency-host-audit-r62.tsv`) at 20 live sibling heads.
- Frozen instrument (unchanged): `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs`.
- Snapshot (frozen input): `.ufo/waves/round-66/measure/snapshot-live-r66.tsv`.
- Before (do-nothing control, measured at 2816adb3 and committed in 4bea87d5):
  `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 2816adb3... --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --json`
  -> predicate false, findingCount 40.
- After (claim command): same argv with `--audit .ufo/waves/round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv`
  -> predicate true, findingCount 0, exit 0.
- Admission conditions: (a) after-predicate true with findingCount 0; (b) the rebound ledger changes
  no DISPOSITION cell except those listed and justified in `adjudication.md`; (c) the mechanical-only
  control (lane rows and audit note rebound, quote residue left) stays predicate false, so the
  quote/adjudication work is necessary and not bookkeeping alone.
- Kill rule: any after-finding; any unjustified disposition change; mechanical-only control green.

## C2 — calibration (score 9)

Claim: a v3 receipt-provenance gate, whose predicate code is byte-identical to the frozen v2, refuses
both single-base relative-input mutants (M5a repo-base dropped, M5b matrix-dir-base dropped) through its
own selftest, which gains two cases (one per base) and stays clean on the unmutated gate.

- Frozen predicate: `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs` (unchanged).
- New generation: `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` (selftest only changed).
- Before (do-nothing control, committed 4bea87d5): v2 selftest 12/12 clean; M5a and M5b selftests 12/12 clean (both survive).
- After: v3 selftest 14/14 clean, exit 0; M5a and M5b selftests NOT clean, exit non-zero.
- Admission conditions: (a) `diff` v2 v3 changes only inside the selftest function; (b) both mutants killed,
  each by one of the two new cases; (c) unmutated v3 selftest clean.
- Kill rule: any mutant survives; any predicate-code hunk in the diff.

## Frontier step
- Source row: S-next, Node.js path API (`path.join`), opened by R66Scout this round; cited by the C2 knowledge note and the round lesson.
- Mistake mined: r65 v22 selftest stdout stale (46 committed vs 47 live) — `number-drift`; fix = recaptured stdout at HEAD (`.ufo/waves/round-66/controls/v22-selftest-r66.json`).
- Sourced claim: C2 rests on the S-next row.
