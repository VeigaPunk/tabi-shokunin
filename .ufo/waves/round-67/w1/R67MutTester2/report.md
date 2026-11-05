# R67MutTester2 — independent re-measure of the C1 do-nothing control (frozen v22 flip sweep)

Seat: R67MutTester2 (leaf, mutation-tester). Lane: tabi-shokunin. Base rev 5400136b233579f7b716ab83a70b8be24ed88b26.
Generator: my own (`generate.mjs`), not the executor's. Runner: `run.mjs`. Both copied into this folder.

## Result

- Line rows in r66 adjudicated delta: **149** (unique (lane, path:line) keys: 149, no duplicates).
- Flips generated: **298** (2 per line row, one row changed per mutant, all other bytes identical).
- Frozen v22 meter exit distribution over 298 flips: **{0: 298}**.
- Predicate `true`: **298**. Refused (exit 1 or 2): **0**.
- Rows with both flips accepted: **149 / 149**.
- Pristine (unmutated) r66 delta under v22: exit 0, predicate true, findingCount 0.

Per flip-target disposition (accepted / refused):

| flip to | accepted | refused |
|---|---|---|
| no-tabi-ground | 54 | 0 |
| overlap-declared | 144 | 0 |
| contested-open | 100 | 0 |

Base disposition of the 149 rows (from r66 ledger): no-tabi-ground 95, contested-open 49, overlap-declared 5.
Consistency: flips to no-tabi-ground = 49+5 = 54; to overlap-declared = 95+49 = 144; to contested-open = 95+5 = 100; total 298.

Expected from r66 (149/149 both flips accepted): **confirmed**.

## Control reading

v22 accepts every in-vocabulary disposition flip. Its only disposition check is `delta-disposition` (out-of-vocabulary) and `delta-disposition-conflict` (differing dispositions on one duplicate key). Neither constrains the disposition against the quote text, so v22 is a do-nothing control for C1: it reaches the target and is refused 0 times, as the L1's control definition expects. This is a finding about the control, not a pass of the C1 claim.

## Finding for the v23 conjunct (measured on the base ledger, not a flip)

BG_WORDS verified verbatim from `round-65/counters/c1-adjacency-host-v22.mjs` line 34:
`['cdp','devtools','remote-debugging','headless','webdriver','geckodriver','selenium','playwright','bidi','crawl','screenshot','recordhar','record-har']`.

Substring match, lowercased quote, as in the meter's `BG_WORDS.some((w) => low.includes(w))`:
- Base line rows whose quote contains >=1 BG word: **149 / 149** (all rows, every disposition).
- Base rows with zero BG words: **0**.

Implication for the proposed v23 rule (no-tabi-ground requires zero BG words): all 95 base `no-tabi-ground` rows contain a BG word, so under v23 they would be refused as-is. The L1 should confirm this is intended before freezing; as written, the rule cannot be satisfied by any base no-tabi-ground row. Under v23, flips *to* no-tabi-ground would also be refused on every row (all quotes carry a BG word), so the v23 flip sweep would show 54 refusals from that conjunct alone; overlap-declared (>=1 BG word) would be satisfied by all rows.

## Commands (exit codes)

1. `sha256sum round-65/counters/c1-adjacency-host-v22.mjs` → `4d3a6b58…2d50d5` (unchanged before and after the sweep).
2. `sha256sum round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` → `37392883…b1105` (unchanged).
3. `node generate.mjs` → exit 0; lineRows 149, mutants 298, duplicateKeys [].
4. Pristine baseline: `node <v22> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 5400136b233579f7b716ab83a70b8be24ed88b26 --fleet /home/vgpnk/Projects/shokunin --snapshot .../round-66/measure/snapshot-live-r66.tsv --audit .../round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta .../round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --json` → exit 0, predicate true, findingCount 0.
5. `node run.mjs` → exit 0; 298 results; ~41 s wall (8-worker pool).
6. Source check: `grep -n "^const BG_WORDS" …c1-adjacency-host-v22.mjs` → line 34 as quoted above.

Exact generator command: `node generate.mjs` (writes mutants to $HYAKU_SCRATCH/tabi-r67/R67MutTester2/mutants; scratch removed after this report, regenerable from the r66 TSV). Exact runner command: `node run.mjs`.

## Files

- `flips.tsv` (this folder): mutant, rowKey, from, flip, exit, predicate, findingCount — 298 rows.
- `results.jsonl`: full per-flip records incl. findingIds and ms.
- `manifest.json`: mutant → key, from, to, tsvLine.
- `generate.mjs`, `run.mjs`: generator and runner.
- Frozen v22 file: not modified (sha256 re-verified).

## Scope notes

- Acceptance: counts reproducible from `flips.tsv` (`awk -F'\t' 'NR>1{print $5}' flips.tsv | sort | uniq -c` → 298 × `0`; non-true predicate rows = 0).
- No tools installed. No git mutation. Scratch removed before yield.
