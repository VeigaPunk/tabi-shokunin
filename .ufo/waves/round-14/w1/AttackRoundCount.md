# AttackRoundCount — C1 parser critique (round 14, w1)

Role: critic, read-only. Target: `scripts/check-round-contract.mjs`. I reviewed the RoundCounter draft at snapshot `#8A91` (worktree sha256 was still changing during the review). I made no edits to the gate. I did not run any gate, selftest or witness. The only things I ran were read-only `git ls-tree` / `git cat-file` / `git merge-base` on the lane repo, plus a git/grep behaviour probe in throwaway `/var/tmp/attackprobe-*` repos, which I deleted afterwards. No tools were installed or updated.

Axes: operability (C1 shell-execution removal), calibration (historical count fidelity), provenance (whether before/after measure what they claim).

## Historical grammar (evidence)

- Production rows `SCORECARD.md:242,250,258,266,274,282,290,298,306,314`: all 10 use `git ls-tree -r --name-only <40hex> | grep <pat> [| grep <pat>] | wc -l`. The only quoted pattern is `'.txt'` (r03). No pattern contains a 40-hex string, and in every row the rev token equals `measured-against`.
- Fixture grammar `scripts/check-round-contract.mjs:657`: `git grep -h '<BRE>' <rev> -- <path> | wc -l`.
- I recomputed every pstack and user row against baseline `7f506aff…` and against its measured commit. With BRE-regex semantics and with substring semantics the counts are the same: `0` before, and after `1,2,4,1,1,1,1,1,1,1` (pstack) and `1×6` (user). These equal the recorded before/after values.
- All 17 revs resolve to commits. `merge-base --is-ancestor <baseline> <rev>` is 0 for each. No tree has a quoted (non-ASCII) path.
- Historical failure semantics (probed): a bad rev in either form prints a fatal message to stderr, but the pipeline still outputs `0` with rc 0 because the exit status is `wc`'s. `git grep` returns no-match as rc=1, and the pipeline outputs `0`.
- Legacy filter `:280` accepts `git show HEAD:x.sh | sh`, `git -c core.pager=x log | wc -l` and `git grep -O… | wc -l`. That is the C1 hole.
- `git grep --open-files-in-pager='touch PWNED' … -- f` on a worktree created `PWNED` with no shell involved. So passing argv alone is not enough; option tokens must be refused. The draft does this: `-h`/`--` are fixed positions, `-e` is supplied, and a leading `-` is refused.
- Legacy witness blob `b2eb8316…`: `checkHistory` (:282) runs before `runCount` (:301). The `--witness` arm therefore never reaches the shell on the shared fixture.

## Findings

1. **HIGH — the new count selftests and `--count-witness` cannot pass as written.**
   - Mutators at `:812,:816,:820,:824,:828,:832` and `countWitness` at `:940` take `rev-parse HEAD`, which is the fixture's `measure` commit (`writeGoodFixture` `:674`).
   - The fixture's `measured-against` is the `work` commit (`:656`, `:658`), and `rewriteScoreCommand` (`:697-703`) leaves it unchanged.
   - So `command.replaceAll(measured, baseline)` is a no-op, and `check()` fails `missing_score` ("does not use the measured commit") before `runCount` runs.
   - Effects:
     - The supported cases expect `clean` and get exit 1 `missing_score`.
     - The malicious cases expect `score_mismatch` and get `missing_score`. Their `no_marker=1` therefore proves nothing about the parser.
     - The old arm of `countWitness` (`43db9f4b` has the same guard) is not `clean`, its tee never runs, and the result is `FAIL`.
   - Smallest fix: in the mutators and in `countWitness`, read the fixture's measured commit from SCORECARD.md (`/^measured-against: ([a-f0-9]{40})$/m`) instead of using HEAD. The expected values stay valid at `work`: 32 seat `result.json`; 32 `git grep 'marker counted for'` lines, because each seat file is one JSON line with no trailing newline and git grep newline-terminates it; `round-marker.txt`=1.
2. **MED — provenance: the rev token is not bound to the measured or baseline commit.**
   - The before arm is a textual `replaceAll` (`:567-569`), and `countRevision` (`:338`) only checks that the token is 40-hex.
   - Counterexample: a command whose rev is an arbitrary commit `C` and that mentions the measured sha only inside a grep pattern passes the guard. Its "before" then never lists the baseline tree.
   - Fix: parse `score.command` once; require rev token `=== score.measured`; reject the measured hex in any other token; evaluate the before arm by substituting `options.baseline` for the rev token. All production rows already comply.
3. **MED — parse divergence: a quoted `'|'` is treated as a pipe.**
   - `countStages` pushes the operator (`:306`) and the quoted token (`:320`) as the same string.
   - In bash, `git ls-tree -r --name-only M '|' grep x | wc -l` lists literal paths and gives `0`. The draft evaluates it as `ls-tree | grep x`.
   - Fix: give operators a distinct sentinel or object.
4. **LOW — selftests do not show which guard rejected each case.**
   - `count_traversal_grep_path` (`:832`) is rejected by "adds stages after git grep" because of `tee`, before `countPath` runs. git itself would also reject `../` with exit 128.
   - Drop the `tee`, and assert a per-case detail substring rather than only `finding=score_mismatch`.
   - Missing cases: a leading-dash pattern in a two-token stage (`| grep --file=x |`), unquoted `$VAR`, a tab separator, and a quoted `'|'`.
5. **LOW — deliberate tightening that should be documented.** A rev or object failure was historically count `0`. It is now `score_mismatch`, which fails closed. Per the evidence above, no historical row is affected.
6. **LOW — exactness edge cases.**
   - Use `new RegExp(source, 's')` so `.` matches U+2028/2029 the way GNU grep does. This only matters under `core.quotePath=false`.
   - ls-tree output is 165 KB at HEAD and 141 KB at most for the measured revs, under the default 1 MiB `maxBuffer`. An overflow fails closed.

Also checked and fine:
- The `:280` metachar filter still runs first, so the historical `missing_score` red finding is kept.
- The BRE subset translation (`:356-383`) is faithful: `.` `*` and anchors are handled, `+?(){}|` are escaped as GNU-BRE literals, `\ [ ]` are refused, and `a**` throws and fails closed.
- No-match gives `0` in both forms.
- Newline counting is the same as `wc -l`.

Cross-gate note, sent to UserCounter: `check-user-round-contract.mjs:22` calls `8478cd43` a "git blob". It is the sha256 of the round-13 gate; the git blob is `43db9f4b`. The CURRENT round-gate digest must be taken only after RoundCounter's final edit.

## Commands for L1 (after all seats land)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-round-contract.mjs --self-test
node scripts/check-round-contract.mjs --witness 7f506affa55f6fb892d3c8073c75151c998bdf2c
node scripts/check-round-contract.mjs --count-witness 1212207
node scripts/check-round-contract.mjs
sha256sum scripts/check-round-contract.mjs   # must equal ROUND_SCRIPT_CURRENT_SHA256 in the user gate
```
