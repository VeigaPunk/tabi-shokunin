# RowTrace08 — `na-throw` frame trace vs note, expectation and gate (round22 W2b)

Seat: `TabiR22-2.RowTrace08-12` (scout, leaf). Item: trace raw frames of `na-throw`
at `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`; compare with `measure-c1.mjs`
`checkCase` (`rows[].sequence`) and the knowledge-note row; report mismatches.

Revision under review: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (`git rev-parse HEAD`
exit 0; lane worktree unchanged by this seat; only this report was written).
Static review only: no lane script (`measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py`),
no browser, no REA, no installs, no lane/fleet VCS mutation.

Method / LSP note: no `lsp` device is mounted in this seat's tool inventory, and the
evidence is JSON/HTML with no language server, so no `definition`/`references`/`hover`
result was available for any file. All statements below are literal Git-blob reads plus
exact JSON equality/ordering computations; none is a grep-derived semantic proof.
`[OBSERVED]` = read from the cited blob; `[INFERENCE]` = code-reading consequence that
was not executed; `[UNRUN]` = check not performed.

## 1. Verdict

**No mismatch found** among the knowledge-note row, the fixed expectation, and the raw
retained frames for `na-throw`. Status, the exact 139-character diagnostic, absence of
an `output` key, the page-side error, form state, the two window summaries, the
invocation identity and both digests agree across all three artifacts. `rows[].sequence`
reproduces the raw frame positions exactly.

Two non-mismatch residuals are recorded in §6: the `sequence.invocation` field names the
`WebMCP.toolInvoked` event (seq 11), not the `WebMCP.invokeTool` request (seq 9); and the
unified `action-to-post` window is deliberately looser than the na-throw ordering claim in
the W1 report `.ufo/waves/round-22/w1/Raw08.md:209-210`.

## 2. Observed raw trace — `corpus/evidence/round-21/runtime/na-throw.json`

Blob `sha256 e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a` (matches
receipt `cases[na-throw].evidence.sha256`, `receipt.json:403-445`). Fixture blob
`na-throw.html` `sha256 579ab87b…539e` (matches `fixture.sha256` and
`semantic-expectations.json:128`).

`at` is epoch ms; UTC is 2026-10-21. Frames are `seq 1..16` contiguous and `at` is
non-decreasing; all frames fall inside the receipt window
`[1792590706773, 1792590718439]` (`receipt.json` `startedAt` `2026-10-21T13:51:46.773Z`,
`finishedAt` `…13:51:58.439Z`).

| seq | at | UTC | dir / kind | detail | raw line |
|---|---|---|---|---|---|
| 1 | 1792590713648 | 13:51:53.648 | sent | `Page.enable` | 14 |
| 2 | 1792590713648 | .648 | result | command 1 | 22 |
| 3 | 1792590713653 | .653 | event | initial `Page.frameNavigated` → `http://127.0.0.1:43143/na-throw` | 29 |
| 4 | 1792590713662 | .662 | sent | `WebMCP.enable` | 55 |
| 5 | 1792590713663 | .663 | event | `WebMCP.toolsAdded` (`lifecycle`, frame `F997…`) | 63 |
| 6 | 1792590713664 | .664 | result | command 2 | 91 |
| 7 | 1792590713664 | .664 | sent | `Page.getFrameTree` | 98 |
| 8 | 1792590713664 | .664 | result | frame tree, same frame id/url | 106 |
| **9** | **1792590713664** | **.664** | **sent** | **`WebMCP.invokeTool`** command 4, `{frameId:F997…, toolName:"lifecycle", input:{q:<nonce>}}` | **133** |
| **10** | **1792590713664** | **.664** | **result** | **command 4 → `{invocationId:"3CE04A035739A78B887F37C518AD62A9"}`** | **147** |
| **11** | **1792590713664** | **.664** | **event** | **`WebMCP.toolInvoked`, same tool/frame/invocation, `input` JSON = sent input** | **156** |
| **12** | **1792590713917** | **13:51:53.917** | **observation** | **`pre-action`** (nonce value, no submits, no errors, `formActive:true`, `focused:"go"`) | **168** |
| **13** | **1792590713917** | **.917** | **action** | **`requestSubmit`, `phase:"dispatch-started"`** | **185** |
| **14** | **1792590713918** | **.918** | **action-complete** | **`requestSubmit`** | **192** |
| **15** | **1792590713918** | **.918** | **event** | **`WebMCP.toolResponded` `{invocationId, status:"Error", errorText:<139 chars>}`, no `output` key** | **198** |
| **16** | **1792590714419** | **13:51:54.419** | **observation** | **`after-action`** (one submit record, one page error, `formActive:false`) | **209** |
| — | — | — | **release** | **no release frame exists** (0 frames with `dir:"release"`) | — |

