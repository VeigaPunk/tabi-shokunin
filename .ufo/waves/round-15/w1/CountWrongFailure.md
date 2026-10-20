# CountWrongFailure — USER malicious/red count fixtures: wrong-reason `score_mismatch` false positives

Role: critic (author-side, read-only, static only). I executed no gates, self-tests, counters, suites, or browser runs, and I installed no tools.

## Pinned inputs
- Lane HEAD is `7054a5e1068538349b4dbb0d291c2fe8643802f2`. The USER gate HEAD blob is `347ae9b` (`scripts/check-user-round-contract.mjs`).
- **Line anchors below refer to the HEAD blob.** `TabiR15.CounterDiagnostics` has an in-flight worktree edit that adds `COUNT_REASONS` and a 4-argument `fail` at L84-103. That edit shifts everything after L86 by **+17**. When reading the current worktree, add 17 to every anchor at or after L86.
- Legacy shell red-before arm: blob `7df3ee9f4df6db3c36c886f9173715bc299ce43a` (`LEGACY_COUNT_GATE_BLOB`, L55; reached through `COUNT_WITNESS_REV` bebe2ef, L788). I read it with `git cat-file -p`.
- Host fact: `/var/tmp/other` does not exist (`ls -ld`).

## Axes
1. Discrimination: does a case fail against the bytes it claims to retire?
2. Reason truthfulness: does a case pin the intended refusal site or only the shared finding?
3. Isolation: can a case pass through an unrelated `score_mismatch`?
4. Host independence.

## Every `score_mismatch` emitter in USER HEAD
| site | reason (sibling vocab) | reachable from CLI `check()`? |
|---|---|---|
| L391 parseScore `counting command is not a supported git line count` | `unsupported_counting_command` | yes |
| L392 parseScore `does not measure its measured-against commit` | `counting_revision_mismatch` | yes; **no USER self-test exercises it** |
| L398 runCount `Unsupported counting command: ${command}` | (unassigned) | **no.** parseScore L391 always runs first on the same command (L592→L596/597, and selfTest L1000→L1001). It is defensive only. Its detail also echoes arbitrary command text. |
| L408 runCount `Counting command failed: ${command}` | `counting_command_failed` | yes (missing revision) |
| L594 `before and after are the same` | `score_not_improved` | yes; no count self-test |
| L596 `before measurement does not match` | `before_count_mismatch` | yes |
| L597 `after measurement does not match` | `after_count_mismatch` | yes |

The self-test matcher at L988-990 accepts any of these sites. It checks `result.status === test.exit && output.includes('finding=score_mismatch') && !leaked`. Unlike the ROUND gate, it has no `detail` or `reason` term: ROUND has `detailOk` at `check-round-contract.mjs:890`, with per-case `detail:` at L863/867/871. This is a parity defect between the two gates.

