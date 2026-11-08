# R83Scout — round 83 / w1: the r83 source texts opened, quoted, and byte-located

Seat: **R83Scout** (scout, read-only; leaf member — no subagent dispatch).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base named in the brief: `4cdf4def31b1feecb6aed5dbfc048c47d41ec88d`.
Milestone: *open the sources for the r83 laws — the spec's remaining input types, the `multiple` attribute, and second-chooser answering.*
Axis judged: **coverage**.

Sources saved under `.ufo/waves/round-83-seats/R83Scout/sources/` with the manifest
`sources/FETCH.txt` (URL | http status | wire bytes | wire sha256 | decoded bytes | decoded sha256
| five 404 probes). A copy of the scored receipt is in `.ufo/waves/round-83-seats/R83Scout/receipts/receipt.json`
(sha256 `3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c`, byte-identical to
`corpus/evidence/round83/chromium-showpicker/receipt.json`).

Two derived artefacts are also in `sources/`: `whatwg-input.txt` (tag-stripped, one paragraph per
line, prefixed by a line number) and `whatwg-input.map.tsv` (`line_number → raw_start_byte → raw_end_byte`).
Every spec quote below was checked **byte-exact against the original fetched HTML** through that map, and
every word count is `wc -w` on the quote text alone.

---

## 0. The three requested answers, up front

| # | Question | Answer | Source |
|---|----------|--------|--------|
| 1 | `showPicker()` — which input states does the spec exempt? | **File Upload state and Color state** (and nothing else). Every other `type` — including `number` and `range` — is *not* exempt, so the cross-origin `SecurityError` applies to them. | WHATWG HTML §4.10.5.4 (Q1–Q3) |
| 2 | `multiple` content attribute on `type=file` — what does it do to the picker mode? | It switches the picker from **single-select to multi-select**: spec-side the file prompt may allow *any number* of files; Chromium-side it selects `FileChooserParams::Mode::kOpenMultiple`, which surfaces on the wire as `Page.fileChooserOpened` **`mode: "selectMultiple"`** (else `selectSingle`). | WHATWG HTML §4.10.5.4 + §4.10.5.1.17 (Q4–Q6), Chromium (Q11–Q13) |
| 3 | CDP `DOM.setFileInputFiles` parameters at tag `155.0.8059.84` | `files: array of string` (**required**), plus exactly one of `nodeId: NodeId` / `backendNodeId: BackendNodeId` / `objectId: Runtime.RemoteObjectId` (all optional in the PDL, but the handler rejects a call that supplies none). | `DOM.pdl` @ 155.0.8059.84 (Q7–Q9) |

---

## 1. WHATWG HTML — `showPicker()` and the exempted input states

**URL:** `https://html.spec.whatwg.org/multipage/input.html`
**HTTP status:** 200 · **bytes:** 687 515 · **sha256:** `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
**Local copy:** `sources/whatwg-input.html` (identical bytes; wire == decoded, served as plain HTML).
**Locator:** § **4.10.5.4 "Common input element APIs"** (`id=common-input-element-apis`); the
`showPicker()` method steps are inside it, at the `dom-input-showpicker` definition.
Canonical fragment: `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`.

### Q1 — the SecurityError step's condition (18 words by `wc -w`)

> this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

Locator: raw HTML line **5832** (bytes 658 296–660 246). This is the tail of step 2 of the ordered
`showPicker()` steps. Read as the whole step it is:

> If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin, and this is a select element, or this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

(42 words — over the ≤25 budget, so it is quoted for context only; the ≤25-word Q1 above is the citable one.)

**This is the direct answer to (1):** the exemption set is exactly **{File Upload, Color}**.
`type=number` and `type=range` are in neither, so they are **not** exempt.

### Q2 — the spec's own exemption note (20 words by `wc -w`)

> File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers

Locator: raw HTML line **5838** (bytes 660 374–660 756), the `<p class=note>` immediately after step 2.
The full note runs to 29 words (`… and has never been guarded by an origin check.`); the 20-word prefix above
is the ≤25-word citable form, byte-exact as a prefix.

### Q3 — the IDL-side summary of the same rule (21 words by `wc -w`)

> Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states.

Locator: raw HTML line **5608** (bytes 631 644–632 415), §4.10.5.4's summary of the method's throws.

### Q15 — the step *before* the origin check (10 words by `wc -w`)

> If this is not mutable, then throw an "InvalidStateError" DOMException.

Locator: raw HTML line **5831**. Recorded because the spec's step order is *mutability first, origin second* —
see §5.2, where Chromium's order is the reverse.

### Chromium implements exactly the spec's exemption set

**URL:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`
**HTTP status:** 200 · **wire bytes:** 135 428 / **decoded bytes:** 101 570 · **wire sha256:** `81b35d96184a983226f888faa5ac4f9a57be7aa882e9bb4b5d6d09650b7f1b10` · **decoded sha256:** `405b52c70185820ead77b2338f054eb8220fdc7ef176de671db63c349282e96d`.

