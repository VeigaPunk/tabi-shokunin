# MutOwnershipCases — round 40 w1 mutation probe on C1 field enforcement

Seat: MutOwnershipCases (leaf, mutation lane). Date: 2026-10-27.
Freeze commit: 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4 (supersedes prior pre-data freezes). Baseline: a1b1e939048885d2793759b7f49b10c5c820d70d.
Claims read: `.ufo/waves/round-40/claims.json` (C1 predicate, killRule, frozenDigests, controls).

## What was challenged

C1 claims the measured counter enforces, per run: owned tree nonempty, zero survivors, closed fixture port, bound browserVersion, and identical 64-hex firstShotSha256 across both runs. Probe question: does the frozen scorer actually refuse receipts that violate each field (defect coverage), field by field?

## Detector and isolation

- Detector: the frozen counter, executed **in place**, never modified:
  `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` — sha256 `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c`, asserted equal to `claims.frozenDigests` at probe start and re-verified after all runs.
- Same bounded behavioral detector was run on pristine, mutated, and restored fixture bytes. Mutations are one-field-per-fixture JSON edits on **scratch copies**; production tree, counter bytes, and the round-39 source receipt were never written. Scratch root: `/fast/scratch/hyaku/tabi-r40/MutOwnershipCases/` (deleted before yield; evidence copies are in the lane evidence folder).
- Exact invocation pattern (from `evidence/probe.mjs`, `spawnSync` with cwd = scratch):
  `node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs <fixture.json> --nonce <fresh 64-hex nonce>`

## Fixture provenance

Pristine positive built exactly like the frozen selftest's parser-only positive (`scripts/selftest-measure-c1-round40.mjs`): round-39 receipt re-tagged to schema `tabi-pw-firefox-egress-receipt-r40`, `refused=false` top and per run, nonce-bound, samples retimed `start+i*150` (9 and 8 samples → spans 1200/1050 ms), every ss/proc sample and final sweep `ticks=1, nonLoopback=0`, `survivors=0`, `survivorPids=[]`, `portClosed=true`. `owned.tree` (5 pids), `browserVersion "157.0"`, and identical `firstShotSha256 ebfae99c…` come from the real round-39 runs and were asserted well-formed before mutating. Source receipt sha256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`; positive fixture sha256 `76a226ee46fb6e09da49760f00925cfc22ac68b55cf6314aad3b62d78c79f2b7`, nonce `d6b64920de3d48fa8162d26804c2a344a95124a06f62d73c4bef541c01963c76`.

## Observed results (10 counter runs; full stdout preserved verbatim in `evidence/probe-result.json`)

| step | mutation (one field per fixture) | exit | findings observed | verdict |
|---|---|---|---|---|
| baseline-positive | none (pristine) | 0 | [] `predicate=true nonceMatched=true` | pass |
| m1-owned-empty | `runs[0].owned.tree=[]` | 1 | `["run1-owned-empty"]` | killed |
| m2-owned-missing | `delete runs[0].owned` | 1 | `["run1-owned-empty"]` | killed |
| m3-survivors-nonzero | `runs[1].survivors=2` | 1 | `["run2-survivors"]` | killed |
| m3b-survivorPids-nonempty | `runs[1].survivorPids=[424242]` | 1 | `["run2-survivors"]` | killed |
| m4-port-open | `runs[0].portClosed=false` | 1 | `["run1-port-open"]` | killed |
| m5-version-unbound | `delete runs[1].browserVersion` | 1 | `["run2-version"]` | killed |
| m6-shot-hash-diff | run2 `firstShotSha256=f`*64 | 1 | `["shot-hash-diff"]` | killed |
| m7-shot-hash-format | run1 `firstShotSha256="deadbeef"` | 1 | `["run1-shot-hash","shot-hash-diff"]` | killed |
| restored-positive-rerun | pristine bytes re-run | 0 | [] `predicate=true` | pass |

Each mutant was bound to its own fresh 64-hex nonce (listed in `evidence/verdicts.txt`), so every killed verdict shows the field finding as the **sole** finding (`nonceMatched=true` in all runs). Verdict rule: killed = exit 1 + `predicate=false` + every expected finding present; survived = exit 0; anything else inconclusive. m7's second finding is the correct derived cross-run diff, since corrupting run1's hash also makes the two runs differ.

Totals: **8 killed, 0 survived, 0 inconclusive.** No surviving mutant, so no coverage finding against C1 from this probe.

Harness hygiene note: the first probe pass (superseded, output overwritten) bound mutant fixtures to the positive's nonce, so its killed verdicts carried an extra `run-nonce-mismatch` finding; the probe was rerun after fixing nonce binding. Verdict direction was unchanged; the clean run above is the recorded result.

## Restoration evidence

- Counter after-run sha256 `0b452eac…` == frozen digest (before == after).
- Round-39 source receipt after-run sha256 `e894f1d5…` == probe-time hash (read-only; untouched).
- Positive fixture bytes sha256 `76a226ee…` unchanged from before the mutant series; re-run exits 0.
- No git/jj commands mutating anything; no commits; no agents; no external sites; no tool installs (tooling authorization exercised: none).

## Limitations

- Scorer-level probe only: `measure-c1-round40.mjs` wrapper behaviors (live Firefox driver invocation, wrapper-side nonce generation, output-path freshness refusal) were not exercised by this seat; those are covered by the frozen controls (`round39-replay-v3`, `synthetic-replay-and-counter-selftest-v3`) and the live measurement seat.
- `survivors` and `portClosed=false` mutants are receipt-field mutations, not live orphan processes or open sockets; they test the counter's refusal logic, not the driver's measurement fidelity.
- The wrapper's own `run-nonce-mismatch` / `fresh-run-nonce-mismatch` path was covered indirectly (all fixtures nonce-bound here; nonce refusals covered by frozen controls), not re-tested.

## Reproduce

```
node .ufo/waves/round-40/w1/MutOwnershipCases/evidence/probe.mjs   # scratch copy preserved in evidence/
node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs .ufo/waves/round-40/w1/MutOwnershipCases/evidence/m1-owned-empty.json --nonce 3974aecc06346b79cc3b0ef2c993141b575e493b60358eac4718cdd9b3186e6c   # expect exit 1, ["run1-owned-empty"]
```

Evidence folder: `.ufo/waves/round-40/w1/MutOwnershipCases/evidence/` (probe.mjs, probe-result.json, verdicts.txt, positive.json, m1–m7 fixture files).

VERDICT ok — empty owned tree, missing owned tree, survivors, portClosed=false, unbound browserVersion, and differing first-shot hashes are each refused by the frozen counter with the exact field finding (8/8 killed, 0 survived, baseline and restored positives pass).

Report: .ufo/waves/round-40/w1/MutOwnershipCases/report.md
