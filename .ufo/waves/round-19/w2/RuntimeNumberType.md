# RuntimeNumberType — round 19 wave 2 falsification

## Scoped result

**C1 `number-type`: no counterexample found in the five frozen cases at R.** Two supported-CLI replays each exited **0**, with **5/5 cases passed, 0 failures, 0 findings**. Every case's input, complete expectation, status, exact error text (including null), complete field object, submit count and complete observed schema agrees with the committed receipt and both original raw-probe repeats. The independent comparison performed 468 explicit checks with **0 mismatches**; these are comparison checks, not 468 distinct browser cases.

Axis: **depth**. Guardrails: calibration (bounded claims and retained invocation failure), operability (reproducible supported command), isolation (unchanged producer, no production writes). This is a scoped advisory finding, not a verdict on all C1 families or round admission.

## Invocation-contract defect and resolved replay

The assignment's literal `--fixtures` command is unsupported at R. It exited **2**, emitted no stdout and created no receipt. Full stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

This is a **wave-prompt invocation-contract defect**, not a number-type behavior mismatch. R's parser accepts only `--cases`, `--out`, and help (`scripts/webmcp-validation-round19.mjs:194-211`); fixtures are resolved as the sibling `fixtures` directory (`:1241-1242`). The L1 subsequently explicitly confirmed this correction. No harness edit or compatibility shim was used.

The fresh temporary parent was `/tmp/tabi-r19-RuntimeNumberType-cases-a22CZi`. Its `cases/` contained only `number-type.json`; its sibling `fixtures/` contained only the matching `number-type.html`. Both copies were regular files, not symlinks, and byte-identical to R:

| File | Bytes | SHA-256 |
|---|---:|---|
| `cases/number-type.json` | 4152 | `8dc00aa78934c2af2fc9e75d79b51977cf4fae5901c2bdc366ccdef70ea09557` |
| `fixtures/number-type.html` | 814 | `cd10314d21f9ca33ff3004f987bdf1737df215ce18fa0bf2e8776db530a72af0` |

