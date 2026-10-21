# DV-07 — semantic entailment review

## Verdict

**Disagree with DV-07 as currently encoded for C1 admission; agree that the retained receipt supports the narrow, observed one-case result.** The null-to-fill-error behavior is true in the retained Chromium source and in the raw receipt, but the decision's cited line range does not establish the null conversion path, and its error substring is materially less specific than its answer. The counter binds files, IDs, source-token presence and runtime outcomes; it does not judge whether the prose answer follows from those facts.

## Findings (by severity)

### High — the cited source span proves the fallback template, not the null-specific inference

`decisions.json:161-183` states the condition as a required text control receiving JSON null; its source has `lines: [222, 231]` and token `"Invalid value for parameter ", parameter_name`. The retained body has decoded SHA-256 **904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f**, matching both the decision and SOURCES S077. I decoded it with `zcat` and independently hashed the decoded bytes.

That cited span contains `FillData`'s failed-validation branch, including the unquoted template; it does not include the `ToString` helper or `ValidateTextData` that connect JSON null to that branch. In the same retained body, `ToString` tries string, integer, double, and boolean accessors before returning false (`form_mcp_schema.cc:49-70`), and `ValidateTextData` returns false when `ToString(value, s)` fails (`:300-328`). `FillData` then returns `kInvalidInputArguments` with `StrCat({"Invalid value for parameter ", parameter_name})` (`:222-231`) before its second loop applies any values. These source facts entail Blink's null rejection for this standard text control; **the present `[222,231]` anchor alone does not**.

Source quote (14 words): `if (!ToString(value, s)) { return false; }` — Chromium 154 `form_mcp_schema.cc:300-328`, https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT ; opened 2026-10-21; decoded-body SHA-256 above. The template token is in `:222-231` of that same URL/body.

**Exact correction:** broaden this decision's single contiguous `source.lines` span to `[49,328]` (the relevant conversion helper, fill branch, and text validator are all in that body); retain the existing template token. This is intentionally a source-binding correction, not a claim that the source alone proves CDP event status or submit count.

### Medium — the outcome matcher can accept an error for the wrong parameter

The prose answer and observed receipt give the full error `Invalid value for parameter required`, but the manifest outcome only requires `errorTextIncludes: "Invalid value for parameter "` (`decisions.json:169-172`). `measure-c1.mjs:649-655, 695-701` checks expected/observed text by substring. Thus an error such as `Invalid value for parameter other` can satisfy this DV-07 outcome while the answer says `required`.

**Exact correction:** set `outcome.errorTextIncludes` to `"Invalid value for parameter required"`. The counter's documented substring contract may remain, but the decision must require the parameter-specific text it asserts.

### Low — clarify that `required` describes this fixture, not the cause of rejection

The fixture has `<input type="text" name="required" required>` and a separate optional text field (`fixtures/missing-required.html:8-10`). The source text validator does not branch on the HTML `required` attribute; the null rejection is a JSON-to-text validation failure before the HTML submit-time constraint is reached. The current condition is limited to a required text control, but can be misread as saying the `required` attribute causes the result. The receipt contains only this required-field null probe, so it does not independently runtime-test optional text null.

**Exact wording correction:** condition: `This fixture's required text input (parameter "required") receives JSON null.` Answer: `Fill-time Error: Blink's JSONValue-to-text conversion rejects null; the observed error is "Invalid value for parameter required". No submit or control mutation occurs.` Avoid the broader/ambiguous phrase “null cannot be string-coerced”: the implementation uses a specific JSONValue converter, not ECMAScript's general `String(null)` conversion.

## Runtime observation, cases, and counter strength

- Probe case `decl-missing-required-03` is in family `missing-required`, sends `{"required":null}`, and expects Error / the parameter-specific message / zero submits (`cases/missing-required.json:62-87`). The committed receipt records `toolInvoked.input` as `{"required":null}`, `toolResponded.status` `Error`, exact `errorText` `Invalid value for parameter required`, `submitCount: 0`, `fields.required: ""`, `fields.optional: "optional-default"`, and `pass: true` (`receipt.json:1523-1587`). The runtime header identifies Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 (`receipt.json:1-20`).
- Control `decl-missing-required-04` is same-family and `Completed`, with `submitCount: 1` and the submitted required value plus unchanged optional default (`receipt.json:1589-1653`). It is intentionally reused by DV-06; the manifest rule requires unique **probe** IDs, not globally unique controls.
- The JSON query over all manifest `probeCases` grouped by ID returned `[]` for duplicates. The C1 counter also explicitly marks repeated probe IDs (`measure-c1.mjs:564-576`); its receipt index rejects duplicate receipt records (`:469-481`).
- The counter checks case-family agreement, case expectations, control completion, committed/fresh receipt agreement, pass flags, runtime identity, producer/file digests, and exact source-body hash/token/line membership (`measure-c1.mjs:564-714, 804-879`). These are meaningful integrity and reproduction checks. They are **not semantic checks**: `parseManifest` requires only nonempty `condition` and `answer` (`:298-320`); no code compares either prose field to the source or observed record. `sourceRejection` checks token membership, not entailment (`:579-610`). The generic error substring in this DV-07 outcome is an example of the resulting false-positive surface.
- A retained C1 measurement at revision `ea170da3d39089566f080a3095d2b7bb5c7002b7` reports 24 counted decisions and rejects DV-07 as `probe_family_mismatch` (`measurements/c1-ea170da3.json:7-10`). That is an earlier revision, not a measurement at attacked checkpoint R; the current manifest and case file both say `missing-required`. I did not run a browser or C1 counter, so I make no claim about the current-at-R aggregate count.

## Prose consistency

The SKILL table row (`SKILL.md:2066`) repeats the decision's condition and broad wording; the preceding SKILL prose correctly distinguishes fill-time errors from submit-time validation (`:2051-2056`). The knowledge note's general error-template paragraph (`corpus/knowledge/webmcp-declarative-validation-round-19.md:35-42`) says the unquoted template is used for rejected values that do not stringify, including null/arrays/objects, in the context of validator-rejected values. This is consistent with the source when kept in that context; it must not be generalized to all controls/inputs (e.g. custom elements bypass validation, which the note scopes out at `:13-20`). The receipt supports the exact observed string and no-submit result for this probe. Literal searches located these prose mentions only; they are not semantic proof.

## Residual risk and verification gaps

- The source-body hash and token are verified, but DV-07's current narrow line binding omits the conversion/validator path. Apply the correction above before treating its source entailment as established by the manifest.
- The C1 counter can admit semantically inaccurate `condition`/`answer` prose if structural checks pass; this decision illustrates that gap. Human entailment review remains necessary unless the counter gains explicit semantic assertions.
- No current-at-R C1 counter run or browser run was performed, per assignment. Retained `ea170da3…` measurement is historical only.
- No LSP device is mounted in this session (`xd://lsp` returned “No such tool”); literal grep was used only to locate the prose mentions. No tests/builds were run; no tools were installed.
