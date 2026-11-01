# Round 50 — tabi (Windows host; the journey residual exercised with S161 ground and the measured history model, the D3 carry-in adopted as the declared could-not-evaluate class, the owed D1/D2 corrections of record, the ledger re-bind through one sanctioned correction cycle)

Baseline `a9b47d6a1ea2a2f649c0177dac90dd5e992b9274` → freeze
`2febf9b23cfd6d2b7f9ce6de145c5edf1b4a1c46` (claims.json + instruments +
round-open controls, BEFORE any data commit) → amendment 1
`2604c1d984dcc1d0daba87ba29d75393ed44fa87` (the runner's page-target race,
caught by the first live run; red receipt committed; bounded poll added) →
amendment 2 `5c7019944eee9c6bae56f076765685bb8ba1865f` (the journey history
model corrected to the measured surface truth; red receipt + PNGs committed) →
C2+C3 data `196367606e51417f27165ceec5c4fb0db3734a62` → C1 data
`1ea714f5a39452bb39d61404b7d87e2a27fc4d6a` → C1 correction 1
`bceb21140583e1a4126c681b1ca2e691b6485a15` (**cited measured revision for C1**,
meter v10 GREEN) → green receipt `f3364aaa9ad7612f7fe154bbcbfead1612de3527` →
integration (this commit). Three declared claims, every after-state produced by
committed instruments at its data revision. Carry-in from the r49 non-author
closure (all four routed items addressed; the third is also a claim): (1) D1
number-drift — correction of record (erratum; the true values re-measured from
committed bytes); (2) D2 S160 position — correction of record (same erratum;
this round's own insertion names its position explicitly); (3) D3 the WebView2
auto-update environmental finding — the closure's suggested declared
could-not-evaluate class ADOPTED in a versioned r50 counter this round, as
suggested (claim C3); (4) the `tabi | round-44` L2-floor L0 — still open,
routed around (fifth round running; L1-inline, no wave-settled clause in any
predicate).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S153 — Chrome DevTools Protocol browser_protocol.json (ChromeDevTools/devtools-protocol), https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED this round (first registered 2026-10-31 at r44; today's fresh fetch is BYTE-IDENTICAL to the registered anchor: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` on both fetches, master unchanged between the dates; no new row — the round first drafted a duplicate S161 row and the check-sources gate refused it E04 pre-commit, see Mistakes) | 2026-11-01 | `curl -q -sL --proto =https -o .ufo/waves/round-50/sources/browser-protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,421,620 B (`wc -c`), sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` (== the registered anchor); note: the docs-site pages (`/tot/Page/`, `/tot/Page.json`, `/tot/browser_protocol.json`) are SPA redirect shells — three fetches each returned the redirect HTML, so the repo JSON is the opened source | "Returns navigation history for the current page." (7 words; the getNavigationHistory description; 1 verbatim hit in the opened bytes; the paired navigateToHistoryEntry description "Navigates current page to the given history entry." also verbatim 1 hit — the two primitives the journey's history and back legs run on) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author
spot-check remains the closure's duty):
ADMIT — S153 re-open (fresh fetch byte-identical to the registered anchor,
staged, both history-primitive descriptions verbatim in the opened bytes;
load-bearing for C2: getNavigationHistory and navigateToHistoryEntry are
exactly the two primitives the journey's history block and back leg run on).
ADMIT — C1 (red 24 findings at round open on the inherited r49 generation,
receipt taken before any lane write; ledgers re-bound at one fresh snapshot
with 0 new adjudications — kotoba's three BG lines moved one line down with
text byte-verbatim, dispositions carried by exact whole-line quote match; one
head-race correction (tsukuroi) under the frozen flow; GREEN at `bceb2114`:
exit 0, predicate true, 0 findings, counts {roster:16, mapRows:16,
auditRows:16, deltaLanes:12}; v10 selftest 16/16; v9→v10 diff 62 lines,
comment/const/schema hunks only).
ADMIT — C2 (the r49 planned residual exercised at `19636760`: the live
4-leg journey A→B→C→back-to-B over an inline loopback HTTP fixture, the S161
history block read at C and re-read after the hop, per-step URL/title/PNG
pins, nonce marker riding the fixture pages, Edg/156.0.4314.58 identity,
teardown sweep 0; counter green 0 findings, couldNotEvaluate []; cross-refusal
r49-counter-refuses-r50 4 findings; capability row enters the table at the
integration commit). The claim's road to green ran through two committed red
receipts — the amendment-1 target race and the amendment-2 history-model
misprediction — both kept, neither quietly re-run.
ADMIT — C3 (the D3 carry-in adopted exactly as the closure suggested: the r50
counter grades a missing pinned runtime as the declared
`runtime-pin-host-drift` class under `couldNotEvaluate`, never a finding;
folder-present-without-exe stays the hard `runtime-msedgewebview2-absent`
finding; `runtime-identity-mismatch` added; selftest 13/13 at the data
revision with the d3-asis case pinning the REAL removed runtime and the
deterministic with-exe/without-exe probes covering both branches on any host;
the counter's draft defect carried by a committed red/green pair).
REJECT — the amendment-1 runner bytes (the page target read ONCE after
discovery — the first live run lost the race: exit 1, no-page-target, the
single target still about:blank; receipt `controls/c2-first-live-run-red-target-race.json`;
the same single-read pattern exists in the frozen r48/r49 runners, which won
the race intermittently — that is a latent defect of the inherited family, not
a regression introduced this round). Fixed by a bounded 40×250 ms poll under
amendment 1, BEFORE any data.
REJECT — the amendment-1 journey history model (entries `[a,b,c]`, length 3,
back to `entry[1]`): the live surface refuted it — the initial data: page
occupies history slot 0, so `entry[1]` is `/a.html`, the runner waited for
`/b.html` and exited 1 `journey-back-not-ready` with the measured history
block recorded (`controls/c2-journey-history-model-red.json` +
`controls/c2-model-red-pngs/`). Fixed under amendment 2 to the measured model
(entriesLength 4, currentIndex 3, back to entry index 2), BEFORE any data.
REJECT — the counter's first draft had a wrong global distinctness rule (a
`new Set(steps.map(s=>s.url)).size !== steps.length` check that false-refuses
every journey, because the back leg legitimately revisits /b.html) — caught by
the fixture selftest's own red (the first run read 2/13: green-journey,
journey-history-wrong and journey-back-wrong all gained a spurious
`journey-url`), fixed before any data relied on the counter; the same first
run also caught an authoring bug in the fixtures themselves (the scratch
authoring script wrote `scratchGiven 'fxscratch'` with `scratchResolved
'C:\\fx\\scratch'` — a resolve would have produced `C:\\fx\\fxscratch`, so
every case read a spurious `paths-tail-lost`; Mistakes rows 1-2). The first
run's receipt was overwritten in place by the passing re-run — disclosed here,
and the counter defect's red is reproducible from the committed named
reproduction (`controls/c3-counter-selftest-draft-counter-red.json`: the draft
counter bytes over the final fixtures read 10/13 with the three journey cases
spuriously red).
REJECT — a producer slip between the amendments: one live run was launched
without the `--journey` flag and produced a plain-mode receipt (exit 0,
single PNG, `journey: null`); caught by reading the stdout summary before
anything was committed, the stray PNG deleted, nothing counted from it. The
failing-`--journey` runs above are the only receipts this round's claims rest
on.

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind; measured at
  `bceb21140583e1a4126c681b1ca2e691b6485a15`):
  - Before: `node .ufo/waves/round-49/counters/c1-adjacency-host-v9.mjs --rev
    a9b47d6a… --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false,
    **findingCount 24** (12 lane-screen-head-mismatch + 3 sha + 3 lines on
    kasegi/kengaku/mado byte changes + 2 delta-line-missing +
    1 delta-quote-not-whole-line + 2 delta-line-invented + 1 further head
    mismatch; kotoba's BG-line set restructured) — receipt
    `.ufo/waves/round-50/controls/c1-meter-v9-red-at-round-open.json` (round
    open, before any lane write).
  - After: `node .ufo/waves/round-50/counters/c1-adjacency-host-v10.mjs --rev
    bceb2114… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16,
    deltaLanes:12} — receipt
    `.ufo/waves/round-50/measure/c1-meter-green-at-correction1.json`; the
    correction-1 raced receipt is committed
    (`measure/c1-meter-red-at-data.json`, 1 finding: tsukuroi head).
  - Instrument: `--selftest` → exit 0, allPass=true, cases=16, pass=16
    (`.ufo/waves/round-50/measure/c1-meter-v10-selftest.json`); `diff` v9→v10
    committed (`.ufo/waves/round-50/controls/v9-v10-retarget.diff`, 62 lines,
    comment/const/schema hunks only).
  - Ledgers: `awk -F'\t' 'NR>1{n[$2]++} END{for(k in n) print k, n[k]}'
    corpus/adjacency-host-audit-r50.tsv` → `unchanged 10 / sibling-absent 6`;
    delta-r50 = 12 lane rows + 16 line rows; dispositions carried from
    delta-r49 by exact whole-line quote match, 0 new adjudications (kotoba's
    rows re-bound at :59/:61/:62 verbatim).
