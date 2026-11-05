# R66Connector report — C1 sibling-overlap scan (round 66, w1)

Full findings: `.ufo/waves/round-66/w1/R66Connector.md` (same content, milestone-named path). Summary:

- **Moved lanes: 16 of 20** (exit 0): chousa, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, mado, mori, revenger, souji, tameshi, tsukuroi. Unmoved: audio, game-dev-2d, game-dev-3d, lore.
- **BG new/changed lines: 0 new, 0 removed, 1 changed** — kake-shokunin SKILL.md:1358 (BG word `crawl`; r62 1937 chars vs live 2254, first diff char 547: staged-file name → `[r93-absence 2026-11-04]` wording). In r62 ledger: yes, delta row 141, disposition `no-tabi-ground`, quote stale = the meter's `delta-quote-not-whole-line`. Overlaps tabi ground: no.
- **tabi-ground overlaps claimed by moved lanes: none.** kumitate SCORECARD.md:1898 (`internals route to **tabi**…`) is a routing declaration naming tabi as owner; moved 1723→1885→1898 (map and audit-note pointers both stale, = meter `audit-note-moved-line`). kake PROVINCE.md:697-698/:710 new cache-key rounds explicitly route browser behaviour away ("remain outside this capability", "stay frontier"). kaidoku +126 lines: UPX/SquashFS RE ground, 0 BG words.
- Screened-set deltas reproduce the frozen meter's findings exactly: 21 head / 9 sha / 8 lines / 1 delta-quote / 1 audit-note; bgHits equal everywhere; predicate false, findingCount 40 (`v22-live-r66.json`).
- Methods: awk snapshot compare; `git -C <lane> diff --stat/-U0/show` (read-only, all rc 0, failures=0) over the 21-file screened set of the 16 moved lanes; BG_WORDS copied by grep from meter :34; counting per meter :204 (kagi PROVINCE.md has no trailing newline; 110 lines = ledger). Two independent scan methods agree.
- Not run: the frozen meter itself (L1-owned); cross-checked against its published output instead.
- Writes: only `.ufo/waves/round-66/w1/R66Connector.md`, this file, and scratch `/fast/scratch/hyaku/tabi-r66/R66Connector` (deleted before yield). No tools installed. No git/jj mutations anywhere; no subagents (leaf seat).
