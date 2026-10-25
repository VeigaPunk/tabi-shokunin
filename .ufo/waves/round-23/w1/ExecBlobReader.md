# ExecBlobReader — shell-free, tree-independent blob reads for the round-evidence auditor

**Verdict:** PASS — a 54-line Node reader resolves `<rev>:<path>` to a blob id, pulls bytes only from the object DB, and re-verifies `sha1("blob <len>\0"+bytes) == blob`, with byte-identical output across cwds, dirty/absent worktrees, hostile user config and active replace refs, and a distinct exit for "missing at rev".

Script: `.ufo/waves/round-23/scratch/ExecBlobReader/read-at-rev.mjs` (throwaway; usage `node read-at-rev.mjs <rev> <path> [repo]`; exit 0 ok / 2 usage-or-refusal / 3 absent-at-rev). Access 2026-10-25; no tool installs (node v24.21.0, git 2.56.0 already present).

## (a) Two revisions, two cwds
- a89f1935 → blob `ba46acb705132fe8ef84dbce72c8e81bf51d1c41`, 84565 B, sha256 `972093d856903f4c8367ed3dda10f2d7b349fc61cc1f74747b1af3a11db661a1`
- 5f585773 (round-21 tip) → blob `5b09a843c211e33e1477f5e4c5a9eb037210cabd`, 83799 B, sha256 `1572aa2dec255d80c25e4200ee9020ba4526a688887e5aa588aacae8acff71a3`
- Identical JSON from cwd `/tmp`, cwd `/`, and the lane root; identical for a relative `./lane-clone` and its absolute form.

## (b) Dirty worktree cannot move a `--rev` read
Scratch `git clone --shared --no-checkout` (112 K), one-file checkout at a89f1935, then appended a line: worktree `git hash-object` = `336d9e46133df4b265e8d86e6b9c118b8aed20a5`, i.e. **not** the blob. The rev read still returns `ba46acb7…` / sha256 `972093d8…`. Deleting the worktree file outright changes nothing: same bytes, exit 0.

## (c) Missing blob at that rev
`5f585773:corpus/lessons/round-22-verifier-spotcheck.md` → `missing: …` on stderr, **exit 3**, no partial stdout. Missing commit → exit 2; non-hex rev → exit 2; a tree path (`corpus`) → exit 2 "is not a blob".

## Guards proved (each with the command that proves it)
1. **No shell** — `execFileSync("git", [...], {shell:false})`, argv only. `node read-at-rev.mjs 'a89f1935;touch canary1' corpus/SOURCES.md` → exit 2, canaries 0; `'$(touch canary3)'` same; path form `'corpus/SOURCES.md;touch canary2'` → exit 3, treated as a literal nonexistent name.
2. **cwd-independent** — `git -C <abs repo>` and `cwd:'/'` in the spawn; repo arg resolved with `path.resolve` before use (a relative `-C` otherwise resolves against `/`, which is the one bug this exercise found and fixed).
3. **Object-DB only** — resolve `rev^{commit}` → resolve `<commit>:<path>` → `cat-file blob <oid>`; never `show`, never the worktree. Proved by (b) including file-absent.
4. **Integrity / fail-closed** — `cat-file -s` must equal byte length *and* recomputed sha1 must equal the blob id, else exit 2. Both revs verify (`sha1` field == `blob` field).
5. **Config isolation** — script forces `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null` over ambient env. Hostile config is demonstrably live (`core.abbrev=4` makes plain `git rev-parse --short` print `ba46a` vs `ba46acb`) yet `GIT_CONFIG_GLOBAL=<hostile> node read-at-rev.mjs …` is unchanged; under the script's env `git config --list --global` = 0 lines and `config --get core.abbrev` exits 1.
6. **Replace-ref immunity** — `git replace 5f585773… a89f1935…` in the clone makes plain `rev-parse 5f585773:corpus/SOURCES.md` return `ba46acb7…`; the script with `GIT_NO_REPLACE_OBJECTS=1` returns the true `5b09a843…`. (Aliases do *not* shadow builtins — recorded as observation, not a guard.)
7. **Rev shape** — `/^[0-9a-f]{7,40}$/` before any git call, plus full-40-hex re-check on the resolved commit.

## Findings for the landed auditor (`scripts/round-evidence-audit.mjs`, 559 lines)
1. Its `GIT_ENV` (l.53-63) and `execFileSync`-with-argv (l.65) already match guards 1/5/6; `FULL_REV = /^[0-9a-f]{40}$/` (l.47) and `root` resolved from `import.meta.url` (l.499-500) match 2/7. — `grep -nE "GIT_NO_REPLACE_OBJECTS|execFileSync|FULL_REV|import.meta.url" scripts/round-evidence-audit.mjs`
2. **Type confusion:** `read()` uses `git show rev:path`; on a directory that exits 0 and prints a tree listing, so a bad path is silently accepted as file bytes. My guard 4 refuses non-blobs. — `git show a89f1935f523a64b00991d792fca6a8c0d321948:corpus | head -3; echo $?` → `tree …`, exit 0.
3. **Absence indistinguishable from IO:** `gitRaw` returns `null` for exit 128 (absent) and for any other git failure, and callers coalesce (`ctx.read(f) || ""`, `parseJson(...)`). Guards 4/`cat-file -t` would give the auditor a distinct "absent" signal instead of a vacuous empty string. — `git show a89f1935…:corpus/nope.md >/dev/null 2>&1; echo $?` → 128.
4. No byte-level check on `read()`: nothing compares length or sha1 to the resolved oid, so a truncated/filtered byte stream would pass silently. Worth adopting `cat-file -s` + sha1-before-use (≤8 lines).
5. `root` is only absolute when passed or defaulted through `resolve`; `--root` is already resolved (l.500), so the relative-`-C` trap my harness hit does not apply — recorded as measured, not assumed.

## Risks / blockers
- `lane-clone` proves behaviour of the *same* guard set but on a shared-object clone; the lane itself was never dirtied (`git status --porcelain` shows only pre-existing untracked round-23 paths).
- `git show` vs `cat-file blob` differ only for non-blob paths and for smudge/attribute paths, which `show` skips for `rev:path`; the residual divergence is the tree case in finding 2 alone.
- No auditor code, tracked file, git/jj write, service, browser or peer message was touched; all scratch output lives under `.ufo/waves/round-23/scratch/ExecBlobReader/`.
