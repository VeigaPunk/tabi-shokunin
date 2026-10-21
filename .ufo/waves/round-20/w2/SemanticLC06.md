# SemanticLC06 — LC06 predicate/effect check (round 20, source-only)

- Seat: TabiR20.SemanticLC06 (leaf; no dispatch). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Source S096, Chromium 154.0.8037.97. Source-only; no runtime claim; no change to the 12-row count or any scalar.
- Targets: `corpus/evidence/round-20/lifecycle/decisions.json:51-58` (LC06); `corpus/knowledge/webmcp-completion-lifecycle-round-20.md:34` (row), `:61` (checklist item 4), `:68`, `:77`, `:82`; `SKILL.md:2222` (row), `:2209-2213` (framing), `:2230-2237` (usage, scope).
- Anchor: `corpus/evidence/round-20/sources/html_form_element.cc:224-229`, callee `261-275`.
- Axes: (A) predicate completeness; (B) effect fidelity; (C) callback/null guard; (D) trigger/callsite; (E) sample and scope disclosure; (F) citation integrity.
- Verdicts: ENTAILED / REWRITE / NOT-ENTAILED / UNRESOLVED, one per field. Field verdicts are not summed.

## 0. Pins and drift

- `sha256` of the retained body = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to the pin at `decisions.json:7` and `knowledge note:1`. `git show 4ae99816…:corpus/evidence/round-20/sources/html_form_element.cc | sha256sum` gives the same value; `git cat-file -t 4ae99816…` = commit. **ENTAILED.**
- Working-tree digests equal the `4ae99816` blobs: `decisions.json` `da42e495…`, knowledge note `3ac83d0a…`, `SKILL.md` `a2653f45…`. No drift since the checkpoint.
- LC06 condition and outcome strings are identical in `decisions.json:53-54`, `note:34` and `SKILL.md:2222` (exact-substring match in all three).

## 1. Body facts (retained `html_form_element.cc`)

| Lines | Fact |
|---|---|
| 174-203 | ExecuteTool preamble. `invocation_id_` written at 178; fill error returns at 196-198. No read of `is_currently_running_` before 204. |
| 204, 210 | `is_currently_running_ = true` and `done_callback_ = std::move(done_callback)`. The only writers in the retained body. |
| 217 | `context->PauseExecution()` (LC04 branch). No Resume or Unpause call anywhere in the body. |
| 224-229 | CancelTool. `CHECK(is_currently_running_)` (225); `CallDoneCallback(base::unexpected(ScriptToolError(kToolCancelled, "Tool execution cancelled by abort signal")))` (226-228). |
| 261-275 | CallDoneCallback. `if (done_callback_.is_null()) return;` (263-265); `std::move(done_callback_).Run(result);` (266); `is_currently_running_ = false;` (267); active submit button and `invocation_id_` cleared (268-270); PseudoStateChanged (271-274). |
| 224 | CancelTool occurs once in the retained body. No in-body caller. |
| 163-172 | Accessors gated on `CurrentlyRunning()`. |
| 391-394, 449-451, 1101-1105 | Other `kToolCancelled` producers: invalid-form path, replacement path, form reset. Each calls CallDoneCallback directly; none goes through CancelTool. |
| 228 | "abort signal" appears only as message text. No abort-signal handling in the body (hits at 203, 602, 892 are comments or unrelated). |

Callsite vs effect, in one line: the in-body effect of the call at 226 matches the row's literal text (F6). The row's implicit claim that a cancel reaches the tool's callback is conditional (F5, F9). The trigger is outside the anchor (F12).

## 2. Field verdicts: LC06 (`decisions.json:51-58`; identical at `note:34` and `SKILL.md:2222`)

