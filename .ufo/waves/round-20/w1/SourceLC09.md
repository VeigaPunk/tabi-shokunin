# SourceLC09: object response stringify failure (round 20)

Scope: independent source assessment of LC09, `HandleWebMcpToolResponse` at S096:298-319. Source-only, not runtime-observed. Leaf seat: no subagents. No installs or updates. Nothing written outside this report.

## Provenance

- S096 local body `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Matches `design.json:19`. The same decoded-body hash is recorded for the r19 S078 row at `.ufo/waves/round-19/w1/FamNumberRange.md:40`. The S096 URL was not re-read.
- Reads outside S096, used only to fix the failure predicate:
  - Blink `ScriptValue` at tag 154.0.8037.97, `third_party/blink/renderer/bindings/core/v8/script_value.h` (googlesource `?format=TEXT`, base64 decoded by hand). `IsObject() const { return !value.IsEmpty() && value->IsObject(); }`.
  - V8 revision pinned by the 154.0.8037.97 DEPS: `'v8_revision': 'b3d6849efaf11696198e15b32290e6d6b0d540c1'` (`raw.githubusercontent.com/chromium/chromium/154.0.8037.97/DEPS`, line 346). V8 files were read as grep excerpts at that commit (`raw.githubusercontent.com/v8/v8/b3d6849efaf11696198e15b32290e6d6b0d540c1/...`). These are excerpts, not full-file reads.
  - ECMA-262 live multipage `tc39.es/ecma262/multipage/structured-data.html`, fetched 2026-10-21. Not version-pinned. Steps cited: SerializeJSONProperty 2, 10, 12 and the cyclic-structure checks.

## Source (S096, abridged)

```
298  if (resolved) {
300    if (value.IsObject()) {
301      v8::TryCatch try_catch(script_state->GetIsolate());
303      if (v8::JSON::Stringify(script_state->GetContext(), value.V8Value())
304              .ToLocal(&json_string)) {
305        result = ToBlinkString<String>(script_state->GetIsolate(), json_string,
306                                       kDoNotExternalize);
307      } else {
308        tool->CallDoneCallback(base::unexpected(
309            ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
310                            "respondWith promise resolved with an object that "
311                            "could not be serialized to JSON")));
312        return;
313      }
314    }
316    if (result.IsNull()) {
317      value.ToString(result);
318    }
319    tool->CallDoneCallback(result);
```

`try_catch` (301) is declared and never read. Its scope ends at 314.

## Exact condition and outcome

**Failure condition, all three must hold:**
1. `resolved` is true, a fulfilled `respondWith` promise (298). The running-tool gate at 295-297 is LC08.
2. `value.IsObject()` is true (300). Blink's predicate is `!IsEmpty() && value->IsObject()`. At the V8 pin, `Value::IsObject()` is `IsJSReceiver` (`api.cc:3936-3938`), so callable objects pass.
3. `v8::JSON::Stringify` returns an empty `MaybeLocal` (303-304). At the pin, that happens only when `JsonStringify` throws (`api.cc:3563-3566`).

**Failure outcome:** `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise resolved with an object that could not be serialized to JSON")))`, then `return;` (308-312). There is no `ToString` fallback and no success callback.

**What makes `JsonStringify` throw.** The Blink file does not say which of these applies:
- A cyclic graph. ECMA-262: "throw a TypeError exception because the structure is cyclical" (SerializeJSONObject and SerializeJSONArray).
- A BigInt nested inside the value. A top-level BigInt never reaches LC09, because `IsObject` is false. ECMA-262 SerializeJSONProperty step 10: "throw a TypeError exception."
- A throwing `toJSON`, getter, or Proxy trap. ECMA-262 step 2 uses `? GetV` and `? Call`, so the exception propagates.
- Output longer than V8's maximum string length. Pinned `json-stringifier.cc:633-635`, `THROW_NEW_ERROR(... NewInvalidStringLengthError())`. Grep excerpt.

