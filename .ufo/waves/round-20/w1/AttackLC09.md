# AttackLC09 — object response stringify failure (round 20, source-only)

Seat: TabiR20.AttackLC09 (leaf reviewer). Scope: S096:298-319, its done-callback consumers in retained bodies, and the round-19 note. Source-only: no build, run, browser, or runtime claim. No production edits.

## Verdict

- The branch is real and narrow. A tool still running at settlement; a resolved object for which `JSON::Stringify` returns no handle gives the done callback `kToolInvocationFailed` with one fixed message. `return` at 312 skips the fallback and the success callback.
- Defeated stronger claims: A1 (every object is JSON or an error; a result of `undefined` is accepted as the string "undefined"), A2 (the exception is reported or surfaced; it is caught and never read), A4 (primitives always become a string; the `ToString` result is ignored and a null result reaches the callback as success).
- The round-19 note does not hold LC09.
- Manifest trap: the message exists only as two adjacent literals. Quote `could not be serialized to JSON` (S096:311).
- Evidence class: S096 and S078 are one body, so LC09 is one source. S078's registry scope names respondWith settlement; S096's names the navigation sentinel.

## Pins checked

- S096 `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines. Equals design.json `source.sha256`.
- Byte-identical (`cmp`) to round-19 `corpus/evidence/round-19/sources/html_form_element.cc.gz` (S078).
- Inspector body `.ufo/waves/round-19/w2/SourceS079.inspector.body.gz`: sha256 `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`, 245 lines. Equals the S079/S097 pin.
- Model-context body `.ufo/waves/round-19/w2/SourceS079.model_context.body.gz` (identical to `w1/SrcCdpToolResponded.model_context.cc.gz`): sha256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`, 1245 lines. Equals the S042 pin.

`model_context.cc:N` below cites that retained body. Several of its ranges are outside every registered range; see Evidence notes.

## Branch map, S096:298-319

| Lines | Condition | Result |
|---|---|---|
| 294-297 | `CHECK(tool)`; `!tool->CurrentlyRunning()` | Return, no callback. Running is set at 204 and the callback at 210, so LC09 runs only while the tool is running. |
| 298 | `resolved` true | Fulfilled path. Rejection is LC10 (320-327). |
| 300 | `value.IsObject()` false | Skips JSON; falls to the fallback at 316. |
| 303-306 | `JSON::Stringify(...).ToLocal` true | `result` = `ToBlinkString(json_string)`. No check for `undefined` or a non-string. |
| 303-312 | `ToLocal` false | Error at 308-311 (code and fixed message); `return` at 312. |
| 316-318 | `result.IsNull()` | Object path: non-null, skipped. Primitive path: `value.ToString(result)` at 317, return value ignored. |
| 319 | Object success and primitive paths | `CallDoneCallback(result)`. Reports success even when `result` is still null. |

## Attacks

Severity is for the LC09 row. Each attack gives the false stronger claim, the source defeat, and acceptable wording.

### A1 — "A resolved object is JSON or an error." (High; source chain)

- False claim: a resolved object either becomes its JSON text or fails with `kToolInvocationFailed`.
- Source defeat: S096:303-306 accept any successful `ToLocal` and pass the handle to `ToBlinkString` with no check. Blink's own comment (model_context.cc:89-94) says `JSON.stringify()` "can return the `undefined` JavaScript value, which stringifies as the String literal "undefined"", and that the input path must treat that as failure (model_context.cc:99-103). S096 has no such check. The literal therefore reaches `CallDoneCallback` as success (S096:319). The consumer then emits `toolResponded` with it (model_context.cc:732-734), and the inspector's `ParseJSON` falls back to a string (inspector 59-63), giving CDP `Completed` with output "undefined".
- Which JS values reach this case: [INFERENCE] ECMAScript returns undefined for function-valued top-level input. That is external and not in SOURCES.md, so it is not admitted.
- Acceptable wording: "When `v8::JSON::Stringify` returns a handle, S096 converts it with `ToBlinkString` and accepts the result without checking for the literal `undefined` (S096:303-306). The source does not establish which JS values reach that case."

### A2 — "The stringify exception is reported or surfaced." (Medium-High; branch)

- False claim: the stringify exception is reported, or reaches the CDP caller, as the rejection branch's exception is reported.
- Source defeat: the `v8::TryCatch` at 301 is never read. There is no `HasCaught`, `Exception`, `Message`, or `ReportException` anywhere in 298-319 (grep). The only `ReportException` in S096 is LC10 at 322. The error at 308-311 carries only code and message. All eleven `ScriptToolError` constructions in S096 take exactly two arguments (227, 239, 245, 252, 309, 325, 392, 449, 757, 808, 1103). The declarative consumer passes `exception=std::nullopt` (model_context.cc:736-737). The imperative sibling does surface its exception: model_context.cc:265-277 calls `HandleFailure` (302-321), which adds a console error and calls `OnToolExecuted`, which passes the exception at 869.
- Acceptable wording: "The `JSON::Stringify` exception is caught by a `v8::TryCatch` that this branch never reads (S096:301-311). The branch reports no console message and attaches no exception object; the error carries only the code and the fixed message."

