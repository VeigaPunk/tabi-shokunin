# Semantic02 — na-click adversarial semantic review

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Reviewed 2026-10-21. Read-only: no edits, builds, tests, smokes, producer runs or counter runs.

Inputs: `corpus/evidence/round-21/runtime/{na-click.json,na-click.html,receipt.json}`, `scripts/webmcp-lifecycle-round21.mjs`, `.ufo/waves/round-21/{measure-c1.mjs,runtime-execution-finalized.json,final/semantic-contrast-witness.json}`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, and the proposed expectations (untracked) at `.ufo/waves/round-22/clones/BuildOracle/corpus/evidence/round-22/semantic-expectations.json`. No `measure-c1.mjs` exists at the lane root or in any round-22 clone, so the "proposed API" is reviewed as the spec text plus that expectations file.

Labels: **B** = admits wrong semantics; **F** = rejects valid na-click; **M** = must-keep (the expectation rejects only if implemented as written).

## 1. Summary

- Retained na-click evidence is internally consistent. Raw trail, receipt row, fixture, producer, execution record and committed blobs agree (§3). The round-21 counter's per-case checks pass this row by code reading (§4); its global source and note checks (lines 85–100) were not evaluated here.
- Accepted outcome: one `Completed` response, after the click dispatch marker and before the post observation; output exactly `{ok:true,nonce:N,q:N}`; no `errorText`; zero pre-window responses; exactly one trusted submit; no navigation in the action window (§2).
- The round-21 counter admits all eleven mutation classes B1–B11 (§5). The proposed expectation, as written, leaves B1, B8, B10, B11 open outright, and B2–B7, B9 open unless the checker implements the exact rules in §7.
- Natural implementations would reject valid na-click through F1–F4 (high) and F6–F8 (medium). F5 is already present: the expectation's `sourceHeader` differs from note line 1, which fails every row (§6).
- No new evidence is needed. The fixes are seq anchors, exact comparisons, trail-wide counts, a raw-trail navigation scan and a literal nonce (§7).

## 2. Accepted outcome, derived from raw frames

Notation: N = `d57a9461-7725-447a-94ee-5031820695a6`; I = `5CE5ECE3023564847832ECEB5F305854`; F = `9967ED1565B1659BFC7B3D6C348C354B`. Every `at` is `1792590708xxx`; only `xxx` is shown.

| seq | at | frame | content |
|---|---|---|---|
| 3 | 006 | Page.frameNavigated | initial load of `/na-click`, before the invocation |
| 9 | 015 | sent WebMCP.invokeTool | command 4; frameId F; toolName `lifecycle`; input `{q:N}` |
| 10 | 016 | result | invocationId I; no error frame |
| 11 | 016 | WebMCP.toolInvoked | I; `lifecycle`; F; input is a JSON string `{"q":N}` |
| 12 | 268 | observation pre-action | formActive true; submits []; errors []; value N; focused go; path `/na-click` |
| 13 | 269 | action | `click`, phase `dispatch-started` |
| 14 | 314 | WebMCP.toolResponded | I; status `Completed`; output `{ok:true,nonce:N,q:N}`; no errorText; no frameId |
| 15 | 314 | action-complete | `click` |
| 16 | 815 | observation after-action | submits: one `{agentInvoked:true,isTrusted:true,q:N,active:true,respondWith:"function"}`; errors []; formActive false; value N; focused go; path `/na-click` |

The trail ends at seq 16. Seq numbers are contiguous, and `at` is non-decreasing. Timing: pre window 252 ms (016→268). The response arrives +298 ms after invocation, +45 ms after dispatch, and +46 ms after the post-window start. Post window 547 ms (268→815). The post observation is +501 ms after the response.

Predicate A (what an oracle should accept; derived without the note, witness or receipt):

