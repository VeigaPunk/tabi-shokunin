# PinS042 — C3 re-open of registry row S042 at stable tag 156.0.8078.47

Seat: PinS042 (leaf executor, round 29 / wave w1, attempt 1, run-8 fresh start).
Item: C3 re-open of registry row S042 at the new stable tag. No lane tracked file, registry line,
git index or sibling artifact was modified by this seat: everything below is written under
`.ufo/waves/round-29/w1/pins/S042/` plus this report.

Frozen context read first: `.ufo/waves/round-29/claims.json` (claim C3, population 23, target
`unresolved=0`). Trigger: `baseline/chromiumdash-stable-linux.json` — Chrome stable Linux
`156.0.8078.47`, rows pinned at `154.0.8037.97`.

## Row S042 as registered (corpus/SOURCES.md:56, 11 cells)

| cell | value |
|---|---|
| id | S042 |
| source | Chromium 154 Blink ModelContext implementation — `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT` |
| kind / tier | code / A |
| anchor | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), model_context.cc:528-580, 748-811, 856-873, blob c5ef637f, sha256 474083d6…8823 |
| recheck | on-release |
| used-by | corpus/knowledge/webmcp-invocation-round-17.md |

Chromium source files the row cites — exactly **one**:

1. `third_party/blink/renderer/core/script_tools/model_context.cc` (the source-cell URL). The
   anchor names only this basename. No other basename appears in the anchor, so no resolution from
   knowledge entries, earlier dossiers or a Gitiles listing was needed.
   Anchor ranges **as spelled**: `528-580`, `748-811`, `856-873`.

## File inventory and digests

| | 154.0.8037.97 | 156.0.8078.47 |
|---|---|---|
| HTTP status (Gitiles `?format=TEXT`) | **200** | **200** |
| curl exit | 0 | 0 |
| decoded bytes | 50117 | 51112 |
| decoded lines | 1245 | 1262 |
| decoded sha256 | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | `94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3` |
| as-served base64 sha256 | `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` | `c183ba74553eb95031d85615f14f08010eff3c35da3f089d992a06f77b3adb10` |
| git blob id (`blob <len>\0` sha1) | `c5ef637f8e676ecc56050982a07f1c8e9056218c` | `0ed6a007777b5d285e6cb5f38082c4ebe5024472` |

