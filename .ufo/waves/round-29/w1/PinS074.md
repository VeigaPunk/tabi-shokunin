# PinS074 — C3 re-open of registry row S074 at 156.0.8078.47

Seat: `PinS074` (leaf, executor). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Milestone C3, wave w1, round 29 attempt 1. Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`,
claims commit `97be89bc66139eb45526a04af59a35dccc006eb9` (`.ufo/waves/round-29/claims.json`, read first:
population 23, trigger version `156.0.8078.47` / previous `155.0.8059.84`).
Nothing in `corpus/SOURCES.md`, `corpus/knowledge/`, `scripts/` or the lane index was edited or read
from write scope: this seat produced bytes, one `entry.json`, and this report. No tool installed or
upgraded (nothing was needed).

## Verdict (short)

| file | 154 status | 156 status | anchored ranges (row's own spelling) | verdict |
|---|---|---|---|---|
| `third_party/blink/renderer/platform/runtime_enabled_features.json5` | 200 | 200 | `7023-7050`, `7035` | **holds** (both ranges byte-identical; block reseated at 156 lines 7204-7231, status line at 7216) |

Row S074 **holds** at 156: no drifted range → **no superseding registry row drafted** and no
round-29 recheck note owed by its single citing knowledge entry (`item step 6` is conditional; the
gate's `s1-drift-unsuperseded` condition is not engaged).

One finding outside the row verdict, **F-1**: the frozen counter cannot bind S074's registry digest
at all (`rowDigests` extracts nothing from this row's anchor), so a mismatched digest would still
resolve. Proven with two fixture runs below. The digest I report *does* match — but the gate cannot
tell for this row, and S074 is the only population row in that state.

## 1. Files the row cites

Row read from `corpus/SOURCES.md:88` (13 split parts, id `S074`):

- source cell: exactly one Gitiles URL,
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5`
- anchor cell: `tag154.0.8037.97, WebMCP block7023-7050, status7035, decoded sha25699b92e67…d45bcb1d2b`
- scope: `Source declarations only, no runtime-inertness inference`
- teaches: `supersedes S034 — WebMCP is declared experimental and implied by WebMCPTesting; this file lacks DeclarativeWebmcp. Absence from this file alone does not prove a command-line token inert at runtime`
- recheck: `on-release`; used-by: `corpus/knowledge/source-recheck-round-18.md`

Enumeration result — **exactly one file**:

| chromium path | anchor ranges, verbatim |
|---|---|
| `third_party/blink/renderer/platform/runtime_enabled_features.json5` | `block7023-7050`, `status7035` → `7023-7050`, `7035` |

