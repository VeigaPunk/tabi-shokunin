# SentinelGate — round 16 w2 FALSIFY: `check-measurement-binding.mjs --reproduce` trust boundary

Author-side report (TabiR16.SentinelGate), 2026-10-20. Not a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`. Gate blob sha256 `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb`. The demos used only `/tmp/sentinelgate-NpCg/{clone,cfg,symA,symB,race,fx}`, which are `git clone --no-hardlinks` copies of the lane plus one fresh fixture repo. Nothing in the lane was touched apart from this file.
Tools installed or upgraded: none.

## Attack item: does `--reproduce` only ever execute the bound counter bytes under an isolated environment?

**Verdict: BREAKS.** One deterministic, high-severity bypass (F1). One race that needs a concurrent writer (F2). One that depends on the caller's environment (F3). One process-cleanup gap (F4). The env-leak, repo-local git config, pathspec-magic and symlink/mode attacks HOLD (H1–H4).

Baseline (no attack), lane manifest copied to /tmp. The lane manifest is **untracked**: `git status` shows `?? corpus/evidence/round-16/measurement-binding.json`, sha256 `39a18c4aba97334120de8018fa576988f2732f491a967a3a062e7afd987a66f8`.
```
$ cd /tmp/sentinelgate-NpCg/clone   # checked out at b444ca8
$ node scripts/check-measurement-binding.mjs --check /tmp/sentinelgate-NpCg/manifest.json --at b444ca8e024f386124418169e8e400221524bba3 --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2      (exit=0, 2.29 s)
```

### F1 — BREAKS, HIGH: a counter path starting with `-` injects node options, so code outside the bound blob gets a clean reproduction
**Exploit path.**
- `isCleanRepoPath` (gate lines 245–256) says it rejects a leading `-`, but `PATH_CHARS = /^[A-Za-z0-9._/-]+$/` accepts one, and nothing else checks for it.
- `argvSupported` only pins `argv[0]==="node"`, `argv[1]===counter.path` and exactly one `{REV}`. `argv[2..]` can be any string.
- `reproduceArm` spawns `timeout -s KILL 120 <execPath> ...argv.slice(1)` with no `--` before the script.
- So if `counter.path` is `-e`, node treats `argv[2]` as inline code. If it is `--import`, node loads an untracked worktree module.
- The worktree-bytes check (lines 512–521) hashes the decoy file `./-e` against its blob. That check passes, but the decoy is never executed.

Demo 1 (`-e`). The commit adds one decoy file named `-e`. The manifest's inline code returns 0 for the before rev and 1 otherwise, and writes a marker file.
```
$ printf 'decoy: these bytes are never executed\n' > ./-e && git add -- ./-e && git commit -qm 'add file named -e'
REV=5390a6d5fc0331b15cf9421db068226d926495dd SHA=b5d0f0da4807cff870b5901de28a802f974c6c34842bc1ab20bdd7e826433868
manifest counter: {"path":"-e","sha256":"b5d0…3868","argv":["node","-e","const r=process.argv[1];require(\"fs\").writeFileSync(\"/tmp/sentinelgate-NpCg/inline-ran-\"+r,\"x\");console.log(JSON.stringify({c1_binding_contracts: r===\"e38d…4fef0\"?0:1}))","{REV}"],"countField":"c1_binding_contracts"}, countedInputs ["-e"], before e38d2599…/0, after REV/1
$ node /tmp/sentinelgate-NpCg/gate.mjs --check /tmp/sentinelgate-NpCg/forged-dash-e.json --at $REV --reproduce
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
$ ls /tmp/sentinelgate-NpCg | grep inline-ran
inline-ran-5390a6d5fc0331b15cf9421db068226d926495dd
inline-ran-e38d2599a922cb729186353830fff8e159b4fef0
```
Demo 2 (`--import`). A committed decoy named `--import`, plus an **untracked** `evil-untracked.mjs`. argv is `["node","--import","./evil-untracked.mjs","{REV}"]`.
```
$ node /tmp/sentinelgate-NpCg/gate.mjs --check /tmp/sentinelgate-NpCg/forged-import.json --at 4d7a4091fc8cdcea5fbf4713aaaa7c3c9bc88996 --reproduce
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
import-ran-4d7a4091fc8cdcea5fbf4713aaaa7c3c9bc88996
import-ran-e38d2599a922cb729186353830fff8e159b4fef0
```
The schema also accepts `-e` as a counted input. It gets past `manifest_schema_invalid` and only fails as `counted_inputs_undeclared` because no such entry exists at b444ca8:
`finding claim=C1 reason=counted_inputs_undeclared detail=countedInput=-e resolves to no tree entry at measuredRevision=b444ca8…`

**Impact.**
- Whoever writes a manifest, plus one decoy commit of any content, gets `verdict=clean` from `--reproduce` for any counts.
- That beats both "never execute unbound bytes" and the two-arm guard against a constant counter, because the inline code can branch on `{REV}`.
- The current lane manifest is **not** exploitable as-is: b444ca8 has no `-`-prefixed file. The defect is in what the gate will certify.
- The selftest has no leading-`-` case: grepping the selftest at b444ca8 finds none.

**Smallest remediation.**
1. Make `isCleanRepoPath` match its comment by rejecting `path.startsWith('-')`. This covers both `counter.path` and `countedInputs`.
2. As a second guard, spawn `[process.execPath, '--', counterPath, ...argv.slice(2)]`.
3. Add selftest cases for `-e` and `--import` that expect `manifest_schema_invalid`.

### F2 — BREAKS, MEDIUM (needs concurrent worktree write): the bytes are checked once, then executed twice by path
**Exploit path.**
- The gate hashes the worktree counter once (lines 512–521).
- It then spawns arm 1 (before) and arm 2 (REV) one after the other, each time by **path**.
- If the file is rewritten after arm 1 reads it, arm 2 runs the new bytes.

Demo: an inotify watcher (`/tmp/sentinelgate-NpCg/swapper.py`) overwrites the file in place after the 2nd `IN_CLOSE_NOWRITE`, i.e. after the gate's own read and arm 1's read.
```
$ python3 swapper.py /tmp/sentinelgate-NpCg/race/.ufo/waves/round-16/measure.mjs evil-measure.mjs 2 &
$ node /tmp/sentinelgate-NpCg/gate.mjs --check /tmp/sentinelgate-NpCg/c1only.json --at b444ca8e024f386124418169e8e400221524bba3 --reproduce
MEASUREMENT_BINDING verdict=clean claims=1 bound=1
exit=0
--- swapper log: armed / close-nowrite #1 / close-nowrite #2 / swapped
evil_ran=[race-evil-ran-b444ca8e024f386124418169e8e400221524bba3 ]
92b25365a8a146322697d1edebd7be52de3118a1753be14d5cdf631fe8c784ad  .ufo/waves/round-16/measure.mjs   (≠ bound bda4e18e…)
```
Control: swapping before the gate runs is refused (`reason=counter_failed … refusing to execute`, exit=1). The check works; it just isn't atomic with the spawns.

**Impact.** Anyone who can write the worktree while the gate runs can get unbound bytes executed and still see `clean`. A swap-and-restore leaves no trace.

**Smallest remediation.**
- Partial: re-hash immediately before **and** after each arm, and fail `counter_failed` on any mismatch. This narrows the window but does not close it.
- Complete: write the blob into a private 0700 `mkdtemp` and execute that copy. This needs the counter contract to take the repo from cwd or an argument instead of `import.meta.url`, because measure.mjs:55 currently derives ROOT from its own file location.

### F3 — BREAKS only when PATH has a relative entry, LOW: `timeout` and `git` are looked up on PATH from cwd=repo
`minimalEnv()` passes the caller's PATH through unchanged, and `spawnSync('timeout'|'git', …)` runs with `cwd: repo`. An empty or `.` PATH element therefore resolves to an unbound executable at the repo root.
```
$ cd /tmp/sentinelgate-NpCg/fx; printf '#!/bin/sh\ntouch …/m-path-timeout\necho "{\"n\":1}"\n' > timeout; chmod +x timeout
$ PATH=":$PATH" node …/gate.mjs --check …/fx-leak.json --at $B --reproduce   → verdict=clean exit=0, marker m-path-timeout present
$ PATH=".:$PATH" node …/gate.mjs …                                           → verdict=clean exit=0, marker present
$ node …/gate.mjs …   (host PATH, all absolute)                              → verdict=clean exit=0, no-marker
```
The host's PATH is all absolute entries, so this does not fire here. A planted `git` would hijack every plumbing call in the same way.

**Remediation:** in `minimalEnv`, drop PATH entries that are not absolute (or spawn absolute `timeout`/`git` paths resolved once at startup).

### F4 — process cleanup gap, LOW (verdict still fails closed): grandchildren outlive the gate
Fixture repo `/tmp/sentinelgate-NpCg/fx`, with a copy of the gate whose only change is `REPRODUCE_TIMEOUT_MS = 3000`:
```
== loop          → counter_failed … terminated (status=null signal=SIGKILL)                 exit=1   (HOLDS)
== held-detached → counter_failed … spawn error: spawnSync timeout ETIMEDOUT                exit=1; afterwards: 4016016 sleep 25
== held-group    → counter_failed … spawn error: spawnSync timeout ETIMEDOUT                exit=1; afterwards: 4033647 sleep 25
== leak          → MEASUREMENT_BINDING verdict=clean claims=1 bound=1                        exit=0; afterwards: 4055665 sentinelgate-leak 40
```
- The comment's promise that "the KILL reaches grandchildren" only holds when the direct child is still running when `timeout` expires.
- If the counter exits normally, `timeout` exits with it and never signals the group. The outer spawnSync timeout then hits a pid that is already gone.
- Children started with `setsid` or `detached` escape in every case.
- A grandchild holding stdout makes the gate wait the full outer timeout (+10 s) and then fail closed.
- I killed the leaked pids by hand afterwards.

**Remediation:** spawn each arm in its own process group (`detached:true`) and `process.kill(-pgid,'SIGKILL')` after every arm. Fully containing `setsid` children would need a subreaper or cgroup scope.

### Held surfaces
- **H1 env leakage — HOLDS.** I ran with `NODE_OPTIONS=--require spy.cjs`, `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT/KEY_0/VALUE_0` (an fsmonitor command), `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES` and `NODE_PATH` all set. Result: `verdict=clean claims=2 bound=2 exit=0`. spy.log has a single line, `argv=["…/gate.mjs","--check"]`: only the gate process itself, which is the caller's own environment, loaded it; no child did. No fsmon markers were created.
- **H2 repo-local `.git/config` — HOLDS.** In the `cfg` clone I set:
  - `core.fsmonitor`
  - `core.hooksPath` with post-index-change, reference-transaction, pre-auto-gc and post-rewrite hooks
  - `diff.external`
  - a `* diff=evil` textconv in `info/attributes`
  - `core.pager`, `gc.auto=1` and `core.sshCommand`
  - `include.path` pointing at an fsmonitor
  - `info/grafts`

  Result: `verdict=clean claims=2 bound=2 exit=0`, `no-config-markers`. Any markers I saw came from my own setup `git status`, which I deleted before the run.
- **H3 pathspec magic in countedInputs — HOLDS.** `:(glob)**`, `*`, `:!x`, `/etc/passwd`, `../x` and `a/./b` are each rejected with `manifest_schema_invalid` (exit=2). `.git/config` gets `counted_inputs_undeclared` (exit=1). `GIT_LITERAL_PATHSPECS=1` and `--literal-pathspecs` back this up. The leading `-` exception is F1.
- **H4 symlink/mode — HOLDS for outcome.**
  - A symlink as the final component is refused: `counter_failed … worktree bytes are absent, not regular… refusing to execute`, exit=1.
  - An intermediate-directory symlink (`.ufo/waves/round-16` → another repo) **passes** the check, since lstat only looks at the leaf and the bytes match. Node executes the file through its real path (`/tmp/sentinelgate-NpCg/other/.ufo/waves/round-16/measure.mjs`), so measure.mjs's ROOT moves to the other repo.
  - In that run it failed closed (`counter_failed … exit 2` on both arms), because measure.mjs reads only content-addressed `rev:path` blobs.
  - A counter that reads its ROOT worktree would read inputs that are not bound. The materialisation fix in F2 removes this too.
- **Timeout termination — HOLDS.** A busy loop is killed and reported as `counter_failed` (F4, `loop`).

## Next steps for L1
1. Fix F1 (`-` prefix plus `--`) and add the selftest cases.
2. Re-run `node scripts/check-measurement-binding.mjs --self-test` and the C1 counter.
3. Decide whether the F2 race is in scope for C1 operability.
4. Commit the manifest — it is currently untracked.
