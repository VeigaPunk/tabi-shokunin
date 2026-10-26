# Round 31 a2w1 — ConnAdjacency (L2 connector: adjacency of the round-31 surfaces)

Seat: ConnAdjacency (connector, leaf; attack seat — findings only, no repairs). Wave a2w1 = falsify
(redispatch of unspawned w2). Lane: tabi. Read-only scan of the round-31 landing at
`486048356f0712e4396588c9dab58cd419243120` against sibling lane corpora, `PROVINCE.md`,
`corpus/adjacency.tsv`, and the staged package in `/home/vgpnk/Projects/shokuknow/merge/tabi/` (read-only).
No network fetches were needed (no live re-fetch of row quotes — the frozen counter's `--live` admission
and the committed receipts are the ground for quote location; this seat checks *whose ground* the rows sit on,
not whether the quotes are on the live pages). No lane scripts run, no clone needed, no tools installed.

## Verdict

**Holds.** For the GitHub REST policy rows D6–D13 the ground is tabi-owned — `PROVINCE.md` owns
"rate/rights discipline" of interaction records, and no sibling holds either docs.github.com page (the only
prior holder was tabi's own staged S126, which stays refused). For the robots.txt rows D1–D5 the ground is
tabi-owned under a *declared split*: kake's own `PROVINCE.md:34-35` and `corpus/README.md:476` state
"Browser-driven/client-side crawler discipline remains tabi's province; kake's boundary is publisher-side
robots/sitemap placement", and the row group is driver-side action mapping, each threshold re-sourced from the
lane's own S119 fetch. The landing absorbs nothing a sibling owns — no kake, mori, kama, kengaku, tsukuroi or
mado citation, byte, or lane reading appears anywhere in the entry, and the entry's U4 explicitly fences the
one genuinely contestable point (robots.txt binds crawlers, not browser journeys). No contested surface is
failed: kake's contested S095 (Google-specific robots interpretation) is not used, and the two open contested
surfaces the round touches not at all (the-musketeer profile lease, CDP runtime scope) remain open in L0 and
were reported by w1. No adjacency harm in the refused-domain sense: staged S126's refusal stands on its real
basis (register id drift — S126's recorded quotes are S127's "Native messaging"/"Extension side" phrases,
verified directly), the lane opened the GitHub pages itself, and the one sentence the landed D10 shares with
the staged S126-based entry ("No more than 900 points per minute…") is the page's own sentence re-derived from
the lane's own 2026-10-26 bytes, which is the lawful case w1 RevAssimDecision names. Two minor observations,
neither an axis harm: the entry's source block says recheck `180d` for S119/S120 while the registry rows and
the lesson Gate say `365d`; and the durable lesson records the S126-refusal adjacency but never names the
kake/mori sibling context of D1–D5 (the w1 report has it — see the proposed move).

## Axes named

Adjacency (seat axis, score 8 at round start — the claim pair's lowest non-retired tie); depth is affected
only indirectly (row provenance), calibration not at all. No axis harmed by any finding below; no repair made.

## Q1 — Ownership of the row groups

**D1–D5 (robots.txt fetch outcomes → driver actions): tabi-owned, shared-source adjacency with kake.**
The split is declared on kake's side, which is the strongest possible siting:
`kake-shokunin/PROVINCE.md:34-35` — "`tabi` drives browsers and owns client-side crawler discipline; kake owns
publisher-side placement (robots/sitemap at the host it serves)"; `kake-shokunin/corpus/README.md:476` —
"Browser-driven/client-side crawler discipline remains tabi's province; kake's boundary is publisher-side
robots/sitemap placement". The rows map *observed fetch outcomes* to *driver verbs* (follow/stop/allow/refetch/
limit) — the client side. kake's holdings on the same RFC (`corpus/SOURCES.md` S011/S095/S099,
`corpus/knowledge/robots-txt-rules.md`, `crawl-scope-per-host.md`, `crawl-budget-consequences.md`) are a
publisher-side checker contract and budget consequence notes. The tabi registry row S119 was opened by the
lane's own fetch (`corpus/evidence/round-31/decision-table/S119.json`: 2026-10-26T08:36:13Z, HTTP 200,
25,265 B, sha256 `f633915d…b207`), not mined from kake's readings.

