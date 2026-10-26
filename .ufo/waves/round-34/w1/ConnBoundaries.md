# ConnBoundaries — round 34 w1, C1 cross-check (independent boundary clustering)

## Verdict

Independent clustering of all 67 frozen candidates (c1-candidates.tsv rows 1–67; A=38, B=29) against the 13 existing map rows (corpus/adjacency.tsv rows 2–14) yields **3 genuinely NEW sibling↔tabi boundaries covering 9 candidates** — kake lab/field performance execution delegation (`SKILL.md:697`, `field-performance-cwv.md:153`), kotoba agent-facing-text craft split (`sibling-overlap-census-round49.md:171-175`), kasegi authenticated burnerchrome CDP 9222 submission driving (`SKILL.md:267`, `mission-control.md:119`, `ufo-workspaces.md:272`) — **8 existing-boundary groups covering 33 candidates** (all kaidoku CDP-runtime-observation, kake crawler-discipline/js-rendering/accessibility/lease, kagi lease, kama live-target-census, kumitate webbridge-internals) that restate mapped rows and should be screened same-surface, and **25 candidates that carry no tabi-overlap claim at all** (mori 8, tameshi 5, tsukuroi 2, kotoba census 7 + third-lane 2, chousa 1) and belong in the screen ledger (roster/census, third-lane-report, or no-claim-declared). No candidate straddles two disjoint boundaries; the only surface-string inflation risks are flagged (kake `SKILL.md:408` envelope vs the mapped js-rendering row; kagi `cdp-bridge-1password.md:70` third-lane attribution; kake `fire-journal-codes.md:27` operational CDP-use).

## Evidence

Commands run (read-only; no mutation of lane/fleet):

```
$ awk -F'\t' '{split($1,a,":"); n=split(a[1],b,"@"); if(n>=2){print NR"\t"b[1]"\t"$2"\t"a[2]":"a[3]} else {print NR"\t"a[1]"\t"$2"\t?"}}' \
    tabi-shokunin/.ufo/waves/round-34/baseline/c1-candidates.tsv
# exit 0 — rows 1-67 enumerated; counts: A rows 1-38 (kake 7, kotoba 11, kumitate 5, mori 8, tameshi 5, tsukuroi 2),
# B rows 39-67 (kaidoku 9, kagi 4, kake 6, kama 4, kasegi 3, kotoba 2, chousa 1) = 67 total, matches claims.json
```

