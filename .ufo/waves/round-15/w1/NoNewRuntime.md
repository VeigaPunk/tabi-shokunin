# NoNewRuntime — round 15 w1 critic report (author-side, read-only)

Slice: a metadata correction must not be able to certify a browser run, Node equality, coverage or reproducibility.
Method: I only read the source and evidence. I executed no gate, self-test, counter, browser or suite. Every claim below cites the line it comes from. Any "accepted" verdict for a mutation is static reasoning over `evaluateSidecar`; nothing was observed by running it.
Tools: none were installed or updated.

## Axes

- **A1 browser-run non-certification:** the sidecar or verdict cannot assert new execution.
- **A2 Node equality non-certification:** `recorded` stays descriptive, and `pinned.matched` is never read as covering Node.
- **A3 coverage and reproducibility non-certification:** extra claims are rejected, not ignored.
- **A4 provenance and identity:** paths, wave and claim bind to the inputs that were checked.
- **A5 preservation:** the round-14 `corrected.json` (sha256 `e156b922…56745`) stays accepted, and the originals stay byte-identical.

Baseline anchors were re-hashed locally with `sha256sum`. Receipt `b458b351…`, pin `4d894756…` and producer `1d54c9e9…` equal `ANCHORS` at `scripts/check-aria-metadata.mjs:62-68`.

## What already holds (do not regress)

- `evaluateSidecar` requires these exact values (`check-aria-metadata.mjs:1036-1055`):
  - `browserExecuted===false`
  - `execution.browser===false`
  - `provenance.newBrowserExecution===false`
  - `derivedFromHistoricalRuntime===true` at both the top level and under `provenance`
  - `originalReceiptRewrittenForbidden===true`
  - When present, `execution.browserExecuted` and `execution.newBrowserRun` must be `false`.
- The node claim must be `exactMatch===node.exactMatch`, which is recomputed at `:440,1015`. The self-test `sidecar-false-exact-node` covers this (`expected-fixtures.json` cases).
- `--derive` refuses to overwrite existing bytes that differ, with exit2 (`:1441-1453`). A sidecar with extra keys therefore fails `--derive` but passes `--check` (see C1).

## Counterexamples (static; under the current code each one stays `accepted=true`, exit0)

Every mutation below is `clone(corrected sidecar)` plus the change shown. None of these paths reaches a failing finding.

| # | Mutation | Why it passes | Axis |
|---|---|---|---|
| C1 | Add top-level `"coverage":{"cases":8,"complete":true}`, `"reproducible":true`, `"newBrowserRun":true`, `"node":{…,"pinMatched":true,"equalityVerified":true}` | `:853-1109` has no closed-key or unknown-key check anywhere. Top-level `newBrowserRun` is never read; only `execution.newBrowserRun` is (`:1042`). | A1 A2 A3 |
| C2 | `execution.source:"fresh-browser-run-2026-10-20"` | `buildSidecar` emits `source:'historical-static-bytes'` (`:1188`), but `:1036-1055` never checks it | A1 |
| C3 | `provenance.note:"Re-executed in Chromium 156; 8/8 reproduced; Node equality verified"` | The only check is non-empty string (`:1053`) | A1 A2 A3 |
| C4 | `node.note:"observed Node equals the recorded 24.21.0 pin"` | `node.note` is never checked (`:1009-1034`) | A2 |
| C5 | `node.recordedRole:"enforced-pin"` with `recordedIsDescriptive:true`, or `recordedRole:"descriptive"` with `recordedIsDescriptive:false` | `:1028` is an OR, so one descriptive marker is enough and the other may contradict it | A2 |
| C6 | `schema:"tabi-aria-browser-rerun-v1"`, `kind:"metadata-correction+rerun"` | `schemaOk` accepts any kind matching `/metadata/` and `/correct/` (`:897-901`). `resolveCheckInput` has the same rule (`:2038-2040`) | A1 A4 |
| C7 | `wave:"tabi-round-15-w1"`, `claim:"C1"` | Emitted from the receipt (`:1178-1179`) but never compared, so a round-13 correction can be relabelled as round-15 evidence | A4 (false freshness) |
| C8 | `original.receipt.path:"corpus/evidence/round-15/aria/receipt.json"` (does not exist), correct sha | In `--receipt/--pin/--sidecar` mode the path only needs to be a non-empty string (`:934-939`). `source.*.path`, `source.spec.*`, `source.manifest.*`, `source.producer.path` and `source.producer.role` are never checked; only `source.producer.sourceSha256` is (`:959`). The committed self-test already shows this: `sidecar-valid` uses the non-existent label `fixtures/receipt-old.json` (`:1738-1739`), and the case `sidecar-valid-accepted` expects exit0. | A4 |
| C9 | `corrections[0].derived:true` (emitted at `:1229`); a changed `corrections[0].rule` or `correction.rule` | `:976-991` checks `path/from/to/value/supportingProofs` only | A4 (mirror); MetadataEnforce scope |
| C10 | Accepted result over a **non-anchored** receipt/pin pair | `evaluateAnchors` passes non-canonical pairs (`:751`). `checkPayload` (`:1931-1980`) and the witness line (`:2171-2176`) print `verdict=clean accepted=true` without saying whether the inputs were the anchored historical bytes. An authored receipt with `runtime.node==pin.node.recorded` therefore yields an accepted `exactMatch:true` that looks the same as the historical result. | A2 A4 |

