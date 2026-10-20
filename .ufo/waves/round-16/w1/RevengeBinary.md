# RevengeBinary — Chromium 154 binary strings: WebMCP / ModelContext surface (r16 W1, read-only)

Seat: TabiR16.RevengeBinary-5. Scope: read-only `strings -n 6` reverse engineering of
`/usr/lib/chromium/chromium` filtered for `webmcp|modelcontext|toolname|tooldescription|toolparam|WebMCP\.`,
plus immediate neighbourhood scanning to classify each hit. No browser was launched by this seat, no
file outside this Report was written, nothing was installed or upgraded.

Every offset below is a **file offset** in the ELF, verified this session by byte-scan of the binary
(not a line number of the `strings` dump). All cited offsets fall inside `.rodata`
(`readelf -SW`: `.rodata` off `0x56600`, size `0x1722fc5` → `0x56600..0x17795c5`).

## 0. Identity and method

| Item | Observed |
|---|---|
| path | `/usr/lib/chromium/chromium` |
| `file` | `ELF 64-bit LSB pie executable, x86-64, ... stripped`, BuildID[sha1]=`a97a59aed26d2d01106de09daa4168bd35094b4d` |
| `--version` | `Chromium 154.0.8037.97` |
| `pacman -Q chromium` | `chromium 154.0.8037.97-1` |
| size | `329260096` bytes |
| `sha256sum` | `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` |
| access date | 2026-10-20 |

Commands actually run:

```
strings -n 6 /usr/lib/chromium/chromium > /tmp/chromium154.strings
wc -l /tmp/chromium154.strings            # 1052709
grep -Eic 'webmcp'            /tmp/chromium154.strings   # 35 lines, 33 unique
grep -Eic 'modelcontext'      /tmp/chromium154.strings   # 36 lines, 36 unique
grep -Eic 'toolname'          /tmp/chromium154.strings   # 6 lines
grep -Eic 'tooldescription'   /tmp/chromium154.strings   # 3 lines
grep -Eic 'toolparam'         /tmp/chromium154.strings   # 2 lines
grep -E  'WebMCP\.'           /tmp/chromium154.strings   # 5 lines
grep -Eic 'FormModelContext'  /tmp/chromium154.strings   # 10 lines
# combined webmcp|modelcontext|toolname|tooldescription|toolparam|WebMCP\. -> 75 unique lines
grep -c  'navigator\.modelContext' /tmp/chromium154.strings  # 0
strings -n 6 /usr/lib/chromium/resources.pak > /tmp/resources.strings  # 58101 lines, 0 WebMCP hits
```

The 75 filtered unique lines are the whole textual surface; everything else below comes from
byte-window scans around those hits (the surrounding strings reveal which generated table a token
belongs to). `resources.pak` contains no plaintext `WebMCP`/`ModelContext` (DevTools frontend
resources are compressed/absent there), so all frontend-side evidence in this report is the
browser binary only.

## 1. CDP surface (observed strings)

### 1.1 Domain name

`WebMCP` exists as an exact NUL-delimited token at three offsets:

| offset | context (verbatim neighbouring tokens) | reading |
|---|---|---|
| `0xdc1f5b` | `... SystemInfo, Target, Tethering, Tracing, WebMCP` then padding + compiled table | contiguous **CDP domain-name run** `0xdc1e52..0xdc1f61`: `Audits BackgroundService Browser DeviceAccess DeviceOrientation DigitalCredentials DOM Emulation FedCm Fetch Input Inspector IO Log Memory Network Overlay Page Preload Security ServiceWorker Storage SystemInfo Target Tethering Tracing WebMCP` |
| `0x15356b7` | `WebIdentityDigitalCredentialsCreation, WebMCP, WebMCPDeclarativeFileInput, WebMCPFormAssociatedCustomElements, WebMCPTesting, WebNFC, WebOTP` | Blink **runtime-enabled feature name** run (alphabetical) |
| `0x262613` | `kXMLViewerForIframes, WebMCP, HrefTranslate, SoftNavigationHeuristics` | mixed feature/name list (owner ambiguous) |