- C2 (coverage — the journey capability; measured at
  `196367606e51417f27165ceec5c4fb0db3734a62`):
  - Evidence: `git ls-tree -r --name-only <REV> -- corpus/evidence/round50 |
    wc -l` → baseline 0 → **5** (receipt.json + 4 per-step PNGs).
  - Live run: inline loopback HTTP fixture on ephemeral port 58873;
    legs `Page.navigate` → `/a.html`, anchor-click → `/b.html`, anchor-click →
    `/c.html`, `Page.navigateToHistoryEntry` → `/b.html` (targetIndex 2);
    history at C `[data:, a, b, c]` (entriesLength 4, currentIndex 3), after
    the hop entriesLengthAfter 4, currentIndexAfter 2; titles
    "tabi-r50 journey fixture A/B/B"; PNGs 8,241/8,316/7,523/8,389 B;
    nonce `tabi-r50-998abd20e23cdc57` echoed on the data: page AND riding the
    fixture pages (nonceOnPageA true); `Edg/156.0.4314.58`; teardown
    postKillSweepCount 0.
  - Counter: `node .ufo/waves/round-50/counters/webview2-receipt-r50.mjs
    corpus/evidence/round50/webview2-journey/receipt.json --shot
    …journey-b-back.png --png-a …journey-a.png --png-b …journey-b.png --png-c
    …journey-c.png --driver scripts/webview2-cdp-loopback-round50.mjs
    --hostsrc scripts/webview2-host-round48.cs` → exit 0, predicate true,
    **0 findings**, couldNotEvaluate [] (`.ufo/waves/round-50/measure/
    c2-counter-green-at-data.json`).
  - Cross-refusal: the r49 counter on the r50 receipt → exit 1, **4 findings**
    (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch;
    `measure/c2-r49counter-refuses-r50.json`).
  - `--path-selftest` 6/6 (`measure/c2-path-selftest-at-freeze.json`).
