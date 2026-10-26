# CritScreenRobotsCrawl — round 33 w2: the 11 screen rows on the three new kake surfaces

**Verdict: holds.** Each of the 11 screen rows at `042d6d9abf97d567d495652a85eabc851b81adc1` that cites
`js-rendering-browser-execution` (:23, :60, :362), `robots-txt-publisher-audit-vs-client-obedience`
(:302, :303, :322, :323) or `crawl-budget-vs-client-crawl-thresholds` (:340, :342, :343, :345) accounts for
a kake line that really sits on the kake half of that mapped surface, under the rule the ledger applies across
the 43-row corpus: a candidate goes on the surface whose subject it advances — the robots-audit block's lines
on the robots row, the crawl-budget block's on the crawl-budget row, the JS-rendered-canonical frontier's on
the js-rendering row, kake's other publisher-side crawl knowledge on `crawler-discipline-vs-publishing`. I read
all 42 kake candidates to test that rule, and the only block that splits is round 51: :362's subject is browser
execution (js-rendering), the rest of that block is crawler identity (`crawler-discipline-vs-publishing`).
No row maps a non-overlap, no candidate on these surfaces is a real overlap left to the screen, every quote is
a verbatim substring of the cited line at the frozen pin, and the frozen counter is clean at the revision
(`predicate true, candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4`, exit 0; map gate
`clean rows 14 verified 14 findings 0`, exit 0). The three new surfaces are not self-certified: their tabi
sides rest on pre-existing committed practice — `corpus/knowledge/rate-signal-decision-table.md:49-53` (D1–D5,
RFC 9309 robots rules) and `:54-61` (D6–D13, client-side rate thresholds). The L1's overrides of the w1 drafts
are justified, and the one for the coined surface name was *required*, not cosmetic (probe 1 below). I found
one **defect, severity low, documentation only**: `corpus/lessons/round-33.md:114` misstates what the L1
changed for kake:362 and includes :347 (which was mapped, not re-screened) in a set it describes as
re-screened — a provenance inaccuracy with no accounting effect. Two attribution nits (:60, :323) are named
with their smallest safe correction.

## What was attacked

The 11 rows are disjoint from the 9 mapped candidates (`mapped 9 + screened 43 = candidates 52`), all 11 are
present in `.ufo/waves/round-33/baseline/c1-candidates.tsv` at the exact pin
`kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:<line>`, and every surface they cite is a
verified map surface of the **same** sibling (`kake`), which is what `same-surface` requires.

Sibling pin check: `git -C kake-shokunin rev-parse refs/heads/master` → `04404859…`; the pin is that tip and
`merge-base --is-ancestor` exits 0. Worktree bytes equal the evaluated revision for every lane file quoted
here (`adjacency-screen.tsv`, `adjacency.tsv`, `SKILL.md`, `corpus/lessons/round-33.md`: sha256 worktree ==
`git show 042d6d9a:<f>`, four of four).

## Evidence

Commands and exit codes are in `commands.txt` in the deliverable dir. Frozen counter at the revision attacked:

```
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$D" --fleet /home/vgpnk/Projects/shokunin \
     --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --json        exit 0
{predicate true, candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4}
node scripts/check-adjacency.mjs --at 042d6d9a… --repo "$D" --fleet /home/vgpnk/Projects/shokunin --json  exit 0
{verdict clean, rows 14, verified 14, findings 0, selfRulings [2]}
```

Screen-row quote check, run independently of the counter against the sibling blob at the pin (11/11 pass):
5 TAB columns, reason in the closed vocabulary, quote a verbatim substring of the cited line, 5–13 words,
34–74 non-space characters. Per-row surface verdicts and the line taken from the sibling are in
`per-row-judgement.tsv`; the draft-vs-committed override table is in `override-diff.tsv`.

Surface validity, not taken on the declaration's word:

- `SKILL.md:2888` (robots) cites decision table D1–D5 — real rows at
  `corpus/knowledge/rate-signal-decision-table.md:49-53` (robots.txt redirect budget, unreachable period,
  cache age, 500 KiB parse limit).
- `SKILL.md:2890` (crawl rate) cites D1–D13 — D6–D13 at `corpus/knowledge/rate-signal-decision-table.md:54-61`
  are the lane's own request-rate thresholds (concurrency, weighted points, reset header, mutative spacing).
- `SKILL.md:2887` (JS rendering) cites dynamic-page capture; the map anchor is kake `PROVINCE.md:61`
  "browser execution stays tabi's", and `PROVINCE.md:362` carries the same words.

So the `split-declared` rows rest on practice this lane already had, not on a line written in the same commit
to make the count. The same-commit part is only the declaration sentence, which is what `split-declared` means.

## Defect found (low) — the override record, not the rows

`corpus/lessons/round-33.md:113-116` says: "AdjKakeB screened kake 340–364 `not-browser-sense`; the L1
re-screened them `same-surface` (crawl budget, canonical selection, crawler identity are publisher-side crawl
knowledge on the mapped split), and kake 302/303/322/323 onto the new robots row". Two inaccuracies against
`.ufo/waves/round-33/w1/AdjKakeB/screen.tsv`:

1. kake:362 was **already** `same-surface crawler-discipline-vs-publishing` in the draft, not
   `not-browser-sense`; the L1's actual change there was the **surface** → `js-rendering-browser-execution`,
   which the sentence does not record at all.
2. kake:347 was in the range the sentence calls re-screened, but the L1 **mapped** it (`adjacency.tsv` row 15,
   admitted in the table at `round-33.md:107`), so it is not a screen at all. The re-screened set is
   :340, :342, :343, :345, :352, :358, :359, :364.

