# SrcChromiumIdl — ModelContext/WebMCP IDL in Chromium source

Seat: `TabiR16.SrcChromiumIdl-5` (W1, read-only). Question: where does the ModelContext
IDL live, which interface is extended on Document vs Navigator, which extended attributes
gate it, and what is the exact `registerTool` signature.

Verdict (high confidence): the API is **not** in `third_party/blink/renderer/modules/`; it
lives in `third_party/blink/renderer/core/script_tools/`. The only partial extension is
`partial interface Document` — **there is no `partial interface Navigator`** in the 154 pin
or in main, so `navigator.modelContext` is absent by IDL construction, not merely by probe.
The container is `[Exposed=Window, SecureContext, RuntimeEnabled=WebMCP] interface
ModelContext : EventTarget`.

## 1. Version pins (what "154" means here)

Host pre-probe (L1, PLAN.md) says Chromium `154.0.8037.97`. I pinned source to that exact tag:

| Ref | Commit | chrome/VERSION | Note |
|---|---|---|---|
| `refs/tags/154.0.8037.97` | `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` | MAJOR=154 MINOR=0 BUILD=8037 PATCH=97 | exact host pin |
| `refs/branch-heads/8037` | `f8e3cc778fbcac8e9802600aa4ea43b0b51605df` | 154.0.8037.155 | IDL bytes `cmp`-identical to the tag |
| `main` | `05abdb878fa62ed76a61b413b0c3f9d55838b8b9` (2026-10-20 14:22:33) | 158.0.8115.0 | 4 versions ahead of host; do **not** attribute main-only members to 154 |

Evidence for the pin (fetched with `curl ... ?format=TEXT | base64 -d`, then `cmp`):

```
$ curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/VERSION?format=TEXT' | base64 -d
MAJOR=154
MINOR=0
BUILD=8037
PATCH=97
$ cmp -s /tmp/tag_model_context.idl /tmp/st154/model_context.idl && echo SAME   # -> SAME (all three IDLs)
```

File identity (sha256 of decoded bytes; gitiles blob id reproduced locally with
`git hash-object`, matching the `?format=JSON` `id` field):

| Path at 154.0.8037.97 | sha256 | git blob |
|---|---|---|
| `third_party/blink/renderer/core/script_tools/model_context.idl` | `66c5a7471666e0943e93fe75774a38b2f0d3847e502d2cb02bf22a17ff235b39` | `30b1071ca1f14ec7b90b376cae3494e23ccd1e6e` |
| `.../model_context_supplement.idl` | `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` | `c954510d188abb6fb21542e7a60127608650d48c` |
| `.../model_context_tool.idl` | `981610fca41c55cf627ad1569189f4807f94f5c4e9fd82bd20545bd3984c0def` | `9f50031504700028c6f3fb0f1ccf80b088dd0148` |

At `main` (158.0.8115.0): `model_context.idl` sha256 `53683a07…bd7924` / blob `a934923c…`;
`model_context_supplement.idl` is **byte-identical** to 154 (same sha256/blob);
`model_context_tool.idl` sha256 `ef91798c…310dc5` / blob `77d5e6bc…`;
plus two new files `tool.idl` (sha256 `6f5bb556…ffff`) and
`model_context_tool_invocation.idl` (sha256 `1304b8fb…ece2`) that do not exist at 154.

## 2. Where the IDL is (and where it is not)

Directory listing at the pin:

```
core/script_tools/: model_context.idl  model_context_supplement.idl  model_context_tool.idl
                   model_context.cc/.h  model_context_supplement.cc/.h  model_context_test.cc
                   model_context_tool_invocation.{cc,h,idl}   # main only (all three absent at 154)
                   tool.{cc,h,idl}                             # main only (all absent at 154)
                   script_tool_context.h  script_tool_types.h  build.gni
```

Negative evidence for `modules/`:

```
$ curl -sS 'https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/modules/?format=JSON' | grep -o '"model[^"]*"\|"webmcp[^"]*"'
(no output)
$ curl -sS -o /dev/null -w '%{http_code}\n' 'https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/modules/model_context/model_context.idl'
404
$ curl -sS -o /dev/null -w '%{http_code}\n' '.../modules/webmcp/'      # gitiles dir
404
$ curl -sS '.../modules/ai/?format=JSON' | grep -i 'modelcontext\|model_context'
(no output)
```

So any harness/note pointer at `modules/model_context/*.idl` is a wrong path; use
`core/script_tools/`.

