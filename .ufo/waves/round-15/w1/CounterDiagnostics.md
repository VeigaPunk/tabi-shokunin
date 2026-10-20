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

- `scripts/check-user-round-contract.mjs`.
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

Stable reason ids and their emitters (worktree lines):

| Reason id | Emitter |
|---|---|
| `unsupported_counting_command` | `parseScore` unsupported grammar |
| `counting_revision_mismatch` | `parseScore` command revision ≠ measured-against |
| `unsupported_counting_command` | `runCount` defensive grammar refusal |
| `counting_command_failed` | `runCount` spawn/git failure |
| `score_not_improved` | declared before equals declared after |
| `before_count_mismatch` | baseline count differs |
| `after_count_mismatch` | measured count differs |

An unknown reason id is rejected at construction (`fail` throws could-not-evaluate exit 2
with `Unknown refusal reason`), so a typo cannot silently weaken a control.

## Anchored child receipt parsing

New `receiptOf(result)` parses only the child’s own contract record:

- failure: last stderr line starting `USER_ROUND_CONTRACT `, anchored
  `^USER_ROUND_CONTRACT verdict=(failed|could-not-evaluate) finding=([a-z_]+)(?: reason=([a-z_]+))? detail=(.*)$`;
- clean: last stdout line matching `^USER_ROUND_CONTRACT verdict=clean(?: |$)`;
- an absent reason parses as `null`, which is evidence that the refusal is outside the
  counting contract, never that a reason matched.

This replaces first-match-over-combined-output matching for the new assertions. The
ROUND progress line echoes lesson `spot=` prose, so a first-match search over stdout is
not identity evidence. `gateFields` is retained only for the legacy history witness arm.

`receiptMatches(expected, observed)` asserts exit, finding, reason and detail
independently. A matching exit and `finding=score_mismatch` cannot satisfy an expectation
whose reason or detail belongs to another cause.

## Literal per-case expectations

Every counting control declares its own literals in `cases[]`: `reason`, `detail` and
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

Each also asserts a literal detail fragment. The three new cases cover the previously
unexercised revision-binding refusal, static before/after equality, and the before-count
path.

## Marker applicability versus no-marker outcome

Per parent ruling, the per-case receipt is:

```text
SELFTEST name=<case> expected_exit=<n> actual_exit=<n> expected_finding=<token>
  [expected_reason=<id>] reason=<id|none>
  applicability=<applicable|not_applicable>
  marker_applicable=<0|1> marker_outcome=<absent|present|not-applicable>
  no_marker=<1|0|na> kind=child_cli isolation=cli result=<PASS|FAIL>
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

1. `SELFTEST name=reason_negative_control` consumes two actual child receipts from the
   same self-test run. It constructs decoys whose exit, finding and detail are copied
   from the observed receipt, varying only reason. The reasonless form must match, the
   wrong reason must not, and the actual reason must. If the comparator ignored reason,
   the wrong-reason decoy would match and the control fails. The exit+finding acceptance
   is labeled `predicate=synthesized_exit_finding`, not a legacy comparator.
2. `--diagnostic-witness` runs two same-fixture differentials:
   - Arm 1 (baseline vs repaired): the pinned round-14 delivered gate at
     `5c7710d7393112f2163dd7efcaa38fccf534dfc2` (blob `347ae9bb…`, sha256 `bde18c67…`)
     and the reason-bearing worktree evaluate one supported count with a wrong declared
     after value. Both exit 1 with `score_mismatch`; baseline has no reason, repaired
     reports `after_count_mismatch`. A reasonless decoy copied from that receipt matches;
     changing only reason to `unsupported_counting_command` is rejected; changing only
     reason to `after_count_mismatch` matches.
   - Arm 2 (repaired vs mutant): the worktree and a byte-identical copy with the masking
     guard replaced once evaluate one missing-revision fixture. Repaired reports
     `counting_command_failed`; the mutant reports `after_count_mismatch` for the same
     bytes and args. A reasonless decoy copied from the mutant receipt matches; changing
     only reason to `counting_command_failed` is rejected; only the mutant’s actual after
     reason matches. This retains the actual regressed-mask control cause.
3. `runCountWitness` requires the new arm to carry
   `reason=unsupported_counting_command`; `SELFTEST name=count_witness_comparison` also
   asserts it.

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
  `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3`.
- Consumer contract: `.ufo/waves/round-15/measure.mjs`; exact field names were messaged to
  `TabiR15.MeasureContracts` and the probe now binds them.
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
  every emitted `SELFTEST` line is `result=PASS`; reason controls print
  `expected_reason` equal to `reason`; marker controls print `applicability=applicable
  no_marker=1`; non-marker controls print `applicability=not_applicable no_marker=na`.
- `reason_negative_control` prints `reasonless_match=1`, `wrong_reason=after_count_mismatch`,
  `actual_outcome=no-match`, `correct_match=1`, `predicate=synthesized_exit_finding`.
- `--diagnostic-witness` exits 0 with `reasonless_match=1`, `wrong_reason_only_match=0`,
  `correct_match=1`, `mutant_reasonless_match=1`, `mutant_wrong_reason_only=0`,
  `mutant_decoy_match=1`, `baseline_predicate=synthesized_exit_finding`, and the mask
  split exactly two parts.
- Production check still exits 1 with `USER_ROUND_CONTRACT verdict=failed
  finding=round_count` and `Found 6 user rounds, expected 10`.

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

## Wave2 correction (supersedes earlier build claims above)

Build `72dcf03` surfaced two wave2 findings against the first worktree; both are repaired
in the same owned file. No checks were run for this correction either.

### CRITICAL — mask guard matched its own oracle literal

The first worktree stored `MASK_GUARD` as the bare statement text. That text occurs twice
in the source: the real guard and the constant declaration. `split(MASK_GUARD)` therefore
produced 3 parts and the diagnostic witness always exited 2 at the split guard. The
constant is now assembled from parts and anchored to the real statement’s line context:

```js
const MASK_STATEMENT = "const masked = spec.kind === 'grep' && result.status === 1;";
const MASK_GUARD = `\n  ${MASK_STATEMENT}\n`;
const MASK_MUTANT = '\n  const masked = true;\n';
```

The declaration line is at column 0 and begins `const MASK_STATEMENT = "…`, so it has
neither the anchored leading newline plus two spaces nor the trailing newline. The runtime
needle exists only at the real `runCount` guard; split must yield exactly two parts.
The pass condition additionally asserts the mutant contains `MASK_MUTANT` and no longer
contains `MASK_GUARD`, so a no-op replacement cannot pass. The earlier claim that the mask
arm was valid at `72dcf03` is withdrawn; that build’s diagnostic witness result, if any,
is invalid for this reason.

