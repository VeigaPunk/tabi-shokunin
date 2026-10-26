# ConnW2 — round 34 w2, cross-claim synthesis over C1 × C2 at the w1 integration

**Verdict.** **Holds, with one integration-record defect (low-medium) and one contested judgement the round
must own.** Both frozen predicates re-verify independently at the integration commit
`04f9623dde8ad35d470cecf766e421eafbcb47fa` (C1: exit 0, `unaccounted 0`, `newMapped 4`; C2: exit 0,
`killed 20/20`, battery true), the two claims are causally separable there (disjoint counter inputs; either
predicate is computable with the other unlanded), and no single construction satisfies both at once — the
rename route that reaches C1's predicate (w1 CritC1Claim probe A) cannot touch the gate, and the
source-sniff/env-key constructions that reach C2's (w1 CritC2Counter K1/K2/K6) cannot touch the map. The
defect is in the record, not the predicates: the round-34 lesson's mistake-sweep paragraph routes **28**
items (U01–U28) while the seat's deliverable indexed **32** (U01–U32) — U29–U32 are dropped from every
round-34 document. The contested judgement: C2's 20/20 rests on a runner change (`detailIncludes` in
`runSelftest`'s pass predicate) that exceeds the noHarmRule letter ("added self-test cases/fixture options
only"); w1 flagged it on both sides (ExecKillsA disclosed it as "the one deviation", CritC2Axis called it a
re-freeze trigger) and the L1 chose it — w2 items `MutDetailAssert`/`RevSelftestCodeRead` own that call.

Seat: ConnW2 (leaf, synthesis). Attack only; no lane file repaired or edited.

## Axes

- **C1 adjacency (lowest, 8)**: predicate = `check-adjacency` clean AND `unaccounted 0` AND `newMapped >= 3`
  over the frozen 67-candidate sweep outside PROVINCE.
- **C2 operability (9)**: predicate = gate `--selftest` kills 20/20 frozen mutants with pristine/neutral/decoy
  and every whitespace twin exiting 0, no mutant find text reworded, round-33 battery true.
- Cross-claim question: do the two predicates share a satisfiable construction, a shared semantic dependency,
  or a shared file such that one integrator judgement silently carries both?

## 1. Causal separability at 04f9623 — verified holds

Recomputed both predicates in my own scratch clone (receipts below). The two counters read disjoint inputs:

| | C1 counter (`c1-adjacency-sweep-v2.mjs`) | C2 counter (`c2-gate-mutants.mjs`) |
|---|---|---|
| lane inputs at REV | `corpus/adjacency.tsv`, `corpus/adjacency-screen-skill.tsv`, `SKILL.md` (declaration lines), `PROVINCE.md`, pinned `scripts/check-adjacency.mjs` | `scripts/check-bidi-runtime.mjs` blob only |
| external inputs | sibling repos at frozen pins (read-only `git show`) | round-33 battery blob at `e6b0a907` (pin + sha) |
| never reads | the gate, `corpus/SOURCES.md` | `SKILL.md`, the map/screen ledgers, `SOURCES.md` |

The integration touched shared files (`SKILL.md` grew both a C1 declaration section and C2 self-test/correction
sections; `corpus/lessons/round-34.md`, `corpus/QUALITY.md`, `LOG.md`, `SCORECARD.md`, `corpus/README.md` cover
both claims), but **neither counter reads any of them** except C1's read of the new declaration lines — a section
C2 never modified. Either predicate is computable with the other claim unlanded: C1 needs only the map/screen/
declaration bytes; C2 needs only the gate blob. The shared no-harm leg both claims stand on (round-33 C1 counter
`unaccounted 0` over its 52 PROVINCE candidates) also holds at REV (recomputed: `unaccounted 0`,
`screenFindings []`; the counter's own `predicate false` is the round-33 missed target `newMapped 3 < 4`, which
is its frozen historical state, not a regression — same reading as w1 ExecMeasureHarness).

## 2. Cross-claim patterns (ranked)

