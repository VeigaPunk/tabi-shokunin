# CritC2Matcher — attack on the frozen C2 counter (`scripts/check-selfassessment.mjs`)

Seat: critic, leaf (no subagents, no lane edits, no lane builds/linters).
Round 29 / attempt 1 / wave w1; milestone C2.

## Subject under attack

- Counter bytes: `scripts/check-selfassessment.mjs`, sha256
  `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` — byte-identical at
  the lane tip (`35045d7`) and at the freeze commit `97be89b`; verified with `sha256sum` and
  `git show HEAD:... | sha256sum` (`counters.sha256`).
- Pre-doc-binding bytes: `856fa9e:scripts/check-selfassessment.mjs`, sha256
  `9bc6feb7207b6a1a3861c0c8f2804d481351c8c8a08f90b45903692932054d3f` (extracted to scratch as
  `old-counter.mjs`) — used to separate pre-existing defects from defects the doc binding
  introduced.
- Binding diff (`856fa9e..97be89b -- scripts/check-selfassessment.mjs`) is exactly three hunks:
  `citesLine(text, line)` → `citesLine(text, doc, line)` with a document-equality test on both
  call sites (`SCORECARD.md` in `m1Findings`, `LOG.md` in `m1LogFindings`), plus two new
  self-test cases. Nothing else in the matcher changed.
- Scratch: `/fast/scratch/hyaku/tabi-r29/CritC2Matcher`, one `git clone --shared` of the lane,
  `TMPDIR` under it, fixtures under `fx/ fx2/ fx3/`. Lane tip moved during the review
  (`190052c` → `59e8167` → `35045d7`); I measured all three and the frozen-baseline clone.

## Bottom line

The C2 target is met at the live tip (`mismatches=0` at `35045d7`), and the corrections that
landed are honest. But the counter does not require an exact correction: it requires a
**document-bound** correction. Once the document matches, the citation is a line *or an
arbitrary range* anywhere in that document, the "correction marker" is any occurrence of
`correct` (including "correctly"), and in the LOG window the oracle number may appear anywhere
in the paragraph for any reason. I reproduced four distinct false clears on real baseline bytes,
including a four-line blanket sweep that takes the real 6 → 0 while naming no stale line, and a
false clear of the real `LOG.md:221` by a sentence that says the cited number is *not* the
self-test tally.

The doc binding fixed exactly one thing (cross-document citation) and introduced no false clears.
Every remaining hole is pre-existing and inherited unchanged; the binding also inherited an
unbounded-range surface it did not close.

## Reproductions (all in the scratch clone of the lane, frozen counter bytes)

Baseline control, clean checkout of `856fa9e`, frozen counter:

```
$ node .../check-selfassessment.mjs --repo $S/clone --rev 856fa9e1202… --json   # exit=1
mismatches 6  cne 93  superseded 5
  SCORECARD.md 410  check-sources.mjs           25 -> 26
  SCORECARD.md 1138 round-evidence-audit.mjs    12 -> 13
  SCORECARD.md 1139 round-evidence-audit.mjs    12 -> 13
  SCORECARD.md 1151 round-evidence-audit.mjs    12 -> 13
  SCORECARD.md 1439 check-selfassessment.mjs    17 -> 20
  LOG.md      221  check-freshness.mjs           8 -> 12
```
Receipt `base.json`. Matches the claim's `before` exactly.

### S1 (HIGH, pre-existing) — a document-wide range citation clears every stale tally in the document

`citesLine` accepts `first <= line <= last` with no bound on width, no relation to the
correction's own position, and no check that the range is even inside the document. Four
appended lines, none of which identifies a stale line, take the real baseline 6 → 0:

