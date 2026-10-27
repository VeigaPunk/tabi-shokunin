# ExecSelftest — instrument self-test receipt (tabi round 37, wave w1)

seat: `ExecSelftest` · role: executor · milestone: instruments · axis: operability
lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
freeze commit: `99437d29de036415a9f2d0524343617a3b19988a`
baseline commit: `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
node: `v24.21.0` · date: 2026-10-27

Scope: the five instrument self-test legs assigned to this seat, executed **from committed
bytes only** (a clean `git clone --shared` of the lane checked out at the freeze commit;
the live lane worktree was read but never written). No lane file, sibling repo, fleet-root
file or git/jj state was mutated.

Evidence files (seat dir):

| file | what |
|---|---|
| `.ufo/waves/round-37/w1/ExecSelftest/selftest.txt` | the full receipt: every command, its exit code, and the key output line |
| `.ufo/waves/round-37/w1/ExecSelftest/run-selftest.sh` | the driver that regenerates `selftest.txt` verbatim (read-only against the lane) |

---

## 1 — frozenDigests: five of five match

Each digest was computed from **committed bytes** via
`git -C <lane> show 99437d29de036415a9f2d0524343617a3b19988a:<path> | sha256sum`,
and compared against `.frozenDigests` read out of the committed `claims.json` at the same
commit.

| key | path | expected | observed | match |
|---|---|---|---|---|
| `c1` | `.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs` | `9c6289b7…752c` | `9c6289b7…752c` | ✅ |
| `c2` | `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` | `eda339eb…e019` | `eda339eb…e019` | ✅ |
| `buildTool` | `.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs` | `a85152cd…9a96` | `a85152cd…9a96` | ✅ |
| `measure` | `.ufo/waves/round-37/measure.sh` | `9f89697c…3302` | `9f89697c…3302` | ✅ |
| `controls` | `.ufo/waves/round-37/baseline/run-controls.sh` | `3a08367f…d4f25e` | `3a08367f…d4f25e` | ✅ |

`ALL_FIVE_MATCH=true`. The same five digests were also recomputed over the **live worktree**
copies of the paths and are identical, so the freeze commit and the working tree carry the
same bytes for every frozen instrument. `git diff --stat 99437d29 HEAD -- scripts` is empty:
no lane gate script changed between the freeze and HEAD.

## 2 — `node --check` on both counters and the build tool

Run inside the clean clone at the freeze commit.

```
node --check .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs      :: exit=0 :: <no output>
node --check .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs          :: exit=0 :: <no output>
node --check .ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs     :: exit=0 :: <no output>
```

All three parse. The build tool is additionally **runnable end-to-end** (section 6 below) —
its v2 repair (resolve every `PINS` entry, refuse on unresolvable revision) is live, not
inert: the run exits 0 after resolving all 16 sibling pins.

## 3 — v5 list modes: 383 / 307 / 0

```
node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --list-candidates --repo <lane> --fleet /home/vgpnk/Projects/shokunin | wc -l   → 383  (exit 0)
node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --list-drift       --repo <lane> --fleet /home/vgpnk/Projects/shokunin | wc -l   → 307  (exit 0)
node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --list-delta       --repo <lane> --fleet /home/vgpnk/Projects/shokunin | wc -l   →    0  (exit 0)
```

All three match the assigned expectations (383 / 307 / 0), stderr empty in every case.
Re-run with `--repo` pointing at the freeze clone instead of the live lane: identical
counts (383 / 307 / 0), so the numbers are not an artifact of worktree state.

## 4 — every `scripts/check-*.mjs` exposing `--self-test` exits 0

Loop replicated exactly as `measure.sh` does it (flag discovered by
`grep -oE -- '--self-?test'`; the loop body includes `scripts/round-evidence-audit.mjs`).

**17** of the 17 `scripts/check-*.mjs` files expose a self-test flag; **all 17 exit 0**.
With `scripts/round-evidence-audit.mjs` added, the measure.sh loop covers **18** scripts,
**18 exit 0, 0 nonzero**.

| script | flag | exit | key output line |
|---|---|---|---|
| `scripts/check-adjacency.mjs` | `--self-test` | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` |
| `scripts/check-aria-metadata.mjs` | `--self-test` | 0 | `ARIA_METADATA_JSON {"schema":"tabi-aria-metadata-selftest-v1","ok":true,"exit":0,…}` |
| `scripts/check-bfcache-receipt.mjs` | `--selftest` | 0 | `{"schema":"tabi-bfcache-selftest-v1","cases":17,"passed":17,…}` |
| `scripts/check-bidi-runtime.mjs` | `--selftest` | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` |
| `scripts/check-decision-table.mjs` | `--selftest` | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` |
| `scripts/check-freshness.mjs` | `--self-test` | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| `scripts/check-frontier-admission.mjs` | `--selftest` | 0 | `FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24` |
| `scripts/check-gate-mutants.mjs` | `--selftest` | 0 | `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` |
| `scripts/check-gate-registry.mjs` | `--selftest` | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` |
| `scripts/check-measurement-binding.mjs` | `--self-test` | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` |
| `scripts/check-release-pins.mjs` | `--selftest` | 0 | `RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29` |
| `scripts/check-round-contract.mjs` | `--self-test` | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` |
| `scripts/check-s106-evidence.mjs` | `--selftest` | 0 | `S106_SELFTEST verdict=clean cases=10 passed=10` |
| `scripts/check-selfassessment.mjs` | `--selftest` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` |
| `scripts/check-source-reopen-receipt.mjs` | `--selftest` | 0 | `{"schema":"tabi-source-reopen-selftest-v1","cases":18,"passed":18,…}` |
| `scripts/check-sources.mjs` | `--self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| `scripts/check-user-round-contract.mjs` | `--self-test` | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 …` |
| `scripts/round-evidence-audit.mjs` | `--selftest` | 0 | `"cases": 13` |