**P1 — No single construction satisfies both predicates (the strongest cross-claim result).** Every cheap
construction found in w1 is single-claim: CritC1Claim's rename probe (3 re-keyed kake surfaces + 1 new tabi
line → C1 true at `newMapped 3`) is invisible to the C2 counter; CritC2Counter's K1/K2/K6 guards (self-hash,
git-drift, env-keyed sniff → C2 true at 20/20 with `cases=1`) are invisible to the C1 counter. The one shared
surface — the integrator's semantic judgement — is disclosed by both claims and is exactly what the 48-item
w2 inventory (`ConnRound/w2-items.md`) is built to attack.

**P2 — Both counters are presence/newness letter-checks; both claims delegate semantics to wave 2.** C1's
`newMapped` clause checks that a declaration line is absent at baseline and names the sibling
(`c1-adjacency-sweep-v2.mjs:260-286`); it cannot tell a boundary from a renamed restatement (CritC1Claim
proved the letter passes with zero boundaries). C2's kill test counts any exit-3 `CASE … FAIL`
(`c2-gate-mutants.mjs:225`); it cannot attribute the failure to the mutated rule (the disclosed
whitespace-normalised-sniff residual; ScribeQuality criterion 95 measured it "killing" M01 with the
duplicate-threshold rule never run). Both claims say this verbatim in `feasibilityDisclosed`; the round
answered with QUALITY 95 (C2 leg) and 96 (C1 leg) rather than counter edits (counters frozen). This is a
shared *shape*, not a shared satisfiable construction — see P1.

**P3 — Both predicates were certified on the same integrator run, and both certifications depend on
integrator judgements recorded only in prose.** C1's four rows rest on the L1's overlap reading (two seat
drafts reversed toward screens per criterion 91: kaidoku ×3, kumitate ×2 — recorded in the lesson and the
screen-ledger notes); C2's 20/20 rests on the L1's acceptance of the `detailIncludes` runner change
(recorded in the lesson's C2 section and SKILL.md's self-test decision table). Neither judgement is
machine-checked; both are exactly the wave-2 attack surface (`CritRowLiveDelivery`, `CritReversalKaidoku`,
`CritReversalKumitate`, `MutDetailAssert`, `RevSelftestCodeRead`).

**P4 — Sourcing is the one place the claims genuinely touch, and it is one-directional.** C2's id-shape kill
cases (M06/M08) required SOURCES rows opened this round (S130 token.cc, S131 CdpTargetManager.ts; S127
pre-existing); C1's new rows cite no registry rows. The shared file `corpus/SOURCES.md` was appended for C2
only, and no C1 predicate input depends on it. No contradiction; noted so the separability claim stays
exact: C1 → no SOURCES dependency, C2 → SOURCES S130+ dependency, both → same freeze discipline.

## 3. w1 findings the integration left unaddressed (ranked, with pointers)

**F-A (defect, low-medium — the one landed defect). Mistake-sweep under-count: 32 delivered, 28 routed.**
`corpus/lessons/round-34.md` §Mistakes: "28 round-33 wave-2 findings had no disposition (U01–U28)" and routes
U01–U28 only. The seat's index
(`.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md`, 32 rows U01–U32) also routes — via its per-item
"proposed fix" column — U29–U32:
- **U29** — CritForgeV2A's five limits never landed in the self-test note (now `corpus/knowledge/bidi-gate-selftest-round-34.md`; the integration did not add them);
- **U30** — the live leg spawns chromedriver with `{...process.env}` (session-bus env inheritance; `scripts/check-bidi-runtime.mjs:601`);
- **U31** — the W1→W2 delta sentence in the round-33 lesson omits the wave spec (three w2 seats said so);
- **U32** — the round-33 lesson says CritCorrections a–e landed; D5's line is unchanged.
None of the four appears in the round-34 lesson, SCORECARD, or QUALITY. U32 additionally sits in tension with
the lesson's own errata item 5 ("CritErrataLanded lows → three append-only corrections") — the lesson claims
three landings while U32 records one claimed landing that did not happen. None of these moves a counter number;
all four are errata-hygiene drops of the class routed defect 5 was meant to close.

