# ScoutCoverage — round 20, C1 source-only completion lifecycle

Seat: TabiR20.ScoutCoverage (leaf; no dispatch). Lane baseline: c49929430d996b016dde2e3a3a5be380f3433fdb.
Scope: held-coverage inventory and exact new depth for C1 (0 -> 12 SOURCE-ONLY lifecycle decisions).
No runtime, browser, counter, test, build, or network fetch was run. Read-only; this file is the only write.

## Axes

- A1 anchor exactness: every row's span and quote checked against the S096 bytes.
- A2 new depth vs restatement: a row that repeats a held claim adds no depth.
- A3 evidence class: every row is source-only; runtime neighbours are labelled, never merged.
- A4 frontier honesty: adjacent branches are listed as walk-outs, not admitted.

## Verdict

1. Held coverage is runtime and build-scoped (Chromium 154.0.8037.97, flags on, loopback): autosubmit success, fill-time errors, submit-time validation errors, imperative completion and cancel, declarative navigation completion, unregistration. Source-only lifecycle statements are limited to the S096 null-String qualification (r19 note `:129-131`) and imperative-path source reads (`webmcp-invocation-round-17.md:73,87`: S042 invoke path, S043 unregistration); no declarative completion branch is runtime-held beyond H3, H4, H8, H9.
2. Exact new depth is the 12 rows LC01–LC12 at the design spans; all 12 spans and quotes verify against the bytes. Classes: 8 new (LC01, LC03, LC04, LC06, LC07, LC08, LC10, LC11); 3 partial, outcome already runtime-held with a new mechanism (LC02, LC05, LC09 success arm); 1 restatement (LC12).
3. No new bytes, runtime, cases, or capability. S096 is the same body as S078, already retained and committed at baseline.
4. The 12 rows sit on 8 branch predicates. LC01/LC03/LC04/LC05 share one predicate; LC09/LC10 share one. If the critic counts distinct predicates, the honest count is 8 and the 12 target is unmet. It must be reported as unmet, not padded.

## Held coverage (before round 20)

| # | Held claim | Pointer | Class |
|---|---|---|---|
| H1 | Form removal and abort of the `registerTool` signal send `toolsRemoved`; navigation sends none | `knowledge/webmcp-chromium-loopback-round-16.md:61-62` | runtime; registration, not completion |
| H2 | Imperative: resolve -> Completed; throw/reject -> Error, `errorText` empty; unknown tool -> -32602 | `knowledge/webmcp-invocation-round-17.md:50-53` | runtime; imperative |
| H3 | Declarative autosubmit success: trusted SubmitEvent with agentInvoked; `respondWith` object -> Completed; no navigation | `webmcp-invocation-round-17.md:55`; receipt case `invoke-declarative-form` | runtime; declarative |
| H4 | Declarative autosubmit navigation: Completed, output = landing-document JSON-LD array; one navigation event | `webmcp-invocation-round-17.md:63,95`; `corpus/evidence/round-17/webmcp-invoke/receipt.json:8357-8411` | runtime; mechanism unexplained (T1) |
| H5 | `cancelInvocation` -> Canceled, on the imperative fixture (`invoke-imperative.html:76-89`, tool `slow-echo`) | `webmcp-invocation-round-17.md:62`; receipt `:7997-8016` | runtime; imperative only |
| H6 | Unregistration: later call -> -32602; unregistration mid-call does not cancel | `webmcp-invocation-round-17.md:56,74,87` | runtime (imperative); mid-call is probe-level |
| H7 | Imperative call across navigation: no toolResponded within 8,000 ms | `webmcp-invocation-round-17.md:60,95` | runtime; imperative |
| H8 | Fill-time error (`kInvalidInputArguments`): Error; all keys validated before any apply; controls unchanged | `webmcp-declarative-validation-round-19.md:35-38`; `SKILL.md:2161,2163,2175` | runtime; declarative |
| H9 | Submit-time error (`kToolInvocationFailed`, "Form validation failed:"): values stay; no submit event in tested families | `webmcp-declarative-validation-round-19.md:39-42`; `SKILL.md:2160,2165,2172,2174,2176` (cite S096:729-758) | runtime; declarative |
| H10 | Navigation returns a null String sentinel, not an ordinary empty successful CDP payload | `webmcp-declarative-validation-round-19.md:129-131`; `corpus/SOURCES.md:110` | source-only |

