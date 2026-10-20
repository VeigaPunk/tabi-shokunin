VERDICT: PASS

# GateRoundAnchor — lane-tip anchor for scripts/check-round-contract.mjs

Seat: TabiR17.GateRoundAnchor-2. Owned file only: `scripts/check-round-contract.mjs` (PLAN §C1).
Base: LANE at `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; `git symbolic-ref -q HEAD` → rc 1
(detached), `git rev-parse refs/heads/master` → 5859243 (observed before editing).

## sha256

- before `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`
  (== `ROUND_SCRIPT_CURRENT_SHA256`, scripts/check-user-round-contract.mjs:31)
- after  `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828`
- 1030 → 1221 lines; `git diff --stat 5859243 <r17>` = 303 changed, **247 insertions, 56 deletions**.

## Diff summary (functions)

Anchor, new: `laneTip(root)` — resolved once per `check()` and threaded as the 40-hex `rev` into
every live commit read. Refusal rules (all → `could_not_evaluate` exit 2):
1. `realpath(rev-parse --show-toplevel) !== realpath(root)` (this lane is nested in the fleet repo);
2. `symbolic-ref -q --no-recurse HEAD` status other than 0 (attached) with
   `^refs/heads/[^\x00-\x20\x7f~^:?*\[\\]+\n$`, or 1 (detached) with empty stdout;
3. `git check-ref-format <ref>` rc ≠ 0 — rejects `master@{1}`, `..`, `.lock`, `.x`, trailing `/`;
4. `for-each-ref --format=%(symref) -- <ref>` not exactly one row with an empty symref field;
5. `rev-parse --verify --end-of-options <ref>^{commit}` not 40-hex.
Attached HEAD → its own branch; detached HEAD → `refs/heads/master` (PLAN §C1 semantics).

Live former-`'HEAD'` reads retargeted (baseline line numbers, 20 sites): `regularBlob` :119
(`--literal-pathspecs ls-tree`), `checkShonen` :170/:173, `censusEntries` :177, `checkHistory`
:231 (`rev-parse HEAD`) + :232 (`merge-base baseline head`), `roundIds` :266, `checkSwarm`
:466/:487, `checkReport` :500/:504 (`merge-base measured HEAD`), `scanConsequential` :517/:520,
`sameTree` :538/:540, `checkPublic` :548/:565, `check` :584/:585/:587. Receipt :1007 now
`code_revision=laneTip(defaultRoot)`. Four messages saying "HEAD" now say "the lane tip"
(:171, :233, :257, :505). Fixture-only `rev-parse HEAD` unchanged: `commit()` :635, :1053/:1059/
:1063. `method !== 'HEAD'` (HTTP) untouched. Re-grep after edit: no live `'HEAD'` read remains.

Transport hardening (peer SentinelAnchor F1–F5, F13; peer CriticLowestAxis):
- `git()` builds a minimal env: no inherited `GIT_*`, `GIT_NO_REPLACE_OBJECTS=1`,
  `GIT_GRAFT_FILE=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`,
  `GIT_OPTIONAL_LOCKS=0`, `GIT_NO_LAZY_FETCH=1`, `GIT_LITERAL_PATHSPECS=1`, `TZ=UTC`,
  absolute-only `PATH`, `HOME` passed through; `GIT_CEILING_DIRECTORIES=parent(realpath(root))`.
- `--count-witness` receipt: `code_revision=` keeps the 40-hex tip and adds
  `code_committed=yes|no` = `blob(tip, scripts/check-round-contract.mjs) === gitBlobId(worktree)`.

Self-test: helpers `detachFixture`, `unresolvableFixture`, `replaceRefFixture`, `symrefFixture`,
`invalidHeadFixture`, `reflogHeadFixture`; cases `lane_tip_detached_head` (+ arm
`…_branch_names_poison`), `lane_tip_unresolvable`, `lane_tip_replace_ref`, `lane_tip_symref`,
`lane_tip_invalid_head`, `lane_tip_reflog_spelling`; harness flags `branchRerun`, `noCommit`.
No production-stdout surface changed.

## Measurements (sandbox clone of LANE, my file committed; sandbox removed)

1. Production, attached checkout (baseline bytes via
   `git show 5859243:scripts/check-round-contract.mjs` → `scripts/baseline-gate.mjs`):
```
$ node scripts/check-round-contract.mjs   → exit 0
$ node scripts/baseline-gate.mjs          → exit 0
$ diff -q /tmp/prod-old.out /tmp/prod-new.out → identical
sha256 both = 25e66498180565a95122221af203fba2a053e8cb87ca152b1ee25e077158bd61 (11 lines)
last line: ROUND_CONTRACT verdict=clean rounds=10 consequential=0
```
2. Production, jj-like detached HEAD (clone 2: `git rm reports/pstack-20261015-r01.md`, commit P;
   `update-ref refs/heads/master <tip>`; `update-ref --no-deref HEAD P`; `symbolic-ref -q HEAD` rc 1):
```
baseline bytes → exit 1  ROUND_CONTRACT verdict=failed finding=report_missing
                           detail=pstack-20261015-r01 report is missing
new bytes      → exit 0  ROUND_CONTRACT verdict=clean rounds=10 consequential=0
diff new stdout vs attached-checkout baseline stdout → identical
```
3. `--self-test`: exit 0, `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1`,
   41 SELFTEST lines, 41 `result=PASS` (baseline bytes: exit 0, `cases=32`, 34 lines). All seven
   lane_tip lines PASS: detached 0/clean, its branch-poison arm 1/short_swarm, unresolvable 2,
   replace_ref 0/clean, symref 2, invalid_head 2, reflog_spelling 2.
4. `--witness 75e7836b…` → exit 0 `… old_exit=1 old_finding=history_rewritten new_exit=0
   new_verdict=clean result=PASS`. `--count-witness bebe2efc…` → exit 0
   `code_revision=051207f3… code_sha256=1579a794… code_committed=yes` (worktree edit → `no`).

## Red-before / green-after proof (captured fixtures, final bytes)

Each fixture captured from the new self-test before deletion; `--baseline` = that fixture's root
commit.

| fixture | state | baseline bytes | new bytes |
|---|---|---|---|
| `lane_tip_detached_head` | HEAD `66ed388` (31 results), `master` `3b88b0c` (32), `symbolic-ref` rc 1 | exit 1 `short_swarm … accounts for 31 results` | exit 0 `clean rounds=1` |
| `lane_tip_replace_ref` | live `refs/replace/<blob>`; plain `git show master:aggregate`=31, pinned=32 | exit 1 `short_swarm` (printed tip, replaced bytes) | exit 0 `clean rounds=1` |
| `lane_tip_symref` | detached; `refs/heads/master` → `refs/remotes/o/evil` | exit 0 `clean` (certifies the remote-tracking commit) | exit 2 `… is not a plain local branch` |
| `lane_tip_reflog_spelling` | `.git/HEAD` = `ref: refs/heads/master@{1}` | exit 2 `git rev-parse failed` | exit 2 `… is not a valid ref name: refs/heads/master@{1}` |

Reflog mechanism, exercised on the fixture (this is the step the pre-guard anchor trusted):
```
$ git symbolic-ref -q --no-recurse HEAD      → refs/heads/master@{1}  (rc 0)
$ git for-each-ref --format='%(symref)' -- refs/heads/master@{1}  → (no rows)
$ git rev-parse --verify --end-of-options refs/heads/master@{1}^{commit} → 5b30dbb1…
$ git rev-parse refs/heads/master                                        → 3b88b0c3…   (tip)
$ git check-ref-format refs/heads/master@{1} → rc 1 ;  refs/heads/master → rc 0
```
i.e. the anchor would have certified `5b30dbb1…` (master's previous value) while the branch tip is
`3b88b0c3…`; `check-ref-format` closes it. Sentinel probe (`probe.mjs`) on this file:
`E1 safe(refused) · E2 safe · E3 safe · E4 safe(read=good) · E5 safe · E7_reflog_anchor safe`.
E6 (attached off-lane branch) not adopted: PLAN §C1 defines attached HEAD → its own branch for
production and fixtures alike.

## Risks / integration dependencies

- `scripts/check-user-round-contract.mjs:31` still pins `ROUND_SCRIPT_CURRENT_SHA256 = 8a573b4e…`;
  its identity chain rejects `1579a794…` until the L1 moves current→new and archives the old
  (PLAN: L1-owned). I did not edit that file. [observed, read-only] it already has its own
  `laneTip` (:805) and a `committed`/`measuredRevision` guard (:818-820).
- Fail-closed (exit 2) where the baseline read HEAD: detached with no `refs/heads/master`, symref
  anchor, unparseable HEAD, non-ref-name spelling, or a `--repo` that is not its own toplevel.
- One resolution per process: a jj bookmark move mid-run cannot split a verdict; a newer tip is
  seen on the next run. Same-tip child gates should be passed the resolved 40-hex.

## Tooling

No installs or upgrades (Node v24.21.0, git 2.56.0). No `jj`/git write in LANE; every git write ran
in `/tmp/tabi-r17-GateRoundAnchor-*` (removed) and its detached clone. Fixture-capture runs left
`/var/tmp/tabi-round-contract-*` trees, all removed; the instrumented capture copy was throwaway.

Files written:
- scripts/check-round-contract.mjs
- .ufo/waves/round-17/w1/GateRoundAnchor.md