Inference: `WebMCP` is a real CDP domain (it sits inside the browser-side domain-name table, beside
`Browser`/`Target`/`SystemInfo`, i.e. not a renderer-only list). Runtime corroboration already exists
in this wave (see §9) but was not produced by this seat.

### 1.2 Commands and events

| offset | token | class |
|---|---|---|
| `0x3b903e` | `WebMCP.invokeTool` | fully-qualified CDP command name, stored in the DevTools command/metrics string pool (`Tracing.requestMemoryDump`, `Accessibility.ManuallyEnabled` neighbours) |
| `0x747950` | `invokeTool` | bare command name, stored in the generated protocol command pool (`createBrowserContext`, `Tracing.bufferUsage`, `getStorageKeyForFrame`) |
| `0x74c4d0` | `WebMCP.toolsAdded` | event name (pool neighbours `WebAudio.nodeParamConnected`) |
| `0xda8c3` | `WebMCP.toolsRemoved` | event name (neighbour `WebAudio.audioNodeWillBeDestroyed`) |
| `0x713898` | `WebMCP.toolInvoked` | event name |
| `0x4d4931` | `WebMCP.toolResponded` | event name |
| `0x3b95c0` | `WebMCP domain is not enabled` | protocol error emitted before `enable` (neighbours `HeadlessExperimental`, `SystemInfo.getInfo is only supported on the browser target`, `Could not bind port` → browser-side DevTools handler error pool) |
| `0x5b8441` | `cancelInvocation` | bare CDP command name in the same generated command pool (`Target.autoAttachRelated`, `recordClockSyncMarker`); domain not provable from strings alone |
| `0x380e0a` | `toolName` | CDP parameter-name pool (`Page.setTouchEmulationEnabled`, `Storage.getUsageAndQuota`, `activateTarget`) |
| `0x2d77e9` | `invocationId` | CDP parameter/field pool (`Target.setAutoAttach`, `discover`, `categories`) |
| `0x6c48f5` | `inputArguments` | blink name pool (not provably the CDP param; see §9) |

Inference (medium confidence): the CDP surface is
`WebMCP.enable` / `WebMCP.disable` (`enable`/`disable` are generic tokens and cannot be attributed
from strings), `WebMCP.invokeTool`, likely `WebMCP.cancelInvocation`, and events
`toolsAdded` / `toolsRemoved` / `toolInvoked` / `toolResponded`. The domain is enable-gated by the
browser handler (`WebMCP domain is not enabled`).

Live correction from the sibling `WebmcpProbeInvoke` (its run, not mine): the gate is **per CDP
session** — calling `invokeTool` on a second, never-enabled session returned
`{code:-32000, message:'WebMCP domain is not enabled'}`, and the browser's own `/json/protocol`
gives `invokeTool` parameters `frameId`, `toolName`, `input`. Read the sentence above as
"per-session enablement", not "global feature switch".

## 2. Feature and flag names (observed strings)

### 2.1 Blink runtime-enabled features

Alphabetical run at `0x153564f..0x153570a` (same list as `WebHaptics`, `WebIDLBigIntUsesToBigInt`,
`WebNFC`):

| offset | token |
|---|---|
| `0x15356b7` | `WebMCP` |
| `0x15356be` | `WebMCPDeclarativeFileInput` |
| `0x15356d9` | `WebMCPFormAssociatedCustomElements` |
| `0x15356fc` | `WebMCPTesting` |