## 3. Document, not Navigator

`model_context_supplement.idl` at 154.0.8037.97, lines 7–12 (whole file is 12 lines):

```idl
 7 [
 8   RuntimeEnabled=WebMCP,
 9   ImplementedAs=ModelContextSupplement
10 ] partial interface Document {
11   [SecureContext, SameObject] readonly attribute ModelContext modelContext;
12 };
```

- The partial is on **Document**; the directory contains no `navigator_*` file, and all
  three IDLs present at the tag were fetched and grepped — `partial interface` occurs only
  in this supplement (line 10). The spec/WPT IDL is Document-only too (see §7), so this is
  not a Chromium deviation.
- C++ corroboration: `ModelContextSupplement` is document-scoped storage —
  `model_context_supplement.h:15-17`
  `class CORE_EXPORT ModelContextSupplement final` / `public Supplement<Document> {`.
- `document.modelContext` is `[SameObject]`: stable per Document; `[SecureContext]` on the
  **attribute** (not only on the interface) means the property is not exposed in insecure
  contexts even where Document exists.
- `RuntimeEnabled=WebMCP` on the partial means the attribute itself is created only when the
  Blink runtime feature `WebMCP` is on; `ImplementedAs=ModelContextSupplement` maps the
  attribute to the supplement's static `modelContext(Document&)`.
- Consequence for C2: `'modelContext' in navigator === false` is **source-backed**; do not
  write tests expecting a Navigator surface, and do not describe the API as
  `navigator.modelContext`.

## 4. ModelContext interface and extended attributes (154 pin)

`model_context.idl:65-78` (154.0.8037.97):

```idl
65 [
66     Exposed=Window,
67     SecureContext,
68     RuntimeEnabled=WebMCP
69 ] interface ModelContext : EventTarget {
70   [CallWith=ScriptState, MeasureAs=ModelContextRegisterTool] Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});
71   [CallWith=ScriptState, MeasureAs=ModelContextGetTools] Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {});
72   [CallWith=ScriptState, MeasureAs=ModelContextExecuteTool] Promise<DOMString?> executeTool(
73       RegisteredTool tool,
74       DOMString inputArguments,
75       optional ExecuteToolOptions options = {}
76   );
77   attribute EventHandler ontoolchange;
78 };
```

- `Exposed=Window` only (not `Worker`); interface is `SecureContext`; interface is gated by
  the Blink runtime feature `WebMCP`.
- `registerTool` returns `Promise<undefined>` and takes `ModelContextTool` plus optional
  options; no other overload exists at 154.
- Supporting dictionaries in the same file: `ModelContextRegisterToolOptions`
  (lines 7–22: `AbortSignal signal; sequence<USVString> exposedTo;`),
  `ExecuteToolOptions` (24–26: `AbortSignal signal;`),
  `RegisteredTool` (28–49: required `name`, `description`, `window`, `origin`; optional
  `DOMString inputSchema`, `title`, `annotations`),
  `ModelContextGetToolOptions` (51–63: `sequence<USVString> fromOrigins;`).
- `ModelContextTool` itself is in `model_context_tool.idl:6-17`: required `name`,
  `description`, `execute` (`ToolExecuteCallback`), optional `USVString title`,
  `object inputSchema`, `ToolAnnotations annotations`. `ToolAnnotations`
  (`model_context_tool.idl:20-24`) has only `readOnlyHint`, `untrustedContentHint`,
  `consequentialHint` at 154; callback is
  `callback ToolExecuteCallback = Promise<any>(object input, ToolExecuteCallbackOptions options);`
  (line 34).

## 5. Main (158.0.8115.0) drift — scope warning for the note

Same location and same Document-only partial, but the surface moved:

- `model_context.idl:42-61`: `getTools` now returns `sequence<Tool>`; `executeTool` is
  `executeTool(Tool tool, optional object inputObject, optional ExecuteToolOptions options = {})`
  (lines 49–53); new `resumeTool(DOMString token, ToolExecuteCallback callback)` under
  `RuntimeEnabled=WebMCPContinuations` (54–57); new `ontoolactivated`/`ontoolcancel`
  (58–60).
- New `tool.idl:12-16`: `[Exposed=Window, SecureContext, RuntimeEnabled=WebMCP] interface Tool`
  with `name`, `description`, `title`, `Window? window`, `USVString origin`,
  `object? inputSchema`, `object? annotations`.
