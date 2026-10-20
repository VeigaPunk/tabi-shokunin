# SrcWpt — WebMCP test surfaces: web-platform-tests + Chromium web_tests (round 16, wave 1)

- Seat `TabiR16.SrcWpt-5` (read-only scout). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Date 2026-10-20. No browser launched, no gate/counter/selftest run, no tool installed or upgraded,
  no repo written outside this Report.
- Assignment: locate WebMCP tests in `web-platform-tests/wpt` (`webmcp` / model-context naming) and in
  Chromium `third_party/blink/web_tests/**` (`webmcp*`, `model_context*`); record paths, asserted
  behavior, commit, quotes <=25 words. Lead quality unless primary; this report gives primary anchors
  for the highest-value rows.
- Source opening for every quote happened this session, access date 2026-10-20, via `curl` against
  `raw.githubusercontent.com` (WPT) and `chromium.googlesource.com/...?format=TEXT` decoded with
  `base64 -d` (Chromium). Commit dates/titles from GitHub `.atom` feeds and
  `chromium.googlesource.com/+/<sha>?format=JSON`.

## 0. Snapshot and method (exact commands)

```
$ git ls-remote https://github.com/web-platform-tests/wpt.git refs/heads/master
a72ba094b342faa0213d26330d6e09e2359ea43f	refs/heads/master
$ git ls-remote https://chromium.googlesource.com/chromium/src refs/heads/main
0a2991ca84f855b0969e883fbfbd6e8035178a40	refs/heads/main
```

Directory inventories:
- WPT tree pages parsed for exact file lists:
  `curl -sL https://github.com/web-platform-tests/wpt/tree/master/webmcp[/declarative|/imperative|/imperative/resources]`.
- Chromium gitiles directory listings:
  `curl -s 'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/<dir>/?format=TEXT' | base64 -d`.
- Per-file history: `curl -sL https://github.com/<repo>/commits/<branch>/<path>.atom`.
- WPT/Chromium mirror identity: `curl ... | git hash-object --stdin` on both sides.

Negative naming probes (2026-10-20, all 404): WPT
`api.github.com/repos/web-platform-tests/wpt/contents/{model-context,modelcontext,web-mcp}`; Chromium
`wpt_internal/model_context`, `http/tests/model_context`, `web_tests/model_context`, and
`wpt_internal/script_tools` (the pre-move location). The naming is `webmcp` in both trees; no
`model_context`/`model-context` test path exists.

## 1. WPT upstream: `webmcp/` exists and is the canonical test suite

WPT master `a72ba094…`. `webmcp/` last touched by commit **`e61b072782cf`** (author 2026-10-16T09:44:48-07:00,
committer 2026-10-17T05:18:42Z), subject `WebMCP: Keep a form's declarative tool in sync with its
registration`. The directory was created by **`a7e7281f12ab`** (2026-03-23), subject
`[WebMCP] Move wpt_internal/script_tools to external/wpt/webmcp` — the Chromium-internal tests were
moved upstream (patch header, 12 files added, `webmcp/META.yml` created).

### 1.1 Inventory (counts verified against tree pages, 2026-10-20)

| Area | Entries | Test files | Notes |
|---|---|---|---|
| `webmcp/` root | 7 | 3 | `idlharness.https.window.js`, `tool-activated-event.https.html`, `tool-cancel-event.https.html` |
| `webmcp/declarative/` | 27 | 25 | plus `WEB_FEATURES.yml` and `opaque-origin-tools.https.html.headers` |
| `webmcp/imperative/` | 53 | 50 | plus `WEB_FEATURES.yml`, `opaque-origin-tools.https.html.headers`, `resources/` |
| `webmcp/resources/` | 1 file | — | `helpers.js` (`waitForTool`, `waitForFormToolSchemaToMatch`) |
| `webmcp/imperative/resources/` | 4 files | — | `helpers.js`, `iframe-caller.html`, `iframe-caller-and-target-crash.html`, `iframe-register-tool.html` |
| **Total test files** | — | **78** | 25 declarative + 50 imperative + 3 root |

Suite metadata:
- `webmcp/META.yml:1` is `spec: hthttps://webmachinelearning.github.io/webmcp/` — a literal **`hthttps`**
  typo in the spec URL (verified byte-level with `od -c`); `suggested_reviewers: domfarolino`. Metadata defect,
  no execution effect.
