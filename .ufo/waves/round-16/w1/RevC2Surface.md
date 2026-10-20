# RevC2Surface — naming-risk review (C2 WebMCP surface)

Seat: `TabiR16.RevC2Surface-5` (reviewer; author-side advice, not non-author certification).
Scope: the naming risk between the spec surface and the observed Chromium 154 surface; the wording the
round-16 note, SKILL append and index must use to avoid generalizing (QUALITY 3, 14). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Access date for every external source below: **2026-10-20**.
Executed: read-only source verification (published spec fetch, spec-repo clone/history, repo drafts,
committed probe JSONs, binary/file digests). **Not executed:** any browser launch, harness, gate,
selftest or counter — those belong to the code-owning seats; every runtime fact I cite is marked with
its owner (`[PROBE]`, `[PRE]`). No tool installed or upgraded.

## 1. Verdict

The round-16 note drafts are right in direction and wrong in one load-bearing sentence. The current
WebMCP CG draft does **not** say `navigator.modelContext`; it has said `document.modelContext` since
2026-05-27. So `navigator.modelContext` is (a) never the Chromium 154 surface and (b) not the spec
surface either — it is stale corpus vocabulary. Any text that frames the navigator spelling as
"the spec" and the document spelling as a "spec-versus-build divergence" injects a false claim into
the corpus index. `DraftReadme.md:67-68` currently does exactly that; `corpus/README.md:181` and
`corpus/knowledge/browser-surface-census.md:188` carry the stale name today.

## 2. Evidence opened this session

