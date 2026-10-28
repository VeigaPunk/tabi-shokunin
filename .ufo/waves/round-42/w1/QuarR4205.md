# QuarR4205 — quarantine re-adjudication S124, S125

Lane `tabi`, round2 rows. Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 186-187. Fresh check; round-40 dispositions used only as the delta baseline. No tools installed (RULES.md read; curl, sha256sum, and Python were already present). No writes under shokuknow, the fleet repo, or the production tree. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4205/` deleted after these receipts were copied here.

## Commands and observed output

```
curl -sSL -D headers-s124.txt -o body-s124.txt -w '...' https://www.rfc-editor.org/rfc/rfc9110.txt
url_effective=https://www.rfc-editor.org/rfc/rfc9110.txt
http_code=200
size_download=502941
num_redirects=0
content_type=text/plain;charset=utf-8
sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a

curl -sSL -D headers-s125.txt -o body-s125.txt -w '...' https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt
url_effective=https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt
http_code=200
size_download=146976
num_redirects=0
content_type=text/plain; charset=utf-8
sha256 062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf
Last-Modified: Wed, 15 Nov 2023 20:05:12 GMT
```

Exact and whitespace-normalized search of both bodies for all four staged strings: every hit false. Sibling fetch, used only to separate misbound from absent (the registered URL is still the draft):

```
curl -sSL -D headers-s126.txt -o body-s126.txt -w '...' \
  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
url_effective=https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
http_code=200
size_download=337811
num_redirects=0
sha256 4c14562d807f13203572167ef8c06a2a3469b512de81ec41b2c9f6fa3c9c2195
"Rate limits for the REST API" count=10
"About secondary rate limits" count=5
```

## S124 — partial

Register: `tabi | round2 | S124 | payload-absent | https://www.rfc-editor.org/rfc/rfc9110.txt` with

- Q1 `Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable) status code`
- Q2 `enforcement), §8.8 (SameSite Cookies); draft-13 | Default enforcement is`

Q1's census line is the lane quote attributed to section 10.2.3 (`lanes/tabi/round2/SOURCES-PROPOSED.md` line 55; census-adjudication.json). The section is in the fetched text (lines 4799-4807) but the sentence is not. The RFC says Retry-After, when sent with a 503 (Service Unavailable) response, indicates how long the service is expected to be unavailable, and when sent with any 3xx (Redirection) response, indicates the minimum wait before the redirected request. "can be used with" occurs twice, both on If-Match / If-Unmodified-Since, not on Retry-After. Some phrases present, the registered sentence absent: not a one-token typo. Verdict for that quote is partial.

Q2's census line is the S125 staging row, split on a pipe. The string is absent from RFC 9110 (0 hits for SameSite Cookies, draft-13, Default enforcement). It is also absent as a contiguous string from the cookie draft. That draft has the heading "8.8.  SameSite Cookies" and, separately, "a default enforcement mode that is equivalent to Lax" and `Let enforcement be "Default"`. Q2 is an extraction spill, not a passage of the other source.

Delta vs round 40 (absent verbatim / misbound): the live RFC did not change. Byte size 502941 and sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` match the 2026-10-25 fetch recorded in `.ufo/waves/round-27/assimilation/README.md`, and round 40 opened the same 502941-byte body. The label is partial because this round's enum names the split round 40 already wrote in prose (sentence absent, section 10.2.3 substance present). The Q2 spill finding is unchanged.

## S125 — misbound

Register: `tabi | round2 | S125 | payload-absent | https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` with

- `Rate limits for the REST API`
- `About secondary rate limits`

Both are absent from the opened draft (0 hits for "Rate limits", "secondary rate", and "REST API"). The census line for both is the S126 row, whose registered URL is the GitHub REST rate-limits page. That page, fetched today, contains both strings verbatim (title "Rate limits for the REST API - GitHub Docs"; nav label "About secondary rate limits"). The draft URL was not replaced; the sibling fetch only classifies the miss.

Delta vs round 40 (absent, alignment with S126 unverified): the registered draft did not gain the quotes. It is still HTTP 200, 146976 bytes, Last-Modified 15 Nov 2023. The verdict changes to misbound because the other registered source was opened this round and both quotes are in it. That page was 337116 bytes when a round-40 sibling fetched it and is 337811 bytes today; the two headings are still there.

## Limitations

Only the registered .txt renditions were searched for S124 and S125 (no HTML or PDF variant of RFC 9110). The GitHub body is HTML, which is what that URL serves. Other lanes' same-id rows (souji S124, tameshi S124, chousa S125) were not adjudicated. Set-Cookie values from the fetches are omitted.

Evidence: `evidence-S124.txt`, `evidence-S125.txt` in this directory.

VERDICT finding S124 partial (RFC 9110 section 10.2.3 paraphrase; Q2 is an S125 pipe-split absent from both bodies); S125 misbound (both quotes verbatim on registered S126, absent from rfc6265bis-13)
