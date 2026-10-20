VERDICT: ISSUES

Axes: receipt-field compatibility with the round-17 counter; honest CDP observation; H3 (no TCP DevTools port); frozen round-17 counted inputs.

A pipe `BrowserContext.newCDPSession(page)` does not break the round-17 counter by omitting a key named `frames`. The counter never reads `frames`, `featureSwitches`, or `safety.cdpChannel`. It fails when the integer CDP error code disappears, when `WebMCP.toolResponded` is stored without a method name on the same object, or when the receipt is dropped onto the frozen round-17 paths.

Tools installed: none.

## Evidence

Round-18 design (`.ufo/waves/round-18/PLAN.md:22-36`, `:79-89`): H3 is CDP over Playwright's pipe via `context.newCDPSession(page)`, with `--remote-debugging-port` absent; S1 is exactly one `--enable-features=` and at most one `--disable-features=`; H4 adds case `invoke-download-refused`. The round-18 counter is a live probe. It does not reuse `measure-c2.mjs`.

Worktree `scripts/webmcp-invoke-round18.mjs` at this read is a partial cutover, not a pipe session. sha256 `f0f2bc96ca2665420e08321aa3252c9e12b0c9f62560c0523eb5305602256836`, 2252 lines. Round-17 harness sha256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, 2127 lines (matches `SKILL.md:1941` and `corpus/evidence/round-17/measurement-binding.json` producer pin used by the rerun index). Header `:12` says no TCP port. Body still opens a raw socket (`connectRawCdp` `:631`), still requires `devtoolsPort !== null` (`:1105`, `:1622`, `:1986`), and still writes the raw-websocket `safety.cdpChannel` (`:2181`). `DEVTOOLS_PORT_ARG` is referenced at `:724` and `:2174` and is not defined (the const that round 17 has at `scripts/webmcp-invoke-round17.mjs:91` is gone). `RECORDED_CDP_EVENTS` (`:127-133`) and `PLAYWRIGHT_DEFAULT_*` (`:73-94`) are unused. A sibling may still be editing this file; line numbers are this read.

Playwright 1.64.0, read from `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/node_modules/playwright-core/lib/coreBundle.js`:

- Client `send` returns `result` only (`:59021-59023`). Message ids are not returned.
- On a CDP error the server does `setMessage(object.error.message)` and rejects (`:36366-36368`, `:45884-45886`). `ProtocolError` stores `type`, `method`, `logs`, and `Protocol error (${method}): ${message}` (`:12815-12824`). `object.error.code` is not copied onto the exception.
- Events cross the channel as `{method, params}` (`:54195`). The client emits `event.method` with **params only**, and also emits `'event'` with `{method, params}` (`:59008-59010`). Outgoing commands and `{id, error}` replies are not events.

Round-17 `cdpInvoke` keeps the integer only because the raw socket sets `error.protocolError = reply.error` (`scripts/webmcp-invoke-round17.mjs:544-546`, `:739-744`). The receipt's flags-off case stores that object at `actual.invoke.error` (`corpus/evidence/round-17/webmcp-invoke/receipt.json:6466-6469`, `code: -32602`, `message: "Tool not found"`) and again inside `cdp.frames[].frame` (`:6654-6659`). Domain-disabled is `code: -32601`, `message: "'WebMCP.invokeTool' wasn't found"` (`:8787-8789`).

## What the round-17 counter actually reads

`node .ufo/waves/round-17/measure-c2.mjs REV` cats fixed paths (`measure-c2.mjs:83-86`, `:868-872`). It never opens `scripts/webmcp-invoke-round18.mjs`.

