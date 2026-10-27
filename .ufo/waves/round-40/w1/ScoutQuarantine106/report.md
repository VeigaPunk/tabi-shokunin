# ScoutQuarantine106 — quarantine hand-check, staged ID S106

Seat: leaf, judged on coverage, milestone quarantine. Read-only on shokuknow; nothing adopted, nothing edited there.
Tooling: none installed (RULES.md read: /home/vgpnk/.omp/agent/RULES.md; no install needed; pacman not run).

## Register row (confirmed, read-only)
File: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md line 179:

`| tabi | round1 | S106 | payload-absent | https://www.rfc-editor.org/rfc/rfc9309.txt | `使用 WebMCP 時，請注意下列事項`<br>`確認 WebMCP 工具曝光度` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

- Staged URL: https://www.rfc-editor.org/rfc/rfc9309.txt
- Class: `payload-absent`
- Register has no anchor column; quotes are the two Chinese strings above.

## Cross-check against the lane's own staging (read-only, context only)
/home/vgpnk/Projects/shokuknow/lanes/tabi/SOURCES-PROPOSED.md, "Gate — S106" (lines 45-49): URL same RFC 9309, accessed 2026-10-23, quotes
- §1: "These rules are not a form of access authorization."
- §2.3.1.3: "then the crawler MAY access any resources on the server"
- §2.3.1.4: "the crawler MUST assume complete disallow"

The two register quotes (`使用 WebMCP 時，請注意下列事項`, `確認 WebMCP 工具曝光度`) are not S106's gate quotes. They are section headings cited in "Gate — S107" (webmcp-debugging?hl=zh-tw). So the register row pairs S106's URL with S107's quote text. This is a register/quote-census attribution mismatch, not evidence that S106's own staged quotes are fabricated.

## Fetch
- URL: https://www.rfc-editor.org/rfc/rfc9309.txt
- Access date: 2026-10-27 (UTC), `curl -L`, HTTP/2 200, content-type text/plain;charset=utf-8, etag W/"25cf63a95f77e90b5d9b4e9f878e9951"
- Bytes: 25265, sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 (repeated fetches both 25265 bytes)
- Document: RFC 9309 "Robots Exclusion Protocol", September 2022. Genuine full text opened.

## Quote search (python `in` on UTF-8 text, plus whitespace-normalised)
| quote | found |
|---|---|
| `使用 WebMCP 時，請注意下列事項` | no (0) |
| `確認 WebMCP 工具曝光度` | no (0) |
| `WebMCP` anywhere | no (0) |
| (staged S106 gate) "These rules are not a form of access authorization." | yes, §1 Introduction, 1 occurrence |
| (staged S106 gate) "then the crawler MAY access any resources on the server" | yes (whitespace-normalised) |
| (staged S106 gate) "the crawler MUST assume complete disallow" | yes (whitespace-normalised) |

The RFC contains only 2 non-ASCII characters (BOM and one other); no Chinese text at all.

## Classification (this row only)
**absent (register quotes against the cited source)**: the actual cited source was successfully opened (HTTP 200, 25265 bytes) and the exact quoted strings are absent. Attribution: the quotes belong to S107's page, not S106, so the defect is a mis-attributed row in the register/census, and S106's own staged quotes (§1, §2.3.1.3, §2.3.1.4) are present in RFC 9309. Not unreachable; not partial.

## Limitations
- I did not fetch the S107 Chrome page to confirm those headings exist there (outside assigned source; only the staged S107 gate text was read as context).
- No located ≤25-word quote supports the register's quotes; located quotes shown above are the staged S106 ones.
- Earlier seat summaries not used as evidence. Scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine106 removed on exit.

VERDICT finding S106: register quotes absent from opened RFC 9309 (25265 B, 2026-10-27); they are S107 headings mis-attributed to S106; S106's own staged quotes present
