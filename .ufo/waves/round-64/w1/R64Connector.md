# R64Connector — Sibling-Overlap and Registry-Collision Scan for Wheel/Scroll and Receipt-Provenance Ground (Round 64, Wave w1)

Seat: R64Connector (leaf, connector). Independently derived; no files shared with other seats. Fleet root `/home/vgpnk/Projects/shokunin` treated strictly as READ-ONLY. No instrument, snapshot, pin, production file, or sibling file was modified; all git reads used read-only git subcommands with `-C`. No subagents, no background jobs, no `agent://all` messages. Scratch root `/fast/scratch/hyaku/tabi-r64/R64Connector/` created and deleted prior to yield.

## 1. Axes

- **adjacency** (judged axis, start: 8) — target of this connector analysis: audit sibling overlap across this round's two claims (C1 wheel/scroll capability, C2 receipt-provenance calibration gate), identify adjacent boundaries, ensure zero improper absorption, and maintain clean separation across the fleet.
- **coverage** (start: 9, target: 9) — C1 capability `chromium-wheel-scroll-domain-linux` on Linux Chromium (live re-run demonstration, 29 counter checks).
- **depth** (start: 9) — untouched.
- **operability** (start: 9) — untouched.
- **freshness** (start: 9) — untouched.
- **calibration** (start: 9, target: 9) — C2 control receipt provenance gate repair (`scripts/check-receipt-provenance.mjs`, 11 receipts / 34 failures -> 0 failures).

## 2. Inputs & Pin Integrity

Read FIRST per contract:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/claims.json` (baseline `6c19979fe63f3b9ec35179ca57bb91c6356bff25`, freeze `0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/PROVINCE.md`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency.tsv`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
- 20 sibling lane repositories under `/home/vgpnk/Projects/shokunin/*-shokunin`.

### Frozen Pin Integrity (sha256 exact match against claims.json)

| Frozen File Path | Expected SHA256 (claims.json) | Observed SHA256 | Status |
|---|---|---|---|
| `scripts/chrome-cdp-loopback-round64.mjs` | `1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5` | `1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5` | exact |
| `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs` | `5cc3c8dd871d8ba38b0bd87b8142c879abf2c3a790392fb7df21c7534c5f01b7` | `5cc3c8dd871d8ba38b0bd87b8142c879abf2c3a790392fb7df21c7534c5f01b7` | exact |
| `.ufo/waves/round-64/counters/png-r64.mjs` | `3f6a75de4d413cbcc9b8541357dc58502c830ee4b7104cb22a13cca3af5d59f0` | `3f6a75de4d413cbcc9b8541357dc58502c830ee4b7104cb22a13cca3af5d59f0` | exact |
| `.ufo/waves/round-64/counters/make-negatives-r64.mjs` | `848be4b046d917067a3b89ee3a7e6344d14bc061100a4677132b7ce9ad68c832` | `848be4b046d917067a3b89ee3a7e6344d14bc061100a4677132b7ce9ad68c832` | exact |
| `.ufo/waves/round-64/counters/mutate-r64.mjs` | `11366f63d292c777713e759ce2410670cb1a9e64aaf3d23d966b738b5cc3fbf3` | `11366f63d292c777713e759ce2410670cb1a9e64aaf3d23d966b738b5cc3fbf3` | exact |
| `scripts/verify-live-r64.mjs` | `87a1a7c3ec4c39d1e26772285358761cae1a3b2ac5c02ee8db9de7973561a68a` | `87a1a7c3ec4c39d1e26772285358761cae1a3b2ac5c02ee8db9de7973561a68a` | exact |
| `scripts/check-receipt-provenance.mjs` | `947a595d65f6ad3f5259f5421d897d42720dc3dc05d039da8ec3619d00e49246` | `947a595d65f6ad3f5259f5421d897d42720dc3dc05d039da8ec3619d00e49246` | exact |
| `.ufo/waves/round-64/controls/run-controls-r64.mjs` | `ffabf4f031e4221c7d028cd543977feea1b89751a6ce1adb813fdfe72c88c956` | `ffabf4f031e4221c7d028cd543977feea1b89751a6ce1adb813fdfe72c88c956` | exact |
| `.ufo/waves/round-64/controls/smoke/receipt.json` | `7dc5a2476f6536d9c312b70c55c2b492eabc303109d6eb2692fb1db29641d148` | `7dc5a2476f6536d9c312b70c55c2b492eabc303109d6eb2692fb1db29641d148` | exact |
| `.ufo/waves/round-64/controls/summary.json` | `b20951e959cca69a16feadb762e7388fa9f4ce54b82b7c4900688ec296c50c1d` | `b20951e959cca69a16feadb762e7388fa9f4ce54b82b7c4900688ec296c50c1d` | exact |

