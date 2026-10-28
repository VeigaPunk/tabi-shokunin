# QuarR4203 — re-adjudication of tabi S111 and S114

Seat report and evidence: `.ufo/waves/round-42/w1/QuarR4203/report.md`, `evidence-S111.txt`, `evidence-S114.txt`.

Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 182–183, lane `tabi`, round1, class `payload-absent`. No anchor column.

## S111

Registered URL `https://developer.chrome.com/docs/ai/webmcp/secure-tools`. curl 8.23.0 -sSL on 2026-10-28: HTTP 200, 0 redirects, final URL unchanged, 140264 bytes, `text/html; charset=utf-8`, `last-modified: Tue, 01 Sep 2026 07:00:00 GMT`, sha256 `88b660bcf123a7f5f76883043a6e29d88fa68073e99e0e1041093de103818181` (request-variant; second GET `60c30a3c9550fce92049dba4bdf0d9f463bfca236bc2dc31174fab89b4d5f633`, identical through byte 133000).

Staged `Add hints to your tools`: absent. Nearest sentence: "There are a few hints you should add when building your tools:" under "Use annotation hints".

Staged `默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。`: absent on the English body. English sentence in that section: "By default, other websites or cross-origin iframes can't observe or interact with your tools." Exact on the page's hreflang zh-Hans alternate `?hl=zh-cn` (HTTP 200, 131145 bytes, sha256 `e4037aac36f2476f98087133c5d123e56dda46f81fbc4f2e93ca7198e2c6e497`, also request-variant). Surrounding: "WebMCP document.modelContext.registerTool API 仅向智能体公开工具的功能。默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。"

verdict: partial. Unchanged vs r40. r40 said the English page lacked the cross-origin sentence; it is in today's stable prefix. Last-Modified 2026-09-01 predates r40, so this is not shown as a post-r40 edit. [INFERENCE] r40 truncated the paragraph. The Chinese quote is still only on `?hl=zh-cn`.

## S114

Registered URL `https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf`. curl -sSL: HTTP 200, 0 redirects, final URL unchanged, 787690 bytes, `application/pdf`, `Last-Modified: Fri, 05 Dec 2025 12:30:30 GMT`, ETag `"c04ea-645339c75c93a"`, sha256 `9c2bdd5f015355478a637c0d6155f49ff8a49d96842ed03abcdea55877e67b55`. PDF 1.7, 8 pages. pdftotext 26.08.0.

Staged quote is not exact and not whitespace-normalized-equal. Abstract: "achieves better web element identification accuracy compared to naive set-of mark prompting technique." Word boxes y=397.38 put a 3.61pt word space between `set-of` and `mark` (previous gap 3.73pt). Surrounding sentence: "Our evaluation demonstrates that our tool enables higher abstraction and reuse in test generation, and achieves better web element identification accuracy compared to naive set-of mark prompting technique." No `set-of-marks` anywhere; later tokens are `set-of-mark` and `Set-of-Mark`.

verdict: partial. Unchanged vs r40. Same length and Last-Modified. Glyph gap is new evidence that the space is not a pdftotext hyphen drop.

No tools installed. Scratch deleted. No writes under shokuknow or the production tree.

VERDICT finding S111 partial (quote 2 verbatim only on ?hl=zh-cn; quote 1 absent) and S114 partial (abstract "set-of mark" not "set-of-marks"); class unchanged vs r40
