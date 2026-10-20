# GateGrammar — Round-14 UFO-FSD Scout Report

- **Seat**: `TabiR14.GateGrammar` (Leaf UFO-FSD Scout subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Scope**: Read-only exact historical SCORECARD command grammar, token variations, byte/newline semantics, and gate fixture patterns for C1 in `tabi-shokunin`.
- **Report Path**: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/w1/GateGrammar.md`

---

## 1. Naming the Axes (Godspeed Posture)

Under the Godspeed posture and `AXES.md` charter, the six ordinal axes and three learning trends are evaluated for Round 14:

| Axis | Baseline Scalar | Target Scalar | Impact of Round-14 Moves | Role in Round 14 |
|---|---|---|---|---|
| **Operability** | 8 | 8 | **Improved (C1)** | Directly worked by C1: eliminates host `bash -c` execution of lane-authored SCORECARD counting commands in both legacy gates (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`), replacing shell evaluation with a strict non-shell parser/evaluator. Operability is a lowest tied axis (8), fulfilling the lowest-axis obligation. |
| **Calibration** | 9 | 9 | **Improved (C2)** | Directly worked by C2: provides an independently checked, qualified derived metadata sidecar resolving historical Round-13 cleanup summary inversion (`listeningAfter: false`) and Node metadata (`26.12.0` observed vs `24.21.0` recorded), without altering historical bytes or claiming new browser execution. |
| **Depth** | 8 | 8 | **Unchanged / Protected** | Grounded in exact POSIX `wc -l` newline-counting byte semantics, git object blob retrieval, and BRE pattern matching. |
| **Coverage** | 9 | 9 | **Unchanged / Protected** | Preserves all historical pstack rounds (r01–r10) and user rounds (r01–r06). Spurious coverage expansion is explicitly prohibited for the derived C2 sidecar. |
| **Freshness** | 8 | 8 | **Unchanged / Protected** | Re-verification checks (`scripts/check-freshness.mjs`) remain intact; historical pins and timestamps are strictly preserved. |
| **Adjacency** | 8 | 8 | **Unchanged / Protected** | Strict domain perimeter maintained: Tabi declines generic test runner or security ownership, leaves parent protocol debt explicitly acknowledged, and performs zero sibling writes. |
| *Expansion (trend)* | — | — | **Protected** | Knowledge map remains intact (32 notes); no false capability credit claimed. |
| *Quality (trend)* | — | — | **Improved** | Cites and resolves routed defects from `round-13-verifier-spotcheck.md:158-161` without revising history. |
| *Discernment (trend)* | — | — | **Improved** | Keeps USER production red (`round_count 6/10`); treats analytical derivation as distinct from live execution. |

---

## 2. Exhaustive Enumeration of Historical SCORECARD Commands

All counting commands in `/home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md` were inspected. They fall into two historical continuation blocks:
1. `<!-- pstack-round:pstack-20261015-rXX ... -->` (lines 238–316): 10 rounds
2. `<!-- user-round:user-20261015-rXX ... -->` (lines 332–379): 6 rounds

### 2.1 The 10 Historical `pstack-round` Commands

Every `pstack-round` counting command uses `git ls-tree -r --name-only <commit>`.

