# Chromium 156 release-pin recheck — 23 on-release rows re-opened at the new Stable tag

source: S108 — Chromium Dash fetch_releases, Stable/Linux — https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3 (committed response `corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json`, sha256 90abf2c3…fe33); S109 S110 S111 S112 S113 S114 S115 — the superseding rows pinned at tag 156.0.8078.47; re-opened rows S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098 S099 S100 S105 S106 at both tags
verified-at: 2026-10-26 — round 29; receipt `corpus/evidence/round-29/release-pins/receipt.json` with the decoded bytes of both tags under `corpus/evidence/round-29/release-pins/bytes/`
recheck: on-release — `node scripts/check-release-pins.mjs --rev <REV> --stable <current Stable>`; a population > 0 at a newer Stable means this note is due again

## What is observed

Chrome Stable on Linux is 156.0.8078.47 (previous 155.0.8059.84) in the Chromium Dash feed
fetched 2026-10-26T04:12:21Z (S108: `"previous_version":"155.0.8059.84","time":1792526230889,"version":"156.0.8078.47"`).
Twenty-three registry rows carry recheck `on-release` and a Chromium Gitiles pin at tag
154.0.8037.97. Each was re-opened by fetching every Chromium file its source or anchor cell
names at both tags (Gitiles `?format=TEXT`, base64-decoded; 46 distinct files). Where the row
records a 154 digest, the re-fetched 154 bytes hash to it, so the comparison starts from the
bytes the row was written against.

A row **holds** when every line block its anchor names (154 numbering) occurs verbatim — each
line trimmed, inner whitespace collapsed — as one contiguous block somewhere in the 156 file; a
404 absence row holds when the file is still 404. Otherwise it **drifted**, and a superseding
row pinned at 156 carries the new reading. The verdicts below are computed by the counter, not
asserted (`scripts/check-release-pins.mjs`, frozen in commit 97be89bc).

| row | verdict | files (154/156 HTTP; bytes identical or changed; anchored range 154 → where the block sits at 156) |
|---|---|---|
| S033 | holds | `model_context_supplement.idl` 200/200 identical; 7-12→7-12 |
| S034 | holds | `runtime_enabled_features.json5` 200/200 changed; 7023-7050→7204-7231 |
| S041 | holds | `WebMCP.pdl` 200/200 changed; 7-7→7-7, 58-122→60-124 |
| S042 | drifted → S109 | `model_context.cc` 200/200 changed; 528-580→drift, 748-811→drift, 856-873→855-872 |
| S045 | holds | `executeTool-abort.https.html` 200/200 changed; 87-87→108-108, 113-113→143-143; `invoke-tool.js` 200/200 identical; 38-51→38-51; `WebMCP.pdl` 200/200 changed; 68-68→70-70 |
| S062 | holds | `content_switches.cc` 200/200 identical; 596-603→596-603; `devtools_pipe_handler.cc` 200/200 changed; 135-200→135-200; `remote_debugging_server.cc` 200/200 identical; 353-400→353-400; `devtools_http_handler.cc` 200/200 changed; 297-306→308-317 |
| S064 | holds | `command_line.cc` 200/200 identical; 449-455→449-455; `feature_list.cc` 200/200 changed; 417-453→420-456, 872-875→897-900 |
| S071 | drifted → S110 | `form_mcp_schema.cc` 200/200 identical; 208-243→208-243; `html_form_element.cc` 200/200 changed; 192-258→drift; `model_context.cc` 200/200 changed; 562-565→561-564, 752-811→drift |
| S074 | holds | `runtime_enabled_features.json5` 200/200 changed; 7023-7050→7204-7231, 7035-7035→273-273 |
| S077 | holds | `form_mcp_schema.cc` 200/200 identical; 49-111→49-111, 208-490→208-490, 930-1093→930-1093, 1238-1438→1238-1438 |
| S078 | drifted → S111 | `html_form_element.cc` 200/200 changed; 174-328→drift, 635-842→673-880 |
| S079 | holds | `WebMCP.pdl` 200/200 changed; 25-30→27-32, 109-123→111-125; `inspector_web_mcp_agent.cc` 200/200 changed; 208-243→209-244 |
| S080 | drifted → S112 | `script_tool_types.h` 200/200 changed; 16-49→drift; `form_mcp_schema.cc` 200/200 identical; 208-300→208-300; `html_form_element.cc` 200/200 changed; 174-259→drift; `frame.mojom` 200/200 changed; 1112-1119→1072-1079; `local_frame_mojo_handler.cc` 200/200 changed; 987-1005→1006-1024; `model_context.cc` 200/200 changed; 528-580→drift, 695-745→drift; `inspector_web_mcp_agent.cc` 200/200 changed; 220-243→221-244; `WebMCP.pdl` 200/200 changed; 25-30→27-32, 109-123→111-125 |
| S081 | drifted → S113 | `html_select_element.cc` 200/200 changed; 291-347→291-347, 871-887→871-887, 1047-1108→drift, 1162-1184→1163-1185, 180-210→180-210 |
| S093 | holds | `form_mcp_schema.cc` 200/200 identical; 121-181→121-181, 491-539→491-539, 556-928→556-928, 1095-1236→1095-1236, 1238-1438→1238-1438; `form_mcp_schema.h` 200/200 identical; 41-50→41-50, 56-121→56-121, 148-158→148-158 |
| S094 | holds | `form_mcp_schema_unittest.cc` 404/404 changed; whole file |
| S096 | drifted → S114 | `html_form_element.cc` 200/200 changed; 174-328→drift, 729-758→767-796, 818-842→856-880 |
| S097 | holds | `inspector_web_mcp_agent.cc` 200/200 changed; 47-64→47-64, 208-243→209-244 |
| S098 | holds | `form_mcp_schema.cc` 200/200 identical; 491-928→491-928, 583-583→583-583 |
| S099 | holds | `WebMCP.pdl` 200/200 changed; 59-69→61-71, 109-123→111-125 |
| S100 | drifted → S115 | `html_form_element.cc` 200/200 changed; 174-328→drift, 635-842→673-880 |
| S105 | holds | `Page.pdl` 200/200 changed; 1345-1345→1373-1373, 1706-1706→1734-1734 |
| S106 | holds | `content_features.cc` 200/200 changed; 186-187→186-187 |

