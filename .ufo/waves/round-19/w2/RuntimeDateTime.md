# RuntimeDateTime — round 19 wave 2 falsification

## Result and axes

**The assigned C1 `date-time` family was not falsified at R.** Two independent, supported-CLI replays each exited **0**, with **5/5 cases passing, 0 failed cases, and 0 findings**. Every case's input, expectation, status, exact error text, complete fields map, submit count, and complete emitted schema agrees with the committed family receipt and both retained raw-probe repetitions. The five cases therefore produced ten fresh browser invocations, compared against ten historical raw invocations.

The requested command did expose an **invocation-contract defect**: `--fixtures` is unsupported at R and exits **2** before any browser invocation. This is distinct from a validation-family failure. The literal refusal is retained; the supported replays used regular case/fixture copies and unchanged producer bytes, following the L1 clarification. This is a scoped runtime finding, not an overall C1 admission verdict.

Axes examined: **depth** (complete case/schema/error/field fidelity), **operability** (actual CLI and repeatability), **calibration** (committed versus raw observations and L1 expectation changes), and **isolation** (private immutable checkout, regular copied inputs, private loopback harness). No production change was proposed or made.

## Reproduction boundary

- Attacked revision R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, observed after cloning and detaching the private checkout.
- Clone: `/fast/scratch/tabi-r19/fx-RuntimeDateTime`.
- Fresh input parent: `/tmp/RuntimeDateTime-cases-qpqmHP`.
  - `cases/date-time.json`: a regular 7,190-byte copy, not a symlink; the only cases file.
  - `fixtures/date-time.html`: a regular 1,063-byte copy, not a symlink; the only fixture.
  - A preliminary fixture-directory symlink was removed and replaced with the regular fixture copy **before either browser replay**. No replay used a symlink input.
- Runtime in both receipts exactly matches the committed receipt, including binary hashes: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**.
- Node executable: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`.
- Execution environment: `PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/bin:/bin`, `LANG=C.UTF-8`, `TZ=UTC`.
- Only the assigned family probe was run. No full suite, build, lint, or formatter was run; no tools were installed or updated. There were no symbol edits or refactors requiring LSP.

The unchanged harness owns its private Chromium contexts and pipe-backed CDP connection. Both successful runs passed its `cleanup()` / `assertCleanupComplete()` path before writing receipts (`scripts/webmcp-validation-round19.mjs:1300-1301`). No separate PID census was performed, so this report does not invent an independently observed survivor count. Both receipts have no command errors, blocked external requests, navigation violations, download events, new Playwright artifact files, or run findings.

## Exact commands and outcomes

All commands ran with the clone as working directory and the environment above. Full, unabridged stdout and stderr, exit codes, argv, times, receipt paths, and receipt SHA-256 values are retained in `RuntimeDateTime.json` under `runs`.

### Literal requested CLI

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeDateTime/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeDateTime-cases-qpqmHP/cases --fixtures /fast/scratch/tabi-r19/fx-RuntimeDateTime/corpus/evidence/round-19/validation/fixtures --out /fast/scratch/tabi-r19/fx-RuntimeDateTime.requested.receipt.json
```

Observed exit **2**, empty stdout, no receipt. Stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

### Supported replay 1

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeDateTime/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeDateTime-cases-qpqmHP/cases --out /fast/scratch/tabi-r19/fx-RuntimeDateTime.run1.receipt.json
```

Observed exit **0**, elapsed **3.156 s**, five case lines with `pass=true`, then `verdict=pass cases=5 passed=5 failed=0 findings=0`; stderr empty.

### Supported replay 2

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeDateTime/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeDateTime-cases-qpqmHP/cases --out /fast/scratch/tabi-r19/fx-RuntimeDateTime.run2.receipt.json
```

Observed exit **0**, elapsed **2.878 s**, five case lines with `pass=true`, then `verdict=pass cases=5 passed=5 failed=0 findings=0`; stderr empty.

The output paths are outside both LANE and the clone, as the harness requires. Receipts were subsequently byte-copied to the seat-owned retained paths below.

## Case-by-case comparison

`RuntimeDateTime.json` retains each full input, expectation, observed schema/error/fields, individual comparison booleans, and both raw-probe repetition comparisons. Every listed comparison is true; there are **0 mismatches**.

| Case | Input distinction | Observed status / exact-error agreement | Submit count | Observed fields | Receipt/raw agreement |
|---|---|---|---:|---|---|
| `decl-date-time-01` | All four valid ISO values | `Completed`; error text null | 1 | `date=2026-10-21`, `time=13:45`, `datetime=2026-10-21T13:45`, `month=2026-10` | Both fresh runs, committed receipt, raw repetitions 1 and 2 agree |
| `decl-date-time-02` | Date is `10/21/2026` | `Error`; exact invalid-value error names `date` and the supplied value | 0 | All four strings empty | Same |
| `decl-date-time-03` | Time is `1:45 PM` | `Error`; exact invalid-value error names `time` and the supplied value | 0 | All four strings empty | Same |
| `decl-date-time-04` | Datetime is `10/21/2026 1:45 PM` | `Error`; exact invalid-value error names `datetime` and the supplied value | 0 | All four strings empty | Same |
| `decl-date-time-05` | Valid ISO syntax, outside native min/max | `Error`; the entire four-control native validation message matches exactly | 0 | `date=2027-01-01`, `time=08:00`, `datetime=2027-01-01T08:00`, `month=2027-01` | Same |

For all five cases, the complete schema agrees, not merely the selected assertions: an object with the four named string properties, `required: []`, their descriptions, and these formats:

- `date`: `date`.
- `time`: `^([01][0-9]|2[0-3]):[0-5][0-9]$`.
- `datetime`: `^[0-9]{4}-(0[1-9]|1[0-2])-[0-9]{2}T([01][0-9]|2[0-3]):[0-5][0-9]$`.
- `month`: `^[0-9]{4}-(0[1-9]|1[0-2])$`.

All serialized `toolInvoked.input` values in both fresh receipts also decode to the declared case inputs. Raw `toolResponded.output` values agree with the fresh results. The raw successful submissions retain `agentInvoked:true` and `isTrusted:true`.

**No nondeterminism was observed across the two fresh runs.** The complete receipts are structurally equal after removing only `generatedAt` and recursive opaque CDP `invocationId`/`frameId` keys. Normalized complete-receipt SHA-256: `e86aba19263d94786c801e75d377d906f1e875e9e0cabf7cad14e0efafc9b32f`. The separately retained case/input/expectation/status/error/field/submit/schema projection hashes to `53e89f7b11e8a1eb75f2fe05a733366177735238117006b1833d5270d5ac56b7`. Raw receipt hashes differ because timestamps and opaque identifiers differ; no claim of byte-identical raw receipts is made.

## L1 expectation re-encoding review

Compared the original family author's committed JSON at `e903a41a0fbded431db9d15d7d5864e0001f52a3` against R using the read-only command retained in `authoredExpectationComparison`:

```sh
/usr/bin/git -C /fast/scratch/tabi-r19/FamDateTime show e903a41a0fbded431db9d15d7d5864e0001f52a3:corpus/evidence/round-19/validation/cases/date-time.json
```

Observed exit **0**. Original case-body SHA-256: `e6df1ee73bd119d829e5d1065d52ba3676da594b903412b9d7b021c46db16209`.

There is exactly **one JSON-value change**: `cases[4].expect.errorTextIncludes` was strengthened from the generic validation prefix to the full native validation error for all four controls. That complete text is present identically in both historical raw repetitions, the committed receipt, and both fresh runs. Its U+202F narrow no-break spaces and trailing space are retained in the JSON evidence. No input, fields expectation, schema expectation, status, or submit-count expectation changed.

The four controls are singly named temporal inputs. Their field values are strings, including empty strings for the three invalid-format cases. No checkbox/radio or unnamed control exists in this family, and no checkbox boolean-to-string/null or unnamed-control-key re-encoding applies. The raw `pageState.fields`, R expectations, and both fresh maps are identical. Other families' conventions were not re-tested here.

## Retained evidence and byte bindings

All paths in this table are LANE-relative; the source files are read from the private checkout pinned to R.

| Evidence | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `corpus/evidence/round-19/validation/cases/date-time.json` and its regular temp copy | `f6531c28bf9efead2ceabf1517e7e5016c6b7192097e10b4979a66a0f3d62b90` |
| `corpus/evidence/round-19/validation/fixtures/date-time.html` and its regular temp copy | `85f518f6699ffc01ceca85effacd086fb7cb5e5f77429a803ad909ac03eb7683` |
| Committed `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `corpus/evidence/round-19/validation/probes/date-time.json` | `c8208beef9e9a137603bbdc4e310dcc5a6c6c9c50e3c87c197c8312b692a92ef` |
| `.ufo/waves/round-19/w2/RuntimeDateTime.receipt.json` — replay 1 | `6757b1ce54c44737b597362cb60988cc12ea107f9cd4c02fdb944a67fe57a060` |
| `.ufo/waves/round-19/w2/RuntimeDateTime.run2.receipt.json` — replay 2 | `18698f5c4be82fc826514a670b2476fdbc85c7ef39c3ff58b914b6991ecc9371` |

The producer, family case digest, fixture digest, and all runtime identity fields in both fresh receipts equal the committed bindings. The copied receipts' hashes also equal their outside-clone originals.

Machine-readable command/output/comparison record: `.ufo/waves/round-19/w2/RuntimeDateTime.json`.

Local source anchors opened **2026-10-21**, URL `file:///fast/scratch/tabi-r19/fx-RuntimeDateTime/scripts/webmcp-validation-round19.mjs`, UTF-8 body SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`:

- Lines 194–210, parser: `if (arg === '--out' || arg === '--cases')`.
- Line 1241, fixture location: `const fixturesDir = join(dirname(args.cases), 'fixtures');`.
- Lines 860–891 define the shared field reader; the temporal family needs no conversion beyond its ordinary string values.

## Risks and blockers

- **Confirmed invocation-contract defect:** the wave's originally supplied `--fixtures` argument cannot run against unchanged R. The supported invocation above resolves execution without a producer edit; the failure remains retained rather than suppressed.
- Native validation error wording is runtime/locale-specific. This reproduction used the pinned runtime and English locale; other locales/builds are not established by these results.
- The frozen five cases cover malformed date/time/datetime-local, but not a separately malformed month. This is a family-boundary limitation, not a newly tested behavior or a narrowed rerun.
- No remaining blocker for this assigned reproduction. No source-body audit, unrelated family probe, full C1 counter, or fleet gate was run; the L1 retains integration/gate ownership.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeDateTime`.
- Branch: detached HEAD; no new branch or commit.
- Base and inspected commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, as required for this falsification wave).
- Production changed paths: **none**; no git write in LANE, no production edit in any checkout, and no sibling/domain/global configuration mutation.
- Exclusive LANE outputs:
  - `.ufo/waves/round-19/w2/RuntimeDateTime.md`.
  - `.ufo/waves/round-19/w2/RuntimeDateTime.json`.
  - `.ufo/waves/round-19/w2/RuntimeDateTime.receipt.json`.
  - `.ufo/waves/round-19/w2/RuntimeDateTime.run2.receipt.json`.
