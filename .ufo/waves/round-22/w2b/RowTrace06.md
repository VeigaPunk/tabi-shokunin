# RowTrace06 — `na-remove` raw frame trace vs `rows[].sequence` and the round-22 note row

Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (lane HEAD at review; `git -C . rev-parse HEAD` returned the same).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Mode: static, read-only. No lane script was executed (no `measure-c1.mjs`, no `selftest-c1.mjs`), no browser,
network, REA, service, delegation, peer message or VCS mutation. The only write is this report. Production was
read with `git -C ... show <rev>:<path>`; my own Python/git reads are noted with exit codes in §6.

## 0. Inputs and digests (blobs at `e3cf4e0`)

| Path | sha256 | Role |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-remove.json` | `e7e32f5f202a7d34262f143217bf4d370b89e1497493655259a9ecc0c6339e69` | raw 16-frame trace; equals receipt `.evidence.sha256` and `runtime-execution-finalized.json` `.artifacts[path]` |
| `corpus/evidence/round-21/runtime/na-remove.html` | `af61bae3898d84fd4e77825b3a40237337adc0726839eac4292ee5488d1af90f` | fixture; equals raw `.fixture.sha256` and expectation `.fixtureSha256` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | receipt/index row; equals execution `.receiptSha256` |
| `corpus/evidence/round-22/semantic-expectations.json` | `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` | expectation row `:96-108`; equals `measure-c1.mjs:22` |
| `.ufo/waves/round-22/measure-c1.mjs` | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` | repaired checker (post-crash `filesAfter`) |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e` | note; row at `:42` |
| `.ufo/waves/round-22/checks-pre-w2-0f24164.json` | committed | prior serial receipt, measurement bound to `0f24164`; contains the na-remove row |
| `.ufo/waves/round-22/checks-at-e3cf4e0.json` | worktree only | untracked at `e3cf4e0`; used as corroboration only (see §5) |

## 1. Raw frame trace

All 16 frames (`na-remove.json:12-225`). `seq` is contiguous 1..16; `at` is non-decreasing; every frame is
inside the receipt acquisition window `1792590706773 .. 1792590718439` (`receipt.json` `.startedAt`/`.finishedAt`).

| seq | at | dir | object | detail |
|---:|---:|---|---|---|
| 1 | 1792590711782 | sent | `Page.enable` | command 1 |
| 2 | 1792590711783 | result | command 1 | `{}` |
| 3 | 1792590711789 | event | `Page.frameNavigated` | `http://127.0.0.1:43143/na-remove`, frame `C5BA845E4E29A378CAAB9A832DC2D46D` |
| 4 | 1792590711796 | sent | `WebMCP.enable` | command 2 |
| 5 | 1792590711797 | event | `WebMCP.toolsAdded` | one tool `lifecycle`, same frame id, `backendNodeId 2` |
| 6 | 1792590711798 | result | command 2 | `{}` |
| 7 | 1792590711798 | sent | `Page.getFrameTree` | command 3 |
| 8 | 1792590711798 | result | command 3 | frame id above |
| **9** | **1792590711798** | **sent** | **`WebMCP.invokeTool`** | **command 4; `frameId` above; `toolName "lifecycle"`; `input {q: nonce}`** (`:133-145`) |
| **10** | **1792590711798** | **result** | **command 4** | **`{"invocationId":"622C2C1C9C93235581AB3F8C14A14EC5"}`** (`:147-154`) |
| **11** | **1792590711798** | **event** | **`WebMCP.toolInvoked`** | **same `invocationId`, tool, frame; `input` string `{"q":"<nonce>"}`** (`:156-166`) |
| **12** | **1792590712051** | **observation** | **`pre-action`** | **nonce, `submits []`, `errors []`, URL `/na-remove`, `secureContext true`, `formExists true`, `formActive true`, `value` = nonce, `focused "go"`** (`:168-184`; mirror `:226-242`) |
| **13** | **1792590712051** | **action** | **`remove`, `dispatch-started`** | (`:185-191`) |
| **14** | **1792590712052** | **action-complete** | **`remove`** | (`:192-197`) |
| **15** | **1792590712052** | **event** | **`WebMCP.toolResponded`** | **same `invocationId`; `status "Canceled"`; `errorText "Tool execution cancelled, since tool definition was updated"`** (`:198-207`) |
| **16** | **1792590712554** | **observation** | **`after-action`** | **nonce, `submits []`, `errors []`, URL `/na-remove`, `secureContext true`, `formExists false`, `formActive false`, `value null`, `focused ""`** (`:209-224`; mirror `:243-258`) |

