# CritC1Witness — witness forgery attack

**Axis:** coverage (C1). **Result:** finding. Frozen files were not changed.

## Finding

The witness layer is correctly self-consistent, but its signatures are not rooted in a trusted witness or wrapper identity. A post-run substitution against the genuine measure record is refused. However, the frozen counter accepts a fully fabricated receipt, a self-signed fake witness, and a self-signed measure record when the caller generates its own wrapper key and answers the counter's fresh challenge with that same key. The counter returned `exit 0`, `predicate: true`, and no findings; the harness launched no browser and did not observe a live process tree. This is an in-model do-nothing reach, so C1 must not be admitted under the frozen kill rule.

## Source evidence / trust boundary

- `scripts/measure-c1-round43.mjs:124-162`: the witness child generates its own Ed25519 pair (line 137), constructs the signed value as `{rootPid, nonce, startedTicks, endedTicks, samples}` (lines 157-160), and emits its public key and signature. The private half stays in child memory. The wrapper receives the child process handle, later reads the witness JSON, and includes `witnessDoc.attestation.publicKey`—not a private key—in the signed measure record (`:165-172`, `:255-257`, `:265-286`). Thus the wrapper learns the witness **public half only** through the output document.
- `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs:131-170`: the counter rebuilds the same canonical signed object (`:146`) and verifies the digest and signature using the witness document's own `attestation.publicKey` (`:147-149`). It also checks the witness nonce, process-tree relations, and overlap.
- The measure signature and challenge use `measureDoc.pubkeys.wrapper` (`:203-224`, `:244-263`). The witness-key equality check at `:224` and byte hashes at `:219-223` protect an existing signed record against file replacement. But the counter has no external trust anchor for `pubkeys.wrapper` or `pubkeys.witness`: the public keys come from the same attacker-controlled artifacts being evaluated. Producer-file digests are pinned; ephemeral wrapper-key provenance is not. The fd3/fd4 challenge proves possession of the key named in that record, not that the key belongs to the frozen wrapper.

## Exact attempts and observed output

The test ran from `/fast/scratch/hyaku/tabi-r43/CritC1Witness` with:

```sh
S=/fast/scratch/hyaku/tabi-r43/CritC1Witness; trap 'rm -rf -- "$S"' EXIT; node "$S/attack.mjs"
```

The harness copied the counter to scratch without modifying it. Its SHA-256 was `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`, exactly the frozen counter digest. It did not launch Firefox or the Playwright driver.

1. **Genuine post-run record, substituted witness.** I copied the existing receipt and its genuine signed measure record into scratch, replaced only the adjacent witness with a newly generated self-consistent witness key/signature, and invoked the scratch counter without fd3/fd4. The record's original byte bindings and witness public key were left unchanged. Exact counter command and full stdout are in `w1/CritC1Witness/post-run-substitution-counter.json`; the replacement witness is `w1/CritC1Witness/post-run-substitute-witness.json`.

   Observed: exit `1`; `measureSignatureVerified: true`; `witnessAttestationVerified: true`; findings `witness-binding-mismatch` and `witness-pubkey-mismatch`; `challengeVerified: false`, `challengeError: "EINVAL"` (no challenge channel). This confirms the normal post-run substitution is detected by the hash and public-key bindings.

2. **Self-issued matching artifacts and challenge.** I then constructed a new receipt with synthetic PIDs/samples, a fake witness with ten synthetic samples signed by a fresh key, and a matching measure record signed by a different fresh key. The synthetic receipt uses the pinned Firefox executable path and pinned producer digests but contains no observed browser data; the witness's node and Firefox PIDs are fabricated. The harness answered the counter's 32-byte fd3 challenge over fd4 with the self-issued wrapper key. It did not launch any browser or observe a live process tree.

   Exact counter command and full stdout: `w1/CritC1Witness/synthetic-acceptance-counter.json`. The exact accepted inputs are preserved as `synthetic-acceptance-receipt.json`, `synthetic-acceptance-witness.json`, and `synthetic-acceptance-measure.json` in the same evidence directory. Observed: exit `0`, `predicate: true`, `findings: []`, `measureSignatureVerified: true`, `witnessAttestationVerified: true`, `challengeVerified: true`, and 32 challenge bytes. Counter-copy and artifact hashes are in the output evidence. This shows the acceptance is not anchored to the real wrapper invocation; self-asserted keys can complete both signature checks and the challenge.

## Smallest safe correction and limits

For this frozen round, apply the existing kill rule: refuse C1 admission and route the finding; do not amend the counter, claims, or pins. Any future freeze needs an authentication path that binds the ephemeral wrapper key to a trusted wrapper invocation, rather than trusting a key declared in the measure record. The fd3/fd4 challenge alone is insufficient. A standalone witness-file substitution while retaining the genuine measure record did **not** pass; the finding is the self-issued matching-record path.

This was a local, scratch-only counter attack. The synthetic artifact construction read the existing receipt only to obtain its public pinned Firefox executable path; it did not reuse its receipt data, witness key, or wrapper key in the accepted synthetic pair. No production or sibling repository files were changed. No git/jj operations, network requests, agent dispatches, or tool installs/updates were performed. Scratch was removed before completion.

**Evidence paths** (all under `.ufo/waves/round-43/w1/CritC1Witness/`):
- `post-run-substitution-counter.json`
- `post-run-substitute-witness.json`
- `synthetic-acceptance-counter.json`
- `synthetic-acceptance-receipt.json`
- `synthetic-acceptance-witness.json`
- `synthetic-acceptance-measure.json`

VERDICT finding counter accepts a self-issued fake receipt and witness with exit 0 absent any browser run
