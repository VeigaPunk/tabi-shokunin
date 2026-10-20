# TamperWorker: worker source-digest proof and worker coverage (C2, read-only critic)

Scope: `scripts/check-aria-metadata.mjs` at HEAD `7054a5e`. The worktree is clean apart from `.ufo/waves/round-15/`. The script file tag is `#FB3C` (2263 lines).

I ran no gate, counter, self-test, suite or browser, and edited no source. My only commands were `sha256sum`, `jq` and `git status/log` on committed bytes. This is an author-side review, not a certification.

**Axes:**
- A1: anchor completeness for the worker set.
- A2: path identity of each referenced worker.
- A3: what the source-digest proof actually covers.
- A4: whether tamper findings are classified correctly as could-not-evaluate or fail.
- A5: whether red tests actually reach the worker findings.
- A6: provenance wording.

## Measured facts (read-only)

| item | value |
|---|---|
| worker `actual/workers/worker-0-1530637-1792474958700.json` | `0d0f00e2…a5e7` = `ANCHORS.workers` (`:69-72`) |
| receipt / pin / manifest / spec / config | `b458b351…` / `4d894756…` / `56764241…` / `03cb4e17…` / `87ae779b…` all equal ANCHORS (`:63-68`) |
| current `scripts/aria-loopback-round13.mjs` | `1d54c9e9…f9c` = `producerSourceSha256`. The match holds today, but the checker never measures it (F3) |
| worker vs receipt `sourceSha256`, `source.{path,sha256,specSha256,configSha256}`, `manifest` | identical |
| worker digest `0d0f00e2` in `corpus/evidence/round-14/aria-metadata/corrected.json` | **0 occurrences**. Sidecar `source` keys are `manifest,pin,producer,receipt,spec`, with no `worker` and no `config`. `binding` keys are `perWorker,pinSha256,producerSourceSha256,proofSetSha256,receiptSha256` |
| `expected-fixtures.json` case ids (15) | none expects a fail on `R14-ARIA-ANCHOR-01`, `R14-ARIA-WORKER-SET-01`, `R14-ARIA-WORKER-PROOF-01` or `R14-ARIA-SOURCE-01` |

## Findings

### F1: HIGH (A1, A4): a missing anchored worker never fails the anchor finding
- **Code.**
  - `evaluateAnchors` (`:745-750`) iterates only `workerContext.readings` and skips `!reading.ok` (`:746`).
  - Nothing requires every key in `ANCHORS.workers` to be read.
  - When `workers[i].file` is rejected before reading (`outside_worker_dir`, `name_pattern`, `:508-517`), no reading exists at all.
- **Counterexample.** Delete the anchored worker, or replace it with a symlink or directory.
  - `readEntry` returns `missing`, `symlink` or `not_regular` (`:163-177`).
  - Only `R14-ARIA-WORKER-SET-01` fails (`workers[0]:file:missing`, `:524-528`).
  - `R14-ARIA-ANCHOR-01` stays **pass**.
- **Consequence.** If round-15 classifies "authenticated snapshot tampering → could-not-evaluate" by keying on `ANCHOR-01` (or on `worker_sha256:*`), then deleting the authenticated worker becomes an ordinary `fail` instead of could-not-evaluate.
- **Smallest fix.** In `evaluateAnchors`, for every `name` in `ANCHORS.workers`:
  - require one `ok` reading with exactly that name;
  - otherwise push `worker_anchor_unread:<name>:<reason>`.
  - Classify `worker_sha256:*`, `worker_anchor_unread:*` and `worker:unanchored:*` as authenticated-snapshot tampering.

### F2: HIGH (A4): do not make every WORKER-SET failure could-not-evaluate
- **Counterexample to the naive rule.** The `empty-perworker` fixture (`fixtureReceipt({workerCount:0})`, `:1702-1706`) has `workers: []`. It therefore also trips `workers:missing_or_empty` and `workers:directory_set_mismatch` (`:491`, `:573-575`).
  - That fixture is an unauthenticated, non-canonical receipt defect.
  - It is expected as `exit=1` with `CLEANUP-PERWORKER-01` / `COUNT-01` fail.
