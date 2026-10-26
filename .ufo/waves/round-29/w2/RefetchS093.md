# RefetchS093 — C3 independent re-fetch and attack of registry row S093

Seat: RefetchS093 (leaf, wave w2, round 29). Milestone C3.
Frozen tip measured: `32008a453737a27f69e9ab401d0b9775d2a944f7` (clean `git clone --shared`, porcelain empty).
Lane checkout at seat start was `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (two commits ahead of the assigned tip; used read-only, and also checked there for a refetch record: none).
Scratch: `/fast/scratch/hyaku/tabi-r29/RefetchS093` (all bytes and probe commits live there, never in the lane).

Deliverable written: `.ufo/waves/round-29/w2/refetch/S093.json` — values are from **my** Gitiles fetches, not copied from the receipt.

## 1. Independent fetch at 156.0.8078.47 (and 154.0.8037.97)

Commands (each executed once; output saved under my scratch):

```
curl -sS -o <out>.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'
base64 -d <out>.b64 > <out>
sha256sum <out>; git hash-object <out>
```

| tag | file | HTTP | b64 bytes | decoded bytes | lines (split) | sha256 | git blob id |
|---|---|---|---|---|---|---|---|
| 156.0.8078.47 | form_mcp_schema.cc | 200 | 68940 | 51703 | 1441 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `9c546c66839da38bde273f5dd43042ff9785ce76` |
| 156.0.8078.47 | form_mcp_schema.h | 200 | 12324 | 9243 | 206 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` | `e7e1a608909d1db4f2f330ca6a1cf488463fbda5` |
| 154.0.8037.97 | form_mcp_schema.cc | 200 | 68940 | 51703 | 1441 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `9c546c66839da38bde273f5dd43042ff9785ce76` |
| 154.0.8037.97 | form_mcp_schema.h | 200 | 12324 | 9243 | 206 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` | `e7e1a608909d1db4f2f330ca6a1cf488463fbda5` |

Tag-identity controls (mine, `?format=JSON`, stripped the `)]}'` prefix; `chrome/VERSION` via `?format=TEXT`):

- `refs/tags/154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (matches the row's recorded commit), VERSION `154.0.8037.97`, HTTP 200.
- `refs/tags/156.0.8078.47` → commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`, VERSION `156.0.8078.47`, HTTP 200.
- Directory listing at both tags (`.../core/html/forms/?format=JSON`) reports the **same** blob ids for both files at both tags (`9c546c66…`, `e7e1a608…`), so the equality is a property of the two distinct tag commits, not of one endpoint served twice.

### Per-file agreement with the committed receipt

| file | receipt old_sha256 | mine @154 | receipt new_sha256 | mine @156 | verdict |
|---|---|---|---|---|---|
| form_mcp_schema.cc | `904b75e7…2152f` | `904b75e7…2152f` | `904b75e7…2152f` | `904b75e7…2152f` | **agree** |
| form_mcp_schema.h | `e44593c0…340f7` | `e44593c0…340f7` | `e44593c0…340f7` | `e44593c0…340f7` | **agree** |

Byte authenticity: `cmp` of my four fetched files against the committed blobs at `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/third_party/blink/renderer/core/html/forms/form_mcp_schema.{cc,h}` at the frozen tip → `IDENTICAL` in all four cases; `sha256sum` of the committed blobs reproduces the receipt's old/new digests. So the receipt's `new_sha256 == old_sha256` is genuine no-change, not old bytes re-filed as new.

## 2. Verdict recomputed from committed 154 bytes + my 156 bytes

Rule replicated exactly from `scripts/check-release-pins.mjs`: per range, take `oldLines[a-1..b]`, apply `trim()` + `\s+ → " "` (`normLine`, :157), require a contiguous match anywhere in the normalised new lines (`blockIn`, :159-167); with no ranges, whole-file sha256 equality. My replay over the frozen receipt entry:

```
form_mcp_schema.cc old_sha_match True new_sha_match True old_lines 1441
  range 121-181   len 61  block_in_new True  b<=oldlines True
  range 491-539   len 49  block_in_new True  b<=oldlines True
  range 556-928   len 373 block_in_new True  b<=oldlines True
  range 1095-1236 len 142 block_in_new True  b<=oldlines True
  range 1238-1438 len 201 block_in_new True  b<=oldlines True
  whole-file equal True
form_mcp_schema.h old_sha_match True new_sha_match True old_lines 206
  range 41-50   len 10 block_in_new True  b<=oldlines True
  range 56-121  len 66 block_in_new True  b<=oldlines True
  range 148-158 len 11 block_in_new True  b<=oldlines True
  whole-file equal True
```