- New `model_context_tool_invocation.idl:5-11`: `interface ModelContextToolInvocation`
  (`RuntimeEnabled=WebMCPContinuations`) with `requestToken()`.
- `model_context_tool.idl` main: `ToolAnnotations` gains `boolean debugging = false;` and
  `[ConvertibleToObject]`; `ToolExecuteCallbackOptions` gains
  `[RuntimeEnabled=WebMCPContinuations] ModelContextToolInvocation invocation;`.
- Runtime features at main add `DeclarativeWebMCP` (`runtime_enabled_features.json5:2396-2406`,
  `origin_trial_feature_name: "WebMCP"`, `status: "experimental"`), which does not exist at 154.

Anything a harness asserts about `Tool`, `getTools(): sequence<Tool>`, `resumeTool`,
`ontoolactivated`, `ontoolcancel`, or `Tool.annotations` is **158 behavior unless separately
probed on 154** — on 154 `getTools()` returns `RegisteredTool` dictionaries and
`inputSchema` there is a `DOMString`.

## 6. Runtime feature names at the 154 pin

`third_party/blink/renderer/platform/runtime_enabled_features.json5` at 154.0.8037.97:

- `WebMCP` — lines 7023–7036: `status: "experimental"`, `origin_trial_feature_name: "WebMCP"`,
  `origin_trial_allows_third_party: true`, `public: true`,
  `base_feature_status: "enabled"`, `copied_from_base_feature_if: "overridden"`,
  `implied_by: ["WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting"]`.
- `WebMCPDeclarativeFileInput` — 7038–7039, `status: "test"`.
- `WebMCPFormAssociatedCustomElements` — 7042–7045, `status: "experimental"`.
- `WebMCPTesting` — 7048–7049, `status: "experimental"`.
- There is **no** `DeclarativeWebMCP` entry at 154 (grep `-i declarative` finds only unrelated
  features); the declarative form path is gated by the same `WebMCP` runtime feature.

Declarative-form gating (154, `core/html/forms/html_form_element.cc`):

- line 354: `if (!RuntimeEnabledFeatures::WebMCPEnabled(GetExecutionContext())) {` inside
  `ScheduleDeclarativeWebMCPToolRegistration()`; line 411: same check `CHECK(...)` inside
  `RegisterDeclarativeWebMCPTool()`.
- lines 365–366 read `kToolnameAttr` / `kTooldescriptionAttr`; line 414 also reads
  `kTooltitleAttr`; line 417 reads `kToolautosubmitAttr`.
- A form qualifies only with both attributes: comment at 362–364
  “The `<form>` must have *both* the `toolname` and `tooldescription` attributes”.
- Malformed forms raise GenericIssues: `kFormModelContextMissingToolName` (line 339) and
  `kFormModelContextMissingToolDescription` (lines 345–346) — matching the binary strings in
  PLAN.md (`FormModelContextMissingToolName`, `FormModelContextMissingToolDescription`).
- These are **content attributes**, not IDL members: `html_form_element.idl` at the tag has no
  `toolname`/`toolautosubmit`/`modelContext` members (grep `-i tool` over the file: no hits).
- Consequence: a declarative fixture needs `toolname` + `tooldescription` on a connected
  `<form>`; `tooltitle` is optional. `document.modelContext` is reachable from
  `HTMLFormElement` via `ModelContextSupplement::modelContext(GetDocument())` (line 428).

## 7. Spec / WPT divergence (secondary, opened for comparison)

Upstream `web-platform-tests/wpt` `interfaces/webmcp.idl` (master) is Document-only, like
Chromium:

```idl
6 partial interface Document {
7   [SecureContext, SameObject] readonly attribute ModelContext modelContext;
8 };
10 [Exposed=Window, SecureContext]
11 interface ModelContext : EventTarget {
12   Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});
```

Divergences from the 154 Chromium IDL:

- Spec dictionary name is `ModelContextExecuteToolOptions`; Chromium drops the prefix and
  names it `ExecuteToolOptions` (both 154 and main).
- Spec `executeTool(RegisteredTool tool, optional object inputObject, optional
  ModelContextExecuteToolOptions options = {})`; 154 Chromium requires a non-optional
  `DOMString inputArguments` (a JSON string) and returns `Promise<DOMString?>`.
  158 moved to `optional object inputObject`, closer to spec.
