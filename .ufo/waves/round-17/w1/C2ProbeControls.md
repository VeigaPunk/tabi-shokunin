VERDICT: PASS

# C2ProbeControls — WebMCP.invokeTool controls + inputSchema (Chromium 154, loopback)

Producer (new; the only lane file written besides this report):
`.ufo/waves/round-17/probes/invoke-controls.mjs` — sha256
`382754daa92f9f916dab28130a9e2b9ab5081d1857fb5979e8fb7b124d0d0e41`, 652 lines.
Run: `node .ufo/waves/round-17/probes/invoke-controls.mjs --out /tmp/r17-invoke-controls-final.json`
→ exit 0, ≈6.5 s. Independent runs are equal after dropping timestamps/invocationIds;
`summary.allBrowsersGone: true` in both.
Runtime: launcher `/usr/bin/chromium` sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`;
browser `/usr/lib/chromium/chromium` sha256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`
(reads match r16's `runtime.observed`); `Browser.getVersion` → `Chrome/154.0.8037.97`; Node v24.21.0.
Fixture: inline loopback page, one imperative tool `echo`, `inputSchema
{"type":"object","properties":{"text":{"type":"string"}},"required":["text"]}`; fixture sha256
`9b93c2a95fd27c90b685a5b624cbe1c50d39a46c5c39d3690fc674c8ec38cc6c`; URL `http://127.0.0.1:<ephemeral>/fixture.html`.
Arms (launch base `--headless --remote-debugging-port=0 --no-first-run --no-default-browser-check
--disable-gpu` + resolver rule `MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`):
`flagged` = r16 receipt `runs[0].launchedArgs`; `flag-off` = resolver rule only;
`devtools-domain-disabled` = `--enable-blink-features=WebMCP --disable-features=DevToolsWebMCPSupport`.
Env mirrors the r16 harness (`scripts/webmcp-loopback-round16.mjs:232-241`): HOME/XDG_CONFIG_HOME point
into the temp profile, so the Arch launcher does not inject `~/.config/chromium-flags.conf` tokens.
Every CDP frame sent/received is in `arms[].traffic[]` of the probe's stdout JSON (~85 / 45 / 32 frames
per arm, varying slightly with execution-context events); request ids, `frameId`s and `invocationId`s are
run-scoped, while the payload shapes and error strings below are stable. Excerpts are verbatim from a run.

## Q1 — flag-off arm (no WebMCP feature flags): exact payloads

- `WebMCP.enable` → `{}` (domain registered; not page-feature evidence).
- Page state: `hasDocumentModelContext:false`, `documentModelContextType:"undefined"`,
  `hasNavigatorModelContext:false`; fixture registration → `{"ok":false,"reason":"no-document.modelContext"}`;
  zero `WebMCP.toolsAdded`.
- `{"id":10,"method":"WebMCP.invokeTool","params":{"frameId":"935C…4879A","toolName":"echo","input":{"text":"x"}}}`
  → `{"id":10,"error":{"code":-32602,"message":"Tool not found"}}`
- Same command with `"toolName":"no-such-tool"` → byte-identical error
  `{"code":-32602,"message":"Tool not found"}`.
- Invoke with `input` omitted → `{"code":-32602,"message":"Invalid parameters","data":"Failed to deserialize
  params.input - BINDINGS: mandatory field missing at position 64"}` — i.e. CDP parameter validation runs
  **before** tool lookup; the missing-input error is not a WebMCP/page signal either.
- Browser `/proc/<pid>/cmdline` WebMCP flag tokens: `0`.

**Consequence:** `"Tool not found"` is shared by feature-off and unknown-tool-with-feature-on. It cannot
distinguish them; the flags-off control needs the page-state + zero-`toolsAdded` + zero-argv-token clauses.

## Q2 — DevToolsWebMCPSupport disabled, page feature on

