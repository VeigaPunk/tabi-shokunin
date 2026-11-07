# tabi — round 75

L1 `TabiR75`, attempt 1. Base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb` (lane clean, `ahead=0 behind=0`;
`.ufo/watchdog.log` shows only `launch tabi round=75 … attempt=1`, no earlier attempt, nothing inherited).

Round 74 was admitted (spot-check `corpus/lessons/round-74-verifier-spotcheck.md`, C1 verifies; frozen
limit and prior-set sentences falsified and corrected in-round). Round 73 admitted, round 72 rejected
(honest stop). The r72–r74 spot-checks were read before the claim. Routed defects of the r74 closure and
what this round does with them:

1. *Enumerate the prior set by schema at the freeze parent; make the near-match survive inserted or
   deleted events.* Applied to this generation: PRE is `controls/c1/prior-set.txt`, produced by a schema
   grep and re-checked with `git grep` at the freeze parent (QUALITY 140); the r75 counter's
   `replay-event-timeline` matches event-time **multisets** and ≥ 50 ms **gap** multisets, so neither an
   inserted/deleted event nor a whole-timeline shift takes a relabel out of the comparison (controls
   `replay-forged-whole-shift-0.1ms` — the r74 declared limit — and `-100ms` refused; battery
   `replay-timeline-prior-has-extra-event`, `-prior-missing-event`, `-whole-shift-*`).
2. *Kill power must refuse a crash as a kill; the battery must require its laundered receipts.* Applied:
   `kill-power-r75.mjs` scores `killed` only on battery exit 1 with a parsable summary whose `failed` is
   non-empty, reads stdout on `close`, and reports `crashed`; `negatives-dragdrop-r75.mjs` exits 2 unless
   all three laundered degenerates are given. **Corrected after the wave (R75Revenger §3, mismatch
   1):** the first draft said "the tolerance-weakening cases F4/F5 are IME-counter cases and are
   carried with item 3". That is false: the r75 counter carries the same 0.05 ms pair tolerance and
   1e-4 grid tolerance, and both r74 F5 weakenings (`TOL 0.05 → 0.045`, grid `1e-4 → 0.02`) pass the
   r75 battery 254/254 (`.ufo/waves/round-75/w1/R75Revenger/` E2/E3); the F4 pattern (a relative
   `+= 0.03` that depends on an honest gap) is reproduced (E4/E5). F4/F5 are OPEN for this
   generation and routed to r76 (Mistakes row 5); the frozen `claims.json` item 2 omits them.
3. *R74Mut1's 19 acceptance witnesses as battery cases* — carried, not claimed: they are mutants of the
   IME counter, and this round builds no IME counter generation. Their class (a law with no case for one
   of its conjuncts) is what this round's own kill-power trial found in the new counter (Mistakes row 2).
4. *The counter output must record its prior set* — applied: every r75 counter output carries
   `priorSet` (path, sha256, schema); the gate self-test asserts it.
5. Carried from r73: the pinch cross-generation prior set and R73Mut1 survivors (pinch counter).

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0,
195 rows (`.ufo/waves/round-75/census/start.txt`).

Claim: C1 coverage — capability `chromium-drag-intercept-linux` (CDP `Input.setInterceptDrags`,
`Input.dispatchDragEvent` and the `Input.dragIntercepted` event on Chromium 155 headless), sourced:
S196–S200, new this round. One claim only.

## Gate

### Sources — new rows

All fetched by the L1 on 2026-11-07 between 01:36:31 and 01:36:38 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(base64 decoded; decoded copies, line counts and sha256 in `.ufo/waves/round-75/sources/FETCH.txt`).
Each row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-75 note and this
lesson. Before the append, `grep -c 'web_frame_widget_impl\|drag_controller.cc\|data_transfer.cc' corpus/SOURCES.md` was 0.

- **S196** `third_party/blink/public/devtools_protocol/domains/Input.pdl` (336 lines, sha256 `5bbc6e23…6e3d`,
  byte-identical to the S173/S187 staged copies; new scope). Located quote (line 265): "Prevents default
  drag and drop behavior and instead emits `Input.dragIntercepted` events."
- **S197** `content/browser/devtools/protocol/input_handler.cc` (2,343 lines, sha256 `72cf0d1d…24f4`,
  byte-identical to S188; new scope). Located quotes (line 1582): "// Only allow when
  Input.setInterceptDrags is disabled." and (line 1539, the dragCancel branch): "widget_host->DragSourceSystemDragEnded();"
- **S198** `third_party/blink/renderer/core/frame/web_frame_widget_impl.cc` (6,210 lines, sha256
  `5178b1e9…8c17`). Located quotes (lines 736–737): "// IPC RACE CONDITION: do not allow this drop.
  DragTargetDragLeave(point_in_viewport, screen_point);" and (line 1474): "current_drag_data_ = nullptr;"
- **S199** `third_party/blink/renderer/core/page/drag_controller.cc` (1,535 lines, sha256 `4f181d76…92fc`).
  Located quotes (line 853): "DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;"
  and (lines 291–292): "CreateDraggingDataTransfer( DataTransferAccessPolicy::kReadable, drag_data);"
- **S200** `third_party/blink/renderer/core/clipboard/data_transfer.cc` (706 lines, sha256 `e5a7f7a1…028c`).
  Located quote (lines 352–354): "String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();"
- No status, recheck or used-by cell of an existing row changed. S196 and S197 add W04 (same URL as
  S173/S187 and S174/S188 across scopes).

### Admitted

- `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md` (cites S196–S200): the event shapes of a
  CDP-intercepted drag on this build, sourced step by step (interception replaces the native session;
  a dispatched drop is dragover-then-drop and ends the source drag; a drop without acceptance becomes
  dragleave; dragCancel never tells the target and clears the drag data; data readable only in drop),
  measured identically on 13/13 pre-freeze runs (4 probes + 9 smokes).

### Rejected (with flip conditions)

- **"`dragCancel` delivers `dragleave` to the current target"** (the page-side expectation for a cancelled
  native drag) — reject for this producer: S197 1538–1546 calls only `DragSourceSystemDragEnded` and
  `DragSourceEndedAt(kNone)`, never `DragTargetDragLeave`; 0 events in the `ext-cancel` leg on 13/13
  runs. Flip: a tag whose handler calls `DragTargetDragLeave` for dragCancel, or a run that records one.
- **"`Input.dispatchDragEvent` accepts `dragLeave`"** — reject: the S196 enum (lines 81–85) lists
  dragEnter, dragOver, drop, dragCancel only; S197 1548–1549 fails any other type; measured `-32602
  Unexpected event type 'dragLeave'` 13/13. Flip: a tag whose PDL adds dragLeave.
- **"A drop on any element under the point fires `drop`"** — reject: S198 734–738 turns a drop into
  `dragleave` when the drag operation is `kNone` (no handler cancelled dragover); measured on `nz`
  (dragover then dragleave, no drop, `nz` text unchanged) 13/13. Flip: a run where `drop` reaches a
  non-accepting element.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a control's expected finding ids written from belief, not from the counter's code: `replay-forged-1e-12` expected `event-time-quantum` as well, but a 1e-12 move stays within the counter's 1e-4 grid tolerance | first controls pass `allOk: false`, the one failing control lists only `replay-event-timeline` (`.ufo/waves/round-75/lesson-proof/controls-first-pass-1e-12-expectation.json`) | QUALITY 131 (expected exit AND ids, evaluated mechanically) — it caught it before the freeze; shown able to fail by that first pass | expectation corrected to the counter's rule with the reason in the control's `why`; no counter change |
| a battery case whose mutation is snapped back to the honest value: `replay-timeline-sub-quantum` shifted the prior by 0.04 ms and then rounded every time to the 0.1 ms grid, so the "sub-quantum" prior was byte-for-byte the real timeline and the case could not tell a 0.05 ms tolerance from an exact match; three other laws had a conjunct no case exercised (drop/dragleave counts, dragend-after-drop order, the y coordinate) | pre-freeze kill-power trial on probe p4: `holds: false`, survivors `M-timeline-tol-exact`, `M-drop-counts-dropped`, `M-lifecycle-order-dropped`, `M-coordinate-y-dropped` (`.ufo/waves/round-75/lesson-proof/killpower-trial-p4-survivors.json`) | the kill-power control itself (semantic mutants at exact source strings) — it caught all four before the freeze | an alternating unrounded ±0.04 ms prior and three new cases (`drop-acceptance-extra-leave`, `source-lifecycle-end-before-drop`, `coordinate-law-y`); the four mutants re-run against the new battery are killed (`lesson-proof/survivor-recheck-after-cases.txt`: m0 = `M-timeline-tol-exact` fails the new sub-quantum case and both whole-shift cases; m1 = `M-drop-counts-dropped`, m2 = `M-lifecycle-order-dropped`, m3 = `M-coordinate-y-dropped` each fail exactly their new case — wording corrected after R75Scribe F6, which found the first draft's "each fails exactly its new case" false for m0) |
| a replay threshold chosen before the honest distribution was seen: the first gap threshold (0.5 of 8 gaps) sat two coincident gaps above the observed honest maximum (0.25 = 2 of 8; 4 of 156 ordered pairs at 2/8) | `.ufo/waves/round-75/lesson-proof/timeline-honest-pairs.json` `gapMatchHistogramEighths` {0: 120, 1: 32, 2: 4}, `firstChosenGapThreshold` 0.5 | QUALITY 139 (measure carried tolerances on all honest pre-freeze pairs) — applied before the freeze | gap threshold 0.75 (6 of 8), event-multiset threshold 0.5 unchanged; both recorded beside the measurement; kill-power mutant `M-timeline-gapfrac-off` |
| a completeness check copied literally from the previous round's rule (QUALITY 140's `git grep` of the schema string) that this round's own fix (routed defect 4: counter outputs record `priorSet` with each prior's schema) made over-match | at the freeze parent `d71951a7` the literal command lists 25 files, the 16 receipts plus `pf-smoke1..9.counter.json` (`.ufo/waves/round-75/lesson-proof/prior-set-enumeration-raw.txt`) | QUALITY 140 as written — it surfaced the mismatch (diff non-empty) before the freeze instead of passing silently, so it could fail and did | the enumeration keeps hits whose top-level `.schema` is the receipt schema (`prior-set-enumeration-toplevel.txt`, 16 = `prior-set.txt`); the claims' `priorSet` sentence states both lists; QUALITY 141 |
| a routed defect filed under the wrong carry: the lesson's first draft and the frozen `claims.json` item 2 treated r74's F4/F5 (tolerance weakenings, a relative case that depends on an honest gap) as IME-only, but this generation reuses the same tolerances and both weakenings survive its battery | R75Revenger E2/E3: battery vs `TOL 0.05 → 0.045` and grid `1e-4 → 0.02` exit 0 254/254 (`.ufo/waves/round-75/w1/R75Revenger/mutant-tol-0.045.battery.json`, `mutant-grid-0.02.battery.json`); calibration mismatches 2 (§3) | none in-round: no rule makes a routed defect's applicability be re-derived against the new counter's bytes (QUALITY 140/141 cover prior sets, not routed-defect scope) | the sentence is corrected in place with the evidence (routed-defect item 2 above); F4/F5 routed to r76 as battery cases bracketing both tolerances (refuse at 0.049 / accept at 0.051; refuse +0.005 grid) plus semantic mutants `0.05→0.045` and `1e-4→0.02`; the frozen claims sentence stays as frozen and its omission is recorded in SCORECARD `## Round 75` |

