# RuntimeDisabledHidden — round 19 wave 2 falsification

Date: 2026-10-21. Seat: `TabiR19.RuntimeDisabledHidden`. Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).

## Result and axes

**No semantic counterexample found in the four `disabled-hidden` cases.** Two runs using the parent's clarified regular-copy layout each exited 0 with **4 passed / 0 failed / 0 findings**. Every input, complete expectation, status, exact error text, complete fields object, submit count, and complete observed schema agreed with the committed receipt and both historical raw-probe repetitions for that case. Two earlier equivalent-layout runs also agreed: 16 successful case executions across four retained runs, not 16 distinct cases.

Axes exercised: **depth** (per-case technical decisions and exact observations); **operability** (actual supported invocation and repeated execution); **calibration** (raw-control versus expectation encoding, explicit evidence limits). This is a family-scoped advisory result, not a whole-C1 or round verdict.

**Invocation-contract defect retained:** the wave prompt supplied unsupported `--fixtures`. That exact invocation exited 2 before browser execution, emitted no receipt, and produced empty stdout. Its stderr was:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

The parent subsequently confirmed the prompt error and directed regular copies under a temporary parent containing sibling `cases` and `fixtures`. The unchanged R producer accepts `--cases` / `--out`; it resolves fixtures as `dirname(cases)/fixtures`. No implementation change was needed or made.

## Execution and isolation of inputs

Private clone: `/fast/scratch/tabi-r19/fx-RuntimeDisabledHidden`, detached at R. Clone checkout and lane master both resolved to R before probing. The producer was never edited.

Final input root: `/fast/scratch/tabi-r19/RuntimeDisabledHidden-supported-1_s5zrv2`:

- `cases/disabled-hidden.json`: a regular byte copy, not a symlink; the only case file.
- `fixtures/disabled-hidden.html`: a regular byte copy, not a symlink; the only fixture file.
- Case and fixture hashes equal their R originals and the hashes in the committed receipt.

The Node binary below was used for every harness invocation, with its directory first in `PATH`:

`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`

Observed runtime identity on every successful run: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. All runtime identity fields, including launcher and real executable SHA-256 values, equal the committed receipt.

### Supported commands actually executed

