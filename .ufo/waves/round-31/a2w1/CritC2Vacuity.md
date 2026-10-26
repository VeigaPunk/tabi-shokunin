# CritC2Vacuity — round 31 a2w1: is C2's `mismatches 0` at 4860483 vacuous or wrongly cleared?

**Verdict.** The frozen predicate holds and is not vacuous: at
`486048356f0712e4396588c9dab58cd419243120` the frozen v2 counter (sha256
`143d66ff…2fce`, clean checkout) exits 0 with `mismatches 0`, `couldNotEvaluate 103`,
`superseded 29`, and the zero is *caused* by the nine appended corrections — deleting them
restores exactly the freeze's nine (`M1`, exit 1). No gate silently dropped to
could-not-evaluate (103 before and after; the could-not-evaluate **set** is byte-identical, and
the finding-key diff between the freeze and REV loses nothing and adds only the nine correction
bullets, each with `claimed == observed`). Each of the nine stale lines is cleared by exactly
one paragraph that names **its** script and cites **its** line and nothing else (`pairing.tsv`:
nine lines, nine paragraphs, one citation each), so no neighbour bullet did the clearing, and the
README line is cleared only by the README paragraph (`M4` → 1 mismatch at `corpus/README.md:613`).
What does *not* hold is the claim's surface sentence: `mismatches 0` certifies nine digit-shaped
tallies, not "self-test tallies stated in SKILL.md gate-registry rows and corpus/README.md
frontier rows". A live stale tally inside that surface, `SKILL.md:1559` ("eight isolated CLI
cases" vs the gate's measured 12), is invisible to the grammar, and the round's own new status
row (`corpus/README.md:686`) enumerates only two exception classes, neither of which is the
word-numeral class that hides it. That is a **medium** disclosure defect, not a predicate
failure; it is fixable in a later append and does not require touching the frozen counter.

## What was attacked, and with what

Seat scratch `/fast/scratch/hyaku/tabi-r31/CritC2Vacuity` (one clone at REV, `status --porcelain`
= 0; mutations in a private `git init` fixture `$S/fx` built from the REV tree — commits there
carry `-c user.name=crit -c user.email=crit@scratch.local`, and `git -C $S/fx rev-parse
--show-toplevel` = `$S/fx`). Lane checkout read-only; no lane file, index or jj state touched; no
network access; no tool installed or upgraded.

| # | attack | command (see `commands.txt` for the full log) | result |
|---|---|---|---|
| A1 | reading at REV | `node scripts/check-selfassessment.mjs --rev 4860483… --json > c2-rev.json` | **exit 0**, `mismatches 0`, cNe 103, superseded 29, findings 183 |
| A2 | reading at the freeze | same, `--rev 9505a10…` | exit 1, `mismatches 9`, cNe 103, superseded 20, findings 174 |
| A3 | finding-set diff | `findings-diff.txt` | only-at-freeze **0**; only-at-REV 9 (the nine bullets, all `claimed==observed`); changed-at-same-key **9** (superseded false→true, claimed/observed unchanged); cNe set identical **true** |
| A4 | counter self-test | `--selftest --json` | exit 0, `{"cases":30,"passed":30,"ok":true}` |
| A5 | window integrity | `git diff --numstat FREEZE REV -- SKILL.md corpus/README.md SCORECARD.md LOG.md` → `22/0 25/0 4/0`; `git diff --stat FREEZE REV -- scripts/` → empty | 0 deleted lines; no scripts/ change |
| M1 | remove all nine correction paragraphs | fixture, `--repo $S/fx --rev HEAD --json` | **exit 1, mismatches 9** — the nine return, so the zero is theirs |
| M2 | one bullet states `(27/27)` instead of `(26/26)` | same | exit 1, `mismatches 1` at the bullet itself (`SKILL.md:2588`, claimed 27 / observed 26); `SKILL.md:1614` stayed superseded because the same paragraph's prose still restates `cases=26` |
| M3b | one s106 bullet citing `SKILL.md:2514-2544`, the other two s106 bullets deleted | same | **exit 0, mismatches 0**, with `SKILL.md:2514`, `:2529`, `:2544` all `superseded` on one `(10/10)` paragraph |
| M4 | delete only the README correction paragraph | same | exit 1, `mismatches 1` at `corpus/README.md:613` (claimed 17 / observed 30) |
| P1 | provenance of the correction prose | git archive snapshots at `fd722a7`, `b4128c4`, `97be89b`; blob identity at `5cdc976` | all checked claims true: `5cdc976` sources blob == REV blob `3f96058f…`; `5cdc976^` has 25 `selfTestCases` entries, `row-outside-registry` added by `5cdc976`; selfassessment `13→17` (`fd722a7` message + run), `20` (`b4128c4`), `22` (`97be89b`); release-pins `20` at `97be89b`; baseline `26/22/10/29` re-measured |
| P2 | round-30 receipts cited by the SCORECARD:1523 correction | `noharm-at-0ffc6ea.txt:130`, `noharm-at-d3cd62a.txt:1` | accurate: `mismatches=3` at `0ffc6ea`, and `SCORECARD.md:1527 claimed 12 observed 2` at `d3cd62a` |
| P3 | QUALITY 81 / lesson figures | `.ufo/waves/round-31/baseline/m8-proof/old-oracle-selftest.txt` | `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`, `exit=3` — as quoted |

