# R64Scout — round 64, wave w1: sources opened for the wheel/scroll + CDP Input domain

Seat: **R64Scout** (scout, round 64, wave w1). Lane: `tabi`.
Scope of this seat: open and stage the sources the round-64 claim cites or should cite,
give a located quote (<=25 words) with byte offset for each, name what each source
grounds and what it does NOT ground, and run the registry collision check.

Deliverables (all under this seat's paths):

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/w1/R64Scout.md` — this report
- `.../w1/R64Scout/staged/*.html|json|pdl` — 10 staged source files (raw fetched bytes)
- `.../w1/R64Scout/quotes.json` — 21 quotes, each with `byte_offset`, `staged_path`, `staged_sha256`, `verbatim_verified`
- `.../w1/R64Scout/collision-check.txt` — the collision-check transcript (registry census + empirical gate runs + byte-identity checks)

No tool was installed or upgraded this session (no new tool was needed; `curl`, `node`,
`python3`, `git`, `diff`, `sha256sum` were already present), so the operator tooling
directive of 2026-10-19 records nothing this seat.

---

## 1. Candidate table — sources opened, located quotes, grounds / rejects

Every quote below was located by **byte offset in the staged bytes** of the file named
in its row (offsets are in `quotes.json` with the same ids). Every quote is <=25 words.

| # | Candidate | URL | Anchor / section | Located quote (verbatim) | Words | Byte offset | Grounds / rejects |
|---|---|---|---|---|---|---|---|
| Q01 | MDN WheelEvent | https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent | §Instance properties — `WheelEvent.deltaY` (`dt#wheelevent.deltay`) | `Returns a <code>double</code> representing the vertical scroll amount.` | 8 | 94942 | **Grounds:** `deltaY` carries a double vertical scroll amount, so the receipt may *record* `e.deltaY` rather than infer a scroll quantity. **Rejects:** does NOT ground `deltaMode 0` = pixels (the constants are on the sub-page, Q03); does NOT ground cross-build pixel identity, `isTrusted`, `cancelable` or the scroll arithmetic — this file contains **zero** occurrences of `isTrusted` and `cancelable` and **zero** of `DOM_DELTA_PIXEL`. |
| Q02 | MDN WheelEvent | https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent | §Instance properties — `WheelEvent.deltaMode` (`dt#wheelevent.deltamode`) | `Returns an <code>unsigned long</code> representing the unit of the <code>delta*</code> values' scroll amount.` | 13 | 95549 | **Grounds:** `deltaMode` names the *unit* of the `delta*` values, so the receipt records a unit-bearing field. **Rejects:** does NOT ground the numeric value 0 = pixel (no `DOM_DELTA_*` constant on this page); does NOT ground cross-build stability. |
| Q03 | MDN WheelEvent — `deltaMode` sub-page | https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode | §Permitted values table — `DOM_DELTA_PIXEL` row | `The delta values are specified in pixels.` | 7 | 88469 | **Grounds:** `DOM_DELTA_PIXEL` (0x00) is the pixel unit, so `deltaMode 0` in the receipt is the *documented* pixel unit, not an inference. **Rejects:** does NOT ground that **this** Chromium build reports 0 — the receipt still has to measure it; does NOT ground cross-build stability. |
| Q04 | MDN WheelEvent — `deltaMode` sub-page | https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode | §Permitted values table, note after the table | `Do not assume that those values are specified in pixels.` | 10 | 88956 | **Grounds:** the documentation itself forbids assuming the pixel unit, which supports the receipt *measuring* `deltaMode` rather than assuming it. **Rejects:** a caution to the reader, not a behaviour claim about any browser. |
| Q05 | Chrome DevTools Protocol — Input domain (`tot`) | https://chromedevtools.github.io/devtools-protocol/tot/Input/ | `noscript` static member index — `Input.dispatchMouseEvent` link | `Input.dispatchMouseEvent` | 1 | 958 | **Grounds:** the Input domain of the live protocol viewer exposes a `dispatchMouseEvent` command — this is the URL the r64 frontier names. **Rejects (REJECTED as a semantic source):** the served HTML is a **2 349-byte JavaScript redirect stub** whose only text is the redirect script plus the `noscript` member list; it contains **zero** occurrences of `Dispatches a mouse event` and **zero** of `deltaY`. It grounds the command **name** only — never the parameter semantics, never the delta unit, never any pixel identity. |
| Q06 | Chrome DevTools Protocol — Page domain (`tot`) | https://chromedevtools.github.io/devtools-protocol/tot/Page/ | `noscript` static member index — `Page.captureScreenshot` link | `Page.captureScreenshot` | 1 | 913 | **Grounds:** the Page domain exposes a `captureScreenshot` command. **Rejects (REJECTED as a semantic source):** same redirect-stub shape (14 155 B); **zero** occurrences of `Capture page screenshot`. Grounds the command **name** only — not the png default, not the viewport bound, not any image determinism. |
| Q07 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §6.1 Element Scrolling Members — `Element.scrollTop` getter (`id=dom-element-scrolltop`) | `attribute, on getting, must return the result of running these steps:` | 11 | 344881 | **Grounds:** `scrollTop` is a spec-defined getter whose steps compute the element scroll position, so a scroll-position witness is an attribute-class witness. **Rejects:** does NOT ground the exact accessor the page used, the scroll **arithmetic** (how far one delta scrolls), smooth-vs-instant behaviour, cancelation, or event semantics; CSSOM View contains **zero** occurrences of `WheelEvent` and **zero** of `deltaMode` — it cannot ground the wheel event record at all. |
| Q08 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §13.2 Scrolling (`id=scrolling-events`) — viewport scroll dispatch rule | `gets scrolled (whether in response to user interaction or by an API), the user agent must run these steps:` | 19 | 540667 | **Grounds:** a viewport scroll queues a per-Document pending scroll event, so `pageState.scrollEvents` in the receipt names a spec-defined event class. **Rejects:** does NOT ground how many scroll events one wheel produces, nor that a `preventDefault`-ed (swallowed) wheel produces none — that is the *measured* pairing of the swallowed and released legs. |
| Q09 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §13.2 Scrolling (`id=scrolling-events`) — pending scroll events list | `pending scroll events` | 3 | 540160 | **Grounds:** the scroll-event bookkeeping is a named spec list, so the receipt's `scrollEvents` names a spec-defined quantity. **Rejects:** does NOT ground the measured count 4, nor the coalescing semantics. |
| Q10 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §3.1 Scrolling (`id=scrolling`) — coordinated viewport scroll | `must perform a coordinated viewport scroll by following these steps:` | 10 | 92801 | **Grounds:** viewport scrolling is a coordinated, defined operation — the spec class the r64 band-position witness measures. **Rejects:** does NOT ground the 120 px band geometry, the instant-vs-smooth choice the lane forces with `--disable-smooth-scrolling`, nor the settle loop. |
| Q11 | CDP `browser_protocol.json` @master | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | `domains[Input].commands[dispatchMouseEvent].parameters[deltaY].description` | `Y delta in CSS pixels for mouse wheel event (default: 0).` | 11 | 659847 | **Grounds:** the CDP wheel delta is expressed in **CSS pixels**, so the fixture's 120 px bands and the dispatched `deltaY` share one unit. **Rejects:** does NOT ground how far the page scrolls for that delta, nor that a listener may cancel it, nor that two captures are byte-identical. *Master is a moving target:* two fetches this session were byte-identical (`cb4b0a40…`), but the held S153 row records a **different** digest (`d6737c31…`, 1 423 170 B) for the same URL. |
| Q12 | CDP `browser_protocol.json` @master | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | `domains[Page].commands[captureScreenshot].parameters[captureBeyondViewport].description` | `Capture the screenshot beyond the viewport. Defaults to false.` | 9 | 1081550 | **Grounds:** the screenshot bound is a documented viewport-only default, so the receipt shot dimensions (1280x900) are the documented default surface. **Rejects:** does NOT ground PNG byte determinism across runs, nor that band colours encode scroll position — those are the measured, live-verified facts of the r64 generation. |
| Q13 | CDP `browser_protocol.json` @master | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | `domains[Page].commands[captureScreenshot].description` | `Capture page screenshot.` | 3 | 1079942 | **Grounds:** names the Page-domain capture command the driver issues. **Rejects:** does NOT ground that the capture reflects *this* run — the nonce-in-pixels binding is the lane's own device, not the protocol's. |
| Q14 | Chromium 155 Input domain PDL | https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl | `command dispatchMouseEvent` | `Dispatches a mouse event to the page.` | 7 | 6668 | **Grounds:** at the **measured** build tag 155.0.8059.84 the Input domain dispatches a mouse event to the page — build-scoped, unlike the master JSON. **Rejects:** does NOT ground cross-build stability (one tag only) nor the scroll arithmetic. |
| Q15 | Chromium 155 Input domain PDL | https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl | `command dispatchMouseEvent`, parameter `deltaY` | `Y delta in CSS pixels for mouse wheel event (default: 0).` | 11 | 8752 | **Grounds:** build-scoped statement of the wheel delta unit at the exact tag the receipt names. **Rejects:** does NOT ground scroll distance, cancelation, or determinism. **Caveat:** the decoded bytes are **byte-identical** to the 154.0.8037.97 `Input.pdl` (sha `5bbc6e23…`) — this domain file did not change between the two tags, so it does NOT establish build-specificity by itself. |
| Q16 | Chromium 155 Browser domain PDL | https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Browser.pdl | `command getVersion` | `Returns version information.` | 3 | 7146 | **Grounds:** `Browser.getVersion` returns version information at the measured tag — the contract the r64 receipt's `cdpProduct` field rests on. **Rejects:** does NOT ground that the CDP identity matches the CLI `--version` banner (the lane compares them itself) nor that the build is unbranded Chromium rather than branded Chrome. **This is a coverage gap in the lane's registry:** no row holds any Browser-domain source (`grep -c getVersion corpus/SOURCES.md` -> 0 hits). |
| Q17 | Chromium 155 Page domain PDL | https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl | `command captureScreenshot` | `Capture page screenshot.` | 3 | 17918 | **Grounds:** build-scoped Page capture command at the measured tag. **Rejects:** does NOT ground determinism. **Caveat:** the decoded bytes are **byte-identical** to the already-held S105 (154.0.8037.97 `Page.pdl`, sha `e944a3b1…`) — a new row for this tag would be the *same content* under a new URL, i.e. a same-content duplicate, not a distinct source. |
| Q18 | Chromium 155 Page domain PDL | https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Page.pdl | `command captureScreenshot`, parameter `captureBeyondViewport` | `Capture the screenshot beyond the viewport. Defaults to false.` | 9 | 18424 | **Grounds:** build-scoped viewport-only screenshot default. **Rejects:** same-byte caveat as Q17. |
| Q19 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §4 Extensions to the Window Interface — `Window.scrollY` attribute (`id=dom-window-scrolly`) | `attribute must return the y-coordinate,` | 5 | 151596 | **Grounds (and a correction to r63):** `window.scrollY` is **itself** a spec-defined Window attribute in the same draft, so the page's actual accessor is anchored by the same source that anchors `Element.scrollTop` — the r63 note said the spec anchored only the attribute class, not the exact accessor used. **Rejects:** does NOT ground the value 120/240, nor the arithmetic, nor that a wheel produced it — it is a definition, not a measurement. |
| Q20 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §3.1 Scrolling (`id=scrolling`) — smooth scroll definition | `in a user-agent-defined fashion over a user-agent-defined amount of time` | 10 | 101321 | **Grounds:** a smooth scroll updates the scroll position over a **user-agent-defined duration**, which is exactly the variable the lane pins off with `--disable-smooth-scrolling`; the spec names what that flag removes. **Rejects:** does NOT ground the instant-scroll result the lane measures, nor how long any build takes. It states the variability the lane removes, not the value. |
| Q21 | CSSOM View | https://drafts.csswg.org/cssom-view/ | §3.1 Scrolling (`id=scrolling`) — scrollend emission | `If the scroll position changed as a result of this call, emit the` | 10 | 91167 | **Grounds:** the `scrollend` event is emitted only when the scroll position actually changed — the spec statement of the invariant the lane's `swallowed` vs `released` leg pair probes (a swallowed wheel changes nothing, so no `scrollend`). **Rejects:** does NOT ground Chromium's `scrollend` support (r63 declares `scrollend` out of scope); it is the spec rule, not an implementation observation. |

### 1a. Named rejections (what each source class cannot be used for)

1. **A property-semantics page cannot ground cross-build pixel identity.** Q01/Q02 ground
   `deltaY`/`deltaMode` *meanings*. They say nothing about whether a Chromium 155 build
   renders the same pixels as a Chromium 154 build; the staged MDN file contains no
   `isTrusted`, no `cancelable`, and no `DOM_DELTA_PIXEL`. Cross-build identity is a
   measurement, and r63 §8 already records it as an open limit.
2. **A command-index page cannot ground command semantics.** Q05/Q06 are the `tot/Input/`
   and `tot/Page/` URLs the r64 frontier names, but the viewer serves them as **redirect
   stubs**: the member list only. Every semantic ground for the wheel dispatch and the
   screenshot bound comes from the JSON/PDL rows (Q11-Q18), not from these two URLs.
3. **A CSSOM View page cannot ground the wheel event record.** Q07-Q10, Q19-Q21 ground
   the *scroll* half (scroll position, scroll events, scrollend, smooth-vs-instant) and
   are silent on `WheelEvent`/`deltaMode` entirely (zero occurrences of both). The wheel
   record's semantics come from MDN + the CDP Input domain; the scroll-position witness
   comes from CSSOM View. The two halves of the r64 receipt need different sources.
4. **A build-tagged PDL does not by itself establish build-specificity.** Q15 and Q17
   carry the 155.0.8059.84 tag, but both decoded files are byte-identical to their
   154.0.8037.97 counterparts. A tag-pinned URL is evidence of *what that tag says*,
   not evidence that the tag differs.
5. **A protocol definition cannot ground that a capture reflects a run.** Q12/Q13/Q17/Q18
   describe a command's parameters. The r64 nonce-in-pixels binding, the 120 px band
   colours, and the per-leg witness strip are the lane's own devices; only the live
   verifier can demonstrate them.

---

## 2. Registry collision check

Full transcript: `.../w1/R64Scout/collision-check.txt`.

**Registry census (gate-exact parse of `corpus/SOURCES.md`): 167 rows, `S001`..`S167`.**
All 167 ids are distinct and present exactly once (`grep -oE '^\| S[0-9]{3,}' | sort -u | wc -l`
-> 167). Note: `S159` and `S160` appear **swapped in file order** (line 173 = `S160`,
line 174 = `S159`); this is a presentational artefact only — no duplicate id, so no E03.

**URL normalization** is the gate's own `normalizeUrl` (`scripts/check-sources.mjs:180-187`):
first `https?://` match in cell 2, strip fragment, strip one trailing slash, strip scheme,
strip leading `www.`, lowercase host only.

| Candidate | URL | Normalized URL held? | Verdict |
|---|---|---|---|
| C1 | MDN WheelEvent | **HELD by S166** (same normalized URL) | **E04 `duplicate_url`** unless `teaches` begins `supersedes S166` |
| C2 | `tot/Input/` | FREE | new row admissible; host-prefix sibling S002 (`chromedevtools.github.io/devtools-protocol`) |
| C3 | `tot/Page/` | FREE | new row admissible; host-prefix sibling S002 |
| C4 | CSSOM View | **HELD by S167** | **E04 `duplicate_url`** unless `teaches` begins `supersedes S167` |
| C5 | CDP `browser_protocol.json` @master | **HELD by S153** | **E04 `duplicate_url`** unless `teaches` begins `supersedes S153` |
| C6 | Chromium 155 `Input.pdl` | FREE | new row admissible (no prefix sibling) |
| C7 | Chromium 155 `Page.pdl` | FREE (URL) | **but same content as S105** -> same-content duplicate (W04), not a distinct source |
| C8 | Chromium 155 `Browser.pdl` | FREE | new row admissible; **fills a real gap** (no Browser-domain row exists) |
| C9 | CDP viewer `data/tot.json` | FREE | new row admissible; host-prefix sibling S002 |

**Empirical confirmation** (gate run in a scratch copy of the lane corpus at
`/fast/scratch/hyaku/tabi-r64/R64Scout/collide`, unmodified copy verdict `clean rows=167
findings=0`):

- append C1 as a plain new row -> `FINDING id=duplicate_url fleet=E04 row=S168`
- append C1 with `teaches` = `supersedes S166 — ...` -> **no `duplicate_url`** (only the
  unrelated `used_by_uncited`, because the cited file does not yet mention `S168`)
- append C4 as a plain new row -> `FINDING id=duplicate_url fleet=E04 row=S171`
- append C4 with `teaches` = `supersedes S167 — ...` -> **no `duplicate_url`**
- append C5 as a plain new row -> `FINDING id=duplicate_url fleet=E04 row=S168`
- append C2 / C3 / C6 / C8 as new rows -> **no `duplicate_url`**

The lane's own census agrees: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
validate --root /home/vgpnk/Projects/shokunin tabi` exits 0 with 23 pre-existing `W04`
across-scopes warnings and `ok ... corpus/SOURCES.md`.

**Byte-identity check against already-held rows:**

| Held row | Recorded sha256 | This seat's fetch | Result |
|---|---|---|---|
| S166 (MDN WheelEvent) | `78bd40dc…c2d1` | `78bd40dc…c2d1` (156 604 B) | **identical** — S166 needs no content re-open |
| S167 (CSSOM View) | `51a7efdb…bb99` | `e8f4fbda…f4a6` (1 084 848 B) | **different bytes, same length**; the only diff is `<meta name="revision">`: `a3e7fce3510dbffd4cc39c8358597824c4de5e09` -> `909869d6b501d19e4bf632e458848f3c81af425f` (`diff` = 4 lines = one changed line). The quoted §3.1/§4/§6.1/§13.2 text is **unchanged**, so S167 stays true; the drift is a freshness datum, not a new row. |
| S105 (Page.pdl @154) | `e944a3b1…05be` | `e944a3b1…05be` for Page.pdl @**155** | **identical** — the 155 Page.pdl is the same content under a new tag URL |
| S153 (browser_protocol.json @master) | `d6737c31…31e7` (1 423 170 B) | `cb4b0a40…a5efb` (1 423 215 B) | **moved again** (+45 B) since the round-57 re-open; two fetches this session were byte-identical to each other |
| (none) | — | `data/tot.json` `d06f1592…0498` (1 606 347 B) | not held; this is the JSON the viewer SPA actually renders (`main.js` fetches `./data/tot.json`) |

This seat's independent fetch of `browser_protocol.json` and of CSSOM View is
**byte-identical** to the two files the L1 had already staged under
`.ufo/waves/round-64/sources/` (`s168-cdp-browser-protocol.json`, `s169-cssom-view-refetch.html`).

---

## 3. Which r63 unknowns the new sources can and cannot ground

Source read: `corpus/knowledge/chromium-wheel-scroll-round-63.md` (its `source:` header is
`S166, S167`; `verified-at 816592612dd2a8073437c595d3fe3c477125cf3c`).

| r63 unknown (as stated) | r63 line | New sources that ground it | New sources that CANNOT ground it |
|---|---|---|---|
| "`deltaMode 0` is observed, not proven stable across builds." (§8 limits) | 157 | **Partially grounded.** Q03 grounds that `DOM_DELTA_PIXEL` (0x00) *is* the pixel unit (the MDN `deltaMode` sub-page), so the receipt's `deltaMode 0` is the documented unit; Q11/Q15 ground that the CDP `deltaY` unit is CSS pixels at the measured tag, so `deltaMode 0` and `deltaY` are the same unit. | **Cross-build stability remains UNGROUNDED.** No staged source says what any build *reports*; the numeric 0 is still a measurement, and MDN Q04 explicitly says not to assume the unit. A second *build*'s measured `deltaMode` would be needed. |
| "S166 grounds the property semantics only… It does not ground the pixel identity of `deltaMode 0` here, `isTrusted`, `cancelable` or the scroll arithmetic — those are measured." (§2) | 62-66 | **One sub-item is now groundable and was missed.** Q03/Q04 (the `deltaMode` sub-page, **not** the WheelEvent index page) ground the *meaning* of `deltaMode 0` = pixels and the duty to measure it. The WheelEvent index page itself (Q01/Q02) still contains **zero** `DOM_DELTA_PIXEL`, `isTrusted` and `cancelable` occurrences. | `isTrusted` and `cancelable` remain **UNGROUNDED** by any staged source — no fetched document mentions either term in the wheel context; the UI Events spec (`https://www.w3.org/TR/uievents/`, 920 762 B fetched this session) contains 0 occurrences of `DOM_DELTA_PIXEL` and is therefore **not** a substitute. The scroll arithmetic remains **UNGROUNDED** by every source here: no document states how far one delta scrolls. |
| "S167 grounds the witness name… this page reads `window.scrollY` (the same scroll position on the document's scrolling element), so the spec anchors the attribute class, not the exact accessor used." (§2) | 66-70 | **Corrected / now groundable.** Q19 grounds that CSSOM View §4 defines `Window.scrollY` as its own attribute (`attribute must return the y-coordinate,`, offset 151 596) in the **same** draft that defines `Element.scrollTop` (Q07). The r63 caveat understates the source: the exact accessor the page uses *is* spec-defined. | The *value* the accessor returns, and whether the page's `scrollY` equals the scrolling element's `scrollTop` in this build, remain measured. |
| "`pageState.scrollEvents` = 4 — one scroll event per wheel that actually scrolled; the swallowed leg produced none." (§1, §4) | 44-48, 96-108 | **Class grounded, count not.** Q08/Q09 ground that a viewport scroll queues a per-Document *pending scroll event*, and Q21 grounds that `scrollend` fires only when the position actually changed — the spec shape of the swallowed-vs-released distinction the lane measures. | The **count 4**, the one-event-per-scrolling-wheel rate, and the swallowed-leg-zero are **all measured**, not sourced. No document states how many scroll events a wheel produces. |
| "One browser build (155.0.8059.84) on one host, with `--disable-smooth-scrolling`; no cross-browser claim, no trackpad/momentum phases, no horizontal scrolling, no ctrl+wheel zoom, no `scrollend`, no third-party site…" (§8 limits) | 141-150 | **The flag's target is now named.** Q20 grounds that a *smooth* scroll updates the position "in a user-agent-defined fashion over a user-agent-defined amount of time" — i.e. `--disable-smooth-scrolling` removes exactly the duration the spec calls user-agent-defined. Q15 grounds the `deltaY` unit at the measured tag. | Every remaining item in that list stays **UNGROUNDED**: cross-browser identity, trackpad/momentum, horizontal scroll, ctrl+wheel zoom, `scrollend` support in Chromium, third-party site. Q21 is the *spec* rule for `scrollend`, not evidence Chromium fires it — r63's exclusion of `scrollend` remains correct. |
| "The fixture origin is loopback only, but the run is not egress-isolated…" (§8 limits) | 150-153 | **Nothing grounds this.** | It is a runtime measurement (sentinel's NetworkService observation); no document can. |
| "The counter validates internal consistency against the invocation-supplied driver pin; it does not authenticate the receipt — a caller that edits the driver AND supplies the new digest is outside this claim's boundary (the receipt is unsigned)." (§8 limits) | 155-157 | **Nothing grounds this.** | It is a property of the lane's own instrument design; no protocol or spec source can. |
| "Two independent cold runs… produced identical `legs`… and identical sha256 for all four PNGs" (§5 determinism) | 116-124 | **Nothing grounds this.** | Cross-run byte identity is the r64 live verifier's demonstration (the r63 failure class), never a document. |

**Net effect.** The new sources close **one** r63 caveat outright (Q19: the exact
accessor `window.scrollY` is spec-defined), **one** partially (the *meaning* of
`deltaMode 0` via the `deltaMode` sub-page, Q03/Q04), and **name the variable** the
`--disable-smooth-scrolling` flag removes (Q20). They close **nothing** about
cross-build pixel identity, `isTrusted`/`cancelable`, the scroll arithmetic, the scroll
event count, or the r63 declared limits — all of those stay measured or out of scope.

---

## 4. Findings

**F1 — severity: high (blocks two of the four frontier sources).** The r64 frontier
(cited in `claims.json` and `corpus/lessons/round-64.md`) names "the Chrome DevTools
Protocol Input domain (dispatchMouseEvent)" and "the CDP Page.captureScreenshot
section" as sources opened this round, at the URLs
`https://chromedevtools.github.io/devtools-protocol/tot/Input/` and
`.../tot/Page/`. Both URLs are **free** in the registry (no E04), but the bytes they
serve are **redirect stubs with no parameter text**:
`curl -sSL -o /dev/null -w '%{http_code} %{size_download}' https://chromedevtools.github.io/devtools-protocol/tot/Input/`
-> `200 2349`; `grep -c "Dispatches a mouse event" staged/cdp-tot-input.html` -> **0**;
`grep -c deltaY staged/cdp-tot-input.html` -> **0**; `grep -c "Capture page screenshot" staged/cdp-tot-page.html` -> **0**.
Consequence: a row citing either URL can carry only the command *name* as its quote.
Every semantic ground the round needs (the delta unit, the screenshot viewport default)
must come from `data/tot.json` (Q11-Q13, free URL) or the tag-pinned PDLs (Q14-Q18,
free URLs). The frontier's four named sources, taken literally, ground **none** of the
wheel/scroll semantics.
*Evidence:* `.../w1/R64Scout/quotes.json` Q05/Q06 (offsets 958 / 913, 1 word each);
`.../w1/R64Scout/collision-check.txt` §C rows C2/C3 and §E.

**F2 — severity: high (E04 duplicate-URL trap on three of the four frontier URLs).**
MDN WheelEvent is already held by **S166**, CSSOM View by **S167**, and the CDP
`browser_protocol.json` by **S153**. A plain new row for any of the three is refused:
`node scripts/check-sources.mjs --root . --file corpus/SOURCES.md` on a scratch copy
with the row appended inside `## Registry` -> `FINDING id=duplicate_url fleet=E04`.
Re-writing `teaches` to begin `supersedes S166` / `supersedes S167` clears it (the gate
exempts `/^supersedes\s+S[0-9]{3,}\b/`). Note the round-64 lesson's own account of the
S168 attempt ("The census refused it twice: `W04 S168 duplicate url …`") cites a **W04**
warning, but the lane's own gate emits **E04** for the same row — the lesson's evidence
pointer is to the fleet census, not to `check-sources.mjs`.
*Evidence:* `.../w1/R64Scout/collision-check.txt` §C and §D (empirical gate runs).

**F3 — severity: medium (registry freshness drift on S153 and S167).** S153's recorded
`browser_protocol.json` digest (`d6737c31…`, 1 423 170 B, round-57 re-open) no longer
reproduces: an independent fetch today gives `cb4b0a40…` (1 423 215 B, +45 B). S167's
recorded CSSOM View digest (`51a7efdb…`) no longer reproduces either: `e8f4fbda…`, same
1 084 848 B, the only difference being the `<meta name="revision">` value
(`a3e7fce3…` -> `909869d6…`). The quoted §3.1/§4/§6.1/§13.2 text is unchanged, so
neither row's *content* claim is invalidated — but both rows' recorded digests are now
stale and a `recheck` that compares against the recorded sha256 will report a false
drift. S153's row already carries a 2026-11-04 re-open with the fresh digest; S167's row
does not yet name the new revision.
*Evidence:* `.../w1/R64Scout/collision-check.txt` §E.

**F4 — severity: medium (coverage gap: no Browser-domain source row).** The r64
receipt's `host.cdpProduct` comes from CDP `Browser.getVersion`, and the round-64
knowledge entry cites only `S153, S167, S166` in its `source:` header — none of which
covers the Browser domain. `grep -n getVersion corpus/SOURCES.md` -> **0 hits** across
all 167 rows. The Chromium 155 `Browser.pdl` (Q16, URL free, no E04) is the source that
would close it.
*Evidence:* `.../w1/R64Scout/quotes.json` Q16; `grep -c "^| S168 " corpus/SOURCES.md` -> 0.

**F5 — severity: medium (build-specificity claim is not carried by the PDL).** The
round-64 claim pins "one browser (Chromium 155.0.8059.84)". Tag-pinned PDLs at
155.0.8059.84 were fetched and quoted (Q14-Q18), but the decoded bytes are
**byte-identical** to the 154.0.8037.97 files: `Input.pdl` -> `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`
at both tags; `Page.pdl` -> `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`
at both tags, and that second digest is exactly the digest **already held by S105**. A
new row for the 155 `Page.pdl` would therefore be the same content under a new tag URL
(same-content duplicate, W04-shaped) and would add no distinct source.
*Evidence:* `.../w1/R64Scout/collision-check.txt` §E.

**F6 — severity: medium (r63's §2 caveat is understated; a better source exists).**
r63 §2 says S167 "grounds the witness name … so the spec anchors the attribute class,
not the exact accessor used", because the page reads `window.scrollY` while S167 covers
only `Element.scrollTop`. The same CSSOM View draft defines `Window.scrollY` in §4
(Q19, offset 151 596) — so the exact accessor *is* spec-defined. Also, the MDN
`deltaMode` **sub-page** grounds the meaning of `deltaMode 0` (Q03/Q04), which S166
(the WheelEvent *index* page) cannot: the index page contains zero `DOM_DELTA_PIXEL`
occurrences. Both are reachable without a new URL (the deltaMode sub-page is a
same-host sibling of S166's URL, so it is a distinct, free URL).
*Evidence:* `.../w1/R64Scout/quotes.json` Q03, Q04, Q19.

**F7 — severity: low (the frontier's browser claim is not stable across fetches).**
`browser_protocol.json` @master moved between the round-57 re-open and today
(+45 B). Within this session two fetches were byte-identical, so the move was a
discrete upstream roll, not flapping. Any registry row anchored to that URL needs a
digest re-verify at recheck time, and a quote located at a byte offset into that file
(Q11 offset 659 847, Q12 offset 1 081 550) is offset-stable only for that exact file
revision.
*Evidence:* `.../w1/R64Scout/collision-check.txt` §E.

**F8 — severity: low (the two tot/ viewer pages duplicate the JSON's content).**
`https://chromedevtools.github.io/devtools-protocol/data/tot.json` (1 606 347 B,
sha `d06f1592…`) is the JSON the viewer SPA actually renders — `main.js` contains the
literal `'./data/tot.json'` — and it carries the same `dispatchMouseEvent` /
`captureScreenshot` description strings as the master JSON. It is a **free** URL
(no row holds it) and is the only CDP URL that grounds the semantics *and* is
versioned to the live viewer's own tip.
*Evidence:* `grep -oE "'[^']*json[^']*'" staged/main.js` -> `'./data/tot.json'`;
`.../w1/R64Scout/collision-check.txt` §C row C9.

**F9 — severity: informational (registry id order).** `S159` and `S160` appear
swapped in file order (line 173 = `S160`, line 174 = `S159`). All 167 ids are present
exactly once, so this is not an E03; it is a presentational artefact only.

**No defect found in the frozen instruments.** `scripts/chrome-cdp-loopback-round64.mjs`,
the four counters, `scripts/verify-live-r64.mjs`,
`scripts/check-receipt-provenance.mjs`, `.ufo/waves/round-64/controls/run-controls-r64.mjs`
and `claims.json` were read for the CDP surfaces they exercise (the driver issues
`Input.dispatchMouseEvent` with `type: 'mouseWheel'`, `deltaY: ±120` at (200, 300),
`Page.captureScreenshot` with `format: 'png', captureBeyondViewport: false`, and
`Browser.getVersion`; the fixture paints 25 bands of 120 px and a 200x50 witness strip)
and were **not modified**. No frozen byte was touched by this seat.

**Tooling.** No package was installed or upgraded this session; no PACMAN action was
taken. The operator directive of 2026-10-19 therefore has nothing to record for this
seat.

---

## 5. Verdict

**ADVISORY — the four frontier sources as named do not carry the round's semantics, and
three of the four URLs are already held.**

The staged set is complete and every quote is byte-located (21/21 verified verbatim in
the staged bytes, all <=25 words). But the sources the round's frontier names split
three ways, and the L1 should decide the registry move on that split, not on the
frontier's wording:

1. **MDN WheelEvent (S166) and CSSOM View (S167) are re-opens, not new rows.** Their
   URLs are held; a plain row is **E04**. S166's content is byte-identical to today's
   fetch, so it needs no content change. S167's content is unchanged apart from the
   `<meta name="revision">` value — a freshness datum, not a new row.
2. **The `tot/Input/` and `tot/Page/` URLs are free but semantically empty.** They
   ground the command *names* only. If the round wants a row for either, it must be
   tier-B/C with a one-word quote and an explicit scope of "command name only"; the
   semantic grounds belong to `data/tot.json` and the tag-pinned PDLs, whose URLs are
   also free.
3. **The genuinely new, genuinely useful sources are `data/tot.json` (C9), the Chromium
   155 `Input.pdl` (C6), and the Chromium 155 `Browser.pdl` (C8)** — all free, none
   E04, and the Browser one closes a real gap (no Browser-domain row exists in 167
   rows) that the round-64 receipt's `cdpProduct` field depends on. The Chromium 155
   `Page.pdl` (C7) should **not** get a row: it is byte-identical to the already-held
   S105.

Rejections are recorded per candidate in §1 and in the `grounds`/`rejects` fields of
`quotes.json`: a property-semantics page grounds no cross-build pixel identity; a
command-index page grounds no command semantics; CSSOM View grounds no wheel-event
record; a tag-pinned PDL alone grounds no build-specificity; a protocol definition
grounds no run-binding.

On the r63 unknowns: the new sources close one caveat outright (`window.scrollY` **is**
spec-defined — Q19), one partially (`deltaMode 0` = pixels is documented — Q03/Q04), and
name the variable `--disable-smooth-scrolling` removes (Q20). They close **nothing**
about cross-build identity, `isTrusted`/`cancelable`, the scroll arithmetic, the scroll
event count, or any of r63's declared limits.

**Nothing here is a defect in the frozen instruments, and no claim is falsified by
this seat.** All findings are advisory for the L1 to integrate and score.
