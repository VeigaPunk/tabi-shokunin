# MutationOrdering — round21 / w2

## Scope, axes, and execution status

Axes: independent guard detection; adjacent/equality boundary coverage; invocation correlation; unchanged evidence bytes.

Static review only, as assigned. No producer, counter, selftest, CLI control, browser, build, formatter, or other runtime was executed. No scratch mutant was materialized. Only this report was written. Behavioral predictions below are explicitly marked **[INFERENCE]**; they are not observed test results. L1 owns final serial execution. This is author-side review, not independent admission or an actor-quiescence claim.

Reviewed the current producer and bounded acquisition, not historical acquisitions: `scripts/webmcp-lifecycle-round21.mjs`; `.ufo/waves/round-21/runtime-execution-bounded.json:5-18`; canonical `runtime/receipt.json` and `runtime/na-pending.json`; the counter, independently persisted positive fixture and expected rows, selftest, and knowledge note. Paths beginning `runtime/` below abbreviate `corpus/evidence/round-21/runtime/`.

## Primary proposed mutant: permit a 249 ms pre-action window

**Smallest behavior-bearing defect:** in `.ufo/waves/round-21/measure-c1.mjs:95`, change only `c.preAction.windowMs<250` to `c.preAction.windowMs<249`.

**Finding:** the persisted `short-window` control does not distinguish this off-by-one defect. It changes only `first.preAction.windowMs` to `1` (`selftest-c1.mjs:46`), leaving `end-start = 1250-1000 = 250`. Thus it violates both the minimum and duration consistency at counter line 95. Its expected row requires only `window_mismatch` (`fixtures/expected.json:122-126`). The defect above would still reject that control; deleting the pre-window minimum altogether would also leave its duration-consistency rejection intact. These are separate predicates sharing the same finding ID.

**Smallest finite red proposal:** derive from the independently persisted positive bytes, not the live acquisition. Decode `fixtures/positive-ordered.json`'s `files["corpus/evidence/round-21/runtime/receipt.json"]` (outer line 33), and change only:

```text
cases[0].preAction.start:     1000 -> 1001
cases[0].preAction.windowMs:   250 -> 249
```

Keep `preAction.end = 1250`, all evidence frames, all marker mirrors, and all evidence hashes unchanged. The arithmetic is coherent: `1250-1001 = 249`. The send remains at 990, before the revised start. No evidence bytes need rehashing because this proposal changes only receipt bytes.

**Expected bounded detector:** the same revision-bound counter CLI used by `selftest-c1.mjs:104-114`, on L1's isolated fixture commit.

**[INFERENCE] expected results, not executed:**

| Counter bytes | Input | Expected finding objects | Expected exit / value |
|---|---|---|---|
| Pristine | Persisted positive | `[]` | `0 / 12` |
| Pristine | Proposed coherent 249 ms red | `[{"id":"window_mismatch","detail":"na-pending"}]` | `1 / 0` |
| Proposed `<249` mutant | Same coherent 249 ms red | `[]` | `0 / 12` |
| Exact restored bytes | Same coherent 249 ms red | `[{"id":"window_mismatch","detail":"na-pending"}]` | `1 / 0` |

The positive fixture already fixes pre/after windows at exactly 250/500 for all twelve rows. It therefore represents the allowed equality side; it does not supply the adjacent rejected side. For the after-window boundary, a coherent 499 ms red can keep `after.start=1251`, set `after.end=1750` and `after.windowMs=499`, and set both the after-action frame and page-observation `at` to 1750, then refresh the evidence digest. **[INFERENCE]** its sole finding should be `window_mismatch:na-pending`. Merely advancing `after.start` to 1252 would confound this test with `after.start > action.at` unless the action time is also adjusted.

**Verdict:** NOT EXECUTED / inconclusive as a behavioral mutation probe. This is a concrete missing control with a predicted surviving mutant under the persisted controls, not an observed survivor or kill.

## Audit of the four assigned controls

Relevant anchors: `measure-c1.mjs:79-96`; `selftest-c1.mjs:33,46-48,97-98,113-114`; `fixtures/expected.json:62-66,122-138`. The positive fixture's first evidence record is outer line 10; its decoded frame clocks are `990,995,999,1250,1251,1252,1751`, with pre/post observation sequences 4/7.

All finding sets in this table are **[INFERENCE]**, obtained by reading the predicates, not running them:

| Persisted control | Concrete perturbation | Predicted findings | Independence consequence |
|---|---|---|---|
| `before-action-order` | Change action `at` from 1251 to 1200. | `order_mismatch:na-pending`; `order_mismatch:na-pending:action`; `window_mismatch:na-pending`. | It simultaneously creates a global clock regression, puts action before the pre-observation timestamp, and places `after.start=1251` after action. Removing either timestamp rejection individually can leave the other `order_mismatch` result. |
| `nonfinite-clock` | Set the sent frame's `at` to JSON `null`. | `order_mismatch:na-pending`. | This independently exercises `!Number.isFinite(f.at)` at line 79. It is not a numeric clock-regression test: comparison coercion makes `995 < null` and `null > 1000` false. No missing-coverage claim is made for rejection of this particular null frame. |
| `short-window` | Set only pre-window duration to 1. | `window_mismatch:na-pending`. | Both minimum and duration arithmetic reject, so this does not independently protect the minimum. The coherent 249 ms red above removes that confound. |
| `no-invoke` | Remove all sent frames, then renumber remaining frames. | `raw_invoke:na-pending`; `invoke_identity:na-pending`; `order_mismatch:na-pending:action`. | Missing command correlation produces `invoke_identity`; absent answer and stale observation sequences also fail action ordering. Nevertheless its oracle specifically requires `raw_invoke`, so these other finding IDs cannot substitute for that required ID. |

