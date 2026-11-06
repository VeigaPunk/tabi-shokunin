VERIFIED

# R69Scout — scoped findings (round 69, coverage axis)

Full report with every reproduction command:
`.ufo/waves/round-69/w1/R69Scout/report.md`
Receipts: `.ufo/waves/round-69/w1/R69Scout/receipts/`
Staged independent copies: `.ufo/waves/round-69/w1/R69Scout/sources/`

## Independent re-open (this session, 2026-11-06T18:53:16Z)

Fetched myself, decoded, compared against the lane's staged copy:

| item | value |
|---|---|
| S174 decoded sha256 | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` |
| bytes / lines | 89,463 / 2,343 |
| vs `.ufo/waves/round-69/sources/input_handler.cc` | **identical** (`cmp`) |
| vs freeze `a033979c` blob | identical |
| vs round-59 staged (S162 body) | identical |
| transport sha256 | `847c531ee32e97a3dcd19bf100864a8867f045792b5b320db8f644f4e67c46a0`, 119,284 B — identical to the lane's `.formatTEXT.b64` |
| S173 decoded sha256 | `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` — identical to `.ufo/waves/round-68/sources/Input.pdl`; **lines 286–315 unchanged** (diff: no output) |

Digest = **byte identity only**. No publisher-authentication or build-provenance claim.

## Located quotes (verbatim, ≤25 words each; all contiguous substrings of the fetched body)

| lines | quote | words |
|---|---|---|
| 71–79 | `bool StringToGestureSourceType(std::optional<std::string> in, content::mojom::GestureSourceType& out) { if (!in.has_value()) { out = content::mojom::GestureSourceType::kDefaultInput; return true; } if (in.value() == Input::GestureSourceTypeEnum::Default) { out = content::mojom::GestureSourceType::kDefaultInput; return true; }` | 25 |
| 2163 | `callback->sendFailure(Response::InvalidParams("Position out of bounds"));` | 4 |
| 2167–2170 | `const bool kDefaultPreventFling = true; const int kDefaultSpeed = 800; gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling); gesture_params.speed_in_pixels_s = speed.value_or(kDefaultSpeed);` | 16 |
| 2190–2192 | `SynthesizeRepeatingScroll(gesture_params, repeat_count.value_or(0), base::Milliseconds(repeat_delay_ms.value_or(250)), interaction_marker_name.value_or(""), ++last_id_,` | 5 |
| 2239–2249 | `if (repeat_count > 0) { base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask( FROM_HERE, base::BindOnce(&InputHandler::SynthesizeRepeatingScroll, weak_factory_.GetWeakPtr(), gesture_params, repeat_count - 1, repeat_delay, interaction_marker_name, id, std::move(callback)), repeat_delay); } else { SendSynthesizeScrollGestureResponse(std::move(callback), result); }` | 24 |

Precision corrections to the seat brief: the absent→`kDefaultInput` branch is **73–76** (71–79
also covers the explicit `"default"` branch); the two repeat defaults are on **2190–2191**
(line 2192 is `interaction_marker_name`/`last_id_`); `OnScrollFinished` is **defined at 2225**,
with 2239–2249 being its repeat/response tail; line **2112** carries the same
"Position out of bounds" message in the *pinch* path — 2163 is the *scroll* one.

## S174 row

A row for this source **already landed uncommitted** in `corpus/SOURCES.md` (line 188) while I
worked. I verified it rather than editing it (L1 is sole integration owner) and drafted my own
variant for L1 to take or decline:
`.ufo/waves/round-69/w1/R69Scout/SOURCES-draft-A-on-release.md` (recommended) and
`SOURCES-draft-B-180d.md`. The only differences from the landed row: add
`2163 (InvalidParams Position out of bounds)` to `anchor` and the matching clause to `teaches`
(variant B also uses `recheck` `180d` instead of `on-release`).

Gate results, measured on a scratch mirror of the lane (`corpus/` symlinked to the real lane so
used-by paths resolve):

| registry | lane `check-sources.mjs` | fleet `sources-census.sh validate` |
|---|---|---|
| base `58d84eda` (173 rows) | 3 findings (S171/S172/S173 duplicate_url) | exit 0 |
| landed now (174 rows) | 3 findings (same three) | exit 0 |
| variant A / variant B | 3 findings (same three) | exit 0 / exit 0 |

Round 69 adds **no new finding** to either gate; the S174 row itself is clean under both.
Schema checked against `corpus/SOURCES.md` + `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`: 11
columns (NF=13), no literal `|` in a cell, kind `code`, tier `A`, status `mined`, opened
`2026-11-06`, recheck `on-release`, used-by both exist and cite `S174`, anchor carries line
ranges + revision + digest.

## Cross-check against the runtime receipt (recomputed by me from the committed file — I ran no browser)

`repeatCount N` ⇒ **N+1 gestures, one response after the last**: `repeat` leg
(`repeatCount: 2, yDistance: -200`) moved `scrollY` 300→900 = 600 px = 3×200 with **3**
`scrollend`. `mouse` 46 trusted wheels, `deltaY` sum +600, `deltaMode` 0. `default` 25 wheels,
sum −300 (no `gestureSourceType` ⇒ path 73–76 ⇒ `kDefaultInput`). `touch` 0 wheels,
1 pointerdown/up(touch) + 40 pointermove + touchstart/touchend, 0 touchmove, `scrollY` unchanged.
Source and runtime agree; the landed S174 `teaches` cell is substantiated by both.

## Two disclosures for L1 (not amendments)

1. **S174 and S162 are the same file at the same tag** (same 89,463 B, same sha256) but S162
   cites the bare URL and S174 the `?format=TEXT` URL, so neither gate pairs them. The spelling
   is load-bearing: respelling S174's URL to the bare form
   (`SOURCES-variant-bareurl.md`) makes the lane checker raise a 4th finding
   `duplicate_url/E04/S174`. The spellings really do serve different content (bare URL returns a
   1,035,753-byte HTML page, verified). Different scopes, same tier A, both true — worth a
   disclosure line in the lesson's `## Gate`.
2. **The lane checker (E04, exit 1) and the fleet census (W04, exit 0) still disagree on
   S171/S172/S173** — identical at base and now, so round 69 does not move this. It is r68's
   open R5. I propose no `supersedes` prefix: that framing was already rejected as false for
   cross-scope pairs.

Also noted: mid-session the census reported `E11 S174 missing used-by corpus/lessons/round-69.md`
because L1 had not yet landed the lesson; the file now exists (cites `S174`) and the census
exits 0. A replay mid-session would see that E11.

## Not established here

No runtime claim of my own (no Chromium, driver, counter or battery executed); no publisher
authentication; no build-provenance claim; no touch-scrolling claim beyond the lane's existing
receipt; no re-judgement of the C1 adjacency claim.

## Files written (all under `.ufo/waves/round-69/w1/R69Scout/`, plus this trailer)

`report.md`, `receipts/fetch-receipt.json`, `receipts/located-quotes.md`,
`receipts/census-validate-after-S174.txt`, `sources/input_handler.cc`,
`sources/input_handler.cc.formatTEXT.b64`, `sources/Input.pdl`, `SOURCES-draft-A-on-release.md`,
`SOURCES-draft-B-180d.md`, `SOURCES-variant-bareurl.md`, `SOURCES-base.md`.

No production/lane-root/fleet/sibling file was written; no git or jj mutation, commit or push;
no tool installed or upgraded. Scratch `/fast/scratch/hyaku/tabi-r69/R69Scout/` deleted after
the receipts were copied in.
