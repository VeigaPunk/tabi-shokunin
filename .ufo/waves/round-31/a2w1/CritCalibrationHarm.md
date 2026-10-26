# CritCalibrationHarm — calibration self-description vs observed state at 4860483 (round 31, a2w1)

**Verdict.** The measured calibration predicate holds and every number the round says it measured reproduces at
`486048356f0712e4396588c9dab58cd419243120`: `check-selfassessment --rev REV --json` exits 0 with `mismatches 0`,
`couldNotEvaluate 103` (identical to the freeze), `superseded 29`, the freeze tree reads `mismatches 9` with exactly
the nine tallies the claims name, the four documents lost 0 lines, `scripts/` is untouched, and both round-31 registry
rows are true when the gates are actually run (`cases=34 passed=34`, `cases=30 passed=30`). SHONEN.md was not touched
this round and each of its four `[~]` boxes still resolves to its cited anchor; the SCORECARD:1523 correction's two
committed readings are byte-accurate; the README's rate/crawl restatement lists only numbers that the landed rows carry
in located, live quotes. **One calibration defect survives, medium: `SCORECARD.md:1554-1557` still states, in the
present tense, that the gate-mutants tally at `:1527` "stays flagged by the calibration counter, which reads the first
`cases=` token in the output" — the exact oracle the round replaced — and no round-31 append cites those lines.** The
counter cannot see it (it reads tally shapes only), so the document that the new README row calls "held" carries a
false description of the instrument the claim is about, while SKILL.md:2569, README:666 and QUALITY.md:472-473 in the
same landing say the opposite. Two low-severity provenance defects follow (README pointer `QUALITY criteria 80–81`
puts a C1/depth criterion under the calibration row; QUALITY criterion 81's "able to fail" sentence describes an
isolated ablation whose receipt is a three-change revert), plus one round-record observation (the lesson asserts a
`w2 falsify` wave that was never spawned).

## Surfaces attacked (and what I did not attack)

1. SHONEN.md boxes vs evidence at REV.
2. SCORECARD.md round-31 sections — the freeze-time corrections (`:1439`, `:1465`, `:1486`) and the routed `:1523`
   correction — vs the committed readings and my own re-runs.
3. README "held" statements added this round (the calibration frontier row `:686`, the rate/crawl restatement and
   frontier row `:684-685`) vs the counter, the gates and the sources' quotes.
4. SKILL.md round-31 registry rows (`decision-table` `cases=34`, `selfassessment-counter` `cases=30`), the freeze
   correction paragraph, and the eight landing corrections vs each gate's own summary line at REV.
5. Lesson `corpus/lessons/round-31.md` wave/mistake statements where they describe instruments or method.

Not attacked: row-level C1 semantics (other seats), the C1/C2 counters' code quality beyond what these claims use, and
anything under `.ufo/` archival state that no tracked document cites.

## Setup

```
HYAKU_SCRATCH=/fast/scratch/hyaku; S=$HYAKU_SCRATCH/tabi-r31/CritCalibrationHarm
git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q 4860483…
git -C "$S/clone" status --porcelain | wc -l    # 0, before and after every run
sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs
  d15f3bd7…f6832  scripts/check-decision-table.mjs      == claims.frozenDigests
  143d66ff…b2fce  scripts/check-selfassessment.mjs      == claims.frozenDigests
```
No tool installs, no lane writes, no network fetch by me outside the C1 counter's `--live` mode (see Limitations).

## Holds — commands and exit codes

All runs in the clean clone at REV (`porcelain 0`), lane scripts only there.

| Command | Reading | Exit |
|---|---|---|
| `node scripts/check-selfassessment.mjs --rev 4860483… --json > $S/c2.json` | `mismatches 0`, `couldNotEvaluate 103`, `superseded 29`, `clean true` | 0 |
| same, `--rev 9505a10…` (freeze) | `mismatches 9`, `couldNotEvaluate 103`, `superseded 20`; counted = SKILL.md 1614 (25→26), 2479 (13→30), 2514 (5→10), 2515 (17→30), 2529 (7→10), 2530 (20→30), 2543 (20→29), 2544 (7→10), README 613 (17→30) — exactly `claims.json` C2.before | 1 |
| same, `--rev 96a2d1a…` (baseline) | `mismatches 5`, `couldNotEvaluate 110` (the four extra were 22-case-superseded at baseline, as the freeze note says) | 1 |
| `node scripts/check-decision-table.mjs --rev REV --baseline 96a2d1a… --entry corpus/knowledge/rate-signal-decision-table.md --live --json > $S/c1.json` | `population 13`, `admitted 13`, `failing 0`, `clean true`; rows D1–D13 thresholds 5,5,30,24,500,1,60,5000,100,900,90,0,1 | 0 |
| `git diff --numstat 9505a10… REV -- SKILL.md corpus/README.md SCORECARD.md LOG.md` | `4 0 SCORECARD.md`, `22 0 SKILL.md`, `25 0 corpus/README.md` (LOG absent) — 0 deletions | 0 |
| `git diff --name-only 9505a10… REV -- scripts/ \| wc -l` | `0` | 0 |
| `node scripts/check-decision-table.mjs --selftest` | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` | 0 |
| `node scripts/check-selfassessment.mjs --selftest` | `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30` | 0 |
| `node scripts/check-sources.mjs --self-test` | `SOURCES_SELFTEST verdict=clean cases=26` | 0 |
| `node scripts/check-release-pins.mjs --selftest` | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` | 0 |
| `node scripts/check-s106-evidence.mjs --selftest` | `S106_SELFTEST verdict=clean cases=10 passed=10` | 0 |
| `node scripts/check-gate-registry.mjs --rev REV` | `rows=38 gates=21 nonconformant=0` | 0 |

