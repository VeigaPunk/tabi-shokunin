# Sidecar identity and semantic-contract audit

## Scope and method

Read-only source audit of `scripts/check-aria-metadata.mjs`, its persisted fixture expectations, and the derived `corrected.json` shape. No check, gate, self-test, browser, or suite was run. The LSP device was unavailable in the mounted tool set (`read xd://lsp` returned “No such tool”); grep was used only to locate source anchors, and findings below are based on the read source ranges, not grep as semantic proof.

## Reconstructed contract: byte identity versus semantic validation

- The historical inputs are byte-anchored: `ANCHORS` fixes SHA-256 values for the canonical receipt, pin, producer, spec, config, manifest, and worker (`scripts/check-aria-metadata.mjs:61-80`). `readEntry` hashes the raw file bytes (`:158-203`); `evaluateAnchors` checks canonical receipt/pin hashes and worker hashes (`:731-773`). Producer/spec/config/manifest identities are also rechecked through receipt declarations and current files (`:594-654`). This is the strong, complete-byte source-of-truth boundary.
- The correction sidecar itself is **not** pinned to an expected full-file digest. `evaluateSidecar` computes and reports its byte hash/length (`:853-868`), but does not compare them to a trusted sidecar hash. Acceptance is based on selected semantic fields, recomputed evidence, and a clean post-correction evaluation (`:897-1108`, especially `:1095-1107`). The binding hashes copied receipt/pin digests and sorted-key JSON proof values (`:891-968`; `stableStringify` is canonical JSON, `:129-140`), rather than authenticating the sidecar's complete bytes.
- This is a coherent division if source snapshots are the authority and the sidecar is a derived, semantically checked report. A sidecar byte pin would additionally lock formatting, field order, and harmless extensions; it is not currently part of the acceptance contract. If the requirement instead intends to authenticate the sidecar artifact itself, that guarantee is absent and needs an explicit expected sidecar digest (separate from the source-input anchors).

## Findings / divergences

1. **All emitted `cleanup` mirrors are currently outside sidecar validation.** The builder emits six fields (`perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`) at `:1263-1270`. `evaluateSidecar` does not read `sidecar.cleanup`; it validates the correction and recomputed receipt, but not those mirrors (`:970-1007`, `:1083-1096`). **[INFERENCE]** A valid sidecar with any one of these emitted fields changed but all currently inspected fields left intact would still pass sidecar acceptance. In particular this lets the sidecar's visible cleanup summary contradict the authenticated worker proofs while its checker accepts it.
2. **The qualification mirror is only partially checked.** The builder emits `everyProofListensBefore`, `everyProofClosed`, and `everyProofRefusedAfterClose` at `:1271-1280`; the verifier checks only `qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, and `everyProofNotListeningAfter` (`:1060-1081`). The three omitted booleans should be checked against the raw proof set / derived predicates. **[INFERENCE]** Contradictory values in those fields are presently ignored.
3. **Other emitted correction mirrors also have gaps.** `corrections[0].derived` and `corrections[0].rule`, plus `correction.derived` and `correction.rule`, are emitted (`:1223-1245`) but not checked (`:970-1007`). These are not unknown extensions: they are named projections of the correction claim. `corrections[0].value` is optional-but-checked when present (`:985-988`), while the other two correction subfields are not.
4. **Authenticated-input mismatch is represented as failure, not “could-not-evaluate.”** The anchor finding is pass/fail (`:731-773`); `evaluateAll` aggregates only `status === 'pass'` (`:826-844`), and `runCheck` reduces the result to `ok` / exit 0 or 1 (`:1111-1143`). The examined path has no distinct indeterminate classification for a snapshot whose expected byte identity cannot be established. This does not distinguish “evidence proves the claim false” from “the historical evidence is no longer the authenticated snapshot.” The C2 contract should give anchor/authentication mismatch a `could-not-evaluate` (or equivalent typed status) and prevent it from being reported as an evaluated semantic failure/pass.
5. **A closed exact-key schema is not currently enforced.** Sidecar schema accepts either the exact schema token or a generic `kind` containing “metadata” and “correct” (`:897-905`); unknown fields are never rejected. This means the correct boundary should not be “reject every extra key” unless the contract deliberately becomes a closed schema. Extra explanatory/extension fields can remain legitimate when they do not override a named contract field or assert unchecked evidence. In contrast, every emitted named mirror (cleanup/qualification/correction) is part of the contract and must be checked. The check also validates only some copied path/byte metadata (e.g. original receipt/pin paths must be nonempty, bytes are optional at `:934-945`), so those are descriptive rather than full identity pins.

## Existing tests and proposed isolated CLI cases

`expected-fixtures.json` already provides subprocess CLI expectations, including valid sidecar, bad digest, wrong correction direction, and false exact Node claim (`corpus/evidence/round-14/aria-metadata/expected-fixtures.json:141-239`); fixture construction and subprocess assertions are in `scripts/check-aria-metadata.mjs:1730-1853`. It has no cleanup/qualification-mirror tamper cases. The self-test checks requested finding IDs/statuses but does not require a complete finding set for failing cases (`:1840-1853`), so each new test should assert both the specific mirror finding and that no sidecar acceptance occurs.

Recommended isolated CLI cases for L1 to add:

- Start from the valid old-receipt fixture and valid derived sidecar. Mutate each of the six `cleanup` mirrors one at a time; each must make `R14-ARIA-SIDECAR-ACCEPTED-01` fail and report a mirror/qualification-specific mismatch.
- Mutate each of the three unchecked qualification booleans one at a time; same expected refusal.
- Mutate `corrections[0].derived`, `corrections[0].rule`, `correction.derived`, and `correction.rule`; verify those named correction mirrors cannot contradict the recomputation.
- Add an unrelated top-level extension field to a valid sidecar (and optionally reorder keys/whitespace); semantic acceptance should remain unchanged if open extensions are intended. This proves the checker enforces named claims without pretending it byte-pins the sidecar.
- Tamper one byte of a canonical authenticated source snapshot in an isolated fixture and assert the new typed `could-not-evaluate` result, distinct from a semantically evaluated bad proof. Include an intact canonical source control that still produces the established result.

For the emitted `cleanup.allNotListeningAfter`, note its builder source is `allValuesOk` (`:1174`, `:1267`), which means the complete proof qualification predicate, not merely “every listeningAfter is false.” Keep that definition explicit in any expected predicate/test so that the mirror has one unambiguous meaning.

Suggested post-integration commands for L1 (not run here):

```sh
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json
```

Confidence: high on source-level byte/semantic distinction and enumerated unchecked fields; predicted pass behavior for mutated mirrors/extensions is static inference only and was not exercised, per the read-only/no-check boundary.
