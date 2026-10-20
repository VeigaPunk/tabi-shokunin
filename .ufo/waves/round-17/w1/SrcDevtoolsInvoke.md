# SrcDevtoolsInvoke — DevTools frontend WebMCP invokeTool / toolResponded path (C2, wave 1)

Seat: `TabiR17.SrcDevtoolsInvoke-2` (leaf, read-only; no subagent, no browser launch, no git write).
Date: 2026-10-20. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Question: at the DevTools frontend revision shipped in Chromium 154, how does `front_end/**/WebMCP*`
call `WebMCP.invokeTool` and render `WebMCP.toolResponded` — and what may a C2 invocation receipt
assert from that code?

## 0. Answer

The shipped frontend invokes through two hops: the Application-panel "Run Tool" action calls
`Tool.invoke(parameters)` (`WebMCPView.ts:942-945`), and the SDK model sends
`invoke_invokeTool({toolName, frameId, input})` where `input` is a **JS object**
(`WebMCPModel.ts:128-139`). The response arrives as a separate `toolResponded` event that the model
attaches to a `Call` record **only if a prior `toolInvoked` created it under the same `invocationId`**
(`WebMCPModel.ts:230-258`); the protocol says the same thing — "Response is sent before tool events"
(154-tag `WebMCP.pdl:68`). The panel then renders `status` as the verdict word
(Error/Canceled/Completed/pending, `WebMCPView.ts:410-433`) and the output column as
`JSON.stringify(output)` when defined, else `errorText` (`WebMCPView.ts:575-576`).

Consequence for C2: a receipt that records only `invokeTool`'s `invocationId` binds nothing. It must
record `toolInvoked` (the pending call) and `toolResponded` (the verdict), in that order, from a
domain enabled and subscribed before the invoke.

## 1. Identity (fetched, not recalled)

| Item | Value |
|---|---|
| Chromium tag | `154.0.8037.97`; `DEPS` line 424: `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` |
| Frontend commit | `66df492aaa0129d090937e933dd44c5389ab24d2` (branch `chromium/8037` head — GitHub branches API, HTTP 200, 2026-10-20) |
| Bundle/authority check | `node_modules/devtools-protocol/pdl/domains/WebMCP.pdl` inside that commit vs Chromium tag PDL: one-line diff (`consequential` annotation absent from the vendored copy). The tag PDL is authority for protocol text; the frontend is authority for consumer behavior. |
| Tag PDL digest | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` (3969 B; base64-decoded `?format=TEXT` fetch) — identical to the digest round-16 recon recorded |

Fetch log (all `HTTP 200`, 2026-10-20, `curl` into `/tmp/dvfe-154`, deleted after writing this file):

| Raw URL (prefix `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/`) | Bytes | sha256 |
|---|---|---|
| `front_end/panels/application/WebMCPView.ts` | 59794 | `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` |
| `front_end/models/web_mcp/WebMCPModel.ts` | 8553 | `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` |
| `front_end/panels/application/WebMCPTreeElement.ts` | 1581 | `73aee9bf7b130b506a0940ce40f8a99340bb7ef8b78c3645f9932806596da9ae` |
| `front_end/panels/application/WebMCPView.test.ts` | 52889 | `0c3dd754229d4fb2b51d8836cc643a5352e96f93d967d7c5cc74b739a1daded8` |
| `front_end/models/web_mcp/WebMCPModel.test.ts` | 5627 | `e13d3ddc0fc60d8f17ca3eb8ae92648416a500dc70dfc3de861a8301027d4020` |
| `front_end/third_party/puppeteer/package/src/cdp/WebMCP.ts` (vendored, secondary) | 10681 | `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5` |
| `node_modules/devtools-protocol/pdl/domains/WebMCP.pdl` | 3802 | `1b7a4757418d833f59114341b11fbbd904fb010c2b580281277e3c33bf7d0268` |

Chromium source fetches: `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/DEPS` (197649 B,
sha256 `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d`) and
`chromium.googlesource.com/.../refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT` (HTTP 200).

`WebMCPModel.ts` bytes equal S036's pinned digest `c23d575e…b632`, so S036's line anchors still hold at
this commit (`#executionContextDestroyed` at line 192, as its Gate entry says).

## 2. Anchor and verbatim quote

Anchor: `front_end/panels/application/WebMCPView.ts:942-945` in commit
`66df492aaa0129d090937e933dd44c5389ab24d2` (Chromium 154 DEPS line 424); wire call
`front_end/models/web_mcp/WebMCPModel.ts:128-139`; render `WebMCPView.ts:561-576`,
`WebMCPModel.ts:249-258`; protocol `WebMCP.pdl` at tag `154.0.8037.97` lines 59-69, 110-122.

> `this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;`
> — `WebMCPView.ts:945`

