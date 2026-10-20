# TamperManifest — round 15 w1 (read-only audit)

Scope: manifest/spec/config/producer identity failures and `snapshot_tampered` classification in
`scripts/check-aria-metadata.mjs` (the `aria-historical-metadata` gate), its registry row, its
self-test fixtures, and the fleet Gate-standard text it must satisfy.

Author-side report. Not non-author certification. No gate, self-test, witness, derive, counter,
browser, or suite was executed. No source, evidence, or lesson file was edited. Tools installed or
updated: none. Read-only commands run: `sha256sum` over anchored inputs, `git status --porcelain`.

## 1. Axes

- A. Classification: tamper of an authenticated snapshot must exit 2 `could-not-evaluate`
  (`snapshot_tampered`); semantic invalidity must exit 1 `failed`.
- B. Identity coverage: every anchored snapshot (receipt, pin, worker, manifest, spec, config,
  producer) and every sidecar-claimed identity must be checked against bytes, not declarations.
- C. Self-test coverage: each exit class and each tamper path has an isolated expectation.
- D. Verdict vocabulary: CLI tokens match the fleet vocabulary `clean | failed | could-not-evaluate`.

## 2. Standard being applied

- `PROTOCOL.md:390-397` (`## Gate standard`, "Two evidences"): "`expected.json` MUST pin the digest of
  every snapshot input file, and the gate verifies those digests before comparing verdicts: an edited
  snapshot is `snapshot_tampered` (could-not-evaluate), not a compared verdict, and a baseline without
  digests is reported `unpinned (legacy)`."
- `PROTOCOL.md:379-384` (`## Gate standard`, "Verdict"): `0`=clean, `1`=failed; every other declared
  code maps onto `clean | failed | could-not-evaluate`; "an undeclared nonzero code reads as
  `could-not-evaluate`".
- `SKILL.md:1755` registry row `aria-historical-metadata`: "0 clean, 1 failed, 2 could-not-evaluate".
  `SKILL.md:1742-1743`, `1747-1749`: sidecar must be digest-bound; original bytes immutable.
- `corpus/lessons/round-14-verifier-spotcheck.md:185-186` (items 2 and 3) already routes both defects
  below to the tabi owner. This report confirms them against current source.
- Fleet precedent for the same classification: `.ufo/gates/root-ledgers.py:30,62,322-326,350-353`
  (`snapshot_tampered` → exit 2 before comparison); `.ufo/waves/round-15/closure-check.py` digest
  verification before verdict compare (~`1814-1817`).

## 3. Verified facts (read-only)

Anchored bytes match their constants today. `sha256sum` of the live files:

| Anchor | Path | Live sha256 | Matches constant |
|---|---|---|---|
| receipt | corpus/evidence/round-13/aria/receipt.json | b458b351…a1989b7 | yes (`ANCHORS.receiptSha256`, `:63`) |
| pin | corpus/evidence/round-13/aria/runtime-pin.json | 4d894756…cd16ccd2 | yes (`:64`) |
| manifest | corpus/evidence/round-13/aria/manifest.json | 56764241…e0d72112 | yes (`:68`) |
| spec | corpus/evidence/round-13/aria/aria-loopback.spec.mjs | 03cb4e17…f9e4fc | yes (`:66`) |
| config | corpus/evidence/round-13/aria/playwright.config.mjs | 87ae779b…7b3f4 | yes (`:67`) |
| producer | scripts/aria-loopback-round13.mjs | 1d54c9e9…4af9c | yes (`:65`) |
| worker | corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json | 0d0f00e2…03a5e7 | yes (`:70-71`) |

`git status --porcelain`: only `?? .ufo/waves/round-15/` (untracked wave dir). No anchored file is dirty.
Current bytes are therefore clean. The defects below concern classification and coverage, not a present
byte mismatch.

Structural facts (from source, `scripts/check-aria-metadata.mjs`):

- F1. No `snapshot_tampered` token exists anywhere in the file (grep: 0 hits). No `could-not-evaluate`
  verdict is ever printed by `check` mode.
- F2. `runCheck` exit is `ok ? 0 : 1` (`:1135`). `evaluateAll` `ok` is `findings.every(pass)` (`:843`).
  Exit 2 can only come from usage (`:2153`), `--derive` out-path refusal (`:1326`, `:1406`, `:1443`),
  and the fatal catch (`:2261`).
