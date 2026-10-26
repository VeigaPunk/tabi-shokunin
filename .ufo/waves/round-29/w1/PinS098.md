# PinS098 — C3 re-open of registry row S098 at Chromium tag 156.0.8078.47

Seat PinS098 (executor, leaf). Milestone C3 (freshness), wave tabi-r29-w1.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` at HEAD `97be89bc66139eb45526a04af59a35dccc006eb9` (claims commit).
Output dir: `.ufo/waves/round-29/w1/pins/S098/`. Scratch: `/fast/scratch/hyaku/tabi-r29/PinS098` (removed at exit).

## Verdict (one line)

**S098 holds at 156.0.8078.47 with zero drift.** `form_mcp_schema.cc` is byte-identical at
154.0.8037.97 and 156.0.8078.47 (same sha256, both HTTP 200), both anchored ranges (491-928,
583) are present verbatim at the same line numbers, the row's recorded digest matches, so **no
superseding row is needed** and none was drafted.

## 1. Row parse and cited-file enumeration

`corpus/SOURCES.md:112` — 11 registry columns (13 `|`-split parts after the empty prefix), id
`S098`, kind `code`, tier `A`, status `queued`, opened 2026-10-21, recheck `on-release`,
used-by `—`.

- Source cell URL (one): `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`
- Anchor cell: `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; schema construction 491-928, date description 583; decoded sha256 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`

Files cited, and the ranges spelled as in the anchor:

| file (chromium/src path) | how cited | anchor ranges |
|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | source-cell URL | `491-928`, `583` (single line) |

Only one file. The teaches cell says "companion header is supporting material", but
`form_mcp_schema.h` appears **only** in the teaches cell — never in the source or anchor cell
(`node` check: `header basename in source/anchor: false`, exit 0). It is therefore not a cited
file, and adding it would fail the counter's `f2-path-bound` (no basename in the anchor), so it
was not fetched. No basename outside the URL required Gitiles listing resolution.

## 2. Fetches (decoded bytes committed to this output dir)

Gitiles `?format=TEXT` → `base64 -d`; status kept from `curl -w '%{http_code}'`.

| tag | HTTP | b64 bytes | decoded bytes | lines | sha256 |
|---|---|---|---|---|---|
| 154.0.8037.97 | **200** | 68940 | 51703 | 1440 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| 156.0.8078.47 | **200** | 68940 | 51703 | 1440 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |

Saved at `pins/S098/bytes/<tag>/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`.
`cmp` between the two decoded files: exit 0 (identical). Second fetch of both tags: HTTP 200,
same sha each. Bytes fetched at the resolved commit SHAs `b510e9d7…` (154) and `1d17a2e2…`
(156): HTTP 200, same sha — the identity is not a tag-mapping artifact.

Tag commits resolved from Gitiles (`refs/tags/<tag>?format=JSON`, both HTTP 200):
154.0.8037.97 → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (**matches the commit the row
records**), 156.0.8078.47 → `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.

## 3. Registry digest binding

The row records one 64-hex digest, `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`
(counter `rowDigests` regex over source+anchor: one full digest, no 8…4 abbreviation).
`old_sha256` of the 154 decoded bytes equals it exactly → **match** (`digest match: true`,
node exit 0). It is the sha256 of the *decoded* body: `zcat` of the round-19 retained body
`.ufo/waves/round-19/w2/SourceS077.body.gz` also hashes to it (1440 lines), while the `.gz`
container itself is `df892e59a77a0e1574ee4ac43f592a31c5e863ce59a412206229180dbaf06097`.

## 4. Range verdicts (154 ranges → 156.0.8078.47)

Normalisation per the counter (`f4-ranges`/`blockIn`): each line trimmed, inner whitespace
collapsed; the old block must occur as one contiguous run in the new file.

| range | block | verdict | 156.0.8078.47 lines | first old line |
|---|---|---|---|---|
| `[491,928]` | 438 lines | **holds** | 491-928 | `std::unique_ptr<JSONObject> FormMCPSchema::ComputeParameterSchemaForControls(` |
| `[583,583]` | 1 line | **holds** | 583 | `"Dates MUST be provided in 'YYYY-MM-DD' format.");` |

File verdict: **holds**; drifted ranges: none, so no unified diff was produced and step 6
(supersede row) does not trigger. `pins/S098/ranges-verdict.json` is the machine record;
`pins/S098/compare-ranges.mjs` reproduces it (exit 0).

Anchor-token checks under the counter's own `anchorHasRange` regex: `491-928` true, `583`
true (node exit 0), so both ranges also satisfy `f4`'s anchor binding.

## 5. Entry file

`pins/S098/entry.json` — exact requested shape, `superseded_by: null`, `fetched_by: "PinS098"`,
`fetched_at: "2026-10-26T04:27:22Z"`, `ranges: [[491,928],[583,583]]`, both sha256 values as
measured.

## 6. Counter evidence (fixture, not the lane measurement)

A scratch clone of the lane (`git clone --shared`, toplevel verified; one commit inside that
clone only) carrying my entry as a receipt, my bytes at the counter's expected
`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`, and a refetch record with a
different seat:

