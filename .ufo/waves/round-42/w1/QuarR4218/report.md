# QuarR4218 — quarantine re-adjudication S174, S175

Axes: fetch fidelity (status, final URL, decoded bytes, sha256); quote location (exact, then whitespace-stripped); verdict class against the registered source; honest delta versus round-40 (no copied disposition).

No tools installed. `/home/vgpnk/.omp/agent/RULES.md` was read. Nothing to install; pacman was not run. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4218` was removed before this report. No writes under `/home/vgpnk/Projects/shokuknow`. Register and round-40 notes were read-only.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`. Columns: lane, round, id, class, cited source, quote(s), note. There is no anchor cell. Both rows are lane `tabi`, round `round5`, class `payload-absent`. The note on both is "cited source, companion URLs and local artifacts were all checked; the quote is in none of them".

| id | line | registered URL | staged quotes |
|---|---|---|---|
| S174 | 212 | `https://fullstackladder.dev/blog/2026/07/15/webmcp-basic-concepts/` | `敏感動作留一道人工關卡` ; `你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作` |
| S175 | 213 | `https://www.np.com.tw/modules/news/article.php?storyid=20` | `WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作。` ; `Explicit Tool Registration` |

Register character `佪` is U+4F6A (one per line). It is not `佇` U+4F47.

## Fetches

Both GETs were `curl -sS -L --max-redirs 10 --compressed --max-time 60` with a Chrome UA, headers saved, body saved. `--compressed` negotiates zstd/gzip; `%{size_download}` is the wire size; the sha256 is of the decoded file curl wrote. Date of the saved responses: Wed, 28 Oct 2026 15:37:22 GMT (S174) and 15:37:24 GMT (S175).

S174 meta line:

```
200	https://fullstackladder.dev/blog/2026/07/15/webmcp-basic-concepts/	95725	0	text/html; charset=utf-8
```

Decoded body 605319 bytes, sha256 `81db2cc3981781d7eaac4205e847ff4baef8604c66e3ae87271e2fbad214a8f9`. Content-Encoding zstd. Last-Modified `Sun, 26 Jul 2026 11:32:40 GMT`. Zero redirects. A second fetch was byte-identical. Title: `[WebMCP] 基本概念：讓網站把功能直接變成 AI Agent 的工具 | 全端開發人員天梯`.

S175 meta line:

```
200	https://www.np.com.tw/modules/news/article.php?storyid=20	27500	0	text/html; charset=UTF-8
```

Decoded body 73627 bytes, sha256 `119f69dcb30a3b7de4d0672f587300962a963a08a2b6cc356c9c7a54a9f7a2c4`. Content-Encoding gzip. Zero redirects. Canonical link equals the cited URL. Title: `WebMCP 完整解析：當 AI 代理不再需要「猜」你的網站 - 最新訊息 - 新聞訊息 - NP網頁設計公司`. An anonymous `PHPSESSID` Set-Cookie was redacted in the saved headers; it is not in the body hash.

Saved receipts: `S174.body`, `S174.headers`, `S174.meta`, `S175.body`, `S175.headers`, `S175.meta` in this seat directory. Per-row detail: `evidence-S174.txt`, `evidence-S175.txt`.

## S174 — misbound

Neither staged quote is in the fullstackladder body. Exact match and all-whitespace-removed match are both false in the raw HTML and in tag-stripped text. Substituting `佇` for `佪` in Q2 is still false. Raw counts are zero for `敏感動作`, `人工關卡`, `驗證碼`, `CSRF`, `速率限制`, `審核佪列`, `審核佇列`, `審核隊列`.

Nearest passage, which is not the quote (安全性議題 §3): 「3. 敏感操作保留使用者確認 付款、刪除資料、公開發布、變更權限等操作，不應該因為是 Agent 呼叫就跳過確認。WebMCP 的價值是減少猜測，不是取消授權。」

The quotes belong to the other registered source, the S175 URL fetched above. Q1 is an exact substring. Surrounding sentence: 「敏感動作留一道人工關卡：涉及付款、刪除、送出的工具，不要加 toolautosubmit，讓使用者親手按下去。」 (`toolautosubmit` is the text inside a `<code>` element.) Q2 is not verbatim there either: that page has `審核佇列` (`佇` U+4F47). With that one character restored, Q2 is an exact substring of the S175 FAQ sentence. The row cites source A and quotes source B.

Delta versus round-40 (`absent`): the cited page did not change. Last-Modified is still `Sun, 26 Jul 2026 11:32:40 GMT`, decoded length is still 605319, and sha256 `81db2cc3981781d7…` matches the round-27 receipt prefix and two fetches today. Round-40 recorded HTTP 200 and 605319 bytes at this URL and did not open the S175 URL. The class change is that cross-check, not an edit to the fullstackladder document.

## S175 — partial

Quote A with the register's `佪` is absent. Quote A with `佇` (U+4F47) is an exact raw-HTML substring; no whitespace fold is required. `佪` occurs 0 times. The four characters `審核佇列` are U+5BE9 U+6838 U+4F47 U+5217.

Surrounding FAQ sentence, question 「會不會被拿來灌垃圾留言或洗訂單？」: 「WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佇列、速率限制全部照常運作。但它確實降低了自動化操作的門檻，所以開放寫入類工具之前，把既有防護重新檢查一遍是必要的。」

Quote B `Explicit Tool Registration` is absent. Case-insensitive raw counts of `explicit` and of `registration` are both 0.

The register note that the quote is in none of the checked sources is false for quote A.

Delta versus round-40 (`partial`, same `佪`/`佇` split): the staged spans did not change. Round-40's decoded sha256 was `a8bb5f3bb3c0f37c479200e28a35eb2d65e3d3736c2a65d015a6465fc4879065` at the same 73627-byte length; today's saved sha256 differs because the page is not byte-stable. A later fetch (HTTP 200, 73627 bytes, sha256 `c6c97eb748e3a53af1867f03126eb0fbf0075f22a5412560ba792758e7e0a504`, not retained) differs from the saved body by exactly two SequenceMatcher hunks, both the view-counter digit (saved `1430`, later `1432`), character-length delta 0. Quote A with `佇` stayed exact; `explicit` stayed 0. An intervening fetch hashed to `5374ceaf4fd096de8bbced7d28518255f01bbabaedfd31d5397dd8ea66c6da47` at 73627 bytes with the counter at 1431; that body was not retained, so it is not claimed as a full opcode diff. Verdict stays partial.

## Limitations

Only the two registered URLs were fetched. Companion URLs and lane-local artifacts were not re-opened. Static curl only; both articles are in the server HTML, so the located S175 sentence does not depend on executing JavaScript. The np.com.tw view counter increments on GET; that is why repeated hashes differ, and it is the only difference proven between the saved body and the later fetch. Scratch was deleted. No claim bytes were amended.

VERDICT finding S174 misbound (Q1 verbatim on the S175 np.com.tw source; Q2 is that page's FAQ sentence modulo 佪 U+4F6A vs 佇 U+4F47; fullstackladder page unchanged since r40); S175 partial unchanged (quote A present except that one character; Explicit Tool Registration absent)
