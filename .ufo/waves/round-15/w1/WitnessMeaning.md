# WitnessMeaning — round 15 w1 (read-only audit)

Role: reviewer (leaf). Author-side audit, not non-author certification.
Scope: `--witness` nested vs top-level statuses after tamper classification; proof that the
original sources are unchanged. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

Tools/installs: none. No edits outside this report. No gates, counters, self-tests, suites,
builds, or browser runs. Only read/grep/git-status and `sha256sum` (hashing, not a gate).

## Audit state (what the code is today)

- `scripts/check-aria-metadata.mjs` is still the round-14 revision: sha256
  `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6` (equals
  `verification.json` `checkerSha256`). Its `runCheck` only returns exit 0 or 1
  (`:1117`, `:1135`). There is no `snapshot_tampered` / exit-2 path yet. The findings below
  are about the current witness plus the contract MetadataEnforce must satisfy.
- `git status` (at audit time): tracked round-13 evidence, `scripts/aria-loopback-round13.mjs`,
  `scripts/check-aria-metadata.mjs`, and `corpus/evidence/round-14/aria-metadata/` are unmodified.
  Modified by siblings, not by me: `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`,
  `scripts/check-user-round-contract.mjs`. `corpus/evidence/round-15/` appeared untracked during the
  audit. I did not inspect it.

## Unchanged-sources proof (read-only sha256sum vs. `ANCHORS`, `:62-73`)

| File | sha256 | Matches anchor |
|---|---|---|
| corpus/evidence/round-13/aria/receipt.json | b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7 | yes (`receiptSha256`) |
| corpus/evidence/round-13/aria/runtime-pin.json | 4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2 | yes (`pinSha256`) |
| scripts/aria-loopback-round13.mjs | 1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c | yes (`producerSourceSha256`) |
| corpus/evidence/round-13/aria/aria-loopback.spec.mjs | 03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc | yes |
| corpus/evidence/round-13/aria/playwright.config.mjs | 87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4 | yes |
| corpus/evidence/round-13/aria/manifest.json | 56764241df4f4a644af39e368b2e47f35d3f4bbbdf17e7cef3fa848ee0d72112 | yes |
| …/actual/workers/worker-0-1530637-1792474958700.json | 0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7 | yes |
| corpus/evidence/round-14/aria-metadata/corrected.json | e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745 | = `verification.json` `sidecar.sha256` |

The bytes are right today. The checker does not prove it, though. See F2 and F3. The witness
JSON's `originalUnchanged` is a before/after stability check, not an anchor check.

## Findings (severity order)

### F1 — HIGH — The witness cannot express `could-not-evaluate`; tamper collapses into red
- `runWitness` returns `exit: ok ? 0 : 1` (`:1535`). `ok` requires `red.exit === 1` (`:1511`).
  A tampered red child (future exit 2) therefore makes `ok` false, and the witness returns exit 1.
- `main` prints `verdict=${ok ? 'clean' : 'red'}` (`:2170`) and `return result.exit` (`:2178`).
  Nothing prints `could-not-evaluate`.
- `witnessPayload` (`:1983-2014`) has top-level `ok`, `exit`, `transition`, `redFinding`,
  `originalUnchanged`, `receipt`, `pin`, `sidecarPath`, plus nested `red` and `green`. It has no
  `status`, `reason`, or phase-identifying field. `transition: 'not-demonstrated'` cannot tell
  "red was semantic but green was rejected" from "input was tampered".
- Consequence: after MetadataEnforce adds exit 2, the top-level and nested exits can disagree
  (nested `green.exit` 2, top-level exit 1).
- Proposed contract: `status` ∈ {`clean`,`red`,`could-not-evaluate`}; `reason` ∈ {`red_not_semantic`,
  `green_rejected`,`original_changed`,`sidecar_missing`,`snapshot_tampered`,…}; process exit =
  2 if any phase is exit 2 (tamper precedence over semantic red); verdict line
  `ARIA_METADATA witness verdict=could-not-evaluate …`; `transition=not-demonstrated`;
  `redFinding` null when the red phase is not semantic.

### F2 — HIGH — `originalUnchanged` proves stability, not provenance (and not what was evaluated)
- `:1499-1505` compares only `beforeReceipt`/`afterReceipt` and `beforePin`/`afterPin` sha256.
  It never compares them to `ANCHORS.receiptSha256` / `ANCHORS.pinSha256` (`:63-64`). A canonical
  receipt that is already altered before the run, and stable during it, yields
  `original_unchanged=true`. The label overclaims.
