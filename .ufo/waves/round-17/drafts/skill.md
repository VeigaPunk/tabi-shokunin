## Round 17 — lane-tip anchoring, freshness witness rule, adjacency, WebMCP invocation (2026-10-20)

Appended after `SKILL.md:1892` (end of file). Nothing above is edited. Markers: `<<SHA>>` = blob/sha256 pinned at integration; `<<C2>>` / `<<C3>>` = receipt or counter output not yet landed. A row carrying a marker is not in force until the L1 fills it. Paths are lane-relative unless absolute.

### Lane-tip anchor rule (C1, jj colocation)

- Lane is jj-colocated. After the first helper commit git HEAD is detached and can name an unlanded commit: `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44-68` (F1: after `jj new`, HEAD `68d0582` is on no branch and both gates still print clean); `:69-94` (F2: after `jj commit`, `HEAD != master`, `@{u}` fails, clean `git status`).
- Gates read committed blobs at HEAD; under jj HEAD can hold snapshot content that is on no branch (`JjAuditTabi.md:95-131`, F3).
- Lane branch = `master` in this lane: `git rev-parse --verify refs/heads/master` = `git rev-parse HEAD` = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` at baseline (`.ufo/waves/round-17/PLAN.md:3-5`). Helper resolution order: attached branch, then `origin/HEAD`, then `master`/`main` (`scripts/hyaku/jj-lane.sh:53-65`); helper state line `jj-lane.sh state <lane>` (`:67-82`).
- Rule: every recorded revision is the lane branch tip, printed as 40-hex. Never record bare `HEAD`, `@{u}`, `--abbrev-ref HEAD` or `branch --show-current` (`.ufo/prompts/tabi-round-17.md:276-280`).
- Read-only lane checks: `git status` rewrites `.git/index` unless `GIT_OPTIONAL_LOCKS=0` (`JjAuditTabi.md:163-183`, F5). Use `GIT_OPTIONAL_LOCKS=0 git status --porcelain`.
- In force only after C1 gates land: `scripts/check-round-contract.mjs`, `scripts/check-user-round-contract.mjs`, `scripts/check-measurement-binding.mjs` (+ selftest) at `<<SHA>>` (`PLAN.md:36-38`, `:58-81`).

### Why not `--witness HEAD` — check-freshness is byte-frozen

- `scripts/check-freshness.mjs` is protected: `scripts/check-round-contract.mjs:102` and `scripts/check-user-round-contract.mjs:150` (`protectedPath`); PLAN freezes it (`PLAN.md:44-47`). Fix is therefore a rule, not code.
- It accepts any value not starting with `--`: `scripts/check-freshness.mjs:49-50`. The witness goes to `git show -s --format=%ct` (`:65`) and is echoed as `revision=${witness}` (`:114`). Result: `--witness HEAD` prints `revision=HEAD` (`JjAuditTabi.md:184-194`, F6).
- Sibling gates require hex: `scripts/check-round-contract.mjs:211`; `scripts/check-user-round-contract.mjs:291,295` (`^[a-f0-9]{7,40}$`).
- Invocation rule (run from the lane root; tools start at the fleet root, `.ufo/prompts/tabi-round-17.md:164-165`):

  ```sh
  cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"
  ```

  The witness must descend from the baseline and have `%ct` ≥ threshold (`check-freshness.mjs:65-69`).
- The other two gates' `--witness` is NOT the tip. It takes the pinned legacy gate revision: `scripts/check-round-contract.mjs:934-935` (blob must equal `LEGACY_GATE_BLOB`, `:38`); `scripts/check-user-round-contract.mjs:797-799` (`LEGACY_USER_GATE_BLOB`, `:50`). Do not pass the tip to these.

### Registry rows — changed gates (C1)

Verdict map (all rows): 0 clean · 1 failed/finding · 2 could-not-evaluate (convention: `SKILL.md:1677-1678`, `:1800`). Write scope: none in the lane; self-tests create and remove temporary repos only (`SKILL.md:1800`).

| Name | Kind / owner | Entry (argv) | Pinned / checked | Sha |
|---|---|---|---|---|
| historical-pstack-contract | gate / tabi | `node scripts/check-round-contract.mjs`; `--witness <legacy-rev>`; `--count-witness <rev>`; `--self-test` | `LEGACY_GATE_BLOB` `:38`; `COUNT_WITNESS_BLOB` `:42`; `COUNT_WITNESS_REV` `:43` | gate `<<SHA>>` |
| historical-user-contract | gate / tabi | `node scripts/check-user-round-contract.mjs`; `--witness <legacy-rev>`; `--count-witness <rev>`; `--diagnostic-witness`; `--self-test` | `LEGACY_USER_GATE_BLOB` `:50`; `ROUND_SCRIPT_CURRENT_SHA256` `:32` (L1 only) | gate `<<SHA>>`; constants `<<SHA>>` |
| measurement-binding | gate / tabi | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce]`; `--legacy <measurements.json> [--at REV]`; `--self-test` | `--at` default = lane tip after C1 (today `options.at ?? 'HEAD'`, `:833`) | gate `<<SHA>>`; selftest `<<SHA>>` |
| freshness (invocation rule only) | gate / tabi | `--witness "$(git rev-parse --verify refs/heads/master)"` as above | byte-frozen `check-freshness.mjs` | `<<SHA>>` (unchanged) |

C1 counter entry list (`PLAN.md:100-105`): the production run of each of the first two gates; `--count-witness <rev>` for both; `--witness <rev>` and `--diagnostic-witness` for the user gate; `check-measurement-binding --check corpus/evidence/round-16/measurement-binding.json` with no `--at`. `check-freshness` is excluded. Counter: `node .ufo/waves/round-17/measure-c1.mjs REV` → `{"c1_anchor_safe": N, ...}` (`PLAN.md:87-106`). Changed-gate rows count only when they pass both arms.

