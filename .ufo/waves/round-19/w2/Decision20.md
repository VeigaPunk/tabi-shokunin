# Decision20 — C1 / DV-20 semantic falsification

Advisory review only. Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`; attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. All production line references below refer to R, not later wave-2 appendices. The assigned manifest/table/note additions were inspected in the B→R diff. A read-only `git diff --exit-code R -- <reviewed inputs>` returned 0 before the isolated probe; the probe itself used the private R clone.

**Recommendation: DISAGREE with DV-20 as an unrestricted rule; AGREE with its two finite negative observations and success control. Three P2 findings; no P0/P1 finding.** The body/hash/token binding is genuine. It does not, by itself, entail every clause of the decision. No browser or full C1 counter was run.

Axes: source entailment; fidelity to retained runtime observations; input/sanitization/submission scope; case/control uniqueness; counter rejection strength. Findings concern depth and evidence integrity, not an alternative runtime or an admission judgment.

## Findings, by severity

### P2 / F1 — The condition generalizes beyond the strings and validation path actually supported

Locations: `corpus/evidence/round-19/validation/decisions.json:497-520`, `SKILL.md:2079`, and `corpus/knowledge/webmcp-declarative-validation-round-19.md:55-56`.

The condition says an email or URL control receives a malformed string, and the knowledge note says sanitization keeps malformed strings. The retained observations establish the result for `not-an-email` and `not-a-url`, with the sibling field valid, in the specific `email-url.html` form. They do not establish that every malformed raw string reaches submit-time validation unchanged.

The source chain explicitly distinguishes cases the current prose merges:

- S077 `form_mcp_schema.cc:302-318` first requires a successful scalar-to-string conversion. An originally empty string passes; an originally nonempty string passes only if its sanitized value is nonempty. All supplied parameters are checked before setters run (`:208-243`).
- S082 §§4.10.5.1.4 and 4.10.5.1.5 strip newlines and trim leading/trailing ASCII whitespace for URL and single-email values. Thus malformed *raw input* and malformed *post-sanitization value* are not interchangeable.
- S078 `html_form_element.cc:713-729` explicitly skips interactive validation for `novalidate` / submitter `formnovalidate`. `toolautosubmit` alone does not imply native validation is enabled.
- The cited `:729-751` range constructs a generic native-validation error. It says nothing about email/URL schema generation, and the `kToolInvocationFailed` callback itself is at `:756-758`, outside the declared range.

**[INFERENCE; not browser-executed] boundary counterexamples:** in the same unique-name control configuration, `email: "\n"` or `url: " "` sanitizes to empty and should take the fill-time rejection branch, not DV-20's filled-then-submit-error branch. A raw email containing a removable newline can sanitize to a valid address and should not be covered by an unconditional malformed-raw-string rejection rule. A `novalidate` variant follows the explicitly different submission branch. These are source-derived qualifications, not additional runtime cases or credit.

**Exact correction:** keep the existing probe IDs, control and outcome triple, but replace the condition and answer in the manifest and the matching SKILL cells with a finite proposition, for example:

- Condition: `In email-url.html (toolautosubmit; native validation enabled), email is "not-an-email" or url is "not-a-url", with the other field valid`.
- Answer: `Both tested strings remain filled unchanged; native constraint validation returns the recorded field-specific Form validation failed Error before any submit event (submitCount 0); both emitted schema properties are type string without format`.

Replace the note's email/URL sentence with: `For the tested not-an-email and not-a-url strings, fill succeeds without changing those strings, then native validation rejects before the submit event; the captured email/url schema properties contain no format keyword.` Retain S078 for the error phase, expand its failure-path anchor to `713-758`, and also cite S077 `302-318,556-568,1270-1286` for fill eligibility, schema generation and email/URL dispatch. No new manifest schema or source is needed to make those supporting citations in the table/note.

The note's general principle at `:73-75` should not turn absence/non-use of a JSON-Schema `format` keyword into absence of native format checks. Suggested replacement: `The derived schema is not a general JSON-Schema enforcement contract: native sanitization and constraint validation still apply by control type, including email/url typeMismatch; length constraints have the separately described user-edit limitation.` The narrower existing build/site/custom-element scope at note `:15-20` and SKILL `:2040-2047` is useful and should remain.

### P2 / F2 — C1 does not compare the committed raw state/schema that supports the answer

Locations: `.ufo/waves/round-19/measure-c1.mjs:484-507,667-701`. Contrast the harness's actual expectation checks at `scripts/webmcp-validation-round19.mjs:1043-1061`.

`receiptObservation` projects an observation to only `status`, `errorText` and `submitCount`. `comparableReceiptRecord` carries that projection into the committed/reference comparison. Neither the observed form fields nor observed schema nor raw `toolResponded` is checked there. Checking `record.expected` and the stored `pass: true` bit does not independently validate what the committed raw observation says.

**Exercised isolated predicate result:** using the actual R functions, I changed only the in-memory committed `decl-email-url-01` record's `observed.fields.email` to `replaced-after-validation` and added `observed.schema.properties.email.format = "email"`. `validateDecisionCases` returned `reasons: []`. In a separate copy, changing the raw `observed.toolResponded` to `Completed` with null error while leaving the normalized aliases unchanged also returned `[]`. These directly contradict the stored evidence for DV-20 without triggering that validator.

Positive controls were sensitive: changing normalized `observed.status` produced `receipt_mismatch` and `probe_outcome_mismatch`; duplicating the receipt ID produced `receipt_case_duplicate`. Thus this is a specific projection blind spot, not an inert probe.

**Exact correction:** validate the committed record's observed fields and schema against its case expectations, and compare those deterministic observed facets between the committed and reproduced records. Also require normalized status/error/invocation identity to agree with the raw `toolResponded` where a response exists. Continue excluding genuinely per-run IDs from cross-run equality; consistency within each record is a different check. Reuse the harness's existing expectation semantics rather than trusting the stored pass bit or special-casing DV-20.

The current R receipt is internally consistent; this finding is about a red-capability gap in the counter. I did not run the full counter on mutated commits, and claim no observed mutated decision count.

### P2 / F3 — A counted SKILL row's condition and answer are not bound to the manifest

Location: `.ufo/waves/round-19/measure-c1.mjs:522-560`.

`indexDecisionRows` requires one row, the probe/control tokens and the source-row token. It never compares the condition or answer cells with the manifest. The R row currently matches its manifest, but the counter does not preserve that invariant.

**Exercised isolated predicate result:** I changed only DV-20's parsed condition cell to `Any email or URL input` and answer cell to `Always Completed with one submit event`, retaining the actual case/source cells. The canonical `indexDecisionRows` still returned no reasons for DV-20. Baseline also returned no reasons.

**Exact correction:** compare the condition and answer cells with `decision.condition` / `decision.answer` after the existing Markdown escape normalization, and refuse mismatches. This binds the observable row to the finite declaration; it does not pretend token presence can automatically establish semantic entailment. Human source review remains required.

## Re-derived source proposition and binding

Retained bodies were decoded with `zcat`; `zcat <absolute body path> | sha256sum` produced the following decoded digests. No new network fetch was performed. Access/retained-body inspection date: **2026-10-21**.

| Source | Exact decoded-body SHA-256 | Located evidence and what it establishes |
|---|---|---|
| [S078, Chromium tag 154.0.8037.97 HTMLFormElement](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | Manifest token `Form validation failed: ` occurs at decoded line **733**, inside `[729,751]`; the final space is U+0020. For an active declarative invocation, failure of non-skipped interactive validation builds the per-control message and returns a tool-invocation failure (`713-758`). |
| [S077, same-tag FormMCPSchema](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT) | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `return !input->SanitizeValue(s).empty();` at `316`; empty-input branch at `311-313`; coercion at `49-68`; whole-call prevalidation at `208-243`; string schema without a format setter at `556-568`; email/URL are text branches at `1270-1286`. |
| [S082, HTML input](https://html.spec.whatwg.org/multipage/input.html) | `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` | §§4.10.5.1.4 / 4.10.5.1.5, `url-state-(type=url):value-sanitization-algorithm` and `email-state-(type=email):value-sanitization-algorithm`: “Strip newlines” and “strip leading and trailing ASCII whitespace”. This is standard-level semantics, not another Chromium runtime observation. |

The source token/digest/range check is **valid**, not a missing-token finding. S078 is mined/opened 2026-10-21 with the matching decoded hash (`corpus/SOURCES.md:92`). Its actual proposition is conditional on reaching native interactive validation and that validation failing. Its token does not entail that every malformed input reaches that point, remains unchanged, or has a particular schema. The additional retained S077 body plus the fixture/receipt establish the finite fill/schema proposition.

## Re-derived runtime proposition from raw retained observations

`corpus/evidence/round-19/validation/receipt.json:4-20` records Chromium **154.0.8037.97**, Playwright **1.64.0**, Node **24.21.0** and producer SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`. The scoped static probe confirmed that producer digest, the email case-file digest and fixture digest match R.

