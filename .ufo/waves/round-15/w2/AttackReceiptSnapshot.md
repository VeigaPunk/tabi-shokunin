# AttackReceiptSnapshot — round15 wave2 (C2: tamper with the canonical receipt bytes → exit2 before any semantic finding)

This is an author-side falsification. It comes from reading the source only. I did not run any gate, self-test, witness, counter or browser. It does not certify anything as a non-author.

## Attacked bytes
- HEAD is `72dcf031b9da24796b718517ea575f21e4f7caae`. The baseline is `7054a5e1068538349b4dbb0d291c2fe8643802f2`. The two match `.ufo/waves/round-15/build-snapshot.json`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs` has sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. I recomputed it and it matches the snapshot. The file is not modified in the worktree.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py` has sha256 `44cd37c5…5831`, which matches the snapshot.
- The docs I read are uncommitted worktree bytes:
  - `SKILL.md` `037bb813…a1fd`
  - `corpus/QUALITY.md` `cdd2921c…f116`
  - `corpus/lessons/round-15.md` `72f53c9d…84d1` (untracked)
  - `corpus/evidence/round-15/metadata/expected-fixtures.json` `d3bcc239…4397`
  - `mirror-contract.json` `18857a4d…308e`
- `corpus/LOG.md` and `corpus/SCORECARD.md` do not exist at this snapshot. I could not attack them.
- **Temporal limit:** the snapshot says `verification: not yet exercised`. No round15 C2 execution receipt exists: no metadata-witness output and no self-test transcript under `corpus/evidence/round-15/`. The lesson's C2 admission line (`corpus/lessons/round-15.md:10`) therefore has no executed receipt yet. I did not infer or claim any execution outcome.

## Propositions that hold (source-read)
- P1. In `runCheck` (`check-aria-metadata.mjs:1385-1396`), `verifySnapshot()` runs before `prepareContext`/`evaluateAll`. `runDerive` (:1617-1621, before `resolveOutPath`), `runWitnessMirrors` (:1915-1925) and `runWitness` (via `runCheck`, early return at :1791) follow the same order.
- P2. In `verifySnapshot` (:871-925), the canonical receipt, pin, manifest, spec, config, producer and the anchored worker are hashed against the `ANCHORS` code constants (:147-158). A mismatch yields a single `snapshot_tampered`/`could_not_evaluate` finding with `semanticEvaluation:'skipped'`, exit 2 (:927-950). Unreadable input yields a distinct `snapshot_unavailable` (:951-969).
- P3. The self-test tamper cases make an exact finding-id set assertion (:2589-2595). Combined with `expectedFindingIds:["snapshot_tampered"]`, this rules out semantic findings for the `mirror-tamper-receipt` and `mirror-tamper-receipt-clean-semantics` cases (expected-fixtures `mirrorCases`). The anchor `b458b351…89b7` is unchanged and equals the on-disk receipt.

## Defects

### D1 — HIGH: authentication is bound to fixed paths, but evaluation reads paths chosen by the caller or the sidecar
- **Pointers:**
  - `verifySnapshot` hashes the fixed `DEFAULT_RECEIPT`/`DEFAULT_PIN` (:875-876) and then throws those bytes away.
  - `prepareContext(receiptPathText, pinPathText)` (:1020-1068) re-reads *whatever path was supplied* and evaluates it semantically.
  - Path sources:
    - `--receipt`/`--pin` (:3119-3122)
    - `--derive <receipt> <pin>` (:3110-3111)
    - `--check <non-sidecar>`, which uses that file with `DEFAULT_PIN` (:3043-3050)
    - `--check <sidecar>`, which follows the **unauthenticated** sidecar's `original.receipt.path`/`original.pin.path` (:3052-3062)
  - `evaluateSidecar` checks the binding digests only against the bytes it re-read, never against `ANCHORS` (:1152-1173).
  - `evaluateAnchors` (:826-852) adds constraints only when at least one member of the pair is at its canonical path.
