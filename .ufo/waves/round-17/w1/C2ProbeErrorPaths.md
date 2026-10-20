VERDICT: PASS

# C2 probe — WebMCP invoke error paths (round 17, wave 1)

Probe: `.ufo/waves/round-17/probes/invoke-errorpaths.mjs` (new, this seat's only code artifact).
Runs: 4 (one full, three confirmations incl. one with launcher flags isolated); the normalized
case projection is field-for-field identical in all four (0 diffs), so every value below is
reproduced, not a one-off.

## Runtime / conditions (grounded)

- Chromium `Chrome/154.0.8037.97`; `Browser.getVersion` + protocol 1.3. Launcher `/usr/bin/chromium`
  sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`; real exe
  `/usr/lib/chromium/chromium` sha256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`
  (matches `corpus/evidence/round-16/webmcp/receipt.json` `runtime.observed.chromium`).
- Loopback `http://127.0.0.1:<ephemeral>` fixture; temp `--user-data-dir`; `--headless`;
  `--remote-debugging-port=0`; `Network.requestWillBeSent` external (non-127.0.0.1) count = **0**.
- Flags = the r16 flagged run's WebMCP tokens verbatim (`receipt.json` `runs[0].launchedArgs`):
  `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`,
  `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`,
  `--enable-blink-features=WebMCP,WebMCPTesting`. Observed `/proc/<pid>/cmdline` after isolating
  launcher config: exactly those + headless additions (`--noerrdialogs`, `--ozone-platform=headless`,
  `--ozone-override-screen-size=800,600`, `--use-angle=swiftshader-webgl`, `about:blank`).
- **Launcher caveat for C2Harness:** `/usr/bin/chromium` is an ELF launcher that merges
  `$XDG_CONFIG_HOME/chromium-flags.conf` into argv. Overriding `HOME` alone does *not* isolate it —
  this host has `XDG_CONFIG_HOME=/home/vgpnk/.config` with 5 tokens
  (`--ozone-platform=wayland`, `--ozone-platform-hint=wayland`,
  `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=~/.local/share/omarchy/...`,
  `--disable-features=Vulkan`). Observed payloads were unchanged with those tokens present (4-run
  diff = 0), but a receipt whose `runs[].argv` must be reproducible should isolate **both** `HOME`
  and `XDG_CONFIG_HOME` (or spawn `/usr/lib/chromium/chromium` directly, as
  `corpus/evidence/round-16/webmcp/protocol-domain.json` did).
- Teardown per run: SIGKILL; `process.kill(pid,0)` → ESRCH, `/proc/<pid>` absent, and no surviving
  process whose cmdline contains the profile dir. `teardown.gone = true` in all 4 runs.

## Exact observed payloads (trimmed; 8 fixture tools + 1 unknown-tool control)

Declared schema (`corpus/evidence/round-16/webmcp/protocol-domain.json`, `WebMCP` domain):
`InvocationStatus = ["Completed","Canceled","Error"]`; `toolResponded` params =
`invocationId` (req), `status` (req), `output` (opt, `any`), `errorText` (opt, string),
`exception` (opt, `Runtime.RemoteObject`).

| case (fixture `execute`) | `invokeTool` result | `toolResponded` |
|---|---|---|
| `ctl-string` → `'ctl:'+q` | `{invocationId:"95D5…BBBE"}` | `{invocationId, status:"Completed", output:"ctl:ctl-string"}` |
| `sync-throw` → `throw new Error('sync-boom')` | `{invocationId:"50D7…584E"}` | `{invocationId, status:"Error", errorText:"", exception:{type:"object",subtype:"error",className:"Error",description:"Error: sync-boom\n    at defs.ok (http://127.0.0.1:PORT/:26:34)\n    at execute (http://127.0.0.1:PORT/:21:14)",objectId:"-3533034480903070128.1.1"}}` |
| `async-reject` → `async () => { throw new Error('async-boom') }` | `{invocationId:"A4BD…D9CF"}` | `{invocationId, status:"Error", errorText:"", exception:{type:"object",subtype:"error",className:"Error",description:"Error: async-boom\n    at http://127.0.0.1:PORT/:27:42\n    at execute (http://127.0.0.1:PORT/:21:14)",objectId:"…"}}` |
| `reject-string` → `Promise.reject('plain-string-reason')` | `{invocationId:"EF21…9B57"}` | `{invocationId, status:"Error", errorText:"", exception:{type:"string",value:"plain-string-reason"}}` |
| `returns-object` → `({ok:true,n:3})` | `{invocationId:"4972…A629"}` | `{invocationId, status:"Completed", output:{ok:true,n:3}}` |
| `returns-number` → `42` | `{invocationId:"0ADA…7F72"}` | `{invocationId, status:"Completed", output:42}` |
| `returns-null` → `null` | `{invocationId:"FB38…468C"}` | `{invocationId, status:"Completed", output:null}` (key **present**) |
| `returns-undefined` → `{}` (no return) | `{invocationId:"BE5C…D7D5"}` | `{invocationId, status:"Completed", output:"undefined"}` (string!) |
| `unknown-tool` (`no-such-tool-r17`) | **JSON-RPC error `{code:-32602, message:"Tool not found"}`** | no `WebMCP.*` event at all |

Raw command/event pair, verbatim (sync-throw):

```
→ {"id":10,"method":"WebMCP.invokeTool","params":{"frameId":"…","toolName":"sync-throw","input":{"q":"sync-throw"}}}
← {"id":10,"result":{"invocationId":"50D725B37C86BD8950F199AFBB73584E"}}
E {"method":"WebMCP.toolInvoked","params":{"toolName":"sync-throw","frameId":"…","invocationId":"50D725B37C86BD8950F199AFBB73584E","input":"{\"q\":\"sync-throw\"}"}}
E {"method":"WebMCP.toolResponded","params":{"invocationId":"50D725B37C86BD8950F199AFBB73584E","status":"Error","errorText":"","exception":{…}}}
```

Cross-cutting observations:
- `invokeTool` **never errors for tool-level failure** in all 8 tool cases (`invokeToolNeverErrored:true`);
  only the unresolvable name is a command error. The command response precedes the events
  (`respondedAfterCommandMs` 0–1 ms, never negative).
- `errorText` is **present but the empty string** on every Error response; the message lives only in
  `exception`. `output` is **absent** on every Error response.
- Page side: `execute` received the input as an **object** (`typeof "object"`, JSON identical to the
  sent `{q:…}`); `toolInvoked.input` is that same object as a **JSON string**. All 8 tools registered;
  `toolsAdded` count 8; CDP `toolsAdded.tools[].inputSchema` is an **object** (corroborates note :74).
- Zero `Runtime.exceptionThrown` and zero `Runtime.consoleAPICalled` events: the throw is contained
  by the agent, the page never sees an unhandled error.

## What a harness predicate should assert

- **`invoke-imperative-throws`**: `invokeTool` resolves with an `invocationId`; then assert on the
  event with that id: `status === "Error"`, `!("output" in params)`, `params.exception.subtype === "error"`,
  `params.exception.className === "Error"`, `params.exception.description` starts with `"Error: sync-boom"`
  and contains an `at ` stack frame, and `params.errorText === ""`. Do **not** assert `errorText` holds
  the message.
- **`invoke-imperative-rejects`**: identical, with `description` starting `"Error: async-boom"`. Add the
  string-rejection fixture case if a predicate reads messages: a non-`Error` reason gives
  `exception:{type:"string",value:"plain-string-reason"}` with **no** `subtype`/`className`/`description`,
  so read `exception.description ?? exception.value`; match the case itself on `status === "Error"` +
  `exception` presence, not on `className`.
- **Structured / non-string output**: never assert `typeof output === "string"` and never treat a
  non-string `output` as failure — `status` is the sole discriminator. A `null` return keeps
  `output` present with value `null` (distinguish "absent" via `in`, not via falsiness); a `undefined`
  return is delivered as the **string** `"undefined"`, so a fixture returning `undefined` is
  indistinguishable from one returning `"undefined"` by CDP alone — assert `status === "Completed"`
  and `output === "undefined"` (string), never `output == null`.
- **Correlation**: join on `invocationId` from the command response; assert `toolInvoked.input` is a
  JSON **string** that parses to the sent object, while the page's `execute` saw an object.
- **`invoke-unknown-tool`**: assert the command rejects with `code === -32602` and `message === "Tool not found"`
  **and** that no `toolInvoked`/`toolResponded` arrives; do not wait on an event for this case.
- **Negative assertions**: no `Runtime.exceptionThrown`/`consoleAPICalled` may be expected as evidence
  of a throwing tool (absence is the observed behaviour).

## Versus `corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80`

- No outright contradiction. Closest is **:72-73** — "`toolResponded` carries `status`/`output` (Invoke,
  loopback echo tool only)". True for the echo case, but incomplete: on `status:"Error"` the event
  carries `status`/`errorText`/`exception` and **no `output`**, matching the declared schema's
  "Missing if `status` is anything other than Completed". A reader who builds the r17 harness from
  that clause alone would over-assert. Suggested r17 wording: *for `Completed`, `output` carries the
  tool's return value and is **any** JSON type (string, number, object, null; `undefined` arrives as the
  string `"undefined"`); for `Error`, `output` is absent and `exception` carries the thrown value, with
  `errorText` present but empty on 154.*
