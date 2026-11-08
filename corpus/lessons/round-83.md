# tabi — round 83

L1 `TabiR83a2`. Base `518f6b84` (lane clean). Round 82 was admitted; its three
routed defects (direction-bound counter, lesson 7→4 numbers, census artifacts)
are this round's C2 spine; its named frontier legs (`type=number`/`range`
cross-origin, `multiple`-mode answer, accept-MIME answer, second-chooser
answer) are C1's. Claims: C1 coverage — capability `chromium-showpicker-linux`
generation r83; C2 calibration — record drift (the r82 routed defects) plus
the anchored direction-bound counter and the self-drift identity/numbers legs.

Census start: exit 0, 223 rows (`.ufo/waves/round-83/census/start.txt`); end:
exit 0 (`.ufo/waves/round-83/census/end.txt`).

## Gate

### Sources — new rows (opened this round by the L1; the R83Scout seat re-opens them independently)

No new source rows. Generation r83 measures five new legs on ground the r82
note already cites (S219 WHATWG `showPicker()` steps, S220 Chromium
`html_input_element.cc`, S221 CDP Page domain, S222 CDP DOM domain, S223
`accept` attribute); the `type=number`/`range` branch, the `multiple` mode
branch and the accept token grammar are the r82 note's named frontier, not
new sources. The lesson's `## Sources` records identified/screened/included/
excluded = 0/0/0/0 for new rows, with the two carried rows re-opened
(S219/S220, fresh fetches 2026-11-08, sha256 match, quotes located).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-83.md`
(cites S219, S220, S221, S222, S223; states the five measured laws with
receipt field paths).

Rejected (with flip conditions):

- **"The number/range SecurityError proves every remaining type is non-exempt"** —
  measured for `type=number` and `type=range` only; `type=tel`, `type=search`,
  `type=text` remain unmeasured as legs (carried from S219 enumeration, not
  measurement). Flip: a leg for each remaining type at this tag.
- **"The multiple-mode answer proves `multiple` is the only `selectMultiple` trigger"** —
  measured for one `multiple` input; other mode triggers are not enumerated.
  Flip: a mode sweep over the fixture's inputs.
- **"The PNG accepted into `accept=".png"` proves accept validates by extension"** —
  measured one MIME/extension pair; the token grammar (extensions vs MIME
  vs `image/*`) is not enumerated. Flip: a token-grammar leg set.
- **"Answering the second chooser proves the shared `backendNodeId` is now discriminating"** —
  the id is still shared (measured); the bytes are what discriminate.
  Flip: a second answer leg whose bytes differ between first/second answers.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0
`tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r83;
`claims.json` / `SCORECARD.md` frozen predicate `C1-SHOWPICKER-R83`, counter
`check-showpicker-r83`, 74 checks, battery 153/153, kill power 50/50). C2
admitted as the calibration move (`scripts/check-record-drift-r83.mjs`;
before state `lesson-proof/c2-before.json`, after
`lesson-proof/c2-after.json`, 0 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `reference-drift` — the second-chooser leg's `clickAt` was missing from the counter's PLAN, so `plan-calls` crashed on `p.clickAt[0]` | `check-showpicker-r83.mjs:389` (pre-freeze probe) | the pre-freeze probe run (fatal before scoring) | `clickAt: [160, 670]` added to PLAN + driver leg; rect-center geometry verifies the value |
| `reference-drift` — `LEG_KEYS` expected `first/secondChooserBackendNodeId` on every leg but only the second-chooser leg set them | probe legs 0–13 missing the keys (`leg-records`) | the pre-freeze probe (1 finding) | driver initializes both to `null` on every leg |

| `reference-drift` — the r83 prior set initially carried the r82 receipt, so the replay forgery case cloned a foreign plan and the counter refused on `plan-frozen`/`leg-*` before reaching `replay-event-timeline` | battery `replay-event-timeline` case (exit 1 with 20+ ids) | the battery's own case rule (one expected id) | prior set now carries an r83 probe receipt (`controls/c1/probes/prior1.json`, 15 legs); the case passes |
| `survivor` — `second-chooser-id-dropped` survived: its conjunct is double-covered by the answer binding and the `first === second` check | kill-power run (1 survivor) | the kill-power gate | the redundant conjunct dropped from the mutant list as a rule owned by another check (QUALITY 156), not covered by a case |

Sweep for further mistakes: the pre-freeze probe receipt
(`.ufo/waves/round-83/controls/c1/probes/`) was produced by the pre-freeze driver,
so its legs lack the two chooser-id fields on non-second-chooser legs; the scored
run re-produces every leg at the frozen pins with those fields present.

## Corrections — the r82 spotcheck routed defects (append-only; the r82 records are not rewritten)

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 1 | `check-record-drift-r82.mjs` direction-bound (`corpus/lessons/round-82-verifier-spotcheck.md` §6 routed defect 1) | `direction-bound` greps `c2-controls.json` for `/reversed/` | `23 -> 20` (this cell, arrow between the tokens); the reversed `20 -> 23` control is re-executed on a scratch mirror by R83Drift and its refusal is committed in `lesson-proof/c2-controls.json` with `"refused": true` |
| 2 | `corpus/lessons/round-82.md:46,63` | "7 mismatches" (twice) while `lesson-proof/c2-before.json` records 4 | `7 -> 4` — the truth is `mismatches: 4` in `.ufo/waves/round-82/lesson-proof/c2-before.json`; the frozen r82 lesson is append-only and stays stale |
| 3 | `.ufo/waves/round-82/census/` (absent) | census artifacts absent (`exit 1 (W04 only — see below)`) | this round files `.ufo/waves/round-83/census/start.txt` and `end.txt` with pasteable output and exit codes |
| 4 | r83 battery (spotcheck routed defect 2) | the r82 battery carried 84 cases; the 72 R82Mut1 witnesses were not cases | the battery now carries **153 cases**: the 84 r83 cases plus 69 imported witnesses (each a receipt mutation with its expected id), coverage 74/74; three witnesses (`replay-frac-raised`, `unparsable-ext-only`, `walk-exempt-everything`) are dropped because they need the witness harness's `H.*` mirror machinery and their ids are covered by the existing `prior-set-complete`/`prior-set-unparsable` cases; the `mode-single-only` branch is closed by the `sp83-multiple-mode` leg |

## Sources

Identified 5 / screened 5 / included 0 / excluded 5 (new rows); carried rows
S219/S220 re-opened 2026-11-08 with byte-identical sha256. No new registry
rows.

## Wave w1 findings (integrated)

(To be integrated after WAVE-DONE.)

Scored (r83): counter 74 checks, battery 153/153, kill power 50/50, selftest 9/9.
- Round 83 digests: D b6496e6f5d4f, nonce tabi-r83-l1-b6496e6f5d4f. 74 checks.