| id | source / anchor | method | located quote (≤25 words) |
|---|---|---|---|
| E1 | WebMCP CG draft, https://webmachinelearning.github.io/webmcp/ — §4.1 Extensions to Document | `read` (reader, `Method: native`) **and** `curl -sS -m 45 -o spec.html` → 505,949 B raw HTML; `meta-revision` `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, dated 20 October 2026, `Status: CG-DRAFT` | "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }" (13 words, §4.1 IDL block) |
| E1b | same, §4.1 prose | same fetch | "Each Document object has an associated ModelContext, which is a ModelContext object." (13 words) |
| E1c | same, §4.2 ModelContext Interface | same fetch | "[Exposed=Window, SecureContext] interface ModelContext : EventTarget {" (§4.2 IDL) |
| E1d | same, Status of this document | same fetch | "It is not a W3C Standard nor is it on the W3C Standards Track." (14 words) |
| E1e | same, raw-HTML counts | `grep -o`/`grep -c` on `spec.html` | `navigator.modelContext` **0**; `declarative` **0**; `tooldescription` **0**; `navigator` 6 occurrences, all `navigator.clipboard.writeText` or biblio `dom-navigator-language` |
| E2 | webmachinelearning/webmcp git history | `GIT_TERMINAL_PROMPT=0 git clone https://github.com/webmachinelearning/webmcp.git` → 172 commits; `git show`, `git log -S` | c7b5c7023f6e6a1c7a2495946136eb19b3109ae6, 2026-05-27, "Move the `modelContext` getter to `Document` (#184)" — diff deletes `navigator.modelContext` and adds the §4.1 `partial interface Document` block |
| E3 | same repo | `git show 14ae813 --stat`, `git show 14ae813 -- README.md`, `grep -c -i declarative index.bs` | 14ae813cc4e9fe0d39313f4b1ee5b231746731ad, 2026-10-08, "Remove declarative API from the spec for now (#338)"; `index.bs` declarative count **0**; README: "Early ideas are captured in the Declarative API Explainer, but it is not part of the specification at this time." (21 words) |
| E4 | same repo, recorded S020 revision | `git show f14762e6:index.bs`, commit metadata | f14762e63607bf96592b1a7a6392cd2b047b8209, 2026-10-16, "Editorial: sync explainers with spec (#350)" — a real commit, superseded by cb3d169 (2026-10-20) |
| E5 | repo docs, `implementation-status.md` | read from clone | Chrome section: "An Origin Trial is live in Chrome 149." and local dev via `about:flags#enable-webmcp-testing` |
| E6 | repo `declarative-api-explainer.md` | read from clone | form attributes `toolname`, `tooldescription`, `toolautosubmit`; §Form attributes example block |
| E7 | host launcher `/usr/bin/chromium` | `ls -l` (14,424 B), `sha256sum`, `strings -n 4` | "Chromium launcher %s -- for Chromium help, see `man %s`"; "Custom flags are read in order from the following files:"; `/usr/lib/chromium/chromium`; `XDG_CONFIG_HOME`, `chromium-flags.conf`. sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` |
| E7b | `~/.config/chromium-flags.conf` | `cat`, `grep -ci webmcp` → `0` | 212 B, 5 lines: `--ozone-platform=wayland`, `--ozone-platform-hint=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=…/copy-url`, `--disable-features=Vulkan` |
| E7c | browser ELF `/usr/lib/chromium/chromium` | `ls -l` (329,260,096 B), `sha256sum`, `pacman -Q chromium` | sha256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`; package `chromium 154.0.8037.97-1` |
| E7d | ELF strings | `strings -n 5 … | grep` | "document.modelContext cannot be used when document.domain is enabled." (10 words); literals `toolname`, `tooldescription`, `toolautosubmit`, `toolparamdescription`, `registerTool`, `getTools`, `executeTool`, `modelContext`, `ModelContext`, `WebMCP.toolsAdded/toolsRemoved/toolInvoked/toolResponded/invokeTool`, `kWebMCP`, `kWebMCPTesting`, `kDeclarativeWebmcp`, `kDevToolsWebMCPSupport` |
| E8 | `corpus/evidence/round-16/webmcp/protocol-domain.json` [PROBE, WebmcpProtocol] | read committed JSON | domain `WebMCP` present **both runs**, `comparison` all true incl. `webmcpDomainIdentical`; commands `enable, disable, invokeTool, cancelInvocation`; events `toolsAdded, toolsRemoved, toolInvoked, toolResponded`; types `Annotation, InvocationStatus, Tool, RemovedTool` |
| E9 | `corpus/evidence/round-16/webmcp/runtime-pin.json` [PROBE, WebmcpRuntimePin] | read committed JSON | `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`; `sha256sum /usr/lib/chromium/chromium` → `95b17db7…`; Node `v24.21.0`, Playwright `1.64.0` |
| E10 | `.ufo/waves/round-16/probes/WebmcpProbeFlags.json` [PROBE, WebmcpProbeFlags] | read committed JSON | `none` → `documentModelContextTypeof:"undefined"`, `modelContextInNavigator:false`; `features-WebMCP` → `"object"`, `modelContextInNavigator:false`, `provideContextTypeof:"undefined"`, `unregisterToolTypeof:"undefined"`; `features-DevToolsWebMCPSupport` alone → `"undefined"` but `WebMCP.enable` ok; `experimental-web-platform-features` → `"object"`; `--disable-features=DevToolsWebMCPSupport` + blink WebMCP → page API present, `WebMCP.enable` "wasn't found" |
| E11 | `.ufo/waves/round-16/probes/WebmcpProbeImperative.json` [PROBE, WebmcpProbeImperative] | read committed JSON | `ModelContext` prototype chain props: `ontoolchange` (accessor), `executeTool`, `getTools`, `registerTool`, `constructor` — **no `ontoolactivated`/`ontoolcancel`**; `documentHasOwn:false`; `navigatorModelContext:false` |
| E12 | `.ufo/waves/round-16/probes/WebmcpProbeDeclarative.json` [PROBE, WebmcpProbeDeclarative] | read committed JSON | `WebMCP.toolsAdded` with tool `{name, description, inputSchema{type:"object",properties,required}}`; `Audits.issueAdded` `FormModelContextParameterMissingTitleAndDescription` etc. |
| E13 | `scripts/webmcp-loopback-round16.mjs` (harness, not yet run to receipt) | read | case `model-context-location` asserts `typeof document.modelContext === 'object'` **and** `'modelContext' in navigator === false`; `runtime.chromium.executableSha256 = sha256File(args.chromium)` (the launcher, not the ELF) |
| E14 | Secure Contexts, https://w3c.github.io/webappsec-secure-contexts/ §3.1 | `curl` + text extraction | "If origin's host matches one of the CIDR notations 127.0.0.0/8 or ::1/128" — return "Potentially Trustworthy" |
| E15 | corpus anchors | `grep -n` | `corpus/README.md:181` "open — still unprobed; the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it."; `corpus/knowledge/browser-surface-census.md:188` "U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.)"; `corpus/SOURCES.md:34` S020 `queued`, "CG-DRAFT 2026-10-16, revision f14762e6" |
| E16 | draft anchors | `grep -n` | `drafts/DraftReadme.md:67-68` "The interface named in U3 (`navigator.modelContext`) is absent … This is a spec-versus-build divergence"; `DraftSkill.md:21` "Spec text (S020, CG draft 2026-10-16) is not evidence …"; `DraftQuality.md:8` proposed rule 23; `DraftNote.md:46,65,69,83` |

