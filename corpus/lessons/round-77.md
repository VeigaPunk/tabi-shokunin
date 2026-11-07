# tabi — round 77

L1 `TabiR77a2`, **attempt 2**. Base `1320d428f0c0957b46d6969b59c122fd69199331` (lane clean, `ahead=0
behind=0`). Attempt 1 (05:48–10:50 the same day) ended `lane-dead-no-report tabi round=77` with its whole
output uncommitted; attempt 2 inherited it, re-verified it, and committed it under this round: the four
instruments, the executed controls, the 13 pre-freeze receipts (3 shape probes, 4 probes, 9 smokes), the
three degenerate drivers, S208–S212, QUALITY 145–148, the note and this lesson. Re-verified before the
freeze: a fresh driver run → counter clean 183; the battery 336/336 `allOk` on that run; `controls-c1.mjs`
`allOk` rc 0; the full pre-freeze gate pass re-run over the final bytes. One attempt-1 artefact was
repaired, not inherited as frozen (Mistakes row 6), and one seat role in the wave spec (labrat is a
frozen-topology seat the swarm validator rejects; the probe item runs as an executor). Nothing else was
discarded.

Round 76 was admitted (spot-check `corpus/lessons/round-76-verifier-spotcheck.md`: C1 verifies, coverage
improved, calibration unchanged, 0 disagreements on the sampled admit/rejects). The r74–r76 spot-checks
(all admitted) and the last rejections (r60–r62, r71/r72) were read before the claim. The five routed
defects of the r76 closure and what this round does with them (all applied to THIS generation's new
instruments, `scripts/check-filechooser-r77.mjs`, `scripts/negatives-filechooser-r77.mjs`,
`.ufo/waves/round-77/controls/c1/kill-power-r77.mjs`):

1. *Limit sentence derived from the counter's own denominators, plus a case that adds a gap.* Both
   replay fractions now divide by the PRIOR's counts (N_p events, G_p gaps), which a forger cannot
   change; the counter prints a per-prior `limit` block (absNeed, gapNeed, matched counts) and the
   frozen limit sentence is that block. Battery case `replay-timeline-gaps-added-own-denominator` (the
   receipt under test adds two gaps; the prior keeps exactly gapNeed matched → refused) and its
   accepting twin; kill-power mutant `M-timeline-gap-denominator-own`; control
   `replay-gaps-added-r76-escape` exit 1. QUALITY 145.
2. *Prior-set walk robustness; bind event-log order, frame ids, urls.* The walk reads every regular
   file of `.ufo/waves/round-77` and `corpus/evidence/round77` whatever its extension, follows
   symlinked files and directories (real paths de-duplicated), refuses a schema-bearing JSON-looking
   file that does not parse (`prior-set-unparsable`), and treats a parsed object as a receipt by its
   top-level schema plus `nonce`/`events`. New `frame-binding`: every chooser event and the one
   main-frame navigation carry the recorded main frame id, the navigation url is exactly
   origin + `/?run=<nonce>` and comes first; `chooser-event-binding` requires afterSendId order.
   Battery cases on a scratch MIRROR lane (symlinked dir, `.JSON`, `.txt`, truncated `.json`, brace
   `.txt`, nonce-stripped copy; must-accept prose); kill-power mutants for each walk feature. QUALITY 146.
   Not done: an explicit "afterSendId ≤ last send id" bound and navigate loader ids (one navigation
   only in this fixture) — routed.
3. *Battery: `GAP_MIN` bracket + mutant; placement collision-free on every honest receipt incl. probes;
   R76Mut1's 7 witnesses.* Own-gap brackets 50.1 ms (accept) / 49.9 ms (refuse) and mutants
   `GAP_MIN` 100/40; the pre-freeze pass runs the counter AND the battery over p1–p4 as well as the
   smokes (it caught a misplacement on p2: Mistakes row 3). R76Mut1's witnesses are dialog-counter
   mutants: carried, not claimed (no dialog generation this round), with R75Mut1 (drag), R74Mut1
   (IME), R73Mut1 (pinch).
4. *`captured-by: none` rows → grounded QUALITY criteria.* QUALITY 145 (limit/denominator), 146 (walk
   + enforced seat-output rule), 147 (wide novelty grep), each with a committed red state.
5. *Seat receipts outside the walked trees, enforced in the dispatch contract.* `build-spec.py`
   requires the SEAT-OUTPUT RULE (JSON and receipts only under `.ufo/waves/round-77-seats/<seat>/`)
   in every item and refuses a spec without it (`lesson-proof/build-spec-refusal.txt`: the crafted
   item is refused, rc 0 of the self-check).

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0
(`.ufo/waves/round-77/census/start.txt`; 207 rows at base:
`git show 1320d428:corpus/SOURCES.md | grep -cE '^ {0,3}\| S[0-9]{3,} '`).

