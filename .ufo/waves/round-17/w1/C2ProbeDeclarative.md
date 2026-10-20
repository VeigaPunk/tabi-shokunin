VERDICT: PASS

# C2 — declarative `<form toolname>` invocation over raw CDP (round 17)

Probe: `.ufo/waves/round-17/probes/invoke-declarative.mjs` (new). Run:
`node .ufo/waves/round-17/probes/invoke-declarative.mjs --out /tmp/tabi-r17-decl-invoke-6.json`
Chromium `154.0.8037.97` (`/usr/bin/chromium`, launcher sha256 `eaed39c3…a172b`, main exe
`/usr/lib/chromium/chromium`), Node `v24.21.0`. Raw CDP on the **browser** websocket
(`/json/version` → `Target.createTarget` → `Target.attachToTarget{flatten:true}`), every
command/response and event recorded. Flags = r16 receipt flagged run
(`corpus/evidence/round-16/webmcp/receipt.json` `.runs[0].effectiveArgv`, playwright defaults
included) with one documented deviation: `--remote-debugging-pipe` → `--remote-debugging-port=0`
(websocket transport). `HOME`/`XDG_CONFIG_HOME` redirected to a temp dir like r16 (without it the
host `chromium-flags.conf` leaked `--ozone-platform=wayland` and the copy-url extension — measured
in run 5, absent in runs 6–8). Fixture: `127.0.0.1:0`, four declarative tools + one non-tool
control form; `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`.
8 runs total; runs 3–8 exit 0 with `checks=42, checked=26, failed=0, informational=16` and
byte-identical semantic payloads (runs 6/8 compared field-by-field after the last edit). Runs 1–2
were probe iterations with fixture/check defects and are not evidence (run 1 had no submit
listeners and accidentally measured the unhandled-navigation path that run 3+ reproduces
deliberately).

## Answers (all measured, loopback only)

1. **Form is filled.** The fill is already visible when the `invokeTool` response is processed and
   the submit-handler snapshot carries the same values: `q` = `round17-decl-query`,
   `<select name=color>` = `green` (selectedOptions `["green"]`),
   `<input type=checkbox name=agree>` `checked=true`, FormData `agree=on`.
2. **Submit event + flags.** A real (trusted) `SubmitEvent` fires; the page sees
   `e.agentInvoked === true` (getter on `SubmitEvent.prototype`), `e.isTrusted === true`,
   `e.submitter === null` for a buttonless autosubmit form, `e.defaultPrevented === false` at
   entry, `form.matches(':tool-form-active') === true`, and `e.respondWith` is a function
   (length 1) whose call returns `undefined`. Response channel = `preventDefault()` then
   `respondWith(promise)`.
3. **`toolResponded` carries** (four distinct shapes observed):
   - `{status:"Completed", output:<the exact respondWith resolved value>}` when the page responds;
   - `{status:"Error", errorText:"The site has a programming error: it called preventDefault() on
     the 'submit' event, without also calling respondWith() with the tool result"}` — **no
     `output` property** — for preventDefault-without-respondWith (nothing on the page console);
   - `{status:"Completed", output:[]}` (empty array) when the form submits and **navigates**
     with no handler;
   - no event at all (invocation stays pending) when the form lacks `toolautosubmit` and the page
     never submits; it completes only after the page calls `form.requestSubmit()`.
4. **`<select>`/checkbox** are driven from the schema-typed input (`color:"green"` selects the
   option; `agree:true` checks the box) — no string coercion needed at the CDP boundary.
5. **`toolautosubmit` gates who submits.** With it, the invocation itself dispatches submit.
   Without it, the invocation fills the form, emits `toolInvoked`, and waits: the page must
   submit; the resulting submit event still has `agentInvoked === true` (page-initiated
   `requestSubmit()` while an invocation is pending). A user submit with no invocation pending
   has `agentInvoked === false` (control).
6. `toolInvoked` carries `input` as a JSON **string** with alphabetically ordered keys
   (`{"agree":true,"color":"green","q":"round17-decl-query"}`), matching the sent object modulo
   key order; `invokeTool` itself returns `{invocationId}` before any tool event.

## Exact payloads (trimmed; run 6 ids)

