# ScoutQuarantine142 — Quarantine hand-check, staged ID S142

## Row disambiguation
Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` has THREE rows with id S142 (ids repeat across lanes):
- line 83: kake round1 (kimi.com)
- line 140: kumitate round4 (oh-my-pi client.ts)
- line 197: **tabi round3** — chosen (this is the tabi-shokunin wave; the staged slice S140,S142,S143,S144,S145 matches the consecutive tabi rows 196-200).

Row 197 (observed): `| tabi | round3 | S142 | payload-absent | https://www.rfc-editor.org/rfc/rfc9110.txt | which tool list do I see | ... |`
- URL: https://www.rfc-editor.org/rfc/rfc9110.txt
- Quote: `which tool list do I see`; class `payload-absent`; no anchor/section in register.
- census-adjudication.json (read-only) entry for tabi/round3/S142: verdict ABSENT, binding id, whose `line` field is the registry S143 row text (Puppeteer CDP WebMCP), not an RFC 9110 line — suggests the quote was mis-bound/mis-extracted [INFERENCE; not adopted as evidence].

## Fetch
- Access date: 2026-10-27T19:33:40Z
- Command: `curl -sS -L -o rfc9110.txt -w '%{http_code} %{size_download} %{url_effective}\n' https://www.rfc-editor.org/rfc/rfc9110.txt` (scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine142)
- Output: `200 502941 https://www.rfc-editor.org/rfc/rfc9110.txt`; sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a
- Completeness: header "Request for Comments: 9110" at top, Authors' Addresses line 378 (TOC) and Index at line 10217 → full document (8658 non-empty lines).

## Search
- `grep -n -i -E 'which tool|tool list|\btool\b'` → no matches for "which tool" / "tool list". Case-insensitive `tool` occurs only in unrelated words/contexts (lines 814 "command-line tools", 3412 "authoring tools", 8610 "monitoring tools").
- Whitespace-normalized (`tr -s ' \n' ' '`) search for `which tool` → no hits. "list do i" → no hits.
- The phrase (a UI/agent-style question about WebMCP tool lists) has no semantic counterpart in an HTTP semantics RFC.

## Classification
**absent/fabrication (for this cited URL)** — the exact cited source was successfully opened (HTTP 200, full 502,941 bytes) and the exact quote "which tool list do I see" is absent under case-insensitive and whitespace-normalized search. Cause is likely a quote mis-binding to the wrong URL rather than invented RFC text [INFERENCE]; classification only concerns the row as staged.

## Limitations
- Only exact/case-insensitive/whitespace-normalized folds tried, not the register's eleven folds; "tool" absent entirely so further folds are moot.
- Companion URLs and lane local artifacts not checked (out of scope); the quote could exist elsewhere in the lane.
- No source repo or corpus edits; no tool installs (RULES.md read; pacman not used). Scratch removed before yield.

VERDICT finding S142 (tabi round3) quote "which tool list do I see" ABSENT from fully fetched https://www.rfc-editor.org/rfc/rfc9110.txt (200, 502941 bytes); fabrication/mis-bound quote
