# Round 19 W2 — RuntimeTextConstraints

## Scoped result and axes

**Reproduced at R; no text-constraints behavioral counterexample found.** Two sequential compliant replays each exited **0**, with **4/4 cases passing, 0 failed, 0 findings**. All requested input/expect/status/errorText/fields/submitCount/schema comparisons agree with the committed receipt and retained family probes. No outcome nondeterminism was observed across these two replays.

Axes named for this advisory work:
- **Depth (C1):** replay all four family cases, covering DV-18 pattern rejection, DV-19 length non-enforcement, and the in-family success control `decl-text-constraints-04`.
- **Calibration:** distinguish exact observations from substring expectations, volatile transport IDs, and historical-only validity observations.
- **Operability/isolation:** preserve the pinned producer, use private loopback fixtures and regular copied inputs, and make no production edits. This report does not judge the complete round or other families.

R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The initial lane-tip read returned this exact revision. Clone creation used `git clone --no-hardlinks --quiet` followed by a detached checkout of R in `/fast/scratch/tabi-r19/fx-RuntimeTextConstraints`.

## Invocation-contract defect and supported replay

The assignment's literal `--fixtures` invocation exited **2**, stdout was empty, and no receipt was produced. Exact stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

At R, `scripts/webmcp-validation-round19.mjs:194-210` accepts `--cases`, `--out`, and `--help`; `:1240-1242` derives the fixtures directory as the sibling `fixtures` of the cases directory. L1 confirmed this was a wave-prompt invocation error and instructed use of that supported interface without producer edits.

The exact rejected argv, exit, full stdout/stderr and absence of a receipt are retained in `RuntimeTextConstraints.json` under `attempts[id=requested-cli]`.

After the clarification, a fresh parent directory was created at:

```text
/fast/scratch/tabi-r19/RuntimeTextConstraints.regular.exnhe8fr
```

It contains regular byte copies only of the assigned `cases/text-constraints.json` and matching `fixtures/text-constraints.html`. Both files were observed regular and non-symlink before replay. No other family was copied. The producer remains the unchanged script from R.

