# RuntimeSelectMultiple — round 19 wave 2

## Scoped result and axes

**The `select-multiple` runtime evidence at R reproduced:** two unchanged-harness runs each exited **0**, with **4/4 cases passing and 0 findings**. All four inputs, complete expectations, exact observed status/error text, complete fields, submit counts, and complete schemas matched the committed receipt and both original raw-probe repetitions. No behavioral nondeterminism was observed across these two new runs.

Axes examined: **depth** (DV-14 rejection decisions and successful controls), **calibration** (expectation/control-state fidelity and bounded repeatability), and **operability** (the requested invocation contract). This is advisory evidence, not a round-admission judgment or an additional C2/C3 measurement. No production file was changed.

## Invocation-contract defect and supported replay

The exact requested command used Node `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, with that installation's `bin` first in PATH, from `/fast/scratch/tabi-r19/fx-RuntimeSelectMultiple`:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple/scripts/webmcp-validation-round19.mjs --cases /tmp/tabi-r19-RuntimeSelectMultiple-cases.zHbt21 --fixtures /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple/corpus/evidence/round-19/validation/fixtures --out /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple-requested.receipt.json
```

Observed **exit 2**, empty stdout, no receipt, and this complete stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

This is a **wave-prompt invocation-contract defect**, not a reproduced select-validation failure. At R, `scripts/webmcp-validation-round19.mjs:194-210` accepts `--cases`/`--out`, not `--fixtures`; line 1241 derives the fixtures directory as the sibling `fixtures` directory. The parent confirmed the supported layout during this run.

Without changing producer bytes, I made private sibling `cases/` and `fixtures/` directories under the fresh temporary parent. `cases/` contained only the regular copy `select-multiple.json`; `fixtures/` contained only its regular matching `select-multiple.html`. Both were checked with `lstat`: regular files, not symlinks, 4,555 and 979 bytes respectively. Their SHA-256 values matched R and its committed receipt. The temporary input parent was removed after the two probes; the clone and durable receipts are retained.

