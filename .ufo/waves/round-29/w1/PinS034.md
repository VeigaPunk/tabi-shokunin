# PinS034 — C3 re-open of registry row S034 at Chromium 156.0.8078.47

Seat: `PinS034` (leaf). Milestone C3, wave w1, round 29 attempt 1 (run-8 fresh start).
Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims frozen before data in
`97be89bc66139eb45526a04af59a35dccc006eb9`. Read first: `.ufo/waves/round-29/claims.json`
(claim C3) and the frozen counter `scripts/check-release-pins.mjs`.

## Verdict (headline)

**S034 holds at the new stable tag. No drift, no supersession row, no knowledge-entry
correction owed.** One Chromium file, one anchored range, range content byte-identical
(whitespace-normalized) at 156.0.8078.47, shifted `+181` lines. Registry digest
`99b92e67…1d2b` matches the 154 decoded sha256 exactly.

Artifacts: `.ufo/waves/round-29/w1/pins/S034/{entry.json,bytes/,raw_*.b64,region.diff}`.

## 1. Files the row cites

Registry line (SOURCES.md:48), cells as parsed by the counter
(`cells = line.split("|").map(trim)`, 13 parts):

| cell | value |
|---|---|
| id | `S034` |
| source | `Chromium 154 runtime_enabled_features.json5 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5` |
| anchor | `tag 154.0.8037.97, lines 7023-7050, sha256 99b92e67…1d2b` |
| teaches | `WebMCP is experimental and implied by WebMCPTesting at 154; no DeclarativeWebmcp feature exists there, so that flag token is inert` |
| recheck | `on-release` |
| used-by | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` |

Chromium source files cited: **exactly one**.

| # | chromium/src path | origin | anchor ranges spelled in the anchor |
|---|---|---|---|
| 1 | `third_party/blink/renderer/platform/runtime_enabled_features.json5` | source-cell URL (the only URL); the anchor names no basename, so no resolution from `used-by` or wave dossiers was needed | `7023-7050` |

No 404/absence row here: the row cites a present file, so the absence branch of the
counter (`old_status 404`) does not apply.

## 2. Fetches (read-only HTTPS GET, Gitiles `?format=TEXT`, base64 on 200)

| tag | URL path | HTTP status | wire bytes (base64) | decoded bytes | decoded lines |
|---|---|---|---|---|---|
| 154.0.8037.97 | `…/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT` | **200** | 310220 | 232665 | 7428 (`wc -l`; 7429 split elements, trailing empty) |
| 156.0.8078.47 | `…/+/refs/tags/156.0.8078.47/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT` | **200** | 321936 | 241452 | 7634 (`wc -l`; 7635 split elements) |

Decoded sha256:

| tag | sha256 |
|---|---|
| 154.0.8037.97 | `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` |
| 156.0.8078.47 | `5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4` |

Saved at `.ufo/waves/round-29/w1/pins/S034/bytes/<tag>/third_party/blink/renderer/platform/runtime_enabled_features.json5`
(exact chromium path under each tag). Raw Gitiles base64 kept beside them as the wire receipt
(`raw_154.0.8037.97.b64`, `raw_156.0.8078.47.b64`).

## 3. Registry digest

Row digest is abbreviated (`8 hex … 4 hex`), so the counter's rule is
prefix+suffix on some file's `old_sha256`:
`sha256.startsWith("99b92e67") && sha256.endsWith("1d2b")`.

Result: **MATCH.** `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b`
starts `99b92e67` and ends `1d2b`. This also independently confirms byte-fidelity of the
Gitiles decode (the digest in the registry was recorded in an earlier round).

## 4. Per-range verdict at 156.0.8078.47

Method = the counter's own comparison (`normLine = line.trim()` with inner whitespace
collapsed to one space; the normalized old range must occur as one contiguous block
anywhere in the normalized new file).

| file | range (154 line numbers) | verdict | where it now sits at 156 | unified diff of region |
|---|---|---|---|---|
| `…/runtime_enabled_features.json5` | `7023-7050` (28 lines) | **HOLDS** (block identical, shifted) | **7204-7231** (`+181`) | `.ufo/waves/round-29/w1/pins/S034/region.diff` — *"REGION IDENTICAL (0 diff lines)"* for old `7015-7058` vs new `7196-7239` |

Boundary anchors confirming the offset (old → new): `7023 name: "WebMCP",` → `7204`;
`7035 status: "experimental",` → old 7035's line is inside the identical block and the
knowledge entry's sub-range `7023-7035` maps to **7204-7216**; `7050 },` closes
`WebMCPTesting` inside the same block.

Whole-file context, for honesty about what did *not* move the verdict: the file changed
outside the anchored range — 138 non-equal opcodes, 515 lines inserted and 309 deleted
(sizes 7429 → 7635 split lines). The row is pinned to one range, so the range comparison is
the binding one, and it holds.

`teaches` spot-check at 156 (not required by the counter, checked because the row's claim is
semantic):

- `WebMCP` is still `status: "experimental"` with `origin_trial_feature_name: "WebMCP"`,
  `public: true`, `base_feature_status: "enabled"`, `copied_from_base_feature_if: "overridden"`
  (156 lines 7204-7211).
- `implied_by` is still exactly `["WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting"]`
  (156 lines 7212-7215).
- No runtime feature named `DeclarativeWebmcp` exists at 156 either — a combined
  `grep -n` for `DeclarativeWebmcp|"WebMCP"|WebMCPTesting|WebMCPDeclarativeFileInput|WebMCPFormAssociatedCustomElements`
  matched only the seven `WebMCP*` lines above and no `DeclarativeWebmcp` line, so the
  "flag token is inert / no such declaration" part of `teaches` still holds at 156.

## 5. Entry written

`.ufo/waves/round-29/w1/pins/S034/entry.json` (sha256 `c978b0f954479daf8150c20362f1cf5517906659ba1bc415d193f594eadb81bb`),
exactly the required shape: `id S034`, `fetched_by PinS034`, `fetched_at 2026-10-26T04:23:34Z`,
`superseded_by null`, one file with `old_status 200`, `new_status 200`,
`old_bytes`/`new_bytes` naming the committed location
`corpus/evidence/round-29/release-pins/bytes/<tag>/third_party/blink/renderer/platform/runtime_enabled_features.json5`,
both sha256s as above, `ranges [[7023,7050]]`.

## 6. Supersession

**Not applicable — nothing drifted. `supersede-row.md` intentionally not written.** The item
makes the draft conditional on a drifted range; manufacturing one for a holding row would be
a false freshness claim. Consequently no `teaches: supersedes S034 — …` row and no round-29
recheck note in `corpus/knowledge/webmcp-chromium-loopback-round-16.md` is required by the C3
kill rule (that rule fires only for drifted rows).

Advisory only (no ledger edit, no correction owed): the knowledge entry's
`verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97 …)` and its citation
"`S034, lines 7023-7035`" remain true *of the 154 pin they name*; at 156.0.8078.47 the same
bytes sit at 7204-7216. Since the entry is explicitly scoped to Chromium 154, this is a
line-number offset on a newer tag, not an error in the entry, and I did not touch the file
(lane tracked files are read-only for this seat).

## Commands run and exit codes

All in `$S=/fast/scratch/hyaku/tabi-r29/PinS034` (TMPDIR-scoped scratch, removed at the end;
receipts copied into the output dir first), plus read-only `git`/`grep`/`sed` in the lane.

```
# read
sed -n '48p' corpus/SOURCES.md | awk -F'|' '{print "cells="NF-1; …}'                     exit 0   (cells=12 → 13 split parts)
cat .ufo/waves/round-29/claims.json                                                      exit 0
sed -n '1,340p' scripts/check-release-pins.mjs ; sed -n '340,520p' …                     exit 0
grep -n 'S034\|154\.0\.8037\.97\|7023' corpus/knowledge/webmcp-chromium-loopback-round-16.md   exit 0

