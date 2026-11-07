CONFIRMED

# R75Scout — independent re-fetch of S196-S200, and the open `drag@src` mechanism

Full report with every command, exit code and quote: `.ufo/waves/round-75/w1/R75Scout/report.md`.
Receipts: `.ufo/waves/round-75/w1/R75Scout/receipts/`. New sources staged:
`.ufo/waves/round-75/w1/R75Scout/sources/`.

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb`;
digests commit D = `57f28cf128e69dc40604f3201eab6a843c8e4142`. Read-only seat: nothing in the
predicate, counter, pins, priors, thresholds or kill rule was touched, no git mutation, no commit.

## 1. Independent re-fetch of S196-S200 — all five staged copies are byte-identical

Fetched this session, base64 `?format=TEXT`, decoded (`curl -sS --fail` rc=0 and `base64 -d` rc=0 for
all five), 2026-11-07T03:15:08-03:00 → 03:15:12-03:00
(`.ufo/waves/round-75/w1/R75Scout/receipts/fetch.log`):

| source | sha256 | lines | `cmp` vs L1-staged |
|---|---|---|---|
| `…/domains/Input.pdl` | `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` | 336 | identical (rc=0) |
| `content/browser/devtools/protocol/input_handler.cc` | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` | 2343 | identical (rc=0) |
| `…/core/frame/web_frame_widget_impl.cc` | `5178b1e9f03a664216446a5c74f14a773a9940dbf006fe5398fb829879998c17` | 6210 | identical (rc=0) |
| `…/core/page/drag_controller.cc` | `4f181d766de5ee44af67171127e42d62e7bdceebb71ff09b1b2cdc57992292fc` | 1535 | identical (rc=0) |
| `…/core/clipboard/data_transfer.cc` | `e5a7f7a19731a63548b67ef5df9231e6e0830d74612440854e2a4afd3f94028c` | 706 | identical (rc=0) |

`cmp` transcript: `receipts/cmp.log` (5/5 `cmp_rc=0`). All five sha256 and all five line counts equal
`.ufo/waves/round-75/sources/FETCH.txt` and the `S196`-`S200` rows in `corpus/SOURCES.md`.

Every line range cited by `S196`-`S200` and by the note was located and quoted in the full report
§2 — including the note's exact pins: `Input.pdl:265-268`, `:332-336`, `:74` (mask comment),
`input_handler.cc:1616` (`.SetDragOperationsMask`), `:1507-1537`, `:1538-1546`, `:1548-1549`,
`web_frame_widget_impl.cc:718-720`, `:734-738`, `:783-792`, `1472-1475`, `1500-1508`,
`drag_controller.cc:259`, `:291-292`, `:853`, `data_transfer.cc:352-354`, `:606-615`. Nothing cited
is missing, misnumbered or overstated. `Input.pdl:81-85` confirms the `type` enum has **no**
`dragLeave` member.

## 2. The open mechanism is now sourced

The note's Limits section marks this "measured, not sourced (event_handler.cc was not opened this
round)". Fetched at the same tag: `third_party/blink/renderer/core/input/event_handler.cc` (sha256
`92e8bb5b20a5b8d0b06a879c83d5762502caca2040529a392b54dbb09033c4c8`, 2706 lines) and
`third_party/blink/renderer/core/input/mouse_event_manager.cc` (sha256
`0f049c6f18bf2cb5ef96acf2dc292a8555bbd6a5b4ad86d1a03c14a3497bc34e`, 1303 lines).

**Where `drag` is dispatched.** Only `EventHandler::UpdateDragAndDrop`
(event_handler.cc:1382-1485) dispatches it, via `DispatchDragSrcEvent(event_type_names::kDrag, …)`:
line **1438** (target-changed branch, immediately before `kDragenter` at 1441-1443), line **1473**
(same-target branch, before `kDragover` at 1476-1478) and line **1493** (`CancelDragAndDrop`).
`PerformDragAndDrop` (1503-1517) dispatches **only** `kDrop` — it does **not** dispatch `drag`.
The helper `MouseEventManager::DispatchDragSrcEvent` (mouse_event_manager.cc:1096-1105) `CHECK`s
the type is `kDrag`/`kDragend`/`kDragstart` (1099-1101) and targets `GetDragState().drag_src_`
(1103) — the **source** element — carrying the source's own `drag_data_transfer_` (1104).

**Why the asymmetry.** A one-shot Blink flag `should_only_fire_drag_over_event_`
(event_handler.cc:279 init false; 1460 set true; 1469 read; 1479 cleared; 1524 reset) governs it:

- **enter-dz**: target changed (null → dz) → target-changed branch → `drag@src` (1438) then
  `dragenter@dz` (1441); flag set true (1460). Matches observed `["drag@src","dragenter@dz"]`.
