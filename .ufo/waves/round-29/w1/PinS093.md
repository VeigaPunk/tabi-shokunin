# PinS093 — C3 re-open of registry row S093 at stable 156.0.8078.47

Seat: PinS093 (leaf). Milestone C3, wave w1, round 29 attempt 1.
Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Scratch: /fast/scratch/hyaku/tabi-r29/PinS093.
Write scope used: this report, `.ufo/waves/round-29/w1/pins/S093/` only. No lane tracked file, index, jj state or registry row touched.
Tooling: nothing installed, nothing upgraded (no package install of any channel was needed).

## 1. Row and the files it cites

`corpus/SOURCES.md:107`, 13 split cells, id S093:

- source cell: Chromium 154 Gitiles URLs for
  `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` and `…/form_mcp_schema.h`,
  both at `refs/tags/154.0.8037.97` with `?format=TEXT`
- kind `code`, tier `A`, scope "Form-derived declarative WebMCP inputSchema construction at Chromium tag 154.0.8037.97 only"
- anchor cell: `tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`;
  `` `.cc:121-181, 491-539, 556-928, 1095-1236, 1238-1438` `` ;
  `` `.h:41-50, 56-121, 148-158` `` ;
  decoded `.cc` SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`
- status `queued`, opened `2026-10-21`, recheck `on-release`, used-by `—`

Files cited: exactly two, both named by full chromium/src path in the source cell (`.cc` and `.h`), so no basename
resolution from knowledge entries, wave dossiers or a Gitiles directory listing was needed. No other chromium source
file is named by the anchor; the `.cc` commit/tag tokens are tag metadata, not additional files.

| file (under `third_party/blink/renderer/core/html/forms/`) | anchor ranges, spelled as in the anchor |
|---|---|
| `form_mcp_schema.cc` | `121-181`, `491-539`, `556-928`, `1095-1236`, `1238-1438` |
| `form_mcp_schema.h` | `41-50`, `56-121`, `148-158` |

## 2. Fetch statuses and digests

Gitiles `?format=TEXT`, base64 decoded. Command shape (one call per tag/file):

```
curl -sS -o raw.<tag>.<ext>.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/core/html/forms/form_mcp_schema.<ext>?format=TEXT'
```

| file | tag | http_status | b64 bytes | decoded bytes | decoded sha256 |
|---|---|---|---|---|---|
| `.cc` | 154.0.8037.97 | 200 | 68940 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `.cc` | 156.0.8078.47 | 200 | 68940 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `.h` | 154.0.8037.97 | 200 | 12324 | 9243 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` |
| `.h` | 156.0.8078.47 | 200 | 12324 | 9243 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` |

No 404 or absence row is involved in S093 (both files exist at both tags).

Decoded bytes are retained at, exact paths:

- `.ufo/waves/round-29/w1/pins/S093/bytes/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.{cc,h}`
- `.ufo/waves/round-29/w1/pins/S093/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.{cc,h}`

`sha256sum` over the on-disk copies reproduces the four values above (exit 0).

### Tag-identity control (identity is real, not an endpoint artifact)

Both endpoints were confirmed distinct before trusting the identical bytes
(evidence file `pins/S093/tag-refs.txt`, all GETs status 200):

- `refs/tags/154.0.8037.97?format=JSON` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` — matches the row's anchor commit
- `refs/tags/156.0.8078.47?format=JSON` → commit `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`
- `refs/tags/154.0.8037.97/chrome/VERSION` → `MAJOR=154 MINOR=0 BUILD=8037 PATCH=97`
- `refs/tags/156.0.8078.47/chrome/VERSION` → `MAJOR=156 MINOR=0 BUILD=8078 PATCH=47`

So the two tag trees differ; `form_mcp_schema.cc` / `.h` happen to be unchanged between them.

## 3. Registry-digest check (step 3)