- `webmcp/declarative/WEB_FEATURES.yml` maps `**` -> `declarative-webmcp`.
- `webmcp/imperative/WEB_FEATURES.yml` maps `**` -> `document-modelcontext`.

### 1.2 Spec IDL the suite is generated against

`interfaces/webmcp.idl` (WPT master) declares `partial interface Document { [SecureContext, SameObject]
readonly attribute ModelContext modelContext; }`, `ModelContext` with `registerTool` / `getTools` /
`executeTool` plus `ontoolchange` / `ontoolactivated` / `ontoolcancel`, `RegisteredTool` carrying
`Window window` + `origin`, and `ToolActivatedEvent` / `ToolCancelEvent`. This is the `webmcp` IDL id
that `idlharness.https.window.js:8-9` consumes (`idl_test(['webmcp'], ['html', 'dom'], ...)`).

### 1.3 What the suite asserts (grouped; representative quotes)

**Surface identity (and the `document` vs `navigator` split).**
- `webmcp/imperative/model_context.https.html:12` — `assert_true(document.modelContext instanceof ModelContext);`
- `:17` — `document.modelContext SameObject`; `:70` — `createHTMLDocument().modelContext rejects tool operations with InvalidStateError`
  (inactive-document `getTools`/`registerTool`/`executeTool` all reject with `InvalidStateError`).
- `webmcp/imperative/non-secure.html:13` — `document.modelContext is not supported in non-secure context.`
- `navigator.modelContext` appears in none of the WPT files sampled here (not an exhaustive grep of all
  78 test files); the IDL exposes the property only as `Document.modelContext`.

**Declarative `<form>` tools.**
- `webmcp/declarative/getTools-declarative-schema.https.html:10` — `<form toolname="search_tool" tooldescription="Search the web">`
  with inputs mapping `toolparamdescription` -> JSON Schema `description`, `required` from `required`,
  `multipleOf: 1` for number inputs (`:27`), `required: ["query"]` (`:35`).
- `webmcp/declarative/toolchange-on-attribute-mutation.https.html:127` — `Test that mutating or removing form attributes (toolname, tooldescription, tooltitle, toolautosubmit) fires toolchange and updates getTools() correctly`
- `toolchange-on-control-add-remove`, `toolchange-on-name-change`, `duplicate-tool-name`,
  `name-collision-with-imperative-tool`, `no-frame-documents`, `form_removal_submit_crash` cover schema
  recompute, duplicate suppression, frameless/DOMParser documents, and removal safety.
- `webmcp/declarative/executeTool-pseudo-classes.https.html:10-11` declares
  `form:tool-form-active { ... }` and `button:tool-submit-active { ... }`; `:54` asserts
  `Form should match :tool-form-active during submit`.
- `webmcp/declarative/executeTool-respondWith.https.html:53` asserts `agentInvoked should be true during
  tool invocation`; `:63-64` asserts `executeTool should resolve to the respondWith promise value`;
  the rejection path (preventDefault without respondWith) is asserted at `:77-79`.
- `executeTool-flexible-types.https.html` asserts coercion: number->string for text, string->number,
  `1`/`'false'` for checkbox, numeric select values.
- `select-multiple-events.https.html`, `executeTool-no-autosubmit.https.html`,
  `executeTool-invalid-input.https.html`, `executeTool-abort.https.html`,
  `adopt-form-from-removed-iframe.https.html`, `sandboxed-iframe.https.html` cover multi-select
  events, autosubmit gating, schema-invalid input, abort, adoption, and sandbox behavior.

**Imperative lifecycle, `exposedTo`, cross-origin, policy.**
- 6 `exposedTo-*` tests (`cross-origin-child`, `defaults-cross-origin`, `defaults-same-origin`,
  `invalid-origins`, `multiple-children`, `window-open`) assert which iframes/windows see a `Tool`.
- `webmcp/imperative/permissions-policy.https.html:22` — `iframe.allow = \`tools ${originB}\`;`
  and `:58`, `:84`, `:114` assert `NotAllowedError` when the `tools` policy excludes the frame;
  `:105` uses `iframe.allow = "tools 'none'"`.
- `getTools-filtering.https.html` asserts `fromOrigins` filtering with cross-origin iframes.
- `executeTool-events.https.html:12-16` registers both `toolactivated` and `toolcancel` listeners on
  `document.modelContext`; `:73` — `toolactivated and toolcancel are each dispatched once per execution`.