16 rows hold, 7 drifted — `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq '{holds,drifted}'` 2026-10-26.

## What changed at 156 inside anchored ground

- **Declarative form fill can now fail after filling** (`html_form_element.cc` 156:201-210, S111/S114/S115/S110):
  “Filling out the form controls dispatches `input` and `change` events, whose handlers may have
  detached the document.” When the document is no longer active the tool settles
  `kToolInvocationFailed` with “The document was detached while filling out the form”, before the
  autosubmit/focus branch. The round-19/20/21 lifecycle tables (154) do not list this arm.
- **`toolactivated` is dispatched by ModelContext itself** (`model_context.cc` 156:567-574, S109):
  `DispatchEvent(*ToolActivatedEvent::Create(event_type_names::kToolactivated, name))` replaces the
  154 dispatch of a `WebMCPEvent` on the LocalDOMWindow; `ExecuteTool`/`ExecuteV8Tool`/
  `ExecuteDeclarativeTool` take the invocation id by value.
- **`ScriptToolAnnotations` gains `std::optional<bool> debugging;`** (`script_tool_types.h` 156:46, S112);
  the five error codes at 17-21 are unchanged.
- **`HTMLSelectElement::SelectOption` loses the `SelectedcontentSpecEnabled()` gate** (156:1077, S113):
  selectedcontent updates now depend only on `kDontUpdateSelectedcontentFlag`.
- Held unchanged at 156 (blocks present): the WebMCP runtime feature block (S034/S074), the
  WebMCP.pdl invokeTool/toolResponded/InvocationStatus declarations (S041/S079/S099), the
  inspector emitter (S097), all of `form_mcp_schema.cc`/`.h` (byte-identical; S077/S093/S098),
  Page.pdl `BackForwardCacheRestore` and `backForwardCacheNotUsed` (S105), `kBackForwardCache`
  enabled by default (S106), the debugging-pipe and duplicate-switch code (S062/S064), and the
  missing `form_mcp_schema_unittest.cc` (S094, still 404).

## What this means for held knowledge

The runtime observations the lane holds were measured on a 154 build and stay true of that build.
What went stale is the source pointer: entries that cite a drifted row quote 154 line numbers and
miss the new detached-document arm. Each such entry carries an appended round-29 recheck note
naming the superseding row: `webmcp-invocation-round-17.md` (S042 → S109),
`source-recheck-round-18.md` (S042, S071 → S109, S110), `harness-hardening-round-18.md`
(S071 → S110), `webmcp-declarative-validation-round-19.md` (S078, S096 → S111, S114),
`webmcp-completion-lifecycle-round-20.md` (S078, S096, S100 → S111, S114, S115),
`webmcp-nonautosubmit-round-21.md` and `webmcp-nonautosubmit-round-21-corrected.md`
(S100 → S115). S080 and S081 have no citing knowledge entry.

## Limits

- Block presence is not meaning. A held block can change meaning through code outside it
  (a new guard before it, a caller removed); the counter cannot see that. Wave-2 seats read
  around the highest-risk anchors; their findings are in `.ufo/waves/round-29/w2/`.
- A single-line range holds if that normalised line occurs anywhere in the new file, so a
  common line is weak evidence (S074's `7035` is inside its held `7023-7050` block; S045's and
  S105's single lines are distinctive).
- Source-level only: no 156 browser was run. Runtime claims at 156 need a new experiment.
- S045 is the measured instance of the first limit: its two cited test lines hold verbatim,
  but at 156 the test listens on `document.modelContext` (not `window`) and passes an object
  to `executeTool`; the citing entry carries a note.
- Gitiles 404 bodies carry a per-request `request_id`, so two fetches of the same missing file
  never hash equal. The committed 156 body for S094 has that value replaced by
  `<per-request id removed>` (receipt fields `normalization`, `raw_new_sha256`); its
  independent re-fetch applies the same replacement before hashing.

## Errata — wave-2 review (2026-10-26; append-only, `.ufo/waves/round-29/w2/RevKnowledge.md`)

- The struct that gains `std::optional<bool> debugging;` at `script_tool_types.h` 156:46 is
  `ScriptToolDeclaration` (opens 156:40), not `ScriptToolAnnotations` (F3; S112's row is right).
- The post-fill detached-document guard is `html_form_element.cc` 156:**201-209**, 9 lines
  (comment 201-202, `if` 203, return 204-208, `}` 209; 210 is blank). Where this note and the
  appended notes in webmcp-completion-lifecycle-round-20, webmcp-nonautosubmit-round-21 and
  -round-21-corrected say `201-210`, or source-recheck-round-18 and registry rows S110/S115 say
  "10-line", read 201-209 / 9 lines; the file's line delta at that point is +10 because of a
  second one-line change above it (F4).
- The "16 rows hold, 7 drifted" line is the counter's output once the 23 independent re-fetch
  records are committed (`corpus/evidence/round-29/release-pins/refetch/`); before that commit the
  counter reports every row unresolved on `f6-refetch` (F1). Raw outputs:
  `.ufo/waves/round-29/measure/`.
