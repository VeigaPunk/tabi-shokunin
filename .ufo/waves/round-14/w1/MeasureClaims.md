# MeasureClaims — round-14 C1/C2 revision counting probe

Owner: `TabiR14.MeasureClaims` (leaf). Baseline: `bebe2efc4565bb068efd905e9ef78011bb6b4efd`.
Implementation file: `.ufo/waves/round-14/measure.mjs` (new, executable), frozen at sha256
`22b6f5e5fa585555923971a0f56c640a2d38ae2d797aa84e4f9cae288cf7cab1` (57183 bytes). Deltas since
`ed69b15` / committed blob `487f61275b3428946dcce755457e1ffb2ecc9988dc3facc8cf8a55b1ac3021c9`
are C2-only: shipped-marker alignment, then the targeted repair after the initial failed probe at
`4a300f6` (key=value ARIA case parsing including `name`/`actual_exit`/`expected_finding`/`finding`
with expected/actual consistency, and structured-or-unique finding resolution for the witness).
C1 functions (`countC1`, `analyzeRunCount`, `countWitnessEvidence`, controls) are byte-identical to
the committed blob, so C1 before/after results are unaffected; C2 requires the frozen worktree
bytes. The initial failed C2 output at `corpus/evidence/round-14/measure-c2-initial.json` is
retained unchanged as evidence of the pre-repair probe. No other
tracked file was edited by this seat. No commit, no build, no test, no lint, no formatter, no
gate, no census and no probe execution was performed while authoring; the commands below are for
L1 after all seats land.

## Axes

1. Exactness of the measured claim (committed-blob binding, not a fresh run).
2. Causal separation (C1 and C2 read disjoint evidence; one malformed claim cannot suppress the
   other).
3. Fail-closed honesty (missing evidence = 0 with reasons; malformed/mismatched evidence = exit 1).
4. No execution: the probe only reads git objects through argv and never starts a shell, gate,
   checker, browser or test.

## What the probe does

`node .ufo/waves/round-14/measure.mjs REV [--claim C1|C2 | --histogram]`

- `--claim C1` reads only `corpus/evidence/round-14/gates.json` and the two gate blobs at its
  `codeRevision`.
- `--claim C2` reads only `corpus/evidence/round-14/aria-metadata/verification.json`, its
  `corrected.json` sidecar, the committed round-13 ARIA originals, the `S029` registry row and
  `corpus/lessons/round-14.md`.
- `--histogram` reads only `corpus/SOURCES.md` and `corpus/README.md` (source rows/tiers/status and
  the knowledge note map). It does not need round-14 evidence.
- Full mode reports both claims plus the histogram; it exits 1 if either claim has a malformed
  receipt/digest, but still reports the other claim's independently valid count.

### C1 (`countC1`, counted in `c1_non_shell_counters`)

A gate counts (0, 1 or 2 total) only when all of the following are committed evidence:

1. `path` is exactly `scripts/check-round-contract.mjs` or
   `scripts/check-user-round-contract.mjs`, appears once, and `sha256` is the committed blob
   digest at `codeRevision` (and at `entry.measuredRevision` / `production.measuredRevision` when
   given). `codeRevision` must be a resolvable 40-hex commit that is an ancestor of `REV`.
2. The committed gate source contains no shell binary invocation, no `shell: true` and no `-c`
   flag; its `runCount` implementation has no shell path. Delegating git reads to shared
   `git`/`treeLineCount`/`grepLineCount` helpers is accepted (whole-file scan covers helpers).
3. `selfTest` exits 0 and prints `<PREFIX>_SELFTEST verdict=clean cases=N` (N >= 4; the round-14
   tally is explicitly not frozen to the old ROUND 26 / USER 20 counts). Every `SELFTEST` line is
   `result=PASS`, and at least:
   - one passing malicious no-marker control: name matches
     `malicious|refus|inject|unsupported|traversal|forbid|unrecognized`, `expected_exit != 0`,
     named non-clean finding, trailing `no_marker=1`;
   - two passing fail-closed `count_*` controls with `expected_exit != 0` (missing revision,
     no-match, malformed/unsupported grammar);
   - one passing supported `count_*` control with `expected_exit = 0`, `expected_finding = clean`;
   - `countWitness` evidence: top-level exit 0 clean (`countWitness` line with
     `verdict=clean`/`result=PASS` or `top_exit=0`), child `old_exit=0 old_finding=clean`
     `marker=true|1`, then `new_exit=1 new_finding=score_mismatch` `marker=false|0`
     (`old_marker=`/`new_marker=` forms accepted).
