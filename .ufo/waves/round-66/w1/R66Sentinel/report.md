# R66Sentinel: round-66 security sweep (read-only)

Scope: `.ufo/waves/round-66/counters/` (2 .mjs), `.ufo/waves/round-66/c2/mutants3/` (4 .mjs), `.ufo/waves/round-66/c1/` (0 scripts; TSV/JSON data only). No `.sh` files exist in scope (`find counters c1 c2 -name '*.sh' | wc -l` → `0`). No write was made to the lane, siblings, fleet root, or any frozen file. No scratch directory was created, so no cleanup was needed.

Scripts reviewed: `counters/check-receipt-provenance-v3.mjs`, `counters/rebind-ledger-r66.mjs`, `c2/mutants3/M5{a,b,c,d}.mjs`. `c2/mutants3/M5*.mjs` are byte-identical to v3 except one mutated line each (diffs below).

## Verdict

No Critical, High or Medium findings. Three Low and two Info items, listed below. Every write path is caller-scoped (selftest `--scratch` or generator `--out-dir`). No `/tmp` use in any script. No `process.env` read. No git write verb. The rebind generator reads sibling repos only through read-only `git` calls.

## Findings

| # | Sev | Location | Finding |
|---|---|---|---|
| F1 | Low | `counters/rebind-ledger-r66.mjs:372` | Writes `diff-summary.json`, but the header at line 9 documents `diff-summary.txt`. Doc drift only; no security effect. |
| F2 | Low | `counters/check-receipt-provenance-v3.mjs:119` (and identical in the 4 mutants at `:119`) | `fs.rmSync(path.join(scratch,'provenance-selftest'), {recursive:true,force:true})`. `scratch` is caller-supplied and only checked to be absolute (`main`, CLI selftest branch). Deletion is bounded to one subdirectory, but a `--scratch` pointing at a shared dir would still remove any existing `provenance-selftest/` there. Operator-only tool; fix would be a dedicated scratch-prefix check. |
| F3 | Low | `counters/check-receipt-provenance-v3.mjs:90` | Relative matrix input resolves via `path.join(repo, rel)` and `path.join(dir, rel)` with no containment check, so `../` escapes the repo. Impact limited: reads are read-only and the only outputs are `matrix-input` findings (`input absent: <rel>` or `input digest mismatch`). A caller can use this as a file-existence oracle for paths outside the repo. Acceptable for a local gate; note only. |
| F4 | Info | `counters/rebind-ledger-r66.mjs:279,281` (`writeTsv`), `:372` (`diff-summary.json`) | All write paths derive from `path.resolve(opt('--out-dir'))` (`outDir`, line ~110). No hardcoded absolute path. No write to `laneDir`, `fleet`, or any `path.join(fleet, ln)`. Compliant with write scope. |
| F5 | Info | `counters/rebind-ledger-r66.mjs:115` (`git` helper), `:~130` (`committed`, `committedAndWorking`), `:~146` (`sibling`) | Every git call is read-only: `rev-parse --show-toplevel`, `rev-parse --verify`, `cat-file -e`, `cat-file -p`. Sibling reads go only through `git -C <fleet>/<ln> cat-file -p <head>:<path>` (`sibling()`). Spawn uses an argv array, no shell. `ln` is validated against `/`, `\`, `.`, `..` at snapshot parse (`invalid or duplicate snapshot row`). |

## Per-check results

### 1. Write APIs, `/tmp`, env, git write verbs (scripts only)

Scope set: `.ufo/waves/round-66/counters .ufo/waves/round-66/c1 .ufo/waves/round-66/c2`.

- **Write APIs** (`writeFileSync|mkdirSync|appendFileSync|appendFile|rmSync|unlinkSync|renameSync|createWriteStream|openSync|truncateSync|cpSync|mkdtempSync`). Exit `0`, hits in scripts:
  - `counters/rebind-ledger-r66.mjs:279` `fs.mkdirSync(path.dirname(file), { recursive: true });` (outDir-scoped)
  - `counters/rebind-ledger-r66.mjs:281` `fs.writeFileSync(file, body);` (outDir-scoped)
  - `counters/rebind-ledger-r66.mjs:372` `fs.writeFileSync(path.join(outDir, 'diff-summary.json'), text);`
  - `counters/check-receipt-provenance-v3.mjs:119-171` selftest writes/removes, all under `path.join(scratch,'provenance-selftest')` (see F2).
  - `c2/mutants3/M5{a,b,c,d}.mjs:119-169` same as v3 (identical selftest body).
  - No hit in any `.mjs` writes outside a caller-supplied root.
- **`/tmp`** (`grep -i '/tmp'`). Exit `1` (no hit) in every script. Hits found only in quoted sibling-doc text inside c1 TSVs (`c1/adjudicated/adjacency-host-delta-r66.tsv:34,42,43,47,53,59` and `c1/mechanical/adjacency-host-delta-r66.tsv:34,42,43,47,53,59`): these are the quoted `/tmp/r10-*` commands from `kaidoku-shokunin` corpus notes, not code executed by any script.
- **`process.env`**. Exit `1` (no hit) in scripts. No token or secret env read.
- **Git write verbs** (`git (commit|add|push|checkout|reset|stash|pull|merge|rebase|revert|clean|apply|cherry-pick)` with `git` as an argv token). Exit `1` (no hit) in scripts. The `git` helper in `rebind-ledger-r66.mjs:115` and `spawnSync('git', ['-C', ...])` in v3/mutants use only `show`, `cat-file` and `rev-parse`.
- **Shell redirect** pattern (`>` followed by `/`, `$` or `~`). Initial sweep returned hits at `c2/mutants3/M5a.mjs:100`, `M5b.mjs:100`, `M5c.mjs:100`, `M5d.mjs:100`, `counters/check-receipt-provenance-v3.mjs:100`, `counters/rebind-ledger-r66.mjs:345`. All are false positives: JavaScript arrows (`=> /^matrix…`) and template literals (`-> ${n[7]}`). No shell redirect exists in any scoped script.

### 2. Credential-shaped strings in round-66 artifacts

Pattern: `token|secret|api[_-]?key|BEGIN [^-]*PRIVATE KEY|op://` (case-insensitive).