```
+`scripts/check-sources.mjs` `--selftest` (26/26) supersedes the stale figure at `SCORECARD.md:1-2000`.
+`scripts/round-evidence-audit.mjs` `--selftest` (13/13) supersedes the stale figure at `SCORECARD.md:1-2000`.
+`scripts/check-selfassessment.mjs` `--selftest` (20/20) supersedes the stale figure at `SCORECARD.md:1-2000`.
+Correction: `scripts/check-freshness.mjs` `--self-test` measured `cases: 12` at the tip (supersedes `LOG.md:1-1000`).
```
```
$ git diff 856fa9e 2f5e33d | grep -c '^-[^-]'    # 0   (no stale line edited)
$ node ... --repo clone --rev 2f5e33d --json      # exit=0
mismatches 0  superseded 11   (all six stale tallies superseded)
```
Receipts `omnibus.json`, `omnibus.diff`, `omnibus.deleted_lines`, `omnibus.rev`.
Because `SCORECARD.md` is 1466 lines and `LOG.md` 2013 lines at the tip, a range like
`SCORECARD.md:1-2000` spans the whole document and `LOG.md:1-1000` half of it — a standing
licence: any future stale tally a range covers is cleared without re-examination. The frozen
predicate says "a line or range containing it", so the range is intended — but nothing
distinguishes a range that *contains* the stale line from a range that *swallows the document*.

### S2 (HIGH, pre-existing) — the LOG window clears on a number stated for an unrelated referent

`m1LogFindings` requires only `statedTallyNumbers(paragraph).includes(f.observed)`; the number
need not be a claim about the named script. On the real baseline this clears `LOG.md:221`
(`8 -> 12`) with a paragraph that explicitly says the 12 is not the tally:

```
+Correction: the audit table at `LOG.md:221` lists 12 cases for `scripts/check-freshness.mjs`
+that belong to its documentation matrix, not to `--self-test`.
```
```
$ node ... --repo clone --rev fdb2294 --json    # exit=1
mismatches 5  superseded 6 ; SUPERSEDED LOG.md 221 check-freshness.mjs 8 -> 12
```
Receipt `accidental.json`. (5, not 6: only `LOG.md:221` was targeted; the five SCORECARD rows
remain counted.)

### S3 (MEDIUM, pre-existing) — the correction marker is satisfied by the word "correctly"

`/supersed|correct/i` matches an assertion that the line is correct *as written*. Fixture
`fx3/M-log-correctly-marker` (stale `LOG.md:6` claims 12/12, oracle prints `cases=13`):

```
+Fact check: `scripts/check-fixture.mjs` correctly reports 13 cases at LOG.md:6.
=> exit=0 mismatches=0 SUPERSEDED LOG.md 6 12 -> 13
```
Control `fx3/N-log-no-marker-control` (same sentence, marker removed) => exit=1 mismatches=1.
Receipt `fx3.txt`. The stale line says 12; the "correction" says the 12 is correctly reported.

### S4 (MEDIUM, pre-existing) — an honest exact correction that quotes the before-value becomes a new mismatch

The claim extraction keeps only `claims[0]` per line, so a correction that writes
"was 8/8, now 13 cases" is itself a finding `8 -> 13`, and the paragraph cannot supersede its own
line (`p.start <= f.line`). Net effect of an honest correction: 1 cleared, 1 added.

```
fx/A-log-before-after-correction   exit=1 mismatches=2  (LOG.md 6 cleared nowhere: no citation; LOG.md 8 claimed 8 -> 13)
fx/B-log-before-value-second-line exit=1 mismatches=1  (LOG.md 6 superseded; LOG.md 9 claimed 8 -> 13)
```
Receipt `fx.txt`. The landed round-29 LOG correction reaches 0 only because it spells the old
figure as "eight" (`tip-35045d7.json`), not because any rule protects it. An author who writes
the before-value in tally shape is stuck at `mismatches >= 1` with a correct correction.

### S5 (MEDIUM, pre-existing) — quoted historical receipt output is counted as a current claim

