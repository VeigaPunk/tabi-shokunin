# Round 40 — lesson outline (report-only draft)

Status: **report-only**. `corpus/lessons/round-40.md` does not exist and was not written. No
corpus, `SCORECARD.md`, `LOG.md`, claim, counter, driver, selftest or wave file was edited by this
seat. Every value below is read from a named artifact; the Gate's admit slot is **empty** at the
time of writing and is recorded as empty, not as met.

Seat: `ScribeLesson` (scribe, leaf, milestone `lesson-draft`, axes coverage/quality).
Snapshot time: `2026-10-27T19:35:55Z` (16:35:55 -0300), host `plazir27`.

## 0. Round facts (observed)

| fact | value | source |
|---|---|---|
| baseline | `a1b1e939048885d2793759b7f49b10c5c820d70d` | `.ufo/waves/round-40/claims.json` `baseline` |
| final pre-data freeze | `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`, 2026-10-27 15:58:51 -0300 | `git log -1` (freeze-check.txt) |
| superseded freezes | `cb35339d…`, `c451a3c4…`, `8a387c0c…` | `claims.json` `amendment.supersedesFreezes` |
| spec/plan/dispatch pin | `250a38056438dc62a8ddcfbdfcdc065bfab9a048`, 15:59:40 -0300 | `git log -1` |
| ready marker / dispatch marker | 15:59:36.886 / 16:34:07.269 | `ls -l --time-style=full-iso` |
| seats | 64 (38 quarantine, 7 claim-review, 7 falsification, 4 mutation, 3 execution, 3 cross-surface, 1 scope-review, 1 lesson-draft) | `w1/swarm-registry.json` |
| claims | 1 (`C1`, coverage, capability-acquisition) | `claims.json` `claims` |
| axes at round start | adjacency 8, operability 9, depth 9, coverage 9, freshness 9, calibration 9; lowest `adjacency`; lowest-axis obligation waived | `claims.json` |

## 1. Gate

### 1.1 Admit slot — C1 (coverage capability)

Frozen predicate, verbatim from `claims.json`:

> measure-c1-round40 invokes the Firefox driver for exactly two Playwright Firefox loopback runs
> with a fresh 64-hex nonce AND the produced receipt and each run carry that exact invocation nonce
> AND each run has >=8 strictly increasing samples whose first-to-last observed timestamp span is
> >=1000ms AND both ss and proc observations are available with positive ticks on every sample and
> final sweep AND all observed nonLoopback counts are zero AND per-run owned tree is nonempty AND
> both runs have identical firstShotSha256 AND both runs have zero survivors and closed fixture
> port AND browserVersion is bound AND the round-39 receipt without the current invocation nonce
> and with sample spans below 1000ms is refused

Counting command (frozen):

> `node scripts/measure-c1-round40.mjs --out corpus/evidence/round40/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r40/TabiR40a2/measure`

**State: not observed at snapshot.** The admit requires a live invocation that exits 0 with
`predicate=true` and a nonce-bound receipt. Observed absence, at 19:35–19:37Z:

- `corpus/evidence/round40/` exists and is **empty** (`find` shows only the directory, 0 bytes,
  no `playwright-egress/` child);
- `/fast/scratch/hyaku/tabi-r40/TabiR40a2/` contains `counter-selftest/` and `selftest-redgreen/`
  only — **no `measure/` directory**, so the counting command has not been invoked;
- no seat's item is the counting command: `ExecLoopbackRun`'s frozen item text says “Do not create
  a round-40 receipt or modify lane files”, and the wave's L1 (`TabiR40a2`, named in `w1.ready`)
  awaits the wave handoff (`w1.ready.dispatched` written 16:34:07 -0300).

Lesson rule: the admit slot must stay empty until a wrapper exit 0 plus the produced receipt path,
its `receiptSha256`, its invocation nonce and counter v3's `findings:[]` are all quoted from one
run. No capability row may be drafted from controls, from the selftest, or from the prior round.

### 1.2 Reject slot A — round-39 receipt replayed under a fresh nonce (observed)

Independently replayed by this seat at 19:3xZ with a fresh 64-hex nonce
(`5c931ed0c61159f4fd3ba5826fd26b0c46882b14af7b1322b34874fbd0bd0e9c`):

```
node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs \
  corpus/evidence/round-39/playwright-egress/receipt.json --nonce <fresh>
exit=1
predicate=false  nonceMatched=false
findings=["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]
receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
```

