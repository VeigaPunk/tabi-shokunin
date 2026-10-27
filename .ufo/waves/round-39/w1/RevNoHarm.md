# RevNoHarm — round 39 self-test rerun

Axes: coverage, calibration. Read `claims.json` and frozen C1/C2 counters before execution. Claims name only the Firefox egress and routed-defects instruments; this assignment is an offline `scripts/check-*.mjs` self-test sweep.

## Method and evidence

Commands executed read-only against two isolated shared-object clones (scratch only):

```sh
git clone --quiet --shared --no-checkout "$LANE" "$S/current"
git clone --quiet --shared --no-checkout "$LANE" "$S/baseline"
git -C "$S/current" checkout --quiet 9c09ebb1e2ff594c70ce72093b5d4133c1734dca
git -C "$S/baseline" checkout --quiet 5bc56a81d196caeb8d24551928b883802697aabb
node scripts/check-<name>.mjs <documented-selftest-flag>
```

The successful documented selftests were run with the same commands at each revision. Exact outputs below; all exited 0:

| Script | Baseline output | Round-39 frozen output |
|---|---|---|
| check-adjacency.mjs | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | same |
| check-aria-metadata.mjs | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` | same |
| check-bfcache-receipt.mjs | JSON `cases=17 passed=17` | same |
| check-bidi-runtime.mjs | JSON `cases=56 passed=56` | same |
| check-decision-table.mjs | JSON `cases=34 passed=34` | same |
| check-freshness.mjs | `FRESHNESS_GATE verdict=could-not-evaluate finding=usage` (exit 2) | same |
| check-frontier-admission.mjs | JSON `cases=24 passed=24` | same |
| check-gate-mutants.mjs | JSON `cases=12 passed=12` | same |
| check-gate-registry.mjs | JSON `cases=22 passed=22` | same |
| check-measurement-binding.mjs | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | same |
| check-release-pins.mjs | JSON `cases=29 passed=29` | same |
| check-round-contract.mjs | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | same |
| check-s106-evidence.mjs | JSON `cases=10 passed=10` | same |
| check-selfassessment.mjs | JSON `cases=41 passed=41` | same |
| check-source-reopen-receipt.mjs | JSON `cases=18 passed=18` | same |
| check-sources.mjs | `SOURCES_SELFTEST verdict=clean cases=26` | same |
| check-user-round-contract.mjs | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | same |

For JSON selftests, process exit was 0 and `passed == cases`; JSON result objects reported all cases `ok: true`. The output transcript showed exact same counts/behavior at both revisions. Additional successful commands and counts, following the documented flags without `--json`: adjacency `--self-test` (57), aria metadata `--self-test` (36 CLI + 4 helpers), measurement binding `--self-test` (76), round-contract `--self-test` (38), sources `--self-test` (26), user-round-contract `--self-test` (45). All exited 0 at frozen revision.

Some initial sweep invocations appended `--json` to commands whose documented CLI rejects it, or used a flag alias not accepted (`check-sources.mjs --self-test`, user-round-contract `--self-test`). These exited 2 at both revisions; corrected commands above follow each script’s declared usage. `check-freshness.mjs` self-test requires a fixed descriptor path and did not run in this sweep; the attempted descriptor glob invocation exited 2 with `descriptor_allowlist` at frozen revision. This was not treated as a regression.

## Finding

No self-test regression attributable to round-39 instrumentation was observed. Every comparable supported self-test had matching outcome/count at baseline and frozen round 39. No evidence here adjudicates live C1 capability acquisition or C2 routed-counter predicate attainment; this task was limited to offline checker self-tests.

VERDICT ok — comparable offline check-script self-tests show no round-39-attributable regression; freshness descriptor self-test remains unevaluated.
