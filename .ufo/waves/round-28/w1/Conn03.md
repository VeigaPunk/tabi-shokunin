# Conn03 — UFO-FSD connector: sibling overlap scan and synthesis (round 28, wave 1)

Seat: Conn03 (item 59). Role: UFO-FSD connector.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`.
Frozen claims read: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (lines 11–12; C1 depth, C2 calibration).
Report path: `.ufo/waves/round-28/w1/Conn03.md` (relative to lane root).
Contract: read-only against lane tracked files; no tools installed; leaf seat (no subagent dispatch).

---

## 1. Declared axes

At round 28 start (`claims.json:8-9`):
- `depth`: 8 (lowest non-retired axis; worked by C1)
- `calibration`: 9 (worked by C2)
- `operability`: 8
- `freshness`: 8
- `adjacency`: 8
- `coverage`: 9

Lowest non-retired axis: tie at 8 (depth, operability, freshness, adjacency). C1 addresses `depth`; C2 addresses `calibration`.

---

## 2. Evidence from sibling overlap scan

Inspection of wave w1 sibling artifacts (`Crit02.md`, `Crit04.md`, `Crit06.md`, `Crit08.md`, `Exec01.md`, `Exec04.md`, `Exec05.md`, `Exec07.md`, `Exec08.md`, `Exec09.md`, `Exec10.md`, `Exec11.md`, `Exec14.md`, `Exec16.md`, `Exec19.md`, `Exec20.md`, `Exec22.md`, `Exec24.md`) reveals explicit contradictions and structural couplings across the round's proposals:

### A. Sibling contradiction on C1 (revision binding semantics)
- **Strict equality proposals** (`Crit06`, `Exec08`, `Exec20`, `Exec01`): require `resolveRev(receipt.rev) === evaluated_rev`.
  - *Contradiction / Defect*: As `Crit02`, `Exec14`, `Exec19`, and `Exec07` establish, a commit cannot embed a receipt naming its own commit hash (Git content-addressing fixed-point circularity). Furthermore, strict equality causes the gate to fail on any future descendant commit (e.g. `HEAD` in round 28 or round 29+), regressing **operability** and violating C1's kill rule ("matching committed receipt to fail … claim misses") and target ("runtime gate at its committed target receipt remains valid").
- **Naive ancestry proposals** (`Exec14`, `Exec19`): require `git merge-base --is-ancestor receipt.measured_rev evaluated_rev`.
  - *Contradiction / Defect*: As `Crit02` demonstrated in probe P4, if bytes are modified at an evaluated revision while the receipt still names an ancestor commit, naive ancestry would pass if bytes at the evaluated revision match the receipt, even though the bound revision held contradictory bytes.
- **Data omission hazard**: The committed target receipt `corpus/evidence/round-26/sources/s106.json` currently has no revision field (confirmed by sweep in `Exec01`, `Exec05`, `Exec08`, `Exec11`, `Exec14`, `Exec19`). If `parseReceipt` strictly demands the field without an atomic update to the receipt, the baseline gate regresses from `valid=true` to `exit 2 Refusal` (CNE).

### B. Sibling analysis on C2 (selfassessment LOG supersession)
- All siblings (`Exec04`, `Exec09`, `Exec10`, `Exec14`, `Exec16`, `Exec22`, `Exec24`) locate the false-clear bug in `scripts/check-selfassessment.mjs:325`: `/:\d+/.test(text)` checks for the existence of *any* colon-number token in a later correction paragraph rather than matching `f.line`.
- In `LOG.md:1904-1907`, a paragraph correcting `:335` cites `scripts/check-freshness.mjs` with oracle tally `cases: 12`. Because line 221 is also a stale `check-freshness.mjs` tally (claimed 8, oracle 12), the loose regex cleared line 221 without citing it (`corpus/lessons/round-27-verifier-spotcheck.md:15`).
- *Substrate hazard* (`Exec24`): Colon-number tokens appear in timestamps (e.g. `2026-10-15T05:16:28Z` in `LOG.md:269` contains `:16` and `:28`). A naive colon-search would false-clear any stale tally at lines 16 or 28.
- *Citation format hazard* (`Exec14`, `Exec22`): Real `LOG.md` entries contain range citations (e.g. `LOG.md:179-183`, `:1352-1353`) and prefixed citations (`LOG.md:221`). A naive exact match for `:${f.line}` would miss legitimate range citations.

### C. Cross-claim coupling (C1 gate ↔ C2 selfassessment oracle)
- `scripts/check-s106-evidence.mjs` matches `RUNNABLE_GATE = /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/` in `scripts/check-selfassessment.mjs:79`.
- When `check-selfassessment.mjs` checks `SCORECARD.md` or `LOG.md` mentions of `check-s106-evidence.mjs`, `gateTally()` (lines 144–182) invokes `node scripts/check-s106-evidence.mjs --selftest` in a restricted sandbox (`TMPDIR`, `GIT_CONFIG_GLOBAL=/dev/null`) and parses `cases[=:]\s*(\d+)`.
- Any C1 selftest changes that alter the summary stdout banner (e.g. changing `cases=N` formatting) or rely on ambient git configuration will cause `check-selfassessment.mjs` to return `could-not-evaluate: self-test printed no tally`, immediately failing calibration.

---

## 3. Affected axes

- **Depth (improved):** Resolves the missing revision binding on S106 evidence without self-referential circularity, verified by red non-ancestor/divergent and green ancestor selftest controls (selftest cases 5 → 7).
- **Calibration (improved):** Eliminates the `LOG.md:221` false-clear by enforcing exact token-bounded line citations, rejecting unrelated citations and timestamp false-positives (selftest cases 17 → 18).
- **Operability (preserved/protected):** Eliminates future-tip breakage caused by strict equality; preserves exit-code contracts (exit 0 valid, exit 1 invalid, exit 2 CNE) and maintains `gateTally` compatibility between gates.
- **Freshness, Coverage, Adjacency (unharmed):** Zero regression; no changes outside the scoped gate scripts and evidence receipt.

---

## 4. Proposed move (compatible synthesis)

**Dual-Anchor Lineage Synthesis: Git-Lineage Evidence Binding with Token-Bounded Citation Matcher**

1. **For C1 (`scripts/check-s106-evidence.mjs` and `corpus/evidence/round-26/sources/s106.json`):**
   - Adopt the repository's established precedent from `scripts/check-measurement-binding.mjs`:
     - Update `corpus/evidence/round-26/sources/s106.json` to include `"measured_rev": "0c666adc217685e1ece2af8596b732b303a3b15c"` (the commit that introduced the decoded bytes).
     - In `scripts/check-s106-evidence.mjs`, `parseReceipt` requires `measured_rev` matching `^[0-9a-f]{40}$` (missing/malformed → `Refusal` exit 2 CNE).
     - In `evaluate(repo, revArg)`, resolve `M = resolveRev(repo, receipt.measured_rev)`. Verify:
       (a) **Lineage check**: `git merge-base --is-ancestor M rev` (M must be ancestor-or-equal of the evaluated rev). Failure → `invalid` (exit 1), `revision_match: false`.
       (b) **Cross-revision byte integrity**: `readBlob(repo, M, receipt.bytes_path)` must hash to `receipt.decoded_sha256` and match the bytes at `rev`.
     - In selftest, retain existing 5 cases (including missing-receipt and missing-bytes CNE exit 2). Add:
       - `revision-match-valid` (green, exit 0, `revision_match: true`): receipt bound to ancestor commit.
       - `revision-mismatch-invalid` (red, exit 1, `revision_match: false`): receipt bound to non-ancestor / divergent branch commit.
     - Selftest case count reaches 7 (≥ 7); stdout maintains `S106_SELFTEST verdict=clean cases=7 passed=7`.

2. **For C2 (`scripts/check-selfassessment.mjs`):**
   - In `m1LogFindings` (line 325), replace `/:\d+/` with a token-bounded citation parser:
     - Regex: `/(?:^|[\s(`"']|\.md):(\d+)(?:-(\d+))?\b/g` (extracts single lines or range endpoints; excludes timestamps where colons are preceded by digits).
     - Predicate: requires that `f.line` is explicitly cited, either as an exact line (`f.line === citedLine`) or within an explicit range (`citedStart <= f.line && f.line <= citedEnd`).
   - Leave SCORECARD m1 untouched to avoid unverified second-order shifts on scorecard findings.
   - In selftest, retain existing 17 cases. Add:
     - `m1-log-unrelated-citation` (red, exit 1, class `m1-selftest-tally`): correction paragraph cites another line (e.g. `LOG.md:8`), stale finding at line 6 remains a mismatch.
     - Update header comment to reflect 18 cases.
   - At tip, `LOG.md:221` remains an active mismatch (`superseded: false`) because no paragraph in `LOG.md` cites line 221.

---

## 5. Risks and second-order failure modes

1. **Atomic Landing Requirement:** `corpus/evidence/round-26/sources/s106.json` must be updated with `measured_rev` in the *same* landed change as `scripts/check-s106-evidence.mjs`; otherwise, the runtime gate at tip will exit 2 (CNE) on legacy receipts.
2. **Environmental `m3` Mismatch:** During wave execution, untracked artifacts under `.ufo/waves/round-28/` trigger `m3-unlanded-paths` (mismatches ≥ 1). C2 verification must check the specific finding `LOG.md:221` (`superseded: false`), rather than expecting total `mismatches === 0`.
3. **Fixture Sandboxing:** Selftest cases in `check-s106-evidence.mjs` must initialize git repos using `mkdtempSync` and explicitly pass `env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" }` to prevent host gitconfig from interfering when run under `gateTally()`.

---

## 6. Verification plan

1. **C1 Gate Selftest and Runtime Gate:**
   ```bash
   node scripts/check-s106-evidence.mjs --selftest --json
   # Expect: cases >= 7, passed == cases, ok == true, exit 0
   node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
   # Expect: valid == true, revision_match == true, exit 0
   ```
2. **C2 Gate Selftest and Tip Evaluation:**
   ```bash
   node scripts/check-selfassessment.mjs --selftest --json
   # Expect: cases >= 18, passed == cases, ok == true, exit 0
   node scripts/check-selfassessment.mjs --rev HEAD --json
   # Expect: finding at LOG.md:221 has superseded == false; mismatches includes LOG.md:221
   ```
3. **Cross-Gate Coupling Verification:**
   ```bash
   # Verify check-selfassessment gateTally executes check-s106-evidence cleanly
   node -e '
     import("./scripts/check-selfassessment.mjs");
   '
   ```

---

Report: `.ufo/waves/round-28/w1/Conn03.md`
