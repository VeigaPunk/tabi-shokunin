# ExecNoHarm — no-harm sweep (attacks "no axis harmed")

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; measured only in scratch clones).
- Baseline: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`
- Tip as assigned: `32008a453737a27f69e9ab401d0b9775d2a944f7`
- Current lane master (extra): `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (wave-1 evidence commit; `git diff --stat 32008a4..e1e3a15 -- scripts/` is empty, so the script surface is identical; the full matrix was re-run there anyway).
- Claims read first: `.ufo/waves/round-29/claims.json` (C1/C2/C3, controls, kill rules).
- Milestone: no-harm. Attack seat: findings only, no production repair.
- Tooling: **no installs**. `node v24.21.0` pre-existing. No pacman/uv/npx invocation, nothing added to `~/.local/bin`.

## 1. Method

Scratch root `S=/fast/scratch/hyaku/tabi-r29/ExecNoHarm` (created with `mkdir -p`, `TMPDIR="$S"` on every run, temp trees removed by the harness).

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/{base,tip,newtip}"
git -C "$S/<name>" checkout -q <rev>
```

Each clone verified before measurement: `git -C "$S/<name>" rev-parse HEAD` = requested rev and `git status --porcelain | wc -l` = 0 for all three.

Harnesses (copied verbatim into the output dir):
`receipts/run-selftests.sh` (15 self-test scripts × 3 revisions, `timeout 600` each, cwd = clone root, stdout/stderr/exit captured per script), `receipts/run-gates.sh` (revision-taking and production gates at each revision), `receipts/run-more.sh` (remaining no-arg gates).

One live clone per revision, never in the lane. Lane git use was read-only (`log`, `diff`, `show`, `rev-parse`, `cat-file`); `--fleet` reads of `/home/vgpnk/Projects/shokunin` were read-only git.

## 2. Table A — every script with a self-test flag (15)

Flag set = union of `--selftest` and `--self-test` (`grep -ciE "self.?test"` over `scripts/*.mjs`, 28 files). 15 scripts carry a self-test mode. The 12 scripts with no self-test mode at all (`pstack-aggregate`, `pstack-seat`, `user-aggregate`, `user-seat`, `report-contract`, `aria-loopback-round13`, `webmcp-invoke-round17/18/19`, `webmcp-loopback-round16`, `webmcp-lifecycle-round21`, `webmcp-validation-round19`) were exercised bare instead (§5); `selftest-measurement-binding.mjs` is a child CLI with no flag of its own and is covered inside `check-measurement-binding --self-test` and inside the `--legacy` gate (§8.2).

| script | flag | baseline `856fa9e` | tip `32008a4` | newtip `e1e3a15` |
|---|---|---|---|---|
| check-adjacency.mjs | `--self-test` | exit 0 — `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | exit 0 — same | exit 0 — same |
| check-aria-metadata.mjs | `--self-test` | exit 0 — `ok=true cases=36` (all case `ok:true`) | exit 0 — same | exit 0 — same |
| check-bfcache-receipt.mjs | `--selftest` | exit 0 — `cases=17 passed=17` | exit 0 — same | exit 0 — same |
| check-freshness.mjs | `--self-test` | exit 0 — `FRESHNESS_SELFTEST verdict=clean cases=12` | exit 0 — same | exit 0 — same |
| check-gate-registry.mjs | `--selftest` | exit 0 — `verdict=clean cases=22 passed=22` | exit 0 — same | exit 0 — same |
| check-measurement-binding.mjs | `--self-test` | exit 0 — `verdict=clean cases=76 reasons=13` | exit 0 — same | exit 0 — same |
| check-release-pins.mjs | `--selftest` | **ABSENT** (script not committed at baseline) | exit 0 — `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20` | exit 0 — same |
| check-round-contract.mjs | `--self-test` | exit 0 — `verdict=clean cases=38 alias_checks=1` | exit 0 — same | exit 0 — same |
| check-s106-evidence.mjs | `--selftest` | **exit 1**, no tally: `ReferenceError: existsSync is not defined` at `scripts/check-s106-evidence.mjs:267` (stderr captured in `receipts/selftests/selftest-base.txt`) | exit 0 — `S106_SELFTEST verdict=clean cases=7 passed=7` | exit 0 — same |
| check-selfassessment.mjs | `--selftest` | exit 0 — `cases=20 passed=20` | exit 0 — `cases=22 passed=22` | exit 0 — same |
| check-source-reopen-receipt.mjs | `--selftest` | exit 0 — `cases=18 passed=18` | exit 0 — same | exit 0 — same |
| check-sources.mjs | `--self-test` | exit 0 — `SOURCES_SELFTEST verdict=clean cases=26` | exit 0 — same | exit 0 — same |
| check-user-round-contract.mjs | `--self-test` | exit 0 — `verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | exit 0 — same | exit 0 — same |
| freshness-witness.mjs | `--self-test` | exit 0 — `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0` | exit 0 — same | exit 0 — same |
| round-evidence-audit.mjs | `--selftest` | exit 0 — `cases=13 passed=13` | exit 0 — same | exit 0 — same |

No self-test went green → red. Two went red → green / grew: `check-s106-evidence` (crash → 7/7, the C1 repair) and `check-selfassessment` (20 → 22 cases).

Case-removal check: only three scripts changed bytes between baseline and tip (`git diff --name-status` = `A scripts/check-release-pins.mjs`, `M scripts/check-s106-evidence.mjs`, `M scripts/check-selfassessment.mjs`). The other twelve are byte-identical, so their self-tests are behaviorally identical, not merely equal-counted. For the two modified scripts the diff is purely additive on the case table: `check-selfassessment` adds `m1-scorecard-crossdoc-citation-not-superseded` and `m1-log-crossdoc-citation-not-superseded` and adds an explicit `fieldValue` guard (`case … declares field … without fieldValue` → throw) rather than loosening any assertion; `check-s106-evidence` replaces the inverted `out[c.field] === false` with an explicit per-case `fieldValue` (the clean case now asserts `revision_match === true`), imports `existsSync`, and adds the missing `d.commit()` in the mismatch case.

## 3. Table B — gates that take a revision (`--rev` / `--at` / `--witness REV`)

Run from inside each clone with `--rev`/`--at` = that clone's HEAD.

| gate | baseline | tip | newtip |
|---|---|---|---|
| `check-gate-registry.mjs --rev <rev> --json` | **exit 1**, `clean=false`, rows=29, findings `e2-field-incomplete` ×2 — SKILL latest rows for `check-s106-evidence` (line 2529) and `check-selfassessment` (line 2530) "missing: name, selftest" | exit 0, `clean=true`, rows=32 | exit 0, `clean=true`, rows=32 |
| `check-freshness.mjs --witness <rev>` | exit 0 — `FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3` | exit 0 — identical except `revision=` | exit 0 — identical |
| `freshness-witness.mjs --rev <rev>` | exit 0 — same tally | exit 0 — same tally | exit 0 — same tally |
| `check-bfcache-receipt.mjs --rev <rev>` | exit 0 — `valid=true clean=true findings=[]` | exit 0 — same | exit 0 — same |
| `check-s106-evidence.mjs --rev <rev>` | exit 0 — `valid=true` | exit 0 — `valid=true` | exit 0 — `valid=true` |
| `check-selfassessment.mjs --rev <rev>` | **exit 1**, `clean=false`, `mismatches=6` | exit 0, `clean=true`, `mismatches=0` | exit 0, `clean=true`, `mismatches=0` |
| `check-source-reopen-receipt.mjs --rev <rev>` | exit 0 — `clean=true unresolved=0` | exit 0 — same | exit 0 — same |
| `check-adjacency.mjs --repo <clone> --at <rev> --fleet /home/vgpnk/Projects/shokunin` | exit 0 — `verdict=clean rows=10 verified=10 findings=0` | exit 0 — same | exit 0 — same |
| `check-release-pins.mjs --rev <rev> --stable 156.0.8078.47` | script absent (`Cannot find module`) | exit 1 — `clean=false population=23 unresolved=23 holds=0 drifted=0` | exit 1 — same |
| `check-round-contract.mjs` bare | exit 0 — `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` | exit 0 — same | exit 0 — same |
| `check-user-round-contract.mjs` bare | exit 1 — `verdict=failed finding=history_rewritten detail=Pstack bytes changed: corpus/lessons/round-18.md` | exit 1 — **identical text** | exit 1 — identical |
| `check-aria-metadata.mjs` bare (`check` mode) | exit 1 — `semantic_invalid`, findings 17 pass / 1 fail | exit 1 — identical classification and finding set | exit 1 — identical |
| `check-aria-metadata.mjs --witness` (clean tree) | exit 0 — `ok=true reason=clean` | exit 0 — `ok=true reason=clean`; raw output byte-identical to baseline (`diff` empty) | exit 0 — same |
| `check-sources.mjs` bare | exit 0 — `rows=107 tiers=A:92,B:6,C:9 findings=0` | exit 0 — `rows=115 A:100,B:6,C:9 findings=0` | exit 0 — same as tip |
| `check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at <rev>` | exit 1 — `verdict=failed`, 5 findings (`counted_inputs_undeclared`, `counter_changed_since_measurement`, `counter_digest_unrecorded`, `counted_inputs_undeclared`, `counter_digest_mismatch`) | exit 1 — same 5, same reasons | exit 1 — same |
| `round-evidence-audit.mjs --rev <rev> --round 28 --round-cap 24` | exit 1 — `clean=false` classes `c2-wave-caps`, `c3-gate-spotcheck` | exit 1 — identical classes | exit 1 — identical |

Environment note (not a revision difference): the first adjacency run let `--fleet` default to the scratch parent, so all ten sibling/ruling refs resolved against a directory with no sibling repos; base and tip both reported the same 15 findings (`ruling_unresolved` ×5, `sibling_unresolved` ×10, `detail: ruling repo /fast/scratch/.../tabi-shokunin is absent or not a git toplevel`). Re-run with `--fleet /home/vgpnk/Projects/shokunin` it is clean 10/10 at all three revisions. Both raw runs are kept (`receipts/gates/*/adjacency*.out`).

## 4. Harm findings (green at baseline → red at tip)

**None.** Zero gates or self-tests are green at `856fa9e` and red at `32008a4` or `e1e3a15`. Every observed red at the tip is either (a) already red at the baseline with the same exit class and the same finding set, or (b) a gate whose script does not exist at the baseline.

Pre-existing reds carried unchanged (same exit class, same findings at baseline and tip):

1. `check-aria-metadata.mjs` check mode — exit 1, `semantic_invalid`, 18 findings (17 pass, 1 fail), identical both revisions.
2. `check-user-round-contract.mjs` — exit 1, `history_rewritten`, `Pstack bytes changed: corpus/lessons/round-18.md`, identical text both revisions.
3. `round-evidence-audit.mjs --round 28` — exit 1, classes `c2-wave-caps` and `c3-gate-spotcheck`, identical findings both revisions.
4. `check-measurement-binding.mjs --legacy round-15` — exit 1, same 5 findings/reasons both revisions.

## 5. Non-harm deltas observed (improvements, not harms)

- `check-s106-evidence.mjs --selftest`: exit 1 / `ReferenceError existsSync` at `:267` → exit 0 / `cases=7 passed=7`. The baseline crash is exactly the C1 defect; it is gone at the tip and the case list includes both required ids (`measured-revision-bytes-match`, `measured-revision-bytes-mismatch`).
- `check-selfassessment.mjs --rev`: `mismatches` 6 → 0. The six baseline mismatches are the claim's list and are individually traceable: `SCORECARD.md:410` (25→26), `:1138` (12→13), `:1139` (12→13), `:1151` (12→13), `:1439` (17→20), `LOG.md:221` (8→12). At the tip all six appear as `superseded:true`, and `SCORECARD.md:1438` moves from could-not-evaluate (claimed 5, observed null) to `superseded:true` 5→7. Arithmetic closes: 5 superseded + 7 newly cleared = 12 superseded, 116 + 4 new observed tallies = 120 findings, 0 unsuperseded mismatches.
- `check-gate-registry.mjs --rev`: red (2 × `e2-field-incomplete`) → green (rows 29→32). The round repaired a registry defect it did not claim in `claims.json`; that is extra operability, not a harm.
- `check-sources.mjs` bare stays clean while `corpus/SOURCES.md` grows 107 → 115 rows (9 inserted lines, 0 deleted), and `check-adjacency` stays clean 10/10 while `SOURCES.md` grew — new rows did not break the pointing gates.

## 6. Independent non-vacuity probe for the repaired C1 self-test

Copied the tip gate to `probe/s106-mutant.mjs` (a fixture outside any repo) and removed only the revision comparison (`const revisionMatch = true;`, 12-line diff kept in `receipts/probe/s106-mutant.diff`):

```
$ TMPDIR=$S timeout 600 node s106-mutant.mjs --selftest ; echo exit=$?
CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL
S106_SELFTEST verdict=failed cases=7 passed=6
exit=3
```

This is byte-for-byte the same verdict/case line as the round's committed receipt `corpus/evidence/round-29/s106-selftest/mutation.txt` (`… measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL` / `verdict=failed cases=7 passed=6` / `exit=3`), and the committed `mutation.diff` removes the same two lines. So the repaired self-test is not vacuous on the C1 predicate, and the committed mutation receipt is reproducible from the tip bytes by an independent seat.

## 7. Append-only check on the calibration docs

`git diff --numstat 856fa9e..32008a4` for the documents the round edits (`SCORECARD.md`, `LOG.md`, `SKILL.md` for C2's corrections and the gate rows, `corpus/SOURCES.md` for C3's new rows): `LOG.md 26/0`, `SCORECARD.md 10/0`, `SKILL.md 15/0`, `corpus/SOURCES.md 9/0`. Zero deleted lines — no previously written tally string was rewritten in place, so the corrections cannot have destroyed a line they did not supersede.

## 8. Risks / residual observations (reported, not repaired)

1. **Measurement-hygiene hazard (pre-existing, both revisions).** `node scripts/aria-loopback-round13.mjs` with no arguments writes a fresh `generatedAt` into the tracked file `corpus/evidence/round-13/aria/receipt.json` in the cwd repo *before* exiting 2 with a usage refusal. Script bytes are identical at baseline and tip (`git diff … -- scripts/aria-loopback-round13.mjs` = 0 bytes), so this is not a round-29 harm — but it inverts a gate: on the dirty tree `check-aria-metadata.mjs --witness` reports `exit 2 snapshot_tampered`, on the restored tree `exit 0 clean`. I hit this myself (my bare-gate sweep dirtied both clones; `git status --porcelain` showed exactly `M corpus/evidence/round-13/aria/receipt.json`), restored with `git -C "$S/<name>" checkout -- corpus/evidence/round-13/aria/receipt.json`, re-verified `porcelain=0` and identical receipt sha256 `b458b351…a1989b7` in both clones, and re-ran the witness clean — which is the result reported in Table B. Any wave-after measurement that runs this script bare and then asserts a clean checkout will fail for the wrong reason; restore before measuring.
2. **One residual could-not-evaluate at both revisions.** `LOG.md:972` claims `59` for `scripts/selftest-measurement-binding.mjs`, which has no self-test flag; the counter reports `observed: null` and correctly excludes it from `mismatches`. Unchanged by the round; it is why an independent recomputation of "claimed ≠ observed, unsuperseded, script known" gives 8 rows at baseline but the counter's declared 6, and 1 row at the tip (`LOG.md:972` only) with counter `mismatches=0`. The one-row residue is a class the counter declares as could-not-evaluate, not a hidden mismatch.
3. **C3 is still open at the assigned tip.** `check-release-pins` at `32008a4` reports `population=23 unresolved=23 holds=0 drifted=0`; the 23 release-pinned rows have no superseding row yet, so nothing at this tip detects a wrong 156-byte attachment. Not a regression (gate absent at baseline), but the freshness axis is unprotected until the C3 wave lands.
4. **Lane advanced past the assigned tip.** `e1e3a15` (wave-1 evidence) is current master. It changes no script (`git diff --stat 32008a4..e1e3a15 -- scripts/` empty) and the whole matrix was re-run at it: every self-test tally and every gate result matches `32008a4` except the `revision=` field. The no-harm conclusion therefore holds at the current master, not only at the assigned tip.

## 9. Receipts

```
receipts/summary.tsv                     machine-readable self-test table
receipts/selftests/selftest-{base,tip,newtip}.txt
receipts/gates/{base,tip,newtip}/<gate>.{out,err,exit}
receipts/gates/{base,tip,newtip}/adjacency-fleet.{out,exit}
receipts/gates/selftest-gates-{base,tip,newtip}.txt   (gate run logs)
receipts/more/{base,tip}/<gate>.out          (bare / no-arg gates)
receipts/probe/mutant-selftest.txt, receipts/probe/s106-mutant.diff
receipts/{run-selftests.sh,run-gates.sh,run-more.sh,extract.mjs,deep.mjs}
```

Commands actually run (all exit codes recorded in the `.exit` files above):

```
git clone --shared <lane> $S/{base,tip,newtip} && git -C … checkout <rev>
$S/run-selftests.sh {base,tip,newtip}
$S/run-gates.sh {base,tip,newtip}
$S/run-more.sh {base,tip}
cd $S/<name> && TMPDIR=$S node scripts/check-adjacency.mjs --repo $S/<name> --at <rev> --fleet /home/vgpnk/Projects/shokunin --json
cd $S/<name> && TMPDIR=$S node scripts/check-aria-metadata.mjs --witness     # after restoring the receipt
cd $S/probe && TMPDIR=$S node s106-mutant.mjs --selftest
git -C $S/tip diff --numstat 856fa9e..32008a4 -- LOG.md SCORECARD.md SKILL.md corpus/SOURCES.md
git -C $S/tip diff --name-status 856fa9e..32008a4 -- scripts/
```