- **A1 identity:** id `na-click`; autosubmit false; action `click`; mode `success`; nonce N.
- **A2 invocation:** exactly one sent invokeTool (seq 9) with toolName `lifecycle`, frameId F and input `{q:N}`. Its result (seq 10) gives I with no error. Exactly one toolInvoked (seq 11) with I, the same tool and frame, and an input string that parses to `{q:N}`.
- **A3 pre:** exactly one pre observation (seq 12). No toolResponded for I with seq < 12. formActive true; submits []; errors []; value N; focused go; path `/na-click`.
- **A4 action:** exactly one `click` dispatch-started (seq 13) and one `click` action-complete (seq 15). Order is 11 < 12 < 13 < 15 < 16.
- **A5 response:** exactly one toolResponded for I in the whole trail (seq 14), with 13 < 14 < 16. The event has no frameId, so correlate by invocationId. status === `"Completed"`. output deep-equals `{ok:true,nonce:N,q:N}`. No `errorText` key.
- **A6 post:** exactly one post observation (seq 16). submits is exactly one entry as above. errors []; formActive false; value N; path `/na-click`.
- **A7 navigation:** no Page.frameNavigated with seq in (11,16]. The only frameNavigated in the trail is seq 3.
- **A8 timing:** windowMs = end − start for both windows. pre.start = invocation time (016). pre.end = seq 12 `at`. post.end = seq 16 `at`. pre.end ≤ after.start (268) ≤ dispatch.at (269). The response (314) lies inside the post window.
- **A9 binding:** receipt row equals raw-derived values (see receipt check below). Digest chain as in §3.
- **A10 cleanup:** browserPidsBefore has 9 entries and is non-empty; browserPidsAfter []; browserPidsSeenAfterClose []; contextClosed true; blocked []; downloads [].

Stable finding vector a correct oracle should emit for this row: semantic_status pass (Completed, one terminal, in window); semantic_output pass (exact object); semantic_error pass (no errorText; pre and post errors empty; invokeError null); semantic_timing pass; semantic_navigation pass (none); semantic_delayed not-applicable (no delayed block); evidence_binding pass; case_set pass; source_binding fails today (F5); input_shape pass; revision_input n/a until the note and expectations are committed.

Receipt check, `receipt.json` lines 58–121: invocationId I; invokeError null; preAction `{start 1792590708016, end 1792590708268, windowMs 252, responseCount 0, formActive true}`; after `{start 1792590708268, end 1792590708815, windowMs 547, responses = [seq 14 params], submits = [seq 16 entry], navigations [], pageState = seq 16 value}`. All match. The author witness (`.ufo/waves/round-21/final/semantic-contrast-witness.json` lines 55–117) also agrees on seqs 12–16, responses, postSubmits and windows. It was cross-checked only after derivation and was not an input.

## 3. Binding checks run

sha256 of the working-tree files. The same five blobs were then read at baseline 5f58577 with `git cat-file -p 5f58577:<path> | sha256sum`, and all five matched.

| artifact | sha256 | pinned by |
|---|---|---|
| runtime/na-click.json | 36502a284bad8b0b84c13346f40b1f1de1eeb8c5b6d5ce11fa8b971f877927ba | receipt.json line 119; execution artifacts line 24 |
| runtime/na-click.html | 1ac88d83a4993c95265af1747f69b950c6db8d04bc18bc99b25938c017e87662 | raw `fixture.sha256`; execution artifacts line 25; expectation `fixtureSha256` |
| runtime/receipt.json | 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034 | execution `receiptSha256` line 47; artifacts line 21 |
| scripts/webmcp-lifecycle-round21.mjs | bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811 | receipt `producer.sha256`; expectation `producerSha256` |
| .ufo/waves/round-21/runtime-execution-finalized.json | 65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4 | not pinned by the expectation |

