# RowTrace03 — raw/expectation/note trace of `na-requestsubmit`

- Item: freshness/falsification seat RowTrace03 (w2b), revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`.
- Question: trace the raw frame sequence of `na-requestsubmit` (invocation, pre-action, action, response, release, post-action seq/at), compare with what `measure-c1.mjs` `checkCase` reads into `rows[].sequence`, and with the knowledge-note row; report any mismatch among note, expectation and raw.
- Method: read-only static review. Production read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH`. No lane script was executed, no browser ran, nothing was written except this file.
- Evidence blobs at the reviewed revision (sha256, verified by me):
  - `corpus/evidence/round-21/runtime/na-requestsubmit.json` = `4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa`
  - `corpus/evidence/round-21/runtime/na-requestsubmit.html` = `1796f206a10c85b94d21db0381610858150c971cb8131c0ae40cfab8fbbd2085`
  - `corpus/evidence/round-22/semantic-expectations.json` = `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`
  - `.ufo/waves/round-22/measure-c1.mjs` = `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c`
  - `.ufo/waves/round-22/selftest-c1.mjs` = `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6`
  - `corpus/evidence/round-21/runtime/receipt.json` = `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`
  - The `measure-c1.mjs` and `selftest-c1.mjs` digests equal `filesAfter` in `.ufo/waves/round-22/post-crash-repair.json:73-76`, so the landed bytes are the repaired oracle.

## Verdict

No mismatch found among raw, expectation and note row for `na-requestsubmit`. The row is semantically clean: `semanticMatch=true`, `findings=[]`, `counted=true` in the serial receipt (`checks-at-e3cf4e0.json`, run 29 `c1-after`, value 12, verdict clean). The row was already `semanticMatch=true` before the landing-stage repair (`checks-pre-w2-0f24164.json`, `runs[29].observedMetrics.rows[2]`), so neither D1 (`semantic_error`) nor D2 (`semantic_navigation`) touched this case.

Two documentation-boundary observations (no metric defect) and one provenance note follow the trace. They are labeled O1-O3; they are not author-authenticity or browser-semantics claims.

## 1. Raw frame trace

`corpus/evidence/round-21/runtime/na-requestsubmit.json` (16 frames, `frames[].seq` = 1..16, `at` = `Date.now()` ms):

| seq | dir | what | at | delta |
|---:|---|---|---:|---:|
| 9 | sent | `WebMCP.invokeTool` command 4, frameId `CD8BCA…`, toolName `lifecycle`, `input.q`=nonce | 1792590708996 | — |
| 10 | result | command 4, `invocationId=56322DDB67194D60972B07E2BCABB7B7` | 1792590708997 | +1 |
| 11 | event | `WebMCP.toolInvoked`, same invocationId, `input` as JSON string `{"q":"99664…"}` | 1792590708997 | 0 |
| 12 | observation | `pre-action` (formActive true, submits [], errors [], focused `go`) | 1792590709250 | +253 |
| 13 | action | `requestSubmit`, phase `dispatch-started` | 1792590709250 | 0 |
| 14 | action-complete | `requestSubmit` | 1792590709251 | +1 |
| 15 | event | `WebMCP.toolResponded`, status `Completed`, output `{ok:true,nonce,q}` | 1792590709252 | +1 |
| 16 | observation | `after-action` (formActive false, submits `[{agentInvoked:true,isTrusted:true,q,active:true,respondWith:"function"}]`, errors []) | 1792590709753 | +501 |

- **Release**: no `dir:"release"` frame exists for this case; the release marker is emitted only for `na-delayed` (producer `scripts/webmcp-lifecycle-round21.mjs:223`, raw `na-delayed.json` seq 16).
- **Navigation**: the only `Page.frameNavigated` is the initial one at seq 3 (`http://127.0.0.1:43143/na-requestsubmit`), before the action.
- Frame clock is non-decreasing; every `at` lies inside the receipt envelope `[1792590706773, 1792590718439]` (`receipt.json` `startedAt`/`finishedAt`).
- Sequence is by producer construction: `frame()` assigns `seq: ++seq, at: Date.now()` (`webmcp-lifecycle-round21.mjs:162-163`); `preStart=Date.now()` at line 206, `sleep(250)` line 207, `observe('pre-action')` line 208; `actionAt=Date.now()` line 211, dispatch line 214 (`page.evaluate(() => document.querySelector('#f').requestSubmit())`), `frame('action')` line 220, `frame('action-complete')` line 222, `sleep(500)` line 224, `observe('after-action')` line 225. The observed deltas (253, 0, 1, 1, 501) are exactly that code plus evaluate latency.

## 2. What `checkCase` projects into `rows[].sequence`

