# Rejected candidates — RFC 9309 (S119)

Every line below was read in the fetched bytes (`rfc9309.txt`, sha256
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207) and refused as a
decision-table row. Line numbers are the raw text file; the counter normalises by whitespace
collapse only (the HTML branch does not fire on this file).

## Refused for no number (t4-threshold: no bound the source states)

1. `rfc9309.txt:370-371` — "If the crawler successfully downloads the robots.txt file, the crawler MUST follow the parseable rules." A MUST decision ("follow"), but no number: any threshold cell would be the author's, not the source's.
2. `rfc9309.txt:395-396` — "then the crawler MAY access any resources on the server." The allow decision for an unavailable file, stated with no number.
3. `rfc9309.txt:417-418` — "Crawlers MAY cache the fetched robots.txt file's contents.  Crawlers MAY use standard cache control as defined in [RFC9111]." A cache decision with no lifetime; D5 carries the lifetime the next two sentences state.
4. `rfc9309.txt:412-413` — "Crawlers MUST try to parse each line of the robots.txt file.  Crawlers MUST use the parseable rules." A MUST on the driver, but no numeric bound (the bound lives in §2.5, which D6 uses).
5. `rfc9309.txt:177-180` — "The product token SHOULD be a substring of the identification … the product token SHOULD be a substring in" (User-Agent identification). No number, and it is a request-shape rule, not a rate/crawl decision.
6. `rfc9309.txt:346-347` — "explicitly defined records in Section 2. For example, a \"Sitemaps\" …". A pointer to out-of-band records; no bound and no driver action.

## Refused because the number cannot be expressed as a threshold in the frozen grammar

7. `rfc9309.txt:392` — "such status codes are in the 400-499 range" (the "unavailable" observable). The source's own number is real, but the counter's threshold grammar requires a number plus a unit from time/count/size (s, min, h, days, KiB, MiB, bytes, requests, redirects, points, attempts, retries, concurrent); a status-code range is none of these. Writing "499 requests" would invent a meaning the RFC does not give, so the row is refused rather than forced.
8. `rfc9309.txt:403` — "server errors are identified by status codes in the 500-599 range". Same reason; D4 uses this sentence only as the signal vocabulary and takes its numeric threshold from the 30-day example in the next sentence.
9. `rfc9309.txt:317` — the `*` row of the wildcard table, "Designates 0 or …". The `0` is ABNF cardinality, not a rate/crawl bound; it does not belong in a threshold cell.

## Refused as not a driver decision (t3-decision: no action a journey driver can take)

10. `rfc9309.txt:196, 220, 238, 293, 322, 336` — figure captions ("Figure 1: Example of a User-Agent HTTP header and robots.txt", "Figure 4: Examples of matching percent-encoded URI components", …). Numbers are example payloads; no action follows for a driver.
11. `rfc9309.txt:33, 37, 87, 107, 129` — RFC self-references ("Section 2 of RFC 7841", "https://www.rfc-editor.org/info/rfc9309", "[RFC3986]", "BCP 14 [RFC2119] [RFC8174]", "[RFC5234]"). Document plumbing.
12. `rfc9309.txt:6, 8, 11, 41, 50` — header metadata ("Request for Comments: 9309", "ISSN: 2070-1721", "September 2022", "Copyright (c) 2022 IETF Trust", "Section 4.e"). Metadata, not a signal.

## Out of province (PROVINCE.md)

13. `rfc9309.txt:428-435` — "The Robots Exclusion Protocol is not a substitute for valid content security measures … users of the protocol should employ a valid security measure relevant to the application layer". Access control and publishing-side hygiene: tabi owns observation of rate/crawl signals, refuses web publishing and secrets, and this is a server-operator obligation, not a driver action.
14. `rfc9309.txt:356-364` — the robots.txt URI/media-type definition (where a host must publish the file). Publishing-side, no driver threshold.

## Refused as a silence, not a sentence

15. "crawl-delay", "request-rate" and "retry-after" do not occur anywhere in RFC 9309 (checked: `grep -n -E 'crawl-delay|request-rate|Retry-After'` matched nothing). A missing sentence cannot be quoted, so no row can be built from the absence; those signals belong to S120 (RFC 6585, Retry-After) and S121/S122 (the host's own published limits), which other seats own.
