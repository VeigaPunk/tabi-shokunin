source: S208, S209, S210, S211, S212 (Chromium 155.0.8059.84 DOM.pdl, inspector_dom_agent.cc, file_input_type.cc, inspector_page_agent.cc, Page.pdl second scope; opened 2026-11-07, round 77, before the freeze) + S213 (client-side, Puppeteer v25.16.0, opened 2026-11-07T12:07:51-03:00 AFTER the freeze; corroborates the protocol rows, is not a claim source and pins Chrome 156.0.8078.47 at `revisions.ts:11`, not this lane's build)
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
  experimental — 1285-1286 verbatim: "If true, cancels the dialog by emitting relevant events
  (if any) / in addition to not showing it if the interception is enabled". `:1294-1304` the event
  carries `frameId` (1298), `mode` ∈ {selectSingle, selectMultiple} (1301-1302) and an optional
  `backendNodeId` — the comment at 1303 ("Only present for file choosers opened via an `<input
  type="file">` element") and the field declared at 1304.
- S208 `DOM.pdl:681-691`: `setFileInputFiles(files, nodeId | backendNodeId | objectId)`.
- S211 `inspector_page_agent.cc:1899-1913`: the event's mode is `selectMultiple` only when the
  input has `multiple` (1909-1910); the probe that supplies that flag is called with
  `input.Multiple()` on the S210 side (`file_input_type.cc:203-204`). `:1949-1956`: interception
  sets suppression; "Cancel file chooser only if interception is enabled" (1953).
- S210 `file_input_type.cc:181-188`: without transient user activation Blink logs "File chooser
  dialog can only be shown with a user activation." and returns — no chooser, no event.
  `:200-210`: the probe runs first; a suppressed AND cancelled chooser calls
  `SetFilesAndDispatchEvents(nullptr)`. `:465-481`: `if (SetFiles(files) || force)` (469) — `input`
  then `change` when the list changed OR `force_change_event_` is set, otherwise
  `DispatchCancelEvent()` (479). `:483-508`: `FilesChosen` drops unconvertible native paths and
  sets `force_change_event_` (498) only under `FilePickerEventsFixEnabled` with a *connected*
  chooser — not this CDP path. `:525-533`: `SetFilesFromDirectory` builds `kUploadFolder` params
  and calls `NewFileChooser(params)->EnumerateChosenDirectory()` (the frontier R77Exec3 measured
  below). `:535-556` (`SetFilesFromPaths` is declared at 535): an empty path list returns at once (536-537); a non-`multiple` input keeps
  `files[0]` only (552-554).
- S209 `inspector_dom_agent.cc:1806-1810`: a node that is not an input of type file is refused
  `ServerError("Node is not a file input element")` (1809); paths go to `SetFilesFromPaths`
  unchecked (1812-1815).
- S213 (client side, Puppeteer v25.16.0 `cdp/ElementHandle.ts`): "The zero-length array is a special
  case, it seems that … DOM.setFileInputFiles does not actually update the files in that case, so the
  solution is to eval the element value to a new FileList directly" (134-135, verbatim across the
  comment's line break with the elision marked), so Puppeteer sets `element.files` from a
  `DataTransfer` in the page and dispatches events it marks as not trusted ("XXX: These events should
  converted to trusted events. Perhaps do this in `DOM.setFileInputFiles`?", 139-140). Independent
  corroboration of the `pick-empty` leg and of the untrusted signature the degenerate producers carry.
  Client-side usage only: this tag's `revisions.ts:11` pins `chrome: '156.0.8078.47'`, not this lane's
  Chromium 155.0.8059.84. Bytes staged at `.ufo/waves/round-77/sources/ElementHandle.ts` and
  `revisions.ts` (`FETCH.txt`).

## Measured (round 77; 13 honest pre-freeze receipts — probes p1-p4, smokes 1-9 — plus the three shape probes; every per-leg `legShape` entry is byte-identical across all 16 runs: `node -e` over the 16 receipt files compares the 15 `legShape` keys and reports 0 differing entries)

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
| dir-mode | click the `webkitdirectory` input (no answer) | **selectSingle**, node 14 | the trusted pointer/click sequence only — no `input`/`change` |
| accept-ignored | click the `accept=".png"` input, `[a.txt]` | selectSingle, node 18 | a.txt accepted — `accept` is not enforced on this path |
| forward-click | real click on the BUTTON, whose handler calls `s.click()` | selectSingle, node 5 | the button's events trusted; the forwarded `click@s` UNTRUSTED (x=y=0) but with transient activation true, and the chooser opens |
| script-click | `Runtime.evaluate('document.getElementById("s").click(), 1')` (no gesture) | none (1.5 s wait) | one untrusted `click@s`, activation false |
| not-file-input | `setFileInputFiles` on the button's remote object | — | refused `{code: -32000, message: "Node is not a file input element"}`; no page event |
| intercept-cancel | `setInterceptFileChooserDialog({enabled: true, cancel: true})`, click single | selectSingle | the event AND one `cancel`; selection unchanged |
| intercept-off | `setInterceptFileChooserDialog({enabled: false})`, click single | none | one `cancel` right after the click (headless has no picker to show) |

Every `input`/`change`/`cancel` delivered by `setFileInputFiles` is trusted and has transient
activation FALSE. [inference] The opening click consumes it when `FileColorPickerConsumeActivationEnabled` is on (S210 189-191); the flag's state in this build was not read, so the cause is not measured — only the value is.
backendNodeIds are NOT stable across runs of the same fixture: 5/7/14/18 in the 16 pre-freeze
receipts and in the L1's scored run, but 4 for the single input in R77Exec1's cold run
(`.ufo/waves/round-77-seats/R77Exec1/receipt.json`) and 10 for the `multiple` input in one of four
L1 diagnostic runs (`.ufo/waves/round-77-seats/L1-diag/r2.json`) — with every other per-leg field
identical. The id is the value the client happened to be handed by Blink's DOM serialization, not a
fixture property; a receipt or a checker that pins it will refuse honest runs (this is exactly how
claim leg (b) failed as frozen, report *Before → after*).

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
- `webkitdirectory` with a DIRECTORY path was measured in this round's wave (R77Exec3, 3 cold runs,
  not a claim leg): `DOM.setFileInputFiles([<dir>])` on an intercepted `webkitdirectory` input
  answered in 0-4 ms and the page received trusted `input`+`change` with one `File` per regular
  file under the directory, nested included, each `webkitRelativePath` rooted at the directory's
  basename; 0 second `Page.fileChooserOpened` events (S210 525-533 enumerates through a
  FileChooser). Receipts `.ufo/waves/round-77-seats/R77Exec3/probe-run-{1,2,3}.json`; the same
  probe's `nondir` control is in the same seat dir.
- Drag-and-drop file delivery (`Input.dispatchDragEvent` with files) and `showPicker()` (refused
  without a gesture in a throwaway exploration, not a receipt) are not part of this capability.
- The counter reads receipts; its limit (printed per prior in its `limit` block) is in
  `.ufo/waves/round-77/claims.json`.

## Correction — round 98 (append-only; R98Connector O9)

The `pick-missing` row says "`change` with `[tabi-missing.txt, 0, text/plain]`". The round's committed receipt
records a trusted `input` and a trusted `change` for that pick; read the row as "`input`/`change`". Round 98's
PUR legs (Puppeteer `uploadFile` with an absent path into a cross-site iframe) show the same pair and the same
`NotFoundError` on read (`client-oopif-uploadmodes-round-98.md`).

## Correction — round 99 (append-only; R99Connector H2)

The Practice bullet "A single input silently keeps only the first path" is true for what this note measured —
the raw protocol answer (`Page.handleFileChooser` / `DOM.setFileInputFiles` with two paths on an input without
`multiple`: `pick-first-only` kept `tabi-b.bin`). It does not hold for the production client APIs: round 99
measured Playwright 1.65.0 `setInputFiles` and Puppeteer 25.16.0 `uploadFile` with two files on an input
without `multiple` (cross-site iframe, attached clients) and both **refuse** with an `Error` and set nothing
(`client-oopif-uploadsets-round-99.md`, legs PLBN and PUCN). Read the bullet as "over raw CDP".
