# CriticC2 — round 16 wave 1: falsifying C2 (WebMCP loopback capability)

Seat `TabiR16.CriticC2-5`, author-side critic advice, not certification. I launched no browser and ran no gate,
selftest or counter. Runtime facts below come from sibling probe JSON already on disk (named per item) or from
one sibling run I asked for (`WebmcpProbeFlags-5`, relayed by IRC and marked as relayed). Sources were opened this
session on 2026-10-20 (§6). No tools installed or upgraded.

## 1. Verdict

C2 as declared in `PLAN.md:15-29` and `:79-96` **is not falsified as a capability, but three of its framings are
false today**, and without the evidence in §4 the row would be pre-claiming:

- **Real coverage, not just fixture growth:** sibling probes show behaviour that no fixture author wrote down
  beforehand. (a) Spec permissions-policy gating with the exact rejection cause. (b) The CDP domain disappears
  only when a DevTools feature is disabled. (c) A **CDP-vs-page-API divergence** on non-secure documents
  (CE3). A fixture-replay artefact would not produce any of these.
- **Fixture growth, in the current harness design:** every case expectation in `fixtures/*.html`
  (`__webmcpFixture.expectedTools`) was written after the L1 pre-probe saw the output (`fixtures/README.md:9`
  "probed 2026-10-20"; `:17` "`sort` carries select-derived shape (enum or string)"). A pass against a back-fitted
  expectation is a capture, not a test (QUALITY17, `corpus/QUALITY.md:48-53`).
- **False framings:** "sourced by WebMCP spec S020" for the declarative case. "navigator vs document" presented as
  a spec divergence. "flag-gated" given as one opaque six-flag incantation. Details in CE1, CE2 and CE4.

## 2. Counterexamples

