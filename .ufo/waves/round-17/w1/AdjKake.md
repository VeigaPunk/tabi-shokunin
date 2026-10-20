VERDICT: PASS

# AdjKake — C3 row fragment for sibling `kake`

Pins used: `kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c` (master),
`tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (master == observed HEAD),
`fleet@534852203d551f38c68e3a1efd26b6fbe7663267` (HEAD, `.ufo/l0-questions.md` clean).

## Rows written (2) — `.ufo/waves/round-17/adjacency/kake.tsv`

Row 1 — surface `crawler discipline: client-side vs publisher-side publishing placement (robots/sitemap)`
- sibling_ref `kake-shokunin@7c61c8c…:PROVINCE.md:30`, quote
  `` `tabi` drives browsers and owns client-side crawler discipline; kake owns ``
- tabi_ref `PROVINCE.md`, quote `web *publishing* (→ kake)`
- disposition `split-declared`, ruling_ref `-`, ruling_quote `-`

Row 2 — surface `the-musketeer Chrome profile lease (CDP 127.0.0.1:9222)`
- sibling_ref `kake-shokunin@7c61c8c…:PROVINCE.md:35`, quote
  `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)`
- tabi_ref `SKILL.md`, quote `a fresh throwaway profile per run under the run's own output dir`
- disposition `contested-open`, ruling_ref `NEEDS-L0`, ruling_quote `-`

## Pasted quote verification (each row's exact line)

```
$ git -C kake-shokunin show 7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md | sed -n '30p'
- `tabi` drives browsers and owns client-side crawler discipline; kake owns
$ git -C tabi-shokunin show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:PROVINCE.md | sed -n '16p'
web *publishing* (→ kake), secrets (→ kagi — session material is
$ git -C kake-shokunin show 7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md | sed -n '35p'
  The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)
$ git -C tabi-shokunin show 5859243183c4d7ac5429dfdb8a73ce0d9a43d583:SKILL.md | sed -n '556p'
- **Profiles**: a fresh throwaway profile per run under the run's own output dir
```
Substring re-checks (`grep -cF` over the pinned blob) returned 1 for all four quotes;
sibling quotes are 10 and 9 words (≤25), no TAB, 9 fields per row (`awk -F'\t'`).