Transcript: `w1/ScribeLesson/control-round39-replay-v3-observed.txt`. The recorded control receipt
`.ufo/waves/round-40/controls/c1-round39-replay-v3.json` carries the same four findings and
`predicate=false`. This is the Gate's reject case: the last committed receipt is not output by this
round's live driver invocation, and its sampled spans are below the frozen 1000 ms term.

### 1.3 Reject slot B — parser-only synthetic positive is selftest-only (recorded)

`.ufo/waves/round-40/controls/c1-measure-selftest-v2.json`: 7 cases, 7 passed. Case
`parser-only-synthetic-positive` returns exit 0 with `findings:[]`, but it is the counter reading a
hand-built JSON file (`selftest-measure-c1-round40.mjs` rewrites `s.t=start+i*150`), not a browser
run. The claim's `supersededProbe` states this explicitly: “retained as a parser-only selftest. It
is not a claim pass”. The lesson must not cite it as capability evidence.

### 1.4 Reject slot C — pre-existing synthetic output refused (recorded)

Selftest case `wrapper-refuses-pre-existing-synthetic-replay`: exit 1,
`stderr` contains `output-already-exists`, and the driver scratch path is not created
(`scratchCreated:false`). Source match: `scripts/measure-c1-round40.mjs:13` refuses
`fs.existsSync(outPath)` before line 16 generates the nonce and line 18 spawns the driver; the driver
independently refuses a pre-existing `--out` at `scripts/playwright-firefox-egress-round39.mjs:372`
(requires `--round40 --scratch`, 64-hex `--nonce`, `runs===2`, `!existsSync(out)`).

### 1.5 S145 source-access quote (located, scoped)

| field | observed |
|---|---|
| source | S145 — `proc_pid_net(5)`, Linux man-pages — `https://man7.org/linux/man-pages/man5/proc_pid_net.5.html` |
| retained bytes | `.ufo/waves/round-40/sources/proc_pid_net.html`, 17,119 B, sha256 `5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f` |
| anchor | DESCRIPTION, `/proc/net/tcp` heading at HTML line 156; quote at line 162 (block 156–163) |
| quote | “The "rem_address" is the remote address and port number pair (if connected).” |
| scope | TCP remote-endpoint field only; “does not establish UDP coverage, continuous egress visibility, or process ownership” (`S145-open.txt`) |
| reuse rule | The page was **not** refetched by this seat (no external interaction in scope); the retained bytes were checked instead. |

Metadata discrepancy: `S145-open.txt` labels the quote “(11 words)”, and `ConnSourcePattern`'s
verdict repeats “verbatim 11-word quote”. Whitespace token count of the located sentence is **12**
(`The / "rem_address" / is / the / remote / address / and / port / number / pair / (if / connected)`).
The lesson records both numbers and does not decide which convention is intended.

### 1.6 Assimilation status of the id `S145`

`.ufo/waves/round-40/assimilation/quarantine-slice` is a 38-line list; line 23 reads:

```
 S145   `payload-absent`
```

That row is the **register** row S145 (the cookie draft, see §8.1), not the man page the C1 claim
cites. The slice carries registration state only; it contains no quote and no source bytes, so it
cannot stand as the Gate's source-access evidence for the C1 citation.

## 2. Pre-data controls (observed / recorded)

| control | command | observed result | receipt |
|---|---|---|---|
| round-39 replay v3 | `node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs corpus/evidence/round-39/playwright-egress/receipt.json --nonce <fresh>` | exit 1; `schema`, `run-nonce-mismatch`, `run1-sample-span`, `run2-sample-span`; `predicate=false` | `.ufo/waves/round-40/controls/c1-round39-replay-v3.json`; this seat's transcript `control-round39-replay-v3-observed.txt` |
| measure selftest v2 | `node scripts/selftest-measure-c1-round40.mjs <explicit scratch>` | 7/7 cases; failures `[]` | `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json` (recorded, not re-run by this seat) |
| wrapper exclusive output | within the selftest | exit 1, `output-already-exists`, no driver scratch created | same receipt, case `wrapper-refuses-pre-existing-synthetic-replay` |
| four unavailable-surface mutants | within the selftest | each exit 1 with the exact expected finding (`run1-sample1-ss-unavailable`, `run1-sample1-proc-unavailable`, `run1-final-ss-unavailable`, `run1-final-proc-unavailable`) | same receipt |

