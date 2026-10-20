# Attack — note "Probe-only observations" vs `probes/*.json` (Secure, Invoke, Imperative, Flags, Declarative)

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3` (measured revision; commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
- Target text: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:64-72` (paragraph beginning "Probe-only observations …").
- Fixtures (all `git status --porcelain` clean, working tree == `git show HEAD:`):
  - `WebmcpProbeSecure.json` sha256 `97c377f48256f10f1568365594b5c31b4ba3112176c9153ce251230b12a5e3cd`
  - `WebmcpProbeInvoke.json` sha256 `8dee9bf6124de3e08ae088efb638f7e22b4d639607fc633c1e14efbeb78f87ea`
  - `WebmcpProbeImperative.json` sha256 `5a3cfef17dccd8f7251e0d7ee4154d644ce62f5d4922e46312b5fb95f7f7fa73`
  - `WebmcpProbeFlags.json` sha256 `c5569fa91b5be4c0eabf1685217c6139b222dba575edd6b7c692ed81ec6f88dd`
  - `WebmcpProbeDeclarative.json` sha256 `45ef6a497124add0e455a36579039b677ccbf6c123b57f5730a394f944ccf967`
- Note blob sha256 `91c0385b188a0e96c4a1febb3077f9ec1f7104fe4dedc52f0f99fb1ecd86ac22` (matches `git show HEAD:`).
- Runtime: Chromium `154.0.8037.97` in all five fixtures (`Chrome/154.0.8037.97` in Invoke), launcher sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` in all five, Node `v24.21.0` in all five. Playwright `1.64.0` is recorded in Secure, Imperative, Flags and Declarative; the Invoke fixture records no driver version (its `runtime` has only node/chromium/browser/ws fields). Same canonical browser identity in every file cited by this paragraph.
- Lane discipline: Secure/Invoke were run from the lane only with `--out /tmp/…`; Imperative/Flags were copied to `/tmp/r16-probeonly/` and only their `OUT`/`OUT_PATH` constants mutated there; Declarative was run with its existing `--stdout` switch. No lane writes (`git status` count 0 for the cited paths). No installs or upgrades were needed or performed.

## Attack item

> "`http://tabi.test` mapped to 127.0.0.1 by resolver rules is not a secure context and has no
> `document.modelContext` (Secure); `WebMCP.invokeTool{frameId, toolName, input}` returns an
> `invocationId`, then `toolInvoked` carries the input as a JSON **string** and `toolResponded`
> carries `status`/`output` (Invoke, loopback echo tool only); `getTools()` returns
> `inputSchema` as a JSON string while CDP gives an object, and 154's `executeTool` takes a JSON
> string argument, not an object (Imperative); the 154 prototype has `ontoolchange` but no
> `ontoolactivated`/`ontoolcancel` (Flags, Declarative)."

### Verdict: **HOLDS** — all four statements are shown by the cited fixtures; no statement is unsupported.

Every clause is present in the JSON at the named probe. Each fixture was also reproduced
independently this session with the committed producer; the two clauses that exceed what the
JSON text alone asserts (the resolver-rule mechanism in S1, build-wide scope in S4) were closed
with `/tmp` control probes, not assumed.

| # | Statement | Cited probe | JSON evidence | Verdict |
|---|---|---|---|---|
| S1 | `tabi.test` mapped by resolver rules is non-secure and has no `document.modelContext` | Secure | `flags[2]` host-resolver rule; alias case `isSecureContext:false`, `modelContextType:"undefined"`, real `http://tabi.test:38787` origin, no `gotoError` | **HOLDS** |
| S2 | `invokeTool{frameId,toolName,input}` → `invocationId`; `toolInvoked.input` is a JSON **string**; `toolResponded` has `status`/`output` | Invoke | `invokeTool.command`/`.result`; `toolInvokedEvent.input` type `string`; `toolRespondedEvent.{status,output}` | **HOLDS** |
| S3 | `getTools()` serializes `inputSchema` as a string, CDP emits an object; `executeTool` takes a JSON string, not an object | Imperative | 3/3 getTools entries `string`; 6/6 `toolsAdded` entries `object`; object input → `UnknownError: Failed to parse input arguments`, string input → `{"content":[…"via-json-string"…]}` | **HOLDS** |
| S4 | prototype has `ontoolchange`, no `ontoolactivated`/`ontoolcancel` | Flags, Declarative | 10/10 positive Flags cases and 5/5 Declarative fact sets exactly `["ontoolchange","executeTool","getTools","registerTool","constructor"]`; token count across all probe JSONs = 0 | **HOLDS** |

