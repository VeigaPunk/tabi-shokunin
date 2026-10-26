# ConnSiblings — sibling-overlap scan, tabi round 32 w1 (attempt 1)

Date: 2026-10-26. Seat: ConnSiblings (leaf, no dispatch). Scope: read-only scan of the 20 sibling lanes under `/home/vgpnk/Projects/shokunin/*-shokunin` (all lanes except `tabi-shokunin`) over the declared surfaces — `SKILL.md`, `PROVINCE.md`, `corpus/knowledge/` — for ground on **WebDriver BiDi, chromedriver, Selenium, Playwright-BiDi**, and the **stagnation-nudge rule** (`AXES.md` §The stagnation nudge). No lane file was edited; no installs; no browser runs.

## Verdict

**No sibling lane holds ground on WebDriver BiDi, chromedriver, Selenium, or Playwright-BiDi in the declared surfaces — tabi's C1 surface is uncontested.** The only browser-automation ground any sibling owns is **kaidoku-shokunin's Playwright-over-CDP forensic capture** (`observe-web-session` / `capture-browser-scenario`, HAR/netlog capture) — adjacent, not contested: a different protocol (CDP, not BiDi), a different tool (Playwright attaching to self-launched chromium, not chromedriver), and a different province (reverse-engineering forensics, which tabi's PROVINCE.md explicitly refuses → revenger/kaidoku). tameshi, the fleet owner of "reusable general test craft" (boundary recorded in tabi's round-13 report), holds **zero** in-scope browser-automation ground. On the nudge: the stagnation-nudge rule is **fleet-wide** (every sibling SCORECARD declares a saturation line + window and derives nudge state per round), and **no sibling's nudge statements exhibit tabi's rounds 29–31 misreading** (stating "nudge inactive" while every axis sat at/above the line and no capability had entered within the window). Four sibling lanes are positive controls for the correct reading under conditions identical to tabi's — they declared the nudge **active/applies** and made capability/frontier moves (tameshi first-use firing, kumitate round 45, tameshi rounds 32–33, kake rounds 28+). Adjacent bookkeeping staleness exists in siblings (kasegi r30 stale capability-window parenthetical; souji r9 score drift; mori stale capability cell) — none is the same misreading. One-paragraph bottom line: **the round-32 BiDi acquisition enters unowned ground, and the m4-nudge derivation tabi now makes is the fleet-consistent reading, corroborated cross-lane.**

## Commands and exit codes

Tooling note: per house tool policy all regex scans ran through the `grep` tool (not shell grep); the two structural commands ran through `bash`.

