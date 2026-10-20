# CountShellBoundary — USER grammar refusal ≠ hostile Git environment safety

Seat: TabiR15.CountShellBoundary (sentinel, read-only, author-side; not non-author certification).
Surface: `scripts/check-user-round-contract.mjs`. I read it at tag F083 and then at FE56. A sibling, TabiR15.CounterDiagnostics, edited it during my audit. Line anchors below are from **FE56**; F083 lines were 17 lower after line 83.
Nothing was executed: no gate, counter, self-test, test, or browser. No source edits. No tools installed or updated.
I ran only these commands: `git --version` (2.55.0), `node --version` (v24.21.0), `man -P cat git`, and `man -P cat git-grep`. I used them only to check the documentation for the env and config keys cited below.

## Verdict

The round-14/15 counting controls (`count_malicious_tee_refused`, `count_malicious_shell_refused`, and `count_malicious_option_injection_refused` at :880-890) prove only one thing: the **command-text grammar** refuses those strings. Nothing in the code or tests constrains the **process environment, Git config, or attributes** under which the accepted argv runs.

The lane's own disclaimers are already correct, and nothing in them should be weakened:
- SKILL.md:1725: "not certification that arbitrary repositories or Git environments are safe".
- SCORECARD.md:627-629: "Git config, PATH/environment/hooks/alias trust … remain uncredited".
- QUALITY.md:75-76, rule 21: "Counter safety is scoped to the accepted grammar, not the Git environment".

The defects below are reasons any round-15 C1 wording must keep that scope. They are also concrete tests if L1 ever wants to credit env hardening, which would be a separate claim and not part of round 15.

## Findings

### F1: HIGH. Environment overrides `--repo`, which defeats the option-injection refusal

- **Evidence:** `git()` at :113-115 and `runCount` at :420 call `spawnSync('git', args, { cwd: root, … })` with no `env`. Every `GIT_*` variable is inherited. Per `git(1)`, `GIT_DIR` "turns off the repository discovery", so `cwd` is ignored.
- **Exploit path:** the self-test refuses the text `git --git-dir=/var/tmp/other ls-tree …` (:888-890). The same redirection still happens when the caller's env has `GIT_DIR=/var/tmp/other/.git`, and every check then reads the other repository:
  - `checkHistory` (:595)
  - `roundIds`
  - `show(…, 'HEAD', …)`
  - `runCount`

  The `sameRoot`/realpath production gate (:296 and :594) looks only at the `--repo` string, so it gives no protection here.
