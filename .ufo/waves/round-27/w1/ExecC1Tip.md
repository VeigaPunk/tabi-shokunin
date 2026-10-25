# ExecC1Tip — C1 after-arms re-run + correction-bullet audit

Seat: `TabiR27.ExecC1Tip` (read-only reporter, leaf). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Nothing in this report landed in a tracked file.

> **Path-collision notice (read this first).** A second seat dispatched under the same identity
> `ExecC1Tip` wrote its own report to this same path at 14:44:46 and overwrote mine. I preserved that
> file verbatim at `.ufo/waves/round-27/scratch/ExecC1Tip/peer-report-overwrite-1444.md`
> (19 267 B, sha256 `48e5fe6cd959efd52590fa14a9d3effea78e4a5b2ebf9d8909050fd335f3b087`) before
> restoring this one, and kept a protected copy of mine at
> `.ufo/waves/round-27/scratch/ExecC1Tip/ExecC1Tip.report.md`. The L1 should decide which seat's
> evidence is the report of record; the two are independent measurements of the same four items and
> can be cross-read.

**Axes walked (godspeed):** (A) arm fidelity — does each re-run reproduce the frozen counter exactly;
(B) evidence completeness — command, full receipt, hash for every number; (C) bullet rigor — the four
attributes the assignment names, checked per bullet, not per block; (D) non-harm — scratch-only writes.

**Revisions measured against**

| role | rev | note |
|---|---|---|
| C1 after-arm 1 (item 1) | `5a0178c744a92f63f8add30b8ef035c5a0a89b22` | post-C1 tip at assignment time |
| C1 claim commit (item 2) | `fd722a7864d5e6331063251216f8922be8de5048` | "round-27 C1 (calibration): extend … selftest 13->17" |
| lane HEAD when arms ran | `336d5d1ca241503dfe2c95ba1471003864d4ae76` | 14:32 local |
| baseline (from claims.json) | `f185b4e7ab10cd9e8925e8ec614c9c111772357d` | round-27 baseline |
| pre-C1 baseline receipt | `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` | `.ufo/waves/round-27/selfassess-baseline-raw.json` |
| lane HEAD while writing this report | `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` | tree moved under me (siblings), see §8 |

---

## 1. Arm 1 — `--rev 5a0178c…`

```
node scripts/check-selfassessment.mjs --rev 5a0178c744a92f63f8add30b8ef035c5a0a89b22 --json
  > .ufo/waves/round-27/scratch/ExecC1Tip/arm1-5a0178c.json      # exit 1
```
Receipt: 40 977 B, sha256 `5a32d41be2c7040f7fd9240d5d758af221b7a0349ef0631cbebb7b73c7b6bea7`.

| field | value |
|---|---|
| `mismatches` | **1** |
| `couldNotEvaluate` | **92** (integer; = findings with `observed === null`) |
| `superseded` | **10** (integer) |
| `clean` | `false` |
| `counted[]` | exactly one entry — see below |

`counted[]` verbatim:
```json
[{ "class": "m3-unlanded-paths", "doc": "SCORECARD.md", "line": null,
   "claimed": "landed", "observed": 4 }]
```

The m3 finding object itself carries `"round": 26` — SCORECARD.md **at the measured revs** still has
round 26 as its newest `## Round N — executed disposition` block (round 27's block landed later, by
a sibling, while this report was being written), and the live working tree contradicts its "landed"
claim.

### The count I observed, and why it is 4

`m3Findings` (scripts/check-selfassessment.mjs:379-388) runs `git status --porcelain
--untracked-files=all` against the **live tree**, not the measured rev. At arm time (14:32:27) the
`-uall` set was exactly four paths, reconstructed from mtimes (`stat -c '%y %n'`):

| path | mtime |
|---|---|
| `.ufo/waves/round-27/w1/swarm-registry.json` | 14:22:05 |
| `.ufo/waves/round-27/w1.ready.dispatched` | 14:23:37 |
| `.ufo/waves/round-27/gen-w2.mjs` | 14:31:02 |
| `.ufo/waves/round-27/w2-spec.json` | 14:31:08 |