- The sources red and green actually evaluate are read inside `prepareContext`
  (`:776-824`, `readJson` at `:777-778`), not from `beforeReceipt`. The witness reports
  `receipt.beforeSha256` without binding it to `red.context.receiptRead.entry.sha256` or
  `green.context.receiptRead.entry.sha256`. The bytes used for the verdict are not proven equal to the
  bytes reported.
- Scope gap: `originalUnchanged` covers two files. The checker also reads the manifest
  (`prepareContext` `:781`), the worker JSON (`loadWorkerContext` `:524`), spec and config
  (`:640-641`), and the sidecar (`evaluateSidecar` `:855`). None are in the witness's sha bracket.
- Proposed: `anchored: { receipt, pin }` computed from `ANCHORS` on the canonical paths. Require
  `red`/`green` evaluated sha == `beforeReceipt.sha256` == `afterReceipt.sha256`. Either widen the
  set to manifest/workers/spec/config/producer/sidecar or rename the field `receiptPinStable` so it
  stops claiming "original_unchanged".

### F3 — HIGH — The producer source is never read; its "unchanged" status is a receipt claim
- `SOURCE_PATHS.producer` (`:76`) is used only as a label (`buildSidecar` `:1203-1204`, `:1575`), and
  `ANCHORS.producerSourceSha256` (`:65`) is compared against receipt-declared values
  (`evaluateSourceIdentity` `:613-635`, `:956-959`). `scripts/aria-loopback-round13.mjs` is never
  hashed by `check-aria-metadata.mjs`. Its sidecar `source.producer.sourceSha256` (`:1204`) is the
  constant, not a measured digest.
- A witness `original_unchanged=true` therefore says nothing about the producer. A changed producer
  is silent, and the sidecar still claims the anchor.
- Proposed: `readEntry(SOURCE_PATHS.producer)` in `evaluateSourceIdentity`, compare to
  `ANCHORS.producerSourceSha256`, and include it in the F2 set.

### F4 — MEDIUM — The witness output does not bind the accepted sidecar or the red evidence
- `witnessPayload` emits `sidecarPath` but no `sidecar.sha256`/`bytes`. Those are in the green
  `R14-ARIA-SIDECAR-01` detail (`:872-884`), which the payload drops.
- Nested `red.findings`/`green.findings` keep only `{id,status}` (`:2001`, `:2008` area). The red
  `R14-ARIA-CLEANUP-LISTENING-AFTER-01` detail (summary value, per-worker values) is not in the
  witness JSON.
- Proposed: add `sidecar: {path, bytes, sha256}` and keep `detail` for the named red finding and for
  any failing green finding.

### F5 — MEDIUM — Silent degradation for an unreadable default sidecar; dead fallback
- `runWitness` `:39-42`: if `sidecarPathText` is null, `readEntry(DEFAULT_SIDECAR)` and set
  `sidecarPathText` only when `ok`. A symlink or non-regular default sidecar leaves `green: null`
  and exit 1 with no reason.
- `parseArguments` already sets `options.sidecar = DEFAULT_SIDECAR` in witness mode (`:2132-2134`),
  so this fallback is only reachable by a direct call. Either delete it or make it classify.
- Proposed: an unreadable present sidecar must not silently drop to `green: null`. It should be
  `reason: 'sidecar_unavailable'` at minimum, or `could-not-evaluate` if MetadataEnforce classifies
  symlink/non-regular inputs as snapshot tamper. Decision needed from TabiR15 (see below).

### F6 — MEDIUM (consumer, round-14 measure) — Witness reader accepts weak shapes
Consumer evidence: `.ufo/waves/round-14/measure.mjs`. Round-15 `MeasureContracts` must not repeat these.
- `findingTokens` (`:270-275`) matches `red_finding=none`. `namedFinding` returns `'none'` as a
  finding. The single-form branch (`:774-791`) treats it as named, so a non-shipped witness with exit
  1, `transition=not-demonstrated`, `red_finding=none` produces no `checker_witness` error.
- The shipped branch (`:778-786`) does not require `witness.exit === 0`. It only rejects
  `original_unchanged=false` text. It does not require `red_exit=1`/`green_exit=0` to match the
  nested JSON.
- The before/after branch (`:762-773`) is what the committed evidence uses
  (`verification.json` `witness.before`/`after`, two separate `--check` processes). The actual
  `--witness` run stored as `witness.comparison` (exit 0, nested red/green) is never read by any gate
  (`grep comparison` in measure.mjs: no match). The graded "transition" is therefore synthesized from
  two runs, not from the witness command's own JSON.
