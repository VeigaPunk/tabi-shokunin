# HistoricalCountModel — UFO-FSD Scout Report (Round 14 Wave 1)

**Seat:** `TabiR14.HistoricalCountModel`  
**Role:** UFO-FSD scout (leaf)  
**Lane:** `tabi-shokunin` (`/home/vgpnk/Projects/shokunin/tabi-shokunin`)  
**Target:** Read-only historical SCORECARD count rows and measured blob semantics under `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Explain `wc -l` vs split newline edge cases and exact expected before/after values, without running authored commands.  
**Report Trailer:** `.ufo/waves/round-14/w1/HistoricalCountModel.md`

---

## 1. Named Axes & Godspeed Posture

In accordance with Godspeed discipline and lane scoring rules:
1. **operability (current: 8, tied lowest):** Primary target of Claim C1 (0→2 non-shell counting evaluators in legacy gates). Eliminates arbitrary shell execution in `scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs` while preserving byte-for-byte historical line-count semantics and existing expected outcomes.
2. **calibration (current: 9):** Primary target of Claim C2 (0→1 metadata sidecar gate). Pins existing round-13 evidence and verifies corrected cleanup summary and Node metadata without pretending new browser execution.
3. **depth (current: 8):** Preserved / unharmed.
4. **freshness (current: 8):** Preserved / unharmed. No historical dates or sources silently renewed.
5. **adjacency (current: 8):** Preserved / unharmed. Browser evidence craft strictly separated from generic security tooling.
6. **coverage (current: 9):** Preserved / unharmed.
- **Scalars Status:** Unchanged across all six axes (`8/9/8/8/9/8`). Claims C1 and C2 are causally separable and advance within bounded 0→2 and 0→1 increments.

---

## 2. Complete Inventory of Historical SCORECARD Count Rows

The repository scorecard (`SCORECARD.md`) contains historical counting blocks formatted as HTML comments evaluated by the legacy contract gates (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`).

There are exactly **16 historical counted rounds** (10 Pstack continuation rounds and 6 User swarm continuation rounds) plus **2 fixture generator command templates** in the gate test suites.

### A. Pstack Continuation Rounds (`SCORECARD.md:238-316`)
Evaluated by `scripts/check-round-contract.mjs` (`parseScore` / `runCount`).

| Round ID | Axis | Before | After | Measured Commit (`score.measured`) | Counting Command | Target Path Matched |
|---|---|---|---|---|---|---|
| `pstack-20261015-r01` | freshness | `0` | `1` | `f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8` | `git ls-tree -r --name-only f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8 \| grep pstack-20261015-r01/public/capture.json \| wc -l` | `corpus/evidence/pstack-20261015-r01/public/capture.json` |
| `pstack-20261015-r02` | freshness | `0` | `2` | `6a91f68af5ac5135b6b753c947b12c72e54794ef` | `git ls-tree -r --name-only 6a91f68af5ac5135b6b753c947b12c72e54794ef \| grep pstack-20261015-r02/replay- \| grep receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r02/replay-1/receipt.txt`<br>`corpus/evidence/pstack-20261015-r02/replay-2/receipt.txt` |
| `pstack-20261015-r03` | adjacency | `0` | `4` | `a19c6a90a0fb0e00729fd895c3c136ac4305f877` | `git ls-tree -r --name-only a19c6a90a0fb0e00729fd895c3c136ac4305f877 \| grep pstack-20261015-r03/boundary/ \| grep '.txt' \| wc -l` | 4 boundary refusal files under `pstack-20261015-r03/boundary/*.txt` |
| `pstack-20261015-r04` | coverage | `0` | `1` | `3e3ba9e90d4bf04d5743652e72a9252f81877122` | `git ls-tree -r --name-only 3e3ba9e90d4bf04d5743652e72a9252f81877122 \| grep corpus/knowledge/example-domain-observation.md \| wc -l` | `corpus/knowledge/example-domain-observation.md` |
| `pstack-20261015-r05` | freshness | `0` | `1` | `2e4cba06a07ff7f50a7aee6688644217eec64128` | `git ls-tree -r --name-only 2e4cba06a07ff7f50a7aee6688644217eec64128 \| grep pstack-20261015-r05/replay/receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r05/replay/receipt.txt` |
| `pstack-20261015-r06` | operability | `0` | `1` | `ef51deddbb3c649ae3931f011757e3eb9d340ad9` | `git ls-tree -r --name-only ef51deddbb3c649ae3931f011757e3eb9d340ad9 \| grep pstack-20261015-r06/operability/selftest-receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r06/operability/selftest-receipt.txt` |
| `pstack-20261015-r07` | adjacency | `0` | `1` | `ec5ee4bd51a35fe964fe63b73ab356c27530e464` | `git ls-tree -r --name-only ec5ee4bd51a35fe964fe63b73ab356c27530e464 \| grep pstack-20261015-r07/boundary/refusal-receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r07/boundary/refusal-receipt.txt` |
| `pstack-20261015-r08` | calibration | `0` | `1` | `472bfc33de340035be5fa001f4e6685b79be4a64` | `git ls-tree -r --name-only 472bfc33de340035be5fa001f4e6685b79be4a64 \| grep pstack-20261015-r08/calibration/pin-receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r08/calibration/pin-receipt.txt` |
| `pstack-20261015-r09` | coverage | `0` | `1` | `e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2` | `git ls-tree -r --name-only e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2 \| grep corpus/knowledge/loopback-pin-stability.md \| wc -l` | `corpus/knowledge/loopback-pin-stability.md` |
| `pstack-20261015-r10` | freshness | `0` | `1` | `4e75a17ebbaa125777ed0d6e745fd150e9c6caf2` | `git ls-tree -r --name-only 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2 \| grep pstack-20261015-r10/replay/receipt.txt \| wc -l` | `corpus/evidence/pstack-20261015-r10/replay/receipt.txt` |

