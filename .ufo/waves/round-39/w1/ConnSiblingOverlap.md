# ConnSiblingOverlap — sibling-overlap scan, tabi round 39, wave 1

Seat: `ConnSiblingOverlap` (connector, leaf — no subagent dispatch, no spawn).
Item: read the fleet lane roster and sibling PROVINCE / SCORECARD / round-39 reports, read-only, for overlap with the browser-egress / session-bound evidence work (C1 coverage, Playwright Firefox via Juggler against the loopback fixture) and the C2 calibration repair.
Scope: read-only over `/home/vgpnk/Projects/shokunin/*`. No sibling file was written, no git/jj mutation, no browser launched, no fixture created, no tool installed. Scratch dir `/fast/scratch/hyaku/tabi-r39/ConnSiblingOverlap` was created and removed.

## Frozen inputs read first

- `.ufo/waves/round-39/claims.json` (schema `tabi-round-claims-v2`, frozen at `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`).
  - C1 (coverage, capability-acquisition): Playwright 1.64.0 + Firefox 157.0 via Juggler, loopback fixture, observed by `scripts/playwright-firefox-egress-round39.mjs`; frozen counter `c1-egress-session-bound.mjs`.
  - C2 (calibration, instrument-repair): round-38 routed residuals 1-2; frozen counter `c2-routed-defects-v2.mjs`.
- Both frozen counters read in full (predicate sentences match `claims.json`). Neither counter reads sibling lanes; C1 reads only the lane's own committed receipt at REV, C2 reads only the lane's own SCORECARD/LOG/census/numstat at REV. Neither has a cross-lane input, so sibling activity cannot alter their verdicts.

## Roster

`.ufo/state/*.round` lists 21 lanes (aggregator, audio, chousa, game-dev-2d, game-dev-3d, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kumitate, lore, mado, mori, protocol, revenger, tabi, tameshi, tsukuroi). 21 `PROVINCE.md` files exist. `.ufo/state/*.mission` and `*.out` contain no Playwright / Firefox / Juggler / session-bound / egress term. `.tower/comms`, `.ufo/gates`, `.ufo/scopes` contain no such term.

## Sweep (bounded, exact commands)

Full evidence file: `.ufo/waves/round-39/w1/ConnSiblingOverlap/sweep-evidence.txt`.

1. Tight term sweep over every sibling `PROVINCE.md`, `SCORECARD.md` and `.ufo/waves/round-39/` tree for `playwright|juggler|session-bound|firefox|egress-round|c1-egress` (excluding tabi, html, sha256 manifests, and a hypr window-rule file). Hits:
   - `kaidoku-shokunin/PROVINCE.md:137` — "Runtime observation verbs: self-launched CDP/V8-inspector targets".
   - `kaidoku-shokunin/.ufo/waves/round-39/w2/artifacts/R39W2C2AxisFit/SKILL-{rename,cause}.md:189` — "playwright `recordHar`" as a HAR-schema gate for a skill, a documentation string only.
   - `kaidoku-shokunin/.ufo/waves/round-39/w1/artifacts/R39SrcReaGapKinds/dist-sha256-{published,installed}.txt` — sha256 rows of shipped Playwright `dist` files kaidoku analyzes as artifacts (reverse-engineering input, not a browser run).
   - No sibling SCORECARD or round-39 file names Firefox, Juggler, a Playwright run, or a session-bound egress receipt.
2. Browser-driving grep over sibling round-39 trees (`cdp|chromium|remote-debugging`): the only hits that are browser-related are kaidoku `R39C1CarrierK5/K6` (build/dev scripts; the match is `CDPATH` in `cd` idiom, a false positive), chousa controls (gate-regression shell text), and mado Hyprland `browser.conf` window rules (`match:class firefox`, a compositor rule). None launches a browser.
3. Host shared resources: `~/.cache/ms-playwright/` contains `chromium-1248`, `chromium_headless_shell-1248`, `ffmpeg-1013`, `firefox-1555`, `webkit-2370` (read-only listing). The C1 counter's version binding reads the session's own `userAgent` and `binary` path, so a shared cache does not alias the receipt. Listening sockets at scan time were all `127.0.0.1` or resolver/system ports (`ss -ltn`), i.e. no non-loopback listener owned by a sibling was present. Not a proof about the future run.
4. Adjacent-claim check: kaidoku round-39 claim surfaces (C1 carrier K1-K6 reverse engineering, C2 axis fit) and the kaidoku PROVINCE rows are artifact/forensics work; none has a browser-egress or socket-observation claim.

## Finding (exact overlap)

One textual ownership overlap, zero overlap on the C1 surface.

- `kaidoku-shokunin/PROVINCE.md:53` owns "Runtime observation (CDP)": self-launched `chromium --headless --remote-debugging-port=9222` and `xvfb-run electron --remote-debugging-port=9223`, verbs `list_browser_targets`, `inspect-web-page`, `list_electron_targets`, `inspect-electron-page`, `capture-browser-scenario`.
- `tabi-shokunin/PROVINCE.md:9` owns "CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)".

Both lanes name CDP session handling on loopback for self-launched browsers. Boundary facts that keep this from being a C1 collision:
- C1 drives **Firefox via Juggler** (Playwright's Firefox transport), not CDP; no CDP port (9222/9223) is part of the C1 surface.
- kaidoku's rows are a reverse-engineering/inspection verb set on its own instances; tabi's C1 is a session-bound egress capability on a loopback fixture. Different verbs, different counters, different receipts.
- No sibling process is inside the C1 owned tree: the frozen counter admits only the children of the driver node process, and loopback sockets are excluded by the predicate, so a concurrently running kaidoku Chromium on 127.0.0.1:9222 cannot produce a non-loopback observation or enter the owned set.

Disposition for L1 (not a C1/C2 blocker): the wording overlap is a boundary-clarity item; the planner may note in tabi PROVINCE that Firefox/Juggler session-bound egress is tabi-owned and CDP inspection of shipped artifacts stays kaidoku-owned. No sibling file was edited by this seat.

## Verdict basis

- C1 surface overlap with any sibling claim, counter, receipt, or owned process: **none observed** (bounded sweep above).
- C2 surface overlap: **none observed** (C2 surfaces are tabi-internal SCORECARD/LOG/census/numstat).
- Textual CDP ownership overlap: one, recorded above, not affecting either frozen predicate.

## Tooling record

No tools installed, updated, or executed beyond read-only shell (`ls`, `grep`, `cat`, `ss -ltn`, `ls ~/.cache/ms-playwright`). No pacman, no MCP, no REA.

## Cleanup

Scratch `/fast/scratch/hyaku/tabi-r39/ConnSiblingOverlap` created for this seat and removed. No browser, fixture, or clone was created.

VERDICT finding — one textual CDP ownership overlap (kaidoku-shokunin/PROVINCE.md:53 vs tabi-shokunin/PROVINCE.md:9); zero overlap on the Playwright-Firefox/Juggler session-bound egress surface (C1) or the C2 instrument surfaces; sibling sweep read-only, no sibling modified.
