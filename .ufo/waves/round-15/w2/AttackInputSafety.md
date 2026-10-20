# AttackInputSafety (wave2, sentinel, author-side): C1 grammar evidence versus a hostile Git env, config, hooks or PATH

This is an author-side falsification of delivered round15 build bytes, based on reading the source only. I did not execute any gate, selftest, measure, counter or browser, and I made no source edits. It is not a non-author verification.

## Attacked identity

- Build snapshot: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json`. Revision `72dcf031b9da24796b718517ea575f21e4f7caae` equals `git rev-parse HEAD`.
- The sha256 of these files on disk matches the snapshot:
  - `scripts/check-user-round-contract.mjs` `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`. Git blob `12b14bdf288dc9877820f699677fb11651d254c1`; last changed in `c138bea`.
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`.
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. It is outside this slice; I did not attack it.
- These docs are uncommitted working-tree bytes. They are not in the snapshot; I hashed them at read time:

  | File | sha256 |
  |---|---|
  | `SKILL.md` | `037bb813585c2d778986ad38f01916f6f9029d8da7ea2f9a2a8a91fe791fa1fd` |
  | `corpus/QUALITY.md` | `cdd2921c818657aa54b26d8179f335e8658925b2c5b30231e3f275340da3f116` |
  | `corpus/README.md` | `dd20d0c20860ad6d04cb10c01021e8bccd9587420a15fd31c1f9f03ef0f6d5a6` |
  | `corpus/lessons/round-15.md` | `a5f5aa26ab923d144c3ce6b49d4e701269e07ee91c81e74ec8bc70962f803866` |
  | `LOG.md` | `4281d84e33af03ccb929d95eae5edc2aab5aec2c5b0c4da7f66ba1bc6b37b7a8` |
  | `SCORECARD.md` | `6ecee4770caa10288df3db5c49448de2d8ebff714bb01afb90b195b5130beacc` |

## Temporal limits (nothing invented)

- The C1 receipt `corpus/evidence/round-15/user-diagnostics.json` does not exist. `git ls-files --error-unmatch` gave "did not match"; `ls` gave ENOENT. Measure's C1 would therefore currently count 0 (measure.mjs:632-636). No C1 receipt was available to attack.
- The "Execution evidence" section of `corpus/lessons/round-15.md:57-59` is still a placeholder. `SCORECARD.md` has no round-15 entry.
- Every finding below is about delivered code and docs, not about executed outcomes.

## Scope check: no overclaim found

The delivered docs do not credit hostile-Git safety:
- `corpus/lessons/round-15.md:13` rejects "generic hostile Git environment/repository safety from counter grammar refusals …environment/hooks/config/PATH … remain uncredited".
- `corpus/lessons/round-15.md:50` repeats that.
- `corpus/QUALITY.md:75-76` says counter safety "is scoped to the accepted grammar, not the Git environment".

This is consistent with the code. The delivered C1 code has no env scrub anywhere:
- `scripts/check-user-round-contract.mjs:116-118` `git()`
- `:425` `runCount`
- `:631` `commit()`
- `:818-819`, `:893`, `:897`, `:978-979`, `:993-994`, `:1202`, `:1279`: child `process.execPath` spawns
- `.ufo/waves/round-15/measure.mjs:181`

Wave1 already reported the pre-build exploit set: CountShellBoundary F1–F5, PriorDebt D5, ToolsSafety F-env, CountReasonGrammar D7. All of it remains open in the delivered bytes at these re-anchored lines, and I do not repeat it. The findings below are new, or are delivered-byte defects that the scoping text does not cover.

## Findings

### F1 MEDIUM: a fabricated `isolation=cli` on in-process production counts, and measure trusts the token over provenance

- **Evidence:**
  - `scripts/check-user-round-contract.mjs:1249-1250` calls `runCount(defaultRoot, …)` inside the selftest parent process, against the real lane repo.
  - `:1252` then prints `SELFTEST name=count_committed_${id} … isolation=cli`.
  - `:1279-1282` (`production_alias_refused`) is a CLI child against a symlink to the production repo, not an isolated fixture. It also prints `isolation=cli`.
  - measure's own provenance rule says that `count_committed_*` and `production_*` are non-fixture (`.ufo/waves/round-15/measure.mjs:50-53`, `:546-551`).
  - But `:716-718` prefers an explicit `isolation` token over `isIsolatedCase(name)`.
- **Exploit path:** this needs no attacker. The receipt already tells a reader that an in-process production evaluation was an isolated CLI control. Measure would also count any future reason-asserting in-process line labelled `cli` toward `isolatedCli` (`:719-725`, threshold `:772`).
- **Impact:**
  - It is a false provenance token inside the round's "truthful diagnostics" claim.
  - Counts are not affected today, because `count_committed_*` lines carry no `expected_reason`, so the `:708` branch is skipped.
  - The measure guard is weaker than its header claims.
