# AttackClosedProof — C2 `qualification.everyProofClosed` deletion / false / string refusal

This is an author-side wave2 source attack. It is not non-author certification. I only read source. I ran no gate, test, self-test, counter, witness, measure or browser, and I edited no source. Every runtime outcome below comes from reading code and is marked **[INFERENCE]**. I installed and updated no tools, and used no pacman.

## Attacked bytes

- Build snapshot `.ufo/waves/round-15/build-snapshot.json`: revision `72dcf031b9da24796b718517ea575f21e4f7caae`, baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`. `git rev-parse HEAD` gives the same revision.
- Re-hashed at read time; all four match the snapshot:
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
  - `.ufo/waves/round-15/metadata-witness.py` `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`
  - `scripts/check-user-round-contract.mjs` `abf174c3…60a3d` (not attacked)
- Committed evidence:
  - `corpus/evidence/round-15/metadata/expected-fixtures.json` `d3bcc239…4397`. It equals the `git show 72dcf03:` blob.
  - `mirror-contract.json` `18857a4d…308e`.
  - `corpus/evidence/round-14/aria-metadata/corrected.json` `e156b922…6a56745`.
- Docs are **uncommitted worktree bytes**, not the snapshot revision:
  - `SKILL.md` `037bb813…a1fd`, `corpus/QUALITY.md` `cdd2921c…f116`, `corpus/README.md` `dd20d0c2…d5a6`, `corpus/SOURCES.md` `44f2960b…c79a`. `git diff --stat` shows these four as modified.
  - `corpus/lessons/round-15.md` `a5f5aa26…3866` is untracked.

## Temporal limit

There are no C2 execution receipts yet:

- `corpus/evidence/round-15/metadata-differential.json` does not exist. This is the C2 receipt that `measure.mjs:75-87` reads.
- The lesson's `## Execution evidence` section (`corpus/lessons/round-15.md:57-59`) is a placeholder.

No refusal outcome is observed evidence yet. I report source-reading outcomes only and claim no success.

## Code-level verdict on the asked propositions [INFERENCE, holds]

Path: `evaluateSidecar` builds `expectedMirrors` (`:1315`), then `mirrorFieldProblems('qualification', …)` (`:1337-1344`) runs, then `R14-ARIA-SIDECAR-QUALIFICATION-01` fails, then `ACCEPTED-01` fails (`:1369-1378`), then `runCheck` gives `ok=false` and exit 1 (`:1419-1422`).

| Mutation on a copy of an otherwise valid sidecar | Problem strings produced (`:972-987`) | Exit |
|---|---|---|
| `everyProofClosed` deleted | `qualification:field_set` (exact key set, `:977-979`) and `qualification.everyProofClosed:type` (`undefined` is not boolean) | 1 |
| `everyProofClosed: false` | `qualification.everyProofClosed` (`false !== expected true`, `:984`; expected from `:995`) | 1 |
| `everyProofClosed: "true"` | `qualification.everyProofClosed:type` (`:982-983`) | 1 |
| `null`, `0`, `1`, `[]`, `{}` | `:type` | 1 |

String and deletion refusal are each covered twice. Deletion is caught by both the field-set check and the type check. A string is caught by the type check, and would still be caught by `!==` if the type check were dropped. None of these variants leaves the `could_not_evaluate` path, because `verifySnapshot` (`:871-925`) does not anchor the sidecar. That matches the lesson rule "sidecar false semantic claims remain exit1" (`round-15.md:47`).

## Defects

### D1 — HIGH (measurement) — `measure.mjs` cannot name a finding for any single-field mirror differential, so the C2 count drops to 0

**Counterexample [INFERENCE].** In `metadata-witness.py:41-51`, the case `qualification.everyProofClosed` is flipped to `false` and run through `--check` with the after-arm code. The after arm fails exactly two findings: `R14-ARIA-SIDECAR-QUALIFICATION-01` and the aggregate `R14-ARIA-SIDECAR-ACCEPTED-01`. The aggregate always fails together with any other sidecar finding (`check-aria-metadata.mjs:1369-1378`). `measure.mjs` `countC2` (`:978-988`) then calls `namedFinding(entry.after)` (`:410-420`), which fails on every path:

- **Structured payload.** The witness arm dict carries `payload`. `findingOf(payload)` reads `payload.findings` (`check-aria-metadata.mjs:2937`). `findingFromValue` (`measure.mjs:358-370`) gets `failedIds.length === 2`, and the full id list is longer than 1, so it returns `null`.
- **Stdout payload line.** `payloadsIn` re-parses the same `ARIA_METADATA_JSON` payload and returns `null` again.
- **Stdout tokens.** The red line has `findings=<n>`, which `(?:red_)?finding=` does not match. The list line is `ARIA_METADATA findings A,B` (`check-aria-metadata.mjs:3284`). That is comma-joined, and `^ARIA_METADATA findings\s+([A-Za-z0-9._:-]+)\s*$` (`measure.mjs:340`) does not match a comma. `findingTokens` returns `[]`.