| Check | Where | Pipe effect |
|---|---|---|
| `producerSha256` equals sha256 of `scripts/webmcp-invoke-round17.mjs` | `:478-480` | An honest r18 hash fails if the receipt is substituted and the harness path is not. |
| `predicate.fnSha256` is a 64-hex digest of a `predicate:` function literal sliced from that same harness text | `:239-246`, `:409-422`, `:572-585` | A new H4 predicate is absent from the r17 blob, so membership fails while extraction `ok` is true. Named predicates make extraction fail and the membership check is skipped (`:579`), which weakens the check rather than failing it. |
| `invoke-imperative-success` contains some object with `method` or `event` string and `params.status === 'Completed'` for `WebMCP.toolResponded` | `:205-216`, `:617-622` | `session.on('WebMCP.toolResponded', params => …)` does not match. `session.on('event', event => …)` does. The `{seq,dir,atMs,frame}` wrapper is not required. `eventLog[]` entries `{method, params}` (`receipt.json:1264-1269`) are enough. |
| `invoke-flags-off-control` contains `{error:{code:integer, message:string}}` or a flat own-property `{id, code:integer, message}` | `:222-234`, `:627-630` | `protocolError` is absent on a Playwright throw. The fallback `{code: null, message: String(error)}` (`round17 :744`, `round18 :869`) fails `Number.isInteger(null)`. The message text alone does not count. |
| Every `runs[]` entry has positive integer `pid`, non-empty string `argv` or `effectiveArgv`, and `gone === true` | `:634-645` | Independent of the socket. `findBrowserPid` keys on `--user-data-dir=` (`round17 :253-258`), not `DevToolsActivePort`. |
| `runtime.observed.chromium.realExecutableSha256` 64-hex; `loopback.externalRequestCount === 0` | `:490-494` | `/proc/<pid>/exe` survives the pipe. `/json/version` does not, and the counter does not read `version`. A download that increments `blocked` fails this check. |
| 11 case ids, 4 control ids, all `status === 'pass'`, summary recomputed, each `fixtureFile` basename under `corpus/evidence/round-17/webmcp-invoke/fixtures/` | `:93-116`, `:519-600`, `:874-876` | A 12th passing case is allowed. Its fixture must be a committed blob at that frozen prefix. |

Not read: `schema`, `safety.cdpChannel`, `featureSwitches`, `devtoolsPort`, `version`, `cdp.frames` as a key, `dir`, `seq`.

Round-16 `measure.mjs:277-311` is stricter about `schema === 'tabi-round16-webmcp-v1'` and `summary.caseSet.caseSetOk`, and it reads `toolsAdded`, not runs or CDP frames. It would reject a round-17 receipt on schema before any pipe question. The round-17 walker was added so the storage path would not matter (`measure-c2.mjs:202-204`).

## Assumptions a pipe session breaks

1. **Integer protocol codes.** Predicates compare `error.code` to `-32602` (unknown tool, flags-off, unregister, iframe wrong frame), `-32000` (before-enable), and `-32601` (domain-disabled). See `scripts/webmcp-invoke-round17.mjs:1177`, `:1535`, `:1756` area, `:1873`. Playwright 1.64.0's thrown error has the message and not the code. Those predicates fail, `verdict` is not `pass`, and the counter fails at `:476` and `:520` before it cares about frames. Mapping the three known messages back to codes makes the counter pass and is not a wire observation. `w2/CriticC2Final.md:16` re-derives those codes from `cases[].cdp.frames`.

2. **Event envelope.** Bare params from `on(method, params)` have `status: 'Completed'` and no `method`. `cdpEvents` skips them. The success case then fails `:622` even though the tool completed.

3. **Send-before-response order.** `invoke-concurrent-ids` requires `lastSendSeq < firstResponseSeq` from `dir: 'out'` `WebMCP.invokeTool` frames and `dir: 'in'` `WebMCP.toolResponded` frames (`round17 :1433-1458`). The `'event'` channel has neither outgoing commands nor response ids. Null seq fails the predicate, so the receipt is not `pass`. The counter does not read `seq`. A monotonic seq assigned when `send()` is called and when `'event'` fires preserves the inequality if the listener is installed first. Those records are harness timestamps, not websocket frames.

4. **Per-case slice.** The walker sees the whole case. A session-global log that includes another case's `toolResponded` `Completed` inside `invoke-flags-off-control` fails `:624-625`.

5. **`devtoolsPort` fail-closed, not a counter field.** `waitDevToolsPort` reads `DevToolsActivePort` (`round17 :471-476`). `attachCase` uses `http://127.0.0.1:<port>/json/list` (`:578-586`, `:771-777`). The current r18 file still throws when that port is null. A pipe launch never gets a pass receipt until those gates are removed. The counter never reads `devtoolsPort`.

