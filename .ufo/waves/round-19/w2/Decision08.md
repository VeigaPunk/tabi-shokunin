# Decision08 — C1 DV-08 semantic falsification

## Recommendation

**Disagree with DV-08 as a fully checked decision in its current wording; agree with the narrower object-input contract and the three retained rejection observations.** The retained source/token/digest binding is correct, and the three probe IDs plus success control are distinct. The actionable defects are a rejection-class predicate that does not check rejection, an event-absence assertion partly manufactured by the recorder, and unresolved per-case provenance. This is advisory review of checkpoint R, not admission or a new runtime result.

Axes: **semantic depth** (source entailment versus observation), **calibration** (scope and counter sensitivity), **provenance integrity** (body/digest/line and case identity binding). No axis is improved by inventing stronger runtime evidence.

## Findings, by severity

### P2 — The DV-08 oracle can count a non-rejection or the wrong command failure

Evidence:

- `corpus/evidence/round-19/validation/decisions.json:188-199` promises `Invalid parameters`, no invocation ID and no invocation event, but its machine outcome contains only `status: no-response`, `errorTextIncludes: null`, and `submitCount: 0`.
- `corpus/evidence/round-19/validation/cases/non-scalar.json:108-125,139-156,170-187` adds seed-field/schema expectations, but no command-error or invocation-ID predicate.
- `scripts/webmcp-validation-round19.mjs:1043-1062` compares status, optional **tool-response** error text, submit count, fields and schema. It never checks `observed.commandError` or `observed.invocationId`. A null errorTextIncludes means no error-text check, not an assertion of protocol rejection.
- `scripts/webmcp-validation-round19.mjs:1116-1128` maps a missing response to `no-response`, including an invocation that returned an ID and then produced no response within eight seconds.
- `.ufo/waves/round-19/measure-c1.mjs:484-507,673-701` projects observations down to status/errorText/submitCount. The fresh-versus-committed comparison omits commandError, invocation ID, tool events, fields and schema. The control check at `:706-712` requires Completed but cannot repair this missing negative predicate.

**Static counterexample [INFERENCE; not executed]:** keep the same three inputs and unchanged form values, but have the command return an invocation ID followed by no response, or reject with a different command error. The harness's compared expectations still match. The fresh record's compared projection also matches the committed record despite contradicting the decision's promised rejection class/no-ID result. No coordinated edit to the committed receipt is necessary for this mismatch.

**Exact correction:** make DV-08 explicitly require a command-error message containing `(WebMCP.invokeTool): Invalid parameters`, `invocationId === null`, and independently measured zero invocation/response event counts, alongside the existing zero-submit and seed-field checks. Carry those predicates through case expectation validation, harness comparison, decision validation and stable fresh/committed comparison. Compare ID **absence**, not random ID bytes. Do not put `Invalid parameters` into `errorTextIncludes`: it is in `commandError.message`, not `toolResponded.errorText`. `no-response` alone must not earn the boundary-refusal result.

### P2 — “No toolInvoked / page untouched / before Blink” exceeds the final receipt's measured proposition

Evidence:

- `scripts/webmcp-validation-round19.mjs:1117-1122` does not inspect invocation or response events when the command returned no ID: both result variables are assigned null on that branch. Therefore `receipt.json:1879-1881,1947-1949,2015-2017` does not independently establish event absence. The recorder subscribes to both event types (`scripts/webmcp-validation-round19.mjs:54-58,751-755`), but those raw frames are not retained in these final case records.
- The eight-second wait is conditional on an ID (`:1117-1119`); the command-error branch immediately reads form state (`:1123`) and then closes the case (`:1148-1151`). These cases do not establish an eight-second quiet period or an indefinitely absent submit.
- `pageObservation` (`scripts/webmcp-validation-round19.mjs:856-892`) measures recorded submit count and selected form control values, not arbitrary page state or entry into all Blink code.
- `SKILL.md:2056,2067`, `decisions.json:189`, and `corpus/knowledge/webmcp-declarative-validation-round-19.md:66-67` broaden this to no toolInvoked, page untouched/no page change, and never reaches/before Blink. The pinned PDL declares the input type; it does not identify the dispatcher implementation boundary or promise general page immutability.