Both supported commands used cwd `/fast/scratch/tabi-r19/fx-RuntimeTextConstraints`, with the pinned Node bin directory first in PATH:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeTextConstraints/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeTextConstraints.regular.exnhe8fr/cases --out /fast/scratch/tabi-r19/RuntimeTextConstraints.regular.exnhe8fr/run1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeTextConstraints/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeTextConstraints.regular.exnhe8fr/cases --out /fast/scratch/tabi-r19/RuntimeTextConstraints.regular.exnhe8fr/run2.receipt.json
```

| Replay | Exit | Cases/passed/failed/findings | Duration | Receipt generatedAt |
|---|---:|---|---:|---|
| Regular-copy run 1 | 0 | 4 / 4 / 0 / 0 | 2.469 s | `2026-10-21T08:41:11.032Z` |
| Regular-copy run 2 | 0 | 4 / 4 / 0 / 0 | 2.322 s | `2026-10-21T08:41:32.798Z` |

Full stdout and empty stderr for both commands are retained verbatim in the JSON artifact. Each stdout contains the four `WEBMCP_VALIDATION_CASE ... pass=true` lines and its final `verdict=pass cases=4 passed=4 failed=0 findings=0` line.

Before L1's regular-copy clarification, an ancillary supported-CLI run had passed using a sibling fixture-directory symlink to the clone. It is **not counted** as either compliant replay. Its command/output and receipt are retained separately (`RuntimeTextConstraints.ancillary.receipt.json`), rather than silently discarded. No harness mutation or full-suite execution occurred.

## Every-case comparison

All four cases have expected schema projection `{"properties.q.pattern":"[A-Z]+"}`. Every fresh complete announced schema, not merely this projection, equals the committed receipt and raw `firstProbe.toolsAddedParams` schema:

```json
{"type":"object","properties":{"q":{"type":"string","pattern":"[A-Z]+","description":"Query"}},"required":[]}
```

There is no `minLength` or `maxLength` in the observed schema.

| Case | Input | Expected status; errorTextIncludes | Exact observed status; errorText | Expected = observed fields | Expected = observed submitCount | Raw probe |
|---|---|---|---|---|---:|---|
| `decl-text-constraints-01` | `{"q":"abc"}` | Error; `Form validation failed: q: Please match the requested format.` | Error; `"Form validation failed: q: Please match the requested format.. "` | `{"q":"abc"}` | 0 | `pattern-mismatch` |
| `decl-text-constraints-02` | `{"q":"AB"}` | Completed; null | Completed; null | `{"q":"AB"}` | 1 | `minlength-violation` |
| `decl-text-constraints-03` | `{"q":"ABCDEF"}` | Completed; null | Completed; null | `{"q":"ABCDEF"}` | 1 | `maxlength-violation` |
| `decl-text-constraints-04` | `{"q":"ABCD"}` | Completed; null | Completed; null | `{"q":"ABCD"}` | 1 | `satisfying` |

The quoted error's doubled final period and trailing space are preserved exactly; the committed expectation intentionally uses a substring. Completed cases have actual `errorText: null`, not merely an unchecked expected null.

Comparison work performed:
- Exact case input and entire expectation object versus the case file and committed receipt, for every case in both replays.
- Fresh `toolInvoked.input` versus case input, raw invoke request input, and raw `toolInvoked` input; raw successful invoke replies correlate with their tool responses.
- Exact status/errorText/fields/submitCount and complete schema versus raw first probes; status/errorText/fields/submitCount and complete tool response versus raw confirmations, where retained.
- Complete fresh case records versus committed family records and versus each other, excluding only `frameId` and `invocationId` recursively. Command errors are null; completed tool-response outputs retain the same fields. Navigation/download/artifact/external-request observation arrays are empty.
- Pinned runtime identity, unchanged producer bytes, case-file digest and fixture digest agree with the committed receipt in both replays.

The retained comparison calculation produced **208 explicit case checks (26 per case per replay), zero failed checks**, plus **8/8 identity/equality checks**. These are equality assertions over eight fresh observations, not 208 independent browser test cases. The full normalized-family SHA-256 is `33952587212349fd7c3015afca8beb5efffe0d2f4df2ace57e7dce8130bddca7` for both replays and the committed family records.

Normalization compares full family case records after removing only the volatile `frameId`/`invocationId` keys. Receipt-level `generatedAt` is not an outcome comparison. Byte-identical receipt files are not claimed.

Behavior reproduced: `abc` is filled but rejected before submit for pattern mismatch; `AB` and `ABCDEF` complete unchanged despite fixture minlength=3/maxlength=5; `ABCD` completes as the satisfying control.

## L1 expectation re-encoding audit

The fixture (`validation/fixtures/text-constraints.html:5-8`) has one named text data control, `q`, and an unnamed submit button. The harness's field inventory excludes buttons (`scripts/webmcp-validation-round19.mjs:856-891`). Both fresh receipts contain **only the key `q`**, with string values; neither contains a spurious empty-string key.

The text-family case file is byte-identical to the family author's committed file at `a5ad23a41ea7202389d50dee8907e7deed24ec02`: both SHA-256 values are `48f55805b93c744deaa115401c28eb75a82871a30e525f9f66c05fe6210fa727`. This was read with:

```text
git -C /fast/scratch/tabi-r19/FamTextConstraints show a5ad23a41ea7202389d50dee8907e7deed24ec02:corpus/evidence/round-19/validation/cases/text-constraints.json
```

Exit was 0. The first attempt to read that original blob through the new clone failed with exit 128; its error is retained, and the read-only source-clone lookup resolved the provenance question. No sibling clone was written.

Thus **no text-family expectation re-encoding occurred**. Checkbox boolean-to-string/null behavior and unnamed *data-control* mapping do not apply to this fixture and are not independently verified for sibling families here.

Both historical integration receipts (`validation/integration/receipt-1.json` and `receipt-2.json`) also agree on all requested family inputs, expectations and behavioral fields. Full historical records differ from final records only because they lack four later observation arrays: `blockedExternalRequests`, `downloadEvents`, `navigationViolations`, and `newPlaywrightArtifactFiles`, all empty in final/fresh records. Their historical producer digests differ and are not represented as R's producer. Exact differences and digests are in the JSON artifact.

## Retained evidence

All paths below are under `.ufo/waves/round-19/w2/` in LANE; the first four artifacts were written before this report.

| Artifact | SHA-256 |
|---|---|
| `RuntimeTextConstraints.json` — complete argv/exit/full stdout/stderr, preparation, all comparisons and limits | `a127e29e6615d0309b691aa0bf9b505686150f3a3fcb56d4697ebf73bc1a82b6` |
| `RuntimeTextConstraints.receipt.json` — compliant run 1, exact receipt body | `9286243c6746a6f8626f893082fc226d888eaa534410c19b8187e553124a41bb` |
| `RuntimeTextConstraints.second.receipt.json` — compliant run 2, exact receipt body | `7eab4314b5b9d64bd096c241a3b36c594c8e95059dd8569b8ed069dca160452a` |
| `RuntimeTextConstraints.ancillary.receipt.json` — pre-clarification ancillary run | `814349b1a7fb1f095d6d753ff67cdd085c0e4fa0b6750d42801291b8315bdc57` |

Input bindings at R:

| Input | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `validation/cases/text-constraints.json` | `48f55805b93c744deaa115401c28eb75a82871a30e525f9f66c05fe6210fa727` |
| `validation/fixtures/text-constraints.html` | `a641942d45e39fca431432c530f68c0f267b64533be5538d1e353166c44cb729` |
| `validation/probes/text-constraints.json` | `23730086907a12d8b70c85564b038298970002ffea5ca2847cec9d92a581a40a` |
| `validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |

`validation/` abbreviates `corpus/evidence/round-19/validation/`. The fresh and committed runtime identities are exactly **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Chromium executable SHA-256 is `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.

## Risks, limits and blockers

- **No remaining blocker.** The unsupported requested flag is retained as an invocation-contract defect and was bypassed only through L1's supported-CLI clarification; no production correction is proposed here.
- The result is limited to this family, four inputs, the pinned runtime and two compliant sequential replays. It is not a general nondeterminism proof or a whole-C1 verdict.
- Fresh harness receipts do not capture ValidityState or submit-event `agentInvoked`/`isTrusted`. The raw family probes retain those observations, but this rerun does not newly establish those attributes or the source-level causal explanation.
- No external source fetch or external-source quotation was added; this was runtime/committed-evidence comparison, not a source-authority review.
- The zero-exit receipt path follows `assertCleanupComplete` (`scripts/webmcp-validation-round19.mjs:1227-1231,1300-1301`), including browser disappearance, temp removal and server-close checks. No separate host-wide process census was performed. All child commands returned; no background job or long-lived service was started by this seat.
- No build, full test suite, lint, formatter, gate or counter was run. Only the assigned family probe and its data comparisons were exercised. No tools were installed or updated. No LSP route is exposed in this seat's tool inventory; no symbol refactor was needed for this runtime-only assignment.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeTextConstraints`.
- Branch: detached HEAD at R, per the falsification-specific override.
- Base / attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; baseline B context: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (existing checkpoint; no new commit).
- Changed clone production paths: **none**. Producer, cases, fixtures and committed evidence remain unchanged.
- Direct LANE writes: only `RuntimeTextConstraints.md`, `RuntimeTextConstraints.json`, `RuntimeTextConstraints.receipt.json`, `RuntimeTextConstraints.second.receipt.json`, and `RuntimeTextConstraints.ancillary.receipt.json` under `.ufo/waves/round-19/w2/`.
- Runtime inputs/outputs remain in seat-owned scratch outside the clone; no LANE git write, global configuration change, sibling write, delegation, commit, push or deployment occurred.
