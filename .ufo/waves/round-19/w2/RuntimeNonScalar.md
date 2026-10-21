# RuntimeNonScalar — round 19 wave 2 falsification

## Result and axes

**C1 `non-scalar` runtime behavior was not falsified at R.** The two supported, isolated family replays each exited **0**, with **6 cases / 6 passed / 0 failed / 0 findings**. Every case's complete input, expectation object, observed status, exact error text, complete field object, submit count and complete schema agrees with the committed receipt. Command-error objects also agree. This is a family-specific finding, not a full-suite or whole-C1 judgment.

Axes examined: **depth** (input/protocol/field fidelity), **operability** (actual supported argv), **calibration** (repeatability and raw-probe provenance), and **isolation** (unchanged producer and production inputs). No implementation change was made.

One **invocation-contract defect** is retained: the assigned `--fixtures` option is unsupported by the unchanged R harness. The exact requested command exited **2**, with empty stdout, no receipt, and stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

This belongs to the wave invocation, not a browser validation mismatch. The parent confirmed the supported CLI and instructed regular copies into a temporary parent with sibling `cases/` and `fixtures/`. That corrected invocation was used twice; the producer was not patched.

## Checkpoint, inputs and runtime

- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Baseline context B: `66251bfc1aef393e4aec599e950a8deb867736bb`; this investigation executes **R**, not B.
- Sandbox: `/fast/scratch/tabi-r19/fx-RuntimeNonScalar`, cloned using `git clone --no-hardlinks --no-checkout` then detached at R; both commands exited 0.
- Final temporary parent: `/fast/scratch/tabi-r19/fx-RuntimeNonScalar-probe-yryg2cq8`. Its `cases/` contains only the copied `non-scalar.json`; `fixtures/` contains only the copied `non-scalar.html`. Both are regular, non-symlink files, mode 0644, respectively **212269** and **1710** bytes. Their digests equal their committed counterparts.
- Runtime observed in both receipts and matching the committed receipt: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. The absolute Node binary is used, with its bin directory first in PATH.
- Runtime Chromium ELF SHA-256: `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.
- No installations or updates; no tool/channel/version changes to report.

| Artifact at R | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `validation/cases/non-scalar.json` | `e0cb8e204f0879d70f14ce342bbc5b888b06c36bdc266f29b6417f638424124e` |
| `validation/fixtures/non-scalar.html` | `fb246f56a5f32c2c18c3617e1a73d0e5a4ae09c4ab27e4f290bc597b80e34c19` |
| `validation/probes/non-scalar.json` | `6797c1e6bd79afaf066667ce60f6595e2e1494d4aa6c0720fde6d4675ce0c87b` |
| Full committed `validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |

`validation/` above abbreviates `corpus/evidence/round-19/validation/`. Both replay receipts bind the same producer, cases and fixture digests.

## Executed commands and outcomes

The exact attempted argv, cwd, exit, full stdout/stderr, receipt path/bytes/SHA-256 and durations for **all five invocations** are retained in `RuntimeNonScalar.json` → `attempts[]`. Two initial successful replays used a temporary cases directory directly below the clone's validation directory, so the unchanged harness selected the clone's existing sibling fixtures. After the parent's clarification, the following two replays used only the regular copies in the outside-clone temporary parent. The earlier two were not replacements for these final replays; their outcomes and receipts are retained separately in scratch. The initial temporary clone-only cases directory was removed afterwards.

Supported replay 1 (cwd `/fast/scratch/tabi-r19/fx-RuntimeNonScalar`):

```sh
/usr/bin/env PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/local/sbin:/usr/local/bin:/usr/bin /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNonScalar/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeNonScalar-probe-yryg2cq8/cases --out /fast/scratch/tabi-r19/fx-RuntimeNonScalar-evidence-hlhvsof0/supported-1.receipt.json
```

Supported replay 2 (same cwd):

```sh
/usr/bin/env PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/local/sbin:/usr/local/bin:/usr/bin /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNonScalar/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeNonScalar-probe-yryg2cq8/cases --out /fast/scratch/tabi-r19/fx-RuntimeNonScalar-evidence-hlhvsof0/supported-2.receipt.json
```

Both exited 0, stderr empty; each emitted six `WEBMCP_VALIDATION_CASE … pass=true` lines and a final `verdict=pass cases=6 passed=6 failed=0 findings=0` line. The complete, untrimmed stdout is in the JSON evidence, including the actual `out=` path.