The fixture (`validation/fixtures/email-url.html:5-22`) has one optional email input and one optional URL input, both uniquely named; `toolautosubmit` is present, `novalidate`, `formnovalidate` and email `multiple` are absent, and the only scripted form handler is the submit recorder/respondWith handler.

| Case | Actual input difference | Raw receipt observations | Location |
|---|---|---|---|
| `decl-email-url-01` | email `not-an-email`; valid URL | Matching invoke/respond invocation IDs; `Error`; email-specific missing-`@` native message; zero submit-handler calls; both values remain filled; `pass: true` | `receipt.json:1110-1175` |
| `decl-email-url-02` — declared control | both fields valid | `Completed`; null error; output echoes both fields; one submit-handler call; `pass: true` | `receipt.json:1178-1249` |
| `decl-email-url-03` | valid email; URL `not-a-url` | Matching invoke/respond invocation IDs; `Error`; URL-specific native message; zero submit-handler calls; both values remain filled; `pass: true` | `receipt.json:1252-1317` |
| `decl-email-url-04` — extra family control | same payload as `02` | `Completed`; null error; one submit-handler call; `pass: true` | `receipt.json:1320-1391` |

All four captured schemas have exactly string/description properties for email and URL, no property `format`, and an empty required array. The raw error text contains the native message plus the builder's extra punctuation; the case predicates intentionally use the field-specific message substring. These are stronger than the manifest's generic error prefix.

