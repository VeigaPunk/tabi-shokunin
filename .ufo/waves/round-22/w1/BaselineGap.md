# BaselineGap — W1 scout

Seat: read-only scout, leaf member. No subagent dispatch, no production edits, no execution of
gates/selftests/builds, no browser/network, no installs.

- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Baseline: `5f585773258b33d2d514b00cd0b0775333578db6`
- New metric at baseline: `c1_semantically_checked_lifecycle_rows = 0`, target 12
  (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/baseline.json`)
- Method: static inspection of committed sources, retained evidence, and retained executed
  records. Nothing below was re-run.

## Bottom line

The baseline contains the round-21 acquisition and a **structural observation counter**, but no
durable per-case **outcome oracle**. The 12 round-21 observations are coherent and semantically
informative; the gap is entirely in the committed gate and selftest: the old gate's green path is
reachable by an all-silent synthetic receipt, and the old selftest's positive fixture **is** exactly
that receipt. Therefore the new metric's baseline 0 is the absence of fixed semantic expectations,
not a finding that the round-21 rows are invalid. The old counter cannot be imported as the outcome
oracle; the new oracle must assert the outcome classes that the retained round-21 witness already
records.

## 1. What the old measure actually checks

File: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/measure-c1.mjs`
(digest `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`, matching
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/measurement-binding.json`).

Observed code facts:

- Line 2 states the scope verbatim: “Counts finite evidence-backed observations, NOT semantic
  entailment or branch coverage.”
- Line 57 fixes the schema/metric: `tabi-round21-c1-measure-v1`,
  `c1_lifecycle_observations`.
- `Completed` and `Canceled` do **not occur anywhere** in the file. `status` occurs only as the
  child-process `r.status` of the Git/selftest spawns (lines 146 and 159), never as a response
  field. The mode names `reject`/`throw`/`delayed`/`invalid` occur only in `CONFIG` (lines 11-18)
  and are compared for identity at line 112; they never assert a response status.
- Line 143 is the count: `return result(findings.length?0:cases.length);` — a finding-free receipt
  yields 12 regardless of what the cases observed.
- Lines 124-126 define `events` as `WebMCP.toolResponded` frames, but the only event constraint is
  `events.some(f=>f.seq<=invoked[0].seq)`; **zero response events is valid**.
- Line 139 checks `after.responses` only for equality with the same events, and maps a non-array
  `submits` to `null`:
  `equal(c.after?.responses,events.filter(f=>f.seq<post?.seq).map(f=>f.params))` and
  `equal(c.after?.submits,Array.isArray(post?.value?.submits)?post.value.submits:null)`.
- Lines 61-63 return early on missing receipt/note: with both absent, `result(0)` is
  `verdict:'baseline', exit:0`; with one absent, `partial_state` and `result(0)`.

Code-derived consequence (not executed here): if the 12 evidence files keep `sent
WebMCP.invokeTool`, one `result`, one `toolInvoked`, the observation/action/action-complete frames,
and delete every `toolResponded` frame, while setting `after.responses=[]`,
`preAction.responseCount=0`, `after.submits=[]`, `after.navigations=[]`, then lines 126 and 139 are
satisfied tautologically and the counter returns **12**. The gate never asks whether a row that
should complete actually completed, or whether a pending row stayed pending.

## 2. The old selftest’s positive fixture is the all-silent receipt

Files:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/selftest-c1.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/fixtures/positive-ordered.json`
  (digest `aa3726264f2a4f883855aecbce0fec15dcc3d597e6e19ec943fcfe78817f8e75`, identical to the
  fixture identity recorded in `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/selftest-c1.json`)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/fixtures/expected.json`
  (digest `37cc2995fd0ca24f445439e7716ebf8d0daba514745f5ab3738603a21d918eec`)

Observed facts:

- `selftest-c1.mjs:10` loads `fixtures/positive-ordered.json` as `BASE`; line 26 returns without
  mutation for the `positive` case, so the gate is run on that fixture verbatim. `expected.json`
  entry `positive` expects `exit:0, value:12`.
- In `positive-ordered.json`’s receipt, **all 12 cases** have
  `after.responses=[]`, `after.submits=[]`, `after.navigations=[]`, and `preAction.responseCount=0`.
  Across all 12 evidence files there are **0 `WebMCP.toolResponded` frames** and 12
  `WebMCP.toolInvoked` frames. The status set over all synthetic responses is empty.
- This includes cases whose actual semantics require an outcome:
  - `auto-positive` is all-silent despite the real witness requiring `Completed`
    (`semantic-contrast-witness.json` row `auto-positive`, `preResponseCount=1`).
  - `na-native-submit` is all-silent with `submits:[]` and no navigation, despite the real witness
    requiring a `/landing?q=...` navigation, `Completed` output `[{"dummy":"landing"}]`, and
    post-navigation `submits:null`.
  Synthetic `na-native-submit`: 7 frames, 0 `toolResponded`, page-state `submits:[]`.
  Real `na-native-submit`: 17 frames, `Page.frameNavigated` at seq 15 and `toolResponded`
  `Completed` at seq 16, `after.submits:null`
  (`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/na-native-submit.json`).
- The retained executed record confirms acceptance: in
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/selftest-c1.json`,
  `stdout` reports `schema:tabi-round21-c1-selftest-v1`, `verdict:clean`, `cases:83`,
  `passed:83`; the `positive` report has `exit:0`, `value:12`, `findings:[]`, `pass:true`.

The round-21 note says this explicitly at
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:78-80`:
“The gate's positive CLI fixture is deliberately structural and all-silent; it is not a semantic
oracle for the real contrasts.” So this is an acknowledged structural control, not a hidden claim
that the real contrast is silent.

## 3. The selftest oracle is structural, not an outcome oracle

`expected.json` has 83 named cases. Every expectation is an exit code, a value of 0 or 12, and at
most one finding ID. Mutations target shapes, digests, ordering, source headers, cleanup, windows,
and summary-vs-frame consistency. Representative limits:

- `false-pending` (`selftest-c1.mjs:41-46`) injects a `Completed` event before the pre-action
  observation and changes `after.responses`, but leaves `preAction.responseCount` stale; the
  expected finding is `summary_mismatch`, i.e. the test is caught by accounting, not by the fact
  that a pending case completed.
- `response-mismatch` (line 47) changes only `after.responses`; expected `summary_mismatch`.
- `response-payload-mismatch` (line 176) changes only the summary payload; expected
  `summary_mismatch`.
- `unavailable-null-positive` (lines 62-70) **deletes** the observed `submits` field and sets
  `after.submits=null`; it is expected and recorded green: `exit 0, value 12`. Thus “state
  unavailable” and “state observed absent” are collapsed into the same positive.
- Other executed green cases in `selftest-c1.json`: `late-response-outside-window` (0/12),
  `foreign-response-ignored` (0/12), `boolean-false-attribute-green` (0/12),
  `quoted-attribute-green` (0/12).

No case in `expected.json` swaps a matching response’s `status` while keeping the summary and
digest links coherent, e.g. `Completed`→`Canceled` on `na-click`, or `Error`→`Completed` on
`na-reject`. The old oracle has no vocabulary to express that mutation, which is precisely the
semantic dimension the new metric must add.

## 4. The actual semantic witness already exists in round 21

The observations are not silent. The author-side witness is
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/final/semantic-contrast-witness.json`
(digest `b58dd7726c4648e6fe97e847de4923b45b7ca8ee29259fa23ea75325b3a96cbd`), schema
`tabi-round21-semantic-contrast-witness-v1`, author `TabiR21 L1; author-side, not independent
closure`, acquisition sha
`65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`.

Its 12 rows against `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/receipt.json`
(digest `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`):

| case | preResp | after window | in-window response | distinguishing payload / observation |
|---|---:|---:|---|---|
| `na-pending` | 0 | 503 ms | none | no matching response in either finite window; form active |
| `na-click` | 0 | 547 ms | `Completed` | output `{ok:true,nonce,q}`; one submit with `isTrusted:true,agentInvoked:true` |
| `na-requestsubmit` | 0 | 503 ms | `Completed` | same output shape; one trusted/agent-invoked submit |
| `na-native-submit` | 0 | 503 ms | `Completed` | output `[{"dummy":"landing"}]`; navigation to `/landing?q=...`; `submits:null` |
| `na-reset` | 0 | 503 ms | `Canceled` | `errorText:"Tool execution cancelled by a form reset"`; `submits:[]` |
| `na-remove` | 0 | 503 ms | `Canceled` | `errorText:"Tool execution cancelled, since tool definition was updated"`; `submits:[]` |
| `na-reject` | 0 | 502 ms | `Error` | `errorText:"respondWith promise was rejected"`; one trusted/agent-invoked submit |
| `na-throw` | 0 | 502 ms | `Error` | programming-error text naming `preventDefault()` without `respondWith()`; one submit |
| `na-delayed` | 0 | 755 ms | `Completed` | `delayed-before-release` observation and `release` at seq 16; response at seq 17, +253 ms after action |
| `na-invalid-submit` | 0 | 504 ms | `Error` | `errorText:"Form validation failed: q: Please fill out this field.."`; `submits:[]` |
| `auto-positive` | 1 | 501 ms | `Completed` | response seq 12 precedes pre-action observation seq 13; one trusted/agent-invoked submit |
| `auto-invalid` | 1 | 501 ms | `Error` | email-validation error; response seq 12 precedes pre-action seq 13; `submits:[]` |

Exact frame anchors (real evidence):

- `na-click.json`: action seq 13 (`click`), `toolResponded` seq 14 `Completed`, after-action seq 16.
- `na-delayed.json`: action-complete seq 14, `delayed-before-release` seq 15, `release` seq 16,
  `toolResponded` seq 17 `Completed`, after-action seq 18.
- `na-native-submit.json`: `Page.frameNavigated` seq 15, `toolResponded` seq 16 `Completed`.
- `auto-positive.json`: `toolResponded` seq 12 `Completed`, pre-action observation seq 13,
  after-action seq 16.
- `na-pending.json`: seq 1-15 contains `toolInvoked` seq 11 and no `toolResponded`; pre window
  254 ms, after window 503 ms.

The note records the intended boundaries: a matching response missing during a finite window “is
not a proof that it can never arrive”
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:52`),
and pending/delayed/cleanup are finite run claims. These are limits on the observations, not
evidence that they are invalid.

## 5. Why the baseline has no durable outcome oracle — without invalidating round 21

Observed baseline facts:

- `git cat-file -e 5f58577:corpus/evidence/round-22/semantic-expectations.json` → missing;
  ditto `5f58577:.ufo/waves/round-22/measure-c1.mjs` and
  `5f58577:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. The round-22 evidence directory
  itself is absent at that revision.
- The only committed counter at baseline is the round-21 structural counter; its digest at
  `5f58577` equals the binding digest `8d9924...`.
- The new metric’s baseline record says `before:0, target:12` for
  `c1_semantically_checked_lifecycle_rows`.

The old metric’s 0→12 history is about artifact presence, not semantic checking:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/measurements.json` records
  `e7cf11a...` → `verdict:"baseline", value 0, findings []`, and `2d5eaaa...` → `value 12,
  verdict:"clean"`. The 0 is the line-61 branch (no receipt and no note), so it means “no retained
  acquisition”, not “semantics failed”.
- The measured revision `2d5eaaa...` is an ancestor of baseline `5f58577`; the only diff in the
  relevant tree between them is `corpus/evidence/round-21/measurements.json` and
  `corpus/evidence/round-21/selftest-c1.json`, both outside the counter’s `runtime/` prefix. The
  counted round-21 bytes are unchanged, so the old counter’s 12 describes the same retained
  acquisition that exists at baseline.

Semantic checking at round 21 was retained as prose plus a one-shot census, not as a durable
executable expectation set:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/final/semantic-witness-command.json`
  scopes its embedded Python command as “read-only raw discriminator/data census, not another
  executable semantic gate”.
- The witness itself is `author-side, not independent closure`.
- The witness exposes the exact hole in its own `limits`:
  “A coherent changed status can remain structural while contradicting the published contrast.”
- The witness’s `syntheticControl` is declared `{"class":"structural only, not a semantic oracle",
  "cases":12,"allSilent":true}`.
- The note’s final limits say the separate semantic review and outside admit/reject closure remain
  required.

Therefore the absence of a durable outcome oracle at baseline is expected and consistent with the
history: the round-21 observations were witnessed and reviewed, but the gate never encoded the
outcome classes. Saying the gate lacks an outcome oracle is not saying the rows are invalid; it is
saying the oracle was never executable or fixed. The new metric’s `before:0` is exactly “no fixed
expectations/note at baseline”, which matches the API contract that missing new expectations and
note means baseline 0.

## 6. Implications for the new oracle (derived from the evidence above)

- Keep the old counter frozen and unchanged; do not import `c1_lifecycle_observations` or its
  formula as the outcome oracle. The new metric must read fixed expectations independent of the
  evaluated receipt.
- Enforce the contract’s exact outcome classes: pending finite; `Completed` for
  click/requestSubmit/native/delayed/auto-positive; `Canceled` for reset/remove; `Error` for
  reject/throw/invalid-submit/auto-invalid.
- Preserve the witnesses that distinguish rows:
  - `submits:null` after native navigation must not equal `submits:[]` (`na-native-submit` versus
    the other rows). The old `unavailable-null-positive` green case shows the collapse to avoid.
  - `na-delayed` needs the release marker and the response inside the 755 ms after-window, not just
    any late response.
  - `auto-positive` and `auto-invalid` need the response before the pre-action observation and
    `preResponseCount=1`; an all-silent `action:none` trace is not those cases.
  - `na-pending` is finite-window absence in the retained 254 ms pre / 503 ms after windows; it is
    not an indefinite-pending claim.
  - `na-native-submit` needs the navigation and post-navigation unavailable submit state.
- Tests must mutate the summary and raw evidence coherently and update digest links, so a red
  outcome is caused by the semantic class, not by a stale hash. The old green cases
  `unavailable-null-positive`, `late-response-outside-window`, and `foreign-response-ignored`
  should not remain green under the new oracle unless the new contract explicitly admits them.

## 7. Confidence and remaining gaps

- High confidence in the code facts and line citations above; all are direct reads of the cited
  files. The only code-derived conclusion is the all-silent reachability at lines 126/139; it is
  corroborated by the retained all-silent positive fixture being recorded as a `12` pass.
- No gate, selftest, build, or browser was run for this report. Retained executed records are cited
  as historical artifacts.
- Not claimed: event authenticity against a malicious producer, universal browser semantics,
  indefinite pending, branch coverage, or source-to-binary equivalence. The round-21 witness and
  note make the same disclaimers.
- Open design detail for BuildOracle (not resolvable from baseline): whether “pending finite” is
  encoded as an explicit `Pending` status or as absence of a matching response within the two
  finite windows. The retained evidence supports only the latter; the expectations file must state
  which one it binds.
- No tools installed or updated; no mutations outside the assigned report.
