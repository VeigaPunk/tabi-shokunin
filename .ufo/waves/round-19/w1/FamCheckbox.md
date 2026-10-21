# FamCheckbox-4 — Round 19 C1 checkbox probe

## Result

Completed the assigned `checkbox` family in the isolated production clone. The fixture has one declarative WebMCP tool and two checkbox parameters: `withoutValue` has no `value` attribute (DOM value defaults to `on`), while `withValue` has `value="checkbox-choice"`. Chromium exposed both as schema type `boolean`, independent of the attribute.

`expect.fields` uses booleans for each checkbox's post-invocation `.checked` state, as requested; the retained probe also records the DOM `value`, `hasValueAttribute`, submitted `FormData`, and raw WebMCP CDP event/request data.

## Case observations

| Case | invokeTool input | toolResponded | submit / checked state | Schema and source anchor |
|---|---|---|---|---|
| `decl-checkbox-01` | `{"withoutValue":true,"withValue":true}` | `Completed`, no `errorText` | 1 submit; both checked `true`; FormData was `{"withoutValue":"on","withValue":"checkbox-choice"}` | Both properties `boolean`; `form_mcp_schema.cc:970-981` |
| `decl-checkbox-02` | `{"withoutValue":false,"withValue":false}` | `Completed`, no `errorText` | 1 submit; both checked `false`; FormData was `{}` | Both properties `boolean`; `form_mcp_schema.cc:970-981` |
| `decl-checkbox-03` | both fields `"checkbox-choice"` | `Error`; `Invalid value "checkbox-choice" for parameter withValue` | 0 submits; both remain unchecked | Both properties `boolean`; `form_mcp_schema.cc:345-352` |
| `decl-checkbox-04` | both fields `"on"` | `Error`; `Invalid value "on" for parameter withValue` | 0 submits; both remain unchecked | Both properties `boolean`; `form_mcp_schema.cc:345-352` |
| `decl-checkbox-05` | both fields `"unrelated"` | `Error`; `Invalid value "unrelated" for parameter withValue` | 0 submits; both remain unchecked | Both properties `boolean`; `form_mcp_schema.cc:345-352` |

All five observed rows are the `expect` values in `cases/checkbox.json`. To isolate each member of the input pair, the retained probe additionally sends each of the three strings to each checkbox parameter alone. All six isolated inputs returned `Error` naming the targeted parameter, no submit, and unchanged unchecked controls. This confirms the string result for both the checkbox with no explicit value and the checkbox with an explicit value; these are supplemental probe records, not additional case rows.

## Runtime and repeatability

- Chromium `/usr/bin/chromium`: `154.0.8037.97`; Node `v24.21.0`; existing global Playwright `1.64.0`.
- Used the round-18 WebMCP feature flags merged with Playwright defaults, `/usr/bin/chromium`, private per-run HOME/TMPDIR, `acceptDownloads:false`, blocked service workers, host-resolver deny except `127.0.0.1`, exact-origin loopback request guard, WebSocket blocking, and Playwright CDP pipe (no DevTools TCP port). Effective-argv guards passed.
- Ran five cases plus six isolated input probes twice. Status, `errorText`, schema, page calls, and post-invoke states matched for every input; no nondeterminism observed.
- Across the two runs, all 22 Chromium contexts had no remaining profile-owned PID and their private temporary trees were removed; no requests were blocked because the fixture made no out-of-origin requests.
- One preliminary throwaway launch using a longer temporary path failed with Chromium `Socket path too long`. Moving the per-run private root to a short unique `/tmp/fc4-*` path resolved it. Those private roots were removed; no `/tmp` residue remains. No tool was installed or updated.

## Chromium source checks

Gitiles `?format=TEXT` bodies were decoded before hashing; line ranges were also checked in the rendered source view. Access date: 2026-10-21.

- `form_mcp_schema.cc:347`: “Single checkboxes are represented as a boolean in the schema.” Lines `345-352` validate a single checkbox through `ToBoolean`; line `814` emits `type: boolean`; lines `970-981` apply that boolean with `SetChecked`. The `FillData` validation pass precedes its apply pass (`217-250`), matching the observed unchanged state on invalid values.
  - URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
  - Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`
- `form_mcp_schema.cc:218`: “If the data isn't valid, form control states remain unchanged.”
  - URL and decoded-body SHA-256: same `form_mcp_schema.cc` source above.
- `html_form_element.cc:204-205` returns the fill error before the submit path; `:227-228` reaches `PrepareForSubmission` on the autosubmit success path. Line `227` says: “With the `toolautosubmit` attribute, we immediately submit the form.”
  - URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
  - Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`

## Files and evidence

Production files changed in the clone:

- `corpus/evidence/round-19/validation/fixtures/checkbox.html`
- `corpus/evidence/round-19/validation/cases/checkbox.json`
- `corpus/evidence/round-19/validation/probes/checkbox.json` — raw first-run `WebMCP.enable`, `toolsAdded`, `invokeTool` params/replies, `toolResponded` params, page calls and control states; isolated input outcomes and repeat-run stability summary.

No project build, lint, or test suite was run; the assigned runtime probe was run twice. No blockers remain.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamCheckbox-4`
- Branch: `r19/FamCheckbox-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `55866459603607a9650a8ddd08916080f48e7fbf`
- Changed paths:
  - `corpus/evidence/round-19/validation/cases/checkbox.json`
  - `corpus/evidence/round-19/validation/fixtures/checkbox.html`
  - `corpus/evidence/round-19/validation/probes/checkbox.json`