`w1/ExecC2Reopen.md` (14:32:52) and `w1/RevC2Gate.md` (14:33:30) landed **after** the arms, so the
run-time set was 4 — matching `observed: 4` exactly. Because m3 is tree-scoped, re-measuring the
*same* revs later returns larger counts purely from sibling writes (27 at one re-measure, 41 at
another — §5.5). [MEASURED]

`couldNotEvaluate = 92` decomposes as `m1-selftest-tally: 16` + `m2-receipt-exit: 76`
(`m2` has 77 findings, 1 measured, 76 outside the closed re-run grammar). `superseded = 10`
= 6 LOG-window + 4 SCORECARD-window. [MEASURED]

## 2. Arm 2 — `--rev fd722a7…` (C1-claim commit)

```
node scripts/check-selfassessment.mjs --rev fd722a7864d5e6331063251216f8922be8de5048 --json
  > .ufo/waves/round-27/scratch/ExecC1Tip/arm2-fd722a7.json      # exit 1
```
Receipt: 40 977 B, sha256 `8865c55236ba8d6761442231aae4f1e0580820e60f78c30bba80e6337dd334a9`.

`mismatches=1`, `couldNotEvaluate=92`, `superseded=10`, `clean=false`, and
`counted[]` is **byte-identical** to arm 1:
```json
[{ "class": "m3-unlanded-paths", "doc": "SCORECARD.md", "line": null,
   "claimed": "landed", "observed": 4 }]
```
Same m3 class as expected. [MEASURED]

**Rev-invariance (observed):** normalizing both files through `JSON.stringify(…, null, 1)` and
diffing yields exactly one differing line — the `"rev"` field. All 115 findings, `counted`,
`superseded`, `couldNotEvaluate` are identical. Confirmed cause: `git diff --stat fd722a7 5a0178c
-- LOG.md` is empty (LOG.md identical), and m2's re-run results are unchanged. So arm 2 adds no
signal beyond arm 1 for this claim; it is a genuine repeat, not an independent probe. [MEASURED]

## 3. Selftest

```
node scripts/check-selfassessment.mjs --selftest
```
Tail: `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` (exit 0), 17 `CASE … PASS` lines,
0 FAIL. Saved: `.ufo/waves/round-27/scratch/ExecC1Tip/arm3-selftest.txt`
(1 640 B, sha256 `de58470b96c077fa4d7edfddd59d096a4a4877951e89a6436413a84af453a794`). [MEASURED]

The 13 → 17 delta was measured **directly**, not inferred: the pre-C1 blob was extracted read-only
and executed from scratch —

```
git show f185b4e:scripts/check-selfassessment.mjs > …/scratch/ExecC1Tip/selfassess-preC1-738b23d.mjs
git rev-parse f185b4e:scripts/check-selfassessment.mjs   # 738b23dcbc9bf9c41938c762083af5962b2a553b
node …/selfassess-preC1-738b23d.mjs --selftest           # SELFASSESSMENT_SELFTEST verdict=clean cases=13 passed=13
```
So cases 13 → 17 (+4) is real. The claim's `after` says "selftest cases = 17" — **met**. [MEASURED]

---

## 4. The correction bullets (item 4)

`grep -n "^- Correction (supersedes" LOG.md` at HEAD:
```
1853  (round-26 block, :1664)
1904  (335)   1908  (391)   1912  (1090)   1916  (1103)   1920  (1863)
```

**The assignment says "4 correction bullets"; lines 1904-1925 hold FIVE.** Four are dispositioning
corrections; the fifth (1920-1925) is a self-declared record-only restatement for `:1863`, a line the
counter reports `could-not-evaluate` (`ambiguous script association`), so it clears nothing.
LOG.md is append-only since baseline (`git diff --numstat 4ad4c77 336d5d1 -- LOG.md` → `104 0`), so
none of these line numbers shifted. [MEASURED]

Bullets pasted verbatim (LOG.md:1904-1925; checked byte-identical to the file, sha256
`041405b4c58a3afe1e428eb7c5ad865894ee14522e8a8aecb003b469ce46837c`):

