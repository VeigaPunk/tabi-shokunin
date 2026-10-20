# MirrorNode — node descriptive-field consistency audit (round-15 w1)

- Seat: TabiR15.MirrorNode (reviewer, leaf)
- Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
- Mode: read-only static audit. No gates, counters, tests, suites, browser runs, or source edits. Findings below are from reading source and committed bytes; anything not directly observed is marked [INFERENCE].
- Tooling: none installed or updated.

## Scope read

- `scripts/check-aria-metadata.mjs` — `parseVersion` :143-148, `SEMVER` :113, `deriveNode` :429-457, `evaluateNode` :459-483, sidecar node block :1009-1034, sidecar correction mirror block :992-998, buildSidecar node emission :1247-1262, self-test node mutation :1741-1757.
- `.ufo/waves/round-14/measure.mjs` — C2 sidecar node reader :898-925, `versionValue` :649-653, `countC2` init :655-660.
- `corpus/evidence/round-14/aria-metadata/corrected.json` :52-64 (node block), `expected-fixtures.json` :225-240 (node fixture expectations).
- Doc claims: `.ufo/waves/round-14/w1/AttackMetadata.md:79`, `.ufo/waves/round-14/w1/NodeSemantics.md:160-174`, `corpus/lessons/round-14-verifier-spotcheck.md:131`.

Committed values (read only): observed `26.12.0` (receipt, worker), pin `node.recorded 24.21.0`, `minimumMajor 20`, sidecar `exactMatch false`, `exactRecordedMatch false`, `observedMatchesRecorded false`, `minimumMajorSatisfied true`, `descriptiveOnly true`, `recordedRole "descriptive"`, `recordedIsDescriptive true`.

## Findings (severity, then evidence)

### F1 — MEDIUM — fail-open OR in the recordedRole check
- Anchor: `scripts/check-aria-metadata.mjs:1028`
  `if (sidecarNode?.recordedRole !== 'descriptive' && sidecarNode?.recordedIsDescriptive !== true)`
- The two aliases are joined with `&&` inside a negated condition, so a finding fires only when both are wrong. Contradictory pairs pass:
  - `recordedRole:"descriptive"` + `recordedIsDescriptive:false` → no `node.recordedRole` problem.
  - `recordedRole:"enforced"` + `recordedIsDescriptive:true` → no `node.recordedRole` problem.
- Effect: a sidecar can say "descriptive" and "not descriptive" at once and R14-ARIA-SIDECAR-NODE-CLAIM-01 stays green. The sidecar's own `descriptiveOnly` is only checked for `=== true` (:1027), so it does not close the gap.
- [INFERENCE from boolean reading, not executed] The committed `corrected.json` satisfies both aliases (`"recordedRole":"descriptive"`, `"recordedIsDescriptive":true`), so an AND-form fix keeps the committed sidecar valid.
- Proposed fix: require `recordedRole === 'descriptive'`, and if `recordedIsDescriptive` is present it must be `true`. Use AND, not OR.
- Proposed tests (new fixtures, each expects exit 1 and `R14-ARIA-SIDECAR-NODE-CLAIM-01` fail with `node.recordedRole`):
  - `sidecar-recordedrole-false-alias`: `recordedIsDescriptive:false`, `recordedRole:"descriptive"`.
  - `sidecar-recordedrole-enforced`: `recordedRole:"enforced"`, `recordedIsDescriptive:true`.

### F2 — MEDIUM — single-field node tampering has no self-test fixture
- Anchor: the only node-claim mutation is `check-aria-metadata.mjs:1753-1757` (`sidecar-exactnode`). It flips `exactMatch`, `exactRecordedMatch` and `observedMatchesRecorded` to `true` together, so it proves only the all-three-together case. Its expectation is `expected-fixtures.json:225-240`.
- Code paths with no fixture: `exactRecordedMatch` alone (:1016-1018), `observedMatchesRecorded` alone (:1020-1022), `minimumMajorSatisfied` (:1024-1026), `minimumMajor` (:1014), `observed` (:1012), `recorded` (:1013), `descriptiveOnly` (:1027).
- Asymmetry: the correction mirror is fully checked field by field (:992-998, six mirror fields). The node mirror is checked only partially. The round-14 spotcheck already routes this as an unchecked-mirror limitation (`corpus/lessons/round-14-verifier-spotcheck.md:131`), so F2 is a known gap with no test that would detect it.
- Proposed tests: one fixture per single-field mutation above, each expecting `R14-ARIA-SIDECAR-NODE-CLAIM-01` fail with the matching `problems` token.
- Operational note: adding fixtures changes `expected-fixtures.json` hashes. That is an L1 decision. Do not rewrite historical bytes.

### F3 — LOW-MEDIUM — optional aliases and free-text note are not enforced
- `exactRecordedMatch` (:1016) and `observedMatchesRecorded` (:1020) are compared only when present. A sidecar that omits them passes.
- `recordedIsDescriptive` is hard-coded `true` by the emitter (`:1257`), so the OR branch in F1 is never exercised by a derived sidecar.
- `node.note` (emitted `:1258-1261`) is free text and is never read by the checker. A sidecar with `exactMatch:false` and `note:"exact match with pin"` is accepted. Only `provenance.note` length is checked (:1053).
- Proposed tests:
  - `sidecar-note-contradicts-exact`: note asserts exact equality while `exactMatch:false`. Expect refusal, or an explicit decision that `note` is not a claim field.
  - `sidecar-alias-omitted`: `exactRecordedMatch` and `observedMatchesRecorded` absent. Expect an explicit decision (accept, or require presence).

