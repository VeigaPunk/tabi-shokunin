# R57QuarC — scoped findings (w1, quarantine hand-check part C)

**Seat:** `R57QuarC` · **Round/wave:** 57 / w1 · **Base:** `ef43ececde883cc0368c6c7cfbabe30ef937b717`
**Contract:** `w1-spec.json` item `R57QuarA` (guards, folds f0–f6, verdict vocabulary, JSON shape), applied unchanged.
**Rows:** slice lines 21–30 — `S143 S144 S145 S147 S148 S149 S153 S154 S158 S163`.
**Duty:** quarantine-first hand-check. **ADOPT NOTHING.** No register/staging file touched; no campaign tool run.

## Result

| id | verdict | frags in cited source | carrier (fold, line/byte) | reason |
|---|---|---|---|---|
| S143 | `mispaired` | 0/1 | S144 `Page.ts` f0 L1085 B26682 | Chrome-151 sentence is Page.ts’s `webmcp` accessor comment; cited `WebMCP.ts` is the CDP wrapper |
| S144 | `mispaired` | 0/2 | S145 draft-13 f0 L2813 B113630; f2 L2817 B113840 | both spans are §8.8.1 “Defense in depth” material |
| S145 | `mispaired` | 0/2 | S146 OWASP sheet f0 L1610 B30310 (+1 paraphrase) | `Limitations of SameSite` real; `Common CSRF weaknesses and protection mechanisms` byte-exact nowhere |
| S147 | `mispaired` | 0/1 | S148 error-1020 page f0 L192 B73088 | cited 1015 page has no “Error 1020” string |
| S148 | `mispaired` | 1 incidental/2 | S149 robots.txt f0 L130 B2662; f0 L424 B15118 | both anchors are robots.txt; cited page’s `Sitemap` is a `<link rel="sitemap">` head element |
| S149 | `mispaired` | 0/2 | S150 own-work `operations.md` f0 L5 B183; f0 L28 B2114 | daemon headings are the lane’s own reference |
| S153 | `mispaired` | 0/2 | S154 zh-CN imperative-api f0 L3986 B134829; f4 L4015 B144085 | Chinese spans belong to the zh-CN API page; register S153 ≠ lane registry S153 |
| S154 | `mispaired` | 0/1 | S156 Zap Studio errors f0 L1 B6320 | library error name; S155 mcp-b page carries nothing |
| S158 | `mispaired` | 0/1 | S159 ratelimit-headers-09 f0 L88 B3426 | cited `webmcp.ts` (2 451 B) has no rate-limit vocabulary |
| S163 | `mispaired` | 0/3 | S164 anchor cell; capture f0 L188 B6805 | cell reproduces S164’s anchor names + locator tail; live page drifted |

Counts: `mispaired` 10 · `absent-confirmed` 0 · `quote-located` 0 · `partial-located` 0 · `unreachable` 0 · `extraction-unavailable` 0.
All 19 fetched documents: HTTP 200, non-empty, no guard refusal. Register class confirmed at each cited URL; **no row is a fabrication**.

## Structural finding (the actionable part)

The register’s **quote column is offset one row**: it carries the quoted span (anchor quote or `teaches` quote) of the *following* staged row while the cited URL stays the row’s own. 9/10 rows match the next staged row; S154 matches S156 because the intervening S155 anchor contains **no quoted span** (S156’s does). The staging knowledge under `merge/tabi/knowledge/` already attributes each span to the correct row — the defect is in the register’s pairing, not the quotes.

Two anchor-level defects remain: `S145#1` is a paraphrase (the OWASP sheet has no such heading), and `S163` carries a locator clause (`(line 189); zh-CN locale`, unclosed backtick) plus a paraphrased heading; its `实时会话数据` span was real in the 2026-10-23 capture but the live page has reworded it (page drift).

## Required knowledge answer

Yes — all 17 fragments are byte-exact under `shokuknow/merge/tabi/knowledge/`, across 11 files (`csrf-defense-boundary.md`, `webmcp-tool-listing-paths-r13.md`, `webmcp-hint-is-not-enforcement-r13.md`, `webmcp-tool-approval-hints-r14.md`, `host-rate-limit-signal-classes-r13.md`, `host-rate-limit-measured-posture-r17.md`, `host-rate-limit-signal-classes-r14.md`, `webbridge-daemon-handshake-amendment-r13.md`, `…-r14.md`, `journey-driver-preconditions-r18.md`, `journey-driver-attachability-r19.md`). Presence in knowledge is pipeline provenance, not independent source verification.

## Evidence

Receipts: `.ufo/waves/round-57/quarantine/R57QuarC/` — `S<id>.json` ×10 (fetch metadata, per-fragment `f0_n…f6_n`, runnable commands, carrier line/byte/context, knowledge hits), `summary.json`, `R57QuC-summary.md`, `ladder.json` (17×19×7), `provenance.json`, `provenance-knowledge.json`, `staged-pairing.json`, `fetched-all.json`, logs, tools.
Full report: `.ufo/waves/round-57/quarantine/R57QuC.md`.

## Risks / blockers

* **No blockers.** No cross-seat contract delta; nothing installed (curl 8.23.0 / python 3.14.8 already present); pacman untouched.
* Live-page drift is real (`imperative-api` 180 655→180 659 B between fetches; `compare-mcp` reworded since capture). Any adoption must re-fetch; a re-fetch byte mismatch is drift, not a verdict change.
* Raw bodies (~4 MB) not committed; sha256 + fetch command per receipt reproduce them.
* Scratch `/fast/scratch/hyaku/tabi-r57/R57QuarC/` removed after receipts were copied out.
