# Round 32 — WebDriver BiDi at runtime and the stagnation-nudge calibration class (2026-10-26)

Baseline `d805d1d6132430118b206a848b85753ab35d1014`; counters landed in `2f8535c5b3015fc5730c1076cbe57d1dc29e4fee`
and fixed before the freeze in `5ad1fcbfbae947e56ed448c7d24af0632b534e80` (frozen digests); claims and controls frozen
before data in `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (`.ufo/waves/round-32/claims.json`, receipts
`.ufo/waves/round-32/baseline/README-receipts.md`). Waves: w1 build + first falsifiers (`.ufo/waves/round-32/w1/`,
36 seats), w2 falsify (`.ufo/waves/round-32/w2/`). Integrated by TabiR32 (L1, canonical planner seat).

## Gate

New registry rows S123–S126 (all opened 2026-10-26, status `mined`, tier A scoped to each row's `scope`). Each was
opened this round by a lane seat's own read-only HTTPS GET; fetch receipts in the seat output dirs named below.

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S123 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T16:02:28Z (ScribeS119; HTTP 200, 25,265 B, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`, byte-identical to the round-31 S119 receipt) | header lines 6-11: "Request for Comments: 9309" and "September 2022"; `June 2022` occurs only at lines 554 and 559, inside the RFC 9110/9111 reference entries |
| S124 | https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ (also served at https://www.w3.org/TR/webdriver-bidi/) | 2026-10-26 (ScribeSrcBidiSpec; both HTTP 200, 4,235,856 B, sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`, revision `f922e6af669ead51496db85f37813f39438ef171` — the S005 revision, unchanged) | Abstract: "This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents." (16 words); §4.1: "WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true." (18 words) |
| S125 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc | 2026-10-26T16:06:48Z (ScribeSrcChromeDriver; HTTP 200, 90,944 B raw `?format=TEXT`, decoded sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`) | `session_commands.cc:288-289`, inside `if (session->web_socket_url)` at 287: `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` (12 tokens) |
| S126 | https://www.w3.org/TR/webdriver2/ (this-version https://www.w3.org/TR/2026/WD-webdriver2-20260702/) | 2026-10-26T16:02:14Z (ScribeSrcClassic; HTTP 200, 1,882,653 B, sha256 `929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e`; ScribeEntry fetched the same bytes at 16:02:34Z) | §16.1 known handler table, HTML lines 11306-11307: "ignore" "All simple dialogs encountered should be left to the user to handle." (12 words); §7 capabilities table lines 1976-1980: "Describes the session's user prompt handler. Defaults to "dismiss and notify"." |

Admitted: S123 (supersedes S119's anchor month; rows D1–D5 keep citing S119, whose spans re-locate unchanged),
S124, S125, S126 (each cited by `corpus/knowledge/webdriver-bidi-runtime-round-32.md`; S123 by
`corpus/knowledge/rate-signal-decision-table.md` §Errata round 32).

Rejected:
- **A Chrome-docs page for the `webSocketUrl` capability** (the w1 item's planned S125). All 21 pages of the
  ChromeDriver docs navigation were fetched (HTTP 200); `webSocketUrl` occurs only on `/docs/chromedriver/downloads`,
  twice, both as the 2023 title "Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy"; 15 guessed BiDi
  URLs answered 404 and the child sitemaps 500. An issue title is not an enabling instruction. Flip: a Chrome-owned
  page that documents the capability. S125 cites Chrome's own driver source at the measured tag instead.
- **The WebDriver classic editor's draft** (https://w3c.github.io/webdriver/, 1,882,259 B): same two claims as S126,
  undated. Flip: the dated WD drops or changes the handler text.
- **`webSocketUrl` as a WebDriver classic capability** (the w1 item text): 0 case-insensitive matches of `websocket`
  in the dated classic WD and 0 of `websocketurl` in its editor's draft; the capability is BiDi §4.1 (S124). Recorded
  as M3.
- **R16 marked measured.** The dated BiDi WD has no navigation-stop command (§7.3.3); the gate refuses it
  (`x2-no-counterpart`), and the entry marks it `no — no BiDi command`.

Spot-check (`LEARNING.md` §Discernment): owed to the round's non-author closure; seats this lane dispatched are the
lane.

### Assimilation (§10)

Assimilation: none. No `merge/tabi/` theme was taken (C1 and C2 rest on this round's own sources and lane bytes), and
this lane has no `considerthese/` directory.

### Status / recheck / used-by changes

None in place. S119 keeps its row; its anchor month is corrected by the new row S123 (`supersedes S119 —`), and the
decision-table entry's header `recheck: 180d` for S119/S120 is read as the registry's `365d` (entry §Errata round 32).

## Mistakes

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `stale-premise` | `SCORECARD.md:1473`, `:1515`, `:1576` ("nudge inactive", rounds 29–31) against `AXES.md` §The stagnation nudge ("at or above") and the capability table's last entries (round 25, `SCORECARD.md:1306`, `:1314`); `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (3 m4 among 18, exit 1) | none (`grep -n -i 'nudge\|stagnation' corpus/QUALITY.md` exit 1 at the freeze) | criterion 83 + class `m4-nudge-state` (v3); red at the freeze, cleared only by cited corrections stating `nudge was active` |
| M2 | `survivor` | `.ufo/waves/round-32/w1/CritC1Forgery.md`: four constructions reach admitted 16 under the frozen C1 gate (row id listed 16 times; one transcript cited as both runs; a driver that re-exports the gate; a synthetic transcript with one real first screenshot spliced in) — `claims.json` C1 `feasibilityDisclosed` ("not reachable without a committed receipt of two real runs from a driver other than the counter") is false as written | none | criterion 86 and the plain distinct counts beside the gate's reading (`.ufo/waves/round-32/measure/c1-distinct.mjs`; red on the v1/v2/v3 forgeries, green on the lane receipt: `measure/c1-distinct-red-green.txt`); gate v2 planned |
| M3 | `attribution` | the w1 item text for S126 ("W3C WebDriver classic: the `webSocketUrl` capability …"), L1-authored; `.ufo/waves/round-32/w1/ScribeSrcClassic.md` F2 (0 matches in the dated classic WD) | CORPUS.md "A quote names its location" — caught by the seat before any row was written | S126 scoped to the classic prompt handler; `webSocketUrl` grounded in S124 §4.1 |
| M4 | `number-drift` | `.ufo/waves/round-32/w1/ExecC2Apply/scorecard-block.md`: the drafted nudge corrections give rounds 29–31 the round-32 axis inputs (all 9 but adjacency 8); the lane bytes read depth 8 … at `SCORECARD.md:1472`, `:1514`, `:1574-1575`. The frozen counter scores the draft clean (`ExecC2Apply/counter-after.json`, mismatches 0): m4 supersession checks the citation and the state word, not the inputs | none (instrument limit) | caught at L1 integration by reading the cited lines; the landed corrections cite each round's own axes line; criterion 83 requires the inputs be named |
| M5 | `provider` | every `--live` control leg at `2f8535c5` failed `session not created: Chrome instance exited`: chromium's singleton socket lives under TMPDIR and a deep scratch TMPDIR overflows the 108-byte unix-socket path. Red/green: `.ufo/waves/round-32/measure/c1-socket-path-red-green.txt` (70-byte TMPDIR: 2f8535c5 fails, 5ad1fcbf runs 28 commands) | the pre-freeze control run (claims rule: build the cheapest control before freezing) | `5ad1fcbf` hands chromium a short TMPDIR (scratch ≤ 60 B, else a throwaway dir under `XDG_RUNTIME_DIR`); fixed before the freeze, disclosed in `claims.json` `counterCommits.note` |

### M1 — a round carried a derived state instead of re-deriving it

The statement was derived correctly at rounds 26–28 (the window still held the round-25 capability rows) and repeated
at 29–31 after those rows left the window, while every axis sat at or above line 8. Round 31 added a reason that narrows
the rule ("depth and adjacency sit at the line, not above it", `.ufo/waves/round-31/claims.json:11`). Uncounted
recurrences the instrument cannot read: `LOG.md:2072` and the three frozen `claims.json:11` lines of rounds 29–31
(corrected in `LOG.md`; the frozen files are not edited). Wave-1 disclosure (`.ufo/waves/round-32/w1/CritAxisCapability.md`
F1): the derived state depends on which rows count as capability entries — rounds 24–25 entered gates as capability
rows, rounds 27+ declared that gates are not repertoire rows. Under the table as committed (what `AXES.md` binds) the
statements at rounds 29–31 are false; had the round-27 and round-31 gates been entered under the round-24/25 practice,
29 and 30 would hold and 31 would still be false. Criterion 84 fixes the rule forward.

### M2 — the C1 gate counts listings, not surfaces

The live leg re-tests every admitted row on a session the gate starts itself, so "BiDi works on this host" survives each
forgery; what does not survive is the claim's sentence about the receipt's provenance. The round's own receipt passes
the plain counts (16 distinct ids, 2 distinct transcript digests, driver digest `55dbef88…` ≠ gate `2f25af5a…`, driver
imports only `FIXTURE_SHA256`, `VIEWPORT`, `serveFixture`). Gate v2 (distinct ids, distinct digests, driver ≠ gate
content, splice detection) is planned, not claimed.

### Carried round-31 errata (routed defect 4) — dispositions

Re-checked by w1 ScribeErrataA (E1–E9), ScribeErrataB (E10–E18), ScribeErrataC (E19–E27) against the freeze bytes;
each block in `.ufo/waves/round-32/w1/ScribeErrata{A,B,C}/errata-*.md` carries the re-check evidence and the draft or
refusal text.

| errata | disposition this round |
|---|---|
| E2, E22, E25 | closed — already landed before this round (E2 at `corpus/QUALITY.md:463-464`; E22 at `SKILL.md:2610`; E25 at `corpus/README.md:699-703`) |
| E11 | closed — no action: nothing false (`-q` is argv[1] of the decision-table counter's curl call) |
| E15, E16, E23 | closed — refused with reason and flip condition (E15: the only false sentence is inside a frozen script header; E16: false-negative-only gaps no document asserts; E23: declared not claimed, unmeasurable without running those gates) |
| E3, E6, E7, E8, E9 | carried — counter change refused this round (`scripts/**` frozen after the freeze; decision-table v2 not claimed); the limit texts are drafted in errata-A for the decision-table v2 round |
| E21, E24, E26, E27 | landed below as recorded limits of the v3 calibration counter |
| E19 | half-closed — v3 enforces the exit/verdict arm (criterion 85); `passed=` is still not parsed |
| E1, E4, E5, E10, E12, E13, E14, E17, E18, E20 | carried — append-only correction texts drafted (targets `SKILL.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/lessons/round-31.md`); not landed this round |

Carried at round end: 16 of 27 (E1, E3–E10, E12–E14, E17, E18, E19's `passed=` arm, E20), down from 27.

### Recorded limits of the v3 calibration counter (errata E21, E24, E26, E27; ScribeErrataC drafts, landed verbatim)

- **Counter hygiene residual (round-31 errata E21, re-checked at `4181fff`).** `scripts/check-selfassessment.mjs`
  v3 keeps four v2 defects. (1) `git()` scrubs `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` only (`:104`); `GIT_DIR`,
  `GIT_WORK_TREE` and `GIT_INDEX_FILE` pass through, and the m2 and m3 spawns carry no environment scrub at all
  (`:399`, `:419`). (2) `TALLY_PATTERNS` (`:130`) and the `statSync` import (`:79`) are dead — one reference
  each, the definition and the import. (3) the self-test's failure code 3 (`:1063`) is absent from the header's
  verdict table (`:5-7`), which declares every other nonzero code could-not-evaluate. (4) `m3Findings` reads
  the `--rev` blob (`:528`) while its `git status --porcelain --untracked-files=all` runs on the worktree
  (`:419`); only the clean-checkout measurement rule keeps an ancestor run from comparing two trees.

- **Oracle coverage residual (round-31 errata E24, re-counted at `4181fff`).** `SELFASSESSMENT verdict=clean
  mismatches=0` is a statement about counted comparisons only. The frozen reading carries 195 findings: 104
  refused — 27 m1 (24 ambiguous script association, 3 outside `RUNNABLE_GATE`, at `LOG.md:972`,
  `SKILL.md:2027`, `SKILL.md:2028`), 76 m2 commands outside the closed re-run grammar, 1 m4 round group
  without axis inputs — plus 46 m1 matched and 21 m1 cleared only by a later correction paragraph; 15 m1 and
  3 m4 were counted. `RUNNABLE_GATE` (`scripts/check-selfassessment.mjs:88`) can never count
  `scripts/freshness-witness.mjs`, `scripts/webmcp-invoke-round18.mjs`,
  `scripts/selftest-measurement-binding.mjs` or any `.ufo/waves/**` gate. Quote the zero with these numbers;
  never as "all statements verified".

- **Receipt counts read as tallies (round-31 errata E26, live at `4181fff`).** The claim extraction
  `(\d+)-case` (`scripts/check-selfassessment.mjs:216`, `:322`) has no actor test: `SCORECARD.md:1138`'s
  "12-case in-memory matrix" is read as a tally of `scripts/round-evidence-audit.mjs` (claimed 12, observed 13)
  and survives only because a later correction paragraph supersedes it, and `SKILL.md:2028`'s
  "real12-case/four-control receipt" is read as a tally of `scripts/webmcp-invoke-round18.mjs`, refused only
  because that script is outside `RUNNABLE_GATE`. A receipt, population or matrix size written on a
  gate-naming line is a claim until a correction clears it; the round-32 corrections therefore state one
  tally per line and no other `N-case` count.

- **Supersession accepts any stated number (round-31 errata E27, live at `4181fff`).** `statedTallyNumbers`
  (`scripts/check-selfassessment.mjs:264-271`) accepts a bare `N/M` anywhere in the paragraph (`:270`), a
  `cases: N` (`:268`) and an `N-case` (`:267`) without binding the number to the script the paragraph names;
  the code comment at `:246` states the looseness ("or restates the figure"). A correction paragraph therefore
  clears a stale tally when *any* accepted number in it equals the oracle tally — a date (`10/26`), a round
  range (`round-30/31`) or a denominator elsewhere can do the clearing. Round-32 corrections state the oracle
  tally once, in a parsed shape, and carry no second number that could equal it.

## Wave 1 attack findings carried as limits (append-only)

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M6 | `survivor` | `.ufo/waves/round-32/w1/CritC2Counter.md`: the m4 class parses a correction that quotes the stale phrase as a fresh statement; a capability cell whose first digits are 29–31 flips rounds 29–31; any paragraph with `correct`, a `SCORECARD.md:` range and `nudge active` clears a finding. `.ufo/waves/round-32/w1/MutC2.md`: 5 of 10 single-point mutants survive the frozen 41-case selftest (window off-by-one, prose-capability parsing, self-supersession, verdict-only refusal, section grouping) though each is killed by a w1 fixture | none | the round-32 corrections avoid all three shapes (w2 MutC2Corrections); counter v4 planned with these as cases |
| M7 | `survivor` | `.ufo/waves/round-32/w1/MutC1.md`: 9 of 20 mutants of the C1 gate survive its 27-case selftest (driverSha256 equality and error-frame `ok()` the worst) | none | gate v2 planned with one case per survivor |
| M8 | `scope` | `.ufo/waves/round-32/w1/ExecDeterminism.md`: the t3 binding is byte-deterministic within one environment (6/6) and red under `--force-device-scale-factor=2`, `LANG=ja_JP.UTF-8` or a window-size pin; `.ufo/waves/round-32/w1/SentinelPerimeter.md`: the host launcher prepends `~/.config/chromium-flags.conf` (incl. a `--load-extension`) and the browser contacts Google hosts in the background | none | recorded in the entry §7 and SKILL; the receipt is scoped to this host build and environment |
| M9 | `stale-premise` | `.ufo/waves/round-32/w1/ExecCollectorTiming.md` case 3 contradicts the mechanism stated in the matrix's round-13 collector correction (`corpus/knowledge/webdriver-bidi-capability-matrix.md` §Dated correction 2026-10-20) | none | carried: an append-only correction of that paragraph is planned with gate v2 |
| M10 | `landing` | `.ufo/waves/round-32/w2/RerunNoHarm.md`: at `b234a589` the frozen `scripts/check-release-pins.mjs` went green → red (`population=24 unresolved=1`, `UNRESOLVED id=S125 reasons=r1-entry missing`): S125 entered with `recheck: on-release` and a Chromium tag pin, which puts it in that gate's population without a release-pin receipt entry; the wave-1 integration ran no no-harm sweep after integrating (only at the freeze) | none | S125 `recheck` changed in place `on-release` → `90d` (contract rule 2 field; logged below); the measured revision re-runs the full no-harm sweep (`measure/noharm-at-*.txt`) |

## Wave 2 — falsify (append-only)

34 seats attacked `b234a58920134424e0d104f137311ff54a16d26b` (`.ufo/waves/round-32/w2/`). Held: both counting commands
re-run independently (RerunC1Live: 16/16/0 live twice, byte-identical JSON; RerunC2: mismatches 0, 0 deletions), the
census (RerunCensus: 122 → 126, exit 0), the driver's third independent run (RerunDriver: same method sequence and
first-screenshot digest), S123 and S125 re-opened byte-identical, the decision-table errata (CritDecisionTableErrata:
13/13 offline and live), the errata dispositions table (CritErrataDispositions), QUALITY 83–86 (RevQualityCriteria:
85's red state reproduces 39/41, exit 3), the SCORECARD additions (RevScorecard), the capability row (CritCapabilityRow),
no sibling ground absorbed (CritAdjacency), no secret class committed (SentinelReceipts).

Dispositions of the defects found (each landed append-only in the integration that follows `b234a589`):

- release-pins green → red (RerunNoHarm, high) → M10; S125 `recheck` `on-release` → `90d`.
- entry §1 binding overclaim, §8 "four holes" (three closed), R12 limits "unmeasured" though measured in w1
  (CritC1Claim, CritForgeryRecheck, RerunDistinct, CritTrendVerdicts) → entry §Corrections — round 32 wave 2; the
  matrix's round-13 collector clause marked by a dated correction (M9 closed by that correction); SKILL correction of
  `SKILL.md:2636-2639`; README corrections of `corpus/README.md:716`.
- C2's movement (CritC2Claim): corrections substantively true; 3 genuine corrections plus 15 instrument-induced, as
  `claims.json` beforeComposition states; clearance relies on the loose supersession rule (M6).
- S124 `scope` cell and Gate word counts, S126 `anchor` placing the additional-capability slot at §7 line 1798 (it is
  §6.7 Extensions, heading at line 1744): registry cells other than status/recheck/used-by are not edited in place
  (contract rule 2); read the S124 scope as the protocol semantics of the commands the driver runs and the S126 slot as
  §6.7 — superseding rows are planned with the next BiDi source round. (ReopenS124, ReopenS126)
- MutC1Entry: a decorated `Measured` cell (`yes (live)`) silently leaves the population and the gate stays clean →
  carried to gate v2 (M7).

### Status / recheck / used-by changes (wave 2)

- S125 `recheck`: `on-release` → `90d` (2026-10-26; reason M10: the release-pin gate reads every `on-release` row
  pinned to a Chromium tag as part of its population, and S125 has no release-pin receipt entry).

### Wave-2 precision defects carried (append-only)

Not landed this round; the round-33 errata intake, each with its evidence in the named report:
`.ufo/waves/round-32/w2/CritNewNumbers.md` (five stated numbers in the round-32 text that do not re-derive, the first
reporting a routed round-31 defect as closed with a delta; none changes the C1 or C2 verdict),
`.ufo/waves/round-32/w2/CritEntry.md` (ten precision/provenance defects in the entry, among them §8's "four
constructions" where w1 CritC1Forgery rates a fifth), `.ufo/waves/round-32/w2/RevLesson.md`,
`.ufo/waves/round-32/w2/CritReadmeLog.md` and `.ufo/waves/round-32/w2/ConnRoutedLedger.md` (19 medium-or-higher w1
findings with no landing line — this section and the round-33 plan are their ledger).
