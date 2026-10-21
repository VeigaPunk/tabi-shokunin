# Decision02 — C1 DV-02 semantic falsification

## Findings, by severity

### P2 — The counter discards the observations that distinguish DV-02 from ordinary rejection

**Location:** `.ufo/waves/round-19/measure-c1.mjs:484-507,667-711`; DV-02's distinctive assertion is at `corpus/evidence/round-19/validation/decisions.json:36-45` and `SKILL.md:2061`.

`receiptObservation()` retains only `status`, `errorText`, and `submitCount`. `comparableReceiptRecord()` uses that reduced observation, and `validateDecisionCases()` compares those reduced records while trusting their `pass` booleans. Neither the committed nor fresh record's `observed.fields` is checked there against its case expectations. The raw `toolResponded` payload is also omitted from comparison/consistency checks.

For this decision, the lost field is precisely the evidence that `query` was **not applied**. A read-only JSON projection of the actual DV-02 receipt, using exactly the fields selected by `comparableReceiptRecord()`, returned:

```json
{
  "id": "decl-unknown-param-02",
  "actualFieldsEqualExpectation": true,
  "changedFieldLeavesCounterProjectionEqual": true,
  "missingFieldsLeaveCounterProjectionEqual": true,
  "contradictoryRawStatusLeavesCounterProjectionEqual": true
}
```

The latter three comparisons respectively substituted `observed.fields.query = "changed-valid"`, removed `observed.fields`, and substituted `observed.toolResponded.status = "Completed"` **in query-local data only**. No file was changed and no counter was executed. [INFERENCE] Those alterations, by themselves, would leave the inspected counter predicates unchanged. This is a durable-receipt integrity gap, not an observation that the current receipt is wrong, and not an observed counter-run result.

Important limit: the fresh producer **does** check fields (`scripts/webmcp-validation-round19.mjs:1043-1062`), and the current receipt fields agree with the expectations. Thus this finding does not establish a browser atomicity defect or claim that a fresh partial-application regression would pass the unchanged producer.

**Exact correction:** retain and compare stable `observed.fields` in the counter, and independently validate both receipts' expected field/schema paths using the producer's existing comparison semantics rather than treating `pass: true` as sufficient. Check the derived status/error against each record's raw `toolResponded` when present; correlate invocation IDs within each receipt, not across runs. Add a targeted counter self-test where only DV-02's committed observed query value changes, with `pass` left true, and require DV-02 rejection; cover missing fields and contradictory raw status as well. Do not compare volatile invocation/frame IDs between runs.

### P3 — “Valid key” does not state the precondition for the promised unknown-parameter error

**Location:** `decisions.json:36-37`, `SKILL.md:2061`; related wording in `corpus/knowledge/webmcp-declarative-validation-round-19.md:35-42,71-72`.

The measured input supplies a valid **name and value**: `query: "changed-valid"`. The condition specifies only a valid key. Name recognition alone is insufficient to guarantee the particular unknown-parameter error. The retained implementation checks name lookup and then value validation for each entry, returning the first encountered error (`form_mcp_schema.cc:211-231`). A recognized text parameter containing null/array/object fails its own validator; if encountered before the unknown entry, the error is the invalid-value template instead. No supplied value is applied in either case. This is a source-level error-priority limitation, not a claimed mixed-null runtime reproduction.

Likewise, “all keys are validated” should mean every supplied entry must **successfully pass fill validation before application**, not that validation exhaustively visits all entries after a failure. The source returns early. “Mixed valid+invalid” in the note must mean **fill-invalid**, not HTML constraint-invalid: native pattern/min/max failures happen after filling and retain values, as the same note correctly explains immediately afterwards.

**Exact correction for both the manifest condition/answer and the SKILL row:**

- Condition: `A JSON object contains an unknown parameter; every supplied recognized parameter's value passes FillData validation`.
- Answer: `Fill-time unknown-parameter Error; no supplied value is applied and no tool submit is dispatched. FillData validates entries before applying any value.`

**Exact clarification for the knowledge note's first error-class paragraph:**

`Every supplied entry must pass FillData validation before any value is applied. A fill-invalid entry returns the first encountered fill error without applying supplied values; HTML constraint failures are a later, non-rollback stage.`

If preserving the broader condition instead, the answer must allow either fill-error template when other entries are fill-invalid. No case-ID or source-token replacement is necessary for the existing measured string case.

## Recommendation and named axes

**AGREE with DV-02's measured validate-before-apply proposition. DISAGREE with treating the current wording as an unconditional unknown-error-priority rule or the current counter as fully checking its distinguishing field-state evidence.** This is advisory, not an admission or score judgment.

Review axes: **depth** (source/runtime entailment and validation-stage separation), **calibration** (exact scope and error priority), and **operability of the evidence predicate** (what the counter actually discriminates). These are review dimensions, not changes to the canonical round's claims or axes.

