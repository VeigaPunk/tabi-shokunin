# RevC2a — C2 independent re-derivation

**Scope:** Round 37, attempt 1, wave w1; C2 only. Frozen contract: `99437d29de036415a9f2d0524343617a3b19988a` (`claims.json`, C2). Measured honest revision: `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`.

## Results

Ran the frozen v3 bytes (`.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`, SHA-256 `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019`) and frozen v2 bytes (`.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`, SHA-256 `15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764`). Each execution used a clean clone as `--repo`, explicit `TMPDIR=/fast/scratch/hyaku/tabi-r37/w1/RevC2a/tmp`, and the requested `--json` mode.

| Case | Counter | Exit | Predicate / finding |
|---|---|---:|---|
| Honest baseline `ed8ccfc…` | v3 | 0 | `predicate=true`, `admitted=16`, `failing=0`, `survivors=0`, `egressNonLoopback=0`, `receiptFinding=null`, `binding=null` |
| Observed screenshot-digest tamper | v2 | 0 | `predicate=true`, `admitted=16` (legacy hole reproduced) |
| Observed screenshot-digest tamper | v3 | 1 | `predicate=false`, `receiptFinding="run1: observed captureScreenshot.sha256 != transcript first screenshot"` |
| Replace-ref graft | v2 | 0 | `predicate=true`, `admitted=16` (legacy hole reproduced; v2 reads through the graft) |
| Replace-ref graft | v3 | 2 | refuses before evaluation: `refs/replace present in measured clone (refs/replace/88f73cf28e07795427af90edc7e671981d0384a7); refusing` |

The honest result matches the C2 control expectation and the frozen `c2r37-J3-honest-v3.json`. Both attack fixture outcomes match their frozen C2 control receipts. The observed-tamper fixture was committed at `9efcb9d4ad8d8a0d8469f4a7db726b2c83027f57`; the replace fixture retained commit `99437d29de036415a9f2d0524343617a3b19988a` and added the replace ref for receipt blob `88f73cf28e07795427af90edc7e671981d0384a7`. Before its fixture commit, the tamper clone root was verified equal to its fixture directory; both clones were clean after their tree edits/commit. Replace-ref presence was explicitly verified on the graft clone.

## Raw outputs

Raw counter stdout is retained as `honest-v3.stdout.json`, `observed-tamper-v2.stdout.json`, `observed-tamper-v3.stdout.json`, `replace-graft-v2.stdout.json`, and `replace-graft-v3.stdout.json` in this seat directory. Exit codes, stderr, command/revision/repo metadata, counter digest, and parsed summary are retained in corresponding `*.result.json` files; raw stderr is in `*.stderr.txt`. The v3 refusal correctly has empty JSON stdout and its refusal text in stderr.

## Verification limits

Only the assigned C2 honest run and two C2 falsifier pairs were exercised. No additional tool was installed. Scratch fixtures and temporary counter files were removed before completion. No lane files outside this seat directory were changed.

VERDICT ok C2 independently reproduced: honest v3 passes; both v2 attack admissions and both v3 refusals/findings match the frozen claims.
