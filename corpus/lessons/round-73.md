# tabi — round 73

L1 `TabiR73`, attempt 1. Base `d7ff9f190260d91a1e675f474b7abf79960cdfd4` (lane clean, `ahead=0 behind=0`;
no earlier attempt of r73 in `.ufo/watchdog.log`, nothing inherited).

Round 72 was rejected as an honest stop (MANIFEST; spot-check
`corpus/lessons/round-72-verifier-spotcheck.md`): leg (c) red on the receipt-relative battery case
`in-wheel-anchor-2px` (routed defect 1), and legs (a)/(b) could be met by a replayed pre-freeze
receipt (routed defect 2). Round 71 was rejected on leg (b); round 70 was admitted. Fresh-start
reading before the claim (prompt "Run15 renewed current-pause authorization", tabi r63 line): the
r60–r62 root failures (K7 no-regression conjunct, post-scoring instrument changes, M5 AND→OR
survivor, contradictory duplicate/fabricated dispositions) and the r71/r72 spot-checks.

Pre-freeze instruments and executed controls `ae2628af`; freeze `d7387fb3`
(`.ufo/waves/round-73/claims.json`); digests commit D `3409ab53` (`.ufo/waves/round-73/freeze.txt`).

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0,
179 rows (`.ufo/waves/round-73/census/start.txt`).

Claim: C1 coverage — capability `chromium-synth-pinch-gesture-linux` on generation r73
(sourced: S180–S183, new this round). One claim only.

## Gate

### Sources — new rows

All four fetched by the L1 on 2026-11-06 21:23:18–21:23:35 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(HTTP 200, base64 decoded; decoded copies and sha256 in `.ufo/waves/round-73/sources/`,
`FETCH.txt`). `grep -c 'web_mouse_wheel_event\|web_input_event_conversion\|wheel_event.cc' corpus/SOURCES.md`
was 0 before the append. Each row: tier A, kind `code`, status `mined`, recheck `on-release`,
used-by the round-73 note and this lesson.

- **S180** `third_party/blink/common/input/web_mouse_wheel_event.cc` (143 lines, sha256
  `c00b3bf7…a70ad`). Located quote (line 104): "return delta_y / frame_scale_;"
- **S181** `third_party/blink/renderer/core/events/wheel_event.cc` (187 lines, sha256
  `5f43b8a5…9ec1`). Located quote (line 111): "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio()),"
- **S182** `third_party/blink/renderer/core/events/web_input_event_conversion.cc` (318 lines,
  sha256 `31a6868e…ff3b`). Located quotes (line 62): "scale = root_view->InputEventsScaleFactor();"
  and (line 132): "result.SetFrameScale(FrameScale(frame_view));"
- **S183** `third_party/blink/renderer/core/frame/local_frame_view.cc` (5,822 lines, sha256
  `146aa4c1…4809`). Located quote (lines 1995–1997): "float page_scale = frame_->GetPage()->GetVisualViewport().Scale(); return page_scale * frame_->GetPage()->GetChromeClient().InputEventsScaleForEmulation();"
- Rejected source: `third_party/blink/renderer/platform/widget/input/widget_base_input_handler.cc`
  (fetched the same minute, HTTP 200, 673 lines) — opened while looking for the frame-scale
  stamp; it routes events but does not set the wheel's frame scale; no row, copy deleted.
- No status, recheck or used-by cell of an existing row changed.

### Admitted

- `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` (cites S180–S183; S179 and
  S173–S178 by reference): the Blink half of the ctrl+wheel delta law. Sourced: the DOM `deltaY`
  is −delta_y ÷ (visual-viewport page scale × emulation input scale) ÷ devicePixelRatio
  (S182 → S183 → S180 → S181). Measured: Σ deltaY × scale = −100 ln(scaleFactor) within
  4.2×10⁻⁵ on all 36 leg sums of the nine pre-freeze runs. The emulation factor (=1) stays
  marked inference.

### Rejected (with flip conditions)

- **"The page-scale division of a pinch wheel's deltaY is inference"** (the round-72 note's
  limit line) — reject as now stale: S180–S183 source it at this tag. The round-72 note is kept
  as landed; the round-73 note supersedes that one line. Flip: a Chromium tag where
  `DeltaYInRootFrame` no longer divides by the frame scale.