`fx/J-sc-quoted-receipt-output`: a fenced block quoting an earlier run
(`FIXTURE_SELFTEST verdict=clean cases=12 passed=12`) in a section naming one gate is counted
`12 -> 13`. Receipt `fx.txt`. This is the live class that forced the round's seventh correction:
`SCORECARD.md:1438` says "`--selftest`: 5 cases at baseline", a historical before-value, and it
went from could-not-evaluate to counted the moment C1 landed (see C1 interaction).

### S6 (MEDIUM, pre-existing asymmetry) — a correct SCORECARD correction wrapped over two lines never clears

`m1Findings` examines single `lineText`; only the LOG path groups paragraphs. Fixture
`fx/F-sc-wrapped-correction`: correction `(13/13) supersedes the stale` / `figure at SCORECARD.md:5`
=> exit=1, `SCORECARD.md:5 12 -> 13` still counted. Same text on one line
(`fx/G-sc-document-wide-range`) clears. Receipt `fx.txt`.

### S7 (LOW-MEDIUM, pre-existing) — only the first tally on a line is judged

`fx/K-log-same-line-two-tallies`: `--selftest 12/12 earlier, now cases: 13` => `claims[0]=12`,
counted `12 -> 13` even though the line states the correct value. Same mechanism as S4, exposed
on a self-correcting line. Receipt `fx.txt`.

### S8 (LOW-MEDIUM, pre-existing) — one tally on a multi-script line is applied to every script named on it

`fx2/multiscript`: line names `check-fixture.mjs` and `check-other.mjs` with `(13/13)`; the
second gate prints `cases=9` => counted `13 -> 9`. The line's tally refers to one gate only.
Identical under old and frozen counters (`fx2.txt`).

### S9 (LOW, structural, instantiated by the doc binding) — self-referential oracle

`SCORECARD.md:1439` claims this gate's own case count. The binding added two cases (20 → 22), so
the oracle for `:1439` moved and the line needed a new correction stating 22
(`tip-35045d7.json` shows `claim 17 -> observed 22`, superseded by "(22/22)"). Any future case
addition re-stales that SCORECARD line. Not a defect in the matcher, but the doc binding for the
first time made the counter's own case count the measured number for a doc line.

## Attacks that correctly fail (so the defect is bounded)

- Correction placed **before** the stale line: `fx/C-log-correction-before-stale` => exit=1,
  `LOG.md:7 12 -> 13` still counted (`p.start <= f.line` guard).
- **Same-line** self-citation: `fx/D-sc-same-line-self-citation` => exit=1, `SCORECARD.md:5`
  still counted (`g.line > f.line` guard). A LOG line that cites itself
  (`fx2/log-selfline`) is likewise not cleared.
- **Cross-document** citation: independently reproduced the claim's control —
  old counter `mismatches=0, superseded=1`; frozen counter `mismatches=1, superseded=0` on the
  identical fixture (`fx2.txt`). The binding closed this hole and nothing else.
- No live correction regressed: all 5 findings already superseded at baseline remain superseded
  at the tip (`LOG.md 335, 391, 1090, 1103, 1664`); the binding introduced no false mismatch in
  the live documents.

## C1 interaction — the claim's `before` set and separability statement are wrong

`claims.json` C2 says `before: 6` and "If C1 does not land, SCORECARD.md:1438 stays
could-not-evaluate … and C2 is unaffected". At baseline `:1438` is indeed
`couldNotEvaluate: "self-test printed no tally"` (`base.json`). Measuring a rev where C1's gate
has landed but the SCORECARD is still at baseline (clone at `190052c` + the `59e8167` s106
script, commit `b63bdbe`) yields **7**:

```
$ node ... --repo clone --rev b63bdbeb… --json    # exit=1
mismatches 7  cne 92  superseded 5
  … SCORECARD.md 1438 check-s106-evidence.mjs  5 -> 7   (new; was could-not-evaluate)
  … SCORECARD.md 1439 check-selfassessment.mjs 17 -> 22 (oracle moved with the frozen counter)
```
Receipt `c1only.json`. C1 landing *does* add a C2-counted finding, so the before-set at the
measured REV is 7, not 6, and C2 is not independent of C1. The live tip still reaches 0 only
because the C2 seat appended a fourth SCORECARD correction for `:1438`
(`git diff 190052c 59e8167 -- SCORECARD.md`). That is a provenance/accuracy defect in the claim,
not a target failure — but a verifier reading `before: 6` against a C1-landed REV will see an
unexplained seventh finding.

