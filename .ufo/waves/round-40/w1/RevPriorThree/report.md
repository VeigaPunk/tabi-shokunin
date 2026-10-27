# RevPriorThree — fresh-start review of routed defects

Report path: `.ufo/waves/round-40/w1/RevPriorThree/report.md` (relative to `tabi-shokunin`).

## Finding summary

The round-40 C1 freeze closes the concrete round-39 counter defects around actual sample-span arithmetic, absent observation surfaces, and replay/provenance: the frozen counter requires at least eight strictly increasing sample timestamps with `last - first >= 1000`, usable `ss` and `proc` ticks on every sample and final sweep, and the invocation nonce on the produced receipt and both runs. The wrapper itself launches the driver with exactly two runs and refuses pre-existing output. The committed replay receipt shows the round-39 receipt is refused.

The freeze does **not** eliminate the remaining limits routed in round 39: process ownership is still captured once at launch and reused for every sample/final sweep; the predicate does not bound inter-sample gaps or detect connections that begin and end between polls; and a post-close sweep cannot recover sockets already closed. The predicate's “all observed” wording narrows the assertion to observed samples, but does not establish comprehensive egress coverage. These limits remain residuals for a coverage claim. The freeze also does not address C2 calibration, the M3 red-control/numstat routes, quarantine adjudication, or the operator-owned prompt mismatch.

**No claim pass is inferred.** The round-40 claim is pre-data; its amendment says no seat has been dispatched or scored during the pre-data revisions (`.ufo/waves/round-40/claims.json:6-10`). I did not invoke the Firefox driver or write production evidence.

## Prior rejected reports and routed evidence