The selftest assertion at lines 113-114 uses `ids.includes(expected.finding)`, not an exact finding/detail set. This is important in both directions: extra classes do not satisfy a missing required class, but multiple causes or details within `order_mismatch` / `window_mismatch` can mask one another. The proposed independent controls below remove those same-ID confounds without altering the contract.

## Missing timestamp/order separation controls

All proposals start from the persisted `na-pending` evidence and preserve the fixed case configuration and nonce. For evidence edits, L1 must serialize the evidence and update `cases[0].evidence.sha256`; otherwise a digest rejection would obscure the intended detector.

### 1. Finite timestamp regression, correct semantic sequence

Change only the sent frame's `at` from 990 to **996**, leaving the following toolInvoked frame at 995 and all sequences unchanged.

**[INFERENCE]** the only finding should be `{"id":"order_mismatch","detail":"na-pending"}` at counter line 79. Action ordering, window arithmetic, invocation correlation, and marker mirrors remain consistent. This directly tests the nondecreasing timestamp predicate independently of the action-specific predicate. The existing null control is not an equivalent substitute.

### 2. Wrong semantic sequence, nondecreasing finite timestamps

Starting from the positive fixture:

1. Set the action frame's `at` from 1251 to **1250**.
2. Set receipt `after.start=1250` and `after.windowMs=501`, retaining end 1751.
3. Swap the pre-action observation frame and action frame, then assign contiguous frame sequences.
4. Set the mirrored pre-action page-observation sequence to **5**; retain its `at=1250`, value, and post-observation sequence 7.

The resulting frame order is sent990, invoked995, result999, **action1250**, **pre-observation1250**, completion1252, post1751. All clocks are finite and nondecreasing. Mirrors, durations, and action-start comparisons agree, but `pre.seq=5 < action.seq=4` is false.

**[INFERENCE]** the only finding should be `{"id":"order_mismatch","detail":"na-pending:action"}` at line 94. This is an order-only red. In contrast, the existing `broken-sequence-chain` (`selftest-c1.mjs:90-93`) moves action1251 before pre1250 and therefore also creates a timestamp regression.

### 3. Equal timestamps with correct sequence: missing green boundary

The read-only fixture projection showed **zero duplicate frame clocks in every one of the twelve positive evidence records**. The green late/foreign/unavailable controls also do not introduce a same-time adjacent frame pair (`selftest-c1.mjs:54-77`). Thus equality of timestamps is not represented by the persisted green controls even though counter line 79 intentionally rejects only `<`, not `<=`.

Smallest green proposal: set the sent frame's `at` from 990 to **995**, equal to the following toolInvoked frame, preserving their sequence order and all other values. Refresh the evidence digest.

**[INFERENCE]** expected result: no findings, exit 0, value 12. This guards against incorrectly treating a Date.now timestamp tie as a sequence violation.

Equality is not hypothetical in the current acquisition: `runtime/na-pending.json:168-195` records pre-observation, action, and completion at the same timestamp `1792588022564`, with distinct sequences 12, 13, and 14. The producer allocates sequence and `Date.now()` together (`scripts/webmcp-lifecycle-round21.mjs:161-162`) and emits the action and completion markers at lines 219-221. Existing timestamp ties are therefore data to preserve, not a reason to weaken the strict sequence relation.

## No-invoke cardinality companion

A missing send is already explicitly required to produce `raw_invoke`; the unrepresented adjacent cardinality is **two** sends. Append one duplicate of the positive fixture's first sent frame after the post-observation, set its `seq=8` and finite `at=1800`, and preserve the original command and parameters. Refresh its evidence digest only.

**[INFERENCE]** `measure-c1.mjs:81` should produce only `raw_invoke:na-pending`: `sent.length` becomes 2 while the first send, one correlated result, marker sequence, and bounded summaries stay unchanged. This makes the exact-one requirement independently visible. It is not a request to run another browser invocation, and it does not change the case contract.

## Evidence preservation and actual outputs

Actual activity was source/evidence reading, JSON projection, target search, and two `sha256sum` calls. There is **no behavioral stdout, stderr, exit code, or pristine/mutated/restored detector result from this seat**. The bounded acquisition's already persisted execution output was read as existing evidence, not rerun and not credited as this probe.

Both hash calls returned the same values below. Each listed SHA-256 is the actual **before = after** value:

| Path | SHA-256 before = after |
|---|---|
| `.ufo/waves/round-21/measure-c1.mjs` | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` |
| `.ufo/waves/round-21/selftest-c1.mjs` | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` |
| `.ufo/waves/round-21/fixtures/expected.json` | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` |
| `scripts/webmcp-lifecycle-round21.mjs` | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` |
| `runtime/na-pending.json` | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` |
| `runtime/receipt.json` | `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` |
| `corpus/knowledge/webmcp-nonautosubmit-round-21.md` | `346925a8f7733b9b55b2366e8cec25bfeb26f81cca5bcf2d6397c9d83ff86db8` |

Restoration evidence: no input bytes were changed, so no restoration operation or mutant-byte hash exists; the two hash observations establish unchanged reviewed inputs. No git/jj/index operation, fleet/sibling write, delegation, or tool installation/update was performed. No source-to-binary equivalence or novel-branch/coverage-percentage claim is made.

Report: .ufo/waves/round-21/w2/MutationOrdering.md
