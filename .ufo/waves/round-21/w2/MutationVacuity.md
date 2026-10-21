# Round21 W2 — MutationVacuity

## Scope and axes

- **Depth:** exact fixed12 case accounting and non-vacuous cleanup predicates.
- **Calibration:** distinguish persisted oracle values, static predictions, and executed results.
- **Operability:** identify one minimal missing finite red control for L1's serial CLI execution.

Author-side leaf review only. No admission judgment, source mutation, scratch mutation, browser, delegation, build, test, formatter, counter invocation, or selftest invocation occurred. Only this report was written. No tools were installed or updated.

Anchors below are relative to the lane root:

- **M:** `.ufo/waves/round-21/measure-c1.mjs`
- **T:** `.ufo/waves/round-21/selftest-c1.mjs`
- **E:** `.ufo/waves/round-21/fixtures/expected.json`
- **P:** `.ufo/waves/round-21/fixtures/positive-ordered.json`
- **R:** `corpus/evidence/round-21/runtime/receipt.json`

## Requested five attacks: explicit rejection paths

The values in this table are **persisted expectations**, not observed detector outputs. Each proposed input starts from P. T:97-98 reserializes a changed case and updates its receipt evidence digest, so the PID controls exercise the cleanup predicate rather than merely breaking a digest.

| Attack | Actual finite input edit in T | Counter anchor | Independently persisted expectation |
|---|---|---|---|
| `empty-pids` | T:35, first evidence `browserPidsBefore=[]`, `changed=true` | M:97 requires an array, nonzero length, and positive integer members | E:74-79: exit 1, value 0, finding `context_cleanup` |
| `survivor` | T:36, first evidence `browserPidsAfter=[1000]`, `changed=true` | M:97 requires exact JSON equality to `[]` | E:80-85: exit 1, value 0, finding `context_cleanup` |
| `cleanup-summary` | T:37, receipt `cleanup.browserClosed=false` | M:50 requires both cleanup booleans to be strictly true | E:86-91: exit 1, value 0, finding `cleanup` |
| `missing-case` | T:26, receipt `cases.pop()` | M:46 checks length and sorted ID multiset against M:9's fixed12 | E:20-25: exit 1, value 0, finding `case_set` |
| `duplicate-case` | T:27, receipt `cases[11]=structuredClone(first)` | M:46 checks the multiset, not merely length; M:66 also detects the cloned nonce | E:26-31: exit 1, value 0, finding `case_set` |

[INFERENCE] None of these five literal edits has a count12 path in the inspected evaluator: each necessarily adds its named finding, and M:100 returns zero whenever any finding exists. The duplicate edit also yields `nonce_reused`; T:113-114 requires the expected `case_set` finding specifically, so an unrelated rejection alone does not satisfy that control. No executed kill is claimed.

P:33's embedded receipt was independently projected with the read tool: it contains all 12 named IDs, 12 distinct nonces, and `cleanup:{browserClosed:true,serverClosed:true}`. P:10's embedded first evidence has `browserPidsBefore:[1000]`, `browserPidsAfter:[]`, and `contextClosed:true`. These are synthetic detector inputs, not proof that a browser ran. E:2-13 separately declares positive `(exit=0,value=12)` and absent receipt/note baseline `(exit=0,value=0)`; neither was run here.

## One missing mutant: drop the server-close summary guard

**Concrete attack:** accidentally weaken M:50 from

```js
if (receipt.cleanup?.browserClosed !== true || receipt.cleanup?.serverClosed !== true) add('cleanup','browser/server');
```

to

```js
if (receipt.cleanup?.browserClosed !== true) add('cleanup','browser/server');
```

This is one behavior-bearing predicate deletion, proposed only; no source bytes were changed.

**Static coverage finding:** T:37's `cleanup-summary` flips only `browserClosed`. The complete mutation switch T:22-95 never changes `serverClosed`, and E:1-170 contains no server-close-specific red control. All receipt-bearing controls inherit `serverClosed:true` from P:33. Consequently, this particular predicate deletion is not distinguished by the persisted fixture inputs. This is not a measured surviving-mutant result.

