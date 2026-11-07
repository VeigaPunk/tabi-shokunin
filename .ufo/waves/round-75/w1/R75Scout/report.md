CONFIRMED

# R75Scout — independent re-fetch of S196-S200 and the open `drag@src` mechanism

Scope of this seat: (1) independently fetch, decode and `cmp` the five sources of S196-S200 against
the L1-staged copies; (2) locate and quote the lines those rows and the knowledge note cite;
(3) resolve the one item the note marks as measured-only — why `drag@src` fires before `dragenter`
(enter-dz) and before `dragover` (drop-dz) but not in over-dz; (4) propose at most two new SOURCES
rows. Nothing in the predicate, counter, pins, priors, thresholds or kill rule was touched.

All paths absolute. All work in `/fast/scratch/hyaku/tabi-r75/R75Scout` (deleted on yield) and in
`.ufo/waves/round-75/w1/R75Scout/` (this seat's own directory). No git mutation, no commit, no push.

---

## 1. Independent re-fetch of S196-S200 (session-fetched, base64 `?format=TEXT`, decoded)

Fetched independently this session from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
with `curl -sS --fail`, then `base64 -d`. Access window 2026-11-07T03:15:08-03:00 →
2026-11-07T03:15:14-03:00 (`/fast/scratch/hyaku/tabi-r75/R75Scout/fetch.log`, copied to
`.ufo/waves/round-75/w1/R75Scout/receipts/fetch.log`).

| source | fetch rc | sha256 (mine, decoded) | lines | `cmp` vs L1-staged |
|---|---|---|---|---|
| `third_party/blink/public/devtools_protocol/domains/Input.pdl` | 0 | `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` | 336 | identical (cmp rc=0) |
| `content/browser/devtools/protocol/input_handler.cc` | 0 | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` | 2343 | identical (cmp rc=0) |
| `third_party/blink/renderer/core/frame/web_frame_widget_impl.cc` | 0 | `5178b1e9f03a664216446a5c74f14a773a9940dbf006fe5398fb829879998c17` | 6210 | identical (cmp rc=0) |
| `third_party/blink/renderer/core/page/drag_controller.cc` | 0 | `4f181d766de5ee44af67171127e42d62e7bdceebb71ff09b1b2cdc57992292fc` | 1535 | identical (cmp rc=0) |
| `third_party/blink/renderer/core/clipboard/data_transfer.cc` | 0 | `e5a7f7a19731a63548b67ef5df9231e6e0830d74612440854e2a4afd3f94028c` | 706 | identical (cmp rc=0) |

`cmp` transcript: `.ufo/waves/round-75/w1/R75Scout/receipts/cmp.log` (5/5 `cmp_rc=0`, no diff bytes).
Each of the five sha256 values equals the value the L1 recorded in
`.ufo/waves/round-75/sources/FETCH.txt` and in the `SOURCES.md` rows — the staged copies are
byte-identical to the upstream tag, and the line counts match FETCH.txt exactly (336 / 2343 / 1535 /
706 / 6210).

Two further files were fetched this session at the same tag for the open mechanism:
`third_party/blink/renderer/core/input/event_handler.cc` (sha256
`92e8bb5b20a5b8d0b06a879c83d5762502caca2040529a392b54dbb09033c4c8`, 2706 lines) and
`third_party/blink/renderer/core/input/mouse_event_manager.cc` (sha256
`0f049c6f18bf2cb5ef96acf2dc292a8555bbd6a5b4ad86d1a03c14a3497bc34e`, 1303 lines). Both are staged in
`.ufo/waves/round-75/w1/R75Scout/sources/` (not in the lane's shared `sources/`, which is the L1's).

---

## 2. Cited lines located and quoted (each ≤25 words, with line numbers)

### S196 `Input.pdl` (`.ufo/waves/round-75/sources/Input.pdl`)
- `:265-268` — "Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events." / `experimental command setInterceptDrags` (line 267), `boolean enabled` (269).
- `:332-336` — "Emitted only when `Input.setInterceptDrags` is enabled. Use this data with `Input.dispatchDragEvent` to" (332-333); `experimental event dragIntercepted` (334), `DragData data` (336).
- `:69-91` — `experimental type DragData extends object` (69), `array of DragDataItem items` (71), `# Bit field representing allowed drag operations. Copy = 1, Link = 2, Move = 16` (74), `integer dragOperationsMask` (75).
- `:81-85` — the `type` enum: `dragEnter` / `dragOver` / `drop` / `dragCancel` — **no `dragLeave` member**, confirming the note's "the PDL enum has no dragLeave".

### S197 `input_handler.cc` (`.ufo/waves/round-75/sources/input_handler.cc`)
- `:1491` — `if (event_type == Input::DispatchDragEvent::TypeEnum::DragEnter) {` → `widget_host->DragTargetDragEnter(` (1492).
- `:1499-1500` — `} else if (event_type == ...::DragOver) {` → `widget_host->DragTargetDragOver(`.
- `:1507-1537` — `drop`: `widget_host->DragTargetDragOver(` (1508) → `widget_host->DragTargetDrop(*drop_data, point, point,` (1524) → `widget_host->DragSourceSystemDragEnded();` (1526) → `widget_host->DragSourceEndedAt(` (1527).
- `:1538-1546` — `dragCancel`: `widget_host->DragSourceSystemDragEnded();` (1539) and `widget_host->DragSourceEndedAt(point, point, ui::mojom::DragOperation::kNone,` (1540-1541) — **no `DragTargetDragLeave`**, so the target is never told.
- `:1548-1549` — `callback->sendFailure(Response::InvalidParams(base::StringPrintf("Unexpected event type '%s'", event_type.c_str())));`
- `:1578-1591` (`StartDragging`) — "Only allow when Input.setInterceptDrags is disabled." (1582); `if (drag_controller_.initial_state_) { drag_controller_.StartDragging(...); *intercepted = true; }` (1586-1589).
- `:1615-1618` — `frontend_->DragIntercepted(protocol::Input::DragData::Create().SetDragOperationsMask(drag_operations_mask).SetItems(std::move(items)).Build());` — the mask line is **1616**, as the note cites.
- `:1444` — `if (HasFileRelatedItem(data.get()) && !allow_file_access_) {` (the note's "not exercised" limit).

### S198 `web_frame_widget_impl.cc` (`.ufo/waves/round-75/sources/web_frame_widget_impl.cc`)
- `:651-672` (`DragTargetDragEnter`) — `current_drag_data_ = DataObject::Create(` (663-664); `DragTargetDragEnterOrOver(point_in_viewport, screen_point, kDragEnter, key_modifiers);` (667-668).
- `:689-707` (`DragTargetDragLeave`) — `GetPage()->GetDragController().DragExited(&drag_data, *local_root_->GetFrame());` (703-704).
- `:709-751` (`DragTargetDrop`) — `if (ShouldIgnoreInputEvents() || !current_drag_data_) { return; }` (718-720); `if (drag_operation_.operation == DragOperation::kNone) {` (735) with the comment `// IPC RACE CONDITION: do not allow this drop.` (736) and `DragTargetDragLeave(point_in_viewport, screen_point);` (737) — a drop on a target that never accepted becomes a `dragleave`.
- `:783-792` (`DragSourceSystemDragEnded`) — `CancelDrag();` (784).
- `:1472-1475` (`CancelDrag`) — `drag_operation_ = DragController::Operation(); current_drag_data_ = nullptr;` (1473-1474).
- `:1500-1508` (`DragTargetDragEnterOrOver`) — `if (ShouldIgnoreInputEvents() || !current_drag_data_) { CancelDrag(); return; }` (1505-1508): after a drag ends, a dragOver or drop reaches nothing.

### S199 `drag_controller.cc` (`.ufo/waves/round-75/sources/drag_controller.cc`)
- `:254-272` (`DragExited`) — `DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;` (259); `local_root.GetEventHandler().CancelDragAndDrop(CreateMouseEvent(drag_data), data_transfer);` (262-263); `SetAccessPolicy(DataTransferAccessPolicy::kNumb);` (264-265).
- `:274-300` (`PerformDrop`) — `DataTransfer* data_transfer = CreateDraggingDataTransfer(DataTransferAccessPolicy::kReadable, drag_data);` (291-292); `event_handler.PerformDragAndDrop(CreateMouseEvent(drag_data), data_transfer)` (296-297).
- `:845-880` (`TryDHTMLDrag`) — `DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;` (853); `if (local_root.GetEventHandler().UpdateDragAndDrop(event, data_transfer) == WebInputEventResult::kNotHandled)` (859-860).

### S200 `data_transfer.cc` (`.ufo/waves/round-75/sources/data_transfer.cc`)
- `:352-354` — `String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();` — an empty string unless readable.
- `:606-615` — `CanReadTypes()` = readable | types-readable | writable (607-609); `CanReadData()` = readable | writable only (612-614). So under the types-readable policy the types stay visible and `getData` returns empty.

Every line range the note cites (`Input.pdl:265-268`, `:332-336`, `:69-91`/74; `input_handler.cc:1578-1624`
incl. 1616, `:1491-1546` incl. 1507-1537 / 1538-1546 / 1548-1549; `web_frame_widget_impl.cc:709-751`
incl. 718-720 / 734-738, `:783-792`, 1472-1475, 1500-1508; `drag_controller.cc:845-880` incl. 853,
`:254-272` incl. 259, `:274-300` incl. 291-292; `data_transfer.cc:352-354`, `:606-615`) exists and says
what the note says it says. No cited line is missing, misnumbered or overstated.

---

## 3. The open mechanism: why `drag@src` fires before `dragenter` and before `dragover`, but not in over-dz

The note's Limits section says this is "measured, not sourced (event_handler.cc was not opened this
round)". It is now sourced, in `event_handler.cc` at the same tag.

### 3.1 Where the `drag` event is dispatched

`drag` is dispatched **only** from `EventHandler::UpdateDragAndDrop` (event_handler.cc:1382-1485), via
`mouse_event_manager_->DispatchDragSrcEvent(event_type_names::kDrag, event)` — three sites:

- **event_handler.cc:1435-1440** (target-changed branch):
  ```
  1435      if (mouse_event_manager_->GetDragState().drag_src_) {
  1438        mouse_event_manager_->DispatchDragSrcEvent(event_type_names::kDrag, event);
  1441      event_result = mouse_event_manager_->DispatchDragEvent(
  1442          event_type_names::kDragenter, new_target, drag_target_, event, data_transfer);
  ```
  The comment above it names the rule: "As per section 7.9.4 of the HTML 5 spec., we must always fire a drag event before firing a dragenter, dragleave, or dragover event." (1433-1434).
- **event_handler.cc:1469-1475** (same-target branch):
  ```
  1469      if (!should_only_fire_drag_over_event_ &&
  1470          mouse_event_manager_->GetDragState().drag_src_) {
  1473        mouse_event_manager_->DispatchDragSrcEvent(event_type_names::kDrag, event);
  1475      }
  1476      event_result = mouse_event_manager_->DispatchDragEvent(
  1477          event_type_names::kDragover, new_target, nullptr, event, data_transfer);
  1479      should_only_fire_drag_over_event_ = false;
  ```
- **event_handler.cc:1492-1495** (`CancelDragAndDrop`) — a third site, on the drag-leaving path.

`PerformDragAndDrop` (event_handler.cc:1503-1517) dispatches **only** `kDrop` (1511-1513) — it does
**not** dispatch `drag`. `MouseEventManager::DispatchDragSrcEvent` (mouse_event_manager.cc:1096-1105)
is the source-side helper: it `CHECK`s the type is `kDrag`/`kDragend`/`kDragstart` (1099-1101) and
dispatches to `GetDragState().drag_src_.Get()` (1103) — i.e. to the **source element**, with the
source's own `drag_data_transfer_` (1104). `DispatchDragEvent` (mouse_event_manager.cc:1107-1172)
builds the `DragEvent` (1157) and dispatches it (1163).

### 3.2 The gate that produces the observed asymmetry

The three legs differ only in whether the *drag target changed* and in the one-shot flag
`should_only_fire_drag_over_event_` (event_handler.cc:279 init `false`; 335 reset in `Clear()`;
1460 set `true`; 1469 read; 1479 cleared; 1524 reset in `ClearDragState`).

- **enter-dz** (first `dragEnter` at dz): `drag_target_` was null, `new_target` = dz → the
  *target-changed* branch runs → `drag@src` (1438) then `dragenter@dz` (1441-1443); the flag is set
  `true` at 1460. **Matches the observed `["drag@src","dragenter@dz"]`.**
- **over-dz** (next `dragOver`, still over dz): `drag_target_ == new_target` → the *same-target*
  branch runs; the guard at 1469 is `!should_only_fire_drag_over_event_`, and the flag is still
  `true` from the enter → **no `drag@src`**, only `dragover@dz` (1476). The flag is then cleared
  at 1479. **Matches the observed `["dragover@dz"]`.**
- **drop-dz** (the `drop`): the browser handler for `drop` first calls `DragTargetDragOver`
  (input_handler.cc:1508) before `DragTargetDrop` (1524). That dragOver re-enters the same-target
  branch, but the flag was cleared at 1479 during over-dz → the guard at 1469 now passes →
  **`drag@src` (1473) then `dragover@dz` (1476)**, then `drop@dz`, then `dragend@src` (from
  `DragSourceEndedAt` → `MouseEventManager::DragSourceEndedAt`, mouse_event_manager.cc:1184-1191).
  **Matches the observed `["drag@src","dragover@dz","drop@dz","dragend@src"]`.**

So the asymmetry is **not** a property of the CDP command type; it is a one-shot Blink flag
(`should_only_fire_drag_over_event_`) that suppresses the source-side `drag` on the *first*
drag-over of a newly entered target and re-enables it afterwards. The `drag` event is a
source-side event about the drag session; the page sees it on the source element because
`DispatchDragSrcEvent` targets `GetDragState().drag_src_`.

### 3.3 Runtime corroboration (independent of the frozen receipt)

Two probe drivers were written **from scratch in my scratch dir** (copies of the frozen driver with
only the `LEGS` array and the shape gate changed; the frozen driver, counter, battery and kill-power
files were not modified). They use the same fixture, the same CDP commands and the same capture.
Receipts: `.ufo/waves/round-75/w1/R75Scout/receipts/probe1-receipt.json`,
`probe2-receipt.json`.

Probe 1 — repeat the over without changing the target (nonce `tabi-r75-scoutprobe-57f28cf128e6`):

| leg | observed sequence |
|---|---|
| press | `pointerdown@src, mousedown@src` |
| move-start | `dragstart@src, pointercancel@src` |
| P-enter-dz | `drag@src, dragenter@dz` |
| **P-enter-dz-again** (2nd dragEnter, same target) | **`dragover@dz`** — no `drag@src`, no `dragenter@dz` |
| **P-over1** (dragOver, same target, right after the enter) | **`drag@src, dragover@dz`** |
| P-over2 | `drag@src, dragover@dz` |
| P-over3 | `drag@src, dragover@dz` |
| P-drop | `drag@src, dragover@dz, drop@dz, dragend@src` |

This is decisive against the two obvious rival explanations. (a) "a `drag` always precedes a
`dragover`" is **false**: on the first over of a newly entered target there is no `drag@src`, and on
a repeated `dragEnter` there is no `dragenter` at all (the second `dragEnter` produces a plain
`dragover`, because `drag_target_ == new_target` so the same-target branch runs and the flag is
still set). (b) "the `drag` fires once per drag session" is **false**: it fires again on every
subsequent over and on the drop's implicit over.

Probe 2 — change the target mid-drag (nonce `tabi-r75-scoutprobe2-57f28cf128e6`):

| leg | observed sequence |
|---|---|
| Q-enter-dz | `drag@src, dragenter@dz` |
| **Q-enter-nz-targetchange** | **`drag@src, dragenter@nz, dragleave@dz`** |
| Q-over-nz | `dragover@nz` (no `drag@src` — the flag was set by the enter) |
| **Q-enter-dz-again-targetchange** | **`drag@src, dragenter@dz, dragleave@nz`** |

A target change re-arms the flag (1460) and fires `drag@src` again (1438) — exactly as the source
says, and exactly as the frozen `ext-enter-nz` / `ext-enter-dz` legs show (those are external drags
with no page drag source, so `drag_src_` is null and no `drag@src` fires at all — the guard at 1435).

For reference I also re-ran the **frozen** driver unmodified (nonce
`tabi-r75-scout-57f28cf128e6`): exit 0, `dragHypothesis CONFIRMED`, `failures []`; receipt
`.ufo/waves/round-75/w1/R75Scout/receipts/recon-driver-receipt.json`. This is a **reproduction run
only** — it is not a scored run and carries no scored nonce; the scored receipts are the L1's and
R75Exec1's.

### 3.4 What this does and does not settle

Settles: the note's "measured, not sourced" item is now sourced. The `drag` event's firing rule at
this tag is stated by event_handler.cc:1435-1479 and reproduced at runtime by probes 1 and 2.

Does not settle (out of this seat's scope, and no claim is made about them): whether the frozen
receipt's `drag@src` DataTransfer view is the *source's* transfer or the *replayed* one — the note
records `drag@src` with `dropEffect none` and `effectAllowed copyMove` and the same `types` as the
drop (`text/plain+text/x-tabi`), and the source says the source-side `drag` carries
`GetDragState().drag_data_transfer_` (mouse_event_manager.cc:1104), i.e. the source's own transfer
from `dragstart` (which the note's `move-start` leg shows as `tabi-drag`/`x1`). The `drag@src` view
in the frozen receipt shows empty `text/plain` because `TryStartDrag` downgrades the source transfer
to `kTypesReadable` right after `dragstart` (mouse_event_manager.cc:1080-1081) — under that policy
`getData` returns the empty string (data_transfer.cc:352-354, 612-615). **This is an inference from
the source; I did not run a dedicated probe that separates the source transfer from the replayed one,
so it is marked as such and is not asserted as measured.**

---

## 4. Proposed new SOURCES rows (at most two, lane's 11-column shape; **proposal only, not written**)

Neither file is currently in `corpus/SOURCES.md` (`grep -c "event_handler.cc\|mouse_event_manager.cc"
corpus/SOURCES.md` = 0), so both would be new rows. Column shape is
`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`.

**S201 (proposed)**

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S201 | Chromium 155.0.8059.84 Blink EventHandler source (drag source event) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/input/event_handler.cc?format=TEXT | code | A | where the source-side `drag` event is dispatched and the one-shot flag that gates it: only `EventHandler::UpdateDragAndDrop` dispatches `drag`, and only under the target-changed / `should_only_fire_drag_over_event_` conditions; not the dragenter/dragover/drop dispatch itself | decoded lines 1382-1485 (UpdateDragAndDrop), 1433-1434 (the HTML5 7.9.4 comment), 1435-1443 (target-changed branch: `drag` then `dragenter`), 1460 (flag set true), 1462-1481 (same-target branch: `drag` only when the flag is clear, then `dragover`), 1487-1501 (CancelDragAndDrop: `drag` then `dragleave`), 1503-1517 (PerformDragAndDrop dispatches only `drop`); .ufo/waves/round-75/w1/R75Scout/sources/event_handler.cc sha256 92e8bb5b20a5b8d0b06a879c83d5762502caca2040529a392b54dbb09033c4c8; fetched 2026-11-07 | the `drag` event is a source-side event whose firing is governed by a one-shot Blink flag, not by the CDP command type; a repeated dragEnter over the same target yields a dragover, not a dragenter | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-drag-intercept-runtime-round-75.md, corpus/lessons/round-75.md |

**S202 (proposed)**

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S202 | Chromium 155.0.8059.84 Blink MouseEventManager source (drag source event dispatch) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/input/mouse_event_manager.cc?format=TEXT | code | A | how the source-side `drag` event is built and where it is delivered: the dispatch helper, its type CHECK, its target and its DataTransfer, and the post-dragstart access-policy downgrade; not the dragenter/dragover/drop dispatch itself | decoded lines 1027-1092 (TryStartDrag: `dragstart`, then the source transfer is downgraded to kTypesReadable at 1080-1081), 1096-1105 (DispatchDragSrcEvent: CHECK kDrag/kDragend/kDragstart, target = drag_src_, DataTransfer = the source's own drag_data_transfer_), 1107-1172 (DispatchDragEvent: DragEvent::Create at 1157, dispatch at 1163), 1184-1198 (DragSourceEndedAt: `dragend` then clear); .ufo/waves/round-75/w1/R75Scout/sources/mouse_event_manager.cc sha256 0f049c6f18bf2cb5ef96acf2dc292a8555bbd6a5b4ad86d1a03c14a3497bc34e; fetched 2026-11-07 | the source-side `drag` event is delivered to the drag source element with the source's own DataTransfer, whose policy is types-readable after `dragstart`, so its getData is empty | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-drag-intercept-runtime-round-75.md, corpus/lessons/round-75.md |

Note for the L1 (integration owner): both rows are *proposals in this report only* — I did not write
to `corpus/SOURCES.md`, `corpus/knowledge/`, or the shared `.ufo/waves/round-75/sources/`. The two
new source files are staged under **this seat's** directory
`.ufo/waves/round-75/w1/R75Scout/sources/`; if the L1 wants them in the lane's shared `sources/`,
they must be copied there and `FETCH.txt` extended, and the two SOURCES rows' `anchor` cells
adjusted to the shared path.

---

## 5. Commands and exit codes (everything claimed above)

| # | command | exit | result |
|---|---|---|---|
| 1 | `curl -sS --fail <tag-url>?format=TEXT` ×7 (5 staged + event_handler.cc + mouse_event_manager.cc) | 0 (all 7) | `.ufo/waves/round-75/w1/R75Scout/receipts/fetch.log` |
| 2 | `base64 -d` ×7 | 0 (all 7) | same log |
| 3 | `cmp <mine> <L1-staged>` ×5 | 0 (all 5) | `.ufo/waves/round-75/w1/R75Scout/receipts/cmp.log` — 5/5 byte-identical |
| 4 | `sha256sum` ×7, `wc -l` ×7 | 0 | §1 table; matches `.ufo/waves/round-75/sources/FETCH.txt` for the five |
| 5 | `grep -n "event_handler.cc\|mouse_event_manager.cc" corpus/SOURCES.md` | 1 (no match) | count 0 → both would be new rows |
| 6 | `node scripts/chrome-cdp-dragdrop-round75.mjs --scratch … --out … --nonce tabi-r75-scout-57f28cf128e6 --http-port 41753 --cdp-port 41754` (frozen driver, unmodified) | **0** | `dragHypothesis CONFIRMED`, `failures []` — receipt `receipts/recon-driver-receipt.json` |
| 7 | `node <probe1 driver> --scratch … --nonce tabi-r75-scoutprobe-57f28cf128e6 --http-port 41763 --cdp-port 41764` | 1 | exit 1 only because the frozen `LEG_SHAPE` gate rejects the probe's non-frozen legs; `failures []` and the recorded event sequences are the point — `receipts/probe1-receipt.json` |
| 8 | `node <probe2 driver> --scratch … --nonce tabi-r75-scoutprobe2-57f28cf128e6 --http-port 41773 --cdp-port 41774` | 1 | same: shape-gate exit, `failures []` — `receipts/probe2-receipt.json` |

Probe-driver construction (both): `cp` of the frozen driver into my scratch, then a Python edit that
replaces the `LEGS` array and short-circuits `shapeOk` to `true`; the fixture, CDP plumbing, capture
code and teardown are the frozen ones. The frozen driver, counter, battery, kill-power and the
shared `sources/` were **not** modified (verified by `git -C <lane> status --porcelain` — see §6).

## 6. Housekeeping

- No tool was installed or upgraded this session: `curl`, `base64`, `sha256sum`, `cmp`, `node` and
  `/usr/bin/chromium` (155.0.8059.84) were already present. Nothing to record under the tooling
  directive.
- No git or jj mutation, no commit, no push anywhere. The only git use was read-only
  (`git -C <lane> status --porcelain` / `rev-parse`) to confirm the working tree carries only the
  L1's and the other seats' files, none of them mine.
- Scratch `/fast/scratch/hyaku/tabi-r75/R75Scout` is deleted before this yield; every receipt it
  held is copied first into `.ufo/waves/round-75/w1/R75Scout/receipts/`.
- Files written by this seat, all inside its own directory:
  `.ufo/waves/round-75/w1/R75Scout/report.md`, `.ufo/waves/round-75/w1/R75Scout/sources/{event_handler.cc,mouse_event_manager.cc}`,
  `.ufo/waves/round-75/w1/R75Scout/receipts/{fetch.log,cmp.log,probe1-receipt.json,probe2-receipt.json,recon-driver-receipt.json}`.
  Nothing outside that directory was written.

## 7. Remaining unknowns

1. Whether the `drag@src` DataTransfer view in the frozen receipt is byte-for-byte the source's
   post-`dragstart` transfer or the replayed one — inferred from mouse_event_manager.cc:1104 and
   1080-1081, not separately measured (marked as inference in §3.4).
2. Whether the same `drag`-gating rule holds on a non-headless / different-platform build — the
   source is build-independent, but only this host's Chromium 155.0.8059.84 headless was run.
3. `event_handler.cc` and `mouse_event_manager.cc` are not in the lane's shared
   `.ufo/waves/round-75/sources/`; staging them there is the L1's call (noted in §4).
