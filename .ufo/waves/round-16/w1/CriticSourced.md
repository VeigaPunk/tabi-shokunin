# CriticSourced — falsifying C2's "sourced claim" obligation (round 16, wave 1)

Seat `TabiR16.CriticSourced-5` (critic, leaf). Access date for every source below: **2026-10-20**.
I opened each source myself this session with `curl -sSL` (gitiles `?format=TEXT` with base64 decode for Chromium).
Snapshots are under `/tmp/critsrc-*` (scratch space, not lane evidence). I launched no browser and ran no gate or selftest.
I installed or updated nothing.

Axes: sourcing honesty (provenance), scope/identity (build vs spec vs ToT), C2 count integrity.

## Verdict (short)

1. **The premise "the spec says `navigator.*` while Chromium exposes `document.*`" is false for the current spec and for Chromium 154.** Both bind `Document.modelContext`.
   The Navigator binding is historical only: the spec moved it in `c7b5c70` on 2026-05-27 (SrcSpecCore.md:156-162 and SrcExplainer.md:71-76; I did not re-verify that commit myself).
   So S020 *can* honestly back the entry-point name, as spec text only.
2. **The real counterexample is the member set.** S020 describes an API that Chromium 154 does not implement:
   - `executeTool` has a different arity and argument type in 154.
   - `toolactivated` and `toolcancel` handlers are missing in 154.
   Local probe output confirms both differences. Using S020 as the source for any 154 *behavior* would therefore be false provenance.