- Spec `ToolAnnotations` (upstream master) already has `debugging`; 154 Chromium does not.
- Chromium's checked-in WPT copy at main
  (`third_party/blink/web_tests/external/wpt/interfaces/webmcp.idl`) is stale relative to
  upstream: it has only `ontoolchange`, and `executeTool(RegisteredTool tool, optional any
  inputObject, optional ModelContextExecuteToolOptions options = {})`; it lacks
  `ontoolactivated`/`ontoolcancel` that upstream master carries. Do not treat the Chromium
  WPT copy as the spec snapshot.

## 8. C2 harness implications (advice, not certification)

- Resolve `document.modelContext` in the page's main world; `[Exposed=Window]` means no
  worker/DedicatedWorkerGlobalScope surface. `http://127.0.0.1:<port>` is a trustworthy
  origin, so `[SecureContext]` is satisfied; a non-loopback plain-http page is not.
- Flags: Blink runtime feature is `WebMCP` (`status: "experimental"`, origin trial `WebMCP`,
  `base_feature_status: "enabled"`). `WebMCPTesting` exists at 154 and is implied by
  `WebMCP`; `WebMCPDeclarativeFileInput` is `test` status. The exact CLI spelling for
  `--enable-features`/`--enable-blink-features` is the flags seat's call; source only proves
  the names and statuses above.
- Imperative registration must supply `name`, `description`, and a callable `execute`
  (`required ToolExecuteCallback execute;` at `model_context_tool.idl:15`); `title`,
  `inputSchema`, `annotations` are optional. Options accept `signal` and `exposedTo`
  (default: same-origin documents only).
- Declarative fixture must use **both** `toolname` and `tooldescription`; `tooltitle` and
  `toolautosubmit` are optional. A missing `toolname` should produce no tool and, if Audits
  is wired, `FormModelContextMissingToolName`.
- On 154, `getTools()` yields `RegisteredTool` with `inputSchema` as a string; `executeTool`
  takes that dictionary plus a JSON-string `inputArguments`. Tests written against
  `Tool`/`inputObject` are 158-shape and will not match 154.

## 9. Confidence and remaining unknowns

High confidence (direct byte-pinned source reads):

- Location `core/script_tools/`; Document-only supplement; no Navigator partial.
- Extended attributes: `Exposed=Window`, `SecureContext`, `RuntimeEnabled=WebMCP`
  (interface and Document partial), attribute-level `[SecureContext, SameObject]`.
- `registerTool` exact signature and `ModelContextTool`/options dictionaries at 154.
- 154-vs-158 drift list and the 154 runtime feature names.

Medium (source-inferred, not re-probed here): the statement that flags/feature statuses
produce the observed runtime behavior. I did not launch a browser or run any gate in this
seat (read-only scout; no installs, no pacman).

Unresolved:

- The PLAN binary string `kDeclarativeWebmcp` was **not** located in 154
  `runtime_enabled_features.json5`, `third_party/blink/common/features.cc`,
  `chrome/common/chrome_features.cc`, or `content/public/common/content_features.cc`
  (all fetched at the tag, grep empty). Its definer is outside this slice (flags seat).
  Note the shipped 154 source has `DeclarativeWebMCPTool` C++ types, but no
  `DeclarativeWebMCP` runtime feature and no `kDeclarativeWebmcp` in Blink feature files.
- Gitiles `+log` on a path returns HTTP 401 (“Please sign in to view the history pages”), so
  intra-branch history of the IDL was not verified; mitigated by exact-tag pin plus
  `cmp`-identical bytes at `branch-heads/8037`, which makes an intra-branch IDL change
  between `.97` and `.155` effectively excluded (identical bytes at the branch head).
- The GN list that feeds IDL bindings was not located (the guessed
  `bindings/idl_files.gni` paths are 404). Not needed for the claim: generation is proven by
  `model_context.cc:16-24` including `v8_model_context*.h` / `v8_registered_tool.h` /
  `v8_tool_annotations.h` headers; at main `core/BUILD.gn:75,291,1612` wires
  `script_tools/build.gni` sources/tests (154 not checked for these line numbers).

## 10. Source-row candidates (L1 mints the actual rows)

All accessed **2026-10-20**. Fetch method for each: `curl -sS '<URL>?format=TEXT' | base64 -d`
(gitiles returns base64 of raw bytes; `?format=JSON` was used only for blob ids). Raw GitHub
`.../raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/script_tools/<file>`
returns the same bytes (HTTP 200) but is branch-mutable; prefer the tag/commit URLs.