`pageObservations` are exact projections of seq 12/16 (`na-throw.json:236-256`; first entry seq at line 240, second at line 256):
`{label, at, seq, value}` deep-equals the corresponding observation frames
`[OBSERVED, programmatic equality]`.

Identity facts: nonce `085b6a21-656a-452a-9a0d-83271e42bc29`; `autosubmit:false`;
`action:"requestSubmit"`; `mode:"throw"`; one `WebMCP.invokeTool`, one `toolInvoked`, one
`toolResponded`, one `action`, one `action-complete`, zero `release` frames.

Fixture semantics (`na-throw.html`): the single `submit` listener pushes the record, calls
`e.preventDefault()`, then `if(mode==='throw') throw Error('dummy submit handler throw')`,
so `respondWith` is never called on this path. The retained CDP error text is the Blink
programming-error literal; the concatenated S100 literal at
`.ufo/waves/round-21/sources/html_form_element.cc:807-813` is byte-identical to it
(`[OBSERVED]`; branch `else if (!should_submit)` calls `CallDoneCallback(... ScriptToolError(
kToolInvocationFailed, "The site has a programming error: it called preventDefault() "
"on the 'submit' event, without also calling respondWith() with the tool result"))`).

## 3. Receipt window correlation — `corpus/evidence/round-21/runtime/receipt.json:403-445`

| Field | Value | Raw anchor |
|---|---|---|
| `preAction.start` | 1792590713664 | seq 9 `at` (invocation sent) |
| `preAction.end` | 1792590713917 | seq 12 `at` (pre observation) |
| `preAction.windowMs` | 253 (= end−start; expectation min 250) | 12−9 = 253 ms |
| `preAction.responseCount` | 0 | responses with seq < 12: none |
| `preAction.formActive` | true | seq 12 `value.formActive` |
| `after.start` | 1792590713917 | seq 13 `at` (dispatch start) |
| `after.end` | 1792590714419 | seq 16 `at` (post observation) |
| `after.windowMs` | 502 (= end−start; expectation min 500) | 16−12 = 502 ms |
| `after.responses` | `[{invocationId, status:"Error", errorText}]` | deep-equals seq 15 `params` |
| `after.submits` | one record `{agentInvoked:true, isTrusted:true, q:<nonce>, active:true, respondWith:"function"}` | deep-equals seq 16 `value.submits` |
| `after.navigations` | `[]` | no `Page.frameNavigated` in `[after.start, post.seq)`; only seq 3 initial load |
| `after.pageState` | deep-equals seq 16 `value` | exact |

## 4. What `checkCase` reads — `.ufo/waves/round-22/measure-c1.mjs`

Retained `rows[]` output for `na-throw` at this revision
(not re-run by this seat; read from two retained receipts):

```json
{"id":"na-throw","outcome":"Error","semanticMatch":true,"counted":true,
 "sequence":{"invocation":11,"preAction":12,"action":13,"response":15,
             "release":null,"postAction":16},
 "findings":[],"rawDigest":"e46d751e…d1a"}
```

Sources: tracked `.ufo/waves/round-22/selftest-repair-sandbox.json` `reports[0]`
(`positive`, `pass:true`, exit 0, value 12, 44/44 clean) and untracked (not in the
reviewed tree) `.ufo/waves/round-22/checks-at-e3cf4e0.json` `runs[29]`
(`argv [node, .ufo/waves/round-22/measure-c1.mjs, e3cf4e0…]`, `pass:true`, exit 0,
value 12, `findings:[]`; `runs[28]` at baseline `5f585773…` = value 0, `baseline`).

Construction and the constraints that pin each field (line numbers in
`measure-c1.mjs`):

| `sequence` key | Expression (mjs:359-365) | Raw value | Binding checks |
|---|---|---|---|
| `invocation` | `invoked?.seq` (first `WebMCP.toolInvoked`) | 11 | one sent invokeTool/result/invoked; `sent.seq < result.seq < invoked.seq < pre.seq` (mjs:219-228); receipt id cross-link (mjs:229-230) |
| `preAction` | `pre?.seq` (first `pageObservations` `pre-action`) | 12 | exactly one pre/one post/zero-or-one delayed marker (mjs:189-190); observation-frame deep link (mjs:246-250); page state (mjs:107-146, called at 251-252) |
| `action` | `actionFrame?.seq` (first `dir:"action"`) | 13 | exactly one action/one complete, same `action`, phase `dispatch-started` (mjs:192-198); `pre.seq < action.seq < complete.seq < post.seq` (mjs:199-200) |
| `response` | `matchingResponses[0]?.seq` | 15 | response count 1 (mjs:285-290); status/text exact (mjs:291-298); window `action-to-post`: `action.seq < response.seq < post.seq` (mjs:306-307); receipt summary equality (mjs:268-280) |
| `release` | `frames.find(dir:"release")?.seq` | null | na-throw is non-delayed, so any release frame is a finding (mjs:328-342, esp. 341-342) |
| `postAction` | `post?.seq` (first `after-action`) | 16 | same observation checks as pre; post expectation at `semantic-expectations.json:132` |

