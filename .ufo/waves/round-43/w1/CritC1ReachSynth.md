# CritC1ReachSynth — strongest synthetic pair attack

**Axis:** coverage (C1). C2/calibration was not exercised.

## Counterexample

A self-authored receipt, self-authored witness, and internally consistent Ed25519-signed measure record reached the frozen counter's success exit without invoking `measure-c1-round43.mjs` or the Firefox driver. The harness generated its own wrapper key and witness key, signed the record and witness with those keys, supplied plausible samples/tree/socket summaries, and named the actual pinned Firefox binary path in synthetic roots. Its declared producer digests match the frozen claims; the pinned Node and Firefox binary hashes also match the local files. No browser was started by the harness: it only spawned the frozen counter with the synthetic artifacts.

Exact top-level command (ran from the named scratch directory):

```text
node /fast/scratch/hyaku/tabi-r43/CritC1ReachSynth/attack.mjs
```

The harness ran these counter challenge variants against the same synthetic pair:

| Variant | Counter exit | Predicate | Challenge | Record signature | Witness signature | Findings |
|---|---:|---:|---|---|---|---|
| `paired-key-direct` — harness signed the fresh challenge with the private key that it had used to self-sign the measure record | 0 | true | verified | verified | verified | `[]` |
| `second-process-pipe` — challenge passed through a separate Node responder using that synthetic private key | 0 | true | verified | verified | verified | `[]` |
| `precomputed-zero-challenge` — sent a signature precomputed for 32 zero bytes | 1 | false | invalid (`challenge-signature-invalid`) | verified | verified | `[]` |

The complete counter JSON is preserved in `CritC1ReachSynth/attempt-results.json`; the concise result is in `CritC1ReachSynth/attack-summary.json`. The exact synthetic artifacts are `synthetic-receipt.json`, `synthetic-receipt.witness.json`, and `synthetic-measure.json`; the generator/responder logic is preserved in `synthetic-pair-attack.mjs`. `local-digest-check.json` records the observed pinned executable/producer hashes. `attack-transcript.txt` records the command and raw harness output. The synthetic private key was used from scratch for the second-process test and is not retained in the report evidence.

## Why the challenge wall fails

The counter generates fresh bytes on fd3 and verifies the fd4 signature against `measureDoc.pubkeys.wrapper` (counter lines 244–263). The measure-record signature is also verified against that same record-supplied public key (lines 203–218). Thus an attacker who creates the pair chooses the key that authenticates both artifacts and can answer the fresh challenge; direct invocation is not the only way to pass. A second process can relay the bytes and answer as well. A fixed precomputed signature does not pass, so freshness itself held in that test, but it does not establish provenance of the key.

Other checks did not establish live execution either: witness descendant/overlap checks derive their process graph from signed JSON fields (lines 152–169), and the Firefox pin check hashes the executable at a path supplied in synthetic `owned.roots[].exe` (lines 186–194). The synthetic pair therefore passes while its fake PIDs/tree and claimed browser samples do not correspond to a browser run. This is an in-model do-nothing reach: no prior honest run or harvested run key was needed, and no process-memory/kernel attack was used.

## Impact and smallest safe correction

**Coverage:** the C1 kill rule is triggered by the demonstrated exit-0 do-nothing reach; this result must route as a finding rather than support capability admission. The independent C2 calibration item was not tested.

For this frozen round, preserve the claims/counter bytes and refuse C1 admission. For a future design, challenge verification needs an authenticity source not selected by the candidate measure record, plus evidence tied to an actually supervised pinned-wrapper/driver execution; a fresh challenge signed by a self-selected ephemeral key is insufficient. Do not treat the existing direct-invocation synthetic control as closing this key-substitution case.

## Scope and tooling

Only this report and evidence files in the seat directory were written. Scratch was removed before reporting. No git/jj mutation, browser launch, network access, or tool installation/update occurred; `/home/vgpnk/.omp/agent/RULES.md` was read before the task and no installation was needed.

VERDICT finding Synthetic self-signed pair and live challenge response yield counter exit 0 and predicate true without a browser run.
