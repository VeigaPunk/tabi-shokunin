# RevS118 — wave-2 falsification of S118 (round 30, tabi lane)

## Verdict

I attacked S118 — the round-30 row superseding S044, which re-locates the DevTools WebMCP model from the 404ing `front_end/panels/application/WebMCPModel.ts` to `front_end/models/web_mcp/WebMCPModel.ts` — by independently re-fetching every artifact it pins from Gitiles at both commits (`66df492aaa0129d090937e933dd44c5389ab24d2`, `bf69d041b0ad1f74730204a73bff29f3ef1d4ead`), re-hashing the decoded bytes against `corpus/evidence/round-30/s118/sha256sums.txt`, re-reading the anchor line ranges, and re-running the quote-contiguity check myself. **Verdict: holds.** All five legs reproduce: (1) `panels/application/WebMCPModel.ts` returns HTTP 404 at both commits; (2) `models/web_mcp/WebMCPModel.ts` decodes to 8,553 B, sha256 `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, byte-identical at both commits, with `invoke` at 128–139 (sends `toolName`/`frameId`/`input`, returns `response.invocationId`) and `toolResponded` at 249–258 (looks the call up by `params.invocationId`, dispatches `status`/`output`/`errorText`) exactly as the anchor and teaches state; (3) every committed digest matches my independent fetches byte-for-byte (two apparent mismatches resolved: the DEPS extract differs only by `NNN:` line-number prefixes, the 404 bodies only by Gitiles' per-request `request_id`); (4) Chromium tag `154.0.8037.97` DEPS line 424 pins `devtools_frontend_revision: '66df492aaa0129d090937e933dd44c5389ab24d2'`, and tag `156.0.8078.47` DEPS line 420 pins `bf69d041b0ad1f74730204a73bff29f3ef1d4ead`, confirming the "(M156)" label; (5) the Gate quote (`corpus/lessons/round-30.md:17`, 8 words, Model 249–250) and both supporting spans (Model 130–133, View 575–576) are contiguous and unique under whitespace collapse in the row's own committed bytes, satisfying QUALITY 74. **S068 (same-URL twin) needs no superseding row of its own**: its URL (`panels/application/WebMCPView.ts`) and View anchor (942–952) are live at both commits and its teaches holds from the byte-identical Model; the only stale element is the pathless `Model:249-257` cross-reference, which S118's row text and the lesson (:39) explicitly cover. Three low/info residuals below, none a defect in S118 itself.

## What I attacked

- S118 row (`corpus/SOURCES.md:132`): URL, anchor line ranges, decoded digests, "byte-identical at bf69d041", DEPS line 424 pin, supersedes text.
- The committed evidence `corpus/evidence/round-30/s118/` (19 files): do the digests describe bytes a fresh fetch actually returns?
- The lesson's S118 section (`corpus/lessons/round-30.md:39–53`): 404 claim, 85-entry directory claim, BUILD.gn/barrel quotes, Gate quote contiguity (QUALITY 74).
- The appended correction in `corpus/knowledge/webmcp-invocation-round-17.md:150–156` (cites S118 by id; span line-counts per QUALITY 78).
- The S068 coverage question (same-URL twin; round-29 spot-check defects 5 and 6).

## Fetch log (all read-only HTTPS GETs; UTC; status; bytes; sha256)

Served bytes are base64 TEXT/JSON responses except where noted; digests below are of the **decoded** bytes (what the row pins). Raw responses kept in `.ufo/waves/round-30/w2/RevS118/receipts/`.

| UTC (2026-10-26) | status | bytes | sha256 (decoded) | URL |
|---|---|---|---|---|
| 07:39:18Z | 404 | 233 (plain text) | `6ba4c5ff18d52faa157bb8c4891e3395812f3d25154447e1a4f338c763458ea2` | `…/devtools/devtools-frontend/+/66df492…d2/front_end/panels/application/WebMCPModel.ts?format=TEXT` |
| 07:39:19Z | 404 | 233 (plain text) | `19d136059138633803497cfb6403ce1981d8d7724d43f03561c5b022e80bad2c` | same at `+/bf69d041…ead/…` |
| 07:39:18Z | 200 | 8553 | `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` | `…/+/66df492…d2/front_end/models/web_mcp/WebMCPModel.ts?format=TEXT` |
| 07:39:19Z | 200 | 8553 | `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` | same at `+/bf69d041…ead/…` |
| 07:39:18Z | 200 | 13065 | `4c7e23a9e1e45d0e7b9dae71a3a9bd31f148379e711ae91b8fd87de581c9dace` | `…/+/66df492…d2/front_end/panels/application/?format=JSON` |
| 07:39:19Z | 200 | 13065 | `eb7c6752851f86658fe35c8df404069b1a32f2528ba1baaea7893a1b2f646866` | same at `+/bf69d041…ead/…` |
| 07:39:19Z | 200 | 646 | `97b8dc8f3718853eb052cad643d6b5bf4ea77922e3a4e5142bf916ae04cc36e5` | `…/+/66df492…d2/front_end/models/web_mcp/?format=JSON` |
| 07:39:20Z | 200 | 646 | `10582a8bf55597b141cced9076ebb6ed567a96b4c54fbc28031d3cb15983c36a` | same at `+/bf69d041…ead/…` |
| 07:39:18Z | 200 | 197649 | `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d` | `chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT` |
| 07:39:29Z | 200 | 59794 | `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` | `…/+/66df492…d2/front_end/panels/application/WebMCPView.ts?format=TEXT` |
| 07:39:30Z | 200 | 59879 | `189cb39436de3209d2f44a80c9193016d65f8db7d64c3db27b1c21708844db97` | same at `+/bf69d041…ead/…` |
| 07:40:30Z | 200 | 192396 | (not pinned by the row; used for the M156 pin check) | `chromium/src/+/refs/tags/156.0.8078.47/DEPS?format=TEXT` |
| 07:40:55Z | 200 | 1080 | `40c74fdb02a048182b71e41c2fe69a73e601b76418c1eea916157c451e30b6f4` | `…/+/66df492…d2/front_end/models/web_mcp/BUILD.gn?format=TEXT` |
| 07:40:56Z | 200 | 221 | `62e9d2487fa844b4b02a1186e3b8f4e1e0f67222b4a3ceebb937a83fc3e40b45` | `…/+/66df492…d2/front_end/models/web_mcp/web_mcp.ts?format=TEXT` |
| 07:40:57Z | 200 | 6687 | `fdacba9d65db9bec804391142bf93391eee01be87c2e6b6f87f5b8ec160dc271` | `…/+/66df492…d2/front_end/panels/application/BUILD.gn?format=TEXT` |

## Evidence, per leg

**Leg 1 — panels path 404.** `curl -sS -o … -w '%{http_code}'` on `…/front_end/panels/application/WebMCPModel.ts?format=TEXT` at both commits → `404`, 233 B, exit 0. Body is the Gitiles error page (`NOT_FOUND: Requested entity was not found … message: "Object is not found"`). Diff of my body vs the stored `NOT_FOUND…@66df492.b64`: only line 7, `request_id` (`3549b263…` vs `c7dd5a18…`; `367fa7f9…` vs `5fb9895b…` at bf69d041) — diff exit 1 on that line only. Directory listing `panels/application/?format=JSON`: 85 entries, zero matches for `WebMCPModel`; WebMCP-named entries are exactly `WebMCPTreeElement.ts`, `WebMCPView.test.ts`, `WebMCPView.ts` (plus `webMCPView.css`, lowercase, outside my grep pattern) — matches the lesson's 85-entry claim and the entry correction's four-file list.

**Leg 2 — Model path, anchors, teaches.** `models/web_mcp/WebMCPModel.ts?format=TEXT` at both commits → 200, decoded 8,553 B, sha256 `c23d575e…b632` at **both** — byte-identical, matching `sha256sums.txt` and the S118 row. Line reads (sed on my decoded bytes): 128 `async invoke(input: unknown): Promise<string|undefined> {` … 130–133 the `invoke_invokeTool({ toolName: this.name, frameId: this.#protocolTool.frameId, input, })` request … 138 `return response.invocationId;`, method closes at 139 — so 128–139 is the whole `invoke`, sending toolName/frameId/input and returning the invocationId, as the anchor and teaches state. 249 `toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void {`, 250 `const call = this.#calls.get(params.invocationId);`, … 257 `this.dispatchEventToListeners(Events.TOOL_RESPONDED, call);`, 258 `}` — the lookup-by-id and status/output/errorText dispatch, as stated. View anchors: 942–952 is the `onRunTool` handler that stores `this.#lastDevToolsInvocationId = await …tool.invoke(…) ?? null` (945) and finds the call by `c.invocationId === this.#lastDevToolsInvocationId` (948–949); 561–576 is the status/output/errorText rendering, with the lesson's 9-word span at 575–576. All match.

**Leg 3 — digests.** `cmp` of my eight decoded fetches against the stored evidence files: `WebMCPModel.ts@66df492`, `WebMCPModel.ts@bf69d041`, `WebMCPView.ts@66df492`, `WebMCPView.ts@bf69d041`, `models-web_mcp.dir@*.json`, `panels-application.dir@*.json` — all `IDENTICAL` (cmp exit 0). My independent fetches of `models/web_mcp/BUILD.gn` (`40c74fdb…`), `models/web_mcp/web_mcp.ts` (`62e9d248…`), `panels/application/BUILD.gn` (`fdacba9d…`) also match `sha256sums.txt`. The `DEPS.154.0.8037.97.lines420-425.txt` extract differs from my `sed -n '420,425p'` only by `NNN:` line-number prefixes (`diff` exit 1 on all six lines; after stripping prefixes, `diff` exit 0 — "IDENTICAL modulo line-number prefixes"). Lesson quotes verified in my fetched bytes: model BUILD.gn:12 `sources = [ "WebMCPModel.ts" ]`; barrel web_mcp.ts:5 `import * as WebMCPModel from './WebMCPModel.js';`; panel BUILD.gn: zero `WebMCPModel` mentions, lists `WebMCPTreeElement.ts` (:69), `WebMCPView.ts` (:70), `WebMCPView.test.ts` (:192) — "lists those and no model" holds.

**Leg 4 — DEPS pins.** Tag `154.0.8037.97` DEPS (decoded 197,649 B): line 424 `  'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` — the row's "DEPS line 424" is exact. Tag `156.0.8078.47` DEPS (decoded 192,396 B): line 420 pins `bf69d041b0ad1f74730204a73bff29f3ef1d4ead` — the "(M156)" label on bf69d041 is correct.

**Leg 5 — Gate quote contiguity (QUALITY 74).** My own Python re-check over the decoded bytes (whitespace-collapse, then `str.count` + regex-with-`\s+`-join over the raw text): the lesson :17 Gate quote `toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void { const call = this.#calls.get(params.invocationId);` → count=1, 8 words (Model 249–250); the lesson :42 span → count=1, 10 words (Model 130–133); the lesson :43 span → count=1, 9 words (View 575–576). All three contiguous and unique in the row's own committed bytes; the Gate quote grounds S118's own teaches (the toolResponded lookup). No span crosses a table line, C++ literal boundary, or ellipsis.

**S068 determination.** S068 (`corpus/SOURCES.md:82`) shares S044's URL (`panels/application/WebMCPView.ts`) — verified 200 at both commits with the pinned View digest — and its View anchor 942–952 reads as cited. Its teaches ("toolResponded carries invocationId for a known invocation") holds from the byte-identical Model (250). The only stale element is the anchor's pathless `Model:249-257` cross-reference, which under the directory-context reading (the reading round-29 spot-check defect 6 applied to S044) implies the 404 path; the line numbers themselves match the correct `models/web_mcp/WebMCPModel.ts` (249–257 = `toolResponded` through the dispatch). S118's supersedes text names S068 explicitly ("its twin S068"), and the lesson (:39) declares S068 "covered by the same correction (S118 teaches)". A separate superseding row for S068 would duplicate S118's bytes and correction for a row whose URL and primary anchor are intact — not required. S068 already supersedes S044, so S044 now has two successors (S068 for the correlation-policy reading, S118 for the corrected model path); no contradiction between them (S068's 249–257 and S118's 249–258 are both accurate ranges of the same method).

## Findings

No defect in S118 itself. Residuals, by severity:

- **Low — correction scope names one entry, two cite S044.** `corpus/lessons/round-30.md:53` says "The knowledge entry citing S044 (`corpus/knowledge/webmcp-invocation-round-17.md`) carries an appended round-30 anchor correction", but a second entry also names S044 in its `source:` header: `corpus/knowledge/source-recheck-round-18.md:1` (and its S044 receipt row :93 still shows the pathless `WebMCPModel.ts:128-139 and 249-258` anchor; its S068 verdict row :169 has no path). That entry carries no appended correction, so a reader following S068's used-by chain alone gets no pointer to S118. Documentation gap in the correction's stated scope, not in S118's content.
- **Info — loose wording in the lesson.** `corpus/lessons/round-30.md:39` "Same-URL twin S068 names the same path": S068's anchor names `Model:249-257` with no path and no filename; the wrong-path implication arises from directory context (the same reading defect 6 applied to S044). Substance correct; the sentence overstates what S068 literally names.
- **Info — stale relative pointer.** `corpus/lessons/round-30.md:40` says "see `receipts/quote-check.txt`"; the file is `corpus/evidence/round-30/s118/quote-check.txt` (no `receipts/` subdir exists under s118/ or lessons/). The pointer resolves only if read as "the receipts of that evidence dir".
- **Info — 404-body digests are single-response pins.** Gitiles 404 bodies embed a per-request `request_id`, so `NOT_FOUND.*.b64` digests will not reproduce byte-for-byte on refetch (my two bodies: `6ba4c5ff…`, `19d13605…` vs stored `1e2f8c7c…`, `4df7538f…`; all 233 B, differing only in `request_id`). The reproducible pins — decoded Model/View/listing/DEPS/BUILD.gn bytes — all matched. Worth knowing before any future refetch check treats the 404 digests as byte-reproducible.

## Commands run (with exit codes)

- `curl -sS -o <file> -w '%{http_code}' <url>` × 15 (fetch log above) — all exit 0; statuses as logged.
- `base64 -d <b64> > <ts>` then `wc -c` / `sha256sum` — exit 0.
- `cmp -s <mine> <stored>` × 8 → IDENTICAL (exit 0); `diff` on DEPS extract → exit 1 (prefixes), exit 0 after stripping — shown above.
- `diff <404 bodies>` × 2 → exit 1, sole hunk `request_id` — shown above.
- `grep -c 'WebMCPModel' <panels dir json>` → 0 (both commits); `grep -o '"name": ?"…WebMCP…"'` → the three .ts files; `grep -o '"name"' | wc -l` → 85.
- `sed -n '420,425p'` on both DEPS decodes → pin lines shown above.
- Python quote check (script in scratch, receipts copied) → three `count=1` results shown above.
- `git log --stat f7c0317e…dab..072af95…8e5 -- <s118 paths>` → footprint confirmed: SOURCES.md +1 row, s118 evidence dir 19 files, knowledge entry +6, lesson +130, QUALITY +55 (exit 0).

No tool installs were needed (curl, base64, python3, git present); nothing to record under the tooling authorization.

## Verification gaps

- I did not run lane gates (`check-sources.mjs`, `check-release-pins.mjs`, the C1/C2 counters) — out of my seat's scope; the S118 row's structural validity under those gates is left to the seats that own them.
- `bf69d041` identity rests on the 156.0.8078.47 DEPS pin (verified) plus wave-1's commit-listing fetch; I did not independently fetch `+/bf69d041?format=JSON` to read its commit message.
- Scratch `/fast/scratch/hyaku/tabi-r30/RevS118` cleaned after receipts were copied to `.ufo/waves/round-30/w2/RevS118/receipts/`.
