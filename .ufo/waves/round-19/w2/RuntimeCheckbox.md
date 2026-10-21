# RuntimeCheckbox — C1 checkbox falsification at R

## Scoped result

The committed **five checkbox cases reproduce exactly in two independent harness processes: 5/5 + 5/5, exit 0, zero hazard findings**. Inputs, expectations, status, exact error text, complete fields, submit count and complete schema agree with the R receipt and normalized raw family probes. The L1 checkbox field re-encoding is faithful to the actual observations.

However, **DV-15's broader “single checkboxes take booleans only” statement is falsified**. Two supplemental, private checkbox cases send the strings `"true"` and `"false"`. Both complete and submit once, in each of two runs, although their intentionally claim-derived expectations predict Error. These are not failures of the five committed cases; they expose an overgeneralization in the admitted decision text.

Axes checked: **depth** (decision accuracy and field semantics), **operability** (runnable CLI), **calibration** (five passing examples versus the stronger boolean-only claim). This is a scoped advisory finding, not a round judgment or score change.

## Invocation-contract defect and supported replay

R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The assignment supplied `--fixtures`, but R's `parseArgs` accepts only `--cases`, `--out` and help (`scripts/webmcp-validation-round19.mjs:194-211`). It derives fixtures from the cases directory's sibling `fixtures` (`:1241-1242`). The literal flag-bearing invocation returned **exit 2**, empty stdout, and this complete stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

No literal-invocation receipt was produced; the artifact glob was empty before retention. Exact argv, cwd, start time and full streams are retained in `RuntimeCheckbox.json`, key `literalRequestedInvocation`. Its initially selected output was also inside LANE; argument parsing stopped before output-path checks. Supported replays instead wrote outside both LANE and clone and were copied into this seat's artifacts afterward.

The L1 clarification was followed without modifying producer bytes: fresh parent `/fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT` contains `cases/checkbox.json` and sibling `fixtures/checkbox.html`, both regular byte copies, no symlinks. The cases directory contains **only** `checkbox.json`. Copy SHA-256 equals the committed input SHA-256. Node's pinned bin directory was first in PATH; the executable itself was absolute.

