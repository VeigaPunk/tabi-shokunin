# AttackLC12 — null String sentinel at S096:818-830

Round 20, wave 1, leaf attacker (author side). Source-only, Chromium 154.0.8037.97. No build, test, browser, or runtime run. No production edits. No tools installed or updated.

Pins checked:
- S096 `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines (= design pin). Round-19 `html_form_element.cc.gz` decodes to the same digest.
- Retained consumer bodies, each matching its registry row: `.ufo/waves/round-19/w2/SourceS079.model_context.body.gz` = `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` (SOURCES.md:56, S042); `.ufo/waves/round-19/w2/SourceS079.inspector.body.gz` = `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` (SOURCES.md:111, S097).

Axes attacked: (1) what the sentinel proves; (2) which paths produce it; (3) what a CDP or page caller can observe; (4) evidence class.

## Verdict

- The narrow claim holds. When the captured declarative tool is still running after `ScheduleFormSubmission` returns, S096:829 passes `base::ok(String())`, a null `String`. The span builds no JSON for it. The r19 note (`corpus/knowledge/webmcp-declarative-validation-round-19.md:129-131`) already says this.
- The design wording "scheduled navigation returns … sentinel" overstates. The callback does not depend on whether a navigation was queued.
- "Not JSON null" is a C++ statement only. Observable output is outside the span. The retained consumer suppresses the CDP `toolResponded` for this value. What the page receives is not established by the corpus.
- Scope: two producers (S096:829 and S096:841), and no autosubmit gate.

## Attack 1 (primary): sentinel means a navigation was queued and the landing document will answer

False stronger claim: "A scheduled navigation resolves the declarative call with the null String sentinel. The sentinel shows that a navigation was queued and that the landing document completes the call."

Why source defeats it:
1. The gate is running state, not scheduling. `ScheduleFormSubmission` is `void` (S096:882-883) and its outcome is discarded at S096:824. S096:825 tests only `CurrentlyRunning()`. S096:829 then completes with the sentinel.
2. `ScheduleFormSubmission` returns without queuing anything on these paths, and S096:829 still fires: not connected (893-899); `is_submitting_` (910-912); no `FormSubmission` (937-942); method=dialog, which calls `SubmitDialog` and returns (954-957); sandboxed (976-977); CSP form-action on javascript: actions (989-990); no target frame (1003-1004); navigation not allowed (1018-1019). Only S096:1041-1042 queues a navigation.
3. Removal race, no exotic input. A submit listener removes the form. `RemovedFrom` (518-523) calls `ScheduleDeclarativeWebMCPToolRegistration`, which unregisters synchronously (378-400) but skips `CallDoneCallback` while `IsHandlingSubmit()` (390-395). The flag is set for the dispatch (725-726; dispatch at 776). The captured `executing_tool` (720) stays running. `ScheduleFormSubmission` returns at 893-899, and 825-829 still resolve. [INFERENCE: `IsHandlingSubmit()` body not retained; read from its name and its use. Untested.]
4. Queued is not committed. S096:821-823 cancel the previously queued submission before a new one. An earlier sentinel's navigation can be cancelled before it commits. The S096 registry row says the same: the sentinel is "not an ordinary empty successful CDP payload or proof that navigation completed" (SOURCES.md:110).
5. Completion comes from the landing document, not from the sentinel. The old-document lambda skips `probe::WebMCPToolResponded` for a null String: "The new document will handle the response" (model_context.cc:728-734). A new document answers only if a navigation commits (comment 686-694; probe sites 656 and 665 in `GetCrossDocumentScriptToolResult`, 651-670). On paths 2 and 3 the retained source has no later emitter. [INFERENCE from retained source; untested.]

Acceptable wording (replaces "scheduled navigation returns …"):
> If the captured declarative tool is still `CurrentlyRunning()` after `ScheduleFormSubmission` returns (S096:824-825), S096:829 completes it with `base::ok(String())`, a null `String` sentinel. That shows only that the call reached S096:829 while running. S096 does not show that a navigation was queued, committed, or answered: `ScheduleFormSubmission` returns `void` and has early returns (S096:885-1019) that queue nothing. The comment at S096:827-828 states intent ("to indicate that a navigation has been triggered"), not verified behavior.

## Attack 2: "not JSON null" read as what the agent or page receives

False stronger claim: "The navigating call gives the agent or page a non-null result that is not JSON null (empty output, omitted output, or `{}`)."

Why source defeats it:
- S096 builds no JSON on this branch (S096:829). "Not JSON null" is a C++ type statement. S096 cannot describe CDP output.
- The old document's CDP emission is suppressed: `if (!result->IsNull()) probe::WebMCPToolResponded(...)` (model_context.cc:732-734). In the retained body, the `WebMCPToolResponded` probe sites are 656, 665, 733, and 865; the 865 site (`OnToolExecuted`) has only imperative callers (lines 290 and 319).
- Had a null String reached the emitter, the output would be `{}`, neither JSON null nor omitted. `ParseJSON(null)` returns `DictionaryValue::create()` (inspector_web_mcp_agent.cc:47-50), which `WebMCPToolResponded` uses (215-217). That branch is not reached here.
- "Omitted, not JSON null" (inspector_web_mcp_agent.cc:241-243; r19 note lines 134-135) is the failure path (`nullptr` output). Citing it for this success branch is an evidence-class error.
- Page side: the JS `executeTool` promise is `ScriptPromise<IDLNullable<IDLString>>` (model_context.cc:1071, 1118). `ExecuteScriptTool` forwards `result.value()` unchanged (912-914), and `OnExecuteScriptToolCompleted` resolves with it unchanged (1192-1193). Whether the browser replies at once or holds the reply, and the mojom type of `ExecuteScriptToolCallback`, are not retained. A null could reach the page as JS `null`, or as an empty string if the mojom field is non-nullable. Unresolved. The spec text declares `Promise<DOMString>` (SourceS087 body line 697); Blink declares it nullable.

Acceptable wording:
> S096:829 passes a null `String`: not an empty string and not a JSON value. The declarative consumer emits no `toolResponded` for it from the old document (model_context.cc:732-734). The retained corpus does not establish what a CDP client or page caller receives for this branch. S097's omitted-output rule is a failure-path rule and must not be cited for it.

## Attack 3: scope, "only autosubmit reaches S096:829" or "S096:829 is the only producer"

False stronger claim: "Only `toolautosubmit` forms reach the sentinel," or "S096:829 is the only producer."

Why source defeats it:
- No autosubmit gate. S096:720-722 captures any running tool for any `PrepareForSubmission`. S096:825 checks running state only.
- Non-autosubmit tools stay running while paused for the user (S096:212-217). A later user-initiated submit reaches the same branch. [INFERENCE: the user-activation call site is outside S096.]
- Second producer: `submitFromJavaScript` queues a submission (S096:835) and then completes the active running tool with `ok(String())` (839-841). It has no `should_submit` gate and no check that anything was queued. It sits inside the registry anchor (818-842) but outside the design span.
- Suppressed when reset (1101-1104) or cancel (224-229) completed the tool first.

Acceptable wording:
> Any `PrepareForSubmission` call while the declarative tool is running, autosubmit or user-submitted, reaches S096:825-829. `submitFromJavaScript` (S096:839-841) also resolves a running tool with the same `ok(String())`. Form reset (S096:1101-1104) or cancel (S096:224-229) completes the tool first, so no sentinel is delivered.

## Evidence-class traps (for integrator)

1. Comment as behavior. S096:827-828 is a comment of intent. The round-19 lesson's located quote "Return a null string" (`corpus/lessons/round-19.md:131`) comes from that comment. For the LC12 quote, use the code at S096:829: `executing_tool->CallDoneCallback(base::ok(String()));`.
2. Registry anchor gap. S042 (SOURCES.md:56) anchors `model_context.cc:528-580, 748-811, 856-873`. The declarative consumer that skips the `toolResponded` probe (695-746, especially 728-734) lies outside those anchors, though the body sha matches. Any LC12 wording that cites 728-734 needs an appended anchor row.
3. Stale summary in the r19 note. The S097 bullet (`webmcp-declarative-validation-round-19.md:132-135`) says success "parses JSON or falls back to a string". It omits the null-to-`{}` branch recorded in SOURCES.md:111 and `inspector_web_mcp_agent.cc:47-50`. Correct by appended note; historical bytes stay unchanged.
4. Comment versus code invariant. `model_context.cc:607-611` says a declarative tool's unregistration "immediately invokes its done_callback_". S096:390-395 and 448-451 skip that call during submit handling. Do not treat the comment as an invariant.
5. Null is not a universal sentinel. The imperative path replaces a null result with "Operation succeeded" (model_context.cc:287-289). The declarative path skips the probe (728-734). Open risk: `HandleWebMcpToolResponse` passes `result` after `value.ToString(result)` whose return value is ignored (S096:316-319). If `ScriptValue::ToString` can leave it null for a non-object resolved value, a `respondWith` resolution hits the same classifier and emits no `toolResponded`. The `ToString` body is not retained; not resolved here.
6. Runtime artifact is not LC12 evidence. Round-17 `invoke-declarative-navigation-result` (`corpus/evidence/round-17/webmcp-invoke/receipt.json:8357-8408`, supplementary, status pass) records `Completed` with the landing document's JSON array and `navigationEvents: 1`. That fits trap 5 and Attack 2. Cited as an existing receipt; not re-run; not admitted to LC12.

## Acceptable LC12 row (source-only)

```
| LC12 | should_submit true (S096:818) and the captured declarative tool still CurrentlyRunning() after ScheduleFormSubmission returns (S096:824-825); not reached if reset or cancel completed the tool first (S096:1101-1104, 224-229) | S096:829 completes the tool with base::ok(String()), a null String sentinel; no JSON value is built on this branch; the sentinel is not evidence that a navigation was queued, committed, or answered | S096:818-830 (code quote, line 829: executing_tool->CallDoneCallback(base::ok(String()));) |
```

## Adjacent (not LC12; for later rounds)

- Early returns in `PrepareForSubmission` complete no running tool: S096:642-648 (not connected), 650-660 (sandboxed), 663-682 (unclosed controls, flag-gated). Any "every running declarative tool completes" wording is contradicted within S096. Reachability not checked.
- Form reset (1101-1104) and submit-from-JS (839-841) are already on the scribe's candidate list.

## Not verified (declared)

`IsHandlingSubmit()`, `CurrentlyRunning()`, `ScriptValue::ToString`, the `ExecuteScriptToolCallback` mojom, the user-activation call site, and browser-side reply handling are not in the retained corpus. Every claim that depends on them is marked [INFERENCE].

## Checks run (read-only)

- sha256 of S096, the round-19 S096 gz, the S097 body, and the S042 body: all match their pins.
- Reads of S096 and of the retained model_context and inspector bodies; registry, note, lesson, and receipt reads.
- No build, test, browser run, or tool install. This file is the only write.

For main (not run here): the new LC12 row's quote must be a literal within 818-830 (line 829 qualifies). Registry anchor and r19 correction are appended, not in-place edits.
