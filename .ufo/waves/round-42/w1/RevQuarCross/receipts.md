# RevQuarCross — independent receipts (re-derived by this seat, 2026-10-28)

Every number below was produced by this seat's own read-only GETs into
`/fast/scratch/hyaku/tabi-r42/RevQuarCross/` (deleted before yield). Nothing here
is copied from a seat's report; seat claims are compared against it.

Scratch commands were of the form:

```
curl -sSL --max-time 60 -o <body> -w 'STATUS %{http_code} URL %{url_effective} BYTES %{size_download} REDIR %{num_redirects}\n' '<url>'
sha256sum <body>
```

## 1. Registered-URL fetches

| id | registered URL | HTTP | bytes (this seat) | sha256 (this seat) | quote hits (exact) |
|---|---|---|---|---|---|
| S102 | chromium.googlesource.com/…/devtools_protocol/README.md | 200 | 25431 | `a11c1f18…caf90c61` (2nd fetch `bef7d902…`) | 0 |
| S102 blob | same `?format=TEXT` | 200 | 18492 b64 → 13868 decoded | `ff07a74e…e02a61` / decoded `07f83a2c…1df9d` | 0 |
| S106 | rfc-editor.org/rfc/rfc9309.txt | 200 | 25265 | `f633915d…6699fb207` | 0 (both) |
| S134 | developer.chrome.com/docs/agents/security | 200 | 111899 or 111895 (bimodal) | per-request (see §3) | 0 / 12 samples |
| S135 | developer.chrome.google.cn/…/best-practices?hl=zh-tw | 200 | 129355 or 129351 (bimodal) | per-request (see §3) | 0 / 5 samples |
| S153 | raw.githubusercontent.com/…/agentic-javascript-tools/guide.md | 200 | 22859 | `7a62b973…0cb507f` | 0 (both) |
| S154 | developer.chrome.com/…/imperative-api?hl=zh-cn | 200 | 180609 or 180605 (bimodal) | per-request (see §3) | 0 / both variants |
| S176 | web-mcp.net/security-guide | 200 | 385056 | per-request (see §3) | 0 (all three spans) |
| S171 | chromestatus.com/features/5117755740913664 | **404** | 207 | `e9639e3c…6237ab80` | n/a (no quote registered) |

## 2. Classification fetches (NOT substituted for registered URLs)

| id | URL | HTTP | bytes | sha256 | what it showed |
|---|---|---|---|---|---|
| S103 | developer.chrome.com/docs/extensions/reference/api/debugger | 200 | 192126 (seat: 192122) | `808613…` | `Last updated 2026-10-05 UTC` count 2, raw index **173886**; sentence "Java is a registered trademark of Oracle and/or its affiliates. Last updated 2026-10-05 UTC." |
| S107 | developer.chrome.com/docs/devtools/agents/webmcp-debugging?hl=zh-tw | 200 | 176236 (seat: 176232) | `08c549a5…` | `使用 WebMCP 時，請注意下列事項` = 2, `確認 WebMCP 工具曝光度` = 2 |
| S156 | zapstudio.dev/webmcp/errors | 301→200 `/docs/webmcp/errors` | 98299 | `d6fbbfda…b695d1b` | `WebMCPNotSupportedError` = 11, first index **6320** (meta description) |
| S177 | developer.chrome.com/docs/web-platform/origin-trials | 200 | 138233 (seat: 138229) | `1c0997e5…` | `Understand origin trials` raw 1; `Third-party origin trials` raw **4** / case-insensitive 5; `origin trial(?!s)` 16 |
| S136 | ai-heartland.com/explain/webmcp/ | 200 | 173587 | `5dca2734…` | **`tools/list` = 5**, `検証環境` = 2 |
| S171 api | chromestatus.com/api/v0/features/5117755740913664 | 200 | 21011 | `82bdbe63…d617ad191` (stable 3/3) | Q2, Q3 exact; Q1 exact through `paths in their UI.` then continues `With WebMCP, agent-service interaction…` |

## 3. Per-request body volatility (this seat's measurements)

Same URL, same minute, repeated GETs:

```
S134  8 fetches: 111899 ×6, 111895 ×2   (all sha256 distinct)
S134  3 fetches with the seat's exact UA: 111899 ×3
S135  8 fetches: 129355 ×6, 129351 ×2
S154 10 fetches: 180609 ×6, 180605 ×4
S107  8 fetches: 176232 ×4, 176236 ×4
S176  5 fetches: 385056 ×5            (all sha256 distinct)
S102  HTML 2 fetches: 25431 ×2         (sha differs; diff is CSP nonce only)
S171  /feature/ 4 fetches: 3710 ×4     (all sha256 distinct)
```

S102 HTML diff, two fetches, only nonce lines differ:

```
- <script nonce="gp//dqYg3MbaXElzgKMQhj1ugZx8HS">
+ <script nonce="rQ39wWRQITDI9/lkjK7sEKSI6+bZIo">
```

S176 diff (h1 vs h3): differs only in Cloudflare email obfuscation tokens
`data-cfemail="f199…"` vs `data-cfemail="f69e…"`; 385056 B both.

S134 4-byte delta is real content variance inside the devsite script, not the article:
`…["MiscFeatureFlags__remove_cross_domain_tracking_params","Profiles__enable_completeco…`
vs `…["DevPro__enable_code_assist","Cloud__enable_cloudx_experiment_ids…`.

Deterministic sources (2 fetches each, identical sha256 both times):
rfc9309.txt, the S153 raw guide, zapstudio /docs/webmcp/errors, chromestatus api/v0.

## 4. Quote-absence samples

- S134 `評估測試和偵錯`: 0 hits in 12 body samples (raw and HTML-unescaped). `評估`, `偵錯`,
  `測試` each 0. Page `lang="en"`; h2 set is English (Build safer agents … Evaluate your
  agent's vulnerabilities …).
- S135 `tools/list`: 0 hits raw / unescaped / tag-stripped / casefold in 5 samples.
  `工具` 45, `tools` 14 raw (17 casefold), `list` 18 raw (23 casefold).
- S153: CJK character count in the guide = 0; version strings present are Chrome 154/155/156;
  the literal string `153` does not occur anywhere in the file.
  `retrieve an array of` = 1 (the nearest English sentence the seat cites).
- S154: `Error` = 0 and `NotSupported` = 0 in **both** the 180605 and 180609 variants.
  `从 Chrome 153 开始` = 1.
- S176: `origin trial` / `Understand origin trials` / `Third-party origin trials` = 0;
  the token `trial` (any case) = 0; `requestUserInteraction` = 16.
- S102: `Last updated`, `2026-10-05`, `UTC`, `2026` each = 0 in the decoded markdown;
  291 newlines; first line `# Chrome DevTools Protocol contribution guidelines`.
- S106: 607 lines; 3 non-ASCII code points only — `U+FEFF` at 0 and `ü` at 24946 / 25213,
  both inside `CH-8002 Zürich` author addresses. Line 100 = "These rules are not a form of
  access authorization."; 395–396 and 402 match the seat's citations.

## 5. S135 cross-binding evidence (census, read-only)

`quote-lint-full-v5.json`, tabi S135 `ABSENT` record, `line` field begins:

```
| S136 | WebMCPとは｜Chrome 149・Edge 150で始まった仕様 — ai-heartland.com — …
```

and `merge/tabi/SOURCES.append.md:41` gives S136's anchor as `§"検証環境" and §"tools/list"
sections`. This seat fetched that page: `tools/list` = 5. Sibling rows with the same
census pattern (S154→`| S156 |`, S153→`| S154 |`, S134→`| S135 |`, S106→`| S107 |`,
S102→`| S103 |`, S176→`| S177 |`) were all classified **misbound** by their seats.

## 6. Scope compliance checks

- `find /home/vgpnk/Projects/shokuknow -newermt '2026-10-28 11:00'` → only `.git` (no file writes).
- `/fast/scratch/hyaku/tabi-r42/` contains no `QuarR42*` scratch dirs (all four seats cleaned up).
- No pacman/install attributable to these seats: `/home/vgpnk/.local/bin/omp` 10:50,
  `OpenBot-0.52.1…AppImage` 11:42, pacman log activity 11:43 — all before wave dispatch
  (`claims.json` 12:01, `w1-dispatch.json` 12:20). This seat ran no pacman and installed nothing.
- Slice coverage: `quarantine/slice-ids.txt` = 38 ids; 38 `evidence-S*.txt` files across
  `QuarR4201..QuarR4219`; no duplicate ids, no missing ids, minimum evidence size 1777 B
  (frozen checker r4 thresholds: enum membership, ≥200 B evidence).
