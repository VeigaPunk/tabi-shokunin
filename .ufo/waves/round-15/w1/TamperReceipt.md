# TamperReceipt — round 15 w1 (sentinel, author-side, read-only)

**Scope:** `scripts/check-aria-metadata.mjs` (blob as of `e570380`; working tree clean for `scripts/`). The audit covered two things:
- how receipt digest anchor tampering is classified;
- what happens when a safe input read fails.

**What was run:** no gates, self-tests, counters, suites or browser. Read-only commands only: `jq` on the round-14 evidence JSON, `sha256sum` on the two canonical round-13 inputs, `git status` and `git log`.

**Observed state of the canonical inputs:**
- `corpus/evidence/round-13/aria/receipt.json` currently hashes to `b458b351…89b7`, which equals `ANCHORS.receiptSha256` (:63).
- `runtime-pin.json` hashes to `4d894756…ccd2`, which equals `ANCHORS.pinSha256` (:64).

So the committed snapshot is authentic today. Every finding below is about classification when the snapshot is tampered, not about current drift.

**Tools:** nothing installed or updated.

## Axes
- **A1 tamper→CNE:** a mismatch in the authenticated snapshot must be reported as could-not-evaluate (exit 2), never as red (exit 1) or clean (exit 0).
- **A2 safe-read→CNE:** an unreadable or unsafe input must be reported as exit 2 with an explicit reason.
- **A3 zero mutation on rejection.**
- **A4 historical fixtures and evidence stay immutable.**

## Findings

### F1 — HIGH: tampering the authenticated snapshot is reported as ordinary red (exit 1), identical to the expected historical red
**Where:**
- `evaluateAnchors` :731-774 pushes `receipt_sha256`, `pin_sha256` and `worker_sha256:*` as problems on finding `R14-ARIA-ANCHOR-01`.
- `evaluateAll` :826-845 folds that finding into the general `ok`.
- `runCheck` :1117 maps any failure to `exit: preEvaluation.ok ? 0 : 1`.
- `main` :2234 prints `verdict=red`.

**Exploit path:** edit any byte of `corpus/evidence/round-13/aria/receipt.json`, for example flip `cleanup.server.listeningAfter` to `false` so the contradiction disappears. Running `node scripts/check-aria-metadata.mjs` with no sidecar still exits 1 `verdict=red`. That is the same exit and verdict as the genuine historical contradiction. The `findings` line now lists `R14-ARIA-ANCHOR-01` instead of (or as well as) `R14-ARIA-CLEANUP-LISTENING-AFTER-01`, but exit and verdict cannot tell "authentic red" from "tampered snapshot".

**Same red for every anchored input:** this applies to each anchored input, not only the receipt:

| Tampered input | Finding raised | Location |
|---|---|---|
| Worker bytes | `worker_sha256:<name>` | :749 |
| Extra or removed worker file | `workers:directory_set_mismatch` on WORKER-SET | :573-575 |
| Manifest | `manifest.currentSha256` on SOURCE-01 | :623 |
| Spec | `spec.currentSha256` on SOURCE-01 | :643 |
| Config | `config.currentSha256` on SOURCE-01 | :645 |
| Pin | `pin_sha256` | :738 |

All of them end in exit 1 red.

**Impact:** C2 requires exactly this tamper→could-not-evaluate classification. The round-14 measure already rejects `could_not_evaluate` as a red witness finding (`.ufo/waves/round-14/measure.mjs:527,537,771,785,790`). It does that by matching finding names, so the gate has to emit the literal finding id `could_not_evaluate` for that rejection to apply.

**Smallest remediation:**
- Split anchor mismatches out of the ordinary findings. In `evaluateAnchors` and `evaluateSourceIdentity`, keep the existing problem list but tag these problems as `tamper` problems:
  - `receipt_sha256`, `pin_sha256`, `worker_sha256:*`, `worker:unanchored:*`;
  - `workers:directory_set_mismatch` on canonical root;
  - `manifest.currentSha256`, `spec.currentSha256`, `config.currentSha256`.