- **"InputEventsScaleForEmulation() is 1 on this host" as a sourced statement** — reject as
  sourced (kept as measured inference): the ChromeClient implementation was not opened this
  round. Flip: open the implementation at this tag and quote it (routed to R73Scout).
- `widget_base_input_handler.cc` as a source row — rejected (above, no frame-scale stamp).

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a repetition result read from whichever parallel stream printed: a backgrounded stream died silently and its receipts looked "not yet reported" rather than red | the first pre-freeze evaluation of smoke2–9 ran as two streams; the stream for smoke2–5 was started with `( … & )` inside a tool call and produced no output files; the other stream printed four green lines (smoke6–9). `.ufo/waves/round-73/lesson-proof/prefreeze-summary-streamA-lost.{txt,exit,json}` is the fail-closed summary on that state (exit 1, 5/9; captured while the re-run of smoke2–5 had begun, so smoke2/smoke4 already show a counter line and nothing else) | QUALITY 135 says every receipt, but no instrument enforced the enumeration | QUALITY 137 + `controls/c1/prefreeze-summary.mjs` (enumerates smoke1..9, missing = red); shown able to fail on the lost-stream state (exit 1) and green after the re-run (exit 0, 9/9, `controls/c1/prefreeze-summary.json`); the freeze cites only the summary |
| the replay guard's prior set held only the current generation, so a previous-generation receipt with four identity labels changed is not a replay to the counter, and the frozen limit sentence priced the escape as a full identifier rewrite | R73Critic F4/F5: the r72 scored receipt and r72 smoke1 with schema, nonce, nonceOnPage, driverSha256 relabelled pass the frozen counting command, exit 0 (`.ufo/waves/round-73/lesson-proof/forge-r72-relabel.pre-only.json`, `forge-legb-r72smoke1.pre-only.json`, rebuilt from committed bytes by `w1/R73Critic/forge-build.mjs`) | QUALITY 136 named same-generation replays only | QUALITY 138; shown able to fail (pre-only exit 0) and green with the 87 committed r71/r72 receipts as priors (`*.crossgen.json`, exit 1, three replay ids), honest r73 receipts still clean (`scored/c1-counter-{a,b}-crossgen.json`); SCORECARD `## Round 73` correction restates the limit |
| a control script resolved its lane root one directory short and read the driver from `.ufo/scripts/` | first run of `controls/c1/controls-c1.mjs`: `ENOENT … tabi-shokunin/.ufo/scripts/chrome-cdp-synthpinch-round73.mjs` | the script fails loudly on a missing file (it never fell back to a default pin), so the defect could not produce a verdict | resolved to the lane root (`'../../../../..'`); the committed `controls-summary.json` records `driverSha256` equal to `freeze.txt` |
| (carried) r72 counter accepted a call without `--expect-driver-sha256` (R72Review1 FG5) and without any replay binding | r72 selftest ran the counter pin-less (`scripts/selftest-r72-gates.mjs`, `no-receipt` case) | QUALITY 136 (replays) | r73 counter requires pin, nonce and ≥1 prior: `controls-summary.json` `donothing-no-flags` exit 2 `usage` |

### Sources — opened after the freeze (frontier, not the claim's grounding)

- **S184** `third_party/blink/renderer/core/inspector/dev_tools_emulator.cc` (740 lines, sha256
  `04b915b7…2ec5`), **S185** `content/browser/devtools/protocol/emulation_handler.cc` (1,393 lines,
  sha256 `0a98879f…ec43`), **S186** `third_party/blink/renderer/core/page/chrome_client_impl.cc`
  (1,602 lines, sha256 `dadba314…eee`). Located by R73Scout (`w1/R73Scout/report.md` §3–4); re-opened
  by the L1 2026-11-06 22:46:01–22:46:08 -03:00 (same URL form, HTTP 200; `sources/FETCH.txt`).
  - S184 (lines 599–601): "float DevToolsEmulator::InputEventsScaleForEmulation() { return device_metrics_enabled_ ? emulation_params_.scale : 1.0; }"
  - S185 (line 793): "params.scale = scale.value_or(1);"
  - S186 (lines 669–672): "return web_view_->GetDevToolsEmulator()->InputEventsScaleForEmulation();"
  These turn the note's "emulation factor = 1" from inference into a sourced statement. They are
  not cited by the frozen claim (its `sourced` field names S180–S183) and are not counted for it.