Other facts: execution `revision` 1b5f449a… resolves to a commit object. Its `measuredRevision` is `uncommitted`, but the producer bytes now equal the committed bytes. `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and `corpus/evidence/round-22/semantic-expectations.json` are absent at 5f58577, which is expected (baseline0 until committed). The expectations file (BuildOracle clone, sha256 4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e) is untracked.

## 4. What the round-21 counter checks for na-click (code-derived, not executed)

`.ufo/waves/round-21/measure-c1.mjs`. FINDINGS (line 33) contains no status, output, error, submit-cardinality, active or navigation-content name.

- Present: digests (67–70, 107–108, 114); CONFIG identity including the action label (11–18, 112); contiguous seq and non-decreasing `at` (118); invoke and event identity (119–129); action-marker order (136); window floors and arithmetic (138); summary equality for responseCount, formActive, after.responses, pageState, submits and navigations (139); cleanup and boundary (140–141).
- Absent: status and output comparison; errorText; errors emptiness; submit count and `active`; toolResponded position relative to the action markers (136 orders the invoke result, not the response); terminal-response count across the trail; after.start lower bound (138 checks only the upper bound).
- Retained na-click row passes the counter's per-case checks (lines 101–141), by code reading only.

## 5. False negatives: minimal coherent mutations

Each mutation edits raw and/or receipt and updates the digest chain: raw sha → receipt `evidence.sha256` → receipt sha → execution artifacts and `receiptSha256`. "Counter" means the round-21 counter by code reading. "Expectation" means BuildOracle's file under a natural checker. Timestamps below are `1792590708xxx`.

| ID | Minimal coherent mutation | Counter | Expectation as written | Required rule |
|---|---|---|---|---|
| B1 | Append seq 17 `WebMCP.toolResponded` {I, `Error`, errorText `x`} at 900. Receipt unchanged. | admits (126 checks only order against invoke; 139 cuts at post.seq) | **admits** (post.statuses cut at seq 16) | exactly one toolResponded for I across the whole trail |
| B2 | Swap seq 13 and 14. toolResponded at 268, dispatch at 269. Receipt unchanged. | admits (136 does not place toolResponded) | rejected only if `responseWindow:"action-to-post"` is defined as seq(dispatch) < seq(response) < seq(post) | dispatch-started seq < response seq < post seq |
| B3 | Insert seq 15 `Error` response before action-complete; renumber. Receipt after.responses gets the second entry. | admits | rejected only if post.statuses is an exact array; `includes("Completed")` admits | exact status array |
| B4 | output += `"extra":"x"` in seq 14 and receipt. | admits (output never compared) | admits if keys are subset-checked | exact key set {ok,nonce,q} |
| B5 | output.ok = `"true"` (string) in both places. | admits | admits under == or truthy | typeof boolean and === true |
| B6 | output.q = `"x"`; nonce intact. | admits | rejected only if every listed key is compared | compare each key |
| B7 | output.nonce = `"x"`; q intact. Change the output only. A whole-case nonce rewrite also changes na-click.html and trips the fixture pin (line 114), which proves nothing about semantics. | admits | rejected only if compared | compare each key |
| B8 | errorText `"x"` on seq 14 and the receipt response; status stays Completed. | admits | **admits** (no errorText rule) | no errorText key when Completed |
| B9 | Insert Page.frameNavigated (same URL) at seq 12, at 200; renumber. Receipt unchanged, because the producer filter (226) drops it: it precedes after.start. | admits (139 uses the same time filter) | rejected only if navigations are scanned from raw frames in (11, post]; admits if read from after.navigations | raw-trail scan over (11, post] |
| B10 | Receipt only: after.start 268 → 100; after.windowMs 547 → 715. No frameNavigated lies in [100, 268), so navigations are unchanged. | admits (138 checks only start ≤ dispatch) | **admits** (post.minMs 500 holds) | pre.end ≤ after.start ≤ dispatch.at; windowMs arithmetic |
| B11 | submits[0].active = false in seq 16, receipt after.submits[0] and after.pageState.submits[0]. | admits (submits equality only) | **admits** (active not pinned) | pin active true as an observed precondition |

Must-keep tests (M). The expectation rejects each one if implemented as written:

- **M1 silent:** rename seq 14's method to a non-terminal name; receipt after.responses = []. Counter admits. Expectation rejects (statuses [] ≠ ["Completed"]).
- **M2 pre-response:** move the toolResponded before the pre observation; receipt preAction.responseCount 0 → 1. Counter admits. Expectation rejects only if pre.statuses is compared.
- **M3 page error in window:** add "Uncaught Error: x" to seq 16 errors, pageObservations and receipt pageState.errors. Counter admits. Expectation rejects (post.errors []).
- **M4 duplicate submit:** duplicate the seq 16 submits entry in receipt after.submits and pageState.submits. Counter admits. Expectation rejects (submitCount 1) if computed from the array.
- **M5 in-window navigation:** insert a same-URL frameNavigated at seq 15, at 314; receipt after.navigations = [it]. Counter admits. Expectation rejects (navigation none).
- **M6 mechanism relabel:** change only frames 13 and 15 to `requestSubmit`. Counter rejects (136). Expectation rejects. Keep.
- **M7 fixture drift with digests updated:** change `const mode="success"` (na-click.html line 10) to `"reject"`. Counter admits (113–116 check digest, nonce and attribute only). Expectation rejects only as fixture digest. Acceptable; an optional literal cross-check would give a semantic-named failure.

## 6. False positives: valid na-click rejected

| ID | Natural implementation | Effect on na-click | Fix |
|---|---|---|---|
| F1 | "No Page.frameNavigated in trail" | **rejects** on seq 3, the initial load at 006 | scan (11, 16] only |
| F2 | Response must follow action-complete (seq 15) | **rejects**: the response is seq 14 | require seq(dispatch) < seq(response) < seq(post) |
| F3 | at strictly increasing, or response.at > complete.at | **rejects**: 314 = 314 | seq decides order; `at` non-decreasing |
| F4 | after.start equals dispatch.at | **rejects**: 268 ≠ 269 | pre.end ≤ after.start ≤ dispatch.at |
| F5 | sourceHeader must equal note line 1, or any "canonical first line" compare | **present now.** Expectation: `source: S101 — …receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json`. Note line 1: `source: S101 — …receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition …`. Every row fails | one canonical string, byte-compared; or drop the duplicate field |
| F6 | JSON.stringify deep compare (counter helper, line 35) | key order differs: raw output is ok,nonce,q; raw submit is agentInvoked,isTrusted,q,active,respondWith. A literal in another order rejects | deep-equal |
| F7 | formActive invariant (pre = post) | **rejects** the observed true → false transition | pin pre true and post false |
| F8 | semantic_delayed reports failure when there is no delayed block | **rejects** non-delayed rows | not-applicable = clean |
| F9 | Post floor 500 measured from action-complete (314) | retained 501 ms, a 1 ms margin. The producer's sleep(500) starts at producer line 224, and timer rounding can yield 499 on re-acquisition | anchor at dispatch (546 ms) or record windowMs (547 ms); document as a producer constant |
| F10 | Exact URL including port | passes retained; brittle | path only (urlPath is already in the expectation) |

## 7. Fixes requested (BuildOracle; item 10 for the note owner)

1. Anchor by seq: dispatch = action frame with phase `dispatch-started`; complete = action-complete; pre and post = observation markers. Response predicate: dispatch < response < post. Do not anchor on action-complete or on time.
2. Trail-wide counts: toolResponded for I == 1 across all frames; invokeTool sent == 1; toolInvoked == 1.
3. Output: exact key set {ok,nonce,q}; typeof boolean and === true; each key compared to the literal N.
4. Status: exact string; statuses arrays compared as exact arrays.
5. Error: Completed means no errorText key; errors [] in both pre and post.
6. Navigation: scan raw frames for Page.frameNavigated in (11, post]; expect none. Separately assert that the trail's only navigation is seq 3. Do not use `after.navigations`, which is time-filtered by after.start (line 139; producer line 226).
7. Submits: length 1, taken from the raw array; q == N; active true; respondWith `"function"` recorded as observed only, not as evidence that respondWith ran.
8. Timing: pre.end == seq-12 `at`; post.end == seq-16 `at`; windowMs arithmetic; pre.end ≤ after.start ≤ dispatch.at; no equality of after.start with any frame time; floors documented as producer constants.
9. Independence: replace `$nonce` and `$input` in the na-click entry with literal N. The resolver must not read the receipt or raw nonce, because that would recompute the expectation from the evaluated receipt.
10. sourceHeader (F5): choose one canonical string and compare it exactly, or drop the duplicate field. Note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` line 34 should list the rejected classes above, not only "silent trail, wrong status or a different output nonce". Its line 3 recheck names `measure-c1.mjs --selftest`, but the spec assigns the selftest to `selftest-c1.mjs` (BuildSelftest); align them.

