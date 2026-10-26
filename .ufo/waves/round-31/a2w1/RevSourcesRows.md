# RevSourcesRows — registry rows S119–S122 vs SOURCES contract v1 (rev 486048356f0712e4396588c9dab58cd419243120)

## Verdict

All four new registry rows **S119, S120, S121, S122 hold** against CORPUS.md §SOURCES.md contract v1: each has exactly 11 well-formed cells (NF=13 under `-F'|'`, so no literal or escaped `|` can hide in any cell), contract-legal `kind`, tier A correctly scoped to the row's `scope` cell (the GitHub docs rows are first-party official documentation of GitHub's own published limits, and their scope cells explicitly fence off "documentation only, not a measured response and no API calls"), `status: mined` backed by a used-by path that exists, ISO `opened: 2026-10-26`, valid `recheck` cadences (`365d` for the immutable RFCs with six-row registry precedent, `90d` for the volatile vendor pages), and next-unused ids (baseline max id S118; S119–S122 absent at baseline 96a2d1a; no duplicates among 122 rows). Every anchor line number, byte count and sha256 in the four anchor cells was checked against the committed receipt bytes and all matched exactly; every §Gate quote for S119–S122, including all supplementary per-row quotes, was located verbatim inside the receipt bytes at the cited lines, the longest at exactly 25 words. Used-by reciprocity holds in both directions: each row's `used-by` names `corpus/knowledge/rate-signal-decision-table.md`, and that entry's `source:` header block lists all four rows. `SOURCES.md` moved baseline→REV by 4 insertions, 0 deletions (append-only), and `node scripts/check-sources.mjs` in a clean checkout reports `verdict=clean rows=122 findings=0`, exit 0. One informational note on S120's wording (below), no defect.

## Per-row findings

### S119 — Robots Exclusion Protocol, RFC 9309 — **holds**
- Structure: line 133 of `corpus/SOURCES.md`, NF=13 → 11 cells, no pipes in cells.
- kind `spec` (RFC) ✓; tier A scoped to robots.txt fetch-result semantics ✓ (RFC is primary for that scope).
- Receipt: `corpus/evidence/round-31/decision-table/bytes/S119.txt` — measured 25265 B, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`; anchor cell and `S119.json` both state 25265 B / same digest — **exact match**.
- Anchor lines verified in receipt bytes: `2.3.1.2.  Redirects` at :373, five-consecutive-redirects SHOULD at :377 (range 377-384 also carries the within-five MUST at :380-381 and more-than-five MAY at :384); `2.3.1.3.  "Unavailable" Status` at :387 with `400-499 range` at :392 (section spans 387-396); `2.3.1.4.  "Unreachable" Status` at :398 with `500-599 range` at :403 and `30 days` at :406 (spans 398-408); `2.4.  Caching` at :415 with `more than 24 hours` at :419 (spans 415-420); `2.5.  Limits` at :422 with `at least 500 kibibytes [KiB]` at :425 (spans 422-425). **All 11 line claims accurate.**
- teaches numbers (five redirects, 400-499 MAY proceed, 500-599 complete disallow, 30 days, 24 hours, 500 KiB) each grounded in the located lines; forces (SHOULD/MUST/MAY/SHOULD NOT) match the receipt text.
- Gate quote :377-378 "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" (12 words ≤25) — located verbatim.

### S120 — Additional HTTP Status Codes, RFC 6585 — **holds** (one informational note)
- Structure: line 134, NF=13 ✓; kind `spec` ✓; tier A scoped ("…not how an origin counts or identifies clients") ✓.
- Receipt: `bytes/S120.txt` — measured 17164 B, sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58`; anchor and `S120.json` agree — **exact match**.
- Anchor lines verified: `4.  429 Too Many Requests` at :132 (section to :165/166); Retry-After MAY at :138; example `Retry-After: 3600` at :145; `MUST NOT be stored by a cache` at :165; §3 428 at :95-130; §5 431 at :175-201; §6 511 at :203-220. **All accurate.**
- Gate quote :137-139 "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request." — exactly 25 words (contract boundary, satisfied) — located verbatim.
- Informational (not a defect): the `teaches` cell says "Retry-After **seconds**", but RFC 6585's own prose (:138-139) states only "indicating how long to wait" — the seconds unit is carried by the `Retry-After: 3600` example at :145 (and the HTTP Retry-After definition RFC 6585 defers to), not by this RFC's normative sentence. The unit claim is still grounded inside the committed bytes, so this is wording precision, not an unsourced claim.
- Note recorded by the lesson (:30-32): S120 sources **no** decision-table row (its only numbers are example/illustrative), it is cited in the entry's prose — consistent with the row's scope and with the counter's row-level citation checks.

