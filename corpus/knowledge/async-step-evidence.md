<!-- corpus entry — tabi-shokunin round 4 (2026-10-14), lane TABI-R4-2 / T4-2 (plan: plans/round-4.plan.md:3-7, the async-XHR half; anti-claim :8-9; measure :10-11). Method: the round-3 four-page loopback journey + a fifth page whose content exists only after an XMLHttpRequest completes — the request is held at the protocol layer (CDP Fetch domain, Request stage, pattern *routes.json*) so the pre-settle state is a stable, unbounded class; the driver releases it (Fetch.continueRequest) and then waits on a payload-derived DOM predicate. Each pre/post capture carries three layers: screenshot PNG (visual), DOMSnapshot + DOM-shape text (state), Network-domain event slice (network) — plus the server wire log and the Fetch interception record. Six runs in two dispatch groups (first dispatch: probe1 + run1/run2 at 16:08–16:10Z; re-verification dispatch: run1/run2/run3 at 16:21–16:23Z; sha-pinned runner, fresh server+browser+profile per run); every artifact re-hashed from disk at write time. Provenance: the first dispatch completed its runs at 16:10:36Z and stopped before writing this note (user-session OOM at 16:10:59Z — context per plans/round-4-record-draft.md:147-199); this file is the lane's output, written by the re-verification dispatch, which re-derived every pin and re-ran the methodology under /tmp/w4-t4-2-async/. Write scope: this file only — LOG.md append (AGENTS.md:3), coverage row, SKILL distillation left to the integrating round (r2/r3 pattern). Scratch: /tmp/tabi-r4-2-async/ (first dispatch) + /tmp/w4-t4-2-async/ (re-verification; all scratch writes under /tmp/w4-t4-2-*) — ephemeral; the archive obligation (cdp-evidence-patterns.md:92) applies to these bytes too. -->
# Async XHR step — held-request pre/post pair across visual, state, and network layers

Scope: PROVINCE.md:9-13 (CDP session discipline + dynamic-page evidence patterns).
Refusals honored (PROVINCE.md:15-19): no external site touched (loopback only —
plan anti-claim plans/round-4.plan.md:8-9, recorded again), no secrets read, no
consequential actions; substrates read-only. Admission bar: corpus/QUALITY.md:1-7.
Claims below are observations with anchors, inference, or §8 unknowns. Evidence
produced 2026-10-14T16:08–16:23Z on this host; every artifact re-hashed from disk
at write time. "Three layers" here names the three claim classes of SKILL.md
§'Claim classes → capture' (visual / state / network); SKILL.md was being extended
concurrently, so it is referenced by section name, not line (r3 precedent).

## 1. Fixture + harness (observed)

Fixture revision R4-2 = the round-3 site + `async.html` + one edit to
`confirm.html` (the `#to-async` link). Nine files, sha256-pinned in the scratch's
`methodology-sha.txt`; the unchanged six equal the round-3 pins
(multi-step-journey.md §1):

| file | lines (wc -l) | bytes | sha256 first 12 | role / vs r3 |
|---|---|---|---|---|
| `index.html` | 17 | 459 | `42d7a35b82be` | start page — r3 bytes |
| `detail.html` | 28 | 984 | `353d8107a072` | `fetch`-rendered detail — r3 bytes |
| `form.html` | 28 | 1,014 | `50d811502ef8` | form — r3 bytes |
| `confirm.html` | 25 | 836 | `97ed8bfd06af` | **changed**: `#to-async` link added (r3: 770 B, `84b6ea0c17f4`) |
| `async.html` | 36 | 1,025 | `f23dc1099a6c` | **new** — the async page (XHR at load) |
| `routes.json` | 1 | 132 | `b283adae1880` | **new** — the XHR payload (single line, no trailing newline) |
| `style.css` | 5 | 286 | `6380986105b3` | shared stylesheet — r3 bytes |
| `data.json` | 1 | 106 | `bf141027b3ef` | detail payload — r3 bytes |

Harness: `journey-async.mjs` 482 lines (wc -l; last line unterminated),
sha256 `06fa6e5ce5bfc011a7d9e96a9d83d7d653c9a71b993bb4eb4935864edc1df10c` —
byte-identical in both dispatch groups (re-derived), the sha-pinned runner. It
extends the round-3 `journey.mjs`, kept verbatim as `journey-r3.mjs` (sha
`b52074a3387622538f27bc02fc6cec9e0919f5ddf941b935575a996459d5ddbc` = the r3 pin).
`driver.sh` 85 lines — first dispatch `d9cf1b2db10d…`; re-verification
`8fddda9e9e955bba62232bc420554fc32ffd03012c4ced159fd3992b71295b34` (1-line delta:
the scratch ROOT constant, `diff` recorded in the re-verification scratch).
Post-hoc compare scripts are not part of the capture methodology.