| Round ID | Measured Commit (`<rev>`) | Before | After | Axis | Full Counting Command | Pipes | Quoting |
|---|---|---|---|---|---|---|---|
| `pstack-20261015-r01` | `f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8` | 0 | 1 | freshness | `git ls-tree -r --name-only f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8 \| grep pstack-20261015-r01/public/capture.json \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r02` | `6a91f68af5ac5135b6b753c947b12c72e54794ef` | 0 | 2 | freshness | `git ls-tree -r --name-only 6a91f68af5ac5135b6b753c947b12c72e54794ef \| grep pstack-20261015-r02/replay- \| grep receipt.txt \| wc -l` | 3 | Unquoted (both) |
| `pstack-20261015-r03` | `a19c6a90a0fb0e00729fd895c3c136ac4305f877` | 0 | 4 | adjacency | `git ls-tree -r --name-only a19c6a90a0fb0e00729fd895c3c136ac4305f877 \| grep pstack-20261015-r03/boundary/ \| grep '.txt' \| wc -l` | 3 | Stage 1 unquoted; Stage 2 single-quoted (`'.txt'`) |
| `pstack-20261015-r04` | `3e3ba9e90d4bf04d5743652e72a9252f81877122` | 0 | 1 | coverage | `git ls-tree -r --name-only 3e3ba9e90d4bf04d5743652e72a9252f81877122 \| grep corpus/knowledge/example-domain-observation.md \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r05` | `2e4cba06a07ff7f50a7aee6688644217eec64128` | 0 | 1 | freshness | `git ls-tree -r --name-only 2e4cba06a07ff7f50a7aee6688644217eec64128 \| grep pstack-20261015-r05/replay/receipt.txt \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r06` | `ef51deddbb3c649ae3931f011757e3eb9d340ad9` | 0 | 1 | operability | `git ls-tree -r --name-only ef51deddbb3c649ae3931f011757e3eb9d340ad9 \| grep pstack-20261015-r06/operability/selftest-receipt.txt \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r07` | `ec5ee4bd51a35fe964fe63b73ab356c27530e464` | 0 | 1 | adjacency | `git ls-tree -r --name-only ec5ee4bd51a35fe964fe63b73ab356c27530e464 \| grep pstack-20261015-r07/boundary/refusal-receipt.txt \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r08` | `472bfc33de340035be5fa001f4e6685b79be4a64` | 0 | 1 | calibration | `git ls-tree -r --name-only 472bfc33de340035be5fa001f4e6685b79be4a64 \| grep pstack-20261015-r08/calibration/pin-receipt.txt \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r09` | `e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2` | 0 | 1 | coverage | `git ls-tree -r --name-only e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2 \| grep corpus/knowledge/loopback-pin-stability.md \| wc -l` | 2 | Unquoted |
| `pstack-20261015-r10` | `4e75a17ebbaa125777ed0d6e745fd150e9c6caf2` | 0 | 1 | freshness | `git ls-tree -r --name-only 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2 \| grep pstack-20261015-r10/replay/receipt.txt \| wc -l` | 2 | Unquoted |

### 2.2 The 6 Historical `user-round` Commands

Every `user-round` counting command uses `git ls-tree -r --name-only <commit>`.

| Round ID | Measured Commit (`<rev>`) | Before | After | Axis | Full Counting Command | Pipes | Quoting |
|---|---|---|---|---|---|---|---|
| `user-20261015-r01` | `95ea5f8b98ae4cf8ee651bf46709570114f50edd` | 0 | 1 | operability | `git ls-tree -r --name-only 95ea5f8b98ae4cf8ee651bf46709570114f50edd \| grep user-20261015-r01/operability/selftest-receipt.txt \| wc -l` | 2 | Unquoted |
| `user-20261015-r02` | `59ba8da019400c1a3b14bc2c19746a457f791601` | 0 | 1 | adjacency | `git ls-tree -r --name-only 59ba8da019400c1a3b14bc2c19746a457f791601 \| grep user-20261015-r02/boundary/refusal-receipt.txt \| wc -l` | 2 | Unquoted |
| `user-20261015-r03` | `8a869af00665e8e445bc84c50492433097c55866` | 0 | 1 | calibration | `git ls-tree -r --name-only 8a869af00665e8e445bc84c50492433097c55866 \| grep user-20261015-r03/calibration/pin-compare.txt \| wc -l` | 2 | Unquoted |
| `user-20261015-r04` | `982e3b2d53569fe3494d5f589384ce789ea52a20` | 0 | 1 | coverage | `git ls-tree -r --name-only 982e3b2d53569fe3494d5f589384ce789ea52a20 \| grep corpus/knowledge/user-public-observation.md \| wc -l` | 2 | Unquoted |
| `user-20261015-r05` | `c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7` | 0 | 1 | depth | `git ls-tree -r --name-only c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7 \| grep user-20261015-r05/depth/paragraph-receipt.txt \| wc -l` | 2 | Unquoted |
| `user-20261015-r06` | `1229098dae56c2d193c01203ff93651da2853f6e` | 0 | 1 | freshness | `git ls-tree -r --name-only 1229098dae56c2d193c01203ff93651da2853f6e \| grep user-20261015-r06/freshness/replay-receipt.txt \| wc -l` | 2 | Unquoted |

