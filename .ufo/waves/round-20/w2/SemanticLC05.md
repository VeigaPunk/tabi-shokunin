# SemanticLC05 — round-20 LC05 predicate/effect attack (source-only)

Seat: TabiR20.SemanticLC05 (leaf member, no dispatch). Author-side finding, not external closure.
Scope: LC05 only, plus the LC05-linked caveats, history and instructions. Source-only; no runtime claim.
Read-only except this report. No tests, builds, counter runs, commits, clones, or tool installs.
Axes: (1) predicate source and timing; (2) callsite-to-effect fidelity; (3) callback and null guards;
(4) sample limits; (5) prior r17/r19 observations kept.
Verdicts are per field and are not summed. ENTAILED = source supports the field as worded.
REWRITE = the fact holds but the wording over- or under-states a branch the row's scope requires.
NOT-ENTAILED = contradicted as worded by retained source or a retained observation.
UNRESOLVED = retained excerpt and receipts do not decide it.

## Pins verified (checkpoint 4ae99816b8994fdedc159156d8d9d242dd5c4782; worktree equals checkpoint)

- `corpus/evidence/round-20/sources/html_form_element.cc` sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 (1740 lines)
- `corpus/evidence/round-20/lifecycle/decisions.json` sha256 da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf
- `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` sha256 3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4
- `SKILL.md` sha256 a2653f4588b5c1268cb8be18801f07d9f86a1527e6c080458f57c143e9f6fd76
- `.ufo/waves/round-20/design.json` sha256 1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da

## Findings by severity

**High**

1. **LC05 outcome misstates the callee.** "This callsite alone establishes no submit event, navigation, or completion" (decisions.json:46, knowledge:33, SKILL.md:2221). The call at 220 runs PrepareForSubmission, which dispatches an agent-invoked SubmitEvent (761-776) and can complete the call synchronously (756-758, 808-813, 829). Replacement text is R1.
2. **SKILL.md:2232 blanket instruction.** "Do not interpret focus/pause or PrepareForSubmission as completion (LC04–05)" is contradicted by the done-callback calls inside PrepareForSubmission at 756-758, 808-813 and 829. Replacement is R3.

**Medium**

3. **Row 8 omits the state the branch leaves.** The knowledge doc scope (line 9) requires what the branch does to running state and done callback. The LC05 outcome says neither: 204-210 leave is_currently_running_, active_submit_button_ and done_callback_ set, and the branch does not run the callback.
4. **Call-time predicates are not named.** The outcome depends on isConnected (642), is_submitting_ and in_user_js_submit_event_ (638), skip_validation (713-715), declarative_webmcp_call (722) and validation (729). All are evaluated after the CE scope (194) and state setup (204-210). The condition names only entry-time predicates.
5. **SKILL.md:2053-2054 attribution and citation.** It cites 729-751 (the completion is at 756-758) and attributes the branch to toolautosubmit. The branch is keyed on a running declarative call (720-722, 731), not on the attribute. The r19 observations are toolautosubmit fixtures, so they stand.
6. **Knowledge line 81 (r19 adjacency).** It cites `missing-required.json:12-13` for observed values; those lines are the predeclared `expect` block (submitCount is on :14). Observed values are in the probe (R6). It cites 729-751 (completion is at 756-758). It calls the observation "adjacent, not one of the twelve rows"; the observed call runs through LC05's own callee.
7. **History omits an LC05-chain observation.** r17 probe `C2ProbeDeclarative.md:78-80` (navigating, no handler, toolautosubmit: Completed with output []) is absent from the knowledge history. Append only (R7).

**Low**

8. **Entry predicate source is unnamed.** "(toolautosubmit present at entry)" is the live attribute read at 182. The registration-time flag (416-417, 437, 457-458) updates later through a posted task (402-407) and can differ during the lag. The row is correct; it should name its source.
9. **Caveat completeness.** Knowledge line 52 lists the four early returns without a done callback (639, 647, 659, 679). It should also list the three done-callback sites inside PrepareForSubmission (756-758, 808-813, 829).
10. **Scope label.** decisions.json:9 "not runtime-observed" is correct for the rows. The same call path has observations on this build (section 4); the label must not be read as "path never observed."

**Unresolved leads (not findings; not verified; no reproduction)**: section 5.

## Field verdicts — LC05

