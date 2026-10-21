# `na-throw` raw causal trace review

## Finding — Medium: `toolInvoked` is joined by invocation ID, not to the sent request

`measure-c1.mjs:80–87` validates the sent invoke command's tool name and nonce (and only that its frame ID is a string), then matches the command result's invocation ID to the receipt. It requires one `toolInvoked` event with that ID and requires matching `toolResponded` events to follow that invocation event, but does not compare the event's `frameId`, `toolName`, or serialized `input` to the sent command, nor require `toolInvoked` to follow the command result. A concrete false-credit mutation for this case is to leave seq 9/10 and the receipt ID unchanged but change only seq 11's `params.input` to a different `q`, then update the evidence digest in the receipt. The current predicate still finds one `toolInvoked` with the expected ID and the seq-15 response; response/page-state summary checks do not validate the invocation-event payload. The current capture itself has no mismatch. `selftest-c1.mjs:78–89` tests a response before invocation and a wrong nonce in the *sent* command, but not a mismatched `toolInvoked` payload (`expected.json:164,168`).

## Observed trace

- `na-throw.json` contains 16 ordered frame records: 4 sent commands, 4 results, 4 events, 2 observations, and the `action`/`action-complete` acknowledgements. The sole `Page.frameNavigated` is seq 3, before this case's action.
- Seq 3, `toolsAdded` seq 5, `getFrameTree` result seq 8, and sent invoke seq 9 all identify frame `D6A20095B0A9F4D5168C434AFE29EF4B`. Seq 9 sends `WebMCP.invokeTool` for `lifecycle`, with `q` equal to nonce `0c6a4c64-815c-43a9-92c8-ae7df597599e`. Seq 10 returns invocation ID `9F5CB698061B49FE5E0096C807819D47`; seq 11 `toolInvoked` repeats that ID, frame, tool name, and JSON input containing the same nonce. Seq 15 `toolResponded` carries that ID and `status: Error` with the programming-error text. The raw JSON digest matches the receipt's `bbe5fcac0d7186e8c197f2650d7a6521fc46860a83428ae844b88a2cc7fcfd97`.
- The receipt's `na-throw` case agrees with the raw nonce, action, and invocation ID. Its pre-window is 252 ms (`1792588029144`–`1792588029396`), with response count 0 and `formActive: true`. The post-window is 503 ms (`1792588029396`–`1792588029899`), with the same-ID Error response, submit record, empty navigations, and page state matching raw seq 16.
- Seq 12 is the pre-action observation; seq 13 starts `requestSubmit` at `1792588029396`; seq 14 acknowledges completion at `1792588029398`; seq 15 is the response at that same millisecond, after seq 14 in the transcript; seq 16 is the post observation at `1792588029899`. The timestamps do not establish sub-millisecond ordering; the recorded sequence does.
- No `release` frame is present, and this case has no delayed-promise release control. The form is active in the pre-action and submit-event records and inactive post-action. The submit record's `respondWith: "function"` is a type observation, not proof that the method was called: the retained fixture calls `preventDefault()` then throws at `na-throw.html:9–11`, before its later `respondWith` branches (`:12–15`).
- Navigation accounting agrees: raw seq 3 is the only navigation; `after.navigations` is empty. The receipt request log has only `GET /na-throw` during this case's interval. Its `/landing?...` request is at `1792588025533`, before `na-throw` began, and is not evidence of navigation in this case. Producer windows and summaries are constructed at `webmcp-lifecycle-round21.mjs:205–225`.

## Residual risk

The identified defect is a missing validator join, not an observed mismatch in this retained trace. These are finite loopback observations; no claim is made about universal WebMCP behavior, other builds, or sub-millisecond causality.

## Verification gaps

No measurement gate, selftest, build, or runtime was executed. LSP was unavailable (`read xd://lsp` returned “No such tool” and no LSP device was mounted); no grep output is presented as semantic proof. The evidence digest check was a direct SHA-256 read. No tools were installed or updated.