Every tally line reports `verdict=clean` (or `"ok":true` / `passed == cases` for the JSON
emitters). No self-test regressed relative to the round-36 closure's 18/18.

## 5 — `check-selfassessment --rev ed8ccfc00ad3784bc424aa118e056f8edf4ee803`

```
node scripts/check-selfassessment.mjs --rev ed8ccfc00ad3784bc424aa118e056f8edf4ee803
```

**Authoritative reading — clean clone at the freeze commit (worktree porcelain = 0):**

```
SELFASSESSMENT verdict=clean rev=ed8ccfc00ad3784bc424aa118e056f8edf4ee803 mismatches=0 could_not_evaluate=116 superseded=48
exit=0
```

`counted: []`, `mismatches: 0`, `clean: true`. **A second clean clone checked out at the
live lane HEAD (`f76da094…`) reproduces the identical line and exit 0** — so the zero is a
property of the committed revision, not of the freeze commit alone.

**Deviation observed, and its cause (reported, not a claim failure):** running the same
command against the **live lane worktree** returns `verdict=failed … mismatches=1`, exit 1.
The single counted finding is

```json
{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,"claimed":"landed","observed":81}
```

`m3-unlanded-paths` is defined (`scripts/check-selfassessment.mjs:414-423`) as: the newest
`## Round N — executed disposition` block in `SCORECARD.md` asserts landed work whose
evidence pointers are committed bytes, so a **non-empty `git status --porcelain
--untracked-files=all` in the lane contradicts that assertion**. The lane worktree
currently carries 81 untracked paths — this wave's own in-flight seat artifacts
(`.ufo/waves/round-37/w1/*/report.md`, `w1.ready.dispatched`, `L1-notes/`, etc.) written
by concurrent seats after the freeze commit, plus `.ufo/waves/round-37/w1/` itself.

Diagnosis, by construction: `m3Findings` reads the **worktree** porcelain, not the tree at
`--rev`; with an empty porcelain the class returns `[]` and cannot be counted. The clean
clone (identical revision, empty porcelain) yields `mismatches=0`. The number `observed`
tracks the sibling wave's artifact count live (16 → 71 → 81 across my three runs), which
confirms the mechanism. This is **wave-in-flight dirt, not a defect in the frozen
instruments**, and it is not part of C1's or C2's predicate.

