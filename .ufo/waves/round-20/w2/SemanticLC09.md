# SemanticLC09 — round 20 LC09 predicate/effect attack

Lane: tabi-shokunin, round 20, wave w2. Leaf member, no dispatch. Author-side finding, not external closure.
Scope: LC09 only. Source-only, Chromium 154.0.8037.97 (tag), V8 at the Chromium-pinned revision `b3d6849efaf11696198e15b32290e6d6b0d540c1` (DEPS:348). No runtime claim. No tests, builds, or reproduction. No production edits; this report is the only file written.

Target row: LC09, `corpus/evidence/round-20/lifecycle/decisions.json:75-82` (condition 77, outcome 78, span 79-80, quote 81); `corpus/knowledge/webmcp-completion-lifecycle-round-20.md:37` (checklist item 5 at :62); `SKILL.md:2225`; `.ufo/waves/round-20/lifecycle-skill-section.txt:15` (checklist :28); `.ufo/waves/round-20/design.json:89-96`. Span S096:298-319.

Legend, applied per field and never summed: ENTAILED = the retained source, plus the pinned primary sources cited, establishes the claim as written. REWRITE = true in part, or needs wording, anchor, or precondition change. NOT-ENTAILED = not established as written. UNRESOLVED = depends on material outside the retained body and the pinned sources, or on runtime.

## 1. Identity and integrity

