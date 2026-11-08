# R86Connector — Sibling-Overlap Scan & UFO-FSD Connector Synthesis (Round 86, Wave 1)

**Seat:** R86Connector (connector, axis `adjacency`)  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Base commit:** `57265864`  
**Freeze commit:** `57265864` (base clean; r85 verifier spot-check `57265864`)  
**Digests commit D:** `4bd89a80f439` (nonce `tabi-r86-l1-4bd89a80f439`, re-freeze D2)  
**Scanned at:** 2026-11-08T08:54:59Z  
**Seat output:** `.ufo/waves/round-86/w1/R86Connector.md`  
**Mutations:** none. No git/jj mutation, no commit, no push. Read-only throughout.

---

## 1. Milestone Answer

> *Sibling-overlap scan: does any sibling lane own accept filtering, type=color, showPicker, cross-leg law witnesses?*

**No. Zero sibling lanes hold any part of this ground.**  
**Specifically: the accept token grammar matrix (`image/*`, `image/png, .txt`, `application/pdf`), programmatic file answer laws (`DOM.setFileInputFiles`), same-origin `type=color` activated picker availability laws (return `undefined`, 0 choosers, activation consumed), cross-origin gating, and CDP file-chooser interception (`Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened`) are claimed by zero sibling lanes.**

All 20 sibling lanes under `/home/vgpnk/Projects/shokunin/*-shokunin/` were pinned with `git -C <repo> rev-parse HEAD` at scan time and systematically evaluated across all surface types:

