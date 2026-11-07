FINDINGS

# R73Scout — S180–S183 independently opened, and the emulation factor sourced

Seat: R73Scout (scout). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `d7ff9f190260d91a1e675f474b7abf79960cdfd4`,
round 73 / wave w1. No git or jj mutation was performed (`git -C <lane> status --porcelain` exit 0; HEAD `c44fcf6f11fe549e8585e073e1cfad66dc2e2cbb`).
No production, lane-root, fleet or sibling file was written. Nothing was delegated.

## 0. What this seat answers

Two questions from the assignment:

1. Do the L1-staged copies of S180–S183 match what chromium.googlesource.com serves at tag `155.0.8059.84`, and
   are the anchors cited in `corpus/SOURCES.md` rows S180–S183 and in
   `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` on the lines they claim?
2. Where is `InputEventsScaleForEmulation()` implemented for the headless/content embedder at this tag, and is it 1
   when `Emulation.setDeviceMetricsOverride` sets no `scale`? (The knowledge note still carries this as inference.)

**Answer in one line:** all four sources re-fetch clean and byte-identical, every cited anchor lands on the cited
lines, and the remaining inference is now **sourced and measured**: with no `scale` in the override the browser
fills `scale = 1` (`content/browser/devtools/protocol/emulation_handler.cc:793`), and Blink's
`DevToolsEmulator::InputEventsScaleForEmulation()` therefore returns `emulation_params_.scale` = **1**
(`third_party/blink/renderer/core/inspector/dev_tools_emulator.cc:599-601`).

## 1. Independent re-fetch of S180–S183 (this session)

Method, exactly the URL form the assignment names:

```
curl -sS -o <f>.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT' \
  && base64 -d <f>.b64 > <f>
```

Access window: **2026-11-07T01:24:30Z – 2026-11-07T01:24:33Z** (2026-11-06 local, host at -03:00). Raw log:
`.ufo/waves/round-73/w1/R73Scout/fetch.log`. All four HTTP **200**.

| id | path | sha256 (this fetch) | lines | staged sha256 | staged lines | `cmp` exit |
|---|---|---|---|---|---|---|
| S180 | `third_party/blink/common/input/web_mouse_wheel_event.cc` | `c00b3bf7ce4a1c98fe8831a65ab0575404b9ecd597199a5613b94cb2e19a70ad` | 143 | `c00b3bf7…a70ad` | 143 | **0** (identical) |
| S181 | `third_party/blink/renderer/core/events/wheel_event.cc` | `5f43b8a50b309326591a50dfd0082bfb6abdff3ef28c15ebb598c14ca55f9ec1` | 187 | `5f43b8a5…9ec1` | 187 | **0** (identical) |
| S182 | `third_party/blink/renderer/core/events/web_input_event_conversion.cc` | `31a6868e310628d19ef056e9d4d491fe673b1e866817b4e8f88cfe9f3ca0ff3b` | 318 | `31a6868e…ff3b` | 318 | **0** (identical) |
| S183 | `third_party/blink/renderer/core/frame/local_frame_view.cc` | `146aa4c1f6224462e73b5ccebbb29927481f68cf74ceabdff98fb42f3ce74809` | 5822 | `146aa4c1…4809` | 5822 | **0** (identical) |

`cmp` was run twice (once with output, once with `-s` for the exit code): exit 0 every time. Machine receipt:
`.ufo/waves/round-73/w1/R73Scout/source-verification.json`.

The staged copies' own digests also match the digests the L1 recorded in
`.ufo/waves/round-73/sources/FETCH.txt` (`c00b3bf7…`, `5f43b8a5…`, `31a6868e…`, `146aa4c1…`) and the four
digests quoted in the `SOURCES.md` rows — so the S180–S183 rows' `sha256` fields are independently reproduced, not
merely copied.

## 2. Anchor check — every quote lands on the line the row/note claims

Quoted text below is verbatim from the fetched files; line numbers are the fetched files' own numbering.

### S180 — `web_mouse_wheel_event.cc`
Row S180 cites "decoded lines 99-105 (DeltaXInRootFrame / DeltaYInRootFrame return delta / frame_scale_), 107-113
(FlattenTransform divides both deltas by frame_scale_)". Verified:

- `web_mouse_wheel_event.cc:99-101` — "float WebMouseWheelEvent::DeltaXInRootFrame() const { return delta_x / frame_scale_; }"
- `web_mouse_wheel_event.cc:103-105` — "float WebMouseWheelEvent::DeltaYInRootFrame() const { return delta_y / frame_scale_; }"
- `web_mouse_wheel_event.cc:107-113` — "WebMouseWheelEvent WebMouseWheelEvent::FlattenTransform() const { … result.delta_x /= result.frame_scale_; result.delta_y /= result.frame_scale_; … }"

