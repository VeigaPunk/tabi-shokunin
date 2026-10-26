# ScoutKotobaSplit — tabi↔kotoba agent-facing tool-text split (round 34 C1 recon, report only)

**Verdict.** The overlap is real but narrow, and the recommended disposition is **split-declared** (surface `agent-facing-tool-text`, sibling `kotoba`), not refused-route and not a screen. Tabi practises *observing and recording* page-published WebMCP tool names, descriptions and input schemas verbatim, and measures how Chromium derives and enforces them (protocol mechanics). Tabi never practised *grading or rewriting* that wording. Kotoba owns the craft of agent-facing text: it authors SKILL.md rules saying where tool-description text goes (SKILL.md:68-76 at the pin). The split exists only in a round-16 wave draft (`DraftAdjacency.md:39`). Kotoba's own census records that this "never reached tabi's scope surfaces" and says "a later round should ask tabi whether to land it" (census-round49.md:173-175). **No ruling exists**: the round-16 integrator ruling (`round-16-verifier-spotcheck.md:136-142`) covers only tabi vs kaidoku. One new tabi SKILL.md line lands the split. Mapping kotoba `census-round49.md:173` then yields one new verified row that counts toward newMapped. That row is 1 of the ≥3 target; the other two must come from other siblings (this seat did not scout them). No L0 line is needed, since split-declared needs none.

## Evidence (all read-only; no commands changed state; exit 0 throughout)

**Tabi side**
- Draft sorting rule row 3: `DraftAdjacency.md:13` "Write tool names, descriptions, schemas agents will read | Is the agent-facing text good? | kotoba (prompt/skill craft) — contested (C-C)".
- Draft C-C: `DraftAdjacency.md:39` "kotoba owns the craft of such text … tabi records the observed text verbatim and its shape; it does not grade wording. Route craft findings to kotoba."
- The draft cites kotoba `PROVINCE.md:13,20` and kengaku `PROVINCE.md:35-38` (`:25-26`). Those line numbers are from a 2026-10 PROVINCE that has since been rewritten. Do not reuse them; use the pinned lines below.
- Tabi's authored tool text is fixture input only: `corpus/evidence/round-16/webmcp/fixtures/declarative-form.html:5-8` (`tooldescription="Search"`, `toolparamdescription="Query text"`) is minimal test data whose expected schema is asserted. It is not craft.
- Tabi's measured mechanics on this surface:
  - `corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-60,65,77` — declarative and imperative tool shape; `<label>` text and `toolparamdescription` become the parameter description.
  - `corpus/knowledge/webmcp-invocation-round-17.md:54,73` — Chromium does not enforce `inputSchema`.
  - `SKILL.md:1955-1956,2112-2126` — the same, as skill rules.
- No `kotoba` mention in tabi `SKILL.md` or `PROVINCE.md` outside the watchdog roster string (`SKILL.md:1313,1450`). Kotoba's census round74.md:150-152 correctly calls that "a citation, not a split".
- `corpus/adjacency.tsv` has no kotoba row. `corpus/adjacency-screen.tsv:44` screens kotoba `PROVINCE.md:73` as no-claim-declared. That row restates kotoba's classification and does not map the tool-text surface.

**Kotoba side (pin 65a5c7a663249e0522cc49e4a148424200d9ddfe; `git branch --contains` shows master)**
- `SKILL.md:68` opens "MCP server `instructions` …" and `:76` states the rule "about one tool's inputs | that tool's `description` | the spec says it 'should not duplicate information already in tool descriptions'". So kotoba does practise tool-description authoring guidance, for MCP servers.
- `PROVINCE.md` Core (round 52): the MCP server `instructions` entry cites `corpus/knowledge/mcp-server-instructions-round52.md`. That entry § "What follows for the craft" item 1: "Server-wide guidance belongs in `instructions`, not repeated in every tool description".
- `PROVINCE.md:73` and census-round49.md:86, census-round74.md:70,101,126 classify tabi `none` ("states no split with kotoba on its scope surfaces"). These are pre-landing statements, stale once tabi lands the declaration.
- Kotoba's sibling-claim lines: census-round49.md:171-175 (quoted below).

**Ownership by question**
- Wording and structure of tool names, descriptions, schemas and server `instructions` (what an author should write): **kotoba**.
- What a page-published tool set actually is at runtime (CDP `WebMCP.toolsAdded` capture), derivation and enforcement in Chromium, invocation lifecycle on loopback fixtures, receipts: **tabi**.
- Authoring or publishing WebMCP on a third-party site: unowned. Kake covers its own properties; tabi refuses publishing (`PROVINCE.md:15-16`). Do not let the declaration claim it.
- Trust and injection in page-declared tool text: kasegi / kagi (draft C-E). Out of this split.
- Kengaku's measured effect of tool affordances: not touched by this row.

## Recommended disposition: split-declared

Why not refused-route: tabi does not refuse the surface. It observes it and owns the mechanics, and refuses only the wording craft. Why not a screen: it is a real boundary that kotoba's own census asks tabi to land. Screening it would mean answering a kotoba request with silence.

**Candidate accounting for the 13 kotoba-sourced lines** (keys = `kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:<path>:<line>`, text verified in this seat)