4. `production` preserves the historical expected result exactly:
   - `scripts/check-round-contract.mjs`: exit 0, `ROUND_CONTRACT verdict=clean ... rounds=10`;
   - `scripts/check-user-round-contract.mjs`: exit 1, `finding=round_count`,
     `Found 6 user rounds, expected 10`, and no false clean verdict.
   The USER production exits on `round_count` **before** `runCount`, so it is preserved regression
   evidence, not parser coverage. The probe labels that gate
   `parserCoverage: isolated_controls_only`; it makes no production-exercised USER parser claim.
   The ROUND gate is labelled `production_and_controls`.
5. A gate entry that is absent from the receipt is reported as a reason (`count` can be 1); it is
   not treated as malformed. A present-but-invalid entry makes the whole C1 count 0 and exits 1.

`witness` is optional in the receipt and, when present, is validated (red named finding, not
`could_not_evaluate`, green after arm). The existing history `--witness` remains separately
retained by the gates; the probe does not replace it.

### C2 (`countC2`, counted in `c2_metadata_correction`)

Counts 1 only when every committed check passes:

1. `verification.json` has a resolvable ancestor `codeRevision`; `scripts/check-aria-metadata.mjs`
   exists at that revision (and matches `checkerSha256` when supplied).
2. Checker `selfTest` exits 0, prints `ARIA_METADATA_SELFTEST verdict=clean cases=N` (N >= 4,
   and >= the emitted case lines), has no `result=FAIL`, and at least two passing fail-closed
   controls named `malformed|missing|nonboolean|invalid|refus|type` with `expected_exit != 0`.
   Case lines are parsed as key=value tokens in any order:
   `ARIA_METADATA_SELFTEST result=PASS case=<id> [name=<id>] expected_exit=<n> actual_exit=<n>
   expected_finding=<id> finding=<id> exit=<n>`; `expected_exit` must equal `actual_exit` and
   `expected_finding` must equal `finding` when both are present. Legacy `SELFTEST name=…` lines
   are also accepted.
3. `witness` is the shipped red→clean transition
   (`transition=red->clean`, `red_exit=1`, `green_exit=0`, `accepted=true`, `verdict=clean`),
   with the red finding named by a structured `finding`/`redFinding`/`findings` field or by a
   shipped `ARIA_METADATA findings <id>` line that names exactly one distinct id. A
   `{before,after}` red→clean pair or a single `{exit != 0, finding=…}` observation are also
   accepted. A red finding of `could_not_evaluate` or an ambiguous multi-finding list is rejected.
4. `check` exits 0 and prints `ARIA_METADATA check verdict=clean` (shipped form;
   `ARIA_METADATA_CHECK verdict=clean` also accepted), with no `accepted=false`.
5. `sidecar.path` resolves to `corpus/evidence/round-14/aria-metadata/corrected.json` (or
   `corrected.json`) and `sidecar.sha256` equals the committed blob.
6. The sidecar is a qualified metadata correction, not new runtime/coverage:
   - schema/kind text names a metadata correction, and `qualified: true` (or
     `qualification: true` / `status: "qualified"`);
   - `browserExecuted: false` (or `execution.browser: false`), with no positive browser/newCoverage
     claim;
   - it pins `corpus/evidence/round-13/aria/receipt.json` and
     `corpus/evidence/round-13/aria/runtime-pin.json` by path+sha256; both digests must equal the
     committed bytes, and the original receipt must be byte-identical at the commit cited by
     `S029` (`837b33a3988ebeea7f6b4ef5c04698da88909a73`, digest
     `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`);
   - `node.observed` equals the retained receipt's `runtime.node` (`26.12.0`), `node.recorded`
     equals the retained pin's `node.recorded` (`24.21.0`), they differ, `exactMatch: false`, and
     the observed major is at least the pin minimum (`20`);
   - a correction targets `cleanup.server.listeningAfter` with `to: false` (and `from`/`before`,
     when present, must be `true`). The probe then independently verifies the retained receipt:
     aggregate `cleanup.server.listeningAfter === true`, while every non-empty `perWorker` proof
     records `closed: true`, `listeningAfter: false`, `refusedAfterClose: true` and a loopback
     origin. The correction is therefore supported by the committed worker proofs, not asserted.
