# QuarantineD — round-27 tabi §10 Wave-4 quarantine-first residual (rows S164, S165, S166, S167, S171, S174, S175, S176)

Seat: `TabiR27.QuarantineD` (reviewer, wave 4, leaf — no dispatch). Date of audit: **2026-10-25** (fetch batch ≈18:41Z).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## Scope and method

- Slice: `.ufo/waves/round-27/assimilation/quarantine-slice` (38 rows). Assigned here: S164, S165, S166, S167, S174, S175, S176 (`payload-absent`) and S171 (prose class "the cited source could not be fetched, so no quote was checked").
- Register: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`, read **read-only** (rows at register lines 208–214 and 362). No write, fetch, commit, or campaign tool was run against shokuknow.
- One documented GET per row, **to the cited public URL only** (no companion URLs, no search engines, no archive): `curl -sS -L --max-time 90` with a Chrome UA and `Accept-Language: en,zh-CN,zh,ja;q=0.8`. Final URL, HTTP status, bytes and content type recorded per row; body SHA-256 over the saved bytes.
- Prior round-22 verdicts and every register summary field were treated as claims, not evidence; each row was re-opened from its own cited URL.
- Quote search per body: raw bytes; HTML-entity-unescaped; tag-stripped visible text; NFC-normalized; whitespace-insensitive; JSON `\uXXXX`-decoded. Exact-match required for `present`.
- Fixtures (throwaway, lane scratch): `.ufo/waves/round-27/scratch/QuarantineD/S<id>.body` + `.meta`.
- No tool installs (none needed); pacman untouched. No git/jj writes, no builds/linters/formatters, no delegation. No LSP server is engaged for this audit — it is a data-provenance check over fetched bytes, not a code-semantics check; all claims below cite fetched payloads in the scratch fixtures.

## Verdicts

| id | lane/round | cited source (one GET) | HTTP | bytes | sha256 (first 16) | verdict |
|---|---|---|---|---|---|---|
| S164 | tabi/r4 | `developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn` | 200 | 132,974 | `5b9360abd06b1c53` | **absent/refuse** |
| S165 | tabi/r4 | `googlechromelabs.github.io/webmcp-tools/demos/explainer/` | 200 | 19,717 | `ac970a532407b7ce` | **absent/refuse** |
| S166 | tabi/r4 | `weel.co.jp/media/tech/webmcp/` | 200 | 299,948 | `da37ce16bc916eba` | **absent/refuse** |
| S167 | tabi/r4 | `claude.com/ja/marketplace/connectors/webmcp-evaluator` | 200 | 381,570 | `909b7376a8e0b6ef` | **absent/refuse** |
| S171 | tabi/r5 | `chromestatus.com/features/5117755740913664` | 404 | 207 | `e9639e3c4681ce85` | **unreachable/unverifiable** |
| S174 | tabi/r5 | `fullstackladder.dev/blog/2026/07/15/webmcp-basic-concepts/` | 200 | 605,319 | `81db2cc3981781d7` | **absent/refuse** |
| S175 | tabi/r5 | `www.np.com.tw/modules/news/article.php?storyid=20` | 200 | 73,627 | `62096f1ccc82ccee` | **absent/refuse** |
| S176 | tabi/r5 | `web-mcp.net/security-guide` | 200 | 385,056 | `9b306cd84c5512df` | **absent/refuse** |

All fetches resolved to the cited URL itself (no redirect left the cited host/path); content types were `text/html` for all eight.

## Per-row evidence

### S164 — absent/refuse
- Quote (register): `With the extension, you can:` — locator: cited page, no sub-locator recorded.
- Fetched page is fully zh-CN localized ("何时使用 WebMCP 和 MCP | AI in Chrome | Chrome for Developers"). Zero hits for the English span in raw, unescaped, visible, NFC, whitespace-insensitive and `\u`-decoded forms. The page's corresponding passage reads 「借助 WebMCP，您可以控制代理与您网站的互动方式。这有以下几项关键优势：」 — a different sentence in the other language; 「扩展程序，您可以」 also has 0 hits.
- Reason: the exact quoted span is not in the cited (zh-CN) payload. The row cites the zh-CN locale while quoting English text; the span plausibly belongs to the same docs path's `en` locale. `[INFERENCE]` — the en variant was not fetched (single-cited-URL bound).

### S165 — absent/refuse
- Recorded span (register, prose locator, not a verbatim quote): "(the verification environment and the flag note) and the closing paragraph on two tools with the same description; §".
- Fetched explainer (19,717 B; visible text 5,879 chars) contains **0** hits for `verification`, `flag`, `same description`, `two tools`, `evaluator` in every normalized form. Its actual closing items are "Try it. Ship it. Shape it.", "Read the WebMCP explainer", "WebMCP best practices"; the demo section mentions permission/confirmation ("with the user still in the loop for permission and confirmation") but no verification environment, no flag note, and no same-description paragraph.
- Reason: neither a matching verbatim span nor any of the described elements exists on the fetched page; the register's payload-absent call stands, and the span is not quotable prose to begin with.

### S166 — absent/refuse
- Quote: `evaluate_webmcp` — locator: cited article, no sub-locator recorded.
- 0 hits in raw including scripts (case-insensitive; also `evaluate` = 0, `評価` = 0). The WEEL article describes `registerTool`/`execute`, Permissions Policy and security viewpoints, and never names an `evaluate_webmcp` tool.
- Reason: exact span absent; register's payload-absent call confirmed.

### S167 — absent/refuse
- Quotes: `エージェント対応のウェブサイトを監査、改善、デバッグする` / `予測可能で機械可読なシグナル` — locator: connector page, no sub-locator recorded.
- `デバッグ` = 0; both `監査` hits are 「監査ログ」 inside pricing/enterprise strings, not the quote; `機械可読` = 0, `シグナル` = 0. The server HTML carries the connector description only in meta tags: 「公開ページのエージェント対応状況を確認できます。検出済みのツール、追加すべきツール、公開してはならない情報を明示します。」
- Reason: both exact spans absent from the fetched payload. Gap noted below: the connector detail may be client-rendered, so a browser fetch could differ.

### S171 — unreachable/unverifiable (NOT fabrication)
- Register row (line 362) is prose-class: "the cited source could not be fetched, so no quote was checked"; the row records **no quote** — its cited source is the locator: `https://chromestatus.com/features/5117755740913664`.
- Re-fetch performed (the doctrine's sanctioned reader action): HTTP **404**, 207 B body "404 Not Found". The source remains unfetchable.
- Reason: no quoted claim exists to admit or refuse, and the source cannot be opened; per §10/doctrine the row is **unverifiable**, and an unreachable source is never converted into a fabrication.

### S174 — absent/refuse
- Quotes: `敏感動作留一道人工關卡` / `你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作` — locator: cited blog post, no sub-locator recorded.
- In the fetched fullstackladder post: `敏感動作` = 0, `人工關卡` = 0, `關卡` = 0, `驗證碼` = 0, `CSRF` = 0, `審核` = 0, `速率限制` = 0, `照常運作` = 0. The post's real security section reads 「3. 敏感操作保留使用者確認 — 付款、刪除資料、公開發布、變更權限等操作，不應該因為是 Agent 呼叫就跳過確認。」 — thematically parallel, different words.
- **Misattribution evidence:** quote 1 `敏感動作留一道人工關卡` occurs **exactly once in S175's fetched payload** (np.com.tw, the S175 cited source: 「敏感動作留一道人工關卡：涉及付款、刪除、送出的工具，不要加 toolautosubmit，讓使用者親手按下去。」) and 0 times in S174's cited source. Quote 2's closest source is likewise the np.com.tw sentence (see S175).
- Reason: both spans absent from the cited source; the quotes trace to a different row's source. Refuse; re-cite or re-quote.

### S175 — absent/refuse (one-char correction identified)
- Quotes: `WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF token、審核佪列、速率限制全部照常運作。` / `Explicit Tool Registration` — locator: FAQ Q&A section, no sub-locator recorded.
- Quote 1: the passage **is** on the page verbatim **except one character** — source has 審核**佇**列 (U+4F47; 1 occurrence in body); the register quote has 審核**佪**列 (U+4F6A; 0 occurrences). Exact span therefore absent; substance present.
- Quote 2: `Explicit` = 0, `Tool Registration` = 0 in the whole payload. Absent outright.
- Reason: refuse as recorded; quote 1 is correctable (佪→佇), quote 2 is not recoverable from this source.

### S176 — absent/refuse
- Quotes: `origin trial` / `Understand origin trials` / `Third-party origin trials` — locator: cited security guide, no sub-locator recorded.
- In the fetched web-mcp.net security guide (Next.js page): `origin trial` = 0 (case-insensitive), `trial` = 0, `Understand origin` = 0. The only `origin` hits are HTML `crossorigin` attributes; the three `Third-party` hits carry no "origin trials" phrase. The page's headings are threat-model sections ("Tool Poisoning / Description Injection", "Layer 1–3", etc.).
- Reason: zero origin-trial content on the cited page; all three spans absent. The two heading-style spans resemble developer.chrome.com origin-trials documentation `[INFERENCE — that page was not fetched; single-cited-URL bound]`.

## Findings by severity

1. **HIGH — S174 quote misattribution.** Neither quoted span exists in the cited fullstackladder post; quote 1 exists verbatim in the np.com.tw article that is S175's cited source. The row cites source A while quoting source B.
2. **HIGH — S165 span is not a quote and its described content is absent.** The recorded span is locator prose; none of the described elements (verification environment, flag note, closing paragraph on two tools with the same description) exist on the fetched explainer.
3. **MEDIUM — transcription corruption shared across rows.** S175 quote 1 and S174 quote 2 both carry 審核**佪**列 where the only real source text has 審核**佇**列 — the same one-char corruption in two different rows suggests the spans were re-typed or passed through a lossy channel rather than copied from the opened source.
4. **MEDIUM — S176 quotes appear imported from unrelated Chrome origin-trials docs** (0 "trial" hits on the cited page) `[INFERENCE on true origin]`.
5. **MEDIUM — S164 locale mismatch:** English span quoted against a zh-CN-cited URL that carries no English body text.
6. **LOW — S167:** spans absent from the server payload; the page's actual connector description is different (meta-only). Client-side rendering leaves a small residual risk.
7. **LOW — S166:** confirmed absent; register call stands, no flip.
8. **S171:** unreachable/unverifiable on fresh 404; recorded as such, never as fabrication.

## Residual risk and verification gaps

- Single-fetch, plain-client GETs: JS-rendered surfaces (claude.com connector card in S167; any client-side text on S164/S176) may hold text a browser session would show. Server payloads are the cited-source bytes this audit can vouch for.
- The `en` variant of the S164 docs path, the true home of S176's origin-trial spans, and any alternate revision of the S165 explainer were **not** fetched (bound: one GET per row, cited URL only). Those attributions are marked `[INFERENCE]`.
- Payloads are dated 2026-10-25 ≈18:41Z; pages mutate. Hashes pin exactly what was audited.
- S171 stays unverifiable even though reachability was re-tested: a 404 proves absence of the page, and the row records no quote — no verdict stronger than unverifiable is available.
- Register/slice totals were not recomputed beyond the assigned eight rows; sibling lanes' rows were not touched.

## Compliance

- Writes: this report file only (`…/round-27/quarantine/QuarantineD.md`) plus throwaway fixtures under `…/round-27/scratch/QuarantineD/`. Nothing written to shokuknow; no git/jj commands; no builds/lints/formats; no delegation; no installs (nothing needed — curl/python3/coreutils already present); pacman untouched.
- External network: exactly eight GETs, one per assigned row, each to that row's cited public URL, as documented above.
