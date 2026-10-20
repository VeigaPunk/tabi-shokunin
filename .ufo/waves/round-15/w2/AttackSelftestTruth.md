# AttackSelftestTruth — round15 wave2 (author-side critic, not a non-author verifier)

Scope: C2 actual-finding collection versus synthesized expected ids, and whether the expected mirrors are independent of the determinism helper. This is a source-reading review only. I ran no gate, test, selftest, counter, witness, or browser. The only code I executed was two JS regex literals evaluated with `node -e` on hand-written strings. That call imported no lane code. Tools installed or updated: none.

## Attacked bytes

- HEAD = snapshot `revision` `72dcf031b9da24796b718517ea575f21e4f7caae` (baseline `7054a5e…`). The four snapshot files are clean in the worktree, and I recomputed their sha256 locally:
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`
  - `scripts/check-user-round-contract.mjs` `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
  - `.ufo/waves/round-15/metadata-witness.py` `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`
- Committed assets at 72dcf03: `corpus/evidence/round-15/metadata/expected-fixtures.json` and `mirror-contract.json`.
- Docs are uncommitted worktree edits (SKILL/QUALITY/README/SOURCES and an untracked `corpus/lessons/round-15.md`). I read them as drafts.
- **Time limit:** `corpus/evidence/round-15/metadata-differential.json`, the C2 receipt that `measure.mjs:151` reads, is absent. The lesson's "Execution evidence" section is still a placeholder (lesson:57-59). I make no outcome claims. Every finding below is a source proposition about how the pinned bytes must behave.

All paths below are under `/home/vgpnk/Projects/shokunin/tabi-shokunin/`. CAM = `scripts/check-aria-metadata.mjs`, M = `.ufo/waves/round-15/measure.mjs`, W = `.ufo/waves/round-15/metadata-witness.py`.

## Defects

### D1 — High — selftest summary grammar cannot satisfy C2 measure
- CAM:2837-2840 emits `ARIA_METADATA_SELFTEST verdict=clean cli_cases=35 helpers=3`.
- M:887 requires `/^ARIA_METADATA_SELFTEST verdict=clean cases=(\d+)\b/m`.
- A literal regex check against that exact line returned `null`. The first wave's own expectation agrees with the emitted form (`w1/MetadataEnforce.md:222`).
- Result: M:895 always adds `self_test_not_green`, so C2 `count` stays 0 (M:1107).
- **Smallest correction:** choose one authority. Either the checker emits `cases=<cliCases.length>` as the first token after `verdict=clean` (CLI cases only, never helpers, so no inflation), or M:887 accepts `cli_cases=`. Assert this from a recorded line, never a hand-written one.

### D2 — High — "expected_finding" and "finding" mean different things, so measure's agreement check fires on PASS rows
- What prints:
  - `finding=` is genuinely observed: the first non-pass finding id from the child payload (CAM:2690-2693). The first wave's echo defect is gone.
  - `expected_finding=` is `testCase.expectedFindings[0].id` (CAM:2699). That entry is often a **pass-status assertion**, not the expected first failure.
- What measure checks: M:910-911 adds `self_test_finding_mismatch` whenever the two differ on a PASS row.
- PASS rows that must disagree, from source:
  - Six exit-0 rows: `clean-perworker-listening`, `node-observed-recorded`, `sidecar-valid-accepted`, `sidecar-auto-detect-check-input`, `sidecar-advisory-text-accepted`, `mirror-authentic-clean`. Each expects a pass-status id but observes `none`.
  - `sidecar-wrong-direction`: expects `R14-ARIA-SIDECAR-CORRECTION-01`, but observes `R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
    - `runCheck` puts post-evaluation findings before sidecar findings (CAM:1418).
    - The case's own `expectedFailedFindings` lists `R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
  - `invalid-node-minimum`: expects `R14-ARIA-NODE-MINIMUM-01`, but observes `R14-ARIA-NODE-01`.
    - `R14-ARIA-NODE-01` is pushed first (CAM:557).
    - It fails because the worker file records `runtime.node` 26.12.0 while the receipt says 18.20.0 (deriveNode CAM:534).
  - [INFERENCE] `empty-perworker` and `nonboolean-listening-after` may also disagree if the worker-proof finding fails before cleanup. I did not verify this.
