# SOURCES rows for round 82 — contract v1 shape

Draft for the L1 to land. **These are RE-OPENS of four existing rows, not new rows.** The
SOURCES contract (rule 2) is append-only: only `status`, `recheck` and `used-by` change in place,
and each change is logged old→new in the round lesson. All four URLs already carry rows, and three
of them (S219/S223 the same WHATWG input page, S220 the same Chromium `.cc`) are byte-identical
re-fetches of the pinned sources, so a new row would be a duplicate-URL violation (E04 in
`scripts/check-sources.mjs`) and would double-count a source that has not changed.

The four sources the R82Scout seat opened, and what its own fetch proves (all HTTP 200, all
byte-identical to the committed pins — verified against the scout's staged bytes and independently
re-fetched by this seat):

| source | scout file | bytes | sha256 | matches the committed pin |
|---|---|---|---|---|
| WHATWG HTML `input.html` | `html-input.html` | 687,515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | S219/S223 pin `b0202de1c0b4` — **match** |
| Chromium 155.0.8059.84 `html_input_element.cc` | `html_input_element.cc` | 101,570 | `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d` | S220 pin `405b52c70185` — **match** |
| Chromium 155.0.8059.84 `DOM.pdl` | `dom.pdl` | 34,575 | `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702` | S222 pin `50c460459e50` — **match** |
| Chromium 155.0.8059.84 `Page.pdl` | `page.pdl` | 61,911 | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | S221 pin `e944a3b19fa2` — **match** |

The re-open therefore refreshes each row's `recheck` and `used-by` and leaves `source`, `kind`,
`tier`, `scope`, `anchor` and `teaches` untouched. The located quotes below are the anchors the
re-open re-verified (each located by byte offset in the staged copy and re-checked against the
committed bytes); the word counts are `wc -w` on the quote text, per QUALITY 159.

---

## S219 — WHATWG HTML, the `showPicker()` steps (the cross-origin SecurityError and its File/Color exemption)

- **id:** S219
- **source:** WHATWG HTML — the input element's `showPicker()` steps (the cross-origin SecurityError and its File/Color exemption) — https://html.spec.whatwg.org/multipage/input.html
- **kind:** spec
- **tier:** A
- **scope:** `showPicker()`: the mutability, cross-origin and transient-activation steps, and the File Upload / Color exemption from the SecurityError
- **anchor (re-verified 2026-11-08, byte-identical to the 2026-11-07 fetch):** §4.10.5.4 *Common input element APIs*, the `HTMLInputElement`/`HTMLSelectElement` `showPicker()` method steps — the cross-origin SecurityError step and its File/Color exemption note (fetched 2026-11-08, 687,515 B, sha256 `b0202de1c0b4`; staged copy line 5838 for the exemption note, line 5830 for the mutability step). This is the **living standard** (unversioned): the digest is what makes the citation checkable.
- **located quote (12 words):** "File and Color inputs are exempted from this check for historical reason"
- **teaches (≤25 words):** the spec exempts File and Color inputs from the cross-origin SecurityError, so a cross-origin `type=file` picker opens
- **status:** mined
- **opened:** 2026-11-07
- **recheck:** 90d
- **used-by (old → new):** `corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md` → `corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md, corpus/knowledge/chromium-showpicker-runtime-round-82.md`

## S220 — Chromium 155.0.8059.84 Blink `HTMLInputElement` source (`showPicker`)

- **id:** S220
- **source:** Chromium 155.0.8059.84 Blink HTMLInputElement source (showPicker) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT
- **kind:** code
- **tier:** A
- **scope:** `HTMLInputElement::showPicker` at this tag: the cross-origin check and its file/color exemption, then mutability, then the gesture check
- **anchor (re-verified 2026-11-08, byte-identical to the 2026-11-07 fetch):** tag 155.0.8059.84, `HTMLInputElement::showPicker` lines 2652-2682 (fetched 2026-11-08, decoded 2,818 lines, sha256 `405b52c70185`); the exemption predicate at lines 2657-2658, the SecurityError throw at 2659-2663, the mutability check at 2666, the gesture check at 2673, the activation consumption at 2679
- **located quote (14 words):** "In cross-origin iframes it should throw a "SecurityError" DOMException except on file and color."
- **teaches (≤25 words):** the implementation exempts file and color inputs from the cross-origin SecurityError before it checks mutability
- **status:** mined
- **opened:** 2026-11-07
- **recheck:** 90d
- **used-by (old → new):** `corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md` → `corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-81.md, corpus/knowledge/chromium-showpicker-runtime-round-82.md`

## S221 — CDP Page domain (`Page.pdl`) at tag 155.0.8059.84

