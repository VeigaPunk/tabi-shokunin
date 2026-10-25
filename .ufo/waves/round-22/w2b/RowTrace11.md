# RowTrace11 — `auto-positive` raw frame trace vs `rows[].sequence` vs round-22 note row

Seat: TabiR22-2.RowTrace11-12 (scout, leaf). Review revision
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (committed, landed). Static review only:
no lane script was executed, no browser, no install, no delegation, no lane/fleet VCS
mutation. This file is the only write.

## 0. Answer

**No semantic mismatch exists among the round-22 note row, the pinned expectation and
the raw `auto-positive` bytes.** Status, output, page state, ordering, window
arithmetic, response count and absence of navigation all agree; the retained e3cf4e0
run counts the row (11th row, `rows[10]`: `semanticMatch = true`, `counted = true`,
`outcome = "Completed"`).

One literal, non-scoring mismatch exists between `rows[].sequence` and the raw
invocation frames: the emitted `sequence.invocation` is the `WebMCP.toolInvoked`
**event** seq (11), not the `WebMCP.invokeTool` **request** seq (9) (F1). Two further
precision hazards are real but are not verdict defects (F2 cumulative receipt
`after.responses`; F4 window-boundary equality). Details below.

## 1. Evidence read (revision-bound, digests computed from the commit blobs)

| artifact | path at `e3cf4e0` | sha256 |
|---|---|---|
| case raw | `corpus/evidence/round-21/runtime/auto-positive.json` | `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe` |
| fixture | `corpus/evidence/round-21/runtime/auto-positive.html` | `5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19` |
| receipt | `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| expectations | `corpus/evidence/round-22/semantic-expectations.json` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (equals `measure-c1.mjs:22`) |
| note | `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e` |
| gate | `.ufo/waves/round-22/measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |
| acquisition manifest | `.ufo/waves/round-21/runtime-execution-finalized.json` — `artifacts["corpus/evidence/round-21/runtime/auto-positive.json"]` | `62f257e9…099e0fe` (match) |
| retained row output | `.ufo/waves/round-22/checks-at-e3cf4e0.json` (working-tree file, **not** in commit `e3cf4e0`; see F6) | disk `8f4679ad20d02e6b58078ce4bb346de7c0f503e25cd1ba61e615825fc8a1fbe9` |

The raw fixture digest and the raw hash link match the expectation pin
(`semantic-expectations.json:168`) and the receipt evidence pin
(`receipt.json:631-634`).

## 2. Exact raw frame trace (`auto-positive.json`, 16 frames, `seq` 1..16, `at` non-decreasing)

Header: `"autosubmit": true` (line 5), `"action": "none"` (line 6), `"mode": "success"`
(line 7). Lifecycle frames only:

| point | raw frame | `seq` | `at` | payload |
|---|---|---|---|---|
| invocation request | `sent` `WebMCP.invokeTool` cmd 4 (lines 135-148) | **9** | 1792590716711 | `{frameId:F3C0…, toolName:"lifecycle", input:{q:<nonce>}}` |
| invocation result | `result` cmd 4 (lines 149-157) | 10 | 1792590716712 | `{invocationId:"4F3E02707F9A539DF7284C78EC392F5A"}` |
| invocation event | `event` `WebMCP.toolInvoked` (lines 158-169) | **11** | 1792590716712 | same `invocationId`; `input` = `{"q":"87f2…"}` |
| response | `event` `WebMCP.toolResponded` (lines 170-184) | **12** | 1792590716712 | `status:"Completed"`, `output:{ok:true,nonce:<nonce>,q:<nonce>}`, **no `errorText`** |
| pre-action observation | `observation` label `pre-action` (lines 185-209) | **13** | 1792590716965 | form inactive, one submit record, no errors |
| (pre window start; not a frame) | receipt `preAction.start` (receipt line 580) | — | 1792590716712 | window `[6712, 6965]`, `windowMs` 253 |
| action | `action` `action:"none"`, `phase:"no-action"` (lines 210-216) | **14** | 1792590716965 | — |
| action complete | `action-complete` `action:"none"` (lines 217-222) | 15 | 1792590716965 | — |
| release | **absent** (no `dir:"release"` frame anywhere) | — | — | — |
| post-action observation | `observation` label `after-action` (lines 223-247) | **16** | 1792590717466 | value byte-identical to pre (`pre.value === post.value`) |