- Retained body `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796d17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Matches `decisions.json:7`, `design.json:19`, knowledge `:1`.
- `git rev-parse HEAD` = `4ae99816b8994fdedc159156d8d9d242dd5c4782`. The blob of the retained body at that revision hashes to the same value. `git diff --quiet 4ae99816 --` over the four LC inputs (body, decisions.json, knowledge doc, SKILL.md) is clean.
- The LC09 condition and outcome text is identical in `decisions.json:77-78`, knowledge `:37`, `SKILL.md:2225`, and `lifecycle-skill-section.txt:15`. Span 298/319 is identical in `decisions.json:79-80` and `design.json:92-95`.
- Quote `could not be serialized to JSON` is a literal substring of body line 311, inside 298-319, 5 whitespace words (limit 25).

## 2. Path traced

Registration, in `PrepareForSubmission`:
- 696-697: `bool should_submit;` and `Member<HTMLFormMcpTool> executing_tool;`.
- 720-722: `executing_tool = active_webmcp_tool_;` then `declarative_webmcp_call` is computed from `CurrentlyRunning()`.
- 787-789: after `DispatchEvent`, `declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning();`, then `if (declarative_webmcp_call) {`.
- 790: `if (auto promise = submit_event->TakeRespondWithPromise()) {`.
- 794: `CHECK(!should_submit);`.
- 798-806: `std::move(*promise).Then(BindOnce(HandleWebMcpToolResponse, this, tool, /*resolved=*/true), BindOnce(..., /*resolved=*/false));`.
- 818-829 (LC12 block, under `if (should_submit)`) is not reachable on this path, because 794 forces `should_submit` false.

Settlement, in `HandleWebMcpToolResponse` (290-328):
- 294-297: `CHECK(tool);` then `if (!tool->CurrentlyRunning()) return;`. This is the only running check on the settlement path.
- 298: `if (resolved) {`. 300: `if (value.IsObject()) {`.
- 301: `v8::TryCatch try_catch(...)`, never queried.
- 303-304: `if (v8::JSON::Stringify(...).ToLocal(&json_string)) { result = ...; } else {`.
- 308-312: `tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise resolved with an object that could not be serialized to JSON"))); return;`.
- 316-319: fallback `value.ToString(result)` and success `tool->CallDoneCallback(result)`. Not reached on LC09.

Callback, `CallDoneCallback` (261-270): `if (done_callback_.is_null()) return;` at 263-265, then `std::move(done_callback_).Run(result);` at 266, then `is_currently_running_ = false;` at 267, then the reset.

Header, `html_form_element.h` (fetched at the 154.0.8037.97 tag): 271-272 `McpToolCallbackResult`; 319 `bool CurrentlyRunning() const { return is_currently_running_; }`; 350 `base::OnceCallback<...> done_callback_`.

## 3. Field verdicts (not summed)

| # | Field of LC09 | Anchor | Verdict | Reason |
|---|---|---|---|---|
| F1 | Entry predicate: tool CurrentlyRunning at settlement | 295-297; h:319 | ENTAILED | Checked once, on entry. It tests the tool flag, not the invocation (see section 4). |
| F2 | Word "still" read as state at the callback | 295 to 308; json-stringifier.cc:747-758 | NOT-ENTAILED | No re-check between 297 and 308. The `JSON::Stringify` call before 308 runs author toJSON, getter, and proxy code, so the state at 308 is not established. |
| F3 | Anchor S096:298-319 covers the predicate | 295-297 and 790-806 are outside the span | NOT-ENTAILED (coverage) | The only settlement running check and the `resolved=true` binding sit outside the cited span. Keep the manifest span (design fixes spans); cite the extra lines in the text. |
| F4 | "the respondWith promise resolves" | 802, 806; script_promise.h:282-299 | ENTAILED | Fulfilled handler is bound with `resolved=true`. Typed `Then(on_fulfilled, on_rejected)` order confirmed. The BindOnce overload is not retrieved (L4). |
| F5 | Upstream reachability: declarative submit with a taken promise | 720-722, 787-794 | REWRITE | Row omits that the arm exists only inside `PrepareForSubmission`'s declarative branch, after respondWith yields a promise (CHECK at 794). Nothing in this branch references toolautosubmit. |
| F6 | "resolves with an object" | 300; script_value.h:137-141 | ENTAILED | `IsObject()` is `!IsEmpty() && value->IsObject()`. Callables are objects here (see F8). |
| F7 | "v8::JSON::Stringify(...).ToLocal(...) returns false" | 303-304, 307; v8 api.cc:3546-3568 | ENTAILED | At b3d6849e, an empty result comes from the JsonStringify exception (api.cc:3563-3565) or an API early return (3552-3556; PrepareForExecutionScope not fetched). JSON-undefined results do not return empty (F8). |
| F8 | Limit: "does not classify every non-serializable JavaScript value" | json-stringifier.cc:632, 1080, 3591-3592; api.cc:3567; objects.cc:492-494 | REWRITE | True but vague. Callables and toJSON-returns-undefined make JsonStringify return undefined. The API then converts it to the string "undefined", `ToLocal` succeeds, and the success path runs with that text (316-319). This arm is the JSON.stringify-threw arm only. Source-derived; not runtime-observed. |
| F9 | Effect: `CallDoneCallback(unexpected(ScriptToolError(kToolInvocationFailed, msg)))` | 308-311 | ENTAILED | Code and error code match the row. |
| F10 | "the fixed serialization message" | 310-311 | ENTAILED | Fixed literal. Its wording names serialization, but the trigger is any JS exception during JSON.stringify (F7), including author getter or toJSON throws. |
| F11 | Effect as a call: "CallDoneCallback is called" | 308 | ENTAILED | The call exists on the arm. |
| F12 | Effect as delivery to the host callback | 263-266; callback.h:38-40, 145-151, 353-359 | NOT-ENTAILED (unconditional reading) | Delivery requires `done_callback_` non-null at 263. `Run()` moves the callback out, so an earlier completion during the serialization window turns 308 into a no-op. |
| F13 | "returns before the fallback and success callback" | 312; 316-319 | ENTAILED | `return` at 312 exits the function. |
| F14 | Side effects before the decision | json-stringifier.cc:747-758 | REWRITE | Author code (toJSON, getters, proxy traps) runs before the arm is chosen. The row lists no pre-effect. |
| F15 | Console report | 301-313; v8-exception.h:232-235 | ENTAILED (non-claim) | The arm calls no ReportException (LC10 does, at 322-323). The TryCatch at 301 is not verbose by default. The row makes no report claim; keep it that way or add an explicit non-claim. |
| F16 | Quote | line 311 | ENTAILED | Literal, 5 words, inside the span. |
| F17 | Scope: source-only, no runtime claim | row; knowledge :82 | ENTAILED | Row and knowledge doc state source-only. |
| F18 | Prior runtime observations | section 8 | ENTAILED (not erased) | No prior runtime witness for LC09. The sibling success arm is witnessed in r17. |

## 4. Entry-time predicates

- Settlement entry (295): the only running check on the settlement path. It tests the tool's flag. No invocation identity is compared anywhere in 290-328; `HandleWebMcpToolResponse` receives only `tool`, `resolved`, `script_state`, `value`.
- Registration (787-788): a separate check at promise registration. The LC09 row relies on 295, not 788; the row should name which one.
- `resolved` (802/806): fixed at registration by the BindOnce pair, not re-derived at settlement.
- `value.IsObject()` (300): evaluated on the settlement value. No later re-check.
- The promise reaction runs asynchronously after registration, so "still" at entry is the only time the running flag is read on this path.

## 5. Callback and null guard

- The `done_callback_.is_null()` guard (263-265) is the only delivery guard. `CallDoneCallback` does not check `is_currently_running_`.
- `Run()` on an rvalue `OnceCallback` moves the callback into a local before invoking it (callback.h:148-151, 356-359), and a moved-from callback reports `is_null()` (callback.h:38-40). The first completion therefore consumes `done_callback_`.
- Consequence for LC09: at most one delivery per registered callback. If an earlier completion ran first, 308 is silent (no state change) and the function returns at 312.
- The LC07 ordering applies here too: the callback runs before `is_currently_running_ = false` (266-267). Not re-audited.

## 6. Sample limits

- The arm covers JSON.stringify exceptions only (F7, F8).
- Non-object resolved values never reach 301-313 (300 guard). They take the ToString fallback at 316-319; see L3.
- Callables and toJSON-returns-undefined objects reach the success path with the text "undefined" (F8). Source-derived.
- V8 exception sources in serialization (json-stringifier.cc): toJSON call 747-758 (author exceptions propagate); circular structure 817-820; BigInt 1006-1008 and 1109-1112. Getter and proxy-trap exceptions are standard JSON.stringify behavior [INFERENCE from ECMA-262; not fetched].
- The row cannot be read as "every non-serializable value".

## 7. Leads (unverified; outside the LC09 verdict; not reproduced)

- L1, nested completion inside the serialization window. Author-reachable paths on the same tool that call `CallDoneCallback` are: form reset (S096:1101-1105, "cancelled by a form reset") and registration-change cancellations (390-396, 448-451). The only writer of `is_handling_submit_` in the retained body is the scope at 724-726; the registration-change gates read it at 390 and 448. `SetIsHandlingSubmit` exists in the header (h:326-327); its other callers are outside the body. The gate is therefore not in force in the async settlement window [INFERENCE]. Source-derived consequence: 308 becomes a no-op and the earlier cancellation is what the host sees. Runtime: UNRESOLVED; not exercised.
- L2, invocation identity. Settlement binds only `tool` and `resolved` (798-806). `ExecuteTool` has no running-state guard at entry (174-222). It overwrites `invocation_id_` (178) and `done_callback_` (210). Whether a second `ExecuteTool` can reach the same tool while a respondWith promise is pending depends on gating outside the retained body (browser or ModelContext layer). UNRESOLVED; out of LC09 scope.
- L3, non-object fallback (outside LC09; possible fatal path). A non-object resolved value skips the JSON branch (300) and calls `value.ToString(result)` (316-317). `ScriptValue::ToString` (script_value.cc:53-62) calls V8 `ToString` and then `ToLocalChecked()` (59-60). V8 `ToString` throws for some non-object values (objects.cc:499-500, the Symbol branch). An empty handle reaching `ToLocalChecked` aborts in V8 [INFERENCE; not fetched]. Source-level only; not reproduced; not part of the LC09 verdict. Route to security or owner triage. Do not add it to tabi rows without owner review.
- L4, BindOnce `Then` overload not retrieved. Guessed paths for SubmitEvent and untyped promise returned 404. The fulfilled-first ordering rests on the typed overload and the callsite labels, which agree.

## 8. Prior observations (not erased; none for LC09)

- r17 receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json:4316-4325` (`invoke-declarative-form`): respondWith object returned as `Completed` with output and `navigationCount` 0. This witnesses the ToLocal-true sibling only.
- r17 probe `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:35-43, 74-77` and `.ufo/waves/round-17/probes/invoke-declarative.mjs:146-176`: all responses were serializable objects or preventDefault cases. No non-serializable response was probed.
- r17 binary strings `.ufo/waves/round-17/w1/RevBinaryInvoke.md:5-6, 74`: the LC09 literal is present in `/usr/lib/chromium/chromium` (sha256 `95b17db7…`, Chromium 154.0.8037.97) at file offset 4032011. Static presence only; reachability is not shown.
- r17 `.ufo/waves/round-17/w1/SrcWebTests.md:81` describes an imperative-path non-serializable return (rejects UnknownError). Different path; not LC09 evidence.
- r19 dossier `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:22` describes this arm as "serialization failure becomes kToolInvocationFailed (299-313)". Consistent with the arm. Its phrase is broader than the JSON-exception trigger (F8); any correction should be appended elsewhere, not edited in place.
- Grep over round-17/19 evidence, probes, and knowledge for LC09 terms found no LC09 runtime witness.

## 9. Proposed row text (for main to apply; span, quote, startLine, endLine unchanged; no pipes)

Condition: At HandleWebMcpToolResponse entry the tool is CurrentlyRunning (S096:295-297); the respondWith promise fulfilled, so resolved is true (S096:798-806); the fulfilled value is an object (S096:300); and v8::JSON::Stringify(...).ToLocal(...) returns false (S096:303-304).

Outcome: CallDoneCallback is called with kToolInvocationFailed and the fixed serialization message (S096:308-311). The host callback receives it only if done_callback_ is still non-null (S096:263); an earlier completion during the serialization window makes the call a no-op. The arm returns before the fallback and success callback (S096:312). The arm is taken only when JSON.stringify throws; JSON-undefined results such as functions do not take it. Author code (toJSON, getters, proxy traps) runs before this decision. No console report is made on this arm.

Checklist item 5 (knowledge :62 and lifecycle-skill-section.txt :28): "5. **JSON.stringify exception on a resolved object** (LC09): kToolInvocationFailed with the serialization message, unless an earlier completion consumed the done callback."

## 10. Attack log

- A1, arm equals any non-serializable value: falsified (JSON-undefined path; json-stringifier.cc:632, api.cc:3567).
- A2, arm fires on JSON.stringify failure: survived (api.cc:3563-3565).
- A3, predicate still true at 308: not established (F2).
- A4, delivery exactly once: falsified as unconditional; holds as at-most-once (F12).
- A5, quote literal in span: survived (F16).
- A6, span covers the predicate: falsified for 295-297 and 790-806 (F3).
- A7, effect returns before fallback and success: survived (F13).
- A8, `resolved=true` is the fulfilled arm: survived; residual L4.
- A9, conflict with r17/r19 observations: none found; prior observations untouched (section 8).
- A10, source identity drift at 4ae99816: none.

## 11. Integration notes and checks for main (not applied or run by me)

- Mirror the proposed row text in `decisions.json:77-78`, knowledge `:37` and `:62`, `SKILL.md:2225` (exact row, per design `skillRendering`), and `lifecycle-skill-section.txt:15` and `:28`. Keep span, quote, startLine, and endLine unchanged.
- `design.json:91` topic "object response stringify failure" may stay, or be sharpened to "object response JSON.stringify exception" (optional).
- Historical r17/r19 bytes: no edits. Any correction to the r19 "serialization failure" wording is appended elsewhere.
- Once, after integration, main should run the counter and self-test (I did not): `node .ufo/waves/round-20/measure-c1.mjs REV` and `node .ufo/waves/round-20/measure-c1.mjs --selftest`. Confirm the SKILL.md row equals the rendered decision row.
- Runtime remains untested. Nothing here is an observed completion, cancellation, or navigation.

## 12. Tooling record

- No installs or updates. Used preinstalled `curl`, `base64`, `sha256sum`, and `git` (read-only). Repo writes: this report only.
- Pinned primary sources fetched read-only into `/tmp/tabi-r20-semanticlc09` (outside the repo; removed after this report). Chromium tag 154.0.8037.97: DEPS (`dc1d7007…`), `base/functional/callback.h` (`78970910…`), `third_party/blink/renderer/bindings/core/v8/script_value.h` (`da8ca144…`) and `script_value.cc` (`5d9153fc…`), `script_promise.h` (`1ee82613…`), `core/html/forms/html_form_element.h` (`68d7712b…`). V8 `b3d6849e`: `src/api/api.cc` (`15cd09a1…`), `include/v8-json.h` (`be6f2e7b…`), `include/v8-exception.h` (`bca621a7…`), `src/json/json-stringifier.cc` (`f2ed92c1…`), `src/objects/objects.cc` (`fc9c4884…`). Guessed SubmitEvent and untyped-promise paths returned 404 and were not retrieved.

Report: .ufo/waves/round-20/w2/SemanticLC09.md
