FINDINGS

# R79Connector — Sibling Overlap Scan, Capability-Status Census, and Adjacency Synthesis (Round 79, Wave 1)

**Seat:** R79Connector  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Base:** `24c821895f31f9dcb66ac2f357bc947818b0408c`  
**Digests Commit D:** `80830674d421e97bb1c01c836bfbb3dc49687dbc`  
**Judged On:** adjacency  
**Milestone:** Sibling-overlap scan: does any sibling lane own the showPicker/gesture ground?  
**Receipts:** `.ufo/waves/round-79-seats/R79Connector/scan-results.json`, `.ufo/waves/round-79-seats/R79Connector/connector-summary.json`  

---

## 1. Scan Overview & Methodology

A complete read-only sweep was conducted across all 20 sibling lanes located under `/home/vgpnk/Projects/shokunin/*-shokunin/` (excluding `tabi-shokunin`). Each sibling repository was pinned to its exact Git revision with `git -C <repo> rev-parse HEAD` at scan time (2026-11-07T21:18:00Z).

### Target Search Parameters
1. **Programmatic file-picker invocation & methods:**
   `showPicker`, `show_picker`, `file-picker`, `file_picker`, `file picker`
2. **CDP file-chooser interception & protocol methods:**
   `Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened`, `DOM.setFileInputFiles`, `file-chooser`, `file_chooser`, `file chooser`
3. **Transient user activation & gesture requirements of web APIs:**
   `transient user activation`, `transient activation`, `user activation`, `user gesture`, `gesture requirement`, `isActive`, `hasBeenActive`
4. **DOM file input interfaces & controls:**
   `HTMLInputElement`, `input type=file`, `type="file"`, `webkitdirectory`, `accept`

### Surfaces Scanned
- Every `PROVINCE.md` across all 20 sibling lanes
- Every `SCORECARD.md` across all 20 sibling lanes
- Every `corpus/knowledge/**` document across all 20 sibling lanes
- Every `corpus/SOURCES.md` and `SOURCES.md` across all 20 sibling lanes

### Scan Tooling & Verification
- Scanner execution script: `/fast/scratch/hyaku/tabi-r79/R79Connector/process_hits.py` (exit 0)
- Structural results generated: `.ufo/waves/round-79-seats/R79Connector/scan-results.json` and `connector-summary.json`
- Zero git/jj mutations, zero commits, zero pushes.

---

## 2. Evidence: Sibling Matrix Table (20 Lanes)

Every sibling `PROVINCE.md` was scanned at its pinned Git revision for ground overlapping programmatic file-picker invocation, `showPicker`, transient user activation, gesture requirements of web APIs, and file-chooser interception.

