# Round 16 wave 2 — counter_changed_since_measurement mutation probe

**Attack item:** C1 measurement-binding reason `counter_changed_since_measurement`.
**Verdict: HOLDS against this mutant; mutant KILLED.** The pristine and restored selftests exit 0; the weakened gate makes the same selftest exit 1. The counter's unchanged C1 behavioral checks, exercised through the scratch-only input adapter described below, count **1 → 0 → 1**.

Author-side mutation evidence only, not independent/non-author certification or a judgment of other claims.

## Scope and axes

- Axes: defect-detection sensitivity; named-snapshot identity; lane isolation; exact-byte restoration.
- Snapshot: `b444ca8e024f386124418169e8e400221524bba3`.
- Scratch: `/tmp/tabi-r16-counter-changed.cZM8NjG8` (created by `mktemp -d /tmp/tabi-r16-counter-changed.XXXXXXXX`).
- Only one gate mutant, at modern-manifest `evaluateClaim`, line 478. Legacy emission, reason vocabulary, test expectations, and all other gate checks were left intact.
- No lane source edits, subagent dispatch, commits by this probe, background jobs, tool installs/updates, REA calls, or separate assistant runtime. The existing selftest creates/commits/cleans its own isolated fixture repositories as designed.
- Existing tools: Node `v24.21.0`; Git `2.56.0`. Both behavioral detectors were awaited, with a 180-second outer subprocess timeout per invocation.
- The only write under the lane is this requested Report.

## Input identity and preparation

Executed:

```sh
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs /tmp/tabi-r16-counter-changed.cZM8NjG8/
cp /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.pristine.mjs
```

All exited 0. The following commands ran read-only with cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```sh
git show b444ca8e024f386124418169e8e400221524bba3:scripts/check-measurement-binding.mjs | sha256sum
git show b444ca8e024f386124418169e8e400221524bba3:scripts/selftest-measurement-binding.mjs | sha256sum
git show b444ca8e024f386124418169e8e400221524bba3:.ufo/waves/round-16/measure.mjs | sha256sum
```

Observed snapshot outputs, respectively:

```text
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  -
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  -
bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9  -
```

`sha256sum` on the three lane files and three initial scratch files produced these same respective digests. The worktree copies therefore match the named snapshot, rather than merely assuming the current lane is the measured build.

## Mutant and expected detector

Only this one-line gate weakening was applied with the edit tool, only in scratch:

```diff
-    if (atTarget.digest !== recorded) {
+    if (atTarget.digest === null && atTarget.digest !== recorded) {
```

The plausible defect incorrectly limits the drift reason to an unavailable counter blob; an existing changed blob no longer emits `counter_changed_since_measurement`. The adjacent `counter_digest_mismatch` and downstream `counted_input_changed` checks remain unchanged.

Expected detector: selftest case `counter_changed_since_measurement` demands both `counter_changed_since_measurement` and `counted_input_changed`. Even though the defective gate still exits 1 due to `counted_input_changed`, its exact-reason assertion must fail. Its same-shape positive control must remain green. The counter's exact-PASS/clean-summary requirements at `measure.mjs:133–157` must then count 0.

## Exact detector commands

Both commands below ran at each of the three phases, with cwd `/tmp/tabi-r16-counter-changed.cZM8NjG8`. The selftest command uses its documented `--gate` flag:

```sh
node /tmp/tabi-r16-counter-changed.cZM8NjG8/selftest-measurement-binding.mjs --gate /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs
node /tmp/tabi-r16-counter-changed.cZM8NjG8/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
```

### Counter input adapter, not a lane mutant

The shipped counter reads Git blobs, not the worktree. Merely mutating the copied gate cannot change the result of an unmodified lane counter at the immutable snapshot. To exercise its actual C1 behavioral checks against the scratch gate without making a commit or changing the lane, the copied counter received exactly three temporary adapter changes outside `countC1`:

```diff
-import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
+import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
-const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
+const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
-  return content.stdout;
+  return path === GATE ? readFileSync('/tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs') : content.stdout;
```

The return override is at `blob` line 111, after the original regular-blob validation and Git blob read. All non-gate inputs, including the selftest, historical round-15 measurements, and revision resolution, remain sourced from the named snapshot/lane Git history. `countC1`, its oracles, and its count logic were not edited. The adapter was identical for pristine, mutated, and restored runs. Its execution-time SHA-256 was `852e49ec6e3c435f64e66220d8d2295072016abedc786e15b37a6e512180aa8b`.

The reported `counterBlobAtRevisionSha256` is the original snapshot blob's digest, not this adapter's digest. These are adapted-counter observations; this probe does not claim that an unchanged revision suddenly yields 0 from the unmodified lane CLI.

## Observed results

| Phase | Selftest exit | PASS cases | Counter exit | c1_binding_contracts | Counter bad case lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pristine | 0 | 43/43 | 0 | 1 | 0 |
| Mutated | 1 | 42/43 | 0 | 0 | 1 |
| Restored | 0 | 43/43 | 0 | 1 | 0 |