| # | Field | Verdict | Reason |
|---|---|---|---|
| F1 | startLine 224, endLine 229; anchor `S096:224-229` | ENTAILED | 224 is the signature, 229 the closing brace. The span is the function. |
| F2 | quote "Tool execution cancelled by abort signal" | ENTAILED | Literal substring of 228; 6 words (limit 25). Coverage gap: the quote anchors only the message. The CHECK (225) and `kToolCancelled` (227) are unquoted. |
| F3 | condition "CancelTool is called" | ENTAILED as entry | 224 is the entry point. Its caller is UNRESOLVED (F12). |
| F4 | condition "(it CHECKs is_currently_running_)" | REWRITE | 225 is a CHECK, so the text is accurate. The row does not say the outcome holds only when the CHECK passes. A failing CHECK does not reach 226. Chromium CHECK termination is external (base/check.h, not retained) [INFERENCE]. |
| F5 | row as sufficient condition: "CancelTool is called" implies kToolCancelled reaches the callback | NOT-ENTAILED | Delivery requires `done_callback_` non-null (263-266). See F9. |
| F6 | call argument: kToolCancelled with the message | ENTAILED | 226-228 pass `base::unexpected(ScriptToolError(kToolCancelled, msg))`. |
| F7 | outcome verb "CallDoneCallback runs" | REWRITE | CallDoneCallback is a helper (261). The stored callback runs only when `done_callback_` is non-null (263-266). Read as "the done callback runs", the sentence is NOT-ENTAILED unconditionally. |
| F8 | running-state effect of the cancel | REWRITE (omitted) | On the delivery path, 267-274 clear `is_currently_running_`, `active_submit_button_` and `invocation_id_`, and fire PseudoStateChanged. Note `:9` says each row states its effect on running state and done callback. LC06 states neither. |
| F9 | callback / null guard | REWRITE (omitted) | 263-265 is the only guard. LC07 (`note:35`) documents it; LC06 does not cross-reference it. |
| F10 | entry-time predicate stability | ENTAILED | No statement between 225 and 226 writes `is_currently_running_` (argument construction only). `done_callback_` is checked at 263 with no intervening write. |
| F11 | where entry predicates are established | REWRITE (omitted) | `is_currently_running_` and `done_callback_` are set at 204 and 210 in ExecuteTool, outside this span. The LC02 row names its outside-span write (`note:30`, line 178); LC06 names neither. |
| F12 | trigger / callsite of CancelTool | UNRESOLVED | No in-body caller. The only pointer is r19 `.ufo/waves/round-19/w1/SrcCdpToolResponded.md:38`: declarative cancel delegates to `DeclarativeTool()->CancelTool()` at model_context.cc:613-619. That same note says it does not establish that the declarative path reaches kToolCancelled. model_context.cc is not retained in round 20. Round-18 `S042.excerpt.txt` is the ExecuteV8Tool window with no CancelTool text. |
| F13 | "by abort signal" as the cause | UNRESOLVED (message text ENTAILED) | The message is a constant (228). The body has no abort handling. Any abort trigger is outside the anchor. |
| F14 | effect on the LC04 PauseExecution | UNRESOLVED | No undo of 217 in the retained body. LC06 makes no claim here. Disclose if the note discusses pause. |
| F15 | scope of the decision row | ENTAILED | One function path. The row claims no exhaustive coverage. |
| F16 | sample scope for the cancel class | REWRITE (see below) | Three other `kToolCancelled` producers exist (391-394, 449-451, 1101-1105). None is in the twelve rows. |

Per-artifact verdicts (fields listed, not totalled):

- `decisions.json:51-58`. Condition: REWRITE (F4, F11), with F5 NOT-ENTAILED for sufficiency. Outcome: REWRITE (F7, F8, F9). Anchor and quote ENTAILED (F1, F2). Entry stability ENTAILED (F10). Callsite UNRESOLVED (F12).
- `knowledge note:34`. Same text as `decisions.json`; same field verdicts.
- `knowledge note:61` (checklist item 4: "Cancel (LC06): kToolCancelled with the abort-signal message."). **REWRITE.** It states the outcome without the `done_callback_` condition. That conflicts with `note:68` ("Completion bookkeeping (LC07) runs only when a done callback exists"). The label "Cancel" reads as the whole cancel class (F16).
- `knowledge note:77`, History LC06 bullet:
  - "observed cancelInvocation on a pending imperative slow-echo call → Canceled, errorText empty": **ENTAILED** by `corpus/evidence/round-17/webmcp-invoke/receipt.json:7997-8033` (toolName `slow-echo`; fixtureFile `invoke-imperative.html`; responded status `Canceled`, `errorText ""`). Dossier: `.ufo/waves/round-17/w1/C2Harness.md:65-66`.
  - Citation `receipt.stdout.txt:13`: **REWRITE.** That line reads only `WEBMCP_INVOKE_CONTROL id=invoke-cancel status=pass`. Cite `receipt.json:7997-8033`.
  - "not the declarative CancelTool path; no runtime witness for it": **ENTAILED.** The fixture is imperative, and no reviewed round-17 receipt has a declarative cancel case.
- `knowledge note:82` ("No new runtime witness … declarative CancelTool path of LC06"): **ENTAILED** as a scoped statement.
- `SKILL.md:2209-2211` framing ("assuming this internal declarative-tool path is reached"): **ENTAILED.** It does not discharge F12.
- `SKILL.md:2236-2237` ("Reset/removal/re-registration … remain outside the sample"): **ENTAILED.** The knowledge note Limits (`note:84-90`) has no equivalent sentence. **REWRITE:** add it to the note.
- `SKILL.md:2230-2234` usage paragraph cites LC07-10 ordering and the not-running guard but not LC06. The cancel path shares the callback-before-reset ordering (LC07). Optional cross-reference, **REWRITE (minor).**

## 3. Falsification attempts