- `opaque-origin-tools.https.html.headers` is `Content-Security-Policy: sandbox allow-scripts`
  (both declarative and imperative variants) to create an opaque origin.
- `duplicate_tool_registration`, `register_tool_name_validation`, `register_tool_invalid_json_schema`,
  `register_tool_with_schema`, `register_tool_no_schema`, `register_tool_signal`,
  `register_tool_toolchange`, `register_tool_title`, `register_tool_with_empty_annotation`,
  `object-arguments`, `getTools-imperative-schema`, `getTools-imperative-annotations`,
  `executeTool-*` (abort, across trees, navigation, detachment, reentrancy, races, signal cross-origin)
  cover the imperative API contract including the `Tool` object identity/race semantics.

**Top-level events.** `tool-activated-event.https.html` builds `ToolActivatedEvent` with and without an
init dict, asserts `toolName` default `''`, `isTrusted === false`, and `ontoolactivated` dispatch at
`document.modelContext` (`:36-37`); `tool-cancel-event.https.html` mirrors it for `ToolCancelEvent` /
`ontoolcancel` and documents the cancel ordering in
`https://webmachinelearning.github.io/webmcp/#cancel-a-pending-tool-execution`.

## 2. Chromium `third_party/blink/web_tests`

### 2.1 `external/wpt/webmcp/` — imported WPT mirror, in sync for sampled files

Root 7 entries (same 3 tests + META + 3 dirs), declarative 28 entries (25 WPT tests + `.headers` +
`WEB_FEATURES.yml` + **`unregister-during-executeTool.https-expected.txt`**), imperative 53 entries.
Blob identity (WPT master vs Chromium main, `git hash-object`):

| File | WPT | Chromium |
|---|---|---|
| `idlharness.https.window.js` | `1f65593c09379e0451124fe0ff5b3628fe02df4b` | same |
| `imperative/model_context.https.html` | `999eb8cb429ce0902574296961b0e3b2e9b578ca` | same |
| `tool-activated-event.https.html` | `07814c83c51a38c09f48ca51c711eab3fa7fed96` | same |
| `declarative/toolchange-on-attribute-mutation.https.html` | `070096b25903b3e5f21ac8dfc77ecf0ce78a7aa4` | same |
| `resources/helpers.js` | `d02d1facd41d6cc94913dcf13094bc6a8fc2ebed` | same |

This samples, not proves, the import revision; no per-tree pin was found in the paths probed.

**Recorded known failure in Chromium's import harness.** The extra expected file is:
```
external/wpt/webmcp/declarative/unregister-during-executeTool.https-expected.txt
[FAIL] Pre-submission DOM removal of declarative tool cancels pending executeTool() and fires toolcancel
[FAIL] Pre-submission attribute removal of declarative tool cancels pending executeTool() and fires toolcancel
```
Both assert `toolcancel should fire when declarative tool is removed while pending expected true got false`
(WPT source `webmcp/declarative/unregister-during-executeTool.https.html:148,195`). So the declarative
cancel-on-removal behavior is a **known Chromium failure** in the imported run on 2026-10-20, not a green
capability.

### 2.2 `wpt_internal/webmcp/` — Chromium-only tests (5 files + 1 CSS)

Latest commit touching the directory: **`61931ab55637`** (2026-10-15), "[3/N] WebMCP: Introduce the
`Tool` interface object", which itself cites the new WPT test
`external/wpt/webmcp/imperative/tool-re-registration-race.https.html`.

| Path | Asserts |
|---|---|
| `wpt_internal/webmcp/abort_registration_gc.https.window.js` | after `gc({type:'major'})`, aborting the registration signal unregisters the tool; re-registering the same name succeeds |
| `wpt_internal/webmcp/tool-window-retention-gc.https.html` | `Tool` weakly holds the registering `DOMWindow`; after iframe navigation `tool.window` is `null`, `executeTool` rejects `InvalidStateError`, releasing the Tool frees no document |
| `wpt_internal/webmcp/custom-element-fill.https.html` | form-associated custom element with `setToolParamSchema('{"type":"string"}')`; `toolFillCallback(json)` receives the string; `executeTool` fills its shadow DOM |
| `wpt_internal/webmcp/custom-element-invalid-schema.https.html` | `''`, `asdfasdf`, trailing-comma JSON, top-level array and top-level string schemas are all dropped from `inputSchema.properties`; only a valid string param remains |
| `wpt_internal/webmcp/custom-element-cease-param.https.html` | `setToolParamSchema(null)` removes the element's parameter; schema becomes `{"type":"object","properties":{},"required":[]}` |
| `wpt_internal/webmcp/css/tool-active-pseudo-parsing.html` | selector parsing for `:tool-form-active`, `:tool-submit-active`, `::part(my-part):tool-*`, `:is()`, `:has()`; invalid on `::before`/`::selection` |