- **Exploit path:**
  1. Copy the authenticated receipt R and pin P. Edit R to R′, for example `cleanup.server.listeningAfter=false`, which is exactly the `receipt-clean` tamper. Set `runtime.pinned.pinSha256` to sha256(P′), where P′ is P plus a trailing newline. That makes the bytes non-anchor while the JSON stays equal.
  2. Run `node scripts/check-aria-metadata.mjs --receipt /tmp/R′ --pin /tmp/P′`.
  3. `verifySnapshot` passes, because the canonical files are intact. Anchors pass, because neither path is canonical and neither file has anchor bytes. `evaluatePin` passes, because the receipt field `pinPath` string is still `DEFAULT_PIN` and the projection is equal. Source and manifest identity pass, because they check content constants and the canonical worker and manifest.
  4. Result: `verdict=clean reason=clean`, exit 0, with `snapshot.ok:true` in the payload (:2892-2896).
  - With the default pin instead, step 3 gives `canonical_pair:receipt_not_canonical` (:846-848). That is R14-ARIA-ANCHOR-01 fail, i.e. **exit 1 `semantic_invalid`**, not exit 2.
  - The same chain works through `--check <forged-sidecar>` whose `original.*.path` point at R′/P′, ending in "accepted" exit 0.
- **The code's own evidence:**
  - Self-test case `clean-perworker-listening` (expected exit 0) runs a non-anchored receipt and pin. They declare `wave:'tabi-round-13-w1'`, `claim:'C2'` and the producer, spec, config and manifest anchors (`fixtureReceipt` :2082-2167, pin :2355-2364).
  - `sidecar-auto-detect-check-input` (exit 0) runs `--check` on a sidecar that redirects into mkdtemp.
  - Together these show that the shipped interface produces clean or semantic verdicts for bytes that claim the historical identity but are not the snapshot.
- **Impact:** what the code enforces contradicts what the docs claim:
  - `SKILL.md:1781`: "no changed snapshot is treated as an ordinary compared verdict"
  - `corpus/lessons/round-15.md:10`: "changed authenticated snapshot bytes yield `snapshot_tampered`/exit2 rather than a semantic verdict"
  - `QUALITY.md:68-69`

  Exit 2 is guaranteed only for **in-place** mutation at the canonical paths. A changed historical receipt delivered through the checker's own selection surfaces gets exit 1 or exit 0.
- **Smallest bounded correction (choose one):**
  - (a) Code: in `resolveCheckInput`'s sidecar branch, refuse unless `original.receipt.path===DEFAULT_RECEIPT && original.pin.path===DEFAULT_PIN`. Also, in `evaluateSidecar`'s binding, require the candidates to equal `ANCHORS.receiptSha256`/`ANCHORS.pinSha256` when not in fixture context. For non-canonical `--receipt`/`--pin` whose decoded receipt claims the historical identity (`wave`/`sourceSha256` equal to the anchors) but whose bytes ≠ anchors, classify `could_not_evaluate`/`snapshot_tampered`, exit 2. Fixtures would need a non-historical wave label.
  - (b) Narrow the claims instead: in SKILL:1781, lesson:10 and QUALITY:68, scope the claim to "in-place mutation of the canonical paths". Also add an `authenticatedInput:false` field and stdout token whenever the evaluated receipt or pin is not the snapshot bytes.

### D2 — MEDIUM: on `--check` input refusal the checker exits 1 "red" before snapshot verification
- **Pointer:** in `main` (:3231-3253), `resolveCheckInput` runs **before** `runCheck`. A missing, unreadable, invalid or path-less input returns exit 1 with `verdict=red` and finding `R14-ARIA-CHECK-INPUT-01`. `verifySnapshot` is never called.
- **Exploit path:** tamper the canonical receipt in place, then run `--check /nonexistent` or `--check <sidecar without original paths>`. The result is exit 1, which the header (:22-26) defines as "evaluated, semantic invalidity". The header also lists "usage/surface refusal" under exit 2. The tamper is not reported.
- **Correction:** call `verifySnapshot()`/`snapshotOutcome` in `main` before `resolveCheckInput`. Map input refusal to exit 2 `could_not_evaluate` with a distinct reason (for example `input_unavailable`).