| # | Counterexample | Evidence | Axes hit |
|---|---|---|---|
| CE1 | **The declarative form tool is not in S020.** The spec has no `toolname`/`tooldescription` form attributes. Every case-insensitive `toolname` hit is the event attribute `toolName`, and `declarative` has 0 hits. So the declarative positive case (`PLAN.md:85`) cannot be "sourced by S020". | `curl` of https://webmachinelearning.github.io/webmcp/ → 505,949 B, sha256 `180c55ba…0d1a`. A Python scan found 0 `declarative` matches. All lowercase `toolname` offsets sit in `#dom-toolactivatedevent-toolname` / `#dom-toolcancelevent-toolname` links. Declarative *is* defined in Chromium source (§6 R3) and in WPT `webmcp/declarative/` (§6 R5). | coverage (false provenance), calibration |
| CE2 | **`document.modelContext` matches the spec; it is not a divergence.** The spec puts the attribute on `Document` (§4.1). Census U3 asked about `navigator.modelContext` (`corpus/knowledge/browser-surface-census.md:188-189`), which is a stale hypothesis. Recording the "navigator absent" case (`PLAN.md:87`) as an observed-vs-spec divergence (`PLAN.md:93`) would be false. | S020 §4.1, text line 364: `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext;` | calibration |
| CE3 | **The CDP observation and the page API are gated differently. This is the strongest counterexample to "presence of `document.modelContext` ⇔ observable tools".** On `data:` and `about:blank`, `isSecureContext:false` and `document.modelContext` is `undefined`, yet `WebMCP.toolsAdded` still fires for the declarative form `decl_search`. On non-secure `http://tabi.test` (host-resolver mapped to 127.0.0.1), the result is `toolsAdded` 0. `PLAN.md:24` drops `data:` as "not the test surface", which hides this. | `.ufo/waves/round-16/probes/WebmcpProbeSecure.json` cases `data_url`, `about_blank` (`toolsAddedCount:1`, `modelContextType:"undefined"`) and `http_alias_tabi_test` (`0`). Each case uses a fresh page (`WebmcpProbeSecure.mjs:264-288`, `browser.newPage()` + new CDP session), so these are not leftover events. Spec §4.1 `[SecureContext]` predicts no page API there; the spec says nothing about DevTools exposure (§5.2: "this specification does not prescribe the format in which tools are exposed to the browser agent"). | coverage (a real surface, so it should be held), calibration (a decision-table hazard if it is omitted) |
| CE4 | **The plan's flag set is cargo, not a scope.** At tag 154.0.8037.97, `WebMCP` is `status: "experimental"`, `implied_by` `WebMCPTesting`, `copied_from_base_feature_if: "overridden"`. `kDevToolsWebMCPSupport` is `FEATURE_ENABLED_BY_DEFAULT`. There is no `DeclarativeWebMCP` runtime feature at 154 (it exists only at main). Chromium ignores unknown feature names silently. | Source: §6 R2/R3/R4. Runtime (sibling `probes/WebmcpProbeFlags.json` summary): minimal set = `blink-WebMCP`. `features-DevToolsWebMCPSupport` alone and `features-DeclarativeWebmcp` alone → `document.modelContext` undefined, 0 events. `blink-WebMCP+disable-DevToolsWebMCPSupport` → page API present, `WebMCP.enable` ok:false. Relayed by IRC from WebmcpProbeFlags-5: the error is "'WebMCP.enable' wasn't found", `blink WebMCPTesting` alone is positive, and `--enable-features=WebMCP --disable-blink-features=WebMCP` gives no page API. | calibration, depth |
| CE5 | **The domain is present with no flags, so protocol presence proves nothing.** `protocol-domain.json` `comparison`: `protocolSha256Equal:true`, `webmcpDomainIdentical:true` with and without flags. The protocol dump is not capability evidence. Only runtime events are. | `corpus/evidence/round-16/webmcp/protocol-domain.json` `.comparison` | coverage (no credit for protocol JSON) |
| CE6 | **The positive control was not clean (fixture since repaired, per the fixtures seat; I have not checked the runtime myself).** The probe's own `positive-control` form ("name/description/title present") emits `FormModelContextParameterMissingTitleAndDescription`. Only `toolparamdescription` and `<label for=>` gave zero issues. Relayed by IRC from WebmcpFixtures-5: `declarative-form.html` now carries `toolparamdescription` on all three controls and "positive stayed Audits-issue-free". The same message says the fixture `expectedTools` "now encode the observed 154 derivation", which confirms the back-fitting concern in §1. The harness still has to assert zero issues on P1. | `probes/WebmcpProbeIssues.json` cases `positive-control` (issues `[…MissingTitleAndDescription]`), `param-with-toolparamdescription` (`[]`), `param-with-label` (`[]`) | depth, calibration |
| CE7 | **One mutable build.** `/usr/bin/chromium` is the pacman package 154.0.8037.97-1 (`runtime-pin.json`). It changes as soon as the pacman pause lifts. Main has already diverged: `WebMCP.pdl` at main adds `Annotation.debugging` (absent at 154 and in the 154 browser's `/json/protocol` Annotation props `readOnly,untrustedContent,consequential,autosubmit`), and `DeclarativeWebMCP` was split out. A second build is already on disk and has not been used: Playwright CfT `chromium-1248` (156.0.8078.4 per `SCORECARD.md:574`). | `sha256sum …/chromium-1248/chrome-linux64/chrome` → `377a9fc0…5025`. `grep -acF` hits in that binary: `DeclarativeWebMCP` 3, `WebMCPTesting` 2, `toolsAdded` 1, `FormModelContextMissingToolName` 2, `DevToolsWebMCPSupport` **0**. So the 154 flag list is already partly obsolete at 156. | freshness, coverage scope |
| CE8 | **Window pressure creates a reason to pre-claim.** Saturation is 8 with window 3. Round 13 holds the last capability. Round 14 was position 1 (`SCORECARD.md:658`) and round 15 position 2 (`SCORECARD.md:729`), so round 16 is position 3. A capability row entering now restarts the window (AXES nudge, `AXES.md:66-73`). That is an incentive to admit on a thin demonstration. | `SCORECARD.md:658`, `:729`; `AXES.md:57-73` | calibration |

One defect is already fixed: `fixtures/lifecycle.html` first put `signal` inside the tool dictionary. The spec
(§4.2.3) and WPT `register_tool_signal.https.html` both put it in `registerTool`'s second argument, and WebIDL
drops unknown dictionary members. I messaged WebmcpFixtures-5. The current file has `}, { signal: ac.signal })`
at `lifecycle.html:67`.

## 3. What would make the capability row pre-claiming

By `AXES.md:61-64`, a row without "a passing demonstration in the round report" is pre-claiming. Measured
against the round-13 precedent, the row is pre-claiming if **any** of these holds at the measured revision:

1. There is no committed `receipt.json` produced by the harness at its committed blob (producerSha256 matches the
   harness blob at REV), plus an execution-pass record with exit 0. Precedent: `aria-execution-pass.json`
   (`corpus/lessons/round-13-verifier-spotcheck.md:94-96`).
2. The receipt's runtime sha256 differs from `runtime-pin.json` (`95b17db7…330a`), or the row omits the build and
   flag scope.
3. The evidence is only protocol JSON or probe JSON under `.ufo/waves/round-16/probes/`. Probes are wave
   scratch and the plan's counter reads committed corpus evidence.
4. Any negative control passes on an exception or "no event" without the pinned actual cause (QUALITY17).
5. The row or note says "native WebMCP in Chromium", "spec-conformant", or "agent integration" instead of
   "CDP registration (and invocation) observation on Chromium 154.0.8037.97 with the blink WebMCP runtime
   feature, loopback fixtures".
6. The README Frontier row (`corpus/README.md:181`, "Native WebMCP in chromium 152") is flipped to held. 152 was
   never probed and the host now has 154, so 152 stays unprobed. Only a 154-scoped held entry is admissible.

## 4. Minimum evidence I would accept

All of these come from one harness run at a pinned executable digest. Each case records an `expected` written
**from a named oracle before the run** (spec section, WPT file, or Chromium source line) and the `actual`. Back-fitted
expectations are labelled `observed-baseline` and do not count toward pass.

Cases (11 minimum):

| # | Case | Oracle for `expected` | Required actual |
|---|---|---|---|
| P1 | Declarative positive using WPT's exact form | WPT `declarative/getTools-declarative-schema.https.html:10-35` (`required:["query"]`, `limit` `type:"number", multipleOf:1`, `safe_search` boolean, descriptions) | `toolsAdded` tool schema deep-equals the WPT `expected_schema_obj`; **zero** Audits issues |
| P2 | Imperative positive | S020 §4.2 `registerTool` | promise resolves; `toolsAdded` with exact name/description/inputSchema; `stackTrace` present (pdl `Tool.stackTrace`) |
| P3 | Two independent channels agree | S020 §4.2 `getTools()` | the in-page `document.modelContext.getTools()` names and schemas equal the CDP `toolsAdded` for P1 and P2 |
| P4 | Enable-after-registration replay | `WebMCP.pdl@154:51` "Enabling the domain will trigger a toolsAdded event for all currently registered tools." | the CDP session attached after load still gets `toolsAdded` for the existing tools |
| P5 | Removal | S020 §4.2.3 "An AbortSignal that unregisters the tool when aborted." plus form removal | `toolsRemoved` with matching name and frameId for each tool |
| P6 | Invocation round-trip | `WebMCP.pdl@154:59` `invokeTool` | `toolInvoked` and then `toolResponded{status:"Completed"}` whose output equals the page's `execute` return value. Sibling `probes/WebmcpProbeInvoke.json` shows this path exists (`echo:round16-invoke-probe`). If P6 is omitted, the row must say "registration observation only". |
| N1 | Flag-off differential | same fixture as P1/P2, flags removed | `document.modelContext` undefined; `WebMCP.enable` `{}`; 0 events |
| N2 | DevTools-feature-off differential | `features.cc@154:571` | page API present; `WebMCP.enable` error "wasn't found" (pins CE4/CE5 causally) |
| N3 | Permissions policy | S020 §4.4 "tools" feature, default allowlist `'self'` | opaque sandboxed iframe: `registerTool` rejects `NotAllowedError` with the exact message. `probes/WebmcpProbeSecure.json` `sandbox_iframe_opaque` already shows "Access to the feature \"tools\" is disallowed by permissions policy." and 0 events |
| N4 | Malformed declarative | Chromium issue enum in the 154 binary | no tool; `Audits.issueAdded` `GenericIssue` with `errorType` = `FormModelContextMissingToolName` (and MissingToolDescription). The reason must be asserted, not just "no event" |
| D1 | Divergence, recorded and not hidden | S020 §4.1 `[SecureContext]` | `data:` (or `about:blank`) declarative form → page API undefined **and** CDP `toolsAdded` present. The receipt records `specPredicted:none, observed:toolsAdded, divergence:true` and does not count it as a pass or fail of conformance |

Plus, before the row says "a build" rather than "one build": the same P1/P2/N1 rerun on CfT `chromium-1248`
(156.0.8078.4, sha256 `377a9fc0…5025`). This is OPTIONAL for admission at the 154 scope and REQUIRED for any
unscoped wording.

Source rows (opened this round, located quote; L1 writes rows):

- **S020 re-open must update its version anchor.** The row (`corpus/SOURCES.md:34`) says "CG-DRAFT 2026-10-16,
  revision f14762e6". The live document now reads "Draft Community Group Report, 20 October 2026",
  `<meta name="revision" content="cb3d16964ab3e92cfd5f09901ed0504373a906e8">`. Mined S020 backs only P2/P3/P5/N3/D1
  and the Document placement. It **does not** back P1/N4 (CE1).
- **New row (code, A): Chromium `runtime_enabled_features.json5` @154.0.8037.97** for the flag scope and the
  experimental/origin-trial status.
- **New row (code, A): `third_party/blink/common/features.cc` @154** for DevToolsWebMCPSupport.
- **New row (code, A): `WebMCP.pdl` @154** for the event and command contract and the replay semantics. Pair it
  with the browser's own `/json/protocol`, since S002 (the tip-of-tree viewer) describes main, not 154 (CE7).
- **New row (test, A): WPT `webmcp/` @a72ba094** as the independent oracle for the declarative schema and the
  secure-context negative case.
- Without the Chromium rows plus the WPT row, the declarative half of C2 has no tier-A/B support (QUALITY12/15).

## 5. Smallest safe corrections (in priority order)

1. Keep the fixture's observed-154 `expectedTools` only as `observed-baseline`, not counted. Add the WPT P1 form
   and its upstream expected object as the counted declarative positive (its oracle predates this round).
2. Add the N2, N3, N4-with-reason and D1 cases to the harness. Remove `PLAN.md:24`'s exclusion of `data:` as a
   recorded case. Keep it out of the positive set.
3. Scope the receipt `flags` to the minimal proven set (`--enable-blink-features=WebMCP`) and keep the full
   plan set as one ablation row. Drop "DeclarativeWebmcp" and "DevToolsWebMCPSupport" from any "required" wording.
4. Note/decision-table wording: "CDP exposes declarative tools even where the page API is absent (data:,
   about:blank) on 154". "`document.modelContext` per spec; `navigator` absence is not a divergence".
   "Declarative forms are Chromium/WPT-defined, not in S020 @ cb3d1696".
