# ScoutQuarantine145 — quarantine hand-check, staged ID S145

Milestone: quarantine. Judged on: coverage. Leaf, no spawns, no source-repo edits, no tool installs (RULES.md read: 2026-10-19 tooling directive; nothing installed; pacman untouched).

## Row located (source register, read-only)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`, line 200 (table `## Rows`):

| lane | round | id | class | cited source | quote(s) |
|---|---|---|---|---|---|
| `tabi` | round3 | S145 | `payload-absent` | https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt | `Common CSRF weaknesses and protection mechanisms` ; `Limitations of SameSite` |

Note column: "cited source, companion URLs and local artifacts were all checked; the quote is in none of them".

Disambiguation: the same register also has, in the "never checked" table (line 338), a different lane row `kumitate | round5 | S145\`` (cited https://github.com/VeigaPunk/ufo-fsd-alpha, "could not be fetched, so no quote was checked"). That is a distinct row with no quote and a malformed id (trailing backtick); the task asks for the confirmed staged URL/anchor/quote/class, so I classified the tabi round3 data row (the only row with URL + quotes + class). The kumitate row was NOT fetched/classified (GitHub repo not in my assignment; an unreachable-source row has no quote to check). If Main meant the kumitate row, that is a separate evaluation.

## Fetch
- Command: `curl -sS -L -o d13.txt -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}\n' <URL>` in scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine145/`
- Output: `http=200 bytes=146976 url=https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` (no redirect)
- Access date: 2026-10-27 (UTC, `date -u +%F`)
- sha256: `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`
- Source identity: header "HTTP / Internet-Draft / Obsoletes: 6265 (if approved) / S. Bingler, M. West, J. Wilander / Expires: 18 May 2024 / 15 November 2023"; has Table of Contents, ends at [Page 66] with "Authors' Addresses" (line 3628) — document is complete, not truncated.

## Quote search (exact observed)
- `grep -n -i 'Common CSRF\|Limitations of SameSite\|CSRF weakness'` → 0 matches (count 0 for both phrases, case-insensitive).
- `grep -n -i 'weakness\|limitation\|protection mechanism'` → only unrelated hits (lines 2363/2473/2477 "implementation limitations", "limitations on cookies").
- Table of Contents (lines ~94-202): no entry containing "Common CSRF", "weaknesses", or "Limitations of SameSite". Closest ToC entries: `8.5 Weak Confidentiality`, `8.6 Weak Integrity`, `6.1 Limits`.
- Closest real content (does not contain the quoted strings): §8.8 "SameSite Cookies", §8.8.1 "Defense in depth" (lines 2811-2828: "SameSite cookies offer a robust defense against CSRF attack when deployed in strict mode… prudent to ensure that this designation is not the extent of a site's defense against CSRF"), §8.8.2 Top-level Navigations, §8.8.3 Mashups and Widgets, §8.8.4 Server-controlled, §8.8.5 Reload navigations, §8.8.6 unsafe-method top-level requests. Also §5.4.7 (line ~1775-1807) discusses Lax vs CSRF limits in prose, no such heading.
- Both quoted strings appear heading-like (likely a different document, e.g. an OWASP/MDN/other-draft section title); they are absent from this cited URL.

## Classification
**absent / fabrication-candidate-confirmed for this row**: the actual cited source was successfully opened (HTTP 200, full 146,976-byte, 66-page document) and neither quoted passage occurs in it under case-insensitive exact search. Located quote: none (nothing to quote ≤25 words). Section: none; nearest is §8.8.1 "Defense in depth" (a differently worded passage, not a match).

## Limitations
- Exact (case-insensitive) substring match only; I did not apply the register's eleven folds or the companion URLs/local artifacts (outside assignment); wording variants beyond the keywords "CSRF weakness", "limitation", "protection mechanism" were not exhaustively enumerated, though the ToC check covers heading-style quotes.
- Only the `-13` text version at the cited URL was checked; other draft revisions (e.g. later -14+) were not fetched and might contain such headings, but the row cites -13.
- Kumitate S145 row not evaluated (see above).
- Earlier seat summaries not used as evidence. Scratch deleted before yield.

VERDICT finding S145 (tabi round3, draft-ietf-httpbis-rfc6265bis-13): source fetched OK (200, 146976 B); quotes "Common CSRF weaknesses and protection mechanisms" and "Limitations of SameSite" ABSENT -> absent/fabrication (not unreachable)
