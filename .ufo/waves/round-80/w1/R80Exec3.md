# R80Exec3 — frontier probe: `showPicker()` answer paths + click-while-pending

Status: complete. Probe run exit 0, 3 legs, 0 failures (`probe.json` `.failures` = `[]`).
This is frontier evidence for r81 — **not** capability legs; it is not counted by
`check-showpicker-r80.mjs` (the receipt lives outside the walked trees by design).

## What ran

- Probe file: `.ufo/waves/round-80-seats/R80Exec3/probe-showpicker-frontier.mjs`
  (self-recorded digest, receipt field `.driverSha256` =
  `f7482c60edd737aa5853a28e9d32f84b6dd66efd439f2f45cc2520e65b9e0c27`).
- Raw per-leg JSON: `.ufo/waves/round-80-seats/R80Exec3/probe.json` — schema
  `tabi-chrome-cdp-showpicker-r80`, nonce `tabi-r80-exec3-frontier-1`, fixture
  `.fixture.sha256` `c11b6464dcc244ba332e6a109cd9108b95a90d59616536699c740af5c5264166`,
  child `.fixture.child.sha256` `b0e55e82d31ec03953a6165b39fd99a52a32c211d428c665890829ec680e0f8d`,
  Chromium `155.0.8059.84 Arch Linux` (`.host.cdpProduct` `Chrome/155.0.8059.84`, CDP 1.3,
  `.host.node` v24.21.0), ports 18940/18941/18942, one fresh browser per leg,
  `.startedAt` 2026-11-07T22:30:53.667Z, `.finishedAt` 2026-11-07T22:31:09.919Z.
- Diff vs the frozen `scripts/chrome-cdp-showpicker-round80.mjs` (full disclosure):
  1. the `LEGS` list (7 frozen legs → 3 probe legs; the frozen `ARM_EXPR` const became the two
     leg-list `armExpr` payloads `D_STATE_EXPR`/`K_STATE_EXPR`);
  2. one additive receipt-record line (`postClickElement/postPressId/postReleaseId/postClickError`);
  3. one additive `runLeg` branch (13 lines, `if (leg.postClick && chooserCount() > before)`)
     mirroring the frozen `priorClick` dispatch — the frozen plumbing has no post-trigger input
     hook, which leg 3 requires. No frozen line was altered or removed; all measurement and
     teardown plumbing is byte-identical.
  - The fixture template is extracted at runtime from a byte-identical seat-dir copy of
    `scripts/chrome-cdp-filechooser-round78.mjs` (the driver resolves the template relative to
    its own directory; the copy avoids editing the `FIXTURE_SOURCE` line).
- `armExpr` (an existing leg-list field, evaluated before the prior click) extends `__state()`
  so `webkitRelativePath` and `input.value` become observable; the patched fields flow into
  `stateAfter`/`stateAfterDismiss` without touching the fixture bytes.

## Q1 — `webkitdirectory` input answered with a directory

Leg `probe-directory-answer`: trusted `#pad` click (`legs[0].pageEvents[0..4]`, isTrusted true,
`act` true) → `showPicker()` on `#d` ok (`legs[0].showPicker` `{ok:true}`) → chooser
`selectSingle`, backendNodeId 6 (`legs[0].cdpEventLog[1].params`) → answered with
`DOM.setFileInputFiles` (`legs[0].answer.setParams.files` =
`["/fast/scratch/hyaku/tabi-r80/R80Exec3/run1/upload-16934cee503a"]`, `backendNodeId` 6,
`legs[0].answer.setError` null).

**Answer: the input's file list becomes the enumerated contents of the answered directory —
one FileList entry per file inside it (not a directory entry) — and `webkitRelativePath` DOES
appear**, with exactly the real-picker shape `<answeredDirName>/<fileName>`.

- `legs[0].stateAfter.d` = `[["tabi-r80-a.txt", 22, "text/plain"]]`
- `legs[0].stateAfter.dRel` = `[["tabi-r80-a.txt", "upload-16934cee503a/tabi-r80-a.txt", 22]]`
- `legs[0].stateAfter.dValue` = `"C:\\fakepath\\tabi-r80-a.txt"`
- Delivery verified: trusted `input` (`legs[0].pageEvents[5]`) + trusted `change`
  (`legs[0].pageEvents[6]`) on target `d` carrying the file list; the fixture's change handler
  read the exact bytes — `legs[0].pageEvents[7].ret` =
  `hex:746162692d7238302d616e737765722d616c7068610a` = `tabi-r80-answer-alpha\n`, 22 bytes =
  `legs[0].upload.size`, digest `legs[0].upload.sha256` `253919d7b691c3e82b3a797550d8c12cf97211af74ef8e044d52a47f30341aa4`.
  Directory traversal through the CDP answer delivers real file bytes.
- `legs[0].stateAfterDismiss.d` unchanged — the end-of-leg intercept cancel does not clear a
  set FileList.

## Q2 — `accept=".png"` input answered with a `.txt` file

