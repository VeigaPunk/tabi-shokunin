FINDINGS

**Verdict: adjacent — overlap none on the r74 ground.**

No sibling lane carries any of S187–S193's seven Chromium/Blink source files (`Input.pdl`, `input_handler.cc`, `input_method_controller.cc`, `event_target.cc`, `event_dispatcher.cc`, `scoped_event_queue.cc`, `editing_utilities.cc`), any of the core CDP IME commands (`Input.imeSetComposition`, `insertCompositionText`, `InputMethodController`, `DispatchScopedEvent`, `SetTrusted`), or any `keyCode 229` IME composition logic across all 20 sibling lanes at pinned heads.

What touches the search terms in sibling lanes is either:
1. **Explicit boundary refusal**: `mado-shokunin` affirmatively disclaims IME/text-input protocol behavior in `corpus/knowledge/input-debugging-boundaries-r15.md:61-62` and `corpus/SOURCES.md:490,620` as outside its compositor/desktop province.
2. **Pre-existing transport boundaries**: `kaidoku` and `revenger` share loopback CDP transport for reverse engineering and forensics (established in `tabi-shokunin/PROVINCE.md:190,201`), but neither holds any IME/composition commands or Blink source rows.
3. **Substrate extractions**: `kotoba` holds string-table dumps from compiled `oh-my-pi` binaries (`omp-live-18.12.2`, `omp-18.14.0`) in `.ufo/round-44` and `round-82` (where `Input.insertText`, `isComposing`, `compositionstart`, `beforeinput` appear as minified client/library symbols).
4. **Fleet audits and external payloads**: `kumitate` records fleet-wide scan logs and sources-census outputs; `revenger` stores the raw HTML of a Mandiant blog post containing Google's `BOQ_wizbind` event listener script; `kasegi` mentions Intel Management Engine (IME acronym collision).

No sibling lane introduces any duplicate-URL risk (sources-census E04/W04) against S187–S193. Fleet sources census validates cleanly (exit 0, `tabi ok`).

---

## 1. Ground, pins, and scanning method

The r74 ground covers the CDP IME composition capability on Linux Chromium 155.0.8059.84 headless:
- Protocol commands: `Input.imeSetComposition` and `Input.insertText`.
- Runtime events: `compositionstart`, `compositionupdate`, `compositionend`, `beforeinput`, `input` with `isComposing` boolean tracking and trusted flag rules (`EventTarget::DispatchEvent` vs `DispatchScopedEvent`).
- Editing behaviors: `insertCompositionText`, `InputMethodController`, `keyCode 229`, selected text composition start, empty-text cancellation, and `-32602` parameter validation.
- The seven Chromium 155 source files of S187–S193:
  1. `Input.pdl` (S187)
  2. `input_handler.cc` (S188)
  3. `input_method_controller.cc` (S189)
  4. `event_target.cc` (S190)
  5. `event_dispatcher.cc` (S191)
  6. `scoped_event_queue.cc` (S192)
  7. `editing_utilities.cc` (S193)

### Pinned Sibling Heads
Before running the scan, all 20 sibling lane heads under `/home/vgpnk/Projects/shokunin/*-shokunin` were pinned to `sibling-heads.tsv` (committed beside this report):

