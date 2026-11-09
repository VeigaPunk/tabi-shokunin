# R95Scout — C1 source reconnaissance (shadow-tree ids and the CDP contract)

Seat: R95Scout (scout, leaf, read-only). Claim: C1 `chromium-oopif-backendnode-misdelivery-linux`,
predicate `C1-BACKENDNODE-MISDELIVERY-R95`. Milestone: sources. Fetched 2026-11-08.
Tag: Chromium `155.0.8059.84` (tag value `5869fe313571d75152b77813cf0a4ee26a4e6df0`).
Receipt with every digest and anchor: `.ufo/waves/round-95/w1/R95Scout-sources.json`.
No instrument run, no Chromium started, no lane file edited, no tool installed.

## 0. Instrument bytes (verified first)

`sha256sum` of the committed instruments matches the contract: driver `24947b00…2ee82`, counter
`b7b464da…2775`, battery `1a670da5…abf0` (full digests in the receipt). Staged
`sources/file_input_type.cc` is `f96265db…8ee9f705` (650 lines), matching `sources/sha256.txt`.

## 1. S235 re-opened: UA shadow button and span

Fetch of `…/core/html/forms/file_input_type.cc?format=TEXT` at the tag, `base64 -d`: decoded sha256
`f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`, 650 lines. **Equal to the staged copy.**

Lines 384-411, `FileInputType::CreateShadowSubtree()`:
- 388-389 `button` = `HTMLInputElement` with `setType(kButton)`
- 395 `SetShadowPseudoId(kPseudoFileUploadButton)`
- 396-397 `setAttribute(html_names::kIdAttr, shadow_element_names::kIdFileUploadButton)`
- 399 `GetElement().UserAgentShadowRoot()->AppendChild(button)`
- 401-402 `span = document.CreateRawElement(kSpanTag)`, appended to the same UA shadow root
- 407-410 both `aria-hidden`; `UpdateView()`

The S235 anchors (396-397, 402) are correct. The id string is only a symbol here; its value is in
`shadow_element_names.json5` (§5B).

## 2. Pierced DOM.getDocument includes UA shadow roots (S231)

Fetch of `…/core/inspector/inspector_dom_agent.cc?format=TEXT`: decoded sha256
`e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f`, 3642 lines. **Equal to the S231 row prefix.**

Lines 2588-2594, inside `InspectorDOMAgent::BuildObjectForNode`:
> `if (ShadowRoot* root = element->GetShadowRoot()) {` … `value->setShadowRoots(std::move(shadow_roots));`

The block is **not gated by `pierce`**; `pierce` only sets the depth passed in (`pierce ? depth : 0`, 2592).
`getDocument` passes `pierce.value_or(false)` (790-791). Iframe content documents are attached the same way
(2577-2578). So `pierce:true` includes the UA shadow root; the driver walks `shadowRoots`
(`scripts/chrome-cdp-backendnode-misdelivery-round95.mjs`, `snapshotStats`).

Precision note (source-scoped inference, not measured): the same code attaches the UA shadow-root node under
`pierce:false` at depth 0, with no children. The frozen claim uses `pierce:true` only.

Id minting in the same function: node id bound at 2518; `backendNodeId` set at 2546 via
`IdentifiersFactory::IntIdForNode(node)`. Each id is minted when its node is serialized, so the snapshot order
numbers nodes not yet numbered (the S234 point).

## 3. Lookup and error texts (S231 + S232)

- `AssertNode(backendNodeId)` → `DOMNodeIds::NodeForId`; lines 645-648:
  > `ServerError("No node found for given backend id")`
- `setFileInputFiles` 1795-1809, `AssertNode` at 1802; line 1809:
  > `ServerError("Node is not a file input element")`
- `describeNode` uses the same `AssertNode` (3435).
- `dom_node_ids.cc` at the tag (re-read): `g_last_id` (18), `NextId` (21-26), `IdForNode` (48-61),
  `NodeForId` (69-78). One process-static counter and one process-static map, so the same integer can name
  different nodes in an OOPIF and its parent renderer. Source-scoped; the misdelivery itself is the measured fact.

## 4. CDP protocol text

Pin: `ChromeDevTools/devtools-protocol` tag `v0.0.1734725`, commit `b0d96c6cdf39e5583e67a3762b2815a33154455b`
(committed 2026-11-04T04:37:44Z). Upstream `pdl/domains/DOM.pdl` and the Chromium-tag `DOM.pdl` are both
`50c460459e502a0a…9f958f702`: **byte-identical**, and the S222 row prefix.