### F4 — MEDIUM (latent) — the two gates enforce different node invariants
- `measure.mjs:917`: `if (exact !== false) add('sidecar_node', 'node.exactMatch must be false')`. Also `measure.mjs:905` reads the alias `node.exact` when `exactMatch` is absent.
- `measure.mjs:915`: rejects `observed === recorded` as "the correction is not qualified".
- `check-aria-metadata.mjs:1015`: only compares `sidecar.exactMatch` to the derived value. The node section (:1009-1034) has no "observed equals recorded" rejection and no "must be false" rule.
- Effect: if the pin's recorded value ever equals the observed value, the checker would accept a sidecar with `exactMatch:true` that `measure.mjs` refuses. No committed artifact currently triggers this (pin `24.21.0` ≠ observed `26.12.0`), so the effect is latent. [INFERENCE: the QUALITY6 "exact-Node claim refused" rule is enforced in the checker only through derived mismatch.]
- Proposed test: `pin.node.recorded = observed`, sidecar `exactMatch:true`. Expected outcome: refusal under both gates. Currently only `measure.mjs` refuses it.

### F5 — LOW — version-format divergence between the two gates
- `measure.mjs:906-907` accepts `v`-prefixed and unanchored versions (`/^v?\d+\.\d+\.\d+/`). `measure.mjs:649-653` (`versionValue`) also accepts `{version}` objects.
- `check-aria-metadata.mjs:113` (`SEMVER = /^(\d+)\.(\d+)\.(\d+)$/`) and `:143-148` reject both forms.
- Proposed test: `node.observed = "v26.12.0"` in receipt and sidecar. Expected: the checker refuses (`R14-ARIA-NODE-01` or `R14-ARIA-NODE-RECORDED-01`), while `measure.mjs` currently accepts it. One gate must change, or both must share one parser.

### F6 — LOW — redundant derived fields in code (no behavior change proposed for bytes)
- `check-aria-metadata.mjs:449-450`: `exactRecordedMatch` and `observedMatchesRecorded` are both `exactMatch` (same boolean, three names).
- `:454-455`: `parsed` and `shapesOk` are the same expression.
- `:473-474`: `R14-ARIA-NODE-RECORDED-01` detail hard-codes `descriptiveOnly: true` and `recordedRole: 'descriptive'`. That finding is green whenever `shapesOk` holds, so it cannot witness the descriptive claim. The constants are not derived facts.
- Collapsing these in code would change the emitter output and the derive hash (`corpus/evidence/round-14/aria-metadata/executions/derive.json`). Treat it as a separate, L1-owned change. Do not change committed sidecar bytes.

### F7 — doc drift (no edit recommended; historical reports are immutable)
- `.ufo/waves/round-14/w1/AttackMetadata.md:79` names `pinnedMatchedCoversNode:false`. That key appears nowhere in `scripts/` or `corpus/` (grep: no matches). It is absent from `corrected.json`.
- `.ufo/waves/round-14/w1/NodeSemantics.md:174` specifies top-level `executed:false`. The checker uses `execution.browser` (:1039) and top-level `derivedFromHistoricalRuntime` (:1037). The committed sidecar follows the checker, not that note.
- Use: L1 can cite these as stale descriptions in round-15 LOG/SKILL wording only. Do not rewrite them.

## Clean (checked, no defect)

- `checker:1012-1013` — observed and recorded are compared to the derived raw strings exactly.
- `checker:1014` — minimumMajor is compared to the pin-derived integer.
- `checker:1024` — minimumMajorSatisfied is compared to the derived value.
- `checker:441` — minimumSatisfied uses `observed.major >= minimumMajor`, and `minimumMajor` must be a non-negative integer (:435).
- `measure.mjs:911-912` — node.recorded is pinned to the original pin's `node.recorded`.
- `measure.mjs:908-909` — node.observed is pinned to the original receipt's `runtime.node`.

## Proposed test list for L1 (not run)

1. `sidecar-recordedrole-false-alias` (F1)
2. `sidecar-recordedrole-enforced` (F1)
3. `sidecar-exactrecorded-only` — only `exactRecordedMatch:true` (F2)
4. `sidecar-observedmatches-only` — only `observedMatchesRecorded:true` (F2)
5. `sidecar-minsat-false` — `minimumMajorSatisfied:false` (F2)
6. `sidecar-descriptive-false` — `descriptiveOnly:false` (F2)
7. `sidecar-observed-tamper` — `node.observed` changed (F2)
8. `sidecar-note-contradicts-exact` (F3)
9. `pin-recorded-equals-observed-exact-claim` (F4)
10. `v-prefixed-observed` (F5)

## Commands L1 should run after integration (MirrorNode did not run them)

- `node scripts/check-aria-metadata.mjs --self-test`
- Confirm `corpus/evidence/round-14/aria-metadata/corrected.json` still passes default check after any F1 change (AND-form is expected to keep it green; this is [INFERENCE]).
- Regenerate or re-hash `expected-fixtures.json` only if fixtures are added (L1 decision).

## Verification gaps

- Nothing was executed. Every boolean outcome above is from reading, not from a run.
- Measure.mjs call sites beyond lines 683-1015 were not read in full.
- Worker-side `runtime.node` in `corpus/evidence/round-13/aria/worker-*.json` was not re-read for this audit; agreement is taken from the checker's own derivation.

## Routing

- Code-related items (F1-F6) → `TabiR15.MetadataEnforce` (exact id) and TabiR15.
- Doc/bookkeeping (F7) → TabiR15 only (L1 owns LOG/SCORECARD/SKILL).
