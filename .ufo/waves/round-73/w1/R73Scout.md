FINDINGS

# R73Scout — S180–S183 independently opened, and the emulation factor sourced

Full report with all receipts: `.ufo/waves/round-73/w1/R73Scout/report.md` (and `source-verification.json`,
`fetch.log`, `probe-emu-scale.json`, `probe-page-scale.json`, `probe-emu-scale.mjs`, `probe-page-scale.mjs`
beside it). No git/jj mutation (`git -C <lane> status --porcelain` exit 0; HEAD `c44fcf6f11fe549e8585e073e1cfad66dc2e2cbb`).
No delegation. Nothing written outside my wave dir and my scratch.

## 1. Independent re-fetch of S180–S183 (this session)

`curl -sS -o <f>.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT' && base64 -d <f>.b64 > <f>`
— access window **2026-11-07T01:24:30Z – 01:24:33Z** (2026-11-06 local), all four **HTTP 200** (log:
`.ufo/waves/round-73/w1/R73Scout/fetch.log`).

| id | sha256 (this fetch) | lines | staged sha256 | staged lines | `cmp` exit |
|---|---|---|---|---|---|
| S180 web_mouse_wheel_event.cc | `c00b3bf7ce4a1c98fe8831a65ab0575404b9ecd597199a5613b94cb2e19a70ad` | 143 | `c00b3bf7…a70ad` | 143 | **0** identical |
| S181 wheel_event.cc | `5f43b8a50b309326591a50dfd0082bfb6abdff3ef28c15ebb598c14ca55f9ec1` | 187 | `5f43b8a5…9ec1` | 187 | **0** identical |
| S182 web_input_event_conversion.cc | `31a6868e310628d19ef056e9d4d491fe673b1e866817b4e8f88cfe9f3ca0ff3b` | 318 | `31a6868e…ff3b` | 318 | **0** identical |
| S183 local_frame_view.cc | `146aa4c1f6224462e73b5ccebbb29927481f68cf74ceabdff98fb42f3ce74809` | 5822 | `146aa4c1…4809` | 5822 | **0** identical |

The staged digests also match `.ufo/waves/round-73/sources/FETCH.txt` and the digests quoted in the
`SOURCES.md` rows: the rows' `sha256` fields are independently reproduced, not copied.

## 2. Anchor check — no off-anchor found

Every quote lands on the line its row/note claims (quotes verbatim, line numbers = fetched files):

- S180 `web_mouse_wheel_event.cc:99-101` "DeltaXInRootFrame … return delta_x / frame_scale_;" / `:103-105` "DeltaYInRootFrame … return delta_y / frame_scale_;" / `:107-113` FlattenTransform "result.delta_x /= result.frame_scale_; result.delta_y /= result.frame_scale_;" — note item 3's quote is line **104** ✓
- S181 `wheel_event.cc:110` "delta_x_(-event.DeltaXInRootFrame() / window.devicePixelRatio())," / `:111` "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio())," — note item 4's quote is line **111** ✓
- S182 `web_input_event_conversion.cc:57-65` FrameScale ("float scale = 1;" :58, "scale = root_view->InputEventsScaleFactor();" :62) / `:132` "result.SetFrameScale(FrameScale(frame_view));" — note item 1's quote is line **132** ✓
- S183 `local_frame_view.cc:1994-1998` "float page_scale = frame_->GetPage()->GetVisualViewport().Scale(); return page_scale * frame_->GetPage()->GetChromeClient().InputEventsScaleForEmulation();" — note item 2's quote is line **1995** ✓

*Range-edge nit only (quotes still inside the cited ranges):* `TransformWebMouseWheelEvent` actually spans
**128-135** (row says 127-134) and `FrameScale` **57-65** (row/note say 56-65).

## 3. The emulation factor — sourced end to end (the note's remaining inference)

Where it is implemented for the headless/content embedder at this tag:

- `third_party/blink/renderer/core/page/chrome_client.h:378` — base default "virtual float InputEventsScaleForEmulation() const { return 1; }"
- `third_party/blink/renderer/core/page/chrome_client_impl.cc:669-672` — "return web_view_->GetDevToolsEmulator()->InputEventsScaleForEmulation();"
- `third_party/blink/renderer/core/inspector/dev_tools_emulator.cc:599-601` — "return device_metrics_enabled_ ? emulation_params_.scale : 1.0;"

`ChromeClientImpl` is the class this host uses: Blink's own `web_view_impl.cc:585`
"chrome_client_(MakeGarbageCollected<ChromeClientImpl>(this))", and no embedder-specific `ChromeClient` subclass
exists at this tag (grep of the full `chrome/browser` + `chrome/renderer` trees for `public blink::ChromeClient` /
`public ChromeClient`: no ChromeClient subclass).

