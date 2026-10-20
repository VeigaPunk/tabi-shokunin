# Round 15 w1 — QualityMirror (read-only audit)

Seat: `TabiR15.QualityMirror` (scribe). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scope: mirror completeness and exact reason controls for `scripts/check-aria-metadata.mjs`
(C2) and `scripts/check-user-round-contract.mjs` (C1). Read-only. No gate, selftest, counter,
`--witness`, `--derive`, browser or suite was executed. Predicted fixture outcomes below are
`[INFERENCE]` from code reading, not observed. No tools installed or updated. No source edited.
Only data read: committed JSON parsed with `python3` (reading only).

## Axes (named)

- calibration: sidecar mirror fields must agree with authenticated proofs (C2).
- operability: a negative control must prove its intended refusal cause (C1).
- discernment: could-not-evaluate must not be reported as semantic failure (C2 classification).

## Verdict

1. QUALITY20 and QUALITY21 are already appended in the working tree
   (`corpus/QUALITY.md:65-77`). `git diff --stat -- corpus/QUALITY.md` = 13 insertions,
   0 deletions, so the append-only rule holds (QUALITY.md header line 7).
2. Both criteria are lesson-grounded (`corpus/lessons/round-14-verifier-spotcheck.md`
   routed items 2, 3, 4 at lines 185, 186, 187). They are 0→1 targets, not met by the
   current code. Concrete defects D1–D9 below.
3. Both criteria cite `corpus/lessons/round-15.md#mistakes`. That file does not exist yet
   (`ls corpus/lessons/round-15.md` → absent). L1 must author it in the integration commit
   (QUALITY criteria 10 and 13 apply). Not authored here.
4. Round-14 historical files are immutable. New expectations must live under
   `corpus/evidence/round-15/metadata/` and new USER receipts under round-15 paths.
   `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` and
   `corpus/evidence/round-14/executions/userSelfTest.json` must not be rewritten.

## Source anchors

### C2 — `scripts/check-aria-metadata.mjs`

| Anchor | Observed |
|---|---|
| `:1263-1270` | `buildSidecar` emits `cleanup`: `perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`. |
| `:1271-1280` | Emits `qualification`: `proofCount`, `allProofsComplete`, `allProofsSupportCorrection`, `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`, `everyProofNotListeningAfter`, `qualified`. |
| `:1276` | `everyProofListensBefore: allValuesOk` is the aggregate `allProofsPass`, not a per-proof `listeningBefore` recomputation. |
| `:1207-1214` | Emits `source.spec.sha256` and `source.manifest.sha256` copies. |
| `:853-1109` (`evaluateSidecar`) | Reads `sidecar.node` (`:1010-1034`), `sidecar.provenance` (`:1036-1058`), `sidecar.qualification.{qualified,proofCount,allProofsSupportCorrection,allProofsComplete,everyProofNotListeningAfter}` (`:1061-1075`). **No read** of `sidecar.cleanup.*`, of `qualification.everyProofListensBefore`, `everyProofClosed` or `everyProofRefusedAfterClose`, or of `source.spec`/`source.manifest`. Only `source.producer.sourceSha256` is compared (`:959-961`). |
| `:986` | `corrections[0].value` is optional-if-present (`!== undefined &&`). |
| `:1016-1019` | `node.exactRecordedMatch` optional-if-present. |
| `:1020-1023` | `node.observedMatchesRecorded` optional-if-present. |
| `:1040-1043` | `execution.browserExecuted` and `execution.newBrowserRun` optional-if-present. |
| `:783-788` | Canonical `spec`/`manifest` are checked from disk by `evaluateSourceIdentity`, not from the sidecar's copies. |
| `:283-295` | `proofValueProblems` already defines the independent per-proof predicates: `listeningBefore===true`, `closed===true`, `listeningAfter===false`, `refusedAfterClose===true`, `closeError===null`, `refusalDetail==='ECONNREFUSED'`. Mirror checks should reuse these, not `allProofsPass` alone. |
| `:1117`, `:1135`, `:2244` | Any non-pass finding → exit `1`. No classification of snapshot/input mismatch. |
| `:158-215` (`readEntry`) | Missing, symlink, non-regular, unreadable → `ok:false`. Callers turn these into `fail` findings → exit 1. |
| `:2029-2062` + `:2201-2221` | `--check` with unreadable/missing input → `R14-ARIA-CHECK-INPUT-01`, `return 1` (`:2221`). |
| `:1655-1677` | `runSelfTest` blocked branch (expectations missing/invalid) → `exit: 1`. |
| `:2149-2153`, `:2257-2261` | Only exit-2 producers outside derive: usage (`:2153`) and uncaught fatal (`:2257`, no finding id). |
| `:1325`, `:1407`, `:1443`, `:1460` | Exit 2 only for `--derive` output-path refusals. |
| `SKILL.md:1755` | Registry row declares `0 clean, 1 failed, 2 could-not-evaluate`. Implementation does not emit 2 for any authenticated-input or digest mismatch. |
| `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` | `sidecar-bad-receipt-digest` → exit 1 `R14-ARIA-SIDECAR-BINDING-01`. `malformed-receipt` → exit 1 `R14-ARIA-INPUT-01`. Historical; do not rewrite. |
| `corpus/evidence/round-14/aria-metadata/corrected.json` (committed values) | `cleanup`: `allClosed=true`, `allNotListeningAfter=true`, `allRefusedAfterClose=true`, `derivedListeningAfter=false`, `perWorkerCount=1`, `summaryServerOk=true`. `qualification`: `everyProofClosed=true`, `everyProofListensBefore=true`, `everyProofRefusedAfterClose=true`, `everyProofNotListeningAfter=true`, `proofCount=1`. |

