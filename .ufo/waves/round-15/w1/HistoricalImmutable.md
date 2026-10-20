# HistoricalImmutable — round-15 w1 bounded audit (read-only)

Author: TabiR15.HistoricalImmutable (leaf). Scope: round-13 / round-14 source, producer and note byte pins; files that must not be edited; defects and proposed tests for the C1 (USER counter diagnostics) and C2 (ARIA metadata gate) slices.

Method: `sha256sum` over the listed paths, `git show <rev>:<path> | sha256sum`, `git rev-parse` on two blobs, `stat`, `git status`, `grep` and bounded reads of checker code. No gate, self-test, counter, test, suite or browser was executed. No source, evidence, lesson, note or registry file was edited. Only this report was written.

Tooling: none installed or updated. All commands were read-only coreutils, git plumbing and grep.

## 0. Drift note (read first)

- The immutable set in §2–§3 matched HEAD and the worktree at audit time. Re-verified last: `corrected.json` `e156b922…`, `receipt.json` `b458b351…`, producer `1d54c9e9…`.
- `scripts/check-aria-metadata.mjs` and `scripts/check-user-round-contract.mjs` were **modified in the worktree during this audit** by the C2/C1 owners (uncommitted; `git diff --stat`: 92 and 108 changed lines). Their HEAD digests are `ef37387217c7…` (aria) and `bde18c672d79…` (user). Defect anchors in §4 are against **HEAD**, not the in-progress worktree.
- The in-progress worktree already contains `snapshot_tampered` / `TAMPER_STATUS = 'could_not_evaluate'` (aria, near lines 82-91), `CLEANUP_MIRROR_FIELDS` and a `--witness-mirrors` header. These appear to address D1–D3 below. This audit did **not** validate those edits; owners must re-verify against their current bytes.
- The aria header also points at `corpus/evidence/round-15/metadata/expected-fixtures.json` and `mirror-contract.json`; those are round-15 artifacts, not immutable.

## 1. Axes

1. **Pin integrity** — each historical file is bound by a digest in a committed receipt, sidecar, gate record, lesson or checker constant.
2. **Editability** — which files a round-15 edit may touch without breaking a recorded digest.
3. **C1 target** — `scripts/check-user-round-contract.mjs` (counter refusal diagnostics).
4. **C2 target** — `scripts/check-aria-metadata.mjs` (mirror coverage and could-not-evaluate classification).

## 2. Verified digests

Status at audit time: each path below equals HEAD and the worktree (no `git status` entry), except the two gate scripts noted in §0.