- Page state: `documentModelContextType:"object"`, `hasNavigatorModelContext:false`, secure context;
  fixture `registerTool` → `{"ok":true}`; zero `WebMCP.toolsAdded` (domain absent, so no events).
- `{"id":3,"method":"WebMCP.enable","params":{}}` → `{"id":3,"error":{"code":-32601,"message":"'WebMCP.enable' wasn't found"}}`
- `{"id":9,"method":"WebMCP.invokeTool","params":{"frameId":"A117…E5AF","toolName":"echo","input":{"text":"x"}}}`
  → `{"id":9,"error":{"code":-32601,"message":"'WebMCP.invokeTool' wasn't found"}}`
- `/json/protocol` still lists the `WebMCP` domain with `enable/disable/invokeTool/cancelInvocation`
  in **all three arms** (protocol sha256 `126cf5fa9b3d6e189029d6af6695b6d029c2ca372277081804b9c82ce7865e7d`,
  identical). Protocol listing is static and is not session registration evidence.

## Q3 — does Chromium validate input against the tool's inputSchema before execute? **No.**

All flagged-arm cases, exact payloads (request → CDP response; `toolInvoked.input`; `toolResponded`;
page-side record from inside `execute`):

| case | CDP response | `toolInvoked.input` | `toolResponded` | execute received |
|---|---|---|---|---|
| valid | `{"invocationId":"EA1E1299C7F0397438225CDF9844D312"}` | `"{\"text\":\"round17-invoke-controls\"}"` | `{"status":"Completed","output":"echo:round17-invoke-controls"}` | `{"text":"…"}` typeof object, text string |
| missing required (`{}`) | `{"invocationId":"C60F3F6238847E6C60780861AFC0F5B0"}` | `"{}"` | `{"status":"Completed","output":"echo:undefined"}` | `{}`, keys `[]`, text `undefined` |
| wrong type (`{"text":42}`) | `{"invocationId":"1F42B3F385AF00C353547C03C89B5414"}` | `"{\"text\":42}"` | `{"status":"Completed","output":"echo:42"}` | `{"text":42}`, text type **number** |
| extra property | `{"invocationId":"5B320F54A28804420AA10F3E3B252A6D"}` | `"{\"extra\":true,\"text\":\"x\"}"` | `{"status":"Completed","output":"echo:x"}` | both keys present |
| `input:null` | — | — | — | **not executed** |
| `input` omitted | — | — | — | **not executed** |
| unknown tool | — | — | — | **not executed** |
| valid after all mismatches | `{"invocationId":"ACB2767B8A20D1AC3D30AABF4B0C9FBB"}` | `"{\"text\":\"after\"}"` | `{"status":"Completed","output":"echo:after"}` | `{"text":"after"}` |

`input:null` → `{"code":-32602,"message":"Invalid parameters","data":"Failed to deserialize params.input -
CBOR: map start expected at position 70"}`; `input` omitted → `-32602` / `…BINDINGS: mandatory field missing
at position 64`; unknown tool → `{"code":-32602,"message":"Tool not found"}`.
So there are **two layers**: the CDP parameter schema (`input` is a required object) rejects null/absent
before any page code; the tool's own `inputSchema` is **not** consulted at all — `execute` runs with the
invalid object and the response is `Completed`. Mismatched input does not poison later invocations.
Key order is not preserved: request `{"text":"x","extra":true}` reached the page as `{"extra":true,"text":"x"}`
(compare parsed JSON, never string bytes). Frame ordering is response-with-`invocationId` first, then
`toolInvoked`, then `toolResponded` (protocol stated it; observed for every accepted case).

## What a harness predicate should assert (r17 case ids)

- `invoke-input-schema-mismatch`: assert invocation **accepted** (`invocationId` returned),
  `toolInvoked.input` parses to the sent object, page-side `execute` observed it, `status:"Completed"`.
  MUST NOT assert a Chromium-side schema rejection — 154 has none for imperative tools. Keep the
  `input:null` / `input`-omitted `-32602` cases separate if parameter-layer negatives are wanted.