- **Smallest correction:**
  - Emit `isolation=in_process` at `:1252` and `isolation=production_alias` at `:1282`.
  - In measure `:716-718`, compute `isolated = isIsolatedCase(entry.name) && (entry.isolation === null || entry.isolation === 'cli')`. The token can then only narrow, never widen.

### F2 MEDIUM: global hooks or templates can forge the count-witness red-arm marker proof

- **Evidence:**
  - Fixture `git init -q` (`:641`) runs with no `--template` override, so it copies hooks from `init.templateDir`.
  - `commit()` (`:631`) runs with no `--no-verify` and no `-c core.hooksPath=…`, so pre-commit, commit-msg and post-commit hooks from global or system config, or from the templates, run.
  - `runCountWitness` then:
    1. commits at `:889`;
    2. runs the legacy shell arm at `:893`;
    3. reads `oldMarker = existsSync(join(root, COUNT_WITNESS_MARKER))` at `:895`.
  - `oldMarker` is required for `pass` (`:905`) and printed as `old_marker=1` in `count_witness_comparison` (`:1265`). Wave1 CountWitnessReason F3 identified it as the only runtime proof that marker detection is applicable.
- **Exploit path [INFERENCE, not run]:**
  1. Set `core.hooksPath` (via `~/.config/git/config` or `GIT_CONFIG_COUNT/KEY/VALUE`) to a directory whose `post-commit` runs `touch .user-round14-count-marker` in the work tree.
  2. Put a PATH-planted `tee` that writes nothing ahead of `/usr/bin` (the legacy arm runs `spawnSync('bash', ['-c', command])`; see blob `7df3ee9f4df6db3c36c886f9173715bc299ce43a:311`).
  3. Result: `old_marker=1` and PASS, even though the legacy `tee` never created the marker.
  4. In the per-case fixture loop the same hook makes `leaked=true`. That fails closed, so only the witness direction yields a false proof.
- **Host observation:** I ran `git config --show-origin --get-regexp` for these keys; it listed only the `filter.lfs.*` entries from `/home/vgpnk/.config/git/config`. There is no hooksPath or templateDir on this host today. Lane `.git/hooks` has only samples, and there are no `refs/replace`.
- **Impact:** the differential's "the old shell executed the tee stage" evidence cannot be attributed to the shell under a hostile Git config or PATH. The lesson uncredits env trust generally, but the witness receipt line itself does not state this precondition.
- **Smallest correction:**
  - Fixture init: `git init -q --template=<empty mkdtemp dir>`.
  - `commit()`: add `-c core.hooksPath=/dev/null` and `--no-verify`.
  - Before `:893`, assert `!existsSync(marker)` and fail with `could_not_evaluate` exit 2 if it is present.
  - Alternatively, give every git and node child the explicit env pattern already used at `scripts/check-aria-metadata.mjs:1799`, plus `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1` and a fixed PATH.

### F3 MEDIUM: the delivered SKILL registry row states an unconditional write scope that the code does not hold

- **Evidence:** `SKILL.md:1799` (new round15 override row, `historical-user-contract`) gives the write scope "selftest/witness creates/removes isolated temporary fixture repos; no external actions", with no precondition. In the delivered code:
  - `--self-test` deliberately executes the legacy `bash -c` gate (`:893`, via `runCountWitness` at `:1255`). That shell inherits env, so `BASH_ENV` is sourced by non-interactive bash and `grep`/`tee`/`wc` are resolved through PATH.
  - Fixture git commands run global hooks and `filter.*` drivers through `core.attributesFile` (F2).
  - Fixture git commands follow an inherited `GIT_DIR`/`GIT_INDEX_FILE` (wave1 CountShellBoundary F2: fixture commits land in a non-temporary repo).
