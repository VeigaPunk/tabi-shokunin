HOLDS

# R76Revenger — scoped findings (tabi r76, fresh-start audit)

Measured 2026-11-07T05:00–05:05 -03:00 at lane HEAD `dd52d3db818f84ec29b83bb17163eb4592c0d3ce`
(base `a69f9060`, freeze `6ea51ce1`, D `97bf5d56`, scored `2d3628fe`). Full report and 18 receipts:
`.ufo/waves/round-76/w1/R76Revenger/report.md` and `…/R76Revenger/receipts/`.

**Milestone answer: no — r76 does not repeat a rejected or routed root failure.** 18 rows (eight
root-failure classes, ten routed-defect items): 16 CLOSED, 1 NOT REPEATED by construction (r60 K7),
1 OPEN (r62 R3, whose adjacency instrument does not exist this round).

## Instrument state (re-measured, not read)

- Six of six `freeze.txt:3-8` digests equal at HEAD (`sha256sum`, exit 0); `git diff --stat
  97bf5d56..HEAD -- scripts/ …` empty (exit 0) → no post-D instrument change (r61 C2 class closed).
- Leg (a) re-run: `node scripts/check-dialog-r76.mjs … --expect-nonce tabi-r76-l1-97bf5d560d03
  --prior-set …/prior-set.txt --json` → exit 0, `clean`, 131 checks, `findings []`, prior-set sha256
  `30f7418a…`, 17 priors (`receipts/recheck-counter-a.json`).
- Prior-set enumeration at the freeze parent `7e792fa3` over both walked trees, top-level `schema`
  filter: exactly the 17 lines of `controls/c1/prior-set.txt` (python over `git ls-tree`+`git show`,
  exit 0; equals `lesson-proof/prior-set-enumeration-toplevel.txt`, `diff` empty) → r74 probe-outside-
  PRE closed.

## r74 F4/F5 and r62 M5 applied to a COPY of the r76 counter, battery copy beside it

Counter copy + battery copy + driver copy in scratch; one edit each; battery run against the scored
receipt with the committed prior set and three laundered degenerates.

| Run | Edit | Battery exit | `allOk` | Failed cases | Verdict |
|---|---|---|---|---|---|
| base | none (sha256 `505055381ee4d469…dcf4`) | 0 | true | — | 251/251 control |
| F4 | `TOL = 0.05,` → `TOL = 0.045,` (`check-dialog-r76.mjs:202`) | **1** | false | `replay-timeline-tol-in-0.049` | **KILLED** |
| F5 | `Math.round(v * 10)) <= 1e-4` → `<= 0.02` (`:220`) | **1** | false | `event-time-quantum-bracket-2e-5` | **KILLED** |
| M5 | producer-verdict `&&` → `||` (`:404`) | **1** | false | 10 `producer-verdict-*` cases | **KILLED** |

Receipts `receipts/battery-{base,f4tol,f5grid,m5or}.json`, diffs `receipts/mutant-*.diff`. Committed
kill power agrees by name (`scored/c1-kill-power-a.json`: `M-timeline-tol-0.045`,
`M-quantum-tolerance-0.02`, `M5-producer-verdict-and-to-or` all `killed` with named cases).
**This generation kills the two weakenings that survived r75's battery 254/254.**

## Other direct refusals (commands, exit 1 each)

- relabelled PRE `smoke1` replay: control / +1e-12 / +1 event / −1 event → all exit 1 with
  `replay-event-timeline` (`abs` 1.0 / 1.0 / 0.9737 / 1.0) → r72 replay hole and r73 1e-12 escape
  closed; r74 count-change near-match closed.
- r75 drag receipt under the r76 counter → exit 1, 80 findings (cross-generation relabel refused).
- duplicate leg record → exit 1 (`leg-order`, `leg-records`) — the r62 R3 contradiction analog.
- event after `closedAt` labelled with the last recorded leg → exit 1 (`event-leg-window`) — r71
  relabel leak closed.

## Calibration audit (SHONEN.md + SCORECARD.md round-76 lines)

- SHONEN.md: 18 factual statements tested; **0 contradicted by a command**; 1 under-claim (box 2's
  criterion is satisfied by committed bytes while marked `[~]`); 1 weak citation (box 4's receipt
  shows the four lanes are *present*, not that the routes are held); 1 wording gap (box 1's literal
  "error patterns" absent, substantive content present).
- SCORECARD.md: **0 round-76 lines committed** (`grep -c '^## Round 76'` → 0; last is Round 75 at
  `:3751`) — the section is pending integration (leg d), so there is nothing to contradict. The only
  r76-related committed line is the Round 75 block's "Planned (r76)" (`:3769`): 5 of 7 items done,
  2 not applicable to the changed surface (DataTransfer; R75Mut1's drag witnesses, explicitly
  "carried, not claimed" at `claims.json:8`). 0 contradictions.
- **Mismatch count: 0 contradicted statements.** The lane's self-assessment errs by claiming less
  than the repo shows, never more.

## Open items (none is a repeat)

1. r62 R3 — no adjacency instrument this round; the class is untested, not fixed.
2. `prior-set-complete` can refuse an honest seat run because of a sibling's `*.json` receipt
   (`check-dialog-r76.mjs:216-219`); disclosed before data (lesson Mistakes row 6, `claims.json:13`),
   mitigated by the `*.receipt.txt` convention — a convention, not a check. Watch leg (b).
3. Gate registry row and `scripts/selftest-r76-gates.mjs` are uncommitted at the measured revision
   (in-flight integration, not a committed pointer to a missing file).
4. Lesson `## Mistakes` is uncommitted (+12 lines working tree).
5. `w1/` untracked — the wave is live; expected.

No tool installs. Scratch removed. Lane bytes untouched.