---

## 3. Enumeration of Gate Fixture Command Grammar

Both legacy gate scripts contain test fixture generators (`writeGoodFixture`) that synthesize temporary Git repositories to run self-tests. Crucially, the fixture generators do **not** generate `git ls-tree` commands. Instead, they generate `git grep -h`:

### 3.1 `scripts/check-round-contract.mjs` Fixture Command

Located at `scripts/check-round-contract.mjs:507` (or line 647 in modified version):
```javascript
const command = `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l`;
```
- **Stage 0 (`git grep`)**:
  - `argv[0]`: `'git'`
  - `argv[1]`: `'grep'`
  - `argv[2]`: `'-h'` (suppress filename prefixes)
  - `argv[3]`: `'^marker: admitted-round$'` (single-quoted string in shell command; stripped to `^marker: admitted-round$` when parsed)
  - `argv[4]`: `${measured}` (40-hex commit hash)
  - `argv[5]`: `'--'` (pathspec separator)
  - `argv[6]`: `'round-marker.txt'` (target repository path)
- **Stage 1 (`wc -l`)**:
  - `argv[0]`: `'wc'`
  - `argv[1]`: `'-l'`

### 3.2 `scripts/check-user-round-contract.mjs` Fixture Command

Located at `scripts/check-user-round-contract.mjs:580` (or line 590 in modified version):
```javascript
const command = `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l`;
```
- Identical structure to Section 3.1, with pattern `'^marker: admitted-user-round$'` and target `'round-marker.txt'`.

---

## 4. Observed Grammatical Patterns & Token Variations

Across all 16 historical SCORECARD entries and both fixture generators, the universe of legitimate counting commands consists of exactly three closed syntactic forms:

### Pattern A: Single-Filter Tree Count (14 historical entries)
```text
git ls-tree -r --name-only <REV> | grep <PATTERN> | wc -l
```
- **Stages**: Exactly 3 stages separated by ` | `.
- **Tokens**:
  - Stage 0: `git`, `ls-tree`, `-r`, `--name-only`, `<REV>` (40-hex lowercase SHA-1).
  - Stage 1: `grep`, `<PATTERN>` (unquoted relative path or substring, matching `/^[A-Za-z0-9_./-]+$/`).
  - Stage 2: `wc`, `-l`.
- **Rounds observed**:
  - `pstack-20261015-r01, r04, r05, r06, r07, r08, r09, r10`
  - `user-20261015-r01, r02, r03, r04, r05, r06`

### Pattern B: Chained-Filter Tree Count (2 historical entries)
```text
git ls-tree -r --name-only <REV> | grep <PATTERN1> | grep <PATTERN2> | wc -l
```
- **Stages**: Exactly 4 stages separated by ` | `.
- **Tokens**:
  - Stage 0: `git`, `ls-tree`, `-r`, `--name-only`, `<REV>`.
  - Stage 1: `grep`, `<PATTERN1>` (e.g. `pstack-20261015-r02/replay-`, `pstack-20261015-r03/boundary/`).
  - Stage 2: `grep`, `<PATTERN2>` (e.g. unquoted `receipt.txt` in r02; single-quoted `'.txt'` in r03).
  - Stage 3: `wc`, `-l`.
- **Quoting variation**:
  - `pstack-20261015-r02`: Both patterns unquoted.
  - `pstack-20261015-r03`: First pattern unquoted (`pstack-20261015-r03/boundary/`), second pattern single-quoted (`'.txt'`).
- **Whitespace**: Exactly one space ` ` before and after each pipe character `|`. Zero leading or trailing spaces.

