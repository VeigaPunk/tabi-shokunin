# FamNumberRange — round 19 C1 depth

## Result

Chromium 154 fills all numeric values into the number control; it does not reject them at `invokeTool` or clamp/round them. Declarative form constraint validation then responds `Error` and suppresses the submit event for below-min, above-max, and off-step values. An in-range step-aligned control value completes normally. The tool schema exposes `minimum: 2` and `maximum: 10`; the captured schema has no `multipleOf`.

## Per-case observations

Fixture: `<input type="number" min="2" max="10" step="3" name="amount">`. `fields.amount` below is the post-invoke input value; `window.__obs.calls` is empty for the three validation errors and contains one trusted `agentInvoked` submit for the valid control.

| Case / CDP input | Observed `toolResponded` | Post-invoke field and validity | Submit count | Schema min/max | Case source anchor |
|---|---|---|---:|---|---|
| `decl-number-range-01` `{ "amount": -1 }` | `Error`; `Form validation failed: amount: Value must be greater than or equal to 2.. ` | `amount="-1"`; `rangeUnderflow=true`, `stepMismatch=false` | 0 | 2 / 10 | `html_form_element.cc:729-758` |
| `decl-number-range-02` `{ "amount": 11 }` | `Error`; `Form validation failed: amount: Value must be less than or equal to 10.. ` | `amount="11"`; `rangeOverflow=true`, `stepMismatch=false` | 0 | 2 / 10 | `html_form_element.cc:729-758` |
| `decl-number-range-03` `{ "amount": 4 }` | `Error`; `Form validation failed: amount: Please enter a valid value. The two nearest valid values are 2 and 5.. ` | `amount="4"`; `stepMismatch=true` | 0 | 2 / 10 | `html_form_element.cc:729-758` |
| `decl-number-range-04` `{ "amount": 5 }` | `Completed`; `errorText` absent | `amount="5"`; `valid=true`; submit call had `agentInvoked=true`, `isTrusted=true`, and `fields.amount="5"` | 1 | 2 / 10 | `html_form_element.cc:760-806` |

All four inputs received a CDP invocation ID and a `WebMCP.toolInvoked` event. The invalid values remained unchanged in the input; none were clamped. The below-minimum value `-1` is aligned to the step base (2), isolating range-underflow from step mismatch. `11` is step-aligned and isolates range-overflow. `4` isolates step mismatch within the range. The schema did not expose the step as `multipleOf` for this min/step pair.

## Probe and retained evidence

The throwaway probe used Chromium `/usr/bin/chromium` 154.0.8037.97, Playwright 1.64.0, Node v24.21.0; the specified WebMCP feature switches were merged with Playwright's default feature lists. It used a private temporary HOME and TMPDIR, `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`, `acceptDownloads:false`, a loopback-only fixture server, route/WebSocket blocking, and Playwright's pipe CDP session via `context.newCDPSession(page)`. For each case it enabled WebMCP, retained raw `toolsAdded` params and inputSchema, sent `invokeTool`, retained its reply plus `toolInvoked`/`toolResponded` params, and sampled post-invoke control state.

The two final runs matched semantically for all cases (`perCaseSemanticObservationEqual` is `true` for cases 01–04); no behavioral nondeterminism was observed. Raw frame and invocation IDs are retained per run in the probe file.

- Fixture: `corpus/evidence/round-19/validation/fixtures/number-range.html` — 899 bytes; SHA-256 `b09373ee6560fffb1ac92a3d2e1545409dbba8c340b3d8367f4c215eca5cb1d6`.
- Cases: `corpus/evidence/round-19/validation/cases/number-range.json` — 4,007 bytes; SHA-256 `57761f271d043bd373641a67690b4af06695902f5e37b1fb11a5cc4eb6697400`.
- Raw CDP probe (two runs): `corpus/evidence/round-19/validation/probes/number-range.json` — 45,846 bytes; SHA-256 `7045d02fe13753cee3e3345e808d75fedb2a411edfa41b7419b05a89b14def2a`.

An initial launch used an overly long private TMPDIR socket path and aborted before a case; the path was shortened to a private `/tmp/nr4-*` directory. A subsequent throwaway-script error used unsupported `browser.process()` introspection; that call was removed, and the corrected probe completed twice. `browser.close()` and server cleanup ran; the final cleanup observation had no `/tmp/nr4-*` directory and no Chromium process with the probe's WebMCP feature args. No package/tool was installed. No build, test suite, linter, or formatter was run; only the explicitly requested browser probe was exercised.

## Chromium source anchors

Gitiles `?format=TEXT` sources below were fetched and the decoded source lines checked on 2026-10-21. SHA-256 values are for the decoded file bodies.

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:713-717` — “schema->SetDouble("minimum", step_range.Minimum().ToDouble());” (line 714) and “schema->SetDouble("maximum", step_range.Maximum().ToDouble());” (line 717). URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT . Access date: 2026-10-21. Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:721-724` — “if (step_range.StepBase().Remainder(step).IsZero()) {” (line 721); only then does the code set `multipleOf` (line 724). URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT . Access date: 2026-10-21. Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:321-331` — “return !number_string.empty() &&” (line 330) / “!input->SanitizeValue(number_string).empty();” (line 331); filling is at lines 950-958. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT . Access date: 2026-10-21. Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc:729-758` — “if (!skip_validation && !ValidateInteractively()) {” (line 729); the invalid declarative-tool branch builds `Form validation failed: `, appends `validationMessage()`, and calls the callback with `kToolInvocationFailed` (lines 733, 751, 756-758). URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT . Access date: 2026-10-21. Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- `third_party/blink/renderer/core/html/forms/html_form_element.cc:789-806` — “if (auto promise = submit_event->TakeRespondWithPromise()) {” (line 790); the valid submit handler's promise resolves through the tool callback. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT . Access date: 2026-10-21. Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Risks and blockers

Validation `errorText` is browser/locale wording; cases assert stable substrings from the pinned Chromium 154 run. The probe/case artifacts are ready on the isolated branch. Commit creation is blocked by the higher-priority instruction for this seat not to commit; the clone therefore remains at baseline HEAD with the three assigned files uncommitted.

## Isolation

- Clone: `/fast/scratch/tabi-r19/FamNumberRange-4`
- Branch: `r19/FamNumberRange-4`
- Base / current HEAD: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: not created (commit prohibited by higher-priority instruction)
- Changed paths:
  - `corpus/evidence/round-19/validation/fixtures/number-range.html`
  - `corpus/evidence/round-19/validation/cases/number-range.json`
  - `corpus/evidence/round-19/validation/probes/number-range.json`