Held by no note and no receipt case: non-autosubmit forms (r19 note `:17-19` "Not claimed"; `corpus/README.md:409-410` frontier); declarative `CancelTool`; rejected `respondWith`; stringify failure; late response; the `CallDoneCallback` guard; preventDefault without respondWith; `submitFromJavaScript`. `SKILL.md:1957` ("only cancelInvocation gave Canceled") is true for the imperative fixture only; LC06 must not be read as declarative Canceled evidence.

## Row table (verified against S096 bytes)

Spans are 1-based lines of `corpus/evidence/round-20/sources/html_form_element.cc`. Each quote is a single-line literal inside its span.

| ID | Span | Anchor line and quote | Predicate | Held status | Class |
|---|---|---|---|---|---|
| LC01 | 181-186 | 182 `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);` | require_submit_button = attribute absent | autosubmit arm observed (H3); non-autosubmit arm untested | new |
| LC02 | 189-210 | 197 `return std::move(done_callback).Run(base::unexpected(error.value()));` | `error.has_value()` | outcome held (H8); ordering before running state is source-only | partial |
| LC03 | 249-258 | 251 `if (!*submit_button && require_submit_button) {` | no submit button and require | none | new |
| LC04 | 212-218 | 214 `// allow user input, and wait for the user to submit it.` | require = true arm (focus, PauseExecution at 217) | none | new |
| LC05 | 218-221 | 220 `form_->PrepareForSubmission(/*event*/ nullptr, submit_button);` | require = false arm | outcome held (H3); null-event mechanism source-only | partial |
| LC06 | 224-229 | 227 `ScriptToolErrorCode::kToolCancelled,` | CancelTool on running tool (CHECK at 225) | declarative none; imperative Canceled only (H5) | new |
| LC07 | 261-275 | 263 `if (done_callback_.is_null()) {` | callback already consumed | none | new |
| LC08 | 290-298 | 295 `if (!tool->CurrentlyRunning()) {` | late response | none | new |
| LC09 | 298-319 | 310 `respondWith promise resolved with an object that` (message fragment, continues at 311) | resolved and object and stringify fails | success arm held (H3); failure arm none | partial (failure arm new) |
| LC10 | 320-327 | 326 `respondWith promise was rejected` | resolved = false | none for declarative (H2 reject is imperative) | new |
| LC11 | 787-815 | 807 `} else if (!should_submit) {` | respondWith absent and preventDefault | none | new |
| LC12 | 818-830 | 829 `executing_tool->CallDoneCallback(base::ok(String()));` | navigation scheduled and running tool | restated (H10); runtime neighbour H4 disagrees (T1) | restatement |

Quote notes: LC06's quote also occurs at lines 392, 450, and 1103 outside the span; uniqueness holds only inside the span. Message texts at LC03 (254-255), LC09 (310-311), and LC11 (810-813) are concatenated C++ literals, so quote one line fragment at a time.

## Findings

1. Source identity (A1, A3). The S096 bytes equal the round-19 retained S078 body: `corpus/evidence/round-19/sources/html_form_element.cc.gz` decodes to sha256 `8c8d6796...36916`, matching `design.json:19`. Both rows share one URL (SOURCES.md:92 and :110). The baseline census (`census-before.json`, stdout) already flags S096 as a duplicate URL. Round-19 lesson `corpus/lessons/round-19.md:158` gives no source-diversity credit for shared identities. C1 must say "same bytes as S078" and claim no new source.
2. Committed pointer (QUALITY 28; A1). `git cat-file -e c49929430d996b016dde2e3a3a5be380f3433fdb:corpus/evidence/round-20/sources/html_form_element.cc` returns 128 (absent). The round-19 `.gz` returns 0 (present). Every row resolves only after the round-20 copy is committed, or after repointing to the committed `.gz` with its decoded sha. Also absent now: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `corpus/evidence/round-20/lifecycle/`, `.ufo/waves/round-20/measure-c1.mjs`.
3. Declared-span gap (QUALITY 2, 12; A1). S096's SOURCES row declares `174-328, 729-758, 818-842` (SOURCES.md:110). LC11 (787-815) falls outside every declared range. S078 declares `635-842` (SOURCES.md:92), which covers it. Fix by an append-only S096 range extension, or cite LC11 under S078. All other spans sit inside S096's declared ranges.
4. Falsified premise in the S078 cell (QUALITY 33; A2, A3). SOURCES.md:92 still says "navigation submission returns an empty string." S096 (SOURCES.md:110, "supersedes S078") and the r19 note `:129-131` supersede that reading. S078 carries no reciprocal marker. Add an append-only supersession marker; do not silently edit the cell.
5. Cell overreach (QUALITY 14; A3). SOURCES.md:110 says navigation returns a null sentinel "not an ordinary empty successful CDP payload." The CDP-payload half is S097 territory (`inspector_web_mcp_agent.cc:208-243`), not S096 bytes. LC12 must state only the Blink-side sentinel.
6. Runtime tension T1 (A3; unresolved). S096:818-829 completes the old call synchronously with `ok(String())` in the same block that schedules navigation. The receipt records the old call as Completed with a two-element JSON-LD array from the landing document, one navigation event (receipt `:8397-8411`). No held note reconciles these. LC12 must not be cited to explain H4. Handoff: the SourceNullOutput scout (S097 mapping of a null String, and event order).
7. Unique-decision count (A2). 12 rows over 8 predicates. `.ufo/waves/round-19/w1/CriticC1Depth.md:32` requires counting unique decision IDs; repeated citations do not raise depth. If predicates are the unit, the honest count is 8.
8. LC11 dependency (A3). S096:790-794 asserts `CHECK(!should_submit)` when respondWith was taken. That relies on `SubmitEvent::respondWith` refusing without preventDefault (`submit_event.cc`, not read here). LC11 may cite the CHECK only as a source assertion.
9. Non-autosubmit frontier (A4). LC01, LC03, LC04 move `corpus/README.md:409-410` from "untested" to "source-read, runtime open." Record as an append-only README row; do not edit r19 `:17-19`. QUALITY 11: the new note needs its README row in the same commit.
10. Manifest fields (design gap). `design.json` decisions carry only id, topic, span. The manifestShape also requires condition, outcome, quote, startLine, endLine.
11. Heading collision check. No existing SKILL.md heading contains "lifecycle" or "completion"; the designed heading does not collide. SKILL.md ends at line 2197; append there.