1. `bash`: `mkdir -p /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/w1/ConnSiblings && mkdir -p /fast/scratch/hyaku/tabi-r32/ConnSiblings && ls -d /home/vgpnk/Projects/shokunin/*-shokunin` — **exit 0**. Output: 21 lane dirs (20 siblings + `tabi-shokunin`): audio, chousa, game-dev-2d, game-dev-3d, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, lore, mado, mori, revenger, souji, tameshi, tsukuroi (+ tabi).
2. `glob` `…/*-shokunin/AXES.md` — no files (siblings keep nudge statements in SCORECARD.md, not AXES.md).
3. `grep` (case-insensitive) `webdriver|websocketurl|chromedriver|selenium|playwright|bidi` over each sibling's `SKILL.md;PROVINCE.md;corpus/knowledge`, lanes enumerated explicitly in three batches (A: audio…kake; B: kama…lore; C: mado…tsukuroi). Results: **batch A — hits only in audio (false positive) and kaidoku (substantive); batches B and C — "No matches found"**; skipped-missing note: `audio-shokunin/SKILL.md`, `game-dev-2d-shokunin/SKILL.md` do not exist.
4. `grep` (case-insensitive) `stagnation|nudge` over the same declared surfaces, three batches. Results: **batch A — hits in game-dev-2d and kagi only (both false positives); batch B — kama (false positive), kasegi/kengaku/kotoba/kotodama/kumitate (same-word different-rule); batch C — "No matches found"**.
5. `grep` (case-insensitive) `stagnation|nudge` over all 20 sibling `SCORECARD.md` files — **hits in 19 of 20** (all except tabi-adjacent none… precisely: audio, chousa, game-dev-2d, game-dev-3d, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, lore, mado, mori, revenger, souji, tameshi, tsukuroi — 20 of 20 actually returned sections; the first call truncated mid-mado and was re-run for the tail lanes).
6. `grep` (case-insensitive) `webdriver|websocketurl|chromedriver|selenium|playwright|bidi` over 21 `considerthese/` dirs (supplementary, beyond the declared surfaces) — **one false positive** (kengaku `considerthese/2026-10-19.md:9` "Bidirectional index gate"); missing dirs skipped.
7. `bash`: `ls /home/vgpnk/Projects/shokunin/kagi-shokunin/ …` — **exit 0** (structure check after discovering the mid-path glob `…/*-shokunin/SKILL.md` returns "No files found"; the tool's mid-path glob does not expand, so all scans used explicitly enumerated paths — the initial all-glob "No matches" was a tool artifact, not a true negative).
8. `bash`: `pgrep -fa 'chromedriver|chromium' | grep -i connsiblings` — **exit 1** (no match): no browser processes owned by this seat. (Live chromedriver/chromium processes seen in the unrestricted pgrep belong to sibling seat ExecInterceptPhases under its own scratch dir and to the user's desktop session; untouched, as required.)
9. `bash`: scratch cleanup — `/fast/scratch/hyaku/tabi-r32/ConnSiblings` removed (verified: `ls` exit 2 "No such file or directory"); parent `tabi-r32/` retained, owned by other live seats.

## Evidence — browser/BiDi terms in declared surfaces (all hits, classified)

### Substantive: kaidoku-shokunin (Playwright-over-CDP forensic capture — adjacent, NOT contested)

- `kaidoku-shokunin/PROVINCE.md:137` — "Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe) … `observe-web-session`, `observe-web-execution`, `observe-javascript-runtime` … `capture-electron-scenario` remains typed refusal (Playwright handshake, not app launch)". Owns **CDP attach + Playwright** observation of self-launched browsers/Electron.
- `kaidoku-shokunin/SKILL.md:188-192` — operative gate for network-capture admission is "a har-schema-valid capture (playwright `recordHar` satisfies it)".
- `kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:42-47` — host inventory: `/usr/bin/chromium`, playwright 1.64.0 global + `~/.cache/ms-playwright/chromium-1248`, `agent-browser` 0.38.2, prior `DevTools listening on ws://127.0.0.1:9222/`; `:135-136` "Runtime observation | chromium + playwright cache + electron39/43 binaries; zero live CDP endpoints | viable via self-launched CDP".
- `kaidoku-shokunin/corpus/knowledge/2026-10-13-r3-runtime-observation.md:99-116` — `capture-browser-scenario` runs an explicit Playwright scenario; `browser.mode:"connect"` attaches to a supplied loopback CDP endpoint.
- `kaidoku-shokunin/corpus/knowledge/2026-10-13-r4-08-observe-verbs.md:160-176` — owned Electron via Playwright `_electron.launch`.
- `kaidoku-shokunin/corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:523-526` and `2026-10-14-r10-01-queue-ops.md:23-27,150-160,263-266,300-304` — real receipts: playwright 1.64.0 `recordHar` over self-launched `/usr/bin/chromium` 152 against a localhost fixture (9,942 B HAR, 5 real 200 entries); chromium `--headless=new --log-net-log` (314,987 B netlog, 1,310 events).
- `kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:90-94` — "playwright-class preinstalled tooling".

**Classification: adjacent, not contested.** Three independent boundaries: (a) transport — kaidoku's Playwright usage is **CDP** attach/launch; no WebDriver BiDi, no chromedriver, no `webSocketUrl` capability anywhere in its corpus; (b) tool — Playwright's driver, not ChromeDriver; C1's counter binds receipts to chromedriver's BiDi transport specifically; (c) province — tabi PROVINCE.md "Refuses: reverse engineering as forensics (→ revenger/kaidoku)"; the fleet boundary is recorded in tabi's own round-13 report ("Browser fixture work remains tabi-owned; reusable general test craft remains tameshi-owned, fleet tooling kumitate-owned, publishing kake-owned, secrets kagi-owned and forensic work revenger/kaidoku-owned", `.ufo/waves/round-13/w1/tabi.md`). No overlap with C1's claimed surface.

### False positives (same string, different meaning)

- `audio-shokunin/corpus/knowledge/2026-10-13-sox-ffmpeg-packet-residue.md:28-29` — "Verified bidirectionally on byte flips" (audio codec bits; no SKILL.md exists in this lane).
- `kumitate-shokunin/corpus/knowledge/remaining-scripts-census.md:576,660,676` — "bidi overrides"/"bidi controls" = Unicode bidirectional control characters stripped by `sanitizeDisplayText`; fleet tooling, not browser automation.

### Zero-hit lanes (declared surfaces, browser pattern)

chousa, game-dev-2d, game-dev-3d, kagi, kake, kama, kasegi, kengaku, kotoba, kotodama, lore, mado, mori, revenger, souji, tameshi, tsukuroi — **no matches** for `webdriver|websocketurl|chromedriver|selenium|playwright|bidi`. In particular **tameshi** (general test craft) and **kake** (web publishing) hold none of the contested terms in scope.

### Out-of-scope observations (noted, not verdicts — outside SKILL.md/PROVINCE.md/corpus/knowledge)

- `kake-shokunin/.ufo/waves/round-26/fetched/text/S023-1.txt`, `S031-1.txt` — fetched W3C HTML-spec source text mentioning "WebDriver BiDi …" hooks (raw fetched bytes under `.ufo`, round-26/36 source captures); `round-36/sources/S094.txt` — fetched MDN page listing WebDriver among technologies. Raw capture, no knowledge claim.
- `kengaku-shokunin/.ufo/waves/round-36/build/R36ScoutNextTasks/filter-js-from-html/test_outputs.py:12-16,127,139` — a scratch test script importing `selenium.webdriver` (Chrome) for a round-36 build task; wave artifact, not lane-held ground.
- `chousa-shokunin/.ufo/waves/round-30/build/ConnectorSiblings.md:145-146` — a chousa wave report *mentioning tabi's* W3C WebDriver BiDi row S005; about tabi, not chousa ground.

## Evidence — stagnation-nudge rule cross-lane

The rule is **fleet-wide**: every sibling SCORECARD.md declares a saturation line + stagnation window N "per `AXES.md` §The stagnation nudge" and derives nudge state per round. Representative derivations (path:line):

- `souji-shokunin/SCORECARD.md:226-228` — fleet precedent ("Saturation line: 8 per axis; stagnation window 3 rounds"), also citing a self-corrected r9 score drift ("formerly said 6/7 — corrected r9 after the judges caught the drift").
- `chousa-shokunin/SCORECARD.md:472-495` — "the `AXES.md` §The stagnation nudge predicate is decidable from this file alone … Nudge verdict: **dormant**" (score half fails: operability 3 < 8).
- `kama-shokunin/SCORECARD.md:6,135,183,615-616,1581-1582` — repeatedly derived "calibration 7 below the saturation line 8 → nudge inactive / no waiver".
- `kengaku-shokunin/SCORECARD.md:576` — "owned axes are novelty 7 / calibration 8, so the nudge is inactive while novelty sits below 8".
- `kotoba-shokunin/SCORECARD.md:335-360` — dormant because "depth 9 sits below the 10.0 owned-axis line, failing condition (1)"; running window tracked 3/3 at r26 close.
- `revenger-shokunin/SCORECARD.md:172-173` — "The nudge does not apply now: coverage criteria sit at 5.0 and 2.9, and a capability entered this round."
- `mori-shokunin/SCORECARD.md:649-651` — line 8 / N=3 declared with rationale ("3 rounds avoids firing the nudge on a one-round plateau").
- `game-dev-3d-shokunin/SCORECARD.md:290` — "Saturation line: 8/10 … Stagnation window N = 3 rounds without a capability entering the table above."
- `game-dev-2d-shokunin/SCORECARD.md:358-364` — N=5 with the stagnation count derived as 0 across the window.
- `audio-shokunin/SCORECARD.md:1092`, `lore-shokunin/SCORECARD.md:122,366,723`, `kotodama-shokunin/SCORECARD.md:937-938` — honest non-derivation: no rubric / not declared → "the nudge cannot fire"/"not triggered"/"not invoked".
- `kaidoku-shokunin/SCORECARD.md:638-646,2109-2112,2132-2134` — window tracked (N=10); "no capability row has entered since arc2-r8, so the `AXES.md` §stagnation nudge applies (a 'should')".
- `tsukuroi-shokunin/SCORECARD.md:177-180,587,616,1418,1501,1862-1863,2113` — "saturation 9 / window 3; the nudge does not waive the lowest-axis duty" (depth/adjacency 8 < 9) — derived every round.
- `mado-shokunin/SCORECARD.md:282-284,2135,2193` — line 9.0/N=3; "a capability entered in round 32, so the stagnation nudge does not waive" (mado's own round numbers).

### Positive controls — siblings declaring the nudge ACTIVE under tabi-r32-identical conditions

- `tameshi-shokunin/SCORECARD.md:860-865` — "**Stagnation nudge fires (first use).** Both owned numeric axes sit at the declared saturation line (depth 8, calibration 8) and no capability row has entered `## Capabilities` since round 15 — five completed rounds against window N = 2. Per `AXES.md` §The stagnation nudge the lowest-axis obligation is waived; this round is a frontier/capability round."
- `tameshi-shokunin/SCORECARD.md:1557-1559` (tameshi's own r32) — "depth 9 and calibration 8 sit at or above the saturation line 8, and no capability row has entered since round 25 (window 2), so the lowest-axis obligation is waived and the round is a capability move"; `:1613-1614` (r33) "Stagnation nudge still applies (no capability since round 25)."
- `kumitate-shokunin/SCORECARD.md:1973-1975` — "No capability row is claimed; **the nudge is active** (rounds 42–44 added no verified row), so the lowest-axis obligation is waived and C1 is a frontier move."
- `kake-shokunin/SCORECARD.md:594-597,633-634,693-695,836-838,1027-1028,1109-1110` — repeated "**the stagnation nudge applies** … the round makes a repair move plus a frontier move" whenever both owned axes sit at the 10/10 line and the window lapsed.
- `tameshi-shokunin/SCORECARD.md:802-805` — the discipline tabi r29-31 lacked: "the dated fleet-round1 'nudge does not fire now' parenthetical is **historical, not a current judgment** (H03)".

**Verdict on the cross-lane pattern: holds — no sibling exhibits the rounds 29–31 misreading.** All 20 siblings either derive both firing conditions explicitly, decline to derive for lack of a rubric (honest), or correctly declare the nudge active and act on it. The only adjacent stale-state defects found are bookkeeping class, each flagged or corrected of record: `kasegi-shokunin/SCORECARD.md:859-860` (r30 headline's "(last capability entry round 25)" parenthetical false — r26 added `source-capture-pdf`; "The filed sentence is left byte-identical; this erratum is the correction of record"); `souji-shokunin/SCORECARD.md:226-228` (score drift corrected r9); `mori-shokunin/SCORECARD.md:1316-1317` (stale "22/22" cell recorded against actual 23/23). None states a nudge firing condition wrongly.

### Nudge-term false positives in declared surfaces (same word, different rule)

- `kagi-shokunin/{SKILL.md:399,498; PROVINCE.md:30; corpus/knowledge/config-layering.md:39; handler-on-disk-state.md:83,207-208; handler-trust-boundary.md:7,152}` — `fnm-nudge.js`, an opencode plugin (Fast Node Manager); unrelated.
- `kasegi-shokunin/corpus/knowledge/ufo-archive-2026.md:35-37` — "bounty-whipper … hourly nudge tracker"; ops telemetry.
- `kumitate-shokunin/{SKILL.md:380-397,521-522; corpus/knowledge/ops-watchers.md:43-86}` — `ufo-stale-watchdog` steer/nudge escalation ladder; I8 "zero accepted proposals is convergence, not stagnation" (a routing-round construct, not the AXES nudge).
- `kengaku-shokunin/corpus/knowledge/benchmark-saturation-and-lifecycle.md:12,20-22,50,73-75,87` — "stagnation" in the benchmark-lifecycle sense (S007 paper: statistical indistinguishability vs saturation with ceiling proximity) — definitional care, unrelated to the AXES rule.
- `kotodama-shokunin/corpus/knowledge/linguistics/color-terminology.md:44` — "language nudges similarity judgments" (psycholinguistics).
- `game-dev-2d-shokunin/corpus/knowledge/2026-10-19-physics-replay-boundary.md:26-27` — "`--arm=perturb` nudges body 0's initial x" (physics test arm).
- `kotoba-shokunin/corpus/knowledge/instruction-surface-census-round13.md:391` — `fnm-nudge.js` mention.
- `kama-shokunin/corpus/knowledge/consumer-registry.md:325-328` — matched on `127.0.0.1` pins, not nudge semantics.

## Risks and caveats

1. The grep tool's mid-path glob (`…/*-shokunin/SKILL.md`) silently returns "No files found"; every scan above used explicitly enumerated per-lane paths. A reader re-running with shell globs will get true negatives; re-running with the tool glob will get the same artifact.
2. Text-grep coverage: pattern was `webdriver|websocketurl|chromedriver|selenium|playwright|bidi` case-insensitive; a prose variant like "Web Socket URL" (spaced) would not match `websocketurl`. Residual risk judged negligible (all standard docs use `webSocketUrl`).
3. Lane-round numbers in sibling SCORECARDs are each lane's own counter (e.g. tameshi's "round 32", kake's "round-32-verifier-spotcheck"); they are not tabi rounds and were used only as nudge-reading evidence.
4. Out-of-scope hits (kake/kengaku `.ufo` artifacts, chousa wave report) are raw captures or reports about tabi, not sibling-held knowledge ground; listed so the L1 can discount them if seen elsewhere.
5. No commits, no edits, no installs, no network fetches this seat. `/fast/scratch/hyaku/tabi-r32/ConnSiblings` removed (verified absent); browser-process check: zero owned (only sibling-seat ExecInterceptPhases's live BiDi run and the user's desktop chromium were observed; untouched).

## Frontier note for the L1 (compatible synthesis, adjacency axis)

Two observations improve adjacency without harming any axis: (1) **kaidoku is the fleet's only Playwright-CDP holder** and records the same host chromium/playwright stack tabi round 32 builds on — a natural evidence-ledger adjacency for future rounds (report-only; nothing to absorb, kaidoku's corpus is honestly bounded to forensic capture). (2) **The m4-nudge reading is corroborated by four sibling positive controls** (tameshi :860-865, :1557-1559; kumitate :1973-1975; kake :594-597) — the round-32 lesson's `## Gate` can cite that tabi's derived-active state matches how tameshi/kumitate/kake declared and acted on the same predicate, while tabi's rounds 29–31 "inactive" statements were the fleet-wide outlier.
