# Mistake Routing & Defect Mapping — Tabi Round 14

**Seat:** `TabiR14.MistakeRouting`  
**Role:** UFO-FSD Connector  
**Posture:** Godspeed (`skill://godspeed`)  
**Input:** Read-only inspection of `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-13-verifier-spotcheck.md`  
**Report Target:** `.ufo/waves/round-14/w1/MistakeRouting.md`

---

## 1. Naming the Axes

In accordance with Godspeed step 1 and the fleet specification in `/home/vgpnk/Projects/shokunin/AXES.md`:

1. **depth**: Verifiable technical detail, decision tables with concrete error signatures, unambiguous grammar rules, and cited sources.
2. **coverage**: Real domain surfaces governed (repo paths, tools, edge classes) without unexplored omissions.
3. **operability**: Runnable artifacts, executable verification gates, failure-capable self-test harnesses, and verified exit codes.
4. **freshness**: Drift detection, re-verification of historical and current surfaces against live git trees.
5. **calibration**: Self-assessment fidelity, honest gap naming, disaggregation of claims, and separation of observation from inference.
6. **adjacency**: Explicit boundaries and cross-domain awareness, reporting rather than absorbing outside or protocol-owned debt.

### Round 14 Declared Focus & Scalars
- **Claim C1 (operability)**: Eliminate execution of lane-authored `SCORECARD.md` shell strings via `bash -c` in both legacy gates (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`), replacing them with a strict non-shell parser/evaluator over direct git object bytes while preserving historical line-count semantics, expected counts, and the real red finding (`0 → 2`).
- **Claim C2 (calibration)**: Provide an independently verifiable, qualified, derived metadata sidecar and failure-capable validation gate for Round 13 ARIA loopback cleanup and Node version metadata without re-executing browsers or mutating historical receipts (`0 → 1`).
- **Expertise Scalars**: Unchanged across all six axes (`depth: 8`, `coverage: 9`, `operability: 8`, `freshness: 8`, `calibration: 9`, `adjacency: 8`). Operability is the lowest-scoring non-retired axis (tied with depth, freshness, adjacency at 8), satisfying protocol obligations.

---

## 2. Comprehensive Mapping of All Six Routed Items

The Round 13 independent closure (`corpus/lessons/round-13-verifier-spotcheck.md:154–165`) documented six routed defects and retained debts. Each item is mapped below to active changes in Round 14 or explicitly retained debt with its identified owner:

| Routed Item | Description from R13 Spotcheck | Disposition / Category | Round 14 Action / Exact Retained Debt | Responsible Seat / Owner |
|---|---|---|---|---|
| **1. Cleanup summary metadata** | `runner605` stored the proposition "all workers not listening" under `listeningAfter: true` in `corpus/evidence/round-13/aria/receipt.json`, contradicting per-worker proofs (`listeningAfter: false`, `closed: true`, `refusedAfterClose: true`). | **Active Claim (C2)** | Addressed via new failure-capable validation gate (`scripts/check-aria-metadata.mjs`) and qualified sidecar (`corpus/evidence/round-14/aria-metadata/`). Preserves historical `receipt.json` byte-for-byte. Validates summary boolean against underlying per-worker facts; fails closed if workers disagree, if proofs are missing, or if inputs are malformed. | `TabiR14.ReceiptRepair` (executor), supported by `CleanupSemantics`, `AttackMetadata`, `ReceiptSecurity` |
| **2. Reproducibility wording** | Stale descriptive metadata in `runtime-pin.json` (`recorded: "24.21.0"`, `minimumMajor: 20`) vs observed Node `26.12.0` on runner host, risking misleading claims about exact Node environment reproducibility. | **Active Claim (C2)** | Addressed in `scripts/check-aria-metadata.mjs` and the sidecar metadata. Disaggregates observed execution environment (Node 26.12.0) from recorded historical metadata and minimum major constraint (>=20). Clarifies that Node 26.12 satisfies the floor without pretending byte-identical Node pinning was enforced. No fresh browser execution or capability claimed. | `TabiR14.ReceiptRepair` (executor), supported by `NodeSemantics`, `EvidenceLadder` |
| **3. Gate receipt & registry precision** | Undocumented `--witness REV` flag in `SKILL.md:1665–1686` for USER gate; missing explicit `measuredRevision` binding in USER witness receipts; disaggregating counts (USER 20 fixture cases + 1 alias = 21 CLI controls); distinguishing child vs top-level exits; non-permanent scratch baseline IDs. | **Active Precision** | `scripts/check-user-round-contract.mjs` updated to include explicit `measuredRevision` and `codeDigest` in future witness outputs. `SKILL.md` registry entry updated to document `--witness REV` alongside `--self-test`. Report and documentation checklist disaggregates 20 fixture cases + 1 alias control = 21 CLI controls. Confirms top-level witness exit is 0 while child exits show exit 1 `history_rewritten` → exit 0 `clean`. | `TabiR14.UserCounter` (executor), `TabiR14.OldWitnessAudit` (reviewer), `TabiR14.DebtScribe` (scribe), L1 |
| **4. Inherited broader gate debt** | (a) Lane-authored `SCORECARD.md` shell execution via `runCount`.<br>(b) r07 survivor replay.<br>(c) Unfrozen user records.<br>(d) IPv6 origin classification.<br>(e) Unpinned external validator.<br>(f) USER 6/10 red finding. | **Partitioned: Active C1 + Retained Debt** | **(a) Active (C1)**: Eliminates shell execution in `runCount` for both `scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`, replacing `spawnSync('bash', ['-c', ...])` with a strict AST token evaluator over direct git object bytes.<br>**(b–e) Retained Debt**: r07 survivor replay, unfrozen user records, IPv6 classification, and unpinned external validator remain uncredited legacy gate debt.<br>**(f) Retained Finding**: USER 6/10 remains an honest failed production gate (`round_count`, exit 1); expected count 10 is preserved. | Active: `TabiR14.RoundCounter`, `TabiR14.UserCounter`. Retained: `tabi-shokunin` lane |
| **5. Carried closure conformance debt** | Round 13 closure supplied committed measurements and serialized append helper, not a frozen step-1/step-4 closure-checker execution for this hyaku row. Historical frozen fixtures do not cover current entries. | **Exact Retained Debt** | Carried forward unchanged as status-neutral debt. Tabi lane authors cannot modify, execute, or certify outside closure-checker infrastructure. Documented in reports and lessons. | `operator / protocol` |
| **6. Prior numerical erratum** | Erratum in `round-12-verifier-spotcheck.md:153`: quotation had 14 words (`len(quote.split())`), miscounted as 16 words. | **Outside Erratum** | Already disposed by the Round 13 verifier spot-check itself (`round-13-verifier-spotcheck.md:163`) via append-only correction. In accordance with historical immutability, `round-12-verifier-spotcheck.md` is never edited by lane authors. | `protocol / non-author verifier` |

---

## 3. New QUALITY Criteria with Grounded Lessons & Red Controls

In accordance with the contract ("no disappearance; new QUALITY criteria need grounded lesson and red controls"), L1 should append the following criteria to `corpus/QUALITY.md`:

### Criterion 18: Derived Metadata and Aggregation Sidecars
- **Text:**  
  `18. A derived metadata correction or verification sidecar must be causally verifiable, fail-closed against contradictions with its underlying per-worker or per-case proofs, and preserve historical executed receipts byte-for-byte rather than mutating original artifacts or asserting fresh execution. A metadata gate must include negative red controls asserting refusal on contradictory summary propositions (e.g. aggregate success with failing worker proofs, or aggregate listening with refused ports), empty worker proof sets, and malformed inputs. (lesson: corpus/lessons/round-13-verifier-spotcheck.md routed item 1; corpus/lessons/round-14.md#mistakes; R14 C2 metadata sidecar)`
- **Grounded Lesson:** `corpus/lessons/round-13-verifier-spotcheck.md` routed defect 1 (runner605 stored inverted boolean summary) and Round 14 C2 sidecar design.
- **Red Controls Required:**
  1. Negative fixture with `listeningAfter: true` when workers report `listeningAfter: false` and `refusedAfterClose: true`. Gate must exit 1 with finding `summary_contradiction`.
  2. Negative fixture with empty worker proof array `[]`. Gate must exit 1 with finding `missing_worker_proofs`.
  3. Negative fixture with non-boolean or missing `listeningAfter` property. Gate must exit 1 with finding `malformed_metadata`.

### Criterion 19: Declarative Non-Shell Scorecard Evaluation
- **Text:**  
  `19. A legacy counting gate must parse and evaluate scorecard command strings via a strict, fail-closed AST or token evaluator against direct git object bytes (safe argv parameters), never executing unvalidated lane-authored strings in a general-purpose shell (bash -c). Any unrecognized command syntax, command chaining (&&, ||, ;), subshells ($(), \`), redirects (>, <), shell metacharacters, or path traversal outside the pinned grammar must fail closed as score_mismatch without subprocess execution. Negative red controls must assert refusal of hostile shell injections without creating markers or executing payload side effects. (lesson: corpus/lessons/round-13-verifier-spotcheck.md routed item 4; corpus/lessons/round-14.md#mistakes; R14 C1 non-shell runCount cutover)`
- **Grounded Lesson:** `corpus/lessons/round-13-verifier-spotcheck.md` routed item 4 (lane-authored SCORECARD shell execution) and Round 14 C1 non-shell cutover.
- **Red Controls Required:**
  1. Negative fixture with command chaining (`git ls-tree ... | wc -l ; touch /tmp/pwn`). Gate must fail with `score_mismatch`, exit 1, and `/tmp/pwn` must NOT exist.
  2. Negative fixture with command substitution (`git ls-tree $(whoami) | wc -l`). Gate must fail with `score_mismatch`, exit 1, with zero subprocess spawning.
  3. Negative fixture with output redirection (`git ls-tree ... > /tmp/out`). Gate must fail with `score_mismatch`, exit 1, and `/tmp/out` must NOT exist.

---

## 4. Non-Obvious Move: UFO-FSD Connector Synthesis

### Evidence & Tensions Across Proposals
1. **Cross-Gate Cutover Dependency:** `scripts/check-user-round-contract.mjs` explicitly checks the SHA-256 hash of `scripts/check-round-contract.mjs`. In Round 13, this was pinned as:
   ```javascript
   const ROUND_SCRIPT_PRIOR_SHA256 = '7d403cee003c3b49e865d57e034821ea925252efc231b0b22ded62ac5410c398';
   const ROUND_SCRIPT_CUTOVER_SHA256 = '8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d';
   ```
   If `RoundCounter` refactors `scripts/check-round-contract.mjs` to non-shell parsing, its hash changes to `ROUND_SCRIPT_R14_SHA256`. If `UserCounter` simply replaces `ROUND_SCRIPT_CUTOVER_SHA256` with the R14 hash, any historical witness running against Round 13 commits will fail with `history_rewritten`. If `UserCounter` adopts a blanket path exemption or relaxes the hash check, it violates QUALITY 16!
2. **Counting Grammar Edge Cases:** `SCORECARD.md` contains subtle token variations across historical rows:
   - Single-quoted patterns: `grep '.txt'` (e.g. line 258).
   - Multiple chained greps: `grep pstack-20261015-r02/replay- | grep receipt.txt` (line 250).
   - Trailing newline semantics: In bash, `wc -l` outputs line counts, but in JavaScript, `"".split('\n')` yields `[""]` (length 1), which could erroneously count an empty tree or zero matches as 1 instead of 0.
3. **C1/C2 Substrate Coupling:** `MeasureClaims` (`measure.mjs`) must verify both C1 and C2 over git revision blobs without running arbitrary shell scripts. If the parsing logic in `measure.mjs` diverges from the gate evaluators, measurements will fail to agree.

### The Proposed Move
**Synthesize a Dual-Generation Strict Hash Policy and Symmetric Non-Shell Grammar Contract:**
1. **Multi-Generation Cutover Pin Set in `check-user-round-contract.mjs`:**  
   Update `check-user-round-contract.mjs` to maintain an explicit immutable set of accepted historical cutover hashes:
   ```javascript
   const ROUND_SCRIPT_ACCEPTED_HASHES = new Set([
     '7d403cee003c3b49e865d57e034821ea925252efc231b0b22ded62ac5410c398', // PSTACK_PIN baseline
     '8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d', // Round 13 policy repair
     ROUND_SCRIPT_R14_SHA256                                                // Round 14 non-shell cutover
   ]);
   ```
   This strictly forbids blanket path exemptions (satisfying QUALITY 16), accepts the legitimate Round 14 cutover, and preserves backward compatibility for historical witnesses.
2. **Deterministic Declarative Tokenizer:**  
   Both gates and `measure.mjs` must implement the exact same deterministic token sequence:
   - Extract pipeline stages split strictly by ` | `.
   - Stage 0 must strictly match `^git ls-tree -r --name-only ([a-f0-9]{40})$`.
   - Stages 1 to N-1 must match `^grep (?:'([^']+)'|"([^"]+)"|([^\s|]+))$`.
   - Final stage must strictly match `^wc -l$`.
   - Execution uses `gitOk(root, ['ls-tree', '-r', '--name-only', rev])`, splits by `\n`, filters out empty lines, sequentially filters with literal substring inclusion (or RegExp matching) for each grep pattern, and returns `matches.length.toString()`.
3. **Witness Revision Binding Output:**  
   `UserCounter` ensures the witness receipt emitted under `--witness` embeds `measuredRevision` and `codeDigest`, fully resolving Routed Item 3.

### Affected Axes
- **operability (improved)**: Eliminates shell process spawning from both legacy gates while preventing regression in historical witness runs across multi-generation commits.
- **calibration (improved)**: Accurately preserves all historical expected counts and real red findings (USER 6/10) without loosening assertions or inventing rounds.
- **depth (improved)**: Formally documents the counting grammar and multi-generation hash transition in `SKILL.md`.
- **Harm to other axes**: None. No scalars are altered; `coverage`, `freshness`, and `adjacency` are unaffected.

### Risks and Mitigations
- **Risk 1: Circular Hash Dependency:** `UserCounter` needs the exact SHA-256 of `RoundCounter`'s final script.  
  *Mitigation:* `RoundCounter` finalizes its script edits first; `UserCounter` reads the exact file digest of `scripts/check-round-contract.mjs` before embedding it into `ROUND_SCRIPT_R14_SHA256` and the fixture test cases.
- **Risk 2: Empty Match Off-by-One:** An empty `git ls-tree` output or zero matching lines being counted as 1.  
  *Mitigation:* Empty string after trim must yield an empty array `[]` resulting in count `"0"`, exactly matching historical `wc -l` behavior.
- **Risk 3: Shell Metacharacter Permissiveness:** Allowing quotes to mask semicolons or subshells.  
  *Mitigation:* Reject any command containing `;`, `&`, `$`, `` ` ``, `<`, `>`, `\`, or newlines before pipeline splitting.

---

## 5. Verification Commands for Main Integrator (L1)

After all seat implementations land, L1 should run the following verification sequence (no test checks were executed by this leaf subagent):

```sh
# 1. Verify sources census conforms
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi

# 2. Verify C1 Round Contract non-shell self-test and malicious command refusal
node scripts/check-round-contract.mjs --self-test

# 3. Verify C1 User Contract non-shell self-test, cutover acceptance, and witness output
node scripts/check-user-round-contract.mjs --self-test

# 4. Verify C1 production gate outcomes (ROUND clean 0, USER exit 1 round_count 6/10)
node scripts/check-round-contract.mjs
node scripts/check-user-round-contract.mjs || test $? -eq 1

# 5. Verify C2 ARIA metadata gate self-test and sidecar validation
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --verify corpus/evidence/round-14/aria-metadata/correction-sidecar.json

# 6. Verify revision-based measurement script
node .ufo/waves/round-14/measure.mjs HEAD --claim C1
node .ufo/waves/round-14/measure.mjs HEAD --claim C2
node .ufo/waves/round-14/measure.mjs HEAD --histogram
```

---

## 6. Tooling Directive Record

In conformance with the operator tooling directive of 2026-10-19:
- **Tools Installed / Updated:** None.
- **Status:** Standard runtime environment utilized; no external packages or system upgrades required for read-only analysis and report generation.
