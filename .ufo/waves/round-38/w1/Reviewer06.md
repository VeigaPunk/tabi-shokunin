# W1-06 — frozen-claim adversarial review

## Finding — C2 egress counter does not establish zero non-loopback sockets

**Severity: High (claim predicate/evidence gap).** The frozen C2 predicate says “zero observed non-loopback sockets.” In `scripts/playwright-firefox-loopback-round38.mjs:79-83`, the sampler runs `ss -tnp` every 400 ms and retains matching Firefox PID lines; line 81 classifies a line as loopback if the *entire line* contains `127.0.0.1` or `::1`. An `ss` TCP line includes both local and peer endpoints. Thus a connection from the Firefox loopback source address to a non-loopback peer contains `127.0.0.1` and is counted as loopback; the predicate should inspect the peer endpoint, not search the whole line. The 400-ms polling also cannot rule out shorter-lived connections between samples, and `ss -tnp` observes TCP only. Therefore a receipt value of zero is not evidence for the stated zero-socket property. This would be falsified by evidence that each peer endpoint is parsed and checked and that all relevant socket protocols/connections are captured (or by a bounded counterexample showing the current classifier returns zero for an `ss` row with loopback local endpoint and non-loopback peer).

Related binding caveat: lines 73-74 launch Firefox and then collect every process matching the fixed Firefox binary path, rather than binding the sample to the specific browser instance just launched. This can include unrelated matching processes and does not independently establish per-run process identity. It does not cure the egress classification defect.

## C1 and frozen bytes

No actionable C1 counterexample established in this bounded review. The current bytes of all five listed frozen artifacts match `claims.json` digests exactly: C1 routed-defects counter `209d86a0…149d57f7`; adjacency counter `704da806…53a890bb`; C2 bidi counter `6a14d8ca…047fecf`; C2 mutant battery `6d7a925b…91e503c`; C2 driver `4cf3a849…02e75c1`. The lane HEAD resolves to the stated claims commit `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`. I did not independently re-run the C1 predicate or its baseline control, so this is not a finding that D1–D6 pass.

## Verification gaps

No runtime receipt was present in the round-38 `measure/` or `baseline/` directories in the inspected tree, and I did not run the browser driver. Thus this review does not confirm runtime output, Firefox version, screenshot equality, cleanup, or any observed egress count. The concrete C2 issue above is in the frozen measurement implementation itself.