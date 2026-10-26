# Draft — routed defect 4: the named correction of round-32 `claims.json` C1 `feasibilityDisclosed`

The frozen file is not edited (round-32 claims were frozen before data; lesson round-32 M1 established the
same rule for the round-31 reason string). Two append-only texts follow, in the SCORECARD correction style
at `SCORECARD.md:1605-1626`.

## A. SCORECARD.md — appendix to the "Round 33 — corrections (append-only)" block

    Correction (round 33, named) — supersedes `.ufo/waves/round-32/claims.json:39`, claim C1's
    `feasibilityDisclosed`: its closing clause, "it is not reachable without a committed receipt of two real
    runs from a driver other than the counter", is false as written. `.ufo/waves/round-32/w1/CritC1Forgery.md`
    records four constructions the frozen v1 gate admitted at exit zero, admitted sixteen, failing zero: two
    `goldenLines` synthetic transcripts plus one real screenshot taken over CDP, with a two-line re-export as
    the "driver" (`b858b5d`); one row id listed sixteen times (`e666174`); one real run's transcript path
    cited twice (`7912a62`); two byte-identical copies of one run (`cee9539`). The same report's D2 shows
    `admitted` counts table instances rather than distinct surfaces, so one distinct row reaches the target.
    The frozen file stays as written (lesson round-32 M2). The operative reading is the plain distinct
    counts in `corpus/evidence/round-32/bidi/receipt.json` beside QUALITY criterion 86, and round 33's C2
    rebuilds the gate against these constructions — at the round-33 baseline the frozen battery scores every
    forgery accepted (`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`).

## B. LOG.md — paragraph for the round-33 entry

    Correction — round-32 `claims.json` C1 `feasibilityDisclosed` (`.ufo/waves/round-32/claims.json:39`) is
    false as written, recorded here because the frozen file cannot be edited. Four receipt constructions
    reach the round-32 gate clean at admitted sixteen (`b858b5d`, `e666174`, `7912a62`, `cee9539`;
    `.ufo/waves/round-32/w1/CritC1Forgery.md`), so "not reachable without a committed receipt of two real
    runs from a driver other than the counter" overstates the gate. The round-32 verdict stands on the plain
    distinct counts and criterion 86, and round 33's C2 rebuilds the gate against these constructions
    (baseline reading `.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`).

## Ground for every clause

- `.ufo/waves/round-32/w1/CritC1Forgery.md:9-15` — the four admitted constructions and their revs.
- `.ufo/waves/round-32/w1/CritC1Forgery.md` §Defects D1 (transcript provenance unbound), D2 (`admitted`
  counts instances), D3 (two runs need not be two observations).
- `corpus/lessons/round-32.md:57` — M2 states the same falsehood as the mined mistake.
- `.ufo/waves/round-33/baseline/c2-J1-do-nothing.json` — `forgeriesAccepted: 8` at the round-33 baseline.

## Counter hygiene

Neither paragraph names a runnable gate file, states a bare `N/M` pair or an `N-case` count, so the
calibration counter sees no new tally. Verified: appended to `SCORECARD.md` and `LOG.md` in a scratch clone
and read with `node scripts/check-selfassessment.mjs --rev <rev> --json` → `mismatches 0`, no deleted lines.
Receipt: `drafts/selfassessment-with-corrections.json`.