### Q10 — Blink's cross-origin guard (23 words by `wc -w`, whitespace-collapsed over lines 2657–2664)

> if (FormControlType() != FormControlType::kInputFile && FormControlType() != FormControlType::kInputColor && frame) { if (!frame->IsSameOrigin()) { exception_state.ThrowSecurityError( "showPicker() called from cross-origin iframe."); return; } }

Locator: `html_input_element.cc` lines **2657–2664** (`HTMLInputElement::showPicker`).
The two exempted Blink form-control types are `kInputFile` and `kInputColor` — a one-for-one match with the
spec's {File Upload, Color}. The thrown message string is byte-identical to the counter's frozen
`SECURITY_ERR` constant (`"showPicker() called from cross-origin iframe."`, `scripts/check-showpicker-r83.mjs:213`),
so the r83 cross-origin `number`/`range` legs assert a string the implementation actually emits.

**Coverage note (the `number`/`range` legs are sound but *thin*):** `number` and `range` are not merely
un-exempt — they are input types that **do not support a picker at all**. The spec says so in §4.10.5.4
(`An input element must support a picker when its type attribute is in the File Upload state.`; whether other
states support one is implementation-defined). So `sp83-cross-origin-number` and `sp83-cross-origin-range`
exercise the *same* code path as the r82 `date`/`month`/`week`/`time` legs — a new type constant in the
fixture, not a new law. They are legitimate coverage additions; they are not an independent mechanism.

---

## 2. The `multiple` content attribute on `type=file` — what it does to the picker mode

**URL:** `https://html.spec.whatwg.org/multipage/input.html` · **HTTP status:** 200 · **bytes:** 687 515 ·
**sha256:** `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`.

### Q4 — the picker step for the File Upload state (24 words by `wc -w`)

> If the multiple attribute is not set on element, there must be no more than one file selected; otherwise, any number may be selected.

Locator: raw HTML line **5864** (bytes 664 947–665 405), §4.10.5.4 → "show the picker, if applicable" →
the File Upload step ("Display a prompt to the user requesting that the user specify some files. …").
This is the spec's picker-mode rule: `multiple` absent ⇒ single selection; `multiple` present ⇒ any number.

### Q5 — the selected-files-list rule for the same state (20 words by `wc -w`)

> Unless the multiple attribute is set, there must be no more than one file in the list of selected files.

Locator: raw HTML line **4027** (bytes 416 149–416 472), § **4.10.5.1.17 "File Upload state (type=file)"**.

### Q6 — the attribute's definition (22 words by `wc -w`)

> The multiple attribute is a boolean attribute that indicates whether the user is to be allowed to specify more than one value.

Locator: raw HTML line **4989** (bytes 550 739–551 062), § **4.10.5.3.5 "The multiple attribute"**.

### Chromium: `multiple` → `kOpenMultiple` → CDP `mode: selectMultiple`

**file_input_type.cc** — `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT` ·
HTTP 200 · wire 31 220 / decoded 23 415 · wire sha256 `7e9e63771a18bb7ef8c3310ec97583722f3d21b864fbad2a5a35eb343340e552` ·
decoded sha256 `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`.

### Q11 — the mode selection (6 words by `wc -w`)

> else if (input.FastHasAttribute(html_names::kMultipleAttr)) params.mode = FileChooserParams::Mode::kOpenMultiple;