Timing: freeze `07e99cf` 15:58:51 -0300 precedes `w1.ready` 15:59:36, the pin commit `250a380`
15:59:40 and `w1.ready.dispatched` 16:34:07, which is consistent with the claims' statement that no
seat was dispatched or scored during the pre-data revisions.

## 3. Frozen claim, digests and provenance

`claims.json` at `07e99cf` and in the worktree are the same bytes:
`sha256 3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246` (freeze-check.txt).

| path | sha256 at `07e99cf` | equals `claims.frozenDigests` |
|---|---|---|
| `scripts/playwright-firefox-egress-round39.mjs` | `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b` | yes |
| `scripts/measure-c1-round40.mjs` | `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735` | yes |
| `scripts/selftest-measure-c1-round40.mjs` | `5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82` | yes |
| `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` | `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` | yes |

No digest mismatch was observed at the named freeze commit.

## 4. Mistake M2 — the round-39 counter self-reference, and its prevention

### 4.1 What round 39 recorded

The round-39 lesson (`corpus/lessons/round-39.md`, M2) — as drafted by the round-39 scribe:

> The `≥8 samples over ≥1000 ms` term is met by `coverageMs`, which includes the 600 ms post-close
> tail sleep. … Sampled span is under 1000 ms in both runs; the counter checks `sampleCount >= 8`
> and `coverageMs >= 1000` only (`c1-egress-session-bound.mjs:95-110`).

### 4.2 Observed arithmetic (committed bytes)

`corpus/evidence/round-39/playwright-egress/receipt.json`, sha256
`e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`:

| run | samples | first→last observed span | `coverageMs` | final sweep vs last sample |
|---|---|---|---|---|
| run1 | 9 | 799 ms | 1560 | +661 ms |
| run2 | 8 | 701 ms | 1461 | +660 ms |
| receipt | — | — | — | no `runNonce` field at all |

So `coverageMs` exceeds the sampled span by exactly 761/760 ms — the post-close tail, not observation
time.

### 4.3 Why “counter self-reference”

The round-39 counter adjudicates coverage on the producer's own summary fields and never reads the
sample array:

- `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs:110` — `if (typeof r.sampleCount !== 'number' || r.sampleCount < 8) F(...)`
- `:111` — `if (typeof r.coverageMs !== 'number' || r.coverageMs < 1000) F(...)`
- `grep -n samples` on that file returns only the header comment (`:21`) and the predicate string
  (`:31`) — no read of `r.samples`.

The check therefore measures what the receipt says about itself, not what the timestamps show; the
recorded line range in the round-39 lesson (`:95-110`) also omits line 111, where the `coverageMs`
finding is actually pushed.

### 4.4 Prevention in the frozen round-40 counter (observed)

`c1-sample-span-v3.mjs`, frozen at the digest above:

- `:16` — `if(s.length<8) findings.push('run{i}-sample-count')` (array length, not `sampleCount`)
- `:18` — non-finite or non-increasing `t` → `run{i}-sample-order`
- `:19` — `if(ts.length<2||ts.at(-1)-ts[0]<1000) findings.push('run{i}-sample-span')`
- `grep -c 'sampleCount|coverageMs'` on v3 = **0**: neither summary field is read any more.

Shown to fail (the red arm): the round-39 receipt under a fresh nonce produces exactly
`run1-sample-span` and `run2-sample-span` (§1.2), and the same case is recorded in the selftest as
`round39-replayed-with-new-nonce` (exit 1, `run-nonce-mismatch` plus both span findings).

Residual, recorded and not asserted as a defect: `t` is still written by the driver, so the span
term is a producer-report check, not an independent-clock check. The selftest's own synthetic
positive fabricates `t` values (`s.t = start + i*150`) and the counter returns exit 0 — which is
precisely why the claim's anti-synthetic barrier is the wrapper's fresh nonce plus exclusive output
path (`scripts/measure-c1-round40.mjs:13,16,18,21-23`), not the span term by itself. The lesson must
state this trust boundary in one sentence rather than call the span term “measured coverage”.

