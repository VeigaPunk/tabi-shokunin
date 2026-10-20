VERDICT: ISSUES
Attacked: C1 lane-tip anchoring in `scripts/check-round-contract.mjs` at M; specifically whether its own `--self-test` rejects eight plausible anchoring regressions.

Axes: operability (one committed branch snapshot), calibration (detector sensitivity), isolation/restoration (no lane-source mutation).
M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`; all source line references below are at M, obtained with `git show M:scripts/check-round-contract.mjs` (M expanded to the hash above).
Result: **3 KILLED, 5 SURVIVED, 0 INCONCLUSIVE**. Survivors establish coverage gaps, not a production defect in pristine M or permission to relax its contract.

## Isolation, detector, controls
- Eight independent `/tmp/tabi-r17w2-MutRoundLaneTip-<suffix>` clones; suffixes in the table below identify the actual directories.
- Each prepared using `git clone --quiet --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin <sandbox>` and `git -C <sandbox> checkout --quiet --detach 6c97851034e9d8f58b135d28ff969f1f28fa2f7d`; all 16 commands exited 0.
- Same detector in all 24 invocations: `<node> <sandbox>/scripts/check-round-contract.mjs --self-test`, cwd `<sandbox>`, subprocess timeout **40 seconds**. No invocation timed out or was signaled.
- `<node>` = `/run/user/1000/fnm_multishells/2768_1792501039009/bin/node`; observed Node `v24.21.0`, Git `2.56.0`. No installation/update.
- Three foreground batches, eight isolated detectors each: pristine, mutant, restored. No subagents, background jobs, jj, lane git writes, browsers, or other runtime invoked.
- Expected detector: nonzero self-test exit with a failing case after passing pristine/restored controls kills; exit 0 with the clean summary survives. A failing baseline/restoration would be inconclusive.
- Every pristine and restored control: exit 0, **41 `result=PASS` lines**, empty stderr, final `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1`.
- All 16 controls and all five survivors had byte-identical stdout, SHA-256 `5e1c535b40314815a1105f01d6fe0e3617991e6ed82b447dd46d50fdb5646e42`.

## Eight defects and actual results
Times are pristine / mutant / restored milliseconds. Each row is a separate defect, never accumulated with another row.

| ID / sandbox suffix | Mutation at M | Times ms | Mutant exit | Verdict / killing case |
|---|---|---:|---:|---|
| M1 / bzi6c79x | :540 aggregate `show(root, rev, ...)` → `show(root, 'HEAD', ...)` | 7094 / 534 / 6453 | 1 | KILLED: `lane_tip_detached_head` |
| M2 / jfrtiyxs | :123 remove `--no-recurse` from `symbolic-ref` | 7091 / 5979 / 6467 | 0 | SURVIVED; closure case S2 below |
| M3 / kdvfqzvo | :130 accept `(sym.status === 1 || sym.status === 128)` with empty stdout as detached | 6966 / 5989 / 6354 | 0 | SURVIVED; closure case S3 |
| M4 / vwe25fjp | :145 change refusal predicate to `anchor.status !== 0`, dropping symref-output refusal | 7087 / 1441 / 6493 | 1 | KILLED: `lane_tip_symref` |
| M5 / pjcwe0n9 | Delete ceiling assignment :80–84 AND toplevel guard :115–122 (the paired ancestor-discovery defenses) | 6997 / 5820 / 6455 | 0 | SURVIVED; closure case S5 |
| M6 / 57n8il5e | :67 add `...process.env,` before existing hardened env keys; preserve explicit overrides | 6965 / 6173 / 6401 | 0 | SURVIVED; closure case S6 |
| M7 / 4b4bjlsy | :540 aggregate read uses `laneTip(root)` per call instead of the already-resolved `rev` | 7090 / 6041 / 6489 | 0 | SURVIVED; closure case S7 |
| M8 / obro0bn3 | After :145, missing master falls back to verified `HEAD^{commit}` instead of refusing | 7057 / 1054 / 6230 | 1 | KILLED: `lane_tip_unresolvable` |

M7 deliberately re-resolves at one behavior-bearing read, the smallest violation of once-per-check resolution (:651); it does not replace historical baseline/measured-commit reads.
M8's inserted statement: `if (anchor.status === 0 && anchor.stdout === '' && ref === 'refs/heads/master') return gitOk(root, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}']);`

