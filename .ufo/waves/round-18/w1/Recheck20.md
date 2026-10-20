VERDICT: PASS

# Recheck20 — C1 freshness recheck of S041 and S042

Seat: Recheck20. Date 2026-10-20. Rows: `corpus/SOURCES.md:55` (S041), `corpus/SOURCES.md:56` (S042).
Neither id is in the PLAN §C1 superseded set (`S004→S028, S039→S040, S047→S054, S049→S055, S050→S056,
S053→S057`); both are `mined` with `used-by corpus/knowledge/webmcp-invocation-round-17.md`.

Both receipts were produced only by
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs … --seat Recheck20`
(schema `tabi-source-recheck-v1`, `producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`,
exit 0, `quoteFound=true` for both). `--row-url` was the row's source cell verbatim; the fetch URL is the
same path plus `?format=TEXT` (base64 wire form) for S041, and the row URL itself for S042, so
`rowUrl` occurs verbatim in the row line in both cases (checked by reading `corpus/SOURCES.md:55-56`).

Anchor for both rows: `curl 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON'`
(JSON body, `?format=JSON` XSSI prefix stripped) →
`commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, `tree e096b0852a79b0810dba5cfaa714c95d74908532`,
author/committer time `Wed Sep 30 21:20:00 2026`, message head `Roll WebView ARM Orderfile …`. This matches
the commit id recorded in both row cells.

## S041 — Chromium 154 WebMCP domain PDL (`mined`)

- Row: `corpus/SOURCES.md:55`; teaches `CDP WebMCP invocation contract at the 154.0.8037.97 tag:
  invokeTool, cancelInvocation, toolInvoked and toolResponded, InvocationStatus`.
- Gate quote origin: `corpus/lessons/round-17.md:53` —
  `"Unique identifier for this invocation. Response is sent before tool events."` (11 words), located at
  `WebMCP.pdl:68` (`# Unique identifier for this invocation. Response is sent before tool events.`,
  followed by `string invocationId` at line 69). The quote is reproduced verbatim from the live body, so
  the original Gate quote was kept and `quoteSource` = `corpus/lessons/round-17.md:53`.
- http 200 · bytes 5292 (as served, base64) · sha256
  `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4`
  (receipt `sha256`, the bytes the tool fetched).
- decoded body (`base64 -d`): 3969 bytes · sha256
  `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` — identical to the decoded digest
  recorded in the S041 row cell (`26e62f29…37ff`) and in `corpus/lessons/round-17.md:53`; as-served digest
  also identical to the round-17 record (`0ea9bf3f…47e4`). 123 lines, no change since the round-17 fetch.
- decode `base64` · quoteOffset 1951 · quoteWords 11 · excerpt sha256
  `0a7e0c7314cf509770f32396a7631226e50bf67191b3ce11551d8f7b85042c24`.
- Anchor observed in body: `# Copyright 2026 The Chromium Authors` (line 1), `experimental domain WebMCP`
  (line 7); resolving tag commit above.
- Teaches check: **held**. Body at the tag still has `command invokeTool` (59) with `returns … string
  invocationId` (68-69) and the "Response is sent before tool events" wording; `command cancelInvocation`
  (72); `event toolsAdded` (78), `toolsRemoved` (92), `toolInvoked` (98), `toolResponded` (110); and
  `type InvocationStatus extends string` (26) with `Completed` (28), `Canceled` (29), `Error` (30).
  Every named element of the teaches cell is present at the anchor, and the row's line range `58-122`
  still covers commands/events/toolResponded payload.
- Drift draft: none (verdict held).

## S042 — Chromium 154 Blink ModelContext implementation (`mined`)

- Row: `corpus/SOURCES.md:56`; teaches `Chromium 154 Blink tool invocation: invoke entry, execute result
  and exception to CDP status, input validation`.
- Gate quote origin: `corpus/lessons/round-17.md:54` —
  `"It converts the input argument string to a JSON object, calls the function, receives a Promise, waits
  for the promise to resolve"` (22 words), `model_context.cc:748-750`. Those two lines are still in the
  live body (`// This overload is used for JS-provided tool functions. It converts the input` /
  `// argument string to a JSON object, …`), but the sentence is split across `//` comment prefixes.
  The shared normalizer (NFC + quote/dash folding + whitespace collapse) does not strip `// `, so the
  Gate quote is **not** a contiguous substring of the normalized body: probe
  `--normalize-only … --quote '<Gate quote>'` returned `{"found":false,"offset":-1,…}`, exit 1. Per the
  item instruction a new ≤25-word verbatim quote was chosen from the same passage and
  `quoteSource` records `new` with that reason.
