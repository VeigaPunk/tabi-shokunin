# RowOutcome05 — attack of the round-22 `na-reset` row (w2b falsification)

- Item: `na-reset` row of the repaired oracle `.ufo/waves/round-22/measure-c1.mjs`
- Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (read via `git show`/clone; lane read-only)
- Pinned oracle inputs: `corpus/evidence/round-22/semantic-expectations.json` (`EXPECTATIONS_SHA256` = `4a693dce…b60e1e`), `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, `scripts/webmcp-lifecycle-round21.mjs` (`PRODUCER_SHA256` = `bc11e4d6…48a811`)
- Retained raw under attack: `corpus/evidence/round-21/runtime/na-reset.json` (+ `.html` fixture, `receipt.json`, `.ufo/waves/round-21/runtime-execution-finalized.json`)
- Execution: private throwaway clone `/tmp/tabi-r22-w2b-RowOutcome05` (cloned from the lane, checked out at `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`); **no lane file, index or history was touched**; clone deleted after the run. Node `v24.21.0` (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`). No installs, no browser, no services, no delegation.
- Every mutation below is *coherent*: raw + receipt + acquisition record are rewritten together and **all digest links are resealed** (`receipt.cases[].evidence.sha256`, `execution.artifacts[…]`, `execution.receiptSha256`) exactly as the producer and the oracle's own selftest do.

## Verdict

The **outcome** semantics of the `na-reset` row are genuinely failure-capable: exact status, exact `errorText`, pre/post page state, response position and in-window navigation are all refused with named findings (matrix below). The **finite-window bounds** of the same pinned row are not: `pre.minMs/maxMs` and `post.minMs/maxMs` are measured only on the receipt's self-declared interval, whose start is free to float inside `[sent.at, pre.at]` / `[pre.at, actionFrame.at]`. Two raw mutations that contradict those pinned bounds on the retained raw's own timeline are counted as `clean` (metric 12, exit 0) by the real CLI gate. A third counted mutation records a page navigation that the oracle never reconciles with the observed URLs.

Headline: **F1/F2 are real instrument defects** (the pinned window bounds have no falsification power over the retained timeline); **F3–F6 are lower-severity coherence gaps**; the status/output/errorText/page-state core is sound.

Note-level relevance: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:24-25` states that "Expected statuses and outcome shapes are independent of the evaluated receipt: a coherently changed raw event and summary, with corrected digest links, must still fail the case's semantic expectation." That holds for the outcome/status side (see the refusal matrix) but **fails for the pinned window bounds**: F1 and F2 are exactly "a coherently changed raw event and summary, with corrected digest links" that do not fail the case's pinned `pre.maxMs` / `post.minMs` expectation.

---

## F1 (High) — the pinned pre-window bound is measured on a free-floating receipt start, not on the retained timeline

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:266-270`
  - `266: const preMs = preSummary.end - preSummary.start;`
  - `269: … preMs < expected.pre.minMs || preMs > expected.pre.maxMs ||`
  - `270: … preSummary.start < receiptStart || preSummary.start > pre.at || sent?.at > preSummary.start ||`
  - Producer construction (digest-pinned): `scripts/webmcp-lifecycle-round21.mjs:206` `const preStart = Date.now();` (immediately after the `WebMCP.invokeTool` result) and `:210` `preAction = { start: preStart, end: pre.at, windowMs: pre.at - preStart, … }`.
  - Pinned bound: `corpus/evidence/round-22/semantic-expectations.json` → `na-reset.pre = {minMs: 250, maxMs: 10000, …}`.
