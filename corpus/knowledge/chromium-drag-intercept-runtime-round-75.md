source: S196, S197, S198, S199, S200 (Chromium 155.0.8059.84 Input.pdl, input_handler.cc, web_frame_widget_impl.cc, drag_controller.cc, data_transfer.cc; opened 2026-11-07, round 75, before the freeze); S201 (event_handler.cc; opened 2026-11-07 after the freeze, frontier row, not the claim's grounding)
verified-at: 2026-11-07, lane round 75, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, loopback fixture with a draggable source, an accepting drop zone and a non-accepting zone, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-dragdrop-round75.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r75-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-dragdrop-r75.mjs --receipt $S/receipt.json --expect-driver-sha256 <freeze.txt driver digest> --expect-nonce tabi-r75-recheck-<hex> <--prior for every line of .ufo/waves/round-75/controls/c1/prior-set.txt> --json  (exit 0 clean, 146 checks)

# Input.setInterceptDrags and Input.dispatchDragEvent — what a page sees (round 75)

New ground for this lane: drag and drop through the DevTools drag-interception commands. The
lane drives mouse, wheel, touch, gesture, key and IME input over raw CDP (rounds 44–74), but no
capability row or note covered a drag: `grep -rlE 'dispatchDragEvent|setInterceptDrags'
corpus/knowledge` was empty at base `c19a520f`. A page-level drag is where automation most often
fakes success (script-dispatched `DragEvent`s with a script `DataTransfer` look the same to a
handler that only reads `types`), so the note records what the browser itself delivers.

## The commands (sourced)

- S196 `Input.pdl:265-268`: `setInterceptDrags` "Prevents default drag and drop behavior and
  instead emits `Input.dragIntercepted` events"; `:332-336` the event (the sentence spans comment
  lines 332-333) "Use this data with `Input.dispatchDragEvent` to restore normal drag and drop
  behavior". `:69-94` `DragData` = items + `dragOperationsMask` ("Copy = 1, Link = 2, Move = 16",
  line 74); `dispatchDragEvent` takes `type` ∈ {dragEnter, dragOver, drop, dragCancel}, x, y, data,
  modifiers (line 94). All experimental.
- S197 `input_handler.cc:1578-1619` (`StartDragging`): with interception off and CDP driving the
  mouse, CDP's own drag controller takes the drag; with it on, the browser emits
  `DragIntercepted` with the page's string items and the source's operations mask
  (`.SetDragOperationsMask(drag_operations_mask)`, line 1616).
- S197 `:1491-1546`: `dragEnter` → `DragTargetDragEnter`; `dragOver` → `DragTargetDragOver`;
  **`drop` → `DragTargetDragOver`, then `DragTargetDrop`, then `DragSourceSystemDragEnded` and
  `DragSourceEndedAt`** (1507-1537); **`dragCancel` → only `DragSourceSystemDragEnded` and
  `DragSourceEndedAt(kNone)`** — the target is never told (1538-1546). Any other type fails
  "Unexpected event type '<type>'" (1548-1549); the PDL enum has no dragLeave.

## What Blink does with them (sourced)

- S198 `web_frame_widget_impl.cc:709-751` (`DragTargetDrop`): with no current drag data it returns
  (718-720); if the last enter/over left the operation at `kNone` (no handler accepted), "IPC RACE
  CONDITION: do not allow this drop." → `DragTargetDragLeave` (734-738): **a drop on a target that
  did not cancel its dragover becomes a `dragleave`**. `:783-792` `DragSourceSystemDragEnded` calls
  `CancelDrag`, which clears `current_drag_data_` (1472-1475); `DragTargetDragEnterOrOver` returns
  early without it (1500-1508): **after a drag ends, a dragOver or drop reaches nothing until the
  next dragEnter**.
- S199 `drag_controller.cc:845-880` (`TryDHTMLDrag`, the dragenter/dragover dispatch) and
  `:254-272` (`DragExited`) build the event's DataTransfer with `kTypesReadable`; `:274-300`
  (`PerformDrop`) with `kReadable`. S200 `data_transfer.cc:352-354`: `getData` returns an empty
  String unless `CanReadData()` (612-615), which holds only for readable/writable. **Drop handlers
  read the data; dragenter, dragover and dragleave handlers see the types and an empty string.**

## Measured (nine pre-freeze runs and four probes, identical leg shapes 13/13)

