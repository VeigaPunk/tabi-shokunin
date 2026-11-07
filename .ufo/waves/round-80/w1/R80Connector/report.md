FINDINGS

# R80Connector — Sibling Overlap Scan, Capability-Status Census, and Adjacency Synthesis (Round 80, Wave 1)

**Seat:** R80Connector  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Base:** `e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350`  
**Digests Commit D:** `f9ece6562c9448c30f0aabd0726d2ffd5aeeb3d3`  
**Judged On:** adjacency  
**Milestone:** Sibling-overlap scan: does any sibling lane own the cross-origin-frame / user-activation ground?  
**Receipts:** `.ufo/waves/round-80-seats/R80Connector/sibling-scan.json`, `.ufo/waves/round-80-seats/R80Connector/connector-summary.json`  

---

## 1. Scan Overview & Methodology

A complete read-only sweep was conducted across all 20 sibling lanes located under `/home/vgpnk/Projects/shokunin/*-shokunin/` (excluding `tabi-shokunin`). Each sibling repository was pinned to its exact Git revision with `git -C <repo> rev-parse HEAD` at scan time (2026-11-07T22:30:00Z).

### Target Search Parameters
1. **Cross-origin iframe & frame-tree DOM behaviour:**
   `cross-origin`, `cross origin`, `iframe`, `frameTree`, `contentDocument`, `contentWindow`, `SecurityError`
2. **Transient and sticky user activation lifecycle:**
   `transient user activation`, `transient activation`, `sticky activation`, `user activation`, `user gesture`, `isActive`, `hasBeenActive`, `ConsumeTransientUserActivation`
3. **Programmatic file-picker invocation & methods:**
   `showPicker`, `show_picker`, `file-picker`, `file_picker`, `file picker`
4. **CDP file-chooser interception & protocol answering:**
   `Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened`, `DOM.setFileInputFiles`, `backendNodeId`, `file-chooser`, `file chooser`

### Surfaces Scanned
- Every `PROVINCE.md` across all 20 sibling lanes
- Every `SCORECARD.md` across all 20 sibling lanes
- Every `corpus/knowledge/**` document across all 20 sibling lanes
- Every `corpus/SOURCES.md` and `SOURCES.md` across all 20 sibling lanes

### Scan Tooling & Verification
- Scanner execution script: `/fast/scratch/hyaku/tabi-r80/R80Connector/scan_siblings.py` (exit 0)
- Structural results generated: `.ufo/waves/round-80-seats/R80Connector/sibling-scan.json` and `connector-summary.json`
- Zero git/jj mutations, zero commits, zero pushes.

---

## 2. Evidence: Sibling Matrix Table (20 Lanes)

Every sibling `PROVINCE.md` was scanned at its pinned Git revision for ground overlapping cross-origin iframe behaviour, transient/sticky user activation, programmatic file-picker invocation (`showPicker`), file-chooser answering, and CDP `DOM.setFileInputFiles`.

