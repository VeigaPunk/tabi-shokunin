# CriticAuthorship — bounded falsification (round 21, C1)

## Counterexample

A final account could wrongly treat a unanimous reviewer/critic result from this dispatched wave as independent non-author admission. That account is false on authorship provenance even if every lane agrees: `w1-task-result.json:1-2` records one wave spawning 64 background agents, and `w1-spec.json:298-300` makes `CriticAuthorship` one of that wave's critic tasks. The shared wave contract gives L1 the canonical planner seat and integration (`w1-spec.json:3`). Role labels and lane count do not turn these author-side seats into an outside verifier.

This is a bounded counterexample to the *independence claim*, not a claim that any round-21 runtime outcome is wrong. Round 20 already made the distinction explicit: its entry was admitted by an author gate “not independent admission,” all lane seats were author-side, and the parent owned independent closure (`corpus/lessons/round-20.md:13-30`). Its final record left non-author admit/reject closure unasserted and discernment unchanged pending outside agreement (`SCORECARD.md:965-971`).

## Evidence and finite red shape

- `corpus/QUALITY.md:107-114` requires named finite failure shapes and committed evidence pointers; `:229-241` keeps source-callsite entailment and task-return/settlement claims bounded. These do not confer non-author status on a dispatched reviewer.
- `SCORECARD.md:973-986` declares the round-21 C1 target as 12 receipt-bound, finite loopback observations, scalar depth 8, and other axes unchanged pending evidence. It does not declare independent admission.
- **Finite red shape (not executed):** a candidate round report says “independent/non-author agree” and its only admit-and-reject reviewers are seats in this `tabi-r21-w1` dispatch. Expected finding: refuse the independence/discernment credit; retain the lane findings as author-side review. This shape is indifferent to reviewer unanimity and does not test runtime correctness or the 12-case count.

At inspection time the lane had no `corpus/evidence/round-21/` tree, and the root `scripts/` listing had no round-21 producer. Therefore this report makes no runtime, counter, admission, or pass claim; the required artifacts have not yet been available for review.

## Impacted axes

- **Discernment:** stays unchanged / pending any separate outside non-author admit-and-reject agreement. Lane-dispatched review cannot improve it by itself.
- **Depth (C1):** the declared scalar remains 8. This authorship objection neither disproves nor confirms the pending 12 finite observations; their receipt/counter evidence must be reviewed separately.
- **Quality:** an eventual report would misstate evidence provenance if it promoted internal lane agreement to independent admission. No such round-21 report or runtime artifact was present to assess here.
- **Expansion:** unchanged; no new source, domain, or capability is asserted by this review.

## Smallest safe correction

Keep round-21 reviewer/critic findings labeled as author-side first-falsification only; leave discernment unclaimed and depth at 8. Do not add weight for lane count or internal unanimity. If independent closure is later needed, require a separately identified non-author to assess one finite admit and one finite reject against the immutable completed artifacts; do not infer that closure from task returns or expand the declared runtime scope.

No browser/runtime execution, tests, production edits, or tool installs were performed.

Report: `.ufo/waves/round-21/w1/CriticAuthorship.md`
