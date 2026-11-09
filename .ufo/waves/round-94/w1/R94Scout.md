# R94Scout — sources for C1 (round 94, w1)

Seat: R94Scout (source scout). Scope: re-open the Blink sources C1 leans on at tag `155.0.8059.84`,
locate the sentences, and report what the source evidence does and does not settle.

Report: .ufo/waves/round-94/w1/R94Scout.md
Fetched bytes: .ufo/waves/round-94/w1/R94Scout-sources/ (12 files; sha256 in §1)

Tooling: no installs, no upgrades (nothing needed beyond `curl`, `base64`, `sha256sum`, `python3`).
No Chromium was launched by this seat (no port triple assigned to R94Scout), so **no leg-level
statement was tested here** and no receipt is cited.

## 1. Freshness — re-open vs the lane's staged bytes

Fetch path A: `?format=TEXT` per file (base64 → decode). Fetch path B: gitiles `+archive` tarball of
the same directory, extracted independently. Both paths agree byte-for-byte on all 12 files below.

| file | sha256 (decoded) | path A time (`date -Is`) | path B | lane staged sha256 | match |
|---|---|---|---|---|---|
| `core/inspector/identifiers_factory.cc` | `8d8ee04ee5253f701bdd0d642ab1e7abade7a645c72f19d31203466ca79ed3bb` | 2026-11-08T22:08:11-03:00 | `x_core_inspector/` | `sources/sha256.txt` = same | YES |
| `core/dom/node.cc` | `1fa7935829ce6d568b26d8a5148899396af1119c96a5809bbecef48b5ce1cfd3` | 2026-11-08T22:08:31-03:00 | `x_core_dom/` | `sources/sha256.txt` = same | YES |
| `core/dom/dom_node_ids.cc` | `33f40333b67fb9a00071dcd69131671ac007da23c3755f0c2777bcbdb4d40e3b` | 2026-11-08T22:06:25-03:00 | `x_core_dom/` | r93 S232 `33f40333b67f` | YES |
| `core/inspector/inspector_dom_agent.cc` | `e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f` | 2026-11-08T22:06:45-03:00 | `x_core_inspector/` | r93 S231 `e7c983b4b00f` | YES |
| `core/layout/layout_text.cc` | `61af7222f4d1254726eec736699d8997684b49788f07ed40148153dc82d54b42` | 2026-11-08T22:13:39-03:00 | `x_core_layout/` | not staged | — |
| `core/layout/layout_object.cc` | `80645efdffa105df9e41d6f5521d91f5221bb2c1f0dafbe8ad9afcd9ef7c34be` | 2026-11-08T22:14:04-03:00 | `x_core_layout/` | not staged | — |
| `core/paint/text_fragment_painter.cc` | `c71348941650c88bbe6a123071838289d068514235231b768360086238f9d096` | 2026-11-08T22:11:07-03:00 | `x_paint/` | not staged | — |
| `core/paint/paint_property_tree_builder.cc` | `80402fc808fc93430d3a7ecb8505f0d105071c861c7346d799254dbe05cd2640` | 2026-11-08T22:11:03-03:00 | `x_paint/` | not staged | — |
| `platform/graphics/paint/paint_controller.cc` | `1bb26ae41c2d1e80259e8c9548698282125db278cfafa9361ff19b1b1d1bb919` | 2026-11-08T22:13:43-03:00 | `x_platform_graphics_paint/` | not staged | — |
| `core/frame/local_frame.cc` | `f314885f156e923a88eed7087b00c99aa0f55d13787aebb15398fc88fa5a9d7f` | 2026-11-08T22:07:35-03:00 | `x_core_frame/` | not staged | — |
| `core/dom/node-inl.h` | `ea81d8541ae96d922f5f4cbb1442a4498a346bf2d79ea257d8737e4c1bd7ef08` | 2026-11-08T22:07:43-03:00 | `x_core_dom/` | not staged | — |
| `platform/graphics/dom_node_id.h` | `d79a3121c5184465ebbd91d17cb5b93960050e5ef38aa700f4111518f5ab3351` | 2026-11-08T22:07:39-03:00 | `x_platform_graphics/` | not staged | — |

Bytes are staged for the L1 at `.ufo/waves/round-94/w1/R94Scout-sources/` (12 files, same names).
Base64 lengths: identifiers_factory 7,404→5,551 B; node 192,152→144,114 B; dom_node_ids 2,776→2,081 B;
inspector_dom_agent 170,680→128,010 B; layout_text 71,724→53,792 B; layout_object 278,416→208,810 B;
text_fragment_painter 48,856→36,640 B; paint_property_tree_builder 288,348→216,261 B;
paint_controller 44,928→33,696 B; local_frame 240,040→180,028 B; node-inl 8,180→6,133 B;
dom_node_id 864→648 B. **No drift at the tag: the lane's `sources/sha256.txt` is reproduced exactly.**

