# Gate block for `corpus/lessons/round-32.md` §Gate — row S123

SOURCES contract v1 rule 1: for every new row, the round lesson's `## Gate` records the URL, the access date, and a
≤25-word quote with its location grounding `teaches`. This row's `teaches` has two grounds — the header date and the
re-location of every S119 span — so the Gate carries one quote per ground.

Receipt: `.ufo/waves/round-32/w1/ScribeS119/receipt.md`; raw bytes `bytes/rfc9309.txt` (25,265 B).

## Table row (paste into the Gate table)

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S123 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T16:02:28Z (ScribeS119; HTTP 200, 25,265 B, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`, byte-identical to the round-31 S119 receipt) | header block lines 6-11: "Request for Comments: 9309" (4 words) and, on the same header, "September 2022" (2 words); line 554 "DOI 10.17487/RFC9110, June 2022," (4 words) sits inside the RFC's own reference entry |

## Further located spans (same fetched bytes, ScribeS119)

Re-located to show S119's anchor map survived the re-fetch byte-for-byte:

- `rfc9309.txt:377-378` "The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP)." (20 words)
- `rfc9309.txt:384-385` "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable." (17 words)
- `rfc9309.txt:392` "such status codes are in the 400-499 range" (8 words)
- `rfc9309.txt:403` "server errors are identified by status codes in the 500-599 range" (11 words)
- `rfc9309.txt:406` "for example, 30 days" (4 words)
- `rfc9309.txt:419` "SHOULD NOT use the cached version for more than 24 hours" (11 words)
- `rfc9309.txt:425` "The parsing limit MUST be at least 500 kibibytes [KiB]." (10 words)
- `rfc9309.txt:11` "September 2022" (2 words); `rfc9309.txt:554` and `:559` "DOI 10.17487/RFC9110, June 2022," / "DOI 10.17487/RFC9111, June 2022," (4 words each) — the only two occurrences of June 2022, both reference entries.

Negative claim sweep (the one the row rests on): `grep -n "June 2022" bytes/rfc9309.txt` returns lines 554 and 559
only; `grep -n "September 2022" bytes/rfc9309.txt` returns line 11 only.

## Fetch record

| field | value |
|---|---|
| URL | https://www.rfc-editor.org/rfc/rfc9309.txt |
| UTC time | 2026-10-26T16:02:28Z (command clock read immediately before the GET; `curl -w` fields below from the same request) |
| HTTP status | 200 |
| bytes | 25265 |
| sha256 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| effective URL | https://www.rfc-editor.org/rfc/rfc9309.txt |
| identity | byte-identical to the S119 receipt fetched 2026-10-26T08:36:13Z (same 25,265 B, same sha256) and to the round-31 closure refetch (`corpus/lessons/round-31-verifier-spotcheck.md`, RFC 9309: 200, 25265 B, sha256 `f633915d…b207`) |