> - Correction (supersedes LOG.md:335): the four-case figure quoted at :335 is
>   the shipped ROUND_CONTRACT self-test receipt (`ROUND_CONTRACT_SELFTEST
>   verdict=clean`), not a `scripts/check-freshness.mjs` tally;
>   `scripts/check-freshness.mjs` `--selftest` measured `cases: 12` at `f185b4e`.
> - Correction (supersedes LOG.md:391): the four-case figure quoted at :391 is
>   the shipped user-swarm contract self-test receipt (`verdict=clean`), not a
>   `scripts/check-freshness.mjs` tally; `scripts/check-freshness.mjs`
>   `--selftest` measured `cases: 12` at `f185b4e`.
> - Correction (supersedes LOG.md:1090): the sixty-six figure at :1090 counts
>   validation decisions in `corpus/evidence/round-19/validation/decisions.json`,
>   not a `scripts/check-sources.mjs` self-test tally;
>   `scripts/check-sources.mjs` `--selftest` measured `cases: 26` at `f185b4e`.
> - Correction (supersedes LOG.md:1103): the sixty-six-over-sixty-six fraction at
>   :1103 counts integration validation cases, not a `scripts/check-sources.mjs`
>   self-test tally; `scripts/check-sources.mjs` `--selftest` measured
>   `cases: 26` at `f185b4e`.
> - Correction (supersedes LOG.md:1863): the round-26 wrap-up statement "selftest
>   `cases: 13`" for `scripts/check-selfassessment.mjs` (line :1863, in a
>   multi-script section so the tally is could-not-evaluate, never counted) is
>   restated for the record anyway: the C1 LOG-window extension added four cases
>   this round and `scripts/check-selfassessment.mjs` `--selftest` now measures
>   `cases: 17`.

Per-bullet attribute audit (`.ufo/waves/round-27/scratch/ExecC1Tip/audit-bullets3.mjs`, which
replicates the counter's own `SCRIPT_IN_TEXT` (:120), marker (:324), citation (:325) and
`statedTallyNumbers` (:246-254) predicates verbatim):

| bullet lines | cites | names target script | marker | cites a :LINE | states oracle | target finding (claimed→observed) | all 4 legs |
|---|---|---|---|---|---|---|---|
| 1904-1907 | :335 | `scripts/check-freshness.mjs` | yes | yes | 12 | 4 → 12 | ✅ |
| 1908-1911 | :391 | `scripts/check-freshness.mjs` | yes | yes | 12 | 4 → 12 | ✅ |
| 1912-1915 | :1090 | `scripts/check-sources.mjs` | yes | yes | 26 | 66 → 26 | ✅ |
| 1916-1919 | :1103 | `scripts/check-sources.mjs` | yes | yes | 26 | 66 → 26 | ✅ |
| 1920-1925 | :1863 | `scripts/check-selfassessment.mjs` | yes | yes | 13, 17 | n/a (cne line, no finding) | n/a |

All five name the script, carry the marker `Correction (supersedes …)`, cite a `:LINE`, and state an
oracle number. The four dispositioning bullets also name the **target finding's** script and state
**that finding's** observed value. [MEASURED]

Each cited line exists and matches what the bullet describes — e.g. `:335` reads
"…self-test receipt (`ROUND_CONTRACT_SELFTEST verdict=clean cases=4`). Seat" and `:1090` reads
"…validation/decisions.json` (27 decisions, 66 cases); C2 operabili…". [MEASURED]

### Oracle numbers independently re-measured

| script | accepted flag | measured tally | blob at f185b4e = blob at 5a0178c = disk? |
|---|---|---|---|
| `check-freshness.mjs` | `--self-test` | `cases=12` (verdict=clean, exit 0) | yes (`987c326…`) |
| `check-sources.mjs` | `--self-test` | `cases=26` (verdict=clean, exit 0) | yes (`3f96058…`) |
| `round-evidence-audit.mjs` | `--selftest` | `"cases": 13` (exit 0) | yes (`dbb7906…`) |
| `check-selfassessment.mjs` | `--selftest` | `cases=17` (verdict=clean, exit 0) | changed at 5a0178c: `738b23d` → `b2d5543` (= disk) |

