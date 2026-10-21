# ConnPlanner — round22 C1 depth accounting (connector, read-only data-walk)

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. No production file was edited.
No build/test/lint was executed. No tool installed (none needed). All statements below are
either read directly from committed bytes (with path + digest) or marked `[INFERENCE]`.

## 1. Axes named

| Axis | Scalar | Role this round |
|---|---|---|
| depth | 8 | declared, worked by C1; a lowest non-retired tie |
| operability | 8 | tied lowest; untouched |
| freshness | 8 | tied lowest; untouched |
| adjacency | 8 | tied lowest; untouched |
| coverage | 9 | must not move; no credit |
| calibration | 9 | must not move |

Evidence: `.ufo/waves/round-21/round21-closure.json` (verdicts `depth=improved` only, all
other axes `unchanged`; claim C1 `scalar_before=8`, `scalar_after=8`), and
`SCORECARD.md:1043-1056` planned row (“lowest non-retired tie8 … Scalar8 remains8”).

**Precise lowest-axis wording (use verbatim):** “C1 works depth, a lowest non-retired tie at 8,
tied with operability 8, freshness 8 and adjacency 8; the round leaves the depth scalar at 8.
This is not depth 8→9 and not a whole-domain promotion.”

## 2. What round21 actually measured

- Producer: `.ufo/waves/round-21/measure-c1.mjs`, sha256
  `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`.
- Metric: `c1_lifecycle_observations`; baseline `e7cf11a8…` → 0/exit0, measured `2d5eaaa3…` → 12/exit0,
  delivered `5f585773…` → 12/exit0 (`corpus/evidence/round-21/measurements.json`).
- Counted population: exactly 12 case IDs (`na-pending, na-click, na-requestsubmit,
  na-native-submit, na-reset, na-remove, na-reject, na-throw, na-delayed, na-invalid-submit,
  auto-positive, auto-invalid`), receipt `corpus/evidence/round-21/runtime/receipt.json`
  sha256 `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`; acquisition
  producer `scripts/webmcp-lifecycle-round21.mjs` sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`;
  canonical note `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` sha256
  `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4`. Recomputed all 12
  `case.evidence.sha256` against the files on disk: **0 mismatches**.

### What the round21 instrument binds, and what it does not

The 23 finding IDs (`measure-c1.mjs:33`) are all shape/binding/order checks. None binds a case’s
outcome class: no expected status, no output payload, no errorText family, no autosubmit
timing class, no release ordering. `summary_mismatch` (`measure-c1.mjs:139`) only requires the
receipt summary to equal the raw trail (`after.responses` = the actual `WebMCP.toolResponded`
params), i.e. self-consistency; `preAction.responseCount` is likewise compared only to the raw
frames, never to the case’s declared class.

**Hard proof of the admission surface (committed bytes, not executed):**
`.ufo/waves/round-21/fixtures/positive-ordered.json` (sha256
`aa3726264f2a4f883855aecbce0fec15dcc3d597e6e19ec943fcfe78817f8e75`) contains all 12 cases with
**zero `WebMCP.toolResponded` frames and zero `after.responses` entries**. The independent oracle
row is `{name:"positive", exit:0, finding:null, value:12}` in
`.ufo/waves/round-21/fixtures/expected.json`. So a fully silent synthetic receipt of the right
shape is credited 12 by round21. The round21 note says the same in words at
`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:78`: “The gate’s positive CLI
fixture is deliberately structural and all-silent; it is not a semantic oracle for the real
contrasts.”

### Actual retained semantics of the real 12 (raw, per-case)

| Case | Response seq vs markers | Status / payload |
|---|---|---|
| na-pending | none in either window (15 frames) | no `toolResponded`; formActive true before and after |
| na-click | pre12 < act13 < **resp14** < comp15 < post16 | Completed `{ok,nonce,q}` |
| na-requestsubmit | pre12 < act13 < comp14 < **resp15** < post16 | Completed `{ok,nonce,q}` |
| na-native-submit | pre12 < act13 < comp14 < nav15 < **resp16** < post17 | Completed `[{dummy:"landing"}]`; after-action pageState has **no `submits` key** (receipt `submits:null`); navigation to `/landing?q=<nonce>` |
| na-reset | comp14 < **resp15** < post16 | Canceled `"Tool execution cancelled by a form reset"` |
| na-remove | comp14 < **resp15** < post16 | Canceled `"Tool execution cancelled, since tool definition was updated"` |
| na-reject | comp14 < **resp15** < post16 | Error `"respondWith promise was rejected"` |
| na-throw | comp14 < **resp15** < post16 | Error `"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"` |
| na-delayed | obs15 `delayed-before-release` (formActive true, submits[0].respondWith `"function"`), release16, **resp17**, post18 (formActive false) | Completed `{ok,nonce,q}` |
| na-invalid-submit | comp14 < **resp15** < post16 | Error `"Form validation failed: q: Please fill out this field.. "`; no submit event |
| auto-positive | **resp12** < pre13 < act14 < comp15 < post16 | Completed `{ok,nonce,q}`; `preAction.responseCount=1` |
| auto-invalid | **resp12** < pre13 < act14 < comp15 < post16 | Error native-email validation text; `preAction.responseCount=1` |

Population: 1 finite pending / 5 Completed / 2 Canceled / 4 Error — identical to the round21
closure census. The `na-*` rows are all `preAction.responseCount=0`; both `auto-*` rows are 1.

## 3. Planned row vs proposed oracle

Planned (`SCORECARD.md:1043-1056`): “C1 only: depth … target0→12 explicit semantically checked
lifecycle rows over the retained round21 acquisition … a new durable outcome oracle, not twelve
additional observations, novel branches or a fresh browser run.”

Contract API (round-22 w1 spec, BuildOracle item + context): `evaluate(files)`/`INPUT_PATHS` in
`.ufo/waves/round-22/measure-c1.mjs`; value 12 only after explicit actual semantics; missing new
expectations+note → baseline 0; partial missing → failed 0; findings include
`semantic_status/output/error/timing/navigation/delayed` plus `evidence_binding`, `case_set`,
`source_binding`, `input_shape`, `revision_input`; exit 0 baseline/clean, 1 failed, 2 could-not-evaluate.
The planned row and the API agree on the bound. The accounting risk is not in the plan text; it is
in the interpretation of the 0→12 delta (see §4).

## 4. Actual depth delta versus the recycled 12

- **Population identity:** same 12 IDs, same receipt (`4bc79636…`), same producer
  (`bc11e4d6…`), same per-case evidence bytes. Round22 introduces **0 new observations, 0 new
  branches, 0 new browser runs, 0 new producer claims**.
- **Versus round21’s admitted 12:** 12→12. **Versus baseline `5f58577`:** 0→12 only because
  `.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`
  and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` are all absent from that tree
  (verified with `git ls-tree` at `5f58577`: zero matches), while
  `.ufo/waves/round-21/measure-c1.mjs` and the round21 receipt are present. The 0 is
  **instrument absence**, not knowledge absence: the baseline commit already contains the
  admitted 12-row acquisition.
