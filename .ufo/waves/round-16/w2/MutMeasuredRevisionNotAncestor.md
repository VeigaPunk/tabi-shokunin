# Mutation probe: measured_revision_not_ancestor

- Author: `TabiR16.MutMeasuredRevisionNotAncestor` (author-side mutation evidence, not non-author certification).
- Date: 2026-10-20.
- Target snapshot: `b444ca8e024f386124418169e8e400221524bba3`.
- Attack item / verdict: **HOLDS — mutant killed**. Disabling only the ancestor-rejection branch makes the unchanged selftest exit 1; the unchanged C1 counting function, supplied those mutant bytes, counts **0**. Pristine and exactly restored bytes both pass and count **1**.
- Axes: detection sensitivity, defect isolation, counter behavioral fidelity, exact restoration / lane safety.
- Scratch directory: `/tmp/tabi-r16-mut-ancestor.axFP0y`.
- Runtime: `node --version` → `v24.21.0`; `git --version` → `git version 2.56.0`. No tool installations or updates.

## Mutant and expected detector

At `scripts/check-measurement-binding.mjs:461`, the sole mutation was:

```diff
-  if (!isAncestor(repo, measured, atRev)) {
+  if (false && !isAncestor(repo, measured, atRev)) {
```

This models a disabled ancestry guard. It bypasses only the block emitting `measured_revision_not_ancestor`; it does not change the shared `isAncestor` helper, reason vocabulary, selftest, or counter. The branch body remains unchanged.

Expected detector: the selftest's dedicated negative fixture (`selftest-measurement-binding.mjs:220-232`) pins an actual unmerged commit with the same counter/input tree. It expects exit 1 and exactly `measured_revision_not_ancestor`; its same-shape control expects clean. With the guard disabled, the negative should incorrectly pass the gate and therefore fail the selftest.

## Exact setup and snapshot binding