Reviewed baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
The initial read-only lane-tip command returned R. The actual B→R diff adds the reviewed decision/evidence files and the round-19 SKILL section; no earlier SKILL text is replaced.

## Source proposition, independently re-derived from retained bytes

Primary source: [Chromium 154.0.8037.97 `form_mcp_schema.cc`, FillData lines 208–241](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT).
Retained body: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.
Access/review date: **2026-10-21**. `corpus/SOURCES.md:91` identifies S077, the tag, source commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, opened date, and digest.

Executed:

```sh
zcat /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz
zcat /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | sha256sum
```

Observed decoded SHA-256:
`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` — exact match to DV-02 `bodySha256` at `decisions.json:50`.

Exact bound token: **“form control states remain unchanged”**, present on decoded line **210**, inside the declared inclusive range **208–241** (`decisions.json:51-55`). This is a five-word source quotation. Decoded output was inspected directly, not inferred from the token check.

The implementation, not merely its comment, entails the atomicity:

1. `FillData:211-231` visits input entries and checks name membership, then `ValidateParameterData`.
2. Unknown-name and rejected-value branches return a `ScriptToolError` immediately (`:215-231`).
3. The separate application loop starts only at `:234`, and `FillParameterData` is called at `:240`. An earlier returned error cannot reach it.
4. Therefore the measured valid-string + unknown-name call cannot partially fill `query`. An error ends validation rather than rolling back an already applied value.

