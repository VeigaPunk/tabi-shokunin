# Example Domain — observation-only public page

Scope: one public documentation page, captured by CDP and not interacted with.
Source capture: `corpus/evidence/pstack-20261015-r04/public/capture.json`,
produced by the shipped r01 public driver. The same DOM and screenshot hashes
were already measured on `pstack-20261015-r01`.

## Measured

- URL `https://example.com/`. Class `public-observation`. `consequential` is false.
- Requests observed: GET `https://example.com/` and GET `https://example.com/s.js`.
- DOM text has title `Example Domain`, an empty `h1`, and this paragraph:
  `This domain is for use in documentation examples without needing permission. This is not a service; avoid relying on it for testing and monitoring purposes.`
- DOM sha256 `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`.
- Screenshot sha256 `d42808063001eb6699b450a66cdf5511eb2bef6353d5f17205f24dce626b91fd`.
- Owned CDP port 18741 closed after the capture.

## Kept reject

The page has no `h1`. A note that claims an Example Domain heading element is rejected.
The page text says it is not a service. This note does not authorize a post, a purchase,
a deletion, or a credential submit.
