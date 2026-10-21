# RuntimeNumberRange — C1 family falsification at R

## Scoped result and axes

**Reproduced, not falsified for this family:** both supported replays exited **0**, each **4/4 passed, 0 failed, 0 findings**. Every case's input/expectation, status, exact error text (including trailing spaces), full fields object, submit count and full input schema agree with the committed receipt and both original raw-probe runs. There are **0 committed-receipt semantic mismatches, 0 raw-probe semantic mismatches and 0 semantic replay differences**. This is a scoped observation, not admission of the whole C1 claim.

Axes: **depth** (complete four-case observation comparison); **calibration** (explicit CLI defect, pins, re-encoding audit and finite repeatability); **operability/isolation** (supported invocation, regular family-only copies and no production writes). No claim or source population was expanded.

## Invocation-contract defect and supported replay

The prompt's exact command failed before browser execution: exit **2**, no receipt, empty stdout. Exact stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

At R, `scripts/webmcp-validation-round19.mjs:194-210` accepts only `--cases`/`--out` (plus help); line 1241 derives `fixtures` beside the supplied cases directory. The L1 confirmed this was a wave-prompt mistake and authorized the supported replay, not a producer change.

Fresh temporary parent: `/tmp/RuntimeNumberRange-nme6o8ul`. For both browser runs its only case was the regular, non-symlink `cases/number-range.json`; its only fixture was the regular, non-symlink `fixtures/number-range.html`. Both copies matched committed SHA-256 values. An initially prepared fixture-directory symlink was unused by the rejected command and removed before either supported run. The temporary tree was removed after retaining both receipts.

Supported commands (full requested command and all argv arrays are retained in `RuntimeNumberRange.json`):

```sh
/usr/bin/env PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/bin:/bin /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNumberRange/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeNumberRange-nme6o8ul/cases --out /tmp/RuntimeNumberRange-nme6o8ul/run1.receipt.json
/usr/bin/env PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/bin:/bin /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNumberRange/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeNumberRange-nme6o8ul/cases --out /tmp/RuntimeNumberRange-nme6o8ul/run2.receipt.json
```

| Invocation | Exit | Cases passed | Findings | Receipt SHA-256 |
|---|---:|---:|---:|---|
| Requested `--fixtures` command | 2 | not evaluated | not evaluated | no receipt |
| Supported replay 1 | 0 | 4/4 | 0 | `457765789693108198a7be118983141bfb4612c3a7c44c890a9a51c5bba9bacc` |
| Supported replay 2 | 0 | 4/4 | 0 | `ede80e4a10839e1734d8096d44435b21767c4d2fe1bd92dde33a016a1b318350` |

## Every case, observed twice

The following values are identical in both new runs, the R committed receipt and both original raw runs:

| Case | Input | Status | Exact errorText as JSON | Fields | submitCount |
|---|---|---|---|---|---:|
| `decl-number-range-01` | `{"amount":-1}` | `Error` | `"Form validation failed: amount: Value must be greater than or equal to 2.. "` | `{"amount":"-1"}` | 0 |
| `decl-number-range-02` | `{"amount":11}` | `Error` | `"Form validation failed: amount: Value must be less than or equal to 10.. "` | `{"amount":"11"}` | 0 |
| `decl-number-range-03` | `{"amount":4}` | `Error` | `"Form validation failed: amount: Please enter a valid value. The two nearest valid values are 2 and 5.. "` | `{"amount":"4"}` | 0 |
| `decl-number-range-04` | `{"amount":5}` | `Completed` | `null` | `{"amount":"5"}` | 1 |

Full input schema in all observations:

```json
{
  "type": "object",
  "properties": {
    "amount": {
      "type": "number",
      "minimum": 2,
      "maximum": 10,
      "description": "Amount"
    }
  },
  "required": []
}
```

`multipleOf` is **absent**, not a null schema property. Numeric inputs remain as the corresponding DOM-value strings, including all three invalid values: no clamping or rounding occurred. The invalid values cover underflow (`-1`, step-aligned), overflow (`11`, step-aligned) and in-range step mismatch (`4`); `5` is the successful in-range/step-aligned control. Fresh replays independently confirm the statuses, errors, retained values and submit counts. Validity flags and the trusted/agent-invoked call details are retained in the original probe, not newly sampled by this harness.

The comparison also checked numeric inputs parsed from `toolInvoked.input`, raw invoke-reply/event invocation-ID binding, raw error/status versus aggregate observation, and raw field value versus the recorded control. All comparison checks succeeded. Unlike the producer's subset comparisons, this audit compared the **entire** fields object and schema, and explicitly required null errorText for case 04.

## L1 expectation re-encoding audit

Compared the original family case document at `08e817394fa27f54441c46fac17228c37f86bf73` with R. Its SHA-256 changed from `57761f271d043bd373641a67690b4af06695902f5e37b1fb11a5cc4eb6697400` to `17b8f5264470891c0b1f7b1f9696f91f6e96de467e718e76662ce54e37e79752`. The only three JSON-semantic changes strengthen cases 01–03 from shorter error substrings to the full observed error text, including the `Form validation failed: amount:` prefix and final punctuation/space. They match both original raw runs and both fresh runs exactly. Inputs, fields, status, submit counts and schema expectations did **not** change.