## 2. The four located sentences the frozen predicate rests on

Base URL for all: `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/`

1. `core/inspector/identifiers_factory.cc` **lines 119–121** (quote, 7 words by `wc -w`):
   `int IdentifiersFactory::IntIdForNode(Node* node) { return node->GetDomNodeId(); }`
2. `core/dom/node.cc` **lines 354–356** (quote, 6 words):
   `DOMNodeId Node::GetDomNodeId() { return DOMNodeIds::IdForNode(this); }`
3. `core/inspector/inspector_dom_agent.cc` **lines 645–649**, `AssertNode` backendNodeId branch
   (quote, 15 words):
   `node = DOMNodeIds::NodeForId(backend_node_id.value()); return !node ? protocol::Response::ServerError("No node found for given backend id") : protocol::Response::Success();`
4. `core/inspector/inspector_dom_agent.cc` **line 1809**, `setFileInputFiles` (quote, 8 words):
   `return protocol::Response::ServerError("Node is not a file input element");`
   (context lines 1800–1810: `AssertNode(...)` first, then `DynamicTo<HTMLInputElement>(node)` and
   `FormControlType() != FormControlType::kInputFile` → the error.)
5. `core/inspector/inspector_dom_agent.cc` **line 2546**, inside `BuildObjectForNode` (starts line 2509;
   quote, 1 word): `.setBackendNodeId(IdentifiersFactory::IntIdForNode(node))`
   (⇒ a CDP node record's `backendNodeId` is the node's own DOM node id, not a DevTools-side counter.)
6. `core/dom/dom_node_ids.cc` **line 18** (4 words) `DOMNodeId g_last_id = 0;` and **line 25** (2 words)
   `return ++g_last_id;` inside `NextId()`; `IdForNode` **lines 48–61** (quote, 12 words):
   `DOMNodeId& id = node->EnsureNodeID(base::PassKey<DOMNodeIds>()); if (id == kInvalidDOMNodeId) { id = NextId();`
   ⇒ one process-static counter + one process-static map per renderer process (S232 re-confirmed).

Consequence, source-level only: `DOMNodeIds::NodeForId` is a lookup in *this renderer's* map, so the same
integer names unrelated nodes in two renderer processes. That is exactly the surface the C-arm collision
and the M-arm miss exercise; the *runtime* facts (which id wins in which leg) are the driver's, not the
source's.

## 3. Who else can mint a DOM node id while painting (item 3)

Located call site that mints during painting — `core/paint/text_fragment_painter.cc` **line 747**, inside
`TextFragmentPainter::Paint` (starts line 336), quote (3 words):
`node_id = layout_text->EnsureNodeId();`
→ `core/layout/layout_text.cc` **lines 1430–1441**, `LayoutText::EnsureNodeId`, quote (3 words) at
**line 1436**: `node_id_ = node->GetDomNodeId();`
→ `node.cc:354-356` → `dom_node_ids.cc:48-61` → `NextId()` → `++g_last_id`.
URL: `.../core/paint/text_fragment_painter.cc` and `.../core/layout/layout_text.cc` (tag 155.0.8059.84).
**Gate (important, and it bounds the mechanism):** the mint inside `EnsureNodeId` runs only when
`GetOrResetContentCaptureManager()` is non-null; `core/frame/local_frame.cc` **lines 2423–2427**
(quote, 6 words): `if (!IsLocalRoot()) { return nullptr; }` and the manager is created only when
`Client()->GetWebContentCaptureClient()` is set (same function, lines 2435–2439). So paint-time minting
is conditional on content capture being active for that frame.

Two further paint-path mint sites, both located and both conditional:
- `core/paint/paint_property_tree_builder.cc` **line 852**, in
  `FragmentPaintPropertyTreeBuilder::UpdatePaintOffsetTranslation` (quote, 1 word):
  `object_.GetDocument().GetDomNodeId(),` — mints the *document's* id while the paint property tree is
  updated for a `LayoutView`.
- `platform/graphics/paint/paint_controller.cc` **lines 609–613**, `PaintController::RecordDebugInfo`
  (quote, 1 word at line 612): `client.OwnerNodeId(false)` → `core/layout/layout_object.cc` **line 2447**
  (quote, 6 words): `return GetNode() ? GetNode()->GetDomNodeId() : kInvalidDOMNodeId;` — i.e. when
  Blink records paint debug info it asks each display-item client for its owner node id, which mints ids.
  Gated on `record_debug_info_` (`paint_controller.h:143`, `SetRecordDebugInfo`).