## 3. Findings (severity order)

**F1 — Critical. `navigator.modelContext` is the wrong name on both sides.**
[SRC] The published draft at the revision read this round states the surface as
`partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }`
(§4.1), and `navigator.modelContext` occurs **0** times in the 505,949-byte raw HTML. [SRC] The change is
dated: commit c7b5c70, 2026-05-27, "Move the `modelContext` getter to `Document` (#184)", whose diff
deletes the Navigator partial and the `navigator.modelContext` examples. Consequence: `corpus/README.md:181`
("not `navigator.modelContext`", "no flag carries it") is false twice over — the name and the flag claim —
and `browser-surface-census.md:188` records the same stale name. `DraftReadme.md:67-68` makes it worse by
calling the navigator→document move "a spec-versus-build divergence"; it is not a divergence, it is a
draft change four months older than the build. Required: correct the current index reading and never
present the stale name as the spec's.

**F2 — High. The declarative surface is not in the draft and must not be described as spec.**
[SRC] `index.bs` has 0 case-insensitive `declarative` matches; commit 14ae813 (2026-10-08) "Remove
declarative API from the spec for now (#338)" changed 49 lines of `index.bs`, and the same commit
rewrote README to: "Early ideas are captured in the Declarative API Explainer, but it is not part of the
specification at this time." The attribute set lives in `declarative-api-explainer.md`
(`toolname`, `tooldescription`, `toolautosubmit`), and WPT `webmcp/declarative/` additionally exercises
`toolparamdescription`. [SRC] The build carries all four literals (E7d), so "observed in this build
behind `DeclarativeWebmcp`" is the correct class; "per the WebMCP spec" is false. `DraftNote.md:68,84`
already gets this right; `DraftSkill.md:21,27` and `DraftReadme.md:36` do not say it.

**F3 — High. `DraftSkill.md:21` misstates the spec/implementation relationship and pins a stale date.**
Current text: "Spec text (S020, CG draft 2026-10-16) is not evidence of the implementation's names; a
draft API name is never generalized to the browser build." The general rule is sound, but here the draft
read on 2026-10-20 (cb3d169) and the build agree on the name, and the sentence can be read as "the spec
says something else" (i.e. navigator). Rewrite with the actual relationship and the revision read.

**F4 — Medium. D1's evidence chain omits the one quote that proves the name.**
`DraftNote.md:65` cites "S020 quotes 2–4" for "Spec defines the WebMCP surface as `document.modelContext`";
quotes 2–4 establish `Document`-association, the interface, and `registerTool`, but the attribute's own
name and exposure come from the §4.1 IDL block (anchor `#document-extension`, dfn `#dom-document-modelcontext`).
Add it; it is also the anchor the harness case and the note's decision table should share.

**F5 — Medium. Layer conflation in the flag-off wording.**
[PROBE E8] The `WebMCP` CDP domain is advertised and byte-identical **with and without** the feature
flags; [PROBE E10] the page API is absent with no flags. Plain "no flags → `WebMCP.enable` returns `{}`,
no `document.modelContext`" (DraftNote.md:55) merges two different layers into one sentence. State both:
domain advertised (CDP), page surface gated (Blink). Also `WebMCP.enable` returning `{}` is not evidence
of the page API, and `document.modelContext` absence is not evidence about the domain.

**F6 — Medium. Observed interface divergence not yet recorded: two spec event handlers are absent from the prototype.**
[SRC] §4.2 IDL lists `ontoolchange`, `ontoolactivated`, `ontoolcancel`. [PROBE E11] the 154 prototype
enumerates only `ontoolchange` (plus `executeTool`, `getTools`, `registerTool`); [PROBE E10]
`provideContext` and `unregisterTool` are `undefined`. The note must say this explicitly as
observed-vs-spec at the pinned build, and must not extrapolate to "the events do not exist" (enumeration
is not dispatch; `[UNK]` whether they fire).

**F7 — Medium. Two different "chromium" digests; name which artifact each one identifies.**
[SRC E7/E7c] `/usr/bin/chromium` is a 14,424-byte Arch launcher (sha256 `eaed39c3…`) that reads
`$XDG_CONFIG_HOME/chromium-flags.conf` and execs `/usr/lib/chromium/chromium` (sha256 `95b17db7…`,
329,260,096 B). [SRC E13] the harness receipt hashes `args.chromium` — the launcher; [PROBE E9]
`runtime-pin.json` pins the ELF. Either label them (`launcherSha256`, `browserElfSha256`) or the note
must carry both with names. Also: the "no flags" control is "no *WebMCP feature* flags passed by the
probe", not "no flags": the launcher injects five host flags from `chromium-flags.conf` (E7b, no WebMCP
entry at read time). A future edit to that 212-byte file silently changes the control.

