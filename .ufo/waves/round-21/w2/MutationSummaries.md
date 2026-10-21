# MutationSummaries — static raw/receipt-correlation probe

## Scope and axes

Axes: raw-response correlation, failure isolation, independently persisted oracle specificity, and production-byte preservation.

Static review only. No counter, selftest, browser, build, linter, formatter, or mutation detector was executed. No production/scratch bytes were mutated. This is an author-side coverage finding, not independent admission, a killed/survived experimental result, semantic branch coverage, or actor-quiescence evidence.

Paths below are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Abbreviations:

- **M**: `.ufo/waves/round-21/measure-c1.mjs`.
- **T**: `.ufo/waves/round-21/selftest-c1.mjs`.
- **E**: `.ufo/waves/round-21/fixtures/expected.json`.
- **P**: `.ufo/waves/round-21/fixtures/positive-ordered.json`.
- **R**: `corpus/evidence/round-21/runtime/receipt.json`.

All predicted findings below are **[INFERENCE]**, conditional on the unchanged positive-fixture prerequisites passing. They are not captured CLI output or an assertion that the baseline passed.

## What the persisted controls actually contain

T:10–11 separately loads P and E. T:18–20 always selects receipt `cases[0]`, `na-pending`, and its raw evidence for the three assigned mutations. Reading P's embedded JSON showed:

- `/files/corpus~1evidence~1round-21~1runtime~1receipt.json`, parsed as JSON: `cases[0].invocationId = "invocation-00"`, `preAction.responseCount = 0`, `after.responses = []`.
- Its parsed `na-pending.json` has these original frames: sent `seq=1, at=990`; toolInvoked `seq=2, at=995`; invoke result `seq=3, at=999`; pre marker `seq=4, at=1250`; action `seq=5, at=1251`; acknowledgement `seq=6, at=1252`; post marker `seq=7, at=1751`. Both page-observation mirrors use pre/post sequences 4/7.
- **Every one of P's 12 cases has zero raw `WebMCP.toolResponded` frames and an empty `after.responses` array.** This was a read-only JSON projection, not an evaluator run. Each has its own invocation ID and one toolInvoked event. Therefore P's stored expected positive value12 (E:3–6) is not a nonempty-response positive control.

Current runtime is different from that synthetic fixture: R:59–85 records `na-click` with invocation ID `0B53A87928A9E2638D504C5088EFD942` and a Completed response containing the dummy object. The raw `na-click.json` frame `seq=14`, at `1792588023605`, has the same ID/status/output (`na-click.json:191–203`, especially :195–201). The producer's current response filter uses matching invocation ID and `seq < through` (`scripts/webmcp-lifecycle-round21.mjs:208–209,224–226`). Current acquisition provenance is `.ufo/waves/round-21/runtime-execution-bounded.json:5–16`; historical acquisitions were not treated as current controls.

## Assigned mutation analysis

### 1. `false-pending`: correlated raw event, but sequence-mirror confounding

**Mutation:** T:38 inserts a matching Completed toolResponded frame at array index2, `at=996`, leaving both receipt response summaries empty. T:97 renumbers frames and refreshes the evidence digest, but does **not** refresh page-observation sequence mirrors.

**Stored oracle:** E:93–96 requires exit1, value0, and `summary_mismatch`.

**[INFERENCE] Differential findings:**

1. `order_mismatch`, detail `na-pending:action` (M:94): the raw pre/post markers move to sequences 5/8, while `pageObservations` remains 4/7. The invoke result is now seq4, also violating `answered.seq < pre.seq` against the stale mirror.
2. `summary_mismatch`, detail `na-pending` (M:96): the inserted response is seq3 with the correct invocation ID, following toolInvoked seq2. It is before both stale cutoffs 4/7, so the raw pre count is1 rather than0 and the raw after response population is nonempty rather than `[]`.

**Conclusion:** this is **not merely an unrelated earlier rejection**. The current code accumulates findings, and the raw correlated response reaches the summary predicate. However, it is not an isolated raw/summary control: it additionally breaks the ordered observation contract. The event's timestamps remain monotonic, so the extra order finding is the action/mirror check at M:94, not the simple clock/sequence scan at M:79.

**Smallest repair to this existing control:** retain its insertion, set page-observation pre/post seq to5/8, and keep T:97's rehash. Then the intended red is isolated to `summary_mismatch` [INFERENCE]. No repair was applied.

### 2. `response-mismatch`: isolated empty-versus-invented summary, not payload equality

**Mutation:** T:39 changes only `first.after.responses` to a one-element Completed summary. Raw evidence stays unchanged and has no toolResponded event.

**Stored oracle:** E:99–102 requires exit1, value0, and `summary_mismatch`.

**[INFERENCE] Differential finding:** only `summary_mismatch`, detail `na-pending`, from M:96's comparison of the invented receipt array against the empty correlated raw array. No evidence rehash is necessary because raw bytes are untouched.

**Conclusion:** this correctly targets a summary inconsistency without an unrelated identity/order failure. But it demonstrates **response presence/cardinality**, not comparison of status/output against an existing raw correlated response. A count-only replacement for full response equality still rejects this case.

### 3. `invocation-mismatch`: command-result identity, not response-event identity

**Mutation:** T:32 changes only the receipt case's `invocationId` to `wrong-id`.

**Stored oracle:** E:57–60 requires exit1, value0, and `invoke_identity`.

**[INFERENCE] Differential findings:**

1. `invoke_identity`, detail `na-pending` (M:83–84): command-correlated raw invoke result still says `invocation-00`.
2. `event_identity`, detail `na-pending` (M:85–87): there is no toolInvoked event matching `wrong-id`.

The response arrays remain empty on both sides, so no response-summary mismatch is introduced.

