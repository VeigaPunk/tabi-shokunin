# ExecC2Measure — C2 calibration measurement (round 31, attempt 2, wave a2w1)

**Verdict: C2 holds.** Re-run in a clean clone at lane REV `486048356f0712e4396588c9dab58cd419243120`
(porcelain empty before and after) with the counter whose sha256 equals `claims.json` `frozenDigests`,
`node scripts/check-selfassessment.mjs --rev 4860483… --json` exits **0** and reports **mismatches 0,
counted 0, couldNotEvaluate 103, superseded 29, clean true**; two independent runs are **byte-identical**
(sha256 `aa5a7657…3abbb`). `git diff --numstat 9505a10… 4860483…` over `SKILL.md`, `corpus/README.md`,
`SCORECARD.md`, `LOG.md` is insertions-only with **0 deleted lines** (4/0, 22/0, 25/0), and
`git diff --name-only … -- scripts/` is **empty** (0 files). The before value is reproduced exactly: the same
counter at freeze `9505a10…` exits 1 with **9** mismatches whose `counted` set is identical to
`baseline/c2-J1-do-nothing.json`, and couldNotEvaluate 103 in both. All nine claimed lines are present with
`superseded: true`, each cleared by a later paragraph in **its own document** that names the **same script**,
carries a correction marker, cites the stale line, and states that gate's **own** summary tally; those tallies
were re-measured independently (26/30/10/29) and every historical figure the corrections quote was reproduced
by running the gate at the cited commit. No defect against the frozen predicate; three low-severity
provenance/blind-spot residuals are recorded below, all disclosed by the claim.

## 1. Predicate run

```
$ git -C "$S/clone" rev-parse --show-toplevel          # $S/clone
$ git -C "$S/clone" rev-parse HEAD                     # 486048356f0712e4396588c9dab58cd419243120
$ git -C "$S/clone" status --porcelain | wc -l         # 0   (0 after every run too)
$ sha256sum scripts/check-selfassessment.mjs           # 143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce
$ sha256sum scripts/check-decision-table.mjs           # d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832
$ git show 9505a10…:scripts/check-selfassessment.mjs | sha256sum   # 143d66ff…b2fce  (same bytes at the freeze commit)
$ TMPDIR="$S/tmp" node scripts/check-selfassessment.mjs --rev 4860483… --json > c2-rev.json      # exit 0
$ TMPDIR="$S/tmp" node scripts/check-selfassessment.mjs --rev 4860483… --json > c2-rev-run2.json # exit 0
$ cmp c2-rev.json c2-rev-run2.json                     # identical
```

| field | REV run | freeze run (`9505a10…`) | baseline `c2-J1-do-nothing.json` |
|---|---|---|---|
| exit | 0 | 1 | (recorded) |
| mismatches | **0** | 9 | 9 |
| counted (array) | 0 | 9 | 9 |
| couldNotEvaluate | 103 | 103 | 103 |
| superseded | 29 | 20 | 20 |
| clean | true | false | false |
| rev field | `4860483…` | `9505a10…` | `befe2a3f96f451e1fe797c3cab5f4c8dcf670f99` |

Set comparisons (script, `out/c2-rev.json` / `out/c2-freeze.json` / baseline):

- freeze `counted` set **equals** the baseline `counted` set exactly (same nine keys: `SKILL.md`
  1614, 2479, 2514, 2515, 2529, 2530, 2543, 2544; `corpus/README.md` 613).
- `couldNotEvaluate` findings: 103 in both; the set of unique keys (60) is **identical** between freeze and REV.
- newly superseded at REV = exactly those nine keys; **no previously superseded finding lost** (difference `[]`),
  so the corrections do not over-clear anything.
- couldNotEvaluate composition at REV: `command outside the closed re-run grammar` 76 (m2), `ambiguous script
  association` 24, `script outside the runnable gate set` 3. Measured m1 set: SKILL.md 38, corpus/README.md 2,
  SCORECARD.md 31, LOG.md 8. m2: 77 findings, 1 measured, 0 failing.

Artifacts: `ExecC2Measure/c2-rev.json` (sha256 `aa5a7657…`), `c2-rev-run2.json` (same), `c2-freeze.json`
(`b5ec0f19…`).

## 2. Append-only and no gate edit

