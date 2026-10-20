# SrcRejects — tempting-but-weak WebMCP sources (round 16, wave 1)

Seat: `TabiR16.SrcRejects-5` (leaf). Scope: identify 2–3 community sources that look useful for the
native-WebMCP capability but assert an API surface/version/flag that the primary sources or this
lane's own observation contradict. Every quote below was opened by me on **2026-10-20** with the
fetch method named. I ran no browser, gate, counter or selftest; the runtime observation used for
contradiction is L1's recorded pre-probe in `.ufo/waves/round-16/PLAN.md:18-24`, reused as an
author-side anchor, not re-executed.

## Baseline used to judge (all opened this session)

| Anchor | Opened | Located text |
|---|---|---|
| S020 WebMCP spec — https://webmachinelearning.github.io/webmcp/ | `read`, native, 2026-10-20 | "Draft Community Group Report, 20 October 2026"; meta-revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`; §4.1 IDL: `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };`; §Status: "It is not a W3C Standard nor is it on the W3C Standards Track." |
| Chrome for Developers, WebMCP — https://developer.chrome.com/docs/ai/webmcp.md | `read`, `.md` alternate, 2026-10-20 | "Published: May 18, 2026, Last updated: October 7, 2026"; §Get started: "Join the [WebMCP origin trial] … from Chrome 149."; §Local WebMCP: "Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`" |
| Chrome for Developers, Imperative API — https://developer.chrome.com/docs/ai/webmcp/imperative-api.md | `read`, `.md` alternate, 2026-10-20 | "Last updated: October 16, 2026"; every sample registers through `document.modelContext.registerTool(...)`, `getTools()`, `executeTool()` |
| L1 pre-probe, `.ufo/waves/round-16/PLAN.md:18-24` | `read`, 2026-10-20 | Chromium 154.0.8037.97; with `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting` a loopback page exposes `document.modelContext` and `'modelContext' in navigator` is false; with no flags no `document.modelContext`; use `http://127.0.0.1:<port>` |

Spec checks I ran against the fetched text (`artifact://23125`, the full spec output):

- `grep "partial interface Document"` → lines 458 and 1948; line 459 is
  `[SecureContext, SameObject] readonly attribute ModelContext modelContext;`. No `Navigator` partial exists.
- `grep -i "navigator"` → exactly one hit, line 927, `Navigator.language` in a localization note. Unrelated to `modelContext`.
- `grep "provideContext"` → **no hits** anywhere in the spec.
- Chrome docs re-check: the local-development flag is `#enable-webmcp-testing`, and the trial floor is Chrome 149.

## Reject R1 — bug0, "WebMCP just landed in Chrome 146"

- URL: https://bug0.com/blog/webmcp-chrome-146-guide
- Opened: 2026-10-20, `read` (page served native; `.md` twin auto-found).
- Date: published **2026-02-11T06:06:40.926Z**, author Syed Fazle Rahman.
- Kind/tier proposal: community blog, C.

Claims (≤25 words each), with location:

> "The API lives at `navigator.modelContext`." — §How it actually works, para 1. (6 words)

> "Chrome 146 ships a flag-gated preview of WebMCP." — tldr. (9 words)

> "Search for "Experimental Web Platform Features"" — §How to try it today, step 3. (6 words)

Why tabi must REJECT:

1. **Wrong global.** The spec defines a `Document` partial only (`partial interface Document … modelContext`),
   and the whole fetched spec contains no `Navigator.modelContext`. Chrome's own imperative examples use
   `document.modelContext.registerTool(...)`.
2. **Contradicted by observation.** L1's Chromium 154 run shows `document.modelContext` present and
   `'modelContext' in navigator` false, even with the WebMCP feature set enabled (`PLAN.md:18-20`).
   The article's own snippet `navigator.modelContext.registerTool({...})` would throw on that build
   `[INFERENCE: TypeError from absent global; not executed by me]`.
