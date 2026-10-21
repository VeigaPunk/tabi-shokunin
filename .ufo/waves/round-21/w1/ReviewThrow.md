# ReviewThrow — round21 `na-throw` handler semantics, first falsification

Reviewer: TabiR21.ReviewThrow (UFO-FSD reviewer seat, leaf). Baseline e7cf11a810003d4a65cc85bd265f2c17dd65b738.
Scope: the committed throw-handler behavior (`na-throw`, adjacent `na-reject`/`na-delayed`), the committed producer `scripts/webmcp-lifecycle-round21.mjs`, counter `.ufo/waves/round-21/measure-c1.mjs`, and the isolated clones. No checks, tests, builds, or browser runs were executed. No tools were installed or updated.

Evidence classes: raw observed frames/page state vs S100 source interpretation are separated below. S100 = `.ufo/waves/round-21/sources/html_form_element.cc` (decoded sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, `.ufo/waves/round-21/source-opening.json`), same body as round-20's S096/S078.

LSP note: no `lsp` device is mounted in this session's tool inventory; all caller/definition checks here are text-level (`grep`/`read`). Nothing below should be read as semantic proof from a language server.

## What the committed run actually shows (raw observed)

- `corpus/evidence/round-21/runtime/na-throw.json` seq12: pre-action observation at wall `1792587221190` — `submits:[]`, `errors:[]`, `formActive:true`, `focused:"go"`, zero correlated responses in the finite pre window `[1792587220937,1792587221190]` (`receipt.json:409-417`).
- seq13/14: `action requestSubmit` at `…1190`, `action-complete` at `…1191`. seq15: `WebMCP.toolResponded` at `…1191`, same `invocationId` `8610EAFF26447433A5D12C5AA533F7B4` as the `WebMCP.invokeTool` result (seq10), `status:"Error"`, `errorText` exactly the S100:810-813 joined literal "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result".
- seq16: after-action observation at `…1693` — `submits:[{agentInvoked:true,isTrusted:true,q:<nonce>,active:true,respondWith:"function"}]`, `errors:["Uncaught Error: dummy submit handler throw"]`, `formActive:false`, url unchanged, `navigations:[]` (`receipt.json:426-455`).
- Digest chain intact: `na-throw.json` sha256 `2effe188a6e2bebb8760c6687237bdfa044af6d35697ebf5a6968fddc12c4da7` = `receipt.json:461`; `na-throw.html` sha256 `98ac65e43814f4fa03d758215401a31be1f6c8f16c659e872a3691074dc78a40` = `na-throw.json` `fixture.sha256`. Fixture ordering (na-throw.html script): record submit → `e.preventDefault()` → `throw Error('dummy submit handler throw')`, no `respondWith`.
- Adjacent finite contrasts: `na-reject.json:204-205,224-226` — fixed `errorText:"respondWith promise was rejected"` while the page error event carries the actual rejection value `Uncaught Error: dummy rejection`; `na-delayed.json` — `delayed-before-release` observation (seq15, `errors:[]`, submit recorded) → `release` frame (seq16) → `toolResponded Completed` (seq17) → after-action (seq18), response strictly after explicit release.

## Findings by severity

### MEDIUM-1 — Attribution boundary: the throw does not complete the callback, and the frames cannot show that it did

The committed evidence supports only this finite statement: preventDefault-then-throw fixture, correlated `toolResponded Error` naming preventDefault-without-respondWith, arrived in the same wall-clock millisecond as `action-complete`, with zero prior correlated responses and a page-side throw witness sampled ≥500 ms later. It does **not** evidence (a) renderer-internal ordering between the exception report and the C++ `CallDoneCallback` — per S100 that callback runs at `html_form_element.cc:807-813` only after `DispatchEvent` returns (`:775-776`) with `should_submit=false`, i.e. the browser branch, not the throw, produces the Error; (b) the CDP `toolResponded` frame is a wire event, not the `CallDoneCallback` `Run` itself (delivery/cleanup conditioning is LC07, S100:261-275); (c) throw-vs-response order — `errors[]` has no per-event timestamp, only the 500 ms-later snapshot, and the CDP session enables no Runtime/console domain (`scripts/webmcp-lifecycle-round21.mjs:130` listens only `WebMCP.*` + `Page.frameNavigated`).
Falsifiable failure shape: any wording like "the handler exception failed the invocation at `…1191`" or "callback completed at seq15" is overreach falsifiable by the evidence's own lack of ordering witness.
Minimum acceptance: keep the row wording order-independent (current note row and `w1/RevCase08.md:18,26` already do), or add a timestamped per-event witness (the isolated BuildRuntime clone now records per-error `seq/at/monoMs` and `defaultPreventedAtThrow` — keep it).

### MEDIUM-2 — Untested ordering counterfactual is the cheapest falsification of "throw ⇒ Error"

Every committed error fixture calls `preventDefault()` before throwing/rejecting. A handler that throws **before** `preventDefault` leaves dispatch uncanceled, so `should_submit = DispatchEvent(...) == kNotCanceled` stays true (S100:775-776) and the `if (should_submit)` branch runs `ScheduleFormSubmission` + `CallDoneCallback(base::ok(String()))` (S100:818-830, literal at `:829`) — source-predicted observed outcome: `Completed` (navigation-intent sentinel) plus `Page.frameNavigated` to `/landing`, with the throw still visible in `errors[]`. No committed case covers this ordering; `corpus/knowledge/webmcp-nonautosubmit-round-21.md` (na-throw boundary) and `w1/ConnPlanner.md:65-66`, `w1/RevCase08.md:26`(c) correctly flag it untested.
Minimum acceptance: any generalization "a throwing submit handler fails the invocation" must stay scoped to preventDefault-then-throw, or a throw-first variant must be run and its raw outcome (predicted Completed + navigation) recorded as its own finite observation.

