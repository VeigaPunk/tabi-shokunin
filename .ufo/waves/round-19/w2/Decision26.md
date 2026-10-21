# DV-26 — C1 semantic review

## Verdict

**Disagree with the row as worded; agree with the narrower Blink fill-phase proposition.** The source establishes that Blink's `FillData` does not call `FillParameterData` for absent JSON members. It does not, by itself, establish that a control will retain its *default* value after every complete tool invocation, nor that autosubmit succeeds. The current runtime observation does establish the narrower, fixture-specific result: an empty object input completes one submit and both pre-filled values remain equal to their initial defaults in this test.

Axes reviewed: source entailment; scope/runtime observation; case/control identity; counter integrity.

## Findings (severity order)

### Medium — DV-26 generalizes the observed value and end-to-end result

The B→R diff adds the decision manifest, the round-19 SKILL table, and the declarative-validation knowledge note; `refs/heads/master` resolves to R. DV-26 is `decisions.json:653-677`; the table row is `SKILL.md:2085`. The SKILL's closing agent rule at `SKILL.md:2091` and the knowledge note at `webmcp-declarative-validation-round-19.md:65` repeat the same general “leave as is/current value” advice.

The retained S077 body matches the manifest binding: `zcat corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | sha256sum` returned `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, equal to `bodySha256`; `SOURCES.md:91` identifies the Chromium 154.0.8037.97 source, opened 2026-10-21. In `form_mcp_schema.cc:233-241`, the exact relevant call is “`FillParameterData(parameter_name, *contents);`” (URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT ; accessed 2026-10-21; decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`). The surrounding loops iterate `json_obj.size()` for present entries; with `{}`, neither loop calls a fill setter. This supports “no FillData fill call for an absent member,” not a general promise that the final DOM value remains its initial/default value after page code or submission handlers run.

The probe definition (`cases/textarea-empty.json:66-89`) has `input: {}`—both `memo` and `title` are omitted, rather than one key being omitted while a sibling is supplied. The raw probe (`probes/textarea-empty.json`, run `decl-textarea-empty-03`) records `toolInvoked.input` as `{}`, `toolResponded.status` as `Completed`, `submitCount: 1`, and fields `memo: "pre-filled textarea"`, `title: "pre-filled input"`; each control's `value` equals its `defaultValue`. The fixture (`fixtures/textarea-empty.html:5-23`) starts both fields pre-filled, marks the form `toolautosubmit`, and its submit listener records the fields, prevents default, and resolves `respondWith`. The derived schema's `required` list is empty. Thus the runtime supports exactly this fixture's empty-object case, not arbitrary pre-invocation values, partial omission alongside other fills, or page-side effects.

The control `decl-textarea-empty-04` (`cases/textarea-empty.json:92-118`) explicitly sends both exact pre-filled strings and completes. It is a useful in-family success control, but its final values are identical to the probe's: it cannot distinguish “left the current value alone” from a hypothetical reset to the defaults. The one probe ID is distinct from its control and unique as a probe; the control ID is intentionally reused by DV-25 and DV-27. The counter permits control reuse while rejecting duplicate case definitions and duplicate probe IDs.

**Exact correction:**

- Condition: `An object-valued input omits a parameter (fill-phase behavior; this runtime case omits both parameters with input {}).`
- Answer: `FillData does not call FillParameterData for an omitted member. In the probed textarea/text fixture, input {} completed one autosubmit and both current values remained equal to their initial defaults; this does not guarantee the final value after page/submit handlers.`
- Narrow the agent rule in `SKILL.md:2091` to “omission is not applied by Blink's fill phase; page/submit handlers may still change state.” Narrow the knowledge-note sentence at `:65` the same way. Keep explicit `""` as distinct: it is a supplied value, not omission.

### Low — counter comparison validates a reduced observation, not the complete raw field result

The counter has strong structural/provenance checks: `measure-c1.mjs:342-411` rejects duplicate case definitions; `:564-575` rejects cross-decision duplicate probe IDs; `:583-610` checks S077's opened date/status, digest anchor, decoded body hash, and token within the declared lines; `:635-713` checks probe/control family, case input/expectation, pass status, expected outcome summary, and an in-family Completed control. It also runs a fresh harness on a sandbox revision (`:748-801`). These are useful checks, but they do not establish the natural-language answer's semantic entailment.

There is a concrete observation-comparison gap: `receiptObservation()` (`measure-c1.mjs:484-495`) retains only status, error text, and submit count; `comparableReceiptRecord()` (`:497-507`) compares that projection plus ID/family/input/expected/pass. The fresh-versus-committed comparison at `:680-687` therefore does not compare raw `observed.fields`, form state, or schema. A receipt whose field observations were changed while retaining `pass: true` and the same outcome summary can evade that comparison; `pass` is read from the receipt, not recomputed by this counter. This does not contradict the raw DV-26 probe I inspected, which does show the expected values, but it weakens the counter's assurance against receipt drift/tampering.

**Exact counter correction:** compare the complete normalized observed payload needed by the case expectations between committed and fresh receipts, and independently verify the observed fields/schema against `expected` rather than trusting `pass` alone.

An existing measurement record, `corpus/evidence/round-19/measurements/c1-ea170da3.json`, records revision `ea170da3d39089566f080a3095d2b7bb5c7002b7`, 24 counted decisions, and DV-26 counted with no reasons. That record is not a fresh run at attacked checkpoint R. I did not run the browser or C1 counter, as assigned.

## Type, null, and submit timing

S077's `ToString` (`form_mcp_schema.cc:49-80`) accepts strings, integers, doubles, and booleans, not JSON null/arrays/objects. For text controls, `ValidateTextData` (`:302-318`) accepts an empty string; a present `"memo": null` is not omission and fails validation, while a supplied `"memo": ""` passes and is filled as empty (the neighboring DV-27 case). A top-level non-object is a different CDP boundary and never represents an omitted member. The fill method validates all present members before applying any, so an invalid present value is not evidence about omission.

Submit is a later phase: S078's retained `HTMLFormMcpTool::ExecuteTool` / `FillFormControls` source (`html_form_element.cc:174-328`, and response handling `:635-842`) calls `FillData`, returns on fill error, and only then proceeds to `toolautosubmit` submission. S078 URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; accessed 2026-10-21; decoded retained-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (verified with `zcat | sha256sum`). Therefore the DV-26 `Completed`/one-submit observation is conditional on this optional-field fixture and its responding handler; omission itself does not promise successful submit for a required/invalid form.

## Residual risk and verification gaps

- LSP status/references/definition/diagnostics were unavailable: `read xd://lsp` returned “No such tool” and the mounted-tool list contains no LSP device. Literal grep was used only to locate prose mentions; semantic conclusions above come from the read source bodies, case, fixture, receipt, and counter code—not grep output.
- No browser, full C1 counter, build, test, or lint was run. The checked-in historical measurement is identified above and is not represented as verification of R.
- No tools installed or updated.

## Isolation

- Production changes: none; no runtime/mutation probe, clone, branch, or commit was created.
- Authorized direct LANE write: `.ufo/waves/round-19/w2/Decision26.md` only.
- Changed production paths: none.
