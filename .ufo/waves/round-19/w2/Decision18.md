# Decision18 — C1 / DV-18 semantic falsification

**Recommendation: disagree with the unqualified decision; agree with the recorded fixture result.** The rejection, retained value, and zero submit-listener calls are supported. The generic condition needs the native-validation and post-fill qualifiers below. This is an advisory review, not claim admission.

Reviewed baseline B `66251bfc1aef393e4aec599e950a8deb867736bb` → checkpoint R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; the read-only `refs/heads/master` lookup returned R. Repository citations below are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

**Axes:** source entailment; raw-observation fidelity; condition/type/timing precision; case/digest identity; counter falsifiability. Review scope is DV-18 and its supporting callers/evidence, not the other 26 decisions or C2/C3.

## Findings, by severity

### P2 — The pattern-rejection rule omits a source-visible validation bypass

Locations: `corpus/evidence/round-19/validation/decisions.json:448-467`, `SKILL.md:2077`, and `corpus/knowledge/webmcp-declarative-validation-round-19.md:62`. The shared explanatory passages are `SKILL.md:2051-2056,2088-2092` and the knowledge note `:35-42,69-75`.

The condition says any text value violating `pattern` is filled and rejected without submit. **Even on the pinned build and a `toolautosubmit` form, native validation need not run.** In the retained S078 body, `html_form_element.cc:713-715` computes `skip_validation` from the form's `novalidate` and the selected submitter's `formnovalidate` (and page presence). At `:729`, only a non-skipped, failed interactive validation enters the error branch. The alternative branch dispatches the submit event at `:760-776`. `NoValidate()` at `:1457-1459` reads the actual form attribute.

Thus a same-form `novalidate` variant with the same mismatching value follows the submit-event branch by source control flow **[INFERENCE; not browser-reproduced here]**. Neither the one-build/loopback qualification nor `toolautosubmit` excludes that branch. The actual fixture has neither bypass (`validation/fixtures/text-constraints.html:5-7`), so this finding does not falsify its observed result.

The declared source interval `:729-751` contains the generic error-prefix token, but omits both the bypass calculation and the eventual callback (`:755-758`). It is not, by itself, evidence of pattern semantics, the preceding fill, or the exact English validation message. Those require the supporting fill path and raw observations described below.

**Exact correction recommended to the L1:**

- Replace the DV-18 condition in the manifest and its SKILL representation with: **“On the text-constraints toolautosubmit fixture, q receives the nonempty string abc for pattern [A-Z]+, with native constraint validation enabled and the mismatch still present after fill.”**
- Describe the answer as: **“q remains abc; pre-submit interactive validation returns Error; errorText contains Form validation failed: q: Please match the requested format.; the submit listener is not called (submitCount 0).”** Identify that text as a substring, not the complete raw error.
- Replace the knowledge note's pattern sentence with: **“For this enabled-validation text-input fixture, a post-fill patternMismatch fails during interactive validation before the submit event; this is not schema-level rejection or a rule for bypassed validation.”** Carry the qualifier into the shared SKILL explanation by an append-only correction, consistent with PLAN's shared-file contract.
- Expand DV-18's S078 source binding to `lines: [713, 778]`, preferably token `!skip_validation && !ValidateInteractively()`. Retain the existing body and decoded SHA. Cite S077 `:49-69,208-241,302-319,933-947` separately for conversion/fill and the raw probe for the pattern-specific state/message. No case-ID change or removal of the supported fixture observation is warranted.

### P2 — The counter can credit DV-18 while its published condition/answer contradict the evidence

Locations: `.ufo/waves/round-19/measure-c1.mjs:283-324,522-561,579-610,635-714`.

`parseManifest` requires only nonempty condition/answer strings. `indexDecisionRows` checks the row ID and whether the combined row text contains the probe ID, control ID, and source-row ID; it never compares the condition or observed-outcome cells with `decision.condition` or `decision.answer`. `validateDecisionCases` compares structured outcome fields, not either prose field. Source checking authenticates bytes and token presence, not the proposition.

