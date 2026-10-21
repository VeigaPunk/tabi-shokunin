# FamRadio-4 — round 19 radio validation

## Result

Implemented the `radio` validation family in the isolated clone. Chromium 154.0.8037.97 derives `properties.choice.enum` as `["alpha", "beta"]`; the disabled `gamma` control is omitted. A valid `beta` invokes the submit handler and leaves only `beta` checked. Both the unknown value and disabled `gamma` return `Error` before submission, with no radio becoming checked.

## Per-case observations

The fixture is a same-name group (`choice`) with three values (`alpha`, `beta`, `gamma`); `gamma` is disabled. The recorded case expectations match both independent probe rounds.

| Case | CDP input | Observed `toolResponded` | Submit count / fields | Post-invoke radio state | Source anchor |
|---|---|---|---|---|---|
| `decl-radio-01` | `{"choice":"beta"}` | `status=Completed`; no `errorText` | `1`; `{"choice":"beta"}` | `alpha=false`, `beta=true`, `gamma=false` | `form_mcp_schema.cc:839-872` |
| `decl-radio-02` | `{"choice":"not-an-option"}` | `status=Error`; `errorText="Invalid value \"not-an-option\" for parameter choice"` | `0`; `fields=null` | all false | `form_mcp_schema.cc:374-388` |
| `decl-radio-03` | `{"choice":"gamma"}` | `status=Error`; `errorText="Invalid value \"gamma\" for parameter choice"` | `0`; `fields=null` | all false | `form_mcp_schema.cc:1238-1245` |

All three cases observed the same `inputSchema.properties.choice.enum`: `["alpha", "beta"]`. The disabled `gamma` control was present in the DOM snapshot but excluded from the derived WebMCP group; its attempted value was rejected. The two errors left every radio unchecked and did not call the submit listener.

## Probe and stability

- Ran the throwaway `/fast/scratch/tabi-r19/FamRadio-4-probe/radio-probe.mjs` twice, each with a fresh Chromium process and fresh page/context per case. It used Playwright 1.64.0, Node 24.21.0, `/usr/bin/chromium` 154.0.8037.97, WebMCP feature arguments merged with the pinned Playwright defaults, a `127.0.0.1` HTTP fixture server, host-resolver deny rules, private `HOME`/`TMPDIR`, `acceptDownloads:false`, and `context.newCDPSession(page)`.
- Raw `toolsAdded` schema, `WebMCP.invokeTool` request parameters/replies, `toolInvoked`/`toolResponded` event parameters, call observations and post-invoke radio states are retained in `corpus/evidence/round-19/validation/probes/radio.json` in the clone.
- Behavioral output was stable across both repeats: same schema enum, status/error text, submit count, fields and checked states. Invocation and frame IDs changed between runs, as expected. Each `toolResponded` arrived within the 8-second bound.
- Browser shutdown completed. A post-run `/proc` scan for the private browser `TMPDIR` returned no owned browser PIDs; that directory contained no entries. Node and browser temporary files were directed to the private scratch tree, not `/tmp`.
- No tools were installed or updated. No build, lint, formatter or test suite was run; only the requested runtime probe was exercised.

## Chromium source anchors

Fetched the Gitiles `?format=TEXT` bodies at tag `154.0.8037.97` on 2026-10-21 and decoded them before checking these lines. URLs and SHA-256 values below are for the decoded source bodies.

- `form_mcp_schema.cc` — `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`; decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
  - `:1238-1245` skips disabled/read-only form controls while building the parameter groups. Exact source quote at `:1241-1242`: “if (form_control->IsDisabledOrReadOnly()) { continue; }”
  - `:839-872` builds the radio schema and enum from the controls remaining in the group. Exact source quote at `:849`: “schema->SetArray(\"enum\", std::move(enum_array));”
  - `:374-388` accepts a radio value only if it matches one of the group options. Exact source quote at `:380`: “Make sure the provided value matches one of the options.”
  - `:208-243` returns invalid-input errors before applying values. Exact source quote at `:210`: “If the data isn't valid, form control states remain unchanged.” `FillRadioData` sets a matching radio at `:1003-1018`, including `input.SetChecked(true, ...)` at `:1012-1013`.
- `html_form_element.cc` — `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
  - `:189-198` returns a fill error before proceeding into the success/submission path. Exact source quote at `:196-198`: “if (error.has_value()) { return std::move(done_callback).Run(base::unexpected(error.value())); }”

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamRadio-4`
- Branch: `r19/FamRadio-4`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: **not created** — the executor role prohibits commit operations. This blocks the plan's `git show <commit>:<path>` import path; the L1 must not treat these uncommitted files as an importable commit.
- Changed paths in clone:
  - `corpus/evidence/round-19/validation/fixtures/radio.html`
  - `corpus/evidence/round-19/validation/cases/radio.json`
  - `corpus/evidence/round-19/validation/probes/radio.json`
