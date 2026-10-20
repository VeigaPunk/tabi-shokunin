# DraftReadme — corpus/README.md append, round 17

Draft for the L1 to integrate. Not the README. Base: `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`
(`corpus/README.md` 314 lines, ends `…Chromium 152 stays open.\n`). Items marked **[COND]** are
written only when their condition holds at integration. Nothing here is a measured result.

## Round 17 — WebMCP invocation evidence and map reconciliation (2026-10-20)

Append-only. The round-3 `## Frontier` (`corpus/README.md:22-54`), the kaika frontier block
(`:171-184`) and the Round 16 section (`:287-314`) keep their wording. Row counts are not restated.

### Note-map row **[COND: only when `corpus/knowledge/webmcp-invocation-round-17.md` exists]**

A map row is written when its file exists, never before (`corpus/README.md:9`).

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-invocation-round-17.md` | Chromium 154.0.8037.97, flag-enabled, loopback fixtures only: WebMCP tool invocation over CDP (`WebMCP.invokeTool` → `toolInvoked` → `toolResponded`), raw request/response, page-side observation, predicate fixed before the run; flags-off control. Receipt cases `<passed>/<total>` from the committed receipt. Not a real-site, agent-side or Chromium 152 claim. | S020, S033–S036 (`corpus/SOURCES.md:34,47-50`); round-17 rows **[COND: the S041+ rows the note cites, `corpus/SOURCES.md`]**; receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` |

### Census U3 pointer index (routed defect 4)

`corpus/lessons/round-16-verifier-spotcheck.md:151` asks for an index row pointing readers from
the census to the Round 16 supersession. The census note is sha-pinned
(`corpus/evidence/fleet-round-1-freshness/pins.tsv:7`), so the pointer lives here, not in it.

| Census item (pinned, unedited) | Current pointer | Status |
|---|---|---|
| `knowledge/browser-surface-census.md:188-189` (U3: native WebMCP on chromium 152, "no runtime probe performed"); `:145-153` (§3.4 WebMCP) | Round 16 supersession, `corpus/README.md:287-314` (supersession paragraph `:295-305`; wave-2 note `:307-314`) | Held for Chromium 154 only, flags on, loopback. Chromium 152 stays unprobed. |

### Frontier status — tool invocation as committed evidence

The Round 16 wave-2 note lists "tool invocation as committed evidence" as still open
(`corpus/README.md:302-303`). The standing limit is `knowledge/webmcp-chromium-loopback-round-16.md:127`
("No tool is invoked in the receipt; invocation is a probe observation only"); the probe-only
`WebMCP.invokeTool` observation is at `:70-73`.

Round 17 status, one of the two alternatives below (L1 keeps only the one the committed evidence supports):

- **[COND A: C2 receipt committed and `measure-c2` returns `c2_invocation_held: 1` at the delivered revision]**
  Held for Chromium 154.0.8037.97, flag-enabled, loopback fixtures only; receipt
  `corpus/evidence/round-17/webmcp-invoke/receipt.json`; note `knowledge/webmcp-invocation-round-17.md`.
  No real-site, agent-side or default-profile invocation claim is held.
- **[COND B: otherwise]** Open. No committed invocation receipt exists at base; the round-16 limit
  at `:127` stands unchanged.

Either way: real-site WebMCP, agent-side consumption of page tools and Chromium 152 remain open
(the same list as `corpus/README.md:302-305`).

### Adjacency pointer

- WebMCP page-tool overlap with kaidoku's Core row "Runtime observation (CDP)"
  (`kaidoku-shokunin/PROVINCE.md:53`) was reported as contested in
  `knowledge/webmcp-chromium-loopback-round-16.md:131-140`.
- Integrator ruling (recorded for the operator and both lanes):
  `corpus/lessons/round-16-verifier-spotcheck.md:138-142` — tabi owns live browser/CDP page
  observation including the WebMCP page-tool surface; kaidoku keeps CDP as an REA provider surface
  and cites tabi for browser-side mechanics.
- Checked sibling-overlap map: `corpus/adjacency.tsv` **[COND: exists at integration; absent at
  base — `ls corpus/adjacency.tsv` fails]**. Its rows, not this paragraph, carry the per-overlap
  dispositions.