These use Chromium-only `internals.numberOfLiveDocuments()`, `GCController.asyncCollectAll`/`gc()`, and
`ElementInternals.setToolParamSchema`, which is why they are not in WPT.

### 2.3 `wpt_internal/origin_trials/webmcp/` — feature gating (3 tests)

Directory latest commit **`9a8e124c66c6`** (2026-10-06), `[WebMCP] Split declarative WebMCP into its own
runtime feature`.

- `webmcp-origin-trial-enabled.https.html`: with token for `https://web-platform.test:8444/`, feature `WebMCP`,
  asserts `"modelContext" in document` and `agentInvoked` / `respondWith` present on `SubmitEvent.prototype`.
- `webmcp-origin-trial-disabled.https.html`: without token, asserts all three absent.
- `webmcp-origin-trial-kill-switch.https.html:19-20`:
  `document.modelContext should NOT be exposed when the kill-switch is active, even with a valid Origin Trial token!`
  -> `document.modelContext is not exposed when WebMCP is kill-switched` (`:20`); `agentInvoked`/`respondWith`
  absent too (`:24-28`).
- `web_tests/VirtualTestSuites:3187-3194` puts the disabled/enabled pair in the `stable` suite
  (`--stable-release-mode`), `:4979-4987` defines `webmcp-kill-switch` with
  `"--disable-features=WebMCP"` and `"exclusive_tests": "ALL"`.

### 2.4 `http/tests/inspector-protocol/webmcp/` — CDP surface (1 test)

- `invoke-tool-cross-origin.js` (commit **`6839bc1f7e70`**, 2026-06-16, `Cross-origin check for
  cross-document results in WebMCP.invokeTool`): declares a declarative
  `<form toolname="navigate_tool" ... toolautosubmit action="http://devtools.oopif.test:8080/...">`,
  calls `await dp.WebMCP.enable()` (`:14`) and `let response = await dp.WebMCP.invokeTool({` (`:28`)
  with `frameId`/`toolName`/`input`, then awaits `dp.WebMCP.onceToolResponded()` (`:27`).
- `invoke-tool-cross-origin-expected.txt:11-13` expects
  `errorText : Cannot return tool results after a cross-origin navigation` and `status : Error`.

### 2.5 CDP domain definition actually exercised by that test (primary contrast)

`third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (included from
`browser_protocol.pdl:63`) declares an `experimental domain WebMCP` with commands
`enable`, `disable`, `invokeTool`, `cancelInvocation` and events `toolsAdded`, `toolsRemoved`,
`toolInvoked`, `toolResponded`. Line 53-55: `Enabling the domain will trigger a toolsAdded event for all
currently registered tools.` Within `http/tests/inspector-protocol/webmcp/` (the only webmcp CDP test
path found), the sole test exercises `enable`, `invokeTool`, `toolResponded`. No file in the probed
webmcp test paths asserts `toolsAdded`, `toolsRemoved`, `toolInvoked`, or `cancelInvocation`; an
exhaustive tree-wide `web_tests` grep was not possible here (GitHub code search is login-walled and
gitiles has no search).

### 2.6 Feature status that determines when these tests can pass

`third_party/blink/renderer/platform/runtime_enabled_features.json5` (main, 2026-10-20):
- `:7526-7541` — `Imperative WebMCP: document.modelContext and its tool registration/execution APIs.`
  `name: "WebMCP"`, `origin_trial_feature_name: "WebMCP"`, `base_feature_status: "enabled"`, `status: "experimental"`.
- `:2378-2406` — `DeclarativeWebMCP`: `<form>` attributes `toolname`/`tooldescription`, the
  `:tool-form-active`/`:tool-submit-active` pseudo-classes, `SubmitEvent.agentInvoked`/`respondWith()`;
  same `origin_trial_feature_name: "WebMCP"`, `status: "experimental"`, implicitly requires `WebMCP`.
- `:7543-7555` — `WebMCPContinuations` (experimental), `WebMCPDeclarativeFileInput` (test),
  `WebMCPFormAssociatedCustomElements` (experimental).
- `web_tests/TestExpectations` (main, 790515 bytes / 8692 lines) has **0** matches for `webmcp` or
  `model_context` (83 for `inspector-protocol`, so the grep is live). `web_tests/FlagSpecificConfig`
  (8604 bytes / 220 lines) has **0** matches. No webmcp/model_context test is named in either file; the
  `stable` and `webmcp-kill-switch` entries in `VirtualTestSuites` are the only gating declarations found.

Version scope: these are main-branch expectations. The host's `/usr/bin/chromium` is
`Chromium 154.0.8037.97`; per PLAN's pre-probe it needs
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp` to expose
`document.modelContext`. Nothing in this report is a statement that the installed binary passes WPT.

