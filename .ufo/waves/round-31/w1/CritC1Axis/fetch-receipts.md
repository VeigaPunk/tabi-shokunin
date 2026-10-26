# Fetch receipts — CritC1Axis, 2026-10-26

All via `curl -q -sS --proto =https -o FILE -w 'http=%{http_code} bytes=%{size_download}\n' URL`.

| source | url | UTC time | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| RFC 9309 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T08:37:34Z | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| RFC 6585 | https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T08:37:34Z | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| GitHub rate limits | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T08:37:35Z | 200 | 337116 | ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18 |
| GitHub best practices | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T08:37:35Z | 200 | 328088 | b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e |

RFC texts are copied beside this file for reproducibility; the two GitHub HTML fetches are recorded by digest only (their normalised text is what the counter reads; the counter's `normalise` strips tags, script and style).
