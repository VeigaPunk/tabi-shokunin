# ScoutQuarantine130 — quarantine hand-check S130

## Register row (read-only, confirmed)
Source register: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md line 189:
`tabi | round2 | S130 | payload-absent | https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/f08dbe152502d66e75fa07fb2588dc0feb42bc20/tests/tools/webmcp.test.ts | "Chrome 149 では、WebMCP オリジン トライアルに登録できます"`
Staged class: payload-absent. Anchor/section: none beyond the quote.

## Source access
- URL: same as staged (pinned commit f08dbe15…), fetched with curl -L, access date 2026-10-27 (UTC).
- Status: HTTP/2 200; 6541 bytes; 192 lines; sha256 2ba8a64378597db7d65b13f2cf63fe692270cd8394852237d08174dc627bd29b.
- Content: Apache-2.0 TypeScript node:test file `webmcp` (imports sinon, McpPage, pages.js, webmcp.js; tests list_webmcp_tools / executeWebMcpTool).

## Quote search (actual source opened)
- grep -i for `Chrome 149|オリジン|origin.?trial|149|トライアル` → no matches.
- Non-ASCII line count, `Chrome 149` count: see output below ("Observed counts").
- The staged quote is Japanese Chrome-blog prose (origin-trial registration); the cited file is a TypeScript unit test containing no such prose. The quote is absent.

## Classification
**absent / fabrication-of-citation (payload-absent confirmed)**: source successfully opened (200, full body), exact quote absent. The quote text likely belongs to a developer.chrome.com WebMCP origin-trial page, not this URL (inference; not fetched — out of assignment scope, only cited source fetched).

## Limitations
Only the single cited URL checked; companion URLs/local artifacts from the register not re-checked. No source repo edits; no tools installed.

## Observed counts
non-ASCII lines / 'trial' lines / webmcp lines / 'Chrome 149' count (grep outputs in order above): 0 / 0 / 35 / 0

VERDICT ok S130 absent: cited source opened (HTTP 200, 6541 bytes), exact quote not present; payload-absent confirmed
