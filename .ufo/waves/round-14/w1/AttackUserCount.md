# AttackUserCount — C1 USER parser and frozen checker pin (read-only critic)

Target: `scripts/check-user-round-contract.mjs`. Line numbers below refer to HEAD `bebe2ef` (blob `7df3ee9f`) unless they are marked WT. WT means UserCounter's uncommitted diff as observed during this review (an added `ROUND_SCRIPT_ACCEPTED_SHA256` list).
Axes: operability (C1), calibration (red-finding identity), adjacency (path-alias surfaces).
No gate, selftest, witness, build or lint was executed. Investigation-only commands are listed under Evidence.

## Findings

### F1 — Production USER never exercises the counter; red identity hinges on the pin (blocker, fixable)
- `check()` runs `checkHistory` first. `round_count` then fires at L476 (`Found 6 user rounds, expected 10`), before any `runCount` at L494–495. In production the C1 parser is reachable **only** from fixtures.
- The production pin diff `92d700d..HEAD` contains `M scripts/check-round-contract.mjs`, so `acceptedRoundScript` runs on every production invocation.
- WT placeholder `ROUND_SCRIPT_CURRENT_SHA256 = 'ROUND14_CUTOVER_DIGEST_PENDING'`:
  - Left unfilled, it gives `could_not_evaluate` exit 2.
  - Filled with any digest other than the committed bytes, it gives `history_rewritten` exit 1.
  - Either way the preserved `round_count` red is lost.
- Selftest `round_script_cutover` reads **working-tree** `scripts/check-round-contract.mjs`. The digest must equal the exact bytes L1 commits.
- Smallest safe correction:
  1. Fill the constant from RoundCounter's final committed file.
  2. L1 confirms `git show HEAD:scripts/check-round-contract.mjs | sha256sum` equals that constant.
  3. L1 confirms production prints `finding=round_count` with exit 1.
- The round script does not pin the user script (grep: no reference), so there is no circular digest.

### F2 — The accepted set admits a rollback to the round-13 shell gate (tradeoff, fixable)
- WT accepts `{PRIOR, CUTOVER, CURRENT}`. `acceptedRoundScript` checks only the HEAD bytes, not history. After round 14 lands, CUTOVER (`8478cd43…`, the round-13 gate that still runs `bash -c`) serves only to accept a later revert of C1.
- Counterexample: a commit restores `git show 1212207:scripts/check-round-contract.mjs`. With WT the USER gate stays at `round_count`, so the C1 regression is silent.
- PRIOR rollback: the diff becomes empty, so `pstackDrift` is never consulted under any policy. Only a positive production check `sha256(HEAD:ROUND_SCRIPT) === CURRENT` could catch that.
- Smallest correction:
  - Accept `{PRIOR, CURRENT}`.
  - Keep `ROUND_SCRIPT_CUTOVER_SHA256` as a historical identity that is verified, not accepted. In production only, require `sha256(show(root,'1212207fd7fad4adf1df1b3a2bde549235bd144d',ROUND_SCRIPT)) === CUTOVER`, otherwise `could_not_evaluate`. I recomputed it: blob `43db9f4b`, sha256 `8478cd43…`, which matches.
  - Add selftest `round_script_rollback_to_cutover`: the fixture writes those bytes from `defaultRoot` and expects `history_rewritten`.

### F3 — Exact historical grammar and counts (evidence for "counts preserved")
- All six committed rows (`SCORECARD.md:332-379`) match one strict form exactly, with single spaces, no quotes and no tabs:
  `^git ls-tree -r --name-only ([a-f0-9]{40}) \| grep ([A-Za-z0-9._/][A-Za-z0-9._/-]*) \| wc -l$`
- The rev equals `measured-against` in every row.
- Recomputed with argv `git ls-tree -r --name-only REV` and BRE matching (`.` = any char): r01–r06 give before **0** at `7f506aff` and after **1** at each measured commit.
  - `includes()` gives the same counts.
  - The original bash output agrees on all 12 measurements.
  - Every measured commit is an ancestor of HEAD.