**Result:**
- Every one of the 9 differentials, `qualification.everyProofClosed` included, adds `mirror_finding: refusal has no unambiguous named finding` (`measure.mjs:984`).
- `result.count = errors.length === 0 ? 1 : 0` (`:1107`) then yields C2 count 0, even though the checker refuses correctly.
- The C2 0→1 claim cannot be measured by the shipped probe as written.

This is a probe/checker contract mismatch, not a checker bug. The probe comment "exactly one named mirror finding" (`measure.mjs:120`) contradicts the checker's always-co-failing aggregate.

**Bounded correction, pick one:**
- **(a) Measure side, preferred.** In `findingFromValue`, ignore the aggregate id `/-ACCEPTED-01$/` when computing `failedIds`, then require exactly one remaining failed id.
- **(b) Witness side.** Store the single non-aggregate failed id on the after arm as `finding`, so `findingOf(stream)` resolves it directly. Do not use a free-text field. Option (a) avoids adding a witness-only field.

Either way, add a probe self-check fixture: a two-id failure `{QUALIFICATION-01, ACCEPTED-01}` must count, and `{QUALIFICATION-01, BINDING-01, ACCEPTED-01}` must stay ambiguous.

**Check for L1 (no execution by me):** run `node .ufo/waves/round-15/measure.mjs` on a commit that contains `metadata-differential.json`. With current bytes I expect `mirror_finding` ×9 and `c2 count 0` [INFERENCE].

### D2 — MEDIUM — The witness pass oracle cannot attribute the refusal to `everyProofClosed`

`metadata-witness.py:51` passes the after arm if `any('SIDECAR' in x for x in failed_ids(after))`. `R14-ARIA-SIDECAR-ACCEPTED-01` contains `SIDECAR` and fails on any sidecar refusal. The predicate is therefore satisfied by any sidecar-side failure, such as `BINDING-01` or `SIDECAR-01` unreadable, and not specifically by the `everyProofClosed` mismatch. With current data the only extra failure is `QUALIFICATION-01` [INFERENCE], so this does not yet cause a false pass, but the oracle does not establish cause.

The case also covers only the boolean flip (`:44`). Deletion and string mutations of `everyProofClosed` are never exercised by any harness.

**Bounded correction:**
- Require `failed_ids(after) == {'R14-ARIA-SIDECAR-QUALIFICATION-01', 'R14-ARIA-SIDECAR-ACCEPTED-01'}`.
- Require the QUALIFICATION-01 `detail.problems` to contain `qualification.everyProofClosed`.
- Optionally add `delete` and `"true"` variants with expected problems `{qualification:field_set, qualification.everyProofClosed:type}` and `{qualification.everyProofClosed:type}`.

This overlaps AttackCausalHarness F1. It is listed here only for the `everyProofClosed` instance.

### D3 — MEDIUM (evidence/claim) — "ships single-field CLI negatives" is false for qualification mirrors; no isolated deletion or string case exists

`corpus/lessons/round-15.md:37` says C2 "ships single-field CLI negatives". The committed cases (`expected-fixtures.json`) are:

- `sidecar-qualification-mirror-refusal` flips **three** qualification fields together (`check-aria-metadata.mjs:2453-2456`).
- `sidecar-mirror-type-refusal` changes **three** fields across both groups: `cleanup.allClosed='true'`, `qualification.everyProofClosed=1` (a number, not a string), and `proofCount='1'` (`:2463-2467`).
- The only single-field mirror negative is `cleanup.allNotListeningAfter` (`sidecar-mirror-silent`, `:2469-2475`).
- `evaluateOutput` (`:2560-2707`) asserts finding ids and status only. It never asserts `detail.problems`.

**Surviving mutant [INFERENCE]:** add `if (name === 'everyProofClosed') continue;` inside the `mirrorFieldProblems` loop (`:980`).
- `sidecar-qualification-mirrors` still fails through the other two flipped fields.
- `sidecar-mirror-types` still fails through `proofCount` and `cleanup.allClosed`.
- `--witness-mirrors` still fails through the other fields.
- All 35 CLI cases and 3 helpers stay green. Only the uncommitted, not-yet-run `metadata-witness.py` false-flip would catch it, and only for `false`, not for deletion or string.

**Bounded correction:**
- Add three generated fixtures from `sidecarValid`, each with exactly one change to `qualification.everyProofClosed`: `false`, `"true"`, and deleted.
- Each expects exit 1 and `expectedFailedFindings` `{QUALIFICATION-01, ACCEPTED-01}`.
- Add an `expectedProblems` assertion on the finding detail, and pin the digests in a new round15 expectation.
- Alternatively, reword lesson `:37` to "single-field differential in the witness harness; self-test qualification cases are multi-field".

