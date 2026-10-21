# RevInvoke: tabi round-22 w1, invoke→observation ordering, return-ID error path, expected mapping

Seat: revenger (read-only). Only write: this file. No tests, builds, linters, browser, network, REA, or production edits were run or made. The only checks executed were read-only reads of retained bytes and JSON (digest comparison, field extraction) to confirm the facts cited below.

Tags: **[obs]** retained raw/receipt fact. **[prod]** `scripts/webmcp-lifecycle-round21.mjs` line. **[src]** retained Chromium body `.ufo/waves/round-21/sources/html_form_element.cc` line (note: tag 154.0.8037.97; supports the state machine, not binary equivalence). **[frozen]** `.ufo/waves/round-21/measure-c1.mjs` line. **[derived]** bound computed from producer constants. **[INFERENCE]** not directly observed. **[DECISION]** needs a BuildOracle/L1 choice (§8).

## Summary

1. The frozen counter performs no status, errorText, output, page-error, release, navigation-identity, or server-log check. Coherent mutations that swap statuses or erase responses therefore pass it (NC-1, NC-2; §6, §7).
2. The selftest base `fixtures/positive-ordered.json` is synthetic and all-silent: no `WebMCP.toolResponded` frame in any of its 12 trails. Its `positive` value 12 is a structural pass only (§7 G8).
3. The producer asserts no status, pre-state, formActive, toolInvoked presence, or `respondWith` call. Its per-case assertions are browser PIDs, Chromium version, tool registration, invocation-ID type, and boundary (§1.1).
4. Invoke failure is a run-level failure: no row is pushed, the receipt persists partial, and CLI exit is 1. `invokeError` in any persisted row is structurally always null. The error branch was never exercised in retained evidence. v1 had a non-throwing branch that would read as false pending (§2).
5. `submits: null` is accepted for any row by the frozen counter. It is legitimate only for the native row, where navigation occurs (NC-10; §4 N-3).
6. Response vs `action-complete` order is not fixed (click precedes it, the others follow). Cutoffs are frame `seq`, not time. `windowMs` is wall-clock span and does not define eligibility (§1.2).
7. The submit record's `respondWith` field is `typeof`, so it is always `"function"` and is not evidence that respondWith ran (§1.3 H5).
8. The selftest control `quoted-attribute-green` is vacuous on canonical bytes: its `<form>` anchor exists only in the synthetic HTML (§7 G9).

## 0. Inputs inspected (digests re-derived from retained bytes)

