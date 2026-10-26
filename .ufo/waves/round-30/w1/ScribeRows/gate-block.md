# `## Gate` block draft for `corpus/lessons/round-30.md`

Seat `ScribeRows`, 2026-10-26. Draft only — no lane file was edited. Every quote below was read by this seat in bytes fetched on 2026-10-26; every span occurs exactly once in the counter-normalised text. Quotes for rows whose receipts are written by other seats are carried verbatim here so that `g6-gate` holds whichever located span the receipt records.

## Gate

New registry rows (both opened 2026-10-26; tier scoped to each row's `scope`; status `mined`, ids adopted from the `merge/tabi/` package by document: S159 → S116, S182 → S117):

| row | URL | accessed | located quote (≤25 words) |
|---|---|---|---|
| S116 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:42:52Z | §3 "RateLimit-Policy Field", second paragraph: "It is this characteristic that differentiates it from the RateLimit (Section 4) field that contains information that MAY change on every request." (22 words; 67,097 B, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`) |
| S117 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:43Z | §Header Format, first paragraph: "For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request." (19 words; raw bytes vary per response, normalised body 8,728 chars, sha256 `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007`) |

Quotes were re-read in this seat's fetched bytes (`receipts/` beside this draft). The receipt quote for S117 is the per-guild span below; both it and the table quote are carried verbatim in this block, so `g6-gate` holds for either.

- **S117 second located span** (25 words, §Rate Limits, the per-guild exception paragraph): "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s."
- **S116 further located spans**, carried so a receipt quoting any of them passes: "The field value SHOULD remain consistent over a sequence of HTTP responses." (12 words, §3 second paragraph); "contains information that MAY change on every request." (8 words, same paragraph); "enables clients to control their own flow of requests based on policy information provided by the server." (16 words, same paragraph).

Tier: S116 is A for the normative field vocabulary. S117 is A **only** for the scope *what Discord publishes about its own API's rate-limit headers* — first-party documentation is primary for a publisher's statement about its own documented wire headers; the package graded it B, which is the right grade for evidence of *observed* behaviour. No measured-response claim rides on either row.

- **Admitted:** S116 (RateLimit header fields for HTTP, `draft-ietf-httpapi-ratelimit-headers-11`, 23 May 2026), S117 (Discord Rate Limits).
- **Assimilation:** the package's staged S159 → S116 and S182 → S117, re-pointed by document. Neither staged entry is admitted as written (below). Lane S118 stays reserved for the S044 superseding row (round-29 routed defect 6).
- **Rejected (assimilation), with flip conditions:**
  - `merge/tabi/knowledge/corpus/knowledge/rate-and-tos-signal-vocabulary.md` (staged rows S106/S110). **Reason:** its citations do not resolve to its cited bytes. The round-27 quarantine re-fetched both cited URLs on 2026-10-25: RFC 9309 (`rfc9309.txt`, HTTP 200, 25,265 B) contains neither recorded quote (`使用 WebMCP 時，請注意下列事項`, `確認 WebMCP 工具曝光度`), and RFC 6585 (`rfc6585.txt`, HTTP 200, 17,164 B) contains none of its three (`Add hints to your tools`, `Expose your tools carefully`, `Last updated 2026-09-01 UTC`); the quoted spans belong to WebMCP documents, not to those RFCs (`corpus/lessons/…` → `.ufo/waves/round-27/quarantine/QuarantineA.md`, rows S106 and S110). An entry whose quotes are absent from its cited sources grounds nothing, whatever its prose asserts. **Flip:** the robots/429 claims re-cited on rows opened in-round whose located quotes are copied from their own bytes (the RFC sentences the prose paraphrases), each with a committed receipt and a different-seat refetch; then the entry can be re-grounded without a new claim.
  - `merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r13.md` (staged rows S147/S148/S149). **Reason:** quote drift across sibling rows. Round 27 found S147's `Error 1020: Access denied` verbatim three times on S148's cited page and absent from S147's, while S148's `Crawl-delay`/`Sitemap` and S149's `The daemon`/`/status JSON fields` are absent from their cited pages (`.ufo/waves/round-27/quarantine/QuarantineC.md`, rows S147–S149). Three of the entry's source lines point at pages that do not carry its quotes. **Flip:** each quote corrected onto the page it was actually fetched from (the Cloudflare 1015 and 1020 pages, and a robots.txt that really carries those lines), re-opened in-round with a receipt, a located quote and a different-seat refetch.

## Notes for the integrator

- The frozen counter `check-frontier-admission.mjs` requires the receipt quote, not the row's `teaches`, to appear in the lesson (`g6-gate`), and `q1-entry-quote` requires every ≥4-word double-quoted span of each tagged entry body to be a substring of its cited row's normalised bytes. The spans above are safe for the two C2 entries; keep `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` and header-name examples in inline code.
- Population must be exactly two entries carrying `frontier: rate-tos-signal` in their first 15 header lines; a third tagged entry breaks `population = 2` even if all admit.
- Rows and entries must land together: the `mined` rows' `used-by` paths (`corpus/knowledge/rate-limit-policy-fields.md`, `corpus/knowledge/host-published-rate-limit-headers.md`) do not exist at the lane tip.
- At the time of writing, `corpus/evidence/round-30/frontier/` does not exist in the lane checkout (`ls` → No such file or directory; `git status --porcelain` shows only `.ufo/waves/round-30/` untracked), so no receipt quote was verified first-hand; the block above is written to hold for both S117 candidate spans and the three S116 candidates.
