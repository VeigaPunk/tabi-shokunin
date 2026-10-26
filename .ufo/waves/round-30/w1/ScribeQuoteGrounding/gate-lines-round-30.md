# Gate lines for corpus/lessons/round-30.md — S110 / S114 / S115 re-grounding

Round-29 routed defect 2. Source bytes: `corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/`
(committed) and live Gitiles at `refs/tags/156.0.8078.47` re-fetched 2026-10-26T06:41:37Z; both give
`sha256 html_form_element.cc = 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` and
`sha256 form_mcp_schema.cc = 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, equal to the
S096/S100/S071 receipt values. Each quote below is 1–25 words, contiguous in the counter's normalised text
(`scripts/check-frontier-admission.mjs:136-150`: tags stripped for HTML, every run of whitespace collapsed to one
space), and occurs exactly once in its file.

| id | url | 2026-10-26 | "quote" | file:line | why it grounds teaches |
|---|---|---|---|---|---|
| S110 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26 | "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments," | form_mcp_schema.cc:215-217 | S110 teaches that `FormMCPSchema::FillData` still rejects unknown parameters and invalid values and that this file is byte-identical at 154 and 156. This is FillData's unknown-parameter branch returning `kInvalidInputArguments` (the invalid-value branch returns the same code at :221-230), and the span sits at 154.0.8037.97:215-217 too, the same sha256 at both tags — which is exactly what a re-pin asserts. |
| S114 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "executing_tool->CallDoneCallback(base::ok(String()));" | html_form_element.cc:867 | S114 is the navigation-sentinel row: this is the null-String tool result that marks a navigation triggered after `ScheduleFormSubmission` (:862), i.e. the `CallDoneCallback` ordering the teaches names, and it shows the sentinel path survived the new guard with only a line shift (154:829 → 156:867). S111's comment at :201-202 describes the guard, not this sentinel. |
| S115 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed," | html_form_element.cc:203-206 | S115 teaches the guard newly inserted after the `FillFormControls` success path that fails the invocation with `kToolInvocationFailed` when the document is no longer active. This span is the guard's condition plus its error code, it is absent from the 154 bytes entirely (guard first appears at 156), and it stops before :207 so it never crosses the two string literals. |

Plain-text form (same content):

```
S110 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26 | "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments," | form_mcp_schema.cc:215-217 | FillData's unknown-parameter rejection (invalid-value branch at :221-230); same span at 154.0.8037.97:215-217, same sha256 at both tags.
S114 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "executing_tool->CallDoneCallback(base::ok(String()));" | html_form_element.cc:867 | the null-String navigation sentinel after ScheduleFormSubmission (:862); unchanged from 154:829, shifted +38.
S115 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed," | html_form_element.cc:203-206 | the new-at-156 post-fill guard's condition and error code; absent from the 154 bytes.
```

Word counts under the counter's `words()`: S110 8, S114 1, S115 7.

## Note for the lesson: the two-literal span

The round-29 S110/S115 Gate quote "The document was detached while filling out the form" is not a contiguous
substring of any byte form of `html_form_element.cc`, and never can be: at tag 156 the message is written as two
adjacent C++ string literals, `"The document was detached while filling out "` on line 207 and `"the form")));` on
line 208, which the compiler concatenates but the source does not. Checked mechanically (committed bytes and live
refetch, whitespace-normalised the way `scripts/check-frontier-admission.mjs` normalises): the 52-character message
occurs 0 times in the raw bytes and 0 times in the normalised text, while each literal alone occurs once
(`The document was detached while filling out ` → present; `the form")` → present); the 31-character gap between
them is exactly `"` + `\n` + 28 spaces + `"` — the closing quote of the first literal, the line break, the
indentation and the opening quote of the second — so no quote may span it without including those four characters. Consequence for
every future citation of this message: quote one literal, or quote around the boundary, never across it. The three
replacement quotes above respect that; S115's in particular stops at `kToolInvocationFailed,` on line 206.