Live measurement for completeness (frozen counter, clean checkouts, exit codes as printed):

| rev | exit | mismatches | superseded | note |
|---|---|---|---|---|
| `856fa9e` | 1 | 6 | 5 | claim `before`, reproduced |
| `2f5e33d` (baseline + S1 sweep) | 0 | 0 | 11 | 4 added lines, 0 deleted |
| `b63bdbe` (C1 gate on baseline docs) | 1 | 7 | 5 | `:1438` 5→7 appears |
| `59e8167` (C1 + SCORECARD corrections) | 1 | 1 | 11 | only `LOG.md:221` |
| `35045d7` (lane tip) | 0 | 0 | 12 | claim target met |

## Impacted axes

- **calibration (primary).** The counter's supersession grammar does not require an exact
  correction: document-level range citations and any coincidental occurrence of the oracle
  number clear stale tallies. The target 0 is attainable without addressing the six real tallies
  (S1). Conversely honest corrections that quote before-values or wrap across lines are counted
  as mismatches (S4, S6, S7), which pushes future authors away from exact, auditable corrections.
- **operability (secondary).** The C2 self-test (`cases=22`) contains cases for unrelated
  citation, cross-document citation, wrong number, timestamp and ambiguous association — but
  none for range-citation, marker-word, before-value-in-correction, fenced receipt quote,
  wrapped SCORECARD correction, or multi-script single tally. Every S1–S8 defect passes the
  suite, so the red/green record overstates the matcher's tightness.
- **freshness / depth / coverage / adjacency.** No impact; the counter reads no file C3 touches.

## Smallest safe correction (for the owner; I edited nothing)

1. Range citations: require the cited range to lie strictly above the correction and to be
   bounded (the stale line must be the range's first or last line, or the range ≤ N lines).
   Rejects S1 without touching the intended `1138-1139` form.
2. LOG window: require the oracle number to come from the correction line's own tally attached
   to the named script (reuse the SCORECARD finding rule) instead of `statedTallyNumbers`
   anywhere in the paragraph; require a supersession verb (`supersed|replac`), not `correct`.
   Rejects S2, S3.
3. Claim extraction: scan claims outside fenced blocks, and on a line carrying a citation plus a
   marker treat the line as a correction (or use the last tally, not `claims[0]`). Rejects S4,
   S5, S7.
4. Apply paragraph grouping to the SCORECARD path (parity with LOG). Rejects S6.
5. Add one self-test case per rejected class above (S1–S8); S8 needs a different fix — associate
   the tally with the script nearest the tally, not every script on the line.
6. Correct `claims.json` C2 `before` to include `SCORECARD.md:1438 (5 vs 7)` at a C1-landed REV,
   or state the before-set as of the C1-landed rev; the separability sentence should say C1
   landing *adds* `:1438`.

## Method / honesty

- No lane tracked file, lane index, lane jj state, fleet repo or sibling lane was written. One
  `git clone --shared` in scratch; all fixture repos under the scratch tree with
  `git -C <dir>` and a verified toplevel; lane reads were `git log/show/diff/status/sha256sum`
  only.
- No builds, linters or formatters of the lane. No network. No tools installed.
- Every number above comes from a run whose receipt is in
  `.ufo/waves/round-29/w1/CritC2Matcher/` (`base.json`, `omnibus.json`, `accidental.json`,
  `c1only.json`, `tip-59e8167.json`, `tip-35045d7.json`, `fx.txt`, `fx2.txt`, `fx3.txt`,
  `omnibus.diff`, `counters.sha256`). Unrun checks are not claimed.
