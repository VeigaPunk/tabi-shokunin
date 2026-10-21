# Decision14 — C1 / DV-14 semantic falsification

**Recommendation: AGREE with DV-14's two named observed rejection cases. DISAGREE that the counter fully checks the row's prose/state claim.** The retained source and raw observations support the decision; the actionable findings below concern verification strength and precision, not a reproduced Chromium counterexample. Advisory only; no admission, integration, or production change.

Reviewed checkpoint **R = d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47**, baseline **B = 66251bfc1aef393e4aec599e950a8deb867736bb**. The read-only lane-tip command returned R. The B→R scoped diff adds the decision/cases/fixture/knowledge note and counter/harness, and appends 67 SKILL lines. This is not a review of every round-19 change.

Axes: **source entailment; runtime-evidence fidelity; scope/type/timing precision; case/control identity; counter sensitivity.**

## Findings, by severity

### P2 — The counter drops the state and raw-response evidence needed for the full DV-14 claim

Location: `.ufo/waves/round-19/measure-c1.mjs:484-507,667-711`; advertised property: `SKILL.md:2073` and `validation/decisions.json:345-346`.

`receiptObservation()` returns only status, errorText, and submitCount. `comparableReceiptRecord()` uses that projection; it excludes observed fields, schema, commandError, invocationId, toolInvoked, and toolResponded. `validateDecisionCases()` compares the projections and trusts each record's `pass: true`. It does not independently re-evaluate the committed record's field/schema expectations.

Consequently, **[INFERENCE from the complete comparison path; no mutation probe run]** changing only the committed DV-14 record's `observed.fields.colors` from `[]` to `["red"]`, while retaining its existing pass/status/error/submitCount, would not change its comparison with an authentic fresh receipt. Removing or contradicting the nested raw response would likewise not enter the comparison. Case/fixture/producer hashes do not cover these changed receipt observations. This is a meaningful limitation for a row whose answer includes no selection change.

This does **not** invalidate the actual retained observations: they are internally consistent. It also does **not** mean the fresh harness ignores state: `scripts/webmcp-validation-round19.mjs:1043-1062` checks expected fields/schema, and `:1117-1133` derives the status/error from the invocation-matched response. The gap is the counter's independent validation of the committed evidence and its fresh-versus-committed comparison.

**Exact correction:** include deterministic observed fields and schema in the comparable projection; independently compare each committed and fresh record against its case's field/schema/error/status/submit expectations rather than accepting `pass` as the only assurance. Validate response consistency within each record: nonempty invocation id, matching toolInvoked/toolResponded ids, response status/error equal to the summaries, and correct tool/input. Do **not** compare random invocation/frame ids across separate runs. Add a fixture-mode counter self-test changing only a committed observed field; add a separate missing/inconsistent nested-response self-test. The existing scenario inventory at `measure-c1.mjs:1161-1176` tests a status mismatch, not these shapes.

### P2 — A counted SKILL row can say the opposite of the manifest without being rejected

Location: `.ufo/waves/round-19/measure-c1.mjs:522-560`; manifest strings are only checked for nonemptiness at `:303-304`.

`indexDecisionRows()` requires a unique decision id and the probe/control/source tokens somewhere in the row. It never compares the Condition or Observed outcome cells with `decision.condition` and `decision.answer`. **[INFERENCE; no mutation probe run]** changing DV-14's outcome cell to claim successful submission, while retaining DV-14, its three case ids and S077, leaves this row check unchanged. The remaining source/receipt predicates do not inspect that altered prose either.

The actual row and manifest at R agree, so this is a counter weakness rather than an observed documentation contradiction.

**Exact correction:** compare the normalized Condition and Observed outcome cells with the corresponding manifest strings, keeping the existing case/control/source checks. Add a fixture-mode self-test that changes only an answer cell, and another changing only a condition cell, while preserving every required token. A token-presence check should not be described as verification of semantic agreement.

