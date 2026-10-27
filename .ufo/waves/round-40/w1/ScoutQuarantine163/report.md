# ScoutQuarantine163 — quarantine hand-check, staged ID S163

Access date: 2026-10-27 (UTC 19:34). Scratch: /fast/scratch/hyaku/tabi-r40/ScoutQuarantine163/ (deleted before yield). No tool installs. No writes under shokuknow.

## Register row (absent-defect-register.md line 207, read-only)
`tabi | round4 | S163 | payload-absent | https://agent-browser.dev/webmcp | <anchor col> | <quote col> | "cited source, companion URLs and local artifacts were all checked; the quote is in none of them"`
- Register anchor column holds: `WebMCP 与 MCP 的区别`<br>`实时会话数据`<br>`(line 189); zh-CN locale`
- Register quote column holds: `A WebMCP tool exists only while the page is open and reaches the live tab's session data, coo` (truncated at 100 chars)
- **Row defect**: that anchor/quote text is the S164 row's text (Chrome zh-CN compare-mcp page; lanes/tabi/round4/SOURCES-PROPOSED.md line 60, SOURCES.append.md line 69), spliced into S163's columns by the register generator (the same string is in census-adjudication.json / quote-lint-full*.json attributed to S163's URL, `line` field showing the S164 row). It is not S163's staged anchor or quote.

## Staged S163 (lanes/tabi/round4/SOURCES-PROPOSED.md line 52, gate lines 54-57; merge/tabi/SOURCES.append.md line 68)
- URL https://agent-browser.dev/webmcp; class docs, tier B; anchor §"Tool announcements" (summary sentence) and the limits paragraph after it; accessed 2026-10-23.
- Gate quote 1: "Browser responses automatically announce WebMCP tools on first discovery and when the catalog changes."
- Gate quote 2: "Automatic summaries are limited to 16 tools and 4 KiB of JSON, with descriptions shortened to 160 bytes plus a truncation marker."
- Note: referenced corpus/knowledge/webmcp-tool-listing-paths-r14.md does not exist (proposed only); not evidence.

## Fetch
`curl -sS -L -A 'Mozilla/5.0' https://agent-browser.dev/webmcp` -> `200 267368 https://agent-browser.dev/webmcp`, HTTP/2, content-type text/html, Next.js on Vercel; page.html sha256 1afefe66582ed90cff5993c6b47c122b3fe3e85e965ea5722f94a98e92d0931d. Tag-stripped text 7261 chars. Source really opened.

## Findings in the opened page (H1 "WebMCP", intro/body prose)
- Staged quote 1: PRESENT verbatim: "Browser responses automatically announce WebMCP tools on first discovery and when the catalog changes." (followed by "Summaries contain only names, brief descriptions, origins, and frame IDs.")
- Staged quote 2: PRESENT verbatim: "Automatic summaries are limited to 16 tools and 4 KiB of JSON, with descriptions shortened to 160 bytes plus a truncation marker."
- Register's quote ("A WebMCP tool exists only while the page is open…"): ABSENT from this page, as are `cookie`, `session data`, `relay`, `ephemeral` (0 hits), and the zh-CN anchors. This is expected: it is S164's claim sentence (a Chinese Chrome page), not an S163 quote. https://agent-browser.dev/zh-CN/webmcp returns 404 (277 bytes), so no locale variant exists.
- Limitation on anchor: the literal heading "Tool announcements" does not occur anywhere in the fetched HTML (0 case-insensitive hits); the content sits in the page's body prose beneath H1 "WebMCP" (headings in HTML are only H1 plus site-nav H2s). The anchor label is thus a descriptive section name, not a heading; the passage is unambiguously locatable.
- Limitation: live page fetched 2026-10-27, staged access 2026-10-23; wording matched exactly so no drift observed. Fetched page is client-rendered Next.js HTML, text recovered by tag strip.

## Classification (this row only)
- Staged S163 quotes: **present** (both verbatim, ≤25-word excerpt: "Automatic summaries are limited to 16 tools and 4 KiB of JSON").
- Register `payload-absent` verdict: **false positive caused by a register column splice** (S164 anchor/quote attributed to S163's URL). Not a fabrication of S163.

VERDICT finding S163 present — staged quotes verbatim at https://agent-browser.dev/webmcp (200, 267368 bytes); register row 207 is a mis-spliced S164 anchor/quote, so its payload-absent label is a register defect, not an S163 fabrication