### HIGH — decoys differed by detail as well as reason

The first decoys changed reason and detail together, so a comparator that ignored reason
could still reject them on detail. Every decoy now copies the observed receipt’s exit,
finding and detail and varies only reason:

- repaired wrong-after receipt: reasonless decoy matches; reason-only
  `unsupported_counting_command` decoy is rejected; reason-only `after_count_mismatch`
  decoy matches;
- mutant missing-revision receipt: reasonless decoy matches; reason-only
  `counting_command_failed` decoy is rejected; reason-only `after_count_mismatch` decoy
  matches.

`reason_negative_control` applies the same construction to the missing-revision receipt.
The receipts print `reasonless_match`, `wrong_reason_only_match` /
`mutant_wrong_reason_only` and `correct_match`, making the discrimination explicit. The
actual regressed-mask control (mutant reports `after_count_mismatch`) is retained.

### WR3 — synthesized labels

`baseline_predicate=synthesized_exit_finding` and
`predicate=synthesized_exit_finding` now label the exit+finding-only acceptance as a
synthesized predicate; no legacy comparator was invoked. The count-witness old arm now
reports `old_finding_source=record|synthesized_clean_verdict|absent` rather than presenting
a synthesized `clean` token as a parsed legacy finding.

### Evidence labels

The first worktree over-labeled every SELFTEST line as isolated CLI. Corrected labels:

- fixture child gates: `kind=child_cli isolation=cli` (the reason-asserting controls that
  MeasureContracts counts as isolated);
- `count_committed_*`: `kind=helper isolation=in_process` — `runCount` executes in the
  parent process, so this is not a child CLI;
- `count_witness_comparison`, `reason_negative_control` and
  `diagnostic_witness_comparison`: `kind=helper isolation=in_process` — these are
  in-process predicates over child receipts or differential runs;
- `production_alias_refused`: `kind=child_cli isolation=production_alias` — the child gate
  is run against a symlink alias of the production root, not an isolated fixture.

MeasureContracts excludes helper and production-alias lines by name. The existing
six-of-ten production refusal is unchanged. No environment, hook or security broadening
was made in this correction; L1 runs the minimal environment and documents its
precondition.

### Blocker status

Claimed blocker: the diagnostic witness was non-functional at build `72dcf03` because of
the self-matching guard. The worktree repair is in place but unverified until L1 runs the
commands above; until that run, no diagnostic-witness outcome should be claimed.