| # | URL (gitiles) | Located quote (≤25 words) | Anchor |
|---|---|---|---|
| 1 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl` | `] partial interface Document {` | line 10 |
| 2 | same | `[SecureContext, SameObject] readonly attribute ModelContext modelContext;` | line 11 |
| 3 | `.../refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.idl` | `] interface ModelContext : EventTarget {` (attributes on lines 66–68) | line 69 |
| 4 | same | `[CallWith=ScriptState, MeasureAs=ModelContextRegisterTool] Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});` | line 70 |
| 5 | same | `[CallWith=ScriptState, MeasureAs=ModelContextGetTools] Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {});` | line 71 |
| 6 | `.../refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_tool.idl` | `required ToolExecuteCallback execute;` | line 15 |
| 7 | `.../refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5` | `name: "WebMCP",` with `status: "experimental",` | 7023, 7035 |
| 8 | `.../refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc` | `if (!RuntimeEnabledFeatures::WebMCPEnabled(GetExecutionContext())) {` | line 354 |
| 9 | `https://chromium.googlesource.com/chromium/src/+/05abdb878fa62ed76a61b413b0c3f9d55838b8b9/third_party/blink/renderer/core/script_tools/model_context.idl` | `executeTool(` / `Tool tool,` / `optional object inputObject,` | 49–51 |
| 10 | `.../05abdb878fa62ed76a61b413b0c3f9d55838b8b9/third_party/blink/renderer/core/script_tools/tool.idl` | `] interface Tool {` | line 16 |
| 11 | `.../05abdb878fa62ed76a61b413b0c3f9d55838b8b9/third_party/blink/renderer/platform/runtime_enabled_features.json5` | `name: "DeclarativeWebMCP",` | line 2396 |
| 12 | `https://raw.githubusercontent.com/web-platform-tests/wpt/master/interfaces/webmcp.idl` | `partial interface Document {` | line 6 |

If L1 mints only one row for this slice, row 4 (the `registerTool` line, pinned with the tag
URL) is the densest anchor: it carries path, version, extended attributes context, and the
signature in one located quote.

## 11. Commands actually run (abridged, observed outputs)

```
# 1. Wrong-tree disproof
curl .../modules/model_context/model_context.idl           -> 404
curl .../modules/?format=JSON | grep -o '"model[^"]*"'    -> (none)
curl .../modules/ai/?format=JSON | grep -i modelcontext   -> (none)

# 2. Correct tree, main
curl https://api.github.com/repos/chromium/chromium/contents/third_party/blink/renderer/core/script_tools?ref=main
  -> 200, 20 entries incl. model_context.idl, model_context_supplement.idl,
     model_context_tool.idl, tool.idl, model_context_tool_invocation.idl

# 3. Exact-host pin
curl .../+/refs/tags/154.0.8037.97/chrome/VERSION?format=TEXT | base64 -d -> 154.0.8037.97
cmp tag/154-branch IDLs -> SAME (3/3)
git hash-object tag IDLs -> 30b1071c…, c954510d…, 9f500315… (matches gitiles blob ids)

# 4. Attribute / signature reads
cat -n tag/model_context_supplement.idl   -> lines 7-11 quoted above
cat -n tag/model_context.idl              -> lines 65-78 quoted above
grep -n 'partial interface' tag/*.idl     -> only model_context_supplement.idl:10 (Document)

# 5. Feature + declarative gating
grep -n -A14 'name: "WebMCP"' tag/runtime_enabled_features.json5 -> 7023-7036
grep -n -i declarative tag/runtime_enabled_features.json5       -> unrelated features only
grep -n 'RuntimeEnabledFeatures::WebMCPEnabled\|kToolnameAttr\|kTooldescriptionAttr\|kToolautosubmitAttr' tag/html_form_element.cc
  -> 354, 411, 365, 366, 414, 417
grep -n -i tool tag/html_form_element.idl -> (none; attributes are not IDL)

# 6. Cross-check
curl raw.githubusercontent.com/web-platform-tests/wpt/master/interfaces/webmcp.idl -> 200, Document-only
curl raw.githubusercontent.com/chromium/chromium/main/third_party/blink/web_tests/external/wpt/interfaces/webmcp.idl -> 200, stale copy (only ontoolchange)
```

No browser, gate, selftest, counter, or install was run in this seat; no files outside this
Report were written.