| Path | sha256 | Bound by (anchor) |
|---|---|---|
| `scripts/aria-loopback-round13.mjs` | `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c` | `receipt.json` `sourceSha256`; aria checker `ANCHORS.producerSourceSha256` (HEAD line 65); `corrected.json` `source.producer`. `git show 837b33a:` agrees. |
| `corpus/knowledge/aria-loopback-round-13.md` | `a720f541e1a5733eec4fe41cb7abba0834edb426ce08804477e7ee11c27128c9` (6829 B) | `receipt.json` `noteSha256` / `documentedNoteSha256`; `actual/*.json` `note.sha256`. Round-14 lesson §Gate: erratum removed for this reason. |
| `corpus/evidence/round-13/aria/receipt.json` | `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (97073 B) | aria checker `ANCHORS.receiptSha256` (HEAD line 63); `corrected.json` `binding.receiptSha256`, `original.receipt`. `git show 837b33a:` agrees. |
| `corpus/evidence/round-13/aria/runtime-pin.json` | `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2` (1154 B) | aria `ANCHORS.pinSha256` (HEAD line 64); `corrected.json` `original.pin`. |
| `corpus/evidence/round-13/aria/manifest.json` | `56764241df4f4a644af39e368b2e47f35d3f4bbbdf17e7cef3fa848ee0d72112` | aria `ANCHORS.manifestSha256` (HEAD line 68). Historical `30f84f27…` only in `aria-initial-receipt.json`. |
| `corpus/evidence/round-13/aria/aria-loopback.spec.mjs` | `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc` | aria `ANCHORS.specSha256` (HEAD line 66). Historical `f37c6c55…` only in `aria-initial-receipt.json`. |
| `corpus/evidence/round-13/aria/playwright.config.mjs` | `87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4` | aria `ANCHORS.configSha256` (HEAD line 67). |
| `corpus/evidence/round-13/aria/package.json` | `b3d2afa30642eaeb6b8025324299a20bdf46790db17f6a4b6bdb93b34a38fa80` | receipt `runtime` (Playwright 1.64.0). |
| `corpus/evidence/round-13/aria/package-lock.json` | `08f9a03c6a29ae5dce8f1d31f66b0f3dc7496a0fc04a8f096eafce0aa299e521` | receipt `runtime`. |
| `corpus/evidence/round-13/aria/.gitignore` | `c3007e8cfe9e6668bf6eaf8e62f44d583c9b86893520d1e4e599db431558b705` | — |
| `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json` | `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7` | aria `ANCHORS.workers` (HEAD lines 69-72). |
| `corpus/evidence/round-14/aria-metadata/corrected.json` | `e156b922b0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745` | Round-14 lesson §Execution addendum ("Its digest is …"). Not in any checker ANCHORS (D5). |
| `corpus/evidence/round-14/aria-metadata/verification.json` | `da001633bc2323526191918108bfb1caf7c6e89265c23b16f83cb46deed266ca` | Round-14 execution record. |
| `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` | `19339f3eb1a959bdf8b00a13c8652fb900a49c83317c341d01a1ef88376af342` | Round-14 execution record. |
| `corpus/evidence/round-14/aria-metadata/executions/{before,after,comparison,derive,selfTest}.json` | `6aabe557…`, `bf956500…`, `afadcf5a…`, `22f822f7…`, `61e01528…` | Round-14 execution record. |
| `corpus/evidence/round-13/gates.json` | `be50f26546d060e83ad7173dea28e2450158f87fc7341ae11b8025f17f000d45` | Round-13 receipts; records `check-round-contract.mjs` `8478cd43…` and `check-user-round-contract.mjs` `69066121…`. |
| `corpus/evidence/round-14/gates.json` | `7cb1bedf0b3f5fb0e5e87d5077cd322f4a8da24bb3ebc1f11f20576977fbb0e6` | Round-14 receipts; records `check-round-contract.mjs` `8a573b4e…` and `check-user-round-contract.mjs` `bde18c67…`. |
| `corpus/lessons/round-13.md` | `72f483463a4eebefa72e49d15ac6bb8b397768238dcbf02d12c7bbb9c497591f` | Frozen lesson (first-added). USER gate `LEGACY_LESSON` regex protects `corpus/lessons/round-N.md`. |
| `corpus/lessons/round-14.md` | `ee7cfe073062e30c0c34966e1c885e96df392bcfa55ebe9ccc92b519e1ab6b31` | Frozen lesson; §Execution addendum quotes the `corrected.json` digest. |
| `corpus/lessons/round-13-verifier-spotcheck.md` | `43eae1065614a9697d0a83acce5c36b9f25e1183dd27bb9b78a1704ae9ca17d9` | Non-author verifier record. Never edit. |
| `corpus/lessons/round-14-verifier-spotcheck.md` | `1e882d2e47cf8ff78d60e4e694435536b1aaea367517b8bede6cf4327ff2a358` | Non-author closure record (`author: hyaku closure`). Never edit. |
| `.ufo/waves/round-13/measure.mjs` | `6fabbaddb01bc54e1d5ffc8877b16497e32390b409006e4adb1e7622a4291107` | Round-13 SCORECARD counting producer. |
| `.ufo/waves/round-14/measure.mjs` | `22b6f5e5fa585555923971a0f56c640a2d38ae2d797aa84e4f9cae288cf7cab1` | Round-14 counting producer (`node .ufo/waves/round-14/measure.mjs REV --claim C1` per lesson). |
| `.ufo/waves/round-13/w1/canonical-seed.json` | `aaa7525709bbab8e33b14e9e1caeeb4e5f5acbfcb3e4b0afd5657f4386368e83` | Round-13 canonical-seed identity. |
| `scripts/check-round-contract.mjs` | `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` | USER `ROUND_SCRIPT_CURRENT_SHA256` (HEAD line 32); accepted by `acceptedRoundScript()` (HEAD lines 206-225). Clean in worktree. |
| `scripts/check-user-round-contract.mjs` (HEAD) | `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3` | Round-14 gate record. **Worktree modified** (`979be6ac…`). |
| `scripts/check-aria-metadata.mjs` (HEAD) | `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6` | Round-14 checker (`verification.json`). **Worktree modified** (`04a25973…`, 2343 lines). |

Committed blob identity (git, not sha256): `bebe2ef:scripts/check-user-round-contract.mjs` = `7df3ee9f4df6db3c36c886f9173715bc299ce43a`, equal to the USER constant `LEGACY_COUNT_GATE_BLOB`.

## 3. Files absolutely NOT editable

Editing any of these changes a digest that a committed receipt, sidecar, lesson or checker constant binds. The result is either a gate failure (`history_rewritten`, `receipt_sha256`, `pin_sha256`) or a silently invalidated witness. A correction must be a new file with its own digest, never an in-place edit.

1. `scripts/aria-loopback-round13.mjs` — runtime-pinned producer (§2).
2. `corpus/knowledge/aria-loopback-round-13.md` — admitted note bound by receipt `noteSha256`.
3. Everything under `corpus/evidence/round-13/` — receipts, aria runner evidence, templates, fixtures, `actual/`, `workers/`, `gates.json`, measurements, witnesses, selftests.
4. Everything under `corpus/evidence/round-14/` — `aria-metadata/corrected.json` (sidecar, digest in lesson), `verification.json`, `expected-fixtures.json`, `executions/*`, `gates.json`, `measurements.json`, `final-production.json`, `source-reopening-count.json`, `census-after.json`.
5. `corpus/lessons/round-13.md`, `round-14.md`, `round-13-verifier-spotcheck.md`, `round-14-verifier-spotcheck.md` — frozen lessons; the two spotcheck files are non-author records.
6. `.ufo/waves/round-13/**` and `.ufo/waves/round-14/**` — including both `measure.mjs` producers, `canonical-seed.json`, `before.json`, `spec.json`, `dispatch.json`, `swarm-registry.json`, `wave-receipt.json`, `w1/*`.
7. Immutable registry cells of `corpus/SOURCES.md` rows S001–S029. Compare with `git show HEAD:corpus/SOURCES.md`; the worktree carries uncommitted L1-owned changes.
8. `scripts/check-round-contract.mjs` — pinned by identity in `check-user-round-contract.mjs` (`ROUND_SCRIPT_CURRENT_SHA256` = `8a573b4e…`, `ROUND_SCRIPT_CUTOVER_SHA256` = `8478cd43…`, `ROUND_SCRIPT_PRIOR_SHA256` = `7d403cee…`, `ROUND_SCRIPT_INTERMEDIATE_SHA256` = `6f9eddc7…`). Any byte change makes `acceptedRoundScript()` false, and the USER gate fails `history_rewritten`.

Constants inside the editable gate scripts that must not change (self-blessing guard):
- `check-user-round-contract.mjs`: `HARD_BASELINE` = `7f506affa55f6fb892d3c8073c75151c998bdf2c`; `PSTACK_PIN` = `92d700d6a8aa9855f1e9d2cc8e12c82f762a1367`; the four `ROUND_SCRIPT_*` digests; `SHONEN_SEED_SHA256` = `b45c2ac3…`; `LEGACY_USER_GATE_BLOB` = `18e2c79a…`; `LEGACY_COUNT_GATE_BLOB` = `7df3ee9f…`; `LEGACY_LESSON` regex; default `expect: 10` (HEAD line 254).
- `check-aria-metadata.mjs`: `ANCHORS` (HEAD lines 62-73) and `SOURCE_PATHS` (75-80). A new anchor is allowed only if derived from a digest already recorded in a committed lesson or receipt; never re-derive an anchor from the file being checked.

Editable under the round-15 contract: `scripts/check-user-round-contract.mjs` (C1) and `scripts/check-aria-metadata.mjs` (C2), subject to the constants above and to one invariant: `corrected.json` must still be accepted with its committed bytes (`e156b922…`). Do not change `buildSidecar()` output shape for the committed inputs (see D3).

## 4. Defects and anchors (against HEAD ef37387… / bde18c67…)

### C2 — `scripts/check-aria-metadata.mjs`

**D1 (high, C2 acceptance). No could-not-evaluate classification at HEAD.** `git show HEAD:scripts/check-aria-metadata.mjs | grep could_not_evaluate` returns 0. Tampered receipt, pin, manifest, spec, config, worker or sidecar bytes fall into ordinary `fail` findings through `evaluateAnchors` (HEAD 731-775), `evaluateSidecar` (HEAD 853-1110) and binding checks (HEAD 909-966). The USER gate already has the pattern: `fail('could_not_evaluate', …, 2)` at `check-user-round-contract.mjs` lines 102, 208, 214, 216, 218, 894. *Status in worktree:* `snapshot_tampered` and `TAMPER_STATUS` now exist; verify.

**D2 (high, C2 "checks all emitted mirrors"). `corrected.json` `cleanup` object is not compared at HEAD.** `corrected.json` carries `cleanup` (`allClosed`, `allNotListeningAfter`, `allRefusedAfterClose`, `derivedListeningAfter`, `perWorkerCount`, `summaryServerOk`). The HEAD emitter is `buildSidecar()` (~HEAD 1264-1270). HEAD `evaluateSidecar` has no reference to `sidecar.cleanup`; the only `cleanup` reads in 853-1110 are receipt-side (885-890). Editing any of those fields is accepted at HEAD. *Status in worktree:* `CLEANUP_MIRROR_FIELDS` now exists; verify it covers every emitted field.

**D3 (high). HEAD `runCheck` (1111-1143) validates a field subset, not the document.** Unchecked at HEAD: `qualification.everyProofClosed`, `everyProofListensBefore`, `everyProofRefusedAfterClose`. Checked there: `qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, `everyProofNotListeningAfter`. The derive path writes `stableStringify(buildSidecar(...))` (1364-1370), so the committed `corrected.json` equals emitter output. Any fix must keep that output byte-identical for committed inputs, or the immutable sidecar stops being accepted.

**D4 (medium, mirror semantics). `correction.corrected` is the corrected value, not a flag.** `corrected.json` has `"correction": {"corrected": false, …}` while `status` is `qualified` and `corrections[0]` shows `from: true, to: false`. HEAD line 996 compares `mirror.corrected` to `correction.to`. A reader will take `corrected:false` as "no correction applied." Do not rename in the historical file; document the meaning in the checker and in any new sidecar.

**D5 (medium). The sidecar has no digest anchor at HEAD.** `ANCHORS` pins receipt, pin, producer, spec, config, manifest and worker, but not `corrected.json`. Its digest `e156b922…` appears only in round-14 lesson prose. This is the main gap behind D2/D3: an edited sidecar is never identified as tampered.

**D6 (low). Aggregate mirrors are one boolean.** HEAD emitter: `allNotListeningAfter`, `allProofsSupportCorrection`, `everyProofListensBefore` and `everyProofNotListeningAfter` all equal `allValuesOk` (~HEAD 1174, 1267-1279). Per-proof values are not independently derived. Proposed test: a two-proof fixture with one `listeningAfter: true` must break the per-field mirror.

**D7 (information). Node fields are checked at HEAD.** `observed`, `recorded`, `minimumMajor`, `exactMatch`, `descriptiveOnly`, `minimumMajorSatisfied` are compared (HEAD 1012-1029). Keep them; they support the descriptive-only Node calibration.

**D11 (C2, documentation drift in worktree).** The worktree header documents `--witness-mirrors` (header lines 37-41) and `--sidecar <corrected.json>` as a mode; the HEAD parser (`parseArguments`, ~2174-2199) handles `--witness`, `--check`, `--derive`, `--sidecar`, `--out`, `--self-test` only. If `--witness-mirrors` is not in the parser, it is a usage error and the documented differential proof cannot run. Owners must confirm before claiming it.

### C1 — `scripts/check-user-round-contract.mjs`

**D8 (C1 target). The `round_count` refusal carries no applicability or reason field.** HEAD line 580: `fail('round_count', \`Found ${ids.length} user rounds, expected ${options.expect}\`)`. The finding is a flat id with free-text detail; it does not say whether the check was applicable, nor which committed round files were counted. Proposed contract: `applicability` (`applicable` | `not_applicable`), a stable `reason` enum, `observed`, `expected`. Keep `expect` default 10 (HEAD line 254) and the exit code.

**D9 (C1, production alias guard).** HEAD line 279 refuses non-default `--baseline`, `--expect` or `--pstack-pin` on the production root with `usage`. The selftest at HEAD 1022-1025 asserts `expected_finding=usage`. Extend this existing expected-reason pattern to the counter diagnostics.

**D10 (C1 isolation).** `acceptedRoundScript()` (HEAD 206-225) walks `${pstackPin}..HEAD` for `scripts/check-round-contract.mjs`. A C1 edit must not touch that file, or the USER gate fails before the counter is reached.

## 5. Proposed tests (not executed)

Run in isolated temp directories, never on the committed tree.

T1 — ARIA sidecar tamper matrix. Copy `corrected.json` and `receipt.json` into a temp root. For each of: `cleanup.allClosed`, `cleanup.allNotListeningAfter`, `cleanup.allRefusedAfterClose`, `cleanup.summaryServerOk`, `cleanup.perWorkerCount`, `cleanup.derivedListeningAfter`, `qualification.everyProofClosed`, `qualification.everyProofListensBefore`, `qualification.everyProofRefusedAfterClose`, `correction.corrected`, `binding.proofSetSha256`: flip the value. Expect `could_not_evaluate` (exit 2) or `fail` (exit 1), never exit 0. HEAD is predicted to exit 0 for the `cleanup.*` and `everyProof{Closed,ListensBefore,RefusedAfterClose}` flips (D2/D3). Prediction from reading, not observed.

T2 — Anchor-artifact tamper. One-byte change to receipt, pin, manifest, spec, config, worker or sidecar copy → `could_not_evaluate`, never clean.

T3 — Positive control. Unmodified committed inputs → exit 0 with `accepted=true` and the same sidecar digest `e156b922…`. Proves the stricter checks do not reject the immutable sidecar.

T4 — Contradiction control. Receipt with `cleanup.server.listeningAfter: true` but every `perWorker` proof false → finding `R14-ARIA-CLEANUP-LISTENING-AFTER-01` must fail, exit 1.

T5 — USER reason control. Copied fixture tree with N−1 round files; `check-user-round-contract.mjs --expect N` must emit `round_count` with `applicability` and `reason` present and stable. Assert the exact reason string, not only `finding`.

T6 — USER isolation. In a temp copy, modify only `check-user-round-contract.mjs`: the pinned `check-round-contract.mjs` bytes (`8a573b4e…`) and the four constants must still pass `acceptedRoundScript()`.

T7 — Mirror-contract drift. If a `mirror-contract.json` asset exists beside the checker, its field list must equal the code-owned table exactly; add a fixture where one emitted field is missing from the table → must fail.

## 6. Commands L1 should run after integration (not run by this seat)

- `sha256sum` over every row in §2, then `git show HEAD:<path> | sha256sum` for the immutable set. Worktree must equal HEAD for every row except the two gate scripts, which must match their final integrated bytes.
- `node scripts/check-aria-metadata.mjs --self-test` (expect exit 0 after C2 changes; include T1–T4).
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-13/aria/receipt.json` (expect the original contradiction to remain red).
- `node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0, same sidecar digest `e156b922…`).
- `node scripts/check-user-round-contract.mjs --self-test` (expect exit 0 after C1 changes; include T5).
- `node scripts/check-round-contract.mjs --self-test` only as a read of the pinned identity; it is unchanged by this round.

## 7. Routing

- Code-related findings D1–D7 and D11 → `MetadataEnforce` (C2). Exact id: `TabiR15.MetadataEnforce`.
- Code-related findings D8–D10 → `CounterDiagnostics` (C1). Exact id: `TabiR15.CounterDiagnostics`.
- Lane-integration items (LOG/SCORECARD/QUALITY/SKILL/README and the round-15 lesson) are L1-owned and were not touched.

## 8. Residual risk and gaps

- T1/T2 predictions are read-only inferences from HEAD code paths; not observed.
- The worktree edits by the C1/C2 owners were not reviewed in detail here. Their status claims (D1–D3, D11) need the owners' own verification.
- This audit did not verify that the historical runner reproduces the receipt. That would require a browser run, which the contract forbids.
- Non-author closure of round 13/14 is in the committed spotcheck files; this seat did not re-derive it.

Installed/updated tools: none.
