# AttackClaimsSeparable — round-15 C1 vs C2 (author-side falsification, source reading only)

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Role: connector (leaf). Read-only except this report. No gate, self-test, witness, browser, `metadata-witness.py`, `measure.mjs`, or build execution was run. No tools were installed or updated (pacman paused per host ruling; none needed).

## 1. Revision and bytes attacked

- Delivered script revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (`git rev-parse HEAD`; subject "round-15: enforce historical metadata contracts and retain build wave"). Prior commit `c138bea` ("precise USER refusal diagnostics") carries the C1 bytes; `7054a5e` is the baseline.
- `git status` shows no modification to the two gate scripts, so worktree bytes equal HEAD bytes for them.
- Digests re-read with `sha256sum` (matches `.ufo/waves/round-15/build-snapshot.json`):
  - `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs` = `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (C1)
  - `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs` = `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (C2)
  - `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/measure.mjs` = `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` (not attacked)
  - `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py` = `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` (read, not executed)
- Not digest-pinned and uncommitted (worktree only): `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md` (M), `corpus/lessons/round-15.md` and `corpus/evidence/round-15/{source-index,misroot-recovery}.json` (untracked). Doc claims below are about these worktree bytes.

## 2. Temporal limits (reported, not filled)

- `corpus/lessons/round-15.md` section "Execution evidence" is an empty placeholder: "Actual command receipts ... are added here before this lesson's first commit". No C1 or C2 run receipt exists in the tree. Any "passes", "exit N" or "verified" statement in the lesson is therefore a predicted contract, not an observation.
- `LOG.md` round-15 entry ends before outcomes; `SCORECARD.md` has no round-15 row and is unmodified. The 0→1 contract counts are declared, not recorded anywhere yet. L1 integration is pending.
- Build snapshot `verification` field: "not yet exercised". Consistent with the above.

## 3. Disjointness of C1 and C2 receipt dependencies (verified by source reading)

- No shared script or evidence path. `check-user-round-contract.mjs` contains no reference to aria/metadata/round-13/round-14 evidence; `check-aria-metadata.mjs` contains no reference to `user-2026…`, `SCORECARD`, `LOG`, or USER spec files.
- C1 reads committed user-round lessons, SCORECARD/LOG, `spec.json`, `reports/`, and the pstack/SHONEN paths. C2 reads `corpus/evidence/round-13/aria/*`, `corpus/evidence/round-14/aria-metadata/corrected.json`, and `corpus/evidence/round-15/metadata/*`.
- Shared surface is documentation only. The USER gate's `APPEND_ONLY` list (`check-user-round-contract.mjs` ~line 72) includes `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`. The round-15 edits are appends after the original bytes (SKILL's last no-newline line gains a trailing newline and then appends), so the prefix check at ~line 321 is preserved by reading. [INFERENCE from source; not executed.]
- `corpus/SOURCES.md` S029 row is edited in place (used-by, byte length 381→409). It is not in `APPEND_ONLY`. Row count remains 29 (`grep -c "^| S0"` = 29 in both HEAD and worktree). No C1 gate depends on it.
- Conclusion: the two claims' receipts are disjoint at gate level. The only coupling is through shared doc prose (QUALITY 20 for C2, QUALITY 21 for C1), which is numbered consistently.

## 4. Scalars and expansion

- LOG round-15 entry states "all six scalar scores stay fixed" and "Counts are not expertise points". SKILL/README/lesson say no scalar increase and no new browser execution. Checked by reading; no contrary claim found in the worktree docs I read.
- The "0→1" items are contract counts recorded as declared, not measured. Nothing in the tree currently inflates an axis score. Residual wording risk: lesson line "C2 … classification contract 0→1" is a count, and L1 must not transcribe it into an axis movement.

## 5. Defects (evidence-backed, source reading only)

### C2-1 — Authenticated-snapshot check does not cover overridden inputs (medium-high)

Claim under attack: "changed authenticated snapshot bytes yield `snapshot_tampered`/exit 2 rather than a semantic verdict" (lesson gate; QUALITY 20; SKILL round-15 table; check header lines 22–27).

Source path:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs` `verifySnapshot()` lines 871–886 hashes only the **default** paths (`DEFAULT_RECEIPT`, `DEFAULT_PIN`, manifest, spec, config, producer, one worker).
- `runCheck()` lines 1385–1397 calls `verifySnapshot()` with no arguments, then `prepareContext(receiptPathText, pinPathText)` at line 1397 evaluates **whatever** `--receipt`/`--pin` (or sidecar-named paths) resolve to. `runWitnessMirrors` (~1915–1925) has the same shape.
- `evaluateAnchors()` lines 826–840 only compares digests when the path is canonical or when the bytes equal an anchor. For a non-canonical path whose bytes differ from the anchor, it raises **no** finding.
- `parseArguments()` lines 3078–3143 accepts arbitrary `--receipt`, `--pin`, `--sidecar`; `resolveCheckInput()` lines 3033–3064 accepts any receipt file for `--check`, and takes receipt/pin paths from the sidecar's own `original.receipt.path`/`original.pin.path`.
- The shipped fixture set confirms the production path returns clean on non-authenticated bytes by design: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/metadata/expected-fixtures.json`, case `clean-perworker-listening`, args `["--receipt","@receipt-green"]`, `expectedExit: 0`, `expectedClassification: {evaluated, clean}`.

