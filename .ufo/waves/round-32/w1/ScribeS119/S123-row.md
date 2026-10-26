# Draft registry row S123 (supersedes S119)

Append as the last row of `## Registry` in `corpus/SOURCES.md`, immediately after S122 and before `## Paths`.
Eleven cells (`NF=13` when split on `|`), no `|` inside a cell. Do not edit S119 in place (SOURCES contract v1
rule 2; `CORPUS.md` "Corrections are new entries, never rewrites").

```markdown
| S123 | Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.txt | spec | A | The RFC's own publication month and the fetch-result spans a journey driver's robots.txt decisions rest on: redirect bound, unavailable and unreachable outcomes, cache lifetime and parse size | RFC 9309 (September 2022; header line 11 of the fetched plain text, with June 2022 only in its RFC 9110/9111 reference entries at lines 554 and 559), §2.3.1.2 "Redirects" lines 373-385 (five consecutive redirects at 377-378), §2.3.1.3 "Unavailable" Status lines 387-396 (400-499 at 392), §2.3.1.4 "Unreachable" Status lines 398-408 (500-599 at 403, 30 days at 406), §2.4 "Caching" lines 415-420 (24 hours at 419), §2.5 "Limits" lines 422-425 (500 kibibytes at 425); re-fetched 2026-10-26T16:02:28Z, 25265 B, sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 (byte-identical to the S119 receipt) | supersedes S119 — the bytes are dated September 2022 at header line 11, not June 2022, which occurs only inside the RFC 9110 and RFC 9111 reference entries at lines 554 and 559; every span the S119 anchor cites re-locates unchanged in the same bytes (sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207, 25265 B), so the supersession moves the publication month and no threshold | mined | 2026-10-26 | 365d | corpus/knowledge/rate-signal-decision-table.md |
```

Cell-by-cell, in registry order:

| # | cell | value |
|---|---|---|
| 1 | id | `S123` (next unused; S122 is the current last row — `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` = 122 at `4181fffb`) |
| 2 | source | `Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.txt` (same URL as S119; accepted only because cell 7 opens `supersedes S119 —`, `scripts/check-sources.mjs:296-298`) |
| 3 | kind | `spec` |
| 4 | tier | `A` (primary/authoritative for this scope: the RFC's own bytes) |
| 5 | scope | the publication month plus the five fetch-result spans a driver decides from — not the whole RFC |
| 6 | anchor | section/line map with revision (September 2022) and the fetch identity: UTC, bytes, sha256 |
| 7 | teaches | opens `supersedes S119 —`; states the date finding, why June 2022 is there, and that no span moved |
| 8 | status | `mined` (the decision table cites it) |
| 9 | opened | `2026-10-26` (this round; the row's author fetched the bytes at 16:02:28Z) |
| 10 | recheck | `365d` — the value S119 and S120 already carry, so the superseding row cannot reintroduce the 180d/365d split |
| 11 | used-by | `corpus/knowledge/rate-signal-decision-table.md` (the errata paragraph appended below cites S123; the counter's `used_by_uncited` check reads the file for the literal `S123`) |

## What the row may and may not claim

- `kind`/`tier`/`status`/`recheck` are unchanged from S119 by intent: the supersession corrects a datum, it does
  not re-grade the source.
- The row does **not** re-admit any number. The five thresholds the entry's D1–D5 use are S119's, and the new row
  says they re-locate unchanged in the same bytes; if a future re-fetch changes any of them, that is a new row.
- No receipt is required for S123 under `scripts/check-decision-table.mjs`: no table row's `Source` cell names it
  (`g1-receipt` is checked per cited row). The fetch receipt is kept for the Gate instead
  (`.ufo/waves/round-32/w1/ScribeS119/receipt.md`, bytes under `bytes/`).