Exact supported replay commands (cwd `/fast/scratch/tabi-r19/fx-RuntimeCheckbox`):

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeCheckbox/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT/cases --out /fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT/RuntimeCheckbox.run1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeCheckbox/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT/cases --out /fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT/RuntimeCheckbox.run2.receipt.json
```

Both stdout streams list `decl-checkbox-01` through `decl-checkbox-05` with `pass=true`, then `verdict=pass cases=5 passed=5 failed=0 findings=0`; stderr is empty. Complete, untrimmed streams and exits are in `RuntimeCheckbox.json` → `supportedReplays`.

## Every committed case compared

`fields` below are the post-invocation **inventory**, not the submit handler's FormData object. Each row was compared in both replays against the committed receipt and the raw probe's actual `invokeTool` input, `toolResponded`, full `toolsAdded.inputSchema`, `postInvokeStates` and `pageCalls`.

| Case | Input (`withoutValue`, `withValue`) | Observed status | Exact errorText | submitCount | Complete inventory fields |
|---|---|---|---|---:|---|
| decl-checkbox-01 | `true`, `true` | Completed | JSON null | 1 | `{"withoutValue":"on","withValue":"checkbox-choice"}` |
| decl-checkbox-02 | `false`, `false` | Completed | JSON null | 1 | `{"withoutValue":null,"withValue":null}` |
| decl-checkbox-03 | `"checkbox-choice"`, `"checkbox-choice"` | Error | `Invalid value "checkbox-choice" for parameter withValue` | 0 | `{"withoutValue":null,"withValue":null}` |
| decl-checkbox-04 | `"on"`, `"on"` | Error | `Invalid value "on" for parameter withValue` | 0 | `{"withoutValue":null,"withValue":null}` |
| decl-checkbox-05 | `"unrelated"`, `"unrelated"` | Error | `Invalid value "unrelated" for parameter withValue` | 0 | `{"withoutValue":null,"withValue":null}` |

Every case has this complete observed schema, not just the two asserted type paths:

```json
{"type":"object","properties":{"withoutValue":{"type":"boolean","description":"Without value attribute"},"withValue":{"type":"boolean","description":"With value attribute"}},"required":[]}
```

All independent comparisons agree; mismatch lists are empty. `RuntimeCheckbox.json` → `canonicalCaseComparisons` records each case's input, expected object, observed core, original fields, field conversion and individual comparison results. The comparison is strict about field-key inventory: it does **not** treat a missing field key as equivalent to a present null key.

Generated invocation IDs/frame IDs and receipt timestamps differ, as expected. They were excluded from outcome repeatability, not silently called identical. Parsed `toolInvoked.input` and `toolResponded` content apart from its generated invocation ID were compared. No nondeterminism was observed in the specified semantic dimensions across the two canonical replays; this is not a statistical or byte-for-byte determinism claim.

## L1 expectation re-encoding

The retained seat-original cases use checked-state booleans in `expect.fields`. R differs semantically at exactly **10 paths**: the two `expect.fields` members in each of five cases. All inputs, statuses, error expectations, submit counts, schema expectations, sources, questions and answers are unchanged. See the exact path list in `RuntimeCheckbox.json` → `expectationReencoding`.

- Checked true → control `.value` strings: default `"on"` and explicit `"checkbox-choice"`. Raw probe `postInvokeStates.checked` is true; its FormData, response fields and replay inventory agree.
- Checked false → inventory keys remain present with JSON null. The successful false case's actual FormData/response output is `{}`, not an object containing nulls. Raw false checked states and omitted FormData members justify the inventory conversion.
- Rejected string inputs → no submit, both unchecked, therefore both inventory values null.
- The fixture has two named checkbox fields plus an **unnamed submit button** (`fixtures/checkbox.html:7-10`). The field reader excludes button controls (`scripts/webmcp-validation-round19.mjs:860-891`), so neither replay invents a `""` field or schema property. This family cannot independently establish how an unnamed **non-button** control behaves; that belongs to the sibling family and is intentionally not claimed here.

## Scoped counterexample to DV-15

Affected R statements: `SKILL.md:2074`; `corpus/evidence/round-19/validation/decisions.json`, decision `DV-15` condition/answer; `corpus/knowledge/webmcp-declarative-validation-round-19.md:57-58`. The three committed rejected strings do not establish that every string is rejected.

A separate private two-case document retained as `RuntimeCheckbox.coercion.cases.json` encodes DV-15's own Error prediction for two boolean-coercible strings. It does not replace or alter the canonical input copy. Producer and fixture are unchanged and retain their R hashes. Two complete supplemental replays give:

| Private case | Input for both parameters | Actual status / errorText | submitCount | Inventory / submitted output |
|---|---|---|---:|---|
| decl-checkbox-06 | string `"true"` | Completed / null | 1 | inventory and FormData `{"withoutValue":"on","withValue":"checkbox-choice"}` |
| decl-checkbox-07 | string `"false"` | Completed / null | 1 | inventory both null; FormData `{}` |

Each supplemental harness run exits **1**, `cases=2 passed=0 failed=2 findings=0`, because both actual results contradict the intentionally claim-derived Error expectations. Both repeats agree in all compared dimensions; full receipts retain actual `toolInvoked` input and `toolResponded` output. This distinguishes a falsified decision generalization from a replay/environment failure.

Exact supplemental commands (same cwd and pinned Node):

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeCheckbox/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeCheckbox-coercion.eD41Nh/cases --out /fast/scratch/tabi-r19/fx-RuntimeCheckbox-coercion.eD41Nh/RuntimeCheckbox.coercion.run1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeCheckbox/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeCheckbox-coercion.eD41Nh/cases --out /fast/scratch/tabi-r19/fx-RuntimeCheckbox-coercion.eD41Nh/RuntimeCheckbox.coercion.run2.receipt.json
```

The retained primary source corroborates the runtime result. `form_mcp_schema.cc:71-91`, function `ToBoolean`, accepts JSON booleans, integers and selected strings; `ValidateCheckboxData:337-343` calls it. Verbatim quote at `:82` (≤25 words):

> `if (EqualIgnoringAsciiCase(s, "true") || s == "1") {`

URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT  
Access date: **2026-10-21** (opened the R-retained decoded body, no new network fetch).  
Decoded-body SHA-256, independently recomputed with `gzip -dc … | sha256sum`: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.

