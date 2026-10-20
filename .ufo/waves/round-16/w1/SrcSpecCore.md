# SrcSpecCore-5 — S020 WebMCP spec re-open (round 16, wave 1)

Seat: `TabiR16.SrcSpecCore-5`. Access date: **2026-10-20**. Scope: status/date/revision, exact API
entry point, `ModelContext` IDL members, one ≤25-word verbatim quote per fact, and delta vs the
observed Chromium 154 surface (`document.modelContext`). All reads below were opened this session.

## 1. Fetch identity (snapshot hashes)

| Artifact | Command | Observed |
|---|---|---|
| Rendered spec (raw HTML) | `curl -sL -o /tmp/webmcp_s020.html https://webmachinelearning.github.io/webmcp/ && sha256sum /tmp/webmcp_s020.html` | `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` (505949 bytes) |
| Source `index.bs` at live revision | `curl -sL -o /tmp/webmcp_head.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/index.bs && sha256sum …` | `dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39` |
| Source `index.bs` at recorded revision | `curl -sL -o /tmp/webmcp_f14762e6.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/f14762e6/index.bs && sha256sum …` | `eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e` |

Fetch method: `curl -sL` (no `--compressed`). Redirect check:
`curl -sIL -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' https://webmachinelearning.github.io/webmcp/`
→ `200 0 https://webmachinelearning.github.io/webmcp/`. Hashes are snapshots; the GH Pages page is
rebuilt on push and may change again.

## 2. Status / date / revision

Observed in `/tmp/webmcp_s020.html`, `<meta name="revision">` at line 11:
`cb3d16964ab3e92cfd5f09901ed0504373a906e8`.

Observed at lines 843–844:

```html
<p id="w3c-state"><a href="https://www.w3.org/standards/types/#CG-DRAFT">Draft Community Group Report</a>,
<time class="dt-updated" datetime="2026-10-20">20 October 2026</time></p>
```

- Status: **CG-DRAFT** (`<meta content="CG-DRAFT" name="w3c-status">`, line 6); Bikeshed
  `49e9fdd4f` (line 8).
- Live revision: **`cb3d1696`**, dated **2026-10-20** (page render) / commit
  `2026-10-20T09:53:18Z`, message *"Add new editor (#352)"* (GitHub API, `sha`
  `cb3d16964ab3e92cfd5f09901ed0504373a906e8`).
- Recorded S020 revision was **`f14762e6`**, commit `2026-10-16T16:30:24Z`, message
  *"Editorial: sync explainers with spec (#350)"* — i.e. the recorded revision is **superseded**
  (see §5).

Quotes (each ≤25 words):

1. Status/date — anchor `#w3c-state` (lines 843–844): *"Draft Community Group Report, 20 October 2026"*.
2. Not a standard — anchor `#sotd` (§ Status of this document): *"It is not a W3C Standard nor is it on the W3C Standards Track."*

## 3. Exact API entry point: `document.modelContext` (Document extension)

Rendered HTML §4.1 "Extensions to Document", IDL block starting line 1488
(source `index.bs` f14762e6 IDL lines 651–653; identical in live revision lines 652–654):

```webidl
partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};
```

Getter steps (rendered lines 1492–1499): return *this*'s associated `ModelContext` object. §4.1 prose
also defines a per-Document "associated ModelContext" created in the Document's relevant realm.

Therefore:

- Entry point is **`document.modelContext`** — **not** `navigator.modelContext`, **not**
  `window.modelContext`.
- `ModelContext` itself is `[Exposed=Window, SecureContext]` (§4.2, rendered line 1505), meaning the
  **interface** is exposed to the Window global; it does **not** create a `window.modelContext`
  property. The only instance attribute defined is on `Document`.
- `[SecureContext]` on the attribute: the getter requires a secure context (per §4.1 IDL).
  `http://127.0.0.1:<port>` is potentially trustworthy, so the loopback probe surface satisfies this.

Evidence for absence (commands run against the live source `index.bs`):

```
$ grep -c 'navigator\.modelContext' /tmp/webmcp_head.bs
0
$ grep -c 'window\.modelContext' /tmp/webmcp_head.bs
0
$ grep -n 'Navigator' /tmp/webmcp_head.bs
1205:    {{NavigatorLanguage/language}}.
```

The only `Navigator` mention is a cross-reference to `navigator.language` in the `ModelContextTool`
`title` localization guidance (§4.2.1, `index.bs:1204-1205`) — no WebMCP IDL partial on `Navigator`.

Quote for entry point — anchor `#document-extension` (§4.1, source `index.bs:653`, verbatim):
*"[SecureContext, SameObject] readonly attribute ModelContext modelContext;"* (inside
`partial interface Document { … };`, `index.bs:652-654`).

Quote for exposure — anchor `#model-context-container` (§4.2, source `index.bs:670`):
*"[Exposed=Window, SecureContext]"*.

## 4. `ModelContext` interface members (IDL, §4.2)

Verbatim from `/tmp/webmcp_head.bs:670-679`; byte-identical rendered text at
`/tmp/webmcp_s020.html:1505-1515`:

```webidl
[Exposed=Window, SecureContext]
interface ModelContext : EventTarget {
  Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});
  Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {});
  Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {});

  attribute EventHandler ontoolchange;
  attribute EventHandler ontoolactivated;
  attribute EventHandler ontoolcancel;
};
```

