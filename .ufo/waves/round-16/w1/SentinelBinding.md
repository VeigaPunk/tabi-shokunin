# SentinelBinding — wave 1 security review of the C1 gate design

Seat: `TabiR16.SentinelBinding-5` (sentinel, read-only except this report). Date 2026-10-20.
Surface: `.ufo/waves/round-16/PLAN.md:34-77` (C1 interface contract for `scripts/check-measurement-binding.mjs`, owner BindCore).
This is author-side advice, not certification. When I reviewed it, the gate script did not exist yet: a glob of `scripts/*measurement*` matched no files. So these findings cover the **design**, not BindCore's code.
Must-haves were sent to `TabiR16.BindCore-5` (delivered).

## Method

I ran no gates, selftests, counters or browsers. I ran only generic git and Node semantic probes, in a throwaway repo `mkdtemp` → `/tmp/sentinel-bind-s7rs2hu9`. Those probes used a minimal env (`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `HOME=<tmp>`, `TZ=UTC`) and fixed dates.
- Host: `git version 2.56.0`, `node v24.21.0`, `timeout (GNU coreutils) 9.12`.
- Fixture: commit A `a46dac1…` adds `in/a.txt`, `evil.mjs`, and `counter.mjs` (a symlink → `evil.mjs`). Commit B `0b6a9f9…` changes `in/a.txt`.
- Tools installed or updated: none.

## Findings (severity · exploit path · evidence · impact · smallest remediation)

### F1 — HIGH: counter executed from the worktree, not from the digest-bound blob
- **Exploit path:** `--reproduce` runs `argv` with `cwd` = repo (PLAN.md:59). The digest checks only compare blobs at measuredRevision and REV (PLAN.md:55-56). A dirty or uncommitted worktree `measure.mjs` that prints `{"c1_binding_contracts":1}` therefore passes `count_not_reproduced`, while the bound counter never ran. This is the same identity gap as r15 routed defect 1 (`corpus/lessons/round-15-verifier-spotcheck.md:120`). Repo-local modules that the counter imports are also unbound.
- **Evidence:** this follows from the contract text. Node runs the file on disk; no step in the contract hashes the worktree bytes.
- **Remediation:** run these checks before any spawn:
  - `lstat(counter.path)` is a regular file.
  - `sha256(readFileSync(counter.path)) === counter.sha256`.
  - Otherwise, do not spawn and emit `counter_failed` with detail `worktree_counter_mismatch`.
  - Require that the counter's relative imports are listed in `countedInputs`, or that the counter is self-contained. Record this as residual debt if it is not enforced.

### F2 — HIGH: a symlink counter makes the digest meaningless
- **Exploit path:** git stores a symlink as a blob whose bytes are the link text. `counter.sha256` would then pin the string `evil.mjs`, not the code. Node follows the link and runs the target.
- **Evidence:**
  - `git ls-tree A -- counter.mjs` → `120000 blob b14cd9b…	counter.mjs`
  - `git cat-file blob A:counter.mjs` → `evil.mjs`
  - `node counter.mjs` → `{"c":1,"who":"evil"}`
- **Remediation:** require the `ls-tree` mode to be `100644` or `100755` at both measuredRevision and REV, as r15 `measure.mjs:253-268` (`treeEntry`/`fileAt`) already does. Reuse that pattern. Combine it with the `lstat` check in F1.

### F3 — HIGH: `countedInputs` pathspec magic or typos silently suppress `counted_input_changed`
- **Exploit path:** `git diff --name-only M REV -- <inputs>` returns empty, so the claim looks unchanged. This happens with any of these entries:
  - `:(exclude)in/`
  - `:!in`
  - a nonexistent or typo path
- **Evidence (A..B, where `in/a.txt` really changed):**

| Pathspec | Without `--literal-pathspecs` | With `--literal-pathspecs` |
|---|---|---|
| `in/` | `in/a.txt` | `in/a.txt` |
| `:(exclude)in/` | empty | empty |
| `:!in` | empty | empty |
| `in/*` | `in/a.txt` | empty |
| `*` | `in/a.txt` | empty |
| `:(top)in` | `in/a.txt` | empty |

- **Remediation:**
  - Validate every `countedInputs` entry and `counter.path` before any git call. Each must be a non-empty, normalized, repo-relative string matching `^(?!-)(?!:)[A-Za-z0-9._/-]+$` (also forbids `*`, `?`, `[`, backslash, whitespace, NUL and newline). It must have no `..` or `.` segment and no leading `/`. A trailing `/` is allowed for directory prefixes.
  - Pass `--literal-pathspecs` on every git call.
  - Require each input to exist at measuredRevision: `git ls-tree measuredRevision -- <p>` yields ≥1 entry. A missing input should be `manifest_schema_invalid` (exit 2) or a finding; it must never pass as clean.
  - The vocabulary in PLAN.md:54-61 has no "input absent" reason. L1 should decide between those two outcomes.

### F4 — HIGH: an option-shaped `counter.path` executes arbitrary code via Node
- **Exploit path:** the argv rule (PLAN.md:58) only requires `argv[1] === counter.path`. A manifest with `counter.path = argv[1] = '--eval=require("fs").writeFileSync("pwn","x")'` satisfies `argv[0]==='node'` and contains exactly one `{REV}` token.
- **Evidence:** `node --eval=require("fs").writeFileSync("pwn","x") {REV}` → `exit=0`, `pwn exists=True`.
- **Remediation:**
  - Apply the F3 path validation to `counter.path` (no leading `-`).
  - Never spawn when any static finding exists for that claim (`argv_unsupported`, any digest or mode finding, or path invalid). The static checks must gate the spawn, not run beside it.
  - Bound `argv` at ≤16 elements, all strings.
  - Node throws `ERR_INVALID_ARG_VALUE` on a NUL in argv (observed). Pre-check for it and map it to `manifest_schema_invalid` (exit 2), not an uncaught crash.

### F5 — HIGH: env leakage into git and Node
- **Exploit paths and evidence:**
  - A `--require` hook in `NODE_OPTIONS` runs inside the counter. `NODE_OPTIONS=--require <tmp>/hook.cjs node evil.mjs` → `hooked exists=True`.
  - An inherited `GIT_DIR` redirects every git read. `GIT_DIR=/nonexistent git rev-parse HEAD` → `fatal: not a git repository: '/nonexistent'`. A real `GIT_DIR`/`GIT_OBJECT_DIRECTORY`/`GIT_INDEX_FILE` would silently read another repo.
  - Other variables that must not leak: `GIT_EXEC_PATH`, `GIT_CONFIG_PARAMETERS`/`GIT_CONFIG_COUNT`/`GIT_CONFIG_KEY_*`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NODE_PATH`, `LD_PRELOAD`.
- **Remediation:**
  - Build the env from scratch: `{ PATH, HOME, TZ: 'UTC', GIT_* allow-list }`. Never use `{...process.env}`. Existing scripts do spread it, e.g. `scripts/check-freshness.mjs:128`.
  - Spawn `process.execPath` instead of a PATH lookup of `'node'`, as `scripts/check-aria-metadata.mjs:2255` already does. Keep the `argv[0]==='node'` check only as manifest validation.
  - Add these to the PLAN git env (PLAN.md:36-38):
    - `GIT_NO_LAZY_FETCH=1` (`man git`: "tells Git not to lazily fetch missing objects from the promisor remote on demand"). Without it, a partial-clone `cat-file` can reach the network.
    - `GIT_GRAFT_FILE=/dev/null` (see F6).
  - The counter's own git children inherit this minimal env, which is the desired effect.

### F6 — MEDIUM: attacker-controlled repo state flips ancestry or executes commands (`--repo <dir>`)
- **Grafts:** with `.git/info/grafts` containing `B` (B shown as parentless), `git merge-base --is-ancestor A B` → `exit=1`. With `GIT_GRAFT_FILE=/dev/null` → `exit=0`. `GIT_CONFIG_NOSYSTEM` and `GIT_NO_REPLACE_OBJECTS` do not cover grafts, so `measured_revision_not_ancestor` can be forged either way.
- **Replace refs:** `git cat-file blob B:in/a.txt` returns `forged` after `git replace`, and `b` with `GIT_NO_REPLACE_OBJECTS=1`. The planned env already covers this; keep it.
- **Repo-local config executes commands** (`GIT_CONFIG_GLOBAL`/`NOSYSTEM` do not disable `.git/config`):

| Command | fsmonitor ran | diff.external ran |
|---|---|---|
| `git diff --name-only A B -- in` | no | no |
| `git diff-tree -r --name-only A B -- in` | **yes** | no |
| `git diff --name-only B -- in` (worktree) | **yes** | no |
| `git status --porcelain -- in` | **yes** | no |
| `git diff A B -- in` (porcelain patch) | no | **yes** |
| `git -c core.fsmonitor=false status --porcelain -- in` | no | — |

- **Remediation:**
  - Prefix every git call with `-c core.fsmonitor=false` and `--literal-pathspecs`.
  - Add `--no-ext-diff --no-textconv` to any `diff`.
  - Avoid worktree-touching commands (`status`, single-rev `diff`). F1 uses fs hashing instead.
  - Set `GIT_GRAFT_FILE=/dev/null`.

### F7 — MEDIUM: timeout leaves orphan processes that can still mutate after the gate exits
- **Exploit path:** the counter spawns a grandchild. When `spawnSync`'s timeout fires, only the direct child is killed.
- **Evidence:**
  - `spawnSync(execPath,[gc.mjs],{timeout:1000,killSignal:'SIGKILL'})` → `elapsed_ms 1001 status null signal SIGKILL error ETIMEDOUT`, then the grandchild wrote its file 4 s later (`grandchild survived after timeout kill: true`).
  - Mitigation A: async `spawn(...,{detached:true})` + `process.kill(-pid,'SIGKILL')` → `survived = false`.
  - Mitigation B: argv `['timeout','-s','KILL','1',execPath,gc.mjs]` under `spawnSync` → `signal SIGKILL elapsed 1002`, `survived = false`.
  - Default `maxBuffer`: 2 MiB of stdout → `signal SIGTERM error ENOBUFS stdoutLen 1114112`.
- **Remediation:**
  - Use mitigation A or B.
  - Set an explicit `maxBuffer` for the counter and for git (`git diff`/`cat-file` output above 1 MiB currently becomes a spurious `git_failed`).
  - Map `status===null`, `signal`, `ETIMEDOUT` and `ENOBUFS` to `counter_failed`.
  - Give every git call a timeout as well.

### F8 — MEDIUM: `{REV}` and revision handling
- **No shell, so `;` and `$()` are inert.** The real risks are option injection into git and passing an unresolved string through to the counter.
- **Evidence:**
  - `git rev-parse --verify --end-of-options a46dac1^{commit}` → the full 40-hex.
  - `git rev-parse --verify --output=/tmp/x` → `fatal: Needed a single revision`, so git did not treat it as an option here. Even so, keep the leading-`-` reject used in r15 `measure.mjs:243`.
- **Remediation:**
  - Resolve `--at` once with `rev-parse --verify --end-of-options <rev>^{commit}` (reject a leading `-` or whitespace first).
  - Substitute **the resolved 40-hex**, never the raw `--at` text, and only into an argv element that is exactly `{REV}`. No substring replace: `--at={REV}` should count as argv_unsupported.
  - Regex-check `baseline`, `measuredRevision`, `before.revision` and `after.revision` against `^[0-9a-f]{40}$` before any git call.
  - Enforce `after.revision === measuredRevision` (PLAN.md:50) as `manifest_schema_invalid`.

### F9 — MEDIUM: forged stdout lines from manifest-controlled text
- **Exploit path:** the text output is line-oriented (PLAN.md:62-63) and `measure.mjs` and receipts parse it. A claim `id` or a detail path containing `\n` could inject `finding …` or `MEASUREMENT_BINDING verdict=clean …` lines. `detail` text with spaces could also inject `key=value` tokens.
- **Remediation:**
  - Require `id` to match `^C[0-9]+$` and `axis` to match `^[a-z]+$`.
  - Emit `detail` as a percent-encoded or JSON-string-escaped single token. Paths are already restricted by F3.

### F10 — LOW: counter JSON parsing
- **Evidence (Node):**
  - Bracket lookup of `'__proto__'` → `object` and of `'constructor'` → `function`, but `Object.hasOwn({c:1},'constructor')` → `false`.
  - Duplicate JSON keys resolve last-wins.
  - `"1"==1` is `true`.
- **Remediation:**
  - `JSON.parse` the whole trimmed stdout and require a plain non-array object.
  - Require `countField` to match `^[a-z0-9_]+$`, plus `Object.hasOwn`, plus `Number.isSafeInteger(v) && v === after.count` (strict equality).

### F11 — LOW: the verdict covers uncommitted manifest bytes
- **Issue:** `--check <manifest>` reads a filesystem path, so the binding contract itself is unbound to REV.
- **Remediation:** include `manifestSha256` and `manifestBlobAtRev` (or `null`) in `--json` output so receipts show whether the checked manifest is the committed one. This is advisory for L1; it is not a new reason in the vocabulary.
- **Other bounds:** cap the manifest size (e.g. 1 MiB), the number of claims and the `countedInputs` length.

## Must-have checklist (for BindCore; BindSelftest may add cases)
1. `process.execPath` spawn; env built from scratch with no `NODE_*`/`GIT_DIR`-family leaks (F5).
2. Path grammar for `counter.path`/`countedInputs`, validated before any git call or spawn; `--literal-pathspecs`; every input exists at measuredRevision (F3, F4).
3. Counter blob mode `100644`/`100755` at M and REV; before `--reproduce`, worktree `lstat` regular + sha256 match (F1, F2).
4. `{REV}` is the resolved 40-hex in a whole token; all manifest revisions match `^[0-9a-f]{40}$`; `--end-of-options` (F8).
5. `GIT_GRAFT_FILE=/dev/null`, `GIT_NO_LAZY_FETCH=1`, `-c core.fsmonitor=false`, `--no-ext-diff --no-textconv`, no worktree-touching git (F6).
6. Process-group kill on timeout; explicit `maxBuffer`; signal, ETIMEDOUT and ENOBUFS → `counter_failed` (F7).
7. No spawn when that claim has a static finding; NUL or overlong argv → exit 2 (F4).
8. Escaped `detail` and an `id` grammar in the text output (F9); strict count parsing (F10).

Suggested selftest falsifiers, beyond PLAN.md:72. Each would fail against a naive implementation:
- a symlink counter
- a dirty worktree counter
- `countedInputs: [":!x"]`
- a nonexistent `countedInputs` entry
- `counter.path` starting with `--eval=`
- `NODE_OPTIONS=--require marker` set in the selftest parent env, asserting no marker
- an `info/grafts` ancestry flip
- a grandchild that outlives the counter timeout, asserting no marker after the gate exits

## Not done
- I did not review any gate code, because none existed (glob shown above).
- I did not run any gate, selftest or counter.
- I made no edits outside this report. The probe temp dir `/tmp/sentinel-bind-s7rs2hu9` has been removed (`rm -rf … && echo removed` → `removed`).
