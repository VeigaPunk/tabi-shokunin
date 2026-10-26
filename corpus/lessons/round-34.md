# Round 34 — lesson (tabi; hyaku run 9; L1 TabiR34)

Baseline `15dfaccb34601c2d221c78501e2befd8998d600c`; freeze `59f1b47aae277e1670e4a824173da8cde7e388ee` (claims, both counters, controls, nine control receipts, candidate list,
sibling pins: `.ufo/waves/round-34/claims.json`, `.ufo/waves/round-34/baseline/`). Claims: C1 adjacency (sibling
ground outside `PROVINCE.md`), C2 operability, sourced (the BiDi gate's self-test against 20 frozen mutants).

## Gate

### Controls (scored before any claim data; `baseline/controls-summary.json`)

| control | counter | reading | predicate |
|---|---|---|---|
| c1-J1 do-nothing | C1 | candidates 67, mapped 1, unaccounted 66, newMapped 0 | false |
| c1-J2 screen-all | C1 | unaccounted 0, newMapped 0 | false |
| c1-J3 junk rows on non-candidate lines (new junk tabi line) | C1 | newMapped 0; check-adjacency flags 1 of 4 junk rows | false |
| c1-J4 rows whose tabi side is an EXISTING tabi line naming the sibling | C1 | mapped 5, newMapped 0 | false |
| c1-J5 split rows whose sibling side does not name tabi | C1 | mapped 5, newMapped 0 | false |
| c2-J1 do-nothing | C2 | killed 8 of 20; survivors M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19 | false |
| c2-J2 self-hash self-test | C2 | killed 20; neutral, decoy and 20 twins fail | false |
| c2-J3 find-presence sniff | C2 | killed 20; 20 twins fail | false |
| c2-J4 reject-all production path | C2 | survivors 12; round-33 battery false | false |

A construction the controls did NOT include reaches C1's predicate: three new surface names on candidate lines that
restate an already-mapped kake split, plus one new tabi line naming kake (w1 CritC1Claim probe A: exit 0, newMapped 3).
Round-33 lesson M5 had already named the rename route. Mined below as M3. The integration admits no row of that
shape: every new row was attacked in wave 2 (round-34 SCORECARD disposition).

### Source rows opened this round (registry `corpus/SOURCES.md`)

| row | URL | accessed (UTC) / receipt | ≤25-word located quote | decision |
|---|---|---|---|---|
| S130 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/token.cc | 2026-10-26T19:47:08Z, `?format=TEXT` HTTP 200, 2,992 B raw sha256 `36deab71…9b889`, decoded 2,243 B `6ef1fc2b…2628f` (w1 ScoutContextIdSource) | `token.cc:35`: `return StringPrintf("%016" PRIX64 "%016" PRIX64, words_[0], words_[1]);` | admit (mined; grounds the M08 case) |
| S131 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts | 2026-10-26T19:49:29Z, HTTP 200, 20,140 B raw `f3483993…c33599`, decoded 15,104 B `cd435aa8…5cce9d9` | `CdpTargetManager.ts:245-247`: "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext," | admit (mined) |
| S132 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/commands.cc | 2026-10-26T19:47:14Z, HTTP 200, 20,924 B raw `4bc5d8dc…d64f22`, decoded 15,692 B `d546e257…3c50f7` (w1 ScoutSessionBinding, drafted as its S133) | `commands.cc:96` `std::string new_id = GenerateId();`; `:110` `session_thread_map->emplace(new_id, std::move(thread_info));` | admit (mined; grounds the M19 rule as lane discipline) |
| S133 | https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD (+ chromium-launcher `launcher.c` at tag v8) | 2026-10-26T19:47:34Z / 19:47:35Z, HTTP 200, PKGBUILD 18,285 B `a6fd458b…961be`, launcher.c 3,546 B `b2772fe0…82624` (w1 ScribeErrataS128) | `PKGBUILD:12`: `_launcher_ver=8` | admit — supersedes S128 (locators `:13` → `:12`; stamp corrected) |

Rows touched old→new: S128 is superseded by S133 (append-only; S128's bytes unchanged). S125's recheck cell stays
`90d` this round although w1 ScribeS125Cadence found the enabling path identical at 156.0.8078.47 with shifted line
positions and proposed `on-release`: the round's frozen no-harm clause keeps `corpus/SOURCES.md` append-only
(`claims.json:noHarmRule`), so the cell change is routed to round 35 with that seat's receipts
(`.ufo/waves/round-34/w1/ScribeS125Cadence/`).

Rejected source candidates: the W3C BiDi §4 and WebDriver §Sessions scope rows drafted by w1 ScoutSessionBinding (its
S131/S132) — both URLs are already registered (S124, S126) and a second row on the same URL in the same scope is a
census duplicate; the entry cites S125/S127 for the ChromeDriver side instead. RFC 4122 (its S134) — not needed by
any kill case (the ChromeDriver id is not a UUID string, which the entry does not rely on).

### Assimilation

Assimilation: none — w1 ScoutAssimilation: the `merge/tabi/` package (148 rows, 86 entries) holds WebMCP, CDP,
cookie, redirect and rate-limit themes; none touches sibling adjacency or the BiDi gate self-test. This lane has no
`considerthese/` dir.

## C1 gate decisions

New map rows (all with a new tabi declaration at `SKILL.md` §"Round 34 — sibling-overlap declarations"):

| row | surface | sibling | candidate | disposition | drafted by |
|---|---|---|---|---|---|
| 15 | live-delivery-observation | kake | `SKILL.md:408` | split-declared | AdjKakeDelegations |
| 16 | lab-performance-tool-runs | kake | `SKILL.md:697` (`field-performance-cwv.md:153` screened same-surface) | split-declared | AdjKakeDelegations |
| 17 | agent-facing-tool-text-craft | kotoba | `sibling-overlap-census-round49.md:171` (:172, :173, :175 same-surface) | split-declared | AdjKotoba49 (ScoutKotobaSplit agrees) |
| 18 | authenticated-consequential-driving | kasegi | `mission-control.md:119` (`SKILL.md:267`, `ufo-workspaces.md:272` same-surface) | refused-route | AdjKasegi |

Screens: 62 rows in `corpus/adjacency-screen-skill.tsv` — same-surface 35, third-lane-report 23, no-claim-declared 3,
not-browser-sense 1. L1 reversals of seat map drafts (recorded per criterion 91; both reverse TOWARD a screen, so
neither is load-bearing for the target):
- kaidoku `2026-10-13-r3-runtime-observation.md:99`, `2026-10-14-r10-01-queue-ops.md:151`,
  `2026-10-14-r10-02-queue-ops-2.md:117` — AdjKaidoku drafted three split-declared rows; screened same-surface
  `cdp-runtime-observation` because REA-driven capture (Playwright scenario, HAR, screenshot compare) sits inside the
  ruled REA-provider CDP boundary (row 2; w1 ConnBoundaries). The counter would not have counted them (the kaidoku
  quotes do not name tabi).
- kumitate `kimi-skills-plugins.md:250`, `:278` — AdjKumitate drafted two split-declared rows; screened same-surface
  `kimi-webbridge-plugin-internals`: the daemon and the plugin-root probe dumps are plugin internals row 10 already
  routes to tabi (w1 ConnBoundaries).
Contested by w1 ConnBoundaries and kept for wave-2 attack: row 15 (`SKILL.md:408` may restate row 12's
js-rendering split with a broader envelope).

## C2 kill cases

Twelve cases added to `scripts/check-bidi-runtime.mjs` `CASES` (self-test 44 → 56): `v3-a-*` (w1 ExecKillsA: M01 M03
M06 M08 M09 M10) and `v3-b-*` (w1 ExecKillsB: M04 M05 M07 M16 M18 M19). The two seats each added a finding-detail
assertion (`detailIncludes`, `bDetailIncludes`); the L1 merged them as one optional `detailIncludes` field checked
against the gate's printed finding detail. No rule line changed: all 20 mutant find texts occur once. Entry:
`corpus/knowledge/bidi-gate-selftest-round-34.md` (S127, S125, S130, S131, S132).

## Mistakes

| id | class | evidence | captured-by | fix (and how it was shown able to fail) |
|---|---|---|---|---|
| M5 | `scope` (L1 integration) | the w1 integration `04f9623d` admitted four new rows; wave 2 withdrew three (rows 15, 17, 18): a census of tabi's own draft taken as a sibling-side split, a refusal neither side routes, a re-key of row 12 | QUALITY 91 (re-key) caught row 15 only in wave 2; nothing caught 17/18 before data | QUALITY 97: a `split-declared` row cites a sibling line in which the sibling itself states its side of the split; a `refused-route` row cites a tabi refusal that names the sibling as the destination. Shown able to fail: rows 17 and 18 at `04f9623d` (C1 counter newMapped 4, predicate true) fail both clauses; the final map does not |
| M1 | `misroot` (L1 template) | the w1 wave context put the wave LABEL into the seat output-dir path (`{R}/w1 = build + first falsifiers/<seat>/`); seats AdjTameshiTsukuroiChousa and MutC1Counter wrote there (`w1-results.json` MutC1Counter output names the path); the L1 moved both into `.ufo/waves/round-34/w1/` before committing (the second after the w1 integration commit) | none — the validator does not check context paths | the w2 context builds the path from the wave id; check `grep -c 'round-34/w[12] =' w*-dispatch.json` → 1 on w1 (fails), 0 on w2 (passes) |
| M2 | `stale-locator` (third-party lead list) | round-33 w1 ConnSiblingScan `leads.tsv` cites `mirror-pitfalls.md:39`, a blank line (quote at :40), and three leads whose quote wraps over two lines; the first C1 list build read an empty candidate and 3 unresolved leads | none in round 33 | the C1 counter anchors a lead by its quote (cited line, then ±2, then any 4-word window) and reports `leadsReanchored`/`leadsUnresolved`; shown able to fail: the L1's first pre-freeze list build (line number taken literally) produced an empty-text candidate that broke the control driver; the quote-exact anchor then left 3 leads unresolved; the frozen 4-word-window rule leaves 0 unresolved and 1 re-anchored (`baseline/c1-J1-do-nothing.json` `leadsReanchored`); QUALITY 94 |
| M3 | `control-gap` (freeze) | w1 CritC1Claim probe A: three renamed surfaces on lines restating a mapped kake split + one new tabi line reach C1's predicate (exit 0, newMapped 3); round-33 lesson M5 had named the rename route, and the round-34 freeze built no control for it | prompt §6 item 9 (build the cheapest control) — not applied to the prior lesson's named constructions | QUALITY 96: the freeze's control set includes every cheap construction the previous round's lesson names, each scored; red state = this round's control set (no rename control) against CritC1Claim's receipt |
| M4 | `premature-impossibility` | w1 ScribeSelftestNote declared M04, M05, M06 equivalent mutants (ceiling 17 of 20) | none | refuted by w1 ExecKillsA/B: pinning the printed finding detail kills each (`v3-b-m04…`, `v3-b-m05…`, `v3-a-m06…`); QUALITY 95; shown able to fail: without `detailIncludes` the same three fixtures pass on the mutant (ExecKillsB `mutant-outcomes.json`) |

Mistake sweep (w1 ScribeMistakeSweep, `.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md`, commands in
`sweep-checks.sh`): 28 round-33 wave-2 findings had no disposition (U01–U28). They are routed: U01 (gate v2 admits a
dash-decorated and an upper-case Measured cell), U02/U03 (forgery constructions), U04 (contested-open substring test),
U05/U07/U27/U28 (gate exit-class and H2 provenance), U08–U13/U16–U19 (precision items in round-33 text), U14/U15/U20/U21
(criteria 87/88 and screen granularity), U22–U26 (coverage of R4, near-copy drivers, S125 carry). Round 34 lands none
of them except where a round-34 item already covered the same bytes; each stays open for round 35.

## C1 gate decisions — wave 2 (supersedes the wave-1 table above where they differ)

| item | w1 integration | wave-2 finding | final |
|---|---|---|---|
| row 15 live-delivery-observation (kake `SKILL.md:408`) | map, split-declared | re-keys row 12 js-rendering (w2 CritRowLiveDelivery, CritAdjacencyHarm D1, medium) | withdrawn; screened same-surface `js-rendering-browser-execution` |
| row 16 lab-performance-tool-runs (kake `SKILL.md:697`) | map, split-declared | holds (w2 CritRowLabPerf) | kept |
| row 17 agent-facing-tool-text-craft (kotoba census49:171) | map, split-declared | not a split: kotoba rules the pair `none`; `PROVINCE.md:13` cited for a claim it does not carry (w2 CritRowKotoba, CritDeclarations; high) | withdrawn; census49 :171/:172/:173/:175 screened `third-lane-report` |
| row 18 authenticated-consequential-driving (kasegi mission-control:119) | map, refused-route | neither side routes a surface; the row verified only because tabi_quote and ruling_quote sit on one tabi line (w2 CritRowKasegi; high) | withdrawn; kasegi :267/:119/:272 screened `third-lane-report` |
| kaidoku r10-01-queue-ops.md:151 (recorded HAR), r10-02-queue-ops-2.md:117 (screenshot pair-compare) | L1 screened same-surface cdp-runtime-observation | the lines' own files remove the CDP subject; real overlaps screened (w2 CritReversalKaidoku; medium) | restored as map rows `recorded-har-producer-channel`, `screenshot-pair-compare-semantics` (split-declared, tabi sides at `SKILL.md` §"wave-2 additions"); not counted by the counter (the kaidoku quotes do not name tabi) |
| kaidoku r3-runtime-observation.md:99 | L1 screened | reversal holds; ground re-recorded on kaidoku `PROVINCE.md:53` and the round-16 ruling | screen kept, note corrected |
| kumitate :250/:278 | L1 screened | holds; ground re-recorded on `kimi-skills-plugins.md:318-321` (low) | screens kept, notes corrected |
| low ledger defects | — | fire-journal reason (not-browser-sense → no-claim-declared), three kake pin notes, kotoba :136 provenance note, three kagi "row 6" notes (→ row 8) | corrected in the ledger |

Result: newMapped 1 (row 16) against the frozen target 3 — **C1 not met, honest stop**. The three withdrawn rows are
the measure of this round's integration error (M5 below); no row was kept against a wave-2 finding.

## Wave-1 attacks on the frozen counters (limits; predicates unchanged)

Seats scored after the freeze, so no counter clause changes this round (prompt §6 item 9: a rule changed after any
seat has scored is not the claim's rule). Each finding is a limit the disposition must not hide:
- C1 (w1 CritC1Counter K1/K2/K6, CritC1Claim probe A): one junk tabi line plus three `refused-route` rows with
  arbitrary surfaces, or three renamed surfaces on lines restating a mapped split, reach the predicate. The counter
  checks the shape of a declaration, never that it is one. Guard used: every new row and every screen group is
  attacked in wave 2, and the L1 screened five seat-drafted rows rather than inflate the count.
- C1 (w1 MutC1Counter): 9 of 12 counter mutants survive the five controls (target 3→2, sibling-token clause, dedupe
  key, screen quote and same-surface checks, baseline fold); the controls pin only the new-declaration and
  split-tabi clauses.
- C2 (w1 CritC2Counter K1–K3): a whitespace/comment-normalised self-hash and two sibling constructions reach the
  predicate with no rule-exercising case — the disclosed residual. Guard used: wave-2 RevSelftestCodeRead reads every
  added self-test line.
- C2 (w1 MutC2Counter): 9 of 10 counter mutants survive the four controls (kill exit-code strength, FAIL-line
  requirement, decoy/neutral probes, occurrence check, battery leg); only the twin-probe removal is caught (by J3).
- C2 (w1 SentinelCounters F1, high): the counter writes the gate path of a clone of REV with `writeFileSync`, which
  follows a symlink committed at REV — a hostile REV could redirect the write outside the scratch. The lane's REV is
  the L1's own commit; the measurement provenance records the gate's git mode at REV (`100644`, a regular file).
  Routed: a counter amendment for round 35 (`lstat` refusal, scrubbed HOME).
- C2 (w1 CritC2Axis, ScribeSelftestNote): M04/M05/M06 called equivalent (ceiling 17) — refuted by detail pinning
  (M4 above); wave 2 RevKills seats attack the three cases.

## Errata intake (round-33 spot-check routed defects 1–7)

1. Adjacency carried claim → C1 (sweep outside PROVINCE; integrator reversals recorded above).
2. Battery v2 → the mutant half is C2; randomised subjects and CritForgeV2B/C stay limits (entry §5).
3. Calibration counter v4 → not claimed (`claims.json:notClaimed`).
4. Integration hygiene → `check-selfassessment` read on every integration candidate before commit this round
   (round-34 SCORECARD disposition); QUALITY 92.
5. Precision items → ReopenS128 → S133; CritScreenOthers/CritScreenCrawlerSplit → `corpus/adjacency-screen.tsv`
   rows 31, 35, 39, 42 relabelled (kake `PROVINCE.md:396` → same-surface robots-txt…, `:411` note, `:422`/`:440` →
   same-surface crawler-discipline…; validated inert by w1 ScribeScreenRelabel against the round-33 counter);
   CritErrataLanded lows → three append-only corrections (`corpus/knowledge/webdriver-bidi-runtime-round-32.md`,
   `LOG.md`, `corpus/lessons/round-32.md`); 404 receipts by body text → QUALITY 93.
6. S125 cadence → proposal recorded above, cell unchanged (frozen append-only rule).
7. M3 residual → round-34 controls read sibling pins from `baseline/c1-pins.json`, never branch heads.

## Search log

- Candidate set A: `git -C <sibling> grep -n -i -w tabi <pin> -- SKILL.md 'corpus/knowledge/*.md'` over 20 siblings
  (38 lines; kake 7, kotoba 11, kumitate 5, mori 8, tameshi 5, tsukuroi 2).
- Candidate set B: round-33 ConnSiblingScan leads (29 after dedupe).
- Sources: Gitiles `?format=TEXT` at tag 154.0.8037.97 for token.cc, unguessable_token.h,
  render_frame_devtools_agent_host.cc, CdpTargetManager.ts, README.chromium, commands.cc, session_commands.cc,
  util.cc; 503 first responses retried (nothing inferred from a 503).
