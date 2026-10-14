<!-- corpus entry — tabi-shokunin round 3 (2026-10-14), lane TABI-R3-1 (plan: plans/round-3.plan.md:1-14). Method: a four-page loopback site (index -> detail -> form -> confirm) served by `python3 -m http.server` bound 127.0.0.1:19421; a CDP journey driver on a fresh headless chromium (debug port 19422, loopback) clicks the real links, fills the form with real input events and submits it; six per-step captures (screenshot + DOMSnapshot + DOM-shape text + client network slice + URL/history) per run; two independent cold-profile runs byte-compared mechanically (compare.mjs), plus a preserved warm-cache pass used for the status-path boundary; cleanup executed and port closure verified per run. This lane's write scope was this file only — LOG.md append (AGENTS.md:3), coverage row, SKILL distillation left to the integrating round (same pattern as cdp-evidence-patterns.md:1). Scratch artifacts staged at /tmp/tabi-r3-1-journey/ (ephemeral — archive obligation per cdp-evidence-patterns.md:92 applies to this run's bytes too). -->
# Multi-step journey evidence — loopback site, link-following + form submission, per-step captures

Scope: PROVINCE.md:9-13 (CDP session discipline + dynamic-page evidence patterns).
Refusals honored (PROVINCE.md:15-19): no external site touched (loopback only —
plan anti-claim plans/round-3.plan.md:8-9, recorded again this round), no secrets
read, no consequential actions. Admission bar: corpus/QUALITY.md:1-8. Claims
below are observations with anchors, inference, or §8 unknowns. Evidence
produced 2026-10-14 on this host; every artifact re-hashed from disk after
capture.

## 1. Fixture + harness (observed)

Fixture site `site/` — six files, all sha-pinned in `methodology-sha.txt`
(first 12 hex shown):

| file | lines | bytes | sha256 first 12 | role in the journey |
|---|---|---|---|---|
| `index.html` | 17 | 459 | `42d7a35b82be` | start page; `#item-1` links to `detail.html?id=1` |
| `detail.html` | 28 | 984 | `353d8107a072` | renders the item from a real `fetch('data.json')`; `#to-form` links to `form.html?id=1` |
| `form.html` | 28 | 1,014 | `50d811502ef8` | `#travel-form` action `confirm.html` method `get`; text field + rail/trail radios + hidden `item` |
| `confirm.html` | 24 | 770 | `84b6ea0c17f4` | echoes `?traveler`/`?mode`/`?item` into the DOM |
| `style.css` | 5 | 286 | `6380986105b3` | shared stylesheet (a real subresource) |
| `data.json` | 1 | 106 | `bf141027b3ef` | the detail fetch payload |

Harness: `journey.mjs` 356 lines `b52074a33876` · `driver.sh` 85 lines
`9509c07f49f9` · `compare.mjs` 38 lines `ecce1c73dc56`. "Same methodology" is a
sha256 check (r2 rule, live-dynamic-capture.md:164-165).

Journey as executed (browser-driven; the driver never fetches fixture URLs
itself): `Page.navigate` → `http://127.0.0.1:19421/index.html`
(journey.mjs:253) → click `#item-1` (href `detail.html?id=1`) → click
`#to-form` (href `form.html?id=1`) → click `#traveler`,
`Input.insertText 'tabi-r3'` (journey.mjs:295), click `#mode-rail` → click
`#submit` (form action `confirm.html`, GET) → confirm page. All clicks are
`Input.dispatchMouseEvent` pressed/released at the element's rect center;
click coordinates land in `journey.json` `actions[]`.

Server: `python3 3.14.7 -m http.server 19421 --bind 127.0.0.1`
(driver.sh:22); listen line `LISTEN 0 5 127.0.0.1:19421 users:(("python3",
pid=413256,fd=3))` (run1/driver.log:10) — loopback only. Run 2 pid 413600
(run2/driver.log:10).

Browser: chromium 152.0.7977.82, `--headless=new`; effective child line
run1/driver.log:13 — the host wrapper flags reappear (`--ozone-platform=wayland
…`, `--load-extension=~…copy-url`, `--ozone-override-screen-size=800,600`) plus
the requested set (`--remote-debugging-port=19422 --remote-debugging-address=
127.0.0.1 --disable-gpu --disable-background-networking`), reproducing round-1
E1 (cdp-evidence-patterns.md:30-32). Debug endpoint loopback only
(driver.log:11). Browser ws uuid per launch: `c8fe2ee0-…` (run1/chromium.log:2)
vs `edb3955e-…` (run2) — per-launch, as r1 E6.

