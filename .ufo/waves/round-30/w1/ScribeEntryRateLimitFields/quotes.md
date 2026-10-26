# Quote table — `rate-limit-policy-fields.md` against `draft-ietf-httpapi-ratelimit-headers-11`

Fetched bytes: `bytes/ratelimit-headers-11.txt`, 67097 bytes, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`.
Line numbers are 1-based in the raw fetched text; located span given as start-end line.
Every span is contiguous in the whitespace-collapsed text and is the only occurrence of that span in the file unless the occurrences column says otherwise.

| # | Section | Draft lines | Words | Quote | Occurrences |
|---|---|---|---|---|---|
| 1 | 3.  RateLimit-Policy Field | 308-309 | 12 | The field value SHOULD remain consistent over a sequence of HTTP responses. | 1 |
| 2 | 3.  RateLimit-Policy Field | 309-311 | 22 | It is this characteristic that differentiates it from the RateLimit (Section 4) field that contains information that MAY change on every request. | 1 |
| 3 | 3.  RateLimit-Policy Field | 311-313 | 17 | enables clients to control their own flow of requests based on policy information provided by the server | 1 |
| 4 | 4.  RateLimit Field | 438 | 11 | The field is expressed as a List[SF] of Service Limit Items | 1 |
| 5 | 4.1.  Service Limit Item | 461-462 | 12 | This REQUIRED parameter value conveys the available quota under the identified policy | 1 |
| 6 | 4.1.  Service Limit Item | 464-465 | 12 | This OPTIONAL parameter value conveys the effective window under the identified policy | 1 |
| 7 | 2.  Terminology | 293-294 | 13 | A service limit is the currently available quota under a specific quota policy | 1 |
| 8 | 4.1.1.  Available Quota Parameter | 482-484 | 18 | Clients MUST NOT assume that a positive available quota is a guarantee that further requests will be served | 1 |
| 9 | 4.1.1.  Available Quota Parameter | 484-485 | 10 | it indicates that the server may soon throttle the client | 1 |
| 10 | 4.1.2.  Effective Window Parameter | 512-513 | 23 | The client MUST NOT assume that all its service limit will be fully restored after the time indicated by the effective window parameter. | 1 |
| 11 | 7.  Client Behavior | 722-723 | 6 | are informative and MAY be ignored | 1 |
| 12 | 2.  Terminology | 289-290 | 14 | Quota policies can be advertised by servers, but they are not required to be | 1 |
| 13 | 6.  Server Behavior | 623-624 | 17 | A server MAY return RateLimit header fields independently of the response status code. This includes throttled responses. | 1 |
| 14 | Appendix A.  Rate-limiting and quotas | 1185 | 12 | replying instead with a 4xx HTTP status code (e.g. 429 or 403) | 1 |
| 15 | FAQ | 1633-1635 | 21 | we use it just as an example of a throttled request, that could instead use even 403 or whatever status code | 1 |
| 16 | 7.  Client Behavior | 733-735 | 23 | If a response contains both the RateLimit and Retry-After fields, the Retry-After field MUST take precedence and the effective window MAY be ignored. | 1 |
| 17 | 6.2.  Performance Considerations | 679-680 | 12 | Servers are not required to return RateLimit header fields in every response | 1 |
| 18 | 7.  Client Behavior | 708-709 | 19 | A client receiving RateLimit header fields MUST NOT assume that future responses will contain the same RateLimit header fields | 1 |
| 19 | 7.  Client Behavior | 712 | 7 | Malformed RateLimit header fields MUST be ignored. | 1 |
| 20 | 4.1.2.  Effective Window Parameter | 491-492 | 16 | the number of seconds within which the client can use no more than the available quota | 1 |
| 21 | Status of This Memo | 63-64 | 9 | It is inappropriate to use Internet-Drafts as reference material | 1 |
| 22 | 8.1.  Throttling does not prevent clients from issuing requests | 816 | 9 | This specification does not prevent clients from making requests. | 1 |
