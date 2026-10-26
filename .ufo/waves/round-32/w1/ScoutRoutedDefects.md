# ScoutRoutedDefects — round 32 w1, planning data-walk

## Verdict
Seven round-31 routed defects and the two carried round-30 defects (3-4) map cleanly to `claims.json` (frozen 4181fff). Only defect 1 is partly claimed, and only through C2: the failed-summary refusal (M11) and the new m4 class. Defects 3, 4, 5 and 7 are closed by curation or process, with no counter. Defects 2 and 6 (plus round-30 defects 3-4) are declared `notClaimed`, so they are carried and must be restated as planned in the round-32 SCORECARD block. Nothing is refused outright. Three facts the L1 should check before integrating: (a) `errata.md` holds 43 findings (E1-E43), not the "27" in routed defect 4, so the scribes need a stated denominator; (b) the S119 recheck mismatch (180d header vs 365d registry) is already stated as a read-365d erratum at `corpus/knowledge/rate-signal-decision-table.md:174-212` (the "Recheck cadence" bullet is on the first lines of that Errata block), so only the S123 superseding row remains for defect 3; (c) QUALITY.md has no round-29/30 section heading. Criteria 71-79 sit in the unlabelled block, and 80-82 sit under "## Round 31 additions" at line 455.

## Table 1 — routed defects to round-32 disposition
Disposition vocabulary: claimed (in a claim) / curated (frontier or curation step) / carried (declared `notClaimed`) / refused.

| # | Defect (source) | Disposition | Evidence in claims.json | Files that would close it |
|---|---|---|---|---|
| R31-1 | Calibration counter v3: word-numeral and `cli_cases=` tallies; refuse a failed self-test's summary (M11); kill the merged two-bullet survivor | **claimed in part** (C2): M11 refusal + m4 class. **Carried**: word-numeral, `<name>_cases=`, merged-bullet survivor | `priorClosure` (1); `notClaimed[0..1]` | Claimed part: frozen `scripts/check-selfassessment.mjs` (sha `77b5c8ed…`, unchanged); end-of-document appended corrections in `SCORECARD.md`, `SKILL.md`, `corpus/README.md` (18 stale lines, see claims C2 `beforeItems`). Carried part: restate in the round-32 `### Planned / saturation / retired` block of `SCORECARD.md`, and in the round-32 lesson `## Mistakes` |
| R31-2 | Decision-table counter v2 (`check-decision-table.mjs`): distinct (source, quote) pairs; unit and bound word in the quote (M10) | **carried** ("not claimed") | `priorClosure` (2); `notClaimed[2]` | Planned line in the SCORECARD round-32 block only. Entry-side residue is E3/E4 in `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` |
| R31-3 | S119 anchor "June 2022" vs bytes "September 2022" (superseding row); entry `recheck: 180d` vs registry `365d` | **curated** (frontier step) | `priorClosure` (3); `frontierStep.sources` ("S123 supersedes S119") | `corpus/SOURCES.md`: append row S123 (S119 row stays; rule 2, no in-place edit except `used-by`), opened this round. The recheck half is already stated at `corpus/knowledge/rate-signal-decision-table.md` §Errata (round 31, "Recheck cadence": 365d operative); round 32 only needs the S123 row to say so, or a one-line pointer. `corpus/lessons/round-32.md` `## Gate` carries S123's quote and sha. The L1 to confirm: S123 `used-by` (reciprocity, criterion 75) |
| R31-4 | 27 carried w1 findings in `a2w1/ScribeErrata/errata.md` | **curated** (dispositioned by wave-1 scribes) | `priorClosure` (4) | `.ufo/waves/round-32/w1/ScribeErrata*` plus an append-only errata block. `errata.md` carries E1-E43 (43 items), and only 8 lines contain a disposition word (carried 6, corrected-here 1, no-action 1). The scribe denominator must be stated: the "27" in the routed defect is not reproduced by the file (E1-E43 = 43; origin of 27 `[INFERENCE]`: a pre-integration count). Targets: `rate-signal-decision-table.md` (E1-E4), `check-*.mjs` counter items stay carried (frozen counters), `SCORECARD`/`SKILL` tally items E22/E23 collide with C2 |
| R31-5 | Control captures must name a resolving revision or commit the tree digest | **claimed as process** (no counter) | `priorClosure` (5): `baseline/*.provenance` record clone commit AND tree digest | Already landed in `.ufo/waves/round-32/baseline/*.provenance` and `README-receipts.md` lines 3-6. Round-32 attack and measure seats must copy the pattern for any junk tree they build |
| R31-6 | Round-30 defects 3-4 (gate-mutants + frontier-admission counter v2; release-pin counter v2) | **carried** ("not claimed") | `priorClosure` (6); `notClaimed[3]` | SCORECARD round-32 planned block only |
| R31-7 | Scratch hygiene: seats leave ~145 MB each | **claimed as process** | `priorClosure` (7): every seat prompt requires deleting its scratch; L1 removes `$HYAKU_SCRATCH/tabi-r32` | This dispatch prompt already carries the rule; no lane file |
| R30-3 | gate-mutants opaque run dirs, minimal env, killer attribution; empty work-dir leak; frontier-admission https-only/same-host redirects/`curl -q`/independent refetch | **carried** (same row as R31-6) | `notClaimed[3]` | as R31-6 |
| R30-4 | Release-pin counter v2 (id-set population; DEPS-pinned S044/S068) | **carried** | `notClaimed[3]` | as R31-6 |
| (R30-1/2) | `SCORECARD.md:1523` correction; summary-line oracle | not in scope: closed in round 31 (lesson `:140-141`) | — | none |

