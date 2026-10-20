VERDICT: ISSUES

# LiveS044 — C1 receipt S044 (DevTools WebMCPView) under independent re-fetch

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; measured REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`; baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`.
Assigned row: S044 only. S029 was cross-checked by `git show` at its pinned own-work commit (ticket
instruction), not by network; it is not the assigned row.

Bottom line: **receipt S044 reproduces field-for-field and the counter credits it; it is not a forged or
stale artifact.** The defects are (a) the C1 claim sentence treats a commit-pinned content-addressed
re-fetch as "live source" freshness, (b) the counter's `eligible_rows` at REV (58) does not support any
"51/51" reading, (c) two free-text/record fields are misleading (`anchorObserved` pointer, recorded
`command`), and (d) the row's final teaches clause ("a receipt must record both events") is an
inference the cited source does not state and does not entail.

## 1. Re-fetch (exact, reproducible)

Command, run twice in `/tmp/s044work` (private sandbox; deleted after this report):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body.ts -w 'HTTP=%{http_code} SIZE=%{size_download} TIME=%{time_total}\n' \
  'https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts'
```

Observed both times: `HTTP=200 SIZE=12124 TIME=0.256498` (first), `TIME=0.022030` (second), `exit=0`.
On-disk body (decompressed): **59794 B**, sha256
`4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f`; second fetch byte-identical
(`cmp` → `STABLE_IDENTICAL`). `SIZE=12124` is the compressed wire size; the receipt's `bytes` is the
decompressed body, which is what its sha256 covers.

`decode: none` (receipt S044.json:11) is correct: the served bytes are UTF-8 text.

Quote location: line **945** of the fetched body —
`this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;`
— identical to receipt `quote` (S044.json:13). Also present at `corpus/lessons/round-17.md:56`, the
receipt's `quoteSource` (S044.json:15); verified by `grep -n`.

`quoteOffset: 32384` (S044.json:17) is an offset in **normalized** text, not raw bytes. At raw byte
32384 the body reads `/* keepOpen=*/ true);`. The normalized body has the quote at 32384 (recomputed
with the producer's own normalizer; normalized length 48831). The field is undocumented, so a verifier
doing `dd skip=32384` gets unrelated content (see F4).

`quoteWords: 6` equals whitespace word count of the quote (S044.json:14) — contract satisfied.

## 2. Receipt fields vs observation

| Field (S044.json line) | Receipt | Observed 2026-10-20 | Verdict |
|---|---|---|---|
| schema :2 | `tabi-source-recheck-v1` | — | ok |
| row :3 | `S044` | present `corpus/SOURCES.md:58` at REV, not superseded | held |
| rowUrl :4 | GitHub blob at 40-hex `66df492a…` | occurs verbatim in the S044 `source` cell (`git show REV:corpus/SOURCES.md`, line 58) | held |
| url :5 | raw.githubusercontent at same commit/path | canonical raw form of the blob URL (measure-c1.mjs:186-195) | held |
| httpStatus :8 | 200 | 200 twice | held |
| bytes :9 | 59794 | 59794 | held |
| sha256 :10 | `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` | identical twice | held |
| quote :13 / quoteFound :16 | line 945 | found at line 945 | held |
| quoteWords :14 | 6 | 6 | held |
| quoteSource :15 | `corpus/lessons/round-17.md:56` | quote present there | held |
| excerpt :18 / excerptSha256 :19 | 1310 B, `472bb1d5b39b8739a64a35a76297e5073dff6325abd73ff47856aa9054532937` | recomputed exact producer window (600+109+600+`\n` = 1310 B) byte-equal, sha equal | held |
| producerSha256 :24 | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` | matches `.ufo/waves/round-18/recheck-fetch.mjs` at REV and worktree | held |
| fetchedAt :6 | 2026-10-20T19:06:14.133Z | host date 2026-10-20 | held |
| anchorObserved :20 | sha + 59794 B + "(matches round-17 Gate)" | sha/bytes held; "round-17 Gate" pointer is wrong (F3) | held with mislabeled pointer |
| teachesVerdict :21 | `held` | mechanism held; final normative clause is inference (F5) | held for mechanism |

Committed receipt at REV equals the worktree file: sha256
`7b085d648beda2a7e6be6e3e9ab594eed50a41abd7f695f6ae643987bce86b1c` in both. So no uncommitted
divergence.

## 3. Source identity, anchor, teaches

**Identity: held.** The blob URL's commit is the commit named in
`https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/DEPS` line 424 —
`'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2'` (DEPS 197649 B, sha256
`dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d`). The registry's "Chromium tag
154.0.8037.97 DEPS line 424" anchor therefore holds today. The receipt itself does not record this
check; I performed it independently.

