# RevC1Green — scoped findings (round-39 w1, C1 recheck)

Full evidence and commands: `.ufo/waves/round-39/w1/RevC1Green/report.md`.

- Freeze integrity: counter `c1-egress-session-bound.mjs` sha256 `75e823e4…` and driver `playwright-firefox-egress-round39.mjs` sha256 `3fba8b68…` match `claims.json.frozenDigests` at instrument freeze `9c09ebb1` and at measured REV `d3232d56a909576aef6370243c5d457fbf42b1d2` (blob + worktree).
- Reproduction: clean clone (scratch), checkout `d3232d56…`, `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev d3232d56… --repo . --json` → exit 0, `predicate:true`, `findings:[]`, do-nothing control (round-38 v1 receipt) refused with 5 reasons, emitted predicate sentence byte-identical to frozen claims C1 predicate. Matches recorded `measure/pre-integration-counters.txt` (`C1_EXIT=0`).
- Refusal: fixture clone, committed single-field mutation `runs[0].survivors 0→1` (fixture commit `722b8f9e2b2e5699a1bd79b7a45d44e8a4095a84`, diff exactly `@@ -341 +341 @@`) → exit 1, `predicate:false`, finding `run1-survivors: survivors 1 != 0`; parent-rev rerun in the same fixture → exit 0, proving the counter evaluates committed git-object bytes at `--rev`.
- Observation (non-blocking): counter header comment claims the receipt is read at `--repo`'s worktree; the code reads `git show REV:path`. Behavior is stricter than the comment; no predicate/kill-rule impact.
- Hygiene: production lane untouched; fixture/clone git mutations only after `git rev-parse --show-toplevel` assertion inside `/fast/scratch/hyaku/tabi-r39/RevC1Green/`; scratch deleted before yield; no tool installs; no browser run (counter never re-runs the browser).

VERDICT ok C1 reproduced at measured tip d3232d56 on committed bytes (exit 0, predicate true, control refused, predicate sentence byte-identical to frozen claims); single-field mutation runs[0].survivors 0->1 refused in fixture commit 722b8f9e (exit 1, finding run1-survivors, predicate not-met); no installs