### Pattern C: Content Grep Count (2 fixture entries)
```text
git grep -h '<PATTERN>' <REV> -- <PATH> | wc -l
```
- **Stages**: Exactly 2 stages separated by ` | `.
- **Tokens**:
  - Stage 0: `git`, `grep`, `-h`, `'<PATTERN>'`, `<REV>`, `--`, `<PATH>`.
  - Stage 1: `wc`, `-l`.
- **Quoting**: The pattern is quoted with single quotes (`'...'`).
- **Anchors**: Uses BRE line anchors: `^` (start-of-line) and `$` (end-of-line).
- **Separators**: Uses `--` before `<PATH>`.
- **Target path**: Relative repository path without `..` or leading `/` or `-`.

### Token Rules Summary:
1. **Revisions**: Strictly 40-character hex strings (`/^[a-f0-9]{40}$/`).
2. **Patterns**: Printable ASCII (`/^[\x20-\x7e]+$/`), no leading `-` (to prevent option injection), no shell metacharacters (`;&<>`\\$({}`).
3. **Paths**: Relative file paths (`/^[A-Za-z0-9_./@%+-]+$/`), no leading `-`, no leading `/`, no `..` path components.
4. **Pipes**: Only `|` acting as stage delimiter; no `||`, no redirection (`>`, `<`), no backgrounding (`&`), no command sequencing (`;`).
5. **No Double Quotes**: Zero instances of double quotes `"` exist across all historical rows and fixtures. Single quotes `'` occur only in `pstack-r03` (`'.txt'`) and the fixture generators (`'^marker: ...$'`).

---

## 5. Byte and Newline Semantics

To reproduce exact historical line-counting behavior without a shell, evaluators must respect the exact byte-level behavior of Git and POSIX `wc -l`:

### 5.1 `git ls-tree` Output & Trailing Newline
- `git ls-tree -r --name-only <rev>` writes file paths separated by LF (`\n`, `0x0A`).
- If one or more files match, the output terminates with a trailing `\n`.
- If zero files exist in the tree, output is empty (0 bytes).
- **Node.js String Splitting Trap**:
  - When splitting stdout by newline: `const lines = stdout.split('\n');`.
  - If stdout is `"foo\nbar\n"`, `stdout.split('\n')` produces 3 elements: `['foo', 'bar', '']`.
  - The trailing empty string `''` is an artifact of the trailing LF delimiter!
  - If not popped, an empty string element would falsely match regular expressions that match empty strings (such as `^.*$`), resulting in an off-by-one line count.
  - **Required Invariant**: Evaluators MUST strip or pop the trailing empty string:
    ```javascript
    const lines = stdout.split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    ```

### 5.2 POSIX `wc -l` Semantics
- `wc -l` counts the number of NEWLINE (`0x0A`) characters in its standard input stream.
- Incomplete lines (characters appearing after the last `0x0A` without a terminating `\n`) are deliberately ignored by POSIX `wc -l`.
- The final count returned by the legacy pipeline was `result.stdout.trim()`, yielding clean integer strings (`"0"`, `"1"`, `"2"`, `"4"`, `"32"`).

### 5.3 `git grep` Exit Codes: Status 1 vs Status > 1
- When `git grep` finds ≥1 matching lines, it exits with code `0` and emits matching lines to stdout.
- When `git grep` finds 0 matching lines, it exits with code `1` and emits 0 bytes to stdout.
- In the legacy bash pipeline (`git grep ... | wc -l`), `wc -l` consumed 0 bytes and exited with code `0`. Because bash ran without `pipefail`, the pipeline exited with code `0` and printed `0`.
- **Direct Process Invocation Hazard**:
  - If a gate script directly invokes `spawnSync('git', ['grep', ...])`:
  - `result.status === 1` is **NORMAL** and represents **0 matching lines** (e.g. during `beforeCommand` evaluation at baseline where the marker commit has not yet introduced the marker line).
  - If an evaluator rejects `result.status !== 0`, all `beforeCommand` checks fail!
  - However, if `result.status > 1` (e.g. status 128 for a non-existent commit or corrupt tree), this is a fatal Git error.
  - **Required Invariant**: Evaluators MUST distinguish status 1 from status > 1:
    ```javascript
    if (result.error || (result.status !== 0 && result.status !== 1)) {
      fail('score_mismatch', `Counting command failed: ${command}`);
    }
    if (result.status === 1) return '0';
    ```

### 5.4 BRE (Basic Regular Expression) Semantics
- `grep` in the legacy pipeline ran in default BRE mode.
- In BRE, `.` matches any single character (except newline). In `grep '.txt'`, `.` matches `.` as well as any other character.
- Literal path characters (`/`, `-`, `_`, `.`, `A-Z`, `a-z`, `0-9`) require no special escaping in BRE.
- In JS RegExp, metacharacters such as `+`, `?`, `(`, `)`, `{`, `}`, `|` have special syntactic meanings. Since historical patterns do not use extended regex groups, converting BRE to JS RegExp requires escaping JS metacharacters while preserving `.` (wildcard) and `^`/`$` (anchors).

---

## 6. Audit of Gate Checker Implementations

Both legacy gate scripts were inspected in their current working tree state:

### 6.1 `scripts/check-round-contract.mjs` (RoundCounter's Implementation)
- **Token Parser**: Implemented via `countStages(command)`:
  - Tokenizes arguments, respecting single quotes and pipes.
  - Rejects unbalanced quotes, adjacent concatenated quotes, and shell syntax within quotes.
  - Restricts word tokens to `COUNT_WORD = /^[A-Za-z0-9_./:=@%+,^-]+/`.
- **Validation Functions**:
  - `countRevision`: Enforces `/^[a-f0-9]{40}$/`.
  - `countPath`: Enforces relative repo path, rejects leading `-` or `/`, rejects `..` components.
  - `countPattern`: Printable text, rejects leading `-`.
  - `breMatcher`: Maps BRE anchors (`^`, `$`), wildcard (`.`), and escapes JS metacharacters.
- **Line Counting**:
  - `treeLineCount`: Invokes `git ls-tree -r --name-only <rev>`, splits output, pops trailing empty line, applies one or more `grep` filters in sequence, returns `String(kept.length)`.
  - `grepLineCount`: Invokes `git grep -h -e <pattern> <rev> -- <paths...>`, checks `(result.status !== 0 && result.status !== 1)`, returns `'0'` on status 1, counts `0x0A` bytes on status 0.
- **Coverage**: Fully handles Pattern A, Pattern B (multi-filter), and Pattern C (fixtures).

### 6.2 `scripts/check-user-round-contract.mjs` (UserCounter's Implementation)
- **Regex-based Parser**: Implemented via `countingCommand(command)`:
  - `TREE_COUNT = /^git ls-tree -r --name-only ([a-f0-9]{40}) \| grep (?:'([^']*)'|(\S+)) \| wc -l$/;`
  - `GREP_COUNT = /^git grep -h '([^']*)' ([a-f0-9]{40}) -- (\S+) \| wc -l$/;`
- **Identified Differences & Defects**:
  1. **Crucial Error-Handling Bug in `runCount`**:
     In `UserCounter`'s initial revision, `result.status` was not checked:
     ```javascript
     const result = spawnSync('git', args, { cwd: root, timeout: 30000, maxBuffer: 16 * 1024 * 1024 });
     if (result.error) fail('score_mismatch', `Counting command failed: ${command}`);
     ```
     If Git fails with a fatal error (e.g. exit status 128 when a revision does not exist), Git writes to stderr and stdout is empty. Without checking `result.status`, `runCount` counted 0 bytes and returned `'0'` instead of failing!
     *Remediation*: Alerted `UserCounter` to check `if (result.error || (result.status !== 0 && result.status !== 1)) fail(...)`.
  2. **Single-Stage `TREE_COUNT` Limitation**:
     `TREE_COUNT` only matches a single `grep` stage. While all 6 historical user rounds have only 1 grep stage, historical pstack rounds (r02, r03) have 2 chained grep stages.
  3. **Mandatory Single Quotes in `GREP_COUNT`**:
     `GREP_COUNT` requires `'([^']*)'` (single quotes). This matches the fixture generator (`writeGoodFixture`), but would reject an unquoted `git grep` pattern if one were authored.

---

## 7. Coordination & Direct Peer Messages Sent

In accordance with leaf coordination guidelines, bounded findings were messaged directly to `TabiR14.RoundCounter` and `TabiR14.UserCounter`:

### Message to `TabiR14.RoundCounter` (`agent://TabiR14.RoundCounter`):
> GateGrammar findings for ROUND:
> 1. Observed historical grammar: all 10 pstack rounds use `git ls-tree -r --name-only <40-hex-rev>`. 8 have 1 grep stage, 2 (r02, r03) have 2 chained grep stages. Quoting: 9 unquoted, 1 single-quoted (r03: `grep '.txt'`). Zero double quotes. Whitespace: single space around `|` and tokens.
> 2. Fixture generator uses: `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l`. Pattern is single-quoted with BRE `^` and `$` anchors.
> 3. Byte/newline semantics: `git ls-tree` stdout has trailing `\n`; splitting requires popping trailing empty string. `git grep` exits 1 on 0 matches (normal count 0), but exit > 1 (e.g. 128 for non-existent commit or bad path) must fail closed as `score_mismatch`. `wc -l` counts ASCII `0x0A` bytes.
> Full report at .ufo/waves/round-14/w1/GateGrammar.md

### Message to `TabiR14.UserCounter` (`agent://TabiR14.UserCounter`):
> GateGrammar findings for USER:
> 1. Observed historical grammar: all 6 user rounds use `git ls-tree -r --name-only <40-hex-rev> | grep <pattern> | wc -l`. All 6 are unquoted patterns with exactly 1 grep stage.
> 2. Fixture generator uses: `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l`. Note single-quoted pattern with `^` and `$`.
> 3. Crucial safety gap in current UserCounter runCount: `result.status` is not checked; if git exits > 1 (e.g. fatal status 128 on bad rev/path), stdout is empty so it currently returns '0' instead of failing! Must fail on `result.error || (result.status !== 0 && result.status !== 1)`. When status === 1, return '0'.
> 4. Token variations: `GREP_COUNT` regex in UserCounter currently requires single quotes `'([^']*)'`. Chained greps (`| grep A | grep B`) exist in pstack r02/r03; consider supporting them or keeping strict for user rounds.
> 5. Byte/newline: `wc -l` counts `0x0A` bytes; ls-tree output ends with `\n` so trailing empty string from split('\n') must be dropped.
> Full report at .ufo/waves/round-14/w1/GateGrammar.md

---

## 8. Verification Instructions for L1 (Post-Handoff)

As a leaf agent, no tests or builds were executed during this investigation. Once all seats land, L1 should run the following commands to verify C1:

1. **Verify Self-Tests of Both Legacy Gates**:
   ```bash
   node scripts/check-round-contract.mjs --self-test
   node scripts/check-user-round-contract.mjs --self-test
   ```
   *Expected Output*: Both gates report `verdict=clean` with passing test tallies and exit code 0.

2. **Verify Production Execution of Both Legacy Gates**:
   ```bash
   node scripts/check-round-contract.mjs
   node scripts/check-user-round-contract.mjs
   ```
   *Expected Output*:
   - `check-round-contract.mjs`: `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`, exit code 0.
   - `check-user-round-contract.mjs`: `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`, exit code 1 (preserving historical red finding).

3. **Verify Regression Witnesses**:
   ```bash
   node scripts/check-round-contract.mjs --witness b2eb8316f41cd1039330e45f6739c07c5f11eace
   node scripts/check-user-round-contract.mjs --witness 18e2c79ada4258cc46af7696e98907299b77c431
   ```
   *Expected Output*: Both witnesses confirm `history_rewritten` (old) -> `clean` (new) transition with exit code 0.

4. **Verify No `bash` Invocation in Counting Paths**:
   ```bash
   git grep "spawnSync('bash'" scripts/check-round-contract.mjs scripts/check-user-round-contract.mjs
   ```
   *Expected Output*: Zero occurrences (exit 1).
