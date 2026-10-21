# RuntimeSelectEnum — C1 select-enum falsification at R

## Result and axes

**Family behavior reproduced; no select-enum counterexample found in this bounded replay.** Both final regular-copy replays returned exit **0**, **4/4 passing cases**, **0 findings**. Every requested input, expectation, status, exact error text, field map, submit count and complete observed schema agreed with the committed receipt and the family's retained raw probes. The final two receipts agree in their entirety after removing only timestamps and CDP frame/invocation IDs; no behavioral/schema nondeterminism was observed across those two runs.

Axes: **depth** — exact decision-level reproduction; **operability guardrail** — exercise and retain the actual invocation contract; **calibration guardrail** — distinguish DOM fields from submitted fields and bound stability claims to observed runs. This is advisory family evidence, not a judgment of the complete C1 claim or an axis-score change.

One **invocation-contract defect** was observed: the assignment's `--fixtures` flag is unsupported at R. Its exact invocation returned exit **2**, stdout empty, stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

No receipt was produced by that rejected invocation. The L1 subsequently confirmed the flag was a wave-prompt error. No producer edit was made. Supported `--cases` / `--out` invocation resolves fixtures from the cases directory's sibling `fixtures` directory (`scripts/webmcp-validation-round19.mjs:194-210,1240-1242`).

## Execution and retained evidence

Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The initial read-only LANE master lookup returned that same hash. The sandbox was created with `git clone --no-hardlinks --quiet` and switched to detached R.

Final input root: `/fast/scratch/tabi-r19/fx-RuntimeSelectEnum-input-KQL5oc`.

- `cases/` contains **only** `select-enum.json`.
- Sibling `fixtures/` contains **only** `select-enum.html`.
- Both are regular byte copies created with `COPYFILE_EXCL`, not symlinks. Their hashes match the clone inputs and committed receipt.
- Output paths are new, outside the clone and LANE. Node's bin directory was first in the child's PATH. The child received a minimal environment: PATH, a seat-private HOME/TMPDIR, and `LANG=C.UTF-8`; exact values are retained in `RuntimeSelectEnum.json`.