### check-adjacency registry row (C3)

| Name | Kind / owner | Entry and verdict map | Pinned / checked | Sha |
|---|---|---|---|---|
| check-adjacency | gate / tabi | `node scripts/check-adjacency.mjs [--at REV] [--self-test] [--json]`; 0 clean · 1 finding · 2 could-not-evaluate | data `corpus/adjacency.tsv`: header + 9 TAB columns `surface sibling sibling_ref sibling_quote tabi_ref tabi_quote disposition ruling_ref ruling_quote`; disposition ∈ `ruled` / `contested-open` / `split-declared` / `refused-route` (`PLAN.md:137-146`); reason vocabulary `<<C3>>` | checker `<<SHA>>`; data `<<SHA>>` |

Counter: `node .ufo/waves/round-17/measure-c3.mjs REV` → `{"c3_adjacency_verified": N}`; it re-verifies every row itself (`PLAN.md:152-153`). Lane-tip anchored; never HEAD (`PLAN.md:147-148`).

First `ruled` row (integrator ruling, `corpus/lessons/round-16-verifier-spotcheck.md:138-142`): `tabi_ref` = `corpus/lessons/round-16-verifier-spotcheck.md`; `ruling_ref` = `tabi-shokunin@<<SHA>>:corpus/lessons/round-16-verifier-spotcheck.md:141`; quote = `tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.` (`:141`). Other overlaps are rows of `.ufo/waves/round-17/adjacency/<sibling>.tsv` (`PLAN.md:152-153`).

### WebMCP invocation decision table (C2) — placeholder

Knowledge note: `corpus/knowledge/webmcp-invocation-round-17.md` (L1 integrates). Harness: `node scripts/webmcp-invoke-round17.mjs --out <receipt.json>`. Receipt: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (`PLAN.md:110-127`). Round-16 baseline: "No tool is invoked in the receipt" (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`); frontier item still open at `corpus/README.md:303`.

| Question | Evidence | Rule |
|---|---|---|
| Did the page tool run for a CDP `WebMCP.invokeTool`? | `invoke-imperative-success` `<<C2>>` | Claim only if raw request, `WebMCP.toolInvoked`, `WebMCP.toolResponded` and the page-side record of `execute` all match the predicate fixed in code before the run |
| Is a thrown error the page's or the CDP layer's? | `invoke-imperative-throws`, `invoke-imperative-rejects` `<<C2>>` | Page throw and CDP rejection are different claims; cite the case that shows which |
| Unknown tool name? | `invoke-unknown-tool` `<<C2>>` | Claim only the rejection the receipt records |
| Input does not match schema? | `invoke-input-schema-mismatch` `<<C2>>` | Claim only the observed refusal layer |
| Declarative tool form? | `invoke-declarative-form` `<<C2>>` | Chromium-only surface; cite the receipt and S030–S035, never S020 (`SKILL.md:1875`) |
| Tool after unregister or navigation? | `invoke-after-unregister`, `invoke-navigation-pending` `<<C2>>` | Navigation removal is inferred from context destruction, not sent (`SKILL.md:1876`) |
| Concurrent ids; iframe frameId? | `invoke-concurrent-ids`, `invoke-iframe-frameid` `<<C2>>` | Claim per id / per frame only as recorded |
| Flags-off control? | `invoke-flags-off-control` `<<C2>>` | Must fail to invoke; otherwise the invocation claim is void |
| May the lane invoke a page tool? | existing row `SKILL.md:1878` | Loopback fixtures only; unchanged |

Needed to fill `<<C2>>`: the receipt sha, the case ids that ran, and the predicate result per case. Pruned cases need a recorded reason (`PLAN.md:118-119`).

### Append-only overrides to earlier runbook rows (jj)

Premise check: `grep` of the whole `SKILL.md` finds zero `git add`, `git commit` or `@{u}` lines. The jj-era git-write rules live in the prompt (`.ufo/prompts/tabi-round-17.md:256-283`), not in a runbook row. The overrides below cover the revision-reading text that does exist:

1. `SKILL.md:1559` (freshness row, `--witness REV`): REV = lane tip per the invocation rule above; never `HEAD`.
2. `SKILL.md:1510-1511` (`REV` set "to the actual witness commit"; `git grep … "$REV"`, `git show -s --format='%H %cI %ct' "$REV"`): REV = `$(git rev-parse --verify refs/heads/master)` after the landing commit.
3. `SKILL.md:1341` and `:1346` (round-10 stamps: `git log --oneline -1`; `HEAD d24b98d`): historical stamps. Re-derive with `git log --oneline -1 refs/heads/master`.
4. `SKILL.md:1851` ("clean at the delivered HEAD"): read as "clean at the delivered lane tip, `refs/heads/master`".
5. `SKILL.md:1840` (measurement-binding `--at` default): after C1 lands the default is the lane tip; today it is `HEAD` (`scripts/check-measurement-binding.mjs:833`).
6. `SKILL.md:704` (`git show HEAD:SKILL.md`): pre-jj, HEAD was the attached branch. Re-run with `refs/heads/master`.

### Limits

- Unmeasured: `<<SHA>>`, `<<C2>>`, `<<C3>>`. No row here asserts a passing count.
- Gate bytes in this draft are targets (`PLAN.md:56-81`), not current HEAD bytes.
- Round-17 lane-tip measurements apply only to the revision recorded with the counter output (`PLAN.md:89`).
