# ScoutQuarantine147 — S147 quarantine hand-check (round 40 w1)

## Register row (read-only)
File: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md line 201 (data row; the only data row for S147 — line 318 is a non-data `kaidoku round5` gate-block note, ignored).
`| tabi | round3 | S147 | payload-absent | https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/ | `Error 1020: Access denied` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
- Staged URL: .../cloudflare-1xxx-errors/error-1015/ ; anchor: none staged; class: payload-absent; quote: `Error 1020: Access denied`.

## Fetch
- Access date: 2026-10-27 (UTC). Method: curl -L, Firefox UA, scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine147 (deleted on exit).
- Cited URL: HTTP 200, no redirect, 115841 bytes HTML. Also `.../error-1015/index.md` (the page's own "View as Markdown" link): HTTP 200, 3895 bytes.
- Page title "Error 1015 · Cloudflare Support docs"; sole body section `## Error 1015: You are being rate limited` (### Common cause, ### Resolution, a Note on "Unable to purge"). Body is about 1015 only.

## Search result
- `Access denied` (case-insensitive): 0 hits in HTML and in the markdown.
- `Error 1020: Access denied`: 0 hits in both.
- `1020`: HTML has exactly one hit, a sidebar nav link `<span>Error 1020</span>` -> href .../error-1020/ (navigation text, not the quoted passage). Markdown has 0 hits.
- Diagnostic (outside the strictly assigned URL; one extra GET): the sibling page .../error-1020/ (HTTP 200, 121181 bytes) contains `Error 1020: Access denied` (3 occurrences). So the quote is real but belongs to the error-1020 page; the S147 row cites the error-1015 URL (the S148 row cites error-1020). This indicates a wrong cited URL (mis-attributed source), not an invented quote text.

## Classification
**absent** for the cited source: the actual cited source was opened successfully (200, full body) and the exact quote is not in it. Nuance: the quote text exists on the neighbouring error-1020 page, so the defect is a source-URL mismatch to be corrected (cite error-1020) rather than a fabricated string.
No quote located in the cited source, so no <=25-word located quote; closest text there: heading "Error 1015: You are being rate limited".

## Limitations
- Static fetch only (no JS rendering); HTML and the site's own markdown rendering agreed. Page content as of 2026-10-27 (page "Last updated May 14, 2026"); the staging-time version may have differed, which I could not check.
- Did not read earlier seat summaries; no source repo / corpus edits; no tools installed (RULES.md read).

VERDICT finding S147 cited-URL(error-1015) opened OK, quote `Error 1020: Access denied` ABSENT there (only a sidebar link "Error 1020"); quote is present on sibling error-1020 page -> mis-cited source, not unreachable