## Walk-outs (frontier; not admitted to C1)

- W1 `submitFromJavaScript` (S096:834-843): a second null-String completion at :841, outside LC12's span.
- W2 Form disconnected during the submit event (S096:776-786): the tool can be unregistered mid-flight.
- W3 `cancel_last_submission_` cancels a prior pending navigation (S096:821-823).
- W4 `CancelTool` on a non-running tool: fatal `CHECK(is_currently_running_)` (S096:225).
- W5 Non-object resolved values take the `ToString` path (S096:316-318).
- W6 `submit_event.cc` respondWith semantics behind S096:794 (not read).
- W7 Validation-failure path (S096:729-758): already runtime-held (H9); belongs to round 19, not C1.

## Moves that improve an axis and harm none (for main)

- Commit the round-20 copy, or repoint to the committed round-19 `.gz`: A1, QUALITY 28.
- Append-only S096 range extension to 787-815: A1, QUALITY 2/12.
- Append-only S078 supersession marker for the empty-string clause: A2, A3, QUALITY 33.
- Scope S096's CDP wording to the Blink side: A3, QUALITY 14.
- State the count as "12 rows over 8 predicates" with a counting command at the commit revision: A2, QUALITY 34.

## Verification run (read-only)

- `sha256sum` of the round-20 copy: `8c8d6796...36916`; `wc -l`: 1740. Matches `design.json:19`.
- `gzip -dc` of the round-19 `.gz` piped to `sha256sum`: `8c8d6796...36916`. Identical bytes.
- `git cat-file -e` at baseline: round-20 copy 128 (absent); round-19 `.gz` 0 (present).
- `ls`: lifecycle note, lifecycle directory, and `measure-c1.mjs` absent.
- Python span and quote check: 12/12 spans with first and last statements at expected boundaries; 12/12 single-line quotes found inside their span.
- Reads: `QUALITY.md` (full); `corpus/README.md` (1-434, full); `SKILL.md` 1-300 plus headings and 1864-1996; round-16, round-17, round-19 notes; receipt ranges `7997-8016` and `8357-8411`; `SOURCES.md:92,110`; `census-before.json`; `invoke-imperative.html`.
- Not run: the counter, tests, builds, the census validator, a browser, any network fetch.

## Tools

No tools were installed or updated. Used: sha256sum, gzip, `git cat-file` (read-only), python span check.

## Unknowns (untested here)

- T1: event order of the H4 response relative to navigation; S097 mapping of a null String.
- Runtime untested by any receipt: non-autosubmit forms, declarative cancel, rejected respondWith, stringify failure, late response, preventDefault without respondWith.
- Scalar depth stays 8 (`.ufo/waves/round-19/PLAN.md:12-13`); no promotion is claimed.

Report: .ufo/waves/round-20/w1/ScoutCoverage.md