### S121 — Rate limits for the REST API, GitHub Docs — **holds**
- Structure: line 135, NF=13 ✓; kind `docs` ✓.
- Tier A is right for this row: the contract's tier A includes "official docs … for that scope"; this is GitHub's first-party documentation of GitHub's own ceilings, and the scope cell fences it ("documentation only, not a measured response and no API calls") — no inflation.
- Receipt: `bytes/S121.html` — measured 337116 B, sha256 `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755`; anchor and `S121.json` agree — **exact match**. The anchor's "raw bytes vary per response; normalised text identical" is an honest, disclosed pin for a page with no revision marker (fetch instant + digest is a legitimate revision anchor per contract, and never a bare homepage).
- Anchor lines verified (HTML receipt, 150 lines): article body + `About primary rate limits` h2 at the tail of line 32 (line is 218,086 chars; tail confirmed); 60/hr unauthenticated at :38; 5,000/hr authenticated at :41; GITHUB_TOKEN 1,000/hr/repository at :61; `About secondary rate limits` h2 at :62; 100 concurrent at :66; 900 points/min REST at :67; 80/min and 500/hr content-generating at :70; `Checking the status…` h2 at :103; x-ratelimit-* table at :134; `Exceeding the rate limit` h2 at :142; 403-or-429 + x-ratelimit-remaining 0 at :143; retry-after at :144. **All 14 line claims accurate.**
- Gate quote line 67 "No more than 900 points per minute are allowed for REST API endpoints" (13 words) — located verbatim; the Gate row also discloses the scribe's own raw digest differs (`ae5e1812…4c18`) while the receipt digest is the one cited — honest.
- teaches numbers (60, 5,000, 100, 900, 80, 500) each occur in the located lines.

