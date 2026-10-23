# RowTrace10 — `na-invalid-submit`: raw frames ↔ `rows[].sequence` ↔ fixed expectation ↔ note row

Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (all production read with
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show <rev>:PATH`; nothing executed from the lane).
Origin: w2b item Trace10 (NOTE). Scope: one case, one row. This is a trace/consistency review,
not non-author admission.

Axes considered: **A1** raw-frame internal fidelity, **A2** expectation↔raw agreement,
**A3** gate check coverage vs. mere projection, **A4** note-row↔expectation agreement,
**A5** reproducibility of the retained `rows[].sequence`.

## 1. Raw frame trace

`corpus/evidence/round-21/runtime/na-invalid-submit.json` (sha256
`e7712c1b8568c3c814881ab89744e07eccbf48e78bde0ed84dcd05091795506f`), 16 frames.
Case `nonce=5d25defa-672e-489d-a4cc-769ad5c9dc7f`, `action=invalidRequestSubmit`, `mode=success`,
`autosubmit=false`; fixture `na-invalid-submit.html` sha256
`53058248453754b0f6742a0cb38d07e1eba571546db208de43857130245e8148`.

| role | seq | at (epoch ms) | frame |
|---|---|---|---|
| invocation command | 9 | 1792590715781 | `sent WebMCP.invokeTool` `{frameId:55003E…, toolName:lifecycle, input:{q:<nonce>}}` (raw L133-146) |
| invocation result | 10 | 1792590715781 | `result command 4` `{invocationId:"38E3FB2410D1BD2D7DEA938A1688E885"}` (raw L147-155) |
| invocation event | 11 | 1792590715781 | `event WebMCP.toolInvoked` same `invocationId`, `input:"{\"q\":\"<nonce>\"}"` (raw L156) |
| pre-action | 12 | 1792590716033 | `observation pre-action` `{nonce:<nonce>, submits:[], errors:[], url:…/na-invalid-submit, secureContext:true, formExists:true, formActive:true, value:<nonce>, focused:"go"}` (raw L168-183; duplicated at L228-242) |
| action | 13 | 1792590716033 | `action invalidRequestSubmit phase:"dispatch-started"` (raw L185-191) |
| action-complete | 14 | 1792590716035 | `action-complete invalidRequestSubmit` (raw L192-197) |
| response | 15 | 1792590716035 | `event WebMCP.toolResponded` `{invocationId:"38E3…", status:"Error", errorText:"Form validation failed: q: Please fill out this field.. "}` (raw L198-208) |
| release | — | — | **absent**: no frame with `dir:"release"` anywhere (raw file has no release marker) |
| post-action | 16 | 1792590716537 | `observation after-action` `{nonce:<nonce>, submits:[], errors:[], url:…/na-invalid-submit, formExists:true, formActive:false, value:"", focused:""}` (raw L209-224; duplicate L244-258) |

Frame invariants (statically re-derived): seqs are `1..16` contiguous; `at` is non-decreasing;
`pageObservations` equals the observation-frame projection exactly; every `at` lies inside the
receipt acquisition window `[1792590706773, 1792590718439]` (`receipt.startedAt`
`2026-10-21T13:51:46.773Z`, `finishedAt` `…58.439Z`).

The producer that emitted these frames (`scripts/webmcp-lifecycle-round21.mjs`) implements the
action as `document.querySelector('[name=q]').value=''; document.querySelector('#f').requestSubmit()`
(producer L218). With `<input name=q required>` and no `type=email` (fixture), constraint validation
blocks the `submit` event and the WebMCP layer reports the required-field diagnostic — consistent
with `submits:[]` in both observations and the fixture's submit listener never appending.

## 2. `rows[].sequence` as produced by `checkCase`

`.ufo/waves/round-22/measure-c1.mjs` L359-366 (committed digest
`47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c`, = post-crash-repair
`filesAfter.measure-c1.mjs`):

```
invocation = invoked?.seq                    -> 11   (WebMCP.toolInvoked event, L360)
preAction  = pre?.seq                        -> 12   (observation pre-action,  L361)
action     = actionFrame?.seq                -> 13   (action dispatch frame,   L362)
response   = matchingResponses[0]?.seq       -> 15   (toolResponded,           L363)
release    = frames.find(dir==='release')    -> null (no release frame,       L364)
postAction = post?.seq                       -> 16   (observation after-action,L365)
```

The projection carries **seq only** — no `at`, no action-complete, no command/result ids. It is
built from the same raw bytes the checks read (`pre`/`post` come from `raw.pageObservations`,
L183-188), so it cannot diverge from raw without diverging from the observations themselves.

Retained outputs that contain this row (read, not executed):

- `.ufo/waves/round-22/checks-at-e3cf4e0.json` `runs[29]` (`c1-after`): `value 12`, verdict
  `clean`, `findings []`; `na-invalid-submit` row = `{outcome:"Error", semanticMatch:true,
  counted:true, sequence:{11,12,13,15,null,16}, findings:[], rawDigest:e7712c…}`.
  This receipt is **untracked at the revision**: `git status --porcelain` reports
  `?? .ufo/waves/round-22/checks-at-e3cf4e0.json`.
- `.ufo/waves/round-22/checks-pre-w2-0f24164.json` `runs[29]` (`c1-after`): same row identity and
  same sequence, `semanticMatch:true`, `counted:false`; the only blocking findings are
  `semantic_error na-native-submit:post:page-errors` and
  `semantic_navigation na-native-submit:post:url` (post-crash-repair.json defects D1/D2).
- Provenance of the run itself: `run-checks.py` clones the lane at `revision` and runs gates inside
  that clone (`run-checks.py` L63, L150), so the 35/35 rows were produced by the committed e3cf4e0
  gate bytes; `runs[29].producerSha256` is `47176aed…0775c`, identical to the committed blob and to
  post-crash-repair `filesAfter.measure-c1.mjs`. The repair diff
  (`git diff 0f24164 e3cf4e0 -- measure-c1.mjs`) does not touch `checkCase` or the `sequence` object.

## 3. Expectation vs. raw (`corpus/evidence/round-22/semantic-expectations.json` L150-159)

The expectation file is pinned by `EXPECTATIONS_SHA256`
`4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (measure-c1 L22); the committed
file hashes to that value. Every expectation field against raw:

| expectation | raw | gate check |
|---|---|---|
| `responseWindow:"action-to-post"` | response seq 15, `13 < 15 < 16` | L306-307 |
| `response.status:"Error"` | frame 15 `status:"Error"` | L291 |
| `response.errorText:"Form validation failed: q: Please fill out this field.. "` (L157) | frame 15 identical string (incl. `.. ` and trailing space) | L293-297 |
| `pre.statuses:[]` / `post.statuses:["Error"]` | no response before seq 12; one before seq 16 | L257-260 |
| `pre.submitCount:0`, `post.submitCount:0` → expects `submits:[]` | `submits:[]` in both observations | L121-127 |
| `pre.formActive:true`, `post.formActive:false` | true / false | L112-114 |
| `formExists:true` both | true / true | L112-114 |
| `pre.value:"$input"`→nonce, `post.value:""` | nonce / `""` | L113 |
| `pre.focused:"go"`, `post.focused:""` | `"go"` / `""` | L114 |
| `urlPath:"/na-invalid-submit"`, `urlSearch:""`, no hash/userinfo; origin from first `Page.frameNavigated` (frame 3) | `http://127.0.0.1:43143/na-invalid-submit` | L131-141 |
| `navigation:"none"` | no post-action `Page.frameNavigated`; only initial frame 3 | L309-312 |
| no `delayed` block | no release frame | L341-342 |
| receipt `preAction` `{start:…781,end:…033,windowMs:252,responseCount:0,formActive:true}` | derived from frames 9→12; 252 ms within `[250,10000]` | L268-276 |
| receipt `after` `{start:…033,end:…537,windowMs:504}` | derived from action time→frame 16; 504 ms within `[500,10000]` | L272-276 |
| `after.responses == [frame15.params]`, `after.pageState == post.value`, `after.submits == []`, `after.navigations == []` | exact | L277-282 |
| identity: id/action/mode/autosubmit/nonce, fixture sha `530582…`, `receipt.cases[9].invocationId=38E3…`, `invokeError:null` | exact (receipt row `corpus/evidence/round-21/runtime/receipt.json` L529-570) | L160-168, L211-230 |
| invocation chain `sent 9 < result 10 < invoked 11 < pre 12`; frameId consistency | exact | L219-232 |
| observations ↔ `pageObservations` link | exact | L178-181 |
| cleanup/boundary `browserPidsBefore` non-empty, `browserPidsAfter:[]`, `contextClosed:true`, `blocked/downloads:[]` | exact | L345-349 |

No field of the fixed expectation conflicts with the raw, and no raw field named by the
expectation is missing. The row is admitted as `Error` in the action→post window with zero submit
events, i.e. exactly the required distinction.

## 4. Note row vs. expectation

`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` L46:

> `na-invalid-submit` | Error, exact required-field native-validity diagnostic; no submit event |
> initial-fill/type-refusal conflation or a successful submit

Mapping: “Error” ↔ `response.status`; “exact required-field native-validity diagnostic” ↔ the
pinned `errorText` (fixture is `required` without `type=email`, so this is the required-field
message, not the malformed-email message used by `auto-invalid`); “no submit event” ↔ both
`submitCount:0` comparisons (`submits:[]`). The reject column maps to checks that are actually
failure-capable: a pre-window response is rejected by `response-outside-action-window`
(L306-307) plus `finite-window-response-statuses` (L257-260); a Completed/dummy response is
rejected by `outcome-status` + exact-params (L291, L296-297) and by `submit-event` (L127) if a
submit is recorded; a type-refusal string is rejected by the exact-string comparison (L296-297).
The note's projection “one finite pending, five Completed, two Canceled and four Error” (L51-52)
matches `runs[29]` exactly (Pending 1, Completed 5, Canceled 2, Error 4).

Honest caveat on which code “reads” the note: the gate reads the note only for its first line
(L395-399, canonical S101 header). The case table is prose; the machine oracle is
`semantic-expectations.json` pinned by digest at L22. The note row and the pinned expectations
agree here, but a divergence between them would not be detected by the gate unless the
expectations digest were also updated.

## 5. Mismatches

**None found.** Note row, fixed expectation and raw frames agree on every recorded distinction,
and the retained row (`sequence`, `outcome`, `semanticMatch`) agrees with the raw at both
receipts. No counterexample was found that would let a coherently-mutated raw satisfy the note
row while failing the expectation or vice versa.

Static falsification candidates traced against the gate's predicates (each would be a coherent
mirror only with refreshed digests; **the unmutated raw is the preserving positive that must stay
admitted**, and it does):