The unchanged implementation accepts only `--cases` and `--out` path options at `scripts/webmcp-validation-round19.mjs:194-210`; it derives the sibling fixture directory at `:1241-1242`. This explains both the failed requested invocation and the corrected layout without a producer edit.

## Every-case comparison

Comparisons used type-sensitive canonical JSON equality (sorted object keys; array order preserved). Complete payloads were compared, including **both 102400-character input strings** in cases 01 and 02; not just summaries or hashes. The retained matrix records each input/expectation hash and every comparison boolean.

| Case | Actual input | Observed status / exact error text | Submit count | Field/schema result | Raw correspondence |
|---|---|---|---:|---|---|
| `decl-non-scalar-01` | Object containing null, array, nested object, 102400-character text string | `Error` / `Invalid value for parameter text_array` | 0 | Four original text seeds; all four string-schema properties unchanged | `primaryRuns[0,1].cases`: `scalar-text-four-values` |
| `decl-non-scalar-02` | Object containing null, array, nested object, 102400-character number-field string | `Error` / `Invalid value for parameter number_array` | 0 | Number seeds are strings `11`, `12`, `13`, `14`; number schemas retain `multipleOf: 1` | `primaryRuns[0,1].cases`: `scalar-number-four-values` |
| `decl-non-scalar-03` | Top-level array with one object | `no-response` / null | 0 | All text seeds and full schema unchanged | `primaryRuns[0,1].cases`: `top-level-array` |
| `decl-non-scalar-04` | Top-level string `not-an-object` | `no-response` / null | 0 | All text seeds and full schema unchanged | `primaryRuns[0,1].cases`: `top-level-string` |
| `decl-non-scalar-05` | Top-level null | `no-response` / null | 0 | All text seeds and full schema unchanged | `primaryRuns[0,1].cases`: `top-level-null` |
| `decl-non-scalar-06` | Object `{"text_long":"short-valid"}` | `Completed` / null | 1 | Only `text_long` changes; remaining three seeds and full schema unchanged | L1 integration control; absent from the original family raw-probe runs |

For each of the six cases, **both supported replays** match the committed receipt on input, expected object, status, exact errorText, complete fields, submitCount, complete schema and commandError. The first five match **10 exact-input raw records** across both original primary runs. Raw fields were independently projected from the addressed form's `observed.controls[form-id][name].value`; raw schema came from `toolSchema`. No raw/receipt disagreement was found.

Case 06 has **no exact tool/input match** anywhere in `primaryRuns` or `individualScalarDiagnostics`. This is a provenance boundary, not fabricated agreement: the case's own `answer` explicitly identifies it as the L1 integration control for DV-08. Its behavior is present in the committed receipt and was independently reproduced here twice. The 8 individual-scalar diagnostics in each original diagnostic run were inspected as provenance only, not rerun or credited as new independent cases.

For top-level array/string/null (DV-08), both supported runs additionally retain:

- `commandError.message = cdpSession.send: Protocol error (WebMCP.invokeTool): Invalid parameters`;
- null `invocationId`, null `toolInvoked`, null `toolResponded`;
- zero submits and unchanged form fields.

Thus these are observed command rejections, not a silent timeout being mistaken for parameter validation. The error **is not** `toolResponded.errorText`; that remains null because no tool invocation was created.

## L1 field encoding and expectation precision

The fixture at `validation/fixtures/non-scalar.html:3-15` contains eight **named non-button controls**: four text and four number inputs. Its two unnamed submit buttons are excluded from field inventory by the existing `pageObservation` rule (`scripts/webmcp-validation-round19.mjs:856-893`). Neither is treated as an unnamed data field.

- Number-control observations remain DOM **strings**, not JSON numbers. All expected seed strings agree with both raw control state and the actual replay fields.
- All expected non-scalar-family data keys exist in actual fields; no missing-key-as-null fallback was needed.
- There are **no checkbox/radio controls** and **no unnamed non-button control** here. This family therefore does not exercise the checkbox checked-value/string/null policy or the empty-name `""` data-key policy. No conclusion about those other families is claimed.
- Across the six expectations, all **22 field-value assertions** and **34 schema-path assertions** match actual values. Case 06 asserts only `text_long` and `text_null` and has `expect.schema: null`; the independent comparison here nevertheless checks its entire four-field object and complete observed schema against the committed receipt. The two unasserted field names are `text_array` and `text_nested`.
- Cases 01 and 02 demonstrate the first rejected array parameter in their combined input. They do not individually establish behavior of the other null/nested/long values; the separate historical diagnostics must not be conflated with these two replays.

