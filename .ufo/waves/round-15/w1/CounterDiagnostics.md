# CounterDiagnostics — USER counter refusal reason/applicability contract

Role: executor, leaf seat `TabiR15.CounterDiagnostics`. No checks, builds, selftests,
smoke runs, browser runs or counters were executed. No tools were installed or updated.
Author-side implementation report, not non-author certification.

## Scope and routed defect

Owned file: `scripts/check-user-round-contract.mjs` only.

Read routed4 in `corpus/lessons/round-14-verifier-spotcheck.md` (“Routed defects and
retained debt”, item 4):

> USER malicious fixtures assert score_mismatch but not the intended reason, and
> `no_marker=0` also means not applicable on unrelated controls.

The delivered change makes a `score_mismatch` receipt name its cause, makes marker
applicability a separate literal field from the marker outcome, and makes a control that
fails for a different `score_mismatch` cause fail the new assertion.

## Files changed

- `scripts/check-user-round-contract.mjs` (292 insertions, 33 deletions against HEAD
  `7054a5e`).
- This report. No other file was written; `scripts/check-round-contract.mjs` (ROUND gate),
  baselines, history pins, `SCORECARD.md`, `LOG.md`, evidence and configs are untouched.

## Refusal diagnostics

`fail(finding, detail, exit, reason)` now attaches one stable reason id from a closed
vocabulary (`COUNT_REASONS`). The published child record is:

```text
USER_ROUND_CONTRACT verdict=failed finding=<finding> reason=<id> detail=<text>
USER_ROUND_CONTRACT verdict=could-not-evaluate finding=<finding> detail=<text>
USER_ROUND_CONTRACT verdict=clean rounds=N consequential=0
```

`reason=` is emitted between `finding=` and `detail=`, only when a counting-contract
refusal has one. Non-counting findings keep their historical line, so the production
short-circuit line is byte-identical: exit 1, `finding=round_count`,
`Found 6 user rounds, expected 10`.

Stable reason ids and their exact emitters (worktree lines):

| Reason id | Emitter |
|---|---|
| `unsupported_counting_command` | `parseScore` unsupported grammar, line 414 |
| `counting_revision_mismatch` | `parseScore` command revision ≠ measured-against, line 415 |
| `unsupported_counting_command` | `runCount` defensive grammar refusal, line 423 |
| `counting_command_failed` | `runCount` spawn/git failure, line 431 |
| `score_not_improved` | declared before equals declared after, line 619 |
| `before_count_mismatch` | baseline count differs, line 621 |
| `after_count_mismatch` | measured count differs, line 622 |

An unknown reason id is rejected at construction (`fail` throws could-not-evaluate exit 2
with `Unknown refusal reason`), so a typo cannot silently weaken a control.

## Anchored child receipt parsing

New `receiptOf(result)` (lines 756–779) parses only the child’s own contract record:

- failure: last stderr line starting `USER_ROUND_CONTRACT `, anchored
  `^USER_ROUND_CONTRACT verdict=(failed|could-not-evaluate) finding=([a-z_]+)(?: reason=([a-z_]+))? detail=(.*)$`;
- clean: last stdout line matching `^USER_ROUND_CONTRACT verdict=clean(?: |$)`;
- an absent reason parses as `null`, which is evidence that the refusal is outside the
  counting contract, never that a reason matched.

This replaces first-match-over-combined-output matching for the new assertions. The
ROUND progress line echoes lesson `spot=` prose, so a first-match search over stdout is
not identity evidence. `gateFields` is retained only for the legacy history witness arm.

`receiptMatches(expected, observed)` (781–788) asserts exit, finding, reason and detail
independently. A matching exit and `finding=score_mismatch` cannot satisfy an expectation
whose reason or detail belongs to another cause.

## Literal per-case expectations

Every counting control now declares its own literals in `cases[]`: `reason`, `detail` and
`appliesMarker`. No expectation is inferred from the production predicate.

Reason-asserting controls (8 cases, 6 distinct reason ids):