- **over-dz**: same target → same-target branch; guard at 1469 is
  `!should_only_fire_drag_over_event_` and the flag is still true → **no `drag@src`**, only
  `dragover@dz` (1476); flag cleared (1479). Matches observed `["dragover@dz"]`.
- **drop-dz**: the browser's `drop` handler first calls `DragTargetDragOver`
  (input_handler.cc:1508) before `DragTargetDrop` (1524); that over re-enters the same-target
  branch with the flag now cleared → **`drag@src` (1473) then `dragover@dz` (1476)**, then
  `drop@dz`, then `dragend@src` (mouse_event_manager.cc:1184-1191). Matches observed
  `["drag@src","dragover@dz","drop@dz","dragend@src"]`.

So the `drag` event's firing is governed by a Blink flag, **not** by the CDP command type — which
also explains why the frozen external legs (`ext-enter-nz`, `ext-enter-dz`) show no `drag@src`: an
external drag has no page drag source, so the guard at 1435 (`GetDragState().drag_src_`) fails.

**Runtime corroboration** (two probe drivers written from scratch in my scratch dir; the frozen
driver, counter, battery and kill-power files were not modified):

| probe | leg | observed |
|---|---|---|
| 1 | 2nd `dragEnter`, same target | `dragover@dz` — **no `drag@src`, no `dragenter`** |
| 1 | 1st `dragOver` right after the enter | `drag@src, dragover@dz` |
| 1 | 2nd and 3rd `dragOver` | `drag@src, dragover@dz` (each) |
| 2 | `dragEnter` on a **different** target (dz→nz) | `drag@src, dragenter@nz, dragleave@dz` |
| 2 | `dragOver` after that enter | `dragover@nz` (no `drag@src` — flag re-armed) |
| 2 | `dragEnter` back on dz | `drag@src, dragenter@dz, dragleave@nz` |

This falsifies both rival explanations: "a `drag` always precedes a `dragover`" (false: the first
over of a newly entered target has none) and "a `drag` fires once per drag session" (false: it
fires on every later over and on the drop's implicit over).

Commands: frozen driver re-run unmodified, nonce `tabi-r75-scout-57f28cf128e6` → **exit 0**,
`dragHypothesis CONFIRMED`, `failures []` (`receipts/recon-driver-receipt.json`; a reproduction run
only — not a scored run and no scored nonce). Probe 1 → exit 1 and probe 2 → exit 1, in both cases
solely because the frozen `LEG_SHAPE` gate rejects the probes' non-frozen legs; `failures []` and
the recorded sequences are the evidence (`receipts/probe1-receipt.json`, `probe2-receipt.json`).

## 3. Two proposed new SOURCES rows (proposal in the report only — nothing written to `corpus/`)

`grep -c "event_handler.cc\|mouse_event_manager.cc" corpus/SOURCES.md` = 0, so both would be new.
Full 11-column rows are in the report §4: **S201** = Blink EventHandler source (the `drag` dispatch
sites and the `should_only_fire_drag_over_event_` gate, anchor lines 1382-1485 / 1433-1434 / 1435-1443
/ 1460 / 1462-1481 / 1487-1501 / 1503-1517) and **S202** = Blink MouseEventManager source (the
source-side dispatch helper and its type CHECK / target / DataTransfer, anchor lines 1027-1092 /
1096-1105 / 1107-1172 / 1184-1198). Both staged under this seat's `sources/`; copying them into
the lane's shared `.ufo/waves/round-75/sources/` (and extending `FETCH.txt`) is the L1's call.

## 4. Remaining unknowns

1. Whether the frozen receipt's `drag@src` DataTransfer view is the source's own post-`dragstart`
   transfer or the replayed one — inferred from mouse_event_manager.cc:1104 and 1080-1081 (the
   source transfer is downgraded to `kTypesReadable` right after `dragstart`, so `getData` is empty
   per data_transfer.cc:352-354 / 612-615); **inference, not separately measured.**
2. Whether the same rule holds on a different platform/build — the source is build-independent, but
   only this host's Chromium 155.0.8059.84 headless was run.
3. `event_handler.cc` and `mouse_event_manager.cc` are not in the lane's shared `sources/`; staging
   them there is the L1's call.

## 5. Housekeeping

No tool installed or upgraded (curl, base64, sha256sum, cmp, node, `/usr/bin/chromium`
155.0.8059.84 were already present) — nothing to record under the tooling directive. No git/jj
mutation, no commit, no push; the only git use was read-only (`git -C <lane> status --porcelain`,
exit 0), which shows this seat's writes confined to `.ufo/waves/round-75/w1/R75Scout/` and
`.ufo/waves/round-75/w1/R75Scout.md`. Scratch `/fast/scratch/hyaku/tabi-r75/R75Scout` deleted before
yield, receipts copied first.
