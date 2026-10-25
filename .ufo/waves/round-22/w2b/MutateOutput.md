# MutateOutput — round22/w2b

## Scope, axes, and result

Reviewed revision: **`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`** (`R` below). Production was read through `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show R:PATH`. Mutation execution used only the private checkout `/tmp/tabi-r22-w2b-MutateOutput`, detached at R.

Axes: (1) distinguish array from object; (2) bind success-output nonce to the independently retained invocation nonce; (3) check native landing payload contents, not merely array shape; (4) preserve the clean 12-row positive and exact restoration. No production repair or contract change was made.

**Result: two mutants killed; one mutant survived the existing selftest.** The survivor is a regression-test coverage finding, **not an acceptance bug in R**: R itself rejected every exercised malformed output, including the survivor's counterexample. No new browser observation, capability, coverage denominator, admission, or promotion is claimed.

## Detector and isolation

The unchanged detector was:

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node \
  .ufo/waves/round-22/measure-c1.mjs --selftest
```

Actual Node version: `v24.21.0`. At R this detector has **44 cases**, not the 35 checks in the separate cohort receipt. The first direct pristine invocation returned exit 0, `verdict:"clean", cases:44, passed:44`.

A disposable Node wrapper, `mutate-output-probe.mjs`, invoked that exact command with `spawnSync`, a 45-second bound and a 32-MiB capture bound; it propagated the detector's process exit status and printed the relevant expected/observed records. It also called the lane oracle's exported `evaluate(filesAt(R))` on the preserved positive and three independently changed in-memory file maps. The wrapper did not edit the detector or its expectations.

The selftest really exercises changed oracle bytes: `R:.ufo/waves/round-22/selftest-c1.mjs:51-52` reads the current oracle file, and lines 407-422 write each isolated fixture, commit it, and execute its full revision-bound CLI. `checkOracle` at lines 375-392 requires the expected exit, value, verdict, metric and finding, and rejects stale evidence-binding failures for semantic tests.

For each supplemental counterexample, the wrapper changed only the selected correlated response output, synchronized `receipt.cases[id].after.responses`, then recomputed the raw digest, receipt digest and acquisition artifact digests. This isolates semantic rejection from stale hashes. Expectations, producer, fixtures, nonce/input, invocation identity, timing and navigation stayed unchanged. Every supplemental rejection on pristine/restored bytes had exactly the `semantic_output` finding shown below, not an evidence-binding finding.

## Mutants and actual outputs

All changes were one behavior-bearing source line in `R:.ufo/waves/round-22/measure-c1.mjs`, applied one at a time. Each mutant was restored before the next was introduced.

| Mutant | Source location | Pristine selftest | Mutated selftest | Restored selftest | Verdict |
|---|---|---|---|---|---|
| M1: collapse one-element arrays to their first item before equality | line 296 | exit 0; 44/44 | exit 1; 43/44 | exit 0; 44/44 | **Killed** by `native-output-object` |
| M2: derive expected output nonce from observed output | line 295 | exit 0; 44/44 | exit 1; 43/44 | exit 0; 44/44 | **Killed** by `wrong-success-nonce` |
| M3: accept native-submit output on array shape alone | line 296 | exit 0; 44/44 | exit 0; 44/44 | exit 0; 44/44 | **Survived** |

The intact 12-row positive remained `{"exit":0,"value":12,"verdict":"clean","findings":[]}` in every completed stage, including all three mutants.

### M1 — array/object normalization: killed

Replacement for line 296:

```js
      if (!equal({ ...response.params, output: Array.isArray(response.params.output) ? response.params.output[0] : response.params.output }, { ...expectedParams, output: Array.isArray(expectedParams.output) ? expectedParams.output[0] : expectedParams.output })) {
```

Smallest counterexample: native-submit output `[{"dummy":"landing"}]` becomes `{"dummy":"landing"}`. The original response is at `R:corpus/evidence/round-21/runtime/na-native-submit.json:227-235`; the fixed contract is `R:corpus/evidence/round-22/semantic-expectations.json:70-81`, especially line 78.

Expected detector: `native-output-object`, declared at `R:.ufo/waves/round-22/fixtures/expected.json:262-272`, with the mutation recipe at `R:.ufo/waves/round-22/selftest-c1.mjs:198-204`.

Actual failing selftest record under M1:

```json
{"name":"native-output-object","expected":{"exit":1,"value":0,"verdict":"failed","finding":"semantic_output"},"observed":{"exit":0,"reportedExit":0,"value":12,"verdict":"clean","findings":[]},"pass":false}
```

This was the only failing selftest case. The supplemental object-output witness likewise changed from pristine/restored `exit:1,value:0,semantic_output:na-native-submit:exact-output-shape` to mutant `exit:0,value:12,findings:[]`. Preserving positive: the original array still passes. Smallest correction to this hypothetical defect: retain the original deep equality without array unwrapping. No fix is needed in R for this probe.

### M2 — self-sourced nonce: killed

Replacement for line 295:

```js
      else expectedParams.output = resolveTokens(expectedResponse.output, response.params.output?.nonce, inputQ);
```

Smallest counterexample: in `na-click`, change only `output.nonce` from `d57a9461-7725-447a-94ee-5031820695a6` to `wrong-output-nonce`, retaining `ok:true`, the original `q`, invocation ID and all page observations. Original output: `R:corpus/evidence/round-21/runtime/na-click.json:195-203`.

Expected detector: `wrong-success-nonce`, declared at `R:.ufo/waves/round-22/fixtures/expected.json:174-184`; recipe at `R:.ufo/waves/round-22/selftest-c1.mjs:174-180`.

Actual failing selftest record in the completed, memory-backed run:

```json
{"name":"wrong-success-nonce","expected":{"exit":1,"value":0,"verdict":"failed","finding":"semantic_output"},"observed":{"exit":0,"reportedExit":0,"value":12,"verdict":"clean","findings":[]},"pass":false}
```

This was the only failing selftest case. The supplemental nonce witness produced the same acceptance under the mutant and only `semantic_output:na-click:exact-output-shape` on pristine/restored bytes. Preserving positive: output containing the real invocation nonce still passes. Smallest correction to this hypothetical defect: use the independently retained `nonce` argument, as R already does.

### M3 — native array shortcut: survived; missing payload-content negative

Replacement for line 296:

```js
      if (!equal(response.params, expectedParams) && !(id === 'na-native-submit' && Array.isArray(response.params?.output))) {
```

**Coverage finding at R:** the suite tests native array-to-object collapse (`.ufo/waves/round-22/fixtures/expected.json:262-272`) but its wrong-value case is for `auto-positive` (`:185-194`), not the native array's contents. The recipes at `.ufo/waves/round-22/selftest-c1.mjs:182-188,198-204` reflect that distinction. Consequently this shape-only shortcut defeats the exact-content check at `.ufo/waves/round-22/measure-c1.mjs:293-298` without failing any of the 44 existing selftests.

Smallest exercised counterexample: replace the single scalar at `R:corpus/evidence/round-21/runtime/na-native-submit.json:233`, yielding:

```json
[{"dummy":"not-landing"}]
```

Keep `status:"Completed"`, array cardinality, all other bytes semantically unchanged, and coherent summaries/digests. Preserving positive: `[{"dummy":"landing"}]`, required by `R:corpus/evidence/round-22/semantic-expectations.json:78`, remains accepted.

Actual detector output under M3:

```json
{"verdict":"clean","cases":44,"passed":44,"failures":[],"exit":0}
```

Actual supplemental witness results:

```json
{"pristine":{"exit":1,"value":0,"verdict":"failed","findings":[{"id":"semantic_output","detail":"na-native-submit:exact-output-shape"}]},"mutant":{"exit":0,"value":12,"verdict":"clean","findings":[]},"restored":{"exit":1,"value":0,"verdict":"failed","findings":[{"id":"semantic_output","detail":"na-native-submit:exact-output-shape"}]}}
```

The array-to-object and wrong-nonce negatives still rejected under M3; the preserved positive still passed. Thus this is a meaningful, positive-preserving survivor, not a no-op mutation.

**Smallest fix for the coverage gap:** add one `native-output-wrong-dummy` recipe beside `native-output-object` that changes `responseFor(raw, record).params.output[0].dummy` to `not-landing`, calls `syncResponses(record, raw)`, and uses the existing `changeCase` resealing path. Add its independent expected case for `na-native-submit` with `exit:1,value:0,verdict:"failed",finding:"semantic_output"`. Keep the existing positive and object-collapse negative. The exercised supplemental result demonstrates that R already enforces this contract; no relaxation or production special case is warranted. This proposed test addition was not integrated or run as an amended suite.

## Restoration hashes

SHA-256 of `.ufo/waves/round-22/measure-c1.mjs`:

| State | SHA-256 |
|---|---|
| Original; every restoration; final | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |
| M1 | `49674171b4cabe6cea0b1b1207a4724348b488db55c8bf02fbcd312bc2de86fc` |
| M2, including the interrupted first attempt | `ad58fe6c77fbb44607c9f8759c323992aed41c0f0a8cda1075457e268e05c2c0` |
| M3 | `a424a7dd994f6cdd07e3090130e49c348ecaaa93f1bfe0d6ad19bfa60f7d2a50` |

Unchanged across all captured stages and final hashing:

- `.ufo/waves/round-22/selftest-c1.mjs`: `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6`
- `.ufo/waves/round-22/fixtures/expected.json`: `b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade`
- Disposable wrapper after output-format adjustment: `f3de1816357854a888c7399c2f543920b67cfdde729e59884fc29da3f350c448`

## Exercised commands, interruptions, and cleanup

All Node commands below ran with the private clone as cwd. `N` denotes the exact Node executable above; `P` denotes `mutate-output-probe.mjs`. The wrapper's reported child exits equal its own shell exits.

| Command/stage | Exit | Actual result |
|---|---:|---|
| `git clone --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-MutateOutput && git -C /tmp/tabi-r22-w2b-MutateOutput checkout --detach R` | 0 | Detached at R |
| `N .ufo/waves/round-22/measure-c1.mjs --selftest` | 0 | Pristine 44/44 |
| `N P pristine` | 0 | 44/44; three supplemental negatives rejected |
| `N P mutant-array-object` | 1 | M1: 43/44, only native-output-object failed |
| `N P restored-array-object` | 0 | 44/44; exact original oracle hash |
| `N P mutant-output-nonce` | 1 | **Inconclusive infrastructure interruption**, described below |
| `mkdir -p .probe-tmp && env TMPDIR=/tmp/tabi-r22-w2b-MutateOutput/.probe-tmp N P pristine-private-tmp` | 1 | `mkdir: No space left on device`; detector did not run |
| Remove only disposable non-input checkout copies, create private temp dir, then `env TMPDIR=/tmp/tabi-r22-w2b-MutateOutput/.probe-tmp N P pristine-private-tmp` | 1 | **Inconclusive pristine infrastructure interruption** |
| `sudo -n mount -t tmpfs -o size=256m,uid=1000,gid=1000,mode=700 tmpfs /tmp/tabi-r22-w2b-MutateOutput/.probe-tmp` | 0 | Temporary storage confined to private clone mountpoint |
| `env TMPDIR=/tmp/tabi-r22-w2b-MutateOutput/.probe-tmp N P pristine-memory-tmp` | 0 | Fresh complete pristine 44/44 |
| Same command, stage `mutant-output-nonce-memory` | 1 | M2: 43/44, only wrong-success-nonce failed |
| Same command, stage `restored-output-nonce` | 0 | 44/44; exact original hash; also M3 pristine baseline |
| Same command, stage `mutant-dummy-landing` | 0 | M3 survived 44/44; malformed dummy accepted by supplemental witness |
| Same command, stage `restored-dummy-landing` | 0 | 44/44; all supplemental negatives rejected; exact original hash |
| Final `sha256sum` of oracle, selftest, expectations and wrapper, followed by `sudo -n umount /tmp/tabi-r22-w2b-MutateOutput/.probe-tmp` | 0 | Hashes above; temporary mount removed |
| `rm -rf /tmp/tabi-r22-w2b-MutateOutput && test ! -e /tmp/tabi-r22-w2b-MutateOutput` | 0 | Private clone and wrapper removed |

The first M2 selftest aborted before producing JSON:

```text
Error: git_failed:init:error: could not write config file /tmp/tabi-r22-c1-cli-selftest-f7m1Oo/missing-error-text-na-reject/.git/config: No space left on device
fatal: could not set 'core.repositoryformatversion' to '0'
```

The oracle was immediately restored to the original hash. `df -h`/`df -i` returned exit 0 and showed the root filesystem at 100% space use; `/dev/shm` was largely free. Removing only this disposable checkout's unrelated copies did not resolve the next pristine attempt: it aborted with `ENOSPC` creating the `native-landing-wrong-query` fixture. Neither interrupted exit was counted as a killed mutant. The private tmpfs allowed a fresh complete pristine/M2/restored/M3/restored sequence without changing detector bytes or expectations. No sibling files were removed.

Read-only shell inventory/source commands (`git ls-tree`, the four committed `git show` reads), footprint/capacity commands (`du`, `df`, `findmnt`, `id`, `command -v mount`) and hashing commands all exited 0. Private non-input deletion commands exited 0. Surgical scratch mutation/restoration tool calls succeeded. No command ran the detector in the lane.

Tools installed or updated: **none**. No browser, REA, service, external runtime, delegation, messaging, fleet/lane VCS write, full cohort check, chronology check, or production repair was performed. The only retained write is this report; the exact restored source bytes were measured before the private clone was deleted.

Report: .ufo/waves/round-22/w2b/MutateOutput.md
