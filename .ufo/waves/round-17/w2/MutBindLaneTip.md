VERDICT: ISSUES
Attacked: lane-tip anchoring of scripts/check-measurement-binding.mjs at M, using its own --self-test against eight independent mutations.
M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d. Result: 5 killed, 3 survived, 0 inconclusive. Survivors are self-test coverage gaps, not demonstrated defects in pristine M.
Axes: lane-tip mutation sensitivity; self-test coverage; isolated execution and byte-exact restoration. No production repair or integration performed.

## Scope, provenance, detector
- LANE = /home/vgpnk/Projects/shokunin/tabi-shokunin; S = /tmp/tabi-r17w2-MutBindLaneTip-rockt19j.
- Read PLAN.md including the L1 amendments, the wave-1 GateBindAnchor report, and operator tool rules before probing.
- Frozen source obtained with `git -C LANE show 6c97851034e9d8f58b135d28ff969f1f28fa2f7d:scripts/check-measurement-binding.mjs` and the same command for scripts/selftest-measurement-binding.mjs; both exited 0.
- Setup: `git clone --no-hardlinks LANE S/lane`; `git -C S/lane checkout --detach 6c97851034e9d8f58b135d28ff969f1f28fa2f7d`; eight additional --no-hardlinks clones from S/lane, each detached at M. All clone/checkout exits 0.
- Below, G:line = scripts/check-measurement-binding.mjs:line at M; T:line = scripts/selftest-measurement-binding.mjs:line at M. Numbered scratch reads match the frozen-source SHA-256 below.
- Each mutant used its matching directory name below under S. Detector D: `node S/<directory>/scripts/check-measurement-binding.mjs --self-test`, cwd S/<directory>, captured stdout/stderr, 180-second outer deadline. The unchanged child self-test bounds each gate child at 60 seconds (T:557).
- Ran D on pristine, mutated, and exactly restored bytes in every directory: 24 runs, at most four concurrent, all awaited; no background jobs. Observed elapsed times 4.171–5.205 seconds; no timeout/spawn failure.
- All eight pristine and all eight restored runs: exit 0, 76 PASS / 0 FAIL, empty stderr, final stdout `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13`.
- Expected detector: D must exit 1 and name a failed case for each weakening. Actual mutated output and the killing case/gap follow; no baseline failure was counted as a kill.

## Mutants and observed results
| ID / directory | Exact mutation against M | D exit; PASS/FAIL | Verdict; killing case |
|---|---|---|---|
| M01-threaded-HEAD | G:611: `diffNames(repo, measured, atRev, diffInputs)` → `diffNames(repo, measured, 'HEAD', diffInputs)` | 1; 74/2 | KILLED: lane_tip_detached_off_branch and lane_tip_detached_explicit_at_control |
| M02-drop-no-recurse | G:268: remove only `'--no-recurse'` from symbolic-ref argv | 1; 75/1 | KILLED: lane_tip_reflog_anchor |
| M03-status128-detached | G:278: `sym.status === 1` → `(sym.status === 1 || sym.status === 128)`, retaining empty-stdout condition | 0; 76/0 | SURVIVED: missing status-128 refusal case |
| M04-drop-symref-refusal | Delete G:306–309, the `target !== ''` refusal block; exact-row/refname guards retained | 1; 75/1 | KILLED: lane_tip_symref_anchor |
| M05-drop-repo-boundary | G:343: use `git(start, args)` without discovery ceiling; delete G:348–350 toplevel-identity refusal. Post-discovery ceiling assignment retained | 1; 75/1 | KILLED: repo_fallthrough_refused |
| M06-inherit-env | Insert `...process.env,` first in minimalEnv's object, after G:187; explicit hardening overrides retained | 0; 76/0 | SURVIVED: missing poisoned inherited-Git-environment case |
| M07-resolve-per-read | G:945: pass `options.at === null ? laneTip(repo) : atRev` into each evaluateClaim call instead of the already-resolved atRev; G:941 initial resolution retained | 0; 76/0 | SURVIVED: missing resolve-once/across-claims case |
| M08-missing-master-HEAD | Before G:311 insert `if (anchorRows === 0 && ref === 'refs/heads/master') return resolveCommit(root, 'HEAD', 'lane tip fallback');` | 1; 75/1 | KILLED: lane_tip_detached_no_master |

