# Round-30 w1 — S044 superseding row (S118)

Seat `ExecS044Supersede`, lane `tabi`, frontier step, routed defect 6
(`corpus/lessons/round-29-verifier-spotcheck.md` §Routed defects). Scratch clone of the lane at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` under `/fast/scratch/hyaku/tabi-r30/ExecS044Supersede/`;
no lane tracked file, index or jj state touched (read-only `git status`/`ls-files` in the lane only).

## Verdict

Defect 6 is real and is a path error, not a line error. S044's anchor cites
`front_end/panels/application/WebMCPModel.ts:128-139, 249-258`; that path returns **HTTP 404** at
devtools `66df492aaa0129d090937e933dd44c5389ab24d2` (the commit Chromium tag 154.0.8037.97 pins at
`DEPS:424`) and at `bf69d041b0ad1f74730204a73bff29f3ef1d4ead` (M156), and the panel directory holds
85 entries with no model file. The code S044's `teaches` cell describes exists with **exactly those
line numbers** at `front_end/models/web_mcp/WebMCPModel.ts` (8,553 B, sha256
`c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, byte-identical at both commits):
`invoke` (128-139) posts `toolName`/`frameId`/`input` to `invoke_invokeTool` and returns
`response.invocationId`; `toolResponded` (249-258) looks that id up in `#calls` and dispatches with
`status`/`output`/`errorText`. The View half of S044's anchor (`WebMCPView.ts:942-945`, `561-576`) is
correct and textually unchanged at both commits. S068, the same-URL twin, states `Model:249-257` — the
same file and lines, correct, but with no directory — so it carries the ambiguity that made S044's
error survive, not a second false path; **one superseding row (S118) covers both**, because S068's own
claim (correlation is client policy, `toolResponded` carries the id) is unaffected. Delivered:
`S118-supersede-S044.patch` (against 061e620, applies clean), `S118-supersede-S044.on-lane-worktree.patch`
(rebased onto the lane's current uncommitted S116/S117 state, applies clean), `S118-row.txt`,
`gate-line.md`, `bytes/`, `receipts/`.

## What the two rows say today

`corpus/SOURCES.md:58` (S044, anchor cell):

> commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium tag 154.0.8037.97 DEPS line 424),
> WebMCPView.ts:942-945 and 561-576, WebMCPModel.ts:128-139 and 249-258

`corpus/SOURCES.md:82` (S068, anchor cell): `Chromium154 DEPS-pinned commit66df492…, View:942-952;
Model:249-257`.

Neither row's `source` URL is the model file: both cite the `WebMCPView.ts` GitHub blob. The model
path appears only in the anchor cell, so the defect was invisible to every URL-level check — which is
also why the round-18 recheck recorded a 200 for S044 (`source-recheck-round-18.md:93`, 59,794 B,
`4b2fce64c708`): it fetched the View, the only URL either row carries.

## Fetches (read-only HTTPS GETs; full table in `receipts/fetches.tsv`)

| UTC | status | bytes | sha256 | URL |
|---|---|---|---|---|
| 07:02:04Z | 200 | 13065 | `4c7e23a9…dace` | `…/+/66df492…/front_end/panels/application/?format=JSON` |
| 07:02:05Z | 200 | 13065 | `eb7c6752…6866` | `…/+/bf69d041/front_end/panels/application/?format=JSON` |
| 07:02:18Z | 200 | 79728 | `0d45d34d…1cf6` | `…/+/66df492…/front_end/panels/application/WebMCPView.ts?format=TEXT` (59,794 B decoded, 1,515 lines) |
| 07:02:19Z | 200 | 79840 | `3845bd4c…14a0` | same, at `bf69d041` |
| 07:02:46Z | 200 | 11404 | `19cdd53d…7ee6` | `…/+/66df492…/front_end/models/web_mcp/WebMCPModel.ts?format=TEXT` (8,553 B decoded) |
| 07:02:46Z | 200 | 11404 | `19cdd53d…7ee6` | same, at `bf69d041` (byte-identical) |
| 07:02:47Z | 200 | 646 | `97b8dc8f…36e5` | `…/+/66df492…/front_end/models/web_mcp/?format=JSON` |
| 07:05:00Z | 200 | 263532 | `643105b3…6e96` | `chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT` |
| 07:05:29Z | 200 | 8916 | `f9ebcc03…8f7a` | `…/+/66df492…/front_end/panels/application/BUILD.gn?format=TEXT` |
| 07:05:30Z | 200 | 1440 | `77976a41…8b22` | `…/+/66df492…/front_end/models/web_mcp/BUILD.gn?format=TEXT` |
| 07:05:44Z | 200 | 296 | `c59cdab8…438b` | `…/+/66df492…/front_end/models/web_mcp/web_mcp.ts?format=TEXT` |
| 07:06:11Z | **404** | 233 | `1e2f8c7c…e8d8` | `…/+/66df492…/front_end/panels/application/WebMCPModel.ts?format=TEXT` |
| 07:06:12Z | **404** | 233 | `4df7538f…1bc2` | same, at `bf69d041` |
| 07:06:13Z | **404** | 2171 | `ea11271d…de9b2` | same, HTML form (what a browser opens) |
| 07:09:03Z | 200 | 8553 | `c23d575e…b632` | `raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492…/front_end/models/web_mcp/WebMCPModel.ts` |
| 07:09:04Z | **404** | 14 | `d5558cd4…12ed` | `raw.githubusercontent.com/…/front_end/panels/application/WebMCPModel.ts` |

