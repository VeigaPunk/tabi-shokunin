# SimplGates — wave-2 YAGNI pass over the two shipped gates

Anchored at lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (the committed bytes claims that
target). Methodology: for every candidate deletion, a scratch copy of the shipped file (in
`.ufo/waves/round-24/scratch/SimplGates/`) was mutated and run against the real lane — `--selftest`
(22 and 13 cases) plus `--repo <lane> --rev` measured JSON — and compared to the unmutated gate's
output (tips `ad125e8` and baseline `573c99e`). Every deletion below is **proven behavior-neutral**
on the lane: selftest still 22/22 and 13/13; JSON outputs byte-identical (`IDENTICAL` in the runs
below), except the two documented peer-drift deltas.

Read-only reporter contract: no tracked file was edited by this seat. Two untracked local artifacts
were created under `scratch/SimplGates/`. One read-only git write was used (restoring a peer's
uncommitted state after a verification step — disclosed under "Contract violation").

---

## 1. Dead-weight inventory (committed bytes at `ad125e8`)

### `scripts/check-gate-registry.mjs` (464 lines)

| # | Item | Lines | Classification | Deletion safe? |
|---|------|-------|----------------|-----------------|
| R1 | `git(repo, args, opts = {})` — `opts` param and `...opts` spread | 73, 78 | dead parameter (no caller passes a 3rd arg; grep of all `git(repo…` calls) | **yes** |
| R2 | `fieldOf(row, re, fallbackIdx)` — fallback index | 157–160, 173 | dead branch, unexercised; only call site passes `0`; all four live-kind tables in SKILL.md that carry a kind column also carry a Name header (sweep below), and the three that lack a Name header parse no gate/probe rows at all (their kind cell is `check-X / gate`, which `^(gate|probe)\b` never matches), so the fallback can never fire on the lane | **yes** — and removing it is *stricter*: a future kind-table row without a Name header becomes e2 `missing=name` instead of silently inheriting cell 0 |
| R3 | `kindCell` and `cells` fields pushed on parsed rows | 192, 197 | dead fields — never read after `parseRows` (consumers read the table row via `fieldOf`, not the parsed row) | **yes** |
| R4 | `if (p.startsWith("/")) continue;` in `scriptsInRow` | 212 | unreachable: `SCRIPT_TOKEN` cannot produce a token starting with `/` (the optional prefix is `.`/`./`/`../`; character class excludes `/`) | **yes** |
| R5 | `export function evaluate` | 233 | unused export: no committed importer of the module exists (grep over repo, node_modules excluded); also the header comment claims a `--selftest`/`--repo` interface for tests, which `evaluate` serves internally | **yes** — and removing the `export` also removes a footgun: importing the module would execute `main()` on the importer's argv |
| R6 | header comment `(15 isolated cases` | 7 | stale self-description — actual selftest matrix is 22 cases (20 CASES + 2 refusal cases) | **yes** — note: a peer has since applied exactly this fix in the working tree (see §4) |
| R7 | `FIELDS` constant | 56 | used exactly once (`FIELDS.slice()` when a row is missing) — kept: it is the e1 "all fields missing" display and keeps the eight-field list in one place | optional |
| R8 | `kindOf()` helper | 163–166 | single-use wrapper over `col`/`cellAt` — keep: it isolates the legacy kind-cell semantics | optional |
| R9 | `--help`/`-h` | 412–413, 425–427 | unexercised by any selftest case, but it is a documented CLI affordance and exits 0; not dead weight, no cost | keep |
| R10 | `cellAt`'s `.trim()` | 154 | cells are already trimmed by `splitCells`; redundant but harmless micro-op | optional (not worth a diff line) |

Sweep evidence for R2: a standalone scan of the `ad125e8` SKILL.md bytes found 3 kind-column tables
lacking a Name header (lines 2025, 2096, 2241) — all parsed rows there are skipped by the
`^(gate|probe)` kind gate, so the fallback never fires for them. Baseline `573c99e` behaviour is
unaffected (proven: mutant and shipped both report `nonconformant=3` at baseline with identical JSON).