`measure-c1.mjs:351-369` maps the raw to `sequence = {invocation, preAction, action, response, release, postAction}`:

| field | expression (line) | resolved seq | `at` |
|---|---|---:|---:|
| `invocation` | `invoked?.seq` (360), `invoked = invokedEvents[0]` (210) | **11** (`WebMCP.toolInvoked` event) | 1792590708997 |
| `preAction` | `pre?.seq` (361) | 12 | 1792590709250 |
| `action` | `actionFrame?.seq` (362) | 13 | 1792590709250 |
| `response` | `matchingResponses[0]?.seq` (363) | 15 | 1792590709252 |
| `release` | `frames.find(dir==='release')?.seq` (364) | `null` | — |
| `postAction` | `post?.seq` (365) | 16 | 1792590709753 |

These are exactly the values in the serial receipt row (`checks-at-e3cf4e0.json`, `runs[29].observedMetrics.rows[2].sequence`), which I also derived independently from the source and raw above. `sequence` is **diagnostic only**: `row.counted = !blocked && row.semanticMatch` (`measure-c1.mjs:483`) and `semanticMatch = local.length === 0` (352); `sequence` is never consulted by a gate.

## 3. Constraints `checkCase` applies to this case (all pass)

- frame numbering/clock: `seq === index+1`, `at` monotonic (`174-175`); inside receipt window (`176-177`).
- `pageObservations` equals the observed observation frames (`178-181`); exactly one `pre-action`, one `after-action`, zero `delayed-before-release` (`183-190`).
- exactly one action frame and one action-complete, action name `requestSubmit`, phase `dispatch-started` (`192-198`); order `pre.seq 12 < action 13 < complete 14 < post 16` (`199-200`).
- invocation chain: one sent `invokeTool` (9), one result (10) carrying `56322DDB…`, one `toolInvoked` (11) carrying the same id, same frame id from `Page.getFrameTree`, exact input `{q:nonce}`, order `9<10<11<12` (`202-228`); receipt `invocationId` cross-link (`229-230`).
- initial loopback navigation `/na-requestsubmit` (`236-244`); pre/post observation frames re-linked to `pageObservations` (`246-250`).
- finite windows: before `pre` (seq<12) statuses `[]`, before `post` (seq<16) statuses `["Completed"]` (`254-260`); `preAction` `start 1792590708997`, `windowMs 253` ≥ 250 (`268-271`); `after` `start 1792590709250`, `windowMs 503` ≥ 500 (`272-276`); `sent.at 1792590708996 <= preSummary.start 1792590708997` (line 270).
- receipt↔raw: `after.responses` equals the raw response params, `after.pageState`/`after.submits` equal the raw post observation, `after.navigations` `[]` (`277-282`).
- response: exactly one, status `Completed`, params exactly `{invocationId, status, output:{ok:true, nonce:nonce, q:nonce}}` (`285-300`); `action-to-post` window admits seq 15 (`13 < 15 < 16`, `306-307`).
- navigation `none` (`311-312`); no release marker for a non-delayed case (`341-342`); cleanup/boundary (`345-349`).

Fixture cross-check: `na-requestsubmit.html:2-3` is the tool form with `action="/landing" method="get"`; `:7-16` records `agentInvoked/isTrusted/q/:tool-form-active/typeof e.respondWith`, calls `preventDefault()`, and for `mode="success"` does `e.respondWith(Promise.resolve(value))` at `:15` — hence no navigation and the recorded submit object.

## 4. Three-way comparison (note ↔ expectation ↔ raw)

- Note row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:39`): required distinction "Completed with the same dummy-object contract". Raw seq 15 output is exactly the `na-click`-shaped dummy object `{ok:true, nonce, q}`; expectation `:65` encodes the same object with `$nonce`/`$input` tokens. **Match.**
- Note reject "human-only completion": encoded by the exact submit record (`semantic-expectations.json:67` `submitCount:1`; `measure-c1.mjs:124-128` deep-equals `{agentInvoked:true,isTrusted:true,q:nonce,active:true,respondWith:"function"}`). A non-agent or absent submit record fails `semantic_status … :submit-event`. **Consistent, machine-checked.**
- Note reject "an absent-user-activation inference": **not encoded by any gate predicate.** The raw records no activation signal: `isTrusted` is DOM event trust, and `active` is `#f.matches(':tool-form-active')` (producer `:189`, fixture `:8`). This is a review instruction, not a row check — but it does not contradict the raw, which is silent in both directions. See O2.
- Note `:50-51` delegates exact structural contracts to the fixed expectations. The expectation's extra structure (post `formActive:false`, `submitCount:1`, `focused:"go"`, `navigation:"none"`) is therefore stipulated, not a note/raw contradiction. See O3.
- Note `:31-33` calls the receipt row "an index and summary, not independent corroboration". Verified: `after.responses` is a verbatim copy of the raw response params and `preAction`/`after` windows are derived from raw frame timestamps; `measure-c1.mjs:264-282` enforces that equality.

