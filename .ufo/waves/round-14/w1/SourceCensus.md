# SourceCensus Scout Report: SOURCES.md Census, Contract & Curation for Round 14

- **Seat**: `TabiR14.SourceCensus` (Leaf Scout subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Target**: Read-only `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` contract/census before28 A22/B4/C2 mined23 queued3 rejected2. Recommend source curation per C1/C2, immutable cells and exact used-by transitions; no own edit.
- **Report Trailer Path**: `.ufo/waves/round-14/w1/SourceCensus.md`
- **Full Report Path**: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/w1/SourceCensus.md`

---

## 1. Godspeed Axes

1. **Calibration**: Strict epistemic classification of source authority across claims C1 (Operability) and C2 (Calibration). Distinguishes immutable cells from mutable fields, enforces the prohibition against claiming runtime capabilities or accessibility audits from documentation/metadata sources, and catches invalid gate-breaking cadence entries before commit.
2. **Coverage**: Comprehensive census accounting across all 28 baseline registry rows (`S001`–`S028`) and newly introduced candidate rows (`S029`/`S030`). Exact quantification of tier histograms (A, B, C) and status distributions (mined, queued, rejected).
3. **Freshness**: First-hand, read-only audit of `corpus/SOURCES.md`, `scripts/check-sources.mjs`, `scripts/sources-census.sh`, `CORPUS.md` contract v1, and current working-tree modifications on 2026-10-20.
4. **Operability**: Zero own edits to registry or historical files; leaf member role; non-executing census analysis; concrete commands for L1.
5. **Depth**: Preserving the four-rung evidence ladder (Synthetic → Transport/Network → State/Structure → Rendered/Visual). Enforces strict structural compliance with `SOURCES-CONTRACT-v1` (11 columns / NF=13, regex tokens).
6. **Adjacency**: Confining scope to own-lane contracts; strictly avoiding modification of sibling files, fleet manifests, or the `corpus/SOURCES.md` registry.

---

## 2. Census Baseline (`before28 A22/B4/C2 mined23 queued3 rejected2`)

The baseline state at commit `bebe2efc4565bb068efd905e9ef78011bb6b4efd` is preserved in `.ufo/waves/round-14/before.json` and verified through read-only inspection of `corpus/SOURCES.md:14-42`:

### 2.1 Baseline Row Inventory
- **Total Rows**: 28 (`S001` through `S028`)
- **Tiers**:
  - **Tier A** (22 rows): `S001, S002, S003, S004, S005, S008, S009, S010, S011, S012, S013, S014, S015, S016, S017, S018, S020, S021, S023, S024, S025, S028`
  - **Tier B** (4 rows): `S006, S007, S019, S022`
  - **Tier C** (2 rows): `S026, S027`
  - *Sum*: 22 + 4 + 2 = **28**
- **Statuses**:
  - **mined** (23 rows): `S001, S002, S003, S004, S005, S006, S007, S008, S009, S010, S011, S012, S013, S014, S015, S016, S017, S018, S019, S023, S024, S025, S028`
  - **queued** (3 rows): `S020, S021, S022`
  - **rejected** (2 rows): `S026, S027`
  - *Sum*: 23 + 3 + 2 = **28**

### 2.2 Baseline Validation Gate
- Baseline check command:
  ```sh
  /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
  ```
- Baseline stdout: `tabi\tok\t/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md\n`
- Baseline exit: `0` (clean, 0 findings)

---

## 3. C1 Operability Source Curation (Eliminating SCORECARD Shell Execution)

### 3.1 C1 Claim Scope
Claim C1 eliminates execution of lane-authored SCORECARD shell commands in both legacy gates (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`). It replaces `runCount`'s `spawnSync('bash', ['-c', command])` with a non-shell AST/tokenizer that directly parses git commands (`git ls-tree` and `git grep`) and counts lines/newlines without invoking a shell interpreter.