- `invoke-imperative-success`: `invocationId`; `toolInvoked.{toolName,frameId}` == request/nav frame;
  `toolInvoked.input` is a JSON **string**; `toolResponded.status:"Completed"`, `output` == execute return.
- `invoke-flags-off-control`: `WebMCP.enable` == `{}`; `invokeTool` → `-32602 "Tool not found"`;
  `document.modelContext` undefined; registration `{"ok":false,"reason":"no-document.modelContext"}`; zero
  `toolsAdded`; zero `toolInvoked`/`toolResponded`; zero WebMCP flag tokens in the browser's `/proc` argv.
  Do not use `/json/protocol` presence.
- DevToolsWebMCPSupport control: both `enable` and `invokeTool` → `-32601 "'WebMCP.<cmd>' wasn't found"`;
  page feature still on (registration ok); zero events.
- Assert `-32602` by `code` + `message`, and by `data` **prefix** `Failed to deserialize params.input -`
  only: the trailing `position 64/70` is frame-offset dependent.
- Assert the browser argv from `/proc/<pid>/cmdline`, not `launchedArgs` alone. With a launcher conf file
  present the probe observed the whole command line as one space-joined argv string; with HOME isolated
  it is NUL-separated (10/8/10 entries here). Flag-token predicates must split on `[\0\s]+` and count only
  `--enable-(blink-)?features=` tokens containing `webmcp` (or `--enable-experimental-web-platform-features`)
  — a `/webmcp/i` filter over argv can match a profile path (r16 noted this at `scripts/…:754-756`).

## Against `corpus/knowledge/webmcp-chromium-loopback-round-16.md:53-80`

No contradiction. Confirmed: `:57` flag-off (`{}` enable, no `document.modelContext`, no `toolsAdded`);
`:58` domain-disabled (`'WebMCP.enable' wasn't found`); `:71-78` (`invokeTool{frameId,toolName,input}` →
`invocationId`; `toolInvoked.input` JSON string; `toolResponded` status/output). New facts the note/plan
should carry: flag-off `invokeTool` = `-32602 "Tool not found"`; domain-disabled `invokeTool` =
`-32601 "'WebMCP.invokeTool' wasn't found"`; `input` is mandatory at the CDP layer; no `inputSchema`
enforcement before `execute`.
Two precision cautions (not contradictions): (a) `:80` "CDP domain present at 154 even with no flags
(`protocol-domain.json`)" — the static protocol document also lists the domain when DevToolsWebMCPSupport
is disabled, so it is advertisement, not registration; (b) the r16 harness subscribes to
`WebMCP.toolsChanged` / `WebMCP.toolCalled` (`scripts/webmcp-loopback-round16.mjs:452-458`), which are not
in 154's protocol events (`toolsAdded`,`toolsRemoved`,`toolInvoked`,`toolResponded`) and can never fire —
the r17 harness should not copy that list.

## Kill verification (per arm)

Spawned with `detached:true`; `SIGKILL` to the process group then the pid. `groupKillSent:true`,
`escalated:[]`, `stillExistsAtEnd:false`, `kill0:"ESRCH"`, `leftover:[]`, profile dir removed.
Observed across runs: main pid gone in 4-9 ms; all profile-matching processes gone in 10-16 ms. A browser-only
SIGKILL is insufficient: the first implementation left 2 `chrome_crashpad_handler` processes per arm
(database under the temp profile); the group kill removes them.

## Limits

Imperative tool only (declarative tools are another probe's topic); one schema shape; results are
build-scoped to `Chrome/154.0.8037.97` and CDP-unsupported posture. The probe writes nothing to the lane
unless `--out` is given; I kept its JSON under `/tmp`. No tools were installed or upgraded this wave.

Files written:
- `.ufo/waves/round-17/probes/invoke-controls.mjs` (new)
- `.ufo/waves/round-17/w1/C2ProbeControls.md` (this report)
