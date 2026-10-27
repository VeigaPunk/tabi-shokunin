# W1-04 — Reviewer04

## Findings

### High — C1/D5 census-count receipt is absent at the inspected revision

The frozen C1 predicate requires `.ufo/waves/round-38/measure/census-end.txt` and compares its parsed counts against `corpus/SOURCES.md` (counter lines 178–207). The path read returned `Path '.../measure/census-end.txt' not found`; reading the `.ufo/waves/round-38/measure` directory returned `(empty directory)`. Thus the frozen checkout does not contain the receipt needed to establish D5, regardless of whether other census validation ran. The exact counter invocation would falsify this finding if it produces a D5-clean result at the actual measured REV with a committed counts receipt:

```sh
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev <REV> --repo <clean lane clone> --json
```

**Disposition:** D5 is not demonstrated by the bytes inspected; cannot endorse C1's all-defects predicate on this checkout. This is a missing-evidence finding, not evidence that the reported census numbers themselves are numerically wrong.

### Medium — C2 driver's egress sampler can report zero for a non-loopback peer

In `scripts/playwright-firefox-loopback-round38.mjs:79–82`, the sampler counts a socket line as non-loopback only when the entire line does not match `/127\.0\.0\.1|::1/`. A TCP connection with a loopback *local* endpoint and a non-loopback *remote* peer contains `127.0.0.1` in the same `ss` row and is therefore excluded. Example row shape: `ESTAB ... 127.0.0.1:ephemeral 203.0.113.7:443 users:(('firefox',pid=123,...))`. The promised zero non-loopback observation is consequently not a sound test of remote-peer loopback status for that connection shape. The separate round-38 C2 claim asks for zero observed non-loopback sockets, so a row with an external remote endpoint, matching owned PID, and a loopback local address would falsify the zero-evidence conclusion; parse the remote-address field rather than searching the whole row.

The committed demo receipt (`corpus/evidence/round-38/playwright-firefox/receipt.json:379–381`) records aggregate `egressNonLoopback: 0`, but does not cure this sampler blind spot. The frozen C2 assertion itself is not disproved for its particular two runs; the measurement method does not rule out this counterexample.

## Other requested surfaces / residual risk

- I did not independently rederive C1 D1–D4 or D6, nor re-run the Firefox driver/counter; no conclusion on those items.
- C2 receipt reports browserVersion `157.0`, two equal first-shot hashes, `binding: true`, and zero aggregate egress/survivors (`receipt.json:5, 158–160, 339–341, 374–381`). This is artifact evidence; no claim of reproducing the runtime here.
- LSP device/status was unavailable: request to `xd://lsp` returned “No such tool” and listed mounted tools. Therefore no semantic references/definition/diagnostics checks were possible; cited source-line reads are direct text evidence, not semantic proof.
- No installs, runtime execution, or repo mutations were performed.
