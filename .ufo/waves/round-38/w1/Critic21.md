# W1-21 — C1/C2 adversarial review

Axes: **calibration**, **coverage**.

## Counterexample: C2 egress/cleanup predicate is not supported by this receipt/driver

The C2 frozen predicate requires “zero observed non-loopback sockets” and “zero survivors” (claims.json:37). In the committed receipt (`corpus/evidence/round-38/playwright-firefox/receipt.json`), each run records only `egress.samples: 2` (lines 153-156 and 334-337), despite the driver sampling on a 400 ms interval throughout the session (`scripts/playwright-firefox-loopback-round38.mjs:76-83`). Two samples do not establish continuous observation through a browser session with navigation/click/history actions; the receipt proves only that the sampled `ss` output contained no classified non-loopback line. Moreover, `egress.lines: 1` for each run is merely the maximum matching output-line count, not the number of successful observations or a completeness signal. Thus a non-loopback connection opening and closing between the two samples is a concrete falsifying scenario that still yields the claimed zero.

The run-level `firefoxPids` are collected by process-name grep at `:73-75`; the same global process-name grep is used for survivor collection at `:137-142`. A missing PID capture means a Firefox process spawned outside that grep’s timing/command-line match is excluded from its own survivor check. The recorded `firefoxSurvivorPids: 0` is therefore zero among captured PIDs, not a verified zero of all descendants/survivors. The top-level receipt also says `firefoxVersion: null` (receipt:5), while `browserVersion: 157.0` is separately present: exact Firefox binary version is not independently established by that field.

**Falsifier / smallest safe correction:** run an adversarial fixture that opens a non-loopback socket only between sampling ticks (or a browser child escaping the PID grep); if receipt remains egressNonLoopback=0 / survivors=0, these are sampling/capture-bound measurements, not universal guarantees. State the claim narrowly as “zero observed in N successful samples among captured PIDs” and record sample timestamps/coverage; for a stronger claim, monitor socket/process events continuously and track the launched browser process tree by launch identity, then require monitoring coverage and complete teardown. Do not treat the null version field as an exact Firefox-version receipt.

## C1

No independent C1 counterexample established in this review. The frozen claims define a multi-part predicate (claims.json:23-28); source-code comments describing D1-D6 are not themselves evidence that all receipt comparisons succeed. I did not re-run the full counter or infer success from comments.
