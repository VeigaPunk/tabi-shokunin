# ScribeLOG27 — round-27 LOG.md append draft (wave 1, report-only)

Seat: `ScribeLOG27` (scribe, wave 1, leaf — no dispatch, no peer messages).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
HEAD at draft time: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (`git rev-parse HEAD`).
Baseline of record: `f185b4e7ab10cd9e8925e8ec614c9c111772357d`.
Deliverable: the LOG.md round-27 continuation text below, for the L1 to land.
Nothing in this report is a tracked-file change; the only thing I wrote is this
report plus `.ufo/waves/round-27/scratch/ScribeLOG27/` (gitignored —
`git check-ignore -v .ufo/waves/round-27/scratch/ScribeLOG27/x` →
`.gitignore:5:.ufo/waves/*/scratch/`).

Tooling: no installs, no upgrades, no pacman, no builds, no linters, no gate
runs by this seat. Every value is either (a) read from a committed receipt whose
producing command the seat recorded, or (b) produced here by a read-only
measurement (`read`, `grep` tool, `git rev-parse/show/ls-tree/grep/diff/status`,
`wc`, `sha256sum`, `node -e` reading files only). Git was read-only throughout:
no add/commit/checkout/switch/reset/stash/rm, no jj writes.

---

## 1. Evidence ledger — values the draft rests on

### 1.1 Measured in this seat (commands are exact)

| # | Value | Command |
|---|---|---|
| 1 | HEAD `5ed6484…`; **10** commits in `f185b4e..HEAD` | `git rev-parse HEAD`; `git rev-list --count f185b4e..HEAD`; `git log --oneline f185b4e..HEAD` |
| 2 | `corpus/SOURCES.md` registry rows: **106** at `f185b4e`, **106** at `5577d1b`, **107** at `6ca3b89`, **107** at HEAD | `git show <REV>:corpus/SOURCES.md \| grep -cE '^\| S[0-9]+ '` |
| 3 | entries citing S107: **1** at `6ca3b89`, **1** at HEAD | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` |
| 4 | committed RFC 9110 bytes: **502941 B**, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` | `wc -c` + `sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt` |
| 5 | entry at `6ca3b89` is **55** lines; worktree copy **57** lines (2-line uncommitted delta) | `git show 6ca3b89:corpus/knowledge/redirect-and-retry-after-semantics.md \| wc -l`; `wc -l corpus/knowledge/…` |
| 6 | worktree at draft time: **27** porcelain paths — 2 modified (`corpus/QUALITY.md`, the C3 entry), 24 untracked under `.ufo/waves/round-27/` (wave reports, `w2-spec.json`, `gen-w2.mjs`, `swarm-registry.json`), 1 untracked `scripts/report-contract.mjs` | `git status --porcelain --untracked-files=all` |
| 7 | six named landed commits + four later round-27 commits, with per-commit stats | `git show --stat --format='%h %s' <commit>` |
| 8 | `scripts/report-contract.mjs` **140** lines, sha256 `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`, untracked | `wc -l`; `sha256sum` |
| 9 | wave specs: w1 **32** items (`maxLanes` 32), w2 **36** items (`maxLanes` 36) | `node -e` JSON read of `w1-spec.json` / `w2-spec.json` |
| 10 | `w1-dispatch.json` counts `{spawn:32, resume:0, total:32}`; policy `waveMinLanes` 32 / `waveMaxLanes` 64 | `node -e` JSON read |
| 11 | m3 reads the live tree: `m3Findings` shells `git status --porcelain --untracked-files=all` | `sed -n '377,390p' scripts/check-selfassessment.mjs` |
| 12 | m1 tally shapes are exactly `--self-test N/N`, `N-case`, `cases=N`, `N cases` (case-sensitive), and sections split on `^##` | `sed -n '121,136p'`, `sed -n '180,215p' scripts/check-selfassessment.mjs` |
| 13 | duplicate seat name **`MutC2Gate`** appears in both `w1-spec.json` and `w2-spec.json` | `node -e` role/name dump of both specs |
| 14 | census before/after captures and the seat's reproduction receipt are byte-identical: all three `f37ce86e0ffe420c07f6b024f2375d6da48ae9b8246f4d6dcf5f5ef41814ee20`, 2190 B each | `sha256sum .ufo/waves/round-27/census-before.txt .ufo/waves/round-27/census-after-c3.txt .ufo/waves/round-27/scratch/ExecCensusMirror/C-tabi-validate.out` |