- F3. Every input/anchor/identity mismatch is pushed as a `fail` finding, and each yields exit 1.
- F4. `readEntry` reason codes (`missing | symlink | not_regular | unreadable`, `:158-215`) are
  converted to findings, never to exit 2.
- F5. The self-test expectation set (`corpus/evidence/round-14/aria-metadata/expected-fixtures.json`,
  15 cases, ids at lines 29, 49, 65, 81, 101, 117, 133, 155, 169, 185, 203, 221, 239, 252, 266) has
  `expectedExit` values only in {0, 1}. There is no exit-2 case.

## 4. Defects (severity order)

### D1 — HIGH — anchor/identity mismatches classified as `failed` (exit 1), not `snapshot_tampered` (exit 2)

- Anchor compares: `evaluateAnchors` `:731-773` (`receipt_sha256`, `pin_sha256`,
  `anchored_*_at_noncanonical_path`, `worker_sha256:*`, `worker:unanchored:*`) → finding
  `R14-ARIA-ANCHOR-01 fail`.
- Source identity: `evaluateSourceIdentity` `:594-655` (`spec.currentSha256` `:643`,
  `config.currentSha256` `:645`, `manifest.currentSha256` `:624`, `worker.sourceSha256` `:630`,
  declared producer digests `:613-620`) → `R14-ARIA-SOURCE-01 fail`.
- Manifest: `evaluateManifest` `:657-696` → `R14-ARIA-MANIFEST-01 fail`.
- Pin: `evaluatePin` `:698-729` → `R14-ARIA-PIN-01 fail`.
- Exit: `runCheck` `:1135` → 1.
- Required by `PROTOCOL.md:396-397` and lesson item 3. A tampered anchored snapshot must not be a
  compared red verdict.
- Subtlety: the historical red `R14-ARIA-CLEANUP-LISTENING-AFTER-01` on the *unmodified* receipt must
  remain exit 1 (it is correct, not tamper). Classification must key on "anchored bytes differ from the
  constant", evaluated before semantic findings.

### D2 — HIGH — missing / unreadable / symlinked / non-regular / malformed inputs exit 1, not 2

- Receipt and pin: `prepareContext` `:776-824` → `R14-ARIA-INPUT-01 fail` (`:798-811`) → exit 1.
- Sidecar: `evaluateSidecar` `:853-882` → `R14-ARIA-SIDECAR-01 fail` (`:858`) → exit 1.
- Spec/config: `:640-645` (`spec:missing`, `config:symlink`, …) → exit 1 via SOURCE-01.
- Check-input (`--check <path>`) unreadable: `main` `:2199-2221` prints `verdict=red` and returns 1.
- Fixture `malformed-receipt` (`expected-fixtures.json:178-185`, `expectedExit: 1`, finding
  `R14-ARIA-INPUT-01`). A truncated-JSON receipt (`malformedBytes`, self-test ~`:1721`) is a parse
  error. The registry row says "missing input, parse error … → 2" implicitly via the fleet map; the
  Protocol makes it explicit (`PROTOCOL.md:381-382`). This fixture encodes the wrong class.

### D3 — MEDIUM — CLI verdict tokens outside the fleet vocabulary

- `check` mode prints `verdict=${ok ? 'clean' : 'red'}` (`:2234-2236`); witness `:2170-2172`; derive
  `:2187-2189`; check-input failure `:2216` prints `verdict=red` while exit is 1.
- Fatal path (`:2252`) prints `verdict=red` while exit is 2 (self-contradictory).
- Usage path (`:2143`) prints `verdict=invalid` with exit 2.
- Protocol vocabulary is `clean | failed | could-not-evaluate` (`PROTOCOL.md:379-384`).
  The `SKILL.md:1755` row maps 0/1/2 onto exactly those three words, but the printed token is never
  one of them for exit 2.

### D4 — MEDIUM — no self-test exercises the could-not-evaluate class

- `expected-fixtures.json` `expectedExit` ∈ {0, 1} only (cases at lines 10, 38, 58, 74, 90, 110, 126,
  144, 162, 178, 196, 214, 232, 251, 265).
- Runner: `if (child.status !== testCase.expectedExit)` assertion in the self-test loop
  (`~:1800-1830`). Exit-2 paths therefore have zero coverage, which is why D1/D2 are unobserved.
- `results.length >= 4` and `casesOk` (`~:1894`) do not require any exit-2 case.

### D5 — MEDIUM — sidecar mirrors and identity fields are written but not checked

