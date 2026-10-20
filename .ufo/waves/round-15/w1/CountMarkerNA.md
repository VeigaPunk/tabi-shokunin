# CountMarkerNA — USER self-test `no_marker=0` ambiguity (critic, author-side, read-only)

Scope: C1 operability. Read-only audit of `scripts/check-user-round-contract.mjs` as read on
2026-10-20 (read-tag F083). The audit also covers its in-repo readers. I made no source edits and
ran no gates, counters, tests or suites. No tools were installed.
Line numbers refer to those bytes. If CounterDiagnostics has edited the file since, line
numbers may have shifted, but the quoted snippets still identify the sites.

## Axes
- **A1 truthfulness:** a `no_marker` value must state only an observed fact.
- **A2 applicability:** a reader can tell "not applicable" apart from "evaluated".
- **A3 reason precision:** a control passes only for its intended cause.
- **A4 backward-readability:** the round-14 immutable consumers and receipts still parse,
  and no scalar is inflated.

## Findings

### F1 — HIGH (A1/A2) — `no_marker=0` encodes three different states
- `scripts/check-user-round-contract.mjs:991` emits
  `no_marker=${test.noMarker ? (leaked ? 0 : 1) : 0}`. The value `0` means either "marker
  leaked" or "this case has no marker check" (`clean`, `count_*_supported`, `shonen_*`,
  `round_script_*`, …).
- `:1004` hardcodes `no_marker=0` on every `count_committed_<id>` line. That path never spawns
  the gate. It calls `runCount` in-process (`:1001-1002`), so no marker can apply.
- `:1016` hardcodes `no_marker=0` on `count_witness_comparison`, while the same line reports
  `new_marker=0`. Read literally, `no_marker=0` says "the marker exists" and `new_marker=0`
  says it is absent. That is a self-contradiction inside one receipt line.
- Mitigation that exists today: when `result=PASS`, `leaked` forces `match=false`
  (`:988-990`), so `no_marker=0` on a PASS line can only mean N/A. Two ambiguities remain:
  - On a FAIL line, `0` is ambiguous between a real leak and an unrelated failure in an N/A case.
  - A reader cannot tell the difference without recomputing the harness logic.
- Retained receipts carry the ambiguity permanently:
  - `corpus/evidence/round-14/executions/userSelfTest.json:11` (first line is
    `SELFTEST name=clean … no_marker=0`).
  - `corpus/evidence/round-14/gates.json:67`.
  - `corpus/lessons/round-14-verifier-spotcheck.md:187` already names this debt.
- Existing sibling convention: the ROUND gate omits the field when it does not apply. See
  `scripts/check-round-contract.mjs:889-891`: `const marker = test.marker ? \` no_marker=…\` : ''`.

### F2 — MED (A1/A2) — the option-injection control is marked applicable but its marker check is vacuous
- `:871-873` `count_malicious_option_injection_refused` uses the command
  `git --git-dir=/var/tmp/other ls-tree … | grep round-marker.txt | wc -l`. It sets
  `noMarker: COUNT_WITNESS_MARKER`, but no stage of that command can create
  `.user-round14-count-marker`, under either legacy-shell or argv execution.
- So `no_marker=1` is always true for this case and proves nothing.
- The tee and `sh -c 'touch …'` cases (`:865-870`) do reference the marker:
  - The legacy cwd=root reachability of the tee shape is proven by the count witness `oldMarker`
    arm (`:822-823`).
  - The `sh -c` shape uses the same cwd.
- The same pattern exists in the ROUND gate: `count_traversal_grep_path` sets
  `marker: 'count-traversal-marker'`, which its command never references
  (`scripts/check-round-contract.mjs:868-871`). Carry this only; this round must not edit the ROUND gate.

### F3 — HIGH (A3) — the expected-cause assertion is a substring search and accepts any `score_mismatch`
- `:988-989`: `output.includes(\`finding=${test.finding}\`)` over stdout+stderr. `score_mismatch` has six distinct origins:
  - `:391` grammar refused in `parseScore`
  - `:392` rev not bound to measured-against
  - `:594` before==after
  - `:596` before mismatch
  - `:597` after mismatch
  - `:398`/`:408` runner unsupported / git execution failed
