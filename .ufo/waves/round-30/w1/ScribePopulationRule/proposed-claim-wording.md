# Paste-ready wording for the round-29 C3 population (routed defect 5 disclosure)

Three replacements the L1 can land as curation. Counts and ids are the measured ones at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`ScribePopulationRule/population-reasons.json`).

## 1. Claim sentence (`.ufo/waves/round-29/claims.json:47`, predicate)

Replace the clause `where each of the 23 on-release registry rows pinned to Chromium tag
154.0.8037.97` with:

> where each row of the counter's population is resolved — membership being
> `scripts/check-release-pins.mjs:178`, i.e. the row's recheck cell is `on-release` and its source
> cell literally carries `refs/tags/<A.B.C.D>/` for a tag below `--stable` (`:76`, `:128`) — which
> at 856fa9e is 23 ids: S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093
> S094 S096 S097 S098 S099 S100 S105 S106. Rows that are `on-release` and Chromium-release-coupled
> but outside that rule are named: six rows pinned only through the DEPS-selected devtools commit
> 66df492aaa0129d090937e933dd44c5389ab24d2 (S036, S044, S068, S088, S089, S090; excluded because
> the Chromium tag appears in the anchor cell, not the source cell) and three `main`-branch rows
> (S004, S028, S035). DEPS-pinned rows are not measured by this claim.

## 2. Report sentence (`.ufo/reports/round-29/tabi.md:13`)

> re-open the 23 registry rows the release-pin counter's population selects — `on-release` and
> source cell carrying a Chromium Gitiles tag below Stable (`scripts/check-release-pins.mjs:178`),
> listed in the claim — at the new Stable tag 156.0.8078.47 (trigger: new row S108). Six further
> `on-release` rows are coupled to the release only through the DEPS-selected devtools-frontend
> commit (S036, S044, S068, S088, S089, S090) and three through `main` (S004, S028, S035); the
> counter does not select them and this round did not re-open them (S044 was hand-checked).

## 3. Knowledge entry (`corpus/knowledge/chromium-156-release-pin-recheck.md:1`)

> # Chromium 156 release-pin recheck — 23 counter-selected on-release rows re-opened at the new Stable tag

with one appended line under the entry's `recheck:` block:

> Population rule: `recheck == on-release` and the source cell carries `refs/tags/<A.B.C.D>/` below
> Stable (`scripts/check-release-pins.mjs:178`). Not selected: six DEPS-pinned devtools rows
> (S036, S044, S068, S088, S089, S090) and three `main`-branch rows (S004, S028, S035).

Do not restate "pinned to 154.0.8037.97" as if it defined the set: S044's anchor does name tag
154.0.8037.97 (via DEPS line 424, verified today against
`refs/tags/154.0.8037.97/DEPS:424`), which is exactly why the count reads as a population claim.
