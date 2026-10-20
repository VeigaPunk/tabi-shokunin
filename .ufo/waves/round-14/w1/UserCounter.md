# UserCounter — tabi round 14 wave 1 (C1 USER gate)

Author-side advisory. Owned file: `scripts/check-user-round-contract.mjs` only.
No checks, builds, tests, lint, format, self-test, witness, browser or production
command were executed by this seat. No tool was installed or updated. The
report file is the only other write. Historical evidence/lessons were not
edited.

Authoring identity: `scripts/check-user-round-contract.mjs` sha256
`bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3`
(1043 lines). L1 must recompute this after commit and bind it in the external
`corpus/evidence/round-14/gates.json`; this script does not self-pin its own
bytes (no self-blessing).

## 1. C1: SCORECARD shell execution eliminated

`runCount` (line 396) no longer calls `bash`/`sh`/`zsh` or `shell:true`. It
parses the command into a closed descriptor and spawns `git` with argv only.

Closed grammar (lines 318–376):

```text
git ls-tree -r --name-only <40-hex-rev> | grep <PATTERN> [| grep <PATTERN>] | wc -l
git grep -h '<PATTERN>' <40-hex-rev> -- <path> | wc -l
```

- The tree form is the exact committed SCORECARD shape: six USER rows at
  `SCORECARD.md:336,344,353,361,369,377`; the optional second `grep` stage
  matches the committed pstack rows at `SCORECARD.md:250,258` (kept so the
  grammar is the real historical one, not a made-up variant).
- The `git grep -h` form is the fixture/content form used by
  `writeGoodFixture` and confirmed by L1's ruling ("plus fixtures `git grep -h`
  content counts").
- Any other token, stage, option, quote shape, tab/double space, trailing
  `#`, `;&<>`, backslash, `$VAR`, `--git-dir`, `-C`, rev alias (`HEAD`, `m:`)
  or third pipeline stage is rejected before any process starts. Unsupported
  grammar fails `score_mismatch` (parseScore line 378 / runCount line 396).
- `^` is accepted only at pattern start and `$` only at pattern end; both are
  translated to anchors. `.` is a BRE wildcard (not a literal), so `'.txt'`
  at `SCORECARD.md:258` keeps its committed meaning. No other regex
  metacharacter is accepted.
- The command revision must equal `measured-against`; the before measurement
  passes the parsed revision override (`baseline`) to git argv instead of
  string-replacing authored shell text. A measured hash that appears only
  inside a grep pattern can no longer satisfy the check.
- Line counting preserves `wc -l`: tree rows are filtered in memory from raw
  `ls-tree` stdout bytes and counted; `git grep` output counts `0x0a` bytes.
  A trailing empty split element is dropped. No shell, no `wc`.
- Status policy matches the ROUND counter: `git grep` exit 1 is the historical
  no-match → 0; `ls-tree` nonzero, grep status > 1, spawn error, timeout or
  buffer overflow fail explicitly with `score_mismatch`.
- `latin1` decoding keeps byte-to-char 1:1 for ASCII paths; committed patterns
  are ASCII. `maxBuffer` is 16 MiB and timeout 30 s.

## 2. ROUND checker digest policy (explicit identities only)

`acceptedRoundScript` (line 206) now verifies the whole recorded history:

- Accepted HEAD identities: prior `7d403cee…` (archived `PSTACK_PIN` bytes, git
  blob `b2eb8316`, still required to hash to the prior digest) and current
  `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`
  (RoundCounter's final bytes; verified by `sha256sum` at coordination time).
- Archived intermediates admitted only while walking `PSTACK_PIN..HEAD`:
  `6f9eddc7…` at `1199150` (git blob `d871e73d`) and `8478cd43…` at `1212207`
  (git blob `43db9f4b`). They are never accepted as HEAD, so a rollback to the
  round-13 shell gate fails `history_rewritten`.
- `git log --no-show-signature` enumerates every commit in the range that
  touched the path; each commit's bytes must hash to one of the four explicit
  identities. This is L1's "checks every actual intermediate change" condition;
  there is no pattern or blanket exemption.
- `git show` bytes are compared by sha256 against constants, so replace refs
  cannot forge an identity. The pinned archived bytes are still checked against
  the prior digest.

Coordination: RoundCounter confirmed final `8a573b4e…` and editing stopped;
its file is byte-identical in the working tree at handoff. GateGrammar,
ReviewC1Admission F1, ReviewProtectedPaths F2, AttackRoundCount and
AttackUserCount all fed this decision; L1's ruling (prior + current accepted,
round-13 intermediates archived) is what is implemented, not the earlier
three-entry proposal.

## 3. `--witness` compatibility and receipt binding

`--witness REV` behavior is unchanged (pinned pre-repair bytes
`LEGACY_USER_GATE_BLOB`; old arm `history_rewritten`, new arm `clean`). Its
summary line now adds:

```text
measuredRevision=<lane HEAD, or "uncommitted"> codeRevision=<lane HEAD>
code-sha256=<64-hex> new-sha256=<64-hex>
head-blob=<git blob at HEAD:scripts/check-user-round-contract.mjs|none>
worktree-blob=<git blob id computed in Node> committed=yes|no
```