| Lane | Full Directory | Pinned Commit Head | Branch | Commit Date |
|---|---|---|---|---|
| audio | `audio-shokunin` | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | HEAD | 2026-10-28 10:22:37 -0300 |
| chousa | `chousa-shokunin` | `408ae68f9e445fc911f713d5bbb3a64dda1ab9fe` | HEAD | 2026-11-06 18:34:50 -0300 |
| game-dev-2d | `game-dev-2d-shokunin` | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | HEAD | 2026-10-28 10:33:27 -0300 |
| game-dev-3d | `game-dev-3d-shokunin` | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | main | 2026-10-28 10:43:21 -0300 |
| kagi | `kagi-shokunin` | `39460f8676954f135d15fa99b43cd882360b3eee` | HEAD | 2026-11-07 00:18:50 -0300 |
| kaidoku | `kaidoku-shokunin` | `0b518f568da7b40a4ab026508d63c942faa7badf` | HEAD | 2026-11-05 21:54:43 -0300 |
| kake | `kake-shokunin` | `dd7a146df338ec3de07a88f08f36c8278760afec` | HEAD | 2026-11-05 23:55:59 -0300 |
| kama | `kama-shokunin` | `d158c25f3cb36ef30808997036e873f801e9747c` | HEAD | 2026-11-07 00:32:25 -0300 |
| kasegi | `kasegi-shokunin` | `6beead9148945fa695cf3139e8fc9d8e91cc5fd0` | HEAD | 2026-11-07 00:25:06 -0300 |
| kengaku | `kengaku-shokunin` | `34b28c47bc38b4e0aa11f44f2dfe7c9470d551ac` | HEAD | 2026-11-06 15:03:48 -0300 |
| kotoba | `kotoba-shokunin` | `0344ddaea831b92546360a55ae02db2654fbccf8` | HEAD | 2026-11-06 13:46:37 -0300 |
| kotodama | `kotodama-shokunin` | `5fa04a9bbda25aa31c8270265fd9997eb97d9ebb` | HEAD | 2026-11-06 09:59:33 -0300 |
| kumitate | `kumitate-shokunin` | `243fecd13de2ddc01e830bffbce6758ddb64cee9` | HEAD | 2026-11-07 00:30:14 -0300 |
| lore | `lore-shokunin` | `0f044aa7c7e4e17cfd5b6278179709b60db45d61` | main | 2026-10-28 10:31:49 -0300 |
| mado | `mado-shokunin` | `4c6f723f3dca3a26f9d14475d695fe797e2e972c` | HEAD | 2026-11-07 00:00:39 -0300 |
| mori | `mori-shokunin` | `7765969c79e6f3df44cce2e303e6a0cf2b054d8b` | HEAD | 2026-11-05 21:07:21 -0300 |
| revenger | `revenger-shokunin` | `654d09298960d0886274d37a0492b8e6d98b2c96` | HEAD | 2026-11-05 22:09:26 -0300 |
| souji | `souji-shokunin` | `319109b0ddc836c6cf3364fdde3ab99796f21f32` | HEAD | 2026-11-07 00:25:20 -0300 |
| tameshi | `tameshi-shokunin` | `87d1635c8a1a90a405eb348da5ba3e8f93b4ae83` | HEAD | 2026-11-06 20:27:04 -0300 |
| tsukuroi | `tsukuroi-shokunin` | `b380483e2a1d8edc97556fdd021794f619b6e1a6` | HEAD | 2026-11-07 00:09:55 -0300 |

### Scan Executions

1. **Full-Tree Git Grep (all 20 lanes at pinned heads)**:
   - Command: `git -C <lane> grep -n -I "<pattern>" <head> -- ":(exclude)*node_modules*"`
   - Evaluated for all 20 specified patterns across all 20 lanes.
   - Result: 12 of the 20 patterns have exactly **0** hits across all 20 sibling lanes.

2. **Scoped Directory Grep (`corpus/SOURCES.md`, `corpus/knowledge/**`, `scripts/**`, `tools/**`, `PROVINCE.md`)**:
   - Command: `git -C <lane> grep -n -I "<pattern>" <head> -- corpus/SOURCES.md corpus/knowledge scripts tools PROVINCE.md`
   - Result: Only 2 patterns (`IME` and `229`) hit in scoped directories. Evaluating word-boundary `\bIME\b` yielded 6 lines, all in `mado` (4 in knowledge, 2 in SOURCES), all declaring IME out of scope. Evaluating `\b229\b` yielded 0 hits for `keyCode 229` (all hits are line numbers, byte sizes, or dates).

3. **Fleet Sources Census & Duplicate-URL Audit**:
   - Command: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
   - Exit code: `0`
   - Result: Clean summary `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`. Zero `E04` duplicate-URL errors. Expected `W04` warnings on S187 and S188 (multi-scope reuse of `Input.pdl` and `input_handler.cc` within `tabi`).

---