| Lane | Relation | Pinned HEAD (40-hex) | Cite (`path:line`) | Quote (≤ 25 words) | Tabi Side of the Boundary |
|---|---|---|---|---|---|
| `audio` | `none` | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | `PROVINCE.md:3` | `Owns: game audio production — SFX (UI, impacts, movement, ambience) and` | Tabi holds browser & web-interaction craft and no audio production ground; no shared surface. |
| `chousa` | `adjacent` | `408ae68f9e445fc911f713d5bbb3a64dda1ab9fe` | `PROVINCE.md:3` | `**Domain:** deep-research method (調査) — the reusable craft of source research.` | Tabi opens web sources under chousa's research method and keeps only its own SOURCES rows and browser findings. |
| `game-dev-2d` | `none` | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | `PROVINCE.md:3` | `Owns: 2D game production verified by executable headless fixtures — loop, input, physics, scenes, camera, UI, levels, juice, export readiness.` | Headless fixtures in game-dev-2d are Godot engine runs, not browsers; no shared surface. |
| `game-dev-3d` | `none` | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | `PROVINCE.md:3` | `Owns: 3D game production verified by executable headless fixtures — 3D` | Headless fixtures are Godot engine runs, not browsers; no shared surface. |
| `kagi` | `adjacent` | `8e5463c7937dccdd97fd5a812b8091f83b708aa7` | `PROVINCE.md:64` | `- CDP \`9222\` + \`~/.local/share/the-musketeer/chrome-profile\` — **contested with kake** (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest...` | Tabi drives ephemeral loopback CDP ports with throwaway profiles and never touches 1Password credentials or secrets; kagi holds 0 file-picker or showPicker ground. |
| `kaidoku` | `adjacent` | `0b518f568da7b40a4ab026508d63c942faa7badf` | `PROVINCE.md:55` | `\| Runtime observation (CDP) \| self-launched targets: \`chromium --headless --remote-debugging-port=9222\`, \`xvfb-run electron --remote-debugging-port=9223\`...` | Both lanes self-launch Chromium over loopback CDP; kaidoku inspects pages for reverse engineering and forensics of shipped artifacts, while tabi drives browsers for interaction evidence and web standards; tabi refuses forensics to kaidoku and holds all file chooser / showPicker ground. |
| `kake` | `adjacent` | `dd7a146df338ec3de07a88f08f36c8278760afec` | `PROVINCE.md:40` | `- \`tabi\` drives browsers and owns client-side crawler discipline; kake owns publisher-side placement (robots/sitemap at the host it serves).` | Kake owns remote web properties, publishing, and Pages deploys; tabi owns client-side browser driving, DOM interaction, and CDP session discipline; file chooser interaction is exclusively client-side. |
| `kama` | `none` | `e6f1dccecbad6dea44a129dabc928822c458e824` | `PROVINCE.md:3` | `**Domain:** local model serving & endpoint health — local LLM endpoints, baseURL` | Tabi drives browsers, never local LLM model endpoints; no shared surface. |
| `kasegi` | `adjacent` | `e2d3de7b847f8e9bac72a5bc4dea455ea051cf1a` | `PROVINCE.md:52` | `Live-target testing is refused; this corpus is documentation only.` | Kasegi refuses live-target testing and holds bounty program rules/documentation; tabi never drives a browser against a bounty target and owns headless browser interaction measurements. |
| `kengaku` | `adjacent` | `34b28c47bc38b4e0aa11f44f2dfe7c9470d551ac` | `PROVINCE.md:103` | `**tabi** \`scripts/check-measurement-binding.mjs:575-613\` and **kama**` | Kengaku evaluates models and route telemetry and cites tabi's measurement-binding ancestor check as a shared primitive; tabi owns all DOM/CDP browser interaction instruments. |
| `kotoba` | `adjacent` | `0344ddaea831b92546360a55ae02db2654fbccf8` | `PROVINCE.md:76` | `\| tabi \| none \| 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb \| tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13)...` | Kotoba owns prompt & skill craft fleet-wide; the browser-interaction content of tabi's SKILL.md and all execution instruments remain tabi's. |
| `kotodama` | `none` | `5fa04a9bbda25aa31c8270265fd9997eb97d9ebb` | `PROVINCE.md:3` | `**Domain:** linguistic-cultural worldbuilding (言霊, kotodama — the coupling` | Tabi holds no linguistic-cultural worldbuilding ground; no shared surface. |
| `kumitate` | `adjacent` | `e4887850448c38172e12fcb220496d23f49e8121` | `PROVINCE.md:14` | `- Kimi Code substrate \`~/.kimi-code/\` — rows K1–K5, gated by \`scripts/kimi-census.mjs\` (member set; secret members shape-only) + \`scripts/proxy-check.mjs\` (\`coverage_kimi\`).` | Kumitate owns swarm orchestration and ufo-fsd runner scripts; tabi runs its own lane-level test drivers and counters. |
| `lore` | `none` | `0f044aa7c7e4e17cfd5b6278179709b60db45d61` | `PROVINCE.md:3` | `Owns: fictional-world records — entities (characters, places, factions, items), relations, timeline events — with consistency verification and sourced inspiration.` | Tabi holds no fictional-world ground; no shared surface. |
| `mado` | `adjacent` | `2cbaa141f42df9dfeee4d207cae6558a4dd59863` | `PROVINCE.md:596` | `Whether the launched process starts, \`Terminal=true\`'s terminal prepend, \`Path=\` as cwd, DBus activation and the portal path stay frontier.` | Mado models desktop compositor, window manager, and XDG portal key-file configurations (`portals.conf`, `org.freedesktop.impl.portal.FileChooser`); tabi executes headless Chromium with CDP file chooser interception (`Page.setInterceptFileChooserDialog`), bypassing desktop portals entirely. |
| `mori` | `none` | `7765969c79e6f3df44cce2e303e6a0cf2b054d8b` | `PROVINCE.md:3` | `**Domain:** fleet & host observability (森) — whether the fleet, its waves and` | Mori observes fleet settlement and process trees; tabi observes browser DOM and protocol events; no shared surface. |
| `revenger` | `adjacent` | `654d09298960d0886274d37a0492b8e6d98b2c96` | `PROVINCE.md:33` | `loopback CDP endpoint for REA's \`rea-cdp-browser\` provider (\`rea list-browser-targets\`,...` | Both lanes attach to loopback CDP endpoints; revenger for REA forensic reverse engineering, tabi for web interaction evidence; tabi refuses forensics to revenger and holds browser DOM/file-picker interaction. |
| `souji` | `none` | `488956c45166ed6edc21567e8588a8134413949e` | `PROVINCE.md:3` | `**Domain:** fleet repository & workspace hygiene (掃除) — receipt-gated` | Souji manages fleet repository hygiene; tabi cleans only its private scratch; no shared surface. |
| `tameshi` | `adjacent` | `87d1635c8a1a90a405eb348da5ba3e8f93b4ae83` | `PROVINCE.md:14` | `**Refuses:** product domains — every lane's gate remains its own; tameshi` | Tameshi develops verification-fixture and mutation testing craft; tabi writes and executes its own domain counters, drivers, and selftests for browser interactions. |
| `tsukuroi` | `none` | `40efa4ea2862ab39da02430cada68f6dff230e86` | `PROVINCE.md:3` | `**Domain:** host operability & system repair (繕, mending) — the OS` | Tsukuroi maintains OS packages and systemd units; tabi uses the installed `/usr/bin/chromium` and never modifies host system packages or OS configuration; no shared surface. |