These are the strings accepted by `--enable-blink-features=` (inference from the list identity, which
matches Blink's runtime-feature name table layout).

### 2.2 `base::Feature` symbol strings

| offset | token |
|---|---|
| `0x3ed169` | `kWebMCP` |
| `0x341423` | `kWebMCPTesting` |
| `0x96e2e` | `kDeclarativeWebmcp` |
| `0x6268df` | `kDevToolsWebMCPSupport` |
| `0x5b3122` | `kWebMCPDeclarativeFileInput` |
| `0x45d870` | `kWebMCPFormAssociatedCustomElements` |

Important negative: case-insensitive byte scans find **no standalone (NUL-delimited) name token** for
`DeclarativeWebmcp` or `DevToolsWebMCPSupport` — the only capitalised occurrences are the k-prefixed
identifiers above (a suffix scan for `DevToolsWebMCPSupport` hits only at `0x6268e0`, i.e. offset +1
inside `kDevToolsWebMCPSupport`; `DeclarativeWebmcp` at `0x96e2f` is likewise +1 inside
`kDeclarativeWebmcp`). `WebMCPTesting` by contrast has a true standalone token at `0x15356fc`.

This absence is **not** proof that `--enable-features=DeclarativeWebmcp` /
`--enable-features=DevToolsWebMCPSupport` are inert: a linker could tail-share the feature-name
literal with the k-symbol literal, and the flags/feature names in this binary are already known to
behave differently per type (Blink runtime features keep names in the runtime list; chrome features
keep them in field-trial tables). What *is* established: the runtime-feature names
`WebMCP`, `WebMCPTesting`, `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements` exist as
standalone tokens, so `--enable-blink-features=` with those four names is the string-supported switch
surface. Whether the two `--enable-features=` spellings do anything must be decided by the flag
probe, not by this string census.

### 2.3 `chrome://flags` entries and their labels

Both entry names sit inside runs of known chrome flag names (`service-worker-synthetic-response`,
`enable-http-headers-injection`, `password-change-with-glic`; `tab-group-hover-cards`,
`centralized-infobar-framework`, `SplitViewHorizontal`), i.e. these are chrome flag names:

| kind | offset | string |
|---|---|---|
| flag name | `0x2a5c69` | `enable-webmcp-testing` |
| label | `0xe71890` | `WebMCP for testing` |
| description | `0xe718b0` | `Enables the WebMCP API.` |
| flag name | `0x5f9dfd` | `devtools-webmcp-support` |
| label | `0xe716f0` | `WebMCP support in DevTools` |
| description | `0xe71710` | `Enables WebMCP support in DevTools.` |

Label↔name pairing is by content (`WebMCP support in DevTools` ↔ `devtools-webmcp-support`;
`WebMCP for testing` ↔ `enable-webmcp-testing`), not by adjacency — the label table is separate.

Additional: `devToolsWebMCPSupport` (lower-case `d`) at `0xc6a84` sits in a pool with
`getPreferences` (`0xc6acc`), `zoomIn`, `resetZoom`, `setOriginsForbiddenForExtensions` — the
DevTools host-API method-name pool. Inference (medium): the DevTools frontend can feature-detect
WebMCP support through a host API of that name; unverified.

## 3. Declarative attribute vocabulary (observed tokens)

All five are exact lowercase tokens, and each appears inside a run of known HTML names (Blink's
generated HTML name table), which is why they are read as attribute names. Note that table also holds
tag names (`dfn`, `wbr` appear in the same runs), so placement alone does not prove attribute-ness;
the WebMCP naming and the messages above do.

| attribute | offset | observed neighbouring run |
|---|---|---|
| `toolname` | `0x64d037` | `... aria-sort, dirname, focusgroup, hgroup, interestfor, optimum, toolname, toolparamdescription, disclosure-closed ...` |
| `toolparamdescription` | `0x64d040` | same run, immediately after `toolname` |
| `tooldescription` | `0x32feeb` | `... shadowrootcustomelementregistry, shadowrootreferencetarget, tooldescription, wbr, ...` |
| `tooltitle` | `0x44acf6` | `... noshade, novalidate, reversed, tooltitle, responsive-embedded-sizing ...` |
| `toolautosubmit` | `0x1a0dab` | `... cellpadding, dfn, formmethod, tabindex, toolautosubmit, hide-overscroll ...` |

Inference (declarative model, labelled):

- `toolname` / `tooldescription` — declared on `<form>` (`FormModelContextMissingToolName` /
  `…MissingToolDescription` issue types, §5.3, only make sense on the form).
- `tooltitle` — tool-level title is the natural reading, but the string alone cannot rule out a
  per-parameter title; the issue type `FormModelContextParameterMissingTitleAndDescription` suggests
  a parameter needs a title **and** a description. Probe should test both placements.
- `toolparamdescription` — per form-control parameter description.
- `toolautosubmit` — boolean `<form>` attribute; the message in §5.2 makes it mutually exclusive with
  the "must have a submit button" requirement.
- `setToolParamSchema` (`0x2c281c`) is an exact WebIDL-operation-shaped token in the bindings name
  pool (neighbours `closest`, `headingOffset`, `preventDefault`, `FormDataEventInit`). It is almost
  certainly the hook that supplies an explicit schema for a declarative parameter (e.g. for
  form-associated custom elements — feature `WebMCPFormAssociatedCustomElements`). **Attribution is
  unverified**; treat as a lead, not a contract.

No other `tool*` attribute-like tokens exist: the complete exact-token set from
`grep -E '^tool[a-z]*$'` is
`toolactivated toolautosubmit toolbar toolcancel toolchange tooldescription toolname toolparamdescription tooltip tooltitle`
(`toolbar`/`tooltip` are unrelated UI strings).

## 4. DOM surface (observed tokens)

| kind | offset | token |
|---|---|---|
| event interface | `0x216831` | `WebMCPEvent` (in the event-interface name run beside `AnimationPlaybackEvent`, `NavigateEvent`, `ResourceProgressEvent`) |
| event init dictionary | `0x4bee9e` | `WebMCPEventInit` (dictionary-name pool beside `ContentIndexEvent`, `GamepadEvent`) |
| event type | `0x64ceb9` | `toolactivated` (event-type name run: `reflectionchange, toolactivated, updateend`) |
| event type | `0x16896d` | `toolchange` (event-type run: `speechstart, statechange, toolchange, typechange, writeend`) |
| event type | `0x44ac81` | `toolcancel` (event-type run: `signalingstatechange, toolcancel, ...`) |
| handler attr | `0x44a6cb` | `ontoolactivated` (event-handler name run: `ongamepaddisconnected, onnomatch, ontoggle, ontoolactivated, onupdatestart`) |
| handler attr | `0x1a079b` | `ontoolchange` (`onsqueezestart, ontoolchange, ontouchstart`) |
| handler attr | `0x168262` | `ontoolcancel` (`onsoundstart, ontoolcancel, onwebglcontextcreationerror`) |

Inference: `WebMCPEvent` instances with `type` in `{toolactivated, toolchange, toolcancel}`, plus the
matching `on*` event-handler attributes on whichever interface declares them (the handler-name table
is the union table, so the exact target — `Document` vs `HTMLFormElement` — is not provable from
strings). Probe should attach on `document` **and** the form.

ModelContext DOM exposure:

- `modelContext` `0x687250` (exact token, bindings/property pool).
- Error text `document.modelContext cannot be used when document.domain is enabled.` `0x149d820`
  (whole message; see §5.1) — proves the expression is `document.modelContext`.
- `blink::ModelContextSupplement` `0x149d717` — `DocumentSupplement` pattern, i.e. the context hangs
  off `Document`.
- **Zero** occurrences of `navigator.modelContext` in the binary; the only `navigator` modelContext
  text anywhere is absent. This matches the wave's runtime observation (`'modelContext' in navigator`
  false).

