# Conn02 — Cross-Claim Coupling Between C1 Gate and C2 Matcher

Seat: Conn02 / item 58 (UFO-FSD connector, wave tabi-r28-w1).
Date: 2026-10-25.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only git, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`).
Frozen claims: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (schema `tabi-round-claims-v1`).
Prior defect evidence: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.
Report path: `.ufo/waves/round-28/w1/Conn02.md` (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`).

---

## 1. Declared Axes

The round claims declare two active axes:
- **depth** (worked by C1: routed S106 evidence gate measurement-revision binding, selftest 5 → ≥7 cases).
- **calibration** (worked by C2: `check-selfassessment.mjs` m1 citation association repair, ensuring `LOG.md:221` false-clear remains a mismatch).
Adjacent lane axes evaluated: **operability**, **freshness**, **coverage**, **adjacency**.

---

## 2. Evidence and Baseline Observations

All commands executed from `/home/vgpnk/Projects/shokunin/tabi-shokunin` against committed bytes at baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`:

1. **[OBSERVATION] Baseline identity:**
   - Command: `git rev-parse HEAD` returned `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`.
   - Command: `git status --porcelain` returned only `?? .ufo/waves/round-28/` (no tracked file modifications).
2. **[OBSERVATION] C1 Baseline Gate & Selftest:**
   - Command: `node scripts/check-s106-evidence.mjs --selftest` exited 0, printing:
     `S106_SELFTEST verdict=clean cases=5 passed=5`
   - Command: `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` exited 0, returning `valid=true`, `decoded_bytes=73952`, `sha_match=true`.
   - Negative sweep: `git grep -E 'measured_at_rev|revision' corpus/evidence/round-26/sources/s106.json` returned exit 1 (0 matches). The committed target receipt has no revision binding field.
3. **[OBSERVATION] C2 Baseline Matcher & False-Clear:**
   - Command: `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` exited 1 (`mismatches=1` from untracked working-tree `m3-unlanded-paths`), with:
     `finding: doc="LOG.md", line=221, script="scripts/check-freshness.mjs", claimed=8, observed=12, superseded=true`
   - Quote (`corpus/lessons/round-27-verifier-spotcheck.md:15`): "nevertheless its own finding at `LOG.md:221` says claimed 8, observed 12, `superseded=true`... Claim failed; calibration harmed".
   - Code inspection (`scripts/check-selfassessment.mjs:319-327`): supersession requires `namesScript && /supersed|correct/i.test(text) && /:\d+/.test(text) && statedTallyNumbers(text).includes(f.observed)`.
   - Negative sweep: in `LOG.md`, paragraph 265 (`T05:16:28Z`, lines 265-284) triggers supersession via the timestamp colon `:16` without citing line 221.
4. **[OBSERVATION] Historical S106 Tally in LOG.md:**
   - In `LOG.md:1940-1948`, section `### C2 correction — missing receipt follows the frozen could-not-evaluate rule` names `scripts/check-s106-evidence.mjs` (line 1942) and states:
     `asserts exit 2, and the registered selftest count is 5/5. This is an` (line 1946).

---

## 3. Cross-Claim Coupling Analysis

Four distinct coupling vectors link the C1 depth gate (`scripts/check-s106-evidence.mjs`) and C2 calibration matcher (`scripts/check-selfassessment.mjs`):

### Vector 1: Dynamic Oracle Invocation Coupling (Runtime & Substrate)
`scripts/check-selfassessment.mjs` dynamically invokes gate self-tests via `gateTally(repo, rev, script, cache)` (lines 144-182):
- Any script matching `RUNNABLE_GATE = /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/` is executable.
- `scripts/check-s106-evidence.mjs` directly matches this regex.
- When `check-selfassessment.mjs` processes any `SCORECARD.md` or `LOG.md` section naming `scripts/check-s106-evidence.mjs`, it executes `node scripts/check-s106-evidence.mjs --selftest` in a sandbox to obtain `oracle.tally`.
- **Direct dependency:** C1's increase of selftest cases from 5 to ≥7 dynamically mutates the oracle observation inside C2 from 5 to ≥7.

