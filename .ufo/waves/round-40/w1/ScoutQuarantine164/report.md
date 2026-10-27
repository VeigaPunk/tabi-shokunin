# ScoutQuarantine164 — quarantine hand-check, staged ID S164 (tabi round4)

Access date: 2026-10-27. Read-only on /home/vgpnk/Projects/shokuknow; scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine164/ (deleted before yield). No install, no tool changes (RULES.md read; nothing installed).

## Row (register)
`absent-defect-register.md` line 208 (only data row with lane `tabi` / ID S164):
`tabi | round4 | S164 | payload-absent | https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn | "With the extension, you can:"`
(other "S164" hits in the register are kake/other-lane rows or free-text in a kake S206 quote: not this row.)

## Provenance of the flagged quote
`quote-lint-full-v5.json` findings[1631]: lane tabi, round4, id S164, verdict ABSENT, `binding: "id"`, quote "With the extension, you can:". Its `line` field is the staged **S165** table row (URL googlechromelabs.github.io/webmcp-tools/demos/explainer/, §"With the extension, you can:" bullets). In `lanes/tabi/round4/SOURCES-PROPOSED.md` the quote "With the extension, you can:" appears only in the S165 row. The S164 row (line 60) and its Gate block (lines 62-66) stage different quotes (zh-CN):
- (L189) 「重要的是，WebMCP 工具是临时性的。它们仅在您的网页处于打开状态时存在。」
- (L188) 「它会访问仅在实时浏览器标签页中提供的实时会话数据、Cookie 和 DOM 元素。」
Staged sections: §"WebMCP 与 MCP 的区别" (line 179), §"实时会话数据" (188), §"临时性" (189); accessed 2026-10-23 via curl + tag-strip.

## Source fetch
`curl -sL -A Mozilla/5.0 'https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn'` -> HTTP 200, 132,978 bytes, sha256 23ce41e0b141122ac8a0677bb13399675debb74f982054d877717215f4dbeed0; tag-stripped text 11,365 bytes / 285 non-empty lines (page title "何时使用 WebMCP 和 MCP"; full article body present through footer/licence, so the fetch is complete, not truncated).

## Findings (whitespace-insensitive substring match on stripped text)
| quote | present |
|---|---|
| "With the extension, you can:" (register's flagged quote) | **no** (also no "With the extension", no "you can"; page is zh-CN only) |
| 「重要的是，WebMCP 工具是临时性的。它们仅在您的网页处于打开状态时存在。」 (true S164 quote) | **yes** — section 控制界面访问权限, stripped line 205 |
| 「它会访问仅在实时浏览器标签页中提供的实时会话数据、Cookie 和 DOM 元素。」 (true S164 quote) | **yes** — same section, stripped line 204 |

Exact located passage (<=25 words): 「重要的是，WebMCP 工具是临时性的。它们仅在您的网页处于打开状态时存在。」

## Classification
**Register row S164 = misbound candidate, not a fabrication.** The flagged quote is absent from the cited page, but it is S165's quote, attached to S164 by the checker's id-binding. The S164 row's own staged quotes are **present** verbatim in the actual source. Class for the row as registered: `present` for the true S164 payload; `payload-absent` for the listed quote is a checker mis-attribution (do not refuse S164 as fabricated; S165 is outside this seat and was not fetched).

## Limitations
- Staged section labels do not match page headings: "WebMCP 与 MCP 的区别", and "实时会话数据"/"临时性" as headings, do not exist as headings (the two quotes sit in prose under 控制界面访问权限; "区别" occurs only in prose lines 183/203). Staged line numbers 179/188/189 differ from my strip (204/205) — different tag-stripping, not a content difference. Anchor labels are therefore weak, quote content fine.
- Tag-stripped plain HTML, no JS rendering; no browser. Did not verify S165's source or quote.

VERDICT finding S164: register row is a misbound S165 quote ("With the extension, you can:" absent from cited page); true S164 quotes present in fetched source (200, 132978 bytes); not a fabrication; section anchor labels stale
