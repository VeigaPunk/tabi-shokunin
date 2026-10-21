# Tabi round 19 W1 — FamNonScalar

**Verdict: complete.** Added the non-scalar declarative WebMCP fixture, five contract cases, and a raw CDP probe bundle. All production artifacts are in the isolated clone; only this advisory report was written in the lane.

## Runtime and probe setup

- Observed runtime: Chromium `154.0.8037.97` from `/usr/bin/chromium`, Playwright `1.64.0`, Node `v24.21.0`.
- The throwaway probe is `/fast/scratch/tabi-r19/FamNonScalar-probe/non-scalar-probe.mjs`; it is not committed. It used `chromium.launch({ executablePath: '/usr/bin/chromium' })`, Playwright-default feature merging with WebMCP features, CDP pipe sessions from `context.newCDPSession(page)`, `acceptDownloads:false`, private per-run HOME/TMPDIR, the host-resolver deny rule, and a request route permitting only the fixture's 127.0.0.1 origin.
- Each main case and each of eight single-value scalar diagnostics was run twice. `WebMCP.toolResponded` was awaited for up to 8 seconds per invocation. Repeated semantic results (status/error text, submit count, DOM states, schema) matched; fresh frame and invocation IDs varied.
- Fixture bytes: 1,710; SHA-256 `fb246f56a5f32c2c18c3617e1a73d0e5a4ae09c4ab27e4f290bc597b80e34c19`.
- A first supplemental launch aborted because Chromium's Unix-domain socket path was too long. The temporary run directory was shortened; the eight individual diagnostics then ran twice successfully. Each successful browser run closed its browser and server, confirmed its owned process markers were gone, and removed its per-run directory. No tool was installed or updated.

## Five committed contract cases

`corpus/evidence/round-19/validation/cases/non-scalar.json` contains five cases, all with `expect` values from the observed Chromium results:

1. **`decl-non-scalar-01` — `decl-nonscalar-text`.** Input sends `text_null:null`, `text_array:["a",2,{"nested":true}]`, `text_nested:{"nested":{"value":"x"}}`, and `text_long:"T" × 102,400` in one call. Observed `status=Error`, `errorText="Invalid value for parameter text_array"`, `submitCount=0`; fields remained `text_null=seed-null`, `text_array=seed-array`, `text_nested=seed-nested`, `text_long=seed-long`. Source: `form_mcp_schema.cc:208-230`.
2. **`decl-non-scalar-02` — `decl-nonscalar-number`.** Input sends `number_null:null`, `number_array:["3",4]`, `number_nested:{"nested":{"value":5}}`, and `number_long:"7" × 102,400` in one call. Observed `status=Error`, `errorText="Invalid value for parameter number_array"`, `submitCount=0`; fields remained `11`, `12`, `13`, `14`. Source: `form_mcp_schema.cc:208-230`.
3. **`decl-non-scalar-03` — top-level array** `[{"text_null":"unexpected-array-member"}]`. The CDP send failed with `cdpSession.send: Protocol error (WebMCP.invokeTool): Invalid parameters`; there was no invocation ID or `toolResponded` within 8 seconds, `submitCount=0`, and all text fields retained their seed values. Source: `unresolved` (the observed failure is at CDP parameter validation, before the form handler).
4. **`decl-non-scalar-04` — top-level string** `"not-an-object"`. Same CDP `Invalid parameters` failure, no invocation ID or `toolResponded` within 8 seconds, no submit, and unchanged text fields. Source: `unresolved`.
5. **`decl-non-scalar-05` — top-level null** `null`. Same CDP `Invalid parameters` failure, no invocation ID or `toolResponded` within 8 seconds, no submit, and unchanged text fields. Source: `unresolved`.

The form schemas observed in `WebMCP.toolsAdded` were objects: text properties had `type:"string"`; number properties had `type:"number"` and `multipleOf:1`. The case file records the corresponding schema expectations.

## Individual scalar diagnostics retained in the probe

The five-case limit requires each scalar form case above to batch its four values; Chromium rejects the first failing property in that batch. The probe therefore also retains raw, independently invoked scalar diagnostics, each repeated once. They show:

| Control value | Text control | Number control |
|---|---|---|
| `null` | `Error`, `Invalid value for parameter text_null`; no submit; seed unchanged | `Error`, `Invalid value for parameter number_null`; no submit; seed unchanged |
| Array | `Error`, `Invalid value for parameter text_array`; no submit; seed unchanged | `Error`, `Invalid value for parameter number_array`; no submit; seed unchanged |
| Nested object | `Error`, `Invalid value for parameter text_nested`; no submit; seed unchanged | `Error`, `Invalid value for parameter number_nested`; no submit; seed unchanged |
| 100 KB string | `Completed`, one submit; `text_long` became 102,400 `T` characters (SHA-256 `4efe27830961af0b109ef2089f97108b4c945566312a88cd5f13da8aab7ed9f6`) | `Error`; no submit; seed unchanged. `toolResponded.errorText` contains the rejected 102,400-digit value and is 102,442 characters long. |

The complete long inputs, raw `WebMCP.invokeTool` params, `toolsAdded` schemas, invoke replies/errors, `toolResponded` params, event observations, and post-invoke control states are in `corpus/evidence/round-19/validation/probes/non-scalar.json` without truncating the long values.

## Chromium source anchors

Both files were fetched from Gitiles `?format=TEXT` at tag `154.0.8037.97`, decoded from base64, and line-checked on 2026-10-21. SHA-256 values below are for the decoded source bodies.

| Anchor and observed relevance | Quote (under 25 words) | URL | Access date | Decoded-body SHA-256 |
|---|---|---|---|---|
| `form_mcp_schema.cc:49-68` — `ToString` accepts strings, integers, doubles, and booleans; other JSON kinds return false. | “bool ToString(const JSONValue& value, String& out)” | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `form_mcp_schema.cc:208-243` — invalid input returns before the later fill pass; line 210 documents the unchanged-state rule. | “If the data isn't valid, form control states remain unchanged.” | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `form_mcp_schema.cc:302-334` — text and number validation uses `ToString` and control sanitization. | “if (!ToString(value, s))” | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-21 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `html_form_element.cc:232-258` — the renderer form handler parses JSON and converts non-object JSON into an invalid-input error if reached. The three top-level calls above did not reach it. | “JSON input arguments must be an object” | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-21 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |

## Risks and blockers

- No blocker. Top-level non-object inputs are rejected by CDP as invalid method parameters, so they have `status:"no-response"` rather than a renderer `toolResponded` error; their direct source is recorded as unresolved instead of attributing an unobserved renderer path.
- The formal text and number cases are mixed-input batches: the first invalid array property masks later values in each single invocation. Independent, repeated per-value outcomes are retained in the probe evidence and listed above; do not interpret the batched error as an individual long-string result.
- No build, lint, formatter, or suite was run; the requested Chromium probe and its stability reruns were the only exercised checks.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamNonScalar`
- Branch: `r19/FamNonScalar`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `a084ea74a118b29213bbe79e1948cb65db670844`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/non-scalar.json`
  - `corpus/evidence/round-19/validation/fixtures/non-scalar.html`
  - `corpus/evidence/round-19/validation/probes/non-scalar.json`
