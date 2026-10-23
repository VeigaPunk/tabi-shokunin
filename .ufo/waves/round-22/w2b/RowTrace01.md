# RowTrace01 — `na-pending` raw frame trace vs oracle output and note row

Revision reviewed: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane HEAD; `git rev-parse HEAD` returned it).
Posture: static, read-only. No lane script, node measurement, selftest, browser, REA, install, or
lane VCS write was executed. Only this report was written.

## 0. Exact files read (blobs at the reviewed revision)

| Path | Blob | sha256 of bytes |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-pending.json` | `1250c731322c0f2759a4407450c4966c655ea3e3` | `f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e` |
| `corpus/evidence/round-21/runtime/na-pending.html` | `196642e35ea30eb9db878e2aded2f45a3e24ca65` | `f7c869270c8218f7351ad2be3143d8e7d6f2458e6505966d6c9b4bc747af60c6` |
| `corpus/evidence/round-21/runtime/receipt.json` | `59912421a0051187990f9e4ceab4473aba44b01d` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `corpus/evidence/round-22/semantic-expectations.json` | `e52ddf322a9498edbbf85009d8d8699ed099eabe` | pinned in code as `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (`measure-c1.mjs:22`) |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | `de9d9cda7c9ded3407cf9ea0c6503e01af4d66dc` | `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e` |
| `.ufo/waves/round-22/measure-c1.mjs` | `ab7af10db4d8b0d5b6b890f95bd870c5281d8cd3` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |

Digest cross-links observed: raw bytes = receipt `cases[0].evidence.sha256` = execution
`artifacts["corpus/evidence/round-21/runtime/na-pending.json"]` = row `rawDigest`; fixture bytes =
raw `fixture.sha256` = expectation `fixtureSha256`.

## 1. Raw trace of `na-pending` (byte-exact)

`corpus/evidence/round-21/runtime/na-pending.json` has 15 frames, seq contiguous 1–15, non-decreasing
`at`. The lifecycle subset:

| Role asked by the ticket | Raw frame | seq | at (ms) | Citation |
|---|---|---|---|---|
| invocation — command sent | `dir:"sent"`, `command:4`, `method:"WebMCP.invokeTool"`, `{frameId:"27001C03…", toolName:"lifecycle", input:{q:nonce}}` | **9** | **1792590707081** | `na-pending.json:133-145` |
| invocation — ack/result | `dir:"result"`, `command:4`, `{invocationId:"44555B4FCF76A7EE11B1E96ACA81851F"}` (no status/output/error) | **10** | **1792590707081** | `:146-154` |
| invocation — confirmed event | `dir:"event"`, `method:"WebMCP.toolInvoked"`, same `invocationId`, `input` string `{"q":nonce}` | **11** | **1792590707082** | `:155-166` |
| pre-action | `dir:"observation"`, `label:"pre-action"`, form active, no submits/errors | **12** | **1792590707335** | `:167-183` |
| action | `dir:"action"`, `{action:"none", phase:"no-action"}` | **13** | **1792590707335** | `:184-190` |
| action-complete | `dir:"action-complete"`, `{action:"none"}` | **14** | **1792590707335** | `:191-196` |
| **response** | **absent** — zero `dir:"event"` `WebMCP.toolResponded` frames for this or any invocation id; zero `dir:"error"` frames | — | — | whole file `:12-214` |
| **release** | **absent** — zero `dir:"release"` frames | — | — | whole file `:12-214` |
| post-action | `dir:"observation"`, `label:"after-action"`, value byte-equal to seq 12 | **15** | **1792590707838** | `:197-213` |

`pageObservations` repeats only the two markers (`:215-250`): `pre-action` at `seq 12, at …335`;
`after-action` at `seq 15, at …838`. Last frame is the after-action marker.

Receipt row (`receipt.json:21-50`): `preAction {start:1792590707081, end:1792590707335, windowMs:254,
responseCount:0, formActive:true}` (`:27-33`); `after {start:1792590707335, end:1792590707838,
windowMs:503, responses:[], submits:[], navigations:[], pageState:…}` (`:34-50`).

