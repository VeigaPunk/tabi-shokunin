# Decision09 — DV-09 semantic falsification at R

## Verdict and axes

**AGREE with DV-09's measured number-input rejection. DISAGREE with two overbroad prose rules that accompany it.** Neither probe nor the success control contradicts the decision. Two P2 documentation corrections are warranted; there is no demonstrated reason to remove DV-09's own decision credit. This is an advisory recommendation, not an admission or integration decision.

Axes: **source entailment; type/initial-state scope; raw-observation and control fidelity; unique case ownership and counter strength; isolation/no additional runtime.** Independent source, receipt, prose and counter inspections were batched. No browser, validation harness, full C1 counter, test suite or alternate runtime was run.

Reviewed baseline `66251bfc1aef393e4aec599e950a8deb867736bb` → attacked checkpoint **`d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R)**. The scoped Git diff adds the round-19 SKILL section, knowledge note, decision manifest, number cases and fixture; it does not replace baseline implementations. Initial `refs/heads/master` resolved to R. The DV-09 record and global probe-ID ownership were also read directly from R with `git show`, not inferred from the mutable lane tip. Findings below refer to R.

## Findings, by severity

### P2 — The unqualified empty-string clearing rule gives the wrong instruction for number inputs

**Location:** `SKILL.md:2088-2092`, specifically the final instruction to treat `""` as clearing.

The paragraph includes number-input advice but does not restrict its clearing instruction to the text/textarea controls exercised by DV-27. For the number control under DV-09, the retained implementation explicitly requires both a nonempty converted input and a nonempty sanitized result. The exact guard at S077 `form_mcp_schema.cc:330-331` is:

> `return !number_string.empty() && !input->SanitizeValue(number_string).empty();`

Thus a property value `{n:""}` cannot enter the number fill setter. **[INFERENCE from the retained source, not a new runtime observation]** It returns the quoted invalid-value error, preserves the previous number value and never reaches autosubmit. An agent following the current footer to clear a prefilled number control will instead receive a fill-time error. The number family has no empty-string probe, so its receipts must not be represented as runtime verification of this boundary.

**Exact scoped correction:** replace/supersede the final clearing instruction with:

> Treat omission as “leave as is”. For the tested optional text/textarea controls, `""` clears; do not generalize this to number controls, whose fill validator rejects `""`.

The knowledge note's similar text at `corpus/knowledge/webmcp-declarative-validation-round-19.md:62-65` is inside its **Text** item and is not independently a number-input claim. This number-specific footer finding corroborates the scope correction being reviewed by `TabiR19.Decision27`; it is not an additional attack on that seat's fixture result.

### P2 — The knowledge summary incorrectly extends number rejection to range controls

**Location:** `corpus/knowledge/webmcp-declarative-validation-round-19.md:48-50`.

The sentence begins with **Number/range**, then states that `"not-a-number"` and `true` fail during fill. Its next sentence describes the range exception, but does not undo the first sentence's incorrect type scope. Sharing `ValidateNumberData` does not mean sharing sanitization: S077 `form_mcp_schema.cc:271-278` dispatches number and range to that validator, while its `input->SanitizeValue` call is control-type-specific. S082's retained number and range algorithms differ (`input.html:3228-3229` versus `3391-3392`).

There is a direct retained runtime counterexample to the nonnumeric-string part of the summary:

- `receipt.json:2945-2949`: `decl-range-color-02` sends `range:"not-a-number"`.
- `receipt.json:2966-2985`: correlated `toolInvoked`/`toolResponded` records show **Completed**, not Error; the returned range is `"6"`.
- `receipt.json:3006-3016`: one submit, post-invoke range `"6"`, `pass:true`.
- Its fixture is actually `type=range`, `min=0`, `max=10`, `step=2`, initial value `4` (`fixtures/range-color.html:5-7`).

The correct distinction is already present in `SKILL.md:2068` (DV-09, number rejection) and `:2082` (DV-23, range sanitization). This finding concerns the knowledge note's restatement of DV-09, not a demand to alter DV-23.

**Exact correction:** split the opening statement:

> Number: `ValidateNumberData` accepts nonempty scalar strings whose number sanitization remains nonempty; the tested `"not-a-number"` and JSON `true` fail at fill. Range uses the same validator but a different sanitizer: the tested nonnumeric string is accepted, sanitized to `"6"` in this fixture, and submitted.

Keep the existing range explanation after that split. Do not label an untested range boolean as runtime-observed.

## DV-09: source proposition independently re-derived

### Authenticated retained bodies

All three bodies below were decoded locally with **`/usr/bin/zcat`** and independently hashed with `sha256sum`. Access/review date: **2026-10-21**. This was access to the retained body, not a new upstream HTTP fetch.

| Source | Exact URL and retained decoded-body SHA-256 | Relevant anchors |
|---|---|---|
| S077 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `ToString:49-69`; `FillData:208-243`; number/range dispatch `:271-278`; `ValidateNumberData:321-335` |
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `HTMLFormMcpTool::ExecuteTool:174-222`; `FillFormControls:233-259`; later constraint-failure branch `:729-751` |
| S082 | https://html.spec.whatwg.org/multipage/input.html — `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` | §4.10.5.1.12 number sanitization `:3228-3229`; §4.10.5.1.13 range sanitization `:3391-3392` |

The manifest's exact token **`SanitizeValue(number_string).empty()` occurs at S077 line 331**, within its declared `[321,335]` interval. Its declared decoded-body hash matches the `zcat` result and the S077 registry anchor at `corpus/SOURCES.md:91` (mined, opened 2026-10-21). The token's leading negation and its preceding nonempty-string guard matter; token presence alone is not the proposition.

Re-derived execution path:

1. The fixture has one enabled, writable `<input type=number name=n>` with no initial value (`fixtures/number-type.html:5-6`). Number dispatch reaches `ValidateNumberData`.
2. `ToString` accepts supported scalar representations, including boolean stringification. This is **not strict JSON Schema type rejection**: the numeric-string control case in the same family also succeeds.
3. `"not-a-number"` and the converted boolean spelling are nonempty but do not survive number sanitization as a nonempty number value. The validator returns false.
4. `FillData:222-231` constructs the quoted invalid-value error. Its separate apply loop begins only at `:233-241`; failure therefore leaves the existing control state unchanged rather than clearing it.
5. S078 `ExecuteTool:192-199` returns the fill error before the successful-running/autosubmit path. `PrepareForSubmission` is reached only later, at `:218-220`. This is the canonical caller basis for **fill-time/no-submit**, rather than merely interpreting a zero counter or a prompt snapshot.

The declared S077 interval proves the validator predicate, but the error spelling, no-mutation behavior and submit timing require the additional same-body/caller anchors above. Those anchors were inspected, not assumed.

## DV-09: runtime proposition independently re-derived

The committed receipt identifies **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0** (`receipt.json:4-19`), generated at `2026-10-21T07:42:02.722Z`. The observations, not merely the `pass` booleans, support:

| Role | Case/input | Retained raw observation | Exact receipt anchors |
|---|---|---|---|
| Probe | `decl-number-type-03`, `{n:"not-a-number"}` | Matching invocation ID `C2F6CE8C4E43FDD13C2DB71FCBC45B7E`; `toolResponded.status=Error`; error `Invalid value "not-a-number" for parameter n`; command error null; zero submits; `n=""`; pass true | `:2483-2536` |
| Probe | `decl-number-type-04`, `{n:true}` | Matching invocation ID `5BE748059A234157A194647F6FB92084`; `toolResponded.status=Error`; error `Invalid value "true" for parameter n`; command error null; zero submits; `n=""`; pass true | `:2538-2591` |
| Success control | `decl-number-type-01`, `{n:42}` | Matching invocation ID `C8CD899C7CC60AD464DD99C12D27B844`; Completed; returned/post-invoke `n="42"`; one submit; pass true | `:2363-2421` |

Both probes have a real `toolInvoked` and invocation ID; they are not CDP top-level-input refusals. The original family probe's method/params records independently retain the same failures and empty submit-call arrays (`probes/number-type.json:465-673`). Its two explicitly numbered repetitions per case agree; repeated experimental records are not duplicate credited cases.

Observed SHA-256 values match the committed receipt's maps/producer field:

- Number case file: `8dc00aa78934c2af2fc9e75d79b51977cf4fae5901c2bdc366ccdef70ea09557` (`receipt.json:29`).
- Number fixture: `cd10314d21f9ca33ff3004f987bdf1737df215ce18fa0bf2e8776db530a72af0` (`:46`).
- Harness: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` (`:20`).