**Anchor: held.** All four cited spans exist at the pinned commit:
- `WebMCPView.ts:942-945` — `onRunTool` sets `event.data.parameters || {}` then awaits `tool.invoke` (lines 942-945).
- `WebMCPView.ts:561-576` — status cell (`statusString(call)`, 561-565) and input/output cells (567-576).
- `WebMCPModel.ts:128-139` — `async invoke(input: unknown)` → `invoke_invokeTool({toolName, frameId, input})` → `response.invocationId` (128-139), at `front_end/models/web_mcp/WebMCPModel.ts` (8553 B, sha256
  `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`).
- `WebMCPModel.ts:249-258` — `toolResponded` looks up `#calls.get(params.invocationId)` and attaches the result (249-257).
The registry cites the model as bare `WebMCPModel.ts`; it is not under the row's cited directory
(`front_end/panels/application/`), and my first two path guesses 404'd. The filename is correct once
the module path (`front_end/models/web_mcp/`) is found; the anchor is under-specified, not false.

**Teaches: held for the mechanism, overreached at the end.**
- "invokes a tool with an object input": line 944 passes `event.data.parameters || {}`; model line 130-134 forwards it as `input`. Held.
- "binds the outcome only through a pre-seen toolInvoked id": 945 keeps the returned id; 946-952 searches `model.toolCalls` for `c.invocationId === id`; 861-866 binds on `TOOL_INVOKED` with the same id. `toolCalls` is `[...this.#calls.values()]` (WebMCPModel.ts:172) and `#calls` is written only at :245 inside `toolInvoked` (the TOOL_INVOKED handler). Held.
- "so an invocation receipt must record both events": **not stated by the source, and not entailed.** `ToolRespondedEvent` carries `invocationId` (WebMCPModel.ts:249-257); a receipt recording the invoke response (id) plus `TOOL_RESPONDED` correlates request and outcome without recording `TOOL_INVOKED`. The panel needs `TOOL_INVOKED` to populate its table; a receipt does not. The receipt's `note` (S044.json:22) repeats this as "a receipt must record both", which is the author's rule, not the source's.
- The quote alone supports only "invoke returns an id and the panel retains it"; "object input" (944) and the id-binding (946-952, 861-866) are outside the quoted line. They are in the receipt's `note`, and I verified them, but the excerpt (600-byte window) contains 944-952 and **not** 861-866; an excerpt-only review cannot confirm the handler.

## 4. Findings (paths:lines, finite counterexamples, confidence)

### F1 — C1 conflates immutable availability with live source freshness (medium-high)

`PLAN.md:15-16`: "Source rows re-verified against their **live source** with a committed recheck
receipt: 0 → N (target 51…)". S044's fetch target is commit-pinned (40-hex in the URL); a 200 plus an
identical sha is the expected result of content addressing, not a freshness observation. The receipt
would stay `held` even if the row's snapshot were months behind the tracked file.

Finite counterexample, same date: `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/main/front_end/panels/application/WebMCPView.ts`
→ HTTP 200, **62257 B**, sha256
`2f7b596e963c1f5dbc872b75f31484eb120897688b31c1ddcd7e821bb66fb4bf`, ≠ the pinned
59794 B / `4b2fce64…`. The diff is UI-string/comment churn (e.g. `toolRegistry: 'Available Tools'` →
`'Available tools'`); the invoke block is byte-identical (`diff` of pinned 935-962 vs main 939-966 →
`BLOCK_IDENTICAL`). So the live file changed while the receipt remains green, and the receipt cannot
distinguish "row current" from "row stale".

`--live` does not close this: for a GitHub blob row, `canonicalFetchTarget` maps the blob URL to the
raw commit-pinned URL and sets `canonical = normalizedRaw` (measure-c1.mjs:189-193), stores it at
:358, and `liveCheck` fetches `item.fetchUrl` (:399). For S044 `live_held` is therefore a re-fetch of
the same immutable blob by construction.

Scale: **12 of the 51 credited receipts are `immutable_pinned`** — S033, S034, S036, S037, S041,
S042, S043, S044, S045, S046, S055, S056 (recomputed with the counter's own `isPinnedUrl` regex over
the 51 receipt rows). The counter at REV reports `row_classes.url = {immutable_pinned: 17,
living_live: 46, own_work: 1}` over 64 rows; the receipted subset is 12 pinned.

Mitigations already in tree (must be credited): lesson `corpus/lessons/round-18.md:12-13` disclaims
"current product support"; the counter prints
`freshness_scope: 'round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate'`
(measure-c1.mjs:471); the note's §4 separates pinned/live (`corpus/knowledge/source-recheck-round-18.md:110-114`).
The overreach is confined to the PLAN claim wording and the "freshness" label; it is not a false
receipt. Repair suggestion for integration: state the claim as "integrity-checked recheck receipts;
for the 12 pinned rows the receipt proves reachability + quote at the pinned revision, not live
currency", and report the pinned fraction beside `c1_rows_rechecked`.