### C1 — `scripts/check-user-round-contract.mjs`

| Anchor | Observed |
|---|---|
| `:391` | `parseScore`: unsupported counting grammar → `score_mismatch`. |
| `:392` | `parseScore`: rev mismatch → `score_mismatch`. |
| `:398` | `runCount`: unsupported grammar → `score_mismatch`. |
| `:408` | `runCount`: git failure / missing revision → `score_mismatch`. |
| `:596-597` | `check()`: before/after count mismatch → `score_mismatch`. |
| `:865-873` | Malicious controls (tee, sh -c, option injection): expect exit 1, `score_mismatch`, `noMarker`. |
| `:883-888` | `count_missing_revision_red`: expects `score_mismatch`. |
| `:889-891` | `count_wrong_after_red`: expects `score_mismatch` for a **supported** grammar with a wrong count. |
| `:988-990` | Matcher: exit code + `output.includes('finding=<X>')` + `!leaked`. No reason token, no detail check; substring match. |
| `:991` | Prints `no_marker=${noMarker ? (leaked?0:1) : 0}`. Non-marker cases print `0`, identical to "marker leaked". Applicability absent. |
| `:832` | `runCountWitness` pass condition: `newArm.finding === 'score_mismatch'`, finding-only. |
| `:1041` | Error print: `finding=<X> detail=<free text>`. Detail is not a stable reason code. |
| `:264`, `:794`, `:798`, `:894` | Usage / witness / cutover exit-2 paths exist here. Production count paths default to exit 1. |
| `corpus/lessons/round-14-verifier-spotcheck.md:187` | Routed item 4 (this defect, named by an outside reviewer). |
| `SKILL.md:1778-1779` | Already points to QUALITY21 and says `marker absence and marker-not-applicable are separate states`. |

## Defects

Severity: H = criterion-level gap; M = precision/ambiguity; L = minor.