The assigned leg's expectation — `mismatches 0` — is met on committed bytes. The
measurementRule ("every after-measurement runs `measure.sh <REV> <OUT> <FREEZE>` in a
clean clone") already confines measurement to clean clones, and `measure.sh` itself runs
`check-selfassessment` inside the clone (`cd "$d" && node scripts/check-selfassessment.mjs
--rev HEAD --json`), so the harness is not exposed to this.

## 6 — supplementary: build tool v2 and the honest-state predicate

Not assigned, but cheap and directly operability-relevant, so recorded:

```
node .ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs --repo <clone> --fleet /home/vgpnk/Projects/shokunin --out <scratch>
exit=0
drift-audit: 307 rows (304 unchanged, 3 moved, 0 stale) -> <scratch>/drift.tsv
```

The regenerated ledger is **byte-identical** to the committed
`corpus/adjacency-screen-drift.tsv` at the freeze commit (`diff` empty; 308 lines = header
+ 307 rows). The v2 build tool therefore reproduces the committed ledger exactly, and its
`PINS` resolution loop (the round-36 routed defect 2 repair — the 39-hex kama pin) resolves
every sibling pin without refusing.

```
node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev f76da094f0ff0ad9856d2232858241e3f7841379 --repo <lane> --fleet /home/vgpnk/Projects/shokunin
exit=0
C1_ADJACENCY_SWEEP_V5 predicate=met rev=f76da094… adjacency=clean completeness.unaccounted=0 drift.total=307 drift.auditCoverage=307 drift.auditFindings=0 drift.staleFindings=0 delta.total=0 delta.unaccounted=0 delta.screenFindings=0 newMapped=0
```

The v5 counter is operational against the honest state and reports its predicate met at the
lane's current HEAD.

---

## Tooling

No tools were installed or upgraded: every check uses the host's existing `node v24.21.0`,
`git` and `coreutils`. No `pacman` transaction was run (host-wide pacman guard). No new
dependency was introduced.

## Scratch and write discipline

- Scratch root `/fast/scratch/hyaku/tabi-r37/w1/ExecSelftest/` was created by this seat;
  `TMPDIR` was passed explicitly as `…/ExecSelftest/tmp` for every invocation, and the
  clone (`…/lane`, `…/head`) lives only there. The temp subtree is removed by the driver's
  own `trap`; the scratch root is deleted before this report is finalised.
- Fixture clone assertion honoured: `git -C "$S/lane" rev-parse --show-toplevel` printed
  the fixture dir before any use, and no commit was made in it (`git clone --shared` +
  `checkout --detach` only).
- Files written: only `.ufo/waves/round-37/w1/ExecSelftest/{selftest.txt,run-selftest.sh,report.md}`
  and this seat's report at `.ufo/waves/round-37/w1/ExecSelftest.md`.
- The lane worktree's `git status --porcelain` was captured before and after and is
  unchanged by this seat's actions; no sibling repo (`*-shokunin`) shows any porcelain
  change; no fleet-root tracked file was written. All git calls were read-only
  (`show`, `rev-parse`, `status`, `diff`, `log`, `clone`, `checkout --detach`).

## Risks and blockers

- **None blocking.** The one deviation (live-worktree `mismatches=1`) is explained and
  falsified as a revision-level defect by the clean-clone control above.
- **Latent risk, not observed here:** because `m3-unlanded-paths` reads the *worktree*
  porcelain, any `check-selfassessment` invocation made from the dirty lane worktree during
  an active wave will report `mismatches ≥ 1` regardless of the instruments' health. The
  round-37 harness runs it in a clean clone, so the measurement is unaffected; a reader
  re-running the leg by hand from the live worktree would see the false-positive and should
  be told to re-run in a clean clone. *(Reported as an advisory; no lane file was amended.)*

## Verdicts

| leg | expectation | observed | verdict |
|---|---|---|---|
| 1 frozenDigests | 5/5 match | 5/5 match | ✅ |
| 2 `node --check` | both counters + build tool parse | 3/3 exit 0 | ✅ |
| 3 v5 list modes | 383 / 307 / 0 | 383 / 307 / 0 | ✅ |
| 4 self-test loop | every exposed `--self-test` exits 0 | 17/17 `check-*.mjs`; 18/18 in the measure.sh loop; 0 nonzero | ✅ |
| 5 `check-selfassessment --rev ed8ccfc0…` | mismatches 0 | mismatches 0, exit 0 (clean clone at freeze **and** at HEAD); live dirty worktree gives 1 via `m3-unlanded-paths`, wave dirt only | ✅ (deviation diagnosed) |
| 6 build tool v2 (supplementary) | operational, reproduces the committed ledger | exit 0, 307 rows, byte-identical to the committed ledger | ✅ |
| 7 v5 honest-state predicate (supplementary) | predicate met | `predicate=met`, exit 0 at lane HEAD | ✅ |

The frozen instruments of round 37 are parse-clean, digest-bound, list-mode-consistent with
the assigned counts, self-test-clean across all 18 measured scripts, and the round's
self-assessment leg measures 0 mismatches on committed bytes.

VERDICT ok — all five assigned legs pass on committed bytes: frozenDigests 5/5 match,
`node --check` 3/3 exit 0, v5 list modes 383/307/0, 17/17 `check-*.mjs` self-tests (18/18 in
the measure.sh loop) exit 0, and `check-selfassessment --rev ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
reports `mismatches=0` / exit 0 in a clean clone; the lone live-worktree `mismatches=1` is
`m3-unlanded-paths` firing on this wave's own concurrent untracked seat artifacts and is
reproduced as 0 at the same revision in a clean clone (see §5).
