# RowTrace12 — `auto-invalid` raw frame sequence vs `rows[].sequence` vs note/expectation

Seat: `TabiR22-2.RowTrace12-12` (scout, leaf). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Reviewed revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (HEAD at read time). Read-only review; no lane
script was executed, no mutation was applied, no browser/REA/network, no installs, no VCS writes.

Method: `git show REV:PATH` for production; JSON field extraction and `sha256sum`-equivalent Python hashing
only. The post-commit serial receipt `.ufo/waves/round-22/checks-at-e3cf4e0.json` is **untracked in the
worktree** (created after the commit), but its `c1-after` run used `argv[2] = e3cf4e0…` and
`producerSha256 = 47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c`, which equals
`sha256(git show e3cf4e0:.ufo/waves/round-22/measure-c1.mjs)`, so its `rows[]` is bound to the committed
oracle bytes. It is cited as a retained run output, not as committed production.

## 0. Bound artifacts (revision-qualified)

| artifact | path at `e3cf4e0` | sha256 |
|---|---|---|
| case raw | `corpus/evidence/round-21/runtime/auto-invalid.json` | `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` |
| fixture | `corpus/evidence/round-21/runtime/auto-invalid.html` | `4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b` |
| receipt | `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| acquisition | `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`; artifact digest for the raw is `28a37c0e…7326aed`; stdout `LIFECYCLE_OBSERVED auto-invalid pre=1 statuses=Error` |

The raw digest equals `receipt.json` case 11 `evidence.sha256` (`receipt.json:675-678`) and the acquisition
artifact digest above, so the trace below is over the bound bytes.

## 1. Raw frame trace, `auto-invalid.json` at `e3cf4e0`

Sixteen frames, `seq` 1..16, non-decreasing `at`; invocation/response/marker frames (`auto-invalid.json:135-227`):

| role | seq | at | dir / method or label | payload digest |
|---|---|---|---|---|
| sent invocation | 9 | `1792590717645` | `sent` `WebMCP.invokeTool`, command 4 | `{frameId:"DAAC6FE7…",toolName:"lifecycle",input:{q:"not-an-email"}}` (`:135-148`) |
| invocation result | 10 | `1792590717645` | `result` command 4 | `{invocationId:"1CB23F49E89D91801A20D1C7DA8CB811"}` (`:149-157`) |
| invocation event | 11 | `1792590717647` | `event` `WebMCP.toolInvoked` | same id/frame/tool, `input:"{\"q\":\"not-an-email\"}"` (`:158-169`) |
| response | 12 | `1792590717647` | `event` `WebMCP.toolResponded` | `{invocationId:"1CB23F…",status:"Error",errorText:"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "}` (`:170-180`) |
| pre-action | 13 | `1792590717898` | `observation` `pre-action` | nonce `ff88f4bf…`; `submits:[]`, `errors:[]`, url `/auto-invalid`, `formActive:false`, `value:"not-an-email"` (`:181-197`) |
| action | 14 | `1792590717898` | `action` `none`, `phase:"no-action"` | no browser interaction (`:198-204`) |
| action-complete | 15 | `1792590717898` | `action-complete` `none` | — (`:205-210`) |
| post-action | 16 | `1792590718399` | `observation` `after-action` | byte-identical value object to seq 13 (`:211-227`) |

- Release: **none**. No frame has `dir:"release"` in the case trail.
- Windows (receipt case 11, `receipt.json:643-653`): pre `1792590717645→1792590717898` = 253 ms,
  `responseCount:1`, `formActive:false`; after `1792590717898→1792590718399` = 501 ms.
- Sequence/causality on the retained bytes: `sent 9 < result 10 < toolInvoked 11 < toolResponded 12 <
  pre 13 < action 14 < action-complete 15 < post 16`; response latency from the invoke send is 2 ms.
- Only navigation is seq 3 (`Page.frameNavigated`, initial `/auto-invalid`), before the invocation; no
  `/landing` request for this case (`receipt.json` requests: one `GET /auto-invalid` at `1792590717633`;
  the lone `/landing?q=8a5839ad…` at `1792590710188` belongs to `na-native-submit`).

## 2. What `checkCase` reads and what `rows[].sequence` contains

`checkCase` (`.ufo/waves/round-22/measure-c1.mjs:148-370`) derives the marker set by `dir`/`label`
(`:178-190`), the invocation chain by `sent.command`/`invocationId` (`:202-234`), the response set by
`WebMCP.toolResponded` + matching `invocationId` (`:254-256`), the pre/post status windows by
`frame.seq < pre.seq` / `< post.seq` (`:257-260`), and the receipt summary links (`:261-283`).
It returns (`:359-366`):

```json
{"invocation": 11, "preAction": 13, "action": 14, "response": 12, "release": null, "postAction": 16}
```

Retained run evidence for this row:

- `checks-at-e3cf4e0.json` `runs[29]` (`gate:"c1-after"`, `argv[2]:e3cf4e0…`, exit 0, value 12, clean),
  `rows[]` entry `auto-invalid` at lines 963-977: `counted:true`, `sequence` exactly the object above,
  `rawDigest:"28a37c0e…7326aed"`.
- `selftest-repair-sandbox.json` positive row: identical `sequence` and `rawDigest`.

Mapping to the raw: `preAction=13`, `action=14`, `response=12`, `release=null`, `postAction=16` are exact.
`invocation=11` is the **`WebMCP.toolInvoked` event** seq (`invoked?.seq`, `:210`, `:360`); it is not the
sent `WebMCP.invokeTool` frame (seq 9) nor its command result (seq 10), both of which the same function
also reads (`sent`, `commandResult`, `:206-208`). `rows[].sequence` carries seqs only; it emits no `at`.
The object's field order is likewise not chronological for this autosubmit row (`action` field precedes
`response`), although the values are correct.

## 3. Note row vs expectation vs raw

Note row (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:48`):

