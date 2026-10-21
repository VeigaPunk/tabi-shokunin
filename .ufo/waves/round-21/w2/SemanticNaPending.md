# SemanticNaPending — round-21 scoped semantic review

## Scope and axes

Only `na-pending` in the current canonical `corpus/evidence/round-21/runtime/` acquisition. Axes: invocation identity; finite-outcome fidelity; page-state fidelity; source/observation boundary. No historical acquisition was substituted. This is an author-side review recommendation, not independent admission, a gate result, or an actor-quiescence claim.

## Findings by severity

No actionable semantic contradiction found in this case. Scoped agreement is supported by the concrete attacks and anchors below; it is not a broad lifecycle pass.

### Attack 1: “pending” is actually a failed invoke, foreign invocation, or fabricated response status

The invoke command at `corpus/evidence/round-21/runtime/na-pending.json:132-145` sends `WebMCP.invokeTool`, local command `4`, frame `DCEE73DBB16771C697594984D20E0E1D`, tool `lifecycle`, and `q=b7a5afa4-39e2-4fa8-bec2-3e3558467703`. Its result at lines 146-154 returns invocation ID `1C19BCCE55B6BF9ED2F28E332BE16412`. `toolInvoked` at lines 155-166 repeats that ID, frame, and serialized input. The receipt agrees and records `invokeError: null` (`receipt.json:21-26`).

The complete 15-frame raw transcript (`na-pending.json:12-214`) contains no `WebMCP.toolResponded` event, matching or otherwise. Therefore the correlated outcome is **no response event recorded through the final observation**, not a received `Pending`, `Completed`, `Error`, or `Canceled` status. There is no response `errorText` or `output` to quote; absence of the entire response must not be represented as empty/null response fields. The fixture's `mode: "success"` is a handler configuration, not an observed tool success.

The note says “no matching response,” not a protocol status (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:32`). The SKILL decision likewise calls for a finite no-response window (`SKILL.md:2372`). These descriptions agree with the raw identity and event population.

### Attack 2: “pending” hides an action, stale page snapshot, submit, or navigation

The raw pre-action observation is sequence 12 at `1792588022564`; the `none`/`no-action` marker and `action-complete` acknowledgement are sequences 13 and 14 at the same timestamp; the final observation is sequence 15 at `1792588023065` (`na-pending.json:167-213`). The producer's `none` path only resolves a promise before recording the acknowledgement (`scripts/webmcp-lifecycle-round21.mjs:210-225`), so it does not dispatch a click, requestSubmit, or native submit for this case.

Exact receipt windows (`receipt.json:27-40`):

| Window | Start | End | Recorded duration | Matching response result |
|---|---:|---:|---:|---|
| Initial | 1792588022310 | 1792588022564 | 254 ms | `responseCount: 0` |
| After no-action marker | 1792588022564 | 1792588023065 | 501 ms | `responses: []` |

The adjacent recorded intervals span 755 ms from the returned invocation to the final observation marker. This arithmetic does not extend the observation beyond that marker. The canonical producer requires a nonempty returned invocation ID at lines 201-204, samples page state through `observe` at lines 187-193, filters response summaries by ID and sequence at lines 208-209, and ends the final summary at `post.seq` at line 225. Those are the run logic supporting the bounded claim; no historical producer is needed.

Both page observations have the same nonce and filled `q`, `secureContext: true`, `formExists: true`, `formActive: true`, focus `go`, URL `http://127.0.0.1:35363/na-pending`, `submits: []`, and `errors: []` (`na-pending.json:167-183,197-213`). The receipt final page state mirrors them (`receipt.json:41-51`); after-window navigation and submit lists are empty (lines 39-40). These are two sampled active states, not evidence of uninterrupted activity or a visible screenshot.

The served form has no `toolautosubmit`, has required `q` and submit button `go` (`na-pending.html:2-3`), and installs a submit handler that records the event before `preventDefault` and `respondWith(Promise.resolve(value))` (`na-pending.html:5-16`). No submit is recorded, so merely having this success handler does not establish that it ran or produced output. The note's “form active before and after” is appropriately a two-sample statement.

### Attack 3: upstream source is being used as proof of indefinite pending or source/binary identity

`corpus/SOURCES.md:114` registers S100 at `html_form_element.cc:174-328,635-842`, explicitly as same-source reuse, with no eventual-completion guarantee. The note's cited `212-218` lies inside that registration. The retained body actually contains `submit_button->Focus()` at line 215 and `context->PauseExecution()` at line 217 (`.ufo/waves/round-21/sources/html_form_element.cc:212-218`). These are callsites; their effects and downstream CDP response behavior are not proved by that excerpt. In particular, the comment about waiting for a user is not a universal runtime outcome.

The note explicitly limits this row to those callsites (`webmcp-nonautosubmit-round-21.md:32`), separates S101 own-work observation from S100 source interpretation and disclaims source/binary equivalence (lines 14-21), and rejects an indefinite guarantee (lines 51-52,78-80,91). S101's registered row independently identifies the runtime receipt as own-work and finite (`corpus/SOURCES.md:115`). `SKILL.md:2365-2372,2393-2398` preserves the same separation. No out-of-anchor implementation claim is needed for `na-pending`.

## Residual risk and verification gaps

- The retained transcript supports only this acquisition and its finite recorded windows. It does not prove indefinite pending, eventual completion, repeated-run determinism, every build's behavior, continuous active state between samples, or the invocation's outcome after the final marker/context closure. The note disclaims these extrapolations at lines 51-52 and 98-105; it explicitly makes no screenshot claim at line 103.
- This review compares retained author-produced artifacts; it does not independently authenticate observation against a malicious producer or prove that the installed Arch binary equals tagged Chromium source. Those exclusions are already explicit in the note and SKILL.
- Counter and finite red/green controls were read, not executed. `measure-c1.mjs:2,85-96` declares a relationship count and correlates recorded events; it is not semantic corroboration. The synthetic `positive-ordered.json` first case and `expected.json:93-102,160-164` were inspected as controls only, never treated as browser observations.
- LSP was unavailable: the first device discovery request, `read xd://lsp`, returned `No such tool: xd://lsp` and the mounted-device inventory contained no LSP route. Consequently no server status, references, definition, or diagnostics could be obtained. Literal searches and direct reads were the fallback, not semantic proof from a language server.
- No browser, alternate runtime, gate, counter, selftest, build, linter, or formatter was executed. No production, source, sibling, Git/index, or fleet state was changed. No tool was installed or updated.

## Read-only evidence exercised

Inspected the actual note/SKILL diff against acquisition-recorded revision `e7cf11a810003d4a65cc85bd265f2c17dd65b738`, the current producer and current bounded acquisition metadata, raw case/HTML/receipt, registered source rows and retained source excerpt, and the named counter/control files. Ran only read-only SHA-256 arithmetic in addition to those reads. Observed hashes:

- Producer: `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` — matches `receipt.json:3-6` and `runtime-execution-bounded.json:11-12`.
- `na-pending.json`: `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` — matches `receipt.json:53-55`.
- `na-pending.html`: `867d098aaf4a011988e40558c05840bce30f434951ee15d6cfeb695e3b357a18` — matches `na-pending.json:8-11`.
- Retained source body: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` — matches the S100 row and `source-opening.json:4-6`.

Report: .ufo/waves/round-21/w2/SemanticNaPending.md
