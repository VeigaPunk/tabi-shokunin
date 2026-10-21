# Semantic11: adversarial semantic review of auto-positive against the proposed round-22 C1 API

Seat: TabiR22.Semantic11 (leaf, read-only). Scope: `auto-positive` raw and receipt evidence, checked against the API as written in the contract (`.ufo/waves/round-22/w1-spec.json:3`, context API paragraph). No edits, tests, builds, linters, smokes, browser, network, REA, git commands, installs, or delegation. This file is the only file written.

## 0. Summary

- **Accepted outcome, derived from raw frames without the witness: Completed / auto-positive.** One `WebMCP.toolResponded` for the case invocation, status `Completed`, output `{ok:true, nonce, q}` with `q` equal to the invocation input and to the case nonce, no invoke error, no page error, response inside the initial window, no action, no navigation, not delayed.
- **Agreement:** raw frames, receipt case block, finalized execution stdout, and the author witness agree on status, output, error, and window arithmetic. The S101 row (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:42`) and the draft note row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:47`) agree on status and initial-window placement only; neither states output, error, or navigation contracts.
- **Real hazard:** receipt `after.responses` repeats the initial-window response. The producer defines it cumulatively (`scripts/webmcp-lifecycle-round21.mjs:209,226`), not as an after-window list. Any oracle that derives window membership from receipt summaries will mis-assign this response: false negative for auto-positive, or a false "post-action completion".
- **Second hazard:** the window-start boundary coincides with the response timestamp (same millisecond). A time-based oracle with an open lower bound rejects the valid case.
- **Proposed API is not implemented.** `measure-c1.mjs` and `corpus/evidence/round-22/semantic-expectations.json` do not exist anywhere in the lane (glob returned none); the BuildOracle clone has `.ufo/waves` only through round-21. The only round-22 artifact present is the draft note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. Everything below is against the contract text, so expected verdicts are predictions, not observations.

## 1. Independent derivation (auto-positive)

Raw: `corpus/evidence/round-21/runtime/auto-positive.json`. Fixture: `corpus/evidence/round-21/runtime/auto-positive.html`. Receipt: `corpus/evidence/round-21/runtime/receipt.json`.

| Element | Derived value | Exact location |
|---|---|---|
| Case header | id `auto-positive`; nonce `87f23377-4b21-45d9-b50b-2845277ff7d4`; autosubmit true; action `none`; mode `success` | raw 3–7 |
| Declaration | tool `lifecycle`, required `q`, `annotations.autosubmit: true`, frame F3C0…, at 1792590716711 (seq 5) | raw 62–92 (annotation 84–86) |
| Invoke sent | `WebMCP.invokeTool`, input `{q: nonce}`, at 1792590716711 (seq 9) | raw 135–148 (input 145) |
| Invoke result | invocationId `4F3E02707F9A539DF7284C78EC392F5A`, no error field, at 1792590716712 (seq 10) | raw 149–157 (id 155) |
| Invoked | `WebMCP.toolInvoked`, same invocationId, input string `{"q":"87f2…"}`, at 1792590716712 (seq 11) | raw 158–169 |
| Response | `WebMCP.toolResponded`, same invocationId, `status: "Completed"`, `output: {ok:true, nonce, q}`, at 1792590716712 (seq 12); no `errorText` key | raw 170–184 (status 177, output 178–182) |
| Initial observation | seq 13 at 1792590716965: `submits` length 1 (`agentInvoked` true, `isTrusted` true, `q` = nonce, `active` true, `respondWith` function); `errors: []`; `formActive: false` | raw 185–209 (submits 192–200, errors 201, formActive 205) |
| Action | seq 14–15 at 1792590716965: action `none`, phase `no-action` | raw 210–222 |
| After observation | seq 16 at 1792590717466: same page state; no `toolResponded` and no `frameNavigated` frame after seq 3 | raw 223–247 |
| Navigation | only initial load, seq 3 at 1792590716702 (`/auto-positive`); no `/landing` request for this nonce; server log shows `/auto-positive` at 1792590716700 and next `/auto-invalid` at 1792590717633 | raw 28–53; receipt 744–750 |
| Windows | pre `[716712, 716965]` = 253 ms, response at its start; after `[716965, 717466]` = 501 ms, zero responses | receipt 579–589 |
| Delayed | no: immediate response, no `release` frame, fixture `mode="success"` | html 10, 13–15; producer 223 |
| Fixture behavior | submit handler: `preventDefault()`, then `respondWith(Promise.resolve(value))`; value `{ok:true, nonce, q}` | html 7–15 |

