# RowTrace02 — `na-click` raw frame trace vs `checkCase` row vs oracle note

Scope: one unknown — trace the retained `na-click` frame sequence at revision
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` and compare it with what
`.ufo/waves/round-22/measure-c1.mjs` emits as `rows[].sequence` and with the
`na-click` row of `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`.
Static review only. **No lane script was executed** (no `measure-c1.mjs`,
`selftest-c1.mjs`, producer, or browser run). Numbers below are readings of
committed blobs plus my own Python transcription of the cited predicates; the
transcription is not the gate.

Revision-bound digests (sha256 of blob content at the revision):

| path | sha256 |
|---|---|
| `corpus/evidence/round-21/runtime/na-click.json` | `36502a284bad8b0b84c13346f40b1f1de1eeb8c5b6d5ce11fa8b971f877927ba` |
| `corpus/evidence/round-21/runtime/na-click.html` | `1ac88d83a4993c95265af1747f69b950c6db8d04bc18bc99b25938c017e87662` |
| `corpus/evidence/round-22/semantic-expectations.json` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e` |
| `.ufo/waves/round-22/measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |
| `.ufo/waves/round-22/selftest-c1.mjs` | `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6` |
| `.ufo/waves/round-22/fixtures/expected.json` | `b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade` |

`na-click.json` digest equals receipt `evidence.sha256` and matches expectation
`fixtureSha256` / acquisition artifact map; `na-click.html` digest matches
`raw.fixture.sha256` and expectation line 50.

## 1. Raw frame trace (16 frames; `corpus/evidence/round-21/runtime/na-click.json:1-383`)

`seq` is contiguous 1..16 and `at` is monotone non-decreasing
(1792590708001 → 1792590708815). Epoch window of the acquisition receipt
`2026-10-21T13:51:46.773Z`..`13:51:58.439Z` = `1792590706773..1792590718439`;
every frame lies inside it.

| seq | at | dir | marker | source lines |
|---:|---:|---|---|---|
| 1 | 1792590708001 | sent | `Page.enable` cmd 1 | 13-20 |
| 2 | 1792590708001 | result | cmd 1 | 21-27 |
| 3 | 1792590708006 | event | `Page.frameNavigated` → `http://127.0.0.1:43143/na-click`, frame `9967ED15…`, loader `F1E2D2DF…` | 28-53 |
| 4 | 1792590708014 | sent | `WebMCP.enable` cmd 2 | 54-61 |
| 5 | 1792590708015 | event | `WebMCP.toolsAdded` (`lifecycle`, `frameId 9967ED15…`, `backendNodeId 2`) | 62-89 |
| 6 | 1792590708015 | result | cmd 2 | 90-96 |
| 7 | 1792590708015 | sent | `Page.getFrameTree` cmd 3 | 97-104 |
| 8 | 1792590708015 | result | cmd 3 → frame `9967ED15…`, loader `F1E2D2DF…` | 105-131 |
| **9** | **1792590708015** | **sent** | **`WebMCP.invokeTool` cmd 4, `{q: nonce}`, frame `9967ED15…`** | **132-145** |
| **10** | **1792590708016** | **result** | **cmd 4 → `invocationId 5CE5ECE3…854`** | **146-154** |
| **11** | **1792590708016** | **event** | **`WebMCP.toolInvoked` — invocation marker** | **155-166** |
| **12** | **1792590708268** | **observation** | **`pre-action`** (Δ +252 ms from 10/11) | **167-183** |
| **13** | **1792590708269** | **action** | **`click`, `dispatch-started`** (Δ +1 ms from 12) | **184-190** |
| **14** | **1792590708314** | **event** | **`WebMCP.toolResponded` `Completed`, `output {ok:true,nonce,q}`** (Δ +45 ms from 13) | **191-205** |
| 15 | 1792590708314 | action-complete | `click` (Δ 0 ms from 14) | 206-211 |
| **16** | **1792590708815** | **observation** | **`after-action`** (Δ +501 ms from 15) | **212-236** |

No `dir:"release"` frame exists in this case (mode `success`, not `delayed`).
No `frameNavigated` after the pre-action window; `after.navigations` is `[]`.
Page states (raw lines 172-182 / 217-235): pre `formActive true`, `submits []`,
`value = nonce`, `focused "go"`, `secureContext true`; post `formActive false`,
one submit `{agentInvoked:true,isTrusted:true,q:nonce,active:true,respondWith:"function"}`,
`errors []`, same URL, `value = nonce`, `focused "go"`. Cleanup envelope:
9 `browserPidsBefore`, `browserPidsAfter []`, `contextClosed true`, no
`closeError`, `blocked []`, `downloads []`.

