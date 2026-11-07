# SOURCES.md rows — round 81 (the four sources R81Scout opens)

Contract: SOURCES contract v1 (fleet-ledger `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`, frozen
2026-10-19): `id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`.
Tier is scoped to the row's `scope` cell, never global; a row is a claim about where to learn, not a
fact admitted to `knowledge/`.

Integration state at drafting: **S222 and S223 are already committed** as the r81 new rows
(`corpus/SOURCES.md` lines 237-238); **S219 and S220 are carried** (r80 rows whose `used-by` already
names the r81 note). So the four rows below are the r81 opening as it should read, plus the located
quote each row's Gate entry needs. If the lane lands them as new ids they supersede; otherwise the
rows stand and only the quote blocks go to the lesson's `## Gate`.

## Rows

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S219 | WHATWG HTML — the input element's `showPicker()` steps (the cross-origin SecurityError and its File/Color exemption) — https://html.spec.whatwg.org/multipage/input.html | spec | A | `showPicker()`: the mutability, cross-origin and transient-activation steps, and the File Upload / Color exemption from the SecurityError | the showPicker algorithm's SecurityError step (lines 5832-5836) and its File/Color note (5838-5840), fetched 2026-11-07, 687,515 B, sha256 b0202de1c0b4 | the spec's step order is mutability, then cross-origin (file/color exempt), then transient activation | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md |
| S220 | Chromium 155.0.8059.84 Blink HTMLInputElement source (showPicker) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT | code | A | `HTMLInputElement::showPicker` at this tag: the cross-origin check and its file/color exemption, then mutability, then the gesture check | tag 155.0.8059.84, lines 2652-2682 (fetched 135,428 B base64, decoded 2,818 lines, sha256 405b52c70185) | Chromium checks the origin before mutability, exempting file and color, so a disabled non-file input throws SecurityError cross-origin | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md |
| S222 | CDP DOM domain (DOM.pdl) at tag 155.0.8059.84 — `DOM.setFileInputFiles` — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT | code | A | the answer command's parameters: `files`, `nodeId`, `backendNodeId`, `objectId` — and the absence of any `accept` or directory parameter | lines 681-691 (fetched 2026-11-07, 46,100 B base64, decoded 1,022 lines, sha256 50c460459e50) | the answer command takes file paths and a node id only; accept filtering and directory expansion belong to the input, not the command | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-81.md |
| S223 | WHATWG HTML — the file-upload state's `accept` attribute — https://html.spec.whatwg.org/multipage/input.html | spec | A | `accept` is a hint to the user agent about the file types to offer, not a validation rule on the selected files | §4.10.5.1.17 File Upload state (type=file), the accept attribute paragraph (lines 4067-4068, fetched 2026-11-07, 687,515 B, sha256 b0202de1c0b4) | the spec calls accept a hint, so a programmatic answer is not filtered by it — the measured r81 accept-answer law | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-81.md |

## Located quotes (verbatim; counts are `wc -w`)

### S219 — the SecurityError step's type condition

- locator: `https://html.spec.whatwg.org/multipage/input.html`, the `showPicker()` method steps,
  lines 5835-5836 (the origin clause opens at 5832; the File/Color note is 5838-5840).
- quote: "this's type attribute is not in the File Upload state or Color state, then throw a
  "SecurityError" DOMException."
- words: **18**.
- fetch: HTTP 200, 687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
  (`last-modified` 2026-11-06T22:04:01Z).
- what the quote does not prove: the origin clause (5832-5834) is the other half of the condition,
  and the note at 5838-5840 is the exemption; the full step is 42 words, so the row quotes the
  discriminating clause and the anchor names the rest. The spec's ORDER (mutability at 5830-5831
  before the origin step) is a separate fact in the same step list.

### S220 — Chromium's cross-origin comment

- locator: `html_input_element.cc` at tag 155.0.8059.84, lines 2654-2655 (inside
  `HTMLInputElement::showPicker`, 2652-2682).
- quote: "In cross-origin iframes it should throw a "SecurityError" DOMException except on file and
  color."
- words: **14**.
- fetch: HTTP 200, 135,428 B base64 → 2,818 lines, sha256
  `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d` (decoded bytes).
- source order, for the order law: origin block 2654-2663, `isMutable()` 2666, gesture 2673,
  `ConsumeTransientUserActivation` 2679, `OpenPopupView` 2681.
- what the quote does not prove: that the origin check RUNS first — the source order is the evidence;
  the receipt's pair (SecurityError cross-origin, InvalidStateError same-origin) is the measurement.

### S222 — the answer command's parameter block

- locator: `DOM.pdl` at tag 155.0.8059.84, lines 681-691 (`# Sets files for the given file input
  element.` at 681, `command setFileInputFiles` at 682).
- quote: "Sets files for the given file input element."
- words: **8**.
- fetch: HTTP 200, 46,100 B base64 → 34,575 B decoded, 1,022 lines, sha256
  `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702`.
- the absence claim is an ENUMERATION of the block, not a quote: the parameters at 683-691 are exactly
  `array of string files`, `optional NodeId nodeId`, `optional BackendNodeId backendNodeId`,
  `optional Runtime.RemoteObjectId objectId`. There is no `accept`, no `directory`, no `multiple`
  parameter anywhere in the command.
- what the quote does not prove: that the implementation ignores `accept` — that is the receipt's
  law 4, not the PDL's text.

### S223 — `accept` as a hint

- locator: `https://html.spec.whatwg.org/multipage/input.html`, §4.10.5.1.17 File Upload state,
  lines 4067-4068.
- quote: "attribute may be specified to provide user agents with a hint of what file types will be
  accepted."
- words: **18**.
- fetch: HTTP 200, 687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`.
- what the quote does not prove: that a programmatic answer is unfiltered — the spec sentence is
  about the dialog's offer; the r81 law 4 is the measurement.

## Row defects found while verifying (report, do not silently fix)

1. **S222's anchor line count is wrong.** The committed cell says "decoded 1,3xx lines"; the staged
   bytes decode to **1,022 lines** (34,575 B, trailing newline present). The base64 size (46,100 B)
   and the sha256 (`50c460459e50…`) are correct. If rows are append-only, land this as a supersession
   row or as a lesson correction naming S222.
2. **S222's locator starts at 682 in the committed cell** ("lines 682-691"); the command's own
   comment line 681 is part of the block the quote comes from. The row above says 681-691.
3. **S219's anchor names the step but not its line range.** The step is 5832-5836; the row above adds
   it. No other cell changes.
4. S220's cells verify clean (135,428 B base64, 2,818 lines, sha256 `405b52c70185…`, lines
   2652-2682); S223's cells verify clean (same page fetch as S219, paragraph at 4067-4068).
