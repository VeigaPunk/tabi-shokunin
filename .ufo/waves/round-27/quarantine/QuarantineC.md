# QuarantineC — round-27 §10 Wave-4 quarantine-first residual (rows S143–S163)

- Seat: `TabiR27.QuarantineC` · Date of audit: 2026-10-25 · Lane root: `.` (= `/home/vgpnk/Projects/shokunin/tabi-shokunin`)
- Register audited (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`, sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, 83,621 B; rows at register lines 198–207 (tabi lane, round3/round4). Slice: `.ufo/waves/round-27/assimilation/quarantine-slice` (38 data rows; my assignment = S143, S144, S145, S147, S148, S149, S153, S154, S158, S163).
- Method: for each row exactly one documented public GET to the row's **cited URL only** (no companion URLs), 2026-10-25T18:38:13Z, single curl batch, UA `tabi-r27-quarantine-audit/1.0 (lane tabi-shokunin, seat QuarantineC, quote-verification GET)`, `-L --max-redirs 5`; every response was HTTP/2 200 and the effective URL equaled the requested URL (no rerouting). Bodies/headers kept as throwaway fixtures under `.ufo/waves/round-27/scratch/QuarantineC/` (`S<id>.body`, `S<id>.hdr`). Exact recorded quotes were searched as fixed strings in the fetched bytes; misses were re-checked case-insensitively, substring-folded, URL-encoded (CJK), and CJK-byte-censused as noted. Round-22 verdict files and register summary/totals were **not consulted**; every verdict below rests only on these fetches.
- No tools installed or updated (none needed); no pacman use; no writes to shokuknow; no git/jj writes; no builds/linters.

## Verdict summary

| id | cited source (host+tail) | GET | bytes | sha256 (16) | verdict |
|---|---|---|---|---|---|
| S143 | raw.githubusercontent.com …/cdp/WebMCP.ts | 200 | 10,681 | `ee7b6fd89e008075` | **absent/refuse** |
| S144 | raw.githubusercontent.com …/api/Page.ts | 200 | 111,019 | `b446b70c6543026e` | **absent/refuse** |
| S145 | www.ietf.org …/draft-ietf-httpbis-rfc6265bis-13.txt | 200 | 146,976 | `062239316659673b` | **absent/refuse** |
| S147 | developers.cloudflare.com …/error-1015/ | 200 | 115,841 | `3e0f03347a5eda45` | **absent/refuse** |
| S148 | developers.cloudflare.com …/error-1020/ | 200 | 121,181 | `96096138e251cca2` | **absent/refuse** |
| S149 | en.wikipedia.org/robots.txt | 200 | 28,275 | `48b98d80c8444d37` | **absent/refuse** |
| S153 | raw.githubusercontent.com …/agentic-javascript-tools/guide.md | 200 | 22,859 | `7a62b973f06d1dba` | **absent/refuse** |
| S154 | developer.chrome.com …/imperative-api?hl=zh-cn | 200 | 180,609 | `11e48f747f113b41` | **absent/refuse** |
| S158 | raw.githubusercontent.com …/tools/webmcp.ts | 200 | 2,451 | `f06ffc3b4fafae2b5` | **absent/refuse** |
| S163 | agent-browser.dev/webmcp | 200 | 267,368 | `eac3585ae13caf40` | **absent/refuse** |

10 fetched / 10 clean 200s / **0 present/admit / 10 absent/refuse / 0 unreachable/unverifiable.**

## Per-row findings

Full sha256s: S143 `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5` · S144 `b446b70c6543026e66bc6da7c1abdefbd1c6a0b12bceb8b44d2e479ece9863bf` · S145 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf` · S147 `3e0f03347a5eda459ee6e461bdd26b90d8a62cad5587418a6b779fa30f0ecd60` · S148 `96096138e251cca2cf9fa6656d6ddc19c4c47f87964bd916de0cfa6eb6c06634` · S149 `48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f` · S153 `7a62b973f06d1dbae03051afc6279717232e38e7342b9e249e51ef2a70cb507f` · S154 `11e48f747f113b41c4faa587b5dcd8c5ee38ee14623a84bec5e5ea3e5be2e7c2` · S158 `f06ffc3b4fafae2b59ac8700861b6f0cbbd301d012cd24999a37ceb731f8e066` · S163 `eac3585ae13caf40b6c4cf8115e7863a3dd3a3ebe472fd5a8008d4e6619b3214`.

- **S143** — cited `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts` (200, text/plain). Quote: ``Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled``; locator: none recorded. Exact string 0 hits; folds `Requires Chrome 151+`, `151`, `Chrome`, `enable-features` all 0 — the file (a `WebMCPTool` TS class) never names Chrome, a version, or the flag. **absent/refuse** — no substring of the quote exists in these bytes; nothing to correct onto.
- **S144** — cited `…/puppeteer-core/src/api/Page.ts` (200, text/plain). Quotes: `Defense in depth`; `is not the extent of a site's defense against CSRF`; locator: none. Exact 0/0; case-fold `defense in depth` 0; `defense against CSRF` 0; bare `CSRF` 0 in 111,019 B. **absent/refuse** — Page.ts carries no CSRF text at all.
- **S145** — cited `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` (200, text/plain). Quotes: `Common CSRF weaknesses and protection mechanisms`; `Limitations of SameSite`; locator: none. Exact 0/0; folds `Limitations of` 0, `weakness` 0, `common csrf` 0. Topic present but headings absent: `CSRF` ×12, `SameSite` ×52; the only appendix is "Appendix A. Changes" (line 3265). **absent/refuse**.
- **S147** — cited `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/` (200, text/html). Quote: `Error 1020: Access denied`; locator: none. Exact 0. Sole `Error 1020` occurrence is a sidebar nav link (`<span class="break-words">Error 1020</span>` → error-1020 page), not the quoted string. Page identity confirmed: `<title>Error 1015 · Cloudflare Support docs</title>`; body text is rate-limiting guidance ("The website owner has configured rate limiting rules…"). **absent/refuse** — the quote is the *sibling* page's heading: `Error 1020: Access denied` appears verbatim 3× on `…/error-1020/` (S148's cited URL, verified in that fetch). Quote-cell drift, not a hit.
- **S148** — cited `…/error-1020/` (200, text/html). Quotes: `Crawl-delay`; `Sitemap`; locator: none. Exact 0/0; case-folds: `crawl` ×1 = sidebar link "Troubleshoot crawl errors"; `sitemap` ×1 = `<link rel="sitemap" href="/sitemap-index.xml">` in `<head>`. Neither recorded quote occurs as text. Page identity: `<title>Error 1020 · Cloudflare Support docs</title>` (its `Error 1020: Access denied` headings are not this row's quotes). **absent/refuse**.
- **S149** — cited `https://en.wikipedia.org/robots.txt` (200, text/plain). Quotes: `The daemon`; `/status JSON fields`; locator: none. Exact 0/0; folds: `daemon` (case-insensitive) 0, `status` 0. Payload is the Wikimedia spider-block list ("# robots.txt for http://www.wikipedia.org/ and friends", MJ12bot Disallow block…). **absent/refuse** — neither string exists in these bytes.
- **S153** — cited `https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md` (200, text/plain). Quotes: `使用 document.modelContext.getTools() 检索可用工具`; `从 Chrome 153 开始`; locator: none. Exact 0/0; the guide contains **zero CJK bytes** (English source). Near-equivalents located: line 285 "In-page agents call `document.modelContext.getTools()` to retrieve an array of `RegisteredTool` objects…", lines 291/295 code uses; version notes are "Since Chrome 154" (line 229), "Since Chrome 155" (lines 287, 313), "Since Chrome 156" (line 259) — **"Chrome 153" occurs 0 times**, so even the translated claim's version is not in the source. **absent/refuse**.
- **S154** — cited `https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn` (200, text/html; charset=utf-8). Quote: `WebMCPNotSupportedError`; locator: none. Exact 0; folds `notsupportederror` (case-insensitive) 0; substring `NotSupported` 0. Page is genuinely zh-CN (machine-translated, `lang="zh-CN-x-mtfrom-en"`, 388 lines with CJK; `WebMCP` ×28) — the identifier would not be translated, and it is simply absent. **absent/refuse**.
- **S158** — cited `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts` (200, text/plain). Quote: `RateLimit-Policy Field`; locator: none. Exact 0; case-fold `RateLimit` 0. Whole 79-line file read: it defines `list_webmcp_tools` / `execute_webmcp_tool` page tools — no rate-limit content anywhere. **absent/refuse**.
- **S163** — cited `https://agent-browser.dev/webmcp` (200, text/html). Quotes: `WebMCP 与 MCP 的区别`; `实时会话数据`; locator: `(line 189); zh-CN locale`. Exact 0/0; CJK bytes 0; URL-encoded `实时` (`%E5%AE%9E%E6%97%B6`) 0; `zh-cn` 0; `<html lang="en">`; payload has 39 physical lines, so "line 189" does not exist in the fetched bytes; fold `session data` 0. Page identity: `<title>WebMCP | agent-browser</title>`. **absent/refuse** — the recorded zh-CN locale contradicts the payload itself (English page, no CJK), and the locator points outside the fetched artifact.

## Observed pattern (informational, not a verdict)

S147's quote is verbatim-present on S148's cited page; S148's and S149's quotes are robots-flavored strings (`Crawl-delay`, `Sitemap`, `The daemon`, `/status JSON fields`) absent from all three pages fetched. This is consistent with quote-cells drifted across sibling rows in the register — per the register's own reader guidance the quotes would need correcting onto their true sources, which were not fetched (assignment limits GETs to each row's cited URL).

## Residual risk / verification gaps

- Live pages: verdicts bind to the bytes served 2026-10-25T18:38:13Z (sha256s above); developer.chrome.com (mtfrom) and agent-browser.dev pages change without notice.
- Cloudflare pages ship `text/markdown` alternates (`index.md`); judged on the served HTML payload only — no second GET per assignment.
- Multi-part register quotes (`<br>`-joined) were searched part-by-part; a part with markup interleaved mid-string in the HTML would evade fixed-string search — none of the misses had case/entity/CJK folds hits, so no such hit was masked.
- S163's `(line 189)` locator's underlying artifact is not named by the register row; unverifiable from cited URL alone.
- Verdicts are recommendations to the round owner; no register/slice file was modified, no adoption performed.
