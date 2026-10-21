# CriticCount: round-20 C1 review (source-only lifecycle rows, pin S096)

Seat: `TabiR20.CriticCount`, leaf critic, author-side. Report-only. No production writes, no admission, no tool installs.
Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` (HEAD matches). Verdicts below are critic findings on current text, not admissions.

## Verdict

`c1_lifecycle_decisions 0→12` does not measure depth. The target is the length of a hand-written row list (`design.json:8`, `:24-121`), so any twelve shape-valid rows satisfy it, and the denominator is never enumerated. Against the pinned S096 bytes: the twelve rows cover 7 of 12 completion sites; 5 completion sites have no row; LC11 cites lines outside the registered S096 scope; LC12 asserts a navigation and a JSON-null contrast its span does not establish, and its CDP-visible consequence diverges from a round-17 receipt. Source-token presence is not entailment (QUALITY 47). Acceptance must be a per-row, non-author verdict over an enumerated universe. The mechanical counter may check identity, shape, scope containment and quote presence only. No scalar is proposed.

## Axes

- **A1** entailment: each condition and outcome is the code's predicate and effect, with dependencies cited.
- **A2** scope and provenance: cited lines lie in a declared S096 range or an amendment; identities bound.
- **A3** universe: denominator enumerated; coverage explicit.
- **A4** evidence class and cross-authority: source-scoped stays source-scoped; no contradiction with round-17/19 notes.
- **A5** mechanical verifiability: finite checks, negative controls, bindings.
- **A6** metric honesty: no self-referential target, no promoted scalar.

## Counterexamples

### C1. Target equals the row count; denominator absent (A3, A6)
- Evidence: `design.json:8` target 12; `:24-121` twelve decisions fixed before enumeration; `:131` requires twelve objects with a ≤25-word quote and no semantic field. Premature saturation: S096 holds 12 completion sites (U1); 5 are unrowed; further branch points are unrowed (U2).
- Correction: pre-register U by a recorded grep over the pinned file. Target = verified universe size, and only the ENTAILED subset counts. Precedent: `.ufo/waves/round-19/w1/CriticC1Depth.md` §5 (retain ≥12 only if the predeclared inventory supports twelve decisions).

### C2. LC11 lies outside the registered S096 scope (A2)
- Evidence: `corpus/SOURCES.md:110` declares `html_form_element.cc:174-328,729-758,818-842`. LC11's span 787-815 lies in none of these. Its predicate `!should_submit` is set at 775-776 (`DispatchEvent(...) == kNotCanceled`), with `setCancelable(true)` at 764. Both are also outside. `scripts/check-sources.mjs` checks anchor presence (`bare_anchor`/`anchor_missing`, `row_outside_registry`) and has no range-containment check (grep: scope|declared|line range|lineRange|anchor), so this breach passes the current gate.
- Correction: append-only SOURCES amendment with its own provenance declaring 764-776 and 787-815, or drop LC11 from C1. The counter adds containment (M3). QUALITY 12.

### C3. LC12 asserts a navigation and a JSON-null contrast the code does not establish (A1, A4)
- Navigation: the sentinel at 829 runs after `ScheduleFormSubmission(event, submitter)` (824), whenever `should_submit` holds and the tool is still running. `ScheduleFormSubmission` is `void` (`:882-883`) and returns early at 886, 898, 907, 911, 941, 951, 956-957 (dialog method: `SubmitDialog` closes the dialog and no navigation is scheduled, `:875-880`), and 963. None of those returns propagate. The comment at 827-828 ("has been triggered") is not tested by any branch. Reachability of those returns for declarative tools is UNKNOWN (`form_mcp_schema.cc` not pinned).
- JSON null: S096 holds no JSON-null comparison (grep `JSON null|json null|null string`: only the comment at 827). The contrast lives in S097 (`.ufo/waves/round-19/w2/SourceS079.inspector.body.gz`, decoded sha `1cc55ef9…` verified): `ParseJSON(null)` returns an empty dictionary (`:47-50`), used by `WebMCPToolResponded` at `:215-217`. The link from S096's callback to `WebMCPToolResponded` is not in any pinned file.
- CDP divergence (A4): round-17 receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json:8358-8409` (control `invoke-declarative-navigation-result`, status pass, observed on 154) records `toolResponded` `Completed` with the landing document's ld+json array and `navigationEvents: 1`. No `{}` response is recorded for that invocation. The static chain predicts an immediate `Completed` with `{}`. Pinned bytes do not explain the difference: UNRESOLVED. Cross-refs: `webmcp-invocation-round-17.md:63`, `:95`; `.ufo/waves/round-17/w1/C2Harness.md:67-70`.
- Correction: restate LC12 as the C++ return only: "after `ScheduleFormSubmission` returns (void; early returns not propagated), a running tool completes with `base::ok(String())` at 829." Drop "navigation" and the "not JSON null" clause from the S096 row. Any CDP mapping may appear only as a cross-source row citing S097:47-50 and 215-217 plus the unpinned link, marked UNRESOLVED against the receipt.