## 5. Observations (no metric defect)

**O1 — `sequence.invocation` names the `toolInvoked` event, not the `invokeTool` command.**
- Where: `measure-c1.mjs:360` (`invocation: invoked?.seq ?? null`), with `invoked = invokedEvents[0]` (`:210`); raw `na-requestsubmit.json` frames seq 9/10/11.
- Effect: a reader who takes "invocation" to mean the sent command reads 9 (at 1792590708996); the oracle reports 11 (at 1792590708997). Both readings exist nowhere defined: the note does not name the `sequence` fields at all, and `selftest-c1.mjs` contains no `sequence` assertion.
- Smallest counterexample: the same projection yields `invocation: 11` for every case, including `na-click`, where the sent command is seq 9 as well — so the field is consistently the event, never the send. Preserving positive: the gating chain uses the send (`sent.seq 9 < result 10 < invoked 11 < pre 12`, `:227`) and passes.
- Severity: informational. `counted` does not depend on `sequence` (`:483`).
- Smallest fix: one sentence in the note defining the six `sequence` fields (event, not command). A script rename would change `measure-c1.mjs`'s digest, which the cohort receipt pins as `producerSha256`, so the doc-only fix is smaller and does not disturb pinned identities.

**O2 — "absent-user-activation inference" has no gate encoding.**
- Where: note `:39` versus `measure-c1.mjs:107-146` (page-state) and `:285-300` (response); the raw has no activation field.
- Effect: the gate cannot fail a report that asserts presence or absence of user activation for this case. The raw supports neither: the action is `page.evaluate(...requestSubmit())` (`webmcp-lifecycle-round21.mjs:214`) and is recorded only as the producer's own `action` frame, not as an input event; nothing in the 16 frames evidences a gesture.
- Smallest counterexample: delete every input-related frame — there are none; the row still passes, which is correct for the recorded distinction but shows the clause is not testable here. Preserving positive: the three dimensions the note does state (status, dummy object, agent-invoked submit) are each gate-encoded and each fail under mutation (section 6).
- Severity: documentation-boundary, not a lifecycle defect. The note itself says exact contracts live in the expectations (`:50-51`), and its limits section requires corrections as new entries, not in-place edits.
- Smallest fix: a new correction entry stating that this reject clause is review-only, or an explicit "(review-only)" qualifier in a future note revision. Do not edit the historical note body in place.

**O3 — the note row under-specifies the structural contract the expectation enforces.**
- Where: note `:39` ("Completed with the same dummy-object contract") versus `semantic-expectations.json:67` (post `formActive:false`, `submitCount:1`, `focused:"go"`, `navigation:"none"`).
- Effect: a completion carrying the dummy object but no recorded agent submit would satisfy the note's stated distinction while failing the expectation (`semantic_status … :submit-event`). This is strictly in the note's own reject direction ("human-only completion") and is explicitly delegated at `:50-51`, so it is not a contradiction.
- Preserving positive: the raw agrees with the expectation on every one of those fields (seq 12/16 observations, no post navigation).
- Smallest fix: none required for the row; if closure wants the note self-contained, list the submit-record requirement in a correction entry.

**O4 — provenance of the serial receipt used to corroborate.**
- `.ufo/waves/round-22/checks-at-e3cf4e0.json` (referenced by the wave context as 35/35) is **untracked** at the reviewed revision (`git status --porcelain`: `?? .ufo/waves/round-22/checks-at-e3cf4e0.json`) and therefore not part of `e3cf4e0`. It records `revision e3cf4e0…`, `producerSha256 47176aed…` (matching the reviewed blob) and run 29 `c1-after` value 12 clean. I used it only as corroboration; every `na-requestsubmit` value in section 2 was independently derived from the source and raw in section 1.
- Smallest fix: commit the receipt in the next wave labeling it post-w2b provenance, or cite the tracked pre-repair receipt plus the source derivation instead.

## 6. Falsification attempts (static derivation; not executed)

Each mutation below is checked against the cited predicate; the unmutated raw is the preserving positive (`rows[2].findings=[]`, `counted=true`).

