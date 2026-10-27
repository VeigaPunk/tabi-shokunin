# Scout58 — W1-58

Axes: calibration, coverage.

## C1: frozen counter has an unconditional missing-evidence failure

Observed: frozen claims identify C1 predicate as D1–D6 and say the target is true at measured REV (claims.json:19–29). `c1-routed-defects.mjs` requires `.ufo/waves/round-38/measure/census-end.txt` at REV (lines 179–183), and requires a `numstat-at-*.txt` or `numstat.txt` under the measurement directory (lines 211–215). The frozen round-38 `measure/` directory is empty (read of that directory returned “empty directory”). Thus these requirements are not satisfied by the frozen checkout and the C1 predicate cannot be true there, regardless of other defect evidence. Counterexample to any statement that C1 is already true: run the frozen counter at the frozen commit; it must report D5/D6 missing receipts. This finding would be falsified by a target REV with both committed receipts whose contents pass the counter's respective endpoint/count comparisons.

## C2: claim scope is sampled observation, not proof of no egress

Observed: claims.json:35–41 requires two cold runs, identical first screenshot SHA, loopback-only requests, zero *observed* non-loopback sockets, zero survivors, and click/navigation/evaluation evidence. The v4 counter documents socket observation as established TCP sockets sampled every 400ms (c2-firefox-bidi-v4.mjs:81–83), with predicate requiring `live.egressNonLoopback == 0` and `live.survivors == 0` (lines 84–86). This supports a scoped statement of zero sockets observed at sample times, not a proof that no short-lived/non-established connection occurred between samples. A concrete falsifier of a stronger “no non-loopback egress occurred” interpretation is an external connect trace showing a short-lived non-loopback connection between samples while this counter reports zero. It does not falsify the claim's literal zero-observed predicate. No independent run receipt was inspected here; actual runtime success remains unverified.

VERDICT finding