- Defect: `preMs` is a length of a **receipt-declared** interval, and its start is only lower-bounded by the *request* timestamp `sent.at` (`:270`). The producer's own construction makes that start the **invocation anchor** (`preStart` = the invokeTool result instant). Nothing ties `preSummary.start` to `commandResult.at`, which the oracle already holds (`measure-c1.mjs:211`). The retained corpus happens to satisfy the tight relation exactly (`preAction.start - invokeToolResult.at == 0`, measured), but the oracle does not require it, so the pinned `maxMs: 10000` never constrains how long after the invocation the observation was really taken.
- Smallest counterexample (counted): move the `pre-action` observation to **60 000 ms after the invokeTool result** on the raw timeline (all later frames shifted by the same delta), set `receipt.preAction.start = pre.at - 252`, `windowMs = 252`, and widen `receipt.startedAt/finishedAt` to cover the shifted frames. Raw timeline then reads `invokeToolResult→pre = 60 000 ms` — 6× the pinned `pre.maxMs` — while the receipt still reports a 252 ms window. Result (CLI, commit `bc895dceb090b5211b600e14d16450e923969695` in the throwaway clone): `{"value":12,"verdict":"clean","exit":0,"findings":[]}`, `na-reset.counted = true`. The mutated corpus is **not producible by the digest-pinned producer** (it sleeps exactly 250 ms after `preStart`), so this is a contradiction of the pinned row, not a re-encoding of the same truth.
- Preserving positive: the pristine corpus has `pre.at - commandResult.at = 252 ms` (all 12 cases: 252–254 ms) — inside `[250, 10000]`.
- Smallest fix (one check, retains the positive): require the receipt's window start to be the invocation anchor, i.e. add to the `finite-summary-windows` condition
  `preSummary.start - commandResult.at < 0 || preSummary.start - commandResult.at > 2` (the retained corpus has delta 0), and/or measure the bound on the raw timeline: `pre.at - commandResult.at < expected.pre.minMs || pre.at - commandResult.at > expected.pre.maxMs`.
- Verified: with the timeline check added (trial patch in the clone, `semantic_timing:na-reset:pre-window-on-raw-timeline`), the F1 counterexample is refused (exit 1) while the pristine corpus stays `value 12 / clean / exit 0`.

## F2 (High) — the pinned post-window bound is likewise free-floating; a 1 ms post-action observation is counted

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:267, 273-275`
  - `267: const afterMs = afterSummary.end - afterSummary.start;`
  - `273: … afterMs < expected.post.minMs || afterMs > expected.post.maxMs ||`
  - `274: … afterSummary.start < pre.at || afterSummary.start > actionFrame?.at || …`
  - `275: … actionFrame.at < afterSummary.start || completeFrame.at > afterSummary.end)`
  - Producer construction: `scripts/webmcp-lifecycle-round21.mjs:211` `const actionAt = Date.now();`, `:222` `frame('action-complete', …)`, `:224` `await sleep(500);`, `:225-226` `after = { start: actionAt, end: post.at, windowMs: post.at - actionAt, … }`.
  - Pinned bound: `na-reset.post = {minMs: 500, maxMs: 10000, …}`.
- Defect: `afterSummary.start` may float back to `pre.at` (`:274`), so `afterMs` can be satisfied by the pre→post distance rather than by the post-**action** wait the producer guarantees (500 ms sleep after `action-complete`). `completeFrame.at` is only checked as an **upper** bound (`completeFrame.at > afterSummary.end`, `:275`); there is no lower bound between the action completion and the after-action observation.
- Smallest counterexample (counted): set `action.at = post.at - 2`, `complete.at = post.at - 1`, `response.at = post.at - 1`, keep `receipt.after.start = pre.at` so the reported window is still 503 ms. Raw timeline then reads `actionComplete→post = 1 ms` — the pinned `post.minMs: 500` is violated by 499 ms — yet the row counts. Result (CLI, commit `732aeb93ad4fc69fdb06541c9583703374da25b5`): `{"value":12,"verdict":"clean","exit":0,"findings":[]}`, `na-reset.counted = true`. Not producible by the pinned producer (it sleeps 500 ms after `action-complete`).
- Preserving positive: pristine `post.at - completeFrame.at = 502 ms` for `na-reset` (all 12 cases: 501–754 ms) — inside `[500, 10000]`.
- Smallest fix: add `post.at - completeFrame.at < expected.post.minMs || post.at - completeFrame.at > expected.post.maxMs` (and/or pin `afterSummary.start` to the action frame: the retained corpus has `after.start - actionFrame.at == 0`).
- Verified: with the timeline check added (`semantic_timing:na-reset:post-window-on-raw-timeline`) the F2 counterexample is refused (exit 1); the pristine corpus remains `value 12 / clean / exit 0`.

## F3 (Medium) — recorded navigations are never reconciled with the observed URLs; the navigation anchor is the receipt's `after.start`

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:281-282` (receipt navigation summary), `:309-312`
  - `309-310: const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) => frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];`
  - `312: if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');`
  - URL checks are observation-only: `:140` (`url.origin !== origin || url.pathname !== expectedPath || …`), applied to `pre.value.url` / `post.value.url` only.