Consequence (source-derived, not executed): `node scripts/check-aria-metadata.mjs --check <altered-receipt.json>` (or `--receipt <altered>`) can return `verdict=clean`, exit 0, with no `snapshot_tampered`, because the anchored canonical files are intact. The historical contradiction can be cleared by evaluating a different receipt. This is "evaluated against unauthenticated bytes reported as clean", which the lesson's authentication language does not disclose.

Bounded correction (L1 decision, do not implement here):
1. In `runCheck` and `runWitnessMirrors`, before `prepareContext`, require the evaluated receipt and pin to be canonical paths **and** digest-equal to `ANCHORS`. Otherwise return could-not-evaluate with a new reason such as `input_not_authenticated` (exit 2), or at minimum `ok=false` with a non-clean classification.
2. Keep unauthenticated fixture evaluation only inside the isolated self-test tree, where the canonical path resolves to the temp `ROOT` (the code already supports that). Re-classify `clean-perworker-listening` and the other `@receipt-*` / `@pin` cases accordingly, or mark them as fixture-only.
3. Apply the same rule to `resolveCheckInput` for sidecar-named paths.

### C2-2 — Verify-then-read gap (TOCTOU), low-medium

- `verifySnapshot()` (lines 871–925) reads each file and keeps only `sha256` in `entries`.
- `prepareContext()` (lines 1020–1068) and `readJson` / `readEntry` then re-read receipt, pin, manifest and worker bytes from disk.
- The bytes that were digest-checked are not the bytes evaluated. A swap between the two reads evades the tamper classification.

Correction: have `verifySnapshot` retain the `bytes` returned by `readEntry` (already present at line 281–286) and have `prepareContext` consume those bytes instead of re-reading.

### C2-3 — Round-15 contract assets are not snapshot-authenticated, though their text says they are (medium)

- `mirror-contract.json` description (`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/metadata/mirror-contract.json`): "Snapshot digest mismatches are could-not-evaluate, not semantic failures."
- But `ANCHORS` (lines 147–158) and `verifySnapshot` checks (lines 874–886) do not include `expected-fixtures.json`, `mirror-contract.json`, or the default sidecar `corpus/evidence/round-14/aria-metadata/corrected.json` (constants at lines 73–75).
- The default `--check` never reads `mirror-contract.json`. Its only reader is `runSelfTest()` (lines ~2276–2347), where any contract mismatch maps to `EXIT.semantic` (line 2347), i.e. exit 1, not exit 2.

Consequence: tampering with the round-15 contract/fixture assets is not classified as `snapshot_tampered` anywhere the lesson says it is. The sidecar's content falsification being exit 1 is consistent with the lesson's "sidecar false semantic claims remain exit1". Only the contract and expectation assets are inconsistent with the wording.

