# LC06 — CancelTool uses tool-cancelled callback (source-only assessment)

Seat: TabiR20.SourceLC06 · 2026-10-21 · Source S096 `corpus/evidence/round-20/sources/html_form_element.cc` (tag 154.0.8037.97 span, design.json sha256 `8c8d6796…36916`; local sha256 verified equal: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`).

## Independent read (html_form_element.cc:224-229)

Exact source, lines 224-229 (read raw from the pinned blob):

```cc
void HTMLFormElement::HTMLFormMcpTool::CancelTool() {
  CHECK(is_currently_running_);
  CallDoneCallback(base::unexpected(
      ScriptToolError(ScriptToolErrorCode::kToolCancelled,
                      "Tool execution cancelled by abort signal")));
}
```

- **Condition:** `CancelTool()` is entered while this declarative form tool is currently running — line 225 asserts `is_currently_running_` with `CHECK`, i.e. the cancel path exists only for an in-flight invocation; a cancel outside the running state is a crash-level invariant violation in the source, not a normal branch.
- **Outcome:** the stored completion callback is invoked with a failure value: `base::unexpected(ScriptToolError{ScriptToolErrorCode::kToolCancelled, "Tool execution cancelled by abort signal"})` (226-228). The tool never produces a successful result; teardown of running/pseudo-state happens inside `CallDoneCallback` (261-275, outside this span).

Strongest quote (4 whitespace words, within span 224-229), lines 225-228:

> `CHECK(is_currently_running_); CallDoneCallback(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolCancelled, "Tool execution cancelled by abort signal")));`

Ready-to-render row (no pipes inside cells):

`| LC06 | CancelTool while running; CHECK is_currently_running_ | done callback runs with unexpected kToolCancelled "Tool execution cancelled by abort signal" | S096:224-229 |`

## Caveat

Source-only; no runtime/capability claim. The span shows the callback receives the `kToolCancelled` error, but not the CDP mapping — that lives elsewhere (`ModelContext::CancelTool` delegates to `DeclarativeTool()->CancelTool()` at model_context.cc:613-619; `inspector_web_mcp_agent.cc:228-230` maps only `kToolCancelled` to `Canceled`), per prior rounds' reads, not re-opened here. Also, delivery is via `CallDoneCallback`, which no-ops when the stored callback is already null; no path in this span establishes that state is reachable while running.

## Does an existing r19 note already hold it?

**Yes.** `.ufo/waves/round-19/w1/SrcHtmlFormTool.md` line 18 states, against the same span: "- **224-229 — cancellation:** `CancelTool()` returns `kToolCancelled` / 'Tool execution cancelled by abort signal' through `CallDoneCallback`." Same file, same span, same condition+outcome. LC06 is therefore already covered by the r19 wave note (`.ufo/waves/round-19/w1/`); round-20 work reduces to carrying that row into the round-20 decision manifest/knowledge note rather than new mining. (Corroborating, not required: round-17/18 notes establish the downstream CDP `Canceled` mapping.)

## Method / untested

Read the pinned local blob directly (:222-232 raw) before consulting any prior note; verified blob sha256 against design.json; searched the tree for `CancelTool`/`kToolCancelled` to locate the r19 holder. No browser launched, no build/test run — untested by design (source-only lane).
