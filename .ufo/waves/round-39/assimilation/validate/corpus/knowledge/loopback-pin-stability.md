# Loopback pin stability

The shipped loopback DOM pin is `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`.

pstack-20261015-r08 hashed four files against that pin. Each matched:

- `corpus/evidence/pstack-20261015-r01/loopback/run/dom.txt`
- `corpus/evidence/pstack-20261015-r05/replay/dom.txt`
- `corpus/evidence/pstack-20261015-r06/replay/dom.txt`
- `corpus/evidence/pstack-20261015-r07/replay/dom.txt`

The r04 public observation of `https://example.com/` has DOM hash `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`. That hash is not the loopback pin. The public page and the loopback fixture are different documents.

The r08 receipt is `corpus/evidence/pstack-20261015-r08/calibration/pin-receipt.txt`. Requests in the cited captures are GET only. This note does not authorize a post, purchase, deletion, or credential submit.
