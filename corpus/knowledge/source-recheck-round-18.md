source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S038 S040 S041 S042 S043 S044 S045 S046 S048 S051 S052 S054 S055 S056 S057 — the 51 rows of `corpus/SOURCES.md` not superseded at baseline B; URLs and anchors per row in §3; receipts `corpus/evidence/round-18/source-recheck/<row>.json` and `<row>.excerpt.txt`
verified-at: 2026-10-20 — author-side re-open on 2026-10-20 by the round-18 producer; each receipt's `fetchedAt` is on that date; not independent non-author verification
recheck: 90d — reopen every row this note cites on 2027-01-18 (90 days after verified-at), or sooner when a release named by a cited row ships (Chrome/Chromium 154 line, Playwright stable docs, Selenium, Jujutsu v0.45.1, git 2.56.0); a row's own `recheck` cell in `corpus/SOURCES.md` governs that row's check, so no row is date-due at verified-at under its own cell

# Round 18 — source recheck (C1 freshness)

This note records a bounded re-open of 51 registry rows against their live or pinned sources, on 2026-10-20. It is early re-verification, not a repair of an overdue row: no row's `recheck` cell was past due on this date. It corrects nothing in place (SOURCES rule 2). It does not make any knowledge entry true. It records that a quoted sentence is present at the cited location in the bytes fetched on 2026-10-20, and what the fetch did and did not establish. Layout follows `corpus/knowledge/source-recheck-round-12.md`.

## 1. What was rechecked and how

**Scope.** `corpus/SOURCES.md` has 57 rows (S001–S057). Six were superseded at baseline B and are not rechecked: S004 (by S028), S039 (by S040), S047 (by S054), S049 (by S055), S050 (by S056), S053 (by S057). The other 51 rows each have exactly one receipt. Counting: 102 files in `corpus/evidence/round-18/source-recheck/` = 51 `.json` + 51 `.excerpt.txt`, no extra or missing row (listing and JSON read on 2026-10-20).

