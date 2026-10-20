# PolicyBoundaries — UFO-FSD Connector Report (Round 14 Wave 1)

**Seat:** `TabiR14.PolicyBoundaries`  
**Role:** UFO-FSD connector  
**Lane:** `tabi-shokunin` (`/home/vgpnk/Projects/shokunin/tabi-shokunin`)  
**Assignment:** Connect browser evidence-metadata craft vs generic security/testing ownership. Identify cross-lane ambiguity without sibling writes; prevent domain absorption per `PROVINCE.md` and round-13 verifier spot-check. Propose one compatible synthesis across round-14 proposals improving declared axes without harm.

---

## 1. Named Axes

In accordance with Godspeed and lane scoring:
- **operability (current: 8, tied lowest):** Primary target of Claim C1 (0→2 non-shell counting evaluators in legacy gates). Eliminating shell execution in `check-round-contract.mjs` and `check-user-round-contract.mjs` directly resolves inherited gate debt without changing historical counts or semantics.
- **calibration (current: 9):** Primary target of Claim C2 (0→1 metadata sidecar gate). Correcting the round-13 cleanup summary inversion (`listeningAfter`) and Node metadata discrepancy via an independent append-only sidecar directly addresses the previous verifier's routed defects.
- **depth (current: 8):** Preserved / unharmed. Grounding browser lifecycle claims in raw socket proofs rather than top-level booleans deepens evidence rigor.
- **freshness (current: 8):** Preserved / unharmed. No dated recheck or source row is improperly redated or renewed without warrant.
- **adjacency (current: 8):** Preserved / unharmed. Explicitly delineates lane boundary vs adjacent security/testing domains; prevents domain absorption.
- **coverage (current: 9):** Preserved / unharmed. Retains complete knowledge/evidence inventory.

**Scalars status:** Unchanged across all six axes (8/9/8/8/9/8). Claims C1 and C2 are causally separable and advance within bounded 0→2 and 0→1 increments.

---

## 2. Evidence & Anchors

1. **Province Mandate (`PROVINCE.md:3-21`):**
   - *Domain:* Browser & web-interaction craft (旅) — driving real browsers against real sites with evidence discipline.
   - *Owns:* kimi-webbridge plugin documentation, browser inventory and shape-only profiles, CDP session discipline, interaction records, dynamic-page evidence patterns (what to capture so a claim about a page is re-verifiable).
   - *Refuses:* Reverse engineering as forensics (→ `revenger`/`kaidoku`), web publishing (→ `kake`), secrets (→ `kagi`).
   - *Rule:* "Out of province → report, never absorb."

2. **Previous Verifier Defect Routing (`corpus/lessons/round-13-verifier-spotcheck.md`):**
   - *Routed Item 1 (`:158`):* `runner605` in `scripts/aria-loopback-round13.mjs` inverted `listeningAfter=true` in aggregate summary metadata, while individual workers correctly proved `listeningAfter=false` and `ECONNREFUSED`. Required: correct field semantics in new evidence sidecar, preserve original receipt, add failure-capable summary consistency check.
   - *Routed Item 2 (`:159`):* Stale recorded Node 24.21.0 vs observed Node 26.12.0 (satisfying enforced `minimumMajor: 20`). Required: distinguish observed from recorded in a qualified new artifact, without claiming exact Node equality was enforced.
   - *Routed Item 4 (`:161`):* Inherited gate debt retained: lane-authored SCORECARD shell execution in legacy gates. Explicit guidance: "Never execute a sibling's gate at closure: inspect its committed receipts."

3. **Current Vulnerability in Legacy Gates:**
   - `scripts/check-round-contract.mjs:292-296`: `runCount` executes `spawnSync('bash', ['-c', command], ...)` over unparsed strings parsed from `SCORECARD.md` (`:429-430`).
   - `scripts/check-user-round-contract.mjs:310-314`: Identical `spawnSync('bash', ['-c', command], ...)` vulnerability (`:494-495`).
   - If an unverified or hostile commit sets a malicious `command:` string, running the contract gate executes arbitrary bash on the operator's workstation.

4. **Committed Counting Grammar Inventory:**
   - **Historical SCORECARD.md (16 occurrences):**
     All 10 `pstack-20261015-r01..r10` and 6 `user-20261015-r01..r06` commands (`SCORECARD.md:242, 250, 258, 266, 274, 282, 290, 298, 306, 314, 336, 344, 353, 361, 369, 377`) match exactly:
     `git ls-tree -r --name-only <rev> | grep <arg1> [| grep <arg2>] | wc -l`
   - **Self-Test Fixture Generator (`writeGoodFixture` in both scripts):**
     `scripts/check-round-contract.mjs:507`: `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l`
     `scripts/check-user-round-contract.mjs:580`: `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l`