## 5. Messages (exceptions, console, issues)

Classification rule used: a message is attributed to ModelContext only when it is (a) in the same
`.rodata` cluster as a ModelContext C++ identifier/source path, or (b) its wording is
ModelContext-specific. Ambiguous ones are marked.

### 5.1 `ModelContext` / `document.modelContext` guard messages (high confidence)

Cluster immediately after `blink::ModelContextSupplement`:

| offset | message |
|---|---|
| `0x149d800` | `The document is not active.` |
| `0x149d820` | `document.modelContext cannot be used when document.domain is enabled.` |
| `0x149d870` | `Access to the feature "tools" is disallowed by permissions policy.` |

The permissions-policy feature is named literally **`tools`** (inference: iframe opt-in is
`allow="tools"`).

Additional ModelContext execution guards:

| offset | message |
|---|---|
| `0x32e4c3` | `Cannot execute tools that live in a document with an opaque origin.` |
| `0x32e429` | `Description is required` (same cluster as `InvokeScriptToolForInspector` `0x32e40c`) |
| `0x4f31d8` | `Tool not found: ` (immediately precedes `Blink.ModelContext.DelayedToolCount` `0x4f31e9`) |
| `0x410f4d` | `Duplicate tool name` (no colon; adjacent to `blink::ModelContext::ExecuteDeclarativeTool(…)` `0x410f61`) |
| `0x64b1f6` | `JSON parsing failed : ` (adjacent to `model_context.cc` path `0x64b1b2`) |
| `0x64b20d` | `Tool was cancelled` (same `model_context.cc` cluster) |
| `0x32e507` | `WebMCP tool execution failed: ` |

