VERDICT: BREAKS

Attacked: C3 as landed at M `6c97851` — `corpus/adjacency.tsv` (9 rows), `scripts/check-adjacency.mjs`, and the
count `measure-c3.mjs` B=0 → M=9. Questions: is it adjacency (AXES.md:16) or bookkeeping; are rows trivial or
duplicated; should the integrator row count; were the unmapped overlaps left out honestly; does the map absorb
sibling scope. I read w1/CriticC3.md, w1/RevPlanC3.md, PLAN.md:30-34,135-153,206-218, the Adj*/ConnAdjAxis reports,
and the drafts.
Axes: adjacency (claimed), calibration (count honesty, false cross-ref), operability (counter reproducibility).

## What I ran (sandbox /tmp/tabi-r17w2-CriticC3Final-gs64, clone at M; removed afterwards)
- `node scripts/check-adjacency.mjs --at M --fleet <fleet>` → `ADJACENCY verdict=clean rows=9 verified=9`, exit 0.
- `measure-c3.mjs --repo /home/…/tabi-shokunin M` → 9 `{contested-open 2, ruled 1, split 2, refused 4}`.
  Probe count_agreement true, 7/7 mutations red. **The mechanics hold as written.**

## F1 (high) — "verified" means the quote exists, not that an overlap exists. The count is pumpable 9 → 12.
I appended three rows to the M map in the sandbox, committed them, and re-ran both tools:
checker `verdict=clean rows=12 verified=12` exit 0; counter `12 {contested-open 2, ruled 1, split 3, refused 6}`.
- `secrets-and-session-material / mori`: mori `PROVINCE.md:3` "fleet & host observability (森) — whether the fleet,"
  is paired with tabi `PROVINCE.md:16` "secrets (→ kagi — session material is", `refused-route`. Mori has nothing
  to do with secrets, and the row still verifies.
- `lore` @01306d5 `.ufo/waves/round-87/followup/K2-adjacency.md:75` and `tameshi` @98bea7d
  `.ufo/waves/round-16/w1/Overlap1.md:114` (AdjSweep2 rows 2-3) both verify. The checker refuses `.ufo/` only on
  the tabi and ruling sides (`check-adjacency.mjs:193-195`), never on the sibling side.
- For `split-declared`/`refused-route`, `ruling_quote` only has to occur somewhere in the tabi file (`:624-635`).
  So one tabi line can back a row for every one of the 21 siblings. The key is `(surface, sibling)` (`:666-673`),
  which permits this fan-out. RevPlanC3 M4 (relevance token) and CriticC3 A3.6/A3.3 were not adopted; PLAN:211
  lists only floor, ancestry and venue.
So N measures how many rows L1 chose to write. It does not measure adjacency. A cap at 9 rests on L1 restraint alone.

## F2 (high) — no row adds new tabi-side adjacency text; the 0 is the file being absent (RevPlanC3 F11, still open)
- All 6 cited tabi lines are byte-identical at B. They were introduced on 2026-10-14 (`git log -L`):
  PROVINCE.md:6/9/15/16 and SKILL.md:556 in ff81c0f, SKILL.md:727 in 5d2e95d.
- The refusals were already scored in r1: `SCORECARD.md:100` "refusal routes `PROVINCE.md:15-19`". That covers
  4 of 9 rows (RE ×2, secrets, kasegi).
- The two-sided splits predate the round on the sibling side: kake `PROVINCE.md:30` (02b6dd0, 2026-10-19) and
  kumitate `SCORECARD.md:1556`.
- The precedent is `SCORECARD.md:747`: "8→8 unchanged; kaidoku CDP-runtime overlap reported as contested". By that
  standard, transcribing existing reports is unchanged.
- The one new adjacency act this round is fleet `ebeb396` `.ufo/l0-questions.md:62`, a contested-scope report
  filed by tabi. It counts twice (rows 6 and 7).

## F3 (med) — duplicates and weak rows inside the 9
- RE rows 3/4 rest on one tabi line (`PROVINCE.md:15` "→ revenger/kaidoku") and reuse that same line as their
  ruling_quote. That makes one pair-route count 2. Kaidoku itself reads the line as an ambiguous pair (CriticC3 A3.8).
- Musketeer rows 6/7 rest on one L0 line and one tabi line. That L0 line says "tabi holds no lease half" and asks
  the integrator to "rule the lease owner between kagi and kake". So 2 rows count a contest in which tabi disclaims
  any stake. Kagi `PROVINCE.md:43` does not name tabi.
- Row 9 (kasegi) has two problems. Its sibling quote "Sibling L1s: `fleets/claimer-mission.md` (CDP browser
  submissions," points to a fleet mission and is not a kasegi scope claim; kasegi's PROVINCE refuses live-target
  work (AdjSweep1 §5.2). Its tabi side (`SKILL.md:727`) routes the act to the operator, not to kasegi, so
  `refused-route → kasegi` is stated on neither side.
- Distinct surfaces: 7. Rows backed by a two-sided statement: 2 (kake, kumitate), plus 1 integrator-ruled row.

## F4 (med) — the integrator-ruled row is counted as tabi's own
- Row 2's ruling (`round-16-verifier-spotcheck.md:142`) was authored by protocol-shokunin (CriticC3 A2, blame).
- The checker labels such rows `selfRulings` "so the integrator can decide whether they carry weight"
  (`check-adjacency.mjs:94`), yet the counter adds the row to N with no carve-out.
