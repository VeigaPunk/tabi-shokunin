# ScoutQuarantine124 — quarantine hand-check, staged ID S124

## Row located (read-only register)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 186 (the `tabi` lane row; the register also has same-ID rows for `souji` line 173 and `tameshi` line 220 — not this seat's lane; the staged tabi slice lists S118,S124,S125,S126,S130):
`| tabi | round2 | S124 | payload-absent | https://www.rfc-editor.org/rfc/rfc9110.txt | Q1 "Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable) status code"<br>Q2 "enforcement), §8.8 (SameSite Cookies); draft-13 | Default enforcement is" |`
Anchor: no URL fragment; lane source row (`lanes/tabi/round2/SOURCES-PROPOSED.md` line 49) cites §15.4, §15.4.4, §15.4.7, §10.2.3. Line 55 gives the quote "Retry-After can be used with a 3xx ... status code" for §10.2.3.

## Source opened
- URL https://www.rfc-editor.org/rfc/rfc9110.txt, access date 2026-10-27 (UTC), `curl -L` → HTTP 200, 502941 bytes, saved in scratch `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine124/rfc9110.txt` (deleted at end). Source successfully opened in full.
- Whitespace-normalised, case-insensitive search: Q1 full string 0 hits; "Retry-After can be used" 0; Q2 string 0; "SameSite" 0; "draft-13" 0; "Default enforcement" 0.

## Findings
- Q1: verbatim string absent. Substance present at §10.2.3 (Retry-After), paraphrase: "When sent with a 503 (Service Unavailable) response, Retry-After indicates how long the service is expected to be unavailable... When sent with any 3xx (Redirection) response, Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request." (<=25-word core quote: "When sent with any 3xx (Redirection) response, Retry-After indicates the minimum time that the user agent is asked to wait") So the staged quotation is a paraphrase presented as a quote.
- Q2: not RFC 9110 text at all. It is a table-cell spill from the adjacent S125 row (SameSite, draft-ietf-httpbis-rfc6265bis-13; `SOURCES-PROPOSED.md` line 57, "§8.8 (SameSite Cookies); draft-13 | Default enforcement is ..."). A register parse artifact (pipe-split), not a quote attributed to S124.

## Classification (this row only)
**absent (quote not verbatim) — mis-quoted/paraphrase, with the substantive claim supported by §10.2.3.** Q1 = absent verbatim in a successfully opened source (fabricated-as-quote, though factually supported); Q2 = register extraction artifact from S125, not a defect of S124. Not unreachable; not "present".

## Limitations
Only the RFC text rendition was searched (no HTML/PDF variants); no companion URLs or local artifacts re-checked. Did not edit source repo/lane corpus; no tools installed (RULES.md read; none needed).

VERDICT finding S124 payload-absent confirmed for verbatim Q1 (paraphrase of RFC 9110 §10.2.3; substance present); Q2 is cross-row spill from S125, not RFC 9110 text
