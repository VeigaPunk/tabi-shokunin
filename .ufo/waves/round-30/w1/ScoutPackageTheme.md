# ScoutPackageTheme — rate/ToS theme map of merge/tabi (round 30, C2)

## Verdict

The round's choice stands: **host-rate-limit-signal-classes-r14 (staged S159) + host-rate-limit-header-set-r16 (staged S182)** is the best, and the only clean, 2-entry set in the package for the rate/ToS theme. Nothing else on the theme survives all three filters (round-27 quarantine, PROVINCE, QUALITY). Neither S159 nor S182 is in the round-27 quarantine slice (the slice covers S102–S176; S182 is outside it and S159 is absent from the 38-row list), so neither carries a refusal. Both are re-groundable from public bytes fetched today (HTTP 200). The package text is **not admissible as-is**; the fetched bytes contradict or over-read it in four places, listed below.

**Contest items — the staged text needs these corrections:**

1. **r14 anchor: re-ground on draft -11, not -09.** The datatracker API reports `rev: 11` as latest (expires 2026-11-24). Draft -09 expired 2025-09-19 and -10 expired 2026-03-31. The staged claim "-10 and later return 404 / draft-09 newest" is false. -10 and -11 return 200; only -12 returns 404 (the 404 body is an HTML page). This confirms the claims.json note.
2. **r14 line anchors drift.** In -09, §3 is at line 301 and the "burst/daily" example at 322, but the multi-policy example (`"permin"…"perhr"`) is at **413**, not the staged 409. In -11 the lines are 302, 323 and 421.
3. **r14 "normative vocabulary" over-reads a draft.** The text says "normative vocabulary" and the S159 row says tier A. An Internet-Draft is work in progress (its own boilerplate: "cite them other than as 'work in progress.'"). Say "draft vocabulary, rev 11, not an RFC". QUALITY #14 is the relevant check.
4. **r16 over-generalises Discord's caveat.** The staged text says "the host states plainly that its own budget headers can be inaccurate". In the source the caveat is scoped to the emoji routes: "These routes are specifically limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s." The inference "the same route can be throttled for one caller and not another" is not in the source. Discord's actual scope signal is the header `X-RateLimit-Scope` ("user", "global" or "shared") and `X-RateLimit-Global`, which r16 omits. The rewrite should cite the Scope header; it is a better scope example than the per-guild remark. Discord also says "Your application should rely on the Retry-After header or retry_after field", which ties 429 to Retry-After. Epoch/delta glosses are correct (Reset = epoch seconds; Reset-After = seconds, may have decimals). "First case the lane has seen where scope is not the origin" is a lane claim; drop or cite.

**Fallback if either row cannot be admitted:** `rate-and-tos-signal-vocabulary` (RFC 9309 + RFC 6585) is the stable alternative. I checked its bytes today and each substantive claim is present: 9309 line 100 "These rules are not a form of access authorization"; 395 4xx → "MAY access"; 402 5xx → "MUST assume complete disallow"; 419 24 hours; 425 "at least 500 kibibytes"; 6585 line 138 `MAY include a Retry-After`; 165 "429 status code MUST NOT be stored by a cache". But its staged rows S106/S110 are quarantined (QuarantineA: absent/refuse), so it needs fresh rows and fresh quotes. Its subject is the stable-RFC half of the vocabulary, and C2's surface names RateLimit fields plus a host header set, so it fits the surface less well than r14 + r16.

## Admit/reject table (9 theme entries; webmcp/other incidental mentions excluded, see end)

