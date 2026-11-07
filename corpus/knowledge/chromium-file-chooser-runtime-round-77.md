source: S208, S209, S210, S211, S212 (Chromium 155.0.8059.84 DOM.pdl, inspector_dom_agent.cc, file_input_type.cc, inspector_page_agent.cc, Page.pdl second scope; opened 2026-11-07, round 77, before the freeze)
verified-at: 2026-11-07, lane round 77, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP product `Chrome/155.0.8059.84`, protocol 1.3, loopback fixture with four file inputs (single, `multiple`, `webkitdirectory`, `accept=".png"`) and a button whose click handler calls the single input's click(), viewport 1280x900, deviceScaleFactor 1
recheck: S=<short ABS dir>; node scripts/chrome-cdp-filechooser-round77.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r77-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-filechooser-r77.mjs --lane <ABS lane> --receipt $S/receipt.json --expect-driver-sha256 <freeze.txt driver digest> --expect-nonce tabi-r77-recheck-<hex> --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt [--prior <every later r77 receipt in the lane>] --json  (exit 0 clean; keep $S outside the lane, or the walk names the new receipt)

# File choosers over CDP — what a page sees when a client intercepts and answers them (round 77)

New ground for this lane: the `<input type=file>` chooser driven over raw CDP —
`Page.setInterceptFileChooserDialog`, the `Page.fileChooserOpened` event and
`DOM.setFileInputFiles`. The lane drives mouse, wheel, touch gestures, keys, IME, drag and
JavaScript dialogs (rounds 44–76), but no capability row and no note covered a file chooser:
`git grep -liE 'file ?chooser|setFileInputFiles|fileChooserOpened|setInterceptFileChooserDialog|webkitdirectory|showPicker'
1320d428 -- corpus/knowledge` is empty at base. (The wider word `upload` hits one note,
`webbridge-plugin-anatomy.md:85`, which lists a kimi-webbridge plugin verb named `upload`; it
measures nothing about file inputs. The novelty sentence is written against the wide grep, not the
command names alone — the r76 R76Scribe class.) Uploads are where automation most often fakes
success: a page script can build a `DataTransfer`, assign `input.files` and dispatch `change`,
and the page's own handler cannot tell — except by `isTrusted`, by transient activation, and by
whether a chooser ever opened. This note records what the browser itself delivers.

## The protocol (sourced)