## Repeatability

No nondeterminism was observed **in this bounded pair of supported family replays**. Their entire receipts are equal after normalizing only the generation timestamp and present invocation/frame IDs. The recursive full-receipt difference contains exactly **13 leaf paths**: one `generatedAt` and four identifier fields for each of cases 01, 02 and 06. Every other key and value is equal; all differing paths are retained in the evidence JSON.

- Compared-semantic projection SHA-256, both runs: `3561e2001381169054f74beedef29f6d8de1288cd943b369be094c3da48c6e64`.
- Full normalized receipt SHA-256, both runs: `b56fad21fd0c3915b175ea50b67e31a5fdaaee0d29672045cde516bbba307d64`.
- Raw first supported receipt SHA-256: `04d95962fdcc48a8730a83b5b7a7c2101c154e6a0f8e9e9493c24855727d4139`.
- Raw second supported receipt SHA-256: `72207acc44ebae4d57175692b86b2e8f66cfc2f973dabab19c0544aeb25cdced`.

Raw byte hashes differ as expected because those timestamp/ID values are not deterministic. This is not a claim of global determinism or of additional input coverage.

## Exact retained evidence

All paths below are lane-relative; only these four advisory files were written in LANE:

1. `.ufo/waves/round-19/w2/RuntimeNonScalar.md` — this report.
2. `.ufo/waves/round-19/w2/RuntimeNonScalar.json` — all requested/supported commands and complete stdout/stderr, exits, input hashes, receipt hashes, every-case/raw-probe comparison matrix, expectation-path values, repeat-difference paths, control inventory and explicit limitations.
3. `.ufo/waves/round-19/w2/RuntimeNonScalar.receipt.json` — verbatim first supported receipt.
4. `.ufo/waves/round-19/w2/RuntimeNonScalar.repeat.receipt.json` — verbatim second supported receipt.

Original scratch receipts and the final single-family copied-input tree remain at `/fast/scratch/tabi-r19/fx-RuntimeNonScalar-evidence-hlhvsof0` and `/fast/scratch/tabi-r19/fx-RuntimeNonScalar-probe-yryg2cq8`. Committed raw evidence is resolved at R using the paths and digests above. No external source quote or fetched body is used in this report; references are local source locations and retained runtime output, accessed 2026-10-21.

## Risks, limits and blockers

- **No remaining blocker to this family replay.** The unsupported-flag failure is retained and was routed to the parent; the supported invocation completes.
- The harness's `compareExpectation` at `scripts/webmcp-validation-round19.mjs:1043-1061` does not assert commandError, invocationId or toolInvoked. Those DV-08 signals were independently checked in this audit, but no predicate mutant was run. A future different command failure cannot be ruled out solely by `pass:true` on `no-response`; the retained actual command error distinguishes the present run.
- No build, lint, formatter, full suite, claim counter or mutation probe was executed. Only this item's six-case runtime probes and retained-data comparisons were performed. Parent owns post-integration gates.
- All blocking harness invocations exited; successful receipt emission follows the harness's `assertCleanupComplete`. No separate survivor-PID census was retained, so none is claimed.
- No LSP tool is exposed in this leaf's mounted tool inventory. No supported symbol refactor or production implementation change was required; source sections were read directly, not inferred from an empty symbol response.
- No operator/existing browser-profile content, credential/session content, real website or TCP DevTools endpoint was used by this seat. Browser launches used fresh private profiles through the unchanged loopback/pipe harness.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeNonScalar`.
- Branch: detached at attacked checkpoint R; no new branch or commit.
- Sandbox base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (B context remains `66251bfc1aef393e4aec599e950a8deb867736bb`).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (existing inspected commit; no new commit).
- Production changed paths: **none**. Producer/cases/fixtures/raw probes/committed receipt were not edited; the initial temporary clone-only case copy was removed. No git write occurred in LANE.
- Direct LANE writes: only the four seat-owned advisory files listed under Exact retained evidence. No sibling/fleet/global/external substrate writes and no delegation/background jobs.
