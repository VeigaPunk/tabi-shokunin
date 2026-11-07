FINDINGS

**Verdict: adjacent — overlap none on the r73 ground.** No sibling lane carries any of
S180–S183's four Blink source files, either page-scale symbol (`InputEventsScaleFactor`,
`DeltaYInRootFrame`), or any synthesized-pinch / touchpad-pinch reference — 11 of the 13
scanned patterns return **zero** across all 20 sibling lanes at pinned heads. What remains is
same-substrate (the host's own Chromium 155.0.8059.84 build), same-transport (CDP
session/profile — a *pre-existing* contested surface that is not this ground), and word-level
(`visualViewport` in app JS, `wheel` in compositor binds, camera `zoom` in engines).

Seat: R73Connector (leaf, no dispatch). Read-only over the 20 sibling lanes and over tabi.
Writes: this report, `.ufo/waves/round-73/w1/R73Connector.md`, and receipts under
`.ufo/waves/round-73/w1/R73Connector/`. No git/jj mutation, no tool installed, no host
sysctl/service touched. Scratch `/fast/scratch/hyaku/tabi-r73/R73Connector` removed before
yield (`trap` on exit).

Lane state read: tabi HEAD `c44fcf6f11fe549e8585e073e1cfad66dc2e2cbb` (2026-11-06 22:23:41
-0300, the scored-run commit), i.e. after D `3409ab53`; `git -C tabi-shokunin status
--porcelain` shows only other seats' in-flight files (M SKILL.md, M corpus/QUALITY.md,
untracked w1 dispatch/spec) — none written by this seat.

---

## 1. Ground, pins, method

The r73 ground is S180–S183's subject matter, not a keyword list: the Blink path from a native
wheel to a DOM `deltaY` divided by the visual-viewport page scale
(`web_mouse_wheel_event.cc` → `wheel_event.cc` → `web_input_event_conversion.cc` →
`local_frame_view.cc`), plus the CDP command whose delivery that law describes
(`Input.synthesizePinchGesture`) and `ctrl+wheel` zoom.

Sibling heads were pinned **before** the scans (`sibling-heads.tsv`, written
2026-11-06 22:31:03 -0300) and every search ran at that SHA, never at `HEAD`, so a sibling
committing mid-round cannot move the evidence under the table:

```
for l in <20 lanes>; do printf '%s\t%s\t%s\n' "$l" "$(git -C "$l" rev-parse HEAD)" \
  "$(git -C "$l" log -1 --format=%ci)"; done > sibling-heads.tsv    # exit 0
```

Two independent scans:

| scan | command | result |
|---|---|---|
| pinned, 13 patterns × 20 lanes | `bash R73Connector/scan-pinned.sh` (`git grep` at the pinned SHA, `:(exclude)*node_modules*`) | exit 0; **108** hit lines; `pinned-hits.tsv` (368 lines) |
| full-tree, 8 core patterns | `bash R73Connector/exits.sh` (`grep -rl --binary-files=without-match` over whole lanes) | every pattern **exit 1** (no match); `exits.txt` |
| registry URL census | `python3 R73Connector/dup-url-scan.py` | exit 0; `dup-url-scan.txt` |
| fleet validator | `bash scripts/sources-census.sh validate --root … tabi --today 2026-11-06` | exit **0**, one summary line `tabi ok`, 25 `W04`, **0** `E**` |

Per-pattern totals at pinned heads (`awk -F'\t' '$1!="HIT"{t[$1]+=$4} …' pinned-hits.tsv`):

| pattern | lines | pattern | lines |
|---|---|---|---|
| `web_mouse_wheel_event` | **0** | `synthesizePinchGesture` | **0** |
| `web_input_event_conversion` | **0** | `PinchGesture` | **0** |
| `local_frame_view` | **0** | `touchpad_pinch\|TouchpadPinch` | **0** |
| `wheel_event\.cc` | **0** | `setPageScaleFactor\|pageScaleFactor` | **0** |
| `InputEventsScaleFactor` | **0** | `ctrl\+wheel\|ctrlKey…wheel\|wheel…ctrlKey` | **0** |
| `DeltaYInRootFrame` | **0** | `third_party/blink` | 35 |
| `visualViewport` | 73 | | |

