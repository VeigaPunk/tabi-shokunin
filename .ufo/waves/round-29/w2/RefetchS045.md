# Refetch S045 — C3 independent re-fetch and attack (wave w2, round 29)

- Seat: `RefetchS045` (leaf; no subagent dispatch, no `agent://all`)
- Milestone: C3 (freshness)
- Lane tip under test: `32008a453737a27f69e9ab401d0b9775d2a944f7` (branch `master`), measured in a clean `git clone --shared` (porcelain empty, `rev-parse HEAD` = the tip)
- Registry row: `corpus/SOURCES.md:59` (`S045`, `recheck=on-release`, pinned `refs/tags/154.0.8037.97/`)
- Receipt entry: `corpus/evidence/round-29/release-pins/receipt.json` → `rows[id=S045]`, `fetched_by: "PinS045"`, `fetched_at: 2026-10-26T04:23:25Z`, `superseded_by: null`
- Counter: `scripts/check-release-pins.mjs` at the tip
- Deliverable: `.ufo/waves/round-29/w2/refetch/S045.json` (values computed from **my** fetch, not copied from the receipt); raw digests/statuses, both counter runs and the subset fixtures also recorded in `.ufo/waves/round-29/w2/refetch/RefetchS045.evidence.txt`

## Bottom line

| Question | Answer |
|---|---|
| 3/3 files agree with the receipt's `new_status`/`new_sha256` at 156 | **yes** |
| 3/3 files agree with the receipt's `old_sha256` at 154 (bytes authenticity) | **yes** (also byte-identical: `cmp` clean) |
| Row verdict reproduced | **`holds`** — matches the counter; with my refetch installed the real counter returns `resolved: true, reasons: []` |
| Filing complete w.r.t. the row's **anchor** cell | yes (3 files, 4 ranges, all cited, nothing extra) |
| Filing complete w.r.t. the row's **teaches** cell | **no** — one teaches clause has an upstream witness file that is neither cited nor filed (finding A) |
| Counter rejects subset filing | **no** — dropping the anchor-cited `:113` range, or 2 of 3 cited files, still resolves (finding B) |
| Change outside an anchored block that alters what teaches asserts | **yes** — dispatch target moved window → `document.modelContext`; input argument JSON-string → object/absent (finding C); recorded in the knowledge recheck note, whose line citation is wrong (finding D) |

No fabrication: every digest below was produced from bytes I fetched in this seat (`curl` → `?format=TEXT` → `base64 -d` → `sha256sum`).

## 1. My fetch (156.0.8078.47) vs receipt `new_*`

Commands (all from scratch dir `$S=/fast/scratch/hyaku/tabi-r29/RefetchS045`):

```
for tag in 154.0.8037.97 156.0.8078.47; do for p in <3 paths>; do
  code=$(curl -sS --max-time 60 -o "fetch/$tag.$b.b64" -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/$tag/$p?format=TEXT")
  base64 -d "fetch/$tag.$b.b64" > "fetch/$tag.$b.raw"; done; done          # exit 0
```

HTTP statuses, this seat: `200 154` ×3, `200 156` ×3. No 404 body was fetched, so the S094 `request_id` normalisation does not apply to S045; `grep -c request_id fetch/*.raw` → 0 hits in all six bodies, i.e. **raw sha256 == normalised sha256** for every file.

| path | 156 status (mine) | my 156 sha256 | receipt `new_sha256` | agree | 154 status (mine) | my 154 sha256 | receipt `old_sha256` | agree |
|---|---|---|---|---|---|---|---|---|
| `third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html` | 200 | `bf847908421e81d2903cb23de9fc4d66eda2681dabf66436803a48912dd60c67` | `bf847908…60c67` | **yes** | 200 | `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e` | `faf6e488…2c8e` | **yes** |
| `third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js` | 200 | `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` | same | **yes** | 200 | `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` | same | **yes** |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | 200 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | `f386bcfd…6f99f` | **yes** | 200 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `26e62f29…a37ff` | **yes** |

`cmp` of all six committed blobs at the tip (`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`) against my decoded bytes: `IDENTICAL` ×6. Sizes/lines: abort 8013 B/205 lines → 9519 B/235 lines; invoke-tool 2782 B/88 → 2782 B/88 (identical file, both tags); WebMCP.pdl 3969 B/123 → 4126 B/125.

