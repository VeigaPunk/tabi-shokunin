# PinS033 — C3 re-open of registry row S033 at 156.0.8078.47

Seat: `PinS033` (leaf). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Milestone C3, wave w1, round 29 attempt 1. Baseline `856fa9e1`, claims commit `97be89bc`
(`.ufo/waves/round-29/claims.json`, read first). Nothing in `corpus/SOURCES.md` was edited:
this seat is findings-only and the registry append belongs to its owner.

## Verdict (short)

| file | 154 status | 156 status | range | verdict |
|---|---|---|---|---|
| `third_party/blink/renderer/core/script_tools/model_context_supplement.idl` | 200 | 200 | `7-12` | **holds** (byte-identical; range sits again at 156 lines 7-12) |

Row S033 **holds** at 156: no drifted range, therefore **no superseding row is drafted** and
no round-29 recheck note is owed by its citing knowledge entry.

## 1. Files the row cites

Row text read from `corpus/SOURCES.md:47`:

- source cell: one Gitiles URL,
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl`
- anchor cell: `tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), lines 7-12, sha256 50dd337d…6364`
- scope: `Where Chromium 154 exposes the ModelContext attribute and how it is gated`
- teaches: `The 154 build declares modelContext on Document, SecureContext, RuntimeEnabled=WebMCP; there is no Navigator partial`
- used-by: `corpus/knowledge/webmcp-chromium-loopback-round-16.md`

Enumeration result — **exactly one file**:

| chromium path | anchor ranges (verbatim spelling) |
|---|---|
| `third_party/blink/renderer/core/script_tools/model_context_supplement.idl` | `7-12` |

Why no second file: the anchor cell names **no basename at all** — it carries only the tag,
the tag commit `b510e9d7…`, the range `7-12` and the abbreviated digest. `Document` and
`Navigator` in the teaches cell are WebIDL interfaces, not files, so they do not add a cited
path. No knowledge entry or dossier under `.ufo/waves/` attributes a second file to S033:
`corpus/knowledge/webmcp-chromium-loopback-round-16.md:84` cites "S033 line 11" (this file),
and `.ufo/waves/round-16/w1/SrcChromiumIdl.md:41,80-90` records the same single path with
ranges 7-12. (Round-16 `drafts/DraftSources.md` mentions an `S033` that was a CDP-JSON row;
that id was reassigned during integration — `.ufo/waves/round-16/w2/ReopenS035.md:190` — and
is not this row.)

## 2. Fetches (decoded bytes committed under this output dir)

Destination layout written by this seat:
`/…/tabi-shokunin/.ufo/waves/round-29/w1/pins/S033/bytes/<tag>/<chromium path>`.

| tag | HTTP | base64 bytes | decoded bytes | sha256 |
|---|---|---|---|---|
| `154.0.8037.97` | 200 | 520 | 389 | `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` |
| `156.0.8078.47` | 200 | 520 | 389 | `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` |

`cmp -s` of the two decoded files: **IDENTICAL**. Gitiles JSON for the 156 path
(`?format=JSON`, status 200) reports git blob `id = c954510d188abb6fb21542e7a60127608650d48c`,
the same blob recorded for the 154 file in `.ufo/waves/round-16/w1/SrcChromiumIdl.md:41` —
server-side corroboration that the 156 bytes are the 154 bytes.

The only copy the counter accepts (`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`)
is **not** written by this seat (outside my write scope); the entry below points at it and
the owning seat copies `bytes/` across verbatim.

File content at both tags (13 lines, trailing newline; the 14th split part is empty):

```
 7 [
 8   RuntimeEnabled=WebMCP,
 9   ImplementedAs=ModelContextSupplement
10 ] partial interface Document {
11   [SecureContext, SameObject] readonly attribute ModelContext modelContext;
12 };
```

## 3. Registry digest binding

Registry anchor digest `50dd337d…6364` (8 hex + ellipsis + 4 hex). Measured old sha256
`50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364`: prefix `50dd337d` ✓,
suffix `6364` ✓ → **match**. The frozen counter's own `f5-digest` check agrees (no `f5-digest`
reason in the fixture run below).

## 4. Range check 154 → 156

Replicated the counter's transform exactly (`trim`, inner whitespace collapsed to one space,
contiguous block search):

| range | block occurs in 156? | 156 line numbers | diff |
|---|---|---|---|
| `7-12` | **holds** | 7-12 | none needed — files are byte-identical (`cmp` exit 0) |

No presence-absence (`404`) file in this row, so the 404-holds rule is not exercised.

## 5. `entry.json`

`/…/.ufo/waves/round-29/w1/pins/S033/entry.json` (schema exactly as assigned):

```json
{
  "id": "S033",
  "fetched_by": "PinS033",
  "fetched_at": "2026-10-26T04:23:24Z",
  "superseded_by": null,
  "files": [
    {
      "path": "third_party/blink/renderer/core/script_tools/model_context_supplement.idl",
      "old_tag": "154.0.8037.97",
      "old_status": 200,
      "new_status": 200,
      "old_bytes": "corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl",
      "new_bytes": "corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/script_tools/model_context_supplement.idl",
      "old_sha256": "50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364",
      "new_sha256": "50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364",
      "ranges": [[7, 12]]
    }
  ]
}
```

Shape check against the frozen counter `scripts/check-release-pins.mjs` (checks
`r1-entry`, `f1-old-tag`, `f2-path-bound`, `f3-bytes`, `f4-ranges`, `f5-digest`, `f6-refetch`),
run in a throwaway fixture repo under scratch (`git -C "$D"` only, `rev-parse --show-toplevel`
verified equal to `$D` before the first commit), with the lane's `corpus/SOURCES.md` copied
unchanged (population 23), this entry as the only receipt row, and a differently-named fixture
refetch record (stand-in only — see §7):

```
$ node "$D/scripts/check-release-pins.mjs" --repo "$D" --rev 463e4750 --stable 156.0.8078.47 --json
counter_exit=1
{"population":23,
 "unresolved":22,
 "rows":[{"id":"S033","resolved":true,"verdict":"holds","reasons":[]}]}