| Case | Expected reason | Applicability |
|---|---|---|
| `count_malicious_tee_refused` | `unsupported_counting_command` | applicable |
| `count_malicious_shell_refused` | `unsupported_counting_command` | applicable |
| `count_malicious_option_injection_refused` | `unsupported_counting_command` | not applicable (command never references the marker) |
| `count_missing_revision_red` | `counting_command_failed` | not applicable |
| `count_wrong_after_red` | `after_count_mismatch` | not applicable |
| `count_revision_mismatch_red` (new) | `counting_revision_mismatch` | not applicable |
| `count_before_after_equal_red` (new) | `score_not_improved` | not applicable |
| `count_before_mismatch_red` (new) | `before_count_mismatch` | not applicable |

Each also asserts a literal detail fragment (`counting command is not a supported git
line count`, `Counting command failed:`, `after measurement does not match`,
`does not measure its measured-against commit`, `before and after are the same`,
`before measurement does not match`). The three new cases cover the two previously
unexercised parsing/static refusals and the before-count path.

## Marker applicability versus no-marker outcome

Per parent ruling, the per-case receipt is:

```text
SELFTEST name=<case> expected_exit=<n> actual_exit=<n> expected_finding=<token>
  [expected_reason=<id>] reason=<id|none>
  applicability=<applicable|not_applicable>
  marker_applicable=<0|1> marker_outcome=<absent|present|not-applicable>
  no_marker=<1|0|na> isolation=cli result=<PASS|FAIL>
```

- `no_marker=1`: marker check applicable and marker absent (the passing outcome).
- `no_marker=0`: marker check applicable and marker present (a leak; the case also fails
  because `match` requires `!leaked`).
- `no_marker=na`: marker check not applicable; `marker_outcome=not-applicable`.
- `applicability`/`marker_applicable` state applicability independently of the outcome.

`no_marker=0` is therefore never emitted for “not applicable”. Committed-row count
receipts print `applicability=not_applicable marker_applicable=0
marker_outcome=not-applicable no_marker=na`, removing the routed4 overload.

## Falsifiable wrong-reason controls

1. `SELFTEST name=reason_negative_control` (lines 1227–1241) consumes two actual child
   receipts from the same self-test run. The missing-revision fixture returns
   `score_mismatch` for `counting_command_failed`. The decoy expectation is
   `after_count_mismatch` with the after-mismatch detail. The control passes only when:
   a finding-only predicate would accept that receipt (exit 1, score_mismatch), the
   strict comparator rejects the decoy, the real reason matches, and the malicious tee
   control’s own reason matches. If the comparator ever ignored reason, `actual_outcome`
   becomes `match` and the control fails.
2. `--diagnostic-witness` (new mode, lines 964–1043) runs two same-fixture differentials:
   - Arm 1 (baseline vs repaired): the pinned round-14 delivered gate at
     `5c7710d7393112f2163dd7efcaa38fccf534dfc2` (blob `347ae9bb…`, sha256 `bde18c67…`)
     and the reason-bearing worktree evaluate one supported count with a wrong declared
     after value. Both exit 1 with `score_mismatch`; baseline has no reason, repaired
     reports `after_count_mismatch`. The malicious expectation
     `unsupported_counting_command` is rejected and the correct after reason accepted.
   - Arm 2 (repaired vs mutant): the worktree and a byte-identical copy with the unique
     `MASK_GUARD` line replaced once by `const masked = true;` evaluate one
     missing-revision fixture. Repaired reports `counting_command_failed`; the mutant
     reports `after_count_mismatch` for the same bytes and args. The correct reason
     fails on the mutant, the decoy reason matches the mutant, and the finding-only
     predicate accepts the mutant. A missing or duplicated guard fragment is
     could-not-evaluate exit 2, never a silent no-op.
   The diagnostic receipt reports `wrong_reason`, `expected_outcome=no-match`,
   `wrong_match`, `correct_reason`, `correct_match`, `mutant_reason`,
   `mutant_correct_match`, `mutant_decoy_match`,
   `baseline_finding_only_accepts`, code sha256/blob and both arm args.
3. `runCountWitness` now requires the new arm to carry
   `reason=unsupported_counting_command`; `SELFTEST name=count_witness_comparison` also
   asserts it. A finding-only differential can no longer pass.

The self-test also runs the diagnostic differential
(`SELFTEST name=diagnostic_witness_comparison`, lines 1264–1271). No new browser run,
coverage or scalar is claimed.

## Preserved behavior