Severity **low**: the committed ledger is correct and the counter is clean; only the prose that records the
override is inexact. The counts elsewhere in the same paragraph are exact (36 `same-surface` = kake 21 + 4 + 4
+ 3, kagi 3, kaidoku 1; 4 `no-claim-declared`; 2 `not-browser-sense`; 1 `third-lane-report`), which is what
makes the one wrong sentence worth correcting rather than tolerating.

## Nits (no correction required by the counter)

- **kake:60** (`adjacency-screen.tsv:8`) is a mid-sentence fragment; its line-local content is canonical
  observation plus "The broader crawl and" (`crawler-discipline-vs-publishing` vocabulary). It belongs on the
  js-rendering row only through :61, the map anchor — the note says so, so it holds; a judge demanding
  line-local evidence alone would see the alternative.
- **kake:323** (`:13`) sits on the robots row because it closes the round-38 robots-audit block, but its words
  restate `crawler-discipline-vs-publishing` token for token, and its near-twin kake:338 ("Boundary unchanged:
  publisher-side placement is kake's; client-side crawling stays with tabi.") sits on that other surface
  (`:14`). The note ("Same split restated…") does not state the block rule that reconciles the pair.
  Smallest safe correction, if the judge wants it: move :323 to `crawler-discipline-vs-publishing` (probe 2
  below: still `predicate true, screened 43, unaccounted 0, newMapped 4, screenFindings []`), or add one
  clause to the note. Either way one of the two rows is the consistent choice; leaving them split is a
  presentational inconsistency only.
- **Wave-seat voice in a durable file**: `adjacency-screen.tsv:7` says "this seat split-declares on the :61
  row". The ledger is a corpus artifact, not a wave report.

## Was each override justified? (the L1 vs the w1 drafts)

`override-diff.tsv` has the full table; the short answer is yes, and one override was mandatory.

- **Probe 1 — the coined surface name was not optional.** Keeping w1's `a-js-rendered-canonical-vs-browser-execution`
  on :23 and :60 in a clone-only commit (`4e20714efac9…`) gives
  `predicate false, screened 41, unaccounted 2`, with
  `screenFindings row 7 / row 8: reason screen-surface-unmapped, detail "a-js-rendered-canonical-vs-browser-execution kake"`
  (exit 1). The frozen definition requires a `same-surface` surface to name a mapped-verified row of the same
  sibling, and the coined name names none. The L1's rename to `js-rendering-browser-execution` (the map row's
  name at `adjacency.tsv` row 12) is what makes :23 and :60 count at all, and it also stops one overlap from
  carrying two surface names.
- **:302, :303, :322 → robots row** (drafts: `not-browser-sense`, `no-claim-declared`, `not-browser-sense`):
  justified. All three are the round-37/38 `robots_audit` block's own record coverage, limits and still-open
  list — the kake half of the surface mapped at kake:304. Calling a robots-record limitation "not browser
  sense" misdescribes it; `:303`'s `no-claim-declared` was also true, and the L1 chose the block-consistent
  reason, which is at least as truthful.
- **:340, :342, :343, :345 → crawl-budget row** (drafts: all `not-browser-sense`): justified and better.
  For :342 and :345 the draft reason was false on the line's face — those lines really are about a search
  engine's crawling, not a regex collision. `:340` is a heading and `:343` a filename citation, both inside
  the block the crawl-budget row maps.
- **:362 → js-rendering row** (draft: `crawler-discipline-vs-publishing`): justified. The subject after
  "JS rendering" on `:361` is "anything that executes a browser", exactly the JS-rendering split. See the
  defect above for the record not saying so.
- **:323 → robots row** (draft: `crawler-discipline-vs-publishing`): block-context justified, note
  incomplete; see the nit.

## Axis note

Adjacency axis: the 11 rows are sound; the correction worth carrying is the override-record sentence and, at
the judge's option, the :323 surface or its note. Nothing here changes the quota arithmetic
(`unaccounted 0`, `newMapped 4`), and no row on the three new surfaces screens a real overlap or maps a
non-overlap.

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/CritScreenRobotsCrawl.md`
- `…/w2/CritScreenRobotsCrawl/commands.txt` — every command with its exit code
- `…/w2/CritScreenRobotsCrawl/counter-at-042d6d9a.json` — frozen counter, exit 0, predicate true
- `…/w2/CritScreenRobotsCrawl/gate-at-042d6d9a.json` — map gate, exit 0, clean 14/14
- `…/w2/CritScreenRobotsCrawl/probe-coined-surface.json` — probe 1, exit 1, `screen-surface-unmapped` ×2
- `…/w2/CritScreenRobotsCrawl/probe-323-on-B.json` — probe 2, exit 0, still clean
- `…/w2/CritScreenRobotsCrawl/per-row-judgement.tsv` — 11 rows: surface, block, line reading, alternative, verdict
- `…/w2/CritScreenRobotsCrawl/override-diff.tsv` — draft vs committed reason/surface for the 11, with verdicts

Scratch `/fast/scratch/hyaku/tabi-r33/CritScreenRobotsCrawl` (one clone, probe commits `4e20714e…`,
`88fcbfd2…` on deleted branches, clone restored to the detached evaluated revision, `status --porcelain`
empty) is deleted before this seat yields; receipts are in the deliverable dir. No browser or driver was
started (`pgrep -fa 'chromedriver|chromium'` shows no line owned by this seat). No tool was installed or
upgraded.
