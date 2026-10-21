# AttackLC08: late response ignored when tool not running (S096:290-298)

Lane: TabiR20.AttackLC08 (reviewer, leaf, no subagents).
Scope: bounded, source-only semantic review of the `!CurrentlyRunning()` guard in `HTMLFormElement::HandleWebMcpToolResponse`. Per the parent's IRC: no reproduction, no re-invocation or exploit workflow, no identity or race claim. Source-only; nothing runtime.

## Verdict

- Supported as a running-state condition: when the tool object bound to a respondWith reaction is not running at reaction time, S096:295-297 returns before any callback, state write, or exception report.
- Not supported in any broader form. The guard does not report late rejections, does not imply a cause, and says nothing about invocation identity or stale-callback safety.

## Source facts (S096)

Pin check: `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines, matches `design.json`. The file is untracked in git (`??`).

- 294: `CHECK(tool);` is a fatal invariant (Chromium CHECK semantics; macro not in S096). It is not an ignore branch.
- 295-297: `if (!tool->CurrentlyRunning()) { return; }` is the only ignore branch. It precedes `if (resolved)` (298), so resolve and reject take the same path.
- The early return skips value conversion and `JSON::Stringify` (298-318), every `CallDoneCallback` (308-311, 319, 324-326), and `V8ScriptRunner::ReportException` (322). It writes no tool state.
- The guard runs when the reaction bound at 798-806 executes (`Then`, `WrapPersistent(executing_tool.Get())`, `resolved` true or false). It does not run at the moment the promise resolves. The reaction-timing rule is standard Promise semantics, not S096 text, and was not measured.
- The guard reads only the running state of the bound object. The handler signature (290-293) takes no invocation id, and the bind (798-806) passes none. `invocation_id_` is written at 178 and cleared at 270. S096 reads it only through the `InvocationId()` accessor at 170; that accessor is defined outside S096.
- `CurrentlyRunning()` is not defined in S096. Its call sites are 164, 169, 295, 722, 788, 825, and 839. No header is retained: the corpus holds only `round-20/sources/html_form_element.cc` and the round-19 `.cc` and `form_mcp_schema` gz files. Equating it with `is_currently_running_` (set at 204, cleared at 267) is [INFERENCE] from the name.
- Branch scope: the bind happens only if the tool is still running after dispatch (787-789). If it is not, no promise is taken and this handler is never called. That is a different branch and is not LC08 evidence.
- Running state is also cleared outside this guard, by these paths: CancelTool 224-229; reset 1101-1105; registration cancel 390-395 and 448-452 (gated by `IsHandlingSubmit()`, defined outside S096); successful completion 825-829; `submitFromJavaScript` 839-841. The row must not name any of them.

## Attacked claims

1. Primary (false, stronger): "Late responses are ignored when the tool is not running, and late rejections still surface as errors."
   Why S096 defeats it: the rejection path's `ReportException` (322) and its `kToolInvocationFailed` callback (324-326) come after the guard's `return` (295-297). The ignored path reports nothing and calls no callback. The LC10 wording ("exception reported; kToolInvocationFailed") must not be carried into LC08.

2. Cause: "ignored because cancelled, unregistered, reset, or completed." The guard tests running state only. Every path listed above can clear it; none is a guard condition.

3. Timing: "a response that resolved before the tool stopped is delivered." The guard runs at reaction time (798-806 into 295). Resolve-time wording is not supported.

4. Null tool: "a null tool is ignored." Line 294 is a fatal CHECK, not an ignore.

5. Identity and staleness: "settlements from another invocation are ignored," "stale-callback safe," or "invocation identity checked." Not claimed. S096 has no identity check at this guard (295; bind 798-806). Reachability is an unverified lead and out of scope here.

6. Page or DevTools: "the page or DevTools sees nothing." Outside S096. Only "this function emits no ReportException" is supported.

7. Timeout: "late" must not mean timeout. S096 has no timer, deadline, or PostDelayed (grep: no matches).

8. Unregistration as a guard condition (ConnPlanner.md:50 "arriving after tool completion or unregistration"; ConnEvidence.md:44 "after tool completion, cancel, or unregistration"). The guard does not test registration. Registration cancels only outside the submit-dispatch window (390, 448 gating). Not analysed further.

## Exact acceptable wording

Row (one line, no pipes inside cells):

```
| LC08 | tool not running (`CurrentlyRunning()` false) when the bound respondWith reaction runs | returns before resolve/reject handling: no callback, no state change, no ReportException from this function, for resolve and reject alike | S096:290-298 |
```

Quote (whitespace-normalised literal, 5 tokens, lines 295-297; do not extend to 298, which starts LC09):

```
if (!tool->CurrentlyRunning()) { return; }
```

Caveat (one sentence):

```
Source-only (S096, Chromium 154.0.8037.97, sha256 8c8d6796...); not runtime-observed; CurrentlyRunning() is declared outside S096; this row states a running-state condition only, with no claim about invocation identity, stale-callback safety, causes, or page-visible effects.
```

Prose sentence, if the note needs one:

```
When the tool object bound to a respondWith reaction is not running at reaction time, HandleWebMcpToolResponse returns before either branch (S096:295-297); this path invokes no callback, changes no tool state, reports no exception, and serializes no value.
```

## Evidence class and caveats

- Runtime: none for LC08. I searched `corpus/evidence/round-17`, `round-18`, `round-19`, and `corpus/knowledge` for the cancel and reject strings. The only hits were source-recheck S042 and round-19 w2 source audits; no runtime receipt matched. No late-settlement case was exercised. Everything runtime is untested.
- Existing r19 material: `corpus/knowledge/webmcp-declarative-validation-round-19.md` does not hold LC08. Its only S096 text (lines 129-131) concerns the navigation null-String sentinel. The round-19 audit `.ufo/waves/round-19/w2/SourceS078.md:70` holds the condition unqualified ("Settlement is ignored when the tool is no longer running"). It is acceptable only with the reaction-time and running-state qualifier above, and it is an audit row, not runtime evidence.
- Span overlap: the LC08 span (290-298) shares line 298 with LC09 (`if (resolved) {`). Quote only from 295-297.
- Cross-row: LC09 and LC10 apply only after this guard passes. Their rows should say so.
- Comments are intent, not behavior. 777-780 says no reaction follows a dispatch-time disconnect, but 787-788 binds on `executing_tool->CurrentlyRunning()` regardless. Do not cite 777-786 as LC08 evidence. 837-838 ("from inside a submit handler") does not match the unconditional test at 839. Cite the code.
- Wording elsewhere in the wave to replace: ScribeFrontier.md row 50 "response arrives after the tool stopped running" becomes "bound reaction runs while tool not running". ConnPlanner.md:50 and ConnEvidence.md:44 (see Attacked claim 8) are not guard conditions.

## Open leads (unverified, out of scope, no claim)

- Whether a settlement can reach the guard while the same tool object is running another invocation (identity or race reachability). Not analysed.
- Whether a tool unregistered during submit dispatch stays running (390, 448 gating versus 787-788), and whether `ModelContext::UnregisterTool` (outside S096) cancels it. S096 alone does not settle this. The comment at 777-780 and the code at 787-788 disagree as written.

## Verification exercised

- `sha256sum` and `wc -l` on S096 (match pin). `git rev-parse HEAD` = c49929430d996b016dde2e3a3a5be380f3433fdb (baseline). `git status --porcelain` (S096 untracked).
- Reads: S096 174-229, 261-275, 290-328, 353-473, 486-525, 635-863, 1077-1110; r19 note 1-157; `w2/SourceS078.md` 58-75.
- Searches: `CurrentlyRunning` / `IsHandlingSubmit` / `UnregisterTool` call sites; timer patterns (none); invocation-id reads; cancel and reject strings across corpus evidence and knowledge (no runtime hit); header definitions (none retained).
- Not exercised: build, browser, CDP, fixtures, any runtime.

## Changes

- Wrote only this report. No tool installs or updates. Read-only git and checksum commands only. No production edits, no commits.
