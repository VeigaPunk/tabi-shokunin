# Round 31 w1 — ExecNoHarmBaseline: no-harm matrix at the freeze

**Verdict:** The freeze tree is green on every no-harm surface the round claims. In a clean `git clone --shared`
checked out at `9505a10eb80b2a0b273ebaba3f7f872ad302192d` (TMPDIR under `$HYAKU_SCRATCH`, clone `status
--porcelain` empty before and after), all six `claims.json §noHarmChecks` entries exit 0 with the claimed readings —
gate-registry `nonconformant=0` (38 rows, 21 gates), release-pins `unresolved=0` (23 resolved), s106-evidence
`valid=true`, frontier-admission `population=2 admitted=2 failing=0`, sources `clean rows=118 findings=0`, fleet
sources-census `tabi ok` with the 19 pre-existing W04 duplicates; the ticket's `--json` frontier invocation
(`--frontier rate-tos-signal --since 2026-10-26`) is green on the same reading with `live=false`. The gate-registry
gate derives a gate set of 21 scripts at the freeze rev, and **21/21 of those gates' own self-tests exit 0 and report
clean/pass** (decision-table 34/34, self-assessment 30/30, frontier 24/24, mutation-tester 12/12 among them), matching
the batches the freeze commits claim. Both frozen counters are byte-identical to `claims.json §frozenDigests` at the
rev, so the no-harm column is measured with the frozen bytes. As a reference (not a green row) the two claim counters
at the freeze tree read their designed **before** values — C1 `population 0 / admitted 0 / exit 1`, C2 `mismatches 9 /
exit 1` at exactly the nine cited lines — which confirms the instruments can still fail. The only non-zero exit in the
whole matrix was my own invocation error on a historical wave gate (`--selftest` where it accepts `--self-test`),
rerun correctly and green; no gate, claim surface or lane file failed, and nothing under `scripts/` was touched.

## Environment and identity

| Item | Value |
|---|---|
| Freeze commit / measurement rev | `9505a10eb80b2a0b273ebaba3f7f872ad302192d` (tree as frozen; `scripts/` unchanged) |
| Baseline reference | `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc` |
| Clone | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` + `checkout -q 9505a10…`; `$S=/fast/scratch/hyaku/tabi-r31/ExecNoHarmBaseline` (`$HYAKU_SCRATCH=/fast/scratch/hyaku`) |
| Clone cleanliness | `git -C $S/clone status --porcelain` → 0 lines before the runs and 0 lines after all 21 self-tests (they use TMPDIR only) |
| Frozen counter bytes at rev | `sha256sum scripts/check-decision-table.mjs` = `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`; `scripts/check-selfassessment.mjs` = `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce` — both equal `claims.json §frozenDigests` |
| Runtime | node v24.21.0, git 2.56.0, curl 8.23.0; `jq` on PATH is the fleet shim `/home/vgpnk/Projects/shokunin/jq` (jaq 3.1.1) — key fields were read from JSON with python, so the `jq` form was not needed |
| Wall clock | runs 2026-10-26T08:39Z–08:44Z (UTC) |
| Network | **none used**: every production run offline, frontier-admission reported `live=false`; no `--live`, no fetch receipt written |
| Tool installs | none (nothing needed; no pacman/uv/npx transaction) |

## Evidence — no-harm checks (`claims.json §noHarmChecks`, claims-form commands)

| # | Command (cwd `$S/clone`) | Exit | Reading |
|---|---|---|---|
| 1 | `node scripts/check-gate-registry.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d` | **0** | `GATE_REGISTRY verdict=clean … rows=38 gates=21 nonconformant=0 findings=0` |
| 2 | `node scripts/check-release-pins.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d --stable 156.0.8078.47` | **0** | `RELEASE_PINS verdict=clean … population=23 resolved=23 unresolved=0 holds=16 drifted=7` |
| 3 | `node scripts/check-s106-evidence.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d` | **0** | `S106_EVIDENCE verdict=valid … present=true sha_match=true anchor_located=true valid=true` |
| 4 | `node scripts/check-frontier-admission.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d --frontier rate-tos-signal --since 2026-10-26` | **0** | `FRONTIER_ADMISSION verdict=clean … live=false population=2 admitted=2 failing=0` |
| 4b | same + `--json` (ticket form) | **0** | `clean=true population=2 admitted=2 failing=0 live=false`, lesson `corpus/lessons/round-30.md` |
| 5 | `node scripts/check-sources.mjs` | **0** | `SOURCES_GATE verdict=clean rows=118 tiers=A:103,B:6,C:9 status=queued:15,mined:94,rejected:9 findings=0` |
| 6 | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` (cwd `/home/vgpnk/Projects/shokunin`) | **0** | `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`; 19 × `W04` duplicate-url-across-scopes warnings, 0 `E*` codes |

Claim-by-claim: (1) nonconformant 0 ✓ with the two round-31 rows present in the 38; (2) unresolved 0 ✓; (3) valid
true ✓; (4) population 2 / admitted 2 ✓ (round-30 C2 reading undisturbed); (5) clean ✓; (6) exit 0 ✓.

## Evidence — every gate's self-test (gate set derived by `check-gate-registry` at the rev: 21 gates)

Each row is `node <script> <flag>` run from `$S/clone` with `TMPDIR=$S/tmp`; exit codes are the process exits.
Note the flag spelling differs per gate — `scripts/check-*` gates use `--selftest` except adjacency, aria-metadata,
freshness, measurement-binding, round-contract, user-round-contract and sources, which use `--self-test` (registry row
2471 for claim-record spells `--self-test (cases=9/9)`).