Arithmetic: pre window `…335 − …081 = 254 ms`; after window `…838 − …335 = 503 ms`; pre start equals
both the sent command and its ack timestamp. Receipt envelope converted to epoch ms is
`[1792590706773, 1792590718439]` (`startedAt 13:51:46.773Z`, `finishedAt 13:51:58.439Z`), so all
15 frames lie inside it.

Producer output (`runtime-execution-finalized.json.stdout`) says for this case:
`LIFECYCLE_OBSERVED na-pending pre=0 statuses=none-in-window` — the producer itself records no
terminal status in either window.

## 2. What `measure-c1.mjs` reads and emits

### 2.1 Code path (all at `e3cf4e0`, `.ufo/waves/round-22/measure-c1.mjs`)

- `sentInvocations` = sent `WebMCP.invokeTool` (`:202`); `invokedEvents` = event `WebMCP.toolInvoked` (`:203`); `invoked = invokedEvents[0]` (`:210`).
- Invocation chain is **checked** by `sent.seq < commandResult.seq < invoked.seq < pre.seq`, one sent frame, one result, one event, one `toolsAdded lifecycle` tool, and receipt/event invocation-id equality (`:219-232`).
- Response frames are only `dir:"event"` `WebMCP.toolResponded` (`:58`), filtered by invocation id (`:255`).
- Pending outcome: `observed = matchingResponses[0]?.params?.status ?? 'Pending'` (`:351`).
- Response absence: `expectedResponse === null` requires `matchingResponses.length === 0` (`:286-287`); `responseWindow === 'none'` requires the same (`:302-303`).
- Release absence for non-delayed cases: any `dir:"release"` frame is a `semantic_delayed` finding (`:341-343`).
- The `sequence` object is assembled at `:359-366` and, in particular:

```
359  sequence: {
360    invocation: invoked?.seq ?? null,
361    preAction: pre?.seq ?? null,
362    action: actionFrame?.seq ?? null,
363    response: matchingResponses[0]?.seq ?? null,
364    release: frames.find((frame) => frame.dir === 'release')?.seq ?? null,
365    postAction: post?.seq ?? null,
366  },
```

### 2.2 Retained row

Committed receipt `.ufo/waves/round-22/checks-pre-w2-0f24164.json` (reviewed checkpoint) contains the
`c1-after` run at `0f24164` using measure digest `76b47edd…`; its stdout at `:775` carries:

```
"id":"na-pending","outcome":"Pending","semanticMatch":true,"counted":false,
"sequence":{"invocation":11,"preAction":12,"action":13,"response":null,"release":null,"postAction":15},
"findings":[],"rawDigest":"f17fe86f…"
```

Worktree-only `.ufo/waves/round-22/checks-at-e3cf4e0.json` (see F2) has the same row at `:775` stdout
and pretty-printed in `observedMetrics.rows` (`:788-799`, `"invocation": 11` at `:793`), with
`semanticMatch:true, counted:true`, measure digest `47176aed…`, value 12/clean.

`sequence` carries **seq only**; the ticket's `at` values are not present in the output and can only
be checked against the raw and the receipt windows (done in §1).

## 3. Three-way comparison: note row ↔ expectation ↔ raw

The note's `na-pending` row verbatim (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:37`):
“no correlated response within the two recorded windows; active form”.
Reject column: “a fabricated terminal response or an indefinite-pending conclusion”.

The expectation row is `corpus/evidence/round-22/semantic-expectations.json:31-43`:
`action:"none"`, `autosubmit:false`, `mode:"success"`, `inputQ:"$nonce"`,
`fixtureSha256:f7c869…`, `responseWindow:"none"`, `response:null`,
`pre/post {minMs:250/500, maxMs:10000, formActive:true, formExists:true, value:"$input",
submitCount:0, statuses:[], errors:[], focused:"go", urlPath:"/na-pending", urlSearch:""}`,
`navigation:"none"`.

