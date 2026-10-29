# CritCapRow — round 43 capability-row review

**Scope:** Static audit of frozen C1 admission wording and its SCORECARD placement. **Axis:** coverage. No claim was judged or measured.

## Counterexample and result

The frozen admission text names the transport operation first: observe a loopback browser session's TCP sockets from both `ss` and `/proc/net/tcp`. The signature-authenticated chain is a qualification to that operation, not a gate/counter standing in for it. This meets QUALITY 84 and follows the round-35 capability-row precedent. The accepted row should retain this operation wording; do not substitute `measure-c1-round43.mjs` or `c1-signature-bound-v5.mjs` as the capability.

The strongest false-provenance counterexample is appending the prospective row before the measured pass and settled wave: the frozen admission says “On pass only,” and the SCORECARD's C1 target explicitly requires the policy-v2 wave settled (at least 64 seats, `WAVE-DONE`) with no in-model do-nothing reach. The declared before-state also records that the pre-freeze live attempt was refused by its counter. That refusal is not a working demonstration. However, the exact capability name is absent from the current SCORECARD (`functions.grep` returned `No matches found`), and the round-43 SCORECARD section is still the declared-claims section; **no pre-claim is present in the reviewed SCORECARD**.

The existing round-35 `webdriver-bidi-runtime-firefox` row is a different operation (driving a WebDriver BiDi session), not a prior admission of this TCP-socket observation capability. The r39–r42 mentions found by the broader search are declared C1 claims, not a committed capability row.

## Exact row I would accept after admission

Append only after the measured C1 pass is established at the committed revision and the policy-v2 wave is `WAVE-DONE` with at least 64 settled seats and no in-model do-nothing reach:

```md
| playwright-firefox-loopback-tcp | Observe a Playwright Firefox loopback session's TCP sockets from both `ss` and `/proc/net/tcp` under a signature-authenticated chain (per-invocation Ed25519 run key, witness-attested, challenge-bound receipt) | `scripts/playwright-firefox-egress-round43.mjs`; `corpus/evidence/round43/playwright-egress/receipt.json`; `.ufo/waves/round-43/measure/c1-measure-r43.json`; round-43 report's measured C1 run | 43 |
```

This keeps the evidence pointer to the producer, the committed receipt and measure record, and the round report's measured demonstration; it names neither gate nor counter. The last cell is first-working round 43. The round-report pointer is required by QUALITY 84 in addition to the frozen receipt/measure pointer requirement.

## Smallest safe correction

No amendment to the frozen claims or code. Keep the row out of SCORECARD until both the measured pass and `WAVE-DONE` conditions above are established; then append the proposed row with the round report's measured C1 demonstration. A pending/planned row must not count as a capability.

**Impacted axes:** coverage only (and the capability-entry/stagnation history if incorrectly preclaimed); no calibration change. This review makes no score change.

## Limitations and run record

Static row audit only. I did not run the browser, C1 counter, live measurement, or wave aggregation, so this report does not establish that C1 passed or that the wave is complete. No tool installed or updated; pacman was not invoked. No git/jj mutation was performed.

Evidence excerpts and exact read/search observations: [`evidence.md`](evidence.md).

VERDICT ok Frozen admission names the operation; no premature SCORECARD capability row was found, and insertion remains gated on measured pass plus WAVE-DONE.