Working directory for all invocations: `/fast/scratch/tabi-r19/fx-RuntimeNumberType`. The Node installation's `bin` directory was first in the child process PATH. Exact supported commands:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNumberType/scripts/webmcp-validation-round19.mjs --cases /tmp/tabi-r19-RuntimeNumberType-cases-a22CZi/cases --out /tmp/tabi-r19-RuntimeNumberType-cases-a22CZi/run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeNumberType/scripts/webmcp-validation-round19.mjs --cases /tmp/tabi-r19-RuntimeNumberType-cases-a22CZi/cases --out /tmp/tabi-r19-RuntimeNumberType-cases-a22CZi/run-2.receipt.json
```

Run 1: started `2026-10-21T08:41:36.323449+00:00`, duration 2.932 s, exit 0. Run 2: started `2026-10-21T08:41:39.255300+00:00`, duration 2.999 s, exit 0. Both had empty stderr. Full stdout, exact rejected/supported argv, command strings, exits, receipt paths and hashes are retained in `RuntimeNumberType.json`.

## Every-case observations

All five cases announced the same complete schema:

```json
{"type":"object","properties":{"n":{"type":"number","multipleOf":1,"description":"Number"}},"required":[]}
```

| Case | Exact JSON input | Status | Exact errorText | Fields | submitCount |
|---|---|---|---|---|---:|
| `decl-number-type-01` | `{"n":42}` | `Completed` | null | `{"n":"42"}` | 1 |
| `decl-number-type-02` | `{"n":"42"}` | `Completed` | null | `{"n":"42"}` | 1 |
| `decl-number-type-03` | `{"n":"not-a-number"}` | `Error` | `Invalid value "not-a-number" for parameter n` | `{"n":""}` | 0 |
| `decl-number-type-04` | `{"n":true}` | `Error` | `Invalid value "true" for parameter n` | `{"n":""}` | 0 |
| `decl-number-type-05` | `{"n":1.25e+21}` | `Completed` | null | `{"n":"1.25000e+21"}` | 1 |

These independently reproduce `decisions.json` DV-09 (`:212-237`) and DV-10 (`:238-263`), also presented at `SKILL.md:2068-2069`. The success control is `decl-number-type-01`. Acceptance of a numeric string despite schema type `number` is observed behavior, not proof of strict JSON Schema type enforcement.

### Comparison method and encoding audit

- Compared source case input and complete `expect` against each fresh receipt's input/expected and the committed family receipt entries.
- Compared status, errorText, fields, submitCount and **full** observed schema, not merely the `properties.n.type` predicate. Used canonical JSON equality to preserve scalar types and all field/schema keys; did not collapse booleans and numbers through Python equality.
- For all ten original raw observations, checked the actual `invokeTool.params.input`, parsed `toolInvoked.params.input`, correlated invocation ids, `toolResponded` status/errorText, `toolsAdded` schema, submit-listener call count, and DOM `controlStates` values against the recorded summaries and both fresh replays. For successes, submitted and responded fields also matched DOM fields. Raw protocol errors were null.
- Fresh replies similarly retain actual `toolInvoked` input and `toolResponded` status/errorText/output; invocation ids correlate within each case. All fresh command errors were null.
- No L1 field re-encoding was needed in this family: its only control is named `n`, and every expected field value is the actual DOM **string**, including the empty string after rejection and the exponent's `1.25000e+21`. Original raw control states, submit-listener data, committed receipt, and both reruns agree. There are no checkbox/radio or unnamed controls in this fixture; checkbox string/null and empty-name-key behavior are **not assessed** by this seat. The shared reader's applicable implementation is `scripts/webmcp-validation-round19.mjs:856-894`.
- All fresh `blockedExternalRequests`, `downloadEvents`, `navigationViolations` and `newPlaywrightArtifactFiles` arrays were empty.

**No nondeterminism observed in the requested semantic fields across these two replays.** Raw receipts are not byte-identical because timestamps and synthetic frame/invocation ids vary. The normalized projection (case id/family/input/expected/pass plus the five observed fields) has identical SHA-256 in both runs: `acaaacddc5b188522b17fd0d5d7e81fb6d6e4c9356d6b612ab165726d994c7d0`.

## Exact retained evidence and provenance

All paths in this table are relative to the lane:

| Artifact | Purpose / SHA-256 |
|---|---|
| `.ufo/waves/round-19/w2/RuntimeNumberType.json` | Complete execution records, full stdout/stderr, input-copy proof, all per-case observations and 468 named comparisons, provenance, encoding audit and limits |
| `.ufo/waves/round-19/w2/RuntimeNumberType.receipt.json` | Unmodified first replay receipt, 8932 bytes; `6e1a4fe7ab74bd68d977512e82a6717b8b3fabb04afddbb8e86071e7277256f0` |
| `.ufo/waves/round-19/w2/RuntimeNumberType.repeat.receipt.json` | Unmodified second replay receipt, 8932 bytes; `dd032fd3c981b13657a9d435b22566f8a3a18c6fc92b68152f3aadb47c5cf236` |
| `corpus/evidence/round-19/validation/receipt.json` at R | Committed comparison authority; `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `corpus/evidence/round-19/validation/probes/number-type.json` at R | Both original raw repeats; `2d28d0a14e086b84e61aae014cd7385dd5ca27bb6753a1a1fbdbe2e9368e4bc1` |
| `scripts/webmcp-validation-round19.mjs` at R | Unchanged producer; `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |

The actual producer digest equals the producerSha256 in the committed receipt and both reruns. Case/fixture digests match the committed and fresh receipts. Complete runtime identity objects also match: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Chromium launcher digest: `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`; real executable digest: `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.

### Retained source body opened