## Sources — opened after the freeze (frontier, not the claim's grounding)

- **S201** `third_party/blink/renderer/core/input/event_handler.cc` (2,706 lines, sha256 `92e8bb5b…c4c8`),
  located by R75Scout (`w1/R75Scout/report.md` §3) and re-opened by the L1 on 2026-11-07 03:37:08 -03:00
  (`sources/FETCH.txt`). Located quote (lines 1433–1434): "As per section 7.9.4 of the HTML 5 spec., we must
  always fire a drag event before firing a dragenter, dragleave, or dragover event." It sources the
  note's former measured-only limit (the one-shot `should_only_fire_drag_over_event_`, 1460/1469/1479).
- In-round corrections to rows opened this round (old → new, R75Scribe F2/F3): S196 anchor `53-91` →
  `53-94` (dispatchDragEvent through `modifiers`); S197 anchor `1578-1624` → `1578-1619` (1621–1624 is
  `DragEnded`). Note: S200 `CanReadData` cited `606-615` → `612-615` in the note (the row already names both
  predicates). Status/recheck/used-by cells unchanged.

## Attack findings (wave w1, 11 seats, 0 dead) — not amended; instruments stay as frozen

Legs re-measured by seats: (b) R75Exec1 cold run, counter exit 0 clean 146 with 17 priors; (c) re-run
independently: battery 254/254 on the scored receipt and on R75Exec1's, kill power holds 146/146 + 40/40,
0 crashed. R75Exec2: 3 more cold runs clean; 12 runs × 146 checks and × 254 cases, 0 red; honest-pair
replay margin over 17 honest receipts (272 ordered pairs): maxAbs 0, **maxGap 0.375 (3 of 8 gaps)** against
the 0.75 threshold, 0 refused. R75Review3: ordering, pins, nonce, prior set, before→after, QUALITY
130–139 PASS. R75Scout: S196–S200 re-fetched byte-identical (`cmp` 5/5).

