# RuntimeMissingRequired — round 19 W2 falsification

## Result and axes

**C1 `missing-required` was not falsified at R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.** Both unchanged-harness replays exited **0**, each with **4 cases / 4 passed / 0 failed / 0 findings** (8 fresh case executions). All requested input/expectation/status/errorText/fields/submitCount/schema comparisons agree with the committed receipt and retained family probes. No behavioral nondeterminism was observed across these two replays; this is not a universal determinism proof.

Axes examined: **depth** (the two fill-time versus submit-time decisions DV-06/DV-07 and their success control), **freshness** (independent pinned-runtime reproduction), **operability** (actual supported argv), **calibration** (exact values, representation changes, and limits). No production move or axis score is claimed by this advisory seat.

**Invocation-contract defect found:** the supplied `--fixtures` option is unsupported at R. The exact requested invocation exited **2**, stdout was empty, stderr was:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

No receipt was emitted and no browser launched for that invocation. L1 subsequently confirmed this was a wave-prompt error. The producer accepts `--cases`/`--out` and derives fixtures from the cases directory's sibling `fixtures` directory (`scripts/webmcp-validation-round19.mjs:194-211,1234-1242`). The supported replays below preserve the producer bytes.

## Isolation and actual commands

The private clone is `/fast/scratch/tabi-r19/fx-RuntimeMissingRequired` at R. The completed replays used a fresh outside-clone parent `/fast/scratch/tabi-r19/fx-RuntimeMissingRequired-input-9579oaa5` with exactly these **regular, non-symlink copies**:

- `cases/missing-required.json` — 4425 bytes; SHA-256 `31fc30460d6427c719e774d38784fadd39faeef26c533c7e9b86f27c66889e5c`.
- `fixtures/missing-required.html` — 1097 bytes; SHA-256 `bfadfce920424be159807251a1432c986d6e7a724024434e6baf0c3224fc4822`.

An initial temporary in-clone cases directory used only for the rejected requested argv was removed before the supported replays. Neither clone production files nor LANE production files were edited.