- **A1** "CancelTool implies kToolCancelled reaches the done callback." **Falsified** on two branches: (i) the CHECK fails and 226 is not reached; (ii) `done_callback_` is null and CallDoneCallback returns at 263-265. Only the CHECK-pass plus non-null branch delivers. See F4, F5, F9.
- **A2** "`done_callback_` is null while running." In the retained body this occurs only during the stored callback's own execution (after the move at 266, before 267). A nested CancelTool there passes 225, returns at 263, and does not redeliver. Re-entrancy is not reproduced and is out of scope. "Moved-from is null" relies on base::OnceCallback semantics (external, not retained) [INFERENCE].
- **A3** "The cancel clears running state." Holds only on the delivery path (267). Not stated in LC06. See F8.
- **A4** "CancelTool is the only kToolCancelled path." **Falsified.** 391-394, 449-451 and 1101-1105 call CallDoneCallback directly with kToolCancelled. See F16.
- **A5** "The message text is exact." **ENTAILED.** Character-identical at 228.
- **A6** "A caller guarantees the running precondition." The caller is outside the anchor. The CurrentlyRunning()-gated accessors (163-172) suggest the intended guard, but the caller is not retained. **UNRESOLVED.**
- **A7** "A second CancelTool after completion yields a second kToolCancelled." **Falsified by the body.** 267 clears the flag, so a later CancelTool fails the CHECK at 225 and does not redeliver. The row does not say this. Whether any caller can make such a call is UNRESOLVED; not reproduced.

## 4. Prior observations: preserved, not erased or overturned

- **r17 `invoke-cancel`** (imperative slow-echo → Canceled, errorText ""): `receipt.json:7997-8033`. Source-only LC06 concerns the declarative `HTMLFormMcpTool::CancelTool`. The observed path is the imperative ModelContext::CancelTool (r17/r19 notes). The paths differ; nothing is contradicted.
- **Untested prediction** [INFERENCE, not an observation]: a declarative cancel that reached the CDP emitter would forward `error.message` (r19 `SrcCdpToolResponded.md:33`; inspector_web_mcp_agent.cc:241-243), so a non-empty errorText would be expected. The r17 empty errorText does not contradict this.
- **r17 unregistration** (`SKILL.md:1957`; `corpus/knowledge/webmcp-invocation-round-17.md:74`; `.ufo/waves/round-17/w1/C2ProbeLifecycle.md:44-47`): case `invoke-unregister-while-pending` (`.ufo/waves/round-17/probes/invoke-lifecycle.mjs:541-544`) invokes `slow` and aborts its registration. It is an imperative case with no form element. It does not probe the declarative paths at 391-394 and 449-451. The unscoped line `SKILL.md:1957` should not be read as covering declarative tools. Adjacent to LC06; not a verdict on it.
- **r16** `.ufo/waves/round-16/w1/RevengeBinary.md:305` and **r17** `.ufo/waves/round-17/w1/RevBinaryInvoke.md:52`: the literal string is present in build binaries. Presence only; not path reachability.
- **r19** `SrcHtmlFormTool.md:18` (224-229) agrees with the body. `:23` (cites 390-396, 447-455) and `:28` (cites 1101-1105) agree with the body. The `SrcCdpToolResponded.md:38` caveat remains open (F12).

## 5. Out of scope or unverified leads (not analysed further)

- ExecuteTool has no running-state read before 204 (174-203). A second ExecuteTool during a run would overwrite `done_callback_` at 210. The caller-side guard is outside the anchor.
- LC02 path: `invocation_id_` is written at 178, then the fill error returns at 196-198 with `is_currently_running_` never set. A CancelTool on that state would fail the CHECK. Reachability not analysed.

## 6. Recommended wording (for main; nothing applied)

- **Condition:** "CancelTool is called. CHECK(is_currently_running_) at line 225 must pass. is_currently_running_ is set at line 204 in ExecuteTool, outside this span."
- **Outcome:** "CancelTool passes kToolCancelled with the message 'Tool execution cancelled by abort signal' to CallDoneCallback (226-228). CallDoneCallback invokes the stored done callback only if done_callback_ is non-null (263-266), then clears is_currently_running_, the active submit button and invocation_id_, and fires PseudoStateChanged (267-274). The caller and the trigger are not in the excerpt."
- **Checklist item 4:** "Cancel via CancelTool (LC06): kToolCancelled with the abort-signal message, delivered only when the stored done callback is non-null (LC07). Other kToolCancelled producers (S096:391-394, 449-451, 1101-1105) are outside the twelve rows."
- **History citation:** `receipt.json:7997-8033`.
- **Limits:** add the `SKILL.md:2236-2237` sentence (reset/removal/re-registration outside the sample) and name the three other producers.
- **Application:** `decisions.json` and the note are committed at `4ae99816`. Per the wave contract (historical knowledge bytes unchanged; corrections append elsewhere), apply these as an erratum or append, or as main's pre-lesson edit. Do not apply them as a silent byte change.

## 7. Limits, verification gaps, tooling

- Source-only. No runtime observation is claimed. No tests, selftests, builds or edits were run. This report is the only write.
- Not retained in round 20: model_context.cc (F12); base/check.h and base::OnceCallback semantics (external, [INFERENCE]).
- Tools installed or updated: none.

Report: .ufo/waves/round-20/w2/SemanticLC06.md
