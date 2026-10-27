# CritFixture — C1 behavioral determinism scope

Axes: coverage; calibration.

Finding: identical `firstShotSha256` values establish byte equality of the initial hydrated screenshot only, not full behavioral determinism. The driver records click/DOM mutation, confirmation, post-click screenshot, history, request/response, and console evidence; the frozen counter does not validate `cmds`, `events`, or `httpLog`, so accepted receipts can omit or falsify those behaviors while satisfying screenshot equality. This is an acceptance coverage gap, not proof of a bad observed run.

Recommended scope text: “Two unrefused cold runs produced identical SHA-256 hashes for the first hydrated fixture screenshot on this host/build. The receipt separately records click/DOM, history, request/response, and console observations; those fields are descriptive unless independently checked by the counter. This demonstrates initial-render byte equality and sampled loopback-only session egress for this fixture, not behavioral determinism.”

To claim behavior determinism, counter must require and compare canonicalized outcomes for click/list/confirmation, post-click image, history state, request-response sequence/status, console errors, and selected DOM state; ignore ephemeral ports/PIDs/timing. Otherwise retain narrower language. Round-38 receipt itself shows matching initial hashes but separate observed outcomes; it is v1 with two socket samples, not evidence satisfying v2 sampling.

Evidence: inspected `scripts/playwright-firefox-egress-round39.mjs`, `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`, `.ufo/waves/round-39/measure/c1-fixture-selftest-explicit.txt`, and `corpus/evidence/round-38/playwright-firefox/receipt.json`. Driver records the richer steps; counter checks hash format/equality and not the behavioral fields. Selftest records acceptance of a synthetic “honest v2 receipt” and rejection of empty owned trees, but no behavioral-step omission/tamper mutant. No live browser used; no tools installed.

VERDICT finding — first-shot SHA equality is not proof of behavioral determinism; scope the capability as initial-render byte equality unless behavioral outcomes are counter-validated.