Commands executed (absolute file paths; `git show` commands ran with cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`):

```sh
mktemp -d /tmp/tabi-r16-mut-ancestor.XXXXXX
# stdout: /tmp/tabi-r16-mut-ancestor.axFP0y
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/
cp /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.pristine.mjs

git show b444ca8e024f386124418169e8e400221524bba3:scripts/check-measurement-binding.mjs | sha256sum
git show b444ca8e024f386124418169e8e400221524bba3:scripts/selftest-measurement-binding.mjs | sha256sum
git show b444ca8e024f386124418169e8e400221524bba3:.ufo/waves/round-16/measure.mjs | sha256sum
```

The three snapshot hash outputs, respectively, were:

```text
5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  -
8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  -
bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9  -
```

`sha256sum` on the three lane files and then the three scratch copies returned those same digests. Thus the pristine copied gate, selftest, and counter match the assigned snapshot, not just an assumed current checkout.

## Same bounded detector: pristine → mutant → restored

The identical command was executed at all three stages, with cwd `/tmp/tabi-r16-mut-ancestor.axFP0y` and a 55-second outer bound:

```sh
node /tmp/tabi-r16-mut-ancestor.axFP0y/selftest-measurement-binding.mjs --gate /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.mjs
```

| Stage | Process exit | Observed cases | Summary |
|---|---:|---|---|
| Pristine | 0 | 43 PASS, 0 FAIL | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |
| Mutant | 1 | 42 PASS, 1 FAIL | `MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13` |
| Restored | 0 | 43 PASS, 0 FAIL | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13` |

Pristine and restored target/control output (identical in both stages):

```text
case=measured_revision_not_ancestor_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=measured_revision_not_ancestor expected_exit=1 actual_exit=1 expected_reasons=measured_revision_not_ancestor actual_reasons=measured_revision_not_ancestor PASS
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
```

Mutant target/control and failure-detail output:

```text
case=measured_revision_not_ancestor_control expected_exit=0 actual_exit=0 expected_reasons=- actual_reasons=- PASS
case=measured_revision_not_ancestor expected_exit=1 actual_exit=0 expected_reasons=measured_revision_not_ancestor actual_reasons=- FAIL
FAIL_DETAIL case=measured_revision_not_ancestor MEASUREMENT_BINDING verdict=clean claims=1 bound=1
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13
```

Every other case remained PASS. This is a killed mutant, not an inconclusive baseline failure.

## C1 counter behavior: observed 1 → 0 → 1

The production counter reads Git blobs at a named revision, not scratch worktree bytes (`measure.mjs:100-112`). Merely running its ordinary CLI against the unchanged named snapshot would not inject the mutant. No mutant commit or lane modification was made.

Instead, the scratch-only driver below executes the complete **unchanged** `countC1` function and its own constants/helpers extracted from the copied, snapshot-matching `measure.mjs`. Only `blob` input loading is supplied by the driver: gate/selftest come from scratch; the legacy manifest comes from the named snapshot; the function's legacy-history check uses the real lane repository read-only. This exercises the actual counter's selftest parsing and final count decision, not a separately implemented approximation. It is not represented as a full CLI measurement of a new committed mutant revision.

The identical command ran at all three stages (55-second outer bound; process exit 0 each time):

```sh
node /tmp/tabi-r16-mut-ancestor.axFP0y/probe-c1-counter.mjs
```

Pristine output, repeated identically after restoration:

```json
{"c1_binding_contracts":1,"gateSha256":"5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb","selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae","selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":[]}
```

Mutant output (complete):

```json
{"c1_binding_contracts":0,"gateSha256":"59be69dc1bcb25a396c903f90c431922b659e5e7b60ade1dd82534895ee3faa6","selftestSha256":"8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae","selftest":{"exit":1,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13","bad":1,"clean":21,"missingVocab":["measured_revision_not_ancestor"]},"legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70ee114347a79abb91cacab6c63044ce36"},"failures":["selftest exit 1","selftest summary absent, not clean, or case count mismatch","1 case lines not exact PASS","vocabulary not exercised: measured_revision_not_ancestor"]}
```

The C1 decision is therefore 0 for this mutant. Independently of the unchanged successful legacy check, the selftest exit, failed summary, non-PASS case, and missing actual-PASS vocabulary all trigger failure (`measure.mjs:141-157,176`). The selftest summary still says `reasons=13` because it tracks expected reasons; the counter correctly checks reasons on actual PASS lines instead.

### Scratch counter driver (reproducibility)

Path: `/tmp/tabi-r16-mut-ancestor.axFP0y/probe-c1-counter.mjs`.
SHA-256: `aac31c6f0e96e518f11d9002ff20d21d9cdf5f0751b4789bc599093c53271ebd`.

```js
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const dir = dirname(fileURLToPath(import.meta.url));
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const revision = 'b444ca8e024f386124418169e8e400221524bba3';
const source = readFileSync(join(dir, 'measure.mjs'), 'utf8');
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  if (from < 0 || to <= from) throw new Error(`counter section not found: ${start}`);
  return source.slice(from, to);
}
// Execute byte-for-byte source sections, including the complete countC1 body.
// Only its blob input is supplied by the isolated scratch gate/selftest;
// the real legacy manifest and Git history are read from the named snapshot.
const sections = [
  section('const GATE =', 'const REQUIRED_CASES ='),
  section('const ENV =', 'class CannotEvaluate'),
  section('const sha256 =', 'function countC1(rev) {'),
  section('function countC1(rev) {', 'function sourceRows(text) {'),
];
const legacy = spawnSync('git', ['-c', 'core.fsmonitor=false', 'show',
  `${revision}:corpus/evidence/round-15/measurements.json`], {
  cwd: ROOT,
  env: { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: process.env.HOME ?? '/tmp',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_NO_REPLACE_OBJECTS: '1',
    GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
});
if (legacy.error || legacy.status !== 0) throw new Error('legacy snapshot unavailable');
const blob = (rev, path) => {
  if (rev !== revision) throw new Error(`unexpected revision: ${rev}`);
  if (path === 'scripts/check-measurement-binding.mjs') return readFileSync(join(dir, 'check-measurement-binding.mjs'));
  if (path === 'scripts/selftest-measurement-binding.mjs') return readFileSync(join(dir, 'selftest-measurement-binding.mjs'));
  if (path === 'corpus/evidence/round-15/measurements.json') return legacy.stdout;
  throw new Error(`unexpected blob: ${path}`);
};
const countC1 = runInNewContext(`${sections.join('\n')}\ncountC1`, {
  ROOT, blob, spawnSync, createHash, mkdirSync, mkdtempSync, rmSync, writeFileSync,
  tmpdir, join, process, Buffer,
});
console.log(JSON.stringify(countC1(revision)));
```

## Restoration evidence and boundaries

The one-line edit was reversed before the restored detector runs. Observed SHA-256 progression:

| Input | Pristine | Mutant | Restored |
|---|---|---|---|
| Gate | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` | `59be69dc1bcb25a396c903f90c431922b659e5e7b60ade1dd82534895ee3faa6` | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` |
| Selftest | `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae` | same | same |
| Counter | `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9` | same | same |

Exact restoration command executed:

```sh
cmp /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.pristine.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.mjs && cmp /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.mjs && sha256sum /tmp/tabi-r16-mut-ancestor.axFP0y/check-measurement-binding.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/selftest-measurement-binding.mjs /tmp/tabi-r16-mut-ancestor.axFP0y/measure.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-measurement-binding.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/measure.mjs
```

Exit 0; both `cmp` invocations were silent. All six hash outputs matched their respective pristine digests above. Restored direct selftest and C1 behavior also returned their pristine outputs.

No lane source changes, commits, delegation, background jobs, sibling mutations, credential access, or REA tools. The requested selftest makes and removes its own fixture repositories under `/tmp`; the counter similarly removes its temporary materialization. This report is the only lane file written. No external-source re-open was required for this local behavioral probe.
