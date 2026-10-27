# Critic23 — W1-23

Axes: calibration; coverage.

## Finding — C2 evidence does not establish the claimed Firefox release

The committed receipt reports `firefoxVersion: null` but `browserVersion: "157.0"` (`corpus/evidence/round-38/playwright-firefox/receipt.json:2-6`). The driver launches an initial probe and records `probe.version()` into `browserVersion` (not `firefoxVersion`) at `scripts/playwright-firefox-loopback-round38.mjs:157-160`, then launches each run with the same unqualified `firefox.launch({ headless: true })` at line 73. Its `FIREFOX_BIN` constant naming the cached `firefox-1555` executable is not used in the launch call (lines 22-24, 73). Therefore the receipt's version is only browser self-report and does not bind runs to the claimed Playwright Firefox 157.0 executable/artifact. Counterexample: environment-resolve or substitute a different executable that reports 157.0; the receipt still lacks executable path/digest and cannot distinguish it. This weakens C2's stated surface/provenance; it is not evidence the observed loopback interactions did not occur.

Smallest safe correction: explicitly launch the pinned Firefox executable and record its resolved executable path plus digest in the receipt, and have the acceptance counter check those fields against the authorized install identity. Do not treat `browserVersion` as executable identity.

## C1 check

Bounded read-only run of frozen C1 counter at the frozen commit:

`node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json`

Exit 1; output begins `predicate:false` and shows `d1.supersedingCorrection:false`, `d2.stated:null`, while recomputed D2 is 23 ok / 11 finding across 34 reports. This is expected at the frozen claim revision: the round-38 corrections/receipts are uncommitted wave work, so it does not falsify the future target predicate at its measured REV. No independent D5/D6 false acceptance established in this pass.

No installs; scratch not used.

VERDICT finding

Report: .ufo/waves/round-38/w1/Critic23.md