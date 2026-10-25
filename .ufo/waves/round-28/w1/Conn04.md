# Conn04 — Cross-Claim Coupling Between C1 Gate and C2 Matcher

- **Seat:** Conn04 / item 60 (connector, UFO-FSD fleet)
- **Lane Root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Baseline Commit:** `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`
- **Frozen Claims Path:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`
- **Prior Defect Evidence:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`
- **Report Path:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/w1/Conn04.md` (relative: `.ufo/waves/round-28/w1/Conn04.md`)

---

## 1. Frozen Claims and Baseline Ground Truth

Frozen claims read from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`:
- **Claim C1 (depth, line 11):**
  - Declared: "Repair the prior round's measurement-revision binding omission in scripts/check-s106-evidence.mjs: receipt must bind the measurement revision and the gate must verify the committed receipt at that revision. Preserve fetch-failure as could-not-evaluate. Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid."
  - Metric: `s106_gate_revision_binding_cases` via `node scripts/check-s106-evidence.mjs --selftest`.
  - Baseline: 5 cases at `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`.
- **Claim C2 (calibration, line 12):**
  - Declared: "Repair scripts/check-selfassessment.mjs m1 supersession so a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph. Target: self-assessment mismatch count at tip is nonzero for the known LOG.md:221 false-clear and matching selftest includes a red unrelated-citation case and positive exact-citation control."
  - Metric: `selfassessment_mismatches_and_cases` via `node scripts/check-selfassessment.mjs --rev <REV> --json`.
  - Baseline: `LOG.md:221` is falsely cleared (`superseded=true`), reported in `round-27-verifier-spotcheck.md:15`.

### Baseline Verification Commands Run:
1. `node scripts/check-s106-evidence.mjs --selftest`
   - **Observed:** `cases=5 passed=5`, exit 0. No revision-binding cases exist.
2. `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
   - **Observed:** `valid=true`, exit 0. No revision identity is checked in receipt `corpus/evidence/round-26/sources/s106.json`.
3. `node scripts/check-selfassessment.mjs --selftest`
   - **Observed:** `cases=17 passed=17`, exit 0.
4. `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
   - **Observed:** Finding for `LOG.md:221` has `claimed=8, observed=12, superseded=true` (false-clear confirmed).
   - **Observed:** `mismatches=1` from `m3-unlanded-paths` (27 untracked files in `.ufo/waves/round-28/`), while the true tally defect at `LOG.md:221` is masked.

---

## 2. Cross-Claim Coupling Between C1 Gate and C2 Matcher

Investigation of `scripts/check-s106-evidence.mjs` and `scripts/check-selfassessment.mjs` reveals four distinct cross-claim coupling surfaces across runtime, contract, data, and substrate:

### A. Dynamic Runtime Subprocess Coupling (`check-selfassessment.mjs` executes `check-s106-evidence.mjs`)
- In `scripts/check-selfassessment.mjs:79`:
  `const RUNNABLE_GATE = /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/;`
  `scripts/check-s106-evidence.mjs` matches `RUNNABLE_GATE`.
- In `scripts/check-selfassessment.mjs:144-182` (`gateTally`):
  When `m1Findings` (evaluating `SCORECARD.md`) or `m1LogFindings` (evaluating `LOG.md`) encounters a mention of `scripts/check-s106-evidence.mjs` with a tally claim, it spawns `node scripts/check-s106-evidence.mjs --selftest` as the ground-truth oracle.
- **Direct dependency:** C1 modifies the output of `node scripts/check-s106-evidence.mjs --selftest` from 5 to ≥7. The oracle value ingested by C2's `m1` matcher is dynamically determined by C1's gate binary.

### B. Shared Evidence Data Contract Coupling (`corpus/evidence/round-26/sources/s106.json`)
- In `scripts/check-selfassessment.mjs:336-375` (`m2Findings`):
  `check-selfassessment.mjs` recursively reads every `.json` file under `corpus/evidence/`.
- `corpus/evidence/round-26/sources/s106.json` is both C1's primary target receipt AND an evidence file scanned by C2's `m2` checker.
- In `s106.json:20-24`, the receipt carries:
  `"verification": { "command": "base64 -d s106-encoded.bin ...", "exit": 0 }`.
  Because this command is not a git inspection command, `check-selfassessment.mjs:358` marks it `could-not-evaluate: command outside the closed re-run grammar`.
