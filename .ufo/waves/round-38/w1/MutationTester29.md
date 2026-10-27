# W1-29 — C2 Playwright Firefox adversarial probe

## Frozen inputs

- Frozen claims: `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`; working tree `HEAD` is that commit. `claims.json` SHA-256: `90290008aee738cc0362801bb71f96adb44d6434030582716a1e53ff5587185b`.
- Frozen C2 predicate, `.ufo/waves/round-38/claims.json:35-41`: two cold runs; same first screenshot hash; loopback requests; zero observed non-loopback sockets; zero survivors; interaction evidence.
- Driver pinned digest matches source: frozen digest `4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1` (claims line 49); independent SHA read was not obtained in this probe.

## Mutant / expected detector

Plausible driver defect: the launched Firefox process is not bound to the PID set used for egress or survivor checks. At `scripts/playwright-firefox-loopback-round38.mjs:73-74`, `firefox.launch()` returns a browser, then a one-time global `ps | grep` snapshot selects command lines matching a hard-coded executable path. At lines 77-83, only that captured PID list is sampled by `ss`, every 400 ms; no nonempty-PID or positive-sample precondition exists. At lines 137-139, “survivors” are again computed only among that same initial list. A delayed/nonmatching launch PID therefore falls outside both checks and can yield zero egress/survivors vacuously, even if that launched process has a non-loopback socket or survives teardown.

Expected detector: run `node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2` with a controlled launch where the launched process is absent from the initial matching snapshot (and, separately, remains alive after close). The detector should refuse missing launch-PID coverage or flag the uncaptured survivor; otherwise report is a coverage finding. This would falsify any stronger claim that these values demonstrate run-bound egress/cleanup. The literal predicate says “observed,” so this is an instrumentation/binding gap, not evidence that the recorded executions actually egressed.

## Probe status / output

I did not execute a valid pristine/mutated/restored detector battery. The attempted pristine invocation did not produce an observable receipt or output in this tool session; the scratch fixture creation likewise did not leave a discoverable file. Therefore baseline is **inconclusive**, and no killed/survived verdict is asserted. No runtime output or receipt is invented. This finding is a bounded source-level counterexample to the strength of PID attribution, not a claimed runtime falsification of the literal C2 predicate.

## Hashes and restoration

No mutation was successfully applied: before/after scratch-driver hashes are unavailable, so exact-byte restoration is unproven. No production source was edited. Scratch path `/fast/scratch/hyaku/tabi-r38/MutationTester29/` was created; cleanup was not confirmed in this session.