### Vector 2: Working-Tree Hash Invariance Refusal (Runtime Verification Hazard)
In `check-selfassessment.mjs:154-155`:
```javascript
else if (!existsSync(diskPath) || sha256(readFileSync(diskPath, "utf8")) !== sha256(blob)) {
  result = { status: "could-not-evaluate", why: "script at rev is not the runnable working copy" };
}
```
If an engineer modifies `scripts/check-s106-evidence.mjs` in the working copy to implement C1, and runs `node scripts/check-selfassessment.mjs --rev <past_rev>` (e.g. baseline `eb23c0b`), the working copy hash diverges from the committed blob.
- **Consequence:** `check-selfassessment.mjs` immediately refuses evaluation of `check-s106-evidence.mjs` with `could-not-evaluate`. Any verification run that mixes dirty working copies with historical `--rev` checks trips this guard.

### Vector 3: Receipt Traversal Coupling via m2Findings (Evidence Surface)
`scripts/check-selfassessment.mjs:336-375` (`m2Findings`) inspects all `*.json` blobs under `corpus/evidence/`.
- Target receipt `corpus/evidence/round-26/sources/s106.json` resides directly within this inspected set.
- `m2Findings` recursively checks all `{ command, exit }` nodes against `SAFE_GIT = /^git (?:-C \S+ )?(cat-file -e|show) ...$/`.
- Currently, `s106.json:20-24` contains a compound bash command (`base64 -d ... && sha256sum ...`), which reports `couldNotEvaluate: "command outside the closed re-run grammar"`.
- If C1 modifies `s106.json` to embed verification commands, any command not matching `SAFE_GIT` or failing execution will directly create `m2-receipt-exit` mismatches in C2.

### Vector 4: Latent Tally Staleness under C2 Exact-Line Supersession (Contract & Verification)
Under C2's fixed exact-line matcher:
- A stale tally is ONLY superseded if a later paragraph contains an explicit citation to that exact line number (`:LINE`).
- In `LOG.md:1946`, `check-s106-evidence.mjs` is associated with `5/5`.
- In `SKILL.md:2514` and capability documentation, `check-s106-evidence.mjs` is recorded with `cases=5`.
- When C1 bumps the oracle count to ≥7, any documented 5-case tally in `SCORECARD.md` or `LOG.md` matching `TALLY_PATTERNS` becomes an un-superseded `m1-selftest-tally` mismatch unless the round-28 entry explicitly includes an exact line citation to it.

---

## 4. The Proposed Non-Obvious Move: Compatible Synthesis

### The Core Tension / Contradiction
- In C1: strict revision equality (`bound_rev === evaluated_rev`) creates a circular impossibility (a commit cannot embed its own SHA-1 in a tracked blob before commit creation) and breaks all future tip evaluations. Conversely, weak ancestor checks (`isAncestor(bound, evaluated)`) permit stale or corrupted blobs on master to pass vacuously.
- In C2: replacing `/:\d+/` with an exact-line test fixes `LOG.md:221`, but exposes latent fragility across dual m1 windows (`m1Findings` in SCORECARD vs `m1LogFindings` in LOG.md).