- `scripts/webmcp-lifecycle-round21.mjs`: sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`. Matches `receipt.producer` and the execution record.
- `.ufo/waves/round-21/runtime-execution-finalized.json`: exit 0, argv `--out .ufo/waves/round-21/runtime-finalized-candidate`. All 25 pinned artifacts match their bytes. `receiptSha256` `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` matches `corpus/evidence/round-21/runtime/receipt.json`.
- Canonical trails `corpus/evidence/round-21/runtime/<id>.json` and `<id>.html`, 12 rows.
- `.ufo/waves/round-21/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (matches the S100 decoded hash in the note and source-opening).
- Producer history `.ufo/waves/round-21/history/webmcp-lifecycle-v1.mjs` through `v4.mjs`, `history/index.json`, `history/runtime-v1..v4/receipt.json`.
- Frozen counter `.ufo/waves/round-21/measure-c1.mjs`: sha256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`.
- Selftest `.ufo/waves/round-21/selftest-c1.mjs`: sha256 `1fa3d8278e4b74ef4fd4e886dbf551a21c16de663e490709030247b3fd29c953`. Also `fixtures/expected.json` (83 rows), `fixtures/positive-ordered.json`, and retained `corpus/evidence/round-21/selftest-c1.json` (83/83 pass).
- Note `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`, sha256 `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4`.
- Closure `.ufo/waves/round-22/round21-closure.json`: secondary only. Several of its verification fields end in a truncated "…" in the file, so I relied on raw trails rather than its paraphrases.

Not read: BuildOracle's in-progress clone content. No round-22 measure or expectations file existed at read time.

## 1. Producer invoke → observation ordering

### 1.1 Code order per case [prod]

1. `send()` (182–187) wraps each CDP call: a `sent` frame, then a `result` or `error` frame. On error it rethrows (186).
2. `Page.enable`, `page.goto`, `WebMCP.enable` (196–198).
3. `Page.getFrameTree` (199). Line 201 requires a `lifecycle` tool among `WebMCP.toolsAdded` frames captured so far. [obs] `toolsAdded` arrives between `WebMCP.enable` being sent and its result, i.e. enable-time replay.
4. `WebMCP.invokeTool({frameId: tree.frameTree.frame.id, toolName:'lifecycle', input:{q}})` (203). Only `invocationId` is kept. Error path: §2.
5. `preStart = Date.now()`, `sleep(250)` (206–207), `observe('pre-action')` (208). `preAction.responseCount` counts matching responses with `seq < pre marker` (210).
6. Action promise created (211–219): none, click, requestSubmit, submit, reset, remove, invalidRequestSubmit.
7. `frame('action', {phase})` (220). Phase is `no-action` iff action is `none`. `bounded(pendingAction, 10000)` (221). `frame('action-complete')` (222).
8. Delayed only (223): `sleep(250)`, `observe('delayed-before-release')`, `frame('release')`, then `window.release()`.
9. `sleep(500)` (224), `observe('after-action')` (225). `after.responses` = matching responses with `seq < post marker` (cumulative from invocation, not from action). `submits` is the array or null (226). `navigations` = `Page.frameNavigated` with `at >= actionAt && seq < post.seq`.
10. Per-case boundary (237–238): `closeError`, `browserPidsAfter`, `blocked`, `downloads`. Line 239 prints statuses to console and asserts nothing.

Per-case assertions in the producer: browser PIDs non-empty (171), `lifecycle` registered (201), invocation ID is a non-empty string (205), boundary (238). Chromium version (168) is also checked per case. The producer does **not** assert status, pre responseCount, pre or post formActive, presence of `WebMCP.toolInvoked`, `respondWith` invocation, release-before-response, or navigation identity.

### 1.2 Retained order, 12/12 rows [obs]

Frames are contiguous from seq 1, `at` non-decreasing, and each trail has exactly one `sent invokeTool`, one `result` carrying the invocationId, and one `toolInvoked` with the same ID and the tree frameId.

- Common prefix: seq 1–8 (Page.enable … getFrameTree), 9 `sent invokeTool`, 10 `result(invocationId)`, 11 `toolInvoked(same ID)`.
- **na-pending**: 12 pre, 13 action(none, `no-action`), 14 action-complete, 15 after. No responded frame.
- **na-click**: 12 pre, 13 action(click), 14 responded Completed, 15 action-complete, 16 after.
- **na-requestsubmit**: 12 pre, 13 action, 14 action-complete, 15 responded Completed, 16 after.
- **na-native-submit**: 12 pre, 13 action(submit), 14 action-complete, 15 `Page.frameNavigated` to `/landing?q=<nonce>`, 16 responded Completed (output is an array), 17 after (submits null).
- **na-reset, na-remove**: 12 pre, 13 action, 14 action-complete, 15 responded Canceled, 16 after.
- **na-reject, na-throw, na-invalid-submit**: 12 pre, 13 action, 14 action-complete, 15 responded Error, 16 after.
- **na-delayed**: 12 pre, 13 action, 14 action-complete, 15 delayed-before-release (responses 0, submits 1, formActive true), 16 release, 17 responded Completed, 18 after.
- **auto-positive, auto-invalid**: 11 toolInvoked, 12 responded (Completed / Error), 13 pre (responseCount 1, formActive false), 14 action(none), 15 action-complete, 16 after.

Consequences:

- Responded vs action-complete is not fixed. Click puts the response before action-complete. The other action rows put it after. The only ordering common to all 9 action rows is `pre.seq < action.seq < action-complete.seq < after.seq` and `action.seq < responded.seq < after.seq`.
- In auto rows, `toolInvoked` (11) precedes the response (12), which precedes pre (13).
- In the native row, navigation precedes the response (1/1).
- `at` ties occur (for example na-click: result and `preAction.start` are both `1792590708016`). Order by `seq`, never by `at`.
- Cutoffs are `seq`-based. `windowMs` is the wall-clock span only and does not bound eligibility. `responseCount` and `after.responses` are cumulative from invocation, so auto rows carry their pre response into `after.responses`.
- Consistent with the closure's text: 10 non-auto rows have no pre response; 2 auto rows respond before pre.

### 1.3 Ordering hazards

- **H1 observation skew [INFERENCE].** `observe()` takes the page value at evaluate time (189), but pushes the marker frame only after the round trip (190–191). A response delivered during that round trip gets `seq < marker`, so it counts as in-window while the page value predates it. Bounded to one CDP round trip. The page value does not contain tool responses, so the risk is limited to `submits`/`formActive` timing. Oracle: use marker `seq` cutoffs only, and make no claim about page-vs-response order within one round trip.
- **H2 action frame.** `frame('action')` is pushed in the same synchronous turn as promise creation (211–220). It marks dispatch start, not browser receipt. Claimable: order against pre (before) and post (after) only.
- **H3 timing-dependent classification.** Auto rows need their response before the 250 ms pre cutoff. Native needs navigation and response before the 500 ms after cutoff. A late arrival must produce red (timing), never reclassification (auto→pending, native→pending, pending→Completed).
- **H4 invoke result vs `toolInvoked` order.** Result-first in 12/12 canonical rows. The synthetic base is invoked-first (`positive-ordered.json`, row na-click: seq 2 event, seq 3 result). CDP does not fix cross-channel order [INFERENCE]. See D-2.
- **H5 `respondWith` in submit records is `typeof`.** Fixture line 113 records `typeof e.respondWith`, which is `"function"` whether or not it is called. In na-throw it is `"function"` although respondWith was never called. Meaningful submit-record fields are `agentInvoked` (set for declarative calls at [src 769–772]) and `active` (form tool-active at submit). Neither the counter nor the oracle may use `respondWith` as call evidence.
- **H6 `isTrusted: true`.** The SubmitEvent is created by the browser ([src 773–776]). This is UA-event status and does not identify a human (note rule 4 agrees).

## 2. Actual return-ID error path

### 2.1 Current producer [prod]

- 202: `invocationId = null, invokeError = null`.
- 203–204: `await send('WebMCP.invokeTool', …).invocationId` inside `try`. Any rejection sets `invokeError = error.message`. That covers a CDP error, the 10 s `bounded` timeout (`operation_timeout:WebMCP.invokeTool`), and a null result (TypeError on property read). `send` has already pushed an `error` frame with the command id (186).
- 205: `if (invokeError || typeof invocationId !== 'string' || !invocationId) throw Error('invoke_failed_before_action')`.
- Consequence: the row is never pushed to `receipt.cases` (227 comes after 205). Control goes to the outer catch (242) and sets `failure`. The case `finally` (228–236) still saves `<id>.json` with the `error` frame. The outer `finally` (243–259) closes the context and server, sets `finishedAt`, saves `receipt.json` with partial `cases`, then `throw failure` (261). CLI exit is 1 (267). `cleanup.browserClosed` stays false (241 not reached). Stdout has no verdict JSON.
- Therefore `invokeError` in any persisted case is structurally always null. The producer cannot persist a non-null value.

### 2.2 History [obs]

- `history/webmcp-lifecycle-v1.mjs:152–154` catches the invoke error and does **not** throw. Line 161 dispatches the action with `invocationId = null`. Line 158 `responses()` then matches nothing, so the row reads as none-in-window (false pending). Line 171 `submits: post.value.submits || []` also turned unavailable submits into zero.
- `history/webmcp-lifecycle-v2.mjs:157` adds `throw invoke_failed_before_action`. v3 (157), v4 (204), and the final producer (205) keep it.
- Retained receipts runtime-v1 through v4 and the canonical receipt: `invokeError` null in every case, `invocationId` a non-empty string in every case. The non-throwing branch was never persisted as a row.
- No `error` frame appears in any of the 12 canonical trails.

### 2.3 Return-ID facts from retained source [src]

- `ExecuteTool(invocation_id, …)` stores the ID first (178). `GetActiveWebMCPToolInvocationId` returns it only while running (167–172).
- `CallDoneCallback` is one-shot: `done_callback_` is moved and cleared (263–267). It then clears the running flag and ID (267–270) and updates pseudo-state (271). Later calls are no-ops.
- `HandleWebMcpToolResponse` returns early if the tool is no longer running (295–297).
- Input-time failure (FillFormControls error) calls the done callback synchronously inside ExecuteTool (196–198), so a response can precede the invoke result for malformed input. Unexercised: the producer always sends `{q: <string>}` (203).
- The page cannot read the invocation ID. The producer's page script does not read it, and the retained body exposes only a C++ getter (168). Row binding rests on CDP events only.
- Not retained: where the ID is minted and returned, the DevTools WebMCP handler, and the `WebMCP.invokeTool` error modes. [INFERENCE: these live outside `html_form_element.cc`.] The invoke-error path is verified only as producer behavior, not against Chromium.

### 2.4 Required oracle behavior

- **E-1** For all 12 rows: `invokeError === null` and `invocationId` is a non-empty string. Otherwise `input_shape`, exit 1 (D-5).
- **E-2** Exactly one `toolInvoked` with the row's ID. A row without it is red (`evidence_binding`), never pending. Frozen 124–126 already requires this.
- **E-3** `cases.length < 12` is `case_set`. Execution `exit ≠ 0` is `evidence_binding`.
- **E-4** Any `error` frame answering `WebMCP.invokeTool` is red. It is never an Error or Canceled status.
- **E-5** A responded frame for an ID with `seq` before the invoke result or before `toolInvoked` is red (`evidence_binding` or `semantic_timing`). Frozen 126 covers the `toolInvoked` case.
- **E-6** Require 12 distinct invocation IDs. Do not enforce a hex format; the observed 32-hex uppercase shape is an observation, not a protocol guarantee.

## 3. Expected mapping (fixed table)

Copy these values into `corpus/evidence/round-22/semantic-expectations.json` as constants. Never derive them from receipt fields. The (autosubmit, action, mode) tuples equal producer `CASES` (prod 14–27) and frozen `CONFIG` (frozen 11–18); the check is identity, not semantics.

"echo" = `output` with keys exactly `{ok, nonce, q}`, `ok === true`, `nonce === q === <row nonce>` (fixture line 117).

| id | autosubmit / action / mode | expected status | errorText (exact) | output | pre responses / pre formActive | post formActive | submits after | navigations | pageState.errors | extra |
|---|---|---|---|---|---|---|---|---|---|---|
| na-pending | F / none / success | none-in-window (no response) | — | none | 0 / T | T | 0 | [] | [] | formActive T at both pre and post |
| na-click | F / click / success | Completed | — | echo | 0 / T | F | 1 | [] | [] | responded before action-complete |
| na-requestsubmit | F / requestSubmit / success | Completed | — | echo | 0 / T | F | 1 | [] | [] | — |
| na-native-submit | F / submit / success | Completed | — | `[{"dummy":"landing"}]` | 0 / T | F | null (navigation; not zero) | `[/landing?q=<nonce>]` | null (landing has no observations) | pageState.url is the landing URL; formExists F |
| na-reset | F / reset / success | Canceled | `Tool execution cancelled by a form reset` | none | 0 / T | F | 0 | [] | [] | — |
| na-remove | F / remove / success | Canceled | `Tool execution cancelled, since tool definition was updated` | none | 0 / T | F | 0 | [] | [] | formExists F after |
| na-reject | F / requestSubmit / reject | Error | `respondWith promise was rejected` | none | 0 / T | F | 1 | [] | `["Uncaught Error: dummy rejection"]` | — |
| na-throw | F / requestSubmit / throw | Error | `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` | none | 0 / T | F | 1 | [] | `["Uncaught Error: dummy submit handler throw"]` | — |
| na-delayed | F / requestSubmit / delayed | Completed (after release) | — | echo | 0 / T | F | 1 | [] | [] | delayed-before-release: responses 0, submits 1, formActive T; release before responded |
| na-invalid-submit | F / invalidRequestSubmit / success | Error | `Form validation failed: q: Please fill out this field.. ` (trailing space) | none | 0 / T | F | 0 | [] | [] | value cleared before submit |
| auto-positive | T / none / success | Completed (before pre) | — | echo | 1 / F | F | 1 | [] | [] | responded before pre marker |
| auto-invalid | T / none / invalid | Error (before pre) | `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ` (trailing space) | none | 1 / F | F | 0 | [] | [] | responded before pre marker |

Source anchors per row:

- pending [src 212–217]: focus and pause; no response is produced by the browser.
- click [src 218–221 → 635–832; 790–806; 298–319].
- requestSubmit [src 845–873 → 635–832; 790–806].
- submit (native) [src 834–843]: no submit event; callback at 841 with `ok(String())`. The JSON-LD payload is not in the retained body (see §9).
- reset [src 1077–1110]: callback at 1101–1105 with the reset text.
- remove [src 380–400 synchronous path, 391–394; replacement path 448–452, 449–451].
- reject [src 790–806 → 290–328]: `ReportException` at 322–323 is the likely source of the page-side `Uncaught Error: dummy rejection` [INFERENCE].
- throw [src 807–813].
- delayed [src 798–806; resolves when release runs].
- invalid [src 713–758]: message is `"Form validation failed: "` + `name` + `": "` + `validationMessage` + `". "` per invalid control (733–752). Dispatch is skipped (no submit event).
- auto-invalid [src 218–221 → 729–758]. Autosubmit path reaches the same validation.
- auto-positive [src 218–221 → 790–806].

Locale: `validationMessage` is browser-UI-locale text. See D-3.

## 4. Bounded oracle constraints, by stable finding

Each constraint is a finite check over the 12 rows.

### semantic_status
- **S-1** In-window responses for a row are those with `invocationId === row.invocationId` and `seq < after-marker.seq`. Later frames are recorded but do not change in-window status. [obs; design per note lines 60–61; frozen 139 cumulative cut]
- **S-2** Pending: zero in-window responses. Every other row: exactly one. A second in-window response for the same ID is red. [INFERENCE on event uniqueness; one-shot callback src 263–267; D-1]
- **S-3** Status ∈ {Completed, Canceled, Error}. Anything else is `input_shape`.
- **S-4** Terminal rows have `formActive` false after; the pending row has it true before and after. [obs 12/12; src 204–206 set, 267–271 clear]
- **S-5** Submit count per §3 (0 for pending, reset, remove, invalid, auto-invalid; 1 for click, requestSubmit, reject, throw, delayed, auto-positive). Null only under N-3. [obs; src 729–758 blocks dispatch; 762–776 dispatches; 834–843 emits none]

### semantic_output
- **O-1** Echo rows: `output` keys exactly `{nonce, ok, q}`; `ok === true`; `nonce === q === <row nonce>`. [obs: 4 echo rows: na-click, na-requestsubmit, na-delayed, auto-positive]
- **O-2** Native row: output deep-equals `[{"dummy":"landing"}]`, the landing body served by the producer (prod 137). Runtime-observed only [INFERENCE: the payload mapping lives outside the retained body].
- **O-3** Canceled and Error rows have no `output` key. [obs: 6/6 Canceled or Error rows]

### semantic_error
- **X-1** errorText exact per §3. No class-only matching. Reset and remove are both Canceled; reject, throw, and validation are all Error.
- **X-2** After-window `pageState.errors` exact per §3 (reject, throw). All others `[]`. Native: absent or null (landing has no observations).
- **X-3** Validation rows: begins `Form validation failed: `, and the remainder matches exactly including the trailing `". "`. Locale per D-3.

### semantic_timing
- **T-1** Non-auto rows: `preAction.responseCount === 0` and no responded frame with `seq < pre marker`. [obs 10/10]
- **T-2** Auto rows: exactly one responded frame with `seq < pre marker`; `responseCount === 1`; pre `formActive` false. [obs 2/2; src 261–271]
- **T-3** Action rows (9): responded (when present in window) has `seq > action.seq`. Order `pre < action < action-complete < after`. [obs 9/9; frozen 136]
- **T-4** Non-auto rows: pre `formActive` true. [obs 10/10; src 204–206]
- **T-5** Action phase is `no-action` iff action is `none`. [frozen 136 ✓]
- **T-6** Windows: `preAction.windowMs ≥ 250` [prod 207; frozen 138 ✓]. `after.windowMs ≥ 500` for non-delayed and `≥ 750` for delayed [prod 223–224; observed delayed 755]. `windowMs === end − start` [frozen 138 ✓]. Upper bounds [derived]: pre ≤ 5250 (sleep 250 + observe 5000); after ≤ 15500 non-delayed (action 10000 + sleep 500 + observe 5000); after ≤ 25750 delayed (adds sleep 250 + observe 5000 + release 5000). Observed maxima: pre 254, after 547 non-delayed, 755 delayed. See D-4.
- **T-7** All cutoffs are `seq`-based. `at` must be finite and non-decreasing; ties are allowed. [frozen 118 ✓]

### semantic_navigation
- **N-1** Non-native rows: `after.navigations === []`; `pageState.url` path is `/<id>`; `submits` is an array.
- **N-2** Native row: exactly one main-frame `Page.frameNavigated` to `/landing?q=<row nonce>` with `seq` in `(action.seq, after.seq)`; `pageState.url` equals it; `formExists` false; `submits` null.
- **N-3** `submits: null` is allowed only when N-2 holds. Any other null is red. [gap G2; frozen 139 accepts it]
- **N-4** `receipt.requests` (server log) has exactly one `GET /<id>` per row and exactly one `GET /landing?q=<native nonce>`. Thirteen entries total. [obs 13/13; frozen never reads it, G6]
- **N-5** Origin is `http://127.0.0.1:<port>`. The port is not pinned. [obs; prod 145]