### C4. Five completion sites unrowed (A3, A4)
- 756, validation failure. In scope (729-758). Runtime-held at `SKILL.md:2051-2055`: cross-reference, do not restate.
- 841, `submitFromJavaScript` sentinel. In scope (818-842). Same sentinel issue as C3.
- 391 and 449, cancel of a running declarative tool on definition or attribute change, with kToolCancelled "since tool definition was updated". Skipped when `IsHandlingSubmit()` (`:390`, `:448`); the tool is then detached without completion, and the comment at `:777-786` describes the submit-path handling. Out of declared scope. Must be declarative-scoped: `webmcp-invocation-round-17.md:74` and `:87` state "unregistration mid-call does not cancel" (imperative probe, S043).
- 1102, `reset()` cancel, only when the reset event is not canceled (`:1084-1088`). Out of declared scope.

### C5. Row-level non-entailment (A1; QUALITY 47)
- LC05 "prepares submission": `PrepareForSubmission` returns before any completion at 638-640, 642-648, 650-660, 678-679 (out of declared scope). `is_currently_running_` stays true (204) on those paths within S096.
- LC06 omits the `CHECK(is_currently_running_)` precondition (225). Its errorText claim needs a declarative receipt: round-17 `invoke-cancel` recorded `errorText ""` for a pending call whose class the note does not state (`webmcp-invocation-round-17.md:62`, `:88`).
- LC09 "stringify failure" is the `ToLocal` failure (`:301-305`), with a local TryCatch and no ReportException on that branch (contrast `:322-323`). The message literal splits across `:310-311`.
- LC11 "preventDefault": the token appears in a message at `:811`; the predicate is `:775-776`. The row holds only in the else branch of validation (`:729`). The validation failure sets `should_submit=false` at `:730` without dispatching a submit event.
- LC04 "PauseExecution": the effect lives in ModelContextSupplement (outside the pins); `:213-214` is developer intent.
- LC02 "fill error" hides `:237-247` (parse, non-object), `:251-256` and `:258` (FillData, unseen). Non-object input is source-reachable but runtime-unreached per round-19 (`SKILL.md:2056`, "Non-object input never reaches Blink").
- LC07 "only with callback" is ambiguous. The guard is `done_callback_` non-null (`:263-265`), and the callback runs before state clears (`:266` then `:267`).
- Depth and actionability (AXES.md:11, "a reader can act on SKILL.md alone"): rows name C++ calls, not what a caller receives. The only pinned caller-visible mapping is S097: `kToolCancelled` maps to `Canceled`, else `Error`; `errorText = error.message` (`:228-230`, `:241-243`). Use these as cited cross-source columns, scoped to declarative tools.

### C6. Duplicate or contradictory authority (A4)
- `SKILL.md:2049-2056` (round 19, runtime-held) already holds fill-time and submit-time error classes. A round-20 row for 756 must cross-reference them.
- Round-17 `:74`/`:87` against declarative cancels (C4).
- The S096 row in `SOURCES.md:110` teaches "not an ordinary empty successful CDP payload or proof that navigation completed", and `webmcp-declarative-validation-round-19.md:129-131` says the same. LC12 wording must not regress either.
- Every rendered SKILL row needs "source-only" on the row, not only in the heading (QUALITY 14).