- **Impact:** an operator following the registry row runs the selftest believing it is side-effect-free and isolated. That holds only under a scrubbed environment, and only `corpus/QUALITY.md:75-76` and the lesson say so.
- **Smallest correction:** either make the scope true in code (F2's env scrub), or append to `SKILL.md:1799`: "isolation holds only under a scrubbed Git/shell environment; Git env/config/hooks/PATH and the deliberately executed legacy bash arm are uncredited (QUALITY21)".

### F4 MEDIUM: `counting_command_failed` labels evaluator inability as a semantic failure (exit 1)

- **Evidence:**
  - `:425-430` maps `result.error` (spawn ENOENT, ETIMEDOUT at `timeout: 30000`, ENOBUFS at `maxBuffer: 16 MiB`, or signal kill with `status === null`) and every non-masked nonzero status to `fail('score_mismatch', …, 1, 'counting_command_failed')`.
  - The comment at `:366` says "fails explicitly for … a spawn failure".
  - The same file's convention treats a git failure as `could_not_evaluate` exit 2 (`gitOk` `:120-123`).
  - The round's own C2 rule separates semantic exit 1 from inability to evaluate, exit 2 (`corpus/QUALITY.md:65-71`; `SKILL.md:1781`).
- **Exploit path:** a 30 s timeout on a large repo, or an output over 16 MiB, is reported as `verdict=failed … reason=counting_command_failed`. That reads as a defect in the committed counting row, when the evaluator simply could not run. No hostility is needed, so the "Git environment … uncredited" scoping in `corpus/lessons/round-15.md:50` does not cover it.
- **History:** wave1 CountReasonGrammar D7 and CounterDiagnostics:226-229 recorded this before the build as deliberate debt. The delivered lesson Gate (`:9`) still claims "truthful" exact reasons without disclosing it.
- **Smallest correction:** at `:430`, check `if (result.error || result.status === null) fail('could_not_evaluate', \`Counting command could not run: ${command}\`, 2)` first. Keep `counting_command_failed` exit 1 for git's own nonzero status, such as the missing revision tested at `:1082-1088`. Alternatively, disclose the conflation in the round15 lesson.

### F5 MEDIUM: measure's "runCount is non-shell" proposition (C1 condition 2) is a bypassable regex heuristic

- **Evidence:**
  - `SHELL_CALL` (`.ufo/waves/round-15/measure.mjs:176`) matches only a quoted bare shell name as the first argument.
  - `SHELL_TRUE` (`:177`) matches only `shell: true`.
  - `SHELL_C` (`:178`) is applied only to the `runCount` body (`:534`). The whole-file checks at `:658-659` omit it, because the gate legitimately has `'-c'` in `commit()` (`:631`).
- **Bypasses that would all yield `non_shell` / no finding:**
  - `return execSync(command, { cwd: root })` inside runCount (execSync always uses `/bin/sh`).
  - `spawnSync('git', args, { shell: '/bin/sh' })`.
  - runCount delegating to a top-level helper that calls `spawnSync('/bin/sh', ['-c', command])`. The path-qualified name escapes `SHELL_CALL`, and `-c` outside the runCount body is not scanned.
- **Current state:** the delivered runCount (`scripts/check-user-round-contract.mjs:418-440`) is in fact non-shell by reading, and the file imports only `spawnSync` (`:5`). There is no current false count. The defect is that C1's counting authority would admit a shell regression.
- **Smallest correction:** in measure,
  1. require the gate's `node:child_process` import list to be exactly `{ spawnSync }`;
  2. reject any `shell\s*:` option other than the literal `false`, file-wide;
  3. require the runCount body to contain exactly one spawn whose first argument is `'git'`.

### F6 LOW: the C1 receipt contract cannot carry environment provenance, and children inherit NODE_OPTIONS

- **Evidence:**
  - The C1 receipt schema (`.ufo/waves/round-15/measure.mjs:27-33`) has only `revision`, `codeSha256`, `selfTest{exit,stdout,stderr}` and `production{…}`. It has no command line, git path or version, env scrub, `NODE_OPTIONS` or PATH.
  - Every "isolated CLI" child (`:1202`, plus the witness arms) inherits `NODE_OPTIONS`, so an `--import`/`--require` preload can rewrite the anchored `USER_ROUND_CONTRACT` records parsed by `receiptOf` (`:759-776`).
  - Measure's own `git()` (`:181`) inherits `GIT_DIR` and related variables when it resolves revisions and pins.
- **Impact:** a committed C1 receipt cannot distinguish a clean-env run from a hostile-env run. This supports the lesson:13 rejection. Any future text that cites the receipt as environment-independent evidence would be an overclaim.
- **Smallest correction:** L1 records the exact invocation and env policy in the receipt (for example a `command` field and `env: "env -i PATH=/usr/bin:/bin HOME=… TZ=UTC"`). Alternatively, the gate passes an explicit minimal env to its children, as in `scripts/check-aria-metadata.mjs:1799`.

## Not defects (read-verified only)

- The grammar regexes (`:367-372`, `:374-398`) still pass only argv to git, so no SCORECARD token reaches a shell from the new evaluator.
- `count_malicious_option_injection_refused` still covers only the textual `--git-dir`. The env equivalent is uncredited, as the lesson states.
- The production-alias usage refusal (`:301-303`) runs before any git call.

## For L1: commands to run after integration (not run by me)

1. Run the C1 selftest under a scrubbed env, never from inside a git hook:
   ```sh
   env -i PATH=/usr/bin:/bin HOME=$HOME TZ=UTC GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null node scripts/check-user-round-contract.mjs --self-test
   ```
2. Measure the C1 claim once the C1 receipt exists:
   ```sh
   node .ufo/waves/round-15/measure.mjs HEAD --claim C1
   ```
3. Optional falsifying probes. Run each only in a scratch copy outside the lane:
   - **F2:** set `core.hooksPath` to a `post-commit` that touches the marker, plus a no-op `tee` on PATH. Expect `count_witness_comparison` to still print `old_marker=1` with PASS. That would confirm the forgery.
   - **F4:** set `GIT_ICASE_PATHSPECS=1` on a grep-kind fixture row. Expect exit 1 with `counting_command_failed`, where the correct result is exit 2.
   - **F5:** in a scratch copy of the gate, replace runCount's spawn with `execSync`. Expect measure C1 to report no `run_count_shell` finding.

## Tooling

I installed or updated no tools. I made no pacman, uv, npm or cargo calls.