- C3 (operability — the D3 declared class; measured at the integration):
  - Before: `node .ufo/waves/round-49/counters/webview2-receipt-r49.mjs
    --selftest .ufo/waves/round-49/counters/webview2-receipt-r49-fixtures` →
    exit 1, **0/8**, every case's findings polluted with
    `runtime-msedgewebview2-absent` (`.ufo/waves/round-50/controls/
    c3-r49counter-selftest-today.json`); the same counter on the committed r49
    receipts → exit 1 with ONLY that finding (controls
    `c3-r49counter-on-r49-{rel,nav}receipt-today.json`).
  - After: `node .ufo/waves/round-50/counters/webview2-receipt-r50.mjs
    --selftest .ufo/waves/round-50/counters/webview2-receipt-r50-fixtures` →
    exit 0, **13/13** (`measure/c3-counter-selftest-at-data.json` at the data
    revision; the at-freeze receipt `measure/c3-counter-selftest-at-freeze.json`
    holds the same verdict); the d3-asis case pins the REAL removed runtime
    path and passes today (folder absent → couldNotEvaluate
    [runtime-pin-host-drift], findings []); with-exe/without-exe probes
    exercise both branches deterministically; the draft-counter red is
    committed (`controls/c3-counter-selftest-draft-counter-red.json`, 10/13).
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'
  corpus/SOURCES.md` **160 → 160** (UNCHANGED: the round first drafted a new
  S161 row for the CDP protocol definition and the check-sources gate refused
  it E04 duplicate_url — the URL is already registered as S153 and today's
  fetch is byte-identical to the registered anchor; the row was withdrawn
  pre-commit and the source re-opened instead, see Mistakes). Knowledge notes
  65 → **66** (the journey note).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| producer slip: one live run launched without the `--journey` flag | the run exited 0 but the stdout summary read `journey: null` — a plain-mode receipt (single PNG) landed in the evidence dir for minutes | reading the stdout summary before committing (the same receipts-as-evidence habit the r47/r49 lessons pinned) | the stray PNG deleted, nothing counted from it; the only receipts the claims rest on are the named red controls and the final green run |
| instrument defect: the runner read the page target list ONCE after discovery | the first live run at the freeze bytes exited 1 `no-page-target` — the single target was still about:blank at `/json/list`; receipt `controls/c2-first-live-run-red-target-race.json` | the live surface itself (the first data attempt, before any data) | a bounded 40×250 ms poll under amendment 1 (2604c1d9) with the observed targets recorded; the latent single-read pattern in the frozen r48/r49 runners is named in the amendment, not edited |
| design misprediction: the journey history model assumed entries `[a,b,c]` | the first `--journey` live run read `entry[1]` = `/a.html`, waited for `/b.html`, exited 1 `journey-back-not-ready` — the measured history block shows the initial data: page occupying slot 0 (entriesLength 4, currentIndex 3 at C); receipt `controls/c2-journey-history-model-red.json` + `controls/c2-model-red-pngs/` | the live surface again — the receipt's own history block is the refutation | amendment 2 (5c701994) re-keys runner, counter, fixtures and the C2 predicate to the measured model; the measured fact (the data: page is a history entry) is now part of the knowledge note |
| instrument defect: the counter's first draft had a wrong global distinctness rule on journey step URLs | a `new Set(steps.map(s=>s.url)).size !== steps.length` check — the back leg legitimately revisits /b.html, so green-journey read `journey-url` spuriously; the fixture selftest's first run read **2/13** | the counter's own 13-case fixture selftest, run BEFORE any data | the global check removed (the per-step suffix sequence pins A→B→C→B); selftest re-run 13/13 before the freeze; the red is reproducible from the committed named reproduction `controls/c3-counter-selftest-draft-counter-red.json` (draft counter bytes over the final fixtures: 10/13, the three journey cases spuriously red) |
| authoring bug in the fixtures: the scratch authoring script wrote inconsistent given/resolved paths | `scratchGiven 'fxscratch'` with `scratchResolved 'C:\\fx\\scratch'` — a real resolve produces `C:\\fx\\fxscratch`, so every fixture case read a spurious `paths-tail-lost` (the first selftest run was 2/13 with 11 cases red on this alone) | the same selftest red as above (both defects surfaced in one run and were fixed together before the re-run) | the authoring script corrected to the resolvable shape; the first run's receipt was overwritten in place by the passing re-run — disclosed here; both defect classes are named and the surviving red receipt covers the counter half |
| registry duplicate: the round drafted a NEW S161 row for a source already registered (S153, same URL, byte-identical bytes) | check-sources at the integration refused it — "FINDING id=duplicate_url fleet=E04 row=S161 detail=duplicate_url" (the row never reached a commit; the catch record `.ufo/waves/round-50/controls/sources-duplicate-row-catch.txt` quotes the three gate runs that shaped the row, including two field-count refusals E01/E09 before the E04) | the lane's own check-sources gate (the S-tier contract's duplicate-URL rule) | the S161 row withdrawn pre-commit; the source re-opened as S153 (fresh fetch byte-identical, quotes located); the frozen claims.json's "S161" provenance label is corrected of record in the SCORECARD erratum (no measured predicate touches a registry count) |
| correction-flow race (expected class): tsukuroi advanced between the C1 ledger snapshot and the meter run | meter v10 at the 1ea714f5 data commit read exit 1, 1 finding (lane-screen-head-mismatch tsukuroi; raced receipt `measure/c1-meter-red-at-data.json`) | the frozen correction flow itself (fourth consecutive round the gate catches a real race) | ledgers re-bound at a fresh snapshot under the frozen flow (correction 1, bceb2114), dispositions carried verbatim, green inside the two-cycle budget |

## Census

Start (2026-11-01, round open): `bash <fleet>/scripts/sources-census.sh
validate --root <fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04
duplicate-URL warnings (the same set disclosed r47/r48/r49); receipt
`.ufo/waves/round-50/measure/census-start.txt` (committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-50/measure/census-end.txt`), W04 set unchanged at 22 —
S161's URL is new to the registry and lands INSIDE the Registry table (after
the S160 row, before the S159 row — the r48 E12 lesson applied pre-emptively,
and the position is named because of D2).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-01). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow
unreachable.