## Commands and observed output

### S1 — Secure

```
$ jq -c '.flags' .ufo/waves/round-16/probes/WebmcpProbeSecure.json
["--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp","--enable-blink-features=WebMCP,WebMCPTesting","--host-resolver-rules=MAP tabi.test 127.0.0.1"]

$ jq -c '.cases[]|select(.label=="http_alias_tabi_test")|{isSecureContext:.context.isSecureContext,modelContextType:.context.modelContextType,origin:.context.origin,gotoError:(.gotoError//null),toolsAddedCount}' WebmcpProbeSecure.json
{"isSecureContext":false,"modelContextType":"undefined","origin":"http://tabi.test:38787","gotoError":null,"toolsAddedCount":0}

$ jq -c '.cases[]|select(.label=="http_alias_tabi_test")|{hasGotoError:has("gotoError"),hasError:has("error")}' WebmcpProbeSecure.json
{"hasGotoError":false,"hasError":false}
```

The mapping clause is a launch input, and the JSON records no request log, so it was tested
causally. The host does not resolve the name itself, and a copy of the same probe with the
resolver flag removed fails navigation to the alias:

```
$ getent hosts tabi.test; echo "exit=$?"
exit=2
$ resolvectl query tabi.test
tabi.test: resolve call failed: Name 'tabi.test' not found

$ node /tmp/r16-probeonly/secure-noresolver.mjs --out /tmp/r16-probeonly/secure-noresolver.json
  http_alias_tabi_test: isSecureContext=false modelContext=undefined toolsAdded=0
$ jq -c '.cases[]|select(.label=="http_alias_tabi_test")|{gotoError:(.gotoError//null),context}' /tmp/r16-probeonly/secure-noresolver.json
{"gotoError":"page.goto: net::ERR_NAME_NOT_RESOLVED at http://tabi.test:37883/frame.html\n…","context":{"isSecureContext":false,"origin":"null","locationOrigin":"null","url":"chrome-error://chromewebdata/","modelContextType":"undefined","navigatorHasModelContext":false,"crossOriginIsolated":false},"toolsAddedCount":0}
```

With the rule: a real `http://tabi.test` document, `isSecureContext:false`, no
`document.modelContext`. Without it: `ERR_NAME_NOT_RESOLVED` and `chrome-error://chromewebdata/`.
The statement is both true and caused by the resolver rule.

### S2 — Invoke

```
$ jq -c '{command:.invokeTool.command,result:.invokeTool.result}' WebmcpProbeInvoke.json
{"command":{"frameId":"A7C5A19D90120FC6A32BDB9697F9CA57","toolName":"echo","input":{"text":"round16-invoke-probe"}},"result":{"invocationId":"FCE0008EC451C7484BADCA9378EA426C"}}

$ jq -c '.toolInvokedEvent|{inputType:(.input|type),input:.input}' WebmcpProbeInvoke.json
{"inputType":"string","input":"{\"text\":\"round16-invoke-probe\"}"}

$ jq -r '.toolInvokedEvent.input' WebmcpProbeInvoke.json | jq -c .
{"text":"round16-invoke-probe"}

$ jq -c '.toolRespondedEvent' WebmcpProbeInvoke.json
{"invocationId":"FCE0008EC451C7484BADCA9378EA426C","status":"Completed","output":"echo:round16-invoke-probe"}
```

Corroboration inside the same fixture: the CDP schema declares `invokeTool.input` `type:"object"`
and `toolInvoked.input` `type:"string"`; `fixtureUrl` is `http://127.0.0.1:43463/`, and `scope`
reads "only the fixture's own read-only \"echo\" tool invoked". The parenthetical "loopback echo
tool only" is accurate.

### S3 — Imperative

