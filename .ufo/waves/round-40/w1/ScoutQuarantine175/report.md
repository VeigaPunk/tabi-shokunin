# ScoutQuarantine175 — quarantine hand-check S175

## Row (source register, read-only)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 213:
`tabi | round5 | S175 | payload-absent | https://www.np.com.tw/modules/news/article.php?storyid=20`
- Quote A: `WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作。`
- Quote B: `Explicit Tool Registration`
- Staged note: "cited source, companion URLs and local artifacts were all checked; the quote is in none of them" (not used as evidence).
- Only one data row for S175 (grep S175 hit one row).

## Source fetch
- URL: https://www.np.com.tw/modules/news/article.php?storyid=20 ; access date 2026-10-27 (UTC), curl -L, UA Mozilla/5.0
- Status HTTP/2 200, text/html UTF-8, 73,627 bytes, sha256 a8bb5f3bb3c0f37c479200e28a35eb2d65e3d3736c2a65d015a6465fc4879065; title "WebMCP 完整解析：當 AI 代理不再需要「猜」你的網站 - NP網頁設計公司".
- Scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine175 (deleted on exit).

## Findings
- Quote A: LOCATED in the FAQ answer to "會不會被拿來灌垃圾留言或洗訂單？" (near the end of the article). Source text: `WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佇列、速率限制全部照常運作。` The source has 佇 (U+4F47); the register has 佪 (U+4F6A), a one-character transcription typo. With 佇 the quote matches exactly (Python substring True); with the register's 佪 it does not (False). So the "absent" claim for Quote A is wrong: the passage is present, modulo the register's typo.
- Quote B `Explicit Tool Registration`: NOT found in the fetched page (case-insensitive grep for "explicit": 0; "registration": 0; only `registerTool({` appears once in a code sample). Page is Chinese-language; the English phrase is absent from this source.
- Per-row classification: **partial** — Quote A present (typo-variant in register), Quote B absent from the successfully opened source. Not a whole-row fabrication, since the source opened and the main quote exists; the register's "quote is in none of them" statement is false for Quote A.

## Limitations
Only the single cited URL was fetched (companion URLs/local artifacts not rechecked). Static HTML only (curl, no JS rendering); page content is server-rendered and the text was found, so rendering is unlikely to matter for B, but not proven. No tools installed.

VERDICT finding S175 partial — Quote A present in cited source (register typo 佪 vs source 佇), Quote B "Explicit Tool Registration" absent; register "quote in none" is false for A