- Defect: the "no navigation" claim is evaluated only inside an interval whose lower bound is the receipt's `after.start` (attacker-sealed), and no rule ever ties a recorded `Page.frameNavigated` event to the URL that the page observations report. A raw can therefore record a navigation to a foreign path while both observations still claim the pinned `/na-reset` URL.
- Smallest counterexample (counted): insert `Page.frameNavigated` → `http://127.0.0.1:43143/other` into the raw before the action, and set `receipt.after.start = action.at` so the event falls outside the action window. Result (CLI, commit `9be23989322eeec4a9624f3505cea6d006e098b2`): `{"value":12,"verdict":"clean","exit":0,"findings":[]}`, `na-reset.counted = true`. (A navigation *inside* the action window is correctly refused — see the matrix row "nav during action".)
- Interpretation caveat (stated honestly): the producer defines `after.navigations` with the same `at >= actionAt` predicate (`scripts/webmcp-lifecycle-round21.mjs:226`), so under the oracle's narrow reading ("no navigation in the action window") F3 does not contradict the pinned `navigation: 'none'`; what it contradicts is the case-level reading ("this case performed no navigation") and internal coherence between the recorded navigation and the observed URLs. This is a scope/interpretation gap in the pinned field, not a proven contract violation.
- Preserving positive: in the retained corpus every `navigation:'none'` case records exactly **one** navigation event (the initial one) and `na-native-submit` (pinned `'landing'`) records two.
- Smallest fix: for `expected.navigation === 'none'`, require `navEvents.length === 1` (trial patch: `semantic_navigation:na-reset:unexpected-case-navigation`) — refused the F3 counterexample (exit 1) and kept the pristine corpus at `value 12 / clean`.

## F4 (Low) — the invokeTool command-result payload is unconstrained beyond `invocationId`

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:211` (`const invocationId = commandResult?.result?.invocationId;`), `:217-228` (chain check requires only `plain(commandResult.result)` + a string `invocationId`).
- Defect: extra keys in the same raw's command result are not compared, so a frame can carry a *second, contradictory* outcome claim (`status: 'Completed'`, `output: {ok:true}`) while the correlated event frame says `Canceled`; the oracle reconciles only the event frames.
- Smallest counterexample (counted): add `status`/`output` to the `WebMCP.invokeTool` result frame → `value 12, verdict clean, counted true`.
- Preserving positive: the pristine command result is exactly `{invocationId}`.
- Smallest fix: require the command result to have exactly the key set `{invocationId}` (deep-equal on `Object.keys(commandResult.result)`).

## F5 (Low) — cleanup/identity evidence fields of the raw are not validated

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:345-349` checks `browserPidsBefore`, `browserPidsAfter === []`, `contextClosed`, `closeError`, `blocked`, `downloads` — but not `browserPidsSeenAfterClose`, `browserPidsAtClose`, `processIdentities`, `processIdentitiesAtLaunch`.
- Defect / counterexample (counted): set `browserPidsSeenAfterClose = [999999]`, empty `browserPidsAtClose`, `processIdentities`, `processIdentitiesAtLaunch` → `value 12, verdict clean`. The oracle note itself states "PID cleanup remains sampled owned-process evidence" (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`), so this is a coherence gap, not a claim the oracle makes.
- Smallest fix: also require `raw.browserPidsSeenAfterClose` to be `[]` and `raw.browserPidsAtClose` to equal `raw.browserPidsBefore` (pristine: both `[]` / the recorded set).

## F6 (Low) — the receipt's acquisition envelope is not bound to the acquisition record that sealed it

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:443-451` (`receiptStart`/`receiptEnd` from `receipt.startedAt`/`finishedAt`; `receipt-acquisition-envelope` checks only schema/producer/environment/cleanup and `receiptEnd >= receiptStart`). The acquisition record's own `startedAt`/`finishedAt` (present in `.ufo/waves/round-21/runtime-execution-finalized.json`) are **never read** anywhere in `:410-456`, which is the whole execution/receipt envelope handling.
- Defect / counterexample (counted): widen `receipt.startedAt`/`finishedAt` by ±1 h → `value 12, verdict clean`. The oracle's frame-window check (`:176-177`) then admits frames far outside the acquisition record's actual interval.
- Preserving positive: pristine `receipt.startedAt = 2026-10-21T13:51:46.773Z` ≥ `execution.startedAt = 2026-10-21T13:51:46.597742+00:00`, and `receipt.finishedAt = 2026-10-21T13:51:58.439Z` ≤ `execution.finishedAt = 2026-10-21T13:51:58.460511+00:00`.
- Smallest fix: require `Date.parse(receipt.startedAt) >= Date.parse(execution.startedAt)` and `Date.parse(receipt.finishedAt) <= Date.parse(execution.finishedAt)`.

## F7 (Info) — the pinned response window is not ordered against the action-completion frame

- Revision/path/lines: `.ufo/waves/round-22/measure-c1.mjs:306-307` enforces only `actionFrame.seq < response.seq < post.seq`.
- Observation (counted): placing the `Canceled` response frame **before** the `action-complete` frame is still counted (`value 12, clean`). The pinned row (`responseWindow: 'action-to-post'`, `status: 'Canceled'`, `errorText: "Tool execution cancelled by a form reset"`) does not say the cancellation must follow the completion of the reset, so this is a boundary the pin does not cover rather than a contradiction. Recorded so the parent can decide whether the pin should say so.

## F8 (Info) — two raw fields are accepted without any check

- `raw.frames` may carry an observation frame with an arbitrary extra label (e.g. `post-extra`) and the matching `pageObservations` entry; the marker-set check only counts `pre-action` / `after-action` / `delayed-before-release` (`:183-190`) → counted (`value 12, clean`).
- The `action-complete` frame's `phase` is never inspected (only the `action` frame's phase is, `:192-198`); setting `phase: 'reset-never-dispatched'` is counted. Producer emits no phase on that frame at all (`scripts/webmcp-lifecycle-round21.mjs:222`), so an unvalidated field is attacker-writable.

