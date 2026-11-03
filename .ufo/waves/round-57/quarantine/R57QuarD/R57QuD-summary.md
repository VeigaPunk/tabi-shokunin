# R57QuD summary — QUARANTINE hand-check part D (8 rows)

Rows: `S164 S165 S166 S167 S174 S175 S176 S171` (slice lines 31-38).
Disposition: **ADOPT NOTHING** — verdict receipts only.
Full report: `.ufo/waves/round-57/quarantine/R57QuD.md`.

| id | register class | HTTP | verdict | reason (one line) |
|---|---|---|---|---|
| S164 | `payload-absent` | 200 | mispaired | absent from cited zh-CN page and from its 2026-10-12 archive; byte-present at NEXT row's source S165 (f0 line 141) |
| S165 | `payload-absent` | 200 | mispaired | fragment is anchor prose, not a quotation — byte-exact substring of S166's staged anchor cell; no page carries it |
| S166 | `payload-absent` | 200 | mispaired | `evaluate_webmcp` absent (page has no `evaluate`); byte-present ×4 at NEXT row's source S167 |
| S167 | `payload-absent` | 200 | mispaired | both absent from claude.com; byte-present at NEXT row's source S168 (2 and 1 hits) |
| S174 | `payload-absent` | 200 | mispaired | f1 at NEXT row's source S175; f2 one character off (審核佪列 U+4F6A vs 審核佇列 U+4F47) — the note's typo |
| S175 | `payload-absent` | 200 | mispaired | f2 is S176's anchor text, present on S176's page; f1 is this row's own sentence, 65/66 chars (佪/佇) |
| S176 | `payload-absent` | 200 | mispaired | zero `origin trial` on web-mcp.net; all three fragments at NEXT row's source S177 (39/1/4 hits) |
| S171` | prose: "could not be fetched" | **404** | unreachable (confirmed) | 207-byte 404 body, no WebMCP/tool text; record live on the API route, fields unchanged |

## Key numbers

- 8 rows: 7 `mispaired`, 1 `unreachable`. **0 fabrications.**
- 12 register fragments; 0 located in their cited source under f0-f6; 0 located
  under ANY boundary-tolerant reading either (`altLocates` all false).
- 9 of 12 fragments are byte-present on a *different* cited page; 11 of 12 are
  byte-present in the *next* staged row's anchor cell.
- 20 knowledge-note quotations re-checked: 13 locate under the frozen folds,
  17 under at least one boundary-tolerant reading; 3 locate by no reading
  (S164 page drift, archive-proven; S167 ×2 character substitutions).

## Structural finding

The register's `quote(s)` column is shifted one row: row *N*'s quote is the
staged `SOURCES.append.md` row *N+1*'s anchor text. Reproduces on a read-only
check of all 38 tabi data rows — 30/37 quoted rows entirely, 7 partially
(S111 0/2, S114 0/1, S118 0/3, S124 1/2, S140 0/1, S154 0/1, S175 1/2).
The `payload-absent` class is therefore a pairing artefact for this slice, not
evidence of invented source text.

## Does the quote text appear under `merge/tabi/knowledge/`?

Yes for most fragments: `webmcp-tool-listing-paths-r14.md`,
`webmcp-tool-approval-hints-r14.md`, `webmcp-journey-determinism-r14.md`,
`webmcp-validation-and-confirmation-r15.md`,
`origin-trial-announcement-surface-r15.md`. Only S165's fragment (anchor prose)
appears in no knowledge note.

## S171 (malformed row, checked anyway)

- Cited URL 404 (207 B, `<title>404 Not Found</title>`), no WebMCP/tool text,
  byte-identical on re-fetch. `registerRowMalformed: true` (id cell `S171\``,
  class cell is prose, 5 cells instead of 7).
- Live record, same site: `…/feature/<id>` serves the SPA shell (200, 3,710 B);
  `…/api/v0/features/5117755740913664` → 200 JSON, `"name": "WebMCP"`,
  `browsers.chrome.status.text = "Proposed"`, `origintrial = false`,
  `origintrial = null`, maturity `Specification being incubated in a Community
  Group`, updated 2026-11-02 by fbeaufort@google.com. The note's field quotations
  locate there (f0 / f6), so the class stands on the URL while the fact stands
  on the record.

## Receipts

`S164.json S165.json S166.json S167.json S174.json S175.json S176.json S171.json`
— register + staged cells with line numbers, HTTP measurement, two-fetch hashes
and stability, per-fragment per-fold hit tables, located fold + line/byte,
near-match, cross-row carriers, verdict + reason, note-side recheck, and
`archiveProbe` / `transcriptionError` / `alternateAccess` / `citedUrlBody` /
malformed-row observations. Instruments: `qd-ladder.py`, `build-spec.py`,
`annotate.py`, `qd-fetch.py`.