**Conclusion:** the first rejection is intentional and correctly named, not an accidental earlier digest failure. It tests receipt↔invoke-result linkage, with an additional toolInvoked-identity rejection. It does **not** test wrong-ID attribution of a nonempty response. Existing `foreign-response-ignored`/`foreign-response-summary` controls already exercise exclusion of a raw foreign response (T:70–76; E:162–163); that coverage should not be omitted, but neither control supplies a nonempty legitimate response to compare against a same-sized incorrect summary.

### Oracle specificity matters

T:113–114 requires the expected finding to be present; a different earlier failure **alone** cannot make these controls pass. It permits additional findings, explaining why the false-pending mirror defect can coexist with a matching stored oracle. E's independence does not make the three controls full-payload tests: their independently stored expectations only require one finding ID, exit, and value.

## One concrete missing mutant

**Proposed mutant M1 — count-only response validation:** at the single response-equality clause in M:96, replace comparison of the complete receipt response array against raw event `params` with comparison of their lengths. Leave invocation filtering at M:85, pre-action counting, observation mirrors, windows, and all other checks unchanged.

Conceptually, replace only:

```js
!equal(c.after?.responses, events.filter(f => f.seq < post?.seq).map(f => f.params))
```

with:

```js
c.after?.responses?.length !== events.filter(f => f.seq < post?.seq).length
```

**[INFERENCE] Coverage gap:** the assigned controls do not distinguish M1 from the current full-payload predicate. False-pending and response-mismatch still have different raw/summary lengths; invocation-mismatch still has its intended command-result failure. The other reviewed response controls do not close this gap: late/foreign summaries differ in cardinality from the filtered raw population, while response-before-invoke supplies identical response params and remains rejected by event ordering (T:63–84; E:160–164). No current mutation creates a same-length, same-invocation, in-window response whose summary status/output differs from the raw payload.

This is a **predicted survivor/coverage finding only**, not an observed surviving mutant. No M1 bytes were written or executed.

## Smallest finite red and expected detector

### Literal one-leaf red on current recorded runtime

In L1's isolated/disposable control copy, change only:

```text
R /cases/1/after/responses/0/status: "Completed" -> "Error"
```

Grounding: R:76–84 has the Completed summary; the raw `na-click.json` toolResponded `seq=14` retains Completed and the same invocation ID (`na-click.json:195–201`). Leave the case-level invocation ID, raw bytes/digests, event order, page observations, windows, and response-array length unchanged.

**Expected detector [INFERENCE]:** M:96 emits exactly the added finding `{id:"summary_mismatch", detail:"na-click"}`; M:38,100 imply exit1/value0 if the pristine control has no other findings. M1 would miss that differential because both response populations have length1. This cannot be attributed to an earlier invoke-identity or ordering failure caused by the edit: those inputs do not change.

A separate one-leaf response-attribution variant is `R /cases/1/after/responses/0/invocationId -> "wrong-id"`, leaving the case-level ID and raw event correct; its intended finding is likewise `summary_mismatch`, **not** `invoke_identity`. This distinguishes it from T:32. Neither variant was applied.

### Persisted-fixture form, without depending on runtime as the oracle

P has no existing nonempty response, so a proper fixture control needs an explicit green state before the one-leaf red:

1. Starting from P's first case, insert one matching raw toolResponded immediately before its post marker, at1500, with `params = {invocationId:"invocation-00", status:"Completed"}`. Renumber frames and update only the post page-observation mirror to seq8. Pre remains seq4; action/ack remain5/6; the response isseq7, after toolInvoked and before post.
2. Put an independently persisted identical params object into `first.after.responses`; retain pre responseCount0 and all existing windows. Refresh the raw evidence digest as T:97 does. **Expected green [INFERENCE]:** exit0/value12/findings[]. This is a structural-control expectation, not a new runtime observation.
3. From that green, change only the receipt response's `status` to `Error`, retaining the raw Completed event and invocation ID. **Expected red [INFERENCE]:** exit1/value0/findings exactly `[{id:"summary_mismatch",detail:"na-pending"}]`.
4. Exact restoration to that green's original bytes should reproduce its bounded detector output; L1 owns the pristine/red/restored serial execution and actual result capture.

For an isolated false-pending red instead, omit the new response from the receipt in step2. It should yield the same sole `summary_mismatch`, without the existing T:38 mirror confound. The status-only red is the stronger discriminator for M1 because array size and response ID are held equal.

## Actual output, verdict, and restoration evidence

- **Detector output:** none; not run, including the pristine baseline. The exit/value/finding tuples above are persisted expectations or explicitly marked static inferences, not measured results.
- **Verdict:** static coverage finding; experimental killed/survived classification is **inconclusive/unexercised**. A baseline failure would also be inconclusive, not a killed mutant.
- **Restoration:** no mutation was applied, so no restore operation was needed. Two `sha256sum` invocations bracketing the read-only inspection returned identical hashes for every subject below. These are before/after inspection hashes, not fabricated mutated/restored hashes.
- **Writes:** only this assigned report. No source, fixture, fleet, sibling, git/jj/index, browser, or service changes.
- **Tools installed/updated:** none. No pacman transaction or alternative runtime was invoked.

| Subject | Before SHA-256 = after SHA-256 |
|---|---|
| `.ufo/waves/round-21/measure-c1.mjs` | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` |
| `.ufo/waves/round-21/selftest-c1.mjs` | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` |
| `.ufo/waves/round-21/fixtures/expected.json` | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` |
| `scripts/webmcp-lifecycle-round21.mjs` | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` |
| `corpus/evidence/round-21/runtime/receipt.json` | `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` |
| `corpus/evidence/round-21/runtime/na-pending.json` | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` |

Report: `.ufo/waves/round-21/w2/MutationSummaries.md`