Deliverable written: `.ufo/waves/round-29/w2/refetch/S045.json` — `{"id":"S045","seat":"RefetchS045","fetched_at":"2026-10-26T05:10:07Z","files":[...3, tag 156.0.8078.47, status 200, sha256 = my digests...]}`, `seat != entry.fetched_by` (`PinS045`), which is the f6 independence condition.

## 2. Verdict recomputed with the counter's own code

Rule (`scripts/check-release-pins.mjs`): per file, each range's old lines (trimmed, inner whitespace collapsed) must occur as one contiguous block anywhere in the new normalised lines; a row holds iff every file holds.

- Anchors in the 154 bytes: `:87` = `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);`; `:113` = `assert_equals(executionRejectionValue, 'already aborted');`; `invoke-tool.js:38-51` = the `invokeTool` → `invocationId` echo block; `WebMCP.pdl:68` = `      # Unique identifier for this invocation. Response is sent before tool events.`
- Both html anchor lines survive verbatim at 156 (`:87`→`156:108`, `:113`→`156:143`, each occurring once); `invoke-tool.js` is byte-identical; `WebMCP.pdl:68` text survives at `156:70`.
- ⇒ own verdict: **holds**, for all three files.

Counter runs (real code, no re-implementation):

```
# (a) at the lane tip, receipt committed, no refetch record committed yet
$ node scripts/check-release-pins.mjs --rev 32008a45 --stable 156.0.8078.47 --json   # exit=1
{population:23, resolved:0, unresolved:23, holds:0, drifted:0}
S045: {"resolved":false,"verdict":null,"reasons":["f6-refetch …executeTool-abort.https.html",
      "f6-refetch …invoke-tool.js","f6-refetch …WebMCP.pdl"]}          # `git ls-tree` → refetch/ is empty at the tip

# (b) same counter, fixture repo D (git init under $S; full lane SOURCES.md copied verbatim,
#     S045 receipt entry jq-extracted verbatim, the 6 committed byte files copied, my S045.json added), commit REV=1b8f74e7…
$ node scripts/check-release-pins.mjs --repo "$D" --rev "$REV" --stable 156.0.8078.47 --json   # exit=1
{population:23, resolved:1, unresolved:22, holds:1, drifted:0}
S045: {"resolved":true,"verdict":"holds","reasons":[]}
```

(`POPULATION=23` and `exit=1` in (b) are the 22 still unrefetched rows; S045 is the only resolved one.) So: **verdict agreement = yes**, and the entry becomes resolvable exactly when an independent seat's refetch with the receipt's 156 digests exists.

## 3. ±25-line window around each anchored block in the 156 bytes

### `executeTool-abort.https.html`, anchor `:87` (154 87 → 156 108)

Content that changes **outside** the anchored line inside the window, and does alter what the teaches cell asserts:

- `window.addEventListener('toolactivated', …)` → `document.modelContext.addEventListener('toolactivated', modelContextHandler)` (156 :49) + `t.add_cleanup(() => document.modelContext.removeEventListener('toolactivated', modelContextHandler))` (156 :50). Same for `'toolcancel'` (156 :86-87). The event **dispatch target changed** from `window` to `ModelContext`.
- New assertions pinning the new contract: `assert_equals(modelContextEvents.length, 1)`, `assert_true(modelContextEvent instanceof ToolActivatedEvent, 'toolactivated dispatched at the ModelContext is a ToolActivatedEvent')`, `assert_equals(modelContextEvent.target, document.modelContext)` (156 :92-97); `ToolCancelEvent` + `toolName` + `target === document.modelContext` (156 :111-116); `assert_array_equals(modelContextEvents, [modelContextEvent], 'toolactivated is dispatched once per execution')` (156 :109).
- `document.modelContext.executeTool(tool, '{}')` → `document.modelContext.executeTool(tool)` (154:26 → 156:26) and `executeTool(tool, '{}', {signal…})` → `executeTool(tool, {}, {signal…})` (154:66 → 156:73, 154:106 → 156:136, 154:136 → 156:166, 154:187 → 156:217, 154:188 → 156:218). The **second argument changed from a JSON string to an object, or is omitted entirely** — a page-API call-shape change.