### S122 — Best practices for using the REST API, GitHub Docs — **holds**
- Structure: line 136, NF=13 ✓; kind `docs` ✓; tier A scoped to "pacing and back-off guidance … no API calls" ✓ (first-party GitHub guidance about GitHub's own API — same tier-A rationale as S121, disjoint scope).
- Receipt: `bytes/S122.html` — measured 328088 B, sha256 `b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e`; anchor and `S122.json` agree — **exact match**.
- Anchor lines verified (104 lines): article body + `Avoid polling` h2 at tail of line 32 (220,958 chars; tail confirmed); x-poll-interval at :36; `Avoid concurrent requests` at :42 with serial at :43; `Pause between mutative requests` at :44 with one second at :45; `Handle rate limit errors appropriately` at :46 with retry-after at :49, x-ratelimit-reset at :50, one-minute + exponentially increasing at :51; `Follow redirects` at :54 with 301 permanent at :57 and 302/307 temporary at :58; `Use conditional requests` at :63 with 304-Not-Modified-not-counted at :64. **All 16 line claims accurate.**
- Gate quote line 51 "Otherwise, wait for at least one minute before retrying." (9 words) — located verbatim.
- Rows S121 and S122 are distinct (ceilings document vs pacing/back-off document; different URLs, different receipts, disjoint scopes).

## Cross-row contract checks

- **11 cells / no pipes**: all four rows NF=13; no `\|` escapes; a literal `|` would break NF=13, so none exists.
- **ids**: baseline (`96a2d1a`) registry ends at S118 and contains 0 occurrences of S119–S122; at REV the registry has 122 rows, no duplicate ids (census `sort|uniq -d` empty) → next-unused and never-reused satisfied.
- **status/mined + used-by reciprocity**: all four rows `mined` with `used-by = corpus/knowledge/rate-signal-decision-table.md` (path exists at REV); the entry's header block lists all four rows via `source:` lines with § anchors and fetch dates. Both directions verified.
- **opened/recheck**: `opened 2026-10-26` (ISO) on all four; recheck `365d` (both RFCs) and `90d` (both GitHub pages) — valid cadence forms; `365d` already used by 6 rows registry-wide (90d ×16, 180d ×8, 730d ×1, on-release ×90 precedents). Longer cadence for immutable RFC text, shorter for unversioned vendor pages — sensible.
- **Append-only**: `git diff --stat 96a2d1a..4860483 -- corpus/SOURCES.md` = `4 insertions(+)`, 0 deletions; no existing row touched.
- **Gate completeness** (rule 1): the lesson §Gate table records, for each new row, URL, access date (scribe 08:36:21Z + per-row receipt fetch times matching the `S1xx.json` files), and a ≤25-word located quote with location; supplementary quote lists (:25-28) for the decision-table rows all located in receipt bytes at the cited lines (S119 :384-385/:419/:425/:392/:403/:406; S120 :145/:165; S121 :38/:66/:70/:41/:61/:143; S122 :43/:45/:49/:51 — the :61/:143 HTML-tag-stripped readings match the visible text of those lines).
- **Maintained structural checker**: `node scripts/check-sources.mjs` in the clean scratch checkout → `SOURCES_GATE verdict=clean rows=122 tiers=A:107,B:6,C:9 status=queued:15,mined:98,rejected:9 findings=0`, exit 0.

## Commands run (all exit 0 unless noted)

```
S=/fast/scratch/hyaku/tabi-r31/RevSourcesRows
git clone --shared --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # exit 0
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120                    # HEAD verified, porcelain empty
sha256sum + wc -c over bytes/S119.txt S120.txt S121.html S122.html                        # exit 0, digests/sizes match anchors
sed -n '373,385p' bytes/S119.txt; awk NR-range dumps of S119.txt :386-425                  # exit 0
awk line dumps of S120.txt (:93-100,128-150,160-176,199-205,218-222)                      # exit 0
awk per-line reads of S121.html :32,38,41,61,62,66,67,70,103,134,142,143,144              # exit 0
awk per-line reads of S122.html :32,36,42-46,49-51,54,57,58,63,64 + L32/L64 tails         # exit 0
awk -F'|' NF and escaped-pipe scan over SOURCES.md :133-136                               # exit 0, NF=13 ×4, no escapes
registry cadence histogram; duplicate-id scan; row count (=122)                           # exit 0
git diff --stat 96a2d1a..4860483 -- corpus/SOURCES.md                                     # 4 insertions, 0 deletions
git show 96a2d1a:corpus/SOURCES.md id scan                                                # max S118, S119-S122 absent (grep -c 0 → exit 1, expected)
TMPDIR=$S node scripts/check-sources.mjs                                                  # verdict=clean rows=122 findings=0, exit 0
```

No network fetches were made: the assignment's anchor-accuracy check is defined against the committed receipt bytes, and S121/S122's own anchors disclose that raw bytes vary per response, so a live refetch would not be the comparison the row pins. No live-page claim is made here.

## Residual risk / gaps

- I did not re-fetch any of the four URLs live (leaf seat, and the comparison surface is the committed bytes; a live re-open is a recheck-cadence activity, next due 2027-01-24 for S121/S122, 2027-10-26 for the RFCs).
- S120's "seconds" nuance (informational): if a later round quotes S120 for the unit specifically, the unit sentence should come from the HTTP spec Retry-After definition, not RFC 6585 prose.
- Not in my item scope (checked only incidentally): decision-table rows D1–D13 themselves, the --live counter run, and C2 calibration.
