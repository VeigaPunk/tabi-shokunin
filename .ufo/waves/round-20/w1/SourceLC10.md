# LC10 — rejected respondWith promise error (source-only assessment)

Seat: TabiR20.SourceLC10 · 2026-10-21 · Source S096 `corpus/evidence/round-20/sources/html_form_element.cc` · local sha256 `8c8d6796…36916` = design.json pin · 1,740 lines. Source read first (raw); sibling and scribe rows compared afterward.

## Independent read (html_form_element.cc:320-327, raw)

```cc
  } else {
    // Promise rejected - error.
    V8ScriptRunner::ReportException(script_state->GetIsolate(),
                                    value.V8Value());
    tool->CallDoneCallback(base::unexpected(
        ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
                        "respondWith promise was rejected")));
  }
```

## Condition (exact)

- Reach: the only `resolved=false` binding is the reject handler, `BindOnce(... /*resolved=*/false)` at 803-806, attached at 798-806 when `TakeRespondWithPromise()` yields a promise on a declarative call (789-790; `declarative_webmcp_call` = `executing_tool->CurrentlyRunning()` at 787-788). `HandleWebMcpToolResponse` has no other caller (grep: definition 290; binds 799, 803; 784 is a comment).
- Gate: the handler runs its branches only if `tool->CurrentlyRunning()` holds at settlement. Otherwise it returns at 295-297, before either branch.

## Outcome (exact)

1. 322-323: `V8ScriptRunner::ReportException(...)` on the rejection `value`. The reason is reported, not returned as the tool result.
2. 324-326: `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise was rejected")))`. The fixed literal is the tool's error; the rejection reason is not in it.
3. 327-328: branch ends and the function returns.
- Callee detail (261-275): `CallDoneCallback` returns at 263-264 when no callback is stored. Otherwise it runs the callback, then clears running state, invocation id, active button and pseudo-state (266-273).

## Strongest quote (literal, 4 words, within span)

> `respondWith promise was rejected` — S096:326

Secondary literals: `// Promise rejected - error.` (S096:321); `V8ScriptRunner::ReportException(script_state->GetIsolate(),` (S096:322).

## Ready row (4 cells, no pipes inside cells)

`| LC10 | respondWith promise rejects while the declarative tool is still running (HandleWebMcpToolResponse resolved=false; CurrentlyRunning() true at settlement) | V8ScriptRunner::ReportException reports the rejection value, then CallDoneCallback gets kToolInvocationFailed "respondWith promise was rejected"; the rejection value is not the error text | S096:320-327 |`

## Caveats

- Source-only, Chromium 154.0.8037.97 snapshot. No runtime, capability, or agent-visible claim.
- Silent drop: a rejection that settles after the tool stops running (cancel, reset, or unregister; see 390-393 and 1101-1104) gets neither `ReportException` nor a callback (294-297).
- [INFERENCE] `value` as the rejection reason comes from the `Then`/`BindOnce` pattern and the signature at 290-293; the effect of `ReportException` (console or inspector surfacing) is defined in V8ScriptRunner, outside the corpus.
- Not shown in this span: whether a running tool can lack a stored done callback, which would make `CallDoneCallback` a no-op.
- Protocol mapping of `kToolInvocationFailed` into `toolResponded` is outside this span and was not re-opened. Pointers only, not re-verified: `corpus/evidence/round-18/source-recheck/S042.json` (WebMCPToolFailed mapping at other line ranges) and `corpus/lessons/round-19.md:35` (S079, WebMCP.pdl:116).

## Does an existing r19 note already hold it?

- Knowledge note `corpus/knowledge/webmcp-declarative-validation-round-19.md`: **No.** It covers the autosubmit validation error (`kToolInvocationFailed`, S078 `:729-751`, line 40) and fill-time errors. It has no respondWith rejection text, binding, or gate.
- Round-19 source dossier `.ufo/waves/round-19/w1/SrcHtmlFormTool.md`: **Yes, at source level.** L22 gives the 320-327 outcome and states the rejection value is not the callback's error text. L28 gives the CurrentlyRunning drop (294-297). L46 quotes the same literal at :326. LC10 is therefore a re-derivation; carry it into the round-20 manifest and note without new mining.
- Path correction for SourceLC06's pointer: the dossier is `.ufo/waves/round-19/w1/SrcHtmlFormTool.md`. `corpus/evidence/round-19/w1/` does not exist.

## Cross-check: lifecycle scribe's LC10 row

Source of the row: `.ufo/waves/round-20/clones/ScribeLifecycle/corpus/evidence/round-20/lifecycle/decisions.json` (the shared tree has no lifecycle manifest yet). Row: condition "The respondWith promise rejects."; outcome "The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with kToolInvocationFailed and the text respondWith promise was rejected."; 320-327; quote "respondWith promise was rejected".

- Agrees: span, outcome, and quote (literal, 4 words).
- Gap: the condition omits the running gate (295-297), so a late rejection has no outcome. Suggested condition: "The respondWith promise rejects while the tool is still running (CurrentlyRunning() at settlement; otherwise 295-297 returns with no outcome)."

## Method / untested

- Raw reads: 259-276, 280-330, 318-330, 786-808. Greps: `HandleWebMcpToolResponse` (290, 799, 803; 784 comment), `ReportException` (322 only), literal (326 only).
- Verified: local sha256 equals the design pin; 1,740 lines; `corpus/evidence/round-19/sources/html_form_element.cc.gz` decodes to the same sha (the gz file itself is `7d0dc111…`).
- Not done: URL fetch (not needed; bytes match the pin); V8ScriptRunner and WebMCP.pdl bodies. No build, test, or runtime run; untested by design (source-only lane).

## Tools

None installed or updated.

## Checks for main agent

1. Amend the LC10 condition in the scribe's row to include the CurrentlyRunning gate, then run the counter once.
2. Decide whether round-20 carries LC10 as a new row; the round-19 source dossier already holds its source-level content.
