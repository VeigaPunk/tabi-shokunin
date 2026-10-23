# RowTrace07 — `na-reject` raw frame trace vs oracle row vs note row

- Reviewer seat: TabiR22-2.RowTrace07-12 (w2b, author-side falsification)
- Revision under review: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (HEAD, landed/pushed; verified `git rev-parse HEAD` = that value)
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Method: static review only. No lane script was executed (no `measure-c1.mjs`, no `selftest-c1.mjs`, no producer, no browser). Values below were read from git blobs at the named revision and cross-checked against retained receipts by plain JSON inspection.
- Verdict: **no mismatch** between raw evidence, the fixed expectation, and the `na-reject` note row. Four non-blocking observations (O1–O4), none an actual defect in the traced data.

## 1. Raw frame trace

Source: `corpus/evidence/round-21/runtime/na-reject.json` @ `e3cf4e0` (sha256 `a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741`; equals `receipt.json` `cases[6].evidence.sha256` and `.ufo/waves/round-21/runtime-execution-finalized.json` `artifacts[...]`). Nonce `8e99a921-6728-42cd-82ed-30cd46cf238f`; invocation `DAB4A9A79B522E21D49C7D2737F56E7E`.

| Stage | seq | at (epoch ms, UTC) | dir | payload (path:line) |
|---|---|---|---|---|
| invokeTool sent (cmd 4) | 9 | 1792590712731 (13:51:52.731Z) | sent | `method:"WebMCP.invokeTool"`, `frameId 3140…0946`, `{q: nonce}` — na-reject.json:133–145 |
| invokeTool result | 10 | 1792590712732 | result | `{invocationId: DAB4A9A7…6E7E}` — :147–154 |
| toolInvoked event | 11 | 1792590712732 | event | same `invocationId`, `toolName:"lifecycle"`, input echo — :156–166 |
| **pre-action** observation | 12 | **1792590712985** | observation | `submits:[] errors:[] formActive:true value:nonce focused:"go" url:http://127.0.0.1:43143/na-reject` — :168–183 |
| **action** `requestSubmit` | 13 | **1792590712985** | action | `phase:"dispatch-started"` — :185–190 |
| action-complete | 14 | 1792590712986 | action-complete | `action:"requestSubmit"` — :192–197 |
| **response** `toolResponded` | 15 | **1792590712986** | event | `status:"Error"`, `errorText:"respondWith promise was rejected"` — :198–207 (:204–205) |
| **release** | — | — | — | **absent**: 0 frames with `dir:"release"` in all 16 frames |
| **post-action** observation | 16 | **1792590713487** | observation | `submits:[{agentInvoked:true,isTrusted:true,q:nonce,active:true,respondWith:"function"}]`, `errors:["Uncaught Error: dummy rejection"]`, `formActive:false`, same URL/value/focus — :209–235 |

Frames are seq 1..16 contiguous and `at` is non-decreasing (ties at seq 1/2, 5/6/7/8/9, 10/11, 12/13, 14/15). `pageObservations` (:236–279) deep-equals the two observation frames (`seq` 12 and 16, same `at`/`value`). Receipt windows: `preAction = {start:1792590712732, end:1792590712985, windowMs:253, responseCount:0, formActive:true}`; `after = {start:1792590712985, end:1792590713487, windowMs:502}` (`receipt.json` `cases[6]`).

Timing facts worth naming: the Error response lands in the **same millisecond** as `action-complete` (both 1792590712986), so for this case "response after action" is an ordering claim (seq 14 < 15), not a clock-gap claim. The response is 1 ms after `actionAt` (1792590712985) and 501 ms before the post observation. The pre-action observation is taken 253 ms after the tool was invoked (seq 11, 1792590712732); i.e. "pre-action" means before the form action, after the pending tool call, exactly as `autosubmit:false` implies.

## 2. What `measure-c1.mjs checkCase` reads

Producer of the row: `.ufo/waves/round-22/measure-c1.mjs` @ `e3cf4e0` (sha256 `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c`).

`rows[].sequence` is built at measure-c1.mjs:359–366:
`invocation = invoked?.seq` (the `WebMCP.toolInvoked` **event**, :210/:360), `preAction = pre.seq`, `action = actionFrame.seq`, `response = matchingResponses[0].seq` (:363), `release = frames.find(dir==="release")?.seq ?? null` (:364), `postAction = post.seq`.