## Actual killing output
The following stdout lines are exact; all three outer detectors exited 1 with `finding=selftest_failure` on stderr.
```text
M1: SELFTEST name=lane_tip_detached_head expected_exit=0 actual_exit=1 expected_finding=clean result=FAIL
M4: SELFTEST name=lane_tip_symref expected_exit=2 actual_exit=0 expected_finding=could_not_evaluate result=FAIL
M8: SELFTEST name=lane_tip_unresolvable expected_exit=2 actual_exit=0 expected_finding=could_not_evaluate result=FAIL
```
M1 stderr (nonblank line):
```text
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND_CONTRACT verdict=failed finding=short_swarm detail=pstack-20261015-r01 accounts for 31 results
```
M4 and M8 each emitted these identical nonblank stderr lines:
```text
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND id=pstack-20261015-r01 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=1 spot=agree consequential=0 before=0 after=1 measured-against=68825e654ea0432dbd682d93115f565f09e50539
ROUND_CONTRACT verdict=clean rounds=1 consequential=0
```
M1's subsequent `lane_tip_detached_head_branch_names_poison` arm still PASSed (expected/actual exit 1, `short_swarm`); that did not override the failing detached clean arm.
M3 retained this exact existing-case output despite the regression:
```text
SELFTEST name=lane_tip_invalid_head expected_exit=2 actual_exit=2 expected_finding=could_not_evaluate result=PASS
```

## Surviving mutants: named cases that would close each gap
These are concrete proposed repairs to self-test coverage, **not executed cases**; predicted discrimination is [INFERENCE]. Preserve the current production contract.
- **S2 `lane_tip_attached_local_symref`**: attached HEAD → master → another *local* plain branch. Require exit 2 for symbolic master. Original `--no-recurse` exposes master to the symref guard; M2 recursively resolves the other local branch and accepts it. A remote target would not discriminate because the local-branch-name guard independently refuses it.
- **S3 `lane_tip_symbolic_ref_status128`**: valid toplevel and valid master; an absolute-PATH Git shim used only for the gate child forces the HEAD `symbolic-ref` call to exit 128 with empty stdout, forwarding all other commands. Require exit 2 and `git symbolic-ref could not read HEAD`; M3 instead certifies master. Existing `lane_tip_invalid_head` passing under M3 does not establish this status-class sensitivity.
- **S5 `lane_tip_nested_parent_discovery`**: pass a nested `--repo` directory with no usable `.git` beneath a valid parent fixture repository. Require exit 2 with `Lane root is not the repository toplevel`, before any parent-tree round verdict; M5 can discover the enclosing repository. Both defenses are removed together because either alone may mask the listed discovery regression.
- **S6 `lane_tip_hostile_git_env`**: clean fixture A plus clone B whose master points to poison. For the gate child only, inject `GIT_DIR=B/.git` and `GIT_WORK_TREE=A`; require A's original clean verdict. The worktree setting keeps toplevel equal to A while M6 reads B's objects/refs. Existing replace-ref control does not cover inherited redirection because M6 still explicitly sets `GIT_NO_REPLACE_OBJECTS=1`.
- **S7 `lane_tip_single_snapshot`**: deterministic absolute-PATH Git shim returns clean tip A for the first anchor resolution, then moves master to poison P before returning. Require the entire invocation to retain A's clean result; a subsequent fresh invocation must see P's `short_swarm`. M7's aggregate-call re-resolution sees P mid-verdict. Do not use sleep/racing timing as the assertion.

## Source hashes and exact restoration
H0 = `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828` (67,322 bytes at M).
`sha256sum` recorded H0 for every actual scratch file before mutation and after inverse surgical edits. Each transition was **H0 → below → H0**, including the three failing detectors.

| ID | Mutated file SHA-256 |
|---|---|
| M1 | `630f2e18bc4d4dae7ed7a942ede8d356558656145d8339918aca22e860728bd5` |
| M2 | `f870dbb98b8e6025bc7628da840ad734629042b2ad887a544787dcb802d6367b` |
| M3 | `9a2a161e5e3713cec625e8116cfcb4cafb8d933996ff3287f7dbe3fc3e3efd9d` |
| M4 | `e5dbf238a24ca97994be21e72de9351b0953c73efaedf743e7a534970510a41c` |
| M5 | `18cfb2a31adfd9f51578519bacb4646844bd9103784c10846b1ef24d645711cf` |
| M6 | `04259b5e83274e32e5eeb1cd7d72edc055a835494b5babbb3e5cf8b6feb61a33` |
| M7 | `6c32b03920ae08d0b1baf072c9b02388c3f95ae48f25482ec443efcd3c2bf519` |
| M8 | `5a4081a7eecefe867132e7d681d0e3fe5852bd53f2225afdf941c9540918f5d4` |

All eight restored detectors then passed. Cleanup removed all eight scratch clones with `shutil.rmtree`; the same foreground call observed `not os.path.exists(root) == True` for every directory. No mutant remains.
No production source, fixture, identity constant, corpus, fleet state, or sibling was edited. The proposed coverage repairs above are recommendations only; no new test is claimed to have passed.

Files written:
- `.ufo/waves/round-17/w2/MutRoundLaneTip.md` (only retained file; eight isolated scratch gate copies were mutated, exactly restored, and removed).
