# RuntimeUnknownParam — round-19 C1 falsification

## Scope and axes

Independently replayed only the `unknown-param` family at attacked checkpoint
`d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Baseline B is
`66251bfc1aef393e4aec599e950a8deb867736bb`; this is not a baseline rerun or a full C1 measurement.

Named axes: **depth** (input/expectation/protocol/form-state/schema agreement),
**reproducibility** (two independent replays), and **isolation** (regular copied inputs,
unchanged producer, private loopback browser contexts, report-only LANE writes).

## Result

**Family behavior reproduced; no behavioral counterexample found in scope.** Both supported
runs exited **0**, each with **4 cases / 4 passed / 0 failed / 0 findings**: **8 fresh
invocations** total. All four inputs, full `expect` objects, exact error text, fields including
their complete key sets, submit counts, full announced schemas, and response outputs agree with
the committed receipt. All **6 original raw trials** agree for the three error cases.
There were **0 expectation mismatches, 0 semantic-mismatch cases, and 0 raw-trial mismatches**.

The second run agrees with the first in every compared behavioral dimension. **No behavioral
nondeterminism was observed across these two runs.** Receipts are not byte-identical: generation
timestamps, frame IDs, and invocation IDs are fresh. Those dynamic coordinates alone are excluded
from the behavioral projection; actual protocol identity bindings were checked within each record.

Runtime in both receipts exactly matches the committed receipt:
`Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0`. The real Chromium executable SHA-256
is `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.

## Invocation-contract defect and authorized replay

The original wave instruction supplied an unsupported `--fixtures` flag. The exact requested
invocation was exercised once, exited **2**, produced no receipt and no stdout, and emitted:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

This is an **invocation-contract defect**, not an observed Chromium validation failure.
At R, `scripts/webmcp-validation-round19.mjs:194-210` accepts `--cases` and `--out` only;
`:1241-1242` derives fixtures as a sibling directory. L1 explicitly authorized the supported
layout and both replays without changing producer bytes.

Final copied input parent: `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam-inputs-m6o03_nw`. Its `cases/` contains only `unknown-param.json`
(**4,895 bytes**), and sibling `fixtures/` contains only `unknown-param.html` (**910 bytes**).
Both are regular files, not symlinks, and their SHA-256 values exactly match R. The initial
staging directory inside the private clone was removed after the rejected invocation; all
supported-run inputs and outputs are outside the clone.

Node's absolute installation bin was placed first in the child-process PATH. Supported argv:

```sh
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeUnknownParam/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeUnknownParam-inputs-m6o03_nw/cases --out /fast/scratch/tabi-r19/fx-RuntimeUnknownParam-results-s88a7ren/run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeUnknownParam/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeUnknownParam-inputs-m6o03_nw/cases --out /fast/scratch/tabi-r19/fx-RuntimeUnknownParam-results-s88a7ren/run-2.receipt.json
```

Both commands used cwd `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam`. Run 1 executed at
`2026-10-21T08:41:41.149707+00:00`–`2026-10-21T08:41:43.594626+00:00`; run 2 at
`2026-10-21T08:41:58.144585+00:00`–`2026-10-21T08:42:01.016130+00:00`. Their **complete, untrimmed stdout and stderr**, the
rejected command's full argv/output, exit codes and receipt hashes are retained in
`.ufo/waves/round-19/w2/RuntimeUnknownParam.json`.

## Every case and its authority

For cases 01 and 02 the exact error text is:
`Input contains a parameter "unknown" but there is no such parameter for the tool`.
For case 03 it is:
`Input contains a parameter "queryId" but there is no such parameter for the tool`.

| Case | Exact input | Observed status / error | Exact post-invoke fields | Submit count | Original raw authority |
|---|---|---|---|---:|---|
| `decl-unknown-param-01` | `{"unknown":"sentinel-only"}` | `Error`, unknown message above | `{"query":"initial-query","other":"initial-other"}` | 0 | `trials[0:2]`, `caseId=unknown-only`, repetitions 1 and 2 |
| `decl-unknown-param-02` | `{"query":"changed-valid","unknown":"sentinel-mixed"}` | `Error`, unknown message above | `{"query":"initial-query","other":"initial-other"}` | 0 | `trials[2:4]`, `caseId=unknown-plus-valid`, repetitions 1 and 2 |
| `decl-unknown-param-03` | `{"queryId":"sentinel-id"}` | `Error`, queryId message above | `{"query":"initial-query","other":"initial-other"}` | 0 | `trials[4:6]`, `caseId=id-not-name`, repetitions 1 and 2 |
| `decl-unknown-param-04` | `{"query":"changed-valid"}` | `Completed`, `errorText=null` | `{"query":"changed-valid","other":"initial-other"}` | 1 | L1-added control; absent from the original six-trial probe, present in committed receipt and both fresh runs |

All four cases announce this **entire** schema, including the success control whose
`expect.schema` is null:

```json
{"type":"object","properties":{"query":{"type":"string","description":"Query"},"other":{"type":"string","description":"Other"}},"required":[]}
```

The CDP `invokeTool` command itself succeeds (`commandError=null`) and supplies an invocation ID
even in the three error cases; rejection is specifically the corresponding
`WebMCP.toolResponded.status=Error`, not a failed CDP command. The valid-only control responds with
`{"ok":true,"fields":{"query":"changed-valid","other":"initial-other"}}`.
Case 02 retains serialized wire key order `query`, then `unknown`; the earlier valid value is
still not applied. The source and runtime support the three distinct decisions DV-01–DV-03
(`SKILL.md:2060-2062`, `validation/decisions.json`), with case 04 as their common in-family control.
The announced schema has no `additionalProperties:false`; observed unknown-name rejection is
therefore not being inferred merely from such a schema restriction.

