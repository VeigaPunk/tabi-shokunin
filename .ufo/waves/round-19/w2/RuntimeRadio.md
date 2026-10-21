# RuntimeRadio — round 19 wave 2

## Scoped result

**C1 `radio` runtime behavior reproduced at R; no behavioral counterexample found in this family.** Two regular-copy replays each exited **0**, with **3/3 cases passing, 0 findings**. Every case input, complete expectation object, status, exact error text, post-invoke field inventory, submit count, and complete input schema agrees with the committed receipt and both committed raw probe rounds.

Axis under examination: **depth**. Evidence guardrails: repeatability, honest expectation encoding, and writer isolation. This is a scoped falsification result, not a judgment of the complete C1 claim or the round.

The requested `--fixtures` command exited **2** before evaluation. The L1 confirmed that the wave prompt supplied an unsupported flag. Its failure is retained as an **invocation-contract defect**, separately from the successful supported replays.

## Revision and input isolation

- Private clone: `/fast/scratch/tabi-r19/fx-RuntimeRadio`.
- Attacked revision R / observed clone HEAD: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Fresh scratch parent: `/fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c`.
- `cases/` contains only `radio.json`; it is a regular file, not a symlink.
- For the two counted replays, sibling `fixtures/` is a regular directory containing only the regular file `radio.html`. Both files are byte-identical to their R originals.
- Outputs were new paths outside the clone. Producer, case, fixture, committed receipt, and raw probes were not edited.
- One earlier exploratory supported replay used a sibling fixture-directory symlink and passed 3/3. After the L1 clarified regular-copy requirements, that symlink was removed and replaced with the regular directory/file described above. The exploratory result is preserved in `RuntimeRadio.json` under `supersededSetupReceipt` and **is not counted** toward the two regular-copy results.

## Commands and outcomes

All commands used this absolute Node binary, with its bin directory first in PATH:

`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`

Cwd was `/fast/scratch/tabi-r19/fx-RuntimeRadio`; the child-local `TMPDIR` was `/tmp`. The unchanged harness owns fresh private browser profiles and uses pipe CDP over local fixtures; no TCP DevTools port or real site was used.

### Exact requested invocation

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeRadio/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/cases --fixtures /fast/scratch/tabi-r19/fx-RuntimeRadio/corpus/evidence/round-19/validation/fixtures --out /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/required-cli.receipt.json
```

Observed exit: **2**. Full stdout: empty. Full stderr:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

No receipt was created. At R, `scripts/webmcp-validation-round19.mjs:194-210` parses `--cases`/`--out`, while `:1241-1242` derives the fixture directory from the cases directory's sibling. The compatibility replay followed the L1 clarification without changing producer bytes.

### Supported regular-copy replays

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeRadio/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/cases --out /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/regular-copy-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeRadio/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/cases --out /fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/regular-copy-2.receipt.json
```

Both exited **0**, both stderr streams were empty. Run 1 full stdout:

```text
WEBMCP_VALIDATION_CASE id=decl-radio-01 pass=true
WEBMCP_VALIDATION_CASE id=decl-radio-02 pass=true
WEBMCP_VALIDATION_CASE id=decl-radio-03 pass=true
WEBMCP_VALIDATION verdict=pass cases=3 passed=3 failed=0 findings=0 out=/fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/regular-copy-1.receipt.json
```

Run 2 full stdout:

```text
WEBMCP_VALIDATION_CASE id=decl-radio-01 pass=true
WEBMCP_VALIDATION_CASE id=decl-radio-02 pass=true
WEBMCP_VALIDATION_CASE id=decl-radio-03 pass=true
WEBMCP_VALIDATION verdict=pass cases=3 passed=3 failed=0 findings=0 out=/fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c/regular-copy-2.receipt.json
```

## Per-case comparison

The following values match the committed receipt and both regular-copy replays. The case-file input and full `expect` objects also match each receipt's `input` and `expected` exactly.

| Case / raw-probe ID | Input | Status | Exact errorText | submitCount | Observed fields |
|---|---|---|---|---:|---|
| `decl-radio-01` / `valid-beta` | `{"choice":"beta"}` | `Completed` | `null` | 1 | `{"choice":"beta"}` |
| `decl-radio-02` / `invalid-unknown` | `{"choice":"not-an-option"}` | `Error` | `Invalid value "not-an-option" for parameter choice` | 0 | `{"choice":null}` |
| `decl-radio-03` / `disabled-gamma` | `{"choice":"gamma"}` | `Error` | `Invalid value "gamma" for parameter choice` | 0 | `{"choice":null}` |

All three cases expose the same complete input schema, equal across the committed receipt, both replays, and all six raw records:

```json
{"type":"object","properties":{"choice":{"type":"string","anyOf":[{"type":"string","const":"alpha","title":"Alpha"},{"type":"string","const":"beta","title":"Beta"}],"enum":["alpha","beta"]}},"required":[]}
```

Raw comparison pointers are `corpus/evidence/round-19/validation/probes/radio.json` → `/rounds/0/cases/0..2` and `/rounds/1/cases/0..2`. For each raw record, the input was cross-checked against the `invokeToolRequest` and recorded invoke command; `toolsAdded` schema against `inputSchema`; invocation reply against response ID; and submit-call fields against successful output. Both raw rounds check only beta for the successful input and leave all three radios unchecked for either rejected input. The disabled gamma remains present in raw DOM inventory but absent from the schema enum.