### semantic_delayed
- **DL-1** na-delayed only: exactly one observation labelled `delayed-before-release`, with `seq` before the single release frame, which is before the responded frame, which is before `after`. At the marker: responses (seq < marker) = 0, submits length 1, formActive true. [obs]
- **DL-2** Non-delayed rows: no `delayed-before-release` observation and no `release` frame. [frozen does not check; G1]
- **DL-3** Exactly one `release` frame in na-delayed, and `responded.seq > release.seq`. [obs]

### evidence_binding
- **B-1** Per row: one `sent invokeTool` (frameId = tree frame); one `result` answering that command with `invocationId === receipt invocationId`; one `toolInvoked` with the same ID, `toolName 'lifecycle'`, equal frameId, and `input` JSON-equal to the sent input. [frozen 119–129 ✓]
- **B-2** Summaries equal raw: `responseCount`, `formActive`, `responses`, `pageState`, `submits`, `navigations`. [frozen 139 ✓; navigation filter mixes clocks, G5]
- **B-3** Digests: receipt sha (execution `receiptSha256`); per-case sha (`receipt.cases[].evidence.sha256`); fixture sha (`e.fixture.sha256`); producer sha; execution artifacts map equals the canonical runtime paths. [frozen 67–70, 107–114 ✓]
- **B-4** Execution: `exit 0`; `argv[1]` is the producer path; `producerSha256` matches. [frozen 70 ✓]
- **B-5** Per row: `contextClosed` true, `browserPidsAfter` empty, no `closeError`. [frozen 140 ✓]
- **B-6** Per row: `blocked` and `downloads` empty. [frozen 141 ✓]
- **B-7** 12 distinct invocation IDs and 12 distinct nonces. The nonce appears in the fixture HTML and in the input; the pre page value echoes the input. [frozen 65, 105, 137 ✓]
- **B-8** `WebMCP.toolsAdded` registers `lifecycle` with `inputSchema.required == ["q"]`, and its frameId equals the invoke frameId. [obs; prod 201]