- **Strongest counterexample from local evidence.** Suppose a regression loosened `TREE_COUNT`
  (`:345`) to pass a leading `--git-dir=…` option through to argv. Then
  `count_malicious_option_injection_refused` would actually execute git against the
  attacker-chosen dir. `/var/tmp/other` is absent, so git exits nonzero, and `:408` throws
  `score_mismatch "Counting command failed"`. Result: exit 1, `finding=score_mismatch`, and a
  vacuous `no_marker=1` (F2). The control prints `result=PASS` even though the injection
  was executed.
- **Second counterexample.** `count_missing_revision_red` (`:883-888`) exists to catch the
  historical `wc -l` masking of git failure (comment at `:404-406`). If masking were
  reintroduced (nonzero status treated as count 0), then `after` = 0 ≠ 1, `:597` throws
  `score_mismatch "after measurement does not match"`, and the control still passes. The
  intended cause is `:408`.
- **Self-satisfaction hazard.** The detail at `:398` echoes attacker-controlled SCORECARD
  command text (`Unsupported counting command: ${command}`), and the whole output goes through
  `includes()`. A command containing the literal `finding=score_mismatch` (or any future
  reason/detail string) therefore satisfies the assertion whatever the real finding is.
  Reason checks must not use `includes()` on raw output.

### F4 — LOW (A1) — the witness line synthesizes exits
`:1016` prints `expected_exit=0 actual_exit=${witnessMatch?0:1}`. These are derived values,
not a process status. This belongs to the CountWitnessReason slice; it is noted here only
because that line also carries the false `no_marker=0`.

## Recommended schema (backward-readable)

**Gate failure line (`:1041`).** Insert one stable token after `finding=` and before `detail=`:

```
USER_ROUND_CONTRACT verdict=failed finding=score_mismatch reason=<code> detail=<free text>
```

This stays compatible with every in-repo parser:
- `gateFields` `(?:^|\s)finding=([a-z_]+)` (`:727`)
- ROUND `/finding=(\w+)/` (`check-round-contract.mjs:954,1002-1003`)
- r14 `measure.mjs:524` `verdict=failed finding=([a-z_]+)` (finding still comes first)
- `measure.mjs:272` `(?:^|\s)(?:red_)?finding=` (`reason=` does not match it)

Rules:
- `reason` is `[a-z_]+` and is never derived from input text.
- `fail()` gains a fourth `reason` argument. If a site has no code, emit `reason=unspecified`.

Proposed codes for score_mismatch sites:

| Site | Code |
|---|---|
| `:391` | `count_command_unsupported` |
| `:392` | `count_rev_unbound` |
| `:594` | `count_before_equals_after` |
| `:596` | `count_before_mismatch` |
| `:597` | `count_after_mismatch` |
| `:398` | `count_command_unsupported` |
| `:408` | `count_exec_failed` |

**SELFTEST lines.** Keep the exact r14 prefix grammar
(`measure.mjs:212` `^SELFTEST name=… expected_exit=… actual_exit=… expected_finding=… result=(PASS|FAIL)(.*)$`).
Append the new fields after `result=`, in a fixed order:

```
… result=<PASS|FAIL> marker_check=applicable marker_path=.user-round14-count-marker no_marker=<1|0> expected_reason=<code|none> actual_reason=<code|none>
… result=<PASS|FAIL> marker_check=not_applicable expected_reason=<code|none> actual_reason=<code|none>
```

Field rules:
- **`no_marker` is emitted only when `marker_check=applicable`.** Then `1` means the file was
  observed absent and `0` means it was observed present. This matches the ROUND omission
  convention (`check-round-contract.mjs:891`).
  - On `count_committed_*`, keep `marker_check=not_applicable` and drop the literal `no_marker=0`.
  - On `count_witness_comparison`, do the same; it keeps `old_marker`/`new_marker`, which are the real observations.
- **Do not add a bare `marker=` or any `*finding=` field to SELFTEST lines.**
  - `measure.mjs:357` matches `\b(?:old_|new_)?marker=`, and `marker_check=` does not trip it.
  - `measure.mjs:272` would collect `finding=` tokens.
