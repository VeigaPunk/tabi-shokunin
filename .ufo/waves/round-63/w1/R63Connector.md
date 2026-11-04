# R63Connector — Sibling-Overlap and Registry-Duplicate Scan for Wheel/Scroll Ground (Round 63, Wave w1)

Seat: R63Connector (leaf, connector). Independently derived; no files shared with other seats. Fleet root `/home/vgpnk/Projects/shokunin` treated strictly as READ-ONLY. No instrument, snapshot, pin, production file, or sibling file was modified; all git reads used read-only git subcommands with `-C`. No subagents, no background jobs, no `agent://all` messages. Scratch root `/fast/scratch/hyaku/tabi-r63/R63Connector/` created and deleted prior to yield.

## 1. Axes

- **adjacency** (judged axis, start: 8) — target of this connector analysis: audit sibling overlap, identify adjacent boundaries, ensure zero improper absorption.
- **coverage** (start: 9, target: 9) — C1 capability `chromium-wheel-scroll-domain-linux` on Linux Chromium.
- **depth** (start: 9) — untouched.
- **operability** (start: 9) — untouched.
- **freshness** (start: 9) — untouched.
- **calibration** (start: 9, target: 9) — C2 self-assessment gate repair 2 -> 0 mismatches.

## 2. Inputs & Pin Integrity

Read FIRST per contract:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-63/claims.json` (baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`, freeze `816592612dd2a8073437c595d3fe3c477125cf3c`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/PROVINCE.md`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency.tsv`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
- 20 sibling lane repositories under `/home/vgpnk/Projects/shokunin/*-shokunin`.

### Frozen Pin Integrity (sha256 exact match against claims.json)

| Frozen File Path | Expected SHA256 (claims.json) | Observed SHA256 | Status |
|---|---|---|---|
| `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | exact |
| `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` | exact |
| `.ufo/waves/round-63/counters/mutate-r63.mjs` | `4bf6e61404c1733778f32f14a18d807cdeff7aa5cc051bab54a074bab65571fb` | `4bf6e61404c1733778f32f14a18d807cdeff7aa5cc051bab54a074bab65571fb` | exact |
| `.ufo/waves/round-63/counters/make-negatives-r63.mjs` | `598a19da3a5d214de82f15789c2616b753e34ee16d9fea83d134e36749add2eb` | `598a19da3a5d214de82f15789c2616b753e34ee16d9fea83d134e36749add2eb` | exact |
| `.ufo/waves/round-63/counters/old-generation-r63.mjs` | `1ee9cda2661b178c233b292c02fe3320cfe6a1b23c0a3bbb060400ed5d7674c8` | `1ee9cda2661b178c233b292c02fe3320cfe6a1b23c0a3bbb060400ed5d7674c8` | exact |
| `.ufo/waves/round-63/counters/mutants-r63.json` | `5f0efd8fddc499acc7ebec8d2101aa0bfc2c46fac281c9193177861dd8731c8c` | `5f0efd8fddc499acc7ebec8d2101aa0bfc2c46fac281c9193177861dd8731c8c` | exact |
| `.ufo/waves/round-63/sources/s166b-mdn-wheelevent.html` | `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1` | `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1` | exact |
| `.ufo/waves/round-63/sources/s167-cssom-view.html` | `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99` | `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99` | exact |

All 8 pins verified identical to frozen bytes.

## 3. Commands Executed

All commands executed with zero exit status (rc 0):
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` (rc 0)
- `sha256sum <8 pinned files>` (rc 0)
- `python3 -c '... scan 20 sibling repos ...'` (rc 0, scanned 20 sibling lanes)
- `python3 -c '... audit 29 SOURCES.md files across fleet ...'` (rc 0)
- `python3 -c '... generate TSV, JSON, and collision audit ...'` (rc 0)

## 4. Sibling-Overlap Scan Results

Executed query across all 20 sibling lanes (`*-shokunin` excluding `tabi-shokunin`):
`rg -n -i 'wheel|scroll|deltaY|scrollTop' --glob '*.md' SKILL.md PROVINCE.md corpus/` (excluding `.git` and `node_modules`).