New vs round 2: the driver removes the profile at run start
(`rm -rf "$OUT/profile"`, driver.sh:16; logged driver.log:2) so each run's HTTP
cache is cold. That line was added after the warm-cache pass measured a
different wire-status path (§5).

Wait discipline — all state-based, predicates live in the sha-pinned script:
index loaded (`document.title==='TABI-R3-1 index' && readyState==='complete'`,
journey.mjs:255); detail navigated **and fetched** (`#item-name==='north route'
&& #item-region==='highlands'`, journey.mjs:274); form loaded
(`#item-field.value==='1'`, journey.mjs:287); `#traveler.value==='tabi-r3'`
(:296); `#mode-rail.checked===true` (:298); confirm URL + rendered
`#out-traveler==='tabi-r3' && #out-mode==='rail' && #out-item==='1'` (:313).
`capture()` settles two rAF frames before the shutter (:189-190);
`document.activeElement.blur()` runs before the post-fill shutter (:303) to
remove caret-blink variability [design choice; not adversarially tested —
§8.4]. Viewport pinned via `Emulation.setDeviceMetricsOverride 800×600×1`
(:248) → observed innerWidth/Height 800/600, DPR 1 (journey.json `viewport`).

## 2. The journey record (observed)

Two independent cold-profile runs: run1 14:47:27–29Z (driver.log:1,64), run2
14:47:29–31Z; ~2 s wall each. Six captures per run (PNG + raw DOMSnapshot +
shape text + per-step network slice), all recorded in `run*/journey.json`;
capture lines run1/driver.log:38-43 == run2/driver.log:38-43:

| step | action | URL read-back | transition | png sha256 (16 / bytes) | shape sha256 (16 / nodes) | net slice |
|---|---|---|---|---|---|---|
| step-1-index | navigate | `…/index.html` | typed | `e9d8c83c88015877` / 14,810 | `af23de0471797ee7` / 37 | 3: index 200 Document, style 200 Stylesheet, favicon 404 |
| step-1-index-idem | re-capture, +300 ms idle | (same) | — | `e9d8c83c88015877` / 14,810 | `af23de0471797ee7` / 37 | 0 |
| step-2-detail | click `#item-1` | `…/detail.html?id=1` | link | `6d48d45ebecfaa49` / 15,068 | `f4ecc2771d1af837` / 42 | 3: detail 200, style (cache-served), data.json 200 Fetch |
| step-3-form | click `#to-form` | `…/form.html?id=1` | link | `15a97130785f7562` / 13,354 | `23aa4e306ec3a449` / 53 | 2: form 200, style (cache-served) |
| step-3-form-filled | insertText + radio click + blur | (same) | — | `8cc96fdf637a606e` / 14,240 | `23aa4e306ec3a449` / 53 | 0 |
| step-4-confirm | click `#submit` | `…/confirm.html?traveler=tabi-r3&mode=rail&item=1` | form_submit | `a12566cd4890fbdd` / 12,692 | `a6a9c3aca7915959` / 43 | 2: confirm 200, style (cache-served) |

All PNGs 800×600. Full hashes (from run1/journey.json; disk re-hash of the PNGs
and all 12 shape files matched — `sha256sum`, compare.tsv):

- png step-1 / step-1-idem `e9d8c83c880158775f8aef00b0785adc9fe603f001f0230ce08b44c8a387bc12`
- png step-2 `6d48d45ebecfaa49d3297b3842646ee590ab44042bca9798c560b95152dea6dc`
- png step-3 `15a97130785f7562f92bd2229bf0dcd1a6b302980eac8b83513d8645b8e669a8`
- png step-3-filled `8cc96fdf637a606efde36a240356f2867d1b0c3ebfb1be096a94af8705b8ad7c`
- png step-4 `a12566cd4890fbddd0438c4d71e3c5dc50e4f7a6eaa2edc17bac73e41d60693b`
- shape step-1 `af23de0471797ee7e39443c4aefc0aa3216c2209dd8b0eb276d573b24b2dbba6` (struct `2f77717b0501dd90d51526dedaf56dcac8a6ea1a462778a605e095ce94011bee`)
- shape step-2 `f4ecc2771d1af837d5d8a6497daee75ba49f4c860496d09577432b997f31d232` (struct `d6ba6564883ef2afc902a59c42e3620e72b66ee52c2cc4062f57309fed396d73`)
- shape step-3 / filled `23aa4e306ec3a449ea162ffcd3295dfa74a4d8271fb42dd331390b1fd74ef871` (struct `0db82bf93c127a13f7cbf3b00e593670eb69cb1ccff2d0029e1be5c71f1f7772`)
- shape step-4 `a6a9c3aca791595971091703c7e73dab2f0104b6c5a2219f7675a5d6d87153da` (struct `a346a204ed62474f1bf12f872f8bec28ff4ca5252db8fc1e0c8f3680e013e7bf`)

