# Wave metadata guard: return phase

## Counterexample

The checker rejects an explicit `phase: "return-after-integration"`, but it cannot tell a real before-integration capture from a later/reconstructed JSON that merely asserts `phase: "return-before-integration"`. **[INFERENCE]** A post-import snapshot with the positive fixture's required phase, `observed: true`, pinned baseline, empty `trackedDiff`, required untracked source line, and in-scope `??` paths passes the predicates; capture actor/order and timestamps are not authenticated or checked. This is a provenance boundary, not a defect in rejecting the wrong phase string.

## Evidence

- `check-wave.mjs:92-134` checks the asserted phase, observed boolean, baseline, reconstruction-marker strings, required source status line, porcelain shape, tracked diff, and path prefixes. `runCheck` (`:158-167`) reads only spec, registry, and snapshot JSON. It neither reads `before.json`, `isolation-ledger.json`, or `integration.json` nor obtains a trusted capture event.
- `check-wave.mjs:10-12` calls direct capture before clone import an operational requirement “not enforced here”; `:5-8` explicitly disclaims proving who/when and timestamp ordering. The synthetic `positive_clean_triple` (`:170-196`) is accepted based on asserted fields. `wave-check-expected.json` accurately scopes its fixtures as metadata guard tests, not independent observation or certification; `phase_return_after_integration` checks only rejection of the literal after-integration phase.
- At checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (HEAD), `w1/return.json` asserts `return-before-integration`, `observed: true`, `captureActor`, and `all64Settled`; its asserted capture time is `10:17:25.170471+00:00`. The isolation ledger says `beforeIntegration: true`, separately lists `importedAt: 10:17:47.976068+00:00`, and explicitly says the metadata checker does not independently prove capture actor/order (`snapshotLimits`). `integration.json` records accepted dissent that the return snapshot was before imports. These are relevant author-authored records, not proof that this checker verified their chronology.

## Axes impacted

- **Metadata consistency / phase-label detection:** covered for an explicitly wrong phase value.
- **Capture provenance and temporal ordering:** not covered; `observed`, actor, settled count, and time are declarations.
- **Actual isolation / no-import-before-capture:** not covered by the checker; its accepted status/tracked-diff fields are snapshot assertions.
- **Claim boundary:** consistent only when called a finite author-authored metadata guard, not independent capture/isolation evidence.

## Smallest safe correction

No code change is needed if this boundary remains explicit. Keep describing checker success as metadata consistency only, and do not use it to certify direct capture, import ordering, or isolation. If those become acceptance criteria, add an independently trusted capture/closure source binding the snapshot bytes to an ordered event; more self-asserted JSON fields or timestamps cannot close this gap.

**Verification:** source and committed records inspected at the stated checkpoint; no selftest, build, or other executable check run.