# Network fetch receipts — SentinelReceipts (round-32 w2)

All GETs: `curl -q -sS --proto =https` from TMPDIR under $HYAKU_SCRATCH. No cookies,
no auth headers, no logins. Public licence pages only, to settle the licensing question
for the third-party bytes wave 1 committed.

| # | URL requested | UTC | HTTP | bytes | sha256 | note |
|---|---|---|---|---|---|---|
| 1 | https://www.w3.org/copyright/software-license/ | 2026-10-26T17:17:01Z | 301 | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 | redirect, empty body (sha of empty input) |
| 2 | https://www.w3.org/copyright/software-license/ (followed) | 2026-10-26T17:17:12Z | 200 | 26722 | 9234807e23edbf8f1058fd85e4d9bd19f2beebebcd8f74433cc59e8a54059771 | effective URL https://www.w3.org/copyright/software-license-2023/ |
| 3 | https://www.w3.org/copyright/document-license-2023/ | 2026-10-26T17:17:01Z | 200 | 28063 | 8f0bf5069b42a555680ae69bd89f7aaa3c998adcaf336d7a01c0d9fe2994f3c1 | W3C Document License 2023 text |

Commands as run:

```
curl -q -sS --proto =https -o body.htm -w 'status=%{http_code} bytes=%{size_download}\n' https://www.w3.org/copyright/software-license/      # status=301 bytes=0
curl -q -sS -L --proto =https -o sw-license.htm -w 'status=%{http_code} bytes=%{size_download} url=%{url_effective}\n' https://www.w3.org/copyright/software-license/   # status=200 bytes=26722 url=https://www.w3.org/copyright/software-license-2023/
curl -q -sS --proto =https -o body.htm -w 'status=%{http_code} bytes=%{size_download}\n' https://www.w3.org/copyright/document-license-2023/  # status=200 bytes=28063
```

Grant text found on receipt 2 (`grep -oiE 'permission to copy|copy and (distribute|modify)[^<]{0,140}|without (fee|charge)[^<]{0,80}'`):

```
Permission to copy
without fee or royalty is hereby granted, provided that you include the following on ALL co[py]
```

Receipt 3 (Document License 2023) additionally says the publication of derivative works
of the document "for use as a technical specification is expressly prohibited" — a
verbatim copy is not a derivative work, so the committed byte-identical copy is inside
the grant; a modification or excerpt-as-spec would not be.

No other network access was made by this seat.