- New quote (verbatim, `model_context.cc:765-771`, 22 words; the backticked span below is one unbroken
  line in the receipt, the rendering here only wraps it):
  `auto script_object = JSONStringToScriptObject(script_state, input_arguments); ScriptValue script_value = script_object; if (try_catch.HasCaught() || script_value.IsEmpty()) { OnToolFailed(std::move(tool_executed_cb), invocation_id, ScriptToolError(ScriptToolErrorCode::kInvalidInputArguments, "Failed to parse input arguments"`
- http 200 · bytes 66824 (as served, base64) · sha256
  `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`
  (receipt `sha256`).
- decoded body (`base64 -d`): 50117 bytes · sha256
  `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` — identical to the S042 row cell
  (`474083d6…8823`) and `corpus/lessons/round-17.md:54`; `git hash-object` of the decoded file gives blob
  `c5ef637f8e676ecc56050982a07f1c8e9056218c`, matching the row's `blob c5ef637f`. 1245 lines, unchanged.
- decode `base64` · quoteOffset 27811 · quoteWords 22 · excerpt sha256
  `42a33b7b10da83dc24576c043bd50f06d29fe4b4ca24895caf1a478afb3af5e4`.
- Anchor observed in body: `// Copyright 2025 The Chromium Authors` (line 1); `ModelContext::ExecuteTool`
  at 528, `ModelContext::ExecuteV8Tool` at 752 (doc comment 748-751), `ModelContext::OnToolExecuted` at
  856, `ModelContext::CancelTool` at 582; resolving tag commit above.
- Teaches check: **held**. Body still shows (a) invoke entry `ExecuteTool` 528-580 with `kInvalidToolName`
  for an unregistered tool (549-553); (b) input handling/validation in `ExecuteV8Tool`: input is
  JSON-parsed with `JSONStringToScriptObject` (765), a parse failure yields
  `ScriptToolErrorCode::kInvalidInputArguments` / "Failed to parse input arguments" (769-771), and the
  invocation path performs no `inputSchema` comparison — `inputSchema`/`input_schema` appears only at
  registration/declaration sites (401-402, 450, 509, 841, 1043-1044, 1237-1238); (c) execute result and
  rejection/exception routing: `result.Then(...true)` / `(...false)` (805-809) land in `OnToolExecuted`
  (856-872; the row's cell names 856-873), which calls `probe::WebMCPToolResponded` on a value (865) and
  `probe::WebMCPToolFailed` with `kToolInvocationFailed` otherwise (868-869); `CancelTool` emits
  `kToolCancelled` (640). The
  `ScriptToolErrorCode`→`WebScriptToolErrorCode` equivalence the browser maps to CDP `InvocationStatus`
  is asserted in-body at 58-67 (`STATIC_ASSERT_ENUM` for kInvalidToolName, kInvalidInputArguments,
  kMissingRequiredSubmitButton, kToolInvocationFailed, kToolCancelled).
- Note on scope: the file itself carries outcome→error-code→probe/error-string edges
  (`GetToolErrorMessage` 183-212); the final CDP `InvocationStatus` selection is attributed by the
  round-17 dossier to `inspector_web_mcp_agent.cc`
  (`.ufo/waves/round-17/sources/BlinkInvoke.md:151`, supporting-file table; not re-fetched here). The
  teaches cell's "to CDP status" therefore describes the same compressed flow the row's anchor cells and
  dossier record, not a claim that the enum switch lives in `model_context.cc` — still **held** at the
  anchor, not drift.
- Drift draft: none (verdict held).

## Evidence pointers

- Receipts/excerpts: `corpus/evidence/round-18/source-recheck/S041.json`,
  `S041.excerpt.txt`, `S042.json`, `S042.excerpt.txt` (all written 2026-10-20 by the shared producer).
- Row lines: `corpus/SOURCES.md:55` (S041), `corpus/SOURCES.md:56` (S042); Gate quotes
  `corpus/lessons/round-17.md:53` and `:54`.
- Tag→commit resolution: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON`
  (body `commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`).
- Fetch argv is recorded in each receipt (`command`), e.g.
  `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} '<url>'`.
- Scratch copies used for probing live only in `/tmp` (`r18-rck20-S041.b64`, `r18-rck20-S041.pdl`,
  `r18-rck20-S042.b64`, `r18-rck20-S042.cc`, `r18-rck20-tag.json`); nothing written to LANE outside the
  owned receipt dir and this report.
- Tooling: nothing installed or upgraded this run (no pacman/uv/npx; pacman paused by ruling).

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S041.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S041.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S042.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S042.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck20.md