7. `S029` exists with 11 cells, is `own-work`, names the original receipt, is `mined`, lists
   `corpus/lessons/round-14.md` in used-by, and cites a resolvable 40-hex commit whose copy of the
   original receipt hashes to the pinned digest.
8. `corpus/lessons/round-14.md` exists, has an `- admitted:` line that names `corrected.json`
   (or the `aria-metadata` correction), and cites `S029`.

Missing C2 receipt/sidecar/lesson yields 0 with reasons (exit 0). A present receipt with a
malformed shape, unresolvable revision, digest mismatch or unsupported proof yields 0 and exit 1.

## Receipts contract for L1 / authors

### `corpus/evidence/round-14/gates.json`

```json
{
  "codeRevision": "<40-hex commit the gate bytes were frozen at>",
  "gates": [
    {
      "path": "scripts/check-round-contract.mjs",
      "sha256": "<git blob digest at codeRevision>",
      "selfTest": { "exit": 0, "stdout": "<literal self-test output>" },
      "witness": { "before": { "exit": 1, "stdout": "..." },
                   "after":  { "exit": 0, "stdout": "..." } },
      "production": { "exit": 0, "stdout": "...ROUND_CONTRACT verdict=clean ... rounds=10..." },
      "measuredRevision": "<optional 40-hex; blob must match sha256>"
    },
    {
      "path": "scripts/check-user-round-contract.mjs",
      "sha256": "<git blob digest at codeRevision>",
      "selfTest": { "exit": 0, "stdout": "<literal self-test output>" },
      "production": { "exit": 1,
                      "stdout": "",
                      "stderr": "USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10",
                      "measuredRevision": "<40-hex>" }
    }
  ]
}
```

`witness` may be the round-13 before/after pair or a single `{exit,stdout}` red observation; it is
optional. The ROUND literal controls observed from `RoundCounter` (retained as advisory input; the
probe reads the receipt, not this report):

```
SELFTEST name=count_malicious_extra_stage expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_unsupported_grep_option expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_traversal_grep_path expected_exit=1 actual_exit=1 expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_supported_tree_lines expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_supported_two_filters expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_supported_git_grep expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_witness_comparison countWitness=1 top_exit=0 exit=0 verdict=clean old_exit=0 old_finding=clean old_marker=1 new_exit=1 new_finding=score_mismatch new_marker=0 result=PASS
ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1
```

`RoundCounter` reported final ROUND digest
`8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` and that UserCounter pins the
same value. The probe does not hardcode it: the receipt's `sha256` is checked against the blob at
`codeRevision`. `UserCounter` supplied the corresponding USER literals (advisory; not executed):

```
SELFTEST name=count_malicious_tee_refused ... expected_exit=1 ... expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_malicious_shell_refused ... expected_exit=1 ... expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_malicious_option_injection_refused ... expected_exit=1 ... expected_finding=score_mismatch result=PASS no_marker=1
SELFTEST name=count_missing_revision_red ... expected_exit=1 ... expected_finding=score_mismatch result=PASS
SELFTEST name=count_wrong_after_red ... expected_exit=1 ... expected_finding=score_mismatch result=PASS
SELFTEST name=count_historical_supported expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_quoted_supported expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_two_stage_supported expected_exit=0 actual_exit=0 expected_finding=clean result=PASS
SELFTEST name=count_witness_comparison countWitness=1 expected_exit=0 actual_exit=0 expected_finding=clean no_marker=0 top_exit=0 exit=0 verdict=clean old_exit=0 old_verdict=clean old_finding=clean old_marker=1 new_exit=1 new_verdict=failed new_finding=score_mismatch new_marker=0 result=PASS
USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=30 fixtures=29 alias=1 committedCounts=6 countWitness=1
```

