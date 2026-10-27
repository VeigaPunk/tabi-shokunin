# CritFixture — round 39 C1 fixture determinism/capability scope

Axes: coverage; calibration.

## Finding
The first-shot SHA equality is evidence of equal PNG bytes for the initial hydrated rendering only. It is not a behavioral-determinism proof. The driver does execute click/DOM mutation, delayed confirmation, second screenshot, navigation/back history, requests/responses, and console checks; however the frozen counter only checks that `firstShotSha256` is a 64-hex string in each run and that the two strings match. It never validates `cmds`, `events`, `httpLog`, post-click screenshot/effect, history state, DOM shape, or console results. Therefore a receipt may claim the required hash binding while omitting or falsifying every behavioral observation. This is a coverage gap in receipt acceptance, not evidence that the observed live driver run misbehaved.

The scope is further bounded: this is a one-host, one Playwright/Firefox-build, loopback fixture egress demonstration; it does not establish general browser behavioral determinism, external-site coverage, or platform-wide egress isolation. Preserve the distinct egress/session-bound claim and explicitly label screenshot equality as initial-render binding.

## Exact safer scope language
“Two unrefused cold runs produced identical SHA-256 hashes for the first hydrated fixture screenshot on this host/build. The receipt separately records click/DOM, history, request/response, and console observations; those fields are descriptive unless independently checked by the counter. This demonstrates initial-render byte equality and sampled loopback-only session egress for this fixture, not behavioral determinism.”

For a behavioral-determinism claim, extend the frozen counter to require a fixed, versioned set of required steps and compare canonicalized outcomes across both runs: click count/list/confirmation, post-click screenshot hash, history pathname/title and post-history state, request/response sequence/status, console error count, and relevant DOM/status values. Reject absent or malformed step data rather than trusting a driver assertion. Keep timing, ephemeral ports/PIDs, and other run-specific values out of equality comparison. Without this added predicate the safe correction is scope wording only; don't promote this evidence to general behavior determinism.

## Evidence / exact commands and output
Read-only inspection (no browser run, fixture mutation, or tool installation):

```sh
cat /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs
cat /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/counters/c1-egress-session-bound.mjs
cat /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/measure/c1-fixture-selftest-explicit.txt
```

Observed driver source: `step('screenshot.first', ...)` records the initial SHA; it subsequently records `click.effect`, `screenshot.after-click`, `evaluate`, `history.traverse`, `history-reset-and-click`, `http.witnessed`, and `console.quiet`. `rec.httpLog` is derived from events. These are genuine exercised driver steps, but they are not acceptance requirements in the frozen counter.

Observed counter source: it validates screenshot hash format and equality (`shots`, `R.binding`), plus ownership, sample coverage, egress, survivors, port, version, and fixture hash. No counter access to the behavioral `cmds`, `events`, `httpLog`, or individual run outcome exists. The recorded selftest reports an “honest v2 receipt” accepted with predicate met and an empty-owned-tree mutant rejected; it does not report mutants omitting/changing the behavioral step evidence.

Prior evidence at `corpus/evidence/round-38/playwright-firefox/receipt.json` records matching first screenshots `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, while its per-run logs separately show click effect (`count=1`, `items=1`, `confirmed 1`), history traversal/reset, and witnessed HTTP traffic. It reports only two egress samples per run and is the v1 control, not proof for the v2 coverage predicate.

Evidence paths read:
- `.ufo/waves/round-39/claims.json`
- `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`
- `scripts/playwright-firefox-egress-round39.mjs`
- `.ufo/waves/round-39/measure/c1-fixture-selftest-explicit.txt`
- `corpus/evidence/round-38/playwright-firefox/receipt.json`

No tools installed. No live browser used. No production files, git/jj state, or sibling repositories changed.

VERDICT finding — matching first-shot SHA proves only initial screenshot byte equality; behavioral evidence is logged by the driver but not bound/validated by the frozen counter, so describe this as initial-render binding unless the counter checks canonical behavioral outcomes.
