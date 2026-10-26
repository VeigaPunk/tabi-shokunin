# Round 31 w1 — ConnSiblings (L2 sibling-overlap scan)

Seat: ConnSiblings (connector, leaf). Lane: tabi. Read-only scan of sibling lane corpora/PROVINCE.md
and `.ufo/l0-questions.md` against the round's surfaces (C1 rate/crawl decision table; C2
self-assessment tally corrections). No network fetches were needed; every citation below is a local
read. No tools installed.

## Verdict

For C1, the only substantive sibling knowledge overlap is **kake**: it already holds RFC 9309
robots.txt semantics (S011, S099 + `robots-txt-rules.md`, `crawl-scope-per-host.md`, `crawler-identity.md`,
`crawl-budget-consequences.md`, S095/S273/S274) — and it explicitly declares **client-side crawler
discipline to be tabi's province** (kake PROVINCE.md:34-35; corpus/README.md:476). kake's RFC 9309
origin is publisher-side placement; tabi's C1 maps the same RFC's thresholds to journey-driver actions,
so the row is **tabi-owned with a shared-source adjacency**: C1 must quote the RFC from its own fetch
(S119), not from kake's readings, and must not absorb kake's lane readings (e.g. its 2xx/4xx/5xx
mapping, its 30-day long-outage allowance, its `crawl-delay`-ignored rule). **mori** holds RFC 6585
(S041, HTTP 429) and a queued Retry-After row (S042) for provider seat-terminal classification — same
documents as C1's S120, different purpose, sibling-owned. **kama / tsukuroi / kengaku / chousa /
mado** hold only *observation evidence* of API/provider rate limits (403 x-ratelimit-* on
api.github.com; 429 retry-after on model endpoints) — no knowledge rows, no absorption. **No sibling
holds the GitHub REST API rate-limits docs (C1 S121/S122)**; the only prior holder of that URL is
tabi's own staged S126 (refused round 27, register quotes absent), which stays refused per claims.json
§assimilation. For C2, none of the nine stale tally sites is sibling-owned — all sit in tabi's own
SKILL.md/corpus/README.md — and sibling citations into tabi's SKILL.md (kumitate :1421-1424; kotoba
census at pinned revisions) are unharmed by end-of-file appends. Two contested surfaces touch the lane
but not this round's content: the the-musketeer Chrome-profile lease (kagi/tabi/kake) and the CDP
runtime scope (revenger/kama vs tabi), both already open in L0 round-17. No C1/C2 deliverable absorbs
sibling ground; disposition for every overlap below is "report, never absorb".

## Overlap table

