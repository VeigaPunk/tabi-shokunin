# TamperPin — round-15 w1 (reviewer, read-only)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Scope: runtime-pin digest projection vs full-byte identity, and the tamper verdict, in the round-14 C2 checker `scripts/check-aria-metadata.mjs` and its round-14 inputs.
Checks executed: none. No gate, selftest, witness, measure, build or browser was run. Reads only (file reads, greps, no hashing commands beyond none). No source edits. No tools installed or upgraded.
Line numbers are snapshot pointers taken at read time; re-read before acting.

Axes: calibration (a red/green verdict must mean what it says), provenance (what bytes are authoritative), operability (exit/finding vocabulary a measure can count).

## Contract under audit

- Round-15 MetadataEnforce spec (`.ufo/waves/round-15/w1/spec.json`, item `MetadataEnforce`, Target): "Snapshot/input digest mismatches must emit stable `snapshot_tampered` and exit2 could-not-evaluate, distinct from semantic invalidity exit1."
- Round-14 MeasureClaims C2 (`.ufo/waves/round-14/w1/MeasureClaims.md:82-103`): C2 counts only when the committed sidecar and checker outputs bind to committed bytes.
- Round-14 ReceiptSecurity RS-1/RS-7 (`.ufo/waves/round-14/w1/ReceiptSecurity.md:30-59`): anchors are code constants, "never accept anchor digests from the CLI", arguments are advisory, run all checks.

## Inventory of identities (what is actually bound)

| Identity | Where enforced | Full bytes or projection |
|---|---|---|
| Canonical pin bytes `4d894756…` | `ANCHORS.pinSha256` `:64`, applied in `evaluateAnchors` `:738`, only when `pinEntry.abs` equals canonical path `:734` | full bytes |
| Receipt-declared pin digest | `evaluatePin` `:713-715` compares `receipt.runtime.pinned.pinSha256` to `pinEntry.sha256` | full bytes, but the value is self-declared |
| Pin semantic equality receipt.pin ↔ pin file | `pinProjection` `:244-263`, compared `:719-722` | projection (subset of keys) |
| Canonical receipt bytes `b458b351…` | `:735-737`, canonical path only | full bytes |
| Workers `0d0f00e2…` | `ANCHORS.workers` `:69-72`, checked `:745-750` for every readable worker regardless of receipt path | full bytes |
| Spec, config, manifest, producer | `evaluateSourceIdentity` `:613-645`, `evaluateManifest` `:621-625`, spec/config read from fixed ROOT paths | receipt-declared values vs constants, plus fixed-path bytes |
| Sidecar binding to receipt/pin | `evaluateSidecar` `:912-945` | full bytes of the current files, but candidates are sidecar-declared |
| Worker proof canonical JSON | `binding.perWorker`, `proofSetSha256` `:891-895`, `:946-955` | canonical-JSON projection, not file bytes |

## Findings (severity order)

### F1 — HIGH — Snapshot tamper is classified as exit 1 semantic failure; `could_not_evaluate` / `snapshot_tampered` does not exist

- **Evidence.**
  - A grep of `scripts/check-aria-metadata.mjs` for `could`, `could_not`, `snapshot`, `tamper` returns no classification token. The only exit codes are 0/1 from `runCheck` `:1113-1117`, `:1133-1135`, `:1375`, and 2 for usage and derive-out only (`:1325`, `:1407`, `:1443`, `:1460`, `:2149`).
  - The anchor mismatches are plain `fail` findings: `receipt_sha256` `:735-737`, `pin_sha256` `:738`, `anchored_*_at_noncanonical_path` `:739-743`, `worker_sha256:*` `:749`, `receipt_pin_binding` `:754-755`.
  - Unreadable, missing, symlinked or non-regular inputs also map to `fail` (`readEntry` reasons `:158-177`, consumed by `evaluatePin` `:700`, `evaluateAnchors`, `loadWorkerContext` `:524-529`).
  - Output for red is `ARIA_METADATA check verdict=red ... failed=N` `:2234-2239`, exit 1. The fatal path `:2251-2262` prints `verdict=red` with exit 2, so the verdict vocabulary is inconsistent.