### P3 — The multiple-select summary omits coercion/uniqueness, and its source anchor is narrower than its complete outcome

Locations: `corpus/knowledge/webmcp-declarative-validation-round-19.md:59-61`; `SKILL.md:2073`; `validation/decisions.json:345-365`.

The knowledge sentence describes an array of option values without stating uniqueness or Blink's scalar-to-string conversion. The validator removes every matched string from its allowed-value set. Thus an array of individually valid but repeated option values fails, and numeric/boolean items are not categorically rejected merely because the advertised item type is string. Their converted strings are tested instead. This is **source-derived**, not newly runtime-observed here.

DV-14's term non-option member should be read after this conversion; otherwise the condition is ambiguous for an option whose value is a numeric/boolean spelling. The bare-string half is unambiguous: a scalar string is rejected even when it names a valid option.

The declared token is present at exactly line 408 inside the stated interval 403–425. That interval proves the array/type/member/uniqueness rejection branch, but does not itself include option-set construction, error-message construction, or the validate-before-apply transaction. The complete retained body supplies those links; there is no source contradiction.

**Exact wording correction for the knowledge sentence:**

> Multiple-select fill validation requires an array. Each item must convert through Blink's scalar-to-string helper to a distinct option value; a non-array, an unconvertible item, an absent converted value, or a repeated converted value fails before filling. The runtime cases here observed rejection of ["red","invalid"] and the scalar "red", with zero submits and colors still [].

Keep coercion/duplicate/null extensions explicitly source-derived until probed. Define DV-14's non-option predicate as an absent value **after coercion**, without pretending those extra types were exercised. Expand the validator citation to `form_mcp_schema.cc:390-426`, and give the supporting `:49-69,208-241` and S078 `html_form_element.cc:192-224` anchors for conversion, atomicity/error construction, and no submission. If the table is intended to be strictly empirical, describe the state result as colors remained `[]` in the fresh fixture; the general preservation guarantee is source-corroborated.

## Source proposition, re-derived from retained bytes

I ran the requested `zcat` on the retained bodies, inspected their relevant decoded ranges, and separately hashed the decoded byte streams. No web refetch or domain-source-tree mutation was performed.

**S077:** [tag-pinned form_mcp_schema.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), retained file `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`; retained bytes reopened **2026-10-21**. Decoded SHA-256:

`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`

Both the working-file decode and `git show R:corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | zcat | sha256sum` produced that digest. It equals the DV-14 manifest digest and SOURCES S077's anchor (`corpus/SOURCES.md:91`); the row is mined and opened 2026-10-21, with tag commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.

Small exact source quotes, all from that URL/body/date:

- `:408`: `JSONArray::Cast(&value)` — exactly the decision token, not a paraphrase.
- `:423`: `allowed_values.erase(s);` — each successful normalized value is consumed.
- `:210`: “If the data isn't valid, form control states remain unchanged.”

Derivation:

1. `ValidateParameterData`, `:273-275`, dispatches an eligible single native select control to the select validator. This is not a custom-element or arbitrary same-name-control rule.
2. `ValidateSelectData`, `:397-400`, builds allowed strings from the option values; disabled-option state is not filtered there.
3. `:403-410` distinguishes scalar select from multiple select and requires a JSON array for the latter. The input `colors: "red"` therefore returns false before any fill.
4. `:413-423` converts each array item using the helper at `:49-69`, checks membership, and consumes the matched string. For `["red","invalid"]`, red is accepted into the validation walk, invalid fails membership, and no option-selection setter has run.
5. `FillData`, `:208-241`, first validates every parameter. It returns the quoted/unquoted invalid-value error on a failure at `:222-231`; only the separate later loop fills controls at `:233-241`. Arrays cannot be converted by that error-formatting helper, producing the unquoted array error; the scalar string produces the quoted error. These are fill-time invalid-input errors, not interactive-constraint errors.
6. The multiple-selection setter is reached only through the later fill phase (`FillSelectData`, `:1021-1054`). Validation failure therefore preserves pre-existing selections by this source path, not merely by assuming an empty default.