```
$ jq -c '[.calls[]|select(.label=="getTools_entries").result.entries[]|{name,schemaType:(.inputSchema|type)}]' WebmcpProbeImperative.json
[{"name":"bad_schema_type","schemaType":"string"},{"name":"probe_echo","schemaType":"string"},{"name":"probe_extra","schemaType":"string"}]

$ jq -c '[.events[]|select(.event=="WebMCP.toolsAdded")|.params.tools[]|{name,schemaType:(.inputSchema|type)}]' WebmcpProbeImperative.json
[{"name":"probe_echo","schemaType":"object"},{"name":"bad_schema_type","schemaType":"object"},{"name":"probe_extra","schemaType":"object"},{"name":"probe_tc","schemaType":"object"},{"name":"probe_signal_dict","schemaType":"object"},{"name":"probe_signal_opt","schemaType":"object"}]

$ jq -c '[.calls[]|select(.label|startswith("executeTool_registered_tool_"))|{label,threw:(.result.threw//false),err:(.result.errorMessage//null),returned:(.result.returned//false),value:(.result.value//null)}]' WebmcpProbeImperative.json
[{"label":"executeTool_registered_tool_object","threw":true,"err":"Failed to parse input arguments","returned":false,"value":null},
 {"label":"executeTool_registered_tool_wrong_input","threw":true,"err":"Failed to parse input arguments","returned":false,"value":null},
 {"label":"executeTool_registered_tool_string_input","threw":false,"err":null,"returned":true,"value":"{\"content\":[{\"type\":\"text\",\"text\":\"via-json-string\"}]}"},
 {"label":"executeTool_registered_tool_empty_string_input","threw":false,"err":null,"returned":true,"value":"{\"content\":[{\"type\":\"text\",\"text\":\"undefined\"}]}"},
 {"label":"executeTool_registered_tool_bad_json_string","threw":true,"err":"Failed to parse input arguments","returned":false,"value":null}]
```

Same tool (`probe_echo`) is a JSON string via `getTools()` and an object via `toolsAdded`; the
object form of the `executeTool` input is rejected while the JSON-string form succeeds. The
Declarative fixture agrees independently: every `getTools()` row carries
`"inputSchemaSerializedAs":"string"` while its `WebMCP.toolsAdded` schemas are objects.

### S4 — Flags / Declarative

```
$ jq -c '[.cases[]|{name,protoKeys:.surface.protoKeys}]' WebmcpProbeFlags.json
[{"name":"none","protoKeys":null},
 {"name":"features-WebMCP","protoKeys":["ontoolchange","executeTool","getTools","registerTool","constructor"]},
 … 10 positive cases, all identical …,
 {"name":"features-WebMCP+disable-blink-WebMCP","protoKeys":null}]

$ jq -c '[.runs|to_entries[]|.value.facts|to_entries[]|{fact:.key,proto:.value.modelContextProtoKeys}]|unique' WebmcpProbeDeclarative.json
[{"fact":"extra","proto":["ontoolchange","executeTool","getTools","registerTool","constructor"]},
 {"fact":"malformed","proto":[…same…]},{"fact":"matrix","proto":[…same…]}]

$ grep -o 'ontoolactivated\|ontoolcancel' .ufo/waves/round-16/probes/*.json | wc -l
0
```

`protoKeys` is `Object.getOwnPropertyNames(Object.getPrototypeOf(document.modelContext))` in both
producers (Flags `.mjs:160`, Declarative `.mjs:308`), i.e. non-enumerable own names are included,
so absence is meaningful. The Imperative fixture's chain dump independently shows `ontoolchange`
as an `accessor` with getter+setter on `ModelContext.prototype` and nothing else tool-named.

## Independent reproduction (same canonical runtime)

