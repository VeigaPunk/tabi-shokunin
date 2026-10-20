# SrcChromiumPdl — WebMCP CDP domain in Chromium source (round 16, w1)

Question: does Chromium ship a declared `WebMCP` CDP domain, and what exactly does its PDL declare
(commands, events, payloads) for `toolsAdded` / `toolsRemoved` / invoke?

Status: **answered from primary source**; every quote below was fetched this session (2026-10-20).
No browser, gate, selftest or counter was run by this seat. No tools installed or upgraded.

## 1. Canonical location and placement

| Fact | Value |
|---|---|
| Domain file | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` |
| Size / lines | 4126 bytes / 125 lines |
| sha256 (blob) | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` |
| Declaration | `experimental domain WebMCP` (line 7) |
| Included by | `third_party/blink/public/devtools_protocol/browser_protocol.pdl:63` — `include domains/WebMCP.pdl` (last include in the file; file is 63 lines / 1868 bytes) |
| Listed in build | `third_party/blink/public/devtools_protocol/BUILD.gn:61` — `"domains/WebMCP.pdl",` in the `domains = [ ... ]` list |
| Depends on | `Runtime`, `Page`, `DOM` (lines 8-10) |
| Root protocol version | `browser_protocol.pdl:7-9` → `major 1` / `minor 3` |

Because it is an include of `browser_protocol.pdl` (not `js_protocol.pdl`), it is a browser-protocol
domain: `WebMCP.enable` is addressable on a page CDP session, which is consistent with the L1
pre-probe (Playwright page CDP session, `WebMCP.enable` → `{}`). `[INFERENCE]` for the exact target
routing; the placement and the successful probe agree.

Fetch commands (both hosts, identical bytes):

```
curl -sS -o /tmp/WebMCP.pdl.out https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl
# 200 4126
curl -sS -o /tmp/WebMCP.pdl.4ba3.out https://raw.githubusercontent.com/chromium/chromium/4ba301ad8c7c1e2190707d80aec6bc8aa63a2671/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl
# 200 4126 ; diff -> IDENTICAL
curl -sS -o /tmp/pdl.b64 "https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT"
base64 -d /tmp/pdl.b64 | sha256sum   # f386bcfd...  (identical to both GitHub fetches)
```

## 2. Declared surface (path:line, verbatim ≤25 words)

Commands (4):

| Line | Declaration | Verbatim comment |
|---|---|---|
| 55 | `command enable` | L53-54: "Enables the WebMCP domain, allowing events to be sent. Enabling the domain will trigger a toolsAdded event for all currently registered tools." (22 words) |
| 58 | `command disable` | L57: "Disables the WebMCP domain." |
| 61 | `command invokeTool` | L60: "Invokes a registered tool." |
| 74 | `command cancelInvocation` | L73: "Cancels a pending tool invocation." |

`invokeTool` params (L63-68): `Page.FrameId frameId`, `string toolName`, `object input`.
Returns (L69-71): `string invocationId`, with the located note L70 — "Response is sent before tool
events." `cancelInvocation` takes `string invocationId` (L77).

Events (4):

| Line | Declaration | Verbatim comment / params |
|---|---|---|
| 80 | `event toolsAdded` | L79: "Event fired when new tools are added." — `array of Tool tools` (L83) |
| 94 | `event toolsRemoved` | L93: "Event fired when tools are removed." — `array of RemovedTool tools` (L97) |
| 100 | `event toolInvoked` | L99: "Event fired when a tool invocation starts." — `toolName`, `frameId`, `invocationId`, `string input` (L103-109) |
| 112 | `event toolResponded` | L111: "Event fired when a tool invocation completes or fails." — `invocationId`, `InvocationStatus status`, `optional any output`, `optional string errorText`, `optional Runtime.RemoteObject exception` (L115-124) |

Types:

- `Annotation` (L13-25): `optional boolean readOnly`, `untrustedContent`, `consequential`, `debugging`,
  `autosubmit` (L25 comment: "If the declarative tool was declared with the autosubmit attribute.").
  `debugging` (L23) is main-only: absent from the installed 154 runtime schema (§4a).
- `InvocationStatus extends string` (L28-32): `Completed`, `Canceled`, `Error`.
- `Tool` (L35-50): `string name`, `string description`, `optional object inputSchema` (L42),
  `optional Annotation annotations` (L44), `Page.FrameId frameId` (L46, **required**),
  `optional DOM.BackendNodeId backendNodeId` (L48, comment "Optional node ID for declarative tools"),
  `optional Runtime.StackTrace stackTrace` (L50).
- `RemovedTool` (L86-91): `string name`, `Page.FrameId frameId` — **no** name/description/schema carry.

Untrusted-output warning, L118-119 (19 words): "The output is untrusted and poses a prompt injection
risk. Clients should treat this as potentially malicious user input." (attached to `toolResponded.output`).

## 3. Cross-check against the round-16 L1 pre-probe