Server: `python3 3.14.7 -m http.server 19431 --bind 127.0.0.1`
(`LISTEN … 127.0.0.1:19431 users:(("python3",pid=1362504,…))`, W run1/driver.log:11).
Browser: chromium `Chrome/152.0.7977.82` (Protocol-Version 1.3), `--headless=new`,
loopback debug port 19432, fresh profile removed at run start ("fresh profile:
removing …/profile", driver.log:2), `--disable-background-networking`; effective
child line driver.log:13 reproduces the host wrapper flags (r1 E1 —
cdp-evidence-patterns.md:30-32): `--ozone-platform=wayland … --load-extension=~…copy-url
… --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl`. Viewport
pinned `Emulation.setDeviceMetricsOverride 800×600×1` (journey-async.mjs:298) →
observed `innerWidth/innerHeight 800/600`, DPR 1.

Journey as executed (all six runs): `Page.navigate` → `/index.html` → click
`#item-1` → `/detail.html?id=1` → click `#to-form` → `/form.html?id=1` → fill →
click `#submit` → `/confirm.html?...` → click `#to-async` → `/async.html`.
History witness: 6 entries, transitions `auto_toplevel → typed → link → link →
form_submit → link`.

Async-page mechanics (observed, async.html:16-34): the script sets
`#async-status` = `pending`, fires `XMLHttpRequest` GET `routes.json`, and on
`load` parses the JSON, appends one `li#route-N` per route (text `name - length`),
sets status `ready`; `onerror` sets `error`. One request per page load; no timers.

Hold + release (observed): `Fetch.enable {urlPattern:'*routes.json*',
requestStage:'Request'}` runs before navigation (journey-async.mjs:299-300), so
the XHR pauses at the protocol layer; `Fetch.requestPaused` resolves
`heldRoutesRequest` (:109-121); the driver releases with
`Fetch.continueRequest` after the pre capture (:396) and disables the domain at
the end (:430). Wait predicates (quoted from the record):
- pre — "document: '#async-status' === 'pending' && '#async-list' has 0 li &&
  readyState === 'complete'; network: Fetch.requestPaused seen for routes.json
  (request held)" (:377-384)
- post — "document: '#async-status' === 'ready' && '#async-list' has 3 li &&
  #route-1 === 'north route - 42 km' && #route-3 === 'coast route - 58 km'"
  (:399-404)
`pollUntil` = 50 ms cadence, 8 s timeout (:138-147); two rAF frames settle before
every shutter (:148-149, 237-238). No sleep decides any capture.

## 2. The capture pair — three layers per side (observed)

Anchors: W run1 `journey.json` `captures[*]` / `asyncStep` (identical structure in
all six runs; hashes equal across runs — §4):

| layer | pre-settle (`step-5-async-pending`) | post-settle (`step-5-async-settled`) |
|---|---|---|
| visual | PNG 12,503 B, 800×600, sha `6840ae9e34a6bcfd…` — read back: "status: pending", empty list | PNG 18,375 B, sha `119764f8f406bc74…` — read back: "status: ready" + 3 bullets `north route - 42 km / south route - 31 km / coast route - 58 km` |
| state | shape text sha `414b0d9d5f3a802f…` (struct `a29e9212fa24884f…`), 35 nodes; `#text="pending"`; `UL#async-list` empty | shape `14afa29ed7f3813e…` (struct `8e65bcacdfe1ca44…`), 44 nodes; +3 `LI[id=route-N]`, each with `::marker` + text |
| network | slice: async.html Document 200 · style.css Stylesheet (cache class — §5) · **routes.json XHR `issued`** (status null, respAtUTC null); wire log routes lines = 0 | slice: **routes.json XHR `answered` 200 application/json**, 325 B encoded, respAtUTC present; wire log routes lines = 1 |

- The state delta is fully accounted: +9 nodes = 3 `LI` + 3 `::marker` + 3
  `#text`; the `#status` text node changed in place. (The `::marker` pseudo-nodes
  repeat the r2 hollow-encoding finding — live-dynamic-capture.md:96-101 — 3 more
  instances.)
- Network certificates for the pre shutter: the pre slice carries no response for
  `routes.json` (status null; `state:"issued"` in the pinned-revision schema) and
  the wire log has 0 routes lines at that moment (`wireAtPre` `{routesLines:0}`)
  — the pre capture is proven pre-settle, not a lucky shot. Post: exactly one
  wire line — `"GET /routes.json HTTP/1.1" 200`.
- Response body: `Network.getResponseBody` → 132 bytes, sha256
  `b283adae18801612f5f8efb3ff15f6abf345ab195400fadbc7bd3a8d9d7fb4ac` == the
  `site/routes.json` file sha (re-hashed on disk) — the post predicate's awaited
  texts are the strings inside exactly these bytes.
- Initiator-class discriminator: `routes.json` is `type:"XHR"` (XMLHttpRequest),
  while the same journey's r3 `data.json` reads `type:"Fetch"` (initiator
  `fetch()`) — both in the same `netEvents` stream.