Findings routed (none falsifies a leg as frozen; the frozen limit sentence is imprecise, see SCORECARD):

1. **R75Critic F1–F3 (limit sentence).** The frozen limit is directionally right (a relabel plus a
   re-time of about half the events passes (a)–(c): `w1/R75Critic/killpower-ramp17.json` holds) but
   imprecise: the smallest on-grid move is 0.1 ms, not 0.05; "half the event times" means 9 of 17 events
   (moving either `ts` or `at` of an event suffices); and the battery and kill power are receipt readers
   too, so legs (a)–(c) carry no execution assurance beyond the driver runs themselves.
2. **R75Review1 F1–F6 (counter false greens on fields it does not read).** The Chromium version and
   headless product are shape-checked only (a `Chromium 154` or headful host string passes); the
   `-32602` code is not checked (message only); the `|`-joined DataTransfer view can collapse distinct
   `types` arrays; `cdpResult` is unread; a caller that omits PRE gets `clean` (only `priorSet` shows it).
3. **R75Review2 §3–§5 (kill power).** Under `--first-failure` a kill is not attributed: a mutant whose
   counter refuses the honest receipt (or throws) is scored killed with `failedCases ["(positive)"]`
   (scored artifact: `M-drop-polarity`, a genuine semantic kill — the mutant refuses honest receipts — but
   recorded without case evidence); an injected flaky case can kill an inert mutant; a counter crash is a
   kill, never `crashed`; `holds` has no minimum-mutant guard.