Why no second file: the anchor names **no basename** other than the word `WebMCP`, which is a runtime
feature name, not a path (`corpus/lessons/round-18.md:70` spells the same anchor as "WebMCP block,
line7035"). The single citing knowledge entry attributes no second file: `corpus/knowledge/source-recheck-round-18.md:175`
reads `| S074 | S034 | Source-file token absence does not by itself establish runtime inertness. w2/LiveS034.md |`.
Corroborating dossiers name the same one path with the same ranges — `.ufo/waves/round-21/w1/SrcFlags.md:3`
("lines 7023–7050", same digest), `.ufo/waves/round-19/w1/ScribeKnowledgeNote.md:73`
("`runtime_enabled_features.json5` lines 7023-7050"). No Gitiles directory listing was needed.

## 2. Fetches

Layout written by this seat: `.ufo/waves/round-29/w1/pins/S074/bytes/<tag>/<chromium path>` (decoded bytes).

| tag | HTTP | base64 bytes | decoded bytes | lines | sha256 |
|---|---|---|---|---|---|
| `154.0.8037.97` | 200 | 310220 | 232665 | 7428 | `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` |
| `156.0.8078.47` | 200 | 321936 | 241452 | 7634 | `5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4` |

Same-seat reproducibility re-GET of both URLs (fresh scratch file): both 200, both sha256 identical to
the first fetch — recorded in `pins/S074/fetch-log.txt`. That is **not** the independent refetch the
gate needs: `f6-refetch` requires a seat different from `entry.fetched_by`, so this seat wrote **no**
`corpus/evidence/round-29/release-pins/refetch/S074.json`; a different seat must fetch and write it.

The canonical byte locations the gate reads
(`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`) are outside this seat's write scope;
`entry.json` names them and the assembler copies `pins/S074/bytes/` across verbatim (508 KB).

Commands (all in the run transcript; exit codes as printed):

```
curl -sS -o "$S/$T.b64" -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT'
  -> 154: status=200 (curl exit 0);  156: status=200 (curl exit 0)
base64 -d "$S/$T.b64" > bytes/<tag>/…            exit 0
sha256sum <both decoded files>                    exit 0
```

## 3. Registry digest binding

Row digest `sha25699b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` (full 64 hex) vs the
154.0.8037.97 decoded sha256: **match** (byte-for-byte equal). It is stale for the 156 bytes
(`5314547c…14b4`), which is expected: the row is pinned at 154 and the gate's `f5` compares
`old_sha256` only.

### F-1 — the gate's `f5-digest` is vacuous for this row

`scripts/check-release-pins.mjs` `rowDigests()` matches `(?<![0-9a-f])([0-9a-f]{64})(?![0-9a-f])`. In
S074's anchor the hex is glued to the word: `decoded sha25699b92e67…`, so the 64-hex run is preceded by
`6`, which is a hex digit, and the lookbehind kills the match. Measured on the live row:

```
$ node -e '<rowDigests logic on corpus/SOURCES.md:88 cells 2+6>'
parts 13 id S074
full [] abbr []
anchor tail: ", decoded sha25699b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b"
```

`digests.length === 0` → the `if (digests.length && …) reasons.push("f5-digest")` branch never runs, so
"satisfies the row's registry digest" (claims C3 f5 / predicate "the row's registry digest matched where
it records one") is **not exercised for S074**. Census over the whole population (`on-release` + a
Chromium tag, the gate's own population rule): `population=23`, rows where the counter binds a digest
`15`, rows carrying a 64-hex token the counter does **not** bind: `S074` only. The other 7 population
rows carry no 64-hex at all, so they are honestly digest-free rather than silently unbounded.

Fixture proof (repo `git init -q` under `$HYAKU_SCRATCH/tabi-r29/PinS074/tmp.*`, `git -C` everywhere,
`rev-parse --show-toplevel` verified equal, removed afterwards; the fixture `corpus/SOURCES.md` is the
real line 88 plus the registry header, bytes are the real fetched bytes, refetch seat
`FixtureRefetchProbe` differs from `PinS074`):

| case | fixture state | counter verdict |
|---|---|---|
| A | real row, real bytes, real shas | `{"population":1,"unresolved":0,"holds":1,"rows":[{"id":"S074","resolved":true,"verdict":"holds","reasons":[]}]}`, exit 0 — **the entry accepted by this seat resolves** |
| B | both byte files get one extra trailing line; receipt/refetch shas updated to the mutated bytes; registry digest now wrong (`99b9…` vs `557f8739…`) but still spelled `sha25699b92e` | `unresolved:0, resolved:true, verdict:"holds", reasons:[]`, exit 0 — **wrong digest resolves** (`digest-probe-caseB-unparsed.json`) |
| C | same mutated bytes, anchor re-spelled `decoded sha256 99b92e…` (one space) | `unresolved:1, reasons:["f5-digest"]`, exit 1 (`digest-probe-caseC-spaced.json`) |

Case C isolates the cause to the missing separator, not to the mutation. Suggested repair (not made:
counter and registry are outside this seat's scope): accept a hex run whose left neighbour is the
literal `sha256` when no separator intervenes — e.g. match `sha256\s*([0-9a-f]{64})(?![0-9a-f])`
alongside the existing bare-token pattern in `rowDigests()`; registering it appends a counter sha, which
under C3's killRule means "not verified" until the frozen sha256 is re-frozen by the owner.

## 4. Range check (the gate's own predicate)

`normLine` = trim + collapse inner whitespace; `blockIn` = old block's normalized lines as one
contiguous run of new lines. Evidence: `pins/S074/range-check.txt`.

| range | semantics | verdict | 156 location | proof |
|---|---|---|---|---|
| `7023-7050` (28 lines) | the whole `WebMCP` declaration block, `name: "WebMCP",` … `},` closing `WebMCPTesting` | **holds** | 7204-7231 (uniform `+181`) | `diff -u <(sed -n '7023,7050p' 154) <(sed -n '7204,7231p' 156)` → exit 0, empty; normalized block occurs exactly **1** time in 156 |
| `7035` (1 line) | the `WebMCP` block's own `status: "experimental",` | **holds** | 7216 | `diff -u` of the two single lines → exit 0, empty; the normalized line also occurs 295× elsewhere, first-match predicate satisfied and the anchored occurrence is at 7216 inside the block |

So **no unified diff of a drifted region exists to show** — both ranges are byte-identical, not merely
whitespace-equivalent.

Whole-file context (not part of the predicate; on file as `pins/S074/full-file-154-vs-156.diff`):
`diff` exit 1, 308 removed / 514 added lines, 7428 → 7634 lines; `grep -n 'WebMCP\|DeclarativeWebmcp\|DeclarativeWebMCP'`
over that diff → **no match** (exit 1). Nothing in the WebMCP neighbourhood changed anywhere in the file.

Anchor tokens re-checked with the counter's `anchorHasRange` (verbatim regex + dash normalization):

```
[7023,7050] anchorHasRange = true
[7035,7035] anchorHasRange = true
```

## 5. What the row now gets wrong at 156 — nothing

The row's own claims re-measured on the 156 bytes (context, not required by a non-drifted verdict):

- `WebMCP` is still `status: "experimental"` with `origin_trial_feature_name: "WebMCP"`,
  `origin_trial_allows_third_party: true`, `public: true`, `base_feature_status: "enabled"`
  (156:7204-7217).
- `implied_by: ["WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting"]`
  (156:7212-7214) — same list, same three features and statuses `test` / `experimental` / `experimental`
  (156:7219, 7225, 7229).
- `grep -c 'DeclarativeWebmcp'` → **0** at 154 and **0** at 156: "this file lacks DeclarativeWebmcp"
  survives verbatim at the new tag.

Hence `corpus/knowledge/source-recheck-round-18.md:175` ("Source-file token absence does not by itself
establish runtime inertness") needs no correction and no recheck note, and S074's only living
dependency is that its byte pin is now one stable behind — which the on-release trigger itself records,
not a defect in the row.

## 6. Gate conditions this entry satisfies (checked against the row's own cells)

- `f1-old-tag`: `old_tag` 154.0.8037.97 is a tag the source cell carries.
- `f2-path-bound`: source cell contains `refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5`.
- `f3-bytes`: paths equal `BYTES_ROOT/<tag>/<path>`; shas hash the committed bytes (fixture case A).
- `f4-ranges`: both ranges inside 1..7428 and both tokens present in the anchor.
- `f5-digest`: digest matches — but **vacuous in the gate for this row** (F-1).
- `f6-refetch`: **owed to another seat**; a record by `PinS074` would fail the `seat !== fetched_by`
  condition by construction.
- `s1-drift-unsuperseded`: not engaged (verdict holds).

## Commands run (exit codes)

```
curl … ?format=TEXT  (154, 156)                       exit 0 / 0, HTTP 200 / 200
base64 -d …                                           exit 0 / 0
sha256sum <both>                                      exit 0
curl re-GET (154, 156)                                exit 0 / 0, HTTP 200 / 200, shas identical
node -e '<anchorHasRange + rowDigests replay>'        exit 0  (ranges true; digests [])
node -e '<population digest census>'                  exit 0  (population 23, bound 15, unbound S074 only)
diff -u <block 7023-7050 vs 7204-7231>                exit 0, empty
diff -u <line 7035 vs line 7216>                      exit 0, empty
diff <154 file> <156 file>                            exit 1 (files differ), 308 removed / 514 added
grep -n 'WebMCP…' full.diff                           exit 1 (no match)
node scripts/check-release-pins.mjs --repo <fixture> --rev HEAD --stable 156.0.8078.47 --json
  case A                                              exit 0, unresolved 0, holds 1
  case B                                              exit 0, unresolved 0, holds 1  (F-1)
  case C                                              exit 1, unresolved 1, reasons ["f5-digest"]
```

Not run by me, by design: the lane-wide `check-release-pins.mjs --rev <tip> --stable 156.0.8078.47`
(it needs all 23 receipts plus refetch records assembled, and the parent owns the post-integration gate).

## Files written

- `.ufo/waves/round-29/w1/pins/S074/entry.json` — the `entry.json` in the item's exact shape, `ranges: [[7023,7050],[7035,7035]]`, `superseded_by: null`.
- `.ufo/waves/round-29/w1/pins/S074/bytes/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5`
- `.ufo/waves/round-29/w1/pins/S074/bytes/156.0.8078.47/third_party/blink/renderer/platform/runtime_enabled_features.json5`
- `.ufo/waves/round-29/w1/pins/S074/fetch-log.txt`, `range-check.txt`, `full-file-154-vs-156.diff`,
  `digest-probe-caseB-unparsed.json`, `digest-probe-caseC-spaced.json`
- `.ufo/waves/round-29/w1/PinS074.md` (this report)
- No `supersede-row.md` (no drift).

Scratch `$HYAKU_SCRATCH/tabi-r29/PinS074/` (clone-free: no clone was needed) and the fixture repo
under it were removed; verified absent.

## Risks / notes for the parent

1. **F-1** must be decided by the counter owner: as frozen, C3's digest sub-predicate is unmet for S074
   even though the bytes happen to match. Nothing in my entry papers over it; the true digest is recorded.
2. `entry.fetched_by = "PinS074"` — the independent refetch for S074 must come from a different seat.
3. The assembler must copy `pins/S074/bytes/` to
   `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` before the receipt row can satisfy `f3-bytes`.
4. Row S074 stays `on-release` at 154 by design; its staleness disappears only if the owner chooses to
   re-pin it at 156, which the gate does not require while the anchored content holds. I did not draft
   that re-pin (item step 6 is drift-only, and a re-pin would need the S1NN id and a registry append that
   are not this seat's to make).
