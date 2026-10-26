# CritCorrections — round-34 w2 falsification of every correction landed at `04f9623`

**Verdict. The correction set holds on the bytes, with one low-severity arithmetic-basis defect and one nit.**
All eight tally lines in `SCORECARD.md` / `SKILL.md` state the right number (56/56: the gate's own summary at
`04f9623` reads `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56`, exit 0, against 44/44 at the baseline
`15dfacc`), each cites a line that is a real BiDi self-test tally at a stale value, and the calibration counter
resolves every one of them (the eight lines add exactly eight supersessions, 40 → 48, each `claimed 56 observed 56`).
The three draft corrections (`LOG.md`, `corpus/knowledge/webdriver-bidi-runtime-round-32.md`,
`corpus/lessons/round-32.md`) landed verbatim from `.ufo/waves/round-34/w1/ScribeCarriedLow/corrections.md` and every
figure in them re-derives on the committed bytes — with the single exception that the round-32-lesson block's
"`20 of 27` becomes 21" (defect, low: it mixes the capital-marker denominator with a dual-marked item outside it;
`corpus/lessons/round-32.md:224`). Append-only holds byte-for-byte on all five documents (identical prefixes,
1,184–4,200 appended bytes each), and `corpus/adjacency-screen.tsv` changed at exactly lines 31, 35, 39, 42 with every
quote, `sibling_ref` and row position untouched. The relabel is mechanically and semantically defensible at the kake
pin. Nothing in this seat's scope is a **blocking** defect: no landed number is wrong, no citation points at the wrong
line, no earlier byte moved.

## Axes named

| axis | what a failure looks like | outcome |
|---|---|---|
| A1 tally accuracy | a stated count the gate does not print | holds (56/56 at `04f9623`, 44/44 at `15dfacc`, 12 added cases exactly the `v3-a-*`/`v3-b-*` set) |
| A2 citation accuracy | a correction naming a line that is not the stale tally its own document holds | holds for 8/8 (one continuation line, `SKILL.md:2897`, is covered by its block head `:2894`) |
| A3 re-derivation | a drafted claim false on the bytes | holds for the LOG and knowledge blocks; one arithmetic-basis defect in the round-32 lesson block (F1) |
| A4 relabel | a row whose reason/surface is untruthful, or a quote not verbatim at the sibling pin | holds (4 quotes verbatim, surfaces mapped and kake-owned, counter silent) |
| A5 append-only | any earlier byte changed, or a change outside the relabelled rows | holds (byte-prefix equal on 5 docs; TSV changed only at 31/35/39/42) |
| A6 no-harm instrument | `check-selfassessment` non-zero or a gate red at REV | holds (`mismatches 0`, `clean true`, exit 0; `check-adjacency` 17/17 clean, exit 0) |

## Verdict per correction