- **Parse `actual_reason` exactly from the final gate line**, for example
  `^USER_ROUND_CONTRACT verdict=\S+ finding=(\S+) reason=([a-z_]+) detail=` with the `m` flag
  on stderr. Then require
  `actual_finding === expected_finding && actual_reason === expected_reason`.
  Do not use `includes()`.
- **Per-case literal expectations** (case table, independent of output):

  | Case | `reason` | `marker_check` |
  |---|---|---|
  | `count_malicious_tee_refused` | `count_command_unsupported` | applicable |
  | `count_malicious_shell_refused` | `count_command_unsupported` | applicable |
  | `count_malicious_option_injection_refused` | `count_command_unsupported` | not_applicable (F2), unless the command is changed to reference the marker |
  | `count_missing_revision_red` | `count_exec_failed` | — |
  | `count_wrong_after_red` | `count_after_mismatch` | — |
  | clean/supported | `none` | — |

- **Legacy-read rule** (for L1/docs; do not rewrite immutable receipts): a line without
  `marker_check=` is legacy.
  - Legacy `no_marker=1` means evaluated absent.
  - Legacy `no_marker=0` is indeterminate (leak or N/A) and must never be read as a leak.
  - Round-14 receipts (`userSelfTest.json`, `gates.json`) stay as they are under this rule.
- **r14 consumer impact:** none.
  - The malicious count needs ≥1 PASS line with `no_marker=1`; tee and shell still provide 2.
  - The fail-closed and supported counts are unchanged, provided no new case named `count_*` is added (see the next bullet).

**Falsifiable negative reason control (for the CLI).** Add a harness-meta case that reuses the
`count_wrong_after_red` fixture and declares `expected_reason=count_command_unsupported`. It
must assert that the oracle rejects the mismatch: real `actual_reason=count_after_mismatch`,
finding equal, `reason_match=0`. It prints `result=PASS` only when the harness refused the
wrong cause.
- Name it without `count` (for example `reason_oracle_negative`). `count_*` with expected exit ≠ 0
  would inflate the r14-style `failClosed` scalar (`measure.mjs:495-499`).
- Including it in `cases=` must be stated explicitly in the summary line. For example, add a
  separate `reasonNegative=1` token rather than silently increasing `fixtures=`.

## Tests or assertions L1 should run after integration (not run here)
- `node scripts/check-user-round-contract.mjs --self-test`. Expect `USER_ROUND_CONTRACT_SELFTEST verdict=clean`, and:
  - every line has `marker_check=`
  - `no_marker=` appears only together with `marker_check=applicable`
  - the malicious lines show `expected_reason=count_command_unsupported actual_reason=count_command_unsupported`
  - `count_missing_revision_red` shows `actual_reason=count_exec_failed`
  - the negative reason control shows PASS with `reason_match=0`
- `node scripts/check-user-round-contract.mjs` (production). Expect it to be unchanged: exit 1,
  `finding=round_count` (now also `reason=…`; confirm the code is not reused from score_mismatch).
- Static checks:
  - `grep -n "no_marker=0" scripts/check-user-round-contract.mjs` returns no hardcoded literal.
  - `grep -n "output.includes(.finding=" scripts/check-user-round-contract.mjs` shows no remaining
    substring assertion on the reason or finding for the count cases.
- Back-compat: run the immutable `.ufo/waves/round-14/measure.mjs` probe (whatever entry L1 uses)
  against the new self-test stdout. Confirm `maliciousNoMarker≥1`, an unchanged `failClosed`/`supported`,
  and `countWitness=1`.

## Smallest safe correction (owner: CounterDiagnostics, `scripts/check-user-round-contract.mjs` only)
1. `fail(finding, detail, exit=1, reason='unspecified')`. Thread the codes listed above into the
   score_mismatch sites. Print `reason=` between `finding=` and `detail=` at `:1041`.
2. In the case table, add `reason` per case and change `noMarker` to an explicit
   `markerCheck: 'applicable'|'not_applicable'` plus `marker`. Mark option injection not_applicable.
3. In the `:988-991` matcher, parse the anchored final gate line and require exact finding and
   reason equality. Emit the appended fields in the schema order above.
4. At `:1004` and `:1016`, replace `no_marker=0` with `marker_check=not_applicable`.
5. Add the `reason_oracle_negative` meta-control and the summary token.
