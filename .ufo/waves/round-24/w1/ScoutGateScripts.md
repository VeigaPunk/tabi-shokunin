# ScoutGateScripts — selftest battery

Date: 2026-10-25 (local −03:00). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Runtime: node v24.21.0 (`/run/user/1000/fnm_multishells/1738979_1792909166840/bin/node`, fnm multishell).
Method: for each script, the selftest flag was determined from source (`--self-test` vs `--selftest`),
run from the lane root, `timeout 600`, P=6 parallel; exit code captured; stdout+stderr kept at
`.ufo/waves/round-24/scratch/ScoutGateScripts/out/*.log`. Repo impact measured by a full mtime
snapshot of the lane (28,982 files) before/after the battery; a normalized path-keyed diff attributed
every change.

## Results — selftest runs (22/22 exit 0)

| script | flag | exit | stable tally token (verbatim) | isolation note |
|---|---|---|---|---|
| `scripts/check-adjacency.mjs` | `--self-test` | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | no repo files written |
| `scripts/check-aria-metadata.mjs` | `--self-test` | 0 | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` | no repo files written |
| `scripts/check-freshness.mjs` | `--self-test` | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` | no repo files written |
| `scripts/check-measurement-binding.mjs` | `--self-test` | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | no repo files written |
| `scripts/check-round-contract.mjs` | `--self-test` | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | no repo files written |
| `scripts/check-sources.mjs` | `--self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` | no repo files written |
| `scripts/check-user-round-contract.mjs` | `--self-test` | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | no repo files written |
| `scripts/freshness-witness.mjs` | `--self-test` | 0 | `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0` | no repo files written |
| `scripts/round-evidence-audit.mjs` | `--selftest` | 0 | `{"schema":"tabi-round-evidence-audit-v1-selftest","cases":13,"passed":13,"clean":true}` | no repo files written |
| `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` | `--self-test` | 0 | `CLAIM_SELFTEST verdict=clean cases=9/9` | no residual repo writes (declared temp fixture tree) |
| `.ufo/waves/round-18/measure-c1.mjs` | `--self-test` | 0 | `{"selfTest":true,"cases":38,"allPass":true}` | no repo files written |
| `.ufo/waves/round-18/measure-c2.mjs` | `--self-test` | 0 | `{"schema":"tabi-round18-c2-selftest-v1","verdict":"pass","cases":26}` | no repo files written (private temp/browser) |
| `.ufo/waves/round-18/measure-c3.mjs` | `--self-test` | 0 | `{"selfTest":"pass","cases":38}` | no repo files written |
| `.ufo/waves/round-19/measure-c1.mjs` | `--self-test` | 0 | `{"schema":"tabi-webmcp-validation-counter-selftest-v1","selfTest":true,"noReproduce":true,"allPass":true,"case_count":39,"negative_shape_count":31}` | **WRITES repo receipt** `corpus/evidence/round-19/selftests/c1.json` (generatedAt updated to run time) |
| `.ufo/waves/round-19/measure-c2.mjs` | `--self-test` | 0 | `{"schema":"tabi-round19-c2-selftest-v1","verdict":"pass","cases":40,"passed":40,"failed":0}` | **WRITES repo receipt** `corpus/evidence/round-19/selftests/c2.json` (byte-identical rewrite; mtime changes) |
| `.ufo/waves/round-19/measure-c3.mjs` | `--self-test` | 0 | `C3_SELFTEST verdict=clean cases=26 failed=0` | **WRITES repo receipt** `corpus/evidence/round-19/selftests/c3.json` (argv field re-pointed to current lane path) |
| `.ufo/waves/round-19/isolation/check-isolation.mjs` | `--self-test` | 0 | `{"selfTest":"pass","cases":7,"negativeShapes":6,"receipt":"corpus/evidence/round-19/selftests/isolation.json"}` | **WRITES repo receipt** `corpus/evidence/round-19/selftests/isolation.json` (startedAt/completedAt updated to run time) |
| `.ufo/waves/round-20/check-wave.mjs` | `--selftest` | 0 | `CHECK_WAVE_SELFTEST verdict=clean cases=27 failed=0` | no repo files written |
| `.ufo/waves/round-20/measure-c1.mjs` | `--selftest` | 0 | `MEASURE_C1_SELFTEST verdict=clean cases=45 reasons=24` | no repo files written |
| `.ufo/waves/round-21/measure-c1.mjs` | `--selftest` | 0 | `{"schema":"tabi-round21-c1-selftest-v1","verdict":"clean","cases":83,"passed":83}` | no repo files written |
| `.ufo/waves/round-22/measure-c1.mjs` | `--selftest` | 0 | `{"schema":"tabi-round22-c1-selftest-v1","verdict":"clean","cases":45,"passed":45}` | no repo files written |
| `.ufo/waves/round-22/check-review-chronology.mjs` | `--selftest` | 0 | `{"schema":"tabi-round22-review-chronology-selftest-v1","verdict":"pass","exit":0,"cases":17}` | no repo files written |

