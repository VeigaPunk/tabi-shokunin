# R57QuarC — quarantine hand-check, part C (rows S143–S163)

Round 57, wave w1 · seat `R57QuarC` · lane `tabi-shokunin` @ `ef43ececde883cc0368c6c7cfbabe30ef937b717`
Contract: `w1-spec.json` item `R57QuarA` (guards, fold ladder f0–f6, verdict vocabulary, JSON shape) — applied unchanged.
Duty: the wave-4 QUARANTINE-FIRST hand-check. **ADOPT NOTHING this round.** Verdict receipts only.

## 1. Rows and inputs

Slice: `.ufo/waves/round-57/assimilation/quarantine-slice`, lines 21–30:
`S143 S144 S145 S147 S148 S149 S153 S154 S158 S163` (10 register rows, all class `payload-absent`).

| input | path | mode |
|---|---|---|
| defect register | `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` | read-only |
| staged rows | `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` | read-only |
| staging knowledge | `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/` | read-only |
| lane work captures | `/home/vgpnk/Projects/shokuknow/lanes/tabi/*/.work/` | read-only |
| own-work carrier for S149 | `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md` | read-only |

No campaign tool was run (`renumber-staged.py`, `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py` untouched). Nothing was written outside this seat's two output dirs.

## 2. Method (frozen ladder, guarded fetches)