Supported commands actually executed, using the same cwd and PATH prefix:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple/scripts/webmcp-validation-round19.mjs --cases /tmp/tabi-r19-RuntimeSelectMultiple-cases.zHbt21/cases --out /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple-run1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple/scripts/webmcp-validation-round19.mjs --cases /tmp/tabi-r19-RuntimeSelectMultiple-cases.zHbt21/cases --out /fast/scratch/tabi-r19/fx-RuntimeSelectMultiple-run2.receipt.json
```

Both exited 0, with empty stderr. Full stdout for both, including every case line, is retained verbatim in `RuntimeSelectMultiple.json` under `supportedRuns`; the rejected argv/stdout/stderr are under `requestedInvocation`.

## Every-case comparison

Each row below is identical in both new runs, the committed receipt's selected family, and both retained original attempts. All fields objects are complete, not subsets.

| Case | Input | Status | Exact errorText | fields | submitCount |
|---|---|---|---|---|---:|
| `decl-select-multiple-01` | `{"colors":["red","blue"]}` | `Completed` | `null` | `{"colors":["red","blue"]}` | 1 |
| `decl-select-multiple-02` | `{"colors":["red","invalid"]}` | `Error` | `Invalid value for parameter colors` | `{"colors":[]}` | 0 |
| `decl-select-multiple-03` | `{"colors":"red"}` | `Error` | `Invalid value "red" for parameter colors` | `{"colors":[]}` | 0 |
| `decl-select-multiple-04` | `{"colors":[]}` | `Completed` | `null` | `{"colors":[]}` | 1 |

The complete observed schema is equal throughout: object; `properties.colors.type = "array"`; items type `string`, enum `["red","green","blue"]`, and matching `anyOf` const/title entries; `uniqueItems = true`; description `Colors`; `required = []`. The comparison checks the entire schema, not only the four case-declared dot paths.

The retained structured comparison performed **8 new-run-to-committed family comparisons** and **16 new-run-to-original-raw-attempt comparisons**, all equal. It independently checked raw `invokeTool` input, `toolsAdded` schema, `toolResponded` payload, page control fields/selected values, submit-call count, and raw-summary self-consistency. Complete expected objects matched the cases file and committed receipt. It also checked exact error text including null, a stricter comparison than the harness's substring/null expectation handling.

All eight new case records had empty navigation-violation, download, new-Playwright-artifact, and blocked-external-request arrays. Runtime identity was exactly **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**, including the same Chromium launcher/real-executable hashes as the committed receipt.

The two full receipts differ at exactly **17 paths**: their `generatedAt` and 16 frame/invocation-identifier paths. After removing only those transport identifiers from case records, the entire records agree with each other and the committed family records; no input, expectation, response output, error, field, schema, or hazard difference was suppressed. This establishes no observed behavioral nondeterminism for these two runs, not a universal determinism guarantee.

## Field encoding and decision depth

`expect.fields` represents **post-invoke control state**, not the fixture's flattened submission object:

- Case 01 has `selectedValues = ["red","blue"]`, and both the raw probe and new harness record that array. The select's scalar `.value` is `red`, whereas `Object.fromEntries(new FormData(form))` and `toolResponded.output.fields` contain `{"colors":"blue"}`. Both representations are preserved and agree across evidence; substituting either scalar for the selected array would be wrong.
- Case 04 has `fields = {"colors":[]}` while the submission/response fields are `{}`. An empty selected array is not null and is not an absent control.
- This family contains no checkbox/radio control and no unnamed non-button control. Its unnamed submit button is excluded by the field reader (`scripts/webmcp-validation-round19.mjs:856-891`); neither new fields object contains an empty-name key. The L1 checkbox string/null and unnamed-control conventions therefore cannot be runtime-validated by this select-only family, and are not claimed here.
- The case SHA matches the original family report's recorded SHA at `.ufo/waves/round-19/w1/FamSelectMultiple.md:38`; its array-vs-FormData distinction is explicit at line 26. More importantly, current expectations agree directly with both retained raw control snapshots. No expectation re-encoding discrepancy was found for the assigned family.

`validation/decisions.json` names **DV-14**: invalid-member array case 02 and bare-string case 03, with successful control 01. Both rejected inputs left selections empty and did not submit. Empty-array case 04 additionally reproduces the claimed success state. The emitted `uniqueItems:true` does **not** establish duplicate-input rejection: duplicate input was not exercised, and no such extra decision is claimed.

## Source and retained evidence

I re-read and decoded-hashed the committed source body; I did not perform a network source refetch. Access date: **2026-10-21**. Source URL: <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT>.

- `form_mcp_schema.cc:408-410`: `const JSONArray* array = JSONArray::Cast(&value); if (!array) { return false;` — the non-array rejection path.
- `form_mcp_schema.cc:413`: `// Each value in the array must have a corresponding option.` — the option-membership decision.
- Decoded-body SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, matching the retained raw probe and DV-14 source binding. Schema lines 752-759 and fill lines 1021-1054 were also read.

SHA-256 pins:

| Artifact | SHA-256 |
|---|---|
| Unmodified R producer | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| Selected cases JSON | `6d7b8bc6ca7cfd756a0672458d57546439ba9a0f4c7750277ed8b3019f1c47a7` |
| Selected fixture HTML | `b5aa24ac70de9b911984695f28ff1285da141d5cad128b022bda00b3976643b3` |
| Original raw family probes | `53e920157ef8d8c1953dc3b85b08f8e835b66a941dde097d179dd1bbe55cdee7` |
| R committed receipt | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| New replay 1 receipt | `a697192db0dee8019d9186656ac64785eac09e2719faff4e4dfe5cda39936189` |
| New replay 2 receipt | `91d292f6375378e5932ae64ddf12d5df877c091b312e26b0c31951e116f6744b` |
| Retained comparison JSON | `0e515dafe8e1009913add6dbfa6bbf282d98f61cd2839e28350c23e476ea81ad` |

Files written, all exclusively owned advisory artifacts under `.ufo/waves/round-19/w2/`:

1. `RuntimeSelectMultiple.md` — this report.
2. `RuntimeSelectMultiple.json` — exact argv/cwd/PATH prefix, exit codes, full stdout/stderr, receipt hashes, input metadata, runtime/digest checks, every comparison, original raw projections, encoding review, and bounds.
3. `RuntimeSelectMultiple.receipt.json` — unchanged 11,373-byte replay 1 receipt.
4. `RuntimeSelectMultiple.run2.receipt.json` — unchanged 11,373-byte replay 2 receipt.

## Risks, blockers, and execution limits

- The wave's `--fixtures` spelling is unsupported; the exact failure and parent-confirmed supported replay are both retained. There is no remaining runtime blocker for this family.
- Optional historical provenance inspection could not resolve the original writer commit cited by `.ufo/waves/round-19/w1/FamSelectMultiple.md:52` in this sandbox. The two read-only `git show` attempts exited 128 and are retained in the JSON. I do not claim its original commit blob was inspected; this does not limit the direct comparison of the present, R-bound cases/receipt/raw probes.
- Conclusions are limited to this family on the pinned, fresh-profile loopback runtime. No real site, private browser profile, TCP DevTools port, other family's runtime, or external state was used.
- The unchanged harness's cleanup acceptance (`scripts/webmcp-validation-round19.mjs:1227-1231,1300-1301`) ran before each receipt was emitted; no separate survivor-process audit was performed. No deliberately persistent process was started.
- No tools were installed or updated. No build, lint, formatter, full suite, mutation probe, commit, or push was run. Only the assigned exact-command attempt and two single-family runtime probes were executed, followed by structured evidence comparisons.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeSelectMultiple`
- Branch: detached at attacked checkpoint R, as required by the falsification override.
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (runtime sandbox; not a B-based production writer).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit.
- Changed production paths: none. The harness, cases, fixtures, committed receipt, raw probes, and source bodies were read-only. Direct LANE writes were only the four seat-owned advisory files listed above.
