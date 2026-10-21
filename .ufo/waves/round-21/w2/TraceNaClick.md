# na-click raw causal-trace review

**Axes checked:** invoke/event identity, action-relative timing, summary-to-raw agreement, navigation accounting, and context/process release. Scope is the current `corpus/evidence/round-21/runtime/na-click.json` and its `receipt.json`; no gate or selftest was executed.

## Findings

### High — `na-click` completion is not required to occur after the click marker

The observed trace is correctly ordered: `toolInvoked` seq 11 (invocation `0B53A87928A9E2638D504C5088EFD942`) follows invoke result seq 10; the pre-action marker seq 12 has no submits; click dispatch marker seq 13 precedes matching `toolResponded` seq 14 (`Completed`); action acknowledgment seq 15 follows; post marker seq 16 contains one submit with the same nonce. Receipt `preAction.responseCount` is 0 over 255 ms and `after` spans 542 ms with one matching response and one submit (`runtime/na-click.json`, seqs 9–16; `runtime/receipt.json`, lines 58–119).

The checker does not preserve that causal edge for this case. In `.ufo/waves/round-21/measure-c1.mjs:85-87`, response events are selected by invocation ID and only rejected if they precede `toolInvoked`; the order chain at line 94 constrains the invoke command result and action markers, not `WebMCP.toolResponded`. Line 96 only checks that receipt summaries mirror the raw events before the post marker. It neither requires a matching response after the click marker nor requires zero matching responses before it. Thus a same-ID response moved to the interval after `toolInvoked` but before the pre-action/click markers can be reflected in both summaries and still be counted; a missing response can also leave the response array empty and self-consistent. That can credit `na-click` without the click producing its reported Completed result (the expected observation is documented in `corpus/knowledge/webmcp-nonautosubmit-round-21.md`, `na-click` row). The existing `response-before-invoke` selftest mutation only inserts a response before `toolInvoked` (`selftest-c1.mjs:78-84`; `fixtures/expected.json:164`), so it does not cover this after-invoke/before-click attack.

**Suggested check:** for `na-click`, require pre-action response count zero and exactly one matching `Completed` response whose event sequence is after the click dispatch marker and before the post marker. Do not require it after `action-complete`: in the actual trace the response is seq 14, before acknowledgment seq 15, but after dispatch seq 13.

### Medium — `toolInvoked` payload is not checked against the sent invocation

The current raw fields agree: seq 5 tool registration, seq 8 frame tree, seq 9 `WebMCP.invokeTool`, and seq 11 `toolInvoked` all use frame `B46152C143D219D35E8360DDF5485D99`; the sent `input.q`, event input string, submit `q`, and response `nonce`/`q` all equal `9acf5007-c443-4473-8764-f04bba30c49d`. The result at seq 10, event at seq 11, response at seq 14, and receipt all carry invocation ID `0B53A87928A9E2638D504C5088EFD942` (`runtime/na-click.json`, seqs 5–14; receipt lines 59–84).

However, `measure-c1.mjs:81-87` validates the sent input and command-result ID, then finds `toolInvoked` by invocation ID only. It never compares the event's `toolName`, `frameId`, or serialized `input` to the sent request. A same-ID `toolInvoked` event naming another frame/input could therefore satisfy the current identity check while the receipt remains summary-consistent. The observed trace has no such mismatch; this is a missing assertion, not an observed runtime failure.

## Raw accounting and residual risk

- Direct JSON count: **16 frames** — 4 sent, 4 results, 4 events (3 WebMCP events plus the initial `Page.frameNavigated`), 2 observations, 1 action, and 1 action acknowledgment. There is one `toolInvoked`, one matching `toolResponded`, and one post-action submit.
- Action timing: pre observation and click dispatch are both timestamped `1792588023565`; response and action acknowledgment are both `1792588023605` (response seq 14 before acknowledgment seq 15); post observation is `1792588024107`. The receipt windows match these markers: 255 ms pre-action and 542 ms after-window.
- Navigation: seq 3 is the only `Page.frameNavigated` in the raw trace; the after summary has `navigations: []`, pre/post URLs remain `/na-click`, and the receipt request list records the `/na-click` GET but no `/landing` request for this case. Producer subscription/filtering is limited to `Page.frameNavigated` (`scripts/webmcp-lifecycle-round21.mjs:179,225`), not same-document navigation events, so this supports no observed cross-document navigation in the captured window, not an exhaustive claim against an unobserved transient same-document change.
- Release: 9 owned PIDs are present at launch and at close, while `browserPidsSeenAfterClose` and `browserPidsAfter` are empty; `contextClosed` is true (`na-click.json:280-345`). Receipt cleanup reports browser/server closed (`receipt.json:681-684`). This is the producer's finite profile-owned process observation.
- The page's `isTrusted` and `agentInvoked` values are submit-event fields, not a human-action witness; the finite fixture does not support universal or human-intervention claims.

The receipt's producer digest matches the current producer file; its `na-click` evidence digest and fixture digest match the current JSON/HTML files. The `lsp` device is not mounted (`read xd://lsp` returned `No such tool`), so no LSP status/references/definition/diagnostics were available; this review uses direct artifact and source anchors only. No build, gate, selftest, or other verification was run.