Tag `156.0.8078.47` resolves to commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`
(Gitiles `+/refs/tags/156.0.8078.47?format=JSON`, HTTP 200).

### Registry digest check — MATCH

The anchor records `sha256 474083d6…8823` (8 hex + ellipsis + 4 hex). The 154 decoded sha256 is
`474083d6…c18823`: prefix `474083d6` ✓, suffix `8823` ✓. The anchor's `blob c5ef637f` also matches
the decoded bytes' git blob id (prefix `c5ef637f`) ✓.

Independent cross-wave agreement: the as-served base64 sha256 of the 154 fetch
(`039e24a0a954…`) equals the as-served digest already recorded for S042 in
`corpus/knowledge/source-recheck-round-18.md:91` / `corpus/lessons/round-17.md:54`, so the 154
bytes are the same bytes the lane recorded in round 18.

## Verdicts per range (counter's own rule: old lines trimmed, inner whitespace collapsed, must occur as one contiguous block in the 156 file)

Rule executed with a re-implementation of `blockIn`/`normLine` from
`scripts/check-release-pins.mjs` over the committed-shape bytes (`verify.mjs`, exit 0):

| range (154) | 154 content | verdict | where it sits in 156 | note |
|---|---|---|---|---|
| `528-580` | `ModelContext::ExecuteTool` | **DRIFTED** | function now `527-577`; sub-block `529-564` holds at `528-563` | signature + `toolactivate` dispatch changed |
| `748-811` | comment + `ModelContext::ExecuteV8Tool` | **DRIFTED** | same code now `744-807`; `748-752` holds at `744-748`, `754-811` holds at `750-807` | drift caused only by line 753's signature |
| `856-873` | `ModelContext::OnToolExecuted` | **HOLDS** | at `855-872` (function body `855-871`) | byte-identical after normalization |

Row verdict: **drifted** (2 of 3 ranges moved) → the row needs a superseding registry row pinned at
`156.0.8078.47`, drafted at `pins/S042/supersede-row.md` (id `S1NN` placeholder, not written to the
registry).

### Drifted range 528-580 — unified diff of the region

```
--- 154.0.8037.97:528-580
+++ 156.0.8078.47:527-577
@@ signature @@
-bool ModelContext::ExecuteTool(const base::UnguessableToken& invocation_id,
+bool ModelContext::ExecuteTool(base::UnguessableToken invocation_id,
                                const String& name,
@@ toolactivated dispatch @@
-  // Fire the `toolactivate` event *after* activating the tool, but potentially
+  // Fire the `toolactivated` event *after* activating the tool, but potentially
   // *before* the tool call finishes. Importantly, if the tool is a declarative
   // WebMCP tool, the form will be filled out synchronously above in
   // ExecuteDeclarativeTool(), so by the time the event is fired, the form will
   // be populated.
-  if (LocalDOMWindow* window = document_->domWindow()) {
-    // This is a synchronous, non-cancelable event.
-    window->DispatchEvent(
-        *WebMCPEvent::Create(event_type_names::kToolactivated, name));
-  }
+  // This is a synchronous, non-cancelable event.
+  DispatchEvent(
+      *ToolActivatedEvent::Create(event_type_names::kToolactivated, name));
 
   return success;
 }
```

### Drifted range 748-811 — unified diff of the region

```
--- 154.0.8037.97:748-811
+++ 156.0.8078.47:744-807
@@ ExecuteV8Tool signature @@
 bool ModelContext::ExecuteV8Tool(V8ToolExecuteCallback* tool_function,
-                                 const base::UnguessableToken& invocation_id,
+                                 base::UnguessableToken invocation_id,
                                  const String& name,
                                  const String& input_arguments,
                                  AbortController* abort_controller,
```

Everything else in `748-811` (the `JSONStringToScriptObject` call, the
`kInvalidInputArguments` / "Failed to parse input arguments" failure path, the
`ToolExecuteCallbackOptions` signal wiring, `pending_executions_.insert`, the `result.Then(...)`
success/failure binding) is unchanged — `754-811` ↔ `750-807` are equal line for line.

### Holds range 856-873

`OnToolExecuted` is unchanged: `pending_executions_.Take(invocation_id)`, the
`probe::WebMCPToolResponded` / `probe::WebMCPToolFailed` split, and the
`ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed)` failure construction all match the
154 bytes after normalization (`856-873` ↔ `855-872`).

## What the row's `teaches` cell gets right and wrong at 156

- Still true (checked in the 156 bytes): an id-carrying call returns before the tool events;
  a resolving execute maps to success and a throw/reject to the failure path with no message text;
  `Canceled` still requires `cancelInvocation` (`CancelTool` exists at both tags: 154:582, 156:579);
  imperative input is still never compared to `inputSchema` — `ExecuteV8Tool` still only runs
  `JSONStringToScriptObject` and a syntax/empty check (`156:750-807`).
- Now wrong: the anchor's line numbers themselves. Two of the three ranges no longer hold, so any
  claim that "the row's anchor range 748-811 covers `ExecuteV8Tool`" (knowledge entry `:73`) is
  stale — the code is at `744-807`.
- Adjacent change outside the anchor, noted for the superseding row, not repaired here: the page-side
  `executeTool` now takes a `ScriptValue input_object` and stringifies it via
  `ValidateAndStringifyValue` (156:1080-1084 signature, 1126-1131 call), and `input_schema` is
  now parsed into a script object when the tool map is built (156:1042-1052). Both are serialization, not schema
  application, so the "no `inputSchema` enforcement" reading survives; they are simply not inside
  the row's anchor.

## Artifacts written (all under `.ufo/waves/round-29/w1/pins/S042/`)

| path | content |
|---|---|
| `bytes/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc` | decoded 154 bytes, sha256 `474083d6…c18823` |
| `bytes/156.0.8078.47/third_party/blink/renderer/core/script_tools/model_context.cc` | decoded 156 bytes, sha256 `94d08636…238aa3` |
| `entry.json` | receipt entry, exact shape requested; `ranges` = the row's own 154 ranges `[[528,580],[748,811],[856,873]]` |
| `supersede-row.md` | drafted superseding row (11 cells, `S1NN` placeholder, 156 ranges `527-577`, `744-807`, `855-871`, digest `94d08636…8aa3`), ≤25-word located quote, recheck notes per citing knowledge entry |

`entry.json` carries `"superseded_by": "S1NN"` rather than `null` because the row is drifted: with
`null` the frozen counter reports `s1-drift-unsuperseded` for S042. The allocator must replace
`S1NN` with the allocated id when the superseding row lands in `corpus/SOURCES.md` (note `S1NN`
itself does not match the registry row regex `^ {0,3}\|\s*S\d{3,}\s*\|` — digits are required).
This seat has no `refetch/S042.json`: `f6-refetch` requires a record from a **different** seat, so
`check-release-pins.mjs` will report `f6-refetch` for S042 until that independent record exists.

## Commands run (exit codes verbatim)

```
$ mkdir -p /fast/scratch/hyaku/tabi-r29/PinS042/bytes/{154.0.8037.97,156.0.8078.47}   # 0
$ curl -sS -o bytes/<tag>/model_context.cc.b64 -w '%{http_code}' \
    'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT'
154.0.8037.97 status=200   (curl exit 0)
156.0.8078.47 status=200   (curl exit 0)
$ base64 -d bytes/<tag>/model_context.cc.b64 > bytes/<tag>/model_context.cc      # 0 both
$ wc -lc   1245 50117 (154)   1262 51112 (156)                                   # 0
$ sha256sum bytes/154.0.8037.97/.../model_context.cc
474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823                  # 0
$ sha256sum bytes/156.0.8078.47/.../model_context.cc
94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3                  # 0
$ sha256sum bytes/<tag>/model_context.cc.b64          # as-served
039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d (154)            # 0
c183ba74553eb95031d85615f14f08010eff3c35da3f089d992a06f77b3adb10 (156)            # 0
$ python3 -c '<git blob sha1 over decoded bytes>'    c5ef637f8e67… (154) 0ed6a007777b (156)   # 0
$ curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47?format=JSON'
status=200, commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775                       # 0
$ node verify.mjs <scratch>   # blockIn/normLine re-implementation
range 528-580: drifted | range 748-811: drifted | range 856-873: holds at new 855-872   # 0
$ diff -u <154 bytes> <156 bytes> > full.diff ; echo exit=$?     exit=1 (differences), 17 hunks
$ second fetch: curl http=200 both, cmp -s vs first fetch exit=0 both            # deterministic
```

No build, lint, formatter or lane gate was run — that is the parent's post-integration job.

## Risks and open items (reported, not repaired)

1. **`f6-refetch` is unowned here.** S042 cannot resolve in `check-release-pins.mjs` until a seat
   other than `PinS042` commits `corpus/evidence/round-29/release-pins/refetch/S042.json` listing
   the same path at `156.0.8078.47` with status 200 and sha256 `94d08636…238aa3`.
2. **Bytes are staged, not committed.** The counter reads
   `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` at the revision; the appending seat
   must copy these two files there (they are byte-identical to what this seat fetched) and add the
   entry to `receipt.json` (`schema tabi-release-pins-v1`, `stable 156.0.8078.47`).
3. **Placeholder supersession id.** `S1NN` in `entry.json` and in the draft row must be replaced by
   the allocated registry id; until then S042 reads `s1-drift-unsuperseded`.
4. **Citing notes are stale, not repaired.** `corpus/knowledge/webmcp-invocation-round-17.md:73`
   and `corpus/knowledge/source-recheck-round-18.md:91` still point at the 154 ranges; the recheck
   notes in `supersede-row.md` say exactly what each gets wrong. Repairing those knowledge files is
   outside this seat's write scope (claim C3 kill rule: a drifted row whose citing knowledge entries
   carry no round-29 recheck note is a quality harm — the notes exist in `supersede-row.md`, they are
   not yet in the knowledge files).
5. **No axis is claimed beyond this row.** One file, one digest match, two drifted ranges, one
   supersede draft; S042 is 1 of the 23 population rows, so C3's `unresolved=0` depends on the other
   22 entries plus the frozen counter's own run.
