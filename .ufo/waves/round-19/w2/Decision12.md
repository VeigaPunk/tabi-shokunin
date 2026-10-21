# DV-12 semantic falsification review

## Verdict

**Partial agree.** The two declared string probes are correctly described by the Chromium 154 implementation and retained runtime receipt. The condition and surrounding prose are too broad/ambiguous about “visible label” and “absent value,” and the answer can be misread as requiring a JSON string. The source explicitly stringifies several non-string JSON primitives before comparing them. The receipt establishes the observed errors and zero submits for these two inputs; it does not establish the unprobed types or label/value-equal case.

## Findings by severity

### Medium — Scope wording overgeneralizes the two tested strings

`decisions.json:292-315` defines DV-12 as “A single select receives a visible label or an absent value”; `SKILL.md:2071` repeats that condition and says only option `value` strings match. The actual probe inputs are two *present strings*: `"Beta visible label"` and `"missing-code"` (`cases/select-enum.json:35-86`). The first is a display label distinct from its option value (`fixtures/select-enum.html:8-10`); the second is a string not in the fixture's option-value set. “Absent value” could instead mean an omitted `choice` property, which was not tested. A visible label equal to an option's value is also not tested; **[INFERENCE]** it would pass the source's equality check because the validator never compares label text.

The source token is present in the exact selected range. `S077` source says `allowed_values.insert(option.value());` and `return ToString(value, s) && allowed_values.Contains(s);` (`form_mcp_schema.cc:390-409`). Its `ToString` helper accepts strings, integers, doubles, and booleans (`:49-68`), so this is not strict JSON-string-only validation: e.g. **[INFERENCE]** a numeric `1` can match an option whose `value` is `"1"`. Null, arrays, and objects do not convert; `FillData` then emits the unquoted `Invalid value for parameter choice` form rather than the quoted template (`:208-231`). None of those non-string inputs is in DV-12's cases. The source's prevalidation also precedes all application: “If the data isn't valid, form control states remain unchanged.” (`:208-241`). `HTMLFormMcpTool::ExecuteTool` returns an error before reaching the `toolautosubmit` submission branch (`S078`, `html_form_element.cc:174-260`).

The retained receipt supports the narrow claim: case 02's `toolResponded` is `Error` with `Invalid value "Beta visible label" for parameter choice`, `submitCount: 0`, and `fields.choice: alpha-code` (`receipt.json:3376-3433`); case 03 has the corresponding exact `missing-code` error, zero submits, and `alpha-code` (`:3474-3531`). The fixture starts with `alpha-code` selected (`fixtures/select-enum.html:7-10`). The in-family control completed with one submit and `beta-code` (`receipt.json:3273-3335`). All three retained cases have `pass: true`.

**Exact wording correction:**

- Condition: `A single select receives a string equal to an option's display label but different from every option value, or a string absent from every option value.`
- Answer: `For these two string inputs, Chromium 154 returns Fill-time Error “Invalid value <v> for parameter choice”; submitCount is 0 and the fixture's initial alpha-code selection remains. The validator applies ToString before exact option.value membership; this is not evidence that non-string inputs are rejected.`

Apply the same qualification to `corpus/knowledge/webmcp-declarative-validation-round-19.md:59-61`, currently “labels are rejected”: say that the *tested distinct label string* and out-of-set string reject; do not imply every visible label rejects irrespective of its value, or that omitted input/null/type coercion was tested. The current DV-12 condition/answer in the manifest and SKILL table otherwise agree with each other.

**Source binding:** the retained S077 decoded body SHA-256 is `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, matching the decision and SOURCES row; `zcat …/form_mcp_schema.cc.gz | sha256sum` observed the same digest. The selected decision range `[390,409]` contains the validator token and membership branch, but not the `ToString` helper or `FillData` prevalidation; those broader source-derived details above use their separate anchors. S077 URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT ; opened/accessed 2026-10-21. S078 URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; opened/accessed 2026-10-21; decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (also verified with `zcat … | sha256sum`).

### Medium — C1 counter binds identifiers, not the prose it credits

The C1 counter has good structural/provenance coverage: it checks unique probe IDs (`measure-c1.mjs:564-576`), same-family cases/control and runtime outcomes (`:635-713`), source-row date/status/body SHA/token within the declared line interval (`:579-610`), receipt/fixture/case digest maps, pinned runtime/producer identity, and a fresh run of the pinned revision (`:748-880`). The harness's `compareExpectation` also checks status, error substring, submit count, expected fields, and schema (`scripts/webmcp-validation-round19.mjs:1043-1062`); the counter requires passing committed and fresh records.

But `indexDecisionRows` checks only the row ID, probe IDs, control ID, and source-row ID (`measure-c1.mjs:543-560`); `parseManifest` only requires nonempty `condition`/`answer` strings (`:283-324`). No counter path compares SKILL table cells for condition/answer with those manifest fields. Thus a contradictory or broadened DV-12 SKILL row retaining its identifiers can still be structurally credited. This is a counter gap, not a present mismatch: the current DV-12 text matches the manifest on inspection. **Correction:** require normalized equality of table condition/outcome cells to `decision.condition`/`decision.answer` (or generate those cells from the manifest), and add a counter self-test that changes the answer but leaves identifiers intact and expects that decision not to count. The counter is strong for artifact linkage and same-harness reproduction, but is not a semantic entailment check; this review supplies that missing judgment.

## Case-ID and control check

A read-only JSON census with the pinned Node 24.21.0 found **46 probe IDs / 46 unique, zero duplicates** across the 27 decisions. `decl-select-enum-01` is intentionally reused as the in-family success control for DV-12 and DV-13; it is not a duplicate probe ID. For DV-12 it is `select-enum`, `Completed`, `submitCount: 1`, field `choice: beta-code`. That reuse matches the counter's rule: probe IDs must be unique; the control must be in-family and successful.

## Residual risk and verification gaps

- No browser probe or full C1 counter was run, as assigned. Runtime statements above are readings of the committed raw receipt, not a reproduction by this seat.
- Null, array/object, number/boolean coercion, an omitted key, label text equal to option value, and changed initial selection are not DV-12 runtime cases. The source details for these are source-derived; explicitly marked inferences are not runtime findings.
- No `lsp` device was mounted (`read xd://lsp` returned “No such tool”); therefore no LSP status/references/definition/diagnostics were available. Literal grep was used only to locate all relevant prose mentions, not as semantic proof.
- B→R diff inspection found these three target artifacts were additions (SKILL section, decision manifest, knowledge note); no test/build/lint suite was run. No tool was installed or updated.

## Isolation

No production files, runtime probes, clones, or branches were created. The only direct LANE write is this seat-owned report: `.ufo/waves/round-19/w2/Decision12.md`.