Correction: either add those three digests to `ANCHORS`/`verifySnapshot` (could-not-evaluate on mismatch, and update the wave's build-snapshot digest for the script), or reword the mirror-contract description and SKILL/lesson text to say these assets are not digest-authenticated.

### C2-4 — Differential coverage is narrower than "every mirror" wording (low, scope honesty)

- `metadata-witness.py` mutation list (`mirrors` in the script) covers 9 of 14 emitted mirror fields: 6 cleanup, 3 qualification (`everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`).
- Five qualification fields (`qualified`, `proofCount`, `allProofsComplete`, `allProofsSupportCorrection`, `everyProofNotListeningAfter`) are excluded from the differential. Excluding them is reasonable, because the legacy arm already checked them and would not accept the mutant, so the before-arm precondition would fail. Their after-arm coverage rests only on the self-test cases `sidecar-qualification-mirror-refusal` / `sidecar-mirror-type-refusal`, whose mutated fields I did not inspect. L1 should confirm those fixtures mutate each of the five fields, or state that the differential is not per-field for them.
- Table-level equality of emitted keys to `CLEANUP_MIRROR_FIELDS` / `QUALIFICATION_MIRROR_FIELDS` is verified: `buildSidecar` (lines ~1505–1530) emits exactly 6 cleanup and 8 qualification keys, matching the tables and the committed `mirror-contract.json` fields (checked in self-test only, lines ~2300–2330).

### C1-1 — `score_not_improved` rejects only equality; a regression passes (medium)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs` line 616: `if (score.before === score.after) fail(..., 'score_not_improved');`
- A row with before 1, after 0, whose two counting commands return exactly 1 and 0, passes this predicate and the whole `check()` loop (lines 609–625). The reason id, the lesson wording ("not improved"), and QUALITY 21's "asserts its intended diagnostic reason" all overstate what is refused.
- Committed user rows (`SCORECARD.md` lines 332–380) are all `before: 0 / after: 1`, so tightening will not break committed bytes.

Correction: replace with a numeric predicate (validate both as `/^\d+$/`, then refuse `Number(after) <= Number(before)` with `score_not_improved`), and add a self-test case `count_before_after_decrease_red` (before 1, after 0, real count matching) expecting `score_mismatch` + `score_not_improved`, inserted in the `cases` table near lines 1100–1103.

### C1-2 — Absent pathspec at a valid revision counts as zero silently (medium-low)

- `runCount()` line 429: `const masked = spec.kind === 'grep' && result.status === 1;` treats any `git grep` exit 1 as a zero count.
- Git returns 1 when the pattern matches nothing. A fixture path that no longer exists at a valid `measured-against` revision also yields 1, hence `count = 0`, with no `counting_command_failed` and no path reason. [INFERENCE from git semantics; not executed.]
- The self-test corpus (`cases`, lines 1059–1113) covers only a zeroed revision (`counting_command_failed`). No case covers an absent path, so this behavior is unpinned.
- The MASK_GUARD comment (lines 857–858) describes the mutant as reproducing "a missing object as a zero count", which the production path still does for a missing path.

Correction: before counting a `grep` row, verify the path at the revision (`git ls-tree -r --name-only REV -- PATH` non-empty, or equivalent), and refuse with a new reason (e.g. `counting_path_missing`, added to `COUNT_REASONS` at lines 92–99) plus a self-test case. Alternatively document that absent path = truthful zero, and say so in the comment.

### C1-3 — "Applicability" is declared or hard-coded, not observed (low-medium)

- The count witness prints literal `marker_applicable=1` (line ~923–925) and the diagnostic witness prints literal `marker_applicable=0` (line ~1040). Self-test lines ~1205–1222 print applicability from the case's declared `appliesMarker` field (cases lines 1061–1103).
- The production CLI receipt has no applicability or marker field: `receiptOf()` (lines 759–776) parses only verdict/finding/reason/detail, and the main catch (lines 1297–1302) emits only reason.
- The lesson's claim "distinguish applicable marker absence from N/A" is therefore enforced only in harness logging, not in the CLI contract. The regression-discriminating control does exist separately: `--count-witness` (old shell arm creates the marker, new arm does not), lines ~862–925.

Correction: either emit an observed applicability value from the evaluator (for example, `marker=applicable` only when the score command contains a shell stage), or relabel the harness fields as declared-not-observed in the lesson and SKILL.

### Not defects (checked, closed)

- C1 `fail()` reason registry (lines 92–106) rejects unknown reasons; COUNT_REASONS and self-test expectations use the same ids.
- C1 `receiptOf` clean/fail disambiguation and `receiptMatches` literal comparator (lines 740–786) are sound for single-line records.
- C1 mask mutant (lines 855–860, 1003–1022) is a real discriminator: `MASK_GUARD` split must occur exactly once or the witness refuses.
- C2 `cleanupDerived`/`expectedMirrorValues` (lines 381–522, 989–1018) use `complete &&` guards; empty or incomplete proof sets cannot produce all-true mirrors.
- C2 `snapshotOutcome` (lines 927–970) classifies mismatches as exit 2 `snapshot_tampered` with `semanticEvaluation: skipped`, and `runCheck` returns before semantic evaluation when defaults fail.
- Spec citations in SKILL/source-index are accurate: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/aria-loopback.spec.mjs` line 269 (`assertPinnedRuntime` Node minimum) and line 924 (call in runtime-pin phase), confirmed by reading.

## 6. Commands L1 should run (not executed by this lane)

- Confirm the digests in `build-snapshot.json` against the worktree (sha256 of the four files listed above).
- Run `node scripts/check-aria-metadata.mjs --self-test` and `node scripts/check-user-round-contract.mjs --self-test` once, after the corrections above (if adopted), and capture stdout as receipts.
- Run `python3 .ufo/waves/round-15/metadata-witness.py` once for the C2 differential.
- For C1-2 and C1-1, add the proposed self-test cases first, then rerun the production USER check to confirm the committed rows still pass the numeric predicate.

## 7. Verdict boundary

Author-side source attack only. Not a non-author certification. No outcome of any gate is claimed here. The defects above are source-derived (file and line evidence), and the git-semantics items are labelled [INFERENCE]. Routing: C2-1 and C1-1 are the two that change verdict semantics and should be decided before L1 records the 0→1 counts.
