# Mutation probe: counter_digest_mismatch

- Author: `TabiR16.MutCounterDigestMismatch` (author-side falsification evidence, not non-author certification).
- Date: 2026-10-20.
- Assigned snapshot: `b444ca8e024f386124418169e8e400221524bba3`.
- Claim/axis: C1 / operability.
- Attack-item verdict: **HOLDS — mutant killed**. The selftest went red, and the unchanged C1 behavioral detector returned `c1_binding_contracts: 0` on the mutant inputs. Both returned to their pristine results after exact restoration.
- Probe axes: reason-set discrimination; C1 behavioral-count fidelity; scratch isolation and exact restoration. These are probe dimensions, not additional round claims.

## One mutant

Only the scratch gate's v1 mismatch lookup at original line 471 was changed:

```diff
-    const atMeasured = blobSha256(repo, measured, counterPath);
+    const atMeasured = blobSha256(repo, atRev, counterPath);
```

This plausible wrong-revision lookup weakens the code emitting `counter_digest_mismatch`: it compares the recorded digest with the target revision's counter rather than the measured revision's counter. A digest incorrectly pinned to the later counter now escapes that specific reason. No selftest, vocabulary, expected result, other gate branch, or lane source was changed. The legacy mismatch branch was intentionally untouched.

Expected detector: `counter_digest_mismatch` must FAIL its exact reason-set assertion even though `counted_input_changed` still makes the fixture gate exit 1. Thus a status-only fixture assertion would be insufficient. The full selftest must exit nonzero; C1 must count 0 rather than accepting the red selftest.

## Isolation and snapshot binding

Commands executed:

```sh
mktemp -d /tmp/tabi-r16-counter-digest-mismatch.XXXXXX
# Actual directory: /tmp/tabi-r16-counter-digest-mismatch.pPtUl9
cp -- /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /tmp/tabi-r16-counter-digest-mismatch.pPtUl9/
```

The named snapshot blobs were opened with `git show b444ca8e024f386124418169e8e400221524bba3:<path>`. SHA-256 and direct byte comparisons confirmed that the lane gate, selftest, and counter exactly matched that snapshot before probing. The real round-15 measurements also matched the snapshot.