The two final supported argv sequences were:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeSelectEnum/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeSelectEnum-input-KQL5oc/cases --out /fast/scratch/tabi-r19/fx-RuntimeSelectEnum-results-3JOCKp/copied-layout-run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeSelectEnum/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeSelectEnum-input-KQL5oc/cases --out /fast/scratch/tabi-r19/fx-RuntimeSelectEnum-results-3JOCKp/copied-layout-run-2.receipt.json
```

CWD for both: `/fast/scratch/tabi-r19/fx-RuntimeSelectEnum`.

Before the parent clarified the copied-fixture layout, one additional supported replay used a fresh regular case copy in a temporary sibling of the clone's existing fixtures directory. It also returned exit 0, 4/4, zero findings. That temporary in-clone case directory was removed; its receipt is retained separately as `RuntimeSelectEnum.initial.receipt.json`. Thus the record contains one rejected argv invocation and three successful family-only replays; the two final copied-input runs establish the reported repeatability.

All three successful runs observed **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**, matching the committed runtime object, including executable hashes. Producer bytes match `git show R:scripts/webmcp-validation-round19.mjs` and the committed receipt.

## Every case compared

The following values were identical in the committed receipt, raw first-run probe, raw repeat summary, and all three successful replays. Complete case expectations and comparison results are retained in `RuntimeSelectEnum.json`.

| Case | Exact input | Observed status / exact errorText | Post-invoke fields | submitCount | Response output fields |
|---|---|---|---|---:|---|
| `decl-select-enum-01` | `{"choice":"beta-code"}` | `Completed` / `null` | `{"choice":"beta-code"}` | 1 | `{"choice":"beta-code"}` |
| `decl-select-enum-02` | `{"choice":"Beta visible label"}` | `Error` / `Invalid value "Beta visible label" for parameter choice` | `{"choice":"alpha-code"}` | 0 | No output property |
| `decl-select-enum-03` | `{"choice":"missing-code"}` | `Error` / `Invalid value "missing-code" for parameter choice` | `{"choice":"alpha-code"}` | 0 | No output property |
| `decl-select-enum-04` | `{"choice":"disabled-code"}` | `Completed` / `null` | `{"choice":"disabled-code"}` | 1 | `{}` |

The **complete** observed schema was identical for every case, not merely the asserted dotted paths:

```json
{
  "type": "object",
  "properties": {
    "choice": {
      "type": "string",
      "anyOf": [
        {"type":"string","const":"alpha-code","title":"Alpha label"},
        {"type":"string","const":"beta-code","title":"Beta visible label"},
        {"type":"string","const":"disabled-code","title":"Disabled visible label"}
      ],
      "enum": ["alpha-code","beta-code","disabled-code"],
      "description": "Choice"
    }
  },
  "required": []
}
```

Comparison coverage:

- Case-file `input` and entire `expect` objects against the committed receipt, plus every expectation against raw probe data.
- Exact status and error strings, including absent raw CDP errorText normalized to `null` on completion; this is stricter than the harness's optional substring predicate.
- Exact field objects, including keys, rather than only the harness's expected-key subset.
- Submit counts against the raw probe's `pageState.calls.length`; complete inputSchema against the raw `toolsAdded` schema; compact repeat-probe enum/title observations against the new full schema.
- Actual retained `toolInvoked.input` parsed and compared with case input; event status/error against normalized observations; command errors absent; response output compared with the raw probe, including the empty disabled-option output.
- **348 local comparison booleans and 60 event-consistency booleans, zero disagreements.** These are audit checks, not additional corpus cases or C1 decision credit.
- Across the two final receipts, the only differing paths were `generatedAt` and each case's `invocationId`, `toolInvoked.frameId`, `toolInvoked.invocationId`, and `toolResponded.invocationId` (17 paths total). Everything else compared equal.

Local evidence anchors at R:

- `corpus/evidence/round-19/validation/cases/select-enum.json:7-114` — all four inputs/expectations.
- `corpus/evidence/round-19/validation/probes/select-enum.json:80-183` — raw first-run command/event payloads and page-state observations.
- Same probe `:185-193` — retained repeat summary.
- `corpus/evidence/round-19/validation/fixtures/select-enum.html:5-11,18-26` — one named select; disabled option; FormData-based submit response.
- `scripts/webmcp-validation-round19.mjs:856-894,1043-1062,1115-1147` — integrated field reader, expectation comparison, receipt observation construction.

## L1 expectation re-encoding and semantic distinction

There was **no select-enum case-file re-encoding**: the entire case file at R is byte-identical to the original family author's file at `b4d2043303234d93c1f37051793d78e8a920a4bc` (read from the author clone identified by the isolation ledger). Both SHA-256 values are `c1e5a2d4e039af63f0af293588976e782717cc9b5ca76319708590f874abf705`.

The shared L1 field-reader rule is stated at harness `:860-863`: checkbox/radio values use checked value strings or null, and unnamed controls use the empty-string key. **This fixture has neither checkbox/radio nor unnamed controls**, so this seat does not claim to have runtime-verified those other families' re-encodings.

The applicable distinction was checked directly: selecting the disabled option leaves DOM `fields.choice == "disabled-code"`, while the submit handler's FormData and CDP response fields are `{}`. Raw probe `:179-181`, fixture `:19-26`, and both fresh receipts agree. A submit event occurred; the disabled selected value was **not** present in the submitted payload. Read DV-13's submitted wording as event occurrence, not payload inclusion. No field substitution or expectation weakening was needed.

## Hashes and files written

| Evidence | SHA-256 |
|---|---|
| Producer at R and replay | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| Case JSON | `c1e5a2d4e039af63f0af293588976e782717cc9b5ca76319708590f874abf705` |
| Fixture HTML | `757b7f2948bb5af44968fb0933083603d4cc88f734cc0516f7ada8ddba395ebb` |
| Committed full receipt | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| Committed family raw probe | `0fba3c9408f59f24edd1e76122d2f30432a4c24b94d283b41e3807f21c294c1c` |
| Final copied-layout replay 1 receipt | `add3baf71f609de76ffac3da28f5681bed5ee58a1dba344a041f0bfee2705514` |
| Final copied-layout replay 2 receipt | `42ffac1ec4ec628e84b2675816ab2d99f90dd2b90634697672983069d4fcc27c` |
| Earlier supported replay receipt | `1bbf235217a6ff379f7ecc72463096993f3c1460e053fa1ae76d12da155f5ef8` |

Only these exclusive advisory artifacts were written in LANE:

- `.ufo/waves/round-19/w2/RuntimeSelectEnum.md` — this report.
- `.ufo/waves/round-19/w2/RuntimeSelectEnum.json` — exact argv/environment/exit/full stdout/full stderr for every attempt, receipt hashes, input-copy proof, provenance, every case/facet comparison, and stability differences.
- `.ufo/waves/round-19/w2/RuntimeSelectEnum.receipt.json` — exact first final copied-layout receipt bytes.
- `.ufo/waves/round-19/w2/RuntimeSelectEnum.repeat.receipt.json` — exact second final copied-layout receipt bytes.
- `.ufo/waves/round-19/w2/RuntimeSelectEnum.initial.receipt.json` — exact earlier supported replay receipt bytes.

## Risks, cleanup, and blockers

- **No remaining execution blocker.** The unsupported `--fixtures` invocation is retained as prompt/argv-contract evidence; the supported invocation reproduced the family without changing producer bytes.
- Findings are limited to these four inputs, this fixture, and the pinned runtime. No full suite, build, lint, formatter, other-family probe, external-site interaction, package transaction, or tool installation was performed.
- The harness used fresh private browser profiles and pipe CDP; its launch code rejects a TCP DevTools port (`:492-632`). Exit 0 follows `assertCleanupComplete` (`:1300-1301`), whose predicate checks browser disappearance, temporary-path removal, server close/port refusal and no run-marker strays (`:1227-1231`). All foreground harness children exited; no persistent job was started. No independent global process audit is claimed.
- No LSP tool is mounted in this seat; no source-symbol definition/reference/refactor operation was needed. No production source was edited, committed, or pushed.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeSelectEnum`
- Branch: detached HEAD, intentionally report-only falsification sandbox.
- Isolation base / attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (round baseline B remains `66251bfc1aef393e4aec599e950a8deb867736bb`).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new clone commit.
- Changed production paths: none. Producer, cases, fixtures and committed evidence remained unmodified; temporary in-clone case copies were removed. Only the five seat-owned advisory artifacts listed above were written directly in LANE.