Statutory checks that bind the trace (all pass for this raw):
- seq/at monotonicity and receipt-window membership — :174–177.
- observation raw link and marker set — :178–190.
- `pre.seq < action.seq < complete.seq < post.seq` and `action.phase==="dispatch-started"` — :196–200.
- invocation chain `sent.seq < result.seq < invoked.seq < pre.seq` (:227), id cross-links (:219–230).
- window statuses: `statuses(seq<pre.seq) == []` and `statuses(seq<post.seq) == ["Error"]` — :257–260 vs expectation `pre.statuses`/`post.statuses`.
- window arithmetic and receipt-summary equality (responses, pageState, submits, navigations) — :268–282.
- exact response params deep-equal `{invocationId, status:"Error", errorText:"respondWith promise was rejected"}` — :289–299.
- `responseWindow==="action-to-post"` ⇒ `action.seq < response.seq < post.seq` — :306–307.
- `navigation:"none"` ⇒ no navigation with `at >= after.start && seq < post.seq` — :309–312 (only nav frame is seq 3 at 1792590712722, before the window).
- non-delayed case ⇒ any release frame would emit `semantic_delayed: unexpected-release-marker` — :341–342; raw has none.

Derived row (also the retained output): `{outcome:"Error", semanticMatch:true, counted:true, sequence:{invocation:11, preAction:12, action:13, response:15, release:null, postAction:16}, findings:[], rawDigest:"a57b41bd…9f741"}`.

Retained witness `.ufo/waves/round-22/checks-at-e3cf4e0.json`, run `c1-after` (argv `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0…`, producerSha256 `47176aed…0775c`): value 12/clean/exit 0, `findings: []`, and the `na-reject` row identical to the derivation above. Outcome distribution in that output is 1 Pending / 5 Completed / 2 Canceled / 4 Error, matching the note's projection. The `c1-after` run in `.ufo/waves/round-22/checks-pre-w2-0f24164.json` shows the **identical** `na-reject` row with `counted:false`; the 0 at checkpoint `0f24164` came from global `blocked` (measure-c1.mjs:480–485, findings `na-native-submit:post:page-errors` / `:url`), not from any `na-reject` disagreement. The repair changed `measure-c1.mjs` (`76b47edd…` → `47176aed…`) and, per `.ufo/waves/round-22/post-crash-repair.json` (confirmed by blob digests), `selftest-c1.mjs` and `fixtures/expected.json`; the note, expectations and this raw are byte-identical at both revisions.

## 3. Note / expectation / raw cross-check

