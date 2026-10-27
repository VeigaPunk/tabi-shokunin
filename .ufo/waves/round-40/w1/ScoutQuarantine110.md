# ScoutQuarantine110 — quarantine hand-check, staged ID S110

## Row identification
Register: /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md (read-only).
`grep -n S110` finds THREE data rows (chousa r3 line 50, tabi r1 line 181, tameshi r1 line 217). This is the Tabi round-40 seat, so I took the `tabi` row; the other two were not evaluated (ambiguity recorded as a limitation).

Row line 181 (verbatim):
`| tabi | round1 | S110 | payload-absent | https://www.rfc-editor.org/rfc/rfc6585.txt | "Add hints to your tools" <br> "Expose your tools carefully" <br> "Last updated 2026-09-01 UTC" | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
- Class: payload-absent. Anchor/section: none staged. Three quoted spans.

## Source access
- URL: https://www.rfc-editor.org/rfc/rfc6585.txt, accessed 2026-10-27 UTC (curl -L, HTTP/2 200, text/plain;charset=utf-8, cf date 19:33:09 GMT).
- Fetched in scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine110/rfc.txt: 17164 bytes (scratch deleted at exit; sha256 printed in command output below).
- Content is RFC 6585 ("Additional HTTP Status Codes", incl. 429 Too Many Requests).

## Quote search (case-insensitive, fixed-string, whole file; plus whitespace-collapsed regex)
- "Add hints to your tools": 0 hits
- "Expose your tools carefully": 0 hits
- "Last updated 2026-09-01 UTC": 0 hits
- "hints": 0; "Last updated": 0; regex add hints|expose your tools|last updated|2026 on whitespace-collapsed text: 0.
Observed commands: curl -sS -L -m 60 -D h.txt -o rfc.txt <URL>; wc -c; grep -c -i -F per quote.

## Classification
**absent/fabrication-from-this-source (row S110 tabi r1)**: the actual cited source was opened successfully (200, 17164 bytes, RFC 6585 text) and none of the three quoted spans occurs in it. The phrases are web-page UI/headings of the Chrome WebMCP docs style (cf. register row S111 tabi, developer.chrome.com/docs/ai/webmcp/secure-tools, which carries "Add hints to your tools"), i.e. the staged URL/quote pairing is mismatched — the quote does not belong to RFC 6585. [INFERENCE on origin; not verified here, I fetched only the assigned URL.]
No quote located, so no <=25-word excerpt.

## Limitations
- Only the assigned URL was fetched; I did not fetch companion URLs, so whether the quotes exist at some other URL (e.g. the WebMCP page) is unverified. The class is per cited URL only.
- Static curl fetch of a plain-text RFC; no JS rendering needed. rfc-editor serves the canonical text; no truncation indicated (Content-Length not shown, 17164 bytes consistent with full RFC 6585).
- Two other S110 rows (chousa, tameshi) not evaluated.
- No tools installed; no pacman; no writes outside scratch and this report. Task text names two report paths (…/ScoutQuarantine110/report.md and …/ScoutQuarantine110.md); I wrote the former (the goal-scope path).

VERDICT finding S110 tabi r1 quote absent from opened cited source rfc6585.txt (17164 bytes, 200); classification absent (source/quote mismatch), not unreachable

Observed: sha256 f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 rfc.txt; grep confirms "RFC 6585 Additional HTTP Status Codes April 2012" and "4. 429 Too Many Requests"; word "tool" occurs 0 times in the file.
