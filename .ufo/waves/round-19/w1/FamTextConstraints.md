# Round 19 W1 — text-constraints

## Result

Implemented four `text-constraints` declarative-WebMCP cases and a loopback fixture in the isolated clone. The fixture uses a text input with `pattern="[A-Z]+"`, `minlength="3"`, and `maxlength="5"`.

Observed behavior: Chromium exposes only the string type and pattern in `toolsAdded.inputSchema` (no `minLength`/`maxLength`). A pattern mismatch is filled, then rejected by form validity with an `Error` response and no submit callback. Values shorter than `minlength` or longer than `maxlength` are neither rejected nor truncated: they remain in the field, report `valid=true`, and complete the submit callback; `tooShort` and `tooLong` are both false after fill. The satisfying value also completes. These are post-invoke Chromium observations, not inferred behavior.

## Cases and observations

| Case | Input | Observed status / errorText | Post-invoke fields and validity | Source anchor |
|---|---|---|---|---|
| `decl-text-constraints-01` | `{"q":"abc"}` | `Error`; includes `Form validation failed: q: Please match the requested format.` | `q="abc"`; `valid=false`, `patternMismatch=true`, `tooShort=false`, `tooLong=false`; `submitCount=0` | `html_form_element.cc:729-758` |
| `decl-text-constraints-02` | `{"q":"AB"}` | `Completed`; no errorText | `q="AB"`; `valid=true`, `tooShort=false`, `tooLong=false`; output fields `{q:"AB"}`; `submitCount=1` | `form_mcp_schema.cc:933-947` |
| `decl-text-constraints-03` | `{"q":"ABCDEF"}` | `Completed`; no errorText | `q="ABCDEF"` (not truncated); `valid=true`, `tooShort=false`, `tooLong=false`; output fields `{q:"ABCDEF"}`; `submitCount=1` | `form_mcp_schema.cc:933-947` |
| `decl-text-constraints-04` | `{"q":"ABCD"}` | `Completed`; no errorText | `q="ABCD"`; `valid=true`, `tooShort=false`, `tooLong=false`; output fields `{q:"ABCD"}`; `submitCount=1` | `form_mcp_schema.cc:933-947` |

The submit callback records the observed value and confirms `agentInvoked=true` and `isTrusted=true` for each completed call. Invalid-pattern input did not reach the listener.

## Probe and stability

The throwaway probe was kept outside the clone at `/fast/scratch/tabi-r19/FamTextConstraints-probe/probe.mjs`. It used Node `v24.21.0`, Playwright `1.64.0`, `/usr/bin/chromium` (`154.0.8037.97`), merged WebMCP features with Playwright's default enable feature, `chromium.launch`, pipe-backed `context.newCDPSession(page)`, a server bound only to `127.0.0.1`, private HOME/TMPDIR under the seat scratch directory, `acceptDownloads:false`, the round-18 host-resolver deny rule, and a request route that blocked non-loopback requests. The raw `toolsAdded` parameters/schema, `invokeTool` parameters/replies, `toolInvoked` and `toolResponded` parameters, and post-invoke validity/callback state are retained in:

- `corpus/evidence/round-19/validation/probes/text-constraints.json`

All four cases were run twice (two passes, eight observations). Status, error text, field values, validity, callback count, and returned fields were stable across both passes. Frame and invocation IDs varied between runs; no outcome nondeterminism was observed. The final probe had no blocked requests. Its private run tree was removed, and no probe Chromium process remained. Two earlier throwaway attempts exposed probe-script errors (event collector reference, then output metadata key); the corrected final two-pass run is the sole retained evidence. No build, suite, lint, or formatter was run. No tools were installed or updated.

## Chromium source evidence

Source was fetched from Gitiles at tag `154.0.8037.97` using `?format=TEXT`, base64-decoded, and line-checked on 2026-10-21. Quotes below are verbatim and each is under 25 words.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:556-568` and `1111-1145` — text schemas include the text type and call `AddPattern`; valid pattern attributes are added to the schema. Quote (`:1144`): `obj.SetString("pattern", raw_pattern);`
- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:933-947` — the WebMCP fill path sets the supplied text value and dispatches input/change. Quote (`:941-942`): `input->SetValue(string, TextFieldEventBehavior::kDispatchInputAndChangeEvent);`
- `third_party/blink/renderer/core/html/forms/html_form_element.cc:729-758` — declarative submission checks interactive validity and turns invalid controls into a tool invocation error. Quote (`:733`): `error_message.Append("Form validation failed: ");`

Decoded-body SHA-256:

- `form_mcp_schema.cc`: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`
- `html_form_element.cc`: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`

Gitiles URLs:

- https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT

LSP was not available in the exposed tool inventory; source anchors were checked against the decoded, line-numbered Gitiles files.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamTextConstraints`
- Branch: `r19/FamTextConstraints`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: not created; this leaf is prohibited from committing, and the plan names L1 as sole integrator/committer.
- Changed production paths:
  - `corpus/evidence/round-19/validation/fixtures/text-constraints.html`
  - `corpus/evidence/round-19/validation/cases/text-constraints.json`
  - `corpus/evidence/round-19/validation/probes/text-constraints.json`