Consequently, changing just DV-18's SKILL outcome to “Completed and submitted” while retaining its IDs/source is invisible to the row predicate **[INFERENCE from the complete predicate/dataflow; no mutation or counter run performed]**. This is relevant to the advertised runtime-verified *decision table*, not merely formatting. At R the actual SKILL row and manifest agree; this finding is a concrete guard weakness, not an observed false receipt.

**Exact correction recommended:** compare the parsed condition and outcome cells to the manifest's condition/answer under one documented Markdown normalization; reject mismatches with stable reasons, and add isolated changed-condition/changed-answer negative cases. Keep external semantic review explicit: literal source-token presence cannot establish entailment. Existing self-test scenarios at `:1161-1177` do not include these two prose-drift cases.

## Re-derived source proposition

All three retained bodies below were actually decoded with `/usr/bin/zcat` and hashed with `/usr/bin/sha256sum`; no network fetch was made. Access/review date: **2026-10-21**.

| Source | URL / exact retained anchor | Observed decoded SHA-256 |
|---|---|---|
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — `:174-258,713-778`; declared token `Form validation failed: ` occurs at `:733` inside `[729,751]` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| S077 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — `:49-69,208-241,302-319,933-947` | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| S082, supplemental normative boundary | https://html.spec.whatwg.org/multipage/input.html#the-pattern-attribute — retained `input.html:5052-5083`; text sanitization `:1762-1763` | `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` |

S078 entails this conditional chain: execute the form tool → successfully fill controls → autosubmit calls `PrepareForSubmission` → if validation is enabled and interactive validation fails, build a message from currently invalid candidate controls and their `validationMessage()` → return invocation failure instead of dispatching submit. It does **not** hard-code the requested-format English string or implement the pattern predicate in the cited interval. `corpus/SOURCES.md:92` correctly describes S078 as source-level execution/response wiring and includes the same hash/opened date.

The supplementary HTML body defines pattern mismatch for a nonempty element value and a successfully compiled, whole-value pattern; a missing/invalid pattern provides no compiled regexp. This normative text is not independently a Chromium-runtime observation.

## Re-derived runtime proposition, from raw retained observations

Fixture: `validation/fixtures/text-constraints.html:5-8` has one enabled `input type=text`, name `q`, pattern `[A-Z]+`, minlength 3, maxlength 5, inside a `toolautosubmit` form. Its only listener records submit calls and settles `respondWith` (`:14-26`); there are no input/change/invalid handlers in this fixture.

| Witness | Input | Actual status / state | Evidence |
|---|---|---|---|
| DV-18 probe `decl-text-constraints-01` | `{ "q": "abc" }` | `Error`; `commandError:null`; q remains `abc`; `submitCount:0`; `pass:true` | `receipt.json:4003-4055` |
| In-family control `decl-text-constraints-04` | `{ "q": "ABCD" }` | `Completed`; output and final q both `ABCD`; `submitCount:1`; `errorText:null`; `pass:true` | `receipt.json:4178-4235` |

Probe `toolInvoked` and `toolResponded` have the same invocation ID in the raw receipt (`:4023-4033`). The **complete** error is `Form validation failed: q: Please match the requested format.. `, including two periods and a trailing space. The row's shorter message is a valid substring; it must not be presented as byte-exact output.

The original family probe independently records `patternMismatch:true`, `valid:false`, q=`abc`, and an empty calls array in both passes (`validation/probes/text-constraints.json:47-118`). Its original control records `patternMismatch:false`, one trusted agent-invoked submit and q=`ABCD` (`:276-351`). Original probe labels differ from canonical case IDs, but matching tool/input/state gives an unambiguous mapping. This is stronger support than trusting only `pass:true`.

### Null, type, coercion and timing challenges