### A3 — "The error names the cause (cycle, BigInt, throwing toJSON)." (Medium; branch)

- False claim: a cyclic, BigInt-containing, or throwing-`toJSON` object fails with this error, and the message says what failed to serialize.
- Source defeat: the branch runs for any empty `ToLocal` (S096:303-304). The message is one fixed literal (309-311). Nothing inspects the caught exception. The imperative sibling asserts `HasCaught()` on the same failure (model_context.cc:273), and S096 does not. S096 also does not distinguish termination from an exception (no `HasTerminated` or `HasCaught` check). The causes are ECMAScript behavior: [INFERENCE].
- Acceptable wording: "Any failure of `JSON::Stringify` for an object value takes this branch and gets the fixed message (S096:303-311). The source does not identify the causes that produce it."

### A4 — "A primitive response always becomes a string." (High; structural)

- False claim: non-object responses become a string, and a null result cannot reach the callback.
- Source defeat: S096:317 ignores the return value of `ToString`. `result` starts null (299), and 319 reports it as success whatever it is. `ToString` returns a value that is tested, as model_context.cc:282 shows (`if (value.ToString(temp))`). The imperative sibling maps a failed `ToString` to success "Operation succeeded" (model_context.cc:280-289). The declarative consumer treats a null String as a cross-document navigation and emits no `toolResponded` (model_context.cc:728-734), then forwards success (741). A failed primitive conversion therefore surfaces as success with navigation semantics, not as an error. Which values make `ToString` fail is not in the corpus: [INFERENCE].
- Acceptable wording: "On the non-object path S096 calls `value.ToString(result)` and ignores its result (S096:316-317), then reports `result` as success (S096:319). S096 does not establish that `result` is non-null. A null String is also the navigation sentinel (S096:827-829), so the callback cannot distinguish this path from navigation."

### A5 — "`kToolInvocationFailed` identifies the stringify failure." (Low; branch)

- False claim: the error code identifies a stringify failure.
- Source defeat: the same code is used at S096:325 (rejection), 757 (submit-time validation), and 809 (preventDefault programming error).
- Acceptable wording: "Uses `kToolInvocationFailed`, which the rejection branch (S096:325) and two other callbacks (S096:757, 809) also use. Only the message text distinguishes this branch."

### A6 — "Serialization is pure; it only copies data." (Low; external semantics)

- False claim: stringifying a response only copies data.
- Source defeat: S096:303-304 call `JSON::Stringify` on the page-supplied value with default options. Page-defined code can run during the call. The mechanism is ECMAScript: [INFERENCE], not admitted.
- Acceptable wording: "`JSON::Stringify` is called on the page-supplied value with default options (S096:303-304). The source does not bound what page-defined code runs during the call."

### A7 — "The message matches as one literal." (Manifest; High for the scribe)

- False claim: quote `respondWith promise resolved with an object that could not be serialized to JSON` (S096:310-311).
- Source defeat: two adjacent C literals. Line 310 is `"respondWith promise resolved with an object that "`; line 311 is `"could not be serialized to JSON")));`. The joined phrase is not a substring of any single line (grep: "that could not" matches nothing).
- Acceptable wording: quote `could not be serialized to JSON` (S096:311; 6 words). If the full message must be cited, write "two adjacent literals, S096:310-311".

### A8 — "Two sources corroborate LC09." (Evidence class; Medium)

- False claim: S096 adds independent corroboration, or LC09 cites two independent sources.
- Source defeat: S096 and S078 are byte-identical (`cmp`; sha256 `8c8d6796…6916`). SOURCES.md:110 says S096 "supersedes S078" only for the navigation sentinel. SOURCES.md:92 scopes S078 to "submit/respondWith completion and callback errors" and says "respondWith settlement are returned through the tool callback".
- Acceptable wording: "LC09 rests on one body: S078, identical to S096 (sha256 `8c8d6796…6916`). S078's registry scope covers respondWith settlement."

### A9 — "Round 19 holds it, or observed it at runtime." (Evidence class; High)

- False claim: round 19 holds this branch, or observed it.
- Source defeat: the round-19 note has no `respondWith`, `resolve`, or `promise` text (grep). Lines 129-131 use S096 only for the navigation sentinel (LC12). Line 40 covers submit-time validation. No retained runtime case exercises a `respondWith` resolution.
- Acceptable wording: "Not held by round 19. Source-scoped to Chromium 154.0.8037.97 (S096:298-319). Not runtime-observed."

