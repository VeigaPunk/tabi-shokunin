# RoundCounter — round-14 C1 ROUND gate count evaluator

Seat: leaf, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Owned file: `scripts/check-round-contract.mjs` only.
Final working-tree bytes: sha256 `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`,
size 55,627 bytes, 1,030 lines, diff `292 insertions / 9 deletions` against HEAD `bebe2ef`.
No checks were executed (no builds, tests, lint, formatter, smoke, selftest, gate, or witness runs).
No tools installed or updated.

## Behavior delivered (C1)

`runCount` no longer starts a shell. It tokenizes the command in memory, accepts exactly the
two historical counting grammars, validates every argv token, and invokes git without a shell:

1. `git ls-tree -r --name-only <40-hex-rev> | grep <BRE> [| grep <BRE>]* | wc -l`
   (all 10 pstack rows, `SCORECARD.md:242,250,258,266,274,282,290,298,306,314`; also the user rows).
2. `git grep -h <BRE> <40-hex-rev> -- <relative-path> [<relative-path> ...] | wc -l`
   (fixture generator command).

Pointers: `scripts/check-round-contract.mjs:313-352` (closed tokenizer, quoted-literal pipe
sentinel), `:355-370` (revision/path/pattern validation), `:373-400` (BRE-to-RegExp subset),
`:402-422` (`git ls-tree` path-line counting), `:424-439` (`git grep` newline counting),
`:441-454` (`runCount` shape dispatch).

Fidelity choices:
- `git ls-tree` stdout is split on `\n`, one trailing empty string is popped (trailing newline
  behavior), then each grep stage filters path lines. BRE `.` stays a wildcard, including the
  r03 `grep '.txt'` production command; `^`/`$` anchors are honored only at their BRE positions.
- `git grep` counts literal `0x0A` bytes in stdout, exactly `wc -l`; no-match (status 1) returns
  `"0"`. The final comparison remains string equality against `before`/`after`.