### 1.2 Read from receipts committed by the claim author / wave-1 seats

| # | Value | Receipt |
|---|---|---|
| 15 | C1 at `4ad4c77`: `mismatches=6` = m1 LOG-window `:335/:391/:1090/:1103/:1664` + `m3-unlanded-paths`; `superseded=5`, `couldNotEvaluate=89` | `.ufo/waves/round-27/selfassess-baseline-raw.json` |
| 16 | C1 at `f185b4e` (pre-C1 tip): `mismatches=5` (four m1 LOG findings + m3, observed 4) | `selfassess-tip-raw.json` (`rev` field is `f185b4e…`) |
| 17 | C1 at `fd722a7`: `mismatches=1`, `counted` = **only** `m3-unlanded-paths` (observed 9603); `superseded=10`, `couldNotEvaluate=92`; m1 counted 0 | `measure-c1-fd722a7.json` |
| 18 | independent baseline re-run by `ExecC1Baseline` at HEAD `5ed6484`: `mismatches=6`, same six, its m3 count 18, exit 1 | `.ufo/waves/round-27/w1/ExecC1Baseline.md` |
| 19 | C1 self-test: pre-C1 **13** `CASE` lines, at tip **17** `CASE` lines; `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` | `scratch/ExecC1Tip/preC1-selftest.txt`, `scratch/ExecC1Tip/arm3-selftest.txt` |
| 20 | SKILL.md records `selfassessment-counter` cases=17 at line 2515 and `s106-evidence` cases=5 at line 2514 | `grep -n` on `SKILL.md` |
| 21 | C2 at `5577d1b`: `valid=true`, `present`, `sha_match`, `anchor_located`, `anchor_unique`, `byte_count_match` all true; decoded 73952 B, sha256 `9b93fe64…`; anchor line 187, one occurrence | `.ufo/waves/round-27/measure-c2-5577d1b.json` |
| 22 | C2 self-test ids: **4** at `5577d1b`, **5** at HEAD (the fifth is `missing-receipt-could-not-evaluate`) | `git show 5577d1b:scripts/check-s106-evidence.mjs \| grep -c 'id: "'`; `grep -c 'id: "'` |
| 23 | C2 control arms re-exercised: exits `1,1,1,1,2,1` across six fixture revisions (`node -e` count over the file: 6 arms) | `scratch/ExecC2Controls/exits.txt` |
| 24 | C2 review: kill rule violated on receipt-absent path — exit 1 (invalid) where the frozen rule demands exit 2; fix landed in `5198e28` (+ `5ed6484` fixture permit) | `.ufo/waves/round-27/w1/RevC2Gate.md` (F1, "high") |
| 25 | C3 census `validate --root /home/vgpnk/Projects/shokunin tabi` exit 0, 107 rows; receipt byte-identical to `census-after-c3.txt`; control arms: staged S124 → exit 1 E09, transformed S107 → exit 0 | `.ufo/waves/round-27/w1/ExecCensusMirror.md`, `scratch/ExecCensusMirror/{A-staged,B-xform,C-tabi-validate}.out` |
| 26 | C3 entry review: 6 of 6 RFC-attributed sentences re-located (5 byte-identical, 1 differing only by double inter-sentence space), 1 fragment capital-altered and cited one line late | `.ufo/waves/round-27/w1/ExecQualityGate.md` |
| 27 | C3 source re-verification: 10 of 10 cited quote locations correct and byte-identical | `.ufo/waves/round-27/w1/ScoutReverifyRfc.md` |
| 28 | S107 row census review: PASS, 11 cells, `kind=spec`, `tier=A`, `opened=2026-10-25`, `recheck=730d`, used-by exactly the entry | `.ufo/waves/round-27/w1/RevSourcesS107.md` |
| 29 | C3 critic: coverage counter junk-blind (proven), census entry-blind; two novelty sentences overstated | `.ufo/waves/round-27/w1/CritC3Junk.md` |
| 30 | committed set carries **no receipt showing C1 `after = 0`**; latest is 1 at `fd722a7` | `.ufo/waves/round-27/w1/SimplifyEvidence.md` §4 |

