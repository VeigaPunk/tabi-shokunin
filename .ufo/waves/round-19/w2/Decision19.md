# Decision19 — C1 / DV-19 semantic falsification

**Recommendation: DISAGREE with DV-19 as written; AGREE with its two recorded, narrowly scoped runtime outcomes.** The retained evidence supports accepting these two programmatic string fills without native length rejection. The manifest's exact source slice supports only `maxlength`, not its combined `minlength`/`maxlength` explanation, and successful completion needs an otherwise-valid-input qualifier. This is an advisory recommendation, not a claim-admission judgment.

**Axis:** C1 depth. Review dimensions: exact source entailment, condition/outcome precision, raw-receipt integrity, and counter discrimination. No new claim, axis, route, runtime, or saturation criterion is introduced.

Reviewed checkpoint **R = d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47**, baseline **B = 66251bfc1aef393e4aec599e950a8deb867736bb**. The observed `refs/heads/master` tip was R. Inspected the B→R additions for `SKILL.md`, the knowledge note, decisions, and text-constraints cases/fixture, plus the consuming harness/counter. PLAN's final revision (§Wave-1 findings → contract revision, lines 139–156) governs; this is not the superseded row counter.

## Findings, by severity

### P2 — F1: The bound source range omits the entire `minlength` proposition