Concurrent seat verdicts that arrived on this point (quoted, not aggregated): `CritSparseSamples`
(“refuses duplicate, decreasing, missing, NaN, string, null and Infinity timestamps, a sampled window
≤999 ms, and tail-inclusive coverage via finalSweep/coverage…”), `CritSurfaceGaps` (“accepts
availability without observation: `ticks` is hardcoded 1, `ss.lines`/`proc.inodes` never scored…”),
`RevAvailability` (“malformed-success `ss` and incomplete/malformed `/proc` observations can be
represented as available positive ticks…”), `RevIdentity` (“process ownership evidence is a one-time
PPID/argv snapshot reused across sampling…”), `ConnSourcePattern` (“the frozen C1 citation supports
only that clause”).

## 5. Census slots (exact)

### 5.1 Before slot (present)

| item | value |
|---|---|
| output file | `.ufo/waves/round-40/measure/census-start.txt`, 2,805 B, 21 lines, sha256 `4b08af7292fd2d014fff214c03bdb6415e34bec7fe01e521dca82f8191baf96d` |
| content | 20 lines `tabi W04 <id> duplicate url <url> across scopes`, then `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` |
| exit record | `.ufo/waves/round-40/measure/census-start-exit.txt`, 124 B, sha256 `29b4976a019a21689c5a870f17c62f61d000c0d5851510901bab9d8c89535dc2` |
| command | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` |
| exit | `exit: 0` |
| provenance | `census-start.txt` added by `cb35339` at 15:28:38 -0300 (a **superseded** freeze) with mtime 15:27:16; the exit record was added later by `f8e89d7` at 16:02:05 -0300, i.e. **after** the final freeze at 15:58:51 — the exit code is a later transcription, not a run-time capture. |

### 5.2 After slot (empty)

`find .ufo/waves/round-40 -iname '*census*' -printf '%p %s\n'` returns only the two files in §5.1.
No `census-end*` file, and no path for one is declared in `w1-plan.json`/`w1-spec.json` (the only
mentions of “census” there are this seat's own item text). The after slot is recorded as **empty**;
its path, command and exit must be taken from the artifact when it lands, not invented here.

## 6. Quarantine-first decisions (point-in-time snapshot, not aggregated)

Snapshot artifact: `w1/ScribeLesson/quarantine-snapshot-2026-10-27T19:35:55Z.txt`, sha256
`a34993deff87e5ab8640a33d121b37adf513f1fb29fefde75f3578150545faca`.

- 64 registry members; 44 seats had `<seat>/report.md` with a `VERDICT` first line at snapshot
  (all 38 quarantine seats plus 6 non-quarantine: `ConnSourcePattern`, `CritNoOp`,
  `CritSparseSamples`, `CritSurfaceGaps`, `RevAvailability`, `RevIdentity`).
- Quarantine verdict token split: **29 `VERDICT finding`, 9 `VERDICT ok`**. Ok seats:
  S118, S130, S131, S133, S138, S140, S153, S171, S174.
- The token is **not used consistently**: both of these confirm the same class and use different
  tokens —
  - `ScoutQuarantine102`: “VERDICT finding S102 (tabi round1, Last updated 2026-10-05 UTC)
    payload-absent confirmed: source opened (HTTP 200), exact quote absent”
  - `ScoutQuarantine130`: “VERDICT ok S130 absent: cited source opened (HTTP 200, 6541 bytes),
    exact quote not present; payload-absent confirmed”
  Same for S135 (“finding … payload-absent confirmed”) versus S138 (“ok … payload-absent confirmed”).
  Therefore **no defect count may be derived from 29/9**; the lesson must report per-row
  classifications with their own words.
- Representative row classes actually observed (each quoted from its report's first verdict line):
  - quote belongs to a sibling row: S106→S107 headings, S134→S135 anchor, S147→sibling error-1020
    page, S149→S150, S164→S165, S166→S167, S176→S177, S124 Q2 “cross-row spill from S125”;
  - quote located although the register says absent: S118 (arXiv 2305.11506 §2.3), S140
    (“classification=present … = partial/unverifiable”), S163 (“staged quotes verbatim … register
    defect, not an S163 fabrication”), S166 (“false-positive ABSENT … classification: present”),
    S175 (“partial — Quote A present in cited source (register typo 佪 vs source 佇)”);
  - unreachable rather than fabricated: S171 (“unreachable-as-staged (HTTP 404 on /features/ path,
    not fabrication); all 3 staged quotes located in the api/v0 JSON record”), S110
    (“not unreachable”);
  - textual-class mismatch: S165 (“quote is editorial summary text, not source prose”), S124
    (“verbatim Q1 (paraphrase of RFC 9110 §10.2.3; substance present)”).
- Ten seats wrote a second, flat `w1/<Seat>.md` in addition to `w1/<Seat>/report.md`
  (110, 111, 117, 118, 143, 144, 165, 174, `ConnSourcePattern`, `CritNoOp`); the two copies agree on
  the verdict line in every case checked in the snapshot.
- Twenty seats had no report at snapshot: `ConnPlanning`, `ConnSiblingOverlap`, `CritClaimBoundary`,
  `CritControlReach`, `CritSamplingGap`, `CritTreeOwnership`, `ExecCounterReplay`, `ExecDriverBuild`,
  `ExecLoopbackRun`, `MutCounterControls`, `MutEgressCases`, `MutOwnershipCases`, `MutSpanCases`,
  `RevClaimFit`, `RevCounter`, `RevCounterSemantics`, `RevDriver`, `RevNoHarm`, `RevPriorThree`,
  `ScribeLesson`. Their decisions are not recorded in this outline.

## 7. Timeline (pre-data vs dispatch)

| time (-0300) | event | evidence |
|---|---|---|
| 15:27:16 | `census-start.txt` mtime | `ls -l --time-style=full-iso` |
| 15:28:38 | `cb35339` adds `census-start.txt` (superseded freeze) | `git log --diff-filter=A` |
| 15:58:51 | final freeze `07e99cf` | `git log -1` |
| 15:59:36.886 | `w1.ready` (names the dispatch path and L1 `TabiR40a2`) | `ls -l`, `cat` |
| 15:59:40 | `250a380` pins spec/plan/dispatch/registry | `git log -1` |
| 16:01:59 / 16:02:05 | `census-start-exit.txt` mtime / added by `f8e89d7` | `ls -l`, `git log` |
| 16:34:07.269 | `w1.ready.dispatched` | `ls -l` |
| 19:35:55Z | quarantine snapshot (16:35:55 -0300) | snapshot file header |
| 19:37Z | `corpus/evidence/round40` empty; no `measure/` scratch | `find`, `ls` |

## 8. Open conflicts (verbatim)

**8.1 The id `S145` denotes two different documents.**

- `claims.json`: `"source": "S145 (proc_pid_net(5), reopened 2026-10-27; DESCRIPTION /proc/net/tcp),
  cited by the round-40 receipt and lesson Gate."`
