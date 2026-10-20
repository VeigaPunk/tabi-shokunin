VERDICT: ISSUES
Attacked: the lane-tip anchoring self-test coverage of scripts/check-user-round-contract.mjs at M=6c97851034e9d8f58b135d28ff969f1f28fa2f7d.

Axes: anchoring soundness; detector sensitivity; exact-byte restoration; bounded, isolated execution.
Result: 8 independent mutants; 2 killed, 6 survived, 0 inconclusive. Survivors are coverage gaps, NOT evidence that pristine M violates its contract.

## Reproduction and detector
- Canonical source observed with `git show 6c97851034e9d8f58b135d28ff969f1f28fa2f7d:scripts/check-user-round-contract.mjs`; all line citations below refer to that source at M.
- Sandbox S=/tmp/tabi-r17w2-MutUserLaneTip-VdGk, created with mktemp; `git clone --quiet --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin "$S"`; detached checkout M; sandbox master explicitly pinned to M.
- Eight isolated detached worktrees at `$S/M01` through `$S/M08`, each initially M; no lane source or sibling source was mutated.
- Detector D(i): `node "$S/$i/scripts/check-user-round-contract.mjs" --self-test`, cwd `$S/$i`, subprocess timeout 90 seconds, captured stdout/stderr/exit.
- Ran D on pristine, mutated, and exactly restored bytes for EACH mutant: 24 designated runs. Each phase ran its eight independent detectors concurrently, joined before proceeding; no background jobs or subagent dispatch.
- Initial clone also ran D successfully before the eight-copy experiment. Tools: Node v24.21.0, git 2.56.0. Installs/updates: none.

## Mutants and observed verdicts
Exit triple = pristine / mutated / restored; each pristine/restored run reported all 45 cases clean.

| ID | Small behavior-bearing change at M | Exit triple | Verdict | Killing case / coverage finding |
|---|---|---|---|---|
| M01 | L700: lesson `show(root, tip, ...)` becomes `show(root, 'HEAD', ...)` | 0 / 1 / 0 | KILLED | `detached_head_reads_lane_tip`: child exits 1, missing_gate, instead of clean 0 |
| M02 | L175: remove `--no-recurse` from HEAD symbolic-ref query | 0 / 0 / 0 | SURVIVED | No attached, chained branch-symref refusal case |
| M03 | L183: accept status 128 with empty stdout as detached, alongside status 1 | 0 / 0 / 0 | SURVIVED | No non-detached symbolic-ref failure-status case |
| M04 | L196: reject only empty anchor output, allowing nonempty symref targets | 0 / 1 / 0 | KILLED | `lane_tip_symref`: child exits 1, short_swarm, instead of could_not_evaluate 2 |
| M05 | Delete ceiling construction L140–144 AND discovered-toplevel checks L167–171 | 0 / 0 / 0 | SURVIVED | No enclosing-repository discovery case |
| M06 | L127: spread `...process.env` into child env before the existing fixed overrides | 0 / 0 / 0 | SURVIVED | No inherited GIT_DIR/GIT_WORK_TREE poisoning case |
| M07 | Delete L164 cached-tip early return; every laneTip call re-resolves | 0 / 0 / 0 | SURVIVED | No branch-movement / resolve-once case |
| M08 | L196: if master anchor is absent, set ref='HEAD'; otherwise retain refusal | 0 / 0 / 0 | SURVIVED | No detached-HEAD-with-missing-master case |

All eight modifications left the detector and its case expectations unchanged. M06 retained GIT_NO_REPLACE_OBJECTS and the other explicit overrides: surviving is specifically about inheriting unlisted environment variables, not removing the replace-ref defense.

## Actual detector output
Every pristine and restored run, and mutated M02/M03/M05/M06/M07/M08, exited 0 with empty stderr and this final stdout line:
```text
USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1
```
M01 mutated stdout's failing case, then stderr (top-level exit 1):
```text
SELFTEST name=detached_head_reads_lane_tip expected_exit=0 actual_exit=1 expected_finding=clean reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na kind=child_cli isolation=cli result=FAIL
USER_ROUND_CONTRACT verdict=failed finding=selftest_failure detail=USER_ROUND_CONTRACT verdict=failed finding=missing_gate detail=user-20261015-r01 lesson has no Gate
```
M04 mutated stdout's failing case, then stderr (top-level exit 1):
```text
SELFTEST name=lane_tip_symref expected_exit=2 actual_exit=1 expected_finding=could_not_evaluate reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na kind=child_cli isolation=cli result=FAIL
USER_ROUND_CONTRACT verdict=failed finding=selftest_failure detail=USER_ROUND_CONTRACT verdict=failed finding=short_swarm detail=user-20261015-r01 accounts for 31 results
```
These are killed mutants because their own pristine and restored arms pass, not merely because the mutated gate returns nonzero.

