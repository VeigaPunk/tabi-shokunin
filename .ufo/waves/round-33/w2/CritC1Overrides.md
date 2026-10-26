# CritC1Overrides — round 33 wave 2 — C1: were the integration overrides aimed or evidenced?

Seat: CritC1Overrides (attack only; no repairs, no lane writes).
Attacked: the L1's C1 integration judgement at `042d6d9abf97d567d495652a85eabc851b81adc1` — the three overrides of the w1
draft dispositions that produced `corpus/adjacency.tsv:12-15`, measured against the w1 falsifiers
`.ufo/waves/round-33/w1/CritC1Counter.md` (D1) and `.ufo/waves/round-33/w1/CritC1Axis.md` (probes A/D).

**Axes.** adjacency (claimed, 8), calibration (the instrument's discrimination), provenance/record (the integration's
own account of its decisions).

## Verdict

**Defect — medium.** C1's frozen predicate holds at the integration revision (I reproduce `predicate true, mapped 9,
screened 43, unaccounted 0, newMapped 4, adjacency clean 14/14`, exit 0), so the claim is not falsified; what fails is
the reading "four new boundaries" and the record of how the integration reached four. Only one of the four rows was
drafted (kake:61 by AdjKakeA); the other three were created by the L1 reversing exactly three w1 **screen** decisions
(kake:79, kake:304, kake:347) — over all six draft ledgers there are 3 promotions, 0 demotions and 0 new screen rows —
and each of the three reversals is individually load-bearing: restoring any one draft disposition leaves
`unaccounted 0, newMapped 3`, predicate false, exit 1. Two of the three reversals are grounded in the sibling's own
bytes at the same pin (kake:79 via kake `SKILL.md:559-560` "tabi receives authorized browser/AT evaluation";
kake:304 because the line itself names tabi), so this is not indiscriminate target-chasing. The third and thinnest,
kake:347, names no lane, was read by its own slice seat AdjKakeB as "a search engine's own rate, not tabi's driving
rate", and is admitted only through a `tabi_quote` written this round. Independently, row 13 (kake:304) is a
**restatement of the boundary already mapped at `corpus/adjacency.tsv:6`**: its kake side ("publisher-side
robots/sitemap placement at the host it serves") and tabi side ("browser-driving and client-side crawler discipline")
are the two halves of the sentence row 6 cites, and the line tags itself "(PROVINCE.md, Adjacent)". The instrument
cannot see that (my variant E: the same line under the surface it restates is refused `duplicate_row`; under a fresh
label it is admitted), and the integration record misdescribes its own departures: lesson `:114-115` says kake 340–364
were "re-screened `same-surface`", but kake:347 was promoted to a map row, and the kake:304 screen→row reversal is not
recorded at all. Finally, all four rows name the other side through text written this round (4/4 `tabi_ref` =
`SKILL.md:2887-2890`) and 2 of 4 sibling quotes contain no `tabi`; my variant C2 shows the same count is reachable with
the single pre-existing `PROVINCE.md:16` line, i.e. the landed rows are not distinguishable by the frozen counter from
the CritC1Counter D1 / CritC1Axis probe-D constructions they exist to answer. Credit adjacency on distinct boundaries
(js-rendering and accessibility clear, crawl-budget arguable, robots a restatement), not on `newMapped 4`.

## Evidence

All work in one scratch clone: `git clone --shared …/tabi-shokunin $S/clone`, `checkout -q --detach 042d6d9a…`,
`rev-parse --show-toplevel` = `$S/clone` before every commit; commits only there
(`-c user.name=CritC1Overrides -c user.email=CritC1Overrides@scratch.local`). `TMPDIR=$S`,
`S=/fast/scratch/hyaku/tabi-r33/CritC1Overrides`. Frozen bytes used were the clone's: counter
`da59d157…c6380` = `claims.json:frozenDigests`, `scripts/check-adjacency.mjs` `4e2c2a64…24aac` = the digest pinned
inside C1 (receipt `frozen-digests.txt`; the counter echoes `adjGateSha256` in every JSON).
Commands and exit codes: `commands.txt`. Probe revisions: `revs.txt`.

### 1. Control — the landed revision reproduces the predicate (exit 0)

```
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$S/clone" \
     --fleet /home/vgpnk/Projects/shokunin --rev 042d6d9a… --json
