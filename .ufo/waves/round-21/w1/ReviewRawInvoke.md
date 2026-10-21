# ReviewRawInvoke — round-21 w1 first falsification

Seat: `TabiR21.ReviewRawInvoke`. Read-only review of the currently present `BuildRuntime` and `BuildCounter` clone snapshots; this is not a claim about a later integrated tip. No edits to production files.

## Axes

- **Frame fidelity:** whether evidence preserves the invoke request and its response/error as CDP frames, rather than detached summaries.
- **Request/result correlation:** whether the evidence can re-derive the exact invoke response and its `invocationId`.
- **Event identity:** whether `toolInvoked` and `toolResponded` are retained and matched to that same `invocationId`.
- **Contract compatibility:** whether producer output satisfies the counter's consumed schema and the round-21 shared contract.

## Findings (by severity)

### Critical — `invokeTool` response and `invocationId` cannot be re-derived by the counter

In the available runtime clone, `makeRecorder` records the request with `record('sent', method, { params })` (`.ufo/waves/round-21/clones/BuildRuntime/scripts/webmcp-lifecycle-round21.mjs:354-375`). It then calls Playwright `session.send()` and records the returned JavaScript object as `{dir: 'received', method: 'WebMCP.invokeTool:result', result: ...}`; errors are similarly emitted as a synthetic `:error` method under `dir: 'received'` (`:376-382`). Neither record has the `command` key consumed by the counter. The returned `invocationId` is separately copied into `evidence.invocation.result` and the receipt case (`:763-768`, `:886-901`), but that summary does not supply the counter's required correlated reply frame.

The counter requires a positive integer `invoke.command` and exactly one `dir: 'result'` or `dir: 'error'` frame with that same `command` (`.ufo/waves/round-21/clones/BuildCounter/.ufo/waves/round-21/measure-c1.mjs:315-337`). With the producer's current shape, `invoke.command` is absent and no eligible reply exists; on the success path the counter cannot set its derived `invocationId`. The counter's declared finding IDs include `invoke_identity` and `event_identity` (`:40-66`). **Predicted, not executed:** a case produced with these exact shapes reaches `invoke_identity`; because no reply-derived ID is available, it also reaches `event_identity`. This is a static trace, not a run result.

The missing identity is also an evidence-fidelity problem for the requested raw invocation frame. Round 17's C2 contract explicitly called for the raw `invokeTool` request/response/event trail and correlation through `invocationId` (`.ufo/waves/round-17/PLAN.md:122-125`). The canonical round-19 recorder documents that Playwright's public `CDPSession` exposes neither wire message IDs nor numeric protocol-error codes; that recorder labels its locally allocated IDs synthetic and uses them only to correlate its recorded send/result (`scripts/webmcp-invoke-round19.mjs:1124-1159`). Round 21 currently emits no equivalent correlation token at all. The round-20 LC04 audit is explicitly source-only and makes no runtime claim (`.ufo/waves/round-20/w2/SemanticLC04.md:3-5,98-102`); it supplies no missing invocation evidence.

**Falsifiable failure shape:** for any case whose evidence has a sent `WebMCP.invokeTool` frame but no `command`, and a corresponding result represented as `dir: 'received', method: 'WebMCP.invokeTool:result'`, the counter's reply filter returns no match for `invoke.command`. A receipt-side `invocationId` alone cannot repair the missing link. The same shape applies to rejected sends: the runtime's nested `error.message` is not a `dir: 'error'` reply keyed to the command.

**Minimum acceptance:** the producer and counter must share a single frame schema that records the invoke request's method/params and an unambiguous correlation key, plus exactly one matching result/error frame that preserves the observed payload. The counter must derive the case `invocationId` from that paired result and verify equality with the receipt summary. If the ID is synthetic because the public Playwright API hides the wire ID, evidence and reports must say so; it must not be represented as a raw wire ID. If the acceptance requires actual raw transport frames, capture them at a boundary that exposes them rather than inferring them from `session.send()`.

### Major — WebMCP events use a direction the counter never accepts

The runtime registers the WebMCP lifecycle methods and records their callbacks as `dir: 'received'` (`.ufo/waves/round-21/clones/BuildRuntime/scripts/webmcp-lifecycle-round21.mjs:84-90,368-370`). The counter looks for `WebMCP.toolInvoked` and `WebMCP.toolResponded` only when `dir === 'event'` (`.ufo/waves/round-21/clones/BuildCounter/.ufo/waves/round-21/measure-c1.mjs:343-349`). Therefore, even after fixing the invoke request/result pair, the current producer event records cannot satisfy the counter's identity/event check. This is a separate producer-consumer interface mismatch, not evidence that the browser omitted an event.

**Minimum acceptance:** agree on one event representation and have both producer and counter use it. Preserve each event's observed `params.invocationId`, and match `toolInvoked` and any `toolResponded` only against the request/result-derived ID; retain unknown response statuses as observed rather than requiring a guessed outcome.

## Residual risk and verification gaps

- Inspected the round-21 shared contract (`.ufo/waves/round-21/w1-spec.json` context), round-17 C2 interface contract, canonical round-19 recorder, and round-20 source-only LC04 review. Round-21 runtime evidence output was empty in the available BuildRuntime clone at inspection; no produced receipt or per-case evidence was assessed.
- The review is limited to the current isolated clone snapshots. They may change; no integration-tip claim is made.
- No browser, tests, builds, linters, formatters, or counter execution were run, as assigned. Predicted finding IDs are based on code tracing only.
- No LSP device is mounted (`read xd://lsp` returned “No such tool” and listed the mounted devices). Consequently these are file/line findings, not LSP caller/reference proof. Text search was used only to locate candidate lines; conclusions cite directly read implementation lines.
- No tools were installed or updated.

Report: `.ufo/waves/round-21/w1/ReviewRawInvoke.md`