Other facts: only navigation is the initial `Page.frameNavigated` at seq 3
(`http://127.0.0.1:43143/auto-positive`); `pageObservations` deep-equals the two
observation frames (lines 249-298); receipt `after` window `[6965, 7466]`
(`windowMs` 501), `responses` = the single Completed response, `submits` = the one
submit record, `navigations` = `[]`, `pageState` equals the after-action value
(receipt lines 586-630); cleanup `browserPidsBefore` non-empty, `browserPidsAfter []`,
`contextClosed true`, `blocked []`, `downloads []`.

Pre/post page state (both observations, identical): `nonce` = case nonce,
`submits` = `[{agentInvoked:true, isTrusted:true, q:<nonce>, active:true,
respondWith:"function"}]`, `errors:[]`, `url` = loopback `/auto-positive` (no query),
`secureContext:true`, `formExists:true`, `formActive:false`, `value:<nonce>`,
`focused:""`.

## 3. What `checkCase` emits (`measure-c1.mjs:351-369`)

`sequence` is a role→seq map built from the raw frames
(`measure-c1.mjs:359-366`): `invocation: invoked?.seq`, `preAction: pre?.seq`,
`action: actionFrame?.seq`, `response: matchingResponses[0]?.seq`,
`release: <first release frame>.seq ?? null`, `postAction: post?.seq`. It emits **no
`at` values**.

Retained e3cf4e0 row (`.ufo/waves/round-22/checks-at-e3cf4e0.json`, gate `c1-after` at
line 760, `runs[29]`, `producerSha256` = `47176aed…b0775c` = the committed gate;
`value` 12, `verdict` `clean`):

```
auto-positive  outcome Completed  semanticMatch true  counted true  findings []
sequence {"invocation":11,"preAction":13,"action":14,"response":12,"release":null,"postAction":16}
rawDigest 62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe
```

Mapping to raw: `invocation` 11 = `WebMCP.toolInvoked`; `preAction` 13 = pre-action
observation; `action` 14 = action frame; `response` 12 = `WebMCP.toolResponded`;
`release` `null` = no release frame; `postAction` 16 = after-action observation. The
`rawDigest` equals the receipt pin.

`at` ordering, reconstructed from `rows[].sequence` + the raw (the gate itself
enforces non-decreasing `at` with `seq`, `measure-c1.mjs:174-175`):
`response(12)@6712 < preAction(13)@6965 = action(14)@6965 < postAction(16)@7466`.
The response is **253 ms before** the pre-action observation frame.

## 4. Note row and expectation vs raw

Note row is `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:47`:
> `auto-positive` | Completed dummy object already present before the initial observation ends | pretending this held-ground control is a new non-autosubmit branch
Expectation block is `corpus/evidence/round-22/semantic-expectations.json:163-174`.

| claim | source | raw | verdict |
|---|---|---|---|
| status `Completed` | expectation:170; note:47 | raw:177 | match |
| exact output `{ok:true,nonce,q}` with no `errorText` | expectation:170; gate:289-300 | raw:175-183 | match |
| response before the pre-action observation ends | note:47; gate:304 | seq 12 < 13; at 6712 < 6965 | match |
| `pre` page state (form inactive, one submit record, no errors, `focused:""`, path/method) | expectation:171; gate:107-146 | raw:190-208 | match (all 9 fields) |
| `post` page state | expectation:172 | raw:228-246 | match (identical to pre) |
| `pre`/`post` statuses `["Completed"]` (cumulative before each observation) | expectation:171-172; gate:257-260 | one response seq 12 | match |
| windows 253 ms ≥ 250 / 501 ms ≥ 500, `start/end/windowMs`, `responseCount` 1, `formActive` false | expectation:171-172; gate:261-283 | receipt:579-589 | match |
| no navigation | expectation:173; gate:311-312 | only nav is seq 3, before action | match |
| autosubmit / action `none` (no new non-autosubmit branch) | note:47; gate:162,196-198 | raw:5-6; action phase `no-action` | match |
| dummy object, single invoke chain, same frame/invocation ids | note:31-33; gate:219-228 | raw:5-11, 135-169 | match |
| no release (`delayed` absent) | expectation (no `delayed` key); gate:341-343 | no release frame | match |
| note population claim “five Completed” (note:51-53) | note:51-53 | Completed = na-click, na-requestsubmit, na-native-submit, na-delayed, auto-positive | match |