Both registry rows are true when the gate is run, not merely restated: `cases=34` (SKILL.md:2575 row) and
`cases=30` (SKILL.md:2576 row) equal the summary lines above. The freeze correction paragraph for `SKILL.md:2545`
and the landing corrections for `:1614 :2479 :2514 :2515 :2529 :2530 :2543 :2544` and `corpus/README.md:613` are all
`superseded=true` at REV (29 superseded findings).

**The corrections' historical figures also reproduce** (each gate run at the cited revision in the same clean clone):

| Citation in the round-31 corrections | Observed |
|---|---|
| selfassessment 17 at `fd722a7` | `cases=17 passed=17`, exit 0 |
| selfassessment 20 at `b4128c4` | `cases=20 passed=20`, exit 0 |
| selfassessment 22 at `97be89b` | `cases=22 passed=22`, exit 0 |
| s106 7 at the round-28 tip | `const CASES = [` at `b4128c4` holds 7 entries |
| s106 5 at the round-27 tip | `CASES` at `ef8aa4a` holds 5 entries |
| release-pins 20 at round 29 | `RELEASE_PINS_SELFTEST … cases=20 passed=20` at `f7c0317` |
| release-pins 29 after "+nine" | `cases=29` at `96a2d1a` and REV |
| `check-sources.mjs` blob at `5cdc976` identical and prints 26 | both blobs `3f96058fad6fd0163e9ec5f63347af4607e5646b`; `cases=26` |

**SCORECARD:1523 correction is accurate.** It cites `.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt` line 130 and
`noharm-at-d3cd62a.txt` line 1: those lines read `SELFASSESSMENT verdict=failed rev=0ffc6ea0… mismatches=3 …` and
`{"mismatches":1,…"doc":"SCORECARD.md","line":1527,"claimed":12,"observed":2}` — the claimed 3 and 1, and the claimed
residual entry, verbatim. Its pointer to `corpus/lessons/round-30-verifier-spotcheck.md §Routed defects 1` resolves
(`:147`) to exactly that sentence. This is the one routed round-30 defect the landing was required to fix, and it is
fixed with true provenance.

**SHONEN.md: holds.** The file is unchanged in `9505a10..REV` (`git log -- SHONEN.md` → last touch `5cdc976`), all four
boxes remain `[~]` (no promotion claim is made), and each cited anchor resolves at REV: `SKILL.md:697` =
"## Approval table — finalized"; `SKILL.md:1598-1617` = the kaika errata/decision-row section; `PROVINCE.md:3-19`
the domain/owns block; `corpus/knowledge/multi-step-journey.md`, `corpus/knowledge/executor-test-sufficiency.md` and
`corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` all exist; `LOG.md:76` is the round-3 entry.

**README "held" statements: the load-bearing ones are true.** The calibration row (`:686`) claims the counter reads
each gate's own summary line over the four documents, with `cli_cases=`-shaped gates and multi-script lines unchecked.
Observed: 50 live matched tally findings across the four documents, 29 superseded, `mismatches 0`; the unchecked
`cli_cases=` instance is `SKILL.md:2474`'s "(cli_cases=36, helpers=4)", and
`node scripts/check-aria-metadata.mjs --self-test` prints `cli_cases=36 helpers=4` — unchecked, but not wrong. The
rate/crawl restatement (`:684-685`) lists only numbers the C1 counter located live in the rows' quotes (5 / more than
5 redirects, 30-day example, 24 h, 500 KiB, 1 minute, 60, 5,000, 100 concurrent, 900 points, 90 s CPU, remaining 0,
1 s), and marks the declared limits derived as the entry does.