- `Fetch.requestPaused` recorded once per run, `resourceType:"XHR"`, URL
  `…/routes.json`.

Timing classes per run (records equal in kind; wall numbers vary):

| run (dispatch) | paused → postCap (UTC) | paused→preCap | release→response | response→ready | release→ready | wire 0→1 |
|---|---|---|---|---|---|---|
| E probe1¹ | 16:08:46.229 → .436 | 105 ms | 2 ms | 50 ms | 52 ms | ✓ |
| E run1 | 16:10:33.306 → .464 | 57 | 2 | 49 | 51 | ✓ |
| E run2 | 16:10:35.690 → .930 | 123 | 2 | 50 | 52 | ✓ |
| W run1 | 16:21:28.049 → .271 | 104 | 2 | 49 | 51 | ✓ |
| W run2 | 16:21:30.445 → .604 | 58 | 2 | 49 | 51 | ✓ |
| W run3² | 16:23:09.876 → 16:23:10.083 | 106 | 1 | 49 | 50 | ✓ |

¹ earlier unpinned runner revision (disclosed in the scratch's `methodology-sha.txt`);
its captures match the pinned-revision bytes. ² re-aged fixture mtimes — §5.
`release→response` 1–2 ms in all six; `response→ready` 49–50 ms (parse + 3 DOM
appends + status change).

## 3. Settle-wait discipline (documented + measured)

1. **Wait on state, never on time** (r2 rule, live-dynamic-capture.md:160-162).
   No predicate or sleep-gap decides a shutter; both predicates live in the
   sha-pinned runner and are re-checkable there. Poll 50 ms cadence, 8 s cap; no
   poll timed out in six runs; a wrong predicate fails loudly (record `error`,
   exit 1) rather than silently.
2. **The pre-settle state must be held, not raced.** Measured: once released, the
   request traversed wire + server + drain in **1–2 ms** (all six runs); the
   capture operation costs **57–123 ms** (paused → shutter). *Inference*: on this
   host a time-based pre-settle capture would compete for a ≤2 ms window with a
   ≥57 ms operation — the un-held variant was not run, so this contrast (released
   round trip vs capture cost) is the measured basis. The Fetch hold converts the
   window into an **unbounded stable class**: the request cannot advance until
   the driver releases it, so the pre shutter has no race by construction; the
   pre slice (`issued`, no response) and the wire log (0 lines) certify the class
   as-of-capture.
3. **The post-settle wait is payload-derived**: it awaits the rendered content
   (3 `li` + exact texts `route-1`/`route-3`), not an xhr flag, not "a moment
   after release"; then two rAF frames settle the paint before the shutter (r3
   rule, multi-step-journey.md:65-66).
4. **The release order is explicit and recorded**: pre shutter →
   `Fetch.continueRequest` → post predicate → post shutter. The record carries
   `pausedAtUTC`, `preCaptureAtUTC`, `continuedAtUTC`, `readyAtUTC`,
   `postCaptureAtUTC`, the Fetch event, and the wire counts — "the wait was
   correct" is re-verifiable from artifacts alone.
5. **The waited surface is the page's own state machine** (`pending` → `ready`,
   list items), so a response that never renders fails the poll instead of
   silently passing. [Design intent of the predicate; not adversarially tested —
   §8.5.]

## 4. Determinism boundary (what was and was not byte-reproducible)

**Byte-reproducible in this environment** — six runs / two dispatch groups / two
scratch trees / one browser build / ports 19431/19432 reused:

1. The async pair itself: pending PNG `6840ae9e34a6bcfd8f42f8ad8c2785959638867b04bfe31a403699237e2d4959`,
   settled PNG `119764f8f406bc74def48736816d5843035619bd781b84c3f5467f41aaffc54b`;
   pending shape `414b0d9d5f3a802feea2366cb46382437194a6383d339f32bdfeaad4ec4bf40a`
   (struct `a29e9212fa24884fa66a4ef48709b20e0dfda4e7f3e2c4933cb78bca245acacc`),
   settled shape `14afa29ed7f3813ea92bcda41726fca987551de3cd8879d04330efd37ddad31a`
   (struct `8e65bcacdfe1ca4424e4a9a4aa2a0fe59ff80d87fa4c1388539582408c1e39f3`) — equal in all six runs.
2. The other six captures of the extended journey: PNG/shape/struct equal across
   the six runs; steps 1, 1-idem, 2, 3, 3-filled also equal to the round-3
   record's bytes (cross-round rows IDENTICAL); step-4 `confirm` DIFFERS vs r3
   (png + shape) — the expected fixture-revision delta (the `#to-async` link).
   Mechanical compare: first dispatch `compare.tsv` = 43 IDENTICAL / 6 expected
   DIFFER of 49 rows; re-verification `compare-w4.mjs` (sha `7945e821a49d…`) = 47
   IDENTICAL / 5 expected DIFFER of 52 rows (3 within-run async deltas + 2
   cross-round confirm rows).
3. Protocol provenance: `Chrome/152.0.7977.82`, Protocol-Version `1.3`
   (`json-version.json`), viewport effects identical.

**Not byte-reproducible** (measured, not assumed): wall stamps (`atUTC` per
capture; deltas vary 57–123 ms at the same predicate); session slots per launch —
page target id (`B11A857B2BC9…` W-run1 vs `0894B7D798A0…` W-run3) and browser ws
uuid per launch (`…00254c89…` / `…2574486c…` / `…8e3804b5…`), match by URL/title
(r2 rule); the wire-status class of the repeated `style.css` subresource (§5);
`chromium.log` content — 4 lines each (blank + DevTools listening + 2
zygote-teardown errors), **no GCM/Google lines** in any of the six — absence is
as-of-capture, not a no-egress claim (r2 §6 stands).

Boundary rests on: same chromium build, same effective flags (child line
recorded), same viewport override, same fixture bytes, same wait predicates, same
host font stack — environment-scoped (r2 caveat, cdp-evidence-patterns.md:72,
stands).

## 5. The subresource wire-class variant (observed; extends r3 §5)

Same methodology, byte-identical captures — but the wire path of the repeated
`style.css` changed across the six runs (fresh profile each; nothing else
changed):

| group/run | site mtime age at run | http.log | style.css wire lines | async page's style in the client slice |
|---|---|---|---|---|
| E probe1 / run1 / run2 | ~3–4 min | 10 lines | 1 × 200 | 200, 0 B (cache-served) |
| W run1 | seconds (fresh copy) | 14 lines | 200 + 4 × 304 | **304, 104 B** |
| W run2 | seconds (fresh copy) | 11 lines | 200 + 1 × 304 (step-2) | 200, 0 B (no wire line for the async page) |
| W run3 | ~10 min (re-aged) | 10 lines | 1 × 200 | 200, 0 B |

- r3's rule — "the client status is not wire truth; keep both surfaces"
  (multi-step-journey.md §5) — is thereby corroborated and sharpened: with
  capture bytes identical, this round observed three wire/client combinations
  (no-wire/200-client; wire-304/304-client; wire-304/200-client for the repeat).
  The audit lane independently observed the third combination on the r3 replay
  (reports/r4-aud-tab1.md:54,63-83, "client 304 = wire 304").
- *Inference (unexamined)*: fixture mtime age co-varies in the extreme comparison
  (seconds-old copy ⇒ wire revalidations; ≥3-min-old ⇒ none), but it does not
  explain W-run1 vs W-run2 (both fresh copies, 4 vs 1 revalidations); mechanism
  unmeasured (§8.2).
- The async payload itself is unaffected: `routes.json` had exactly 1 wire line
  (200) in all six runs, and the capture bytes are identical across all classes.

## 6. Cleanup + closure proof (executed per run; verified at write time)

