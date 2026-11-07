# note-review — `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md` (r75)

Reviewer: R75Scribe (leaf seat, read-only). Verdict: **AGREE on every measured statement**;
**five wording/line-range fixes proposed** (`F1`–`F5`) and one provenance disclosure (`F1`).
No statement in the note is falsified by the receipts or the staged sources.

## Method (all commands re-run here; outputs beside this file)

| # | command | exit | output |
|---|---|---|---|
| 1 | `python3 .ufo/waves/round-75/w1/R75Scribe/derive.py` | 0 | `derive.txt` — per-leg events, `defaultPrevented`, DataTransfer view, coordinates, `stateAfter` over 9 smokes + 4 probes + the (a) receipt; law checks; `dragIntercepted` payload; per-leg CDP error; degenerate markers; nonce/driver/verdict binding |
| 2 | `python3 .ufo/waves/round-75/w1/R75Scribe/table_check.py` | 0 | `table_check.txt` — every note table row encoded and compared on all 14 receipts: `receipts=14 rows_per_receipt=14 failures=0` |
| 3 | `python3 .ufo/waves/round-75/w1/R75Scribe/quote_check.py` | 0 | `quote_check.txt` — every note/lesson quote located at the stated lines, word counts, file line counts and sha256 prefixes |
| 4 | `git grep -lE 'dispatchDragEvent\|setInterceptDrags' c19a520f -- corpus/knowledge` | **1** | no output (empty) |
| 5 | `git show c19a520f:SCORECARD.md \| grep -c '^\| \`chromium-drag-intercept-linux\` \|'` | **1** | `0` |
| 6 | `sha256sum corpus/evidence/round75/chromium-drag-intercept/receipt.json` | 0 | `6ecc2560da70eb9285378d459a563c5617b07ce7ca813b7c328cd4aa572f1761` |

Independent derivation, not the counter: the receipts were read directly
(`events`, `legs[].stateAfter`, `legs[].cdpError`, `legs[].sentData`, `cdpEventLog`,
`cdpSendLog`); the counter's `SHAPE` table was consulted only afterwards, to check that the
note and the counter agree (they do: `quote_check.py`, `table_check.py`).

Derived facts used below:

- 17 events per receipt, **identical event tuples across all 14 receipts** (excluding `ts`/`at`
  and the per-run nonce/port fields), identical `legShape` across all 14.
