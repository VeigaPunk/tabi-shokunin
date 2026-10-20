# AttackNoteSpecTable — "Spec versus this build" table (round 16, wave 2)

Seat: `TabiR16.AttackNoteSpecTable` (leaf; read-only lane). Attack item: **every row of the
"Spec versus this build" table** in `corpus/knowledge/webmcp-chromium-loopback-round-16.md:73-82`,
against the cited sources (S020, S030, S031, S033, S035, S002) and the probe JSONs under
`.ufo/waves/round-16/probes/`.

Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` ("round-16: repair C2 counter
fixture-path read; retain first failing measurement", 2026-10-20 11:55:15 -0300). Verified that the
note, harness, receipt and probe JSON in the worktree are byte-identical to that commit:

```
$ git show -s --format='%H %ci %s' b444ca8e024f386124418169e8e400221524bba3
b444ca8e024f386124418169e8e400221524bba3 2026-10-20 11:55:15 -0300 round-16: repair C2 counter fixture-path read; retain first failing measurement
$ for f in corpus/knowledge/webmcp-chromium-loopback-round-16.md scripts/webmcp-loopback-round16.mjs \
           corpus/evidence/round-16/webmcp/receipt.json .ufo/waves/round-16/probes/WebmcpProbeImperative.json; do
    sha256sum "$f" | cut -d' ' -f1; git show "b444ca8:$f" | sha256sum | cut -d' ' -f1; done
91c0385b188a0e96c4a1febb3077f9ec1f7104fe4dedc52f0f99fb1ecd86ac22   (both)
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1   (both)
4429ed2303644755360c9a954087a4d00ed61289700956e9053db42dea172c1e   (both)
5a3cfef17dccd8f7251e0d7ee4154d644ce62f5d4922e46312b5fb95f7f7fa73   (both)
```

## Verdict

**HOLDS.** All six rows' factual assertions reproduce against the cited sources and the probe
evidence, and the observed side reproduces on this host (official harness 11/11, exit 0; independent
loopback probe and two controls). No row is falsified. One MEDIUM provenance/registry finding (F1)
and six LOW/INFO precision findings (F2–F7) are recorded below; none changes a row's truth value.

| # | Row (note line) | Row verdict | Anchor evidence |
|---|---|---|---|
| 1 | Entry point (77) | HOLDS | `index.bs:652-654`; S033 `model_context_supplement.idl:11`; `model-context-location` case |
| 2 | Declarative form tools (78) | HOLDS | `README.md:319`; `declarative-api-explainer.md:114-115`; `index.bs` declarative count 0; `declarative-form-tool` case |
| 3 | Events (79) | HOLDS | `index.bs:676-678` (IDL), `:1368-1388` (§4.3 table); `protoKeys` in Flags/Declarative probes |
| 4 | `executeTool` input (80) | HOLDS | `index.bs:674`; 154 IDL `model_context.idl:72-76`; `WebmcpProbeImperative.json` executeTool records |
| 5 | Permissions policy `tools` (81) | HOLDS | `index.bs:1436-1438`; receipt `opaque-sandboxed-iframe`; policy control (same-origin resolves, opaque rejects) |
| 6 | CDP domain (82) | HOLDS | `WebMCP.pdl:7`; `protocol-domain.json.comparison`; independent no-flag `WebMCP.enable` → `{}` |

## Method and source identity (all re-opened this session, 2026-10-20)

```
$ curl -sSL -o /tmp/atk-spec.Ttfw1x/spec.html https://webmachinelearning.github.io/webmcp/
180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a  spec.html
$ grep -n 'revision\|CG-DRAFT' spec.html | head
11:  <meta content="cb3d16964ab3e92cfd5f09901ed0504373a906e8" name="revision">
 6:  <meta content="CG-DRAFT" name="w3c-status">
843:  ... Draft Community Group Report,  [datetime="2026-10-20"]
$ curl -sSL -o index.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/index.bs
dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39  index.bs   (1998 lines)
$ curl -sSL .../webmcp/cb3d1696.../README.md            -> 184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6
$ curl -sSL .../webmcp/cb3d1696.../declarative-api-explainer.md -> 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28
$ curl -sSL 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/.../model_context_supplement.idl?format=TEXT' | base64 -d | sha256sum
50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364  -
$ curl -sSL https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | sha256sum
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  -
```

All four digests match the SOURCES rows/reports (`S033 50dd337d…`, `S035 f386bcfd…`), so the quotes
below are from the exact cited bytes. No tool installs or upgrades were made.

---

## Row 1 — Entry point (note:77)

**Cell:** spec `partial interface Document { [SecureContext, SameObject] readonly attribute
ModelContext modelContext; }` (§4.1, rev `cb3d1696`); 154 "Same IDL at the 154 tag (S033 line 11);
observed `document.modelContext`".

```
$ grep -n 'partial interface Document' -A4 /tmp/atk-spec.Ttfw1x/index.bs
652:partial interface Document {
653:  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
654:};
$ cat -n /tmp/atk-spec.Ttfw1x/supp.dec.idl
10  ] partial interface Document {
11    [SecureContext, SameObject] readonly attribute ModelContext modelContext;
12  };
```

- Spec cell: verbatim; rendered §4.1 is `#document-extension` (heading number confirmed from the
  rendered TOC: `4.1. Extensions to Document`).
