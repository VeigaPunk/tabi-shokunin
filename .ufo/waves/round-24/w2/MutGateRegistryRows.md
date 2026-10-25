# W2 — Mutation matrix: gate-registry conformance gate (row-level mutants)

- Seat: `L1Tabi24.MutGateRegistryRows` (wave 2, falsify, read-only reporter)
- Target under attack: C1's shipped gate `scripts/check-gate-registry.mjs` and the
  eight-field registry row it certifies (`SKILL.md` line 2478, `gate-registry-conformance`).
- Lane tip tested: `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (committed bytes only;
  a sibling's 05:56 working-tree edit to the instrument — fixing the stale "15 cases"
  header comment — postdates this run and was never used by my detector).
- Detector: `node <lane>/scripts/check-gate-registry.mjs --repo <scratch> --rev <commit> --json`,
  shipped blob `git rev-parse ad125e85:scripts/check-gate-registry.mjs` = `4aa6ec1ebf8fe3980796fe6f5b97cf26622187d4`,
  sha256 `5adf83583aa797c5cdd22601a73095b5c76f4a6930b3aca096c79770aeae9d68`.
- Scratch: `.ufo/waves/round-24/scratch/L1Tabi24.MutGateRegistryRows/repo` —
  a git repo built by `git archive --format=tar ad125e85 | tar -x` (5,250 files,
  base commit `9edfcb52461c353f96a9242c2eeb3b51b589f2c6`). Its `SKILL.md` blob
  `8ec62fe088a58ab4fda4ab5a4bdf65dc1cc8de2e` equals the lane's committed blob (bit-identical).
  Harness: `matrix.mjs` in the same dir; full machine-readable results: `matrix-results.json`.
- `TMPDIR=/home/vgpnk/tmp-tabi24` for every node invocation (host /tmp is full).

## Pre-flight (control runs, lane repo, read-only)

| command | observed |
|---|---|
| `node scripts/check-gate-registry.mjs --rev ad125e85` (lane) | exit 0, `nonconformant=0`, 14 gates, 23 rows |
| `node scripts/check-gate-registry.mjs --rev 573c99e…` (lane) | exit 1, `nonconformant=3` — e1 for check-adjacency, check-measurement-binding, round-evidence-audit; matches the claimed `before` |
| `node scripts/check-gate-registry.mjs --selftest` | `verdict=clean cases=22 passed=22` |
| base commit in scratch repo, `--rev` | exit 0, clean (pristine) |
| SKILL.md mutated in scratch **worktree only** (no commit) | exit 0, clean — detector reads committed bytes, not the worktree (confirmed) |

## Kill-rule audit (C1)

"If a field predicate cannot be shown red on a mutated row and green on the conformant
row, the field leaves the required set." — **satisfied.** All eight fields are green on
the pristine row and red on at least one degenerate mutation (tier B below), so no field
must be dropped. But see the survivor analysis: five of the eight predicates are
shape-only and accept semantically wrong cells.

## Results

Every mutant: restore commit re-written with pristine bytes; `restoredSkillSha ==
pristineSha` (`d7912a2d…`) and `restoreBlob == 8ec62fe0…` for all 30 mutants
(`sha_ok=true` across the board; every restore commit re-ran the gate at exit 0 /
nonconformant 0). `mut=` columns are `exit/nonconformant/finding-ids`. All mutations
target line 2478 of `SKILL.md` (the `gate-registry-conformance` row) unless noted.

### Tier A — one real defect per required field (minimal bytes)

| mutant | exact byte change (line 2478 unless noted) | mutant run | verdict |
|---|---|---|---|
| a1-name-truncated | `| gate-registry-conformance |` → `| gate-registry-conformanc |` (−1 char) | 0/0/– | **SURVIVED** |
| a1b-name-collision | name cell → `selfassessment-counter` (another gate's name) | 0/0/– | **SURVIVED** |
| a2-kind-probe | `| gate |` → `| probe |` | 1/1/e1-missing-row | KILLED |
| a3-entry-flag-typo | `--rev REV` → `--revv REV` (+1 char) | 0/0/– | **SURVIVED** |
| a4-verdict-code2-class | `2=could-not-evaluate` → `2=unknown` | 1/1/e2-field-incomplete (verdictMap) | KILLED |
| a5-selftest-flag-typo | `--selftest` → `--selftestt` (+1 char) | 1/1/e2-field-incomplete (selftest) | KILLED |
| a6-pinned-path-absent | pinned cell → `` `corpus/evidence/round-24/c1-measurementsZ.json` `` (absent at rev) | 0/0/– | **SURVIVED** |
| a7-scope-wrong-target | `writes and deletes only its own temporary repositories` → `writes into the lane working tree` | 0/0/– | **SURVIVED** |
| a8-owner-bogus-seat | `| tabi L1 |` → `| tabi L9 |` (1 char) | 0/0/– | **SURVIVED** |

### Tier B — degenerate cells (predicate floor)

| mutant | exact byte change | mutant run | verdict |
|---|---|---|---|
| b1-name-empty | name cell → empty | 1/1/e2-field-incomplete (name) | KILLED |
| b2-kind-empty | kind cell → empty | 1/1/e1-missing-row | KILLED (row unparsed, not e2) |
| b3-entry-none | entry cell → `` `none` `` | 1/1/e2-field-incomplete (entry) | KILLED |
| b4-verdict-code0-only | verdict cell → `0=ok` | 1/1/e2-field-incomplete (verdictMap) | KILLED |
| b5-selftest-prose | self-test cell → `a helper checks it` | 1/1/e2-field-incomplete (selftest) | KILLED |
| b6-pinned-none | whole pinned cell → `none` | 1/1/e2-field-incomplete (pinned) | KILLED |
| b7-scope-blank | whole scope cell → `  ` | 1/1/e2-field-incomplete (scope) | KILLED |
| b8-owner-blank | owner cell → empty | 1/1/e2-field-incomplete (owner) | KILLED |

### Tier C — structural mutants

| mutant | exact change | mutant run | verdict |
|---|---|---|---|
| c1-row-removed | delete line 2478 entirely | 1/1/e1-missing-row | KILLED |
| c2-gate-renamed-name-only | name cell → `registry-conformance` (script token untouched) | 0/0/– | **SURVIVED** |
| c3-absent-script-row | append conformant row for `phantom-absent` naming `scripts/check-phantom-absent.mjs` (inside table) | 1/1/e3-row-script-absent | KILLED |
| c3b-row-script-absent-real-gate | all 3 `check-gate-registry.mjs` tokens in the row → `check-gate-registry-absent.mjs` | 1/2/e3 + e1 | KILLED (orphan + absent) |
| c3c-all-script-tokens-removed | entry+selftest script tokens → `node x` | 1/1/e1-missing-row | KILLED |
| c4-later-row-red | append later row for same gate with owner cell empty | 1/1/e2-field-incomplete (owner, line 2480) | KILLED — latest row wins |
| c4b-later-row-red-pinned | append later row with pinned cell `none` | 1/1/e2-field-incomplete (pinned, line 2480) | KILLED |

### Tier D — instrument-weakness probes

| mutant | exact change | mutant run | verdict |
|---|---|---|---|
| d1-table-header-kind-renamed | line 2467 header `\| Name \| Kind \|` → `\| Name \| Type \|` | 1/5/e1 ×5 (check-adjacency, check-gate-registry, check-measurement-binding, check-selfassessment, round-evidence-audit — the five gates whose only row lived in that table; the other gates fell back to conformant legacy rows) | KILLED |
| d2-row-vouches-foreign-gate | entry cell += `; \`node scripts/check-sources.mjs\`` | 0/0/– | **SURVIVED** (latent) |
| d3-foreign-vouch-plus-red | d2 + owner cell emptied | 1/2/e2 for check-gate-registry **and e2 for check-sources** | KILLED, but proves a row can certify a foreign gate |
| d4-unregistered-nonconvention-gate | add `scripts/gatecheck-alpha.mjs` (real .mjs, non-convention basename, no row) | 0/0/– | **SURVIVED** |
| d5-convention-gate-unlisted | add `scripts/check-omega.mjs`, no row (control) | 1/1/e1-missing-row | KILLED |
| d6-pinned-wrong-receipt | pinned path → `corpus/evidence/round-24/c2-measurements.json` (exists, but C2's receipt) | 0/0/– | **SURVIVED** |

## Analysis — what the survivors prove (observation, not repair)

1. **The gate verifies field *shape*, not field *truth*.** 5/8 tier-A defects survive:
   - `entry` is length-checked only (`row.entry.length >= 8`). A one-byte flag typo
     (`--revv`) makes the command un-runnable yet conformant — an asymmetry: the
     self-test *spelling* IS enforced (`/--self-?test\b/`), the entry spelling is not.
   - `pinned` is a path-shape check (`/[/.]/` or a 7+ hex run). A nonexistent path
     (a6) and another gate's receipt (d6) both pass — contrast e3, which DOES
     verify script existence at rev. The one field whose referent is checked is
     the script token; the pinned referent is not.
   - `scope` is a keyword regex (`read|writ|temp|isolat|stdout|nothing|no `). A row
     declaring `writes into the lane working tree` passes.
   - `owner` is a keyword regex (`tabi|lane|L1|shokunin|owner`). `tabi L9` — a seat
     that doesn't exist — passes.
   - `name` is a character-class regex; a truncated name, a renamed gate (c2), or
     another gate's name (a1b) all pass. Row↔gate binding is by **script token,
     not by name** — that is also what makes d2/d3 work.
2. **Cross-gate attribution is unguarded.** Any row whose entry/selftest cell names
   another gate's `.mjs` becomes an owner-row of that gate; the latest such row
   supersedes the foreign gate's own row (d3 → check-sources went red on line 2478,
   its own green row at 2470 notwithstanding). The convention "rows register
   gates" has no same-name or same-script guard.