- Repositories scanned: 20 sibling lanes.
- Repositories with hits: 9 lanes (audio, chousa, kaidoku, kake, kengaku, kotodama, kumitate, mado, tsukuroi).
- Repositories clean (0 hits): 11 lanes (game-dev-2d, game-dev-3d, kagi, kama, kasegi, kotoba, lore, mori, revenger, souji, tameshi).
- Total matched lines: **299**.
- Keyword presence: `deltaY` (0 hits), `scrollTop` (0 hits), `wheel` and `scroll` (299 hits).

### Totals by Disposition

| Disposition | Count | Meaning / Scope |
|---|---|---|
| **same-surface** | **0** | No sibling lane claims or executes browser-internal CDP wheel/scroll events. Tabi owns this surface exclusively. |
| **third-lane-report** | **55** | Lines reporting craft, measurements, or upstream tools owned by that sibling: chousa (5) WICG text quote spec; kaidoku (17) Ghidra GUI release notes; mado (33) Walker launcher scroll boxes, Waybar scroll actions, scrolling layout column geometry, and Hyprland C++ source analysis. |
| **adjacent-new** | **56** | Adjacent boundaries that tabi must NOT absorb: mado (53) desktop compositor pointer scroll factors, touchpad scroll window rules, libinput natural scrolling, and mouse wheel keybinds; kumitate (2) orchestrator terminal pane scrollback refusal; kaidoku (1) REA terminal runner PTY scrollback buffer option. |
| **no-claim** | **188** | Lexical coincidence with non-software or non-input sense: kotodama (116) parchment/amulet scrolls, prayer wheels, ornamental motifs; kaidoku (29) Python `.whl` binary packages; kengaku (21) Python `.whl` model/test packages; kake (12) Python `.whl` oracle packages; tsukuroi (9) Linux OS usergroup `wheel` and journal ACLs; audio (1) JACK transport `free-wheel`. |
| **Total** | **299** | Complete accounting over all hits across all sibling repos. |

### Per-Lane Breakdown

| Sibling Lane | Hits | same-surface | third-lane-report | adjacent-new | no-claim | Primary Subject Matter |
|---|---|---|---|---|---|---|
| `audio-shokunin` | 1 | 0 | 0 | 0 | 1 | JACK audio transport freewheeling mode (`free-wheel`) |
| `chousa-shokunin` | 5 | 0 | 5 | 0 | 0 | S047 WICG `scroll-to-text-fragment` citation for quote search algorithm |
| `kaidoku-shokunin` | 47 | 0 | 17 | 1 | 29 | Python `.whl` binary containers (29), Ghidra GUI changelog (17), REA PTY scrollback (1) |
| `kake-shokunin` | 12 | 0 | 0 | 0 | 12 | Python packaging wheels (`abnf`, `rfc3987` `.whl`) for URI oracles |
| `kengaku-shokunin` | 21 | 0 | 0 | 0 | 21 | Python packaging wheels (`vectorops`, `json-repair`, `urllib3`, `pip`, `torch`) |
| `kotodama-shokunin` | 116 | 0 | 0 | 0 | 116 | Historical/material artifacts: prayer wheels, water wheels, ancient scrolls, vegetal ornament |
| `kumitate-shokunin` | 2 | 0 | 0 | 2 | 0 | Orchestrator refusal: task receipts and sighting walls NEVER capture pane scrollback |
| `mado-shokunin` | 86 | 0 | 33 | 53 | 0 | Compositor pointer `scroll_factor` (53), launcher/waybar/layout reports (33) |
| `tsukuroi-shokunin` | 9 | 0 | 0 | 0 | 9 | Linux system group `wheel` and journal `/var/log/journal` ACLs |
| **Total** | **299** | **0** | **55** | **56** | **188** | Fully accounted in `sibling-overlap-scan-r63.tsv` |

## 5. C1 Sources Registry Collision Audit

