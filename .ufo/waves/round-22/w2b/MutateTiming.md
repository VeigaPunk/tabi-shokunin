# MutateTiming — delayed-release sequence mutation

## Boundary and axes

Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. Production source was read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:PATH`.

Axes: (1) detect a weakened finite lifecycle ordering predicate, (2) preserve the same 12 retained positive observations and their finite windows, (3) exact restoration and isolated execution. One unique behavior-bearing mutant was tested; environmental retries did not introduce additional mutants. No browser acquisition, population increase, capability/depth/scalar change, or admission decision is claimed.

**Result: one survivor of the existing 44-case selftest.** A separate, executed counterexample distinguishes the mutant from pristine/restored code. This is a regression-coverage finding, not a demonstrated defect in the reviewed production predicate or evidence that its current value 12 is wrong.

## Mutant M1: omit observation-before-release ordering

At the reviewed revision, `.ufo/waves/round-22/measure-c1.mjs:334` requires:

```js
!(completeFrame.seq < delayed.seq && delayed.seq < release.seq) ||
```

Only that line in the private scratch copy was changed to:

```js
!(completeFrame.seq < delayed.seq) ||
```

This plausible missing-conjunct defect retains action completion before the delayed observation, the delayed finite duration bounds, active state, and response-after-release checks (`measure-c1.mjs:333-340`), but stops requiring the purported before-release observation to precede release.

**Expected detector:** the lane's own `measure-c1.mjs --selftest` should reject this regression with a failed negative control while retaining `positive` at value 12. The selftest really consumes the changed worktree oracle: `.ufo/waves/round-22/selftest-c1.mjs:51-52` reads it at execution and places it in each isolated CLI fixture.

**Actual existing coverage:** `.ufo/waves/round-22/selftest-c1.mjs:229-270` implements early-response, inactive-before-release, and short-pre-window controls. Their expectations are at `.ufo/waves/round-22/fixtures/expected.json:307-337`. They do not distinguish the removed observation/release ordering conjunct in this executed probe.

## Same bounded detector on pristine, mutated, restored bytes

Executable: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (`v24.21.0`, observed in every completed probe).

Working directory and child `TMPDIR`: `/tmp/tabi-r22-w2b-MutateTiming`. The scratch driver synchronously ran the exact child command below, with a 45,000 ms timeout and 8 MiB output bound; the outer tool deadline was 55 seconds. No background jobs were used.

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node .ufo/waves/round-22/measure-c1.mjs --selftest
```

After resolving the scratch storage problem described below, the completed triplet was:

| Driver command, same executable and cwd | Process exit | Selftest actual output | Signal/error/stderr |
|---|---:|---|---|
| `node mutation-timing-probe.mjs pristine` | 0 | `verdict=clean, cases=44, passed=44, failedNames=[]` | null / null / empty |
| `node mutation-timing-probe.mjs mutated` | 0 | `verdict=clean, cases=44, passed=44, failedNames=[]` | null / null / empty |
| `node mutation-timing-probe.mjs restored` | 0 | `verdict=clean, cases=44, passed=44, failedNames=[]` | null / null / empty |

Observed selected child-CLI outputs were identical across that completed triplet:

| Existing control | CLI exit | Value | Verdict | Finding IDs | Selftest pass |
|---|---:|---:|---|---|---|
| `positive` | 0 | 12 | clean | `[]` | true |
| `delayed-early-response` | 1 | 0 | failed | `[semantic_delayed]` | true |
| `delayed-active-false` | 1 | 0 | failed | `[semantic_delayed]` | true |
| `finite-short-window` | 1 | 0 | failed | `[semantic_timing]` | true |

SHA-256 of the complete selftest stdout observed by the driver:

- Pristine completed triplet run: `57925101e56abafb7f4b0222521ca7e5ce497cde8b65a6d760ee062c4465101f`.
- Mutated completed triplet run: `f76032ecc1a85d2ecda41cf410eab119b6f4ec2cc89c5393659c9cab1f751130`.
- Restored completed triplet run: `8d43124f759cbd830ee3aaa4738075562bbb48b4958056327226358cd685ee55`.