Actual failing stdout lines (all other case lines in those runs ended PASS):
```text
case=lane_tip_detached_off_branch expected_exit=0 actual_exit=1 expected_reasons=- actual_reasons=- FAIL
case=lane_tip_detached_explicit_at_control expected_exit=0 actual_exit=1 expected_reasons=- actual_reasons=counted_input_changed FAIL
case=lane_tip_reflog_anchor expected_exit=2 actual_exit=2 expected_reasons=revision_unresolved actual_reasons=git_failed FAIL
case=lane_tip_symref_anchor expected_exit=2 actual_exit=1 expected_reasons=revision_unresolved actual_reasons=counted_input_changed FAIL
case=repo_fallthrough_refused expected_exit=2 actual_exit=2 expected_reasons=git_failed actual_reasons=revision_unresolved FAIL
case=lane_tip_detached_no_master expected_exit=2 actual_exit=1 expected_reasons=revision_unresolved actual_reasons=counted_input_changed FAIL
```
- Each killed mutant's final stdout: `MEASUREMENT_BINDING_SELFTEST verdict=failed cases=76 reasons=13`; each survivor's: `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` (empty stderr).
- M01 off-branch JSON case (T:462) reports no text-mode reason because its stdout is JSON; its stderr failure detail is `FAIL_DETAIL case=lane_tip_detached_off_branch verdict=failed`. The shared detached explicit-at control (T:474) exposes counted_input_changed on counted/input.txt.
- M02 is a reason-class kill, not an exit-class difference: stderr records `git symbolic-ref -q HEAD failed (status=128) stderr=fatal: No such ref: HEAD` in the reflog fixture (T:537).
- M04 stderr identifies `reason=counted_input_changed detail=paths=counted/input.txt` rather than refusing the symbolic anchor (T:510).
- M05 is also a reason-class kill: stderr identifies `claim C1 measuredRevision 693277248832605321e9cb334a293604abce90ac does not resolve to a commit` after falling through into the parent. It does not demonstrate clean certification of that parent (T:488).
- M08 stderr identifies `reason=counted_input_changed detail=paths=counted/input.txt` instead of the required revision_unresolved refusal (T:481).

## Concrete coverage repairs for survivors (not implemented or run)
These proposed cases are [INFERENCE]; they retain the existing contract rather than relaxing it. Existing runGate uses only minimalEnv (T:551–557), so add a narrowly scoped per-case child-env override for the hostile-environment/shim fixtures, without poisoning fixture-building Git.
- M03: `lane_tip_symbolic_ref_128_refused`. Valid repo, detached HEAD, valid direct master; an absolute-PATH Git shim delegates everything except the lane-tip symbolic-ref query, which returns 128 with empty stdout. Require exit 2 / git_failed, not successful master fallback. The survivor would instead continue to master; this tests G:278 independently of repository discovery.
- M06: `lane_tip_inherited_git_environment_ignored`. Build a clean lane fixture and unrelated poison repo; launch the gate with GIT_DIR and GIT_WORK_TREE pointing to the latter. Require the original lane's clean verdict and JSON at equal to its tip. Pristine minimalEnv must discard both; the mutant inherits them and follows/refuses the wrong repository. Include the same-shape unpoisoned control.
- M07: `lane_tip_single_resolution_across_claims`. Use two honest claims and an absolute-PATH Git shim that returns the first resolved master OID, then advances master to a child with counted-input drift before returning control. Require clean evaluation at the original printed OID, and exactly one lane-tip resolution. The per-evaluateClaim re-resolution mutant observes the advanced tip; stable-ref fixtures cannot distinguish it. Explicit --at remains unchanged.
- Keep all five existing killing cases. M02/M05 currently prove exact refusal vocabulary, not every independent guard or every possible hostile shape; this probe does not overclaim that coverage.

## Before / mutated / restored hashes
Common pristine and restored gate SHA-256 (all eight copies):
`388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`
Unchanged self-test SHA-256 (all 24 runs, before and after each):
`8324692c65ca630dd31283e9840ea191b8ee973a1132e40465b6978122e426b3`
| Mutant | Mutated gate SHA-256 |
|---|---|
| M01 | 60f09a651e3f7827d835811a856245c43433a576327268e8c1b77acb81f6147b |
| M02 | da6960db6bb966da4dd705d387deb4e1de06f658eb5fe9489c21281bf8855687 |
| M03 | c0b5717cbf56ad5fde5981956193a0475e00bacfc0cf1eb9e5e0ff8ba91e826a |
| M04 | 284b5aab35951476339df20dce891ebf3c391ae0548d3aab139f5bab1fa6c5e1 |
| M05 | d80442262b9a32db4836077fe2c7a95afd07e387fe97a9f42aaea6a1e48d9af4 |
| M06 | aa66b1db7b46579261f979f947d35cde4edf5a710e652883330baa55bc3f78dc |
| M07 | bf21c61102d02f4316e386b68601c309a687aa3e033de0a14f0c3c8afecedca4 |
| M08 | 5ddbc34919eaf15c3c3dc6c302c874b2d42315589f595c2f62a6d12ece29ce22 |
- sha256sum before/after every D run matched within that phase. Every restored gate digest equals its pristine digest and the git-show M digest; every restored D passed. No self-test bytes were mutated.
- After restoration, `rm -rf -- /tmp/tabi-r17w2-MutBindLaneTip-rockt19j` exited 0. The sandbox was removed; the exact deltas, outputs, and hashes above preserve the probe evidence.
- Tools used: existing Node v24.21.0 and Git 2.56.0. No installs/updates, pacman transactions, browser, REA, jj, subagent dispatch, or Git writes in LANE/fleet. Only the report below was written outside scratch.

Files written:
- .ufo/waves/round-17/w2/MutBindLaneTip.md (this report)
