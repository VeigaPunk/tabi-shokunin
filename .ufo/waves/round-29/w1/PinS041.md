# PinS041 — C3 re-open of registry row S041 at stable 156.0.8078.47

Seat: PinS041 (leaf). Wave: round 29 / w1. Milestone: C3 (freshness).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Scratch: `/fast/scratch/hyaku/tabi-r29/PinS041` (removed at end; receipts copied here first).
Baseline revision: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims read first from `.ufo/waves/round-29/claims.json` (claim C3).

## 1. What row S041 cites

`corpus/SOURCES.md:55` (11 cells, verified `awk -F'|' → NF-2 == 11`), quoted verbatim:

```
| S041 | Chromium 154 WebMCP domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | code | A | CDP WebMCP invocation contract at the 154.0.8037.97 tag: invokeTool, cancelInvocation, toolInvoked and toolResponded, InvocationStatus | tag 154.0.8037.97 fetched 2026-10-20, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, lines 7 and 58-122, sha256 26e62f29…37ff | invokeTool returns an invocationId before any tool event, so the outcome including Canceled arrives only in toolResponded | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |
```

Chromium source files cited: **exactly one**.

| # | chromium/src path | how the row names it | anchor line ranges, spelled as in the anchor |
|---|---|---|---|
| 1 | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | full URL in the source cell; the anchor names the same file implicitly (`lines 7 and 58-122` are that file's lines) | `7` (single line) and `58-122` |

Basename resolution was not needed: the only basename the anchor could name is the one already spelled out in the source URL, and no other file/basename appears in either cell. The used-by knowledge entry `corpus/knowledge/webmcp-invocation-round-17.md` cites S041 only through this same file ("S041 line 68", "S041 lines 115-122", both inside the 58-122 anchor) — no second Chromium file is attributed to S041 there.

## 2. Fetch of decoded bytes (both tags)

Commands (run in scratch, `$S` = scratch root, `$P` = the path above):

```
code=$(curl -sS -o "$S/f/$T/$P.b64" -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T/$P?format=TEXT")   # exit 0
base64 -d "$S/f/$T/$P.b64" > "$S/f/$T/$P"                                            # exit 0
```

| tag | HTTP status | base64 body bytes | decoded bytes | decoded lines (`split("\n")`) |
|---|---|---|---|---|
| 154.0.8037.97 | **200** | 5292 | 3969 | 124 (123 newline-terminated) |
| 156.0.8078.47 | **200** | 5504 | 4126 | 126 (125 newline-terminated) |

Tag→commit sanity (read-only `?format=JSON`, HTTP 200 each):

- `refs/tags/154.0.8037.97` = `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` — matches the commit the row records.
- `refs/tags/156.0.8078.47` = `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

## 3. Digests

```
26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff  154.0.8037.97/WebMCP.pdl
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  156.0.8078.47/WebMCP.pdl
```
(produced by `sha256sum` on the files now at `.ufo/waves/round-29/w1/pins/S041/bytes/<tag>/…`, exit 0)

Row digest check (abbreviated form `26e62f29…37ff`): prefix `26e62f29` ✓ and suffix `37ff` ✓ of the 154 decoded sha256 — **MATCH** (f5-digest satisfied). Same full digest is the one S099 records, so the two rows bind to identical bytes.

## 4. Range verdicts (154 → 156)

Method identical to the frozen counter (`check-release-pins.mjs`): each anchored 154 block, lines trimmed and inner whitespace collapsed, searched for as one contiguous block in the 156 lines.

| range (154 line numbers) | block length | 156 line numbers | verdict |
|---|---|---|---|
| `7` (i.e. `[7,7]`) | 1 | `7` | **holds** — unchanged |
| `58-122` | 65 | **`60-124`** | **holds** — contiguous, shifted +2, content byte-identical after normalisation |

Whole-file delta `diff -u 154 156` (exit 1 = differences, as expected) is a **single hunk outside both anchored ranges**:

```
@@ -19,6 +19,8 @@
       optional boolean untrustedContent
       # A hint indicating that executing the tool will result in consequential actions, ex: booking a flight, transferring money.
       optional boolean consequential
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
       # If the declarative tool was declared with the autosubmit attribute.
       optional boolean autosubmit
```

So the file object changed (`new_sha256` ≠ `old_sha256`), but **no anchored range drifted**: invokeTool/toolInvoked/toolResponded/InvocationStatus text is identical at 156; the only change is a new `optional boolean debugging` Tool annotation at 156 lines 23-24.

## 5. Supersede row

**Not drafted — correctly.** Step 6 is conditional on a drifted range; both ranges hold, so per the frozen counter S041 resolves as `verdict: holds` with no superseding row. `.ufo/waves/round-29/w1/pins/S041/supersede-row.md` is intentionally absent.

## 6. Artifacts written

- `.ufo/waves/round-29/w1/pins/S041/bytes/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (3969 B, sha `26e62f29…0a37ff`)
- `.ufo/waves/round-29/w1/pins/S041/bytes/156.0.8078.47/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (4126 B, sha `f386bcfd…036f99f`)
- `.ufo/waves/round-29/w1/pins/S041/entry.json` — shape exactly as specified; `ranges: [[7,7],[58,122]]`, `superseded_by: null`, `fetched_by: "PinS041"`, `fetched_at: "2026-10-26T04:23:39Z"`; `old_bytes`/`new_bytes` point at the final `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` locations for the registry-appending seat to populate.
- `.ufo/waves/round-29/w1/pins/S041/fetch-log.txt` — fetch commands, statuses, byte/line counts, digests, containment hits, the diff hunk.
- this report.

`node -e 'JSON.parse(entry.json)'` → exit 0, `json ok S041 1 [ [ 7, 7 ], [ 58, 122 ] ]`.

## 7. Gate-relevant residuals (handoff, not repaired here)

1. **f6-refetch still pending.** `check-release-pins.mjs` resolves S041 only when `corpus/evidence/round-29/release-pins/refetch/S041.json` exists, has a `seat` different from `PinS041`, and lists `{path, tag: "156.0.8078.47", status: 200, sha256: f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f}`. I did not author that record: an independent re-fetch has to come from a different seat, and minting a seat name myself would be fabricated evidence. My single-seat fetch does not satisfy f6. Until that sibling record lands, S041 reports `resolved:false, reasons:["f6-refetch …"]` even though content holds.
2. **f3-bytes path.** The committed copies must go to `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (that directory does not exist yet at baseline — `ls corpus/evidence/round-29/` → exit 2, no such directory). My `entry.json` already spells those exact paths; a seat copying my bytes there byte-for-byte keeps f3 green.
3. **Line-number shift for the citing knowledge entry (informational).** `corpus/knowledge/webmcp-invocation-round-17.md` cites S041 by tag-154 line numbers: `S041 line 68` (line 71 of the entry, the "response is sent before tool events" claim) and `S041 lines 115-122` (line 88, the Error/errorText claim). At 156 those texts sit at lines **70** and **117-124**. Nothing the entry states is contradicted (the quoted lines are identical), so no round-29 recheck note is required by the C3 kill rule; if the entry is touched later, those two citations should be re-pointed at the 156 tag + shifted lines.

## 8. Commands run (all read-only; no lane file edited)

| command | exit |
|---|---|
| `grep -n 'S041' corpus/SOURCES.md` | 0 |
| `awk 'NR==55' corpus/SOURCES.md` (+ `-F'|'` cell count → 11) | 0 |
| `grep -n 'S041' corpus/knowledge/webmcp-invocation-round-17.md` | 0 |
| `curl … /+/refs/tags/154.0.8037.97/<path>?format=TEXT` | 0, HTTP **200** |
| `curl … /+/refs/tags/156.0.8078.47/<path>?format=TEXT` | 0, HTTP **200** |
| `curl … /+/refs/tags/{154.0.8037.97,156.0.8078.47}?format=JSON` | 0, HTTP **200**, HTTP **200** |
| `base64 -d` both bodies | 0, 0 |
| `sha256sum` both decoded files | 0 |
| containment scan (node, counter's `normLine`/`blockIn` semantics) | 0 → `7-7 → [[7,7]] holds`, `58-122 → [[60,124]] holds` |
| `diff -u 154 156` | **1** (one hunk, outside anchored ranges — expected) |
| `node -e 'JSON.parse("entry.json")'` | 0 |

No builds, linters or formatters were run against the lane. No tool installs were needed (curl, base64, sha256sum, diff, node all present). No git mutation anywhere; no clone created.

## 9. Verdict

**S041 holds at 156.0.8078.47** — one file, both statuses 200, both ranges contiguous and identical at 156 lines 7 and 60-124, old digest matches the row's `26e62f29…37ff`, no supersede row required. Residual: f6-refetch must be produced by a different seat, and the bytes must be committed under `corpus/evidence/round-29/release-pins/bytes/` at the two tags.