## 2. What `checkCase` reads and what `rows[].sequence` reports

`measure-c1.mjs:359-366` builds the projection:

```
invocation : invoked?.seq                -> 11   (the toolInvoked EVENT, not the command)
preAction  : pre?.seq                    -> 12
action     : actionFrame?.seq            -> 13
response   : matchingResponses[0]?.seq   -> 14
release    : first frame.dir==='release' -> null
postAction : post?.seq                   -> 16
```

Retained measurement row (`.ufo/waves/round-22/checks-at-e3cf4e0.json`,
`runs[gate="c1-after"]`, revision field `e3cf4e0d…`):

```json
{"id":"na-click","outcome":"Completed","semanticMatch":true,"counted":true,
 "sequence":{"invocation":11,"preAction":12,"action":13,"response":14,
             "release":null,"postAction":16},
 "findings":[],"rawDigest":"36502a284bad8b0b84c13346f40b1f1de1eeb8c5b6d5ce11fa8b971f877927ba"}
```

Independently re-derived sequence from the committed raw blob: **identical**
(`invocation 11, preAction 12, action 13, response 14, release None, postAction 16`).
Note the raw's `action-complete` at seq 15 has no slot in the projection.

## 3. Three-way comparison: raw ↔ pinned expectation ↔ note row