Note on S044's own currency: the row was opened 2026-10-20, its `recheck` cell is `on-release`
(SOURCES.md:58), Chromium 154.0.8037.97 is the tag, and DEPS still pins `66df492a…`. The row is not
date-stale under its own cell; this finding is about what the receipt proves.

### F2 — counter denominator at REV is 58, not 51 (medium-low)

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` (read-only;
`TMPDIR=/tmp/s044work/tmp`), exit 0:

```
c1_rows_rechecked=51  eligible_rows=58  held=50  own_work=1  drift_superseded=0  rejected=[]
```

At B the same counter gives `c1_rows_rechecked=0  eligible_rows=51` (exit 0), matching the lesson's
"fixed baseline selection is 51 rows" (`round-18.md:12-13`). At REV, SOURCES has 64 rows; 64 − 6
superseded = 58 eligible (`measure-c1.mjs:465`), and **S058–S064 have no receipts** (verified:
all seven absent from `corpus/evidence/round-18/source-recheck/`). S044 is among the 51 accepted
(rejected list is empty and S044 is not own-work). So the 51 target passes, but any statement of the
form "51/51 eligible" is false at REV: the counter's own output says 51/58. State the denominator as
baseline-scoped, or the seven new rows need receipts.

### F3 — `anchorObserved` points at a non-existent "round-17 Gate"; token count differs (low)

`S044.json:20` says "(matches round-17 Gate)". `corpus/lessons/round-17.md` has no S044 Gate entry;
the digest appears in the S044 **row** at `corpus/lessons/round-17.md:56`, whose Re-check column reads
"raw sha match; quote found" (`grep -n 4b2fce… corpus/` finds only that row and the receipt). This is
the same reference-drift class C3 is correcting; the byte claim is true, the pointer is mislabeled.
Also the round-17 row says "(code, 13 tokens)" while the receipt says `quoteWords: 6`; both are
defensible under different tokenizations, but the two counts must not be cross-cited as equal.

### F4 — recorded command cannot be re-run as printed; `quoteOffset` is in an undocumented space (low)

`S044.json:7` records the fetch with an **unquoted** user agent:

```
curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 ...
```

`bash -n` on that line: exit 2, `syntax error near unexpected token `('`. Re-running the same argv
with the UA quoted reproduces HTTP 200 / 59794 B / `4b2fce64…`. This is producer-wide (all 51
receipts) and the counter compares the string it generates itself (`expectedCurlCommand`,
measure-c1.mjs:234), so acceptance cannot detect it. Separately, `quoteOffset: 32384` is a normalized
offset (raw byte 32384 is `/* keepOpen=*/ true);`); a verifier who assumes a byte offset fails.
Neither affects the accepted count; both reduce independent reproducibility.

### F5 — quote presence is not quote sufficiency; the final teaches clause is inference (medium)

See §3: the quoted line alone does not show the object input or the id-binding; the body does, at the
lines the receipt's `note` cites (which I verified). The `held` verdict is therefore substantively
right for the mechanism. It is too strong for "a receipt must record both the invoke and the
toolInvoked event": `TOOL_RESPONDED` also carries `invocationId` (WebMCPModel.ts:249-257), so the
`TOOL_INVOKED` recording is required by the panel's table, not by a receipt. Confidence in the line
refs: high (all read at the pinned commit); the overreach is interpretive, so flag, do not falsify.

## 5. Counter behaviour and other checks

- `measure-c1.mjs` at REV: counterSha256 `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`, equal to
  `git show REV:.ufo/waves/round-18/measure-c1.mjs | sha256sum` and the worktree file.
- `producerSha256` matches `recheck-fetch.mjs` at REV/worktree: `f2ba0033…a360`. I did **not** run the producer.
- S029 cross-check via `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`:
  sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, 97073 B, matching
  `S029.json` and the counter's pinned constant. No network used.
- No in-place SOURCES edit: `git diff B REV -- corpus/SOURCES.md` is +9 lines only (S058–S064
  append), no S044 change.

## 6. Finite limits (what is not claimed)

- One pinned-body fetch (twice, identical) plus one `main` probe, one DEPS fetch, one model fetch, one
  GitHub contents listing; all public GET, no browser, no 9222, no fixture page, no credentials.
- No `--live` run (it would issue 50 GETs); the `--live` tautology for pinned rows was established
  from the counter source, not by execution.
- No `recheck-fetch.mjs` execution; no lane writes except this report.
- Only S044 assessed. S029 is a cross-check of the pinned blob, not a full receipt review.
- `/tmp/s044work` (fetches + computed JSON) was deleted after this report; commands above reproduce it.

Files written (absolute):
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS044.md