The family probe file has **eight retained observations: four case labels × two runs**. Its raw `toolResponded`, normalized results and state agree on both malformed inputs; malformed control `typeMismatch` is true, values remain filled and calls are empty. Valid controls record `agentInvoked: true` and `isTrusted: true`. Those validity/event-detail assertions come from `validation/probes/email-url.json`, not from additional fields in the final receipt, which retains only count/fields for page state. No new run is claimed here.

“Submit-time” is accurate only as the *attempted-submission validation phase*: S078 `174-221` fills then enters `PrepareForSubmission`; `713-758` checks validity **before dispatching the submit event**. The observed zero calls means no fixture submit handler ran. It is not a handler/respondWith failure and not successful form submission followed by an error.

## IDs, controls and counter strengths that survived this attack

- **66 case definitions, 66 distinct IDs; 66 receipt entries, no duplicate IDs.** Both DV-20 probe IDs have exactly one manifest probe owner: DV-20. The control is in the same `email-url` family and actually completed.
- `02` and `04` are different IDs for identical input payloads; they are not two independent input-shape controls. DV-20 credits only one decision and declares `02`, so this duplication does not invalidate this row or create a duplicate-probe finding.
- The harness compares exact observed status and submit count, field-specific error substrings, each expected field value and each expected schema property. Its stable deep equality (`scripts/webmcp-validation-round19.mjs:221-230,1043-1061`) means adding a format property would fail the actual browser-run expectation; F2 concerns the counter's later handling of the committed observation, not that harness predicate.
- The counter does enforce duplicate IDs, probe ownership, family/control completion, input/expectation binding, producer/case/fixture digests, runtime identity and source-body hash/token placement. Fresh reproduction is wired to a private revision checkout (`measure-c1.mjs:748-879`); it was inspected, **not invoked** by this seat.
- Note `:35-42` and SKILL `:2051-2056` correctly distinguish fill-time from attempted-submit validation for the finite fixture cases. Note `:55-56` and SKILL `:2079` share F1's overbroad email/URL wording; note `:71-75` needs the format clarification above. The old SKILL source-only qualification at `1994-1997` remains valid historical context; the R supersession should be understood as finite-row runtime evidence, not universal declarative validation.

