# ScribeMistakes — round 20, mined r19 mistake row (draft)

Seat: `TabiR20.ScribeMistakes`. Leaf, read-only except this report. No subagent dispatch, no tests, builds, or formatters run. No tool installed or updated. Lesson and QUALITY bytes untouched.

Scope: one draft row for the round-20 Mistakes table, covering the r19 missing direct return-time snapshot, captured by QUALITY 48. Not a claim that r19 is repaired.

## Draft row

| Class | Evidence | Captured-by | Fix, including red case |
|---|---|---|---|
| landing | r19 wave-1 return-time `git status --porcelain=v1 -uall` was never captured before L1 imported clone files. The after-state is reconstructed from mtimes and labelled RECONSTRUCTED (`.ufo/waves/round-19/isolation/ledger.json:4-8`; `corpus/lessons/round-19.md:84`). The only after-listing is `isolation/lane-status-uall-0425.txt`, taken after import. C3 d4 stays unprovable, and the r19 lesson says it is not repaired (`corpus/lessons/round-19.md:142-145,190-191,212-213`). | QUALITY 48 (reconstructed return-time status is not a before/after observation); origin in QUALITY 45 and the r19 lesson Mistakes row (`:84`) | Refuse reconstructed after-state for closure credit. A before/after snapshot counts only if captured at the return event, before any import, by an observer outside the writer's clone. Red case: a RECONSTRUCTED ledger must be refused, as `measure-c3.mjs:356-358` does with `direct_return_snapshot_missing_reconstruction_is_not_observation` and the case `d4_reconstructed_snapshot_rejected` (`:551-554`). Also red: a snapshot taken after integration named as the return snapshot (the r19 `isolation/w2-return-after-L1-integration.txt` shape, `corpus/lessons/round-19.md:193-196`). No `d4_` case in `measure-c3.mjs` covers this (grep of `d4_` lines `:551-580`). |

## Status of the requirement (presence check)

- **r19 check that exists:** `.ufo/waves/round-19/measure-c3.mjs` refuses reconstructed after-state (`:356-358`) and has a red case (`:551-554`). This is a refusal of the reconstruction. It does not supply the missing observation.
- **r20 check-wave red case: not present.** `.ufo/waves/round-20/design.json:23` names `.ufo/waves/round-20/measure-c1.mjs` as the counter, but that file does not exist in the lane tree at read time. The round-20 tree holds only `design.json`, `clones/`, and `w1/` (`before.json`, `dispatch.json`, `record.json`, `registry-label-check.json`, `spec.json`, `swarm-registry.json`, `task-result.json`). No round-20 isolation ledger or return-time snapshot exists. The requirement for a QUALITY 48 red case is therefore stated, not satisfied.
- **Not claimed:** no r19 row marked repaired; no historical status reconstructed or fabricated; the missing r19 observation is irrecoverable and stays unprovable (`corpus/lessons/round-19.md:145`).

## Coverage limits

- Round-20 source scope (S096 `html_form_element.cc`, sha `8c8d6796…6916`) is not involved in this row. I did not open or hash it.
- The corpus paths above are working-tree reads. I did not check that each cited file is tracked at a committed revision (QUALITY 28), so that is untested.
- The `d4_` grep covers `measure-c3.mjs` only. Other round-19 checkers were not exhaustively read.

## Evidence pointers (working tree, read-only)

- `corpus/lessons/round-19.md:84, 142-145, 149-154, 190-196, 212-213`
- `corpus/QUALITY.md:214-228` (QUALITY 48 and its red case; the line range covers criteria 47-49)
- `.ufo/waves/round-19/isolation/ledger.json:4-8`
- `.ufo/waves/round-19/measure-c3.mjs:356-358, 551-554`
- `.ufo/waves/round-20/design.json:14, 23`
