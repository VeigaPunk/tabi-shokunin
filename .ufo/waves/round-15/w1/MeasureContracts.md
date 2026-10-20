# MeasureContracts — round-15 C1/C2 counting probe

Owned deliverable: `.ufo/waves/round-15/measure.mjs` (1431 lines, new file). No other file modified.
Nothing was executed: per the wave contract this seat runs no gate, checker, selftest, lint,
formatter, smoke test, or browser. Every claim below is a source-level statement about the probe
and the receipt contracts it enforces, not an observed run outcome.

## Axes

1. **C1 truthfulness** — a USER-counter refusal counts only with cause-specific reason ids and
   explicit applicability classes, not just `score_mismatch`.
2. **C2 enforcement** — the historical ARIA checker's false-mirror acceptance is contradicted by
   the new checker's refusal, snapshot tampering is classified could-not-evaluate (exit 2), and
   the canonical historical correction is still accepted byte-for-byte.
3. **Claim independence** — C1, C2 and the histogram read disjoint committed evidence, so one
   malformed receipt cannot suppress or inflate the other claim.
4. **Fail-closed measurement** — missing evidence is an honest 0; present-but-wrong evidence is
   0 with sorted errors and exit 1; unresolvable input is exit 2.

## Probe

- Node ESM, no dependencies. All repository reads are `spawnSync('git', argv)` calls with
  `cwd = lane root`; there is no shell, no `-c`, no `shell: true`, no gate execution.
- Selectors: `REV` (resolved to a commit), `--claim C1`, `--claim C2`, `--histogram`. `--claim`
  and `--histogram` are mutually exclusive; unknown arguments exit 2.
- Output: one JSON line on stdout. On errors, one `MEASURE verdict=failed errors=N` line on
  stderr and exit 1. On revision/usage failure, `MEASURE verdict=could-not-evaluate detail=...`
  and exit 2.
- Disjoint reads:
  - `--claim C1`: `corpus/evidence/round-15/user-diagnostics.json` plus
    `scripts/check-user-round-contract.mjs` at the receipt revision.
  - `--claim C2`: `corpus/evidence/round-15/metadata-differential.json`, the committed paths it
    names, `scripts/check-aria-metadata.mjs` at the receipt/baseline revisions, and the round-14
    corrected sidecar + verification receipt.
  - `--histogram`: `corpus/SOURCES.md`, `corpus/README.md`, `corpus/knowledge/` listing only.
- Scalar deltas are fixed at 0 (`c1_operability_scalar_delta`, `c2_calibration_scalar_delta`);
  no browser run, coverage or ordinal score is claimed.
- Posture: the probe is an attested-execution index, not a truth authority or a security gate. It
  binds committed digests, revisions and shipped output vocabularies; it does not attempt a broad
  hostile-JavaScript source security parser. The existing non-shell scan is the bounded round-14
  invariant only.

## C1 receipt (L1-owned; the probe never writes it)

Path: `corpus/evidence/round-15/user-diagnostics.json`

```json
{
  "schema": "tabi-round15-user-diagnostics-v1",
  "revision": "<40-hex USER gate commit>",
  "codeSha256": "<64-hex USER gate blob digest at revision>",
  "selfTest": { "exit": 0, "stdout": "<verbatim>", "stderr": "" },
  "production": { "exit": 1, "stdout": "<verbatim>", "stderr": "" }
}
```

`revision` must be an ancestor of the measured revision, the committed
`scripts/check-user-round-contract.mjs` at that revision must hash to `codeSha256`, and the same
gate blob at the measured revision must also hash to `codeSha256`. A receipt captured before a
later gate change is stale and stays 0.

The USER gate prints its refusal record on **stderr** (`CHILD record`); the receipt must capture
that stream verbatim in `production.stderr` (the probe reads `stdout` + `stderr`). A receipt that
records only stdout cannot satisfy rule 8 and stays 0.

### C1 counting rules (all must hold)

1. Gate source at `revision` contains no shell binary invocation, `shell: true` or quoted `-c`;
   its `runCount` body is non-shell (the round-14 cutover is preserved).