- In `runCheck`, `runWitness` and `runDerive`, return exit 2 when any tamper problem exists. Print `ARIA_METADATA check verdict=could-not-evaluate finding=could_not_evaluate detail=snapshot_tampered:<first-problem>`, and put the same in JSON as `{id:'could_not_evaluate', status:'fail', detail}`. This mirrors `.ufo/waves/round-12/mistake/check-claim-record.mjs:228-233`.
- Precedence: input read failure (F2) beats tamper, and tamper beats ordinary findings.
- **Decision for L1:** should `anchored_receipt_bytes_at_noncanonical_path`, `anchored_pin_bytes_at_noncanonical_path` and `canonical_pair:*` (:739-753) be classed as `snapshot_unbound` CNE or stay red? I recommend CNE: authentic bytes evaluated under the wrong identity cannot be evaluated as the historical snapshot.

### F2 — HIGH: safe-read failures are reported as red (exit 1), not could-not-evaluate
**Where:**
- `readEntry` :158-215 returns reasons `missing`, `unreadable`, `symlink` and `not_regular`.
- `decodeJson` :217-232 returns `invalid_utf8`, `invalid_json` and `not_object`.

None of these carry an exit class. They become ordinary failed findings:

| Input | Finding | Location |
|---|---|---|
| Receipt | INPUT-01 | :798-811 |
| Pin | PIN-01 | :700 |
| Manifest | SOURCE-01 / MANIFEST-01 | :626-627, :659-661 |
| Spec / config | SOURCE-01 | :642, :644 |
| Workers | WORKER-SET | :525-534 |
| Worker directory | `workers:directory_unreadable` | :568-569 |
| Sidecar | SIDECAR-01 / ACCEPTED | :858-882 |
| `--check` input | `R14-ARIA-CHECK-INPUT-01` | `main` :2201-2221, explicitly `exit: 1` / `return 1` |

All of them exit 1.

**Inconsistent grammar:** the top-level catch :2250-2262 prints `fatal verdict=red` with exit 2.

**Exploit path:**
1. Replace the canonical receipt with a symlink, a directory or a FIFO, or delete it.
2. The default check exits 1 `verdict=red` with `R14-ARIA-INPUT-01`, the same exit and verdict as the authentic historical red. "Could not read the evidence" passes as "evaluated and red".

**Repo precedent:** check-claim-record maps `input_missing`, `input_unreadable`, `input_symlink_refused`, `input_not_regular` and `input_invalid_utf8` to `could_not_evaluate` exit 2 (`.ufo/waves/round-12/mistake/check-claim-record.mjs:72-101`).

**Smallest remediation:**
- Add `cne: true` to every `readEntry` and `decodeJson` failure.
- Make the reason explicit, e.g. `detail=input_missing:receipt`, `input_symlink_refused:pin`, `input_invalid_json:worker-0-…json`, `input_unreadable:workers_dir`.
- Make the three outputs agree:
  - `main` :2206/:2221: `R14-ARIA-CHECK-INPUT-01` exits 2.
  - fatal :2252: `verdict=could-not-evaluate`.
  - usage :2143 stays `verdict=invalid` with exit 2, but should say `finding=usage`.

### F3 — HIGH (gate-level; measure-side mitigated): anchors only bind the canonical path string, so a forged snapshot at any other path can reach exit 0 `verdict=clean accepted=true`
**Where:**
- `evaluateAnchors` :733-743: `receipt_sha256` and `pin_sha256` are checked only when the resolved path string equals `DEFAULT_RECEIPT` / `DEFAULT_PIN` (`sameAbs` :240-242 uses `resolve`, not `realpath`).
- A non-canonical path holding non-anchored bytes produces no anchor problem at all.
- `resolveCheckInput` :2029-2062 takes the receipt and pin paths from the sidecar's own `original.receipt.path` / `original.pin.path` (data from the claim under test).
- The shipped case `sidecar-auto-detect-check-input` (round-14 `expected-fixtures.json`, expected exit 0, `ACCEPTED-01 pass`) already proves that `--check <sidecar>` with arbitrary absolute paths goes green.

**Exploit path [INFERENCE: constructed from code; not executed]:**
1. Copy the real receipt to `/tmp/r.json` and alter it. Any change that keeps these checks passing works, e.g. edits to unchecked summary fields:
   - the source anchors;
   - `runtime.pinned.pinPath` as the literal `DEFAULT_PIN` string;
   - the real worker reference;
   - the proof copies.
