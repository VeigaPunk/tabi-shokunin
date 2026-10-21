# ReviewNonce — round21 per-case nonce and current-run echo

## Finding

**High — C1 evidence is replayable, and the counter does not require the nonce to be echoed by the observed page/response.**

**Falsifiable failure shape:** replace the fixed round21 runtime evidence paths in a candidate revision with a complete previously valid `receipt.json`, all 12 case JSON files, and their HTML fixtures from a run using the same producer/source/note blobs. The stored hashes and internal fields still agree, but nothing in the input distinguishes that prior run from the current one. Separately, a mismatched page nonce or `toolResponded` payload can be made self-consistent with the `after` summary and evidence digest; the counter does not assert that either value equals the case nonce. This is a source-level finding; I did not run the counter or a mutation.

**Evidence:**

- The runtime creates a nonce with `randomUUID()` separately inside the case loop and copies it into the fixture/evidence and receipt (`scripts/webmcp-lifecycle-round21.mjs:100,107-114,172`). It passes that nonce as invocation input except for the explicitly invalid-input case (`:153`). The fixture puts the nonce in page state and in its response value (`:64,71`). The receipt has no independently supplied run nonce or run challenge; `startedAt` is producer-authored metadata (`:100`).
- The counter checks only within-receipt uniqueness, receipt/evidence identity, fixture inclusion and digests (`.ufo/waves/round-21/measure-c1.mjs:43-55`). It checks invocation input and command/result identity (`:58-62`), but for page events it only requires one `toolInvoked` with the invocation ID (`:63-65`). It never compares that event's input, `toolResponded` payload, or `pageObservations[].value.nonce` to the case nonce. It compares receipt summaries to those same evidence fields (`:66-71`), which checks consistency, not a live echo or freshness. No independent run challenge is read in `evaluate` (`:21-75`).
- The selftest has a duplicate-nonce mutation (`.ufo/waves/round-21/selftest-c1.mjs:34`) and a summary-only response mutation (`:39-50`), but no mismatched page/response echo or complete prior-bundle replay case.
- This exact replay distinction was called out in r19: the replay probe requires a nonce independent of the replayed receipt and a current-run page observation (`.ufo/waves/round-19/w1/ReviewC2Contract.md:19-23`); the plan requires replaying the old record under a different nonce (`.ufo/waves/round-19/PLAN.md:123-128`). The r19 critic also states that a fresh nonce alone does not authenticate a producer's current-run echo (`.ufo/waves/round-19/w1/CriticC2Operability.md:25-29`). Round17's success predicate does correlate its nonce through invocation input, tool events, page execution and the loopback ledger (`scripts/webmcp-invoke-round17.mjs:993-1027`), but its random per-case nonce does not independently prevent a full-record replay. Round20's snapshot review cautions that timestamps cannot prove who captured a snapshot or when (`.ufo/waves/round-20/w1/ExecFrozen.md:5`); `startedAt` is therefore not an adequate replay discriminator.
- The existing `na-requestsubmit.json` does contain a concrete sample where its invocation input, `toolResponded.output.nonce`, and page-observation nonce agree. That demonstrates the producer can record such an echo in one case; it does not make the counter require it across the case set.

**Minimum acceptance:** bind the run to a fresh challenge supplied by an independent execution controller, not recovered from the receipt under review; retain the raw challenge-bearing invocation and a page observation/response that echoes it; have the counter compare the raw and observed values against that independent challenge while retaining unknown statuses as observed. Add a replay falsifier that supplies a complete earlier receipt/evidence set under a different challenge and is rejected. This preserves the finite-observation scope and does not require predicting statuses.

The per-case UUID generation and the counter's duplicate check are present; they do not address this current-run/replay defect.

## Verification gaps and limits

- No `lsp` device/route is exposed in this session, so I could not query LSP status, references, definitions, or diagnostics. Targeted source reads support the finding; grep was used only to locate historical material, not as semantic proof.
- Round21-specific producer/counter files were absent from the inspected `BuildRuntime` and `BuildCounter` clone paths; no waiting or edits were done. I reviewed the current lane files and retained records instead.
- No build, test, counter execution, or browser run was performed. A targeted `git diff` against baseline for the three current producer/counter paths returned no tracked diff; this report therefore cites the available current source and evidence, not a nonempty diff.

Report: `.ufo/waves/round-21/w1/ReviewNonce.md` (relative to lane root).