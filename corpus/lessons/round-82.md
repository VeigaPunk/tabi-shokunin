# tabi — round 82

L1 `TabiR82a2`. Base `b401027f` (lane clean). Round 81 was admitted; its four spotcheck
defects (6–9) are this round's C2 spine; its named frontier legs (`type=color` exempt,
`type=month`/`week`/`time` non-file) are C1's. Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r82; C2 calibration — record drift (defects 6–9)
plus the direction-bound counter and the self-drift identity/numbers legs.

Census start: exit 1 (W04 only — see below); end: exit 0. Registry 223 rows at base.

## Gate

### Sources — new rows (opened this round by the L1; the R82Scout seat re-opens them independently)

No new source rows. Generation r82 measures four new legs on ground the r81 note already
cites (S219 WHATWG `showPicker()` steps, S220 Chromium `html_input_element.cc`); the
`type=color`/`month`/`week`/`time` branch is the r81 note's named frontier, not a new
source. The lesson's `## Sources` records identified/screened/included/excluded = 0/0/0/0
for new rows, with the two carried rows re-opened (S219/S220, fresh fetches 2026-11-08,
sha256 match, quotes located).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-82.md` (cites S219, S220;
states the four measured laws with receipt field paths).

Rejected (with flip conditions):

- **"The color exemption proves the spec's exemption list is exactly file+color"** —
  measured for `type=color` only, in one fixture; the spec's full exemption surface is
  not enumerated. Flip: a source reading enumerating the exempt types at this tag.
- **"`type=month`/`week`/`time` SecurityError generalizes to all remaining input types"** —
  measured for three types, not all. Flip: remaining-type legs (`number`, `range`, …).
- **"Answering the second chooser is possible via the shared `backendNodeId`"** —
  r81 measured the second chooser shares the first's `backendNodeId` (9); answering by
  id cannot discriminate which chooser is answered. Not measured as a law. Flip: an
  answer leg whose delivered bytes are attributable to the second event specifically.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r82; `claims.json` /
`SCORECARD.md` frozen predicate `C1-SHOWPICKER-R82`, counter `check-showpicker-r82`,
64 checks, battery 70/70, kill power 46/46). C2 admitted as the calibration move
(`scripts/check-record-drift-r82.mjs`; before state `lesson-proof/c2-before.json`,
7 mismatches; after `lesson-proof/c2-after.json`, 0 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `scope` — the iframe `#xo` was moved to 700px to clear `#s`, which pushed the child buttons off-viewport and overlapped go3/go5; the cross-origin legs hit wrong buttons | probes 1–9 (`.ufo/waves/round-82/controls/c1/probes/probe{1..9}.json` not retained; probe10 retained as `prior1.json`) | the pre-freeze probe itself (child events naming the wrong button) | iframe at 120px, buttons separated into two columns; probe10 clean on all 10 legs |
| `reference-drift` — the r81→r82 sed rename left r81 hex bytes in the ANSWER/DIR constants | `check-showpicker-r82.mjs` ANSWER/DIR hex (r81 bytes under r82 names) | the scored run (webkitdirectory/accept laws red) | r82 hex bytes `746162692d723832…` and sha256 `81ec2dd3…` |
| `scope` — the click-while-open target `#s` sat under the iframe after the iframe moved | probe4–5 (`clickWhileOpenElement = xo`) | the probe's own element read | `#s` pinned to `top:650px !important`; click leg clean |
| `reference-drift` — the drift counter was retargeted by sed and pointed at round-80 paths | `check-record-drift-r82.mjs` head | the selftest (`record-drift` gate red on stale paths) | counter rewritten for defects 6–9 + direction bound + r82 identity/numbers |

Sweep for further mistakes: `ls .ufo/waves/round-82/controls/c1/probes/` (prior1 retained);
`node .ufo/waves/round-82/controls/c1/nowork.json` re-reads the no-work control (exit 1,
33 findings including `schema`).

## Corrections — the r81 spotcheck defects 6–9 (append-only; the r81 records are not rewritten)

`scripts/check-record-drift-r82.mjs` counts these (before: 7 mismatches; after: 0). Each row
names the record that still carries the stale statement and the correction that names the truth.

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 6 | `LOG.md` (`23-word quote`), `corpus/QUALITY.md` ("6 and 23 words"), `SCORECARD.md` ("(23 words)") | S223 quote stated as 23 words (S223) | the true count is **20 words** for S223 (`wc -w` on the committed quote, `corpus/lessons/round-81.md` Gate); the lesson corrects 23 → 20 directionally (superseded count named, truth named) |
| 7 | `.ufo/waves/round-81/w1-results.json`, `.ufo/waves/round-81/w1/R81Scout.md`, `.ufo/waves/round-81/w1/R81Scout/`, `.ufo/waves/round-81-seats/R81Mut1/` | uncommitted wave files at HEAD | committed this round under the r82 wave-evidence commit; the lesson names R81Mut1 |
| 8 | the r81 report (wave section) | names no dead seats | the lesson names `R81Exec3` and `R81Drift` (both returned empty output, no seat directory) |
| 9 | the r81 report commit `9f0f8401` | a hyaku sweep commit ("L1 returned without committing; attribution defect") | the r82 report is committed by the lane itself via `fleet-commit.sh --as tabi` before returning |

Directions bound: the quote-count claim requires the lesson to carry the
`23 → 20` direction (not merely both numbers); the `lesson-proof/c2-controls.json`
reversed-correction control (20→23) is refused by the counter (presence-bound limit
from r81: a reversed correction still passed the presence check; the directional check
| 6b | S223 Gate quote count 20 words (`wc -w`) | — | `printf '%s' "<quote>" \| wc -w` → 20; the S223 quote is 20 words |
refuses it).

## Wave w1 findings (integrated)

(To be integrated after WAVE-DONE.)

Scored (r82): counter 64 checks, battery 70/70, kill power 46/46, selftest 9/9.
- Round 82 digests: D 5204a0581de5, nonce tabi-r82-l1-5204a0581de5.