| # | Sibling | File:line | What it holds | Disposition |
|---|---|---|---|---|
| 1 | kake | `corpus/SOURCES.md:19` (S011) | RFC 9309 robots.txt: host-root scope, access method, unreachable ⇒ complete disallow; mined r20 | tabi-owned (C1 S119 same RFC, journey-driver side); do not absorb kake's readings; quote from own fetch |
| 2 | kake | `corpus/SOURCES.md:107` (S099) | RFC 9309 full REP §§1-5, supersedes S011 (r38) | tabi-owned / shared-source adjacency, same as #1 |
| 3 | kake | `corpus/SOURCES.md:103` (S095) | Google "How Google interprets the robots.txt specification", incl. 429 exception among 4xx and cache-dependent 5xx | contested-adjacent: Google-specific interpretation is kake ground; C1 may not use it as its RFC threshold source |
| 4 | kake | `corpus/knowledge/robots-txt-rules.md:23,25,29,35,57,113` | Offline robots.txt rules: lane 2xx/4xx/5xx status mapping; 500 KiB parse limit; `sitemap`/`crawl-delay` ignored; implicit /robots.txt allow; 30-day long-outage allowance (S011 §2.3.1.4) | sibling-owned (publisher-side checker contract); C1 may overlap on RFC thresholds, but each threshold must be re-sourced from S119 text |
| 5 | kake | `corpus/knowledge/crawl-scope-per-host.md:7-11,34-35` | Host-root robots.txt discovery; sitemap scope; 4xx robots ⇒ MAY access, 5xx ⇒ disallow | sibling-owned; same shared-source nuance as #4 |
| 6 | kake | `corpus/knowledge/crawler-identity.md:25-27` | Googlebot subtypes obey the same robots.txt product token (S263) | sibling-owned; not needed by C1 decision table |
| 7 | kake | `corpus/knowledge/crawl-budget-consequences.md:11-13,17` | Google crawl-budget and emergency crawl-rate backoff (S273/S274): block doesn't free budget unless capacity hit; backoff covers whole hostname | sibling-owned (publisher budget consequences); C1 driver-side actions stay distinct |
| 8 | kake | `corpus/README.md:476`; `PROVINCE.md:34-35` | Boundary declaration: "Browser-driven/client-side crawler discipline remains tabi's province; kake's boundary is publisher-side robots/sitemap placement" | tabi-owned by kake's own declaration — strongest support for C1 siting |
| 9 | mori | `corpus/SOURCES.md:47` (S041) | RFC 6585 §4 HTTP 429 "too many requests"; mined into `knowledge/seat-terminal-status-r17.md` (provider seat death classification) | sibling-owned (fleet/provider observability); same RFC as C1 S120 but disjoint purpose; re-quote from S120 fetch |
| 10 | mori | `corpus/SOURCES.md:48` (S042) | RFC 9110 §10.2.3 Retry-After (queued, not mined) | sibling-owned; same source as tabi's held Retry-After vocabulary; no absorption |
| 11 | mori | `corpus/evidence/recheck-r32/S041.src:248-256` | Retained RFC 6585 §4 bytes (429 + Retry-After example) | sibling evidence; do not reuse as C1 receipt bytes |
| 12 | kama | `corpus/knowledge/sglang-docs-version-pinning-amendment-2026-10-23.md:34-39` | Observed HTTP 403 "API rate limit exceeded", `x-ratelimit-limit: 60`, `x-ratelimit-remaining: 0` on api.github.com; git protocol bypass | sibling evidence (observational); complements C1 S121 docs but is not a sourced threshold |
| 13 | kama | `corpus/lessons/round-38-verifier-spotcheck.md:58-59`; `round-38.md:68-69` | S360 reject: api.github.com 403 with `x-ratelimit-remaining: 0` — anchor not reproducible unauth. on this host | sibling evidence; C1 S121/S122 are docs.github.com (not api.github.com), no conflict |
| 14 | kengaku | `corpus/evidence/probe-r19-P6-zai.log:19-20`; `probe-r19-p1-listing-mismatch.log:13-16,23-26` | 429 insufficient_quota on token-plan endpoints; Retry-After seconds (634027/1066018); implied-reset = request epoch + retry-after (±7200 s tolerance) | sibling-owned (LLM-endpoint calibration); same Retry-After arithmetic class as C1 but different host class; not absorbed |
| 15 | kengaku | `corpus/evidence/attrib-r22-legs.log:11,23,35` etc. | Observed `x-ratelimit-limit-day/-remaining-day/-limit-hour` headers on google-frontend provider responses | sibling evidence; header-name overlap with tabi's rate-limit vocabulary, but observational and provider-scoped |
| 16 | chousa | `corpus/evidence/round26-inherited-measurement.json:40-41` | 429 rate_limit_error body + `retry-after-ms=6442000` (provider) | sibling evidence; no knowledge row; no overlap with web journey table |
| 17 | tsukuroi | `corpus/SOURCES.md:268`; `knowledge/source-scope-correction-r14.md:2,104-105` | Unauthenticated api.github.com returned 403 rate-limit for this host; authenticated gh api 200 | sibling evidence; GitHub API access-limit observations, not docs thresholds |
| 18 | mado | `corpus/knowledge/idle-lock-route-r17.md:120` | "The GitHub REST API is rate-limited and was not needed" | sibling note; no row, no absorption |
| 19 | kagi | `corpus/SOURCES.md:54,55` (S047/S048) | docs.github.com OIDC / secret-scanning pages (different docs, not rate limits) | sibling-owned; distinct docs, no overlap |
| 20 | kotoba | `corpus/SOURCES.md:40,41,43` (S027/S028/S030) | docs.github.com Copilot skills pages (different docs) | sibling-owned; distinct docs, no overlap |
| 21 | kake | `corpus/SOURCES.md:47` (S015) | GitHub Pages limits page (1 GB published-site size; usage limits) | sibling-owned; size limits ≠ rate limits, no overlap |
| 22 | kumitate | `corpus/knowledge/kimi-skills-plugins.md:278,320` | Cites `tabi-shokunin/SKILL.md:1421-1424` (webbridge plugin records) and routes plugin internals to tabi | citation into tabi document; append-only C2 corrections at EOF do not shift cited lines — no impact |
| 23 | kotoba | `corpus/knowledge/sibling-overlap-census-round74.md:150-153` | Reads tabi's frozen SKILL.md at pinned revisions (`git show 856fa9e1:SKILL.md`, lines 1313/1450) | read-only census at pinned revs; unaffected by C2 appends |
| 24 | kake | `corpus/SOURCES.md:150` (S274) | Google "reduce crawl rate" page — emergency backoff across whole hostname | sibling-owned; C1 driver actions could cite the same page's own thresholds only if opened as a tabi row — not required by C1's declared registry rows |

Contested / open surfaces (L0, not rate/robots content, reported not absorbed):
- Chrome profile lease: kagi/kake name "the-musketeer" lease contested with tabi (kagi PROVINCE.md:43;
  kake PROVINCE.md:35); no L0 ruling — L0 l0-questions.md:62 (tabi round-17).