3. **Wrong flag recipe.** Current Chrome docs name `chrome://flags/#enable-webmcp-testing`. The post's
   "Experimental Web Platform Features" is a generic Blink gate; no source I opened ties it to WebMCP
   `[INFERENCE: generic-gate behavior not separately probed]`.
4. **Wrong status.** The post calls WebMCP "A W3C standard"; S020 says it "is not a W3C Standard nor is it
   on the W3C Standards Track." The 146-vs-149 version line is also unverifiable from this post (no build id,
   no channel, no receipt), while Chrome docs pin the origin trial at 149.
5. **Cost of admitting it.** It would seed the C2 note/fixtures with a `navigator` surface the pinned browser
   cannot expose, converting a real observation into a test that can only fail or silently no-op.

Flip condition (any one): a pinned run records `'modelContext' in navigator === true` with the Chromium
version/sha256 and argv; or a spec revision adds a `Navigator` partial exposing `modelContext`; or Chrome
release notes/docs state navigator exposure. For the flag claim: Chrome docs list "Experimental Web Platform
Features" as the WebMCP gate. Until then: rejected.

Suggested SOURCES row (L1 assigns the id):

```
| S0xx | WebMCP just landed in Chrome 146 — https://bug0.com/blog/webmcp-chrome-146-guide | community | C | WebMCP API surface and local flag recipe as of 2026-02-11 | post published 2026-02-11, §How it actually works and §How to try it today | REJECTED: asserts `navigator.modelContext` and the "Experimental Web Platform Features" gate; S020 §4.1 exposes `document.modelContext` only and Chrome docs name `#enable-webmcp-testing`; flip: a pinned build shows `'modelContext' in navigator` true or a spec `Navigator` partial appears | rejected | 2026-10-20 | on-release | — |
```

## Reject R2 — Salam Experts, "How to Enable WebMCP in Chrome 146"

- URL: https://www.salamexperts.com/blog/ai/enable-webmcp-chrome
- Opened: 2026-10-20, `read`, native.
- Date: published **2026-03-14T11:10:23+00:00**, modified **2026-09-17T09:48:51+00:00**; body still says
  "September 17, 2026".
- Kind/tier proposal: community/SEO onboarding post, C.

Claims (≤25 words each), with location:

> "The WebMCP API is now active — navigator.modelContext will be available on HTTPS pages." — §After relaunching. (13 words)

> "If it returns true, WebMCP is enabled correctly." — §After relaunching, referring to typing `"modelContext" in navigator`. (8 words)

> "WebMCP does not activate on HTTP." — §Troubleshooting table. (6 words)

Why tabi must REJECT:

1. **The verification step is false on the observed build.** `'modelContext' in navigator` is false on
   Chromium 154 with the full WebMCP feature set (`PLAN.md:20`); `document.modelContext` is the exposed
   surface (`PLAN.md:19`). A reader following this check concludes WebMCP is broken when it is working.
2. **The HTTP claim is contradicted by the lane's own working surface.** The only observed positive surface is
   `http://127.0.0.1:<port>` (`PLAN.md:24`), where `document.modelContext` and `WebMCP.toolsAdded` appear.
   "Does not activate on HTTP" is false for loopback; it overgeneralizes from ordinary non-secure origins.
3. **Version/flag pairing is unverified.** It pins "Chrome 146 or higher" and `chrome://flags/#enable-webmcp-testing`
   (flag name matches Chrome docs) but gives no build number, channel or receipt, and Chrome docs now state the
   origin trial starts at 149. The post was "modified" 2026-09-17 without correcting the navigator check, so the
   date cannot rescue it.
4. **Cost of admitting it.** It is exactly the kind of page an implementer lands on for "enable WebMCP"; admitting
   it would put a wrong readiness check and a wrong loopback exclusion into the onboarding trail for the C2 harness.

