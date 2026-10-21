# na-reject raw causal trace review

## Finding — Medium: `toolInvoked` identity is not correlated to the sent request

`measure-c1.mjs:80-87` checks the sole sent `WebMCP.invokeTool` has `toolName: "lifecycle"`, a string `frameId`, and `input.q === nonce`, then matches the result's invocation ID to the receipt and counts `toolInvoked`/`toolResponded` events by invocation ID and ordering. It does **not** compare the matched `toolInvoked` event's `toolName`, `frameId`, or serialized `input` with that sent request. A concrete false-credit mutation for this case is to leave seq 11's `invocationId` intact but change its `toolName`, `frameId`, or `input`; the current event-identity predicate would still accept it, and the receipt response/page-state summaries do not repair that missing sent-request-to-invoked-event edge. The present raw trace itself has no such mismatch (details below). The selftest's `input-nonce` mutant changes the sent request input (`selftest-c1.mjs:89`; expected rejection at `fixtures/expected.json:168`), but the listed mutants do not alter the `toolInvoked` payload while preserving its ID.

## Observed na-reject trace

- `na-reject.json:133-166` has 16 ordered frame records in all: 4 `sent`, 4 `result`, 4 `event`, 2 `observation`, and 2 action acknowledgements (`action` plus `action-complete`). The sole initial `Page.frameNavigated` is seq 3.
- Seq 9 sends `WebMCP.invokeTool` for `lifecycle`, frame `A5CC7918498C0FBD7E85B2FC0981CF52`, input `q=4141f1a1-4085-4056-9dae-6be03bdaaaa6`. Seq 10 returns `B5B968CAA455D7CDC1A6C811891C6C21`; seq 11 `toolInvoked` carries that ID, the same tool and frame, and JSON input containing the same nonce. Seq 15 `toolResponded` carries the same ID and `status: Error` / `respondWith promise was rejected` (`na-reject.json:133-207`).
- The receipt agrees on case ID, nonce, action, and invocation ID; pre window is 254 ms with response count 0 and active form, and after window is 504 ms with one same-ID Error response, no navigation, and the submit observation (`receipt.json:341-400`). In raw order, pre observation/action dispatch start are both at 1792588028437; action completion and rejection response are both at 1792588028439; post observation is at 1792588028941 (`na-reject.json:168-234`). Thus same-millisecond timestamps do not establish sub-ms causality, but the retained sequence places response after action completion and before post observation.
- The control evidence is a snapshot transition, not a separate release event: pre `formActive=true`; the submit handler record has `active=true`; post `formActive=false`. There is no `release` frame in this reject trace. The fixture sets reject mode and calls `respondWith(Promise.reject(...))` (`na-reject.html:7-15`); producer code emits a release marker only in the delayed-mode branch (`webmcp-lifecycle-round21.mjs:222`).
- Navigation accounting agrees: no `Page.frameNavigated` occurs after the action cutoff, receipt `after.navigations` is empty, and the receipt request log records only `GET /na-reject` for this case (no landing request; `receipt.json:723-727`). The raw post observation and receipt `after.pageState`, `submits`, and `responses` agree (`na-reject.json:211-278`; `receipt.json:354-400`).

## Residual risk

This is a finite loopback observation, not proof of universal WebMCP behavior or sub-millisecond ordering. The identified issue is a missing metric correlation predicate, not an observed mismatch in this na-reject record. No semantic claim is made that `isTrusted` or `agentInvoked` identifies a human action.

## Verification gaps

No gate, selftest, build, or other execution was run, as requested. No LSP device was mounted (`xd://lsp` returned unavailable); the measurement gap above is a direct comparison of the retained source predicate and these JSON fields, not a caller/reference analysis. No tools were installed or updated.