### Pairing (`pairing.tsv`, verbatim summary)

| stale line | script | claimed → observed | clearing paragraph | paragraph citations | qualifying paragraphs |
|---|---|---|---|---|---|
| SKILL.md:1614 | check-sources | 25 → 26 | 2588 | `SKILL.md:1614` | 1 |
| SKILL.md:2479 | check-selfassessment | 13 → 30 | 2590 | `SKILL.md:2479` | 1 |
| SKILL.md:2514 | check-s106-evidence | 5 → 10 | 2592 | `SKILL.md:2514` | 1 |
| SKILL.md:2515 | check-selfassessment | 17 → 30 | 2594 | `SKILL.md:2515` | 1 |
| SKILL.md:2529 | check-s106-evidence | 7 → 10 | 2596 | `SKILL.md:2529` | 1 |
| SKILL.md:2530 | check-selfassessment | 20 → 30 | 2598 | `SKILL.md:2530` | 1 |
| SKILL.md:2543 | check-release-pins | 20 → 29 | 2600 | `SKILL.md:2543` | 1 |
| SKILL.md:2544 | check-s106-evidence | 7 → 10 | 2602 | `SKILL.md:2544` | 1 |
| SKILL.md:2545 | check-selfassessment | 22 → 30 | 2578 (freeze commit) | `SKILL.md:2545` | 1 |
| corpus/README.md:613 | check-selfassessment | 17 → 30 | 668 | `corpus/README.md:613` | 1 |

The "qualifying paragraphs" column counts every later paragraph that satisfies the counter's
five-part test (script named, correction marker, same-document citation containing the line,
observed number stated, `g.observed === g.claimed`). One each: the bullets are blank-line
separated, so the paragraph unit really is one bullet, and no bullet clears a neighbour's line.

## Findings

### D-1 (medium, disclosure — the surface is wider than the instrument)