- S212 `Page.pdl:1279-1288`: with interception enabled "native file chooser dialog is not shown.
  Instead, a protocol event `Page.fileChooserOpened` is emitted"; the `cancel` flag is
  experimental ("cancels the dialog by emitting relevant events (if any) in addition to not
  showing it"). `:1294-1303` the event carries `frameId`, `mode` ∈ {selectSingle, selectMultiple}
  and an optional `backendNodeId` ("Only present for file choosers opened via an `<input
  type="file">` element").
- S208 `DOM.pdl:681-691`: `setFileInputFiles(files, nodeId | backendNodeId | objectId)`.
- S211 `inspector_page_agent.cc:1899-1913`: the event's mode is `selectMultiple` only when the
  input has `multiple` — the probe is called with `input.Multiple()`, so a `webkitdirectory`
  input reports `selectSingle`. `:1949-1956`: interception sets suppression; "Cancel file chooser
  only if interception is enabled" (1953).
- S210 `file_input_type.cc:181-188`: without transient user activation Blink logs "File chooser
  dialog can only be shown with a user activation." and returns — no chooser, no event.
  `:200-210`: the probe runs first; a suppressed AND cancelled chooser calls
  `SetFilesAndDispatchEvents(nullptr)`. `:465-481`: `input` then `change` only when `SetFiles`
  changed the list, otherwise `DispatchCancelEvent()` (479). `:533-556`: an empty path list
  returns at once (536-537); a non-`multiple` input keeps `files[0]` only (552-554).
- S209 `inspector_dom_agent.cc:1806-1810`: a node that is not an input of type file is refused
  `ServerError("Node is not a file input element")` (1809); paths go to `SetFilesFromPaths`
  unchecked (1812-1815).

## Measured (round 77; 13 honest pre-freeze receipts — probes p1-p4, smokes 1-9 — plus the three shape probes, identical in every per-leg field)

One page, fifteen legs in order (`controls/c1/probe/`, `controls/c1/smoke*.receipt.json`; the
counter `scripts/check-filechooser-r77.mjs` re-derives each from the raw page and CDP logs):

| Leg | What the driver sends | Chooser event | What the page sees |
|---|---|---|---|
| pick-single | real click on the single input, then `setFileInputFiles([a.txt])` on the event's node | selectSingle, node 5 | trusted `input`, `change` with `[tabi-a.txt, 11, text/plain]`; the read returns the 11 bytes |
| pick-multiple | click the `multiple` input, `[a.txt, b.bin]` | selectMultiple, node 7 | both files, b.bin typed `application/octet-stream`, both reads exact |
| pick-same | click single, `[a.txt]` again | selectSingle | ONE trusted `cancel` — no `input`/`change`; the list is kept |
| pick-first-only | click single, `[b.bin, a.txt]` | selectSingle | `input`/`change` with b.bin ONLY |
| pick-missing | click single, a path that does not exist | selectSingle | `change` with `[tabi-missing.txt, 0, text/plain]`; `arrayBuffer()` rejects `NotFoundError` |
| pick-empty | click single, `[]` | selectSingle | nothing: no event, the missing-file selection kept, `setFileInputFiles` answers `{}` |
| dir-mode | click the `webkitdirectory` input (no answer) | **selectSingle**, node 14 | the click only |
| accept-ignored | click the `accept=".png"` input, `[a.txt]` | selectSingle, node 18 | a.txt accepted — `accept` is not enforced on this path |
| forward-click | real click on the BUTTON, whose handler calls `s.click()` | selectSingle, node 5 | the button's events trusted; the forwarded `click@s` UNTRUSTED (x=y=0) but with transient activation true, and the chooser opens |
| script-click | `Runtime.evaluate('document.getElementById("s").click(), 1')` (no gesture) | none (1.5 s wait) | one untrusted `click@s`, activation false |
| not-file-input | `setFileInputFiles` on the button's remote object | — | refused `{code: -32000, message: "Node is not a file input element"}`; no page event |
| intercept-cancel | `setInterceptFileChooserDialog({enabled: true, cancel: true})`, click single | selectSingle | the event AND one `cancel`; selection unchanged |
| intercept-off | `setInterceptFileChooserDialog({enabled: false})`, click single | none | one `cancel` right after the click (headless has no picker to show) |

Every `input`/`change`/`cancel` delivered by `setFileInputFiles` is trusted and has transient
activation FALSE. [inference] The opening click consumes it when `FileColorPickerConsumeActivationEnabled` is on (S210 189-191); the flag's state in this build was not read, so the cause is not measured — only the value is.
backendNodeIds were the same 5/7/14/18 in all 16 honest runs of this fixture (driver-frozen
`LEG_SHAPE`); they are a property of this fixture's DOM, not a protocol constant.

## Practice (what to do with it)

- Answer a chooser on the node the EVENT names (`backendNodeId`), not a node you looked up: the
  event proves a chooser opened from that input.
- To refuse a fake upload in a receipt, require all three: the opening event bound to the click,
  trusted `input`/`change`, and the click's activation. A page-stub upload (DataTransfer + dispatch)
  delivers untrusted events and no chooser event; a `userGesture: true` script click opens a real
  chooser but its click is untrusted (`controls/c1/degenerate-*`).
- Re-selecting the same file is NOT a change: expect `cancel`. Code that waits for `change` after
  re-upload hangs.
- A single input silently keeps only the first path; `[]` is a no-op, not a clear; a missing path is
  accepted as a 0-byte File that fails on read; `accept` filters nothing over CDP.
- With interception off, headless `--headless=new` cancels at once — a test that forgets to enable
  interception sees `cancel`, not a hang.

## Limits

- One build (155.0.8059.84), one OS, headless only; headful would show a native picker when
  interception is off — not measured.
- `webkitdirectory` was only OPENED: `setFileInputFiles` with a directory path enumerates through
  `SetFilesFromDirectory` (S210 525-532) and the first exploration call did not return within the
  run (frontier, not measured as a result).
- Drag-and-drop file delivery (`Input.dispatchDragEvent` with files) and `showPicker()` (refused
  without a gesture in a throwaway exploration, not a receipt) are not part of this capability.
- The counter reads receipts; its limit (printed per prior in its `limit` block) is in
  `.ufo/waves/round-77/claims.json`.