### case_set and input_shape
- **C-1** Exactly 12 IDs from the fixed list, no duplicates, `cases.length === 12`. Each row's (autosubmit, action, mode) equals the §3 table, not receipt-derived. [frozen 66, 112 ✓]
- **C-2** `invokeError === null` (E-1).
- **C-3** Frames: contiguous `seq` from 1, no null members. `pageObservations[i].seq` equals its frame's `seq`. [frozen 118 ✓; 136 ✓]
- **C-4** Responded params: Completed → keys `{invocationId, status, output}`; Canceled and Error → keys `{invocationId, status, errorText}`; no frameId on responded. [obs 11/11 responded frames]
- **C-5** `receipt.cases` order is not significant. [frozen sorts ids ✓]

### revision_input, source_binding, value
- **R-1** Full 40-hex revision. Blobs read with isolated Git env as frozen 146 does. Missing new expectations and missing note: baseline, exit 0, value 0. Partial: failed, exit 1, value 0. Unreadable or invalid revision: exit 2. [contract]
- **R-2** Note first line names S100 with the source URL and S101 with `corpus/evidence/round-21/runtime/receipt.json`. [frozen 99–100 ✓]
- **R-3** Source body sha `8c8d6796…` and carrier binding. [frozen 83, 91 ✓]
- **V-1** `value = 12` only when every row passes every constraint. Any finding means value 0, exit 1, verdict failed. [contract; frozen 143 returns cases.length only when clean]
- **V-2** Findings are per (finding, row). `rows` should list each row's expected and observed status for debugging, not for scoring.