Accepted classification: **Completed / auto-positive**. It matches the S101 row (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:42`), the draft note row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:47`), and the finalized execution stdout `LIFECYCLE_OBSERVED auto-positive pre=1 statuses=Completed` (`.ufo/waves/round-21/runtime-execution-finalized.json:17`).

## 2. Bindings (checksums run this session with `sha256sum`)

| Artifact | sha256 | Binding check | Result |
|---|---|---|---|
| `corpus/evidence/round-21/runtime/auto-positive.json` | `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe` | receipt case `evidence.sha256` (631–633); finalized `artifacts` (line 42) | match |
| `…/auto-positive.html` | `5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19` | raw `fixture.sha256` (lines 8–11); finalized line 43 | match |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | finalized `receiptSha256` (47) and artifacts (21) | match |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | receipt `producer.sha256` (4–6); finalized line 13; round-21 `.ufo/waves/round-21/measure-c1.mjs:31` | match |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | `acquisitionSha256` in `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-21/final/semantic-contrast-witness.json:6` | match |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | `.ufo/waves/round-21/final/serial-checks.json:637` | match |
| `.ufo/waves/round-21/runtime-execution-bounded.json` | `794f0b68add50a884fde0d907e50ff3864587674ea53bcf5181a67635344a380` | records producer `5363d576…` at line 12; superseded run (see BD-2) | stale pin source |

Checksums establish byte identity only. They say nothing about semantics.

## 3. Why receipt `after.responses` is cumulative (producer)

`scripts/webmcp-lifecycle-round21.mjs`:
- L163: `frame()` assigns `seq: ++seq` and `at: Date.now()` at push.
- L180: only four CDP methods are recorded: `WebMCP.toolsAdded`, `WebMCP.toolInvoked`, `WebMCP.toolResponded`, `Page.frameNavigated`.
- L203–206: `preStart = Date.now()` is read in the continuation after `await send('WebMCP.invokeTool')` resolves.
- L209: `responses(through)` returns every `WebMCP.toolResponded` whose `invocationId` matches and whose `seq < through`. No time bound.
- L210: `preAction.responseCount = responses(pre.seq).length`.
- L226: `after.responses = responses(post.seq)`, again with no time bound. By contrast `after.navigations` is bounded by `x.at >= actionAt && x.seq < post.seq`, and `after.submits` / `after.pageState` are page-cumulative snapshots.
- L239: the console label `statuses=…` (for example `pre=1 statuses=Completed`) is computed from the cumulative list. `none-in-window` is therefore also a cumulative label.

Same pattern elsewhere: `auto-invalid` receipt block 636–679 (`preAction.responseCount` 647 = 1; `after.responses` 654–660 repeats the Error). Historical acquisition `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-21/history/runtime-v4/receipt.json:572–635` has the same duplication for auto-positive (responseCount 583 = 1; `after.responses` 590–600).

Consequence: one receipt object carries three scopes (responses cumulative, navigations window-bounded, submits page-cumulative). Window membership must be derived from raw `seq` and `at`, never from `after.*`. The author witness (`…/final/semantic-contrast-witness.json:606–618`) mirrors the same cumulative list (its `responses` for auto-positive repeats the pre-window response), so it is not independent of this definition. The S101 row does not reference the list and is consistent with the raw placement.

