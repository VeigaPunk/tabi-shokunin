# QuarR4215 — quarantine re-adjudication S158, S163

Seat: QuarR4215. Access date: 2026-10-28 (UTC 15:37–15:39). Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4215/` deleted before yield. No tools installed. No pacman. No writes under shokuknow, no git/jj mutation.

Axes: (1) exact then whitespace-normalized match of the registered quote in the registered URL; (2) whether that quote belongs to a different registered source; (3) what today's bytes changed versus the round-40 fetch; (4) do not treat a classification fetch as the registered URL.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 206–207. Staged rows (read-only): `/home/vgpnk/Projects/shokuknow/lanes/tabi/round4/SOURCES-PROPOSED.md`.

## Commands

```
UA='tabi-r42-quarantine/QuarR4215 (read-only GET)'
curl -sSL -D "$S/S158.hdr" -o "$S/S158.body" -A "$UA" -L --max-redirs 5 -w '...' \
  'https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts'
curl -sSL -D "$S/S163.hdr" -o "$S/S163.body" -A "$UA" -L --max-redirs 5 -w '...' \
  'https://agent-browser.dev/webmcp'
```

Classification fetches (not substituted as the registered URLs), after both registered URLs returned 200 and the quotes were absent:

```
curl -sSL ... 'https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt'
curl -sSL ... 'https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn'
```

## S158 — misbound

Register line 206: lane `tabi`, round4, `payload-absent`, URL `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/src/tools/webmcp.ts`, quote `` `RateLimit-Policy Field` ``. No anchor column.

Observed: HTTP/2 200, 0 redirects, final URL = requested URL, `text/plain; charset=utf-8`, date Wed, 28 Oct 2026 15:37:36 GMT, 2451 bytes, sha256 `f06ffc3b4fafae2b59ac8700861b6f0cbbd301d012cd24999a37ceb731f8e066`, 79 lines. Exact and case-folded search: `RateLimit-Policy Field`, `RateLimit`, `rate`, `limit`, `policy`, `field` all absent. The file is `list_webmcp_tools` / `execute_webmcp_tool`. S158's own gate quotes are present: line 13 `` name: 'list_webmcp_tools', `` and line 67 `` const tools = request.page.getWebMcpTools(); ``.

The quote is S159's anchor. `census-adjudication.json` binds it with `"binding": "id"` and a `line` field that is the S159 row (IETF draft-09). That draft, fetched only to classify: HTTP 200, 0 redirects, 67876 bytes, sha256 `e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee`, date Wed, 28 Oct 2026 15:39:04 GMT. Quote verbatim at TOC line 89 and section heading line 306: `3.  RateLimit-Policy Field`. Next sentence: `The "RateLimit-Policy" response header field is a non-empty List[RFC8941] of Quota Policy Items (Section 3.1).` Staged gate recorded 67876 bytes and "line 301"; byte count matches, heading is at line 306 today.

Delta vs r40 (`absent`): cited-file sha256 is identical to r40's `f06ffc3b4fafae2b59ac8700861b6f0cbbd301d012cd24999a37ceb731f8e066`. webmcp.ts did not change. r40 did not open the draft. The label changes to misbound because the quote was confirmed in S159's source.

## S163 — misbound

Register line 207: lane `tabi`, round4, `payload-absent`, URL `https://agent-browser.dev/webmcp`. The quote cell contains a raw pipe, so the markdown row splits. Spans as registered: `` `WebMCP 与 MCP 的区别` ``, `` `实时会话数据` ``, `` `(line 189); zh-CN locale` ``, then `A WebMCP tool exists only while the page is open and reaches the live tab's session data, coo` (table truncation). Census third span, untruncated: `(line 189); zh-CN locale | A WebMCP tool exists only while the page is open and reaches the live tab's session data, cookies and DOM — so`. All three census records have `line` = the S164 row (`https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn`).

Observed: HTTP/2 200, 0 redirects, final URL = requested URL, `text/html; charset=utf-8`, date Wed, 28 Oct 2026 15:37:37 GMT, 267368 bytes, sha256 `1d3ab6eb53bc3df828f8c79904abc6356f7f203d45f1dceaa33d7b1f58340414`, `<html lang="en">`, title `WebMCP | agent-browser`, CJK count 0. Every registered span is absent exact and whitespace-normalized, including `session data`, `zh-CN`, and `Tool announcements`. No surrounding sentence.

S163's own gate quotes (SOURCES-PROPOSED.md lines 57–58) are present verbatim. Surrounding: "Pass --no-webmcp or set AGENT_BROWSER_NO_WEBMCP=1 to opt out. Browser responses automatically announce WebMCP tools on first discovery and when the catalog changes. Summaries contain only names, brief descriptions, origins, and frame IDs." And: "Administrative commands and explicit metadata requests do not append duplicate summaries. Automatic summaries are limited to 16 tools and 4 KiB of JSON, with descriptions shortened to 160 bytes plus a truncation marker."

S164's URL, fetched only to classify: HTTP 200, 0 redirects, 136343 bytes, sha256 `97562459ca529caf35eb620420335e6f398e6d521f10b08e7e082fc8eae8f51b`, date Wed, 28 Oct 2026 15:39:05 GMT, `lang="zh-CN-x-mtfrom-en"`. The exact registered headings are not in today's tag-stripped text. Nearby: nav `WebMCP 与 MCP` (staged "的区别" is gone); "重要的是，WebMCP 工具是临时性的。它们仅在您的页面打开时存在。" (staged gate was "它们仅在您的网页处于打开状态时存在"). `实时会话数据` as a phrase is absent; nearby is "工具在包含用户会话的页面中运行。"

Delta vs r40 (`present as staged`): r40 sha256 `1afefe66582ed90cff5993c6b47c122b3fe3e85e965ea5722f94a98e92d0931d`, also 267368 bytes. Size unchanged. Both gate sentences still present. Chinese register spans still absent. sha256 changed (HTML shell), quote presence did not flip. The label moves from "present" to misbound because this round scores the registered quote, which is S164's spilled anchor/claim, not because agent-browser lost S163's sentences.

## Limitations

- `main` on webmcp.ts is a moving ref; today's bytes match r40's hash, not a historical pin.
- S164's page is machine-translated (`zh-CN-x-mtfrom-en`); exact 2026-10-23 headings are gone even on the source the quotes belong to.
- Draft-09 line 301 in the staged anchor is line 306 in today's same-sized file. Quote text matched; line number did not.
- No install. Companion URLs listed only in the register note were not fetched except the two classification URLs named by the census `line` field.

Evidence: `.ufo/waves/round-42/w1/QuarR4215/evidence-S158.txt`, `.ufo/waves/round-42/w1/QuarR4215/evidence-S163.txt`.

VERDICT finding S158 misbound and S163 misbound — registered quotes are next-row spills (S159 draft heading; S164 zh-CN anchors), absent from the cited URLs; S158 bytes unchanged vs r40, S163 gate sentences still present