- **Impact.** Tampering with the committed pin, receipt, worker, spec, config or manifest is indistinguishable from a semantic contradiction (for example the original `listeningAfter` mismatch) to any consumer that counts exit codes. The round-15 MetadataEnforce contract is not met.
- **Smallest correction.** Add one stable id `snapshot_tampered`. Emit it from `evaluateAnchors` and `evaluateSourceIdentity` whenever a canonical-path byte digest differs from its anchor. Route it to `verdict=could-not-evaluate`, exit 2, `accepted=false`, and print `ARIA_METADATA findings snapshot_tampered`. Keep every semantic failure on exit 1. Decide explicitly whether a missing or symlinked canonical input is `snapshot_unreadable` (exit 2 recommended, same class).

### F2 — HIGH — Anchors apply only when the path is canonical; the CLI and the sidecar choose which bytes are authoritative

- **Evidence.**
  - `canonicalReceipt` and `canonicalPin` are lexical `sameAbs` comparisons with the default constants `:733-734`. Every anchor on the receipt and pin bytes is gated on them: `:735-738`, `:739-743`, `:751-756`.
  - The mixed case is caught: `canonicalPin` true with `canonicalReceipt` false gives `canonical_pair:receipt_not_canonical` `:752`. The all-off-canonical case is not caught. With both `--receipt` and `--pin` pointing outside the canonical paths, `evaluateAnchors` adds nothing for receipt or pin bytes.
  - CLI flags `--receipt` and `--pin` are free-form `:2113-2115`.
  - `resolveCheckInput` takes the receipt and pin paths from the sidecar's own `original.receipt.path` / `original.pin.path` `:2050-2059`. `evaluateSidecar` only type-checks those paths `:934-939`, never compares them to `DEFAULT_RECEIPT` / `DEFAULT_PIN`.
  - Inside an all-off-canonical pair, the remaining checks are self-consistency only: `receipt.runtime.pinned.pinSha256` vs file sha `:713`, `pinPath === DEFAULT_PIN` `:716`, receipt.pin projection `:719-722`, cleanup summary vs perWorker `:338-354`, and the pin-sourced `node.recorded` and `minimumMajor` `deriveNode` `:430-435`.
- **Counterexample (by reading, not executed).** Copy the committed receipt to `/tmp/x/receipt.json`, change only `cleanup.server.listeningAfter` from `true` to `false`, and copy the committed pin byte-for-byte to `/tmp/x/pin.json`. Every per-worker proof, worker copy, source, manifest and count check still passes. `R14-ARIA-CLEANUP-LISTENING-AFTER-01` `:340-354` passes because the summary now equals the derivation. Check mode exits 0 with `verdict=clean`, and no anchor fires. The original contradiction is erased by forging the input, not by a derivation.
- **Impact.** The default check is an authentication only for the canonical pair. Any caller that passes alternate paths, or a sidecar that names alternate paths, gets a clean verdict on forged bytes. This conflicts with RS-1 ("never accept anchor digests from the CLI", arguments advisory). It also means the self-test cannot prove the tamper verdict for canonical bytes, see F6.
- **Smallest correction (choose one; MetadataEnforce decides).**
  1. Production (`check` with no explicit alternate paths): reject any receipt or pin path that is not the canonical path with `could-not-evaluate` `input_not_authenticated` (exit 2). Refuse `--receipt`/`--pin` overrides unless a fixture-only mode is set, and refuse that mode when the resolved root is the default root. This is the round-13 `--census-sha256` pattern (`.ufo/waves/round-13/w1/SafetyHistory.txt:55`, RoundGate production refusal).
  2. Lift the anchor constants into a pure function parameter, `evaluateAnchors(anchors, ...)`. Production passes the code constants. The self-test passes anchors computed from its mkdtemp bytes. This is the round-13 `ReviewUser` F7 pattern (`.ufo/waves/round-13/w1/ReviewUser.txt`, F7). It makes canonical-tamper fixtures possible without an override flag.
  - In either option, `resolveCheckInput` must require `original.receipt.path === DEFAULT_RECEIPT` and `original.pin.path === DEFAULT_PIN` in production, or refuse the sidecar as `input_not_authenticated`.

