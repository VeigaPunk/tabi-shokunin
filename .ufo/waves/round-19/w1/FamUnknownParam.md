# FamUnknownParam-4 — unknown declarative form parameters

**Verdict:** completed the assigned C1 `unknown-param` family: 3 runtime cases, each repeated once for stability (6 invocations total). No blockers and no tools were installed or updated.

## Probe and retained evidence

Probed the loopback-only fixture using Node 24.21.0, Playwright 1.64.0, and `/usr/bin/chromium` (browser version `154.0.8037.97`). The throwaway script is `/fast/scratch/tabi-r19/FamUnknownParam-4-probe/probe.mjs`; it is not committed. It used a private profile, HOME and TMPDIR under `/fast/scratch/tabi-r19/FamUnknownParam-4-probe/run-*`, `acceptDownloads:false`, a Playwright CDP pipe via `context.newCDPSession(page)`, `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`, and merged WebMCP feature args with Playwright 1.64.0's defaults. The effective argv guard observed the pipe, no remote-debugging TCP port, the host-resolver rule, and the WebMCP feature switches. The fixture server bound to `127.0.0.1` only.

The probe performed `WebMCP.enable`, retained `WebMCP.toolsAdded` including the full input schema, invoked with raw `{frameId, toolName, input}` params, waited for `WebMCP.toolResponded` (≤8 seconds), and recorded the returned protocol events plus page-side `window.__obs.calls` and post-invoke input values. All six trials returned normally. The browser context was closed, matching Chromium processes were drained, and its scratch run tree was removed; no `/tmp` path was used. Repeated statuses, error text, schema, submit counts and field states were identical. Frame IDs and invocation IDs differed between repetitions, as expected; no result nondeterminism was observed.

The raw CDP and post-invoke records are retained at `corpus/evidence/round-19/validation/probes/unknown-param.json` in the clone. The production fixture and case file are retained at `corpus/evidence/round-19/validation/fixtures/unknown-param.html` and `corpus/evidence/round-19/validation/cases/unknown-param.json`.

## Per-case observations

The `toolsAdded` schema in all six trials was an object with `query` and `other` string properties (descriptions `Query` and `Other`) and an empty `required` list. Every invalid invocation produced one `WebMCP.toolResponded` with `status: "Error"`; each had zero page submit calls. The field values below are post-invocation control states.

| Case | Input → observed status / errorText / fields | Source anchor |
|---|---|---|
| `decl-unknown-param-01` | `{"unknown":"sentinel-only"}` → `Error`; `Input contains a parameter "unknown" but there is no such parameter for the tool`; `calls=[]`; fields `{query:"initial-query", other:"initial-other"}`. | `form_mcp_schema.cc:208-244` — unknown parameter is rejected during validation. |
| `decl-unknown-param-02` | `{"query":"changed-valid","unknown":"sentinel-mixed"}` → `Error`; same unknown-parameter error; `calls=[]`; fields remain `{query:"initial-query", other:"initial-other"}` although the valid `query` key precedes the unknown key. | `form_mcp_schema.cc:208-244` — validation completes before the separate value-application pass. |
| `decl-unknown-param-03` | `{"queryId":"sentinel-id"}` → `Error`; `Input contains a parameter "queryId" but there is no such parameter for the tool`; `calls=[]`; fields remain `{query:"initial-query", other:"initial-other"}`. In the fixture, `queryId` is an input's `id` while `query` is its `name` and schema property. | `form_mcp_schema.cc:1243-1245` — form parameter mapping uses `GetWebMCPParameterName()`, not the control id. |

## Source evidence

Fetched the Gitiles `?format=TEXT` bodies at Chromium tag `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), decoded the base64 bodies, and checked the cited source lines. Access date: **2026-10-21**.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, [Gitiles source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. At line 210: “If the data isn't valid, form control states remain unchanged.” Lines 219-221 construct the unknown-parameter error text; lines 208-244 validate all keys before applying values. Lines 1244-1245 build the mapping using `String name = form_control->GetWebMCPParameterName(); EnsureControlVector(name).push_back(form_control);`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc`, [Gitiles source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Lines 196-197 return the error callback on failure; successful `toolautosubmit` proceeds to `PrepareForSubmission` at lines 219-220.

These results describe only the flagged Chromium 154.0.8037.97 build and the local loopback fixture; they do not claim cross-version behavior or a declarative-WebMCP standard guarantee. No build, test suite, lint, or formatter was run; the requested six-invocation browser probe was the only runtime check.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamUnknownParam-4`
- Branch: `r19/FamUnknownParam-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `b4791c9b79ed7a57c3b652bf4f6be4b58d9d6bd6`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/unknown-param.json`
  - `corpus/evidence/round-19/validation/fixtures/unknown-param.html`
  - `corpus/evidence/round-19/validation/probes/unknown-param.json`