| Gate (script) | Exit | Reading |
|---|---|---|
| check-adjacency | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` |
| check-aria-metadata | 0 | `cases=36`, `ok=true`, every case `ok:true` |
| check-bfcache-receipt | 0 | `cases=17 passed=17` |
| check-decision-table | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` |
| check-freshness | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| check-frontier-admission | 0 | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` |
| check-gate-mutants | 0 | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` |
| check-gate-registry | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` |
| check-measurement-binding | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` |
| check-release-pins | 0 | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` |
| check-round-contract | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` |
| check-s106-evidence | 0 | `S106_SELFTEST verdict=clean cases=10 passed=10` |
| check-selfassessment | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30` |
| check-source-reopen-receipt | 0 | `cases=18 passed=18` |
| check-sources | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| check-user-round-contract | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1` |
| round-evidence-audit | 0 | `cases=13 passed=13 inventoryOk=true clean=true` |
| `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` (`--self-test`) | 0 | `CLAIM_SELFTEST verdict=clean cases=9/9` |
| `.ufo/waves/round-21/measure-c1.mjs` | 0 | `verdict=clean cases=83 passed=83` |
| `.ufo/waves/round-22/check-review-chronology.mjs` | 0 | `verdict=pass`, 17 cases, all field checks pass |
| `.ufo/waves/round-22/measure-c1.mjs` | 0 | `verdict=clean cases=45 passed=45` |

`check-decision-table` 34/34 and `check-selfassessment` 30/30 are the two counts the freeze documents rely on (C1's
counter and C2's v2 oracle with its eight added cases); both agree with the frozen counter bytes measured above.

## Evidence — reference **before** readings (not no-harm rows; they are supposed to fail)

| Command | Exit | Reading |
|---|---|---|
| `node scripts/check-decision-table.mjs --rev 9505a10… --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --json` | 1 | `entryPresent=false tablePresent=false population=0 admitted=0 failing=0 clean=false` — entry absent at freeze, as C1's `before` states |
| `node scripts/check-selfassessment.mjs --rev 9505a10… --json` | 1 | `mismatches=9 couldNotEvaluate=103 superseded=20 clean=false`; counted = `SKILL.md:1614 25→26`, `:2479 13→30`, `:2514 5→10`, `:2515 17→30`, `:2529 7→10`, `:2530 20→30`, `:2543 20→29`, `:2544 7→10`, `corpus/README.md:613 17→30` — exactly C2's nine lines |

This is the "instrument can still fail" evidence for wave 2: the same commands at the tip must move to `admitted>=10`
/ `mismatches=0` while the 28 green rows above stay green.

## Anomalies, scope, and risks

- **One non-zero exit, my error, corrected:** I first ran the historical claim-record gate with `--selftest`; it accepts
  only `--self-test` and refused with `could_not_evaluate claim=- detail=bad_arguments` (exit 2, no state written).
  Rerun with `--self-test` → exit 0, `cases=9/9`. Both invocations are in `raw/selftest/exit.tsv` and the raw outputs.
  Lesson for wave 2: take each gate's flag spelling from its own registry row — a uniform spelling manufactures a fake red.
- **Observation (not a no-harm failure, pre-existing at baseline):** `check-gate-registry` proves *registry conformance*
  (`nonconformant=0`) without executing any advertised self-test, and `check-gate-mutants --selftest` exercises its own
  fixtures rather than the 21 gates. So "every gate's self-test is green" is evidenced here by direct execution, not by
  any single gate; no gate currently aggregates the 21 self-test verdicts.
- **Unrun, therefore not passed:** no `--live` flag on any gate (C1/C2 live variants belong to their seats), no
  `check-gate-mutants` production mode over the real gate set, no release-pin fetch, no census repair, no build/lint/test
  of the lane. The two wave-local historical gates were executed only through their committed `--selftest` paths.
- **Column meaning:** these rows measure presence/exit/claimed-field, green-at-freeze. They do not judge the quality of
  C1's future table or C2's corrections; they pin the state wave 2 must not disturb.
- **Lane hygiene:** the lane checkout `/home/vgpnk/Projects/shokunin/tabi-shokunin` was read only (no tracked file, index,
  jj state or sibling repo touched); every script ran inside `$S/clone`; scratch is under `$HYAKU_SCRATCH/tabi-r31/ExecNoHarmBaseline`
  and is disposable. No `agent://all` message sent; no subagent dispatched.

## Files delivered (output dir `.ufo/waves/round-31/w1/ExecNoHarmBaseline/`)

- `noharm-at-freeze.tsv` — 34 rows × 4 columns (`gate`, `command`, `exit`, `reading`): 7 no-harm rows, 21 self-test rows, 4 state rows, 2 labelled reference-before rows.
- `raw/claims-form/{registry,release-pins,s106,frontier,sources}.out|.err` — claims-form text outputs (exit codes in the table above).
- `raw/{registry,release-pins,s106,frontier}.json`, `raw/sources.txt`, `raw/census.txt` — `--json`/text captures.
- `raw/selftest/<gate>.out|.err` (21 gates, plus the wrong-flag attempt) and `raw/selftest/exit.tsv` — per-gate exit codes and elapsed times.
- `raw/before/{c1-decision-table,c2-selfassessment}.json` — freeze-time before readings of the two claim counters.
- `selftest-runner.sh` — the exact batch script used (gate list, per-gate flag spelling, `TMPDIR`), verbatim.

Each `reading` cell was re-checked with `grep -qF <reading-token> <raw file>` against the file it cites (one check per
row; all matched), and the TSV shape was checked with `awk -F'\t' 'NF!=4'` → 0 bad rows, 34 data rows.