Because those blobs are identical from `f185b4e` through `5a0178c`, the bullets' "measured … at
`f185b4e`" clause transfers: the numbers are what the same gate code measures at `f185b4e`.
[MEASURED] (`git rev-parse <rev>:scripts/<g>.mjs` vs `git hash-object scripts/<g>.mjs`.)

**But the bullets' invocation is not runnable as written (finding F3).** Four bullets spell the flag
`--selftest` for the two gates that accept only `--self-test`:

```
node scripts/check-freshness.mjs --selftest   # exit 2  FRESHNESS_GATE verdict=could-not-evaluate finding=usage
node scripts/check-sources.mjs   --selftest   # exit 2  FINDING id=could_not_evaluate … detail=bad_arguments
node scripts/check-freshness.mjs --self-test  # exit 0  FRESHNESS_SELFTEST verdict=clean cases=12
node scripts/check-sources.mjs   --self-test  # exit 0  SOURCES_SELFTEST verdict=clean cases=26
```
The oracle numbers are right; the command as printed is not. `check-selfassessment` genuinely takes
`--selftest`, so the fifth bullet's spelling is correct there. [MEASURED]

---

## 5. Controls re-exercised

### 5.1 Baseline before-count reproduces exactly
`.ufo/waves/round-27/selfassess-baseline-raw.json` (rev `4ad4c77…`): `mismatches=6`, `counted[]` =
`:335 (4→12)`, `:391 (4→12)`, `:1090 (66→26)`, `:1103 (66→26)`, `:1664 (12→13)` + m3 `observed: 6`.
The claim's `before` — "5 LOG-window findings … + 1 m3 working-tree finding" — is exactly right.
[MEASURED]

I also ran the round-27 baseline rev myself:

```
node scripts/check-selfassessment.mjs --rev f185b4e7ab10cd9e8925e8ec614c9c111772357d --json
  > …/scratch/ExecC1Tip/mine-at-f185b4e.json      # exit 1, 41 514 B
  # sha256 78a45c3f9e257fe0d524fe080f196c2b85c169cc0eb268cc7ac55a2ddaaaf1f2
```
`mismatches=5`, `counted[]` = `:335`, `:391`, `:1090`, `:1103` + m3 (`observed: 41` — peers were
writing during this run). **`:1664` is already `superseded=true` here.** [MEASURED]

The difference is a real commit boundary, not noise:
`git log --oneline 4ad4c77..f185b4e` → `f185b4e`, `f47eb2d`, `0c666ad`; `git show
4ad4c77:LOG.md | grep -c "supersedes LOG.md:1664"` → `0`. Commit `0c666ad` (round-26 wrap-up)
added the `:1853` correction, so `:1664` was counted at `4ad4c77` and cleared by `f185b4e`. [MEASURED]

### 5.2 Do-nothing control (block removed) re-reports the findings
Fixture repos, each `D=$(mktemp -d …) && git -C "$D" init -q`, with `rev-parse --show-toplevel ==
"$D"` verified before the first commit; real gate scripts copied from disk, real LOG.md, minimal
SCORECARD (m3 inert), and `.ufo/rounds/fleet-round-1-interactive-20261015/` copied because
`check-freshness` reads `freshness.expected.json` (:11).

| fixture | rev | `mismatches` | `counted[]` |
|---|---|---|---|
| block present (5a0178c LOG verbatim) | `db716ebb…` | **0**, `clean=true` | `[]` |
| block dropped (lines 1904-1925 removed) | `8541d731…` | **4** | `:335 4→12`, `:391 4→12`, `:1090 66→26`, `:1103 66→26` |

The claim's do-nothing control — "dropping the round-27 correction block re-reports the findings" —
is **met**: exactly the four dispositioned findings return, and `:1664` stays superseded by the
round-26 correction paragraph at 1845-1864 (added by `0c666ad`, before the round-27 block). [MEASURED]

