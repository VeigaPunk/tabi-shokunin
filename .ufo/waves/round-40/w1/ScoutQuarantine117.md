# ScoutQuarantine117 — quarantine hand-check, staged ID S117

Judged on: coverage. Milestone: quarantine. Leaf seat; no edits to shokuknow, no tool installs (RULES.md read; nothing installed; pacman not run).

## Row (read-only register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`, line 184, "## Rows" table)
`| tabi | round1 | S117 | payload-absent | https://webmachinelearning.github.io/webmcp/ | `User awareness` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
- Staged URL: https://webmachinelearning.github.io/webmcp/ ; quote: `User awareness` ; class: `payload-absent`. The register row carries no separate anchor column.
- Other "S117" strings in the same register are different rows and were not classified: kaidoku round1 S117 (line 316, never-checked table, unreachable doi.org URL) and an unrelated lane id space.
- Lane provenance (read-only): `/home/vgpnk/Projects/shokuknow/lanes/tabi/SOURCES-PROPOSED.md` L127-133 S117 row + `## Gate — S117`: gate quotes are "Draft Community Group Report , 20 October 2026" and "An annotations is a struct with the following items :" — neither is "User awareness". The string `User awareness` appears in the S118 row (L135, arXiv 2305.11506, §2.3 "User awareness") and KNOWLEDGE-PROPOSED.md L262. The census (`quote-lint-full-v5.json` findings[1562]) shows the ABSENT finding for tabi S117 with `line` = the S118 table row, i.e. the S118 section label was bound to S117's URL (binding "id").

## Fetch (scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine117/, deleted afterwards)
- Access date: 2026-10-27 (UTC). `curl -sSL https://webmachinelearning.github.io/webmcp/` → HTTP/2 200, content-type text/html, last-modified Tue, 27 Oct 2026 11:43:25 GMT, 536,093 bytes, sha256 `2d773eb9f0cd0579f1e7ef5b2ebd96c16d2d754baf38117c1051e4435a49a845`. Tag-stripped text 83,028 chars.
- Search of stripped text: `User awareness` (case-sensitive and case-insensitive) 0 hits; `awareness` 0 hits; `infobar` 0 hits.
- Live page header now reads "Draft Community Group Report , 27 October 2026" (the page was updated since the 20 Oct snapshot); the S117 gate's second quote is present verbatim: "An annotations is a struct with the following items :" (1 hit, §IDL).
- Archived lane snapshot (`lanes/tabi/.deepresearch/20261023_171636_webmcp-cdp-journey-sources/webmcp-cg-draft.txt`, 78,693 bytes): `awareness` 0 hits too (supporting only; not the primary source).

## Classification
**absent/fabrication-class for the staged quote on this URL**: the actual cited source was opened (HTTP 200, full document) and the exact quote `User awareness` is not in it. Nuance for the curator: this is a mis-binding, not an invented quote — the phrase is a real section title of the S118 source (arXiv 2305.11506), and S117's own gate quotes are real (one verbatim live, the header quote verified against the 20 Oct draft only per the lane's snapshot date; live page date moved to 27 Oct). Remedy is to drop/re-bind the row to S118, not to refuse S117. I did not open the arXiv paper (outside my assigned single source), so S118's presence of the phrase is taken from lane text only, unverified.

Limitations: single live fetch at one instant of a mutable draft; no anchor in register row; S118/arXiv not fetched.

VERDICT finding S117 tabi/round1 payload-absent confirmed absent on https://webmachinelearning.github.io/webmcp/ ("User awareness" 0 hits, HTTP 200, 536093 B, 2026-10-27); cause is quote mis-bound from S118, S117's own gate quote present