**One producer.** Every receipt was written by `.ufo/waves/round-18/recheck-fetch.mjs`, schema `tabi-source-recheck-v1`. All 51 receipts carry the same `producerSha256`, `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.

**Fetch.** HTTP rows: `curl -sSL --compressed --max-time 90`, fixed user agent, `-w %{http_code}`. The receipt records the argv (`command`), final HTTP status (`httpStatus`), byte count and sha256 of the body. S029 is own-work: its body is a git blob read with `git show 837b33a…:corpus/evidence/round-13/aria/receipt.json`, so `httpStatus` is null and no network request was made.

**Decode.** `none` 13 receipts; `html-text` 32; `base64` 5 (Chromium gitiles, which serves base64); `pdf-text` 1 (S018, `pdftotext -layout`).

**One normalizer.** `normalize()`: Unicode NFC, curly quotes folded to ASCII, en and em dashes to `-`, NBSP to space, whitespace runs collapsed. Both quote and body are normalized before a substring test.

**Quote rules.** At most 25 words; largest in this round is 24 (`quoteWords`, observed max over 51). The quote is verbatim from the body.

**Counts, derived from the receipt JSON.** Each count below was taken by reading the 51 `<row>.json` files in the receipt directory (a `node -e` read of `teachesVerdict`, `quoteFound`, `decode`, `httpStatus`, `tier` and `status` joined to `corpus/SOURCES.md`). The counter `node .ufo/waves/round-18/measure-c1.mjs <REV>` is the committed-input counterpart; it reads only the revision named by `<REV>`, so it reports 0 at baseline B (`2bff864fdfee684ddbcd066cc8e735adaba2735c`, observed 2026-10-20, where round-18 receipts do not exist). At the integration revision that commits the receipts, `c1_rows_rechecked` is the count to cite.

**Excerpt integrity.** For all 51 receipts, the sha256 of the `<row>.excerpt.txt` bytes equals `excerptSha256` (51 of 51 matched, checked 2026-10-20).

**Row integrity.** For all 51 receipts, `rowUrl` occurs verbatim in that row's `source` cell in `corpus/SOURCES.md` (51 of 51).

## 2. Verdict summary

| Measure | Value | Derived from |
|---|---|---|
| Receipts (rows rechecked) | 51 | count of `<row>.json` in the receipt directory |
| `teachesVerdict` = held | 51 | `teachesVerdict` field of each receipt |
| `teachesVerdict` = drift | 0 | same |
| `teachesVerdict` = unreachable | 0 | same |
| `quoteFound` = true | 51 | `quoteFound` field |
| `quoteFound` = false | 0 | same |
| Row `status` (SOURCES): mined / queued / rejected | 40 / 6 / 5 | `status` cell of each receipt's row |
| Row `tier` (SOURCES): A / B / C | 42 / 4 / 5 | `tier` cell of each receipt's row |
| HTTP 200 / non-HTTP (null) | 50 / 1 (S029) | `httpStatus` field |
| Counter at B, `eligible_rows` / `c1_rows_rechecked` | 51 / 0 | `node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c` |

Status and tier describe the registry row, not the receipt. A `rejected` row still gets a receipt: the receipt shows that the quoted rejection text is present, which supports the rejection's wording, not any product claim it makes. The five rejected rows are S026, S027, S038, S040 and S057.

## 3. Rows rechecked: URL, anchor and fetch record

Columns: row; registry status and tier; decode; HTTP status; bytes; first 12 hex of the body sha256 (full digest in `<row>.json`); URL (the row's `rowUrl`); the registry anchor cell. Anchor cells are reproduced from `corpus/SOURCES.md`; the three longest (S046, S054, S057) are abridged here and their full cells are in the registry.

| Row | Status / tier | Decode | HTTP | Bytes | sha256 (12) | URL | Anchor (registry cell) |
|---|---|---|---|---|---|---|---|
| S001 | mined / A | html-text | 200 | 96397 | c040a72e40a7 | https://developer.chrome.com/blog/remote-debugging-port | blog post published 2025-03-17, body paragraph "from Chrome 136" |
| S002 | mined / A | html-text | 200 | 35462 | ba8018bb02f3 | https://chromedevtools.github.io/devtools-protocol/ | living page fetched 2026-10-19, §Scope and support, §HTTP endpoints |
| S003 | mined / A | html-text | 200 | 107908 | 6091506bf107 | https://developer.chrome.com/blog/chrome-for-testing | blog last updated 2023-06-12, §Discover a dedicated Chrome flavor for testing |
| S005 | mined / A | html-text | 200 | 4235856 | dc1077db50fe | https://www.w3.org/TR/webdriver-bidi/ | WD 2026-10-08, Abstract and §§7.1–7.10 |
| S006 | mined / B | html-text | 200 | 163592 | 7dc6b2bd57b0 | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules | MDN content commit 253bed3d, §List of modules |
| S007 | mined / B | html-text | 200 | 158088 | b7a0850e730f | https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection | MDN content commit f83c12ab, §Launching the browser, §Getting the WebSocket URL |
| S008 | mined / A | html-text | 200 | 92317 | c919558a0ec5 | https://www.selenium.dev/documentation/webdriver/bidi/ | last modified 2026-08-15, §Enabling BiDi in Selenium |
| S009 | mined / A | html-text | 200 | 1274369 | 84a9db7fa106 | https://www.selenium.dev/documentation/webdriver/bidi/w3c/network/ | page modified 2026-07-23, §Add network intercept, v4.32 Python example |
| S010 | mined / A | html-text | 200 | 112335 | 691ce80ffcc6 | https://developer.chrome.com/blog/webdriver-bidi-2023 | last updated 2023-05-09, §Where are we now? |
| S011 | mined / A | html-text | 200 | 109287 | 8eb1093e53dc | https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi | last updated 2024-08-07, §Firefox support, §CDP support in the future |
| S012 | mined / A | html-text | 200 | 527500 | b1b0c3dacda9 | https://github.com/GoogleChromeLabs/chromium-bidi | README §WebDriver BiDi for Chromium and §BiDi+, commit 1c6f4363 |
| S013 | mined / A | html-text | 200 | 99073 | cf48ff4db0a3 | https://playwright.dev/docs/test-retries | stable docs served 2026-10-19, §Failures, §Retries |
| S014 | mined / A | html-text | 200 | 60566 | e947d4dc0b73 | https://playwright.dev/docs/trace-viewer | stable docs served 2026-10-19, §Recording a trace / Tracing on CI |
| S015 | mined / A | html-text | 200 | 47845 | 31075410ae19 | https://playwright.dev/docs/actionability | stable docs served 2026-10-19, §Introduction |
| S016 | mined / A | html-text | 200 | 159543 | 1bb8afe888af | https://playwright.dev/docs/test-assertions | stable docs served 2026-10-19, §Auto-retrying assertions |
| S017 | mined / A | html-text | 200 | 1002533 | ce461e5be73b | https://playwright.dev/docs/release-notes | Version 1.64 §Test runner, served 2026-10-19 |
| S018 | mined / A | pdf-text | 200 | 447958 | 9304083f1987 | https://mpapad.github.io/publications/pdfs/ICST25.pdf | ICST 2025 accepted paper, §III.C, §V.A Table V (printed pp. 94, 98-99) |
| S019 | mined / B | html-text | 200 | 49866 | 119a6e3078a7 | https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/ | institutional record, Abstract; DOI 10.1145/3695989, published 2025-02-12 |
| S020 | mined / A | html-text | 200 | 511987 | 562759666894 | https://webmachinelearning.github.io/webmcp/ | CG-DRAFT 2026-10-16, revision f14762e6 |
| S021 | queued / A | html-text | 200 | 125482 | 30dd763c0276 | https://developer.chrome.com/docs/devtools/agents | rolling docs, no revision marker, read 2026-10-19 |
| S022 | queued / B | none | 200 | 45610 | 0748f3739d37 | https://ieeexplore.ieee.org/document/10989021/ | IEEE ICST 2025, DOI 10.1109/ICST62969.2025.10989021, Abstract |
| S023 | mined / A | html-text | 200 | 268087 | 234a24527d5a | https://playwright.dev/docs/locators | stable docs read 2026-10-19, §Locate by role |
| S024 | mined / A | html-text | 200 | 125426 | bbbad6881341 | https://playwright.dev/docs/aria-snapshots | stable docs read 2026-10-19, §Aria snapshots |
| S025 | mined / A | html-text | 200 | 39382 | 17521385704d | https://www.w3.org/WAI/ARIA/apg/ | APG home, no revision marker, read 2026-10-19 |
| S026 | rejected / C | html-text | 200 | 608 | 92326bb935cc | https://stackoverflow.com/questions/74920905/how-to-give-fixed-wait-in-playwright-without-any-condition-like-we-had-in-cypress | answer 74926242, 2022-12-27, re-read via Stack Exchange API 2026-10-19 |
| S027 | rejected / C | html-text | 200 | 19390 | e36d660b349e | https://duncanlock.net/blog/2023/05/27/debugging-with-an-existing-browser-instance-or-brave-in-vscode/ | post dated 2023-05-27, setup list adding `--remote-debugging-port=9222` |
| S028 | mined / A | none | 200 | 15057 | ea72757acd7c | https://github.com/chromium/chromium/blob/main/chrome/browser/devtools/remote_debugging_server.cc | @main fetched 2026-10-19 (L1 re-fetch sha256 `ea72757a…01cc`, identical to S004's); .cc:169-177 |
| S029 | mined / A (own-work) | none | none (git blob) | 97073 | b458b3514303 | corpus/evidence/round-13/aria/receipt.json (committed at 837b33a3988ebeea7f6b4ef5c04698da88909a73) | cleanup.server.perWorker[0].listeningAfter, runtime.node and pin.node |
| S030 | mined / A | none | 200 | 37575 | 184c519af9ed | https://github.com/webmachinelearning/webmcp/blob/main/README.md | repo HEAD cb3d16964ab3e92cfd5f09901ed0504373a906e8 (2026-10-20), README.md line 319, §Future Exploration: Declarative API |
| S031 | mined / A | none | 200 | 10417 | 4587c9f2540b | https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md | repo HEAD cb3d16964ab3e92cfd5f09901ed0504373a906e8 (2026-10-20), §Input schema synthesis lines 108-115 |
| S032 | mined / A | html-text | 200 | 145257 | 22dec7bd5e38 | https://developer.chrome.com/docs/ai/webmcp | page last updated 2026-10-07, §Get started, §Local WebMCP, §Permissions policy |
| S033 | mined / A | base64 | 200 | 520 | 9c0d5822fbae | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), lines 7-12, sha256 50dd337d…6364 |
| S034 | mined / A | base64 | 200 | 310220 | 3dc33e9d2e40 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 | tag 154.0.8037.97, lines 7023-7050, sha256 99b92e67…1d2b |
| S035 | mined / A | none | 200 | 4126 | f386bcfd0363 | https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | main fetched 2026-10-20, line 7 and lines 47-54, sha256 f386bcfd…f99f |
| S036 | mined / A | none | 200 | 8553 | c23d575e90f0 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium 154 DEPS line 424), lines 192-203, sha256 c23d575e…b632 |
| S037 | mined / A | html-text | 200 | 904649 | c75242dace0e | https://modelcontextprotocol.io/specification/2026-07-28/server/tools | revision 2026-07-28, tools.md line 290 and line 62 |
| S038 | rejected / C | none | 200 | 13006 | 351c02db5b16 | https://github.com/Sgr57/webmcp-fork/blob/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md | fetched 2026-10-20, §Verification Method 2 line 140 |
| S040 | rejected / C | none | 200 | 242270 | a85a527aed2c | https://bug0.com/blog/webmcp-chrome-146-guide | post published 2026-02-11, §How it actually works para 1; spec commit c7b5c70 (2026-05-27) moved the getter to Document |
| S041 | mined / A | base64 | 200 | 5292 | 0ea9bf3f3d06 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | tag 154.0.8037.97 fetched 2026-10-20, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, lines 7 and 58-122, sha256 26e62f29…37ff |
| S042 | mined / A | base64 | 200 | 66824 | 039e24a0a954 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), model_context.cc:528-580, 748-811, 856-873, blob c5ef637f, sha256 474083d6…8823 |
| S043 | mined / A | none | 200 | 91001 | 76fcc35aa651 | https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | commit 51ed75653aaa7f174f8dbe05d1bc327359bbc57c (2026-10-20), §4.2 executeTool lines 1023-1185, §3 error table lines 260-301 |
| S044 | mined / A | none | 200 | 59794 | 4b2fce64c708 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium tag 154.0.8037.97 DEPS line 424), WebMCPView.ts:942-945 and 561-576, WebMCPModel.ts:128-139 and 249-258 |
| S045 | mined / A | base64 | 200 | 10684 | b1300c0657f1 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51, WebMCP.pdl:68 |
| S046 | mined / A | none | 200 | 37575 | 184c519af9ed | https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md | 51ed75653aaa7f174f8dbe05d1bc327359bbc57c (2026-10-20); README.md §Lifecycle of a Tool Call ll. 308-313 and §executeTool ll. 352-375; declarative-api-explainer.md §Events ll. 157-188 and §Getting the form response ll. 117-129; continuations-explainer.md ll. 15-20 and §Document Lifecycle Considerations l. 220; security-privacy-questionnaire.md Q12 ll. 57-65 and Q19 ll. 93-100 (abridged) |
| S048 | mined / A | html-text | 200 | 191224 | b4a79911f2da | https://developer.chrome.com/docs/devtools/application/webmcp | page last updated 2026-05-12, §Test tools manually (id test-tools) and §Invoked tools (id invoked-tools) |
| S051 | queued / A | html-text | 200 | 28804 | d70690447308 | https://git-scm.com/docs/git-symbolic-ref | git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280), Documentation/git-symbolic-ref.adoc:41-43 and :72-74 |
| S052 | queued / A | html-text | 200 | 122459 | 1e84fc200220 | https://git-scm.com/docs/git-rev-parse | git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280), Documentation/git-rev-parse.adoc:498-505 and revisions.adoc:49-51 |
| S054 | mined / A | html-text | 200 | 189556 | eebe1d1a0796 | https://developer.chrome.com/docs/ai/webmcp/imperative-api | page last updated 2026-10-16, §Execute tool (id execute_tool) first paragraph before the first code block (byte 158695) and the Note after the second code block (byte 162526); raw-body sha256 differs per response (CSP nonce), so content is checked by stable byte offsets |
| S055 | queued / A | html-text | 200 | 58508 | 5362168d6cd3 | https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ | v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §Colocated Jujutsu/Git workspaces ¶3; raw docs/git-compatibility.md:113-115 |
| S056 | queued / A | none | 200 | 212175 | 05c34fb8d81f | https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md | v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §0.45.0 Fixed bugs:96-97; §0.45.0 New features:68-71 |
| S057 | rejected / C | html-text | 200 | 695881 | 361a9a0f2ec2 | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | listing fetched 2026-10-20, Offered by François Beaufort (individual publisher), summary paragraph and Prerequisites paragraph; registry-recorded body 649153 B, sha256 085c40b7… (S053 record) — this round's receipt differs in both, see §6 |

Quote source locations: for S018, S029, S035 and S043 the receipt's `quoteSource` is `new` (the quote was chosen in round 18, not taken from an earlier lesson). S042's quote differs from its round-17 lesson location because that location is wrapped across comment lines in `model_context.cc`, which the shared normalizer does not join; the receipt records this.

## 4. Pinned and live rows, and what the fetch can show

The URL class is a property of the row's URL, not of the receipt:

- **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt records bytes only, not the commit served.
- **Live or rolling** (URL names a branch, `main`, a rolling page or a store listing): e.g. S002, S012, S020, S021, S028, S030–S032, S035, S048, S054, S057. These can change between fetches; the 2026-10-20 digest pins one response only.
- **Own-work** (S029): a repository path read from git at a named commit, not a network source.

The counter at baseline B classifies all 57 registry rows as `immutable_pinned` 14, `living_live` 42 and `own_work` 1 (`row_classes.url`, observed 2026-10-20). That classification is the counter's own, from the row URL; it is not a property the receipts establish.

Two cases the receipts show directly:

- **S020 served a later revision.** The receipt's `anchorObserved` records `meta name=revision 51ed75653aaa7f174f8dbe05d1bc327359bbc57c` and `dt-updated 2026-10-20`, while the row's anchor cell records `CG-DRAFT 2026-10-16, revision f14762e6`. The quote held. The anchor cell stays as opened (SOURCES search log, round 16, already noted this); no superseding row is opened for a moving anchor.
- **S030 and S046 have identical bodies.** Both receipts have 37575 bytes and sha256 prefix `184c519af9ed`, though S030's URL is `main` and its anchor cell names `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, while S046's URL names `51ed7565`. The bytes agree on 2026-10-20; the receipts cannot show which commit the `main` URL served.