Still true in the window: `assert_equals(executionRejectionValue, 'custom cancellation reason')` (156 :118) and `'toolcancel'` in the ordered `events` array (the anchored line) — so teaches clauses 1 and 2 survive; teaches clause 3 (see finding A) has no witness in this file at either tag (`grep -c unregister` = 0).

### `executeTool-abort.https.html`, anchor `:113` (154 113 → 156 143)

Only `'{}'`→`{}` at 156 :136 and the re-numbering; the anchored assertion is unchanged.

### `invoke-tool.js:38-51`, anchor block

File is byte-identical at both tags (`4fc851…`): no change in or around the block.

### `WebMCP.pdl:68`, anchor line

The anchored comment survives verbatim but **relocated 68 → 70** (156 :70), and the file gained, outside the block, `# If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.` + `optional boolean debugging` (156 :22-23). This is a protocol-surface addition on the tool descriptor, not on `invokeTool`'s return, so the teaches clause "CDP invokeTool returns an invocationId that toolResponded echoes" is untouched. Note the residual hazard: `WebMCP.pdl:68` in the registry now points at `object input`, a **line that says something else**.

## 4. Attack findings

### A. Filing is complete for the anchor cell but incomplete for the teaches cell (false-provenance, unfiled witness)

The teaches cell (`SOURCES.md:59` col 7) makes three assertions:

1. caller abort rejects with the caller's reason — witnessed by `executeTool-abort.https.html` (filed).
2. fires `toolcancel` — witnessed by the same file (filed).
3. **"unregistering mid-execution still resolves"** — *not* witnessed by any filed file: `grep -c 'unregister'` over all six fetched bodies (3 files × 2 tags) is `0`. Its witnesses are two upstream files in the same directory that the anchor cell never names and the receipt never files:
   - `third_party/blink/web_tests/external/wpt/webmcp/imperative/unregister-during-executeTool.https.html` — titles `'Pending executeTool() Promise resolves successfully when the target cross-origin tool is unregistered mid-execution'` (156 :86) and `'… when target same-document tool is unregistered mid-execution'` (156 :122); 154 `2515eb03…` → 156 `7ff3d767…`, changed at 156 :56 and :106 (`executeTool(tool, '{}')` → `executeTool(tool)`).
   - `…/executeTool-unregister-resolution-race.https.html` — `'executeTool resolves successfully even when tool is unregistered synchronously after its promise resolves'`; 154 `23e6ed83…` → 156 `1bc242b3…`, changed at 156 :33 (`'{}'` dropped), assertion `assert_equals(result, '{"status":"resolved"}')` unchanged.

So the row's "resolves on unregistration" recall is *still true* at 156, but the row asserts it while its filed evidence cannot show it — and one of the two real witnesses did change in the call shape the row's other files also changed. The counter cannot see this: it only walks `entry.files`.

### B. The counter accepts subset filing — demonstrated on the real code, on this row

Two fixtures built exactly like (b) above but with the S045 entry narrowed (same SOURCES.md, same bytes, same refetch seat):

```
# drop the anchor-cited `:113` range:  ranges [[87,87],[113,113]] -> [[87,87]]
$ node scripts/check-release-pins.mjs --repo "$D" --rev "$REV" --stable 156.0.8078.47 --json
{"population":23,"resolved":1,"unresolved":22,"rows":[{"id":"S045","resolved":true,"verdict":"holds","reasons":[]}]}

# drop two of the three anchor-cited files (keep only executeTool-abort; refetch lists only it)
$ node scripts/check-release-pins.mjs --repo "$D" --rev "$REV" --stable 156.0.8078.47 --json
{"population":23,"resolved":1,"unresolved":22,"rows":[{"id":"S045","resolved":true,"verdict":"holds","reasons":[]}]}
```

`f4-ranges` only asks that every **filed** range be named in the anchor; nothing requires every anchor-cited range/file to be filed. Consequence for C3: `unresolved=0` is reachable while an anchor's cited assertions are silently unfiled — the exact weakness the wave-1 note predicted, confirmed by execution rather than by reading.

### C. Row `holds` although the cited lines' contract changed