### D3 — LOW: check-then-use race between hashing and evaluation
- **Pointer:** `verifySnapshot` reads and hashes, then discards the bytes (:890-918). The following functions re-read the canonical receipt, pin, manifest, spec, config and workers: `prepareContext` (:1021-1025), `loadWorkerContext` (:619) and `evaluateSourceIdentity` (spec/config).
- **Path:** a concurrent writer replaces a canonical file between the two reads. The surviving re-hash checks catch it, but as **semantic** failures: `receipt_sha256`/`pin_sha256`/`worker_sha256` in R14-ARIA-ANCHOR-01 (:830-844), and `spec.currentSha256`/`manifest.currentSha256` in R14-ARIA-SOURCE-01 (:718, :738-740). The result is exit 1, not `snapshot_tampered` exit 2.
- **Correction:** pass the `verifySnapshot` entries (bytes) into `prepareContext`/`evaluateSourceIdentity` so each input is read once. Alternatively, map any post-snapshot anchor-digest drift to `snapshotOutcome`.

### D4 — LOW: when the snapshot is tampered, the self-test exits 1 instead of 2, and its helpers evaluate before verifying
- **Pointer:** `runSelfTest` calls `prepareContext`/`evaluateAll`/`buildSidecar` in-process (:2403-2413) without `verifySnapshot`. Its exit is only `ok ? 0 : 1` (:2815, :2865).
- **Effect:** a canonical worker or manifest tamper turns every fixture CLI case into exit 2. The self-test then reports `verdict=blocked`/exit 1, a "failed" signal, rather than exit 2 could-not-evaluate.
- **Correction:** run `verifySnapshot` first in `runSelfTest` and return `snapshotOutcome` exit 2 when it fails. The isolated mirror cases are unaffected, because they run their own ROOT.

### D5 — LOW (coverage, not a code defect): the receipt tamper is exercised only through no-argument mode
- **Pointer:** every `kind:'tamper'` mirror case uses `args:[]`.
- **Gaps:**
  - No tamper case covers the registered command `--check corpus/evidence/round-14/aria-metadata/corrected.json` (SKILL:1755/1800). It also does not cover `--derive`, `--witness`, `--witness-mirrors`, or relocated/redirected inputs (D1).
  - `metadata-witness.py:57-62` tampers only the **spec**, never the receipt. Its pass condition requires `'snapshot_tampered' in failed_ids` but does not require it to be the *only* finding, and it does not check classification reason.
- **Correction:** add one receipt-tamper mirror case with `--check <canonical sidecar>`. Add one relocated R′/P′ case expecting the outcome D1 settles on. Tighten the witness to require the exact finding set `{snapshot_tampered}` and `classification.reason=='snapshot_tampered'`.

## Commands L1 should run (none were run here)
- `node scripts/check-aria-metadata.mjs --self-test`. Confirm 35 CLI cases and 3 helpers, all `mirror-tamper-*` exit 2, and exact finding ids.
- `python3 .ufo/waves/round-15/metadata-witness.py`. Confirm `tamper.after.exit==2`.
- D1 reproduction in an mkdtemp directory: build R′/P′ as in the exploit path, then run `node scripts/check-aria-metadata.mjs --receipt $T/R′ --pin $T/P′` (expected per source: exit 0 clean). Also run with the default pin (expected: exit 1, R14-ARIA-ANCHOR-01).
- D2 reproduction in an isolated mirror root with the receipt tampered: `node scripts/check-aria-metadata.mjs --check /nonexistent` (expected per source: exit 1 red, no `snapshot_tampered`).

## Tooling
None installed. No pacman use.