Locator: `file_input_type.cc` lines **218–219** (inside `FileInputType::OpenPopupView`). Note the preceding
branch at 216–217: `webkitdirectory` wins over `multiple` (`kUploadFolder`), and only otherwise is
`multiple` consulted. `kOpenMultiple` is declared in
`third_party/blink/public/mojom/choosers/file_chooser.mojom` (HTTP 200, wire 7 676 / decoded 5 755,
wire sha256 `eddd10d478acafb2aa6b7d3a105efa10c0abcefa905498934fcb08f4b879b6d2`,
decoded sha256 `718783541fb3b63e758412e6f398e3d6162c30c7a5b3c21e5af42ce0e2faab8e`).

**inspector_page_agent.cc** — `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/inspector_page_agent.cc?format=TEXT` ·
HTTP 200 · wire 105 740 / decoded 79 304 · wire sha256 `9afbb2bdc4a3e8c203aa92b86801ddca6c11558d7a04820d8631c64312977f55` ·
decoded sha256 `1dd744b58227f8bfac00afdb153a9b71a451494178713a3ba8f14956af49a8cf`.

### Q12 — how `multiple` reaches the wire (5 words by `wc -w`)

> multiple ? protocol::Page::FileChooserOpened::ModeEnum::SelectMultiple : protocol::Page::FileChooserOpened::ModeEnum::SelectSingle,

Locator: `inspector_page_agent.cc` lines **1909–1910** (`InspectorPageAgent::FileChooserOpened`).
The `multiple` argument is supplied one call earlier by
`file_input_type.cc:203` — `probe::FileChooserOpened(document.GetFrame(), &input, input.Multiple(), …)` —
and `HTMLInputElement::Multiple()` is `FastHasAttribute(html_names::kMultipleAttr)`
(`html_input_element.cc:1817-1818`). **So the CDP `mode` is a direct read of the `multiple` content attribute.**

**Page.pdl** — `…/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT` ·
HTTP 200 · wire 82 548 / decoded 61 911 · wire sha256 `0823829b68ca3857c4e69a833863b23c6e8cca686c3dec8b4667c98a8a2dfc30` ·
decoded sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`.

### Q13 — the wire enum (4 words by `wc -w`)

> enum mode selectSingle selectMultiple

Locator: `Page.pdl` lines **1299–1302**, inside `event fileChooserOpened`.

### Q14 — the wire node id (4 words by `wc -w`)

> experimental optional DOM.BackendNodeId backendNodeId

Locator: `Page.pdl` lines **1303–1304**, immediately under the mode enum. The preceding doc line (1303) reads:
`# Input node id. Only present for file choosers opened via an \`<input type="file">\` element.` (14 words).

**Conclusion for (2):** the `multiple` content attribute is the *only* thing that distinguishes
`selectMultiple` from `selectSingle` in the `Page.fileChooserOpened` event, and the counter's `mode-law`
(which derives the expected mode from the page-measured `multiple` flag in `fixtureInputs`) is therefore
source-grounded, not a guess. The scored receipt confirms it: `sp83-multiple-mode` recorded
`{"mode": "selectMultiple", "backendNodeId": 12}` while every other answer leg recorded `"selectSingle"`.

---

## 3. CDP `DOM.setFileInputFiles` parameters at tag `155.0.8059.84`