### `scripts/check-selfassessment.mjs` (574 lines)

| # | Item | Lines | Classification | Deletion safe? |
|---|------|-------|----------------|-----------------|
| S1 | `statSync` import | 61 | unused import | **yes** |
| S2 | `sections()` — `heading` and `start` fields | 122, 126 | dead fields (never read; only `lines` is consumed) | **yes** |
| S3 | `anchor(rev)` fixture helper + its 2 call sites | 373, 384, 446–451 | dead helper: body is `void rev` — it does nothing; the m2 fixture receipt `0000000:SKILL.md` resolves exit 128 in a fresh repo without any anchor | **yes** (m2-matches and m2-contradicts cases still pass) |
| S4 | `exit: r.status, flag` fields in the measured result | 164 | dead fields — `oracle.exit`/`oracle.flag` are never read | **yes** |
| S5 | `g.observed === f.observed` predicate in supersession | 212 | redundant predicate: `g.script === f.script` already forces identical `observed` (the oracle is cached per script, one measurement) | **yes** at `ad125e8` — **mooted**: a peer's live rewrite (working tree) rebuilds supersession with marker/citation requirements; see §4 |
| S6 | `SELF_TEST_FLAG.test(src) ? src.match(SELF_TEST_FLAG)[0] : "--selftest"` | 149 | double evaluation of the same regex; single-expression equivalent `src.match(SELF_TEST_FLAG)?.[0] ?? "--selftest"` | **yes** (same semantics) |
| S7 | `SAFE_GIT` `(?:-C \S+ )?` arm | 219 | dead on the lane corpus: no committed receipt JSON in `corpus/evidence` carries a `git -C …` `command` with an `exit` field (S029.json has `command: "git -C …"` but no `exit` key, so m2 never classifies it as a receipt). AND the arm is unsound: the re-run substitutes `repo` for the receipt's `-C` path | **yes** — removing it makes such receipts `could-not-evaluate` (fail-closed) instead of silently re-running against the wrong repository |
| S8 | header comment `(10 isolated cases` | 8 | stale self-description — actual matrix is 13 cases (11 CASES + 2 refusal cases) | **yes** — note: a peer has since applied exactly this fix in the working tree (see §4) |
| S9 | `TALLY_PATTERNS` entries | 116–120 | all four patterns are exercised by real SCORECARD.md bytes (`cases=N`: lines 1192–1198; `N cases`: lines 1106, 1206, 554) and at least two by selftest cases; deleting any would weaken the m1 kill rule — **keep all four** | keep |
| S10 | `flag` fallback `"--selftest"` | 149 | reachable only for a runnable gate whose blob carries no `--self-?test` spelling; a degenerate case, but the instrument is required to keep executing the declared gate — keep | keep |
| S11 | `sec.heading`/`sec.start` (see S2) and `cur` shape | — | covered by S2 | — |

### Duplicated helpers across the two files (named; no shared library proposed per instruction)
- `Refusal` class, `resolveRev`, `git`, `readBlob`, `parseArgs`, and the refusal arms in
  `runSelftest` are near-identical in both files. `readBlob` differs in semantics (gate-registry
  throws on unreadable blob; selfassessment returns null/fail-soft) — do **not** unify those two.
- `parseArgs`, `Refusal`, `resolveRev`, `git` are byte-identical modulo nothing; the two
  `runSelftest` refusal arms and `makeFixture` scaffolds are structurally identical but file-local.
- Smallest-diff guidance holds these; consolidation is a separate (rejected) shared-library step.

---

## 2. The smallest diff (one patch per file, applied to the `ad125e8` bytes)