### B. User Swarm Continuation Rounds (`SCORECARD.md:332-380`)
Evaluated by `scripts/check-user-round-contract.mjs` (`parseScore` / `runCount`).

| Round ID | Axis | Before | After | Measured Commit (`score.measured`) | Counting Command | Target Path Matched |
|---|---|---|---|---|---|---|
| `user-20261015-r01` | operability | `0` | `1` | `95ea5f8b98ae4cf8ee651bf46709570114f50edd` | `git ls-tree -r --name-only 95ea5f8b98ae4cf8ee651bf46709570114f50edd \| grep user-20261015-r01/operability/selftest-receipt.txt \| wc -l` | `corpus/evidence/user-20261015-r01/operability/selftest-receipt.txt` |
| `user-20261015-r02` | adjacency | `0` | `1` | `59ba8da019400c1a3b14bc2c19746a457f791601` | `git ls-tree -r --name-only 59ba8da019400c1a3b14bc2c19746a457f791601 \| grep user-20261015-r02/boundary/refusal-receipt.txt \| wc -l` | `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` |
| `user-20261015-r03` | calibration | `0` | `1` | `8a869af00665e8e445bc84c50492433097c55866` | `git ls-tree -r --name-only 8a869af00665e8e445bc84c50492433097c55866 \| grep user-20261015-r03/calibration/pin-compare.txt \| wc -l` | `corpus/evidence/user-20261015-r03/calibration/pin-compare.txt` |
| `user-20261015-r04` | coverage | `0` | `1` | `982e3b2d53569fe3494d5f589384ce789ea52a20` | `git ls-tree -r --name-only 982e3b2d53569fe3494d5f589384ce789ea52a20 \| grep corpus/knowledge/user-public-observation.md \| wc -l` | `corpus/knowledge/user-public-observation.md` |
| `user-20261015-r05` | depth | `0` | `1` | `c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7` | `git ls-tree -r --name-only c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7 \| grep user-20261015-r05/depth/paragraph-receipt.txt \| wc -l` | `corpus/evidence/user-20261015-r05/depth/paragraph-receipt.txt` |
| `user-20261015-r06` | freshness | `0` | `1` | `1229098dae56c2d193c01203ff93651da2853f6e` | `git ls-tree -r --name-only 1229098dae56c2d193c01203ff93651da2853f6e \| grep user-20261015-r06/freshness/replay-receipt.txt \| wc -l` | `corpus/evidence/user-20261015-r06/freshness/replay-receipt.txt` |

### C. Gate Self-Test Fixture Command Templates
Generated by `writeGoodFixture` in each legacy gate script:
- `scripts/check-round-contract.mjs:647`:
  `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l` (before: 0, after: 1).
- `scripts/check-user-round-contract.mjs:590`:
  `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l` (before: 0, after: 1).

