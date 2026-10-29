# CritC1ReachDirect — C1 direct-invocation hunt

## Result

**Finding on coverage (C1):** an exact-argv direct invocation of the frozen counter exits **0 without launching the measure wrapper, the Playwright driver, or a browser**. The challenge-response is not an invocation-authentication boundary: the measure record supplies the wrapper public key, and a direct caller can create that keypair, sign its own fabricated measure record, then sign the counter's fresh fd3 challenge over fd4 with the corresponding private key. The independently attested witness key is also self-created and accepted.

This is not a harvested run key, process-memory attack, kernel attack, or edit to committed pins/receipts. The fake receipt, witness, and measure record were built only in scratch. No live committed round-43 receipt/witness pair was read or used. No git/jj mutation or tool installation occurred. The counter was copied byte-for-byte to scratch: copied SHA-256 and frozen SHA-256 both `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`. The test used the pinned Node v24.21.0 binary; its SHA-256 matched the frozen Node pin `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c`.

## Key observed outcomes

Full exact argv, raw stdout/stderr, and exit codes are archived in [`attempts.json`](CritC1ReachDirect/attempts.json).

- Ordinary direct counter run with fd3/fd4 closed and dummy `{}` inputs: **exit 1**, `challengeVerified:false`, `challengeError:"EINVAL"`, `predicate:false`.
- Same fully fabricated receipt/witness/measure inputs, still direct counter invocation with fd3/fd4 closed: **exit 1**; both record signatures verified, `findings:[]`, but `challengeVerified:false` and `predicate:false`. This isolates the challenge as the remaining gate.
- Same inputs with fd3/fd4 connected to a small harness that generates its own Ed25519 wrapper and witness keypairs and signs the fresh challenge: **exit 0**. Counter JSON reported `predicate:true`, `findings:[]`, `measureSignatureVerified:true`, `witnessAttestationVerified:true`, `challengeVerified:true`, `challengeError:null`. The harness spawned only the copied counter; it did not invoke either frozen producer or launch a browser.
- The synthetic counter command used the required argv shape: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/hyaku/tabi-r43/CritC1ReachDirect/c1-signature-bound-v5.mjs /fast/scratch/hyaku/tabi-r43/CritC1ReachDirect/fabricated-no-browser.json --measure /fast/scratch/hyaku/tabi-r43/CritC1ReachDirect/fabricated-no-browser-measure.json`.
- The harness ran from a fake root and set `ROOT` and `CLAIMS` to a scratch-only claims file deliberately containing incorrect producer digests and pins. The self-signed synthetic invocation still exited 0. This is consistent with the counter's literal hardcoded `ROOT`/`CLAIMS` constants, not a cwd or environment override.
- `--pins`, `--nonce`, and `--witness` each returned strict-argv **exit 2**. A missing measure path returned **exit 2** (`could-not-evaluate: Cannot read properties of null (reading 'nonce')`). Using the receipt path as the measure path returned **exit 1**. These individual exact commands/results are in the evidence JSON.

## Evidence and model boundary

Evidence: `.ufo/waves/round-43/w1/CritC1ReachDirect/attempts.json` (22,809 bytes; SHA-256 `481b5b7be67e1ba0a11fbc64ede30e72bb70970c09025f6958bf4cabaaab767e`). It records the pinned counter/Node hashes, each direct invocation's argv/cwd/fd setup/exit/raw output, and the no-fd versus self-signed-challenge counter responses. The synthetic producer-shaped fields and process trees were invented, not observed. The Firefox path was only read for the counter's digest check; it was not launched. Scratch was removed in the experiment's Python `finally` block.

The output artifacts are intentionally uncommitted scratch inputs. I did **not** test the separate closure requirement that receipt/measure bytes be committed at the measured revision; no commits are permitted for this seat. The attack does not use any listed exclusion: it creates its own keypairs and synthetic inputs and uses the counter's public fd3/fd4 challenge interface, rather than harvesting a prior run key or attacking wrapper memory/kernel state or committed pins/receipts. The canonical judge should classify this counterexample against the frozen kill rule. No frozen artifact is proposed for amendment.

## Smallest safe correction

Smallest safe correction: keep frozen artifacts untouched and route this evidence to the canonical judge for disposition. For a future freeze, authenticate the ephemeral wrapper key through an authority not supplied by the measure record itself (and bind the witness identity/provenance to that trusted authority), or have a trusted verifier itself control and attest the measurement execution. Merely requiring the strict argv or a fresh challenge is insufficient while the record chooses the key used to authenticate both the record and the challenge.

No tools were installed or updated.

VERDICT finding direct self-signed challenge reaches counter exit 0 with no browser run
