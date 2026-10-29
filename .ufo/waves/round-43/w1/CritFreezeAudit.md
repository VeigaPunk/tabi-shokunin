# CritFreezeAudit — round 43 freeze/control conformance

**Axis:** calibration  
**Frozen revision:** `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`

## Finding

The frozen claims data itself is conformant: all seven controls named in C1/C2 `beforeState` appear in `controlBindings`; all eight listed control hashes match the frozen bytes; every bound quote is present; and the controls demonstrate the refusal/red/green/type-violation layers they claim. The frozen C2 checker run reports `predicate: true`, `findingCount: 0`.

However, **R5 does not enforce control-reference completeness**. Its code checks only that `controlBindings` exists and has at least five entries, then validates entries already listed. It never parses or cross-checks any `beforeState` text. **[INFERENCE]** A claims revision that omits one beforeState control binding but retains seven valid bindings would evade R5's completeness check; R5 would inspect only the remaining entries. This leaves the same freeze-vs-control defect class capable of recurring, even though this frozen freeze has no omission.

## Evidence and control readout

See [`CritFreezeAudit/evidence.md`](CritFreezeAudit/evidence.md) for the exact read-only commands, outputs, frozen/local hashes, and observed control fields.

- C1: baseline count is `0`; round-42 replay and the synthetic pair are refused; the tampered measure record produces `measure-signature-invalid` and `receipt-binding-mismatch`.
- C2: baseline checker control exits `1`; the V0 probe records r42 green (`exit 0`, zero findings) and v2 refusal by `r1-measure-blob-pin-mismatch`; the tree fixture names `r1a-not-a-blob` in v2 while r42 reports no type-violation finding.
- All quote strings are present in their corresponding control bytes. The additional battery control is bound too, though no beforeState names it.
- The frozen checker source is SHA-256 `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743`; its R5 block is lines 192–201. Search of that source found no `beforeState` reference.

## Impact and correction

Impact is on **calibration**: the current freeze passes, but R5 cannot reliably reject a future incomplete freeze. No frozen claims, counter, or checker bytes were amended. Route the R5 completeness gap as a finding for a later round; the smallest safe follow-up is for the checker to require an explicit expected control-path set to equal `controlBindings` (rather than only validating supplied entries). The omission counterexample was reasoned from frozen source; no mutation test was run.

No tools were installed or updated. Scratch was removed on command exit.

VERDICT finding R5 does not enforce beforeState-to-controlBindings completeness