`07:05:30Z` `front_end/models.tar.gz` returned 404 (`9d39e2da…3362e`): Gitiles archive is disabled on
this host, so no whole-tree listing was obtained. Status-only probes for other candidate paths
(`front_end/models/webmcp/…`, `front_end/models/WebMCPModel.ts`) are in `receipts/probes.txt`, all 404.

## What the bytes prove

- **The cited directory has no model.** `panels-application.dir@66df492.json` and
  `…@bf69d041.json` (85 entries each) list `WebMCPTreeElement.ts`, `WebMCPView.test.ts`,
  `WebMCPView.ts`, `webMCPView.css` and no `WebMCPModel.ts`. `panels-application.BUILD.gn@66df492`
  lists `webMCPView.css`, `WebMCPTreeElement.ts`, `WebMCPView.ts` and the test — no model source.
- **The model is one directory over, under a different name.** `models-web_mcp.BUILD.gn@66df492:12`
  is `sources = [ "WebMCPModel.ts" ]`; `models-web_mcp.barrel.ts@66df492` is
  `import * as WebMCPModel from './WebMCPModel.js'; export { WebMCPModel, };` — the `WebMCP.WebMCPModel`
  namespace the View imports at line 21 (`import * as WebMCP from '../../models/web_mcp/web_mcp.js';`).
- **The line numbers were never wrong.** `WebMCPModel.ts:128-139` is the whole `invoke` method;
  `:249-258` is the whole `toolResponded` handler; `toolInvoked` is at `:230-247` and is what fills
  `#calls`. Nothing in the file moved between the two commits (identical sha256).
- **The tag↔commit pin holds.** `DEPS` at `refs/tags/154.0.8037.97`, line 424:
  `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` (committed as
  `bytes/DEPS.154.0.8037.97.lines420-425.txt`).
- **The View half of both anchors is intact.** At 66df492 `:942-945` is the `onRunTool` invoke and
  `:946-952` the `find(c => c.invocationId === this.#lastDevToolsInvocationId)` correlation; `:561-576`
  is the status icon/string cell plus the `output`/`errorText` cell. `diff` of those two ranges between
  66df492 and bf69d041 is empty (`view942_952_identical`, `view561_576_identical`); the two commits
  differ only at `:64` and `:1056`, both below the anchored ranges.

## Quotes (≤25 words, contiguous, located)

`receipts/quote-check.txt` (whitespace collapsed, `count=1`, line span reported):

- `WebMCPModel.ts:249-250` — "toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void { const
  call = this.#calls.get(params.invocationId);" (8 words) — correlation by a pre-seen id.
- `WebMCPModel.ts:130-133` — "const response = await target?.webMCPAgent().invoke_invokeTool({
  toolName: this.name, frameId: this.#protocolTool.frameId, input," (10 words) — the invoke request.
- `WebMCPView.ts:575-576` — "${call.result?.output !== undefined ? JSON.stringify(call.result.output)
  : call.result?.errorText ?? ''}" (9 words) — output/errorText rendering.

## Row draft — S118 (`S118-row.txt`, in the patch)