**Spot-check of an instrument claim I could verify cheaply:** `check-decision-table.mjs`'s `liveOk` requires
`https://`, HTTP 200, an `https://` effective URL on the same host and the quote in the normalised body
(`scripts/check-decision-table.mjs:203-213`), so the 13 admissions mean 13 live 200s with located quotes — not a
proxy-tolerant check like the frontier-admission gate's.

## Defect D1 (medium) — SCORECARD.md still describes the retired oracle, present tense, uncorrected

`SCORECARD.md` at REV, lines 1554-1557 (section "## Round 30 — corrections to the round-30 disposition"):

```
1554: The gate-mutants tally at `SCORECARD.md:1527` (12/12, observed by its own `--selftest` summary line
1555: `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12`) stays flagged by the calibration counter, which reads the
1556: first `cases=` token in the output — here a refusal message inside the per-case lines (`… cases=2 passed=1 …` of
1557: the `pristine-not-clean-could-not-evaluate` case). Restating 2 would be false; the residual finding is an instrument
```

Both present-tense assertions are false at REV:

* **"reads the first `cases=` token"** — v2 reads the last `<NAME>_SELFTEST … cases=N` summary line
  (`scripts/check-selfassessment.mjs:172-179`; regression case `v2-oracle-reads-summary-line-not-first-cases-token`
  passes in the 30/30 selftest). The landing itself says so three times: `SKILL.md:2569`, `corpus/README.md:666`,
  `corpus/QUALITY.md:472-473`.
* **"stays flagged"** — the finding for `SCORECARD.md:1527` in my REV run is
  `{"script":"scripts/check-gate-mutants.mjs","claimed":12,"observed":12,"superseded":false}` (matched, not flagged);
  only the frontier-admission pairing on the same line (`12` vs `24`) is superseded. Overall `mismatches 0`.