Screenshots were read back visually (calibration): index renders the two
bulleted links; detail renders `item: north route / region: highlands` — i.e.
the data.json payload; the form renders an empty field with both radios
unchecked; the filled state renders `tabi-r3` in the field with rail selected;
confirm renders `traveler: tabi-r3 / mode: rail / item: 1`. All match the
authored fixture.

Navigation history (chrome-side witness, `Page.getNavigationHistory`,
journey.json `history`): `about:blank` auto_toplevel → `/index.html` **typed**
→ `/detail.html?id=1` **link** → `/form.html?id=1` **link** →
`/confirm.html?…` **form_submit**; currentIndex 4 of 5 entries. The
`link`/`form_submit` labels come from the browser, not from our click code —
an independent surface for the action class.

Cross-checks (independent surfaces agreeing):
- Confirm URL agrees verbatim on three surfaces: `location.href` read-back
  (journey.mjs:198) · `/json/list` target `url` after the journey
  (journey.json `targetEnd`) · server log line 8 —
  `"GET /confirm.html?traveler=tabi-r3&mode=rail&item=1 HTTP/1.1" 200`
  (run1/http.log:8; identical run2/http.log:8).
- Page target `id` `B9AE54BF39F029505D4DA5626C9006C3` identical at launch and
  at end (same target across the journey); ids are per-launch, match by
  URL/title (r2, live-dynamic-capture.md:128-131).
- Client network slices record 10 events total; the server log records 7
  requests in 8 lines (http.log:1-8, line 3 is the 404 explainer). The 3-event
  delta is the cache-served `style.css` repeats — §5.

## 3. Evidence ladder applied per claim class

Rung definitions live in SKILL.md §'Evidence ladder'; class mechanics in
SKILL.md §'Claim classes → capture'. Section titles are the stable anchor
here: SKILL.md is being extended by the round-3 integration while this note is
written (line refs last seen: rung rows :310-312, class rows :327-329, against
SKILL.md sha256 `e2b1343c2f13…`; they move — re-derive at read time).
This round's claims, mapped (never present a lower rung as support for a
higher one):

| claim | class | rung | support (strongest first) |
|---|---|---|---|
| each of the four pages renders X | visual | 1 + 3 | sha256-stable PNG, read back visually; idempotence re-capture identical; identical across two independent runs |
| step-4 renders the submitted values | visual + state | 3 | screenshot read-back · `#out-*` text in the DOM shape · URL query · server log line 8 |
| the field holds `tabi-r3`; rail is checked | state | 2 → 3 | raw DOMSnapshot column delta (below) · in-page poll before shutter (:296,:298) · screenshot · identical across runs |
| clicking `#item-1` navigated to detail | action-effect | 2 | before/after URL pair (step-1 → step-2) · history transitionType `link` · net slice (detail doc 200) |
| clicking `#to-form` navigated to the form | action-effect | 2 | same pattern (`link`, form doc 200) |
| submitting navigated with the exact query | action-effect | 3 | URL read-back · `form_submit` · server log line 8 · client net entry |
| detail fetched data.json and rendered from it | network + state | 3 | client Fetch entry 200 `application/json` · server line 6 · DOM text `north route` · visual |
| the wire served 200s in the recorded runs | network | as-of-capture | server log (wire truth — §5 shows why the client slice alone is not enough) |

State-class mechanics earned this round — DOMSnapshot `inputValue` /
`inputChecked` are hollow `{index,value}` objects (the encoding r2 found for
`pseudoType`, live-dynamic-capture.md:97-101), and **`-1` is the empty-value
sentinel**:

- step-3-form: `inputValue {"index":[25,30,34,38],"value":[-1,50,54,59]}` →
  traveler empty(-1), rail, trail, item `1`; `inputChecked {"index":[]}`.
- step-3-form-filled: `inputValue {…,"value":[46,51,55,60]}` → `tabi-r3`,
  `rail`, `trail`, `1`; `inputChecked {"index":[30]}` — node 30 is
  `#mode-rail`; the value key is omitted, presence in `index` = checked. The
  type-checked extraction is journey.mjs:152-180 (`hollowLookup` guards
  `i >= 0`).
- The shape text does **not** carry live input values (attributes are
  unchanged by typing): step-3-form and step-3-form-filled have identical
  shape hashes (`23aa4e30…`) while both the screenshot and the raw columns
  differ. A consumer keying on shape text alone would miss the fill.
