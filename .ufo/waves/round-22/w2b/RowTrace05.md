# RowTrace05 — `na-reset` raw frame trace vs `rows[].sequence` vs oracle note

Boundary: committed revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane HEAD), read with
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show REV:PATH`. Static review only; no lane
script, browser, service, or VCS write was performed. All line numbers below are for that revision.

## Observed trace

Source: `corpus/evidence/round-21/runtime/na-reset.json` (sha256 `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4`,
identical to `receipt.json:293` and `.ufo/waves/round-21/runtime-execution-finalized.json` artifacts entry).
Clock base: `receipt.json:3` `startedAt=2026-10-21T13:51:46.773Z` (epoch ms 1792590706773), `finishedAt=2026-10-21T13:51:58.439Z`.

| seq | `at` (epoch ms) | UTC | frame | salient |
|---|---|---|---|---|
| 1 | 1792590710849 | 13:51:50.849 | sent, cmd 1 `Page.enable` | (na-reset.json:24-30) |
| 2 | 1792590710849 | 13:51:50.849 | result, cmd 1 | |
| 3 | 1792590710854 | 13:51:50.854 | event `Page.frameNavigated` | url `http://127.0.0.1:43143/na-reset`, frameId `1C4D44941BDA8A86E77A69CE02D4A325` (na-reset.json:33-63) |
| 4 | 1792590710861 | 13:51:50.861 | sent, cmd 2 `WebMCP.enable` | |
| 5 | 1792590710863 | 13:51:50.863 | event `WebMCP.toolsAdded` | tool `lifecycle`, same frameId (na-reset.json:73-102) |
| 6 | 1792590710863 | 13:51:50.863 | result, cmd 2 | |
| 7 | 1792590710863 | 13:51:50.863 | sent, cmd 3 `Page.getFrameTree` | |
| 8 | 1792590710864 | 13:51:50.864 | result, cmd 3 | `frameTree.frame.id` = `1C4D…A325` |
| 9 | 1792590710864 | 13:51:50.864 | sent, cmd 4 `WebMCP.invokeTool` | frameId `1C4D…A325`, toolName `lifecycle`, input `{q: nonce}` (na-reset.json:132-145) |
| 10 | 1792590710864 | 13:51:50.864 | result, cmd 4 | `invocationId=B8BA3C97850919D25D5C04338D497F26` (na-reset.json:146-154) |
| 11 | 1792590710864 | 13:51:50.864 | event `WebMCP.toolInvoked` | same invocationId, `input` JSON string (na-reset.json:155-166) |
| 12 | 1792590711116 | 13:51:51.116 | observation `pre-action` | `formActive:true`, `value:nonce`, `submits:[]`, `errors:[]`, `focused:"go"`, url `/na-reset` (na-reset.json:167-183) |
| 13 | 1792590711116 | 13:51:51.116 | action `reset`, `phase:"dispatch-started"` | na-reset.json:184-190 |
| 14 | 1792590711117 | 13:51:51.117 | action-complete `reset` | na-reset.json:191-196 |
| 15 | 1792590711117 | 13:51:51.117 | event `WebMCP.toolResponded` | `status:"Canceled"`, `errorText:"Tool execution cancelled by a form reset"` (na-reset.json:197-207) |
| 16 | 1792590711619 | 13:51:51.619 | observation `after-action` | `formActive:false`, `value:""`, `submits:[]`, `errors:[]`, same url (na-reset.json:208-224) |

No `dir:"release"` frame exists in the case. `pageObservations` (na-reset.json:226-259) is byte-for-byte
the projection of frames 12 and 16 (`{label,at,seq,value}`), which is exactly what the oracle re-derives.

## What `checkCase` reads (`rows[].sequence`)

`.ufo/waves/round-22/measure-c1.mjs:359-366` emits:

| field | expression | na-reset value | raw frame it points at |
|---|---|---|---|
| `invocation` | `invoked?.seq` (the `WebMCP.toolInvoked` **event**) | 11 | frame 11 (event), not frame 9/10 (request/result) |
| `preAction` | `pre?.seq` | 12 | frame 12 |
| `action` | `actionFrame?.seq` | 13 | frame 13 (`dispatch-started`); frame 14 `action-complete` is not surfaced |
| `response` | `matchingResponses[0]?.seq` | 15 | frame 15 |
| `release` | first `dir:"release"` | null | none |
| `postAction` | `post?.seq` | 16 | frame 16 |

