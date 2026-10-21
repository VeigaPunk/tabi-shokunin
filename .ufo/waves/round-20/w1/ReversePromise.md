# ReversePromise — round-20 wave 1: LC09/LC10 bounds (source-only)

- Seat: `TabiR20.ReversePromise` (revenger, leaf; no dispatch).
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` equals lane HEAD (verified).
- Pinned source: S096 bytes at `corpus/evidence/round-20/sources/html_form_element.cc` (Chromium 154.0.8037.97). Source-only. No runtime, capability, or build claim. No tests, builds, or Chromium/V8 execution. No writes outside this report.
- Axes: span accuracy · quote literalness and length · outcome fidelity · hazard surfacing.
- LSP: this seat has no `lsp` device. Call sites come from literal text search over S096 only; no semantic reference proof is claimed.
- Call sites of `HandleWebMcpToolResponse` within S096: definition 290; comment 784; bound at 799 and 803. No other references.

## 1. Provenance checks (read-only)

| Check | Command | Result |
|---|---|---|
| Pinned bytes | `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to the design.json S096 pin |
| Length | `wc -l` on the same file | 1740 lines |
| Lane HEAD | `git rev-parse HEAD` | `c49929430d996b016dde2e3a3a5be380f3433fdb` (= baseline) |
| Tracking | `git ls-files --others --exclude-standard -- corpus/evidence/round-20` and `git log -- <path>` | The S096 copy is **untracked** at baseline; `git log` is empty |
| Tracked twin | `zcat corpus/evidence/round-19/sources/html_form_element.cc.gz` then `sha256sum` | Same `8c8d6796…6916`; the `.gz` is tracked at baseline |

Consequences: (a) the round-20 copy must be committed before any row cites it, or rows cite the tracked round-19 `.gz`, which decompresses to the same bytes (QUALITY 28); (b) S078 and S096 are the same URL and bytes (see D7).

## 2. Verified spans

Numbered read and literal grep agree on every line below.

- LC08 guard: 294 `CHECK(tool);`, 295–297 `if (!tool->CurrentlyRunning()) { return; }`. LC08 span `[290,298]` (signature 290–293).
- **LC09 span `[298,319]` verified**: `if (resolved) {` at 298 through `tool->CallDoneCallback(result);` at 319.
- **LC10 span `[320,327]` verified**: `} else {` at 320 through the closing `}` at 327. The function closes at 328.
- Overlap: line 298 belongs to both LC08 and LC09 spans (D5).

Anchor lines:

| Line | Text (abridged) | Role |
|---|---|---|
| 300 | `if (value.IsObject()) {` | object branch |
| 301 | `v8::TryCatch try_catch(script_state->GetIsolate());` | declared; never queried |
| 303–304 | `if (v8::JSON::Stringify(script_state->GetContext(), value.V8Value()) .ToLocal(&json_string))` | success test |
| 305–306 | `result = ToBlinkString<String>(...kDoNotExternalize);` | success text |
| 307–313 | `else` → `tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise resolved with an object that " "could not be serialized to JSON")));` then `return;` | failure branch (LC09) |
| 316–318 | `if (result.IsNull()) { value.ToString(result); }` | primitive path, selected by a null `result`, not by `IsObject` |
| 319 | `tool->CallDoneCallback(result);` | success completion |
| 321–323 | `// Promise rejected - error.` then `V8ScriptRunner::ReportException(script_state->GetIsolate(), value.V8Value());` | rejection report |
| 324–326 | `tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise was rejected")));` | rejection completion (LC10) |

## 3. Reconstructed contract: `HTMLFormElement::HandleWebMcpToolResponse` (290–328)

Binding (798–806): `std::move(*promise).Then(BindOnce(..., resolved=true), BindOnce(..., resolved=false))`. The promise comes from `submit_event->TakeRespondWithPromise()` (790). The bound arguments are `WrapPersistent(this)` and `WrapPersistent(executing_tool.Get())`. `executing_tool` is checked non-null at 788 before binding. The settle path never sees an invocation id.