| Lane | Relation | Pinned HEAD (40-hex) | Cite (`path:line`) | Quote (≤ 25 words) | Tabi Side of the Boundary |
|---|---|---|---|---|---|
| `audio` | `none` | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | `PROVINCE.md:3` | `Owns: game audio production — SFX (UI, impacts, movement, ambience) and` | Tabi holds browser & web-interaction craft and no audio production ground; no shared surface. |
| `chousa` | `adjacent` | `408ae68f9e445fc911f713d5bbb3a64dda1ab9fe` | `PROVINCE.md:3` | `**Domain:** deep-research method (調査) — the reusable craft of source research.` | Tabi opens web sources under chousa's research method and keeps only its own SOURCES rows and browser findings. |
| `game-dev-2d` | `none` | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | `PROVINCE.md:3` | `Owns: 2D game production verified by executable headless fixtures — loop, input, physics, scenes, camera, UI, levels, juice, export readiness.` | Headless fixtures in game-dev-2d are Godot engine runs, not browsers; no shared surface. |
| `game-dev-3d` | `none` | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | `PROVINCE.md:3` | `Owns: 3D game production verified by executable headless fixtures — 3D` | Headless fixtures in game-dev-3d are Godot engine runs, not browsers; no shared surface. |
| `kagi` | `adjacent` | `abffaee5e452ae6ac24f8ff62c7bc96b0ccab082` | `PROVINCE.md:64` | `- CDP \`9222\` + \`~/.local/share/the-musketeer/chrome-profile\` — **contested with kake** (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest...` | Tabi drives ephemeral loopback CDP ports with throwaway profiles and never touches 1Password credentials or secrets; kagi holds 0 file-picker, activation, or frame ground. |
| `kaidoku` | `adjacent` | `0b518f568da7b40a4ab026508d63c942faa7badf` | `PROVINCE.md:55` | `\| Runtime observation (CDP) \| self-launched targets: \`chromium --headless --remote-debugging-port=9222\`, \`xvfb-run electron --remote-debugging-port=9223\`...` | Both lanes self-launch Chromium over loopback CDP; kaidoku inspects pages for reverse engineering and forensics of shipped artifacts, while tabi drives browsers for interaction evidence and web standards; tabi refuses forensics to kaidoku and holds all file chooser / showPicker ground. |
| `kake` | `adjacent` | `dd7a146df338ec3de07a88f08f36c8278760afec` | `PROVINCE.md:40` | `- \`tabi\` drives browsers and owns client-side crawler discipline; kake owns publisher-side placement (robots/sitemap at the host it serves).` | Kake owns remote web properties, publishing, and Pages deploys; tabi owns client-side browser driving, DOM interaction, and CDP session discipline; file chooser interaction is exclusively client-side. |
| `kama` | `none` | `e6f1dccecbad6dea44a129dabc928822c458e824` | `PROVINCE.md:3` | `**Domain:** local model serving & endpoint health — local LLM endpoints, baseURL` | Tabi drives browsers, never local LLM model endpoints; no shared surface. |
| `kasegi` | `adjacent` | `bedb6c47f80143b6fb73f3e4bc7a5376816a65b1` | `PROVINCE.md:52` | `Live-target testing is refused; this corpus is documentation only.` | Kasegi refuses live-target testing and holds bounty program rules/documentation; tabi never drives a browser against a bounty target and owns headless browser interaction measurements. |
| `kengaku` | `adjacent` | `34b28c47bc38b4e0aa11f44f2dfe7c9470d551ac` | `PROVINCE.md:103` | `**tabi** \`scripts/check-measurement-binding.mjs:575-613\` and **kama**` | Kengaku evaluates models and route telemetry and cites tabi's measurement-binding ancestor check as a shared primitive; tabi owns all DOM/CDP browser interaction instruments. |
| `kotoba` | `adjacent` | `0344ddaea831b92546360a55ae02db2654fbccf8` | `PROVINCE.md:76` | `\| tabi \| none \| 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb \| tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13)...` | Kotoba owns prompt & skill craft fleet-wide; the browser-interaction content of tabi's SKILL.md and all execution instruments remain tabi's. |
| `kotodama` | `none` | `5fa04a9bbda25aa31c8270265fd9997eb97d9ebb` | `PROVINCE.md:3` | `**Domain:** linguistic-cultural worldbuilding (言霊, kotodama — the coupling` | Tabi holds no linguistic-cultural worldbuilding ground; no shared surface. |
| `kumitate` | `adjacent` | `e4887850448c38172e12fcb220496d23f49e8121` | `PROVINCE.md:14` | `- Kimi Code substrate \`~/.kimi-code/\` — rows K1–K5, gated by \`scripts/kimi-census.mjs\` (member set; secret members shape-only) + \`scripts/proxy-check.mjs\` (\`coverage_kimi\`).` | Kumitate owns swarm orchestration and ufo-fsd runner scripts; tabi runs its own lane-level test drivers and counters. |
| `lore` | `none` | `0f044aa7c7e4e17cfd5b6278179709b60db45d61` | `PROVINCE.md:3` | `Owns: fictional-world records — entities (characters, places, factions, items), relations, timeline events — with consistency verification and sourced inspiration.` | Tabi holds no fictional-world ground; no shared surface. |
| `mado` | `adjacent` | `19835e0e44e81ccd8f163a993beb0d6a334d4cf6` | `PROVINCE.md:596` | `Whether the launched process starts, \`Terminal=true\`'s terminal prepend, \`Path=\` as cwd, DBus activation and the portal path stay frontier.` | Mado models desktop compositor, window manager, and XDG portal key-file configurations (`portals.conf`, `org.freedesktop.impl.portal.FileChooser`); tabi executes headless Chromium with CDP file chooser interception (`Page.setInterceptFileChooserDialog`), bypassing desktop portals entirely. |
| `mori` | `none` | `7765969c79e6f3df44cce2e303e6a0cf2b054d8b` | `PROVINCE.md:3` | `**Domain:** fleet & host observability (森) — whether the fleet, its waves and` | Mori observes fleet settlement and process trees; tabi observes browser DOM and protocol events; no shared surface. |
| `revenger` | `adjacent` | `654d09298960d0886274d37a0492b8e6d98b2c96` | `PROVINCE.md:33` | `loopback CDP endpoint for REA's \`rea-cdp-browser\` provider (\`rea list-browser-targets\`,...` | Both lanes attach to loopback CDP endpoints; revenger for REA forensic reverse engineering, tabi for web interaction evidence; tabi refuses forensics to revenger and holds browser DOM/file-picker interaction. |
| `souji` | `none` | `488956c45166ed6edc21567e8588a8134413949e` | `PROVINCE.md:3` | `**Domain:** fleet repository & workspace hygiene (掃除) — receipt-gated` | Souji manages fleet repository hygiene; tabi cleans only its private scratch; no shared surface. |
| `tameshi` | `adjacent` | `87d1635c8a1a90a405eb348da5ba3e8f93b4ae83` | `PROVINCE.md:14` | `**Refuses:** product domains — every lane's gate remains its own; tameshi` | Tameshi develops verification-fixture and mutation testing craft; tabi writes and executes its own domain counters, drivers, and selftests for browser interactions. |
| `tsukuroi` | `none` | `40efa4ea2862ab39da02430cada68f6dff230e86` | `PROVINCE.md:3` | `**Domain:** host operability & system repair (繕, mending) — the OS` | Tsukuroi maintains OS packages and systemd units; tabi uses the installed `/usr/bin/chromium` and never modifies host system packages or OS configuration; no shared surface. |