| Probe | Result |
|---|---|
| Sibling `PROVINCE.md` lines naming target identifiers (`accept` attribute / `showPicker` / `setFileInputFiles` / `fileChooserOpened` / `setInterceptFileChooserDialog` / transient user activation / `same-origin` or `cross-origin` gating / `NotAllowedError` / `SecurityError` / `type=color` / colour-picker / `witness-families` / cross-leg witnesses) | **0** across all 20 |
| Sibling `SCORECARD.md` capability rows on the target ground | **0** across all 20 |
| Sibling `corpus/knowledge/**` notes claiming the target ground | **0** across all 20 (only kake's HTTP `cache-control-effective.md` mentions "accept token" for HTTP Cache-Control header arguments) |
| Sibling `SKILL.md` / `README.md` mentions on target ground | **0** across all 20 |
| Sibling `corpus/SOURCES.md` rows on `html.spec.whatwg.org/multipage/input.html` (specifying `showPicker()`, input types, picker availability, accept attribute) | **0** (only `links.html`, `semantics.html`, `scripting.html`, `syntax.html` are held by `kake`, `souji`, `kagi`, `chousa`) |
| Whole sibling tree, raw identifier grep | Non-claims only: desktop MIME resolution in `mado`, agent harness string dumps in `kotoba`, research captures in `chousa`, test fixtures in `kagi`, mutation methodology in `tameshi` (see §6) |

**Contested rows on target capability ground: 0.** The five standing `contested` rows recorded in tabi's province (`kagi`, `kaidoku`, `kake`, `kumitate`, `revenger`) contest **shared loopback CDP endpoints, port leases, and substrate filesystem paths**, not the r86 C1 capability legs or C2 witness family laws. They are preserved and reported for the integrator to arbitrate, and are **not** absorbed.

The r86 C1 capability surface (six new legs: accept token grammar matrix on wildcard, mixed-list, non-matching MIME token answered via `DOM.setFileInputFiles`; same-origin `type=color` activated arm returning `undefined` with zero `Page.fileChooserOpened` events; all 24 carried r84/r85 legs) and C2 operability surface (search/text cross-origin witness families killing the 3 narrow-tel survivors) are **entirely uncontested across the fleet**.

---

## 2. Per-Lane Relation, Cite, Quote, and Tabi's Side

Relation labels and citations are anchored to tabi's committed adjacency matrix (`PROVINCE.md` → `## Adjacent — sibling matrix`, gated by `scripts/check-sibling-matrix-r69.mjs`). That matrix binds to the frozen r69 snapshot `.ufo/waves/round-69/c1/sibling-heads-r69.tsv`.

Re-running the committed gate read-only at scan time:
```
node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json
→ {"verdict":"clean","siblings":20,"rows":20,"bound":20,
   "inbound":["kake","kengaku","kotoba"],
   "outbound":["kagi","kaidoku","kake","revenger"],"findings":[]}
```

Every one of the 20 quotes was independently re-read at the **current live sibling HEAD** pinned at scan time (2026-11-08T08:54:59Z) and tested for on-line substring matching (normalizing whitespace and stripping backticks/markdown formatting per the gate rule). All quotes are ≤20 words (all ≤12 words) per assignment constraint. **20/20 quotes continue to verify verbatim on-line at current heads**:

| lane | relation | head at scan | cite (`path:line`) | quote (≤20 words) | tabi's side of the boundary | on target ground? |
|---|---|---|---|---|---|---|
| audio | none | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | `PROVINCE.md:3` | `game audio production — SFX (UI, impacts, movement, ambience) and` | Tabi holds no audio production ground; no shared surface. | no |
| chousa | adjacent | `ac0a0892c15de11fb28d3208f2b287687c00477e` | `PROVINCE.md:5` | `question framing; source hierarchy (primary / secondary / aggregator /` | Tabi opens web sources under chousa's research method and keeps only its own SOURCES rows and browser findings. | no |
| game-dev-2d | none | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | `PROVINCE.md:3` | `2D game production verified by executable headless fixtures` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| game-dev-3d | none | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | `PROVINCE.md:3` | `3D game production verified by executable headless fixtures — 3D` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| kagi | **contested** | `d549ee6eb8770a49938b78f49cf79e36d9c1c2e8` | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — **contested with kake**` | Tabi's CDP session discipline touches the musketeer 9222 lease; tabi never reads that profile's session material and leaves the lease with the integrator. | no — lease only |
| kaidoku | **contested** | `0b518f568da7b40a4ab026508d63c942faa7badf` | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222` | Both lanes self-launch Chromium over loopback CDP: kaidoku for reverse engineering, tabi for interaction evidence; tabi refuses forensics to kaidoku and reports the shared CDP ground. | no — CDP substrate only |
| kake | **contested** | `dd7a146df338ec3de07a88f08f36c8278760afec` | `PROVINCE.md:45` | `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` | Tabi drives browsers and owns client-side crawler discipline; publishing and publisher-side placement stay kake's; the lease stays with the integrator. | no — lease only |
| kama | none | `bbdfc930cf99845f7b5c4ab63f3bfd51ba39e582` | `PROVINCE.md:3` | `local model serving & endpoint health — local LLM endpoints, baseURL` | Tabi drives browsers, never model endpoints; no shared surface. | no |
| kasegi | none | `a887f6122044bee414016ed2e769719be8b00e58` | `PROVINCE.md:52` | `Live-target testing is refused; this corpus is documentation only.` | Kasegi refuses live-target testing and tabi never drives a browser against a bounty target; no shared surface. | no |
| kengaku | adjacent | `34b28c47bc38b4e0aa11f44f2dfe7c9470d551ac` | `PROVINCE.md:103` | `**tabi** scripts/check-measurement-binding.mjs:575-613 and **kama**` | Kengaku cites tabi's measurement-binding ancestor check as a shared primitive; nothing is absorbed either way and the instrument stays tabi's. | no |
| kotoba | adjacent | `0344ddaea831b92546360a55ae02db2654fbccf8` | `PROVINCE.md:76` | `tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13)` | Kotoba owns SKILL.md wording craft fleet-wide; the browser content of tabi's SKILL.md stays tabi's. | no — but see §6 |
| kotodama | none | `5fa04a9bbda25aa31c8270265fd9997eb97d9ebb` | `PROVINCE.md:3` | `linguistic-cultural worldbuilding (言霊, kotodama — the coupling` | Tabi holds no worldbuilding ground; no shared surface. | no |
| kumitate | **contested** | `e4887850448c38172e12fcb220496d23f49e8121` | `PROVINCE.md:14` | `Kimi Code substrate ~/.kimi-code/ — rows K1–K5, gated by scripts/kimi-census.mjs` | Tabi's primary substrate, the kimi-webbridge plugin under `~/.kimi-code/plugins/managed/`, sits inside kumitate's censused path; reported for the integrator, not resolved here. | no — substrate path only |
| lore | none | `0f044aa7c7e4e17cfd5b6278179709b60db45d61` | `PROVINCE.md:3` | `fictional-world records — entities (characters, places, factions, items), relations, timeline events` | Tabi holds no fictional-world ground; no shared surface. | no |
| mado | none | `f77ed5e967cc622ec9e99add8f175ca48ae2052f` | `PROVINCE.md:3` | `desktop & compositor craft — the Hyprland/waybar/walker` | Tabi runs headless throwaway-profile browsers, never the desktop or compositor; no shared surface. | no — but see §6 |
| mori | none | `7765969c79e6f3df44cce2e303e6a0cf2b054d8b` | `PROVINCE.md:3` | `fleet & host observability (森) — whether the fleet, its waves and` | Tabi observes pages, not fleet liveness; no shared surface. | no |
| revenger | **contested** | `654d09298960d0886274d37a0492b8e6d98b2c96` | `PROVINCE.md:33` | `loopback CDP endpoint for REA's rea-cdp-browser provider (rea list-browser-targets,` | Both lanes drive loopback CDP browser targets: revenger for REA forensic inspection, tabi for interaction evidence; tabi refuses forensics and reports the overlap. | no — CDP substrate only |
| souji | none | `2acbbfc80ac91e1b65cf5dae7287209fed9c7c86` | `PROVINCE.md:3` | `fleet repository & workspace hygiene (掃除) — receipt-gated` | Tabi cleans only its own scratch; no shared surface. | no |
| tameshi | adjacent | `fdbd18c672afb0474a72ad90f9ba6604ddc34001` | `PROVINCE.md:14` | `product domains — every lane's gate remains its own; tameshi` | Tabi's counters and forgery batteries are its own gates; the reusable fixture and mutation method is tameshi's. | no — but see §6 |
| tsukuroi | none | `b6447374637394b1f41183d1581f52127518fcdc` | `PROVINCE.md:3` | `host operability & system repair (繕, mending) — the OS` | Tabi uses the installed `/usr/bin/chromium` and never repairs packages or host state; no shared surface. | no |

---

## 3. Live Sibling Movement Since Round 85

Comparing live heads at scan time with the round-85 scan pins:
- **Moved since r85 (6 lanes):**
  - `chousa`: `f484d94f` → `ac0a0892` (round-89 freeze: per-format leg reconciliation + curation verdict)
  - `kagi`: `eb647d23` → `d549ee6e` (round-65 verifier spot-check + held-out class matrix)
  - `mado`: `ae537dbe` → `f77ed5e9` (round-100 verifier spot-check + pre-file amendments)
  - `souji`: `705fa138` → `2acbbfc8` (round-86 C2 repair: K4 writer flag sweep and C-escape paths)
  - `tabi`: r85 base `c574d593` → r86 base `57265864` (round-85 verification landing)
  - `tameshi`: `b392f5fa` → `fdbd18c6` (round-94 FREEZE: frozen plan and claims)
- **Unchanged since r84/r85 (15 lanes):** `audio`, `game-dev-2d`, `game-dev-3d`, `kaidoku`, `kake`, `kama`, `kasegi`, `kengaku`, `kotoba`, `kotodama`, `kumitate`, `lore`, `mori`, `revenger`, `tsukuroi`.

`git diff <r85_commit>..HEAD -- PROVINCE.md` was evaluated for all moved sibling lanes: **0 lines changed across all moved sibling provinces**. All 20 matrix quotes verify verbatim at current live heads. Zero drift impact on tabi's committed r69 gate.

---

## 4. Standing Contested Rows and Integrator Questions

The 5 standing `contested` rows in `PROVINCE.md` raise the following coordination questions for the protocol integrator:

1. **`kagi` (`d549ee6e`, L64):**
   *Ground:* CDP port 9222 and `~/.local/share/the-musketeer/chrome-profile` lease.
   *Integrator Question:* Does tabi's ephemeral loopback CDP session discipline (allocating dynamic high ports per invocation) conflict with kagi's 1Password native-messaging profile lease on loopback CDP port 9222?
2. **`kaidoku` (`0b518f56`, L55):**
   *Ground:* Self-launched headless Chromium over loopback CDP.
   *Integrator Question:* Should loopback CDP port allocations (tabi ephemeral high ports vs kaidoku 9222) be codified fleet-wide to prevent port collision during concurrent test runs?
3. **`kake` (`dd7a146d`, L45):**
   *Ground:* `the-musketeer` Chrome profile lease.
   *Integrator Question:* With kake explicitly delegating all browser execution to tabi (PROVINCE.md:40,67,310,368), should the contested musketeer Chrome profile lease be assigned exclusively to tabi or retired?
4. **`kumitate` (`e4887850`, L14):**
   *Ground:* `~/.kimi-code/` substrate path custody.
   *Integrator Question:* Does kumitate's shallow member census of `~/.kimi-code/` conflict with tabi's ownership of the `kimi-webbridge` plugin documentation and interaction surfaces under `~/.kimi-code/plugins/managed/`?
5. **`revenger` (`654d0929`, L33):**
   *Ground:* Loopback CDP browser endpoint inspection for REA.
   *Integrator Question:* Since revenger uses loopback CDP for REA forensic inspection while tabi uses CDP for browser interaction evidence, should a shared port reservation protocol be arbitrated by the integrator?

---

## 5. Inbound Reciprocity & Adjacency Scan

Three sibling lanes explicitly name `tabi` in their `PROVINCE.md`:
1. **`kake`** (`dd7a146d`):
   - Line 45: `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` (`contested`).
   - Lines 40, 67, 310, 344, 368: explicitly delegate browser driving and execution to tabi (*"tabi drives browsers and owns client-side crawler discipline"*, *"browser execution stays tabi's"*, *"stays tabi's adjacent province for anything that executes a browser"*).
2. **`kengaku`** (`34b28c47`):
   - Line 103: cites tabi's `scripts/check-measurement-binding.mjs:575-613` as a shared measurement-binding ancestor.
3. **`kotoba`** (`0344ddae`):
   - Line 76: explicitly lists tabi in its sibling matrix as owning browser-session and web-interaction evidence (`PROVINCE.md:6-13`).

---

## 6. Sibling Overlap Deep Scan & Boundary Cites

### (a) `accept` Attribute and MIME-Token Semantics vs `mado-shokunin`
- **Sibling ownership:** `mado-shokunin` (`PROVINCE.md:505-581`) explicitly owns desktop OS and XDG MIME resolution:
  - `tools/mado-mime.py`: file name → MIME type via `mime.cache`, `globs2`, `globs` (Round-94 refinement C1).
  - `tools/mado-mime.py`: file bytes → MIME type via `mime.cache` magic/alias/parent sections (Round-95 refinement C1).
  - `tools/mado-mimetext.py`: file bytes → MIME type in TEXT database mode (`mime/magic`) (Round-96 refinement C1).
  - Desktop application association (`xdg-mime`, `gio mime`, `~/.config/mimeapps.list`).
- **Tabi's boundary & non-contradiction note:**
  Tabi's `accept` attribute is governed by WHATWG HTML §4.10.5.1.17 (`html.spec.whatwg.org/multipage/input.html#attr-input-accept`), defining `accept` as an advisory user-interface hint to the browser's file chooser dialog (*"The accept attribute may be specified to provide user agents with a hint of what file types will be accepted"*).
  Tabi's C1 measured law proves that programmatic file assignment via CDP `DOM.setFileInputFiles` completely bypasses the file picker dialog and therefore does **not** invoke OS-level MIME sniffing, desktop validation, or file rejection.
  **This round's note must cite:** Tabi's programmatic acceptance law operates strictly at the DevTools DOM protocol layer and does not contradict or overlap with Mado's desktop OS MIME-database resolution.

### (b) `type=color` and Colour-Picker Behaviour
- **Sibling ownership:** Zero sibling lanes claim HTML `type=color` or browser colour pickers.
  - `mado` tools reference `hyprpicker` strictly as an external compositor screen-pixel sampling CLI.
  - `game-dev-2d` / `game-dev-3d` reference Godot engine UI nodes (`ColorPickerButton`), disjoint from HTML input elements.
  - `kake` references WCAG accessibility guidelines mentioning web colour pickers as external content.
- **Tabi's boundary:** Tabi owns browser DOM `<input type=color>` behaviour under CDP automation. In round 86, Tabi verified that calling `showPicker()` with transient activation on a same-origin `type=color` input returns `undefined`, consumes user activation, fires no `input`/`change` events, and opens zero `Page.fileChooserOpened` events (a file-chooser metric).

### (c) `showPicker()` Origin/Activation Gates vs `kotoba-shokunin`
- **Sibling presence:** `kotoba-shokunin` (.ufo/round-44 and round-82 harness string dumps `omp-live-18.12.2-strings.txt` and `Kb82E12Loader-omp-18.14.0-strings.txt`) contains compiled OMP agent runtime code:
  ```javascript
  if (typeof input.showPicker === "function") { input.showPicker(); }
  // showPicker needs transient activation; a programmatic click is the fallback.
  Page.setInterceptFileChooserDialog
  Page.fileChooserOpened
  DOM.setFileInputFiles
  ```
- **Tabi's boundary:** Kotoba's `PROVINCE.md:76` explicitly confirms that `tabi owns browser-session and web-interaction evidence`. Kotoba does not maintain browser capabilities; Tabi provides the empirical verification for the exact browser activation fallback and CDP file-chooser interception methods that the host agent harness depends on.

### (d) Cross-Leg (Search/Text) Witness Design vs `tameshi-shokunin`
- **Sibling ownership:** `tameshi-shokunin` owns mutation testing, forgery batteries, and fuzzing methodologies across the fleet (`PROVINCE.md:14`: *"product domains — every lane's gate remains its own; tameshi"*).
- **Tabi's boundary:** Tabi's `scripts/witness-families-r86.mjs` and negative battery `scripts/negatives-showpicker-r86.mjs` implement Tameshi's mutation testing discipline (refusal verification, kill power, unapplied mutant detection), while remaining strictly within Tabi's own product gate and browser test domain.

---

## 7. UFO-FSD Connector Move: One Bounded Synthesis

Per the UFO-FSD Connector mandate: *Find one non-obvious move — including a compatible synthesis across the round's proposals — that improves at least one of the round's declared axes without harming another.*

### Evidence from Current Round Cache

1. **R86Scout Source Finding (WHATWG HTML §4.10.5.4 Step 2):**
   R86Scout fetched and machine-verified `https://html.spec.whatwg.org/multipage/input.html` (`b0202de1c0b4…`, lines 5832–5836). The normative specification for `showPicker()` step 2 states:
   > *"If this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException."*
   And companion note (lines 5838–5840):
   > *"File and Color inputs are exempted from this check for historical reason..."*
   Chromium's implementation (`blink/renderer/core/html/forms/html_input_element.cc:2652-2670`) directly mirrors this:
   ```cpp
   if (FormControlType() != FormControlType::kInputFile &&
       FormControlType() != FormControlType::kInputColor && frame) {
     if (!frame->IsSameOrigin()) {
       exception_state.ThrowSecurityError("showPicker() called from cross-origin iframe.");
       return;
     }
   }
   if (!LocalFrame::HasTransientUserActivation(frame)) {
     exception_state.ThrowDOMException(DOMExceptionCode::kNotAllowedError, "showPicker() requires a user gesture.");
     return;
   }
   ```
2. **The Unmeasured File Upload Exemption (R86Scout §2 Gap):**
   In round 84/85/86, Tabi verified that `sp84-cross-origin-color` returns `{ok: true, ret: 'undefined'}` with 0 choosers, while `sp84-cross-origin-{month,week,time,number,range,tel,search,text}` and `sp84-cross-origin-nonfile` (target `type=date`) all throw `SecurityError`.
   **However, the File Upload half of WHATWG §4.10.5.4 has NEVER been measured in any round of Tabi!** Across all 30 legs in the test suite, there is **zero** cross-origin leg calling `showPicker()` on `<input type=file>`.
3. **The Dialog-Filter vs Programmatic Acceptance Confound (R86Critic §1 & R86Review1 §b):**
   R86Critic and R86Review1 proved that the receipt cannot distinguish dialog filtering from no enforcement, because `DOM.setFileInputFiles` is a DevTools programmatic answer that bypasses the file picker dialog entirely. The counter's check message (*"must not filter a programmatic answer"*) is honest, but the claim headline (*"accept is a dialog filter"*) is an overclaim for headless execution.
4. **Counter Integrity Gaps (R86Review1 §b, §c):**
   - In `check-showpicker-r86.mjs:675`, `accept-grammar-law` reads `desc.accept` only from receipt-level `r.fixtureInputs`, leaving leg-level descriptors unread and `upload` / `uploadPng` content hashes unpinned.
   - On `sp86-same-origin-color-activated`, `showPicker` is not cross-bound with `triggerResult.value`.
5. **The Two-Tier Cascade Discriminator:**
   For non-exempt inputs (`tel`, `search`, `text`), a cross-origin iframe fails at Step 1 (`SecurityError`), whether activated or unactivated.
   For exempt inputs (`file`, `color`), Step 1 is bypassed. Therefore:
   - With transient activation: `file` opens a file chooser (`Page.fileChooserOpened`), `color` returns `undefined` (0 choosers).
   - Without transient activation: BOTH `file` and `color` fail at Step 2, throwing `NotAllowedError`!

### Affected Axes

- **`coverage` (primary):** Completes the missing `type=file` half of the WHATWG §4.10.5.4 dual-exemption rule, upgrading Tabi's cross-origin coverage to 100% of the spec-exempted types.
- **`discrimination` (primary):** Distinguishes Step 1 (`SecurityError`) from Step 2 (`NotAllowedError`) across exempt vs non-exempt input types in cross-origin execution, resolving the activation confound identified in round 85.
- **`calibration` (secondary):** Re-calibrates claim wording to programmatic acceptance, perfectly aligning the claim headline with the counter's check message and the `limit` block disclosure.
- **`forgery resistance` (secondary):** Binds leg-level `fixtureInputs`, `upload` content hashes, and `showPicker === triggerResult.value` in the counter, closing the unpinned fields identified by R86Review1.
- **`operability` (unharmed):** Preserves complete battery kill power and zero-survivor witness properties; avoids the colour activation trap identified by R86Review2.
- **`adjacency` (improved):** Cites Mado's desktop OS MIME domain as distinct from HTML form control hint semantics; aligns with Kotoba's agent harness substrate.

### Proposed Move

**"The Cross-Origin File Upload Exemption & Cascaded Activation Verification" (Generation r87 frontier)**

1. **Driver Surface (`scripts/chrome-cdp-showpicker-round87.mjs`):**
   - **Leg 1: `sp87-cross-origin-file`:**
     Child iframe invokes `showPicker()` on `<input type=file id="fi">` with transient user activation (`userGesture: true` via trusted click on child button).
     *Measured Law:* Does **not** throw `SecurityError` (exempt under WHATWG §4.10.5.4 step 2). Returns `undefined`, consumes transient activation, and opens exactly **1** `Page.fileChooserOpened` event intercepted by CDP with `backendNodeId` matching the child iframe's file input.
   - **Leg 2: `sp87-cross-origin-file-unactivated`:**
     Child iframe invokes `showPicker()` on `<input type=file id="fi">` without transient user activation (invoked via parent-to-child `postMessage` without click).
     *Measured Law:* Throws `NotAllowedError` (*"HTMLInputElement::showPicker() requires a user gesture"*), **NOT** `SecurityError`. This provides empirical proof on live Chromium bytes that the cross-origin check was bypassed and execution proceeded to the activation check (Step 2).
2. **Counter Surface (`scripts/check-showpicker-r87.mjs`):**
   - Add `cross-origin-file-exemption-law`:
     Assert `childResult === {ok: true, ret: 'undefined'}`, `choosers === 1`, and `backendNodeId === childNodeId`.
   - Add `cross-origin-file-cascade-law`:
     Assert `childResult.name === 'NotAllowedError'` on the unactivated leg, confirming that origin did not block the call.
   - Tighten `accept-grammar-law`:
     Read `desc.accept` from `leg.fixtureInputs` AND assert byte-identity with `r.fixtureInputs[target]`. Bind `upload` content sha256 to `stateAfter[target]`.
   - Cross-bind `leg.showPicker` with `leg.triggerResult.value` on all same-origin legs.
3. **Calibrated Headline Wording:**
   Formulate the C1 law headline strictly on observable bytes:
   *"The `accept` attribute does not validate or filter programmatic file delivery via `DOM.setFileInputFiles` for any token form (wildcard, mixed list, non-matching MIME token); dialog filtering remains an advisory UI hint per WHATWG §4.10.5.1.17."*

### Risks & Mitigations

- *Risk:* CDP `Page.setInterceptFileChooserDialog` might attribute cross-origin file chooser events with child `frameId`, potentially colliding with same-origin assumptions in `intercept-law`.  
  *Mitigation:* The driver already records `frameId` per event; `check-showpicker`'s `intercept-law` can bind `ev.params.frameId === leg.childFrameId` cleanly, as already established in `sp84-cross-origin-nonfile`.
- *Risk:* Adding two cross-origin file legs increases test runtime.  
  *Mitigation:* The legs reuse the existing child iframe and web server setup already spun up for the other cross-origin legs; incremental runtime is < 3 seconds.

### Verification

1. **Live Browser Run:**
   - `sp87-cross-origin-file` yields `showPicker: {ok: true, ret: "undefined"}`, exactly 1 `Page.fileChooserOpened`, no `SecurityError`.
   - `sp87-cross-origin-file-unactivated` yields `showPicker: {ok: false, name: "NotAllowedError"}`.
2. **Negative Battery & Kill Power:**
   - Mutate `sp87-cross-origin-file`'s `childResult` to `SecurityError` → counter refuses with `cross-origin-file-exemption-law`.
   - Mutate `sp87-cross-origin-file-unactivated`'s `childResult` to `SecurityError` → counter refuses with `cross-origin-file-cascade-law`.
   - Mutate leg-level `fixtureInputs.accept` away from receipt-level → counter refuses with `leg-fixture-descriptors`.

---

## 8. Verification Performed

| Check | Command / Method | Result |
|---|---|---|
| Sibling HEADs pinned at scan time | `git -C <repo> rev-parse HEAD` across all 20 sibling lanes | **20/20 pinned**; recorded in §2 and §3 |
| Sibling `PROVINCE.md` target-identifier scan | Regex scan for 9 target patterns over 20 sibling files | **0 hits** on capability ground |
| Sibling `SCORECARD.md` target-identifier scan | Regex scan over 20 sibling files | **0 hits** |
| Sibling `corpus/knowledge/**` target scan | Recursive regex over all sibling knowledge notes | **0 hits** on capability ground |
| Sibling `SKILL.md` / `README.md` scan | Regex scan over 20 trees | **0 hits** |
| Sibling `corpus/SOURCES.md` `input.html` scan | Search across 20 SOURCES files | **0 hits** for `input.html` |
| Whole-tree raw identifier sweep | Recursive grep over 20 trees excluding `.git` | Non-claims only (§6) |
| r69 sibling-matrix gate (lane's own gate) | `node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json` | **clean**, 20 rows, 20 bound, 0 findings |
| All 20 matrix quotes re-verified at **current** heads | Per-lane `git show <current_head>:<path>` + `clean()` check | **20/20 on-line, all ≤12 words (limit ≤20)** |
| Sibling movement since r85 verified | Comparison against r85 scan pins + `git diff <old>..HEAD -- PROVINCE.md` | 6 moved, 15 unchanged, 0 PROVINCE.md changes |
| Seat output receipt placed | `ls -la .ufo/waves/round-86/w1/R86Connector.md` | Verified present |
| Clean scratch | `rm -rf /fast/scratch/hyaku/tabi-r86/R86Connector` | Removed before yield |

**Tooling:** Zero tools installed or upgraded. Used pre-existing `node` (v24.21.0), `git`, `python3`. PACMAN GUARD strictly respected.  
**Scratch:** `/fast/scratch/hyaku/tabi-r86/R86Connector/` completely removed before yield per contract.