| cell | value |
|---|---|
| id | S118 |
| source | DevTools frontend WebMCP model — the invocation client behind the panel at the Chromium 154 revision — `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts` |
| kind | code |
| tier | A |
| scope | Chromium 154 shipped DevTools WebMCP invocation client: the invoke request the panel sends and the invocationId correlation it relies on, source-level |
| anchor | commit `66df492aaa0129d090937e933dd44c5389ab24d2` (Chromium tag 154.0.8037.97 DEPS line 424), `models/web_mcp/WebMCPModel.ts:128-139` and `249-258` (decoded sha256 `c23d575e…b632`), `panels/application/WebMCPView.ts:942-952` and `561-576` (decoded sha256 `4b2fce64…540f`); both files re-opened 2026-10-26, Model byte-identical at `bf69d041` |
| teaches | supersedes S044 — the invocationId the panel keeps is returned by `WebMCPModel.invoke` (128-139, toolName/frameId/input) and looked up again in `toolResponded` (249-258), so the model sits at `models/web_mcp/WebMCPModel.ts` and not at the `panels/application` path S044 and its twin S068 name, which returns 404 at 66df492 and at bf69d041 |
| status | mined |
| opened | 2026-10-26 |
| recheck | on-release |
| used-by | `corpus/knowledge/webmcp-invocation-round-17.md` |

`source` deliberately carries no `refs/tags/` string: S118 stays outside `check-release-pins.mjs`'s
population (which selects `on-release` rows whose source cell carries a Chromium Gitiles tag), so the
round-29 C3 reading is untouched and routed defect 5 (whether DEPS-pinned rows belong in counter v2)
stays open rather than being decided by this row.

## Gate line (`gate-line.md`, for `corpus/lessons/round-30.md` §Gate, after S117)

| S118 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | 2026-10-26T07:02:46Z (Gitiles TEXT, 11,404 B served / 8,553 B decoded, sha256 `c23d575e…b632`; directory listing 07:02:04Z) | `WebMCPModel.ts:249-250` "toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void { const call = this.#calls.get(params.invocationId);" |

`round-30.md` is owned by the C2 scribe seats and is uncommitted in the lane, so I did not patch it;
the row text above is the insertion.

## S068 — same defect, one row covers both

S068's anchor is `Chromium154 DEPS-pinned commit66df492…, View:942-952; Model:249-257`. Verified against
the bytes: `View:942-952` is the `onRunTool` block (correct), `Model:249-257` is `toolResponded` through
its dispatch line (correct, closing brace at 258). What is missing is the directory — and that omission
is what let S044's wrong directory stand unexamined, since S068 reads as confirming "Model" at
"249-257". So S068 is under-specified rather than false. One row suffices: S118's anchor names both
files with their real directories and lines, and its `teaches` names S068 explicitly, so S068's
`Model:249-257` now resolves to `models/web_mcp/WebMCPModel.ts:249-258` through S118. S068's own claim
(correlation is client policy; `toolResponded` carries the id for a known invocation) is unchanged by
the path fix and needs no new row. If the L1 wants S068 formally superseded as well, that needs a second
row (`supersedes S068 —`) — CORPUS rule 2 forbids editing S068's anchor in place, and no gate requires it.

## Changes proposed (patch contents)

1. `corpus/SOURCES.md` — one appended row (S118) after S115, before `## Paths`. 13 pipe-fields, 11 cells.
2. `corpus/knowledge/webmcp-invocation-round-17.md` — `source: S118` added after `source: S044` (the
   entry whose claim rests on this source), and one appended section "Round-30 anchor correction
   (2026-10-26; append-only)" stating the 404, the real path, the digests and the row id. The entry
   already carries round-29 append-only sections, so this follows its own convention. This edit is what
   makes S118's `used-by` true (`check-sources.mjs` requires the row id to appear in each used-by file).

No other row's `status`/`recheck`/`used-by` was changed; S044 and S068 stay `mined` with their existing
used-by, per CORPUS rule 2 (a correction is a new row, not an in-place rewrite).

## Commands run and exit codes