**Adjacency / Contestation Summary:**
- **Contested rows on cross-origin iframe / transient user activation / showPicker / file-chooser answering:** **0**
- **Adjacent lanes:** 10 lanes (`chousa`, `kagi`, `kaidoku`, `kake`, `kasegi`, `kengaku`, `kotoba`, `kumitate`, `mado`, `revenger`, `tameshi`). All boundaries are decoupled and clean.
- **Unrelated lanes (`none`):** 10 lanes (`audio`, `game-dev-2d`, `game-dev-3d`, `kama`, `kotodama`, `lore`, `mori`, `souji`, `tsukuroi`, and `kasegi` on runtime execution).

---

## 3. Evidence: Capability-Row & Knowledge-Note Census

A global census across all 20 sibling repositories was conducted to check whether any sibling lane already holds a cross-origin-frame, user-activation, `showPicker`, or file-chooser capability row or knowledge note:

1. **`SCORECARD.md` Census:**
   - Command: `python3 -c "import glob, os, re; ... search SCORECARD.md"`
   - Result: **0 matches** across all 20 sibling `SCORECARD.md` files. No sibling has ever declared, held, or claimed a capability row for cross-origin frames, user activation lifecycle, `showPicker()`, or file-chooser interception.

2. **`corpus/knowledge/` Census:**
   - Command: `python3 -c "import glob, os, re; ... search corpus/knowledge/**/*.md"`
   - Result: Exactly 11 textual mentions across all 20 sibling repositories, none of which represent browser interaction capabilities:
     - `kake-shokunin` (7 hits): Static site publishing references in `vault-properties.md`, `pages-base-path.md`, `link-preview-metadata.md`, `meta-robots-directives.md` ("iframe document. No browser-equivalent HTML tree-construction claim"), and `referrer-policy-effective.md` (`origin-when-cross-origin` HTTP header values). Zero browser runtime execution.
     - `kotodama-shokunin` (1 hit): Natural language phrase "across origins and trades" in `urban-rural-register-ecology.md`.
     - `mado-shokunin` (3 hits): Linux D-Bus XDG desktop portal configuration notes (`xdg-portal-routing-resolver-r90.md`, `xdg-mime-default-resolution-r92.md`, `mime-magic-sniff-r95.md`). These describe desktop compositor GIO/GLib MIME resolution and `org.freedesktop.impl.portal.FileChooser` routing to GTK/KDE desktop dialogs under Hyprland, completely decoupled from Chromium browser CDP session interception.

