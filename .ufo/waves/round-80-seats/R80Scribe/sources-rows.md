# SOURCES rows — round 80 (four sources opened by R80Scout)

The four sources the round's scout opened are **re-openings, not new sources**: S216, S218, S212 and
S208 were each fetched again from the same URL at the same tag (or, for S216, the same living
standard) and came back **byte-identical** — sha256 `b0202de1c0b4…` (spec), `405b52c70185…` (cc),
`e944a3b19fa2…` (Page.pdl), `50c460459e50…` (DOM.pdl), the same values the r77/r79 rows already
carry. The registry is append-only, so **no new id is minted and no cell is rewritten**: the table
below reproduces the four rows exactly as they stand, with two additions — the `anchor` cell gains
the r80 locator and quote (marked), and `used-by` gains the r80 note. Registry count stays 218.

Rows are contract v1 (`corpus/SOURCES.md` header): id · source · kind · tier · scope · anchor ·
teaches · status · opened · recheck · used-by.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S216 | WHATWG HTML — the input element's showPicker() method steps — https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker | spec | A | the normative showPicker() algorithm for input elements: the exception order (not mutable -> InvalidStateError, cross-origin -> SecurityError with file/color exempt, no transient activation -> NotAllowedError) | §4.10.5.1.1 showPicker() steps at 2026-11-07 (living standard, fetched 687,515 B, sha256 b0202de1c0b4). r80 re-open: same bytes; SecurityError step at lines 5832-5836, exemption note 5838-5840, quote "this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException." (18 words) | the SecurityError step's exact condition and the File/Color exemption, so the origin check cannot fire for a file input | mined | 2026-11-07 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-79.md, corpus/knowledge/chromium-showpicker-runtime-round-80.md |
| S218 | Chromium 155.0.8059.84 Blink HTMLInputElement source (showPicker) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT | code | A | HTMLInputElement::showPicker at this tag: the check order, the exact exception messages, and the activation consumption before the popup opens | tag 155.0.8059.84, HTMLInputElement::showPicker at lines 2652-2682 (fetched 135,428 B base64, decoded 2,818 lines, sha256 405b52c70185). r80 re-open: same bytes; cross-origin block 2657-2663, mutability 2666-2671, gesture 2673-2677, consume 2679, quote "showPicker() called from cross-origin iframe." (6 words) at 2661 | the cross-origin condition sits before mutability and gesture, and file/color inputs skip it entirely | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-showpicker-runtime-round-79.md, corpus/knowledge/chromium-showpicker-runtime-round-80.md |
| S212 | Chromium 155.0.8059.84 Page domain PDL (file-chooser interception) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT | code | A | Page.setInterceptFileChooserDialog and Page.fileChooserOpened at this tag; a second scope of the file S202 holds (dialog lines); only lines 1279-1288 and 1294-1304 are mined | decoded lines 1279-1288 (interception: the native chooser is not shown, fileChooserOpened is emitted; experimental cancel flag), 1294-1304 (the event: frameId at 1298, mode selectSingle/selectMultiple at 1301-1302, the backendNodeId comment at 1303 and the field declared at 1304); .ufo/waves/round-77/sources/Page.pdl sha256 e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be; fetched 2026-11-07. r80 re-open: same bytes (61,911 B); quote "When file chooser interception is enabled, native file chooser dialog is not shown. Instead, a protocol event `Page.fileChooserOpened` is emitted." (20 words) at 1280-1281 | interception replaces the native dialog with the event; the mode enum is selectSingle/selectMultiple and backendNodeId is optional | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-file-chooser-runtime-round-77.md, corpus/lessons/round-77.md, corpus/knowledge/chromium-showpicker-runtime-round-80.md |
| S208 | Chromium 155.0.8059.84 DOM domain PDL (setFileInputFiles) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT | code | A | DOM.setFileInputFiles at this tag (files, and the node addressed by nodeId, backendNodeId or objectId); only lines 681-691 are mined; not runtime delivery | decoded lines 681-691 (the command, its files array and its three node selectors); .ufo/waves/round-77/sources/DOM.pdl sha256 50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702; fetched 2026-11-07. r80 re-open: same bytes (34,575 B); quote "Sets files for the given file input element." (8 words) at 681 and "Identifier of the backend node." (5 words) at 688 | the answer takes file paths plus one of nodeId, backendNodeId or objectId; the r80 driver uses the event's backendNodeId | mined | 2026-11-07 | on-release | corpus/knowledge/chromium-file-chooser-runtime-round-77.md, corpus/lessons/round-77.md, corpus/knowledge/chromium-showpicker-runtime-round-80.md |

## Re-opening log line (for the registry's bullet section)

- 2026-11-07 · round-80 showPicker generation re-opening (R80Scout, four sources). Question: what do
  the spec's SecurityError step, Chromium's `showPicker()` order, `Page.setInterceptFileChooserDialog`
  / `Page.fileChooserOpened` and `DOM.setFileInputFiles` say at the tag this lane measures, and does
  the source make the SecurityError step reachable from page script at all? Re-opened S216, S218,
  S212, S208 from their recorded URLs; all four byte-identical to the r77/r79 fetches (sha256
  b0202de1c0b4…, 405b52c70185…, e944a3b19fa2…, 50c460459e50…), 4/4 quotes located, 0 supersessions,
  0 new rows. Stop: the four anchors answer the question at the tag; reachability of the
  SecurityError branch is a fixture question, not a source question, and is recorded as a limit in
  `corpus/knowledge/chromium-showpicker-runtime-round-80.md`.

## Opened but not registered (and why)

Two further files were fetched into the scout's staging directory and are **not** rows: the
`html_input_element.h` (22,640 B, sha256 `dc599d4ceda8…`) and `html_input_element.idl` (6,315 B,
sha256 `04501c0169cd…`) at the same tag. Neither carries a line the round's claims need — the IDL
declares `showPicker()` but the exception semantics live in the `.cc` (S218), and the header declares
`showPicker`/`IsPickerVisible` without a condition. They stay leads, in the r77 precedent that
excluded `html_input_element.cc` and `file_chooser.cc` for the same reason.