**Verdict: SURVIVED the existing selftest.** Neither an expected negative-control exit 1 nor an environmental failure was counted as a killed mutant.

## Smallest counterexample with preserving positive

The scratch driver also invoked exported `evaluate(filesAt(reviewedRevision))` and the same evaluator on a minimally changed in-memory file map. This was an executed evaluator contrast, not an added stock selftest or a separately executed full-CLI counterexample.

Start with the retained `corpus/evidence/round-21/runtime/na-delayed.json`. Swap the adjacent delayed observation and release markers, renumber frames, update the delayed page-observation cross-link, and reseal raw/receipt/acquisition digests following the existing selftest's resealing pattern. No expectations, fixture HTML, response payload, invocation identity, observation values, or timestamps change. Only these in-memory file-map entries change:

1. `corpus/evidence/round-21/runtime/na-delayed.json`.
2. `corpus/evidence/round-21/runtime/receipt.json` (raw digest).
3. `.ufo/waves/round-21/runtime-execution-finalized.json` (raw/receipt digests).

| Marker | Preserving positive `(seq, at)` | Counterexample `(seq, at)` |
|---|---|---|
| action-complete | `(14, 1792590714848)` | unchanged |
| delayed-before-release observation | `(15, 1792590715100)` | `(16, 1792590715100)` |
| release | `(16, 1792590715100)` | `(15, 1792590715100)` |
| correlated Completed response | `(17, 1792590715100)` | unchanged |

Pre, post, and delayed durations remain **252 ms, 755 ms, and 252 ms**, respectively. The response remains after release; all clocks are nondecreasing. The counterexample specifically loses evidence of active state *before* release, despite retaining valid durations and matching state values.

Actual evaluator outputs from the same contrast on all three completed phases:

| Oracle bytes | Original retained positive | Release-before-observation counterexample |
|---|---|---|
| pristine | `exit=0, value=12, verdict=clean, findings=[]` | `exit=1, value=0, verdict=failed` |
| mutated | `exit=0, value=12, verdict=clean, findings=[]` | `exit=0, value=12, verdict=clean, findings=[]` |
| restored | `exit=0, value=12, verdict=clean, findings=[]` | `exit=1, value=0, verdict=failed` |

The exact pristine/restored counterexample finding was:

```json
[{"id":"semantic_delayed","detail":"na-delayed:active-before-release-and-response-after-release"}]
```

The invalid delayed row was `semanticMatch=true, counted=true` only under the mutant. It was `semanticMatch=false, counted=false` under pristine/restored bytes. The whole-population value 0 in rejected controls is the existing fail-closed aggregation, not a population reduction.

Raw SHA-256:

- Preserving positive: `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2`.
- Adjacent-swap counterexample: `d808e147c12ca3ae91f8e46fe24337f341eec74bcb73b813ef657eb040594268`.

This deliberate, resealed negative fixture tests semantic failure capability, as the existing selftest does. It is not an assertion about malicious-author authenticity or general browser scheduling semantics.

## Smallest fix

Keep the reviewed production guard at `.ufo/waves/round-22/measure-c1.mjs:334` unchanged. Add one independent negative recipe alongside `.ufo/waves/round-22/selftest-c1.mjs:229-251`, e.g. `delayed-release-before-observation`, performing the adjacent marker swap above, using existing `syncFrames` and `changeCase`/resealing helpers. Add its expectation alongside `.ufo/waves/round-22/fixtures/expected.json:307-327`: exit 1, value 0, verdict `failed`, finding `semantic_delayed`. Preserve the existing value-12 positive. The executed contrast shows why this control discriminates M1; integration of that control was **not** performed or claimed.

## Environmental attempts and exercised commands

All execution and Git writes were confined to the private throwaway clone. Initial preparation command exited 0:

```text
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-MutateTiming && git -C /tmp/tabi-r22-w2b-MutateTiming checkout --detach e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
```