Note row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:38`):
`| na-click | Completed, dummy object with ok=true and nonce/q equal the case nonce | silent trail, wrong status or a different output nonce |`.
Expectation (`corpus/evidence/round-22/semantic-expectations.json:45-55`):
`responseWindow "action-to-post"`, `response {status Completed, output {ok:true, nonce:$nonce, q:$input}}`,
`inputQ $nonce`, `pre {minMs 250, formActive true, formExists true, value $input, submitCount 0, statuses [], errors [], focused "go", urlPath "/na-click", urlSearch ""}`,
`post {minMs 500, formActive false, formExists true, value $input, submitCount 1, statuses ["Completed"], errors [], focused "go", urlPath "/na-click", urlSearch ""}`,
`navigation "none"`.

| axis | raw | expectation | note row | verdict |
|---|---|---|---|---|
| status | `Completed` (seq 14) | `Completed` | Completed | agree |
| output | `{ok:true,nonce:<nonce>,q:<nonce>}` | `ok:true`, `nonce:$nonce`, `q:$input` → `<nonce>` | "ok=true and nonce/q equal the case nonce" | agree (`q` is the invocation input, which is the nonce here — line 49) |
| response position | seq 14 strictly inside (action 13, post 16); 45 ms after dispatch, same ms as dispatch completion | `action-to-post` | no position claimed | agree |
| release | absent | `delayed` undefined → any release frame is a finding | only `na-delayed` describes release | agree |
| pre state | formActive true, submits [], value nonce, focused go | lines 53 exactly | not claimed (outcome row only) | agree |
| post state | formActive false, 1 trusted submit, errors [] | line 54 exactly | not claimed | agree |
| navigation | none after action window | `"none"` | not claimed (only `na-native-submit` row speaks to navigation) | agree |

**No mismatch found between note, expectation and raw on any axis the trace
exposes.** The note delegates structural contracts to the expectations
("Exact diagnostic strings and structural contracts are in the fixed
expectations"), and every structural value it delegates is satisfied by the raw.

## 4. Re-derived gate predicates (line refs; all pass)

| predicate | measure-c1.mjs | required | raw |
|---|---|---|---|
| frame sequence / clock | 174-175 | seq 1..16, monotone `at` | true |
| frames inside receipt window | 176-177 | 1792590706773 ≤ at ≤ 1792590718439 | true |
| pageObservations ↔ observation frames | 178-181 | deep equal | true |
| marker set | 184-190 | exactly 1 pre, 1 post, 0 delayed | 1/1/0 |
| action invocation | 192-198 | 1 action + 1 complete, `click`, phase `dispatch-started` | seq 13/15 |
| pre<action<complete<post | 199-200 | 12<13<15<16 | true |
| current invocation chain | 219-228 | sent 9 < result 10 < invoked 11 < pre 12; ids/frameId/tool/input bound | true |
| finite-window statuses | 254-260 | beforePre `[]`, beforePost `["Completed"]` | `[]`, `["Completed"]` |
| finite summary windows | 264-276 | pre 8016..8268 (252 ms, [250,10000], start ≥ sent.at 8015, responseCount 0); after 8268..8815 (547 ms, [500,10000], start ≥ pre.at and ≤ action.at 8269, complete.at 8314 ≤ end) | true |
| receipt↔raw summary | 277-282 | responses/pageState/submits/navigations equal raw | true (navigations `[]`) |
| response count/status/exact params | 285-299 | 1 response, `Completed`, params `{invocationId,status,output}` | true |
| action-to-post window | 306-307 | 13 < 14 < 16 | true |
| navigation none | 311-312 | no post-action navigation | none |
| no release marker | 341-342 | no `dir:"release"` | none |
| cleanup envelope | 345-349 | 9 pids before, none after, closed, no blocked/downloads | true |

## 5. Findings

**Actual bugs: none. Note/expectation/raw mismatches: none** on the traced axes.

Three non-defect observations are recorded so they are not mistaken for
mismatches later. None changes the count, the verdict, or any gate outcome;
they are out of scope as rule/naming or projection completeness issues.

**O1 — `sequence.invocation` is the event seq, not the command seq.**
`measure-c1.mjs:360` reads `invoked?.seq` = 11 (`WebMCP.toolInvoked`), while the
request is the `sent` frame seq 9 and its result seq 10
(`na-click.json:132-154`). The note says only that the raw "retains the
invocation-correlated ordered frames" (note, "Case-specific decisions" lead-in)
and never defines `sequence.invocation`; the gate binds the full chain at line
227 (`sent < commandResult < invoked < pre`). No contradiction and no gate
consequence. Out-of-scope naming/precision nit; smallest fix if ever wanted:
carry `command: sent?.command ?? null` beside `invocation`.

**O2 — the projection drops `action-complete` (seq 15).** Raw frames 14 and 15
share `at = 1792590708314`; the tool response lands strictly *before* the click
dispatch completes. `rows[].sequence` reports `response 14`, `postAction 16` and
has no slot for 15, so a consumer reading only the row cannot see that the
response preceded dispatch completion. The gate does read `completeFrames`
(lines 194-198, 274-275), so the ordering is enforced; only the diagnostic
projection is lossy. Out-of-scope observability nit; smallest fix if wanted:
add `actionComplete: completeFrame?.seq ?? null` at line 359-366.

**O3 — "pre-action" means pre-*action*, not pre-invocation.** Frame 11
(`toolInvoked`, 1792590708016) precedes frame 12 (`pre-action`, …8268), and
`preSummary.start` (…8016) equals the invokeTool *result* timestamp, one
millisecond after the invokeTool send (…8015); lines 270 (`sent?.at > preSummary.start`
is a finding) and 227 encode this. Consequently the pinned pre state
(`formActive true`, `value = <nonce>`, `focused "go"` — expectation line 53)
reflects a form that the agent invocation has already populated/activated.
`scripts/webmcp-lifecycle-round21.mjs` contains **no** `page.fill`/focus call
(only the `observe` expression mentions `focused`, line 189), so the filled
value and focus are browser-side effects of declarative tool-form activation
[INFERENCE from producer source + raw state; not independently re-observed].
The note's `na-click` row states only the outcome and is not contradicted, but
readers must not treat `pre` as an untouched baseline. Documentation
precision only; no fix required for the gate.

## 6. Preserving positives / what would have falsified the trace

Positive (read statically, not re-run): retained `c1-after` run has
`value 12, verdict clean, findings []`; the `na-click` row is `counted true`
with `findings []`; retained `oracle22-selftest` reports `cases 44, passed 44`.
The `na-click`-specific negative controls in `.ufo/waves/round-22/fixtures/expected.json`
are: `status-na-click` (`semantic_status`), `wrong-success-nonce`
(`semantic_output`), `finite-short-window` (`semantic_timing`),
`raw-case-hash-unpinned` (`evidence_binding`), `malformed-receipt` /
`malformed-raw-frames` (`input_shape`). The note's stated rejects map to the
gate as follows: silent trail → `response-count` (line 289) and
`finite-window-response-statuses` (259-260); wrong status → `outcome-status`
(291); different output nonce → `exact-output-shape` (296-298). My independent
re-derivation over the committed blobs reproduced every predicate in section 4
without a single deviation.

## 7. Unrun checks and limits

- Not run: `measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py`, the round-21
  producer, any browser/CDP acquisition, any git write. No lane script executed.
- `checks-at-e3cf4e0.json` was read as a retained receipt but is *untracked* in
  the working tree at review time; the section 3/4 conclusions do not depend on
  it, because they were re-derived from committed blobs.
- A finite outcome oracle cannot establish that the click caused the submit, nor
  general browser semantics; it only bounds the recorded frames. PID cleanup is
  sampled owned-process evidence, unchanged by this trace.
- No tool installs or upgrades were needed or performed.
- Write boundary: only this report was written. `git status --porcelain` shows
  no modified tracked file; the `.ufo/waves/round-22/w2b/` directory is itself
  untracked, so the report does not appear as an individual entry.