```
$ git diff --numstat 9505a10… 4860483… -- SKILL.md corpus/README.md SCORECARD.md LOG.md   # exit 0
4	0	SCORECARD.md
22	0	SKILL.md
25	0	corpus/README.md
# LOG.md absent (unchanged); deleted total 0
$ git diff --name-only 9505a10… 4860483… -- scripts/    # exit 0, empty, 0 files
```

Insertions-only means no line above the corrections could have been rewritten and no citation shifted; the
corrections sit at `SKILL.md:2582–2602` and `corpus/README.md:663–668`, i.e. at the end of each document
(SKILL.md 2602 lines, corpus/README.md 686 lines at REV). `corrections.diff` holds the full three-document diff.

## 3. The nine claimed lines, each with its clearing paragraph

All from `c2-rev.json` (`nine-findings.tsv`):

| stale line | script (association) | claimed | observed | superseded | clearing paragraph |
|---|---|---|---|---|---|
| SKILL.md:1614 | scripts/check-sources.mjs | 25 | 26 | true | SKILL.md:2588 |
| SKILL.md:2479 | scripts/check-selfassessment.mjs | 13 | 30 | true | SKILL.md:2590 |
| SKILL.md:2514 | scripts/check-s106-evidence.mjs | 5 | 10 | true | SKILL.md:2592 |
| SKILL.md:2515 | scripts/check-selfassessment.mjs | 17 | 30 | true | SKILL.md:2594 |
| SKILL.md:2529 | scripts/check-s106-evidence.mjs | 7 | 10 | true | SKILL.md:2596 |
| SKILL.md:2530 | scripts/check-selfassessment.mjs | 20 | 30 | true | SKILL.md:2598 |
| SKILL.md:2543 | scripts/check-release-pins.mjs | 20 | 29 | true | SKILL.md:2600 |
| SKILL.md:2544 | scripts/check-s106-evidence.mjs | 7 | 10 | true | SKILL.md:2602 |
| corpus/README.md:613 | scripts/check-selfassessment.mjs | 17 | 30 | true | corpus/README.md:668 |

For each pair I checked the four properties the counter requires (and the counter independently reports the
same): same-document citation of the stale line, correction marker, same script name, oracle number in a tally
shape. All 4/4 true for all nine (`clearing-paragraphs.txt` carries the paragraph text and the assertion
output; e.g. "all four predicates per paragraph: true"). Example: SKILL.md:2600 reads
"`scripts/check-release-pins.mjs` `--selftest` (29/29): correction — supersedes the stale tally at
`SKILL.md:2543`…"; corpus/README.md:668 cites `corpus/README.md:613` (root `README.md:N` would not clear it).

## 4. Oracle and historical figures re-measured (independent of the counter)

REV, each gate's own summary line (`gates/*.txt`):

| gate | command | exit | summary line |
|---|---|---|---|
| check-sources.mjs | `--self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| check-selfassessment.mjs | `--selftest` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30` |
| check-s106-evidence.mjs | `--selftest` | 0 | `S106_SELFTEST verdict=clean cases=10 passed=10` |
| check-release-pins.mjs | `--selftest` | 0 | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` |
| check-decision-table.mjs | `--selftest` | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34` (C1 coupling; SKILL.md:2575 states `cases=34`, correct) |

Historical figures quoted by the correction paragraphs, run at the cited commits in detachable worktrees of the
same clone (`historical-tallies.tsv`):

| claim in the corrections | commit | re-measured | exit |
|---|---|---|---|
| sources printed 25 before round 1 added `row-outside-registry` | 9e3b607 (parent of 5cdc976) | `cases=25`, case absent | 0 |
| sources 26 at the post-review commit, blob identical to REV | 5cdc976 | `cases=26`, blob `IDENTICAL` | 0 |
| selfassessment 17 after round 27 | fd722a7 | `cases=17` | 0 |
| selfassessment 20 after round 28 | b4128c4 | `cases=20` | 0 |
| selfassessment 22 at the round-29 freeze | 97be89b | `cases=22` | 0 |
| s106 5 at round-27 | bceb17d | `cases=5` | 0 |
| s106 7 at round-28 (stated as CASES count, "not run") | b4128c4 | gate crashes: `ReferenceError: existsSync is not defined` | 1 |
| s106 7 at round-29 repair | 59e8167 | `cases=7` | 0 |
| s106 10 after round-30 (+3) | 38891ca | `cases=10` | 0 |
| release-pins 20 shipped in round 29 | 97be89b | `cases=20` | 0 |
| release-pins 29 after round-30 (+9) | 38891ca | `cases=29` | 0 |
| SKILL.md:1886 historical "59 cases" (ambiguous to the window) | 3254740 | `cases=59`; REV is 76 | 0 |