Flip condition (any one): a named-build run shows `'modelContext' in navigator === true` after that flag; or
`document.modelContext` is observed undefined over `http://127.0.0.1:<port>`; or the page is corrected to
`document.modelContext` and loopback HTTP. If corrected, it can return as a tier-C onboarding row, still
secondary to Chrome docs.

Suggested SOURCES row:

```
| S0xx | How to Enable WebMCP in Chrome 146 — https://www.salamexperts.com/blog/ai/enable-webmcp-chrome | community | C | WebMCP enablement and readiness check as of 2026-09-17 | published 2026-03-14, modified 2026-09-17; §After relaunching and Troubleshooting | REJECTED: `"modelContext" in navigator` check and "does not activate on HTTP" contradict observed `document.modelContext` on `http://127.0.0.1:<port>` (PLAN.md:18-24); flip: a named build shows navigator true, or the page is corrected to `document.modelContext` and loopback HTTP | rejected | 2026-10-20 | on-release | — |
```

## Reject R3 — freeCodeCamp, "A Developer's Guide to WebMCP: Shipping a 0% Adoption Standard"

- URL: https://www.freecodecamp.org/news/a-developers-guide-to-webmcp/
- Opened: 2026-10-20, `read`, native.
- Date: published **2026-05-28T22:27:50.820Z**, modified **2026-08-31T14:29:10.469Z**; author Chudi Nnorukam.
- Kind/tier proposal: community tutorial, C.

Claims (≤25 words each), with location:

> "The current WebMCP spec describes a `navigator.modelContext` browser API." — §Experiment 1: chudi.dev (SvelteKit, polyfill approach), para 1. (9 words)

> "It implements a `provideContext()` convention that works in Chrome 146+ Canary" — same section, on `@mcp-b/global`. (12 words)

> "Chrome 146 Canary has a partial implementation" — §§Prerequisites / What WebMCP Actually Is. (7 words)

> "The polyfill convention (`.provideContext()`) is not the final spec." — §What I Learned From Shipping Something Nobody Else Has. (9 words)

> "there is no browser in production that fully executes the code I shipped." — same section. (13 words)

Why tabi must REJECT:

1. **Stale API called "current".** The fetched spec (§4.1, 20 October 2026) exposes `document.modelContext`;
   `navigator.modelContext` does not exist in the IDL, and `'modelContext' in navigator` is false on
   Chromium 154 (`PLAN.md:20`). The article was modified 2026-08-31 and still calls the navigator surface current.
2. **Both shipped paths are non-spec.** `provideContext()` has **zero hits** in the fetched spec; the spec methods
   are `registerTool`, `getTools`, `executeTool`. `well-known`/`manifest` also has **zero hits** there. Experiment 1
   gates on `navigator.modelContext` and calls a `@mcp-b/global` polyfill; Experiment 2 ships a
   `.well-known/webmcp` manifest. Neither is the spec's in-page `ModelContext`, and the article itself concedes
   that "there is no browser in production that fully executes the code I shipped" — so its "shipped on two sites"
   is declaration evidence, not native-support evidence. On the pinned browser the Experiment 1 gate is false and
   the code silently degrades.
3. **Unpinned version assertion.** "Chrome 146 Canary" appears with no build id, no Chromium revision and no
   receipt; Chrome docs now place the origin trial at Chrome 149. A 146-era claim cannot be promoted as current
   support without the build it was observed on.
4. **Cost of admitting it.** The post is the most tempting of the three (111,076-domain survey, full source), and
   that credibility is exactly why admitting its API sentences would smuggle `navigator` + `provideContext` into
   tabi's knowledge base. It is honest about the null result and about the polyfill not being final, so a *narrow,
   dated* row later ("declaration never invoked, May 2026") is defensible — but its adoption number is a separate
   claim I did **not** verify (Cloudflare Radar not opened); do not inherit it from this row either.

Flip condition (any one): a spec revision adds `provideContext` or a `Navigator` partial; or a new row is scoped
narrowly to "`@mcp-b/global` polyfill convention, version-pinned, explicitly not native"; or the article is
re-verified against a named Chrome build and corrected to `document.modelContext`.

Suggested SOURCES row:

```
| S0xx | A Developer's Guide to WebMCP: Shipping a 0% Adoption Standard — https://www.freecodecamp.org/news/a-developers-guide-to-webmcp/ | community | C | WebMCP API shape and 2026 polyfill/manifest declarations | published 2026-05-28, modified 2026-08-31; §Experiment 1 and §What I Learned | REJECTED: calls `navigator.modelContext` the current spec and ships non-spec `provideContext()` plus `.well-known/webmcp`; S020 §4.1 is `document.modelContext` and contains neither; article itself says no browser executes it; flip: pinned `@mcp-b/global` row scoped "polyfill, not native" or a corrected/spec-backed claim | rejected | 2026-10-20 | on-release | — |
```

## Screened, not tabled (so L1 does not re-do this work)

- `https://abvijaykumar.medium.com/webmcp-web-model-context-protocol-agents-are-learning-to-browse-better-22fcefc981d7`
  — search snippet shows `navigator.modelContext.registerTool()`, but `read` returned **HTTP 403**; I could not open
  it, so per the source contract it cannot be quoted or tabled. Unrun/unopened.