Source retrieval via `git show` exited 0 for `AGENTS.md`, `scripts/webmcp-lifecycle-round21.mjs`, `.ufo/waves/round-22/post-crash-repair.json`, `.ufo/waves/round-22/measure-c1.mjs`, `.ufo/waves/round-22/selftest-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`, and `corpus/evidence/round-21/runtime/na-delayed.json`.

Before the completed triplet, the same driver commands had these actual outcomes:

1. Initial `pristine`: exit 0, selftest 44/44 clean; positive accepted and swapped-order control rejected.
2. Initial `mutated`: exit 1, no parsed selftest result. `git init` failed in the `positive` fixture with `No space left on device`. Its in-memory contrast nevertheless completed and showed the invalid order accepted. This aborted selftest was **inconclusive**, not a kill or survival result.
3. Initial `restored`: exit 1. After invoking the child detector, the driver's attempt to save `restored-selftest.stdout.json` itself failed with `ENOSPC`; no child summary is claimed for this attempt. The production line had already been restored exactly.
4. Retry `pristine` after deleting unused directories only in this scratch copy: exit 1, selftest aborted at `native-output-object/.git/config` with `No space left on device`. Its in-memory restored contrast rejected the counterexample.

Storage diagnostics all exited 0: `df -h` for scratch, `/dev/shm`, and lane; `df -i` for scratch and `/dev/shm`; `du -sh` for the scratch and for `.git .ufo corpus scripts`. At diagnosis, scratch's filesystem was 128 GiB, 100% used, with 66 MiB available. No sibling files, host caches, services, or mounts were modified.

Owned-scratch deletion command exited 0:

```text
rm -rf -- /tmp/tabi-r22-w2b-MutateTiming/.ufo/waves/round-{12,13,14,15,16,17,18,19,20} /tmp/tabi-r22-w2b-MutateTiming/corpus/evidence/round-{12,13,14,15,16,17,18,19,20} /tmp/tabi-r22-w2b-MutateTiming/.ufo/waves/round-22/w1
```

The scratch-only driver was changed to retain stdout in memory rather than write duplicate output files. Its detector command was unchanged. Further footprint reduction used this scratch-only command, exit 0:

```text
git sparse-checkout set --no-cone /.ufo/waves/round-21/ /.ufo/waves/round-22/measure-c1.mjs /.ufo/waves/round-22/selftest-c1.mjs /.ufo/waves/round-22/fixtures/expected.json /corpus/knowledge/webmcp-lifecycle-oracle-round-22.md /corpus/evidence/round-21/runtime/ /corpus/evidence/round-22/semantic-expectations.json /scripts/webmcp-lifecycle-round21.mjs
```

All detector inputs remained at the reviewed revision. The completed pristine/mutated/restored triplet above then ran successfully with identical sparse layout, driver, bounds, and runtime.

## Restoration and cleanup evidence

`sha256sum .ufo/waves/round-22/measure-c1.mjs .ufo/waves/round-22/selftest-c1.mjs .ufo/waves/round-22/fixtures/expected.json` exited 0 before mutation and after final restoration.

| File | Before | Mutated | Restored |
|---|---|---|---|
| `measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` | `0ec8ad95621f02e287398284a9dcd1cc9535eee49ea13c16d61b1d1c6433e898` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |
| `selftest-c1.mjs` | `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6` | unchanged by probe | `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6` |
| `fixtures/expected.json` | `b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade` | unchanged by probe | `b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade` |

The completed restored selftest was 44/44 clean, and its contrast again rejected the invalid release order with exactly `semantic_delayed`.

Final cleanup command exited 0:

```text
rm -rf -- /tmp/tabi-r22-w2b-MutateTiming && test ! -e /tmp/tabi-r22-w2b-MutateTiming
```

Scratch clone and driver were removed. Only this scoped report was written in the lane. No installs/updates, browser run, fleet/lane VCS writes, delegation, seat messages, full run-checks cohort, additional timing mutants, or production fix were performed.

Report: .ufo/waves/round-22/w2b/MutateTiming.md
