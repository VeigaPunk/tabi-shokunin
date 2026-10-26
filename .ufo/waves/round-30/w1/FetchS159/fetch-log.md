# S116 fetch receipts (FetchS159, round-30 w1)

curl -sS -L --max-time 60 -o <file> -w %{http_code} <url>; sha256 of the saved bytes.

| label | url | utc | http | bytes | sha256 |
|---|---|---|---|---|---|
| doc | https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/ | 2026-10-26T06:39:52Z | 200 | 114084 | 5ead50d0f8513f309911c2e3ee6921f0635ef2016bda539eb6c6c528b97f7c35 |
| history | https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/history/ | 2026-10-26T06:39:52Z | 200 | 57066 | f282194b023cd7c4461a9630bcc613c1c3bbfc00ab43b94c651a2a840cb142c7 |
| 09 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | 2026-10-26T06:39:52Z | 200 | 67876 | e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee |
| 10 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | 2026-10-26T06:39:52Z | 200 | 67803 | f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5 |
| 11 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:39:52Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 12 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt | 2026-10-26T06:39:52Z | 404 | 77297 | db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898 |
| 11-refetch | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:41:04Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |

`cmp fetch/draft-11.txt fetch/draft-11-refetch.txt` -> exit 0 (byte-identical 72 s apart).
`-12` bytes are the archive 404 error page, not a revision.
The datatracker doc page references only revision 11; the history table records 11 posted 2026-05-23 ("New version available: draft-ietf-httpapi-ratelimit-headers-11.txt"), 10 posted 2025-09-27.
