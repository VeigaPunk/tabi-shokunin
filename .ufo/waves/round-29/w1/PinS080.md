# PinS080 — C3 re-open of registry row S080 at Chromium 156.0.8078.47

Seat: PinS080 (leaf executor). Round 29, attempt 1, wave w1, milestone C3.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `856fa9e1…`, claims commit `97be89bc…`
(`.ufo/waves/round-29/claims.json`, read first). Output dir: `.ufo/waves/round-29/w1/pins/S080/`.

## Verdict (headline)

Row **S080** (`corpus/SOURCES.md:94`) **DRIFTED**: 8 anchored files, 10 anchored ranges →
**7 ranges hold, 3 ranges drifted** across 3 files (`script_tool_types.h`, `html_form_element.cc`,
`model_context.cc`). A superseding row pinned at `156.0.8078.47` is required for resolution
(`s1-drift-unsuperseded` otherwise). The row's core teaching survives the tag bump: `FillData` still
rejects with `kInvalidInputArguments` (`form_mcp_schema.cc` bytes identical at both tags) and the
inspector still maps every non-`kToolCancelled` code to CDP `Error` with `errorText = error.message`
and no exception object (`inspector_web_mcp_agent.cc:221-244`).

## Files cited by the row and how each basename was resolved

Source cell URL path: `third_party/blink/renderer/core/script_tools/script_tool_types.h`. Every other
file is named by basename in the anchor cell; each resolved to its `chromium/src` path —
`form_mcp_schema.cc`, `html_form_element.cc`, `frame.mojom`, `local_frame_mojo_handler.cc`,
`model_context.cc`, `inspector_web_mcp_agent.cc`, `WebMCP.pdl`
(full paths in `pins/S080/fetch-log.txt` §RESOLUTION). Basis: the round-19 dossier
`.ufo/waves/round-19/w1/SrcScriptToolError.md` names all eight paths at the same tag, and my own 154
fetches reproduce all eight of that dossier's decoded sha256 values — independent corroboration of the
old bytes rather than a copied fetch.

## Per-file result (status, digests, verdict per range)

Both tags returned **HTTP 200** for every file (16/16 requests). Decoded sha256 below; 154/156 sizes in
`fetch-log.txt`.

