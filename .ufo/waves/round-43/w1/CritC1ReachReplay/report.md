# CritC1ReachReplay — C1 replay/rescoring classification

**Axis:** coverage (C1). C2/calibration was not exercised. Frozen claims/counter/producer bytes were not changed; no browser run, Git/jj mutation, commit, network access, or tool install occurred. `RULES.md` was read; no install/update was needed.

## Commands and observed results

Exact argv, cwd, stdout, stderr, and exit codes for every run are preserved in `counter-runs.json`; `counter-runs-summary.md` provides the exact rendered commands and parsed findings. The frozen v5 counter was extracted from `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` and run from scratch with the pinned Node v24.21.0 binary (SHA-256 `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c`). All direct invocations used `close_fds=True`, so fd3/fd4 challenge descriptors were absent.

| Probe | Exit / findings | Classification |
|---|---|---|
| Unmodified r43 receipt + witness + signed measure, extracted from commit `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` | **1**; `findings: []`, `predicate:false`, `challengeVerified:false`, `challengeError:EINVAL`; measure and witness signatures both verified | Passive direct replay is refused solely by the in-invocation challenge. The authenticated bytes otherwise validate. |
| One-byte receipt tamper (schema suffix byte 47 changed `0x33`→`0x32`; witness and measure unchanged) | **1**; `schema`, `receipt-binding-mismatch`; measure and witness signatures still verify; challenge absent | Exact-byte binding is load-bearing against receipt-byte substitution; challenge independently blocks direct replay. |
| r39 receipt with its matching historical measure | **2**, `could-not-evaluate: Cannot read properties of null (reading 'nonce')` | The r39 committed revision has no matching measure record or witness, so a matched-pair rescore is unavailable. A separate diagnostic cross-pair with the r43 measure exits **1** with 56 findings (including schema/nonce, sample/tree, witness, and byte-binding failures); it is explicitly not a matched historical pair. |
| r40 receipt + r40 measure | **1**, 77 findings, including `schema`, missing v5 nonce/env/tree checks, `witness-unreadable`, `measure-schema`, `measure-signature-invalid`, receipt/witness binding failures, and `gate-contaminated` | Legacy measure/receipt and missing witness do not satisfy v5. |
| r41 receipt + witness + measure | **1**, 8 findings: `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `witness-unreadable`, `measure-schema`, `measure-signature-invalid`, `receipt-binding-mismatch`, `witness-binding-mismatch` | Legacy formats/signatures are rejected; challenge also fails. |
| r42 receipt + witness + measure | **1**, same 8 findings as r41 | The r42 committed record is still the older r41 measure schema; no v5 signature/binding or challenge acceptance. |

The old-round inputs were extracted with `git show` from their recorded commits; exact blob IDs and SHA-256 values are in `input-provenance.txt`. The first generic-`node` diagnostic invocation was discarded after its runtime did not match the pin; the recorded runs above use the pinned absolute Node binary.

## Load-bearing refusals and counterexample

For the replay family actually run here, no direct invocation exited 0. Receipt-byte binding catches tampering; old round schema/signature/binding checks refuse the r39-r42 artifacts; and the direct r43 replay is stopped by the challenge channel. However, the challenge does **not** authenticate who owns the key: the counter verifies the challenge against `measureDoc.pubkeys.wrapper`, which is supplied by the candidate measure record, and verifies that record with the same self-selected key.

That provenance gap is demonstrated by existing local C1 evidence from the parallel synthetic-reach review: `CritC1Witness/synthetic-acceptance-counter.json` records counter **exit 0**, `predicate:true`, empty findings, verified measure and witness signatures, `challengeBytes:32`, and `realBrowserRunsLaunchedByHarness:0`; `CritC1Witness.md` describes the self-issued artifacts and challenge response. `CritC1ReachDirect.md` independently records the same no-browser, self-signed challenge route. These are scratch-only synthetic artifacts, not my replay inputs, and I did not rerun that separate attack. They require neither a prior honest run nor a process-memory/kernel attack, so they are an in-model do-nothing counter reach and trigger the frozen C1 kill rule. The direct challenge refusal observed in my replay tests is therefore not load-bearing against a caller that self-issues the measure/witness keys.

## Claim-level commit condition

No replay run here reached counter exit 0. The authentic r43 receipt, witness, and measure blobs coexist at candidate revision `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`; the signed record's receipt/witness hashes match those committed blobs. The receipt and witness first appear in that commit; the measure record already existed in its parent. The frozen C1 `measuredRevision` remains `null`, and the signed measure record persists `driverExit:0` but no `counterExit` or `predicate`. Thus co-committed bytes alone do not establish a claim-level successful score, and the direct rescore remains exit 1. The scratch-only synthetic exit-0 evidence is not itself a claim-level admission because it is not committed at a measured revision; nevertheless it independently satisfies the kill rule's do-nothing-reach condition. I do not infer an unpersisted counter result for the original wrapper run.

## Impact and smallest safe correction

**Impact:** C1 coverage/capability admission only; C2 calibration is unaffected by these probes. For this frozen round, preserve the artifacts and apply the existing kill rule to the demonstrated synthetic reach rather than amend the claim/counter. For a future freeze, anchor wrapper and witness key provenance in an independent trusted execution/verifier authority and bind it to observed wrapper/driver execution; a fresh challenge signed by a key selected in the same untrusted record is insufficient.

**Limitations:** r39 has no committed matched measure/witness, so its native attempt is unevaluable; the cross-pair result is diagnostic only. This seat tested direct replay/tamper and classified existing local synthetic evidence; it did not run the browser or independently regenerate that synthetic attack.

Evidence files (all in this seat directory): `counter-runs.json`, `counter-runs-summary.md`, `input-provenance.txt`.

VERDICT finding Self-issued synthetic C1 artifacts answer the fresh challenge and reach counter exit 0 without a browser run, triggering the frozen do-nothing kill rule.