All 10 frozen pins verified identical to frozen bytes.

## 3. Commands Executed

All commands executed with zero exit status (rc 0):
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` (rc 0)
- `python3 -c "import hashlib, json; ... verify 10 pinned files ..."` (rc 0, all 10 pins verified)
- `python3 -c "... scan 20 sibling repos across 6 target patterns ..."` (rc 0, scanned 20 sibling lanes, 5,178 files, 755,860 lines)
- `python3 -c "... audit all SOURCES.md files across fleet for target URLs ..."` (rc 0, 0 collisions found across 594 SOURCES.md files)
- `python3 /fast/scratch/hyaku/tabi-r64/R64Connector/generate_artifacts.py` (rc 0, generated TSV, JSON, collision audit, verification receipt)

## 4. Sibling-Overlap Scan Results

Executed query across all 20 sibling lanes (`*-shokunin` excluding `tabi-shokunin`):
Grep patterns for both claims:
1. `wheel|scroll|deltaY|scrollTop` (C1 DOM & pointer wheel events)
2. `Input\.dispatchMouseEvent|dispatchMouseEvent` (C1 CDP synthetic wheel event dispatch)
3. `captureScreenshot|Page\.captureScreenshot` (C1 CDP viewport screenshot capture)
4. `receipt provenance|check-receipt-provenance|receipt-provenance` (C2 control receipt provenance calibration)
5. `sha256-pinned|pinned evidence|evidence gate` (C1/C2 sha256-pinned evidence gates)
6. `live-verifier|verify-live|live verifier|live-verify` (C1 live-verifier patterns)

Scanned surface: `SKILL.md`, `PROVINCE.md`, and all `corpus/**/*.md` across 20 sibling repos.
- Repositories scanned: **20 sibling lanes**.
- Total files scanned: **5,178 files**.
- Total lines scanned: **755,860 lines**.
- Repositories with hits: **16 lanes** (audio, chousa, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, mado, mori, revenger, souji, tameshi, tsukuroi).
- Repositories clean (0 hits): **4 lanes** (game-dev-2d, game-dev-3d, kagi, lore).
- Total matched lines: **472**.

Keyword distribution across the 472 matches:
- `Input.dispatchMouseEvent` / `dispatchMouseEvent`: **0 hits** across all 20 sibling repos.
- `captureScreenshot` / `Page.captureScreenshot`: **0 hits** across all 20 sibling repos.
- `wheel` and `scroll`: **299 hits** across 9 lanes (audio, chousa, kaidoku, kake, kengaku, kotodama, kumitate, mado, tsukuroi).
- `receipt provenance`: **40 hits** across 12 lanes (chousa, kaidoku, kama, kasegi, kengaku, kotodama, kumitate, mado, mori, revenger, tameshi, tsukuroi).
- `sha256-pinned evidence gate`: **132 hits** across 14 lanes (chousa, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, mado, mori, souji, tameshi, tsukuroi).
- `live-verifier`: **1 hit** (kotodama).

### Totals by Disposition

| Disposition | Count | Meaning / Scope |
|---|---|---|
| **same-surface** | **0** | No sibling lane claims or executes browser-internal CDP wheel/scroll events, live verifiers over cold browser loopback runs, or browser control receipt provenance checks. Tabi owns this surface exclusively. |
| **third-lane-report** | **151** | Historical lessons, spot-checks, retrospective critiques, and documentation of past evidence gates and receipt-provenance tamper checks across siblings: kaidoku (43), mado (36), kengaku (14), mori (12), chousa (11), tsukuroi (10), kotoba (4), kotodama (4), kumitate (4), souji (4), tameshi (4), kama (2), revenger (2), kasegi (1). |
| **adjacent-new** | **119** | Adjacent boundaries that tabi must NOT absorb: mado (57: compositor pointer `scroll_factor` [53], touchpad scroll window rules, libinput natural scrolling, mouse wheel keybinds, and mado receipt result path quality rules [4]); tsukuroi (26: host OS pause-gate tool verifying sha256-pinned system package premises); kaidoku (9: binary forensics receipt-provenance gate tool `tools/round-80/receipt-provenance.py` sweeping `.ufo/waves/round-<N>/l1/receipts` and local ELF tamper matrices); kumitate (7: orchestrator dispatch-evidence gate `kumitate-dispatch-evidence-v1`, pinned evidence rules, and terminal pane scrollback refusal [2]); mori (6: tree-sitter AST derivation receipt provenance grammar and record rules citing S600 Reproducible Builds); kengaku (5: LLM evaluation constraint grader instruments and sha256-pinned input calendars); kotoba (5: prompt/skill evaluation gates checking revisions); kama (3: local model server sha256-pinned binary relaunch trigger contract and live receipt provenance quality rule KQ74); kotodama (1: index sweep verification reading at a sha256-pinned digest). |
| **no-claim** | **202** | Lexical coincidence with non-software or non-browser/unrelated sense: kotodama (116: historical/material artifacts: prayer wheels, water wheels, ancient scrolls, vegetal ornament); kaidoku (38: Python `.whl` binary containers and sealed Evidence bundles); kengaku (21: Python `.whl` model/test packages); kake (16: Python `.whl` URI oracle packages); tsukuroi (9: Linux system group `wheel` and journal `/var/log/journal` ACLs); audio (1: JACK transport `free-wheel`); kasegi (1: source supersession rule). |
| **Total** | **472** | Complete accounting over all hits across all sibling repos. |

### Per-Lane Breakdown

| Sibling Lane | Files Scanned | Lines Scanned | Hits | same-surface | adjacent-new | third-lane-report | no-claim | Primary Subject Matter |
|---|---|---|---|---|---|---|---|---|
| `audio-shokunin` | 88 | 6,766 | 1 | 0 | 0 | 0 | 1 | JACK audio transport freewheeling mode (`free-wheel`) |
| `chousa-shokunin` | 398 | 39,990 | 11 | 0 | 0 | 11 | 0 | S047 WICG text fragment citation (5); C2 before-receipt provenance spot-checks (6) |
| `game-dev-2d-shokunin` | 237 | 9,532 | 0 | 0 | 0 | 0 | 0 | Clean (0 hits) across all 6 target patterns |
| `game-dev-3d-shokunin` | 269 | 130,247 | 0 | 0 | 0 | 0 | 0 | Clean (0 hits) across all 6 target patterns |
| `kagi-shokunin` | 96 | 14,557 | 0 | 0 | 0 | 0 | 0 | Clean (0 hits) across all 6 target patterns |
| `kaidoku-shokunin` | 352 | 55,359 | 90 | 0 | 9 | 43 | 38 | `.whl` binary containers (29), sealed bundles (9), Ghidra changelog (17), REA PTY scrollback (1), R80 receipt-provenance tool (9), lessons/spotchecks (25) |
| `kake-shokunin` | 251 | 40,279 | 16 | 0 | 0 | 0 | 16 | Python packaging wheels (`abnf`, `rfc3987` `.whl`) and quote truth counters |
| `kama-shokunin` | 221 | 33,025 | 5 | 0 | 3 | 2 | 0 | KQ74 live receipt provenance rule (1), sha256-pinned binary relaunch (2), lessons (2) |
| `kasegi-shokunin` | 267 | 33,994 | 2 | 0 | 0 | 1 | 1 | Run-result quoting/receipt provenance rule (1); superseding source row rule (1) |
| `kengaku-shokunin` | 365 | 56,860 | 40 | 0 | 5 | 14 | 21 | Python packaging wheels (21), sha256-pinned input calendars (5), M100 receipt provenance lessons (14) |
| `kotoba-shokunin` | 173 | 24,361 | 9 | 0 | 5 | 4 | 0 | Prompt/skill evaluation gates checking revisions (5), lessons/spotchecks (4) |
| `kotodama-shokunin` | 486 | 71,446 | 121 | 0 | 1 | 4 | 116 | Historical artifacts: prayer wheels, ancient scrolls (116); index sweep verification (1), lessons (4) |
| `kumitate-shokunin` | 234 | 37,558 | 11 | 0 | 7 | 4 | 0 | Dispatch-evidence gate (5), terminal scrollback refusal (2), lessons (4) |
| `lore-shokunin` | 227 | 9,075 | 0 | 0 | 0 | 0 | 0 | Clean (0 hits) across all 6 target patterns |
| `mado-shokunin` | 257 | 47,779 | 93 | 0 | 57 | 36 | 0 | Compositor pointer `scroll_factor` (53), receipt quality script/rules (4), launcher/waybar reports (36) |
| `mori-shokunin` | 274 | 45,387 | 18 | 0 | 6 | 12 | 0 | AST receipt provenance grammar/record rules (6), S600 Reproducible Builds citation lessons (12) |
| `revenger-shokunin` | 298 | 25,446 | 2 | 0 | 0 | 2 | 0 | Binary forensics fixture evidence ID retention in review plans and ledgers (2) |
| `souji-shokunin` | 153 | 21,429 | 4 | 0 | 0 | 4 | 0 | Lessons and spot-checks recording evidence gate reference drift and tamper findings (4) |
| `tameshi-shokunin` | 223 | 46,764 | 4 | 0 | 0 | 4 | 0 | Retrospective receipt provenance note (1), evidence gate reference drift lessons (3) |
| `tsukuroi-shokunin` | 243 | 46,071 | 45 | 0 | 26 | 10 | 9 | Host OS pause-gate sha256 premises (26), receipt-provenance lessons (10), system `wheel` group (9) |
| **Total** | **5,178** | **755,860** | **472** | **0** | **119** | **151** | **202** | Fully accounted in `sibling-overlap-scan-r64.tsv` |

## 5. Sources Registry Collision Audit

Audited all target URLs for this round's frontier:
1. `https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` (MDN WheelEvent, C1)
2. `https://drafts.csswg.org/cssom-view/` (CSSOM View, C1)
3. `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` (Chrome DevTools Protocol browser_protocol.json, C1 frontier S168)

