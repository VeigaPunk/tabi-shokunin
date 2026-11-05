# R67Executor1 — C1 instruments (v23 meter + flip sweep)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Lane base 5400136b233579f7b716ab83a70b8be24ed88b26.
Node v24.21.0. No package was installed; no tool was added. No /tmp used.

## Bottom line
- v23 = byte copy of frozen v22 plus one check, `delta-disposition-evidence`.
- **v23 selftest is RED: exit 1, 52 cases, 45 pass, 7 fail.** The 7 failing cases are v22 fixtures
  whose line rows contradict the new conjunct (listed below). I did not edit them: the assignment says
  the diff must show only additions, and changing fixture dispositions would change v22 cases.
- **Unmutated r66 adjudicated ledger under v23: exit 1, predicate false, findingCount 95.** All 95 findings are
  `delta-disposition-evidence`. Every one is a `no-tabi-ground` line row whose quote contains a BG word.
  The r66 ledger has 95 no-tabi-ground rows, all with BG-bearing quotes (0 without BG). So the new rule and the
  adjudicated ledger disagree on those 95 rows. The L1 must decide this; it is not resolvable inside C1 without re-adjudication.
- Flip sweep, v23: 54 of 149 rows killed row-locally (49 contested-open + 5 overlap-declared, each refused on a
  flip to no-tabi-ground); 95 survivors = every no-tabi-ground row (both flips to overlap-declared or contested-open are accepted by the conjunct).
- Flip sweep, v22 (control): 0 of 149 killed, 149 survivors. Base green (exit 0, predicate true, findingCount 0).
- **Literal kill (predicate false) is vacuous for v23** because the unmutated base is already red: all 149 rows "killed" trivially. I report it, but the meaningful measure is row-local.

## Files
- v23 meter: `.ufo/waves/round-67/counters/c1-adjacency-host-v23.mjs` (sha256 `db9191bba50474c862164f0e33a299f3ffae97e9a43b9167fc57442d668dcf45`)
- v22 source (unchanged): `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` (sha256 4d3a6b58…50d5, per r66 meter.sha256)
- Sweep tool: `.ufo/waves/round-67/counters/c1-flip-sweep-r67.mjs`
- Diff v22→v23: `w1/R67Executor1/v22-vs-v23.diff` (3 hunks: +49 / -1; the -1 is the PREDICATE-SENTENCE header line; the rest is the check, the selftest cases, and header comment)
- v23 selftest: `w1/R67Executor1/selftest-v23.json`
- v22 selftest control: `w1/R67Executor1/selftest-v22.json`
- Sweeps: `w1/R67Executor1/sweep-v23/{matrix.json,base-run.json,stdout.json,stderr.txt,exit.txt}`, `w1/R67Executor1/sweep-v22/{...}`
- Argv record: `w1/R67Executor1/argv.txt`

## v23 check (what was added)
Loop over every `line` row (after the (f) conflict loop): `overlap-declared` with no BG word in the quote → `delta-disposition-evidence`;
`no-tabi-ground` with a BG word → `delta-disposition-evidence`; `contested-open` unconstrained. Detail: `<lane>:<path>:<line>: <disposition>`.
BG_WORDS and the lowercase-substring match are v22's own (same `BG_WORDS` const, same `bgWordIn` matcher as the screen).
Header PREDICATE-SENTENCE extended with the conjunct. Usage text unchanged.

## v23 selftest — 7 failing cases (all v22 fixtures; new conjunct fires on them)
- `predicate-assert-partial`: overlap-declared quote `drive the browser tests` has no BG word (expected count 1, got 2).
- `line-row-unscreened-file`: no-tabi row `OTHER-UNSCREENED.md:2` quote contains `CDP` (count 2, expected 1).
- `kama-invented-row`, `kama-quote-spliced`, `kama-head-citation`, `kama-mixed-forgery`: junk/spliced rows quoting `playwright`/`CDP` with no-tabi (extra evidence finding).
- `kaidoku-multi-file-keyed-green`: expected GREEN; three no-tabi rows quote `CDP`/`playwright`/`recordHar` → 3 evidence findings.