- Round 37's report says both claims met (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-37/tabi.md:70-95`) and reports 34 w1 seats, a claimed 18/16 verdict split, and no w2 dispatch (`.../round-37/tabi.md:135-151`). The non-author spot-check routed D1–D6 to round 38: false 68-seat SCORECARD statement; wrong 18/16 tally; inaccurate/missing LOG hash ledger; M3 missing `Captured-by` and red control; census receipts without parsed counts; and imprecise numstat window (`corpus/lessons/round-37-verifier-spotcheck.md:109-134`).
- Round 38's report explicitly says C1 calibration was not met and C2 coverage was unprovable/not admitted (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-38/tabi.md:5-13,28-31`). The round-38 spot-check re-derived the D1/D2 corrections, D3 LOG ledger, and D5 census counts; it says M3's `Captured-by` was present but the M3 mutant receipt was absent, and the numstat receipt measured through `0930a6b`, not the final tip (`corpus/lessons/round-38-verifier-spotcheck.md:15-18`). Its next-round routes are at `corpus/lessons/round-38-verifier-spotcheck.md:37-43`.
- Round 39's report says neither claim verified; C1's committed receipt had 799 ms and 701 ms sample spans although `coverageMs` was 1560/1461 ms, and W1 identified a one-time process-tree snapshot, synthetic-zero handling for unavailable surfaces, sampling gaps, and closed-socket invisibility (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-39/tabi.md:5-12,31-35`). Its full routed list is `corpus/lessons/round-39-verifier-spotcheck.md:35-40`.

## Round-40 freeze verification

I read `.ufo/waves/round-40/claims.json` and the frozen wrapper, counter, and driver. Baseline `a1b1e939048885d2793759b7f49b10c5c820d70d` is an ancestor of freeze `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`; the freeze commit is titled `round-40: freeze live nonce-bound Playwright measurement`. The working-tree digests and `git show <freeze>:<path> | sha256sum` digests match the claim's four `frozenDigests` entries (`claims.json:29-34`):

```text
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && sha256sum scripts/measure-c1-round40.mjs scripts/selftest-measure-c1-round40.mjs scripts/playwright-firefox-egress-round39.mjs .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735  scripts/measure-c1-round40.mjs
5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82  scripts/selftest-measure-c1-round40.mjs
1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b  scripts/playwright-firefox-egress-round39.mjs
0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c  .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
```

The same four hashes were observed from the freeze commit's blobs. `git merge-base --is-ancestor a1b1e939048885d2793759b7f49b10c5c820d70d 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` succeeded; output after the success check: `baseline IS ancestor of freeze`. The frozen claim has only C1 (`claims.json:14-27`), so round-39's C2 calibration redesign is not part of this freeze.

Mechanism evidence:

- The wrapper refuses an existing output (`scripts/measure-c1-round40.mjs:12-15`), generates 32 random bytes rendered as 64 hex characters (`:16`), invokes the driver with `--round40 --runs 2` and the nonce (`:17-18`), checks the receipt and each of two runs carry that nonce (`:21-22`), scores that exact output with the same nonce (`:23-25`), and exits 0 only if driver and counter both exit 0 and the predicate is true (`:27`).
- The driver accepts `--round40` only with exactly two runs, a 64-hex nonce, explicit scratch, and a not-yet-existing output (`scripts/playwright-firefox-egress-round39.mjs:363-375`); it puts the nonce on the receipt and each run (`:378-390`) and writes the output exclusively (`:403`).
- The counter checks nonce equality and exactly two runs (`.ufo/waves/round-40/counters/c1-sample-span-v3.mjs:10-15`); sample count, ordering, and actual first-to-last timestamp span (`:16-19`); usable positive-tick `ss`/`proc` evidence and zero nonLoopback counts on each sample and final sweep (`:20-27`); owned tree, survivors, fixture port, browser version, per-run hash, and equal hashes (`:28-34`).
- The round-40 runner makes either missing surface unavailable (`scripts/playwright-firefox-egress-round39.mjs:117-135,201-235`); it records `browser.version()` on the run (`:285-288`) and performs the final sweep/port-closure check after browser close (`:329-350`).

Committed controls, read rather than re-executed:

- `.ufo/waves/round-40/controls/c1-round39-replay-v3.json` records `predicate:false`, `nonceMatched:false`, findings `schema`, `run-nonce-mismatch`, `run1-sample-span`, and `run2-sample-span`; receipt SHA-256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`. This matches the control description in `claims.json:35-42`.
- `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json` records 7 cases passed: a parser-only synthetic positive, four unavailable-surface mutants, stale round-39 nonce replay, and refusal of pre-existing synthetic output before scratch/driver start. This is not a live browser capability result; `claims.json:44-51` explicitly identifies the synthetic positive as selftest-only.

## Routed-defect disposition

| Routed defect | Round-40 C1 disposition | Evidence / remaining status |
|---|---|---|
| R37 D1 SCORECARD 68-seat overclaim | Already corrected in R38, not by this C1 | R38 re-derived the true 34-seat shape and append-only correction (`round-38-verifier-spotcheck.md:15`). |
| R37 D2 18/16 report tally | Already corrected in R38, not by this C1 | R38 re-derived 23 ok / 11 finding (`round-38-verifier-spotcheck.md:15`). |
| R37 D3 LOG hashes/landing attribution | Already corrected in R38, not by this C1 | R38 spot-check says six hashes and correct `34ed508c` attribution are present (`round-38-verifier-spotcheck.md:15`). |
| R37 D4 M3 red control | Not addressed by R40 C1; residual status not established here | R38 found `Captured-by` present but the mutant receipt absent; R40 selftest has no M3 predicate-sentence mutant (`round-38-verifier-spotcheck.md:15`, `round-40/controls/c1-measure-selftest-v2.json`). |
| R37 D5 parsed census receipt | Already corrected in R38, not by this C1 | R38 receipt and independent parse both match 144 rows/counts (`round-38-verifier-spotcheck.md:15`). |
| R37 D6 numstat window | Not addressed by R40 C1 | R38 says the receipt measures only through `0930a6b`, not final tip; R40 has no C2/numstat claim (`round-38-verifier-spotcheck.md:15,37-43`; `round-40/claims.json:14-27`). |
| R38 #1 M3 red control / #2 reproducible numstat protocol | Not addressed by R40 C1 | The selftest's seven cases test parser/surface/nonce/output behavior, not M3 or numstat (`round-40/controls/c1-measure-selftest-v2.json`; R38 routes at `round-38-verifier-spotcheck.md:39-40`). |
| R38 #3 session-bound egress evidence | Partially addressed | Nonempty owned tree, sample coverage, fail-closed surfaces, browser version, and nonce-bound fresh runs are checked (`round-40/claims.json:19-25`; counter lines above). The process tree is still fixed once: `tree0` is built after a 400-ms delay and assigned to `rec.owned.tree` at `scripts/playwright-firefox-egress-round39.mjs:252-266`; subsequent samples and the final sweep reuse that same tree (`:277-283,343-345`). |
| R38 #4 quarantine hand-check / #5 prompt band mismatch | Not addressed by R40 C1 | These are outside the sole C1 claim (`round-38-verifier-spotcheck.md:42-43`; `round-40/claims.json:14-27`). |
| R39 #1 actual sample span and fail-closed surfaces | Addressed at the frozen predicate level | Counter uses `ts.at(-1)-ts[0]`, rejects spans under 1000 ms and non-increasing timestamps, and rejects missing/unusable sample/final surfaces (`c1-sample-span-v3.mjs:16-27`). The committed replay control rejects the old 799/701-ms receipt. |
| R39 #1 snapshot-only process discovery | Remains | Runner builds the owned tree once at launch (`playwright-firefox-egress-round39.mjs:252-266`) and does not refresh it in the timer/final sweep (`:277-283,343-345`). |
| R39 #1 missed brief connections / closed sockets | Remains as an observation-coverage limit; claim is only for observed counts | Counter requires count and total span, but no maximum inter-sample gap (`c1-sample-span-v3.mjs:16-19`); the timer samples the fixed tree (`playwright-firefox-egress-round39.mjs:277-283`). The final sweep runs after browser close and a 600-ms tail (`:329-345`), so it cannot see already-closed sockets. Predicate wording “all observed nonLoopback counts” (`round-40/claims.json:21,25`) limits the assertion; it does not establish comprehensive egress absence between observations. |
| R39 #2 C2 receipt binding/calibration | Not addressed by R40 C1 | No C2 claim is frozen; the round-39 spot-check's C2 defects remain outside this claim (`round-39-verifier-spotcheck.md:38`; `round-40/claims.json:14-27`). |
| R39 #3 quarantine/lesson correction / #4 operator prompt mismatch | Not addressed by R40 C1 | Round-39 spot-check keeps adoption closed and routes the prompt mismatch (`round-39-verifier-spotcheck.md:39-40`); neither is part of C1. |

## Verification gaps and limitations

- No live `measure-c1-round40` run was performed in this review; doing so would invoke Firefox and write production evidence, outside this read-only review scope. Only frozen bytes and committed controls were inspected. The predicate's positive live-run target remains unverified here.
- `lsp` is not mounted: `read xd://lsp` returned `No such tool: xd://lsp`. Therefore no LSP status/references/definition/diagnostics were available; source conclusions above are direct byte/read-based inspection, not LSP semantic proof.
- No tools installed or updated.

VERDICT finding — round-40 C1 fixes the routed sample-span and unavailable-surface counter failures and hardens replay provenance, but the specifically routed process-tree/polling/closed-socket observation limits remain; do not interpret this freeze as comprehensive egress evidence or as a live claim pass.