| candidate mismatch | gate response (line) |
|---|---|
| `errorText` changed/removed, or status Completed+output | `outcome-status` / `exact-error-text-or-output-presence` (L291, L296-297) |
| submit record injected into either observation | `submit-event` (L127) |
| response moved before the pre observation (initial-fill/type-refusal conflation) | `finite-window-response-statuses` (L259-260) + `response-outside-action-window` (L306-307) |
| fabricated release frame | `unexpected-release-marker` (L341-342) |
| post `formActive:true` / nonempty `value` / wrong `focused` | `form-state` (L112-114) |
| post-action navigation | `unexpected-post-action-navigation` (L311-312) |
| receipt summary edited without raw (or vice versa) | `receipt-raw-summary` (L277-280) |
| frame reordered / `at` regressed or outside receipt window | `frame-sequence-or-clock` (L174-175), `frame-outside-acquisition-window` (L176-177) |

These are statically traced, not executed.

## 6. Observations (not defects; no semantic mismatch)

- **O1 — `sequence.invocation` label.** The value is 11, the `WebMCP.toolInvoked` *event*; the
  `WebMCP.invokeTool` command is 9 and the invocationId-bearing result is 10. The note never cites
  `sequence`, and no expectation validates it; the chain 9<10<11<12 is checked at L219-228/L231-232,
  so no information is lost. If a consumer is meant to read “invocation” as the command, the
  smallest fix is a rename (`toolInvoked`) or an added `invokeCommand: sent?.seq` at L360 — a
  schema-visible output change, not an evidence change. Nothing to fix for this review.
