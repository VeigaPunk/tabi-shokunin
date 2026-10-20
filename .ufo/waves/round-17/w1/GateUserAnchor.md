VERDICT: PASS

# GateUserAnchor — C1 lane-tip anchor, aligned with GateRoundAnchor

Target: `scripts/check-user-round-contract.mjs`
sha256 before `f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b`
sha256 after  `5c30b14c9c112c95a991baa3827bbf659d009db9de3abe1b5de159867ac86bf2`
`ROUND_SCRIPT_*` identity constants untouched (`:17`, `:29`, `:32`); L1 owns them at integration.

## Implementation (aligned with GateRoundAnchor `laneTip`/`git()`)

1. `git()` `:116-142`: constructed env (no inherited `GIT_*`): `GIT_CONFIG_NOSYSTEM=1`,
   `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null`,
   `GIT_NO_LAZY_FETCH=1`, `GIT_LITERAL_PATHSPECS=1`, `GIT_OPTIONAL_LOCKS=0`, `TZ=UTC`,
   absolute-only PATH + HOME, `GIT_CEILING_DIRECTORIES=resolve(realpath(root), '..')` (round-gate
   form). `runCount` uses it (`:505`).
2. `laneTip(root)` `:150-203`, memoized per root in `LANE_TIPS` (`:155`), so one resolution per
   process: `rev-parse --show-toplevel` realpath must equal the root (`:160-165`);
   `symbolic-ref -q --no-recurse HEAD` — attached iff status 0 and stdout is exactly one plain
   `refs/heads/` name + newline, detached iff status 1 and empty stdout, else exit 2 (`:166-182`);
   `check-ref-format <ref>` rc 0 (`:186`); `for-each-ref --format=%(symref) -- <ref>` must be exactly
   `\n`, rejecting a symref anchor (`:188-195`); `rev-parse --verify --end-of-options '<ref>^{commit}'`.
3. Threading of former `'HEAD'` reads (old → new): committedBlob 167→245; acceptedRoundScript
   230→309, 237→316 (tip :308); lessonDrift 252→332, 254→334, 255→335 (tip :330); pstackDrift
   262→342; checkHistory 308→388; roundIds 338→418; checkSpec 443→523, 474→554; checkSwarm
   493→574, 512→593 (tip :573); checkReport 525→607, 529→611 (tip :605); scanConsequential
   539→622, 541→624 (tip :621); sameTree 559→643, 561→645 (tip :642); checkPublic 569→654,
   586→671 (tip :650); check 607→693, 608→694, 610→696 (tip :685); witness 790→877, 794→881
   (tip :876); runCountWitness 874→962, 878→966 (tip :961); runDiagnosticWitness 953→1042,
   955→1044 (tip :1038); selfTest 1268→1412. Fixture-only `HEAD` reads kept: commit() `:716`,
   fixture `rev-list` `:1202`, new cases' fixture reads.
4. Self-test cases (like the round gate): `detached_head_reads_lane_tip` `:1286`,
   `lane_tip_replace_ref` `:1300` (fixture `:1162`), `lane_tip_symref` `:1301` (fixture `:1180`);
   pre-committed cases use the runner flag at `:1357`.

## Memoization measurement (strace -f -e trace=execve, successful `git symbolic-ref` execs)

- Production (`node scripts/check-user-round-contract.mjs`): **1** resolution in the whole process.
- `--self-test`: 42 processes resolved a tip, **each exactly 1** (`uniq -c` of per-pid counts:
  `42 × 1`); pids resolving more than once: **0**.

## New-case red / green (captured fixtures from the new self-test, same argv each arm)

| fixture | state | baseline bytes | final bytes |
|---|---|---|---|
| `lane_tip_replace_ref` | `refs/replace/<aggregate blob>` → 31-result blob; plain `show`=31, pinned `show`=32 | exit 1 `short_swarm detail=…accounts for 31 results` | **exit 0 `clean rounds=1`** |
| `lane_tip_symref` | HEAD detached at tip (`13b9e3a`, aggregate 32); `refs/heads/master → refs/remotes/o/evil` (`1c3bc13`, aggregate 31) | exit 0 `clean` (reads HEAD, does not detect the symref) | **exit 2 `Lane tip refs/heads/master is a symbolic ref to refs/remotes/o/evil`** |
| same symref fixture, guard-removed sandbox mutant | — | — | exit 1 `short_swarm … 31 results` (certifies the symref target; guard is load-bearing) |

## Sentinel F1–F7 disposition

- F1/F2 replace refs, grafts, inherited env → constructed env (1); `runCount` covered.
- F3 parent-repo fallthrough → ceiling + toplevel identity (2).
- F4 fail-open on unexpected `symbolic-ref` status → strict status/stdout parse (2).
- F5 symref branch anchor → `--no-recurse` + `for-each-ref %(symref)` (2), now with a self-test case.
- F7/E7 reflog-shaped target (`refs/heads/master@{1}`) → `check-ref-format` refusal (2).
- F6 LOW (attached off-lane branch in production) NOT implemented: PLAN §C1 fixes attached-HEAD
  semantics as "resolves to its own branch"; production-only master would contradict it — L1 call.

## Regression (sandbox and live lane)

- Production: baseline vs new stdout identical, exit 1
  `verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`; live lane same.
- `--self-test`: exit 0, `cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`;
  `detached_head_reads_lane_tip`, `lane_tip_replace_ref`, `lane_tip_symref` all `result=PASS`,
  no other case changed.
- `--witness 75e7836b…`, `--count-witness bebe2efc…`, `--diagnostic-witness`: exit 0,
  `result=PASS`, `codeRevision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.
- Sentinel's updated probe on these bytes: user gate E1–E5, E7 safe; E6 residual (F6).

## Risks

- L1 must archive `8a573b4e…` and set the new `check-round-contract.mjs` sha (`1579a794…` per
  GateRoundAnchor); until then integration is red at `round_script_*` by design.
- Failure messages keep historical wording ("not an ancestor of HEAD", `head-blob=`) for byte
  identity; the anchor is the lane tip.
- `laneTip` memoizes per realpath; a mid-run bookmark move cannot split a verdict (next run sees it).

Files written:
- `scripts/check-user-round-contract.mjs`
- `.ufo/waves/round-17/w1/GateUserAnchor.md`

No tools installed or upgraded. Sandboxes and captured `/var/tmp` fixtures removed.