Measured row, identical in both retained receipts:
`.ufo/waves/round-22/checks-pre-w2-0f24164.json:869-884` (committed; `semanticMatch:true`,
`counted:false` only because the global `na-native-submit:post:*` findings block all rows) and
`.ufo/waves/round-22/checks-at-e3cf4e0.json` run `c1-after` (working-tree file; see F3) where the row is
`counted:true` and the run reports `value 12, verdict clean, exit 0, findings []`.
`rawDigest` `097b8833…` matches the committed raw blob.

## Note vs expectation vs raw

- Note row, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:41`:
  “Canceled, exactly “Tool execution cancelled by a form reset””. Raw frame 15: status `Canceled`,
  errorText exactly `Tool execution cancelled by a form reset` (byte-equal; checked by JSON string compare).
  Match.
- Note reject clause (same line): Completed / silent cancellation / absent-or-wrong diagnostic /
  invented implementation authority. `checkCase` rejects the first three (frame count at
  measure-c1.mjs:289, status at :291, deep-equal params at :293-298); the fourth is narrative and is
  not oracle-checked (by design). No contradiction.
- Note method lines :31-33 (“invocation-correlated ordered frames; the receipt row is an index and
  summary”) hold: frames 9→10→11→12 are seq-ordered, and receipt `preAction`/`after`
  (`corpus/evidence/round-21/runtime/receipt.json:259-290`) is exactly the raw summary.
  Raw/receipt equality verified field-by-field: `after.responses[0]` == frame 15 `params`,
  `after.pageState` == frame 16 `value`, `after.submits` == `[]`.
- Note projection count :52 (“one Pending, five Completed, two Canceled, four Error”) matches the
  measured outcomes (`na-reset` is one of the two Canceled).
- Expectation `corpus/evidence/round-22/semantic-expectations.json:84-94` matches raw on every field:
  action `reset`, autosubmit false, fixture sha `67eca08e…` (== committed `na-reset.html`, verified),
  `responseWindow:"action-to-post"`, response `{Canceled, exact errorText}`, pre
  `{formActive:true, value:"$input", submitCount:0, statuses:[], urlPath:"/na-reset", urlSearch:""}`,
  post `{formActive:false, formExists:true, value:"", submitCount:0, statuses:["Canceled"], urlPath:"/na-reset"}`,
  navigation `none`.
- Window predicates (`measure-c1.mjs:268-276`) re-derived: pre `[1792590710864, 1792590711116]`
  windowMs 252 ≥ 250; after `[1792590711116, 1792590711619]` windowMs 503 ≥ 500; after.start ==
  pre.at == action.at (1116, equality is allowed), action-complete.at 1117 ≤ after.end; all frames
  inside the receipt window. `action-to-post` (`:306`): 13 < 15 < 16. Response statuses before
  post (`:254-260`): `[]` before pre, `["Canceled"]` before post. All pass; no finding.

**Result: no mismatch between the note row, the fixed expectation and the raw `na-reset` bytes** on
outcome, diagnostic, form state, windows, fixture binding, invocation id or raw digest.

## Findings

### F1 (minor, observability) — `sequence.invocation` is the `toolInvoked` event, not the invocation request
- Where: `.ufo/waves/round-22/measure-c1.mjs:360` (`invocation: invoked?.seq ?? null`), against
  `corpus/evidence/round-21/runtime/na-reset.json:132-145` (request seq 9) and `:146-154` (result seq 10).
- Counterexample: a consumer that maps `rows[].sequence.invocation` to the raw `WebMCP.invokeTool`
  request reads 11, two frames after the actual request at 9; the same offset applies to all 12 rows.
- Preserving positive: the chain `9 < 10 < 11 < 12` is enforced (`measure-c1.mjs:227` and `:231`), and
  `na-click` uses the same convention (`invocation 11, response 14`), so no row disagrees with another.
- Impact: none on the note, the expectation or the metric; the note never enumerates sequence numbers,
  and `rows[].sequence` carries seqs only (no `at`). It is a naming/observability ambiguity.
- Smallest fix: document the referent at `measure-c1.mjs:359-360`, or add
  `invokeSent: sent?.seq ?? null` (and optionally `actionComplete: completeFrame?.seq ?? null`) to the
  row; renaming `invocation` would change the output contract, so prefer the comment or additive field.

### F2 (adjacent oracle classification) — wrong `na-reset` status also emits `semantic_error`
- Where: `.ufo/waves/round-22/measure-c1.mjs:291` reports `outcome-status`, then `:293-298` compares
  the full params object, which itself contains `status`, so the same mutation also emits
  `semantic_error`/`exact-error-text-or-output-presence`.
- Counterexample: the author-retained selftest report `status-na-reset`
  (`.ufo/waves/round-22/checks-at-e3cf4e0.json`, run `oracle22-selftest`) observed findings
  `["semantic_status","semantic_status","semantic_error"]` where `fixtures/expected.json:87-95`
  declares only `semantic_status`; the selftest passes only because it uses `includes`.
- Preserving positive: `missing-cancel-text-na-reset` still yields exactly `["semantic_error"]` (correct),
  and both mutations keep `exit 1 / value 0 / failed`, so failure-capability of the row is intact.
- Impact: diagnostic label only; not a note/raw mismatch and not a metric change.
- Smallest fix: in the `response` branch, emit the params-equality finding only when
  `response.params?.status === expectedResponse.status` (or build `expectedParams` without `status`
  once `outcome-status` has been reported).

### F3 (evidence provenance, wave-level) — the 35/35 receipt is not in the reviewed revision
- Where: `.ufo/waves/round-22/checks-at-e3cf4e0.json` exists only in the working tree:
  `git cat-file -e e3cf4e0:…/checks-at-e3cf4e0.json` → exit 128, `git ls-files --error-unmatch` → exit 1,
  while `git rev-parse HEAD` = `e3cf4e0…`.
- Counterexample: the `counted:true` 12-row output cited above is not retrievable from the revision.
- Preserving positive: the committed `checks-pre-w2-0f24164.json:869-884` contains the same
  `na-reset` sequence and `semanticMatch:true`, and the raw/receipt/expectations/measure blobs are all
  committed, so the na-reset trace itself is revision-backed.
- Impact: na-reset semantics unaffected; the clean 12-row receipt's provenance is a wave-level issue
  for the parent (no write made here).

## Out of scope / not claimed
Browser reset-cancellation semantics and diagnostic stability/locale independence; source/binary
equivalence; malicious-author authenticity (self-consistent evidence plus changed expectations would
not be detected); non-author admission. Not assessed.

## Commands exercised (exit codes)
- `git show e3cf4e0:corpus/evidence/round-21/runtime/na-reset.json` (+ `sha256sum`) → 0; digest `097b8833…`.
- `git show e3cf4e0:corpus/evidence/round-21/runtime/na-reset.html | sha256sum` → 0; `67eca08e…` = expectation.
- `git show e3cf4e0:corpus/evidence/round-21/runtime/receipt.json` → 0; na-reset block at lines 253-295.
- `git show e3cf4e0:corpus/evidence/round-22/semantic-expectations.json` → 0; na-reset at 84-94.
- `git show e3cf4e0:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` → 0; row at line 41.
- `git show e3cf4e0:.ufo/waves/round-22/measure-c1.mjs` → 0; checks at 219-232, 246-282, 285-299, 306-307, 359-366.
- Read-only Python probes re-deriving raw/receipt/expectation relations → 0 (one first probe exited 1 on an
  assumed `exit` key in the selftest report shape; corrected probe → 0).
- `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-at-e3cf4e0.json` → 128; `git ls-files` → 1 (F3).
- `git cat-file -e e3cf4e0:.ufo/waves/round-22/checks-pre-w2-0f24164.json` → 0.

## Unrun checks (honest)
`node .ufo/waves/round-22/measure-c1.mjs e3cf4e0…` and `--selftest` were **not** executed (static-review
bound); the 12/12 clean run and 44/44 selftest are read from author-retained receipts, not reproduced.
No browser acquisition, no network, no git write, no tool install.

Report: .ufo/waves/round-22/w2b/RowTrace05.md