The USER gate also includes `count_committed_user-20261015-r01..r06` supported controls; these are
the isolated CLI counts of the six committed USER rows. Production still aborts at `round_count`
before `runCount`, so those six row values are evidenced by these controls, not by production.

### `corpus/evidence/round-14/aria-metadata/verification.json`

```json
{
  "codeRevision": "<40-hex commit of scripts/check-aria-metadata.mjs>",
  "checkerSha256": "<optional 64-hex>",
  "selfTest": { "exit": 0, "stdout": "ARIA_METADATA_SELFTEST verdict=clean cases=16\nARIA_METADATA_SELFTEST result=PASS case=<id> expected_exit=<n> exit=<n> finding=<id>\n..." },
  "witness":  { "exit": 0, "stdout": "ARIA_METADATA witness verdict=clean transition=red->clean red_exit=1 red_finding=<id> green_exit=0 accepted=true original_unchanged=true" },
  "check":    { "exit": 0, "stdout": "ARIA_METADATA check verdict=clean findings=0 failed=0 accepted=true sidecar=corpus/evidence/round-14/aria-metadata/corrected.json" },
  "sidecar":  { "path": "corrected.json", "sha256": "<git blob digest>" }
}
```

### `corpus/evidence/round-14/aria-metadata/corrected.json`

