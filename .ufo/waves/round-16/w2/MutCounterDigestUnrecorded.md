# Round 16 wave 2 — counter_digest_unrecorded mutation probe

**Verdict: HOLDS — mutant killed.** The selftest rejects omission of the modern-manifest missing-digest finding. The named snapshot's unchanged C1 behavioral function also counts **0** for the mutant, versus **1** for both pristine and restored bytes.

Author-side mutation evidence only; not non-author certification. One mutation, no contract change or integration.

## Scope and axes

- Snapshot: `b444ca8e024f386124418169e8e400221524bba3`.
- Axes: mutation locality, behavioral detection, counter-check fidelity, and exact restoration/lane isolation.
- Scratch directory: `/tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5`.
- Runtime: pre-existing Node `v24.21.0`. No tools installed or updated.
- Lane source remained read-only. This Report is the only lane file written. No delegation, background jobs, REA tools, or manual Git commits.

## Snapshot identity and setup

Ran at `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```sh
git diff b444ca8e024f386124418169e8e400221524bba3 -- scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs .ufo/waves/round-16/measure.mjs
```

Observed: exit 0, no output. The three worktree source files matched the named snapshot at setup.

Exact scratch creation/copy commands:

```sh
mktemp -d /tmp/tabi-r16-counter-digest-unrecorded.XXXXXXXX
# stdout: /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/
cp /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs.pristine
cp /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs.pristine
```

## Mutant and expected detector

Deleted exactly the finding-emission statement at original gate line 469, using the edit tool on the scratch gate only:

```diff
   if (recorded === null) {
-    add(REASON.counterDigestUnrecorded, `counter=${counterPath} sha256 absent or not 64-hex`);
   } else {
```

This models an omitted validation finding: an otherwise valid manifest without `counter.sha256` is incorrectly accepted. The reason vocabulary, legacy-mode emission, other validations, selftest, and counter were untouched.

Expected detector: selftest case `counter_digest_unrecorded` (selftest lines 234–235) requires exit 1 and exactly that reason; its same-shape positive control requires exit 0/no reasons. Omitting the finding should fail the negative case, not its positive control.

## Identical bounded selftest on all three byte states

The following exact command was run once pristine, once mutated, and once restored, each with a 55-second tool deadline and cwd `/tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5`:

```sh
node /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs --gate /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs
```

| State | Process exit | Cases passing | Actual summary |
| --- | ---: | ---: | --- |
| Pristine | 0 | 43/43 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |
| Mutated | 1 | 42/43 | `MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13` |
| Restored | 0 | 43/43 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |

Pristine and restored target-case output:

```text
case=counter_digest_unrecorded_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_digest_unrecorded expected_exit=1 actual_exit=1 expected_reasons=counter_digest_unrecorded actual_reasons=counter_digest_unrecorded PASS
```

Mutated target-case output and failure detail:

```text
case=counter_digest_unrecorded_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_digest_unrecorded expected_exit=1 actual_exit=0 expected_reasons=counter_digest_unrecorded actual_reasons=- FAIL
FAIL_DETAIL case=counter_digest_unrecorded MEASUREMENT_BINDING verdict=clean claims=1 bound=1
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13
```

Every other case passed in the mutant run. This is a behavioral kill, not a syntax failure or baseline failure.

## Would the C1 counter also count 0?

**Yes, observed at function level with the named snapshot's unchanged checks.** The scratch-only adapter `/tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/count-c1-scratch.mjs` reads the counter with `git show b444ca8e024f386124418169e8e400221524bba3:.ufo/waves/round-16/measure.mjs`, extracts its exact constants/environment/helpers and `countC1` function, and executes that function unchanged. Only the `blob` input provider substitutes the two scratch gate/selftest files; real round-15 measurement bytes still come from the named snapshot and legacy Git queries use the real lane read-only. The adapter's `spawnSync` is the actual Node child-process function, so both the selftest and real-history gate execute, rather than returning canned results.

Counter source SHA-256: `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`.

Adapter SHA-256: `bdaee36e935a63a5ec214bfbfb8c06b0deb3d97ab74230ee96cb93b48bcbce48`.

The following exact command was run on pristine, mutated, and restored bytes, each with a 55-second tool deadline:

```sh
node /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/count-c1-scratch.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs
```

Relevant fields from the actual emitted JSON:

| State | Adapter exit | `c1_binding_contracts` | Selftest exit | `bad` | `clean` | `missingVocab` | `failures` |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Pristine | 0 | 1 | 0 | 0 | 21 | `[]` | `[]` |
| Mutated | 0 | 0 | 1 | 1 | 21 | `[]` | see exact output below |
| Restored | 0 | 1 | 0 | 0 | 21 | `[]` | `[]` |

Complete mutant JSON output:

```json
{"probe":"snapshot-countC1-function-with-scratch-gate-and-selftest","snapshot":"b444ca8e024f386124418169e8e400221524bba3","counterSourceSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9","c1_binding_contracts":0,"gateSha256":"10612f3a777d9b6e2d3a65a7186844e6d019b144efb2c4dccf974286e399e064","selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae","selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":1,"clean":21,"missingVocab":[]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch","1 case lines not exact PASS"]}
```

Thus counter lines 152–154 reject the mutant, and line 176 returns count 0. The vocabulary and legacy checks alone do not distinguish this mutant: legacy still emits the unchanged reason and `missingVocab` is empty. The exact PASS/exit/summary checks are what kill it.

Scope limit: this is a live execution of `countC1` with scratch input substitution, **not** a full counter CLI invocation against a committed mutant revision. No mutant commit was created, and the unchanged named revision was not claimed to contain mutated bytes.

## Restoration and hashes

Reinserted the exact deleted statement into the scratch file using the edit tool before the restored runs. The scratch edit tag returned from `0863` (mutant) to `F663` (original).

| Artifact | Pristine SHA-256 | Mutated SHA-256 | Restored SHA-256 |
| --- | --- | --- | --- |
| Gate | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` | `10612f3a777d9b6e2d3a65a7186844e6d019b144efb2c4dccf974286e399e064` | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` |
| Selftest | `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae` | same | same |

Exact restoration comparison/hash command:

```sh
cmp /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs.pristine /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs && cmp /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs.pristine /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs && sha256sum /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs
```

Observed exit 0; both `cmp` calls were silent. Hash output:

```text
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/check-measurement-binding.mjs
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  /tmp/tabi-r16-counter-digest-unrecorded.Rs3LpFk5/selftest-measurement-binding.mjs
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs
bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs
```

Lane gate/selftest/counter hashes also matched their recorded pre-probe hashes. Scratch gate and selftest are restored exactly; the baseline and restored detectors are green.