`SKILL.md:1559` (gate-registry row for `scripts/check-freshness.mjs`): "`--self-test`; **eight**
isolated CLI cases assert exit and stable finding". Measured at REV: `FRESHNESS_SELFTEST
verdict=clean cases=12` (exit 0). The line is a self-test tally in a SKILL.md gate-registry row —
inside the claim's own surface sentence — and the grammar parses digits only, so it yields no
finding and no could-not-evaluate; `mismatches 0` is reachable with it still stale. Mitigation
present in the document, absent from the instrument and from the round's new status row: two
prose supersessions (`SKILL.md:1591` "This supersedes the registry's eight-case self-test count:
**12**"; `SKILL.md:2469` "(cases=12, measured round 24; the earlier ″eight isolated CLI cases″
figure is superseded)") state the right number but neither cites `SKILL.md:1559`, so under the
frozen predicate the old line would still stand even if it were parseable. The new row
`corpus/README.md:686` says calibration is "held for SCORECARD.md, LOG.md, SKILL.md and
corpus/README.md — gate tallies compared with each gate's own summary line; a gate whose summary
spells its count otherwise (`cli_cases=`) and multi-script lines stay unchecked" — it names two
exception classes; the word-numeral class, which holds the one live stale tally, is not among
them. `QUALITY.md:81` likewise covers only `cli_cases=`.

Same class, second instance: `SKILL.md:2521` — "Its case table has seven cases, including
measured-revision match and mismatch" (s106). The gate measures 10 at REV (`S106_SELFTEST
cases=10`), and the round-30 row `SKILL.md:2560` plus the `:2529` correction both state 10; no
correction cites `:2521`. It sits in the append-only Round-28 narrative, so it is defensible as
historical, but as written it is present tense and unchecked.

### D-2 (low, wrong-clearance capability — unused by the landed closure)

One correction paragraph citing a **contiguous range** clears every stale line of its script
inside that range on a single tally: M3b (s106 bullet, `SKILL.md:2514-2544`, one `(10/10)`)
reads `mismatches 0` with `:2514`, `:2529`, `:2544` all retired, while the paragraph's text speaks
about only one of them. The landed closure does not use ranges (each bullet cites one line), so
there is no live defect — but the predicate would accept a clearance broader than the statement
that justifies it. `citesLine` deliberately accepts ranges for the SCORECARD/LOG windows; the
round-31 windows inherited it unchanged.

### N-1 (note, not a defect) — the closure adds six live `30/30` statements

`SKILL.md:2576` (registry row), `:2578` (freeze-time correction), `:2590`, `:2594`, `:2598`, and
`corpus/README.md:668` now each assert 30/30 for `scripts/check-selfassessment.mjs`, and all six
are counted-or-superseding correctly today (A3 shows each at `claimed == observed`). One future
case addition stales all six at once; that is a maintenance cost of the append-corrections shape,
not a defect this round.

### Things that are *not* findings (checked, clean)

- C1's registry row coupling: `SKILL.md:2575` states `cases=34` and is measured at REV
  (`claimed 34 / observed 34`) — C1's row did not create a stale tally and did not need
  could-not-evaluate.
- No new tally statement added this round is stale or mis-classified: the nine bullets, the C1
  registry row, the SCORECARD:1523 correction bullet (no tally shape; the numbers it quotes —
  `mismatches 3`, residual `1`, `claimed 12 observed 2` — match the two committed receipts), the
  README round-31 rows (thresholds, not tallies), and the lesson/QUALITY (outside the window).
  The nine new findings are the only new parse results, and each is correct.
- Unparsed-but-correct tallies at REV, measured here: `SKILL.md:2474` `cli_cases=36 helpers=4`
  (`ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4`, exit 0),
  `corpus/README.md:591` "selftests 17/17 and 18/18" (`check-bfcache-receipt` and
  `check-source-reopen-receipt` read 17 and 18 in the counter's own findings at
  `SKILL.md:2498`/`:2499`), `SKILL.md:1591` "**12**" (freshness 12, exit 0),
  `SKILL.md:2030-2032` `--self-test`:N (`.ufo/waves/round-18/measure-c{1,2,3}.mjs` → `cases`
  lengths 38, 26, 38, exit 0 each), `SKILL.md:1988` "original11 cases" (round-18 historical
  prose, no gate path), `SKILL.md:2471` "cases=9/9" (one of the 103 could-not-evaluate, by the
  no-`scripts/`-path rule; the gate does measure 9).

## Impacted axes

- **calibration (C2, primary).** Predicate met on the frozen rule; the nine-line clearance is
  genuine and per-line. The residual gap is one live stale tally (`SKILL.md:1559`) plus a
  present-tense stale one (`:2521`) inside the declared surface, with the new status row's
  exception list incomplete.
- **coverage (secondary).** A scan of the two windows finds 18 script-plus-tally-bearing lines
  that yield no finding at all: eight name only paths outside `RUNNABLE_GATE` (`scripts/webmcp-*`
  at `SKILL.md:1867`, `:1941`, `:2041`, `:2102`, `:2103`, `:2141`, `:2390` and
  `corpus/README.md:405`), and the rest are runnable rows whose figure the grammar cannot read
  (the class D-1 names) or which carry no self-test tally (kill-coverage and contract rows).
  Nothing new is claimed for them.
- depth, freshness, operability, adjacency: untouched — no decision-table row, registry rule,
  pin or adjacency file is read or changed by these corrections.

## Smallest safe corrections (recorded, not executed; counter stays frozen)

1. **This round / next append (no counter change):** extend the round-31 calibration row's
   exception list at `corpus/README.md:686` to name word-numeral and historical-prose tallies, or
   append one more correction bullet of the existing shape — `` `scripts/check-freshness.mjs`
   `--self-test` (12/12): correction — supersedes the stale tally at `SKILL.md:1559` … `` (and the
   same for `SKILL.md:2521` if it is read as live). The parsed `(12/12)` makes the freshness tally
   verifiable instead of prose-only.
2. **Next freeze (instrument, not this round):** in the round-31 windows treat a range citation as
   could-not-evaluate (one citation per stale line) — closes M3b — and bind the supersession number
   to the tally adjacent to the script name rather than to any number anywhere in the paragraph
   (closes the M2 prose-`cases=` coincidence and w1's SG-1).
3. Nothing else: `SKILL.md:1591`/`:2469` already carry the right freshness figure; they only lack
   the citation that the frozen predicate would need.

## Artifacts

`.ufo/waves/round-31/a2w1/CritC2Vacuity/`: `c2-rev.json` (reading at REV, exit 0),
`c2-freeze.json` (reading at the freeze, exit 1), `findings-diff.txt`, `pairing.tsv`,
`m1-nocorrections.json`, `m2-wrong-number.json`, `m3b-range-clearance.json`,
`m4-readme-only-deleted.json`, `c2-selftest.json`, `freshness-selftest.txt`, `commands.txt`.