- Trap (calibration): an unguarded consumer resolves `strings[-1]` to the
  table's *last* entry — in these snapshots a genuine text string — silently
  fabricating a value where the column means "empty". Our first Python
  inspection did exactly this (a phantom `"\n\n"` value); the JS extraction
  guards. The same `-1` sentinel appears once in the `attributes` column (the
  empty `value=""` attribute of `#traveler`; raw pair `[45,-1]`).

## 4. Determinism boundary (what was and was not byte-reproducible)

**Byte-reproducible in this environment** — four preserved independent runs:
the two cold fresh-profile runs (the primary record) and two warm-cache runs
(same journey, profiles carried a prior pass's cache; preserved at
warm-cache-observation/). Identical across runs: all six step PNGs (including
the JS-rendered detail and the post-input form), all twelve shape artifacts
(text + struct), the extracted input columns, the navigation-history sequence,
and the browser/protocol provenance. Mechanical comparison: compare.tsv — 28
rows, 25 IDENTICAL plus the 3 expected DIFFERs (the action deltas:
step-1≠step-2, form≠filled, filled≠confirm). This extends r2's single-page
byte-identity (live-dynamic-capture.md:105-115) to a four-navigation journey
with link clicks and a form submission.

**Not byte-reproducible** (measured): per-capture `atUTC` stamps; target `id`s
and browser ws uuid per launch; `/json/list` timestamps; the wire status class
(cold 200s vs warm 304s — §5) while capture bytes stayed identical under both;
client-vs-wire event counts; http.log wall stamps; chromium.log content (4
lines — only the DevTools listening line plus shutdown noise in these short
runs; **no GCM/Google lines**, unlike r1 E4 and r2 §6 — absence is
as-of-capture, not a no-egress claim).

**Boundary rests on**: same chromium build, same effective flags (child line
recorded), same viewport override, same fixture bytes, same wait predicates,
same typed input text, same host font stack — environment-scoped (r2 caveat,
cdp-evidence-patterns.md:72, stands).

## 5. Network-shape boundary — client events are not wire truth (calibration)

Cold runs (primary record): the wire log shows 7 requests
(run1/http.log:1-8 — index, style, favicon 404, detail, data.json, form,
confirm, all 200 except favicon) while the client recorded 10 events. The
3-event delta is `style.css` entries in the step-2/3/4 slices: status 200,
`fromDiskCache:false`, `fromMemoryCache:false`, and **no wire line** —
within-session cache re-serves [cache mechanism = inference; counts and flags
measured, §8.1].

Warm pass (preserved): the server answered **304** for 6 URLs
(warm-cache-observation/run1-http.log:1-2,5-8) while the client's events still
reported **200** with both cache flags false (warm-cache-observation/
run1-journey.json `netEvents`), and the captures stayed byte-identical. So:

- the client status is the *effective* response (post-revalidation); the
  server log is the *wire* status;
- "client shows 200" does not imply "the server sent 200"; a claim of
  "no wire contact" needs the server log, not the client slice;
- "no client event in a slice" (step-1-index-idem, step-3-form-filled: 0) does
  mean no network activity attributable to that step in the record
  [as-of-capture].

This is the concrete round-3 instance of SKILL.md's network row (name the
producer channel; assert as-of-capture with the snapshot attached).
Response bodies were not captured (SKILL.md §'Claim classes → capture', Network row — `response_body` defaults false) — the form is GET
(python http.server does not serve POST), and the exact query is on both
surfaces. The browser's own `/favicon.ico` probe (404, not part of the
journey) landed in the step-1 slice in every preserved run; it is reported
as-is, not adopted into the journey.

## 6. Rules delta — what multi-step journeys add to the envelope

Extends the r2 rules (live-dynamic-capture.md:151-173) and the 9-item record
envelope (cdp-evidence-patterns.md:79-92):

1. **Record navigation history per step.** `transitionType`
   (`typed`/`link`/`form_submit`) is a browser-side witness of the action
   class — independent of the driver's click code and of page JS.
2. **Structure the journey as per-step triplets**: idle → action → result;
   each action-effect claim uses the pair in the class the effect lives in,
   and the journey-level record ties steps together by URL.
3. **Keep both network surfaces** (client events + server log) and name which
   one produced each fact; cache state changes the wire status class while
   capture bytes stay identical (measured both sides, §5).
4. **State class:** parse raw DOMSnapshot columns for live input values
   (hollow encoding, `-1` sentinel, value-less presence); shape text alone
   does not carry them.
