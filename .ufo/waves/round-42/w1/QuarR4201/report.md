# QuarR4201 — re-adjudication of staged quarantine S102 and S106

Seat: QuarR4201. Lane tabi, round-42 wave w1, defect D4 (fresh check; round-40 dispositions are delta only). Access date 2026-10-28. No tool installed. Pacman not run. No writes under `/home/vgpnk/Projects/shokuknow` or the production tree. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4201/` removed after the receipts below were copied here.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`. Lane cell `` `tabi` ``. Other S102 rows (game-dev-2d round5 line 69, chousa round3 line 271) were not evaluated.

## S102 — misbound

Row line 178: lane `tabi`, round `round1`, id `S102`, class `payload-absent`.

Registered URL: `https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md`

Registered quote: `Last updated 2026-10-05 UTC`

Command:

```
curl -sSL -D s102.headers -o s102.body -w 'effective=%{url_effective}\nhttp=%{http_code}\nbytes=%{size_download}\nredirects=%{num_redirects}\n' --max-time 60 -A 'QuarR4201/round42 (read-only re-adjudication)' 'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md'
```

Observed: `effective=` the same URL, `http=200`, `bytes=25431`, `redirects=0`, `content-type: text/html; charset=utf-8`, `date: Wed, 28 Oct 2026 15:36:57 GMT`, sha256 `a6da248fea5f1e9cedec38d90a8a1b3a64a22c9739c46a9217cc723a41d8d730`. Title: `Chrome DevTools Protocol contribution guidelines`. Exact and whitespace-normalized search: not present. Counts of `Last updated`, `2026-10-05`, and `UTC` in the HTML body: 0.

Same path, gitiles blob (`?format=TEXT`, not a different document): HTTP 200, base64 18492 bytes, decoded 13868 bytes, sha256 `07f83a2c0f5ab37155b70568a6ab30dad3b033d32aa91ce0d24cedc0f931df9d`, 291 lines, begins `# Chrome DevTools Protocol contribution guidelines`. Same three needles: 0. Surrounding sentence (lines 3-5): "This document summarizes the design guidelines for the APIs exposed through Chrome DevTools protocol (_CDP_ further in the document) and provides a brief overview of CDP terminology and related DevTools backend architecture."

Classification fetch, not substituted as the registered URL: `https://developer.chrome.com/docs/extensions/reference/api/debugger` (staged S103 in `merge/tabi/SOURCES.append.md`; that row's anchor cell is the footer string). HTTP 200, 192122 bytes, sha256 `95375b997e4cd4b63a9e6b9256f59538b1fc479f3a5022fb775f9c786abbae73`. Exact hit. Surrounding sentence: "Java is a registered trademark of Oracle and/or its affiliates. Last updated 2026-10-05 UTC." `quote-lint-full-v5.json` already pairs this quote with the S103 SOURCES line while storing the README URL.

Verdict: **misbound**. The cited README opens and does not contain the quote. The quote is the live footer of registered source S103.

Delta vs r40 (`absent as staged`): the decoded README blob is byte-identical to r40 (`07f83a2c…`, 13868 B). The HTML shell hash moved (`f4f00ae2…` → `a6da248f…`) at the same 25431 bytes; the quote is still absent from that shell. r40 did not open the debugger page. Nothing in the cited README started containing the footer. The label changes from absent to misbound because today's S103 fetch shows the string belongs there.

## S106 — misbound

Row line 179: lane `tabi`, round `round1`, id `S106`, class `payload-absent`.

Registered URL: `https://www.rfc-editor.org/rfc/rfc9309.txt`

Registered quotes: `使用 WebMCP 時，請注意下列事項` and `確認 WebMCP 工具曝光度`

Command:

```
curl -sSL -D s106.headers -o s106.body -w 'effective=%{url_effective}\nhttp=%{http_code}\nbytes=%{size_download}\nredirects=%{num_redirects}\n' --max-time 60 -A 'QuarR4201/round42 (read-only re-adjudication)' 'https://www.rfc-editor.org/rfc/rfc9309.txt'
```

Observed: `effective=` the same URL, `http=200`, `bytes=25265`, `redirects=0`, `content-type: text/plain;charset=utf-8`, etag `W/"25cf63a95f77e90b5d9b4e9f878e9951"`, `date: Wed, 28 Oct 2026 15:36:53 GMT`, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`. Document is RFC 9309, Robots Exclusion Protocol, September 2022. Both quotes: exact miss and whitespace-normalized miss. `WebMCP`/`使用`/`確認` counts are 0. Non-ASCII: a leading BOM plus `ü` twice (both in "Zürich"). No CJK text.

Surrounding sentence of the opened RFC (§1, line 100): "These rules are not a form of access authorization." S106's own staged gate sentences are in this file (line 100; §2.3.1.3 lines 395-396 "the crawler MAY access any resources on the server"; §2.3.1.4 line 402 "the crawler MUST assume complete disallow"). Those are not the register quotes. They show the cited bytes are the right RFC.

Classification fetch, not substituted as the registered URL: `https://developer.chrome.com/docs/devtools/agents/webmcp-debugging?hl=zh-tw` (staged S107; its anchor cites both headings). HTTP 200, 176232 bytes, sha256 `6c7bd23ce2ff941e301cd8637f6cdc2108e258bf57ad66c0c6741b207cb8cdd4`. Both strings exact. Surrounding: "使用 WebMCP 時，請注意下列事項： 實驗性標記 ：WebMCP 類別預設不會啟用。" and "確認 WebMCP 工具曝光度 在網站中加入 WebMCP 支援後，您可以指派程式碼代理人，確認工具是否正確向瀏覽器公開，以及輸入結構定義是否完善。"

Verdict: **misbound**. The RFC opens and does not contain either heading. Both headings are on registered source S107 today.

Delta vs r40 (`absent/misbound`, attribution defect): the RFC body did not change (same sha256, same etag, same 25265 bytes as 2026-10-27). r40 did not fetch S107. Today's fetch confirms both headings are still on that page. No new text appeared in rfc9309.txt.

## Limitations

- Sibling fetches classify misbound versus absent. They are not treated as the registered URLs.
- `?format=TEXT` is the gitiles encoding of the same README path, checked because the registered URL returns an HTML shell.
- No install. Scratch deleted after these files were written.

Evidence: `.ufo/waves/round-42/w1/QuarR4201/evidence-S102.txt`, `.ufo/waves/round-42/w1/QuarR4201/evidence-S106.txt`.

VERDICT finding S102 misbound (README blob unchanged, quote is the live S103 debugger footer); S106 misbound (RFC 9309 bytes identical to r40, both headings live on S107)