## Counterexample derivation: run each USER `score_mismatch` case against the legacy bytes it retires
These outcomes are derived statically from the legacy source; none were run. Legacy behaviour:
- L304 prefilter: refuses `` [;&`<>\n\\] `` and `$(`/`${` as `missing_score`.
- L492 builds `beforeCommand = command.replaceAll(measured, baseline)`.
- L311 runs `bash -c` with cwd=root.
- L312 treats the status as `wc`'s, which masks git failure as `0`.
- L494/L495 compare the before/after counts.

The fixture defaults come from `rewriteScore` L854: `before: 0`, `after: 1`. The legacy gate is known to reach the counting stage on this fixture: `runCountWitness` L828-830 requires the old arm to exit 0 clean on the same `writeGoodFixture`.

| case (HEAD line) | current USER path | legacy 7df3ee9 outcome (static) | self-test vs legacy | discriminator |
|---|---|---|---|---|
| `count_malicious_tee_refused` L865 | L391 | prefilter ok → bash → 0/1 → **exit 0 clean**, marker written in root | FAIL ✓ | exit, finding, marker |
| `count_malicious_shell_refused` L868 | L391 | bash → `sh -c` prints nothing → `'' !== '0'` → **exit 1 `score_mismatch` (L494 before mismatch)**, marker written | FAIL ✓ | **marker only**: exit and finding are identical to the refusal |
| `count_malicious_option_injection_refused` L871 | L391 | bash → `git --git-dir=/var/tmp/other` exits 128 → masked by `wc` → before `'0'==='0'` ✓ → after `'0'!=='1'` → **exit 1 `score_mismatch` (L495)**, no marker possible | **PASS ✗ (false positive)** | none |
| `count_missing_revision_red` L883 | L596 baseline ok (0) → L597 ls-tree on zeros → L408 | before replaced with baseline → 0 ✓; after: ls-tree on zeros fails → masked `0` → `'0'!=='1'` → **exit 1 `score_mismatch` (L495)** | **PASS ✗ (false positive)** | none |
| `count_wrong_after_red` L889 | L597 | L495 → exit 1 `score_mismatch` | PASS (expected: this is a value control, not a cutover claim) | n/a |

### F1 — HIGH: `count_malicious_option_injection_refused` cannot discriminate (L871-873)
- The legacy shell gate passes this case with the same exit, the same finding, and `no_marker=1`.
- `noMarker: COUNT_WITNESS_MARKER` is vacuous for this command: nothing in it can create the marker. The self-test line nevertheless prints `no_marker=1`, which looks like evidence but is not.
- The outcome depends on host state. If `/var/tmp/other` were ever a git dir (shared, world-writable `/var/tmp`), the legacy count would be arbitrary.
- Impacted axes: discrimination, reason truthfulness, host independence.

### F2 — HIGH: `count_missing_revision_red` passes under the exact fail-open regression it targets (L883-888)
- Mutant: revert L407-408 to the round-14 draft `if (result.error) fail(...)`, which ignores status. This is the defect recorded at `.ufo/waves/round-14/w1/GateGrammar.md:231-234`. Under it, status 128 gives an empty stdout, the tree `rows=[]`, and a count of `'0'`.
- That count makes L597 fail with `after_count_mismatch`, and the case still PASSES.
- The same holds for the legacy bash bytes.
- Cause: the fixture sets `after: 1`, so the masked `0` and a correct fail-closed refusal both produce `score_mismatch`.
- The public claim "missing revision is an explicit failed count" is not witnessed by this case. That claim appears at `corpus/lessons/round-14.md:13` and is cited at `.ufo/waves/round-14/w1/ReviewC1Admission.md:87`.
- Impacted axes: discrimination, reason truthfulness.

### F3 — MED: `count_malicious_shell_refused` relies on the marker alone (L868-870)
- The legacy arm emits the same `exit=1 finding=score_mismatch`, but from L494 (before mismatch).
- The test is correct today, but its only discriminator is the cwd of the shell side effect. Consider a regression that executes the stage with any cwd other than the fixture root, or runs the stage but suppresses `touch`, for example a sandboxed shell. It would PASS on finding alone.
- A `reason=unsupported_counting_command` assertion closes this.

### F4 — MED: the count witness new arm asserts finding only (L828-833)
- The check is `newArm.finding === 'score_mismatch' && !newMarker`. Any `score_mismatch` site satisfies it.
- It should also require `reason === 'unsupported_counting_command'`. Otherwise the reported `new_finding=score_mismatch` (L849, L1016) overstates what was witnessed.
- Note that `gateFields` (L718-729) takes the **first** `finding=` match in stdout+stderr. A reason parser must anchor to the terminal `USER_ROUND_CONTRACT verdict=` line, not take the first match.

### F5 — LOW: two refusal sites cannot be asserted
- L392 `counting_revision_mismatch` has no USER self-test.
- L398 is not reachable from the CLI. If it keeps a reason id, label it "defensive, not CLI-applicable" so that no assertion claims to cover it.
- Its detail echoes the attacker-authored command. The reason/finding fields must therefore be printed **before** `detail=` and parsed with an anchored regex. Today L408's echo is safe only because the grammar excludes `=` (GREP_PATTERN L349, GREP_PATH L350, `countPattern` L353).

## Smallest safe corrections, for `TabiR15.CounterDiagnostics` (test side only)
1. **Reason-assert every count case**, mirroring the ROUND `detail:`/`detailOk` pattern (`check-round-contract.mjs:863-871,889-892`). Use the sibling vocabulary:
   - tee, shell, and option cases: `reason=unsupported_counting_command`
   - missing revision: `reason=counting_command_failed`
   - wrong after: `reason=after_count_mismatch`

   Parse the reason from the final stderr line with `/^USER_ROUND_CONTRACT verdict=failed finding=(\S+) reason=(\S+) detail=/m`, not with `includes`.
2. **Make option injection discriminating independently of the reason.** Replace or add a case with a harmless, fixture-local option, for example `git --git-dir=.git ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l`. Legacy runs it in the root, counts 0/1, and exits 0 clean, so the case FAILS against the legacy arm. Current HEAD refuses it at L391 because `TREE_COUNT` (L345) requires the `git ls-tree` prefix. Drop the vacuous `noMarker` from this case, or keep `/var/tmp/other` only as a secondary case with an explicit reason assertion.
3. **Make missing revision discriminating independently of the reason.** Choose values so the masked `0` equals `after`:
   - `command: git ls-tree -r --name-only ${zeros} | grep LOG.md | wc -l`, `before: 1`, `after: 0`, with `measured-against: ${zeros}`. LOG.md is present at the baseline (`writeGoodFixture` L620), so L596 gives `1`.
   - Correct gate: L408, `reason=counting_command_failed`.
   - Fail-open mutant or legacy: the after count of `0` matches, so the run proceeds to `checkReport`. The report cites the real measured commit, not zeros, so L505 fails with `report_commit` and the case FAILS.
4. **Add `count_rev_binding_refused`** to cover L392: `command` measures `${baseline}` while `measured-against` stays the measured commit. Expected: exit 1, `finding=score_mismatch reason=counting_revision_mismatch`. Legacy: `beforeCommand === command` → L493 `missing_score`, so the case discriminates on finding.
5. **Count witness:** add a `reason === 'unsupported_counting_command'` term at L832 and print `new_reason=` on L849/L1016. Then update the `measure.mjs` parser expectation (`.ufo/waves/round-14/measure.mjs:355`) only if L1 accepts the new field. Historical round-14 artifacts are immutable.

## No-harm notes
- None of these corrections changes the grammar, the counts, the committed rows, the pins (HARD_BASELINE, PSTACK_PIN, CENSUS_SHA256), or the case count semantics, except for the additive cases in items 2 and 4.
- If cases are added, the `cases=`/`fixtures=` tally in `USER_ROUND_CONTRACT_SELFTEST` changes. L1 must record that tally change as a claimed delta, not as scalar inflation.

## Commands for L1 to run after integration (not run by me)
- `node scripts/check-user-round-contract.mjs --self-test`. Expect each count case line to carry the expected reason.
- Mutation probe in a scratch clone:
  1. Patch L408 (HEAD numbering) to `if (result.error)`.
  2. Run `--self-test`.
  3. Expected: `count_missing_revision_red` reports **FAIL**. Today it would PASS.
- Legacy-arm probe in a scratch clone: run the option-injection and missing-revision fixtures through blob `7df3ee9` (as `runCountWitness` L818-822 does). Expected after the corrections: legacy exits 0 clean for the option case and exits 1 `report_commit` for the missing-revision case. Both differ from the new gate.
- `git diff HEAD -- scripts/check-user-round-contract.mjs | grep -E 'HARD_BASELINE|PSTACK_PIN|CENSUS_SHA256'`. Expected: empty.