- **Nested null/array/object:** S077's conversion helper accepts strings, numeric scalars and booleans, not null/arrays/objects (`:49-69`). `ValidateTextData` rejects failed conversion before any fill (`:302-310`); `FillData` validates every supplied parameter before mutation (`:208-241`). Such values do not belong to this post-fill pattern-rejection decision. No same-fixture null/type run is claimed.
- **Numbers/booleans:** scalar conversion is possible despite the emitted schema's string type. Their resulting strings, not the original JSON types, reach text validation. Do not turn DV-18 into a strict JSON-schema type rule. These boundary outcomes are source-derived, not runtime-reproduced here.
- **Empty/omitted input:** empty strings pass fill validation; pattern mismatch requires a nonempty element value under S082. The fixture is not required. Omission is not equivalent to null or an explicit mismatching value. No extra DV-18 case covers these boundaries.
- **Sanitization:** pattern is checked on the actual element value. S082 strips text-input newlines; for example a raw `ABC\n` can become matching `ABC` **[INFERENCE]**. “Violates pattern” must not mean testing the raw input JSON string before sanitation.
- **Timing:** S077 fills with input/change dispatch enabled (`:933-947`), then S078 autosubmits (`:212-219`). Validation occurs before the submit event (`:713-776`). Zero submit calls does not mean zero fill-side effects or zero input/change events. Page handlers could change state between fill and validation; none exist in this fixture.

## Identity, uniqueness and counter strength

Actual JSON queries found **27 decisions, no duplicate probe IDs; DV-18 owns its probe once**. Its control is shared with DV-19, as permitted. The receipt contains **66 cases, no duplicate case IDs**, and exactly one entry for each scoped ID. A literal definition search found each scoped ID only in `cases/text-constraints.json` (`:8,65`); these are data-identity observations, not LSP semantic proof.

Observed SHA-256 bindings match the receipt maps:

- Case document: `48f55805b93c744deaa115401c28eb75a82871a30e525f9f66c05fe6210fa727` (`receipt.json:34`).
- Fixture: `a641942d45e39fca431432c530f68c0f267b64533be5538d1e353166c44cb729` (`:51`).
- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` (`:20`).
- Receipt file reviewed: `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`.
- Decision manifest reviewed: `839d6501aeb5ab73a9c81d6edc72ce013ddcf4ad4cc3b8891d9929f3385bed5a`.

The stored runtime is the canonical Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 (`receipt.json:4-18`), agreeing with the original probe and harness constants (`scripts/webmcp-validation-round19.mjs:35-37`). No alternate runtime, rerouting or browser invocation was introduced.

The fresh harness does check q retention, schema pattern, status, error substring and submit count (`scripts/webmcp-validation-round19.mjs:1043-1062`); it correlates responses to invocation IDs before observing form state (`:1115-1133`). The counter rejects duplicate probes, duplicate receipt IDs, wrong family/control completion, source hash/token errors, and case/fixture/producer digest mismatches; its canonical fresh-reproduction path is `measure-c1.mjs:748-879`. Those are substantive protections.

## Residual risk and verification gaps

- `measure-c1.mjs:484-507,680-687` projects observed receipt comparisons down to status/errorText/submitCount. It omits actual fields/schema and raw CDP envelopes. A corrupted committed q field with `pass:true` is not independently compared; the fresh harness's field check still supports the real runtime result. Strengthening the committed-evidence check would make the “filled” assertion more directly red-capable.
- The final receipt does not retain validity flags; patternMismatch comes from the original family probe, not a new validity assertion in the final harness.
- No exhaustive pattern, locale, handler-interference, empty, null, coercion, or bypass coverage is demonstrated by one probe and one control. No saturation claim is justified for those boundaries.
- LSP could not be used: reading `xd://lsp` returned `No such tool: xd://lsp`; no LSP status/references/definition/diagnostics device was mounted. All caller/definition inspection was static source reading plus explicitly literal searches, never represented as semantic-reference proof.
- Exercised only read-only Git diff/revision lookup, retained-body decompression/hashing, JSON queries and source inspection. **No browser, full C1 counter, self-test, build/lint/test suite, runtime mutation or alternate runtime was run.** No tools were installed/updated and no persistent processes were started. Resume-continuity paths are not part of this assigned decision.

## Isolation

- Seat: `TabiR19.Decision18`.
- Clone / branch: none; this was a static, report-only review, with no runtime or mutation probe.
- Base reviewed: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Checkpoint reviewed: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Production commit: none; no production edits or Git writes.
- Sole written path: `.ufo/waves/round-19/w2/Decision18.md`.