## 5. Surviving positive controls (must stay value 12, exit 0)

Anchor every control on canonical bytes, not `fixtures/positive-ordered.json` (G8). Mutations are coherent: update the raw, the summaries, `receipt.cases[].evidence.sha256`, the receipt sha, and the execution `artifacts`/`receiptSha256`. Update the fixture sha when HTML changes. Each control must assert that its bytes actually changed (G9).

- **PC-0** Canonical 12 rows unchanged → 12. The closure records the frozen counter as clean 12 on these bytes. This seat did not re-run anything.
- **PC-1** `receipt.cases` reversed (receipt and execution relinked) → 12. [C-5]
- **PC-2** Late frame: append a Completed `toolResponded` for na-pending's ID at a `seq` after the after-marker, with `at` ≥ last `at` → 12, and na-pending is still pending. [S-1] Frozen analog: `late-response-outside-window` (expected.json index 33, exit 0, synthetic base).
- **PC-3** Foreign-ID response inserted into na-click before the after-marker. Row status and summaries unchanged → 12. [S-1] Frozen analog: `foreign-response-ignored` (index 35, exit 0). See D-7.
- **PC-4** Native row keeps `submits: null`. Restating the canonical value → 12. Frozen analog `unavailable-null-positive` (index 28, exit 0) mutates na-pending, which is NC-10. Rebased, the control belongs on na-native-submit, where the null is legitimate.
- **PC-5** auto-positive fixture: `toolautosubmit` → `toolautosubmit="false"` (fixture sha relinked) → 12. Presence semantics: [src 182 `FastHasAttribute`; 416–417]. Frozen analog `boolean-false-attribute-green` (index 59, synthetic base).
- **PC-6** Tie invariance: set na-click's responded `at` equal to the action `at`, keeping `seq`, and recompute `windowMs` if affected → 12. Guards against the v1 `at`-ordering defect.
- **PC-7** Quoted attribute: put ` toolautosubmit ` inside a quoted attribute value on na-click (e.g. `data-note=" toolautosubmit "`) → 12. Frozen analog `quoted-attribute-green` (index 60) is vacuous on canonical bytes (G9).

