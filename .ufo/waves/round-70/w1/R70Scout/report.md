CONFIRMED

# R70Scout — scoped findings (tabi r70, C1 coverage / S175 source acquisition)

Judged on: **coverage**. Milestone: independently open S175, re-open S173/S174 tap lines, draft S175 row.

Scope note: this seat is read-only over the lane. It fetched the upstream document independently,
quoted the tap lines, re-opened the S173/S174 tap ranges, and drafted an S175 registry row. It
wrote only inside `.ufo/waves/round-70/w1/R70Scout/` and its scratch. No git mutation, no
production/corpus/script edit. The S175 row already existed in `corpus/SOURCES.md` when this seat
started (L1 committed it in `63dcf7c2`); this seat therefore *validated* that row against an
independent upstream fetch and *drafted a candidate replacement* rather than adding a duplicate.

## (1) S175 — independent upstream fetch: byte-identical

Fetched this session, independently of the lane's staged copy:

```
curl -sS -o s175.b64 "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/synthetic_tap_gesture.cc?format=TEXT"
base64 -d s175.b64 > s175_upstream.cc
```

| artifact | bytes | lines | sha256 |
|---|---|---|---|
| fetched base64 transport | 6332 | — | `74bf42c0aaeaeee5428c394badba519ecb7d4d641c86156606aea36a5ceab837` |
| fetched decoded body | 4748 | 134 | `ac27658fe7199e01f210bbfb29613ab99a7720fe8e2ecdb100b1a2d3672bd331` |
| L1-staged `.ufo/waves/round-70/sources/synthetic_tap_gesture.cc` | 4748 | 134 | `ac27658fe7199e01f210bbfb29613ab99a7720fe8e2ecdb100b1a2d3672bd331` |
| committed `.formatTEXT.b64` transport | 6332 | — | `74bf42c0aaeaeee5428c394badba519ecb7d4d641c86156606aea36a5ceab837` |

`diff` of fetched-vs-staged is empty. The **transport** bytes also match the committed `.b64`
byte-for-byte, so the chain upstream → transport → decoded → staged is closed at two independent
links, not one. Access time recorded `2026-11-06T20:34:02Z` (lane local `-03`).
Receipt: `receipt-s175-fetch.json` (same dir).

**Verdict: CONFIRMED.** The staged S175 document is the genuine upstream file at tag
`155.0.8059.84`, and the frozen claims' `sourced` string
(`.ufo/waves/round-70/claims.json` → `C1.sourced`) names the same digest
`ac27658f…7bd331` that I recomputed from a fresh fetch. No substitution, no drift.

Reproduction:

```sh
cd /fast/scratch/hyaku/tabi-r70/R70Scout
sha256sum s175.b64 s175_upstream.cc
diff s175_upstream.cc /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-70/sources/synthetic_tap_gesture.cc
```

## (2) Required quotes, located and verified

All quotes are ≤25 words. Line numbers are of the decoded 134-line body.

### S175 — constructor `kDefaultInput` → `kTouchInput` (lines 22-26)

> L22: `if (params().gesture_source_type ==`
> L23: `    content::mojom::GestureSourceType::kDefaultInput) {`
> L24: `  params().gesture_source_type =`
> L25: `      content::mojom::GestureSourceType::kTouchInput;`

Quote (5 words, L22-L25): *"params().gesture_source_type = content::mojom::GestureSourceType::kTouchInput;"*

This is the mapping the round-70 knowledge note leans on: an omitted `gestureSourceType` is
rewritten to touch **before** the platform query at L41-L43 runs, so the query never sees
`kDefaultInput`. The lesson's `## Gate` records this quote as "lines 24-25, 2 statements" — the
assignment body is at L24-L25 and the enclosing `if` opens at L22; both readings agree on the
text. **Confirmed**, and the claim "default source = touch" is grounded in this file, not inferred.

### S175 — PRESS / `duration_ms == 0` / WAITING_TO_RELEASE release logic