- **Hazard:** If C1's revision binding modifies `s106.json`'s verification block to include a git inspection command (`git show ...` or `git cat-file -e ...`), C2's `m2` scanner will actively execute that command against the repository. If the revision or path fails, C2 will record an `m2-receipt-exit` mismatch, failing C2 calibration.

### C. Working-Copy Integrity Coupling (`gateTally` Disk vs Blob Check)
- In `scripts/check-selfassessment.mjs:154-156`:
  `else if (!existsSync(diskPath) || sha256(readFileSync(diskPath, "utf8")) !== sha256(blob))`
  `result = { status: "could-not-evaluate", why: "script at rev is not the runnable working copy" };`
- If `check-selfassessment.mjs` is evaluated at `--rev <REV>` where `<REV>` is a commit prior to C1's landing (e.g., baseline `eb23c0b8`), but `scripts/check-s106-evidence.mjs` on disk has been updated to the C1 version, `gateTally` refuses to run the gate and marks any mention as could-not-evaluate.
- **Integration constraint:** C1 and C2 cannot be evaluated independently across revisions without accounting for the disk/blob identity constraint in `gateTally`.

### D. Structural Isomorphism: The Ambient Matching Defect Class
Both claims address the exact same underlying software defect: **Ambient Token Association without Exact Entity Binding**:
- **In C1:** The gate verified byte hashes and anchor text across whichever revision was passed to the CLI, but the receipt contained no declared revision. Evidence was ambient across git history.
- **In C2:** The supersession matcher cleared stale tallies if a later paragraph had *any* colon-digit token (`/\:\d+/` in line 325), e.g. a timestamp (`10:15`) or an unrelated citation (`:335`). Corrections were ambient across document lines.

---

## 3. Explicit Contradictions in Round Proposals

1. **Circularity vs Tip Invalidation in C1 Revision Binding:**
   - Proposal A (Strict equality `revDeclared === rev`): Impossible to construct because a commit hash depends on the tree containing the receipt; furthermore, evaluating at future tips would immediately fail `revDeclared === rev`, violating C1's kill rule ("runtime gate at its committed target receipt remains valid").
   - Proposal B (Ancestor-only `isAncestor(revDeclared, rev)`): Allows future tips to pass, but a naive ancestor check alone cannot fail the required red control if any valid ancestor is cited.
   - **Resolution:** As identified by `Crit02`, the gate must verify cross-revision integrity: verify that the committed receipt and bytes at `revDeclared` resolve and hash correctly, AND verify that `revDeclared` is an ancestor-or-equal to `rev`.

2. **Environmental Masking of C2 Baseline Target:**
   - In baseline `check-selfassessment.mjs`, running `--rev HEAD --json` reports `mismatches=1`.
   - A superficial check might infer C2 already passes its "nonzero mismatch" target.
   - **Contradiction:** That single mismatch is `m3-unlanded-paths` from untracked `.ufo` wave artifacts. `LOG.md:221` is actively false-cleared (`superseded=true`). Once C2 is fixed, `m1-selftest-tally` for `LOG.md:221` will become an explicit mismatch (`superseded=false`), yielding a genuine semantic mismatch.

---

## 4. Proposed Move: Coordinated Provenance-Binding Synthesis

**One bounded move across C1 and C2:**

1. **In C1 (`scripts/check-s106-evidence.mjs`):**
   - Add required field `"measurement_revision": "0c666adc217685e1ece2af8596b732b303a3b15c"` to `corpus/evidence/round-26/sources/s106.json` (the commit where decoded S106 evidence landed).
   - In `evaluate()`: resolve `revDeclared = resolveRev(repo, receipt.measurement_revision)`.
   - Validate that `revDeclared` is an ancestor of or equal to `rev` (`git merge-base --is-ancestor <revDeclared> <rev>`).
   - Validate cross-revision blob identity: read `receiptBlobAtDeclared = readBlob(repo, revDeclared, RECEIPT_PATH)` and `bytesBlobAtDeclared = readBlob(repo, revDeclared, receipt.bytes_path)`. If absent, throw `Refusal` (CNE, exit 2). If their hashes disagree with evaluated revision, reject as invalid (exit 1).
   - Add two selftest cases (total 7 ≥ 7):
     - `revision-match-valid`: receipt declaring parent commit passes (exit 0, valid).
     - `revision-mismatch-invalid`: receipt declaring an unmerged side-branch commit fails (exit 1, invalid).
   - Preserve missing-receipt/bytes CNE (exit 2).