The row records exactly one 64-hex digest, `904b75e7…02152f`, in the anchor cell and binds it to `.cc`.
`sha256(154.0.8037.97 decoded .cc) = 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` → **match**.
The row records no digest for `.h`; its 154 digest (`e44593c0…340f7`) is newly recorded in this entry.

## 4. Range verdict per file and range

Test = the frozen counter's rule: old block lines trimmed with inner whitespace collapsed, then required to occur as
one contiguous block in the 156 file (`blockIn`), plus sha256-level whole-file equality.

| file | range (154 line numbers) | block lines | verdict | location in 156 file | unified diff |
|---|---|---|---|---|---|
| `.cc` | 121-181 | 61 | **holds** | 121-181 | none (file bytes identical) |
| `.cc` | 491-539 | 49 | **holds** | 491-539 | none |
| `.cc` | 556-928 | 373 | **holds** | 556-928 | none |
| `.cc` | 1095-1236 | 142 | **holds** | 1095-1236 | none |
| `.cc` | 1238-1438 | 201 | **holds** | 1238-1438 | none |
| `.h` | 41-50 | 10 | **holds** | 41-50 | none |
| `.h` | 56-121 | 66 | **holds** | 56-121 | none |
| `.h` | 148-158 | 11 | **holds** | 148-158 | none |

No range drifted, so no region diff exists to show and **no superseding registry row is required**:
`pins/S093/supersede-row.md` is intentionally absent. `entry.superseded_by` is `null`.

