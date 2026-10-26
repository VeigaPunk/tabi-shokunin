# ConnSiblingScan — round-33 w1: C1 sibling-overlap scan beyond the frozen sweep

**Verdict.** The frozen PROVINCE sweep (regex over 20 sibling PROVINCE.md files at pins)
accounts for only a minority of the browser-domain claims that actually sit on the fleet:
scanning every sibling's SKILL.md and `corpus/knowledge/*.md` at lane tips produced
41 leads, of which **34 are real overlaps with tabi ground** (CDP/Playwright/WebBridge
drivers, the shared 9222/musketeer-profile lease, loopback browser fixtures, crawl-split
boundaries, accessibility-tree capture, screenshots-as-evidence, explicit `tabi`
delegations), and only 8 of those 41 were caught or mapped by the sweep. The densest
new ground is in lanes the sweep never touches (**kumitate** routes the kimi-webbridge
substrate to tabi, **kasegi** drives authenticated burnerchrome at CDP 9222,
**kama** enumerates live CDP loopback pins, **kaidoku** self-launches Playwright/CDP
browsers and captures accessibility trees/screenshots) and in **kake**'s repeated
explicit delegations ("browser work to tabi", "tabi owns authorized
browser/assistive-technology execution"). The sweep regex itself has real blind spots
(`screenshot`, bare `profile`, bare `headless`, bare `remote-debugging-port`,
`firefox`/`edge`, loopback terms, `accessibility`, `har`) and generates noise
(`devtools` as an Arch package, `chrome` inside paths, `scrap` in metrics studies,
administrative `tabi` roster mentions). No finding here changes the frozen counter;
these leads feed the round lesson's Search log.

## Scope and method

- Commands (all run in read-only sibling repos or the scratch clone; no lane file
  edited):
  - `git -C <fleet>/<lane>-shokunin rev-parse --verify -q refs/heads/master` (fallback
    `refs/heads/main`) — resolved lane tips:
    `audio 7a2fcd4f…`, `chousa 00f8c7f5…`, `game-dev-2d 7753d49b…`,
    `game-dev-3d 89dd182b70…`, `kagi 69b61db46b…`, `kaidoku fa6a8a3f85…`
    (pin 8b9634ed…), `kake 044048597d62…`, `kama 0163fea2da…`,
    `kasegi 9a10b02fe411…` (pin 2387dcf6cc…), `kengaku e50c134556b4…`
    (pin 7984fd3089…), `kotoba 65a5c7a663…`, `kotodama f556d1049fe6…`,
    `kumitate 8d557f85312d…`, `lore 380ef3abc7c7…`, `mado 0c89478af821…`
    (pin 74c606a1c7…), `mori aa3af1ec3118…`, `revenger 6da884c6708f…`,
    `souji a7c35c24bdd8…`, `tameshi c6295cb0473e…`, `tsukuroi 71851d636ab1…`
    (pin 9cc9aa77e30e…). 5 lanes have moved past their frozen pins (tips ≠ pins).
  - `git -C <repo> grep -n -i -E '<topic regex>' <tip> -- SKILL.md corpus/knowledge`
    per lane × topic; raw hits collected into scratch
    `$HYAKU_SCRATCH/tabi-r33/ConnSiblingScan/hits/{drivers,tabi,screenshot,profiles2,a11y2,crawl,loopback,profiles-browser}.tsv`
    (4,284 raw hits, then filtered to browser-context).
  - Exact quote lines re-read via `git -C <repo> show <tip>:<path> | sed -n 'Lp'`
    for every lead quoted below (no grep-truncated text was used as a quote).
  - Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin
    $S/clone && git -C $S/clone checkout -q --detach
    e6b0a9074d434ccc307badd312ae7379d1193fea` (HEAD = e6b0a9074d43…).
- No tools installed, no browser launched, no network access. `pgrep -fa
  'chromedriver|chromium'` shows only the pre-existing `earlyoom` process whose
  `--prefer` list mentions the word chromium (PID 1371, not ours).

## Leads (41) — `leads.tsv` in this seat dir

Columns: `lane | path:line@commit | quote | sweep_caught | real_overlap | topic | note`.
`sweep_caught`: `yes` = a frozen sweep candidate line covers the same claim; `mapped` =
already dispositioned by a verified `corpus/adjacency.tsv` row; `no` = neither.
Summary: `yes` 6, `mapped` 2, `no` 33; `real_overlap` yes 34 / no 7.

### Real overlaps (34) — the new ground

- **kaidoku** (self-launched CDP/Playwright browser observation, loopback fixtures,
  a11y + screenshot capture): SKILL.md:55 (sweep-caught, duplicate of candidate
  kaidoku:53); knowledge/2026-10-13-r3-runtime-observation.md:99, :50, :17;
  knowledge/2026-10-13-r2-skill-references-deep.md:72; knowledge/2026-10-13-r4-16-frontier-rescan.md:184;
  knowledge/2026-10-14-r10-01-queue-ops.md:151; knowledge/2026-10-14-r10-02-queue-ops-2.md:117;
  knowledge/2026-10-14-r11-01-queue-ops.md:305.
- **kagi** (shared 9222 + musketeer profile lease): SKILL.md:450, :488 (sweep-caught
  via candidates kagi:43/:59); knowledge/cdp-bridge-1password.md:70 ("start/inspect via
  the browser lane" — names tabi), :77.
- **kake** (explicit delegation + lease + crawl split): SKILL.md:161 (sweep-caught via
  candidate kake:39), :408, :560, :697; knowledge/field-performance-cwv.md:153;
  knowledge/accessibility-review-packet.md:122; knowledge/accessibility-review-cards.json:8
  (pattern repeats through ~46 `publisherCheck` lines, 8…656 — all state "tabi owns
  authorized browser/assistive-technology execution"; candidate kake:79 caught the
  subject); knowledge/js-rendering-queue.md:77 (sweep-caught via candidate kake:304);
  knowledge/static-canonical-preflight.md:134; knowledge/mirror-pitfalls.md:39
  (`webzites lease acquire` — shared-lease acquisition).
- **kama** (live CDP loopback census): knowledge/listener-census.md:355 (mapped row
  `cdp-live-target-census`, contested-open), :56 (same surface, not a candidate);
  knowledge/consumer-registry.md:9, :235.
- **kasegi** (browser submission driving): SKILL.md:267; knowledge/mission-control.md:119
  ("authenticated burnerchrome at CDP 9222"); knowledge/ufo-workspaces.md:272.
- **kumitate** (webbridge substrate is tabi's ground): knowledge/kimi-skills-plugins.md:321
  (K-block clause routes `plugins/managed/kimi-webbridge` internals to tabi), :324
  (agrees with tabi's `webbridge-plugin-anatomy.md:12-14/:57-58`), :250, :278 (cites
  tabi SKILL.md:1421-1424).

### Non-overlaps (7) — recorded because they bound the map

- **kotoba** third-lane reports: knowledge/sibling-overlap-census-round49.md:171
  (tabi's round-16 draft split with kotoba over agent-facing text craft **never landed**;
  kotoba recommends asking tabi — actionable, but no current claim), :150 (round-74
  census: tabi SKILL.md kotoba mentions are citations, not split);
  knowledge/sibling-description-rewrites-round8.md:136; knowledge/fleet-skill-audit-round5.md:45.
- **tsukuroi** knowledge/adjacency-anchors-r19.md:187 (+ JSON:2110/2130): its own
  adjacency-anchor ledger cites tabi round-16 drafts (historical RESOLVES rows) — a
  third-lane record, not a new claim.
- **kake** knowledge/fire-journal-codes.md:27: operational CDP preflight use (reports
  state, claims no ownership).
- **chousa** knowledge/archived-export-intake.md:20: explicit denial — "no browser, CDP
  or session access" (anti-claim; confirms chousa holds no browser ground).

## Sweep-regex judgment

Regex (counter line 65):
`/\b(browsers?|chromium|chrome|cdp|devtools|playwright|puppeteer|webdriver|bidi|selenium|webbridge|tabi|crawl(er|ers|ing)?|scrap(e|er|ers|ing))\b/i`

- **Misses that should catch** (claim-carrying lines that would not match):
  `screenshot` (screenshots-as-evidence; kaidoku's capture verbs would be invisible
  without the co-occurring `cdp`/`chromium` tokens); bare `profile` / `user-data-dir`
  (browser-profile claims); bare `headless`; bare `remote-debugging-port`;
  `firefox`, `edge`; `localhost`/`127.0.0.1`/`loopback` (loopback fixtures);
  `accessibility` (tree capture); `har`; `lighthouse`; "rendered DOM".
- **Hits that are noise**: `devtools` as the Arch package (kaidoku pacman knowledge);
  `chrome` inside file paths / `chrome.log` references (kaidoku r2-frontier); `scrap`
  in metrics-scraping and crawl *studies* (kengaku bench-arena, tameshi duplicate-
  verdict, souji crawl study); `tabi` in administrative roster/citation contexts (mori
  wave-settlement, tameshi fleet census); `browser` inside refusals (chousa — informative
  anti-claims, not overlaps); `webbridge` in package-name enumerations (kotoba harness
  lists).
- **Structural limit** (by design, not regex): candidates exist only for 7 lanes
  (kagi, kaidoku, kake, kengaku, kotoba, revenger, tsukuroi); lanes whose PROVINCE.md
  carries no token — kumitate, kasegi, kama, mado, mori, etc. — never surface even
  though they hold dense browser-ground claims (8 of the 34 real-overlap leads come
  from exactly those lanes).

## Deliverables

- `leads.tsv` — 41 lead rows (lane, path:line@commit, ≤25-word verbatim quote,
  sweep_caught, real_overlap, topic, note) in
  `.ufo/waves/round-33/w1/ConnSiblingScan/`.
- This report.

## Cleanup

- Scratch `$HYAKU_SCRATCH/tabi-r33/ConnSiblingScan/` (clone + hit sets) removed on
  completion; no receipts were copied because this scan seat produced none beyond the
  deliverable above. No lane/fleet/sibling files were modified.
