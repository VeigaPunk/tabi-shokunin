# gate-fixtures/c-trailing-punct.md — case (c): trailing punctuation is stripped.

Backticked with a sentence period: `.ufo/waves/round-56/measure/present.txt`.
Parenthesised: (.ufo/waves/round-56/measure/second.txt)
Comma-separated pair: `.ufo/waves/round-56/measure/present.txt`, `.ufo/waves/round-56/measure/second.txt`; both resolve.
Table row:

| receipt | rev |
|---|---|
| `.ufo/waves/round-56/measure/present.txt` | fixture |

Bare sentence-final miss: the receipt .ufo/waves/round-56/measure/missing.txt.

Expected: exit 1; the ONLY distinct missing path is
`.ufo/waves/round-56/measure/missing.txt` — with no trailing period. If the
right-edge strip failed, the reported path would read `missing.txt.` and the four
present citations above would also be falsely reported missing.
