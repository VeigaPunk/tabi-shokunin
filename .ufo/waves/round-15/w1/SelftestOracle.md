# SelftestOracle — metadata selftest: same-function determinism vs independent expectations

Seat: TabiR15.SelftestOracle (critic, read-only, author-side). No gate, selftest, counter, suite or browser was executed. No source edits. No tools installed or updated.
Basis: `scripts/check-aria-metadata.mjs` at HEAD `7054a5e1068538349b4dbb0d291c2fe8643802f2` (unmodified in the worktree when read, tag FB3C); `corpus/evidence/round-14/aria-metadata/expected-fixtures.json`; and the recorded selftest stdout `corpus/evidence/round-14/aria-metadata/executions/selfTest.json`, read from committed bytes rather than re-run. Routed item: `corpus/lessons/round-14-verifier-spotcheck.md:185` (item 2) and `:186` (item 3).

## Axes
- **C2 enforcement truth**: does a selftest red follow from a broken mirror or tamper contract?
- **Oracle independence**: are expectations committed literals, or outputs of the function under test?
- **Isolation/precision**: does each case observe exactly its intended reason through a CLI subprocess?
- **Count honesty**: does the reported `cases=N` match what was independently checked?

## Precise counts (current, HEAD)
| Item | Count | Anchor |
|---|---|---|
| Reported selftest cases | 16 = 15 expectation-file CLI cases + 1 in-process helper | `:1792-1864`, `:1866-1894`; stdout `cases=16` |
| Distinct CLI argv among the 15 | 14 (`clean-perworker-listening` and `node-observed-recorded` both run `--receipt @receipt-green --pin @pin`) | expected-fixtures.json:3-50 |
| Generated fixtures | 13 (pin, malformed, 6 receipts, 5 sidecars) | `:1685-1763` |
| Digest-pinned fixtures | 8. The 5 sidecar fixtures (`sidecar-valid/baddigest/wrongto/exactnode/auto`) are unpinned | expected-fixtures.json:271-312; loop `:1765` iterates only expectation keys |
| Receipt-level finding IDs (`--check` without sidecar) | 18. Negative-tested: 6 (INPUT, CLEANUP-SUMMARY, PERWORKER, COUNT, LISTENING-AFTER, NODE-MINIMUM). Never asserted as fail: 12 (PIN, ANCHOR, SOURCE, MANIFEST, WORKER-SET, WORKER-PROOF, PROOF, CLOSED, REFUSED, SERVEROK, NODE-01, NODE-RECORDED) | evaluateAll `:826-845` |
| Sidecar finding IDs | 9. Negative-tested: 3 (BINDING, CORRECTION, NODE-CLAIM). Never: SIDECAR-01 (unreadable), SCHEMA, PROVENANCE, QUALIFICATION, RESIDUAL | `:853-1109` |
| CLI finding IDs outside check (CHECK-INPUT-01, DERIVE-OUT-01, DERIVE-REFUSED-01) and usage | 0 cases | `:2209`, `:1326`, `:1351` |
| Exit-2 cases | 0 (every expectedExit is 0 or 1) | expected-fixtures.json |
| Mirror fields emitted by buildSidecar but unchecked by evaluateSidecar | 6 `cleanup.*` (`:1263-1270`); 3 `qualification.everyProof{ListensBefore,Closed,RefusedAfterClose}` (`:1276-1278`); `corrections[0].derived` (`:1229`). Also unchecked: `execution.source`, `wave`, `claim`, `source.spec/manifest.sha256`, and both `rule` strings | evaluateSidecar reads no `sidecar.cleanup` |
| Fail-set observation per case (recorded stdout) | Single target: old-contradiction (1/18). Target plus the expected ACCEPTED cascade: bad-digest and exact-node (2/27). Confounded: missing-summary 9, empty 11, nonboolean 4, node-minimum 2 (also NODE-01), wrong-direction 4, malformed 17 | executions/selfTest.json JSON line |

## Findings

**F1 — the derive case only checks that the function agrees with itself (strongest counterexample).**
`:1866-1884` compares `buildSidecar(ctx)` with `buildSidecar(ctx)` and with `sidecar-valid.json`, which was itself written by `buildSidecar` on the same ctx at `:1735-1741`. Counterexample [INFERENCE from source, not executed]: change `:1267` to `allNotListeningAfter: !allValuesOk`, or `:1276` to `everyProofListensBefore: false`.
- evaluateSidecar never reads those fields, so `sidecar-valid` is still accepted.
- The derive comparison still matches.
- No sidecar digest is pinned.

Result: `ARIA_METADATA_SELFTEST verdict=clean cases=16`, and 0 of 16 cases detect the change. Only a repo-path `--derive` against committed `corrected.json` would differ (exit 2 `existing_bytes_differ`), and that is outside the selftest.

The same case reports `finding=R14-ARIA-SIDECAR-ACCEPTED-01` with exit 0/1 assigned by the selftest itself (`:1888-1890`). Nothing evaluated that finding, so the provenance is false.

