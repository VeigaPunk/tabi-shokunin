# Fetch receipt — RFC 9309 (row S123, round 32 w1, ScribeS119)

| field | value |
|---|---|
| seat | ScribeS119 (tabi lane round 32, wave w1, routed defect 3) |
| URL | https://www.rfc-editor.org/rfc/rfc9309.txt |
| UTC time | 2026-10-26T16:02:28Z |
| HTTP status | 200 |
| bytes | 25265 |
| sha256 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| effective URL | https://www.rfc-editor.org/rfc/rfc9309.txt (no redirect) |
| local bytes | `bytes/rfc9309.txt` (this directory), same sha256 |
| identity | byte-identical to the S119 receipt of round 31 (`corpus/evidence/round-31/decision-table/S119.json`: 25,265 B, sha256 `f633915d…b207`, fetched 2026-10-26T08:36:13Z) and to the round-31 closure refetch recorded in `corpus/lessons/round-31-verifier-spotcheck.md` ("RFC 9309: 200, 25265 B, sha256 `f633915d…b207`, byte-identical to the receipt") |

## Command

```sh
S=/fast/scratch/hyaku/tabi-r32/ScribeS119
TMPDIR=$S curl -q -sS --proto =https -o rfc9309.txt \
  -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}\n' \
  https://www.rfc-editor.org/rfc/rfc9309.txt
sha256sum rfc9309.txt
```

Output (exit 0):

```
http=200 bytes=25265 url=https://www.rfc-editor.org/rfc/rfc9309.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  rfc9309.txt
```

## Header date (the routed defect)

```
$ grep -n "September 2022" bytes/rfc9309.txt
11:                                                          September 2022
$ grep -n "June 2022" bytes/rfc9309.txt
554:              DOI 10.17487/RFC9110, June 2022,
559:              DOI 10.17487/RFC9111, June 2022,
$ grep -n "Request for Comments" bytes/rfc9309.txt
6:Request for Comments: 9309
```

So: the document's own date is **September 2022** on header line 11; the only two `June 2022` occurrences (lines
554, 559) are the RFC's reference entries for RFC 9110 and RFC 9111 — the sources from which the S119 anchor's
"June 2022" was evidently taken. Nothing else in the bytes is dated June 2022.