5. **Historical Round-13 Evidence Immutability:**
   - `corpus/evidence/round-13/aria/receipt.json:656, 2529`: Raw `perWorker[0].listeningAfter: false`, `refusedAfterClose: true`, `refusalDetail: "ECONNREFUSED"`.
   - `corpus/evidence/round-13/aria/receipt.json:2521`: Aggregate `cleanup.server.listeningAfter: true` (the `runner605` boolean inversion).
   - `corpus/evidence/round-13/aria/receipt.json:62`: `pin.node.recorded: "24.21.0"` vs observed Node 26.12.0 in execution pass.

---

## 3. Cross-Lane Ambiguity & Policy Boundary Analysis

### A. Browser Evidence-Metadata Craft vs. Generic Security/Testing Ownership
There is an apparent surface tension between the two claims in Round 14:
- Claim C1 modifies legacy repository contract gate scripts (`check-round-contract.mjs` and `check-user-round-contract.mjs`) to eliminate shell command injection.
- Claim C2 creates an ARIA metadata sidecar validator (`check-aria-metadata.mjs`) to verify server cleanup and Node metadata.

**The Boundary Question:** Does C1 mean `tabi-shokunin` is expanding its province into generic application security, shell sandboxing, or test harness development?
- **Analysis:** Under `PROVINCE.md:3-21`, `tabi-shokunin` owns browser & web-interaction craft and evidence discipline. It explicitly refuses forensic reverse engineering, web publishing, and secrets management. Generic static analysis, shell parsing engines, or general security hardening belong to adjacent or fleet-level tooling (e.g. `tsukuroi` for tooling/gates, general security reviewers).
- **Resolution:** Tabi does **not** absorb generic security engineering. The C1 fix is strictly **lane-internal operability hygiene** on legacy scripts inherited during probation. Tabi must not implement a general-purpose shell interpreter or arbitrary bash AST engine. Instead, C1 must implement a strictly bounded, fail-closed query evaluator that recognizes *only* the two observed historical counting grammar patterns. Any attempt to expand C1 into a general security sandbox would violate PROVINCE.md ("Out of province → report, never absorb").

### B. Declarative Metadata vs. Executable Trust
The unifying craft principle connecting C1 and C2 is **Evidence Substrate Discipline**:
- **In C1 (Scorecards):** The legacy gate mistakenly treated lane-authored SCORECARD text as executable shell code (`bash -c command`). Correct evidence discipline treats SCORECARD entries as **declarative object-storage queries** (`git ls-tree` / `git grep`) that must be evaluated via direct argv execution and in-memory line counting without shell interpolation.
- **In C2 (Browser Receipts):** Consumers of browser execution evidence must not blindly trust top-level summary booleans (`listeningAfter: true`), which may suffer from presentation bugs in runner aggregators (`runner605`). Correct evidence discipline treats summary fields as **untrusted derived claims**, which must be checked against raw, immutable substrate evidence (individual worker socket refusal proofs and operating system process checks).

### C. Cross-Lane Fleet Boundaries Without Sibling Writes
- **Sibling Isolation:** Under UFO-Swarm rules and the round-13 verifier guidance ("Never execute a sibling's gate at closure: inspect its committed receipts"), each lane is an independent trust boundary. Tabi must never execute a sibling lane's gate scripts, nor make writes to sibling directories or the fleet manifest.
- **Lane Self-Containment:** Tabi's legacy gates (`check-round-contract.mjs` and `check-user-round-contract.mjs`) validate only Tabi's own commits and fixtures. Hardening them ensures that even if an adversary supplies a malicious scorecard in an external pull request or review branch, host command execution is impossible.

---

## 4. Proposed Move: The Declarative Evidence Boundary Protocol

**Proposed Move:**  
Synthesize C1 and C2 under a unified **Declarative Evidence Boundary Rule** documented in `SKILL.md` (and enforced in the respective gate implementations):