## L1 expectation / field-encoding audit

The original author case file at commit
`b4791c9b79ed7a57c3b652bf4f6be4b58d9d6bd6` was read-only authenticated in
`/fast/scratch/tabi-r19/FamUnknownParam-4`; its SHA-256 is
`ff827e0f7c78aa6df8653947ec662c8e407d680d42eee34c889d298abd348b45`.
The **three original cases are structurally unchanged at R**, including input and every
expectation. The integration change is the additional success control, not re-encoding of these
three cases. The original raw probe has no `expect` object: its invocation parameters, response,
control values and calls were compared directly instead of inventing an embedded expectation.

This fixture has two named text inputs, `query` and `other`, whose expected and observed field
values are strings. It has **no checkbox and no unnamed text control**, so checkbox
strings/null and unnamed-text-key encoding are not runtime claims of this family. Its unnamed
submit button is excluded by the existing `HTMLButtonElement` field predicate
(`scripts/webmcp-validation-round19.mjs:856-891`), consistent with the original raw control
inventory and the observed schema. No accidental `""` field or schema key appears. Complete
field-key-set comparison was performed independently of the harness's subset-style expectation
reader. Null error text was explicitly checked for the completed control, and its unasserted
full schema was also compared.

## Retained-source grounding

Reopened the committed decoded source snapshot, rather than invoking any browser tool on a real
site or making a new network fetch. Source URL:
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT

Access date **2026-10-21**; decoded-body SHA-256
`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, recomputed with
`gzip -cd <clone>/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz | sha256sum`.
At **line 210**: “If the data isn't valid, form control states remain unchanged.”
The opened range **208-244** separates validation of all entries from subsequent application;
**1238-1249** maps form controls using `GetWebMCPParameterName()`. This supports, without replacing,
the direct runtime observations of atomic rejection and id-versus-name behavior.

## Exact retained evidence

Paths below are LANE-relative unless identified as R input. Both receipt files preserve the
complete emitted bodies, including raw returned `toolInvoked`/`toolResponded` records.

| Artifact | SHA-256 |
|---|---|
| R `scripts/webmcp-validation-round19.mjs` / both receipts' producer | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| R case file and regular input copy | `89307220829295394255526288107c41eece58c5ddf1ab48d3ad03517e767e19` |
| R fixture and regular input copy | `cfd92ca512b59fe1d0e686d7071cc0013c940c969e8666c2342fc31231d609fe` |
| R `corpus/evidence/round-19/validation/probes/unknown-param.json` | `339c0e1717340bda7199169f5b6ab86ba06e842b8b6f99c09e81711fdd2ba596` |
| R committed `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `.ufo/waves/round-19/w2/RuntimeUnknownParam.receipt.json` — run 1, 9,316 bytes | `d0aab23f2ef475c20e306b8aeaecde665744aa647c55dc83e6b4b753af94450e` |
| `.ufo/waves/round-19/w2/RuntimeUnknownParam.repeat.receipt.json` — run 2, 9,316 bytes | `2241b3d64434744fcedcab63f02d649894343b560ffc887b8e8bab7fee2d0aaf` |

The ordered behavioral projections of both fresh receipts and the committed family's entries
have canonical SHA-256 `137e2272c1923f7e26a7824ad621922b84d7ce98102da786224bd71eb8db3258`. The JSON report records the exact projection and
canonicalization, all per-case comparisons, original-trial mapping, and protocol binding checks.

## Risks, blockers and verification bounds

- No remaining runtime blocker after L1's authorized argv correction. The original rejected
  invocation is retained, not represented as a pass or silently replaced.
- The original raw probe has no success-control trial. Its source boundary remains explicit;
  the committed receipt and both fresh runs independently cover that additional control.
- Findings are scoped to this flagged Chromium build and these four inputs, not general JSON
  Schema compliance, other browser versions, other families, or the full C1 counter.
- Only the requested family probes and artifact/data comparisons were run: **no full corpus,
  build, lint, formatter, test suite, C1/C2/C3 counter or external-state remediation**.
- The foreground harnesses returned normally without timeout or signal. Their unchanged code
  closes each case context in `finally` (`:1148-1151`) and requires complete process/server/temp
  cleanup before emitting a receipt (`:1167-1231`, `:1300-1301`). No separate PID census was retained;
  cleanup is evidenced by those enforced predicates and the successful exits, not an invented
  independent observation.
- No tools were installed or updated. No LSP device was present in the mounted `xd://` inventory;
  no symbol definition/refactor or production edit was needed. All production docs/callers remain
  intentionally unchanged under the advisory/report-only assignment.

## Files changed

Only these four seat-owned advisory artifacts were written in LANE:

- `.ufo/waves/round-19/w2/RuntimeUnknownParam.md`
- `.ufo/waves/round-19/w2/RuntimeUnknownParam.json`
- `.ufo/waves/round-19/w2/RuntimeUnknownParam.receipt.json`
- `.ufo/waves/round-19/w2/RuntimeUnknownParam.repeat.receipt.json`

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam`
- Branch: detached HEAD (`git switch --detach R` in the private clone).
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, per falsification override; B recorded above).
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (existing checkpoint; **no new commit**).
- Changed production paths: **none**. Producer, cases, fixture and committed evidence at R unchanged.
- LANE changes: exactly the four advisory artifact paths listed above; no git/jj write in LANE.
- Scratch retained: `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam-inputs-m6o03_nw` and `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam-results-s88a7ren`; regular family copies and the two original output receipts only. No throwaway probe script was created.