### C7. Counter absent and under-specified (A5)
- `.ufo/waves/round-20/measure-c1.mjs`, `corpus/evidence/round-20/lifecycle/decisions.json` and `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` are absent from the lane root and all four clones (ls; glob).
- The only precedent counter (`.ufo/waves/round-19/measure-c1.mjs`, about 1527 lines, `EXPECTED_DECISION_COUNT = 27`) requires runtime receipts, cases and fixtures. Cloning it cannot check a receipt-less source-only C1.
- Quote normalization is undefined: `//` markers (827-828) and adjacent C literals (`310-311`, `254-255`, `810-813`).
- Identity: S096 decoded sha `8c8d6796…6916` matches the design, SOURCES and the round-19 body. The round-20 copy is byte-identical to the round-19 body (`cmp`). Local `git hash-object` gives blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`, not compared to Chromium. The round-20 copy is untracked at HEAD; the committed root is `corpus/evidence/round-19/sources/html_form_element.cc.gz` (tracked, blob `8e8134ee…`). Add the blob id, the `?format=TEXT` base64-decode step and commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` to the manifest (QUALITY 28, 38).
- Missing: README row and count line (QUALITY 11, 34, 43).

## U1. Completion sites in pinned S096 (denominator = 12)

| site | function / branch | completion | row | declared scope |
|---|---|---|---|---|
| 197 | ExecuteTool, fill error | `done_callback.Run(unexpected)` | LC02 | in |
| 226 | CancelTool | kToolCancelled | LC06 | in |
| 308 | HandleWebMcpToolResponse, stringify fails | kToolInvocationFailed | LC09 | in |
| 319 | HandleWebMcpToolResponse, resolved | result | LC09 | in |
| 324 | HandleWebMcpToolResponse, rejected | kToolInvocationFailed | LC10 | in |
| 391 | invalid-MCP-form branch (380-399) | kToolCancelled, skipped if IsHandlingSubmit | UNROWED | **out** |
| 449 | RegisterDeclarativeWebMCPTool, attr/schema change | kToolCancelled, skipped if IsHandlingSubmit | UNROWED | **out** |
| 756 | PrepareForSubmission, validation failure | kToolInvocationFailed | UNROWED | in (729-758) |
| 808 | PrepareForSubmission, no respondWith, !should_submit | kToolInvocationFailed | LC11 | **out** (787-815) |
| 829 | PrepareForSubmission, should_submit | `ok(String())` | LC12 | in (818-842) |
| 841 | submitFromJavaScript | `ok(String())` | UNROWED | in (818-842) |
| 1102 | reset(), event not canceled | kToolCancelled | UNROWED | **out** |

Rows cover 7 sites (197, 226, 308, 319, 324, 808, 829). Unrowed: 5 (391, 449, 756, 841, 1102). Enumeration: `CallDoneCallback` yields 11 call sites and `Run\(` yields 197, 266 (body of CallDoneCallback) and 822 (cancel_last_submission_). Completion sites therefore total 12.

## U2. Non-completion branch points, unrowed

237-247 parse and non-object errors · 316-318 primitive resolved value, ToString · 390/448 IsHandlingSubmit deferral · 638-679 PrepareForSubmission early returns · 730 validation sets should_submit=false · 764 cancelable · 775-776 should_submit derivation · 882-963 ScheduleFormSubmission early returns (void) · 1084-1088 reset event cancel · CHECKs at 225 (is_currently_running_), 770, 794 (`!should_submit` on the promise path), 826 and 840 (WebMCPEnabled). CHECK reachability depends on unpinned code (SubmitEvent::respondWith, feature flags): UNKNOWN.

## Per-row critic verdicts on current text (not admissions)

| row | span | scope | verdict | required change |
|---|---|---|---|---|
| LC01 | 181-186 | in | ENTAILED | none |
| LC02 | 189-210 | in | REWRITE | name error classes 237-258; FillData unseen |
| LC03 | 249-258 | in | ENTAILED | add "258 not reached" |
| LC04 | 212-218 | in | REWRITE | PauseExecution effect outside pins; "no completion here" is branch-local |
| LC05 | 218-221 | in (outcome) | REWRITE | early returns 638-679 out of scope |
| LC06 | 224-229 | in | REWRITE | CHECK at 225; errorText only with declarative receipt |
| LC07 | 261-275 | in | REWRITE | guard = pending completion; order 266 then 267 |
| LC08 | 290-298 | in | ENTAILED | none |
| LC09 | 298-319 | in | REWRITE | `ToLocal` failure; no ReportException; quote crosses 310-311 |
| LC10 | 320-327 | in | ENTAILED | optional: ReportException (322-323) |
| LC11 | 787-815 | **out** | OUT-OF-SCOPE, plus dependencies 764, 775-776, 729/730 | amend SOURCES or drop; restrict to else branch |
| LC12 | 818-830 | in | NOT-ENTAILED as written; CDP mapping UNRESOLVED | C3 rewrite |