- Semantics to keep exact:
  - GNU grep BRE: of the allowed characters, only `.` is special. Implement `.` as any char. Do not use `includes()`; that is a different matcher, even though it is count-equal today.
  - Each matching line counts once. A trailing empty segment is not a line.
  - Output `String(n)` so the existing string compare (`"0"`/`"1"`) is unchanged.
  - grep with no match exits 1, but the pipeline exits through wc, so the count is **0**, not a failure.
- Deliberate fail-closed divergence: legacy bash without pipefail turned a failing `git ls-tree` (bad or missing rev) into count 0 with exit 0. The argv evaluator must give `score_mismatch` for git status ≠ 0 or for `result.error` (ENOBUFS/ETIMEDOUT).
  - Set `maxBuffer` explicitly. HEAD's tree listing is already 165,414 bytes against the 1 MiB default.
  - Keep `timeout: 30000`.
  - No historical row relies on the fail-open path.
- Parse **both** `beforeCommand` (after the existing `replaceAll`) and `command` independently. Require the parsed rev `=== options.baseline` and `=== score.measured` respectively. That preserves the legacy replaceAll-in-pattern behavior exactly, and closes the counterexample below.

### F4 — Hostile grammar that passes today's prefilter (L304) and must be refused without execution
The prefilter forbids only ``;&`<>\n\`` and `$(`/`${`. The following pass it today, and each must become `score_mismatch` with no side effect:

| # | command (M = measured) | what bash does today |
|---|---|---|
| 1 | `git ls-tree -r --name-only M \| grep p \| tee /var/tmp/MARK \| wc -l` | writes a file |
| 2 | `git show M:x.sh \| bash \| wc -l` | runs committed lane code |
| 3 | `git -C /tmp/forge ls-tree -r --name-only M \| grep p \| wc -l` | counts in another repo (path alias) |
| 4 | `git --git-dir=/tmp/forge/.git ls-tree …` | same |
| 5 | `git ls-tree -r --name-only M:corpus/evidence \| grep p \| wc -l` | tree-path alias; relative namespace |
| 6 | `git ls-tree -r --name-only HEAD \| grep M \| wc -l` | passes the replaceAll check while measuring HEAD |
| 7 | `… \| grep -v p \| …`, `grep -e`, `grep --file=/etc/passwd` | grep options |
| 8 | `… \| grep p* \| …` | filesystem glob in the cwd |
| 9 | `… \| grep $HOME \| …` | environment expansion |
| 10 | `… \| wc -l # x`, `… \| wc -l \| cat`, `wc -l -c`, `\|\|` | comment, extra stage, extra option |
| 11 | a tab or double space as separator; NBSP or fullwidth `｜` | whitespace and homoglyph |
| 12 | uppercase hex rev | already `missing_score` via the replaceAll identity check; keep it |

- Keep the prefilter, so its rejections stay `missing_score`; only parser rejections are `score_mismatch`.
- For a no-marker selftest, use #1 with a marker under the case's tmp dir, and assert `!existsSync(marker)` together with `finding=score_mismatch`.

### F5 — The fixture grammar is not a historical grammar (simplification)
- `writeGoodFixture` L580 uses `git grep -h '^marker: admitted-user-round$' M -- round-marker.txt | wc -l`. No committed user row uses it.
- Supporting it adds quoting, `^…$`, `-h`, pathspec handling and the git-grep exit-1 path.
- Smallest correction: change the fixture to `git ls-tree -r --name-only ${measured} | grep round-marker.txt | wc -l`, which counts 0 at the baseline and 1 at measured. Then support exactly one grammar.
- The witness legacy arm (blob `18e2c79a`, `check()` L336–341 in that blob) fails inside `checkHistory` (SHONEN) before it reads SCORECARD, so its `history_rewritten` is unaffected. The new arm stays `clean`.
- Keep the grammar byte-identical with RoundCounter's. The pstack rows need chained greps (r02) and a single-quoted `'.txt'` (r03); USER needs one unquoted grep. Two divergent parsers would be two authorities, so document which subset each script accepts.

### F6 — Witness provenance (item 3 of the round-13 verifier, `corpus/lessons/round-13-verifier-spotcheck.md:160`)
- The new arm executes the working-tree `script` (L650), not committed bytes.
- Print:
  - `new_sha256` = sha256 of `readFileSync(script)`
  - `head_blob` = `HEAD:scripts/check-user-round-contract.mjs`
  - `worktree_blob` = `git hash-object`
  - `committed` = `yes|no`
