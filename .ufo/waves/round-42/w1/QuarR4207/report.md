# QuarR4207 — quarantine re-adjudication S131, S133 (tabi round2)

Axes: source fidelity (registered URL and quote, not a substitute), fetch integrity (status, bytes, sha256, final URL), verdict discernment (present / absent / misbound / partial / unreachable), evidence completeness.

Lane cell `tabi`, round cell `round2`. Other S131/S133 rows in the register (souji, tameshi) were not evaluated. No tools installed. Pacman not run. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4207` removed. No writes under `/home/vgpnk/Projects/shokuknow`.

## S131 — misbound

Register line 190 (`absent-defect-register.md`):

`| tabi | round2 | S131 | payload-absent | https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja | WebMCP のユーザー ジャーニー / 重要なユーザー ジャーニー （CUJ）をサポートするために提供できるツールの推奨事項を示します |`

Fetch of the registered URL (2026-10-28):

```
curl -sSL -D s131.hdr -o s131.body -w 's131_http=%{http_code} s131_url=%{url_effective} s131_size=%{size_download} s131_redir=%{num_redirects}\n' --max-time 60 'https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja'
s131_http=200 s131_url=https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja s131_size=102822 s131_redir=0
sha256 c0a8114b3e45bb0323d2e0d9e89c7e7d4abe44a07ed763846c3a9a94e1761ff7
Last-Modified: Tue, 09 Jun 2026 07:00:00 GMT
```

Neither span is in that body (exact and whitespace-normalized indexes −1; `ジャーニー`/`CUJ`/`推奨事項` counts 0). The blog's own Gate — S131 sentences are present: "Chrome 149 では、 WebMCP オリジン トライアルに登録できます" and "オリジン トライアルは、試験運用版のプラットフォーム機能への早期アクセスを提供する期間限定のプログラムです。"

The staged spans are S132's anchor and gate (`lanes/tabi/round2/SOURCES-PROPOSED.md`). `quote-lint-full-v5.json` checks them against S131's URL and sets `line` to the S132 table row. Classification fetch, not a substituted citation:

```
curl -sSL ... 'https://developer.chrome.com/docs/ai/webmcp/use-cases?hl=ja'
HTTP 200, 0 redirects, 149703 bytes, sha256 b0c52c7f9b96ca1c3d500890fe120894382eac1b3fe484458267ad073bcf2bdb
```

Quote 1 is exact in that HTML at offset 68278 as the nav label `<span class="devsite-nav-text" tooltip>WebMCP のユーザー ジャーニー</span>` (article h1 is the different string "ユーザー ジャーニーにおける WebMCP の役割"). Quote 2 is not a raw contiguous match because of `<em>`: `…説明し、<em>重要なユーザー ジャーニー</em>（CUJ）をサポートするために提供できるツールの推奨事項を示します。` After tag-strip and whitespace collapse it is present. Surrounding sentence: "このプロセスをユーザーとエージェントの視点から説明し、 重要なユーザー ジャーニー （CUJ）をサポートするために提供できるツールの推奨事項を示します。 重要な用語: CUJ は、必要なコンテキストを含め、ユーザーが目標を達成するためのパスを定義します。"

Delta vs r40 (absent, sha256 `17e5814eb48fe366e0350b0f38d33d94fc9fb60425f604d9645a87a5dfca0741`, same 102822 bytes, same Last-Modified): the digest moved; the body contains one per-response `nonce="J5OjdBZ2wysaq1JE5dZOYD2oLQU4n9"` (also the CSP nonce). r40's body was deleted, so this is not a line diff. The staged quotes are still absent from the cited blog (same zero token counts). They did not appear on that URL today. The verdict changes because S132, which r40 did not open, holds both spans.

## S133 — misbound

Register line 191:

`| tabi | round2 | S133 | payload-absent | https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja | Agent security considerations for WebMCP |`

```
curl -sSL -D s133.hdr -o s133.body -w 's133_http=%{http_code} s133_url=%{url_effective} s133_size=%{size_download} s133_redir=%{num_redirects}\n' --max-time 60 'https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja'
s133_http=200 s133_url=https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja s133_size=162162 s133_redir=0
sha256 de17559ca5937af21817bfb153f989e99f8919134cec6709d9d19d2999d13493
Last-Modified: Tue, 19 May 2026 07:00:00 GMT
```

Exact and normalized indexes of the English title: −1. Page title/h1: "Evals を使用して WebMCP をテストする". S133's own gate text is on the page, including "1 つの入力から、精度が異なる数千もの回答が得られる可能性があります。このテスト手法は、評価（eval）と呼ばれます。"

The staged string is S134's row title and anchor. Census `line` for this absent quote is the S134 table row. Classification fetch:

```
curl -sSL ... 'https://developer.chrome.com/docs/agents/security'
HTTP 200, 0 redirects, 111895 bytes, sha256 009a51c245a6986be4dbb01556538c2edfff82fff08929f4db3bf6a164c43f21
```

Exact at offset 7677 and as the h1: `<title>Agent security considerations for WebMCP &nbsp;|&nbsp; AI in Chrome &nbsp;|&nbsp; Chrome for Developers</title>` and `<h1 class="devsite-page-title"> Agent security considerations for WebMCP`. The ja twin (`?hl=ja`, 200, 118722 bytes, sha256 `67db62ad5a9edcf8ed25c775d263a90cf5a90a1e8dded0db9ee0e173f1f94795`) titles the page "WebMCP のエージェント セキュリティに関する考慮事項" and does not contain the English string. That twin is not the registered S134 URL.

Delta vs r40 (absent; 200, 162162 bytes, Last-Modified Tue, 19 May 2026; sha256 discarded with scratch): byte count and Last-Modified match; the English string is still absent from the evals page. r40 inferred a sibling security page and did not fetch it. Today the registered S134 English page has the string as title and h1. The evals article did not gain it.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4207/evidence-S131.txt`
- `.ufo/waves/round-42/w1/QuarR4207/evidence-S133.txt`
- receipts: `s131.body` `s131.hdr` `s133.body` `s133.hdr` `s132.body` `s132.hdr` `s134.body` `s134.hdr` `s134ja.body` `s134ja.hdr`

## Limitations

Static HTML only. Quote 2 of S131 matches S132 only after tag-stripping (`<em>`). Quote 1 of S131 on S132 is the shared docs nav label, not the article h1. S133's English string was not searched on every Chrome docs URL, only the registered page plus the S134 URL the census line and SOURCES row name. Souji and tameshi rows with the same ids were not opened.

VERDICT finding S131 misbound to S132 (absent from the cited origin-trial page); S133 misbound to S134's title (absent from the cited evals page)
