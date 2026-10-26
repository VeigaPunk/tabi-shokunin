# ExecCalibrationTip — round-30 w2 (falsify) — calibration no-harm

**Verdict: holds.** I attacked the calibration surface that the round-30 commits touch — the self-assessment counter, the gate registry, the sources gate, the four self-test tallies stated in SKILL.md's round-30 registry rows (gate-mutants 12, frontier-admission 24, s106-evidence 10, release-pins 29) and every SHONEN.md box pointer — in one clean `--shared` clone at `072af95fe2822f0785a6ff88a578e2142dd258e5` (`git status --porcelain` empty). All three requested gates are clean at the tip (`check-selfassessment`: `mismatches=0`, exit 0; `check-gate-registry`: `nonconformant=0`, exit 0; `check-sources`: exit 0, 118 rows), all four registry tallies equal the observed self-test output (12/12, 24/24, 10/10, 29/29 — each run independently, exit 0), the round-30 SCORECARD correction lines `:1507` (s106 10/10) and `:1508` (release-pins 29/29) are the *live, oracle-equal* findings that supersede the round-29 figures at `:1438/:1466/:1479` and `:1485`, and every SHONEN pointer still resolves to the content it names. Two apparatus gaps survive, neither violated by anything the round landed and neither inside C1/C2: (1) **no gate reads SKILL.md self-test tallies** — probe-2 mutated the round-30 s106 row to `cases=99, passed=99` and both no-harm gates stayed clean, so the round's registry tallies are correct but machine-unprotected; (2) the counter's `clean=true` is computed over 33 of 125 findings (92 could-not-evaluate — 77 `m2-receipt-exit` by declared design; 15 superseded), so its zero is substantive for `m1` in SCORECARD/LOG only. Severities: (1) low-medium apparatus coverage, (2) low/by-design. I found no defect in the round-30 artifacts themselves.

## Evidence base

Clone isolation (measurements only here, never in the lane checkout):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r30/ExecCalibrationTip/clone
git -C clone checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5
rev-parse HEAD            -> 072af95fe2822f0785a6ff88a578e2142dd258e5
rev-parse --show-toplevel -> /fast/scratch/hyaku/tabi-r30/ExecCalibrationTip/clone
status --porcelain | wc -l -> 0    (before and after all probes; HEAD restored to the tip commit)
TMPDIR=/fast/scratch/hyaku/tabi-r30/ExecCalibrationTip/tmp
```

Frozen-counter bytes at the tip recomputed, matching `claims.json` `frozenDigests`:

```
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  scripts/check-frontier-admission.mjs
```

## 1. Requested no-harm checks (commands verbatim, exit codes)

| Check | Command (cwd = clone) | Exit | Observed | Required | Verdict |
|---|---|---|---|---|---|
| selfassessment | `node scripts/check-selfassessment.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json` | 0 | `mismatches=0`, `clean=true`, findings 125, `couldNotEvaluate=92`, `superseded=15`, `counted=[]` | mismatches 0 | **holds** |
| gate registry | `node scripts/check-gate-registry.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5` | 0 | `GATE_REGISTRY verdict=clean rows=36 gates=20 nonconformant=0 findings=0` | nonconformant 0 | **holds** |
| sources | `node scripts/check-sources.mjs` | 0 | `SOURCES_GATE verdict=clean rows=118 tiers=A:103,B:6,C:9 status=queued:19,mined:90,rejected:9 findings=0` | clean | **holds** |
| s106 corroboration | `node scripts/check-s106-evidence.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5` | 0 | `S106_EVIDENCE verdict=valid … sha_match=true anchor_located=true valid=true` | (claims noHarmChecks) | **holds** |
| release pins corroboration | `node scripts/check-release-pins.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --stable 156.0.8078.47` | 0 | `population=23 resolved=23 unresolved=0 holds=16 drifted=7` | unresolved 0 | **holds** |

Round-30 correction lines are *live and oracle-equal*, not swallowed by supersession — counter findings for SCORECARD.md:

| SCORECARD line | script | claimed | observed | superseded |
|---|---|---|---|---|
| 1438, 1466, 1479 | check-s106-evidence.mjs | 5 / 7 / 7 | 10 | true |
| 1485 | check-release-pins.mjs | 20 | 29 | true |
| **1507** | check-s106-evidence.mjs | **10** | **10** | **false (live)** |
| **1508** | check-release-pins.mjs | **29** | **29** | **false (live)** |

Registry `selfassessment-counter` row `SKILL.md:2545` also states `cases=22, passed=22`; observed `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22` (exit 0) — holds.

## 2. Round-30 SKILL.md registry tallies vs observed self-test output

Each self-test run independently in the tip clone (`node scripts/<gate>.mjs --selftest`), all exit 0:

| SKILL row | Gate | Row claim (line text) | Observed tally line | Verdict |
|---|---|---|---|---|
| `:2558` | check-gate-mutants | `--selftest` (cases=12, passed=12) | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` | **match** |
| `:2559` | check-frontier-admission | `--selftest` (cases=24, passed=24) | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` | **match** |
| `:2560` | check-s106-evidence | `--selftest` (cases=10, passed=10) | `S106_SELFTEST verdict=clean cases=10 passed=10` | **match** |
| `:2561` | check-release-pins | `--selftest` (cases=29, passed=29) | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` | **match** |

