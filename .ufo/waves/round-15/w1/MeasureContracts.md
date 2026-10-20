# MeasureContracts — round-15 C1/C2 counting probe

Owned deliverable: `.ufo/waves/round-15/measure.mjs` (1283 lines, new file). No other file modified.
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

`revision` must be an ancestor of the measured revision and the committed
`scripts/check-user-round-contract.mjs` at that revision must hash to `codeSha256`.

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
   `expected_exit == actual_exit`, and `expected_finding` is stated (and equals a shipped
   `finding=` token when one is present).
4. At least 3 passing cases assert a diagnostic reason: `expected_reason=<id>` and
   `reason=<id>`/`actual_reason=<id>` equal, with the reason not `clean`/`could_not_evaluate`;
   at least 2 distinct reason ids.
5. The case set covers both `applicability=applicable` and `applicability=not_applicable`; any
   shipped applicability value must be one of those two.
6. At least 2 reason-asserting cases are isolated CLI controls: `isolation=cli` when shipped,
   otherwise fixture provenance (only `count_committed_*`, `count_witness*`, `production_*` are
   non-fixture executions). At least 1 isolated refusal (`expected_exit != 0`) asserts a
   cause-specific `expected_reason` other than `score_mismatch`/`round_count`, so a wrong generic
   cause cannot pass the same control.
7. Marker applicability uses the shipped semantics, never the inverted reading:
   `no_marker=1` = applicable and absent, `no_marker=0` = applicable and leaked,
   `no_marker=na`/`marker_outcome=not-applicable`/`marker_applicable=0` = not applicable.
   An `applicability=not_applicable` case must not report `no_marker=1/0` or
   `marker_applicable=1`; an `applicability=applicable` case must not report `no_marker=na` or
   `marker_outcome=not-applicable`. At least one marker-applicable observation is required.
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
    { "case": "<cleanup/qualification field path>",
      "before": { "exit": 0, "stdout": "<historical checker>", "stderr": "" },
      "after":  { "exit": 1, "stdout": "<new checker>", "stderr": "" },
      "pass": true }
  ],
  "positive": { "exit": 0, "stdout": "...", "stderr": "",
                "sidecar": { "path": "corpus/evidence/round-14/aria-metadata/corrected.json",
                             "sha256": "<64-hex>" } },
  "oldPositive": { "exit": 0, "stdout": "..." },
  "tamper": { "case": "spec-snapshot-digest",
              "field": "<authenticated identity field>",
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

`emittedMirrors` is optional; when present it names only the newly enforced mirror fields and the
probe requires one differential per name. When absent, the nine `mirrors` cases define scope and
the probe does not demand a differential for a field the historical checker already enforced.

### C2 counting rules (all must hold)

1. `revision` is an ancestor of the measured revision and the committed
   `scripts/check-aria-metadata.mjs` there hashes to `codeSha256`; `baseline` is an ancestor of
   `revision` and the same path there hashes to `oldCodeSha256`, which differs from `codeSha256`.
2. `selfTest` is green: `ARIA_METADATA_SELFTEST verdict=clean cases=N`, `N >= 6` and `N >= case
   lines`; all case lines parse; every case is `PASS` with expected/actual exit and finding
   agreement; at least 2 passing `expected_exit=1` cases name a mirror/cleanup/qualification
   finding; at least 1 passing `expected_exit=2` case names a snapshot-tampered finding id; at
   least 2 fixture digest literals have `expected_sha256 == actual_sha256`.
3. `snapshotInputs` is a non-empty path→64-hex map; every named path is committed at the measured
   revision with exactly that digest. Paths may be repository-relative or absolute under the lane
   root; the probe strips the root prefix.
4. `mirrors` is non-empty; each differential names a cleanup/qualification field; the historical
   checker accepts the false mirror (`before`: exit 0, clean verdict, structured/token
   `accepted=true`), the new checker refuses it (`after`: exit 1, `accepted=false`, exactly one
   named finding that is neither could-not-evaluate nor snapshot-tampered), and `pass === true`.
5. `tamper` binds an authenticated identity: `field` names sha256/digest/hash/bytes/revision/pin;
   `recordedSha256` and `computedSha256` are different 64-hex digests; the authentic historical
   checker refuses the SHA mismatch with exit 1 and no clean verdict; the new checker exits 2 with
   a snapshot-tampered finding id, an explicit could-not-evaluate classification (token or JSON
   payload) and no clean verdict; `pass === true`.
6. `positive` accepts the canonical correction: exit 0, `ARIA_METADATA check verdict=clean`,
   structured/token accepted=true, and `sidecar.path` is the round-14
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