```
git clone --shared <lane> "$S/clone" && git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
  -> HEAD 061e62024c0523d3c6c7e819506a773ff2cd7d75; git status --porcelain | wc -l = 0
curl -sS -o <file> -w '%{http_code}' <gitiles url>      (17 GETs; statuses/bytes/sha256 in receipts/fetches.tsv)
base64 -d <file>.b64 > <file>.ts && sha256sum <file>.ts  -> digests in bytes/sha256sums.txt
python3 <quote checker>                                  -> receipts/quote-check.txt (count=1 per quote; lines 249-250, 130-133, 575-576)
diff <(sed -n '942,952p' view-66.ts) <(sed -n '942,952p' view-bf.ts)   -> exit 0 (identical)
diff <(sed -n '561,576p' view-66.ts) <(sed -n '561,576p' view-bf.ts)   -> exit 0 (identical)
cmp raw-front_end_models_web_mcp_WebMCPModel.ts model-66.ts             -> exit 0 (Gitiles decode == raw host bytes)
node scripts/check-sources.mjs --root .                                 -> exit 0, rows=116, findings=0 (clone, patch applied)
git -C "$S/clone" diff 061e62024c0523d3c6c7e819506a773ff2cd7d75        -> exit 0, S118-supersede-S044.patch (32 lines)
  (the clone inherits diff.mnemonicprefix=true, so the raw diff emits c/ … w/; headers were
   rewritten to a/ … b/ with no content change, then re-verified)
git apply --check <patch> in a pristine 061e620 tree                    -> exit 0
git apply <patch> in that tree; diff -q both files vs the clone          -> exit 0; exit 0 (reproduces the edits)
node scripts/check-sources.mjs --root <that applied tree>               -> exit 0, rows=116, findings=0
git apply --check <patch> against the lane worktree snapshot            -> exit 1 (corpus/SOURCES.md:127; S116/S117 in flight)
git apply --check <on-lane patch> / git apply <on-lane patch>           -> exit 0 / exit 0
node scripts/check-sources.mjs --root <pristine+laneworktree+S118>      -> exit 1, findings=2, both S116/S117 used-by
                                                                           (C2 entries absent from that tree); none for S118
```

Full log: `receipts/patch-checks.txt`, `receipts/check-sources-clone.txt`.

## Evidence retained (`ExecS044Supersede/`)

- `S118-supersede-S044.patch` (against 061e620), `S118-supersede-S044.on-lane-worktree.patch`,
  `S118-row.txt`, `gate-line.md`
- `bytes/`: decoded `WebMCPModel.ts` and `WebMCPView.ts` at both commits, both directory listings, both
  BUILD.gn files, the `web_mcp.ts` barrel, the two 404 bodies (Gitiles TEXT, both commits; plus the HTML
  form), the raw-host model and its 404, the DEPS extract, `sha256sums.txt`
- `receipts/`: `fetches.tsv`, `probes.txt`, `quote-check.txt`, `patch-checks.txt`,
  `check-sources-clone.txt`

## Risks / notes for the L1

1. **Patch ordering.** `S118-supersede-S044.patch` is diffed against 061e620 as the contract requires and
   therefore lands its row immediately after S115. The lane worktree already holds the C2 rows S116/S117
   at that spot, so that hunk conflicts by construction. Use
   `S118-supersede-S044.on-lane-worktree.patch` (verified `git apply` clean against a snapshot of the
   lane at 07:0xZ) or insert `S118-row.txt` after S117 by hand. Final registry order: S116, S117, S118.
   The knowledge-entry hunk is conflict-free (the lane's file is byte-identical to the freeze revision).
2. **used-by edit.** S118's `used-by` is `corpus/knowledge/webmcp-invocation-round-17.md` because that
   entry's claim rests on this source; the patch adds `source: S118` and an append-only correction
   section there. Without that edit `check-sources.mjs` reports `used_by_uncited` for S118. The entry's
   `source:` header gains a line — the same pattern the file already uses (one line per row).
3. **Row count.** The registry goes 115 → 116 rows at freeze (118 once S116/S117 land). Any census line
   quoted in a round-30 report must be a fresh byte-exact capture (round-28 spotcheck finding (b)).
4. **Not run** (parent's post-integration gate): `check-release-pins.mjs --stable 156.0.8078.47`,
   `check-gate-mutants.mjs`, `check-frontier-admission.mjs`, `check-selfassessment.mjs`,
   `check-gate-registry.mjs`, `check-s106-evidence.mjs`, `sources-census.sh validate`. By rule reading,
   S118 does not enter the release-pin population (no `refs/tags/` in its source cell) and adds no gate
   row, so none of them should move; that is a reading, not a measurement.
5. **Tree-wide uniqueness of `WebMCPModel.ts` is not proven.** Gitiles archive is 404 on this host, so I
   could not enumerate the whole tree. What is proven: the panel directory has no model file, the
   `models/web_mcp` directory does, its BUILD.gn and barrel name it, and the View imports the module
   from `models/web_mcp/web_mcp.js`. The row's anchor names paths, so uniqueness is not load-bearing.
6. **No tooling installed**; nothing was upgraded. No credentials, cookies, logins or API calls; all
   network traffic was read-only GETs of public Gitiles and raw-GitHub source.
