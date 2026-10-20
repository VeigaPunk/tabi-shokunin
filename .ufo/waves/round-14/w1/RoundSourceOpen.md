# RoundSourceOpen Scout Report: Opening check-round-contract.mjs & Historical SCORECARD Grammar

- **Seat**: `TabiR14.RoundSourceOpen` (Leaf Scout subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Target**: Open `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs` and historical SCORECARD commands as own-work source. Recommend exact S029 source row tierA scope narrow non-shell evaluator; quote ≤25 words located in current implementation and access date 2026-10-20. Source row only after implementation source opened by L1; do not edit registry.
- **Report Path**: `.ufo/waves/round-14/w1/RoundSourceOpen.md`

---

## 1. Godspeed Axes

1. **Operability**: Evaluates the C1 operability claim (elimination of lane-authored SCORECARD shell execution in legacy gates). Grounds the non-shell counting engine that validates closed pipeline tokenization without invoking `/bin/bash`.
2. **Freshness**: First-hand read-only opening of `scripts/check-round-contract.mjs` and historical `SCORECARD.md` command blocks on 2026-10-20.
3. **Calibration**: Distinct separation between historical counting semantics (git-blob line counts) and general shell execution. No synthetic score inflation; exact preservation of baseline red/green verdicts.
4. **Coverage**: Comprehensive enumeration of historical SCORECARD command structures across all `pstack-20261015-r01..r10` and `user-20261015-r01..r06` rounds, plus both gate self-test fixture commands.
5. **Depth**: Enforces the bottom rung of the evidence ladder: structural, deterministic command tokenization over git blobs rather than unconstrained process execution under shell interpretation.
6. **Adjacency**: Confining scope to own-lane contracts; strictly avoiding modification of sibling files, fleet manifests, or the `corpus/SOURCES.md` registry.

---

## 2. Analysis of Historical SCORECARD Counting Commands

A complete audit of `SCORECARD.md` reveals that historical counting commands adhere to a strictly bounded, non-shell grammar. Two primary command archetypes exist across all committed rounds:

### Archetype 1: `git ls-tree` Pipeline (Committed Tree Counts)
- **Structure**: `git ls-tree -r --name-only <REV> | grep <PATTERN> [| grep <PATTERN>]* | wc -l`
- **Historical Occurrences in `SCORECARD.md`**:
  - `pstack-20261015-r01` (`SCORECARD.md:242`): `git ls-tree -r --name-only f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8 | grep pstack-20261015-r01/public/capture.json | wc -l`
  - `pstack-20261015-r02` (`SCORECARD.md:250`): `git ls-tree -r --name-only 6a91f68af5ac5135b6b753c947b12c72e54794ef | grep pstack-20261015-r02/replay- | grep receipt.txt | wc -l`
  - `pstack-20261015-r03` (`SCORECARD.md:258`): `git ls-tree -r --name-only a19c6a90a0fb0e00729fd895c3c136ac4305f877 | grep pstack-20261015-r03/boundary/ | grep '.txt' | wc -l`
  - `pstack-20261015-r04` (`SCORECARD.md:266`): `git ls-tree -r --name-only 3e3ba9e90d4bf04d5743652e72a9252f81877122 | grep corpus/knowledge/example-domain-observation.md | wc -l`
  - `pstack-20261015-r05` (`SCORECARD.md:274`): `git ls-tree -r --name-only 2e4cba06a07ff7f50a7aee6688644217eec64128 | grep pstack-20261015-r05/replay/receipt.txt | wc -l`
  - `pstack-20261015-r06` (`SCORECARD.md:282`): `git ls-tree -r --name-only ef51deddbb3c649ae3931f011757e3eb9d340ad9 | grep pstack-20261015-r06/operability/selftest-receipt.txt | wc -l`
  - `pstack-20261015-r07` (`SCORECARD.md:290`): `git ls-tree -r --name-only ec5ee4bd51a35fe964fe63b73ab356c27530e464 | grep pstack-20261015-r07/boundary/refusal-receipt.txt | wc -l`
  - `pstack-20261015-r08` (`SCORECARD.md:298`): `git ls-tree -r --name-only 472bfc33de340035be5fa001f4e6685b79be4a64 | grep pstack-20261015-r08/calibration/pin-receipt.txt | wc -l`
  - `pstack-20261015-r09` (`SCORECARD.md:306`): `git ls-tree -r --name-only e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2 | grep corpus/knowledge/loopback-pin-stability.md | wc -l`
  - `pstack-20261015-r10` (`SCORECARD.md:314`): `git ls-tree -r --name-only 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2 | grep pstack-20261015-r10/replay/receipt.txt | wc -l`
  - `user-20261015-r01..r06` (`SCORECARD.md:336, 344, 353, 361, 369, 377`): all follow the same single-grep `git ls-tree` shape.

### Archetype 2: `git grep` Pipeline (Fixture Blob Content Counts)
- **Structure**: `git grep -h <BRE> <REV> -- <PATH> [<PATH>...] | wc -l`
- **Occurrences**:
  - `scripts/check-round-contract.mjs:507`: `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l`
  - `scripts/check-user-round-contract.mjs:580`: `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l`

### Vulnerability of Baseline Evaluator
In baseline commit `bebe2efc4565bb068efd905e9ef78011bb6b4efd`, both gates (`check-round-contract.mjs:292-296` and `check-user-round-contract.mjs:310-314`) implemented `runCount` via:
```javascript
function runCount(root, command) {
  const result = spawnSync('bash', ['-c', command], { cwd: root, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
  return result.stdout.trim();
}
```
Although `parseScore` checked `!command.startsWith('git ') || /[;&`<>\n\\]|\$[({]/.test(command)`, the command was still evaluated in a full bash shell. Passing unquoted pipes (`|`) allowed arbitrary piped processes, subshell evaluations, and option injection into downstream binaries.

---

## 3. Current Implementation: Narrow Non-Shell Evaluator

The round-14 implementation replaces `bash -c` with direct, structured tokenization and AST-like execution in `scripts/check-round-contract.mjs:301-446`:
1. **Pipeline Tokenization (`countStages`)**: Splices `command` on spaces and unquoted pipes `|`, stripping outer single quotes `'...'` while strictly forbidding inner shell metacharacters (`;&<>`\\$`).
2. **Grammar Restriction (`runCount`)**:
   - The final stage must strictly be `wc -l`.
   - The first stage must start with `git ls-tree` or `git grep`.
   - For `git ls-tree`: intermediate stages must strictly be `grep <BRE>` filters, and `git` is executed with discrete arguments `['ls-tree', '-r', '--name-only', rev]`. Output lines are filtered using in-memory basic regexes (`breMatcher`), counting matches in JS.
   - For `git grep`: exactly two stages (`git grep` and `wc -l`), where `git` is invoked directly with `['grep', '-h', '-e', pattern, rev, '--', ...paths]` in binary mode, counting `\n` (0x0A) bytes directly.
3. **Zero Shell Execution**: No process ever receives a shell string; `spawnSync('bash', ...)` is entirely eliminated.

---

## 4. Exact Located Quotations (Each Quote ≤ 25 Words)

### Primary Quotation (Design Invariant & Error Contract)
- **Location**: `scripts/check-round-contract.mjs:304-305`
- **Anchor**: §Counting grammar specification comment preceding `countStages`
- **Verbatim Text** (22 words):
  > "Tokenize with quote removal only, validate every argv token, and invoke git directly. Any other syntax is score_mismatch before any process starts."
- **Access Date**: `2026-10-20`
- **Significance**: Defines the core contract of the non-shell evaluator—tokenization without shell invocation, fail-closed `score_mismatch` on any unauthorized grammar or option injection.

### Secondary Quotation (Grammar Boundary Definition)
- **Location**: `scripts/check-round-contract.mjs:301-302`
- **Anchor**: §Counting grammar definition
- **Verbatim Text** (20 words):
  > "Historical SCORECARD counting grammar is a closed pipeline, never a shell: git ls-tree -r --name-only <rev> | grep <BRE> | wc -l"
- **Access Date**: `2026-10-20`

### Tertiary Quotation (Pipeline Dispatch Rule)
- **Location**: `scripts/check-round-contract.mjs:439-444`
- **Anchor**: `runCount` head stage router
- **Verbatim Text** (17 words):
  > "if (head[0] === 'git' && head[1] === 'ls-tree') return treeLineCount(root, stages, command);"
- **Access Date**: `2026-10-20`

---

## 5. Recommended Source Row for L1 Integration

### Registry Collision Notice & ID Resolution
- In the initial round-14 wave prompt, this evaluator was designated as candidate ID `S029`.
- However, L1's draft in `corpus/SOURCES.md:43` has already assigned `S029` to `Historical ARIA runtime metadata — corpus/evidence/round-13/aria/receipt.json` for Claim C2.
- Under `scripts/check-sources.mjs:289`, duplicate IDs (`E03`) are strictly forbidden.
- Therefore:
  - If L1 keeps S029 for C2 metadata, the non-shell evaluator row MUST take ID **`S030`**.
  - If L1 re-indexes S029 to the C1 non-shell evaluator, the ARIA metadata row must take `S030`.
- Below, the row is provided with candidate ID `S029` (as requested by the task target) and also mapped to `S030`.

### Critical Recheck Syntax Warning for L1
In `corpus/SOURCES.md:43`, L1 wrote `recheck: on-change`.
**`scripts/check-sources.mjs:322` strictly requires**:
`if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release') addFinding(findings, 'bad_recheck', id, 'recheck_invalid');`
Therefore, `on-change` is **invalid** and triggers gate failure `E09 bad_recheck`. The recheck cadence MUST be `on-release`, `365d`, `90d`, or an ISO date `YYYY-MM-DD`.

### Recommended Row Specification (11 Columns / 13 Pipe Delimiters)

#### As Candidate S029 (Per Task Target):
```markdown
| S029 | Non-shell SCORECARD count evaluator — scripts/check-round-contract.mjs | own-work | A | Narrow non-shell evaluator for historical SCORECARD git counting commands, preserving git-blob line-count semantics without bash execution | scripts/check-round-contract.mjs:301-305, runCount and grammar specification comment | Tokenize with quote removal only, validate every argv token, and invoke git directly; closed pipeline fails closed on shell syntax | mined | 2026-10-20 | on-release | corpus/lessons/round-14.md |
```

#### As S030 (Recommended for Collision-Free Sequencing if C2 Retains S029):
```markdown
| S030 | Non-shell SCORECARD count evaluator — scripts/check-round-contract.mjs | own-work | A | Narrow non-shell evaluator for historical SCORECARD git counting commands, preserving git-blob line-count semantics without bash execution | scripts/check-round-contract.mjs:301-305, runCount and grammar specification comment | Tokenize with quote removal only, validate every argv token, and invoke git directly; closed pipeline fails closed on shell syntax | mined | 2026-10-20 | on-release | corpus/lessons/round-14.md |
```

### Column Field Breakdown:
1. `id`: `S029` (or `S030`)
2. `source`: `Non-shell SCORECARD count evaluator — scripts/check-round-contract.mjs`
3. `kind`: `own-work` (valid enum per `scripts/check-sources.mjs:26`)
4. `tier`: `A` (valid tier per `scripts/check-sources.mjs:27`; own-work at tier A is valid and not tier inflation)
5. `scope`: `Narrow non-shell evaluator for historical SCORECARD git counting commands, preserving git-blob line-count semantics without bash execution`
6. `anchor`: `scripts/check-round-contract.mjs:301-305, runCount and grammar specification comment`
7. `teaches`: `Tokenize with quote removal only, validate every argv token, and invoke git directly; closed pipeline fails closed on shell syntax`
8. `status`: `mined` (or `queued` if not yet cited in lesson)
9. `opened`: `2026-10-20` (valid ISO date)
10. `recheck`: `on-release` (valid cadence per `check-sources.mjs:322`; replaces invalid `on-change`)
11. `used-by`: `corpus/lessons/round-14.md` (must contain standalone token `S029` or `S030` to satisfy `check-sources.mjs:232`)

---

## 6. Registry Immutability & Safety Attestation

- **Zero Registry Mutations**: In accordance with the mandate (*"Source row only after implementation source opened by L1; do not edit registry"*), `corpus/SOURCES.md` was inspected read-only. No edits were made to the registry.
- **Zero Protected Path Mutations**: No modifications were made to `SHONEN.md`, `corpus/evidence/pstack-20261015/baseline-census.tsv`, or any protected historical evidence.
- **Zero Subagent Dispatches**: Single leaf execution bounded to this scout role.
- **Single Report Write**: Output written exclusively to `.ufo/waves/round-14/w1/RoundSourceOpen.md`.
- **Tool Installs**: Zero tools installed or updated.

---

## 7. Recommended Verification Commands for L1

L1 should execute the following verification pipeline once all wave deliverables land:

```sh
# 1. Verify sources registry integrity (must exit 0 with clean findings)
node scripts/check-sources.mjs --repo .

# 2. Verify legacy round contract with non-shell evaluator self-tests
node scripts/check-round-contract.mjs --self-test

# 3. Verify user round contract self-tests
node scripts/check-user-round-contract.mjs --self-test

# 4. Verify C1 legacy witness against committed baseline blob
node scripts/check-round-contract.mjs --witness b2eb8316f41cd1039330e45f6739c07c5f11eace

# 5. Verify C1 user count witness against immediate shell-bearing gate
node scripts/check-user-round-contract.mjs --count-witness 7df3ee9f4df6db3c36c886f9173715bc299ce43a

# 6. Run round-14 measurement harness
node .ufo/waves/round-14/measure.mjs
```
