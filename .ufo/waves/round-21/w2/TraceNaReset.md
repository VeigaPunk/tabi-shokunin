# na-reset raw causal trace review

## Raw trace readout

`corpus/evidence/round-21/runtime/na-reset.json` contains 16 ordered frames: 4 `sent`, 4 `result`, 4 `event`, 2 `observation`, 1 `action`, and 1 `action-complete` (counted directly from the JSON). The single pre-action `Page.frameNavigated` is seq 3 to `/na-reset`; the receipt's after-window navigation summary is `[]`.

The current invoke chain is aligned: seq 8's frame-tree root, the registered tool's frame, the seq 9 `WebMCP.invokeTool` frame, and seq 11 `toolInvoked` frame are all `EE8D3E48CDD0C082114C71870FB0E8A3`. Seq 9 sends `toolName: lifecycle`, `q: a5bf649f-4496-4207-8402-ba796d413494`; seq 10 returns `A49A436758AB02CAD5BDF803319539C8`; seq 11 carries that ID and the same tool/input. Seq 15 `toolResponded` carries the same ID with `Canceled` and `Tool execution cancelled by a form reset` (`na-reset.json:98-165,198-207`).

Pre-action is seq 12 at 1792588026503: the receipt records 253 ms, responseCount 0, active form; the matching observation has the nonce-filled field. Reset dispatch/completion are seq 13–14 at that same millisecond. The response is seq 15 at 1792588026503, followed by post observation seq 16 at 1792588027004 (501 ms after the receipt's after-start). Post state and receipt agree: no submits/errors, same URL, form exists but inactive, input cleared. The receipt's response, pageState, submits and navigations summaries agree with the raw frames (`na-reset.json:168-258`; `receipt.json:252-295`). There is no `release` frame for this non-delayed reset case. The frame counts and current values show no observed corruption in this capture.

The receipt's request log has the prior `/landing` request at 1792588025533, then the reset document request at 1792588026238; it contains no later landing request for this case (`receipt.json` `.requests`).

## Findings (severity order)

### Medium — A matching `toolResponded` can be credited before the reset

`measure-c1.mjs:85-87` selects responses by invocation ID and rejects only responses whose sequence is at/before `toolInvoked`. It does not require a reset response after the reset action; `:94` orders the invoke result, pre marker, action, action acknowledgement and post marker, but omits the response event. `:96` only checks that receipt summaries mirror whatever response frames are present. It also never requires `preAction.responseCount === 0` for `na-reset`, although the note describes a finite no-response pre-action interval (`webmcp-nonautosubmit-round-21.md:36,78-80`).

Concrete false-credit attack: put the matching response between `toolInvoked` and the pre-action marker, set `preAction.responseCount` and `after.responses` to mirror it, and update the evidence digest. The response is after invocation so `event_identity` accepts it; the summaries match; the later reset still has its required action markers. Thus a response already observed before reset can be presented as the reset case's outcome. The current trace avoids this: responseCount is 0 and seq 15 follows reset seqs 13–14.

### Medium — `toolInvoked` payload is not bound to the sent call

The current record's `toolInvoked` name, frame and serialized input match the sent request, but `measure-c1.mjs:85-87` finds that event only by `invocationId`; it never compares its `toolName`, `frameId` or parsed `input` to `sent[0].params` (`:80-84`). A record with the same invocation ID but a different tool/frame/input would therefore satisfy the event-identity condition while being unrelated to the nonce-bearing call. Concrete attack: alter only seq 11's `input` or `frameId`, retain its ID, and update the evidence digest; the request-side nonce and receipt ID checks still pass. The selftest's `input-nonce` mutant changes the *sent* input (`selftest-c1.mjs:89`), not the `toolInvoked` event payload; there is no corresponding payload-crosscheck mutant in the listed expected cases (`fixtures/expected.json:152-169`).

### Medium — invoke result is not required to follow its sent command

`measure-c1.mjs:82-84` correlates the result/error to the invoke command number and receipt invocation ID, but does not require `sent[0].seq < answered[0].seq`. `:94` only requires the answer to precede the pre-action marker. Consequently, a transcript with the invoke result placed before the `sent` record (same command ID and timestamp), then the existing invocation event and later reset, can still meet the checked order conditions. Current evidence has the correct seq 9 sent → seq 10 result (`na-reset.json:132-165`); the scorer does not enforce that causal ordering. The selftest does not include a result-before-send mutant (`selftest-c1.mjs:32-98`; expected cases `fixtures/expected.json:152-169`).

## Residual risk and verification gaps

- These are acceptance gaps inferred from the inspected conditions, not observed defects in the current `na-reset` transcript. I did not execute the counter, selftest, mutants, or any gate, per assignment bounds.
- The LSP device is unavailable: `read xd://lsp` returned `No such tool`; no text grep was used as semantic proof.
- The current evidence is one finite loopback run; this review does not establish repeated-run behavior or evidence authenticity.