## Semantic acceptance (separate from the counter)

Per decision id, a non-author reviewer (external closure; author seats may not review) records:
1. **Predicate:** exact test (variable, call or attribute), branch taken, lines. Lines may lie outside the span, cited.
2. **Effect:** exact observable at a line: return, callback argument (code and message, or `ok(String())`), CHECK, state write, event or console output.
3. **Dependencies:** each symbol used by items 1-2 and defined outside the cited span, with its line, or `UNKNOWN (not in pinned bytes)`.
4. **Negations:** each "not X" or "no Y" clause, with supporting lines, `[INFERENCE]`, or a named cross-source row with lines.
5. **Sibling branch:** what the other branch does (lines), or the row that covers it.
6. **Scope:** every cited line lies in a declared S096 range or a named amendment.
7. **Evidence class:** "source-scoped; not runtime-observed". Runtime cross-refs marked `agrees`, `conflicts`, `unexplained` or `none`.
8. **Verdict:** ENTAILED, REWRITE (exact replacement text), NOT-ENTAILED, OUT-OF-SCOPE or UNRESOLVED.

Fields are not summed. The counter never reads items 1-8. Passing the counter does not imply ENTAILED: LC12's quote is a true comment, but its clauses are not entailed.

## Mechanical counter: minimum finite checks (proposal)

- **M1 identity:** sha256 `8c8d6796…6916`; `git hash-object` recorded; refuse symlinked or non-regular inputs (QUALITY 6).
- **M2 shape:** schema tag; exact id set equals the enumerated U list; `1 ≤ start ≤ end ≤ 1740`.
- **M3 containment:** each span lies in a declared S096 range or a named amendment. This flags LC11.
- **M4 quote:** after declared normalization (strip `//`, C literal quotes and concatenation, line breaks) the quote is a substring of the span; at most 25 whitespace words.
- **M5 render:** SKILL rows byte-equal to manifest rows; no `|` in cells; one declared heading.
- **M6 binding:** counter blob sha, manifest sha, receipt with argv, exit and producer digest (QUALITY 22, 26, 30); README row and count command (QUALITY 11, 34, 43).
- **Negative controls** (each asserts exit and reason token, QUALITY 21): span beyond 1740 gives `span_out_of_range`; inverted gives `span_inverted`; quote absent gives `quote_not_in_span`; 26 words gives `quote_too_long`; quote present in the file but outside the span gives `quote_outside_span`; span outside declared ranges gives `scope_outside_declared` (the LC11 case); duplicate id; missing id; sha mismatch gives `source_digest_mismatch`; symlinked source refused; pipe in a cell gives `render_pipe`.
- Output is a check table. No count is promoted to depth.

## Smallest safe correction set (improves → harms)

1. Replace the C1 text with U1 and per-site verdicts. Drop "0→12" as a depth claim; target = verified universe. Improves A3, A6. Harms: none.
2. Append-only SOURCES amendment declaring 391, 449, 764-776, 787-815 and 1102 before any row cites them; otherwise mark OUT-OF-SCOPE. Improves A2. Harms: a SOURCES change with its own check.
3. LC12 restated as C++-return wording; remove "navigation" and "not JSON null" from S096 rows; UNRESOLVED flag with receipt cite. Improves A1, A4. Harms: none (the removed clauses were unentailed).
4. Rewrite LC02, 04, 05, 06, 07 and 09 per the verdict table. Improves A1. Harms: none.
5. Add rows, or UNROWED with reason, for 756 and 841; declarative-scoped rows for 391, 449 and 1102. Improves A3, A4. Harms: more verification.
6. Cross-reference `SKILL.md:2049-2056` for fill and submit errors instead of re-asserting. Improves A4. Harms: none.
7. Counter M1-M6 with negative controls and normalization. Improves A5. Harms: code to maintain.
8. Non-author semantic review. Improves A1, A6. Harms: throughput.

