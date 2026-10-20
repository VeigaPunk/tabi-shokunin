# DraftAdjacency — WebMCP vs sibling provinces (tabi round 16)

Author seat: `TabiR16.DraftAdjacency-5` (scribe, leaf, read-only on siblings). No sibling file was edited; no web source was opened this seat (every anchor below is a local file read this session, `file:line` as shown). No installs or upgrades were performed.

## 1. Sorting rule

Each WebMCP activity is sorted by the question it answers, not by the API name:

| Activity | Question answered | Province by question |
|---|---|---|
| Observe which tools a loaded page registers, via CDP (`WebMCP.enable`, `WebMCP.toolsAdded`) | What does this page expose at runtime? | tabi (CDP session discipline; dynamic-page evidence) — **contested** with kaidoku/REA and revenger (see C-A) |
| Author `toolname` forms or `document.modelContext.registerTool` on a published site | How does a site publish tools? | kake for its own properties only; tabi refuses publishing — **unclaimed for third-party sites** (C-B) |
| Write tool names, descriptions, schemas agents will read | Is the agent-facing text good? | kotoba (prompt/skill craft) — **contested** (C-C) |
| Feed page tools into an agent harness / MCP-shaped bridge | How does an agent consume the tools? | kumitate (orchestration; MCP only "as they bear on orchestration") and tabi (kimi-webbridge substrate) — **contested** (C-D) |
| Judge trust of page-declared tool metadata | Can a page's tool text carry injection or deception? | kasegi (security research incl. prompt-injection) — tabi only records provenance (C-E) |
| Invoke a page tool | Does invocation act on an external site? | tabi, loopback only; external invocation is a consequential action tabi refuses without operator approval (in-province rule, not contested) |

## 2. Sibling anchors (verified by local read this session)