Opened the committed, decoded Chromium source body on **2026-10-21**; no new network fetch was performed. Location: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`, decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. Recorded source URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT .

- `form_mcp_schema.cc:49-62`, `ToString`: `out = String::Number(d);` supports the numeric serialization path.
- `form_mcp_schema.cc:321-335`, `ValidateNumberData`: `!input->SanitizeValue(number_string).empty()` is the sanitizer acceptance check.
- Also inspected `:208-230` (invalid-value return path) and `:703-731` (number schema construction). The actual behavior claims above rest on the replay and raw observations, not source plausibility alone.

## Risks, blockers, tooling and boundaries

The original command was blocked only by the supplied unsupported flag; the L1-authorized sibling-copy invocation resolved execution. No outstanding blocker for this scoped replay. No production defect or proposed production edit is asserted.

Scope remains the five specified cases on the pinned Chromium build and loopback fixture. This does not establish behavior for nulls, arrays, objects, additional exponents, fractional-step values, other Chromium builds, real sites, strict schema enforcement, or other families.

The unchanged harness uses fresh private HOME/profile/temp paths, loopback routing and pipe CDP, and rejects TCP DevTools/sandbox-disabling switches (`:492-530`, `:591-630`). Both run processes returned after the harness's cleanup assertion (`:1167-1231`, `:1300-1302`), which requires every owned browser gone, removed temp paths, closed server and no strays. No separate PID sampler was run. No background job or agent was started.

No build, lint, formatter or full suite was run; only the assigned invocation attempt and two scoped browser replays. No tool was installed or updated. No LSP-capable tool was exposed in the mounted tool inventory, and this receipt/source-literal audit required no symbol definition/reference/refactor operation. Tool-device limitations encountered during artifact reading/terminal allocation were reported through `xd://report_issue`; they did not affect the browser outcomes.

Direct lane writes are exactly this report and the three seat-owned evidence artifacts above. No corpus, scripts, other report, global configuration, real browser profile, external substrate or domain source tree was modified. L1 owns integration and any full-suite gate.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeNumberType`
- Branch: detached HEAD (falsification clone, not a production writer)
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, per falsification-specific override)
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit
- Changed production paths: none; producer/cases/fixture/probes in the clone were not edited
- Lane advisory paths: `.ufo/waves/round-19/w2/RuntimeNumberType.md`, `.ufo/waves/round-19/w2/RuntimeNumberType.json`, `.ufo/waves/round-19/w2/RuntimeNumberType.receipt.json`, `.ufo/waves/round-19/w2/RuntimeNumberType.repeat.receipt.json`

## Follow-up — L1-assigned C1 counter repair

The preceding report and JSON/receipt artifacts describe the completed replay assignment and remain unchanged as historical evidence. After that delivery, the L1 assigned a separate implementation slice for the counter weaknesses in `w2/Decision02.md`, `Decision10.md` and `Decision14.md`, explicitly authorizing one production file in this seat's private clone. This section supersedes the earlier no-production-change/no-new-commit statements **for that follow-up only**; it does not assert a new browser outcome.

**Delivered commit:** `c481684f6de4b48de2321af35db2f49087178606`.
**Only committed path:** `.ufo/waves/round-19/measure-c1.mjs`.
**Import source:** `/fast/scratch/tabi-r19/fx-RuntimeNumberType`, branch `r19/RuntimeNumberType-counterrepair`, based at R.

### Implemented behavior

- The receipt comparison now retains complete stable `observed.fields`, `observed.schema` and `observed.commandError`, plus semantic raw invocation name/input and raw response status/error/output. Raw invocation input is parsed as JSON for typed comparison. Synthetic invocation/frame ids are deliberately excluded from cross-run equality.
- Both fresh and committed records are independently re-evaluated against their source case expectations: status, submit count, error substring, every expected field, and every expected schema path. `errorTextIncludes: null` now requires null error text rather than acting as a don't-care. Missing expected field keys are rejected even when the expected value is null. Existing `pass: true` remains necessary but is no longer sufficient.
- Within each receipt, required raw invocation/response slots are checked for presence. A normal invocation requires a nonempty id, matching `toolInvoked` id, the case-defined tool name and JSON input, and a present `toolResponded` whose id/status/error agree with the summarized observation. A response's toolName, if supplied, must also agree. Missing or contradictory raw evidence rejects the decision.
- The legitimate top-level nonobject path remains distinct: a no-response case must have nonobject input, an Invalid-parameters command error, null invocation/raw events, no error text and zero submits. It does not require an invented invocation or response. An object-shaped input cannot claim that protocol-only rejection.
- Raw response output is compared across receipts, **not** equated with DOM fields. This preserves the documented multiple-select FormData collapse and unnamed-control distinctions.
- SKILL Condition and Answer/outcome cells are now bound to the manifest strings. Normalization removes only inline-code backticks, escaped table pipes and whitespace differences; wording, punctuation and case remain binding.
- The parser uses one unique `### Declarative WebMCP input-validation decision table — corrected (round 19)` heading when present, otherwise the original heading. Duplicate corrected headings fail closed; a correction cannot silently fall back to the historical table.
- The pre-round branch with neither manifest nor either heading still returns the existing evaluated zero result with exit 0. A finite fixture scenario documents that path.