Boundary facts: there is **no** `dir:"release"` frame and **no** `dir:"error"` frame in the file. The two
`pageObservations` entries are exactly the seq-12 and seq-16 observation frames (deep-equal checked). Receipt
summary (`receipt.json:297-338`): `preAction {start 1792590711798, end 1792590712051, windowMs 253,
responseCount 0, formActive true}`; `after {start 1792590712051, end 1792590712554, windowMs 503,
responses [the seq-15 object], submits [], navigations []}`; page state equals the seq-16 value.

Timestamp ties: frames 9/10/11 share `at = 1792590711798`, frames 12/13 share `1792590712051`, and frames 14/15
share `1792590712052`. The checker therefore enforces contiguous `seq` plus non-decreasing `at`
(`measure-c1.mjs:174-175`) and uses `seq` for the semantic frame-order assertions (e.g. `:199`, `:227`,
`:231`, `:306`); the receipt-window checks also compare `at` to the window bounds (`:268-275`), so `at` is a
window-membership witness, not an ordering witness, for this row.

## 2. What `checkCase` reads, and what `rows[].sequence` emits

`checkCase` (`measure-c1.mjs:148`) identifies the invocation triple at `:202-210` (`sent` = seq 9, command
result = seq 10, `invoked` = seq 11) and requires `sent.seq < commandResult.seq < invoked.seq < pre.seq`
(`:219-228`) plus `sent.seq < result.seq < invoked.seq` (`:231-232`). For this row that is `9 < 10 < 11 < 12`;
the retention count uses only `semanticMatch` (which is `local.length === 0`), never the sequence field.

Source-derived `rows[].sequence` for this row (`:359-366`):

| output field | source expression | raw frame it names | value | frame `at` |
|---|---|---|---:|---:|
| `invocation` | `invoked?.seq` (`:360`) | **`WebMCP.toolInvoked` event**, seq 11 | **11** | 1792590711798 |
| `preAction` | `pre?.seq` (`:361`) | `pre-action` observation, seq 12 | 12 | 1792590712051 |
| `action` | `actionFrame?.seq` (`:362`) | `action`/`dispatch-started`, seq 13 | 13 | 1792590712051 |
| `response` | `matchingResponses[0]?.seq` (`:363`) | `WebMCP.toolResponded`, seq 15 | 15 | 1792590712052 |
| `release` | first `dir:"release"` frame (`:364`) | none | null | — |
| `postAction` | `post?.seq` (`:365`) | `after-action` observation, seq 16 | 16 | 1792590712554 |

The raw has **three** invocation-correlated frames, not one:

| frame | seq | `at` | checked by |
|---|---:|---:|---|
| `WebMCP.invokeTool` sent request | 9 | 1792590711798 | `:202`, `:219-227`, `:231` |
| command-4 result carrying `invocationId` | 10 | 1792590711798 | `:207-208`, `:219-228`, `:231` |
| `WebMCP.toolInvoked` event | 11 | 1792590711798 | `:203`, `:210`, `:219-228`, `:231` |

`rows[].sequence.invocation` reports only the third (event) and omits the request and its acknowledgement.
The other five fields match the raw marker sequence exactly. The projection carries no `at` values and omits
the `action-complete` frame (seq 14), so the raw trace's `at` column and the response-after-complete position
are visible only in the raw file.

## 3. Note vs expectation vs raw

