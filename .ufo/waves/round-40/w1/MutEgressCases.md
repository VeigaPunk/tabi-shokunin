# MutEgressCases — round 40, wave 1, attempt 2 (milestone: mutation)

Seat: `MutEgressCases` (leaf, no subagents). Date: 2026-10-27.
Lane item: mutation-test ss/proc `nonLoopback` fields independently at one sample and at final sweep; remove each surface; require every unavailable/nonzero case to fail closed; scratch-only JSON copies.

## Frozen bytes under test

Working tree at HEAD `c925d9230c3f7908152fad7bc0f0dd1cdd9af45f` (post-freeze dispatch commit); `git status --porcelain` clean for all four frozen files. Digest equality with `.ufo/waves/round-40/claims.json` `frozenDigests` is the binding check:

| File | sha256 | matches claims.json |
|---|---|---|
| `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` (detector) | `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` | yes |
| `scripts/measure-c1-round40.mjs` | `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735` | yes |
| `scripts/selftest-measure-c1-round40.mjs` | `5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82` | yes |
| `scripts/playwright-firefox-egress-round39.mjs` | `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b` | yes |

No git/jj mutation was performed (read-only `rev-parse`/`status` only). No tool installs. Production tree, fleet, siblings untouched: reads only.

## Method

Detector = the frozen counter `c1-sample-span-v3.mjs <file> --nonce <64-hex>` (exit 0 + `predicate:true` = pass; exit 1 = fail closed). Its relevant contract: `usable(x)` requires a truthy object with `unavailable!==true`, finite `ticks>0`, finite `nonLoopback`; otherwise `*-unavailable`, and any available surface with `nonLoopback!==0` yields `*-egress`. Either must fail the run.

- **Pristine (baseline):** synthetic positive built from `corpus/evidence/round-39/playwright-egress/receipt.json` (read-only source) with the selftest recipe (schema `tabi-pw-firefox-egress-receipt-r40`, fresh random 64-hex nonce `0c075a21…f747`, refused=false, sample times re-spaced to start+i·150 ms → spans 1050 ms on 9/8 samples, all ss/proc `unavailable=false, ticks=1, nonLoopback=0`, survivors 0, portClosed true). Written only to scratch `subject.json`.
- **Mutants:** each applied independently to a fresh `structuredClone` of pristine, written to the same scratch path, counter run, then overwritten by the next.
- **Restore:** exact pristine byte string rewritten to `subject.json`; sha256 re-verified; counter rerun.

Runner: archived at `.ufo/waves/round-40/w1/MutEgressCases/mutrun.mjs`; machine output at `.ufo/waves/round-40/w1/MutEgressCases/results.json`; pristine positive at `.ufo/waves/round-40/w1/MutEgressCases/pristine-synthetic-positive.json` (sha256 `218b6aca806fc6f192d0f76c7c393385a12bcf4dc0424ab36d59f84be1195e94`). Invocation: `node mutrun.mjs` (scratch cwd), runner exit 0. (This file is a copy of `.ufo/waves/round-40/w1/MutEgressCases/report.md`, the canonical lane report.)

## Baseline (required pass)

`node <ROOT>/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs subject.json --nonce <0c075a21…f747>` → **exit 0**, `predicate:true`, `findings:[]`, `receiptSha256 218b6aca806fc6f192d0f76c7c393385a12bcf4dc0424ab36d59f84be1195e94`. Baseline passed, so mutant verdicts are attributable.

## Mutants (11) — all KILLED, 0 survived

| # | Mutant (independent point) | Expected finding | Observed findings | exit | Verdict |
|---|---|---|---|---|---|
| 1 | ss `nonLoopback=1` at run1 sample1 | `run1-sample1-ss-egress` | exactly that | 1 | killed |
| 2 | ss `nonLoopback=1` at run2 sample4 | `run2-sample4-ss-egress` | exactly that | 1 | killed |
| 3 | ss `nonLoopback=1` at run1 final sweep | `run1-final-ss-egress` | exactly that | 1 | killed |
| 4 | proc `nonLoopback=1` at run2 sample8 | `run2-sample8-proc-egress` | exactly that | 1 | killed |
| 5 | proc `nonLoopback=1` at run2 final sweep | `run2-final-proc-egress` | exactly that | 1 | killed |
| 6 | ss replaced by `{ticks:0,nonLoopback:0,unavailable:true}` at run1 sample3 | `run1-sample3-ss-unavailable` | exactly that | 1 | killed |
| 7 | ss key deleted at run2 sample5 | `run2-sample5-ss-unavailable` | exactly that | 1 | killed |
| 8 | proc replaced by `{ticks:0,nonLoopback:0,unavailable:true}` at run1 final | `run1-final-proc-unavailable` | exactly that | 1 | killed |
| 9 | proc key deleted at run2 final | `run2-final-proc-unavailable` | exactly that | 1 | killed |
| 10 | entire ss surface deleted from run1 (9 samples + final) | 10 × `run1-*-ss-unavailable` | exactly those 10 | 1 | killed |
| 11 | entire proc surface deleted from both runs (9+8 samples + 2 finals) | 19 × `*-proc-unavailable` | exactly those 19 | 1 | killed |

No unexpected findings in any case; `predicate:false` in every mutant; every unavailable/nonzero case **failed closed** (exit 1). Mutant 1 file bytes `995271199a48dcd78f4afa792c65b7cfa41f4aa8c5c28abdde5df24b236d0e40` (= counter's own `receiptSha256` for that run — detector hash agrees with mine).

## Restoration evidence

- Bytes before (pristine): `218b6aca806fc6f192d0f76c7c393385a12bcf4dc0424ab36d59f84be1195e94`
- Bytes after restore (same path, exact pristine string rewritten): `218b6aca806fc6f192d0f76c7c393385a12bcf4dc0424ab36d59f84be1195e94` — **identical**
- Detector rerun on restored bytes: **exit 0**, `predicate:true`, `findings:[]`, `receiptSha256` `218b6aca…` (matches).
- Production source receipt `corpus/evidence/round-39/playwright-egress/receipt.json` never written; all copies lived in `/fast/scratch/hyaku/tabi-r40/MutEgressCases/` (deleted before yield).

## Findings / limitations

- No coverage gap found in the probed slice: the counter's `usable()` gate kills every nonzero-egress and every unavailable/removed ss/proc surface, at sample level, final-sweep level, and whole-surface level, independently per run. No mutant survived; nothing to escalate as a finding.
- Probe is parser-level on a synthetic positive (selftest-equivalent recipe); it does not invoke the live Firefox driver, per leaf bounds. It therefore verifies the counting logic's fail-closed behavior, not the driver's emission of these fields.
- Point mutants cover samples 1/3/4/5/8 and both runs' final sweeps; the whole-surface removals (10, 11) additionally cover every remaining sample index. An exhaustive per-index sweep of all 17 sample slots × both fields was not run.
- Other predicate axes (span, nonce binding, survivors, port, firstShot) were not mutated — out of this seat's item.
- Scratch `/fast/scratch/hyaku/tabi-r40/MutEgressCases/` removed after evidence copy; no `/tmp` usage.

VERDICT ok — 11/11 mutants killed (5 nonzero nonLoopback, 4 point-unavailable/removed, 2 whole-surface removals), 0 survived, 0 inconclusive; pristine baseline and byte-identical restoration both pass the frozen counter; every unavailable/nonzero case failed closed with exactly the expected finding.