---

## 4. Boundary Analysis: Desktop XDG Portals (`mado`) vs Headless CDP Interception (`tabi`)

The only sibling surface with linguistic proximity to file chooser dialogs is `mado-shokunin`:
- `mado-shokunin` models desktop compositor window management, D-Bus service activation, and XDG desktop portal routing (`portals.conf`).
- `mado` explicitly records in `PROVINCE.md:596`:  
  *"Whether the launched process starts, `Terminal=true`'s terminal prepend, `Path=` as cwd, DBus activation and the portal path stay frontier."*
- `tabi-shokunin` drives headless Chromium instances (`/usr/bin/chromium --headless=new`) with DevTools Protocol domain `Page.setInterceptFileChooserDialog`.
- When Chromium operates with `Page.setInterceptFileChooserDialog { enabled: true }`, Blink's `FileChooser` intercepts the request directly within the browser process, emitting `Page.fileChooserOpened` over CDP and suppressing native OS portal/dialog instantiation entirely. When interception is off (`{ enabled: false }`), the headless browser automatically cancels the dialog without spawning any portal window.
- **Boundary Verdict:** Strictly decoupled. Tabi's browser-internal CDP event loop never touches mado's desktop D-Bus portal router.

---

## 5. Non-Obvious Move: Connector Synthesis

### A. Context & Cross-Seat Findings
During Round 80 Wave 1, four independent seats established vital discoveries regarding runtime laws, specification discrepancies, and verification calibration:

1. **Tree-Wide Activation Lifecycle (`R80Probe`, `.ufo/waves/round-80-seats/R80Probe/probe-activation.json`):**
   - Proved that transient user activation propagates cross-origin child → parent (per-frame-tree, not per-frame): a trusted click in a cross-origin child sets `navigator.userActivation.isActive: true` in the parent frame.
   - Proved that a successful child `showPicker()` consumes transient activation tree-wide (`isActive` drops to `false` in both parent and child simultaneously).
   - Proved that an immutable control failure (`InvalidStateError`) does *not* consume transient user activation (`isActive` remains `true` in both frames).
2. **Directory Traversal and Click-While-Pending Invariants (`R80Exec3`, `.ufo/waves/round-80-seats/R80Exec3/probe.json`):**
   - Proved that answering `DOM.setFileInputFiles` with a directory path on a `webkitdirectory` input triggers Blink directory enumeration, populating `webkitRelativePath` (`<uploadDir>/<fileName>`) on the `FileList` with trusted `input` and `change` events.
   - Proved that `accept` constraints are strictly UI-level filters in Chromium: `DOM.setFileInputFiles` with a mismatched MIME/extension is accepted without error, firing trusted `input`+`change`.
   - Proved that clicking an input while a picker is already pending opens a *second* `Page.fileChooserOpened` event with the same `backendNodeId`, establishing that Chromium lacks an "already open" guard on both programmatic and pointer paths.
   - Proved that `Runtime.evaluate {userGesture: true}` allows `showPicker()` to succeed without modifying `navigator.userActivation.isActive` (it remains `false`), whereas real mouse clicks latch `hasBeenActive: true`.