- `https://npm.io/package/@mcptrail/webmcp-polyfill` — opened 2026-10-20 (`.md` alternate). Version 0.1.0,
  published 2026-07-07, **0 weekly downloads**. It self-describes as "A navigator.modelContext polyfill" that
  "installs a spec-faithful shim only when the browser lacks it", and defaults `alsoDocument: true`. It is
  self-qualifying, so not a false claim; keep as a **lead, not a row**: usable only as a pinned polyfill-behavior
  fixture, never as native-support evidence. Flip to a row only with a pinned version and scope "polyfill, not native".
- `https://chromestatus.com/feature/5117755740913664` — opened 2026-10-20; returned only the JS app shell
  (`title: Chrome Platform Status`), no milestone text. Unread; do not cite it for 149/stable status.

## Notes for L1 (sourcing/logistics, not claims)

- **S020 live revision moved.** Today's fetch reports "Draft Community Group Report, 20 October 2026" and
  `meta-revision cb3d16964ab3e92cfd5f09901ed0504373a906e8`; the current row says "CG-DRAFT 2026-10-16,
  revision f14762e6". Both are S020 facts; L1 should decide whether to refresh the row anchor to the 2026-10-20
  build (the IDL still matches the observation: `Document.modelContext`, no `Navigator` partial).
- **Search coverage is not complete.** Queries run: `WebMCP navigator.modelContext Chrome stable shipped blog`;
  `"WebMCP" chrome://flags enable-features tutorial blog 2025`; `WebMCP medium "navigator.modelContext" registerTool article`;
  `"WebMCP" "--enable-features" chromium command line enable webmcp`; `WebMCP tutorial youtube "navigator.modelContext"`.
  A follow-up query `"WebMCP" "Chrome stable" available now shipped 2026` failed across all providers (Perplexity
  quota, Parallel free-tier limit, Exa shape, Firecrawl 403, several bot walls), so no "stable Chrome" headline was
  screened from that query. No completeness claim.
- **Suggested log line** for `SOURCES.md` §Search log: identified 6, screened 6, tabled 3 as rejected, excluded 3
  (Medium 403 unopened; npm polyfill self-qualifying lead; Chrome Status shell unread). Stop: all three tabled
  rejects are contradicted by the fetched spec IDL plus the recorded Chromium 154 observation; no further reading
  can flip them without a new build/spec revision.
- **Tooling:** no installs or upgrades were performed; no pacman/uv/npm transaction. Fetch methods were `read`
  (native / `.md` alternate) only.