- 15 legs (the note's table omits `start`, the no-command baseline; 14 rows).
- Every event `isTrusted: true`; no `chromium/*` type; `effectAllowed` = mask name
  (17→`copyMove`, 1→`copy`); text data readable only in `dragstart`/`drop`; every
  `INTERCEPTED` leg replayed the single `Input.dragIntercepted` payload byte-for-byte
  (`derive.txt`, `law failures: 0`; `INTERCEPTED-leg replay mismatches 0`).
- `bad-type` leg: `{"code":-32602,"message":"Unexpected event type 'dragLeave'"}` on 14/14.

## Statement-by-statement

### Header / front matter

- `verified-at … /usr/bin/chromium 155.0.8059.84 … --headless=new … viewport 1280x900,
  deviceScaleFactor 1, mobile false` — **AGREE**. Every receipt: `host.chromium =
  "Chromium 155.0.8059.84 Arch Linux"`, `host.cdpProduct = "Chrome/155.0.8059.84"`, argv has
  `--headless=new --force-device-scale-factor=1 --window-size=1280,900`; the (a) receipt's
  `cdpSendLog` `Emulation.setDeviceMetricsOverride` = `{"width":1280,"height":900,
  "deviceScaleFactor":1,"mobile":false}` (`derive.txt` §binding; direct read above).
- `recheck:` line — **AGREE** as far as it goes: the driver usage is
  `--scratch/--out/--nonce/--http-port/--cdp-port` and the counter requires
  `--expect-driver-sha256`, `--expect-nonce`, ≥1 `--prior` (counter header 3–4; usage
  refusals at 115, 117, 119).
  `prior-set.txt` holds 16 paths (19 lines incl. 3 comments), matching the 16 `--prior` lines.

### §"Input.setInterceptDrags and Input.dispatchDragEvent — what a page sees"

- "`grep -rlE 'dispatchDragEvent|setInterceptDrags' corpus/knowledge` was empty at base
  `c19a520f`" — **AGREE**: command 4, exit 1, empty. The capability table has no
  `chromium-drag-intercept-linux` row at base: command 5, `0` (and
  `controls-summary.json` `capabilityRowCount: 0`, `notesCitingDragCommands: 0`).
- "script-dispatched `DragEvent`s with a script `DataTransfer` look the same to a handler that
  only reads `types`" — **AGREE** as a motivation, and the `script-events` degenerate measures
  the discrimination (`isTrusted: false` on every script-dispatched event of `enter-dz`,
  `over-dz`, `drop-dz`; `derive.txt` degenerate block).

### §"The commands (sourced)"

- **S196 `Input.pdl:265-268`** `setInterceptDrags` quote — **AGREE**: the sentence is at line
  265, the command at 267; 11 words. `:332-336` — **AGREE with a quote nit (`F4`)**: the quoted
  sentence spans 332–333 and line 333 begins `# `, which the note's quote elides.
  `:69-91`, `DragData = items + dragOperationsMask` — **AGREE** (DragData at 69, `items` 71);
  `"Copy = 1, Link = 2, Move = 16"` at line 74 exactly.
  `dispatchDragEvent takes type ∈ {dragEnter, dragOver, drop, dragCancel}, x, y, data,
  modifiers` — **AGREE on content, line range imprecise (`F2a`)**: the command is at 78, the
  enum at 81–85, `data` at 91, and `modifiers` at 94 — outside the cited `:69-91`.
- **S197 `input_handler.cc:1578-1624` (`StartDragging`)** — **AGREE with a range fix (`F2b`)**:
  `StartDragging` is 1578–1619; 1621–1624 is the separate `DragEnded`. `drag_controller_`
  take-over branch at 1583–1591; `DragIntercepted` built at 1598–1618; `.SetDragOperationsMask
  (drag_operations_mask)` at **1616** exactly (quote check PASS). The note's claim that string
  items only are forwarded is at 1601–1602.
- **S197 `:1491-1546`** — **AGREE, exactly**: `dragEnter`→`DragTargetDragEnter` 1491–1498;
  `dragOver`→`DragTargetDragOver` 1499–1506; `drop`→`DragTargetDragOver`, `DragTargetDrop`,
  `DragSourceSystemDragEnded`, `DragSourceEndedAt` 1507–1537; `dragCancel`→only
  `DragSourceSystemDragEnded` + `DragSourceEndedAt(kNone)` 1538–1546; other types fail at
  1548–1549 (`quote_check.txt` tokens PASS). "the PDL enum has no dragLeave" — **AGREE**
  (Input.pdl 81–85).

### §"What Blink does with them (sourced)"

- **S198 `web_frame_widget_impl.cc:709-751`** — **AGREE**: no-data return 718–720; `kNone`
  branch 735–738 with the "IPC RACE CONDITION" comment at 736 and `DragTargetDragLeave(...)` at
  737; the note's `:734-738` includes the blank/comment lead-in. `783-792` calls `CancelDrag`;
  `CancelDrag` is 1472–1475; `DragTargetDragEnterOrOver` early-returns at 1505–1508 — all
  **AGREE**.
- **S199 `drag_controller.cc:845-880`, `:254-272`, `:274-300`** — **AGREE**: `kTypesReadable`
  at 259 (DragExited) and 853 (TryDHTMLDrag), `kReadable` at 291–292 (PerformDrop; the
  function extends past 300, but the cited excerpt is inside `:274-300`).
- **S200 `data_transfer.cc:352-354`** — **AGREE**: `getData` guard exactly at 352–354.
  "`CanReadData()`, which holds only for readable/writable (606-615)" — **AGREE on content,
  line range imprecise (`F3`)**: `CanReadTypes` is 606–610; `CanReadData` is **612–615**.

### §"Measured (nine pre-freeze runs and four probes, identical leg shapes 13/13)"

Every one of the 14 table rows reproduces on **14/14 receipts** (`table_check.txt`:
`failures=0`), including:

- `intercept-on` → no events; `press` → `pointerdown@src, mousedown@src`; `move-start` →
  `dragstart@src` at 150,120 then `pointercancel@src` at 0,0; `move-far` → no events.
- one `Input.dragIntercepted` per receipt, payload
  `items=[{text/plain,"tabi-drag"},{text/x-tabi,"x1"}], dragOperationsMask: 17`.
- `enter-dz` → `drag@src`, `dragenter@dz` (prevented); `over-dz` → `dragover@dz` (prevented);
  `drop-dz` → `drag@src, dragover@dz, drop@dz, dragend@src`, drop carries `tabi-drag`/`x1`,
  `dragend.dropEffect = copy`, `dz="tabi-drag|x1"`, `drops=1`.
- `release` → `pointerup@dz, mouseup@dz`; `ext-enter-nz` → `dragenter@nz` unprevented;
  `ext-drop-nz` → `dragover@nz`, `dragleave@nz`, dragleave `dropEffect none`, `nz` unchanged;
  `ext-enter-dz` → `dragenter@dz` prevented; `ext-cancel` → no event; `ext-drop-dz` → no
  event, `drops` still 1; `bad-type` → no event, `-32602 Unexpected event type 'dragLeave'`.
- DataTransfer view projections (types | text/plain | dropEffect | effectAllowed) match on
  every row, including `src` rows `… | "" | none | copyMove` vs `dz` rows `… | "" | copy |
  copyMove` and the ext rows `text/plain | "" | copy | copy`.

**`AGREE §table`, with one provenance disclosure (`F1`).**

### §"Every recorded event is trusted … effectAllowed … "

- "Every recorded event is trusted" — **AGREE** for every scored receipt (14/14; 17 events
  each). Trivially false for the `script-events` control, which is the point of that control;
  the sentence sits in the scored-run paragraph, so no fix required.
- "No event carries a `chromium/*` type … measured by the `native-mouse` and `no-intercept`
  control runs" — **AGREE for scored runs (0/14)**; **wording fix `F5`**: the `script-events`
  control also carries `chromium/x-drag-id` (its mouse legs start a real native drag —
  `derive.txt` degenerate block), so the parenthetical's list of measurement runs is
  incomplete, not wrong.
- "effectAllowed of every drag-target event names the dispatched mask (17 → copyMove, 1 →
  copy)" — **AGREE**: 0 violations over 14 receipts.

