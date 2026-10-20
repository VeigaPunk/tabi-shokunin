# SrcCdpTot — CDP tot viewer: the WebMCP domain

Seat: `TabiR16.SrcCdpTot-5`. Access date **2026-10-20**. Round-16 wave 1.
Slice: does `https://chromedevtools.github.io/devtools-protocol/tot/WebMCP/` exist, and what
exactly does the protocol say for the `WebMCP` domain (commands, events, types, experimental
markers), with located quotes. Nothing else.

## Answer

The page **exists** (`HTTP 200`) but is not prose: it is a 1,555-byte generated **redirect shim**
to the single-page viewer (`../../#/WebMCP`) that carries a static `<noscript>` index of exactly
the twelve domain members. The viewer's rendered data is `data/tot.json`, and that file's `WebMCP`
domain is **sorted-JSON-identical** to `json/browser_protocol.json` at devtools-protocol master
commit `95b1af69d6a20161dc3558f8e38366b7fa7a27d1` (roll `r1721602`, 2026-10-19).

Domain: **experimental**, depends on `Runtime`, `Page`, `DOM`; **4 commands, 4 events, 4 types**;
no member-level `experimental`/`deprecated` flags.

## Sources opened this session (URL + date + located quote + method)

| # | URL | Loc. | Quote (≤25 words, verbatim) | Method |
|---|---|---|---|---|
| 1 | `https://chromedevtools.github.io/devtools-protocol/tot/WebMCP/` | `<head>` inline script | `window.location.replace('../../#/WebMCP' + member);` | `read` (native HTML), 2026-10-20 |
| 2 | same | `<noscript>` list | `Static links to every command, event, and type for SEO, crawling, and grep` | `curl -sS` + `sed -n '20,60p'`, 2026-10-20 |
| 3 | `https://chromedevtools.github.io/devtools-protocol/data/tot.json` | WebMCP object | `"domain": "WebMCP"` / `"experimental": true` | `curl` + `jq`, 2026-10-20 |
| 4 | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/95b1af69d6a20161dc3558f8e38366b7fa7a27d1/json/browser_protocol.json` | :30928–30929 | `"domain": "WebMCP"`, `"experimental": true` | `curl` + `jq`, 2026-10-20 |
| 5 | `.../95b1af69.../pdl/domains/WebMCP.pdl` | :7 | `experimental domain WebMCP` | `curl` + `grep -n`, 2026-10-20 |
| 6 | same | :53–54 | `Enables the WebMCP domain, allowing events to be sent. Enabling the domain will trigger a toolsAdded event for all currently registered tools.` | same |
| 7 | same | :70 | `Unique identifier for this invocation. Response is sent before tool events.` | same |
| 8 | same | :47 | `Optional node ID for declarative tools.` | same |
| 9 | same | :24 | `If the declarative tool was declared with the autosubmit attribute.` | same |
| 10 | same | :119 | `Note: The output is untrusted and poses a prompt injection risk.` | same |
| 11 | `https://api.github.com/repos/ChromeDevTools/devtools-protocol/commits/master` | JSON `sha` | `95b1af69d6a20161dc3558f8e38366b7fa7a27d1`, message `Roll protocol to r1721602` | `read` (JSON), 2026-10-20 |

## Commands run and observed output (verbatim where quoted)

```
$ curl -sS -o /tmp/probe.out -w '%{http_code} %{content_type} %{size_download}\n' <url>
https://chromedevtools.github.io/devtools-protocol/tot/WebMCP/ -> 200 text/html; charset=utf-8 1555
https://chromedevtools.github.io/devtools-protocol/tot/ -> 404 text/html; charset=utf-8 3950
https://chromedevtools.github.io/devtools-protocol/tot/protocol.json -> 404 text/html; charset=utf-8 3950
https://chromedevtools.github.io/devtools-protocol/json/browser_protocol.json -> 404 text/html; charset=utf-8 3950
```

Stub digest and size (same body twice): `sha256 0b40cd6e42e38567071413c9e5c0132632a713e355e802f5ae5d2d2fbbc31a73`, `1555` bytes.
The other 404s establish that `/tot/` has no raw JSON endpoint; the only data surface is the viewer.

```
$ curl -sS -o /tmp/main.js https://chromedevtools.github.io/devtools-protocol/main.js
main.js http=200 bytes=15704
$ grep -o -E '[A-Za-z0-9_./${}-]+\.json' /tmp/main.js | sort -u
./data/tot.json
./data/v8.json
res.json
```