| Dimension | Note row (`:42`) | Expectation (`semantic-expectations.json:96-108`) | Raw (`na-remove.json`) | Verdict |
|---|---|---|---|---|
| status | `Canceled` | `"Canceled"` (`:104`) | `"Canceled"` (`:204`) | match |
| exact diagnostic | `Tool execution cancelled, since tool definition was updated` | same string (`:104`) | same string, byte-equal (`:205`) | match |
| action / mode | not stated | `remove` / `success` (`:99-100`) | action `remove` (`:188`), raw `mode "success"` (`:7`) | match |
| fixture | not stated | `af61bae3…` (`:102`) | `af61bae3…` (`:10`); actual HTML blob hashes to it | match |
| pre state | not stated | `:105`: `formActive true`, `formExists true`, `value "$input"`, `submitCount 0`, `statuses []`, `errors []`, `focused "go"`, URL `/na-remove` | `:168-184`: all equal after token resolution (`"$input"` → nonce) | match |
| post state | not stated | `:106`: `formActive false`, `formExists false`, `value null`, `submitCount 0`, `statuses ["Canceled"]`, `errors []`, `focused ""`, URL `/na-remove` | `:209-224`: all equal | match |
| response shape | status + exact text | `:104` has only `status`/`errorText` | `:202-206` has exactly `invocationId`, `status`, `errorText`; no `output` | match |
| window bounds | not stated | pre `250..10000` ms (`:105`), post `500..10000` ms (`:106`) | pre 253 ms: start 1792590711798 (= sent.at), end 1792590712051 (= pre.at); post 503 ms: start 1792590712051 (= pre.at / action.at), end 1792590712554 (= post.at) — receipt `:303-313` | match; 3 ms margins |
| navigation | not stated | `none` (`:107`) | only seq-3 initial navigation (at 1792590711789, before the action); none at/after `after.start` | match |
| projection class | "two Canceled" (`:52`) | — | na-remove is one of the two Canceled; full tally 1 Pending / 5 Completed / 2 Canceled / 4 Error | match |

The note row's "Required finite recorded distinction" is deliberately narrower than the expectation: the note
states at `:50-51` that "Exact diagnostic strings and structural contracts are in the fixed expectations, not
locale-independent or universal browser promises." The post form-absence, window minima, no-navigation and
exact response-key set are therefore expectation-level contracts, not omissions from the raw. I found
**no substantive mismatch among note, expectation and raw** for this row.

Repair invariance: the `e3cf4e0` post-crash diff (`post-crash-repair.json`) changes only the `landing`-conditioned
paths in `validatePageState` (nonce at `measure-c1.mjs:115-119`, errors at `:129-130`) and the `$nonce`
replacement in `urlSearch` (`:137-139`). For `na-remove`, `landing` is false and `urlSearch` is `""`, so every
changed expression evaluates exactly as before the repair. The committed pre-repair receipt (`checks-pre-w2-0f24164.json`) shows the same na-remove row
(`semanticMatch true`, `findings []`, sequence `11/12/13/15/null/16`); its `counted:false` is solely the
global na-native-submit findings, not a row failure.

## 4. Findings

### F1 (Low — reporting/contract; no metric effect): `rows[].sequence.invocation` names the `toolInvoked` event, not the invocation request

Evidence: `measure-c1.mjs:210` sets `invoked = invokedEvents[0]` (the `WebMCP.toolInvoked` event);
`:360` emits `invocation: invoked?.seq`. For na-remove that is **11**, while the request is the `sent`
`WebMCP.invokeTool` frame at **9** (`na-remove.json:133-145`) and its command result is **10**
(`:147-154`). The retained output confirms `invocation: 11` (committed pre-repair receipt; the untracked
after-receipt agrees). All three frames share `at = 1792590711798`, so this is a frame-identity/label error,
not a clock error.

- Smallest counterexample (static): read the six-field sequence as a trace reconstruction. It contains no
  way to locate the request (9) or the ack (10); a consumer citing "invocation seq 11" cites the
  `toolInvoked` notification, two frames after the request, and cannot see that the request preceded its
  acknowledgement.
- Preserving positive: every semantic predicate for the row passes (I independently recomputed 34 predicates:
  identity, fixture digest, frame contiguity/clock, pre/post state, response count/status/exact params,
  windows, receipt mirrors, navigation, cleanup, digest); `semanticMatch` is true, `findings` is empty. No
  predicate reads `sequence` (`grep -n sequence measure-c1.mjs` shows only the return literal and unrelated
  timing labels), and `selftest-c1.mjs` contains zero occurrences of `sequence`; `checkOracle` only checks
  `output.rows.length === 12` (`selftest-c1.mjs:384`). Changing the key/emission cannot change the count.
- Smallest fix: in `measure-c1.mjs:359-366`, either rename `invocation` to `toolInvoked`, or emit
  `invocationRequest: sent?.seq ?? null` / `invocationResult: commandResult?.seq ?? null` and
  `toolInvoked: invoked?.seq ?? null`. Add one selftest assertion pinning the na-remove sequence object
  (`{toolInvoked:11, preAction:12, action:13, response:15, release:null, postAction:16}`) so the output
  cannot drift silently.