6. **Pointing the counter at the r18 receipt while it still hashes round 17.** `producerSha256` mismatch (`:480`). H4's predicate literal is not in the r17 file. H4's HTML is an embedded string (`round18 :96-126`), not `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-download-refused.html`. `readFixture` (`:874-876`) returns null. Round-17 evidence is byte-frozen (`PLAN.md:51-56`), so the missing fixture must not be added there to satisfy this counter.

7. **What does not break the counter.** Changing `safety.cdpChannel`. Changing `featureSwitches.counts` when S1 merges to one token, as long as case predicates still see `webmcpInLastEnable === false` on flag-off and `devtoolsSupportInLastDisable === true` on domain-disabled (those booleans are `/proc` argv, `round17 :633-644`). Writing only `argv` or only `effectiveArgv`. Dropping `cdp.frames` while keeping `eventLog` `{method, params}` and `invoke.error` `{code, message}`. `schema` staying `tabi-round17-webmcp-invoke-v1` (`round18 :2130`) or changing; the r17 counter ignores it. `Page.getFrameTree` still returns `result.frameTree` because `CDPSession.send` unwraps `result` the same way the raw `send` does.

`runs[].effectiveArgv: null` with no `argv`, the round-16 receipt shape (`w2` notes under round 16; round-16 counter never checked it), fails `:641-642`. Round 17 added that check because round 16 did not.

## Consumers

### Code that decides from the receipt

- `.ufo/waves/round-17/measure-c2.mjs:27-41` contract comment; `:84` harness path; `:86` fixture prefix; `:205-216` `cdpEvents`; `:222-235` `cdpErrors`; `:478-480` `producerSha256`; `:490-494` exe sha and `loopback.externalRequestCount`; `:519-600` cases, controls, fixtures, predicates; `:617-630` Completed vs flags-off error; `:634-645` `runs[]` `pid` / `argv`|`effectiveArgv` / `gone`; `:868-876` git paths. No `featureSwitches`, `cdpChannel`, or `frames` key.
- `.ufo/waves/round-16/measure.mjs:277-311` schema, `caseSet.caseSetOk`, `toolsAdded`, fixtures. No runs, no CDP frames.
- `scripts/check-measurement-binding.mjs` hashes `countedInputs` paths (`:490-493`, `:599-605`). It does not parse receipt fields.

### Binding and measurements

