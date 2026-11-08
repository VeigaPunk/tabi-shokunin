# tabi — round 82

L1 `TabiR82a2`. Base `b401027f` (lane clean). Round 81 was admitted
(`round-81-verifier-spotcheck.md`); its four routed defects (6–9) are this round's C2 spine; its
named frontier legs (`type=color` exempt, `type=month`/`week`/`time` non-file) are C1's. Claims:
C1 coverage — capability `chromium-showpicker-linux` generation r82; C2 calibration — record drift
(defects 6–9) plus the direction-bound counter and the r82 self-drift identity/numbers legs.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**;
registry 223 rows at base and 223 rows at HEAD (`.ufo/waves/round-82/scored/`, no census artifact
committed for this round — see Mistakes row 5). Scored (r82): counter 64 checks clean, battery
70/70 with coverage 64/64, kill power 46/46, gate self-test 9/9.

## Gate

### Sources — rows re-opened this round (the R82Scout seat opened the sources; no new rows)

No new source rows: every source the r82 laws rest on already carries a row, and each re-open came
back **byte-identical to the committed pin**, so a new row would be a duplicate-URL violation
(`scripts/check-sources.mjs` E04) and would double-count an unchanged source. The re-opens refresh
`recheck`/`used-by` in place (SOURCES contract rule 2), and each change is logged old→new below
and in `corpus/SOURCES.md`.