Both commands had cwd `/fast/scratch/tabi-r19/fx-RuntimeDisabledHidden`; both outputs were new paths outside the clone.

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeDisabledHidden/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeDisabledHidden-supported-1_s5zrv2/cases --out /fast/scratch/tabi-r19/RuntimeDisabledHidden-frcxz_ul/copied-layout-run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeDisabledHidden/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeDisabledHidden-supported-1_s5zrv2/cases --out /fast/scratch/tabi-r19/RuntimeDisabledHidden-frcxz_ul/copied-layout-run-2.receipt.json
```

Each produced four `WEBMCP_VALIDATION_CASE ... pass=true` lines and a final `WEBMCP_VALIDATION verdict=pass cases=4 passed=4 failed=0 findings=0` line. Both stderr streams were empty. Full, unabridged stdout/stderr, argv, cwd, exit, elapsed time, original output paths, retained receipt paths and receipt hashes for **all five invocations** are in `RuntimeDisabledHidden.json`.

Before the clarification, a copied single-family cases directory adjacent to the clone's existing fixtures had already been run twice successfully. Those receipts and commands are retained separately, not silently substituted for the clarified-layout pair. That throwaway cases directory inside the clone was removed after comparison.

## Case-by-case findings

Here `F0` is the complete observed DOM inventory:

```json
{"baseline":"baseline-before","disabledField":"disabled-before","readonlyField":"readonly-before","hiddenField":"hidden-before","":"unnamed-before"}
```

All four cases exposed exactly this complete tool input schema:

```json
{"type":"object","properties":{"baseline":{"type":"string","description":"Baseline"},"":{"type":"string","description":"Unnamed"}},"required":[]}
```

| Case | Exact input | Observed status / error classification | Fields / submits | Committed receipt pointer | Historical raw-probe pointers |
|---|---|---|---|---|---|
| `decl-disabled-hidden-01` | `{"disabledField":"disabled-after"}` | `Error`; unknown parameter `disabledField` | Exactly F0 / 0 | `/cases/10` | `/runs/0`, `/runs/4` |
| `decl-disabled-hidden-02` | `{"readonlyField":"readonly-after"}` | `Error`; unknown parameter `readonlyField` | Exactly F0 / 0 | `/cases/11` | `/runs/1`, `/runs/5` |
| `decl-disabled-hidden-03` | `{"hiddenField":"hidden-after"}` | `Error`; invalid value for `hiddenField`, **not** unknown parameter | Exactly F0 / 0 | `/cases/12` | `/runs/2`, `/runs/6` |
| `decl-disabled-hidden-04` | `{"":"unnamed-after"}` | `Completed`; actual `errorText` is null | F0 with only `""` changed to `"unnamed-after"` / 1 | `/cases/13` | `/runs/3`, `/runs/7` |

Every table row agreed in all four successful executions and both matching historical probes. Full error strings are retained in the JSON comparison and all receipts; comparisons were exact, not merely the harness's substring predicate.

The successful case's actual tool response output fields were exactly:

```json
{"baseline":"baseline-before","readonlyField":"readonly-before","hiddenField":"hidden-before"}
```

This reproduces the runtime portion of family decisions DV-04 (disabled/readonly) and DV-05 (hidden), with case 04 as their successful in-family control. Source-body binding and the overall decision counter were not re-audited here.

### L1 field-encoding check

- In every historical raw run, mapping each scalar control's actual `name` to its actual `value` exactly reconstructs `observed.fields`; that entire object equals the committed expectations and fresh harness fields.
- The unnamed control has DOM id `unnamedField`, but its field/schema key is **the empty string**, not its id. The key remains present before and after invocation. No fallback alias was introduced.
- The DOM inventory intentionally retains disabled and unnamed controls. The `FormData` output omits both; readonly and hidden controls remain in that output. These are distinct observations, not contradictory encodings.
- The submit button's `submitAction` is not part of the recorded DOM field inventory.
- **Checkbox string/null encoding is not applicable to this family:** its fixture and all historical raw control inventories contain no checkbox or radio controls. No conclusion about a different family's checkbox encoding is claimed.

## Comparison depth and repeatability

The independent comparison did more than trust `pass: true`:

1. Matched every R case against its committed receipt entry by id, checking exact input and the entire expectation object.
2. Matched each of the eight historical probe runs by exact input; checked direct `toolsAdded` schema, `invokeTool` input/error, `toolResponded`, scalar-control re-encoding, fields and submit count.
3. Compared all complete observed schemas, not only the `properties` and `required` subsets in the expectation. `type: object` also agrees.
4. Compared exact error text, including null for case 04. The harness itself treats `errorTextIncludes: null` as no substring assertion, so this independent null comparison is stricter.
5. Compared response output, command error, decoded `toolInvoked.input`, tool name, pass state, and empty navigation/download/new-artifact/blocked-request observations across all fresh runs and the committed family entries.

**No behavioral nondeterminism was observed across the two clarified-layout runs.** Their full receipts are not byte-identical: the complete recursive difference is 17 JSON pointers, restricted to `generatedAt`, invocation ids and frame ids. All differing pointers are enumerated in the JSON artifact. The semantic comparison excludes only those time/identity fields; it retains error text, output, fields and full schema. The earlier pair produces the same normalized family digest as well:

`017ae2827064fc4e4013cf6d8172e3983463dca5674a538b0e0da7be84eee71d`

This is finite observed agreement, not a guarantee of universal determinism.

## Exact retained evidence

All paths in this table are under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/`.

