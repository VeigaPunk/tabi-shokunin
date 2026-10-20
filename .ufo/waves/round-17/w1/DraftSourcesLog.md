VERDICT: ISSUES

Scope: draft of the SOURCES.md "## Paths" bullet and "## Search log" entry for the round-17 WebMCP-invocation sweep. Draft is complete; counts and scout-derived names are `<<…>>` placeholders because the Src* scout reports do not exist yet.

## Findings

1. **Target file is `corpus/SOURCES.md`, not a root `SOURCES.md`.** The root has no SOURCES.md (`ls` of lane root). PLAN ownership lists `corpus/SOURCES.md` as L1-only (`.ufo/waves/round-17/PLAN.md` §Ownership, "L1 alone writes"). This seat did not write it.
2. **Scout inputs are absent.** `.ufo/waves/round-17/sources/` does not exist at drafting time (`ls`, exit 2). Every `<<N>>`, the S041+ ids, the scout names and the stop rationale are therefore unfilled. Verify after the Src* scouts land.
3. **Placement is fixed by line.** Paths bullet after `corpus/SOURCES.md:62`; Search-log entry after `:78`; `## Leads (unopened)` at `:80`; Registry ends at `:54` (S040). Section list and order enforced by `scripts/check-sources.mjs:29`.
4. **Invocation has no baseline rows.** `grep -n invok corpus/SOURCES.md` returns nothing; the nearest rows are S035 (`:49`, WebMCP.pdl: enable replays toolsAdded; backendNodeId marks declarative tools; 154 `/json/protocol` is the authority) and S036 (`:50`, navigation removal inferred). Invocation shapes are not in any opened row; the draft marks that `[INFERENCE]`.
5. **Round-16 note confirms the gap.** `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`: "No tool is invoked in the receipt; invocation is a probe observation only."
6. **Pointer drift in PLAN C2.** PLAN cites the frontier row as `corpus/README.md:308-309`. The row "tool invocation as committed evidence" is at `corpus/README.md:302-304` (`:303`); `:307-314` is the wave-2 supersession note. The draft cites `:302-304`. L1 should correct the PLAN reference if PLAN is re-issued.
7. **Required case-id line range.** PLAN case ids are at `.ufo/waves/round-17/PLAN.md:119-122` (`:118` introduces them); header rule `source: S041+` at `:129`. Draft cites `119-122`.
8. **Path convention.** The new bullet uses slug `webmcp-invocation` (matches PLAN capability string `webmcp-cdp-invocation` only in part). L1 should confirm the slug; PLAN gives no slug.
9. **Stop rationale is not yet defined.** PLAN §C2 defines no source-sweep stop rule. The draft leaves it as `<<…>>` for scout output; it does not invent one.
10. **Exclusion vocabulary** follows the round-16 entries (`corpus/SOURCES.md:77`: redundant mirrors, shell pages, 403/rate-limited pages, superseded main-branch copies). Rejected rows need a flip clause (`corpus/SOURCES.md:52-54`; `check-sources.mjs` `rejected_without_flip`).
11. **Per-row detail** is deferred to `corpus/lessons/round-17.md` §Gate, which does not exist yet (L1-owned).

## Checks not run

- `node scripts/check-sources.mjs` not run: this seat was asked for a draft, not an integration; the file it checks is not yet edited. Run after L1 integrates the Registry rows and the entry.
- No browser, no CDP, no git, no `jj`. No sources were re-fetched; every pointer above is to a lane file read this session.

## Tools installed or updated

None.

## Files written

- `.ufo/waves/round-17/drafts/sources-log.md` (new; draft for L1)
- `.ufo/waves/round-17/w1/DraftSourcesLog.md` (this report)