### Finite self-test coverage added, not executed

The existing fixture-mode self-test now creates complete stable observations and internally correlated raw events. Fresh fixture receipt ids differ from committed fixture ids by construction, so its positive cases guard against accidental cross-run volatile-id equality. Added scenarios cover changed/missing fields (including a missing null-valued expected key), a missing fields object, changed schema, matching bad fields in both receipts, contradictory/missing raw response, mismatched response id, wrong raw tool/input, unexpected command error, strict null-error expectation, changed SKILL Condition/Answer with retained identifiers, preferred/duplicate corrected tables, formatting-only normalization, and legitimate array/string/null no-response cases. Existing status/control mutant expected reasons were updated for independent validation.

These are **implemented test cases, not observed passes**. As directed, no counter, self-test, syntax check, browser replay, build, lint, formatter or other verification command was run for this follow-up. The earlier five-case replay results do not verify this later counter change.

### Evidence, risks and parent-owned checks

Observed implementation evidence consists of the surgical edit results and the path-restricted private-clone commit command, which returned `c481684f6de4b48de2321af35db2f49087178606`. No git diff/status re-audit was run. Commit hooks and signing were disabled only for that command to avoid running unassigned hooks or accessing signing material.

LSP was actually unavailable: reading `xd://lsp` returned `No such tool: xd://lsp`, with only REA devices mounted. Definitions/call sites were read directly in the one assigned script and literal searches were not presented as semantic LSP results. No tool was installed or updated.

Remaining integration prerequisite: the L1's corrected full table must render the canonical manifest Condition/Answer strings under the exact corrected heading; semantic source entailment remains a human review responsibility, not a token-presence or normalization guarantee. All counter behavior and finite self-test expectations are unverified until the L1 gate.

Recommended L1 post-integration gates, using the absolute pinned Node 24.21.0 binary: the counter's `--self-test --no-reproduce`, baseline B count/exit (0/0), then the integrated revision's real C1 reproduction/count after all sibling changes land. This seat did not execute them.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeNumberType`
- Branch: `r19/RuntimeNumberType-counterrepair`
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`
- Commit: `c481684f6de4b48de2321af35db2f49087178606`
- Changed committed paths: `.ufo/waves/round-19/measure-c1.mjs` only
- Direct LANE follow-up write: append to `.ufo/waves/round-19/w2/RuntimeNumberType.md` only; earlier seat JSON/receipts were not changed
- No LANE production edit, fleet/sibling/JJ write, delegation, background job, external-state mutation or follow-up check was performed