- `countingCommand`, `countPattern`, `runCount` argv execution, grep exit-1 masking and
  the closed tree/grep grammars are unchanged.
- `checkHistory`, `acceptedRoundScript`, `lessonDrift`, `pstackDrift`, `HARD_BASELINE`,
  `PSTACK_PIN`, ROUND script digests, `LEGACY_*` blobs and `SHONEN_SEED_SHA256` are
  unchanged.
- `--expect` default remains 10; `checkPublic` production behavior is unchanged.
- `check` still stops at `round_count` for the 6/10 production lane before counting.
- The ROUND checker is not edited.
- Success/clean output keeps its historical shape; only refusals with a counting reason
  gain `reason=` between finding and detail.

## Evidence pointers

- Routed4: `corpus/lessons/round-14-verifier-spotcheck.md`, “Routed defects and retained
  debt”, item 4.
- Round-14 delivered gate identity used as diagnostic baseline:
  `5c7710d7393112f2163dd7efcaa38fccf534dfc2:scripts/check-user-round-contract.mjs`,
  blob `347ae9bbcdc692c3ad55fdfd931fa2cce13fec6d`, sha256
  `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3` (also recorded
  in the round-14 lesson).
- Consumer contract: `.ufo/waves/round-15/measure.mjs` header lines 29–61 and
  `countC1` lines 486–620; exact field names were messaged to
  `TabiR15.MeasureContracts`. Note: its current marker condition treats
  `no_marker=1` as not-applicable, which is inverted relative to the parent’s ruling
  (`1` = applicable and absent); that probe condition needs the corresponding update.
- `COUNT_WITNESS_REV = bebe2efc4565bb068efd905e9ef78011bb6b4efd` (unchanged shell arm).

## Commands for L1 (not run here; expected outcomes are declarations, not observations)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-user-round-contract.mjs --self-test
node scripts/check-user-round-contract.mjs --diagnostic-witness
node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd
node scripts/check-user-round-contract.mjs --repo . --baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c --expect 10
```

Declared expectations, to be established by execution:

- `--self-test` exits 0 and ends with
  `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=<fixtures + committedCounts + 4>`;
  every emitted `SELFTEST` line is `result=PASS`; the reason controls print
  `expected_reason` equal to `reason` for at least six distinct ids; three marker
  controls print `applicability=applicable no_marker=1`; non-marker controls print
  `applicability=not_applicable no_marker=na`.
- `reason_negative_control` prints `observed source_reason=counting_command_failed`,
  `wrong_reason=after_count_mismatch`, `actual_outcome=no-match`,
  `correct_match=1`, `legacy_finding_only_accepts=1`.
- `--diagnostic-witness` exits 0 with `wrong_match=0`, `correct_match=1`,
  `baseline_finding_only_accepts=1`, `mutant_reason=after_count_mismatch`,
  `mutant_correct_match=0`, `mutant_decoy_match=1`.
- Production check still exits 1 with `USER_ROUND_CONTRACT verdict=failed
  finding=round_count` and `Found 6 user rounds, expected 10`.
- `measure.mjs <REV> --claim C1` counts 1 only when the committed receipt matches the
  emitted stdout and the probe’s marker semantics are corrected as above.

## Risks and retained debt

- The three new fixture controls rely on the existing fixture shape; if any assumption
  differs, the self-test fails loudly with the observed child output, not silently.
- `receiptOf` treats the last matching contract line as the record. A future child that
  writes contract-shaped text after its final record could confuse the parser; current
  children write exactly one record.
- `gateFields` remains first-match and is still used for the legacy history witness and
  the count-witness old arm; no new assertion in this change depends on it.
- Inherited, intentionally unaddressed debt: git environment inheritance
  (`GIT_DIR`/`GIT_CONFIG_*`) can redirect fixture or production git use; a nonzero git
  status is still `score_mismatch reason=counting_command_failed`, not a split between
  missing revision and environment failure (CountShellBoundary, ToolsSafety); r07
  survivor replay, user-record freezing, IPv6 loopback classification and validator
  digest pinning are untouched (PriorDebt). These do not claim env or history safety.
- No sidecar/measurement receipt was written here; `corpus/evidence/round-15/` remains
  L1/MeasureContracts-owned.
