# ResidualRowsD — LC10/LC11/LC12 canonical-row review (round 20, seat TabiR20.ResidualRowsD)

Read-only review at commit `ac10319843f718489a10b89a8d2a568879aaf980` (HEAD matched; `git log` verified). Scope: the three current canonical rows in `corpus/evidence/round-20/lifecycle/decisions.json`, the appended corrected-source section in `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, and the appended SKILL.md section (rows at SKILL.md:2282-2284), against the retained body `corpus/evidence/round-20/sources/html_form_element.cc`. Historical superseded rows (note lines 29-40, SKILL lines 2217-2228) were not re-reviewed as current; the append at note "Round-20 falsification correction" and SKILL:2255-2256 explicitly supersedes them and its cited old-table line ranges are accurate (first old note row at 29, LC10-12 at 38-40; old SKILL rows 2217-2228).

Pinned-body identity: `sha256sum` of the retained file = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to `decisions.json` `source.sha256` and to the S096/S100 registry anchor digests (SOURCES.md:110,114). 1740 lines.

## Findings by severity

No critical, major, or minor findings. All three rows: **ENTAILED**.

### LC10 — ENTAILED (S096:320-327)
- Condition "passed its CurrentlyRunning guard at handler entry and reaches the resolved=false arm": guard is the single entry check at 295-297; the `else` (resolved=false) arm opens at 320. The row correctly scopes running state to handler entry and asserts nothing about state at line 322/324 execution time.
- Outcome "Contains a ReportException(value) call followed by a CallDoneCallback call": `V8ScriptRunner::ReportException(script_state->GetIsolate(), value.V8Value())` at 322-323 (value passed as argument); `CallDoneCallback` with `kToolInvocationFailed` and fixed literal `"respondWith promise was rejected"` at 324-326. Both are callsite statements; no effect claim about ReportException's sink — correct per the corrected wording.
- "The text is not the rejection value": the rejection reason is passed only to ReportException; the ScriptToolError carries the code plus the fixed literal (326). Literal quote verified as a substring of line 326, 4 words, inside the span.
- "Delivery is conditional as in LC07": CallDoneCallback's `done_callback_.is_null()` early return at 263-265. Method call is distinguished from stored-callback delivery. No runtime/capability claim.

### LC11 — ENTAILED (S100:787-815)
- Source authority: decisions row carries `sourceId: "S100"`; LC10/LC12 correctly inherit S096. Registry S100 (SOURCES.md:114) pins the same URL, tag, and digest `8c8d6796…6916` (same bytes as the retained body), anchor `html_form_element.cc:174-328,635-842` contains 787-815, teaches begins "supersedes S096 —", usedBy includes this note, status mined. S096's narrower anchors do not need to cover 787-815 because the row cites S100.
- Condition "post-dispatch declarative block with executing_tool still running": re-evaluation `declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning()` at 787-788 — correctly the post-dispatch (settlement-time) state, distinct from the entry snapshot at 720-722. "No promise taken": empty `TakeRespondWithPromise()` at 790. "should_submit=false": the `else if (!should_submit)` at 807. The condition states the branch predicate only; it does not equate an empty take with respondWith never having been called (the note's LC11 authority paragraph states this caveat explicitly).
- Outcome "Contains a CallDoneCallback call with kToolInvocationFailed and fixed site-programming-error text": lines 808-813; the fixed text spans the concatenated C++ literals at 810-813, and the row does not treat the multi-literal string as one source-line quote — its `quote` "The site has a programming error: it called" is a literal substring of line 810, 8 words, inside the span. "Whether the stored callback runs follows LC07; no CDP field or status claim" — accurate; no wire mapping asserted.
- Span note (not a defect): 787-815 also contains the promise-taken branch (790-806, including CHECK at 794 and the Then() binding at 798-806). The row uses "Contains" semantics with the condition selecting the programming-error arm, consistent with every other row's convention.

### LC12 — ENTAILED (S096:818-830)
- Condition "should_submit block reached; after ScheduleFormSubmission returns executing_tool is non-null and CurrentlyRunning, and the WebMCPEnabled CHECK passes": block opens at 818; `ScheduleFormSubmission(event, submitter)` at 824; post-return guard `executing_tool && executing_tool->CurrentlyRunning()` at 825; CHECK at 826. Correctly uses post-return (callback-time) state, not entry state.
- Outcome "Contains CallDoneCallback(base::ok(String())) at line 829": literal quote verified at line 829, 1 token, inside the span. "Not gated on a scheduling return value": `ScheduleFormSubmission` returns `void` (881-882), so no return value exists to gate on. The comment's navigation-trigger description (827-828) is attributed to the comment, not asserted as behavior. "Delivery follows LC07; no navigation, success, or CDP output guarantee": `base::ok(String())` is described as a null String internal value, not JSON null and not a wire result — matches source and the note's LC12 sentinel-scope paragraph.
- Assignment distinctions hold: direct callsites/assignments (818-829) are separated from ScheduleFormSubmission's unretained callee effects (its body lies outside the registered anchor ranges; the row and note both decline to infer its semantics). No runtime/capability claim.

### Cross-cutting mirror checks (all pass)
- decisions.json LC10/LC11/LC12 condition, outcome, and anchor are byte-identical to the corrected note table (rows at note lines 121-123) and the corrected SKILL table (rows at 2282-2284); anchors render `S096:320-327`, `S100:787-815`, `S096:818-830`; no pipe characters inside cells.
- S096 anchor `174-328,729-758,818-842` contains LC10's 320-327 and LC12's 818-830. Exactly one "corrected source-scoped (round 20)" heading exists in each of the note and SKILL.md.
- Handler-entry vs callback-time scoping is correct in all three rows (LC10 entry-guard; LC11 post-dispatch re-check; LC12 post-ScheduleFormSubmission guard).
- No new exploratory leads, vulnerability reproduction, or runtime observations introduced; evidence class stays source-only Chromium 154.0.8037.97.

## Residual risk
- LC10's "ReportException(value)" names the value argument but not the isolate argument; shorthand, asserts nothing false. Accepted.
- ReportException's behavior (where the reason surfaces) remains unclaimed — correctly outside the row; any future note text implying a sink for the rejection value would need its own retained evidence.
- LC12's ok(String()) sentinel-to-wire mapping remains an open gap, already declared as such by the note; no row depends on it.

## Verification gaps
- Counter (`measure-c1.mjs`), selftests, and gates were not run here, per round-20 instructions (main runs all gates after integration). All checks above are direct reads of the pinned bytes plus bounded string/line comparisons.
- `submitFromJavaScript` (834-843) and reset (1101-1105) produce further `CallDoneCallback` callsites; they are covered by the note's finite-sample caveat and are not rows — no action needed for LC10-LC12.

Trailer: `.ufo/waves/round-20/residual/ResidualRowsD.md` (relative to /home/vgpnk/Projects/shokunin/tabi-shokunin).