Steps:
1. `CHECK(tool)` at 294. Fatal on null; the binding guarantees non-null.
2. Running guard (295–297): if not running, return. No callback, no stringify, no `ReportException`. This is the only running check on the settle path.
3. Resolved (298–319):
   a. `result` starts as a null `String`.
   b. If `value.IsObject()`: stringify. Success sets `result` to the JSON text. Failure calls kToolInvocationFailed with the LC09 text and returns.
   c. If `result.IsNull()`: `value.ToString(result)`. The return value is not checked.
   d. `CallDoneCallback(result)` delivers success. A still-null `result` would also be delivered as success (D2).
4. Rejected (320–327): `ReportException(isolate, reason)`, then kToolInvocationFailed with "respondWith promise was rejected". The reason never enters the tool error.

Object vs primitive conversion:

| Input class | Path | Tool-visible result |
|---|---|---|
| `IsObject`, stringify succeeds | 300–306; skips 316–318 | JSON text from `v8::JSON::Stringify(context, value)`; no replacer or gap is passed in S096 |
| `IsObject`, stringify yields no string (`ToLocal` false) | 303–313 | kToolInvocationFailed with fixed text; no value |
| Not `IsObject` (definition of `ScriptValue::IsObject` is outside S096) | 316–317 | `ToString(result)`; output text defined outside S096 |
| Rejected | 322–326 | kToolInvocationFailed with fixed text; reason goes to `ReportException` |

Consequences:
- Every success is a plain `String`. No type tag survives. A resolved string `"5"` and a resolved number `5` both take the non-object path. An object takes the JSON path. Downstream, the round-19 note records S097 as "Success parses JSON or falls back to a string" (`webmcp-declarative-validation-round-19.md:134–135`). That is not re-read by this seat.
- The JSON branch is selected by `IsObject` but the `ToString` branch by `IsNull()`. The two agree only if `ToBlinkString` returns non-null for a JSON text. Its definition is outside S096; this is assumed, not verified.

Exceptions:

| Source | Where | Caught | Reported | Tool sees |
|---|---|---|---|---|
| `JSON::Stringify` failure | 301–313 | TryCatch declared, exception never read | no `ReportException` on this branch | fixed text, 310–311 |
| Rejection reason | 322–326 | not applicable | `ReportException` (destination outside S096) | fixed text, 326 |
| `ScriptValue::ToString` | 317 | no TryCatch, no check | unknown (definition outside S096) | unknown: a thrown or unset result has no branch |
| Not running | 295–297 | not applicable | nothing | nothing |

Both failure branches use the same code, `kToolInvocationFailed`. LC09 and LC10 differ only by message text (310–311 versus 326).

## 4. Decision bounds (proposed for the scribe)

Manifest objects, one per decision. Quotes are single literal source lines, verified by grep inside the spans. Word counts are from `wc -w`.

```json
{"id":"LC09",
 "condition":"respondWith promise resolves while the tool is CurrentlyRunning, the value IsObject, and v8 JSON stringify yields no string (ToLocal false)",
 "outcome":"tool completes with kToolInvocationFailed text 'respondWith promise resolved with an object that could not be serialized to JSON'; caught exception not read; no ReportException on this branch; returns before the primitive ToString path",
 "startLine":298,"endLine":319,
 "quote":"could not be serialized to JSON"}
```
Quote at S096:311, 6 words.

```json
{"id":"LC10",
 "condition":"respondWith promise rejects while the tool is CurrentlyRunning (guard at 295-297 passed)",
 "outcome":"V8ScriptRunner::ReportException reports the rejection reason; tool completes with kToolInvocationFailed text 'respondWith promise was rejected'; rejection reason absent from the tool error",
 "startLine":320,"endLine":327,
 "quote":"respondWith promise was rejected"}
```
Quote at S096:326, 4 words.

Skill rendering rows (no pipes inside cells):