### F3 — MEDIUM — Projection and full-byte identity are conflated in one finding; the projection omits real pin fields

- **Evidence.**
  - The committed pin has `timeouts` (`corpus/evidence/round-13/aria/runtime-pin.json:18-26`) and `install` (`:27-34`). The receipt copy `receipt.pin` also carries both (`corpus/evidence/round-13/aria/receipt.json:65-81`).
  - `pinProjection` `:244-263` covers schema, wave, playwright*, chromium{revision,version,executableSuffix,executableSha256,bytes} and node{recorded,minimumMajor}. `timeouts` and `install` are outside it. A change to `install.specifier` or `timeouts.caseMs` in a non-canonical copy is invisible to R14-ARIA-PIN-01.
  - `R14-ARIA-PIN-01` `:724-728` reports `problems` and `pinSha256`, but never states whether projection or bytes failed. The projection mismatch is reported as `receipt.pin:differs_from_pin_file` `:721-722`, the byte mismatch as `receipt.runtime.pinned.pinSha256` `:713-715`. The two identities are distinguishable only by reading the id.
  - Canonical full-byte identity covers the omitted fields via `ANCHORS.pinSha256` `:738`. Non-canonical full-byte identity is only as good as the self-declared `receipt.runtime.pinned.pinSha256` `:713` (see F2).
  - `JSON.stringify` drops `undefined` keys inside `stableStringify`. For JSON-parsed inputs this does not create a false equality, because type checks `:702-712` reject missing required keys. Not a defect (read-verified only).
- **Impact.** A reviewer reading "pin matched" can believe a semantic projection match implies byte identity, or the reverse. The projection can pass while the bytes differ in any non-projected key, and the byte check is the only guard for those keys.
- **Smallest correction.** Split R14-ARIA-PIN-01 into two stable ids: `pin_bytes` (sha of pin file == receipt-declared == anchor when canonical) and `pin_projection` (documented projection list, explicitly including or explicitly excluding `timeouts` and `install`). Name the excluded keys in a constant and note that they are byte-bound only.

### F4 — MEDIUM — Runtime-vs-pin cross-check is absent from the C2 checker

- **Evidence.**
  - The round-13 measure ran `runtime_pin` checks: `playwright` vs `PLAYWRIGHT_PIN` `.ufo/waves/round-13/measure.mjs:331`, `runtime.pinned.pinSha256` `:357-362`, `browserVersion` vs `pinned.chromium.version` `:372-374`, `executableSha256` vs `pinned.chromium.executableSha256` `:375-377`.
  - `scripts/check-aria-metadata.mjs` never reads `receipt.runtime.playwright`, `receipt.runtime.playwrightPackage`, `receipt.runtime.playwrightCore`, `receipt.runtime.chromium.*` (executablePath, executableSha256, executableBytes, managedRevision, version, browserVersion) against the pin. Grep confirms: the only pin-reading code is `evaluatePin` `:698-729` (type checks and `receipt.pin` projection) and `deriveNode` `:430-435`.
  - Runtime observation is therefore bound to the pin only through the whole-receipt anchor (canonical path) or not at all (non-canonical path).
- **Impact.** The C2 checker is not an enforcement of "runtime pin honesty" on its own. It only inherits that from the historical receipt bytes. A non-canonical receipt with a changed `runtime.chromium.executableSha256` passes this checker (see F2).
- **Smallest correction.** Port the four round-13 runtime comparisons into `evaluatePin` as `pin_runtime` problems: `runtime.playwright`, `runtime.playwrightPackage`, `runtime.playwrightCore`, `runtime.chromium.version`, `runtime.chromium.browserVersion`, `runtime.chromium.executableSha256`, `runtime.chromium.managedRevision`, `runtime.chromium.executableBytes`. Keep Node out of the match (it is descriptive; see R14-ARIA-NODE-RECORDED-01 `:468-475`).

