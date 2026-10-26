# Rejected candidates — RFC 6585 (S120)

Every sentence below was read in the normalised fetch of
https://www.rfc-editor.org/rfc/rfc6585.txt (sha256 f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58)
and refused as a decision-table row. Stop at the first reason that applies.

## No numeric threshold in the text

1. "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request."
   — the normative sentence: 16 words, no digit and no number word, so any Threshold cell would carry the author's number and fail n1-threshold-sourced.
   Control run `CONTROL-MAY-only` in evidence/quote-checks-controls.txt shows exactly that failure.
2. "The 429 status code indicates that the user has sent too many requests in a given amount of time ("rate limiting")."
   — no numeric bound; 429 is the status code, not a threshold; the sentence also carries inner double quotes, so it cannot be one quote span (q1).
3. "Responses with the 429 status code MUST NOT be stored by a cache."
   — a real 429 handling decision, but no number and no unit; a Threshold cell would have to invent one (e.g. "0 seconds"), which the axiom n1 exists to stop.
4. "Note that this specification does not define how the origin server identifies the user, nor how it counts requests."
   — no number, no driver action (it is a scope disclaimer).
5. "For example, an origin server that is limiting request rates can do so based upon counts of requests on a per-resource basis, across the entire server, or even among a set of servers."
   — no number; it describes the server's counting, not a client threshold.
6. "When a server is under attack or just receiving a very large number of requests from a single party, responding to each with a 429 status code will consume resources."
   — "very large number" is not a number; server-side advice, not a journey-driver decision.
7. "I only allow 50 requests per hour to this Web site per logged in user. Try again soon."
   — refused in this longer form only: "Try again soon" adds no bound, the 15-word span already used in D2 carries the number, and the longer span (21 words) would blur which words the threshold rests on.

## Quote-length boundary (q1), same sentence as candidate 1

8. "MAY include a Retry-After header indicating how long to wait before making a new request. For example: HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600"
   — 26 words, one over the 25-word cap; `CONTROL-normative-full` in evidence/quote-checks-controls.txt records the failure.
   Refused rather than trimmed: a decision table cell may not splice two non-adjacent spans, and the 11-word example span (D1) already carries the 3600 the threshold rests on.

## Bound word not in the source (author's inference)

9. Threshold `at least 3600 s` with Decision "wait at least the indicated delay".
   — RFC 6585 states no bound: its normative sentence only says Retry-After MAY indicate "how long to wait before making a new request", and 3600 is an example value. A bound word turns the example into something the source appears to require. Withdrawn from D1 after CritSourceChoice's first-falsifier finding (`.ufo/waves/round-31/w1/CritSourceChoice.md`); D1 now carries `3600 s` with the example labelled in the Decision cell.

## Duplicate fact

10. A second row with Signal `Retry-After` and the same quote "For example: HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600"
   — the header row and the status-code row would rest on one sentence and one example value, differing only in which token is backticked; that is one fact counted twice, so it is not a row.

## Out of province / out of this surface

11. §3 428, §5 431 and §6 511 (including "The request MAY be resubmitted after reducing the size of the request header fields" and the 511 captive-portal text with its ports 80 and 443)
    — PROVINCE.md owns rate/rights discipline for journey records; header-size and captive-portal status codes are not rate or crawl signals, and none of their sentences carries a rate threshold. The port numbers are not thresholds.
12. Appendix B "Issues Raised by Captive Portals" — captive-portal behaviour, no rate number, outside the C1 surface.
13. Section 7's "servers are not required to use the 429 status code" — a statement about servers, not an action a journey driver takes; no number.
