VERDICT: PASS

# C2 probe — concurrent invocations (first falsifier for `invoke-concurrent-ids`)

Owner: TabiR17.C2ProbeConcurrency-2. Probe: `.ufo/waves/round-17/probes/invoke-concurrency.mjs`
(sha256 `9eb7a256b5cf16b0722d0230215ff7593ffe7e3b631d2942556512d8896af302`), raw receipt next to it
(`invoke-concurrency.json`, `capturedAt 2026-10-20T15:52:17.090Z`, same producer sha).
Run 4x (1 retained + 3 `/tmp` repeats): identical predicate outcomes, identical ordering results,
`gone:true`, 0 external requests each time.

## Runtime (grounded)

- Chromium `Chrome/154.0.8037.97` (`/json/version`); launch `/usr/bin/chromium` sha
  `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`; real exe
  `/usr/lib/chromium/chromium` sha `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`
  — both identical to r16 receipt `runtime.observed.chromium` (receipt.json).
- Flags actually on the process (`/proc/<pid>/cmdline`): `--headless --remote-debugging-port=0
  --host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1
  --enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
  --enable-blink-features=WebMCP,WebMCPTesting --user-data-dir=<temp>`; `HOME` also temp so
  `~/.config/chromium-flags.conf` could not inject (the r16 harness's `minimalBrowserEnv` pattern).
- Loopback: fixture on `127.0.0.1:<ephemeral>`, requests `["/","/favicon.ico"]`,
  `externalRequestCount: 0`. Only fixture tools `echo`/`delay`/`boom` invoked (no side effects).
- Shutdown: `spawnPid 701307`, `spawnPidPresent:false`, `survivors:[]`, `gone:true`; temp profile/home removed.

## Exact observed payloads (trimmed, one run)

Requests sent back-to-back in one tick (no await between them):

```
out {"id":6,"method":"WebMCP.invokeTool","params":{"frameId":"8323…","toolName":"delay","input":{"text":"alpha","ms":500}}}
out {"id":7,"method":"WebMCP.invokeTool","params":{"frameId":"8323…","toolName":"delay","input":{"text":"beta","ms":50}}}
```

Responses and events (arrival ms; sessions s1=invoker):

```
in 352.644 {"id":6,"result":{"invocationId":"A3F08C4DA6E4B4F0C3B129BDA88EA354"}}
in 353.009 {"method":"WebMCP.toolInvoked","params":{"toolName":"delay","frameId":"8323…","invocationId":"A3F08…","input":"{\"ms\":500,\"text\":\"alpha\"}"}}
in 353.056 {"id":7,"result":{"invocationId":"22DE82C49BCFAB9037B7C42282B764F0"}}
in 353.281 {"method":"WebMCP.toolInvoked","params":{"toolName":"delay","frameId":"8323…","invocationId":"22DE…","input":"{\"ms\":50,\"text\":\"beta\"}"}}
in 403.399 {"method":"WebMCP.toolResponded","params":{"invocationId":"22DE…","status":"Completed","output":"delay:beta:50"}}
in 853.262 {"method":"WebMCP.toolResponded","params":{"invocationId":"A3F0…","status":"Completed","output":"delay:alpha:500"}}
```

Different tools at once, throwing tool (group B event order, ms):

```
857.366 toolInvoked  delay  0361…
857.410 toolInvoked  echo   687F…
857.438 toolResponded echo   687F…  status Completed  output "echo:fast"
857.531 toolInvoked  boom   B6D2…            ← toolInvoked arrives AFTER another invocation's response
857.560 toolResponded boom   B6D2…  status Error
1157.615 toolResponded delay 0361… status Completed  output "delay:slow:300"
```

`status:"Error"` payload is not `output`-carrying (protocol says `output` optional unless Completed):

```
{"invocationId":"0361…","status":"Error","errorText":"","exception":{"type":"object","subtype":"error",
 "className":"Error","description":"Error: boom:kaboom\n    at execute (http://127.0.0.1:45491/:29:61)",
 "objectId":"2280425722441059724.2.1"}}
```

Two identical `echo {"text":"dup"}` in one tick: ids `B6DD…` and `BEB7…` (both distinct), event order
`toolInvoked1, toolResponded1, toolInvoked2, toolResponded2` (a toolInvoked after a response).

Two sessions invoking concurrently (`delay` from-s1 150 ms on s1, from-s2 80 ms on s2). Both enabled
sessions received *both* invocations, exactly once each, with no duplicate in either stream:
`copiesPerStream [{id4D9F…, s1:2, s2:2}, {idCB8B…, s1:2, s2:2}]`, `s1SeesS2:true`, `s2SeesS1:true`.
Observer-only session s2 (no invoke) also received `toolInvoked`+`toolResponded` for s1's invocation
(`s2SawInvocation:true`); on `WebMCP.enable` it was replayed a `toolsAdded` snapshot
`["boom","delay","echo"]` (alphabetical, not registration order).

`invokeTool` ack returns before completion (alpha: ack 352.644, response 853.262); `preserve`: each ack
carries exactly `{"invocationId":…}` — no status/output. All 9 ids match `/^[0-9A-F]{32}$/`, 9 distinct.

Ordering: `toolInvoked` submission order held (delay, echo, boom) but `toolResponded` followed
completion order (`echo`, `boom`, `delay`); `phase` results: A `separated`, B `interleaved`,
C `interleaved`, D `separated` — stable across 4 runs. Page-side `execute` started both group-A
tools at `26.8/26.9 ms` and both group-D tools at `1329 ms`, i.e. genuinely overlapping.

## What a harness predicate should assert (for `invoke-concurrent-ids`)

1. **Ids**: every `invokeTool` result has exactly `{invocationId}` matching `/^[0-9A-F]{32}$/`; all ids
   in the case are distinct, including two identical tool+input submissions. (Observed 9/9.)
2. **Correlate only by id, and only in this direction**: build `id → {toolName, frameId, input}` from
   `toolInvoked` (or from the harness's own request), never from `toolResponded`. `toolResponded`
   params are exactly `{invocationId, status, output?}` (plus `errorText`, `exception` on Error) — no
   `toolName`, no `frameId`, no CDP command id (protocol event schema confirms; observed keys
   `["errorText","exception","invocationId","output","status"]`).
3. **Cardinality per session stream**: exactly one `toolInvoked` and one `toolResponded` per
   invocationId per session. If the harness opens a second enabled session, deduplicate by
   `(session, invocationId, method)`: events are broadcast to every enabled session on the target
   (`s1SeesS2 && s2SeesS1`), and no event carries a session/client field, so a consumer cannot tell
   which session issued an invocation from the event stream alone — only its own command response can.
4. **Do not assert phase separation**: a `toolInvoked` may arrive after another invocation's
   `toolResponded` (groups B and C, every run). Match strictly by id, never by "all invoked, then all
   responded".
5. **Do not assert a single global ordering**: completion order (beta before alpha, 50 ms vs 500 ms)
   is stable and assertable; submission order of `toolResponded` is not. `toolInvoked` order matched
   submission order here but is not a documented guarantee.
6. **Ack is not completion**: wait for `toolResponded` per id; never infer status from the command
   result or from `toolInvoked`.
7. **No cross-talk**: each output must embed its own input (`delay:<text>:<ms>`, `echo:<text>`);
   passing this over overlapping invocations is the actual concurrency-correctness check.
8. **Input normalization**: `toolInvoked.input` is a JSON **string** with keys alphabetically sorted
   (sent `{"text":"alpha","ms":500}` → `"{\"ms\":500,\"text\":\"alpha\"}"`); compare canonically,
   never by raw string or by JS object insertion order. (Page-side `execute` received the object with
   the same values; 10/10 page calls matched.)
9. **Error status**: a throwing `execute` yields `status:"Error"`, `errorText:""` (empty) and
   `exception` as a RemoteObject; assert on `status` plus `exception.description`, not `errorText`.
10. **Observer sessions**: enabling `WebMCP` on a second session after registration replays a
    `toolsAdded` snapshot; do not count that replay as a registration made by that session.

## Versus `corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80`

No contradiction. Lines 71-73 ("`WebMCP.invokeTool{frameId, toolName, input}` returns an
`invocationId`, then `toolInvoked` carries the input as a JSON string and `toolResponded` carries
`status`/`output`") reproduce exactly. Four sharpenings the note does not state and a naive harness
would get wrong:

- `invokeTool` is an immediate ack (`invocationId` only); completion is event-only.
- `toolResponded` carries no `toolName`/`frameId`, so response→tool needs `toolInvoked` (or the
  request record); on `status:"Error"` it carries `errorText` (empty here) + `exception`, no `output`.
- Events are broadcast to every enabled session on the target; an observer sees foreign invocations,
  and no event identifies its issuing session.
- `toolInvoked.input` is key-sorted JSON text, and `WebMCP.enable` replays the current
  `toolsAdded` snapshot (alphabetical names).

## Files written

- `.ufo/waves/round-17/probes/invoke-concurrency.mjs` (new; sha256 above)
- `.ufo/waves/round-17/probes/invoke-concurrency.json` (raw CDP transcript: per-group request/
  response/event frames with ms timestamps, s1+s2 streams, protocol domain, predicate results,
  runtime/sha, shutdown)
- `.ufo/waves/round-17/w1/C2ProbeConcurrency.md` (this report)

Read-only consulted: PLAN.md, r16 receipt/flags/probe, `webmcp-chromium-loopback-round-16.md:39-103`,
`scripts/webmcp-loopback-round16.mjs:60-120,228-300`. No git/jj write, no pacman, no tool installs;
REA MCP not used. /tmp repeat receipts removed.