### 5.2 Declarative invocation messages (high confidence)

| offset | message | attribution |
|---|---|---|
| `0x12ff08` | `No submit button was found, but for a form without `toolautosubmit`, there must be a submit button` | declarative registration (backticked attribute; neighbour `FormController::ScheduleRestore`) |
| `0x5d9c70` | `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` | precedes `html_form_element.cc` path `0x5d9c2a` |
| `0x12ff6b` | `To call respondWith, you must first call preventDefault.` | `SubmitEvent.respondWith` precondition |
| `0x1d850d` | `To call respondWith, the event must be currently being dispatched.` | `SubmitEvent.respondWith` precondition |
| `0x3d85e4` | `JSON input arguments must be an object` | invocation input validation (wording specific; path unknown) |
| `0x3d860b` | `respondWith promise resolved with an object that could not be serialized to JSON` | invocation result validation (same cluster) |

### 5.3 Issues (generic issue types + description resources)

Enum-value cluster `0x14b6790..0x14b6850` (adjacent to other `GenericIssueErrorType` values such as
`CorsIssue`, `SharedArrayBufferIssue`):

| offset | issue type |
|---|---|
| `0x14b67d0` | `FormModelContextMissingToolName` |
| `0x14b67f0` | `FormModelContextMissingToolDescription` |
| `0x14b6790` | `FormModelContextParameterMissingTitleAndDescription` |
| `0x14b6820` | `FormModelContextRequiredParameterMissingName` |
| `0x14b6850` | `FormModelContextParameterMissingName` |

Their description resources exist as separate path strings, e.g.
`models/issues_manager/descriptions/genericFormModelContextMissingToolName.md` `0xd9118`,
`…genericFormModelContextParameterMissingName.md` `0x1bba0b`,
`…genericFormModelContextRequiredParameterMissingName.md` `0x3f5145`,
`…genericFormModelContextParameterMissingTitleAndDescription.md` `0x6a2746`,
`…genericFormModelContextMissingToolDescription.md` `0x6da090`
(offsets are token starts; the enum-value substring starts 42 bytes later in each full path, e.g.
`0xd9142` for the first one).

Inference: these five validations run when a `<form toolname>` is scheduled for registration, and
surface through DevTools `Audits` issues.

### 5.4 Execution status strings (shared ScriptTool result vocabulary)

Present as exact tokens; the matching enum identifiers
`kScriptToolCancelled`, `kScriptToolInvalidInputArguments`, `kScriptToolInvalidName`,
`kScriptToolMissingRequiredSubmitButton`, `kScriptToolCrossOriginNavigation`,
`kScriptToolNavigationCommittedErrorPage`, `kScriptToolNavigationDidNotCommit`,
`kScriptToolNavigationFailedLoad`, `kScriptToolNoResponse` also exist, so these read as statuses of
the ScriptTool execution result that a declarative tool invocation resolves to:

| offset | status text |
|---|---|
| `0x3d81b9` | `Tool was not executed due to invalid input arguments` |
| `0x2bf7d1` | `Tool was not executed due to invalid name` |
| `0x72e11f` | `Tool was not executed due to missing required submit button` |
| `0x3c0e25` | `Tool navigation replaced by unrelated navigation` |
| `0x19f487` | `Tool execution cancelled by abort signal` |
| `0xbc30b` | `Tool execution cancelled by a form reset` |
| `0x72e6a2` | `Tool execution cancelled, since tool definition was updated` |
| `0x19ee5e` | `Tool was executed but the invocation failed. For example, the script function threw an error` |

Attribution caveat: `0x72e11f` lands near `frame.cc` in the linear string order, and the
`kScriptTool*` names are also used by the browser-side actor (`script_tool_host.cc`), so these may be
emitted on the inspector/actor path as well as for declarative tools. Probes should treat them as
expected *possible* error/status strings, not as guaranteed. Live cross-check (sibling
`WebmcpProbeInvoke`, not this seat): `invokeTool` with `input:{}` against a schema whose `required`
is `["text"]` returned status `Completed` with output `echo:undefined` — no renderer-side schema
rejection at the invoke boundary — so these statuses should be expected mainly on the
declarative/ScriptTool path, not as `invokeTool` validation errors.

## 6. IDL / C++ anchors (observed signatures and type names)

`__PRETTY_FUNCTION__`-style strings (exact, with offsets) give the IDL shapes:

| offset | signature |
|---|---|
| `0x12fa3d` | `ScriptPromise<IDLUndefined> blink::ModelContext::registerTool(ScriptState *, ModelContextTool *, ModelContextRegisterToolOptions *)` |
| `0x286e87` | `ScriptPromise<IDLSequence<RegisteredTool>> blink::ModelContext::getTools(ScriptState *, const ModelContextGetToolOptions *)` |
| `0x52c700` | `ScriptPromise<IDLNullable<IDLString>> blink::ModelContext::executeTool(ScriptState *, RegisteredTool *, String, const ExecuteToolOptions *)` |
| `0x410f61` | `void blink::ModelContext::ExecuteDeclarativeTool(DeclarativeWebMCPTool *, const base::UnguessableToken &, const String &, AbortController *, ScriptToolExecutedCallback)` |
| `0x32e441` | `void blink::ModelContext::GetCrossDocumentScriptToolResult(const base::UnguessableToken &, CrossDocumentScriptToolResultCallback)` |
| `0x214f7d` | `void blink::HTMLFormElement::ScheduleDeclarativeWebMCPToolRegistration()` |
| `0x59c16c` | `void blink::ModelContext::MaybeRecordToolCount()` |

Bindings/type-name pool `0x149df88..0x149e052` (consecutive tokens):
`blink::ExecuteToolOptions`, `blink::ModelContextGetToolOptions`,
`blink::ModelContextRegisterToolOptions`, `blink::ModelContextTool`, `blink::RegisteredTool`,
`blink::ToolAnnotations`, `blink::ToolExecuteCallbackOptions`, `blink::WebMCPEventInit`.
Other ModelContext types: `blink::ModelContextSupplement` `0x149d717`,
`blink::ModelContext::ToolUnregisterAbortAlgorithm` `0x149d996`,
`blink::ToolData` `0x149d9c8`, `blink::ScriptToolContext` `0x149dbcd`,
`blink::HeapMojoRemote<blink::mojom::blink::ModelContextHost>::Wrapper` `0x149d8f7`.