## Scripts named in SKILL.md registry/gate rows with no standalone selftest (not run as selftests)

| script | reason |
|---|---|
| `scripts/webmcp-invoke-round17.mjs` | harness; no selftest flag; runs only with `--out <external path>` (browser/server) |
| `scripts/webmcp-invoke-round18.mjs` | probe; registry: "counter self-test supplies finite negative shapes" — negatives come from `measure-c2` selftest (run above, 26 cases), no standalone selftest |
| `scripts/webmcp-invoke-round19.mjs` | probe; registry: "no standalone self-invocation claimed" |
| `scripts/webmcp-validation-round19.mjs` | probe; selftest-mode is an invocation (`--cases …/selftest/cases --fixtures …/selftest/fixtures --out <external>`), not a flag; needs browser/server + external output — not run under read-only/no-browser constraints |
| `scripts/webmcp-lifecycle-round21.mjs` | probe; "not a gate; actual run retained"; no selftest |
| `scripts/webmcp-loopback-round16.mjs`, `scripts/aria-loopback-round13.mjs` | harnesses; no selftest flag |
| `.ufo/waves/round-17/measure-c{1,2,3}.mjs` | counters (take REV); no selftest flag |
| `.ufo/waves/round-18/recheck-fetch.mjs` | probe; `--normalize-only` is "a probe, not a self-test" |
| `.ufo/waves/round-20/counts.mjs`, `.ufo/waves/round-20/lesson-history.mjs` | probes; "none claimed" |
| `scripts/selftest-measurement-binding.mjs` | helper driven by `check-measurement-binding --self-test` (run above) |
| `scripts/pstack-*`, `scripts/user-*` | counting commands; not gate-row-named; not run |
| `scripts/check-gate-registry.mjs`, `scripts/check-selfassessment.mjs` | **do not exist yet** (round-24 C1/C2 APIs the L1 will write) — nothing to run |

## Isolation findings

- mTime snapshot diff across the battery (excluding my scratch dir): **5 files changed, 3 files created, 0 removed**.
  - The **3 created** files are sibling report paths (`.ufo/waves/round-24/w1/LabFreshness.md`, `RevEntryQuality.md`, `SentScopes.md`) — created by concurrent peers during the window, not by this battery (I write only scratch + this report).
  - **4 changed files are caused by my battery**: the round-19 selftest receipts listed above. After the run they differ from HEAD:
    - `c1.json`: `generatedAt` 2026-10-21 → 2026-10-25T08:17:34.894Z.
    - `c3.json`: `argv[1]` re-pointed from `/fast/scratch/tabi-r19/L1-final-fleet/…` to the current lane path — the receipt is environment-dependent and is regenerated on every selftest run.
    - `isolation.json`: `startedAt`/`completedAt` refreshed to run time.
    - `c2.json`: content byte-identical to HEAD but the file is rewritten (mtime changes).
  - `.git/index` mtime churn also observed (stat refresh from `git status`; no content change, not attributable to a single actor).
- So the answer to "did the run leave any file outside a temp dir": **yes, for 4 scripts** — `.ufo/waves/round-19/measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, and `isolation/check-isolation.mjs` overwrite committed tracked receipts inside the lane (`corpus/evidence/round-19/selftests/{c1,c2,c3,isolation}.json`) instead of writing only to temp dirs. The other 18 selftests left no repo file behind.
- All selftests are otherwise self-contained: isolates use temp/private fixture trees (git repos, browser profiles, servers); no external network access was observed; no long-lived services left running.

## Tally discrepancies vs SKILL.md registry

- `check-freshness --self-test`: registry claims "eight isolated CLI cases"; observed stable token is `cases=12`.
- `check-sources --self-test`: registry claims 25 cases; observed `cases=26`.
- All other counts match the registry where a number is stated (adjacency 57, measurement-binding 76, round-contract 38, user-contract 45, freshness-witness 8, r18-c2 26, r18-c3 38, r19-c2 40, r19-c3 26, isolation 7, wave 27, r20-c1 45, r21-c1 83, r22-c1 45, chronology 17, evidence-audit 13).

## Environment / tooling note

No tools were installed; `node` v24.21.0 (fnm) already present. No pacman transactions. Run window ~2026-10-25 05:17:33–05:17:48 local; wall ≈9.4 s for the 22-test battery.