DOM.pdl quotes:
- lines 21-23, `BackendNodeId`:
  > "Unique DOM node identifier used to reference a node that may not have been pushed to the front-end."
- line 681, `setFileInputFiles`: "Sets files for the given file input element."
- line 688, parameter: "Identifier of the backend node." with `optional BackendNodeId backendNodeId` (689)
- lines 393-394, `getDocument` `pierce`: "Whether or not iframes and shadow roots should be traversed when returning the subtree (default is false)."

**Not in the protocol text:** nothing scopes a `BackendNodeId` to a target, session or renderer. The claim's
"page-session `describeNode(B)` acts on T" is a measured observation plus S232/S234 source; the critics should not
cite the protocol for it.

**JSON trap:** the Chromium-tag `browser_protocol-1.3.json` and upstream `json/browser_protocol.json` differ in 20
DOM command descriptions (e.g. `getDocument` loses "Implicitly enables the DOM domain events…" in the Chromium
JSON). The `.pdl` files agree. Cite the `.pdl`. Upstream `browser_protocol.pdl` has one extra include
(`domains/FindInPage.pdl`) versus the tag; DOM is unaffected.

## 5. Candidate rows (against `corpus/QUALITY.md`)

Criteria used: 2 (located source), 3 (observation vs inference), 4 (append-only errata), 12 (tier A/B),
33 (superseding rows remove the premise from every cell).

**A. S231 extension** — `inspector_dom_agent.cc` @155.0.8059.84, lines 2588-2594 (shadowRoots emitted from
`BuildObjectForNode`, not gated by `pierce`). **ADMIT** as a new row (tier A, kind code). Teaches that a pierced
snapshot carries a node's UA shadow root in `shadowRoots`, where the file input's button and span sit. S231's
anchors (645-648, 1809) do not cover 2588-2594. S231 is narrower, not wrong: add a row, do not edit it (criterion 4).

**B. `shadow_element_names.json5`** — `…/core/html/shadow/shadow_element_names.json5` @155.0.8059.84, decoded sha256
`3dbf31910131a058339b95c43741e2340f9986b229293ef77184de6668d88198`, 210 lines. **ADMIT** (tier A, kind code).
Lines 85-86 `name: "file-upload-button", Symbol: "kIdFileUploadButton"`; lines 118-119
`name: "-webkit-file-upload-button", Symbol: "kPseudoFileUploadButton"`. Teaches the literal id string that S235
names only by symbol; closes the gap under the plan's "id file-upload-button".

**C. `html_input_element.cc`** — `…/core/html/forms/html_input_element.cc` @155.0.8059.84. **ADMIT** (tier A, kind code).
Lines 1721-1724 `EnsureShadowSubtree()` (`CreateShadowSubtreeIfNeeded()`, then `return UserAgentShadowRoot();`);
lines 1962-1964, on connect: `scheduled_create_shadow_tree_ = true; ScheduleShadowTreeCreation`. Teaches that the UA
subtree is created at connect (scheduled), before serialization. Source-scoped; scheduling timing is not measured.

**Rejected (not new rows):**
- Upstream `devtools-protocol` `DOM.pdl` at v0.0.1734725: byte-identical to the tag `DOM.pdl` already in S222
  (`50c460459e50`). Duplicate; record the pin under S222 if wanted.
- `element.cc` @155 `Element::UserAgentShadowRoot()` (7980-7984): true, but duplicates S231's teaching.

**Open point (INFERENCE):** S235's "consecutive parent file inputs are 4 ids apart" is plausible from source (input
mint at 2546, shadow-root mint on the 2588 path, button and span in the UA container = 4 mints). A text child of the
span would add a fifth mint before the next input unless minted later; I did not verify where it is minted. S235
should carry this as [INFERENCE] until checked.

## 6. Verdict on the frozen wording (source side only)

- UA button id `file-upload-button` and span under the file input's UA shadow root: supported (§1, §5B).
- Pierced `getDocument` includes the UA shadow root: supported (§2); not gated by `pierce`, so no wording change.
- Page-session `describeNode(B)` and `setFileInputFiles(B)` use the same renderer map and the two exact error
  texts: supported (§3).
- Protocol text quoted (§4). It says nothing about session scope; the claim does not rely on it for that.

No premise is contradicted. I did not re-derive scored counts or re-read the leg statements; the scored receipt
`corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json` is cited by the L1 and not re-read here.
Tooling: none installed. Chromium: not run. Scratch `/fast/scratch/hyaku/tabi-r95/R95Scout` removed after writing.

VERDICT C1: neutral
