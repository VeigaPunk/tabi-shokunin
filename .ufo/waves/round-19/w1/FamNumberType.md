# FamNumberType-4 — round 19 C1 number-type evidence

Axis: depth. The assigned declarative `<input type="number">` family is covered by five decision cases, each invoked twice on the pinned runtime. The two observations for every case agree; no nondeterminism was observed.

## Probe and result

Probe evidence: `corpus/evidence/round-19/validation/probes/number-type.json` in commit `7d50c1c437fcee8b1f0bc1030b3f0f4c3b1d2811`. It retains raw `WebMCP.enable`, `toolsAdded` (including `inputSchema`), `invokeTool` parameters/reply, correlated `toolInvoked` and `toolResponded` event parameters, `window.__obs.calls`, and post-invoke input control state for both repeats.

Runtime identity: Chromium `154.0.8037.97 Arch Linux` (`/usr/bin/chromium`), Playwright `1.64.0`, Node `v24.21.0`. The recorded effective Chromium argv contains `--remote-debugging-pipe`, the host-resolver deny rule, and merged WebMCP / Playwright feature switches; it has no `--remote-debugging-port`. Each fresh context disabled downloads, the fixture server bound only to `127.0.0.1`, and the page route guard recorded no blocked requests. The private HOME and TMPDIR were under a fresh short `/tmp/nt-*` directory, removed by cleanup after the run; no browser owned by this probe was left running.

`toolsAdded` was stable in all ten observations: `inputSchema` was `{type: object, properties: {n: {type: number, multipleOf: 1, description: "Number"}}, required: []}`. Case outcomes:

| Case | `invokeTool` input | `toolResponded` status / `errorText` | Submit count / post-invoke fields | Chromium source anchor |
|---|---|---|---|---|
| `decl-number-type-01` | `{n: 42}` | `Completed` / `null` | `1` / `{"n":"42"}` | `form_mcp_schema.cc:321-334` |
| `decl-number-type-02` | `{n: "42"}` | `Completed` / `null` | `1` / `{"n":"42"}` | `form_mcp_schema.cc:321-334` |
| `decl-number-type-03` | `{n: "not-a-number"}` | `Error` / `Invalid value "not-a-number" for parameter n` | `0` / `{"n":""}` | `form_mcp_schema.cc:208-230` |
| `decl-number-type-04` | `{n: true}` | `Error` / `Invalid value "true" for parameter n` | `0` / `{"n":""}` | `form_mcp_schema.cc:208-230` |
| `decl-number-type-05` | `{n: 1.25e+21}` | `Completed` / `null` | `1` / `{"n":"1.25000e+21"}` | `form_mcp_schema.cc:321-334` |

The `inputSchema.properties.n.type` expectation is `number` in each case. The exponent input is sent as a JSON number (`toolInvoked.input` preserves `{"n":1.25e+21}`); Chromium accepts it and the number control exposes the canonicalized value `1.25000e+21`.

## Chromium source check

Both files were fetched from Gitiles with `?format=TEXT`, base64-decoded, and the cited lines checked in the decoded bodies on 2026-10-21.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`, tag `154.0.8037.97`: [source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), decoded body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. At `703-731`, `schema->SetString("type", "number");` emits the declared schema. At `321-334`, `ToString` output is accepted only when nonempty and `input->SanitizeValue(number_string)` is nonempty; this accounts for accepted numeric JSON/string values and exponent form. At `208-230`, invalid values return the observed `Invalid value ... for parameter ...` error; line 210 states, “If the data isn't valid, form control states remain unchanged.”
- `third_party/blink/renderer/core/html/forms/html_form_element.cc`, tag `154.0.8037.97`: [source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. At `174-221`, `ExecuteTool` forwards input through `FillFormControls`, returns validation errors, and proceeds to autosubmit on success; line 219 says, “With the `toolautosubmit` attribute, we immediately submit the form.”

## Run note and tooling

An initial launch attempt using a long nested scratch TMPDIR failed before page load because Chromium reported a Unix-domain singleton socket path that was too long. The probe was adjusted to use a fresh private short `/tmp/nt-*` TMPDIR/HOME root, then completed all ten invocations and removed that root. No tool was installed or updated.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamNumberType-4`
- Branch: `r19/FamNumberType-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `7d50c1c437fcee8b1f0bc1030b3f0f4c3b1d2811`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/number-type.json`
  - `corpus/evidence/round-19/validation/fixtures/number-type.html`
  - `corpus/evidence/round-19/validation/probes/number-type.json`
