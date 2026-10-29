# Round 43 C1 residual-model red team

## Counterexample

A local, no-browser, no-prior-run attack makes the frozen counter return `exit 0` with `predicate: true`:

1. Copy the counter byte-for-byte into the assigned scratch directory.
2. Create fresh attacker-owned Ed25519 wrapper and witness keys, a fabricated receipt/witness pair, and a measure record self-signed by the attacker key. Bind the record to the fabricated files and use the real frozen producer digests and pinned Node/Firefox binaries.
3. Spawn the copied counter with fd3/fd4. Sign the counter's fresh challenge with the attacker-owned wrapper key named in the self-signed measure record.

Observed evidence: `counter-self-signed-reach.json`. It records `exitCode: 0`, `predicate: true`, `challengeVerified: true`, `measureSignatureVerified: true`, `witnessAttestationVerified: true`, and `findings: []`. The copied counter, Node, and Firefox hashes equal their frozen pins. The wrapper was not invoked, no browser ran, no prior honest run or process-memory/kernel hook was used, and the synthetic receipt/witness/measure were not committed. Synthetic files and the counter copy were removed from scratch after the test; the evidence receipt was written directly into this seat directory.

## Exact command and output

Setup observed:

```text
mkdir -p /fast/scratch/hyaku/tabi-r43/CritResidualModel /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritResidualModel && node --version && test -r /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox && printf 'firefox-readable=yes\n'
v24.21.0
firefox-readable=yes
```

Attack harness invocation:

```text
S=/fast/scratch/hyaku/tabi-r43/CritResidualModel; trap 'rm -rf -- "$S"' EXIT; node "$S/attack.mjs"
```

Observed stdout:

```json
{"evidencePath":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritResidualModel/counter-self-signed-reach.json","exitCode":0,"predicate":true,"challengeVerified":true,"measureSignatureVerified":true,"witnessAttestationVerified":true,"findings":[],"copyMatchesFrozenCounter":true,"nodeMatchesFrozen":true,"firefoxMatchesFrozen":true,"wrapperInvoked":false,"browserRun":false,"committedArtifacts":false}
```

The child command recorded in the evidence receipt was:

```text
node /fast/scratch/hyaku/tabi-r43/CritResidualModel/counter-copy.mjs /fast/scratch/hyaku/tabi-r43/CritResidualModel/synthetic-receipt.json --measure /fast/scratch/hyaku/tabi-r43/CritResidualModel/synthetic-measure.json (fd3 challenge signed by a newly generated attacker-owned Ed25519 key)
```

Scratch cleanup (run from outside the scratch working directory):

```text
S=/fast/scratch/hyaku/tabi-r43/CritResidualModel; trap 'rm -rf -- "$S"' EXIT; rm -rf -- "$S"; test ! -e "$S" && printf 'scratch-removed=yes\n'
scratch-removed=yes
```

## Evidence and source basis

- Evidence: `.ufo/waves/round-43/w1/CritResidualModel/counter-self-signed-reach.json`.
- The counter verifies the measure signature against `measureDoc.pubkeys.wrapper` (counter lines 203–224), then verifies its challenge against that same caller-supplied public key (lines 244–273). It does not anchor the key to a live wrapper invocation.
- The wrapper does generate a fresh private key and signs its own child counter's challenge (wrapper lines 202–205, 289–305), but its hardcoded counter path (lines 292–295) does not prevent a caller from running an identical, digest-matching counter copy directly.
- Claims C1's full positive predicate requires the wrapper counting command and receipt/witness/measure committed at the measured revision (`claims.json`, `claims[0].predicate`). The tested pair was not committed and the wrapper was not run, so this evidence does **not** satisfy the full positive admission predicate.
- Separately, the frozen residual model and kill rule state that an in-model do-nothing exit-0 reach refuses admission (`claims[0].residualModel` and `claims[0].killRule`). As a conservative negative veto, that clause is independent of satisfying the full positive predicate. This demonstrated counter exit-0 therefore triggers the veto; it is not grounds for admission.

## Axes, verdict, correction

Impacted axes: **coverage** (C1 capability admission) and **calibration** (the counter's challenge/provenance control overstates what its independent invocation proves).

The kill rule is well-posed as a conservative veto when “reach” includes a counter invocation returning 0 with `predicate: true`; the frozen residual-model text supports that reading. It is not the same as satisfying the full claim predicate: uncommitted artifacts do not reach admission. Preserve that distinction in evaluation; do not relabel this counter-only result as a successful C1 measurement.

No frozen claim, counter, wrapper, or pin was changed. Smallest safe action for this wave: apply the existing kill rule and refuse C1 admission, routing this finding to round 44. For a future frozen claim, either explicitly define the kill trigger as any counter-level predicate success and add this self-signed copied-counter test as a control, or make counter acceptance require wrapper-origin provenance that an attacker cannot self-assert. Do not treat a self-signed record plus challenge response as proof that the wrapper ran.

## Limitations

This test intentionally did not run the official measurement wrapper or a browser, and it did not commit the fabricated artifacts; therefore it tests the counter-level in-model reach, not the full counting-command/commit predicate. It did not exercise fake `ROOT` paths, a `TABI_RUN_NONCE` injection, or a challenge race. Source inspection shows the wrapper creates its nonce with `crypto.randomBytes` and overrides the inherited nonce in the scrubbed driver environment, while the counter's challenge is checked only against the public key in its measure document. No external requests or tool installs occurred.

VERDICT finding copied counter accepts attacker-self-signed synthetic artifacts without a browser run