- The same act also closes routed defect 5 (PLAN:168). That is double credit: CriticC3 A2 repair #1 was not adopted.
- The row has no owner/outcome column, so a reader cannot tell from the map which way the ruling went.

## F5 (high, calibration) — the real contested overlaps were dropped without disclosure, and the map claims completeness
Dropped:
- **revenger** `PROVINCE.md:5` @cf02419 "Owns: … browser/Electron runtime evidence — using the REA skill". This
  directly overlaps tabi's CDP observation. The ruling's carve-out at `:142` names kaidoku only. AdjRevenger
  drafted an L0 question, but none was filed: fleet `^tabi |` lines are :25, :34, :62 only. The map keeps revenger
  only through the pre-scored RE refusal (row 4).
- **kama** `corpus/knowledge/listener-census.md:355` @cff9e62 (landed; ancestor of kama tip 54a2926) "Chrome
  DevTools protocol, 21 live targets including" is a live CDP target census of the musketeer profile. Kama's
  routing table assigns "`9222` CDP session, lease, tab/target set" to kake (kama tip
  `.ufo/waves/round-16/build/advice/ConnectKake.md:89`), which conflicts with the ruling's "tabi owns live
  browser/CDP page observation". Neither is mapped or filed.
- **kagi** NMH-manifest writer row (kagi `corpus/adjacency.tsv:83`) and **game-dev-3d** (AdjSweep1 row 1).
Left out for good reason:
- lore and tameshi are wave scratch. Leaving them out is correct, but F1 shows that is L1 discretion, not a gate rule.
None of these omissions is disclosed in any landed file at M:
- `git grep -i 'revenger|kama|lore|tameshi'` over M's corpus/README.md and the C2 note finds no exclusion record.
- `corpus/README.md:351-355` presents the map as where "sibling overlaps and their dispositions … live".
- The checker header says the map "records every real overlap between this lane and a sibling lane"
  (`check-adjacency.mjs:4`).
- The lesson that would carry exclusions is still a draft placeholder (`drafts/lesson-r17.md:98` `[pending …]`).
- Effect: the uncomfortable overlaps (revenger runtime evidence; kama routing targets to kake) were dropped, while
  an overlap tabi disclaims (musketeer) was filed and counted twice.

## F6 (med, false provenance) — the C2 note cites the map for something the map does not contain
- `corpus/knowledge/webmcp-invocation-round-17.md:104`: "fixture-owned tools is tabi's own reading, recorded here
  and in `corpus/adjacency.tsv`."
- At M, `git show M:corpus/adjacency.tsv | grep -c -i 'invo|page-tool|webmcp'` → 0. No row records the reading
  that invocation falls under observation.
- So the scope extension C2 relies on (CriticC3 A2 coupling) has no map row. It cites one that does not exist.
- This is not sibling absorption. It is tabi's own scope widening, attributed to an artifact that is silent on it.

## F7 (low, operability) — the counter's self-identity depends on the clone path; the checker's does not
- `measure-c3.mjs:1100` sets `ownToken: basename(laneRepo)…`, and `:577` uses it for the self-venue match.
- In a clone named `S`, the counter gave **8** (row 2 `ruling_venue`, ruled 0) and its probe reported
  `count_agreement False`, real expected 1 vs checker 0.
- In a clone named `tabi-shokunin` it gave 9. The checker hardcodes `SELF_LANE = 'tabi'` (`check-adjacency.mjs:181`)
  and gave 9 in both.
- A sandbox reproducer has to know to name its clone `tabi-shokunin`.

## Absorption (asked) — holds, with the F6 caveat
- No row assigns another lane's scope to tabi.
- Musketeer is left to the integrator. The L0 line asks the integrator to rule kagi vs kake and does not adjudicate.
- Kake/kumitate splits quote the sibling naming tabi.
- No sibling file was written (read-only `git show` throughout).

## Smallest safe correction
1. Do not score adjacency on the row count. Report N=9 as a bookkeeping/operability artifact. Credit adjacency
   with at most the one new act (L0 :62, a reported contested scope), and only if the integrator accepts it.
   Otherwise adjacency stays 8→8 per the SCORECARD:747 precedent.
2. If any count is kept, count distinct new reports. Specifically:
   - exclude refusals present at B (rows 3, 4, 8, 9);
   - collapse rows that share one tabi line and one ruling/L0 line into a single unit (3/4, 6/7);
   - report the ruled row separately as routed-defect-5 closure, not in N.
3. Add the following rows (the L0 questions and rows are fleet/L1 acts):
   - revenger runtime-evidence and kama target-census/routing rows, as `contested-open` after filing the drafted
     L0 questions;
   - or list both in an explicit "known, not dispositioned" section of the map/README/lesson.
   Then change `check-adjacency.mjs:4` from "every real overlap" to "the overlaps dispositioned so far".
4. Add a gate rule plus a counter mutant: refuse `.ufo/` on the sibling side, and require the split/refusal
   ruling_quote to name the sibling lane (red on the mori and lore rows above).
5. Fix F6: either add an invocation row (`contested-open`, after an L0 question) or delete "and in
   `corpus/adjacency.tsv`" from note:104.
6. Make `measure-c3.mjs:1100` use the constant `tabi`, the same as the checker.

Not run: no browser and no lane gate run outside the sandbox. Sibling state was sampled 2026-10-20.
Tooling: no installs or updates.
Files written: .ufo/waves/round-17/w2/CriticC3Final.md
