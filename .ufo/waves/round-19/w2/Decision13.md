# Decision13 — DV-13 semantic entailment review

**Recommendation: DISAGREE with the unrestricted decision; AGREE with the narrower measured fixture result.** Advisory review only, not an admission or runtime verdict.

- Comparison: B `66251bfc1aef393e4aec599e950a8deb867736bb` → attacked R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Axes: source entailment; fidelity to raw runtime observations; type/coercion and submit-stage scope; identifier uniqueness and counter discrimination; isolation/non-mutation.
- All repository references below are LANE-relative. No browser, C1 counter, suite, orchestration runtime, or mutation probe was run.

## Findings, by severity

### P2 — The condition does not entail either selection of that disabled option or unconditional Completed

**Locations:** `corpus/evidence/round-19/validation/decisions.json:320-329`; `SKILL.md:2072`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:59-60`.

The condition is any single select receiving the value of a disabled option. The measured fixture is substantially narrower: one enabled, non-required select, three distinct nonempty string values, no input/change handlers, and an immediate successful submit responder (`validation/fixtures/select-enum.html:5-11,18-26`). The source does not turn the unrestricted condition into a guarantee:

1. **Duplicate values identify a value, not an option element.** S077 `form_mcp_schema.cc:398-405` builds a set of values; fill then calls `SelectOptionByValue` (`:1021-1031`). The retained primary HTMLSelectElement body, S081 `html_select_element.cc:311-324`, stops at the first matching value; `:327-343,1056-1073` selects that element and deselects the others. **[INFERENCE, source-derived; not browser-tested]** With an enabled option `value="x"` before a disabled option also `value="x"`, input `{"choice":"x"}` satisfies the stated condition and passes fill, but the enabled option is selected, not the disabled option. The original fixture has no such collision.
2. **A disabled required placeholder passes fill but fails native validation.** S077 `:403-405` accepts an empty string when it is an option value. S081 `html_select_element.cc:120-148,162-171` makes the first empty option a placeholder and reports value-missing for a required single select when that first option is selected. S078 `html_form_element.cc:729-759` reports a tool invocation failure before the submit event. **[INFERENCE, source-derived; not browser-tested]** An otherwise-simple required select whose first option is `<option value="" disabled>` therefore satisfies the stated disabled-option condition for input `{"choice":""}`, but does not yield the row's Completed/one-submit outcome. The current probe tests only nonempty `disabled-code`.
3. **Completion is a separate stage.** S078 `:174-221,713-759,790-806,290-327` separates successful fill, native validation, submit dispatch, and respondWith settlement. S081 `:1084-1086` also explicitly accounts for event handlers changing selection again. The decision cannot make arbitrary handler/constraint outcomes a property of the fill validator.

This is not a claim that `decl-select-enum-04` failed. Its recorded result is internally consistent. It is a claim that the unqualified condition is broader than the proposition proved by its source and one probe.

**Exact correction recommended:** retain DV-13 and its existing probe/control, but change its condition to:

> In the tested toolautosubmit fixture, an enabled single select receives its disabled option's unique, nonempty string value.

Change the answer to:

> Fill accepts disabled-code and selects the disabled option; one submit event completes with Completed. FormData and returned fields omit the disabled option. Other constraints, duplicate values, and event handlers are outside this observed outcome.

In the knowledge note, distinguish the general source rule—disabled state is not an exclusion in this fill validator—from the fixture-specific selection/completion result. Add the first-match and required-placeholder qualifications if retaining general guidance. Do not add new runtime-verified rows or credit for these unrun shapes.

### P3 — At R, “submitted” obscures the observed distinction between a submit event and serialized data; newer working text already addresses this

**R locations:** `decisions.json:321`; `SKILL.md:2072,2089-2090`; knowledge note `:59-60,76-77`.

R says “Accepted, selected and submitted: option disabled state is not filtered”. That is true only if “submitted” means a submit event, not submission of the disabled value or a navigation. The retained observations establish all three distinct facts:

- DOM value is `disabled-code`, and the original probe shows selectedIndex 2 with the disabled option selected (`validation/probes/select-enum.json:159-181`).
- There is one trusted, agent-invoked submit event.
- That event's FormData is `{}`, and the CDP response is `{ok:true,fields:{}}`, not `{choice:"disabled-code"}` (`receipt.json:3583-3589,3623-3625`; original probe `:180-181`; recorded repeat `:192`). The case author already states this distinction explicitly at `validation/cases/select-enum.json:112-113`.

The fixture calls preventDefault and respondWith (`fixtures/select-enum.html:25-26`); the S078 respondWith branch does not navigate. S081 `html_select_element.cc:1325-1335` explicitly filters disabled options when appending FormData entries. Thus disabled state is ignored for **fill membership**, but is honored for **successful-control serialization**. The broad agent rule should mean that disabled options are not a reliable fill/selection restriction, not that disabled-option serialization filtering disappears.

**Intervening change observed, not credited to this seat:** during this review, the working tree changed beyond R. Its `decisions.json:321` now explicitly says FormData omits the option; `SKILL.md:2115-2116` and knowledge note `:102-103` add the same clarification. I re-read those changes and inspected the scoped diff against R. They address this P3 wording issue. The unchanged condition at `decisions.json:320` still leaves the P2 scope issue above. This report does not present the corrected working text as the contents of R or claim to have integrated it.

## Re-derived source proposition and exact binding

### S077 — primary decision body

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- Access date: 2026-10-21; tag commit recorded in `corpus/SOURCES.md:91`: `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- Retained body: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.
- **Observed decoded SHA-256:** `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, matching DV-13 and the registry.
- Executed `zcat` and a separate `zcat | sha256sum`; used `zcat | nl -ba` to establish original source line numbers.
- Exact manifest interval `397-400`: line 397 is blank, 398 declares the set, 399 loops over options, 400 inserts each value. The exact token `GetOptionList()` is present at **399**. Verbatim source at 399-400: `for (HTMLOptionElement& option : element->GetOptionList()) {` / `allowed_values.insert(option.value());`.

**What those four lines entail:** every option delivered by that iterator contributes its value without a disabled-state predicate in this loop. They do not themselves contain the single-select acceptance return, the fill setter, the submit operation, or serialization.

The complete local acceptance rule is at `390-406`: the control must be a select; for a single select, the incoming JSON value must convert through the helper and its resulting string must belong to the collected set. The helper at `49-69` accepts strings, integers, doubles, and booleans, but not null/arrays/objects. `FillData:208-243` validates all supplied values before applying any. `FillSelectData:1021-1031` then selects by value with events enabled. `ProcessForm:1238-1246` drops a disabled select control itself; `IsSelect:1396-1397` requires one control for that parameter name.

**Anchor correction:** for a decision asserting acceptance, use S077 `390-406` rather than only `397-400`, with an acceptance token such as `allowed_values.Contains(s)`. Cite `1021-1031` separately for the fill operation. Preserve the decoded body hash; its binding is correct. For completion and omission, also cite the supporting primary paths below rather than attributing those facts to the four-line set-construction loop.

### Supporting retained primary bodies, independently decoded and hashed

| Source | URL / access date | Retained body | Observed decoded SHA-256 |
|---|---|---|---|
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — 2026-10-21 | `corpus/evidence/round-19/sources/html_form_element.cc.gz` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| S081 (queued registry source, supporting falsification only) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT — 2026-10-21 | `.ufo/waves/round-19/w1/TabiR19-2.SrcSelectFill-4.body.gz` | `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e` |
| S083 | https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-entry-list — 2026-10-21 | `corpus/evidence/round-19/sources/form-control-infrastructure.html.gz` | `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92` |

Exact supporting source excerpts: S078 `:794`: `CHECK(!should_submit);`. S081 `:318-320`: `if (item.value() == value)` followed by assigning that element and `break;`; serialization at `:1331`: `if (option.Selected() && !option.IsDisabledFormControl())`. S083 §4.10.22.4, retained decoded lines `2932-2936`, independently describes selected, non-disabled options as the entries to append. These bodies support a stage distinction, not a general JSON Schema-conformance claim.

## Re-derived runtime proposition, without reproduction

The committed receipt's probe and control are in family `select-enum` and both have `pass:true`:

| Witness | Input | Raw status/error | Submit count | DOM fields | toolResponded output.fields |
|---|---|---|---:|---|---|
| Probe `decl-select-enum-04` (`receipt.json:3533-3632`) | `{"choice":"disabled-code"}` | Completed / null; commandError null | 1 | `{"choice":"disabled-code"}` | `{}` |
| Control `decl-select-enum-01` (`receipt.json:3234-3335`) | `{"choice":"beta-code"}` | Completed / null; commandError null | 1 | `{"choice":"beta-code"}` | `{"choice":"beta-code"}` |

The probe and control each have matching invocationId values across their raw invoked/responded objects. The schema includes `disabled-code` in both enum and anyOf, with no required property. The original probe and its recorded repeat independently retain the same behavioral distinction; I inspected those stored observations, not a new run. The control demonstrates that the FormData/response path is capable of returning an enabled option value, so the empty probe output is not simply an always-empty responder.

Receipt runtime metadata names Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. The recorded generatedAt is `2026-10-21T07:42:02.722Z`. This review does not independently re-establish those installed runtime versions.

Observed file hashes agree with the receipt:

- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- `cases/select-enum.json`: `c1e5a2d4e039af63f0af293588976e782717cc9b5ca76319708590f874abf705`.
- `fixtures/select-enum.html`: `757b7f2948bb5af44968fb0933083603d4cc88f734cc0516f7ada8ddba395ebb`.

## Type, coercion, and timing challenges

The following are source-derived boundaries, **not additional runtime observations**:

| Shape | Source implication / qualification |
|---|---|
| Property value null, object, or array | S077 helper `49-69` cannot convert it; single-select validation fails before application. Null is not the empty string or the string `null`. |
| Numeric/boolean property value | The source can convert it to a string and compare membership. This fixture has no matching numeric/boolean spelling. DV-13 does not demonstrate strict JSON-string-only enforcement or test successful scalar coercion. |
| Omitted property | The supplied-property apply loop does not clear it; omission is not null or an empty option choice. |
| Select itself disabled | ProcessForm excludes that control; a disabled option inside an enabled select is a different case. |
| Duplicate option values | Selection is first-match by value; membership in the set does not identify the disabled element. |
| Required first empty disabled option | Fill can accept the empty option value, then native value-missing validation blocks submit. |
| Other constraints or input/change handlers | Fill does not guarantee the final state or submit success; eventful selection precedes native submit validation. |
| RespondWith rejected or unresolved | A submit event does not alone guarantee Completed. The tested handler immediately resolves successfully; it prevents a navigation. |

The generic rules at `SKILL.md:2088-2092` and knowledge note `:69-77` should be read with these stage boundaries, not as evidence of all disabled-option layouts or all client input types.

## Identifier uniqueness and counter strength

### Checks actually exercised

- Programmatic JSON queries: 27 decisions, **46 probe references / 46 unique probe ids**, no duplicate probe ids. `decl-select-enum-04` is owned only by DV-13.
- `decl-select-enum-01` is shared as the control of DV-12 and DV-13. This is permitted: the contract makes probe ids unique, not controls.
- `jq -s` over the 15 canonical case documents: **66 definitions / 66 unique ids**, no duplicates.
- Committed receipt query: **66 records / 66 unique ids**, no duplicates.

No uniqueness defect was found for this row.

### Static counter assessment

The counter is strong on the declared structural bindings: duplicate case definitions, duplicate receipt records and shared probe ownership are handled at `measure-c1.mjs:327-412,469-482,564-577,621-645,823`; family/control and input/expected/pass binding at `635-711`; decoded source hash/token/date at `579-610`; runtime, producer and case/fixture hashes at `455-467,613-618,855-865`. Its normal reproduction path selects the requested revision in a private sandbox at `748-801`. Those paths were read, **not executed**.

It is not a semantic entailment checker:

1. `indexDecisionRows:553-559` checks presence of probe, control, and source identifiers, not equality/meaning of the condition and answer cells. It does not inspect the knowledge-note prose. **[INFERENCE]** Changing the prose while retaining those identifiers is not discriminated by that function.
2. `sourceRejection:597-601` proves hash/line/token presence, not that GetOptionList entails selection, submit success, or serialized payload. The bound source token for DV-13 is genuine but weaker than the original answer.
3. Fresh/committed comparison reduces observed data to status, errorText, and submitCount (`receiptObservation/comparableReceiptRecord:484-508`, comparison `680-686`). It does **not** compare DOM fields, schema, commandError, or the response payload. The producer does check expected DOM fields/schema (`webmcp-validation-round19.mjs:1043-1062`), so those properties are supported for the current fixture through the producer's pass result; they are not independently compared as raw counter observations.
4. The producer retains raw toolResponded output (`:1124-1133`) but has no expected-output/FormData predicate. Its page reader reduces calls to their count (`:856-892`), discarding their fields/trust flags. Consequently, the enabled-control versus disabled-probe serialization distinction is inspectable evidence but not an asserted counter predicate. A changed serialization result with unchanged DOM/schema/status/count would not fail this case's expectations. This is a static limitation, not an executed mutant result.
5. `errorTextIncludes:null` suppresses the substring check rather than asserting errorText is absent (`:1046-1048`; counter `697-700`). The current probe really has null errorText; null in the expectation is not an independently strong absence assertion.

**Scoped improvement if the corrected statement is to be counter-protected:** bind normalized condition/answer cells to the manifest; assert the probe's empty response/FormData fields and the control's nonempty response fields; compare the corresponding stable observations between committed and fresh receipts. Exclude nondeterministic ids from equality, not the material output. Alternatively, explicitly describe payload/semantic review as outside the counter's numerical guarantee. No additional acceptance count is justified by this review.

## Residual risk and verification gaps

- One open recommendation: narrow DV-13's condition and its generic selection/completion language. The post-R payload clarification already observed is appropriate; I did not edit or replace it.
- No new runtime result for duplicate values, required placeholders, null/scalar variants, optgroup inheritance, or event-driven DOM changes. The two concrete alternative shapes above are source-derived falsification of unrestricted wording, not claimed fresh browser failures.
- LSP was unavailable: `read xd://lsp` returned `No such tool`, and the mounted-device inventory contains no LSP device. Therefore status/references/definition/diagnostics could not be obtained; there was no available cold server to warm/retry. Text search located anchors only; semantic conclusions come from bounded code/body reads and parsed observations.
- Two tooling inconsistencies were reported through `xd://report_issue`: ranged gzip reading returned an empty archive directory; a semicolon-separated artifact/path grep was parsed as one invalid artifact id. `zcat`, numbered decoded output, and separate searches supplied the missing evidence.
- The scoped working-tree diff against R showed subsequent changes to SKILL, the knowledge note, and three manifest answers; the inspected receipt, case, fixture, producer, and C1 counter were unchanged in that diff. The review preserves R's original wording separately from those newer amendments.
- No package/tool installation or update. All commands were bounded read-only Git, decompression/hash/numbering, or JSON-count operations and exited. No process/service remains owned by this seat.
- Single canonical runtime, same-identity rerouting, and resume_continuity_v1 are not changed by this decision's data/prose paths and were not re-audited. No saturation claim or all-27 decision verdict is made. L1 owns subsequent verification and integration.

## Isolation

- Clone: none created; this was a read-only semantic audit with no runtime or mutation probe.
- Branch: none.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Production commit: none; no production edits or Git writes.
- Changed path: `.ufo/waves/round-19/w2/Decision13.md` only.