---

## Confirmed refusals (the "no hole" half) — mutation → exact refusing code line

All of the following were applied to the retained `na-reset` row with full digest resealing and were **refused** (metric 0, exit 1, verdict `failed`):

| Mutation class | Example | Refusing code (revision `e3cf4e0d`) | Finding |
|---|---|---|---|
| status flipped | `Canceled` → `Completed` + `output` | `measure-c1.mjs:291` (`outcome-status`), `:296-298` (`exact-error-text-or-output-presence`), `:259-260` (`finite-window-response-statuses`) | `semantic_status:na-reset:outcome-status`, `semantic_error:na-reset:exact-error-text-or-output-presence` |
| errorText wrong / absent | `Tool execution cancelled` / deleted | `:293-298` (deep-equal of the whole response param object) | `semantic_error:na-reset:exact-error-text-or-output-presence` |
| extra `output` on the response | `{status, errorText, output}` | `:296` | `semantic_error:na-reset:exact-error-text-or-output-presence` |
| post page state changed | `formActive` true / `value` = nonce / `focused` changed / `url` changed / `errors` non-empty / `submits` invented / `nonce` changed / `secureContext` false | `:112-114`, `:127`, `:129-130`, `:140` | `semantic_status:na-reset:post:form-state`, `semantic_navigation:na-reset:post:url`, `semantic_error:na-reset:post:page-errors`, `semantic_status:na-reset:post:submit-event` |
| pre page state changed | `value`, `formActive`, `nonce` | `:112-114`, `:119-120` | `semantic_status:na-reset:pre:form-state`, `semantic_status:na-reset:pre:nonce-state` |
| stale post observation (post = pre) | — | `:112-114` | `semantic_status:na-reset:post:form-state` |
| response moved before the action / after post | — | `:306-307`, `:259-260` | `semantic_timing:na-reset:response-outside-action-window` |
| duplicate response | — | `:289` (`response-count`), `:259-260` | `semantic_status:na-reset:response-count` |
| response for another invocation | — | `:256` (`response-other-invocation`), `:229-230` | `evidence_binding:na-reset:response-other-invocation` |
| navigation inside the action window | `Page.frameNavigated` → `/other` | `:309-312` | `semantic_navigation:na-reset:unexpected-post-action-navigation` |
| case mix-up (na-remove content in na-reset.json) | — | `:161-168` (identity/fixture), `:217-228` (invocation chain), `:236-244` (loopback navigation) | `evidence_binding:na-reset:case-identity-or-fixture`, `semantic_navigation:na-reset:initial-loopback-navigation` |
| duplicate observation marker | — | `:189-190` (`observation-marker-set`), `:181` | `semantic_timing:na-reset:observation-marker-set` |
| fixture digest swapped | — | `:161-168` | `evidence_binding:na-reset:case-identity-or-fixture` |
| tool input changed | `q` ≠ nonce | `:217-228`, `:233-234` | `semantic_output:na-reset:invoked-input` |
| digest chain broken (no reseal) | — | `:471-472` (receipt raw digest), `:432-435` (acquisition artifact digests), `:430-431` (receipt digest in the acquisition record) | `evidence_binding:na-reset:receipt-raw-digest`, `evidence_binding:acquisition-artifact:…` |