- Per run: kill by PIDs discovered from the process table, never by pattern (r1
  `pkill -f` incident, cdp-evidence-patterns.md:105; audit lane's `ps|grep`
  self-match, reports/r4-aud-tab1.md §4). Closure lines per run, identical in all
  six `driver.log`s — W run1/driver.log:66-71: `no chromium survivors after TERM`
  · `pass: no chromium process for …/run1/profile` · `pass: ports 19431/19432 not
  listening` · `curl cdp exit=7` · `curl http exit=7`.
- Runs 2 and 3 re-bound the same ports after their own `ports free` precheck
  (e.g. W run3/driver.log:3-5) — closure proven twice more by rebinding.
- Final global sweep at write time (2026-10-14T16:23:49Z): no chromium process
  for either scratch profile; ports 19431/19432 closed (`ss` no row; `curl` exit
  7 both); no `chromium` / `http.server` processes on the host at that instant.
  The concurrent audit lane (ports 19621/19622/19631) and this lane never shared
  a port (reports/r4-aud-tab1.md §6 records the same).
- Context: the first dispatch's runs ended 16:08:47–16:10:36Z and the user
  session was OOM-killed at 16:10:59Z (plans/round-4-record-draft.md:147-176);
  the first dispatch's own closure lines are in its driver.logs, and this sweep
  re-verified the whole package afterwards.

## 7. Rules delta — what an async step adds to the envelope

Extends r2's rules (live-dynamic-capture.md:151-173) and r3's per-step patterns
(multi-step-journey.md §6):

1. **Hold the async request at the protocol layer** (Fetch, Request stage) so
   "pre-settle" is a stable class, not a race; release explicitly and record
   pause → release → release-to-response.
2. **Pre predicate = DOM state AND hold-seen** (two surfaces); **post predicate =
   payload-derived DOM content** (not timers, not an xhr flag).
3. **Capture the response body and pin its sha against the fixture** — then
   "DOM text ← payload bytes" is a check, not a story (r3 captured no bodies).
4. **Name the initiator class from the CDP `type` field** (`XHR` vs `Fetch`) —
   a cheap discriminator pinned in the record itself.
5. **Measure the natural window before trusting any wait** (here: release→
   response 1–2 ms vs capture cost 57–123 ms).
6. **Keep both network surfaces AND the cache-class caveat**: the wire path of
   repeats varied run-to-run with capture bytes fixed (§5; audit corroboration).

## 8. Unknowns (do not convert to claims without a new probe)

1. The un-held window was not directly captured; "a time-based pre-settle capture
   would race" is inference from the released round trip (1–2 ms) vs the capture
   cost (§3.2), not a measured failure.
2. Why W-run1 and W-run2 (identical setup, fresh copies) differ in `style.css`
   revalidation count (4 vs 1), and why re-aged runs show 0 — mechanism
   unexamined; the mtime/heuristic-freshness candidate is correlational only.
3. Cache tier of the repeats (`fromDiskCache:false` throughout) — as r3 §8.1.
4. `pausedToPreCapture` variance (~2×) on this host; a loaded-host timing
   envelope (poll timeouts, capture cost) untested (r2 §7.4 stands).
5. Post-predicate behavior under a JS error after a successful response — design
   expects a loud poll timeout; not adversarially tested.
6. Byte-identity generality beyond this host/build/font stack (r2 §7.3 stands).
7. `::marker` / pseudo-node hollow encoding beyond the observed instances (r2
   §7.5) — 3 more instances here, same encoding.
8. Which fixture branch the round admits (R4-1 keeps `confirm.html` = r3 bytes;
   R4-2 revises it) — a round-level reconciliation question
   (plans/round-4-record-draft.md:112-115), not this note's call.

## 9. Errata (append-only — never edit above blocks)

*(none yet)*

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `577af06bd9a8758e4c74e7d1df02e5d2dea78518d2af7801931e8b789a34db48`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §1 fixture 8/8 + runner/driver pins; file pin held.** `async.html` `f23dc1099a6c` / `confirm.html` `97ed8bfd06af` / `routes.json` `b283adae1880` + the five r3-equal files `42d7a35b82be` / `353d8107a072` / `50d811502ef8` / `6380986105b3` / `bf141027b3ef`; runner `journey-async.mjs` `06fa6e5ce5bf…`; `journey-r3.mjs` `b52074a33876…` (`/tmp/tabi-r4-2-async/`); re-verification `driver.sh` `8fddda9e…` — all match §1. This note's hash → `577af06bd9a8…` (278). Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).