### 3.2 Curation Recommendation for C1
- **Knowledge vs Refactoring**: In `SOURCES-CONTRACT-v1.md` Rule 4: *"Expansion is knowledge, not rows."* Implementing a non-shell git-blob line counter within gate verification scripts is a code implementation of existing contract rules; it is not external domain knowledge admitted to `corpus/knowledge/`.
- **Own-Work Row Candidate**:
  - `TabiR14.RoundSourceOpen` scouted an own-work row for the non-shell evaluator (`scripts/check-round-contract.mjs:301-305`).
  - If L1 integrates this row, it **MUST take ID `S030`** (since `S029` has already been allocated in L1's working-tree draft for C2 metadata).
  - Specification for candidate `S030`:
    ```markdown
    | S030 | Non-shell SCORECARD count evaluator — scripts/check-round-contract.mjs | own-work | A | Narrow non-shell evaluator for historical SCORECARD git counting commands, preserving git-blob line-count semantics without bash execution | scripts/check-round-contract.mjs:301-305, runCount and grammar specification comment | Tokenize with quote removal only, validate every argv token, and invoke git directly; closed pipeline fails closed on shell syntax | mined | 2026-10-20 | on-release | corpus/lessons/round-14.md |
    ```
  - However, if L1 chooses not to add a source row for C1, this is entirely legitimate: C1's operability is proven by regression CLI self-tests and legacy witness execution against committed blobs, not by adding registry rows.

---

## 4. C2 Calibration Source Curation & Critical Gate Blocker

### 4.1 C2 Claim Scope
Claim C2 is a **calibration** claim (0→1): an independently checked, digest-bound metadata sidecar correcting contradictory historical round-13 runtime metadata (`corpus/evidence/round-13/aria/receipt.json`). It resolves the aggregate server cleanup inversion (`cleanup.server.listeningAfter: true` vs per-worker `false`) and documents the difference between observed Node (`26.12.0`) and descriptive recorded Node (`24.21.0` with `minimumMajor: 20`).

### 4.2 CRITICAL GATE BLOCKER: S029 `recheck` Cadence (`F1 [blocking]`)
In the current working tree draft of `corpus/SOURCES.md:43`, L1 authored:
```markdown
| S029 | Historical ARIA runtime metadata — corpus/evidence/round-13/aria/receipt.json | own-work | A | Exact recorded worker cleanup and observed-versus-descriptive Node metadata, not a new runtime observation | committed at 837b33a3988ebeea7f6b4ef5c04698da88909a73; cleanup.server.perWorker[0].listeningAfter, runtime.node and pin.node | The retained worker records listeningAfter=false while the aggregate says true; observed Node26.12.0 differs from descriptive recorded24.21.0 | mined | 2026-10-20 | on-change | corpus/lessons/round-14.md |
```

#### The Defect
The `recheck` field is set to **`on-change`**.
- In `scripts/check-sources.mjs:322`:
  ```javascript
  if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release') {
    addFinding(findings, 'bad_recheck', id, 'recheck_invalid');
  }
  ```
- `scripts/check-sources.mjs` **strictly refuses `on-change`**! It only permits:
  1. An ISO date string (`YYYY-MM-DD`)
  2. An interval string matching `^[0-9]+d$` (e.g. `90d`, `180d`, `365d`)
  3. The exact literal string `'on-release'`
- Furthermore, `CORPUS.md:105-106` contract v1 defines `recheck` as: *"ISO date or cadence (`90d`, `180d`, `on-release`)"*.
- In `corpus/lessons/round-14.md:21`, the same invalid value is recorded: `"recheck nonexistent→on-change"`.

#### Remediation for L1
1. In `corpus/SOURCES.md:43`, change `on-change` to **`on-release`**.
2. In `corpus/lessons/round-14.md:21`, update the transition log to: `"recheck nonexistent→on-release"`.
3. This is an author-side pre-commit correction of a newly added row, which preserves the immutability of historical rows.

### 4.3 S029 Tier & Scope Boundaries
- **Kind**: `own-work` (valid enum).
- **Tier**: `A`. Valid per `CORPUS.md:93-96`, which permits Tier A for the lane's own gate or evidence output.
- **Scope Limit**: S029's scope is strictly a **field-reading scope**: *"Exact recorded worker cleanup and observed-versus-descriptive Node metadata, not a new runtime observation"*.
- **Prohibition**: S029 must **never** be cited as evidence of new browser runtime execution, browser capability, accessibility audit compliance, or cross-browser compatibility. It is solely an exact observation of committed JSON fields.

### 4.4 Reopened External Sources (S023 & S024)
`TabiR14.PlaywrightSource` reopened primary documentation sources S023 (`playwright.dev/docs/locators`) and S024 (`playwright.dev/docs/aria-snapshots`) on 2026-10-20. The fetched bodies were confirmed byte-identical to historical baselines (`234a2452...` and `bbbad688...`).
These sources enforce five strict epistemic boundaries on C2:
1. **No Accessibility Audit**: S023 explicitly states: *"role locators do not replace accessibility audits and conformance tests"*.
2. **No Runtime Upgrade**: Documentation principles dictate that deriving metadata corrections on existing receipts does not constitute a new browser execution.
3. **Structural Constraint vs Pixels**: S024 defines ARIA snapshots as a *"YAML representation of the accessibility tree"*, which is a structural state constraint (Rung 2), not a visual paint (Rung 3) or network capture (Rung 4).
4. **Template Constraint Semantics**: Default matching mode is `contain` (allowing unlisted sibling elements), and partial matching permits attribute omission. A passing snapshot satisfies declared template constraints only.
5. **Strictness Violations as Ambiguity**: S023 defines strictness violations as truthful findings of DOM ambiguity, not selector defects to be silenced with `.first()`.

---

## 5. Contract for Immutable vs Mutable Cells

Under `SOURCES-CONTRACT-v1` (Rule 2) and `CORPUS.md` §SOURCES.md contract v1:

### 5.1 Immutable Cells (NEVER modified in place)
- `id`: Unique identifier (`S` + 3 or more digits); never reused.
- `source`: Title and canonical URL / DOI / repo path.
- `kind`: Enumeration (`spec`, `docs`, `paper`, `code`, `tool`, `dataset`, `talk`, `book`, `community`, `own-work`).
- `tier`: Scoped rating (`A`, `B`, `C`).
- `scope`: The exact topic/claim the tier applies to.
- `anchor`: Section, heading, line, commit, or revision.
- `teaches`: Grounded learner benefit (or `REJECTED: ... flip: ...`).
- `opened`: ISO date when first opened by author.
- **Rule for Immutable Cells**: If an immutable cell contains an error (e.g., historical paraphrases in S023/S024 teaches, or APG homepage anchor in S025), it can **only** be corrected by appending a new row whose `teaches` begins with `supersedes S0NN —`. In accordance with the round-13 independent closure ruling, these historical defects are retained as carried debt; no supersedes rows are created in round 14.

### 5.2 Mutable Cells (May change in place)
- `status`: `queued` · `mined` · `rejected`.
- `recheck`: ISO date, interval (`NNd`), or symbolic cadence (`on-release`).
- `used-by`: Repo-relative paths of knowledge entries or lessons citing the row, comma-separated, or `—`.
- **Rule for Mutable Cells**: Every in-place change to a mutable cell must be logged `old→new` in the round lesson's `## Gate` section.

---

## 6. Exact `used-by` Transitions

### 6.1 Gate Validation Requirements for `used-by`
Under `scripts/check-sources.mjs:203-241` and `329-341`:
1. Every path must resolve within the lane repository root (no escape).
2. Every path must exist on disk as a regular file (`statSync(candidate).isFile()`).
3. Every path must contain the row ID as a standalone regex token (`(?<![A-Za-z0-9])ID(?![0-9])`).
4. If `status === 'mined'`, `used-by` cannot be empty or `—`.

### 6.2 Round 14 `used-by` Transitions

#### 1. Row S029:
- **Status**: `mined`
- **Transition**: `nonexistent → corpus/lessons/round-14.md`
- **Validation**: `corpus/lessons/round-14.md` exists and cites `S029` as a standalone token at lines 19, 21, and 37. Regex test passes.

#### 2. Rows S023, S024, S025:
- **Current `used-by`**: `corpus/knowledge/playwright-accessible-locators-and-snapshots.md, corpus/knowledge/aria-loopback-round-13.md`
- **Round 14 Reference**: `corpus/lessons/round-14.md:21` cites `S023` and `S024`.
- **Curation Policy**: As established in round 13 (`ReviewSources.txt` §7 and `round-13.md:31`), `used-by` records the admitting knowledge note and key admitting lesson. Exhaustive backfill of every subsequent referencing lesson is explicitly not required: *"the used-by cell remains resolvable cited knowledge, not a second corpus index"*.
- **Recommendation**: Leave `S023, S024, S025` `used-by` cells unchanged. They remain completely valid and resolve clean.

#### 3. Rows S001–S022, S026–S028:
- No changes. All existing paths remain resolvable regular files containing their respective row IDs.

---

## 7. Census Summary: Before vs After Round 14

| State | Total Rows | Tier A | Tier B | Tier C | Status: mined | Status: queued | Status: rejected | Net Knowledge Notes Admitted |
|---|---|---|---|---|---|---|---|---|
| **Before (Baseline)** | 28 | 22 | 4 | 2 | 23 | 3 | 2 | 0 |
| **After (With S029)** | **29** | **23** | **4** | **2** | **24** | **3** | **2** | **0** |
| *(Optional: With S030)* | *30* | *24* | *4* | *2* | *25* | *3* | *2* | *0* |

### Notes on Knowledge Expansion:
- Net knowledge notes admitted: **0**.
- Round 14 delivers Claim C1 (Operability: non-shell legacy counters) and Claim C2 (Calibration: digest-bound metadata sidecar).
- Neither claim creates a new admitted note under `corpus/knowledge/`.
- Adding row S029 represents source curation for derived metadata, not knowledge expansion.

---

## 8. Exact Verification Commands for L1

When all wave seats conclude their handoffs, L1 should run the following commands to verify SOURCES contract compliance and census validity:

```sh
# 1. Verify that S029 recheck has been corrected from on-change to on-release
grep "S029" corpus/SOURCES.md | grep -F "on-release"

# 2. Run the lane's structural sources gate
node scripts/check-sources.mjs

# 3. Run check-sources self-tests to ensure zero gate regression
node scripts/check-sources.mjs --self-test

# 4. Run fleet-level sources census validation
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi

# 5. Confirm S029 citation token presence in round-14 lesson
grep -n -E '(^|[^A-Za-z0-9])S029([^0-9]|$)' corpus/lessons/round-14.md

# 6. Verify row count matches 29 (or 30 if S030 added)
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
```

### Expected Output from Step 2:
```text
SOURCES_GATE verdict=clean rows=29 tiers=A:23,B:4,C:2 status=queued:3,mined:24,rejected:2 findings=0
```
*(If S029 `recheck` is left as `on-change`, Step 2 will fail with `bad_recheck / recheck_invalid`)*.

---

## 9. Safety & Contract Attestation

- **Zero Registry Mutations**: `corpus/SOURCES.md` was inspected strictly read-only. No edits were made to registry rows, headers, or paths by this seat.
- **Zero Protected Path Mutations**: No edits were made to `SHONEN.md`, `baseline-census.tsv`, or historical lesson files.
- **Zero Execution of Authored Checks**: No build, test, linter, or gate check was executed during this authoring phase.
- **Single Report Write**: Output written exclusively to `.ufo/waves/round-14/w1/SourceCensus.md`.
- **Tools Installed**: None.