**Smallest new finite red case:** retain the complete positive fixture and change only the receipt leaf `cleanup.serverClosed` from `true` to `false`, leaving `browserClosed:true` and every case byte unchanged. A receipt-only edit requires no case-evidence digest rebinding. In T's existing convention, its entire mutation body would be:

```js
case 'cleanup-server-summary':r.cleanup.serverClosed=false;break;
```

Its independent E oracle should be:

```json
{"name":"cleanup-server-summary","exit":1,"finding":"cleanup","value":0}
```

**Expected detector:** the existing revision-bound CLI (`node .ufo/waves/round-21/measure-c1.mjs FULL_COMMIT_HASH`) through T:104-115's disposable-repository path. L1 owns execution; no repository or fixture edits were made by this seat.

[INFERENCE] Conditional on the existing pristine positive fixture being green, the new red case should produce `exit:1`, `value:0`, `verdict:"failed"`, and `findings:[{id:"cleanup",detail:"browser/server"}]` on pristine M. Under the proposed predicate-deletion mutant, the same red input would instead follow the positive path to `exit:0`, `value:12`, `verdict:"clean"`, `findings:[]`. Restoring M should restore the red result. These are predictions for a finite pristine/mutated/restored comparison, not captured stdout. An unsuccessful pristine positive control would make that experiment inconclusive.

This control catches a count12 admission despite an explicitly false fixture-server closure summary, without changing the finite12 contract or asking for universal process-liveness evidence.

## Current acquisition anchors and limits

The review used the current acquisition, not archived runs. `.ufo/waves/round-21/runtime-execution-bounded.json:5-15` records the bounded producer invocation, its producer digest, and stored exit 0. This is an existing execution record, not an execution performed by this seat. R:4-6 carries the same producer digest. A read-tool JSON projection of R independently returned the exact 12 IDs and both cleanup booleans true; R:681-684 contains those booleans.

Current `runtime/na-pending.json:249-263` records a nonempty before set, `browserPidsAfter:[]`, and `contextClosed:true`. Its launch start identities are at :264-301, refreshed close PIDs at :302-312, and post-close set/final identities at :313-351. Producer `scripts/webmcp-lifecycle-round21.mjs:72-104` implements that refreshed ownership/identity collection; :236-250 handles boundary failure and browser/server summary construction. These retained fields are not a fresh liveness observation. M:97 checks the PID arrays and context flag, not every start-identity field.

`corpus/knowledge/webmcp-nonautosubmit-round-21.md:88-89` explicitly requires context cleanup and fixture-server closure even after failure; :103-106 limits the gate to recorded relationships/digests rather than universal semantics or authenticity. The proposed missing red control targets that existing server-closure obligation, not S100 source/binary equivalence, reset/remove source interpretation, novel branch count, or a coverage percentage.

## Actual output, verdict, and restoration evidence

- **Actual detector stdout/stderr:** none; execution was forbidden by this static-review assignment.
- **Mutant applied:** none. The proposed mutant is the single server-close predicate deletion above.
- **Mutation verdict:** **inconclusive / not executed**. Static finding: the independent control set lacks an input falsifying the server-close conjunct. Neither `killed` nor `survived` is an observed result.
- **Restoration:** not needed because no reviewed bytes were changed. Two `sha256sum` observations, before report creation, returned identical values for every inspected mutation input below. These are preservation fingerprints, not a detector run or an actor-quiescence claim.

| Path | Before SHA-256 | After SHA-256 |
|---|---|---|
| M | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` |
| T | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` |
| P | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` |
| E | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` |
| `scripts/webmcp-lifecycle-round21.mjs` | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` |
| R | `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` | `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` |
| `corpus/evidence/round-21/runtime/na-pending.json` | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` |

Report: .ufo/waves/round-21/w2/MutationVacuity.md