## 6. Must-flip controls (coherent mutations; expected finding)

Frozen verdict is given where known from the frozen selftest expectations or from the frozen checks as read.

- **NC-1 All-silent.** Remove every responded frame and response summary from the 11 non-pending rows; auto rows get responseCount 0. Expected: value 0, exit 1; `semantic_status` and `semantic_timing` across those rows; na-pending unaffected. Frozen: admits it (the synthetic base is this class; expected.json index 0, exit 0, value 12).
- **NC-2 Status swap.** na-reject responded → Completed with echo output. Expected: `semantic_status`, plus `semantic_output` and `semantic_error`. Frozen: clean (no status check).
- **NC-3 Class-preserving text swap.** na-reset errorText → `Tool execution cancelled, since tool definition was updated`. Expected: `semantic_error`. A class-only check would pass.
- **NC-4 Collapse.** na-throw errorText → `respondWith promise was rejected`. Expected: `semantic_error`. Frozen: clean.
- **NC-5 Punctuation.** na-invalid-submit errorText with one period, `…field.` instead of `…field.. `. Expected: `semantic_error`. Tests exact matching.
- **NC-6 Pre-response on non-auto.** na-click responded moved before the pre marker, responseCount 1. Expected: `semantic_timing` (T-1). Frozen: clean if summaries updated.
- **NC-7 Late auto.** auto-positive responded moved after the pre marker, responseCount 0. Expected: `semantic_timing` (T-2). Frozen: clean if coherent.
- **NC-8 Delayed early.** na-delayed responded moved before the release frame → `semantic_delayed` (DL-1). NC-8b: release frame removed → DL-3. Frozen: clean.
- **NC-9 Native without navigation.** Remove the landing `Page.frameNavigated` and its navigations entry, keep the response → `semantic_navigation` (N-2). NC-9b: remove the landing GET from `receipt.requests` → N-4. Frozen: clean.
- **NC-10 Null submits on pending.** na-pending `submits: null`, no navigation (frozen unavailable-null applied to pending) → `semantic_navigation` (N-3). Frozen: exit 0.
- **NC-11 v1-shaped invoke failure.** `invocationId: null`, `invokeError` = message, error frame for invokeTool, otherwise pending-looking → `input_shape` and `evidence_binding`. Must never read as pending. Frozen: red (`event_identity`, 126).
- **NC-12 Invoke error with ID.** `invokeError` non-null while invocationId is a valid string (coherent) → `input_shape` (C-2). Frozen: red (`invoke_identity`, 123).
- **NC-13 Missing toolInvoked.** Remove na-click's toolInvoked (coherent) → `evidence_binding` (E-2). Frozen: red (`event_identity`).
- **NC-14 Duplicate in-window response.** Second in-window Completed for na-click (coherent) → `semantic_status` (S-2). Depends on D-1.
- **NC-15 Submit on validation row.** auto-invalid with a submit record (submits 1) → `semantic_status` (S-5). Frozen: clean if coherent.
- **NC-16 Submit on reset.** na-reset submits 1 (coherent) → `semantic_status` (S-5).
- **NC-17 Pre formActive flip.** na-click pre formActive false (coherent) → `semantic_timing` (T-4). Frozen: clean if summary updated.
- **NC-18 Window overflow.** na-click `after.windowMs` 60000 with `end` adjusted (coherent) → `semantic_timing` (T-6 upper bound). Frozen: clean.
- **NC-19 Native output swap.** Native output replaced by `{ok:true,…}` → `semantic_output` (O-2).