**Locations:** `corpus/evidence/round-19/validation/decisions.json:470–494` (especially `source.lines` at 489–492); `SKILL.md:2078`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:62–64`.

The decision combines short and long inputs but binds S083 to decoded lines **323–327**. Those lines are in **§4.10.19.3, maxlength**, and describe only the native too-long condition. Its exact token, `last changed by a user edit`, occurs at decoded line **325**. The hash and token binding are genuine, but token presence does not supply the missing second proposition.

The separate **§4.10.19.4, minlength** condition is at decoded lines **369–374**, with the same exact token at **370**. It additionally requires a nonempty value. The registry row (`corpus/SOURCES.md:97`) itself distinguishes maxlength and minlength sections, and explicitly limits S083 to native constraints, not WebMCP wiring. Its shorthand `minlength 368-372` also stops before the comparison and too-short conclusion at 373–374; use the complete paragraph when correcting DV-19's references.

**Impact:** The precisely declared source anchor does not entail both halves of the decision. The full retained page can supply the missing native constraint rule; the measured short-value result is not contradicted. This is a repairable evidence-binding defect, not evidence that `AB` was rejected.

**Exact correction:** Keep S083, its body, hash, token, probe IDs, control, and outcome. Change DV-19's `source.lines` to **`[323, 374]`** (the existing manifest supports one inclusive interval). Cite **`S083 form-control-infrastructure.html:324–327,369–374`** in the corrected SKILL explanation and knowledge paragraph. Explain the WebMCP fill bridge separately with S077 `form_mcp_schema.cc:933–947`; S083 alone is not an implementation or submission guarantee. Since SKILL is append-only under PLAN, the L1 should append a specifically labeled DV-19 erratum superseding row 2078, not silently rewrite historical bytes.

### P3 — F2: The condition promises completion for more than the probes/source establish

**Locations:** `decisions.json:473–474`; `SKILL.md:2078,2088–2091`; knowledge note `:62–77`.

The condition is merely a length-bound violation, but the answer is unconditional Completed/submitted unchanged. The actual probes are **pattern-matching, nonempty JSON strings** on one fresh optional text input, with no value-changing input/change listener and a submit listener that prevents default and resolves a result. Those qualifiers matter:

- The same fixture has `pattern="[A-Z]+"` (`fixtures/text-constraints.html:5–7`). Its case `decl-text-constraints-01` already demonstrates a native submit-time pattern rejection (`cases/text-constraints.json:8–24`; `receipt.json:4003–4055`). A value can violate length and pattern simultaneously. **[INFERENCE, not a reproduced case]** `{"q":"abcdef"}` meets the row's six-character length condition but should take the pattern-error path, not the promised Completed path, under the inspected S078 validation sequence.
- S077's fill setter dispatches input/change events (`:933–947`). **[INFERENCE]** A page listener can therefore transform or reject a value; the absence of native length rejection does not guarantee every agent-filled value remains unchanged.
- The observed submission is **one prevented submit callback**, not network submission or server acceptance (`fixtures/text-constraints.html:14–25`). The source routes through interactive validation before dispatching that callback, then waits for `respondWith` resolution (S078 `:729–806`).

The knowledge principle at **74–75** further groups `format` with length attributes as not enforced for agents at all. At minimum that wording confuses omitted/generated schema keywords with native control enforcement: the same note's **55–56** and SKILL's **2079** say malformed email/url strings fail at submit. DV-19 supports a conclusion about these **native length attributes on this programmatic fill path**, not blanket absence of format or page validation.

**Exact correction:** Use the replacement condition/answer below, and qualify the derived rule as native length attributes **alone** being insufficient for this path. In the knowledge principle, separate length behavior from schema `format` omission and preserve the documented native email/url rejection. No new runtime behavior is needed to make this narrower statement honest.

## Re-derived source proposition

All external-source quotations below are at most 25 words. Access date is **2026-10-21**; these are retained-body inspections, not fresh network fetches.

### S083 — native constraint states, not WebMCP completion

- URL: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
- Retained body: `corpus/evidence/round-19/sources/form-control-infrastructure.html.gz`.
- Independently observed `zcat … | sha256sum`: **`af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92`**, exactly the manifest hash.
- Exact source token: **“last changed by a user edit”**, decoded lines **325** and **370**, §§4.10.19.3–4.10.19.4.
- The maximum rule requires an applicable maximum, dirty flag true, a last user edit, and API-value length above maximum (`:324–327`). The minimum rule has the corresponding conditions plus nonempty value (`:369–374`). `minlength` does not imply `required` (`:349–352`).

Thus the full body explains why a script-style change is outside those native length-error conditions. It does **not** identify every WebMCP operation as that kind of change, validate input types, skip other constraints, truncate/retain a submitted value, promise a submit callback, or resolve its result. Those are separate implementation/runtime propositions. A trusted submit event is not proof that the text was last user-edited.

### S077 — the WebMCP fill bridge and type boundary

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- Retained body: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.
- Independently decoded SHA-256: **`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`**.
- `ToString` (`:49–69`) accepts strings, numeric values, and booleans; it does not turn JSON null, arrays, or objects into strings. Text validation (`:302–318`) uses that conversion and sanitization, not an arbitrary JSON Schema string validator. Fill validates all supplied parameters before applying any (`:208–241`). `FillTextData` uses `SetValue` with `TextFieldEventBehavior::kDispatchInputAndChangeEvent` (`:933–947`).

Consequently null is not a four-character string for this decision, and numbers/booleans must not be assumed rejected just because the emitted schema says string. No DV-19 receipt tests these alternative JSON types. Their predicted treatment is source-derived, not newly reproduced here.

### S078 — fill precedes native validation; callback completion follows the response promise

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- Retained body: `corpus/evidence/round-19/sources/html_form_element.cc.gz`.
- Independently decoded SHA-256: **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**.
- `ExecuteTool` fills, returns on fill error, and invokes `PrepareForSubmission` for autosubmit (`:179–220`). The `if (!skip_validation && !ValidateInteractively())` branch precedes submit dispatch (`:713–779`); the response promise is taken and awaited at `:790–806`.

This supports the timing distinction. It does not turn absence of a length error into unconditional success through other constraints or arbitrary listeners.

## Re-derived runtime proposition from raw retained observations

Fixture: `corpus/evidence/round-19/validation/fixtures/text-constraints.html:5–7`, one fresh `type=text` field `q`, pattern `[A-Z]+`, minlength 3, maxlength 5, `toolautosubmit`. No `required`, `novalidate`, or `formnovalidate` attribute is present in this fixture. Its listener records FormData before preventing default and returning the same fields (`:14–25`).

| Role | Case ID | JSON input | Raw status / error | Submits | Post-invoke q / returned q | Receipt location |
|---|---|---|---|---:|---|---|
| short probe | `decl-text-constraints-02` | `{"q":"AB"}` | Completed / null | 1 | AB / AB | `receipt.json:4058–4115` |
| long probe | `decl-text-constraints-03` | `{"q":"ABCDEF"}` | Completed / null | 1 | ABCDEF / ABCDEF | `receipt.json:4118–4175` |
| success control | `decl-text-constraints-04` | `{"q":"ABCD"}` | Completed / null | 1 | ABCD / ABCD | `receipt.json:4178–4235` |
| complementary validation control, assigned to DV-18 | `decl-text-constraints-01` | `{"q":"abc"}` | Error / pattern message | 0 | abc / no output fields | `receipt.json:4003–4055` |

All four records have `pass: true`. For each of DV-19's probes/control, raw `toolInvoked.input` matches the supplied string and the returned invocation ID matches its `toolResponded` ID. The normalized post-value and the response's FormData agree, so unchanged values are supported by actual observations, not merely by a pass label.

The family probe file adds the native-state evidence omitted by the integration receipt:

- `probes/text-constraints.json:121–195`: short input, Completed, one recorded call with q=AB, `valid: true`, `tooShort: false`, `tooLong: false`; its retained confirmation agrees.
- `:199–273`: long input, Completed, q=ABCDEF untruncated, the same valid/length flags, one call; confirmation agrees.
- `:277–350`: success control, q=ABCD, valid and one call.
- `:97–116`: the pattern mismatch is invalid and has no submit calls, corroborating that this fixture is not simply bypassing all native validation.

These are **retained observations**, not browser runs performed by this seat. `isTrusted: true` and `agentInvoked: true` in the recorded submit calls do not establish a prior user edit of the field.

## Identity, uniqueness, and counter strength

### Established static bindings

- The receipt records one canonical identity: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Independently hashed harness bytes equal its `producerSha256`: **`4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`**.
- The text case-file SHA-256 is **`48f55805b93c744deaa115401c28eb75a82871a30e525f9f66c05fe6210fa727`**; fixture SHA-256 is **`a641942d45e39fca431432c530f68c0f267b64533be5538d1e353166c44cb729`**. Both equal the receipt's corresponding digest-map values.
- Observed inventory: **27 decision records; 46 probe references / 46 unique probe IDs; 66 receipt cases / 66 unique receipt IDs**. Neither DV-19 probe is owned by another decision. Control `decl-text-constraints-04` is shared only by DV-18 and DV-19, which the contract permits; it is not a reused probe or extra decision credit.
- Counter duplicate guards cover manifest IDs (`measure-c1.mjs:298–322`), case-definition IDs (`:383–407`), receipt IDs (`:469–481,621–629`), and probe ownership (`:564–576,823`). Family/control checks are at `:635–664,706–712`.
- The canonical fresh-run logic is `measure-c1.mjs:748–801`: isolated checkout verified against REV, the absolute pinned Node binary, and that revision's single validation producer. `:834–876` binds producer/file digests, checks both runtime identities, and validates fresh versus committed records. I did not invoke that path or any alternative runtime.

### Important limits — not evidence of a wrong current receipt

1. **Semantic binding remains manual.** `sourceRejection` (`measure-c1.mjs:579–610`) checks gzip/hash/token/lines/provenance, not entailment. `indexDecisionRows` (`:522–560`) checks IDs and references but never compares the SKILL condition/answer with the manifest. The existing incomplete range therefore has the exact shape this lexical gate cannot expose. A count is not proof of the whole prose proposition.
2. **The counter does not compare the raw data proving unchanged values.** `receiptObservation` and `comparableReceiptRecord` (`:484–507`) retain only observed status/errorText/submitCount, not observed fields/schema/response output. The comparison at `:680–687` trusts `pass: true` for the rest. **[INFERENCE from the inspected functions; no mutant executed]** Corrupting only a committed probe's `observed.fields.q` or returned output while retaining its pass label and normalized triple would not trigger that fresh/committed comparison. The fresh harness *does* check expected post-values (`scripts/webmcp-validation-round19.mjs:1043–1062`), so the present claim has useful runtime protection, but raw committed evidence is not fully authenticated by that comparison. If unchanged-field evidence is to be certified, compare deterministic fields and normalized response contents and independently re-evaluate the field expectations for both records; do not compare nondeterministic invocation IDs across runs.
3. **Null is a sentinel, not a strict no-error assertion.** `errorTextIncludes: null` disables the harness substring predicate (`:1045–1048`) and the counter's outcome substring predicate (`measure-c1.mjs:697–700`). It must not be read as a tested null-input coercion rule or as an independent assertion that errorText equals null. Actual DV-19 raw errorText values *are* null.
4. **The integration receipt does not preserve native validity or full calls.** `pageObservation` returns only call count and fields (`harness:856–892`), and evaluation stores those after the invocation-correlated response (`:1115–1133`). Native `tooShort`/`tooLong` flags and per-submit call fields are supported by the separate family probe, not reasserted by the C1 outcome triple. The fixed listener records synchronously before resolving its promise, so no observed early-read defect is apparent for this fixture.

## Exact replacement wording for the L1

**Condition:** In the fixed fresh `type=text` q autosubmit fixture (`pattern="[A-Z]+"`, minlength 3, maxlength 5), the JSON string is `AB` or `ABCDEF`: it matches pattern and exceeds only a native length bound.

**Answer:** Both tested strings remained verbatim and Completed through one prevented submit callback. The family probes report neither native tooShort nor tooLong. Native length attributes alone did not reject these programmatic fills; other validation, sanitization, and page listeners still apply.

**Manifest:** Keep probes `decl-text-constraints-02/-03`, control `decl-text-constraints-04`, and `{status:"Completed", errorTextIncludes:null, submitCount:1}`. Set source lines to `[323,374]`, retaining the existing exact token/hash/body/S083 row. In the prose, distinguish the S083 native-state rule from the S077 fill bridge and the S078 submit path.

**Knowledge corrections:** At lines 62–64 cite the two full native-state paragraphs and say these tested programmatic fills did not trigger the native length errors. At 73–75 say schema emission and native enforcement are separate: length checks did not reject these fills; malformed email/url values still failed native validation at submit. At 76–77 and SKILL's derived rule use **native length attributes alone**, rather than implying every page-level length validator is ineffective.

## Residual risk and verification gaps

- No high-severity functional discrepancy was found in these two retained successful outcomes. F1 is a concrete source-anchor defect; F2 is scope/calibration debt. This review is not saturation evidence for the other 26 decisions or all browser validation behavior.
- No user-edited short/long positive rejection control is present in this family. The user-edit explanation is source-backed, not a newly measured contrast. Only ASCII values of length 2, 4, and 6 were observed; exact endpoints, Unicode/API-value length interactions, newline sanitization, a prior user edit, intervening listeners, and non-string values are not DV-19 runtime coverage. Empty value/omission/required behavior is not interchangeable with a nonempty minlength violation.
- No browser, C1 counter, build, linter, test suite, counter mutant, or runtime reproduction was run. Verification exercised here was static B→R diff/source/receipt inspection, JSON inventory counts, decoded-body checksums, and harness/case/fixture checksum comparisons. Fresh measurement remains the L1's responsibility after corrections.
- LSP was attempted first: `read xd://lsp` returned **No such tool**, and the mounted-device list contains no lsp device. Status/references/definition/diagnostics were therefore unavailable. Literal searches and targeted source reads were used as the fallback, not presented as semantic-server proof.
- `read` on the gzip source returned an empty archive listing although `zcat` decoded the body correctly; this was reported through `xd://report_issue`, and direct `zcat` output supplied the inspected source. No tools were installed or updated; no service, profile, host configuration, production file, or routing was changed. No process remains owned by this seat.
- No resume path is affected by this scoped diff review; `resume_continuity_v1` is not applicable to DV-19. No rerouting or alternate runtime was performed.

## Isolation

- Seat: `TabiR19.Decision19`.
- Clone: none — static report-only review; no runtime/mutation probe and no production edits.
- Branch: none created.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Reviewed checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Commit: none authored; no Git/JJ write operation was performed in LANE or elsewhere.
- This seat's only LANE write: `.ufo/waves/round-19/w2/Decision19.md`.
