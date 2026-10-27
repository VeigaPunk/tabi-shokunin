# W1-18 — C2 adversarial review

Axes: coverage (primary); calibration (secondary). **Finding: C2's driver does not establish its claimed egress observation or teardown cleanup.**

## Counterexample

In `scripts/playwright-firefox-loopback-round38.mjs:74-83`, the driver discovers Firefox PIDs by grepping the global process table for the binary path, then samples `ss` only for those PIDs. The browser launch at line 73 does not bind `rec.firefoxPids` to the launched browser process; if the process appears after the single immediate `ps` snapshot, the list can be empty. In that case the generated `ss` filter is `pid=(),`, no owned sockets are observed, and `egress.nonLoopback` remains zero regardless of subsequent browser egress. There is no assertion that `firefoxPids` is nonempty or that the sampler observed any sockets (lines 76-84). A truthful zero therefore does not falsify non-loopback egress; it can mean unobserved.

Cleanup is similarly weaker than claimed: `runOnce` calls `browser.close()` at line 132, but the survivor test at lines 137-139 only counts PIDs captured by the earlier global grep. A Firefox process that was not in that initial list is not counted as a survivor. The global path grep also does not establish per-run ownership when runs overlap or unrelated Firefox instances use that same executable.

The receipt records the resulting counts (`lines 76-84,137-143`), and the frozen C2 predicate requires zero egress/survivors (`claims.json:35-41`), but neither predicate checks that process discovery was complete or sampling actually covered the live session. Thus a two-run receipt can report zero while leaving the decisive telemetry vacuous.

## Falsification / smallest safe correction

This finding is falsified if a bounded run demonstrates that the driver obtains a nonempty, per-run process identity set only after the browser is live, samples that set through teardown, and refuses a receipt when discovery/sampling has no coverage. Smallest correction: derive browser PIDs from the launched Playwright browser process/tree (not a one-time global executable-name snapshot), require a nonempty owned set and at least one successful sample, and use the same per-run identity set for survivor checks. Until then, zero values are not evidence of zero egress or zero survivors.