- S033 line 11 is the same member line; the partial additionally carries
  `RuntimeEnabled=WebMCP, ImplementedAs=ModelContextSupplement` (lines 7–10), which does not change
  the entry point.
- Observed: receipt `model-context-location` actual `{documentModelContextType:"object",
  documentOwnProperty:false, navigatorHasModelContext:false, isSecureContext:true}`; independent
  probe reproduced `docType:"object", navIn:false, isSecureContext:true`.
- Verdict **HOLDS**. The §4.1 citation is correct and the entry point is observed;
  `navigator.modelContext` absence is source-backed (no Navigator partial) and observed.

Finding **F1** (MEDIUM) and header note **F6** apply to this row's citation, not its truth — see below.

## Row 2 — Declarative form tools (note:78)

**Cell:** spec "Not in the spec: 'not part of the specification at this time' (S030); explainer says
Chromium implements 'a loose version' (S031)"; observed "`toolname`/`tooldescription` forms in
`toolsAdded`"; verdict "Chromium-only surface; never cite S020 for it".

```
$ grep -c -i declarativ /tmp/atk-spec.Ttfw1x/index.bs
0
$ grep -o -i 'tooldescription\|toolname\|toolautosubmit' /tmp/atk-spec.Ttfw1x/index.bs | sort | uniq -c
     18 toolName          # IDL member only; no form attribute
$ sed -n '317,319p' /tmp/atk-spec.Ttfw1x/README.md
WebMCP is currently focused on the imperative `document.modelContext.registerTool()` API ...
Early ideas are captured in the [Declarative API Explainer](./declarative-api-explainer.md), but it is not part of the specification at this time.
$ sed -n '108,115p' /tmp/atk-spec.Ttfw1x/explainer.md
TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes like `step` and `min` are TBD. ...
Chromium is implementing a loose version of this and will conduct testing/trials ...
```

- Spec side confirmed: zero case-insensitive `declarativ` hits and zero form-attribute hits in
  `index.bs` at `cb3d1696`; the README quote is at line 319 and the explainer quote at 114–115.
- Observed side: receipt `declarative-form-tool` actual tool
  `{name:"search", description:"Search", inputSchema:{type:"object", properties:{q,category,sort},
  required:["category"]}, frameId:"135336A6…", backendNodeId:2}` from fixture
  `declarative-form.html` (`<form toolname="search" tooldescription="Search">` plus
  `toolparamdescription` on three controls). Fresh harness re-run passed the same case.
- Verdict **HOLDS**. "Chromium-only" is an implementation statement: no non-Chromium WebMCP
  implementation is cited in this note's sources; the spec itself contains no declarative surface.

## Row 3 — Events (note:79)

**Cell:** spec "§4.2 lists `ontoolchange`, `ontoolactivated`, `ontoolcancel`"; 154 "Only
`ontoolchange` on the 154 prototype (probe)".

```
$ grep -n 'attribute EventHandler' /tmp/atk-spec.Ttfw1x/index.bs
676:  attribute EventHandler ontoolchange;
677:  attribute EventHandler ontoolactivated;
678:  attribute EventHandler ontoolcancel;
$ sed -n '1368,1388p' /tmp/atk-spec.Ttfw1x/index.bs     # §4.3 Events, normative table
The following are the [=event handlers=] ... that must be supported, as [=event handler IDL attributes=], by all {{ModelContext}} objects:
  ... ontoolchange | ontoolactivated | ontoolcancel ...
```

- Spec cell is literally true: the §4.2 IDL block lists all three (index.bs:671-679).
- 154 observation: `WebmcpProbeFlags.json` and `WebmcpProbeDeclarative.json` both record
  `protoKeys: ["ontoolchange","executeTool","getTools","registerTool","constructor"]`; the
  Imperative probe records the same prototype chain; my independent probe reproduced
  `protoKeys:["ontoolchange","executeTool","getTools","registerTool","constructor"]` (no
  `ontoolactivated`/`ontoolcancel`).