> `auto-invalid` | Error, exact malformed-email native-validity diagnostic already present in the initial
> window; no submit event | arbitrary nonempty error text or toolautosubmit-guarantees-success

Fixed expectation (`corpus/evidence/round-22/semantic-expectations.json:175-186`): `autosubmit:true`,
`action:"none"`, `mode:"invalid"`, `inputQ:"not-an-email"`, `responseWindow:"pre-action"`,
`response:{status:"Error",errorText:"…'@'.. "}`, `pre`/`post` `statuses:["Error"]`, `submitCount:0`,
`errors:[]`, `value:"$input"`, `navigation:"none"`, no `delayed`.

| claim | raw | expectation | `checkCase` read | retained verdict |
|---|---|---|---|---|
| Error outcome | seq 12 `status:"Error"` (`:177`) | `response.status:"Error"` (`:183`) | `:289-291` | match |
| exact malformed-email text | `errorText` (`:178`), repr `"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "` | identical string (`:183`); Python `==` is true | `:293-298` exact deep-equal key set `{invocationId,status,errorText}` | match |
| present in initial/pre-action region | response seq 12/at `717647` precedes pre seq 13/at `717898` | `responseWindow:"pre-action"`, `pre.statuses:["Error"]` | `:257-260`, `:304-305` | match on retained bytes |
| no submit event | pre/post `submits:[]` (`:188`,`:218`); receipt `after.submits:[]` (`:661`) | `submitCount:0` both (`:184-185`) | `validatePageState` `:121-128`; summary `:277-280` | match |
| no page error | `errors:[]` both (`:189`,`:219`) | `errors:[]` both | `validatePageState` `:129-130` | match |
| no navigation | only seq 3, at `717635`, before `after.start` | `navigation:"none"` | `:309-312` | match |
| no release/delay | no `release` frame | `delayed` absent | `:328-343` | match |
| invoked input | seq 9/11 `q:"not-an-email"` | `inputQ:"not-an-email"` | `:219-234` | match |
| document identity | pre/post nonce `ff88f4bf…`, url `/auto-invalid`, `formActive:false` | `$input`→`not-an-email`, `formActive:false`, `urlPath:"/auto-invalid"`, `urlSearch:""` | `validatePageState` `:107-146` | match |

**No literal mismatch between note, expectation and raw exists on the retained bytes.** The note's
"exact" diagnostic is not spelled out in the note itself, but note lines 50-51 defer exact strings to the
fixed expectations, and the expectation string equals the raw byte-for-byte (including the trailing
space and `.. `). The only note/expectation gap is documentary: the note does not state "no `output`
key", while `checkCase` enforces the exact three-key response set; this is W1 `Semantic12.md` G2 and is
not a retained-value contradiction.

## 4. Finding F1 (High, failure-capability) — the initial-window check is one-sided

`checkCase` enforces that the pre-action response is **before the pre-action observation**
(`:257-260`, `:304-305`) but never that it is **after the invocation** or **inside the declared window
start**. There is no equivalent of the round-21 counter's
`events.some(f => f.seq <= invoked[0].seq)` (`git show e3cf4e0:.ufo/waves/round-21/measure-c1.mjs:126`,
`event_identity`), and no `response.at >= preSummary.start` comparison (`:268-276` only compares the
summary's start to `receiptStart`, `pre.at`, and `sent.at`; `responseCount` is compared by seq,
`:271`). W1 `Semantic12.md:144` (G5) required exactly this lower bound: response seq greater than the
invoke-result seq and less than the pre-observation seq. Only the upper half landed.

