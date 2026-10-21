# CounterSourceDigest — round-20 author-side mutation probe

## Scope and axes

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Axes examined: retained-byte integrity, independent expected pairs, fixed source-pin binding, finite-schema coverage, and isolation/restoration. This is author-side falsification evidence, not external closure or a round-admission judgment. C1 remains twelve documented SOURCE-ONLY Chromium 154.0.8037.97 decisions; the depth scalar remains 8. Mechanical validation does not establish semantic truth, domain coverage, browser behavior, or runtime capability.

## Mutant and expected detector

**One data mutant:** append one LF byte (`0a`) to the retained `corpus/evidence/round-20/sources/html_form_element.cc` Map value. Zero-based offset: **68278**; length **68278 → 68279**. No other input changed. The entire original prefix and all twelve pinned span texts remained byte/text-identical. Manifest quotes, declared source digest, registry, and note were not regenerated or edited.

Independent fixed expected pairs, checked against committed `expected.json` before evaluation:

```json
{"exit":0,"c1_lifecycle_decisions":12,"findings":[]}
{"exit":1,"c1_lifecycle_decisions":12,"findings":["source_digest_mismatch"]}
```

The first is the pristine/restored oracle; the second is `source_digest_edit`. Neither was obtained from an evaluator result. `expected.json:80-84` persists the mutant pair, and `selftest-c1.mjs:317` defines the same one-newline defect.

## Executed bounded probe and actual outputs

One Node **v26.12.0** invocation, `node --experimental-vm-modules --input-type=module --eval <in-memory payload>`, made exactly **three** calls to the same unmodified `evaluate(Map)` export: pristine, mutated, restored. The payload loaded the eight checkpoint blobs below with `git -c core.fsmonitor=false -c core.quotepath=false cat-file blob COMMIT:PATH`; the evaluator received only manifest/note/source/registry buffers. The exact committed counter was loaded with `SourceTextModule` and a file-URL import-meta binding; only its `node:` imports were linked. Its CLI remained inert. The selftest runner was inspected as data, not invoked.

The mutation/restoration operations used were:

```js
const saved = Buffer.from(files.get(paths.source));
try {
  const changed = Buffer.concat([saved, Buffer.from('\n')]);
  files.set(paths.source, changed);
  mutated = call(); // the same evaluate(files), with exceptions captured
  mutationHashes = hashes(files);
} finally {
  files.set(paths.source, Buffer.from(saved));
}
const restored = call();
```

Actual returned objects:

```text
pristine {"exit":0,"c1_lifecycle_decisions":12,"findings":[]}
mutated  {"exit":1,"c1_lifecycle_decisions":12,"findings":["source_digest_mismatch"]}
restored {"exit":0,"c1_lifecycle_decisions":12,"findings":[]}
{"verdict":"killed","evaluateCalls":3,"dataMutations":1}
```

Harness exit status: **0**. Actual stderr was only the Node VM experimental warning:

```text
(node:1944415) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```

**Mutation verdict: killed.** The pristine control succeeded, so this is not a baseline-failure classification. The mutant retained a raw count of 12 but exited 1; `measure-c1.mjs:29-32` explicitly admits a count only with exit 0.

## Hashes and exact restoration

All values below are observed SHA-256 values of committed input buffers. The three inspected files and design also matched their checkpoint Git blob OIDs via read-only `git ls-tree` / `git hash-object` binding before the probe.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `.ufo/waves/round-20/design.json` | 4198 | `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da` |
| `.ufo/waves/round-20/measure-c1.mjs` | 30974 | `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6` |
| `.ufo/waves/round-20/selftest-c1.mjs` | 23075 | `5804cf6a73a497bfbaf3c6265a7b1852760f6b52d930de4af7ba7674543544a5` |
| `corpus/evidence/round-20/selftests/expected.json` | 8522 | `458a9f3fa069936d0f3e13a4200b122dc9926d787f3d6e068625ff0e9fb744d1` |
| `corpus/evidence/round-20/lifecycle/decisions.json` | 6303 | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` |
| `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` | 15827 | `3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4` |
| `corpus/evidence/round-20/sources/html_form_element.cc` | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| `corpus/SOURCES.md` | 82006 | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` |

Source SHA-256 progression:

```text
before   8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916
mutated  161797c88e54fc0da2bf68e189e761cd303befda0df56195417e78c18af0c277
restored 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916
```

Actual restoration checks returned `restoredExactly: true` (byte equality for every Map value) and `allInputHashesMatchBefore: true`. `changedPaths` during mutation contained only the retained source path. The manifest/note/registry hashes in the table were identical at every stage. Restoration was inside `finally`; no production file, clone, Git index, jj state, historical lesson, or knowledge byte was written. The report is the sole filesystem output of this seat.

## Static findings and coverage limits

1. **Whole retained-source digest binding held for this defect.** `measure-c1.mjs:304-315` hashes the actual retained bytes against its fixed source SHA-256 before exposing source lines; a mismatch adds `source_digest_mismatch` and returns null. Quote membership checks at `365-367` require those verified source lines. The appended LF is outside every cited span, yet rejection still occurs: literal quote agreement alone is not being substituted for whole-source integrity.
2. **No quote-selfhash substitution was found in the inspected paths.** The counter's source constant (`68-71`) is checked independently by manifest source-record validation (`284-290`), retained-byte validation (`304-315`), and registry digest-token validation (`514-517`). The fixture runner has its own literal pin (`selftest-c1.mjs:36-50`), hashes the retained blob in preflight (`167-179`), and separately checks quote membership. It does not derive that pin from the quotes or import counter `PINS`. The committed expected pairs are loaded at `130-162` and compared at `348-358`; actual evaluator results do not rewrite them.
3. **Finite coverage is explicitly incomplete, not a demonstrated digest bypass.** Read-only set/count inspection in the same payload found **34 expected cases**, **20 persisted finding reasons**, and **24 registered counter reasons**. `FINDING_IDS.filter(reason => !expected.reasons.includes(reason))` returned exactly `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, and `table_heading_duplicate`. `loadExpected:145,160-161` requires persisted reasons to be registered and exercised, but does not require all registered reasons to occur. Source metadata URL/id/path negatives exist; there is no dedicated fixture for a manifest-source SHA-only change, missing/extra source keys, or the four omitted reason classes. No additional mutation was run for these gaps.
4. **Recorded design hash is not a runner-enforced field.** `expected.json:4-6` records the design SHA, but `selftest-c1.mjs:130-162` never reads `doc.design`; it enforces source fields and the finite case/reason set instead. This probe independently checked the checkpoint design's SHA against that recorded value and observed a match. This is a static metadata-binding/coverage limitation, not an exercised alternate-input failure.

No full selftest, full gate suite, build, formatter, browser, network refetch, or target-code execution was run. No tools were installed or updated. The probe establishes only the specified local retained-byte rejection and restoration behavior; it does not establish external source authenticity or semantic correctness of the twelve prose decisions.

Report: .ufo/waves/round-20/w2/CounterSourceDigest.md
