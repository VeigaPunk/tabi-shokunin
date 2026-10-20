VERDICT: ISSUES

Attacked: `corpus/adjacency.tsv` data row 2 (file line 3) at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`
— surface `reverse-engineering-forensics`, sibling `kaidoku`, disposition `refused-route`. Re-pinned all
three quotes, then attacked the disposition: split-vs-refusal, whether a ruling covers the sibling,
whether tabi is really refusing, and whether the overlap is real or a passing mention.

## Observed facts (M unless stated)

1. Row bytes (`git show M:corpus/adjacency.tsv | sed -n 3p`), NF=9:
   sibling_ref `kaidoku-shokunin@9011581d84527ba34c675f9cf912e54d2e72d470:PROVINCE.md:3`;
   sibling_quote `reverse engineering of shipped artifacts with REA on this Linux`;
   tabi_ref `PROVINCE.md:15`; tabi_quote `reverse engineering as forensics (→ revenger/kaidoku),`;
   disposition `refused-route`; ruling_ref `-`;
   ruling_quote `**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),`.
2. Sibling quote verbatim on the pinned line:
   `git -C kaidoku-shokunin show 9011581…:PROVINCE.md | sed -n 3p` →
   `**Domain:** reverse engineering of shipped artifacts with REA on this Linux`. Substring check: true.
3. Pin reachable from the sibling tip: kaidoku has no `refs/heads/master`; `refs/heads/main` =
   `b2aad08ceeee8dd125ce0d316056d8bd766c7f94`; `git merge-base --is-ancestor 9011581 refs/heads/main`
   → exit 0. Line 3 is identical at `main` tip. Gate `--json` tips record
   `kaidoku-shokunin: refs/heads/main`.
4. tabi quote on `PROVINCE.md:15` at M: line is exactly
   `**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),`; tabi_quote and ruling_quote
   are exact substrings (python `in` on the pinned blob: both true). `PROVINCE.md` at B `5859243` is
   byte-identical to M (`git diff B M -- PROVINCE.md` empty), so the cited refusal predates the round
   and is not evidence this wave authored.
5. Ruling: none exists and none is claimed. `ruling_ref -` is the required form for
   `refused-route` (`scripts/check-adjacency.mjs:82,766-781`); for these dispositions the gate reads
   ruling_quote only as "verbatim substring of the tabi file named by tabi_ref (there is no third file
   to pin)" (`check-adjacency.mjs:83-87`). ruling_quote is the same tabi sentence plus the
   `**Refuses:**` prefix — self-declared authority, by design, not an integrator adjudication.
6. Gates at M, executed in a sandbox clone (`git clone --no-hardlinks`, detached at M, removed):
   `node .ufo/waves/round-17/measure-c3.mjs 6c9785…` from the lane →
   `{"c3_adjacency_verified":9,"by_disposition":{"contested-open":2,"ruled":1,"split-declared":2,"refused-route":4}}`,
   this row `verified:true`; `node scripts/check-adjacency.mjs --at 6c9785… --fleet …` →
   `verdict=clean rows=9 verified=9 selfRulings=[2]` (selfRulings [2] is row 1 / file line 2, not this row).
7. Disposition is honest: tabi's line contains `**Refuses:**` and names kaidoku; kaidoku's quoted line
   claims the RE domain. tabi really refuses; the route is live with the sibling. This is *more* honest
   than the wave-1 draft (`w1/AdjKaidoku.md` recorded this row as `split-declared`): a split needs both
   sides, and kaidoku states no split.
8. Overlap is real, not a passing mention: sibling line 3 is kaidoku's `**Domain:**` headline for
   shipped-artifact RE with REA — the activity tabi's Refuses line routes away to `revenger/kaidoku`.
   It is one-sided: at the pin `git grep -i -w tabi 9011581 -- . ':(exclude).ufo'` → no hits; kaidoku
   never names tabi. Rows 2 and 3 (revenger) share the same surface, same tabi_ref/quote and same
   ruling columns; tabi names both lanes in one sentence.

## Issues

- I1 — surface name over-reads the sibling column. `forensics` does not appear in kaidoku's quoted
  line, and kaidoku's own corpus at the pin disclaims it: `corpus/README.md:150` "offline and bounded,
  not forensic"; `corpus/knowledge/2026-10-16-l7-04-inspect-sqlite-database.md:14` "forensic recovery …
  outside scope". Neither sibling PROVINCE (kaidoku, revenger) contains the word `forensic` at their
  pins. The word comes only from tabi's Refuses line (PROVINCE.md:15). So the label pairs `forensics`
  with a lane that rejects the label; the disposition survives, the surface name is not supported by
  the sibling quote.
- I2 — count granularity. Rows 2 and 3 are one tabi refusal (PROVINCE.md:15) counted once per named
  lane; only the sibling column differs. The checker dedupes on folded surface+sibling
  (`check-adjacency.mjs` ~:1000), so both verify. 9 verified rows therefore rest on 8 distinct tabi
  evidence lines (rows 5/6 likewise share `SKILL.md:556`, but that is a genuine two-party contest).
  "9 dispositions" overstates distinct adjudications; "9 (surface, sibling) pairs / 8 tabi evidence
  lines" is the honest restatement. The schema forbids a lane list (single-token equality), so splitting
  is the only representable form; the count wording, not the row, is the defect.
- I3 — peripheral, counter reproducibility: measure-c3 derives `ownToken` from
  `basename(laneRepo)` minus `-shokunin` (`measure-c3.mjs:1100`). Run with `--repo` pointing at a
  sandbox clone whose directory is not named `tabi-shokunin`, the identical command returned
  `c3_adjacency_verified=8` with `ruling_venue` on row 1 (line 2) plus `ruling_authority:null`.
  Both runs observed. The claimed 9 is checkout-directory-name dependent, so a PLAN-sanctioned
  sandbox run cannot reproduce the lane number as stated.

## Repair (concrete)

1. Rename the surface to `reverse-engineering-of-shipped-artifacts` (what both quotes actually say) or
   annotate the sibling-side disclaimer; keep quotes and `refused-route`. Do not convert to
   `split-declared` — kaidoku states no split.
2. Restate C3 as "9 verified (surface, sibling) pairs across 8 distinct tabi evidence lines", or note
   in the C3 report that PROVINCE.md:15 is a single refusal naming two lanes. Keep rows 2-3 (schema
   needs one lane per row).
3. Counter: derive `ownToken` from a `--own-token` argument or the lane's PROVINCE/tab identity rather
   than the directory basename, so a sandbox clone reproduces the lane count.

## Confidence

- Quote/pin verification, placement, gate results, and the counter discrepancy: high (commands above,
  two independent runners).
- I1 severity: high confidence in the textual facts; [INFERENCE] that the integrator would treat
  "RE of shipped artifacts" and "RE as forensics" as one surface. Not resolvable from committed text.

Tooling: no installs or upgrades. No git writes in the lane or fleet; sandbox clone removed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/AdjRow2.md