**URL:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT`
**HTTP status:** 200 · **wire bytes:** 46 100 (base64) / **decoded bytes:** 34 575 ·
**wire sha256:** `8fc257c54f6475c27f52a7c4656dda98b24c41381edf0ea729c8a6e948301c2d` ·
**decoded sha256:** `50c460459e502a0a75a07de32e0589126c737a62f14c6b969df73009f958f702`
(Note: `?format=TEXT` returns base64; the decoded file is the actual PDL source.)

### Q7 — parameters, part 1 (22 words by `wc -w`)

> command setFileInputFiles parameters # Array of file paths to set. array of string files # Identifier of the node. optional NodeId nodeId

Locator: `DOM.pdl` lines **681–687**.

### Q8 — parameters, part 2 (20 words by `wc -w`)

> # Identifier of the backend node. optional BackendNodeId backendNodeId # JavaScript object id of the node wrapper. optional Runtime.RemoteObjectId objectId

Locator: `DOM.pdl` lines **688–691**.

Together: **one required `files: array of string`, and three mutually-exclusive node selectors
(`nodeId`, `backendNodeId`, `objectId`), each declared `optional`.**

### The handler decides the rest — `inspector_dom_agent.cc`

**URL:** `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc?format=TEXT`
**HTTP status:** 200 · **wire bytes:** 170 680 / **decoded bytes:** 128 010 ·
**wire sha256:** `16f1aa640f835ac00cb4ef4bb4788083f48482e50ec3efa9093b5ccd9fb98769` ·
**decoded sha256:** `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f`.

### Q9 — the C++ signature (11 words by `wc -w`)

> protocol::Response InspectorDOMAgent::setFileInputFiles( std::unique_ptr<protocol::Array<String>> files, std::optional<int> node_id, std::optional<int> backend_node_id, std::optional<String> object_id) {

Locator: `inspector_dom_agent.cc` lines **1795–1799** (whitespace collapsed across the 5-line signature).

The handler body (`inspector_dom_agent.cc:1800-1817`) adds three facts the PDL does not state, and all three
matter to the r83 answer legs:

1. `AssertNode(node_id, backend_node_id, object_id, node)` (line 1802) resolves the node and, if **none** of the
   three selectors is given, fails with `"Either nodeId, backendNodeId or objectId must be specified"`
   (line 656-657) — so "all three optional" in the PDL means *at least one required* in practice.
2. The node must be an `<input type=file>`: `FormControlType() != FormControlType::kInputFile` ⇒
   `"Node is not a file input element"` (lines 1807-1810). The r83 answer legs therefore can only target
   file inputs — consistent with the fixture.
3. The answer is delivered by `To<HTMLInputElement>(node)->SetFilesFromPaths(paths)` (line 1815) →
   `HTMLInputElement::SetFilesFromPaths` (`html_input_element.cc:2613-2615`) →
   `FileInputType::SetFilesFromPaths` (`file_input_type.cc:535-559`), which:
   - returns immediately on an **empty** `paths` array (line 536-537);
   - routes to `SetFilesFromDirectory` when `webkitdirectory` is present (539-542);
   - and otherwise **keeps only `files[0]` unless the input carries `multiple`** (549-557).

**Consequence for the r83 legs:** the `multiple`-mode leg (`sp83-multiple-mode`, target `m`, `multiple` set)
would accept *N* files; the other answer legs (targets `k`, `s`, `d`) accept exactly one. The frozen law
`multiple-mode-law` asserts `arr(mm.answer.setParams.files).length === 1` — i.e. the r83 leg exercises the
`multiple` **mode** (`selectMultiple`) but **not** the multi-file retention branch. That is a legitimate,
narrow law; it is not a claim that the multiple-retention path was measured.

### `backendNodeId` resolution — the id space is shared, and that is what makes the second-chooser law work

`AssertNode` resolves a `backendNodeId` via `DOMNodeIds::NodeForId(backend_node_id.value())`
(`inspector_dom_agent.cc:646`), and `Page.fileChooserOpened`'s `backendNodeId` is produced by
`element->GetDomNodeId()` (`inspector_page_agent.cc:1911`), which is the *same* `DOMNodeId` space
(`IdentifiersFactory::IntIdForNode` → `node->GetDomNodeId()`, `identifiers_factory.cc:119-121`;
`DOMNodeIds::NodeForId` → `IdToNodeMap().find(id)`, `dom_node_ids.cc:69-78`).

**Therefore: the `backendNodeId` carried by a `Page.fileChooserOpened` event is exactly the id you pass to
`DOM.setFileInputFiles` to answer that chooser.** The r83 driver uses precisely that
(`chrome-cdp-showpicker-round83.mjs:545` and `:556`: `backendNodeId: ev.params.backendNodeId`).

---

## 4. Second-chooser answering — what the sources say, and what they cannot say

This is the third element of the milestone and the one with the sharpest edge.

### What the source guarantees

`DOM.setFileInputFiles` addresses **the element**, not the chooser. Its parameters are `files` plus a *node*
selector; there is **no chooser handle, no chooser index, and no chooser id** anywhere in the command or in the
`Page.fileChooserOpened` event (whose whole parameter set is `frameId`, `mode`, `backendNodeId` — `Page.pdl:1296-1304`).
`FileInputType::SetFilesFromPaths` then *sets the element's file list directly* and dispatches `input` + `change`
(`file_input_type.cc:501-503` → `SetFilesAndDispatchEvents`).

**Consequence:** when a second chooser opens on the same input, the two `Page.fileChooserOpened` events carry the
**same** `backendNodeId` (same element ⇒ same `DOMNodeId`), and there is no protocol-level way to say
"answer the second one". The answer is therefore attributed by **bytes**: the answer that lands is identified by
*what* it delivered, not by *which* chooser event it was paired with.

### What the sources do **not** say

Nothing in the spec or in Chromium ties an answer to a *specific* chooser instance. The spec's only
concurrency hook is permissive:

### Q9-spec — the "prior execution" clause (11 words by `wc -w`)

> Optionally, wait until any prior execution of this algorithm has terminated.

Locator: raw HTML line 5860 (§4.10.5.4 → "show the picker, if applicable" → File Upload step, the first sub-step).
"Optionally" — the spec leaves it to the user agent whether a second picker may open while a first is pending.
Chromium opens it (the `click-while-open` and `second-chooser-answer` legs both observe two chooser events).

### The scored receipt, read directly

`sp83-second-chooser-answer` (target `s`, a non-`multiple` file input):
- `clickWhileOpenChoosersBefore: 1`, `clickWhileOpenChoosersAfter: 2` — a second chooser really opened;
- `firstChooserBackendNodeId: 12` and `secondChooserBackendNodeId: 12` — **identical**, as the id-space analysis
  above predicts;
- the answer was `DOM.setFileInputFiles { files: […/tabi-r83-second.txt], backendNodeId: 12 }`;
- `stateAfter.s = [["tabi-r83-second.txt", 28, "text/plain", ""]]` and `sValue = "C:\\fakepath\\tabi-r83-second.txt"`.

The delivered bytes (`tabi-r83-second.txt`, sha256 `6c386abf…`, hex `746162692d7238332d7365636f6e642d6174747269627574696f6e0a`)
are distinct from every other leg's upload, so the attribution is unambiguous *by content*.

### The honest limit of the law — matching the counter's own stated limit

The counter's `second-chooser-answer-law` requires `sc.firstChooserBackendNodeId === sc.secondChooserBackendNodeId`
and then checks the delivered bytes. That is the strongest thing the protocol allows: **the r83 leg proves that
answering an ambiguous, id-shared second chooser delivers the intended bytes.** It does **not** prove the
answer was routed to the *second* chooser rather than the first — that distinction does not exist in CDP.
The frozen claim text in `claims.json` says exactly this (`"second-chooser answer is byte-attributed, id shared"`),
and the r83 driver picks the **last** chooser event (`evs.slice(-1)[0]`, `chrome-cdp-showpicker-round83.mjs:544`),
which is the strongest available choice. **The claim and the mechanism agree; no amendment needed.**

---

## 5. Attack findings (coverage axis) — things a reader should know, none of which I propose changing

These are *observations about coverage*, reported because the axis is judged on coverage. Nothing here amends
the predicate, counter, pins, priors, thresholds or kill rule.

### 5.1 The `accept` claim says MIME; the fixture exercises only the **extension** token

`claims.json` C1 names the leg *"accept-MIME .png PNG answer"*. The counter's own comment says the leg probes
*"the accept token grammar: extension vs MIME vs image/\*"* — but the leg's target is fixture input **`k`**,
and the scored `fixtureInputs` records **`k.accept = ".png"`**, an **extension** token. The only
`accept="image/png"` input in the whole fixture is the **child-page** input `id="accept"`
(`chrome-cdp-showpicker-round83.mjs:133`), and no leg ever targets it (the child legs target
`dt`/`dtd`/`co`/`mo`/`wk`/`tm`/`nu`/`rg` only).

So the **MIME-token** and **`image/*`** branches of the `accept` grammar are **not exercised by r83**. The
spec has three token forms (§4.10.5.3.1): `audio/*`, `video/*`, `image/*`, a MIME type, and a leading-dot
extension. Chromium splits them into two lists — `CollectAcceptTypes` = `input.AcceptMIMETypes()` +
`input.AcceptFileExtensions()` (`file_input_type.cc:62-71`) — and r83 reaches only the extension half.

**Verdict:** the leg's *measured* content (a real PNG is accepted into an `accept=".png"` input and its bytes
are delivered) is true and worth having, but the law's framing ("MIME") overstates what was measured. This is
the one place where the claim text and the fixture diverge, and it is the natural place to spend the next
generation's budget. **Recommendation to the integrator: not an amendment to r83 — a coverage note for r84.**

### 5.2 The frozen `order-law` is a Chromium law, not a spec law

The spec's `showPicker()` order is **mutability first, origin second** (Q15 at raw line 5831 precedes the
SecurityError step at 5832). Chromium's implementation checks the **origin first**
(`html_input_element.cc:2657-2664` precedes the `isMutable()` check at 2666-2671), which is why the disabled
cross-origin input yields `SecurityError` while the disabled same-origin input yields `InvalidStateError`
(`check-showpicker-r83.mjs:529-533`). Both behaviours are *conforming* (the spec's ordered list is normative,
but
Chromium's divergence is a known long-standing one), so the frozen law is a faithful measurement of Chromium —
it is simply not a measurement of the spec. The counter's own failure message says so: *"Chromium checks the
origin first"*. No change proposed; recorded so the claim's provenance is unambiguous.

### 5.3 The `number`/`range` legs add type constants, not a new mechanism

See §1. They are honest coverage additions to the cross-origin leg family, but they are the same code path as
the r82 `date`/`month`/`week`/`time` legs (Q10 shows `number`/`range` take the identical non-exempt branch).
No independent mechanism is exercised.

### 5.4 The `multiple` leg exercises the *mode*, not the multi-file retention branch

See §3: `SetFilesFromPaths` keeps only `files[0]` unless `multiple` is set; the leg answers with exactly one
file, so the retention branch (`file_input_type.cc:549-557`) is never taken with N>1. The `mode:
selectMultiple` half *is* genuinely new coverage (the counter notes no earlier leg targeted a `multiple`
input).

### 5.5 Brief/none note on the digests identities in the brief vs. the frozen claims

The brief names base `4cdf4def31b1feecb6aed5dbfc048c47d41ec88d` and digests commit `D = 9d90392aca79…`.
The frozen artefacts in the lane name different identities: `claims.json` records `base
518f6b84c56153798ba75316e870db78ae6877d9` and `digestsCommit b6496e6f5d4f0fda40e8bafc366f872cdd363400261282a80d391f034856ee40`,
and `sha256(.ufo/waves/round-83/freeze.txt) = b6496e6f5d4f0fda40e8bafc366f872cdd363400261282a80d391f034856ee40`
exactly — i.e. `claims.json.digestsCommit` is the **sha256 of `freeze.txt`**, not a git commit id (no git object
with that name exists). `9d90392aca79` is the digest stamp named in commit `5d6c34f0`'s message
(`round-83: generation r83 + calibration drift, scored 74/84/50 (D 9d90392aca79)`); the current `HEAD` is
`615c97a1`, whose message names `D b6496e6f5d4f`. Both of the brief's ids are real objects/events in the lane's
history, just one amendment behind. I re-derived all six frozen pins from the working tree and **all six match
`freeze.txt` byte-for-byte**:

```
4d0343b5e0798cbe5367e9a64e7ce8dd58b465f7961e2cf5d514fc4fe55e470f  scripts/check-record-drift-r83.mjs
7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841  scripts/check-showpicker-r83.mjs
70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce  scripts/chrome-cdp-showpicker-round83.mjs
09c2202d55d6f9e05c9d1286de74f77aeba463ecc0d36a2759f64d9b251a0e1e  scripts/kill-power-r83.mjs
12c09cc15a4602c77faf7624d4556eb964545cf3a6277990c8a49ae89bd4a817  scripts/negatives-showpicker-r83.mjs
2d922c84ab9d1d3e3303f164c8162bb512d6325788e8d48b044ad3fe1d0afe28  scripts/selftest-r83-gates.mjs
```

Also noted for the record: the scored receipt's `nonce` is `tabi-r83-l1-c016710129da` while `claims.json`'s
wave nonce is `tabi-r83-l1-b6496e6f5d4f` and the brief's is `tabi-r83-l1-9d90392aca79`; the receipt's
`driverSha256` is `70b522cc…`, which equals the frozen `chrome-cdp-showpicker-round83.mjs` pin. The nonce
differs because the nonce is minted per run. `.ufo/waves/round-83/scored/counter-a.json` reports
`verdict: clean`, `checkCount: 74`, `findings: []`.

---

## 6. Source table (URL · status · bytes · sha256 · locator · quote · word count)

| File | URL | Status | Bytes (wire/decoded) | sha256 (wire / decoded) | Locator | Quote | wc -w |
|---|---|---|---|---|---|---|---|
| `whatwg-input.html` | `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687 515 / 687 515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` (both) | §4.10.5.4, raw line 5832 | Q1 | **18** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.4 note, raw line 5838 | Q2 | **20** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.4 IDL summary, raw line 5608 | Q3 | **21** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.4 step 1, raw line 5831 | Q15 | **10** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.4 picker step, raw line 5864 | Q4 | **24** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.1.17, raw line 4027 | Q5 | **20** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.3.5, raw line 4989 | Q6 | **22** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.4 picker step, raw line 5860 | Q9-spec | **11** |
| `whatwg-input.html` | same | 200 | — | — | §4.10.5.3.1, extracted line 01483 | Q16 | **20** |
| `cdp_DOM.pdl` | `…/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT` | 200 | 46 100 / 34 575 | `8fc257c5…` / `50c46045…` | DOM.pdl 681–687 | Q7 | **22** |
| `cdp_DOM.pdl` | same | 200 | — | — | DOM.pdl 688–691 | Q8 | **20** |
| `cdp_inspector_dom_agent.cc` | `…/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc?format=TEXT` | 200 | 170 680 / 128 010 | `16f1aa64…` / `e7c983b4…` | 1795–1799 | Q9 | **11** |
| `cdp_html_input_element.cc` | `…/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT` | 200 | 135 428 / 101 570 | `81b35d96…` / `405b52c7…` | 2657–2664 | Q10 | **23** |
| `cdp_file_input_type.cc` | `…/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT` | 200 | 31 220 / 23 415 | `7e9e6377…` / `f96265db…` | 218–219 | Q11 | **6** |
| `cdp_inspector_page_agent.cc` | `…/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/inspector_page_agent.cc?format=TEXT` | 200 | 105 740 / 79 304 | `9afbb2bd…` / `1dd744b5…` | 1909–1910 | Q12 | **5** |
| `cdp_Page.pdl` | `…/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT` | 200 | 82 548 / 61 911 | `0823829b…` / `e944a3b1…` | 1299–1302 | Q13 | **4** |
| `cdp_Page.pdl` | same | 200 | — | — | 1303–1304 | Q14 | **4** |
| `cdp_file_chooser.mojom` | `…/tags/155.0.8059.84/third_party/blink/public/mojom/choosers/file_chooser.mojom?format=TEXT` | 200 | 7 676 / 5 755 | `eddd10d4…` / `71878354…` | `FileChooserParams.Mode` | (enum) | — |
| `cdp_dom_node_ids.h` / `.cc` | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/dom/dom_node_ids.{h,cc}?format=TEXT` | 200 | 1 588 / 1 189 · 2 776 / 2 081 | `8488bd6b…`/`83f63b18…` · `565f484a…`/`33f40333…` | `NodeForId` | (id space) | — |
| `cdp_identifiers_factory.cc` | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/identifiers_factory.cc?format=TEXT` | 200 | 7 404 / 5 551 | `77bb7bd3…`/`8d8ee04e…` | 119–121 | (id space) | — |
| `cdp_file_chooser.h` / `.cc`, `cdp_input_type_view.cc` | `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/{file_chooser.h,file_chooser.cc,input_type_view.cc}?format=TEXT` | 200 | 6 424 / 4 818 · 7 936 / 5 950 · 11 136 / 8 351 | `da6a17a5…`/`1c24816c…` · `91e05406…`/`1f203063…` · `7a1d1448…`/`c382c7c1…` | (context) | — | — |

Full digests for every row are in `.ufo/waves/round-83-seats/R83Scout/sources/FETCH.txt`.

**Negative-path probes recorded in `FETCH.txt` (all HTTP 404 at this tag — the obvious paths are *not* where
these files live, which is why the fetch manifest records the probes):**
`third_party/blink/renderer/core/inspector/inspector_protocol.pdl` · `…/inspector/inspector_file_chooser.cc` ·
`third_party/devtools-protocol/pdl/domains/DOM.pdl` · `third_party/blink/renderer/core/file/file_chooser.h` ·
`third_party/blink/renderer/platform/filechooser/file_chooser.cc`.
The live protocol lives under `third_party/blink/public/devtools_protocol/domains/*.pdl`; the file-chooser
implementation lives under `third_party/blink/renderer/core/html/forms/file_chooser.{h,cc}`.

---

## 7. Confidence and remaining unknowns

**High confidence (byte-verified, quote-exact, counts reproduced):**
- the exemption set {File Upload, Color} and its Chromium mirror (Q1–Q3, Q10);
- `multiple` → `kOpenMultiple` → CDP `mode: selectMultiple`, and that `multiple` is the *only* discriminator
  (Q4–Q6, Q11–Q13);
- the `DOM.setFileInputFiles` parameter set and the three handler-level constraints the PDL omits
  (Q7–Q9);
- the shared id space that makes a `backendNodeId` from `Page.fileChooserOpened` answerable by
  `DOM.setFileInputFiles` (§3, §4).

**Medium confidence / inference (labelled as such):**
- that the r83 `number`/`range` legs exercise no new mechanism (§5.3) — inference from Q10 plus the fixture's
  type constants, not a measurement;
- that the spec's `accept` MIME/`image/*` token branches are unexercised in r83 (§5.1) — inference from the
  fixture inputs and the leg targets, corroborated by `fixtureInputs` in the receipt.

**Unresolved gaps (not reachable with the tools in this seat):**
- whether Chromium's *origin-before-mutability* ordering is a conformance divergence the W3C has ever ruled on
  — the WHATWG issue link cited in the Chromium source
  (`https://github.com/whatwg/html/issues/6909#issuecomment-917138991`) was not fetched; it is cited here only
  as Chromium's own comment, not as a verified upstream ruling.
- the spec-side rule for *multiple* pickers opened concurrently is only "Optionally, wait until any prior
  execution of this algorithm has terminated." — permissive, so there is no spec text to bind the
  second-chooser law to beyond Q9-spec.
- no `accept="image/png"` (MIME-token) leg exists anywhere in r83, so the MIME-token acceptance branch is
  asserted by no law; closing that is a future generation's work, not a repair of r83.

---

## 8. Tooling

**No tool was installed, upgraded, or removed for this seat.** All work used the pre-installed
`curl`, `python3`, `base64`, `sha256sum`, `wc` (channels: system packages already present; `uv tool`/`npm -g`
were not used, and no `pacman` transaction was performed — the PACMAN GUARD was respected and no L0 question
was needed). The `?format=TEXT` googlesource endpoints return base64; every Chromium source in `sources/` is
stored **decoded**, with the wire (base64) sha256 preserved in `FETCH.txt` so the fetch is reproducible byte-for-byte.

**Housekeeping:** the seat scratch root `/fast/scratch/hyaku/tabi-r83/R83Scout/` was used for the fetch script
and the spec-text extractor and has been **deleted**; the receipt copy was written into the seat directory
*before* the scratch removal, as required. Nothing was written into `.ufo/waves/round-83/` (claims, freeze,
controls, census, scored) or into `corpus/evidence/round83/`. No git or jj command that mutates state was run
anywhere; `git` was used read-only (`cat-file -t`, `log`, `show`) to check that the brief's commit ids exist.