Case-id diffs also match the prose: selfassessment 97be89b→REV adds 8 ids
(`v2-oracle-reads-summary-line-not-first-cases-token`, the two skill cases, the four readme window cases); s106
59e8167→38891ca adds `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`,
`same-length-tamper-invalid`; release-pins 97be89b→38891ca adds 9 (drift-superseder, 404-absence, f1–f4 range/path).

The routed `SCORECARD.md:1523` correction is present (append-only, cites the line) and its quoted receipts
match: `.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt:130` → `mismatches=3`;
`noharm-at-d3cd62a.txt:1` → `{"mismatches":1,…"SCORECARD.md",1527,claimed 12,observed 2}`;
`corpus/lessons/round-30-verifier-spotcheck.md:147` records the same routed defect. It is curation, not an
m1 tally, so the C2 counter neither reads nor clears it — consistent with `claims.json`.

## 5. Residual findings (none fails the predicate)

- **R1 (low, disclosed blind spot).** mismatches 0 is over the *measured* subset only: couldNotEvaluate stays
  103 (24 ambiguous script association, 3 non-`check-*` scripts, 76 m2 commands outside the closed grammar).
  I spot-checked the ambiguous SKILL/README tally lines it declines: SKILL.md:1886's "selftest 59 cases" is
  correct at `3254740` (now 76); corpus/README.md:359's "59 cases" is the same commit; the rest are historical
  round-19 receipt counts or lines naming `.ufo/` measure scripts. No wrong number found in the blind spot.
- **R2 (low, provenance).** `baseline/c2-J1-do-nothing.json` (and `c2-T0-reading.json`) carry
  `.rev = befe2a3f96f451e1fe797c3cab5f4c8dcf670f99`, which is not an object in the lane
  (`git cat-file -t` → exit 128). The value is honest: my run at `9505a10…` reproduces 9/103 with the identical
  counted set. Same class: corpus/README.md:358 quotes commit `5150611c`, also absent (`cat-file -t` → 128).
  Already recorded by w1 (CritC2Axis F2, lesson round-31).
- **R3 (low, wording).** The SKILL.md correction preamble says "every figure quoted is the `cases=` field of
  that gate's own `<NAME>_SELFTEST` summary line". The s106 figure 7 cannot be printed by the gate *at
  b4128c4* (it crashes; see the table) and is a CASES-id count there, printed as `cases=7` at 59e8167. Every
  figure is true; the preamble's provenance phrasing is broader than the receipts.
- **R4 (design, disclosed).** The stale registry rows stay literally wrong (e.g. SKILL.md:2479 still says
  `cases=13`); a reader scanning the gate table sees the wrong number 970 lines before the correction. This is
  the claim's stated append-only trade-off (the kill rule rejects deleted lines), not a predicate failure.

## 6. Commands, exit codes, artifacts

Full command list with exit codes: `ExecC2Measure/commands.txt` (sha256 `c8013c52…`). Scope of execution: one
live clone of the lane at REV plus detachable worktrees of the same clone for historical gates; TMPDIR
`/fast/scratch/hyaku/tabi-r31/ExecC2Measure/tmp`; scratch removed after copying. No lane tracked file, index or
jj state touched (lane `git status --porcelain` unchanged; clone porcelain 0). No network fetch, no tool install,
no build/lint/formatter run. Read-only reads of `.ufo/waves/round-30/measure/*` were used only for the
SCORECARD:1523 receipt check.

Artifacts (all under `.ufo/waves/round-31/a2w1/ExecC2Measure/`, digests in `SHA256SUMS`):
`c2-rev.json`, `c2-rev-run2.json`, `c2-freeze.json`, `numstat.txt`, `scripts-diff.txt` (empty),
`corrections.diff`, `nine-findings.tsv`, `clearing-paragraphs.txt`, `historical-tallies.tsv`,
`scorecard-1523-receipts.txt`, `counter-sha256.txt`, `commands.txt`, `gates/` (18 gate self-test outputs,
REV + cited commits).
