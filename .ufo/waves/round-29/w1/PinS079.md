# PinS079 — C3 re-open of registry row S079 at stable 156.0.8078.47

Seat: PinS079 (leaf). Wave: round 29 / w1. Milestone: C3 (freshness).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Scratch: `/fast/scratch/hyaku/tabi-r29/PinS079` (removed at end; every receipt below was copied into the output dir first).
Baseline revision: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`. Claims read first: `.ufo/waves/round-29/claims.json` (claim C3, population 23 / unresolved 23, stable `156.0.8078.47`).
Output dir: `.ufo/waves/round-29/w1/pins/S079/`.

**Bottom line: both cited files are 200 at both tags; both row digests match; all three anchored ranges hold at 156 (pure line shift, content byte-identical after normalisation). No drift ⇒ `superseded_by: null` and no superseding row was drafted (item step 6 is conditional on drift).**

## 1. What row S079 cites

`corpus/SOURCES.md:93`, cells verbatim (`awk -F'|'` gave NF=13 ⇒ 11 cells):

| cell | value |
|---|---|
| id | `S079` |
| source | `Chromium 154 WebMCP PDL and inspector emitter — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` |
| kind / tier | `code` / `A` |
| anchor | `tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; WebMCP.pdl:25–30,109–123 (SHA-256 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff); inspector_web_mcp_agent.cc:208–243 (SHA-256 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475)` |
| status / opened / recheck | `mined` / `2026-10-21` / `on-release` |
| used-by | `corpus/knowledge/webmcp-declarative-validation-round-19.md` |

Chromium source files cited: **exactly two**, both spelled out in full in the source cell, so no basename resolution from dossiers was needed.

| # | chromium/src path | how the row names it | anchored ranges, spelled as in the anchor |
|---|---|---|---|
| 1 | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | full URL in the source cell; anchor by basename | `25–30` and `109–123` (en dashes in the anchor) |
| 2 | `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | full URL in the source cell; anchor by basename | `208–243` |

Path resolution was *proved*, not assumed: at each tag the directory tree Gitiles returns for the containing directory lists exactly one entry per basename, and its git blob id equals `git hash-object` of the decoded bytes I fetched.

| tag | tree listing (HTTP 200) | listed blob id | `git hash-object` of decoded bytes |
|---|---|---|---|
| 154.0.8037.97 | `dir-listing-154.0.8037.97-domains.json` | `13490686045341e0e01e9572294856a2d37f2a32` WebMCP.pdl | `13490686045341e0e01e9572294856a2d37f2a32` |
| 154.0.8037.97 | `dir-listing-154.0.8037.97-inspector.json` | `cb3fa7b1af89c9146a209fb5313513fbf359d36e` inspector_web_mcp_agent.cc | `cb3fa7b1af89c9146a209fb5313513fbf359d36e` |
| 156.0.8078.47 | `dir-listing-156.0.8078.47-domains.json` | `48bd8be7969ba1295501a2f83908c41e9693a2a1` WebMCP.pdl | `48bd8be7969ba1295501a2f83908c41e9693a2a1` |
| 156.0.8078.47 | `dir-listing-156.0.8078.47-inspector.json` | `dfe9660e2ed8ab162f8341096ceed81f7af646de` inspector_web_mcp_agent.cc | `dfe9660e2ed8ab162f8341096ceed81f7af646de` |