The exploratory raw probe is useful corroboration, not discarded: `validation/probes/non-scalar.json` has two `primaryRuns` (`first`, `repeat`), each with `top-level-array`, `top-level-string`, and `top-level-null`. In all six recorded event arrays the only event method is `WebMCP.toolsAdded`; recorded calls are empty and both forms retain their seeds. Its producer script is explicitly uncommitted (`:9`), however, and `toolRespondedWaitLimitMs: 8000` metadata (`:33`) does not prove that every error branch actually waited that duration.

**Exact correction:** independently count invocation/response events from the fresh case's recorder even when there is no returned ID, and state the observation boundary. In both DV-08 representations and the knowledge note, replace the broad outcome with:

> For the tested array, string and explicit null inputs, the CDP command rejects with Invalid parameters and returns no invocation ID; zero submits and unchanged seeded text-control values were recorded at the post-command observation.

Retain “no tool events recorded” only as a bounded observation backed by actual event counts (or specifically attribute it to the exploratory probes). Replace “never reaches Blink” / “before Blink” with “the tested call was rejected at the CDP command boundary, rather than producing a tool-response validation error.” A claim about never entering a particular internal implementation needs its own implementation evidence.

### P3 — All three probe-case source records remain unresolved despite the resolved decision binding

`cases/non-scalar.json:127-130,158-161,189-192` contains literal `unresolved` for file, lines and URL. The control has the real PDL citation (`:213-216`). Both the harness (`scripts/webmcp-validation-round19.mjs:1023-1024`) and counter (`measure-c1.mjs:391-392`) accept arbitrary strings in these slots, so this unfinished provenance survives validation. This does **not** invalidate the separate decision-level body hash/token, but it leaves the named probe records non-self-contained under PLAN's case contract (`PLAN.md:98-103`).