1. **C1 Gate Evaluator Specification (Strict Fail-Closed Whitelist):**
   Replace `runCount(root, command)` with an in-process, non-shell evaluator that supports exactly the two documented grammar patterns:
   - **Pattern A (Historical SCORECARD):**  
     `^git ls-tree -r --name-only ([0-9a-f]{40}|[0-9a-f]{7,}) \| grep (?:-F )?['"]?([^'"|]+)['"]?(?: \| grep (?:-F )?['"]?([^'"|]+)['"]?)? \| wc -l$`  
     *Evaluation:* Execute `spawnSync('git', ['ls-tree', '-r', '--name-only', rev], { cwd: root })`. Filter stdout lines in JS via `String.includes(pat1)` (and `String.includes(pat2)` if present). Return `lines.length.toString()`.
   - **Pattern B (Fixture Generator):**  
     `^git grep -h ['"]\^marker: (admitted-(?:user-)?round)\$['"] ([0-9a-f]{40}|[0-9a-f]{7,}) -- ([a-zA-Z0-9._-]+) \| wc -l$`  
     *Evaluation:* Execute `spawnSync('git', ['grep', '-h', `^marker: ${marker}$`, rev, '--', file], { cwd: root })`. Count output lines in JS.
   - **Fail-Closed Gate:** Any command containing shell metacharacters (`;&$><\` etc.) or not matching Pattern A or Pattern B throws `fail('score_mismatch', 'unsupported counting command grammar')`.
   - *Province Boundary:* Explicitly annotate in the scripts that this evaluator is not a general shell emulator, but a domain-bounded legacy query adapter.

2. **C2 Metadata Sidecar Gate Specification (`check-aria-metadata.mjs`):**
   - Read `corpus/evidence/round-13/aria/receipt.json` without modifying it byte-for-byte.
   - Verify that raw worker proofs (`receipt.cleanup.server.perWorker`) contain `closed: true`, `listeningAfter: false`, `refusedAfterClose: true`, and `refusalDetail: "ECONNREFUSED"`.
   - Validate that the aggregate field `cleanup.server.listeningAfter` is indeed `true` due to the documented `runner605` bug, flagging the discrepancy in a structured sidecar verification record under `corpus/evidence/round-14/aria-metadata/sidecar.json`.
   - Reconcile Node runtime: assert that observed Node version (Node 26.x) satisfies the enforced requirement (`minimumMajor: 20`), and qualify `pin.node.recorded: "24.21.0"` as historical descriptive metadata rather than an enforced pin.
   - *Province Boundary:* Do not execute Playwright, download browser binaries, or make network calls. The sidecar check is strictly an evidence audit.

3. **Coordination Across Seats:**
   - Message sent to `TabiR14.RoundCounter` and `TabiR14.UserCounter`: informed them of the two distinct grammar forms (Pattern A and Pattern B) to prevent fixture regression.
   - Message sent to `TabiR14.ReceiptRepair`: informed them of the exact worker-vs-aggregate fields and Node metadata requirements.
   - Message sent to `TabiR14.SecurityScope`: clarified that C1 is lane operability hygiene, preventing domain absorption.

---

## 5. Affected Axes & No-Harm Evaluation

| Axis | Before | After | Harm? | Evidence / Mechanism |
|---|---|---|---|---|
| **operability** | 8 | 8 (improved C1: 0→2) | **None** | Replaces bash execution in both legacy gates with non-shell evaluator; preserves exact line counts and legacy failure codes (`USER 6/10` remains exit 1 red). |
| **calibration** | 9 | 9 (improved C2: 0→1) | **None** | Resolves routed items 1 & 2 from round 13 verifier without mutating historical files; sidecar gate provides failure-capable consistency checking. |
| **adjacency** | 8 | 8 (unchanged) | **None** | Re-affirms PROVINCE.md boundaries: lane operability hygiene is kept strictly separate from general security domain; zero sibling writes. |
| **depth** | 8 | 8 (unchanged) | **None** | Connects browser evidence discipline from top-level summaries down to socket-level closure proofs. |
| **freshness** | 8 | 8 (unchanged) | **None** | Historical receipts remain pinned; no dated re-checks are forged. |
| **coverage** | 9 | 9 (unchanged) | **None** | Knowledge map and evidence inventory remain intact. |

---

## 6. Risks & Second-Order Effects

1. **Risk: Rigid grammar breaks future round counters.**
   - *Second-Order Effect:* Future rounds might add different git flags or counting commands.
   - *Mitigation:* Future rounds in `tabi-shokunin` should use dedicated, structured evidence JSONs (as established in rounds 12-14) rather than appending new shell commands to legacy SCORECARD blocks. The legacy counting grammar is frozen for rounds 1–11 and self-test fixtures.
2. **Risk: False sense of complete security.**
   - *Second-Order Effect:* Eliminating `bash -c` in `runCount` secures counting, but `git` itself is still invoked via `spawnSync`.
   - *Mitigation:* `spawnSync('git', args)` passes arguments as discrete strings, preventing shell word splitting and metacharacter expansion. Rev arguments are validated as hex commits or verified refs.
3. **Risk: Conflating metadata sidecar with browser re-execution.**
   - *Second-Order Effect:* An outside verifier might question whether a new browser run occurred.
   - *Mitigation:* The sidecar explicitly states in its schema and metadata that it is an offline static verification of historical round-13 evidence; no browser processes or loopback servers are launched.

---

## 7. Verification & Commands for L1

Authoring seats must not execute checks or tests mid-flight. When all wave seats have landed, L1 should run the following verification sequence:

```sh
# 1. Verify sources census remains valid
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi

# 2. Verify C1: non-shell execution in legacy gates and exact historical line-count preservation
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs --self-test
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --self-test
# Expected: USER gate fails with round_count 6 vs 10 (preserved red finding)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs || echo "USER gate correctly failed with expected round_count deficit"

# 3. Verify C2: metadata sidecar gate validates cleanup and Node metadata without browser launch
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs

# 4. Verify no bash execution remains in runCount functions
! grep -E "spawnSync\(['\"]bash['\"]" /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs
! grep -E "spawnSync\(['\"]bash['\"]" /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs

# 5. Verify byte preservation of historical round-13 receipt
git diff --exit-code /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/receipt.json
```