2. Copy the pin to `/tmp/p.json` with one extra trailing byte, so it is non-canonical and avoids `canonical_pair` (:751-757). Set `receipt.runtime.pinned.pinSha256` to its digest.
3. Build a consistent sidecar whose `original.*.path` points at the temp files. `--derive` refuses an absolute `--out` (:1288), but a hand-built sidecar needs no derive.
4. Run `node scripts/check-aria-metadata.mjs --check /tmp/s.json`. It prints `ARIA_METADATA check verdict=clean … accepted=true` and exits 0.

**Mitigation that exists today:** round-14 measure independently pins `original.receipt.path === corpus/evidence/round-13/aria/receipt.json` plus bytes (`measure.mjs:123-124,964-966`). The C2 count is therefore not forgeable this way. The gate's own clean verdict is.

**Smallest remediation:** have the gate say whether it authenticated anything.
- Add `snapshot=authenticated|unanchored` to the check, witness and derive summary lines and to the JSON. `authenticated` means:
  - canonical receipt and pin by `realpathSync`, not `resolve`;
  - all anchors match.
- When the sidecar path is the canonical `DEFAULT_SIDECAR`, require `original.receipt.path === DEFAULT_RECEIPT` and `original.pin.path === DEFAULT_PIN`.
- L1/measure should count only `snapshot=authenticated`.
- Fixtures stay `unanchored` and keep their exit semantics, which preserves A4.

### F4 — MEDIUM: `--witness` collapses a CNE red arm into exit 1 `not-demonstrated`
**Where:** `runWitness` :1511 requires `red.exit === 1`, and :1535 returns `exit: ok ? 0 : 1`.

**Impact:** once F1/F2 land, a tampered or unreadable snapshot makes the red arm exit 2, and witness reports exit 1 `verdict=red`. The infrastructure class is lost.

**Fix:** if either arm exits 2, return exit 2 with `red_finding=could_not_evaluate` (or `green_…`) and `transition=could-not-evaluate`.

### F5 — MEDIUM (A3 violation): derive's temp-file `finally` can delete a file it did not create
**Where:** `runDerive` :1368-1384 runs `writeFileSync(tmpPath, …, {flag:'wx'})` inside `try`, and the `finally` calls `rmSync(tmpPath, {force:true})` unconditionally.

**Exploit path:**
1. A pre-existing `corpus/evidence/round-14/aria-metadata/<out>.derive-<pid>` exists (a regular file or a symlink).
2. `wx` throws `EEXIST`.
3. The `finally` removes that pre-existing entry.
4. The error then reaches the fatal handler, which exits 2.

A rejected run therefore mutates the evidence directory.

**Additional mutation:** even on the success path, derive writes a temp file into the evidence directory before validation (:1370).

**Fix:** set a `created = true` flag only after `writeFileSync` succeeds, and call `rmSync` only when `created`. Better: validate the in-memory sidecar without touching disk. `evaluateSidecar` already accepts a path, so add an entry-object variant.

**Zero-mutation status of other paths:** check and witness modes perform no writes (`runCheck` and `runWitness` call only `readEntry` and `readJson`). Derive refusals at :1322-1361 return before any write.

### F6 — LOW: other safe-read gaps
- **FIFO swap (`readEntry` :172-189):**
  - Race: `lstat` says regular, then the file is swapped for a FIFO, and `openSync(O_RDONLY|O_NOFOLLOW)` blocks forever.
  - Fixtures have a 30 s timeout (:1797), but production has none.
  - Fix: add `constants.O_NONBLOCK` to the open flags. The `fstat` `isFile` check at :191-193 already rejects a FIFO.
- **No byte cap on `readFileSync` (:195):** any input file is read into memory at full size; nothing limits it.
- **Parent-directory symlinks are followed (`lstat` only checks the leaf):** not exploitable for anchored files, because the digests cover the bytes. Combined with F3, though, an alias path turns tampered canonical bytes into "unanchored". Fix: compare `realpathSync`.
- **Self-test oracle is unauthenticated:** `DEFAULT_EXPECTATIONS` is read without an anchor (:1658). Weakening `expectedExit` in that file weakens the self-test. Fixture bytes are pinned; cases are not.
- **Synthetic self-test row:** `derive-deterministic-sidecar` (:1885-1894) reports `exit` and `finding=R14-ARIA-SIDECAR-ACCEPTED-01`, but no process ran and that finding was never asserted. Rename the fields or emit `exit=n/a`.

