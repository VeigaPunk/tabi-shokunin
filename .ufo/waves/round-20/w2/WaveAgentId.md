# Wave metadata guard: member `agentId`

## Axes
- **Predicate correctness:** a present registry member must have a nonblank string `agentId`.
- **Regression sensitivity:** the fixture suite should distinguish a blank value from an absent property.
- **Evidence boundary:** metadata assertions must not be presented as independent isolation or capture proof.

## Finding — missing-property case is not exercised (fixable test gap)
At checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`, `checkMembers` uses `!isNonBlank(member.agentId)` for each member (`check-wave.mjs:50-51,81-89`), so the current implementation does reject a missing property (`undefined`), as well as whitespace-only and non-string values. I found no current false negative for the scoped field predicate.

However, `buildFixtures()`'s only `agent_id_missing` mutation assigns `''` (`check-wave.mjs:198`); `wave-check-expected.json` has just that one expected case. Thus an implementation regression that rejects `''` but accidentally accepts an absent `agentId` would not be caught by the specified selftest. **Smallest safe correction:** retain this blank-string case and add a separate fixture that deletes `CriticClaims.agentId`, expecting exit 1 with `agent_id_missing`. A whitespace-only fixture is useful but not required to close the missing-property gap.

The checkpoint input itself is clean on this facet: registry has 64 members, no missing/blank IDs and no duplicate IDs; its 64 names match the 64 planned `spec.items[].name` values. These are read-only data inspections, not a test run.

## Boundary — finite metadata check is not isolation/capture evidence
The checker accepts only `spec`, `registry`, and `snapshot`; it does not read `isolation-ledger.json` or `integration.json`. It checks asserted fields such as `snapshot.phase`, `observed`, `baseline`, and status text. Its own header says it cannot prove who captured the snapshot or when. At this checkpoint, `return.json` asserts `captureActor`, `all64Settled`, and `capturedAt`; the isolation ledger lists four writer clones/commits/bundles and explicitly says the metadata checker does not independently prove capture actor/order. `integration.json` says verification is “Not yet run.” These records are useful provenance/author assertions, but this checker cannot authenticate them or establish isolation or direct-capture chronology. Do not claim that a clean `check-wave` result proves those properties.

Adjacent scope note, not a current roster omission: `checkMembers` validates IDs only for entries present in `registry.members`; it does not compare that set to `spec.items`. The checkpoint data has exact 64-name agreement, but a dropped registry entry would not be reported by the ID predicate alone. Only add roster-set checking if the guard's declared contract is expanded to require completeness.

No tests, builds, or code changes were performed.