EXIT=0  {"predicate":true,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
         "adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0}}
```
`newMappedRows` = rows 12 `js-rendering-browser-execution`, 13 `robots-txt-publisher-audit-vs-client-obedience`,
14 `accessibility-browser-at-execution`, 15 `crawl-budget-vs-client-crawl-thresholds`, all kake, all
`split-declared` (`landed.json`). File lines 12-15, header at line 1, data row 6 = the mapped kake split
(`landed-map-header-row6-newrows.txt`).

### 2. The reversal set is exactly three screen→map promotions, nothing else moved

Drafted ledgers (`.ufo/waves/round-33/w1/Adj*/screen.tsv|rows.tsv`) versus the landed ledger, as set differences:

```
draft screens 46   draft rows 1   landed screens 43   landed rows 4 new
comm -23 draft-screens.txt landed-screens.txt  ->  PROVINCE.md:304  PROVINCE.md:347  PROVINCE.md:79
comm -13 draft-screens.txt landed-screens.txt  ->  (empty)          # no screen was added
```
(`landed-rows.txt` holds 5 refs only because the slice `NR>=11` also catches the baseline kama row at file line 11; the
four new rows are lines 12-15.)
So: one drafted map row (kake:61), three drafted screens promoted (304 by AdjKakeB `same-surface →
crawler-discipline-vs-publishing`; 347 by AdjKakeB `not-browser-sense`; 79 by AdjKakeA `no-claim-declared`), zero
demotions.

### 3. Each promotion is individually load-bearing (counterfactuals, base = the integration revision)

Each probe keeps everything else as landed, restores **one** draft disposition, and re-runs the frozen counter:

| probe | what it restores | receipt | exit | reading |
|---|---|---|---|---|
| A | kake:79 screened `no-claim-declared` (AdjKakeA) | `A.json` | **1** | `unaccounted 0, newMapped 3, mapped 8, screened 44, clean 13/13` |
| D2 | kake:304 screened `same-surface → crawler-discipline-vs-publishing`, robots row dropped, its 4 dependant screens rekeyed (whole AdjKakeB slice) | `D2.json` | **1** | `unaccounted 0, newMapped 3, mapped 8, screened 44, clean 13/13` |
| B2 | kake:347 screened `same-surface → crawler-discipline-vs-publishing`, crawl-budget row dropped, its 4 dependant screens rekeyed | `B2.json` | **1** | `unaccounted 0, newMapped 3, mapped 8, screened 44, clean 13/13` |

`unaccounted 0` in all three: the loss is purely `newMapped`, i.e. the count — not coverage. All three promotions were
required; the drafts as written left `newMapped 1` (`AdjKakeA.md` counter line).

### 4. Per-row evidence: two reversals grounded, one not

- **kake:79** — the promotion is evidenced, though the row does not carry the evidence. kake `PROVINCE.md:79-80` at the
  frozen pin says browser/AT execution "stays separately authorized adjacent work", and kake `SKILL.md:559-560` at the
  same pin (`0440485…`) says "tabi receives / authorized browser/AT evaluation" (`kake-skill-558-561.txt`). AdjKakeA's
  `no-claim-declared` screen read only the PROVINCE sentence; the L1 read further. **This override is a correct
  reversal.** The row's `sibling_quote` (f4, "No actual website accessibility is evaluated. Browser/assistive-technology")
  still contains no `tabi`; the naming comes from the round-33 line, and the kake-side proof lives only in the tabi
  declaration's parenthetical (`SKILL.md:2889`), not in the row.
- **kake:304** — the line names tabi, so the naming test is met by the sibling. But the boundary it names is the one
  already mapped (see §5).
- **kake:347** — nothing on the kake side names a lane. kake `PROVINCE.md:340-348` (`kake-candidates-79-304-340-348.txt`)
  is a paragraph of publisher-side vendor knowledge ("Publishing / stays operator-owned"); `grep -i tabi` over the whole
  340–364 block returns **1** hit, on line **362** — a line the L1 itself keys to the already-existing js-rendering
  surface — and **0** on line 347 and on its own round-49 paragraph (340–351) (`kake-tabi-mentions-340-364.txt`).
  AdjKakeB's reading—"vendor fact that emergency backoff throttles the crawl host-wide — a search engine's own rate, not
  tabi's driving rate" (`.ufo/waves/round-33/w1/AdjKakeB.md`, per-candidate table)—is at least as strong as the mapping.
  This row is admitted only through `tabi_quote` = `SKILL.md:2890`, written this round. Note the asymmetry: the one line
  in that block that does name tabi was correctly not made a new row; the line that names nothing was.

### 5. Row 13 is a restatement of the boundary already mapped at `corpus/adjacency.tsv:6`

Row 6 (baseline bytes) cites `kake-shokunin@7c61c8cc…:PROVINCE.md:30` with the quote "`tabi` drives browsers and owns
client-side crawler discipline; kake owns" — and that sentence continues on the next line
(`PROVINCE.md:31`, `kake-adjacent-oldpin-28-36.txt`): "publisher-side placement **(robots/sitemap at the host it
serves)**." At the frozen pin the same bullet is `PROVINCE.md:34-35` (`kake-adjacent-frozenpin-30-36.txt`).

Row 13 cites `PROVINCE.md:304`, whose text is:
"Boundary: kake owns **publisher-side robots/sitemap placement at the host it serves**, while **browser-driving and
client-side crawler discipline** belong to tabi **(PROVINCE.md, Adjacent)**".

Both sides of row 13 are the two halves of row 6's mapped sentence, and the line itself points at the section row 6
quotes. The row's surface label is the only thing that differs.

The frozen counter cannot see this, and the gate's only defence is the label (my probe E: landed map plus the same
kake:304 as a row under `crawler-discipline-vs-publishing`):

```
node scripts/check-adjacency.mjs --at 8b447071… --repo "$S/clone" --fleet … --json   EXIT=1
findings: [{"row":16,"reason":"duplicate_row","detail":"surface=crawler-discipline-vs-publishing sibling=kake
            pin=kake@PROVINCE.md:304 first_row=6"}]
counter: EXIT=1  {"predicate":false,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
                  "adjacency":{"verdict":"failed","rows":15,"verified":14,"findings":1}}      (E.json)
```
Identical disposition, identical sibling, identical split: refused as a duplicate under the surface it restates,
admitted as a "new" boundary under a fresh one. That is CritC1Axis probe B's finding ("the predicate's true/false
boundary is the surface label, not the boundary reported") realised in a landed row.

### 6. The landed rows keep the w1 naming weakness, in narrowed form

Landed fields (`landed-map-header-row6-newrows.txt`, `tabi-skill-2883-2891.txt`): all four `tabi_ref` values are
`SKILL.md:2887`, `:2888`, `:2889`, `:2890` — the §"Round 33 — sibling-overlap declarations, tabi side" section written
this round. `sibling_quote` contains `tabi` on rows 12 and 13 only; rows 14 and 15 pass the naming test solely through
the tabi branch, i.e. through text the same round wrote to satisfy it. That is CritC1Axis probe D's shape, and the
frozen control J4 pre-identified it ("four split-declared rows on kake candidate lines whose quotes name neither
side ⇒ newMapped 0", `claims.json` C1 controls).

Probe C2 — the landed four rows with every tabi side replaced by the single pre-existing refusal line
(`tabi_ref PROVINCE.md:16`, `tabi_quote`/`ruling_quote` on the row-6 pattern):

```
counter EXIT=0  {"predicate":true,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
                 "adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0}}      (C2.json)
```
So the four distinct declarations buy nothing the instrument can see: the count is reachable with one pre-existing
line, exactly as CritC1Counter D1 showed at the freeze. The difference between the landed map and that construction is
prose-level only — which the claim discloses, and which is why the semantic credit is the only thing that can
distinguish them. It does not on row 13.

### 7. The integration record misdescribes two of its three departures

`corpus/lessons/round-33.md:114-119`:

> "AdjKakeB screened kake 340–364 `not-browser-sense`; the L1 re-screened them `same-surface` (crawl budget, canonical
> selection, crawler identity are publisher-side crawl knowledge on the mapped split), and kake 302/303/322/323 onto
> the new robots row; … AdjKakeA screened kake:79 `no-claim-declared`; the L1 mapped it instead …"

- **kake:347** is inside 340–364 and was **not** re-screened — it became a map row. The sentence is false for it, and
  it is the row with the weakest sibling-side evidence.
- **kake:304** was screened `same-surface` by AdjKakeB and became the robots row's cited line; the override paragraph
  never says so (it lists only 302/303/322/323 as moved "onto the new robots row").
- The parenthetical "…on the mapped split" is inaccurate for 340/342/343/345, which the ledger keys on the **new**
  `crawl-budget-vs-client-crawl-thresholds` surface, not on the mapped `crawler-discipline-vs-publishing`.

The admitted table itself (`:99-100`) is honest about the other half — "the tabi side of each is a line written this
round" — and the 43-row reason tally reproduces exactly (21 / 4 / 4 / 3 / 3 / 1 `same-surface`, 4 `no-claim-declared`,
2 `not-browser-sense`, 1 `third-lane-report`; verified by `sort | uniq -c` on the committed ledger). The defect is the
override ledger, not the tally.

## What holds (attacked, no defect)

- **The `kake:79` reversal is evidence-based, not target-driven**: kake's own `SKILL.md:559-560` at the pin names tabi
  as the receiver, so AdjKakeA's `no-claim-declared` screen was the weaker reading, and `SKILL.md` §Round 33 step 5
  ("never screen a real overlap") applies. This is the one override that would be wrong *not* to make.
- **The 340–364 re-screen is not aiming**: screens do not enter `newMapped`, so the override has zero counter effect
  (it moves reason labels only); and it corrects a real w1 error — kake:362 ("stays tabi's adjacent province for
  anything that executes a browser") is now keyed to the `js-rendering-browser-execution` surface it actually restates
  instead of `crawler-discipline-vs-publishing`.
- **The surface rename** (`a-js-rendered-canonical-vs-browser-execution` → `js-rendering-browser-execution`) has no
  counter consequence and no duplicate-detection consequence; cosmetic, harmless.
- **Coverage**: `unaccounted 0` holds in every probe including the three restored-draft variants, so no candidate was
  lost to a reversal. The 52-candidate accounting is sound.
- **Row 14's boundary is genuinely new** (publisher-side WCAG review preparation vs browser/AT execution — neither side
  appears in row 6); **row 12's kake side is new** (canonical declaration/selection vs publishing), though its tabi
  side ("drives browsers") is row 6's.

## Impacted axes

- **adjacency (claimed)** — the movement is real but smaller than the count: 2 clear new boundaries (js-rendering,
  accessibility) + 1 arguable (crawl-budget, whose tabi side is row 6's client-side crawl discipline) + 1 restatement
  (robots). Crediting `8→9` on `newMapped 4` alone credits a relabel; the round's own w1 axis report said to credit
  distinct boundaries only.
- **calibration** — the frozen counter and `check-adjacency` pass a relabelled duplicate of a mapped split (§5) and a
  self-authored naming side (§6). This is the disclosed limit, but the landed map now realises it; a closure that
  reads the predicate as sufficient harms calibration.
- **provenance/record** — the override ledger is wrong on kake:347 and silent on kake:304 (§7); a reader of the lesson
  alone would conclude no map row came from a reversed screen except 79.

## Smallest safe correction (report-level — I make no lane edits)

1. Closure: credit adjacency by distinct boundaries — rows 12 and 14 unambiguously, row 15 explicitly as a contested
   judgement, row 13 as **zero** (restatement of `corpus/adjacency.tsv:6`); record `unaccounted 47→0` as map
   completeness (calibration/no-harm), not as adjacency.
2. Lesson `:114-119`: replace the "re-screened them `same-surface`" sentence with the actual ledger — three
   screen→map promotions (79, 304, 347), each load-bearing, with 79's and 304's kake-side evidence and 347's absence of
   it; drop the "on the mapped split" clause for the crawl-budget screens.
3. Rows 14 and 15: carry the naming side on evidence, not declaration — for 79 cite kake `SKILL.md:559-560` (or make
   the declaration line's parenthetical part of the row); for 347 either accept `same-surface` on
   `crawler-discipline-vs-publishing` (then `newMapped 3` and C1 is red) or state in the row that the split is tabi's
   unilateral declaration (a `ruling_ref`-less `split-declared` currently reads as settled).
4. Counter (next round; frozen now): count newly-accounted *candidates* and refuse a new row whose surface differs from
   a mapped surface only by label while its sibling quote restates it (needs the semantic step, or at least a
   "sibling line self-cites the cited section" tell); require the tabi side of a split row to be pre-freeze text.

## Hygiene

- No lane tracked file, lane index, lane jj state, fleet repo, sibling repo or `shokuknow` was written; all edits and
  eight probe commits live in `$S/clone` (`rev-parse --show-toplevel` verified = `$S/clone`; the six used probes are in
  `revs.txt`). Two earlier probes are **discarded and cited nowhere**: a first `B` was built on a HEAD still carrying
  probe A's map, and a first `C` was built on that dirty state — both produced misleading counts and were replaced by
  `B2`/`C2` from a clean `042d6d9a` checkout (`git checkout -q --detach 042d6d9a… && git checkout -q -B v…` before each
  probe); no receipt file for them exists in the output dir.
- No browser, chromedriver or network fetch; `pgrep -fa 'chromedriver|chromium'` shows only the host's `earlyoom`
  argv line. Nothing to kill.
- No build/linter/formatter of the lane; no subagents; no `agent://all`.
- No tool installed or upgraded (nothing needed; `pacman` untouched).
- Scratch `/fast/scratch/hyaku/tabi-r33/CritC1Overrides` deleted after the receipts below were copied out.

## Deliverable paths

- This report: `.ufo/waves/round-33/w2/CritC1Overrides.md`
- Receipts: `.ufo/waves/round-33/w2/CritC1Overrides/` — `landed.json`, `A.json`, `B2.json`, `C2.json`, `D2.json`,
  `E.json`, `E-gate.json`, `*.code` (exit status per probe), `A-map.tsv`, `B2-map.tsv`, `B2-screen.tsv`, `C2-map.tsv`,
  `D2-map.tsv`, `D2-screen.tsv`, `E-map.tsv`, `draft-screens.txt`, `draft-rows.txt`, `landed-screens.txt`,
  `landed-rows.txt`, `kake-adjacent-oldpin-28-36.txt`, `kake-adjacent-frozenpin-30-36.txt`,
  `kake-candidates-79-304-340-348.txt`, `kake-skill-558-561.txt`, `tabi-skill-2883-2891.txt`,
  `lesson-override-paragraph-99-120.txt`, `landed-map-header-row6-newrows.txt`, `kake-tabi-mentions-340-364.txt`,
  `frozen-digests.txt`, `revs.txt`, `commands.txt`, `exit-codes.txt`.