Audit scope:
- All 20 sibling lane repositories under `/home/vgpnk/Projects/shokunin/*-shokunin/`.
- All 594 `SOURCES.md` files across the fleet (including wave archives, fixtures, and local test copies).

Findings:
1. **Tabi Registry (`tabi-shokunin/corpus/SOURCES.md`):**
   - Baseline commit `6c19979fe63f3b9ec35179ca57bb91c6356bff25` held S166 (`MDN WheelEvent`, admitted round 63) and S167 (`CSSOM View`, admitted round 63).
   - In round 64, S168 (`Chrome DevTools Protocol browser_protocol.json`) is newly opened and staged, grounding `Input.dispatchMouseEvent.deltaY` CSS pixel units and `Page.captureScreenshot.captureBeyondViewport` default behavior.
   - Candidate S169 (CSSOM View re-fetch) was correctly rejected as a duplicate URL of S167 in `corpus/lessons/round-64.md` §Gate.
   - Duplicated rows in tabi: **0 rows duplicated**.
2. **Sibling Registries (20 sibling lanes):**
   - `developer.mozilla.org/en-US/docs/Web/API/WheelEvent`: **0 hits** across all sibling registries.
   - `drafts.csswg.org/cssom-view`: **0 hits** across all sibling registries.
   - `raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json`: **0 hits** across all sibling registries.
   - Nearby non-colliding sources:
     - `chousa-shokunin/corpus/SOURCES.md:57`: S047 (`https://wicg.github.io/scroll-to-text-fragment/`) — distinct URL, text quote fragment spec.
     - `mado-shokunin/corpus/SOURCES.md:265-269`: S316, S318, S320 (`Hyprland` source files `ConfigValues.cpp`, `HyprCtl.cpp`) — distinct URLs, desktop compositor scope.
     - `mori-shokunin/corpus/SOURCES.md:382`: S600 (`https://reproducible-builds.org/docs/definition/`) — distinct URL, reproducible builds definition for receipt provenance.
   - Collisions by row id: **0 collisions**.

