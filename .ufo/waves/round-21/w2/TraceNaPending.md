# TraceNaPending — `na-pending` raw causal trace

## Axes checked
- Invocation identity: sent command → returned invocation ID → invocation event.
- Finite temporal trace: action and pre/post observation windows.
- Observable agreement: response and navigation summaries vs. raw frames.

## Raw observations
Evidence: `corpus/evidence/round-21/runtime/na-pending.json` and `corpus/evidence/round-21/runtime/receipt.json`.

- `na-pending.json` has 15 ordered frames: 4 sent, 4 result, 3 event, 2 observation, 1 action, 1 action-complete. Seq 9 sends the sole `WebMCP.invokeTool` (command 4) to frame `DCEE73DBB16771C697594984D20E0E1D`, tool `lifecycle`, input `q=b7a5afa4-39e2-4fa8-bec2-3e3558467703` (the case nonce). Seq 10 returns invocation ID `1C19BCCE55B6BF9ED2F28E332BE16412` for command 4. Seq 11 is the only `WebMCP.toolInvoked`; it carries that ID, the same frame and tool, and JSON input encoding the same nonce. There are zero `WebMCP.toolResponded` frames.
- Receipt case `na-pending` repeats the nonce and invocation ID; `invokeError` is null. `preAction` is 254 ms (`1792588022310`–`1792588022564`), responseCount 0, formActive true. The pre-action observation is seq 12. Seq 13/14 acknowledge the `none` action (`no-action` / `action-complete`) at `1792588022564`. The post-action observation is seq 15 at `1792588023065`; its 501 ms window starts at `1792588022564`.
- The post observation retains the nonce, active form, original `/na-pending` URL, empty submits/errors. Receipt `after.responses`, `submits`, and `navigations` are all empty; `pageState` equals the seq-15 observation. Raw frames contain no response event, no release event, and no `Page.frameNavigated` after initial seq 3. Thus the current finite-window no-response/navigation summaries agree with the raw trace; no delayed-control release is part of this case.
- Receipt `requests` records the initial `GET /na-pending` at `1792588022294`, then the next case's `GET /na-click` at `1792588023291`; there is no intervening landing request for this case.

## Finding — Low: invocation event is joined by ID, not checked against the invoked frame

`measure-c1.mjs:80–87` selects the sent invoke command and requires one `toolInvoked` event with the receipt's returned invocation ID. It does not compare that event's `params.frameId` (or tool name/input) to the sent command, nor require the event to follow the command result. The current seq-11 event does match the seq-9 frame/tool/nonce, so this is a validator gap, not a mismatch observed in this capture.

Concrete false-credit attack: change only seq-11 `params.frameId` to a different frame while retaining its invocation ID, then update the case evidence digest in the receipt. The recorded event is no longer attributable to the requested frame, but the validator's `invoked.length === 1` identity test still accepts it; the no-response windows and their summaries remain unchanged. The case can therefore be counted as a correlated observation without the required frame join. Require the unique invocation event to match the sent command's frame/tool/input and occur after its result before accepting this trace.

## Residual risk and verification gaps

- “No correlated response in the recorded window” is supported for this one finite 254 ms pre-window and 501 ms post-window only; it does not establish that a response never arrives. This agrees with the knowledge note's `na-pending` boundary (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:30–32, 51–52`).
- LSP is unavailable in this session: reading `xd://lsp` returned “No such tool” and the mounted-device list contains no LSP device. No grep was used as semantic proof.
- No measurement gate, test, build, or runtime was executed; counts above are direct reads of the retained JSON and source predicates.