## 8. Claims the note must not make (click mechanism and attribution)

- **"Completed click."** The trail carries only producer labels: `action:"click"` at seq 13 and 15. The producer creates the Playwright click promise at producer line 213 and writes the marker at line 220. Its CDP listener records four methods only (line 180), so no input event is in the trail. Say "Completed after a click-labelled dispatch marker."
- **"Playwright input-pipeline."** Inferred from producer code (line 213), not observed in the trail.
- **isTrusted and agentInvoked are not click evidence.** `na-requestsubmit.json` submit records carry the same `agentInvoked:true,isTrusted:true` (lines 221–222 and 263–264).
- **respondWith.** The submit record's `respondWith:"function"` is a typeof captured at fixture line 8, before preventDefault (line 9) and before the throw path (line 11). It is not evidence that respondWith ran. For na-click, the output object is the evidence that the page's value was delivered, because only the page can produce nonce and q.
- **Dispatch timing.** dispatch-started is written after the Playwright promise is created (producer 213 → 220). It is not a browser dispatch time. The only causal anchor is seq ordering in the observer.
- **Windows.** after.start is `Date.now()` (producer 211, 226), not a frame, so windows are observer-side and not latency. 547 ms bounds a finite observation; it does not establish completion latency.
- **Fixture behaviour.** `const mode="success"` and the respondWith branch (fixture lines 10, 13–15) are bound only by digest. The oracle does not parse or execute them.