### D. Distinction from Post-Swarm Rounds (Kaika Round 1, Round 12, Round 13)
Later rounds do not use legacy `<!-- pstack-round:` or `<!-- user-round:` HTML comment blocks. Instead, they use markdown table rows citing dedicated evaluation scripts:
- Kaika Fleet Round 1 (`SCORECARD.md:410-412`): Table claims C1, C2, C3.
- Round 12 (`SCORECARD.md:482-483`): Evaluated by `node .ufo/waves/round-12/measure.mjs REV`.
- Round 13 (`SCORECARD.md:545-546`): Evaluated by `node .ufo/waves/round-13/measure.mjs REV --claim C1|C2`.
The legacy gates parse strictly the `<!-- pstack-round:<id>` and `<!-- user-round:<id>` blocks, making the scope of C1 operability bounded strictly to the 16 historical rows and the 2 fixture templates.

---

## 3. Measured Blob Semantics & Baseline Substitution Model

### The Substitution Invariant
In both `check-round-contract.mjs:427` and `check-user-round-contract.mjs:492`, the `beforeCommand` is constructed mechanically via:
```javascript
const beforeCommand = score.command.replaceAll(score.measured, options.baseline);
if (beforeCommand === score.command) fail('missing_score', `${id} counting command does not use the measured commit`);
```
In production, `options.baseline` is pinned to `HARD_BASELINE`:
```javascript
const HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c';
```

### Why Before is Always `0` and After is `> 0`
1. **At `options.baseline` (`HARD_BASELINE`):**
   - The repository tree at `7f506affa55f6fb892d3c8073c75151c998bdf2c` precedes the work of round `pstack-20261015-r01` through `r10` and `user-20261015-r01` through `r06`.
   - Running `git ls-tree -r --name-only 7f506affa55f6fb892d3c8073c75151c998bdf2c` yields trees that do **not** contain any of the newly created receipt files, evidence captures, or observation markdown notes.
   - Filtering the listing through the specified `grep` pattern(s) produces **zero matching lines**.
   - `wc -l` over zero lines emits `0`.
   - The gate verifies: `runCount(root, beforeCommand) === score.before` (which is `"0"`).
2. **At `score.measured`:**
   - The specific commit referenced by `score.measured` introduced the evidence artifact(s).
   - `git ls-tree -r --name-only <score.measured>` emits the tree paths present at that commit.
   - Filtering through the `grep` stage(s) selects:
     - Exactly **1 line** for single receipt/observation files (`r01`, `r04-r10`, and `user-r01-r06`).
     - Exactly **2 lines** for `pstack-r02` (`replay-1/receipt.txt` and `replay-2/receipt.txt`).
     - Exactly **4 lines** for `pstack-r03` (4 boundary refusal `.txt` files).
   - `wc -l` outputs `"1"`, `"2"`, or `"4"`.
   - The gate verifies: `runCount(root, score.command) === score.after`.

Because git trees and commits are content-addressed and immutable, these queries evaluate directly against the git object database without mutating or depending on working directory state.

---

## 4. `wc -l` vs Split Newline Edge Cases

### A. POSIX / GNU `wc -l` Semantics
POSIX standard `wc -l` does **not** count lines in the colloquial sense of "strings separated by line breaks". Rather, it counts the **number of newline characters (`\n`, byte `0x0A`)** in the input stream.
1. **Empty stream (`0 bytes`):** Contains 0 newlines $\rightarrow$ outputs `0`.
2. **Unterminated single line (`"hello"`):** Contains 0 newlines $\rightarrow$ outputs `0`.
3. **Terminated single line (`"hello\n"`):** Contains 1 newline $\rightarrow$ outputs `1`.
4. **Terminated multiple lines (`"a\nb\n"`):** Contains 2 newlines $\rightarrow$ outputs `2`.
5. **Multiple trailing newlines (`"a\n\n"`):** Contains 2 newlines $\rightarrow$ outputs `2`.
6. **Trailing unterminated line (`"a\nb"`):** Contains 1 newline $\rightarrow$ outputs `1` (the unterminated chunk `"b"` is ignored).

### B. Pitfalls in Naive JavaScript Implementations

