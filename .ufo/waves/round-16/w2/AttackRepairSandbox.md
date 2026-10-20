# Attack — post-failure repair of `opaque-sandboxed-iframe`

Seat: `TabiR16.AttackRepairSandbox` (leaf, read-only lane). Snapshot under attack:
`b444ca8e024f386124418169e8e400221524bba3` (`8f7feb3` + C2 counter repair).
Target: `scripts/webmcp-loopback-round16.mjs:1194-1257`, pass predicate at `:1232-1236`.
Runtime: node 24.21.0, Playwright 1.64.0, Chromium 154.0.8037.97 (from the receipt's own runtime block).

## Verdict

**HOLDS for the measured artifact; one literal generalization is false.**

- The receipt's pass is **not vacuous**: the observed iframe report is `settled:"rejected"`,
  `errorName:"NotAllowedError"`, with the exact permissions-policy message, and CDP delta is `[]`.
- `NotAllowedError` is **grounded**: spec §4.4 + §4.2, the committed probe, and the re-run all agree.
- The claim "pass **requires** `NotAllowedError`" is **not true of the code**: when
  `typeof document.modelContext !== 'object'` the case passes with **no denial evidence at all**
  (mutation-proven below). This branch is spec-divergent (the getter is ungated), so it is a
  latent non-discrimination finding, not a defect in the measured run.

## What the repair actually is (evidence, not narrative)

- `git diff 8f7feb3 b444ca8 -- scripts/webmcp-loopback-round16.mjs` → **empty**. The harness bytes
  are identical at A and B; B changes only `.ufo/waves/round-16/measure.mjs` and
  `.../measure/count-after-c2-first-counter-defect.json`. So the measured snapshot contains the
  repaired harness, not a repair introduced at B.
- Repair is visible as a behavior delta between the two retained receipts:
  - `receipt-first-run-failed.json`: producer `cedccdf9…`, opaque `actual.iframeReport` keys
    `mcType,regType,error,errorName` — **no `settled`**, `error:null`, case `fail`.
  - `receipt.json`: producer `961874e4…` (= `sha256sum scripts/webmcp-loopback-round16.mjs`),
    `actual.iframeReport = {mcType:"object", regType:"function", error:"NotAllowedError: Access to
    the feature \"tools\" is disallowed by permissions policy.", errorName:"NotAllowedError",
    settled:"rejected"}`, case `pass`.
  - Only the awaited path writes `settled` (`scripts/webmcp-loopback-round16.mjs:1219-1223`), so the
    repair is real and its effect is captured.
- The pre-repair producer source is **not retrievable**: `git cat-file -e cedccdf9…` →
  `fatal: Not a valid object name`. Only the failed receipt is retained. (Finding F5.)

## Grounding

Re-opened this session (access date **2026-10-20**), `<https://webmachinelearning.github.io/webmcp/>`,
revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, dated 20 October 2026:

- §4.4 Permissions policy integration (source line 2244):
  > Access to the APIs in this specification is gated behind the policy-controlled feature "tools", which has a default allowlist of 'self'.
- §4.2 `registerTool` steps (source line 1567):
  > If tool owner is not allowed to use the "tools" feature, then return a promise rejected with a "NotAllowedError" DOMException.
- §4.1 getter (source line 1489): `[SecureContext, SameObject] readonly attribute ModelContext
  modelContext;` and its steps are only "Return this's associated ModelContext object." — **no
  `tools` gate on the getter**. An opaque-origin frame therefore has the object and fails at
  `registerTool`, exactly as observed.

Probe corroboration, `.ufo/waves/round-16/probes/WebmcpProbeSecure.json` (`sandbox_iframe_opaque`):
`frameContext.origin:"null"`, `modelContextType:"object"`, `error:"NotAllowedError: Access to the
feature \"tools\" is disallowed by permissions policy."`, `events:[]`, `toolsAddedCount:0`; the
`allow-same-origin` sibling registers (2 events). The receipt's `actual.error` is byte-identical to
the probe string. `expectedProvenance` ("S020 §4.4 … probe-observed NotAllowedError") is accurate.

## Re-run (canonical)

```
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/r16-canon.zKVjz4/receipt.json
WEBMCP_CASE id=opaque-sandboxed-iframe status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/r16-canon.zKVjz4/receipt.json
# verdict pass producerSha 961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1 (8s wall)
# actual.iframeReport {"mcType":"object","regType":"function","error":"NotAllowedError: Access to the feature \"tools\" is disallowed by permissions policy.","errorName":"NotAllowedError","settled":"rejected"}
```

## Mutation controls (copies under `/tmp`, lane untouched; each run = full 11-case harness)

| Mutant (single-line edit in a `/tmp` copy) | opaque case | harness | reading |
|---|---|---|---|
| `sandbox="allow-scripts allow-same-origin"` | **fail** `settled:"resolved"`, `sandboxedAdded=1` | fail 10/11 | denial is caused by the opaque origin; case discriminates |
| sandbox attribute removed | **fail** `settled:"resolved"`, `sandboxedAdded=1` | fail 10/11 | same |
| rejection replaced by `SecurityError` | **fail** `errorName:"SecurityError"` | fail 10/11 | `errorName` is load-bearing |
| srcdoc script removed | **fail** `{"timeout":true}` | fail 10/11 | timeout path cannot pass vacuously |
| `registerTool` missing but `modelContext` object | **fail** `mcType:"object"`, `errorName:null` | fail 10/11 | object API without denial does not pass |
| `NotAllowedError` with arbitrary message | **pass** | pass 11/11 | message not asserted (F3) |
| `delete Document.prototype.modelContext` in the frame | **pass** `detail:"… modelContext undefined (no modelContext)"` | **pass 11/11** | **F1: passes with zero denial evidence** |
| forged `postMessage` report + `appendChild(iframe)` removed | **pass** `error:"NotAllowedError: forged"` | **pass 11/11** | **F2: report is unauthenticated** |

Exact observed lines (from the mutant receipts):

```
F1: case=pass detail=opaque sandboxed iframe denied: modelContext undefined (no modelContext)
    actual={"mcType":"undefined","regType":"undefined","error":null,"errorName":null,"settled":null}
F2: verdict=pass case=pass detail=opaque sandboxed iframe denied: NotAllowedError (NotAllowedError: forged)
    actual={"mcType":"object","regType":"function","error":"NotAllowedError: forged","errorName":"NotAllowedError","settled":"rejected"}
F3: case=pass actual.error="NotAllowedError: masked reason, not the tools policy"
```

## Findings (severity, evidence)

1. **F1 — MEDIUM (assertion strength).** `:1235` `(report.mcType !== 'object' || …)` admits an
   "API absent" pass. A frame with `Document.prototype.modelContext` deleted scores pass 11/11 with
   no denial. Per S020 §4.1/§4.2 the getter is ungated, so this shape is a *divergence* the case
   would silently accept. The case's own `expected` string admits the branch; the knowledge note's
   "require `NotAllowedError`" (`.ufo/waves/round-16` → `corpus/knowledge/webmcp-chromium-loopback-round-16.md:106`)
   overstates what the code enforces. Fix would be `mcType === 'object' && settled === 'rejected' &&
   /permissions policy/.test(error)`, or record a separate divergence status for the absent branch.
2. **F2 — MEDIUM (evidence authenticity).** The denial evidence is an unauthenticated
   `parent.postMessage(..., '*')` (`:1217`) consumed by a listener that never checks
   `ev.source === iframe.contentWindow` (`:1204-1209`). With the iframe never appended and one
   forging line in the fixture, the case passes. The committed `plain.html` contains no such poster,
   so the shipped run is not forged; but the only harness-side oracle (`toolsAdded` delta `[]`, `:1229-1231`)
   is equally satisfied by "never attempted". Binding the message to the frame source (or carrying a
   per-run nonce) would make the report harness-authenticated.
3. **F3 — LOW.** Pass checks `errorName` only (`:1235`); the observed receipt's message is exact, but
   any `NotAllowedError` passes. S020 ties `NotAllowedError` uniquely to the policy check inside
   `registerTool`, so the residual risk is a Chromium message change, not a false denial.
4. **F4 — LOW (race).** `waitFor(toolsAdded.length > before, 1000)` (`:1229`) precedes the delta
   computation; a CDP `toolsAdded` arriving >1 s after the page report would be missed by the
   predicate (it would still surface in `receipt.toolsAdded`, serialized later). Not observed: both
   canonical and mutant receipts show `toolsAdded: []` and `durationMs ≈ 1060` (full wait elapsed).
5. **F5 — INFO (retention).** Pre-repair producer `cedccdf9…` is not in git; the repair diff cannot
   be reproduced. The retained failed receipt is sufficient to show the pre-repair *behavior* (no
   `settled`), and the note's "original bytes are kept" is true of the receipt, not of the producer.

## Residual risk / verification gaps

- Mutation probes are harness copies; they demonstrate what the *predicate* accepts, not what this
  Chromium build does. The shipped run is observed directly and is consistent with the probe.
- Only the flagged run executes this case (registration `:1402`); the flag-off control is a separate
  case, so this case does not itself establish flag-dependence.
- `plain.html` fixture hash in the receipt is `537793b5…` (unchanged since the failed run); no
  fixture mutation was made in the lane.

## Axes exercised

Correctness (observed rejection + zero tool announcement), falsifiability (8 mutants, 5 correct
failures / 3 surviving weaknesses), grounding (spec §4.4/§4.2 + probe + re-run), reproducibility
(receipt producer digest = committed harness; 8 s rerun to `/tmp`).

Tooling: none installed or upgraded.
