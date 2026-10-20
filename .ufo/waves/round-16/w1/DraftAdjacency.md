# DraftAdjacency — report (tabi round 16, WebMCP adjacency)

Seat: `TabiR16.DraftAdjacency-5` (leaf scribe; no subagents; no sibling edits; no web source opened; no installs or upgrades). Full draft with all anchors: `.ufo/waves/round-16/drafts/DraftAdjacency.md`.

## Behavior

Sorted WebMCP activities by the question each answers:

- **Observe page-registered tools via CDP** → tabi (CDP discipline). Contested with kaidoku/REA and revenger.
- **Author tools on published sites** → kake only for its own properties; tabi refuses publishing. Third-party: unowned.
- **Tool names/descriptions/schemas** → kotoba craft; kengaku measures tool-affordance effects. tabi records shape only.
- **Feed page tools into an agent** → kumitate (MCP "as they bear on orchestration", queued) and tabi (kimi-webbridge). Contested.
- **Trust of page-declared metadata** → kasegi (prompt-injection). tabi records provenance only.
- **Invoke a page tool** → tabi, loopback only. External invocation is a consequential action tabi refuses without operator approval.

## Sibling anchors (read this session)

- tabi: `PROVINCE.md:6-19`; `corpus/README.md:35,181,194`; `corpus/SOURCES.md:34` (S020 queued); `corpus/knowledge/browser-surface-census.md:145-153` (§3.4).
- kaidoku: `PROVINCE.md:44,53` (REA MCP server; CDP runtime row); `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:185,597,608` (`discover-webmcp-tools` queued, composed into `compare-web-captures`, exercised as `tools:{total:0}`).
- revenger: `PROVINCE.md:3-7` (browser/Electron runtime evidence), `:19-23`.
- kake: `PROVINCE.md:3,14-18,24-26,30-31,34-35`.
- kumitate: `PROVINCE.md:8-16` (Kimi substrate K1–K5), `:20` (MCP frontier), `:26` (MCP/OAuth → kasegi/kagi).
- kotoba: `PROVINCE.md:13,20,31`. kengaku: `PROVINCE.md:35-38`. kasegi: `PROVINCE.md:3,44-48`. kagi: `PROVINCE.md:43`. tsukuroi: `PROVINCE.md:8-14,27`. tameshi: `PROVINCE.md:3-6,16-17,44-47`.
- mado, kama, kotodama, game-dev-2d: no WebMCP/MCP-tool mention (grep).

## Contested scope lines (named, not absorbed)

- **C-A** page-side tool observation via CDP — tabi vs kaidoku/REA (`discover_webmcp_tools` already in REA catalog) vs revenger. Proposed: tabi owns protocol-level method and its receipt; kaidoku owns the REA verb. Tabi receipts cite only its own harness output.
- **C-B** authoring WebMCP on published sites — kake (own properties only) vs tabi (refuses publishing). Third-party sites unowned. WCAG overlap with kake frontier and tabi's ARIA rows.
- **C-C** agent-facing tool text — kotoba craft; kengaku measurement. tabi records verbatim, does not grade.
- **C-D** agent-side bridge — kumitate (`~/.kimi-code/` census K1–K5) and tabi (kimi-webbridge at `~/.kimi-code/plugins/managed/kimi-webbridge/`) share one directory. Webbridge daemon not listening; handshake never observed, so whether it exposes page tools is unknown [INFERENCE: no].
- **C-E** page-declared metadata trust — kasegi (injection) and kagi (routed by kumitate). tabi: provenance label only.
- **C-F** invocation — in province on loopback; external invocation gated by tabi's refusal rule (no sibling claim).
- **C-G** Chromium pin — tsukuroi owns pacman package state; tabi's runtime pin depends on it. **Drift:** README/census say Chromium 152; PLAN.md:17 records 154.0.8037.97 on host. Reconcile before any version-bound claim.
- **C-H** profile/port 9222 — contested kagi/kake/tabi (`kagi PROVINCE.md:43`, `kake PROVINCE.md:34-35`). C2 uses temp profile on 127.0.0.1:0; keep it so.
- **C-I** harness method — tameshi owns verification-fixture craft; admits patterns only from two lanes. No transfer.

## Limits

- No external source opened; S020 stays `queued`. No claim about shipped Chromium WebMCP behavior.
- No claim that any lane has a live WebMCP observation.

## Asks for L1

1. Rule C-A before the C2 receipt.
2. Confirm no lane authors WebMCP for third-party sites (C-B).
3. Assign one owner for `~/.kimi-code/plugins/managed/kimi-webbridge/` (C-D).
4. Reconcile Chromium 152 vs 154 (C-G).
5. Route C-E to kasegi or kagi.

## Tooling

None installed or upgraded by this seat.

## Checks for main agent

None run by this seat (scribe; verification is L1's). Artifacts: `.ufo/waves/round-16/drafts/DraftAdjacency.md` (owned draft), this report.
