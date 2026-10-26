# ScribeScreenRelabel — round-34 w1 frontier: kake 396/422/440 relabel and the kake:411 note

**Verdict.** The round-33 routed defect 5 precision items are drafted as exact replacement rows and the
replacement is proved inert. `corpus/adjacency-screen.tsv` row 31 (kake `PROVINCE.md:396`) moves
`no-claim-declared`/`-` → `same-surface robots-txt-publisher-audit-vs-client-obedience` (the block it sits in is
Yahoo! JAPAN *robots.txt* refusal rules at the pin, and the line's own subject is "no robots.txt was served"), while
rows 39 and 42 (kake `:422`, `:440`) move `no-claim-declared`/`-` → `same-surface
crawler-discipline-vs-publishing` (neither line names robots.txt; both restate the client/publisher crawl boundary
that map row 6 owns and that their own blocks' rows carry). Row 35 (kake `:411`) keeps its reason, surface and quote
and gets a note that names the deciding token the quoted span omits. Quotes, `sibling_ref`s and line positions are
untouched, so the change is one reason cell, two surface cells and four note cells. Validated in a private clone at
the round-34 freeze `59f1b47aae277e1670e4a824173da8cde7e388ee` with a single probe commit
`e6ba5439a7f7661434eaae934dc0f873501b84f7`: the round-33 frozen counter reads
`candidates 52, mapped 8, screened 44, unaccounted 0, newMapped 3, screenFindings []` and `check-adjacency`
`verdict clean rows 13 verified 13 findings 0` — **byte-identical to the freeze control on every field but `rev`** —
and a negative control that points the `:422` row at a kaidoku surface is caught as
`screen-surface-unmapped` with `unaccounted 1`, so the surface cells are doing mechanical work rather than passing
by luck. Two limits are recorded rather than smoothed over: the round-33 counter's *predicate* is `false` at the
freeze and stays `false` (its `newMapped >= 4` target was already missed by the round-33 integration; this seat's
item is `unaccounted 0` / `screenFindings []`, not that predicate), and the round-34 `noHarmRule` names only the
three relabel rows while routed defect 5 also names the `:411` note — the L1 must list all four changed rows in the
round lesson (or drop the fourth) for that clause to read true.

## The lines at the pin (kake `044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md`)

Read with `git -C /home/vgpnk/Projects/shokunin/kake-shokunin cat-file -p <pin>:PROVINCE.md`; every quote below is
verbatim from the citation.

| line | text (excerpt) | block subject | deciding clause |
|---|---|---|---|
| 396 | `…更新日 2010年11月24日); no robots.txt was served and no crawl was observed, so no crawler behaviour is` (sentence ends `claimed.` on `:397`) | round-55, *Yahoo! JAPAN robots.txt rules* (`:385-399`; entries S372/S373/S418 are robots.txt files) | "no robots.txt was served" — publisher-side robots.txt ground, plus "no crawler behaviour is claimed" — the client-obedience half |
| 422 | `documentation says (the pages print 更新日 2010年11月24日); no URL was served under test and no crawl was` (ends `observed.` on `:423`) | round-56, *what a server's answer does to the crawl* (`:408-423`; S367/S419/S420, no robots.txt named) | "no crawl was observed" — the client-side crawl boundary |
| 440 | `operator's pages say (the pages print 发布日期 2022-09-09 and 2016-06-30); no URL was served under test and no crawl was observed.` | round-57, *Baidu dead-link handling* (`:429-447`; S421/S422) | same clause, no robots.txt named |
| 411 | `re-grounded against a fresh retained body fetched 2026-10-25: `corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md`` | round-56 provenance sentence | the deciding token is the knowledge filename, which the ledger's quoted span drops |

Why `same-surface` is the ordered answer (not `no-claim-declared`): `SKILL.md:2863-2881` asks step 2 ("does a
verification-passing map row already own that surface for that sibling?") before step 4 ("declares no claim …"), and
`SKILL.md:2879-2881` says a line that can be mapped truthfully must not be screened. kake owns both candidate
surfaces as map rows, both verification-passing at the evaluated revision:

- `corpus/adjacency.tsv:13` — `robots-txt-publisher-audit-vs-client-obedience` / kake / kake `:304` / split-declared
  ("kake owns publisher-side robots/sitemap placement at the host it serves, while browser-driving and client-side
  crawler discipline belong to tabi").
- `corpus/adjacency.tsv:6` — `crawler-discipline-vs-publishing` / kake / kake pin `7c61c8cc…:PROVINCE.md:30` /
  split-declared, whose text equals the frozen pin's `:34`.

The ledger already applies the same reading to the same wording family: row 11 screens kake `:303` ("This contract
does not observe live fetches, redirects, caching, or crawler behavior") `same-surface
robots-txt-publisher-audit-vs-client-obedience`, and row 13 screens `:323` onto the same surface. The three
`no-claim-declared` cells were therefore step-2-before-step-4 violations with the accounting intact — exactly the
round-33 w2 finding, now landed.

Surface split, grounded per line rather than uniformly: `:396` is the only one of the three that names robots.txt,
and its block is a robots.txt knowledge entry, so it takes the robots surface (the alternative `crawler-discipline-
vs-publishing` remains readable — see §Alternative). `:422`/`:440` name no robots.txt and their own block rows
(`:410`, `:411`, `:412`, `:418`, `:420`; `:431`, `:438`) are all `crawler-discipline-vs-publishing`, so they take
that surface.

## Replacement rows (delivered, verbatim — `relabel.tsv`)

`relabel.tsv` is the ledger header plus the four replacement rows in file order (ledger lines 31, 35, 39, 42). It
validates standalone as a 5-column ledger fragment (`validate-fragment.txt`, exit 0).

```
sibling_ref	reason	surface	quote	note
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:396	same-surface	robots-txt-publisher-audit-vs-client-obedience	no robots.txt was served and no crawl was observed, so no crawler behaviour is	Round 55's knowledge-entry disclaimer: no robots.txt is served and no crawler behaviour is claimed, so the publisher-side robots.txt ground and its client-obedience half are the mapped split (robots-txt-publisher-audit-vs-client-obedience, kake :304) whose :303 audit limit carries the same disclaimer; the line adds no second surface. (round-34: re-screened from no-claim-declared onto the mapped surface — CritScreenOthers, routed defect 5)
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:411	same-surface	crawler-discipline-vs-publishing	re-grounded against a fresh retained body fetched 2026-10-25	provenance sentence for kake's yahoo-japan-link-target-crawl-restriction entry; the deciding token (`corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md`) sits on the same line but outside the quoted span, which carries only the retained-body receipt; publisher-side knowledge citation, no tabi surface. (round-34: note names the omitted deciding token — CritScreenCrawlerSplit)
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:422	same-surface	crawler-discipline-vs-publishing	no URL was served under test and no crawl was	Round-56 opener's disclaimer (sentence ends at ':423' 'observed.'): no URL served under test and no crawl observed, so nothing is claimed on the client-side crawl ground; that client/publisher crawl boundary is already mapped (crawler-discipline-vs-publishing, kake :34) and the same block's rows carry it. (round-34: re-screened from no-claim-declared onto the mapped surface — CritScreenOthers, routed defect 5)
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:440	same-surface	crawler-discipline-vs-publishing	no URL was served under test and no crawl was observed.	Round-57 opener's disclaimer: no URL served under test and no crawl observed; the client-side crawl half is the mapped split (crawler-discipline-vs-publishing, kake :34) restated across rounds 52-57, so the line claims no new surface. (round-34: re-screened from no-claim-declared onto the mapped surface — CritScreenOthers, routed defect 5)
```

Changes per row: `:396` reason + surface + note; `:411` note only; `:422` reason + surface + note; `:440` reason +
surface + note. No quote, `sibling_ref` or row position changes — `git diff --numstat` is `4 4
corpus/adjacency-screen.tsv` and the hunks are `@@ -31 +31 @@`, `@@ -35 +35 @@`, `@@ -39 +39 @@`, `@@ -42 +42 @@`
(`diff-probe.diff`). Ledger sha256 `a9cced9fa1b9d243903f998c4353d79be18e85bfa41fac7176f611d4ca23e22f` →
`2c5133c31146ebca7c0dec81a52e9cd32b0b14e9cb47bac111277f3b25437cfb`.

### Alternative (recorded, NOT delivered)

If the L1 reads all three disclaimers as one boundary ("no X served / no crawl observed"), the uniform variant is
row 31 with `same-surface crawler-discipline-vs-publishing` and the same quote, plus a note reading "Round 55's
disclaimer restates the client/publisher crawl split on the robots.txt side, already mapped at crawler-discipline-
vs-publishing (kake :34)". It is step-2-ordered and the counter cannot tell the two apart (`same-surface` is checked
for ownership only); the seat recommends the per-line split above because `:396` alone names robots.txt. For `:411`
the stronger fix would be to extend the quote to `re-grounded against a fresh retained body fetched 2026-10-25:
`corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md`` (9 words, within bounds) instead of explaining the
omission in the note; the routed item names the note, so the seat did not take it, and both leave the disposition
identical.

## Evidence — commands and exit codes

Scratch `S=/fast/scratch/hyaku/tabi-r34/ScribeScreenRelabel`; `TMPDIR="$S"` on every counter run; every git call
names `-C "$D"` and `git -C "$D" rev-parse --show-toplevel` printed `$S/clone` before the commits.

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          # exit 0
$ git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee   # exit 0 (rev-parse HEAD = 59f1b47…)
$ sha256sum "$S/clone"/corpus/adjacency-screen.tsv …                                # a9cced9f… = lane worktree bytes
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 59f1b47… \
      --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json                # exit 1  (control; predicate false)
   {"predicate":false,"candidates":52,"mapped":8,"screened":44,"unaccounted":0,
    "newMapped":3,"screenFindings":[],"unaccountedKeys":[],
    "adjacency":{"verdict":"clean","rows":13,"verified":13,"findings":0}}
$ node validate.mjs full-freeze.tsv /home/vgpnk/Projects/shokunin                   # exit 0
   {"rows":44,"bad":0,"sameSurface":37,"reasons":{"same-surface":37,
    "not-browser-sense":2,"no-claim-declared":4,"third-lane-report":1}}
   … four edits applied to $S/clone/corpus/adjacency-screen.tsv (edit tool, exact old→new rows)
$ git -C "$S/clone" -c user.name=ScribeScreenRelabel -c user.email=…@scratch.local \
      commit -m 'probe: relabel kake 396/422/440 …'                                 # e6ba5439a7f7661434eaae934dc0f873501b84f7
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev e6ba543… \
      --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json                # exit 1  (probe; predicate false)
   {"predicate":false,"candidates":52,"mapped":8,"screened":44,"unaccounted":0,
    "newMapped":3,"screenFindings":[],"unaccountedKeys":[],
    "adjacency":{"verdict":"clean","rows":13,"verified":13,"findings":0}}
   field-by-field compare of the two runs: EQUAL_IGNORING_REV true, PERLANE_EQUAL true
$ node "$S/clone/scripts/check-adjacency.mjs" --at e6ba543… --repo "$S/clone" \
      --fleet /home/vgpnk/Projects/shokunin --json                                  # exit 0
   {"verdict":"clean","rows":13,"verified":13,"findings":[]}
$ node validate.mjs full-probe.tsv /home/vgpnk/Projects/shokunin                    # exit 0
   {"rows":44,"bad":0,"sameSurface":40,"reasons":{"same-surface":40,
    "not-browser-sense":2,"no-claim-declared":1,"third-lane-report":1}}
$ node validate.mjs …/round-34/w1/ScribeScreenRelabel/relabel.tsv …                 # exit 0 (4 rows, 5 cols each, quotes verbatim)
# negative control: row 422 surface -> cdp-runtime-observation (a kaidoku surface), commit 1a636a26…
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 1a636a2… … --json  # exit 1
   {"predicate":false,"screened":43,"unaccounted":1,
    "screenFindings":[{"row":39,"reason":"screen-surface-unmapped","detail":"cdp-runtime-observation kake"}]}
$ git -C "$S/clone" reset -q --hard e6ba543…                                        # exit 0; status --porcelain empty (0 lines)
```

Material numbers: 44 data rows before and after; reason counts `same-surface` 37 → 40, `no-claim-declared` 4 → 1,
`not-browser-sense` 2, `third-lane-report` 1. The remaining `no-claim-declared` row is kotoba `:73` (holds per round
33). `mapped 8` / `screened 44` are the round-33 integration's numbers (the crawl-budget row was withdrawn there;
row 6's surface is still owned), and neither moves here, as expected for a reason relabel.

## Findings and limits (recorded, not repaired)

1. **Round-33 counter predicate is `false` at the freeze and stays `false`.** `newMapped 3 < 4` is the round-33
   miss already dispositioned at `9f008f6`/`6f4053d`; this seat must not be read as claiming round 33's C1 target.
   The claim verified here is narrower: `unaccounted 0`, `screenFindings []`, gate clean 13/13, unchanged.
2. **`noHarmRule` wording vs routed defect 5.** `.ufo/waves/round-34/claims.json:75` allows
   `corpus/adjacency-screen.tsv` to change "only by the routed relabel of its kake 396/422/440 rows", while
   `corpus/lessons/round-33-verifier-spotcheck.md` §Routed defects 5 also routes "CritScreenCrawlerSplit: kake:411
   note". The seat item instructs the note, so it is drafted; the L1 must either list all four changed rows in the
   round lesson or drop row 35 — dropping it changes no counter number (note is prose-only) and no disposition.
3. **Surface choice is a judgement, mechanically unchecked.** The counter verifies only that a `same-surface` surface
   is carried by a verification-passing map row of the same sibling (v1:203-204); it cannot see that `:396` reads as
   the robots split and `:422`/`:440` as the crawl split. The negative control shows the *ownership* leg is live
   (`screen-surface-unmapped` when pointed at a kaidoku surface); the semantic leg is the round-34 attack wave's.
4. **Quote spans left as they were.** `:411`'s quote still omits the deciding filename (the routed defect was a note
   fix); the two `:422`/`:440` quotes carry the disclaimer itself, which is the deciding span. Extending `:411`'s
   quote is recorded under §Alternative and not delivered.
5. **Not run, by scope.** The round-34 v2 counter (`c1-adjacency-sweep-v2.mjs`) reads
   `corpus/adjacency-screen-skill.tsv`, not this ledger, so it was not run here; the round-34 `measure.sh` no-harm
   leg is the L1's. No browser, no network fetch, no tool install, no pacman transaction, no lane/sibling/fleet
   tracked file, no jj state touched; the only commits are the two probe commits inside `$S/clone` (verified
   `--show-toplevel` = `$S/clone`, `-c user.name=ScribeScreenRelabel`), and the clone was reset to `e6ba543…`

## Deliverables

- `.ufo/waves/round-34/w1/ScribeScreenRelabel.md` — this report
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/relabel.tsv` — exact replacement rows (ledger header + 4 rows)
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/c1-freeze.json` — round-33 frozen counter at `59f1b47…` (control)
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/c1-relabel.json` — same counter at `e6ba543…` (probe)
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/adjacency-relabel.json` — `check-adjacency --at e6ba543…` (clean 13/13)
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/c1-neg.json` — negative control `1a636a26…` (`screen-surface-unmapped`)
- `.ufo/waves/round-34/w1/ScribeScreenRelabel/diff-probe.diff`, `validate-freeze.txt`, `validate-probe.txt`,
  `validate-fragment.txt`, `validate.mjs` (the column/quote validator used here, scratch copy), `digests.txt`

Report: .ufo/waves/round-34/w1/ScribeScreenRelabel.md
