VERDICT: PASS

# LiveS036 — C1 receipt S036, independent recheck (round-18 wave 2)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Candidate REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (== `refs/heads/master` == HEAD; `git status --porcelain` = `?? .ufo/waves/round-18/w2/` only — no lane writes by this seat)
Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
Observed at `2026-10-20T20:02Z` (`date -u`); curl 8.23.0, node v24.21.0.

Inputs read: `.ufo/waves/round-18/PLAN.md:15-21`; `corpus/lessons/round-18.md:10-16`;
`corpus/SOURCES.md:50` (row S036 at REV); `corpus/lessons/round-16.md:46` (original quote source);
`corpus/evidence/round-18/source-recheck/S036.json`; `S036.excerpt.txt`;
`corpus/knowledge/source-recheck-round-18.md:86,110,114,140-141`;
`.ufo/waves/round-18/recheck-fetch.mjs`; `.ufo/waves/round-18/measure-c1.mjs`.

Binding digests observed:
- producer at REV = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equals `S036.json:24`.
- receipt at REV = `2a31766c629a08de2172f727664d3a57063db523602cb009458aa27d69359822` (file sha256 at `530f40a`).
- excerpt at REV = `03cf337dd372b7f9f554d7db7d553cec9e92d5d3e5ee1a8009dc298897cc7912`, equals `S036.json:19` and the working-tree file.

## 1. Re-fetch (independent, private /tmp)