- `corpus/evidence/round-17/measurement-binding.json:52-58` C2 counted inputs include `scripts/webmcp-invoke-round17.mjs`, the round-17 receipt, and `fixtures/`. Counter sha `079dcc3924d36b34e56996efe694d35e474455489d611812a78615f3821fc3e1`. The round-18 script is not an input. Editing the round-17 file is `counted_input` drift; adding a new file is not.
- `.ufo/waves/round-17/drafts/measurement-binding.json:52-58` is an older draft (counter sha `2cba594b…`). The committed manifest is the consumer.
- `corpus/evidence/round-17/measurements.json:1934-1940` and `:2165` record the harness path in `inputsRead`. They do not parse frames.
- `corpus/evidence/round-18/routed/harness-reruns/index.json:4-6` pins the round-17 producer path and `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.

### Notes, SKILL, scorecard, log

- `corpus/knowledge/webmcp-invocation-round-17.md:18` producer path; `:37` `.runs[]` pid/gone/exe; `:38` `.runs[2].featureSwitches` ("last of two" `--disable-features`, receipt `counts.disableFeatures` is 2 at `receipt.json:412`); `:39` `.safety.cdpChannel` as a raw DevTools websocket; `:61` before-enable `-32000`; `:99-104` open DevTools-port debt; `:136-140` recheck compares `.runtime.observed.chromium.version` and `realExecutableSha256` to this note, and `producerSha256` to the round-17 file. Byte-frozen. It describes the round-17 receipt, not an r18 pipe receipt.
- `corpus/knowledge/webmcp-chromium-loopback-round-16.md:35-36` reads round-16 `.runs[].effectiveArgv`. Round-16 counter does not.
- `SKILL.md:1941` round-17 argv and sha prefix `de62820d…052d7`. `:1944-1946` binding command. `:1950-1959` decision rows are protocol facts (`toolResponded.status`, `exception.description`, `invocationId`). They do not name `frames` or `cdpChannel`. They stay true of a pipe receipt only if those params are still stored.
- `SCORECARD.md:795` C2 command; `:807` capability text says the harness records raw frames and per-run pid/argv.
- `LOG.md:1017-1019` names the harness and the 11/11 + 4 controls receipt.
- `corpus/README.md:322` points at the note and the round-17 receipt (request/response, `toolInvoked` / `toolResponded`, page `execute`). It does not name the script.
- `corpus/lessons/round-17-verifier-spotcheck.md:19` and `:69` name the script and its blob digest. No field parse.

### Audits that parse the receipt fields

- `.ufo/waves/round-17/w2/CriticC2Final.md:16` re-derives outcomes from `cases[].cdp.frames`, including seq order and `-32602`.
- `.ufo/waves/round-17/w2/CriticPredicates.md:87-88` recomputes concurrent seq from frames, and flags-off `argvClean` / `featureSwitches` from `effectiveArgv`.
- `.ufo/waves/round-17/w2/RevNoteVsReceipt.md:15` checks `.runs[].gone`, `.realExecutable`, `.safety.cdpChannel`; `:41-46` `.runs[2].featureSwitches.counts.disableFeatures === 2` and `.effectiveArgv`; `:96` `.cases[10].cdp.frames` order.
- `.ufo/waves/round-17/w2/SentinelHarnessAfter.md:49` `safety.cdpChannel`; `:69` `featureSwitches`; `:80` `effectiveArgv`.
- `.ufo/waves/round-17/w1/C2Counter.md:28` and `:129` document the `argv` / `effectiveArgv` alias. `.ufo/waves/round-17/w1/C2Harness.md:21` documents `runs[].featureSwitches`.

### Name mentions that do not parse fields

These cite `scripts/webmcp-invoke-round17.mjs` and are not field consumers: `.ufo/waves/round-17/PLAN.md:110`, `:182`; drafts `lesson-r17.md`, `log.md`, `log2.md`, `note-c2.md`, `report.md`, `scorecard.md`, `scorecard2.md`, `skill.md`, `skill2.md`; w1 `C2ProbeFrames.md`, `ConnFleetBinding.md`, `ConnFrontierRows.md`, `CriticC2.md`, `CriticLowestAxis.md`, `DraftNote.md`, `DraftSkill.md`, `RevHarmPlan.md`, `SentinelBrowser.md`, `SimplifyC2Reuse.md`, plus `w1/spec.json`, `w1/validation.json`, `w1/dispatch-result.json`; w2 `BindR17Draft.md`, `DraftReport.md`, `DraftScorecard2.md`, `DraftSkill2.md`, `ReRunHarness.md`, plus `w2/spec.json`, `w2/validation.json`, `w2/dispatch-result.json`. Round-18 design mentions: `PLAN.md:33`, `:55`; `drafts/harness-hardening-round-18.md` (H3/S1 table); `drafts/skill-append.md:43-44`, `:86`; `w1/DraftNoteHarness.md`; `w1/SentinelHarnessDesign.md:9-18`; `w1/spec.json` and `w1/validation.json` (seat text). Probes `invoke-declarative.mjs:17`, `invoke-lifecycle.mjs:22`, `:54` copy round-16 `runs[0].effectiveArgv`, not the round-17 receipt.

## Compatibility the round-18 harness must keep

Keep these so a receipt can still satisfy the round-17 walker and the note/audit field names. Do not keep the raw-websocket sentence.

1. `cases[]` and `controls[]` for the original 11 ids and 4 control ids, each `status: 'pass'` on a real pass, with `fixtureFile` / `fixtureSha256` / `predicate.fnSha256`. H4 may be an extra case. Its bytes stay inside the round-18 receipt (hash the embedded HTML). Do not add a file under `corpus/evidence/round-17/webmcp-invoke/fixtures/`.
2. On `invoke-imperative-success`, at least one `{method: 'WebMCP.toolResponded', params: {status: 'Completed', …}}` (or `event` instead of `method`). Take it from `session.on('event')`, not from `on(method, params)` alone. Keep full `params` (`invocationId`, `status`, `output`, `errorText`, `exception`) so `SKILL.md:1954-1958` stays describable.
3. On `invoke-flags-off-control`, at least one `{error: {code: <integer>, message: <string>}}` and zero `toolResponded` `Completed` anywhere in that case. The public `newCDPSession` throw does not contain the integer (`coreBundle.js:36366-36368`). Record the thrown string unchanged as its own field. If `invoke.error.code` is filled from an exact message table (`"Tool not found"` → `-32602`, `"WebMCP domain is not enabled"` → `-32000`, `"'WebMCP.invokeTool' wasn't found"` → `-32601`, the three values in the round-17 receipt), set `codeSource` to that table's name on the same object. The round-17 counter ignores the extra key and will treat the integer as a CDP error. `CriticC2Final.md:16` must not be told those objects are `cdp.frames` from a socket.
4. For `invoke-concurrent-ids`, synthesize `{seq, dir, atMs, frame}` with `dir: 'out'` at each `send('WebMCP.invokeTool')` and `dir: 'in'` for `'event'` deliveries, and keep `lastSendSeq < firstResponseSeq`. Do not describe that log as a websocket transcript. `cdp.rawPayloadNote` in the round-17 harness (`:895`) is false for a pipe.
5. `runs[]` of the three launches: positive `pid`, the same non-empty string array on both `argv` and `effectiveArgv` (from `/proc/<pid>/cmdline`), `gone: true`, and `featureSwitches` with `note`, `lastEnableFeatures`, `lastEnableBlinkFeatures`, `lastDisableFeatures`, `webmcpInLastEnable`, `devtoolsSupportInLastDisable`, and `counts`. S1 may set `counts.disableFeatures` to 1. The booleans still have to match the last token. Do not copy the note's "two disable switches" sentence onto the new receipt.
6. `runtime.observed.chromium.realExecutableSha256` as 64-hex of `/proc/<pid>/exe`. Fill `version` from `Browser.getVersion` on the pipe. The counter ignores `version`; the note's recheck (`webmcp-invocation-round-17.md:138`) does not, and that note stays about the round-17 receipt.
7. `loopback.externalRequestCount: 0`. The blob download must not increment it.
8. `safety.cdpChannel` must change. The counter does not read it. The round-17 note `:39` does, and it must keep describing the frozen receipt. A pipe receipt that still says `raw WebSocket to 127.0.0.1:<ephemeral DevTools port>…` (`round18 :2181`) contradicts H3. State the pipe and that there is no TCP DevTools port.
9. `producer.path` / `producerSha256` are the round-18 file's own digest. Do not stamp `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.
10. Leave `measure-c2.mjs`, the round-17 receipt, and the round-17 harness on their frozen paths. The round-18 counter should not gain a `cdpErrors` walk that treats a message-table code as a frame.