**Depth note [INFERENCE — no driver run by this seat].** The pre-freeze probes in
`plans/round-94.md` §Pre-freeze probes record `probe1` (300 `display:none` empty spans) → B = 2 and a
`#document` collision, but `probe2` (300 *painted* `<span>x</span>`) → B = 302 and a miss: a delta of
exactly 300, one per painted text node. That is the size and shape the paint path above predicts
(one minted id per painted `LayoutText`, in the child's own counter), so the paint path is a candidate
mechanism for the child's counter running ahead of the parent's. It stays a candidate: the frozen claim
explicitly does not assert who minted B (§Declared limits 3), and I did not run the driver to separate
paint from accessibility/serialization/chooser minting.

## 4. Proposed SOURCES rows (lane shape, 11 columns; ids continue after S234)

Rows are proposals for the L1 — I did not edit `corpus/SOURCES.md`.

- **S235** | Blink `text_fragment_painter.cc` at tag 155.0.8059.84 — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/paint/text_fragment_painter.cc | code | A | scope: the paint-time call site that asks a layout text for its DOM node id, i.e. where painting can mint a backendNodeId | line 747 `node_id = layout_text->EnsureNodeId();` (fetched 2026-11-08 22:11 -03:00, 48,856 B base64 → 36,640 B, sha256 c71348941650c88; staged `.ufo/waves/round-94/w1/R94Scout-sources/text_fragment_painter.cc`) | painting a text fragment mints the text node's DOM node id when the frame has a content-capture manager, so painting can advance the renderer's id counter | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md
- **S236** | Blink `layout_text.cc` at tag 155.0.8059.84 — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/layout/layout_text.cc | code | A | scope: the body of the paint-time id mint and the condition under which it happens | lines 1430-1441 `DOMNodeId LayoutText::EnsureNodeId()` with line 1436 `node_id_ = node->GetDomNodeId();` (fetched 2026-11-08 22:13 -03:00, 71,724 B base64 → 53,792 B, sha256 61af7222f4d1254; staged `.ufo/waves/round-94/w1/R94Scout-sources/layout_text.cc`) | the mint is once per layout text and only when a content-capture manager exists for the frame, so paint-side id creation is conditional, not unconditional | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md
- **S237** | Blink `paint_property_tree_builder.cc` at tag 155.0.8059.84 — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/paint/paint_property_tree_builder.cc | code | A | scope: a second paint-path site that mints a DOM node id, this one the frame document's | line 852 `object_.GetDocument().GetDomNodeId(),` in `FragmentPaintPropertyTreeBuilder::UpdatePaintOffsetTranslation` (fetched 2026-11-08 22:10 -03:00, 288,348 B base64 → 216,261 B, sha256 80402fc808fc9343; staged `.ufo/waves/round-94/w1/R94Scout-sources/paint_property_tree_builder.cc`) | the paint property tree update for a LayoutView mints the document's DOM node id in the renderer doing the painting, so a renderer can mint ids for nodes it merely paints | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md
- **S238** | Blink `paint_controller.cc` at tag 155.0.8059.84 — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/platform/graphics/paint/paint_controller.cc | code | A | scope: the paint debug-info path that asks display-item clients for their owner node id | lines 609-613 `PaintController::RecordDebugInfo` with line 612 `client.OwnerNodeId(false)` (fetched 2026-11-08 22:13 -03:00, 44,928 B base64 → 33,696 B, sha256 1bb26ae41c2d1e80; staged `.ufo/waves/round-94/w1/R94Scout-sources/paint_controller.cc`) | when debug info is recorded, painting asks each client for its owner node id, which mints ids through the same process counter (S232/S234) | mined | 2026-11-08 | 90d | corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md

## 5. What this seat did and did not settle

- Re-opened every Blink file C1 cites (S231–S234) at the tag and **reproduced the lane's staged hashes
  exactly** — the sources are fresh and un-drifted.
- Re-located all six sentences the frozen predicate leans on, with line numbers, quotes and `wc -w` counts
  (all ≤ 25 words).
- Added the paint-path id-mint sites C1's §Declared limits 3 leaves open, each with URL, timestamp,
  sha256 and quote, plus the content-capture gate that conditions them.
- **Not** settled: which mechanism minted the child's B in the M arm (paint vs accessibility vs
  serialization vs the chooser itself), and whether a threshold exists between pad 0 and pad 300. No
  leg-level statement was re-tested here (no Chromium launched by this seat), so nothing in this report
  bears on the scored 165 checks / 0 findings.

Artifact carrying the evidence: this report plus the 12 re-fetched bytes in
`.ufo/waves/round-94/w1/R94Scout-sources/` (hashes in §1; identical to the lane's `sources/` bytes for the
four files the lane already staged).

VERDICT C1: neutral