| Implementation | Input `""` (0 matches) | Input `"a\n"` (1 match) | Input `"a\nb\n"` (2 matches) | Input `"a\n\n"` (blank line) | Input `"a"` (no `\n`) | Behavioral Defect vs `wc -l` |
|---|---|---|---|---|---|---|
| **POSIX `wc -l`** | **`0`** | **`1`** | **`2`** | **`2`** | **`0`** | Ground truth reference |
| `str.split('\n').length` | `1` (`[""]`) | `2` (`["a", ""]`) | `3` (`["a","b",""]`) | `3` (`["a","",""]`) | `1` (`["a"]`) | **Fails all cases**: off-by-one high due to trailing empty element. |
| `str.trim().split('\n').length` | `1` (`[""]`) | `1` (`["a"]`) | `2` (`["a","b"]`) | `1` (`["a"]`) | `1` (`["a"]`) | **Fails on 0 matches** (yields `1` instead of `0`); collapses intentional trailing blank lines. |
| `split('\n')` + `filter(Boolean).length` | `0` (`[]`) | `1` (`["a"]`) | `2` (`["a","b"]`) | `1` (`["a"]`) | `1` (`["a"]`) | Drops blank lines; counts unterminated line as `1`. |
| `rows.split('\n'); if (rows.at(-1)==='') rows.pop();` | `0` (`[]`) | `1` (`["a"]`) | `2` (`["a","b"]`) | `2` (`["a",""]`) | `1` (`["a"]`) | **Exact match for newline-terminated git output!** |
| `for (b of stdout) if (b === 0x0A) lines++` | `0` | `1` | `2` | `2` | `0` | **Exact byte-level mathematical duplicate of `wc -l`!** |

### C. Application to the Two Counting Families in C1

#### 1. The Tree Path Counting Family (`git ls-tree -r --name-only <rev> | grep ... | wc -l`)
- `git ls-tree` guarantees that every output path is terminated with `\n` (byte `0x0A`).
- If there are zero files matching the tree revision, `git ls-tree` emits an empty buffer (`0 bytes`).
- In JavaScript, if `stdout` is split:
  ```javascript
  const rows = stdout.toString('latin1').split('\n');
  if (rows.length > 0 && rows[rows.length - 1] === '') rows.pop();
  ```
  - For empty output: `"".split('\n')` yields `[""]`. Popping the trailing `""` leaves `[]` (length 0).
  - For $N$ paths: output has $N$ lines, each ending in `\n`. Splitting yields $N+1$ items where the $(N+1)$-th item is `""`. Popping the trailing empty element leaves exactly the $N$ path strings.
  - Applying `spec.regexes.every(re => re.test(row))` to each row filters the paths accurately.
  - The length of the filtered array equals the exact count that `grep ... | wc -l` would produce.

#### 2. The Git Grep Line Counting Family (`git grep -h '<pat>' <rev> -- <path> | wc -l`)
- When `git grep` finds matching lines, it outputs the lines directly, each newline-terminated.
- When `git grep` finds **no matches**, git exits with **status 1** and writes 0 bytes to `stdout`.
- In a bash pipeline (`git grep ... | wc -l`), the pipe masks `grep`'s exit code; `wc -l` reads 0 bytes and emits `0`.
- In non-shell execution:
  - If the evaluator failed closed on `status !== 0` for `git grep`, a legitimate zero-match before-measurement would crash with `score_mismatch`!
  - Therefore, status `1` for `git grep` must be recognized as **0 matches** (empty output).
  - Counting occurrences of `0x0A` in `stdout` gives the exact `wc -l` line count directly:
    ```javascript
    let lines = 0;
    for (const byte of stdout) if (byte === 0x0a) lines++;
    return String(lines);
    ```

---

## 5. Basic Regular Expressions (BRE) vs JavaScript RegExp Semantics

The historical counting commands pass patterns to GNU `grep` (operating in default Basic Regular Expression mode). When evaluating in JavaScript without invoking `grep`:

1. **Escaped vs Unescaped Metacharacters:**
   - In GNU `grep` BRE:
     - Characters `+`, `?`, `(`, `)`, `{`, `}`, `|` are **literal characters**, NOT regex metacharacters, unless escaped with `\`.
     - In JavaScript RegExp: `+`, `?`, `(`, `)`, `{`, `}`, `|` are active metacharacters.
     - Therefore, literal pattern characters must have these characters escaped (`char.replace(/[+?(){}|]/g, '\\$&')`) when converted to JavaScript `RegExp`.
2. **Wildcards and Anchors:**
   - Character `.` matches any single character in both BRE and JavaScript RegExp.
     For example, in `pstack-20261015-r03`:
     `grep '.txt'` matches any character followed by `txt` (matching the dot before `txt` in `refusal.txt`).
   - Character `^` anchors the start of line; `$` anchors the end of line.
     In the fixture pattern `'^marker: admitted-round$'`, `^` and `$` are line anchors in both BRE and JavaScript RegExp.
3. **Option Injection Prevention:**
   - In shell execution, a pattern beginning with `-` (e.g., `-v`, `--file`) would be parsed as an option by GNU `grep`.
   - In the non-shell evaluator, passing `-e` explicitly (`spawnSync('git', ['grep', '-h', '-e', pattern, ...])`) and validating that patterns do not begin with `-` prevents command option injection entirely.

---

## 6. Security & Invariant Analysis: Why Non-Shell Evaluation is Lawful

### The Shell Injection Vulnerability
In the legacy implementation:
```javascript
function runCount(root, command) {
  const result = spawnSync('bash', ['-c', command], { cwd: root, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
  return result.stdout.trim();
}
```
The guard check was:
```javascript
if (!command.startsWith('git ') || /[;&`<>\n\\]|\$[({]/.test(command)) fail('missing_score', ...);
```
**Defect:** The denylist did **not** block the pipe symbol (`|`).
Consequently, any `command:` in `SCORECARD.md` could append arbitrary commands via pipes:
- `git ls-tree -r --name-only <rev> | sh -c 'malicious code' | wc -l`
- `git ls-tree -r --name-only <rev> | tee /tmp/marker | wc -l`
- `git -c alias.m='!sh payload.sh' m <rev> | wc -l`
- Output forging: `git ls-tree ... | echo 1` could defeat `score_mismatch` regardless of actual repository state.

### The Non-Shell Resolution
Both `scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs` eliminate `bash -c` completely:
1. Closed Grammar Allowlist:
   - Form 1: `git ls-tree -r --name-only <40-hex-rev> | grep <pat1> [| grep <pat2>] | wc -l`
   - Form 2: `git grep -h '<pat>' <40-hex-rev> -- <path> | wc -l`
2. Direct Child Process Invocation:
   - Calls `spawnSync('git', argv)` directly with verified arguments.
   - Validates that revision is strictly `/^[a-f0-9]{40}$/`.
   - Validates that paths are relative repository paths without traversal (`..`) or leading dashes (`-`).
3. Internal Evaluation:
   - Evaluates grep patterns in-process.
   - Evaluates line counting in-process using exact newline semantics.
4. Preserved Red Findings:
   - `scripts/check-user-round-contract.mjs` expects 10 user rounds, but only 6 exist in `corpus/lessons/`.
   - It fails at line 476 with `round_count: Found 6 user rounds, expected 10`.
   - The non-shell evaluator strictly preserves this honest failure (`verdict=failed finding=round_count`).
5. Preserved Green Findings:
   - `scripts/check-round-contract.mjs` production check evaluates all 10 historical pstack rounds and outputs `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`.

---

## 7. Concrete Verification Commands for L1 (Main Agent)

When all round-14 seats land, L1 should run the following commands to verify C1 operability:

1. **Verify Round Gate Self-Test:**
   ```bash
   node scripts/check-round-contract.mjs --self-test
   ```
   *Expected Outcome:* Exits `0`. Output ends with `ROUND_CONTRACT_SELFTEST verdict=clean cases=26 alias_checks=1` (or updated case count with new count test cases), including `no_marker=1` on all malicious command mutation cases.

2. **Verify Round Gate Production Check:**
   ```bash
   node scripts/check-round-contract.mjs
   ```
   *Expected Outcome:* Exits `0`. Logs 10 pstack rounds with matching `before=0` and matching `after` values (`1`, `2`, or `4`), ending with `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`.

3. **Verify User Gate Self-Test:**
   ```bash
   node scripts/check-user-round-contract.mjs --self-test
   ```
   *Expected Outcome:* Exits `0`. Output ends with `USER_ROUND_CONTRACT_SELFTEST verdict=clean`.

4. **Verify User Gate Production Check (Honest Baseline Red):**
   ```bash
   node scripts/check-user-round-contract.mjs
   ```
   *Expected Outcome:* Exits `1`. Output reports `USER_ROUND_CONTRACT verdict=failed finding=round_count` ("Found 6 user rounds, expected 10"). Preserves the carried debt without falsification.

5. **Verify Freshness Witness Invariant:**
   ```bash
   node scripts/check-freshness.mjs --worktree
   ```
   *Expected Outcome:* Exits `0`. Reports `FRESHNESS_GATE verdict=clean matched=34 unique=34`.