- Print `measuredRevision=<HEAD>` only when `committed=yes`. Otherwise print `measuredRevision=uncommitted`, so the binding is not false.

### F7 — Path-alias loopholes outside C1 (separable; do not fold into C1 claims)
1. **Git C-quoting bypass** (confirmed in a scratch repo). `git diff --name-status` and `ls-tree --name-only` print non-ASCII or quote-bearing names C-quoted, e.g. `"corpus/evidence/pstack-20261015/tamp\303\251red.tsv"`.
   - `pstackDrift` (L208) tests `startsWith('corpus/evidence/pstack-20261015')`, gets false, and `protectedPath` is also false, so the tamper is **undetected**.
   - The same quoting in `list()` (L94) makes `scanConsequential` skip the file (L416 `continue`) and makes `sameTree` compare `null === null` (L435).
   - Result: post-measure evidence edits and consequential needles hide in non-ASCII-named files.
   - Fix: use `-z` on both the diff and `ls-tree`, and split on NUL.
   - Baseline and HEAD currently have 0 quoted paths, so the fix changes no current result.
2. **Production identity is by path, not content.**
   - `sameRoot` (L237) uses realpath only. A `git worktree add`, a clone or a bind mount of the lane is "non-production", so it accepts `--expect 6` and runs with no pstack pin.
   - `[INFERENCE]` That could print `verdict=clean rounds=6` with no mode label.
   - Fix: treat any `--repo` whose HEAD descends from `HARD_BASELINE` as production; fixtures cannot contain that commit. Add a worktree-alias selftest next to the symlink one (L769).
3. **Object/env aliasing.** This applies to every git call, before and after C1:
   - inherited `GIT_DIR`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES` and `GIT_CONFIG_PARAMETERS`
   - `refs/replace` (0 present now)
   - repo `core.quotePath`
   - Optional hardening: `--no-replace-objects` and `-c core.quotePath=true`.
   - The SKILL trust-boundary text (`SKILL.md:1680-1686`) says the gates run lane-authored commands through a shell. After C1 that sentence is false. L1 should append an erratum (SKILL is append-only by convention) stating that the shell is removed, and that the gate is still not an untrusted-repo validator because of git config/env/replace refs and the external VALIDATOR spawn.
4. Do not modify `corpus/lessons/round-13.md` this round. It is `A` since the pin, so any later M turns the production red into `history_rewritten`.

## L1 verification commands (run after both seats land and are committed)
```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git show HEAD:scripts/check-round-contract.mjs | sha256sum      # == ROUND_SCRIPT_CURRENT_SHA256
node scripts/check-user-round-contract.mjs; echo exit=$?          # expect exit=1 finding=round_count "Found 6 user rounds, expected 10"
node scripts/check-user-round-contract.mjs --self-test; echo exit=$?   # all PASS incl. hostile/no-marker, rollback_to_cutover
node scripts/check-user-round-contract.mjs --witness <legacy-rev>; echo exit=$?  # old history_rewritten, new clean, committed=yes
grep -n "spawnSync('bash'" scripts/check-user-round-contract.mjs scripts/check-round-contract.mjs   # expect none
```

## Evidence (investigation only; no gate/selftest/witness run)
- Read HEAD source; `git diff HEAD -- scripts` (WT accepted-set diff); `git rev-parse HEAD:scripts/*`.
- Recomputed sha256 at `92d700d`, `1212207` and HEAD for `scripts/check-round-contract.mjs` (`7d403cee…`, `8478cd43…`, `8478cd43…`).
- Pin diff `--name-status` (21 lines; the script is `M`).
- Python recount of r01–r06 with argv `git ls-tree`, plus `bash -c` of the six committed commands. These were run only after confirming each one matched the strict read-only grammar above.
- `git cat-file -p 18e2c79a` to confirm the order in legacy `check()`.
- Scratch repo under `/var/tmp` (removed) confirming git C-quoting.
- `node v24.21.0`, `git 2.55.0`. No tools installed or updated.

Message sent: `agent://TabiR14.UserCounter` (summary of F1–F6).