## Proposed move

One change for the round-18 receipt writer: two layers, labeled.

- Observation layer: `'event'` objects `{method, params}`, plus harness `dir`/`seq` at `send` time, plus the Playwright rejection string with no invented fields inside it.
- Predicate layer: `invoke.error = {code, message, codeSource: 'exact-message-table'}` only for the three messages above, so existing predicates and, if someone substitutes the receipt, `cdpErrors`, still see an integer.

Replace `safety.cdpChannel` and the frame-note string. Keep `runs[]` argv identity and `featureSwitches` as a `/proc` audit, with counts allowed to be 1.

## Risks

The round-17 counter cannot tell a table code from a wire code. Pointing it at an r18 receipt and reading `c2_invocation_held: 1` would overclaim. `codeSource` is the visible split; the frozen counter will not enforce it. A wrong message table silently flips `-32602` / `-32601` / `-32000` predicates. `ignoreDefaultArgs: true` while merging features can drop `--remote-debugging-pipe` (`w1/SentinelHarnessDesign.md:54-62`); the counter would not notice, and `newCDPSession` would then fail closed. The current r18 file throws on the missing `DEVTOOLS_PORT_ARG` before any of this is testable.

## Verification

Not run: no browser, no `measure-c2.mjs`, no harness. Checked by read: counter walker, round-17 receipt shapes at the cited lines, Playwright 1.64.0 `coreBundle.js` at the cited lines, and the worktree round-18 harness hash above.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ConnHarnessDiff.md
