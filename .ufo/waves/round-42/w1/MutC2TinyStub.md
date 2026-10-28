# MutC2TinyStub — r42 C2 r3 stub mutation (scoped findings)

Full report: `.ufo/waves/round-42/w1/MutC2TinyStub/report.md` (evidence in `.../MutC2TinyStub/evidence/`).

Frozen counter `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`
sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`, unmodified
(clean at HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218`).

Mutation M (r3 only): drop
`if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', …)`, retaining the
`size < 10` gate and the digit-0 test. Scratch copy
`1e7b38142e7dba5df8282b825d2b5205b1292696ef47db84037ea736c1b71653`.

| fixture | pristine | mutant |
|---|---|---|
| A `c1-baseline-noop.out` = `0\n` (2 B, assigned) | exit 1, 7 findings incl. `r3-baseline-file-empty` | exit 1, **identical 7 findings** → survived (size gate masks the clause) |
| B 28 B `wc -l records.csv / counted 0`, minimal tree | exit 1, incl. `r3-command-not-recorded` | exit 1, that finding **gone** |
| C full tree, r1/r2/r4 green, same 28 B no-`ls-tree` baseline | exit 1, **sole** finding `r3-command-not-recorded` | **exit 0, `predicate:true`, `findings:[]`** |
| D full tree, baseline `git ls-tree -r HEAD | wc -l / counted 0` | exit 0 | exit 0 (positive control) |

Conclusion: M is **killed** — the mutant greens bytes the pristine checker refuses, so the
dropped ls-tree clause is load-bearing. Calibration finding (no amendment proposed):
r3 is a conjunction whose `size < 10` term masks the `ls-tree` term; a bare `0` control can
never exercise the command-recording requirement, so r3 evidence must be a ≥10-byte blob
containing `0` and no `ls-tree`. Restoration: scratch copy restored to lane bytes
(`b1d05df1…`), re-run reproduces the refusal. Scratch root deleted; no writes outside the
seat dir and the scratch root.

VERDICT ok|finding — finding: mutant greens fixture C (exit 0 / `predicate:true`) while pristine refuses with `r3-command-not-recorded`, proving the ls-tree clause load-bearing; the assigned 2-byte `0`-only fixture is pre-empted by r3's `size < 10` gate and cannot discriminate.