### A10 — "The CDP caller receives the JS type of the response." (Boundary; outside the span)

- False claim: a resolved string reaches CDP as that string, and a resolved object reaches CDP as structured JSON.
- Source defeat (registered at S097:47-64 and 208-243): the inspector's `ParseJSON` parses success text as JSON when it can and otherwise returns a string (inspector 59-63). CDP output type therefore follows the text, not the JS type. A null String yields an empty dictionary (inspector 47-49), but the declarative consumer suppresses null before emitting (model_context.cc:732-734).
- Acceptable wording: "Downstream of S096, the inspector parses success text as JSON when it can and otherwise forwards a string (S097:47-64). The CDP output type therefore need not match the resolved value's JS type. LC09 does not decide this."

### A11 — "The LC09 span ends at 318." (Row; Low)

- False claim: the ScribeChecklist cites the outcome as `S096:298-318`.
- Source defeat: line 319 (`tool->CallDoneCallback(result);`) delivers the success outcome, so 318 omits it.
- Acceptable: startLine 298, endLine 319.

## Row and manifest entry (acceptable)

Row, under the declared heading:

| LC09 | Tool still running at settlement; resolved value passes value.IsObject(); v8::JSON::Stringify returns no handle (ToLocal false) | Done callback gets kToolInvocationFailed with the fixed text "could not be serialized to JSON"; the caught exception is neither read nor reported; return skips the fallback and the success callback; source-only | S096:298-319 |

Manifest object:

`{"id":"LC09","condition":"Tool still running at settlement; resolved value passes value.IsObject(); v8::JSON::Stringify returns no handle (ToLocal false)","outcome":"Done callback gets kToolInvocationFailed with the fixed text; the caught exception is neither read nor reported; return skips the fallback and the success callback","startLine":298,"endLine":319,"quote":"could not be serialized to JSON"}`

Row scope line: "Source-scoped reading of Chromium 154.0.8037.97 (S078, identical bytes to S096). Not runtime-observed."

## Evidence notes (registry)

- SOURCES.md:110 (S096) cites `html_form_element.cc:174-328,729-758,818-842`. LC09 (298-319) lies inside 174-328. Its scope text names the navigation sentinel and validation callbacks, not respondWith serialization. Prefer S078 (SOURCES.md:92) for LC09 scope.
- Retained model-context lines used above that no registered range covers: 82-106 (the undefined check), 262-294 (the imperative sibling), and 695-746 (the declarative consumer, including the null check at 728-734 and `exception=std::nullopt` at 736-737). Registered S042 ranges are 528-580, 748-811, and 856-873; S071 covers 562-565 and 752-811. Claims resting on the uncited lines stay [INFERENCE] until a registry row covers them (QUALITY 12).
- Inspector lines 47-63 and 208-243 fall inside the registered S097 ranges (47-64, 208-243). The body sha matches.

## Round-19 check

- Not held. `webmcp-declarative-validation-round-19.md` contains no `respondWith`, `resolve`, or `promise` text (grep). Lines 38-40 cover fill-time and submit-time validation. Lines 129-131 use S096 for the LC12 navigation sentinel.
- Its S097 summary (lines 134-135, "Success parses JSON or falls back to a string") omits the null-String branch (inspector 47-49) and the declarative suppression (model_context.cc:728-734). Correct it by an appended note in the round-20 knowledge text, not by editing round-19 bytes.

## Cross-decision notes (not LC09 rows)

- LC12: S096 has two null-sentinel sources, navigation (825-829) and JS `form.submit()` inside a submit handler (838-841). Both yield `ok(String())`, and the declarative consumer emits no `toolResponded` for either. The LC12 row should not present the sentinel as navigation-only, or as "rather than JSON null" without adding that no completion event is emitted on this path.

## Limits

- Source-only. Nothing built, run, or observed.
- Not in the corpus: `ScriptValue::IsObject`, `ScriptValue::ToString` (its bool return is inferred from model_context.cc:282), the `ScriptToolError` definition, `DeclarativeWebMCPTool`, V8 `JSON::Stringify` return behavior, and ECMAScript `JSON.stringify` semantics. Where used they are marked [INFERENCE]. ECMAScript is external and has no SOURCES row, so it is not admitted.
- The decisions manifest and the round-20 knowledge note did not exist at read time. The wording was checked against design.json, the source, and the ScribeChecklist, not against a written row.
- ScribeChecklist line 11 ("`respondWith` resolve yields a JSON-stringified object") should not be reused as the outcome. It omits the primitive path, the undefined case, and the running precondition, and its 298-318 range omits the delivery at 319.

## Changes

- Wrote only `.ufo/waves/round-20/w1/AttackLC09.md`. No production edits, no subagents, no tool installs or updates. Scratch decompressions under /tmp were removed. One read-only shell grep was used for the ScriptToolError call-site list; all other searches used the read and grep tools.