**Verdict: holds** (both files unchanged; all 8 anchored ranges present at their original line numbers).

Counter cross-check at the frozen tip:

```
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1
population 23, resolved 0, unresolved 23
S093 -> {resolved:false, verdict:null, reasons:["f6-refetch …cc","f6-refetch …h"]}
```

At `32008a45` the refetch directory does not exist (`git ls-tree -r 32008a45 corpus/evidence/round-29/release-pins/ | grep refetch` → empty; also empty at `e1e3a15`), so the counter stops before computing the row verdict: the row's **file verdict is holds**, but at that revision the row is *unresolved on f6 only*. Re-running in my scratch clone with my `S093.json` committed (`c3285452…`):

```
S093 -> {resolved:true, verdict:"holds", reasons:[]}; population 23, resolved 1, holds 1
```

So "S093 computed as holding" is confirmed at the verdict level, and my refetch record is the one that lets the gate reach that verdict.

### ±25-line context around each anchored block (156 bytes)

All eight context windows are byte-identical between 154 and 156 (and the whole files are identical), so there is **no change outside any block that could alter what the row's teaches cell asserts**:

```
cc block 121-181   window   96-206  identical=True
cc block 491-539   window  466-564  identical=True
cc block 556-928   window  531-953  identical=True
cc block 1095-1236 window 1070-1261 identical=True
cc block 1238-1438 window 1213-1441 identical=True
h  block 41-50     window   16-75   identical=True
h  block 56-121    window   31-146  identical=True
h  block 148-158   window  123-183  identical=True
```

## 3. Filing completeness (row S093)

Anchor cell (`corpus/SOURCES.md:107`) cites:

- `.cc:121-181, 491-539, 556-928, 1095-1236, 1238-1438` — receipt files exactly `[[121,181],[491,539],[556,928],[1095,1236],[1238,1438]]`; missing none, extra none.
- `.h:41-50, 56-121, 148-158` — receipt files exactly `[[41,50],[56,121],[148,158]]`; missing none, extra none.
- Files cited (`.cc`, `.h`) = files filed (2 of 2). Anchor digest `904b75e7…` = `.cc` `old_sha256` (f5 pass). Anchor commit `b510e9d7…` = my independently fetched 154 tag commit.

**S093 itself is completely filed** — the subset-filing hole below is a counter defect, not an S093 receipt defect.

Receipt row is verbatim the wave-1 seat output: `git show e1e3a15:.ufo/waves/round-29/w1/pins/S093/entry.json` deep-equals the frozen receipt's S093 row (`superseded_by` null in both).

## 4. Attack findings (line evidence)

### A1 — CONFIRMED, counter-level: the counter accepts subset filing, and a partial filing can hide real drift

`scripts/check-release-pins.mjs:202` iterates only `entry.files`; `:232-242` checks only the ranges present in the entry; `:234` requires each filed range token to occur in the anchor, but nothing requires the anchor's cited ranges (or files) to be filed. Probe results in the scratch clone (each a separate commit; counter run at that commit, `--stable 156.0.8078.47`):

| probe | receipt change for S093 | counter result |
|---|---|---|
| subset ranges | file only `[121,181]` (.cc) and `[41,50]` (.h) of the 8 cited ranges | `resolved:true, verdict:"holds"` |
| subset files | drop the entire cited `.h` entry, keep `.cc` only | `resolved:true, verdict:"holds"` |
| **hidden drift** | 156 `.cc` line 600 (inside cited block 556-928) mutated to `… // DRIFT-PROBE`; receipt `new_sha256` and refetch sha updated to the mutated bytes; file only `[121,181]` | `resolved:true, verdict:"holds"` |
| contrast | same mutated bytes, all five cited `.cc` ranges filed | `resolved:false, verdict:"drifted", reasons:["s1-drift-unsuperseded"]` |