Observed probe event was `WebMCP.toolsAdded` `{tools:[{name,description,inputSchema,frameId,backendNodeId}]}`.
This is field-exact against `Tool` with `annotations`/`stackTrace` absent (both optional) and
`frameId` required. Two points the PDL adds beyond the probe:

1. `enable` **is** the snapshot mechanism (L53-54): after enabling, already-registered tools are
   replayed as one `toolsAdded`. The harness's "flag-off negative control" therefore isolates flag
   gating, not domain absence — the domain answers `enable` with or without the feature flags, but
   emits no tool events when the feature is off.
2. `toolsRemoved` carries only `{name, frameId}` (L86-91). Any removal-case assertion must not
   expect `backendNodeId`/`inputSchema` on the removed-tool payload.

Asymmetry worth pinning in code: `invokeTool.input` is `object` (L68) but `toolInvoked.input` is
`string` (L109, "The input parameters used for the invocation." — 6 words). A client that
round-trips input between the two gets a type mismatch, not a schema error.

## 4. Version skew — pin the running browser, not `main`

File commit history (GitHub commits API, first call of this session, 5 newest commits touching the path):

```
4ba301ad8c7c1e2190707d80aec6bc8aa63a2671 2026-09-18T08:38:55Z | [WebMCP] Add debugging member in ToolAnnotations
a1bf6d8347ecd82fae080076f62a61e8795d8e22 2026-08-21T19:59:57Z | [WebMCP] Implement consequentialHint annotation
9e45107e78df244be7f7cd972f891a0d8e8aeacf 2026-04-23T17:53:22Z | Add untrustedContentHint to script tool annotations.
7b2b2f1d8406dafea7bd199ebf6844c4f593753d 2026-04-20T10:56:14Z | Fix webmcp declarative tools missing their schemas
c7ffbe4774f22bc03f46e433c3a9d05ccc065d61 2026-04-16T15:05:32Z | Add a cancel CDP command for webmcp tool calls
```

Latest blob change is 2026-09-18 (`Annotation.debugging`). That commit is **not** in the installed
`/usr/bin/chromium` 154.0.8037.97 schema — verified against the sibling's captured `/json/protocol`
(§4a). Consequence for the C2 contract: `protocolDomain` in `receipt.json` must come from the
**running browser's own** `/json/protocol` (or `Schema.getDomains`), never from this file. The PDL
here is `main`-of-2026-10-20, not a pin to the installed binary.

Head-of-main at fetch time (both identical blob):
GitHub mirror `7585497a1cefc5459e8babfce6b232358359bb8c` (2026-10-20T14:17:35Z);
chromium.googlesource.com `05abdb878fa62ed76a61b413b0c3f9d55838b8b9` (Tue Oct 20 14:22:33 2026) —
mirror lags ~5 min.

### 4a. Observed skew vs the installed 154 binary (cross-checked, not inference)

`TabiR16.WebmcpProtocol-5` captured `/json/protocol` from `/usr/bin/chromium` 154.0.8037.97 into
`corpus/evidence/round-16/webmcp/protocol-domain.json` (`tabi-round16-webmcp-protocol-v1`, generated
2026-10-20T14:29:07Z). I read that artifact directly; its WebMCP domain is surface-identical to
main's PDL except in one place:

- `Annotation` in 154 has **four** booleans — `readOnly`, `untrustedContent`, `consequential`,
  `autosubmit` (all `"optional": true`) — and **no `debugging`**, which main's PDL adds at L23.
- Everything else matches exactly: `experimental: true`, deps `[Runtime, Page, DOM]`, commands
  `enable`/`disable`/`invokeTool`/`cancelInvocation`, events `toolsAdded`/`toolsRemoved`/
  `toolInvoked`/`toolResponded`, `RemovedTool` = name+frameId, and the `invokeTool.input` object vs
  `toolInvoked.input` string asymmetry.
- The protocol is also **flag-invariant at the schema surface**: `comparison` records
  `webmcpDomainPresentNoFlags: true`, `webmcpDomainPresentWithFlags: true`, `webmcpDomainIdentical: true`,
  `protocolSha256Equal: true`. Flag gating is therefore runtime-only, not a schema-visibility gate.

Consequence: the only verifiable delta between `main` PDL (2026-10-20) and the harness's actual
runtime is `Annotation.debugging` — i.e. the 2026-09-18 commit `4ba301ad` is not in the local 154
build. Any receipt assertion that reads `annotations.debugging` would be undefined on this host.
The earlier `[INFERENCE]` about the branch point is replaced by this observation.

## 5. The checked-in 1.3 JSON does **not** contain WebMCP — and that is expected

`third_party/blink/public/devtools_protocol/browser_protocol-1.3.json` (321436 bytes, sha256
`5d992cd69fce456512e6f16aae4468edd4e75815c21f9393e6002bcebac3e1f7`) has 33 domains and **zero**
`"domain": "WebMCP"` entries (also absent from `browser_protocol-1.2.json`, 29 domains).