### §"Look-alikes the counter refuses"

- **AGREE**: `degenerate-native-mouse` → 0 intercept events + `chromium/x-drag-id` +
  `dragenter@src`; `degenerate-no-intercept` → `chromium/x-drag-id`, 0 intercepts;
  `degenerate-script-events` → untrusted events, `Runtime.evaluate` look-alike expressions (9),
  refused by `send-log-allowlist` (battery `laundered-script-events` expect
  `send-log-allowlist`, exit 1).

### §"Limits"

- "one host, one Chromium build, headless, CSS px = device px" — **AGREE** (all 14 receipts
  identical `host.chromium`/`cdpProduct`; `--force-device-scale-factor=1`).
- "Files, links, HTML and `baseURL`/`title` items and modifiers are not exercised;
  `allow_file_access_` (S197 1444) is not" — **AGREE**: the frozen plan carries no
  `modifiers`, no `files`, only string items `text/plain`/`text/x-tabi`; `allow_file_access_`
  is at 1444 exactly (quote check PASS) and the plan never trips it.
- "Why `drag@src` fires before `dragenter` … is measured, not sourced (event_handler.cc was
  not opened this round)" — **AGREE**: no `event_handler.cc` in
  `.ufo/waves/round-75/sources/` (5 files), and the asymmetry is measured (enter-dz/drop-dz
  have `drag@src`; over-dz does not).