| # | Field (location) | Verdict | Reason and evidence |
|---|---|---|---|
| 1 | decisions.json:47-48 startLine 218, endLine 221 | ENTAILED | 218 `} else {`, 219 comment, 220 call, 221 `}`. |
| 2 | decisions.json:49 quote | ENTAILED | Exact text on 220; three whitespace tokens (within 25). |
| 3 | decisions.json:45 condition "FillFormControls returned no error" | ENTAILED | Only fall-through is the no-error path after 196-198; FillFormControls returns std::optional (231-259). |
| 4 | condition "entry-time require_submit_button is false" | ENTAILED | 181-182 computed once from the live attribute; passed by value (192-193; parameter 234), so FillFormControls cannot write it back; read at 212 and 218; no reassignment in 174-222. |
| 5 | condition "(toolautosubmit present at entry)" | ENTAILED, scope note | Live attribute read at 182. Registration flag is read at 416-417 in the posted task (402-407), stored at 457-458, compared at 437. Attribute change at 1130-1135 schedules re-registration, so the two can differ during the lag. |
| 6 | outcome "PrepareForSubmission(/*event*/ nullptr, submit_button) is called immediately" | ENTAILED | No return between 210 and 220. submit_button may be nullptr on this branch: 251-256 refuse null only when require is true. Observed: r17 probe :31 (submitter null, buttonless autosubmit). |
| 7 | outcome "this callsite alone establishes no submit event, navigation, or completion" | REWRITE | As a claim about the call's effect: NOT-ENTAILED under the natural reading. Callee dispatches an agent-invoked SubmitEvent (761-776, agentInvoked at 771); completes synchronously (756-758, 808-813, 829); defers to a respondWith promise (789-806); schedules navigation via 824 (navigation only if ScheduleFormSubmission reaches 1042). Read as "line 220 by itself" it is ENTAILED but vacuous. Replace per R1. |
| 8 | knowledge:9 scope requirement (running state and done callback for this branch) | REWRITE | Outcome omits state left set (204-210) and that the branch does not run the callback. Pending if no callee branch completes it; no timer in excerpt. Covered by R1. |
| 9 | decisions.json:9 scope "source-only ...; not runtime-observed" | ENTAILED (label) | Rows are source-derived. Same call path observed on this build (section 4). |
| 10 | design.json:58-62 topic "autosubmit immediately prepares submission" | ENTAILED (label) | Label only; "prepares" omits completion branches but claims nothing beyond the call. |
| 11 | knowledge:33 condition | ENTAILED | Same text as decisions.json:45. |
| 12 | knowledge:33 outcome | REWRITE | Same as row 7. Any change must mirror decisions.json:46, knowledge:33 and SKILL.md:2221 (rendering rule requires exact rows). |
| 13 | knowledge:33 anchor S096:218-221 | ENTAILED | Matches. |
| 14 | knowledge:52 caveat, early returns without done callback (639, 647, 659, 679) | ENTAILED, completeness gap | Each return verified (guards 638-640, 642-648, 650-660, 678-679). None calls CallDoneCallback. Gap: 756-758, 808-813, 829 also call it. |
| 15 | knowledge:50 caveat, submitFromJavaScript sentinel | ENTAILED | 834-843: ok(null) at 841 while running. |
| 16 | knowledge:75 history (autosubmit with and without submit button; tool-form-active) | ENTAILED | receipt.json 4270-4286 (pass; predicate names :tool-form-active at 4277; agentInvoked true at 4330); probe :31-32. |
| 17 | knowledge:74 history (Completed, no navigation; navigation control) | ENTAILED | receipt.json 4285-4286 (navigation none; Completed with respondWith output); 8357-8370; receipt.stdout.txt:14. |
| 18 | knowledge:79 history (LC12 navigation control output = landing-document JSON-LD) | ENTAILED as observation | receipt.json:8370. Mapping of base::ok(null) to that wire value stays UNRESOLVED, as the doc states. |
| 19 | knowledge:81 r19 adjacency | REWRITE | (a) missing-required.json:12-13 is the predeclared expect block; submitCount is on :14. Observed values: probes/missing-required.json:92-97 and 157-162. (b) Cite 729-758; round-19 DV-06 source block lists [729, 758]. (c) "Not one of the twelve rows" holds only for the row set: fixture is toolautosubmit (fixtures/missing-required.html:8), probe annotates autosubmit true (probe:59), and the call runs 220 -> 729 -> 756-758. Cross-reference from LC05. |
| 20 | knowledge history omission | REWRITE (append) | r17 probe C2ProbeDeclarative.md:78-80: navigating no-handler toolautosubmit submit, Completed with output []. Probe-level, one build. Append; do not edit earlier bytes. |
| 21 | SKILL.md:2221 condition and anchor | ENTAILED | Identical to decisions.json:45 and anchor. |
| 22 | SKILL.md:2221 outcome | REWRITE | Same as row 7. |
| 23 | SKILL.md:2232 "do not interpret focus/pause or PrepareForSubmission as completion (LC04-05)" | NOT-ENTAILED as worded | PrepareForSubmission calls the done callback at 756-758, 808-813, 829; r19 observed completion through this callee. Replace per R3. |
| 24 | SKILL.md:2053-2054 "(kToolInvocationFailed, S078 ...:729-751): ... toolautosubmit's interactive constraint validation failed" | REWRITE | Cite 729-758. Branch keyed on running declarative call (720-722, 731), not the attribute. Observation holds for toolautosubmit fixtures. Any PrepareForSubmission during a running call reaches it (requestSubmit at 872 in source; button-activation route outside excerpt). Non-autosubmit runtime UNRESOLVED. |
| 25 | SKILL.md:2236-2237 "Reset/removal/re-registration ... remain outside the sample" | ENTAILED | All exist in retained file: reset 1101-1105; removal 378-399; re-registration 402-407. |
| 26 | CallDoneCallback null guard (263-265) | ENTAILED | Returns before reset (267). LC07 text correct. |
| 27 | Whether a null done_callback can reach ExecuteTool | UNRESOLVED | ExecuteTool neither checks it before Run at 197 nor before store at 210. Caller contract outside excerpt. A null value would leave is_currently_running_ true. |
| 28 | executing_tool null-safety at 756, 808, 829 | ENTAILED | executing_tool = active_webmcp_tool_ (720); reached only under declarative_webmcp_call (722, 788) or `executing_tool &&` (825). |
| 29 | executing_tool identity equals the tool whose ExecuteTool is running | UNRESOLVED | 720 reads the form's active tool, not this. Synchronous unregistration (378-399) is reachable from AttributeChanged (1130-1135), RemovedFrom (523), ChildrenChanged (1624), Associate/Disassociate (1194, 1211). CE reactions run on CEReactionsScope exit (191-194; definition outside excerpt), before 204-220. Not reproduced; out of scope. |
| 30 | ExecuteTool entry has no running guard | UNRESOLVED | Re-entry would overwrite invocation_id_ (178) and done_callback_ (210) with no call in this excerpt. Caller contract outside excerpt. |
| 31 | Reentrant completion during dispatch (listener calls form.submit()) | ENTAILED | 834-843 completes with ok(null); re-checks at 787-788 and 825 prevent a second completion. Knowledge caveat line 50 correct. |
| 32 | Call-time predicates decide the outcome | REWRITE | See finding 4. Named predicates are evaluated after 194 and 204-210; the row names none. |
| 33 | Sample limits (finite sample; callsite only) | ENTAILED | Row samples the call expression only. Verified unlisted limits: validation skipped with no page, novalidate or formnovalidate (713-715); ScheduleFormSubmission has 13 return statements before 1042 (886, 898, 907, 911, 941, 951, 956, 963, 976, 989, 1004, 1012, 1019), so navigation is not established even when the submit is not canceled; null event skips the submitter search (918); buttonless submit_button reaches the same callee. |

