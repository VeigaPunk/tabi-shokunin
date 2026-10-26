# S124 fetch receipts (ReopenS124, round-32 w2)

curl -q -sS --proto =https -o <file>; TMPDIR=/fast/scratch/hyaku/tabi-r32/ReopenS124

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ | 2026-10-26T17:07:31Z | 200 | 4,235,856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |
| https://www.w3.org/TR/webdriver-bidi/ | 2026-10-26T17:09:32Z | 200 | 4,235,856 | `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` |

`cmp -s bidi-alias.html bidi-wd-20261008.html` -> exit 0 (IDENTICAL).
Row-stated anchor: `fetched 2026-10-26, 4235856 B, sha256 dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` -> matches both fetches.
Row-stated `WD published 8 October 2026` -> bytes carry `<time class="dt-updated" datetime="2026-10-08">` (grep hit) and `w3c-status` = WD.
Row-stated `revision f922e6af669ead51496db85f37813f39438ef171` -> `<meta content="f922e6af..." name="revision">`, 1 occurrence.
Row-stated `byte-identical to S005's 2026-10-19 fetch` -> corpus/lessons/kaika-fleet-round-1.md:48 records dc1077db...24d4 for S005; corpus/evidence/round-18/source-recheck/S005.json:10 same digest.
Row-stated `and to the undated /TR/webdriver-bidi/ alias` -> cmp exit 0 above.
