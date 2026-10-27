# ScoutQuarantine109 — quarantine hand-check, staged ID S109 (tabi round1)

## Register row (read-only; absent-defect-register.md line 180)
`| tabi | round1 | S109 | payload-absent | https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md | `429 Too Many Requests`<br>`too many requests in a given amount of time` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
Note: S109 appears in the register for other lanes too (kumitate line 136, tameshi line 216); only the tabi row was assessed (this is the Tabi seat; line 180).
- URL: https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md
- Staged quotes: (1) `429 Too Many Requests`, (2) `too many requests in a given amount of time`. No anchor/section in the register row.

## Fetch
- Access date: 2026-10-27 (UTC); `curl -sSL` -> HTTP/2 200, text/plain, 44,412 bytes, sha256 15b55a29287f64b69e131c11dac404c2bf20cdcc90d265d7db37debc557a8491, etag cc0e8cbe...5b50, served from GitHub CDN (x-cache HIT).
- Content: auto-generated "Chrome DevTools MCP Tool Reference", 60 `###` tool sections (input automation, emulation, etc.).

## Search (case-insensitive) in the fetched bytes
`grep -n -i -E "429|too many|rate|requests in a given amount of time"` -> only matches: line 289 "cpuThrottlingRate", line 467 "generate"; no "429", no "too many", no "requests in a given amount of time". Additional grep for throttl|limit|retry|status found only CPU/network throttling params and extension "enabled status". No HTTP status or rate-limit content anywhere in the document.

## Classification
**absent / fabrication-class (payload-absent confirmed)** for both staged quotes against the cited source: the actual source was opened successfully in full and neither quote occurs. The quotes (HTTP 429 wording, cf. RFC 6585) do not belong to this tool-reference page; the row's citation is mismatched to its quote. No quote located, so none reproduced.

## Limitations
- Fetched the live `main` branch (not a commit pinned at original lane fetch time); content may have drifted since, though the page is an auto-generated tool reference with no rate-limit topic. Companion URLs and lane local artifacts were not re-checked (assignment: cited source only); the register states they were checked.
- Candidate classification applies only to this row; no repo/corpus edits, no tool installs (RULES.md read; none needed). Scratch deleted.

VERDICT finding S109 tabi round1: payload-absent confirmed — cited source opened (200, 44412 B), neither staged quote present
