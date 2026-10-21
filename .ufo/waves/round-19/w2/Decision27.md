# Decision27 — DV-27 semantic falsification

Date: 2026-10-21. Advisory recommendation only; not a round admission.

- **Attacked checkpoint:** `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).
- **Comparison baseline:** `66251bfc1aef393e4aec599e950a8deb867736bb` (B).
- **Axes:** depth (source entailment and precise control/phase predicates); calibration (distinguishing retained observations, source deductions, and counter guarantees). No scalar or saturation judgment.
- **Verdict:** **disagree as written; agree with the narrowly measured optional text/textarea behavior.** One P2 scope finding. The source hash/token, designated probe/control identities, and their retained observations are consistent. No browser, harness, full C1 counter, self-test, build, or suite was run.

All repository paths and line numbers below refer to R, read in the static sandbox `/fast/scratch/tabi-r19/fx-Decision27`, unless explicitly identified as the report itself. Paths in evidence citations are lane-relative, not instructions to write those files.

## Findings by severity

### P2 — DV-27 promotes a typed, successfully filled text fixture into an unconditional empty-value rule

**Locations:** `corpus/evidence/round-19/validation/decisions.json:678-699`; `SKILL.md:2086,2091-2092`. Related prose: `corpus/knowledge/webmcp-declarative-validation-round-19.md:62-65`.

The manifest condition is `A key is sent as the empty string`, the answer is `The control is cleared (empty strings pass text validation)`, and its outcome is unconditionally `Completed`, null error-substring constraint, one submit. The SKILL row repeats the untyped condition; the concluding agent rule says to treat `""` as `clear` without a control-type qualification. Neither the build-only scope header nor the phrase about text validation supplies the missing condition that the target actually is an ordinary text/textarea control, all supplied parameters pass fill validation, and the form may successfully submit. Also, the fixture sends **parameter values** `""`, not an empty parameter name.

**Concrete counterevidence, without a new browser run:**

1. **Wrong control type:** in the same retained S077 body, `ValidateParameterData:271-278` routes number and range controls to `ValidateNumberData`, whose `:329-331` explicitly requires a nonempty converted string. [INFERENCE from the actual branches] Sending `{"n":""}` to an otherwise-supported number control rejects during fill rather than clearing it; `FillData:210-231` returns before the setter loop at `:234-241`, so no control changes. This refutes the general footer rule even on the pinned build. This overlaps Decision09's number-specific corroboration, not a separate finding.
2. **Wrong phase/outcome:** the existing canonical receipt `receipt.json:1458-1521` records `decl-missing-required-02`, input `{"required":""}`, status `Error`, error text `Form validation failed: required: Please fill out this field.. `, zero submits, field `required:""`. Thus accepting/setting the empty text value does **not** entail DV-27's `Completed / 1` outcome. That outcome is true only for the optional, otherwise-valid fixture.
3. **Even text is conditional on the whole fill:** S077 `FillData:210-241` validates every supplied entry before applying any. [INFERENCE] A valid empty text value accompanying an unknown key or invalid sibling value is not applied at all. The existing note already describes this all-or-nothing invariant at `:35-42`; the clearing shorthand must not override it.

**Exact correction recommended (L1-owned; not applied):**

- Replace DV-27's `condition`, and the SKILL condition cell, with: **`The otherwise-valid textarea-empty toolautosubmit fixture receives JSON "" for its optional pre-filled textarea and input[type=text] parameter values`**.
- Replace its answer/outcome prose with: **`Both live values become ""; fill validation accepts the strings, and this fixture completes with one submit. This does not assert successful submission for required fields or clearing behavior for other control types.`** The existing structured outcome and probe/control IDs remain correct for that narrowed condition.
- Keep the genuine S077 token binding, but expand the human-readable citation to **`form_mcp_schema.cc:302-318`** for the validator preconditions and **`:933-947`** for the setters. The current three-line anchor proves fill acceptance, not mutation or completion by itself. Use the receipt for completion, and S078's execution/submit branch for the phase distinction.
- Replace SKILL's unqualified `"" as clear` advice with: **`For ordinary text/textarea controls, explicit JSON "" clears the live value only after the whole fill passes validation; it is not a universal clearing value, and submit-time validation can still fail (DV-06).`**
- In the knowledge note's **Text** paragraph, retain the text-specific fact but make the success precondition explicit: **`After the whole fill passes validation, explicit JSON "" clears these text/textarea live values; omission leaves the current value. This does not clear defaultValue or guarantee successful required-field submission.`** Its heading already narrows the type more accurately than the SKILL footer; this is a clarification, not a claim that the text-fixture observation is false.

No case renumbering, additional browser run, or new decision is necessary to make this prose correction.

## Source proposition re-derived from the retained body

### Authority and exact token

- Registry: `corpus/SOURCES.md:91`, S077, tier A for this Chromium implementation, `mined`, opened `2026-10-21`.
- URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT>.
- Accessed as the retained decoded body on **2026-10-21**; no network re-fetch.
- Retained file: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.
- Observed decoded SHA-256: **`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`**. It equals DV-27 `source.bodySha256` and the S077 registry anchor.
- Exact source quote, `form_mcp_schema.cc:311-313` (well under 25 words):

  ```cpp
  if (s.empty()) {
    return true;
  }
  ```

  The manifest token `if (s.empty())` is present at exactly line 311, inside the declared inclusive range `[311,313]`; it is not a comment, different function, or unrelated match.

Commands exercised against the absolute sandbox source path:

```sh
zcat /fast/scratch/tabi-r19/fx-Decision27/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz
zcat /fast/scratch/tabi-r19/fx-Decision27/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | sha256sum
zcat /fast/scratch/tabi-r19/fx-Decision27/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | nl -ba
```

### What that source actually entails

[INFERENCE from the named source branches, not a new runtime observation]

1. `ToString:49-68` accepts a JSON string as a string, or stringifies numbers/booleans; null, arrays, and objects do not succeed. In particular, `null` is not an alias for `""`; `0` and `false` stringify to nonempty values, not empty strings.
2. `ValidateTextData:302-310` first requires exactly one associated control and successful conversion. Only then does `:311-313` return true for an empty string. It is an early **fill-validator** success, not a requiredness check and not a submit completion.
3. `FillData:208-244` gates the entire setter pass on successful validation of every supplied entry. Omission is distinct: there is no setter call for an absent key.
4. `FillParameterData:458-469` routes the supported text/date-like branches to `FillTextData`; `FillTextData:933-947` calls the input or textarea value setter and requests input/change event dispatch. That is the mutation support missing from the three-line citation. It does not justify universal behavior across every control type or arbitrary event handlers.
5. Submission is a separate canonical path, not something inferred from the word `true`: S078 `html_form_element.cc:189-220` fills first, propagates fill errors immediately, and invokes `PrepareForSubmission` for autosubmit. Its `:729-758` can fail interactive validation before a submit event, while `:790-806` waits for the response promise after the submit handler. This explains the existing required-empty receipt rather than contradicting the text validator.

For S078, URL <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>, accessed via retained body on **2026-10-21**. Its independently observed decoded SHA-256 is **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**; `zcat .../sources/html_form_element.cc.gz | sha256sum` matched the knowledge note's pin. No additional source quote is needed for that branch derivation.

**Entailment conclusion:** the exact bound token entails conditional empty-string **fill acceptance** in `ValidateTextData`. The retained body plus setters supports the narrowed clearing proposition. The receipt, not that token, supports this fixture's `Completed / one submit`. The untyped universal interpretation does not follow.

## Runtime proposition re-derived from retained raw observations

These are **retained observations**, not a claim that this seat reproduced the browser.

The fixture `validation/fixtures/textarea-empty.html:5-8` has `toolautosubmit`, an optional enabled writable textarea named `memo` with initial text `pre-filled textarea`, and an optional enabled writable `input[type=text]` named `title` with initial value `pre-filled input`. Neither is required or otherwise constrained. Its only handler (`:14-22`) captures FormData, records one call, prevents default navigation, and responds with those fields.

| Evidence | Probe `decl-textarea-empty-02` | Control `decl-textarea-empty-04` |
|---|---|---|
| Case definition | `cases/textarea-empty.json:37-63` | `cases/textarea-empty.json:92-118` |
| Submitted input | `{"memo":"","title":""}` | Both explicit pre-filled strings |
| Canonical receipt | `receipt.json:4307-4373` | `receipt.json:4442-4508` |
| Observed status / error | `Completed` / null | `Completed` / null |
| Observed submits | `1` | `1` |
| Observed post-invoke fields | Both present and exactly `""` | Both exactly the pre-filled strings |
| Raw response payload | `toolResponded.output.fields` also contains both `""` | Output fields also equal the explicit input |
| ID correlation | Invoke/result, `toolInvoked`, and `toolResponded` share `8A4B1A77950C09096E926130AECD4EB6` | Same internal correlation for `9AB19841AF68C875E8F906ADD83AC102` |
| Recorded pass | `true` | `true` |

The original raw probe provides additional detail not asserted by the canonical receipt: `probes/textarea-empty.json:3607-3712` records the empty-string case's first and repeat observations with live values `""`, unchanged nonempty `defaultValue`s, one submit call, and `agentInvoked:true` / `isTrusted:true`. The control's corresponding observations are at `:3823-3928`. I also inspected the raw `.runs[]` entries, including their invoke parameters, `toolResponded`, events, and pageState; their pass labels are `first`/`repeat`, not Boolean verdicts. They must not be mistaken for the canonical receipt's Boolean `pass:true`.

This establishes **live value clearing**, not removal of the HTML defaults. A later reset/persistence proposition is not claimed or tested here. The control begins at the same values it explicitly sends, so the control alone cannot prove that a setter ran; the nonempty fixture defaults plus the empty probe's final values/output supply the meaningful contrast.

### Null, coercion, and timing challenges

- `decl-missing-required-03` (`receipt.json:1524-1581`) actually sends JSON null and gets fill-time `Error`, `Invalid value for parameter required`, zero submits. A null post-observation error field in the successful receipt is **not** evidence that a null input is accepted.
- In the DV-27 harness, absent/null field values do not accidentally satisfy expected `""`: `scripts/webmcp-validation-round19.mjs:1050-1054` checks property presence and compares the actual value against the expected string. A missing property becomes null and does not equal `""`. The field reader (`:873-887`) preserves an actual empty string; it filters only nulls.
- The input schemas actually report string types and `required:[]`; that is consistent with this fixture, not evidence of a universal strict JSON-Schema validator. S077's conversions are broader than the declared string type.
- `evaluateCase:1115-1123` waits for the matching invocation's `toolResponded` before reading the page. The fixture's output snapshots FormData during the submit handler, so the empty result is not inferred from an invocation ID or from a pre-submit read. Conversely, there is no general guarantee about later mutations in arbitrary pages. Both controls are cleared together; no independently reproduced one-key-only or mixed-validity clearing case is claimed.

## Case uniqueness and counter strength

### Checks that hold for the committed data

Exercised JSON inventory queries, not a counter run:

- Case definitions across `validation/cases/*.json`: **66 IDs, 66 unique, no duplicates**. Command: `jq -s '[.[].cases[].id] | {total:length, unique:(unique|length), duplicates:(group_by(.) | map(select(length>1) | {id:.[0],count:length}))}'` with the absolute sandbox case-file glob.
- Canonical receipt: **66 records, 66 unique IDs, no duplicate IDs** (`.cases[].id` grouped by identity).
- Manifest: **27 decisions, 27 unique decision IDs, no reused probe IDs across decisions**. The only probe owner of `decl-textarea-empty-02` is DV-27.
- `decl-textarea-empty-04` is a shared success control for DV-25, DV-26 and DV-27, not a duplicate probe. This is compatible with the canonical contract. Both DV-27 IDs are in the same family and the control really completes.

`sha256sum` on the sandbox bytes also matched all three relevant receipt bindings:

| Input | Observed SHA-256 |
|---|---|
| Producer `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `cases/textarea-empty.json` | `247713c3f93f3ace117a1da11336a7f3c184f50410b3f74fffe73c3ea4786c41` |
| `fixtures/textarea-empty.html` | `895792107eea4db0f9c8ad2cf9b5424d3add8f81277ee390ffce1fbad63b2237` |

For locating the exact retained files later, the canonical receipt itself hashes to `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`; the original textarea probe hashes to `151eec9d129f7409071c161d516ab5ca5628ff9e4d34f7462af2a08000267958`.

### What the counter does and does not prove

Static inspection of `.ufo/waves/round-19/measure-c1.mjs`, not an executed verdict:

- `loadCaseBundle:383-407`, `indexReceiptCases:469-481`, and `duplicateProbeCases:564-576` reject relevant duplicate identities; `validateDecisionCases:635-687` checks family, input, expectation, control family and `pass:true` in both receipts.
- `sourceRejection:579-609` checks source date/status, decoded hash, in-range token and a source reference; `countRevision:855-865` checks runtime identity and producer/case/fixture digests.
- The canonical rerun path is `runFreshReproduction:748-801`: a revision-pinned sandbox invokes the pinned absolute Node binary and the validation producer. This seat did **not** invoke it or introduce a second runtime. The retained canonical receipt declares Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0.
- **Semantic limitation:** `indexDecisionRows:553-559` checks only row identity and case/control/source tokens, not the condition or answer cells. `sourceRejection:599-601` proves token membership, not entailment. Therefore passing the counter cannot settle this seat's scope objection.
- **Observation-comparison limitation:** `receiptObservation:484-494` reduces observations to status/errorText/submitCount; `comparableReceiptRecord:497-507` omits observed fields, observed schema and output. [INFERENCE] Altering only the committed DV-27 observed clearing fields while retaining `pass:true` would not change that comparison. The fresh harness does test the expected fields (`compareExpectation:1050-1060`), so this is not evidence that the actual current empty-string run failed. It means the counter's cross-receipt equality is weaker than equality of the decisive clearing evidence. If stronger receipt integrity is intended, compare deterministic claimed field/schema values in both receipts against expectations and each other; do not compare nondeterministic invocation IDs.
- **Null error constraint:** `errorTextIncludes:null` means no substring assertion (`compareExpectation:1046-1048`; counter `:697-700`), not an assertion of error absence. The current raw successful observations really are null, but the null expectation alone does not enforce that fact.

These are counter verification gaps, not an assertion that another mutation was executed or a new requirement substituted for the declared outcome-triple contract.

## Residual risk and verification gaps

1. No runtime reproduction or full C1 measurement was performed; no fresh pass count is claimed. The receipt's total summary is retained data, whereas the identity counts and hashes above were independently computed from R.
2. No new null/type/number-empty browser case was added. Null and required-empty counterexamples came from the existing receipt; number/range-empty rejection is explicitly a source deduction.
3. No blanket conclusions about real sites, other builds, default reset behavior, custom controls, forms without autosubmit, or delayed handler mutations are supported by this one decision. No resume, rerouting, or saturation change is in DV-27's diff scope.
4. **LSP unavailable:** `read xd://` listed mounted devices and `read xd://lsp` returned `No such tool: xd://lsp`. Consequently status/references/definition/diagnostics and an indexing warmup were unreachable. Literal grep was used to locate paths/mentions only; the manual branch analysis above is not presented as LSP semantic proof.
5. The gzip-range reader incorrectly returned `(empty archive directory)` for the valid retained source stream. I reported this through `xd://report_issue` and used the requested `zcat`, decoded checksum, and numbered decoded output instead.
6. No tools were installed or updated. No background job, browser, Node runtime, service, profile, or TCP DevTools listener was started. All commands were finite read-only inspection commands except creation of the private static clone and this seat-owned report.

## Isolation

- **Seat:** `TabiR19.Decision27` / report stem `Decision27`.
- **Clone:** `/fast/scratch/tabi-r19/fx-Decision27`.
- **Branch:** detached at attacked checkpoint R; no production branch or production edits were needed for this read-only review.
- **Base comparison:** `66251bfc1aef393e4aec599e950a8deb867736bb`.
- **Inspected clone commit:** `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit.
- **Changed paths in clone:** none by this seat.
- **Only direct LANE write:** `.ufo/waves/round-19/w2/Decision27.md`.
- **No git writes in LANE; no sibling/fleet/production files edited.**