Note row: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:43` —
`| na-reject | Error, exactly “respondWith promise was rejected” | swapping the programming-error diagnostic or adding success output |`

Expectation: `corpus/evidence/round-22/semantic-expectations.json:110–120` (digest `4a693dce…60e1e` = pin at measure-c1.mjs:22).

| Clause | Note | Expectation | Raw | Agree |
|---|---|---|---|---|
| status | `Error` | `response.status:"Error"` (:117) | frame 15 `status:"Error"` | yes |
| diagnostic text | `respondWith promise was rejected` (typographic quotes) | byte-identical `errorText` (:117) | byte-identical (:205) — extracted note quote equals raw string exactly | yes |
| response window | (structural; delegated to `fixed expectations` at md:50–51) | `action-to-post` (:116) | seq 15 between action 13 and post 16 | yes |
| pre window | — | 250–10000 ms, no status yet, active form, `submits:[]` (:118) | 253 ms, `statuses:[]`, `formActive:true`, `submits:[]` | yes |
| post window | — | 500–10000 ms, `statuses:["Error"]`, `submitCount:1`, `errors:["Uncaught Error: dummy rejection"]`, `formActive:false` (:119) | 502 ms, one Error, one trusted `agentInvoked` submit with `respondWith:"function"`, exactly that page error, `formActive:false` | yes |
| navigation | — | `none` (:120) | no `Page.frameNavigated` after `after.start`; URL unchanged | yes |
| release | not claimed | field absent (`delayed` undefined) | no release frame | yes |
| distinction from `na-throw` | reject "swapping the programming-error diagnostic" | `na-throw` pins the programming-error text (:130) | na-reject has the rejection text; na-throw has "The site has a programming error: it called preventDefault()…" | yes |

No clause in the note row, the expectation, or the raw sequence contradicts another. The note's general statement that each `<id>.json` "retains the invocation-correlated ordered frames" (md:31–33) holds for this file, and its projection sentence (md:52–53) matches the retained rows.

## 4. Observations (non-blocking; none is a defect in the traced data)

**O1 — `sequence.invocation` names the event, not the command.** `e3cf4e0:.ufo/waves/round-22/measure-c1.mjs:360` sets `invocation = invoked?.seq` = the `WebMCP.toolInvoked` event (seq 11), while the invocation *command* is `sent WebMCP.invokeTool` (seq 9). Smallest counterexample: a reader reconstructing the chain from `rows[].sequence` would look for 9 and find 11. Preserving positive: all 12 rows use the same convention (na-pending also 11), and the full `sent<result<event<pre` chain is separately enforced at :227. Smallest fix: rename the field to `invoked` (or document it in the note). Cosmetic.

**O2 — the note's table text is not machine-bound.** `checkCase` never reads the note; the only note read is the first line for `SOURCE_HEADER` (measure-c1.mjs:395–400). Smallest counterexample (static, not executed): edit md:43's quoted diagnostic while leaving everything else unchanged; no code path parses that text, so the gate cannot fail on it — expectations carry the exact string and are pinned by `EXPECTATIONS_SHA256` (:22, :392). Preserving positive: the first-line mutation *is* caught (`bad-source-header` selftest → `source_binding`). Smallest fix: none demanded — the note itself delegates exact strings to the expectations (md:50–51); record it as a documentation-integrity limitation, not a contract breach.

**O3 — no selftest mutant for same-status diagnostic substitution.** The note's reject column claims a *swapped* diagnostic is rejected. Available mutators (`e3cf4e0:.ufo/waves/round-22/selftest-c1.mjs:125–154` `wrongStatus`, :190–196 `missing-error-text`, :325–331 `legacy-status-swap`; cohort entries `.ufo/waves/round-22/fixtures/expected.json:109`, `:219`) cover deletion and status swap to Completed + success output, not `Error` + a different `errorText`. Counterexample (hypothetical mutant, not run): replace frame 15's text with the `na-throw` text and sync `receipt.after.responses` — measure-c1.mjs:293–297 deep-equals the whole `params`, so it would emit `semantic_error: exact-error-text-or-output-presence`; failure-capability holds by construction, only the demonstration is missing. Preserving positive: retained `missing-error-text-na-reject` passes with `semantic_error`. Smallest fix: add a same-status substitution mutant to the selftest.

**O4 — cited serial receipt is untracked (out of my item's semantic scope).** `.ufo/waves/round-22/checks-at-e3cf4e0.json` exists only in the working tree (`git status --short` → `??`); it is not a blob at `e3cf4e0` (`git ls-tree -r` at that revision lists `checks-pre-w2-0f24164.json` but not `checks-at-e3cf4e0.json`). I did not treat it as committed evidence; I used it only after confirming its `revision` field is `e3cf4e0`, its `c1-after` `producerSha256` equals the committed `measure-c1.mjs` blob digest, and its `na-reject` row `rawDigest` equals the committed raw digest. Retention/conformance owner: the wave-conformance seat, not this item.

Not relied on: `.ufo/waves/round-21/history/runtime-v1..v4/na-reject.json` are different acquisitions (different nonces); v1 has only 13 frames (no pre-action/action-complete/post-action markers). The note cites none of them; I compared them only to confirm the corpus file is the later finalized form.

## 5. Checks not run (honest statement)

- I did **not** execute `.ufo/waves/round-22/measure-c1.mjs`, its `--selftest`, `run-checks.py`, or the round-21 producer. No browser, no REA, no services, no installs/upgrades (nothing needed).
- All numeric claims above come from static reads of git blobs at `e3cf4e0` plus the retained JSON receipts, cross-checked by `sha256sum`/`python3` over `git show` output (each command exit 0). The only "mismatch" checks I could not exercise are runtime-only ones (e.g. re-running the gate); none is needed to answer this item, and I claim none.

## 6. Bottom line

For `na-reject` at `e3cf4e0`, the raw frame sequence (`9/11 → 12 → 13 → 14 → 15 → 16`, no release), the derived `rows[].sequence` (`11/12/13/15/null/16`), the fixed expectation (Error + exact rejection diagnostic, `action-to-post`, no navigation), and the note row (md:43) are mutually consistent. The distinction from `na-throw` is preserved in the raw text. No actual bug found in this item.