| ID | condition | outcome | source |
|---|---|---|---|
| LC09 | respondWith promise resolves while running with an object value that JSON stringify cannot turn into a string | tool fails with kToolInvocationFailed text "respondWith promise resolved with an object that could not be serialized to JSON"; no report call on this branch | S096:298-319 |
| LC10 | respondWith promise rejects while the tool is still running | reason goes to ReportException; tool fails with kToolInvocationFailed text "respondWith promise was rejected"; reason absent from the tool error | S096:320-327 |

Antecedent: LC09 and LC10 hold only while the guard at 295–297 passes. The LC08 row must carry that.

## 5. Divergences and hazards (source-only; none runtime-observed)

**D1 — stale settlement can complete a later run (highest impact; affects LC08 wording).**
- Chain: `ExecuteTool` sets running (204) and `done_callback_` (210) with no re-entry guard (174–222). The tool object stays registered (`RegisterDeclarativeTool`, 462). `CancelTool` (224–229) reaches `CallDoneCallback` (261–275), which clears running (267) and the invocation id (270). The settle path checks only `CurrentlyRunning()` (295) and binds the tool pointer (799–805), never an invocation id. The invocation id is stored at 178; in S096 it is read only at 170, inside `GetActiveWebMCPToolInvocationId`.
- Sequence: run A submits and the page holds `P_A` → `CancelTool` → run B on the same object (running at 204, `done_callback_` = B at 210) → `P_A` settles → guard passes → `CallDoneCallback(value_A)` completes run B.
- LC08's wording "late response ignored when tool no longer running" holds only for the not-running state. During a later run it is delivered.
- Status: INFERENCE. Reachability depends on the invocation layer above this file (not in S096). No held runtime row exercises re-invoking the same declarative tool object after a cancel (`webmcp-invocation-round-17.md:55–63`).

**D2 — a null result on the primitive path can be delivered as success (UNKNOWN).**
- 316–319: the `ToString` return is unchecked. If `result` stays null, `CallDoneCallback(result)` sends a null `String` as success. That is the same sentinel navigation uses (`base::ok(String())` at 829 and 841; comment at 827–828).
- Whether `ScriptValue::ToString` can leave `result` null or throw is decided by a definition outside S096.

**D3 — a non-string success from JSON stringify is not distinguished (UNKNOWN).**
- 303–306 test only `ToLocal`. A call that succeeds without producing a string is not handled.
- Candidate input class, not exercised: a function value. Under V8 semantics it satisfies `IsObject` (INFERENCE). ECMAScript `JSON.stringify` returns undefined for functions. Whether the V8 API returns an empty handle or undefined in that case is outside S096. LC09 must not claim coverage of it.

**D4 — asymmetric reporting between LC09 and LC10 (SOURCE).**
- LC09 failure: the caught exception is not read and there is no `ReportException` (301, 307–313). LC10: `ReportException` at 322. A stringify failure therefore has no report call in S096.
- Whether the non-verbose `v8::TryCatch` also hides the exception from embedder reporting is V8 semantics (INFERENCE; not opened).

**D5 — span overlap (bookkeeping; SOURCE).**
- LC08 `[290,298]` and LC09 `[298,319]` share line 298 (`if (resolved) {`). Pick one owner, or end LC08 at 297.

**D6 — S096 row anchors do not cover LC11 (adjacent; SOURCE).**
- `corpus/SOURCES.md:110` cites `html_form_element.cc:174-328,729-758,818-842`. LC09 `[298,319]` and LC10 `[320,327]` fall inside 174–328.
- LC11 `[787,815]` falls outside all three ranges. The S078 row cites 635–842 and covers it (`SOURCES.md:92`). Route to the LC11 owner.

**D7 — same bytes under two source IDs, no disclosure (SOURCE; QUALITY 33 and 38).**
- S078 (`SOURCES.md:92`) and S096 (`SOURCES.md:110`) share the URL and sha `8c8d…6916`. The round-19 decisions manifest already binds the round-19 `.gz` to S096's sha (`corpus/evidence/round-19/validation/decisions.json`, `row: S096`).
- S098 and S099 carry explicit reuse notes ("same implementation bytes as S077, not a distinct independent source"; "same PDL as S041, not an independent source") (`SOURCES.md:112–113`). S096 has no equivalent note.
- S096 says "supersedes S078", but the S078 row carries no superseded marker. Its text "navigation submission returns an empty string" is the premise that S096 corrects to a null `String`. Route to the scribe.