### 5.3 Wrong-number control must NOT supersede
Adding corrections that state `cases: 11` / `cases: 27` for the right scripts and cite the right
lines still leaves `mismatches=4` with the same four entries. The number leg bites. [MEASURED]

### 5.4 Wrong-cite control — right number, nonexistent line (**finding F1**)
Same base, corrections state the correct `12`/`26` but cite `LOG.md:8888` and `LOG.md:9999`:

```
correction cites :8888 → mismatches 0  clean=true  counted=[]
```
Both bogus citations clear all four findings. The fourth declared leg ("cites the superseded line")
is implemented as `/:\d+/` (scripts/check-selfassessment.mjs:325), i.e. **any** line number.
[MEASURED]

### 5.5 Live-tree growth on the same revs (why `mismatches` is not 0 in-round)
Because m3 is `git status`-scoped, re-measuring a fixed rev yields a growing m3 count as siblings
write:

| rev | when | m1 counted | m3 `observed` | receipt |
|---|---|---|---|---|
| `5a0178c` | 14:32 (my arm 1) | 0 | **4** | `arm1-5a0178c.json` |
| `fd722a7` | 14:32 (my arm 2) | 0 | **4** | `arm2-fd722a7.json` |
| `336d5d1` | later | 0 | **27** | `arm-tip-336d5d1.json` |
| `f185b4e` | later | 4 (`:335`, `:391`, `:1090`, `:1103` — `:1664` already superseded) | **41** | `mine-at-f185b4e.json` |

The m1 class is the stable quantity; the m3 integer moves with the working tree. [MEASURED]

---

## 6. Findings

**F1 — C1's "cites the superseded line" leg is not implemented; it is decorative. [MEASURED, high]**
Declared (`claims.json` C1): "cites a superseded line". The shipped leg (line 325) is `/:\d+/` — it
matches any colon-number, anywhere in the paragraph. A correction
citing `:8888` (nonexistent) clears a stale tally at `:6`; on the real gates, `:8888`/`:9999` clear
all four findings (§5.4). No selftest case covers citation mismatch — the four `failureCapable` cases
cover stale/fixed/wrong-number/ambiguous only, so `verdict=clean cases=17` cannot detect this.

**F2 — the five bullets are ONE paragraph, so the correction unit is the whole block. [MEASURED, medium]**
`paragraphs()` (:256-265) splits on blank lines; the bullets at 1904-1925 have none between them, so
1904-1925 is a single supersession unit. Consequence on the real LOG: `LOG.md:221`
(`check-freshness`, 8 → 12) is reported `superseded=true` and is cleared by paragraph `1904-1925`,
which **never cites :221** — `clearedBy=[265-447, 1904-1925]`, `citesThisLine=false`. No counted
mismatch flips today (the four targeted findings are individually cited, and `:221` was already
cleared by 265-447), so the after-arm is sound — but the block grants any future `check-freshness`
claiming 12 / `check-sources` claiming 26 anywhere later in the doc a free pass. Separating the
bullets with blank lines, or comparing the cited number to the finding's line, closes it.

**F3 — the documented commands in four bullets fail verbatim. [MEASURED, low-medium]**
`--selftest` vs `--self-test` asymmetry, §4. A reader re-running the bullet's command gets exit 2.

**F4 — "4 correction bullets" is actually 5. [MEASURED, low]**
Lines 1904-1925 = four dispositioning bullets + one record-only restatement for `:1863` (a
`could-not-evaluate` line that clears nothing). The block's own prose calls it "restated for the
record anyway", so the count is self-consistent; only the assignment's framing is off by one.

**F5 — the claim's `after` says "mismatches=0 at the tip"; the whole-counter value cannot be 0 in-round. [MEASURED, medium]**
m3 is live-tree-scoped, so it counts wave receipts: `observed: 4` at 14:32, `observed: 27` when
re-measured at 336d5d1 while wave files accumulated. The **m1 class alone is 0** at both measured
revs (all 10 stale m1 findings superseded, 16 cne, 11 clean), which is the substantive claim. Read
literally, `mismatches=0` holds only on a clean tree; the claim should scope its after-arm to the m1
class or to a post-commit clean tree.

