VERIFIED

# R69Scout — independent re-open of S174 (Chromium 155 input_handler.cc) and S173 (Input.pdl)

Seat: `R69Scout` (leaf member; no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Round 69, Amendment 46 fresh start. Axis judged: **coverage**.
Base `58d84eda992ffc11d77d76a2c1019bfe061f9241`; freeze `a033979c55c92dca2913a8f94ac9f1cb6c4b38da`.

Everything below was measured this session. No claim, counter or kill rule was read as
amendable; nothing outside `.ufo/waves/round-69/w1/R69Scout/` was written.

---

## 1. Independent fetch of S174 — byte-identical to the lane's staged copy

Fetched the tag URL myself this session (no reuse of the lane's staged bytes for the
comparison — the lane copy was only the *other* side of the comparison):

```
curl -sS -f -o input_handler.cc.b64 \
 "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT"
```

| item | value |
|---|---|
| access time (UTC) | `2026-11-06T18:53:16Z` (= 2026-11-06T15:53:16-03:00) |
| transport bytes | 119,284 |
| transport sha256 | `847c531ee32e97a3dcd19bf100864a8867f045792b5b320db8f644f4e67c46a0` |
| decoded bytes | 89,463 |
| decoded sha256 | `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` |
| decoded line count | 2,343 |
| HTTP | 200, no redirect, `text/plain` (base64 body) |

Comparisons (all pass):

```
cmp input_handler.cc  .ufo/waves/round-69/sources/input_handler.cc          -> identical
cmp input_handler.cc.b64 .ufo/waves/round-69/sources/input_handler.cc.formatTEXT.b64 -> identical
sha256sum .ufo/waves/round-59/sources/input_handler.cc                     -> 72cf0d1d...4f4  (same)
git show a033979c:.ufo/waves/round-69/sources/input_handler.cc | sha256sum  -> 72cf0d1d...4f4  (same)
```

My own copies are staged at `.ufo/waves/round-69/w1/R69Scout/sources/`
(`input_handler.cc`, `input_handler.cc.formatTEXT.b64`, `Input.pdl`).

**Digest claim limit (stated, not implied):** these digests establish **byte identity**
between what this seat fetched at the cited tag URL and what the lane staged. They do **not**
establish publisher authenticity, and they do **not** establish that the running
`/usr/bin/chromium` 155.0.8059.84 (Arch) was built from exactly these bytes with no distro
patch. The round-69 lesson's rejection of "S174 authenticates the build that ran" is correct
and this seat's evidence does not weaken it.

## 2. S173 re-open at the same tag — lines 286–315 unchanged

```
curl -sS -f -o Input.pdl.b64 \
 "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT"
```

- decoded sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`, 336 lines,
  14,431 bytes — **identical** to `.ufo/waves/round-68/sources/Input.pdl`.
- `diff <(sed -n '286,315p' fetched) <(sed -n '286,315p' .ufo/waves/round-68/sources/Input.pdl)`
  → **no output**; the whole-file digests are equal, so the 286–315 slice is trivially equal.
- Lines 286–315 are still the `experimental command synthesizeScrollGesture` block with
  `preventFling` (default true, 303–304), `speed` (default 800, 305–306),
  `gestureSourceType` (307–309), `repeatCount` (default 0, 310–311),
  `repeatDelayMs` (default 250, 312–313), `interactionMarkerName` (314–315).

**Correction to my own brief:** the brief said "repeat_count.value_or(0) and repeat_delay 250
default (~2190-2192)". The tighter true range is **2190–2191** — `repeat_count.value_or(0)` is on
2190, `base::Milliseconds(repeat_delay_ms.value_or(250))` on 2191; line 2192 carries
`interaction_marker_name.value_or(""), ++last_id_` and nothing about repeats. The **landed** S174
row already says `2190-2191`, which is correct; my brief's "2190–2192" was the loose one.

## 3. Located quotes (verbatim, with line numbers, ≤25 words each)

Full text, line dumps and the byte-level verbatim check are in
`.ufo/waves/round-69/w1/R69Scout/receipts/located-quotes.md`. All five are **contiguous
verbatim substrings** of the independently fetched body (`seg in txt` → True for all five).

| # | lines | quote (verbatim) | words |
|---|---|---|---|
| A | 71–79 | `bool StringToGestureSourceType(std::optional<std::string> in, content::mojom::GestureSourceType& out) { if (!in.has_value()) { out = content::mojom::GestureSourceType::kDefaultInput; return true; } if (in.value() == Input::GestureSourceTypeEnum::Default) { out = content::mojom::GestureSourceType::kDefaultInput; return true; }` | 25 |
| B | 2163 | `callback->sendFailure(Response::InvalidParams("Position out of bounds"));` | 4 |
| C | 2167–2170 | `const bool kDefaultPreventFling = true; const int kDefaultSpeed = 800; gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling); gesture_params.speed_in_pixels_s = speed.value_or(kDefaultSpeed);` | 16 |
| D | 2190–2192 | `SynthesizeRepeatingScroll(gesture_params, repeat_count.value_or(0), base::Milliseconds(repeat_delay_ms.value_or(250)), interaction_marker_name.value_or(""), ++last_id_,` | 5 |
| E | 2239–2249 | `if (repeat_count > 0) { base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask( FROM_HERE, base::BindOnce(&InputHandler::SynthesizeRepeatingScroll, weak_factory_.GetWeakPtr(), gesture_params, repeat_count - 1, repeat_delay, interaction_marker_name, id, std::move(callback)), repeat_delay); } else { SendSynthesizeScrollGestureResponse(std::move(callback), result); }` | 24 |

Tighter sub-quotes if a single short excerpt is wanted: A′ = lines 73–76
`if (!in.has_value()) { out = content::mojom::GestureSourceType::kDefaultInput; return true; }`
(9 words); E′ = line 2239 `if (repeat_count > 0) {` (4 words).

**Precision note on the brief's line hints** (the brief's hints are approximate; the true
locations are):

- A: the *absent* → `kDefaultInput` branch is **73–76**; 77–79 is the explicit `"default"`
  string branch, which also yields `kDefaultInput`. The function spans 71–90 (touch 81–83,
  mouse 85–87, `return false;` at 89).
- C: exact, 2167–2170.
- D: exact for the two repeat defaults, 2190–2191 (see §2).
- E: `InputHandler::OnScrollFinished` is **defined at line 2225**; 2239–2249 is the repeat /
  final-response tail inside it. The landed row's anchor cell says "2239-2249 (OnScrollFinished)";
  the taught content is exactly in 2239–2249, and the definition site is 2225 — a labelling
  nicety, not a false claim.
- B: 2163 is inside the **scroll** gesture path (guard `if (!PointIsWithinContents(...))` at
  2162, anchor computed at 2161). The identical message also appears at 2112 in the **pinch**
  path — do not let a verifier pull the wrong occurrence.
  `PointIsWithinContents` is defined at 2314–2318 (view-bounds containment).

## 4. Source→runtime cross-check (the `1 + N` claim)

`SynthesizeRepeatingScroll` (2196–2223) queues exactly **one** gesture per call and binds
`repeat_count` into the completion callback (2217–2222). `OnScrollFinished` (2225–2250)
reschedules itself with `repeat_count - 1` while `repeat_count > 0` (2239–2246) and takes the
`else` branch — the single `SendSynthesizeScrollGestureResponse` at 2248 — only when
`repeat_count == 0`. Therefore `repeatCount = N` ⇒ **N+1 gestures, one response, after the last
gesture finishes**.

Independently confirmed from the lane's scored receipt
(`corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`,
sha256 `587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8`), recomputed by me:

- `repeat` leg: `repeatCount: 2, yDistance: -200` → `scrollY` 300 → 900 = **600 px = 3 × 200 px**,
  and **3** `scrollend` events in that leg → 1 + N = 3 gestures, one `scrollend` each. ✔
- `mouse` leg: 46 trusted `wheel`, `deltaY` sum +600, `deltaMode` 0, max |deltaY| 20. ✔
- `default` leg: 25 trusted `wheel`, `deltaY` sum −300 (no `gestureSourceType` sent ⇒ source
  path 73–76 ⇒ `kDefaultInput`; delivered as wheel on this host). ✔
- `touch` leg: 0 `wheel`, 1 `pointerdown`/`pointerup`(touch), 40 `pointermove`(touch), 1
  `touchstart`, 1 `touchend`, 0 `touchmove`, `scrollY` unchanged at 900 — consistent with the
  lesson's rejection of "touch scrolling works" and with the S174 scope's
  "not renderer event delivery and not touch scrolling". ✔

So the landed S174 row's `teaches` cell is substantiated by **both** the source lines and the
runtime receipt; the two agree without circularity (the receipt was produced by the pinned
driver, the row is a source claim about the browser side).

## 5. S174 SOURCES row — drafted, and the landed row verified against it

A row for this source **already landed uncommitted** in `corpus/SOURCES.md` (line 188,
`git status` shows ` M corpus/SOURCES.md`) while I was working. I did not edit it — L1 is the
sole integration owner. I verified it, and drafted my own variant for L1 to take or decline.

My drafted row (`SOURCES-draft-A-on-release.md`, `SOURCES-draft-B-180d.md` in this dir) differs
from the landed row in exactly two respects, both additive:

1. **anchor** gains `2163 (InvalidParams Position out of bounds)` — the brief asked for that
   quote and the landed row does not cite it;
2. **teaches** gains `; an out-of-bounds anchor is refused with InvalidParams Position out of
   bounds` — the same fact in the learner-benefit cell.

and, in variant B only, `recheck` is `180d` (an `NNd` cadence) instead of `on-release`.
Everything else — id, source URL, kind `code`, tier `A`, scope, opened `2026-11-06`, status
`mined`, used-by — I keep as landed.

**Both variants pass both gates, identically to the landed baseline** (measured on a scratch
mirror of the lane, `corpus/` symlinked to the real lane so used-by paths resolve):

| registry state | lane `scripts/check-sources.mjs` | fleet `scripts/sources-census.sh validate` |
|---|---|---|
| base `58d84eda` (173 rows) | 3 findings (`S171`,`S172`,`S173` duplicate_url) | exit 0 |
| landed now (174 rows) | 3 findings (same three) | exit 0 |
| my variant A (on-release) | 3 findings (same three) | exit 0 |
| my variant B (180d) | 3 findings (same three) | exit 0 |

Round 69 **adds no new finding** to either gate, and the S174 row itself is clean under both
(`no E-codes`).

Schema conformance of the row, checked against `corpus/SOURCES.md` +
`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`: 11 columns (NF=13 ✔), no literal `|` inside any
cell ✔, `kind` ∈ {spec,docs,paper,code,tool,dataset,talk,book,community,own-work} → `code` ✔,
`tier` `A` ✔, `status` `mined` ✔, `opened` ISO `2026-11-06` ✔, `recheck` `on-release`
(symbolic cadence, accepted by both checkers; matches the sibling tag-pinned rows
S162/S168/S169/S170/S171/S173) ✔, `used-by` two existing paths that both cite `S174` ✔,
`anchor` carries exact line ranges + revision + digest ✔, `teaches` is one grounded benefit ✔,
no `|` and no credential material ✔.

**Recommendation to L1:** take variant **A** (add the 2163 anchor + the matching `teaches`
clause; keep `on-release`). Reason for keeping `on-release` over `180d`: the source is pinned to
an immutable release tag, so "recheck on release" is the semantically correct cadence and it is
what every sibling tag-pinned code row in this registry already uses. If L1 wants literal
conformance to the seat brief's "ISO date or NNd", variant **B** is measured-equivalent and
passes both gates unchanged.

### 5.1 Two findings L1 should know (disclosure, not amendment)

**(a) S174 and S162 are the same file at the same tag, and neither gate can see it.**
S162 (round 59) cites `.../input_handler.cc` — the **bare** URL — while S174 cites
`.../input_handler.cc?format=TEXT`. Both staged copies are the same 89,463 B,
sha256 `72cf0d1d…4f4`. The URL spellings differ, so neither the lane's `normalizeUrl` nor the
census's `url_of` collapses them, and the cross-scope duplicate (W04) is **not** raised for the
pair. I verified the spelling is load-bearing: rewriting only S174's URL cell to the bare form
(`SOURCES-variant-bareurl.md`) makes the lane checker raise a **4th** finding,
`duplicate_url / E04 / S174`. The two spellings do serve different content — the bare URL
returns a **1,035,753-byte HTML page** (verified: `content-length: 1035753`, `<!DOCTYPE html>`,
the source text appears only as page content), while `?format=TEXT` returns the base64 of the
file itself — so the difference is not a dodge, but the registry's duplicate-detection simply
cannot pair the two rows. Different scopes (S162: `GetEventModifiers` key-state mapping; S174:
scroll-gesture browser-side handling), same tier A, both true. Worth a line in the lesson's
`## Gate` as honest disclosure, since a reader comparing the two rows would otherwise have to
rediscover it.

**(b) The lane's own `check-sources.mjs` and the fleet census still disagree — unchanged from
r68's R5.** The lane checker flags `S171`, `S172`, `S173` as `duplicate_url / E04` (exit 1);
the fleet census reports the same three as `W04` cross-scope warnings and exits 0. This seat
counted the base registry the same way (3 findings) and the landed registry (3 findings), so
**round 69 does not move this**: it is a pre-existing, still-open cross-authority question, not
a round-69 regression. I am not proposing a `supersedes` prefix on any row — adding one would be
a false claim for S162/S173-style cross-scope pairs, and the r68 spot-check already rejected that
framing for S173/S168.

**(c) Timeline note on the `used-by` path.** When I first ran the census (16:0x) the S174 row's
second used-by path `corpus/lessons/round-69.md` did not yet exist on disk, and the census
reported `E11 S174 missing used-by corpus/lessons/round-69.md` (exit 1). L1 landed the lesson
during this session; the file now exists, cites `S174` (3 mentions), and the census exits 0.
Flagging it because the lane's own `check-sources.mjs` reported the same E11 at that moment —
it was a transient, and it is resolved now, but a reader replaying mid-session would see it.

## 6. What this seat did **not** establish

- No runtime capability claim of my own: I ran no Chromium, no driver, no counter and no
  battery. Every runtime number in §4 is **recomputed by me from the lane's committed receipt
  file**, not observed by me.
- No publisher authentication, no build-provenance claim (see §1).
- No claim about touch scrolling on any host beyond what the lane's receipt already records.
- No re-judgement of the C1 sibling-matrix claim (adjacency axis) — out of my seat's scope.
- The lane's `check-sources.mjs` still exits 1 on the landed registry, for the **pre-existing**
  S171/S172/S173 duplicate-URL findings; I did not attempt to fix them (they are the open r68
  R5 question) and I did not add a row to make the gate green.

## 7. Files I wrote (all inside my seat directory)

```
.ufo/waves/round-69/w1/R69Scout/report.md                          this file
.ufo/waves/round-69/w1/R69Scout/receipts/fetch-receipt.json        fetch time, digests, line counts, comparisons
.ufo/waves/round-69/w1/R69Scout/receipts/located-quotes.md         the five quotes, line dumps, verbatim checks
.ufo/waves/round-69/w1/R69Scout/receipts/census-validate-after-S174.txt   fleet census output, exit 0
.ufo/waves/round-69/w1/R69Scout/sources/input_handler.cc            my independent decoded copy
.ufo/waves/round-69/w1/R69Scout/sources/input_handler.cc.formatTEXT.b64  my independent transport bytes
.ufo/waves/round-69/w1/R69Scout/sources/Input.pdl                   my independent decoded copy (S173)
.ufo/waves/round-69/w1/R69Scout/SOURCES-draft-A-on-release.md       drafted S174 row, variant A (proposal)
.ufo/waves/round-69/w1/R69Scout/SOURCES-draft-B-180d.md             drafted S174 row, variant B (proposal)
.ufo/waves/round-69/w1/R69Scout/SOURCES-variant-bareurl.md           probe: S174 URL respelled bare → E04
.ufo/waves/round-69/w1/R69Scout/SOURCES-base.md                      base-registry copy used for the gate comparison
```

Nothing was written to `corpus/`, `scripts/`, `PROVINCE.md`, `SCORECARD.md`, `LOG.md`, `SKILL.md`,
or any sibling lane. No git or jj mutation, commit, or push was performed (only read-only
`git show` / `git log` / `git status`). No tool was installed or upgraded this session. Scratch
`/fast/scratch/hyaku/tabi-r69/R69Scout/` was deleted after the receipts were copied in.

## 8. Reproduction commands

```sh
# independent fetch + digest + compare against the lane's staged copy
D=/fast/scratch/hyaku/tabi-r69/R69Scout; mkdir -p "$D"; cd "$D"
curl -sS -f -o ih.b64 "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT"
base64 -d ih.b64 > ih.cc
sha256sum ih.cc
cmp ih.cc /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/sources/input_handler.cc && echo IDENTICAL

# the five quote sites
awk 'NR>=71&&NR<=79||NR==2163||NR>=2167&&NR<=2170||NR>=2190&&NR<=2192||NR>=2239&&NR<=2249 {printf "%d|%s\n",NR,$0}' ih.cc

# S173 re-open, lines 286-315
curl -sS -f -o pdl.b64 "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT"
base64 -d pdl.b64 > pdl
sha256sum pdl /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-68/sources/Input.pdl
diff <(sed -n '286,315p' pdl) <(sed -n '286,315p' /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-68/sources/Input.pdl) && echo UNCHANGED

# gates
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-sources.mjs --root . --file corpus/SOURCES.md ; echo "exit=$?"
cd /home/vgpnk/Projects/shokunin
bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi ; echo "exit=$?"

# the runtime numbers in section 4, recomputed from the committed receipt
python3 - <<'EOF'
import json,collections
d=json.load(open('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json'))
c=collections.Counter(); s=collections.Counter()
for e in d['events']:
    c[(e.get('leg'),e.get('type'))]+=1
    if e.get('type')=='wheel': s[e['leg']]+=e['deltaY']
for k,v in sorted(c.items()): print(k,v)
print('wheel deltaY sums:',dict(s))
EOF
```