Meaning: `code-sha256` is the SHA-256 of the bytes actually executed for the
new arm; `worktree-blob` is their git blob id; `head-blob` is HEAD's blob.
`measuredRevision` names the lane revision only when `worktree-blob ==
head-blob` (`committed=yes`); otherwise it is `uncommitted` and the receipt must
not claim a revision binding. This closes round-13 verifier item 3 (explicit
repaired-code revision binding) while retaining the existing witness fields and
child-exit semantics.

## 4. `--count-witness REV`: same-command safe red arm

Flag/argv agree with RoundCounter: one optional-free revision (7–40 hex), argv
length 2. The revision's `scripts/check-user-round-contract.mjs` git blob must
equal `LEGACY_COUNT_GATE_BLOB = 7df3ee9f4df6db3c36c886f9173715bc299ce43a`
(the shell-bearing gate at verifier baseline `bebe2ef`, sha256 `69066121…`).
Node recomputes the git blob hash of the shown bytes before writing them.

Mechanism (lines 784–851): one `writeGoodFixture` tree, `measured-against` set
to the work commit, SCORECARD command committed as:

```text
git ls-tree -r --name-only <measured> | grep round-marker.txt | tee .user-round14-count-marker | wc -l
```

with `before: 0` / `after: 1`. Old pinned bytes run first: exit 0,
`verdict=clean`, marker exists (real shell `tee` execution). Marker is
unlinked, then the new working bytes run on the same tree/args: exit 1,
`finding=score_mismatch`, marker absent. Both runs are scratch-only under
`/var/tmp`, removed in `finally`; the fixture history is untouched.

Receipt line fields: rev, baseline, args, measuredRevision/codeRevision,
code-sha256/new-sha256, head-blob/worktree-blob, committed, marker,
old_exit/verdict/finding/marker, new_exit/verdict/finding/marker, result.

## 5. Self-tests written (not executed)

New/renamed controls (all in `--self-test`):

| name | expected exit | expected finding | marker |
|---|---|---|---|
| `count_malicious_tee_refused` | 1 | `score_mismatch` | `no_marker=1` |
| `count_malicious_shell_refused` | 1 | `score_mismatch` | `no_marker=1` |
| `count_malicious_option_injection_refused` | 1 | `score_mismatch` | `no_marker=1` |
| `count_historical_supported` | 0 | `clean` | — |
| `count_quoted_supported` | 0 | `clean` | — |
| `count_two_stage_supported` | 0 | `clean` | — |
| `count_missing_revision_red` | 1 | `score_mismatch` | — |
| `count_wrong_after_red` | 1 | `score_mismatch` | — |
| `round_script_rollback_to_cutover` | 1 | `history_rewritten` | — |

Additional in-process controls:

- `count_committed_user-20261015-rNN` for every committed USER row
  (`roundIds(defaultRoot)`): parses the committed SCORECARD, evaluates the same
  command at `HARD_BASELINE` and at `measured-against`; requires the recorded
  before/after strings. This exercises the six real committed rows that
  production never reaches because `round_count` fires first.
- `count_witness_comparison`: runs the same differential as `--count-witness`
  and prints `countWitness=1 top_exit=0 exit=0 verdict=clean old_exit=0
  old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch
  new_marker=0 result=PASS` when it holds.
- Fixture tally: `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=30
  fixtures=29 alias=1 committedCounts=6 countWitness=1` (29 fixture cases +
  1 production-alias refusal; committed-row and count-witness controls are
  reported separately, not folded into `cases`).

## 6. Production expectation preserved

After L1 commits both gate files, production `node scripts/check-user-round-contract.mjs`
must remain exit 1, `USER_ROUND_CONTRACT verdict=failed finding=round_count`,
`Found 6 user rounds, expected 10`, with no clean verdict. Scalars unchanged.
Before that commit, production is transiently `history_rewritten` because HEAD
still holds the archived `8478cd43` round-gate bytes, which the new policy does
not accept as HEAD; run production only after the commit.

## 7. Verification commands for L1 (not run here)

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs
# expect 8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --self-test
# expect the 30-control tally above, all SELFTEST ... result=PASS, no FAIL

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --witness dabd2b9
# expect old exit1 history_rewritten, new exit0 clean, result=PASS, and
# committed=yes with measuredRevision=<HEAD> after the commit

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --count-witness bebe2ef
# expect old_exit=0 old_verdict=clean old_marker=1,
# new_exit=1 new_finding=score_mismatch new_marker=0, result=PASS

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs
# production after commit: exit1 finding=round_count, 6/10

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs \
  --repo <isolated-clone> --baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c --expect 6
# L1's isolated count exercise only; NOT production-green and does not change 6/10
```

## 8. Residual risks / boundaries

- The evaluator supports the seen BRE subset only (`^`, `$`, `.`, literals).
  A future SCORECARD row using escapes, `-E`/`-F`, three grep stages or other
  options fails closed with `score_mismatch` and must extend the grammar
  explicitly.
- `--self-test`'s count-witness and rollback controls need commits `bebe2ef`
  and `1212207` plus the archived blob to be reachable; a shallow clone cannot
  run them.
- External validator invocation (`VALIDATOR`) and all non-count git reads are
  unchanged and outside this C1 edit.
- ReviewProtectedPaths F2's rollback concern is handled by the archived/HEAD
  split and `round_script_rollback_to_cutover`; a rollback to the prior
  baseline identity remains accepted because L1 explicitly preserves it.
- No claim is made that production is green: USER 6/10 remains a real failed
  gate, and no rounds were manufactured.