- Transport copies: the first-fetch `.b64` files were deleted before the pre-freeze commit
  (R73Scribe F5, QUALITY 67); re-fetched at 22:46:51, each decoded byte-identical to the staged
  copy (`cmp` exit 0), encoded sha256 recorded in `FETCH.txt`.
- Row cell changed old→new (same round it was added): S182 anchor "decoded lines 56-65 … 127-134"
  → "decoded lines 57-65 … 128-135" (R73Scribe F2; quoted lines 62 and 132 unchanged).

## Attack findings (wave w1, 11 seats, 0 dead) — not amended; instruments stay as frozen

- **R73Exec1 (HOLDS):** pins equal `freeze.txt`; leg (b) cold run, nonce `tabi-r73-exec1-3409ab53b905`,
  driver exit 0, counter exit 0 clean 98; battery 228/228 on the (a) receipt and on its own; kill
  power on (a) holds (98/98, 19/19).
- **R73Exec2 (HOLDS):** 3 more cold runs, counter 3/3 clean, battery 3/3 228/228; honest spread on
  the law ~1e-4 against a ±0.5 tolerance.
- **R73Review1 (FINDINGS):** 48 crafted receipts; the r73 surface holds (every replay keeping ≥1
  identifier refused; all five nonce carriers bound; argv fails closed). Open, inherited and inside
  the umbrella limit: 14 receipt-content false greens (FG2–FG12 class). §1.4: one 1e-12 perturbation
  of one `ts`/`at` (with fresh token and browser id) defeats the timeline check (SCORECARD correction).
- **R73Review2 (HOLDS):** battery re-run on smoke2/3/6 byte-identical to the committed pf outputs;
  219/219 refuse/laundered cases fire their expected id on 9/9 receipts; each new semantic mutant dies
  for its intended case.
- **R73Review3 (HOLDS):** commit order ae2628af → d7387fb3 → D 3409ab53 → c44fcf6f; all six pins equal
  at D and tip; the (a) nonce appears in no file before D; before/after re-run.
- **R73Critic (FALSIFIED — the limit sentence, not the legs):** F4/F5 relabel r72 receipts with four
  identity fields and pass the frozen counting command (Mistakes row 2, QUALITY 138, SCORECARD
  correction); legs (a)–(c) and the `sourced` field reproduce; coverage naming true.
- **R73Mut1 (FINDINGS):** 38 new semantic mutants, 15 killed / 23 survived; 21 survivors carry an
  acceptance witness (`w1/R73Mut1/receipts/probes.json`), 2 equivalent. Battery coverage debt for r74;
  the frozen kill-power result (19/19) is not contradicted.
- **R73Scout (FINDINGS):** S180–S183 re-fetched byte-identical (`cmp` 0, 2026-11-07T01:24:30Z); every
  anchor lands; located S184–S186 (above).
- **R73Connector (FINDINGS, verdict adjacent):** no sibling carries S180–S183's files or symbols;
  overlap none on the r73 ground; no duplicate-URL risk.
- **R73Scribe (CONFIRMED):** every number and quote in the note re-derived; F1–F5 applied (commanded
  vs achieved factor wording, S182 line spans, "do not vary" → 8.5×10⁻⁵, emulation label, `.b64`).
- **R73Revenger (HOLDS):** none of the eight r60–r72 root failures repeated; SCORECARD/SHONEN
  self-assessment 0 contradicted, 8/8 SHONEN pointers resolve.

## Round-72 routed defects

1. Absolute anchor case + every-repetition battery/kill power (QUALITY 135): closed — cases
   `in-wheel-anchor-abs-402/-398`, `default-wheel-anchor-abs-y302`, `wheel-anchor` = 405,
   `accept-in-anchor-abs-401`; 9/9 pre-freeze receipts (`prefreeze-summary.json`).
2. Replay hole (QUALITY 136): closed for same-generation replays (controls + battery + selftest);
   the cross-generation relabel stays open (QUALITY 138, routed to r74).
3. Carry-overs: R72Review1 FG1 and FG5 closed (R73Review1 §5); FG2–FG12 open (inside the limit);
   R72Mut1's 13 survivors re-targeted by R73Mut1 (part of its 23); R72Scout R3 rows, r71 R2 verifier
   hardening, R4/R5 routed on.
4. SHONEN promotion is operator-owned; boxes stay `[~]`.