5. **Fresh profile per run** (driver.sh:16) — otherwise cold/warm wire paths
   mix (measured, §5); log the profile disposition line.
6. **Blur before the post-input shutter** [design choice against caret-blink;
   §8.4]. 
7. **Cleanup proof stays per-run** (r2 §5; each run proves its own closure).

## 7. Cleanup + closure proof (executed per run)

Kill by PIDs discovered from the process table, never by pattern
(driver.sh:61-62; r1 `pkill -f` self-match, cdp-evidence-patterns.md:105).
Per run — identical lines in run1/driver.log and run2/driver.log:
`no chromium survivors after TERM` (:58) · `pass: no chromium process for
…profile` (:60) · `pass: ports 19421/19422 not listening` (:61) ·
`curl cdp exit=7` (:62) · `curl http exit=7` (:63). Run 2 additionally proves
closure by re-binding the same ports after its own `ports free` precheck
(driver.log:3-4). Final global check at write time (2026-10-14T14:48:16Z):
`ss -ltn` on 19421/19422 → no match; no chromium process with the journey
profile; no `http.server` survivor.

Archive: all evidence staged under `/tmp/tabi-r3-1-journey/` (run1/run2 with
journey.json + 6×(png, domsnapshot.json, shape.txt) + http.log + chromium.log
+ driver.log; site/; journey.mjs; driver.sh; compare.mjs; compare.tsv;
methodology-sha.txt; warm-cache-observation/). `/tmp` hashes are only
verifiable while `/tmp` lives — copy bytes to durable storage before citing
(cdp-evidence-patterns.md:92).

## 8. Unknowns (do not convert to claims without a new probe)

1. Which cache tier served the repeat `style.css` client events: counts and
   flags are measured, but `fromDiskCache:false` even in the warm pass where
   the browser demonstrably held cached copies; `fromMemoryCache` is not a
   confirmed protocol field (always false in the records).
2. Why client `Network.responseReceived` reports 200/flag-false for wire-304
   revalidations on this build — protocol semantics unexamined.
3. Sentinel scope: `-1` observed in `attributes` (1 instance) and in
   `inputValue` (empty value); `inputChecked`/`optionSelected` observed
   value-less; other columns untested.
4. Caret-blink: unblurred post-input capture stability untested (blurred by
   design); the blur's own visual effect on the radio focus ring unmeasured.
5. Favicon probe slice timing: stable in 4 preserved runs; still as-of-capture
   class (r2 §7.4 loaded-host caveat stands).
6. Real-site journeys — third-party JS, redirects, POST forms, CSRF-checked
   submits — untested by rule this round (external anti-claim,
   plans/round-3.plan.md:8-9).
7. `Input.insertText` event semantics: the value landed and submitted
   (measured); which key events it synthesizes for JS listeners unexamined.
8. Byte-identity generality beyond this host/build/font stack (r2 §7.3
   stands).

## 9. Errata (append-only — never edit above blocks)

*(none yet)*

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Entries below supersede the placeholder above; nothing above is
edited. Pre-append sha256 of this file:
`67447c028e90c3cbd23fafa371cb745a5a49402634e619c0082dffa0144791dc`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, fresh re-run] VERIFIED — §1/§2 pins re-held on disk.**
  methodology `b52074a33876…` / `9509c07f49f9…` / `ecce1c73dc56…`; site six
  files `42d7a35b82be` / `353d8107a072` / `50d811502ef8` / `84b6ea0c17f4` /
  `6380986105b3` / `bf141027b3ef` (bytes 459/984/1,014/770/286/106); all 12 run
  PNGs re-hash to the §2 full values (run1 ≡ run2 per artifact); ports
  19421/19422 closed (first-hand `curl` exit 7); no chromium survivors;
  `/tmp/tabi-r3-1-journey/` intact. Calibration: the fixture table's "lines"
  column is numbered-lines — `wc -l` differs on the no-trailing-newline file
  (`data.json` 1 vs 0); same class as the executor note's "298 vs 297".
- **[2026-10-14, round 4 pointer] supersession pending.** A round-4 seat re-ran
  this journey with CDP Network-domain capture (`/tmp/tabi-r4-1-network/`, runs
  ended 16:10:01Z; closure: ports 19441/19442 closed, curls exit 7) and an
  async-XHR variant (`/tmp/tabi-r4-2-async/`, 16:10:34Z); no corpus note
  admitted at this sweep (16:22Z). This note remains the round-3 record;
  row-level cross-refs owed once the round-4 notes land.
- **[2026-10-14, archive] obligation unchanged** — all bytes incl. this run
  remain `/tmp`-staged (`cdp-evidence-patterns.md:92`).