- Every other token shape is `score_mismatch` before any count process starts: extra stages,
  pipes inside unquoted tokens, redirects, `;`/`&`, substitutions (`` ` ``, `$(`/`${`), quoted
  shell syntax, options after `grep`, leading-dash patterns, absolute/`..`/leading-dash paths,
  CR/LF/tab/non-ASCII tokens, non-40-hex revisions.
- The revision operand is bound to `measured-against` and the measured hex must appear only in
  that operand, closing the "SHA hidden in a grep pattern" bypass:
  `scripts/check-round-contract.mjs:596-598` with `:457-462`.
- Fail-closed tightening (disclosed, L1-ruled): a bad/missing revision, failed `git ls-tree`, or
  `git grep` status > 1 is `score_mismatch`; the old bash pipeline masked these as count 0 via
  the last `wc` stage. No historical row hits this: all 10 pstack revisions and HARD_BASELINE
  resolve (independent scout oracles r01..r10 after = 1,2,4,1,1,1,1,1,1,1).
- `git()` now sets `maxBuffer: 16 * 1024 * 1024` (`:59-62`) so a growing tree listing cannot
  produce a false `score_mismatch` via ENOBUFS.

Preserved: `HARD_BASELINE`, census identity/rows, `parseScore` red findings (`missing_score`
metachar filter unchanged at `:286-303`), protected-path/append-only logic, public capture
checks, production expectations (10 rounds, exit 0, exact `ROUND_CONTRACT verdict=clean
rounds=10 consequential=0`), and the existing `--witness` history-policy mode
(`:933-970`) whose only change is an integrity assertion that the shown old-gate bytes
recompute to the pinned blob (`:81-86`; `--witness` `:938`, `--count-witness` `:977`).

## Added self-test controls (`--self-test`)

Cases at `scripts/check-round-contract.mjs:848-869`, marker/detail assertion at `:889-894`,
count-witness arm at `:899-913`.

- Real counts: `count_supported_tree_lines`, `count_supported_two_filters`,
  `count_supported_git_grep` (32 paths/content lines at the fixture measured commit, 0 at
  baseline; exit 0, `verdict=clean`).
- Refusal/no-marker: `count_malicious_extra_stage` (`tee` stage),
  `count_unsupported_grep_option` (`grep -v`), `count_traversal_grep_path` (`../` path).
  Each must exit 1 with `finding=score_mismatch`, a specific `detail` substring, and no marker
  file on disk. Exact success lines:
  - `SELFTEST name=count_malicious_extra_stage expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1`
  - `SELFTEST name=count_unsupported_grep_option expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1`
  - `SELFTEST name=count_traversal_grep_path expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1`
- Summary line remains `ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1`.

## `--count-witness REV` (new, same command red-before)

Flags: `--count-witness REV` (single 7-40 hex revision, argv length 2) at `:202`, `:214-217`,
dispatch `:1024`. Implementation `:972-1021`.

- Pins `COUNT_WITNESS_BLOB = 43db9f4bba56a27114ed116c85f27b80227e74bd` (prior admitted round-13
  gate bytes at `bebe2ef`, sha256 `8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d`)
  and `COUNT_WITNESS_REV = bebe2efc4565bb068efd905e9ef78011bb6b4efd` (`:42-43`). Shown source is
  re-hashed as a git blob before execution (`:977`).
- One `writeGoodFixture` fixture, measured commit read from `measured-against` (`:727-731`), one
  SCORECARD command: `git ls-tree -r --name-only <measured> | grep round-marker.txt | tee
  .round14-count-marker | wc -l` (before 0 / after 1), committed so the gate reads it at HEAD.
- Same tree and args, prior bytes then new bytes. Required: old exit 0, `verdict=clean`,
  `old_finding=clean`, marker created; marker unlinked; new exit 1, `finding=score_mismatch`,
  marker absent; HEAD unchanged across both arms. Success line:
  `ROUND_CONTRACT_COUNT_WITNESS fixture=shared exit=0 verdict=clean old_rev=bebe2efc4565bb068efd905e9ef78011bb6b4efd baseline=<fixture> code_revision=<HEAD> code_sha256=8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942 old_exit=0 old_verdict=clean old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch new_marker=0 head_stable=1 result=PASS`
- `--self-test` also runs this arm as a child and emits
  `SELFTEST name=count_witness_comparison countWitness=1 top_exit=0 exit=0 verdict=clean old_exit=0 old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch new_marker=0 result=PASS`.

## Exact commands L1 should run after all seats land

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-round-contract.mjs --self-test
node scripts/check-round-contract.mjs
node scripts/check-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd
```
The existing history-policy witness invocation stays as-is (`--witness <rev>` whose
`scripts/check-round-contract.mjs` blob equals `b2eb8316f41cd1039330e45f6739c07c5f11eace`).

Expected production: exit 0, ten `ROUND id=...` lines with unchanged before/after values, then
`ROUND_CONTRACT verdict=clean rounds=10 consequential=0`.

## Risks / handoff

- `--self-test` now requires the pinned prior commit `bebe2ef` to remain reachable and its gate
  blob unchanged; a shallow/rewritten history will fail the selftest arm by design (usage pin).
- The old arm intentionally executes the pinned prior gate in `/var/tmp` scratch; inherited Git
  config/PATH/hook trust is unchanged and uncredited this round (L1 ruling). No hostile-repo
  sandbox was added.
- `runCount` delegates git to helpers, so a probe that textually requires `spawnSync('git'`
  inside the `runCount` body will report `run_count_not_argv`; MeasureClaims was notified.
- C1 evidence is independent of C2 calibration claims; this report asserts no C2 result.
- UserCounter owns `scripts/check-user-round-contract.mjs` pin cutover; notified with digest
  `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`. My file contains no pin on
  the USER script bytes.