```

`S033` resolves with **no reason codes**; the exit 1 is the 22 rows nobody has pinned yet.
Raw output kept at `pins/S033/fixture-counter-out.json`. This proves only that my entry is
counter-shaped and evaluates to `holds` — it is fixture evidence, not lane evidence.

## 6. Supersession

No range drifted ⇒ clause 6 of the assignment does not trigger ⇒ **`supersede-row.md` is not
written**. Consequence for the kill rule "any drifted row whose citing knowledge entries carry
no round-29 recheck note": S033 is not a drifted row, so
`corpus/knowledge/webmcp-chromium-loopback-round-16.md` needs no recheck note.
Auxiliary re-validation of that entry's S033-derived statements at 156 (not registry-cited,
recorded as supporting observation only): the Gitiles directory listing of
`third_party/blink/renderer/core/script_tools/` returns 200 at both tags with the **same 14
entry names** (`DEPS DIR_METADATA OWNERS build.gni model_context.cc .h .idl
model_context_supplement.cc .h .idl model_context_test.cc model_context_tool.idl
script_tool_context.h script_tool_types.h`) and **no** `navigator_*` / `webmcp*` name at
either tag — so the teaches clause "there is no Navigator partial" still holds in that
directory at 156. Listings kept at `pins/S033/dir-listing-{154.0.8037.97,156.0.8078.47}.json`.

The row's `status: mined`, `recheck: on-release` and its 154 pin are untouched by this seat;
it remains a legitimate C3 population row resolvable by this entry.

## 7. Open dependency (blocker for resolution, not for drift)

`f6-refetch` needs `corpus/evidence/round-29/release-pins/refetch/S033.json` from a seat
**other than** `PinS033`, listing
`{path: third_party/blink/renderer/core/script_tools/model_context_supplement.idl,
tag: "156.0.8078.47", status: 200,
sha256: 50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364}`.
My own re-fetch (`fetch-log.txt`) reproduces the sha but is the same seat, so it does **not**
satisfy that check by design. Until an independent seat posts that file, S033 stays unresolved
with reason `f6-refetch`.

## Commands run (with exit codes)

```
$ curl -sS -o …/154.0.8037.97.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT'
200            # base64 -d | sha256sum -> 50dd337d…6364   (script loop exit 0)
$ curl -sS -o …/156.0.8078.47.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT'
200            # base64 -d | sha256sum -> 50dd337d…6364   (same loop, exit 0)
$ cmp -s bytes/154.0.8037.97/<path> bytes/156.0.8078.47/<path>        # exit 0 -> IDENTICAL
$ wc -l bytes/154.0.8037.97/<path> bytes/156.0.8078.47/<path>         # 13 13        exit 0
$ node -e '<counter normLine/blockIn replication>'                    # "range 7-12 holds at new lines 7-12", exit 0
$ curl -sS '…?format=JSON' for the 156 path                           # status=200, blob c954510d…  exit 0
$ curl -sS '…/script_tools/?format=JSON' at both tags                 # status=200 both, 14 entries, exit 0
$ git -C "$D" rev-parse --show-toplevel                               # == $D, exit 0
$ node "$D/scripts/check-release-pins.mjs" --repo "$D" --rev 463e4750 --stable 156.0.8078.47 --json   # exit 1 (22 unpinned), S033 resolved/holds
```

One command in the fetch-log here-block hit a shell `case`-inside-substitution syntax error
(two `error: main: syntax error` lines) and emitted a garbled digest line; the digest check
was recomputed directly and the line rewritten in `fetch-log.txt` — the sha256 values in that
file are unmodified command output.

## Tooling and scope

No tool installed or upgraded (nothing needed; `curl`, `node` v-present, `git` on PATH).
No `pacman` transaction, no clone (`curl` alone was enough; no `git clone` was made).
Scratch `$HYAKU_SCRATCH/tabi-r29/PinS033/` (HYAKU_SCRATCH=`/fast/scratch/hyaku`) held the
decode staging and the one fixture repo, and was removed with `rm -rf` after its receipts were
copied here. Wrote only: this report, `.ufo/waves/round-29/w1/pins/S033/**`, scratch above.
No lane tracked file, lane index, jj state, fleet repo or sibling lane touched; no git write
outside the scratch fixture.

## Files produced

- `.ufo/waves/round-29/w1/PinS033.md` (this report)
- `.ufo/waves/round-29/w1/pins/S033/entry.json`
- `.ufo/waves/round-29/w1/pins/S033/bytes/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl`
- `.ufo/waves/round-29/w1/pins/S033/bytes/156.0.8078.47/third_party/blink/renderer/core/script_tools/model_context_supplement.idl`
- `.ufo/waves/round-29/w1/pins/S033/fetch-log.txt`
- `.ufo/waves/round-29/w1/pins/S033/fixture-counter-out.json`
- `.ufo/waves/round-29/w1/pins/S033/dir-listing-154.0.8037.97.json`
- `.ufo/waves/round-29/w1/pins/S033/dir-listing-156.0.8078.47.json`