Note §"Sourced" item 3 quotes `web_mouse_wheel_event.cc:103-105` as "return delta_y / frame_scale_;" — that is line
**104**, inside the cited range. **On anchor.**

### S181 — `wheel_event.cc`
Row S181 cites "decoded lines 104-114 (WheelEvent from WebMouseWheelEvent: delta_y_ = -event.DeltaYInRootFrame() /
window.devicePixelRatio())". Verified:

- `wheel_event.cc:110` — "delta_x_(-event.DeltaXInRootFrame() / window.devicePixelRatio()),"
- `wheel_event.cc:111` — "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio()),"

Note §"Sourced" item 4 quotes `wheel_event.cc:110-111` with the `delta_y_` expression — that expression is line
**111**, inside the cited range. **On anchor.**

### S182 — `web_input_event_conversion.cc`
Row S182 cites "decoded lines 56-65 (FrameScale returns root_view->InputEventsScaleFactor(), default 1), 127-134
(TransformWebMouseWheelEvent sets SetFrameScale(FrameScale(frame_view)))". Verified:

- `web_input_event_conversion.cc:57-65` — "float FrameScale(const LocalFrameView* frame_view) { float scale = 1; … scale = root_view->InputEventsScaleFactor(); … }" (default `scale = 1` at line 58; the quoted `scale = root_view->InputEventsScaleFactor();` at line **62**)
- `web_input_event_conversion.cc:132` — "result.SetFrameScale(FrameScale(frame_view));"

Note §"Sourced" item 1 quotes `web_input_event_conversion.cc:127-134` for the `SetFrameScale(FrameScale(frame_view))`
stamp — the statement is at line **132**, inside the cited range. **On anchor.**

*Range-boundary nit (not a misquote, both cited ranges still contain the quoted statement):* the function
`TransformWebMouseWheelEvent` actually spans **128-135** (line 127 is blank, line 135 is its closing brace), and
`FrameScale` actually spans **57-65** (line 56 is the enclosing `namespace {`). S182's "127-134" and the note's
"lines 56-65" are each one line short at one edge. If the L1 wants exact function spans, write "128-135" and
"57-65". No cited quote is misplaced.

### S183 — `local_frame_view.cc`
Row S183 cites "decoded lines 1994-1998 (InputEventsScaleFactor = GetVisualViewport().Scale() *
GetChromeClient().InputEventsScaleForEmulation())". Verified exactly:

- `local_frame_view.cc:1994-1998` — "float LocalFrameView::InputEventsScaleFactor() const { float page_scale = frame_->GetPage()->GetVisualViewport().Scale(); return page_scale * frame_->GetPage()->GetChromeClient().InputEventsScaleForEmulation(); }"

Note §"Sourced" item 2 quotes `local_frame_view.cc:1994-1998` with "float page_scale =
frame_->GetPage()->GetVisualViewport().Scale();" — that is line **1995**. **On anchor.** The row's own note that
this file is 5,822 lines and that only 1994-1998 are mined is correct (wc -l = 5822).

**Net: zero off-anchor anchors across S180–S183 and the knowledge note.** The only deviations found are the two
one-line range-edge imprecisions above.

## 3. The emulation factor — sourced end to end

### 3.1 Where it is implemented for the headless/content embedder

`InputEventsScaleForEmulation()` is declared on Blink's `ChromeClient` and implemented in three places:

1. `third_party/blink/renderer/core/page/chrome_client.h:376-378` — the base-class default:
   > "virtual float InputEventsScaleForEmulation() const { return 1; }" (line 378)

2. `third_party/blink/renderer/core/page/chrome_client_impl.cc:669-672` — the implementation actually used:
   > "float ChromeClientImpl::InputEventsScaleForEmulation() const { DCHECK(web_view_); return web_view_->GetDevToolsEmulator()->InputEventsScaleForEmulation(); }"

3. `third_party/blink/renderer/core/inspector/dev_tools_emulator.cc:599-601` — where the number comes from:
   > "float DevToolsEmulator::InputEventsScaleForEmulation() { return device_metrics_enabled_ ? emulation_params_.scale : 1.0; }"

`ChromeClientImpl` is the right class for this host: Blink's own `WebViewImpl` constructs it unconditionally —
`third_party/blink/renderer/core/exported/web_view_impl.cc:585`:
> "chrome_client_(MakeGarbageCollected<ChromeClientImpl>(this)),"