Observation, inference and unknown are kept separate below (§4).

---

## 2. The draft (land verbatim after LOG.md:1925, inside the existing `## Round 27` section)

```markdown
### Claim dispositions (wave-1 re-run; every number carries its command)

Re-measured by seats other than the claim author. Baseline of record
`f185b4e7ab10cd9e8925e8ec614c9c111772357d`; the C1 counter's frozen baseline is
`4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`. The numbers below deliberately avoid
the counter's own tally shapes (`cases=N`, `N-case`, `N cases`,
`--selftest N/N`), so this entry cannot create the finding it reports.

- **C1 calibration — the extended m1 window clears; the `mismatches` field
  clears only on a clean tree.** `node scripts/check-selfassessment.mjs --rev
  4ad4c77eed78bca1a149e65a7ec6a84b5f71c925 --json` → `mismatches=6`: five
  LOG-window findings (LOG.md:335, :391, :1090, :1103, :1664) plus one
  `m3-unlanded-paths` entry counting the working tree's porcelain paths at the
  measuring instant. Receipt `.ufo/waves/round-27/selfassess-baseline-raw.json`;
  reproduced independently by a wave-1 seat (same six, its m3 count 18 at its
  own instant). The same command at the pre-C1 tip `f185b4e` → `mismatches=5`
  (four LOG findings outstanding; `:1664` was already superseded by the
  round-26 correction), receipt `selfassess-tip-raw.json`. At the C1 commit
  `fd722a7864d5e6331063251216f8922be8de5048` → `mismatches=1`, and the single
  counted finding is `m3`; the m1 class counts 0, with superseded=10 and
  couldNotEvaluate=92, receipt `measure-c1-fd722a7.json`. `m3` shells
  `git status --porcelain --untracked-files=all`
  (`scripts/check-selfassessment.mjs` lines 377-390), so `mismatches=0` is a
  clean-tree reading: this entry does not record an unobserved 0 — the L1's
  integration-tree run at the landing commit is that receipt. The gate's own
  self-test grows from 13 to 17 entries (`SELFASSESSMENT_SELFTEST
  verdict=clean`, 17 of 17 passed; four new LOG-window entries including the
  wrong-number red control).
- **C2 depth — `valid=true` at the frozen target; the kill rule was found
  broken and fixed in-round.** `node scripts/check-s106-evidence.mjs --rev
  5577d1b6fe2dc298486e354b5416d38acafeffaa --json` → `valid=true` with
  present, sha_match, anchor_located, anchor_unique and byte_count_match all
  true; decoded bytes 73952, anchor at line 187 with one occurrence. Receipt
  `.ufo/waves/round-27/measure-c2-5577d1b.json`. Wave 1 re-exercised the
  controls: six fixture arms exit 1/1/1/1/2/1, including the missing-bytes
  could-not-evaluate (`scratch/ExecC2Controls/exits.txt`). The review seat
  found the frozen kill rule violated on the receipt-absent path (exit 1,
  invalid, where the rule demands exit 2, could-not-evaluate); `5198e28`
  classifies that path as could-not-evaluate and `5ed6484` permits the empty
  fixture commit, so the shipped self-test now carries a fifth entry and the
  registry row records that five-entry tally (`SKILL.md:2514`). The claim's
  target measurement predates the fix and is recorded as such.
- **C3 coverage — one entry cites S107; registry 106 → 107 rows; census exit
  0.** `git grep -lE '^source: S107 ' 6ca3b89ad2a7b480984859834b3d28f1e75a9a26 --
  corpus/knowledge | wc -l` → 1 (also 1 at HEAD). Row count by
  `git show <REV>:corpus/SOURCES.md | grep -cE '^\| S[0-9]+ '` → 106 at
  `f185b4e` and at the pre-C3 parent `5577d1b`, 107 at `6ca3b89` and at HEAD.
  Census: `scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin tabi` exit 0 with 107 rows, reproduced by a
  wave-1 seat whose receipt `scratch/ExecCensusMirror/C-tabi-validate.out`
  (2190 B, sha256 `f37ce86e…`) is byte-identical to `census-after-c3.txt`; its
  control arms: byte-exact staged S124 row → exit 1 with E09, transformed S107
  row → exit 0. Fresh bytes: 502941 B, sha256
  `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`
  (`sha256sum` over the committed `assimilation/rfc9110.txt`). Refusals on
  record: staged S125 (URL already held by S102), staged S142 (same document,
  §15.4 overlap with the S107 row). Wave-1 critic: the counting command is
  junk-blind by construction (proven) — the entry review, not the count,
  carries the located-quote bar.

### Round-27 waves and seats

Wave 1 (attack + verify; the three claims landed pre-wave by the L1): 32 seats
dispatched as one validated payload (`w1-dispatch.json`: spawn 32, resume 0,
total 32; policy `waveMinLanes` 32, `waveMaxLanes` 64). Wave 2 (falsify): 36
seats per `w2-spec.json` (`maxLanes` 36). Dead seats: <L1 fills>.

#### Wave 1 (32)

| Seat | Role | Disposition |
|---|---|---|
| ScoutReverifyLog | scout | <L1 fills> |
| ScoutReverifyRfc | scout | <L1 fills> |
| ScoutStagedGround | scout | <L1 fills> |
| ExecC1Baseline | executor | <L1 fills> |
| ExecC1Tip | executor | <L1 fills> |
| ExecC1Attacks | executor | <L1 fills> |
| ExecC2Controls | executor | <L1 fills> |
| ExecC2Reopen | executor | <L1 fills> |
| ExecCensusMirror | executor | <L1 fills> |
| ExecSelftestSweep | executor | <L1 fills> |
| ExecReportContract | executor | <L1 fills> |
| ExecQualityGate | executor | <L1 fills> |
| ScribeLesson27 | scribe | <L1 fills> |
| ScribeLOG27 | scribe | <L1 fills> |
| ScribeScorecard27 | scribe | <L1 fills> |
| ScribeQuality67 | scribe | <L1 fills> |
| ScribeReport27 | scribe | <L1 fills> |
| SimplifyGateCode | simplifier | <L1 fills> |
| SimplifyEvidence | simplifier | <L1 fills> |
| RevC1FrozenFit | reviewer | <L1 fills> |
| RevC2Gate | reviewer | <L1 fills> |
| RevEntryC3 | reviewer | <L1 fills> |
| RevSourcesS107 | reviewer | <L1 fills> |
| CritC1Supersession | critic | <L1 fills> |
| CritC3Junk | critic | <L1 fills> |
| CritAssimProcess | critic | <L1 fills> |
| MutC1Gate | mutation-tester | <L1 fills> |
| MutC2Gate | mutation-tester | <L1 fills> |
| ConnSiblingOverlap | connector | <L1 fills> |
| ConnRedirectSurface | connector | <L1 fills> |
| SentScope | sentinel | <L1 fills> |
| RevStagedProvenance | revenger | <L1 fills> |

#### Wave 2 (36)

| Seat | Role | Disposition |
|---|---|---|
| ExecC1Recount | executor | <L1 fills> |
| ExecC1LineAudit | executor | <L1 fills> |
| ExecC2Recount | executor | <L1 fills> |
| ExecC3Recount | executor | <L1 fills> |
| ExecSeparation | executor | <L1 fills> |
| ExecFreshAttack1 | executor | <L1 fills> |
| ExecFreshAttack2 | executor | <L1 fills> |
| ExecFinalTipMeasure | executor | <L1 fills> |
| ExecW1Verify | executor | <L1 fills> |
| ExecW2Residual | executor | <L1 fills> |
| ExecCorpusInvariants | executor | <L1 fills> |
| ExecRegistryCount | executor | <L1 fills> |
| ExecW1Census | executor | <L1 fills> |
| ScribeFinalReport | scribe | <L1 fills> |
| ScribeL0 | scribe | <L1 fills> |
| ScribeClaimRecordAudit | scribe | <L1 fills> |
| ScribeWaveLedger | scribe | <L1 fills> |
| SimpEntryTrim | simplifier | <L1 fills> |
| MutC1Log | mutation-tester | <L1 fills> |
| MutC2Gate | mutation-tester | <L1 fills> |
| MutSupersessionEdge | mutation-tester | <L1 fills> |
| RevFrozenFit | reviewer | <L1 fills> |
| RevQuality67 | reviewer | <L1 fills> |
| CritClaimHonesty | critic | <L1 fills> |
| CritCorrectionGaming | critic | <L1 fills> |
| CritEntryIndependence | critic | <L1 fills> |
| CritMistakeQuality | critic | <L1 fills> |
| CritNovelty | critic | <L1 fills> |
| ScoutW1Findings | scout | <L1 fills> |
| ScoutRfcIndependent | scout | <L1 fills> |
| ScoutRegistryIndependent | scout | <L1 fills> |
| ScoutJunkCount | scout | <L1 fills> |
| SentFinalScope | sentinel | <L1 fills> |
| SentReportPath | sentinel | <L1 fills> |
| ConnW1W2Patterns | connector | <L1 fills> |
| ConnAdjacentReport | connector | <L1 fills> |

### Landed paths (round 27)

- `fd722a7864d5e6331063251216f8922be8de5048` — `scripts/check-selfassessment.mjs`
  (+188/−12: m1 window extended to LOG.md), this entry's correction block
  (+47), and round-27 `claims.json`, `census-before.txt`, both selfassess
  receipts.
- `5577d1b6fe2dc298486e354b5416d38acafeffaa` — `scripts/check-s106-evidence.mjs`
  (new, +331).
- `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` — `corpus/SOURCES.md` (+1: row
  S107), `corpus/knowledge/redirect-and-retry-after-semantics.md` (+55), and
  `.ufo/waves/round-27/assimilation/` (fresh bytes, staged and transformed
  rows, census mirrors, collision fixtures).
- `ef7a2748806efa602e22701e4c290f4329dd84bf` — `SKILL.md` (+16: gate-registry
  row for `s106-evidence`, refreshed `selfassessment-counter` row).
- `024d60c8132956996e31c4fe95795498c6574462` — `SKILL.md` (one line:
  `s106-evidence` verdict map, 1=failed).
- `5a0178c744a92f63f8add30b8ef035c5a0a89b22` — `SKILL.md` (one line: same
  verdict map, 0=clean).
- Same round, after the three claims: `336d5d1ca241503dfe2c95ba1471003864d4ae76`
  (lesson `corpus/lessons/round-27.md`, QUALITY criteria 67-68, corpus README
  row, SCORECARD round-27 blocks), `8e07f0b288744a02d1068ac401e33c25b07a4480`
  (wave-1 spec, validated dispatch payload, claim receipts, post-C3 census),
  `5198e28eafbee9fd24252db95149168938a5b4a4` (missing-receipt classification
  + lesson), `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (empty missing-receipt
  fixture commit).