- **id:** S221
- **source:** CDP Page domain (Page.pdl) at tag 155.0.8059.84 — `Page.setInterceptFileChooserDialog` and `Page.fileChooserOpened` — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT
- **kind:** code
- **tier:** A
- **scope:** the interception command and the chooser event's fields (frameId, mode, backendNodeId)
- **anchor (re-verified 2026-11-08, byte-identical to the 2026-11-07 fetch):** lines 1279-1288 (`setInterceptFileChooserDialog` and its parameters) and lines 1294-1298 (`fileChooserOpened` and its `frameId`/`mode`/`backendNodeId` parameters); fetched 2026-11-08, decoded 61,911 B, sha256 `e944a3b19fa2`
- **located quote (13 words):** "When file chooser interception is enabled, native file chooser dialog is not shown."
- **teaches (≤25 words):** the event carries the backendNodeId the answer command needs, and interception emits it instead of the native dialog
- **status:** mined
- **opened:** 2026-11-07
- **recheck:** 90d
- **used-by (old → new):** `corpus/knowledge/chromium-showpicker-runtime-round-80.md` → `corpus/knowledge/chromium-showpicker-runtime-round-80.md, corpus/knowledge/chromium-showpicker-runtime-round-82.md`

## S222 — CDP DOM domain (`DOM.pdl`) at tag 155.0.8059.84 (`DOM.setFileInputFiles`)

- **id:** S222
- **source:** CDP DOM domain (DOM.pdl) at tag 155.0.8059.84 — `DOM.setFileInputFiles` — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT
- **kind:** code
- **tier:** A
- **scope:** the answer command's parameters: `files`, `nodeId`, `backendNodeId`, `objectId` — and the absence of any `accept` or directory parameter
- **anchor (re-verified 2026-11-08, byte-identical to the 2026-11-07 fetch):** lines 681-691 (the `setFileInputFiles` command and its four parameters); fetched 2026-11-08, decoded 34,575 B, sha256 `50c460459e50`. At this tag the file lives at `third_party/blink/public/devtools_protocol/domains/DOM.pdl`; the older `third_party/devtools-protocol/pdl/domains/DOM.pdl` path returns **404** in this tree, so a note citing the old path would be unverifiable as written.
- **located quote (6 words):** "Array of file paths to set."
- **teaches (≤25 words):** the answer command takes file paths and a node id only; accept filtering and directory expansion belong to the input, not the command
- **status:** mined
- **opened:** 2026-11-07
- **recheck:** 90d
- **used-by (old → new):** `corpus/knowledge/chromium-showpicker-runtime-round-81.md` → `corpus/knowledge/chromium-showpicker-runtime-round-81.md, corpus/knowledge/chromium-showpicker-runtime-round-82.md`

---

## S223 — WHATWG HTML, the file-upload state's `accept` attribute

- **id:** S223
- **source:** WHATWG HTML — the file-upload state's `accept` attribute — https://html.spec.whatwg.org/multipage/input.html
- **kind:** spec
- **tier:** A
- **scope:** `accept` is a hint to the user agent about the file types to offer, not a validation rule on the selected files
- **anchor (re-verified 2026-11-08, byte-identical to the 2026-11-07 fetch):** §4.10.5.1.17 *File Upload state (type=file)*, the accept attribute paragraph (fetched 2026-11-08, 687,515 B, sha256 `b0202de1c0b4`; staged copy line 4067 for the paragraph, the accept grammar continuing at line 4070)
- **located quote (20 words):** "The accept attribute may be specified to provide user agents with a hint of what file types will be accepted."
- **teaches (≤25 words):** the spec calls accept a hint, so a programmatic answer is not filtered by it — the measured r81 accept-answer law
- **status:** mined
- **opened:** 2026-11-07
- **recheck:** 90d
- **used-by (old → new):** `corpus/knowledge/chromium-showpicker-runtime-round-81.md` → `corpus/knowledge/chromium-showpicker-runtime-round-81.md, corpus/knowledge/chromium-showpicker-runtime-round-82.md`

---

## Two notes the L1 must carry into the lesson's `## Gate`

1. **The `used-by` append is the reciprocity half of QUALITY 75.** The r82 note's `source:` line
   names S219 and S220 (and, as drafted above, S221/S222), so those rows' `used-by` must name
   `corpus/knowledge/chromium-showpicker-runtime-round-82.md` — otherwise the citation is
   one-way. Today `grep -c 'chromium-showpicker-runtime-round-82.md' corpus/SOURCES.md` is **0**:
   the committed r82 note cites S219/S220 and no row names it. That is a live QUALITY-75 gap the
   r82 wave owns.
2. **S221 and S222/S223 were never re-opened for r82 by the L1's own record.** The committed
   lesson's Gate says "the two carried rows re-opened (S219/S220)"; the scout in fact opened four
   sources (S219, S220, S221, S222) plus the accept paragraph (S223), all byte-identical to their
   pins. Recording four re-opens (and S223's, from the same fetched page) is the accurate statement.
   Each re-open's `recheck` stays `90d`: the bytes did not move, so nothing needs a shorter cadence.