- **tabi (own):** `tabi-shokunin/PROVINCE.md:6-13` owns CDP session discipline and dynamic-page evidence patterns; `:15-16` refuses RE-as-forensics, publishing, secrets; `:17-19` no consequential actions on external sites. `corpus/README.md:35` WebMCP frontier ("unprobed (census U3)"); `:181` held-open row; `:194` "WebMCP spec | open — S020 opened and queued". `corpus/SOURCES.md:34` S020 `queued`, `used-by —`. `corpus/knowledge/browser-surface-census.md:145-153` §3.4: no WebMCP config in flags, webbridge tree, or kimi config; the only WebMCP surface on host is `rea-agents` CDP tool `discover-webmcp-tools`; native WebMCP in Chromium 152 not probed (§5-U3).
- **kaidoku (REA):** `kaidoku-shokunin/PROVINCE.md:44` REA MCP server row; `:53` "Runtime observation (CDP)" Core row (`inspect-web-page`, `observe-web-session`, `observe-web-execution`, `capture-browser-scenario`, self-launched `chromium --remote-debugging-port=9222`). `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:185` queues `discover-webmcp-tools` on a CDP target; `:608` records an exercised run returning honest `tools:{total:0}` (`ev_82dbdf0e…`) and `:597` shows `compare-web-captures` composing a `webmcp` dimension from `discover_webmcp_tools`. `kaidoku-shokunin/PROVINCE.md:36` "a frontier, not a fence".
- **revenger:** `revenger-shokunin/PROVINCE.md:3-7` owns "browser/Electron runtime evidence"; `:19-23` refuses live-target execution beyond declared target.
- **kake:** `kake-shokunin/PROVINCE.md:3` domain = web properties & publishing; `:14-18` publishing semantics and "publishing stays operator-gated"; `:24-26` frontier includes accessibility conformance (WCAG 2.2) and canonical/JS rendering; `:30-31` adjacency: "`tabi` drives browsers and owns client-side crawler discipline; kake owns publisher-side placement"; `:34-35` kagi/musketeer profile contested.
- **kumitate:** `kumitate-shokunin/PROVINCE.md:8-16` Core includes the Kimi Code substrate `~/.kimi-code/` (rows K1–K5, `kimi-census.mjs`); `:20` frontier "MCP protocol revisions as they bear on orchestration — queued"; `:26` "MCP/OAuth security practice → kasegi / kagi".
- **kotoba:** `kotoba-shokunin/PROVINCE.md:13` owns agent-definition and dispatch-prompt craft; `:20` frontier "MCP/plugin instruction surfaces"; `:31` adjacency to kasegi for "prompt-injection exploits".
- **kengaku:** `kengaku-shokunin/PROVINCE.md:35-38` reports out that "keep an explicit output-contract system prompt whenever tool affordances are exposed" and routes that craft to kotoba.
- **kasegi:** `kasegi-shokunin/PROVINCE.md:3` bounty & security research; `:44-48` adjacency list; `:48` live-target testing refused.
- **kagi:** `kagi-shokunin/PROVINCE.md:43` CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` "contested with kake"; partition row in `corpus/adjacency.tsv` (presence-only).
- **tsukuroi:** `tsukuroi-shokunin/PROVINCE.md:8-14` owns pacman state; `:27` "Never installs, upgrades, or removes packages".
- **tameshi:** `tameshi-shokunin/PROVINCE.md:3-6` verification-fixture craft; `:17` "every lane's gate remains its own"; `:44-47` visual/UI snapshot diffing rejected (S030) for adjacent UI lanes.
- **mado, kama, kotodama, game-dev-2d:** no WebMCP, MCP-tool, or page-tool mention found (grep over their PROVINCE.md files, this session).

## 3. Contested scope lines (named, not absorbed)

**C-A — page-side tool observation via CDP.** Claimants: tabi (CDP discipline, C2 harness), kaidoku (REA `discover_webmcp_tools` already in the REA catalog; `compare_web_captures` consumes it), revenger (browser runtime evidence). Overlap is real: the same CDP domain, the same loopback-endpoint discipline. Tabi's `WebMCP.enable` harness and REA's `discover-webmcp-tools` observe the same surface. Proposed split for the integrator: tabi owns the protocol-level observation method and its receipt; kaidoku owns REA's verb and catalog. Tabi receipts must cite its own harness output, not an REA verb result, and must not restate REA evidence as tabi evidence. Ruling needed: whether revenger's "browser/Electron runtime evidence" includes page-side WebMCP.

**C-B — authoring WebMCP tools on published sites.** Declarative forms (`toolname`/`tooldescription`) and `document.modelContext.registerTool` are page markup/JS authored by site builders. kake covers its own properties (ds4cc.com, *.kimi.page, GitHub Pages); tabi refuses publishing (`PROVINCE.md:15-16`). Third-party sites: no owner. Adjacent: WCAG 2.2 (kake frontier `:24-26`) and tabi's own ARIA rows (S023–S025, `SOURCES.md:37-39`) meet on accessible names/roles, which the declarative form form-fields also use. Do not let C2 imply that authoring guidance is in tabi scope.

**C-C — tool names, descriptions and schemas as agent-facing text.** These are prompt-like strings read by a model. kotoba owns the craft of such text (`kotoba PROVINCE.md:13,20`); kengaku measures how tool affordances change capability (`kengaku PROVINCE.md:35-38`). tabi records the observed text verbatim and its shape; it does not grade wording. Route craft findings to kotoba.

**C-D — agent-side consumption and bridging.** WebMCP tools reach an agent only through some harness. Candidates: kumitate's Kimi substrate (census rows K1–K5 under `~/.kimi-code/`, `kumitate PROVINCE.md:14`) and tabi's kimi-webbridge plugin at `~/.kimi-code/plugins/managed/kimi-webbridge/` (tabi primary substrate, census `§3.1`). The same directory sits in both lanes' scope, so it is contested. The webbridge daemon is not listening and the extension↔daemon handshake was never observed (`tabi corpus/README.md:30-34`), so whether webbridge exposes page tools at all is unknown [INFERENCE: no]. kumitate's MCP frontier is named only "as they bear on orchestration"; a WebMCP-to-agent bridge is orchestration only once it exists. Report, do not absorb.

**C-E — trust of page-declared tool metadata.** REA's catalog describes `discover_webmcp_tools` output as "page-declared-untrusted" (catalog text as listed in the xd inventory; not invoked this seat). Injection or deception through tool descriptions is a security question: kasegi (`kotoba PROVINCE.md:31`) and kagi (routed by `kumitate PROVINCE.md:26`). tabi may record provenance ("page-declared, untrusted") and shape only; it issues no security verdict.

**C-F — invocation.** Calling a page tool can submit, post or delete. tabi's refusal of consequential external actions (`PROVINCE.md:17-19`) makes invocation on any external site out of province without operator approval. Loopback fixture invocation is in province (the Invoke probe). This is in-province but must stay gated; no sibling claim.

**C-G — Chromium binary and version pin.** Chromium is a pacman package (tsukuroi, `PROVINCE.md:8-14,27`); tabi's runtime-pin evidence depends on the same binary. **Drift to flag:** `corpus/README.md:35,181,194` and census §3.4 say "Chromium 152"; `.ufo/waves/round-16/PLAN.md:17` pre-probe records `Chromium 154.0.8037.97 (/usr/bin/chromium)`. The integrator must reconcile which version the census means before C2 cites either. Upgrades stay with tsukuroi/operator; the pacman pause is host-wide.

**C-H — profile and CDP port.** The-musketeer profile and port 9222 are contested kagi/kake/tabi (`kagi PROVINCE.md:43`, `kake PROVINCE.md:34-35`). The C2 harness uses a fresh temp profile on 127.0.0.1:0 and never touches them. Keep it that way; the note is a boundary reminder, not a claim.

**C-I — harness method.** Playwright-driven loopback harness with fixtures is tabi's gate; tameshi owns verification-fixture craft and admits a pattern only from two lanes (`tameshi PROVINCE.md:3-6,16-17`). No transfer proposed.

## 4. What this draft does not establish

- No external source opened; no S-row admitted from this seat. S020 remains `queued`.
- No claim that Chromium exposes `navigator.modelContext` or any shipped WebMCP behavior. Those belong to the WebmcpProtocol/WebmcpRuntimePin/probe seats.
- No claim that any sibling lane has, or lacks, a live WebMCP observation.

## 5. Asks for the integrator (L1)

1. Rule C-A (tabi vs kaidoku/REA vs revenger) before C2 receipt is written.
2. Rule C-B: confirm no lane authors WebMCP for third-party sites; kake scope limited to its own properties.
3. Rule C-D: place `~/.kimi-code/plugins/managed/kimi-webbridge/` under one owner in the adjacency table.
4. Reconcile Chromium 152 vs 154 across README/census and PLAN before any version-bound claim.
5. Decide whether C-E routes to kasegi or kagi (kumitate names both).