## Exercised verification and retained evidence

Evidence artifact: `.ufo/waves/round-19/w2/Decision20.static.json`.

The only executable probe was a finite Node **v24.21.0** static-predicate program in `/fast/scratch/tabi-r19/fx-TabiR19.Decision20`, using the REQUIRED absolute Node binary and its bin directory first in PATH. Exit code **0**. It loaded the R counter's unmodified helper/predicate declarations into a VM, used real email case definitions, and mutated only in-memory copies of retained data. The unchanged committed receipt was the **reference index for this static test**, not a fabricated “fresh” browser receipt.

Canonical counter SHA-256: `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858`. Extracted `indexReceiptCases` through `validateDecisionCases` declaration-block SHA-256: `b39714314ecc26bde42594ffd5ea7fce1a57d8a35a5b001bd75659f025fd6442`.

| Predicate input | Observed reasons |
|---|---|
| Baseline DV-20 records | `[]` |
| Changed committed fields and schema | `[]` |
| Changed committed raw toolResponded only | `[]` |
| Wrong normalized status — positive rejection control | `["receipt_mismatch","probe_outcome_mismatch"]` |
| Duplicate receipt ID — positive rejection control | `["receipt_case_duplicate"]` |
| Baseline SKILL row | `[]` |
| Contradictory condition/answer cells | `[]` |

## Residual risk and verification gaps

- No browser, full C1 counter, build, lint or test suite was run. No mutated full-gate count, new runtime null/whitespace result, other-build behavior, locale-independent error message, or real-site result is asserted.
- Null/array/object values are outside DV-20's tested string cases. S077 `49-68,208-243,302-318` predicts fill-time rejection without partial mutation; numbers/booleans can coerce to text despite a string schema. Empty strings, omission, sanitization-repaired strings, duplicate-name controls, validation bypass attributes and event-handler repair are not covered by the two malformed-string observations. These source-level qualifications must not be relabeled runtime coverage.
- `read xd://lsp` returned **“No such tool: xd://lsp”**. No LSP status/references/definition/diagnostics service was available, so text searches were used solely to locate literal mentions. Their output is not presented as semantic proof; source control flow and the isolated actual predicates supply that evidence. There was no cold/indexing-empty result to mistake for absence.
- No reroute, resume, runtime-admission or saturation behavior is changed or claimed by DV-20. `resume_continuity_v1` and canonical UFO judgment are outside this assignment; no alternative runtime was invoked and this recommendation is not an admission.
- Tools installed/updated: **none**. No host/profile/service/package mutation or network source fetch occurred. All child commands exited; no browser or background service was started. The L1 owns any full-counter/final verification and integration.

## Isolation

- Seat: `TabiR19.Decision20`; report-only, no delegation.
- Clone: `/fast/scratch/tabi-r19/fx-TabiR19.Decision20`.
- Branch: detached checkpoint; no production branch or new commit.
- Sandbox base and commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, as required by the falsification-specific override); comparison baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Changed production paths: **none**. Predicate mutations were in memory only; no clone source/fixture/receipt was edited.
- Direct LANE writes: `.ufo/waves/round-19/w2/Decision20.md` and `.ufo/waves/round-19/w2/Decision20.static.json` only. No LANE Git write, integration or commit was performed.
