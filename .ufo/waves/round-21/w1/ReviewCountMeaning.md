# ReviewCountMeaning

## Finding

### High — Fixed IDs are not bound to their required scenario values

`measure-c1.mjs:32` checks the set of 12 IDs, but the per-case checks at `:46-55` validate only field shape, evidence identity/digests, and fixture linkage. At `:58-71`, raw invocation and action evidence are compared to the receipt's own `action`/`mode` values; no predicate compares a case ID with its required `autosubmit`, `action`, or outcome `mode`. The result then reports `cases.length` at `:75` whenever no other finding was added.

The producer's fixed scenario table does define those expected values: `scripts/webmcp-lifecycle-round21.mjs:14-26` maps `na-click` to `(false, click, success)`, `na-reject` to `(false, requestSubmit, reject)`, the two auto controls to `(true, none, success|invalid)`, and likewise for the other IDs. The shared contract names these 12 fixed scenarios (`.ufo/waves/round-21/w1-spec.json:3`); the scorecard describes the metric as 12 receipt-bound loopback scenario observations, not branch coverage (`SCORECARD.md:973-985`).

**Falsifiable failure shape [INFERENCE, not executed]:** preserve the required 12 IDs and valid producer/source/fixture digests, but consistently relabel `na-click`'s receipt action, evidence action, and action frame to `none` (or relabel an `na-reject` mode to `success` with internally consistent evidence). The current predicates do not compare that tuple with the producer table; if the remaining evidence is self-consistent, the counter has no ID-to-scenario check to reject it and can return a clean count of 12. This would count a mislabeled/omitted fixed scenario as one of the required observations.

**Minimum acceptance:** bind every fixed ID to its expected `(autosubmit, action, mode)` tuple and fail with a stable finding when any receipt/evidence tuple differs. Add an independent persisted red selftest for at least action substitution and autosubmit/mode substitution, with its expected nonzero exit/finding. The current selftest mutation switch (`.ufo/waves/round-21/selftest-c1.mjs:17-48`) covers case-set, digest, invoke, timing, and cleanup mutations but has no scenario-tuple substitution.

## Count meaning checked against prior record

The intended meaning is well-bounded: round20 says the scalar remains 8 and explicitly rejects interpreting 12 as novel predicates, domain coverage, capability, or promotion (`corpus/lessons/round-20.md:3-6`); it also says the mechanical counter does not establish semantic truth (`:16-20`). Round19 distinguishes 27 admitted decisions from source rows and excludes unexercised or unresolved candidates (`corpus/lessons/round-19.md:12-20`). Round17's four-entry count similarly credits only entries meeting its stated per-entry checks, not label-only entries (`corpus/lessons/round-17.md:17-27,43-47`). The round21 metric name and scorecard wording therefore preserve the documentary-observation interpretation; the issue above is that the counter does not yet enforce the named scenario identity within that interpretation.

## Residual risk and verification gaps

- LSP is unavailable in this session: `read xd://lsp` returned “No such tool”. Static locating used text search, but the finding is grounded in direct reads of the listed source lines, not grep as semantic proof.
- The isolated `clones/BuildCounter` tree had no round21 wave files (its `.ufo/waves` listing ended at round20); no `BuildRuntime` clone was listed. I reviewed only the available lane-root counter, selftest, producer, shared contract, scorecard, and r17/r19/r20 lesson artifacts; no clone result is attributed here.
- No tests, builds, browser, or runtime checks were run, per assignment. The falsification shape remains a static prediction, not an observed counter result.
