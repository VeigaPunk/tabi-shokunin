# RowTrace09 — `na-delayed` frame sequence vs `rows[].sequence` and the knowledge note

Seat `TabiR22-2.RowTrace09-12` (leaf, static review). Revision
`e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. Author-side falsification, not non-author
admission. No lane script was executed; every outcome below is a line-exact trace plus
digest reads.

## Method and tooling

Read-only: `git show`, `sha256sum`, `grep -n`, `git status --porcelain`, and `python3`
JSON extraction over `git show` output. No installs or updates. No `lsp` device is mounted
in this seat's tool set, so the checker was traced by reading exact lines rather than by
semantic LSP queries; `grep` was used only as a literal fallback for symbol existence.
No browser, REA, delegation, seat messaging, or VCS mutation.

Pinned bytes at the review revision:

| Artifact | sha256 |
|---|---|
| `corpus/evidence/round-21/runtime/na-delayed.json` | `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2` |
| `corpus/evidence/round-21/runtime/na-delayed.html` | `adde17227bbabf98d082ee7797f0ea646dff613ba057f331ea0c204070eae279` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `.ufo/waves/round-22/measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |
| `corpus/evidence/round-22/semantic-expectations.json` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` |

The expectation's `fixtureSha256` (`semantic-expectations.json:141`) equals the computed
HTML digest; the raw's `fixture.sha256` and `raw.nonce` (`na-delayed.json:9-12`) match the
receipt row's nonce `8aab9c3a-3485-4dfd-94de-4488f908909d`.

## Axes

- **A1** raw → emitted `sequence` fidelity for the six fields (invocation, pre-action,
  action, response, release, post-action).
- **A2** emitted row / expectation → knowledge-note claim fidelity.
- **A3** row auditability: what the emitted sequence omits that `checkCase` actually reads.
- **A4** receipt binding inside the stated `git show` review boundary.

## 1. Raw frame sequence (observed, no inference)

`corpus/evidence/round-21/runtime/na-delayed.json` at the revision; `frames[]` is
contiguous `seq` 1..18 with non-decreasing `at`. The invocation is a three-frame chain,
not one frame.

| Frame | Raw lines | seq | at | Recorded content |
|---|---|---|---|---|
| sent `WebMCP.invokeTool` (command 4) | 133–146 | 9 | 1792590714595 | `frameId=B8AF…0731`, `toolName:"lifecycle"`, `input:{q:nonce}` |
| result command 4 | 147–155 | 10 | 1792590714595 | `{invocationId:"6E3D45F0282C001E2A5FCCAB4DF99082"}` |
| event `WebMCP.toolInvoked` | 156–167 | 11 | 1792590714595 | same invocationId, `input` as JSON string, `toolName:"lifecycle"` |
| observation `pre-action` | 168–183 | 12 | 1792590714847 | `formActive:true`, `submits:[]`, `errors:[]`, `value/focused` |
| action `requestSubmit` | 185–190 | 13 | 1792590714847 | `phase:"dispatch-started"` |
| action-complete | 192–196 | 14 | 1792590714848 | `action:"requestSubmit"` |
| observation `delayed-before-release` | 198–221 | 15 | 1792590715100 | `formActive:true`, one submit record (`agentInvoked:true`, `respondWith:"function"`, `active:true`) |
| `release` | 223–226 | 16 | 1792590715100 | empty payload |
| event `WebMCP.toolResponded` | 228–241 | 17 | 1792590715100 | `status:"Completed"`, output `{ok:true, nonce, q}` |
| observation `after-action` | 243–266 | 18 | 1792590715602 | `formActive:false`, same single submit record |

Derived timing: hold `15.at − 14.at = 252 ms`; `15.at == 16.at == 17.at = 1792590715100`
(equal-millisecond tie); `18.at − 17.at = 502 ms`. The mirror
`pageObservations[*]` (`na-delayed.json:270-312`) repeats seq/at 12/15/18 and deep-equal
values, which `measure-c1.mjs:178-181` requires.

Receipt envelope: `receipt.json.startedAt = 2026-10-21T13:51:46.773Z` (1792590706773),
`finishedAt = 2026-10-21T13:51:58.439Z` (1792590718439); all 18 frames fall inside, so
`measure-c1.mjs:176-177` adds no `evidence_binding` finding for this row.

## 2. What `checkCase` reads into `rows[].sequence`

Mapping at `measure-c1.mjs:359-366`:

| Emitted field | Source expression | Raw frame used | Value |
|---|---|---|---|
| `invocation` | `invoked?.seq` (`:203,:210`) | `WebMCP.toolInvoked` **event**, seq 11 | 11 |
| `preAction` | `pre?.seq` (`:184-188`) | `pre-action` observation, seq 12 | 12 |
| `action` | `actionFrame?.seq` (`:192-194`) | `action` frame, seq 13 | 13 |
| `response` | `matchingResponses[0]?.seq` (`:254-255`) | `toolResponded`, seq 17 | 17 |
| `release` | first `dir === 'release'` (`:364`) | release, seq 16 | 16 |
| `postAction` | `post?.seq` (`:185`) | `after-action` observation, seq 18 | 18 |

No `at` value is emitted. The row therefore shows response `17` after release `16` (the
delayed distinction) but not the `delayed-before-release` marker at 15 nor the 252 ms hold.

Emitted rows recorded in three receipts (all identical for these six fields):

- committed `.ufo/waves/round-22/checks-pre-w2-0f24164.json` (sha `c9960476…`, revision
  0f24164, measurement of 0f24164): `{"invocation":11,"preAction":12,"action":13,
  "response":17,"release":16,"postAction":18}`, `semanticMatch:true`, `counted:false`
  (global blocking at `measure-c1.mjs:480-485` from the na-native-submit findings).
- worktree `.ufo/waves/round-22/checks-at-e3cf4e0.json` (revision e3cf4e0, on-disk only —
  see F4): same six values, `semanticMatch:true`, `counted:true`, measurement
  `value:12`, `verdict:"clean"`, `exit:0`.
- `selftest-repair-sandbox.json` positive and `selftest-pre-repair-0f24164.json`
  positive: same six values (`counted:true` / `false` respectively).

For na-delayed every emitted value equals the raw seq of the frame the code names; there
is no drift between raw and `rows[].sequence`.

## 3. Knowledge note and expectation vs raw

Note row `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:45`:

> `na-delayed` | active intermediate state before release; Completed with dummy object only
> after release marker | response before release, absent intermediate observation or
> generic eventual-settlement claim

| Note/reject clause | Raw evidence | Checker predicate | Match |
|---|---|---|---|
| active intermediate state before release | seq 15 `formActive:true`, seq 15 < seq 16 | `:334` and `:336` (`formActiveBeforeRelease`) | yes |
| Completed with dummy object | seq 17 `status:"Completed"`, `{ok:true,nonce,q}` | `:289-299` exact params | yes |
| only after release marker | seq 17 > seq 16 | `:337-338` | yes |
| reject response before release | none exists | `:337-338` | yes |
| reject absent intermediate observation | exactly one at seq 15 | `:189-190`, `:328-340` | yes |
| reject generic eventual settlement | exact object output | `:292-299` | yes |

Expectation row `semantic-expectations.json:136-147`: `responseWindow:"action-to-post"`
(response 17 is `>13` and `<18`, `:306-307`), `pre/post` page states match seq 12/18,
`navigation:"none"` (the only navigation is seq 3, before `after.start` 1792590714847,
`:309-312`), `delayed.minMs:250 / maxMs:10000` against the observed 252 ms (`:335-336`).
All pass; no note/expectation/raw contradiction for the recorded outcome.

## 4. Findings

### F1 (INFO, projection label) — `sequence.invocation` is the `toolInvoked` event (11), not the `invokeTool` frame (9/10)

`measure-c1.mjs:203,210,360`; raw `na-delayed.json:133-167`. The raw invocation is a
three-frame chain (sent 9 → result 10 → event 11) while the row collapses it to 11.
Smallest counterexample: a consumer citing `rows[].sequence.invocation` as "the
`WebMCP.invokeTool` frame" is off by two frames (raw line 133 vs 156); no oracle outcome
changes. Preserving positive: the full chain order `9 < 10 < 11 < 12` is independently
enforced at `measure-c1.mjs:219-228`, so the correlation itself is checked; the retained
row passes. Smallest fix: rename the field to `toolInvoked`, or emit
`invokeSent`/`invokeResult` alongside it.

### F2 (LOW, row auditability) — the row omits the delayed marker seq and every `at`, though `checkCase` reads both

`measure-c1.mjs:330-336` reads `delayed.seq` and computes `delayed.at - completeFrame.at`;
`:359-366` emits neither. Note:45 binds the case to the intermediate observation and
`semantic-expectations.json:147` bounds the hold, so the emitted row cannot show the
distinction's timing. Smallest counterexample (coherent mutation): retime seq 15/16/17 to
`1792590717000` and after-action to `1792590717500` in the raw and mirror, set receipt
`after.end/windowMs` to `1792590717500/2653`, update the raw→receipt→execution digest
links; the hold becomes 2152 ms, every predicate still passes (`2152 ≤ 10000`, seq order
unchanged, response still inside `action-to-post`), and the emitted row is identical
`{11,12,13,17,16,18}` — the row cannot distinguish a 252 ms hold from a 2152 ms one.
Preserving positive: the retained 252 ms row is green; a 1 ms hold
(`seq15.at = 1792590714849`) is red with `semantic_delayed` (`:335`). Smallest fix: add
`delayedMarker` (the `delayed-before-release` seq) and `holdMs` to the sequence object; the
metric and counted value do not change.

### F3 (LOW, inert contract) — `delayed.responseBeforeRelease` is never read

`semantic-expectations.json:147` declares `"responseBeforeRelease": false`, but
`measure-c1.mjs` contains no read of it: the after-release predicate is hardcoded at
`:337-338`, and `expectationShape` (`:97-100`) only requires `delayed` to be a plain
object. Smallest counterexample: coherently set the field to `true` and re-pin
`EXPECTATIONS_SHA256` (`measure-c1.mjs:22`); the gate still reports `value:12`,
`verdict:"clean"`, `exit:0`, so the expectation can declare the opposite of the enforced
behavior with no red. Preserving positive: flipping `formActiveBeforeRelease` to `false`
with the same re-pin yields `semantic_delayed` and `value:0` (`:336`), proving the
neighbouring delayed fields do bind. Smallest fix: delete the field, or enforce it as
`matchingResponses.some((f) => f.seq <= release.seq) === !expected.delayed.responseBeforeRelease`
at `:337`. This is the same defect as W1 `AttackDelayed.md:125` (G6) — its cited lines
321–333 predate the post-crash repair; at e3cf4e0 the delayed block is 328–343 — and the
repair (`post-crash-repair.json` defects D1–D3) did not address it.

### F4 (BOUNDARY, receipt not bound to the revision) — the 35/35 receipt cited for this revision is untracked

`git show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:.ufo/waves/round-22/checks-at-e3cf4e0.json`
exits 128 (`fatal: path '.ufo/waves/round-22/checks-at-e3cf4e0.json' exists on disk, but
not in 'e3cf4e0…'`); `git status --porcelain` reports `?? .ufo/waves/round-22/checks-at-e3cf4e0.json`.
So the `35/35` receipt attached to e3cf4e0 is worktree-only and outside the stated
`git show` boundary. The committed receipt `checks-pre-w2-0f24164.json` (sha
`c996047688972def738dd84cd6656b0378144b1bebd542e69d143d22ceb585a0`) measures 0f24164 with
`verdict:"failed"`, 33/35, and carries the identical na-delayed row (`semanticMatch:true`,
`counted:false` from global blocking). The na-delayed sequence values agree in both, so
this is not a na-delayed semantic defect; it means the 35/35 claim needs the receipt
committed (or cited as an untracked worktree artifact) before it is reviewable at the
stated boundary. Smallest fix: commit `checks-at-e3cf4e0.json` with its `revision` field,
as was done for `checks-pre-w2-0f24164.json`.

## 5. Residual gaps (pre-existing, not new to this seat)

- **Delayed submit record unvalidated.** `measure-c1.mjs:328-343` reads `formActive`,
  `nonce`, `value`, `url`, `errors` on the delayed observation but not `submits`,
  `respondWith`, or `agentInvoked`. Note:45 says "active intermediate state", and
  `formActive` is checked, so this is an implication gap rather than a note contradiction.
  Reported as G1 in W1 `AttackDelayed.md:120`; unchanged at e3cf4e0.
- **Hold margin.** 252 ms against `minMs:250`; the producer sleeps exactly 250 ms
  (`scripts/webmcp-lifecycle-round21.mjs:223`), so the bound re-asserts the producer's own
  wait. Valid for frozen bytes only; the note already requires reviewed expectations for a
  different acquisition (`webmcp-lifecycle-oracle-round-22.md:3`). Same as W1 G7.
- **Equal-millisecond tie.** Frames 15/16/17 share `at 1792590715100`; ordering is
  seq-only (`measure-c1.mjs:334,337`). That is correct for the retained bytes — an
  `at`-strict rule would false-fail this row — and the note's "after release marker" is
  marker-based, so it is compliant.

## 6. Commands exercised

| Command | Exit | Result |
|---|---|---|
| `git show e3cf4e0:corpus/evidence/round-21/runtime/na-delayed.json \| sha256sum` | 0 | `146adde4…b2344f2` |
| `git show e3cf4e0:corpus/evidence/round-21/runtime/na-delayed.html \| sha256sum` | 0 | `adde1722…0eae279` |
| `git show e3cf4e0:corpus/evidence/round-21/runtime/receipt.json \| sha256sum` | 0 | `4bc79636…f937034` |
| `git show e3cf4e0:.ufo/waves/round-22/measure-c1.mjs \| sha256sum` | 0 | `47176aed…b0775c` |
| `git show e3cf4e0:corpus/evidence/round-22/semantic-expectations.json \| sha256sum` | 0 | `4a693dce…5b60e1e` |
| `git show e3cf4e0:.ufo/waves/round-22/checks-pre-w2-0f24164.json \| sha256sum` | 0 | `c9960476…ceb585a0`, equal to worktree |
| `git show e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` | 128 | path exists on disk but not in revision |
| `git status --porcelain -- .ufo/waves/round-22` | 0 | `?? …/checks-at-e3cf4e0.json` plus `??` w2b artifacts |
| `python3` JSON extraction of `frames`, `pageObservations`, receipt row, checker rows | 0 | values in §1–§3 |
| `grep -n` for `responseBeforeRelease`, `delayed`, `sequence` | 0 | single expectation occurrence at `:147`; no checker occurrence |

Unrun: `measure-c1.mjs`, `measure-c1.mjs --selftest`, `run-checks.py`, the producer, and
any browser/CDP acquisition. The recorded `rows[].sequence` values quoted in §2 are read
from the cited receipts, not re-executed.

## Verdict

No contradiction between the note row, the fixed expectation, and the raw na-delayed
frames at `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. The six emitted sequence values
(`11,12,13,17,16,18`) are exactly the raw seqs of the frames `checkCase` consumes. Three
LOW projection/contract mismatches remain (F1 label, F2 omitted `at`/marker, F3 inert
expectation field) and one review-boundary defect (F4 untracked 35/35 receipt); none
changes `c1_semantically_checked_lifecycle_rows` for this row.
