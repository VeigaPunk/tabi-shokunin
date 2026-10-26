# RefetchS106 — C3 independent re-fetch and attack of registry row S106

Seat: `RefetchS106` (wave 2, milestone C3). Lane tip under test:
`32008a453737a27f69e9ab401d0b9775d2a944f7`. Clean `git clone --shared` in
`/fast/scratch/hyaku/tabi-r29/RefetchS106/clone`, `git status --porcelain` empty at
`32008a45`, `git rev-parse --show-toplevel` verified as the clone root before the first
scratch commit. I did not reuse `PinS106`'s bytes: every 154/156 byte string below came from
my own Gitiles GET in this seat, decoded with `base64 -d`.

Row S106 (`corpus/SOURCES.md:120` at the tip): Chromium `content/public/common/content_features.cc`
pinned at `154.0.8037.97`, anchor `decoded text lines 186-187 carry
BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT) with the comment
// Enable using the BackForwardCache.`, recheck `on-release`, used-by
`corpus/knowledge/bfcache-runtime-observed-round-25.md`.

## 1. My fetch (independent of PinS106)

```
$ curl -sS -o f.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/content/public/common/content_features.cc?format=TEXT'
$ base64 -d f.b64 > f.cc
```

| tag | my HTTP status | my decoded bytes | my sha256 | receipt field | receipt value | agree? |
|---|---|---|---|---|---|---|
| 156.0.8078.47 | 200 | 74920 | `392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259` | `new_status` / `new_sha256` | 200 / `392e24d7…d65b259` | **yes** |
| 154.0.8037.97 | 200 | 73952 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | `old_status` / `old_sha256` | 200 / `9b93fe64…424e6c44` | **yes** |

`base64 -d` exit 0 for both. The committed byte strings are byte-identical to my fetch
(`cmp -s` on `git show 32008a45:corpus/evidence/round-29/release-pins/bytes/<tag>/content/public/common/content_features.cc`
vs my decoded file → identical for both tags), so the committed 154 and 156 blobs are genuine
Gitiles bytes, not relabelled copies.

404 rule: **not applicable to S106** — both statuses are 200, the file carries no
`request_id`, and the receipt entry has no `normalization` field. Raw sha256 = normalised
sha256 for both tags; the refetch JSON carries the same hex.

Refetch record written from my values only (no field copied from the receipt):
`.ufo/waves/round-29/w2/refetch/S106.json`

```json
{"id":"S106","seat":"RefetchS106","fetched_at":"2026-10-26T05:26:26Z","files":[{"path":"content/public/common/content_features.cc","tag":"156.0.8078.47","status":200,"sha256":"392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259"}]}
```

My decoded bytes stay in scratch only (`fetch/content_features.cc.{154.0.8037.97,156.0.8078.47}`),
removed with the scratch tree; the digests above are the durable record.

Trigger cross-check (freshness of the target tag, cheap read-only GET): Chromium Dash
`fetch_releases?channel=Stable&platform=Linux&num=3` → status 200, body sha256
`90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33` (= the receipt's trigger
sha256), first entry `{"version":"156.0.8078.47","channel":"Stable","platform":"Linux",
"previous_version":"155.0.8059.84"}`. The superseding tag is genuinely Stable/Linux, not a
beta/Canary tag.

## 2. Verdict recomputed with the counter's own rule

Rule taken from `scripts/check-release-pins.mjs` (`normLine`, `blockIn`, `anchorHasRange`):
each old line trimmed with inner whitespace collapsed, contiguous anywhere in the new file;
range token must appear in the anchor cell. Recompute (`RefetchS106/recompute.json`):

| item | value |
|---|---|
| range filed | `[186,187]` |
| old lines in range (normalised) | `["// Enable using the BackForwardCache.", "BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);"]` |
| block present in 156 | **true**, at 156 lines **186-187** (same position, not merely "somewhere") |
| my verdict | **holds** |
| counter verdict at tip `32008a45` | `resolved=false, verdict=null, reasons=["f6-refetch content/public/common/content_features.cc"]` |
| counter verdict with my refetch record filed (scratch commit `5a582822abce4389498c4cc487ace2f1b566fb0b`, only `corpus/evidence/round-29/release-pins/refetch/S106.json` added) | `resolved=true, verdict="holds", reasons=[]` |

