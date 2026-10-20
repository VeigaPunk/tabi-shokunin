# WebmcpProbeIssues — round-16 wave-1 report (claim C2, advisory)

Seat: `TabiR16.WebmcpProbeIssues-5`. Assignment: load malformed declarative WebMCP
forms under the PLAN flags with `Audits.enable`, record `Audits.issueAdded`
payloads, whether a tool is still registered, and console messages.

## Files changed (owned, all absolute under lane root)

- `.ufo/waves/round-16/probes/WebmcpProbeIssues.mjs` — new probe (353 lines), sha256
  `92f191ce0486f9efc0dd86cb7944c002bbcef984e16e8fd9bd8a70e693ef3f7f`.
- `.ufo/waves/round-16/probes/WebmcpProbeIssues.json` — probe output, schema
  `tabi-round16-webmcp-issues-probe-v1`, generated 2026-10-20T14:32:14Z,
  `probeSha256` inside the JSON matches the delivered script above.
- `.ufo/waves/round-16/w1/WebmcpProbeIssues.md` — this report.

## How it runs (verified)

`node .ufo/waves/round-16/probes/WebmcpProbeIssues.mjs` → exit 0, last stdout:

```
PROBE_ISSUES verdict=done cases=10 issueCodes=GenericIssue out=…/WebmcpProbeIssues.json
```

Runtime (all pinned in JSON `runtime`): Chromium 154.0.8037.97 `/usr/bin/chromium`
(exe sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`),
Playwright 1.64.0 from fnm global npm root, Node v24.21.0. Headless, fresh
mkdtemp profile (removed after run), fixtures served by an in-process Node http
server bound to `127.0.0.1:0`, non-loopback traffic impossible (fixture HTML is
self-contained; favicon gets an in-process 204). Flags per PLAN:
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
--enable-blink-features=WebMCP,WebMCPTesting`. Per page: CDP `WebMCP.enable` +
`Audits.enable` (both returned `{}`), then load, 750 ms settle, then
`document.modelContext.getTools()` in-page.

## Findings (all observed, verbatim payloads in JSON `cases[]`)

1. **Wire shape:** every form issue arrives as `Audits.issueAdded` with
   `issue.code === "GenericIssue"` (not a WebMCP-specific code); the specific
   error lives at `issue.details.genericIssueDetails.errorType`, plus
   `violatingNodeId` (and `violatingNodeAttribute` on autofill issues).
2. **Every issue is emitted twice** per page load (identical `errorType` +
   `violatingNodeId` pairs). Harness/scribes should dedupe on
   `(errorType, violatingNodeId, violatingNodeAttribute)` or expect ×2 counts.
3. Per-case results:

   | case | tool registered? | `WebMCP.toolsAdded` inputSchema | errorTypes (deduped) |
   |---|---|---|---|
   | missing-toolname | **no** | — | FormModelContextMissingToolName |
   | missing-tooldescription | **no** | — | FormModelContextMissingToolDescription |
   | input-without-name | yes (`search`) | `properties:{"":{type:"string"}}` | FormModelContextParameterMissingName, FormModelContextParameterMissingTitleAndDescription, FormEmptyIdAndNameAttributesForInputError |
   | required-input-without-name | yes (`search`) | `properties:{"":…,"ok":…}, required:[""]` | FormModelContextRequiredParameterMissingName, FormModelContextParameterMissingTitleAndDescription ×2 nodes, FormEmptyIdAndNameAttributesForInputError |
   | param-missing-title-and-description | yes (`search`) | `properties:{q:{type:"string"}}` | FormModelContextParameterMissingTitleAndDescription |
   | positive-control (`title="Query"`) | yes (`search`) | `properties:{q:{type:"string"}}` | **FormModelContextParameterMissingTitleAndDescription** — `title=` does NOT satisfy the check |
   | param-with-toolparamdescription | yes | `q.description:"Query text"` | none — clean |
   | param-with-label (`<label for>`) | yes | `q.description:"Query"` | none — clean |
   | param-with-aria-label | yes | `q` (no description) | FormModelContextParameterMissingTitleAndDescription — `aria-label` does NOT satisfy |
   | param-with-toolparamtitle | yes | `q` (no description) | FormModelContextParameterMissingTitleAndDescription — `toolparamtitle` unrecognized (absent from binary strings) |

4. **`FormModelContextParameterMissingTitleAndDescription` is silenced only by
   `toolparamdescription` or an associated `<label>`** — the value lands in
   `inputSchema.properties.<name>.description`. `title=`, `aria-label=`, and the
   speculative `toolparamtitle=` all fail; the L1 positive-control fixture
   (`<input name="q" title="Query">`) therefore emits this issue too. If the
   harness's "declarative form positive" case asserts zero issues it will fail;
   use `toolparamdescription` or a `<label>` on each input.
5. **Malformed forms still register tools whenever `toolname`+`tooldescription`
   are present.** A nameless input is not dropped: it becomes a property under
   the empty-string key `""`; a nameless `required` input puts `""` in
   `required[]`. `document.modelContext.getTools()` returns the tool in-page
   (name `search`) for all such cases — consistent with `WebMCP.toolsAdded`.
6. `FormEmptyIdAndNameAttributesForInputError` fires on nameless inputs — an
   autofill/form-validation issue unrelated to WebMCP; keep it out of the
   WebMCP issue tally.
7. `document.modelContext` is an object, `'modelContext' in navigator` is false
   on every flagged page (re-confirms the L1 pre-probe). Console per case is a
   single `fixture-loaded <case>` log; no page errors, no WebMCP console
   warnings (issues go to Audits only).

## Binary-string cross-check

`strings /usr/lib/chromium/chromium` confirms all five `FormModelContext*`
errorType strings, `toolname`/`tooldescription`/`toolparamdescription`,
`toolautosubmit` (untested), `ScheduleDeclarativeWebMCPToolRegistration`, and the
DevTools markdown `genericFormModelContext*.md` paths. No `toolparamtitle`.

## Retained evidence

- `.ufo/waves/round-16/probes/WebmcpProbeIssues.json` — full verbatim
  `Audits.issueAdded` payloads, `WebMCP.toolsAdded` events, `getTools()` surface,
  console messages, runtime+flag pins, per-case `issueCodes`.

## Risks / limits

- Issues are emitted twice; dedupe rule noted above.
- `violatingNodeId` is a CDP DOM node id — stable within a case, not across runs.
- Loopback only; temp profile; no real site, no user profile.
- `toolautosubmit` and the "no submit button" console warning
  (`No submit button was found, but for a form without toolautosubmit…` binary
  string) not exercised here — candidate for a later probe.
- Audits batching is timing-sensitive; 750 ms settle was sufficient (10/10
  cases populated) but a slower box may want a larger settle.

## Blockers

None.

## Tool installs

None (Chromium/Playwright/Node already present; pacman pause respected — nothing
installed).