**Same resolved-object gate, but NOT the failure outcome:**
- Stringify returns text. `result` is the JSON text and the call succeeds (305-306, 319). Ordinary objects and arrays take this path.
- `JSON.stringify` yields `undefined` without throwing. This covers callable objects, and objects whose `toJSON` returns `undefined`. At the pin, callables return `UNCHANGED` (`json-stringifier.cc:1080`). `UNCHANGED` maps to `undefined` (`:632`). `JSON::Stringify` then returns `Object::ToString(undefined)`, a non-empty string (`api.cc:3567`). Blink keeps `result = "undefined"`, which is non-null, so 316-318 is skipped, and it calls back `ok("undefined")`. The "could not be serialized" message is therefore false for these inputs. This is derived from source and pinned V8 excerpts. It was not runtime-observed.
- Primitives (`IsObject` false) skip to `value.ToString(result)` (316-318).

## Quote (at most 25 words)

- Strongest: `respondWith promise resolved with an object that could not be serialized to JSON`, S096:310-311. The C++ literal is split across two lines, `"respondWith promise resolved with an object that "` and `"could not be serialized to JSON"`. Joined, that is 13 words.
- Single-line literal, for a contiguous match: `respondWith promise resolved with an object that`, S096:310 (7 words).
- Condition support: `if (v8::JSON::Stringify(script_state->GetContext(), value.V8Value())`, S096:303.

## Caveats

1. Source-only, and V8 facts are bound to the Chromium 154 V8 revision (b3d6849). Those facts come from grep excerpts of a GitHub mirror. The ECMA-262 page is live, not pinned.
2. Blink never reads the exception. V8 `TryCatch` is non-verbose by default: "exceptions that are caught by an external exception handler are not reported" (`v8-exception.h:232-235` at the pin). So the serialization exception is not surfaced to the console. The fixed tool error is the only signal, and it names no cause.
3. The callable and `undefined` success route is derived from source and V8, not observed. A runtime fixture would settle it: fulfil `respondWith` with a function and compare the output with the failure message. Not claimed here.
4. Downstream: the message is `ScriptToolError.message`. Whether it reaches CDP `errorText` depends on `inspector_web_mcp_agent.cc:241-243` (S097 in r19). Not assessed here.
5. Term collision: the r19 note's "stringifies" at `corpus/knowledge/webmcp-declarative-validation-round-19.md:38-39` refers to fill-time input validation (`Invalid value ... for parameter`). It is not this output branch.
6. `ScribeChecklist.md:11` says "kToolInvocationFailed if stringify fails". That is accurate only in the sense that `JSON::Stringify` throws. It should not be read as covering every non-serializable object.

## Does the existing r19 note hold LC09?

**No.**
- `corpus/knowledge/webmcp-declarative-validation-round-19.md`: case-sensitive grep for `respondWith`, `could not be`, and output JSON serialization found no hits. The unrelated hits are:
  - 38-40: input-side "stringifies", plus the S078 form-validation `kToolInvocationFailed` (`:729-751`).
  - 129-131: S096 cited for the navigation null-String sentinel, a different branch.
  - 134-135: S097, omitted output versus JSON null, on the CDP side.
- `corpus/lessons/round-19.md`: 36 lists the enum only. 136-138 summarise S096 as the navigation sentinel. No LC09 statement.
- `corpus/knowledge/webmcp-invocation-round-17.md:55`: success path only.
- Wave-level records only, not the note:
  - `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:22` paraphrases the branch at 299-313 ("serialization failure becomes kToolInvocationFailed"). It omits the `undefined` route.
  - `.ufo/waves/round-19/w1/SrcScriptToolError.md:45`.
  - The exact message appears as binary strings in `.ufo/waves/round-16/w1/RevengeBinary.md:263` and `.ufo/waves/round-17/w1/RevBinaryInvoke.md:74`. That is binary evidence, not source.

## Suggested decision row (integrator decides; nothing edited)

- topic: object response stringify failure. A fulfilled object whose `JSON.stringify` throws.
- condition: `resolved` AND `IsObject()` AND `v8::JSON::Stringify` returns empty.
- outcome: `kToolInvocationFailed` with the fixed message, then `return` with no `ToString`.
- span: 300-312. Quote: S096:310-311.
- Consider a note line for the callable and `undefined` route, which succeeds with `"undefined"` (S096:303-306, 319; V8 pin).

## Verdict

LC09 holds as a throw-only failure branch. The message fires only when `JSON.stringify` throws. Fulfilled callable objects, and objects whose `toJSON` returns `undefined`, succeed with the text `"undefined"`. The existing r19 note does not hold LC09.
