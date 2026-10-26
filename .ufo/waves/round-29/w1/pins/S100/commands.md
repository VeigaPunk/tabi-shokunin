# PinS100 — commands actually run (round 29, wave w1, 2026-10-26)

Scratch: `S=/fast/scratch/hyaku/tabi-r29/PinS100` (created; base64 intermediates lived there).
Output dir: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S100/`.
No lane tracked file, index or jj state was touched; no fixture repo and no clone were needed.

## Fetches (decoded bytes)

```
P=third_party/blink/renderer/core/html/forms/html_form_element.cc
for T in 154.0.8037.97 156.0.8078.47; do
  code=$(curl -sS -o "$S/raw-$T.b64" -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/$T/$P?format=TEXT")
  base64 -d "$S/raw-$T.b64" > "$OUT/bytes/$T/$P"
  sha256sum "$OUT/bytes/$T/$P"
done
```

Observed (exit codes are the shell's for each command in the loop; `base64 -d` printed the
status recorded below):

| tag | curl HTTP | base64 bytes | `base64 -d` exit | decoded bytes | decoded lines | sha256 |
|---|---|---|---|---|---|---|
| 154.0.8037.97 | 200 | 91040 | 0 | 68278 | 1740 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| 156.0.8078.47 | 200 | 92716 | 0 | 69536 | 1761 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |

`sha256sum` exit 0 in both iterations.

## Gitiles identity cross-check (status + server-side blob id)

```
curl -sS -o tag-$T.json  -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/'$T'?format=JSON'
curl -sS -o blob-$T.json -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/'$T'/'$P'?format=JSON'
tail -c +5 tag-$T.json | python3 -c 'import json,sys; print(json.load(sys.stdin)["commit"])'
tail -c +5 blob-$T.json | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])'
```

| tag | tag-json HTTP | blob-json HTTP | tag commit | Gitiles blob id |
|---|---|---|---|---|
| 154.0.8037.97 | 200 | 200 | `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` |
| 156.0.8078.47 | 200 | 200 | `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` | `b3611221ba58efc420f5fa627aa30b14a75b4a77` |

Local git-blob sha1 of each decoded file (`sha1("blob <len>\0" + bytes)`, Python `hashlib`,
exit 0) equals the Gitiles blob id for that tag in both rows: the decoded bytes are exactly
the server's blobs.

## Range verdicts (counter semantics: line trimmed, inner whitespace collapsed, contiguous block)

Python `difflib.SequenceMatcher(None, old_norm, new_norm, autojunk=False)` over the whole
file, exit 0. Ten non-equal opcodes in total; exactly one overlaps old lines 174-328.

```
range 174-328: block of 155 lines, holds=False, no start position in the 156 file
range 635-842: block of 208 lines, holds=True  at 156 lines 673-880
equal check on[634:842] == nn[672:880]: True
```

Canonical `diff -u` (GNU diff, exit 1 = files differ; saved whole as `full-file.diff`), eight
hunks, all additions except the tail:

```
@@ -123,6 +123,7 @@      +1
@@ -197,6 +198,16 @@    +10   <-- inside anchor range 174-328
@@ -359,6 +370,13 @@     +7
@@ -465,6 +483,11 @@     +5
@@ -515,6 +538,21 @@    +15
@@ -1191,15 +1229,14 @@   +7 / -8
@@ -1207,16 +1244,11 @@   +3 / -8
@@ -1724,17 +1756,6 @@   -11
```

The hunk inside the anchor is `@@ -197,6 +198,16 @@`: ten new lines after the blank at old
line 199, i.e. 156 lines **201-210** (nine guard lines plus one blank). A pure insertion — no
154 line inside 174-328 is removed or rewritten. `difflib.SequenceMatcher` reports the same
insertion one line earlier (`insert` old boundary 197, new 199-208) only because both old 198
and new 199 are a bare `}`; GNU diff's alignment is the one quoted in the draft row, and the
quoted text at 156 lines 207-208 is unambiguous.

Line mapping used in the draft row and recheck notes (old 154 line -> 156 line):
174→175, 181→182, 198→199, 199→200, 200→211, 328→339, 635→673, 639→677, 647→685,
659→697, 679→717, 787→825, 810→848, 815→853, 830→868, 834→872, 839→877, 841→879, 842→880.

Sub-ranges cited by the knowledge entries, re-located by block search (all still present
contiguously, shifted): 212-218→223, 218-221→229, 290-319→301, 298-319→309, 320-327→331,
720-815→758, 729-758→767, 787-806→825, 807-813→845, 834-842→872, 787-815→825.

Localized diffs saved beside this file: `range-174-328.diff` (10 added lines, nothing
removed) and `range-635-842.diff` (0 lines).

## Registry digest binding

Row anchor carries the full digest `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
(`corpus/SOURCES.md:114`). Measured 154 decoded sha256 is identical -> match. The 156 decoded
sha256 differs (`2a96a97b…6102`), so the row's digest is a 154-only fact.

## Cross-seat byte agreement (corroboration only, not the f6 record)

`sha256sum .ufo/waves/round-29/w1/pins/S096/bytes/{154.0.8037.97,156.0.8078.47}/…/html_form_element.cc`
(exit 0) printed `8c8d6796…916` and `2a96a97b…102`, equal to this seat's two digests. That is
the same public file fetched twice, so it is determinism evidence, not independent corroboration.

## Not run by this seat

`node scripts/check-release-pins.mjs …` was deliberately not executed (lane gate, parent's
post-integration job). The f6 independent re-fetch record
`corpus/evidence/round-29/release-pins/refetch/S100.json` and the copy of `bytes/` into
`corpus/evidence/round-29/release-pins/bytes/` belong to other seats.