**S078 caller:** [tag-pinned html_form_element.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), retained `corpus/evidence/round-19/sources/html_form_element.cc.gz`; retained bytes reopened **2026-10-21**. Decoded SHA-256:

`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`

`FillFormControls`, `:231-258`, delegates to `mcp_schema.FillData`. `ExecuteTool`, `:192-201`, returns a fill error through the callback **before** the success branch becomes running or calls `PrepareForSubmission` at `:223-224`. This is the actual reason zero submit events are expected; it is not an assumption that an error response necessarily precedes all page actions. No submit/respondWith work is scheduled by this failing call path.

## Runtime proposition, re-derived from observations rather than pass flags

The fixture has one enabled native `<select name="colors" multiple>`, options red/green/blue, no `required` and no selected defaults (`fixtures/select-multiple.html:5-13`). Its synchronous submit listener appends an observation before responding (`:19-27`).

| Case / role | Actual input | Observed response | Submit count | Observed selected values | Receipt anchors |
|---|---|---|---:|---|---|
| `decl-select-multiple-01` / control | `{colors:["red","blue"]}` | Completed; error null | 1 | `["red","blue"]` | `receipt.json:3635-3733` |
| `decl-select-multiple-02` / probe | `{colors:["red","invalid"]}` | Error; `Invalid value for parameter colors` | 0 | `[]` | `receipt.json:3736-3823` |
| `decl-select-multiple-03` / probe | `{colors:"red"}` | Error; `Invalid value "red" for parameter colors` | 0 | `[]` | `receipt.json:3826-3910` |
| `decl-select-multiple-04` / extra in-family observation, not DV-14's assigned control | `{colors:[]}` | Completed; error null | 1 | `[]` | `receipt.json`, case `decl-select-multiple-04` |

For the three assigned records, commandError is null, toolInvoked names the right tool and serializes the specified input, and each record's invocation id agrees with its nested toolInvoked and toolResponded id. The probe ids are `FC450CBF7E2FA66EF4227A305EC9EBA5` and `9472CD7D8B708257D4CE50B5B55BEC5B`; the control id is `0D1DDE95C1518FDFF8F8B075F958E4E9`. These are correlated observations, not invocation-id-as-success reasoning.

The original retained probe independently contains **8 attempts: four cases × two repetitions**. I inspected its `/attempts/*/cdp/commandsAndEvents`, `/page/calls`, `/page/controls/0/selectedValues`, and `/observedSummary`. Both repetitions have the table's responses, zero probe submit calls, empty probe selections, and `timedOut:false`. All four `/stability` records say repeatCount 2 and stableSummary true. These are retained historical runs, **not runs performed by this reviewer**.

Do not confuse the control's response field `colors:"blue"` with its DOM selection array. The fixture uses `Object.fromEntries(new FormData(...))`, collapsing duplicate names to the last value (`fixtures/select-multiple.html:20`); the harness reads `selectedOptions` directly (`scripts/webmcp-validation-round19.mjs:879-880`). The raw page control list also records both selections. There is no one-option-only counterexample here.

### Identity and binding checks actually exercised

- Receipt runtime (`receipt.json:4-18`) and original probe `/runtime` both name Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. No alternate runtime was invoked during this review.
- `sha256sum` of the harness returned `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`, equal to receipt producerSha256.
- Case-file digest: `6d7b8bc6ca7cfd756a0672458d57546439ba9a0f4c7750277ed8b3019f1c47a7`, equal to receipt's select-multiple case binding.
- Fixture digest: `b5aa24ac70de9b911984695f28ff1285da141d5cad128b022bda00b3976643b3`, equal to receipt and original probe fixture binding.
- JSON grouping queries over the manifest returned **27 decisions / 46 probe references / zero duplicate probe owners**. Both DV-14 probes belong only to DV-14. The receipt has **66 cases / zero duplicate ids**, including four distinct select-multiple ids. The family case file has four distinct definitions, and the assigned control is Completed in that same family.
- Static counter checks detect duplicate manifest probe ownership (`:564-576,823`), duplicate case definitions (`:396-398`), duplicate receipt ids (`:469-481,626-628`), cross-family controls (`:659-664`), source hashes/tokens/dates (`:579-610`), and case/fixture hashes. These are stronger than pass-flag-only accounting, subject to the P2 omissions above.

