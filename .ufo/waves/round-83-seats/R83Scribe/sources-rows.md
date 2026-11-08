# SOURCES rows for round 83 — contract v1 shape

Draft for the L1 to land in `corpus/SOURCES.md`. Two classes of change:

1. **Five new rows, S224–S228** — for the sources the R83Scout seat opened that carry ground this
   generation's laws need and no existing row scopes.
2. **`used-by` appends on S219–S223** — the reciprocity half: the round-82 and round-83 notes both
   cite them and no row names either note today (`grep -c 'chromium-showpicker-runtime-round-8[23].md'
   corpus/SOURCES.md` → `0`).

Everything below was measured against the committed bytes; the fetch manifest is
`.ufo/waves/round-83-seats/R83Scout/sources/FETCH.txt` (14 × HTTP 200, 5 × 404 probes) and every byte
figure below was re-hashed by this seat.

## Cost of the insert, measured before you land it

Run on a scratch copy of the registry with these five rows inserted (census: fleet script with
`--file`; structural gate: `scripts/check-sources.mjs`):

| instrument | at HEAD | with S224–S228 | delta |
|---|---|---|---|
| `scripts/sources-census.sh validate` | exit **0**, 223 rows, 37 `W04` lines | exit **0**, 228 rows, **40** `W04` lines | +3 warnings (`S224`, `S225`, `S227` — same URL as an existing row, different scope) |
| `scripts/check-sources.mjs` | exit 1, 15 `duplicate_url`, 223 rows, A:205 B:9 C:9 | exit 1, **18** `duplicate_url`, 228 rows, A:210 B:9 C:9 | +3 `duplicate_url`, same class, gate already red at base `4cdf4def` with the same 15 |

The three `duplicate_url` additions are the flag cost of the lane's own established practice: `S206`
("a second scope of the file S186 holds"), `S212` ("a second scope of the file S202 holds"), `S211`,
`S219`/`S220`/`S221`/`S222`/`S223` are all same-URL rows already in the registry and already inside the
15. **Default recommendation:** land `S226` and `S228` unconditionally (new URLs — zero new findings);
land `S224`, `S225`, `S227` as second-scope rows if the round wants the `multiple`/accept-token/AssertNode
ground registered, and drop them if the L1 would rather not grow the warning count. The note's laws do
not depend on any one of the three: law 1 rests on S219/S220 + the receipt, law 2 on S225/S226 + the
receipt, law 3 on S223/S222 + the receipt, law 4 on S227/S228/S221 + the receipt.

---

## Paste-ready rows (11 columns, no `|` inside a cell)

| S224 | WHATWG HTML — the `multiple` content attribute (one value versus many values) — https://html.spec.whatwg.org/multipage/input.html | spec | A | §4.10.5.3.5 `multiple`: the boolean attribute that lets the user specify more than one value, and the File Upload picker step that bounds the selection to one file unless it is set; a second scope of the page S219 and S223 hold | §4.10.5.3.5 at raw line 4989, the picker step at raw line 5864-5866, the File Upload bound at raw line 4027 (fetched 2026-11-08, 687,515 B, sha256 `b0202de1c0b4`) | `multiple` is the attribute that permits more than one selected file, so the picker's mode follows the input's attribute rather than the call | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-83.md |
| S225 | Chromium 155.0.8059.84 Blink FileInputType source (accept-token collection) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT | code | A | FileInputType::CollectAcceptTypes at this tag: the accept attribute split into a MIME list and an extension list; a second scope of the file S210 holds (chooser and selection path) | decoded lines 62-70 (the accept attribute split into MIME types then extensions, appended in that order); `.ufo/waves/round-83-seats/R83Scout/sources/cdp_file_input_type.cc` sha256 `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`; fetched 2026-11-08 | the accept attribute reaches the chooser as two token lists, MIME types then extensions, not as a validation predicate on the answer | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-83.md |
| S226 | Chromium 155.0.8059.84 Blink file_chooser.mojom (FileChooserParams) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/mojom/choosers/file_chooser.mojom?format=TEXT | code | A | the renderer's file-chooser parameter block at this tag: the Mode enum (kOpen, kOpenMultiple, kUploadFolder, kOpenDirectory, kSave) and the accept_types token list | decoded lines 14-59 (Mode enum 15-36, accept_types 55-59); `.ufo/waves/round-83-seats/R83Scout/sources/cdp_file_chooser.mojom` sha256 `718783541fb3b63e758412e6f398e3d6162c30c7a5b3c21e5af42ce0e2faab8e`; fetched 2026-11-08 | the picker's mode and its accept tokens are fixed in the renderer's request before any answer arrives, so an answer cannot choose the mode | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-83.md |
| S227 | Chromium 155.0.8059.84 Blink InspectorDOMAgent source (AssertNode id resolution) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc?format=TEXT | code | A | InspectorDOMAgent::AssertNode at this tag: the nodeId, backendNodeId and objectId resolution, and the refusal when none is supplied; a second scope of the file S209 holds | decoded lines 636-658 (`DOMNodeIds::NodeForId(backend_node_id.value())` at 646, the "No node found for given backend id" refusal at 647-649, the no-selector refusal at 657); `.ufo/waves/round-83-seats/R83Scout/sources/cdp_inspector_dom_agent.cc` sha256 `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f`; fetched 2026-11-08 | an answer addressed by backendNodeId is resolved through the same DOMNodeId map the chooser event's id comes from | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-83.md |
| S228 | Chromium 155.0.8059.84 Blink DOMNodeIds source (the id map) — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/dom/dom_node_ids.h?format=TEXT | code | A | DOMNodeIds at this tag: IdForNode and NodeForId over one process-wide map — the id space both the chooser event and the answer command address | decoded `dom_node_ids.h` lines 29-30 and the sibling `dom_node_ids.cc` lines 22-38 (NextId monotone counter, GCedHeapHashMap IdToNodeMap); `.h` sha256 `83f63b185057fc6743bdf341487daa6fcd641575bc4ab9543ca3d1939b1aae2f`, `.cc` sha256 `33f40333b67fb9a00071dcd69131671ac007da23c3755f0c2777bcbdb4d40e3b`; fetched 2026-11-08 | one DOMNodeId space per renderer process means two choosers on one input share one id, so an answer's id cannot name which chooser it answers | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-showpicker-runtime-round-83.md |