### Next iterations (owed)

(a) Land `scripts/report-contract.mjs` as a lane utility — built this round
(140 lines, zero deps, sha256 `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`),
currently untracked at `scripts/report-contract.mjs`. It is a utility, never
`check-*`, and never runs inside the gate pass; land it when a review seat's
read confirms it and its QUALITY criterion 68 wording settles.
(b) Re-anchor 308 only if a claim needs the direct sentence: the admitted entry
records 308's method preservation as an explicit INFERENCE because §15.4.9
(lines 7507-7523) carries no MUST-NOT clause; the located sentence lives in
RFC 7538, which this lane has not fetched.
(c) Refresh SCORECARD's round-27 executed-disposition block against the L1's
post-landing gate run: the C1 row's `mismatches=0` is a clean-tree reading (the
committed receipt at `fd722a7` shows `mismatches=1`, `m3` alone), and the seat
count text reads 32 + 32 while `w2-spec.json` carries 36.
```

Byte count of the draft: 10039 B, saved at
`.ufo/waves/round-27/scratch/ScribeLOG27/log-append-draft.md`.

## 3. Landing hazard I checked before drafting (and the check result)

The extended m1 scanner reads the *landed* LOG.md and associates any tally shape
on a line with (i) a `scripts/*.mjs` named on that same line, else (ii) the
section's single script, else ambiguous. The round-27 `##` section already names
five `scripts/*.mjs` (only some are runnable gates), so a same-line tally would
be compared against its oracle. A LOG append that quotes a stale gate tally
would therefore re-create the very finding C1 clears.

Audit (read-only, `node -e` re-using the scanner's own patterns and section
split over `LOG.md` + draft):

- round-27 sections found: 1, spanning `1880–2135` after insertion;
- section scripts: `check-selfassessment.mjs`, `check-freshness.mjs`,
  `check-sources.mjs`, `check-s106-evidence.mjs`, `report-contract.mjs`;
- **tally-shaped lines in the section: 0**.

So the draft adds no m1 finding and cannot disturb the claim's own counter. The
draft states gate tallies in shapes the scanner does not match ("13 to 17",
"17 of 17", "five-entry tally", "106 → 107") and says so explicitly in its first
paragraph.

Second landing requirement, from the same evidence: `m3` counts live
`git status --porcelain --untracked-files=all`. Today the worktree carries 27
paths (row 6), including every wave-1/wave-2 report and `w2-spec.json`. **The L1
must land the wave outputs and measure on a clean tree** or the integration run
will report `mismatches=1` for `m3` regardless of C1 — the same value the
committed C1 receipt shows. The draft says exactly that and does not claim an
unobserved zero.

## 4. Observation / inference / unknown

Observed (grounded above): every value in §1, the audit in §3, the commit
contents in §1.1 row 7, the worktree composition in row 6.

Inference (marked as such, not asserted as measurement):
- That the clean-tree tip run yields `mismatches=0`: implied by m1 counting 0 at
  `fd722a7` and m3 returning [] on an empty porcelain list
  (`scripts/check-selfassessment.mjs:388`). Not measured by this seat; the L1's
  gate run is the receipt.
- That the SCORECARD seat-count sentence (32 + 32) is a pre-build estimate that
  did not track the 36-item `w2-spec.json`. The two numbers are observed; the
  cause is not.

Unknown:
- Wave-2's actual dispatch/seat outcomes (spec exists, no wave-2 report
  directory content at draft time: `.ufo/waves/round-27/w2/` is empty).
- Whether the two uncommitted worktree edits (`corpus/QUALITY.md`,
  `corpus/knowledge/redirect-and-retry-after-semantics.md`) will be landed as
  they stand; the draft is written to be correct under either wording (it cites
  the review seats, not the pending prose).
- Exit codes for the census captures: `census-before.txt` /
  `census-after-c3.txt` hold stdout only (byte-identical, 2190 B each, `W`
  codes); the exit-0 statement is grounded in `ExecCensusMirror`'s reproduction,
  not in those two files.

## 5. Conflicts to put before the canonical judge (verbatim, unresolved by me)

1. **Seat count.** `SCORECARD.md:1407` reads "Two v1 waves (32 + 32 = 64 seats;"
   while `w2-spec.json` carries 36 items (`maxLanes` 36; roles executor 13,
   scribe 4, simplifier 1, critic 5, scout 4, mutation-tester 3, reviewer 2,
   sentinel 2, connector 2). W1's 32 matches its spec exactly.
2. **C1 after-value.** `SCORECARD.md:1396` records "tip `mismatches=0` under a
   clean tree" and calls `measure-c1-fd722a7.json` the evidence, but that receipt
   says `mismatches=1` (counted: `m3` alone). The completed `m1` arm is 0; the
   *field* named in the claim is not 0 in any committed receipt
   (`SimplifyEvidence.md` §4 reaches the same reading). The draft therefore
   reports the measured 1 and names the clean-tree run as the missing receipt
   rather than asserting 0.
3. **C2 kill rule vs. shipped code at the target commit.** The frozen kill rule
   says receipt-absent → exit 2, never valid; `RevC2Gate.md` F1 measured exit 1
   at `5577d1b` (and at baseline), with the self-test blind to the path. The fix
   is real and landed (`5198e28`, `5ed6484`; `SKILL.md:2514` now says cases=5),
   but it post-dates the claim's target measurement. Verdict on whether C2 is
   "met" belongs to the canonical judge.
4. **Receipt naming.** `selfassess-tip-raw.json` contains `rev: f185b4e…` — the
   *pre-C1* baseline, not a post-C1 tip. The draft calls it "the pre-C1 tip" and
   does not treat it as the after-receipt. (This is the file `SimplifyEvidence`
   calls out as making C1's gap "look satisfied".)
5. **Duplicate seat id.** `MutC2Gate` is present in both wave specs; if wave 2
   dispatches while a wave-1 `MutC2Gate` is live, the names collide in one
   session namespace. Observation only; the dispatch layer's behaviour is not
   mine to test.

## 6. Out of scope / deliberately not done

- No edit to `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/**`, `scripts/**`,
  `PROVINCE.md`; no git or jj writes; no `pacman`; no gate, build, lint or
  formatter run by this seat (so no claim receipt here should be quoted as an
  independent gate run).
- No re-fetch of RFC 9110: the spec's bytes were already committed and are
  hash-verified here (row 4); a refetch would duplicate a documented GET without
  adding a value.
- No reading of the fleet repo, sibling lanes, or `/home/vgpnk/Projects/shokuknow`;
  the census was not re-run (the fleet script lives in the fleet repo, and the
  wave-1 seat's reproduction is the receipt).
- No wave-1/wave-2 disposition verdicts: the tables carry `<L1 fills>` by
  instruction; the seat reports cited in §1.2 were read for the numbers the draft
  states, not adjudicated.
- I did not verify the 308/RFC 7538 sentence exists in bytes this lane has not
  fetched; the draft records it as inference and names the re-anchor.

## 7. Artifact paths

- This report: `.ufo/waves/round-27/w1/ScribeLOG27.md`
- Draft, byte-identical to §2's fenced block:
  `.ufo/waves/round-27/scratch/ScribeLOG27/log-append-draft.md` (10039 B)
- Read-only inputs (unchanged): `.ufo/waves/round-27/{claims.json,measure-c1-fd722a7.json,measure-c2-5577d1b.json,selfassess-baseline-raw.json,selfassess-tip-raw.json,census-before.txt,census-after-c3.txt,w1-spec.json,w2-spec.json,w1-dispatch.json}`, `.ufo/waves/round-27/w1/*.md` (cited by name in §1.2), `scripts/check-selfassessment.mjs`, `scripts/check-s106-evidence.mjs`, `corpus/SOURCES.md`, `corpus/knowledge/redirect-and-retry-after-semantics.md`.

## 8. Late deltas (measured 14:44–14:50, after §2's draft was frozen)

Read-only; each line names its command.

- **HEAD unchanged; §1.1 row 1 reconfirmed.** `git rev-parse HEAD` →
  `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; `git rev-list --count f185b4e..HEAD`
  → `10`.
- **Wave 2 is dispatched, not pending — this supersedes §4's first Unknown.**
  `.ufo/waves/round-27/w2-dispatch.json` 57,349 B, `w2-validate.err` 0 B,
  `w2/swarm-registry.json` 4,644 B (all mtime 14:44). `node -e` over the payload
  → `counts={"spawn":36,"resume":0,"total":36}`, policy `waveMinLanes 32 /
  waveMaxLanes 64 / declaredMaxLanes 36`. The wave-2 directory is no longer
  empty; §2's wave-2 table (36 seats, `<L1 fills>`) stands as written.
- **Additional conflict for §5 — the C2 evidence-of-record still declares C2
  failed.** At HEAD, `corpus/evidence/round-26/sources/s106.json:25` reads: "The
  frozen C2 counter scripts/check-s106-evidence.mjs was NOT built this round …
  claim C2 fails its frozen predicate and is recorded failed in SCORECARD.md"
  (`git show HEAD:corpus/evidence/round-26/sources/s106.json | grep -n` →
  `25:`). The gate exists, the kill-rule fix landed (`5198e28`, `5ed6484`), and
  the counter reads `valid=true`; `parseReceipt` never reads `status`, so the
  contradiction is mechanically inert but reads as the opposite of the
  measurement. Disposition: append-only correction paragraph (the receipt is
  round-26 bytes — correcting its prose in place would rewrite a prior-round
  receipt).
- **Checked, not a finding.** `SKILL.md:2479` carries an older
  `selfassessment-counter` row with cases=13; it sits in the Round 24
  append-only registry and is superseded by the Round 27 row at `SKILL.md:2515`
  (cases=17). Append-only supersession — and SKILL.md is not in the m1 window
  (SCORECARD.md + LOG.md only), so no tally finding arises.
- **Housekeeping, this seat's own run (disclosed for the record).** An initial
  `write` with a lane-relative path resolved against the workspace root and
  created `/home/vgpnk/Projects/shokunin/.ufo/waves/round-27/w1/` in the **fleet**
  repo. The file was copied to this lane, the stray file deleted, and the two
  empty directories removed (`rmdir`; `ls /home/vgpnk/Projects/shokunin/.ufo/waves/
  | grep -c round-27` → `0`). No bytes remain there; no other write outside the
  lane was made.