```
node scripts/check-release-pins.mjs --repo <clone> --rev HEAD --stable 156.0.8078.47 --json   exit=1
population=23 unresolved=22 holds=1 drifted=0
{"id":"S098","resolved":true,"verdict":"holds","reasons":[]}
```

So S098 passes `r1`, `f1-old-tag`, `f2-path-bound`, `f3-bytes` (path+sha), `f4-ranges` (bounds
and anchor tokens), `f5-digest` and `f6-refetch` under the frozen counter. The 22 unresolved ids
are the other rows, which are outside this seat. The lane-level counter was **not** run and is
not claimed: `corpus/evidence/round-29/` does not exist yet at the lane tip.

**Prerequisites the assembly step still owes for S098** (not my write scope):
1. copy `pins/S098/bytes/154.0.8037.97/…` and `pins/S098/bytes/156.0.8078.47/…` to
   `corpus/evidence/round-29/release-pins/bytes/<tag>/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`;
2. add this entry to `corpus/evidence/round-29/release-pins/receipt.json` (`schema`
   `tabi-release-pins-v1`, `stable` `156.0.8078.47`);
3. write `corpus/evidence/round-29/release-pins/refetch/S098.json` from a seat **other than
   PinS098** with `{path, tag: "156.0.8078.47", status: 200, sha256: 904b75e7…}` — no w1 item in
   `.ufo/waves/round-29/w1-spec.json` is assigned that record, so without it S098 stays
   unresolved at `f6-refetch` even though the bytes are correct.

## 7. Knowledge entries citing S098 / recheck notes

One knowledge entry cites S098: `corpus/knowledge/webmcp-declarative-validation-round-19.md:156`
("S098 similarly qualifies the queued schema-construction reading as S077 implementation reuse").
`SOURCES.md` used-by for S098 is `—`; `corpus/README.md:426` also mentions it but is not a
knowledge entry. Per the item, recheck notes are required only for drifted rows — there is no
drift, and the note's statement is reinforced rather than falsified: the implementation bytes are
the same at 154 and at 156, so "explicit implementation reuse / not a distinct independent
source" still holds at the new tag. No note was written.

## 8. Risks and observations (advisory, not repaired)

- **f6 is non-discriminating for S098 by construction.** Because `old_sha256 == new_sha256`,
  copying 154 bytes in as 156 bytes yields the correct sha and cannot be caught for this row; the
  claim's `copiedOldAsNewJunk` control relies on rows that actually changed. This is a property
  of the source, not a defect in my record, but it means S098's freshness evidence is
  "unchanged upstream" rather than "independently re-observed change".
- **Mislabel in an earlier dossier:** `.ufo/waves/round-20/w2/SemanticLC03.md:9` calls
  `904b75e7…` the "r19 gzip sha256"; it is the decompressed body's sha256 (container is
  `df892e59…`). The S098 row's "decoded sha256" wording is the accurate one.
- S098's URL is one of the pre-existing duplicate-URL (`W04`) rows; since it holds, no new row
  was added and the warning set is unchanged.
- No tool was installed or upgraded for this seat; no build/lint/formatter was run on the lane;
  no lane tracked file, index or external state was written.

## 9. Commands and exit codes (full transcript in `pins/S098/fetch-log.txt`)

| # | command (abridged) | exit | result |
|---|---|---|---|
| 1 | `curl -sS -o … -w '%{http_code}' …/refs/tags/154.0.8037.97/<path>?format=TEXT` + `base64 -d` | 0 | 200, 51703 B, sha `904b75e7…` |
| 2 | same for `156.0.8078.47` | 0 | 200, 51703 B, sha `904b75e7…` |
| 3 | `cmp bytes/154…/form_mcp_schema.cc bytes/156…/form_mcp_schema.cc` | 0 | identical |
| 4 | `sha256sum` both decoded files | 0 | one digest, both files |
| 5 | second `curl` fetch of both tags, sha in-stream | 0 | 200/200, same sha |
| 6 | `curl …/refs/tags/<tag>?format=JSON` (both tags) | 0 | 200/200, commits `b510e9d7…` / `1d17a2e2…` |
| 7 | `curl …/+/<commit>/<path>?format=TEXT` (both commits) | 0 | 200/200, same sha |
| 8 | `node -e` row parse: cells, `anchorHasRange`, digest, header basename | 0 | 13 cells; 491-928 true; 583 true; digest match true; header false |
| 9 | `node compare-ranges.mjs .` | 0 | both ranges holds; file holds |
| 10 | `git clone --shared` + `rev-parse --show-toplevel` + one commit | 0 | clone-only commit `222418e5…`, worktree clean |
| 11 | `node scripts/check-release-pins.mjs --repo <clone> --rev HEAD --stable 156.0.8078.47 --json` | 1 | S098 `resolved:true, verdict:"holds", reasons:[]`; population 23, unresolved 22 (other rows) |
| 12 | `zcat .ufo/waves/round-19/w2/SourceS077.body.gz \| sha256sum` | 0 | `904b75e7…`, 1440 lines |

Artifacts: `pins/S098/{entry.json, ranges-verdict.json, compare-ranges.mjs, fetch-log.txt,
fixture-counter-out.json, tag-154.0.8037.97.json, tag-156.0.8078.47.json, bytes/<tag>/…}`.
**No `supersede-row.md`** — no range drifted (per item step 6's condition).
