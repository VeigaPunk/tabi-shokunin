VERDICT: ISSUES

Probe complete (8/8 fixed predictions held) and the C2 predicates are now measured, not guessed.
Two findings need the L1: the pinned note's line-61 wording is wrong in a way that silently
disables a harness case, and any predicate expecting `Canceled`/`toolsRemoved` on document
destruction is false on this build.

## Deliverable and reproduction

`node .ufo/waves/round-17/probes/invoke-lifecycle.mjs` — 792 lines, raw CDP over the **browser**
websocket (`Target.attachToTarget {flatten:true}`), Node 24.21.0 built-in WebSocket, loopback
fixture server on `127.0.0.1:0`, temp profile, no lane writes. Run JSON default
`/tmp/tabi-r17-c2probe-invoke-lifecycle.json` (scratch, regenerable; `--out` overrides).
Probe sha256 `8b005ad0d6db617f5d90717692db1f03237932e534729d9ef16cd1e07a1474cd` == the run's
`producerSha256`; `verdict {"cases":8,"predictionsHeld":8,"predictionsFailed":[],"unknowns":[]}`;
wall 27,295 ms; 232 raw CDP frames (54 sent, 178 received) / 116 events retained with `Date.now()`
epochs.

Runtime identity: `Chrome/154.0.8037.97`, CDP `1.3`; launcher `/usr/bin/chromium` sha
`eaed39c3…a172b`; exec'ed engine `/usr/lib/chromium/chromium` sha `95b17db7…b330a` (identical to
`receipt.json .runtime.observed`). Flags = r16 `runs[0].effectiveArgv` verbatim minus argv[0],
`--remote-debugging-pipe`→`--remote-debugging-port=0`, r16 user-data-dir→fresh temp dir
(`launch.deltasFromR16`). Effective `/proc/<pid>/cmdline` is one space-joined title (Chromium
rewrites it): `requestedFlagsMissingFromTitle []`, both WebMCP `--enable-*` tokens present, title
starts with the engine path. `HOME`/`XDG_CONFIG_HOME` redirected because the host
`~/.config/chromium-flags.conf` exists and would inject `--ozone-platform`/`--load-extension`.

Kill proof: SIGKILL to process group `-1225440`; `childExitEvent:true`, `pidGone:true`,
`killZero:"ESRCH"`, `/proc/1225440` absent, `survivors:[]` (scan of every `/proc/*/cmdline` for the
temp profile path). Temp profile removed; no `/tmp/tabi-r17-lifecycle-*` left.

## Observed payloads and order (final run; Δms from the case's first invoke/abort response)

CDP domain placement: `WebMCP.enable` on the **browser** session → `{"code":-32601,"message":"'WebMCP.enable' wasn't found"}`;
on the **page** session → `{}`. Every case below ran on a page session with `{}` enable.

1. `invoke-unknown-tool` → `{"code":-32602,"message":"Tool not found"}`, zero `WebMCP.*` events in
   500 ms. No `invocationId` is returned, so no id-keyed assertion is possible.
2. `invoke-after-unregister` (registered with `{signal}`, then `abort()`):
   `WebMCP.toolsRemoved {"tools":[{"name":"abortable","frameId":"F15F871B…"}]}` at +0 ms;
   `getTools()` +1 ms → `count:3` (`abortable` gone; before: `count:4`);
   `invokeTool` +1 ms → `{"code":-32602,"message":"Tool not found"}`, zero further events.
   Removal is synchronous at 1 ms resolution.
3. `invoke-unregister-while-pending` → `toolInvoked` +0 ms,
   `toolsRemoved {"tools":[{"name":"slow","frameId":"F15F871B…"}]}` +1 ms, `toolResponded` +2501 ms
   `{"invocationId":"6E70D336…","status":"Completed","output":"slow:unregister-pending"}`
   (page mark `execute-return` +2501 ms). **Unregistering does not cancel an in-flight invocation.**
4. `invoke-navigation-pending` → `toolInvoked` +0, `Page.frameStartedLoading` +2,
   `Runtime.executionContextsCleared` +4 and +5, `Page.frameNavigated` +5,
   `Target.targetInfoChanged` +8, `Runtime.executionContextCreated` +10,
   `WebMCP.toolsAdded [second-tool]` +10, `Page.loadEventFired` +11. **No `toolResponded`
   (23,383 ms window, tool timer 10,000 ms), no `toolsRemoved`.** Execute did start (`execute-start`
   mark with `argc:2`), no completion mark. FrameId unchanged across navigation
   (`reportedFrameIdUnchanged:true`).
5. `invoke-after-navigation-old-name` → `{"code":-32602,"message":"Tool not found"}`, zero events.
6. `invoke-reload-pending` → `toolInvoked` +1, `frameStartedLoading` +1, `contextsCleared` +3/+4,
   `frameNavigated` +4, `targetInfoChanged` +5, `contextCreated` +7, then **four separate**
   `toolsAdded` (+8 echo, +8 slow, +9 slowlong, +9 abortable), `loadEventFired` +8.
   **No `toolResponded` (14,027 ms), no `toolsRemoved`.**