and no embedder-specific `ChromeClient` subclass exists at this tag (grep of the full `chrome/browser` and
`chrome/renderer` trees for `public blink::ChromeClient` / `public ChromeClient` returned no ChromeClient
subclass — the only hit was an unrelated `ChromeClientSideDetectionHostDelegate`). So the desktop/headless
renderer in this Chromium uses Blink's `ChromeClientImpl`, i.e. path (2) → (3).

### 3.2 Why it is 1 when the override sets no `scale`

The chain, each link quoted from the fetched file:

- **Browser, CDP side.** `content/browser/devtools/protocol/emulation_handler.cc:793` — "params.scale = scale.value_or(1);"
  and `:725` — "if (scale.value_or(1) <= 0 || scale.value_or(1) > max_scale)". The CDP parameter is
  `experimental optional number scale` (`third_party/blink/public/devtools_protocol/domains/Emulation.pdl:286`),
  so when the client omits it the browser writes **1**. The r73 driver omits it:
  `scripts/chrome-cdp-synthpinch-round73.mjs:296` — "await send('Emulation.setDeviceMetricsOverride', { width:
  VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });"
  (driver sha256 `3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4`, matching the frozen digest).
- **Browser → renderer.** `content/browser/devtools/protocol/emulation_handler.cc:1169-1171` sends the params:
  "frame_widget->EnableDeviceEmulation(device_emulation_params_, cache_behavior);". The struct carries the scale:
  `third_party/blink/public/mojom/widget/device_emulation_params.mojom:35` — "float scale;".
