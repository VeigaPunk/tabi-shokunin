# Draft — SOURCES.md entries for the round-17 WebMCP-invocation sweep (DraftSourcesLog)

Integration target: `corpus/SOURCES.md` (L1 alone writes it; this seat does not).
`<<…>>` = placeholder, to be filled from `.ufo/waves/round-17/sources/<Topic>.md` (Src* scout reports). Those reports did not exist when this draft was written; no count below is observed.

## Placement

- `## Paths`: append the bullet in §A after `corpus/SOURCES.md:62` (last existing path bullet, `native-webmcp`).
- `## Search log`: append the entry in §B after `corpus/SOURCES.md:78` (last existing entry); `## Leads (unopened)` begins at `:80`.
- Registry rows S041+ go after `corpus/SOURCES.md:54` (last row, S040). Not part of this draft; L1 adds them from scout output. Each `mined` row needs a non-`—` `used-by` (`scripts/check-sources.mjs`, rule `mined_without_used_by`).

## §A — `## Paths` bullet

- `webmcp-invocation` — S035 → S036 → <<S041…S0NN, in scout sequence order>>: the CDP domain declaration first (S035 teaches enable-replays-toolsAdded and backendNodeId for declarative tools, `corpus/SOURCES.md:49`; its cited lines are 7 and 47-54 and its teaches cell does not name an invoke command, so invocation shapes need their own rows [INFERENCE from the teaches cell]), then the DevTools consumer's navigation-removal inference (S036, `:50`), then <<the invocation request/response/event rows and the declarative-form row>>. Build authority for any argument shape is the 154 build's own `/json/protocol` (S035 note, `:49`; S002 `:16`: CDP has no backward-compatibility promise, so shapes are build-scoped). Ends at `knowledge/webmcp-invocation-round-17.md`; runtime status: <<held | not held — from measure-c2.mjs output, not from this draft>>.

## §B — `## Search log` entry

- 2026-10-20 · webmcp-invocation (TabiR17 wave 1: <<Src* scout names as spawned>>; DraftSourcesLog). Question: what do the CDP WebMCP domain, the Chromium 154 build and the DevTools consumer say about invoking a page-registered WebMCP tool — the request, the response and the events, and the failure, unregister, iframe and navigation cases the round-17 harness predicates cover — and which invocation recipes are wrong? Searched <<domains and repositories actually queried, per Src* reports>>. Identified <<N>>, screened <<N>>, included <<N>> (<<S041–S0NN>>: <<n>> mined, <<n>> queued, <<n>> rejected), excluded <<N>>: <<one clause per exclusion class, per Src* reports>>. Rejected rows carry a flip clause, as in S038–S040 (`corpus/SOURCES.md:52-54`). Stop: <<stop rationale from Src* reports>>. Shapes that no opened row states stay `[INFERENCE]` in the note and are tested only by the harness's predicates, never cited as source claims. Per-row URL, date and located quote: `corpus/lessons/round-17.md` §Gate (L1-owned, not yet written).

## §C — Pointers for L1 cross-check (every factual claim above)

| Claim used in draft | Pointer |
|---|---|
| S035 teaches enable/toolsAdded/backendNodeId; source is Chromium main, 154 build is authority | `corpus/SOURCES.md:49` |
| S036 navigation removal is inferred, not sent as toolsRemoved | `corpus/SOURCES.md:50` |
| S002 CDP unsupported, no backward-compat promise, `/json/*` shape build-scoped | `corpus/SOURCES.md:16` |
| S030/S031 declarative API outside the spec; schema synthesis TBD | `corpus/SOURCES.md:44-45` |
| Rejected-row flip convention | `corpus/SOURCES.md:52-54` |
| Search-log entry shape (question, searched, identified/screened/included/excluded, stop) | `corpus/SOURCES.md:66-78` |
| No tool is invoked in the round-16 receipt | `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127` |
| Open item "tool invocation as committed evidence" | `corpus/README.md:302-304` |
| Required invocation case ids; `source: S041+` header rule | `.ufo/waves/round-17/PLAN.md` §"C2 interface contract" (line 108 onward; ids at 119-122, header rule at 129) |
| Zero SOURCES rows mention invocation at baseline | `grep -n invok corpus/SOURCES.md` → no output (checked 2026-10-20) |