**Verdict agreement: yes.** My recompute and the counter agree on `holds` as soon as a
refetch record exists — and that run also proves `f4-ranges` passes for S106 (the anchor token
`186-187` is found, so no `f4-ranges` reason).

## 3. ±25 lines around the anchored block, and the whole file

156 window 161-212 (and 154 window 161-212) are **byte-identical**: `recompute.json`
`window_161_212_identical: true`; the first diff hunk of the two files is
`@@ -520,10 +520,6 @@`, i.e. lines 1-519 are unchanged. Nothing inside ±25 lines changed, so nothing
around the block can alter what the row's teaches cell asserts.

Whole-file audit for the teaches assertion ("BackForwardCache ships as an enabled-by-default
feature at this tag, so a clean launch without --disable-back-forward-cache exercises it"):

- `kBackForwardCache` has exactly **one** definition in each file, line 187, value
  `base::FEATURE_ENABLED_BY_DEFAULT` — no later redefinition/override.
- Every `BackForwardCache` mention sits at the identical line number in both tags:
  `186,187,191,193,197,199,201,202,203,215,240,298,300` (all < 520, i.e. inside the byte-identical
  prefix), so `kBackForwardCacheEntryTimeout`, `kBackForwardCacheMemoryControls`
  (Android-only, per its own comment) and the CCNS/device-bound-session eviction features are
  unchanged as well.
- No preprocessor wrapper around the block at either tag: 154 and 156 both have a blank line at
  185 and 188, `// Enable using the BackForwardCache.` at 186, the macro at 187
  (`RefetchS106/filing.json`, `guard_context_154/156`).
- Changes elsewhere in the 156 file are unrelated features (hunks at 520, 753, 783, 915, 1332,
  1377, 1396, 1456, 1491: `kFractionalScrollOffsets` removed, `kPrioritizeMainFrameNavigationNetworkResponse`,
  `kPreconnectManagerDirectFastPath`, `kResourceBroker`, `kWebUIInProcessResourceLoadingV2` default flipped,
  accessibility flags reworked, `kRestrictInteractionsInSwipeRegionOnFullscreen` added). None touches
  BackForwardCache.

**Attack result on the row's teaches cell: no change outside the block alters it.** S106's
"holds" is semantically intact at 156, not just block-present.

## 4. Filing completeness (subset-filing attack)

Parsed from the committed registry row and the committed receipt entry
(`RefetchS106/filing.json`):

| cited by | file | ranges |
|---|---|---|
| source cell | `refs/tags/154.0.8037.97/content/public/common/content_features.cc` | — |
| anchor cell | (basename `content_features.cc`) | `186-187` |
| receipt entry (1 entry, 1 file) | `content/public/common/content_features.cc` | `[[186,187]]` |

`missing_files: []`, `missing_ranges: []`, `extra_ranges: []`, `extra_files: []` — the anchor
cites one file and one range and the receipt files exactly that. The row records **no**
sha256 in source/anchor (`f5-digest` is vacuously satisfied; `PinS106`'s `verify.txt` says the
same), and the entry equals `.ufo/waves/round-29/w1/pins/S106/entry.json` verbatim
(`diff <(jq -S …receipt) <(jq -S …entry.json)` empty), with `superseded_by: null` — correct, the
row holds.

So the wave-1 subset-filing exposure **does not materialise on S106**; it is a counter-level
property (the `f4` loop iterates only over ranges the receipt files, never over ranges the
anchor cites) that other w2 seats already demonstrated on rows with several ranges.

## 5. Findings

### F1 (blocker for the round record, not a row defect) — at the tip, C3's stated command returns `holds=0 drifted=0 unresolved=23`, and the round's own documents assert the opposite

`RefetchS106/counter-at-tip-verbatim.json`, run in the clean clone at `32008a45`:

```
$ node scripts/check-release-pins.mjs --rev 32008a45... --stable 156.0.8078.47 --json \
    | jq '{population,unresolved,holds,drifted}'
{"population":23,"unresolved":23,"holds":0,"drifted":0}      exit=1
```

`git ls-tree -r 32008a45 -- corpus/evidence/round-29/release-pins/refetch/` → **0 files**; the
counter's `REFETCH_ROOT` is that directory, so every row stops at `f6-refetch`. 16 rows carry
that as their only reason; the other 7 carry one `f6-refetch` per filed file (e.g. S080: 8).

Two documents in the integrated state attribute the verdict table to this command:

- `corpus/knowledge/chromium-156-release-pin-recheck.md:40`: "16 rows hold, 7 drifted —
  `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq
  '{holds,drifted}'` 2026-10-26." Verbatim run at the tip: `{"holds":0,"drifted":0}`
  (`RefetchS106/doc-command-at-tip.txt`).
- `corpus/evidence/round-29/release-pins/receipt.json` `note`: "verdicts are computed by
  `scripts/check-release-pins.mjs`, not read from this file" — at the tip the counter computes
  no verdict at all (`verdict: null` for all 23 rows).
- `LOG.md` round-29 entry states "16 hold, 7 drifted and are superseded by S109–S115" without
  the gate state at the logged revision.

The table's content is right for S106 (my independent recompute: holds) but its provenance is
**false at every committed revision so far**. This is premature saturation of C3: `killRule`
("unresolved > 0 … at REV → failed") is currently met.

Smallest safe correction: in the integration commit, copy the w2 records
`.ufo/waves/round-29/w2/refetch/<id>.json` → `corpus/evidence/round-29/release-pins/refetch/<id>.json`
for all 23 rows (23 files), then re-run the claim's `countingCommand` and commit its raw output
under `.ufo/waves/round-29/measure/` before the round's verdict is written. If integration slips,
qualify the knowledge-doc and LOG sentences with the counter state at the tip (`unresolved=23`,
all reasons `f6-refetch`) instead of presenting the table as the gate's output. No counter change
is needed; with the record present the counter already returns `holds` for S106.

### F2 (counter rule limit, demonstrated; needs a dishonest fetcher) — the range binding cannot see enclosing preprocessor context

Take my real 156 bytes, insert `#if 0` before line 186 and `#endif` after 187, commit them as the
156 blob, update the receipt `new_sha256` **and** a colluding refetch record to the new digest →
`RefetchS106/fx-f2b-guardwrap-selfconsistent.json`:

```
{"id":"S106","resolved":true,"verdict":"holds","reasons":[]}     # exit=1 only via the other 22 rows
```

The anchored block is still present verbatim, so the counter holds the row even though the
declaration is compiled out on Linux — exactly the "block presence is not meaning" limit the
knowledge doc states in the abstract. Live bytes are **not** wrapped (my fetch, `filing.json`
guard context, and the ±25-line identity above), so S106 itself is unaffected. Without a
colluding refetch the same hostile blob fails `f6-refetch`
(`RefetchS106/fx-f2b-guardwrap-selfconsistent.json` sibling run at the earlier commit: reason
`f6-refetch`), which is what makes this a *counter* limit rather than a live defect.

Smallest safe correction: none required for this round's claim; if hardened later, extend `f4`
with a one-line context assertion (the lines immediately before/after the filed range must be
unchanged when they open/close a preprocessor conditional), or record the enclosing guard span in
the anchor cell.

### F3 (negative finding, strengthens the row) — dropping the filed range is not a silent weakening

Hostile receipt with `ranges: []` for S106 (`RefetchS106/fx-f1-dropped-range.json`):

```
{"id":"S106","resolved":false,"verdict":"drifted","reasons":["s1-drift-unsuperseded"]}
```

With no ranges the counter falls back to whole-file digest equality, which fails for a changed
file → `drifted` → needs a superseding row → unresolved. So a hostile integrator cannot strip the
anchor binding to make S106 pass.

### F4 (verification-surface note) — at the tip the counter never executes `f4-ranges` for any row

Because `f6-refetch` fires inside the per-file loop before the range block, no row's range
binding is evaluated at `32008a45`; only after a refetch record exists does `f4` run. For S106 I
executed both the counter (`f4` passes, §2) and an independent `anchorHasRange`-equivalent check
(token `186-187` present in the anchor cell) so the row's range is attested in this wave.
Consequence for the claim: the tip output alone is no evidence of range correctness for the
other 22 rows.

### F5 (observation, no action) — S106's citing knowledge entry needs no recheck note

`corpus/knowledge/bfcache-runtime-observed-round-25.md` still reads "Chromium 154 … the feature
ships enabled by default" and "re-located in fresh bytes on 2026-10-25"; it has no round-29 note.
That is correct under C3's `killRule`, which requires notes only for drifted rows, and the
round-level note `chromium-156-release-pin-recheck.md:47` already records S106 holding at 156.
No defect.

## 6. Axis impact (as measured, not argued)

- freshness: S106's bytes, ranges and verdict survive an independent fetch; the claim's gate
  cannot currently report that (F1). The row itself contributes a clean `holds` to the 16.
- calibration: the round's documents (F1) currently assert `holds/drifted` figures their cited
  command does not produce.

## 7. Commands and exit codes

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin clone && git -C clone checkout -q 32008a45…
$ git -C clone status --porcelain | wc -l                       → 0
$ curl … 156.0.8078.47 …content_features.cc?format=TEXT          → status 200
$ base64 -d                                                     → exit 0; 74920 bytes
$ sha256sum                                                     → 392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259
$ curl … 154.0.8037.97 …content_features.cc?format=TEXT          → status 200
$ base64 -d                                                     → exit 0; 73952 bytes
$ sha256sum                                                     → 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44
$ cmp -s committed-<tag>.cc fetch/content_features.cc.<tag>      → identical (both tags)
$ node recompute.mjs                                            → exit 0, verdict "holds", block at 156:186
$ node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json
                                                                → exit 1; population=23 unresolved=23 holds=0 drifted=0
$ node scripts/check-release-pins.mjs … | jq '{holds,drifted}'   → {"holds":0,"drifted":0}   exit 1
$ # scratch commit 5a58282 adds corpus/…/release-pins/refetch/S106.json only
$ node scripts/check-release-pins.mjs --rev 5a58282 --stable 156.0.8078.47 --json
                                                                → exit 1; unresolved=22, S106 resolved=true verdict="holds"
$ node scripts/check-release-pins.mjs --rev <F1 fixture> …       → exit 1; S106 drifted + s1-drift-unsuperseded
$ node scripts/check-release-pins.mjs --rev <F2b fixture> …      → exit 1; S106 resolved=true verdict="holds"
$ curl … chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3
                                                                → status 200; sha256 90abf2c3…fd7fe33 (matches trigger)
$ diff -u 154 156                                               → exit 1 (differences); first hunk @@ -520,10 +520,6 @@
```

No counter/selftest was run as a pass claim beyond the runs above; nothing was repaired in
production code (attack seat). No tool installed or upgraded; no pacman transaction; scratch
`/fast/scratch/hyaku/tabi-r29/RefetchS106` (clone, fetches, four fixture commits' JSON outputs)
removed after copying receipts to this directory.

## 8. Artefacts in `.ufo/waves/round-29/w2/`

- `refetch/S106.json` — the f6 input, my fetch only.
- `RefetchS106/S106.json` — same record, kept with the evidence set.
- `RefetchS106/fetches.tsv` — statuses, decoded sizes, sha256 per tag.
- `RefetchS106/recompute.json` — block-rule verdict, block position, ±25-line identity.
- `RefetchS106/filing.json` — cited vs filed files/ranges, guard context.
- `RefetchS106/diff-154-156.txt` — full 154→156 diff of the row's file.
- `RefetchS106/counter-at-tip.json`, `counter-at-tip-verbatim.json` — gate at `32008a45`.
- `RefetchS106/counter-with-refetch.json` — gate with my record only (S106 holds).
- `RefetchS106/doc-command-at-tip.txt` — the knowledge-doc command, run verbatim.
- `RefetchS106/fx-f1-dropped-range.json`, `fx-f2b-guardwrap-selfconsistent.json` — hostile fixtures.