| Dimension | Note row | Expectation | Raw | Result |
|---|---|---|---|---|
| response | none in the two windows | `response:null`, `responseWindow:"none"`, `statuses:[]` | zero `toolResponded` in 15 frames | consistent |
| form | active | `formActive:true` both windows | `formActive:true, formExists:true` at seq 12 and 15 | consistent |
| windows | “two recorded windows” | pre `[250,10000]`, post `[500,10000]` | exactly two markers; 254 ms / 503 ms | consistent |
| action | not stated | `action:"none"` | action marker `none`/`no-action` at seq 13 | consistent |
| release | not stated | non-delayed (no `delayed` key) | zero release frames | consistent |
| navigation | not stated | `navigation:"none"` | zero `Page.frameNavigated` after the initial one | consistent |
| submits/errors | not stated | `submitCount:0`, `errors:[]` | `[]`/`[]` in both observations | consistent |
| outcome prose | “finite pending” (projection at `:51-53`) | response `null` | producer `statuses=none-in-window` | consistent |

The note's projection “one finite pending, five Completed, two Canceled and four Error”
(`note:51-53`) matches the retained rows exactly: parsing the committed `c1-after` stdout gives
`Counter({'Completed':5,'Error':4,'Canceled':2,'Pending':1})`.

**No semantic disagreement was found between note row, expectation, and raw bytes.** The note row is
weaker in wording than the instrument in exactly one respect: “within the two recorded windows”
would not, read alone, reject a response appended after the after-action marker; the instrument does
reject it (`:287`, `:303`) and the note's own reject column (“a fabricated terminal response”) covers
it. The second reject phrase, “an indefinite-pending conclusion”, is not a machine predicate at all —
the note itself disclaims it at `:111` (“Finite no-response is not permanent pending”). That is a
reading rule, not a gate; not a defect.

## 4. Mismatches found

### F1 — Actual defect (low severity, output metadata): `rows[].sequence.invocation` points at the `toolInvoked` event, not the invocation command

**Observed.** For `na-pending`, the emitted `sequence.invocation` is **11**. The raw invocation
command is the sent `WebMCP.invokeTool` frame, **seq 9** (`na-pending.json:133-145`); seq 10 is its
ack (`:146-154`); seq 11 is the `WebMCP.toolInvoked` event (`:155-166`). The value comes from
`invocation: invoked?.seq` (`measure-c1.mjs:360`), where `invoked` is `invokedEvents[0]`
(`:203`, `:210`) — i.e. the event, not the command.