### Observation O1 (not a defect): the output projection is seq-only

`rows[].sequence` has no `at` values, no `action-complete` (14) and no request/ack frames. The task's seq/at
trace is complete only in `na-remove.json`. If the field is intended as a reusable trace rather than a
compact marker index, add `at` (or a parallel `at` map) and `actionComplete`; the current output is a valid
marker index, and no expected behavior is contradicted.

### Observation O2 (not a defect): the note row is narrower than the expectation

The note's `na-remove` row names only the terminal status/text; the expectation additionally pins the pre/post
page state, response-key set, window minima and no-navigation. The note's `:50-51` delegates structural
contracts to the expectations, so there is no contradiction. The reject cell (`:42`) is also a scope caution
("generalizing this tested removal to every DOM edit") rather than the concrete wrong-outcome list used for
`na-reset` (`:41`); the expectation still rejects a Completed or wrong-text outcome through exact status/text
equality (`semantic-expectations.json:104`), so the two Canceled rows are not parallel in prose but are
equivalent in the oracle. If the note is intended as a standalone row spec, add a parenthetical pointing to
the expectation row.

### Observation O3 (evidence limitation, supports the note's caution)

The raw cannot witness a tool-registry removal event: the producer subscribes only to `WebMCP.toolsAdded`,
`WebMCP.toolInvoked`, `WebMCP.toolResponded` and `Page.frameNavigated`
(`scripts/webmcp-lifecycle-round21.mjs:180`), so no `toolsRemoved`-style frame is recorded. The removal is
witnessed locally by the `action:"remove"` frame (`na-remove.json:188`, block `:185-191`), the post state
`formExists:false` (`na-remove.json:219`) and the browser diagnostic (`:205`). This is exactly why the note's rejection of
"generalizing this tested removal to every DOM edit" (`:42`) is appropriately cautious; it is not a mismatch.

## 5. Limits / unrun checks

- No lane script was executed: the `rows[].sequence` values in §2 are derived from the committed source at
  `e3cf4e0` and cross-checked against retained receipts, not produced by a fresh run. No browser run, no new
  acquisition, no other build/locale, no re-run claim.
- `.ufo/waves/round-22/checks-at-e3cf4e0.json` exists in the worktree but is **untracked** at `e3cf4e0`
  (`git status --porcelain` → `??`; `git ls-files --error-unmatch` exit 1; `git log --all -- <path>` empty).
  Its `revision` field claims `e3cf4e0`; I used it only as corroboration. The committed pre-repair receipt
  (bound to `0f24164`) independently shows the same na-remove sequence and `semanticMatch`, and the repair
  diff is row-neutral for na-remove.
- This is author-side falsification. It does not authenticate the author's expectations, does not establish
  non-author admission, and says nothing about malicious-author authenticity or universal browser behavior.
- No PID/cleanup re-observation was done; cleanup was checked statically against the raw fields and the
  receipt flags only.

## 6. Commands exercised (all read-only; exit codes)

| Command | Exit |
|---|---:|
| `git -C . show e3cf4e0…:<path>` for every cited blob | 0 |
| `git -C . ls-tree -r --name-only e3cf4e0… .ufo/waves/round-22 corpus/evidence/round-22` | 0 |
| `git -C . status --porcelain -- .ufo/waves/round-22/checks-at-e3cf4e0.json` | 0 (`??`) |
| `git -C . ls-files --error-unmatch .ufo/waves/round-22/checks-at-e3cf4e0.json` | 1 (untracked, expected) |
| `git -C . check-ignore -v .ufo/waves/round-22/checks-at-e3cf4e0.json` | 1 (not ignored) |
| `git -C . log --all --oneline -- .ufo/waves/round-22/checks-at-e3cf4e0.json` | 0 (empty) |
| `sha256sum` over `git show` blobs | 0 |
| `python3` heredocs: JSON/byte checks, 34-predicate recomputation, line/digest comparisons | 0 |

Not run: `node .ufo/waves/round-22/measure-c1.mjs`, `node .ufo/waves/round-22/selftest-c1.mjs`, any browser,
any installer, any service.

Report: .ufo/waves/round-22/w2b/RowTrace06.md