Only the strings `"true"` and `"false"` were independently added to this seat's runtime probe. Other accepted strings and integer coercion are source-observed, not separately runtime-tested here. A defensible correction would distinguish the three tested rejected value strings from boolean-coercible strings; it must not equate emitted boolean schema with strict JSON-boolean enforcement. No production correction was made by this seat.

## Retained evidence and identities

All paths below are under LANE `.ufo/waves/round-19/w2/`:

| Artifact | SHA-256 / purpose |
|---|---|
| `RuntimeCheckbox.json` | `181fe67b7a55b29a204db7d991e872110fcb264e2f1967856d68472f484e0978` — full commands, exits, streams, hashes, comparison records, source and isolation |
| `RuntimeCheckbox.receipt.json` | `34443cedb2968c2b0a4317d18078e22407aeca8a9487b3b7b679565c796361a5` — canonical replay 1 |
| `RuntimeCheckbox.repeat.receipt.json` | `cade46737d1b1392c17c68344553b9839d1dc9e505d58c9594df6c24e1a8c76d` — canonical replay 2 |
| `RuntimeCheckbox.coercion.cases.json` | `35db162f5484320d903e71f29c5c86644c60424d7e4d53078c0786d2d20ca00f` — private falsification hypotheses |
| `RuntimeCheckbox.coercion.receipt.json` | `f5221b4d7b1e391054d7098abda60b349893a4eec1dafd89acf6c23d27fb84a6` — supplemental replay 1 |
| `RuntimeCheckbox.coercion.repeat.receipt.json` | `f42453853a84952216c7c62f3e68fccace83fcfc5489cfc47faff37ac621c385` — supplemental replay 2 |
| `RuntimeCheckbox.md` | this advisory report |

R input identities:

- Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- Canonical cases: `a752fb041e4134bcbca19e35cb7630caf11df919626e3dee5f78bda4d936b385`.
- Fixture: `defdadd1408037a052a5af368d77464b4b992ccff295329ce8efb6ea1bc4753b`.
- Committed receipt: `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`.
- Raw probe: `e66d6343a422554ce2edb7e85b9ad3f5d6795b1d0f85cc639c6fec7f8da167a2`.
- Seat-original cases: `ca1f1afe0ca4f24b17a421c77db655953ecd0c6d0265f2d0bec53204aea4f57e`.

All four fresh receipts identify **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Actual Chromium executable: `/usr/lib/chromium/chromium`, SHA-256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`. Runtime identity and producer/cases/fixture bindings match R.

## Limits, safety, tooling and blockers

- Only this family's scoped browser probes were run; no build/lint/test suite, formatter, C1 counter or full validation suite. The original six supplemental isolated-input raw-probe records were read, not independently rerun.
- Fresh private profiles, loopback fixtures and pipe CDP only. No real site, operator browser profile, credentials, TCP DevTools endpoint, host service or domain source mutation.
- R writes each receipt only after `cleanup()` and `assertCleanupComplete()` (`scripts/webmcp-validation-round19.mjs:1300-1301`; predicate `:1227-1231`). All four completed with their receipts and no cleanup error; the assertion covers run-owned browser processes, temporary paths, server closure and strays. No persistent process was launched by this seat.
- No tool installs or updates. The mounted tool inventory exposed no LSP route; no production symbol refactor was attempted.
- The invocation-contract defect was bypassed only through the supported CLI, per both L1 clarifications. No runtime blocker remains. The DV-15 overclaim is a routed finding for the integrator, not silently repaired here.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeCheckbox`.
- Branch: detached HEAD (report-only sandbox, not a production writer branch).
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (attacked checkpoint R, per falsification-specific override).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit.
- Changed production paths: **none**; producer, cases, fixture and committed evidence in the clone were read-only.
- Private probe roots: `/fast/scratch/tabi-r19/fx-RuntimeCheckbox-cases.r5uZpT` and `/fast/scratch/tabi-r19/fx-RuntimeCheckbox-coercion.eD41Nh`.
- Direct LANE writes: only the seven exclusive `RuntimeCheckbox.*` report/evidence artifacts listed above. No git writes in LANE; no sibling files or global configuration touched.