### F5 — MEDIUM — Sidecar digest binding tolerates missing canonical keys; sidecar-declared paths are not pinned

- **Evidence.**
  - `pinShaCandidates` `:918-923` and `receiptShaCandidates` `:912-917` are built with `.filter((value) => value !== undefined)`. Each present candidate must equal the current file digest `:928-933`, but deleting `binding.pinSha256` is tolerated as long as one other candidate remains (`original.pin.sha256` or `source.pin.sha256`). Only "all four absent" is rejected `:926-927`.
  - `original.receipt.bytes` and `original.pin.bytes` are checked only when defined `:940-945`. Deleting them passes.
  - Sidecar-declared paths are type-checked only `:934-939` (see F2).
- **Counterexample (by reading).** Take a valid `corrected.json`, delete `binding.pinSha256`, leave `original.pin.sha256`. `R14-ARIA-SIDECAR-BINDING-01` passes.
- **Smallest correction.** Require each of `original.receipt.sha256`, `original.pin.sha256`, `source.receipt.sha256`, `source.pin.sha256`, `binding.receiptSha256`, `binding.pinSha256`, `original.receipt.bytes`, `original.pin.bytes` to be present and equal, and reject absence as `binding_field_missing:<key>`. Pin `original.receipt.path === DEFAULT_RECEIPT` and `original.pin.path === DEFAULT_PIN` (see F2).

### F6 — MEDIUM — Self-test has zero pin-tamper, anchor-tamper or source-tamper cases; the canonical branch is never exercised

- **Evidence.**
  - `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` has 16 `cases` and 8 fixtures. No case expects `R14-ARIA-ANCHOR-01`, `R14-ARIA-PIN-01` (fail), `R14-ARIA-SOURCE-01`, `R14-ARIA-WORKER-SET-01`, or `snapshot_tampered`. The only `pin` fixture is the valid `pin.json` `:277-281`.
  - Fixtures are mkdtemp copies at non-canonical paths, so `canonicalReceipt` and `canonicalPin` are always false `:733-734`. The anchor branches cannot fire in self-test (F1, F2).
  - `sidecar-baddigest` zeroes only the receipt digests: `original.receipt.sha256`, `source.receipt.sha256`, `binding.receiptSha256` `checker:1742-1747`. There is no pinned-digest tamper fixture.
  - No fixture changes a single byte of the pin, changes only a non-projected pin key, or deletes a sidecar binding key (F3, F5).
- **Smallest correction.** Add fixtures that the pure-function anchor seam (F2 option 2) can evaluate. Minimum set: one-byte pin change → `snapshot_tampered` (exit 2); key-order-only pin change → `snapshot_tampered` (bytes), while projection still equals; non-projected `install.specifier` change → `snapshot_tampered`; `binding.pinSha256` deleted → `binding_field_missing`; `original.pin.path` pointing outside the canonical path → refusal; `runtime.chromium.executableSha256` changed on a non-canonical copy → `pin_runtime` fail (exit 1).

### F7 — LOW (measure, not checker) — Round-14 measure silently skips the original pin digest when it is absent or malformed

- **Evidence.** `.ufo/waves/round-14/measure.mjs:720-722`: `if (isHex(originalReceipt.runtime?.pinned?.pinSha256) && originalReceipt.runtime.pinned.pinSha256 !== sha256(originalPinBytes))`. If the field is missing or non-hex, the comparison is skipped and no finding is added. Line `:717` has the same shape: `originalReceipt.runtime?.playwright !== originalPin.playwrightTest` is equal when both are undefined.
- **Impact.** A receipt whose pin digest field is deleted passes the original-pin check.
- **Smallest correction.** Invert the guard: `if (!isHex(...)) add('original_mismatch', 'original receipt runtime.pinned.pinSha256 missing or not a 64-hex digest')`, then compare. Require `typeof originalPin.playwrightTest === 'string'` before comparing playwright. For round 15, this must be done in `.ufo/waves/round-15/measure.mjs` (owned by MeasureContracts), not by editing the round-14 file, which is historical.

### F8 — LOW — Fatal path verdict vocabulary