Both supported replay receipts also have matching `toolInvoked` inputs/tool names and internally consistent invocation IDs. Navigation violations, download events, new Playwright artifact files, and blocked external requests are empty for every replay case.

The family's declared decisions are `DV-16` (unknown radio value, probe `decl-radio-02`) and `DV-17` (disabled gamma, probe `decl-radio-03`), both with control `decl-radio-01`, in `validation/decisions.json`. This runtime sample reproduces those stated outcomes; external source bindings were not separately revalidated.

## Field encoding and assertion-strength finding

The current harness's group encoding (`scripts/webmcp-validation-round19.mjs:856-891`) agrees with actual raw checked states: a checked radio contributes its **string value**; an entirely unchecked group contributes **null under the group name**. Thus the rejected cases' post-invoke field inventory is `{"choice":null}`, not a null inventory. Raw submit calls are empty on rejection; absence of a submit-call field snapshot was not conflated with absence of DOM controls.

**Retained depth limitation:** `cases/radio.json:45,71` sets `expect.fields` to `null` for both errors. The comparator at `scripts/webmcp-validation-round19.mjs:1050-1054` treats that as *skip field assertions*, not as an assertion that observed fields are null. Consequently, `pass:true` alone does not establish the rejected cases' unchanged checked state. The explicit raw-state/replay comparison above supplies that observation for this rerun. No expectation was rewritten and no mutation test was performed.

This fixture has **no checkbox and no unnamed non-button field** (`fixtures/radio.html:9-15`): all radios are named `choice`. Its unnamed submit button is excluded by the producer's button filter. Therefore checkbox string/null and unnamed-field-key re-encodings cannot be independently credited from this family; the radio string/null encoding is the applicable check.

## Repeatability and runtime identity

Both regular-copy runs observed **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**, with runtime metadata equal to the committed receipt, including Chromium executable digests. Producer, case, and fixture receipt digests also match the original bytes.

No nondeterminism was observed **in the compared behavioral fields across these two runs**. Full receipts differ only at 13 paths: generated timestamp and each case's invocation/frame IDs. These differences explain the different receipt hashes; they are not behavioral mismatches. This is not a claim that two runs prove determinism.

## Retained evidence

All artifact paths below are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

| Artifact | Content / SHA-256 |
|---|---|
| `.ufo/waves/round-19/w2/RuntimeRadio.json` | Complete argv/cwd/timestamps/exit/stdout/stderr for the exact failure and all supported invocations; input identity; all comparison objects and wire checks; superseded exploratory receipt; runtime/hash checks; isolation record |
| `.ufo/waves/round-19/w2/RuntimeRadio.receipt.json` | Regular-copy run 1; `fa9ecacf5acea42b444022213ee1560e92c728465e6a54df92646d4dbad6c5bb` |
| `.ufo/waves/round-19/w2/RuntimeRadio.repeat.receipt.json` | Regular-copy run 2; `05c0ecbeb1673cb4e22b5fad06c2d5e598489f36686ef3e526529f1501236e02` |

Frozen R input hashes, measured with `sha256sum` on the absolute clone paths:

| R path | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `corpus/evidence/round-19/validation/cases/radio.json` | `b32df60f13500fce87baed871e637f1a4108aeb3d13769478d75c2c31018c5f7` |
| `corpus/evidence/round-19/validation/fixtures/radio.html` | `c7b61d6d5b2ae68c00960ff43b3945a36419861a4b0cb03aac8cd34be024037a` |
| `corpus/evidence/round-19/validation/probes/radio.json` | `3dfc150708e1489c331440cf99e5c222a5dc81a9d074d1d85812074dc6e049b2` |
| `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |

## Risks, bounds, and blockers

- Runtime behavior has no observed mismatch in this scope. Invocation-contract mismatch was resolved by the L1's supported-CLI clarification, not by a production edit.
- The two rejected cases skip field expectations; their observed unchanged state is supported here by explicit comparisons rather than by their harness pass bits alone.
- Only `radio` was exercised. No full suite, build, lint, formatter, integration gate, or other family's fixture was run.
- No independent browser-PID census was retained. Normal harness exit and empty stderr were observed; the unchanged producer awaits cleanup and asserts its completeness before writing a receipt (`:1300-1302`). No process was deliberately left running.
- External Chromium source bodies were not fetched. No independent claim about their decoded bodies or quoted source contents is made here.
- Mounted device discovery exposed 207 REA tools and no LSP definition/reference/refactor tool. Read-only source ranges and JSON inspection were used; no symbol refactor was performed.
- Tools installed or updated: **none**. No host, global configuration, private browser profile, credential material, domain source tree, or external service was changed.
- Remaining blockers: **none for this scoped rerun**. Round-wide integration/verification remains with the L1.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeRadio`.
- Branch: detached HEAD, as a report-only falsification sandbox.
- Base / attacked revision: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R; baseline B was not modified).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; **no new commit**.
- Changed production paths in clone: **none**.
- Scratch-only inputs/outputs: `/fast/scratch/tabi-r19/fx-RuntimeRadio-probe-957u5t_c`.
- Direct LANE writes: `.ufo/waves/round-19/w2/RuntimeRadio.md`, `.ufo/waves/round-19/w2/RuntimeRadio.json`, `.ufo/waves/round-19/w2/RuntimeRadio.receipt.json`, `.ufo/waves/round-19/w2/RuntimeRadio.repeat.receipt.json` only.