Moves 1, 3, 4 and 6 improve axes without harm. Moves 2, 5, 7 and 8 cost effort and harm no axis if done as specified.

## Checks

**Exercised (read-only):**
- `design.json`, read in full.
- Every decision span read against S096. All twelve lie within 1-1740 and map to the claimed code.
- `sha256sum`: S096 matches `8c8d6796…6916`; round-19 `.gz` body matches; S097 body matches `1cc55ef9…`.
- `cmp`: round-20 copy identical to round-19 body.
- `git hash-object` (no `-w`), `git ls-tree HEAD` on round-19 and round-20 evidence, `git cat-file -t` on baseline (commit), `.gitignore` (ignores only `.ufo/interactive-sessions/`).
- grep: completion sites, negative-gloss tokens, registry strings, `check-sources.mjs` gate names.
- Reads: `SOURCES.md:110`; `README.md:424-426`; `QUALITY.md` criteria; round-19 lesson 173-176; `SKILL.md` 2049-2056; round-17 note and receipt 8358-8409; `C2Harness.md` 67-70; `AXES.md` 9-12; round-19 `measure-c1.mjs` outline; round-19 `CriticC1Depth.md`.
- Round-19 lesson exists (QUALITY 10).

**Not exercised:**
- The round-20 counter, manifest and note (absent).
- `scripts/check-sources.mjs` and `scripts/check-measurement-binding.mjs` (not run).
- No Gitiles fetch, so the blob id is not compared to Chromium.
- No Chromium build or run; no SKILL or README render.
- Reachability of the ScheduleFormSubmission early returns and the CHECKs is UNKNOWN from pinned bytes.

## Isolation

Report-only write to `.ufo/waves/round-20/w1/CriticCount.md`. Git calls were read-only: no `git status`, no `-w`, no index refresh. No tools installed. No tests, builds or formatters run. No subagents dispatched.

## Disposition after TabiR20 IRC

Accepted: the mechanical and semantic split. The counter checks identity, shape, citation and render. Semantic verdicts come from fresh non-author reviewers in w2 on the revised texts. The source table is a finite sample, not a completion-site universe or coverage claim, and carries no scalar depth score. C1 keeps its declared target of 12 documented source-scoped decisions, with depth 8→8. LC11 moves to S100. LC12 is restated as a C++ return with source branch conditions. Every verdict in this report stays on the pre-repair text.

Dissent retained, not withdrawn:

1. Target 12 is a self-selected count. Keep it only with its selection rule in the claim text, and name the excluded sites (391, 449, 756, 841, 1102; the U2 branch points) so the sample cannot be read as coverage. A count credit is not admissible.
2. AXES.md:25-33 requires each claim to be one axis move with a before-to-after. "depth 8→8" moves nothing. Either C1 is recorded as a sample artifact outside the round's claims, or it states a measured axis move. It does not satisfy the lowest-axis rule (AXES.md:33) by name.
3. M3 (each span inside a declared S096 range or a named amendment) must count as citation. It is the check that catches the LC11 breach; without it the counter passes the same breach.
4. S100: if it reuses the S096 bytes (sha256 8c8d6796…6916), record it as explicit reuse, not an independent source (corpus/lessons/round-19.md:166-167), bind blob cd7efa45…, and give it its own tier A/B row with declared ranges. A different source must be opened before it is cited.
5. LC12 keeps the branch condition at 825 and states that 829 runs whatever ScheduleFormSubmission did (void; early returns at 886, 898, 911, 941, 951, 963). The round-17 conflict (corpus/evidence/round-17/webmcp-invoke/receipt.json:8358-8409) appears as an explicit UNRESOLVED note on that branch, not dropped.
6. C++-only rows do not meet AXES.md:11 actionability (a reader acts on SKILL.md alone). Acceptable only while the note does not present itself as actionable depth; state that limit in the note.
7. Cross-reference SKILL.md:2049-2056 for fill and submit errors rather than restating them. Scope the round-17 cancel and unregistration claims (corpus/knowledge/webmcp-invocation-round-17.md:74, :87) to declarative tools.
8. W2 semantic reviewers must be non-author seats, given the S096 bytes and the round-17 and round-19 runtime cross-references (contract: non-author admission requires external closure).
