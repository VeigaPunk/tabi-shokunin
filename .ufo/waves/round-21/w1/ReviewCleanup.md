# ReviewCleanup — round 21

## Axes
- Complete fixed-12 acquisition and per-case browser closure evidence.
- Completeness of the browser process set used by `browserClosed`.
- Server cleanup and error-path termination.

## Current acquisition evidence

`history/index.json:15-19` classifies `runtime-execution-final.json` as the current qualified acquisition and names the canonical producer/output relocation. `runtime-execution-final.json:2-18` records the baseline revision, producer SHA-256 `847d046710a0dd5e61d966f4cb985052bca1966c75481a16d9cc931aa3a786d4`, exit 0, all 12 fixed case summaries, and `browserClosed:true, serverClosed:true`. The current `corpus/evidence/round-21/runtime/receipt.json` has the expected 12 case IDs, invocation IDs, finite observations, and the same cleanup booleans.

I inspected the browser-close fields in all twelve case evidence files under `corpus/evidence/round-21/runtime/`: each reports `contextClosed:true`, a nonempty `browserPidsBefore`, `browserPidsAfter:[]`, and no blocked requests or downloads. This is evidence that the processes in each recorded pre-close PID list were gone in this acquisition; it does not establish that the lists include every browser subprocess (Finding 1). The server bit is set after `server.close`'s callback succeeds and `server.listening` is false (`scripts/webmcp-lifecycle-round21.mjs:193-202`); the receipt stores the resulting boolean.

## Findings (severity order)

### P2 — `browserClosed` can miss browser subprocesses created after its sole PID snapshot

**Evidence:** `scripts/webmcp-lifecycle-round21.mjs:44-58` constructs a process list and returns the root-profile PIDs plus descendants found in that one scan. The only call is immediately after persistent-context launch (`:118-123`), before fixture navigation (`:149`) and subsequent scenario work. Teardown checks only `alive(evidence.browserPidsBefore)` and stores that subset at `:181-189`; it never refreshes the owned set. `receipt.cleanup.browserClosed` is then set from case count alone (`:192`), after per-case checks over the same subset.

**Falsifiable failure shape:** a Chromium renderer/utility child is spawned after the `:122` snapshot, then remains alive after `context.close()`. Since its PID is absent from `browserPidsBefore`, `browserPidsAfter` stays empty and the per-case guard can pass; after twelve such cases the receipt can claim `browserClosed:true` despite a surviving run-owned process. The current successful capture did not demonstrate this failure, but its empty-after lists only attest to the captured PIDs.

**Minimum acceptance:** collect and retain run-owned process identities after the page/scenario work and through teardown, including descendants created after launch; fail the closure proof if any owned identity remains. Derive `browserClosed` from those per-case closure proofs rather than the case count, and retain the final process-set evidence in each case artifact.

### P2 — a rejected or hung `context.close()` can prevent server closure and the receipt

**Evidence:** the per-case `finally` awaits `context.close()` without a timeout at `scripts/webmcp-lifecycle-round21.mjs:180-186`. If that rejects, later PID/evidence steps in that block are skipped. The outer `finally` retries the same unbounded close at `:193-194` before reaching `server.closeAllConnections()` and awaited `server.close()` at `:195-197`, then receipt persistence at `:198-202`. A rejection on the retry therefore skips server shutdown and receipt writing; a hang blocks them indefinitely. This conflicts with cleanup-on-error. The earlier r19 validator declared bounded context/server cleanup windows (`.ufo/waves/round-21/clones/BuildRuntime/scripts/webmcp-validation-round19.mjs:59-63`); that is historical precedent only, not current round21 evidence.

**Falsifiable failure shape:** make the per-case `context.close()` reject and the outer retry also reject, or leave either close pending. The outer cleanup then never reaches server closure, and no final receipt with honest false/unknown cleanup state is written.

**Minimum acceptance:** bound browser close observation, record any close failure, and put server shutdown/receipt finalization on an independent unconditional cleanup path so browser failure cannot skip them. Report browser closure false when it cannot be proved, while still attempting and recording server closure.

## Residual risk and verification gaps

- No browser, experiment, tests, build, or counter was run for this review. The current acquisition was read only; its successful 12-case result is not a reproduction of either failure shape.
- The r17 probe explicitly recorded post-shutdown profile-matching survivors (`.ufo/waves/round-17/probes/invoke-lifecycle.mjs:294-317`). Round20's lifecycle note is expressly source-only and supplies no new runtime witness (`.ufo/waves/round-20/w1/ScribeLifecycle.md:5,61`); it is not closure evidence.
- No LSP device/status endpoint is mounted here (`read xd://lsp` reported no such tool; `read xd://lsp/status` reported no LSP doc topics). Consequently, references/definition/diagnostics were unavailable; no grep output is used as semantic proof.