**D6–D13 (GitHub REST primary/secondary limits and pacing): tabi-owned.** Rate/rights discipline of
interaction records is in tabi's `PROVINCE.md` "Owns"; no sibling lane holds either page — w1 ConnSiblings
grep-scanned all sibling corpora for `rate-limits-for-the-rest-api` / `best-practices-for-using-the-rest-api`
and found only tabi's own round-22 quarantine records of staged S126. Sibling evidence rows that touch the same
*host class* (kama's observed api.github.com 403 `x-ratelimit-*`; kengaku's provider-endpoint 429 arithmetic;
tsukuroi's unauthenticated-api.github.com 403 note; mado's one-liner; chousa's provider JSON) are observational,
hold no knowledge rows, and are not cited or contradicted by the landing. kasegi (research) and kumitate
(tooling) have no stake in either row group.

**S120 (RFC 6585), prose-only: tabi-owned, disjoint purpose from mori.** mori holds S041 (same RFC) for
provider seat-terminal classification ("it does not identify a vendor business error or establish permanent
seat death") and S042 (Retry-After, queued) — verified at `mori-shokunin/corpus/SOURCES.md:47-48`. The entry
uses S120 only in prose (429 MAY carry Retry-After; a server need not use 429) and correctly refuses its only
numbers (`Retry-After: 3600`, 50-requests-per-hour specimen) as instances, not statements — the row discipline
w1 CritSourceChoice demanded.

## Q2 — Does the landing absorb sibling-owned ground?

**No.** Evidence, each verified this seat:

1. **Zero sibling references in the entry.** `grep -n -i "kake|mori|kama|kasegi|kumitate|sibling|adjacency|S126"`
   over `corpus/knowledge/rate-signal-decision-table.md` → no matches, exit 0 (no output, grep exit 1 for no
   match; the `echo exit=$?` wrapper printed `exit=0` for the compound — the grep itself matched nothing).
2. **Zero contested-source usage.** `grep -n -i "google|429 exception|crawl-delay|sitemap"` over the entry →
   no matches. kake's S095-dependent readings (Google 429-among-4xx exception, cache-dependent 5xx) and kake's
   lane-specific checker readings (exact first-512000-byte consumption at `robots-txt-rules.md:25`-area,
   `crawl-delay` ignored, checker does not apply the 30-day allowance) appear nowhere. Where the same RFC
   threshold appears in both lanes (5 redirects, 400–499/500–599, 30 days, 24 h, 500 KiB), the entry's quotes
   and line anchors are from the lane's own S119 bytes: `grep -n` on `bytes/S119.txt` located all five quote
   anchors (lines 377, 384, 406, 419, 425) with the forces the rows state (SHOULD / MAY / MAY / SHOULD NOT /
   MUST respectively).
3. **U4 is the contested-boundary handling done right.** The entry's Unknowns U4 says the robots rows apply
   only where a driver chooses to fetch the file, and that treating an operator's browser journey as bound by
   those outcomes is an interpretation the entry does not make. That is narrower than kake's publisher-side
   contract and declines the one reading that would trespass.
4. **Scope refusals are province-hygiene, not drift.** The w1 rejected-row files
   (`w1/ScribeRowsGitHubLimits/rejected.md`, `w1/ScribeRowsRobots/rejected.md`) refused the
   content-creation limits (80/500 per min/h), GITHUB_TOKEN 1,000, installation ceilings, GraphQL sub-budgets,
   LFS batching and the 15,000/10,000 worked example — account-topology or non-driver bounds. The entry's D13
   signal cell notes "this lane sends none — observation-only province". Nothing sibling-shaped was refused or
   kept for the wrong reason.

## Q3 — Is a contested surface unreported?

**No unreported contested surface; one minor durable-record gap.**

- kake's S095 row is the only *contested-adjacent* item for this content (w1 ConnSiblings row 3: "Google-
  specific interpretation is kake ground; C1 may not use it as its RFC threshold source"). The landing does
  not use it — confirmed by evidence item 2 above. Reported by w1; nothing to carry.
- The genuinely contested fleet surfaces (musketeer-cdp-9222-profile-lease kagi/kake/tabi; CDP runtime scope
  revenger/kama) are untouched by the round's content — no CDP, no profile lease, no runtime enumeration in any
  of the 13 rows or the entry prose. Both remain `contested-open` in `corpus/adjacency.tsv` with their L0 rows;
  w1 ConnSiblings re-reported them. `git log --stat 9505a10..4860483` shows no change to `corpus/adjacency.tsv`
  or `PROVINCE.md` — the declared split stands unmodified, so nothing was silently re-cut.
- **Minor gap:** `corpus/lessons/round-31.md` records the S126-refusal adjacency in full but contains no
  sibling line at all (`grep -n -i "kake|mori|sibling|adjacency|contested"` hits only M9's adjacency.tsv
  mention). A future round reading the durable lesson alone will not learn that D1–D5 sit on shared RFC 9309
  ground re-sourced from the lane's own fetch, nor that mori's S041/S042 hold the same RFC for a disjoint
  purpose. The wave report has the complete disposition; the lesson is the record that survives. Severity:
  minor (reporting completeness, not a wrong claim).

## Q4 — Adjacency harm: is a refused domain absorbed?

**No.** The S126 refusal is intact and the independent-open doctrine is followed:

1. **Refusal basis re-verified directly.** `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md:31-32`:
   staged S126 = the GitHub rate-limits URL; staged S127 = Chrome "Native messaging" with the recorded quotes
   `§"Native messaging" (host manifest keys, allowed_origins), §"Extension side" / "Native messaging host side"`.
   The register's recorded quotes for S126 are S127's phrases — the one-row id drift w1 RevAssimDecision
   documented from `absent-defect-register.md:187-188`. The refusal was about the *staged row's* unverifiable
   provenance, never an embargo on the document.
2. **Refusal stands.** Lesson Gate §Assimilation: "The S126 refusal stands: its flip condition is a register
   fix or an operator ruling on the id drift… S121/S122 are not an adoption of S126 or S203… took no package
   bytes, rows or entry text, and the staged rows stay refused/unadopted." Register sha256 `5afe1810…d833`
   unchanged since round 27; the w1 assimilation collision check stands (17 collisions, S102–S118; the lane's
   S119–S122 numerically collide with *unrelated* staged ids — disclosed in the lesson, a future-remap
   friction only, not an absorption).
3. **The one shared sentence is lawful overlap.** D10's quote "No more than 900 points per minute are allowed
   for REST API endpoints" also occurs in the staged S126-based entry `host-rate-limit-signal-surface.md`
   (fetched 2026-10-23). It is the page's own sentence: located in the lane's own committed bytes
   (`grep -c` → 2 hits in `bytes/S121.html`) from the lane's own fetch (receipt S121.json: 2026-10-26T08:36:16Z,
   HTTP 200, sha256 `3a33f87b…f755`), and the frozen counter's `--live` predicate located it on the live page
   (L1 reading: admitted 13, failing 0). w1 RevAssimDecision names exactly this case as lawful.
4. **w1 RevAssimDecision's six closure conditions are all met by the landed Gate** (checked line by line):
   F-R1 URL identity + refusal continuation ✓; F-R2 drift routed, not self-cleared ✓; F-R3 per-row receipts
   (URL, UTC, status, bytes, sha256) ✓ — verified by reading all four receipt JSONs; F-R4 id doctrine
   (by-document append, staged S121/S122 are unrelated Chromium json5 rows) ✓; F-R5 class distinction
   (S187/S199 campaign-local; S203 a different document; round-27 L0 question untouched) ✓; F-R6 negative
   declarations ✓.

## Row-by-row force/scope read (adjacency lens: distinctness, driver-side scope, no sibling encoding)

D1 SHOULD-follow, ≥5 redirects — S119:377 own quote, driver verb. D2 MAY-assume-unavailable, >5 — S119:384,
distinct bound from D1 (more-than vs at-least), distinct row. D3 MAY, 30 days, signal cell flags the RFC's
example value — S119:406; the shared threshold with kake's allowance is re-sourced from S119 and used on the
driver side only. D4 SHOULD NOT cache >24 h — S119:419. D5 MUST parse ≥500 KiB, floor semantics kept (kake's
checker turns the same floor into exact 512000-byte consumption; the entry does not). D6 wait ≥1 min, directive
quote (not `(derived)`, correctly — a lower-case directive addressed to the caller). D7 60 req/h, D8 5,000
req/h, D9 100 concurrent, D10 900 points/min, D11 90 s CPU/60 s — all declared limits, all correctly marked
`(derived)` per the entry's stated convention. D12 stop at `x-ratelimit-remaining: 0` until `x-ratelimit-reset`
— directive quote located in S122 bytes (escaped Next.js payload; normalised form matches); "SHOULD strength"
is the row's mapping of the page's lower-case "should". D13 pause ≥1 s between mutative requests — directive;
scope cell carries the observation-only-province caveat. All 13 quotes located in the lane's own committed
bytes this seat (S119 anchors above; S121/S122 `grep -c` counts: one-minute 2, 60-req 2, 5,000-req 5, 100-conc
2, 900-points 2, 90-seconds 2, one-second 2, remaining-is-0 located via the escaped payload). Rows are distinct
signals with distinct (source, quote) pairs — no repetition hole of the w1 M10 class is exercised by the landed
set.

## Minor observations (reported, not repaired)

1. **Recheck-cadence drift, entry vs registry/lesson (reference-drift, minor).** Entry source block
   (`rate-signal-decision-table.md:8`): "recheck: 180d for S119 and S120"; registry rows `corpus/SOURCES.md:133-134`
   carry `365d`; lesson Gate: "recheck `365d` for the RFCs"; the w1 ScribeSourcesRows draft
   (`rows.md:34`) set `365d`. The entry contradicts its own registry rows. Harmless direction (entry would
   re-check sooner), but it is a cross-surface inconsistency on the round's landed corpus.
2. **Lesson omits the sibling-adjacency line** (see Q3). Minor.
3. **Carried, still visible at REV:** `corpus/adjacency.tsv` row 6 truncates two quotes without ellipsis and
   cites `ruling_ref -` — lesson M9, routed from round 30, `not landed`. The adjacency registry itself remains
   imprecise; not caused by this round, not silently fixed either.

## Proposed move (attack seat — recommendation only, no edit made)

At the next curation pass (not this falsify wave): append a three-line adjacency note to `corpus/lessons/round-31.md`
Gate — (i) D1–D5 sit on shared RFC 9309 ground with kake's publisher-side holdings; the lane's thresholds are
re-sourced from S119's own bytes and the rows are driver-side per kake's declared split; (ii) mori S041/S042
hold RFC 6585/Retry-After for seat-terminal classification, disjoint purpose, no absorption; (iii) reconcile the
entry's `180d` recheck with the registry's `365d` for S119/S120 by an append-only entry note (the freeze's
append-only discipline forbids editing the entry body, so the entry line itself stays — the lesson note should
name the drift). Affected axes: adjacency (durable reporting of the round's lowest tie axis), none harmed.
Risk: none — appends only; no counter reads these texts for the C1/C2 predicates (C2's windows read SKILL.md
and corpus/README.md, not the lesson).

## Evidence (commands and exit codes)

Reads (tool `read`, exit 0 each): `.ufo/waves/round-31/claims.json`; `.ufo/waves/round-31/w1/ConnSiblings.md`;
`tabi-shokunin/PROVINCE.md`; `tabi-shokunin/corpus/adjacency.tsv`; `tabi-shokunin/corpus/knowledge/rate-signal-decision-table.md`;
`tabi-shokunin/corpus/lessons/round-31.md`; all four `corpus/evidence/round-31/decision-table/S11{9,20,21,22}.json`;
`.ufo/waves/round-31/w1/RevAssimDecision.md`; `.ufo/waves/round-31/w1/ScribeRowsGitHubLimits/rejected.md`;
`.ufo/waves/round-31/w1/ScribeRowsRobots/rejected.md`; `kake-shokunin/PROVINCE.md` (:30-40);
`kake-shokunin/corpus/README.md` (:470-480); `kake-shokunin/corpus/knowledge/robots-txt-rules.md` (:1-60);
`mori-shokunin/corpus/SOURCES.md` (:47-49 context); staged package files under
`/home/vgpnk/Projects/shokuknow/merge/tabi/` (SOURCES.append.md, host-rate-limit-signal-surface.md).

Shell (bash tool; each exit code as observed):
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline 9505a10..4860483 --stat` → exit 0 (15
  paths listed; no `corpus/adjacency.tsv`, no `PROVINCE.md`, no `scripts/` change). The same range run from
  the fleet root failed with exit 128 (`fatal: Invalid revision range`) — expected; lane objects are not in
  the fleet repo. All lane git was read-only with `-C`.
- `grep -n "five consecutive redirects\|more than five\|30 days\|24 hours\|500 kibibytes" bytes/S119.txt` →
  exit 0, anchors at lines 377, 380, 384, 406, 419, 425.
- `grep -c` over `bytes/S121.html` for the six D6–D11 quote strings → 2, 2, 5, 2, 2, 2 (exit 0 each).
- `grep -c "wait at least one second between each request" bytes/S122.html` → 2 (exit 0);
  `grep -o "ratelimit-remaining[^<]*"` and `grep -o "make another request until[^<]*"` over bytes/S122.html →
  exit 0, D12 quote located inside the escaped JSON payload.
- `grep -n -i "google\|429 exception\|crawl-delay\|sitemap"` and `grep -n -i "kake\|mori\|kama\|kasegi\|kumitate\|sibling\|adjacency\|S126"` over the entry → no matches (grep exit 1; compound echo exit 0).
- `grep -n -i "kake\|mori\|sibling\|adjacency\|contested"` over `corpus/lessons/round-31.md` → exit 0, two
  hits both M9's adjacency.tsv mention (no sibling-adjacency line).
- `grep -rn "S126" /home/vgpnk/Projects/shokuknow/merge/tabi/` → exit 0 (staged S126 row + S187/S203/S246/S247
  cross-references); `grep -n "Extension side" …/SOURCES.append.md` → exit 0, hits at :32 (staged S127 row —
  the drifted quotes).
- `awk -F'|' … corpus/SOURCES.md` field parse of rows 133–136 → exit 0: S119/S120 recheck `365d`,
  S121/S122 `90d`; confirms entry's `180d` line is the drifted side.
- `ls`, `mkdir` on the seat output dir → exit 0.

No network fetches (none required). No tool installs/updates. No lane tracked file, index, or scratch-clone state
touched; no writes outside the seat output dir. Verification limits: quote *location on the live page* is taken
from the frozen counter's L1 reading (`--live` admitted 13, failing 0) and committed receipts, not re-fetched
by this seat — re-fetching live pages is outside an adjacency seat's scope and the counter bytes are frozen.
