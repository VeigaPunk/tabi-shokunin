# ExecNoHarmBaseline — no-harm baseline matrix (round 30, w1, milestone noharm)

Seat: `ExecNoHarmBaseline` (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(read-only; every measurement ran in one scratch `git clone --shared`).
Baseline measured: `061e62024c0523d3c6c7e819506a773ff2cd7d75` (branch master, clean worktree).

## Verdict

The lane is measurable end-to-end at `061e620`: all **17 scripts that carry a self-test flag exit 0 and
report a clean tally**, all **16 registry gate scripts have a runnable production mode** and each returns
its designed exit class, and the two claim counters reproduce the frozen `before` readings exactly —
`check-gate-mutants` `fault_total=27 / fault_survivors=14 / benign_total=13 / benign_killed=0` (exit 1,
the 14 survivor ids identical to `claims.json` `C1.before`), `check-frontier-admission` `population=0 /
admitted=0` offline *and* with `--live` (exit 1). Eight of the 47 rows are red — six distinct subjects, at this revision **by
design or by historical debt** (aria check red→clean witness arm, round-15/16 measurement-binding
manifests, the user round-contract pstack byte drift, the round-29 evidence audit, and the two claim
counters); none of those reds is a self-test. Nothing in the matrix is "green only because it was not
run": 47 commands were executed, each with its exit code and tally captured from its own stdout/stderr
(`matrix.tsv`, `raw/`). The comparison rule for wave 2 is therefore unambiguous: **every row that is
exit 0 here must still be exit 0 at the landed tip, and rows 24/38 and 25 are the only rows allowed to
flip red→green (they are the C2 and C1 targets); every other red must keep its exit class and finding
set.** No gate, no self-test, no fixture and no lane byte was modified by this seat.

## 1. Method and scope

```
S=/fast/scratch/hyaku/tabi-r30/ExecNoHarmBaseline
mkdir -p "$S/tmp" "$S/work"
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone" rev-parse HEAD      # 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone" status --porcelain | wc -l   # 0
node --version                        # v24.21.0
```

Every command ran with `cwd=$S/clone`, `TMPDIR=$S/tmp`, `TZ=UTC`, `timeout 900`, through
`run-matrix.sh` (kept in this directory); stdout/stderr per row are in `raw/`. `matrix-raw.tsv` is the
mechanical capture (exit code + first matching summary tokens); `matrix.tsv` is the curated table
regenerated from those raw files by `summarize.mjs` — no tally in it is typed from memory.

Scope boundary is the registry's own gate set, not my reading of it: `check-gate-registry.mjs --rev
061e620` derives **20 gates** (15 `scripts/check-*.mjs` + `scripts/round-evidence-audit.mjs` + 4
historical `.ufo/waves/round-{12,21,22}/…` gate scripts named in registry rows) from `rows=34` and
reports `nonconformant=0`. All 20 were exercised; `freshness-witness.mjs` (probe),
`report-contract.mjs` (utility) and `sources-census.sh` were exercised additionally, and
`selftest-measurement-binding.mjs` is covered inside `check-measurement-binding.mjs --self-test`.

Frozen-counter identity was verified before measuring, against `claims.json.frozenDigests`:

```
sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json scripts/check-frontier-admission.mjs
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  scripts/check-frontier-admission.mjs
```
All three match. Per-script digests for every gate at the baseline are in `scripts-sha256-baseline.txt`
(use it to tell a genuine behaviour change from a byte change when the tip is compared).

## 2. Self-tests (17 scripts carrying a self-test flag) — all exit 0

| # | script | flag | exit | tally |
|---|---|---|---|---|
| 1 | check-adjacency.mjs | `--self-test` | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` |
| 2 | check-aria-metadata.mjs | `--self-test` | 0 | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` |
| 3 | check-bfcache-receipt.mjs | `--selftest` | 0 | `cases=17 passed=17` |
| 4 | check-freshness.mjs | `--self-test` | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| 5 | check-frontier-admission.mjs | `--selftest` | 0 | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` |
| 6 | check-gate-mutants.mjs | `--selftest` | 0 | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` |
| 7 | check-gate-registry.mjs | `--selftest` | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` |
| 8 | check-measurement-binding.mjs | `--self-test` | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` |
| 9 | check-release-pins.mjs | `--selftest` | 0 | `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20` |
| 10 | check-round-contract.mjs | `--self-test` | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38` |
| 11 | check-s106-evidence.mjs | `--selftest` | 0 | `S106_SELFTEST verdict=clean cases=7 passed=7` |
| 12 | check-selfassessment.mjs | `--selftest` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22` |
| 13 | check-source-reopen-receipt.mjs | `--selftest` | 0 | `cases=18 passed=18` |
| 14 | check-sources.mjs | `--self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| 15 | check-user-round-contract.mjs | `--self-test` | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` |
| 16 | freshness-witness.mjs | `--self-test` | 0 | `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0` |
| 17 | round-evidence-audit.mjs | `--selftest` | 0 | `cases=13 passed=13` |

C1 touches rows 11 and 9: their self-tests are clean at **7/7** and **20/20**. Adding cases is allowed
by the claim; the two counts are the numbers `check-selfassessment` has to keep consistent (§4).

## 3. Production modes (exit codes and tallies)

| # | gate | command (from `$S/clone`) | exit | reading |
|---|---|---|---|---|
| 18 | check-adjacency | `--repo <clone> --at 061e620 --fleet /home/vgpnk/Projects/shokunin --json` | 0 | `verdict=clean rows=10 verified=10 findings=0` |
| 19 | check-aria-metadata | bare (`check` mode) | **1** | `verdict=red findings=18 failed=1 accepted=false reason=semantic_invalid` |
| 20 | check-aria-metadata | `--witness` | 0 | `verdict=clean transition=red->clean red_exit=1 red_finding=R14-ARIA-CLEANUP-LISTENING-AFTER-01 green_exit=0 accepted=true original_unchanged=true` |
| 21 | check-bfcache-receipt | `--repo <clone> --rev 061e620 --json` | 0 | `valid=true restores=1 findings=0 clean=true` |
| 22 | check-freshness | `--witness 061e620 --repo <clone>` | 0 | `FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3` |
| 23 | check-freshness | `--worktree --repo <clone>` | 0 | `FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree` |
| 24 | check-frontier-admission | `--repo <clone> --rev 061e620 --frontier rate-tos-signal --since 2026-10-26 --json` | **1** | `population=0 admitted=0 failing=0 live=false clean=false` |
| 25 | check-gate-mutants | `--repo <clone> --rev 061e620 --work $S/work --json` | **1** | `fault_total=27 fault_survivors=14 benign_total=13 benign_killed=0 clean=false` |
| 26 | check-gate-registry | `--repo <clone> --rev 061e620 --json` | 0 | `rows=34 gates=20 nonconformant=0 findings=0 clean=true` |
| 27 | check-measurement-binding | `--repo <clone> --check corpus/evidence/round-16/measurement-binding.json --reproduce --json` | **1** | `verdict=failed claims=2 bound=0 findings=2 (counted_input_changed ×2)` |
| 28 | check-measurement-binding | `--repo <clone> --legacy corpus/evidence/round-15/measurements.json --at 061e620 --json` | **1** | `verdict=failed claims=2 bound=0 findings=5 (counted_inputs_undeclared ×2, counter_changed_since_measurement, counter_digest_unrecorded, counter_digest_mismatch)` |
| 29 | check-release-pins | `--repo <clone> --rev 061e620 --stable 156.0.8078.47 --json` | 0 | `population=23 resolved=23 unresolved=0 holds=16 drifted=7 clean=true` |
| 30 | check-round-contract | bare | 0 | `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` |
| 31 | check-s106-evidence | `--repo <clone> --rev 061e620 --json` | 0 | `valid=true sha_match=true anchor_located=true anchor_occurrences=1 decoded_bytes=73952` |
| 32 | check-selfassessment | `--repo <clone> --rev 061e620 --json` | 0 | `clean=true mismatches=0` (123 counted tally rows, 12 superseded) |
| 33 | check-source-reopen-receipt | `--repo <clone> --rev 061e620 --json` | 0 | `reopened=6 resolved=6 unresolved=0 clean=true` |
| 34 | check-sources | `--root <clone> --file corpus/SOURCES.md` | 0 | `SOURCES_GATE verdict=clean rows=115 tiers=A:100,B:6,C:9 status=queued:19,mined:87,rejected:9 findings=0` |
| 35 | check-user-round-contract | bare | **1** | `verdict=failed finding=history_rewritten detail=Pstack bytes changed: A corpus/lessons/round-18.md` |
| 36 | freshness-witness | `--rev 061e620` | 0 | `FRESHNESS_GATE verdict=clean matched=34 unique=34` (runs `check-freshness --witness` as child) |
| 37 | round-evidence-audit | `--rev 061e620 --round 29 --round-cap 24 --json` | **1** | `clean=false classes=6 findings=11 (c2-wave-caps:1, c3-gate-spotcheck:1, c6-landed-log-binding:9)` |
| 38 | check-frontier-admission | as row 24 **plus `--live`** | **1** | `population=0 admitted=0 failing=0 live=true clean=false` |
| 39 | report-contract | `report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md` | 0 | `PASS — 6/6 sections in order; SHONEN 4/4 boxes` |
| 40 | sources-census.sh | `validate --root /home/vgpnk/Projects/shokunin tabi` | 0 | `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` (18 W04 warnings) |
| 47 | sources-census.sh | `validate --file $S/clone/corpus/SOURCES.md` | 0 | `file ok`; 18 W04 warnings |

Rows 19/20 are one gate, two arms: the check arm is red *by construction* (it is the red side of a
red→clean witness). Read them together, never as harm.

### 3a. Historical wave-embedded gates in the registry gate set (extra rows)

| # | script | mode | exit | tally |
|---|---|---|---|---|
| 41 | `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` | `--self-test` | 0 | `CLAIM_SELFTEST verdict=clean cases=9/9` |
| 42 | `.ufo/waves/round-21/measure-c1.mjs` | `--selftest` | 0 | `verdict=clean cases=83 passed=83` |
| 43 | `.ufo/waves/round-22/check-review-chronology.mjs` | `--selftest` | 0 | `cases=17 failed_cases=0` |
| 44 | `.ufo/waves/round-22/measure-c1.mjs` | `--selftest` | 0 | `verdict=clean cases=45 passed=45` |
| 45 | `.ufo/waves/round-21/measure-c1.mjs` | `061e620` | 0 | `verdict=clean findings=0 c1_lifecycle_observations=12` |
| 46 | `.ufo/waves/round-22/measure-c1.mjs` | `061e620` | 0 | `verdict=clean findings=[] sequence={invocation:11,preAction:13,action:14,response:12,postAction:16}` |

`check-review-chronology` has no revision mode (it takes a local input JSON); `check-claim-record`'s
production subject is the round-12 expected file, so only their self-tests are revision-independent.

## 4. The two claim counters — baseline matches the frozen `before` byte-for-byte

C1 (`row 25`): `fault_total=27, fault_survivors=14, benign_total=13, benign_killed=0`, exit 1. The
survivor id set is exactly `claims.json` `C1.before`:
`s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop,
s106-byte-count-true, pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent,
pins-f4-range-bounds, pins-f4-anchor-token, pins-s1-supersession-prefix, pins-s1-supersession-tag,
pins-notfound-status, pins-notfound-body` — 5 in `check-s106-evidence.mjs`, 9 in
`check-release-pins.mjs`. The counter also reports `counter_sha256_at_rev = counter_sha256_running =
02945f88…` and `catalogue_sha256 = cd1c27a2…`, i.e. the frozen bytes are what executed.

C2 (`rows 24, 38`): `population=0 admitted=0`, exit 1, offline and `--live` alike. The `--live` run
produced a 0-byte stderr and `entries: []`; `fetchLive` is called only inside the per-entry loop
(`scripts/check-frontier-admission.mjs:221`), so at population 0 no URL was fetched and no fetch
receipt exists to record. **No network request was made by this seat.**

`check-selfassessment` baseline (row 32) is the constraint C1 must not break: `clean=true,
mismatches=0` over 123 counted tally rows (12 superseded). Observed self-test counts recorded at
baseline (`selfassessment-observed-baseline.txt`): s106 **7**, release-pins **20**, selfassessment 22,
freshness 12, sources 26, adjacency 57, measurement-binding 76, round-contract 38, user-round-contract
45, source-reopen 18, round-evidence-audit 13. Any added case in the two C1 gates moves the observed
number, so the same-document restatement must land with it or row 32 goes red.

## 5. What wave 2 must compare (the contract this matrix hands over)

Green at `061e620` → must stay green at the landed tip (exit 0, same tally shape):
rows **1–18, 20, 21, 22, 23, 26, 29, 30, 31, 32, 33, 34, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47**.

Allowed to flip red→green (they are the claim targets, and only they):
- row **25** → `fault_survivors=0` **and** `benign_killed=0` (C1 target; exit 0).
- rows **24/38** → `population=2 admitted=2` (C2 target; exit 0, `--live` included).

Pre-existing reds that must not worsen (same exit class, same finding ids):
- row **19** `check-aria-metadata` check arm — red is the designed side of row 20's witness.
- rows **27/28** measurement-binding on the round-15/round-16 manifests — historical debt, unchanged.
- row **35** user round-contract `history_rewritten` on `corpus/lessons/round-18.md` — historical.
- row **37** round-evidence-audit at round 29 (`c2-wave-caps:1, c3-gate-spotcheck:1,
  c6-landed-log-binding:9`).

Two comparison traps worth flagging now:
1. Row 37's subject is revision-independent but **round-dependent**: `--round 29` reads the round-29
   lesson and the fleet report at `/home/vgpnk/Projects/shokunin/.ufo/reports/round-29/tabi.md`.
   Re-running with `--round 30` at the tip measures a different subject, so compare like with like:
   `--round 29` for the no-harm diff, `--round 30` only as a new reading.
2. Row 39 (report-contract) has **no lane subject at the baseline**: no `.ufo/reports/round-<N>/tabi.md`
   exists inside the lane (only `.ufo/reports/fleet-round-1-attempt-20261015/tabi.md`, which the utility
   refuses on path, exit 1). The PASS above is the fleet-level round-29 report, read-only. If round 30
   lands a lane-side report, row 39 gains a new subject and must be re-read, not diffed.

## 6. Files written by this seat

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ExecNoHarmBaseline/`:

| file | content |
|---|---|
| `matrix.tsv` | the 47-row matrix (row, seat, rev, script, mode, exit, tally, command) |
| `matrix-raw.tsv` | mechanical capture before curation |
| `run-matrix.sh` | the harness that produced `raw/` |
| `summarize.mjs` | regenerates `matrix.tsv` from `raw/` |
| `raw/` | per-row stdout/stderr (94 files: 47 rows × 2), including `38-…-live`, `39-…`, `40-…`, `41–46-…`, `census-validate-file.*` |
| `scripts-sha256-baseline.txt` | sha256 of every gate/utility script at `061e620` |
| `selfassessment-observed-baseline.txt` | per-script observed self-test counts from row 32 |
| `ExecNoHarmBaseline.md` (this report) | at `.ufo/waves/round-30/w1/ExecNoHarmBaseline.md` |

No patch file: this seat proposed **no lane change** (assignment is measurement only). No lane tracked
file, index, jj state, fleet repo, sibling repo or `/home/vgpnk/Projects/shokuknow` was written.

## 7. Risks, limits, blockers

- **Nothing blocked.** Every assigned command ran to completion; no timeout fired (slowest row: 25,
  ≈15 s; full matrix 64.75 s).
- Row 22/23/36 read the lane's three allowlisted public files under `/home/vgpnk/.kimi-code/...` via
  `check-freshness`; `matched=34 unique=34 lane=31 public=3` is identical in witness and worktree mode,
  so the baseline is not dependent on my clone's worktree state.
- Row 18 needs `--fleet /home/vgpnk/Projects/shokunin`; with the default it resolves sibling refs
  against the scratch parent and reports `ruling_unresolved`/`sibling_unresolved`. The command string in
  `matrix.tsv` carries the flag — reuse it verbatim.
- Row 27's `--at` is the manifest's own declared revision (`38891ca0…`), not `061e620`; that is the
  gate's design, not a mistake. Its reds are `counted_input_changed` and are stable at both revisions
  per round-29's record.
- Tooling: **no installs, no upgrades** this wave (node v24.21.0 pre-existing; pacman guard untouched;
  nothing added to `~/.local/bin`).
- Row 40 (`sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`) reads the **live lane
  worktree**, not the clone; at measurement time the lane was dirty with other seats' in-flight edits
  (lane tip had already moved past `061e620`). It is kept because it is the `claims.json` noHarmCheck
  form, but the clean-baseline reading of the same file is row 47 (`--file $S/clone/corpus/SOURCES.md`).
  Compare row 47 for no-harm; read row 40 as "the lane's working registry still parses".
- Scratch `$S` (clone, `tmp/`, `work/`) is left in place for the wave; receipts are already copied into
  this output directory, so `$S` can be removed by the wave cleanup without losing evidence.
