# ScoutQuarantine154 — quarantine hand-check, S154

## Row (source register, read-only)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 205:
`| tabi | round3 | S154 | payload-absent | https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn | `WebMCPNotSupportedError` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

- Staged ID: `.ufo/waves/round-40/assimilation/quarantine-slice` line 28 lists `S154 payload-absent` (tabi lane). The register also has a `kake` round2 S154 row (line 319, unreachable, chromeuxreport.googleapis.com). That row is a different lane and was not assessed. The tabi row is the staged one: its class matches `payload-absent`.
- Quote: `WebMCPNotSupportedError`. This is a single identifier, not prose. The register gives no anchor or locator.

## Fetch
- URL: https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn
- Access date: 2026-10-27 (UTC)
- `curl -sS -L`: HTTP 200, 180605 bytes, text/html, last-modified Fri 16 Oct 2026. Title: `命令式 API | AI in Chrome | Chrome for Developers`.
- About 35 KB of visible text after stripping script and style. It contains 27 `WebMCP` mentions and 8 `registerTool` occurrences in the raw HTML, so it is the real article body and not an error or consent shell.
- Raw HTML search: 0 hits for `WebMCPNotSupportedError`, 0 for `NotSupportedError`, 0 for `NotSupported`, 0 for `not supported`, 0 for `不受支持`. The plain `Error` search was case-insensitive: 0 hits in the HTML and 0 in the visible text.
- Companion check: the English URL without `?hl=zh-cn` returned HTTP 200, 189560 bytes, with 0 hits for `WebMCPNotSupportedError`.

## Classification
**absent / fabrication.** The actual cited source was opened successfully. The exact quote is absent from the zh-cn page and from the English variant. No near-variant error name appears on the page either.

Quote located: none.

## Limitations
- The check is a literal string search of the raw HTML and of text stripped of tags. The page is server-rendered with 8 `registerTool` occurrences, but I did not run a browser or hydrate any client-side content.
- The register's other companion URLs and local artifacts were not re-checked, because the assignment was to fetch only the cited source. The English variant fetch is an extra I added.
- No source-repo or corpus edits. Scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine154/` was deleted. No tools installed.

VERDICT finding S154 tabi payload-absent confirmed: cited source fetched (HTTP 200, 180605 bytes, 2026-10-27) and `WebMCPNotSupportedError` absent — fabrication class