## Comparison against all relevant prose in the two requested documents

- `SKILL.md:2040-2047` and knowledge `:13-20`: correctly scope these observations to the pinned build, loopback, flags, native declarative form tools; the knowledge note expressly excludes forms without toolautosubmit and custom elements/file inputs.
- `SKILL.md:2051-2056` and knowledge `:35-42`: the fill-time/submit-time distinction matches the source call path and the exact two DV-14 messages. The atomicity statement is source-supported, with the fresh empty-state empirical limitation below.
- `SKILL.md:2073`, manifest `:343-365`, family cases `:36-89`: condition, cases, assigned success control and the two specific messages agree. The source token/hash/interval are genuine.
- Knowledge `:59-61`: consistent for these examples, but incomplete as a full acceptance rule; apply P3's uniqueness/coercion clarification.
- `SKILL.md:2088-2092` and knowledge `:69-77`: matching selects by option value rather than label, and interpreting fill errors as no fill, are consistent with the source. Neither paragraph should be read as strict JSON Schema item-type enforcement, nor as proof that passing fill implies successful HTML submission.
- Knowledge `:24-31`: unique probe ownership and in-family control are supported by the data queries. A verified source token is a byte/line binding, not an automated entailment proof; the P2 counter findings are the limit to the method description.

## Residual risk and verification gaps

- **Null/type/coercion:** the multiple-select family does not runtime-test `colors:null`, `[null]`, object/nested-array items, numeric/boolean option spellings, duplicate values, or duplicates after coercion. Source inspection predicts non-array rejection, unconvertible-member rejection, and duplicate-normalized-value rejection. Numeric/boolean array members can pass fill if their converted strings match distinct options. These predictions are source-derived, not browser observations from this seat.
- **Submit timing:** rejection is before the caller's autosubmit branch. Valid fill can still fail later constraint validation; the empty-array success is for this non-required fixture only. Do not transfer it to a required select, nor treat a generic Error as a universal no-mutation guarantee.
- **State preservation:** both invalid cases use a fresh fixture with empty selection. They demonstrate the valid prefix was not left selected, but do not empirically distinguish preservation of a nonempty prior selection from a hypothetical clear-before-reject implementation. General preservation is backed by the validate-all-before-apply source chain. A preselected-control case would be stronger independent runtime evidence; none was run or added here.
- **Counter execution:** no browser, full C1 counter, self-test, build, lint, or suite was run. The fail-open scenarios above are explicitly static inferences, not claimed measured mutant outcomes. L1 owns subsequent verification.
- **LSP:** attempting to read `xd://lsp` returned `No such tool: xd://lsp` and the mounted-device inventory contains no LSP device. Status/references/definition/diagnostics were therefore unavailable, not empty warm-index results. Literal grep located relevant text; the entailment evidence is the inspected definitions/call path and receipts, not grep as semantic proof.
- Same-identity rerouting, resume continuity/preflight, and runtime saturation/admission logic are not changed or exercised by this scoped decision path. No repository-wide claim about them is made. Finite examples do not establish complete JSON Schema conformance.
- Tools installed/updated: **none**. All commands were finite read-only source/data inspection; no owned service/browser process remains.

## Isolation

- Seat: TabiR19.Decision14; report-only reviewer, no delegation.
- Clone: not created; no runtime or mutation probe was performed.
- Branch: none created; no git writes or jj commands executed.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Reviewed checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Production commit: none; no production files changed.
- Only direct LANE write: `.ufo/waves/round-19/w2/Decision14.md`.
