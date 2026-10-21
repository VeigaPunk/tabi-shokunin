# DV-16 semantic review

## Verdict

**Disagree with DV-16 as a general decision; agree with its measured result for the exact `decl-radio-02` fixture input.** The validator rejects the tested string, and the retained runtime record reports the stated Error/no-submit result. The condition and “nothing checked” wording extend beyond that fixture: they do not constrain JSON type or prior checked state.

Axes reviewed: source entailment, receipt observation, decision scope, case-ID uniqueness, and counter integrity.

## Findings

### Medium — condition and post-state are broader than the evidence

`decisions.json` DV-16 (near lines 396–417) says “A radio group receives a value matching no radio” and answers “nothing checked.” `SKILL.md:2075` repeats it. But the only probe is `decl-radio-02`, with input `{"choice":"not-an-option"}` against `radio.html`: enabled values `alpha`/`beta`, disabled `gamma`, and all radios initially unchecked (`fixtures/radio.html:5–15`; `cases/radio.json`, `decl-radio-02`). The control is `decl-radio-01`, input `beta`.

The committed receipt’s raw `decl-radio-02` observation is `toolResponded.status=Error`, `errorText="Invalid value \"not-an-option\" for parameter choice"`, `submitCount=0`, `fields.choice=null`, schema enum `[alpha,beta]`, `pass=true`. The `decl-radio-01` control is `Completed`, submits once, and reports `choice=beta` (`receipt.json`, records by those IDs). The preserved family probe’s raw `pageState` additionally shows all three `checked:false` for `invalid-unknown`; that is direct per-radio evidence, while the receipt itself records only the normalized `fields.choice` value. Thus the answer is accurate for the tested initially-unchecked fixture, not for every radio group: the source’s fill path validates before applying anything, so an existing selection remains unchanged rather than being cleared.

The distinction matters for types too. In retained S077, `ToString` accepts JSON strings, integers, doubles, and booleans (stringifies booleans as `true`/`false`); null, arrays, and objects do not convert. `ValidateRadioData` compares the resulting string with each control’s value (`input.Value() == string`) and otherwise returns false. Consequently, a number or boolean whose stringified form matches an option can pass; null/array/object failures use the unquoted generic `Invalid value for parameter choice` template, unlike the tested string’s quoted message. No DV-16 receipt case tests those types.

**Exact correction:** scope both the decision and SKILL row to the observed fixture, e.g. condition: `For the initially-unchecked radio fixture (enabled values alpha and beta; gamma disabled), input choice="not-an-option" is rejected.` Answer: `Observed Error: Invalid value "not-an-option" for parameter choice; submitCount 0; all fixture radios remain unchecked.` Keep the existing exact `outcome` and probe/control IDs. In `corpus/knowledge/webmcp-declarative-validation-round-19.md:58–60`, clarify that validation compares the stringified scalar value to an enabled radio’s value; null/arrays/objects fail conversion. This prevents a strict-JSON-type or arbitrary-prestate reading.

### Low — hash-bound source slice is accurate but only entails the validator branch by itself

The S077 body hash in `decisions.json` is the actual decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` (verified by `gzip -dc …/form_mcp_schema.cc.gz | sha256sum`). The entry’s lines `[374,388]` contain the exact token `input.Value() == string`; for a nonmatching string, this validator returns false. The cited slice alone does **not** contain the error-template, validate-before-apply, or submit-flow logic. Those are in S077 `form_mcp_schema.cc:208–241` and S078 `html_form_element.cc:174–328`: `FillData` returns an error before applying controls, and `ExecuteTool` returns on that error before the `toolautosubmit` submit branch. The receipt independently observes the exact status, text, and zero submits for this input.

If the table intends its source column to support the whole displayed outcome as source-derived, supplement the citation with those S077/S078 ranges; otherwise keep the current narrow validator citation and present the message/state/submit facts explicitly as measured receipt outcomes. S077 source row `SOURCES.md:91`: Chromium 154.0.8037.97 tag, opened 2026-10-21; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT ; decoded SHA-256 above. S078 source row `SOURCES.md:92`: opened 2026-10-21; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (also verified from the retained gzip body).

The source quote above is four words and is anchored at S077 `form_mcp_schema.cc:374–388`. Both source bodies are retained under `corpus/evidence/round-19/sources/`; the references are Chromium tag-pinned and accessed 2026-10-21.

## Case IDs and C1 counter

The case identifiers are unique for this decision: `decl-radio-02` occurs as a probe only for DV-16; its control `decl-radio-01` is distinct and in-family. The receipt contains 66 IDs with no duplicates. Static review of `.ufo/waves/round-19/measure-c1.mjs` confirms it rejects duplicate probe IDs (`:564–576`), duplicate case/receipt IDs, source date/status/hash/token/provenance failures (`:579–610`), mismatched case outcome and family, failed observations, and non-completed controls (`:635–713`). It also checks runtime/producer identity, case/fixture digest maps, and a fresh reproduction (`:455–467`, `:613–618`, `:804–879`). The receipt producer digest matches the on-disk harness digest: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`; receipt runtime declares Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0.

That is strong provenance and reproduction checking, **not semantic proof of the prose**. The counter only requires nonempty `condition`/`answer` (`:298–324`); its SKILL-row check verifies the decision ID, case IDs, and source ID, not that condition/answer entail the source (`:522–560`). For this case, `receiptObservation`/`comparableReceiptRecord` preserve only status, error text, and submit count (`:484–507`), not observed fields/schema. It checks `pass=true` and expected-record consistency, but does not compare the committed `observed.fields` with the fresh record. The fresh harness does reproduce the case, yet the counter alone would not detect a committed raw `fields` change that retained `pass:true` and the same status/error/count. This does not overturn the direct probe result, but it is a remaining receipt-integrity/semantic-binding limit.

## Residual risk and verification gaps

- DV-16 has no observed null, array/object, numeric, boolean, or preselected-radio cases; those behaviors above are source-derived, not runtime-verified by this decision.
- I did not run Chromium, a browser, or the full C1 counter, per assignment. Counter strengths/limits are code inspection, not a counter result.
- `read xd://lsp` returned “No such tool”; no LSP status/references/definition/diagnostics were available. Literal grep was used only to enumerate the prose mentions in SKILL and the knowledge note, not as semantic proof. The retained source body and raw receipt/probe records were read directly.
- No tools installed or updated.

## Isolation

No production files changed; no browser/runtime/mutation probe or scratch clone was created. The only lane write is this seat-owned report.
