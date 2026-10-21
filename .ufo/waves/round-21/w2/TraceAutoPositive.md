# auto-positive raw causal trace

Axes: request-to-event correlation; nonce propagation; temporal window attribution; navigation/action accounting.

Scope: read-only review of the current `auto-positive.json` and `receipt.json`, the producer, C1 measurement predicates, and the related counter fixture. I did not run the producer, measurement gate, selftest, or any other verification. The `lsp` device is unavailable (`read xd://lsp` returned “No such tool”); no LSP semantic queries were possible, and I used no grep as semantic proof. No tools were installed or updated.

## Finding

1. **Medium — Attack: alter `toolInvoked` payload/frame while retaining its `invocationId`.** The current raw trace is internally consistent, but the metric does not enforce that the `toolInvoked` event describes the `invokeTool` request whose returned ID it carries. In `measure-c1.mjs:81`, the sent request is checked for `toolName` and nonce-bearing `input.q`, but its `frameId` is only required to be a string. Lines 85–87 select both `toolResponded` and `toolInvoked` by `invocationId`, require one invoked event and check only event ordering; they do not compare that event's `toolName`, `frameId`, or parsed `input` with the sent command or registered frame. Thus a trace with a different tool/input/frame on the `toolInvoked` event but the same ID can still satisfy these predicates if the evidence digest is correspondingly updated. The `input-nonce` selftest attacks the sent request (`selftest-c1.mjs:89`, expected result `expected.json:168`), not the event-side payload. This is a source-level counterexample, not an executed mutant.

   On the retained case, the values do match: `toolsAdded` registers `lifecycle` with autosubmit true on frame `AC75F8082576A9E79CEC5EA4C45A0E48` (`auto-positive.json:63–91`); `Page.getFrameTree` returns that frame (`:100–134`); command 4 sends `WebMCP.invokeTool` to it with `q` equal to nonce `993abf00-22b1-4cae-9605-e90d528bf007` (`:135–148`); its result gives invocation `7EA2406500794B4FD25A2FDE0DE35C14` (`:149–157`); `toolInvoked` repeats that ID, frame, tool name, and serialized nonce input (`:158–169`); and `toolResponded` repeats the ID with `Completed` and the matching `{ok:true, nonce, q}` output (`:170–184`). The defect is a missing gate correlation, not a mismatch observed in this capture.

## Trace accounting

The raw transcript has **16 frames**: four `sent`, four `result`, four `event` (one initial navigation, one tool registration, one `toolInvoked`, one `toolResponded`), two observation markers, one action marker, and one action-complete marker (`auto-positive.json:12–247`). The page-observation copies mirror the pre/post marker values (`:249–298`).

The response is already present before any page action: `toolResponded` is seq 12 at `1792588032331`; pre-action starts at `1792588032330`, ends at `1792588032583` (253 ms), and records `responseCount: 1` and `formActive: false` (`receipt.json:579–585`). The `none` action and its completion are seq 14–15 at `1792588032583`; the post window is 502 ms through `1792588033085` (`auto-positive.json:210–247`; `receipt.json:586–600`). There is no release marker in this success-mode transcript. There is one initial navigation to `/auto-positive` at seq 3 (`auto-positive.json:28–52`), no navigation in the post-action summary (`receipt.json:610`), and the receipt request log records the GET `/auto-positive` (`receipt.json:742–746`), not a landing request.

`after.responses` contains the same seq-12 response even though it predates `after.start`; the producer/metric summary is cumulative through the post observation marker, not a second response in the post interval (`measure-c1.mjs:96`; `receipt.json:586–600`). Its equality to the raw cutoff is true, but it must not be described as a response caused by the no-op action or as a newly post-action result. Cleanup fields show a nonempty pre-close PID set, empty `browserPidsAfter`, `contextClosed: true`, and empty blocked/download lists (`auto-positive.json:299–313`).

## Residual risk and verification gaps

The current retained auto-positive transcript has correct request/event IDs, frame and nonce, and its finite timing/navigation summaries agree with the raw markers. The actionable gap is that the C1 gate would not detect event-side tool/frame/input substitution while preserving the invocation ID. I did not execute a mutant or gate, per lane bounds; final serial verification remains with L1.

Report: `.ufo/waves/round-21/w2/TraceAutoPositive.md`