## Proposed rewrites (not applied; main owns integration)

- **R1 (LC05 outcome; mirror in decisions.json:46, knowledge:33, SKILL.md:2221):** "Sets is_currently_running_, active_submit_button_ and done_callback_ (204-210), then calls form_->PrepareForSubmission(nullptr, submit_button) (220) and does not run the done callback itself. The call is not a completion by itself. It returns at 639, 647, 659 or 679 with no state change, so the invocation stays pending unless another path completes it. Interactive validation failure runs the done callback with kToolInvocationFailed (756-758). Otherwise an agent-invoked SubmitEvent is dispatched (761-776) and completion follows the respondWith promise (789-806), the programming-error path (807-813), or base::ok(null) after ScheduleFormSubmission (818-829); navigation is scheduled only if ScheduleFormSubmission reaches 1042. Outcome depends on call-time checks at 638, 642, 650, 713-715, 722 and 729."
- **R2 (knowledge:52 caveat; append):** "PrepareForSubmission also runs the done callback at 756-758, 808-813 and 829."
- **R3 (SKILL.md:2232):** "do not treat the LC05 call expression as a completion; completion can originate inside PrepareForSubmission (see LC05 outcome)."
- **R4 (SKILL.md:2053-2054):** cite 729-758; "observed on toolautosubmit fixtures; the branch is keyed on a running declarative call, so any PrepareForSubmission call made while the tool runs reaches it."
- **R5 (decisions.json:9 scope):** "source-only; the same call path has runtime observations recorded as history in the knowledge doc."
- **R6 (knowledge:81):** cite `probes/missing-required.json:92-97` and `:157-162` for observed values; cite 729-758; move from "adjacent" to a cross-reference of LC05's callee path; submitCount is at expect :14.
- **R7 (knowledge history; append only):** r17 probe `C2ProbeDeclarative.md:78-80` (navigating no-handler toolautosubmit, Completed with output []) and `:31` (submitter null on buttonless autosubmit). Probe-level, one build.