- **Correct split.** The distinction is by authority, not by finding id:
  - **Anchored bytes unreadable or mismatched → could-not-evaluate:** canonical receipt or pin sha (`:735-738`), an anchored worker (F1), spec/config/manifest current bytes (`:623-626`, `:640-645`).
  - **A receipt's own claims inconsistent with anchored bytes → fail:** empty `workers`, duplicate reference, identity mismatch, proof mismatch.
- `R14-ARIA-SOURCE-01` currently mixes both kinds in one `problems` list (`:613-645`), as `receipt.*` versus `spec.currentSha256` / `config.currentSha256` / `manifest.currentSha256`. The classifier needs per-problem classes. A single finding-level status cannot express the split.

### F3: MEDIUM (A3, A6): the producer source digest is never measured; it is only compared as a recorded value
- **Code.** `SOURCE_PATHS.producer` is used only as an expected *path string* (`:615`, `:1203`, `:1591`, `:1602`).
  - `readEntry(SOURCE_PATHS.producer)` is never called.
  - Spec and config bytes are hashed live (`:640-645`); the producer is not.
  - The worker "source digest proof" (`:602-638`) compares the worker's self-reported `sourceSha256`, `source.sha256` and `inputs[source].actualSha256` against a constant.
  - Both the receipt and the worker record `inputs[source].expectedSha256: null` (fixture mirrors this at `:1603`). So the producer never declared an expected digest; the record is self-attested.
- **Assessment.** This is defensible: `scripts/` is mutable, and round-14 NoHarmCritic showed the producer changing in the worktree. The sidecar wording is truthful ("historical producer identity recorded by the receipt", `:1205`).
- **The prose overstates it:**
  - `SKILL.md:1755`: "Checker ANCHORS pin original receipt/pin/worker/spec/config/manifest/producer".
  - Sibling `.ufo/waves/round-15/w1/SidecarIdentity.md:9`: "Producer/spec/config/manifest identities are also rechecked through … current files". This is false for the producer.
- **Smallest fix (wording only).** Qualify it as "producer identity anchored as a recorded value; current producer bytes intentionally not measured". If live checking is ever wanted, add an informational finding: current producer sha equal or not equal to the anchor. Never make it gating, because that would turn legitimate producer edits into historical-gate failures.

### F4: MEDIUM (A2): a worker path is not canonicalised; the anchor is looked up by basename
- **Code.**
  - The guard is `file.startsWith(WORKER_PREFIX)`, no `..`, not absolute (`:508`).
  - The anchor lookup is `ANCHORS.workers[basename]` (`:747`).
  - The directory listing is non-recursive and keeps `.json` names only (`:565-567`).
- **Counterexample.**
  - Copy the anchored bytes to `…/workers/sub/worker-0-1530637-1792474958700.json`, or reference `…/workers/./worker-0-…json`.
  - Point a non-canonical receipt's `workers[0].file` at it.
  - The anchor passes (same bytes), the set passes (the top-level name is still present and matches), and the duplicate check passes (one reference).
  - Result: the provenance path is substituted while every finding stays green.
- **Impact.** Limited, because the canonical receipt's bytes are anchored, so only fixture or non-canonical receipts are exposed.
- **Fix.** Require `file === WORKER_PREFIX + basename(file)`. Otherwise push `workers[i]:file:noncanonical_path`.

### F5: MEDIUM (A6): the sidecar says "worker bytes" but binds no worker digest
- `buildSidecar`'s note says "Derived only from the committed historical receipt, pin, manifest, and worker bytes" (`:1195`).
- `binding.perWorker` holds digests of the *receipt's* `cleanup.server.perWorker` copies (`:1219-1220`, `:947-953`), not of the worker file. Config is also absent from `source`.
- Round-14 `ReceiptSecurity.md:34` (RS-1) asked that "The sidecar records all four digests". The worker digest is enforced only by the checker constant at re-check time.
- `corrected.json` is historical and must stay immutable. Any new or derived artifact should either record `source.workers[{path,sha256}]` and `source.config`, or qualify the note.