No field of the expectation is unsatisfied by the raw, and the retained gate run
reports no finding for this row.

## 5. Findings

### F1 (informational, non-scoring) — `rows[].sequence.invocation` is the event seq, not the request seq

- Evidence: `measure-c1.mjs:360` reads `invoked?.seq` (`WebMCP.toolInvoked`); raw
  request is `sent WebMCP.invokeTool` seq **9** (raw:135-140) and its `result` seq 10
  (raw:149-156); the event is seq **11** (raw:158-162). Retained row says
  `"invocation": 11`.
- Smallest counterexample: compare `rows[].sequence.invocation` (11) with the raw
  invoke request (9) — a 2-frame offset. A consumer that equates “invocation” with
  the `WebMCP.invokeTool` command is misled.
- Preserving positive: the row still passes because `checkCase` binds the request
  chain separately, `sent.seq(9) < commandResult.seq(10) < invoked.seq(11) <
  pre.seq(13)` (`measure-c1.mjs:219-228`), and run 29 shows `semanticMatch true`,
  `counted true`.
- Classification: output naming/observability only; **not** a false pass or a
  note/expectation contradiction. No committed consumer reads the emitted key: a
  `git grep sequence` over `e3cf4e0 -- .ufo/waves/round-22 corpus` finds it only in
  the gate source, the retained `c1-after` stdout (in
  `checks-pre-w2-0f24164.json` and the working-tree `checks-at-e3cf4e0.json`), the
  selftest dumps, and unrelated frame-number fields in `debt-expectations.json`.
- Smallest fix: one comment at `measure-c1.mjs:359-366` stating `invocation` is the
  `WebMCP.toolInvoked` event frame; alternatively rename the key to `toolInvoked`, or
  emit `invocation: sent?.seq` (9) plus a separate `invoked` field if request
  identity is intended. Behavior-neutral under every current consumer.

### F2 (documented definitional ambiguity, not a defect) — receipt `after.responses` is cumulative, not window-scoped

- Evidence: the response occurs at `at` 1792590716712 (raw:171-172) but
  `receipt.after.start` is 1792590716965 (receipt:587), yet the response is listed in
  `after.responses` (receipt:590-600). Producer `responses(through)` filters by
  `seq < through` with no time bound (`scripts/webmcp-lifecycle-round21.mjs:209,226`);
  the gate mirrors it with `beforePost` (`measure-c1.mjs:258,277`).
- Smallest counterexample: reading `after.responses` as “responses inside the
  after-action window” places this response 253 ms before that window.
- Preserving positive: expectation `post.statuses:["Completed"]`
  (`semantic-expectations.json:172`) is cumulative by design and the note itself
  downgrades the receipt row to “an index and summary, not independent corroboration”
  (note:31-33). The gate’s `after.responses` comparison is the cumulative list.
- Classification: definitional, already recorded by the w1 semantic review
  (`.ufo/waves/round-22/w1/Semantic11.md` §0 first hazard). Not a mismatch against the
  note row or the expectation.
- Smallest fix (optional): comment at
  `scripts/webmcp-lifecycle-round21.mjs:226` and `measure-c1.mjs:258` that the list is
  cumulative to the observation, not window-bounded.

### F3 (not a bug) — `sequence` is not chronological for auto-* cases

- `rows[].sequence` order is `invocation 11, preAction 13, action 14, response 12,
  release null, postAction 16`; the response sits **before** `preAction` and `action`.
  This is the autosubmit signature the note row names (“already present before the
  initial observation ends”, note:47) and the expectation encodes as
  `responseWindow:"pre-action"` (line 169), enforced at `measure-c1.mjs:304`.
- A smallest counterexample assertion `action < response` would reject the valid
  held-ground control; preserving positive: raw seq 12 < 13.
- No fix required; the key order is a role map, not a timeline.

### F4 (latent hazard, current oracle correct) — response timestamp equals the pre-action window start

- `response.at` = 1792590716712 (raw:172) equals `receipt.preAction.start` =
  1792590716712 (receipt:580), 253 ms before the pre-action observation frame
  (raw:186-187). “Pre-action” membership is enforced by frame order
  (`measure-c1.mjs:304`) plus the non-decreasing `at` invariant
  (`measure-c1.mjs:174-175`), which makes the note’s “before the initial observation
  ends” exactly what is checked.