Mojo: `blink.mojom.ModelContext` `0x4cf373`, `blink.mojom.ModelContextHost` `0x972d4`,
`blink.mojom.ScriptToolHost` `0x698d77`; heap wrappers
`blink::HeapMojoRemote<blink::mojom::blink::ModelContextHost>::Wrapper` and
`blink::HeapMojoReceiver<blink::mojom::blink::ModelContext, blink::ModelContext>::Wrapper`
(renderer↔browser plumbing).

Inspector: `blink::AgentRegistry<blink::InspectorWebMCPAgent>::Data` `0x159dbf2`,
`blink::InspectorWebMCPAgent` `0x159dc07` — a **Blink-side inspector agent class**, consistent with
page-session events.

IDL operation tokens: `registerTool` `0x1dd2e7`, `getTools` `0x4f6ab4`, `executeTool` `0x413ee1`;
`setToolParamSchema` `0x2c281c` (see §3).

Source paths present in the same binary:
`../../third_party/blink/renderer/core/script_tools/model_context.cc` `0x64b1b2` and
`../../third_party/blink/renderer/core/html/forms/html_form_element.cc` `0x5d9c2a`; plus
`blink::HTMLFormElement::HTMLFormMcpTool` `0x14ae058` and
`blink::SubmitEvent::PromiseResult::RespondWithHandler` `0x14ae40e`.

## 7. Inferred contract (explicitly inference)

Declarative registration:

1. A `<form>` carrying `toolname` registers a tool; `tooldescription` supplies the description
   (`FormModelContextMissingToolName` / `…MissingToolDescription` otherwise). `tooltitle` is present
   as a token — most likely the tool's title, placement unverified.
2. Form controls with `name` become parameters; each may carry `toolparamdescription`
   (`FormModelContextParameterMissingName`, `…ParameterMissingTitleAndDescription`,
   `…RequiredParameterMissingName` otherwise). Input schema type is derived from the control
   (inference; no schema-key strings were found in the ModelContext cluster).
3. A submit button is required unless `toolautosubmit` is set (`0x12ff08`). Registration is scheduled
   by `HTMLFormElement::ScheduleDeclarativeWebMCPToolRegistration` and materialises as
   `blink::HTMLFormElement::HTMLFormMcpTool` / `DeclarativeWebMCPTool`.

Declarative invocation:

4. Invoking a declarative tool performs a form submission; the page may `preventDefault()` and call
   `respondWith(result)` on the `SubmitEvent` (`blink::SubmitEvent::PromiseResult::RespondWithHandler`,
   messages `0x5d9c70`, `0x12ff6b`, `0x1d850d`, `0x3d860b`). Without `respondWith` after
   `preventDefault()` the browser logs the "programming error" message.
5. Input arguments must be a JSON object (`0x3d85e4`); input parsing failures log
   `JSON parsing failed : `.
6. Execution is cancelled by abort signal, form reset, or a tool-definition update; navigation ends
   it (`0x19f487`, `0xbc30b`, `0x72e6a2`, `0x3c0e25`).

Imperative surface: `document.modelContext` with `registerTool(tool, options)` (duplicate name →
`Duplicate tool name`, missing description → `Description is required`), `getTools(options)`,
`executeTool(registeredTool, input, options)`; `ToolAnnotations` hints exist on the tool dictionary.
No `unregisterTool` IDL token exists; unregistration is via the abort algorithm
(`ToolUnregisterAbortAlgorithm`), i.e. an `AbortSignal` in the register options.

## 8. Divergences / negative findings (things that look different from the obvious guess)

| expectation | observed |
|---|---|
| `navigator.modelContext` | **absent** in the binary (0 hits); `document.modelContext` only, via `ModelContextSupplement` |
| permissions-policy feature name `model-context`/`webmcp` | literal name is **`tools`** (`Access to the feature "tools" is disallowed by permissions policy.`) |
| `--enable-features=DeclarativeWebmcp` / `DevToolsWebMCPSupport` | no standalone name tokens (only the k-prefixed identifiers, at offset +1); the string census cannot settle inertness — flag probe decides |
| tool messages with "inputSchema" | the four `Tool inputSchema …` validators belong to the **AI Prompt API** (`ai_utils.h`), not WebMCP — see §10 |
| events on `navigator`/`modelContext` object | event type names exist (`toolactivated/toolchange/toolcancel`) but the target interface is not provable from strings |
| `document.domain` works with WebMCP | explicitly refused (`0x149d820`) |