- `corpus/adjacency.tsv` rows 2–14 read (13 verified rows): surfaces per sibling — kaidoku `cdp-runtime-observation` (ruled) + `reverse-engineering-of-shipped-artifacts` (refused-route), revenger (out of candidate set), kake `crawler-discipline-vs-publishing` / `musketeer-cdp-9222-profile-lease` / `js-rendering-browser-execution` / `robots-txt-publisher-audit-vs-client-obedience` / `accessibility-browser-at-execution`, kagi `musketeer-cdp-9222-profile-lease` / `secrets-vault-ops`, kumitate `kimi-webbridge-plugin-internals`, kama `cdp-live-target-census`.
- `scripts/check-adjacency.mjs:44-153` read: row semantics — surface = one overlap name; sibling_quote must be a verbatim substring of the cited line; disposition ∈ ruled/contested-open/split-declared/refused-route; screen ledger reasons per the C1 claim (not-browser-sense | same-surface | third-lane-report | no-claim-declared).
- `tabi-shokunin/PROVINCE.md` read (lines 1–21): tabi owns kimi-webbridge plugin internals, browser inventory/profile, CDP session discipline, dynamic-page evidence; refuses reverse-engineering (→ revenger/kaidoku), web publishing (→ kake), secrets (→ kagi). Confirms existing tabi-side quotes of rows 2/6/7/8/10/12/14 all live inside PROVINCE.md/SKILL.md.
- `tabi-shokunin/.ufo/waves/round-16/drafts/DraftAdjacency.md:39` (`grep` hit): "**C-C — tool names, descriptions and schemas as agent-facing text.** … kotoba owns the craft of such text … tabi records the observed text verbatim and its shape; it does not grade wording. Route craft findings to kotoba." — grounds G2 (kotoba split was drafted, never landed; `round-33/w1/ConnSiblingScan.md:88-92` records it as actionable, no current claim).
- tabi SKILL.md grep for `browser.ensure|browser-ensure`, `Lighthouse|CrUX|Core Web Vitals|lab score|CWV`, `burner.?chrome`, `agent-facing` → **no matches** (exit 1): tabi claims no performance-measurement surface today (G4 is a declaration the map would add, not a restatement); `browser ensure` (kake `fire-journal-codes.md:27`) is not tabi's command; `burnerchrome`/`agent-facing` absent from tabi SKILL.md, so G2/G11 rest entirely on the sibling-side declaration + a new tabi declaration.
- tabi repo grep for `webzites`: only historical round-17 draft records (province.md:6, AdjKagi.md:94-99, DraftProvince.md:19) — `webzites` not on PATH/absent; kake's `webzites lease acquire` (candidate row 56 = `mirror-pitfalls.md:40`) is the same lease mechanism as mapped row 7's sibling quote (`musketeer-cdp-9222-profile-lease`), not a new surface.
- Baseline controls read (`controls-summary.json`, `c1-J1-do-nothing.json`): baseline predicate false, unaccounted 66, mapped 1, newMapped 0 — consistent with this clustering's "33 restate / 9 NEW / 25 screenable" shape (unaccounted 0 requires all 66 unmapped candidates to be either mapped (9) or screened (57)).

## Boundary counts

| Kind | Groups | Candidates | Rows (c1-candidates.tsv) |
|---|---|---|---|
| Existing-boundary restatement (screen same-surface) | 8 | 33 | 1,2,4,6,7, 19-23, 39-61 |
| NEW boundary (map; new tabi declaration) | 3 | 9 | 3, 5, 9-12, 62-64 |
| Roster/census/third-lane/no-claim (screen) | 6 | 25 | 8, 13-18, 24-38, 65-67 |

Strongest candidate per NEW group: **G5** = `SKILL.md:697` ("Running the tool is tabi's work." — names the delegated action and its objects, Lighthouse/DevTools, and pairs with the limit "give no Core Web Vitals verdict (S036)"); **G2** = `sibling-overlap-census-round49.md:171` (names the boundary, both parties, and the exact tabi draft pin `DraftAdjacency.md:39`); **G12** = `mission-control.md:119` ("authenticated burnerchrome at CDP 9222" — names substrate, mode, and practice).
Kaidoku's nine B candidates (rows 39-47) all restate the ruled `cdp-runtime-observation` row: self-launched chromium CDP (9222/9232) target inspection, REA passive capture (Playwright/HAR/screenshots), and the explicit passive-limits line (`2026-10-13-r2-skill-references-deep.md:72` — never clicked/navigated/evaluated JS); none touches `reverse-engineering-of-shipped-artifacts`.

Inflation risks handed to the L1: (1) `SKILL.md:408` (row 1) restates the mapped js-rendering-browser-execution boundary with a broader envelope — if Adj seats mint a "live-delivery-observation" surface for it, that is one boundary re-keyed, not two; (2) kagi `cdp-bridge-1password.md:70` was already judged not-tabi in tabi's round-17 draft (shared browser is kake's webzites/kimi fleet) — third-lane-report screening is defensible, NEW is not; (3) `fire-journal-codes.md:27` reports CDP state without claiming ownership — no-claim-declared screening acceptable, NEW is not.

## Deliverables

- `.ufo/waves/round-34/w1/ConnBoundaries/boundaries.tsv` — group | sibling | candidate keys | existing-surface-or-NEW | one-line rationale (17 groups, all 67 candidates).
- `.ufo/waves/round-34/w1/ConnBoundaries.md` — this report.

No lane/fleet files were modified; no git mutations performed; no tools installed.