This family has one named numeric data control, `amount`; no checkbox/radio or unnamed data control. Its unnamed submit button is excluded by `pageObservation` (`scripts/webmcp-validation-round19.mjs:864-870`); every fresh fields key set is exactly `["amount"]`, with no empty-string key. Thus checkbox-string/null and unnamed **data-control** re-encodings are not exercised or generalized from this family.

## Retained evidence and pins

All paths below are LANE-relative unless stated otherwise:

- `.ufo/waves/round-19/w2/RuntimeNumberRange.json`: complete commands, exit codes, full stdout/stderr, receipt hashes, inputs/expectations, per-case receipt/raw comparisons, integration delta and limitations. SHA-256 `f6a140ba25e3c364826a5c6222080adb1cd1fd598c3953899bfbc504d42150a7`.
- `.ufo/waves/round-19/w2/RuntimeNumberRange.receipt.json`: replay 1, verbatim receipt; SHA-256 `457765789693108198a7be118983141bfb4612c3a7c44c890a9a51c5bba9bacc`.
- `.ufo/waves/round-19/w2/RuntimeNumberRange.rerun.receipt.json`: replay 2, verbatim receipt; SHA-256 `ede80e4a10839e1734d8096d44435b21767c4d2fe1bd92dde33a016a1b318350`.
- R `corpus/evidence/round-19/validation/receipt.json`: SHA-256 `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`; compared only its four `number-range` records.
- R `corpus/evidence/round-19/validation/probes/number-range.json`: SHA-256 `7045d02fe13753cee3e3345e808d75fedb2a411edfa41b7419b05a89b14def2a`; both raw runs compared.
- Case SHA-256 `17b8f5264470891c0b1f7b1f9696f91f6e96de467e718e76662ce54e37e79752`; fixture SHA-256 `b09373ee6560fffb1ac92a3d2e1545409dbba8c340b3d8367f4c215eca5cb1d6`.
- Producer SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` equals both new receipts and R's committed producer binding. Producer bytes were not edited.
- Both runtime objects equal the committed identity: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Chromium real executable SHA-256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.

Both new receipts have empty external-request/navigation/download/artifact findings. The unchanged producer uses fresh private browser contexts, loopback fixtures and pipe-backed CDP; no real-site invocation or TCP DevTools endpoint was used. It awaited `cleanup()`/`assertCleanupComplete()` at lines 1300–1301 before emitting each receipt; the Node subprocesses were reaped. No independent per-browser PID census was performed.

## Source binding for the observed decision

Opened R's retained decoded source bodies on **2026-10-21** (no new network fetch). DV-11 is `SKILL.md:2070` and `validation/decisions.json`'s `DV-11`, with cases 01–03 and control 04.

- S078, `html_form_element.cc:729`: “if (!skip_validation && !ValidateInteractively()) {”. Lines 751–752 append `control->validationMessage()` and the extra `. `, explaining the exact observed punctuation. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT . Decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Retained file: `corpus/evidence/round-19/sources/html_form_element.cc.gz`.
- S077, `form_mcp_schema.cc:714,717` emits minimum/maximum; line 721: “if (step_range.StepBase().Remainder(step).IsZero()) {”. This guards emission of `multipleOf` at line 724. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT . Decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. Retained file: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.

## Repeatability, risks and blockers

No semantic nondeterminism was observed in **two supported replays**. Full receipt bytes differ only in `generatedAt`, frame IDs and invocation IDs (17 differing JSON paths, all listed in the evidence JSON); none were removed from the retained receipts. This does not prove determinism beyond these two runs.

The only execution-contract defect was the prompt's unsupported `--fixtures` flag; the L1-supported invocation resolved the runtime blocker without changing production code. Error wording is pinned Chromium/locale behavior, not a cross-browser guarantee. No wider C1/C2/C3 suite, build, lint or formatter ran. No tools were installed or updated. No LSP symbol operation was required; this seat exposes no mounted LSP tool. The gzip ranged-read tool returned an empty archive listing; the inconsistency was reported and retained bodies were decoded with local gzip instead. No remaining blocker for this scoped task.

## Files changed

Advisory only: `RuntimeNumberRange.md`, `RuntimeNumberRange.json`, `RuntimeNumberRange.receipt.json`, and `RuntimeNumberRange.rerun.receipt.json`, all under `.ufo/waves/round-19/w2/`. Production, case, fixture, source and counter files intentionally unchanged; no LOG/changelog edit is appropriate for this report-only probe.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeNumberRange`.
- Branch: detached HEAD (private falsification clone).
- Base / attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (not writer baseline B).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit created.
- Changed production paths: **none**. Direct LANE writes: only the four seat-owned advisory files listed above. No lane git writes, sibling mutations, dispatch or background job.
