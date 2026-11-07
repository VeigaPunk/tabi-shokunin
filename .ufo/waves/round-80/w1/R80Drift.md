# R80Drift — C2 record-drift calibration controls (round 80, wave w1)

Seat: R80Drift · Lane: `tabi-shokunin` (base `e2e12ca5`) · Counter: `scripts/check-record-drift-r80.mjs` · Date: 2026-11-07
Receipts: `.ufo/waves/round-80-seats/R80Drift/{baseline,control-1-reverse-correction,control-2-remove-stale,control-3-move-truth}.json` + full raw counter outputs under `raw/` (8 runs).
The lane was never written; all perturbations lived in a scratch mirror at `/fast/scratch/hyaku/tabi-r80/R80Drift/` (deleted after evidence capture).

## Method

Two mirrors, both bitwise copies of every record the counter reads (`SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/lessons/round-79.md`, `.ufo/waves/round-80/scored/*.json`, `.ufo/waves/round-80/claims.json`, `.ufo/waves/round-79/scored/{c1-negatives-a.json,selftest-r79-gates.out}`, fleet `.ufo/reports/round-79/tabi.md`):

- **raw snapshot** — the lane as found mid-wave. Baseline: exit 1, **5 mismatches**, all environmental: `sc-80/log-80/skill-80/lesson-80/report-80-numbers`. At snapshot time the r80 records do not yet carry `battery 103/103, kill power 81/81, 57 checks`, and `corpus/lessons/round-80.md` + fleet `.ufo/reports/round-80/tabi.md` do not exist yet (L1 integration outputs still in flight). Every append-only r79 claim, `claims-80-numbers` and `scored-80-present` pass; truth re-derives as r80 `{checks 57, cases 103, mutants 81, killed 81}`, r79 `{cases 90, mutants 64, killed 64}`.
- **mirror-complete** — the same copy plus a disclosed synthetic completion so the baseline is clean: one fixture line `battery 103/103, kill power 81/81, 57 checks` (marked "R80Drift calibration fixture, not lane content") appended to SCORECARD/LOG/SKILL, and placeholder lesson/report files. Baseline: exit 0, **0 mismatches, 17 claims**.

Each control ran on both mirrors: perturb → run counter → revert. The `.git` need of `report-79-shorthash` (`git cat-file -e f154beef…`) was satisfied read-only via a `.git` pointer file (`gitdir:` → the lane's repo); no mutating git command was run anywhere.

## Results

| Control | Edit (mirror only) | Raw snapshot exit / failed delta | Complete mirror exit / failed delta |
|---|---|---|---|
| C1 reverse correction | `battery 88/88 → battery 90/90` flipped to `battery 90/90 → battery 88/88` in SCORECARD | 1 / `+sc-79-battery` | 1 / `[sc-79-battery]` (1 of 17) |
| C2 remove stale | LOG line `- 88 cases → 90 cases (…)` deleted | 1 / `+log-79-cases` | 1 / `[log-79-cases]` (1 of 17) |
| C3 move truth | `scored/battery-a.json` `cases` 103 → 104 | 1 / `+claims-80-numbers` | 1 / `[sc-80, log-80, skill-80, lesson-80, report-80, claims-80]-numbers` (6 of 17; `scored-80-present` stays green) |

Key details: C1/C2 fail with `stale true correction false truth 90`; C3 fails with the re-derived truth `r80.cases 104` and `claims.json missing ["104 cases"]`.

## Do the controls prove direction+truth binding, or only presence?

- **C1 (reversed pair) — proves DIRECTION.** After the flip both numbers are still present (detail `stale true`; `battery 90/90` sits inside the flipped statement), so a presence-only counter would pass. The counter fails because the *ordered* pair `battery 88/88 → battery 90/90` is gone. The truth leg is unchanged and green in both states (`truth 90`), so truth is not what this control exercises.
- **C2 (stale removed) — proves PRESENCE (append-only).** Deleting the preserved historical statement fails `log-79-cases` even though the bare stale string `88 cases` still occurs elsewhere in LOG.md (r79 pre-freeze instrument list). The counter demands the stale→truth statement itself to survive; history cannot be rewritten or quietly dropped.
- **C3 (truth moved) — proves TRUTH.** One field flip in a committed scored output re-derives a new truth and every citing record fails with it — SCORECARD, LOG, SKILL, lesson, filed report, frozen claims.json — exactly the truth-citation graph, while `scored-80-present` and all r79 legs stay green. Records cannot state a number the bytes don't carry, and must follow the bytes when they change.

Net: the counter binds **direction, presence, and truth** — not mere presence of the involved strings.

## Notes for L1 / caveats

1. The raw-snapshot baseline's 5 failures are the in-flight leg-2 ids only; they should clear at integration when the r80 records carry `battery 103/103`, `kill power 81/81`, `57 checks` and the lesson + filed report exist. The lane copy used was read at 2026-11-07 ~19:29; nothing in the lane was modified.
2. The synthetic completion in `mirror-complete` is a calibration fixture only (marked in-file and in receipts); it was constructed to isolate per-control deltas, never to represent lane state.
3. No tools were installed or upgraded (nothing beyond the lane's own node script was needed); no pacman/uv/npm activity.
4. Kill-rule untouched: controls attacked the counter's records inputs, and the counter caught all three perturbations — no counter weakness found. One residual observation: the C2 leg's `has()` substring matching means a coincidental substring elsewhere (e.g. `88 cases` in the instrument list) keeps the `stale` half true; the pair requirement is what carries the binding. Not a hole — flagged for completeness.