- **S219** WHATWG HTML, the `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html`. Opened 2026-11-07 by the seat, http 200,
  687,515 B, sha256 `b0202de1c0b4…` — byte-identical to the committed pin. Located quote
  (§4.10.5.4 *Common input element APIs*, the SecurityError step's exemption note):
  "File and Color inputs are exempted from this check for historical reason" (12 words, `wc -w`).
  Tier A for the File/Color exemption that the r82 color leg measured.
- **S220** Chromium 155.0.8059.84 Blink `HTMLInputElement` source —
  `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`. Opened
  2026-11-07 by the seat, http 200, decoded 101,570 B / 2,818 lines, sha256 `405b52c70185…` —
  byte-identical to the committed pin. Located quote (lines 2654-2655):
  "In cross-origin iframes it should throw a "SecurityError" DOMException except on file and
  color." (14 words, `wc -w`). Tier A for the exemption predicate at lines 2657-2658 and for the
  branch order (origin 2659, mutability 2666, gesture 2673, consumption 2679).
- **S221** CDP Page domain (`Page.pdl`) at tag 155.0.8059.84 — the interception command and the
  chooser event's fields. Opened 2026-11-07 by the seat, http 200, decoded 61,911 B, sha256
  `e944a3b19fa2…` — byte-identical to the committed pin. Located quote (line 1280):
  "When file chooser interception is enabled, native file chooser dialog is not shown."
  (13 words, `wc -w`). Tier A for the event's `backendNodeId` the answer command needs.
- **S222** CDP DOM domain (`DOM.pdl`) at tag 155.0.8059.84 — `DOM.setFileInputFiles`. Opened
  2026-11-07 by the seat, http 200, decoded 34,575 B, sha256 `50c460459e50…` — byte-identical to
  the committed pin. Located quote (line 684): "Array of file paths to set." (6 words, `wc -w`).
  Tier A for the answer command's parameters: `files`, `nodeId`, `backendNodeId`, `objectId` — no
  `accept` and no directory parameter, which is why the directory expansion belongs to the input.
- **S223** WHATWG HTML, the file-upload state's `accept` attribute — the same fetched page as S219.
  Located quote (§4.10.5.1.17 *File Upload state*, the accept paragraph):
  "The accept attribute may be specified to provide user agents with a hint of what file types will
  be accepted." (20 words, `wc -w`). Tier A for the hint-not-validation law the r82 accept-answer
  leg re-measured.

`used-by` appends (old → new, SOURCES contract rule 2): S219 and S220 gain
`corpus/knowledge/chromium-showpicker-runtime-round-82.md`; S221 gains it (its `used-by` named only
the round-80 note); S222 and S223 gain it alongside the round-81 note.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-82.md` (cites S219, S220, S221,
S222, S223; states the measured laws with their receipt field paths and what a receipt of this
shape cannot prove).

Rejected (with flip conditions):

- **"The color exemption proves the spec's exemption list is exactly file+color"** — measured for
  `type=color` only, in one fixture; the spec's full exemption surface is not enumerated by
  measurement (the source shows the predicate at S220 lines 2657-2658, but a source reading is not
  a measurement of the runtime surface). Flip: a source reading enumerating the exempt types at
  this tag, or a leg set covering the remaining input types.
- **"`type=month`/`week`/`time` SecurityError generalizes to all remaining input types"** — measured
  for three types, not all. Flip: remaining-type legs (`number`, `range`, `tel`, `search`).
- **"The second chooser is answerable in a way that attributes the answer to it"** — the r82
  click-while-open leg measures that the second `Page.fileChooserOpened` carries the SAME
  `backendNodeId` as the first (`legs[9].cdpEventLog`, both `backendNodeId = 11`), so answering by
  id cannot discriminate the second chooser from the first. Not measured as a law here. Flip: an
  answer whose delivered bytes or state are attributable to the second event specifically.
- **"The r82 counter binds the correction's direction"** — rejected as worded; see Corrections row
  11. The counter's direction sub-check is satisfied by co-occurrence on one line, not by the
  arrow's direction. Flip: a counter that re-derives the direction, or a control the counter
  re-executes rather than reads.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r82; `claims.json` / `SCORECARD.md`
for the frozen predicate, counter, pins and kill rule). C2 admitted as the calibration move
(`scripts/check-record-drift-r82.mjs`; before state `lesson-proof/c2-before.json`,
**4** mismatches of 8 claims; after `lesson-proof/c2-after.json`, 0 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `scope` — the iframe `#xo` was moved to 700px to clear `#s`, which pushed the child buttons off-viewport and overlapped go3/go5; the cross-origin legs hit wrong buttons | probes 1–9 (`.ufo/waves/round-82/controls/c1/probes/probe{1..9}.json` not retained; probe10 retained as `prior1.json`) | the pre-freeze probe itself (child events naming the wrong button) | iframe at 120px, buttons separated into two columns (go3/go4 at x=300, go5–go8 at x=160); probe10 clean on all 10 legs |
| `reference-drift` — the r81→r82 sed rename left r81 hex bytes in the ANSWER/DIR constants | `check-showpicker-r82.mjs` ANSWER/DIR hex (r81 bytes under r82 names) | the scored run (webkitdirectory/accept laws red) | r82 hex bytes `746162692d723832…` and sha256 `81ec2dd3…` |
| `scope` — the click-while-open target `#s` sat under the iframe after the iframe moved | probe4–5 (`clickWhileOpenElement = xo`) | the probe's own element read | `#s` pinned to `top:650px !important`; click leg clean |
| `reference-drift` — the drift counter was retargeted by sed and pointed at round-80 paths | `check-record-drift-r82.mjs` head | the selftest (`record-drift` gate red on stale paths) | counter rewritten for defects 6–9 + direction bound + r82 identity/numbers |
| `evidence-gap` — the lesson's census line cites a census start/end and a "W04 only — see below" pointer, but no census artifact for round 82 is committed and there is no "below" | `ls .ufo/waves/round-82/census` → absent; the r81 precedent committed `census/{start,mid,end}.txt`; `scripts/sources-census.sh validate tabi` exits 0 now, and W04 warnings never change the census exit status | this seat's Gate read of the committed tree | the census line now states the measured exit 0 and the row count (223 at base, 223 at HEAD) and names no missing artifact; a `census/` artifact for r82 is still owed |
| `evidence-gap` — QUALITY 160's red-state pointer names a probe file that was never committed | `corpus/QUALITY.md` 160 "Red state: `.ufo/waves/round-82/controls/c1/probes/probe8.json`"; the file does not exist (the probes directory holds only `prior1.json`) | this seat's read of the committed tree | the QUALITY row's red state must name a committed path or the retained `prior1.json`; a dead pointer is the r80 defect-3 class recurring |
| `discernment` — the C2 counter's `direction-bound` leg reads the controls file for the word "reversed" and never re-executes the control, and its `directional` sub-check is satisfied by co-occurrence on one line | `check-record-drift-r82.mjs` `direction-bound` claim (`/reversed/.test(JSON.stringify(controls))`); with the controls file rewritten to `"refused": false` the counter still exits 0 with 0 mismatches; with the lesson's arrow reversed to `20 → 23` (and "20 words" still present) the counter still exits 0 with `directional=true`; the sibling's own `control-1-reversed-correction.json` records 0 mismatches while `lesson-proof/c2-controls.json` asserts `refused: true` | this seat's scratch replay of the counter against a copied lane (read-only; the lane tree was not modified) | the lesson no longer claims the counter refuses a reversed correction (Corrections row 11); the counter is not amended here — the false green is routed to the next round with its two reproductions |
| `reference-drift` — three r81 instrument mistakes were re-armed by the r82 copy and are closed in the r82 bytes | `fl()` on the `type=date` input: r82 `PATCH_FL_TO` guards `t.files ? … : []` (`chrome-cdp-showpicker-round82.mjs` line 132) while `PATCH_STATE_TO` still calls `fl(g('disd'))` on the date input (line 136) — the r81 crash site is live and the guard is what survives it (the receipt's `legs[*].stateAfter.dis`/`disd` are `[]`, `failures: []`); the click-while-open battery case mutates index 7 (`pointerup@s`, buttons 0 → 1), not the r81 no-op index 6 (`negatives-showpicker-r82.mjs` line 141); the battery resolves the prior-set file's first line and parses THAT file (`negatives-showpicker-r82.mjs` lines 228-230), not the prior-set file as JSON | this seat's read of the r82 instrument bytes against the r81 mistakes | all three r81 classes are closed in the r82 instrument and the fixes are recorded here so a later rename does not silently drop them |

Sweep for further mistakes: `ls .ufo/waves/round-82/controls/c1/probes/` (prior1 retained);
`node scripts/check-record-drift-r82.mjs --lane <ABS lane> --json` re-reads the counter (exit 0,
0 mismatches); `node scripts/check-sources.mjs` re-reads the registry (exit 1, 15 `duplicate_url`
findings, all pre-existing at base — the same 15 rows trip the census's W04 "same URL across scopes",
which the census scores as clean).

## Corrections — the r81 spotcheck defects 6–9 (append-only; the r81 records are not rewritten)

`scripts/check-record-drift-r82.mjs` counts these (before: 4 mismatches of 8 claims; after: 0).
Each row names the record that still carries the stale statement and the correction that names the
truth.

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 6 | `LOG.md` (`23-word quote`), `corpus/QUALITY.md` ("6 and 23 words"), `SCORECARD.md` ("(23 words)") | S223 quote stated as 23 words (S223) | the true count is **20 words** for S223 (`wc -w` on the committed quote, `corpus/lessons/round-81.md` Gate); the lesson corrects 23 → 20 directionally (superseded count named, truth named) |
| 7 | `.ufo/waves/round-81/w1-results.json`, `.ufo/waves/round-81/w1/R81Scout.md`, `.ufo/waves/round-81/w1/R81Scout/`, `.ufo/waves/round-81-seats/R81Mut1/` | uncommitted wave files at HEAD | committed this round under the r82 wave-evidence commit; the lesson names R81Mut1 |
| 8 | the r81 report (wave section) | names no dead seats | the lesson names `R81Exec3` and `R81Drift` (both returned empty output, no seat directory) |
| 9 | the r81 report commit `9f0f8401` | a hyaku sweep commit ("L1 returned without committing; attribution defect") | the r82 report is committed by the lane itself via `fleet-commit.sh --as tabi` before returning |

Directions bound: the quote-count claim requires the lesson to carry the `23 → 20` direction (not
merely both numbers); the `lesson-proof/c2-controls.json` reversed-correction control (20→23) is
refused by the counter (presence-bound limit from r81: a reversed correction still passed the
presence check; the directional check refuses it).

| 6b | S223 Gate quote count 20 words (`wc -w`) | — | `printf '%s' "<quote>" \| wc -w` → 20; the S223 quote is 20 words |

### Corrections — the ten round-80 routed defects (carried forward; each correction landed in the round-81 lesson and its stale statement is still present)

These are the r80 non-author spot-check's routed list. Their corrections already live in
`corpus/lessons/round-81.md` (which the r82 counter's `r81-verdicts-preserved` leg checks: r81
counter 56 checks clean, r81 c2-before 12 mismatches, r81 c2-after 0). The stale statements are
append-only — the records still carry them, and each correction below names the truth.

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 1 | `.ufo/waves/round-80/census/end.txt` | `census exit=1` | the green re-run is committed at `.ufo/waves/round-80/census/end-green.txt` (`census exit=0`, 221 rows, W04 only) |
| 2 | `SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/knowledge/chromium-showpicker-runtime-round-80.md` | each cites the superseded D9 `211962dccb61` / `211962dc` | the final digests commit is D10 `93172ba92d63` (`tabi-r80-l1-93172ba92d63`); the five citations are superseded by this line |
| 3 | `.ufo/waves/round-80/lesson-proof/c1-nowork.json` | the pointer was dead (never committed) | the real no-work control output is committed there (the r79 receipt under the r80 counter: exit 1, 34 findings including `schema`) |
| 4 | `.ufo/waves/round-80/scored/cold-runs.txt` | the pointer was dead | the index is committed: four cold score files, each `clean 57`, each path resolves |
| 5 | `corpus/QUALITY.md` | no criterion checked Gate quote counts | QUALITY 159 requires every Gate quote count to be checked with `wc -w` before filing; the S220 quote is 14 words at lines 2654-2655 (stated 17 at 2654-2656) and the S221 quote is 7 words (stated 9) |
| 6 | `.ufo/waves/round-80/claims.json` | C2 leg (c) says "battery 81/81, kill power 82/82" | the committed scored outputs carry battery 102/102 and kill power 80/80; the frozen predicate is not edited |
| 7 | `SCORECARD.md` (scorecard) | the r80 capability row says `DOM.setInputFiles` | the command is `DOM.setFileInputFiles` (driver `:471`, receipt, note) |
| 8 | the r80 report | "truth-moved -> the five self claims" | the control's delta has six ids (`sc-80-numbers`, `log-80-numbers`, `skill-80-numbers`, `lesson-80-numbers`, `report-80-numbers`, `claims-80-numbers`) |
| 9 | the r80 report's landed-changes table | D10 `93172ba9` is named in the intro but absent from the table | the r81 landed-changes ledger names D10 `93172ba9` as the r80 digests commit |
| 10 | `.ufo/waves/round-80/scored/battery-a.json` | committed at D9, no receipt field, so 102/102 is not bound to the final receipt | `.ufo/waves/round-80/scored/battery-bound-a.json` re-runs the battery under the D10 receipt and carries `receipt.sha256` = the receipt's sha256 (102 cases, 0 failed, coverage.uncovered []) |

### Correction — the r82 self-drift identity

The r82 records cite the final digests commit D `5204a0581de5ef1a9eae08d156646dcb3e6ed25f` and the
nonce `tabi-r82-l1-5204a0581de5` (`claims.json` `digestsCommit`/`nonce`). Any r82 record that cites a
different r82 nonce is superseded by this line; the drift counter's identity leg reads the final
nonce from `claims.json` and refuses a record that cites another.

### Correction — the r82 numbers, and the before-state the lesson stated

The committed scored outputs carry **64 checks**, battery **70/70** (coverage 64/64,
`coverage.uncovered []`), kill power **46** mutants (0 survived, 0 crashed), and the gate self-test
**9/9**. The before-state is `lesson-proof/c2-before.json`: **4** mismatches of 8 claims (the four
failing claims: `quote-count-propagation`, `direction-bound`, `r82-identity`, `r82-numbers`), and
the after-state is `lesson-proof/c2-after.json`: 0 mismatches. The lesson's earlier sentence "before:
7 mismatches" is superseded by this line: the committed before-state file records **4**, and
`SCORECARD.md`'s r82 row records the same 4.

### Correction — what the direction-bound leg actually binds (this round's own finding)

The committed lesson claimed that the quote-count claim "requires the lesson to carry the `23 → 20`
direction (not merely both numbers)" and that the reversed-correction control "is refused by the
counter". The counter's `quote-count-propagation` claim requires `lessonCorrects` (the strings
`20 words` and `S223` present) and a `directional` match of `/23.*→.*20|23-word.*20|superseded.*20/i`;
the second alternative is satisfied by the STALE quote's own text on the corrections row ("23-word
quote" … "20 words"), so the arrow's direction is not what is tested. Measured on a copied lane, the
counter exits 0 with 0 mismatches when (a) the lesson's direction is reversed to `20 → 23` while
`20 words` stays present, (b) both arrows are removed while the stale text stays, and (c) the
controls file asserts `"refused": false` instead of `true`. The sibling's own
`control-1-reversed-correction.json` records 0 mismatches, while `lesson-proof/c2-controls.json`
asserts `refused: true` — the two committed records disagree. The truth: the counter binds the
PRESENCE of the superseded count beside the truth count on one line, not the direction; the
reversed-correction control is refused only when the truth token itself is removed. This is the
r81 presence-bound limit again, routed forward rather than re-litigated here; the counter is not
amended by this lesson.

## Wave w1 findings (integrated)

(To be integrated after WAVE-DONE.)

Scored (r82): counter 64 checks, battery 70/70, kill power 46/46, selftest 9/9.
- Round 82 digests: D 5204a0581de5, nonce tabi-r82-l1-5204a0581de5.
