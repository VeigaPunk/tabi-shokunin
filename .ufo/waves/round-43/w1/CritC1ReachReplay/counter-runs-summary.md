# Direct counter run summary

Pinned Node: /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node (sha256 7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c)
The counter ran from scratch with close_fds=True and no fd3/fd4 challenge descriptors. Full argv/stdout/stderr are in counter-runs.json.

## r43 fresh pair direct
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r43/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r43/measure.json`
- Exit: 1
- Note: Direct invocation; close_fds=True and no fd3/fd4; pinned Node binary.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=True`, `witnessAttestationVerified=True`
- Findings (0): (none)

## r43 one-byte tamper
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r43-tampered/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r43-tampered/measure.json`
- Exit: 1
- Note: Only receipt byte 47 changed 0x33->0x32; original witness/measure; pinned Node.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=True`, `witnessAttestationVerified=True`
- Findings (2): schema, receipt-binding-mismatch

## r39 missing matching measure
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r39/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r39/no-r39-measure.json`
- Exit: 2
- Note: r39 committed revision contains receipt only; matching measure path absent; this is not evaluable as a matched pair.
- stdout: ``
- stderr: `could-not-evaluate: Cannot read properties of null (reading 'nonce')`

## r39 cross-paired diagnostic
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r39/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r43/measure.json`
- Exit: 1
- Note: Diagnostic only: committed r39 receipt evaluated against r43 measure; no r39 measure/witness pair exists.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=True`, `witnessAttestationVerified=False`
- Findings (56): schema, run-nonce-mismatch, env-check-unreadable, env-check-forbidden, env-check-execargv, env-check-nonce, run1-sample-span, run1-sample1-tree-empty, run1-sample1-no-firefox-exe, run1-sample2-tree-empty, run1-sample2-no-firefox-exe, run1-sample3-tree-empty, run1-sample3-no-firefox-exe, run1-sample4-tree-empty, run1-sample4-no-firefox-exe, run1-sample5-tree-empty, run1-sample5-no-firefox-exe, run1-sample6-tree-empty, run1-sample6-no-firefox-exe, run1-sample7-tree-empty, run1-sample7-no-firefox-exe, run1-sample8-tree-empty, run1-sample8-no-firefox-exe, run1-sample9-tree-empty, run1-sample9-no-firefox-exe, run1-zero-ss-observation, run1-zero-proc-observation, run1-root-exe, run1-summary-ss-mismatch, run1-summary-proc-mismatch, run2-sample-span, run2-sample1-tree-empty, run2-sample1-no-firefox-exe, run2-sample2-tree-empty, run2-sample2-no-firefox-exe, run2-sample3-tree-empty, run2-sample3-no-firefox-exe, run2-sample4-tree-empty, run2-sample4-no-firefox-exe, run2-sample5-tree-empty, run2-sample5-no-firefox-exe, run2-sample6-tree-empty, run2-sample6-no-firefox-exe, run2-sample7-tree-empty, run2-sample7-no-firefox-exe, run2-sample8-tree-empty, run2-sample8-no-firefox-exe, run2-zero-ss-observation, run2-zero-proc-observation, run2-root-exe, run2-summary-ss-mismatch, run2-summary-proc-mismatch, witness-unreadable, firefox-bin-unbound, receipt-binding-mismatch, witness-binding-mismatch

## r40 committed historical record
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r40/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r40/measure.json`
- Exit: 1
- Note: Committed historical receipt+measure extracted from 22883df61d8deb55e03a1afebc81f7290c3a3cfc; direct invocation, no fd3/fd4; pinned Node.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=False`, `witnessAttestationVerified=False`
- Findings (77): schema, measure-nonce-shape, run-nonce-mismatch, env-check-unreadable, env-check-forbidden, env-check-execargv, env-check-nonce, run1-sample1-tree-empty, run1-sample1-no-firefox-exe, run1-sample2-tree-empty, run1-sample2-no-firefox-exe, run1-sample3-tree-empty, run1-sample3-no-firefox-exe, run1-sample4-tree-empty, run1-sample4-no-firefox-exe, run1-sample5-tree-empty, run1-sample5-no-firefox-exe, run1-sample6-tree-empty, run1-sample6-no-firefox-exe, run1-sample7-tree-empty, run1-sample7-no-firefox-exe, run1-sample8-tree-empty, run1-sample8-no-firefox-exe, run1-sample9-tree-empty, run1-sample9-no-firefox-exe, run1-sample10-tree-empty, run1-sample10-no-firefox-exe, run1-sample11-tree-empty, run1-sample11-no-firefox-exe, run1-sample12-tree-empty, run1-sample12-no-firefox-exe, run1-sample13-tree-empty, run1-sample13-no-firefox-exe, run1-zero-ss-observation, run1-zero-proc-observation, run1-root-exe, run1-summary-ss-mismatch, run1-summary-proc-mismatch, run2-sample1-tree-empty, run2-sample1-no-firefox-exe, run2-sample2-tree-empty, run2-sample2-no-firefox-exe, run2-sample3-tree-empty, run2-sample3-no-firefox-exe, run2-sample4-tree-empty, run2-sample4-no-firefox-exe, run2-sample5-tree-empty, run2-sample5-no-firefox-exe, run2-sample6-tree-empty, run2-sample6-no-firefox-exe, run2-sample7-tree-empty, run2-sample7-no-firefox-exe, run2-sample8-tree-empty, run2-sample8-no-firefox-exe, run2-sample9-tree-empty, run2-sample9-no-firefox-exe, run2-sample10-tree-empty, run2-sample10-no-firefox-exe, run2-sample11-tree-empty, run2-sample11-no-firefox-exe, run2-sample12-tree-empty, run2-sample12-no-firefox-exe, run2-sample13-tree-empty, run2-sample13-no-firefox-exe, run2-zero-ss-observation, run2-zero-proc-observation, run2-root-exe, run2-summary-ss-mismatch, run2-summary-proc-mismatch, witness-unreadable, firefox-bin-unbound, measure-schema, measure-signature-invalid, receipt-binding-mismatch, witness-binding-mismatch, wall-clock-inconsistent, gate-contaminated

## r41 committed historical record
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r41/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r41/measure.json`
- Exit: 1
- Note: Committed historical receipt+measure extracted from 9b6de3a19de11abdb80e82a1310abc64a40215bb; direct invocation, no fd3/fd4; pinned Node.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=False`, `witnessAttestationVerified=False`
- Findings (8): schema, measure-nonce-shape, run-nonce-mismatch, witness-unreadable, measure-schema, measure-signature-invalid, receipt-binding-mismatch, witness-binding-mismatch

## r42 committed historical record
- Command: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r42/receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachReplay/run-c3f4inex/cases/r42/measure.json`
- Exit: 1
- Note: Committed historical receipt+measure extracted from 227956616c5413f280cc43cdcf0e6bc8f30da8b6; direct invocation, no fd3/fd4; pinned Node.
- `predicate=False`, `challengeVerified=False`, `challengeError=EINVAL`, `measureSignatureVerified=False`, `witnessAttestationVerified=False`
- Findings (8): schema, measure-nonce-shape, run-nonce-mismatch, witness-unreadable, measure-schema, measure-signature-invalid, receipt-binding-mismatch, witness-binding-mismatch