Shipped sidecar digest (advisory; the probe binds the receipt's `sidecar.sha256` to the commit):
`e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`, 4308 bytes. The final
sidecar has no nested `cleanup.server` key; the correction is `corrections[0]`.

```json
{
  "schema": "tabi-aria-metadata-correction-v1",
  "qualified": true,
  "status": "qualified",
  "browserExecuted": false,
  "execution": { "browser": false, "browserExecuted": false, "newBrowserRun": false },
  "original": {
    "receipt": { "path": "corpus/evidence/round-13/aria/receipt.json", "sha256": "b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7", "bytes": 97073 },
    "pin":     { "path": "corpus/evidence/round-13/aria/runtime-pin.json", "sha256": "4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2", "bytes": 1154 }
  },
  "node": { "observed": "26.12.0", "recorded": "24.21.0", "exactMatch": false, "exactRecordedMatch": false, "minimumMajor": 20, "minimumMajorSatisfied": true, "descriptiveOnly": true, "recordedRole": "descriptive" },
  "corrections": [
    { "path": "cleanup.server.listeningAfter", "from": true, "to": false, "value": false, "derived": false, "supportingProofs": 1 }
  ]
}
```

The sidecar may also carry `kind`, `correction` mirror fields and `binding` digests; they are not
required by the probe. The pinned `bytes` values, when present, are checked against the committed
byte lengths (97073 / 1154).

Accepted aliases: `corrections`/`correctedFields`/`fixes`/`correctionsApplied`; a `corrected`
object keyed by field path; nested `corrected.cleanup.server.listeningAfter`; `qualified`/
`qualification`/`status: "qualified"`; `executed: false` or `execution.browser: false`;
`runtimeNode` for `node`; `observedVersion`/`recordedVersion`. All other key names above are strict.

## Commands for L1 (not executed here)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin

# Pre-measurement baseline: both claims absent, exit 0, counts 0.
node .ufo/waves/round-14/measure.mjs bebe2efc4565bb068efd905e9ef78011bb6b4efd
node .ufo/waves/round-14/measure.mjs bebe2efc4565bb068efd905e9ef78011bb6b4efd --claim C1
node .ufo/waves/round-14/measure.mjs bebe2efc4565bb068efd905e9ef78011bb6b4efd --claim C2
node .ufo/waves/round-14/measure.mjs bebe2efc4565bb068efd905e9ef78011bb6b4efd --histogram

# Final integrated revision: expect exit 0, errors [], and
#   c1_non_shell_counters = 2 (both gates, ROUND parserCoverage production_and_controls,
#                              USER parserCoverage isolated_controls_only)
#   c2_metadata_correction = 1, c2_original_pinned = 1, c2_lesson_admitted = 1,
#   c2_browser_executed = 0, c2_qualified = true,
#   c2_node = {observed:"26.12.0", recorded:"24.21.0", exactMatch:false}
node .ufo/waves/round-14/measure.mjs <FINAL_REV>
node .ufo/waves/round-14/measure.mjs <FINAL_REV> --claim C1
node .ufo/waves/round-14/measure.mjs <FINAL_REV> --claim C2
# After committing the frozen probe bytes, rerun only the C2 claim against the final evidence
# revision; keep corpus/evidence/round-14/measure-c2-initial.json (evidence commit 4a300f6)
# untouched as the initial failed-probe record.
node .ufo/waves/round-14/measure.mjs <FINAL_REV> --claim C2

# Histogram at the final evidence commit: S029 present/mined at own-work, 29 registry rows,
# note_map.knowledge_notes = 32, mapped = 32, missing = [].
node .ufo/waves/round-14/measure.mjs <FINAL_REV> --histogram
```

C2 evidence-generation commands reported by ReceiptRepair (for L1/evidence commit; this seat did
not run them):

```sh
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --witness
node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json
node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json
node scripts/check-aria-metadata.mjs          # red control (uncorrected)
node scripts/check-aria-metadata.mjs --derive \
  corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/runtime-pin.json \
  --out corpus/evidence/round-14/aria-metadata/corrected.json
```

Optional fail-closed rechecks, in a scratch clone (not the lane worktree), so the probe sees a
committed malformed revision:

```sh
TMP=$(mktemp -d)
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$TMP/repo"
cd "$TMP/repo"
# mutate gates.json sha256 or codeRevision, commit, then:
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs \
  "$(git rev-parse HEAD)" --claim C1        # expect exit 1, finding gate_digest_mismatch/malformed_receipt
# mutate corrected.json bytes or sidecar.sha256, commit, then --claim C2
# expect exit 1, finding sidecar_digest
```

## Retained evidence (advisory, as read)

- Baseline `bebe2efc4565bb068efd905e9ef78011bb6b4efd`.
- Legacy `runCount` at baseline: `scripts/check-round-contract.mjs:292-296` and
  `scripts/check-user-round-contract.mjs:310-314` executed
  `spawnSync('bash', ['-c', command])`. Historical SCORECARD commands are
  `git ls-tree -r --name-only REV | grep PATTERN | wc -l`; the before arm is
  `score.command.replaceAll(score.measured, options.baseline)`.
- Round-13 ARIA originals, byte-identical at `837b33a` and `bebe2ef`:
  `corpus/evidence/round-13/aria/receipt.json` sha256
  `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`;
  `corpus/evidence/round-13/aria/runtime-pin.json` sha256
  `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`.
- Original contradiction: `cleanup.server.listeningAfter = true`, `cleanup.server.perWorker` has
  one proof with `closed: true`, `listeningAfter: false`, `refusedAfterClose: true`,
  `refusalDetail: "ECONNREFUSED"`, origin loopback. `runtime.node = "26.12.0"`;
  pin `node.recorded = "24.21.0"`, `node.minimumMajor = 20`.
- `S029` worktree row (uncommitted when read): `own-work`, tier `A`, cites
  `committed at 837b33a3988ebeea7f6b4ef5c04698da88909a73`, status `mined`, used-by
  `corpus/lessons/round-14.md`.
- Initial C2 probe at evidence commit `4a300f6` exited 1 and is retained unchanged at
  `corpus/evidence/round-14/measure-c2-initial.json`; its errors were
  `checker_selftest_no_cases`/`checker_selftest_no_refusal` and `witness.before` had no named
  finding. This is preserved as the pre-repair failure evidence; it is not overwritten by the
  corrected rerun. The producer's corrected case line is key=value ordered loosely, e.g.
  `ARIA_METADATA_SELFTEST result=PASS case=nonboolean-listening-after
  name=nonboolean-listening-after expected_exit=1 actual_exit=1
  expected_finding=R14-ARIA-CLEANUP-PERWORKER-01 finding=R14-ARIA-CLEANUP-PERWORKER-01 exit=1`.
  The before receipt names `R14-ARIA-CLEANUP-LISTENING-AFTER-01` in a structured finding field
  and in an `ARIA_METADATA findings …` line, not in `finding=` stdout.
- `ReceiptRepair` shipped sidecar (advisory): `corrected.json` sha256
  `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745` (4308 bytes), pinned originals with
  bytes 97073 / 1154 (both match the committed lengths), checker self-test `cases=16`, refusal
  controls `malformed-receipt`, `missing-server-summary`, `nonboolean-listening-after`,
  `invalid-node-minimum`, clean controls `clean-perworker-listening`, `sidecar-valid-accepted`,
  witness `red->clean` whose red arm names `R14-ARIA-CLEANUP-LISTENING-AFTER-01` via a structured
  finding field and an `ARIA_METADATA findings` line.
- `UserCounter` shipped controls (advisory): `count_malicious_{tee,shell,option-injection}_refused`
  with `no_marker=1`, `count_missing_revision_red`, `count_wrong_after_red`,
  `count_{historical,quoted,two_stage}_supported`, six `count_committed_user-20261015-r01..r06`
  supported controls, and a `count_witness_comparison` line with `old_verdict=clean`,
  `new_verdict=failed`, `new_finding=score_mismatch`, `marker=1/0`; tally
  `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=30 fixtures=29 alias=1 committedCounts=6
  countWitness=1`.
- `UserCounter` final gate bytes (advisory): `scripts/check-user-round-contract.mjs` sha256
  `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3`, report
  `.ufo/waves/round-14/w1/UserCounter.md`; tally `cases=30 fixtures=29 alias=1 committedCounts=6
  countWitness=1`, production remains a real 6/10 `round_count` red, parser coverage is
  `isolated_controls_only`.
- Knowledge notes: 32 files; no new note is introduced; `note_map` is expected 32/32. Registry
  rows: 29 with S029 (28 at baseline).

## Risks and limits

1. **USER production is not parser coverage.** `check-user-round-contract.mjs` fails on
   `round_count` before `runCount`, so the six historical user rows are never evaluated by
   production. The probe therefore counts USER only from isolated CLI controls + `countWitness` +
   the code digest, and reports `parserCoverage: isolated_controls_only`. It does not claim a
   production-exercised USER parser. The six historical USER before/after values are not
   re-measured by this probe.
2. **Literal selftest grammar.** C1 accepts the exact `SELFTEST name=… expected_exit=…
   actual_exit=… expected_finding=… result=…` order. C2 parses ARIA case lines as unordered
   key=value tokens (`case`/`name`, `expected_exit`/`actual_exit`/`exit`,
   `expected_finding`/`finding`, `result`) and asserts expected/actual consistency; legacy
   `SELFTEST name=` lines are accepted. Marker literals accept `true/false` and `1/0`. A changed
   field name or inconsistent expected/actual value fails closed.
3. **Static shell scan** rejects any shell call, `shell: true` or `-c` in code, including an
   inline comment after code that contains the call syntax. Line-leading comment lines are
   filtered; intentional fail-closed behavior, not a generic JS parser.
4. **C1 partial receipt.** A missing gate entry yields a reason and a count of 1; it is not a
   malformed receipt. Both entries are required for the 0→2 claim.
5. **C2 key names.** The shipped `corrected.json` keys described above match the probe; only
   the listed aliases are additionally accepted. A renamed key/marker fails closed and must be
   aligned before L1 quotes 1.
6. **C2 witness shape.** The shipped `red->clean` transition is accepted. The red finding must be
   a structured field or a unique shipped `ARIA_METADATA findings` entry, and must not be
   `could_not_evaluate`; a green-only witness or an ambiguous multi-finding list does not count.
7. **Lesson timing.** `corpus/lessons/round-14.md` is a final evidence-commit artifact; C2 is
   expected 0 with a lesson reason at intermediate revisions and 1 only once admission lands.
8. **Revision ancestry.** `codeRevision` must be a resolvable 40-hex commit ancestor of `REV`;
   this prevents a receipt from pointing at unrelated/future bytes.
9. **Historical immutability** is enforced only by digest/byte comparison at the S029 cited
   commit and the retained originals; the probe does not rewrite or append historical evidence.
10. Tooling: no package was installed or upgraded; no channel was used.

## Verification status

No execution occurred. `measure.mjs` was written and reviewed statically only. L1 owns running the
baseline/final commands and the malformed-fixture rechecks above after all seats land.