| key (path:line) | action | notes / verbatim quote |
|---|---|---|
| corpus/knowledge/sibling-overlap-census-round49.md:173 | **MAP** (new row) | quote below |
| …round49.md:171 | screen same-surface, surface `agent-facing-tool-text` | `tabi's round-16 wave drafts state a split with kotoba` |
| …round49.md:172 | screen same-surface, surface `agent-facing-tool-text` | `craft of such text … Route craft findings to kotoba` |
| …round49.md:175 | screen same-surface, surface `agent-facing-tool-text` | `a later round should ask tabi whether to land it` |
| …round49.md:86; …round74.md:70,101 | screen no-claim-declared, surface `-` | `driving real browsers against real sites with evidence discipline` (tabi's own description inside kotoba's `none` classification row) |
| …round74.md:126 | screen no-claim-declared, surface `-` | `` `856fa9e1` | +89/-0 | none → none `` (7 tokens, 27 non-space chars; classification-diff row, no boundary) |
| …round74.md:150,151,152 | screen no-claim-declared, surface `-` | a roster-string citation, "a citation, not a split" (line 150: `PROVINCE.md` names kotoba …; 152: `a citation, not a split, so tabi stays` — pick a ≥4-word ≥20-char verbatim substring per line) |
| corpus/knowledge/sibling-description-rewrites-round8.md:136 | screen third-lane-report, surface `-` | `owns the property fleet and the shared burner-chrome lease (CDP` — kotoba report on kagi/kake description wording; boundary is already row musketeer-cdp-9222-profile-lease |
| corpus/knowledge/fleet-skill-audit-round5.md:45 | screen third-lane-report, surface `-` | `both describe CDP-bridge flows (kagi L31–32/L71–72 vs` |

(Lines 150-152 are a run of consecutive lines naming the same citation; the three screen rows are one boundary, so 150 and 151 could alternatively be same-surface of the new surface if the screener prefers; the reason is stated in the ledger note, not counted twice.) The kake `SKILL.md:408` candidate in the same file is not a kotoba overlap and is out of scope here.

**Why 173 is the mapped line.** It names the surface ("tool names, descriptions and schemas as agent-facing text") and contains the word `tabi`, which the frozen counter requires for split-declared (`c1-adjacency-sweep-v2.mjs:277`, `/\btabi\b/i` on sibling_quote). One sibling pin may be cited once (`check-adjacency.mjs` duplicate_row), so 171/172/175 cannot also be map rows.

**Drafted map row** (9 TAB columns; the row must follow the new tabi line's actual line number at the evaluated revision, so `<N>` is a placeholder for L1)
- surface: `agent-facing-tool-text`
- sibling: `kotoba`
- sibling_ref: `kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:corpus/knowledge/sibling-overlap-census-round49.md:173`
- sibling_quote (14 words): `over tool names, descriptions and schemas as agent-facing text. It never reached tabi's scope`
- tabi_ref: `SKILL.md:<N>` (the new line)
- tabi_quote (13 words, contains the sibling token `kotoba`): `kotoba owns the craft of that text, so craft findings route to kotoba`
- disposition: `split-declared`
- ruling_ref: `-`
- ruling_quote: `tabi records a page's WebMCP tool names, descriptions and input schemas verbatim` (13 words; the counter and gate need a verbatim substring of the tabi file at tabi_ref, so it must sit on that same new line)

**Drafted tabi declaration line** (single physical line under `## Round 34 — sibling-overlap declarations (outside PROVINCE)` in tabi `SKILL.md`):

`- kotoba (agent-facing tool text): tabi records a page's WebMCP tool names, descriptions and input schemas verbatim, with how Chromium derives and enforces them, and grades no wording; kotoba owns the craft of that text, so craft findings route to kotoba. Authoring tools for a third-party site stays unclaimed (tabi refuses publishing); the draft split is in round-16 DraftAdjacency C-C (wave report, not a ruling).`

Keep it one line: both quotes must be substrings of one tabi line, and the line must be absent from baseline SKILL.md (it is: nothing in baseline SKILL.md names kotoba outside the roster at 1313/1450).

## Caveats
- The round-16 draft claimed "kotoba PROVINCE.md:13,20"; those lines no longer match. The sibling_ref must cite census-round49.md:173 (not PROVINCE).
- Kotoba's classification stays `none` until kotoba re-reads tabi. That is kotoba's lane; the integrator may mention the landing in the fleet handoff. Tabi may not edit kotoba's census.
- This seat ran no gate or counter on the draft row; the row text has not been run through `check-adjacency.mjs`. An unrun check has not passed. The candidate line texts were read via `git show 65a5c7a…:<path>`; the exact 173 quote was checked by reading, not by the gate.
- No fetches, installs, browser launches or scratch dirs were used.

## Commands
- `git -C kotoba-shokunin show 65a5c7a…:corpus/knowledge/sibling-overlap-census-round49.md | sed -n 150,185p` → exit 0
- `git -C kotoba-shokunin show 65a5c7a…:SKILL.md | grep -n …` → exit 0 (lines 68, 76)
- `git -C kotoba-shokunin branch --contains 65a5c7a…` → master
- `awk -F'\t' '$1 ~ /kotoba/' .ufo/waves/round-34/baseline/c1-candidates.tsv` → 13 kotoba-sourced candidate lines (14 rows incl. the kake line)
- greps over tabi `SKILL.md`, `PROVINCE.md`, `corpus/` and `corpus/adjacency*.tsv`, the round-16 files and the frozen counter → exit 0

## Deliverable
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/ScoutKotobaSplit.md` (this file)