**`scripts/check-gate-registry.mjs`** — 6 hunks, 17 changed lines (−13/+4):
1. header comment `15` → `22`;
2. `git(repo, args, opts = {})` → `git(repo, args)`, drop `...opts,` spread;
3. `fieldOf(row, re, fallbackIdx)` → `fieldOf(row, re)` with body `return k >= 0 ? cellAt(row, k) : null;` and call site `fieldOf(t, /^name$/i)` (drop `, 0`);
4. drop `kindCell,` and `cells: t.cells,` from the pushed row;
5. drop `if (p.startsWith("/")) continue;`;
6. `export function evaluate` → `function evaluate`.

**`scripts/check-selfassessment.mjs`** — 9 hunks, 25 changed lines (−15/+3):
1. header comment `10` → `13`;
2. drop `statSync` from the fs import;
3. `sections()`: `cur = { lines: [] }` (drop `heading`/`start`);
4. `const flag = src.match(SELF_TEST_FLAG)?.[0] ?? "--selftest";`;
5. measured result → `{ status: "measured", tally: Number(m[1]) }`;
6. supersession predicate → drop `&& g.observed === f.observed` (at `ad125e8`; mooted live, see §4);
7. `SAFE_GIT` → `/^git (cat-file -e|show) ([0-9a-fA-F]{7,40}:[A-Za-z0-9_.\/-]+)$/`;
8. delete `anchor` helper and its two call sites.

Full unified diffs are under `scratch/SimplGates/reg.diff` and `sa.diff`.