- Proposed (for MeasureContracts): grade the `--witness` record only; require exit 0, `transition`
  red->clean, `red_exit` 1, `green_exit` 0, `accepted` true, `original_unchanged` true, anchored true,
  exactly one non-`none` `red_finding` id, and nested JSON fields equal to the text line.

### F7 — MEDIUM — Self-test witness assertions are too weak
Selftest witness branch `:1818-1838`; cases in `expected-fixtures.json` are only
`witness-red-to-clean` (exit 0) and `witness-rejects-bad-sidecar` (exit 1). Of 16 total cases, 2 are witness.
- Not asserted: top-level `exit` equals the process exit; `transition`; `status`/`reason`; the green
  finding that caused rejection (for `sidecar-baddigest` it should be `R14-ARIA-SIDECAR-BINDING-01`
  fail); the sidecar sha.
- `witness-rejects-bad-sidecar` passes if the witness is rejected for any reason, including a broken
  fixture. It needs a named green finding.
- Coupling: `sidecar-baddigest` (`:1745-1747`, receipt/binding sha zeroed) is an input digest mismatch.
  If MetadataEnforce classifies it as `snapshot_tampered` (exit 2), both `witness-rejects-bad-sidecar`
  and `sidecar-bad-receipt-digest` (check case) must change expectation together. Otherwise the
  committed `expectedExit: 1` lies.
- No witness case for: `originalUnchanged=false` (e.g. symlink or non-regular `--receipt`), a red phase
  exit 0 (`red_not_semantic`), or a missing sidecar.

## Proposed tests (fixtures only; no canonical mutation; for MetadataEnforce to add, L1 to run)

- W-1 `witness-tampered-green-exit2`: `--witness --receipt @receipt-old --pin @pin --sidecar @sidecar-baddigest`.
  Expect process exit 2 (if TabiR15 accepts digest mismatch as tamper), payload `exit` 2, `status`
  `could-not-evaluate`, `transition` `not-demonstrated`, `green.findings` contains
  `R14-ARIA-SIDECAR-BINDING-01` fail, `redFinding` per decision.
- W-2 `witness-symlink-receipt`: `--witness --receipt @receipt-symlink --pin @pin --sidecar @sidecar-valid`.
  Expect `originalUnchanged` false and a non-zero exit with reason `original_changed` or
  `snapshot_tampered` per decision. Create the symlink under the fixture dir only.
- W-3 `witness-nonregular-pin`: pin path = fixture directory. Expect `originalUnchanged` false.
- W-4 `witness-red-not-semantic`: `--receipt @receipt-green --pin @pin --sidecar @sidecar-valid`.
  Expect `red.exit` 0, `redFinding` null, exit 1, reason `red_not_semantic`.
- W-5 `witness-sidecar-missing-explicit`: `--sidecar @missing` (fixture-dir path). Expect `green` null
  or `sidecar_missing` reason, exit per decision.
- W-6 `witness-exit-consistency`: for every witness case, assert `payload.exit === childExit` and
  `payload.status` agrees with the verdict line.

Decisions TabiR15 must make before MetadataEnforce codes W-1/W-2:
1. Is a sidecar whose embedded receipt/pin digest disagrees with the bytes read `snapshot_tampered`
   (exit 2) or semantic `R14-ARIA-SIDECAR-BINDING-01` (exit 1)? Recommendation: exit 2 when the
   digest is a pinned identity (`ANCHORS`) or a sidecar-embedded digest of a pinned file; exit 1 when
   only a derived value differs.
2. Is a symlink or non-regular file at a canonical input path tamper (exit 2) or a semantic refusal (exit 1)?
   Recommendation: exit 2.
3. When red is semantic and green is tampered, is the witness overall exit 2? Recommendation: yes
   (tamper precedence); `redFinding` still reports the red-phase fact.

## Commands for L1 (not run here)

```
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --witness
node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json
git diff --exit-code -- corpus/evidence/round-13 scripts/aria-loopback-round13.mjs corpus/evidence/round-14/aria-metadata
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json scripts/aria-loopback-round13.mjs
```
Expected after landing: witness JSON `exit` equals process exit; `original_unchanged` only true when
anchored; no `red_finding=none` in any clean witness.

## Limits

- Read the checker at its current (round-14) revision. MetadataEnforce's in-flight edits were not read
  for correctness. Line anchors may shift.
- Consumer findings (F6) are against round-14 `measure.mjs`. Round-15 `measure.mjs` does not exist yet.
- No browser run, no gate or self-test run, no mutation of originals. Hashes are read-only observations.