Driver `scripts/chrome-cdp-dragdrop-round75.mjs`, receipts `.ufo/waves/round-75/controls/c1/`
(smoke1–9, probe p1–p4). Page records at window bubble phase, after the targets' own handlers.
Probes p1–p3 were run by an earlier build of the driver whose expected-shape table was still empty,
so they carry the producer verdict `REFUTED` by construction; their event tuples and leg shapes
are identical to p4's and the smokes' (the table was filled from them). p4 and smoke1–9 ran the
pinned driver (`d604552e…8105`). Post-freeze, the scored receipt, R75Exec1's and R75Exec2's three
cold runs repeat the same shape (18/18 receipts: 4 probes, 9 smokes, 5 post-freeze runs).

| Leg (CDP command) | Events (type@target, defaultPrevented) | DataTransfer view (types \| text/plain \| dropEffect \| effectAllowed) | State after |
|---|---|---|---|
| intercept-on (`setInterceptDrags {enabled:true}`) | none | — | — |
| press (`mousePressed` 150,120) | pointerdown@src, mousedown@src | — | — |
| move-start (`mouseMoved` 170,125, buttons 1) | dragstart@src (at the press point 150,120), pointercancel@src (0,0) | text/plain+text/x-tabi \| tabi-drag \| none \| copyMove | starts 1; ONE `Input.dragIntercepted` (items text/plain "tabi-drag", text/x-tabi "x1"; mask 17) |
| move-far (`mouseMoved` 450,150) | none (no native drag session) | — | — |
| enter-dz (`dragEnter`, intercepted data) | drag@src, dragenter@dz (prevented) | src: … \| "" \| none \| copyMove; dz: … \| "" \| copy \| copyMove | — |
| over-dz (`dragOver` 460,160) | dragover@dz (prevented) | … \| "" \| copy \| copyMove | — |
| drop-dz (`drop` 460,160) | drag@src, dragover@dz, drop@dz, dragend@src | drop: … \| **tabi-drag** (and x1) \| copy; dragend dropEffect copy | dz = "tabi-drag\|x1", drops 1 |
| release (`mouseReleased`) | pointerup@dz, mouseup@dz | — | — |
| ext-enter-nz (`dragEnter` 450,450, external mask 1) | dragenter@nz (not prevented) | text/plain \| "" \| copy \| copy | — |
| ext-drop-nz (`drop` 450,450) | dragover@nz, **dragleave@nz** (no drop) | dragleave dropEffect none | nz unchanged |
| ext-enter-dz (`dragEnter` 450,150) | dragenter@dz (prevented) | text/plain \| "" \| copy \| copy | — |
| ext-cancel (`dragCancel`) | **none** (no dragleave) | — | — |
| ext-drop-dz (`drop` 470,170) | **none** | — | drops still 1 |
| bad-type (`dragLeave`) | none; CDP error `-32602 Unexpected event type 'dragLeave'` | — | — |

Every recorded event is trusted. No event carries a `chromium/*` type; the native drag adds
`chromium/x-drag-id` (measured in all three control runs, `native-mouse`, `no-intercept` and
`script-events`, whose mouse legs start a native drag). The effectAllowed of every drag-target
event names the dispatched mask (17 → copyMove, 1 → copy).

Look-alikes the counter refuses (`.ufo/waves/round-75/controls/c1/degenerate-*`): a native mouse
drag at the same points (no interception; `chromium/x-drag-id`, a dragenter on the source during
the move), `dispatchDragEvent` without interception (same native marker, no intercepted event),
and script-dispatched `DragEvent`s (untrusted, outside the send-log allow-list).

## Limits

- Measured on one host, one Chromium build, headless, CSS px = device px. Files, links, HTML and
  `baseURL`/`title` items and modifiers are not exercised; `allow_file_access_` (S197 1444) is not.
- The `drag@src` asymmetry (before `dragenter` in enter-dz and before `dragover` in drop-dz, absent
  in over-dz) is sourced after the freeze, not by the claim: see below.
- The counter is a receipt reader, not an execution oracle (its header names the forgery it does
  not refuse).

## Sourced after the freeze (S201; frontier row, not the claim's grounding)

- S201 `event_handler.cc` `UpdateDragAndDrop`, located by R75Scout and re-opened by the L1: on a
  target change, "we must always fire a drag event before firing a dragenter, dragleave, or
  dragover event" (comment 1433-1434) → `drag` to the source then `dragenter` (1435-1442), and
  `should_only_fire_drag_over_event_ = true` (1460); on the same target, `drag` is sent only
  `if (!should_only_fire_drag_over_event_ && …drag_src_)` (1469-1475), then `dragover`, and the flag
  is cleared (1479). So the first dragOver after an enter has no `drag`; the next one (the
  dragover inside a dispatched drop) has it. External drags have no `drag_src_`, hence no `drag`.
