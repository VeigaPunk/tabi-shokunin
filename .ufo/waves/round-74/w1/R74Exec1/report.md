HOLDS

Axes: coverage, independence, pin integrity, negative-case discrimination, mutation kill power.

## Frozen pins
Command: `sha256sum scripts/chrome-cdp-imecompose-round74.mjs scripts/check-imecompose-r74.mjs scripts/negatives-imecompose-r74.mjs .ufo/waves/round-74/controls/c1/kill-power-r74.mjs .ufo/waves/round-74/claims.json .ufo/waves/round-74/run-scored.sh` in `/home/vgpnk/Projects/shokunin/tabi-shokunin`; exit 0. Compared each output to `.ufo/waves/round-74/freeze.txt:3-8`; all six match:

| File | Observed SHA256 | Comparison |
|---|---|---|
| scripts/chrome-cdp-imecompose-round74.mjs | afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc | MATCH |
| scripts/check-imecompose-r74.mjs | 5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251 | MATCH |
| scripts/negatives-imecompose-r74.mjs | 8c0dd93a61177eb02691bee7f3a6d3762eb51cdf9d51599e7e23867ffe91fb26 | MATCH |
| .ufo/waves/round-74/controls/c1/kill-power-r74.mjs | dcc8308bea91639daf9cd412ec01d5b7acc72754eb48be68c03e4ca5c4967c69 | MATCH |
| .ufo/waves/round-74/claims.json | 423ae94f3fd4b946647e1cd79526bcc5c52e40d0ba0dbc5b6327b006b3c2f6d6 | MATCH |
| .ufo/waves/round-74/run-scored.sh | c6527ccfcd95d718897c5ca96c8f98b7d1e2472ad6066de5221691ba93fa9c3c | MATCH |

## Leg (b): HOLDS
Command: `TMPDIR=/fast/scratch/hyaku/tabi-r74/R74Exec1/d node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-imecompose-round74.mjs --scratch /fast/scratch/hyaku/tabi-r74/R74Exec1/d --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/w1/R74Exec1/receipt.json --nonce tabi-r74-exec1-ca30e1a3b7b2 --http-port 56887 --cdp-port 55713`; exit 0 captured immediately. Exactly one cold driver invocation, no retry. Retained receipt: `receipt.json` beside this report.

Command: pinned `scripts/check-imecompose-r74.mjs --receipt <this directory>/receipt.json --expect-driver-sha256 afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc --expect-nonce tabi-r74-exec1-ca30e1a3b7b2 <PRE in assigned order> --prior /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round74/chromium-ime-composition/receipt.json --json`; exit 0 captured immediately. Retained `counter.json`: verdict clean, checkCount 148, findings []. PRE is all 12 assigned frozen priors: smoke1 through smoke9, then degenerate-dispatch-key, degenerate-exec-command, degenerate-script-events. The L1 receipt is the thirteenth prior.

## Leg (c): HOLDS
Commands use the pinned driver hash above and PRE in the assigned order.

- `node scripts/negatives-imecompose-r74.mjs --real corpus/evidence/round74/chromium-ime-composition/receipt.json --expect-nonce tabi-r74-l1-ca30e1a3b7b2 --expect-driver-sha256 <pin> <PRE> --work /fast/scratch/hyaku/tabi-r74/R74Exec1/n <three assigned --laundered degenerate receipts> --json`: exit 0. Retained `negatives-a.json`: passed 239, cases 239, failed [], coverageGap [], allOk true.
- `node scripts/negatives-imecompose-r74.mjs --real <this directory>/receipt.json --expect-nonce tabi-r74-exec1-ca30e1a3b7b2 --expect-driver-sha256 <pin> <PRE plus L1 receipt> --work /fast/scratch/hyaku/tabi-r74/R74Exec1/n <same three --laundered receipts> --json`: exit 0. Retained `negatives-b.json`: passed 239, cases 239, failed [], coverageGap [], allOk true, positiveOk true.
- `node .ufo/waves/round-74/controls/c1/kill-power-r74.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round74/chromium-ime-composition/receipt.json --expect-driver-sha256 <pin> --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <PRE> --work /fast/scratch/hyaku/tabi-r74/R74Exec1/k --out <this directory>/kill-power-a.json --jobs 6`: completed exit 0. Retained `kill-power-a.json`: unmutatedExit 0, forceTrue 148/148 killed, semantic 26/26 killed, survivors [], holds true.

All actual node arguments used absolute paths. The first kill-power invocation hit the tool's 600-second timeout before producing its summary (no command exit code available). The same control was rerun with a 3300-second subprocess deadline, completed exit 0, and produced the retained summary. This was not a driver rerun.

## Scope, risks and blockers
Only receipt/evidence/report files were created in this seat's assigned output paths. No implementation, predicate, counter, pin or kill-rule changes; no tools installed. These measurements establish legs (b) and (c), not the complete predicate or leg (d). No remaining measured blocker; the initial control timeout is disclosed above, not counted as a pass.
