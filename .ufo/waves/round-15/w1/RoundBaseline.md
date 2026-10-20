# RoundBaseline — Round-15 UFO-FSD Scout Audit Report

- **Seat**: `TabiR15.RoundBaseline` (Leaf UFO-FSD scout subagent)
- **Wave**: `tabi-round-15-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Scope**: Read-only bounded audit of baseline commit `7054a5e1068538349b4dbb0d291c2fe8643802f2`, verifier ownership, clean inheritance, and routed defect grounding for Round 15.
- **Report Path**: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/w1/RoundBaseline.md`

---

## 1. Naming the Axes (Godspeed Posture)

Under the Godspeed posture and `AXES.md` charter, the six ordinal axes and three learning trends are evaluated for Round 15:

| Axis | Baseline Scalar | Target Scalar | Impact of Round-15 Moves | Role in Round 15 |
|---|---|---|---|---|
| **Operability** | 8 | 8 | **Improved (C1)** | Directly worked by C1: provides truthful USER counter refusal diagnostics with explicit applicability/reason fields and isolated CLI expected-reason assertions (0→1 verified diagnostic contract). Satisfies lowest-axis obligation (tie at 8). |
| **Calibration** | 9 | 9 | **Improved (C2)** | Directly worked by C2: historical ARIA metadata gate checks all emitted cleanup and qualification mirrors against recomputed context, and classifies authenticated snapshot tampering as `could-not-evaluate` (`exit 2`, 0→1 verified enforced contract). |
| **Depth** | 8 | 8 | **Unchanged / Protected** | Exact line-counting grammar and AST/argv separation preserved; metadata mirror algebra formalizes complete worker set predicates without semantic inflation. |
| **Coverage** | 9 | 9 | **Unchanged / Protected** | Preserves all historical pstack rounds (r01–r10) and user rounds (r01–r06); 32 knowledge notes and 32 mapped rows intact. No spurious coverage expansion. |
| **Freshness** | 8 | 8 | **Unchanged / Protected** | Historical runtime pins, dates, and committed receipts remain byte-identical; worktree freshness maintained. |
| **Adjacency** | 8 | 8 | **Unchanged / Protected** | Strict domain perimeter: no external network interaction, no sibling workspace writes, no generic test framework ownership. |
| *Expansion (trend)* | — | — | **Protected** | Zero new knowledge notes or frontier acquisition claimed; metadata correction remains analytical, not empirical. |
| *Quality (trend)* | — | — | **Improved** | Addresses non-author routed defects 1–4 from `corpus/lessons/round-14-verifier-spotcheck.md` into durable gate contracts. |
| *Discernment (trend)* | — | — | **Improved** | Reconciles `snapshot_tampered` with Gate standard (`exit 2`); maintains honest failed USER production count (`round_count 6/10`). |

---

## 2. Baseline Commit & Verifier Ownership Audit

### 2.1 Commit Identity and Authorship
- **Baseline Commit**: `7054a5e1068538349b4dbb0d291c2fe8643802f2`
- **Author & Committer**: `protocol-shokunin <protocol@shokunin.local>`
- **Date**: `Tue Oct 20 04:37:18 2026 -0300`
- **Commit Subject**: `round-14 verifier spot-check (integrator, hyaku): non-author admit/reject`
- **Delivered Commit (Parent)**: `5c7710d7393112f2163dd7efcaa38fccf534dfc2` (`round-14: bind final production verdicts to committed lesson inputs`, authored by `tabi-shokunin <tabi@shokunin.local>`)
- **Single-File Tree Diff**:
  ```
  corpus/lessons/round-14-verifier-spotcheck.md | 192 ++++++++++++++++++++++++++
  1 file changed, 192 insertions(+)
  ```
  Zero author files were modified or deleted by the verifier commit.