3. **Gate-set derivation is convention ∪ row-invoked, not "all gate scripts".**
   `scripts/gatecheck-alpha.mjs` (a real .mjs outside the `check-*`/`*audit*`
   convention, no row) is invisible — e1 cannot fire for it. An attacker adding a
   gate under a non-convention basename defeats the gate set. (Control d5 shows the
   convention-named case is caught.)
4. **Supersession is fail-open for the registry writer, fail-closed for the gate.**
   A later red row correctly flips a gate to nonconformant (c4/c4b) — but nothing
   stops a writer from superseding any gate's row (same name or same script token;
   d3 shows the same mechanism extends to foreign gates).
5. **Rows outside a table are silently unread** (observed, harness artifact): a row
   appended after a blank line at EOF is not in any header+separator table, so it
   produces zero parse effect. Registry prose cannot rely on out-of-table rows.
6. **Committed-bytes source confirmed** — a worktree-only mutation changed nothing;
   the detector reads blobs at `<rev>`.

## C1 falsification verdict

- The counting claim reproduces: `nonconformant=3` at baseline `573c99e` (the exact
  three gates the round-24 prose names), `nonconformant=0` at tip `ad125e85`, in both
  the lane repo and the isolated scratch repo. `--selftest` = 22/22 PASS (matches the
  row's `cases=22`; the file-header comment's "15 isolated cases" was stale prose —
  a sibling patched it in the worktree at 05:56, after my detector froze the shipped
  bytes).