### Prose comparison and precision

- `decisions.json:213-236` and `SKILL.md:2068` agree on the condition, both probe IDs, the in-family control and the source interval. Their measured rejection is sound.
- The general fill-time descriptions at `SKILL.md:2051-2056` and knowledge-note `:35-42,71-72` correctly describe rejection before the apply phase.
- **“Control left empty” describes this initially empty fixture, not a reset operation.** A precision-only replacement for the DV-09 answer is: `Fill-time Error Invalid value "<v>" for parameter n ("true" in the boolean probe); no submit; control unchanged (empty in this fixture).` This is not an independent falsification of the row.
- The two incorrect cross-type restatements are the P2 findings above.

## Counter strength and case identity

Observed static inventory: **66 case definitions, 66 distinct definition IDs; 66 receipt entries, no duplicate receipt IDs; five number-type definitions.** DV-09 exclusively owns probe IDs `decl-number-type-03` and `-04`. R has 27 decision records and no repeated probe IDs. The success control `decl-number-type-01` is also DV-10's control, which is permitted: the contract requires unique **probe** ownership, not exclusive success controls.

Relevant checks inspected in `.ufo/waves/round-19/measure-c1.mjs`:

- Duplicate definitions `:396-398`; duplicate receipt IDs `:469-481`; duplicate probe ownership `:564-576,821-823`.
- Same-family definitions/control, expected outcome, input and expectation equality, pass booleans, committed/fresh normalized outcome equality and Completed control `:635-714`.
- Retained decoded hash and token-in-declared-lines `:579-610`.
- Canonical reproduction path uses the pinned Node and the revision's own harness in a clone `:748-801`; producer/runtime/file-map bindings are checked at `:834-876`. This is a static inspection of the run logic, not a claim that I exercised it.
- The fresh harness compares full case-specific error substrings, exact expected field values and schema paths (`scripts/webmcp-validation-round19.mjs:1043-1062`). It waits for a response with the invocation ID before observing the form (`:1115-1133`). Therefore DV-09's broad manifest prefix is backed by stricter case expectations, not just an arbitrary Error status.