## 9. BuildSelftest additions for na-click

- Add B1–B11 and M1–M7 to the planned mutations. Keep the retained na-click as a positive. It has a same-ms response and action-complete (314 = 314), which is exactly the case F2 and F3 would reject.
- "Wrong success nonce/output" must mutate the output only (B7). Rewriting the whole-case nonce also changes the fixture and trips the digest pin, so it does not test semantics.

## 10. Verification gaps and disclosures

- `measure-c1.mjs` does not exist yet. This review is against the spec text and the untracked expectations file (sha above). Re-review after commit.
- Counter verdicts are derived from code, with line references. Nothing was executed.
- Read-only commands run: `sha256sum` on the five working-tree files; `git cat-file -p 5f58577:<path> | sha256sum` on the same five paths; `git cat-file -t 1b5f449ad15525d281fda4558aeef1086f1e4a65`; `git cat-file -e` for the note and expectations at 5f58577; `git log` at the lane root and in `.ufo/waves/round-22/clones/BuildOracle`; `git status --short` in `.ufo/waves/round-22/clones/BuildOracle`. The `git status` may have refreshed that clone's index stat cache. No content changed.
- No installs, pacman, network, browser or service actions.
- Not checked: Chromium behaviour, producer re-run, fixture rendering, and the other eleven rows except where they bear on na-click.

Report: .ufo/waves/round-22/w1/Semantic02.md