* **Fetch guards.** Only `http`/`https` (`curl --proto '=http,https' --proto-redir '=http,https'`). Before each fetch every DNS answer was checked; loopback / private / link-local / reserved / multicast / unspecified space would be refused. No credentials, no cookies, no POST. Limits `--max-time 90 --max-filesize 25000000`. All 19 fetches returned `200` with a non-empty body; **no guard refusal fired**.
* **Documents fetched.** 10 register URLs, plus the 4 staged URLs that differ from the register’s (github `blob` rendering vs `raw.githubusercontent`), plus 5 carrier documents named by the adjacent staged row (S146 OWASP sheet, S155 mcp-b page, S156 Zap Studio, S159 ratelimit-headers-09, S164 Chrome `compare-mcp` zh-CN). Every document was fetched once; the recorded `curl` command, http code, byte count, content type, sha256 and fetch time are in the per-row JSON and `fetched-all.json`.
* **Fold ladder.** Every fragment of every row was searched with all seven folds against **every** fetched document (17 fragments × 19 documents × 7 folds = 2 261 fold searches), and against the two local carrier artifacts.
  * f0 exact substring in raw bytes (UTF-8 encoding of the quote)
  * f1 case-insensitive (per-character lowercase; offsets mapped back to the decoded text)
  * f2 whitespace runs collapsed to single spaces
  * f3 HTML entities decoded
  * f4 HTML tags stripped to text then f2
  * f5 f4 + case-insensitive
  * f6 backtick/quote/punctuation-stripped then f2 (punctuation set = `string.punctuation` + `` `´‘’“”„‟«»‹›，。、；：？！（）【】《》…—–· ``)
* **Offsets.** Each hit reports the **original** line and UTF-8 byte offset (the fold keeps a char map back to the decoded text) plus a ±40-character context, so a hit can be re-checked by eye.
* **Quote cell parsing.** Register quote cells were split on `<br>` and one outer layer of backticks removed; inner markup (e.g. the backticks around `--enable-features=WebMCP`) was kept byte-exactly.
* **Pairing cross-check.** For every row the register URL was compared with the staged row’s URL; differing ones were fetched and re-searched. Because the fragments were found in *other rows’* documents, the neighbouring staged rows’ cited documents were also fetched (the carrier column below) and searched with the same ladder — this is what turns “absent” into a located pairing defect.
* **Verdict rule (stated because the vocabulary’s `mispaired` wording is narrower than the defect).** `quote-located` and `partial-located` are reserved for hits **in the cited source**. A row whose span is absent from its cited source but byte-exact in another campaign row’s cited/staged document or in a campaign-captured artifact of that other row is `mispaired` — the register’s *pairing* is wrong; the quote is real. `absent-confirmed` is reserved for a clean fetch where the span exists nowhere. `unreachable` / `extraction-unavailable` did not fire.

## 3. Verdicts (one per row)

| id | verdict | fragments in cited source | carrier of the real span | one-line reason |
|---|---|---|---|---|
| S143 | `mispaired` | 0 / 1 | S144’s source: `Page.ts` (f0 L1085) | the Chrome-floor sentence is Page.ts’s `webmcp` accessor comment, not the cited CDP `WebMCP.ts` |
| S144 | `mispaired` | 0 / 2 | S145’s source: rfc6265bis-13 §8.8.1 (f0 L2813, f2 L2817) | both spans are the draft’s “Defense in depth” material, not `Page.ts` |
| S145 | `mispaired` | 0 / 2 | S146’s source: OWASP CSRF sheet (f0 L1610) + 1 paraphrase | `Limitations of SameSite` is real OWASP; `Common CSRF weaknesses and protection mechanisms` is byte-exact nowhere |
| S147 | `mispaired` | 0 / 1 | S148’s source: error-1020 page (f0 L192) | “Error 1020” belongs to the 1020 page, not the cited 1015 page |
| S148 | `mispaired` | 1 incidental / 2 | S149’s source: robots.txt (f0 L130, f0 L424) | both anchors are robots.txt headings; the cited page’s only `Sitemap` is a `<link rel="sitemap">` in its head |
| S149 | `mispaired` | 0 / 2 | S150’s own-work `operations.md` (f0 L5, f0 L28) | the daemon headings are the lane’s own reference, not Wikipedia’s robots.txt |
| S153 | `mispaired` | 0 / 2 | S154’s source: zh-CN imperative-api page (f0 L3986, f4 L4015) | the Chinese spans are the zh-CN API page’s, not the cited English guidance `guide.md` |
| S154 | `mispaired` | 0 / 1 | S156’s source: Zap Studio `webmcp/errors` (f0 L1) | the error name is that library’s; the cited Chrome page does not contain it |
| S158 | `mispaired` | 0 / 1 | S159’s source: ratelimit-headers-09 §3 (f0 L88) | the header-field heading is the IETF draft’s, not `src/tools/webmcp.ts` |
| S163 | `mispaired` | 0 / 3 | S164’s anchor cell; `实时会话数据` in round4’s capture (f0 L188) | the cell is S164’s anchor cell verbatim (incl. a locator clause); live page has drifted |

Counts: `mispaired` 10, `absent-confirmed` 0, `quote-located` 0, `partial-located` 0, `unreachable` 0, `extraction-unavailable` 0. Register class (`payload-absent`) is confirmed at each cited URL; **no row is a fabrication**.

## 4. Per-row evidence

Offsets are line / UTF-8 byte offset in the fetched document. Full fold tables (`f0_n … f6_n`) and runnable commands are in `S<id>.json`.

### S143 — `mispaired`
* register URL `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts` → 200, 10 681 B, `text/plain; charset=utf-8`, sha256 `ee7b6fd89e00…`
* staged URL is the github `blob` rendering of the same file → 200, 460 929 B; also carries nothing.
* fragment ``Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled`` — cited source: 0 hits f0–f6. Carrier: `packages/puppeteer-core/src/api/Page.ts` f0, L1085, B26682 (the `webmcp` accessor doc comment; staged S144’s source).
* `WebMCP.ts` is the CDP domain wrapper (imports `devtools-protocol`, `EventEmitter`, cdp `Frame`), not the API doc comment.

### S144 — `mispaired`
* register URL `.../api/Page.ts` → 200, 111 019 B, sha256 `b446b70c6543…`; staged `blob` rendering → 200, 961 530 B.
* `Defense in depth` — cited 0; carrier `draft-ietf-httpbis-rfc6265bis-13.txt` f0, L2813 B113630 (heading 8.8.1) and L164 B8477 (table of contents).
* `is not the extent of a site's defense against CSRF` — cited 0; carrier same draft f2, L2817 B113840 (the sentence wraps across lines; f2 is why the raw substring fails).
* Both are staged S145’s material (§8.8.1).

### S145 — `mispaired` (one fragment is a paraphrase)
* register URL `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` → 200, 146 976 B, sha256 `062239316659…`.
* `Limitations of SameSite` — cited 0; carrier `owasp-csrf` sheet f0, L1610 B30310, 5 hits (staged S146’s source).
* `Common CSRF weaknesses and protection mechanisms` — 0 hits in **every** fetched document and in the round-3 OWASP capture. The sheet’s headings are `Defense In Depth Techniques`, `SameSite (Cookie Attribute)`, `Limitations of SameSite`, `User Interaction-Based CSRF Defense`, `JavaScript: Automatically Including CSRF Tokens as an AJAX Request Header`. This anchor is campaign-authored prose, not a source quote.

### S147 — `mispaired`
* register URL `.../error-1015/` → 200, 115 841 B, `text/html`, sha256 `bf9ea2159709…`.
* `Error 1020: Access denied` — cited 0; carrier `.../error-1020/` f0, L192 B73088 (plus L193 B73906 h2, L216 B90002 in-page nav), 3 hits. Staged S148’s source.

### S148 — `mispaired` (one incidental cited-source hit)
* register URL `.../error-1020/` → 200, 121 181 B, sha256 `135b62c54907…`.
* `Crawl-delay` — cited 0; carrier `https://en.wikipedia.org/robots.txt` f0, L130 B2662 (2 hits: `Crawl-delay: 5`, and the comment line containing `'Crawl-delay'`). Staged S149’s source.
* `Sitemap` — cited **f1 L109 B4060/B4076**: the two hits are `<link rel="sitemap" href="/sitemap-index.xml">` in the document head, i.e. an incidental HTML attribute, not the robots directive. Carrier robots.txt f0, L424 B15118: `Sitemap: https://en.wikipedia.org/w/rest.php/site/v1/sitemap/0`.
* The row is not “mostly located”: both anchors are robots.txt section headings (staged S149’s anchor cell).

### S149 — `mispaired`
* register URL `https://en.wikipedia.org/robots.txt` → 200, 28 275 B, sha256 `48b98d80c844…`.
* `The daemon` — cited 0; carrier `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md` f0, L5 B183 (`## The daemon`), sha256 `b811d9c23dfd…`, 2 422 B.
* `/status JSON fields` — cited 0; same carrier f0, L28 B2114 (`## /status JSON fields`).
* Both are staged S150’s own-work anchors (a local file, not a URL). `The daemon` also occurs as English prose in the agent-browser page (S163’s source, L31 B90136) — incidental, not the cited heading.

### S153 — `mispaired` (id-collision guard observed)
* register URL `https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance-src/main/guides/webmcp/agentic-javascript-tools/guide.md` → 200, 22 859 B, sha256 `7a62b973f06d…`; staged `blob` rendering → 200, 449 784 B. Neither carries the spans.
* `使用 document.modelContext.getTools() 检索可用工具` — cited 0; carrier `https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn` **f4**, L4015 B144085 (a `<code>` element splits the phrase, so f4 is the first locating fold). Staged S154’s source.
* `从 Chrome 153 开始` — cited 0; same carrier f0, L3986 B134829.
* The register’s S153 is the SHOKUNOW staging id (guidance `guide.md`); this lane’s registry S153 is the CDP `browser_protocol.json` row. Only the register’s cited URL was checked, per the seat note.

### S154 — `mispaired`
* register URL `https://developer.chrome.com/docs/ai/webmcp/imperative-api?hl=zh-cn` → 200, 180 655 B, sha256 `fa391fb5cd49…`.
* `WebMCPNotSupportedError` — cited 0 f0–f6; carrier `https://www.zapstudio.dev/webmcp/errors` f0, L1 B6320, 6 hits. Staged S156’s anchor (§`WebMCPNotSupportedError`, lines 45–65).
* The intervening staged row S155 was also fetched (`docs.mcp-b.ai/how-to/debug-and-troubleshoot.md`, 200, 4 848 B) and carries nothing; its anchor cell contains no quoted span — this is why the quote shift skips S155 (see §6).

### S158 — `mispaired`
* register URL `.../src/tools/webmcp.ts` → 200, 2 451 B, sha256 `f06ffc3b4faf…`; staged `blob` rendering → 200, 232 423 B. Neither carries the span.
* `RateLimit-Policy Field` — cited 0; carrier `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt` f0, L88 B3426. Staged S159’s anchor (§3, line 301). Also f1 in round-4 captures `rl-04.txt`, `rl-05.txt`.

### S163 — `mispaired` (structural defect: locator inside the quote cell)
* register URL `https://agent-browser.dev/webmcp` → 200, 267 368 B, sha256 `4fa63e998818…`.
* The quote cell reproduces the **staged S164 anchor cell’s quoted section names and its locator tail**: `WebMCP 与 MCP 的区别` (line 179), `实时会话数据` (line 188), `(line 189); zh-CN locale`. The third piece is a locator, not a quote (and its opening backtick is unclosed in the register row).
* `实时会话数据` — cited 0; carrier round-4 capture `/home/vgpnk/Projects/shokuknow/lanes/tabi/round4/.work/compare-mcp-zhcn.txt` f0, L188 B6805, sha256 `33b503f20266…` (10 051 B); the **live** S164 page has reworded the sentence (`工具在包含用户会话的页面中运行`) — page drift since 2026-10-23, not fabrication.
* `WebMCP 与 MCP 的区别` — 0 hits in the live page and in the capture; the live page’s nav/title read `WebMCP 与 MCP`, and the section heading was reworded. A paraphrase, not a source quote.

## 5. The required knowledge question

**Does the quote text appear anywhere under `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/`? Yes — every one of the 17 fragments is byte-exact in at least one staged knowledge file (11 distinct files).**

| fragment | knowledge file (fold, line) |
|---|---|
| `S143#1` | `webmcp-tool-listing-paths-r13.md` (f0 L33) |
| `S144#1` | `csrf-defense-boundary.md` (f0 L4) |
| `S144#2` | `csrf-defense-boundary.md` (f0 L17) |
| `S145#1` | `csrf-defense-boundary.md` (f0 L5) |
| `S145#2` | `csrf-defense-boundary.md` (f0 L5) |
| `S147#1` | `host-rate-limit-signal-classes-r13.md` (f0 L21) |
| `S148#1` | `host-rate-limit-signal-classes-r13.md` (f0 L6); `host-rate-limit-measured-posture-r17.md` (f0 L5) |
| `S148#2` | `host-rate-limit-signal-classes-r13.md` (f0 L6) |
| `S149#1` | `webbridge-daemon-handshake-amendment-r13.md` (f0 L4); `…-r14.md` (f0 L25); `journey-driver-preconditions-r18.md` (f0 L15); `journey-driver-attachability-r19.md` (f0 L27) |
| `S149#2` | `webbridge-daemon-handshake-amendment-r13.md` (f0 L4) |
| `S153#1` | `webmcp-tool-listing-paths-r13.md` (f0 L7) |
| `S153#2` | `webmcp-hint-is-not-enforcement-r13.md` (f0 L5) |
| `S154#1` | `webmcp-tool-listing-paths-r13.md` (f0 L9) |
| `S158#1` | `host-rate-limit-signal-classes-r14.md` (f0 L4) |
| `S163#1` | `webmcp-tool-approval-hints-r14.md` (f0 L4) |
| `S163#2` | `webmcp-tool-approval-hints-r14.md` (f0 L4) |
| `S163#3` | `webmcp-tool-approval-hints-r14.md` (f6 L4) |

Presence in a knowledge file proves the staging pipeline carried the text; it is **not** independent source verification (for `S145#1` and `S163#1` the knowledge file carries the same campaign paraphrase). Where the knowledge note names its sources it does so correctly: `csrf-defense-boundary.md` lists S145 = the draft and S146 = the OWASP sheet as separate sources, and `webmcp-tool-listing-paths-r13.md` lists S143…S157 each with its own URL. The mispairing is in the register’s **quote column**, not in the knowledge notes.

## 6. Structural finding: the register’s quote column is the *next* staged row’s quoted span

For 9 of 10 rows the register’s quote cell reproduces the quoted span (anchor quote or `teaches` quote) of the **following** staged row, while the row’s cited URL stays its own:

| register row (cited URL is its own) | quote cell actually belongs to | carrier proof |
|---|---|---|
| S143 (WebMCP.ts) | S144 `Page.ts` accessor comment | f0 L1085 |
| S144 (Page.ts) | S145 draft §8.8.1 | f0 L2813 / f2 L2817 |
| S145 (draft-13) | S146 OWASP sheet anchors | f0 L1610 + paraphrase |
| S147 (1015 page) | S148 1020 page | f0 L192 |
| S148 (1020 page) | S149 robots.txt anchors | f0 L130 / f0 L424 |
| S149 (robots.txt) | S150 own-work `operations.md` anchors | f0 L5 / f0 L28 |
| S153 (guidance guide.md) | S154 zh-CN imperative-api anchors | f0 L3986 / f4 L4015 |
| S154 (zh-CN API page) | **S156** Zap Studio anchor | f0 L1 |
| S158 (webmcp.ts) | S159 ratelimit-09 anchor | f0 L88 |
| S163 (agent-browser page) | S164 compare-mcp anchor cell | capture f0 L188 |

S154 is the only row that matches the *second* following row. The staged S155 anchor (`§"If the expected tool is absent" diagnostic step and the console feature-detection snippet`) contains **no backtick-quoted span**, and the S156 anchor does (`§"WebMCPNotSupportedError" (lines 45–65)`) — consistent with a quote-column shift that takes the next row **carrying a quoted span**, not simply the next row.

Consequence for the quarantine decision: these rows are **not fabrications**. The spans are genuine first-party text (11/17 byte-exact in fetched first-party documents, 2 in the lane’s own-work file, 1 in a campaign capture; 3 no: two anchor paraphrases and one locator clause), and the staging knowledge already attributes them to the correct rows. The defect is a one-row offset in the register’s quote/URL pairing, plus two campaign-authored anchor paraphrases (S145#1, S163#1) and one locator clause pasted into a quote cell (S163#3).

## 7. Other observations

1. **Live-page drift was observed, and is not a defect of the rows by itself.** `developer.chrome.com/.../imperative-api?hl=zh-cn` returned 180 655 B and then 180 659 B on two fetches minutes apart; `compare-mcp?hl=zh-cn` has reworded the session-data sentence since the 2026-10-23 capture. Quotes located in captures therefore need re-validation at adoption time.
2. **S148’s `Sitemap` hit is an HTML `<link rel="sitemap">`**, not the robots directive; a mechanical “any hit = located” rule would have mis-scored this row. The receipt records it as `incidentalCitedSourceHit`.
3. **S163’s quote cell is malformed** (a locator clause inside the quote cell, and an unclosed opening backtick). Flagged as `registerRowMalformed: true` plus `locatorFragment` on fragment 3.
4. **S153 id collision** (register vs lane registry) was respected: only the register’s cited URL (guidance `guide.md`) was checked; the lane’s `browser_protocol.json` row was not involved.
5. **S145#1 and S163#1 are the only spans that cannot be located byte-exactly anywhere.** Both are anchor prose, not quoted source text; they should be corrected as anchors, not treated as fabrications.

## 8. Evidence inventory (this directory)

| file | content |
|---|---|
| `S143.json … S163.json` | one receipt per row: URLs, fetch metadata (code/bytes/type/sha256/time/command), every fragment with `f0_n…f6_n`, runnable commands, carrier hits with line/byte/context, knowledge hits, verdict/reason |
| `summary.json` | verdict counts, fold definitions, guard record, instrument digests, knowledge answer |
| `ladder.json` | full ladder (17 fragments × 19 documents × 7 folds) |
| `provenance.json` | scan of `shokuknow/lanes/tabi` + `merge/tabi/knowledge` for the fragments the cited sources did not carry |
| `provenance-knowledge.json` | the required knowledge-dir scan for all 17 fragments |
| `staged-pairing.json` | register row vs staged row URL/anchor/teaches comparison |
| `fetched-all.json` | metadata manifest for all 19 fetched documents |
| `register-rows.json` | the 10 register rows as extracted (byte-exact cells) |
| `fetch-stage.log`, `fetch-companions.log`, `ladder-all.log` | command output logs |
| `quarantine-check.py`, `provenance.py`, `assemble.py` | the tools used (`--scratch` on the fetcher, defaulting to `TMPDIR`; explicit paths elsewhere; no `/tmp` literal) |

Instrument digests (also in `summary.json` → `instruments`): `quarantine-check.py` sha256 `c2677deef3df…`, `provenance.py` sha256 `1c625f24cbcb…`, `assemble.py` sha256 `e98f3c594849…`; curl 8.23.0; python 3.14.8.

## 9. Limits and what was not done

* No adoption, renumbering, merging or register edit — **ADOPT NOTHING** stands; the register was not modified.
* Raw document bytes were not committed (live pages; ~4 MB). The sha256 + fetch command in each receipt reproduce them; a byte mismatch at re-fetch is page drift, which §7.1 already observed.
* Redirect targets were scheme-restricted but the DNS guard was applied to the initial host only; all 19 effective URLs recorded are the cited URLs (no cross-host redirect appeared).
* PDF/binary extraction was not needed (all 19 documents were text/HTML/markdown).
* The carrier diagnosis for S145/S163 rests on the campaign’s own captures where the live page has drifted; the capture paths and offsets are recorded.