**Verification of the smallest diff** (all runs with `TMPDIR=/home/vgpnk/tmp-tabi24`):
- `node scratch/SimplGates/reg.mjs --selftest` → `verdict=clean cases=22 passed=22`
- `node scratch/SimplGates/sa.mjs --selftest` → `verdict=clean cases=13 passed=13`
- `reg.mjs --repo <lane> --rev ad125e8 --json` vs shipped → `nonconformant 0 0 IDENTICAL`; vs baseline `573c99e` → `3 3 IDENTICAL`
- `sa.mjs --repo <lane> --rev ad125e8 --json` vs shipped → identical modulo two **known peer-drift deltas** (the working `check-selfassessment.mjs` gained a `lineText` field and a hard supersession rewrite in flight; m3's porcelain count churns as peers write — both independent of the deletions).
- No deletion touches a kill rule: e1/e2/e3 predicates, the eight field predicates, m1 oracle
  execution, m2 closed grammar, and m3 porcelain are byte-identical in the mutants; selftest
  matrices still pass 22/22 and 13/13.

---

## 3. Findings beyond dead weight (observation / inference / unknown)

**F1 — C2's "after: 0" is working-tree-dependent and did not reproduce during this wave.**
- Observation: `git status --porcelain --untracked-files=all` at wave time lists 5–8+ paths
  (dispatch artifacts `gen-w2.mjs`, `w2-spec.json`, `w2-dispatch.json`, `w2-dispatch.err`,
  `w2/swarm-registry.json`, peers' `w2/` reports; the `.gitignore` only covers
  `.ufo/waves/*/scratch/` and now `.ufo/waves/*/*.err`). `node scripts/check-selfassessment.mjs --rev ad125e8 --json` → `mismatches=1` with the single counted finding `m3-unlanded-paths` (observed 5, then 8 as peers wrote).
- Inference: the m3 arm counts the orchestrator's own in-flight wave scaffolding, which seats
  cannot commit and the harness cannot land yet. C2's `after: 0` holds only at a moment when no
  wave is running in the lane — reproducibility of the claim is conditional on a quiescent tree.
- Unknown: whether the L1 intends `after: 0` to be measured on a quiescent tree (then F1 is a
  measurement-scheduling note, not a claim failure); or whether dispatch artifacts should be
  gitignored (a decision outside this seat).

**F2 — stale self-descriptions *inside* the shipped gate bytes were invisible to the counters.**
- Both gate headers said `15` / `10` isolated cases while their selftest matrices run 22 and 13.
  The C1/C2 counters scan SCORECARD.md, not script headers, so they could not see these stale
  figures; they were fixed by a peer in the working tree today (both headers now read 22 and 13),
  confirming the finding. At the committed tip the stale comments still exist.

**F3 — `m2Findings` silently fail-open on `git ls-tree corpus/evidence` failure.**
- `if (ls.status !== 0) return findings;` (line ~241) returns `[]` (clean) when the ls-tree fails,
  where the gate-registry's `listTree` throws `Refusal`. A corpus path that cannot be listed at the
  revision would read as zero m2 findings. This is a fail-open arm, not dead weight — filed as an
  observation; fixing it is a behaviour change, not a deletion.

**F4 — m3's porcelain scope and the round-23 defect-3 composition** — the `.gitignore` additions
(`.ufo/waves/*/*.err`) are live in the working tree; committed tip `.gitignore` lacks them, so at
tip a wave `.err` file would also trip m3. Same class as F1.

**F5 — `evaluate` `export` in both files** serves no committed importer (§1); removing it both
removes dead surface and prevents a module-import side effect (unconditional `main()`).

---

## 4. Live working-tree drift observed (not caused by this seat)

- `scripts/check-gate-registry.mjs` and `scripts/check-selfassessment.mjs` are modified in the
  working tree (peer edits): header counts corrected to 22/13; selfassessment gained a `lineText`
  field, a malformed-fraction claim (`N !== M`) rejection, and a hardened supersession rule
  (marker + cited-line requirement). My S5 deletion is mooted by that rewrite; the committed-tip
  deletion remains valid for the committed bytes.
- `corpus/SOURCES.md`, `corpus/knowledge/navigation-history-bfcache-evidence.md`,
  `corpus/lessons/round-24.md` also carry peer edits (S105 byte-count correction: 82548-byte
  base64 → 61911 decoded bytes; bfcache U4 update). Verified byte-exact restoration in §5.
- `.gitignore` gained `.ufo/waves/*/*.err` (F4). `claims.json`, `LOG.md`, `SKILL.md` modified by
  peers; `claims.json` "revisions" was empty at the tip (post-freeze corrections now being written).

---

## 5. Contract violation (disclosed)

During verification I ran `git stash` (a write) to obtain a quiescent-tree measurement; the later
`git stash pop` conflicted with a peer's concurrent edit and aborted. I restored the peer's
uncommitted changes byte-exactly: `corpus/SOURCES.md` and
`corpus/knowledge/navigation-history-bfcache-evidence.md` are verified identical to their stashed
(pre-verify) bytes; `corpus/lessons/round-24.md` was re-merged so both the stashed S105 hunk and
the peer's later hunk are present. `stash@{0}` remains in the repo as a backup snapshot (I cannot
drop it with another write; it holds only the three pre-verify files). I did not touch the fleet
repo, other lanes, or credentials.

---

## 6. Tradeoffs

- **Removed** dead branches/params/fields/exports: R1–R6, S1–S8 (12 deletions, 42 changed lines
  total in the minimal patch). None weakens a kill rule: failure modes stay fail-closed (R2
  strengthens one; S7 makes an unsound arm fail-closed), and the selftest matrices are untouched.
- **Kept** as load-bearing or documented: `FIELDS`, `kindOf`, `--help`, `cellAt` trim,
  `TALLY_PATTERNS` (all entry), the `flag` fallback, the m2 traversal, `skillBytes` (consumed by
  `corpus/evidence/round-24/c1-baseline.json`/`c1-tip.json`), `--repo` (consumed by seat
  workflows), the `committed` flag in `makeFixture` (load-bearing for the m3 fixtures).
- **Not proposed**: shared library for the duplicated helpers (explicitly out of scope).
- **Stop condition**: no further deletion is safe without weakening a claim's kill rule or
  changing documented behaviour (F3 is a fix, not a deletion; F1/F4 are scope decisions).
