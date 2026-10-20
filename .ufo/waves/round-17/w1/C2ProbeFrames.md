VERDICT: PASS

# C2ProbeFrames — WebMCP frame attribution + invocation targeting (round-17 wave 1)

First falsifier for C2's `invoke-iframe-frameid` / permissions-policy / declarative predicates.
Discovery probe, not the receipt harness (C2Harness owns `scripts/webmcp-invoke-round17.mjs`).

## What was run

`node .ufo/waves/round-17/probes/invoke-frames.mjs --out /tmp/tabi-r17-c2-frames/invoke-frames.json`
(exit 0; 17 fixed predictions, 16 hold, 1 contradicted, 0 unobservable). Ran 3x: default
`--button-wait-ms 12000` (final run sha-matched) and once 30000; all non-button observations
identical. Identity: Chrome/154.0.8037.97, Node v24.21.0, `/usr/bin/chromium` sha256
`eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`. Flags exactly the r16
flagged run (`corpus/evidence/round-16/webmcp/receipt.json` runs[0].launchedArgs:
`--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`,
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`,
`--enable-blink-features=WebMCP,WebMCPTesting`) plus `--headless --remote-debugging-port=0
--no-first-run --no-default-browser-check --disable-gpu --user-data-dir=<temp>`. Late
`/proc/<pid>/cmdline` read: both flag tokens present as substrings (Chromium rewrites cmdline
to one space-joined string; `cmdlineLooksJoined:true`) and it names our temp profile.
HOME/XDG_CONFIG_HOME redirected to temp, so `chromium-flags.conf` contributed nothing (extra
tokens were headless defaults). Two loopback servers, 127.0.0.1 ephemeral ports only.

## Observed payloads (trimmed; ids abbreviated)

Frame tree / tools (final run; main frameId `A9CDFB7F…`): main `http://127.0.0.1:<A>/`;
same-origin iframes `?name=same` and `?name=same-deny` (`allow="tools 'none'"`); cross-origin
(port B) `?name=cross` (`allow="tools"`) and `?name=cross-default` (no allow).
`WebMCP.toolsAdded` (7 tools, all on the ONE page session `44F03782…`; no OOPIF child target
attached even with `Target.setAutoAttach{flatten:true}` armed): `echo-main@A9CDFB7F…`
(stackTrace, no backendNodeId) · `echo-same@1032ACBA…`, `decl-same@1032ACBA…`
(backendNodeId 1), `decl-btn-same@1032ACBA…` (backendNodeId 3) · `echo-cross@AA628051…`,
`decl-cross@AA628051…` (backendNodeId 10), `decl-auto-cross@AA628051…` (backendNodeId 12,
`"annotations":{"autosubmit":true}`). `frameIdAgreement`: sameToolVsTree, crossToolVsTree,
declSameVsTree, sameToolDiffersFromMain all true — iframe tool frameIds equal the
`Page.getFrameTree` child frameIds and differ from the main frameId.
Invocation (same page session; ownership is by frameId, not session):
```
send WebMCP.invokeTool {"frameId":"1032ACBA…","toolName":"echo-same","input":{"text":"same-own"}}
recv {"result":{"invocationId":"F4C91E05…"}}
ev  WebMCP.toolInvoked {"toolName":"echo-same","frameId":"1032ACBA…","invocationId":"F4C91E05…","input":"{\"text\":\"same-own\"}"}
ev  WebMCP.toolResponded {"invocationId":"F4C91E05…","status":"Completed","output":"echo-same:same-own"}
```
Cross-origin iframe tool same shape: `echo-cross` with `frameId:"AA628051…"` → `Completed`,
`output:"echo-cross:cross-own"`. Wrong frameId — both directions — is a CDP protocol error:
```
{"frameId":"A9CDFB7F…(main)","toolName":"echo-same"}   → {"error":{"code":-32602,"message":"Tool not found"}}
{"frameId":"1032ACBA…(iframe)","toolName":"echo-main"} → {"error":{"code":-32602,"message":"Tool not found"}}
{"frameId":"A9CDFB7F…(main)","toolName":"echo-cross"}  → {"error":{"code":-32602,"message":"Tool not found"}}
```
No `toolInvoked`/`toolResponded` for a failed `invokeTool`. Invoking in a policy-denied frame
(`same-deny`, `cross-default`) gives the same `-32602 Tool not found`. Page-side `execute`
received a parsed OBJECT (`inputType:"object"`, `{"text":"same-own"}`) while
`toolInvoked.input` is the compact JSON string — both shapes must be asserted.

Permissions policy (page report via postMessage; `document.modelContext` is PRESENT in every
frame, including denied ones):
```
{"ok":false,"errName":"NotAllowedError","errMessage":"Access to the feature \"tools\" is disallowed by permissions policy.","frame":"same-deny","hasModelContext":true}
{"ok":false,"errName":"NotAllowedError","errMessage":"Access to the feature \"tools\" is disallowed by permissions policy.","frame":"cross-default","hasModelContext":true}
{"ok":true,"tool":"echo-same","frame":"same","hasModelContext":true}
{"ok":true,"tool":"echo-cross","frame":"cross","hasModelContext":true}
```
So: same-origin default allowed; `allow="tools 'none'"` denied; cross-origin default ('self')
denied; cross-origin `allow="tools"` allowed. No `toolsAdded` (imperative OR declarative) for
either denied frame.

Declarative invocation (all via `WebMCP.invokeTool`, frameId of the owning iframe):
- plain form (no button, no `toolautosubmit`): `toolResponded {"status":"Error","errorText":
  "No submit button was found, but for a form without `toolautosubmit`, there must be a
  submit button"}`.
- `toolautosubmit` form: `Page.frameRequestedNavigation {"frameId":"AA628051…",
  "reason":"formSubmissionGet","url":"http://127.0.0.1:<B>/frame?text=decl-auto-submit",
  "disposition":"currentTab"}` then `toolResponded {"status":"Completed","output":[]}`;
  `toolsRemoved` stayed empty.
- `<button type="submit">` form: `invokeTool` → `invocationId`, `toolInvoked` fires, then
  **no `toolResponded` and no navigation** — 12 s and 30 s runs. Only contradicted prediction
  (`expect Completed`, `observed no_response`). Do not use a button-only form as a positive.

Browser kill: `{"pid":1625587,"sent":"SIGKILL","exited":true,"exitSignal":"SIGKILL",
"pidGone":true,"pidAlive":false,"leftoverPidsBeforeSweep":[],"leftoverPidsAfterSweep":[],
"profileRemoved":true}`; `pgrep -af tabi-r17-invokeframes` → none.

## What a harness predicate should assert (for C2Harness)

1. `invoke-iframe-frameid`: map tool→frame by `toolsAdded.frameId` and cross-check against
   `Page.getFrameTree` URL; assert iframe tool frameId ≠ main frameId. Imperative tools carry
   `stackTrace` and no `backendNodeId`; declarative carry `backendNodeId` and no `stackTrace`.
   Key on frameId, not session — a same-site cross-origin (port-different) iframe is in-process
   here and emits on the page session.
2. Positive: `invokeTool{frameId:<owning iframe>, toolName, input}` → result has 24-hex
   `invocationId`; `toolInvoked` echoes same id/frameId with `input` === compact JSON string;
   `toolResponded` same id, `status:"Completed"`, exact fixture output.
3. Negative (frame gate): same call with the main frameId (and the reverse direction) →
   error exactly `{code:-32602,message:"Tool not found"}` AND zero WebMCP events for that
   request. This same predicate covers `invoke-unknown-tool` and denied-frame invocation.
4. Permissions case: four-iframe fixture as above; assert `hasModelContext` true even when
   denied; assert `NotAllowedError` with the exact message for `allow="tools 'none'"`
   (same-origin) and for a cross-origin frame without `allow`; assert registration +
   toolsAdded for cross-origin `allow="tools"`; assert no `toolsAdded` for denied frames
   (declarative forms included).
5. `invoke-declarative-form`: use `toolautosubmit` for the deterministic positive
   (`Completed`, `output:[]`, plus `Page.frameRequestedNavigation` with
   `reason:"formSubmissionGet"` to the form action URL). For the plain-form negative assert
   `status:"Error"` and `errorText` containing `No submit button was found`. Never block on a
   button-only form.
6. Page-side vs CDP-side input shape: assert `execute` receives an object while
   `toolInvoked.input` is a string.

## Cross-check vs corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80

No contradiction found. Confirmations/extensions:
- `:65` frame-tools ("same-origin iframe's declarative tool arrives with the iframe's own
  frameId"): holds, and extends to imperative tools and to a cross-origin (second loopback
  port) iframe with `allow="tools"`.
- `:66` opaque-sandboxed-iframe (modelContext exists, `registerTool` rejects `NotAllowedError:
  Access to the feature "tools" is disallowed by permissions policy.`, no tool announced):
  same rejection text and no-announcement for both the `allow="tools 'none'"` and
  cross-origin-default denial paths.
- `:62` navigation-clears-tools (navigation sends no `toolsRemoved`): holds for the
  declarative auto-submit navigation (`toolsRemoved` count stayed 0).
- `:70-73` probe-only invoke shape (`invocationId`; `toolInvoked.input` a JSON string;
  `toolResponded.status/output`): holds; adds the page-side object-vs-string datum and the
  exact `-32602 "Tool not found"` frame gate.
- `:67` data:-URL announcement divergence not retested. New datum: permissions-policy denial
  does NOT reproduce that CDP-announcement bypass (declarative forms in denied frames were
  not announced).

## Risks / limits

- "Cross-origin" here = second port on 127.0.0.1 (same site) → in-process; no OOPIF attach event
  observed (`attachedTargets` = page only). A truly cross-site iframe is untested; a harness
  should keep frameId-based predicates and may keep auto-attach defensively.
- The `toolautosubmit` navigation replaces the query string (`?text=…`), so the probe's
  post-submit document is its `unknown-frame` route; no claim about post-navigation tool state
  beyond "no `toolsRemoved`".
- Button-path no-response cause is not established ([INFERENCE] possible missing user
  activation/default-action dependency); only the 12 s and 30 s observations are claimed.
- Only the flagged launch was probed (no flags-off control; r16 owns that control).
- Evidence JSON (not committed, outside my ownership): `/tmp/tabi-r17-c2-frames/invoke-frames.json`
  (producerSha256 `5b44de0a700b63fe21a7ff3680b6478678e9123dbe4f64cd7f8379a0a18c9131`) and
  `invoke-frames-btn30.json`. The probe writes only to `--out`; no tool install/upgrade was
  performed (no pacman; Node 24.21.0 and Chromium 154 preinstalled).

## Files written

- `.ufo/waves/round-17/probes/invoke-frames.mjs` (new; sha256
  `5b44de0a700b63fe21a7ff3680b6478678e9123dbe4f64cd7f8379a0a18c9131`, 888 lines)
- `.ufo/waves/round-17/w1/C2ProbeFrames.md` (this report)