Supporting (same commit): `const response = await target?.webMCPAgent().invoke_invokeTool({` with
`toolName: this.name, frameId: this.#protocolTool.frameId, input,` — `WebMCPModel.ts:130-133`.
And at the 154 tag: `# Unique identifier for this invocation. Response is sent before tool events.`
— `WebMCP.pdl:68`, above `string invocationId` (`:69`).

## 3. What the code does (each fact with its line)

- **F1 request shape.** `Tool.invoke(input)` sends `invoke_invokeTool({toolName, frameId, input})` with
  `frameId` copied from the tool record, then returns `response.invocationId`
  (`WebMCPModel.ts:130-138`). `input` is a JS object: the view passes `event.data.parameters || {}`
  (`WebMCPView.ts:944`), and the test asserts `input: {arg1: 'value'}` and `input: {}`
  (`WebMCPView.test.ts:767,775`). Protocol agrees: `object input` (`WebMCP.pdl:66`).
  This is a **different surface** from the page-side `executeTool`, which the round-16 note records as
  requiring a JSON string — do not carry that requirement into CDP.
- **F2 two failure layers.** A command-level failure yields no id: `if (!response || response.getError())
  return undefined;` (`WebMCPModel.ts:135-137`). A tool-level failure yields an id and later
  `status: Error` (`WebMCP.pdl:115,120-122`). A resolved `invokeTool` therefore proves dispatch, never
  success.
- **F3 response correlation requires a prior event.** `#calls` is written only in `toolInvoked`
  (`WebMCPModel.ts:245`); `toolResponded` does `const call = this.#calls.get(params.invocationId); if
  (!call) return;` (`:250-253`). A `toolResponded` for an unknown id is silently dropped — including one
  whose `toolInvoked` was never observed because the domain was enabled late. The protocol states the
  ordering ("Response is sent before tool events", `WebMCP.pdl:68`), so the consumer, not the browser,
  owns the pending map.
- **F4 same asymmetry, two consumers.** Vendored Puppeteer does exactly this: `execute()` awaits
  `invokeTool`, then resolves on a `toolresponded` event whose `id === invocationId`
  (`third_party/puppeteer/package/src/cdp/WebMCP.ts:112-124`). DevTools itself defers the selection:
  `#toolInvoked` matches `#lastDevToolsInvocationId` and clears it (`WebMCPView.ts:861-867`), with a
  fallback lookup over `model.toolCalls` immediately after invoke (`:946-953`) because the event may not
  have landed yet.
- **F5 verdict vocabulary and rendering.** `InvocationStatus` is `Completed|Canceled|Error`
  (`WebMCP.pdl:26-30`); the UI adds `undefined` = pending and maps Error→`cross-circle-filled`,
  Canceled→`record-stop`, pending→`watch`, Completed→no icon (`WebMCPView.ts:410-433`); the output cell
  prints `JSON.stringify(output)` when `output !== undefined`, else `errorText` (`:575-576`). `output` is
  documented as present only on Completed and as untrusted/prompt-injection-bearing (`WebMCP.pdl:115-118`).
- **F6 cancel is pre-response only.** `Call.cancel()` sends `cancelInvocation` only while
  `call.result === undefined` (`WebMCPModel.ts:239-243`). After a response the panel cannot cancel;
  a `Canceled` status must come from the page/browser side.
- **F7 enable and registry.** The model autostarts and calls `void this.enable()` from the constructor
  (`WebMCPModel.ts:165`; `enable()` is idempotent, `:184-191`), registered with
  `SDK.Target.Capability.WEB_MCP` (`:261`). That is why merely attaching DevTools produces the
  `toolsAdded` snapshot S035 describes — not evidence that a page-only client sees one.

## 4. Draft registry row (11 cells / 13 pipe fields; L1 assigns the id)

```
| S0?? | DevTools frontend WebMCP panel and model at the Chromium 154 revision — https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | code | A | Chromium 154 shipped DevTools consumer of the experimental CDP WebMCP domain: invoke request shape, invocationId correlation, status and output rendering | commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium tag 154.0.8037.97 DEPS line 424), WebMCPView.ts:942-945 and 561-576, WebMCPModel.ts:128-139 and 249-258 | The panel invokes a tool with an object input and binds the outcome only through a pre-seen toolInvoked id, so an invocation receipt must record both events | queued | 2026-10-20 | on-release | — |
```

- id: next after S040 is the L1's to assign; `S041` if still free. The row is not a registry row until
  the L1 computes it — the placeholder keeps this file from claiming an id.
- tier **A**, scoped to *the DevTools consumer*; **not** A for the CDP protocol text (the vendored copy
  lags the tag PDL by the `consequential` annotation). Protocol claims stay with S035/the tag PDL.
- expected in-place transition after admission (append-only rule 2): `status queued→mined`,
  `used-by —→corpus/knowledge/webmcp-invocation-round-17.md`, logged old→new in the round lesson.