- The kill rule is satisfied: every one of the eight required fields can go red
  (tier B) and is green at tip.
- **Not falsified.** What survives the matrix is instrument scope, not count error:
  the gate certifies *row conformance* (presence + shape of eight fields, row↔script
  binding, latest-wins supersession), and it demonstrably does that. It does not
  certify that the entry command runs, that the pinned path exists, that scope text
  is honest, that the owner seat exists, that the name identifies the row's gate, or
  that all gate scripts have registry rows. 10 mutants survived (10 distinct
  weaknesses; a1/a1b/c2 are the same "name is not an identifier" weakness).
- C1's own declared standard ("the latest registry row carries the eight … fields")
  is met as literally written — a row carrying *wrong* content still *carries* the
  fields. Whether the PROTOCOL intends shape or truth is a contract question the
  L1/author should route; this is a coverage finding, not a killed claim.

## Restoration evidence

- 30/30 restore commits: `restoredSkillSha256 == d7912a2d4362ad3220a2498115564f8103e985f5a6ec64838323cbb9cc482365`
  (pristine) and `restoreBlob == 8ec62fe088a58ab4fda4ab5a4bdf65dc1cc8de2e`; every
  restore commit re-ran the gate at exit 0 / `nonconformant=0`.
- Per-mutant and per-restore revs, blob hashes, and full finding payloads:
  `scratch/L1Tabi24.MutGateRegistryRows/matrix-results.json`; mutant specs and ops:
  `matrix.mjs`.
- Lane repo untouched (read-only git only); all writes confined to the scratch dir.

## Unknowns / things I did not assert

- I did not probe PROTOCOL.md's exact field-standard text; I used the lane's own
  restatement in SKILL.md §Round 24 plus the instrument header.
- `a7`'s "write into the lane working tree" row is a defect under any honest reading,
  but strictly the standard requires the row to *name* a scope — the gate's regex
  accepts the dishonest sentence. Inference, marked.
- The nonconvention-gate hole (d4) assumes `gatecheck-alpha.mjs` would *be* a gate;
  the instrument's own header describes the derivation exactly as implemented, so
  the gap is by design, but it is still the reachable mutation boundary.

## Tooling

- No installs needed or performed (node, git, coreutils suffice). `TMPDIR=/home/vgpnk/tmp-tabi24`.
- No pacman transaction (guard honored).