## 3. What the test surfaces establish for C2 (lead quality)

1. **Name/shape corroboration, independent of the PLAN probe.** Upstream IDL and tests are
   `document.modelContext` (partial interface `Document`, `[SecureContext, SameObject]`); no WPT file
   sampled here references `navigator.modelContext`. Chromium commit `4a9fee9eafca` (2026-07-09) is titled
   `WebMCP: Remove navigator.modelContext` with body `It removes navigator.modelContext in favor of
   document.modelContext.` This is the primary test-side reason the probe's negative
   `'modelContext' in navigator` result is expected, not surprising.
2. **Declarative form surface is well-specified by tests.** Attributes `toolname`, `tooldescription`,
   `tooltitle`, `toolautosubmit`, `toolparamdescription`; schema mapping (types, `required`,
   `multipleOf: 1`); `toolchange` firing on attribute mutation; duplicate/collision rules;
   CSP-sandbox opaque origins; no-frame documents. This is more than the PLAN probe's single
   `toolname`/`tooldescription` fixture, so the capability note can cite the contract rather than only
   the observed event payload.
3. **`toolsAdded` has no in-tree test anchor found.** The PDL declares it and states enable triggers it
   for all registered tools, but none of the probed `web_tests` webmcp paths asserts it (tree-wide search
   unavailable). The PLAN probe's `WebMCP.toolsAdded` observation therefore rests on the probe receipt
   alone; do not describe it as "covered by tests".
4. **Cancellation is not fully green in Chromium.** The imported WPT run records two `[FAIL]` subtests
   for declarative pre-submission removal/attribute removal (`unregister-during-executeTool.https-expected.txt`).
   Any note claiming "declarative tools cancel correctly" must scope to what passes (imperative
   `executeTool-abort`, `toolcancel` event tests) and name this exception.
5. **Gating is two-feature.** `WebMCP` (imperative, `document.modelContext`) and `DeclarativeWebMCP`
   (forms/CSS/SubmitEvent extensions) are separate runtime features sharing origin trial name `WebMCP`;
   `--disable-features=WebMCP` is the kill switch, and the `stable` virtual suite asserts absence under
   `--stable-release-mode`. On this host, PLAN's probe (not reproduced here) is the only evidence that
   the surface is reachable, and it required explicit flags.
6. **`tools` is the Permissions-Policy token** used by `exposedTo`/cross-origin tests
   (`iframe.allow = \`tools ${origin}\``; `NotAllowedError` when excluded). This is a concrete,
   test-backed restriction the capability note can assert without re-deriving it from C++.

## 4. Proposed SOURCES rows (L1 writes; only after accepting the quotes above)

All quotes opened this session, access 2026-10-20. Suggested IDs continue staging's S030+; L1 assigns.