13 of 20 lanes are clean under every pattern; the 7 that hit are chousa, kake, kasegi, kotoba,
kumitate, mado, revenger, and none of their hits is a source row on this ground (§2).

---

## 2. Hits

`@` = the pinned SHA in `sibling-heads.tsv`. "Contested?" is asked against
`tabi-shokunin/PROVINCE.md:3-13` (browser & web-interaction craft; CDP session discipline).
"Dup risk" is asked for S180–S183 under the census duplicate-URL class (§3).

| # | lane | path:line @ pinned head | quote (≤25 words) | contested vs tabi province? | dup-URL risk for S180–S183 |
|---|---|---|---|---|---|
| 1 | kengaku | `.ufo/waves/round-79/w1/RosterScoutR79.md:20-21` | `ChromeDriver 155.0.8059.84 …` / `Chromium 155.0.8059.84 Arch Linux` — `driver and browser builds match exactly` | no — LLM-eval runtime inventory, not interaction evidence | none (no Blink URL) |
| 2 | kasegi | `.ufo/waves/round-70/w1/ScoutS105.md:6` | `host chromium 155.0.8059.84 (/usr/bin/chromium), node v24.21.0` | no — bounty-task substrate line | none |
| 3 | tsukuroi | `.ufo/waves/round-24/w2/RevP1Pending/p1-recompute.json:344` | `"target": "155.0.8059.84-1"` | no — pacman package pin | none |
| 4 | revenger | `corpus/SOURCES.md:314` (S299) and `:513` (S496) | `Chrome DevTools Protocol (index / scope statement) — https://chromedevtools.github.io/devtools-protocol/` | **province-level, pre-existing**: `PROVINCE.md:3-8` claims `browser/Electron runtime evidence` | **none for S180–S183**; this is the S002/S299/S496 *CDP-index* collision, already routed r92 |
| 5 | kaidoku | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222, xvfb-run electron --remote-debugging-port=9223` | **contested on CDP transport**, not on input: `Input.dispatch*\|Input.synthesize*` in `kaidoku/corpus` = 0 hits | none |
| 6 | kake | `PROVINCE.md:40` | `tabi drives browsers and owns client-side crawler discipline; kake owns publisher-side placement` | no — concedes the browser side | none |
| 7 | kake | `PROVINCE.md:45` | `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` | **contested (profile/session)** — pre-existing, not this ground | none |
| 8 | kagi | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — contested with kake` | **contested (profile/session)** — same pre-existing class | none |
| 9 | chousa | `.ufo/waves/round-53/w1/R53ConnSiblings.md:39` | `tabi: only …/third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc:680,699 (C++ code comment)` | no — inbound citation of *tabi's own* r29 release-pin bytes | none — and note the near-miss file: `local_frame_mojo_handler.cc` ≠ `local_frame_view.cc` |
| 10 | kake | `.ufo/waves/round-88/w1/ConnectorScope.md:40-41` | `tabi-shokunin/corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/third_party/blink/public/mojom/frame/frame.mojom:1211` | no — inbound echo of tabi paths | none |
| 11 | kake | `.ufo/waves/round-92/w1/ConnectorScope/receipts/query-stale.txt:770` (and `query-422.txt:170`) | `tabi-shokunin/corpus/SOURCES.md:129: \| S115 \| Chromium 156 form …` | no — grep receipt echoing a tabi registry row | none |
| 12 | kumitate | `.ufo/waves/round-90/K90Connector/hits-A-pattern.txt:147-148` (also `hits-F-u-codepoints-siblings.txt:23-24`) | `tabi-shokunin/corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/third_party/blink/…` | no — inbound connector receipt | none |
| 13 | kotoba | `.ufo/waves/round-71/receipts/census-after.txt:251-259` | `tabi W04 S074 duplicate url …runtime_enabled_features.json5 across scopes` | no — census receipt quoting tabi's own W04 warnings | none |
| 14 | mado | `.ufo/waves/round-44/w2/RerunCensus/census-fleet.txt:270-280` | `tabi W04 S114 duplicate url …156.0.8078.47/third_party/blink/…` | no — same class as #13 | none |
| 15 | revenger | `.ufo/waves/round-93/w1/ReviewerBlind/S496.body:149,175,326,338` (3 dup copies under `report(s)/round-93/…`) | `href="https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/public/devtools_pr…` | no — fetched CDP page body, `HEAD`-branch links to the *devtools protocol* dir | none (untagged, not a row, not input) |
| 16 | kasegi | `.ufo/waves/round-28/wave1/ScribeLessonGate/S068.body:198` (dup `.ufo/waves/round-30/wave1/fetch/s068.html:198`) | `avoid visualViewport alone — it can disagree with layout width during resize on some browsers` | no — third-party app JS in a bounty target, layout not page scale | none |
| 17 | kotoba | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt:2398820` (70 lines total: 34 here, 36 in the r82 twin `Kb82E12Loader-omp-18.14.0-strings.txt`) | `const initialScale = positiveNumber(readValue(visualViewportObject, "scale", 1), 1);` | no — harness string blob: a JS shim patching `visualViewport` getters | none |
| 18 | game-dev-3d | `corpus/fixtures/r94vendor/three.core.js:13699` | `this._hand.inputState = { pinching: false };` | no — three.js XR hand pinch state | none |
| 19 | game-dev-2d | `reports/round-85/r85-boundary.md:194` | `ERROR: Zoom level must be different from 0 (can be negative).` | no — Godot `Camera2D.set_zoom` refusal | none |
| 20 | mado | `corpus/knowledge/keybind-rule-semantics.md:109` | `\| Wheel \| mouse_up, mouse_down (tiling-v2.conf:95,96,121,122) \|` | no — Hyprland workspace binds | none |
| 21 | kagi | `.ufo/waves/round-28/retained-probes/SrcNodeSemver/node_modules/uglify-js/tools/domprops.json:4166` | `"deltaY",` | no — uglify-js DOM property list | none |
| 22 | kengaku | `corpus/evidence/round53/fetched/C1PriceScoutD-row-…arxiv-2608.23616v3.html:3621` | `six/nineteen-forbidden-page scales of Section 4.5` | no — paper prose ("page scales" of a document) | none |
| 23 | kake | `corpus/SOURCES.md:303` | `Chromium speed metrics changelog — https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/README.md` | no — publisher perf metrics, `main` branch docs | none (different tree; not tagged, not Blink input) |

Rows 9–15 are all **inbound** (a sibling recording tabi's own bytes or rows); rows 16–23 are
word-level only. No row is a sibling *source row* about wheel-delta, page scale, or synthesized
pinch.

---

## 3. Duplicate-URL risk for S180–S183 (sources-census W04)

**None — measured three ways.**

1. *Inside tabi.* Each of the four URLs appears exactly once in `tabi-shokunin/corpus/SOURCES.md`
   (`grep -c "refs/tags/155.0.8059.84/.*<file>"` → `1` for `web_mouse_wheel_event.cc`,
   `web_input_event_conversion.cc`, `local_frame_view.cc`; `2` for `wheel_event.cc`, because
   `web_mouse_wheel_event.cc` contains that string — both are tabi's own r73 rows, `exits.txt`).
   The registry holds 180 URL-bearing rows / 146 unique URLs / **27** URL groups with >1 row, and
   the fleet validator reports **25 W04** (scope-sensitive: a same-scope repeat carrying
   `supersedes S###` is silent by design — e.g. S004→S028, S039→S040, S128→S133) with **0 E04**
   and exit **0**. The most recent 155-tag W04 is **S173** (`Input.pdl`, duplicating S168); none
   of the 25 names S180–S183 (`dup-url-scan.txt`, `survey.txt`).