No round-31 append cites it: `grep -c "SCORECARD.md:155[4-7]"` in SCORECARD.md, SKILL.md, corpus/README.md and
corpus/QUALITY.md → `0` in all four; the round-31 corrections cite `:1439 :1465 :1486` and `:1523` only. The
correction that *does* discuss the mechanism (`:1568`) puts it in the past tense ("because the counter took the first
`cases` token") and does not touch `:1554-1557`, so the document now says both "it reads the first token and this
stays flagged" and "it reads the summary line".

Why this is calibration harm and not cosmetics: the C2 claim's own held statement is scoped to `SCORECARD.md`, and
this is the one stale instrument description the round's fix left in it. The counter is structurally blind here — it
reads tally shapes, so mechanism prose carries no finding — which is precisely why it needs a human-detectable
correction, not a counter change.

**Smallest safe correction.** Append to SCORECARD.md after the round-31 sections (append-only, cites the line in its own
document): a bullet on `SCORECARD.md:1554-1557` stating that the v2 oracle reads the gate's `<NAME>_SELFTEST` summary
line and that the gate-mutants pairing at `:1527` is 12 against 12 (matched) with the residual gone at
`4860483…` (`mismatches 0`). Do not delete or restate the line; and keep any new `cases=` figure in the appended
paragraph equal to the observed tally so the counter does not gain a new stale pairing.

## Defect D2 (low) — README calibration row points at QUALITY 80, a depth criterion

`corpus/README.md:686` (new this round): "… `scripts/check-selfassessment.mjs` (v2, round 31); **QUALITY criteria
80–81**". QUALITY.md:457-470 (criterion 80) is entirely about decision-table rows — threshold ownership, force,
`(derived)` marking, scope — i.e. the C1/depth surface; only 81 (QUALITY.md:472-481) is the calibration rule. A reader
sent to "80–81" for the calibration held is given a rule that does not govern it, and the round's own lesson M9 says
"no QUALITY criterion covers pointer precision on a frontier restatement".

**Smallest safe correction.** Append a one-line pointer note under the README round-31 section: the calibration row's
criterion is 81; 80 governs the rate/crawl rows. (Or restate the Pointer cell in the appended restatement table, since
the earlier row's bytes stay as written.)

## Defect D3 (low) — QUALITY criterion 81's "able to fail" sentence misdescribes its receipt

`corpus/QUALITY.md:476-478`: "the counter with the summary-line rule removed fails that case
(`.ufo/waves/round-31/baseline/m8-proof/old-oracle-selftest.txt`, `verdict=failed`, exit 3)". The named artifact is not
"the counter with the summary-line rule removed": `diff -u scripts/check-selfassessment.mjs …/m8-proof/old-oracle.mjs`
gives 6 hunks, 19 removed / 9 added lines, and the probe also drops the `lineOnly` window parameter and deletes the
case `v2-readme-no-section-fallback` (`grep -c v2-readme-no-section-fallback old-oracle.mjs` → 0), which is why the
receipt prints `cases=29 passed=28`, not 30. The probe's sha256 (`bfc9682b…3962855`) and the failure attribution (the
only FAIL is `v2-oracle-reads-summary-line-not-first-cases-token`) are correct, and lesson M1's "Limit" paragraph
discloses exactly this. The defect is that the *criterion* — the normative text the README points a future round at —
still asserts an isolated ablation that was never run.

**Smallest safe correction.** Append a correction under QUALITY 81: the receipt is a three-change revert (oracle +
`lineOnly` window + deleted case), cases=29 passed=28, and only the oracle clause has an observed red state.

## Observation D4 (low, round record) — the lesson asserts a w2 falsification wave that never existed

`corpus/lessons/round-31.md:5-6` states as fact: "Waves: w1 build + first falsifiers (`.ufo/waves/round-31/w1/`),
w2 falsify (`.ufo/waves/round-31/w2/`)". Observed: `.ufo/waves/round-31/w2/` holds only `swarm-registry.json`; no report
was ever written, and `w2.ready.dispatched` records "2026-10-26T09:04:54 ABANDONED … no seat was spawned". The
falsification of this round's landing is this wave (a2w1). The w1 half is true (64 files).

**Smallest safe correction.** At round closure, append to the lesson (or the round's SCORECARD section) one line: w2
abandoned unspawned after the 2026-10-26 ~08:50 host crash, re-falsified as a2w1; keep the original sentence
(append-only discipline).

## Impacted axes

* **calibration** — harmed at the narrative level, not the measured level: the claim predicate (`mismatches 0`, 0
  deletions, no `scripts/` change) is met and reproducible, but `SCORECARD.md:1554-1557` contradicts the round's own
  instrument description and QUALITY 81's red-state proof is looser than stated. D1 makes the "held for SCORECARD.md"
  sentence strictly false for one paragraph.
* **depth / coverage / operability / freshness / adjacency** — no change from this seat; C1's landed rows are
  unaffected by the above (the README restatement was checked against the located quotes and holds), and the
  gate-registry no-harm check is 0.

## Limitations (stated, not hidden)

* **Counter holes relied on, not repaired** (frozen): `--live` can be satisfied via proxy/CA environment
  (w1/SentinelC1Live.md), one quote can be repeated across rows and non-threshold numbers in a quote are admitted
  (w1/CritC1Axis.md, w1/CritC1Counter.md). I therefore did not treat "admitted 13" as semantic correctness; row
  semantics are other seats' verdicts. The README restatement numbers were checked against the landed rows' quotes.
* **Network**: my only fetch was the C1 counter's `--live` mode (4 receipt URLs, `curl -q -sS --proto =https
  --proto-redir =https -L --max-redirs 5`, HTTP 200 + same-host effective URL + quote-in-body required). The counter's
  `--json` does not emit per-fetch status/byte-count/sha256, so I cannot record per-URL fetch metadata from it; I record
  that the run required and got 200s for all four URLs (13/13 admitted, 0 failing) and made no other request. I did no
  manual GETs this wave.
* **Environment**: `check-s106-evidence.mjs --selftest` at `b4128c4` aborts with an uncaught error (exit 1) in this
  environment, so the correction's "7 cases" for that revision was verified by the script's own `CASES` array and
  header comment rather than by a summary line; the same gate runs clean at REV (10/10).
* `--provenance`/measure receipts: the committed `.ufo/waves/round-31/measure/` readings
  (`c1-live-at-4860483.json`, `c2-at-4860483.json`, `c2-numstat-freeze-to-4860483.txt`, `measured-provenance.txt`)
  agree with every number I re-measured; `measured-provenance.txt` records `porcelain=0` and the frozen digests for
  both revisions, and `scripts-diff-files=0`.

## Receipts (in `.ufo/waves/round-31/a2w1/CritCalibrationHarm/`)

| File | sha256 (prefix) | What it is |
|---|---|---|
| `c1.json` | `5362031818b23cc242918534…` | decision-table counter, `--live`, at REV, exit 0 |
| `c2.json` | `aa5a7657f65d6c11596e700b…` | selfassessment at REV, mismatches 0, exit 0 |
| `c2-freeze.json` | `b5ec0f1933941cda012e254f…` | selfassessment at `9505a10`, mismatches 9, exit 1 |
| `c2-baseline.json` | `a1d314c2b12d415ae80539d3…` | selfassessment at `96a2d1a`, mismatches 5, exit 1 |
| `frozen-vs-old.diff` | `7faa1b73071b79682a8f3a43…` | frozen counter vs `m8-proof/old-oracle.mjs` (6 hunks, 19/9) |

Scratch clone and TMPDIR were under `$HYAKU_SCRATCH/tabi-r31/CritCalibrationHarm/`; the lane checkout was read-only
throughout (`git show`/`git diff`/`git log` only), and the clone ended with `git status --porcelain` = 0.
