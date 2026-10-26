# PinS106 — round 29, w1, C3 re-open of registry row S106 at Chromium stable 156.0.8078.47

Seat: `PinS106` (leaf). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r29/PinS106` (removed at end: `rm -rf` exit 0).
Output dir: `.ufo/waves/round-29/w1/pins/S106/`.

## Verdict

**S106 holds at 156.0.8078.47.** One file, one anchored range, unchanged and at the same line numbers. No superseding registry row is required (`supersede-row.md` deliberately not written).

## 1. Row read (registry line 120)

`| S106 | Chromium 154 content_features.cc — BackForwardCache feature — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT | code | A | The shipped default enablement of the BackForwardCache feature at Chromium tag 154.0.8037.97 only | tag 154.0.8037.97; decoded text lines 186-187 carry \`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)\` with the comment \`// Enable using the BackForwardCache.\` | BackForwardCache ships as an enabled-by-default feature at this tag, so a clean launch without --disable-back-forward-cache exercises it; no runtime claim follows from a source alone | mined | 2026-10-25 | on-release | corpus/knowledge/bfcache-runtime-observed-round-25.md |`

Chromium files cited:
- Source cell URL → `content/public/common/content_features.cc` (tag 154.0.8037.97).
- Anchor basenames → `content_features.cc` only (same file; no second file named).
- used-by `corpus/knowledge/bfcache-runtime-observed-round-25.md:61-65` names only `content_features.cc` (Chromium 154). Earlier dossier `.ufo/waves/round-25/w1/ScoutOpenS106.md:26` and `.ufo/waves/round-25/w1/ScribeLesson25.md:30` cite the same single path and range. No Gitiles directory listing was needed.

Anchor ranges for that file, spelled as in the anchor: `186-187` (one range).

Registry digest: **none recorded** in the row's source or anchor cells (no 64-hex and no `8hex…4hex`). f5 is therefore not triggered for this row.

## 2. Fetches (both HTTP 200, decoded with `base64 -d`)

| tag | HTTP status | base64 bytes | decoded bytes | decoded lines (`wc -l`) | sha256 |
|---|---|---|---|---|---|
| 154.0.8037.97 | 200 | 98604 | 73952 | 1624 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` |
| 156.0.8078.47 | 200 | 99896 | 74920 | 1644 | `392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259` |

Saved at `.ufo/waves/round-29/w1/pins/S106/bytes/<tag>/content/public/common/content_features.cc` (exact path, decoded bytes).

Re-fetch determinism (second GET, same tag): decoded sha256 identical for both tags; statuses 200/200 again.

## 3. Digest check

Row records no digest → nothing to match. Corroboration only, not an f5 check: `9b93fe64…424e6c44` is exactly the 154 digest recorded for S106 in `.ufo/waves/round-25/w1/ScribeLesson25.md:30` and matches the freshly decoded 154 bytes.

## 4. Range verdict

| file | range (154 line numbers) | verdict | where it sits in 156 |
|---|---|---|---|
| content/public/common/content_features.cc | 186-187 | **holds** | 186-187, unique contiguous occurrence |

Bytes of 154 lines 186-187 (trimmed, inner whitespace collapsed):
1. `// Enable using the BackForwardCache.`
2. `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`

Both lines are byte-identical at 156 lines 186-187; the block occurs exactly once in the 156 file (`[[186,187]]`). No unified diff produced because nothing drifted.

Local simulation of the frozen counter's f2/f3/f4/f5 checks over `entry.json` (transcript committed at `.ufo/waves/round-29/w1/pins/S106/verify.txt`): all PASS.

## 5. entry.json

Written `.ufo/waves/round-29/w1/pins/S106/entry.json`, `fetched_by: PinS106`, `fetched_at: 2026-10-26T04:26:54Z`, `superseded_by: null`, one file object with `old_bytes`/`new_bytes` at `corpus/evidence/round-29/release-pins/bytes/<tag>/content/public/common/content_features.cc`, sha256s above, `ranges: [[186,187]]`. JSON re-parsed by node: exit 0.

## 6. Supersede row

Not written: no range drifted, so C3's `s1-drift-unsuperseded` has no work for S106 and the registry needs no new row from this seat.

## Commands and exit codes

```
# fetch both tags (loop printed status; decode + hash inline)
curl -sS -o "$S/$T.b64" -w '%{http_code}' "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T/$P?format=TEXT"
  → 154.0.8037.97 status=200 b64bytes=98604 decoded=73952 lines=1624 sha256=9b93fe64…
  → 156.0.8078.47 status=200 b64bytes=99896 decoded=74920 lines=1644 sha256=392e24d7…
base64 -d < "$S/$T.b64" > "$OUT/bytes/$T/$P"                      # exit 0

# exit codes + determinism re-fetch
curl ... -w '%{http_code}\n' → 200 ; curl_exit=0  (154)
curl ... -w '%{http_code}\n' → 200 ; curl_exit=0  (156)
base64 -d | sha256sum → 9b93fe64…  (154) and 392e24d7…  (156), equal to stored bytes

node -e 'require("./.ufo/waves/round-29/w1/pins/S106/entry.json")'  # exit 0, "parsed ok S106 1 [[186,187]]"
node "$S/sim.cjs" > "$OUT/verify.txt"                                # exit 0, all PASS
```

Exit codes not captured for the first fetch loop's `curl` (only HTTP statuses, both 200); the later explicit re-fetch captured `curl_exit=0` for both tags.

## Risks / blockers / hand-offs

1. **f6 independent re-fetch record still owed.** `scripts/check-release-pins.mjs` requires `corpus/evidence/round-29/release-pins/refetch/S106.json` with `seat` different from `PinS106`, `tag: "156.0.8078.47"`, `status: 200`, `sha256: 392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259`, `path: content/public/common/content_features.cc`. That path is outside this seat's write scope; an independent seat must produce it or the row stays unresolved for f6 despite holding.
2. Bytes must be copied from `.ufo/waves/round-29/w1/pins/S106/bytes/` into the committed receipt tree `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/content/public/common/content_features.cc` at the same exact paths the entry names (f3 path binding), and the receipt's `stable` field must equal `156.0.8078.47`.
3. Row-level `recheck: on-release` and tag 154.0.8037.97 < stable 156.0.8078.47 keep S106 in the 23-row population (population arithmetic is the aggregator's, not measured here).
4. No knowledge-entry recheck note is required: only drifted rows carry that obligation, and S106 held. `bfcache-runtime-observed-round-25.md:61-65` remains accurate for the 156 tag (same declaration, same comment, same defaults); its "Chromium versions other than 154.0.8037.97 are unprobed" unknown stays true as written for runtime behavior.
5. No tool installs/upgrades were made this wave.