2. `selfTest.exit === 0` and stdout prints `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=N`
   with `N >= 6` and `N >=` the number of emitted SELFTEST case lines.
3. Every SELFTEST case line that carries `name=`/`case=`, `expected_exit=` and `result=` parses;
   a line that fails to parse is an error, never silently skipped. Every case is `PASS`,
   `expected_exit == actual_exit`, and `expected_finding` is one of the bounded shipped findings
   (`clean`, `usage` and the gate's `fail(...)` vocabulary, 20 ids); an arbitrary token is an
   error. When a shipped `finding=` token is present it must equal `expected_finding`.
4. At least 3 passing cases assert a shipped cause: `expected_reason` must be one of
   `unsupported_counting_command`, `counting_revision_mismatch`, `counting_command_failed`,
   `score_not_improved`, `before_count_mismatch`, `after_count_mismatch`; `reason` must equal it;
   `reason=none` never counts; at least 2 distinct cause ids must appear.
5. At least 2 reason-asserting cases are isolated fixture CLI controls: `isolation=cli` when
   shipped, otherwise fixture provenance (helpers/in-process and the production alias are
   excluded: `count_committed_*`, `count_witness*`, `reason_negative_control`,
   `diagnostic_witness_comparison`, `production_*`). At least 1 isolated refusal
   (`expected_exit != 0`) asserts a shipped cause id, so a wrong generic reason cannot pass.
6. Every case states applicability as exactly `applicable` or `not_applicable`, with the exact
   shipped marker tuple:
   - `applicable` => `marker_applicable=1`, `marker_outcome=absent` with `no_marker=1` or
     `marker_outcome=present` with `no_marker=0`;
   - `not_applicable` => `marker_applicable=0`, `marker_outcome=not-applicable`, `no_marker=na`.
   N/A never counts as an absence (`no_marker=1`) even if `marker_outcome` is forged, and both
   applicability classes must appear.
7. At least one marker-applicable observation is required (`no_marker=1/0` or
   `marker_applicable=1` on an applicable case); an applicable case cannot claim a
   not-applicable marker datum and vice versa.
8. `production` keeps the historical honest refusal exactly: exit 1,
   `USER_ROUND_CONTRACT verdict=failed finding=round_count`, `Found 6 user rounds, expected 10`,
   no clean verdict.

Shipped case line the probe binds to (confirmed by TabiR15.CounterDiagnostics, worktree source;
the probe reads only committed stdout):

```
SELFTEST name=<case> expected_exit=<n> actual_exit=<n> expected_finding=<token>
  [expected_reason=<id>] reason=<id|none> applicability=<applicable|not_applicable>
  marker_applicable=<0|1> marker_outcome=<absent|present|not-applicable>
  no_marker=<1|0|na> isolation=cli result=<PASS|FAIL>
```

Output keys: `c1_truthful_diagnostics`, `c1_receipt`, `c1_diagnostics` (total/passing/
reasonAssertions/distinctReasons/applicable/notApplicable/isolatedCli/negativeReason/
markerApplicability), `c1_production`, `c1_operability_scalar_delta`, receipt/checker paths.

## C2 receipt (L1-owned differential harness output; the probe never writes it)

Path: `corpus/evidence/round-15/metadata-differential.json`

```json
{
  "schema": "tabi-round15-metadata-differential-v1",
  "revision": "<40-hex new ARIA gate commit>",
  "codeSha256": "<64-hex ARIA gate blob digest at revision>",
  "baseline": "<40-hex historical ARIA gate commit>",
  "oldCodeSha256": "<64-hex ARIA gate blob digest at baseline>",
  "selfTest": { "exit": 0, "stdout": "<verbatim>", "stderr": "" },
  "snapshotInputs": { "<committed path>": "<64-hex>" },
  "mirrors": [
    { "case": "<one of the nine required fields>",
      "before": { "exit": 0, "stdout": "<historical checker>", "stderr": "" },
      "after":  { "exit": 1, "stdout": "<new checker>", "stderr": "" },
      "pass": true }
  ],
  "positive": { "exit": 0, "stdout": "...", "stderr": "",
                "payload": { "sidecar": {
                  "path": "corpus/evidence/round-14/aria-metadata/corrected.json",
                  "sha256": "<64-hex>" } } },
  "oldPositive": { "exit": 0, "stdout": "..." },
  "tamper": { "case": "spec-snapshot-digest",
              "field": "<concrete snapshot input path>",
              "recordedSha256": "<64-hex>",
              "computedSha256": "<64-hex>",
              "before": { "exit": 1, "stdout": "<historical checker>", "stderr": "" },
              "after":  { "exit": 2, "stdout": "<new checker>", "stderr": "" },
              "pass": true },
  "originalsUnchanged": { "<committed path>": true },
  "pass": true,
  "browserExecuted": false
}
```

`mirrors` must contain exactly the nine newly enforced differentials. A subset, duplicate or
extra case fails closed; there is no `emittedMirrors` authority to opt out of a case:
`cleanup.allClosed`, `cleanup.allRefusedAfterClose`, `cleanup.allNotListeningAfter`,
`cleanup.derivedListeningAfter`, `cleanup.perWorkerCount`, `cleanup.summaryServerOk`,
`qualification.everyProofListensBefore`, `qualification.everyProofClosed`,
`qualification.everyProofRefusedAfterClose`.

### C2 counting rules (all must hold)

1. `revision` is an ancestor of the measured revision, the committed
   `scripts/check-aria-metadata.mjs` there hashes to `codeSha256`, and the same blob at the
   measured revision also hashes to `codeSha256` (stale receipts fail); `baseline` is an ancestor
   of `revision` and the same path there hashes to `oldCodeSha256`, which differs from
   `codeSha256`.
2. `selfTest` is green: `ARIA_METADATA_SELFTEST verdict=clean cli_cases=N helpers=M` with integer
   `cli_cases`/`helpers` fields (the gate's tally is parsed as shipped, not rewritten), `N >= 6`
   and `N + M >= case lines`; all case lines parse; every case is `PASS` with expected/actual exit and
   finding agreement; at least 2 passing `expected_exit=1` cases name a
   mirror/cleanup/qualification finding; at least 1 passing `expected_exit=2` case names a
   snapshot-tampered finding id; at least 2 fixture digest literals have
   `expected_sha256 == actual_sha256`.
3. `snapshotInputs` is a non-empty path→64-hex map; every named path is committed at the measured
   revision with exactly that digest. Paths may be repository-relative or absolute under the lane
   root; the probe strips the root prefix.
4. `mirrors` contains exactly the nine required differentials listed above. Each `before` is the
   historical checker accepting the false mirror (exit 0, clean verdict,
   structured/token `accepted=true`); each `after` is the new checker refusing it (exit 1,
   `accepted=false`, one non-acceptance finding naming the mirror/cleanup/qualification context —
   an acceptance-summary id may accompany it); `pass === true`.
5. `tamper` binds an authenticated identity: `field` is a concrete path listed in
   `snapshotInputs`, `recordedSha256` equals `snapshotInputs[field]`, and `computedSha256` is a
   different 64-hex digest. The authentic historical checker refuses the SHA mismatch with exit 1
   and a SOURCE finding among its failures (other residual/acceptance ids are allowed) and never
   reports could-not-evaluate or snapshot tampering; the new checker exits 2 with a
   snapshot-tampered finding id, an explicit could-not-evaluate classification (token or JSON
   payload) and no clean verdict; `pass === true`.
6. `positive` accepts the canonical correction: exit 0, `ARIA_METADATA check verdict=clean`,
   structured/token accepted=true, and the sidecar named by `positive.payload.sidecar` (or
   `positive.sidecar`) is the round-14
   `corpus/evidence/round-14/aria-metadata/corrected.json` whose committed bytes hash to
   `sidecar.sha256` and to the digest pinned by the committed round-14 verification receipt.
   `oldPositive`, when present, is validated the same way.
7. `originalsUnchanged` is a non-empty boolean map; the round-14 corrected sidecar and the
   round-13 `aria/receipt.json` + `aria/runtime-pin.json` must be `true`, and each one's committed
   digest is verified through `snapshotInputs`. `pass === true` and `browserExecuted === false`;
   a claimed new browser execution/coverage is an error.

Finding parsing accepts shipped shapes: bare `finding=`, `ARIA_METADATA findings <id>`, JSON
payloads with `finding`/`redFinding`/`findingId`/`findings` (object lists resolved to their single
failed id, otherwise one distinct id). `snapshot_tampered` is recognised as the exact id or inside
a longer shipped id such as `R15-ARIA-SNAPSHOT-TAMPERED-01`.

Output keys: `c2_enforced_contract`, `c2_receipt`, `c2_mirrors` (emitted/differentials/refused),
`c2_snapshot` (exit/finding), `c2_canonical_correction`, `c2_browser_executed`,
`c2_calibration_scalar_delta`, receipt/checker paths.

## Histogram

`source_histogram` counts registry rows and tier (A/B/C/invalid) and status
(queued/mined/rejected/invalid) using the 11-column registry row (tier index 3, status index 7).
`note_map` lists `corpus/knowledge/*.md` notes and any not referenced from `corpus/README.md`.
`commands` carries the census histogram/validate invocations, the note-map diff, and both
`--self-test` commands for L1 to run (the probe does not run them).

## Fail-closed behaviour

| State | Count | Exit |
| --- | --- | --- |
| Receipt absent | 0 + reason | 0 |
| Receipt present, malformed/mismatched | 0 + sorted errors | 1 |
| User/revision input unresolvable | n/a | 2 (`could-not-evaluate`) |

A partial C1 result cannot be quoted as green, and a malformed C1 receipt cannot change the C2
count because no state is shared.

## Commands for L1 (not run by this seat)

```
node .ufo/waves/round-15/measure.mjs HEAD
node .ufo/waves/round-15/measure.mjs HEAD --claim C1
node .ufo/waves/round-15/measure.mjs HEAD --claim C2
node .ufo/waves/round-15/measure.mjs HEAD --histogram
git show HEAD:.ufo/waves/round-15/measure.mjs >/dev/null   # committed-blob sanity
```

Before the two receipts are committed the expected result is `c1_truthful_diagnostics=0`,
`c2_enforced_contract=0`, non-empty `reasons`, and exit 0. A committed receipt that violates any
rule yields the same 0 with named errors and exit 1.

## Coordination retained

- TabiR15: exact C1 and C2 receipt shapes sent, then aligned to the shipped harness
  (`baseline`, `oldPositive`, structured `acceptedCorrection`, boolean `originalsUnchanged`,
  optional `emittedMirrors`, tamper baseline exit 1 → new exit 2).
- TabiR15.CounterDiagnostics: literal key grammar confirmed; the probe binds `expected_reason` +
  `reason`, `applicability`, `marker_applicable`, `marker_outcome`, `no_marker`, `isolation=cli`;
  it requires no token the gate does not emit; `no_marker=1` is treated as applicable-and-absent.
- TabiR15.MetadataEnforce: checker must ship ≥2 mirror refusal cases (exit 1), ≥1 snapshot case
  (exit 2, snapshot-tampered id), and ≥2 digest literals; tamper CLI exits 2 with
  could-not-evaluate.
- TabiR15.TamperPin F7: not inherited. The round-15 probe has no `pinSha256`/playwright code path;
  a missing or non-64-hex round-14 sidecar pin is `historical_pin` error, never skipped.

## Risks and blockers

- **Blocker for 0→1:** neither receipt exists yet (`corpus/evidence/round-15/` is absent). This is
  the expected pre-measurement state; counts stay 0 rather than being inflated.
- C1 depends on the committed USER self-test execution actually carrying the applicability classes
  and the cause-specific reason assertions; TabiR15.CounterDiagnostics confirmed the worktree emits
  them, but only L1's committed run counts.
- C2 depends on MetadataEnforce shipping literal mirror/snapshot cases and on the differential
  harness emitting the exact fields above. If any differ, C2 stays 0 with named errors rather than
  being guessed.
- Round-14 verification pins the corrected sidecar at
  `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`; the round-15 positive arm
  must keep accepting those exact bytes.
- No tools installed or upgraded during this seat (nothing was needed).