This parallels AttackRefusedProof F4 and AttackCleanupCount for their fields.

### D4 — MEDIUM — The "independent of the writer" derivation is untestable for `everyProofClosed` because no fixture discriminates it

The writer and the checker use the same function:
- `buildSidecar` (`:1469`, `:1574`) and `evaluateSidecar` (`:1315`) both call `expectedMirrorValues` (`:989-1018`).
- The derive helper compares against the same function (`:2763`).

Lesson `:37` says "independently of the writer". That holds against round-14's emitted sidecar, but not between the round-15 emitter and verifier.

Every available proof has `closed === refusedAfterClose === listeningBefore === true`:
- `FIXTURE_PROOF` (`:188-196`).
- The historical `receipt.json` `perWorker[0]`, which I read with `jq`.

**Surviving mutant [INFERENCE]:** at `:995`, change to `const closed = complete && proofs.every((p) => p?.refusedAfterClose === true);`, an alias or copy-paste bug.
- The emitted bytes are identical, so the fixture digest set is unchanged.
- The canonical `corrected.json` still passes, and all mirror negatives still fail.
- `everyProofClosed` no longer reads `closed` at all, and nothing detects it.

**Bounded correction:** add one discriminating fixture receipt, for example a proof with `closed:false, refusedAfterClose:true, listeningBefore:true`. Assert the literal hand-written expected values in QUALIFICATION-01 `detail.expected`: `everyProofClosed:false`, `everyProofRefusedAfterClose:true`, `everyProofListensBefore` per its literal. Do not compute these from `expectedMirrorValues`. This is SelftestOracle's "literal expected mirrors" applied to a discriminating input.

### D5 — LOW/MEDIUM (tradeoff for the judge) — Duplicate JSON keys make `everyProofClosed` parser-dependent

`decodeJson` (`:302-317`) uses `JSON.parse`, which keeps the last of duplicate keys and does no canonical-byte check.

**Counterexample:** in a sidecar `"qualification": {…, "everyProofClosed": false, …, "everyProofClosed": true}`:
- The checker sees `true` and accepts [INFERENCE].
- First-wins readers, grep, or a human see `false`.
- `metadata-witness.py` uses Python `json`, which also keeps the last key, so it cannot surface this.

Lesson `:12` rejects whole-sidecar byte authentication, so this is a declared-scope tradeoff, not a hidden regression.

**Smallest correction:**
- Reject duplicate keys while decoding the sidecar, or add a finding requiring `text === stableStringify(parsed)`. `stableStringify` already appends `\n` (`:224-226`), and the derive and fixture writers emit this form.
- Note: the witness writes `json.dumps(mutant)`, which is non-canonical. A canonical-form rule would change the cause of its after-arm refusals, and D2's weak oracle would hide that change.

Same finding as AttackRefusedProof F3.

### D6 — LOW (false provenance) — `--witness-mirrors` reports a constant `mirror.exit`

`witnessMirrors` returns `mirror: { exit: EXIT.semantic, … }` unconditionally (`:2055`). It is not derived from `mirrorResult`. The self-test check `payload.mirror?.exit !== EXIT.semantic` (`:2636`) is therefore vacuous. Only `mirror.accepted` and the two `fail` statuses (`:2008-2011`) discriminate.

`legacyQualificationOk` (`:2013-2021`) is computed over the code-constructed mutant, so it is a tautology. It is labelled static (`legacyExecuted=false`), which is acceptable.

**Correction:** derive the exit as `mirrorResult.accepted ? EXIT.clean : EXIT.semantic`, or drop the field.

## Non-defect, recorded

In-place mutation of the committed `corrected.json`, for example `everyProofClosed:false`, gives exit 1 `semantic_invalid`, not `snapshot_tampered`, because the sidecar is not in `verifySnapshot`'s list (`:874-886`). This is consistent with lesson `:12` and `:47` and with SKILL `:1781`. It is a declared tradeoff. The measure side separately digests `C2_SIDECAR` (`measure.mjs:1052-1095`).

## Impacted axes

- **calibration9 (C2):** D1 makes the claimed 0→1 unmeasurable by its own probe. D3 and D4 leave the `everyProofClosed` contract only partially falsifiable.
- **D5:** a scope tradeoff only.
- **operability8:** not touched.

## Commands for L1 (not run by me)

- `node scripts/check-aria-metadata.mjs --self-test`
- `python3 .ufo/waves/round-15/metadata-witness.py > /tmp/md.json`, then inspect each `mirrors[].after.payload.findings` failed set.
- `node .ufo/waves/round-15/measure.mjs` (C2) on a revision that contains `corpus/evidence/round-15/metadata-differential.json`. Confirm or refute D1's `mirror_finding` ×9.
- Mutant probes for D3 and D4 on a scratch copy: apply each one-line mutant and confirm that the self-test stays green.
