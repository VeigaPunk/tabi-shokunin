# QuarR4207 — quarantine re-adjudication S131, S133 (tabi round2)

Full write-up and receipts: `.ufo/waves/round-42/w1/QuarR4207/report.md`, `evidence-S131.txt`, `evidence-S133.txt`.

Axes: source fidelity, fetch integrity, verdict discernment, evidence completeness. No tools installed. Pacman not run. Scratch removed. shokuknow not written.

## S131 — misbound

Registered URL `https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja` fetched 2026-10-28: HTTP 200, 0 redirects, final URL unchanged, 102822 bytes, sha256 `c0a8114b3e45bb0323d2e0d9e89c7e7d4abe44a07ed763846c3a9a94e1761ff7`, Last-Modified Tue, 09 Jun 2026 07:00:00 GMT.

Staged quotes `WebMCP のユーザー ジャーニー` and `重要なユーザー ジャーニー （CUJ）をサポートするために提供できるツールの推奨事項を示します` are absent (exact and whitespace-normalized). `ジャーニー`/`CUJ`/`推奨事項` counts are 0. S131's own gate sentences (Chrome 149 origin-trial enrollment) are on the page.

Those spans are S132's anchor/gate (`https://developer.chrome.com/docs/ai/webmcp/use-cases?hl=ja`, HTTP 200, 149703 bytes, sha256 `b0c52c7f9b96ca1c3d500890fe120894382eac1b3fe484458267ad073bcf2bdb`). Quote 1 is exact nav text at offset 68278. Quote 2 matches after stripping `<em>`. Census `quote-lint-full-v5.json` binds the quotes to S131's URL with `line` = the S132 row.

r40 said absent (same byte count and Last-Modified, sha256 `17e5814e…`). Today's digest differs; the body has one per-response nonce `J5OjdBZ2wysaq1JE5dZOYD2oLQU4n9`. The quotes did not appear on the cited blog. The verdict changes because S132, which r40 did not open, holds them.

## S133 — misbound

Registered URL `https://developer.chrome.com/docs/ai/webmcp/evals?hl=ja`: HTTP 200, 0 redirects, 162162 bytes, sha256 `de17559ca5937af21817bfb153f989e99f8919134cec6709d9d19d2999d13493`, Last-Modified Tue, 19 May 2026 07:00:00 GMT.

`Agent security considerations for WebMCP` is absent (exact and normalized). Page title is `Evals を使用して WebMCP をテストする`. S133's own eval gate sentence is present.

The string is S134's title and h1 on `https://developer.chrome.com/docs/agents/security` (HTTP 200, 111895 bytes, sha256 `009a51c245a6986be4dbb01556538c2edfff82fff08929f4db3bf6a164c43f21`), exact at offset 7677 and in `<h1>`. Census `line` is the S134 row. The ja twin does not contain the English string.

r40 said absent (same byte count and Last-Modified; sha256 discarded). The evals page still lacks the English title. r40 did not fetch the sibling; today S134's English page has it verbatim. The evals article did not gain the string.

VERDICT finding S131 misbound to S132 (absent from the cited origin-trial page); S133 misbound to S134's title (absent from the cited evals page)