(Both listings are Gitiles' `ls-tree`-style text body under `?format=TEXT`; grep count for each basename = 1, so the basename→path resolution is unique. The `.json` suffix is a filename convenience only.)

Tag→commit (`refs/tags/<tag>?format=JSON`, HTTP 200 each): `154.0.8037.97` = `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` — matches the commit the row records; `156.0.8078.47` = `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

## 2. Fetch of decoded bytes

Per file and tag, in scratch:

```
code=$(curl -sS --max-time 120 -o "$S/<tag>-<name>.b64" -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/$TAG/$P?format=TEXT")   # exit 0
base64 -d "$S/<tag>-<name>.b64" > "<outdir>/bytes/$TAG/$P"                            # exit 0
sha256sum "<outdir>/bytes/$TAG/$P"                                                    # exit 0
```

| path | tag | HTTP | b64 bytes | decoded bytes | lines (`split("\n")`) | decoded sha256 |
|---|---|---|---|---|---|---|
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | 154.0.8037.97 | **200** | 5292 | 3969 | 124 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | 156.0.8078.47 | **200** | 5504 | 4126 | 126 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` |
| `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | 154.0.8037.97 | **200** | 11448 | 8585 | 246 | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` |
| `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | 156.0.8078.47 | **200** | 11516 | 8635 | 247 | `2477d201dffd775be70fcd8fd286fc20755d1b020a4e8de2a84452a5b6ec2c53` |

Bytes are saved under `.ufo/waves/round-29/w1/pins/S079/bytes/<tag>/<exact chromium path>` (decoded, not base64). Command log: `pins/S079/fetch-log.txt`. No 404 anywhere.

The 156 `WebMCP.pdl` sha256 `f386bcfd…f99f` is identical to the value independently fetched by seat PinS041 (`pins/S041/entry.json`) for the same path/tag — a cross-seat byte agreement on one of my two files (the counter's f6 record still needs the separate re-fetch seat).

## 3. Row digest check

| row digest (abbrev/full) | file | 154 decoded sha256 | verdict |
|---|---|---|---|
| `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` (full) | WebMCP.pdl | `26e62f29…a37ff` | **MATCH** |
| `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` (full) | inspector_web_mcp_agent.cc | `1cc55ef9…68475` | **MATCH** |

f5-digest is satisfiable from either file; no mismatch to report.

## 4. Range verdicts (154 line numbers → 156)

Method identical to the frozen counter `scripts/check-release-pins.mjs` (`normLine` = trim + collapse inner whitespace; `blockIn` = contiguous match anywhere in the 156 file). Script: scratch `ranges.mjs`, output retained as `pins/S079/ranges-verdict.json`.

| file | range (154) | block lines | 156 location | verdict |
|---|---|---|---|---|
| WebMCP.pdl | `25–30` | 6 | **27–32** | **holds** (shift +2, content identical after normalisation) |
| WebMCP.pdl | `109–123` | 15 | **111–125** | **holds** (shift +2) |
| inspector_web_mcp_agent.cc | `208–243` | 36 | **209–244** | **holds** (shift +1) |

No range drifted, so no region diff is owed; whole-file diffs are retained as evidence of *where* the shift came from (`pins/S079/whole-file-*.diff`, `diff -u` exit 1 = differences present):

```
WebMCP.pdl  @@ -19,6 +19,8 @@   (added at 156 lines 22-23, before old line 22)
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
inspector_web_mcp_agent.cc  @@ -72,6 +72,7 @@   (added at 156 line 75)
+    builder.setDebugging(annotations->debugging);
```

Both insertions fall **outside** the three anchored ranges: PDL 22-23 precede old line 25; the `.cc` insertion at new line 75 precedes old line 208. Hence +2 / +1 uniform shift and zero in-range change. `grep -c debugging` on the 154 bytes = 0 for both files, so the field is genuinely new at 156.

## 5. entry.json (as written)

`pins/S079/entry.json` — `id` `S079`, `fetched_by` `PinS079`, `fetched_at` `2026-10-26T04:26:53Z`, `superseded_by` **null**, two files with `old_tag`/`new_tag` statuses 200/200, `old_bytes`/`new_bytes` at `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` (the counter's f3 path form), the four sha256 values above, and `ranges` `[[25,30],[109,123]]` / `[[208,243]]` — exactly the anchor's own ranges, in 154 line numbers, converted from the anchor's en dashes.

Shape acceptance was measured, not assumed: a **fixture** repo under scratch (`git init -q`, toplevel verified equal to the fixture dir, one commit, real lane `corpus/SOURCES.md` copied in, my bytes copied to the f3 paths, `receipt.json` = `{schema:"tabi-release-pins-v1", stable:"156.0.8078.47", rows:[S079 entry]}`, `refetch/S079.json` with seat `PinS079-shape-check-fixture`) was evaluated with the frozen counter read-only:

```
node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json   # exit 1
population 23, resolved 1, unresolved 22, reasons histogram {"r1-entry":22}
S079: {"resolved": true, "verdict": "holds", "reasons": []}
```

`exit 1` is expected and is *not* a verdict on S079: 22 other population rows have no entry in this one-row fixture. What it proves is that row S079 passes r1/f1/f2/f3/f4/f5/f6 with this entry and these bytes. Raw: `pins/S079/counter-dryrun-S079.json`. The fixture's refetch record is a labelled shape-check artefact only — **it is not the f6 independent re-fetch evidence**; a different seat must still commit `refetch/S079.json` in the lane, and the assembly seat must copy my bytes to the `corpus/evidence/round-29/release-pins/bytes/...` paths my entry names (I may not write tracked paths).

## 6. Superseding row: not triggered

Item step 6 applies only if a range drifted. Measured: 0 of 3 ranges drifted ⇒ no `supersede-row.md` was written, and `superseded_by` stays `null`. Nothing about S079's anchored subject matter (the `InvocationStatus` vocabulary, the `toolResponded` payload fields, Blink's outcome-to-event mapping) changed between 154 and 156.

## 7. Citing knowledge entry — observation only

`corpus/knowledge/webmcp-declarative-validation-round-19.md` is the only file under `corpus/knowledge/` mentioning S079 (`grep -rln` = 1 file, 5 hits: lines 3, 66, 114, 133, 154). Because nothing drifted, the claims.json kill rule's round-29 recheck-note requirement is not triggered. Recorded anyway for the parent:

- line 3 (`source: S079 — Chromium 154.0.8037.97 WebMCP.pdl … 26e62f29…`) remains byte-exact at 154, and the same bytes are still what 156 serves for the anchored ranges.
- line 66 cites `S079 :66` for `object input`. At 156 that declaration sits at **line 68** (`grep -n 'object input'` 154 → 66, 156 → 68) — a citation drift of +2 caused by the `debugging` insertion, not a content change. The entry words it as tag-154-pinned, so it is not wrong; it is only off by the shift if read against 156.
- lines 114/133/154 concern recheck cadence and the S097/S099 supersession of S079's *description*, not its bytes; unaffected.
- New at 156 and not covered by S079 (outside its anchor, so not a defect of this row): the `debugging` annotation (`WebMCP.pdl:23`, `inspector_web_mcp_agent.cc:75`).

## 8. Commands and exit codes

| command | exit |
|---|---|
| `curl … ?format=TEXT` ×4 (154/156 × 2 files) | 0 each, HTTP 200 each |
| `base64 -d` ×4 | 0 each |
| `sha256sum` on the 4 decoded files | 0 |
| `git hash-object` on the 4 decoded files (tree blob id comparison) | 0, all four ids equal to the tag's listing |
| `node ranges.mjs "$O"` (normLine + blockIn reproduction) | 0 |
| `diff -u 154 156` ×2 | 1 each (differences found — expected) |
| `curl … ?format=JSON` tag→commit ×2 | 0 each, HTTP 200 each |
| `grep -rln 'S079' corpus/knowledge/` | 0 (1 file) |
| fixture: `mktemp -d`, `git -C "$D" init -q`, `rev-parse --show-toplevel`, `add`, `commit` | 0 each; toplevel == `$D` |
| `node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json` | 1 (22 other rows entryless; S079 resolved/holds) |

Nothing was built, linted or formatted in the lane; no lane file, index or jj state was touched; no tool was installed or upgraded; scratch was deleted after the receipts were copied into the output dir.

## 9. Risks / hand-off notes

1. **f6 needs a real second seat.** My dry-run refetch is labelled a fixture and must not be committed as evidence.
2. **Bytes relocation.** `entry.json` names `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`; the four decoded files currently live only under `pins/S079/bytes/…`. If the assembly step diffs byte content, `WebMCP.pdl` at 156 is shared with S041/S099 — same sha256 `f386bcfd…f99f`, so one copy serves both rows without conflict.
3. **Whole-file sha256 changed for both files** while all ranges hold; a naive whole-file comparison would (wrongly) report drift. The counter compares ranges, so this is fine — flagged so nobody re-derives the verdict by whole-file hash.
4. **Population count** is 23 in the frozen counter at the real registry (`--repo` fixture with the real `SOURCES.md` reproduced it), consistent with claims.json.
