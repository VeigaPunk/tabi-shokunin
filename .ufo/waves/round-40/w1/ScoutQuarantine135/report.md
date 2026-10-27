# ScoutQuarantine135 — quarantine hand-check, staged ID S135

## Register row (read-only source register, line 193)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
- lane `tabi`, round2, id S135, class `payload-absent`
- cited source: https://developer.chrome.google.cn/docs/ai/webmcp/best-practices?hl=zh-tw
- quote: `tools/list`
- Anchor: the register row carries no anchor/section field; none to confirm.

## Source fetch
- Access date 2026-10-27 (UTC). `curl -sSL` to the exact URL returned HTTP 2xx (HTTP/2 200, no redirect, final URL identical), 129,355 bytes, text/html, last-modified Mon 18 May 2026.
- Page title: "WebMCP 最佳做法 | AI in Chrome | Chrome for Developers" (zh-TW machine translation).
- Article headings (all of them): 制定工具策略; 使用明確的語言和語意程式碼; 盡量避免造成認知上的負擔; 優先考量可靠性; 評估測試和偵錯; 參與討論及分享意見.
- Extracted article text is 3,214 chars. The `tools/list` search over the whole raw HTML (HTML-unescaped, case-insensitive) gave 0 hits.
- Searches in the extracted article for `tools`, `list`, `listTools` and `tools / list` also gave 0 hits.
- Companion check: the same page with `?hl=en` (HTTP 200, 138,909 bytes) also has 0 hits for `tools/list`, case-insensitive.

## Classification
**absent / fabrication-class (payload-absent confirmed)**. The actual cited source was opened successfully and the exact quote `tools/list` is absent. No quote was located, so no source passage is recorded.

## Limitations
- Page content is a point-in-time fetch (2026-10-27); the page was last modified 2026-05-18, so it may differ from what the staging author saw earlier.
- Static HTML only; no JS-rendered content was evaluated. The page text is server-rendered and the article body was fully present, so JS-only additions are unlikely but not excluded.
- Only the cited URL and its `hl=en` variant were checked, as the assignment limits this to the cited source. The quote may exist on another WebMCP page (e.g. the spec), which does not affect this row's classification.
- No tools were installed.
- The scratch dir /fast/scratch/hyaku/tabi-r40/ScoutQuarantine135 is deleted below.

VERDICT finding S135 payload-absent confirmed: cited source fetched OK (HTTP 200, 129355 B), exact quote `tools/list` absent
