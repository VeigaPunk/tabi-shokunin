#!/usr/bin/env node
// skipwork-control — the cheapest instrument that skips the claimed work.
//
// Purpose (round-23 claim C1, fleet claim-sizing rule: "build the cheapest control
// that skips the claimed work, score it with the frozen counter, commit that receipt;
// if it meets the target, the counter or target is wrong"):
//
// This control never reads any evidence. It prints the six class ids unconditionally.
// It therefore MEETS the frozen target (6 classes on round-22 evidence) while being
// unable to distinguish a defective round from a clean one. The receipt
// (skipwork-receipt.json) scores it on the same counter as the real auditor and shows
// where it dies: every clean fixture it is asked about still yields six findings.
//
// usage: node skipwork-control.mjs [--clean|--defective]   (both print six findings)

const CLASSES = [
  "c1-refusal-arithmetic",
  "c2-wave-caps",
  "c3-gate-spotcheck",
  "c4-stale-attempts",
  "c5-registry-identities",
  "c6-landed-log-binding",
];

const flags = new Set(process.argv.slice(2));
const mode = flags.has("--clean") ? "clean-fixture" : "defective-round";
process.stdout.write(
  `${JSON.stringify(
    {
      schema: "tabi-round-evidence-audit-control-v1",
      control: "skipwork-prints-six",
      input: mode,
      reads: "nothing",
      classes: CLASSES.length,
      findingClasses: CLASSES,
      clean: false,
      note: "unconditional; cannot distinguish a clean round from a defective one",
    },
    null,
    2
  )}\n`
);
process.exitCode = 1;