# fetch (both tags, one loop)
curl -sS -w '%{http_code}' -o "raw_$tag.b64" \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/$tag/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT"
#   printed: 154.0.8037.97 status=200 bytes=310220 ; 156.0.8078.47 status=200 bytes=321936
                                                                                          exit 0

# decode + hash
base64 -d "raw_$tag.b64" > "bytes/$tag/$P"; wc -l; sha256sum                             exit 0
#   154 => lines=7428 sha=99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b
#   156 => lines=7634 sha=5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4

# teaches spot-check at both tags
grep -n 'DeclarativeWebmcp\|"WebMCP"\|WebMCPTesting\|WebMCPDeclarativeFileInput\|WebMCPFormAssociatedCustomElements' bytes/$tag/$P
                                                                                          exit 0 (no DeclarativeWebmcp line at either tag)

# range verdict (normalized contiguous-block search, per counter normLine/blockIn)
python3 (eval): hits at 1-based starts = [7204] ; sub-range 7023-7035 -> [7204]          computed
# region diff: difflib.unified_diff(old 7015-7058, new 7196-7239) -> 0 lines
# whole file: 138 non-equal opcodes, +515 / -309 lines

# final artifact hashes
sha256sum entry.json region.diff bytes/*/third_party/blink/renderer/platform/runtime_enabled_features.json5   exit 0
#   entry.json                c978b0f954479daf8150c20362f1cf5517906659ba1bc415d193f594eadb81bb
#   region.diff               ceaae34ce24ed03109aa05ce8b37a8c6fb30b1c55915749758901af639305d24
#   bytes/154…/runtime_enabled_features.json5  99b92e67…1d2b
#   bytes/156…/runtime_enabled_features.json5  5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4

# scratch cleanup
rm -rf /fast/scratch/hyaku/tabi-r29/PinS034                                                   exit 0
```

Tool installs/upgrades: **none** (only curl, base64, sha256sum, node, python3 already present;
no pacman, uv, npx, cargo or npm transaction attempted).

## Risks / blockers / what the wave still owes for S034

1. **f6-refetch is not produced by this seat.** The frozen counter requires
   `corpus/evidence/round-29/release-pins/refetch/S034.json` from a seat other than
   `PinS034`, listing `path`, `tag 156.0.8078.47`, `status 200`,
   `sha256 5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4`. That record does
   not exist yet (`corpus/evidence/round-29/` is absent at the baseline tip). Until it lands,
   S034 is unresolved by `f6-refetch` even though f1-f5 and the verdict computation pass.
2. **Bytes are not yet committed at the lane path** the entry names
   (`corpus/evidence/round-29/release-pins/bytes/…`). My copies live under this wave's output
   dir; the merge owner must copy them byte-for-byte (sha256 above) into the committed
   location before the entry resolves under `f3-bytes`.
3. I did **not** run `node scripts/check-release-pins.mjs` (lane gates are the parent's
   post-integration work, and the receipt population was incomplete during this edit wave).
   The per-row verdict above is computed independently with the counter's own normalization
   rule, not read from a gate run.
4. Normalization caveat: the hold is under trim + inner-whitespace collapse, exactly the
   counter's comparison. Raw-bytes equality does not hold (whole file changed: 138 hunks), so
   any future change to the counter that compares ranges byte-for-byte would flip this row to
   drifted; the anchored range itself is identical in content.
5. Read-only network only: two HTTPS GETs to `chromium.googlesource.com` (public Gitiles),
   both 200; no cookies, credentials, logins or session material used.