### Proposed Move: Cross-Revision Integrity Binding with Unified Citation Extractor
Synthesize C1 and C2 through a single coherent contract:
1. **C1 (Depth) — Cross-Revision Blob Anchoring:**
   In `scripts/check-s106-evidence.mjs`:
   - Receipt schema requires `measured_at_rev` (40-hex string), bound to the immutable evidence landing commit `0c666adc217685e1ece2af8596b732b303a3b15c`.
   - Gate resolves `measured_at_rev` and verifies:
     (a) `isAncestor(repo, measured_at_rev, rev)` (the measurement is in the history of the evaluated revision);
     (b) `readBlob(repo, measured_at_rev, receipt.bytes_path)` exists and hashes to `decoded_sha256` and matches `decoded_bytes`;
     (c) `readBlob(repo, rev, receipt.bytes_path)` matches the evaluated commit.
   - Preserves exit 2 (`Refusal`) for absent receipt or bytes at either revision.
   - Selftest adds 2 cases: red mismatch (declared rev bytes disagree / side-branch rev) and green match (declared rev bytes valid) → total 7 cases.
2. **C2 (Calibration) — Exact Citation Extractor with Timestamp Guard:**
   In `scripts/check-selfassessment.mjs`:
   - Replace `/:\d+/` in `m1LogFindings` (and `m1Findings`) with an explicit citation parser:
     `const citedLines = new Set([...text.matchAll(/(?:\b(?:LOG\.md|SCORECARD\.md|line|at|supersedes)\s*|(?<=^|[^\w:])):(\d+)\b/gi)].map(m => Number(m[1])))`
   - Assert `citedLines.has(f.line)`.
   - Negative lookbehind/context guards against ISO timestamps (`T05:16:28Z` colons never parse as line citations).
   - Selftest adds 1 red case (`m1-log-unrelated-citation` citing a different line) and preserves existing positive exact-citation and wrong-number cases → total 18 cases.
3. **Closeout Handoff Requirement (Parity Protection):**
   In round-28 `LOG.md` append, explicitly include:
   - Positive exact citation to `LOG.md:221` (resolving the known false-clear).
   - If `scripts/check-s106-evidence.mjs` 5-case tally is restated, explicitly cite `LOG.md:1946` to prevent latent mismatch under the tightened matcher.

---

## 5. Affected Axes

- **depth:** Improved. S106 evidence admission becomes cryptographically and revision-bound to commit `0c666ad`, eliminating the unprovable flaw from round 27.
- **calibration:** Improved. Eliminates false-clears from timestamp colons and unrelated line citations without breaking legitimate supersessions.
- **operability:** Maintained (harm avoided). Avoids circular commit-hash deadlocks and prevents future tips from failing valid historical receipts.
- **coverage / adjacency / freshness:** Untouched and unharmed.

---

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Working copy hash mismatch during baseline re-check | `check-selfassessment.mjs` returns `could-not-evaluate` for `check-s106-evidence.mjs` | Test baseline against a clean worktree or commit before running `--rev eb23c0b` checks. |
| Atomicity slip in C1 landing | Target receipt lacks `measured_at_rev` when gate code lands | Land `s106.json` schema update and gate logic in the same commit. |
| Timestamp collision in citations | Non-citation colons (`12:30:00`) accidentally clear findings | Citation regex requires `LOG.md:`, `line `, or leading whitespace/delimiter, not bare mid-token colons. |

---

## 7. Verification

1. **C1 Verification:**
   - `node scripts/check-s106-evidence.mjs --selftest --json` → `cases >= 7`, `passed == cases`, exit 0.
   - `node scripts/check-s106-evidence.mjs --rev <tip> --json` → `valid == true`, `sha_match == true`, exit 0.
2. **C2 Verification:**
   - `node scripts/check-selfassessment.mjs --selftest --json` → `cases >= 18`, `passed == cases`, exit 0.
   - `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → `LOG.md:221` reported with `superseded == false`, `mismatches >= 1`.
3. **Cross-Claim Verification:**
   - In scratch repo, run `check-selfassessment.mjs` with C1's 7-case gate committed; confirm `gateTally` returns `status: "measured", tally: 7`.

---

## Trailer

Report: `tabi-shokunin/.ufo/waves/round-28/w1/Conn02.md`
Tooling: No tools installed or updated. PACMAN untouched.
Lane bounds: Leaf member, read-only git, zero tracked modifications.