2. *Across lanes, by URL.* 33 tabi URLs are shared with siblings; **0** contain
   `third_party/blink`; **0** is an S180–S183 URL (all four print `cross_lane_dups=none`).
   The shared 33 are generic tooling/docs — git-scm man pages, `proc_pid_environ(5)`, RFC 9110,
   RFC 9309, NIST FIPS 180-4, JSON Schema, node docs, and the one browser-domain hit, tabi
   **S002** (CDP index) == revenger **S299**/**S496** (`dup-url-scan.txt`).
3. *Whole-tree, not just rows.* `grep -rl 'chromium.googlesource.com' <20 lanes>` hits only
   kake (36 files, all the `main`-branch speed-metrics changelog), revenger (the fetched CDP
   page body), plus mado/kotoba **census receipts that quote tabi's own W04 lines**. No sibling
   ever fetched or registered a `refs/tags/155.0.8059.84/third_party/blink/...` URL.

Second-order caveat worth carrying: **the census compares URLs only within one registry.**
`scripts/sources-census.sh:580` runs one `gawk -F'|' -v lane="$lane"` per lane over that lane's
own file, so `seen`/`url_seen`/`url_scopes` reset per lane — cross-lane URL duplication is
*structurally invisible* to E03/E04/W04. "No W04 for S180–S183" is therefore the weaker
statement; the stronger one (33 shared URLs, 0 Blink, 0 of the four) is what I measured directly.

---

## 4. Where the contested surface actually is

The live contested scope touching tabi is **CDP session/profile custody**, not input semantics:
`kake/PROVINCE.md:45` and `kagi/PROVINCE.md:64` both declare the the-musketeer profile lease
contested (kagi/tabi/kake), `kake/PROVINCE.md:40` concedes browser-driving to tabi, and
`kaidoku/PROVINCE.md:55` claims self-launched CDP targets. All four are pre-existing and outside
the r73 ground: no sibling corpus contains a single `Input.dispatch*`/`Input.synthesize*` call
(`grep -rln --include='*.mjs' --include='*.js' --include='*.py' -E 'Input\.(dispatch|synthesize)[A-Za-z]*'
*/scripts */corpus` → tabi files only), and no sibling script launches CDP
(`grep -rln -- '--remote-debugging-port' */scripts` → tabi files only).

Id reuse, not a collision: rows **S180–S183 also exist in 8 sibling registries** with unrelated
content (chousa round-72 spot-check / r72 count receipt, kama, kengaku TB2 README, kotodama,
mado, mori, revenger, tsukuroi; `exits.txt` last block). Per `kasegi/.ufo/waves/round-73/w1/
K73ConnectSiblings.md:74-76` the fleet convention is that each lane's registry is its own and
sibling ids "are sibling-owned and report only"; E03 is per-lane, so nothing can fire. The risk
is documentary: a future fleet scan keyed on id alone (as kake's r92 grep receipts already
echo chousa's S180/S181 next to tabi's) would false-positive.

---

## 5. Bounded move (one)

Nothing to integrate, and no instrument change is proposed. The one move worth carrying into the
r73 knowledge note (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md`) is a
three-clause **adjacency footnote**, because it costs one line and closes a re-derivation:

1. S180–S183 are non-duplicative under W04 (25 pre-existing warnings at tabi HEAD `c44fcf6f`,
   none S18x, validator exit 0) *and* non-overlapping cross-lane (0 sibling registries cite a
   `refs/tags/155.0.8059.84/third_party/blink/...` URL);
2. the census is per-lane, so that cross-lane result was measured directly, not inferred from
   the absence of a warning;
3. sibling ids S180–S183 are reused by 8 lanes for unrelated rows — key on `(lane, id)`.

Affected axis: **adjacency** (the axis this seat is judged on), secondarily **depth** (the note
gains a checkable provenance boundary). No other axis moves; no predicate, counter, pin or kill
rule is touched. Risk: a note line can rot if the fleet census later gains a cross-lane mode —
mitigated by citing the two receipts rather than asserting a rule.

---

## 6. Verification actually run

| # | command | exit | artefact |
|---|---|---|---|
| 1 | `git -C <lane> rev-parse HEAD` ×20 → `sibling-heads.tsv` | 0 | `sibling-heads.tsv` |
| 2 | `bash R73Connector/scan-pinned.sh` | 0 | `pinned-hits.tsv` (108 hits) |
| 3 | `bash R73Connector/exits.sh` | 0 | `exits.txt` (8× exit 1) |
| 4 | `python3 R73Connector/dup-url-scan.py` | 0 | `dup-url-scan.txt` |
| 5 | `bash scripts/sources-census.sh validate --root … tabi --today 2026-11-06` | 0 | `survey.txt` (25 W04, `tabi ok`) |
| 6 | `grep -rl 'chromium.googlesource.com' <20 lanes>` | 0 | inline §3.3 |
| 7 | `grep -rln -E 'Input\.(dispatch\|synthesize)[A-Za-z]*' */scripts */corpus` | 0 | tabi files only |
| 8 | `grep -rln -- '--remote-debugging-port' */scripts` | 0 | tabi files only |

Unrun = not passed: nothing in this report rests on an unrun command; every "zero" is an exit-1
grep or an explicit 0-count in a receipt.