2. **In C2 (`scripts/check-selfassessment.mjs`):**
   - In `m1LogFindings` (line 325), replace loose `/\:\d+/` with exact line citation check:
     `new RegExp("(?:^|[^0-9]):" + f.line + "(?:[^0-9]|$)").test(text)`.
   - Align `m1Findings` in `SCORECARD.md` (line 239) with the same exact-line constraint (`new RegExp("(?:^|[^0-9]):" + f.line + "(?:[^0-9]|$)").test(g.lineText || "")`).
   - Add two selftest cases (total 19 ≥ 18):
     - `m1-log-unrelated-citation`: later paragraph citing `:999` fails to supersede stale `:6` (retains mismatch, exit 1).
     - `m1-log-exact-citation`: later paragraph citing `:6` supersedes stale `:6` (clean, exit 0).

3. **Cross-Claim Boundary Invariant:**
   - In `s106.json`, ensure `verification.command` does NOT use a `git show` / `git cat-file` string unless verified to match `verification.exit`, preventing unintended `m2` failure in C2.
   - Any Round 28 documentation in `LOG.md` or `SCORECARD.md` that mentions `check-s106-evidence.mjs` case count (≥7) must not contradict the oracle.

---

## 5. Affected Axes

- **Depth (improved):** C1 satisfies receipt measurement-revision binding with 7 selftest cases and valid runtime target receipt.
- **Calibration (improved):** C2 eliminates false-clear of `LOG.md:221`, enforces exact-line citation supersession in LOG and SCORECARD, and validates with red/green selftest controls.
- **Operability (preserved):** Both gates preserve exit 2 CNE semantics for missing revisions, missing blobs, and unreadable objects; temporary fixture repositories remain strictly isolated.
- **Freshness, Coverage, Adjacency (unharmed):** Zero tracked modifications to external sources or untouched gate sets.

---

## 6. Risks and Mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| Receipt revision circularity | Strict commit hash equality cannot match the commit containing the receipt. | Use ancestor-or-equal binding to the landing commit `0c666ad` with cross-revision blob hashing. |
| Atomicity gap between code and receipt | Updating `check-s106-evidence.mjs` without updating `s106.json` causes gate to fail CNE (exit 2) at baseline. | Ship `measurement_revision` in `s106.json` in the same commit as gate update. |
| Inadvertent m2 execution in C2 | Adding git commands to `s106.json` triggers active execution by C2's `m2Findings`. | Keep `s106.json` verification command outside `SAFE_GIT` closed grammar or pin exact expected exit. |
| Environmental m3 false positive | Untracked wave artifacts in working tree produce `m3-unlanded-paths` mismatch. | Assess C2 calibration via JSON inspection of `f.class === "m1-selftest-tally" && f.line === 221`, not bare scalar `mismatches`. |

---

## 7. Verification Steps for Main Agent

1. **C1 Gate Verification:**
   ```sh
   node scripts/check-s106-evidence.mjs --selftest --json
   # Assert: cases >= 7, passed == cases, ok == true, exit 0
   node scripts/check-s106-evidence.mjs --rev HEAD --json
   # Assert: valid == true, revision_match == true, exit 0
   ```
2. **C2 Matcher Verification:**
   ```sh
   node scripts/check-selfassessment.mjs --selftest --json
   # Assert: cases >= 18, passed == cases, ok == true, exit 0
   node scripts/check-selfassessment.mjs --rev HEAD --json
   # Assert: findings contains LOG.md:221 with superseded == false, claimed == 8, observed == 12
   ```
3. **Cross-Gate Invariant Check:**
   ```sh
   node scripts/check-selfassessment.mjs --rev HEAD --json | jq '.findings[] | select(.doc | contains("s106.json"))'
   # Assert: m2-receipt-exit reports couldNotEvaluate or exit match, never counted mismatch
   ```

Report: `.ufo/waves/round-28/w1/Conn04.md`