- **O2 — retention scope.** The 35/35 receipt that carries this `rows[].sequence` at e3cf4e0 is
  untracked (`?? .ufo/waves/round-22/checks-at-e3cf4e0.json`); the revision-tracked receipt for
  the same gate is `checks-pre-w2-0f24164.json`, where this row is `semanticMatch:true,
  counted:false` because the global block from `na-native-submit` findings zeroes every row
  (`evaluate` L480-484: `row.counted = !blocked && row.semanticMatch`). If the wave cites
  `rows[].sequence` “at e3cf4e0” as committed evidence, the receipt should be committed; that is
  outside this item's write scope, and it is a retention note, not a note/expectation/raw
  mismatch.
- **O3 — millisecond co-incidence.** Response seq 15 and action-complete seq 14 share
  `at=1792590716035`, so wall time cannot order them; the gate orders by seq (L306-307) and the
  note makes no claim beyond “Error … no submit event”. No mismatch.

## 7. Unrun checks (honest)

- Did **not** execute `measure-c1.mjs`, `selftest-c1.mjs`, `run-checks.py`, any lane script, or a
  browser (item is static; no tests). Row values above are read from the retained receipts named
  in §2 and derived statically from committed code.
- Did not verify author authenticity/signatures (explicitly out of scope).
- Exercised read-only commands, all exit 0: `git show` (revision/paths), `git ls-tree`,
  `git diff 0f24164 e3cf4e0 -- measure-c1.mjs`, `git status --porcelain` (read-only),
  `sha256sum` over `git show` output, and `python3` JSON field comparisons.

## 8. Tools installed/updated

None (no install needed; pacman guard untouched).