Builder writes (`buildSidecar` `:1151-1281`): `cleanup.{allClosed, allRefusedAfterClose,
derivedListeningAfter, perWorkerCount, summaryServerOk}` (`:1265-1269`);
`qualification.{everyProofListensBefore, everyProofClosed, everyProofRefusedAfterClose}`
(`:1276-1278`); `source.spec.sha256` (`:1208-1209`); `source.manifest.sha256` (`:1211-1213`);
`source.{receipt,pin}.bytes` and `original.{receipt,pin}.bytes`; `corrections[0].derived`/`rule`.

Checker reads (`evaluateSidecar` `:853-1107`): correction `:970-1002` (checks `corrections[0].path/from/to/
value/supportingProofs` and mirror `correction.field/pointer/observed/corrected/derived/supportingProofs`);
binding `:909-968` (receipt/pin sha candidates `:912-923`, perWorker `:950-954`, producer `:956-960`);
provenance `:1036-1058`; qualification `:1060-1081` checks only `qualified`, `status`,
`qualification.{qualified, proofCount, allProofsSupportCorrection, allProofsComplete,
everyProofNotListeningAfter}`.

Unchecked by source reading: all `cleanup.*` mirrors; `qualification.everyProof{ListensBefore,Closed,
RefusedAfterClose}`; `source.spec.sha256`; `source.manifest.sha256`; all `*.path` under `source`;
all `*.bytes`; `corrections[0].derived`/`rule`. Consequence [INFERENCE, not executed]: a sidecar whose
`source.spec.sha256` or `source.manifest.sha256` is wrong while the other checks pass would report
`R14-ARIA-SIDECAR-ACCEPTED-01 pass`. This confirms lesson item 2 and lesson item "sidecar byte identity
pinned by evidence, not by checker". The canonical `corrected.json` currently carries correct values
(read: `source.spec.sha256 03cb4e17…`, `source.manifest.sha256 56764241…`).

### D6 — MEDIUM — live producer bytes are never read

- `SOURCE_PATHS.producer` (`:76`) is used only as a declared string (`:615`, `:1203`, `:1591`,
  `:1602`). No `readEntry(SOURCE_PATHS.producer)` exists.
- Producer identity is therefore "receipt declares `source.sha256 == 1d54c9e9`" (`:613-614`), which is
  only as strong as the `receiptSha256` anchor, and that anchor is skipped for non-canonical receipts
  (see D7).
- Spec and config are read live (`:640-645`); producer is not. Asymmetric coverage.
- Live producer bytes do match the anchor today (sha256sum above).

### D7 — MEDIUM (design) — byte anchors enforced only at canonical paths

- `evaluateAnchors` `:733-744`: `ANCHORS.receiptSha256` / `pinSha256` checked only when
  `sameAbs(...)` is canonical. `:751-756` pair rule fires only if at least one of receipt/pin is
  canonical.
- `resolveCheckInput` `:2029-2062` takes `receipt` and `pin` paths from the sidecar's own
  `original.receipt.path` / `original.pin.path` (`:2050-2051`). A sidecar may name arbitrary paths.
- With both receipt and pin at non-canonical paths, no byte anchor is evaluated. The self-test
  `sidecar-auto-detect-check-input` (`expected-fixtures.json:158-170`, expectedExit 0) encodes exactly
  this acceptance as a passing expectation (its `original.pin.path` is a temp path, `:1760-1761`).
- [INFERENCE, not executed] A self-consistent non-canonical receipt+pin+sidecar set can reach
  `ok=true` by reproducing the canonical worker proofs (worker files are read from fixed
  `WORKER_DIR`, `:56`, and anchored) and the public constants in `source.*`. This yields a `clean`
  verdict on bytes that are not anchored.
- Proposed direction (for TabiR15 decision): production refuses non-anchored receipt/pin with exit 2
  (`snapshot_unanchored`); fixtures use an injection argument whose default is the production constant,
  and production refuses overrides. The same pattern is already recommended for the USER gate in
  `.ufo/waves/round-13/w1/ReviewRound.txt` MEDIUM-5.

### D8 — LOW — no revision named in verdict

- `PROTOCOL.md:393`: "A verdict names the revision it was measured against." The ARIA check payload
  (`checkPayload` `:1931-1950`) names file paths and sha256 only; no git revision.
- Byte anchors may be an acceptable substitute because the inputs are historical and frozen. TabiR15
  to decide whether to record `git rev-parse HEAD` in the payload or to state the substitution in the
  registry row.