Line evidence: mutated line was `  // We cannot use the "date-time" type from json schema because that accepts` → `… accepts // DRIFT-PROBE` (file line 600, inside the row's own `556-928` block); mutated sha `48d83cbb863914e4e9acdc38318d8047d5ef7cc87097e0a3b3d66dda1b46fb2a`. The counter cannot see it because f4 only walks filed ranges, and f6 is satisfied by a refetch record that (necessarily) carries the same sha.

Impact: the header comment at `:44-46` ("Copying old bytes in as new bytes therefore fails wherever the file changed") holds only under complete filing; a w2 refetch seat that files a single convenient range turns the gate green over an unread region. Smallest safe correction: in f4, compute the anchor-cited ranges (and anchor-named files) and require them to be a subset of the filed ranges/files per entry — i.e. reject an entry whose filing is not a superset of the anchor's citations — or compare whole files whenever the anchor cites more than one range.

### A2 — duplicate authority: three population rows resolve on one Blink blob, and prose supersession is not enforced for non-drifted rows

- `S077` (SOURCES.md:91), `S093` (:107) and `S098` (:112) all pin `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` at 154, all three are `recheck=on-release`, all three are in the 23-row population, and all three receipt entries carry the same `old_sha256` `904b75e7…` (S077 files `49-111, 208-490, 930-1093, 1238-1438`; S098 files `491-928` plus `583`; S093 files the full 8-range set including both files).
- S098's teaches cell opens exactly `supersedes S093 — …` (:112), yet S093's frozen receipt has `superseded_by: null`, and S093's registry status remains `queued` with `used-by —`; S098 is also `queued`.
- The counter consults `superseded_by` only when the row is drifted (`:250-253`), so a non-drifted row that the registry already declares superseded still counts as an independent resolved row. Freshness here is technically true (bytes unchanged) but the population over-counts one source by three and a reader of S093 alone is not told S098 supersedes it.

Smallest safe correction: either set S093's `superseded_by` to `S098` (and make the supersede rule apply regardless of drift), or drop S093 from the on-release population once S098's supersede row exists. This is a filing/authority decision for the L1, not a code change I may make.

### A3 — scope wording falsified by the refetch: "at Chromium tag 154.0.8037.97 only"

S093's scope cell reads `Form-derived declarative WebMCP inputSchema construction at Chromium tag 154.0.8037.97 only`. My 156 fetch shows the same bytes (`904b75e7…`) still ship at stable 156.0.8078.47, so the implementation is not present "only" at 154. If "only" means "the claim was read only from 154", the wording is merely ambiguous; if it asserts presence only at 154, the refetch falsifies it. No counter impact (the row is `holds`, not drifted), but the row's own freshness evidence contradicts its scope qualifier. Smallest correction: reword to "read at Chromium tag 154.0.8037.97; unchanged at 156.0.8078.47" (or drop "only").

### A4 — f6 is a trust record, not a reproducible fetch

`:218` accepts any committed `refetch/<id>.json` whose `seat` differs from `fetched_by` and whose `path/tag/status/sha256` match the receipt; it never re-derives the bytes and never checks `fetched_at`. For S093 the values are now corroborated by my independent fetch (this report), but the check by itself would equally accept a fabricated record — as probes A1 show. Optional hardening: require the refetch record's `fetched_at` to be later than the entry's, and/or require a committed raw base64 blob per file so the sha is recomputable.

### Non-findings

- 404 nonce normalisation (S094 rule): **not applicable** to S093 — both files are 200 at both tags, no `request_id` body involved.
- f1/f2/f3/f4/f5 all pass for S093 at the frozen tip; the only reason the counter gives is f6 (missing record at that revision), which my record closes.
- No tool installs or upgrades were performed (nothing needed).

## 5. Commands and exit codes (verbatim, abbreviated paths)

```
# fetch (×4: {154,156}×{.cc,.h}); every curl printed http=200
curl -sS -o "$S/fetch/<tag>/<name>.b64" -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'
base64 -d "$S/fetch/<tag>/<name>.b64" > "$S/fetch/<tag>/<name>"        # exit 0 each
sha256sum "$S/fetch/<tag>/<name>"                                      # exit 0
git hash-object "$S/fetch/<tag>/<name>"                                # exit 0
cmp -s "$S/fetch/<tag>/<name>" "$S/lane/corpus/evidence/round-29/release-pins/bytes/<tag>/<path>"   # exit 0 ×4 (IDENTICAL)
curl … 'refs/tags/<tag>?format=JSON' (×2)                              # http=200
curl … '…/core/html/forms/?format=JSON' (×2)                           # http=200, same blob ids both tags
curl … 'refs/tags/<tag>/chrome/VERSION?format=TEXT' (×2)               # http=200, 154.0.8037.97 / 156.0.8078.47
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1 (23 unresolved, all f6)
# scratch-clone probe commits (clone only, never the lane):
git -C "$S/lane" commit … (refetch record)      -> counter: S093 resolved holds     # exit 1 overall
git -C "$S/lane" commit … (subset ranges)       -> counter: S093 resolved holds     # exit 1 overall
git -C "$S/lane" commit … (drop cited .h)       -> counter: S093 resolved holds     # exit 1 overall
git -C "$S/lane" commit … (hidden drift)        -> counter: S093 resolved holds     # exit 1 overall
git -C "$S/lane" commit … (full filing)         -> counter: S093 drifted/unsuperseded # exit 1 overall
```
