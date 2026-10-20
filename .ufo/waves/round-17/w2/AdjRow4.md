VERDICT: ISSUES

Attacked: `corpus/adjacency.tsv` data row 4 at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`
(file line 5; surface `crawler-discipline-vs-publishing`, sibling `kake`, disposition
`split-declared`) — pin reachability, verbatim quotes, the ruling slot, and whether the
disposition is honest (real overlap vs passing mention; declared split vs refused-route /
ruled / contested-open) under `PLAN.md:145-146` "both quotes must state the split".

## Row bytes at M (9 columns, no CR)

```
$ git show 6c9785…:corpus/adjacency.tsv | sed -n 5p | awk -F'\t' '{for(i=1;i<=NF;i++) print i"=["$i"]"}'
1=[crawler-discipline-vs-publishing]
2=[kake]
3=[kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:30]
4=[`tabi` drives browsers and owns client-side crawler discipline; kake owns]
5=[PROVINCE.md:16]
6=[web *publishing* (→ kake),]
7=[split-declared]
8=[-]
9=[web *publishing* (→ kake), secrets (→ kagi]
```

## Pins and reachability — HOLD (byte-verified, not just gate-green)

- Sibling pin resolves and is the sibling's tip itself:
  `git -C kake-shokunin rev-parse refs/heads/master` → `7c61c8cc791bde36dd5e3688bdfea2678d90146c`
  (identical to the pin); `git merge-base --is-ancestor 7c61c8cc… refs/heads/master` → exit 0.
  Checker `tips` records the ladder ref actually used: `kake-shokunin: refs/heads/master`.
- Sibling quote is verbatim on `PROVINCE.md:30` at that commit (10 words, 64 non-space chars,
  no CR): `- \`tabi\` drives browsers and owns client-side crawler discipline; kake owns`.
  Its predicate continues on the **unpinned** line 31:
  `  publisher-side placement (robots/sitemap at the host it serves).`
- `tabi_ref` `PROVINCE.md:16` at M: quote verbatim on that exact line (4 words / 23 non-space
  chars — exactly at the quote floor, a clause fragment ending in a comma). `PROVINCE.md` blob
  `c2222b16b3b18ce2c2058fb3a50d690c6e5735ae` is identical at B `5859243` and M (census-frozen).
- `ruling_ref` `-` is correct, not a dodge: this surface has no ruling. Fleet L0 at
  `refs/heads/master` (`839d8df4…`) has no kake/publishing/crawler ruling (kake rows are
  timer/FS/namespace; tabi rows 25/34/62 are approval, namespace, lease), and
  `git grep -i kake -- 'corpus/lessons/*verifier-spotcheck.md'` at M → 0 hits, so no non-tabi
  self-venue ruling exists either.
- Machine state at M: `node scripts/check-adjacency.mjs --at 6c9785… --fleet … --json` →
  `verdict clean, rows 9, verified 9` (9 rows / 9 verified entails the row verifies; the checker
  emits only the finding list). `node .ufo/waves/round-17/measure-c3.mjs 6c9785…` →
  `c3_adjacency_verified:9`, `by_disposition {contested-open 2, ruled 1, split-declared 2,
  refused-route 4}`, and row index 3 explicitly `verified:true, reasons:[]`.
  (Sandbox clone `/tmp/tabi-r17w2-AdjRow4-*`, detached at M, removed after.)

## Overlap — REAL, not a passing mention

- kake curates it: `PROVINCE.md:28` `## Adjacent`, `:30-31` the division sentence; kake's own
  `:22` Frontier lists "Crawl hygiene per host (robots.txt, sitemap scope, canonical signals)"
  (publisher-side), and `:13` names the properties/sitemaps it serves.
- tabi curates it: `PROVINCE.md:15-16` `**Refuses:** … web *publishing* (→ kake),` — kake appears
  exactly once in tabi's PROVINCE, in the formal refusal list. tabi's client-side practice is
  real, not aspirational: `SKILL.md:327` first request `/robots.txt`, a `Disallow:` match is
  **never issued**, first 429/403 stops the run; `corpus/knowledge/arc-synthesis.md:38`
  (robots-disallow stops before issuing, 429 `Retry-After` shape).

## Disposition — the honest label of the four, but not bilaterally declared by the pins

- Not `ruled` (no venue, above); not `contested-open` (no disagreement — both agree publishing
  is kake's; the 9222 lease is a different surface); not `refused-route`, because kake's pinned
  line does **not** claim the whole surface: it assigns the client-side half to tabi and keeps
  only publisher-side placement. So `split-declared` is the most accurate label. w1 adopted the
  joint reading (`w1/ConnSiblingWebmcp.md:77-78`), and the gate itself records the weakening:
  `scripts/check-adjacency.mjs:84-86` — "the committed refinement of 'both quotes state the
  split' is exact verbatim existence". The counter's `ruling_authority:null` on this row is
  consistent (no ruling claimed).
- But the split is declared **fully only by kake**. tabi's pinned line states only the cession
  (`publishing → kake`); tabi's own half is never stated as such. `git grep -i crawler` at M
  hits only `.ufo/waves/**` scaffolding/drafts, the map itself and `scripts/`; `PROVINCE.md`,
  `SKILL.md` and `corpus/knowledge/*` never contain "crawler". tabi's nearest own-half statements are
  `PROVINCE.md:3-4` ("driving real browsers against real sites with evidence discipline") and
  `:10-11` ("rate/rights discipline") — the latter is what w1 cited
  (`w1/AdjKake.md:39-44`), and that same report **discloses** the asymmetry, so nothing is
  concealed. Still, the row's `verified` attests pin + vocabulary, not a bilateral declaration.
- Field composition compounds it: (a) the sibling quote stops at "kake owns" — the object that
  makes it a division is on unpinned line 31 (structurally forced: the pin schema quotes exactly
  one line and the sentence spans two); (b) the "second tabi quote" in the `ruling_quote` slot is
  a longer substring of the **same** line 16, so it adds no second declaration and drags the
  kagi secrets route into a kake row. The w1 fragment had `ruling_quote "-"` (`adjacency/kake.tsv`);
  the final gate requires non-empty (`check-adjacency.mjs:624-634`), so this is a gate-filling
  artifact, compliant but semantically empty.

## Repair (concrete, verified admissible in sandbox)

1. Keep `split-declared`. Do **not** relabel `refused-route` — kake's line assigns the
   client-side half to tabi, so refused-route would misstate the sibling side.
2. Replace `ruling_quote` with an independent tabi statement of tabi's own half:
   `PROVINCE.md:4` → `browsers against real sites with evidence discipline.`
   (7 words / 48 non-space chars, distinct line). Probed in a sandbox clone with the gate at the
   mutated commit: `verdict clean rows 9 verified 9` (sandbox removed). Then the row's two tabi
   quotes state own-half + routed half instead of the same clause twice.
3. In the C3 narrative/lesson, state the asymmetry instead of implying bilateral declaration:
   the split is declared in kake's Adjacent list; tabi's side is a Refuses route plus documented
   rate/rights practice, and tabi's PROVINCE contains no "crawler" token at M.
4. If `PLAN.md:145-146` is meant literally per quote, the counter should report row 4 as
   declared-by-sibling (or the PLAN sentence should be amended to the joint reading the gate
   actually implements); as written, "9 verified dispositions" overstates this row's tabi side.

Tools installed/updated: none.

Files written: .ufo/waves/round-17/w2/AdjRow4.md