### D9 — LOW — registry row and lesson wording

- `SKILL.md:1755` says `--check corpus/.../corrected.json` maps 2 → could-not-evaluate. Source cannot
  emit 2 from `--check` (F2). The row should not claim the map until D1–D4 land.
- `corpus/lessons/round-14-verifier-spotcheck.md:185` item 2 says "15 CLI cases plus one deterministic
  helper": confirmed (15 cases, `caseCount` includes derive comparison as 16th result).

## 5. Proposed tests (for MetadataEnforce / TabiR15)

Design constraint: `ROOT` is derived from the script location (`:47-48`). Canonical-path tamper tests
cannot be done inside the repo without mutating committed evidence. Each tamper case must copy
`scripts/check-aria-metadata.mjs`, `corpus/evidence/round-13/aria/` and `corpus/evidence/round-14/aria-metadata/`
into a `mkdtemp` tree, mutate the copy, and run the copy's script.

Proposed cases (expected exit / finding):

1. Flip one byte in copied `receipt.json` → 2, `snapshot_tampered` (detail `receipt_sha256`).
2. Same for `runtime-pin.json` → 2, `snapshot_tampered` (`pin_sha256`).
3. Same for `manifest.json` → 2, `snapshot_tampered` (`manifest.currentSha256`).
4. Same for `aria-loopback.spec.mjs` → 2, `snapshot_tampered` (`spec.currentSha256`).
5. Same for `playwright.config.mjs` → 2, `snapshot_tampered` (`config.currentSha256`).
6. Same for `scripts/aria-loopback-round13.mjs` (requires D6 fix first) → 2, `snapshot_tampered`.
7. Same for the worker JSON → 2, `snapshot_tampered` (`worker_sha256:*`).
8. Delete spec / config / a worker → 2, `could_not_evaluate` (`input_missing`).
9. Symlink the receipt → 2, `could_not_evaluate` (`input_symlink_refused`).
10. Change `malformed-receipt` expectation from exit 1 to exit 2, finding `could_not_evaluate`
    (`input_invalid_json`). Requires the parser path to emit the class.
11. `sidecar-bad-receipt-digest` → 2, `snapshot_tampered` (sidecar digest disagrees with bytes). Currently 1.
12. Unchanged historical receipt → 1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01` (must stay red; guards
    against D1 over-correction).
13. For each unchecked sidecar field in D5 (`source.spec.sha256`, `source.manifest.sha256`,
    `cleanup.allClosed`, `cleanup.derivedListeningAfter`, `qualification.everyProofClosed`,
    `qualification.everyProofListensBefore`, `qualification.everyProofRefusedAfterClose`,
    `corrections[0].derived`) → 1, new finding `R14-ARIA-SIDECAR-MIRROR-01 fail`. Alternative if
    canonical sidecar bytes are pinned by constant: 2, `snapshot_tampered`.
14. Non-canonical receipt+pin pair → decision per D7; either refused 2 `snapshot_unanchored`, or
    `sidecar-auto-detect-check-input` expectation kept and documented as unanchored-clean (not
    recommended).
15. Missing `--check` input → 2 with `verdict=could-not-evaluate` (not `red`).
16. Witness with tampered original receipt → 2, not 1, and `original_unchanged` still reported.

## 6. Commands L1 should run after integration (not run by this audit)

- `node scripts/check-aria-metadata.mjs --self-test` (expects 15 cases + derive; must gain exit-2 cases).
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json`
  (expect 0 clean today; must remain 0 after changes).
- `node scripts/check-aria-metadata.mjs` (no argument; expect 1 with `R14-ARIA-CLEANUP-LISTENING-AFTER-01`).
- `node scripts/check-aria-metadata.mjs --witness` (expect red→clean, original_unchanged=true).
- `sha256sum` over the seven anchored paths in section 3 (currently all match).
- Confirm `grep -c snapshot_tampered scripts/check-aria-metadata.mjs` is > 0 after the fix.

## 7. Handoff

- Pointers only; no outcome is claimed beyond the source reads and checksums cited.
- Code-related finding routed to `TabiR15.MetadataEnforce`; planner summary routed to `TabiR15`.
- Round-15 `LOG.md`, `SCORECARD.md`, `QUALITY.md`, `SKILL.md`, `README.md`, and the round-15 lesson are
  L1-owned and were not edited.