**Why this is a mismatch, not just naming.** Every other key in the same object names the frame
occupying the named lifecycle role: `response` is the `toolResponded` frame, `release` the release
frame, `preAction`/`postAction` the observation markers, `action` the action marker. By that
convention `invocation` should be the `invokeTool` frame (9). The lane's own committed trace uses exactly this
vocabulary: `.ufo/waves/round-22/w1/Raw01.md:44-46` labels `9 | sent | WebMCP.invokeTool`,
`10 | result | acknowledgement only`, `11 | event | WebMCP.toolInvoked`; a W1 scout return in
`w1-returns.json` (`seats[12]`, report `w1/Raw04.md`) orders frames as
“`invokeTool → result → toolInvoked → pre → …”. A consumer reading `sequence.invocation: 11` as
“the invocation frame” mis-cites by two frames and loses the ack at 10.

**Smallest counterexample (static, no execution).** Read the retained row (`checks-pre-w2:775` or
`checks-at:793`) and claim “the invokeTool command is frame 11”. The raw contradicts it: frame 11 is
`WebMCP.toolInvoked`, the command is frame 9. A trace table generated from `sequence` alone would
list the invocation at 11.

**Preserving positive.** The same retained bytes pass the oracle's own chain predicate
(`measure-c1.mjs:227`: `9 < 10 < 11 < 12`) with `semanticMatch:true` in both receipts. The
worktree receipt (F2) shows `counted:true`, value 12/clean; the committed pre-repair receipt shows
`counted:false` only because two unrelated `na-native-submit` findings block the whole gate
(`blocked = findings.length > 0`, `measure-c1.mjs:480-485`) — not because of this row. The gate is
correct; only the emitted label is wrong, so the fix must not touch the chain check.

**Why it survives review.** Nothing reads `sequence` back: `selftest-c1.mjs` `checkOracle` checks
value/exit/verdict/metric/findings/`rows.length` only (`:375-392`); `.ufo/waves/round-22/fixtures/expected.json`
has zero `sequence` keys (476 lines, grep count 0); `run-checks.py` compares only the
`expectedMetrics` keys (`:155-160`) and stores the full payload unexamined. The note and
expectations contain no sequence values, so neither pins this field.

**Smallest fix.** At `measure-c1.mjs:359-366` emit `invocation: sent?.seq ?? null` and add
`toolInvoked: invoked?.seq ?? null` (or rename the current key to `toolInvoked`). No fixture or
expectation change is required because none asserts `sequence`. Optional: add `at` fields if the
object is intended to be the trace the ticket asks for; today it cannot supply them.

### F2 — Provenance gap at the review boundary: the cited 35/35 receipt is not in the reviewed revision

The wave brief cites two serial receipts: `checks-pre-w2-0f24164.json` (33/35) and
`checks-at-e3cf4e0.json` (35/35). At `e3cf4e0` only the first is committed:

- `git cat-file -e e3cf4e0d…:.ufo/waves/round-22/checks-at-e3cf4e0.json` → exit **128**, “exists on disk, but not in 'e3cf4e0…'”.
- `git ls-tree -r --name-only e3cf4e0d… | grep -c checks-at-e3cf4e0` → **0** (grep exit 1).
- `git status --porcelain -- .ufo/waves/round-22/checks-at-e3cf4e0.json` → `?? …` (exit 0); worktree mtime 13:39, commit date 13:38:27.
- The committed `checks-pre-w2-0f24164.json` is 35 runs with 33 pass, failures `oracle22-selftest` and `c1-after`; its `c1-after` is exit 1 / value 0 / verdict failed (`:760`, stdout `:775`).

**Smallest counterexample.** A reviewer on a fresh clone at `e3cf4e0` cannot open the cited 35/35
receipt and cannot verify the 12/clean claim from committed bytes; the committed receipt's after-run
is value 0.

**Preserving positive.** The `na-pending` row is identical in both receipts (sequence
`11/12/13/null/null/15`, `rawDigest f17fe86f…`), and the untracked file binds the same measure digest
`47176aed…` as the committed `measure-c1.mjs` blob. My trace conclusion therefore does not depend on
the untracked file.

**Smallest fix.** Commit the post-repair receipt (a post-w2b commit is already the stated labeling
rule), or cite it explicitly as an uncommitted worktree receipt in the wave brief.

## 5. Checked vs merely emitted (what the final code actually reads)

| Fact | Checked at (`measure-c1.mjs`) | Or merely emitted |
|---|---|---|
| exactly one sent `invokeTool`, right frame/tool/input | `:219-228` | |
| ack result carries `invocationId`; IDs cross-link receipt↔event | `:219-232` | |
| exactly one `toolInvoked` for that id | `:221-227` | |
| `sequence.invocation` value | | **emitted only** (`:360`) |
| frame seq contiguity / non-decreasing `at` / acquisition window | `:174-177` | |
| two observation markers, frame↔`pageObservations` link | `:181-190`, `:246-250` | |
| one action + one action-complete frame, `action:"none"`, `phase:"no-action"` | `:192-200` | |
| pre/action/complete/post seq ordering | `:199-200` | |
| response absence everywhere | `:286-287`, `:302-303` | |
| release absence (non-delayed) | `:341-343` | |
| receipt windows/responses/submits/navigations/pageState vs raw | `:261-283` | |
| pre/post page state vs expectation | `:107-146`, `:251-252` | |
| the note's per-case row | | **not read** — only the note's first line is checked (`:395-400`), no note digest |
| `sequence` object as a whole | | **not read back anywhere** |

## 6. Limits and checks not run

Not run: `measure-c1.mjs` (production or `--selftest`), `selftest-c1.mjs`, any lane node script,
browser/CDP, REA, network, installs, lane/fleet VCS mutation. The row values in §2.2 are read from
retained receipts, not regenerated. No claim is made about a fresh measurement or about the
untracked receipt's runtime environment beyond its recorded argv/digest binding.

Exercised commands (read-only): `git rev-parse HEAD`, `git show REV:PATH` (all named reads
succeeded), `git ls-tree`/`git cat-file -e` (raw exit 0; checks-at exit 128), `git status --porcelain`
(exit 0), `git log --all -- path` (no output), `sha256sum` on both `git show` streams (exit 0),
`grep -c` for checks-at in the tree (0, exit 1), and `python3` JSON projections (exit 0).

Report: .ufo/waves/round-22/w2b/RowTrace01.md