| # | path | 154 sha256 | 156 sha256 | ranges (154 numbering) | verdict |
|---|---|---|---|---|---|
| 1 | `third_party/blink/renderer/core/script_tools/script_tool_types.h` | `ee9006f7…4ca25d` | `323fad50…3d2431` | 16-49 | **drifted** |
| 2 | `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | `904b75e7…502152f` | `904b75e7…502152f` (identical) | 208-300 | holds (site 208-300) |
| 3 | `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `8c8d6796…8c36916` | `2a96a97b…f86102` | 174-259 | **drifted** |
| 4 | `third_party/blink/public/mojom/frame/frame.mojom` | `832a44ca…89e7128` | `d0e3ed71…887f294c` | 1112-1119 | holds (site **1072-1079**) |
| 5 | `third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc` | `9311613a…99263862` | `4052266a…b5c53cd1` | 987-1005 | holds (site **1006-1024**) |
| 6 | `third_party/blink/renderer/core/script_tools/model_context.cc` | `474083d6…d6c18823` | `94d08636…d3238aa3` | 528-580 | **drifted** |
| 7 | `third_party/blink/renderer/core/script_tools/model_context.cc` | (same file) | (same file) | 695-745 | **drifted** |
| 8 | `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | `1cc55ef9…df968475` | `2477d201…5b6ec2c53` | 220-243 | holds (site **221-244**) |
| 9 | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | `26e62f29…ece0a37ff` | `f386bcfd…9a1036f99f` | 25-30 | holds (site **27-32**) |
| 10 | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | (same file) | (same file) | 109-123 | holds (site **111-125**) |

Full hex digests (no abbreviation) are in `pins/S080/entry.json` and `fetch-log.txt`.

### Why the three drifted ranges drift

- `script_tool_types.h:16-49` — one inserted line `std::optional<bool> debugging;` (`156:46`) before
  the closing `};` of `ScriptToolDeclaration`; the error enum (`:16-22`) and
  `ScriptToolExecutedCallback` (`156:49-50`) are unchanged. Old 16-49 maps to 156:16-50.
- `html_form_element.cc:174-259` — a 9-line guard inserted inside the range after the fill-error
  branch (`156:201-209`): if the document detached while filling, `done_callback` gets
  `kToolInvocationFailed` / `"The document was detached while filling out the form"`. Plus one added
  line earlier in the file. Old 174-259 maps to 156:175-270.
- `model_context.cc:528-580` — `ExecuteTool` now takes `base::UnguessableToken` **by value**, and the
  `toolactivated` dispatch changed from `window->DispatchEvent(*WebMCPEvent::Create(...))` to
  `DispatchEvent(*ToolActivatedEvent::Create(...))`; the trailing comment's event name also changed
  `toolactivate` → `toolactivated`. Old 528-580 maps to 156:527-577.
- `model_context.cc:695-745` — `ExecuteDeclarativeTool` now takes the token by value; the callback
  body (including `probe::WebMCPToolFailed(..., /*exception=*/std::nullopt)`) is identical. Old
  695-745 maps to 156:691-741.

Unified diffs of all four drifted ranges: `.ufo/waves/round-29/w1/pins/S080/diffs/*.diff`.

## Row digest (step 3)

S080 records **no file digest**: `rowDigests(source+anchor)` = `[]`. The anchor carries a 40-hex commit
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (which my 154 tag resolution reproduces exactly), but no
64-hex sha256 and no `8hex…4hex` abbreviation — so `f5-digest` is not applicable to this row and no
match/mismatch is claimable. No file sha256 equals the commit string.

## Artifacts written (all inside my output dir)

- `.ufo/waves/round-29/w1/pins/S080/entry.json` — the exact shape requested, `superseded_by: null`,
  8 files, `ranges` in 154 line numbers, both statuses 200.
- `.ufo/waves/round-29/w1/pins/S080/bytes/{154.0.8037.97,156.0.8078.47}/<chromium path>` — 16 decoded
  byte files at their exact chromium paths.
- `.ufo/waves/round-29/w1/pins/S080/fetch-log.txt` — commands, per-request statuses, sizes, line
  counts, sha256s, containment table, resolution basis.
- `.ufo/waves/round-29/w1/pins/S080/supersede-row.md` — draft superseding row (`S1NN` placeholder),
  located 156 quote, per-file change table, recheck-note section.
- `.ufo/waves/round-29/w1/pins/S080/diffs/*.diff` — 4 unified diffs of the drifted ranges.
- This report.

Nothing was written to `corpus/`, `scripts/`, `knowledge/`, the lane git index, jj state, or the fleet
repo. No tool was installed or upgraded (nothing was needed).

## Commands run (with exit codes)

Fetch (Gitiles `?format=TEXT`, `curl -sS --max-time 120 -w '%{http_code}'` then `base64 -d`), 8 paths ×
2 tags:

```
156.0.8078.47 / 154.0.8037.97 -> 200 for all 8 paths each   (16/16 HTTP 200; loop exit 0)
```

Tag resolution (`?format=JSON`): 154 → 200, commit `b510e9d7…` (matches row); 156 → 200, commit
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`. Hashing/containment script (`python3 analyze.py`) → exit 0.
Line-mapping script (`python3 map.py`, difflib) → exit 0. Diff generation (`diff -u`) → exit 0 (4 diffs).

Frozen-counter fixture probes (scratch fixture repo `git -C "$D"` verified `rev-parse --show-toplevel`
= `$D` before the first commit; **fixture-only, not lane evidence**):

```
node scripts/check-release-pins.mjs --repo $D --rev $REV --stable 156.0.8078.47 --json   -> exit=1
  population 23 unresolved 23; S080 reasons = f6-refetch ×8 (r1/f1/f2/f3/f4/f5 all pass)
+ fixture-only synthetic refetch record (seat "FixtureProbe-NOT-EVIDENCE")               -> exit=1
  S080 verdict=drifted, reasons=[s1-drift-unsuperseded]
+ fixture-only draft row inserted as S199, entry.superseded_by=S199                      -> exit=1
  population 23 unresolved 22 holds 0 drifted 1; S080 resolved=true verdict=drifted reasons=[]
node scripts/check-release-pins.mjs --repo $D --rev $REV --stable 157.0.0.0 --json       -> exit=1
  S199 resolved=true verdict=holds reasons=[]  (draft row's cells, range tokens, basename
  binding and abbreviated digests all bind; 157 bytes are a fixture copy of the 156 bytes)
grep -rn "S080" corpus/knowledge/                                                       -> exit=1 (no hits)
```

No refetch record was created in the lane, so `f6-refetch` for S080 is still open — by design that
record must come from a seat other than `PinS080`.

## Recheck notes for citing knowledge entries

S080's `used-by` cell reads `—` and `grep -rn "S080" corpus/knowledge/` returned no lines (exit 1):
**zero citing knowledge entries, so zero recheck notes are due**, and no knowledge file is made wrong
by this drift. Adjacent (outside `used-by`): `corpus/lessons/round-19.md:36` keeps S080's quote at
`script_tool_types.h:17-21`; those five enum lines are byte-identical at `156:17-21`, so the lesson
quote still holds and needs no erratum.

## Risks / blockers for the L1

1. **`entry.json.superseded_by` is `null`** (required by the requested shape). Until it names the new
   row id, `check-release-pins.mjs` reports `s1-drift-unsuperseded` for S080 even with bytes, ranges
   and digests correct. Assign the next free id and set the field.
2. **`f6-refetch` for S080 is unproduced.** A different seat must fetch all 8 paths at
   `156.0.8078.47` and write `corpus/evidence/round-29/release-pins/refetch/S080.json` with the
   156 sha256 values in `entry.json` (my fetch cannot serve as its own re-fetch).
3. The bytes now in `pins/S080/bytes/` must be committed at
   `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` (the paths `entry.json` names) — I do not
   write lane tracked files.
4. The superseding row's 156 ranges are `script_tool_types.h:16-50`, `html_form_element.cc:175-270`,
   `model_context.cc:527-577,691-741` for the three drifted files and the hold sites above for the
   other five. `model_context.cc:527` is included deliberately: it is the by-value signature line,
   which is part of what changed.