## 5. Drift handling

- **No drift in this round.** All 51 receipts are `held`. No superseding row is opened by this note.
- **Earlier supersessions still in force.** Each superseding row among the 51 has its own receipt: S028 (for S004), S040 (for S039), S054 (for S047), S055 (for S049), S056 (for S050) and S057 (for S053). Each `teaches` cell opens `supersedes <row> —`, as SOURCES rule 2 requires.
- **Counting.** A `drift` receipt counts only when a superseding row exists at the measured revision (counter rule). None occurs here.
- **Unreachable.** The producer accepts `unreachable`; the counter does not count it and it opens no superseding row. None occurs here.
- **Moving anchors are not drift.** The S020 case in §4 is the worked example: the claim the row cites is still present, and the revision drift is recorded in the receipt, not in the registry.
- **Rejected rows.** A rejected row keeps its rejection. Its receipt confirms that the quoted rejection text is present; it changes no status.

Examples already in `corpus/SOURCES.md` (not new this round):

- **S004 → S028.** Same `remote_debugging_server.cc` URL. S028 narrows the claim to a check compiled only under `GOOGLE_CHROME_BRANDING`, and labels the unbranded-host behaviour as an inference from source.
- **S039 → S040.** The 2026-02-11 post was accurate on its date; S040 records that its `navigator.modelContext` statement went stale at spec commit `c7b5c70`.
- **S047 → S054.** Same imperative-API page. S054 records a per-response CSP nonce and checks content by stable byte offsets.
- **S049 → S055 and S050 → S056.** Colocated jj/git HEAD. S056 narrows "HEAD equals a bookmark" to a state that holds while `@-` is that bookmark's commit.
- **S053 → S057.** Same Chrome Web Store listing URL. S057 records a developer name and a Chrome 150.0.7861.0 floor, and states that the listing adds no invocation contract beyond S048 and S041. (`corpus/SOURCES.md` S057 still carries the "individual publisher" wording from its source cell; the correction to that cell is outside this note.)