- Result: C2 measure fails even with a fully green selftest.
- **Smallest correction:**
  1. Add a literal `expectedFirstFinding` per case to `expected-fixtures.json` (`none` for exit 0).
  2. Make `evaluateOutput` assert observed first non-pass == that literal.
  3. Print it as `expected_finding=`.
  4. Keep `expectedFindings` only for status assertions.

### D3 — Medium — witness rows' expected id is synthesized from the actual payload
- CAM:2699 falls back `?? payload?.redFinding`. Both witness cases have `expectedFindings: []`.
- The witness payload has no top-level `findings` (CAM:2941-2988), so observed = `payload.redFinding` too.
- `expected_finding` therefore equals `finding` by construction, and M:910 is vacuous for these rows.
- The ok bit itself is grounded: CAM:2615 and 2623 assert the literal `R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
- **Correction:** remove the `payload?.redFinding` fallback and put a literal expected id in the expectations.

### D4 — High — the mirror differential's actual finding can never be collected unambiguously
- Any sidecar refusal also fails the aggregate `R14-ARIA-SIDECAR-ACCEPTED-01` (CAM:1369-1378). Each W mutant (W:40-51) therefore has failed set {`R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` or `R14-ARIA-SIDECAR-QUALIFICATION-01`, `R14-ARIA-SIDECAR-ACCEPTED-01`}.
- Measure's extraction (`namedFinding`, M:410-420) has no path that yields one id:
  - `findingFromValue` (M:366-370) sees 2 failed ids, and the full `findings` list has many ids, so it returns null.
  - Payload re-parse gives the same null.
  - Stdout fallback: CAM:3284 prints `ARIA_METADATA findings A,B`. M:340's `\s*$` fails at the comma.
  - The check line has `findings=` not `finding=`, so M:339 does not match.
- My literal regex check returned `tokens []` and `failedIds 2`.
- Result: M:984 adds `mirror_finding` for all 9 records, and C2 count stays 0.
- **Correction:** pick one authority.
  - Either the checker's red check line emits `finding=<first non-aggregate failed id>`,
  - or W records the exact expected id per field and measure asserts exact failed-set equality, treating `R14-ARIA-SIDECAR-ACCEPTED-01` as the aggregate.

### D5 — Medium — wrong-cause refusals satisfy both the witness and measure (the C1 lesson class, recurring in C2)
- W:51 passes on `any('SIDECAR' in x for x in failed_ids(after))`. `R14-ARIA-SIDECAR-ACCEPTED-01` satisfies that for **every** refusal cause.
- M:171 `MIRROR_FINDING` includes `/sidecar/`, so `R14-ARIA-SIDECAR-ACCEPTED-01` or `R14-ARIA-SIDECAR-BINDING-01` would count as "mirror context" at M:987.
- Counterexample: a cleanup-mirror mutant refused only by `R14-ARIA-SIDECAR-BINDING-01` (for example a binding regression) gets `pass:true` in W, and would satisfy M if D4 were fixed by "first failed id".
- **Correction:** per record, require the exact failed set {`R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`, `R14-ARIA-SIDECAR-ACCEPTED-01`} for `cleanup.*` and {`R14-ARIA-SIDECAR-QUALIFICATION-01`, `R14-ARIA-SIDECAR-ACCEPTED-01`} for `qualification.*`, plus the matching `detail.problems` entry (`cleanup.<key>` / `qualification.<key>`). Apply this in both W and M.

### D6 — Medium — the pinned C2 receipt producer omits fields measure requires (timing-bounded)
- W's result (W:64-68) has no `selfTest`, and `positive` is the raw `run()` record with no `sidecar {path,sha256}`.
- Measure requires both: `malformed_self_test` (M:879-881) and `sidecar_shape` (M:1048-1050).
- The receipt is not committed yet, so this is a statement about what the pinned producer can emit.
- Any hand-added `selfTest` would be an unpinned post-process.
- A selftest run inside W's temp root would hit the blocked branch: that root lacks `corpus/evidence/round-15/metadata/*`, so CAM:2279-2318 exits 1.
- **Correction:**
  - W captures `node scripts/check-aria-metadata.mjs --self-test` at the repo root at the measured revision (exit and stdout).
  - W adds `positive.sidecar = {path: SIDECAR, sha256}`.
  - Re-pin W's digest.

### D7 — Medium — the "independent" expected mirrors are the emitter itself; the determinism helper cannot detect dependence
- Shared function:
  - `buildSidecar` emits its mirrors from `expectedMirrorValues` (CAM:1469, 1560-1577).
  - `evaluateSidecar`'s oracle is the same function with the same inputs (CAM:1315).
  - Helper `derive-and-mirror-helper` recomputes the same function on the same `perWorker` and `derived.cleanup` (CAM:2760-2772).
- Its failure label `derive:mirrors_not_independently_derived` (CAM:2777) can only fire on a copy error in CAM:1560-1577. A pass is not evidence of independence.
- That label is false provenance against draft QUALITY20 ("same-function comparison proves determinism only").
- Draft lesson:37 claims "independent literal expectations and the immutable historical fixture are the separate oracle". However:
  - `expected-fixtures.json` contains **zero** literal mirror values (grep count 0 for `allClosed|everyProof|perWorkerCount|summaryServerOk`).
  - The only literal mirror constants are deliberately false mutants (CAM:2439-2466, 1973-1983).
  - The fixture sha pin of `sidecar-valid` was generated by the same function, so it is a regression lock, not independence.
- The real cross-implementation anchor is the round-14 `corrected.json`, accepted by `mirror-authentic-clean`. Its mirrors are all-true with N=1. The canonical receipt has exactly 1 perWorker proof, all true (checked by reading the JSON).
- Every fixture receipt also has ≤1 proof, and `FIXTURE_PROOF` is all-true (CAM:188-196, 2082-2091).
- Counterexample mutation class ([INFERENCE] from source; not executed). Either of these changes emitter and checker together:
  - replace `every` with `some` at CAM:994-997, or
  - swap the closed/refused mappings at CAM:1001-1002 and 1013-1014.
- Why the selftest would not notice:
  - `sidecar-valid` bytes are unchanged (single all-true proof), so the fixture pins hold.
  - `mirror-authentic-clean` still accepts.
  - The mutant fixtures still differ from the expected values.
  - So I expect all 35 CLI cases and 3 helpers to stay PASS.
- The CAM:991 claim "empty or incomplete proof sets cannot support any all-true mirror" is also untested: no sidecar case runs against `receipt-empty` or `receipt-nonboolean`.
- **Correction:**
  1. Add a 2-proof mixed fixture receipt (for example proof B `closed:false, refusedAfterClose:true`) with **literal** expected `cleanup`/`qualification` objects in `expected-fixtures.json`.
  2. Assert that emitted mirrors equal those literals.
  3. Assert that an all-true-mirror sidecar on that receipt is refused with an exact failed set.
  4. Add one empty or incomplete receipt sidecar case.
  5. Rename the helper problem to `derive:mirror_copy_mismatch`.
  6. Correct lesson:37 to name only the oracles that actually exist.

### D8 — Low — helper lines print synthesized exits and an unevaluated finding id
- CAM:2343-2352 labels the static asset-versus-code table compare `finding=R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`. Helper `actual_exit` values are computed from booleans (CAM:2347, 2782) and printed at CAM:2857-2861.
- No counter impact: M:277-283 excludes these lines because they lack `name=`/`case=`.
- **Correction:** print `finding=helper:<id>` and `actual_exit=n/a`.

## What I could not falsify (holds on source)
- Tamper rows: the observed id is genuinely collected. The status is `could_not_evaluate`, which is non-pass, at CAM:2691.
  - The exact id set is enforced (CAM:2589-2595).
  - Mismatch label, actual sha and anchor sha are literal-asserted (CAM:2668-2681).
  - Measure's tamper-arm extraction yields the single id `snapshot_tampered` (M:370).
- Mirror-refusal CLI rows bind exact failed sets (`expectedFailedFindings`, CAM:2596-2605).
- The emitted mirror key set is enforced through `sidecar-valid-accepted`'s field-set check (CAM:975-979), so a new emitted mirror without a contract entry would fail.

## Impacted axes
- C2 calibration: D1, D2, D4 and D6 each independently keep the measured count at 0 with these pinned bytes. D5 and D7 bear on whether a future 1 would be truthful.
- Operability / provenance truth: D3, D7 (label) and D8.

## Commands L1 should run after any correction (I ran none of these)
```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-aria-metadata.mjs --self-test            # inspect the summary token and expected_finding vs finding per row
python3 .ufo/waves/round-15/metadata-witness.py > /tmp/r15-c2.json  # check failed-set per mirror record
node .ufo/waves/round-15/measure.mjs 72dcf031b9da24796b718517ea575f21e4f7caae --claim C2  # expect the D1/D2/D4/D6 errors at current bytes
```