The 5 new v23 evidence cases all PASS: `evidence-overlap-no-bg-word-refused`, `evidence-overlap-duplicate-row-refused`, `evidence-notabi-with-bg-word-refused`, `evidence-contested-open-either-quote-green`, `evidence-committed-style-clean-green`.

## Sweep
- Each sweep: 1 base run + 298 mutant runs (149 line rows × 2 flips) = 299 meter runs, concurrency 4. Couldn't-evaluate: 0 in both.
- Mutant files were generated under scratch, one per row/flip; sha256 for each is in `matrix.json`.

| Sweep | base exit / predicate / findingCount | literal killed | row-local killed | row-local survivors |
|---|---|---|---|---|
| v23 | 1 / false / 95 | 149 (vacuous) | 54 | 95 (all no-tabi-ground) |
| v22 (control) | 0 / true / 0 | 0 | 0 | 149 |

v23 row-local kills by original disposition: contested-open 49 (killed by flip to no-tabi-ground), overlap-declared 5 (killed by flip to no-tabi-ground), no-tabi-ground 0 (95 survivors).

## Unmutated v23 (no-regression conjunct)
`node .ufo/waves/round-67/counters/c1-adjacency-host-v23.mjs --repo <lane> --rev 5400136b… --fleet /home/vgpnk/Projects/shokunin --snapshot …/round-66/measure/snapshot-live-r66.tsv --audit …/round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta …/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --json` → **exit 1, predicate false, findingCount 95** (`sweep-v23/base-run.json`).
Same argv on v22 → exit 0, predicate true, findingCount 0 (`sweep-v22/base-run.json`).

## Commands run and exit codes
1. `cp round-65/…v22.mjs round-67/counters/c1-adjacency-host-v23.mjs && cmp … && sha256sum …` → 0 (BYTE_IDENTICAL).
2. `mkdir -p …/w1/R67Executor1/sweep-v23 …/sweep-v22` → 0.
3. Four anchored edits on v23 (header comment ×2, verify-core check, selftest cases) → applied.
4. `node c1-adjacency-host-v23.mjs --selftest` → **exit 1** (52 cases, 45 pass).
5. `node c1-adjacency-host-v22.mjs --selftest` → **exit 0** (47 cases, 47 pass).
6. `diff -u v22 v23 > v22-vs-v23.diff` → exit 1 (differences, expected).
7. `node c1-flip-sweep-r67.mjs --meter …/round-67/counters/c1-adjacency-host-v23.mjs --out …/sweep-v23 --scratch …/v23 --rev 5400136b… --repo <lane> --fleet … --snapshot … --audit … --delta …` → **exit 0** (sweep completed; base exit 1).
8. `node c1-flip-sweep-r67.mjs --meter …/round-65/…v22.mjs --out …/sweep-v22 --scratch …/v22 …` → **exit 0** (base exit 0).
9. Read-only probes: `git rev-parse --verify 5400136b…^{commit}` and `2816adb3…^{commit}` → 0; `git show <rev>:corpus/adjacency.tsv | sha256sum` → `39a04a3c…b309` at both revs (map unchanged).

## Instrument changes
None after measurement. The sweep tool was rewritten once BEFORE the measured runs (to add row-local kill and the vacuity flag) after the first draft's literal kill proved vacuous under a red base. No v22 or v23 meter change after the sweep.

## Notes for L1
- The 95-row conflict is a ledger/rule disagreement, not a flip result. Options belong to the L1: re-adjudicate the BG-bearing no-tabi-ground rows, or accept the frozen v23 as red.
- The 7 failing v23 selftest cases need fixture dispositions aligned with the conjunct, or an explicit decision to change those v22 cases. Not done here.
- v22 selftest writes a fixture under `/fast/scratch/hyaku/tabi-r62/R62V21Selftest` (pre-existing behaviour; its own temp dir is removed).

## Scratch
`/fast/scratch/hyaku/tabi-r67/R67Executor1/` (flip-sweep mutants) deleted before yield. The per-mutant sha256 values are retained in `sweep-*/matrix.json`.
