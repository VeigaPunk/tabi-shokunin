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
| `attribution` — the L1 recorded two LIVE seats as dead (`R83Mut1`, `R83Scribe`) from the absence of their report files, then overwrote the live `R83Mut1` report path (`w1/R83Mut1.md`) with its own status note | `w1/R83SeatStatus.md`; the seat's own report sha256 `bb82b14a…` no longer matches the path; orchestrator ruling measured both seats alive | the seat's own `report_sha256` in `w1-results.json` (a seat that declares a report hash while the file is missing is alive, not dead) | the seat's final output recovered byte-for-byte from `w1-results.json` into `w1/R83Mut1-results.json`; the record retracted here and in the ledger; the lost report bytes are named, not reconstructed |
| `number-drift` — `claims.json` C1 leg (a) says "clean 72 checks" (written before the counter reached 74), and the wave spec context carried a stale `D` and `base` | `claims.json` legs; seat reports R83Review2/R83Exec1 | the prefile falsification gate (claims vs instrument) | corrected of record in `plans/round-83.md` and the report: the operative predicate is "exit 0 clean at the committed counter", measured 74; identities re-derived, receipt re-run at the identity nonce |

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

One v1 wave, 10 seats (3 attack roles: R83Review1, R83Review2, R83Critic; connector,
scout, scribe, 3 executors incl. the C2 drift executor). Spawned 2026-11-08T02:06:43;
All **10 seats settled** and produced output (`w1-results.json`; role mix: 3 executors, 2 reviewers,
1 critic, 1 mutation-tester, 1 scout, 1 scribe, 1 connector = 3 attack roles). A first draft of this
section recorded `R83Mut1` and `R83Scribe` as dead — **wrong, retracted**: both were alive, and
`R83Mut1` produced 115 mutants (111 executed). No seat died.

Findings and their reconciliation:

1. **`multiple-mode-law` accepts any read bytes (R83Review1, MEDIUM-LOW false green).** A forged
   receipt can satisfy the law with `read.ret = 'hex:00'` as long as the file list, state and
   `upload.sha256` stay consistent — the sibling laws (`accept-mime-answer-law`,
   `second-chooser-answer-law`, `accept-answer-law`) all pin the exact delivered hex. Narrowed:
   C1's multiple-mode leg binds the mode, the input's file list and the driver's upload bytes, not
   the page-read hex; the ret pin is routed to r84. Not amended post-scoring (the frozen counter
   bytes are what was scored).
2. **The direction-bound "re-execution" is external, not self-proving (R83Drift).** The committed
   counter's `direction-bound` is statically anchored (`cellAnchor` + `reversedOnly`) and requires a
   committed control with `refused: true`; the counter does not itself spawn a mirror run. R83Drift
   ran the reversed control and it exits 1 (`.../round-83-seats/R83Drift/control-1-reversed.json`).
   Narrowed: the counter binds direction statically plus a committed refusal receipt; the
   re-execution is the wave's evidence, not the counter's own act.
3. **`r83-numbers` is presence-only for a single statement (R83Drift).** Removing one of the several
   `74 checks` statements does not change the verdict (>=1 occurrence across three files); removing
   all four is refused. Narrowed: the numbers leg binds "the stated numbers are present and the
   scored outputs are 74/153/50", not "every statement is independently checked".
4. **Replay boundary measured (R83Critic).** Copying a prior verbatim → `replay-event-timeline`
   (61/61 events matched, need 31); moving the first 31 events +100 ms escapes replay (30 < 31) but
   `event-leg-window` catches that naive boundary move. The escape minimum is `31` and it is the
   documented limit, not a claim.
5. **No-work controls, live (R83Critic + R83Review2).** r82 receipt under the r83 counter → exit 1,
   69 findings (40 failed checks); r83 receipt under the r82 counter → exit 1, 69 checks (41
   findings) — symmetric refusal, confirming the counter is not a do-nothing instrument.
6. **Adjacency (R83Connector).** 20 siblings scanned; the r83 C1 surface is uncontested. Five
   `contested` rows (kagi, kaidoku, kake, kumitate, revenger) contest shared loopback CDP endpoints,
   port leases and substrate paths — reported for the integrator, not absorbed.
7. **Identity-label drift (R83Review1/R83Review2, raised independently).** The wave spec context
   carried a stale `D = 9d90392aca79` (written before the last two re-pins); the committed
   `freeze.txt` sha256 is `b6496e6f5d4f…` and every seat's re-hash of the six pins matched the file.
   The scored receipt was re-run at the identity nonce `tabi-r83-l1-b6496e6f5d4f` so the receipt nonce
   and the records' identity nonce are the same value; the earlier scored receipt carried
   `tabi-r83-l1-`+`c016710129da` and is superseded (its counter run was clean 74 too). `claims.json` leg (a) says "72 checks",
   written before the counter reached 74; the operative predicate is "exit 0 clean at the committed
   counter", measured 74. Both are corrections of record, not predicate changes.

Scored (r83): counter 74 checks, battery 153/153, kill power 50/50, selftest 9/9.
- Round 83 digests: D b6496e6f5d4f, nonce tabi-r83-l1-b6496e6f5d4f. 74 checks.

Round-83 note on the spotcheck's item 4 (connector F2 record tension): the `PROVINCE.md`
contested labels and the four r81 report quotes that are not substrings of their cited lines are
reported to the integrator for triage to the owning lane
(`corpus/lessons/round-82-verifier-spotcheck.md` §Routed defects 4); this lane does not absorb
them. The single canonical amendment pointer stays `plans/round-82.md` (item 3's second half).