## 4. Findings by dimension

Coherence recipe for every mutation below. This is the minimal coherent change; no edit may touch the fixed expectation fields.
1. Edit raw frames and observation values exactly as stated.
2. If frames are inserted or removed, renumber `seq` contiguously and update `pageObservations[].seq` and the observation `value` copies, so no shape finding fires.
3. Recompute the receipt case summary with producer rules: `preAction.responseCount` = matching `toolResponded` with `seq < pre.seq`; `after.responses` = matching `toolResponded` with `seq < post.seq`; `after.navigations` = `Page.frameNavigated` with `at >= actionAt` and `seq < post.seq`; `after.submits` and `pageState` = post observation value. Keep `preAction.start` and `after.start` unchanged (non-recorded `Date.now()` reads).
4. Update `receipt.cases[auto-positive].evidence.sha256` to the new raw sha, then the receipt sha wherever the finalized record or expectation file pins it (`runtime-execution-finalized.json:21,42,47` if pinned).
5. "Summary-only" mutations change only the receipt; the raw sha is unchanged.

Expected verdict column assumes the contract: a contradicted row is not counted, and the run is failed.

### 4.1 Status (`semantic_status`)

| ID | Type | Mutation (minimal coherent) | Expected under contract | Trap |
|---|---|---|---|---|
| ST-FN1 | FN | None. Real raw must stay green. Failure mode: an oracle that counts `preAction.responseCount + after.responses.length` (= 2) or requires `after.responses == []` for a no-action case. | Auto-positive counted. C1 would otherwise land at 11, not 12. | Cumulative summary (§3) |
| ST-FP1 | FP | Delete raw seq-12 frame; renumber 13–16 to 12–15; `pageObservations` seq 13→12, 16→15; receipt `preAction.responseCount` 0, `after.responses` []. | red `semantic_status` (no Completed response) | All-silent controls exist: `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-21/fixtures/positive-ordered.json` (7 frames, 0 `toolResponded`) and `positive.json` (4 frames, 0 `toolResponded`), parsed read-only, every case including auto-positive |
| ST-FP2 | FP | Summary-only raw tamper: raw seq 12 `status` "Completed"→"Canceled"; update only the raw sha in receipt `evidence.sha256` (and finalized pins). Receipt `after.responses[0].status` left "Completed". | red `semantic_status` and red raw-summary binding | Oracle reads status from receipt summary |
| ST-FP3 | FP | Insert a second `toolResponded` for `4F3E…` (status "Canceled", `errorText` "dummy") between seq 12 and 13; renumber 13–16 to 14–17; `preAction.responseCount` 2; `after.responses` [Completed, Canceled]. | red (two terminal responses for one invocation) | First-match or last-match selection |
| ST-FP4 | FP | Raw seq 12 `invocationId` → `1CB23F49E89D91801A20D1C7DA8CB811` (auto-invalid's invocation in the same run, receipt 641); recompute summary: responseCount 0, `after.responses` []. | red | Matching any Completed response in the window, or by nonce or case id |
| ST-FP5 | FP | `value.submits` → [] at raw seq 13 and seq 16 (plus `pageObservations` copies); receipt `after.submits` [] and `after.pageState.submits` []. | red (Completed with no agent-invoked submit) | No submit-provenance finding exists in the API; unless status or timing checks the pre-observation submit, this passes |

### 4.2 Output (`semantic_output`)

Expected output: exact keys `{ok, nonce, q}`; `ok === true`; `q` equals the invocation input at raw seq 9 (line 145); `nonce` equals `q` and the case nonce; the fixture embeds the same nonce (html 5, 12).

| ID | Type | Mutation | Expected | Trap |
|---|---|---|---|---|
| OU-FP1 | FP | Raw seq 12 `output.ok` → false; receipt `after.responses[0].output.ok` → false. | red `semantic_output` | Status-only check |
| OU-FP2 | FP | Raw seq 12 `output.nonce` and `output.q` → `00000000-0000-4000-8000-000000000000` (both); receipt `after.responses[0].output` updated. Input (seq 9, seq 11) unchanged. | red `semantic_output` | Oracle checks `ok` or key presence only |
| OU-DOC | Documentation FP | Draft note row 47 states no output contract for auto-positive. Row 38 (na-click) states "ok=true and nonce/q equal the case nonce". | Fixed expectation must restate OU-FP1/OU-FP2 checks | Without restating, OU-FP1 and OU-FP2 sit outside the documented contract |

Residual: the output nonce comes from the fixture bytes. A coherent substitution of html + raw + receipt passes semantics and is caught only by fixture and evidence pins (BD-1).

### 4.3 Error (`semantic_error`)

Evidence chain for "no error": invoke result has no error field (raw 149–157); receipt `invokeError` null (578); `toolResponded` has no `errorText` (raw 170–184); `observations.errors` empty at seq 13 and 16 (raw 201, 239).

| ID | Type | Mutation | Expected | Trap |
|---|---|---|---|---|
| ER-FP1 | FP | Add `"errorText": "dummy"` to raw seq 12 params; receipt `after.responses[0]` gains `errorText`. | red `semantic_error` (Completed carries error evidence) | errorText checked only for Canceled and Error statuses |
| ER-FP2 | FP | Add `"Uncaught Error: dummy"` to `value.errors` at seq 13 and 16 (plus `pageObservations` copies); receipt `after.pageState.errors` updated. | red `semantic_error` | Only invoke and response fields are consulted. Window `error` events are recorded at html line 6 |
| ER-FP3 | FP (binding-only if unchecked) | Receipt `invokeError` → "dummy"; raw unchanged. Producer L204–205 throws `invoke_failed_before_action`, so a recorded non-null `invokeError` is only reachable by tampering. | red raw-summary binding and red `semantic_error` | Semantic check relies on raw alone |
| ER-RES | Residual, not mutable | Raw records only the four CDP methods (L180) and window `error` events (html 6). Unhandled rejections, console errors, and Runtime exceptions cannot appear in the evidence, and the producer cannot emit them. | "No error" means no error on the instrumented channels. Note limits (draft note 93–102) must say so. | Oracle claiming broader absence |

### 4.4 Timing (`semantic_timing`)

Facts: seq 10, 11, 12 all at 1792590716712; receipt `preAction.start` = 1792590716712 (580); the single response is exactly at the window start. `preStart` is read in a continuation after the invoke promise resolves (L203–206), so the equality holds at millisecond resolution here; nothing in the producer enforces `response.at >= preStart`.

| ID | Type | Mutation | Expected | Trap |
|---|---|---|---|---|
| TM-FN1 | FN | None. Real raw must stay green. Failure mode: time membership with an open lower bound (`at > start`). The response is then outside every window, so the case reads as silent. | Auto-positive counted | Boundary equality. Producer membership (L209–210) is invocation match plus `seq < pre.seq`, with no lower bound. Recommended pin: keep that rule, add an explicit `seq` lower bound after the invoke result (seq 10), and use time only for `windowMs`; if time membership is used, the start must be inclusive |
| TM-FP1 | FP | Raw seq 12 `at` → 1792590716966 (seq order unchanged, after the pre-observation at 716965). Producer summary unaffected (membership by seq), so only raw and finalized pins change. | red `semantic_timing` (and sequence or order, if monotonicity is checked) | Seq-only membership accepts it |
| TM-FP2 | FP | Move the `toolResponded` frame to just after the pre-observation: new seq 14 (renumber 14–16 to 15–17), `at` = 1792590716965 (same millisecond as the initial observation). Summary: responseCount 0; `after.responses` [Completed]. | red `semantic_timing` and `semantic_delayed` (response is post-observation) | Inclusive-end time membership alone, or summary-based windows |
| TM-FP3 | FP | Move the `toolResponded` frame behind the action: after seq 15 (renumber 16 to 17), `at` = 1792590717000 (inside the after window). Summary: responseCount 0; `after.responses` [Completed]. | red (auto-positive needs the initial-window response; this is a click-like completion) | Output-only check, or "Completed in after window" classified as click |

### 4.5 Navigation, input, and delayed (supporting findings)

| ID | Type | Mutation | Expected | Trap |
|---|---|---|---|---|
| NV-FP1 | FP | Insert main-frame `Page.frameNavigated` for `http://127.0.0.1:43143/landing?q=87f23377-4b21-45d9-b50b-2845277ff7d4` at at = 1792590716900 between seq 12 and 13 (renumber 13–16 to 14–17); pre and after `value.url` → landing URL; receipt `after.pageState.url` → landing; add `{method:"GET", url:"/landing?q=…"}` to `receipt.requests` (producer L133). `after.navigations` stays [] (L226 filters at ≥ 716965). | red `semantic_navigation` | Oracle checks `after.navigations` only |
| IN-FP1 | FP | Raw seq 5 `annotations.autosubmit` → false (raw and pins only; receipt `autosubmit` true untouched). | red `input_shape` or semantic (declared annotation contradicts `toolautosubmit`, html line 2, and the expectation) | Oracle checks the receipt flag only |
| DL-NOTE | Guard | Auto-positive must be `delayed = false`. No release frame exists (producer L223 only for mode `delayed`). | `semantic_delayed` false | Post-action-looking response from summary (ST-FN1 / TM-FP2) |

### 4.6 Binding, precondition, and API issues (for the parent)

- **BD-1 (control: semantic green, binding red).** Historical `.ufo/waves/round-22/clones/BuildDebt/.ufo/waves/round-21/history/runtime-v4/` contains a valid Completed auto-positive: invocation `7EA2406500794B4FD25A2FDE0DE35C14`, nonce `993abf00-22b1-4cae-9605-e90d528bf007`, responseCount 1, after windowMs 502, evidence sha `5931ea3bc5b3d8d25fe2e53176a449adcc4e13a6c91ef88a41495ee860b3b5f0` (receipt 572–635; raw 1–10). Substituting that triple leaves every semantic finding green. Only evidence_binding, source_binding, and revision_input may go red. A semantic-only oracle would accept it.
- **BD-2 (stale producer pin).** `.ufo/waves/round-21/runtime-execution-bounded.json:12` (`producerSha256` 5363d576…), `.ufo/waves/round-21/w2/FixtureAutoPositive.md:22`, `.ufo/waves/round-21/w2/FixtureNaRequestsubmit.md:31`, and `.ufo/waves/round-21/w2/SourceS101.md:16–17` all describe 5363d576… as current. The current receipt, finalized record, and round-21 counter use bc11e4…. Pin only the finalized set: producer bc11e4…, receipt 4bc79636…, finalized 65b52c0c…, raw 62f257e9…, fixture 5bc14077….
- **BD-3 (precondition: committed bytes) [historical, not re-verified].** `runtime-execution-finalized.json:5` says `measuredRevision: "uncommitted"` (revision 1b5f449…, line 3). `.ufo/waves/round-21/w2/FixtureAutoInvalid.md:13` records the producer as untracked at HEAD 1b5f449; `FixtureNaRequestsubmit.md:33` says the binding "currently exists only in a mutable, untracked file". I did not run git (lane VCS rule). If producer, raw, receipt, and finalized record are not in the target commit, FULL40HEX evaluation cannot bind them. The parent must commit before measuring.
- **BD-4 (exit rule ambiguity) [INFERENCE from wording].** Contract (`w1-spec.json:3`): "missing new expectations and note means baseline0, partial missing means failed0." The draft note now exists; the expectations file and the measure do not. Read literally, that is partial-missing, so the first run returns failed0, not baseline0. The parent must decide which is intended before the first run.
- **BD-5 (fixed expectations independence).** Do not derive auto-positive expectations from receipt `after.responses` (cumulative, §3) or copy the author witness (`…/final/semantic-contrast-witness.json:599–663`, "author-side, not independent closure", line 4). The witness lists the pre-window response in `responses` and inherits the ambiguity.
- **BD-6 (draft note gaps).** (a) Row 47 has no output, error, timing, or navigation rejects. (b) Line 33 calls the receipt an "index and summary" but does not say the `after.*` scopes differ. (c) Line 3 names `measure-c1.mjs --selftest`, which the contract's API does not list. (d) Lines 61–62 cite measurement receipts that do not yet exist.

## 5. Recommended fixed auto-positive expectation (independent; per-run nonce is relative, not recomputed)

- `autosubmit: true`, `action: none`, `mode: success`; fixture sha `5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19`; raw sha `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe`.
- Exactly one `toolResponded` for the case invocation, with `seq` after the invoke result (seq 10) and before the initial observation; time inclusive at `preAction.start`.
- `status: "Completed"`; output keys exactly `{ok, nonce, q}`; `ok === true`; `q` equals the invocation input; `nonce === q === case nonce`.
- No `errorText` on the response; `invokeError` null; `errors` empty at the initial and after observations.
- Zero `toolResponded` after the initial observation; zero `frameNavigated` after the initial load; no `/landing` request for this nonce.
- Exactly one submit visible at the initial observation, with `agentInvoked` true, `isTrusted` true, `active` true; no action phase before the initial observation.
- `delayed: false`.

## 6. Controls

| ID | Input | Expected |
|---|---|---|
| CTRL-1 | Unmodified raw, receipt, html, finalized | Green; counts as Completed auto-positive |
| CTRL-2 | Receipt `after.responses` set to [], raw unchanged | Semantic findings unchanged if the oracle is raw-authoritative; summary-binding red. A semantic change means ST-FN1 is present. |
| CTRL-3 | BD-1 historical substitution | Semantic green; binding red |
| CTRL-4 | ST-FP1 applied to the real raw | red `semantic_status` |

## 7. Residual gaps (not mutable with current evidence)

- R1: unhandled rejections, console errors, and Runtime exceptions are not observable (ER-RES).
- R2: responses after the 501 ms after-window, or after context close, are unobservable. Draft note line 98 already says finite no-response is not permanent pending.
- R3: the submit exists only as a page snapshot at seq 13. The producer stores no timestamp for it, and `agentInvoked` is read from the page's own submit event (producer L113).
- R4: windows are sampling artifacts: `sleep(250)` at L207 and `sleep(500)` at L224. Nothing about "no response after 501 ms" is permanent.

## 8. Checks run and not run

Run (read-only): reads of the godspeed skill, wave spec, raw/receipt/html for auto-positive, finalized record, bounded record, producer (grep of lines 112–239), witness, S101 note and SOURCES row, draft note, S100 anchor (`.ufo/waves/round-21/sources/html_form_element.cc:207–235`), round-21 w2 reviews (grep), history runtime-v4 receipt and raw. `sha256sum` on eight files (listed in §2). Read-only `node -e` JSON parse of two retained synthetic fixtures (`positive-ordered.json`, `positive.json`), counting `toolResponded` per case; no producer, oracle, or test was executed. Glob for `semantic-expectations*.json`, `webmcp-lifecycle-oracle-round-22.md`, and `round-22/measure-c1*.mjs`: only the draft note matched.

Not run: git (any subcommand), builds, tests, linters, formatters, smokes, browser, network, REA, producer, round-21 or round-22 measure. No installs, so no install record. No peers were messaged, and no subagents were spawned.

S100 anchor check: the S100 source anchor for the autosubmit branch (`html_form_element.cc:218–221`, `else` branch calling `PrepareForSubmission`) matches the note's `S100:218-221` citation.