The status/output/errorText core and the pre/post page-state core of `na-reset` are therefore **not** bypassable by a coherently resealed raw mutation: F1/F2 concern only the pinned *window bounds*, and F3–F8 concern unreconciled side-fields.

---

## Commands run (all in the throwaway clone; lane untouched)

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `{"value":12,"verdict":"clean","exit":0}` (control) |
| 2 | same CLI on mutated commit `bc895dce…` (F1) | 0 | `{"value":12,"verdict":"clean"}` — **counted** |
| 3 | same CLI on mutated commit `732aeb93…` (F2) | 0 | `{"value":12,"verdict":"clean"}` — **counted** |
| 4 | same CLI on mutated commit `9be23989…` (F3) | 0 | `{"value":12,"verdict":"clean"}` — **counted** |
| 5 | trial oracle (`measure-c1-fixed.mjs`, clone-only patch) on `bc895dce…` / `732aeb93…` / `9be23989…` | 1 / 1 / 1 | `pre-window-on-raw-timeline` / `post-window-on-raw-timeline` / `unexpected-case-navigation` |
| 6 | trial oracle on the pristine revision | 0 | `{"value":12,"verdict":"clean","findings":[]}` (positive preserved) |
| 7 | in-process `evaluate()` battery `attack3.mjs` (17 page-state/binding/identity/cleanup mutations, `N1`–`N17`) | — | 12 refused, 5 counted (F4, F5, F6, F8) |
| 8 | in-process probe `attack4.mjs` (response placed before the `action-complete` frame) | — | counted (`value 12, clean`) — see F7 |

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` shows only the wave's own untracked files (other seats'); no tracked lane file changed. The clone was removed after the run.

## Residual risk and verification gaps (honest)

- **No browser was run** (out of bounds). All statements are about the retained corpus and the oracle's behaviour over it; nothing here establishes a live Chromium outcome.
- The F1/F2 severity rests on reading the pinned `minMs/maxMs` as invocation/action-anchored bounds. A reviewer who reads them as bounds on the receipt's *declared* interval only will rate these lower — the mutation is still counted either way, and the raw timeline contradicts the producer's own construction (`preStart`/`actionAt`), which the oracle does not check.
- F3's materiality depends on the intended scope of `navigation: 'none'` (action window vs whole case); both readings are stated above and neither was silently resolved.
- The trial fix was exercised only on the `na-reset` row plus the whole-corpus control (value 12 preserved). I did not run `measure-c1.mjs --selftest` against the patched oracle (the selftest's own expectations are pinned to the current findings and would need re-pinning); that check was **not run** and is listed here as a gap, not claimed.
- Other seats in this wave (`MutateTiming.md`, `MutateLanding.md`, `MutateStatus.md`, `MutateOutput.md`) may overlap F1/F2; I did not read their reports, so duplication is possible.
- I did not audit the other 11 rows; the refusal matrix above is specific to `na-reset`, and the `na-native-submit` landing branch (`:313-325`) was only touched indirectly.

## Out of scope (explicitly not claimed)

Malicious-author authenticity, publisher/browser identity, generalization beyond the retained Chromium 154 acquisition, feature requests about new cases or new windows, and any claim about live browser behaviour are not part of this row attack.