Why it is 1 with no `scale`: browser-side `content/browser/devtools/protocol/emulation_handler.cc:793`
"params.scale = scale.value_or(1);" (same default at `:725`); CDP param is
`experimental optional number scale` (`third_party/blink/public/devtools_protocol/domains/Emulation.pdl:286`); the
r73 driver omits it (`scripts/chrome-cdp-synthpinch-round73.mjs:296`, sha256 `3f0ffe24…59c4` = frozen digest).
Params cross to the renderer as `DeviceEmulationParams.scale` (`device_emulation_params.mojom:35` "float scale;"),
through `emulation_handler.cc:1169-1171` → `web_frame_widget_impl.cc:2472-2489` → `screen_metrics_emulator.cc:136-140`
(scale preserved; only `device_scale_factor` replaced) → `web_frame_widget_impl.cc:5310-5318` →
`web_view_impl.cc:3564-3570` → `dev_tools_emulator.cc:327-328` ("emulation_params_ = params; device_metrics_enabled_ = true;").
Read back at `dev_tools_emulator.cc:599-601` → **1**. (The `else` branch is also 1.0.)

For Chromium desktop, `setDeviceMetricsOverride` is served by **content's** handler, not Chrome's restricted
Emulation subset: `chrome/browser/devtools/inspector_protocol_config.json:34-35` includes only
"disable, setAutomationOverride, getScreenInfos, addScreen, removeScreen, updateScreen, setPrimaryScreen", and
content's handler is the one registered per page target
(`content/browser/devtools/render_frame_devtools_agent_host.cc:416-417`).

**Measured this session** (own cold headless chromium 155.0.8059.84, own profile/ports, `data:` fixture; both
probes exit 0, `"failures": []`; receipts beside this report):

| config | DOM `event.deltaY` for a dispatched deltaY 100 |
|---|---|
| no override | 100 |
| override without `scale` | 100 |
| override `scale: 1` | 100 |
| override `scale: 2` | **50** |
| page scale 2 (`Emulation.setPageScaleFactor`) | 50 |
| page scale 4 | 25 |

So the emulation factor is a real divisor and is **1** for the driver's call; both terms of
`|deltaY| = |delta_y| ÷ (pageScale × emulationScale) ÷ dpr` are now confirmed at dpr 1.

## 4. Proposed registry rows (NOT applied — registry is not mine to edit)

- **S184** Chromium 155.0.8059.84 Blink DevToolsEmulator source — `…/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/dev_tools_emulator.cc?format=TEXT` — code/A — scope: what the emulation input scale is at this tag (device metrics enabled ⇒ the override's `scale`, else 1) — anchor: lines 599-601 + 327-328, delegating impl chrome_client_impl.cc:669-672, base default chrome_client.h:378, sha256 `04b915b721aef13d…` / `dadba3147698c005…` / `cd3f206f9fe9f018…`, fetched 2026-11-06/07 — teaches: the emulation factor is the device-metrics override's `scale`, 1 whenever that parameter is absent — mined / 2026-11-06 / on-release / used-by corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md
- **S185** Chromium 155.0.8059.84 content DevTools Emulation handler — `…/refs/tags/155.0.8059.84/content/browser/devtools/protocol/emulation_handler.cc?format=TEXT` — code/A — scope: where an absent `scale` becomes 1 in the browser, and that content's handler (not Chrome's subset) serves the command — anchor: lines 793 + 725, `device_emulation_params.mojom:35`, `Emulation.pdl:286`, sha256 `0a98879f3e17e9aa…` / `d6f0e453e84db0fb…` / `c835f60fe9582cfa…` — teaches: a CDP device-metrics override without `scale` is normalised to 1 in the browser before reaching the renderer — mined / 2026-11-06 / on-release / used-by corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md

(S185 may be folded into S184's anchor cell if the round prefers one row.)

## 5. For the L1 to act on

1. The r73 knowledge note's "Still inference" (§lines 34-36) and §Limits "the emulation factor is measured as 1,
   not sourced" are now closable — proposed wording is in `w1/R73Scout/report.md` §3.4. I did not edit
   `corpus/knowledge/`.
2. Optional tightening: S182's "127-134" → "128-135" and "56-65" → "57-65" (§2 above); no quote is off-anchor.
3. Consider adding S184/S185 (§4).
4. Predicate, counter, pins and kill rule were not examined or touched; driver sha256 `3f0ffe24…59c4` and counter
   sha256 `3104101a…d4d1` both match the frozen digests.

## 6. Not closed by this seat

- `÷ devicePixelRatio` term not varied (dpr 1 throughout) — sourced-only (`wheel_event.cc:111`).
- Probes used `Input.dispatchMouseEvent`, not `Input.synthesizePinchGesture`; S179's `delta_y = 100 ln(update scale)`
  was not re-measured.
- `deviceScaleFactor` held at 1; the compositor/`modified_emulation_params.device_scale_factor` interaction
  (`screen_metrics_emulator.cc:137-138`) not exercised.

## 7. Tooling

No tool installed/upgraded/removed; only pre-existing `curl`, `base64`, `cmp`, `sha256sum`, `node` v24.21.0,
`/usr/bin/chromium` 155.0.8059.84. No pacman transaction. Scratch `/fast/scratch/hyaku/tabi-r73/R73Scout` deleted
before yielding.
