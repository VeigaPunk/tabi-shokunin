# QuarR4214 — quarantine re-adjudication S153, S154

Axes checked, in parallel: cited URL opens; exact then whitespace-normalized match; tag-stripped match only as a recorded fold; whether the quote belongs to a different registered source; delta versus the round-40 disposition. No tool was installed. `~/.omp/agent/RULES.md` was read; pacman was not used. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4214/` was removed before this report. No writes under shokuknow, no git or jj mutation.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 204–205. Both rows are lane `tabi`, round3, class `payload-absent`. The kake round2 S154 row (line 319) is a different lane and was not assessed.

## S153

Registered row: cited source `https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md`. Quotes exactly as registered: `使用 document.modelContext.getTools() 检索可用工具` and `从 Chrome 153 开始`.

Command (2026-10-28, UA `tabi-r42-QuarR4214/1.0 (quote-verification GET)`):

```
curl -sSL -D s153.hdr -o s153.body -A "$ua" --max-redirs 5 -w 'final_url=%{url_effective} http_code=%{http_code} size=%{size_download} redirects=%{num_redirects} type=%{content_type}\n' \
  'https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md'
sha256sum s153.body
```

Observed: `final_url` equal to the registered URL, `http_code=200`, `size_download=22859`, `num_redirects=0`, `content_type=text/plain; charset=utf-8`. `sha256 7a62b973f06d1dbae03051afc6279717232e38e7342b9e249e51ef2a70cb507f`. Response `Date: Wed, 28 Oct 2026 15:37:08 GMT`.

Search of those bytes: both quotes miss exact, whitespace-normalized, and tag-stripped. CJK character count is 0. Version strings present are `Chrome 154`, `Chrome 155`, `Chrome 156` only. Nearest English sentence, not the quote: "In-page agents call `document.modelContext.getTools()` to retrieve an array of `RegisteredTool` objects from the current document and any accessible frames in the document tree."

The same strings are on the next registered source. Today's S154 fetch (below) has `从 Chrome 153 开始` as a raw substring, surrounding sentence "从 Chrome 153 开始，您可以取消注册工具，而无需取消和中断正在进行的执行。这样可以防止在组件框架中管理工具生命周期时出现意外副作用。" The getTools sentence is not contiguous in the raw HTML because `<code dir="ltr" translate="no">` wraps the identifier; after tag-strip it is the prefix of "使用 document.modelContext.getTools() 检索可用工具。此异步方法会返回调用文档有权访问的工具列表，按字母顺序排序。" Those are Gate — S154's own quotes in `lanes/tabi/round3/SOURCES-PROPOSED.md` (the gate says they were taken by curl plus tag-strip). `census-adjudication.json` binds both S153 ABSENT records to a line that starts `| S154 |`. S153's own English gate quotes (out-of-band discovery, `fromOrigins`, `consequentialHint`) are in today's guide.

Verdict: **misbound**.

Delta versus round-40 `absent`: the cited guide did not change. This sha256 is the digest round-27 recorded for the same URL on 2026-10-25. The Chinese sentences were not added to the guide. The verdict changes because both strings are present on today's S154 page, a different registered source.

## S154

Registered row: cited source `https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn`. Quote exactly as registered: `WebMCPNotSupportedError`.

Same curl form as S153, against that URL. Observed: `final_url` equal to the registered URL, `http_code=200`, `size_download=180609`, `num_redirects=0`, `content_type=text/html; charset=utf-8`, `last-modified: Fri, 16 Oct 2026 07:00:00 GMT`, `Date: Wed, 28 Oct 2026 15:37:09 GMT`. `sha256 08589ac1a9285803d36e57fcbfabde8315150051e967e92ec173c6c1951fe36e`.

Search of those bytes: `WebMCPNotSupportedError` misses exact, whitespace-normalized, and tag-stripped. Substring counts: `NotSupported` 0, `Error` 0. CJK count 3073, so the body is the zh-CN article. The page does contain S154's own Chinese gate sentences (quoted under S153 above).

Classification fetch of the other registered source, not a substitute URL. Command:

```
curl -sSL -D s156.hdr -o s156.body -A "$ua" --max-redirs 5 -w 'final_url=%{url_effective} http_code=%{http_code} size=%{size_download} redirects=%{num_redirects}\n' \
  'https://www.zapstudio.dev/webmcp/errors'
```

Observed: `final_url=https://www.zapstudio.dev/docs/webmcp/errors`, `http_code=200`, `size_download=98299`, `num_redirects=1`. Header chain: `HTTP/2 301` `location: /docs/webmcp/errors`, then `HTTP/2 200` `content-type: text/html`, `Date: Wed, 28 Oct 2026 15:38:24 GMT`. `sha256 d6fbbfda79e91ee989eab12928920971b258fdd159bd9e39a05f583f7b695d1b`. Exact raw hits of `WebMCPNotSupportedError`: 11. Surrounding sentence: "registerTool rejects with WebMCPNotSupportedError when called in a browser without WebMCP support:" That is Gate — S156. `census-adjudication.json` binds the S154 ABSENT record to a line that starts `| S156 | Errors — Zap Studio WebMCP`.

Verdict: **misbound**.

Delta versus round-40 `absent` (ScoutQuarantine154, 2026-10-27, cited page 180605 bytes, zero hits, companions not re-checked): the cited page still does not contain the identifier (`Error` count still 0). Size today is 180609 versus that seat's 180605; `Last-Modified` is still Fri, 16 Oct 2026. The r40 body was not retained, so the 4-byte gap was not diffed; it is not the identifier appearing. The verdict changes because today's S156 fetch contains the quote verbatim.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4214/evidence-S153.txt`
- `.ufo/waves/round-42/w1/QuarR4214/evidence-S154.txt`
- fetched bodies and headers beside those files: `s153.body`, `s153.hdr`, `s154.body`, `s154.hdr`, `s156.body`, `s156.hdr`

Limitations: match is on the fetched bytes (raw, whitespace-collapsed, and tag-stripped). No browser hydration. S156 was fetched only to classify the misbind; it is not S154's registered URL. Local 2026-10-23 artifacts under shokuknow were read and not treated as today's source.

VERDICT finding S153 misbound (Chinese anchors are S154's, guide bytes unchanged) and S154 misbound (WebMCPNotSupportedError is on S156; still absent from the cited zh-CN page)