- Verdict **HOLDS**. The build lacks two spec-listed handler attributes while retaining
  `ontoolchange`; "build lags spec" is supported, and "events broken" is not claimed.

Finding **F3** (INFO): the exact *normative* sentence "must be supported … by all ModelContext
objects" is §4.3 (`index.bs:1368-1388`), not §4.2; §4.2 only declares the IDL. The row is not false.

## Row 4 — `executeTool` input (note:80)

**Cell:** spec "optional `object`"; 154 "JSON `DOMString` (probe + seat IDL read)".

```
$ grep -n 'Promise<DOMString> executeTool' /tmp/atk-spec.Ttfw1x/index.bs
674:  Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {});
# 154 tag, model_context.idl:72-76 (per SrcChromiumIdl; cited by the note's "seat IDL read"):
#   Promise<DOMString?> executeTool(RegisteredTool tool, DOMString inputArguments, optional ExecuteToolOptions options = {});
$ python3 - <<'EOF'  # WebmcpProbeImperative.json
executeTool_one_arg                      -> TypeError "2 arguments required, but only 1 present."
executeTool_registered_tool_object       -> UnknownError "Failed to parse input arguments"
executeTool_registered_tool_string_input -> returned '{"content":[{"type":"text","text":"via-json-string"}]}'
EOF
```

My independent probe reproduced all three with the same names/messages and additionally reported
`executeTool.length === 2`, `getTools()[i].inputSchema` typeof `"string"`. The object argument is
coerced to a string and fails JSON parsing; a JSON string succeeds.

- Verdict **HOLDS**: the second parameter is a JSON `DOMString` at 154, not an `object`.
- Finding **F2** (LOW): the row omits that 154's second argument is *required* (arity 2) whereas the
  spec's `inputObject` is optional, so only `tool` is required (WebIDL length 1); a caller writing
  to the row's text would still trip `2 arguments required`.
- Finding **F4** (LOW): "seat IDL read" points at `model_context.idl`, which has no SOURCES row
  (S033 is only `model_context_supplement.idl`); the behavioral claim is probe-proven, but the
  declared-source citation is unregistered.

## Row 5 — Permissions policy `tools` (note:81)

**Cell:** spec "§4.4, default `'self'`"; observed "opaque sandboxed iframe → `NotAllowedError`";
verdict "agree".

```
$ sed -n '1434,1438p' /tmp/atk-spec.Ttfw1x/index.bs
<h3 id="permissions-policy">Permissions policy integration</h3>
Access to the APIs in this specification is gated behind the [=policy-controlled feature=] "tools",
which has a [=policy-controlled feature/default allowlist=] of 'self'.
```

Receipt `opaque-sandboxed-iframe` (fresh re-run identical):

```
actual.iframeReport = { mcType:"object", regType:"function",
  error:"NotAllowedError: Access to the feature \"tools\" is disallowed by permissions policy.",
  errorName:"NotAllowedError", settled:"rejected" }
toolsAdded = []; events = []
```

Control run (independent, `/tmp/atk-policy-control.mjs`), three frames under the same loopback
origin:

```
plain-iframe            selfOrigin "http://127.0.0.1:34395"  settled resolved   -> toolsAdded
sandbox-same-origin     selfOrigin "http://127.0.0.1:34395"  settled resolved   -> toolsAdded
sandbox-opaque          selfOrigin "null"                    settled rejected   -> NotAllowedError
```

The sandboxed opaque frame also reports `parent.document` access blocked (`SecurityError`) and
`contentDocument === null`, so the origin is genuinely opaque; the `location.origin` string that
Chromium reports for it is a serialization quirk, not a same-origin signal.

- Verdict **HOLDS**. Same-origin frames (sandboxed or not) are allowed by the default `'self'`;
  only the opaque-origin frame is denied with the `tools` feature named in the error. This
  distinguishes the permissions-policy explanation from a blanket sandbox denial.
- The retained first-run receipt shows why the case was repaired: the original run recorded
  `error:null` (synchronous read only) and failed; the repaired case awaits the rejection and
  passes. No bearing on the row's current truth.

## Row 6 — CDP domain (note:82)

**Cell:** spec "not in any spec; S035 marks `experimental domain WebMCP`"; 154 "present at 154 even
with no flags (`protocol-domain.json`)"; verdict "Chromium-only, build-scoped, unsupported posture as
for all CDP (S002)".

