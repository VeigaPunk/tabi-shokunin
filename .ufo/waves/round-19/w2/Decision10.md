# Decision10 — C1 DV-10 semantic falsification

**Recommendation: DISAGREE with DV-10 as currently worded; AGREE with its two finite recorded outcomes.** Two medium-severity findings follow. This is advisory review, not admission or a canonical judgment.

Reviewed baseline `66251bfc1aef393e4aec599e950a8deb867736bb` → attacked checkpoint `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The lane's `refs/heads/master` resolved to that checkpoint when inspected. The actual diff adds the round-19 SKILL section, knowledge note, and number-type cases/fixture; these are new claims, not inherited baseline wording.

Axes: **source entailment; runtime/type fidelity; condition scope and submission timing; identifier independence; counter assertion strength.** Independent reads, hashes, and identifier counts were batched. No browser, full C1 counter, suite, mutation probe, alternate orchestration runtime, or subagent was invoked.

## Findings, by severity

### P2 — F1: The condition promises submission for a class of inputs that the cited source does not establish

Locations: `corpus/evidence/round-19/validation/decisions.json:239-261`; `SKILL.md:2069`; related knowledge prose at `corpus/knowledge/webmcp-declarative-validation-round-19.md:48-53`.

The manifest and SKILL both say a number control receiving a numeric string or large exponent is accepted and submitted. Their source is S077 lines 49–62, token `String::Number(d)`. That token is present at **decoded line 60**, and the decoded body's SHA-256 matches exactly. However, this window is only the scalar-to-string helper:

- Lines 50–52 accept an existing JSON string through `value.AsString(&out)` and return immediately. This is not evidence that the JSON string became a JSON number. The recorded toolInvoked input still contains the string `"42"`.
- Lines 58–61 serialize a double through `String::Number(d)`. The helper does not itself validate a number control, dispatch a submit event, or demonstrate the exact formatter implementation. The precise six-decimal-mantissa spelling comes from the finite runtime observation, not from that token alone.
- Number dispatch is at S077:270–271; `ValidateNumberData` at 321–335 additionally requires one control, successful conversion, a nonempty result, and nonempty number sanitization. Fill occurs later at 950–960. Null/array/object do not acquire JavaScript-style numeric coercion through this helper.
- S078:174–222 separates successful fill from autosubmit; S078:713–758 performs interactive form validation before the submit event. Thus fill acceptance is not a general guarantee of submission.

This is not just an abstract missing qualification. The adjacent DV-11 and its retained receipt demonstrate filled numbers failing min/max/step with zero submits: `decl-number-range-01/02/03` (`receipt.json:2131-2300`, case definitions `cases/number-range.json:8-83`). A numeric string follows the same number validator and setter. **[INFERENCE, not a browser reproduction]** A numeric-string value violating those constraints can pass fill and fail at submit; likewise an otherwise valid large numeric value can exceed a form's max. Even the number-type fixture has default step behavior (`multipleOf:1` in its observed schema), not an unconstrained acceptance promise. Other invalid controls can prevent submission too.

The knowledge note already distinguishes number fill from min/max/step submission failures at 48–53, making it more accurate than the unconditional table row. Its general large-number sentence should nevertheless be explicitly limited to the tested JSON-number example. The phrase that the string is coerced should be replaced with accepted unchanged as text; the DOM's separate `valueAsNumber` observation does not prove JSON Schema type conversion.

**Exact correction recommended** in both the manifest condition/answer and SKILL row, preserving the existing probe/control IDs and observed outcome:

- **Condition:** `The number-type toolautosubmit fixture receives {n:"42"} or {n:1.25e+21} (a JSON number); n is one enabled number input with no min/max.`
- **Answer:** `Both tested inputs Completed with one prevented submit event: string "42" filled as "42", while JSON number 1.25e+21 filled as "1.25000e+21". String acceptance is not strict JSON Schema type enforcement; number sanitization and form constraints still apply before submission (DV-11).`
- **Source cell:** `S077 form_mcp_schema.cc:49-69,270-271,321-335,950-960; S078 html_form_element.cc:174-222,713-758`. Keep the current SHA/token binding as evidence for the double-to-string subclaim, not as standalone proof of the entire answer. If the manifest retains a single source object, document those additional supporting anchors in the row/note rather than pretending its single token proves every subclaim.
- **Knowledge note:53:** replace the broad large-number sentence with `For the tested JSON number 1.25e+21, the filled value was "1.25000e+21"; this does not establish formatting or successful submission for every exponent or numeric string.`

No replacement runtime result is needed to narrow the prose to what the existing evidence actually supports.

### P2 — F2: The counter does not bind DV-10's exact value/type teaching to the committed observations or SKILL prose

Locations: `.ufo/waves/round-19/measure-c1.mjs:303-304,484-507,522-560,579-610,673-711`; harness `scripts/webmcp-validation-round19.mjs:1043-1062`.

The harness does compare expected fields and schema paths against its fresh page observation. For the existing number-type cases, these are useful exact checks of `n="42"` and `n="1.25000e+21"`. The counter's subsequent committed-versus-fresh comparison is narrower:

1. `receiptObservation` retains only status, errorText, submitCount. `comparableReceiptRecord` therefore drops observed fields, schema, commandError, toolInvoked input/type, and toolResponded output.
2. The manifest outcome contains only the same three coarse outcome properties. No exact field assertion is bound to the decision's reserialization teaching.
3. `indexDecisionRows` checks row uniqueness and presence of probe/control/source IDs anywhere in the row; it never compares condition/answer cells with the manifest. Manifest condition/answer need only be nonempty strings.
4. `sourceRejection` proves digest and token containment, not that the source entails the natural-language claim. That distinction must remain explicit.

**[INFERENCE from the code, not an executed mutant]** Changing only the committed `decl-number-type-05.observed.fields.n` and `observed.toolResponded.output.fields.n` to an incorrect string, leaving its expected fields, pass flag, and coarse outcome intact, is invisible to the counter's committed/fresh equality projection. A contradictory SKILL answer preserving its IDs is likewise outside its assertions. Thus a counted decision is not proof that the committed raw observations, exact value teaching, and SKILL prose agree.

**Correction recommended:** compare stable observed fields/schema and the stable semantic portions of invocation/response evidence, or independently re-evaluate each retained receipt against its case expectations; do not compare volatile invocation/frame IDs across fresh contexts. Require SKILL condition/answer cells to match a documented canonical rendering of the manifest, and keep semantic source review separate from token-presence credit. For `errorTextIncludes:null`, explicitly distinguish no-error from don't-care: both harness 1046–1048 and counter 697–700 currently skip the error-text assertion for null. The current receipt really has null; this is a predicate weakness, not evidence of a current unexpected error.

## Re-derived source proposition and provenance

Primary source access date: **2026-10-21, retained-body inspection only; no network re-fetch claimed.** Bodies were decoded with `zcat`, and `zcat <absolute-body-path> | sha256sum` produced:

| Source | Exact URL / anchor | Decoded SHA-256 | What it establishes |
|---|---|---|---|
| S077 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — decoded lines 49–69,270–271,321–335,950–960 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | Scalar string conversion; number-specific sanitization gate; subsequent fill setter. At 60 the manifest token is exact. It does not itself establish unconditional submission or every double's output spelling. |
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — decoded lines 174–222,713–799 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | Successful fill proceeds to autosubmit only on the autosubmit branch; interactive validation precedes submit dispatch; respondWith promise settlement controls completion. |

`corpus/SOURCES.md:91-92` records both at tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, opened 2026-10-21, mined. The source registry describes S077 as source-level only, appropriately separating source from receipt evidence.

## Re-derived runtime proposition

All entries below are **observed in the retained receipt**, not freshly reproduced in this seat. In all three, observed commandError/errorText are null, toolResponded is Completed with matching invocation ID, submitCount is 1, schema type for n is number, and pass is true.

| Role / ID | Exact sent input and toolInvoked JSON | Filled field and response output | Receipt anchor |
|---|---|---|---|
| Control `decl-number-type-01` | `{ "n": 42 }`; toolInvoked input `{"n":42}` | n = `"42"` in both observed.fields and toolResponded.output.fields | `receipt.json:2364-2421` |
| Probe `decl-number-type-02` | `{ "n": "42" }`; toolInvoked input `{"n":"42"}` | n = `"42"` in both places; the invocation still carries a JSON string | `receipt.json:2424-2481` |
| Probe `decl-number-type-05` | `{ "n": 1.25e+21 }`; toolInvoked input `{"n":1.25e+21}` | n = `"1.25000e+21"` in both places | `receipt.json:2594-2651` |

The original family probe supports the same distinction: `validation/probes/number-type.json:347-462,675-790` records one trusted, agentInvoked submit each, valid controls, string .value, numeric .valueAsNumber, and no step mismatch. Its second repeats and stability summaries also retain the same values. Repeated IDs there have an explicit repeat dimension; they are not duplicate canonical receipt cases.

Submission timing is adequate for this finite fixture: `fixtures/number-type.html:12-16` synchronously records the submit, prevents navigation, and resolves respondWith. The harness waits for toolResponded matching the command's invocation ID **before** reading page state (`scripts/webmcp-validation-round19.mjs:1115-1133`). Consequently the reported one submit is not merely inferred from invocationId or an early fill snapshot. Here submitted means a submit event handled by this fixture, not a network submission or persistent application-side effect.

The receipt identifies Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. Direct SHA-256 calculations matched its producer/case/fixture metadata:

- Harness: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- `cases/number-type.json`: `8dc00aa78934c2af2fc9e75d79b51977cf4fae5901c2bdc366ccdef70ea09557`.
- `fixtures/number-type.html`: `cd10314d21f9ca33ff3004f987bdf1737df215ce18fa0bf2e8776db530a72af0`.

The counter's production reproduction path selects the canonical absolute Node binary and checked-out target revision (`measure-c1.mjs:748-801`); no independent runtime or reproduction was started here.

## Identifier and prose cross-checks

- Manifest: **27 distinct decision IDs; zero duplicate probe IDs**. DV-10 probes 02/05 occur only as DV-10 probes. Control 01 is reused by DV-09 and DV-10, intentionally; it is distinct from both DV-10 probes and is in the same family.
- All case definitions: **66 IDs / 66 unique / zero duplicates**, computed with a structured jq aggregation over the committed family files. Receipt: **66 / 66 unique / zero duplicates**. Each of DV-10's two probes and control appears once.
- Counter defenses for identity are substantive: duplicate probes at 564–576; duplicate definitions at 383–407; duplicate receipt cases at 469–481/621–631; same-family control at 659–665; exact input and expected-object binding at 673–678; runtime/producer/file maps at 852–865. These support identity, not semantic entailment.
- SKILL:2040–2047 appropriately restricts the build/site/client scope; SKILL:2051–2056 correctly separates fill and submit errors; **2069 still needs F1's correction**. DV-11 at 2070 gives the missing constraint qualification. SKILL:2088–2089 recommends sending JSON numbers; that is conservative caller guidance, not proof that strings are rejected.
- Knowledge note:13–20 excludes non-autosubmit tools; 24–31 explains the finite method; 48–53 supplies the sanitization and submit-constraint distinction; 69–75 recommends reading status/error rather than trusting schema. No other DV-10/exponent/coercion teaching was found in the literal SKILL/note search. The broad formatting sentence at 53 should be narrowed as above.

## Residual risk and verification gaps

- Number-type has five canonical cases, but **no number-property null, array/object, empty/whitespace string, fractional default-step violation, exponent string, negative-zero, extreme finite, overflow, or precision-boundary case**. Do not call two success probes saturation of numeric coercion. The null/string/object rejection implications above are source-derived where stated, not measured number-type outcomes. A top-level null is a different CDP-boundary case from `{n:null}`.
- Exact formatting for JSON-number 1.25e+21 cannot be generalized to a string spelling of that exponent: the helper's string branch returns before the double formatter. The retained receipt does not probe that cross-product.
- LSP unavailable: requesting `xd://lsp` returned `No such tool`; it is absent from the mounted device inventory. Status/references/definition/diagnostics could not run, so text searches are recorded only as literal discovery, never semantic proof. Semantic conclusions are from inspected definitions/control flow and structured retained observations, not an empty LSP result.
- The compressed-source ranged read returned an empty archive-directory view despite a valid gzip body. Reported through `xd://report_issue`; used explicit zcat decoding and read its retained tool output instead.
- No browser, counter, test, lint, build, or new negative-case run was performed, as assigned. No claim that F2's proposed negative shapes were exercised. Runtime routing/resume-continuity changes are outside this DV-10 diff/scope; no rerouting or resume claim is made. All checks above are static reads, decoded-body/file hashes, actual diff inspection, or structured counts.
- No tools installed or updated. Only finite read/hash/count commands were started; no persistent process was created.

## Isolation

- Clone path: **none** — report-only static review; no runtime/mutation probe requiring a sandbox clone.
- Branch: **none**; no Git/JJ writes or seat commit.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Reviewed commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (not a seat-created commit).
- Changed paths: `.ufo/waves/round-19/w2/Decision10.md` only. Production files, fleet state, other seats, domain sources, and browser profiles unchanged.