- **D1 (H, C2 mirrors unchecked).** Nine emitted `cleanup.*` and `qualification.everyProof*` fields are never read (`:1263-1280` vs `:853-1109`). A single mirror field set to a false value would not fail the gate. Violates QUALITY20 as appended. [INFERENCE: accepted, not executed.]
- **D2 (H, optional-if-present passes deletion).** `:986`, `:1016-1019`, `:1020-1023`, `:1040-1043` skip the check when the key is absent. Deleting `execution.newBrowserRun`, `execution.browserExecuted`, `node.exactRecordedMatch`, `node.observedMatchesRecorded` or `corrections[0].value` passes. QUALITY20 requires validation, not absence-passes. [INFERENCE]
- **D3 (M, sidecar source copies unchecked).** `:1207-1214` emit `source.spec.sha256` and `source.manifest.sha256`; `evaluateSidecar` never compares them (only `producer` at `:959-961`). Canonical files are checked from disk (`:783-788`), but the sidecar's self-description is not. [INFERENCE]
- **D4 (M, `everyProofListensBefore` is aggregate-by-construction).** `:1276` equals `allProofsPass`, which is `:1276`'s own value. It is never per-proof `listeningBefore`. Same-function equality, the exact trap named in `round-14-verifier-spotcheck.md:125`. Independent expectation must be a literal, not `buildSidecar` output.
- **D5 (H, classification: semantic exit 1 for input/digest mismatch).** `:1117`, `:1135`, `readEntry` callers (`:158-215`) → exit 1 for anchor/binding/source/manifest/input problems. `sidecar-bad-receipt-digest` (round-14 expected) pins exit 1. QUALITY20 requires `snapshot_tampered`, exit 2. Cross-ref: TamperWitness / TamperPin / TamperManifest seats own the snapshot finding ID and the classification. This seat only records that QUALITY20's second sentence is unmet.
- **D6 (H, could-not-evaluate reported as exit 1).** `:2221` (`--check` input missing/unreadable), `:1655-1677` (self-test expectations blocked) both exit 1. `:2257` fatal exit 2 has no stable finding ID (not a reason control). Registry `SKILL.md:1755` promises 2 for could-not-evaluate. [observed by reading]
- **D7 (H, C1: four causes share one finding).** `score_mismatch` is emitted for: unsupported grammar (`:391`, `:398`), git failure/missing revision (`:408`), count mismatch (`:596-597`), rev mismatch (`:392`). The malicious controls (`:865-873`) and the wrong-count control (`:889-891`) assert the same string. A control can pass for the wrong reason. QUALITY21 requires that an unrelated `score_mismatch` must not satisfy it. Concrete wrong-cause path: a regression that loosens `countingCommand` and then miscounts would still return `score_mismatch` at `:596-597`, and with no marker, the malicious control would PASS. [INFERENCE: the control would pass; not executed.]
- **D8 (M, applicability absent).** `:991` prints `no_marker=0` for non-marker cases and for "leaked". QUALITY21 requires applicable-and-absent to differ from not-applicable. The exact string `no_marker=0` is the same for both.
- **D9 (M, witness is finding-only).** `:832` checks only `newArm.finding`. A count mismatch that happens to remove the marker satisfies the count-witness. Should check the reason. Also `:988-990` matches by substring `finding=score_mismatch`, which accepts `finding=score_mismatch_*`. (L.)
- **D10 (M, cross-gate policy disagreement, for L1 decision).** USER treats missing revision as an explicit failed count (`:883-888`, `:408`; round-14 addendum "a missing Git revision is an explicit failed count"). ARIA QUALITY20/SKILL:1777 classifies a changed/missing snapshot as could-not-evaluate. These disagree on the same kind of input. L1 must choose and record. This seat does not pick.

## Proposed tests (fixtures; NOT run)

Write as new round-15 expectation files under `corpus/evidence/round-15/metadata/` (ARIA) and a new round-15 USER control list. Each fixture = `sidecar-valid` with exactly one mutation. Predicted current outcome in brackets, from code reading only.

ARIA (C2):

- **T-A1 literal positive.** `corrected.json` as committed → exit 0; assert the literal values listed in the anchor table (not `buildSidecar` output). [INFERENCE: passes now; keep as preservation control.]
- **T-A2 mirror mutation, one case each:** `cleanup.allClosed=false`, `cleanup.allRefusedAfterClose=false`, `cleanup.allNotListeningAfter=false`, `cleanup.derivedListeningAfter=true`, `cleanup.summaryServerOk=false`, `cleanup.perWorkerCount=2`, `qualification.everyProofListensBefore=false`, `qualification.everyProofClosed=false`, `qualification.everyProofRefusedAfterClose=false` → each expects exit 1 with a stable mirror finding ID (name chosen by MetadataEnforce; e.g. `R14-ARIA-SIDECAR-MIRROR-01`). [INFERENCE: all currently accepted, exit 0.]
- **T-A3 required presence.** Delete each of: the nine mirror keys, `execution.newBrowserRun`, `execution.browserExecuted`, `node.exactRecordedMatch`, `node.observedMatchesRecorded`, `corrections[0].value` → each expects exit 1. [INFERENCE: all currently accepted.]
- **T-A4 sidecar source copy.** `source.spec.sha256 = 0…0` and `source.manifest.sha256 = 0…0` → exit 1 (copy must equal ANCHORS). [INFERENCE: currently accepted.]
- **T-A5 classification.** `sidecar-bad-receipt-digest` → exit 2 `snapshot_tampered` (round-15 expectation; round-14 expectation file kept unchanged as historical). `--check` with missing input → exit 2 (not 1). Self-test expectation missing → exit 2. [INFERENCE: currently exit 1.]
- **T-A6 unaffected positives.** `sidecar-valid-accepted` and `sidecar-auto-detect-check-input` keep exit 0 after every change.