## Residual risk and verification gaps

1. **The gate is not a semantic-entailment checker.** `indexDecisionRows:543-559` checks row/reference membership, not the English condition or answer. `sourceRejection:597-601` checks a hash and substring, not whether the source entails that prose. The two prose errors above are not disproved by a count of 27; no semantic-saturation claim follows from that count.
2. **Committed raw evidence is only partly compared.** `receiptObservation:484-494` retains status/errorText/submitCount, omitting observed fields, schema, command errors and event correlation from `comparableReceiptRecord`. **[INFERENCE, no mutant run]** A committed observed-field or event-only alteration with unchanged normalized outcome/pass/expected data would not be rejected by that comparison. Fresh harness field/schema checks are materially stronger, and the actual committed DV-09 observations inspected here are consistent. Do not describe the counter as authenticating every raw observation field.
3. **False/null/empty/prefilled boundaries are source-derived, not measured by this family.** The five number inputs are `42`, `"42"`, `"not-a-number"`, `true`, and `1.25e21`. There is no number probe for `false`, property-level null, empty string, whitespace or a previously nonempty control. **[INFERENCE]** Boolean false follows the boolean-to-string path, not JavaScript numeric coercion to zero. Property null fails scalar conversion and uses the unquoted invalid-value template, not DV-09's quoted scalar template. Top-level null is a different CDP-boundary question. The original probe's `controlStates[].valueAsNumber:null` is not evidence that null was submitted.
4. A blank initial control cannot by observation alone distinguish “unchanged” from “cleared then errored.” The inspected validate-before-apply source supplies that distinction. No prefilled-control runtime claim is made here.
5. The `lsp` device was unavailable: `read xd://lsp` returned **No such tool**. Consequently status, references, definition and diagnostics requests could not be issued; literal searches were navigation only, not semantic proof. Conclusions above come from explicitly inspected implementations and retained data.
6. No browser, Node runtime, fresh reproduction, counter, build, linter or test was executed. No private browser profile or real-site browser target was accessed. No installation/update was needed. All commands were finite; no background job or persistent process was started. Resume continuity, routing and fleet saturation are outside this semantic DV-09 slice, and no findings about them are claimed.

## Isolation

- Mode: advisory/read-only semantic review plus the assigned report; no production edits.
- Sandbox clone: **none**; no runtime or mutation probe required one.
- Branch: **none**.
- Baseline reference: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Own production commit: **none** (not applicable to this report-only seat).
- Sole lane write: `.ufo/waves/round-19/w2/Decision09.md`.
- No Git writes, jj commands, integration, judgment/admission operation or production caller changes performed.
