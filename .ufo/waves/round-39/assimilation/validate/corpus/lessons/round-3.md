# Round 3 lessons — tabi-shokunin (2026-10-14)

Probation-completing round — TABI-R3-1 journey, TABI-R3-2 approval table,
TABI-R3-3 SKILL integration + anchor re-derivation + smoke replay, TABI-R3-4
no-oral-context executor test; TABI-B1 r3b audit in flight at record time.
Axis moves: depth (journey evidence) + calibration (approval table)
(`plans/round-3.plan.md:3-4`; `SCORECARD.md:38-51`). Evidence: commit
`094c27a`, `LOG.md:76-130`.

## What landed

- 3 admits, 5 → 8 notes (`wc -l` at `094c27a` → 296 / 216 / 297), pins
  `67447c028e90` / `70ce826303d0` / `1262708864db`:
  `multi-step-journey.md` (4-page loopback site; 6 per-step captures × 2 cold
  runs byte-identical + 2 warm; browser-side history witness
  `typed`/`link`/`form_submit`; wire-304 vs client-200 measured on both
  sides; cleanup + port closure per run),
  `interaction-approval-table.md` (6 classes C1–C6 + 12 adjacent gates
  A1–A12, each with rights·rate·consequence, an unblock gate and a falsifier;
  the never-set held under the operator-asleep anti-claim),
  `executor-test-sufficiency.md` (verdict SUFFICIENT — a fresh executor whose
  only procedural read was `SKILL.md` ran steps 0–13 verbatim, twice; gaps
  G1–G5 named; errata E1–E5).
- SKILL.md +512/−178 → final revision `452bc514d387` (576 lines): 13-step
  runbook, claim-class table, finalized approval table; executor errata
  applied in-revision.
- SHONEN.md: all four boxes marked with named verifiers (boxes 1/2/4 scribe,
  box 3 executor) — promotion itself left to a later, separately reviewed
  decision (`LOG.md:120-123`).

## Method lessons

- The no-oral-context test has teeth: every copy-paste command ran unmodified;
  the PARTIALs (fixture bytes not in the document — G1; count definition;
  rect getter; compare script) were fixed into the document, not explained
  away (`executor-test-sufficiency.md` §0–§4).
- Cross-seat byte agreement: executor det-before `c08947dc…802dc1` equals
  the round-2 pin; the R3-3 smoke reproduced the r2 chain a third time
  (`SCORECARD.md:50`).
- A nit is recorded, not silently fixed: the round-3 record flagged the
  executor note's line count ("297" vs a "298" reading) — resolved in round 4
  (`hygiene-sweep-r4.md` §7 E2: on the r3-pinned blob `wc -l` → 297,
  `grep -c ''` → 298; the "298" readings mixed counting conventions — the
  no-trailing-newline class this corpus keeps meeting).
- Calibration incidents kept: the `-1` empty-value sentinel in raw
  DOMSnapshot columns (shape text carries no live values); wire vs client
  status surfaces (`multi-step-journey.md` §3, §5).

## Gate

- Candidates: the three seat notes; integration + anchors + smoke as
  verification machinery; the r3b audit (B1) — scratch created, empty at
  record time, recorded not absorbed.
- Admitted: all three, each with a coverage row; pins re-derived from
  `094c27a` (this lesson, 2026-10-14) — all three match.
- Rejected / kept as gaps, with reasons: executor gaps G1–G5 stay named
  (fixture bytes outside the document; G4 archive obstructed by write
  scope); C2–C6 classes not executed (operator asleep — only C1 ran); B1's
  in-flight scratch untouched.
- Spot-check (non-author — scribe): agrees with all three admits after
  re-running anchors (journey methodology + run1 PNG shas; approval counts
  `grep -c '^| \*\*C'` → 6 / `'^| \*\*A'` → 12; executor methodology pins +
  `compare.tsv` 10 yes / 3 expected-NO); Brave reject re-ran →
  `NativeMessagingHosts` only (agree, third consecutive round)
  (`SCORECARD.md:51`).
- Falsifier: a journey byte-identity that fails on a fresh port pair; an
  approval row without a gate or falsifier.
- Carried debt out of this round: thirteen `/tmp` evidence groups; the
  round-1/2/3 gate records still absent — this file lands in the round-5
  freshness pass; freshness axis still same-day-later.