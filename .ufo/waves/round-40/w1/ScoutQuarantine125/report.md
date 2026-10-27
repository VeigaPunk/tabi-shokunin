# ScoutQuarantine125 — quarantine hand-check, staged ID S125

Judged on: coverage. Milestone: quarantine. Leaf member, no edits to source repo/corpus, no package content adopted.

## Row identification
Register: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`.
`grep S125` returned two data rows because the ID is reused across lanes:
- line 56: lane `chousa`, round6, S125 (gcpunion.org .doc) — NOT this seat's row.
- line 187 (the tabi lane; S124/S126/S130/S131 neighbours are the tabi rows listed in `assimilation/quarantine-slice`): **this seat's row**:

`| tabi | round2 | S125 | payload-absent | https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt | "Rate limits for the REST API" <br> "About secondary rate limits" | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

Anchor: none staged. Class staged: `payload-absent`. Decision for the lane choice: the tabi lane is the one that is the tabi-shokunin wave's lane; the chousa S125 row was not evaluated (limitation).

## Source fetch
- URL: https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt
- Access date: 2026-10-27T19:33:29Z (UTC)
- Command (scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine125`): `curl -sS -L -m 60 -D h.txt -o d.txt -w '%{http_code} %{size_download} %{url_effective}\n' <URL>`
- Output: `200 146976 https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`; content-type text/plain; content-length 146976; last-modified Wed, 15 Nov 2023 20:05:12 GMT; sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`.
- Document opened: header reads "Cookies: HTTP State Management Mechanism, draft-ietf-httpbis-rfc6265bis-13" (S. Bingler, M. West, J. Wilander; expires 18 May 2024). Full text, TOC present (e.g. line 163 `8.8. SameSite Cookies`; section 8.8 at line 2811).

## Quote search (whole document, 146976 bytes, case-insensitive grep -c)
| needle | matches |
|---|---|
| `Rate limits for the REST API` | 0 |
| `About secondary rate limits` | 0 |
| `rate limit` | 0 |
| `REST API` | 0 |
| `secondary rate` | 0 |
| `GitHub` (control: text is non-empty and searchable) | 129 |

`grep -n -i "rate limit\|secondary"` returned nothing. Neither quoted passage, nor any rate-limit phrase, exists anywhere in the cited document. No located quote (none to record).

## Classification: absent/fabrication (payload-absent confirmed for this row)
The actual cited source was successfully opened (HTTP 200, full 146,976-byte plain-text draft) and both exact quotes are absent. Observation from register text only (not fetched by me): the quoted strings are headings of the GitHub REST rate-limits page, which is the cited URL of the adjacent register row S126 (docs.github.com/.../rate-limits-for-the-rest-api), while S124's quote contains a `§8.8 (SameSite Cookies); draft-13` fragment that belongs to the rfc6265bis source — suggesting quote/URL misalignment between adjacent rows S124/S125/S126 rather than text missing from a correct source. That is inference, not verified; the row as staged (this URL + these quotes) is a mismatch and should be corrected or refused.

## Limitations
- Only the assigned URL was fetched; I did not fetch docs.github.com (out of assignment), so the misalignment hypothesis is unverified.
- Quote match used literal and case-insensitive substring search on the plain-text draft; no fold variants beyond case. The phrases are English headings, unambiguous, and absent even as sub-terms ("rate limit": 0).
- The same-ID chousa row (line 56) was not evaluated.
- Scratch dir deleted before yield. No tools installed (RULES.md read; pacman not used).

Report: .ufo/waves/round-40/w1/ScoutQuarantine125/report.md

VERDICT finding S125 (tabi round2, rfc6265bis-13 URL) payload-absent confirmed: source opened 200/146976 B, both quotes absent (0 matches incl. "rate limit"); likely quote/URL row misalignment with S126 (unverified)
