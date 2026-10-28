# QuarR4203 — re-adjudication of tabi S111 and S114

Axes used: fetch fidelity (status, final URL, bytes, sha256), quote match (exact then whitespace-normalized, then word boxes), verdict class in {present, absent, misbound, partial, unreachable}, evidence completeness. No install. curl 8.23.0 and pdftotext 26.08.0 were already on the host. pacman was not used. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4203` was removed after these receipts were written.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`. Header at line 27: `lane | round | id | class | cited source | quote(s) | note`. There is no anchor column. Lane cell `tabi`. Other S111/S114 rows (chousa, revenger, souji) were not adjudicated.

## S111 (line 182, round1, payload-absent)

Cited source: `https://developer.chrome.com/docs/ai/webmcp/secure-tools`

Staged quotes: `Add hints to your tools` and `默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。`

Command (2026-10-28):

```
curl -sSL -D s111.headers -o s111.body -w 's111_http=%{http_code}\ns111_url=%{url_effective}\ns111_size=%{size_download}\ns111_redirects=%{num_redirects}\ns111_ctype=%{content_type}\n' --max-redirs 10 -A 'QuarR4203-recheck/1.0 (read-only quarantine)' 'https://developer.chrome.com/docs/ai/webmcp/secure-tools'
```

Observed: `s111_http=200`, `s111_url=https://developer.chrome.com/docs/ai/webmcp/secure-tools`, `s111_size=140264`, `s111_redirects=0`, `s111_ctype=text/html; charset=utf-8`. Header `last-modified: Tue, 01 Sep 2026 07:00:00 GMT`, `date: Wed, 28 Oct 2026 15:36:57 GMT`, `content-length: 140264`. sha256 `88b660bcf123a7f5f76883043a6e29d88fa68073e99e0e1041093de103818181`. `<html lang="en">`.

Quote 1: 0 hits exact and whitespace-normalized. Surrounding sentence under h2 "Use annotation hints": "There are a few hints you should add when building your tools:".

Quote 2: 0 hits as Chinese on this body. Same section, English: "By default, other websites or cross-origin iframes can't observe or interact with your tools."

The HTML links `hreflang="zh-Hans"` to `https://developer.chrome.com/docs/ai/webmcp/secure-tools?hl=zh-cn`. That companion GET (not treated as the registered URL) returned HTTP 200, 131145 bytes, 0 redirects, final URL the zh-cn href, sha256 `e4037aac36f2476f98087133c5d123e56dda46f81fbc4f2e93ca7198e2c6e497`, `lang="zh-CN-x-mtfrom-en"`. Quote 2 is exact there. Surrounding sentence under h2 "谨慎公开您的工具": "WebMCP document.modelContext.registerTool API 仅向智能体公开工具的功能。默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。" Quote 1 is absent; heading is "使用注释提示".

A second GET of each URL kept the byte counts and changed the sha256 (en `60c30a3c9550fce92049dba4bdf0d9f463bfca236bc2dc31174fab89b4d5f633`, zh `57dc9291fe1640baeb2d35c2fe12def5d07e64e7b131cf69d380b3a936777aea`). English bytes are identical through offset 133000; later diffs are the CSP nonce and a feature-flag JSON blob. Both copies agree on the quotes. The sha256 above is this fetch, not a stable content id.

**verdict: partial.** One span is verbatim on the document's zh-Hans alternate; the other span is absent in both renderings. Not present (registered body lacks both strings), not absent (quote 2 is on the page's own locale), not misbound (not a different register row), not unreachable.

Delta vs r40 (partial, zh-cn only): class unchanged. Lengths still 140264 and 131145. Last-Modified still 2026-09-01, before r40's 2026-10-27 fetch. r40 wrote that the English page had no cross-origin sentence; both fetches today have it in the stable prefix. That is not shown to be a post-r40 edit, because Last-Modified predates r40 and the hash moves on every request. [INFERENCE] r40 truncated the paragraph at "functionality". The English sentence does not put the staged Chinese quote on the registered URL, so the class stays partial.

## S114 (line 183, round1, payload-absent)

Cited source: `https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf`

Staged quote: `achieves better web element identification accuracy compared to naive set-of-marks prompting technique`

Command (2026-10-28):

```
curl -sSL -D s114.headers -o s114.body -w 's114_http=%{http_code}\ns114_url=%{url_effective}\ns114_size=%{size_download}\ns114_redirects=%{num_redirects}\ns114_ctype=%{content_type}\n' --max-redirs 10 -A 'QuarR4203-recheck/1.0 (read-only quarantine)' 'https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf'
pdftotext -layout -enc UTF-8 s114.body s114.txt
pdftotext -bbox-layout -enc UTF-8 s114.body s114.bbox.html
```

Observed: `s114_http=200`, `s114_url=` the registered URL, `s114_size=787690`, `s114_redirects=0`, `s114_ctype=application/pdf`. Header `Last-Modified: Fri, 05 Dec 2025 12:30:30 GMT`, `ETag: "c04ea-645339c75c93a"`, `Content-Length: 787690`, `Date: Wed, 28 Oct 2026 15:36:59 GMT`. sha256 `9c2bdd5f015355478a637c0d6155f49ff8a49d96842ed03abcdea55877e67b55`. `file` says PDF 1.7, 8 pages. pdftotext -layout wrote 33115 bytes, sha256 `e0d72eb1dc8d2c837fd209a005f4bdd82dee9ea12ea6893b39a149146cd52ac4`.

Exact and whitespace-normalized search of the extracted text fails. Abstract wording is `set-of mark`, not `set-of-marks`. Word boxes at y=397.38: `set-of` x=432.55–455.33 and `mark` x=458.94–479.50, gap 3.61pt, matching the 3.73pt gap before `set-of`. Surrounding sentence: "Our evaluation demonstrates that our tool enables higher abstraction and reuse in test generation, and achieves better web element identification accuracy compared to naive set-of mark prompting technique." Elsewhere the PDF has `Set-of-Mark` and `set-of-mark`, never `set-of-marks`.

**verdict: partial.** The passage is in the cited PDF; one token differs. Not present, not absent, not misbound, not unreachable.

Delta vs r40 (partial/near-verbatim): class unchanged. Same 787690 bytes and Last-Modified 2025-12-05. No wording change on the live file. This pass confirms the space with glyph positions; r40 used pdftotext only.

## Limitations

No JS rendering. S111 sha256 is per-request; compare lengths and the stable prefix, not the hash, across fetches. S114 text positions come from poppler, not a visual read of the glyphs. Companion URLs and lane-local artifacts from the original census were not re-fetched; scope was the cited URL, plus the hreflang alternate the S111 HTML itself advertises. No write under `/home/vgpnk/Projects/shokuknow` or the production tree. Counter and claims bytes were not amended.

Evidence: `.ufo/waves/round-42/w1/QuarR4203/evidence-S111.txt`, `.ufo/waves/round-42/w1/QuarR4203/evidence-S114.txt`.

VERDICT finding S111 partial (quote 2 verbatim only on ?hl=zh-cn; quote 1 absent) and S114 partial (abstract "set-of mark" not "set-of-marks"); class unchanged vs r40