- Counterexample: a time-window oracle with an open lower bound
  (`start < response.at`) would falsely reject this valid row; preserving positive:
  boundary-inclusive `[start, end]` accepts it.
- Classification: no current defect (the w1 semantic review already flags it). If
  hardening is wanted, a comment at `measure-c1.mjs:302-307` stating that the predicate
  is frame-order over a closed window is the smallest change; changing it to a time
  predicate must keep the lower bound inclusive or auto-positive fails.

### F5 (not a bug) — `release` absent and correctly reported

- No `dir:"release"` frame exists (frames 1-16 only), `rows[].sequence.release` is
  `null` (`measure-c1.mjs:364`), the expectation has no `delayed` key, and
  `measure-c1.mjs:341-343` would flag any release frame. Note row makes no release
  claim. Consistent.

### F6 (provenance caveat outside this row, for the integration seat)

- The retained row output I cite, `.ufo/waves/round-22/checks-at-e3cf4e0.json`, is
  **not in commit `e3cf4e0`**: `git cat-file blob
  e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` exits 128 with
  `fatal: path '.ufo/waves/round-22/checks-at-e3cf4e0.json' exists on disk, but not in
  'e3cf4e0…'`. It exists only in the working tree (disk sha `8f4679ad…a1fbe9`).
  Its `c1-after` run nonetheless reports `producerSha256` `47176aed…b0775c`, which I
  recomputed from the committed gate blob; so the row output is consistent with the
  committed gate, but it is a working-tree receipt, not a committed artifact of the
  review revision. Not a row-semantics defect.

## 6. Out of scope (noted, not claimed)

- Malicious-author authenticity: a coherently co-changed raw + receipt + re-pinned
  expectations would still pass; cryptographic self-consistency is not an outcome
  oracle (note:26-27). Nothing observed here suggests tampering; this is a limits
  statement, not an allegation.
- General browser semantics of `:tool-form-active` (submit-time `active:true` vs
  observation-time `formActive:false`) are fixture literals, not universal promises
  (note:50-51); the oracle asserts the recorded literals.
- The untracked state of the cohort receipt (F6) and any post-w2b repair are other
  seats’ scope; I only report what the trace needed.

## 7. Checks not run (honesty)

- I did **not** execute `.ufo/waves/round-22/measure-c1.mjs`, `--selftest`, or
  `run-checks.py`. The `rows[].sequence` values quoted are from the retained
  `checks-at-e3cf4e0.json` `c1-after` stdout. All expectation-vs-raw comparisons were
  re-derived independently from the commit blobs with an ad-hoc Python read-only
  script (not the gate); it confirmed every expectation field above.
- No browser, network, REA, services, installs, or delegation. No tool installs were
  performed (so no pacman/uv/npx channels were used or recorded).

## 8. Commands exercised (with exit codes)

| command | exit |
|---|---|
| `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0:corpus/evidence/round-21/runtime/auto-positive.json` (and `.html`, `receipt.json`, `corpus/evidence/round-22/semantic-expectations.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, `.ufo/waves/round-22/measure-c1.mjs`, `script…/webmcp-lifecycle-round21.mjs`) | 0 |
| `git -C … cat-file blob e3cf4e0:<path> \| sha256sum` (all committed paths in §1) | 0 |
| `git -C … cat-file blob e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` | **128** (`path … exists on disk, but not in …`) |
| `python3` inline read-only comparison of expectation fields vs raw frames and receipt | 0 (first ad-hoc draft exited 1 on a local `KeyError` because observation frames have no `method` key; corrected script rerun exit 0; no lane artifact touched) |
| `sha256sum .ufo/waves/round-22/checks-at-e3cf4e0.json` (working tree) | 0 |
| `grep`/`nl` display reads of committed blobs and the working-tree receipt | 0 |

## 9. Confidence and remaining unknowns

- Confidence: **high** for the absence of a note/expectation/raw semantic mismatch in
  this row and for the exact seq/at trace (all values read from the pinned blobs at
  `e3cf4e0`, digests matched).
- Remaining unknown: whether `sequence.invocation` was intended as the request or the
  event frame (F1) is not stated in any committed document; the key is not consumed by
  any gate, so the ambiguity is presentational. Whether the working-tree cohort
  receipt will be committed (F6) is outside this seat’s scope.