**F6 — arm 2 is rev-invariant with arm 1. [MEASURED, informational]**
They differ only in the `rev` field. Arm 2 does not probe anything new.

**F7 — the correction block's own preamble misstates the baseline state of `:1664`. [MEASURED, low]**
LOG.md:1897-1899 says five unsuperseded mentions were found, then parenthesises that ":1664 was
already superseded by the round-26 correction at its :1853 paragraph — counted as superseded, not
cleared". Those two statements cannot both hold, and the receipt settles it: at `4ad4c77` the
`:1853` correction does not exist (grep count `0`) and `:1664` is **counted** as the fifth finding;
by `f185b4e` it is `superseded=true`. Accurate phrasing: `:1664` was counted at the measurement
baseline and was cleared by the later round-26 wrap-up commit `0c666ad`. The claim's `before`
(5 findings including `:1664`) is right; only the explanatory parenthetical is wrong. No effect on
the verdict — the do-nothing control still shows the round-27 block clears exactly four.

## 7. Claim verdict (this seat's scope)

- C1 after-arm on its counter field: **PASS.** `mismatches` for the m1 class = 0 at `5a0178c` and
  `fd722a7`; every one of the five baseline LOG-window findings is superseded; selftest
  `cases=17 passed=17`; baseline `mismatches=6` reproduces exactly; do-nothing and wrong-number
  controls both bite as declared.
- Two gaps between declared and shipped predicate (F1, F2) and two documentation defects (F3, F7).
  None flips a counted mismatch in round 27; F1 makes the counter's zero weakly defensible for future
  rounds, since any `:N` satisfies the citation leg.

## 8. Non-harm / footprint

- Tracked files I wrote: **none.** At report time `git status --porcelain | grep -v '^??'` shows
  sibling edits landing around me (`LOG.md`, `SCORECARD.md`, `scripts/check-s106-evidence.mjs`,
  `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`,
  `corpus/knowledge/redirect-and-retry-after-semantics.md`, `corpus/lessons/round-27.md`). None were
  touched by me, and none of them existed when my arms ran — which is why every number here is bound
  to a rev, never to "the tree".
- All my writes are under `.ufo/waves/round-27/scratch/ExecC1Tip/` (gitignored via
  `.gitignore:5 .ufo/waves/*/scratch/`) plus this report. Fixtures: `mktemp -d` repos inside that
  scratch dir, toplevel-verified before first commit.
- **That scratch directory is shared.** Files I did not create appeared in it mid-run (`arm1.json`,
  `arm2-mine.json`, `arm3-mine.txt`, `at-HEAD.json`, `at-f185b4e.json`, `at-4ad4c77.json`, all
  timestamped 14:36). Only the paths named in this report are my evidence; I never read values out of
  a file I did not produce, with one exception noted next as corroboration.
- **Independent corroboration (peer artifacts, treated as data):** the peer's own runs at the two
  revs I was assigned report the same shape — `arm1.json` @ `5a0178c` → `mismatches=1`, one m3
  `counted[]` entry; `arm2-mine.json` @ `fd722a7` → `mismatches=1`, one m3 entry. Their `m3`
  `observed` values differ (18, 23, 37) purely with wall-clock tree growth, which independently
  confirms F5's tree-scoping.
- Git used read-only (`log`, `show`, `rev-parse`, `hash-object`, `diff`, `status`, `cat-file`,
  `blame`, `merge-base`). `/home/vgpnk/Projects/shokuknow` untouched. No subagents, no messages, no
  credentials.
- Tooling: no installs or upgrades were needed, so none were made (no pacman; per the host-wide
  guard, none attempted).

## 9. Open / not established

- Whether `m3`'s round-26 disposition should be re-pointed at round 27 — outside this item;
  `observed` is tree-scoped by design. [UNKNOWN]
- Which of the two identically-named `ExecC1Tip` reports is the report of record — a dispatch
  identity collision, not an evidence question. [DECISION OWNER: L1]
- Whether the parent wants F1/F2 fixed in-script this round or recorded for next — my contract is
  report-only, so no edit was made. [DECISION OWNER: L1]