4. **R75Mut1.** 47 further semantic mutants: 27 survivors with 26 acceptance witnesses + 1 false-positive
   witness, 7 argued equivalent; classes: single-value identity/host pins, shape-literal lengths, teardown
   fields, leg-mark monotonicity, producer surfaces, and the timeline thresholds never exercised at their
   boundary.
5. **R75Revenger.** r74 routed defect 2's F4/F5 open for this generation (Mistakes row 5); every other
   rejected root failure closed or not repeated; SHONEN 0 mismatches.
6. **R75Scribe.** Note/lesson wording: p1–p3 producer verdict REFUTED undisclosed, three line ranges, a
   quote across a comment marker, the `script-events` control's native marker — all corrected in place.
7. **R75Connector.** Overlap: none on drag ground across 20 sibling lanes; adjacent only (kake
   accessibility handoff, kotoba prompt inventory); no duplicate-URL risk beyond the lane's own W04s.

## Routed to r76

A counter generation for this surface that (i) pins `host.chromium`/`cdpProduct` to the freeze-time
values and requires `--headless=new` in argv; (ii) checks the CDP error code; (iii) compares DataTransfer
fields structurally; (iv) reads the prior set from the committed file and refuses a call whose priors
differ; (v) brackets both tolerances (r74 F4/F5) and the two replay thresholds at their boundaries;
(vi) kill power attributes each kill to a named case (no `(positive)`-only kills without a recorded
positive-refusal reason), classifies counter crashes, and asserts minimum mutant counts; (vii) folds
R75Mut1's 26 acceptance witnesses into the battery. Also carried: R74Mut1 witnesses (IME), the pinch
cross-generation prior set and R73Mut1 survivors. The honest gap margin (3 of 8 at 272 pairs vs a
threshold of 6) should be re-measured on every new receipt set.

## Census

Start: exit 0, 195 rows, 27 W04 (`.ufo/waves/round-75/census/start.txt`). End: exit 0, 201 rows
(S196–S200 before the freeze, S201 after), 29 W04 — S196 and S197 share URLs with S173/S187 and
S174/S188 across scopes (`.ufo/waves/round-75/census/end.txt`).