### MEDIUM-3 — Producer defect: mislabeled console summary on pre-push case failure

`scripts/webmcp-lifecycle-round21.mjs:190` prints `receipt.cases.at(-1)` after the per-case `finally`. If case k fails before the receipt push at `:179` — e.g. `invoke_failed_before_action` (`:157`), `tool_not_registered` (`:153`), launch/version mismatch — the `LIFECYCLE_OBSERVED` line prints case k−1's `pre=`/`statuses=` under id_k; on case 1 `.at(-1)` is `undefined` and the TypeError escapes the loop, skipping the remaining 11 cases (receipt still saved by the outer `finally`, cleanup intact). Not exercised in the committed run (all 12 pushed); defect is in the failure path only.
Minimum acceptance: reuse/guard the per-case `record` already computed at `:185` and skip the summary line when absent.

### LOW-1 — `after.responses` is case-lifetime-scoped, not window-bounded

`responses()` (`scripts/webmcp-lifecycle-round21.mjs:161`, evaluated at `:178`) filters only by `invocationId`; a correlated response arriving between the after-action observation and that evaluation would be listed under `after` although outside `after.windowMs` (`after.end = post.at`). Counter mirrors the producer (`measure-c1.mjs:96`, `summary_mismatch`), so it would not flag the mismatch. Committed run unaffected: every counted response precedes its `after.end` (na-throw `…1191 < …1693`; na-reject/na-delayed likewise), and na-pending has none.
Minimum acceptance: bound the collection by `f.at <= post.at` (or record a close-time count) before any "within the named window" phrasing is load-bearing.

### LOW-2 — defaultPrevented-at-throw is pinned by fixture bytes, not by recorded runtime state

The committed `submits[]` entry records `agentInvoked/isTrusted/q/active/respondWith` but not `event.defaultPrevented`; ordering is evidenced statically by the committed fixture bytes (na-throw.html: push → preventDefault → throw), the exact errorText, and observed no-navigation. `w1/ConnPlanner.md:103` declares a missing defaultPrevented-at-throw record a falsifier. The BuildRuntime clone closes this (`submission.defaultPreventedAtThrow`/`AfterPreventDefault`, clone lines 263-266). Interface message sent to `TabiR21.BuildRuntime`.

### Verified non-defects (evidence-backed, not guessed passes)

- Knowledge note row for na-throw (`webmcp-nonautosubmit-round-21.md`, Observations table) states observed Error text and scopes S100:807-813 with the untested-throw-first caveat — matches the committed bytes; no callback-completion pretense found in the note, `w1/RevCase08.md`, or `w1/ConnPlanner.md`.
- Counter honors "no fabricated expected status": `evaluate()` pins no status/errorText per case (`measure-c1.mjs:28,79,94-96`); it re-derives invocation identity (`:87-91`), event identity (`:92-94`), receipt↔evidence summaries (`:96`), window arithmetic (`:95`), and digest chains from full-40hex Git blobs (`:108-115`). `c1_lifecycle_observations=12 exit0` therefore does not certify na-throw=Error — that pin lives in the note row plus the verified evidence/receipt digests; docs semantic review remains separate, consistent with the contract.
- na-reject run gives direct finite support to LC10's "the text is not the rejection value": fixed `errorText` vs page-carried `Uncaught Error: dummy rejection` (`na-reject.json:204-205,224-226`).

## Residual risk

- Wire-event-vs-callback and renderer-order gaps (MEDIUM-1) persist in the committed evidence even though current wording is safe; future abstracts could overreach.
- The throw-first counterfactual (MEDIUM-2) remains runnable cheaply and would flip status per source prediction; until run, "throw ⇒ Error" must stay ordering-scoped.
- Clone drift is material (clone `webmcp-lifecycle-round21.mjs` 1056 lines vs committed 210; stricter `HOST_RESOLVER_DENY MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`, extra CDP events `toolsRemoved/targetDestroyed/Inspector.detached`): its future evidence is not byte-comparable to the committed run; integration must import committed blobs, not the mutable clone.

## Verification gaps

- No counter invocation, no selftest, no browser run (out of seat scope; runtime executor owns the experiment; final verification is L1's).
- `w1-task-result.json:915` showed the RevCase01 revenger slot still `pending` at read time; `w1/RevCase08.md` (the na-throw reconstruction) had landed and was reviewed here. No actor-quiescence claim is made.
- S100 supplies branch/callsite interpretation only; no source-to-Arch-binary equivalence is claimed, and the renderer→CDP bridge for the Error payload is outside the retained anchor.

Report: `.ufo/waves/round-21/w1/ReviewThrow.md`. Trailers: sources S100 (tag 154.0.8037.97, decoded sha256 as above); runtime evidence S101 `corpus/evidence/round-21/runtime/na-throw.json` / `receipt.json`; producer blob `scripts/webmcp-lifecycle-round21.mjs`; counter `.ufo/waves/round-21/measure-c1.mjs`; interface message delivered to `TabiR21.BuildRuntime`.
