# Round-27 tabi §10 Wave-4 quarantine — reviewer B report

- Reviewer: TabiR27.QuarantineB
- Date of all fetches: 2026-10-25
- Slice: `.ufo/waves/round-27/assimilation/quarantine-slice` (all ten assigned rows are class `payload-absent` in the fleet register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`, lane `tabi`)
- Assigned rows: S126, S130, S131, S133, S134, S135, S137, S138, S140, S142

## Method

- For each row: one plain GET (curl 8.x, `-L`, UA `tabi-r27-QuarantineB-quote-audit`) to exactly the cited public URL. No companion URLs, no retries, no cached bodies.
- Recorded per fetch: HTTP status, body bytes, SHA-256 of the body, final URL (no row redirected).
- Quote check on the fetched bytes only: exact-string search first, then distinctive fragments, then a case-insensitive pass; small sources (S130, S137, S138) additionally read in full.
- Round-22 verdicts and the register's note column were not trusted for any verdict; the register was used only to obtain each row's cited URL and quoted span.
- Verdicts: `present/admit` (quote verified in cited source), `absent/refuse` (source fetched cleanly, quote in none of its recorded variants), `unreachable/unverifiable`.
- Fixtures (raw bodies) in `/tmp/tabi-r27-b/` (throwaway scratch; nothing written to shokuknow, no git/jj writes, no installs, pacman untouched).

## Verdict summary

| id | cited source (host) | HTTP | bytes | quote in source? | verdict |
|---|---|---|---|---|---|
| S126 | docs.github.com | 200 | 337116 | no | **absent/refuse** |
| S130 | raw.githubusercontent.com (chrome-devtools-mcp @ f08dbe15) | 200 | 6541 | no | **absent/refuse** |
| S131 | developer.chrome.com (ja blog) | 200 | 102822 | no | **absent/refuse** |
| S133 | developer.chrome.com (evals ja) | 200 | 162166 | no | **absent/refuse** |
| S134 | developer.chrome.com (/docs/agents/security) | 200 | 111899 | no | **absent/refuse** |
| S135 | developer.chrome.google.cn (best-practices zh-tw) | 200 | 129351 | no | **absent/refuse** |
| S137 | raw.githubusercontent.com (cloudflare/agents) | 200 | 11999 | no | **absent/refuse** |
| S138 | raw.githubusercontent.com (WebMCP-org README) | 200 | 6443 | no | **absent/refuse** |
| S140 | docs.copilotkit.ai | 200 | 227008 | **yes** (normalized) | **present/admit** |
| S142 | rfc-editor.org | 200 | 502941 | no | **absent/refuse** |

## Per-row results

### S126 — absent/refuse
- Source: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Fetch: HTTP 200, 337116 bytes, sha256 `050be21125226425bdc0f81da2fddfa139201c446a5a45407cce38232d6be769`, no redirect.
- Page identity: `<title>Rate limits for the REST API - GitHub Docs</title>`; full article body present inline and read.
- Recorded quotes: `Native messaging` / `Extension side` / `Native messaging host side`.
- Search: zero hits for all three, exact and case-insensitive (`(?i)native messaging` = 0).
- Locator: none exists.
- Reason: the page is exclusively REST rate-limit prose; none of the three Chrome-native-messaging phrases occurs anywhere in the fetched body.

### S130 — absent/refuse
- Source: https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/f08dbe152502d66e75fa07fb2588dc0feb42bc20/tests/tools/webmcp.test.ts
- Fetch: HTTP 200, 6541 bytes, sha256 `2ba8a64378597db7d65b13f2cf63fe692270cd8394852237d08174dc627bd29b`, no redirect.
- File identity: English TypeScript Puppeteer test (`import … from 'node:test'`, `describe('webmcp')`); read in full (whole file).
- Recorded quote: `Chrome 149 では、WebMCP オリジン トライアルに登録できます`.
- Search: zero hits for `149`, `オリジン`, any Japanese text; no origin-trial registration sentence.
- Locator: none exists.
- Reason: cited source is an English test file with no Japanese content; the quoted sentence does not occur.
- Provenance evidence: the identical sentence occurs, as anchor text, in the page cited at **S131** (see below, line 2840) — the S130 quote belongs to S131's source.

### S131 — absent/refuse
- Source: https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja
- Fetch: HTTP 200, 102822 bytes, sha256 `3f9838f6e9ff76c175d77a61eae204c92012a0aa943fe6e54f4b29885a51f3a4`, no redirect.
- Page identity: `<title>WebMCP オリジン トライアルに参加する | Blog | Chrome for Developers</title>`; article body inline (SSR confirmed: body text at lines 2840+).
- Recorded quotes: `WebMCP のユーザー ジャーニー` and `重要なユーザー ジャーニー （CUJ）をサポートするために提供できるツールの推奨事項を示します`.
- Search: zero hits for `ジャーニー`, `ユーザージャーニー`, `CUJ` anywhere in the body.
- Locator: none exists.
- Reason: correct ja page fetched with article inline; neither journey/CUJ phrase occurs.
- Side evidence: line 2840 of this same body contains `Chrome 149 では、<a href="…">WebMCP オリジン トライアルに登録できます</a>。` — verbatim source of S130's recorded quote.

### S133 — absent/refuse
- Source: https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja
- Fetch: HTTP 200, 162166 bytes, sha256 `997bf1eb6d56d72c8a82983079f2a5d14649abcac0d461e8e904e9009232650a`, no redirect.
- Page identity: `<title>Evals を使用して WebMCP をテストする | AI in Chrome | Chrome for Developers</title>`.
- Recorded quote: `Agent security considerations for WebMCP`.
- Search: zero hits for `[Ss]ecurity considerations` in the page.
- Locator: none exists.
- Reason: the ja evals page contains no such English sentence.
- Provenance evidence: the string is the exact `<title>`/og:title of https://developer.chrome.com/docs/agents/security — the URL cited at **S134** (verified in the S134 body fetched for this audit).

### S134 — absent/refuse
- Source: https://developer.chrome.com/docs/agents/security
- Fetch: HTTP 200, 111899 bytes, sha256 `f19a8b843c68cf07420217f7fbc88af28d2c0e6c62793ef718db87634ae4a7e7`, no redirect.
- Page identity: `<title>Agent security considerations for WebMCP | AI in Chrome | Chrome for Developers</title>`; page body is English (`Evaluate your agent's vulnerabilities`, h3 `evaluate_your_agents_vulnerabilities`).
- Recorded quote: `評估測試和偵錯`.
- Search: zero hits for `評估`/`评估` in this page (only English "Evaluate" matches).
- Locator: none exists.
- Reason: the cited page serves English content; the zh-TW phrase does not occur.
- Provenance evidence: `評估測試和偵錯` occurs verbatim as an `<h2 data-text="評估測試和偵錯" id="eval_testing_and_debugging">` in the page cited at **S135** (line 3887 of the S135 body) — the S134 quote belongs to S135's source.

### S135 — absent/refuse
- Source: https://developer.chrome.google.cn/docs/ai/webmcp/best-practices?hl=zh-tw
- Fetch: HTTP 200, 129351 bytes, sha256 `fa6c41ab4cdc31eebdb53b1cf16920f18383a15006a0d0f30a796574ca98c08e`, no redirect (served from the .cn mirror, zh-TW content confirmed: title `WebMCP 最佳做法`).
- Recorded quote: `tools/list`.
- Search: zero hits for `tools/list`; the page mentions `registerTool`, `toolname`, `tooldescription` but never the MCP wire method name.
- Locator: none exists.
- Reason: the zh-TW best-practices page does not contain the string `tools/list`.
- Provenance evidence: `tools/list` occurs in the source cited at **S137** (`tools/list` is called (paginated via `nextCursor`)…), verified in the S137 body fetched for this audit.

### S137 — absent/refuse
- Source: https://raw.githubusercontent.com/cloudflare/agents/main/experimental/webmcp.md
- Fetch: HTTP 200, 11999 bytes, sha256 `41654d530227db4e257137fcaf143b309c8f303bb6882536ca0fa9ebe484b8b7`, no redirect.
- File identity: "WebMCP — Bridging McpAgent Tools to the Browser AI"; read in full (whole file; sections: The Pattern, Why This Exists, How It Works, API, Concurrency, Lifecycle, Composition, Edge Cases, Testing, Related Material, Open Questions).
- Recorded quote: `Run and load`.
- Search: zero hits for `Run and`; case-insensitive `load` = 0 occurrences in the entire file.
- Locator: none exists.
- Reason: the two-word phrase does not occur anywhere in the fetched document.

### S138 — absent/refuse
- Source: https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md
- Fetch: HTTP 200, 6443 bytes, sha256 `4db8d356ade0f6da3f00b8b4bd50bccdfeba7c068142c21fafd4b5ee4d45bbdb`, no redirect.
- File identity: `# @mcp-b/webmcp-extension`; read in full (headings: Install, Set up the extension, Start from the template, Security and scope, Test).
- Recorded quote: `Testing WebMCP tools`.
- Search: zero hits for `Testing`/`<title>`; case-insensitive `testing webmcp` = 0 (the only test heading is `## Test`).
- Locator: none exists.
- Reason: the README contains no "Testing WebMCP tools" heading or sentence.

### S140 — present/admit
- Source: https://docs.copilotkit.ai/webmcp
- Fetch: HTTP 200, 227008 bytes, sha256 `1a55094f939ad9ecb5d550fb52bb0383255693f709a824cb663e4834881add5e`, no redirect.
- Recorded quote: ``The `tools` permissions policy defaults to `self` ; cross-origin iframes also need `allow="tools"` .``
- Search/locator: found at line 99 of the fetched HTML (checklist item), and again in the embedded RSC payload at line 117:
  `Load the app in an <a …>origin-isolated document</a>. The <code>tools</code> permissions policy defaults to <code>self</code>; cross-origin iframes also need <code>allow=&quot;tools&quot;</code>.`
- Deltas vs the recorded string: `<code>`…`</code>` markup in place of backticks (same inline-code span), and the recorded string inserts a space before `;` and before the final `.` which the page does not have. Every word and punctuation mark otherwise matches in order; the page sentence is fully contained in the recorded quote.
- Verdict: **present** — the quoted span is verified in the cited source under inline-code normalization; the payload-absent classification does not hold for the live page as of 2026-10-25. Admit with caveat: if §10 requires a byte-exact substring match with no whitespace normalization, this row would read absent on the two space deltas alone; I judge them transcription artifacts, not invention.

### S142 — absent/refuse
- Source: https://www.rfc-editor.org/rfc/rfc9110.txt
- Fetch: HTTP 200, 502941 bytes, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`, no redirect.
- Page identity: RFC 9110 "HTTP Semantics" (canonical text; `Published specification: RFC 9110` present).
- Recorded quote: `which tool list do I see`.
- Search: zero hits for `tool list` and `do I see`, including case-insensitive `(?i)do i see`.
- Locator: none exists.
- Reason: conversational phrase cannot occur in RFC prose; confirmed absent from the full canonical text.

## Cross-row finding: systematic quote/source rotation

Within the ten fetched bodies (no extra fetches), four recorded quotes were located verbatim in a *different* row's cited source:

| quote recorded at | actually found in | evidence |
|---|---|---|
| S130 `Chrome 149 では、WebMCP オリジン トライアルに登録できます` | S131's cited URL (ja origin-trial blog), line 2840, as anchor text | in-hand |
| S133 `Agent security considerations for WebMCP` | S134's cited URL, as `<title>`/og:title | in-hand |
| S134 `評估測試和偵錯` | S135's cited URL, `<h2 …>` line 3887 | in-hand |
| S135 `tools/list` | S137's cited source, "How It Works" step 2 | in-hand |

The remaining recorded quotes (S126's three native-messaging phrases, S131's two CUJ/journey phrases, S137 `Run and load`, S138 `Testing WebMCP tools`, S142 `which tool list do I see`) were not found in any body I fetched; their true provenance is unresolved [INFERENCE: they most likely belong to other round-2/3 tabi pages not in my assigned set — e.g. a Chrome native-messaging doc for S126, and an agent-tools FAQ for S142 — but I did not fetch beyond cited URLs].

This pattern is consistent with a quote/citation misalignment introduced in the corpus-expansion census rather than nine independent fabrications; the per-row verdicts above remain quote-vs-cited-source facts.

## S171 (context item, not assigned to me)

The fleet register's "never checked" section lists tabi round5 S171 (cited source https://chromestatus.com/features/5117755740913664) as unreachable — "the cited source could not be fetched, so no quote was checked". I did not fetch it (not in my assigned rows). Per §10 it stays **unreachable/unverifiable — not fabricated**; converting it would be an error.

## Installs

None. No pacman transactions, no tool installs or updates.

## Residual risk and verification gaps

- Single fetch per row at 2026-10-25; pages are live documents (developer.chrome.com and docs.copilotkit.ai change without versioning), so S140's "present" and the others' "absent" describe the fetched snapshots, not an invariant. Bodies + hashes above make the snapshots reproducible.
- S140 is the only judgment call: present under inline-code normalization; byte-exact matching with the two recorded space deltas would flip it. Flagged explicitly rather than hidden.
- Quote search was exact + fragment + case-insensitive on the cited URL only, per assignment; companion URLs and lane-local artifacts were deliberately not consulted, so a quote could still exist in a companion the census intended. That would change provenance, not the per-row cited-source verdicts.
- docs.github.com embeds large nav/JSON payloads; the full article body was read and the three phrases are absent from it, but I did not enumerate every embedded JSON string beyond the phrase searches (which covered the whole body).
- Provenance of the five unlocated quotes is unresolved (see rotation section); settling it needs fetches outside my assignment.