Leg `probe-accept-txt-answer` (same flow on `#k`): `showPicker` ok, chooser `selectSingle`
backendNodeId 6 (`legs[1].cdpEventLog[1]`), answered with
`legs[1].answer.setParams.files` = `["…/upload-6e205850a346/tabi-r80-a.txt"]`, no error.

**Answer: the `.txt` file is ACCEPTED — the state carries it and trusted `input`+`change`
fire; there is no refusal anywhere.**

- `legs[1].stateAfter.k` = `[["tabi-r80-a.txt", 22, "text/plain"]]` — the FileList holds the
  `.txt` file with MIME `text/plain` despite `accept=".png"`.
- `legs[1].stateAfter.kValue` = `"C:\\fakepath\\tabi-r80-a.txt"`.
- Trusted `input` (`legs[1].pageEvents[5]`) + `change` (`legs[1].pageEvents[6]`) on target `k`,
  isTrusted true; the change handler read the exact bytes
  (`legs[1].pageEvents[7].ret` = the same 22-byte hex digest). No error event, no validity
  complaint, no file-list reset.
- Reading: `accept` constrains only the real file-picker UI; the `DOM.setFileInputFiles` answer
  path bypasses it entirely, and the browser still fires fully trusted `input`+`change` for the
  mismatched extension.

## Q3 — real click on `#s` while a `showPicker()`-opened chooser is pending

Leg `probe-click-while-pending`: `showPicker()` on `#s` via `Runtime.evaluate
{userGesture:true}` ok (`legs[2].showPicker`), chooser pending unanswered; then a real CDP
press+release at (160,120).

**Answer: YES to both — a second chooser event fires, and it is the click's own picker opening.**

- Chooser #1: `legs[2].cdpEventLog[1]`, mode `selectSingle`, backendNodeId 4, afterSendId 14
  (the trigger; `legs[2].postPressId` = 17).
- Click: `legs[2].postClickElement` = `"s"` (elementFromPoint check), press send 17, release
  send 18, `legs[2].postClickError` = null.
- Chooser #2: `legs[2].cdpEventLog[2]`, mode `selectSingle`, backendNodeId 4, afterSendId 18 —
  it arrived after the mouseReleased send, attributable to the click. No error, no suppression,
  no cancel of the first event: two simultaneous pending interceptions on the same input with
  the same backendNodeId. Consistent with the frozen twice-gesture law (no already-open guard),
  now extended to the real trusted-click path: the renderer's own file-input click path does
  not gate on a pending chooser either.
- The click delivered trusted `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click` on `#s`
  (`legs[2].pageEvents[0..4]`, isTrusted true, leg mark `post-click`).
- Activation detail: `legs[2].activationBefore` = `{isActive:false, hasBeenActive:false}` —
  `Runtime.evaluate {userGesture:true}` authorizes `showPicker()` without touching
  `navigator.userActivation`; after the real click `legs[2].activationAfter` =
  `{isActive:false, hasBeenActive:true}` — the click granted and consumed transient activation.
- Both choosers were dismissed by the end-of-leg cancel (`legs[2].dismissSendId` 22):
  `legs[2].stateAfterDismiss.s` = `[]`, and no `cancel` event was recorded on the input —
  interception-cancel produced no page-visible `cancel` event in this configuration.

## Frontier notes for r81 (not claims)

1. `DOM.setFileInputFiles` with a directory enumerates contents AND synthesizes
   `webkitRelativePath` (`<dir>/<file>`) — a CDP-answered directory upload is byte- and
   path-faithful to a real directory pick.
2. `accept` is UI-only: CDP answers ignore it and `input`/`change` remain trusted. Any future
   "accept-refusal" leg must go through a real picker, not the answer path.
3. Click-while-pending on the same input opens a second interception event (no renderer-side
   already-open guard on the real-click path either). `backendNodeId` is stable per input across
   both events, so multiple pending events for one input are distinguishable only by arrival
   order/`afterSendId` — an r81 answer path targeting "the second chooser" must rely on event
   ordering, not node identity.
4. CDP `userGesture` vs `userActivation`: `userGesture:true` opens pickers while
   `navigator.userActivation` stays untouched; real CDP clicks latch `hasBeenActive`. Any
   activation-consuming law must read `navigator.userActivation`, not the CDP flag.

## Runner facts

- Command: `node probe-showpicker-frontier.mjs --lane <ABS lane> --nonce
  tabi-r80-exec3-frontier-1 --scratch /fast/scratch/hyaku/tabi-r80/R80Exec3/run1 --out
  <seat>/probe.json --http-port 18940 --cdp-port 18941 --child-port 18942`; shell-reported
  exit 0; per-leg stderr lines all `errors=0`.
- Tooling: nothing installed or updated (operator tooling authorization unused).
- Scratch `/fast/scratch/hyaku/tabi-r80/R80Exec3/` deleted after the run; the only artifacts
  kept are in `.ufo/waves/round-80-seats/R80Exec3/` (probe, seat-dir fixture copy, probe.json).