Mechanism (`third_party/inspector_protocol/check_protocol_compatibility.py:405-411`):

```python
def load_domains_and_baselines(file_name, domains, baseline_domains):
    version = load_schema(os.path.normpath(file_name), domains)
    suffix = "-%s.%s.json" % (version["major"], version["minor"])
    baseline_file = file_name.replace(".json", suffix)
    baseline_file = file_name.replace(".pdl", suffix)
```

i.e. the `-1.3.json` is the **backward-compatibility baseline** consumed by the
`protocol_compatibility_check` action (`BUILD.gn:64-80`), not a runtime schema. Diff of PDL includes
vs baseline domains: 22 PDL domains are absent (incl. `WebMCP`, `Fetch`, `Media`, `Autofill`,
`WebAuthn`), and `ApplicationCache`/`Database` are baseline-only. So WebMCP's absence says nothing
about availability — do **not** cite this JSON as evidence the domain is missing, and do not use it
as `protocolDomain` either.

`README.md` (same dir) L48/L54 states the rule the declaration relies on: commands/events/types not
marked `experimental` "are kept reasonably" stable; those marked `experimental` "may be changed or
removed". WebMCP is `experimental`, so the whole surface above is unstable by policy.

## 6. What this licenses for C2 (and what it does not)

Derivable from this source, for `corpus/knowledge/webmcp-chromium-loopback-round-16.md`:

- Domain exists in-tree at a concrete path/line, experimental, browser-protocol, with exactly 4
  commands and 4 events; `toolsAdded`/`toolsRemoved` field shapes (above).
- `enable` replays registered tools; `disable` exists.
- Invocation is **event-driven**: `invokeTool` returns `invocationId` before any event (L70), and
  completion arrives as `toolInvoked` → `toolResponded` (status `Completed|Canceled|Error`).
- Removal payloads are name+frame only.

Not derivable (remain observed-only or unknown):

- Feature-flag gating (`DevToolsWebMCPSupport`, `WebMCP`, `DeclarativeWebmcp`, `WebMCPTesting`) —
  the PDL has no flag metadata; gating lives in implementation.
- Navigation-clears-tools, abort/unregister semantics, malformed-form issue reporting — no PDL
  statement; assert only what the harness observes.
- Whether the installed 154 binary exposes `cancelInvocation` / `Annotation.debugging` — needs the
  browser's own schema (WebmcpProtocol seat).

Gap for L1/WebmcpHarness (advice, not edit): the PLAN's fixed case list exercises registration and
removal but **no** `invokeTool`→`toolInvoked`→`toolResponded`/`cancelInvocation` case, while the
domain's only two commands that move data are exactly those. If a case is added, it must open the
event listener before `invokeTool` and key on `invocationId`, per L70.

## 7. SOURCES row candidates (L1 writes rows; each opened this round)

Access date for all: **2026-10-20**. Fetch method: `curl` to raw.githubusercontent.com and
chromium.googlesource.com (`?format=TEXT`, base64-decoded), plus GitHub REST for commit metadata.

- **WebMCP PDL (primary)** — `https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`
  § line 7: "experimental domain WebMCP"; line 79: "Event fired when new tools are added."; line 93:
  "Event fired when tools are removed."; lines 53-54: "Enabling the domain will trigger a toolsAdded
  event for all currently registered tools."
- **browser_protocol.pdl include** — `.../browser_protocol.pdl` L63: "include domains/WebMCP.pdl".
- **Compatibility baseline mechanism** — `https://raw.githubusercontent.com/chromium/chromium/main/third_party/inspector_protocol/check_protocol_compatibility.py`
  L405-411: baseline filename built as `"-%s.%s.json" % (version["major"], version["minor"])`.
- **PDL experimental policy** — `.../devtools_protocol/README.md` L54: commands/events/types "marked
  as `experimental` may be changed or removed".

Suggested verdict: three/four primary rows mined; S002 (CDP viewer) re-open remains another seat's
job.

## 8. Confidence and remaining unknowns

- High confidence: path, line numbers, declarations, digests, include site, baseline-JSON role —
  all read verbatim this session and cross-host digest-identical.
- Observed (cross-checked, not inferred): the 154 runtime schema equals main's PDL minus
  `Annotation.debugging`; flag-invariance at the schema surface (§4a).
- `[INFERENCE]`: page-session routing from `browser_protocol.pdl` placement.
- Unresolved here: introduction commit of `WebMCP.pdl` (GitHub commits API returned 500/403 after
  the successful first page; gitiles `+log` returned `403: Forbidden`). Not needed for this slice.
- Unrun: this seat ran no browser, harness, gate, counter or selftest; the `/json/protocol` evidence
  cited in §4a is TabiR16.WebmcpProtocol-5's artifact, which I read directly.

## 9. Tooling

No installs or upgrades; used preinstalled `curl`, `python3` 3.14, `base64`, `sha256sum`.
