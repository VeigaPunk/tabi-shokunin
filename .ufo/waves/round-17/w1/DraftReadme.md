VERDICT: ISSUES

Scope: drafts/readme.md only (prose append for corpus/README.md). No lane file, knowledge note, pin, SOURCES row, adjacency file or PROVINCE was written. No git/jj command run. No tool installed or upgraded (none needed). No subagents spawned.

## Draft status
- Draft complete: `.ufo/waves/round-17/drafts/readme.md`. Four blocks: C2 map row (conditional), census U3 pointer index row (routed defect 4), frontier status for "tool invocation as committed evidence" (two conditional alternatives A/B), adjacency pointer.
- Conditional items are marked [COND] and must be resolved by L1 at integration; nothing in the draft asserts a measured result.

## Plan-vs-tree corrections (ISSUES for L1)
1. Frontier phrase line is wrong in PLAN.md. PLAN.md:"Frontier row ... (`corpus/README.md:308-309`)" — the phrase "tool invocation as committed evidence" is at `corpus/README.md:302-303` (line 303). Lines 308-309 are the wave-2 note about the historical `:194`/`:216`/`:282-285` rows. Draft cites 302-303.
2. Supersession range is wrong in PLAN.md (routed defect 4, and lesson `corpus/lessons/round-16-verifier-spotcheck.md:151`). The plan says `corpus/README.md:295-317`; the file is 314 lines (`wc -l`), so `:317` does not exist. The Round 16 section is `:287-314`; supersession paragraph `:295-305`; wave-2 note `:307-314`. Draft cites `:287-314`.
3. Census U3 location: `corpus/knowledge/browser-surface-census.md:188-189` (U3) and `:145-153` (§3.4 WebMCP). Plan's `:188` is correct for U3.
4. Round-16 note invocation limit: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127` ("No tool is invoked in the receipt; invocation is a probe observation only") — confirmed. Probe-only `WebMCP.invokeTool` observation at `:70-73` — confirmed.

## Pointer and rule facts verified
- Note-map rule: "A row is written when its file exists, never before" — `corpus/README.md:9`. Its cited source `CORPUS.md:45-47` is NOT present at the lane root (`ls CORPUS.md` → no such file); the rule is cited from README only. [INFERENCE: the file lives in the fleet root; not located this session.]
- Census note is sha-pinned: `corpus/evidence/fleet-round-1-freshness/pins.tsv:7` (`corpus/knowledge/browser-surface-census.md`, observed sha `a33c2264…d75b`, 265 lines). So the pointer must be a README index row, not an edit to the note — as the draft does.
- Knowledge notes at base: `ls corpus/knowledge/*.md | wc -l` → 33 (README round-16 row says "33 notes"; the C2 note would be the 34th, subject to L1 count).
- SOURCES at base: last row S040 (`corpus/SOURCES.md:53-54`); S020 `:34`; S033–S036 `:47-50`. Round-17 S041+ rows do not exist yet — the draft marks them [COND].
- Integrator ruling: `corpus/lessons/round-16-verifier-spotcheck.md:138-142` — confirmed (tabi owns live browser/CDP page observation incl. WebMCP page-tool surface; kaidoku keeps CDP as REA provider surface). Routed defects `:146-157`; defect 4 at `:151`, defect 5 at `:152`.
- kaidoku overlap: `kaidoku-shokunin/PROVINCE.md:53` ("Runtime observation (CDP)") — confirmed.
- Round-16 adjacency report: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:131-140` — confirmed.

## C3 risk for L1 (not my file, flagged)
- `.ufo/l0-questions.md` contains NO `tabi | round-17 |` (or any `tabi |`) line (`grep -n "tabi | round-17\|tabi | round-1[0-9]"` → empty). The C3 contract (`PLAN.md` C3 section, `disposition` rules) requires `ruling_ref` = `fleet@<40-hex>:.ufo/l0-questions.md:<line>` for `contested-open`, or `<repo>@<40-hex>:<path>:<line>` for `ruled`. The integrator ruling lives in the tabi lesson, so a `ruled` row would need `tabi-shokunin@<40-hex>:corpus/lessons/round-16-verifier-spotcheck.md:138-142` pinned at integration. The draft leaves this to C3/L1.
- `corpus/adjacency.tsv` does not exist at base (`ls` → no such file). Draft's adjacency pointer is conditional on its creation.

## Findings on the draft's content
- C2 map row cannot be finalized: `<passed>/<total>` receipt counts and round-17 S041+ ids are unknown until the harness and sources land. Left as placeholders with [COND].
- Frontier status alternatives A/B: A requires `measure-c2` = 1 at the delivered revision; B is the current truth at base (no committed invocation receipt). Draft explicitly avoids "held" wording unless A.
- No real-site, agent-side, or Chromium 152 claim appears in the draft; those remain open as in `corpus/README.md:302-305`.

## Tooling
- None installed or upgraded. Channel order not needed (file write only).

## Files written
- `.ufo/waves/round-17/drafts/readme.md` (new; owned draft)
- `.ufo/waves/round-17/w1/DraftReadme.md` (this report)
