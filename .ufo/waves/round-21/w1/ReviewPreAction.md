# Round 21 — pre-action ordering review

Axes reviewed: invocation-to-observation ordering, action gating on invocation identity, and evidence-order recoverability.

## Findings

### P2 — Invocation errors do not gate the non-auto action

**Failure shape:** If `WebMCP.invokeTool` rejects (for example, a protocol error) or returns no usable `invocationId`, the runner records `invokeError`/an absent ID and still proceeds to its assigned click, `requestSubmit`, native submit, reset, or remove action. The result is then an action with no live correlated invocation, not the intended non-autosubmit lifecycle observation; `responses()` filters by that missing ID and cannot recover a matching invocation. The producer can consequently write an apparently complete fixed case set from this failure path.

**Evidence:** `scripts/webmcp-lifecycle-round21.mjs:153-155` catches the command error without leaving the case; `:155-167` unconditionally observes and dispatches the action. `:158` correlates responses to `invocationId`, but there is no non-empty-ID guard. The contract in `.ufo/waves/round-21/w1-spec.json:3` requires non-auto action only after invoke and bounded pre-action observation. Round 17's `corpus/knowledge/webmcp-invocation-round-17.md:50-53,70-72` distinguishes the command response/id from invocation outcome; its declarative probe records the no-autosubmit form pending until a later `requestSubmit` (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:42-53,71-73`).

**Minimum acceptance:** Preserve and report `invokeError`, but do not dispatch a non-auto action unless the invocation command succeeded with a non-empty `invocationId`. On failure, record an explicit no-action/incomplete case or fail the run; the counter must not count it as a completed observation. This is a conditional error-path defect, not an observed failure in the retained run: `corpus/evidence/round-21/runtime/receipt.json` shows all 12 current cases with IDs and null `invokeError`.

### P3 — Retained evidence cannot independently prove strict pre-observation/action order

**Failure shape:** The runner's source order is correct, but the case artifact does not put the pre-action observation and action boundary in one ordered sequence. `frames[].seq` orders CDP frames and the synthetic action marker; `pageObservations[]` is separate and has only millisecond `Date.now()` values. In every checked non-auto action case, the `pre-action` timestamp equals the action-marker timestamp. A consumer re-deriving evidence cannot prove strict observation-before-action from the artifact itself, and the marker is emitted before the Playwright/page action is dispatched.

**Evidence:** `scripts/webmcp-lifecycle-round21.mjs:153-160` awaits invoke and observation, then `:161-167` emits an `action` marker and dispatches. In retained `corpus/evidence/round-21/runtime/na-click.json`, invoke result is frame `seq:10`, action marker is `seq:12` at `1792586384190`, and `pageObservations[label=pre-action].at` is also `1792586384190`. The same timestamp tie occurs in `na-requestsubmit.json`, `na-native-submit.json`, `na-reset.json`, `na-remove.json`, `na-reject.json`, `na-throw.json`, `na-delayed.json`, and `na-invalid-submit.json`. Thus the source establishes intended program order, but the raw per-case evidence does not independently attest its strict order.

**Minimum acceptance:** Add a pre-action-observation completion marker to the same monotonic sequence as invocation result and action boundary, after the observation returns; make the action boundary identify the dispatch call (not only a prior intent marker). Require the counter to derive `invoke result < pre-action observation < action boundary` from that sequence and correlated evidence.

## Residual risk and verification gaps

- Round 19's runtime validation note is scoped to autosubmit forms and explicitly excludes non-autosubmit lifecycle behavior (`corpus/knowledge/webmcp-declarative-validation-round-19.md:15-20`); it does not close either finding.
- Round 20 is a source-only, finite branch note and cautions that source callsites do not prove end-to-end runtime effects (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:9-17,100-106`). It is not runtime evidence for this ordering contract.
- Existing round-21 artifacts were read only; no browser, tests, build, or other check was run. The isolated `clones` directory was empty when inspected, so no BuildRuntime/BuildCounter clone was available to review. `lsp` is not a mounted device in this session (the `xd://lsp` lookup returned “No such tool”); no semantic LSP results are claimed.
- The current retained receipt shows invoke IDs and errors for the existing run, but cannot rule out the caught-error branch above or repair the artifact timeline gap.