```
$ node .ufo/waves/round-16/probes/WebmcpProbeSecure.mjs --out /tmp/r16-probeonly/secure.json
PROBE-OK cases=7
  http_alias_tabi_test: isSecureContext=false modelContext=undefined toolsAdded=0
  (loopback_ip/localhost: isSecureContext=true modelContext=object toolsAdded=2)

$ node .ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs --out /tmp/r16-probeonly/invoke.json
WEBMCP_INVOKE_PROBE verdict=path-exists echo=echo:round16-invoke-probe out=/tmp/r16-probeonly/invoke.json

$ cp WebmcpProbeImperative.mjs /tmp/r16-probeonly/imp/ ; (OUT rewritten under /tmp) ; node WebmcpProbeImperative.mjs
WEBMCP_PROBE_IMPERATIVE {"calls":31,"events":7,"toolsAdded":6,"toolsRemoved":1}

$ cp WebmcpProbeFlags.mjs /tmp/r16-probeonly/flags/ ; (OUT_PATH rewritten under /tmp) ; node WebmcpProbeFlags.mjs
… case=full-plan-set enable=ok doc.modelContext=object toolsAdded=1 … wrote /tmp/r16-probeonly/flags/out.json

$ node .ufo/waves/round-16/probes/WebmcpProbeDeclarative.mjs --stdout > /tmp/r16-probeonly/declarative.json
(exit 0, 176911 bytes — same size as committed fixture)
```

Fidelity: Invoke, Imperative and Flags match the committed fixtures on every field these
statements depend on (frame/invocation IDs and ports differ per run, as expected). Declarative
differs from the committed file only in per-run `frameId` values and the ephemeral `server.port`
(verified by `diff <(jq -S 'del(.capturedAt)' committed) <(jq -S 'del(.capturedAt)' rerun)`:
only `frameId` and `port` lines differ), so the committed Declarative evidence is exactly what
the current producer emits.

Negative control for S1 (above) and an extra Document-surface probe (below) were run from
`/tmp/r16-probeonly/` only.

## Findings by severity

No BREAKS. No statement is missing from its cited probe, and no count, name, type or attribution
in the paragraph is wrong.

### S4 — S1's mapping clause is not self-contained in the fixture (path: `WebmcpProbeSecure.json`)
`flags` records the *input* rule, and the alias case records no `gotoError`, but the JSON has no
request log or response status. Read alone, the fixture's `summary.contexts` row for the alias
(`isSecureContext:false`, `modelContext:"undefined"`) is indistinguishable from a DNS-error page —
my negative control produces the identical summary row from `chrome-error://chromewebdata/`.
The case record disambiguates it (`gotoError` absent, `origin:"http://tabi.test:…"`), and the
causality was confirmed here. Not a note error; optional hardening would be to record the HTTP
request/response for the alias case or emit `gotoError:null` explicitly in every case.

### S4 — S4's absence is proven for `ModelContext.prototype` only by the committed fixtures
Neither Flags nor Declarative enumerates `Document.prototype` or `window`. The note says "the 154
prototype", which is satisfied, but a reader could extend it build-wide. An extra `/tmp` probe on
the same flags/build confirms the broader claim: `Document.prototype` has zero tool-named own
properties (251 own names scanned), `'ontoolactivated' in document` and `in document.modelContext`
are both false, and `window` has no `on*tool*` keys. No correction needed.

### S4 — producer provenance is not bound for 4 of the 5 cited fixtures
Only `WebmcpProbeInvoke.json` carries `producerSha256` (`34bcb77636b8…9ac6d`, which equals the
sha256 of the committed `WebmcpProbeInvoke.mjs`). The other four record no digest, and
`WebmcpProbeDeclarative.mjs` (mtime 11:44:03) postdates `WebmcpProbeDeclarative.json` (11:42:35),
so the committed bytes are not producer-bound. The risk is inert: the current producers reproduce
the committed statement-relevant fields (Declarative byte-identically modulo ephemeral IDs/port).
Worth fixing in the fixture schema, not in the note.

## Residual risk and verification gaps

- Single build (`154.0.8037.97`), single host, flags on; a Chromium package change makes every row
  historical until re-run, per the note's own recheck procedure.
- Invoke is proven only for the loopback fixture's `echo` tool; the paragraph already scopes it
  that way, and the unknown-tool/invalid-input paths in the same fixture are protocol errors, not
  counterexamples.
- `frameId`/`invocationId` values are per-run; only their presence and types are stable, so no
  statement can rest on their literal values (none does).
- The Secure fixture's `summary` is weaker than its `cases` for S1 (see S4 finding); the note cites
  the observation, not the summary.
- No claim here is non-author certification: this is an author-side attack on the note text and
  its committed local fixtures only.