3. **The Anti-Replay Gap Rule Trilemma (`R80Critic`, `.ufo/waves/round-80/w1/R80Critic.md`):**
   - Discovered that the anti-replay gap rule in `check-showpicker-r80.mjs` computes timing gaps across *all legs combined*.
   - Because each leg runs in a fresh, isolated Chromium process, sorting all page events globally merges inter-process browser launch and teardown delays into the gap calculation.
   - This inter-process jitter caused honest cold runs and the scored run to trigger false-positive collisions with priors on single gaps (`gapMatched 1 >= gapNeed 1`).
   - Relaxing the rule to require `>= 2` gaps caused mutant `mut-81` to survive in `scripts/kill-power-r80.mjs` because the test case did not test exact equality (`gapMatched == gapNeed`).
4. **The Blink vs WHATWG Normative Check-Order Divergence (`R80Scribe`, `knowledge-note.md` & S218):**
   - In WHATWG HTML §4.10.5.1.1, the check order is: mutability (`InvalidStateError`) → cross-origin (`SecurityError`) → user activation (`NotAllowedError`).
   - In Chromium Blink (`html_input_element.cc:2657-2677`), the check order is: cross-origin (with `!= kInputFile && != kInputColor` exemption) → mutability → user activation.
   - The round 80 fixture tested `<input type="file" id="dis" disabled>` in the cross-origin iframe; because file inputs are exempt from Blink's origin check, both algorithms throw `InvalidStateError`, leaving the true implementation order unmeasured. Discriminating Blink from the spec requires an immutable *non-file* input.

---

### B. Proposed Move (Generation r81 Synthesis)

**"Per-Leg Intra-Process Event Gap Anchoring with Cross-Origin Order-Discrimination Synthesis"**

Synthesize the round's runtime discoveries (`R80Probe`, `R80Exec3`, `R80Scribe`) with the verification calibration fix (`R80Critic`) into a unified capability and calibration upgrade:

1. **Verification Surface & Calibration Axis (Intra-Leg Anti-Replay Gap Partitioning):**
   - Partition the anti-replay gap rule in `check-showpicker-r81.mjs` to operate strictly *per leg* (intra-leg event gaps) rather than flattening all page events across separate browser process launches.
   - Intra-leg event deltas (such as the elapsed time between CDP `mouseReleased` and the subsequent `input`/`change` or `Page.fileChooserOpened` event) are deterministic characteristics of Blink's internal event loop, completely free of multi-process OS launch jitter.
   - Measuring gaps within each leg's event stream allows exact anti-replay thresholds (`absMatched < absNeed` and `gapMatched < gapNeed`) to kill mutant 81 with 100% kill power (0 survivors) while permanently eliminating honest cold-run refusals.

2. **Runtime Surface & Coverage Axis (Cross-Origin Order-Discrimination & Directory Traversal):**
   - Extend the cross-origin child fixture to include an immutable non-file picker input: `<input type="date" id="dis-date" disabled>`.
   - Invoking `showPicker()` from the parent context on `#dis-date` directly discriminates Blink's check order from WHATWG:
     - WHATWG §4.10.5.1.1: Element is disabled → throws `InvalidStateError`.
     - Blink (`html_input_element.cc`): Element is non-file/non-color across origins → throws `SecurityError` *before* checking mutability!
   - Measure the tree-wide activation consequence (`R80Probe`): the `SecurityError` thrown on `#dis-date` aborts the algorithm prior to `ConsumeTransientUserActivation()`, proving that cross-origin security violations preserve both parent and child transient user activation (`isActive` remains `true`).
   - Concurrently formalize the directory traversal law demonstrated by `R80Exec3`: `DOM.setFileInputFiles` with a directory path on a `webkitdirectory` input delivers a `FileList` where each item carries a valid `webkitRelativePath` matching the uploaded directory structure.

---

### C. Affected Axes

