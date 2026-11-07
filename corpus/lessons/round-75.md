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
   all three laundered degenerates are given. The tolerance-weakening cases F4/F5 are IME-counter cases
   and are carried with item 3.
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
| a battery case whose mutation is snapped back to the honest value: `replay-timeline-sub-quantum` shifted the prior by 0.04 ms and then rounded every time to the 0.1 ms grid, so the "sub-quantum" prior was byte-for-byte the real timeline and the case could not tell a 0.05 ms tolerance from an exact match; three other laws had a conjunct no case exercised (drop/dragleave counts, dragend-after-drop order, the y coordinate) | pre-freeze kill-power trial on probe p4: `holds: false`, survivors `M-timeline-tol-exact`, `M-drop-counts-dropped`, `M-lifecycle-order-dropped`, `M-coordinate-y-dropped` (`.ufo/waves/round-75/lesson-proof/killpower-trial-p4-survivors.json`) | the kill-power control itself (semantic mutants at exact source strings) — it caught all four before the freeze | an alternating unrounded ±0.04 ms prior and three new cases (`drop-acceptance-extra-leave`, `source-lifecycle-end-before-drop`, `coordinate-law-y`); the four mutants re-run against the new battery are killed (`lesson-proof/survivor-recheck-after-cases.txt`: each fails exactly its new case) |
| a replay threshold chosen before the honest distribution was seen: the first gap threshold (0.5 of 8 gaps) sat two coincident gaps above the observed honest maximum (0.25 = 2 of 8; 4 of 156 ordered pairs at 2/8) | `.ufo/waves/round-75/lesson-proof/timeline-honest-pairs.json` `gapMatchHistogramEighths` {0: 120, 1: 32, 2: 4}, `firstChosenGapThreshold` 0.5 | QUALITY 139 (measure carried tolerances on all honest pre-freeze pairs) — applied before the freeze | gap threshold 0.75 (6 of 8), event-multiset threshold 0.5 unchanged; both recorded beside the measurement; kill-power mutant `M-timeline-gapfrac-off` |