## 6. Limits

- **Quote presence is not claim truth.** `quoteFound` shows that the normalized quote occurs in the normalized body of one response, fetched on 2026-10-20. It does not show that the row's `teaches` claim is correct, that the quote supports it, or that the page is the one the anchor names. `anchorObserved` is free text written by the seat that ran the fetch.
- **Source-only; no runtime.** No browser was launched, no WebMCP tool was invoked, and no Chromium 154 build was run for this note. The receipts say what the cited documents and source files contain. They say nothing about how any product behaves, and the 51 rows are not a statement of current live product support.
- **Normalization is tolerant on purpose.** Quotes, dashes, NBSP and whitespace are folded, so a match can hide a typographic change. `html-text` drops tags before matching, so a quote crossing markup can join words that were separate on the page. Its entity table is fixed; a named entity outside it stays literal and a quote containing it fails to match.
- **Dynamic pages.** A digest pins one response's bytes. S054 changes its raw-body digest between responses because of a CSP nonce; the receipt checks content by the quote and the stable byte offsets the row names. A receipt's `sha256` must not be compared across runs or used as a page identity.
- **PDFs.** S018 is the only `pdf-text` receipt. `pdftotext -layout` can reorder columns and split words at line ends, and output depends on the poppler version. The receipt does not record the tool version; the environment witness for this round is outside the receipt: `pdftotext -v` reported `pdftotext version 26.08.0` on 2026-10-20, on this host. A PDF quote can fail to match while its text is present, so a `quoteFound: false` on a later PDF recheck is not, by itself, drift.
- **HTTP status.** `httpStatus` is curl's final status after redirects. A 200 can still be a challenge or login page; the round-12 spot check found a Stack Exchange source reachable only through its API after a challenge page (`corpus/SOURCES.md`, search log, 2026-10-19).
- **Live listing bytes (S057).** The Chrome Web Store listing is a live page. The registry records a fetched body of 649153 B, sha256 `085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c` (S053's record). This round's receipt for S057 is 695881 B, sha256 `361a9a0f2ec2…` (12 of 64 shown in §3; full digest in `corpus/evidence/round-18/source-recheck/S057.json`). Both claim the same fetch date, so the bytes changed between fetches on one day. The quote still held in the 2026-10-20 receipt. The registry's recorded digest is not updated in place; this is a limit on the row, not a superseding row, because the claim it quotes is still present.
- **Own-work.** S029 is read from a committed git blob, not a network source. Its receipt shows that the quoted fields are present in that commit. It is hygiene for the registry record, not a new observation: the retained worker record's `listeningAfter` values and the recorded `runtime.node` / `pin.node` fields are quoted as they are, with no new runtime measurement.
- **Non-HTTP sources.** The `command` field records how a body was produced. The producer does not re-run it, so reproducibility rests on the caller.
- **Coverage.** The counter counts receipts. A row with no receipt is absent from the count, and the 6 superseded rows have none by design.
- **Authorship.** Receipts were written by the seats that ran the fetches. Independent re-open of any row is a separate step (SOURCES rule 1) and is not claimed here.

## 7. Wave-2 corrections — current interpretation supersedes the earlier snapshot prose

The preceding sections record the first integration at
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`, not final current counts. In §1, “has 57 rows”
means **at baseline B**; that integration already had 64 rows. S058 superseded S057 in that
same commit, contrary to §6's “not a superseding row” wording. S065–S076 now make the
additional corrections below. Current census and final counter values are recorded in
`corpus/evidence/round-18/measurements.json` and SCORECARD.md, not inferred from these old tables.
The fixed cohort remains 51 (38 living-URL, 12 pinned-URL, one own-work by the counter's URL
classifier); a static paper URL can still classify “living”, so this is not a scientific
content-mutability classification. No date-due or product-currency claim follows.

| Current row | Supersedes | Correct interpretation and opened authority |
|---|---|---|
| S065 | S052 | HEAD names a base commit but may be attached via a symbolic branch reference; “not a branch” was overbroad. Git2.56 manual, `.ufo/waves/round-18/w2/LiveS052.md`. |
| S066 | S008 | Selenium documents capability activation/low-level domain access; per-binding/API limitations belong to S009, not this page. `w2/LiveS008.md`. |
| S067 | S029 | The original aggregate true encodes every worker not listening. It is not an active-listener contradiction; round14 derives listeningAfter=false. Historical Node fields stay historical. `w2/LiveS029.md`, `scripts/aria-loopback-round13.mjs:605`, corrected round14 receipt. |
| S068 | S044 | ToolResponded carries invocationId. Keeping both events is tabi's evidence policy, not a protocol mandate. `w2/LiveS044.md`. |
| S069 | S010 | The page states both browsers shipped in2022; it does not establish “first” ordering. `w2/LiveS010.md`. |
| S070 | S063 | Node's listener/default-termination fact is distinct from tabi's derived shutdown/exit rule. Pin24.21 excludes the later24.22 clarification. `w2/NewS063.md`. |
| S071 | S042 | No declared-inputSchema validation was evidenced for **imperative ExecuteV8Tool**; declarative FormMCPSchema::FillData rejects unknown parameters and invalid supported values. This is source-derived; no full JSON Schema compliance or new runtime measurement. `sources/DeclarativeValidation.md`. |
| S072 | S003 | Old blog URL redirects301 to canonical docs; the body section is The solution: Chrome for Testing, not the navigation title. `w2/LiveS003.md`. |
| S073 | S031 | The editors say Chromium is implementing and will trial a loose proposal, not that this source establishes shipment. `w2/LiveS031.md`. |
| S074 | S034 | Source-file token absence does not by itself establish runtime inertness. `w2/LiveS034.md`. |
| S075 | S054 | Response variability includes nonce and embedded experiment flags; it is not solely a nonce. Article semantics/155 deprecation remain as scoped. `w2/LiveS054.md`. |
| S076 | S018 | TableV is printed100/PDF9, §III.C printed95/PDF4, §V.A printed98/PDF7, correcting earlier page numbers. `w2/LiveS018.md`. |

Pointers abbreviated `w2/` or `sources/` in this section resolve beneath `.ufo/waves/round-18/`.
All twelve rows were opened 2026-10-20 and their full Gate URLs/quotes/digests are in the
round-18 lesson. The old rows remain historical under append-only SOURCES rules.

Other receipt-note corrections: S007's Chromium wrapper and webSocketUrl passages are in the
introduction, not the two named subsections; S051 has a version panel (last updated2.48.0,
no changes2.48.1→2.56.0), with tagged adoc supporting the2.56 anchor; S012's source-move note
already existed2026-09-23; S043 reuses the prior sentence with newly raw-markup spelling, not
a new sentence; S034 status is line7035; S036's no-toolsRemoved description is navigation-scoped,
not explicit-unregister behavior. S051's other exit statuses and several teaches clauses sit
outside the short excerpt. S025's “before asserting by role” is tabi application, not APG wording.

S001's branding qualifier comes from S028; the code also has desktop-OS guards (branding is
necessary, not sufficient). S030's specification exclusion is at its pinned revision, not
forever. S046's no-consent interpretation is tabi's evidentiary limit, not quoted editor text.
S051/S052's anchor cells in §3 were abridged too, despite the earlier three-row abridgement list.
For Gitiles, receipt hashes are base64 carrier hashes while source anchors can hash decoded bytes.
`quoteOffset` is normalized-character offset, not raw byte offset.

The first producer's `command` is an argv display, **not a shell command**: its unquoted
user-agent contains shell punctuation. Literal replay is invalid. Reproduce through the producer
CLI or its actual argv, not `sh -c` on that string. Subsequent regenerated receipts are new fetches;
M1 preserves the original response/producer records in history. Final body-retention checks bind
retained compressed bytes to body SHA/size, decode, offset and excerpt; that is finite evidence
integrity, not authentication of the remote publisher. The current receipt tree and final
measurement record—not the first-snapshot tallies above—are authoritative for final admission.