### F6: MEDIUM (A5): no red test reaches the worker anchor, set, proof or source findings
- `WORKER_DIR` is ROOT-relative (`:48`, `:56`, `:565`). Every fixture receipt references the real worker (`FIXTURE_WORKER_REF`, `:98-101`). The self-test therefore cannot tamper with a worker without mutating historical evidence.
- None of the 15 expected cases expects `ANCHOR-01`, `WORKER-SET-01`, `WORKER-PROOF-01` or `SOURCE-01` to fail.
- Round-14 `ClaimSeparation.md:81` lists `worker-missing`, `worker-path-escape` and `digest-mismatch` as self-test red controls. Those ids do **not** exist in `expected-fixtures.json`, so that historical claim is unsupported (flag only; history is immutable).
- **Side effect.** Green self-test cases depend on the live worker bytes. Real worker tampering would therefore surface as "self-test regression", not as tampering.
- **Smallest safe correction, with no new CLI surface and anchors still code constants.**
  1. Self-test mirrors a temp ROOT: copy the script to `<tmp>/scripts/`, and copy manifest, spec, config and worker into `<tmp>/corpus/evidence/round-13/aria/…`.
  2. Mutate the temp copy only, then spawn the *copied* script, so its `ROOT` is the temp dir.
  3. Do not add a `--worker-root` flag.

### F7: LOW (A1): emitted per-worker mirrors left unchecked by worker coverage
- `receipt.workers[i].{serverOk,outputConfinementOk,setupError,localCases}` (receipt `:2365-2385` region) vs `worker.cleanup.serverOk` / `.outputConfinementOk`, and `worker.cases[].name`.
- `receipt.server.perWorker[i].server` vs `worker.server`.
- Worker `cleanup.{serverOk,serverClosed,serverRefusedAfterClose}` vs receipt top-level aggregates.
- Only the identity and the `cleanup.server` proof are deep-compared (`:549-559`). Manifest case coverage is unioned across workers (`:670-687`), not per `localCases`.
- These are mirrors in the C2 sense. Add them to `WORKER-PROOF-01` or explicitly declare them out of scope.

## Proposed expected-fixture cases (temp-ROOT mirror, F6 harness)

| id | mutation (temp copy only) | expected (after F1/F2/F4 fixes) |
|---|---|---|
| `worker-sha-mismatch` | change `generatedAt` in the temp worker (keeps the proof equal) | `R14-ARIA-ANCHOR-01:fail` `worker_sha256:<name>` → **could-not-evaluate** |
| `worker-anchor-missing` | delete the temp worker | `ANCHOR-01:fail` `worker_anchor_unread:<name>:missing` → **could-not-evaluate** (currently ANCHOR passes) |
| `worker-anchor-symlink` | replace it with a symlink to an identical copy | `ANCHOR-01:fail` `…:symlink` → could-not-evaluate |
| `worker-extra-unreferenced` | add `worker-1-1-1.json` | `WORKER-SET-01:fail` `directory_set_mismatch` + `ANCHOR-01` `worker:unanchored` only if referenced → could-not-evaluate |
| `worker-duplicate-ref` | fixture receipt `workers:[A,A]`, perWorker ×2 | `WORKER-SET-01:fail` `workers:duplicate_file`, exit 1, **fail** (not could-not-evaluate) |
| `worker-subdir-path` | identical copy at `workers/sub/<name>`, receipt points there | `WORKER-SET-01:fail` `file:noncanonical_path` (currently green) |
| `worker-source-field` | edit the temp worker `sourceSha256` | `SOURCE-01:fail` `worker.sourceSha256` and `ANCHOR-01` `worker_sha256` → could-not-evaluate |
| `empty-perworker` (existing) | unchanged | must stay **fail** (exit 1), never could-not-evaluate (F2 regression guard) |

## Commands for L1 after integration (not run by me)
- `node scripts/check-aria-metadata.mjs --self-test`
- `node scripts/check-aria-metadata.mjs` (canonical: expect the original red only)
- `node scripts/check-aria-metadata.mjs --witness`
- `sha256sum corpus/evidence/round-13/aria/{receipt.json,runtime-pin.json,manifest.json,actual/workers/*.json} scripts/aria-loopback-round13.mjs` (historical bytes unchanged)

No tools were installed or updated.