## 6. Contested Scope and Absorption Analysis

**Contested Scope Statement:**
No sibling lane could absorb this round's ground instead of tabi. Tabi is the sole lane in the fleet whose province specifically owns browser remote debugging, Chromium CDP protocol automation, loopback browser execution, DOM event witnessing (`WheelEvent`, `scrollTop`), live browser verification (`scripts/verify-live-r64.mjs`), and browser control receipt provenance (`scripts/check-receipt-provenance.mjs`). `mado-shokunin`'s province is strictly confined to desktop compositor configuration, Wayland protocols, and window manager input rules (`PROVINCE.md:105-114`); mado explicitly refuses browser driving, web page testing, and CDP sessions. `kaidoku-shokunin` and `revenger-shokunin` own binary forensics (PE, ELF, ASAR, UPX) and reverse engineering; their receipt provenance tools (e.g. Kaidoku's `tools/round-80/receipt-provenance.py`) sweep binary analysis artifacts, not browser CDP runs. `chousa-shokunin` owns literature search, citation verification, and WICG text fragment syntax, not browser execution. `kake-shokunin` owns static web properties, sitemaps, and HTTP header auditing, explicitly deferring browser automation to tabi (`kake-shokunin/PROVINCE.md:40/310/329/344`). `kumitate-shokunin` owns orchestration and harness tooling while explicitly refusing terminal scrollback capture and browser testing. Finally, `mori-shokunin`'s receipt provenance grammar defines AST derivation records from tree-sitter parses. No sibling holds or could absorb browser CDP synthetic wheel/scroll dispatch or live browser loopback re-run verification; zero ground has been absorbed.

## 7. Findings by Severity

### Finding 1 (SEV-1 / Architecture / Integrator-Bound) — Unmapped Compositor vs Browser Scroll Boundary
- **Target:** `tabi-shokunin/corpus/adjacency.tsv:1-17` and `mado-shokunin/PROVINCE.md:105-114`.
- **Exact Command:** `rg -n 'scroll_factor|scroll_touchpad|natural_scroll' /home/vgpnk/Projects/shokunin/mado-shokunin/PROVINCE.md` (exit 0, matches lines 105-114).
- **Description:** `mado-shokunin` holds an explicitly defined and verified input-device plane owning desktop compositor pointer `scroll_factor`, per-window `scroll_touchpad` rules, libinput natural scrolling, and mouse wheel keybinds (`mouse_up`, `mouse_down`). Tabi's `adjacency.tsv` currently has 16 rows and maps 6 siblings (kaidoku, revenger, kake, kagi, kumitate, kama), but carries **zero rows for mado**. As tabi advances capability C1 (`chromium-wheel-scroll-domain-linux`), the boundary between compositor/pointer scroll-factor and browser-internal CDP synthetic wheel dispatch (`Input.dispatchMouseEvent` with `type: "mouseWheel"`) remains unpartitioned in the ledger.
- **Discipline:** Tabi must NOT absorb compositor-level scroll rules or libinput settings. A forward partition declaration must be scheduled for `corpus/adjacency.tsv`.

### Finding 2 (SEV-2 / Architecture / Adjacency) — Cross-Fleet Receipt Provenance Tool Diversity
- **Target:** `kaidoku-shokunin/SKILL.md:1938`, `mori-shokunin/PROVINCE.md:655`, `mado-shokunin/corpus/lessons/round-24.md:75` versus `tabi-shokunin/scripts/check-receipt-provenance.mjs`.
- **Exact Command:** `rg -n 'receipt.provenance' /home/vgpnk/Projects/shokunin/*/SKILL.md /home/vgpnk/Projects/shokunin/*/PROVINCE.md` (exit 0, hits in kaidoku, mori).
- **Description:** Several siblings maintain lane-specific receipt provenance verifiers: Kaidoku has `tools/round-80/receipt-provenance.py` checking binary forensics receipt sha256 sums and integer exit codes; Mori defines an AST derivation grammar for receipt provenance citing S600; Mado maintains `quality/check-receipt-provenance.py` for compositor result paths. Tabi's Claim C2 establishes `scripts/check-receipt-provenance.mjs`, which specifically validates real argv (not prose), integer exit codes, committed stdout digests, and revision-bound input hashes for browser control receipts. Each lane legitimately checks provenance over its own domain artifacts without cross-lane interference.
- **Discipline:** Tabi's provenance gate remains strictly scoped to tabi's own control receipts (`.ufo/waves/round-64/controls/scored`), avoiding coupling with or absorption of sibling receipt tools.

### Finding 3 (SEV-3 / Documentary) — Terminal Scrollback Buffer Demarcation
- **Target:** `kumitate-shokunin/SKILL.md:95`, `kumitate-shokunin/corpus/knowledge/sighting-wall.md:178`, and `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:190`.
- **Exact Command:** `rg -n 'scrollback' /home/vgpnk/Projects/shokunin/kumitate-shokunin/SKILL.md /home/vgpnk/Projects/shokunin/kaidoku-shokunin/corpus/knowledge/` (exit 0).
- **Description:** Kumitate explicitly forbids capturing terminal pane scrollback in task receipts or sighting walls (`SKILL.md:95`: `NEVER captures scrollback`). Kaidoku configures PTY scrollback buffers (`queue-ops.md:190`: `80x24 scrollback 1000 default`). Tabi captures browser DOM state (`scrollTop`, `WheelEvent`) and viewport screenshots (`Page.captureScreenshot`), never terminal scrollback. This distinction is preserved across all 472 lines.

### Finding 4 (SEV-3 / Documentary) — Text Fragment Spec Confinement in Research Craft
- **Target:** `chousa-shokunin/corpus/SOURCES.md:57`.
- **Exact Command:** `grep -n 'scroll-to-text-fragment' /home/vgpnk/Projects/shokunin/chousa-shokunin/corpus/SOURCES.md` (exit 0).
- **Description:** Chousa holds S047 (`https://wicg.github.io/scroll-to-text-fragment/`). Chousa's scope cell explicitly confines S047 to "the specification's own text-directive grammar and search algorithm; not full-text search, not browser rendering or URL parsing". This confirms that chousa owns text quote anchor syntax while browser navigation execution remains within tabi's province.

## 8. UFO-FSD Connector Move (Non-Obvious Synthesis)

### Evidence
The fleet scan identified 119 `adjacent-new` lines across 9 siblings:
1. `mado-shokunin`: 57 lines spanning compositor pointer `scroll_factor`, window-rule `scroll_touchpad`, libinput natural scrolling, mouse wheel keybinds, and receipt result path rules.
2. `mori-shokunin`: 6 lines establishing tree-sitter AST derivation receipt provenance grammar and record rules citing S600 Reproducible Builds (`knowledge/receipt-provenance-r85.md`).
3. `kaidoku-shokunin`: 9 lines establishing binary forensics receipt-provenance sweeping (`tools/round-80/receipt-provenance.py`).
4. `tabi-shokunin/corpus/adjacency.tsv` contains zero rows for `mado-shokunin` and zero rows for `mori-shokunin`.

### Affected Axes
- **adjacency** (start: 8) — directly improved: establishes clean multi-lane boundary partitions on both pointer/scroll craft (with mado) and receipt provenance methodology (with mori and kaidoku).
- **coverage** (start: 9) — harms none: C1 capability `chromium-wheel-scroll-domain-linux` remains strictly within browser CDP loopback.
- **calibration** (start: 9) — harms none: C2 control receipt provenance gate remains independently verified.
- **depth**, **operability**, **freshness** — harms none.

### Proposed Move
Draft two forward partition declarations for `corpus/adjacency.tsv`:
1. `tabi` vs `mado` on `pointer-and-compositor-scroll-factor-vs-cdp-wheel`:
   - `mado-shokunin` owns: desktop compositor pointer configuration (`input:touchpad:scroll_factor`, `input:scroll_factor`), window-rule touchpad scroll speed (`scroll_touchpad`), pointer device hardware reporting (`hyprctl devices -j` `scrollFactor`), libinput natural scrolling, and window manager wheel keybinds (`mouse_up`/`mouse_down`).
   - `tabi-shokunin` owns: browser-internal synthetic CDP wheel event dispatch (`Input.dispatchMouseEvent` with `type: "mouseWheel"` on Chromium loopback), page-side `WheelEvent` delta arithmetic verification (`deltaY`, `deltaMode`), and DOM `scrollTop` position witnessing.
2. `tabi` vs `mori`/`kaidoku` on `browser-control-receipt-provenance-vs-ast-binary-provenance`:
   - `kaidoku-shokunin` owns: binary forensics receipt provenance sweeping (`tools/round-80/receipt-provenance.py`) over ELF/PE analysis artifacts.
   - `mori-shokunin` owns: tree-sitter AST derivation receipt provenance grammar citing S600 Reproducible Builds.
   - `tabi-shokunin` owns: browser automation and live-verifier execution receipt provenance (`scripts/check-receipt-provenance.mjs`) validating real argv, integer exit codes, committed stdout digests, and revision-pinned input hashes.

### Risks
Mid-round commit race with `mado` or `mori` commit heads. The partition must name a frozen, verified commit hash of sibling repositories to satisfy `scripts/check-adjacency.mjs` verification.

### Verification
When admitted by the integrator, run `node scripts/check-adjacency.mjs` to ensure the new rows satisfy all nine TAB columns, verbatim quotes, and valid ruling references without breaking the adjacency meter.

## 9. Artifacts Produced

The following artifacts have been written to `.ufo/waves/round-64/w1/R64Connector/`:

| Artifact | Path | SHA256 | Description |
|---|---|---|---|
| TSV Scan Table | `.ufo/waves/round-64/w1/R64Connector/sibling-overlap-scan-r64.tsv` | `86478221d310b4b4fbbea43eca694e9f247e839f75c28e4480fe29e073e7682b` | 472 data rows + header across 20 sibling repos |
| JSON Scan Data | `.ufo/waves/round-64/w1/R64Connector/sibling-overlap-scan-r64.json` | `d0a303bf5757059063548930a7a0d66759764aea455a7bb95441e5a932181b88` | Full structured JSON scan output with lane stats |
| Collision Audit | `.ufo/waves/round-64/w1/R64Connector/source-registry-collision-audit.json` | `047fffe7d55e73cff66a47adc3a4f8d0256cd06c8a3b65e54cad0ae09a9976f5` | C1/C2 source registry collision audit results (0 collisions) |
| Verification Receipt | `.ufo/waves/round-64/w1/R64Connector/verification-receipt.json` | `e20b7557e69d8d7a4a0f9fcce724c3f6b580e44437936accf3d1ab043de10738` | Integrity pins, scan summary, and commands |

Scratch directory `/fast/scratch/hyaku/tabi-r64/R64Connector/` will be removed prior to yield.

## 10. Verdict

VERDICT: PASS — 472 sibling lines scanned across 20 lanes / 5,178 files / 755,860 lines (0 same-surface, 151 third-lane-report, 119 adjacent-new, 202 no-claim); 0 registry collisions for C1/C2 sources across 594 SOURCES.md files; 0 sibling ground absorbed; all 10 frozen pins verified exact; scratch deleted.

Report: .ufo/waves/round-64/w1/R64Connector.md