- **Impact:** a fixture run can report `verdict=clean` for repository B while being asked about repository A. This is a false green with no grammar violation. Hooks set `GIT_DIR` legitimately, so this also happens by accident if the checker is run from inside a hook. `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, `GIT_NAMESPACE` and `GIT_REPLACE_REF_BASE` cause the same class of problem.

### F2: HIGH (self-test mutation). Fixture writes follow an inherited `GIT_DIR`/`GIT_INDEX_FILE`

- **Evidence:** `writeGoodFixture` (:631ff) runs `gitOk(root, ['init'])` and `['add','--','.']`. `commit()` (:625-629) runs `spawnSync('git', [... 'commit' ...], { cwd: root })`. Neither has an env scrub.
- **Exploit path:** run `--self-test` with `GIT_DIR` (or only `GIT_INDEX_FILE`) pointing at the production repository, which a pre-commit hook context does. `git init` and `git add .` then target that repository or index, using the temporary directory as the work tree. `commit` writes fixture commits onto the production branch. `rmSync(root)` (:1011) removes only the temporary work tree, so the commits and index damage remain.
- **Impact:** the self-test, which is advertised as isolated, can mutate a non-temporary repository. The "no marker" assertion (:1004) only checks `join(root, marker)`, so it cannot see this.
- [INFERENCE] I did not reproduce this. It follows from the `git(1)` semantics for GIT_DIR/GIT_INDEX_FILE and the code paths above.

### F3: MEDIUM. Config can change the counting semantics of accepted argv

- **Evidence:** the grep-kind argv is `['--literal-pathspecs','grep','-h','-e',pattern,rev,'--',path]` (:419). `git-grep(1)` documents that `grep.patternType` accepts basic, extended, fixed or perl, and that `grep.extendedRegexp` changes it too. The evaluator's comment says it supports GNU BRE (`.` wildcard, `^`/`$` anchors), and the fixture row uses `'^marker: admitted-user-round$'` (:699).
- **Exploit path:** `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=grep.patternType GIT_CONFIG_VALUE_0=fixed` makes `^…$` literal, so the count goes from 1 to 0. A `~/.gitconfig` or repo-local `.git/config` entry does the same. The grammar accepts the command, and the count changes anyway.
- **Scope:** the committed production USER rows (SCORECARD.md:336-377) are all the `ls-tree | grep` form. Those are filtered in JavaScript (:432-434 region), so this affects the grep/fixture path and any future grep rows, not today's production numbers.
- **Attributes [INFERENCE]:** binary detection in tree-mode `git grep` reads attributes from the worktree, `core.attributesFile`, and `GIT_ATTR_SOURCE`, not from the measured commit. A `-diff`/`binary` attribute would collapse matches to one "Binary file … matches" line per file. That would let uncommitted worktree state or user config change a count of a committed revision. This needs a fixture to confirm.
- **`core.quotePath` (low):** ls-tree rows are not `-z`. Non-ASCII paths are quoted, which changes how `^`-anchored JS regexes match. No current row is affected.

### F4: MEDIUM (C1 diagnostic truthfulness). Environment failures are labelled as data failures

- **Evidence:** at :424-425, every git status other than 0, and other than 1 for grep, becomes `fail('score_mismatch', …, 1, 'counting_command_failed')`, which reports exit 1 and `verdict=failed`.
- **Exploit/trigger:** `GIT_ICASE_PATHSPECS=1` (or `GIT_GLOB_PATHSPECS=1`) conflicts with `--literal-pathspecs`, and git exits 128.
  - [INFERENCE] I took the incompatibility from `git(1)`'s pathspec env descriptions and did not run it.
  - Other causes of 128: `safe.directory` "dubious ownership", or a missing object under partial clone.

  In every one of these cases the gate claims that the lane's recorded measurement is wrong. It should report could-not-evaluate.
- **Related:** `show()` and `blob()` (:123-133) return `null` on any nonzero status. Callers then report content findings such as "`spec is missing`" (short_swarm) for what are really environment or git failures.
- **Smallest fix:** separate "revision absent" (`git cat-file -e REV^{commit}` fails → `score_mismatch`, a reason like `counting_revision_missing`) from every other git failure (→ `could_not_evaluate`, exit 2, its own reason). Keep `count_missing_revision_red` (:900-905) asserting the first. Sent to TabiR15.CounterDiagnostics.

### F5: MEDIUM. Repo config, replace refs and lazy fetch are outside the grammar

- **Replace refs:** `git(1)` documents `--no-replace-objects` and `GIT_NO_REPLACE_OBJECTS`. Neither is used, so a `refs/replace/<measured>` in the evaluated repo changes what `ls-tree MEASURED` lists while the 40-hex operand still "matches" (`spec.rev === measured`, :409).
  - The comment at :156-157 shows awareness for the witness blob identity only.
  - `merge-base --is-ancestor` in `checkHistory` honours the same replacements.
- **Lazy fetch:** `git(1)` documents `--no-lazy-fetch` and `GIT_NO_LAZY_FETCH`. Neither is set, so reading a missing object in a promisor repo starts a fetch. Its transport is controlled by repo config. `git(1)` SECURITY says: "not safe to run Git commands in a .git directory … from an untrusted source. The commands in its config and hooks are executed". So "no token reaches a shell" (comment :357) is true of the SCORECARD text and false of the process as a whole.
- **PATH:** `spawnSync('git', …)` resolves `git` through the inherited `PATH`. No binary path or version is recorded in any receipt.

### F6: LOW. Side-effect assertions are scoped to the fixture root

`noMarker` (:1004) and the count witness (:840 and :844) check `existsSync(join(root, MARKER))` only. `GIT_TRACE`/`GIT_TRACE2=/abs/path` append to arbitrary files, per `git(1)`. A write outside the fixture root is invisible to the receipt. QUALITY rule 21 asks receipts to separate "applicable-and-absent" from "not applicable". Writes outside the root should be recorded as **not observed** and must not be counted as absent.

## Smallest remediation (if L1 chooses to credit it; otherwise keep the debt)

1. Add one `gitEnv()` used by `git()`, `runCount`, `commit` and every child `spawnSync(process.execPath, …)` (:458, :778-779, :838, :842, :1002, :1039):
   - Copy `process.env` and drop every key matching `/^GIT_/`.
   - Set `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_NO_REPLACE_OBJECTS=1`, `GIT_NO_LAZY_FETCH=1`, `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0` and `GIT_ATTR_NOSYSTEM=1`.

   The precedent for an explicit child env is `scripts/check-aria-metadata.mjs:1799`. `check-freshness.mjs:128` spreads `process.env`, so it does not scrub anything.
2. In `runCount`, add `-c grep.patternType=basic -c core.attributesFile=/dev/null -c core.quotePath=true`. Add `--attr-source=<target>`, or record that worktree attributes are an input.
3. Apply the F4 classification split.
4. Repo-local `.git/config` stays trusted for production. State this explicitly: fixtures are self-created, and production is the lane's own checkout.

## Proposed isolated CLI tests (for whoever owns the next code change; none run here)

| name | setup | expected after fix | current behaviour [INFERENCE from code] |
|---|---|---|---|
| `count_env_git_dir_ignored` | fixture A mutated so it should fail with after=2; fixture B clean; run `--repo A` with `GIT_DIR=B/.git` | evaluates A: exit 1, `score_mismatch`, reason `after_count_mismatch` | evaluates B, clean exit 0 (false green) |
| `selftest_env_no_foreign_mutation` | sentinel repo S; record `HEAD` and the index sha; run `--self-test` with `GIT_DIR=S/.git` | S's HEAD and index are byte-identical | fixture commits land in S |
| `count_config_patterntype_neutral` | fixture grep row `'^marker: …$'`; run with `GIT_CONFIG_COUNT/KEY/VALUE` setting `grep.patternType=fixed` | count 1, clean | count 0 → `before/after_count_mismatch` |
| `count_env_pathspec_conflict_cne` | `GIT_ICASE_PATHSPECS=1` on the grep row | exit 2 `could_not_evaluate`, distinct reason | exit 1 `score_mismatch` `counting_command_failed` |
| `count_replace_ref_ignored` | fixture: `git replace <measured> <decoy>` where the decoy tree lacks round-marker.txt | count from the real object, clean | the decoy is counted |
| `count_env_trace_no_write` | `GIT_TRACE=/var/tmp/<run>/trace` outside root | trace file absent | file created; the noMarker check cannot see it |

Each test should assert exit, finding and **reason** (QUALITY rule 21), not exit alone.

## Claim-boundary guidance for TabiR15 / L1

- C1 ("truthful USER counter refusal diagnostics … isolated CLI expected-reason assertions") may claim reason-level grammar refusals only. It must not say or imply "safe", "isolated from the environment", "hermetic", or "no shell execution" without the qualifier "for the SCORECARD command text".
- `counting_command_failed` with exit 1 is not yet truthful for environment-caused failures (F4). Either fix the classification or state this limit next to the reason vocabulary.
- These are not new defects introduced by round 15. Record them as inherited, uncredited env/config/attribute/replace/lazy-fetch debt under the existing SCORECARD.md:627-629 boundary. Nothing here inflates the scalar.

## Commands for L1 (after integration; I ran none of them)

- `node scripts/check-user-round-contract.mjs --self-test`. Run it with a scrubbed environment (`env -u GIT_DIR -u GIT_INDEX_FILE -u GIT_WORK_TREE …`) and **never from inside a git hook** until F2 is fixed.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff -- scripts/check-user-round-contract.mjs`: review the CounterDiagnostics reason changes against F4.
