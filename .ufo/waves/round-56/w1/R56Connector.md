# R56Connector — sibling-overlap scan for C1 adjudication input

**Seat:** R56Connector (leaf member; no subagent dispatch)
**Wave:** round 56 / w1 (the only v1 wave)
**Scope:** READ-ONLY sibling scan. Wrote exactly one artifact: the overlap TSV.
**Frozen inputs read, never edited:** `.ufo/waves/round-56/claims.json`,
`.ufo/waves/round-56/controls/c1-meter-v15-red-at-round-open.json`,
`.ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs`,
`corpus/adjacency.tsv`, `corpus/adjacency-host-audit-r55.tsv`,
`corpus/adjacency-host-delta-r55.tsv`.

## Artifact

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/connector/overlap.tsv`
— **79 lines = 1 header + 78 data rows.**

Columns: `lane, head, file, line, term, wholeLineText, tabiOwnsSurface, proposedDisposition, reason`.

## Method (mirrors the frozen meter's own model)

1. Roster = the frozen meter v15's `rosterScan(fleet)` (dot-entries skipped; symlinks
   stat-followed; `laneExists` = `.git` or `HEAD` present; `tabi-shokunin` excluded).
   → **20 lanes**, identical set to the round-open control receipt's `headSnapshot` keys
   (`snapshotOnly: -`, `rosterOnly: -`).
2. ONE `git rev-parse HEAD` per lane → a single head snapshot; then every sibling byte is
   read with `git cat-file -p <snapshotHead>:PROVINCE.md`. The working tree is never read.
3. `BG_WORDS` and `DISPOSITIONS` are read verbatim from the frozen meter:
   `['cdp','devtools','remote-debugging','headless','webdriver','geckodriver','selenium','playwright','bidi','crawl','screenshot','recordhar','record-har']`
   and `['no-tabi-ground','overlap-declared','contested-open']`. No category was invented;
   every `proposedDisposition` in the TSV is one of those three.
4. Every `wholeLineText` was re-read from `git cat-file` and compared byte-for-byte
   against the line at the stated number: **78/78 exact, 0 mismatches, 0 tabs, 0 out-of-vocabulary
   dispositions.**

## Lane list (step 1 answer)

The 20 lanes of the control receipt's `headSnapshot` are the complete roster. Directories under
the fleet root **ending in `-shokunin`** that the meter does NOT list: **none** — the 21
`-shokunin` directories are 20 roster lanes + `tabi-shokunin` (self, excluded by the meter).

One non-`-shokunin` directory is worth recording: `/home/vgpnk/Projects/shokunin/kumitate-shokinin/`
(a typo'd name) contains only `kumitate-shokunin/.ufo/waves/round-69/` and **no `.git`** — it
resolves to the fleet-root worktree (`git rev-parse --show-toplevel` →
`/home/vgpnk/Projects/shokunin`), so `laneExists` is false and the meter correctly skips it.
It is **not** a lane and was not screened.

## Summary counts (step 4 answer)

### Hits per lane (78 total)

| lane | hits | | lane | hits |
|---|---|---|---|---|
| kake-shokunin | 45 | | kotoba-shokunin | 3 |
| game-dev-3d-shokunin | 8 | | mado-shokunin | 2 |
| kaidoku-shokunin | 6 | | tsukuroi-shokunin | 1 |
| revenger-shokunin | 4 | | audio-shokunin | 3 |
| kagi-shokunin | 3 | | game-dev-2d-shokunin | 3 |

Lanes with **0** BG hits (10): chousa, kama, kasegi, kengaku, kotodama, kumitate, lore, mori,
souji, tameshi.

### Dispositions

`no-tabi-ground` 67 · `contested-open` 7 · `overlap-declared` 4.

### Hits that touch a tabi Owns/Refuses surface

**11 hits** touch a tabi `Owns`/`Refuses` line of `tabi-shokunin/PROVINCE.md`
(7 on an **Owns** line, 4 on a **Refuses** line):

| lane | hits | tabi line touched |
|---|---|---|
| kagi-shokunin | 3 (L41, L64, L81) | Owns: browser inventory + profile surfaces [PROVINCE.md:8] + Owns: CDP session discipline [PROVINCE.md:9-10] |
| kake-shokunin | 4 (L40, L310, L329, L344) | Refuses: web *publishing* (→ kake) [PROVINCE.md:16] |
| kaidoku-shokunin | 2 (L53, L137) | Owns: CDP session discipline [PROVINCE.md:9-10] |
| revenger-shokunin | 2 (L30, L33) | Owns: CDP session discipline [PROVINCE.md:9-10] |

### Refusal routes (revenger, kaidoku, kake, kagi) appearing on those hits

- **kake** — on **4** of the 11 surface-touching hits (kake L40, L310, L329, L344; each names
  `tabi` and the client-side-crawler split). Also literally on kagi L64 ("contested with kake").
- **kagi** — the kagi lane's own 3 hits (L41, L64, L81) are all on kagi's CDP/profile surface;
  L64 literally names both `kagi` and `kake`; L81 states the CDP lease question is never
  adjudicated in kagi.
- **revenger / kaidoku** — the shared **reverse-engineering-as-forensics** route
  (tabi `PROVINCE.md:15`) is what puts kaidoku L53/L137 and revenger L30/L33 on tabi's
  CDP-session surface at all; revenger L30/L33 are the CDP half of the same
  `rea-browser-runtime-evidence` claim.

`mado-shokunin` L35 additionally names `kagi` but is `no-tabi-ground` (a desktop tripwire row).

## Cross-lane overlaps the meter would NOT catch (step 5 answer)

The meter's P3 screen reaches **only** lanes that carry a `lane` row in the delta ledger.
Two structural gaps follow, and both are measured here.

### (a) Six roster lanes are never BG-screened at all

`kagi`, `kaidoku`, `kake`, `kama`, `kumitate`, `revenger` are covered by the ruled map
(`corpus/adjacency.tsv`) but have **no** delta `lane` row, so P3 never asks for a disposition
on their PROVINCE.md. Their BG hit lines are invisible to the meter:
**kake 45 + kaidoku 6 + revenger 4 + kagi 3 = 58 of 78 hits (74%) sit in unscreened lanes.**
(Only the 9 lanes with delta rows — chousa, kasegi, kengaku, kotoba, kotodama, mado, mori,
tameshi, tsukuroi — are reachable; their 6 hit lines already carry line rows in the r55 ledger.)

### (b) The three delta `lane` rows name lanes that no longer exist

The r55 delta ledger's lane rows are `shokunin-binary-forensics`,
`shokunin-repo-hygiene`, `shokunin-reverse-engineering`. **None is on the roster.**
Their province bytes are byte-identical (same sha256) to lanes that ARE on the roster:

| stale delta lane name | sha256 | current lane holding those exact bytes | roster name? |
|---|---|---|---|
| shokunin-binary-forensics | `c49f6d1d1144` | **revenger-shokunin** | yes |
| shokunin-repo-hygiene | `c60046df0ee0` | **souji-shokunin** | yes |
| shokunin-reverse-engineering | `50b6c259beb6` | **kaidoku-shokunin** | yes |

Consequence for the meter: `rosterSet.has(lane)` is false for all three, so
`delta-lane-not-on-roster` fires (3 of the 19 round-open findings) **and** their 10
`line` rows are skipped by P3 — so revenger's 4 CDP hit lines and kaidoku's 6 CDP hit lines
carry adjudications that the meter never checks. **These 10 hits are adjudicated in the TSV
(verbatim quotes at the current head) but are invisible to v16 unless the lane rows are
re-bound to the current lane names.** This is the single highest-value rebind: it converts
10 previously-unchecked contested surfaces into checked ones.

### (c) A sibling whose PROVINCE.md states a CDP surface WITHOUT a BG keyword

`kake-shokunin` PROVINCE.md (map-covered, no delta row → never screened) states the
musketeer Chrome-profile lease as contested scope **without any BG keyword**:

```
kake-shokunin PROVINCE.md:45 :: The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)
```

`bgTerms=[NONE]` — no `cdp`, no `chrome` (the word is `Chrome` capitalised but `chrome` is not
in BG_WORDS at all). The map already carries this row
(`musketeer-cdp-9222-profile-lease` / kake / `kake-shokunin@1772f82c:PROVINCE.md:45`,
disposition `contested-open`, ruling_ref `fleet@ebeb396f…:.ufo/l0-questions.md:62`), so the
surface is not un-adjudicated — but the **BG screen can never re-derive it**, because the
screen only fires on BG keywords. Any future change to that line is unchecked by P3.

Other non-BG browser-surface lines with no map row and no delta line row (11 total, all
verified `bgTerms=[NONE]`), VERBATIM:

```
kagi-shokunin PROVINCE.md:89 :: - **Adjacent — report, don't absorb:** chousa owns the research method (`SOURCES.md` restates neither method nor admission bar); chousa, kasegi and kumitate run their own secret-shaped tripwires over their outputs (hygiene filters, not vault
kagi-shokunin PROVINCE.md:103 :: method, secret-scanner ownership, browser leases or authenticated endpoint
kake-shokunin PROVINCE.md:73 :: The publisher-side canonical tool now consumes saved GET-response HTML from owned public properties through `scripts/live_snapshot.py`; live capture is GET-only and separate from offline validation. This is not rendered-DOM observation, navigation/readiness approval or permission to publish. `corpus/lessons/round-23.md` records the outcomes; source repair and deployment stay operator-owned. A surviving burnerchrome source candidate at `~/Projects/burnerchrome` was found and read only; its mapped historical ds4cc-marketplace path remains absent.
kake-shokunin PROVINCE.md:78 :: The earlier Surfaces paragraph and round-23 burnerchrome note are historical local-state observations. On 2026-10-21 the ds4cc-marketplace checkout and its CNAME, burnerchrome, speedrun and apps-sdk subtrees are present again (checkout birth 05:19 -03; observed HEAD 1fbdb8ed). No restoration was performed by kake. Evidence: `.ufo/waves/round-24/c1-receipts/T16.json` through `T19.json` and `w1/R23ReceiptsDs4ccStale.md`. Presence enables later source rechecks; it does not establish live deployment or grant publication, browser-profile, DNS or account authority. The webzites, Plazir and Lucario observations remain separately dated.
kake-shokunin PROVINCE.md:368 :: stays open and stays tabi's adjacent province for anything that executes a browser. Held entries
kake-shokunin PROVINCE.md:369 :: that still speak of a bare "Googlebot" (js-rendering-queue, dynamic-rendering-workaround-limits,
kake-shokunin PROVINCE.md:475 :: the corpus cites — `ds4cc-marketplace` (with burnerchrome, speedrun,
kotoba-shokunin PROVINCE.md:76 :: | tabi | none | 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb | tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13) and refuses forensics, publishing and secrets to revenger, kaidoku, kake and kagi (PROVINCE.md:15-17); it states no split with kotoba on its scope surfaces. |
revenger-shokunin PROVINCE.md:31 :: Chrome/156.0.8078.74 at C:/Program Files/Google/Chrome/Application/chrome.exe
revenger-shokunin PROVINCE.md:32 :: and Edge at C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe serve a
tsukuroi-shokunin PROVINCE.md:150 :: R20-OUT009: OUT-009 is Revenger's sibling declaration of reverse engineering of shipped artifacts — native binaries, managed assemblies, Electron/JavaScript packages, Android APKs, archives, firmware, browser/Electron runtime evidence. It is not a tsukuroi grant of ownership. Kaidoku/Revenger arbitration remains unresolved; ask the protocol integrator before an internals handoff. No configuration, service, package, boot or sibling-file write is authorized.
```

`revenger-shokunin` PROVINCE.md:31–32 name the Chrome/Edge **binaries** that serve the
loopback CDP endpoint, but the line that carries the word `CDP` is L30/L33 — which the
map covers (`rea-browser-runtime-evidence` / revenger / `revenger-shokunin@cf024192:PROVINCE.md:5`).
So the map catches the surface; the **screen** cannot, because L31/L32 have no BG keyword.

`kama-shokunin` PROVINCE.md contains **no** browser-surface mention at all (0 BG hits, 0
non-BG browser lines). Its CDP surface lives in a non-PROVINCE file —
`corpus/knowledge/listener-census.md:355 :: 2. \`127.0.0.1:9222\` — Chrome DevTools protocol, 21 live targets including \`https://chatgpt.com/\`,` — and that row IS map-covered
(`cdp-live-target-census`). kama is therefore correctly screened by the map, not by PROVINCE.md.

## Independent cross-validation against a sibling seat's r56 delta ledger (read-only)

A sibling seat had already written `corpus/adjacency-host-delta-r56.tsv` (16 lane rows,
30 line rows) while I was scanning. I did **not** edit it. I read it and checked it against
my own independent re-derivation:

- **16/16 lane rows agree** with my scan on `provinceSha256`, `lines` and `bgHits` at the
  same head — my scan and the sibling's ledger were derived independently and converge.
- **30/30 line rows agree with my TSV** on lane, line number and disposition, including the
  two contested-open CDP rows (kaidoku:53, kaidoku:137, revenger:30, revenger:33) and all
  `no-tabi-ground` rows for audio / game-dev-2d / game-dev-3d / kotoba / mado / tsukuroi.
- **Two rows are now stale** (the sibling lane heads moved after it wrote them):
  `kasegi-shokunin` (claimed head `eae1d614542e`, now `cd3029876eac` — sha AND lines
  changed too) and `souji-shokunin` (claimed head `df7d1300cbc5`, now `ab8c1fcfa9b0` —
  sha/lines/bgHits unchanged, head-only move). Both will produce `lane-screen-head-mismatch`
  on the next meter run unless re-bound.
- **Four roster lanes still have no delta lane row** in that ledger: `kagi-shokunin`,
  `kake-shokunin`, `kama-shokunin`, `kumitate-shokunin` — all four are map-covered, so they
  satisfy P2, but **48 BG hit lines (kake 45 + kagi 3) are never screened by P3**. The
  kake lines include the four that state the tabi/kake split (`PROVINCE.md:40`, `:310`,
  `:329`, `:344`); the kagi lines include the contested CDP-9222 profile lease
  (`PROVINCE.md:64`). My TSV supplies the adjudications for all 48.

## Contradictions found (stated, not smoothed)

1. **kaidoku PROVINCE.md:53 — two frozen ledgers disagree.** `corpus/adjacency.tsv` row
   `cdp-runtime-observation` carries disposition **`ruled`** (ruling: *"kaidoku keeps CDP only
   as an REA provider surface for shipped-artifact analysis"*); `corpus/adjacency-host-delta-r55.tsv`
   binds the **same line** (same provinceSha256 `50b6c259beb6`, same head `c7fe6898e9a8`) as
   **`contested-open`**. The TSV carries the r55 delta adjudication forward (`contested-open`)
   — it is the meter-facing ledger and changing it would be a post-data adjudication change.
   The map's `ruled` disposition is left standing and needs the L1's ruling.
2. **The r55 audit ledger claims `sibling-absent` for 5 rows whose sibling is present.**
   `audit-r55` says `sibling-absent` ("probed absent 2026-11-02") for kaidoku:53, kaidoku:3,
   revenger:3, and two kaidoku corpus knowledge rows. Re-derivation at the snapshot head gives
   `stale`/`unchanged`, never `sibling-absent` — the lane directories exist and hold the cited
   files. Root cause measured: the map's `sibling_quote` values are **fragments**, not whole
   lines, and the meter's `observedStatus` compares `lines[lineNo-1] === cited` (whole-line
   equality). For kaidoku:3 the whole line is
   `**Domain:** reverse engineering of shipped artifacts with REA on this Linux` while the quote
   is `reverse engineering of shipped artifacts with REA on this Linux` — a strict substring, so
   the equality fails and the status is `stale`, never `unchanged`. Same class for kaidoku:53,
   revenger:3, and the two corpus rows (one is a leading-whitespace-only difference:
   current `  "any har-schema-valid capture", which playwright's recordHar satisfies.` vs quote
   `"any har-schema-valid capture", which playwright's recordHar satisfies.`). The 6th
   (kumitate SCORECARD.md:1723) is a genuine `moved` — the quote is now at `:1736`.
3. **kake PROVINCE.md:40/310 vs the map's own disposition vocabulary.** The map rows for these
   two lines use `split-declared`; the delta ledger's frozen vocabulary has no `split-declared`.
   The TSV uses `overlap-declared` (the delta vocabulary's term for a declared, closed split).

## Heads that moved during this scan (disclosure, not a finding)

Six roster lanes moved after the round-open control snapshot was taken:
`kagi-shokunin` `f67232cd→b7482b4a`, `kake-shokunin` `17072048→dbcfef0b` (two moves observed:
`4d188f94` then `dbcfef0b`; the PROVINCE.md sha256 `0513521f…` is identical across all three
heads — the commit moved, the province bytes did not), `kasegi-shokunin` `eae1d614→cd3029876eac` (two moves observed: `6343e2c3` then
`cd3029876eac`; province bytes changed with it),
`kengaku-shokunin` `c78749a5→9ebde3a7`, `souji-shokunin` `f778b9d1→ab8c1fcf`,
`tsukuroi-shokunin` `44fc183b→2f3061ef`.

Against the **r55 delta ledger's** claimed heads, four more differ: `kasegi` (eae1d614→6343e2c3),
`mori` (4ce9e438→84c6cbc3), `tameshi` (25bc78a6→f20ba482), `tsukuroi` (44fc183b→2f3061ef) — the
last three with **identical** province sha256 and line counts (head-only moves).
`kengaku`'s province **bytes changed** (sha `75c6ccc3…`/892 lines → `fd1ad05b…`/952 lines),
which is the `lane-screen-sha-mismatch` + `lane-screen-lines-mismatch` pair in the round-open
finding set; its bgHits remains 0 at the new head.

## Recommended rebind inputs for the L1 (adjudication input only — I did not change any ledger)

1. Re-bind the three stale delta `lane` rows to `revenger-shokunin`, `souji-shokunin`,
   `kaidoku-shokunin` (byte-identity proven by sha256) and carry their 10 `line` rows over
   with the current heads — that alone puts 10 contested CDP surfaces under P3.
2. Add `lane` rows for the 5 roster lanes with no map row and no delta row
   (`audio` 3 hits, `game-dev-2d` 3, `game-dev-3d` 8, `lore` 0, `souji` 0 — souji via the
   rename above) so `roster-lane-uncovered` clears.
3. Re-derive the 6 `audit-status-mismatch` rows against the real status; note the fragment-quote
   class above — a whole-line quote in the map is the only way `unchanged` can ever be reached.
4. The kaidoku:53 `ruled`-vs-`contested-open` contradiction needs an explicit L1 ruling; it
   cannot be resolved by a scanner.

## Commands run (all read-only; no mutating git/jj; nothing committed)

| command | exit |
|---|---|
| `read` of claims.json, RULES.md, c1-meter-v15-red-at-round-open.json, c1-adjacency-host-v15.mjs, tabi PROVINCE.md, corpus/adjacency.tsv, corpus/adjacency-host-audit-r55.tsv, corpus/adjacency-host-delta-r55.tsv | 0 |
| `ls -la /home/vgpnk/Projects/shokunin/` (fleet root listing) | 0 |
| `for d in */; do … [ -e "$d/.git" ] …; done` (lane enumeration) | 0 |
| `git -C <lane> rev-parse HEAD` ×20 (per-lane head snapshot) | 0 |
| `git -C <lane> cat-file -p <head>:PROVINCE.md` ×20 | 0 |
| `git -C <lane> show HEAD:PROVINCE.md` (kagi/kake/kaidoku/revenger/tsukuroi context) | 0 |
| `git -C <lane> grep -n "cdp-bridge" HEAD -- '*.md'` (kagi) | 0 |
| `git -C <lane> log --oneline` (revenger/kaidoku/souji rename history) | 0 |
| `git -C <lane> cat-file -t <old-sha>` ×4 (old delta heads resolve) | 0 |
| `git -C <lane> rev-parse --show-toplevel` (kumitate-shokinin probe) | 0 |
| `node scan.mjs` / `nonbg.mjs` / `gen-tsv.mjs` / `drift.mjs` / `movers.mjs` / `coverage.mjs` / `stale.mjs` / `classify.mjs` / `deltarows.mjs` / `verify-nonbg.mjs` / `tabs.mjs` (scratch, `/fast/scratch/hyaku/tabi-r56/R56Connector/`) | 0 |
| `python3` verbatim re-read check of all 78 TSV rows against `git cat-file` | 0 (78 rows, 0 mismatches) |
| `/home/vgpnk/Projects/shokunin/scripts/hyaku/disk-guard.sh status` | 0 (green; 411G free on /fast) |

**No tool was installed or upgraded.** No package, binary or service changed.

## Verdict

**Adjudication input delivered, no frozen artefact touched.** `overlap.tsv` holds 78
verbatim-quoted BG hits across all 20 roster lanes, every disposition drawn from the frozen
vocabulary, every quote re-read byte-for-byte from git-at-snapshot-head (78/78 exact).
Two structural gaps the meter cannot see are named with measurements: 58 of 78 hits sit in
lanes the BG screen never reaches, and 10 of those are adjudicated under three stale lane
names whose bytes provably live at `revenger`/`souji`/`kaidoku` today. One unresolved
contradiction between two frozen ledgers (kaidoku:53 `ruled` vs `contested-open`) is stated
rather than smoothed, and one audit-ledger falsehood class (`sibling-absent` claimed for
present siblings, caused by fragment quotes) is characterised for the L1.
