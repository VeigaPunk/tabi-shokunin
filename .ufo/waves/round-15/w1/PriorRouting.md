# TabiR15.PriorRouting — round14 verifier routed items 1–7 → round15 evidence map

Role: read-only scribe audit. No gate, selftest, counter, browser, or test was executed. No source, evidence, registry, or ledger file was edited. Author-side only; not non-author certification.

Snapshot: working tree observed 2026-10-20 ~05:03–05:05 -03:00. HEAD `7054a5e`. The round-15 lane is still being edited: uncommitted `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `scripts/check-aria-metadata.mjs`, `scripts/check-user-round-contract.mjs`; untracked `.ufo/waves/round-15/`, `corpus/evidence/round-15/`. Line numbers below are the working-tree numbers seen at that time unless marked HEAD. In-flight edits may shift them.

Source of the routed items: `corpus/lessons/round-14-verifier-spotcheck.md:182-190` (items 1–7).

Tooling: none installed, updated, or invoked by this seat.

---

## 1. Routed item → round15 evidence path → current state

| # | Verifier requirement (round-14 spotcheck) | Round15 owner / evidence path | State observed | Gap |
|---|---|---|---|---|
| 1 | Metadata enforcement wording: distinguish the checker-enforced retrospective minimum from the historical producer, which never enforces `pin.node`. Keep recorded/descriptive separate from observed. Append, do not rewrite frozen evidence. | SKILL: `SKILL.md` "## Round 15" (≈1764–1773, uncommitted). Checker header: `scripts/check-aria-metadata.mjs` lines 1–20 (uncommitted). Frozen sidecar note stays in `corpus/evidence/round-14/aria-metadata/corrected.json` (node.note). | SKILL correction present. Checker header qualifies the floor ("enforced by THIS retrospective checker only"). | Partial. The frozen sidecar `node.note` text ("is the enforced floor", generated at HEAD ≈1258–1261) must stay as is; see D5. |
| 2 | Checker/mirror/selftest precision: `check-aria-metadata.mjs` 908–1084 checks core bindings only, not all `cleanup.*` mirrors or `qualification.everyProof{ListensBefore,Closed,RefusedAfterClose}`. Describe the tally as 15 CLI + 1 deterministic helper. | MetadataEnforce: `scripts/check-aria-metadata.mjs` (sidecar evaluation, ≈853–1109); new mirror fixtures belong in a round15 path, e.g. `corpus/evidence/round-15/aria-metadata/` (does not exist yet). | Not implemented. Header describes `--witness-mirrors` (≈37–41); grep finds no such mode in code. | D2, D3. |
| 3 | Tamper classification: anchor/source mismatches currently exit 1 as failed findings, not `snapshot_tampered` could-not-evaluate. | MetadataEnforce: `evaluateAnchors` (≈731–774 HEAD), `runCheck` (≈1111–1143), `main` (≈2227–2244). Fixtures: `corpus/evidence/round-15/aria-metadata/` (tamper copies, see proposed tests). | Not implemented. No `snapshot_tampered` token in code. Header (≈21–24), SKILL:1778 and QUALITY.md:20 already claim it. | D1 (docs ahead of code). |
| 4 | Counter receipt diagnostic precision: USER malicious fixtures assert `score_mismatch` only; `no_marker=0` also means not applicable. Make applicability and reason explicit. | CounterDiagnostics: `scripts/check-user-round-contract.mjs` (`COUNT_REASONS`, `fail(...,reason)`, `receiptOf`, `receiptMatches`, selftest ≈1040–1075 working tree). Round15 receipts: `corpus/evidence/round-15/…` (not yet). | In progress. Reason plumbing exists. `receiptMatches` is defined but has no call site. `diagnosticWitness()` is called but not defined. Selftest still prints `no_marker=0` for N/A cases. | D6, D7. |
| 5 | Source/evidence traceability and falsifier timing: direct S029 reference in new machine-evidence metadata or its index; AttackMetadata predates checker. | `corpus/evidence/round-15/source-index.json` (exists, S029, `historicalReceipt.sha256` = `b458b351…` = `ANCHORS.receiptSha256`); `corpus/SOURCES.md:43` (used-by), `:64` (round-15 reopening); SKILL:1780 (falsifier-timing row). | Mostly present. | D10: used-by names `corpus/lessons/round-15.md`, which does not exist. |
| 6 | Preserve honest inherited boundaries: USER red 6/10; survivor replay, user-record freezing, IPv6 classification, Git env/hook/config trust, external-validator pin, producer summary inversion stay uncredited. | SKILL "## Round 15" (≈1764–1786); USER gate `expect` default (HEAD line 254; working tree ≈271) must remain 10. | Code-level: `expect: 10` unchanged. Docs: the round-15 SKILL section restates none of the boundaries listed. | D11. |
| 7 | Protocol/operator: committed frozen step-1/step-4 closure-checker run naming the current inputs; the scribe's manual history-pin check does not count. | Operator/L1 owned. No round15 evidence path exists. `.ufo/waves/round-15/w1/validation.json` is a swarm dispatch validation (`schema: ufo-swarm-wave-dispatch-v1`, `wave: tabi-round-15-w1`), not a closure-checker run. `validation.stderr.txt` is empty. | Open. | D12. Not satisfiable by any author seat. |

---

## 2. Defects (ordered by severity)

**D1 — high — tamper classification absent; docs ahead of code (item 3).**
- `evaluateAnchors` (HEAD ≈731–774) records `receipt_sha256`, `pin_sha256`, `worker_sha256:<name>`, `worker:unanchored:<name>`, and `anchored_*_noncanonical_path` as problems of finding `R14-ARIA-ANCHOR-01`. `runCheck` then gives `exit 1`, and `main` maps that to `verdict=red`.
- Source/manifest digest drift (`evaluateSourceIdentity` ≈594, `evaluateManifest` ≈657) is also `exit 1`.
- The registry standard (SKILL:1778) says digest drift → `snapshot_tampered`, exit 2. Semantic disagreement stays exit 1.
- Required change: after evaluation, if any digest-class problem (anchor sha, source/producer/spec/config/manifest sha, worker sha) is present, exit 2 with `reason=snapshot_tampered`. Keep contradictions exit 1.
- Decision for L1: a byte-identical anchored receipt at a non-canonical path (`anchored_receipt_bytes_at_noncanonical_path`) is not digest drift. Keep it exit 1 and say so, or classify it deliberately. Do not leave it implicit.
- Non-canonical fixtures never trigger the anchor check (`canonicalReceipt` is false and the sha is not anchored). A tamper test therefore has to run from a copied tree (see T1).

**D2 — high — sidecar mirror coverage gaps (item 2).** Fields emitted by `buildSidecar` (HEAD ≈1247–1280) and not checked by `evaluateSidecar`:
- `cleanup.{perWorkerCount, allClosed, allRefusedAfterClose, allNotListeningAfter, derivedListeningAfter, summaryServerOk}`. No reference to `sidecar?.cleanup` exists in the checker.
- `qualification.everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`. Only `qualified`, `status`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, `everyProofNotListeningAfter` are checked (≈1061–1075).
- `corrections[0].derived` and `corrections[0].rule` (checked: path, from, to, value, supportingProofs at ≈971–991; `correction.derived` at ≈997 is checked).
- `source.spec.sha256` and `source.manifest.sha256` in the sidecar. Only `source.producer.sourceSha256` is checked (≈959). The `specSha256` check at HEAD ≈616 applies to the receipt's own `source`, not the sidecar mirror.
- Circularity: `allValuesOk = cleanupDerived.allProofsPass === true` (≈1254) feeds `allProofsSupportCorrection`, `everyProofListensBefore`, `everyProofNotListeningAfter`, and `allNotListeningAfter`. Four distinct claims share one boolean, so each is only as good as that boolean.
- Fix: recompute each mirror independently from the authenticated proofs, one finding per group, exit 1 on mismatch. Do not reuse `allValuesOk`.

**D3 — high — selftest tally can silently lose cases (item 2).**
- HEAD ≈1898: `const ok = fixturesOk && casesOk && results.length >= 4;`. Deleting CLI cases from `expected-fixtures.json` still passes.
- `fixtures` are compared only by iterating expectation keys (≈1765). A generated fixture with no expectation entry is never caught.
- Only receipt/pin/malformed fixtures have digests in `expected-fixtures.json`. The five `sidecar-*` fixtures are generated in-process and not digest-pinned.
- Fix: `results.length === expectations.cases.length + 1` (CLI cases + one derive helper) and fixture key-set equality. Keep the tally wording: 15 CLI + 1 helper.

**D4 — medium — verdict vocabulary and exit map drift from the registry (items 1, 3).**
- SKILL:1755 registry row: `0 clean, 1 failed, 2 could-not-evaluate`.
- Checker emits `verdict=clean|red` (≈2234–2235). Fatal path prints `verdict=red` with exit 2 (≈2252). Missing or unreadable check input prints `verdict=red` with exit 1 (≈2216–2221), though an unreadable input is could-not-evaluate under the registry standard.
- USER gate uses `verdict=failed|could-not-evaluate` (HEAD ≈1041). The two gates disagree.

**D5 — medium — Node note: keep the frozen text; do not "fix" it in buildSidecar.**
- `buildSidecar` node note (HEAD ≈1258–1261) says "node.minimumMajor=20 is the enforced floor". This is the same claim item 1 wants qualified.
- Changing that string changes the output of `--derive` for the canonical receipt, so `--derive` would no longer reproduce `corrected.json` (`identical=false`). `resolveOutPath` (≈1284–1300) also restricts derive output to `corpus/evidence/round-14/aria-metadata/`, so a round-15 sidecar cannot be written without changing constants (`DEFAULT_SIDECAR`, `EVIDENCE_DIR`, `DEFAULT_EXPECTATIONS`). That in turn changes what the no-argument check and `--witness` read.
- Comment-only edits to the checker change `checkerSha256`, which is pinned in `corpus/evidence/round-14/aria-metadata/verification.json` (`ef373872…` at `e570380`). A round15 verification receipt is needed for any checker change. Historical files stay unchanged.
- Recommended: keep the frozen sidecar and its generator text byte-identical. The qualification lives in the SKILL round-15 section and the round-15 lesson, as it does now.

**D6 — high (C1 in progress) — `diagnosticWitness` is referenced but not defined.**
- Working tree `scripts/check-user-round-contract.mjs` (≈1091): `else if (options.diagnosticWitness) diagnosticWitness();`. A grep for `function diagnosticWitness` returns nothing.
- Effect: `--diagnostic-witness` reaches the top-level `catch` and exits 2 with `could-not-evaluate` (fails closed, but the feature does not exist). It must be defined with a receipt, or the flag removed.

**D7 — high (C1 in progress) — diagnostic comparator not wired; N/A still reported as 0.**
- `receiptMatches` (≈778) and `receiptOf` (≈756–775) are defined. A grep for `receiptMatches(` shows no call site. The malicious cases still assert only exit plus `finding=score_mismatch` (HEAD selftest ≈985–990).
- Selftest lines still print `no_marker=0` for N/A (≈1045 cases; ≈1058 committed counts; ≈1070 witness). This is the exact ambiguity routed item 4 names.
- Until the comparator is called from the malicious cases, the 0→1 diagnostic claim is not implemented.

**D8 — low — reason vocabulary is closed and correct so far.**
- `COUNT_REASONS` (≈84–100): `unsupported_counting_command` is used for both `parseScore` (`counting command is not a supported git line count`) and `runCount` (`Unsupported counting command`). Unknown reasons throw `could_not_evaluate` (exit 2). This is a good shape; keep it.

**D9 — scope question (not a routed item) — ROUND gate has the same selftest shape.**
- `scripts/check-round-contract.mjs` selftest (HEAD ≈891–893) matches `finding=` by substring across combined output. It does have an optional `detail` assertion (`detailOk`) that the USER gate lacks. Reuse that pattern. Whether to extend ROUND is for L1; it is not routed debt.

**D10 — medium — traceability references a lesson that does not exist yet (item 5).**
- `corpus/SOURCES.md:43` (working tree): S029 used-by now lists `corpus/lessons/round-15.md`. The file is absent (`corpus/lessons` has no round-15 lesson).
- `corpus/QUALITY.md:71,77` and SKILL:1780 also cite `corpus/lessons/round-15.md#mistakes`.
- `check-sources` requires used-by targets to exist and cite S029. `round-15.md` matches `LEGACY_LESSON` (`protectedPath`), so it must be first-added once with final bytes (see `.ufo/waves/round-14/w1/ReviewProtectedPaths.md` F7).
- Before commit: lesson exists, cites S029, and is added once.

**D11 — medium — inherited boundaries not restated in round15 (item 6).**
- SKILL "## Round 15" (≈1764–1786) does not say: USER is red 6/10 and `expect` stays 10; survivor replay, user-record freezing, IPv6 origin classification, Git environment/hook/config trust, and external-validator pin remain uncredited; the historical producer still inverts the summary.
- Add one boundary paragraph in the round-15 section.

**D12 — high (protocol) — no round15 closure certification path (item 7).**
- No `corpus/evidence/round-15/` file names a frozen step-1/step-4 closure-checker run. Round-13 and round-14 spotchecks both record this as open debt (`round-13-verifier-spotcheck.md:162`, `round-14-verifier-spotcheck.md:190-191`).
- Operator/L1 owned. This scribe cannot supply it, and the wave validation JSON is not it.

**D13 — integration risk — QUALITY20/21 are ahead of the code.**
- `corpus/QUALITY.md` (working tree) adds criteria 20 and 21. Criterion 20 requires mirror recomputation and `snapshot_tampered`. Criterion 21 requires reason assertions and a marker-applicability split. None is implemented yet (D1, D2, D6, D7).
- QUALITY is append-only. These criteria must land with their code and red controls, or be deferred. Committing them first makes the criteria false at commit.

---

## 3. Proposed tests (for TabiR15 members; not executed here)

Common rule: every ARIA tamper or mirror test runs in a `mkdtemp` tree that contains a **copy** of `scripts/check-aria-metadata.mjs`, `scripts/aria-loopback-round13.mjs`, and the canonical round-13/14 evidence paths. `ROOT` is derived from the script location (≈47–48), so canonical identities resolve in the copy. Never mutate the real files.

**ARIA (MetadataEnforce):**
- T1 `tamper-receipt-byte`: flip one byte in the copied `receipt.json`. Expect exit 2, `snapshot_tampered`, finding `R14-ARIA-ANCHOR-01`. Hash the real receipt before and after: unchanged.
- T2 `tamper-pin-byte`, T3 `tamper-worker-byte` (`worker_sha256:<name>`), T4 `tamper-manifest-byte`, T5 `tamper-producer-byte` / `spec` / `config`: each exit 2, `snapshot_tampered`.
- T6 control: unmodified copy → same result as the canonical tree (check exit 1 for the original contradiction; exit 0 with the sidecar).
- T7 semantic control: canonical bytes intact, sidecar mirror falsified → exit 1, not 2.
- M1–M9 mirror mutations on a copy of `corrected.json`, one field each, exit 1 with a new mirror finding: `cleanup.summaryServerOk=false`; `cleanup.derivedListeningAfter=true`; `cleanup.allClosed=false`; `qualification.everyProofListensBefore=false`; `qualification.everyProofClosed=false`; `qualification.everyProofRefusedAfterClose=false`; `corrections[0].derived=true`; `source.spec.sha256=zeros`; `source.manifest.sha256=zeros`. Plus one unmodified control → exit 0.
- S1 selftest tally: copy `expected-fixtures.json` with one case removed; selftest must exit 1.
- S2 selftest red control: flip one `expectedExit` in a copied expectation file; selftest must exit 1.
- D-byte identity: after every run, sha256 of `receipt.json`, `runtime-pin.json`, `corrected.json` equals the committed digests.

**USER (CounterDiagnostics):**
- U1 tee / shell / option-injection malicious cases (`count_malicious_*`): assert `exit 1`, `finding=score_mismatch`, `reason=unsupported_counting_command`, and `marker absent`, reported as applicable=1 absent=1.
- U2 `count_wrong_after_red` → `reason=after_count_mismatch`. The measured-against-zeros case → `reason=counting_revision_mismatch`.
- U3 wrong-reason red control: run the `count_wrong_after_red` fixture and assert `reason=unsupported_counting_command`. The comparator must reject it (selftest FAIL expected for this mutant, or the control must report that it did).
- U4 marker red control: plant the marker file before a tee case. The absence assertion must fail, proving the detector can see a leak.
- U5 `--diagnostic-witness`: define it (exit 0 with one diagnostic line) or remove the flag and its usage text.
- U6 N/A reporting: non-marker cases print `marker=not_applicable`, not `no_marker=0`.
- U7 production invariant: `--expect` default stays 10; the production run remains exit 1 `round_count` 6/10 (run by L1 only).

**Traceability (SourceS029 / SourceTraceability):**
- T-S1 `corpus/evidence/round-15/source-index.json` must keep `historicalReceipt.sha256 = b458b351…` (equal to `ANCHORS.receiptSha256`) and `sourceRows: ["S029"]`.
- T-S2 every new round15 machine artifact (mirror fixtures, diagnostic receipts) contains the token `S029`.
- T-S3 `corpus/lessons/round-15.md` exists, cites S029, and is added once with final bytes before any `check-sources` run.

---

## 4. Commands L1 should run after integration (not run here)

1. `node scripts/check-aria-metadata.mjs --self-test`
2. `node scripts/check-aria-metadata.mjs` (expect exit 1, original contradiction)
3. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0)
4. `node scripts/check-aria-metadata.mjs --witness` (expect exit 0, `original_unchanged=true`)
5. `node scripts/check-aria-metadata.mjs --derive corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json --out corpus/evidence/round-14/aria-metadata/<fresh>.json` — must be byte-identical to `corrected.json` (proves D5 frozen text).
6. `node scripts/check-user-round-contract.mjs --self-test`
7. `node scripts/check-user-round-contract.mjs` (expect exit 1, `round_count` 6/10, inherited)
8. `node scripts/check-round-contract.mjs --self-test` (regression; no change expected)
9. `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` and `node scripts/check-sources.mjs` (after `corpus/lessons/round-15.md` exists)
10. `git diff --stat -- corpus/evidence/round-13 corpus/evidence/round-14 SHONEN.md` must be empty (historical immutability).
11. Frozen step-1/step-4 closure-checker run naming round-15 inputs: operator/protocol (D12).

---

## 5. Out of scope / not done

- No source, evidence, registry, QUALITY, SKILL, LOG, SCORECARD, or lesson file edited.
- No gate, selftest, counter, browser, or pinned check run.
- No message to Main or orchestrator; no agent broadcast.
- No tool install or update.

## 6. Messages sent

Code-related findings were sent by exact id to `TabiR15.MetadataEnforce` (D1–D5, T1–T7, S1–S2) and `TabiR15.CounterDiagnostics` (D6–D8, U1–U6). Peer messages are short pointers; the detail is in this report.