`S228` is one row for one interface (`NodeForId`) whose sibling `.cc` is named in the anchor cell; the
`.cc` is a staged copy, not a second row, because the interface sentence is the one the law needs.

---

## Per-row Gate material (contract rule 1: URL, access date, ≤25-word quote with its location, count)

### S224 — WHATWG HTML, the `multiple` content attribute

- **URL:** `https://html.spec.whatwg.org/multipage/input.html` · **access:** 2026-11-08 · **HTTP:** 200
  · **bytes:** 687,515 · **sha256:** `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
  (byte-identical to the S219/S223/S216 pin — the living standard did not move)
- **locator:** §4.10.5.3.5 *The multiple attribute* (raw line 4989, the definition sentence rendered at
  raw lines 4990-4991); §4.10.5.1.17 *File Upload state* (raw line 4027); §4.10.5.4 *Common input
  element APIs*, the picker step (raw line 5865)
- **quote (22 words):** "The multiple attribute is a boolean attribute that indicates whether the user
  is to be allowed to specify more than one value."
- **second quote (20 words, raw line 4027-4028):** "Unless the multiple attribute is set, there must be
  no more than one file in the list of selected files."
- **third quote (13 words, raw line 5865):** "must be no more than one file selected; otherwise, any
  number may be selected."
- **why it is a new row and not a re-open:** the `multiple` ground is not in S219's scope (the
  `showPicker()` exception steps) nor S223's (the `accept` attribute). The contract's rule 2 allows only
  `status`/`recheck`/`used-by` to change in place, so a widened scope needs a row. Same-URL second-scope
  rows follow the `S206`/`S212` precedent; the census scores it `W04`, exit 0.

### S225 — Chromium 155.0.8059.84 Blink `file_input_type.cc`, CollectAcceptTypes

- **URL:** `…/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT` ·
  **access:** 2026-11-08 · **HTTP:** 200 · **wire:** 31,220 B base64 · **decoded:** 23,415 B ·
  **sha256 (decoded):** `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`
  (byte-identical to S210's pin)
- **locator:** decoded lines 62-70 (the anonymous-namespace `CollectAcceptTypes`), called at 224 and 530
- **quote (8 words, lines 63-64):** "Vector<String> mime_types = input.AcceptMIMETypes(); Vector<String>
  extensions = input.AcceptFileExtensions();"
- **why a second scope:** S210's scope names only lines 174-224, 465-481, 483-508 and 525-556 as mined;
  lines 62-70 sit outside it. The token split is what the `accept`-answer laws need to describe.

### S226 — Chromium 155.0.8059.84 Blink `file_chooser.mojom`

- **URL:** `…/third_party/blink/public/mojom/choosers/file_chooser.mojom?format=TEXT` ·
  **access:** 2026-11-08 · **HTTP:** 200 · **wire:** 7,676 B base64 · **decoded:** 5,755 B ·
  **sha256 (decoded):** `718783541fb3b63e758412e6f398e3d6162c30c7a5b3c21e5af42ce0e2faab8e` — a URL with
  no existing row
- **locator:** decoded lines 14-59 (`struct FileChooserParams`: `Mode` enum 15-36, `accept_types` 55-59)
- **quote (9 words, line 20):** "Like Open, but allows picking multiple files to open."
- **quote not usable in a cell (19 words, lines 55-56):** the `accept_types` comment reads "A list of
  valid lower-cased MIME types or file extensions specified in an |accept| attribute of an input
  element" — the literal `|` characters make it unusable inside a registry row, which is why the row's
  anchor names the lines and carries the `Mode` quote instead. Quote it in prose only.

### S227 — Chromium 155.0.8059.84 Blink `inspector_dom_agent.cc`, AssertNode

- **URL:** `…/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc?format=TEXT` ·
  **access:** 2026-11-08 · **HTTP:** 200 · **wire:** 170,680 B base64 · **decoded:** 128,010 B ·
  **sha256 (decoded):** `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f`
  (byte-identical to S209's pin)
- **locator:** decoded lines 636-658 (`AssertNode` over the three selectors), plus the one-selector
  overload at 629-634
- **quote (3 words, line 646):** "node = DOMNodeIds::NodeForId(backend_node_id.value());"
- **second quote (8 words, line 657):** "Either nodeId, backendNodeId or objectId must be specified"
- **why a second scope:** S209's scope names lines 1795-1817 (the `setFileInputFiles` handler); the id
  resolution it depends on is at 636-658 and belongs to no row.

### S228 — Chromium 155.0.8059.84 Blink `dom_node_ids.h` / `dom_node_ids.cc`

- **URL:** `…/third_party/blink/renderer/core/dom/dom_node_ids.h?format=TEXT` · **access:** 2026-11-08 ·
  **HTTP:** 200 · **wire:** 1,588 B base64 · **decoded:** 1,189 B · **sha256 (decoded):**
  `83f63b185057fc6743bdf341487daa6fcd641575bc4ab9543ca3d1939b1aae2f` — a URL with no existing row
  (sibling `.cc`: 2,776 B base64 → 2,081 B decoded, sha256 `33f40333b67fb9a00071dcd69131671ac007da23c3755f0c2777bcbdb4d40e3b`)
- **locator:** `dom_node_ids.h` lines 27-30 (`IdForNode`, `NodeForId`); `dom_node_ids.cc` lines 22-38
  (`NextId` monotone counter, `IdToNodeMap` a `GCedHeapHashMap<DOMNodeId, WeakMember<Node>>`)
- **quote (13 words, line 29):** "Return a node for the DOMNodeID or null if one hasn't been assigned."
- **what it grounds:** the chooser event's id is `element->GetDomNodeId()` (S211, lines 1899-1913) and the
  answer resolves the same id through this map (S227 line 646) — one space, so two choosers on one input
  cannot be told apart by id. This is the mechanism behind the r83 law-4 limit, not a new measurement.

---

## `used-by` appends (contract rule 2 — in-place, logged old → new)

Both notes exist and both cite these rows: the round-82 note's `source:` line names S219 and S220 (and,
in its drafted form, S221-S223), and the round-83 note names S219-S228. Today **no** row names either
note, so every citation is one-way.

| row | used-by today | used-by after |
|---|---|---|
| S219 | `…round-80.md, …round-81.md` | `…round-80.md, …round-81.md, …round-82.md, …round-83.md` |
| S220 | `…round-80.md, …round-81.md` | `…round-80.md, …round-81.md, …round-82.md, …round-83.md` |
| S221 | `…round-80.md` | `…round-80.md, …round-82.md, …round-83.md` |
| S222 | `…round-81.md` | `…round-81.md, …round-82.md, …round-83.md` |
| S223 | `…round-81.md` | `…round-81.md, …round-82.md, …round-83.md` |

(`…round-NN.md` abbreviates `corpus/knowledge/chromium-showpicker-runtime-round-NN.md`.) The round-82
backfill is a correction of record: the r82 Gate claimed the re-opens refreshed `used-by`, and the
committed registry shows they did not.

`recheck` stays `90d` for all five new rows and for the five re-opened rows: the four tag-pinned files
are byte-identical to their pins, and the living standard is unchanged, so nothing needs a shorter
cadence. Note the lane's inconsistency for the integrator: the same tag-pinned files carry `on-release`
on S208-S212 and `90d` on S219-S222; this draft follows the showPicker family (`90d`) because these rows
are its siblings.

## Search log (contract rule 5)

2026-11-08 · round-83 showPicker generation-r83 sources (TabiR83 scout, re-verified by this seat).
**Question:** what do the spec and the Chromium 155.0.8059.84 tree say about the `multiple` attribute,
the `accept` token split, the chooser-mode enum, and the id space that makes a `fileChooserOpened`
`backendNodeId` answerable by `DOM.setFileInputFiles`? **Where searched:** `html.spec.whatwg.org`
(the one living-standard page the lane already holds) and `chromium.googlesource.com` at tag
`155.0.8059.84` with `?format=TEXT`. **Identified** 19 (14 fetched 200, 5 probed 404). **Screened** 19.
**Included** 5 (S224-S228). **Excluded** 14: nine fetched files that carry nothing the laws need or
whose relevant ground an existing row already scopes (`DOM.pdl`, `Page.pdl`, `html_input_element.cc`,
`inspector_page_agent.cc`, `identifiers_factory.cc`, `file_chooser.h`, `file_chooser.cc`,
`input_type_view.cc`, and the `dom_node_ids.cc` sibling folded into S228), plus the five 404 probes
(`inspector_protocol.pdl`, `inspector_file_chooser.cc`, the retired `third_party/devtools-protocol/pdl/
domains/DOM.pdl` path, `core/file/file_chooser.h`, `platform/filechooser/file_chooser.cc`). **Stop:**
each law's source sentence is located and quoted; this is not a discovery-completeness claim and no
cross-engine or cross-tag breadth is implied.