**D8 — untracked evidence root (SOURCE; QUALITY 28).**
- The S096 path is untracked at baseline (section 1). Cite the tracked round-19 `.gz` (same decompressed bytes), or commit the round-20 copy in the integration commit before citing it.

Adjacent residue (not LC09/LC10; routed):
- A1 (LC02/LC07 owners): the fill-error path (196–197) runs `done_callback` directly. It leaves `is_currently_running_` false and `invocation_id_` (178) set. No visible effect in S096, because `InvocationId()` is gated by `CurrentlyRunning()` (169–170).
- A2 (cancellation seat): 390–394 and 448–451 cancel an in-flight declarative call on tool-definition update when not handling submit. `webmcp-invocation-round-17.md:74` says unregistration mid-call does not cancel. That row is probe-level and its tool type is unstated. This is not a proven conflict; check it before writing cancellation claims.

## 6. Runtime status

- No runtime-held claim exists for LC09 or LC10. Literal search of `corpus/knowledge`, `corpus/lessons`, `corpus/README.md`, `corpus/SOURCES.md`, and `corpus/QUALITY.md` for "could not be serialized", "promise was rejected", "resolved with an object", "respondWith promise", "LC09", and "LC10" returned no matches.
- `webmcp-invocation-round-17.md:55`: `invoke-declarative-form` returns a `respondWith` value as `Completed` output. This covers the resolved path only, with no object-vs-primitive detail.
- `webmcp-declarative-validation-round-19.md` covers fill-time messages and the submit-time "Form validation failed" text only.
- Keep LC09 and LC10 `source-only`.

## 7. Confidence

- Spans: high. Numbered read and literal grep agree; the sha pin matches.
- Quotes: high. Single literal lines inside their spans (311 inside 298–319; 326 inside 320–327), 6 and 4 words.
- Branch structure and outcomes: high (direct reading of S096).
- Return contracts of `v8::JSON::Stringify`, `ScriptValue::ToString`, `ReportException`, and `TryCatch`: unknown or inference (outside S096).
- D1 stale completion: high on the source structure; medium-low on reachability, which is unverified.

## 8. Untested

- No Chromium or V8 execution; no runtime evidence; no V8 header or source opened.
- Untested candidate inputs: throwing `toJSON`, cyclic objects, BigInt members, function values, Symbol primitives, termination exceptions, concurrent or re-entered `ExecuteTool`, and cancel-then-reinvoke of the same tool object.

## 9. Tooling

- No tools installed or updated. Checks used only `sha256sum`, `wc`, `zcat`, `printf | wc -w`, read-only `git rev-parse` / `ls-files` / `log`, and the read and grep tools.

## Commands run (receipts)

- `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` → `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
- `wc -l corpus/evidence/round-20/sources/html_form_element.cc` → `1740`
- `git rev-parse HEAD` → `c49929430d996b016dde2e3a3a5be380f3433fdb`
- `git ls-files --others --exclude-standard -- corpus/evidence/round-20` → lists `html_form_element.cc`
- `git log --oneline -3 -- corpus/evidence/round-20/sources/html_form_element.cc` → empty, exit 0
- `zcat corpus/evidence/round-19/sources/html_form_element.cc.gz` then `sha256sum` → `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
- `printf` then `wc -w`: "could not be serialized to JSON" → 6; "respondWith promise was rejected" → 4; "respondWith promise resolved with an object that" → 7
- Literal grep of S096 for the LC09/LC10 quotes and for `ReportException`, `TryCatch`, `JSON::Stringify`, `ToString(result)`: lines 301, 303, 310, 311, 317, 322, 326 (all within the stated spans)