Claim: C1 coverage — capability `chromium-file-chooser-linux` (CDP `Page.setInterceptFileChooserDialog`,
`Page.fileChooserOpened` and `DOM.setFileInputFiles` on Chromium 155 `--headless=new`, choosers opened
by real mouse clicks), sourced: S208–S212, new this round. One claim only.

## Gate

### Sources — new rows

All fetched by the L1 on 2026-11-07 between 05:52:52 and 05:52:57 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(base64 decoded; decoded copies, line counts and sha256 in `.ufo/waves/round-77/sources/FETCH.txt`).
Each row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-77 note and this
lesson. Before the append, `grep -c 'DOM.pdl\|inspector_dom_agent\|file_input_type\|inspector_page_agent'
corpus/SOURCES.md` was 0; `Page.pdl` at this tag is S202 (dialog lines), so S212 is a second scope of
that file (W04 by design, as S206/S186).

- **S208** `third_party/blink/public/devtools_protocol/domains/DOM.pdl` (1,022 lines, sha256
  `50c46045…f702`). Located quote (line 681): "Sets files for the given file input element."
- **S209** `third_party/blink/renderer/core/inspector/inspector_dom_agent.cc` (3,642 lines, sha256
  `e7c983b4…c84f`). Located quote (line 1809): "return protocol::Response::ServerError("Node is not a
  file input element");"
- **S210** `third_party/blink/renderer/core/html/forms/file_input_type.cc` (650 lines, sha256
  `f96265db…f705`). Located quotes (line 183): "File chooser dialog can only be shown with a user
  activation." and (lines 536-537): "if (paths.empty()) return;" and (line 479):
  "GetElement().DispatchCancelEvent();"
- **S211** `third_party/blink/renderer/core/inspector/inspector_page_agent.cc` (2,003 lines, sha256
  `1dd744b5…49a8cf`). Located quote (line 1953): "// Cancel file chooser only if interception is
  enabled."
- **S212** `third_party/blink/public/devtools_protocol/domains/Page.pdl` (1,795 lines, sha256
  `e944a3b1…05be`, the bytes S202 holds). Located quote (lines 1280-1281): "When file chooser
  interception is enabled, native file chooser dialog is not shown. Instead, a protocol event
  `Page.fileChooserOpened` is emitted."

Opened and excluded (not rows): `html_input_element.cc`, `file_chooser.cc` (no line the claim needs);
`content/browser/devtools/protocol/page_handler.cc` (S203 holds it; no file-chooser path in it).

### Admitted

- `corpus/knowledge/chromium-file-chooser-runtime-round-77.md` (cites S208–S212): what a page and a
  CDP client see when CDP intercepts and answers file choosers on this build, sourced step by step and
  measured identically in every per-leg field on 16/16 honest pre-freeze runs (3 shape probes, 4 probes,
  9 smokes).

### Rejected (with flip conditions)

- **"A `webkitdirectory` input opens a `selectMultiple` chooser"** — reject: S211 1909 picks
  `selectMultiple` only for `multiple`, and the probe is called with `input.Multiple()` (S210 203);
  measured `selectSingle` 16/16 (control `forge-belief-directory-multiple` refused). Flip: a tag that
  maps upload-folder to selectMultiple, or a run that reports it.
- **"`setFileInputFiles([])` clears the selection"** — reject: S210 536-537 returns on an empty list;
  measured: no event, selection kept, 16/16 (control `forge-belief-empty-list-clears` refused). Flip: a
  tag that clears on empty input.
- **"`accept` filters what `setFileInputFiles` sets"** — reject: `SetFilesFromPaths` (S210 533-556)
  never reads accept (accept types go only to the native chooser's params, 224, and the directory path's, 530); measured a.txt set on
  `accept=".png"`, 16/16 (control `forge-belief-accept-filters` refused). Flip: a tag whose
  SetFilesFromPaths filters by accept.
- **"Re-selecting the same file fires `change`"** — reject: S210 465-481 fires `cancel` when SetFiles
  reports no change; measured `cancel` only, 16/16. Flip: a connected chooser with
  FilePickerEventsFixEnabled (`force_change_event_`, S210 496-499) — not this intercepted path.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a NEW counter rule binding two timestamps by equality: `event-types` required a read event's `ts === at`, but the page takes `ts` when the read resolves and `at` when it records it, 0.1–4 ms apart, so pass 1 refuted 12 of 13 honest receipts | `.ufo/waves/round-77/lesson-proof/counter-pass1/pf-*.counter.json` (`event-types` on p1–p4 and smoke2–9; the pass-1 counter bytes beside them) | QUALITY 144 (every new rule on all honest pre-freeze receipts, probes included) — it caught it before the freeze | `ts <= at`, with the measurement in the counter comment; 13/13 clean after |
