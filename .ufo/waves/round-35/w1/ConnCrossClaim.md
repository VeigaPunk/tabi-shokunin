# ConnCrossClaim — round 35 w1 report

**Verdict:** The cross-claim scan finds no sibling claim on the Firefox surface and no new adjacency ground: of 20 sibling lanes grepped at their frozen pins for `firefox|gecko|marionette|webkit` (SKILL.md/corpus/PROVINCE.md), only 10 have hits and every hit is either outside candidate scope (SOURCES/lessons/evidence/source-snapshots/fixtures/live assets) or, for the four in-scope knowledge lines (kotodama worldbuilding:3, kumitate jj-workspace:2/75/80/167, mado idle-lock:39 and walker-deep:285), fails the frozen BG regex — which includes `geckodriver` but not `firefox`/`gecko`/`marionette`/`webkit` — and `c1-candidates.tsv` itself contains zero engine terms. Thus C2's second-engine surface is this round exclusively tabi's own acquisition. The geckodriver 0.37.1 default `--websocket-port 9222` (verified via `--help`) equals the already-mapped musketeer CDP lease port: a **same-surface fact** (rows 7–8 `musketeer-cdp-9222-profile-lease`, kake/kagi, contested-open, ruling fleet l0:62; plus kama census row 11), not a new boundary — the note below is launch guidance anchored to those verified rows, per QUALITY 91. Sibling-overlap: only kaidoku has a post-pin commit touching SKILL.md/corpus/knowledge (`d764389e`, round-41 freeze, SKILL.md +78/−4, knowledge +111), which cannot move this round's pin-frozen candidates; all 20 pins remain ancestors of their lane tips.

## Evidence

### Item 1 — engine claims at pins (`git -C <lane> grep -n -i -E 'firefox|gecko|marionette|webkit' <pin> -- SKILL.md corpus PROVINCE.md`)

- Hits: audio `corpus/live/gst-scout/probe-inventory-r77.json:958`, `corpus/live/r62-boundary/src/codec_desc.c:2930` (Gecko codec name); game-dev-2d 7 binary matches (fixture.x86_64); game-dev-3d `corpus/fixtures/r94vendor/three.core.js:50538,52503`; kake `corpus/SOURCES.md:26,193`, `corpus/lessons/round-20.md:188,220,263`; kasegi `corpus/source-snapshots/round-24/S011.txt:335`, `round-32/S049.txt:391`, `round-35/S052.txt:*`; kengaku `corpus/evidence/round12-fleet/r12-prior-art-transport.md:500,522`; kotodama `corpus/QUALITY.md:68,70`, `corpus/SOURCES.md:470,471,836`, `corpus/knowledge/culture-material/worldbuilding-setting-practice.md:3`, lessons round-62/64/73; kumitate `corpus/SOURCES.md:151`, `corpus/knowledge/jj-workspace-seat-containment.md:2,75,80,167`, lessons round-64/65; mado `corpus/knowledge/idle-lock-route-r17.md:39`, `corpus/knowledge/walker-deep.md:285`; mori `corpus/evidence/{recheck-r32,sources-r32/r36/r37}/*.src`. No hits (exit 1): chousa, kagi, kaidoku, kama, kotoba, lore, revenger, souji, tameshi, tsukuroi.
- `grep -inE 'firefox|gecko|marionette|webkit' .ufo/waves/round-35/baseline/c1-candidates.tsv` → exit 1 (0 hits).
- BG regex: `c1-adjacency-sweep-v3.mjs:82` (quoted in crossclaim.md §4).

### Item 2 — geckodriver default port

- `/home/vgpnk/.local/bin/geckodriver --version` → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`, exit 0.
- `/home/vgpnk/.local/bin/geckodriver --help 2>&1 | grep -iE 'websocket'` → `--websocket-port <PORT>` / `Port to use to connect to WebDriver BiDi [default: 9222]`, exit 0.
- Map rows: `corpus/adjacency.tsv` rows 7 (kake `PROVINCE.md:35`), 8 (kagi `PROVINCE.md:43`), ruling `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62`, tabi side `SKILL.md:556`; row 11 kama census `corpus/knowledge/listener-census.md:355`.
- Counter discipline: `c2-firefox-bidi.mjs:57-58` ("a free --websocket-port (never the 9222 default)"); `c2-instrument-check.json` ws URLs on ephemeral ports 41155/37361.

### Item 3 — post-pin commits

- `git -C <lane> log --format='%h %ad %s' --date=short <pin>..HEAD -- SKILL.md corpus/knowledge` → only kaidoku: `d764389e 2026-10-26 round-41: freeze` (numstat `SKILL.md 78 4`, `corpus/knowledge/2026-10-26-r41-sqfs-triage-v3.md 111 0`); 19 lanes empty.
- `git merge-base --is-ancestor <pin> HEAD` exit 0 for all 20 lanes.

## Deliverables

- `.ufo/waves/round-35/w1/ConnCrossClaim/crossclaim.md` — full scan: engine-hit inventory with verdicts, drafted one-paragraph lane note (§2), sibling-log table (§3), frozen BG regex (§4).
- This report.

No tools installed; no network fetches; no browser/driver launched; scratch clone `/fast/scratch/hyaku/tabi-r35/ConnCrossClaim/clone` (a4bfef0, detached) removed before yield. Read-only git throughout.