## 2. Pattern Hit Summary Table

| Pattern | Hits across 20 lanes | Lanes with hits | Scope & Nature of Hits |
|---|---|---|---|
| `imeSetComposition` | **0** | none | Zero across all 20 sibling lanes |
| `insertText` | 44 | kotoba, kotodama | kotoba: omp binary string dumps; kotodama: citation of tabi PROVINCE.md:70 |
| `compositionstart` | 8 | kotoba, kumitate, revenger | Minified web bundles (omp, Mandiant blog HTML, playwright vite asset) |
| `compositionupdate` | 8 | kotoba, kumitate, revenger | Same minified web bundles as above |
| `compositionend` | 8 | kotoba, kumitate, revenger | Same minified web bundles as above |
| `isComposing` | 5 | kotoba | Editor state strings in omp binary string extraction |
| `insertCompositionText` | **0** | none | Zero across all 20 sibling lanes |
| `InputMethodController` | **0** | none | Zero across all 20 sibling lanes |
| `DispatchScopedEvent` | **0** | none | Zero across all 20 sibling lanes |
| `SetTrusted` | **0** | none | Zero across all 20 sibling lanes |
| `beforeinput` | 10 | kotoba, kumitate, revenger | Minified web event listener tables |
| `IME` (word-boundary `\bIME\b`) | 6 in scoped dirs (767 total) | mado, kasegi, tsukuroi, kotodama | mado: explicit refusal of IME; kasegi: Intel Management Engine; tsukuroi: eventlog |
| `keyCode 229` / `229` | **0** relevant (76 in scoped dirs) | none | All 229 hits are line numbers, byte counts, or dates; zero keyboard/IME references |
| `Input.pdl` | 1 | kumitate | kumitate fleet census log citing tabi's own S173 row; 0 sibling source rows |
| `input_handler.cc` | **0** | none | Zero across all 20 sibling lanes |
| `input_method_controller.cc`| **0** | none | Zero across all 20 sibling lanes |
| `event_target.cc` | **0** | none | Zero across all 20 sibling lanes |
| `event_dispatcher.cc` | **0** | none | Zero across all 20 sibling lanes |
| `scoped_event_queue.cc` | **0** | none | Zero across all 20 sibling lanes |
| `editing_utilities.cc` | **0** | none | Zero across all 20 sibling lanes |

---

## 3. Scoped Findings Table

Every hit in sibling lanes was assessed against `tabi-shokunin/PROVINCE.md:3-21` (domain: browser & web-interaction craft; CDP session discipline) and checked for duplicate-URL risk against S187–S193 under `sources-census.sh` E04/W04 rules.