| # | correction (landed site) | cites | verdict | evidence |
|---|---|---|---|---|
| 1 | `SCORECARD.md:1889` supersedes `:1657` (27/27) with (56/56) | `:1657` = "`scripts/check-bidi-runtime.mjs` `--selftest` (27/27)." | **holds**, nit F2 | counter: `SCORECARD:1657 claimed=27 observed=56 superseded=true` |
| 2 | `SCORECARD.md:1890` supersedes `:1784` (44/44) | `:1784` = round-33 correction "(44/44)" | **holds** | `SCORECARD:1784 claimed=44 observed=56 superseded=true` |
| 3 | `SCORECARD.md:1891` supersedes `:1787` (`cases=44 passed=44`) | `:1787` is the wrapped continuation of the `:1784` block | **holds** | `SCORECARD:1787 claimed=44 observed=56 superseded=true` |
| 4 | `SCORECARD.md:1892` supersedes `:1805` (44/44) | `:1805` = round-33 one-line restatement | **holds** | `SCORECARD:1805 claimed=44 observed=56 superseded=true` |
| 5 | `SKILL.md:2943` supersedes `:2626` (`cases=27, passed=27`) | `:2626` = round-32 registry row | **holds**, nit F2 | `SKILL:2626 claimed=27 observed=56 superseded=true` |
| 6 | `SKILL.md:2944` supersedes `:2817` (`cases=44, passed=44`) | `:2817` = round-33 registry row | **holds** | `SKILL:2817 claimed=44 observed=56 superseded=true` |
| 7 | `SKILL.md:2945` supersedes `:2894` (44/44) | `:2894` = round-33 correction block head (its continuation `:2897` carries the second `cases=44` token) | **holds** | `SKILL:2894 claimed=44 observed=56 superseded=true`; `:2897` stays `couldNotEvaluate: ambiguous script association` (no script token on that line — E31's rule), so the block head is the only citable site |
| 8 | `SKILL.md:2946` supersedes `:2907` (`cases=44, passed=44`) | `:2907` = round-33 wave-2 replacement registry row | **holds** | `SKILL:2907 claimed=44 observed=56 superseded=true` |
| 9 | `LOG.md:2383-2392` "a live 16-admitted reading" | `LOG.md:2370-2371` | **holds** | see §A3-1 |
| 10 | `corpus/knowledge/webdriver-bidi-runtime-round-32.md:252-263` v1 pointers | `:221-222` | **holds** | see §A3-2 |
| 11 | `corpus/lessons/round-32.md:214-227` marker basis | `:192`, `:194-197` | **defect (low), F1** | see §A3-3 |
| 12 | `corpus/adjacency-screen.tsv` rows 31/35/39/42 | routed defect 5, `corpus/lessons/round-33-verifier-spotcheck.md:166-167` | **holds**, frozen-text gap F3 | see §A4 |
| 13 | append-only on the five documents | — | **holds** | see §A5 |

## Findings

**F1 — defect, low severity: `corpus/lessons/round-32.md:224` mixes denominator bases.**
The appended block says "so it stays carried and `:194`'s "20 of 27" becomes 21 once E3 is counted." Under the basis
the same block states two lines earlier (`:192`'s 27 = the capital-`Carried` marker set), E3 is *outside* the 27 — it
is one of the four dual-marked items (`errata.md:33-35`). So the carried count rises to 21 items while the denominator
stays the 27 markers; "21 of 27" is not reachable under either basis. The contradiction is legible because `:224-225`
then says "The safe landing is the basis, not a new number", so the block asserts a number it also advises not to
assert. Nothing in the earlier bytes is harmed (`:192`, `:194-197` keep their text), and the errata marker sets,
E25's README landing (`corpus/README.md:699-703`), criterion 85 (`corpus/QUALITY.md:514-519`) and the table rows
(`:93` = the `E3, E6, E7, E8, E9` carried row; `:95` = E19 half-closed) all re-derive exactly.
*Smallest safe correction:* append one clause — "the carried set becomes 21 items (the marker basis's 20 plus E3); the
27 stays the marker denominator and E3 is named outside it."

**F2 — nit: the 27/27 supersessions attribute the whole delta to round 34.**
`SCORECARD.md:1889` and `SKILL.md:2943` supersede a 27/27 line with "(round-34 kill cases added)". Round 34 added 12
cases (44 → 56, the twelve `v3-*` ids, 0 removed); the 27 → 44 step is round 33's, as the round-33 correction at
`SCORECARD.md:1784-1788` / `SKILL.md:2894-2898` states. The number is right and the supersession is not false — only
the parenthetical invites a 29-case misreading. *Smallest safe correction:* on those two lines add "(the 27 → 44 step
is the round-33 correction above)". The six 44/44 lines are exact.

**F3 — low severity, frozen text only (not a landed byte): the `noHarmRule` names three relabel rows, four changed.**
`.ufo/waves/round-34/claims.json` `noHarmRule` says the ledger "may change only by the routed relabel of its kake
396/422/440 rows"; `04f9623` changes four (31/35/39/42). The fourth, row 35 (`kake PROVINCE.md:411`), is inside the
same routed defect — `corpus/lessons/round-33-verifier-spotcheck.md:167` names it separately
("CritScreenCrawlerSplit: kake:411 note") — and `corpus/lessons/round-34.md:110-112` lists all four rows, which is what
the clause's "each change listed in the round lesson" requires. Verdict on the bytes: holds. Residual risk: a literal
noHarm measurement reads `4 4 corpus/adjacency-screen.tsv` against a three-row licence. Do not revert the row; the L1
should record the four-row reading (routed defect 5 spans both seats' items) in the round-34 measurement note.

**F4 — observation, no severity: row 31's surface is not uniform with its block.**
Rows 30 (`kake :394`), 32 (`:398`) and 33 (`:408`) screen `same-surface crawler-discipline-vs-publishing`; the relabel
gives `:396` `robots-txt-publisher-audit-vs-client-obedience` because that line alone names robots.txt. Both surfaces
are kake-mapped split-declared rows (map rows 5 and 12) and the counter checks ownership only, so both cells are
truthful; the uniform alternative is recorded in `w1/ScribeScreenRelabel.md` §Alternative. A closure reader should
not read the block as uniformly mapped.

## A3-1 — LOG correction re-derived

| claim | check | result |
|---|---|---|
| `.ufo/waves/round-32/w1/ExecDriver/live.json` admits 16 | `cat` | schema `tabi-bidi-runtime-v1`, `population 16`, `admitted 16`, `failing 0`, `clean true`, `fixtureSha256 343cbced…2843` |
| fixture digest equals the measured revision's | `grep` on `.ufo/waves/round-32/measure/c1-live-at-0808688.json` | `343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843` — equal |
| added by `b234a58`, one commit after the freeze `4181fff` | `git log -- <path>`; `git log 4181fff..b234a58`; `git log -1 --format='%h parent=%p' b234a58` | one commit touching the file (`b234a58`), whose parent is `4181fff` |
| its `rev` does not resolve | `git rev-parse --verify c8ec4386…^{commit}` | exit 128, `fatal: Needed a single revision` |
| the measured revision resolves | `git rev-parse --verify 08086884…^{commit}` | exit 0 |
| F5 conclusion unchanged ("both readings postdate the freeze") | `git log --measure/c1-live-at-0808688.json` → `8fa57d2`; `git merge-base --is-ancestor 4181fff 8fa57d2` | exit 0 — the measured reading was recorded *after* the freeze too |
| the phrase it supersedes | `sed -n '2368,2372p' LOG.md` | "the live 16-admitted reading is at the measured revision" spans `:2370-2371` |

## A3-2 — knowledge correction re-derived

| claim | check | result |
|---|---|---|
| the round-32 gate is `b7d16fb` and digests to `2f25af5a…` | `git show b7d16fb:scripts/check-bidi-runtime.mjs \| sha256sum` | `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` |
| v1 `:124-133` is byte-identical to v2 `:186-195` | `cmp` of the two extracted blocks | identical |
| v1 pointers `:125` (comment), `:131` (404 branch), `:132` (200 branch) | `git show b7d16fb:… \| sed -n '124,133p'` | comment "Every response carries FIXTURE_HEADER and `cache-control: no-store`"; 404 branch sends `content-type` + fixture header only; 200 branch alone sets `cache-control` |
| v2 pointers `:187`, `:193`, `:194` | `sed -n '186,195p' scripts/check-bidi-runtime.mjs` | same three sites at the landed gate |
| the bullet's three pointers sit on `:221-222` | `awk 'NR>=218&&NR<=223'` on the doc | `:131` on 221; `:132` and `:125` on 222; the bullet body runs 220-223 |
| convention cited at `bidi-runtime-gate-v2-round-33.md:123`, v1 `:101`, v2 `:163` | `sed -n '123p'`; `git show b7d16fb:… \| sed -n '101p'`; `grep -n DATA_TEXT` | all three exact |
| "catalogue class E30 (positional citations an insertion undoes)" | `errata.md:160-163` | E30's title is "the citations are positional, so an insertion undoes the landing" — matches |

## A3-3 — round-32 lesson correction re-derived

Block-split of `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` (`- **E(\d+)` items + marker regexes, node):

```
items 43
capital Carried 27  4,6,7,8,9,10,12,13,14,16,17,18,20,21,22,23,24,26,27,28,30,31,32,33,35,37,38
Corrected here  12  1,2,3,5,19,25,34,36,39,40,41,42
No action        4  11,15,29,43
lower carried    4  3,19,25,36        dual (Corrected here + carried): 3, 19, 25, 36
```

Every cited span carries its marker: E3 `:33-35`, E19 `:111-112`, E25 `:140-142`, E36 `:193-194`, vocabulary
`:4-5` ("**carried** — round 32 owns it and it is not repaired here"). E25's landing at `corpus/README.md:699-703`
(that bullet names "ScribeErrata E25"); criterion 85 at `corpus/QUALITY.md:514-519` (the exit/verdict oracle rule);
the table's `:93` row is `E3, E6, E7, E8, E9 | carried — counter change refused this round … decision-table v2 not
claimed`; `:95` is `E19 | half-closed — v3 enforces the exit/verdict arm (criterion 85)`. Arithmetic re-checked:
19 capital markers inside E1–E27 − the 7 the table closes (E16, E21, E22, E23, E24, E26, E27) = 12, + the 8 beyond
E27 (E28, E30–E33, E35, E37, E38) = 20 of 27 — the `:194` figure holds; F1 is the only seam.

## A4 — the relabel, cell by cell

| row | kake ref | reason | surface | quote |
|---|---|---|---|---|
| 31 | `PROVINCE.md:396` | `no-claim-declared` → `same-surface` | `-` → `robots-txt-publisher-audit-vs-client-obedience` | unchanged, verbatim in the cited line, 14 words |
| 35 | `PROVINCE.md:411` | unchanged | unchanged | unchanged, verbatim, 8 words (note cell only) |
| 39 | `PROVINCE.md:422` | `no-claim-declared` → `same-surface` | `-` → `crawler-discipline-vs-publishing` | unchanged, verbatim, 10 words |
| 42 | `PROVINCE.md:440` | `no-claim-declared` → `same-surface` | `-` → `crawler-discipline-vs-publishing` | unchanged, verbatim, 11 words |

`sibling_ref` unchanged on all four; reason distribution 40 `same-surface`, 2 `not-browser-sense`, 1
`no-claim-declared`, 1 `third-lane-report`. Mechanical validity at `04f9623`: the round-33 counter reads
`screened 44, screenFindings [], unaccounted 0` (exit 1 only because its own `newMapped >= 4` target was already
missed at the round-33 integration), and `check-adjacency` reads `clean, rows 17, verified 17, findings 0` (exit 0) —
so both cited surfaces resolve to kake-mapped rows (map rows 5 and 12, split-declared) and no `screen-surface-unmapped`
finding exists. Ground at the pin: `:396` "…no robots.txt was served and no crawl was observed, so no crawler behaviour
is / claimed."; `:411` "re-grounded against a fresh retained body fetched 2026-10-25: `corpus/knowledge/yahoo-japan-…`";
`:422` "…no URL was served under test and no crawl was / observed."; `:440` "…no URL was served under test and no crawl
was observed." Row 31's note also cites kake `:303`'s audit limit — the pin's `:303` reads "This contract does not
observe live fetches, redirects, caching, or crawler behavior" (same disclaimer), so the note is true.

Semantic test of the relabel (the strongest counterexample): a disclaimer line can be read as "declares no claim"
(step 4) rather than "restates a mapped boundary" (step 2). Here step 2 wins because both halves of the mapped split
appear in the line — publisher-side robots.txt (nothing served) and client-side crawler discipline (no crawl observed)
— and the round-33 spot-check routed exactly this direction (`spotcheck.md:166`). The precedent inside the ledger is
consistent: row 11 screens kake `:303`'s disclaimer onto the same robots surface. No overlap is absorbed, no
`no-claim-declared` line is inflated into a map row.

## A5 — append-only, byte-prefix test at `04f9623`

```
LOG.md                                            base=187597 rev=190473 prefix-equal=true appended=2876
SCORECARD.md                                      base=156150 rev=160306 prefix-equal=true appended=4156
SKILL.md                                          base=285764 rev=289964 prefix-equal=true appended=4200
corpus/knowledge/webdriver-bidi-runtime-round-32.md base=25151 rev=26335 prefix-equal=true appended=1184
corpus/lessons/round-32.md                        base=22819  rev=24253  prefix-equal=true appended=1434
corpus/adjacency-screen.tsv                       lines base=46 rev=46   changed=31,35,39,42
```

`git diff --numstat 15dfacc 04f9623` over those paths: `30 0 LOG.md`, `39 0 SCORECARD.md`, `31 0 SKILL.md`,
`13 0 corpus/knowledge/webdriver-bidi-runtime-round-32.md`, `15 0 corpus/lessons/round-32.md`, `4 4
corpus/adjacency-screen.tsv` — zero deletions outside the relabelled rows. The draft's seven fenced blocks separate
cleanly: its **three correction blocks** (knowledge, LOG, round-32 lesson) land verbatim in the three documents, and
its **four stale-byte quotations** (`:220-223` and `:192`/`:194-197` of the two corrected bullets, plus the LOG
`:2370-2371` quotation) still match their documents — i.e. the stale bytes were not rewritten, which is the
append-only property itself. The only new bytes around them are the L1's `## Round 34 — correction …` headings, one
per document, and a single `## Round 34 — corrections` section per rolling document (no duplicate heading:
`grep -c '^## Round 34 — corrections' SCORECARD.md SKILL.md` → 1 each).

## Why LOG's own `cases=44` lines are correctly *not* superseded

`LOG.md:2154/2269` (`cases=27 passed=27`), `:2348` (`cases=44 passed=44`) and `:2395` ("gate self-test 44/44") carry
no script token on their own line; the calibration counter reports them `couldNotEvaluate: ambiguous script
association` (E31's rule), so a correction citing them would be inert — and a correction line is itself a tally. The
correction set's coverage of exactly the eight resolvable sites is therefore complete, not partial.

## Commands and exit codes (scratch clone at `04f9623`, baseline clone at `15dfacc`)

| command | exit | result |
|---|---|---|
| `git clone --shared … "$S/clone"; git -C "$S/clone" checkout -q --detach 04f9623…` | 0 | `rev-parse HEAD` = `04f9623dde8ad35d470cecf766e421eafbcb47fa` |
| `node scripts/check-bidi-runtime.mjs --selftest` (rev) | 0 | `cases=56 passed=56`; 56 `CASE id=` lines, ids unique |
| same at baseline `15dfacc` | 0 | `cases=44 passed=44`; id diff = exactly the 12 `v3-a-*`/`v3-b-*`, none removed |
| `node scripts/check-selfassessment.mjs --rev 04f9623 --json` | 0 | `mismatches 0 counted 0 superseded 48 couldNotEvaluate 116 clean true` (baseline: `mismatches 0 superseded 40 couldNotEvaluate 123`) — +8 = the 8 new lines |
| `node scripts/check-adjacency.mjs --at 04f9623 --repo . --fleet … --json` | 0 | `verdict clean rows 17 verified 17` |
| `node scripts/check-adjacency.mjs --self-test` | 0 | `cases=57 reasons=18` at both `04f9623` and the baseline (unchanged; receipts `adjacency-selftest-04f9623.txt`, `adjacency-selftest-baseline.txt`) |
| `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 04f9623 --repo "$S/clone" --fleet … --json` | 1 | `screened 44 screenFindings [] unaccounted 0` (its `newMapped>=4` target stays false, as at the round-33 integration) |
| byte-prefix / line-diff node one-liner (§A5) | 0 | prefixes equal; TSV lines 31/35/39/42 |
| draft-vs-landed containment node one-liner | 0 | 7/7 draft blocks landed verbatim |
| `git merge-base --is-ancestor 4181fff 8fa57d2` / `… 4181fff b234a58` | 0 / 0 | both postdate the round-32 freeze |
| `git rev-parse --verify c8ec4386…^{commit}` | 128 | `fatal: Needed a single revision` |
| `cmp` v1 `124-133` vs v2 `186-195` | 0 | identical |

No network fetch was made (nothing needed one), no browser was launched, no tool was installed or upgraded.
Scratch `/fast/scratch/hyaku/tabi-r34/CritCorrections` (two clones, `tmp/`, scratch TSVs) was removed before yield;
receipts were copied into the output dir first.

## Deliverable paths

- This report: `tabi-shokunin/.ufo/waves/round-34/w2/CritCorrections.md`
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/CritCorrections/`
  - `selftest-at-04f9623.txt`, `selftest-at-baseline.txt` (full `--selftest` transcripts)
  - `ids-baseline.txt`, `ids-rev.txt`, `case-ids.txt` (the 44 → 56 id delta)
  - `selfassessment-at-04f9623.json`, `selfassessment-at-baseline.json`
  - `adjacency-at-04f9623.json`, `r33-c1-at-04f9623.json`
  - `append-only.txt` (byte-prefix and line-diff table)
  - `relabel-cells.txt` (per-row reason/surface/quote, verbatim test against the kake pin)
