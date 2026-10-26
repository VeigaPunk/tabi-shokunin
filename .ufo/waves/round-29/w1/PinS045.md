# PinS045 — C3 re-open of registry row S045 at Chromium 156.0.8078.47

Seat: PinS045 (leaf executor, no dispatch). Round 29 attempt 1, wave w1, milestone C3.
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; lane HEAD at time of work
`97be89bc66139eb45526a04af59a35dccc006eb9` (claims commit), baseline `856fa9e1`.
Scratch `/fast/scratch/hyaku/tabi-r29/PinS045` (emptied at exit; receipts copied into the output dir first).

**Verdict: row S045 HOLDS at 156.0.8078.47 — 3/3 files hold, 4/4 anchored ranges hold, 0 files drifted,
0 ranges drifted. No superseding registry row drafted (none is due).** `entry.json` has
`"superseded_by": null`.

## 1. What the row cites

Registry row: `corpus/SOURCES.md:59`. Source cell carries exactly one URL; the anchor cell names two more
files by basename:

| # | chromium/src path | spelling in the anchor | anchor ranges (154 line numbers) | how resolved |
|---|---|---|---|---|
| 1 | `third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html` | full path in the source-cell URL at `refs/tags/154.0.8037.97/` | `87`, `113` (written `:87 and :113`) | source cell URL |
| 2 | `third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js` | `inspector-protocol/webmcp/invoke-tool.js` (prefix dropped) | `38-51` | `.ufo/waves/round-17/w1/SrcWebTests.md:52`, `.ufo/waves/round-18/w1/Recheck22.md:39`, `.ufo/waves/round-17/w2/ReopenS045.md:65` (dossier notes the anchor's missing prefix) |
| 3 | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | `WebMCP.pdl` | `68` | `.ufo/waves/round-16/w1/SrcChromiumPdl.md:13`, `corpus/evidence/round-18/source-recheck/S041.json` |

Anchor tag binding checked independently: Gitiles `+/refs/tags/154.0.8037.97?format=JSON` → HTTP 200,
`commit = b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` — identical to the commit the anchor spells.
`refs/tags/156.0.8078.47` → HTTP 200, commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

## 2. Fetches, statuses, digests

Gitiles `?format=TEXT` + `base64 -d`, all six URLs at 200:

| tag | chromium path | HTTP | bytes | decoded sha256 |
|---|---|---|---|---|
| 154.0.8037.97 | …/executeTool-abort.https.html | **200** | 8013 | `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e` |
| 154.0.8037.97 | …/inspector-protocol/webmcp/invoke-tool.js | **200** | 2782 | `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` |
| 154.0.8037.97 | …/domains/WebMCP.pdl | **200** | 3969 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| 156.0.8078.47 | …/executeTool-abort.https.html | **200** | 9519 | `bf847908421e81d2903cb23de9fc4d66eda2681dabf66436803a48912dd60c67` |
| 156.0.8078.47 | …/inspector-protocol/webmcp/invoke-tool.js | **200** | 2782 | `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` (byte-identical) |
| 156.0.8078.47 | …/domains/WebMCP.pdl | **200** | 4126 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` |

Bytes are saved at `.ufo/waves/round-29/w1/pins/S045/bytes/<tag>/<chromium path>` (exact chromium path,
decoded, non-empty). `find … -printf '%s %p'` and `sha256sum` re-run over the saved tree reproduce the table
above (exit 0).

Independent corroboration of the 154 bodies against earlier rounds: 154 `WebMCP.pdl` decoded sha equals the
round-17/18/19 dossier digest `26e62f29…0a37ff`, its as-served base64 sha `0ea9bf3f…d47e4` equals
`corpus/knowledge/source-recheck-round-18.md:90`; 154 html as-served base64 sha prefix `b1300c0657f1`
equals `corpus/knowledge/source-recheck-round-18.md:94`; 154 `invoke-tool.js` sha equals
`.ufo/waves/round-17/w1/SrcWebTests.md:52`. Nothing fabricated: every digest is from a fetch executed in
this seat.

## 3. Registry digest binding

The row records **no** digest. Scanning `source + anchor` with the counter's own `rowDigests` regexes gives
`full64: []` and `abbr: []` (exit 0). The only long hex string is the 40-char Gitiles commit
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, which is a commit id, not a sha256. So `f5-digest` does not
apply to this row; there is nothing to match or mismatch.

## 4. Range-by-range verdict (154 block, trimmed + collapsed, matched contiguously in the 156 file)

| chromium path | 154 range | verdict | now at (156) | 154 anchor line (verbatim) |
|---|---|---|---|---|
| …/executeTool-abort.https.html | `87` | **holds** | 108 | `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);` |
| …/executeTool-abort.https.html | `113` | **holds** | 143 | `assert_equals(executionRejectionValue, 'already aborted');` |
| …/inspector-protocol/webmcp/invoke-tool.js | `38-51` | **holds** | 38-51 (identical file) | `let response = await dp.WebMCP.invokeTool({ … });` … `toolResponded invocationId matches` |
| …/domains/WebMCP.pdl | `68` | **holds** | 70 | `# Unique identifier for this invocation. Response is sent before tool events.` |

