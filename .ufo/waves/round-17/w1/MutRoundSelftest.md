VERDICT: ISSUES
# Baseline round-contract HEAD-reading mutation probe

Axes: **operability** (C1 revision anchoring), **calibration** (actual detector sensitivity); measured dimension: self-test coverage, not the C2 capability claim.

## Scope and detector
- Frozen baseline: `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; script blob `3b49a9c7f53e1583d3dd0aac8e0ae2852d0c1343`.
- Source references below mean `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs` **at that baseline**, not the concurrently edited lane worktree.
- Isolation commands: `git clone --quiet --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r17-MutRoundSelftest-Yl6c` then `git -C /tmp/tabi-r17-MutRoundSelftest-Yl6c checkout --quiet --detach 5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; both exit 0.
- Exactly one literal revision operand changed per mutant: `'HEAD'` → `'HEAD~1'` at the named baseline line. No guards, fixture changes, bundled mutations, or production edits.
- Older rev in the sandbox: `git rev-parse HEAD HEAD~1 refs/heads/master` returned baseline, `1205d261776a349af99a5a205c7c2467fbabae16`, baseline. In generated fixtures, `HEAD~1` means that fixture's parent.
- Same detector for every valid run: `/run/user/1000/fnm_multishells/4348_1792501188326/bin/node /tmp/tabi-r17-MutRoundSelftest-Yl6c/scripts/check-round-contract.mjs --self-test`.
- Bound: synchronous `spawnSync`, timeout 45000 ms, kill signal SIGKILL, maxBuffer 8 MiB; monotonic wall-clock runtimes. No run timed out, signaled, or exceeded its buffer. No background jobs or subagents.
- Expected detector: the script's own `--self-test`; an observed nonzero exit after passing pristine/restored controls kills the mutant. Exit 0 with the clean summary survives. Baseline/control failure would instead be inconclusive.
- Tool versions: Node `v24.21.0`, Git `2.56.0`. Initial attempt at nonexistent `/usr/bin/node` returned ENOENT, exit null, empty stdout/stderr in 1 ms; no detector ran or mutation existed. `command -v node` supplied the path above; this setup failure is excluded, not a kill.

## Mutant table — actual outputs and runtimes
All pristine/restored controls exit 0, print 34 `result=PASS` lines, and have exact source hash H0. Each restored run also serves as the next mutant's pristine-byte pre-control; there are 19 valid detector runs, totaling 67288 ms. PASS count below is successful self-test lines before completion/failure, not an asserted case count.

| Mutant / line | Behavior-bearing operand | Pre-control ms | Mutant ms / exit | PASS lines | Restored ms / exit | Verdict |
|---|---|---:|---:|---:|---:|---|
| M119 / :119 | regular-blob pointer tree | 4294 | 4495 / 0 | 34 | 4396 / 0 | SURVIVED |
| M170 / :170 | current SHONEN blob identity | 4396 | 1511 / 1 | 6 | 4673 / 0 | KILLED |
| M177 / :177 | current census bytes | 4673 | 933 / 1 | 5 | 4814 / 0 | KILLED |
| M231 / :231 | history/protected-byte anchor | 4814 | 2618 / 1 | 24 | 4385 / 0 | KILLED |
| M266 / :266 | round lesson inventory | 4385 | 4255 / 0 | 34 | 4496 / 0 | SURVIVED |
| M466 / :466 | swarm aggregate bytes | 4496 | 483 / 1 | 1 | 4548 / 0 | KILLED |
| M500 / :500 | report bytes | 4548 | 151 / 1 | 0 | 4369 / 0 | KILLED |
| M504 / :504 | report measured-commit ancestor target | 4369 | 4203 / 0 | 34 | 4001 / 0 | SURVIVED |
| M1007 / :1007 | count-witness code_revision | 4001 | 4642 / 0 | 34 | 4021 / 0 | SURVIVED |

**Result: 4 survived, 5 killed, 0 inconclusive mutants.** The task's expectation that most survive was not observed for these literal `HEAD~1` mutations. Existing tests do catch five stale-revision defects, but not all nine.

Actual clean output tail (pristine, every restoration, and all four survivors); stderr empty:
```text
SELFTEST name=count_witness_comparison countWitness=1 top_exit=0 exit=0 verdict=clean old_exit=0 old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch new_marker=0 result=PASS
SELFTEST name=production_alias_refused expected_exit=2 actual_exit=2 expected_finding=usage result=PASS
ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1
```
Their entire stdout is byte-identical: SHA-256 `9d8f6d664b3734f28d91b44ab5786012e05e396c2203bec0ced6d07c3ffc7394`.

