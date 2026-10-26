# Round 34, wave 2 — CritAdjacencyHarm

Seat: no-harm attack on the adjacency axis (C1). Attacked: lane commit
`04f9623dde8ad35d470cecf766e421eafbcb47fa` against the freeze
`59f1b47aae277e1670e4a824173da8cde7e388ee` and the baseline
`15dfaccb34601c2d221c78501e2befd8998d600c`. Findings only; nothing repaired.

## Verdict

**No-harm legs hold; two defects land, one in the map (medium) and one in the round's own
prose (low-medium).** `PROVINCE.md` is byte-identical at baseline, freeze and integration
(sha256 `16c27b12…a946a` at all three). `corpus/adjacency.tsv` is append-only: the freeze file
is a byte prefix of the integration file (4 insertions, 0 deletions) and data rows 2–14 hash
identically (`2b1fc8c6…4a3d8`). `corpus/adjacency-screen.tsv` changed at exactly four file
lines — 31 (`kake PROVINCE.md:396`), 35 (`:411`), 39 (`:422`), 42 (`:440`) — three
`no-claim-declared`→`same-surface` relabels plus one note-only edit, with every quote
re-verified as a verbatim substring of the cited line at kake pin
`044048597d62f3199494b63b36e90dd57825e350` and every `same-surface` naming a map row verified
for kake; the round-33 frozen counter (sha `da59d157…c6380`) at the integration reads adjacency
clean 17/17, **unaccounted 0, screenFindings []**, with the same accounted counts as at the
freeze (screened 44 both), so the relabel is accounting-inert. No new screen or row absorbs
sibling ground and no row contradicts an existing row. What does not hold: **map row 15
(`live-delivery-observation`, kake `SKILL.md:408`) mints a new surface for the same two-sided
handoff already mapped as row 12 (`js-rendering-browser-execution`, kake `PROVINCE.md:61`)** —
the round's own counting rule says a restatement of a mapped boundary is `same-surface`, and
this is precisely the M3 rename shape that `corpus/lessons/round-34.md:25-26` asserts the
integration admits none of (that assertion is also premature and is contradicted by the same
file's `:76` and by `SCORECARD.md`, whose round-34 append carries no C1 disposition at all).
The smallest safe correction — screen `kake SKILL.md:408` `same-surface
js-rendering-browser-execution` and retire row 15 — was built in this seat's scratch clone and
measured: C1 counter exit 0, **predicate true, newMapped 3, unaccounted 0**, adjacency clean
16/16. The round has **zero slack**: 4 newMapped against a target of 3, and withdrawing row 17
as well (a row I attack and find sound) drops the predicate to false (newMapped 2, unaccounted
3, three `screen-surface-unmapped` findings).

## What I attacked, and the verdict on each

| # | target | verdict | evidence |
|---|---|---|---|
| 1 | `PROVINCE.md` unchanged between freeze and integration | **holds** | identical sha256 at `15dfaccb`, `59f1b47a`, `04f9623d`; `git diff --numstat` 0 lines |
| 2 | `corpus/adjacency.tsv` append-only, rows 2–14 byte-identical | **holds** | freeze file is a 4,954-byte prefix of the REV file (`cmp -n 4954` rc=0); rows 2–14 sha `2b1fc8c6…4a3d8` at both revs; numstat `4 0` |
| 3 | `corpus/adjacency-screen.tsv`: only rows 31/35/39/42 changed, each relabel verified against kake at its pin | **holds** | row-wise diff: exactly file lines 31/35/39/42; quotes verbatim against kake `PROVINCE.md` at `04404859…` (37 kake rows re-checked, 0 mismatches); surfaces `robots-txt-publisher-audit-vs-client-obedience` (:304, map row 13) and `crawler-discipline-vs-publishing` (:30, map row 6) both verified for kake; `:411` changed in the note column only |
| 4 | round-33 frozen counter at REV: unaccounted 0, screenFindings [] | **holds** | `c1-adjacency-sweep.mjs` sha `da59d157…` (= round-33 `frozenDigests`); REV: adjacency clean 17/17, candidates 52, mapped 8, screened 44, unaccounted 0, screenFindings []; freeze: identical accounted counts, rows 13/13 |
| 5 | any new row or screen absorbing sibling ground | **holds** | 62 screen rows: 35 `same-surface` (each names a surface mapped for the same sibling), 23 `third-lane-report`, 3 `no-claim-declared`, 1 `not-browser-sense` (kengaku journal-telemetry row, genuinely not browser ground); no screen converts sibling ground to tabi |
| 6 | any new row contradicting an existing row | **one defect (D1)** | row 15 duplicates row 12's boundary; rows 16/17/18 are new party-pairs or new subjects and contradict nothing |
| 7 | the lesson's claim that the wave-2 attack is done and no re-keyed row was admitted | **defect (D2)** | `corpus/lessons/round-34.md:25-26` vs `:76` and `SCORECARD.md`'s round-34 append (9 added lines, none about C1) |

## D1 — row 15 re-keys a mapped boundary (severity: medium)

Side by side, both sides of both rows (lane `corpus/adjacency.tsv` at REV):

```
row 12  js-rendering-browser-execution  kake  kake@04404859:PROVINCE.md:61
        sibling_quote: "browser execution stays tabi's"
        tabi_ref SKILL.md:2887  "executing a page in a browser to see what a crawler would render is tabi's"
        ruling_quote "canonical declaration and selection stay kake's"     split-declared
row 15  live-delivery-observation       kake  kake@04404859:SKILL.md:408
        sibling_quote: "route browser work to tabi, publishing/account actions to the operator"
        tabi_ref SKILL.md:2921  "every publishing or account action stay kake's and the operator's"
        ruling_quote "stay kake's and the operator's (kake `SKILL.md:408`)."  split-declared
```

The cited kake lines are the same boundary in near-identical words. `PROVINCE.md:61` continues
"…adjacent province and publication/account operations stay operator-owned"; `SKILL.md:408`
reads "| Need Google-selected canonical, HTTP headers, redirects, content duplication or JS
state | This tool cannot establish it; route browser work to tabi, publishing/account actions
to the operator |". Same sibling, same party pair (tabi ↔ kake/operator), same disposition —
and the new surface names a *capability subset* ("HTTP headers, redirects") of the one
browser-work handoff row 12 already records. The frozen counting rule in this seat's brief is
explicit: "count boundaries, not surface strings (a restatement of a mapped boundary is
same-surface)". Accepting the rename would let any admonition "route browser work to tabi" mint
an unbounded surface family (header observation, redirect chains, content duplication, JS
state) — duplicate authorities for one boundary, and a C1 headline of 4 where the independent
w1 clustering (`.ufo/waves/round-34/w1/ConnBoundaries.md:37`) found 3 new boundaries covering
9 candidates. The gate cannot see this: `duplicate_row` compares folded surface+sibling keys,
and the key is new by construction. This is the admitted-M3 shape ("three renamed surfaces on
lines restating an already-mapped kake split", `corpus/lessons/round-34.md:24`).

Residual evidence the L1 itself recorded: `corpus/lessons/round-34.md:76-77` — "Contested by
w1 ConnBoundaries and kept for wave-2 attack: row 15 (`SKILL.md:408` may restate row 12's
js-rendering split with a broader envelope)". Wave 2 is this seat; the attack finds for the
contest.

**Smallest safe correction** (measured, not proposed): delete `corpus/adjacency.tsv:15`; append
to `corpus/adjacency-screen-skill.tsv`
`kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:SKILL.md:408  same-surface
js-rendering-browser-execution  route browser work to tabi, publishing/account actions to the
operator  <note: the canonical-audit handoff restates the mapped browser-execution split>`;
and fold `SKILL.md:2921`'s content into the row-12 declaration (it is this round's own prose, so
no prior-round byte moves) so no declaration line backs a withdrawn row. Measured in scratch
clone commit `3df1297`: counter exit 0, predicate **true**, mapped 4, screened 63, unaccounted
**0**, newMapped **3** (rows 16/17/18), adjacency clean 16/16, screenFindings []. No screen row
references `live-delivery-observation` (0 rows), so the correction touches no other ledger row.