No file is a 404/absence row and no 404 appeared at either tag, so the absence branch of the counter does not
apply. Old line counts (206 / 89 / 124) all bound their ranges, so `f4-ranges` is satisfiable verbatim:
token `87`, `113`, `38-51`, `68` are each present in the row's anchor cell (checked with the counter's own
`anchorHasRange` regex construction, exit 0). Because nothing drifted, no unified diff of a drifted region is
owed; the whole-file diffs are nevertheless in the scratch run and are summarised in §5.

## 5. What changed at 156 despite the ranges holding (freshness context, not a verdict change)

- `executeTool-abort.https.html` 8013 → 9519 B (+1506, 206 → 236 lines). The diff is API re-pointing, not a
  change of the anchored assertions: dispatch moves from `window.addEventListener('toolcancel'/'toolactivated')`
  to `document.modelContext.addEventListener(…)` with `t.add_cleanup` removal; events are now asserted as
  `ToolActivatedEvent` / `ToolCancelEvent` instances with `target === document.modelContext`; and
  `executeTool(tool, '{}')` becomes `executeTool(tool, {})` (the JSON-string input form is gone). The two
  anchored asserts (`:87`, `:113`) and the `'custom cancellation reason'` rejection text are unchanged.
- `WebMCP.pdl` 3969 → 4126 B (124 → 126 lines): one field block inserted at 156:21-22
  (`# If true, indicates that the tool is intended for debugging and developer tooling rather than end-user
  interactions.` + `optional boolean debugging`), which is what shifts :68 to :70.
- `invoke-tool.js` is byte-identical at both tags.

## 6. Superseding row

Not drafted, correctly: the counter resolves a row as `holds` when every file holds, and every file here
holds, so `s1-drift-unsuperseded` never fires and a `supersedes S045 —` row would be a false claim of drift.
The 11-cell draft and the per-citing-entry recheck notes the item asks for on drift are therefore not written;
`superseded_by` stays `null`.

Citing knowledge entry (`used-by`): `corpus/knowledge/webmcp-invocation-round-17.md`. What it now gets wrong:
**nothing that its own text asserts** — it mentions S045 once, at :97, only to say "upstream web-test
expectations (S045) are not re-run here", and it makes no claim about the anchored lines or about
window-level event dispatch. Observation for the L1 (not a defect in this row): the 156 web test shows the
page-side events are now dispatched on `document.modelContext` rather than `window`; any future knowledge doc
that generalises from this row's test file to "toolcancel fires on window" would be wrong at 156.

## 7. Commands and exit codes (all run by this seat)