## Proposed isolated tests (L1 runs them; none executed here)
**Isolation without overrides:** `ROOT` is derived from the script location (:47-48). The self-test can therefore copy `scripts/check-aria-metadata.mjs` plus the authentic `corpus/evidence/round-13/aria/{receipt.json,runtime-pin.json,manifest.json,aria-loopback.spec.mjs,playwright.config.mjs,actual/workers/*.json}` into an `mkdtemp` tree and spawn the copied script with `cwd` set to the temp root. This needs no environment variable or flag override, so production cannot be redirected. Each case mutates only the temp copy.

| id | mutation (temp tree only) | expected exit | expected finding / detail |
|---|---|---|---|
| `relocated-authentic-control` | none | 1 | `R14-ARIA-CLEANUP-LISTENING-AFTER-01` only, `snapshot=authenticated` |
| `tamper-canonical-receipt` | flip one byte (keep valid JSON) | 2 | `could_not_evaluate` / `snapshot_tampered:receipt_sha256` |
| `tamper-receipt-hides-contradiction` | set `cleanup.server.listeningAfter=false` | 2 | `could_not_evaluate` (never exit 0 or 1) |
| `tamper-canonical-pin` | append a byte | 2 | `snapshot_tampered:pin_sha256` |
| `tamper-worker` | alter the worker file | 2 | `snapshot_tampered:worker_sha256:worker-0-…json` |
| `extra-worker-file` | add `worker-1-1-1.json` | 2 | `snapshot_tampered:workers:directory_set_mismatch` |
| `tamper-manifest` / `tamper-spec` / `tamper-config` | append a byte | 2 | `snapshot_tampered:{manifest,spec,config}.currentSha256` |
| `canonical-receipt-missing` | delete it | 2 | `input_missing:receipt` |
| `canonical-receipt-symlink` | symlink to an authentic copy | 2 | `input_symlink_refused:receipt` |
| `canonical-receipt-directory` | replace it with a directory | 2 | `input_not_regular:receipt` |
| `canonical-receipt-invalid-utf8` | write `\xff` | 2 | `input_invalid_utf8:receipt` |
| `check-input-missing` | `--check <absent>` | 2 | `input_missing` (today it is 1) |
| `witness-tampered-red-arm` | tamper the receipt, then `--witness` | 2 | `red_finding=could_not_evaluate` |
| `derive-tmp-preexisting` | pre-create `<out>.derive-<pid>`; not reliably testable because the pid is unknown. Instead, assert in code review that `rmSync` runs only when the temp file was created by this run | — | — |
| `sidecar-forged-noncanonical-auto` | `--check` sidecar with temp `original.*.path` | 0 | must print `snapshot=unanchored`; measure counts it 0 |

Every tamper case must also assert that the authentic repository files are byte-identical after the run (`sha256` before and after). That covers A3.

## A4 / immutability constraints for the implementer
- **Expectations file:** `DEFAULT_EXPECTATIONS` (:54) points at round-14 evidence `corpus/evidence/round-14/aria-metadata/expected-fixtures.json`. Two of its cases are affected:
  - `malformed-receipt` expects exit 1 / `R14-ARIA-INPUT-01`. Under F2 that becomes exit 2.
  - `sidecar-auto-detect-check-input` expects plain exit 0, with no snapshot field.

  Do not edit that file. Cut over to a round-15 expectations path and keep the round-14 file as history.
- **Round-14 receipt:** `corpus/evidence/round-14/aria-metadata/verification.json` pins `checkerSha256=ef373872…` at `codeRevision=e570380`. A changed checker invalidates any live replay that compares current checker bytes with that receipt. That receipt is historical; any new round-15 verification needs its own receipt.

## Commands for L1 (not run here)
- `node scripts/check-aria-metadata.mjs --self-test`
- `node scripts/check-aria-metadata.mjs` (expect exit 1, CLEANUP only, `snapshot=authenticated`)
- `node scripts/check-aria-metadata.mjs --witness`
- `sha256sum corpus/evidence/round-13/aria/{receipt,runtime-pin}.json` before and after (expect `b458b351…` / `4d894756…`)