- CDP runtime scope: kaidoku keeps CDP only as an REA provider surface (ruled r16,
  tabi corpus/lessons/round-16-verifier-spotcheck.md:142); revenger PROVINCE.md:5 and kama CDP
  enumeration contested-open — L0 l0-questions.md:65 (tabi round-17).
- Fleet gate-convention standard (exit-code maps, --selftest, check-ids): kengaku round-10 L0 question
  → protocol/integrator owns a fleet-wide standard; no sibling owns tabi's gate registry rows. C2's
  corrections do not decide this open question.

## C2 sibling-surface check

- Targeted tally sites: SKILL.md:1614,2479,2514,2515,2529,2530,2543,2544; corpus/README.md:613 —
  all in tabi's own documents (claims.json C2 "before"). No sibling owns these files.
- The corrections are append-only at EOF; they insert nothing above any cited line, so line numbers
  cited by siblings (kumitate SKILL.md:1421-1424; kotoba census pins) are stable.
- The only fleet-level surface touching this convention (gate self-test tallies) is the open protocol
  question (kengaku r10), not a sibling-owned document. No contested/sibling-owned surface is touched.

## Evidence (commands and exit codes)

Reads (tool `read`, exit 0 for each):
- `read tabi-shokunin/.ufo/waves/round-31/claims.json` — C1/C2 predicates, controls, assimilation.
- `read tabi-shokunin/.ufo/waves/round-31/baseline/README-receipts.md` — freeze-time controls.
- `read tabi-shokunin/PROVINCE.md` — owned/refused surfaces.
- `read .ufo/l0-questions.md` — tabi r5/r17/r22/r27 rows, kengaku r10, etc.
- `read kake-shokunin/PROVINCE.md`, `mori-shokunin/PROVINCE.md`, `kasegi-shokunin/PROVINCE.md`,
  `kumitate-shokunin/PROVINCE.md`, `chousa-shokunin/PROVINCE.md`, `kengaku-shokunin/PROVINCE.md`,
  `kaidoku-shokunin/PROVINCE.md` — boundary declarations.
- `read kake-shokunin/corpus/knowledge/robots-txt-rules.md`, `crawl-budget-consequences.md` — entry texts.

Grep scans (tool `grep`, gitignore=false so nested lane corpora are searched; all exited 0, matches listed
above):
- `(?i)robots\.txt` over `/home/vgpnk/Projects/shokunin/*-shokunin/corpus` → kake only (plus
  sibling-level noise), incl. kake README.md:476 boundary sentence.
- `(?i)retry-after` over same → mori (S041.src bytes), kake lessons (provider 429 notes), kengaku
  probe logs, chousa evidence JSON, kama lessons.
- `(?i)rate[- ]limit` over same → mori SOURCES S041-S043, kama README/SOURCES/lessons, mado knowledge,
  tabi evidence (round-30 frontier bytes), tsukuroi SOURCES/lessons, audio/game-dev-3d/kagi incidental.
- `9309` over same → kake SOURCES S011/S099 + robots-txt-rules.md/crawl-scope-per-host.md
  (audio hits are filenames/run ids, not knowledge).
- `6585` over same → mori SOURCES S041 + recheck-r32/S041.src (audio hits are fixture ids).
- `(?i)github.{0,80}rate.{0,40}limit|rate.{0,40}limit.{0,80}github` → kama README:583, tsukuroi,
  mado, game-dev-3d, kagi (OIDC/secret-scanning docs), kotoba (Copilot docs).
- `(?i)crawl[- ]delay|politeness|polite crawl|crawl rate|backoff|slow down` → kake robots-txt-rules.md:35
  (`crawl-delay` ignored), crawl-budget-consequences.md:13 (S274 backoff); game-dev-2d fixture "backoff"
  is unrelated physics-fixture wording.
- `(?i)tabi` over sibling corpora → no ownership claims; kotoba/kumitate citations (see rows 22-23).
- `docs\.github\.com` over siblings → kake (Pages docs), kagi (OIDC/secret-scanning), kotoba (Copilot),
  game-dev-3d (repos API 404); **none** hold rate-limits-for-the-rest-api or
  best-practices-for-using-the-rest-api.
- `(?i)x-ratelimit|ratelimit-` over siblings → kama (S360 reject, amendment), kengaku (attrib-r22 logs).
- `tabi-shokunin` over sibling corpora → kotoba census, kumitate kimi-skills-plugins.md, mori
  recheck-r32 README, tabi's own evidence tree.
- `rate-limits-for-the-rest-api|best-practices-for-using-the-rest-api` over `/home/vgpnk/Projects/shokunin/*-shokunin`
  → only tabi's own `.ufo/waves/round-22/assimilation/` quarantine records of staged S126 (refused), confirming
  no sibling holds the page.

No network fetches were performed (none required for this scan); no tool installs/updates.