## Prior observations kept (history; not source rows)

- r17 `receipt.json` 4270-4286 and 4330: autosubmit invocation dispatched a trusted SubmitEvent with agentInvoked true; respondWith resolved; Completed; no navigation (pass).
- r17 `receipt.json` 8357-8370: navigation control; Completed with output = array of landing-document ld+json blocks.
- r17 probe `C2ProbeDeclarative.md`: :31 buttonless autosubmit, submitter null; :42-43 no toolautosubmit stays pending; :46-50 toolautosubmit dispatches submit itself; :78-80 navigating no-handler autosubmit, Completed with output [].
- r19 `probes/missing-required.json:92-97` and `:157-162`: toolautosubmit fixture via invokeTool; Error "Form validation failed: required: Please fill out this field.. "; submitCount 0. Path: 220 -> 729 -> 756-758.
- r19 `probes/missing-required.json:355-362`: decl-04 control; Completed; submitCount 1; agentInvoked true (LC05 normal path).
- r19 `probes/missing-required.json:222-227`: decl-03; Invalid value; submitCount 0 (fill-time, LC02 path; consistent with LC02; not this row).

The source reading is consistent with all of the above; none is erased.

## Unresolved leads (out of scope; not reproduced; no exploit steps)

- Window 191-204: CE reactions run on scope exit before state setup and the call. Synchronous unregistration (378-399) can change active_webmcp_tool_ there, so 720 sees a different or null tool and this tool could stay running with its callback. Depends on CEReactionsScope semantics (definition outside excerpt) and on whether FillData queues reactions that reach the registration triggers. Not verified.
- ExecuteTool re-entry without a running guard (caller contract).
- Bridge mapping of base::ok(null) to wire output (r17 observed arrays). Outside excerpt; unchanged open gap.
- CurrentlyRunning() definition is not in the retained file. Lines 722 and 788 depend on it.
- Validation-failure completion for a running non-autosubmit invocation through a button-activation route: outside excerpt; no runtime observation.

## Checks

- Performed (read-only): decisions.json; knowledge doc; SKILL.md; design.json; source ranges 170-330, 226-265, 362-405, 552-593, 586-634, 634-700, 695-763, 755-836, 834-875, 879-933, 934-1008, 1009-1046, 1712-1733; r17 receipt.json and receipt.stdout.txt; r17 probe note; r19 probes, fixtures, decisions, knowledge; greps over the source and corpus. Git blob digests for checkpoint 4ae9981 were read with `git show` (read-only).
- Not performed: no test, build, counter (`measure-c1.mjs`), runtime run, commit, clone, production edit, or tool install/update. No tool installed or updated, so nothing to record.
- Verification gaps for main: confirm the row-7 rewrite mirrors all three rendering sites; confirm the outcome-only change keeps the LC05 quote and span valid (quote and span checked as valid here); the counter's treatment of outcome text was not examined.

Report: .ufo/waves/round-20/w2/SemanticLC05.md