**F-B (carried, no round-34 home — high if the harness is reused). SentinelCounters F1–F10 and
ExecMeasureHarness D1–D3.** The two frozen counters and `measure.sh` have live defects the w1 seat proved by
reproduction: C2 follows a symlink committed at REV and overwrites an arbitrary absolute path with the gate
blob (F1, HIGH); the C2 child runs REV code with the invoking user's `HOME`/`PATH`/filesystem (F2, HIGH);
orphaned process trees survive runs (F3); `measure.sh` records `exit=0` for counters that never ran (F4) and
auto-executes any new `scripts/check-*.mjs` at REV unpinned (F5); a crash reads as "predicate not met" not
"could not evaluate" (F7/D2); a bogus `FREEZE` yields empty receipts recorded as success (F4/D3). Nothing in
the round-34 lesson, QUALITY, or SCORECARD routes these to round 35 (QUALITY 92 covers a different
self-assessment defect; F6's disclosed residual is covered only for the gate side by criterion 95). The
counters are frozen so the round cannot repair them — but the round's own record should carry them; it does
not. Pointers: `.ufo/waves/round-34/w1/SentinelCounters.md` F1–F10;
`.ufo/waves/round-34/w1/ExecMeasureHarness.md` D1–D3.

**F-C (carried, control-suite gaps). Counter self-mutation findings.** MutC1Counter: 9 of 12 single-point
counter mutants survive the committed control suite — including MU01 (target boundary 3↔2 unpinned) and MU04
(tab-side sibling-token clause unpinned; six liveness demos show real false-accepts). MutC2Counter: 8 of 10
survive — including kill-criterion over-acceptance (mutants A/B: any non-zero exit or a FAIL-less run would
count as a kill) and the K6 env-keyed subject (a gate that fingerprints the counter's scratch cwd reads dead
under the counter and healthy everywhere else). These are limits of the frozen controls, disclosed in the seat
reports but not recorded in the round lesson (the lesson records only the two claimed controls' content).
Pointers: `.ufo/waves/round-34/w1/MutC1Counter.md` guard-gap list 1–6; `.ufo/waves/round-34/w1/MutC2Counter.md`
unguarded-clauses 1–7.

**F-D (contested judgement, w2-owned — named so the round does not smooth it over). The `detailIncludes`
runner change vs the noHarmRule letter.** `claims.json:75`: the gate changes "only by added self-test cases/
fixture options". The integration added the optional `detailIncludes` conjunct to `runSelftest`'s pass
predicate (`scripts/check-bidi-runtime.mjs:1157-1165` at REV) plus `firstDetail` computation — neither a case
nor a fixture-builder option; it is comparison-logic. ExecKillsA (`.ufo/waves/round-34/w1/ExecKillsA.md`
"Risks/limits") disclosed exactly this: "the one deviation … If the L1 refuses the runner change, revert and
M06 stays a survivor." CritC2Axis (`.ufo/waves/round-34/w1/CritC2Axis.md` smallest-safe-correction 2) said
the same change "exceeds 'cases/fixture options only' … needs an explicit claim amendment and a new counter
digest before any data is produced — not a post-freeze narrowing." The L1 took the change without a
re-freeze; the lesson's M4 reframes the two seats' equivalence findings as "premature-impossibility". The
rule lines stayed byte-identical (the C2 counter's `unappliable []` and my 20/20 rerun confirm all 20 finds
occur once), and the change is behaviour-plausible — but the letter-vs-spirit call is a real contradiction
between two frozen texts (noHarmRule vs the landed diff), and it is the load-bearing leg of C2's 20/20:
without `detailIncludes`, M04/M05/M06 survive (both w1 attack seats measured this independently). w2 items
`MutDetailAssert` and `RevSelftestCodeRead` are assigned to attack it; this synthesis adds that the round
record should state the deviation explicitly rather than only via the lesson's M4 framing.

**F-E (recorded, wave-2 assigned — for completeness). Row 15 `live-delivery-observation`.** w1 ConnBoundaries
flagged kake `SKILL.md:408` as possibly "one boundary re-keyed, not two" against
`js-rendering-browser-execution`; the lesson keeps the row and names the contest
(`corpus/lessons/round-34.md` §C1: "Contested by w1 ConnBoundaries and kept for wave-2 attack"). w2
`CritRowLiveDelivery` owns it. Also AdjKasegi finding 2: row 18's `refused-route` rests on `SKILL.md:727-728`
(C4/C5 refusal wording) rather than a PROVINCE arrow — a genuine, seat-disclosed judgement, consistent with
the claims' "refused-route needs no sibling-side naming" and defensible on the bytes.

Findings I checked and judge **addressed** (so the unaddressed list above is bounded): the stray seat dir
(lesson M1; the `w1 = build + first falsifiers/` tree was moved into `w1/` — confirmed absent from the
worktree and from the integration tree); the kake:411 note (routed defect 5 sub-item ConnRound found
unassigned — landed via ScribeScreenRelabel row 35 and listed in lesson errata 5); ReopenS128 (S133
supersession landed, S128 bytes unchanged); S125 cadence (proposal recorded, cell change routed to round 35
per the frozen append-only rule); ScoutAssimilation (none — recorded); ScribeCarriedLow's three corrections
(landed in LOG.md, corpus/lessons/round-32.md, and the round-32 knowledge note); the four w1 kill-case
executors' merge risk (both halves' ids and option names were kept distinct and merged cleanly — 56 cases at
REV, my rerun shows `cases=56 passed=56` pristine).

## 4. Commands run (exit codes)

All counter runs in a `--shared` clone of the lane detached at `04f9623dde8ad35d470cecf766e421eafbcb47fa`
(`/fast/scratch/hyaku/tabi-r34/ConnW2/clone`; `git rev-parse --show-toplevel` = the clone; TMPDIR under the
same scratch; lane checkout never executed).

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa   # 0
sha256sum .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs .ufo/waves/round-34/counters/c2-gate-mutants.mjs
  # 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e / 3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82  (== claims.json frozenDigests)  # 0
TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --repo $S/clone --rev 04f9623… --json   # exit 0
  # predicate true · killedCount 20/20 · survivors [] · unappliable [] · twinsFailing []
  # pristine/neutral/decoy exit 0 "cases=56 passed=56" · battery predicate true (H0/H1/H2 true, forgeries 0)
  # → .ufo/waves/round-34/w2/ConnW2/c2-at-04f9623.json
TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --rev 04f9623… --json   # exit 0
  # predicate true · candidates 67 · mapped 5 · screened 62 · unaccounted 0 · newMapped 4 (rows 15-18)
  # adjacency clean 17/17 · screenFindings [] · → .ufo/waves/round-34/w2/ConnW2/c1-at-04f9623.json
TMPDIR=$S/tmp node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo $S/clone --fleet … --rev 04f9623… --json   # exit 1 (its own frozen target: newMapped 3 < 4)
  # no-harm leg: candidates 52 · unaccounted 0 · screenFindings [] · adjacency clean 17/17
  # → .ufo/waves/round-34/w2/ConnW2/r33c1-at-04f9623.json
grep -cE '^\| U[0-9]+' .ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md   # 32  (lesson says 28)
grep -c 'detailIncludes' .ufo/waves/round-34/w2-spec.json                       # 8 hits incl. the MutDetailAssert item
git -C $S/clone show 04f9623… -- scripts/check-bidi-runtime.mjs                  # diff hunks only at goldenLines/lessonsDoc/CASES/runSelftest; rule lines untouched
```

No lane tracked file, lane index, fleet file, sibling repo, or `shokuknow` path was written; no browser
launched; no network fetch; no tool installed or upgraded (node v24.21.0, git as present). The stray-dir and
w2-dispatch reads were read-only.

## 5. Deliverable paths

- Report: `.ufo/waves/round-34/w2/ConnW2.md` (this file)
- `.ufo/waves/round-34/w2/ConnW2/c1-at-04f9623.json` — frozen C1 counter at the integration rev (predicate true, unaccounted 0, newMapped 4)
- `.ufo/waves/round-34/w2/ConnW2/c2-at-04f9623.json` — frozen C2 counter at the integration rev (predicate true, 20/20, battery true)
- `.ufo/waves/round-34/w2/ConnW2/r33c1-at-04f9623.json` — round-33 no-harm leg at the integration rev (unaccounted 0 over the 52 PROVINCE candidates)
- `c1-at-04f9623.stderr`, `c2-at-04f9623.stderr` — both 0 bytes