- structural check (method 2026-10-20, temp root only, lane untouched): copied `corpus/SOURCES.md`
  plus `corpus/knowledge` and `corpus/lessons` to `/tmp/srcprobe`, inserted this row as `S041`, and ran
  `node scripts/check-sources.mjs --root /tmp/srcprobe --file corpus/SOURCES.md` →
  `verdict=clean rows=41 tiers=A:32,B:4,C:5 status=queued:3,mined:33,rejected:5 findings=0`, exit 0
  (baseline is rows=40 A31/B4/C5). Structure only — the checker cannot see whether a source was opened.
  A registry path outside `--root` is refused (`could_not_evaluate … unsafe_registry_path`), which is
  why the temp root got the two cited corpus dirs.

## 5. Gate entry

| Row | URL | Located quote | Location / identity |
|---|---|---|---|
| S0?? | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | "this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;" | WebMCPView.ts:945 at `66df492` (Chromium 154 DEPS line 424); raw sha256 `4b2fce64…540f`, 59794 B |
| (support) | .../models/web_mcp/WebMCPModel.ts | "const response = await target?.webMCPAgent().invoke_invokeTool({" | lines 130-133; sha256 `c23d575e…b632` (identical to S036's pin) |
| (protocol) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | "Unique identifier for this invocation. Response is sent before tool events." | line 68 (sha256 `26e62f29…a37ff`); `object input` at 66 |

## 6. Knowledge facts this row supports (C2 first; C1 is honesty-limited)

C2 (`corpus/knowledge/webmcp-invocation-round-17.md`, "what an invocation claim may assert"):

1. *Request leg:* `invokeTool` takes `{frameId, toolName, input: object}` and returns only an
   `invocationId` — `WebMCPModel.ts:130-136`, `WebMCP.pdl:59-69`. Assertion licensed: dispatch accepted.
2. *Binding leg:* a response is observable only against a previously observed `toolInvoked`;
   unknown ids are discarded — `WebMCPModel.ts:245,250-253`, `WebMCP.pdl:68`.
   Method rule: enable + subscribe before invoke, and retain both events per case.
3. *Verdict leg:* `status ∈ {Completed, Canceled, Error}` plus separate `errorText`/`exception`; `output`
   only on Completed and untrusted — `WebMCPView.ts:423-433,575-576`, `WebMCPModel.ts:22-28,254-256`,
   `WebMCP.pdl:110-122`. Assertion licensed: success iff `status === Completed`, never iff the invoke
   call resolved (F2).
4. *Control leg:* a command error returns `undefined` with no id (`WebMCPModel.ts:135-137`), so
   `invoke-unknown-tool` may legitimately produce either no id or an id that later errors — the case
   predicate must accept both shapes or the probe will encode a guess.

C1: one fact, no count. Upstream pins its consumer by a **40-hex literal** in `DEPS:424` and resolves
the tag only to reach that literal; no branch is consulted. That is the same revision-not-ref discipline
C1 asks of the lane gates, but it grounds no gate behavior and contributes 0 to the C1 count.

## 7. Contradiction / supersession check

- **Round-16 note (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`): no contradiction.**
  Its probe row "`invokeTool{frameId, toolName, input}` returns an `invocationId` … `toolInvoked`
  carries the input as a JSON string … `toolResponded` carries `status`/`output`" is confirmed and now
  protocol-grounded (`object input` :66 vs `string input` :107). Its limit "No tool is invoked in the
  receipt" stays true of r16 and is exactly what C2 must change; this source shows invocation is a
  shipped consumer path, which strengthens rather than revises the note.
- **S036: no conflict, same bytes.** S036 reads registry lifecycle (`:192-203`); this row reads the
  invoke/render path. Its line anchors still resolve at `66df492`.
- **S035: no conflict; scope note.** S035 is the domain text at Chromium main; the frontend's vendored
  PDL here lags the 154 tag PDL (`consequential` absent), so protocol cells cite the tag PDL, not the
  vendored file.
- **Round-16 recon's `WebMCPView.ts` digest** (`4b2fce64…540f`, 1515 lines) reproduces exactly at this
  commit — no drift between that seat's read and mine.

## 8. Limits and remaining unknowns

- Source-read only. Nothing here was executed: no browser, no DevTools, no CDP call. It states what the
  shipped consumer does, not what Chromium 154 does at runtime on a given flag set (that is the C2
  receipt's job).
- Line numbers hold for `66df492` only; main has since moved (round-16 recon: 1520 lines, host gate
  removed). `chromium/8037` was observed at `66df492` on 2026-10-20 but moves with the next roll, so
  re-reads of these claims use the pinned commit, and only a recheck re-resolves the branch.
- Not established here: whether `toolResponded` is emitted for an invocation whose tool was unregistered
  mid-flight; whether `invokeTool` for a declarative tool differs from an imperative one; whether the
  `Canceled` status can be produced by `cancelInvocation` at all on 154. Each is a C2 case question, not
  a source claim.
- `WebMCPView.test.ts` is a unit test with stubs; it proves the request object shape, not browser
  behavior.