**F8 — Low. Name/case discipline.** `ModelContext` is the interface, `modelContext` the attribute,
`document.modelContext` the page expression, `WebMCP` the API name, `MCP` a different protocol the draft
only compares pages to (§1). "ModelContext API" for the attribute and "MCP API" for WebMCP are both
wrong; so is `modelcontext` (binary string "document.modelContext cannot be used when document.domain is
enabled." shows the exact spelling in the build).

**F9 — Low. Own-property trap.** [PROBE E11] `documentHasOwn:false`: the surface is an accessor on
`Document.prototype`. Do not write a claim or a test as `document.hasOwnProperty('modelContext')`.

**F10 — Low. Secure-context scope.** `[SecureContext]` on the attribute and `[Exposed=Window,
SecureContext]` on the interface; [SRC E14] 127.0.0.0/8 and ::1/128 are potentially trustworthy, so
`http://127.0.0.1:<port>` qualifies. No claim for non-loopback plain http, `data:`, `file:`, or a
document without a Window; no claim for another build.

**F11 — Low, methodological. The draft's negative grep is correct but one raw count is a trap.**
[SRC E1e] case-sensitive lowercase `toolname` occurs 40 times in the published HTML, but every
occurrence is inside `id="dom-toolactivatedevent-toolname"`-style anchors whose `dfnText` is `toolName`.
The declarative *form attribute* is what is absent (`tooldescription` 0, `declarative` 0); cite the
absence by "no form-attribute definition/dfn, no `declarative` text", not by a lowercase count.

**F12 — Low, provenance. S020's recorded revision is real but superseded.**
[SRC E4] `f14762e6…` is a real commit dated 2026-10-16; the page read this round is `cb3d169…` dated
2026-10-20. The `opened` date in `corpus/SOURCES.md:34` (2026-10-19) is history and stays; the row's
anchor/recheck must record the revision actually read (cb3d169) and may name f14762e6 as the prior
recorded revision. Do not present 2026-10-16 as the revision the round-16 note cites.

## 4. Five must/never sentences for L1

Drop-in text for the note, the SKILL append and the index (each sentence is self-contained; keep the
capitalized operators verbatim):

1. **MUST** name the page surface as `document.modelContext` — the `ModelContext` attribute on
   `Document` (`partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext
   modelContext; }`, draft §4.1, revision `cb3d1696…`, read 2026-10-20) — and **NEVER** write or imply
   that `navigator.modelContext` is the current draft's surface or the Chromium 154 surface: the spelling
   was removed by commit `c7b5c70` on 2026-05-27 and occurs zero times in the published draft.

2. **MUST** place the declarative `<form>` surface where it actually lives — attributes
   `toolname`/`tooldescription` (plus `toolautosubmit`/`toolparamdescription` present in the build)
   observed only in Chromium 154 behind `DeclarativeWebmcp`, with the draft's declarative API removed on
   2026-10-08 by `14ae813` "for now" and held in a separate explainer — and **NEVER** phrase it as "the
   WebMCP spec defines form tools" or present an observed `inputSchema` synthesis as spec conformance.

3. **MUST** name each layer by its own identifiers — page API `document.modelContext` with
   `registerTool`/`getTools`/`executeTool` and `ontoolchange`; CDP domain `WebMCP` with
   `enable`/`disable`/`invokeTool`/`cancelInvocation` and events `toolsAdded`/`toolsRemoved`/
   `toolInvoked`/`toolResponded` — and **NEVER** let a `WebMCP.*` event, command, or `WebMCP.enable`
   result stand as evidence about the page API, or the reverse.

4. **MUST** scope every capability sentence to the observed composite — launcher `/usr/bin/chromium`
   (sha256 `eaed39c3…`) exec'ing `/usr/lib/chromium/chromium` (sha256 `95b17db7…`), the exact feature
   flags passed, a `http://127.0.0.1` secure-context loopback page, and 2026-10-20 — and **NEVER**
   generalize to "Chromium 154 ships WebMCP", "Chrome supports WebMCP", non-loopback http, `data:`, or
   another build/version; the launcher's `$XDG_CONFIG_HOME/chromium-flags.conf` is part of that composite,
   so the control is "no WebMCP feature flags", never "no flags".

5. **MUST** keep observation, source-level inference and unknown separate in the same sentence pair
   (QUALITY 3) and **NEVER** let a spec/documentation re-read renew a runtime observation (QUALITY 14):
   `navigator.modelContext` absence is the probe result `'modelContext' in navigator === false` (harness
   case `model-context-location`), binary strings and IDL are source-scoped, and unexercised or
   absent-from-prototype names (`toolautosubmit`, `toolparamdescription`, `WebMCP.invokeTool`,
   `ontoolactivated`/`ontoolcancel`) are reported as exactly that — never as working, and never as
   broken-in-general.

## 5. Concrete patches (for L1; drafts are advice, I wrote none of these files)

**5.1 `corpus/README.md` — append one supersession paragraph after the round-16 restatement table**
(append-only matches the file's own practice at `:198-203`; leave `:35`, `:181`, `:194` bytes intact):

> Correction (round 16, 2026-10-20): clauses (b) and (c) of the kaika row at `:181` — "not
> `navigator.modelContext`" and "no flag carries it" — no longer describe the tree and are superseded
> here. The current CG draft exposes the surface as `document.modelContext` (§4.1, revision cb3d169,
> read 2026-10-20; `navigator.modelContext` is pre-2026-05-27 draft vocabulary), and the pinned
> Chromium 154.0.8037.97 build exposes it behind explicit WebMCP flags (round-16 rows above). This
> paragraph supersedes the current-state reading of `:181` only; the frozen `## Frontier` text at `:35`
> stays historic.

**5.2 `corpus/knowledge/browser-surface-census.md` §6 erratum — replace DraftReadme §C(ii)** with:

> (ii) U3's parenthetical name is stale, not divergent: `navigator.modelContext` was replaced by
> `document.modelContext` in the draft on 2026-05-27 (c7b5c70) and is absent from the published draft;
> the probed 154 build exposes `document.modelContext`. There is **no spec-versus-build divergence on
> the name**; record the divergence only where one is measured (declarative surface absent from the
> draft, present in the build behind `DeclarativeWebmcp`).

**5.3 `DraftSkill.md:21` — replace the generalization sentence** with:

> The observed surface is `document.modelContext` (probe case `model-context-location`); the same name
> is what the current draft states (§4.1, revision cb3d169 read 2026-10-20), so agreement here is
> expected, not evidence of conformance. A spec name never substitutes for a probe result, and a probe
> result never extends past the pinned build, flags and loopback origin.

**5.4 `DraftSkill.md:26` — receipt-scope the negative row:** "Verdict: no" → "Absent in the receipt's
`model-context-location` case for this build and flag set; no claim about other builds or versions."
Same for the "flag-off case shows none" cell: name it "no WebMCP feature flags", and add that the CDP
domain remains advertised (`protocol-domain.json`).

**5.5 `DraftQuality.md:8` rule 23 — replace "It never generalizes a CG-draft API name to the
implementation"** with "It never substitutes a CG-draft API name for an observed one, and it states
which revision of the draft was read, because a draft name can move (WebMCP moved `modelContext` from
Navigator to Document on 2026-05-27)."

**5.6 Note decision table — add the missing row and fix D5's rationale:** add
`D-row | ModelContext.prototype has the spec's three event handler attributes | probe enumeration | observed only `ontoolchange` on 154 — no conformance verdict |`; change D5's "Spec-side absence is [INF] from negative grep only" to "spec-side absence is now [SRC]: the published draft has zero `navigator.modelContext` occurrences (raw HTML 505,949 B) and the getter moved to `Document` in c7b5c70 (2026-05-27)".

## 6. Residual risk and verification gaps

- I ran no browser, harness, gate, selftest or counter. Every runtime statement in §3/§4 is either a
  committed probe artifact (`runtime-pin.json`, `protocol-domain.json`, `WebmcpProbe*.json`) or the
  PLAN pre-probe; none is re-observed here. The harness `receipt.json` does not exist yet, so W2/D4–D11
  stay pending and no wording above assumes its results.
- I did not verify whether any historical Chromium build exposed `navigator.modelContext`. The report
  therefore makes no claim about Chromium history; if the corpus wants that sentence, it needs Chromium
  source history open, not inference from the draft.
- Chromium source-level IDL was not located: `third_party/blink/renderer/modules/model_context` and
  `…/modules/webmcp` both return `NOT_FOUND` at `main` via googlesource, and I did not open a Chromium
  source file this round. The build-side naming anchors I used are the binary string
  "document.modelContext cannot be used when document.domain is enabled." and the runtime probe. A
  SrcChromium* row can close this; until then the note must label the build claim as observed, not
  source-verified.
- `ontoolactivated`/`ontoolcancel` absence is an enumeration fact (`WebmcpProbeImperative.json`), not a
  dispatch test; the note must keep it `[UNK]` whether the events fire.
- `document.domain` interaction exists as a build string only; it is source-scoped and unexercised. Do
  not promote it to observed behavior without a probe.
- The launcher/ELF digest split (F7) is a fairness-of-identity issue, not a defect I can fix: the
  harness owner or runtime-pin owner should add a labeled resolved-ELF field, or the note must quote
  both digests with their paths.

## 7. Tooling log

No installs, upgrades or pacman transactions; no browser launch. Read-only commands only: `curl`
(spec + secure-contexts), `git clone`/`git show`/`git log` (spec repo into `/tmp/wmcp/repo`),
`grep`/`sha256sum`/`ls`/`strings`/`pacman -Q`.