Nothing is `refused`: claims.json has no refusal bucket. `notClaimed` is the only exit, and it also lists the adjacency obligation waiver.
Observation: `claims.json` `notClaimed` has five entries; R31-2 and R31-6 each have an entry, and word-numeral/merged-bullet are two entries for one defect.

## Table 2 — QUALITY.md criteria added in rounds 29-31 that round 32's entry and corrections must satisfy
Rounds 29-31 added criteria 71-82. Criteria 80-82 are under `## Round 31 additions` (line 455); 71-79 sit in the preceding unlabelled block.

| # | Applies to | One-line test |
|---|---|---|
| 71 | C1/C2 counters (bytes changed this round) | The counters were landed at 2f8535c/5ad1fcb. Run both at their landing commit; the report commits argv, revision, exit, tally and one mutant that turns a named case red. `baseline/c1-counter-selftest.txt` (27/27) and `c2-counter-selftest.txt` (41/41) cover the landing; a mutant for each is still to be recorded. |
| 72 | Report, lesson, SCORECARD quotes of command output | Every quoted output is a committed redirect capture at a named revision, cited by path; re-run matches byte for byte (`measure.sh` writes under `.ufo/waves/round-32/measure/`). Counter JSON goes to a file, never a pipe (errata E42). |
| 73 | C1 and C2 predicate sentences | Each clause of a predicate names the code line that enforces it. The claim's "exits 0 and admitted >= 14" and "0 deleted lines" are enforced in different places (counter vs `git diff --numstat`); the report must name both. Attack was done at the freeze (J1-J4 controls). |
| 74 | Round-32 lesson `## Gate`; S123-S126 quotes | Every Gate quote is a contiguous substring of its own row's committed bytes (whitespace-collapsed), grounds that row's own `teaches`, and spans no boundary. The counter's `g5-quote-located` is mechanical only for a frontier entry. The BiDi entry's `source:` must cite a row opened this round (`s1-source-row`). |
| 75 | New rows S123-S126, the BiDi entry, and the S119 row | `used-by` reciprocity: the entry's `source:` ids list the entry path in their `used-by`, and the in-place append is logged old->new in the round lesson. S123 supersedes S119; S119 `used-by` stays. |
| 76 | any new self-test case | Each names the check it targets and turns red when only that check is disrupted. Applies only if a mutant case is added; scripts/ stays frozen, so applies to the mutant battery, not to new instrument code. |
| 77 | Round-32 lesson `## Mistakes` | `grep -c '^| M[0-9]'` equals `grep -c '^### M[0-9]'`; no instrument checks this. The L1 writes the lesson, so the L1 must run both greps. |
| 78 | C2 corrections, errata block, any statement about line numbers | Each appended correction cites `DOC:N` (or a quoted anchor); never "the bullet above". Spans count their lines. C2's own criterion: cite each stale line, 0 deleted lines. |
| 79 | C1/C2 populations ("admitted >= 14", "18 mismatches", "16 admittable") | The count is stated with its selecting rule, in the same place, naming excluded classes: R16 (no BiDi command) is excluded from the 16; the 15 m1 findings are instrument-induced vs 3 m4 pre-existing (`beforeComposition`). |
| 80 | Only if any decision-table entry is touched | A decision-table row needs the source's own number in a located quote that carries the force. Round 32 touches this entry only through S123 / errata; no new rows, so no row to recount. |
| 81 | C2 corrections of self-test tallies | The oracle for a gate's tally is its own summary line; a `cli_cases=` gate is outside the oracle (`check-aria-metadata.mjs`), so a tally stated for it is "unchecked", not "matched". |
| 82 | C2 corrections naming a tally for a gate whose self-test is not clean, or that prints no summary | Read by hand against the gate's own run and record as such; a clause no line enforces is a limit, not a rule. The frozen v3 refuses the failed-summary case (M11) — the M11 refusal is the claimed part of R31-1. |

## Evidence (commands run, all read-only; exit 0 each)
- `read` of claims.json (lines 1-100), round-31 and round-30 verifier-spotchecks, QUALITY.md 380-491, baseline/README-receipts.md.
- `grep "Routed defects" corpus/lessons` — rounds 12-31 headings located.
- `git log --oneline -3` -> 4181fff, 5ad1fcb, 2f8535c (freeze commits present).
- `grep -c` over `errata.md`: carried 6, corrected here 1, no action 1; E-items run E1-E43.
- `grep -n 'S123\|S124\|S125\|S126' corpus/SOURCES.md` -> no matches: the four rows do not yet exist (planned, to be written after opening).
- `grep -n 'S119' corpus/SOURCES.md`: row 133, status `mined`, recheck `365d`, used-by `rate-signal-decision-table.md`.
- Nothing was written outside this report and its output dir. No browser, no fetch, no scratch.

## Unknowns
- Whether the registry check requires S123 `used-by` to be non-empty at landing. Not read (check-sources.mjs not opened). `[INFERENCE]` from criterion 75 only.
- Whether the "27" in R31-4 is a count of w1 findings integrated differently from E1-E43; not resolvable from the files read.