The no-submit part additionally needs the caller, not S077 alone. Retained [S078 `html_form_element.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), accessed/reviewed **2026-10-21**, decoded SHA-256 independently observed as `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`:

- `FillFormControls:235-258` parses the object and returns `mcp_schema.FillData(*json_obj)`.
- `ExecuteTool:195-197` returns the callback error before marking the tool running or reaching submission.
- Autosubmit's `PrepareForSubmission` call is later at `:220`.
- Native interactive validation is in the later submission path at `:729-751`; that is not the rejecting path for DV-02.

Decoded S077 and S078 outputs were retained by the tool as `artifact://33555` and `artifact://33866`; the committed `.gz` bodies, not those session-local artifacts, are the durable evidence.

## Runtime proposition from the receipt, not its pass label

Fixture: `validation/fixtures/unknown-param.html:5-18` has two ordinary text inputs seeded to `initial-query` / `initial-other`, a `toolautosubmit` form, and a submit listener that appends to `window.__obs.calls` before `respondWith`. No input/change handler or delayed task is defined in this fixture.

| Evidence | Input / raw result / field state |
|---|---|
| Probe definition `cases/unknown-param.json:39-68` | `{"query":"changed-valid","unknown":"sentinel-mixed"}`; expects exact unknown-name message, zero submits, both seed values |
| Committed raw response `receipt.json:4668-4683` | Command error null; invocation ID `E626BF9076034E0DA35DC05276FEE199`; matching raw `toolInvoked` and `toolResponded`; `status: Error`; error text `Input contains a parameter "unknown" but there is no such parameter for the tool` |
| Committed page observation `receipt.json:4698-4708` | `submitCount: 0`; `query: initial-query`; `other: initial-other`; `pass: true` |
| Success control definition `cases/unknown-param.json:102-123` | Same recognized `query: changed-valid`, unknown entry removed, same fixture |
| Success control receipt `receipt.json:4791-4837` | `Completed`, null error, one submit, raw response output and DOM fields both contain `query: changed-valid`, `other: initial-other`; `pass: true` |
| Initial probe repetitions `probes/unknown-param.json:414-581,585-752` | Two `unknown-plus-valid` trials: matching raw Error replies, `calls: []`, both controls retain seeds. These are two fresh pages in one pinned browser context, not two independent harness contexts. |

Thus the control rules out a dead tool, an unfillable query, or an always-empty submit recorder for this fixture. It also shows that the sentinel query value is actually discriminating; it differs from the initial value. The control was added during L1 integration (`cases/unknown-param.json:123`), not present in the original two-repetition probe.

Receipt metadata reports Chromium **154.0.8037.97**, Playwright **1.64.0**, Node **24.21.0**, generated at `2026-10-21T07:42:02.722Z`. Independently executed `sha256sum` values matched its bindings:

- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- `unknown-param.json`: `89307220829295394255526288107c41eece58c5ddf1ab48d3ad03517e767e19`.
- `unknown-param.html`: `cfd92ca512b59fe1d0e686d7071cc0013c940c969e8666c2342fc31231d609fe`.

This seat read those retained runtime observations; it did not independently reproduce them.

## Null, type, coercion, and submission challenges

- **Unknown entry's value:** source name lookup occurs before its value validation, so changing only the unknown entry's value to null/array/object does not make its name valid. This conclusion is source-derived, not a new measured case.
- **Recognized entry's value:** S077 `ToString:49-69` accepts strings, integers/doubles, and booleans, but not null/array/object. `ValidateTextData:302-318` uses that conversion and sanitization. Therefore schema `type: string` is not a strict general JSON-type gate; conversely a recognized text name does not make null valid. Competing invalid entries affect error selection, not the pre-application invariant.
- **Top-level null/non-object:** outside DV-02's object-shaped input. The adjacent DV-08 and knowledge note explicitly separate CDP rejection from Blink fill validation; do not combine that protocol-layer result with this row's raw Error signature.
- **Empty/omitted/constraint-invalid fields:** missing required fields and native pattern/min/max failures are not all tested by the first FillData loop. With no fill-time failure, values may be applied before native validation rejects. That does not contradict DV-02 because its unknown key prevents application/submission entirely.
- **Timing:** producer `:1116-1123` waits for the matching `toolResponded` and then snapshots the page. The fixture has no delayed state mutation. Source caller ordering above establishes no tool submit after the fill error; this is stronger than extrapolating an indefinite no-submit guarantee from an immediate snapshot. No claim is made about an independently scheduled page script or every kind of page/process state being unchanged.
- **Input ordering:** the retained wire input places query before unknown. Source atomicity does not require proving JSONObject iteration preserves that wire order: either order rejects before the application loop. This seat makes no runtime order/competing-error priority claim beyond the observed two-string case.

## Prose and uniqueness cross-check

- `decisions.json:36-55` and the SKILL row `:2061` agree on condition, answer, IDs, S077, and range. No current row/manifest mismatch was found.
- SKILL `:2040-2047` correctly pins the build/fixture scope and excludes real sites, other builds, agent-side clients, and custom elements. `:2051-2056` correctly separates fill-time no-change from submit-time retained values.
- Knowledge `:15-20` further excludes forms without autosubmit and file inputs. `:35-42` describes the same two-stage mechanism; `:71-72` repeats the fill-vs-submit consequence. The needed qualification is fill-invalid versus native-constraint-invalid, not a reversal of the measured result.
- Querying the manifest yielded **27 decisions, 46 probe references, zero duplicated probe IDs**. `decl-unknown-param-02` belongs only to DV-02. Its control is intentionally shared by DV-01/02/03; controls are not required to be unique.
- Querying the committed receipt yielded **66 case records, zero duplicate case IDs**, exactly one probe record and exactly one control record for DV-02. The unknown-param case file has four distinct IDs. An exact literal search over all case definitions located the target/control definitions only in `unknown-param.json:39,102`.
- Counter checks cover duplicated manifest probe IDs (`:564-576`), duplicated case definitions (`:396-398`), duplicated receipt IDs (`:469-481,621-632`), in-family control and its Completed status (`:659-664,706-711`), case/fixture digest maps, source-body digest/token/range, and producer/runtime identity (`:579-618,852-876`).
- The canonical fresh-run path uses the one pinned Node binary and checked-out R sandbox (`:748-801`); it verifies the declared runtime identity for both receipts (`:455-460,855-865`). Source-token presence is a location/integrity test, **not a semantic entailment engine**. SKILL indexing checks IDs/source-row tokens (`:553-559`), not natural-language agreement. The current prose agreement was reviewed manually here.

Counts above were obtained through read-only JSON filters (`length`, `group_by`, and selection by exact ID), not by running C1. No saturation, resume-continuity, or same-identity model-rerouting conclusion is claimed; those are not exercised by this scoped decision.

## Residual risk and verification gaps

- No browser, complete C1 counter, build, lint, or test suite was run. Current atomicity is supported by retained observations plus the retained source control flow, not this seat's fresh runtime reproduction.
- No counter mutation test was run. The P2 counter consequence is a static inference supported by the observed projection invariance; it is not a reported count or exit status.
- Reversed order, null-valued mixtures, coercible boolean/number mixtures, eventful real pages, and subsequent successful calls on the **same** previously rejected page are not DV-02 receipt cases. The existing source supports the stated control-value invariant, but those are not additional runtime credits.
- LSP documentation/status requests both returned `No such tool: xd://lsp`; the device is not mounted, so references/definition/diagnostics were unavailable. Literal grep was used only for locations/occurrences, never presented as semantic reference proof. Definitions/call ordering were inspected directly in retained source and the producer/counter.
- A ranged read of `html_form_element.cc.gz` incorrectly returned an empty archive-directory result; zcat recovered the complete body and its hash. This tool inconsistency was recorded through `xd://report_issue`.
- No tools were installed or updated; no private browser profile, real site, host service, or domain source tree was touched.

## Isolation

- Mode: advisory, report-only; no production edits, browser launch, runtime reproduction, or filesystem mutation probe.
- Clone: not created; no runtime/mutation probe required one.
- Branch: none.
- Base B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Reviewed commit R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Seat commit: none; no git writes performed.
- Changed path: `.ufo/waves/round-19/w2/Decision02.md` only.