- Committed (`git grep -n -i -E '<pattern>' HEAD -- .ufo/waves/round-66`): exit `1`, no hit. Committed tree holds 11 round-66 files, none credential-shaped.
- Working tree / untracked (`git grep --untracked -n -i -E '<pattern>' -- counters c1 c2`): exit `1` for the script-scoped run where no data TSV was involved; the full data set returned:
  - `c1/adjudicated/adjacency-host-delta-r66.tsv:39` and `c1/mechanical/adjacency-host-delta-r66.tsv:39`: `corpus/knowledge/2026-10-14-r10-01-queue-ops.md:158`, quote `` `data.json?token=…`) → HAR 1.2 `` (URL query placeholder `…`, no value).
  - `c1/adjudicated/adjacency-host-delta-r66.tsv:164` and `c1/mechanical/adjacency-host-delta-r66.tsv:164`: `mado-shokunin PROVINCE.md:35` quote, prose containing "secret patterns" and "secret handling stays kagi's".
  - Verdict: prose and placeholders quoted from sibling docs. No key, token value, `op://` reference, or PRIVATE KEY block. **No credential found.**
- `w1/` dispatch and spec JSON (`w1-dispatch.json`, `w1-plan.json`, `w1-spec.json`) match only the phrase "credential-shaped string" in the instructions themselves. Not a secret.

### 3. Rebind generator reads siblings only through `git show`/`cat-file`

Confirmed by reading `counters/rebind-ledger-r66.mjs`:

- Sibling reads: `sibling()` runs `git -C <fleet>/<ln> cat-file -p <head>:<path>` (read) and `cat-file -e <head>^{commit}` (read).
- Lane reads: `git -C <laneDir> rev-parse`, `cat-file -p <REV>:<rel>`, and `fs.readFileSync(path.join(laneDir, rel))` (working-tree read, compared against committed bytes).
- Writes go only to `outDir` (F4).
- No sibling path appears in any write call.

## Commands run and exit codes

| Command (abbreviated) | Exit |
|---|---|
| `git -C tabi-shokunin grep --untracked -n -E 'writeFileSync\|mkdirSync\|…' -- counters c1 c2` | 0 (hits listed above) |
| `git grep … -E '(^\|[^>])>{1,2}[[:space:]]*(/\|\$\|~)'` (redirect) | 0 (false positives only) |
| `git grep --untracked -n -i '/tmp' -- counters c1 c2` | 0 (quoted sibling prose only) |
| `git grep --untracked -n -E 'process\.env' -- counters c1 c2` | 1 (no hit) |
| `git grep --untracked -n -E 'git (commit\|add\|push\|checkout\|reset\|stash\|pull\|merge\|rebase\|revert\|clean\|apply\|cherry-pick)\b' -- counters c1 c2` | 1 (no hit) |
| `git grep HEAD -n -i -E '<credential pattern>' -- .ufo/waves/round-66` | 1 (no committed hit) |
| `git grep --untracked -n -i -E '<credential pattern>' -- counters c1 c2` | 1 for scripts; 0 for full data run (see §2) |
| `grep -n -i -E '<credential pattern>' c1/{adjudicated,mechanical}/adjacency-host-delta-r66.tsv` | 0 (lines 39 and 164) |
| `find counters c1 c2 -name '*.sh' \| wc -l` | 0 |
| `diff counters/check-receipt-provenance-v3.mjs c2/mutants3/M5{a,b,c,d}.mjs` | 1 each (one-line mutation + 2 added selftest cases; no write-path delta) |

Note: several tool outputs in the sweep were truncated at 512/768 bytes; the lines above were re-verified with exact `grep -n`/`git grep` runs.

## Scope notes

- `c1/` contains no scripts (`*.mjs`/`*.sh` absent; `meter/` holds JSON only). The c1 data TSVs were scanned as data.
- Relevant to the calibration milestone: the v3 gate's selftest surface (`counters/check-receipt-provenance-v3.mjs:162-163`) carries the two relative-path cases. The `M5a`/`M5b` mutants differ only in the candidate list at `:90` (`c2/mutants3/M5a.mjs:90`, `M5b.mjs:90`). This review does not judge that calibration; it only confirms the security surface is unchanged by the mutants.
- Tooling: nothing installed; only `git` and `grep`/`find`/`diff` used.