> L92: `    case PRESS:`
> L100: `      if (params().duration_ms == 0) {`
> L101: `        synthetic_pointer_driver_->Release();`
> L106: `        state_ = DONE;`
> L109: `        state_ = WAITING_TO_RELEASE;`
> L112: `    case WAITING_TO_RELEASE:`
> L113: `      if (timestamp - start_time_ >= GetDuration()) {`

Quote A (5 words, L100): *"if (params().duration_ms == 0) {"*
Quote B (7 words, L113): *"if (timestamp - start_time_ >= GetDuration()) {"*
Quote C (3 words, L109): *"state_ = WAITING_TO_RELEASE;"*

Reading of the branch, confirmed against the source: under `PRESS` the pointer is pressed and
dispatched; **if** `duration_ms == 0` the release is dispatched in the same step and the state goes
`DONE`; **otherwise** `start_time_` is latched and the state becomes `WAITING_TO_RELEASE`, and the
release only happens on a later tick once `timestamp - start_time_ >= GetDuration()` where
`GetDuration()` is `Milliseconds(duration_ms)` (L130-L132). So "duration 400 → 400 ms" and
"default duration is 50 ms" (the 50 comes from S174's `kDefaultDuration`, L2265) are both
consistent with this state machine, and the knowledge note's L112-L116 / L99-L106 citation pairs
land on the right lines. **Confirmed.**

### S173 — `Input.pdl` lines 318-330 (staged `.ufo/waves/round-68/sources/Input.pdl`)

> L318: `  experimental command synthesizeTapGesture`
> L324: `      # Duration between touchdown and touchup events in ms (default: 50).`
> L325: `      optional integer duration`
> L326: `      # Number of times to perform the tap (e.g. 2 for double tap, default: 1).`
> L327: `      optional integer tapCount`
> L328: `      # Which type of input events to be generated (default: 'default', which queries the platform`
> L329: `      # for the preferred input type).`
> L330: `      optional GestureSourceType gestureSourceType`

Quote (15 words, L326): *"# Number of times to perform the tap (e.g. 2 for double tap, default: 1)."*
Quote (15 words, L328-L329): *"# Which type of input events to be generated (default: 'default', which queries the platform"*

Two things confirmed here, and they are the pair the lesson rejects on: the PDL's own comment says
"2 for double tap" and its `gestureSourceType` default "queries the platform". The round-70
lesson rejects both for taps, and the rejection is grounded — S175 L22-L26 shows the platform
query is bypassed for tap, so the L328-L329 comment does not describe tap behaviour. The measured
"two `detail:1` clicks, no `dblclick`" and "default leg == touch leg" are consistent with the
source. S173's **anchor cell** covers "decoded lines 286-315" (the scroll command) — the tap
command at L318-L330 sits just past that window, so the tap lines are covered by S173's *used-by*
extension to the round-70 note rather than by S173's own anchor string. That is a scope/anchor
bookkeeping observation, not a source defect; flagging it in §(4).

### S174 — `input_handler.cc` lines 2252-2304 (staged `.ufo/waves/round-69/sources/input_handler.cc`)

`InputHandler::SynthesizeTapGesture` at L2252, signature to L2258:

> L2265: `  const int kDefaultDuration = 50;`
> L2266: `  const int kDefaultTapCount = 1;`

Quote (5 words, L2265): *"const int kDefaultDuration = 50;"*
Quote (5 words, L2266): *"const int kDefaultTapCount = 1;"*

Bounds check and the zero-tap early success:

> L2270: `  if (!PointIsWithinContents(gesture_params.position)) {`
> L2271: `    callback->sendFailure(Response::InvalidParams("Position out of bounds"));`
> L2272: `    return;`
> L2275: `  gesture_params.duration_ms = duration.value_or(kDefaultDuration);`
> L2285: `  int count = tap_count.value_or(kDefaultTapCount);`
> L2286: `  if (!count) {`
> L2287: `    callback->sendSuccess();`
> L2288: `    return;`
> L2289: `  }`

Quote (3 words, L2286): *"if (!count) {"*
Quote (4 words, L2271): *"callback->sendFailure(Response::InvalidParams(\"Position out of bounds\"));"*

One gesture queued per tap:

> L2297: `  TapGestureResponse* response =`
> L2298: `      new TapGestureResponse(std::move(callback), count);`
> L2299: `  for (int i = 0; i < count; i++) {`
> L2300: `    root_view->host()->QueueSyntheticGesture(`
> L2301: `        std::make_unique<SyntheticTapGesture>(gesture_params),`

Quote (10 words, L2299): *"for (int i = 0; i < count; i++) {"*

All four C1 behaviours in the knowledge note are grounded in this file:
`kDefaultDuration = 50` (L2265, matching the 50 ms press→release), `kDefaultTapCount = 1`
(L2266), `count == 0` → `sendSuccess()` with no gesture queued (L2286-L2289, so the "no events,
success" leg), `x:5000` → `-32602 "Position out of bounds"` (L2270-L2272, `PointIsWithinContents`),
and one fresh `SyntheticTapGesture` per tap (L2299-L2304) — the structural reason `tapCount:2`
yields two independent `detail:1` clicks and no `dblclick`. **Confirmed.**

## (3) Duplicate-row check: S175 does NOT duplicate an existing row

`grep synthetic_tap_gesture corpus/SOURCES.md` returned **no matches** before L1's append
(verified independently against the pre-round-70 base `90b9ff04`:
`git show 90b9ff04:corpus/SOURCES.md | grep -c synthetic_tap_gesture` → `0`). S175 registers a
document no row covered, so it is a genuine new row, not a second scope of an existing one.

Cross-check against the two same-file/adjacent rows:

- **S162 / S174** — both `content/browser/devtools/protocol/input_handler.cc`. S162's scope is
  `GetEventModifiers`; S174's is `Input.synthesizeScrollGesture`. S174's scope cell even says
  "same file as S162 (scope there: GetEventModifiers), a second scope". S175 is a **different
  file** (`content/common/input/synthetic_tap_gesture.cc`), so no overlap.
- **S168 / S173** — both the Input domain PDL at the same tag. S168 = mouseWheel delta units;
  S173 = `synthesizeScrollGesture` parameters. S175 is a different document again.

The registry's own duplicate detector agrees with the "no new duplicate" reading at the row level:
`node scripts/check-sources.mjs` reports `duplicate_url` for **S171, S172, S173** — and the
**same three** at the pre-round-70 base `90b9ff04` (reproduced in a scratch root:
`git show 90b9ff04:corpus/SOURCES.md` + gate → identical S171/S172/S173 findings). S175 is not
among them. Those three are pre-existing cross-scope duplicates (S157↔S171 path docs, S167↔S172
cssom-view, S168↔S173 Input.pdl) that the gate flags because the `teaches` cell does not open
with `supersedes S…`; the contract's rule-2 correction route is a superseding row. **Pre-existing,
not introduced by round 70, and not in this seat's scope to fix.**

## (4) Findings

### F1 — S175's row anchor spans do not cover the lines the knowledge note cites (minor, bookkeeping)

The committed S175 `anchor` cell reads "decoded lines 22-26 (kDefaultInput rewritten to
kTouchInput), 51-53 (pointer driver created per gesture), 99-116 (duration 0 releases at once,
else WAITING_TO_RELEASE)". I verified each span against the decoded body:

- L22-L26 — the `kDefaultInput` → `kTouchInput` rewrite. **Exact.**
- L51-L53 — `synthetic_pointer_driver_ = SyntheticPointerDriver::Create(gesture_source_type_,
  params().from_devtools_debugger);` under `if (!synthetic_pointer_driver_)`. **Exact** — and this
  is the per-gesture driver creation that the note's "each gesture creates its own pointer driver"
  sentence rests on.
- L99-L116 — L99 is the `// Release immediately if duration is 0.` comment, L100 the `== 0` test,
  L106 `state_ = DONE;`, L109 `state_ = WAITING_TO_RELEASE;`, L112 `case WAITING_TO_RELEASE:`,
  L113 the `GetDuration()` comparison, L116 the release dispatch. **Exact.**

So the anchor cell is accurate. The gap is narrower and real: the knowledge note cites
"**S175 lines 22-26**" (correct), "**S175 lines 51-53**" (correct) and "**S175 lines 99-106**"
and "**lines 112-116**" (both correct), and the lesson's Gate cites "lines 100, 6 words". The
count "6 words" for `"if (params().duration_ms == 0) {"` is 5 whitespace-delimited words
(`if`, `(params().duration_ms`, `==`, `0)`, `{`) — a word-count slip in the lesson prose, not a
quote error; the quote text itself is verbatim at L100 and is well under the ≤25-word cap. **No
action needed beyond noting it**; the contract requires ≤25, and 5 ≤ 25.

### F2 — S173/S174 anchor strings do not mention the tap ranges their used-by now covers (minor, bookkeeping)

S173's `anchor` names "decoded lines 286–315" and its `scope` says "experimental
synthesizeScrollGesture parameters at this tag only". S174's `anchor` names lines 71-79,
2167-2170, 2190-2191, 2239-2249 and its `scope` says "browser-side handling of
Input.synthesizeScrollGesture". The round-70 note cites Input.pdl:318-330 and
input_handler.cc:2265/2270-2273/2285-2289/2297-2304 — all **outside** those anchor strings, and
S173's scope cell does not mention the tap command at all.

This matters for the contract's own reading: "Tier is scoped to the row's `scope` cell, never
global". A reader who opens S173 by its scope ("synthesizeScrollGesture parameters … only") and
its anchor (L286-315) cannot reach the tap command the round-70 note cites, and the note is now
listed in S173's `used-by`. The **source truth is unaffected** — I re-opened and quoted both files
directly and every cited line resolves exactly (see §(2)); only the registry's pointer cells lag
the widened usage. The lane-legal repair is a superseding row per rule 2 (or an explicit
`supersedes S…` teaching), **not** an in-place scope edit, since rule 2 allows only `status`,
`recheck` and `used-by` to change in place — and L1 correctly changed only `used-by` here.

This is the one thing I would hand L1 as a coverage-axis item: **C1's "sourced" string in the
frozen claims names S173/S174 tap ranges that the committed S173/S174 rows do not themselves
anchor.** The claim is frozen (I must not propose amending a predicate, counter, pin or kill
rule), and I am not proposing one; the observation is that the *registry* is the side that carries
the gap, and a superseding row would close it without touching the frozen claim.

### F3 — S175 `teaches` cell says "each tap is its own gesture"; the source supports "each gesture has its own pointer driver" (wording, no defect)

Committed S175 `teaches`: *"an omitted gestureSourceType makes a touch tap, not a platform query;
each tap is its own gesture with its own press and timed release"*. The second clause is a
**handler** fact (S174 L2299-L2304, one `SyntheticTapGesture` per tap) and a **driver** fact
(S175 L51-L53); S175's own scope cell says "not the DevTools handler (S174)". The claim as
written is true and grounded, but its first half is carried by S174 rather than S175, so a reader
who opens S175 alone gets a claim whose "each tap" half needs the sibling row. Both the row's
scope cell and the lesson flag the S174 boundary explicitly, so this is a wording nicety, not a
false claim. **No change proposed** — the scope cell already states the boundary.

## (5) Drafted S175 registry row (candidate replacement, in the file's 11-column schema)

The row **already exists** in `corpus/SOURCES.md` (L189, committed `63dcf7c2`; validated as
structurally clean below), so adding my draft as a second row would create a duplicate id and a
duplicate URL — both gate errors. Per the contract's append-only rule I therefore deliver it as a
**candidate replacement text** for L1 to apply if it prefers, with no cell containing a pipe:

```
| S175 | Chromium 155.0.8059.84 synthetic tap gesture source — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/synthetic_tap_gesture.cc?format=TEXT | code | A | how one synthetic tap gesture runs at this tag: the kDefaultInput to kTouchInput rewrite in the constructor, the PRESS state, the duration 0 immediate release and the WAITING_TO_RELEASE timed release; not the DevTools handler (S174) and not renderer event delivery | decoded lines 22-26 (kDefaultInput rewritten to kTouchInput), 51-53 (pointer driver created per gesture), 99-116 (duration 0 releases in the same step, otherwise WAITING_TO_RELEASE); .ufo/waves/round-70/sources/synthetic_tap_gesture.cc sha256 ac27658fe7199e01f210bbfb29613ab99a7720fe8e2ecdb100b1a2d3672bd331; fetched 2026-11-06 | an omitted gestureSourceType yields a touch tap rather than a platform query, and one gesture holds one press and one timed release | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md, corpus/lessons/round-70.md |
```

Structural validation of the draft (and of the committed row), by running the lane's own gate
against a scratch root holding the draft in place of the committed S175:

```
cd /fast/scratch/hyaku/tabi-r70/R70Scout/draftroot
node check-sources.mjs --root . --file corpus/SOURCES.md
```

→ `rows=175 … findings=5`, and the five findings are **S143/S160 `used_by_missing`** (scratch-root
artifacts: those rows point at `.ufo/waves/round-37/…` and `.ufo/waves/round-49/…`, which exist in
the lane but were not copied into the scratch root) plus the **pre-existing S171/S172/S173
`duplicate_url`** set. **The draft adds no new finding of its own.** The same command in the real
lane root gives `findings=3` — exactly the three pre-existing `duplicate_url` rows — identical to
the pre-round-70 base `90b9ff04` (`findings=3`, same three rows). So round 70's registry edit is
**finding-neutral**: S175 introduces no duplicate id, no duplicate URL, no malformed row, no tier
inflation, no bare anchor, and every `used-by` path resolves with the row id present in the
cited file.

Also confirmed for the committed S175 row: 13 pipe-split fields (11 columns), no `|` inside any
cell, `kind=code` (valid), `tier=A` (valid, and not `community`), `status=mined`, `opened`
`2026-11-06` (ISO), `recheck=on-release` (valid), `used-by` paths both exist and both cite
`S175` (knowledge note ×4, lesson ×4).

Reproduction of the whole comparison:

```sh
cd /fast/scratch/hyaku/tabi-r70/R70Scout
# base (pre-round-70) registry, correct scratch root
cd truebase && node check-sources.mjs --root . --file corpus/SOURCES.md   # findings=3: S171,S172,S173 duplicate_url
# candidate S175 draft
cd ../draftroot && node check-sources.mjs --root . --file corpus/SOURCES.md # findings=5: +S143/S160 scratch artifacts
# live lane
cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-sources.mjs  # findings=3: S171,S172,S173
```

The fleet census agrees: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
--root /home/vgpnk/Projects/shokunin tabi` exits **0** with `tabi ok …/corpus/SOURCES.md`, listing
S175 under no warning (the W04 duplicate-url warnings it prints are the same pre-existing set).

## (6) What I did not establish

- I did not re-run any browser, driver, counter or verifier for this seat's assignment — none was
  assigned here, and every runtime claim in §(2) is quoted from source rather than measured.
- I did not open the upstream `Input.pdl` or `input_handler.cc` at this tag; I re-opened the
  **staged** copies the lane pinned (`sha256 5bbc6e23…66e3d` and `72cf0d1d…324f4`), whose digests
  I recomputed and confirmed against the rows' anchor cells. Whether the staged copies still match
  upstream is a freshness question for the owning seat, not a coverage question, and I did not
  fetch those two.
- I did not verify the C1 runtime receipt, the battery, or the live verifier's exit codes.
- I did not modify `corpus/SOURCES.md`, `corpus/lessons/round-70.md`, or any script.

## Evidence index

| artifact | path |
|---|---|
| this report | `.ufo/waves/round-70/w1/R70Scout/report.md` |
| fetch receipt (digests, times, equality flags) | `.ufo/waves/round-70/w1/R70Scout/receipt-s175-fetch.json` |
| fetched base64 transport | `.ufo/waves/round-70/w1/R70Scout/s175-upstream.formatTEXT.b64` |
| fetched decoded body | `.ufo/waves/round-70/w1/R70Scout/s175-upstream.cc` |
| gate scratch roots (base / candidate draft) | `.ufo/waves/round-70/w1/R70Scout/truebase/`, `…/draftroot/` |

Scratch `/fast/scratch/hyaku/tabi-r70/R70Scout/` was removed after the receipts above were copied
into this wave directory.