```
# 1. registry + claims reads
awk 'NR==59' corpus/SOURCES.md                                                 # exit 0
# 2. fetches (6 URLs; one helper, per URL:)
curl -sS --max-time 120 -A 'tabi-shokunin-r29-pins/1' -o <b64> -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'   # HTTP 200 each
base64 -d < <b64> > .ufo/waves/round-29/w1/pins/S045/bytes/<tag>/<path>        # exit 0 each
find "$P/bytes" -type f | sort | xargs sha256sum                              # exit 0 (§2 digests)
# 3. tag commit binding
curl … 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON'  # 200, b510e9d7…
curl … 'https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47?format=JSON'  # 200, 1d17a2e2…
# 4. range comparison (node cmp.mjs: trim + collapse, contiguous block search)
node cmp.mjs > cmp.json                                                        # exit 0, 4/4 holds
# 5. entry self-check against the row's own cells (counter regexes re-implemented)
node selfcheck.mjs                                                             # exit 0, f1/f2/f4 all true
# 6. read-only lane state
git -C <lane> status --porcelain          # exit 0, untracked round-29 scaffolding only
git -C <lane> rev-parse HEAD              # exit 0, 97be89bc66139eb45526a04af59a35dccc006eb9
```

Counter `scripts/check-release-pins.mjs` and `--selftest` were **not** run by this seat (the parent owns
post-integration gates; this seat produces the receipt data, not the verdict).

## 8. Deliverables written

- `.ufo/waves/round-29/w1/pins/S045/entry.json` — the exact 6-field-per-file shape requested,
  `fetched_by: "PinS045"`, `fetched_at: "2026-10-26T04:23:25Z"`, `superseded_by: null`, byte paths rooted at
  `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` (the counter's `f3-bytes` shape), ranges
  `[[87,87],[113,113]]`, `[[38,51]]`, `[[68,68]]`.
- `.ufo/waves/round-29/w1/pins/S045/bytes/154.0.8037.97/{…3 files}` and
  `…/bytes/156.0.8078.47/{…3 files}` — decoded bytes at exact chromium paths.
- `.ufo/waves/round-29/w1/pins/S045/fetch-log.txt` — per-URL command, HTTP status, sizes, decoded and
  as-served-base64 sha256, range table, control reads.
- `.ufo/waves/round-29/w1/pins/S045/ranges-verdict.json` — machine-readable per-file/per-range verdict with
  156 line positions.
- `.ufo/waves/round-29/w1/pins/S045/compare-ranges.mjs` and `…/selfcheck-entry.mjs` — the two scripts that
  produced §2/§4 and §1/§4 checks (both exit 0 as run); `…/html-154-vs-156.diff` — the full 156-vs-154 diff of
  the WPT file summarised in §5.
- this report.

Scratch `/fast/scratch/hyaku/tabi-r29/PinS045` was removed after the receipts were copied (`rm -rf` exit 0,
path no longer exists); no git clone was needed and none was made; no lane tracked file, index or jj state was
touched (only known-untracked round-29 wave paths were created).

## 9. Risks and blockers

1. **`f6-refetch` has no producer in wave w1.** The counter resolves S045 only if
   `corpus/evidence/round-29/release-pins/refetch/S045.json` exists with a `seat` different from
   `entry.fetched_by` (`PinS045`), listing each path at `156.0.8078.47` with `status 200` and the sha256s in
   §2. `.ufo/waves/round-29/w1/swarm-registry.json` contains no refetch seat (Pin seats, Crit/Rev/Mut, Conn,
   Scout, Scribe only) and `corpus/evidence/round-29/release-pins/` does not exist yet at
   `97be89bc`. Without an independent seat's re-fetch record, S045 — and every other pinned row — reports
   `f6-refetch` as an unresolved reason even though the bytes are correct. I did not fabricate that record:
   it is by construction a different seat's artifact.
2. **Byte promotion is the aggregator's step.** My `entry.json` points at
   `corpus/evidence/round-29/release-pins/bytes/…`; the bytes currently live only under
   `.ufo/waves/round-29/w1/pins/S045/bytes/…`. Whoever assembles `receipt.json` must copy them byte-for-byte
   (promoting by re-encoding would change nothing only if the copy is exact — verify with the §2 sha256s).
3. **Anchor prefix is still wrong in the registry.** `inspector-protocol/webmcp/invoke-tool.js` omits
   `third_party/blink/web_tests/`. The counter tolerates it via `basename` binding, so it is not an
   unresolved reason, but it stays a readability defect a superseding row would have to fix — not this seat's
   to rewrite since no drift justifies a supersession.
4. No tool was installed or upgraded (no pacman/uv/npx/binary use); `node`, `python3`, `curl`, `base64`,
   `git`, `jq` were already present.