Exact failing stdout lines, in table order among killed mutants:
```text
SELFTEST name=shonen_invalid_mark expected_exit=1 actual_exit=0 expected_finding=shonen_policy result=FAIL
SELFTEST name=canonical_shonen_census expected_exit=0 actual_exit=1 expected_finding=clean result=FAIL
SELFTEST name=historical_mutation expected_exit=1 actual_exit=0 expected_finding=history_rewritten result=FAIL
SELFTEST name=short_swarm expected_exit=1 actual_exit=1 expected_finding=short_swarm result=FAIL
SELFTEST name=clean expected_exit=0 actual_exit=1 expected_finding=clean result=FAIL
```
Exact nonblank stderr lines for those same mutants (blank separator lines omitted):
```text
M170:
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND id=pstack-20261015-r01 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=1 spot=agree consequential=0 before=0 after=1 measured-against=13e060b96becca047c0b386b497b3204f4a9161a
ROUND_CONTRACT verdict=clean rounds=1 consequential=0
M177:
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Baseline census is not committed
M231:
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND id=pstack-20261015-r01 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=1 spot=agree consequential=0 before=0 after=1 measured-against=b0bcc9a986eb68319323e7633609029607096146
ROUND_CONTRACT verdict=clean rounds=1 consequential=0
M466:
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND_CONTRACT verdict=failed finding=evidence_moved detail=pstack-20261015-r01 corpus/evidence/pstack-20261015-r01/aggregate.json changed after the measured commit
M500:
ROUND_CONTRACT verdict=failed finding=selftest_failure detail=ROUND_CONTRACT verdict=failed finding=report_missing detail=pstack-20261015-r01 report is missing
```
M466 is killed by the expected-finding assertion despite the inner gate still exiting 1: actual finding `evidence_moved`, expected `short_swarm` (`:887-894`).

## Before / mutant / restored SHA-256 evidence
H0 = `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` (initial `sha256sum`, pristine detector, and all nine restored detectors).
Each row's source transition is **H0 → mutant digest → H0**; literal reverse edits restored the exact bytes even after detector failure.

| Mutant | Mutant source SHA-256 |
|---|---|
| M119 | `ac4d1499eabdf6edd37a74fd1c3155b3d3e20f2d89f48a71d984c62bbc703cae` |
| M170 | `923170be917dd67aac585f30dc2a4593badf5f56cf5b538668995a3cee199b28` |
| M177 | `228572d3f5114fa7a213ae08ec0547845b6b2fa514c07e65c824780a922a0d06` |
| M231 | `ae1a5ed9466c4294bd6f25c14e8a814e7227a7055f4683aa0c16f5dece50634d` |
| M266 | `35ed3ba344eb6c1a30a6f782d9135528c493b8abf85a66c3360622871cf8adab` |
| M466 | `0e86d81a9c0d05cf955dd2d51d77286e1d6d71e56225270220cf6e43dc95351a` |
| M500 | `88fdea697534cd7228d2a35d2f2c24b11b90ee4310197be6ca7670daac7d8d24` |
| M504 | `81d15651b17b1ffd6c905951dbf95c25c703b1feb1a40782faf1114e6ac0031a` |
| M1007 | `23ae7ae8d47c874d85d6827628bb7cd0574d3961e1c9e2c68e9fb9357b6ad245` |

## Coverage finding for the new self-test
- Fixture code initializes attached repositories and commits baseline/work/measure (`:617-695`); the case loop adds a mutation commit (`:877-887`). None of its cases detaches fixture HEAD (`:734-928`). Detaching the outer sandbox for this probe is not a detached-fixture test: checks run against the generated attached repos.
- M119 survives despite stale regular-blob tree selection (`:118-124`); M266 survives despite stale round enumeration (`:265-270`). These are observed detector blind spots, not permission to accept stale committed inputs.
- M504 survives: the measured work commit is already a parent of the clean fixture's HEAD (`:675-694`), so its ancestor predicate also holds at HEAD~1. The existing suite does not distinguish these two operands.
- M1007 survives: `--self-test` extracts count-witness exit/finding/marker fields (`:899-911`), not `code_revision` (`:1007-1009`). All self-test stdout remains identical even with that diagnostic revision changed.
- The planned detached off-branch fixture is a distinct missing scenario (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/PLAN.md:56-81`). [INFERENCE] It needs differing committed inputs at branch tip versus detached HEAD, plus explicit revision-field assertions; merely detaching onto byte-identical content will not establish sensitivity. No new fixture or post-fix detector was executed by this seat.

## Restoration and scope closure
- Final restored detector: 4021 ms, exit 0, 34 PASS lines, clean 32-case summary, empty stderr, source H0 and stdout digest above.
- Cleanup command `rm -rf -- /tmp/tabi-r17-MutRoundSelftest-Yl6c` exited 0 with no output after restoration. The sandbox is disposable and was removed; reproduction uses the frozen baseline and single-operand edits above.
- No lane source, frozen surface, sibling file, fleet state, git/jj state, browser, or other gate was changed or exercised. Only this report is retained. No tools installed or updated.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/MutRoundSelftest.md`