| a control's expected finding ids written from belief (the r75 row-1 / r76 row class, third round running): `forge-belief-empty-list-clears` expected `selection-law`, but the counter's selection-law excludes `pick-empty` by design (empty-list-law owns it) | `.ufo/waves/round-77/lesson-proof/controls-first-pass-empty-list-expectation.json` (allOk false, ids `leg-pick-empty-state`, `empty-list-law`) | QUALITY 131 (expected exit AND ids, mechanically) — it caught it | expectation corrected to the two ids the counter's own law ownership implies; allOk |
| a recorded fix not carried to NEW battery cases: r76 fixed "a bracket placement guard over-constrained the unbracketed side" for its abs/gap brackets, but r77's new gap brackets again demanded abs exactly 0; a 1 ms whole shift lands some events on a neighbour 1.0 ms away, so p2 and smoke2 misplaced 1–2 cases (and smoke2's kill power did not hold) | `.ufo/waves/round-77/lesson-proof/prefreeze-pass1/pf-p2.battery.json`, `pf-smoke2.battery.json`, `pf-smoke2.killpower.out`, `run-prefreeze-gates.out` | the battery's own `placed()` guard plus QUALITY 144's probe pass — p2 is a probe the r76 pass did not run the battery on | gap brackets leave the abs side `null` ("below need"), comment in the battery; full pass re-run |
| an instrument read through a pipe exits before its output drains: the battery printed a ~190 KB `--json` summary and called `process.exit()`, which cut the pipe at 64 KiB, so the first kill-power trial classified 41 runs (incl. the unmutated one) `crashed`, "summary unparsable" | `.ufo/waves/round-77/lesson-proof/killpower-trial1-smoke1-pipe-truncation.json`; reproduced `node -e 'console.log("x".repeat(200000)); process.exit(1)' \| wc -c` → 131072 | r76's kill-power attribution rule (a crash is never a kill) — it made the failure visible instead of 41 false kills; no criterion required a full-size pipe run before the freeze — QUALITY 148 (new) | battery `process.exitCode`; counter writes synchronously; the full pass shows `crashed: []` |
| a new strict rule refusing the lane's own bookkeeping: the first walk refused every schema-bearing unparsable file, and `prior-set.txt`'s comment line names the schema, so the counter refused its own prior set (`prior-set-unparsable: .ufo/waves/round-77/controls/c1/prior-set.txt`) on the first smoke1 run | first smoke1 run of the pre-freeze counter (console, not kept as a file: the run printed the single finding; recorded here) | the rule's first honest run — it fired | refusal limited to JSON-looking files (`.json` name in any case, or a first non-blank `{`/`[`); prose naming the schema stays legal and is a must-accept battery case (`accept-prose-naming-schema`) |
| (from round 76) a limit sentence computed against a denominator the forger controls; a completeness walk that skipped files; a seat-output convention stated but not enforced; a novelty grep narrower than the sentence | round-76 lesson Mistakes rows with `captured-by: none`; spot-check routed defects 1, 2, 4, 5 | none in r76 — QUALITY 145, 146, 147 (new) | each criterion carries a red state that fails (`F2c-one-gap.counter.json` exit 0 under r76; the r77 walk mutants survive without their cases; `build-spec.py --selfcheck` refuses; `lesson-proof/novelty-grep.txt`) |

Sweep for further mistakes: `ls .ufo/waves/round-77/lesson-proof/` (every red state above);
`node .ufo/waves/round-77/controls/c1/prefreeze-summary.mjs` after the fixes (allOk).

## Census

Start: exit 0 (`.ufo/waves/round-77/census/start.txt`; 207 rows at base). End: see the report.
| (attempt 2) a battery placement guard that demanded a derived prior's matched count be EXACTLY 0: `accept-prior-tol-out-0.051` retimes every event by ±0.051 ms; where the receipt has two events on adjacent 0.1 ms grid steps, a shifted event lands 0.049 ms from its neighbour, which is inside TOL, so the guard threw on an honest fresh receipt (abs 2 of need 40) although the counter's own verdict was clean. Attempt 1 ran the battery only on its 13 pre-freeze receipts, which happened to have no such neighbours, so its green pass hid the fragility | `.ufo/waves/round-77/lesson-proof/attempt2-battery-fresh-receipt-pass1.json` (case `accept-prior-tol-out-0.051`, `error: "bracket misplaced: abs 2 (need 40) gap 4 (need 9) want 0 / <9"`, battery exit 1) and `.ufo/waves/round-77/lesson-proof/attempt2-battery-fresh-receipt-pass2.json` (exit 0, 336/336 after the repair) | none — QUALITY 144 runs a battery over the pre-freeze receipts only; the class is QUALITY 149 (new): a derived-prior guard states the property it brackets (out of tolerance from its own twin, below the prior's needs), never an absolute count, and the battery is run at least once on a receipt produced AFTER its own last edit | guard now asserts every event retimed beyond TOL by one amount from its own twin and `placed(p, null, null)`; the receipt produced after the edit is clean 336/336 |