- **Renderer, emulation applied.** `third_party/blink/renderer/core/frame/web_frame_widget_impl.cc:2472-2489`
  `EnableDeviceEmulation` → `device_emulator_->ChangeEmulationParams(parameters, cache_behavior)`;
  `third_party/blink/renderer/core/frame/screen_metrics_emulator.cc:136-140` copies the params (only
  `device_scale_factor` is replaced by the real screen's; `scale` is preserved) and calls
  `SetScreenMetricsEmulationParameters(true, …)`.
- **Renderer → Blink emulator.** `web_frame_widget_impl.cc:5310-5318` → `View()->ActivateDevToolsTransform(params,
  cache_behavior)`; `third_party/blink/renderer/core/exported/web_view_impl.cc:3564-3570` → "gfx::Transform
  device_emulation_transform = dev_tools_emulator_->EnableDeviceEmulation(params, cache_behavior);";
  `third_party/blink/renderer/core/inspector/dev_tools_emulator.cc:327-328` — "emulation_params_ = params;
  device_metrics_enabled_ = true;".
- **Read back.** `dev_tools_emulator.cc:599-601` returns `device_metrics_enabled_ ? emulation_params_.scale : 1.0`
  — with device metrics enabled, that is the browser's `scale`, i.e. **1**.

Note the `else` branch is also 1.0, so *both* the "override absent" and "override present without `scale`" cases
give 1; only an explicit `scale` ≠ 1 changes the factor.

For Chromium desktop the `Emulation` domain is served by **content's** handler, not Chrome's: Chrome's own
`chrome/browser/devtools/protocol/emulation_handler.cc` is generated for a restricted command subset — its
`inspector_protocol_config.json:34-35` lists `"domain": "Emulation", "include": ["disable",
"setAutomationOverride", "getScreenInfos", "addScreen", "removeScreen", "updateScreen", "setPrimaryScreen"]`
— and `setDeviceMetricsOverride` is not in that list; Chrome's handler returns `Response::FallThrough()` for
commands it does not own. Content's handler is the one registered per page target
(`content/browser/devtools/render_frame_devtools_agent_host.cc:416-417` — "auto* emulation_handler =
session->CreateAndAddHandler<protocol::EmulationHandler>();"). This matters because it fixes *which* file owns
the `scale.value_or(1)` default.

### 3.3 Measured, on this host, this session

Two cold `chromium 155.0.8059.84 --headless=new` launches of my own (own `--user-data-dir`, own loopback ports,
own `data:` fixture; scratch under `/fast/scratch/hyaku/tabi-r73/R73Scout`; no lane file touched). Receipts:
`.ufo/waves/round-73/w1/R73Scout/probe-emu-scale.json`, `.ufo/waves/round-73/w1/R73Scout/probe-page-scale.json`;
probe sources `probe-emu-scale.mjs`, `probe-page-scale.mjs` beside them. Both probes exited 0 with `"failures": []`.

**Probe A — the emulation factor** (one synthetic `Input.dispatchMouseEvent` mouseWheel of `deltaY: 100` per
config, reading the page's `event.deltaY`):

| config | `Emulation.setDeviceMetricsOverride` | page `event.deltaY` | dpr | page scale |
|---|---|---|---|---|
| no-override | (none) | **100** | 1 | 1 |
| override-no-scale | `width 1280, height 900, deviceScaleFactor 1, mobile false` | **100** | 1 | 1 |
| override-scale-1 | same + `scale: 1` | **100** | 1 | 1 |
| override-scale-2 | same + `scale: 2` | **50** | 1 | 1 |

Reading: with no `scale`, the DOM delta is undivided → the frame-scale divisor is 1 (emulation factor 1). With
`scale: 2` the DOM delta is **halved** → the emulation factor enters the divisor exactly as S183 says
(`page_scale × emulation_scale`), because `web_mouse_wheel_event.cc:104` divides by `frame_scale_` and
`wheel_event.cc:111` divides by `devicePixelRatio`. This is direct evidence that the term the r73 note left as
inference is real, multiplicative, and equals 1 for the driver's call.

**Probe B — the page-scale term** (`Emulation.setPageScaleFactor`):

| requested page scale | page `event.deltaY` | cssVisualViewport.scale |
|---|---|---|
| 1 | 100 | 1 |
| 2 | 50 | 2 |
| 4 | 25 | 4 |

Both factors are confirmed independently on this host: `|deltaY| = |delta_y| ÷ (pageScale × emulationScale) ÷ dpr`,
with dpr = 1 throughout.

**Scope of the probes:** they isolate the divisor with `Input.dispatchMouseEvent`, not with
`Input.synthesizePinchGesture` (the r73 driver's own path). The factor under test — the frame scale stamped on
the wheel event and divided out at `web_mouse_wheel_event.cc:104` — is the same code path for both, since S179's
pinch stream reaches the DOM as wheel events. Probes A/B therefore source and measure the *factor*, not the
pinch's `delta_y = 100 ln(update scale)` (S179, out of this seat's scope). Probes used dpr 1 throughout and did
not vary `deviceScaleFactor`; the `÷ devicePixelRatio` term remains sourced-only (`wheel_event.cc:111`).

### 3.4 What this does to the r73 knowledge note

The note currently says (§"Still inference", lines 34-36):

> "**Still inference:** that `InputEventsScaleForEmulation()` is 1 on this host. The driver sets
> `Emulation.setDeviceMetricsOverride` without a `scale` parameter and the measured law below holds to 4×10⁻⁵,
> which is what a factor of 1 predicts; the ChromeClient implementation was not opened."

and (§Limits) "Sourced only at this tag; the emulation factor is measured as 1, not sourced."

Both are now closable **by the L1** (I did not edit `corpus/knowledge/`). Proposed replacement text for the
knowledge note, for the L1 to apply:

> **Now sourced:** `InputEventsScaleForEmulation()` is 1 on this host. `ChromeClientImpl` delegates to
> `DevToolsEmulator::InputEventsScaleForEmulation()`, which returns `device_metrics_enabled_ ?
> emulation_params_.scale : 1.0`; the browser fills `scale = scale.value_or(1)` when the CDP `scale` parameter is
> absent, and the r73 driver omits it. Measured: an explicit `scale: 2` halves the DOM wheel delta, so the
> factor is a real divisor.

And for §Limits: "Sourced only at this tag; the emulation factor is now sourced (not merely measured): it is 1
because the driver sends no `scale`."

The note's arithmetic is unaffected — the law's divisor was already written as "page scale × emulation scale";
only the emulation term's provenance changes from inference to source.

## 4. Proposed registry rows (NOT applied — the registry is not mine to edit)

Per the SOURCES contract (id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used-by),
two rows close the gap; the L1 decides whether to add them.

**S184 — the renderer-side implementation**

| field | value |
|---|---|
| id | S184 |
| source | Chromium 155.0.8059.84 Blink DevToolsEmulator source — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/dev_tools_emulator.cc?format=TEXT |
| kind | code |
| tier | A |
| scope | what the emulation input scale is at this tag: device metrics enabled ⇒ the override's `scale`, else 1; not the wheel-delta division itself (S180, S181) |
| anchor | decoded lines 599-601 ("float DevToolsEmulator::InputEventsScaleForEmulation() { return device_metrics_enabled_ ? emulation_params_.scale : 1.0; }"), 327-328 (emulation_params_ = params; device_metrics_enabled_ = true); delegating implementation chrome_client_impl.cc:669-672; base default chrome_client.h:378; raw-fetch sha256 `04b915b721aef13d…` (740 lines), chrome_client_impl.cc `dadba3147698c005…` (1602), chrome_client.h `cd3f206f9fe9f018…` (688); fetched 2026-11-06/07 |
| teaches | the emulation factor is the device-metrics override's `scale`, and is 1 whenever that parameter is absent — so the frame-scale divisor is the visual-viewport page scale alone unless the client asks otherwise |
| status | mined |
| opened | 2026-11-06 |
| recheck | on-release |
| used-by | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md |

**S185 — the browser-side default that makes it 1**

| field | value |
|---|---|
| id | S185 |
| source | Chromium 155.0.8059.84 content DevTools Emulation handler — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/emulation_handler.cc?format=TEXT |
| kind | code |
| tier | A |
| scope | where `Emulation.setDeviceMetricsOverride` turns an absent `scale` into 1 in the browser, and that content's handler (not Chrome's restricted Emulation subset) serves the command; not Blink's frame-scale arithmetic (S184) |
| anchor | decoded line 793 ("params.scale = scale.value_or(1);"), 725 (same default in the range check); `third_party/blink/public/mojom/widget/device_emulation_params.mojom:35` ("float scale;"); `third_party/blink/public/devtools_protocol/domains/Emulation.pdl:286` ("experimental optional number scale"); raw-fetch sha256 `0a98879f3e17e9aa…` (1393 lines), device_emulation_params.mojom `d6f0e453e84db0fb…` (62), Emulation.pdl `c835f60fe9582cfa…` (695); fetched 2026-11-06/07 |
| teaches | a CDP device-metrics override without `scale` is normalised to 1 in the browser before it reaches the renderer, so the renderer never sees an undefined emulation scale |
| status | mined |
| opened | 2026-11-06 |
| recheck | on-release |
| used-by | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md |

If the L1 prefers one row, S185 can be folded into S184's anchor cell, but two rows keep "who owns the default"
(S185, browser) separate from "what the factor is" (S184, renderer).

## 5. Findings the L1 should act on

1. **The remaining inference in the r73 knowledge note is now sourced** (§3) and measured (§3.3). Apply the
   proposed wording — the L1 owns `corpus/knowledge/`.
2. **Two one-line range-edge imprecisions in S182 / the note** (§2): `TransformWebMouseWheelEvent` is 128-135
   (row says 127-134) and `FrameScale` is 57-65 (row/note say 56-65). Both cited quotes remain inside the cited
   ranges, so no quote is off-anchor; tighten only if the L1 wants exact spans.
3. **Add S184 and S185** (§4) if the round admits the extra rows; they are what turn "the emulation factor is
   measured as 1" into "sourced as 1".
4. **Nothing in the C1 predicate, counter, pins or kill rule was examined or touched.** This seat only read
   `scripts/chrome-cdp-synthpinch-round73.mjs:296` (one line, to confirm the driver omits `scale`) and confirmed
   its sha256 `3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4` matches the frozen digest; the
   counter's sha256 `3104101a9ac8b0cd09337a870139653f7a64cfb7eb65067daf389119ce20d4d1` likewise matches.

## 6. Remaining unknowns (not closed by this seat)

- The `÷ devicePixelRatio` term was not varied (all probes at dpr 1); it stays sourced-only (`wheel_event.cc:111`).
- The probes exercised the wheel path via `Input.dispatchMouseEvent`, not `Input.synthesizePinchGesture`; the
  pinch's own `delta_y = 100 ln(update scale)` (S179) was not re-measured here.
- `deviceScaleFactor` was held at 1, so the interaction between the compositor device scale and
  `modified_emulation_params.device_scale_factor` (`screen_metrics_emulator.cc:137-138`) was not exercised.
- Whether the L1's r73 counter/driver receipts need to change: none — the driver's behaviour is unchanged; only
  the note's provenance wording and possibly the registry need edits.

## 7. Reproduction commands (all run from this seat's scratch, all absolute paths)

```
curl -sS -o <f>.b64 -w '%{http_code}' \
 'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/common/input/web_mouse_wheel_event.cc?format=TEXT'
cmp <fetched> /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-73/sources/web_mouse_wheel_event.cc   # exit 0
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-73/w1/R73Scout/probe-emu-scale.mjs <scratch> <out.json>    # exit 0
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-73/w1/R73Scout/probe-page-scale.mjs <scratch> <out.json> # exit 0
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain    # exit 0, read-only
```

## 8. Tooling

No tool was installed, upgraded or removed this session; every command used software already on the host
(`curl`, `base64`, `cmp`, `sha256sum`, `node` v24.21.0, `/usr/bin/chromium` 155.0.8059.84). No pacman transaction
was attempted. Nothing was written outside
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-73/w1/R73Scout/` and my scratch
(`/fast/scratch/hyaku/tabi-r73/R73Scout`, deleted before yielding).
