# SourceLC12 — scheduled navigation returns a null String sentinel, not JSON null

Scope: LC12, span `S096:818-830`, Chromium 154.0.8037.97. Source-only; not runtime-observed; no URL fetched; no tests, builds, or tool installs.

## Provenance
- Pinned file `corpus/evidence/round-20/sources/html_form_element.cc`: `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (matches the design pin), 1740 lines.
- Same digest as the retained S078 body `.ufo/waves/round-19/w2/SourceS078.body.gz` (`zcat | sha256sum`).
- Downstream consumers come from retained bodies, not from the round-20 pin:
  - `.ufo/waves/round-19/w2/SourceS079.model_context.body.gz`, decoded `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` (same as the round-17 `BlinkInvoke.md` anchor).
  - `.ufo/waves/round-19/w2/SourceS079.inspector.body.gz`, decoded `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` (same as the S097 registry row).

## Verdict
- Null String sentinel: **confirmed** from the pinned span.
- Not JSON null: **confirmed at the Blink callback boundary**. The contrast itself is my inference: the span builds no JSON value, and the retained downstream bodies do not turn the sentinel into JSON null.

## Condition and outcome
- **Condition**, all required:
  1. `should_submit` is true at 818. It is set false when interactive validation fails (729–730). Otherwise it is `DispatchEvent(*submit_event) == kNotCanceled` (776).
  2. `executing_tool` is non-null and `executing_tool->CurrentlyRunning()` is still true at 825. `executing_tool` is captured at 720 from `active_webmcp_tool_`. The check runs after `ScheduleFormSubmission(event, submitter)` at 824.
  - The `CHECK(WebMCPEnabled)` at 826 is an assertion, not a branch.
- **Outcome**: 829 `executing_tool->CallDoneCallback(base::ok(String()));` reports success with a null `WTF::String` payload.
  - `HTMLFormMcpTool::CallDoneCallback` (261–267) returns at once when `done_callback_` is null (263–264). Otherwise it forwards `result` unchanged (266) and sets `is_currently_running_ = false` (267).
  - Timing: the tool completes at scheduling time. `ScheduleFormSubmission` returns a cancel handle (1041–1042), so the navigation is scheduled, not complete.
- Span composition: 818 gate, 821–823 cancel the previous submission, 824 schedule, 825–829 decision. The round-20 checklist's "818-824 is the gate" is loose.

## Quote (≤25 words)
- Lines 827–828 (`//` markers omitted): "Return a null string to indicate that a navigation has been triggered." (12 words)
- Corroboration, retained downstream body (outside the span): "A null string indicates a cross-document navigation, in which case we don't want to emit a toolResponded event here." (19 words, `ModelContext::ExecuteDeclarativeTool` callback)

## What "not JSON null" rests on
- The span constructs no JSON value. The payload is `String()`.
- Declarative consumer (retained `model_context.cc`): `if (!result->IsNull()) probe::WebMCPToolResponded(...)`. No `toolResponded` is emitted for the sentinel. The done callback still receives the null String.
- If an emitter receives a null String anyway (retained `inspector_web_mcp_agent.cc`, `ParseJSON`: `if (!value) return protocol::DictionaryValue::create();`), the output is `{}`. It is neither JSON null nor omitted.

## Caveats
1. Source-only and untested at runtime. The file never states "not JSON null"; that half is my reading.
2. A null String is not proven unique to navigation. In `HandleWebMcpToolResponse`, lines 316–319 run `if (result.IsNull()) value.ToString(result);` and then `CallDoneCallback(result)` for resolved non-object values. If `ScriptValue::ToString` can leave `result` null, a respondWith value would reach the same navigation classifier. That definition lies outside the pinned file and was not opened.
3. No sentinel when `done_callback_` is null (263–264) or the tool is no longer running at 825. Abort (`CancelTool`, 224–228) and form reset (1101–1105) each call `CallDoneCallback(kToolCancelled)` earlier, which clears running.
4. Line 841 (`submitFromJavaScript`) returns the same `ok(String())` for `form.submit()`. It is outside 818–830 and must not inherit LC12.
5. The JS API `executeTool` has return type `ScriptPromise<IDLNullable<IDLString>>` (round-16 binary symbol, `.ufo/waves/round-16/w1/RevengeBinary.md:327`). A null String may therefore surface to script as IDL `null`. That is JS null, not the CDP JSON field. Not verified against a source body here.

## Does the existing r19 note already hold it?
- **Null String half: yes.** `corpus/knowledge/webmcp-declarative-validation-round-19.md:129–131`: "Navigation's callback uses a null String sentinel; a source return is not evidence of completed navigation or an ordinary empty CDP output." Also `corpus/SOURCES.md` S096 row (line 110) and `.ufo/waves/round-19/w2/SourceS078.md:71`.
- **Not-JSON-null half for S096: no.** The knowledge note's only "not JSON `null`" line (135) concerns S097 failure output.
- r19 gaps, to correct by append elsewhere (historical bytes unchanged):
  - a. `SourceS078.md:73` leaves "the exact transport treatment of the null-string sentinel" unresolved. The retained model_context body above resolves the declarative probe suppression.
  - b. The S097 bullet (knowledge note 132–135) says success "parses JSON or falls back to a string" and omits the null String → `{}` branch. `SourceS079.md:72` records that branch.

## Proposed LC12 row (for the integrator; not written to the manifest)
| ID | condition | outcome | span |
|---|---|---|---|
| LC12 | `should_submit` true and the declarative tool still running after `ScheduleFormSubmission` | `ok(String())`: null String sentinel for scheduled navigation; tool completes at scheduling time; no `toolResponded` on the declarative path; not JSON null | S096:818-830 (quote 827-828) |