## 7. Frozen counter and synthetic-base gaps (evidence)

- **G1** `measure-c1.mjs` has no status, errorText, output, page-error, release, navigation-identity, server-log, or submit-count check. Its value 12 is structural consistency. Line 143 returns `cases.length` when there are no findings. (`status` at lines 146 and 159 is a process exit code only, not a semantic check.)
- **G2** Line 139 compares `submits` by equality, so `null === null` passes for any row. Exercised by `unavailable-null-positive` on na-pending (expected.json index 28).
- **G3** No requirement that non-auto `responseCount` be 0 or auto be 1. Only equality with raw (139).
- **G4** No pre or post `formActive` expectation (139 compares pre to raw only).
- **G5** `navigations` filter at 139 uses `f.at >= c.after.start` with `f.seq < post.seq`. That mixes clocks. Seq-only bounds are recommended (native nav at seq 15 lies in (13, 17)).
- **G6** `receipt.requests` (server log) is never read.
- **G7** `toolInvoked` vs invoke-result order is unchecked. Synthetic base is invoked-first (seq 2 event, seq 3 result).
- **G8** `fixtures/positive-ordered.json` is synthetic. It has 12 rows, 7 frames each, no `toolResponded` in any trail, `at` values 990–1751, and HTML `<form>fixture-nonce-independent-NN</form>` rather than the canonical markup. Auto-invalid's `preAction.responseCount` is 0. Its value-12 `positive` is an all-silent structural pass. The canonical bytes are a separate acquisition.
- **G9** Anchor vacuity. `quoted-attribute-green` (selftest 145) and `autosubmit-fixture-toggle` (selftest 61) depend on a bare `<form>` anchor. That exists only in the synthetic HTML; canonical fixtures use `<form id="f" …>`, so `replace('<form>', …)` is a no-op on canonical bytes. Rebased controls must assert changed bytes.
- **G10** The producer records status and pre-state but asserts neither. Persisted `invokeError` is always null (§2).
- **G11** `respondWith` in submit records is `typeof` (fixture 113) and is not call evidence (H5).