- **Evidence.** `scripts/check-aria-metadata.mjs:2252` prints `ARIA_METADATA fatal verdict=red ...` and `:2257` returns exit 2 with `"exit": 2`.
- **Impact.** Same exit code as `usage` but a different verdict word. Once F1 introduces `could-not-evaluate`, fatal should use the same word.

## Verified non-defects (read-only; not executed)

- `readEntry` `:158-215` lstat-checks the final component, rejects symlink and non-regular, and reads through an `O_NOFOLLOW` descriptor. Parent-directory symlinks are not checked, but any substituted file is still bound by full-byte anchors at canonical paths. Acceptable.
- `sameAbs` `:240-242` is lexical. For canonical bytes this is safe because the byte anchor is applied after path identity. The fault is F2, the non-canonical gap, not lexical matching.
- Worker anchors `:745-750` apply to every readable worker file regardless of which receipt referenced it, so the workers are authenticated even on a non-canonical receipt. Node observed is indirectly bound through worker agreement `:439`.
- Canonical-JSON digests of proofs (`binding.perWorker`) are a projection by design; raw worker bytes are anchored separately, so this is consistent.

## Proposed test list for MetadataEnforce / TamperWitness (not run)

1. Canonical pin one-byte flip (whitespace) → exit 2, finding `snapshot_tampered`, no semantic finding (F1, F3).
2. Canonical pin key-order-only rewrite (same JSON value) → exit 2 `snapshot_tampered`, projection still equal; proves bytes, not projection, decide (F3).
3. Pin non-projected key `install.specifier` altered (in a pure-function anchor fixture) → exit 2 `snapshot_tampered` (F3).
4. Pin `node.minimumMajor` changed, bytes otherwise valid, anchor fixture → exit 2 `snapshot_tampered` (not exit 1 semantic) (F1, F2).
5. Non-canonical receipt copy with `cleanup.server.listeningAfter` flipped and matching pin copy → exit 2 `input_not_authenticated` (production) or exit 2 `snapshot_tampered` (anchor fixture). Today: exit 0 clean. This is the red control for F2.
6. Non-canonical receipt copy with `runtime.chromium.executableSha256` changed → exit 1 `pin_runtime` (F4).
7. Sidecar with `binding.pinSha256` deleted → exit 1 `binding_field_missing:binding.pinSha256` (F5). Today: accepted if other candidates present.
8. Sidecar with `original.pin.path` = `/tmp/...` → refused (F2, F5).
9. Round-14 measure fixture: `runtime.pinned.pinSha256` deleted from original receipt → red `original_mismatch` (F7).
10. Symlinked canonical `runtime-pin.json` → exit 2 `snapshot_unreadable` (decide id; F1).

## Commands for L1 (run after integration; I ran none)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json scripts/aria-loopback-round13.mjs corpus/evidence/round-13/aria/aria-loopback.spec.mjs corpus/evidence/round-13/aria/manifest.json
# expect b458b351…, 4d894756…, 0d0f00e2…, 1d54c9e9…, 03cb4e17…, 56764241…  (ANCHORS :62-72)
node scripts/check-aria-metadata.mjs; echo "exit=$?"            # current: 0 with canonical pair; record, do not assume
node scripts/check-aria-metadata.mjs --self-test; echo "exit=$?"
grep -n "could\|snapshot_tampered" scripts/check-aria-metadata.mjs   # expect hits after F1; currently none
```

## Residual risk / gaps

- Authenticity of the canonical bytes is only as strong as the code constants in the same commit (already recorded as residual in round-14 ReceiptSecurity).
- I did not verify that `timeouts`/`install` are semantically meaningful to the C2 claim; F3 asks the executor to decide explicitly.
- F2's counterexample is a reading of the control flow, not an executed run. L1 should confirm with a scratch copy outside the lane before claiming it.

## Peer messages

- MetadataEnforce: F1, F2, F5, F6 pointers and the stable id `snapshot_tampered`.
- MeasureContracts: F7 guard inversion for the round-15 measure.

No attribution of tools: none installed, none upgraded.