```
invokeTool  → {frameId:"833FE0AB…819", toolName:"decl_autosubmit",
               input:{q:"round17-decl-query", color:"green", agree:true}}
            ⇐ {invocationId:"90317026273D3424976F1E9B8CCF1C15"}
toolInvoked   {toolName:"decl_autosubmit", frameId:"833FE0AB…819",
               invocationId:"9031…1C15", input:"{\"agree\":true,\"color\":\"green\",\"q\":\"round17-decl-query\"}"}
toolResponded {invocationId:"9031…1C15", status:"Completed",
               output:{from:"f-autosubmit", agentInvoked:true,
                       values:{q:"round17-decl-query", color:"green", agree:"on"}}}
page submit   {event:"submit", ctor:"SubmitEvent", agentInvoked:true, isTrusted:true, submitter:null,
               snapshot.toolFormActive:true,
               snapshot.formData:{q:"round17-decl-query", color:"green", agree:"on"},
               snapshot.raw.agree.checked:true}
               + respondWith() call returned "undefined"
no toolautosubmit (invoke)      → no submit, toolResponded absent for 2500 ms
  …page requestSubmit()        → submit {agentInvoked:true, toolFormActive:true}
                               → toolResponded {status:"Completed", output:{from:"f-nosubmit", …}}
respondWith before preventDefault → throws InvalidStateError: Failed to execute 'respondWith' on
  'SubmitEvent': To call respondWith, you must first call preventDefault.  (second call after
  preventDefault then succeeds: Completed + its value)
preventDefault, no respondWith  → {status:"Error", errorText:"The site has a programming error: …"}
no handler + toolautosubmit     → Page.frameNavigated http://127.0.0.1:43625/submitted?q=round17-navigate
                                  server GET /submitted?q=round17-navigate
                                  toolResponded {status:"Completed", output:[]}
toolsAdded (decl_autosubmit)    {name, description, inputSchema{…}, annotations:{autosubmit:true},
                                 frameId:"833FE0AB…819", backendNodeId:2}
getTools()                      inputSchema is a JSON *string* (anyOf+enum for <select>,
                                type:"boolean" for checkbox); CDP gives the object
```

## What a C2 harness predicate should assert (`invoke-declarative-form`)

Fixture must use `toolautosubmit` (buttonless) + a handler calling `preventDefault()` then
`respondWith(Promise.resolve(<object>))`; include text, single `<select>`, checkbox.
1. Command: `WebMCP.invokeTool{frameId,toolName,input}` returns an `invocationId` string.
2. `toolInvoked`: `toolName`/`frameId` match; `typeof input === 'string'`; `JSON.parse(input)`
   deep-equals the sent object (compare order-insensitively — the build sorts keys).
3. Page observation recorded from inside the submit handler: `ctor === 'SubmitEvent'`,
   `agentInvoked === true`, `isTrusted === true`, `:tool-form-active` matches,
   text/select/checkbox values equal the input (checkbox FormData `on`, `checked === true`),
   `respondWith` call returns `undefined`.
4. `toolResponded`: `status === 'Completed'` and `output` deep-equals the respondWith value
   **verbatim** (no wrapper, no JSON string) — do not assert an `output` field on Error.
5. No navigation: zero `Page.frameNavigated` and zero HTTP hits to the form action during the case.
6. Evidence set to commit: command request+result, both events verbatim, the page record, the
   HTTP/nav absence, and browser pid/exe/gone.
Do **not** wait for `toolResponded` without a page submit when the form lacks `toolautosubmit`,
and do not read `agentInvoked === true` as "the browser dispatched the submit" (a page
`requestSubmit()` during a pending invocation is also `true`). For `invoke-navigation-pending`:
the invocation does **not** remain pending across navigation — it responds `Completed` + `output:[]`.

## Versus `corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80`

No contradiction. `:64` (`declarative-form-tool`: derived schema, `toolparamdescription` →
description, `<select>` anyOf/enum) and `:66-67` (`invokeTool` → invocationId; `toolInvoked` input
as JSON **string**; `toolResponded` status/output; `getTools()` schema as string) hold for
declarative tools. Two additions the note does not yet state, and which the harness must not
generalize from the imperative echo: (a) an unhandled declarative submit that navigates still
reports `status:"Completed"` with `output:[]`; (b) `SubmitEvent.agentInvoked` is `true` on a
page-initiated `requestSubmit()` while an invocation is pending. `submitter` is `null` in every
probe submit here (`requestSubmit()` with no submitter, and the buttonless autosubmit form), so
no submit-button identity may be asserted.

## Safety / lifecycle

Loopback `127.0.0.1` only; fresh temp `--user-data-dir` and temp `HOME`/`XDG_CONFIG_HOME`;
browser pid `895313` → `/proc/895313/exe` `/usr/lib/chromium/chromium`; SIGKILL, then
`/proc/<pid>` scan for the profile path: `strayAfterFirstKill=[]`, `strayAfterSecondKill=[]`,
`pidAliveAfterKill=false`, `gone=true`; both temp dirs removed. Raw full log (157 KB) kept at
`/tmp/tabi-r17-decl-invoke-6.json` and `-8.json` (runs 1–8 same dir).
No tools installed or upgraded (no pacman/uv/npx/install of any kind).

Files written:
- `.ufo/waves/round-17/probes/invoke-declarative.mjs` (new; prints JSON to stdout or `--out`)
- `.ufo/waves/round-17/w1/C2ProbeDeclarative.md` (this report)