## 8. Decisions for BuildOracle and L1 (not decided here)

- **D-1** A second in-window response for one ID: red (recommended) or ignore. Basis: one-shot callback [src 263–267]. No duplicate was observed.
- **D-2** Order of invoke result vs `toolInvoked`: protocol-neutral (recommended) or result-first (matches 12/12 canonical). Synthetic base is invoked-first.
- **D-3** Locale. Validation strings depend on browser UI locale. The producer launch env sets `LANG: 'C.UTF-8'` (prod 165), but `receipt.environment` does not record it (keys: node, chromium, playwright, flags). Recommend exact-text match with a documented limit. Do not claim locale verification.
- **D-4** Upper window bounds (T-6): adopt the derived bounds or keep the frozen lower bounds only.
- **D-5** Invoke-failure receipts: exit 1 (failed, negative evidence evaluated) recommended. Reserve exit 2 for unreadable inputs or invalid revision.
- **D-6** Native navigation-before-response: require it (observed 1/1) or require only that navigation fall inside the window. [INFERENCE: DevTools layer outside retained body.]
- **D-7** Foreign IDs: keep PC-3 (ignored for status) or record them as a finding.
- **D-8** Finding mapping: invoke and receipt shape → `input_shape`; ID linkage → `evidence_binding`; submit count → `semantic_status`; null submits → `semantic_navigation`.

## 9. Limits

- Only `html_form_element.cc` is retained from Chromium. The DevTools WebMCP domain is not: it mints IDs, emits `toolInvoked` and `toolResponded`, and raises `invokeTool` errors. Those paths are unverified against Chromium.
- The native output payload (`[{"dummy":"landing"}]`) is not derivable from the retained body. Source at 829 and 841 yields only `ok(String())`.
- Retained body is tag 154.0.8037.97 per the note. No source-to-binary equivalence is claimed here.
- No field supports a human-witness claim. `isTrusted` is UA-event status.
- Closure fields are truncated in the file (for example `verification.semantic_remeasurement` ends in "…"). Raw trails were used, not closure paraphrases.
- Nothing was run beyond read-only reads of retained bytes and JSON listed in §0. No tests, builds, browser, or network activity occurred.

Report: .ufo/waves/round-22/w1/RevInvoke.md