Counter exit 0 means evaluated, not that C1 counted 1. Counter stderr was empty in all three phases. The direct selftest stderr was empty in pristine/restored phases.

### Pristine direct selftest stdout (relevant exact lines)

```text
case=counter_changed_since_measurement_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counted_input_changed,counter_changed_since_measurement PASS
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
```

### Mutated direct selftest stdout (relevant exact lines)

```text
case=counter_changed_since_measurement_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counted_input_changed FAIL
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13
```

Its exact stderr:

```text
FAIL_DETAIL case=counter_changed_since_measurement MEASUREMENT_BINDING verdict=failed claims=1 bound=0 | finding claim=C1 reason=counted_input_changed detail=paths=measure.mjs
```

### Restored direct selftest stdout (relevant exact lines)

```text
case=counter_changed_since_measurement_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=counter_changed_since_measurement expected_exit=1 actual_exit=1 expected_reasons=counter_changed_since_measurement,counted_input_changed actual_reasons=counted_input_changed,counter_changed_since_measurement PASS
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
```

### Mutated C1 counter stdout (JSON formatted without changing values)

```json
{
  "revision": "b444ca8e024f386124418169e8e400221524bba3",
  "c1_binding_contracts": 0,
  "gateSha256": "bc0c8f499cec501cc6f12062d2f3651fad362faf3e42843d2f652487d08971f7",
  "selftestSha256": "8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae",
  "selftest": {
    "exit": 1,
    "cases": 43,
    "summary": "MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13",
    "bad": 1,
    "clean": 21,
    "missingVocab": []
  },
  "legacy": {
    "exit": 1,
    "findings": {
      "C1": [
        "counted_inputs_undeclared",
        "counter_changed_since_measurement",
        "counter_digest_unrecorded"
      ],
      "C2": [
        "counted_inputs_undeclared",
        "counter_digest_mismatch"
      ]
    },
    "at": "36240c70ee114347a79abb91cacab6c63044ce36"
  },
  "failures": [
    "selftest exit 1",
    "selftest summary absent, not clean, or case count mismatch",
    "1 case lines not exact PASS"
  ],
  "counterBlobAtRevisionSha256": "bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9",
  "inputsRead": [
    "corpus/evidence/round-15/measurements.json",
    "scripts/check-measurement-binding.mjs",
    "scripts/selftest-measurement-binding.mjs"
  ]
}
```

For pristine and restored C1 runs, both observed `selftest.exit=0`, `cases=43`, `bad=0`, `clean=21`, `missingVocab=[]`, `failures=[]`, and `c1_binding_contracts=1`. Their legacy findings were identical to the mutated run's legacy findings above.

The mutant is killed specifically by exact per-case reason checking: `missingVocab` stays empty because legacy cases still exercise this reason, and the historical legacy oracle still passes. Thus vocabulary occurrence alone would not have detected this one modern-branch defect; the current counter's exact-PASS and summary checks do detect it.

Complete exact stdout, stderr, command, cwd, exit, and timeout records are retained in:

- `/tmp/tabi-r16-counter-changed.cZM8NjG8/baseline.json`
- `/tmp/tabi-r16-counter-changed.cZM8NjG8/mutated.json`
- `/tmp/tabi-r16-counter-changed.cZM8NjG8/restored.json`

## Restoration evidence

The line-478 mutant was reversed before running the restored phase. Executed:

```sh
cmp /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.pristine.mjs /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs
```

Observed: exit 0, stdout empty, stderr empty. The gate's SHA-256 progression was:

```text
pristine  5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb
mutated   bc0c8f499cec501cc6f12062d2f3651fad362faf3e42843d2f652487d08971f7
restored  5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb
```

After the restored detector runs, the three temporary counter adapter edits were also reversed. Final exact command:

```sh
sha256sum /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs /tmp/tabi-r16-counter-changed.cZM8NjG8/selftest-measurement-binding.mjs /tmp/tabi-r16-counter-changed.cZM8NjG8/measure.mjs
```

Observed:

```text
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  /tmp/tabi-r16-counter-changed.cZM8NjG8/check-measurement-binding.mjs
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  /tmp/tabi-r16-counter-changed.cZM8NjG8/selftest-measurement-binding.mjs
bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9  /tmp/tabi-r16-counter-changed.cZM8NjG8/measure.mjs
```

All three match the snapshot and initial copy. Lane source hashes checked after the behavioral runs also matched their initial values. The final scratch counter is intentionally pristine again; replaying the adapted C1 command requires reapplying the three documented scratch adapter edits first.

## Disposition

**HOLDS / killed** for this single scoped attack. Baseline and restoration are green, the deficient modern-manifest drift emission is detected, and the C1 behavioral checks demonstrably count 0 with this gate. No surviving mutant, inconclusive baseline, or source repair is claimed. No other mutation was attempted.