Counterargument tested and rejected: "delivery observation (headers/redirects) is a different
craft from JS rendering, so the boundary differs." It does not differ *as a boundary* — kake
hands both over in one sentence as "browser work", and row 12's own sibling quote ("browser
execution stays tabi's … publication/account operations stay operator-owned") already carries
the identical two sides. Distinguishing capabilities inside one handoff is what the tabi
declaration (SKILL.md:2921) is for, not what a second map surface is for.

## D2 — the lesson asserts the wave-2 outcome and SCORECARD has no C1 disposition (severity: low-medium)

`corpus/lessons/round-34.md:25-26` (committed in the integration) reads: "The integration admits
no row of that shape: every new row was attacked in wave 2 (round-34 SCORECARD disposition)."
Three problems, all checkable from committed bytes:

1. It is false as written: row 15 *is* a row of that shape (D1).
2. It contradicts the same file at `:76-77`, which says row 15 was **kept** for wave-2 attack —
   i.e. not yet attacked when the sentence was committed.
3. The disposition it points to does not exist: `git diff 59f1b47a 04f9623d -- SCORECARD.md`
   adds 9 lines, all about the BiDi gate sefltest tally; there is no C1/adjacency disposition.

An L1 may not claim a wave-2 attack result before wave 2 reports; the round's own killRule
("A counter not run is a claim not verified") is the same rule. Correction: amend this round's
own `:25-26` bytes to state that no row of that shape is *admitted unreviewed*, or replace the
wave-2 claim with the wave-2 findings once they land.