Audited both target URLs for Claim C1:
1. `https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` (MDN WheelEvent)
2. `https://drafts.csswg.org/cssom-view/` (CSSOM View)

Against all 29 `SOURCES.md` files across the fleet (`/home/vgpnk/Projects/shokunin/*-shokunin/**/SOURCES.md`):

1. **Tabi Registry (`tabi-shokunin/corpus/SOURCES.md`):**
   - At baseline commit `f098bcf8` and freeze commit `81659261`, the registry ended at `S165` (`MDN Pointer events`, opened 2026-11-04 round 62). Neither C1 URL was present.
   - In the worktree, both sources are staged:
     - `S166`: `MDN WheelEvent — https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` (docs, tier B, teaches deltaX/deltaY/deltaZ/deltaMode semantics).
     - `S167`: `CSSOM View — https://drafts.csswg.org/cssom-view/` (spec, tier A, teaches Element.scrollTop getter).
   - Prior row duplication: **0 rows duplicated**.
   - Newly held rows: **2 rows** (`S166`, `S167`).

2. **Sibling Registries (20 sibling lanes):**
   - `developer.mozilla.org/en-US/docs/Web/API/WheelEvent`: **0 hits** across all sibling registries.
   - `drafts.csswg.org/cssom-view`: **0 hits** across all sibling registries.
   - Nearby non-colliding sources:
     - `chousa-shokunin/corpus/SOURCES.md:57`: `S047` (`https://wicg.github.io/scroll-to-text-fragment/`) — distinct URL, text quote fragment spec.
     - `mado-shokunin/corpus/SOURCES.md:265-269`: `S316`, `S318`, `S320` (`Hyprland` source files `ConfigValues.cpp`, `HyprCtl.cpp`) — distinct URLs, desktop compositor scope.
   - Collisions by row id: **0 collisions**.

## 6. Findings by Severity

### Finding 1 (SEV-1 / Architecture / Integrator-Bound) — Unmapped Compositor vs Browser Scroll Boundary
- **Target:** `tabi-shokunin/corpus/adjacency.tsv:1-17` and `mado-shokunin/PROVINCE.md:105-114`.
- **Description:** `mado-shokunin` holds an explicitly defined and verified input-device plane (`PROVINCE.md:105-114`, `SKILL.md:2210-2234`, `corpus/knowledge/hyprland-input-devices-r46.md`) owning desktop compositor pointer `scroll_factor`, per-window `scroll_touchpad` rules, libinput natural scrolling, and mouse wheel keybinds (`mouse_up`, `mouse_down`). Tabi's `adjacency.tsv` currently has 16 rows and maps 6 siblings (kaidoku, revenger, kake, kagi, kumitate, kama), but carries **zero rows for mado**. As tabi adds capability C1 (`chromium-wheel-scroll-domain-linux`), the boundary between compositor/pointer scroll-factor and browser-internal CDP synthetic wheel dispatch (`Input.dispatchMouseEvent` with `type: "mouseWheel"`) is unpartitioned in the ledger.
- **Discipline:** Tabi must NOT absorb compositor-level scroll rules or libinput settings. A future round should record a declared-split partition.

### Finding 2 (SEV-2 / Operational / Non-Author Warning) — Terminal Scrollback Buffer Demarcation
- **Target:** `kumitate-shokunin/SKILL.md:95`, `kumitate-shokunin/corpus/knowledge/sighting-wall.md:178`, and `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:190`.
- **Description:** Kumitate explicitly forbids capturing terminal pane scrollback in task receipts or sighting walls (`SKILL.md:95`: `NEVER captures scrollback`). Kaidoku configures PTY scrollback buffers (`queue-ops.md:190`: `80x24 scrollback 1000 default`). Tabi captures browser DOM state and screenshot evidence, never terminal scrollback. This distinction is preserved: zero terminal scrollback lines were absorbed.