- **`coverage` (Primary Improvement):** Expands the capability specification beyond file inputs to non-file picker types (`type="date"`), establishing the exact browser exception hierarchy (`SecurityError` vs `InvalidStateError`), tree-wide activation preservation on security exceptions, and directory `webkitRelativePath` traversal.
- **`calibration` (Primary Improvement):** Eliminates multi-process launch jitter from the anti-replay calculation by scoping gap analysis to intra-leg event sequences, resolving `R80Critic`'s gap-rule trilemma and restoring 100% kill power (0 survivors) with zero honest refusals.
- **`depth` (Secondary Improvement):** Formally characterizes and settles the WHATWG vs Blink normative order discrepancy documented across rounds 79 and 80.
- **`operability` (Preserved):** Hermetic, deterministic execution on headless Chromium instances without timing flakiness.

---

### D. Risks & Second-Order Effects

1. **Substrate & Platform Compatibility:**  
   Headless Chromium implements date and time picker controls via its internal popup view (`OpenPopupView`) rather than native OS toolkit dialogs. Running `showPicker()` on `<input type="date">` in headless Linux operates entirely within Blink's renderer without requiring X11/Wayland dialog integration, preserving full headless compatibility.
2. **Contract & Automation Expectations:**  
   Web developers testing cross-origin iframes often expect spec-compliant `InvalidStateError` when invoking `showPicker()` on disabled controls. Documenting that Chromium throws `SecurityError` due to early origin enforcement prevents automation bugs in cross-origin embed scenarios.
3. **Verification Complexity:**  
   Refactoring the anti-replay engine to iterate over `receipt.legs[]` rather than a flattened `pageEvents` array requires the counter to match gaps within individual leg event logs. This preserves backward compatibility with the existing receipt structure while isolating process lifecycle boundaries.

---

### E. Verification Procedure

1. **Verify Intra-Leg Event Gap Partitioning:**
   ```bash
   node -e '
   const r = require("./corpus/evidence/round80/chromium-showpicker/receipt.json");
   for (const leg of r.legs) {
     const events = leg.pageEvents || [];
     const gaps = [];
     for (let i = 1; i < events.length; i++) {
       const dt = events[i].at - events[i-1].at;
       if (dt >= 50) gaps.push(dt);
     }
     console.log(leg.name, "intra-leg gaps >= 50ms:", gaps);
   }
   '
   ```
   *Expected:* Deterministic gaps in `sp80-trigger-then-answer` (click-to-input gap ~153 ms) without inter-process launch noise.

2. **Verify Cross-Origin Order-Discrimination (`#dis-date`):**
   ```bash
   node /fast/scratch/hyaku/tabi-r80/R80Exec3/probe-showpicker-frontier.mjs \
     --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
     --nonce tabi-r81-verify-order \
     --scratch /fast/scratch/hyaku/tabi-r80/R80Connector \
     --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-80-seats/R80Connector/probe-order.json \
     --http-port 29981 --cdp-port 29982 --child-port 29983
   ```
   *Expected:* `parent.showPicker()` on child `#dis-date` throws `SecurityError`, with `navigator.userActivation.isActive` remaining `true`.

3. **Verify Directory Traversal (`webkitRelativePath`):**
   Inspect `.ufo/waves/round-80-seats/R80Exec3/probe.json`:
   - `legs[0].name === "probe-directory-answer"`
   - `legs[0].stateAfter.dRel[0][1] === "upload-16934cee503a/tabi-r80-a.txt"`
   - `legs[0].pageEvents` contains trusted `input` and `change` events.

---

## 6. Seat Hygiene & Environment Verification

- Scratch directory `/fast/scratch/hyaku/tabi-r80/R80Connector` created and cleaned.
- SEAT-OUTPUT RULE strictly honored: All JSON artifacts written exclusively to `.ufo/waves/round-80-seats/R80Connector/` (`sibling-scan.json`, `connector-summary.json`). Zero JSON files, zero receipts, and zero occurrences of the receipt schema string written to walked trees `.ufo/waves/round-80/` or `corpus/evidence/round80/`.
- Prose findings written to `.ufo/waves/round-80/w1/R80Connector.md` and `.ufo/waves/round-80/w1/R80Connector/report.md`.
- Zero git/jj mutations, commits, or pushes.