- "The counter is a receipt reader, not an execution oracle (its header names the forgery it
  does not refuse)" — **AGREE**: the declared limit is in the counter header (lines 30–38) and
  in the code (non-uniform-retime control accepted, `limit-nonuniform-retime` exit 0).

## Findings and proposed wording

**F1 (provenance disclosure — the only one a closure is likely to trip on).**
The note says "nine pre-freeze runs and four probes, identical leg shapes 13/13". The shapes
*are* identical (verified 14/14, event tuples included), but the four probes are not uniform
runs: `probe/p1,p2,p3.receipt.json` carry `driverSha256 =
ddcf31dc73ddc2d8692c0b2ef104941981ed561c6f4839a7d0840f8dd8c45abf`,
`dragHypothesis: "REFUTED"`, `predicate: false`; only `probe/p4.receipt.json` (nonce
`tabi-r75-test-1`, 04:39:45Z) and the 9 smokes run under the pinned
`d604552e…8105`. The driver's own source names the probes as the source of its expectation
table (`chrome-cdp-dragdrop-round75.mjs`: "Filled from the L1 probe receipts
(controls/c1/probe/p1-p3, identical across 3)"), and no copy of `ddcf31dc…5abf` survives.
`[INFERENCE]` the REFUTED verdicts are the pre-correction expectation table being refuted by
identical observations and then replaced by the observed shapes; the receipts prove the
observations, not the old table.
*Proposed sentence, inserted after "identical leg shapes 13/13":*
"p1–p3 predate the frozen driver (`ddcf31dc…`), were produced while its expected-shape table
was still unfilled, and carry the producer's old `REFUTED` verdict; their raw events and
`legShape` are identical to p4 and the nine smokes, and only `d604552e…` runs (p4 + smokes)
carry `CONFIRMED`."

**F2a.** S196: cite `:69-94` (or `:69-91` for DragData plus `:78-95` for `dispatchDragEvent`)
— `modifiers` is at line 94, outside `:69-91`.

**F2b.** S197: "`input_handler.cc:1578-1624` (`StartDragging`)" → `1578-1619`
(`DragEnded` is a separate function at 1621–1624). No claim depends on the extra lines.

**F3.** S200: "`CanReadData()`, which holds only for readable/writable (606-615)" →
"(612-615; `CanReadTypes` immediately above at 606-610)".

**F4.** S196 `:332-336`: the quoted sentence is `…to` on 332 and `# restore normal drag and
drop behavior.` on 333. Quote only line 332's sentence, or render the wrap as
"…to `Input.dispatchDragEvent` to / `#` restore normal …". (The quote check passes only after
stripping the continuation line's comment marker.)

**F5.** "measured by the `native-mouse` and `no-intercept` control runs" → add
"and by the `script-events` control, which also starts the native drag in its mouse legs".
Evidence: `degenerate-script-events.receipt.json` carries `chromium/x-drag-id` as well.

## Not findings (checked, hold)

- The note's table omits the `start` leg (no command, no events, zero state). Not a defect.
- The note's "13/13" and the lesson's "13/13" count correctly: 4 probes + 9 smokes = 13; the
  (a) receipt is a 14th, identical receipt.
- The counter's per-leg `SHAPE` matches the measurements row for row (it was filled from the
  probe receipts), so note and counter cannot disagree silently; the note's table is
  descriptive, which is what the note claims ("Measured"), not a pre-registered prediction.