`executeTool-abort.https.html` grew 205 → 235 lines; both anchored lines survive verbatim while the surrounding test now asserts `ToolActivatedEvent`/`ToolCancelEvent` **dispatched at `document.modelContext`** with `target === document.modelContext` (156 :92-97, :111-116) instead of `window`, and calls `executeTool(tool, {}, …)` / `executeTool(tool)` instead of the JSON string `'{}'`. The anchored lines are single lines, so `blockIn` over one line is satisfied by any relocation; `holds` here witnesses that two strings still exist, not that the row's reading of the file still describes the file. This is a *trade*, not a counter bug per se: the row's `source`/`teaches` are build-scoped to tag 154 and the knowledge entry records the drift. It becomes a defect only if a reader takes `holds` as "the 154 reading is the 156 reading" — which is what a freshness counter invites.

### D. The committed recheck note that carries this drift has a wrong line citation

`corpus/knowledge/webmcp-invocation-round-17.md:146` states "154:87 → 156:108, 154:113 → **156:134**". `:87`→`156:108` is correct; `:113` is at **`156:143`** (`grep -n "assert_equals(executionRejectionValue, 'already aborted')"` → `143`, single occurrence). `156:134` is `const signal = AbortSignal.abort('already aborted');`, i.e. the statement *before* the anchor. The note also says 156 "calls `executeTool(tool, {})` with an object" while the first test now calls `executeTool(tool)` with the argument **absent** (154:26 → 156:26) — a third call shape, not the object form. Nothing in the counter reads the note, so a wrong citation in the only committed semantic-drift record for a `holds` row is invisible to C3.

### E. Row-authentic but counter-unverified provenance

The anchor cell's `commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` is genuine: Gitiles `+/refs/tags/154.0.8037.97?format=JSON` (HTTP 200) returns `commit=b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `156.0.8078.47` returns `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`. But `rowDigests` only recognises a 64-hex sha256 (or 8-hex…4-hex); a 40-hex commit pin matches nothing, so `f5-digest` is vacuous for this row and the registry's commit pin is never bound to the tag it claims. S045 carries no sha256 digest at all, so the predicate's "the row's registry digest matched where it records one" is satisfied vacuously here.

## 5. Smallest safe correction

1. **Completeness rule (counter, closes B and A mechanically):** for each population row, require every citation the anchor cell carries — each `basename:range` pair and each range token — to appear in the receipt entry: a row is unresolved when the anchor names a file or range that no `entry.files[]` covers. This makes the two fixture counterexamples above turn `unresolved` without touching the verdict logic, and forces S045's teaches clause 3 to be either filed or removed from `teaches`.
2. **S045 filing (one entry, no supersession needed since the row holds):** add `executeTool-unregister-resolution-race.https.html` (and/or `unregister-during-executeTool.https.html`) at both tags, with ranges covering the unregistration-resolves assertion, and cite them in the anchor cell; or narrow the teaches cell to the three filed files. Either closes the false-provenance gap.
3. **Note accuracy (knowledge, append-only):** correct `webmcp-invocation-round-17.md:146` from `156:134` to `156:143`, and add the absent-argument shape (`154:26 executeTool(tool, '{}')` → `156:26 executeTool(tool)`).
4. Optional, cheapest: have the anchor cite the **line span of each test** rather than single lines (e.g. `:78-91`, `:103-114`) so a `holds` verdict cannot be produced by relocating one surviving string in a rewritten test.

Axes impacted: **freshness** (primary: C3 filing/completeness), **calibration** (a `holds` verdict that over-reads recall), **adjacency** (the unfiled witnesses belong to the same S041-S048 webmcp chain). No axis other than freshness is claimed as improved by this seat; this seat reports only.

## Tooling

No installs, no upgrades: `curl`, `base64`, `sha256sum`, `jq`, `git`, `node`, `python3` were already present. All git work was read-only in the lane, plus fixture repos `git init`-ed under `$S` (each verified `git -C "$D" rev-parse --show-toplevel` == `$D` before the first commit); no commit was made in the lane or the clone. Scratch `/fast/scratch/hyaku/tabi-r29/RefetchS045` removed after the deliverable was copied into `.ufo/waves/round-29/w2/refetch/S045.json` and this report written.
