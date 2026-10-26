# PinS099 — C3 re-open of registry row S099 at Chromium 156.0.8078.47

Seat: PinS099 (leaf executor, milestone C3). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims read first from
`.ufo/waves/round-29/claims.json` (claim C3). No lane tracked file, index or jj state was touched;
all network was read-only HTTPS GET of chromium.googlesource.com.

## 1. Row S099 as frozen (corpus/SOURCES.md line 113, 11 cells)

| cell | value (abridged) |
|---|---|
| source | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` |
| kind / tier | `code` / `A` |
| anchor | `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; WebMCP.pdl:59-69,109-123; decoded sha256 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| teaches | `supersedes S079 — canonical PDL URL reuses S041 declaration bytes; …` |
| status / opened / recheck | `mined` / `2026-10-21` / `on-release` |
| used-by | `corpus/knowledge/webmcp-declarative-validation-round-19.md` |

Chromium files the row cites: **exactly one** —
`third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (the URL in the source cell). The
anchor names no other basename; no Gitiles directory listing or earlier-wave dossier was needed to
resolve anything further.

Anchor line ranges for that file, spelled as in the anchor: `59-69` and `109-123`.

## 2. Fetches (decoded bytes, HTTP status, sha256)

Both URLs are `…/+/refs/tags/<tag>/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT`.

| tag | HTTP | decoded bytes | split lines | sha256 |
|---|---|---|---|---|
| 154.0.8037.97 | **200** | 3969 | 124 (123 newlines) | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| 156.0.8078.47 | **200** | 4126 | 126 (125 newlines) | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` |

Tag commit metadata (Gitiles `?format=JSON`, both 200): 154 → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`
(matches the row's anchor commit); 156 → `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

Bytes saved (exact chromium path under each tag dir):

- `.ufo/waves/round-29/w1/pins/S099/bytes/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`
- `.ufo/waves/round-29/w1/pins/S099/bytes/156.0.8078.47/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`

## 3. Registry digest binding — MATCH

The row records one 64-hex digest, `26e62f29…0a37ff`. It equals the **154.0.8037.97** decoded
sha256 of `WebMCP.pdl` exactly. No 8hex…4hex abbreviation is present. Match.

## 4. Per-range verdict (154 line numbers → 156 position)

Comparison uses the frozen counter's own semantics (each line trimmed, inner whitespace collapsed;
contiguous block search), replicated in `pins/S099/f-checks.json` by a local mirror script.

| range | old lines | holds? | sits at 156 lines |
|---|---|---|---|
| `59-69` | 11 | **holds** | 61-71 |
| `109-123` | 15 | **holds** | 111-125 |

**File verdict: holds. Row verdict: holds. No drift.** Step 6 (superseding registry row) is therefore
**not triggered**; no `supersede-row.md` was drafted and none is needed.

What did change at 156 is a single two-line insertion above both anchored ranges
(`diff -u`, one hunk `@@ -19,6 +19,8 @@`, after `optional boolean consequential`):

```
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
```

This explains the uniform +2 shift of both anchored ranges and does not touch the anchored
`object input` declaration (154:59-69) or the optional-response `toolResponded` event block
(154:109-123, incl. `optional any output` at 154:118 → 156:120).

## 5. Predicate mirror (f1–f5), all true

`node $S/mirror-check.mjs > pins/S099/f-checks.json` → exit 0. Result:
`f1_old_tag true` (row tags `[154.0.8037.97]`), `f2_path_bound true` (source carries
`refs/tags/154.0.8037.97/<path>`), `f3_old_sha_match true`, `f3_new_sha_match true`,
`f4_ranges` both `in_anchor true` / `in_bounds true` / `holds true`, `f5_digest_match true`,
`overall_verdict "holds"`, `supersede_needed false`.

## 6. Deliverables written (this seat's output dir only)

- `pins/S099/entry.json` — exact schema from the item; `superseded_by: null`; one file; `ranges: [[59,69],[109,123]]`.
- `pins/S099/bytes/<tag>/third_party/.../WebMCP.pdl` — both decoded byte sets.
- `pins/S099/f-checks.json` — machine-checked predicates.
- `pins/S099/fetch-log.txt` — commands, statuses, exit codes.
- This report.

## 7. Handoff notes for the parent (blocking for C3 accounting, not for my row verdict)

1. **Bytes must be copied to the committed receipt root.** `entry.json` declares, per the required
   schema, `old_bytes`/`new_bytes` as
   `corpus/evidence/round-29/release-pins/bytes/<tag>/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`.
   A leaf seat may not write that tracked path, so the bytes currently exist only under
   `.ufo/waves/round-29/w1/pins/S099/bytes/…`. Copy them to the declared corpus paths before the
   counter runs, or `f3-bytes absent` will fire.
2. **f6-refetch is not mine.** The counter requires a refetch record whose `seat` differs from
   `entry.fetched_by`. A different seat must write
   `corpus/evidence/round-29/release-pins/refetch/S099.json` with
   `{path, tag:"156.0.8078.47", status:200, sha256:"f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f"}`.
   My two identical GETs are same-seat and deliberately do not count.
3. **No knowledge recheck note required** (claim C3's kill rule applies only to drifted rows). The
   citing entry `corpus/knowledge/webmcp-declarative-validation-round-19.md:154` remains accurate: it
   quotes `WebMCP.pdl:59-69,109-123` and "same PDL as source S079 / reuses S041 bytes". Sibling pin
   `pins/S041/entry.json` records the *same* 154 sha256 (`26e62f29…0a37ff`) and the same 156 sha256
   (`f386bc…6f99f`), so the "same PDL" identity still holds at 156; S041's own ranges `[[7,7],[58,122]]`
   differ from S099's, which is consistent with the two rows anchoring different spans of one file.
4. **Observation, not scope widening:** 156 adds `optional boolean debugging` to the declarative tool
   description (156:22-23). S099's scope sentence ("object-input and optional response field
   declarations") is unaffected; if the lane ever wants that field documented it needs its own row.

## 8. Commands and exit codes (as run)

```
awk 'NR==113' corpus/SOURCES.md                       # row dump, 816 bytes            exit 0
curl … 154.0.8037.97 WebMCP.pdl?format=TEXT           # HTTP 200, 5292 b64            exit 0
curl … 156.0.8078.47 WebMCP.pdl?format=TEXT           # HTTP 200, 5504 b64            exit 0
base64 -d < body.b64 > bytes/<tag>/<path>             # 3969 / 4126 bytes             exit 0
sha256sum                                             # digests above                 exit 0
curl … ?format=JSON (tag metadata, both tags)         # HTTP 200 / 200                exit 0
diff -u 154/WebMCP.pdl 156/WebMCP.pdl                 # 1 hunk, +2 lines              exit 0
node -e '<range contiguity>'                          # both ranges hold              exit 0
node $S/mirror-check.mjs > pins/S099/f-checks.json    # all predicates true           exit 0
```

No tool installs or upgrades were needed (none recorded). Scratch dir
`/fast/scratch/hyaku/tabi-r29/PinS099` is seat-exclusive; nothing outside the lane's wave dir was
written. The lane gate `scripts/check-release-pins.mjs` was **not** run (parent owns post-integration
gates); my `f-checks.json` is a local mirror of its predicates, not a substitute for that gate.