| Mutation of raw (with matching receipt update) | Predicate | Expected finding |
|---|---|---|
| `submits[0].agentInvoked=false`, or `submits=[]` | `measure-c1.mjs:124-128` | `semantic_status na-requestsubmit:post:submit-event` |
| response status `Completed`→`Canceled` | `:291` | `semantic_status … :outcome-status` |
| output `q` changed from nonce | `:295-298` | `semantic_output … :exact-output-shape` |
| response moved to seq ≤ action frame | `:306-307` | `semantic_timing … :response-outside-action-window` |
| response moved to seq ≥ post frame | `:306-307` | same |
| `release` frame injected | `:341-342` | `semantic_delayed … :unexpected-release-marker` |
| post `formActive:true` | `:112-114` | `semantic_status … :form-state` |
| pre/post window start shifted before `sent.at` | `:270` | `semantic_timing … :finite-summary-windows` |

Preserving positive for the window rule: `na-click` has the response at seq 14 **before** `action-complete` seq 15 and still counts (`:306` only requires `action < response < post`), so the rule constrains pre-action completion without overfitting to completion order.

## 7. Exercises actually run

All read-only; every exit code is 0 unless shown.

| command | exit |
|---|---|
| `git -C … show e3cf4e0…:corpus/evidence/round-21/runtime/na-requestsubmit.json` | 0 |
| `git -C … show e3cf4e0…:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | 0 |
| `git -C … show e3cf4e0…:corpus/evidence/round-22/semantic-expectations.json` | 0 |
| `git -C … show e3cf4e0…:.ufo/waves/round-22/measure-c1.mjs` | 0 |
| `git -C … show e3cf4e0…:.ufo/waves/round-22/selftest-c1.mjs` (grep for `sequence`) | 0 |
| `git -C … show e3cf4e0…:.ufo/waves/round-22/post-crash-repair.json` | 0 |
| `git -C … show e3cf4e0…:scripts/webmcp-lifecycle-round21.mjs` (lines 150-275, 204-226) | 0 |
| `git -C … show e3cf4e0…:corpus/evidence/round-21/runtime/receipt.json` (python extract) | 0 |
| `git -C … show e3cf4e0…:corpus/evidence/round-21/runtime/na-requestsubmit.html` | 0 |
| `git -C … show e3cf4e0…:corpus/evidence/round-21/runtime/na-click.json`, `na-delayed.json` (python frame dump) | 0 |
| `git -C … show e3cf4e0…:.ufo/waves/round-21/runtime-execution-finalized.json` (python extract) | 0 |
| `git -C … cat-file`-equivalent digest loop over seven paths (`git show … | sha256sum`) | 0 |
| `python3` epoch/window arithmetic on receipt timestamps | 0 |
| `python3` JSON walk of `checks-at-e3cf4e0.json` and `checks-pre-w2-0f24164.json` | 0 |
| `git -C … rev-parse HEAD`, `git status --porcelain`, `git log --oneline -4` | 0 |
| `git -C … show e3cf4e0…:corpus/evidence/round-22/semantic-expectations.json | nl` (lines 57-69) | 0 |
| `git -C … grep -n "preAction\|postAction\|sequence" e3cf4e0… -- .ufo/waves/round-22 corpus/knowledge` | 0 |

No installation or upgrade was performed; no tool version changed.

## 8. Unrun checks and limits

- I did not execute `.ufo/waves/round-22/measure-c1.mjs` (revision run or `--selftest`); the bounds forbid executing lane scripts. The `rows[].sequence` values in section 2 are hand-derived from the cited source lines and then confirmed against the untracked serial receipt row; they are not a claim that I re-ran the gate.
- I did not run a browser or produce a new acquisition; all timing/ordering facts come from the retained round-21 JSON.
- I reviewed only `na-requestsubmit`; the other eleven rows are cited only where the receipt reports them.
- The "35/35" cohort claim rests on `checks-at-e3cf4e0.json`, which is untracked at this revision (O4). The tracked pre-repair receipt (`checks-pre-w2-0f24164.json`, revision `0f24164`, verdict failed) independently shows this row `semanticMatch=true` with the same sequence.
- This is author-side static falsification, not non-author admission, and it says nothing about malicious-author authenticity (the evidence and the expectations are in the same commit; the note states that limitation at `:26-27`).

## 9. Smallest fixes

1. Row `na-requestsubmit`: none. Raw, expectation, note distinction and gate agree; the row counts at `e3cf4e0`.
2. O1: add one line to the note defining `rows[].sequence` fields (`invocation` = `WebMCP.toolInvoked` event seq; `response` = `toolResponded` seq; `release` = `dir:"release"` seq or null). Doc-only, no pinned digest changes.
3. O2/O3: new correction entry for the note recording that the activation clause is review-only and that the submit-record contract lives in `semantic-expectations.json:67`; do not rewrite the historical note in place.
4. O4: commit `checks-at-e3cf4e0.json` under a post-w2b label, or replace the citation with the tracked pre-repair receipt plus the static derivation above.