- **What is genuinely new:** falsifiability of the retained rows. The round21 counter credits 12
  to an all-silent fixture (§2); the round22 oracle is required to refuse it. That is a
  verification-depth delta (a fail-capable predicate over existing bytes), not an
  observational-depth delta.

**Precise no-extra-coverage-credit wording (use verbatim):** “No coverage credit: the counted
population is byte-identical to round21 — same 12 case IDs, same receipt (sha256
`4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`), same acquisition producer
(sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`), same per-case
evidence hashes (0 mismatches) — so no branch, denominator, domain, capability or freshness
credit accrues. Coverage remains 9. The round22 value 12 re-adjudicates already-counted rows; it
is not 12 new observations.”

## 5. Proposed move (one, bounded)

**Make each of the 12 expectations a two-axis predicate — outcome family × finite-window
position — and require the executed disposition to carry the population-reuse line.**

For each case id the expectation row should bind both:

1. **Outcome family (single-valued per id, no union):** pending → no `toolResponded` and both
   window counts 0; Completed → status plus payload family (`{ok,nonce,q}` echo for
   click/requestSubmit/delayed/auto-positive; `[{dummy:"landing"}]` array for native); Canceled →
   status plus exact errorText family (reset vs tool-definition-update); Error → status plus
   errorText family (promise rejection vs preventDefault-programming-error vs native validation).
2. **Finite-window position:** `auto-*` → response seq < pre-action marker seq and
   `preAction.responseCount=1`; `na-*` non-pending → pre < action < response < post (holds for
   click 12<13<14<16 and for requestSubmit/native 12<13<15|16<16|17); `na-pending` → no response,
   count 0. Native additionally: navigation to `/landing?q=<nonce>`, output is an array of
   length 1, and absent old-document `submits` stays `null` (never `[]`). Delayed additionally:
   `delayed-before-release` observation (formActive true, `respondWith:"function"`) precedes the
   `release` frame, which precedes the response; after-action formActive false.

Why this is the right move: the round21 gap is exactly two holes — silence and wrong/inverted
timing both pass because the summary is only compared to itself. Binding outcome alone still
admits a receipt where every row answers before the pre-action marker; binding position alone
admits a wrong-status receipt. The pair closes both without adding an observation. It improves
depth (each counted row gains a predicate that can go red for that row’s identity) and harms no
other axis: no new acquisition, no denominator, no source reopen, no gate, no scoring change.

## 6. Risks and contradictions (kept explicit, not smoothed)

1. **Double-counting.** Round20 counted 0→12 on documented source rows; round21 counted 0→12 on
   runtime rows; round22 counts the same runtime rows again under a new metric identity. Three
   consecutive 0→12 depth targets for two distinct populations. Without the §4 sentence, the
   ledger reads as 36. Both counters returning 12 at the delivered revision is only safe if the
   SCORECARD says they share a population.
2. **baseline0 ≠ knowledge0.** `5f58577` already contains round21’s admitted 12. The 0→12 must
   be labelled a metric-instance delta.
3. **“Independent expectations” is procedural, not evidentiary.** The contract correctly forbids
   recomputing expectations from the evaluated receipt, but the expectations are still authored
   from the same retained S101 raw bytes and the same round21 census. Fixed-file ≠ independent
   semantic review, and neither is authenticated settlement.
4. **Status-only vacuity.** If an expectation admits more than one family for an id, or omits
   output/errorText, rows pass while checking nothing. The contract’s enumeration already maps
   each id to exactly one family; enforce single-valued rows.
5. **Red-test masking.** A semantic mutation that does not update raw digest + `evidence.sha256`
   + `execution.artifacts` + `receiptSha256` will fail on `evidence_binding`/`evidence_digest`
   instead of the semantic id. The selftest must assert the exact semantic finding and no binding
   finding (contract already requires digest-link updates; the assertion must match).
6. **Native null-vs-empty.** Receipt `submits:null` is “unavailable after navigation”, not
   “observed zero”. An oracle that coerces absence to `[]` would assert a falsehood the round21
   note explicitly refuses.
7. **Delayed ordering.** A predicate that only requires Completed-in-window passes an early
   response; the release/observation ordering at seq15/16/17 is the whole point. Selftest needs
   the “delayed early response” and “active false before release” reds named in the BuildSelftest
   assignment.
8. **Old-counter import.** Reusing the round21 producer/acquisition hashes and schemas is
   binding, not outcome logic; importing `.ufo/waves/round-21/measure-c1.mjs` `evaluate` would
   carry the all-silent admission into the new metric. The contract freezes the old counter; a
   static no-import check should enforce it.
9. **Debt correction is not C1 evidence.** The W1 wake-history / W2 chronology correction is
   append-only conformance debt repair; it must not be cited as depth evidence or as a review of
   finalized bytes.

## 7. Verification for L1 (I ran none)

- `node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6` →
  exit 0, `value:0`, `verdict:"baseline"`, `findings:[]`.
- `node .ufo/waves/round-22/measure-c1.mjs <delivered-rev>` → exit 0, `value:12`,
  `verdict:"clean"`; assert `revision_input` equals the argument and `input_shape` is clean.
- `node .ufo/waves/round-22/measure-c1.mjs --selftest` → all rows in
  `corpus/evidence/round-22/.../expected.json` pass, including: all-silent receipt refused
  (exit 1, semantic finding, value 0); each of the 12 wrong-status reds; wrong success
  nonce/output; missing Canceled/Error text; native object-not-array and `[]`-not-null; delayed
  early response and pre-release `formActive:false`; short finite window; duplicate/missing case;
  bad provenance; malformed shape; invalid revision → exit 2.
- Population identity: the 12 IDs and `evidence.sha256` consumed by the round22 evaluation equal
  `corpus/evidence/round-21/runtime/receipt.json` (I recomputed all 12: 0 mismatches).
- No-import check: grep the round22 measure for any import of the round21 measure module.
- No-harm: `git diff --stat 5f58577 <delivered>` must show only added round22 paths plus the
  planned note/SCORECARD/SKILL appends; the round21 counter, receipt, per-case raws and note
  must be byte-identical (all four cited digests above are the frozen reference).
