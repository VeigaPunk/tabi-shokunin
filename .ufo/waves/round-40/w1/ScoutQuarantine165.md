# ScoutQuarantine165 — quarantine hand-check, staged ID S165

## Row (register line 209, /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md)
`| tabi | round4 | S165 | payload-absent | https://googlechromelabs.github.io/webmcp-tools/demos/explainer/ | `(the verification environment and the flag note) and the closing paragraph on two tools with the same description; §` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
- Anchor: the register row carries no separate anchor column; the quote itself ends in a dangling `§` (truncated/summary-style text).
- Class (register): payload-absent.

## Fetch
- Command: `curl -sSL -m 60 -D h.txt -o src.html -w '%{http_code} %{size_download} %{url_effective}\n' <URL>` in /fast/scratch/hyaku/tabi-r40/ScoutQuarantine165
- Output: `200 19717 https://googlechromelabs.github.io/webmcp-tools/demos/explainer/`; HTTP/2 200, content-type text/html, last-modified Tue, 20 Oct 2026 17:01:39 GMT, etag "6ad79e73-4d05". Access date 2026-10-27. 19717 bytes raw HTML; 5879 chars visible text after stripping script/style/tags. Only external reference is `app.js` (not fetched; page is static explainer markup).

## Search
- Full quote, case-sensitive and case-insensitive, on raw HTML and on tag-stripped/unescaped/whitespace-normalised text: not found.
- Fragments `verification environment`, `flag note`, `closing paragraph`, `two tools`, `same description`: 0 hits in raw HTML; also 0 hits for `verification`, `flag`, `same description`, `two tools` in visible text.
- Page content actually present (visible text opening): "WebMCP — Give agents tools, not DOM ... Agents use tools, not scraping ... ~40+ DOM nodes to parse → 3 tools, called directly ... Side by side ... Run agent: 'Book me Tuesday at 2pm'".

## Classification
**absent (payload-absent confirmed)** for this row: the actual source was successfully opened (HTTP 200, full body) and the quoted passage is not in it. Additionally, the staged "quote" is not source prose at all — it reads as a parenthetical editorial summary of a report ("the verification environment and the flag note ... the closing paragraph on two tools with the same description; §"), so this is a staged-quote defect (summary text staged as a quote), consistent with fabrication/mis-staging class. No quote located, so no <=25-word source quote to record.

## Limitations
- Only the cited URL was fetched (single point-in-time snapshot, 2026-10-27, page last-modified 2026-10-20; the staged round4 version may have differed). `app.js` and companion URLs not examined; JS-rendered text, if any, was not evaluated (the plain-text fragments are generic English, and static HTML shows none).
- Did not edit shokuknow or any lane corpus. Scratch removed before yield. No tools installed.

VERDICT finding S165: staged quote absent from successfully fetched source (HTTP 200, 19717 B); quote is editorial summary text, not source prose