### Node-equality gap that the checker never surfaces (A2)

- The receipt records `runtime.pinned.matched:true` and `runtimeConsistent:true` alongside `node:"26.12.0"` and `pin.node.recorded:"24.21.0"` (`corpus/evidence/round-13/aria/receipt.json`, field `runtime.pinned`).
- In the producer, `runtimePinMatched = playwrightMatched && chromiumMatched && browserVersionMatched`, and Node takes no part (`scripts/aria-loopback-round13.mjs:388-403,423`).
- The checker never reads `pinned.matched` or `runtimeConsistent`: a grep for `matched|runtimeConsistent` finds no hit in the checker.
- After correction, the post-evaluation view still carries `pinned.matched:true` with no qualification. `R14-ARIA-NODE-RECORDED-01` reports `pass` when `exactMatch=false`, on shapes alone (`:468-475`).
- The finding ID reads like an equality pass. Its detail does carry `descriptiveOnly:true`, but it has no `certifiesEquality:false`.

### Untested existing guards (regression risk)

- The self-test has no negative control for any provenance or browser flag. Deleting `:1038-1049` would leave all 15 CLI cases plus the derive helper green, because the only sidecar negatives are `baddigest`, `wrongto` and `exactnode` (`:1742-1757`; `expected-fixtures.json` cases).

## Conflict to resolve before editing (A5)

MetadataEnforce is asked to correct the generated Node note (routed item 1 in `corpus/lessons/round-14-verifier-spotcheck.md:184`). That changes `buildSidecar` `node.note` (`:1258-1261`).

- If the fix also adds canonical equality to `buildSidecar` output, the immutable round-14 `corrected.json` stops being accepted.
- If the note changes and stays unchecked, C4 remains open.

Smallest safe rule: `node.note` must be one of exactly two literals, computed from the recomputed `node` values: the round-14 template (as currently committed) and the corrected round-15 template. Anything else fails.

## Smallest safe correction (owner: MetadataEnforce, `scripts/check-aria-metadata.mjs` only)

1. **Closed schema.**
   - Require the exact key set at each level of the sidecar, using literal key lists that match `buildSidecar` `:1175-1281`.
   - Any unknown key fails. This closes C1.
   - The committed `corrected.json` has exactly the emitted keys, which I checked by reading it, so A5 is preserved.
2. **Strict identity.**
   - Require `schema===SIDECAR_SCHEMA && kind==='cleanup-and-node-metadata-correction'` in both `:897-901` and `:2038-2040`. This closes C6.
   - Require `wave===context.receipt.wave` and `claim===context.receipt.claim`. This closes C7.
3. **Literal text.**
   - `execution.source==='historical-static-bytes'` (C2).
   - `provenance.note` equal to the `:1195-1196` literal (C3).
   - `corrections[0].rule===correction.rule===` the rule literal (C9).
   - `node.note` limited to the two-literal set above (C4).
   - `source.producer.role` literal.