## Concrete coverage repair: proposed additional self-test cases
[INFERENCE] The following are case designs to close each observed gap; they were NOT implemented or run in this assignment. Keep the existing production contract unchanged.
- M02 — `lane_tip_attached_chained_symref_refused`: attach HEAD to refs/heads/alias, itself a symref to a real refs/heads/landing branch with clean fixture bytes. Require exit 2 and symbolic-ref anchor refusal. Without --no-recurse, symbolic-ref skips alias and sees the ordinary landing branch. The existing `lane_tip_symref` case leaves HEAD detached, so it does not exercise this difference.
- M03 — `lane_tip_symbolic_ref_128_refused`: child-only Git shim returns status 128 and empty stdout solely for the HEAD symbolic-ref query; delegate other calls to real Git. Require exit 2 with `HEAD symref query failed (status=128)`, not fallback to existing master. This isolates the strict status-class contract without breaking fixture setup or the earlier toplevel query.
- M05 — `lane_tip_parent_repository_refused`: pass --repo pointing to a child directory with no qualifying .git inside an otherwise valid parent fixture repository. Require could_not_evaluate 2 rather than certification of the parent's clean committed tree.
- M06 — `lane_tip_hostile_git_env_ignored`: build clean and poisoned repositories, then spawn only the checked child with GIT_DIR/GIT_WORK_TREE targeting the poison. Require the same clean fixture verdict as the unpoisoned child; the constructed Git environment must ignore both values.
- M07 — `lane_tip_resolved_once_under_ref_move`: a child-only real-Git wrapper returns initial commit A on the first anchor resolution and then moves the fixture branch to poison B. Require all subsequent committed reads and revision fields to remain A; also assert one successful anchor resolution per root. This deterministically exercises the snapshot invariant rather than hoping for a race.
- M08 — `lane_tip_missing_master_refused`: detach HEAD at a clean fixture commit, delete refs/heads/master, and require could_not_evaluate 2 naming the missing master anchor. A valid HEAD must not rescue a missing lane branch.

## Hashes and exact restoration
P = canonical SHA-256 `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`.
SHA-256 was recorded with sha256sum for each pristine, mutated, and restored script. All eight pristine hashes=P; all eight restored hashes=P.

| ID | Mutated SHA-256 | Before / restored |
|---|---|---|
| M01 | ba16f8294d9728c6ecc840af2cf06d9dba5436af354e5fa15d2b24b7cdf2c47a | P / P |
| M02 | a380d63bb6d102452d35559adfe7b0327a2f1cac01829c64fbf89b6e72571eb7 | P / P |
| M03 | 3db06a4759853a58d172ba5f42ced25010260452a6d65afd639d1ea2701d6abd | P / P |
| M04 | 061ba9ae4be0ef81d882ac16575f10e3513562cc44a3d7bb6daa66a7500d7e77 | P / P |
| M05 | 00d2dc40d014332aa62755cd6f127eccd87e583f029297887ca13acb5a1121a7 | P / P |
| M06 | 9a897c19e14617adda5d01d6c02c74406ca1ba2564c944fcde4218defb92ad3a | P / P |
| M07 | f6e453ccc3176912ffbc56d6c775d0929abc0f7d08c91880594488ad737166f5 | P / P |
| M08 | 74a3985ec2557a52c171c4655d5eed756b43cd2d43fc5db08060ed03772ba411 | P / P |

Inverse surgical patches restored each original script. For each M01–M08, `cmp --silent - <script>` with stdin equal to the bytes returned by `git show M:scripts/check-user-round-contract.mjs` exited 0, proving exact equality, not only matching digests. Restored D then exited 0 in all eight copies. No baseline/restoration failure or timeout occurred.
Cleanup: `rm -rf -- /tmp/tabi-r17w2-MutUserLaneTip-VdGk` exited 0 after restoration and restored detectors; no sandbox retained.
Files written: .ufo/waves/round-17/w2/MutUserLaneTip.md (only persistent lane write); eight temporary script mutations under S/M01–M08, restored exactly and then removed with their sandbox. No production change, integration, or shipping action.
