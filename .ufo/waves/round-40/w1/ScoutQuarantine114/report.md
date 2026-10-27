# ScoutQuarantine114 — quarantine hand-check, staged ID S114 (tabi lane)

## Row identification
Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` has three rows with id S114 (chousa/round4 line 53, souji/round1 line 171, tabi/round1 line 183). The round-40 staged slice (`.ufo/waves/round-40/assimilation/quarantine-slice`: S102,S106,S109,S110,S111,S114,S117,S118,S124…) matches the tabi lane ids (S111,S114,S117,S118,S124), so the tabi row is evaluated. Other two S114 rows not evaluated.

Row (line 183): `tabi | round1 | S114 | payload-absent | https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf | "achieves better web element identification accuracy compared to naive set-of-marks prompting technique"` (register note: quote in none of the sources).

## Source fetch
- URL: https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf
- Access date: 2026-10-27 (UTC), curl -sSL: HTTP/1.1 200 OK, Content-Type application/pdf, 787690 bytes, Last-Modified Fri 05 Dec 2025, 8 pages; `pdftotext -layout` -> 33115 bytes text. Source actually opened.

## Finding
Passage located in the English Abstract (page 1, text lines 22-24):
"achieves better web element identification accuracy compared to naive set-of mark prompting technique" (quote 16 words).
Exact-string search of the staged quote fails only on the final tokens: staged `set-of-marks`, source `set-of mark` (no second hyphen, singular "mark"). Everything else (prefix "achieves better web element identification accuracy compared to naive") matches verbatim. Elsewhere the paper writes "set-of-mark" (body, line 307) and "Set-of-Mark (SoM)" (Japanese section).

## Classification: partial (passage present; staged quote is a near-verbatim with a wording variance, not a fabrication)
The register's "payload-absent" verdict is a candidate caused by `set-of-marks` vs `set-of mark`; the claim content is present in the cited source. The quote should be corrected to the source wording `set-of mark prompting technique` (or truncated before "set-of").

## Limitations
Text extracted via pdftotext (poppler); PDF layout not visually inspected. Only this row evaluated; no source-repo or corpus edits; no earlier seat summaries used. No tools installed.

Scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine114 removed before yield.

VERDICT finding S114 (tabi) partial: source opened (200, 787690 B), abstract passage present with variance "set-of mark" vs staged "set-of-marks"; not fabrication