Node's absolute binary was used, with its bin directory first in the child process PATH; exact argv, cwd, PATH, exit, complete stdout/stderr and receipt SHA-256 for all three invocations are retained in `RuntimeMissingRequired.json`. Supported argv:

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeMissingRequired/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeMissingRequired-input-9579oaa5/cases --out /fast/scratch/tabi-r19/fx-RuntimeMissingRequired-evidence-5hhcjh_5/run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeMissingRequired/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeMissingRequired-input-9579oaa5/cases --out /fast/scratch/tabi-r19/fx-RuntimeMissingRequired-evidence-5hhcjh_5/run-2.receipt.json
```

Observed runtime for both replays exactly equals the committed receipt: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. Chromium executable digest also agrees: `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`. Producer digest `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` agrees with both fresh receipts and the committed receipt.

| Replay | Exit | Cases / passed / failed / findings | Receipt SHA-256 |
|---|---:|---|---|
| 1 | 0 | 4 / 4 / 0 / 0 | `12965d302d7125152f478c35557797c09a6704136d774839effd34ebfe353e7e` |
| 2 | 0 | 4 / 4 / 0 / 0 | `a41ea370a5e6b3a0ea484ec792e3e6285e60e37593e442e4b34ab4afccf54254` |

The receipts are not byte-identical: `generatedAt`, frame IDs and invocation IDs changed in all four cases. After excluding only these volatile protocol identities/timestamps from the appropriate comparisons, full stable observations match. Error text is compared exactly, including the final U+0020 in E1 below; it is not trimmed.

## Every case and expectation

Exact observed errors (JSON string notation):

- **E1:** `"Form validation failed: required: Please fill out this field.. "`.
- **E2:** `"Invalid value for parameter required"`.

These raw errors are retained at `probes/missing-required.json:84-98,149-163,214-228,279-308,311-367` and reproduced in both fresh receipts. Case expectations use E1 without its final space as a substring, E2 as the full error string, and null for the successful control's error expectation.

| Case | Exact input | status / error | Exact post-invoke fields | submitCount | Comparisons |
|---|---|---|---|---:|---|
| `decl-missing-required-01` | `{}` | Error / E1 | `{"required":"","optional":"optional-default"}` | 0 | all agree |
| `decl-missing-required-02` | `{"required":""}` | Error / E1 | `{"required":"","optional":"optional-default"}` | 0 | all agree |
| `decl-missing-required-03` | `{"required":null}` | Error / E2 | `{"required":"","optional":"optional-default"}` | 0 | all agree |
| `decl-missing-required-04` | `{"required":"provided-required"}` | Completed / null | `{"required":"provided-required","optional":"optional-default"}` | 1 | all agree |

Every full announced input schema is identical across the committed receipt, all four first-run raw probe records, and both fresh replays:

```json
{"type":"object","properties":{"required":{"type":"string","description":"Required text"},"optional":{"type":"string","description":"Optional text"}},"required":["required"]}
```

The comparison checks every case's JSON input (including CDP toolInvoked input), the entire `expect` object against committed/fresh receipt `expected`, exact status/errorText/field map/submit count, full schema including descriptions, all asserted schema dot paths, command errors, and stable tool response payloads. Raw probes contain observations rather than `expect` objects, so every expected status/error substring/field/submit/schema assertion was independently evaluated against their retained observations. The null error expectation on the success control was additionally required to be actual null, stronger than the harness's null-as-no-substring-check behavior.

`repeatRun` in the original probe retains responses and form states but **not a second full schema**. Its inputs/status/errorText/fields/submit counts agree; schema agreement for that original repetition cannot be independently checked from that record. Both new replays retain and agree on the full schema.

**L1 expectation re-encoding check:** the original author commit `2298b9ceda3e01d3f465c903e9fbcdef585793f3`, queried read-only in `/fast/scratch/tabi-r19/FamMissingRequired-4`, has byte-identical case JSON at R (SHA `31fc30460d6427c719e774d38784fadd39faeef26c533c7e9b86f27c66889e5c`). There was **no L1 case-expectation re-encoding in this family**. The fresh R clone does not contain that separate author commit object; the initial lookup failure was resolved by reading the declared original clone, not by inferring a provenance defect.

This fixture has two named text inputs and an **unnamed submit button**, not an unnamed data input (`fixtures/missing-required.html:8-11`). The actual field maps contain exactly `required` and `optional`; there is **no empty-name `""` key**. The harness correctly excludes the submit button (`scripts/webmcp-validation-round19.mjs:864-870`). There are **no checkboxes** here, so the L1 checkbox string/null convention is not exercised or credited. All expected and observed field values for this family are strings. Checkbox and unnamed-input decisions remain the other families' responsibility.

## Decision depth and source binding

The reproduction distinguishes **omitted/empty required text** (native interactive validation before submit, DV-06) from **JSON null** (fill-time value validation failure, DV-07), with the successful nonempty text case as their shared control. The optional default persists in every invocation and appears in the success response. This supports these fixture-scoped decisions; it is not evidence for a separate JSON-Schema `required` validator.

Read on **2026-10-21** from the committed decoded source bodies; no new network fetch was required:

- **S077**, `form_mcp_schema.cc:208-243,302-318`: “If the data isn't valid, form control states remain unchanged.” (line 210). Validation precedes application; empty text passes text validation at 311-312. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT . Decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- **S078**, `html_form_element.cc:718-758`: “Interactive validation must be done before dispatching the submit event.” (line 718). The failing-validation branch creates the returned message at 729-758. URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT . Decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

The exact source ranges and runtime agree with `SKILL.md:2065-2066` and `validation/decisions.json` DV-06/DV-07. No additional decisions are counted for the four case rows or for executing them twice.

## Retained evidence, risks and blockers

LANE-relative files changed (advisory evidence only):

1. `.ufo/waves/round-19/w2/RuntimeMissingRequired.md` — this report.
2. `.ufo/waves/round-19/w2/RuntimeMissingRequired.json` — all commands, full stdout/stderr, exit codes, receipt digests, per-case exact comparison results, input/producer/runtime bindings, source decoding, and resolved author-lookup evidence.
3. `.ufo/waves/round-19/w2/RuntimeMissingRequired.receipt.json` — replay 1, byte-exact.
4. `.ufo/waves/round-19/w2/RuntimeMissingRequired.run2.receipt.json` — replay 2, byte-exact.

Committed reference digests at R:

- Full validation receipt: `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`.
- Raw missing-required probe: `a8c2d7222db6cdee6d42bd3551c5bbbeb63635d0f2e35e06030805ea6a7d4ce6`.
- Cases/fixture/producer: hashes recorded above and in the JSON.

Both replay findings arrays and every case's navigation/download/artifact/blocked-request arrays are empty. Successful receipt emission follows the harness's cleanup assertion, which requires browsers gone, temporary paths removed, fixture listener closed, and no strays (`scripts/webmcp-validation-round19.mjs:1227-1231,1300-1302`). Both subprocesses were reaped. **No independent PID census was retained**; this seat makes no separate H1 cleanup claim.

Remaining scope limits: the required text input starts empty; omitted prefilled required controls and other required control types were not probed. Native validation wording is locale-dependent; both pinned-runtime replays reproduced the exact English retained messages. The invocation-contract defect is fully evidenced and was worked around only as directed by L1; there is no remaining blocker to this family comparison.

No production edits, suite/build/lint/formatter runs, tool installs/updates, commits, pushes, background jobs, delegation, real sites, real browser profiles, or TCP DevTools ports. No LSP interface is mounted in this seat (the `xd://` inventory exposes 207 REA devices, none for LSP); source inspection used targeted reads, not an empty cold symbol response. The compressed-source `read` adapter returned an empty archive directory / archive-selector error; this was reported to `xd://report_issue`, then the existing gzip binary decoded the two retained source bodies into seat-owned scratch for normal ranged reads.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeMissingRequired`
- Branch: `r19/fx-RuntimeMissingRequired`
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, per falsification-specific override; not B)
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (unchanged; no new commit)
- Changed production paths: none.
- Direct LANE writes: only the four `RuntimeMissingRequired.*` advisory files listed above.
- Outside-clone retained scratch: `/fast/scratch/tabi-r19/fx-RuntimeMissingRequired-input-9579oaa5` (regular input/fixture copies), `/fast/scratch/tabi-r19/fx-RuntimeMissingRequired-evidence-5hhcjh_5` (original receipts and decoded source evidence).