## 9. Runtime corroboration (not produced by this seat)

Read-only cross-check of the sibling artifact
`.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` (produced by `WebmcpProbeInvoke`; I did not run
it; the file was later updated with producerSha256 `34bcb776…ad9ac6d`): its `protocolDomain` object
reports `domain: "WebMCP"`, `experimental: true`, `dependencies: ["Runtime","Page","DOM"]`, a type
`Annotation` with `readOnly` / `untrustedContent` / `consequential`, command `invokeTool` with
parameters `frameId`, `toolName`, `input`, command `cancelInvocation`, and an event parameter
`toolName`. That independently confirms the binary-side inference for `WebMCP.invokeTool`
(`0x3b903e`), `cancelInvocation` (`0x5b8441`), and `toolName` (`0x380e0a`). Three live facts from
that run supersede string-only guesses: (a) enablement is per session, not global; (b) the invoke
argument is named `input`, not the `inputArguments` token found at `0x6c48f5` — do **not** assert
`inputArguments` as the CDP parameter; (c) `input:{}` against a required-`text` schema still produced
`Completed`/`echo:undefined`, i.e. no renderer-side schema rejection at the invoke boundary.

## 10. Non-attributions (do not copy into WebMCP evidence)

These tool-related messages cluster with `../../third_party/blink/renderer/modules/ai/ai_utils.h`
`0x3320f7` and `LanguageModel`/`Translator` symbols, i.e. the built-in **AI Prompt API tools**, not
WebMCP:

- `Tool inputSchema must have a 'type' property that is a string for tool: ` `0x33212e`
- `Tool inputSchema 'properties' must be an object if present for tool: ` `0x36bbea`
- `Tool inputSchema 'required' must be an array if present for tool: ` `0x5dd896`
- `Tool inputSchema 'type' must be 'object' for tool: ` `0x567727`
- `Tool name cannot be empty.` `0x5dd87b`
- `Tool description cannot be empty for tool: ` `0x3a4404`
- `Duplicate tool name: ` (with colon) `0x4886d1` — the ModelContext message is the colon-less
  `Duplicate tool name` `0x410f4d`
- `Failed to serialize inputSchema for tool: ` `0x4152ba` (adjacent to `LanguageModel` strings)
- `Invalid tool call arguments JSON.` `0x16f6e5` and `Invalid tool name` `0x1d80ad` — clusters are
  on-device-model / generic, not ModelContext.

## 11. Leads handed to probe seats (already messaged)

Sent to `TabiR16.WebmcpProbeDeclarative-5`:

- untested attribute tokens `tooltitle` (0x44acf6) and the `ontoolactivated/ontoolchange/ontoolcancel`
  handler attributes (0x44a6cb / 0x1a079b / 0x168262) — the declarative probe only exercised
  `toolautosubmit`;
- event types `toolactivated` / `toolchange` / `toolcancel` and interface `WebMCPEvent`;
- issue-type set and the `allow="tools"` permission;
- the `--enable-blink-features=WebMCP,WebMCPTesting,WebMCPDeclarativeFileInput,WebMCPFormAssociatedCustomElements`
  split, and the warning that `DeclarativeWebmcp` has no feature-name token;
- `document.domain` prohibition and the `navigator.modelContext` negative control.

Sent to `TabiR16.WebmcpProbeInvoke-5`:

- `cancelInvocation` + `invocationId` pairing;
- the status-string vocabulary that `toolResponded` may carry, including the declarative-only
  `respondWith` messages;
- the `inputArguments` vs schema-`input` discrepancy (do not assert `inputArguments`).

Report: .ufo/waves/round-16/w1/RevengeBinary.md