```
$ sed -n '7,10p' /tmp/atk-spec.Ttfw1x/WebMCP.pdl
experimental domain WebMCP
  depends on Runtime
  depends on Page
  depends on DOM
$ python3 - <<'EOF'  # corpus/evidence/round-16/webmcp/protocol-domain.json, recomputed
noflags  sha256(webmcpDomain) = 08c9742ce0a8586f18c0f3417df49f4b77a2930bce13916c957c1edc88e1ad71
webmcp   sha256(webmcpDomain) = 08c9742ce0a8586f18c0f3417df49f4b77a2930bce13916c957c1edc88e1ad71
experimental=true; commands=[enable,disable,invokeTool,cancelInvocation];
events=[toolsAdded,toolsRemoved,toolInvoked,toolResponded]
comparison={protocolSha256Equal:true, domainListsEqual:true, webmcpDomainPresentNoFlags:true,
            webmcpDomainPresentWithFlags:true, webmcpDomainIdentical:true}
EOF
```

Independent no-flag launch (`/tmp/atk-probe.mjs`, `/usr/lib/chromium/chromium` with no feature
flags): `WebMCP.enable` → `{}` (ok) and `typeof document.modelContext === "undefined"`. With
`--enable-blink-features=WebMCP --disable-features=DevToolsWebMCPSupport`: page API present,
`WebMCP.enable` → `'WebMCP.enable' wasn't found` (the receipt's ablation reproduced).

- Verdict **HOLDS**: the domain is present and schema-identical with and without page feature flags;
  the page API is flag-gated independently; S035's declaration is `experimental`.
- Finding **F5** (LOW/INFO): "not in any spec" is an unbounded negative. What is verified is
  "not in the WebMCP draft": `grep -c -i 'devtools\|cdp\|debugger' spec.html` → `0`. CDP's
  non-standard, unsupported posture is S002, not the absence claim.
- Finding **F6** (INFO): S035 is Chromium *main* PDL, an implementation source, placed in the
  "Spec / proposal" column. Main ≠ 154: the fresh receipt's WebMCP domain lacks main's
  `Annotation.debugging` member. The observed cell correctly uses the 154 binary's own schema.

---

## Findings (severity in each heading; numbering is stable for cross-reference)

Severity map: **MEDIUM** F1; **LOW** F2, F4; **LOW/INFO** F5; **INFO** F3, F6, F7.

### F1 — MEDIUM: S020 revision cited by the table is not the revision in the SOURCES registry

- Note `:77` cites "§4.1, rev `cb3d1696`".
- `corpus/SOURCES.md:34` (S020) reads `CG-DRAFT 2026-10-16, revision f14762e6`, `mined 2026-10-19`;
  `.ufo/waves/round-16/sources-staging.json` still carries the same `f14762e6` string.
- The rows' content is not falsified: I fetched both revisions and diffed them. The only difference
  is one added editor line (`+Editor: Samuel Dallstream…`); §4.1, §4.2, §4.4 text is identical
  (lines shifted by one). The live page self-identifies as `revision cb3d1696…`, `CG-DRAFT`,
  `datetime="2026-10-20"`.
- Why it matters: a reader resolving S020 from the registry gets bytes at `f14762e6`, while the note
  names `cb3d1696`; the re-open report (`w1/SrcSpecCore.md`) explicitly recommended the S020 row
  update and it was not applied. The note's own frontmatter lists S020 without a revision, so the
  table is the only place the newer revision is pinned.
- Suggested fix (L1): update `corpus/SOURCES.md:34` to `CG-DRAFT 2026-10-20, revision cb3d1696`
  (or change the note's citation to `f14762e6` and add the re-open as a named errata). Keep the
  metadata-only diff note.

### F2 — LOW: `executeTool` row omits requiredness (arity 2 vs 1)

- Note `:80` states the type difference only. At 154 the second argument is non-optional:
  `executeTool(RegisteredTool tool, DOMString inputArguments, optional ExecuteToolOptions options)`
  (`model_context.idl:72-76`), observed as `executeTool.length === 2` and
  `executeTool(tool)` → `TypeError: … 2 arguments required, but only 1 present.`
- The spec's `inputObject` is `optional` (`index.bs:674`), so only `tool` is required (WebIDL
  length 1). Suggested wording: "154: required JSON `DOMString` (arity 2, `Promise<DOMString?>`);
  spec: optional `object` (required-arg count 1)."

### F3 — INFO: Events row cites §4.2; the normative "must support" sentence is §4.3

- `index.bs:676-678` (§4.2) declares the three handler attributes; `index.bs:1368-1388` (§4.3
  Events) is the table stating they "must be supported … by all ModelContext objects". The row's
  verb "lists" is true of §4.2; citing §4.2+§4.3 would remove the ambiguity. No change to the
  verdict.

### F4 — LOW: "seat IDL read" for `executeTool` points at an unregistered source

- The signature is in `third_party/blink/renderer/core/script_tools/model_context.idl` at the 154
  tag; S033 covers only `model_context_supplement.idl`. There is no SOURCES row for
  `model_context.idl`: `grep -n 'model_context\.idl' corpus/SOURCES.md` returns no line, while
  `grep -n 'script_tools' corpus/SOURCES.md` returns only S033's supplement path. The probe
  independently proves the behavior, so the row holds; either mint the IDL row or drop
  "(probe + seat IDL read)" to "(probe)".

### F5 — LOW/INFO: "not in any spec" is unbounded

- Verified: `grep -c -i 'devtools\|cdp\|debugger' /tmp/atk-spec.Ttfw1x/spec.html` → `0` (WebMCP
  draft has no CDP text). CDP's non-standard status is S002 ("unsupported for third parties with no
  backward-compatibility promise"). Suggested scoping: "not in the WebMCP draft; CDP is an
  unsupported experimental protocol (S002)".

### F6 — INFO: table header and S035 placement

- The header says the observed/declared column is "(receipt, S033)", but rows 3, 4 and 6 draw on
  the probe JSONs, `model_context.idl`, and `protocol-domain.json` respectively; S033 covers only
  the supplement IDL. A reader could over-credit S033.
- Row 6 places S035 (Chromium main PDL) in the "Spec / proposal" column; S035 is implementation
  source and main's schema has `Annotation.debugging` that the installed 154 lacks. The observed
  cell already uses the correct authority; move S035 to the right column and label it "main".

### F7 — INFO: row 2's quote provenance

- "not part of the specification at this time" is from `README.md:319` (S030), not from the spec
  document. The cell attributes it `(S030)` and the spec genuinely has zero declarative text, so it
  is not misleading; but the "Not in the spec:" lead-in plus a non-spec quote is worth marking as
  "README: …".

## Residual risk and verification gaps

- The table is Chromium-154-and-loopback-scoped; no non-Chromium implementation was tested, so
  "Chromium-only" is an evidence-scoped statement, not a cross-engine survey.
- The S020 registry mismatch (F1) is the only finding that can bite a future reader; it is a
  registry/bookkeeping defect, not a false table cell. The IDL text is identical at both revisions,
  so no behavioral claim depends on which revision is named.
- I did not re-run the C1/C2 counters (out of scope; other seats own them), and did not run the
  probe `.mjs` scripts themselves; I re-read their JSON outputs and independently reproduced the
  disputed observations with several fresh Playwright launches plus the official harness.
- The official harness re-run wrote only `/tmp/atk-receipt.json`; its `closure` reports all
  temporary profiles removed and pids gone. No lane file was modified.
- `location.origin` inside a `sandbox="allow-scripts"` frame serializes the document URL in this
  Chromium even though `self.origin` is `"null"`; tests should use `self.origin`/`crossOriginIsolated`
  style checks, not `location.origin`, if they ever assert opacity.

## Reproduction commands (all executed this session)

```
# source identity
curl -sSL https://webmachinelearning.github.io/webmcp/ -o /tmp/atk-spec.Ttfw1x/spec.html
curl -sSL https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/index.bs
curl -sSL 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT' | base64 -d
curl -sSL https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl
sha256sum /tmp/atk-spec.Ttfw1x/{spec.html,index.bs,supp.dec.idl,WebMCP.pdl}

# rows 1/3/4/5/6 independent observation (loopback only, /tmp)
node /tmp/atk-probe.mjs                 # protoKeys, executeTool object-vs-JSON-string, sandbox rejection, no-flag WebMCP.enable
node /tmp/atk-sandbox.mjs               # self.origin "null", cross-origin access blocked
node /tmp/atk-policy-control.mjs        # same-origin resolves; sandbox+allow-same-origin resolves; opaque rejects

# official receipt reproduction
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/webmcp-loopback-round16.mjs --out /tmp/atk-receipt.json   # exit 0; 11/11 pass
```

Observed harness result: `WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
out=/tmp/atk-receipt.json`, producer sha256 `961874e4…` (identical to the committed receipt's
producer and the worktree harness), runtime `Chrome/154.0.8037.97`, Playwright `1.64.0`, Node
`24.21.0`, launcher sha256 `eaed39c3…`.

## Tooling

No installs or upgrades (no pacman/uv/npm/cargo actions). Used preinstalled `node` 24.21.0,
Playwright 1.64.0, `/usr/lib/chromium/chromium` 154.0.8037.97, `curl`, `python3`, `sha256sum`,
`git`. Probe scripts live only under `/tmp`; the only lane write is this report.