Supersession convention confirmed in code and output: `scripts/check-gate-registry.mjs:38` ("rows supersede earlier ones"), gate row selection uses the latest row (`:278`, `row=latest.line`); the registry run resolves `s106-evidence … row=2560 rows=4`, `release-pins … row=2561 rows=2`, `check-gate-mutants … row=2558`, `check-frontier-admission … row=2559`, all `conformant`. The older `SKILL.md:2544` s106 row still reads `cases=7, passed=7` — append-only text, correctly superseded by `:2560`, but a reader who greps the first s106 row sees 7 (note, not a mismatch under the lane's own rule).

## 3. Sensitivity probes (mutations only inside my scratch clone; each restored)

The point of a falsification pass is to show the zero is load-bearing, not vacuous.

- **probe-1 — the selfassessment zero bites.** Committed `SCORECARD.md:1507` `(10/10)` → `(11/11)` (`254a5585…`). `node scripts/check-selfassessment.mjs --rev 254a5585… --json` → **exit 1**, `mismatches=4`: `:1507 claimed 11 / observed 10`, and the previously superseded `:1438` (5/10), `:1466` (7/10), `:1479` (7/10) become counted because the correct 10/10 corrector is gone. So the tip's `mismatches=0` depends on `:1507` stating exactly 10.
- **probe-2 — SKILL.md tallies are unread by every no-harm gate (apparatus gap).** Committed `SKILL.md:2560` `cases=10, passed=10` → `cases=99, passed=99` (`eb274340…`). `check-selfassessment --rev eb274340… --json` → **exit 0, `mismatches=0`, `clean=true`**; `check-gate-registry --rev eb274340…` → **exit 0, `nonconformant=0`**. Cause: the counter's `m1` scan reads `SCORECARD.md` and `LOG.md` only (`scripts/check-selfassessment.mjs:402,405`), and the registry checks row shape and gate-script existence, not tally values. Consequence: the four tallies in §2 are verified here only by reading — a wrong figure in a newest registry row would pass every gate. Severity **low-medium** (calibration/operability coverage, not a round-30 artifact defect; nothing landed by this round is wrong).
- **probe-3 — the registry zero also bites.** Dropped the `owner` cell from `SKILL.md:2558` (`8215a970…`). `check-gate-registry --rev 8215a970…` → **exit 1**, `GATE name=check-gate-mutants … NONCONFORMANT missing=owner`, `FINDING id=e2-field-incomplete …`, `nonconformant=1`. The conformance zero at the tip is not a parse artefact.

Restore after probes: `git checkout -q --detach 072af95fe2822f0785a6ff88a578e2142dd258e5` → `HEAD=072af95fe2822f0785a6ff88a578e2142dd258e5`, porcelain 0. No lane file, index or jj state touched.

## 4. SHONEN.md boxes at the tip

All four boxes are `[~]` (unpromoted); every pointer resolves at `072af95fe…`:

| SHONEN | Pointer | Resolution at tip | Verdict |
|---|---|---|---|
| `:5-6` | `SKILL.md` §Approval table (`:697`) | `:697` = `## Approval table — finalized (every interaction class mapped)`; taxonomy `corpus/knowledge/interaction-approval-table.md` present (25312 B) | resolves |
| `:5-6` | `SKILL.md` §Evidence ladder | heading `:361` `## Evidence ladder — climb to the rung the claim needs` | resolves |
| `:5-6` | `SKILL.md` §Runbook | heading `:87` `## Runbook — loopback capture, start to finish` | resolves |
| `:5-6` | `SKILL.md` `:1598-1617` kaika decision rows | `:1598` = `## Errata — kaika fleet round-1 …`; the kaika decision table rows sit at `:1604-1608` inside the range; `:1617` = the structural note closing the Sources gate registry. Range resolves *containing* the named rows; it is coarse (starts one heading early and overruns into the registry), identical to the range as authored at `5cdc976` — no drift since | resolves (coarse, note) |
| `:7-8` | `corpus/knowledge/multi-step-journey.md` §1–§2, §7 | file present (350 lines, append-only errata since the round-3 "296 lines" description); headings `§1` `:12`, `§2` `:71`, `§7` `:252` (`Cleanup + closure proof`) | resolves |
| `:7-8` | `LOG.md` round-3 entry | `LOG.md:76` `— round 3: probation-completing round, recorded by TABI-B4`, admitting `multi-step-journey.md`, `interaction-approval-table.md`, `executor-test-sufficiency.md` | resolves |
| `:9-10` | `corpus/knowledge/executor-test-sufficiency.md` §0, §4 | file present (330 lines); `§0` `:20`, `§4` `:175` = `## 4. Verdict and gaps` → `Verdict: … sufficient to execute and to grade …` (`SUFFICIENT`) | resolves |
| `:11-12` | `PROVINCE.md:3-19` | `:3` `**Domain:** …` through `:19` `operator-approved interaction only.` (file is 21 lines) — exactly the domain/owns/refuses block | resolves |
| `:11-12` | `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` | present, 4 lines: `present revenger-shokunin / kaidoku-shokunin / kake-shokunin / kagi-shokunin`; those four sibling dirs exist under the fleet root | resolves |
| `:6` | history claim "prior `[x]` named lane-dispatched TABI-B4/TABI-R3-4" | `git show 5cdc976:SHONEN.md` diff shows the prior `[x]` boxes (verifiers TABI-B4 / TABI-R3-4) replaced by the current `[~]` lines; the only SHONEN commit ever is `5cdc976` (2026-10-19) | resolves |
| `:6, :12` | substrate claim "PROVINCE.md still accurate" | `~/.kimi-code/plugins/managed/kimi-webbridge/` and its `kimi.plugin.json` exist (shape-only check, values not read) | resolves |

No dangling path or out-of-range line reference in SHONEN.md. Programmatic pass: every backticked path/line pointer in the file (9 of them) exists and its range is within the file's line count.

## 5. Risks / notes (no repair performed — attack seat)

1. **SKILL tallies unprotected** (probe-2). The round-30 registry rows are the only self-test tallies this round changed outside SCORECARD, and the selfassessment counter cannot see them. Any future round could state a wrong newest-row tally and stay `clean`.
2. **`clean=true` covers 33/125 findings**: 92 could-not-evaluate (77 `m2-receipt-exit` because the recorded commands fall outside the closed `git cat-file -e` / `git show` grammar — declared design at `scripts/check-selfassessment.mjs:52-56,369`, never counted as mismatch) and 15 superseded. `mismatches=0` is therefore a statement about `m1` tallies in SCORECARD/LOG, not about receipt re-execution.
3. **Coarse SHONEN range** `:1598-1617` (rows at `:1604-1608`) — resolves, but a reader starting at the cited first line lands on an errata heading, not a decision row.
4. **Stale-but-superseded** `SKILL.md:2544` (`cases=7`) coexists with `:2560` (`cases=10`); correct only under the latest-row rule. `check-gate-registry` implements that rule; nothing else enforces reader-side precedence.

## 6. Honesty / scope

- Every number above is from a command I ran in the tip clone; receipts are copied under `.ufo/waves/round-30/w2/ExecCalibrationTip/` with `SHA256SUMS` (`selfassess.json a52c7d79…2c15`, `gate-registry.txt df9e4e62…7f1b`, `sources.txt 5eb856ea…b7adc`, `st-*.txt`, `probe1.json 0aa034fd…6832`, `probe2-selfassess.json a8b27397…37ca`, `probe2-registry.txt 82cade96…6c16`, `probe3-registry.txt d4d62f9c…aaca`, `s106.txt`, `release-pins.txt`).
- Not run by me (other seats): `check-gate-mutants --rev … --json` and `check-frontier-admission … --live` (C1/C2 seats), `scripts/sources-census.sh validate --root … tabi` (its own receipt line; my clone has no fleet root), and no `--live` network fetch was made for this seat — zero network calls.
- No tools installed or upgraded; no network; no writes outside my output dir and `$HYAKU_SCRATCH/tabi-r30/ExecCalibrationTip/`; scratch left for the harness `rm -rf` (clone + receipts at `/fast/scratch/hyaku/tabi-r30/ExecCalibrationTip/`).