The retained `sequence` equals the raw frame numbers above exactly; no field is shifted.
`sequence` carries **no `at` values** — the timestamps in §2/§3 come from the raw file and
the receipt, not from `rows[]`.

## 5. Note row vs expectation vs raw — `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:44`

Note row (verbatim): `| na-throw | Error, programming-error diagnostic naming
preventDefault without respondWith | treating a different handler ordering or ordinary
promise rejection as this case |`. The note defers exact strings to the fixed expectations
(note:50: "Exact diagnostic strings and structural contracts are in the fixed
expectations…").

| Claim | Note (line 44) | Expectation (`semantic-expectations.json:123-133`) | Raw (`na-throw.json`) | Agree? |
|---|---|---|---|---|
| Outcome | `Error` | `response.status:"Error"` (line 130) | seq 15 `status:"Error"` (lines 197-207; status line 204) | yes |
| Tool diagnostic | programming-error naming `preventDefault` without `respondWith` | exact 139-char string (line 130) | exact same 139-char string; `params` keys exactly `invocationId,status,errorText`; no `output` | yes |
| Distinguish from page throw | reject "different handler ordering" | fixture pinned by `sha256` (line 128); `measure-c1.mjs:161-168` requires `raw.fixture.sha256 === sha256(fixtureBytes) === expected.fixtureSha256`, so a reordered handler with a re-hashed fixture fails `evidence_binding` unless the pin is re-authored | page `errors:["Uncaught Error: dummy submit handler throw"]` (lines 224-226) kept separate from `errorText` | yes |
| Distinguish from promise rejection | reject "ordinary promise rejection" | na-throw text ≠ na-reject text (`semantic-expectations.json:110` block) | seq 15 text ≠ na-reject's `respondWith promise was rejected` | yes |
| Page state post | not stated | `formActive:false`, `formExists:true`, one submit, value `$input`, focus `go` (line 132) | seq 16 matches exactly (lines 208-234) | yes |
| Windows | not stated for this row; contract deferred to expectations (note:50) | pre ≥250 ms, post ≥500 ms (lines 131-132) | 253 ms / 502 ms; sums and anchors match receipt | yes |
| Navigation | not stated for this row | `"none"` (line 133) | only initial nav seq 3, before invocation | yes |
| Delayed/release | release only on `na-delayed` (note:45) | no `delayed` key for na-throw | zero release frames | yes |
| Identity | "invocation-correlated ordered frames" (note:31-33) | `action`, `mode:"throw"`, `autosubmit:false`, fixture sha (lines 124-128) | identical; `sent(9) < result(10) < invoked(11) < pre(12) < action(13) < complete(14) < response(15) < post(16)` | yes |

Failure-capability spot check (static, not executed) — the nearest wrong variants are
refused, with a preserving positive in the retained population:

- Counterexample A: replace seq 15 `params.errorText` with the page text
  `Uncaught Error: dummy submit handler throw` while keeping `status:"Error"`. At
  `measure-c1.mjs:294-297` `expectedParams.errorText` is the pinned literal and the
  branch takes `semantic_error` (`exact-error-text-or-output-presence`), so the row is not
  counted. Preserving positive: `na-reject` legitimately carries
  `respondWith promise was rejected` (`semantic-expectations.json:110`) and is counted.
- Counterexample B: replace seq 15 `params.errorText` with the na-reject text. Same exact
  equality failure at `measure-c1.mjs:297`; `na-reject` again preserves the other literal.
- Counterexample C: add an `output` object beside `status:"Error"`. `equal(response.params,
  expectedParams)` fails at `measure-c1.mjs:294-297`; a success payload cannot ride an
  Error status.
- Counterexample D: drop `errorText`. Same failure at `measure-c1.mjs:294-297`; the
  retained mutant `missing-error-text-na-throw` in
  `selftest-repair-sandbox.json` reports exactly `semantic_error` (line
  `na-throw:exact-error-text-or-output-presence`).

No fix is implied by §5: note, expectation and raw agree.

## 6. Residual observations (explicitly **not** note/expectation/raw mismatches)

**R1 — `sequence.invocation` is the event, not the request.** `measure-c1.mjs:360` sets
`invocation: invoked?.seq`, i.e. the `WebMCP.toolInvoked` event at seq 11; the
`WebMCP.invokeTool` request is seq 9 (`na-throw.json:133`). The field is diagnostic-only
(it counts nothing), so there is no metric effect, but a reader comparing "invocation" to
the sent frame sees a 2-frame offset. Smallest clarification (not a behavioral fix): label
the field `invokedEvent` or add the sent/result seqs. No change requested for this item.

**R2 — `sequence` has no timestamps.** Only seq numbers are emitted
(`measure-c1.mjs:359-365`); the `at` trace above cannot be cross-checked from `rows[]`
alone. Not a defect against any stated contract.

**R3 — the unified `action-to-post` window is looser than the W1 na-throw ordering claim.**
`measure-c1.mjs:306-307` requires only `action.seq < response.seq < post.seq`. The W1
independent specification `.ufo/waves/round-22/w1/Raw08.md:209-210` says for na-throw that
"`responded.seq` lies inside `(complete.seq, post.seq)`". The retained raw satisfies the
stricter order (`complete 14 < response 15`), but `measure-c1` does not require it.
This is not a note/expectation/raw mismatch: note:44 states no ordering, and
`semantic-expectations.json:129` pins `responseWindow:"action-to-post"` literally.
It also cannot be tightened uniformly: the retained `na-click` raw has
`response seq 14 < action-complete seq 15` (`corpus/evidence/round-21/runtime/na-click.json:192-209`;
`semantic-expectations.json:45`), so a global "response after completion" rule would fail a
legitimate retained positive. `[INFERENCE, unexecuted]` A na-throw-scoped coherent
mutation — move seq 15 to seq 14 (`at 1792590713917`), move action-complete to seq 15
(`at 1792590713918`), re-project `pageObservations`, re-sync `after.responses` and reseal
both digests — would still satisfy every na-throw check listed in §4: the only response-vs-action
ordering constraints are mjs:199-200 (pre<action<complete<post) and mjs:306-307
(action<response<post), while frame contiguity/clock monotonicity and receipt-window
containment (mjs:173-177, 268-275) remain satisfied by the chosen `at` values. If the wave wants Raw08's stricter na-throw claim, the smallest fix
is a per-case expectation flag consumed at mjs:306 (`responseAfterActionComplete`) plus one
selftest mutant; otherwise the current breadth is documented behavior, not a bug.

## 7. Commands exercised

| Command (lane root) | Exit | Result used |
|---|---|---|
| `git rev-parse HEAD` | 0 | `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` |
| `git show REV:corpus/evidence/round-21/runtime/na-throw.json` | 0 | §2 trace, parameters, counts |
| `git show REV:corpus/evidence/round-21/runtime/na-throw.html` | 0 | fixture semantics (`preventDefault` then throw) |
| `git show REV:corpus/evidence/round-21/runtime/receipt.json` | 0 | §3 windows, response/submit/pageState equality |
| `git show REV:corpus/evidence/round-22/semantic-expectations.json` | 0 | §5 expectations |
| `git show REV:.ufo/waves/round-22/measure-c1.mjs` | 0 | §4 constraint line numbers |
| `git show REV:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | 0 | note row and deferral line |
| `git show REV:.ufo/waves/round-22/selftest-repair-sandbox.json` | 0 | tracked positive `rows[]` for na-throw |
| `git show REV:.ufo/waves/round-22/w1/Raw08.md` | 0 | stricter W1 ordering claim (R3) |
| `git show REV:.ufo/waves/round-21/sources/html_form_element.cc` | 0 | diagnostic literal/source branch |
| `git show REV:<na-throw.json>` piped to `sha256sum` (na-throw.json, na-throw.html) | 0 | `e46d751e…d1a`, `579ab87b…539e` — match receipt/expectation |
| `sha256sum .ufo/waves/round-22/measure-c1.mjs` vs committed blob | 0 | both `47176aed…775c`; working copy is the committed gate |
| `python3` JSON equality/ordering analysis (stdin scripts) | 0 | equality tables in §2-§5; one earlier run of the same analysis exited 1 on a bug in my own lambda helper and was corrected, no lane file touched |
| `git status --porcelain` (lane) | 0 | no lane modification by this seat |

Tool installs/upgrades: none (nothing was required).

## 8. Not run / limits

- `[UNRUN]` `.ufo/waves/round-22/measure-c1.mjs` and `--selftest` were **not executed** by
  this seat; §4 cites retained outputs only (`selftest-repair-sandbox.json` tracked;
  `checks-at-e3cf4e0.json` untracked and produced at 13:39 local). The `rows[].sequence`
  claim is therefore "retained output matches raw", not "I re-ran the gate".
- `[UNRUN]` No browser, no re-acquisition, no independent producer run; the raw is
  producer-mediated historical evidence, not a publisher or served-wire proof.
- `[UNRUN]` No non-author authenticity check, no other build/locale, no continuous page
  state (only the two observation markers), no fault injection or PID-reuse proof.
- `[INFERENCE]` items are marked in place (R3 counterexample, source-branch reading).
- No `lsp` results: no language server was mounted for JSON/HTML or the lane JS gate; the
  trace rests on exact blob bytes and exact-value comparisons.