**Exact correction:** set all three probe source objects to the same citation already supplied by the control: file `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`, lines `59-69`, URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`. Also add `WebMCP.pdl:59-69`/input-object scope to S079's registry anchor; its current `corpus/SOURCES.md:93` anchor describes only status and event-emitter ranges. Keep the source declaration separate from the runtime error observation.

## Source proposition, re-derived from the retained body

Executed `zcat` on `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/sources/WebMCP.pdl.gz`, numbered its decoded lines, and separately hashed the decoded stream with sha256sum.

- Source: [Chromium 154.0.8037.97 WebMCP.pdl, line 66](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl#66).
- Access date: **2026-10-21** (S079 opened date and this retained-body review; no new network fetch).
- Exact quote: **`object input`** (two words), at decoded line **66**, inside the declared inclusive **59-69** interval.
- Decoded SHA-256 observed: **`26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`**, exactly equal to DV-08's bodySha256 and the S079 registry hash.

Entailed source proposition: `WebMCP.invokeTool` declares a required object-valued top-level input parameter. This is a CDP argument-shape contract, not evidence that every inputSchema constraint is enforced, not an object-member coercion rule, and not text specifying the exact rejection message or arbitrary page-state immutability. The PDL also declares an invocationId in successful command returns; the retained receipt supplies the actual error outcome for these samples.

## Runtime proposition, re-derived from committed observations

All paths in this section are under `corpus/evidence/round-19/validation/`.

| Case | Exact input class/value | Retained result | Observation anchors |
|---|---|---|---|
| `decl-non-scalar-03` | `[{"text_null":"unexpected-array-member"}]` | commandError Invalid parameters; ID null; no-response; 0 submits; four seeded text values retained; pass true | `receipt.json:1847-1916` |
| `decl-non-scalar-04` | `"not-an-object"` | same rejection and state observations; pass true | `receipt.json:1919-1984` |
| `decl-non-scalar-05` | explicit JSON `null` | same rejection and state observations; pass true | `receipt.json:1987-2052` |
| `decl-non-scalar-06` (control) | `{"text_long":"short-valid"}` | Completed; commandError null; matching invocation IDs in both events; 1 submit; text_long short-valid, other seeds retained; pass true | `receipt.json:2055-2128` |

Observed command message in all three negatives: `cdpSession.send: Protocol error (WebMCP.invokeTool): Invalid parameters`. The error is **not** toolResponded.errorText (which is null); `no-response` is the harness's sentinel, not a WebMCP InvocationStatus enum value. The positive control uses the same tool/fixture/family and proves that this fixture can fill and autosubmit for a valid object input. It is a separately fresh case, not a recovery attempt in a previously failed context.

The raw exploratory case locations are `probes/non-scalar.json:657,906,1151` (`first`) and `:1986,2235,2480` (`repeat`). Their request.params.input values preserve the three top-level types and their invokeReply errors agree with the final receipt. They do not include the integration-added success control; that control is supported by the final receipt.

### Null, type, coercion and submit-timing challenges

- Explicit null is preserved: `loadCases` distinguishes an absent input property with Object.hasOwn and copies `entry.input` (`scripts/webmcp-validation-round19.mjs:1014,1027`); `cdpInvoke` forwards it without a truthiness/default-object conversion (`:848-852`). The raw probe requests also explicitly contain input null.
- The distinction is JSON object versus other JSON types, **not** JavaScript typeof: arrays and null are not acceptable JSON objects merely because typeof reports object. A nested null such as `{text_null:null}` is an object-valued command input and belongs to later per-field validation, not DV-08. DV-08 supplies no rule about nested arrays, objects or field coercion.
- Top-level numbers/booleans, omitted input, empty array/string and JSON-encoded-object strings are not among these three runtime samples. Their treatment can be discussed as a source-type consequence, not additional runtime-verified cases. No implicit parsing of an input string into an object is demonstrated.
- These are command errors, not fill-time or submit-time `toolResponded` Error outcomes. Zero recorded submits at the observation point does not by itself establish where all internal execution stopped or that no later asynchronous page action is possible.

## Identity, uniqueness and counter strengths

Direct JSON inspection found each target receipt ID exactly **once**, no duplicate receipt IDs overall, six distinct IDs in the family file, and only DV-08 owning these three probe IDs in decisions.json. Literal searching across all case files found these four IDs only in non-scalar.json. The runtime/producer/case/fixture identity chain is consistent in the retained receipt, and these local byte hashes were observed with sha256sum:

- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- non-scalar.json: `e0cb8e204f0879d70f14ce342bbc5b888b06c36bdc266f29b6417f638424124e`.
- non-scalar.html: `fb246f56a5f32c2c18c3617e1a73d0e5a4ae09c4ab27e4f290bc597b80e34c19`.
- Receipt identity: Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0. This is retained evidence, not a browser version re-run by this seat.

The counter genuinely checks duplicate probe ownership (`measure-c1.mjs:564-576,823`), case/receipt duplicates (`:396-398,469-481,621-631`), source opened/mined/hash/token binding (`:579-610`), case/fixture digest maps, producer and runtime identity (`:855-865`), and same-family Completed control (`:659-664,706-712`). These are useful integrity checks. They do not establish semantic entailment: SKILL row checking at `:553-559` checks probe/control/source tokens, not condition/answer truth; the source check is lexical presence, not a proof that the token entails all prose. The missing outcome predicates above remain necessary even with fresh reproduction.

## Residual risk and verification gaps

- Scope was the B-to-R change, with B `66251bfc1aef393e4aec599e950a8deb867736bb` and R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The actual R prose diff was read. Intervening lane edits touched SKILL/SOURCES/other decisions during review; their diff did not change DV-08 or the cited harness/counter/receipt evidence. This report does not review or admit those other corrections.
- `xd://lsp` discovery returned **No such tool: xd://lsp**. No LSP device/server was available for status/references/definition/diagnostics. The fallback was literal source inspection; grep output is not presented as semantic reference proof.
- No browser, full C1 counter, suite, linter, build, runtime/mutation probe, judge, admission, integration or second orchestration runtime was invoked. Static counterexamples above are explicitly inference, not claimed test results. Final fresh verification remains L1-owned.
- No resume/reroute/saturation implementation is changed or exercised in this scoped decision. No resume-continuity, saturation, or routing claim is made.
- No tools were installed or updated. All invoked short-lived read/hash commands completed; no background jobs, browser profiles or long-lived processes were created.

## Isolation

- Mode: advisory, report-only; no production edits and no production commit.
- Clone path: none (no runtime/mutation probe, so no sandbox clone needed).
- Branch: none.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit reviewed, not authored: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Changed paths: `.ufo/waves/round-19/w2/Decision08.md` only. No Git writes, jj commands, fleet/sibling/domain-source mutations, package changes or host-service changes.