4. **AND, not OR, at `:1028`:** `recordedRole==='descriptive' && recordedIsDescriptive===true` (C5).
5. **Path provenance.**
   - `original.*.path` and `source.*.path` must resolve, via `sameAbs`, to `context.receiptRead.entry.abs` and `context.pinRead.entry.abs`.
   - `source.spec`, `source.manifest` and `source.producer.path` must equal `SOURCE_PATHS` and `ANCHORS` (C8).
   - Update the self-test `sidecar-valid` label to a resolvable path. Sidecar fixtures are not digest-pinned in `expected-fixtures.json`, so this is safe.
6. **Mirror:** `corrections[0].derived===cleanupDerived.listeningAfter` (C9).
7. **Payload boundary (additive; changes output only, not the sidecar).**
   - Add to `checkPayload` and `witnessPayload`: `historicalAnchored` (`canonicalReceipt&&canonicalPin`), and `certifies:{browserExecution:false,nodeExactEquality:false,coverage:false,reproducibility:false,historicalProducerMinimumEnforcement:false}`.
   - Add `observed.node.pinMatchCoversNode:false`, grounded on the anchored producer hash and producer lines `:388-403` (C10 and the A2 gap).
   - This is a tradeoff: it makes the output payload larger. If L1 wants the payload frozen, items 1-6 alone close every acceptance hole.

## Proposed self-test cases (literal expectations; each is `--receipt @receipt-old --pin @pin --sidecar @X`)

| id | fixture mutation (clone of sidecar-valid) | expectedExit | expected failing finding |
|---|---|---|---|
| sidecar-browser-executed | `browserExecuted:true`, `execution.browser:true`, `provenance.newBrowserExecution:true` | 1 | R14-ARIA-SIDECAR-PROVENANCE-01 fail (guards the existing code) |
| sidecar-new-browser-run | `execution.newBrowserRun:true` only | 1 | R14-ARIA-SIDECAR-PROVENANCE-01 fail |
| sidecar-extra-runtime-claims | top-level `coverage`, `reproducible:true`, `node.pinMatched:true` | 1 | new closed-schema finding fail |
| sidecar-forged-source | `execution.source:"fresh-browser-run"` | 1 | R14-ARIA-SIDECAR-PROVENANCE-01 fail |
| sidecar-forged-node-note | `node.note:"observed equals recorded"` | 1 | R14-ARIA-SIDECAR-NODE-CLAIM-01 fail |
| sidecar-role-or-escape | `recordedRole:"enforced-pin"` | 1 | R14-ARIA-SIDECAR-NODE-CLAIM-01 fail |
| sidecar-kind-escape | wrong `schema`, `kind` still matches the regex | 1 | R14-ARIA-SIDECAR-SCHEMA-01 fail |
| sidecar-relabel | `wave:"tabi-round-15-w1"` | 1 | identity/binding finding fail |
| sidecar-path-provenance | `original.receipt.path` set to a non-existent round-15 path | 1 | R14-ARIA-SIDECAR-BINDING-01 fail |

Every negative case must also assert `R14-ARIA-SIDECAR-ACCEPTED-01` with status `fail`.

**Positive control:** `--check corpus/evidence/round-14/aria-metadata/corrected.json` must stay exit0 with `accepted=true`, and the input sha must remain `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`.

## Minor operability defects

- `usage()` (`:2064-2071`) does not list `--check`. The SKILL registry entry (`SKILL.md:1755`) and the round-14 executions both use `--check <sidecar>`. The fix is to add the `--check [<receipt|sidecar>]` line.

## Commands for L1 after integration (not run here)

- `node scripts/check-aria-metadata.mjs --self-test`
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit0, `accepted=true`)
- `node scripts/check-aria-metadata.mjs` (expect exit1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01` fail)
- `node scripts/check-aria-metadata.mjs --witness`
- `sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json corpus/evidence/round-14/aria-metadata/corrected.json` (expect `b458b351…`, `4d894756…`, `e156b922…`)

## Claim hygiene for the round-15 lesson and SCORECARD

C2 calibration 0→1 may credit only enforced metadata and mirror checks plus snapshot_tampered classification. Coverage and freshness stay unchanged. The round produces no browser observation, no proof of Node equality, and no reproducibility evidence. `--derive identical=true` shows the sidecar bytes are derived deterministically; it is not a replay of the runtime.