USER (C1):

- **T-U1 reason token per refusal.** Add a stable `reason=` token (e.g. `unsupported_counting_grammar`, `counting_command_failed`, `count_mismatch`) to the `fail()` path and to the printed line. Malicious controls (`:865-873`) expect `reason=unsupported_counting_grammar` + exit 1 + marker absent. `count_missing_revision_red` expects `reason=counting_command_failed`. `count_wrong_after_red` expects `reason=count_mismatch`. [INFERENCE: today all three are indistinguishable by finding.]
- **T-U2 wrong-cause meta-control.** Run `count_wrong_after_red` (supported grammar, wrong count) through the malicious-control matcher with `expectedReason=unsupported_counting_grammar`. The harness must report FAIL. This is the falsifiable proof that a same-finding wrong cause cannot pass the control (QUALITY21). [INFERENCE: today the matcher would PASS it.]
- **T-U3 applicability.** Non-marker cases print `no_marker=na`; marker cases print `1` (absent) or `0` (leaked). Expectations carry `applicable` per case. [INFERENCE: today `0` for both non-marker and leaked.]
- **T-U4 option-injection discriminator.** For `count_malicious_option_injection_refused` (`:871-873`), set `after` equal to the value the accepted command would count on the measured revision, so that an accepted parse yields exit 0 (test fails), and a refusal yields the `unsupported_counting_grammar` reason. Confirms refusal, not count coincidence.
- **T-U5 witness reason.** `:832` compares `newArm.reason === 'unsupported_counting_grammar'` instead of finding. Meta-control: a witness whose new arm is a count mismatch must not pass.
- **T-U6 exact-token matcher.** `:989` uses `finding=<X>(\s|$)` regex, not substring. Meta-control: a finding named `score_mismatch_extra` must not satisfy `score_mismatch`.

## Proposed QUALITY edits (for L1; not applied by this seat)

- QUALITY20 (`corpus/QUALITY.md:65-71`) is correct. Add one sentence: "An optional-if-present check is not validation of that key; a field absent from the checked contract is listed as excluded with its reason." Cite D2.
- QUALITY21 (`corpus/QUALITY.md:72-77`) is correct. Add one sentence: "A meta-control shows that the same finding with a different cause fails the control." Cite T-U2.
- Do not renumber or edit existing 1–19. Do not rewrite `round-14` historical artifacts.

## Commands L1 should run after integration (NOT run by this seat)

- `node scripts/check-aria-metadata.mjs --self-test` (expect new round-15 cases; round-14 expectation file unchanged).
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0).
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-13/aria/receipt.json` (expect exit 1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01`, unchanged).
- `node scripts/check-user-round-contract.mjs --self-test` (expect prior 29 fixtures + alias + new T-U controls).
- `node scripts/check-user-round-contract.mjs --count-witness <rev>` per usage at `:264-273`, with `<rev>` chosen by L1.
- `git diff --stat -- corpus/QUALITY.md` (expect 0 deletions) and `git diff --stat -- corpus/evidence/round-14 corpus/lessons` (expect 0 changes to historical files).
- Author `corpus/lessons/round-15.md` (L1 owned) so the QUALITY20/21 pointers resolve.

## Out of scope / not claimed

- No outcome above is observed. Every "current" behavior is from reading `:line` anchors. Re-run only by L1.
- Snapshot ID naming and the full tamper classification belong to the TamperWitness/TamperPin/TamperManifest seats.
- No browser, coverage, scalar, or non-author spot-check claim is made here.