### Finding 3 (SEV-3 / Documentary) — Text Fragment Spec Confinement in Research Craft
- **Target:** `chousa-shokunin/corpus/SOURCES.md:57`.
- **Description:** Chousa holds S047 (`https://wicg.github.io/scroll-to-text-fragment/`). Chousa's scope cell explicitly confines S047 to "the specification's own text-directive grammar and search algorithm; not full-text search, not browser rendering or URL parsing". This confirms that chousa owns text quote anchor syntax while browser navigation execution remains within tabi's province.

## 7. UFO-FSD Connector Move (Non-Obvious Synthesis)

### Evidence
The fleet scan identified 56 `adjacent-new` lines across siblings, with 53 concentrated in `mado-shokunin` spanning compositor pointer `scroll_factor`, window-rule `scroll_touchpad`, libinput natural scrolling, and mouse wheel binds. `tabi-shokunin/corpus/adjacency.tsv` contains zero rows for `mado-shokunin`.

### Affected Axes
- **adjacency** (start: 8) — directly improved: establishes clear partition on pointer/scroll craft between desktop compositor and browser CDP.
- **coverage** (start: 9) — harms none: C1 capability `chromium-wheel-scroll-domain-linux` remains strictly within browser CDP loopback.
- **calibration** (start: 9) — harms none: C2 self-assessment gate remains unchanged.

### Proposed Move
Draft a forward partition declaration between `tabi` and `mado` on `pointer-and-compositor-scroll-factor-vs-cdp-wheel`:
- `mado-shokunin` owns: desktop compositor pointer configuration (`input:touchpad:scroll_factor`, `input:scroll_factor`), window-rule touchpad scroll speed (`scroll_touchpad`), pointer device hardware reporting (`hyprctl devices -j` `scrollFactor`), libinput natural scrolling, and window manager wheel keybinds (`mouse_up`/`mouse_down`).
- `tabi-shokunin` owns: browser-internal synthetic CDP wheel event dispatch (`Input.dispatchMouseEvent` with `type: "mouseWheel"` on Chromium loopback), page-side `WheelEvent` delta arithmetic verification (`deltaY`, `deltaMode`), and DOM `scrollTop` position witnessing.

### Risks
Mid-round commit race with `mado`'s commit head. The partition must name a frozen, verified commit hash of `mado-shokunin` to avoid verification failures under `scripts/check-adjacency.mjs`.

### Verification
When admitted by the integrator, run `node scripts/check-adjacency.mjs` to ensure the new row satisfies all nine TAB columns, verbatim quotes, and valid ruling references without breaking the adjacency meter.

## 8. Artifacts Produced

The following artifacts have been written to `.ufo/waves/round-63/w1/R63Connector/`:

| Artifact | Path | SHA256 | Description |
|---|---|---|---|
| TSV Scan Table | `.ufo/waves/round-63/w1/R63Connector/sibling-overlap-scan-r63.tsv` | `be307e0ac1526a48d3787069743641f89a29107d5f9201950e49c8ced305e219` | 299 data rows + header + totals by disposition |
| JSON Scan Data | `.ufo/waves/round-63/w1/R63Connector/sibling-overlap-scan-r63.json` | `62fd2c6ea1e9cb4d50594c94104a6e9b423f565a673e709c8da840c899b9d43c` | Full structured JSON scan output |
| Collision Audit | `.ufo/waves/round-63/w1/R63Connector/source-registry-collision-audit.json` | `f18a5c8749a8aadbdb9e23ed09d4b0b20058e79d166b2f55cbf8b7554bcd73d2` | C1 source registry collision audit results |
| Verification Receipt | `.ufo/waves/round-63/w1/R63Connector/verification-receipt.json` | `b05aaf599e5761b02413a39f616cf10a2f32857e39d02c92ea91fb94e2d41497` | Integrity pins, scan summary, and commands |

Scratch directory `/fast/scratch/hyaku/tabi-r63/R63Connector/` was removed prior to completion.

VERDICT: PASS — 299 sibling lines scanned across 20 lanes (0 same-surface, 55 third-lane-report, 56 adjacent-new, 188 no-claim); 0 registry collisions for C1 sources; S166 and S167 newly held; scratch deleted.

Report: .ufo/waves/round-63/w1/R63Connector.md