Exact argv used (the UA is one argument, matching `recheck-fetch.mjs:95`):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts'
```

Observed, exit 0:

```
HTTP=200 SIZE=2436 URL=https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts
c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632  body
8553 body
body: JavaScript source, ASCII text
```

Compared with the receipt (`S036.json:5,8,9,10,11`): URL exact; `httpStatus` 200 exact; `bytes` 8553 exact; `sha256` exact; `decode: none` correct. Exact body equality is expected here because the URL names a commit; it is not evidence of live product behaviour (see F1).

`SIZE=2436` is the compressed transfer from `--compressed`; the recorded `bytes`/`sha256` are the decompressed file. The receipt does not label the distinction (F3).

## 2. Quote location and excerpt derivation

Quote (`S036.json:13`): `if (executionContext.isDefault && executionContext.frameId) {`

- Raw body: line **194** (1-based), first byte offset **6080**, exactly **1** occurrence.
- Producer normalizer reimplemented independently (NFC, curly quotes/dashes folded, NBSP→space, `\s+`→space, trim): normalized length **7650**, quote index **5485**, matches `quoteOffset` (`S036.json:17`); one occurrence.
- `quoteWords` 5 equals the whitespace word count; ≤25 holds.
- Excerpt: 1262 bytes, sha256 `03cf337d…c7912`. `norm(excerpt) == norm(body)[4885:6146]` exactly, i.e. 600 chars before + quote + 600 chars after, plus the producer's trailing newline — the derivation at `recheck-fetch.mjs:106-109`. The quote occurs in the excerpt.
- `corpus/lessons/round-16.md:46` contains the same quote and says “line 194”; the observed raw line is 194. Anchor quote held.

The quote is the guard line of the handler; the removal semantics are at lines 196-199 and the protocol-event path at 204-214 (see F2).

## 3. Source identity and anchor: HELD

- Row at REV: `corpus/SOURCES.md:50`. `rowUrl` occurs verbatim in the row's `source` cell; S036 is not in the superseded set.
- Chromium tag DEPS: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT` → HTTP 200; decoded 197649 bytes, sha256 `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d`.
  - line 424 is exactly `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',`
  - line 2216 maps `src/third_party/devtools-frontend/src` to `…/devtools/devtools-frontend` @ `Var('devtools_frontend_revision')`.
- Independent mirror: `https://chromium.googlesource.com/devtools/devtools-frontend/+/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts?format=TEXT` → HTTP 200; 8553 bytes, sha256 `c23d575e…b632`, byte-identical to the raw.githubusercontent body.
- Row URL (GitHub blob page) → HTTP 200, 425289 bytes, title/`refInfo.currentOid` carry `66df492aaa0129d090937e933dd44c5389ab24d2` and the path; SSR line cell `data-line-number="194"` is present. Dynamic HTML is not compared byte-wise.
- Chronology: `fetchedAt` `2026-10-20T19:06:20.744Z`; receipt mtime `2026-10-20 16:06:20.744780191 -0300` (= 19:06:20Z); REV commit created `16:58:00 -0300` (= 19:58:00Z). Fetch precedes commit by 51m40s; no future timestamp.

Verdict: source identity held, anchor held (commit pin, line 194, sha256), no drift, reachable. No alternative rendering was needed for the quote; the mirror was used only to confirm identity.

## 4. Does the quote/excerpt support the `teaches`?

Row teaches (`corpus/SOURCES.md:50`): “The frontend drops a frame's tools when its default execution context is destroyed, so navigation removal is inferred, not sent as toolsRemoved”.

Observed in the fetched body:

```
192  #executionContextDestroyed(event: …<SDK.RuntimeModel.ExecutionContext>): void {
193    const executionContext = event.data;
194    if (executionContext.isDefault && executionContext.frameId) {
195      const frameTools = this.#tools.get(executionContext.frameId);
196      if (frameTools) {
197        const toolsToRemove = [...frameTools.values()];
198        this.#tools.delete(executionContext.frameId);
199        this.dispatchEventToListeners(Events.TOOLS_REMOVED, toolsToRemove);
204  toolsRemoved(params: Protocol.WebMCP.ToolsRemovedEvent): void {
213    this.dispatchEventToListeners(Events.TOOLS_REMOVED, deletedTools);
```

- Clause 1 (“drops a frame's tools when its default execution context is destroyed”) is directly supported by 194-199, all inside the excerpt.
- The **quote alone** is only the guard; it contains no deletion/dispatch verb. Quote-level support for the teaches is partial; excerpt-level support for clause 1 is sufficient.
- Clause 2 (“not sent as toolsRemoved”, scoped to navigation) is **not established by this file**: the same file has an inbound `toolsRemoved` protocol handler (204), and `WebMCP.pdl` at the tag defines `event toolsRemoved` (`WebMCP.pdl:91-95`). The absence-on-navigation fact is a backend property. Bounded backend check at the 154 tag:
  - `inspector_web_mcp_agent.cc:178-191` emits `GetFrontend()->toolsRemoved(...)`; file sha256 `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` (8585 B).
  - `model_context.cc:495` is the only `probe::WebMCPToolRemoved(...)` call in that file (sha256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`, 50117 B); the only caller of `UnregisterTool` in that file is `ToolUnregisterAbortAlgorithm::Run` at `:228` (abort-signal removal).
  - `model_context_supplement.cc` (1665 B, sha256 `9c04bf35…5d96`) has no document-teardown hook.
  - `WebMCP.pdl` body sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` (3969 B) — identical to S041's recorded digest prefix `26e62f29…37ff`, cross-checking the tag fetch.
  This supports “explicit removal sends the event; navigation does not” at 154, matching `corpus/knowledge/webmcp-chromium-loopback-round-16.md:62`. It is **external to S036's evidence**.
- Verdict: `teachesVerdict: held` is substantively correct at the 154 tag. The S036 row's citation alone covers clause 1 and the inference mechanism, not clause 2 (F2).

## 5. Findings

### F1 — Claim boundary: 12 of the 51 credited receipts are immutable-pinned, S036 among them
- `PLAN.md:15` says “Source rows re-verified against their **live source**” and counts 51. The metric axis is freshness.
- `S036.json:5` fetches `/66df492a…/` — a git commit object; `SOURCES.md:50` is a `/blob/66df492a…/` URL. The counter's own `isPinnedUrl` (`measure-c1.mjs:247-251`) classifies such URLs `immutable_pinned`; `urlClass` at `:254-260`.
- Applying those exact regexes to the 51 receipt rows gives **12 immutable_pinned** (S033, S034, S036, S037, S041, S042, S043, S044, S045, S046, S055, S056), **38 living_live**, **1 own_work** (S029). The counter's all-row classes at REV are 17/46/1 (output below), and at B 14/42/1.
- Finite counterexample: for S036 the only ways the 2026-10-20 `held` verdict can change are a 404/transport failure or a repository-history rewrite; no content edit at a fixed commit is observable. An HTTP 200 of a fixed git object therefore verifies availability/integrity of a frozen artifact, not live product freshness. A reader moving `freshness` on the strength of “51” would over-read 12 receipts.
- Mitigations already in the tree: `corpus/lessons/round-18.md:12-14` (“C1 counts … recheck receipts, not … current product support”; S029 explicitly hygiene), `source-recheck-round-18.md:110` (S036 listed as pinned), `:140-141` (quote presence ≠ claim truth; “the 51 rows are not a statement of current live product support”), and the counter's `freshness_scope` string (`measure-c1.mjs:471`). This is a claim-labeling boundary, not a rejected receipt. Recommendation: report `51 = 38 living + 12 pinned + 1 own-work` alongside `c1_rows_rechecked`; or treat pinned re-opens as integrity and count only living-source rows toward freshness.
- Secondary wording note: `PLAN.md:16` targets “51 = every row not superseded at B”, but the counter's `eligible_rows` at REV is 58 because S058–S064 were added this round. The 7 new rows are outside the B target and have no receipts by design; the measurement output should say so to avoid a 51/58 misread.

### F2 — Evidence scope: the quote is a guard; “not sent as toolsRemoved” is external
- `S036.json:13` quotes only `if (executionContext.isDefault && executionContext.frameId) {`; `S036.json:22` asserts the deletion/dispatch and “not protocol-sent”.
- The quote does not contain the claim's verb or object; the deletion/dispatch is in the excerpt at body lines 196-199. A quote-only reader cannot verify the teaches.
- Finite counterexample to the universal reading of “not sent”: explicit removal via the `registerTool` abort signal calls `UnregisterTool` (`model_context.cc:228`), which probes removal at `:495` and sends `toolsRemoved` at `inspector_web_mcp_agent.cc:190`. So removal **is** sent on that path; only the navigation path is event-free. The navigation-scoped conclusion needs the backend call-site evidence plus the EC-destruction invariant, not S036 alone.
- No drift: the excerpt's clause 1 is exact and the navigation claim is confirmed at the tag. Recommendation: cite `S042`/backend (or `note:62`) in the row's anchor for clause 2, or narrow the teaches to “the frontend infers navigation removal from ExecutionContextDestroyed”; optionally quote the dispatch line instead of the guard.

### F3 — Reproducibility nits (not truth defects)
- The recorded `command` (`S036.json:7`) is not shell-replayable: the producer joins argv with spaces (`recheck-fetch.mjs:98`), so `-A Mozilla/5.0 (X11; …` is unquoted. Literal replay observed: `bash: -c: line 1: syntax error near unexpected token '('`, exit 2. The real spawnSync argv (`:95`) is correct.
- `bytes` is the decompressed body while `--compressed` makes curl's transfer size 2436; the receipt does not state that. The counter's `expectedCurlCommand` (`measure-c1.mjs:233-235`) reproduces the same unquoted join, so the receipt is accepted; only replay-by-hand is affected.

## 6. S029 secondary check (own-work, `git show`, no network)

- `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json` → exit 0, 97073 bytes, sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, equal to `S029.json` `sha256`/`bytes`.
- Quote: 17 words, normalized index **74695** = `quoteOffset`; excerpt 1382 bytes, sha256 `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` = `excerptSha256`; `norm(excerpt) == norm(window).lstrip()` (the window starts with a space, trimmed by normalization). Derivation matches `measure-c1.mjs:238-245`.
- The same blob digest is served at B and at REV, so `anchorObserved` “byte-identical at lane tip 2bff864…” holds. It is hygiene, not live freshness, as `corpus/lessons/round-18.md:14` states.

## 7. Counter observations (read-only)

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}

node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":0,"eligible_rows":51,"held":0,"drift_superseded":0,"own_work":0,"row_classes":{"kind":{"code":10,"community":5,"docs":32,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":42,"queued":8,"rejected":7},"url":{"immutable_pinned":14,"living_live":42,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

The S036 receipt is accepted at REV (`rejected: []`). The producer itself was not run; these are the counter and independent fetches only.

## 8. Limits

- S036 is commit-pinned and static: exact body equality is expected and is not a product-freshness measurement. Only C1's own “recheck receipt” scope is tested.
- The GitHub blob page is dynamic; only title/`refInfo`/`currentOid`/line-194 cell were checked, not byte equality.
- The backend emission check is bounded to `model_context.cc`, `inspector_web_mcp_agent.cc`, `model_context_supplement.cc`, and `WebMCP.pdl` at tag 154.0.8037.97; it is not a whole-tree grep.
- The normalizer was reimplemented in Python; the body is ASCII, so JS UTF-16 vs Python code-point offsets coincide (both 5485).
- No browser, no WebMCP invocation, no product runtime was used. No tool was installed or upgraded.
- Temp dir `/tmp/tabi-r18-s036` was removed after this report; all commands and digests above reproduce the evidence.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS036.md`