| # | Lane | Path:Line @ Pinned Head | Quote (≤ 25 words) | Contested vs tabi PROVINCE? | Dup-URL Risk for S187–S193 |
|---|---|---|---|---|---|
| 1 | mado | `corpus/knowledge/input-debugging-boundaries-r15.md:61-62` | `IME/text-input protocol behavior is outside this note; no additional IME implementation or completeness claim is admitted.` | **No** — explicit refusal; affirms IME is outside mado's desktop/compositor province | None |
| 2 | mado | `corpus/knowledge/input-debugging-boundaries-r15.md:36` | `Neither physical key state, libinput helper output, compositor inventory nor the generic key contract guarantees text insertion, shortcut execution, IME composition or UI response` | **No** — observation that compositor key state does not guarantee IME composition | None |
| 3 | mado | `corpus/SOURCES.md:490` | `registry scope. This documents a route, not host event delivery or IME.` | **No** — clarifies source boundary does not touch IME | None |
| 4 | mado | `corpus/SOURCES.md:620` | `Toolkit/IME internals, client delivery, kernel diagnosis and event collection` | **No** — listed as excluded out-of-province domain | None |
| 5 | kotoba | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt:5900` | `Input.insertText` | **No** — string extraction from compiled omp binary for agent-skill wording evidence (`PROVINCE.md:76`) | None |
| 6 | kotoba | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt:2403669-70` | `+r.stack}}var oc=Object.prototype.hasOwnProperty... compositionstart... compositionupdate... compositionend... beforeinput` | **No** — minified frontend/React library symbols inside omp binary | None |
| 7 | kotoba | `.ufo/waves/round-82/build/Kb82E12Loader-omp-18.14.0-strings.txt:1290569` | `o.isComposing = false;` | **No** — minified web editor component string in omp binary | None |
| 8 | kotodama | `.ufo/waves/round-90/w2/stage/ConnectorSiblings/ownership.txt:107` | `(Input.dispatchMouseEvent click into the field, Input.insertText of the invocation-bound nonce, the DOM value` | **No** — inbound audit quoting `tabi-shokunin/PROVINCE.md:70` | None |
| 9 | kumitate | `.ufo/waves/round-96/K96Scout/receipts/fleet-census.txt:499` | `tabi W04 S173 duplicate url chromium.googlesource.com/.../Input.pdl?format=TEXT across scopes` | **No** — fleet governance census recording tabi's own W04 warning for S173 | None (no kumitate source row) |
| 10 | kumitate | `.ufo/waves/round-90/K90Connector/hits-C-cf.txt:26-29` | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/node_modules/playwright-core/...` | **No** — fleet-wide Unicode character scan across node_modules | None |
| 11 | revenger | `.ufo/waves/round-74/quote-audit/raw/S398.body:16` | `function r(a,b,c){if(!(b in a.l)&&a.o){var e=function(f,d,B){a.handleEvent(f,d,B)}... BOQ_wizbind` | **No** — Google Cloud Blog HTML payload for Mandiant Go reverse engineering article | None |
| 12 | revenger | `corpus/SOURCES.md:314` (S299) | `Chrome DevTools Protocol (index / scope statement) — https://chromedevtools.github.io/devtools-protocol/` | **Pre-existing transport boundary** (`PROVINCE.md:201`); no IME commands or Blink sources | None for S187–S193 (different domain and protocol URL) |
| 13 | kaidoku | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222` | **Pre-existing transport boundary** (`PROVINCE.md:190`); kaidoku corpus has 0 IME hits | None |
| 14 | kake | `PROVINCE.md:40,45` | `tabi drives browsers and owns client-side crawler discipline; kake owns publisher-side placement` | **Pre-existing crawler boundary** (`PROVINCE.md:191`); zero IME ground overlap | None |
| 15 | kagi | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — contested with kake` | **Pre-existing session boundary** (`PROVINCE.md:189`); zero IME ground overlap | None |
| 16 | tsukuroi | `.ufo/waves/round-58/eventlog-probes/e1-el-inventory.txt:180` | `Microsoft-Windows-IME-JP, Microsoft-Windows-IME-Customer-Feedback` | **No** — host Windows EventLog provider inventory for OS diagnostics | None |
| 17 | kasegi | `.ufo/waves/round-85/w1/ScoutSources-receipts/live-KEV-catalog.json:8` | `Intel Management Engine (IME)` | **No** — hardware acronym collision in vulnerability catalog | None |

---

## 4. Sources-Census Duplicate-URL Analysis (W04 / E04)

Validation command executed:
`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
Exit code: `0` (clean, verified in `sources-census-tabi.txt`).

Summary of S187–S193 evaluation:
- **S187** (`Input.pdl?format=TEXT`):
  - Shares URL with S173 (which was scoped to `synthesizeScrollGesture`).
  - S187 explicitly declares a distinct scope ("the experimental Input.insertText and Input.imeSetComposition declarations and their comments at this tag; a second scope of the file S173 holds for synthesizeScrollGesture").
  - Result: Generates `W04` ("same URL across scopes"). Warnings do not affect clean lanes. Zero `E04` errors.
  - Zero sibling lanes hold `Input.pdl`.
- **S188** (`input_handler.cc?format=TEXT`):
  - Shares URL with S162 and S174 (which were scoped to mouse/key events and scroll gestures).
  - S188 explicitly declares a third scope ("browser-side handling of Input.insertText and Input.imeSetComposition at this tag... a third scope of the file S162/S174 hold").
  - Result: Generates `W04`. Zero `E04` errors.
  - Zero sibling lanes hold `input_handler.cc`.
- **S189** (`input_method_controller.cc?format=TEXT`):
  - URL is completely unique across tabi and all 20 sibling lanes. Zero W04, zero E04.
- **S190** (`event_target.cc?format=TEXT`):
  - URL is completely unique across tabi and all 20 sibling lanes. Zero W04, zero E04.
- **S191** (`event_dispatcher.cc?format=TEXT`):
  - URL is completely unique across tabi and all 20 sibling lanes. Zero W04, zero E04.
- **S192** (`scoped_event_queue.cc?format=TEXT`):
  - URL is completely unique across tabi and all 20 sibling lanes. Zero W04, zero E04.
- **S193** (`editing_utilities.cc?format=TEXT`):
  - URL is completely unique across tabi and all 20 sibling lanes. Zero W04, zero E04.

Fleet-wide validation across all 21 lanes (`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin`) confirmed every single lane exits 0 with `ok` and zero E04 errors.

---

## 5. One-Line Verdict

**Verdict: adjacent (overlap none on r74 IME ground).**

---

## 6. UFO-FSD Connector Synthesis & Proposed Move

### Evidence
1. `mado-shokunin` maintains an explicit disclaimer in its knowledge note `corpus/knowledge/input-debugging-boundaries-r15.md:61-62` and `corpus/SOURCES.md:490,620`:
   > "IME/text-input protocol behavior is outside this note; no additional IME implementation or completeness claim is admitted."
2. `tabi-shokunin` has acquired CDP IME composition capability on Linux Chromium 155 (`chromium-ime-composition-linux`) via `Input.imeSetComposition` and `Input.insertText`, grounded in S187–S193.
3. In `tabi-shokunin/PROVINCE.md:199`, the `mado` sibling row currently records:
   > `mado | none | 24ba2a9ddac21c1211579231e6ee1d98963f9988 | PROVINCE.md:3 | desktop & compositor craft — the Hyprland/waybar/walker | tabi runs headless throwaway-profile browsers, never the desktop or compositor; no shared surface.`

### Affected Axes
- **Adjacency** (primary): Strengthens the documented boundary between compositor-level keyboard mapping (`mado`) and browser-level DOM text/IME composition (`tabi`).
- **Coverage** (secondary): Protects `tabi`'s new `chromium-ime-composition-linux` capability from ambiguous cross-lane boundary challenges.

### Proposed Move
In tabi's next matrix snapshot refresh or PROVINCE update:
Explicitly cite `mado`'s affirmative disclaimer (`mado-shokunin/corpus/knowledge/input-debugging-boundaries-r15.md:61-62`) in tabi's `mado` matrix row or in `corpus/knowledge/chromium-ime-composition-runtime-round-74.md`. Citing `mado`'s existing knowledge note documents mutual consent on input boundaries: compositor keybinds and window management remain `mado`'s, while web application text input and IME composition protocols belong exclusively to `tabi`.

### Risks
- If a future `mado` round introduces Wayland text-input protocol v3 (`zwp_text_input_v3`) for native compositor IME popups, an adjacency question between Wayland compositor-level text-input routing and in-browser DOM composition events could arise. That future risk is mitigated by maintaining the clean division: Wayland IPC is compositor craft (`mado`), whereas DOM `CompositionEvent` / CDP `Input` domain is browser interaction craft (`tabi`).

### Verification
1. Run `node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json`: exits 0 clean.
2. Run `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`: exits 0 clean (`tabi ok`).

---

## 7. Tooling & Environment Ledger
- No tools were installed or upgraded during this seat's execution.
- Scratch directory `/fast/scratch/hyaku/tabi-r74/R74Connector` was used for temporary data processing and removed upon completion.
- Receipts committed beside this report:
  - `sibling-heads.tsv` (SHA and timestamp pins for 20 sibling lanes)
  - `scan-summary.json` (per-pattern hit counts across all lanes)
  - `filtered-hits.json` (curated hits list with citations)
  - `sources-census-tabi.txt` (exit 0 validation output)