| Input | SHA-256 at snapshot / pristine |
| --- | --- |
| `scripts/check-measurement-binding.mjs` | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` |
| `scripts/selftest-measurement-binding.mjs` | `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae` |
| `.ufo/waves/round-16/measure.mjs` | `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9` |
| `corpus/evidence/round-15/measurements.json` | `1689f75f69f29fba5c4c8f088720b10ff8fa23fc5f496aecc86fc7649588b8e5` |

## Same direct selftest: pristine, mutated, restored

Exactly this command was run in each state, with the scratch directory as cwd and a 120-second outer bound:

```sh
node /tmp/tabi-r16-counter-digest-mismatch.pPtUl9/selftest-measurement-binding.mjs --gate /tmp/tabi-r16-counter-digest-mismatch.pPtUl9/check-measurement-binding.mjs
```

| State | Process exit | PASS / total | Actual final stdout line |
| --- | --- | --- | --- |
| Pristine | 0 | 43 / 43 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |
| Mutated | 1 | 41 / 43 | `MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13` |
| Restored | 0 | 43 / 43 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |

Pristine and restored stdout both included:

```text
case=counter_digest_mismatch_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counted_input_changed,counter_digest_mismatch PASS
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counted_input_changed,counter_changed_since_measurement PASS
```

Mutated stdout included exactly these failing case lines:

```text
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counted_input_changed FAIL
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counted_input_changed,counter_changed_since_measurement,counter_digest_mismatch FAIL
```

The second failure is the complementary consequence of the same wrong-revision lookup: an honest measured digest with a changed target acquires a spurious mismatch reason. All other cases passed, including the same-shape mismatch control and the legacy mismatch case. Pristine and restored stderr were empty. Mutated stderr was:

```text
FAIL_DETAIL case=counter_digest_mismatch MEASUREMENT_BINDING verdict=failed claims=1 bound=0 | finding claim=C1 reason=counted_input_changed detail=paths=measure.mjs
FAIL_DETAIL case=counter_changed_since_measurement MEASUREMENT_BINDING verdict=failed claims=1 bound=0 | finding claim=C1 reason=counted_input_changed detail=paths=measure.mjs | finding claim=C1 reason=counter_changed_since_measurement detail=counter=measure.mjs recorded=177ecc15776fe9d4b1cb2f8f10343f6dee9f161e83ca4ac3fd66f6d1957f7148 blob_at_at=4c45673561fd17d83b7dfb079c336570681a339626f8fe3fa35becd7365e00f3 | finding claim=C1 reason=counter_digest_mismatch detail=counter=measure.mjs recorded=177ecc15776fe9d4b1cb2f8f10343f6dee9f161e83ca4ac3fd66f6d1957f7148 blob_at_measuredRevision=4c45673561fd17d83b7dfb079c336570681a339626f8fe3fa35becd7365e00f3
```

## C1 counter behavioral checks

The production counter reads committed blobs, not scratch/worktree bytes. No mutant commit was created. Therefore the normal CLI at the original snapshot was **not** presented as a mutant run.

Instead, `/tmp/tabi-r16-counter-digest-mismatch.pPtUl9/probe-c1.mjs` read the counter directly from the named snapshot using `git show`, checked its SHA-256, and executed its **unchanged `countC1(rev)` function body**, together with its original constants, `ENV`, SHA helper, and set-comparison helper. Its only input seam supplied the gate and selftest bytes from this probe's scratch directory and the authentic round-15 measurements blob from the snapshot. `ROOT` was the real lane for the read-only legacy-history check. There was no replacement result parser, changed oracle, mocked child execution, or altered counter assertion: `countC1` actually spawned the selftest and the real-history legacy gate in all three states.

Counter-body extraction boundaries were `function countC1(rev) {` through immediately before `function sourceRows(text) {`. The extracted body SHA-256 was constant in all runs:

```text
66a184ed265802b368d1429518e0e935b34e8ec8660b876932cc905c2060332e
```

Exactly this command was run once in each state, with a 55-second outer command bound:

```sh
node /tmp/tabi-r16-counter-digest-mismatch.pPtUl9/probe-c1.mjs /tmp/tabi-r16-counter-digest-mismatch.pPtUl9
```

Observed detector outputs (the `selftest` and `failures` objects below are verbatim fields from its JSON stdout):

### Pristine

```json
{"c1_binding_contracts":1,"selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},"failures":[]}
```

### Mutated

```json
{"c1_binding_contracts":0,"selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":2,"clean":21,"missingVocab":[]},"failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch","2 case lines not exact PASS"]}
```

### Restored

```json
{"c1_binding_contracts":1,"selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},"failures":[]}
```

All three additionally returned the same real-history check:

```json
{"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"}}
```

Thus the observed C1 behavior is **1 → 0 → 1**. The mutant is rejected by selftest exit, summary, and exact-case checks in `measure.mjs:152-154`, not by a missing vocabulary entry or a legacy-history failure. `missingVocab` remains empty because the unmodified legacy case still exercises `counter_digest_mismatch`.

## Exact restoration evidence

The one changed line was restored with the inverse surgical edit before the restored detectors ran.

| Bytes | Before | Mutated | Restored |
| --- | --- | --- | --- |
| Scratch gate SHA-256 | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` | `b1e2fb37e7cb65d65fa2fdc322a12a4f712cbebc516bedee24253779ca03b2d8` | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` |
| Scratch selftest SHA-256 | `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae` | unchanged | `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae` |

After restoration, direct byte equality against the snapshot returned `true` for both scratch files. It also returned `true` for the lane gate, lane selftest, and lane counter, with the same SHA-256 values listed above. The lane was read-only throughout except for this assigned report; no commits, background jobs, sibling edits, external source reopens, REA calls, or separate agent runtime were used.

Runtime tools: Node `v24.21.0`; Git `2.56.0`. No tool installs or updates.

This result is scoped to the single wrong-revision mismatch mutant. It does not certify every possible mismatch defect or judge admission of the round.