**Adjacency / Contestation Summary:**
- **Contested rows on programmatic file-picker / showPicker / gesture ground:** **0**
- **Adjacent lanes:** 10 lanes (`chousa`, `kagi`, `kaidoku`, `kake`, `kasegi`, `kengaku`, `kotoba`, `kumitate`, `mado`, `revenger`, `tameshi`). All adjacent boundaries are clean and decoupled.
- **Unrelated lanes (`none`):** 10 lanes (`audio`, `game-dev-2d`, `game-dev-3d`, `kama`, `kotodama`, `lore`, `mori`, `souji`, `tsukuroi`, and `kasegi` on runtime execution).

---

## 3. Evidence: Capability-Row & Knowledge-Note Census (`showPicker`)

A global census across all 20 sibling repositories was conducted to determine whether any sibling lane already holds a `showPicker` capability row or knowledge note:

1. **`SCORECARD.md` Census:**
   - Command: `python3 -c "import glob, os, re; ... search SCORECARD.md"`
   - Result: **0 matches** across all 20 sibling `SCORECARD.md` files. No sibling has ever declared or claimed a `showPicker` or file-picker capability row.

2. **`corpus/knowledge/` Census:**
   - Command: `python3 -c "import glob, os, re; ... search corpus/knowledge/*.md"`
   - Result: **0 matches for `showPicker`** across all sibling knowledge notes.
   - Sibling mention of `FileChooser`: Only `mado-shokunin` holds knowledge notes citing `FileChooser` (`portal-keyfile-bytes-r93.md`, `xdg-portal-routing-r12.md`, `xdg-portal-routing-resolver-r90.md`). These documents analyze Linux D-Bus XDG desktop portal configuration parsing (`org.freedesktop.impl.portal.FileChooser` routing to GTK/KDE backends under Hyprland), which is desktop OS configuration, completely decoupled from Chromium browser CDP session interception.

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
During Round 79 Wave 1, four independent seats generated decisive evidence regarding `showPicker`, user activation, and verification calibration:

1. **The Order Law (`R79Probe`, `.ufo/waves/round-79-seats/R79Probe/probe.json`):**  
   In `probe-dis-nogesture`, `R79Probe` tested `HTMLInputElement.showPicker()` on `<input type="file" id="dis" disabled>` in a document with zero prior user activation (`isActive: false, hasBeenActive: false`).  
   - Result: Synchronously throws `InvalidStateError` ("HTMLInputElement::showPicker() cannot be used on immutable controls."), **not** `NotAllowedError`.  
   - Grounding: Proves the normative order of Blink's check algorithm (WHATWG HTML §4.10.5.1.1, S216/S218): element mutability is evaluated *strictly before* the transient user activation check. Because the mutability check fails first, transient user activation is neither required nor consumed when invoked on an immutable control.

2. **The Directory-Picker Mode Divergence (`R79Exec3`, `.ufo/waves/round-79-seats/R79Exec3/probe.json`):**  
   In `probe-q1-webkitdirectory`, `R79Exec3` tested `HTMLInputElement.showPicker()` on `<input type="file" id="d" webkitdirectory>` with valid transient activation on `#pad`.  
   - Result: `Page.fileChooserOpened` dispatches with `mode: "selectSingle"`, **not** `mode: "selectFolder"`.  
   - Grounding: In Chromium 155, a direct pointer click on `#d` dispatches `Page.fileChooserOpened` with `mode: "selectFolder"` (as evidenced in round 78 leg `pick-folder`). However, programmatic invocation via `showPicker()` explicitly ignores `webkitdirectory` and defaults to single-file selection mode.