## Observations (no correction required, recorded so the closure can cite them)

- **O1 — freeze wording under-enumerates the relabel set.** `claims.json:noHarmRule` allows the
  `adjacency-screen.tsv` change "only by the routed relabel of its kake 396/422/440 rows", while
  round-33 spot-check routed defect 5 carries a fourth item in the same breath
  `corpus/lessons/round-33-verifier-spotcheck.md:166-167`: "CritScreenOthers: relabel kake
  396/422/440 … CritScreenCrawlerSplit: kake:411 note"). The integration changed four rows;
  `corpus/lessons/round-34.md:110-112` names all four ("rows 31, 35, 39, 42 relabelled … `:411`
  note"), so the change is disclosed and inside
  the routed defect; the frozen sentence is the imprecise text. Low.
- **O2 — relabel adjudication drift within one paragraph.** `kake PROVINCE.md:396` is screened
  onto `robots-txt-publisher-audit-vs-client-obedience` while its paragraph neighbours `:394`
  and `:398` are screened onto `crawler-discipline-vs-publishing`. The choice is defensible —
  `:396` is a disclaimer about robots.txt and crawler behaviour, and kake `:303`'s audit limit
  carries the same disclaimer — but a single paragraph now reads across two surfaces. Not harm:
  both surfaces are mapped and verified for kake, and the note states the reasoning.
- **O3 — zero slack.** newMapped 4 against target 3. Withdrawing row 17 (kotoba) as well as row
  15 drops the predicate to false: counterfactual commit `9edbdaa` reads predicate false,
  mapped 3, screened 61, unaccounted 3, newMapped 2, and 3 `screen-surface-unmapped`
  (`agent-facing-tool-text-craft` kotoba). The L1 cannot accept two row reversals without
  finding a replacement candidate.
- **O4 — the 62-row ledger is coupled to the new surfaces.** Six screen rows cite surfaces that
  exist only because of rows 16/17/18 (`adjacency-screen-skill.tsv` lines 4, 8, 9, 10, 59, 60).
  Reversing any of those rows without re-pointing its screens fails the counter
  (`screen-surface-unmapped`), as counterfactual B shows. Reversing row 15 is free (0 dependent
  screens).
- **O5 — row 17 (kotoba) attacked, holds; residual recorded.** `sibling-overlap-census-round49.md:171`
  says "tabi's round-16 wave drafts state a split with kotoba … over tool names, descriptions and
  schemas as agent-facing text", and `:175` says "a later round should ask tabi whether to land
  it"; tabi's new line at `SKILL.md:2923` lands it, so `split-declared` is the honest disposition
  and both quotes name the other side. Residual: kotoba's own cell still reads `none` at its pin,
  so a reader of kotoba's census can read a contradiction that the map sees as resolved; the
  screens at `:173`/`:175` record the `none` and the ask. Not a defect this round.
- **O6 — row 15's sibling_quote omits the deciding tokens.** The surface name rests on
  "HTTP headers, redirects", which lies outside the quoted span (the quote is the tail of the
  same table cell). This is the pattern round 33 only *noted* at kake `:411`. The map has no note
  column, so if row 15 were kept, the caveat would have to live in the lesson; it does not — the
  lesson's row-15 entry (`:76-77`) names only the restatement risk, not the omitted span.

## Evidence

Commands, exit codes and byte-level checks are in `CritAdjacencyHarm/commands.txt`; machine
readouts in this directory:

- `receipts.txt` — PROVINCE sha at three revs, freeze-is-prefix proof, rows 2–14 sha, numstat,
  the four changed screen lines, the four appended map rows.
- `r33c1-at-rev.json` / `r33c1-at-freeze.json` — round-33 frozen counter (exit 1 both; the exit
  class is unchanged from the freeze; the required readings are unaccounted 0, screenFindings []).
- `c1v2-at-rev.json` — round-34 C1 counter at REV: exit 0, predicate true, newMapped 4.
- `c1v2-cf-rowscreen.json` — counterfactual A (row 15 → same-surface screen): exit 0, predicate
  true, newMapped 3.
- `c1v2-cf-both.json` — counterfactual B (also row 17 withdrawn): predicate false, newMapped 2,
  unaccounted 3, 3 `screen-surface-unmapped` (the runner relayed no stdout on this invocation;
  the JSON is the readout, and its predicate-false class contracts to exit 1).
- `gate-at-rev.json` — `check-adjacency --at REV --json`, exit 0, clean 17/17.
- `gate-selftest-tail.txt` — `--self-test` exit 0, `cases=57 reasons=18 could_not_evaluate=6`.

Key one-liners (full log in `commands.txt`):

```
sha256(scripts/check-adjacency.mjs @ REV) = 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac   (pinned)
PROVINCE.md @ 15dfaccb / 59f1b47a / 04f9623d  -> 16c27b12…a946a  (identical)
cmp -n 4954 <freeze adjacency.tsv> <REV adjacency.tsv>  rc=0
round-33 counter @ REV: unaccounted 0, screenFindings [], adjacency clean rows 17 verified 17
round-34 counter @ REV: predicate true, newMapped 4, unaccounted 0
round-34 counter @ counterfactual-A: predicate true, newMapped 3, unaccounted 0
round-34 counter @ counterfactual-B: predicate false, newMapped 2, unaccounted 3
```

No network fetch was made, no browser was launched, no tool installed or upgraded, no lane file
or lane git/jj state written; the two commits `3df1297` and `9edbdaa` live only in this seat's
scratch clone `/fast/scratch/hyaku/tabi-r34/CritAdjacencyHarm/cf`, removed at yield.

## Deliverables

- report: `.ufo/waves/round-34/w2/CritAdjacencyHarm.md`
- receipts: `.ufo/waves/round-34/w2/CritAdjacencyHarm/` (files listed above)
