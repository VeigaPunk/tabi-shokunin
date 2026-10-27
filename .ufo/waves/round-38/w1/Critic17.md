# Critic17 — W1-17

Axes: calibration, coverage.

## Finding: C1 census/numstat evidence absent at frozen commit

At the lane checkout frozen at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, `.ufo/waves/round-38/measure/` has no entries (bounded directory listing returned “No files found”). In particular the claimed receipt `.ufo/waves/round-38/measure/census-end.txt` and any `numstat-at-*.txt` are absent. Counter `.ufo/waves/round-38/counters/c1-routed-defects.mjs` lines 178–183 explicitly requires census-end at REV; lines 211–215 explicitly refuses without a numstat receipt. Thus C1 predicate is not currently true at frozen HEAD; this is an absent-artifact falsification, not a disagreement about parsed counts. It would be falsified by a measured target REV containing the committed receipts, with census histograms matching counter-derived values and endpoints baseline..REV.

## C2 bounded source review — no runtime finding

Driver lines 76–83 samples sockets only for PIDs gathered by a process-list grep at lines 73–74; samples occur every 400ms. This is not a complete network egress proof: short-lived connections between samples can evade it, and a Firefox process whose command line does not match the grep is outside the observation set. Therefore “zero observed non-loopback sockets” is accurate, but interpreting that as a guarantee of loopback-only egress is unsupported. The claim predicate itself says “zero observed,” so this is a limitation rather than a counterexample to its literal predicate. Stronger falsifier: capture outbound connect attempts (including failed and short-lived sockets) for the browser process tree, or explicitly scope the capability to sampled observed sockets.

Driver lines 131–143 closes browser/server and counts survivors; however this excerpt does not include a runtime receipt, and the round-38 measure directory is empty, so no independent run/receipt was available to verify binding or cleanup. No tools installed; no scratch created.

VERDICT finding