- Reconfirmed as written: `toolInvoked` carries the input as a JSON **string** (:72), `invokeTool`
  returns an `invocationId` (:71), CDP `inputSchema` is an object (:74).
- New datapoint not in :53-80: the declared status enum is `Completed|Canceled|Error`
  (`protocol-domain.json` `InvocationStatus`); only `Completed` and `Error` were observed
  (`Canceled` needs `cancelInvocation`, out of scope here).

## Limits / risks

- One build (`154.0.8037.97`), one host, loopback only; no real site, no default profile.
- `Canceled` status, `invoke-input-schema-mismatch`, declarative tools and navigation-pending are
  other seats' cases and were **not** exercised here.
- Why `undefined` becomes `"undefined"` is unobserved mechanism — `[INFERENCE]` the agent stringifies
  an undefined tool result; only the wire value is grounded.
- Earlier run artifacts live in `/tmp/tabi-r17-invoke-errcases-*/` (ephemeral by contract — this seat
  owns only the probe script); every payload needed is transcribed above and the probe is re-runnable:
  `node .ufo/waves/round-17/probes/invoke-errorpaths.mjs --out <path>.json` (~1.2 s).
- No tools installed or upgraded; no package-manager transactions.

Files written:
- `.ufo/waves/round-17/probes/invoke-errorpaths.mjs` (new)
- `.ufo/waves/round-17/w1/C2ProbeErrorPaths.md` (this report)
