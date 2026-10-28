# QuarR4204 — quarantine re-adjudication S117, S118

Seat report and evidence: `.ufo/waves/round-42/w1/QuarR4204/report.md`, `evidence-S117.txt`, `evidence-S118.txt`. Access date 2026-10-28. Register lines 184–185, lane tabi, round1. No tools installed. No git mutation. shokuknow not written.

## S117 — misbound

Registered URL `https://webmachinelearning.github.io/webmcp/` (no anchor). Staged quote: `User awareness`.

`curl -sSL` → HTTP 200, 0 redirects, final URL unchanged, 536093 bytes, sha256 `2d773eb9f0cd0579f1e7ef5b2ebd96c16d2d754baf38117c1051e4435a49a845`, Last-Modified Tue, 27 Oct 2026 11:43:25 GMT, `date: Wed, 28 Oct 2026 15:36:55 GMT`, meta-revision `6838130ef3e930c8e1a9f98375c13d9133d61aba`. Exact, case-insensitive, whitespace-normalized, and tag-stripped searches: `User awareness` 0, `awareness` 0, `infobar` 0. Page is "Draft Community Group Report, 27 October 2026".

The phrase is the §2.3 run-in of registered row S118, confirmed in today's PDF extract: "User awareness. When a debugging extension successfully attaches to a target, Chromium notifies users by rendering an infobar across all open browser tabs [74] as shown in Figure 2."

Delta vs r40 "absent as staged": no live-byte change (same sha256). Label is misbound because the quote belongs to S118, not because the WebMCP page changed.

## S118 — present

Registered URL `https://arxiv.org/abs/2305.11506`. Quotes: `User awareness`; `Chromium notifies users by rendering an infobar across all open browser tabs`; `User awareness`.

Abs fetch: HTTP 200, 0 redirects, 43266 bytes, sha256 `2a18e1490de5ffda080e1c9698502f8b42b6892186ad2566f7b8fc8955a20e32`, Last-Modified Mon, 24 Aug 2026 21:28:44 GMT. Both strings 0 hits on the HTML (title "Chrowned by an Extension…"). Not a 404.

PDF of the same id, not substituted as the registered URL: `https://arxiv.org/pdf/2305.11506` HTTP 200, 563856 bytes, sha256 `e8131e4ec1e694c3c3d168553bd05688f663b76e244fd94416a972ee9739d469`, filename `2305.11506v2.pdf`, Last-Modified Sat, 03 Jun 2023 00:05:59 GMT, pdfinfo 15 pages (`file(1)` wrongly said 3). Whitespace-collapsed pdftotext has the infobar sentence once, inside §2.3 "The Debugger extension API":

> User awareness. When a debugging extension successfully attaches to a target, Chromium notifies users by rendering an infobar across all open browser tabs [74] as shown in Figure 2.8 This notification will not go away until there are no attached debuggers left.

Collapsed counts: "User awareness" 1, "User Awareness" 1, "user awareness" 2. The register's repeated `User awareness` is that one run-in.

Delta vs r40 "present in arXiv PDF §2.3": no live-byte change. Abs and PDF hashes match r40. The payload-absent note is true only of the abs HTML.

VERDICT finding S117 misbound (quote absent from the cited WebMCP page, byte-identical to r40; the phrase is S118 §2.3); S118 present in arXiv 2305.11506 PDF §2.3 (abs HTML still lacks it; PDF bytes unchanged vs r40)