7. `invoke-close-pending` → `toolInvoked` +0, then `Target.targetInfoChanged`,
   `Target.detachedFromTarget`, `Target.targetDestroyed` all at +3 (detach **before** destroy);
   **no `toolResponded` (10,502 ms)**; `Runtime.evaluate` on that session afterwards →
   `{"code":-32001,"message":"Session with given id not found."}`.
8. `signal-form-ab` (A/B, same page, same run): `{signal}`-registered `sigopt` + bare-signal
   `sigraw`, both aborted → only `toolsRemoved {"tools":[{"name":"sigopt",…}]}`; `getTools()`
   `count:1` (`sigraw`) at +1503; `invokeTool sigopt` → `-32602 "Tool not found"`;
   `invokeTool sigraw` → `{"invocationId":"DB48B790…"}` then `WebMCP.toolResponded`
   `{"invocationId":"DB48B790…","status":"Completed","output":"sigraw:after-abort-bare"}`
   at +1505; page marks `execute-start` and `execute-return` for `sigraw`.
   **A bare `AbortSignal` as the second positional argument wires nothing.**

`toolInvoked.input` is a JSON **string** (`"{\"text\":\"nav-pending\"}"`); `toolResponded` carries
`status`∈{Completed,Canceled,Error} (only `Completed` observed) and `output`; `getTools()` returns
`inputSchema` as a string while CDP `toolsAdded` gives an object.

## Predicates the C2 harness should fix (before its run)

- `invoke-unknown-tool`: `resp.error.code === -32602 && resp.error.message === "Tool not found"`
  AND zero `toolInvoked`/`toolResponded` for that frame in ≥500 ms. Reject any predicate that
  accepts an `invocationId`.
- `invoke-after-unregister`: register via `registerTool(def, { signal })`; require
  `toolsRemoved {name, frameId}` AND `getTools()` no longer lists the name AND `invokeTool` →
  -32602 `"Tool not found"` with zero events. With a bare `AbortSignal` the case silently becomes
  a false pass (tool still invokable, `Completed`).
- `invoke-navigation-pending`: require (a) no `toolResponded` for the invocationId through
  ≥ toolTimer+500 ms, (b) no `toolsRemoved` for the old name, (c) order
  `Runtime.executionContextsCleared` → `Page.frameNavigated` → new document `toolsAdded`.
  Do not assert `Canceled`; do not assert a frameId change.
- `invoke-reload-pending` (if adopted): same as navigation, plus the new document re-announces
  one `toolsAdded` per tool.
- `invoke-close-pending` (if adopted): require `Target.detachedFromTarget` then
  `Target.targetDestroyed`, no `toolResponded`, and `-32001 "Session with given id not found."`
  for any later command on that session.
- Every invocation case must enable `WebMCP` on the **page** session and assert `{}`; a
  browser-session enable is `-32601` and would make the case unobservable.
- No case may assert `status:"Canceled"`: no cancellation path was exercised (`cancelInvocation`
  untouched), and the only status produced here is `Completed`.

## Contradictions / refinements vs pinned note `corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80`

- **:61 `lifecycle-removal` is imprecise and misleading.** It says "aborting the `signal` passed as
  the **second** argument to `registerTool`". Measured A/B: only an options dictionary
  (`registerTool(def, { signal })`) produces `toolsRemoved`; a bare `AbortSignal` in that same
  position is accepted, produces **no** `toolsRemoved`, and the tool stays invokable. The r16 probe
  itself passed `{ signal }` (`.ufo/waves/round-16/probes/WebmcpProbeLifecycle.mjs:81`), so the
  observation holds but the wording is wrong. Round-17 must say "the `signal` property of the
  options dictionary passed as the second argument". The scribe draft inherits the wording at
  `.ufo/waves/round-17/drafts/note-c2.md:46` and should be corrected at integration.
- **:62 `navigation-clears-tools` confirmed and extended.** No `toolsRemoved` on navigation; also
  no `toolResponded` for a pending invocation — it is silently dropped, still absent 23.4 s later
  (tool timer 10 s). Reload behaves identically.
- **:69-78 probe-only observations confirmed exactly**: `invokeTool`→`invocationId`; `toolInvoked`
  input is a JSON string; `toolResponded {status, output}`; `getTools()` schema string vs CDP
  object. Nothing else in :53-80 is contradicted.
- New, outside the note: close-target yields `detachedFromTarget`→`targetDestroyed` and no
  response; removal mid-flight does not cancel (`Completed` still arrives).

## Limits

Single build + single flag set, loopback fixtures only, no real site, no default-profile claim.
Ordering is host-clock `Date.now()` ms within one process; same-ms ties exist (+0 ms), so
predicates must not depend on sub-ms order. The "no response" claim for pending invocations is
bounded by the measured windows 23,383 / 14,027 / 10,502 ms, all > the 10,000 ms tool timer. The
`slow` case shows `Completed` after removal, but `cancelInvocation` and a mid-flight
`AbortSignal` delivered to `execute` were not probed.

Files written:
- `.ufo/waves/round-17/probes/invoke-lifecycle.mjs` (new; sha256 `8b005ad0…1474cd`)
- `.ufo/waves/round-17/w1/C2ProbeLifecycle.md` (this report)

No tools installed or upgraded; no git/jj commands run; no other lane files touched.