3. **Two of C2's three named parts have no spec source at all.** S020 does not cover declarative form tools or the CDP `WebMCP.toolsAdded` event.
   - The WebMCP repo states that declarative tools are "not part of the specification at this time".
   - The CDP domain lives in Chromium's protocol files, and S002 (ToT viewer) has drifted from what 154 ships.
   - So "C2 sourced by S020" fails as worded. C2 is honestly sourced only by:
     - a new **own-work** row (the committed receipt plus the browser's own `/json/protocol` capture), as the observation;
     - a new **code** row pinned to `refs/tags/154.0.8037.97`, as the declared surface;
     - S020, demoted to spec-context and divergence only.

## Counterexamples with evidence

### CE1 — `executeTool` signature: spec ≠ 154 (behavior-affecting)

- **Spec, S020 §4.2 "ModelContext Interface"** (`#model-context-container`, CG-DRAFT 20 October 2026, `<meta name="revision">` = `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, sha256 `180c55ba…0d1a`, 505949 B). IDL, verbatim:
  `Promise < DOMString > executeTool ( RegisteredTool tool , optional object inputObject , optional ModelContextExecuteToolOptions options = {});`
- **Chromium 154.** `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.idl`. The tag resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, committed 2026-09-30. File sha256 `66c5a747…5b39`. Lines 72-75:
  `Promise<DOMString?> executeTool( RegisteredTool tool, DOMString inputArguments, optional ExecuteToolOptions options = {}`
- **Chromium @main (same path).** Lines 49-53 read `Tool tool, optional object inputObject`. Main matches the spec; 154 does not.
- **Local observation** (`.ufo/waves/round-16/probes/WebmcpProbeImperative.json`):
  - `:1034`: `"2 arguments required, but only 1 present."` The spec makes the second argument optional.
  - `:1060` and `:1071`: `UnknownError` `"Failed to parse input arguments"` when an object is passed. That is consistent with the 154 `DOMString` parameter.
  - The probes still pass objects: `WebmcpProbeImperative.mjs:333,345` and `WebmcpProbeInvoke.mjs:253-256`. They are testing the spec contract, not the 154 contract.

### CE2 — event handlers: spec ≠ 154

- **S020 §4.3 "Events"** (`#events`): "that must be supported, as event handler IDL attributes , by all ModelContext objects:" The table lists `ontoolchange`, `ontoolactivated` and `ontoolcancel`.
- **154 `model_context.idl:77-78`**: `attribute EventHandler ontoolchange;` then `};`. There is no `ontoolactivated` or `ontoolcancel`. Main has them at `:59-60`.
- **Observed**: `probes/WebmcpProbeDeclarative.json:1420-1425` shows the prototype keys `ontoolchange, executeTool, getTools, registerTool, constructor`.
- So DraftNote.md:42 (spec quote 9) must never be read as 154 behavior. D14 at DraftNote.md:78 should be resolved as "absent in 154 IDL and in the observed prototype", not left as "[UNK]".

### CE3 — declarative form tools: no spec row exists

- **S020**: no `toolname`, `tooldescription` or declarative text anywhere in the raw HTML. I extracted the text and grepped it: zero hits. This matches DraftNote.md:46.
- **WebMCP repo `README.md` @cb3d1696** (`https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/README.md`, sha256 `184c519a…c7d6`), `:319`: "it is not part of the specification at this time."
- **`declarative-api-explainer.md` @cb3d1696** (sha256 `4587c9f2…bd28`), `:114`: "Chromium is implementing a loose version of this and will conduct testing/trials". This is a proposal. It does not describe what 154 does.
- **Chromium 154 declared surface**: `…/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/html_attribute_names.json5` (sha256 `99eb9627…b367`), `:392-395`: `"toolautosubmit"`, `"tooldescription"`, `"toolname"`, `"toolparamdescription"`. These are attribute names only. They say nothing about how tools are registered or what schema is synthesized.
- Consequence: the declarative half of C2 can be sourced only by the own-work receipt (behavior) plus the 154 code row (attribute names). The explainer may be cited at tier B, for proposal status only.

### CE4 — CDP domain: S002 is ToT, not 154

- **`https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/WebMCP.pdl`** (sha256 `f386bcfd…f99f`), `:22-23`: `optional boolean debugging`.
- **`…/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`** (sha256 `26e62f29…37ff`): `diff` shows that this exact field is the only difference.
- This independently confirms SrcChromiumPdl.md:116-135, which reached the same delta from the browser's own `/json/protocol`.
- S002 can therefore back only the "experimental / unsupported, build-scoped" posture. Its current row text already says this (`corpus/SOURCES.md:16`). S002 must not back the 154 domain shape. The 154 domain shape comes from own-work `corpus/evidence/round-16/webmcp/protocol-domain.json`, or from the 154-tag PDL above.

### CE5 — the "flag-off" control is not CDP-off

- **`…/refs/tags/154.0.8037.97/third_party/blink/common/features.cc`** (sha256 `6c65ec47…afd4`), `:571`: `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);`
- This explains PLAN.md:23 (no flags → `WebMCP.enable` returns `{}`). It also means `DevToolsWebMCPSupport` in the PLAN.md:18 flag list is redundant on 154.
- **`…/runtime_enabled_features.json5`** (sha256 `99b92e67…1d2b`):
  - `:7023-7036`: `WebMCP` has `status: "experimental"`, an origin trial, and is `implied_by` `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements` and `WebMCPTesting`.
  - `:7048-7049`: `WebMCPTesting` is `experimental`.
- **`DeclarativeWebmcp` is not defined in either file I opened.** Its only evidence is binary strings (PLAN.md:25; ConnFrontierRows.md:68-74). No text may say it is required or what it gates.
- Honest wording for the control: "page surface off (no `document.modelContext`, no tools); the DevTools WebMCP domain is enabled by default on 154."

### CE6 — S020's anchor is stale

- `corpus/SOURCES.md:34` reads `CG-DRAFT 2026-10-16, revision f14762e6`. The live spec is `20 October 2026` / `cb3d1696`.
- The GitHub compare `f14762e6…cb3d1696` shows one change: `index.bs +1 -0`, a new editor line, so the change is metadata-only. This agrees with SrcSpecCore.md:143-145.
- Quotes still hold, but the anchor must be refreshed. DraftSkill.md:21 also says "CG draft 2026-10-16" and needs the same update.

### Non-counterexample (tested; holds)

- Entry point: S020 §4.1 `#document-extension` reads `[SecureContext, SameObject] readonly attribute ModelContext modelContext;` inside `partial interface Document`.
- 154 `model_context_supplement.idl` (sha256 `50dd337d…6364`, identical on main), `:7-11`: `RuntimeEnabled=WebMCP` … `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext;`
- Observed `navigatorModelContext: false` at `probes/WebmcpProbeDeclarative.json:1419`.
- SecureContext gating matches `probes/WebmcpProbeSecure.json:465` (`isSecureContext:false` → `modelContextType: "undefined"`).

## Which rows can honestly be cited, and for what

| Row | Kind / tier | Honest scope wording | May back | Must NOT back |
|---|---|---|---|---|
| S020 (re-open → mined) | spec / A | "WebMCP CG-draft text at revision cb3d1696 (20 Oct 2026): `Document.modelContext` entry point, imperative IDL, SecureContext, `tools` policy — draft text, not implementation evidence" | spec-side rows of the decision table; the observed-vs-spec divergence table; the entry-point name **as spec** | any 154 behavior; declarative forms; CDP events; "conformance" |
| NEW code row: Blink WebMCP IDL @ `refs/tags/154.0.8037.97` (commit `b510e9d7…`) | code / A | "Declared Web IDL and attribute names of the pinned 154 build; declarations, not runtime behavior" | that 154 declares `document.modelContext`, `executeTool(RegisteredTool, DOMString, …)`, only `ontoolchange`, and the four `tool*` form attributes; the spec-vs-154 divergence | flag requirements beyond `RuntimeEnabled=WebMCP`; what `DeclarativeWebmcp` does |
| NEW code row (or anchor of the same row): `features.cc:571` + `runtime_enabled_features.json5:7023-7050` @154 tag | code / A | "Feature-default declarations at 154" | DevTools WebMCP domain on by default; WebMCP experimental and origin-trial | that flags are sufficient or necessary on this host (that needs the receipt) |
| NEW own-work row: `corpus/evidence/round-16/webmcp/receipt.json` + `protocol-domain.json` at the committed revision | own-work / A (precedent: S029, `corpus/SOURCES.md:43`) | "Observed loopback behavior of /usr/bin/chromium 154.0.8037.97 (sha256 per runtime-pin) under the recorded flags and fixtures; not a new spec or conformance claim" | **the C2 held entry itself**: declarative `toolsAdded` payload, flag-off page control, navigator absent, 154 domain shape | real sites, agent integration, other builds |
| S002 (used-by add) | docs / A | unchanged: build-scoped, unsupported posture | "the CDP WebMCP domain is experimental / unversioned" | the 154 domain fields (ToT has `Annotation.debugging`, 154 does not) |
| WebMCP `README.md:317-319` / `declarative-api-explainer.md:114` @cb3d1696 | docs / **B** (non-normative proposal) | "Proposal status of the declarative API; explicitly outside the spec" | "declarative tools are a Chromium-side, non-spec surface" | declarative semantics in 154 |
| `implementation-status.md:19-21` @cb3d1696 | docs / B | "Upstream rollout claim (Chrome 149 origin trial), undated" | context only | anything about 154 |

## Smallest safe corrections (L1 and owners; advice only)

1. **C2 wording** (PLAN.md:15, DraftReport.md:12): change "sourced by WebMCP spec S020 plus newly opened primary rows" to:
   "observed in an own-work receipt (new row) and declared in Chromium 154-tag source (new row); S020 cited for spec-side contrast only. Declarative tools and CDP events are non-spec Chromium surfaces."
2. **S020 row**: refresh the anchor to `CG-DRAFT 2026-10-20, revision cb3d1696`. Its teaches/scope text must contain "not implementation evidence". Its used-by must point only at the note's spec and divergence sections.
3. **Divergence table** (DraftNote.md:81-88): add CE1 (executeTool arity/type) and CE2 (missing `toolactivated`/`toolcancel`) as observed plus declared divergences. Resolve D14 accordingly. Keep "entry point: no divergence".
4. **Flag scope** (PLAN.md:18, DraftNote, DraftSkill): note that `DevToolsWebMCPSupport` is default-on at 154 (`features.cc:571`) and that `DeclarativeWebmcp` has no located source definition. Name the negative control "page-surface off", not "WebMCP off".
5. **Probes/harness** (owners WebmcpProbeInvoke and WebmcpHarness): if any case asserts an in-page `executeTool` result, 154 requires a JSON **string** second argument. Spec-shaped object calls are expected to fail with "Failed to parse input arguments" (`WebmcpProbeImperative.json:1060`). Record that as the 154 contract, not as a WebMCP defect.
   - Owner status (reported by `TabiR16.WebmcpProbeInvoke-5` over IRC; I have not verified it): the probe now passes the full RegisteredTool `{name, origin, description, window}`. It tries both input encodings:
     - `JSON.stringify({text:'inpage-execute'})` → `'echo:inpage-execute'`;
     - object input → `UnknownError 'Failed to parse input arguments'`.
     The probe re-ran with producerSha256 `4d16e28c…e463cb`. The WebmcpHarness half of this item is still open.
   - Owner corroboration, also by IRC and unverified by me. On the invoke probe:
     - the prototype shows only `ontoolchange`;
     - `executeTool` requires the `window` member;
     - one argument gives "2 arguments required".
     The `window` requirement matches the 154-tag `model_context.idl` `dictionary RegisteredTool { … required Window window; required USVString origin; … }`, which appears in my `diff` of main vs 154. That diff shows the dictionary added in 154 and absent on main.
6. **Gate shape** (SourcesStaging.md:31: the gate dedups URLs globally): give each new code row a distinct gitiles tag URL. Do not reuse S004's github.com/main URL pattern, because these rows must be tag-pinned, not `@main`.

## Impacted axes

- **coverage9 / C2**: the count is unchanged if the held entry rests on the own-work receipt. It is overstated if credited as "spec-sourced".
- **freshness**: S020's anchor is stale (CE6).
- **source-honesty / adjacency**: risk of false provenance (CE1-CE4) and source-row inflation under PLAN.md:32, if S020, S002 and the explainer are all counted as "backing" C2.

## Exact commands run (observed)

- `curl -sSL -o /tmp/critsrc-webmcp.html https://webmachinelearning.github.io/webmcp/` → `200 505949`, sha256 `180c55ba…0d1a`; `<meta content="cb3d1696…" name="revision">`.
- `curl … api.github.com/repos/webmachinelearning/webmcp/commits?per_page=3` → `cb3d1696… 2026-10-20T09:53:18Z Add new editor (#352)`, `f14762e6… 2026-10-16T16:30:24Z`.
- Compare API `f14762e6…cb3d1696` → `index.bs +1 -0` (editor line).
- `curl 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON'` → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d Wed Sep 30 21:20:00 2026`.
- Each 154-tag file: `?format=TEXT` → HTTP 200, then `base64 -d`. Digests are listed above.
- `diff critsrc-cr-model_context.idl critsrc-154-model_context.idl` → the hunks quoted in CE1 and CE2.
- `diff critsrc-WebMCP.pdl critsrc-154-WebMCP.pdl` → only `debugging` (`22,23d21`).
- `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`.
- The GitHub contents API for `chromium/chromium` returned "API rate limit exceeded", so I used gitiles instead.

## Limits

- I did not verify that the 154-tag source equals the Arch build's patch set. The Arch package may carry patches. `[INFERENCE]`: the observed probe behavior (CE1, CE2) matches the tag IDL, which supports equivalence for these members.
- I did not locate `kDeclarativeWebmcp`'s definition.
- I did not re-verify the `c7b5c70` Navigator→Document history; it is a sibling's claim.