5. Capability row wording per §3 item 5. Frontier: add a 154 held row and leave the 152 row open as unprobed.

## 6. Sources opened this session (2026-10-20)

| ID | URL / revision | Fetch | Located quote (≤25 words) |
|---|---|---|---|
| R1 (S020) | https://webmachinelearning.github.io/webmcp/ — "20 October 2026", revision `cb3d1696…a906e8` | `curl -sS -L`, 505,949 B, sha256 `180c55ba…0d1a`; HTML stripped to text | §4.1 l.364: "[SecureContext, SameObject] readonly attribute ModelContext modelContext;". §4.4 l.820: "gated behind the policy-controlled feature "tools", which has a default allowlist of 'self'." §5.2 l.881: "this specification does not prescribe the format in which tools are exposed to the browser agent." Status l.24: "It is not a W3C Standard nor is it on the W3C Standards Track." |
| R2 | https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 | `curl`, 232,665 B, sha256 `99b92e67…1d2b` | l.7023-7035: `name: "WebMCP", origin_trial_feature_name: "WebMCP", … implied_by: [… "WebMCPTesting"], status: "experimental",` (and no `DeclarativeWebMCP` entry) |
| R2-main | same path @main | `curl`, 256,045 B, sha256 `090f32bf…a3bd` | l.2378: "Declarative WebMCP: tools declared via HTML <form> attributes" (main only, not 154) |
| R3 | …/154.0.8037.97/third_party/blink/common/features.cc | `curl`, sha256 `6c65ec47…afd4` | l.571: `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);` |
| R4 | …/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | `curl`, sha256 `26e62f29…37ff`; `diff` against main: main adds `optional boolean debugging` | l.51: "Enabling the domain will trigger a toolsAdded event for all currently registered tools." |
| R5 | https://github.com/web-platform-tests/wpt `webmcp/` @ `a72ba094b342faa0213d26330d6e09e2359ea43f` (2026-10-20T15:21:23+01:00) | `git clone --depth 1 --filter=blob:none --sparse` + `sparse-checkout set webmcp` | `declarative/getTools-declarative-schema.https.html` l.10: `<form toolname="search_tool" tooldescription="Search the web">` (sha256 `ad977dc5…c35c3`). `imperative/non-secure.html` l.13: "document.modelContext is not supported in non-secure context." (sha256 `5a591488…54c3`) |

Local commands (outputs quoted above): `grep -aoF` / `grep -acF` over `/usr/lib/chromium/chromium` and the CfT
binary (`DeclarativeWebMCP` 3, `DeclarativeWebmcp` 1, `WebMCPTesting` 2, `DevToolsWebMCPSupport` 1 at 154; 0 at
156); `sha256sum` of the CfT binary; read-only parses of the sibling probe JSON and `protocol-domain.json`.
Scratch files are under `/tmp/criticc2-*` only. Nothing was written in the lane except this report.