### 2.2 Verifier Authority and Decision
- **Verifier Identity**: `author: hyaku closure (non-author integrator, @m_strong)` (`corpus/lessons/round-14-verifier-spotcheck.md:1`)
- **Orchestration Dispatch**: `2026-10-20T03:42:36-03:00 launch tabi round=14 pgid=2153599 driver=hyaku-inline attempt=1`
- **Decision Statement**: `CLOSURE tabi r14 status=ok admitted=true`
- **Admitted Claims**:
  1. **C1 Operability**: Two non-shell runCount paths (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`), with real supported, refusal, and differential controls.
  2. **C2 Calibration**: Digest-bound qualified historical correction (`corpus/evidence/round-14/aria-metadata/corrected.json`) and source row `S029`, with zero new browser executions.
- **Explicitly Rejected Unauthorized Claims**:
  1. *Treating sidecar as new browser run, new coverage, or accessibility audit*: Rejected. Static derivation from committed worker bytes is analytical evidence only; Playwright docs confirm role locators do not substitute for accessibility audits.
  2. *Treating recorded 24.21.0 as enforced exact Node equality*: Rejected. Observed Node is `26.12.0`, while historical producer never reads or enforces `pin.node`.
  3. *Treating arbitrary SCORECARD command as executable count authority*: Rejected. Counters validate a strictly scoped grammar over Git argv; executing arbitrary shell is forbidden.

---

## 3. Clean Inheritance & Substrate State

### 3.1 Working Tree and Repository Health
- **Git Working Tree Status**: Clean. `git status --porcelain` shows no uncommitted tracked modifications (only untracked `.ufo/waves/round-15/` wave scaffolding).
- **Branch Tracking**: `master` is up to date with `origin/master` (`ahead 0`, `behind 0`).
- **Ancestry Verification**: `git merge-base --is-ancestor 5c7710d 7054a5e` returns 0. `7054a5e` directly inherits `5c7710d`.

### 3.2 Closed-Prefix History Pin & Sources Census
- **History Pin**: `.ufo/history-pin.json` matches `MANIFEST.json` prefix hash:
  `sha256(json.dumps(rounds[:48], sort_keys=True, separators=(',',':')).encode())` equals `ce97497ed699a8f0939be062d042cf4d6e3e7531116fbe4681593991d67f0a8e`.
- **Sources Census**: Confirmed clean by `before.json`:
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exits 0 with `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
- **Sources Registry**: 29 rows (S001–S029; tiers A23 / B4 / C2; statuses mined24 / queued3 / rejected2). S029 own-work quote `"listeningAfter": false` is 2 words (within the ≤25-word contract).
- **Knowledge Base**: 32 notes in `corpus/knowledge/`, 32 mapped in `corpus/README.md`, 0 missing.
- **Production Contracts**: ROUND is clean 10/10; USER is honest failed `round_count 6/10`. Zero fabricated green states.

---

## 4. Bounded Grounding for Round 15: The Seven Routed Defects

`round-14-verifier-spotcheck.md:182-191` durable routing directly sets the technical scope for Round 15 seats:

| Routed Defect | Scope & Root Cause | Primary Anchors | Assigned Seat in Wave 1 |
|---|---|---|---|
| **1. Metadata Enforcement Wording** | Retrospective checker enforces `minimumMajor: 20`, while historical producer never read `pin.node`. Sidecar note and SKILL must distinguish checker-enforced minimum from historical producer. | `SKILL.md:1744`, `scripts/check-aria-metadata.mjs:1259-1262` | `NodeEnforcement`, `SkillCorrection`, `MetadataEnforce` |
| **2. Checker/Mirror & Selftest Precision** | `check-aria-metadata.mjs:908-1084` validates core bindings/correction, but omits validating `cleanup.*` mirrors and `qualification.everyProof*` fields emitted by `buildSidecar` (`:1264-1281`). Tally is 15 CLI cases + 1 deterministic helper = 16 total. | `scripts/check-aria-metadata.mjs:908-1084, 1264-1281` | `MirrorServer`, `MirrorContexts`, `MirrorQualification`, `MetadataEnforce` |
| **3. Tamper Classification** | Anchor and source digest mismatches currently produce `exit 1` failed findings, rather than `snapshot_tampered` with `exit 2` (`could-not-evaluate`). Reconcile with Gate standard. | `scripts/check-aria-metadata.mjs:1111-1145` (`runCheck`) | `TamperReceipt`, `TamperPin`, `TamperManifest`, `MetadataEnforce` |
| **4. Counter Receipt Diagnostic Precision** | USER malicious fixtures assert broad `score_mismatch` but not specific refusal reason; `no_marker=0` conflates marker leak with N/A. Explicit reason and applicability required. | `scripts/check-user-round-contract.mjs:864-873, 992` | `CountReasonGrammar`, `CountMarkerNA`, `CountWrongFailure`, `CounterDiagnostics` |
| **5. Source/Evidence Traceability** | Machine evidence must directly reference `S029` in an evidence index rather than mutating pinned historical sidecars. Author-side attack reports must not claim review of undelivered bytes. | `corpus/evidence/round-15/`, `corpus/SOURCES.md:43` | `SourceS029`, `SourceTraceability`, `HistoricalSourceIndex` |
| **6. Honest Inherited Boundaries** | Preserve USER `round_count 6/10` failed production; do not credit r07 survivor replay, user-record freezing, or IPv6 without evidence. Keep historical producer summary inversion qualified. | `scripts/check-user-round-contract.mjs:29-33, 1030` | `PriorDebt`, `HistoricalImmutable`, `CountHistory` |
| **7. Frozen Closure Certification Debt** | Retained protocol/operator debt: missing frozen closure step1/step4 certification remains documented debt, outside lane authoring scope. | `corpus/lessons/round-14-verifier-spotcheck.md:191` | `ClosureBoundary` |

---

## 5. Concrete Source Anchors & Proposed Tests for Peer Executors

### 5.1 Anchors & Recommendations for `TabiR15.MetadataEnforce`
- **File**: `scripts/check-aria-metadata.mjs`
- **Defects & Concrete Code Anchors**:
  1. **Mirror Enforcement Gap (`check-aria-metadata.mjs:908-1084`)**:
     `buildSidecar` emits `sidecar.cleanup` (`perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`) and `sidecar.qualification` (`everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`, `everyProofNotListeningAfter`) at lines 1264–1281. However, `evaluateSidecar` never checks these fields against independently recomputed values.
     - *Proposed Check*: Add explicit verification of `sidecar.cleanup` and `sidecar.qualification` mirrors against `cleanupDerived` and `proofs`.
  2. **Tamper Exit Code & Finding (`check-aria-metadata.mjs:1111-1145`)**:
     In `runCheck`, `exit: ok ? 0 : 1` is hardcoded. When `bindingProblems` contains `receipt_sha256`, `pin_sha256`, `producerSourceSha256`, or unreadable files, the verdict must be `could-not-evaluate` (`exit 2`), and the finding must be `snapshot_tampered`.
  3. **Sidecar Note Precision (`check-aria-metadata.mjs:1259-1262`)**:
     Update `node.note` in `buildSidecar` to state: *"retrospective metadata checker evaluates minimumMajor=20; historical producer never enforced pin.node"*.
- **Proposed Tests**:
  - `mirror_tamper_rejected`: CLI test with sidecar where `cleanup.allClosed: false` while proofs say true -> expects `exit: 1`, `finding: mirror_mismatch`.
  - `snapshot_tamper_exit2`: CLI test with mutated receipt digest in `original.receipt.sha256` -> expects `exit: 2`, `finding: snapshot_tampered`.

### 5.2 Anchors & Recommendations for `TabiR15.CounterDiagnostics`
- **File**: `scripts/check-user-round-contract.mjs`
- **Defects & Concrete Code Anchors**:
  1. **Undifferentiated Malicious Assertions (`check-user-round-contract.mjs:864-873`)**:
     `count_malicious_tee_refused`, `count_malicious_shell_refused`, and `count_malicious_option_injection_refused` all assert only `finding: 'score_mismatch'`. They do not assert the exact parse rejection detail (e.g. `unsupported_stage`, `shell_refused`, `option_injection`).
  2. **Ambiguous `no_marker` Output (`check-user-round-contract.mjs:992`)**:
     `no_marker=${test.noMarker ? (leaked ? 0 : 1) : 0}` prints `no_marker=0` when marker leaks AND when no marker was checked.
     - *Proposed Schema*: Replace with `marker_checked=${test.noMarker ? 1 : 0} marker_leaked=${leaked ? 1 : 0}` or `marker_status=${test.noMarker ? (leaked ? 'LEAKED' : 'CLEAN') : 'NA'}`.
  3. **Falsifiable Negative Reason Control**:
     Add a test case where expected refusal reason does not match actual refusal reason -> confirms the test harness catches false-positive reason passes.
- **Proposed Tests**:
  - Assert `expected_reason` on all 3 malicious fixtures.
  - Negative control: malicious command rejected for `unsupported_stage`, but fixture expects `option_injection` -> must fail self-test.

---

## 6. Verification Commands for L1 (Post-Integration)

L1 should execute the following read-only commands to verify clean baseline inheritance and Round 15 contract readiness:

```bash
# 1. Verify working tree cleanliness and baseline commit
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
# Expected HEAD: 7054a5e1068538349b4dbb0d291c2fe8643802f2

# 2. Verify single verifier commit on top of 5c7710d
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat 5c7710d7393112f2163dd7efcaa38fccf534dfc2 7054a5e1068538349b4dbb0d291c2fe8643802f2

# 3. Verify sources census clean
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi

# 4. Verify historical evidence immutability
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --exit-code 7054a5e -- \
  corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/runtime-pin.json \
  corpus/evidence/round-14/aria-metadata/corrected.json \
  corpus/lessons/round-14-verifier-spotcheck.md
```

---

## 7. Compliance and Handoff

- **Edits**: Written exclusively to `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/w1/RoundBaseline.md`.
- **Source Integrity**: Zero edits to source code, gates, historical lessons, evidence, `SCORECARD.md`, `SHONEN.md`, or external repositories.
- **Execution Safeguard**: Zero gates, tests, selftests, counters, or browsers executed during this audit.
- **Peer Coordination**: Peer messages sent directly to `TabiR15`, `TabiR15.MetadataEnforce`, and `TabiR15.CounterDiagnostics` via exact IDs.
- **Tooling Record**: Zero tools installed or updated.
