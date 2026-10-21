# FamSelectEnum — round 19 W1

## Result

Implemented the `select-enum` C1 family in the isolated clone with four observed cases: an option's value, that option's distinct visible label, a value absent from the options, and a disabled option's value. Each case records the same observed `toolsAdded` input schema and asserts it through the C1 `expect.schema` paths.

Chromium 154 derived `properties.choice` as `type: "string"`, `anyOf` with `{type:"string", const:<option value>, title:<visible option text>}` entries, and a redundant `enum` of all three option values. The disabled option is present in both `anyOf` and `enum`; no `oneOf` property is emitted. The visible text is a title, not an accepted input value.

## Per-case observations

| Case | `invokeTool` input | `toolResponded` status / error text | Submit count | Post-invoke control fields | Submit-event / response fields | Source anchor |
|---|---|---|---:|---|---|---|
| `decl-select-enum-01` | `{"choice":"beta-code"}` | `Completed`; no `errorText` | 1 | `{"choice":"beta-code"}` | `{"choice":"beta-code"}` | `form_mcp_schema.cc:390-405` (option-value membership), schema derivation `:733-770` |
| `decl-select-enum-02` | `{"choice":"Beta visible label"}` | `Error`; `Invalid value "Beta visible label" for parameter choice` | 0 | `{"choice":"alpha-code"}` (unchanged initial selection) | no submit event | `form_mcp_schema.cc:390-405` (membership uses option values), error mapping `:221-231`, schema titles `:733-770` |
| `decl-select-enum-03` | `{"choice":"missing-code"}` | `Error`; `Invalid value "missing-code" for parameter choice` | 0 | `{"choice":"alpha-code"}` (unchanged initial selection) | no submit event | `form_mcp_schema.cc:390-405` (membership uses option values), error mapping `:221-231` |
| `decl-select-enum-04` | `{"choice":"disabled-code"}` | `Completed`; no `errorText` | 1 | `{"choice":"disabled-code"}` (selected disabled option) | `{}`; disabled selection is omitted from `FormData` and the `respondWith` output | `form_mcp_schema.cc:390-405` (option list membership), schema derivation `:733-770`; autosubmit `html_form_element.cc:174-221` |

`expect.fields` deliberately records the post-invoke select control value: for the disabled-option case it is `disabled-code`, while the submit listener's `FormData` and the `toolResponded.output.fields` are both empty. Invalid calls still produced `toolInvoked` and `toolResponded` CDP events, but no submit event; their control stayed on the initial `alpha-code` option.

The schema source range is `form_mcp_schema.cc:733-770`: Chromium iterates the select's option list, emits each option's value as `const` and enum member, and uses option text as the `anyOf` title. The validation source range `:390-405` builds the accepted-value set from `GetOptionList()` and checks the submitted string against it. `:208-243` checks the parameter and validator before applying any field values; `:221-231` returns the invalid-value error. The auto-submit source range `html_form_element.cc:174-221` submits only after `FillFormControls` succeeds.

## Source and runtime evidence

Fetched both source files from the Chromium Gitiles `?format=TEXT` endpoint at tag `154.0.8037.97` on 2026-10-21, decoded the returned bodies, and checked the cited line ranges:

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` — [tag-pinned Gitiles source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT); decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc` — [tag-pinned Gitiles source](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT); decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- The tag resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.

The throwaway probe used `/usr/bin/chromium` (`154.0.8037.97`), Playwright `1.64.0`, Node `v24.21.0`, a loopback-only HTTP server, private per-run `HOME`, `TMPDIR`, and profile, `acceptDownloads: false`, host-resolver denial except `127.0.0.1`, and Playwright's CDP pipe through `context.newCDPSession(page)`. The effective feature arguments merged WebMCP flags with Playwright's default feature switches; launch guards observed one enable-features switch, one blink-feature switch, one disable-features switch, the CDP pipe, no TCP remote-debugging port, no `--no-sandbox`, and no `DevToolsActivePort` file. Each `toolResponded` wait was bounded at 8 seconds.

The four-case run was repeated once. The full schema and all case outcomes, errors, submit counts, post-invoke values, and submit fields matched. The ephemeral loopback port changed from `43079` to `36497`, and generated frame IDs and invocation IDs changed; no decision outcome varied. Both browser contexts were closed; after the rerun, no private-profile Chromium process or `/tmp/te-*` run directory remained. An initial launch attempt used a too-long TMPDIR path and Chromium aborted on its `SingletonSocket` path; switching to the short private `/tmp/te-*` root resolved it, and the probe completed twice with cleanup.

No tools were installed or updated. No build, lint, formatter, or test suite was run; the two requested Chromium probe runs are the only executed checks.

## Retained evidence

- `corpus/evidence/round-19/validation/fixtures/select-enum.html` — single declarative select and the submit observation/respondWith listener.
- `corpus/evidence/round-19/validation/cases/select-enum.json` — four cases, exact observed expectations, and tag-pinned source anchors.
- `corpus/evidence/round-19/validation/probes/select-enum.json` — raw first-run CDP command/event params and responses, form/control observations, repeat-run outcomes, source hashes, runtime guards, and stability/nondeterminism record.
- Throwaway runner and original full run outputs retained outside the commit at `/fast/scratch/tabi-r19/FamSelectEnum-4-probe/probe.mjs`, `first.json`, and `second.json`.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamSelectEnum-4`
- Branch: `r19/FamSelectEnum-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `b4d2043303234d93c1f37051793d78e8a920a4bc`
- Changed paths:
  - `corpus/evidence/round-19/validation/fixtures/select-enum.html`
  - `corpus/evidence/round-19/validation/cases/select-enum.json`
  - `corpus/evidence/round-19/validation/probes/select-enum.json`