- `w1/ScoutQuarantine145/report.md`: “VERDICT finding S145 (tabi round3,
  draft-ietf-httpbis-rfc6265bis-13): source fetched OK (200, 146976 B); quotes "Common CSRF
  weaknesses and protection mechanisms" and "Limitations of SameSite" ABSENT”, against the register
  row at `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:200`
  and `assimilation/quarantine-slice:23`.
- The same quarantine report also records a third row: “`kumitate | round5 | S145` … malformed id
  (trailing backtick) … NOT fetched/classified”.

The lesson must name the C1 citation as “S145 (proc_pid_net(5))” and never as “the S145 row”.

**8.2 Verdict tokens are not uniform** — see §6 (S102/S130 and S135/S138 pairs).

**8.3 Quote word count 11 vs 12** — see §1.5.

**8.4 The census “before” exit code postdates the final freeze** — see §5.1 provenance; the output
file predates the freeze, the `exit: 0` record does not.

**8.5 Concurrent claim findings, quoted without aggregation** — `CritNoOp` (“VERDICT ok — no
do-nothing path (round-39 reuse, relabel, coverageMs edit, arbitrary JSON, pre-existing --out) is
admitted by the measured command”), `CritSamplingGap` and the four mutation seats had not reported
at snapshot.

## 9. What the lesson still needs before it can leave draft

1. The live admit: wrapper exit 0, `predicate=true`, `nonceMatches=true`, receipt path plus
   `receiptSha256`, and counter `findings:[]`, all from one invocation (§1.1).
2. The after census: file, command, exit and warning count (§5.2).
3. Per-row assimilation decisions for the 38 quarantine ids — the seat verdicts exist; the
   assimilation record does not yet.
4. Whether the claim text will be restated with the producer-timestamp trust boundary (§4.4).
5. Resolution or explicit deferral of the `S145` identity collision (§8.1) and the verdict-token
   inconsistency (§8.2), since both affect how the lesson counts anything.

No item above is asserted as done in this outline.