| Member | Kind | Signature / type |
|---|---|---|
| `registerTool` | operation | `Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {})` |
| `getTools` | operation | `Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {})` |
| `executeTool` | operation | `Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {})` |
| `ontoolchange` | event handler attribute | `EventHandler` |
| `ontoolactivated` | event handler attribute | `EventHandler` |
| `ontoolcancel` | event handler attribute | `EventHandler` |

Inheritance: `EventTarget`. Referenced dictionaries (defined in §4.2.1–§4.2.6, rendered IDL blocks
at lines 2006, 2092, 2108, 2122, 2134): `ModelContextTool`, `ToolAnnotations`,
`ToolExecuteCallbackOptions` (with `callback ToolExecuteCallback`), `ModelContextRegisterToolOptions`,
`ModelContextGetToolOptions`, `ModelContextExecuteToolOptions`, `RegisteredTool`. Event interfaces
live in §4.3: `ToolActivatedEvent` (§4.3.1) and `ToolCancelEvent` (§4.3.2), both
`[Exposed=Window, SecureContext]`.
`ModelContextTool` requires `name`, `description`, `execute`; optional `title`, `inputSchema`,
`annotations`. `RegisteredTool` includes `required Window window` and `required USVString origin`.

Quote for interface members — anchor `#model-context-container` (§4.2, source `index.bs:672`):
*"Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});"*

## 5. Revision delta vs recorded S020 (f14762e6 → cb3d1696)

`diff -u /tmp/webmcp_f14762e6.bs /tmp/webmcp_head.bs` output (complete, exit 0):

```diff
@@ -9,6 +9,7 @@
 Editor: Brandon Walderman, Microsoft https://www.microsoft.com, brwalder@microsoft.com, w3cid 115877
 Editor: Khushal Sagar, Google https://www.google.com, khushalsagar@google.com, w3cid 122787
 Editor: Dominic Farolino, Google https://www.google.com, domfarolino@google.com, w3cid 102763
+Editor: Samuel Dallstream, Microsoft https://www.microsoft.com, sadallst@microsoft.com, w3cid 121507
 Abstract: The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.
```

So the revision bump is **metadata-only** (new editor, PR #352). API surface, entry point, and IDL
are unchanged between `f14762e6` and live `cb3d1696`. No re-pinning of behavioral claims is needed;
only the row's revision/date is stale.

## 6. Difference from observed Chromium 154 surface

Chromium 154 surface as recorded by L1 pre-probe (`.ufo/waves/round-16/PLAN.md`, C2):
`document.modelContext` present; `'modelContext' in navigator` false; gated behind
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp` +
`--enable-blink-features=WebMCP,WebMCPTesting`.

- **Entry-point divergence: none.** The spec (both recorded `f14762e6` and live `cb3d1696`) binds
  exactly `document.modelContext`; Chromium 154 matches.
- `navigator.modelContext` is **not** a current spec surface. The Navigator binding was removed on
  **2026-05-27** by commit `c7b5c7023f6e6a1c7a2495946136eb19b3109ae6` — *"Move the `modelContext`
  getter to `Document` (#184)"* (author date `2026-05-27T08:04:31-07:00`; `index.bs` +16/−46).
  Its parent had `<h3 id="navigator-extension">Extensions to the {{Navigator}} Interface</h3>`
  (`git show c7b5c70^:index.bs`, line 281) and examples using
  `navigator.modelContext.registerTool(...)`. Any lane text implying the spec exposes
  `navigator.modelContext` is stale by ~5 months.
- Remaining observed-vs-spec deltas are **implementation rollout**, not interface placement:
  flags-gated availability and the testing-only flags (Chromium behavior) are not in the spec.
  Whether Chromium 154 implements the exact six-member set (events, `getTools`, `executeTool`,
  dictionary fields) was **not** verified by this seat — that is WebmcpProtocol/Harness evidence
  (receipt `corpus/evidence/round-16/webmcp/protocol-domain.json`).

## 7. Consequences / proposed S020 re-open facts (L1 writes SOURCES.md)

Current `corpus/SOURCES.md:34` reads: `CG-DRAFT 2026-10-16, revision f14762e6` (status `queued`,
accessed 2026-10-19). Re-open this round observed:
`CG-DRAFT 2026-10-20, revision cb3d1696`, content diff vs `f14762e6` = one editor line.

Suggested row edits (L1 only): refresh date/revision to `CG-DRAFT 2026-10-20, revision cb3d1696`;
if mined, note that the Document entry point predates the recorded revision (Navigator→Document on
2026-05-27, `c7b5c70`) and that `f14762e6` already carried `document.modelContext`. Usable quotes:
§4.1 IDL, §4.2 IDL, §SOTD "not a W3C Standard" line above.

## 8. Unknowns / limits

- GH Pages HTML is a moving target; the sha256 above pins the 2026-10-20 snapshot only.
- GitHub commit metadata came from unauthenticated `api.github.com`; commit hashes were also
  cross-checked by resolving them in a `--filter=blob:none` clone of
  `webmachinelearning/webmcp` (HEAD `cb3d169`).
- No browser was launched by this seat (scout contract). Chromium surface facts are second-hand
  from PLAN.md C2 (L1 pre-probe) and are marked as such, not re-observed here.
- Spec text does not state a browser version or flag names; those remain Chromium-source evidence
  owned by other seats.

Tool installs/updates this session: **none** (no pacman, uv, npm, cargo actions taken).