| Artifact | Purpose / observed result | SHA-256 |
|---|---|---|
| `RuntimeDisabledHidden.json` | Exhaustive command/stdout/stderr/exit/digest and per-case comparison record | `a6b1c02ebc68190fe3c66b11e73b569b41d3de8d6ebc2c44daece76b437004e8` |
| `RuntimeDisabledHidden.receipt.json` | Clarified regular-copy layout run 1; exit 0; 4/4 | `e2dc04c00cd12bc2d9113866feef12a4fde7df93bb415378e9264778f92cbb15` |
| `RuntimeDisabledHidden.repeat.receipt.json` | Clarified regular-copy layout run 2; exit 0; 4/4 | `ac1e09cbd16f896e29aaaca84d93cecb63aa12ee1e6486ebe7fce68e9f80236f` |
| `RuntimeDisabledHidden.initial-1.receipt.json` | Earlier adjacent-clone-cases layout run 1; exit 0; 4/4 | `aa614db965af27d66a68a9a3fa68709fed5df7f6b0f3a33c9db5c092b229788c` |
| `RuntimeDisabledHidden.initial-2.receipt.json` | Earlier adjacent-clone-cases layout run 2; exit 0; 4/4 | `8a6675819a92a36b8dc6ce562198d0533e5bf3fc9b68e8adacda2f45026b9b31` |

The unsupported exact invocation has no receipt; its command, exit 2, empty stdout and complete stderr are retained in the JSON artifact's `requestedInvocation`.

### R input identity

These paths are relative to the private clone `/fast/scratch/tabi-r19/fx-RuntimeDisabledHidden` and were opened on 2026-10-21.

| R file | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `corpus/evidence/round-19/validation/cases/disabled-hidden.json` | `cf85f0a96b9e05a33380451ee20bf20510d6ea0bcc17877fb9b3c6bec6eb6d71` |
| `corpus/evidence/round-19/validation/fixtures/disabled-hidden.html` | `15b6233e1d4a0529f4790b4177820f2292ed00b8ac22b992c1b4210e0fd4e3f9` |
| `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `corpus/evidence/round-19/validation/probes/disabled-hidden.json` | `a2b33f3e01cf5d8dc6f41c2618787538707dce6ea773b61788dc48a9b42c7a77` |

Relevant producer anchors at R: argument parser lines 194–210; field inventory/encoding lines 856–893; expectation predicate lines 1043–1062; inferred fixture directory line 1241; successful-run cleanup assertion lines 1227–1231 and 1301. Fixture anchors: controls lines 6–11; `FormData`/submit observation lines 18–26. Raw and committed JSON pointers are listed per case above.

## Risks, blockers and cleanup

- **Remaining invocation issue:** the original prompt's `--fixtures` spelling is not supported. The parent acknowledged this and supplied the supported layout. No family-runtime blocker remains; correcting shared instructions belongs to L1.
- Historical unnamed-control probes retain `agentInvoked=true` and `isTrusted=true`. The unchanged harness receipt does not retain those call flags or the full controls array, so this replay does **not** independently re-verify the flags in the case's prose answer. It does independently re-verify submit count, field state and response output.
- All harness processes were synchronously reaped. Each successful harness main path enforces settled launch/operation cleanup, closed context/browser/server, refusal on its former loopback server port, and no run-owned stray pids. No independent whole-host process census or external-site inspection was performed. No persistent service or TCP DevTools listener was started by this seat.
- The temporary copied cases directory inside the clone was removed. Clarified-layout copies and original output receipts remain in the seat-owned scratch paths identified above. No throwaway scripts were created.
- No build, lint, formatter, full suite, C1-wide counter, C2/C3 probe, installation or package update was run. No symbol definition/reference/refactor operation was needed; LSP was not invoked.
- Files created in LANE are exactly this report, the JSON comparison record and the four seat-prefixed receipts above. Production files and shared docs/counters were intentionally unchanged. No clone commit was created.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeDisabledHidden`.
- Branch: detached HEAD; no new branch.
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (falsification override: R, not B).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (existing checkpoint; no new commit).
- Production changed paths: none; producer/cases/fixtures/committed evidence untouched.
- Advisory files created: `.ufo/waves/round-19/w2/RuntimeDisabledHidden.md`, `.ufo/waves/round-19/w2/RuntimeDisabledHidden.json`, `.ufo/waves/round-19/w2/RuntimeDisabledHidden.receipt.json`, `.ufo/waves/round-19/w2/RuntimeDisabledHidden.repeat.receipt.json`, `.ufo/waves/round-19/w2/RuntimeDisabledHidden.initial-1.receipt.json`, `.ufo/waves/round-19/w2/RuntimeDisabledHidden.initial-2.receipt.json`.
- No git writes in LANE, delegation, background jobs, production edits, or final status/diff re-audit.