Row 1 rationale: kake states both halves of the split at `:30` ("tabi … client-side
crawler discipline; kake owns" + `:31` "publisher-side placement (robots/sitemap at the
host it serves)"); tabi states the kake half of the same boundary at `PROVINCE.md:16`
(`web *publishing* (→ kake)`). Tabi names its own client-side half separately as
"rate/rights discipline" (`PROVINCE.md:10`). Asymmetry disclosed: tabi's PROVINCE does
not spell out "crawler discipline" — if L1 wants a fully two-sided wording, append a
PROVINCE line and replace `tabi_quote`; no current counter/checker predicate requires it.

Row 2 rationale: kake itself records the lease as unresolved and unruled —
`corpus/lessons/round-6-aggregator-audit.md:139` "kake↔kagi unadjudicated … open … no
ruling artifact", `corpus/lessons/round-10.md:62` "CDP-9222 lease ownership still
unresolved — reported, not absorbed". Tabi never claims the lease: zero `musketeer`/
`9222` hits in tabi PROVINCE/SKILL, and its rule is a fresh throwaway profile per run.

## Counter check (authoritative, `measure-c3.mjs` at the lane tip)

Assembled `corpus/adjacency.tsv` (header + these 2 rows) in sandbox
`/tmp/tabi-r17-AdjKake-RuGm` (clone + commits; removed afterwards):

```
$ node .ufo/waves/round-17/measure-c3.mjs e102946… --repo <sandbox> --fleet-root /home/vgpnk/Projects/shokunin
verified 1
0 True []
1 False ['ruling_ref_invalid']      # row 2 = NEEDS-L0, as instructed
checker checker_absent              # scripts/check-adjacency.mjs not yet written
```
Sensitivity (same sandbox, row 1 surface reverted to the first draft): `verified 0`,
row 1 → `['split_surface_unstated']`; control restore → `verified 1`. The counter's
`splitStatesSurface` needs a surface token inside each quote, hence the surface wording
(`publishing` in the tabi quote, `crawler` in the sibling quote).

## NEEDS-L0 (row 2) — no committed tabi L0 line exists

```
$ git show 5348522…:.ufo/l0-questions.md | grep -cE 'musketeer|9222'   → 0
$ git show 5348522…:.ufo/l0-questions.md | grep -nE '^tabi \|'         → 25 (round-5 approval), 34 (round-1 namespace)
```
Neither concerns the lease, so `ruling_ref` is `NEEDS-L0` and row 2 is expected RED
(`ruling_ref_invalid`) until an L0 line exists. C3 count contributed by this fragment: 1.

Drafted question for `.ufo/l0-questions.md` (one line, file format `lane | round | text`):

```
tabi | round-17 | The the-musketeer Chrome profile lease (CDP 127.0.0.1:9222) is unadjudicated: kake-shokunin/PROVINCE.md:35 calls it "contested scope (kagi/tabi/kake)" that "stays with the integrator"; kake's lessons record "no ruling artifact" (corpus/lessons/round-6-aggregator-audit.md:139, round-10.md:62); tabi's PROVINCE names no lease and its SKILL.md:556 requires a fresh throwaway profile per run. Decide: does the lease stay integrator-held, or does one lane own serialization (tabi or kagi)? tabi's own-profile rule proceeds either way, so no tabi work is blocked.
```

## Rejected candidate overlaps (reason)

1. `kake-shokunin/PROVINCE.md:22-23` "Crawl hygiene per host (robots.txt, sitemap
   scope, canonical signals)" — same crawler surface as row 1, no ownership claim over
   tabi's browser work and no split stated; would double-count one surface.
2. `kake-shokunin/PROVINCE.md:23` "canonical/JS rendering open" — JS rendering is
   tabi's capture domain, but the claim is publisher-side canonicalization; tabi has no
   counterpart line and no owner conflict is declared.
3. `kake-shokunin/SKILL.md:159-162` "Lease before browser … serializes the whole kimi
   fleet" — lease mechanics, same surface as row 2 (one row per surface); used as
   supporting evidence only.
4. `kake-shokunin/corpus/knowledge/mirror-pitfalls.md:38-52` "Browser/CDP lane"
   (`t<N>` renumbering, `agent-browser open --wait`, `SingletonLock`, `setsid`) —
   overlaps tabi's CDP session discipline, but it is ops history for the same shared
   leased profile (row 2 surface) and makes no ownership claim; r16 ruling parties are
   tabi/kaidoku. Report-only.
5. `kake-shokunin/corpus/knowledge/sitemap-orphan-audit.md:50-51` "crawl same-origin
   `href`s (BFS, stay inside base path)" — client-side crawl recipe inside kake's
   corpus; corroborates that row 1's overlap is live, but it is the same surface.
6. `kake-shokunin/SKILL.md:113` "pure HTTP, no browser" — kake avoids browsers for
   sync-check; a boundary statement, not an ownership overlap, and tabi states no
   counterpart.
7. `kake-shokunin/corpus/knowledge/crawl-scope-per-host.md` (whole note) — publisher-side
   robots/sitemap scope (RFC 9309/sitemaps); topic overlap only, covered by row 1.
8. `kake-shokunin/PROVINCE.md:6` "Refuses: anything outside this domain …" — generic
   refusal, no tabi mention and no surface.

## Notes for L1

- Do not edit row 2 to a disposition the counter accepts by construction: kake's own
  lines say contested + no ruling artifact, so `contested-open` is the only truthful cell.
- The fragment is rows-only (no header), ready to concatenate under `corpus/adjacency.tsv`.
- No `jj`/lane git write was run. Sandbox clone removed (verified absent). No tool
  installs or upgrades were performed.

Files written:
- .ufo/waves/round-17/adjacency/kake.tsv
- .ufo/waves/round-17/w1/AdjKake.md