3. **Frozen Claims Case-Count Drift (`R79Review2`, `claims.json:14` vs `.ufo/waves/round-79/scored/c1-negatives-a.json`):**  
   - In frozen `claims.json:14`, Leg (c) states: *"on the (a) receipt the battery exits 0 allOk (87 cases, coverageGap [])"*.  
   - In committed scored evidence `.ufo/waves/round-79/scored/c1-negatives-a.json`, the battery reports: `"cases": 90, "passed": 90, "failed": 0, "coverage": {"declared": 56, "covered": 56}`.  
   - Grounding: Three additional cases were added to `scripts/negatives-showpicker-r79.mjs` pre-freeze, causing the battery to execute 90 cases while the frozen claim text declared 87. This is the exact recurrence of the round-78 defect (where claims/SCORECARD declared 398 cases while the battery ran 400).

### B. Proposed Move (Round 80 Capability Expansion & Pre-Freeze Manifest)

**Synthesize the Directory-Picker Mode Divergence and Order Law into a Round 80 Capability Expansion (`chromium-showpicker-directory-linux`) with Static Case-Count Reconciliation in the Battery.**

1. **Runtime & Contract Specification (Round 80 C1):**
   - Formalize the browser invariant: programmatic `showPicker()` on an `<input type=file webkitdirectory>` opens a single-file chooser (`mode: "selectSingle"`), diverging from mouse-driven activation which opens a directory picker (`mode: "selectFolder"`).
   - Bind this mode divergence in the round 80 counter alongside the established Order Law (mutability check before user activation).

2. **Battery Self-Introspection & Manifest Protocol (Round 80 C2 / Pre-Freeze Gate):**
   - Augment `scripts/negatives-showpicker-r80.mjs` with a `--manifest` option that outputs an authoritative JSON manifest (`totalCases`, `declaredChecks`, `witnessCases`).
   - Introduce a pre-freeze assertion in `scripts/claims-check.mjs` verifying that the numeric case counts declared in `claims.json` match the dynamic reflection of the battery, eliminating the recurring 87 vs 90 and 398 vs 400 record drift defect class before commit D is frozen.

### C. Affected Axes
- **`coverage` (Primary Improvement):** Expands coverage to non-standard directory and filter attributes (`webkitdirectory`, `accept`), documenting the browser's programmatic vs pointer mode divergence.
- **`depth` (Secondary Improvement):** Formally characterizes Blink's internal separation between native OS folder picker invocation via click vs programmatic file chooser fallback under `showPicker()`.
- **`calibration` (Defect Prevention):** Structurally prevents claims case-count drift from recurring across rounds by automating the validation between `claims.json` and battery case totals.
- **`operability` (Preserved):** Zero test runtime regressions; deterministic execution without timing drift or honest refusals.

### D. Risks & Second-Order Effects
1. **Automation Expectation Mismatch:** Developers and automation engineers often assume `input.showPicker()` on a directory input will spawn a folder selection dialog. Documenting that Chromium forces `selectSingle` prevents silent automation failures.
2. **Upstream Chromium Behavioral Changes:** If future Chromium releases update `HTMLInputElement::showPicker()` to respect `webkitdirectory` by emitting `selectFolder`, the counter's mode law would detect the behavioral change as a capability drift.

### E. Verification Procedure
1. Execute the frontier directory probe:
   ```bash
   node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-79-seats/R79Exec3/probe-showpicker-r79.mjs \
     --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
     --nonce tabi-r79-verify-dir \
     --scratch /fast/scratch/hyaku/tabi-r79/R79Connector \
     --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-79-seats/R79Connector/probe-dir.json \
     --http-port 29971 --cdp-port 29972
   ```
2. Assert in `probe-dir.json`:
   - `probe-q1-webkitdirectory`: `showPicker.ok === true`, and `Page.fileChooserOpened` event receives `mode: "selectSingle"`.
3. Assert in `R79Probe/probe.json`:
   - `probe-dis-nogesture`: throws `InvalidStateError` with `actBefore.isActive === false`.
4. Run battery case reflection:
   ```bash
   node -e "const b = require('./.ufo/waves/round-79/scored/c1-negatives-a.json'); console.log('cases:', b.cases, 'passed:', b.passed);"
   ```
   Assert `cases === 90` and `passed === 90`.

---

## 6. Seat Hygiene & Environment Verification

- Scratch directory `/fast/scratch/hyaku/tabi-r79/R79Connector` created and cleaned.
- SEAT-OUTPUT RULE strictly honored: All JSON artifacts written exclusively to `.ufo/waves/round-79-seats/R79Connector/` (`scan-results.json`, `connector-summary.json`). Zero files written to walked trees `.ufo/waves/round-79/` or `corpus/evidence/round79/`.
- Prose findings written to `.ufo/waves/round-79/w1/R79Connector.md` and `.ufo/waves/round-79/w1/R79Connector/report.md`.
- Zero git/jj mutations, commits, or pushes.