**F2 — echoed finding field.** `:1920` prints `expected_finding=${entry.finding} finding=${entry.finding}`, and `entry.finding` is the expected ID (`:1859`). The observed finding is never printed. On witness lines the same field is instead `payload.redFinding`, an observed value. One field therefore carries two different provenances.

**F3 — superset matching.** `:1846-1852` checks only that the expected IDs are present with the expected status. Exit-1 cases never assert the absence of other failures. Example: `invalid-node-minimum` also fails NODE-01, because the worker file records node 26.12.0 and the fixture says 18.20.0. A regression that fails NODE-MINIMUM for a different reason would still pass.

**F4 — case count not bound.** `results.length >= 4` (`:1898`) gates the verdict. Truncating `expected-fixtures.json` to 3 cases yields `clean cases=4`. Neither the expectations file digest nor its case count is pinned by the checker; only round-14 author reports record `19339f3e…f342`. The fixture loop (`:1765`) also accepts generated fixtures that have no expectation.

**F5 — mutation cases are not isolated.** `sidecar-wrongto` (`:1749-1751`) changes `corrections[0].to`, `.value` and `correction.corrected` together. The `correction.*` mirror checks (`:993-998`) therefore have no single-field case. The observed fail set has 4 findings (CORRECTION, RESIDUAL, LISTENING-AFTER, ACCEPTED).

**F6 — the tamper contract cannot be tested as the selftest is structured.** Every finding status is pass/fail (`pushFinding :154`), and anchor/source mismatches become exit-1 fails (`:735-757`, `:613-645`). Child processes run with cwd ROOT (`:1795`) and read ROOT-bound manifest, spec, config and worker bytes (`:565`, `:640-641`, `:781`). An isolated fixture cannot tamper an authenticated snapshot without mutating the repo. The only tamper-like condition reachable from `/tmp` is `anchored_*_bytes_at_noncanonical_path` (`:739-743`), and no case covers it.

**F7 — wrong formula behind a qualification field.** `buildSidecar :1276` sets `everyProofListensBefore` from `allValuesOk` (all proofs pass) rather than from `listeningBefore`. If the new mirror check compares that field against `cleanupDerived.allProofsPass`, it reuses the emitter's own formula and checks only that the emitter agrees with itself.

## Smallest safe corrections (sent to TabiR15.MetadataEnforce)
1. Replace or relabel the derive helper.
   - Commit literal `sha256`/`bytes` for all 5 sidecar fixtures in the new round-15 expectations.
   - Commit literal expected mirror values derived by hand from `FIXTURE_PROOF :103-111` (one worker): cleanup `{perWorkerCount:1, allClosed:true, allRefusedAfterClose:true, allNotListeningAfter:true, derivedListeningAfter:false, summaryServerOk:true}`; qualification `{proofCount:1, allProofsComplete:true, allProofsSupportCorrection:true, everyProofListensBefore:true, everyProofClosed:true, everyProofRefusedAfterClose:true, everyProofNotListeningAfter:true}`.
   - If a determinism check remains, label it determinism-only, give it no finding ID, and keep it out of the CLI-case count.
2. Enforce mirrors by recomputing from raw `perWorker` predicates, not from `allProofsPass`.
3. Add one single-field mutation case per mirror field, each expecting exit 1 and the exact `{SIDECAR-<mirror finding>, SIDECAR-ACCEPTED}` fail set.
4. Commit an exact expected fail set per case and compare it for equality.
5. Print the observed fail set and status, and keep `expected_*` separate from the observed fields.
6. Replace `>= 4` with equality to the committed case count, and require generated fixture names to equal the expectation keys.
7. Tamper cases:
   - Build a mkdtemp mirror tree (receipt, pin, manifest, spec, config, workers, round-14 `corrected.json`) and copy the script byte-identically to `<tmp>/scripts/`; ROOT is derived from the script location at `:48`. Assert the copy's sha256 equals the running script. This adds no CLI/env root input, which keeps the `:61` invariant.
   - Untampered controls must reproduce exit 1 `{CLEANUP-LISTENING-AFTER}` and exit 0 with `accepted=true` for the corrected sidecar.
   - Flipping one byte in any one of receipt, pin, manifest, spec, config or worker must give exit 2 `snapshot_tampered`, with no ACCEPTED pass and no semantic pass/fail verdict.
   - Add one negative control: a semantically invalid but untampered fixture still exits 1.

## Commands for L1 after integration (not run here)
- `node scripts/check-aria-metadata.mjs --self-test` — expect `verdict=clean` and a case count equal to the committed number. There must be zero `result=FAIL` lines and at least one exit-2 `snapshot_tampered` case.
- Mutation probe in a scratch copy only: apply F1's mutation to a copy of the script and run its `--self-test`. It must be red after the fix; today it is clean [INFERENCE].
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` must stay exit 0 / accepted. `node scripts/check-aria-metadata.mjs` must stay exit 1 `R14-ARIA-CLEANUP-LISTENING-AFTER-01`. Original receipt/pin bytes must stay unchanged (`b458b351…`, `4d894756…`).

## Impacted axes
calibration (C2 enforced contract), operability (selftest precision). No coverage, browser or scalar inflation is implied. All claims here are from source and committed bytes. Runtime outcomes are labelled [INFERENCE].
