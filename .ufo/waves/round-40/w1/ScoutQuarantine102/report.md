# ScoutQuarantine102 — quarantine hand-check of staged ID S102

Milestone: quarantine · axis: coverage · access date: 2026-10-27 (UTC 19:33–19:34)

## Row identification
Register: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md (read-only).
`S102` appears in three places; the seat's quarantine set is the tabi lane (sibling seats S106/S109/S110 are the adjacent `tabi` round1 rows), so the staged row is register line 178:

`| tabi | round1 | S102 | payload-absent | https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md | `Last updated 2026-10-05 UTC` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

- Lane tabi, round1, class `payload-absent`, anchor = none given in register (cited URL only), quote = `Last updated 2026-10-05 UTC`.
- Not this row (noted for disambiguation, not evaluated): line 69 `game-dev-2d` round5 S102 (gdUnit4 tarball); line 271 `chousa` round3 S102 (gate block, never checked).

## Source fetch (scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine102, deleted on exit)
1. `curl -sS -L <URL>` (HTML) first attempt → HTTP 503, 1459 B (googlesource error page, not the source).
2. `curl -sS -L '<URL>?format=TEXT'` → HTTP 200, 18492 B base64; decoded `src.md` = 13868 B, sha256 07f83a2c0f5ab37155b70568a6ab30dad3b033d32aa91ce0d24cedc0f931df9d, 221 lines, begins `# Chrome DevTools Protocol contribution guidelines`.
3. Retry of the HTML URL (19:33:58Z) → HTTP 200, 25431 B, sha256 f4f00ae2b966a0fd1c2323e1bd5dcef43390f553b13cd543cbd4e0bc853151bc.

Both renderings of the exact cited URL were successfully opened.

## Search results
- Raw markdown (all 13 sections: Scope and contributions … Testing / Headless mode protocol tests): `grep -i 'last updated|updated|UTC|2026'` → no match; `Last updated` count 0.
- HTML with tags stripped and entities unescaped: `'Last updated 2026-10-05 UTC' in text` → False; `'Last updated'` → False; `'2026-10-05'` → False. The only `2026` in the HTML is a page-chrome `// Copyright (C) 2026 Google Inc.` script line (not a README passage).
- Located quote: none. Closest content: no date/"last updated" footer exists in the README source; the string pattern (`Last updated … UTC`) is characteristic of a developer.chrome.com docs footer, not a googlesource README.

## Classification
**absent / fabrication-class (payload-absent confirmed) for this row.** The actual source was opened (HTTP 200, markdown 13868 B and HTML 25431 B) and the exact quote `Last updated 2026-10-05 UTC` is absent. The row's quote should be corrected or the row refused.

## Limitations
- Only the cited URL (main branch at fetch time) was checked; the README at the revision originally ingested could differ, though a README git blob carries no rendered "last updated" footer. Companion URLs and lane local artifacts were not re-searched (assignment: cited source only).
- First HTML attempt 503'd transiently; resolved by the TEXT format and a retry.
- Register row has no explicit anchor field; none was checked.
- Tooling: no installs; RULES.md read (/home/vgpnk/.omp/agent/RULES.md); only curl/python3 used. No writes to shokuknow or lane corpus; no pacman.

Note: the dispatch trailer named both `.../w1/ScoutQuarantine102/report.md` and `.../w1/ScoutQuarantine102.md`; the folder path (`report.md`, per Goal scope) was written.

VERDICT finding S102 (tabi round1, Last updated 2026-10-05 UTC) payload-absent confirmed: source opened (HTTP 200), exact quote absent