| Proposed row | URL | kind/tier | Revision | Scoped claim | Located quote |
|---|---|---|---|---|---|
| WPT WebMCP tests | https://github.com/web-platform-tests/wpt/tree/a72ba094b342faa0213d26330d6e09e2359ea43f/webmcp | code / A | master `a72ba09…`; dir commit `e61b072782cf` (2026-10-17) | Upstream WebMCP WPT suite: 78 tests, `document.modelContext`, declarative form tools, `exposedTo`, `tools` policy | `idl_test(['webmcp'], ['html', 'dom'], …)` — `webmcp/idlharness.https.window.js:8-9` |
| WPT declarative schema test | https://github.com/web-platform-tests/wpt/blob/c94abb33b8b0/webmcp/declarative/getTools-declarative-schema.https.html | code / A | `c94abb33b8b0` (2026-09-10) | Declarative `<form toolname/tooldescription>` maps inputs+`toolparamdescription` to JSON Schema with `required` | `<form toolname="search_tool" tooldescription="Search the web">` — `:10` |
| WPT `model_context` test | https://github.com/web-platform-tests/wpt/blob/ba157201a888/webmcp/imperative/model_context.https.html | code / A | `ba157201a888` (2026-10-08) | `document.modelContext` is a `ModelContext`; inactive `createHTMLDocument()` rejects `InvalidStateError` | `createHTMLDocument().modelContext rejects tool operations with InvalidStateError` — `:70` |
| Chromium `wpt_internal/webmcp` | https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/web_tests/wpt_internal/webmcp/ | code / A | main `0a2991ca…`; dir commit `61931ab55637` (2026-10-15) | Chromium-only GC/custom-element/`Tool`-retention tests; weak `DOMWindow` in `Tool` | `A retained Tool does not keep its registering window's Document alive` — `tool-window-retention-gc.https.html` title |
| Chromium origin-trial WebMCP | https://chromium.googlesource.com/chromium/src/+/9a8e124c66c6/third_party/blink/web_tests/wpt_internal/origin_trials/webmcp/ | code / A | `9a8e124c66c6` (2026-10-06) | Origin trial `WebMCP` exposes `document.modelContext`; kill switch suppresses even with valid token | `document.modelContext is not exposed when WebMCP is kill-switched` — kill-switch `:20` |
| Chromium CDP `WebMCP.invokeTool` test | https://chromium.googlesource.com/chromium/src/+/6839bc1f7e70/third_party/blink/web_tests/http/tests/inspector-protocol/webmcp/invoke-tool-cross-origin.js | code / A | `6839bc1f7e70` (2026-06-16) | CDP `WebMCP.enable` + `invokeTool` + `toolResponded`; cross-origin navigation returns error | `errorText : Cannot return tool results after a cross-origin navigation` — expected `:11` |
| Chromium WebMCP PDL | https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | code / B | main `0a2991ca…` | `experimental domain WebMCP`; enable/disable/invokeTool/cancelInvocation + 4 events; enable emits `toolsAdded` | `Enabling the domain will trigger a toolsAdded event for all currently registered tools.` — `:53-55` |
| WPT migration provenance | https://github.com/web-platform-tests/wpt/commit/a7e7281f12ab | code / B | `a7e7281f12ab` (2026-03-23) | WebMCP WPT suite originated as Chromium `wpt_internal/script_tools` | `[WebMCP] Move wpt_internal/script_tools to external/wpt/webmcp` — subject |
| Chromium `navigator.modelContext` removal | https://chromium.googlesource.com/chromium/src/+/4a9fee9eafca | code / B | `4a9fee9eafca` (2026-07-09) | `document.modelContext` replaced `navigator.modelContext` | `It removes navigator.modelContext in favor of document.modelContext.` — message |

Rows already owned by other seats: `runtime_enabled_features.json5` flag/status facts and the PDL are
likely SrcChromiumFlags/SrcChromiumPdl territory; the entries above are scoped to test evidence and
should defer if those seats open them first.

## 5. Remaining unknowns / limits

- **Import pin:** Chromium's `external/wpt` roll revision is not recorded in the probed paths. Sampled
  blobs match WPT master on 2026-10-20, but that is not a full-tree proof; treat the mirror as
  "same content for sampled files", not "rolled at `a72ba09`".
- **Pass rates:** no `wpt.fyi` run data was opened. The only pass/fail signal collected is Chromium's
  committed expected file (2 declarative `[FAIL]`s).
- **Non-web_tests coverage:** `toolsAdded`/`toolsRemoved`/`cancelInvocation` may be covered by
  gtest/devtools-frontend tests, but no such file was opened here; path probes for
  `content/browser/devtools/protocol/webmcp_handler_unittest.cc` and
  `third_party/blink/renderer/modules/webmcp/` returned 404.
- **No browser run:** no test was executed; every assertion above is read from source. The PLAN probe's
  Chromium 154 result is cited only as PLAN-reported, not reproduced here.
- No tool install/upgrade was needed or performed; no pacman transaction attempted.