```
$ curl -sS -o /tmp/tot.json https://chromedevtools.github.io/devtools-protocol/data/tot.json
tot.json http=200 bytes=1603280
sha256 8e42e69a46d5d10e93fae8e78d22d5711717272686b7f16f0a4a28d379ccc572
$ jq -c '.domains[]|select(.domain=="WebMCP")' /tmp/tot.json > /tmp/webmcp-tot.json
$ jq -c '.domains[]|select(.domain=="WebMCP")' /tmp/bp.json      > /tmp/webmcp.json
domain-equal: yes            # jq -S both, cmp -s
```

```
$ curl -sS -o /tmp/bp.json .../95b1af69.../json/browser_protocol.json
sha256 fdd7c7ea021d08960fcd8c22ae351afb0f8e104252789922c4e48c9d57f125d4
31187 lines, 1420148 bytes, 53 browser domains;  "$domain": "WebMCP"` at line 30928
$ jq '.domains|length' /tmp/tot.json   -> 59
domain-name-set diff tot vs master: only 6 extras (Console, Debugger, HeapProfiler,
Profiler, Runtime, Schema)
```

That six-domain delta is the merge of `js_protocol.json` into the viewer's `tot.json`; it is why
the whole-file comparison differs while the `WebMCP` domain is identical.

```
$ jq -r '... "domain.experimental=\(.experimental)" ...'  /tmp/bp.json
domain.experimental=true
member-level-experimental=0
deprecated-members=0
```

PDL blob at the pinned commit: `sha256 f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`,
`125` lines, `4126` bytes.

## Member inventory (exact, from JSON :30928–31186 and PDL)

Domain-level: `experimental: true`; `dependencies: ["Runtime","Page","DOM"]`; no description.

### Commands (4)

| Command | Params | Returns |
|---|---|---|
| `enable` | — | — (side effect: emits `toolsAdded` for all currently registered tools) |
| `disable` | — | — |
| `invokeTool` | `frameId: Page.FrameId`, `toolName: string`, `input: object` (matching `inputSchema`) | `invocationId: string` |
| `cancelInvocation` | `invocationId: string` | — |

PDL anchors: `enable` :55, `disable` :58, `invokeTool` :61, `cancelInvocation` :74.
JSON anchors in `browser_protocol.json`: :31049, :31053, :31057, :31085.

### Events (4)

| Event | Params |
|---|---|
| `toolsAdded` | `tools: Tool[]` |
| `toolsRemoved` | `tools: RemovedTool[]` |
| `toolInvoked` | `toolName: string`, `frameId: Page.FrameId`, `invocationId: string`, `input: string` |
| `toolResponded` | `invocationId: string`, `status: InvocationStatus`, `output?: any`, `errorText?: string`, `exception?: Runtime.RemoteObject` |

PDL: `toolsAdded` :80, `toolsRemoved` :94, `toolInvoked` :100, `toolResponded` :112.
JSON: :31098, :31112, :31126, :31152.

### Types (4)

| Type | Kind | Members |
|---|---|---|
| `Annotation` | object | `readOnly?`, `untrustedContent?`, `consequential?`, `debugging?`, `autosubmit?` — all `boolean` |
| `InvocationStatus` | string enum | `Completed`, `Canceled`, `Error` |
| `Tool` | object | `name: string`, `description: string`, `inputSchema?: object`, `annotations?: Annotation`, `frameId: Page.FrameId`, `backendNodeId?: DOM.BackendNodeId`, `stackTrace?: Runtime.StackTrace` |
| `RemovedTool` | object | `name: string`, `frameId: Page.FrameId` |

PDL: `Annotation` :13, `InvocationStatus` :28, `Tool` :35, `RemovedTool` :86.
JSON: :30937, :30974, :30984, :31030.
`Annotation` comments: `readOnly` "does not modify any state"; `untrustedContent` "UGC, 3rd party
data"; `consequential` "booking a flight, transferring money"; `debugging` "developer tooling
rather than end-user interactions"; `autosubmit` per Q9.

## Facts the harness/protocol seats should carry

1. **`enable` replays**: "Enabling the domain will trigger a toolsAdded event for all currently
   registered tools" (PDL :53–54). A listener attached after `await WebMCP.enable` can still see the
   replay, but attach-before is the safer ordering; the replay makes a page that registers tools
   before `enable` observable.
2. **`invokeTool` returns before events**: `invocationId` is returned "before tool events"
   (PDL :70), so `toolInvoked`/`toolResponded` must be correlated by `invocationId`, not by call order.
3. **`toolInvoked.input` is declared `string`** (PDL :109) while `invokeTool.input` is `object`
   (PDL :68). Treat the event payload as a JSON-encoded string; do not assert object shape there.
4. **`toolResponded.output` is `any` and optional**, absent unless `status == Completed` (PDL :118),
   and the protocol itself flags it as untrusted prompt-injection surface (PDL :119).
5. **Declarative tools** are identified by `Tool.backendNodeId` (PDL :47–48), and `Annotation.autosubmit`
   marks the declarative `autosubmit` attribute (PDL :24–25) — both match the L1 probe shape
   (`toolsAdded` carried `frameId` + `backendNodeId`).
6. **`cancelInvocation` has no return**; a cancelled invocation is observed only as
   `toolResponded.status = Canceled`.

### Source-quality quirks (observed, not inferred)

- PDL :118 reads "Output or error delivered as delivered to the agent" (duplicated "delivered").
- PDL :123 reads "The exception object, if the javascript tool threw an error>" (stray `>`).
- `toolResponded.status` enum spells `Canceled` with one `l` (US spelling), unlike `Cancelled`
  used elsewhere in CDP surfaces — assert the exact string.

These are in the protocol source itself, so they will propagate to any generated client types.

## Provenance / timeline (from `changelog.md` at the pinned commit)

| Roll | Date | WebMCP change |
|---|---|---|
| `r1596832` | 2026-03-10 | `+include domains/WebMCP.pdl` added to `browser_protocol.pdl:56` (changelog:4710) — earliest observed introduction |
| `r1601035` | 2026-03-18 | `pdl/domains/WebMCP.pdl` **new file**, full domain body (`+experimental domain WebMCP`, changelog:4653); commit `e653604a7455` (12-char sha from the path listing) |
| `r1603894` | 2026-03-24 | `@@ -51,3 +59,30 @@` — command/event block grows (changelog:3959) |
| `r1608973` | 2026-04-02 | `@@ -48,6 +48,9 @@`, `@@ -80,7 +83,7 @@` edits (changelog:3873, 3883) |
| `r1615727` | 2026-04-16 | `@@ -82,7 +95,8 @@` edit (changelog:3463) |
| `r1701330` | 2026-09-19 | adds `optional boolean debugging` to `Annotation` (changelog:443) |
| `r1721602` | 2026-10-19 | master commit `95b1af69…`; its diff touches `Autofill` only — **no WebMCP change** |

The `pdl/domains/WebMCP.pdl` path history returned exactly 8 commits, oldest `e653604a7455`
(2026-03-18), consistent with the `new file mode` hunk above.

## Confidence

- Domain content (commands/events/types/fields/experimental): **high** — three independent
  artifacts agree: master `browser_protocol.json`, `pdl/domains/WebMCP.pdl`, and the published
  viewer `data/tot.json` (sorted-identical for this domain).
- Page existence/semantics: **high** — direct HTTP 200 + body inspected; it is a redirect shim,
  not a documentation page.
- Introduction timeline: **medium** — `r1596832` is the earliest *observed* introduction in the
  changelog; the roll's diff shows only the `include` line, so an earlier body commit cannot be
  excluded.

## Remaining unknowns (explicit)

- Whether the published `data/tot.json` matches master for **every** domain: only domain-name sets
  and the `WebMCP` object were compared.
- Whether Chromium 154.0.8037.97's own `/json/protocol` serves this exact `WebMCP` domain: no
  browser was launched (out of this seat's slice; `WebmcpProtocol` owns the runtime capture).
- GitHub REST budget was exhausted (`x-ratelimit-remaining: 0`) after the commit-history queries;
  pre-`r1596832` history was therefore read only from the shipped `changelog.md`.

## Source-row advice for L1 (S002 re-open, S020 unchanged)

- **S002** (`https://chromedevtools.github.io/devtools-protocol/`): add used-by for this domain
  capture; the row's postures still hold. Suggested locus: `tot/WebMCP/` stub + `data/tot.json`.
  Located quote candidates are Q1/Q2 above; access date 2026-10-20.
- **S020**: nothing here re-opens the spec; this seat makes no claim about the W3C/CG draft text.
- Suggested new row if L1 wants the protocol artifact itself:
  `https://github.com/ChromeDevTools/devtools-protocol/blob/95b1af69d6a20161dc3558f8e38366b7fa7a27d1/pdl/domains/WebMCP.pdl`
  (primary, `experimental domain WebMCP` at :7, sha256 `f386bcfd…`).

## Tooling

No installs or upgrades; no browser launched; no lane files written outside this report and
`/tmp` scratch (`/tmp/bp.json`, `/tmp/tot.json`, `/tmp/WebMCP.pdl`, `/tmp/main.js`, `/tmp/changelog.md`).