| Entry (package path under knowledge/corpus/knowledge/) | Rows cited | Round-27 quarantine | PROVINCE | QUALITY | Call |
|---|---|---|---|---|---|
| host-rate-limit-signal-classes-r14 | S159 (IETF draft-09, tier A) | none (not in slice) | In: observation-only doc read, rate discipline | Passes #2/#12 once re-grounded. Fix anchor lines, -09→-11, "normative" → draft (#14). | **ADMIT** after re-ground |
| host-rate-limit-header-set-r16 | S182 (Discord docs, tier B) | none (outside slice S102–S176) | In: documented-not-measured host header set | Passes #2/#12 once re-grounded. Fix the over-generalised caveat and the per-guild inference (#3, #14). | **ADMIT** after re-ground |
| rate-and-tos-signal-vocabulary (K-C) | S106, S110 | **absent/refuse** (QuarantineA) | In | Entry text matches the RFC bytes, but the cited rows' recorded quotes are absent. #38 quote-binding fails. | REJECT as staged (fallback only with new rows) |
| host-rate-limit-signal-classes-r13 | S147, S148, S149 | **absent/refuse** all three (QuarantineC: quotes drifted across sibling rows; S149 quotes belong to another lane's file) | In | Fails #2/#38. | REJECT |
| host-rate-limit-signal-surface | S126 (GitHub docs) | **absent/refuse** (QuarantineB: three recorded quotes not found in the 337 KB page) | In | Fails #38. | REJECT |
| redirect-and-retry-after-semantics | S124 (RFC 9110) | **absent/refuse** (QuarantineA) | In, but the subject is redirects, with Retry-After secondary | Fails #38. | REJECT (also off-theme) |
| host-rate-limit-measured-posture-r17 | S187 (own-work file under shokuknow/lanes), S188 (github.com/robots.txt) | none (outside slice) | In scope, but S187 is own-work campaign output (not lane evidence); live re-measure needs an api.github.com call (rate-limited service, forbidden in this wave) | Fails #28/#38 for S187. The "528 lines" figure is also stale (525 lines today, `Crawl-delay` 1×). | REJECT this round (S188 alone is a possible future row) |
| rate-limit-header-to-status-r18 | S199 (own-work loopback receipt, shokuknow/lanes), S203 (GitHub docs) | none | In scope, but the core evidence is own-work outside the lane | Fails #28 (evidence pointer not committed lane bytes). S203 alone is too thin. | REJECT |
| webmcp-429-counters-and-residency-friction-r26 | S246 (Novada vendor blog, zh), S247 (Zenn article, ja) | none (outside slice) | **Out**: advice on evading IP-reputation and fingerprint detection (residential proxies, fingerprinting) is not observation-only rate/rights discipline | Vendor-marketing community sources, tier B at best, claim stack is inference. #12/#14. | REJECT (route out of province) |

Incidental mentions (not theme entries): `debugger-infobar-approval-surface` (one line quoting "no rate-limit protection"), `redirect-status-classification` (notes RFC 9110 has no 429), `webmcp-validation-and-confirmation-r15` (one list item). The other webmcp-*/declarative-* files matched my first case-insensitive `ToS` grep only as a substring (e.g. "tos"); a second grep with `\bToS\b` over them found no rate/robots/429 lines. None is a candidate.

## Lane-id check
Staged ids S102–S115+ collide with lane S102–S115 (collisions file in the assimilation dir). S159 and S182 are staged-only ids and must be re-numbered. The claim reserves S116/S117 (S118 for the S044 supersede), so S116 = IETF draft row and S117 = Discord row. Re-pointing is by document, not by id.

## Evidence (commands and exit codes)
All fetches: read-only GETs, UA `tabi-shokunin-research/1.0`, 2026-10-26T06:40Z. Raw log: `.ufo/waves/round-30/w1/ScoutPackageTheme/fetch-log.txt`. Bytes were copied to the same directory.

| URL | HTTP | bytes | sha256 |
|---|---|---|---|
| https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | 200 | 67876 | e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee |
| …-headers-10.txt | 200 | 67803 | f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5 |
| …-headers-11.txt | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| …-headers-12.txt | **404** | 77297 | db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898 (HTML 404 page; not saved) |
| https://docs.discord.com/developers/topics/rate-limits | 200 | 408912 | 14259eb7cf0cb1a69fd7bf94a17464b65991afe355e3b71e23fee0d486f20c58 |
| https://www.rfc-editor.org/rfc/rfc6585.txt | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| https://www.rfc-editor.org/rfc/rfc9309.txt | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api | 200 | 354155 | 6265ce27a8f893f6506c7837c769e8eb08fc01bb123f8094993ccc743a91ede9 (not saved) |
| https://github.com/robots.txt | 200 | 14540 | b622e2dd9b60e8540ffd1f4b0974c9dbee73bce606f9660c6344d09357889956 (not saved) |
| https://datatracker.ietf.org/api/v1/doc/document/draft-ietf-httpapi-ratelimit-headers/ | 200 | 1409 | (saved as dt.json; `rev` "11", `expires` 2026-11-24T09:26:58Z, `rfc` null) |

The fetch/quote Python script printed the results below; I did not capture its exit code separately (curl calls printed their HTTP codes).

**Quote presence** (whitespace-normalised, HTML tags stripped for the Discord page; plain text for the drafts). Present in -09, -10 and -11 alike:
- `SHOULD remain consistent over a sequence of HTTP responses` (-11 lines 308–309; -09 307)
- `contains information that MAY change on every request`
- `enables clients to control their own flow of requests based on policy information provided by the server`
- `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` (-11 line 323; -09 322)
- `RateLimit-Policy: "permin";q=50;w=60,"perhr";q=1000;w=3600` (-11 line 421; -09 413, not 409)
- "highly dynamic are better served using the RateLimit field" (-11 lines 313–314)

Candidate ≤25-word quotes for the lesson (all copied from fetched bytes):
- IETF -11: "The field value SHOULD remain consistent over a sequence of HTTP responses."
- IETF -11: "Situations where throttling constraints are highly dynamic are better served using the RateLimit field" (the source breaks the line mid-phrase; normalised text is contiguous)
- Discord: "This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s."
- Discord: "X-RateLimit-Scope - Returned only on HTTP 429 responses. Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)" (~29 words; trim to ≤25 before use)
- Discord: "Your application should rely on the Retry-After header or retry_after field to determine when to retry the request."

**Quarantine evidence read:** `.ufo/waves/round-27/quarantine/Quarantine{A,B,C,D}.md` (grep for the 15 theme row ids) and `.ufo/waves/round-30/assimilation/quarantine-slice` (38 data rows S102–S176; `payload-absent`, plus one row marked "source could not be fetched"). Refused: S106, S110, S124 (A), S126 (B), S147–S149 (C). Not present: S159, S182, S187, S188, S199, S203, S246, S247.

**Not done:** no independent refetch seat run (that is the executor's job); no counter run (read-only scout).

Tools installed: none.