Anchor boundary sanity (line numbers are real and the counter's `b <= line count` bound clears):
`.cc` split-line count 1441 (1438 ≤ 1441), `.h` split-line count 206 (158 ≤ 206).
Boundary text at 154: `.cc:121` = `std::unique_ptr<JSONObject> FormMCPSchema::ComputeJSON() {`, `:181` = `}`,
`:491` = `…ComputeParameterSchemaForCo…`, `:539` = `return nullptr;`, `:556` = `…ComputeTextParameterSchema(`, `:928` = `}`,
`:1095` = `void FormMCPSchema::AddDescription(const ControlVector& controls,`, `:1236` = `}`,
`:1238` = `void FormMCPSchema::ProcessForm(HTMLFormElement& form) {`, `:1438` = `}`;
`.h:41` = `// Compute an input schema, suitable for DeclarativeWebMCPTo…`, `:50` = `std::optional<ScriptToolError> FillData(const JSONObject&);`,
`:56` = `private:`, `:121` = `bool& required);`, `:148` = `void AddDescription(const ControlVector&, JSONObject&, String = String…`,
`:158` = `ControlVector& EnsureControlVector(const String& name);`.

## 5. Counter-rule replay against the real row (scripts/check-release-pins.mjs)

Replicated the counter's own predicates over `corpus/SOURCES.md:107` and this entry (script read at lines 1-320; not run —
it needs the assembled receipt and a different seat's refetch record, see §7):

- `r1-entry` — one entry for S093 with 2 files: satisfiable once assembled.
- `f1-old-tag` — row tags `[154.0.8037.97]`; both files `old_tag 154.0.8037.97` → pass.
- `f2-path-bound` — source cell contains `refs/tags/154.0.8037.97/<path>` for both files → pass. (The anchor names
  them only as `.cc` / `.h`, so `basename(path)` is *not* in the anchor; the binding is carried by the source cell,
  which `f2` accepts.)
- `f3-bytes` — path shape `…/bytes/<tag>/<path>` with matching sha256: satisfied by the retained bytes, but the
  `corpus/evidence/round-29/release-pins/bytes/…` copies must be committed by the assembly seat (outside my scope).
- `f4-ranges` — every `a-b` token occurs in the anchor cell (all 8 tokens confirmed) and every `b` is within the old line
  count → pass.
- `f5-digest` — anchor digest matches the `.cc` `old_sha256` → pass.
- `f6-refetch` — needs `refetch/S093.json` with `seat != PinS093` and the two stable-tag entries → **not satisfiable from
  this seat**; same-seat re-fetch cannot satisfy it.

## 6. Commands run and exit codes

```
curl … form_mcp_schema.cc?format=TEXT (154)            -> http_status=200, curl exit 0
curl … form_mcp_schema.cc?format=TEXT (156)            -> http_status=200, curl exit 0
curl … form_mcp_schema.h?format=TEXT  (154)            -> http_status=200, curl exit 0
curl … form_mcp_schema.h?format=TEXT  (156)            -> http_status=200, curl exit 0
curl … refs/tags/<tag>?format=JSON (both)              -> http_status=200, curl exit 0
curl … refs/tags/<tag>/chrome/VERSION?format=TEXT (both) -> http_status=200, curl exit 0
base64 -d raw.<tag>.<ext>.b64 > bytes/…                -> python base64 decode, exit 0 (four files)
sha256sum bytes/*/third_party/…/form_mcp_schema.{cc,h} -> exit 0, four digests as tabled
range block compare (counter blockIn algorithm)        -> exit 0, 8/8 holds
counter-rule replay over row + entry                    -> exit 0, f1/f2/f4/f5 pass
same-seat re-fetch of 156 .cc, attempt 1                -> http_status=503, empty body, NOT used as bytes
same-seat re-fetch of 156 .cc, attempt 2                -> http_status=200, cmp against first fetch exit 0,
                                                          sha256 904b75e7…02152f at 04:27:17Z
```

A first same-seat re-fetch of the 156 `.cc` returned HTTP 503 with an empty body; `base64 -d` failed on it and those
bytes were discarded, never recorded. The retry returned 200 and was byte-identical to the first fetch. That is a
transient Gitiles error, not a content difference, and it does not satisfy `f6-refetch` in any case.

## 7. Outputs written

- `pins/S093/entry.json` — id/fetched_by/fetched_at/superseded_by(null)/files[2], `ranges` in 154 line numbers
- `pins/S093/bytes/<tag>/<chromium path>` — four decoded files, exact chromium paths
- `pins/S093/fetch-log.txt` — per-fetch statuses, digests, range verdicts, counter replay, the 503 retry record
- `pins/S093/tag-refs.txt` — tag ref + chrome/VERSION evidence for both tags
- `pins/S093/supersede-row.md` — deliberately absent (no drifted range)

## 8. Risks / blockers (for the parent)

1. **Assembly still owed for S093.** `corpus/evidence/round-29/release-pins/receipt.json` must gain this entry and the
   four files must be committed at `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`; without that `f3-bytes`
   fails ("absent") and the row stays unresolved at `population=23 unresolved>0`. I cannot write there.
2. **`f6-refetch` needs another seat.** `corpus/evidence/round-29/release-pins/refetch/S093.json` must list both paths at
   `156.0.8078.47` with `status 200` and the two sha256 values above, `seat` ≠ `PinS093`. Until it exists the row is
   unresolved regardless of my entry. (No such dir exists in the lane at the time of writing: `corpus/evidence/round-29/release-pins/` is absent.)
3. **`.h` digest is not registry-bound.** The row records only the `.cc` digest; `f5` therefore cannot catch a wrong
   `.h`, only the byte-hash comparison in `f3` can. Not a defect in my entry, but it is the row's weak binding.
4. **No knowledge entry cites S093** — the row's used-by cell is `—` and `grep -rn "S093" corpus/knowledge/` returns
   nothing (the two knowledge files that mention `form_mcp_schema` cite S077/S098 instead). So the claim's "recheck note
   per citing knowledge entry" obligation is vacuous for this row, and none was written.
5. **S098 already supersedes S093** and is pinned at the *old* tag, so it is a separate population row; nothing in this
   row's resolution depends on it. If a future round drifts S093, any superseding row must carry
   `refs/tags/156.0.8078.47/` in its source cell or `s1-drift-unsuperseded` will fire — S098 would not satisfy that.