Counterexample A (seq order, smallest raw-only mutation). Swap raw `auto-invalid.json` frames 11 and 12
(`WebMCP.toolInvoked` and `WebMCP.toolResponded`), keep both `at = 1792590717647`, renumber the array to
seq 11 = response, seq 12 = toolInvoked, and reseal `receipt.json:647,675-678` plus the acquisition
artifact digest (unchanged values otherwise). Static reading of every condition in `checkCase` — and an
independent throwaway Python mirror of those conditions, which returns the same empty finding set for the
retained positive as the retained clean run — gives: chain
`sent 9 < result 10 < invoked 12 < pre 13` (`:227`), one matching response seq 11 (`:255`), `beforePre`
statuses `["Error"]` (`:259`), exact params (`:296`), `responseWindow` `11 < 13` (`:304`),
`preAction.responseCount 1 === beforePre.length` (`:271`), `after.responses` equality (`:277`), no
release (`:341`) — all pass, value 12/clean. The tool would be responding before the browser reports it
as invoked, which the retained raw and the note's invocation-correlated outcome exclude. This mutation
kind is absent from `selftest-c1.mjs`'s switch (`:160-335`).

Counterexample B (declared window, receipt-only). Keep all raw frames unchanged. Set
`receipt.json:644` `preAction.start` `1792590717645→1792590717648` and `:646` `windowMs` `253→250`
(end `1792590717898` unchanged), reseal the receipt/acquisition digests. The response at
`1792590717647` now lies 1 ms **before** the declared initial window. `finite-summary-windows` passes
because it only requires `start ≥ receiptStart`, `start ≤ pre.at`, `sent.at ≤ start` (sent at
`1792590717645`), and `windowMs ≥ 250`; `beforePre` and `responseCount` are seq-based and still count the
response (the same Python mirror returns no findings for B). Value 12/clean. If "initial window" is read as `[preAction.start, preAction.end]` (the
receipt's own terminology), the note's "already present in the initial window" is false for this
mutant while the gate is green. (If "initial window" is read only as "before the pre-action observation
ends", as the `auto-positive` row words it at note line 47, counterexample B is not a contradiction but
still shows the declared start is unenforced.)

Preserving positive. The retained raw at `e3cf4e0` has response seq 12 > invoked 11, response `at`
`1792590717647 ∈ [1792590717645, 1792590717898]`, and is `counted:true` in
`checks-at-e3cf4e0.json:963-977` with value 12. Both checks below leave it green.

Smallest fix (in `measure-c1.mjs`, after the response set is formed at `:254-256`):

```js
if (matchingResponses.some((frame) => !invoked || frame.seq <= invoked.seq))
  add('semantic_timing', 'response-before-invocation');
```

and extend the `:271` condition with a window-start/end comparison for the same frames, e.g.
`|| beforePre.some((frame) => frame.at < preSummary.start || frame.at > pre.at)`. Because `:227` already
requires `commandResult.seq < invoked.seq`, `frame.seq > invoked.seq` also implies
`> commandResult.seq`; because frame `at` is non-decreasing (`:174-175`), the added `at` check also pins
the note's initial-window bounds. Add two selftest mutations (swap invoked/responded; move
`preAction.start` past the response) since none exists today.

Impact: the retained 12/12 count is unchanged and the retained row is semantically correct; the defect
is a coherent-mutant false pass that weakens the advertised failure capability of this row and leaves the
note's "initial window" wording unenforced. It is a gate gap, not an observed inconsistency in the
retained acquisition.

## 5. Reporting observations (not defects)

- `rows[].sequence.invocation` is the `WebMCP.toolInvoked` event seq (11), while the raw "invocation" has
  three frames: sent 9 at `717645`, result 10 at `717645`, event 11 at `717647`. A consumer that reads
  `invocation` as the request frame sees an off-by-two label; the value is internally consistent because
  the code deliberately uses `invoked?.seq` (`:360`). Consider reporting `sentInvocation`/`invokeResult`
  or renaming the field to `toolInvoked`.
- `rows[].sequence` emits no `at`, so the note's window claim cannot be audited from the row alone; the
  raw/receipt at values are required. This is a reporting omission, not a value mismatch.
- The object field order places `action` before `response`; for autosubmit rows the response seq is lower,
  so do not treat the field order as chronological. Values are correct.

## 6. Unrun checks / limits

- I did not execute `.ufo/waves/round-22/measure-c1.mjs`, `selftest-c1.mjs`, the producer, any gate, or
  any browser; the counterexamples are static readings of `checkCase`, checked with a throwaway Python
  mirror of its conditions run in-memory from a shell heredoc (no lane file executed), not with lane run
  outputs. No mutation was applied to the lane or any clone. No installs or updates.
- `checks-at-e3cf4e0.json` is untracked worktree evidence; its `c1-after` run is bound to the committed
  oracle by `producerSha256 = 47176aed…775c = sha256(measure-c1.mjs@e3cf4e0)`, but it is not itself part
  of revision `e3cf4e0`.
- The note's S100 source citation was not reopened; this trace is limited to S101 retained bytes.

Report: `.ufo/waves/round-22/w2b/RowTrace12.md`
