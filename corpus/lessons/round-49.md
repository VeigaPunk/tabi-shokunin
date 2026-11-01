# Round 49 — tabi (Windows host; the routed scratch-path foot-gun fixed in a versioned runner with S160 ground, the webview2 surface taught to navigate, the owed ledger re-bind through two sanctioned correction cycles)

Baseline `10ea3d96c0eed6d0e7240f57f7a30d8ef73689b1` → freeze
`7700daf8e1168648c6cb2608880617817b0dda62` (claims.json + instruments +
round-open controls, BEFORE any data commit) → orphan-hygiene
`6e080c17f8e568446a535c845c4387b795b3a1f6` → C1 data `eb89957ff39e645de813c75033fc7828117e0c5a`
→ C1 correction 1 `44dde54f354693838076bc4532a93b693693a7ce` (head race) →
C1 correction 2 `5fa183842a9925b3e18ea5f9df039984d47d5666` (**cited measured
revision for C1**, meter v9 GREEN) → C2 data
`b026dc34368e06eb46ebdd925b132595751ffa4c` → C3 data
`36f8579bf2fbabd71d8a15142e1c9cf29e27bb02` → integration (this commit).
Three declared claims, every after-state produced by committed instruments at
its data revision (no after-state number is asserted from arithmetic — the
r47 durable fix continues). Carry-in from the r48 non-author closure (all three
routed items addressed; the first is also a claim): (1) the webview2
relative-`--scratch` foot-gun — performed as claim C2 with fresh S160 ground;
(2) the orphaned-evidence hygiene duty — the sweep found the literal
cited-but-uncommitted set EMPTY (every receipt cited by committed bytes is a
blob at HEAD; receipt `controls/orphan-evidence-sweep.txt` at the freeze) and
landed the three genuinely-uncommitted r44 receipts it did find; (3) the
`tabi | round-44` L2-floor L0 — still open, routed around (fourth round
running; L1-inline, no wave-settled clause in any predicate).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S160 — User data folder (WebView2 concepts, Microsoft Learn), https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder | 2026-11-01 | `curl -q -sL --proto =https -o .ufo/waves/round-49/sources/user-data-folder.html https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder` → 87,802 B (`wc -c`), sha256 `5c93b4fd95f3903914ae2d4fde9ff324f1d96d56f7ecf5107bc94d43c62d81f2` | "On this platform, the default UDF location is the directory that the app executable (.exe) is running in" (18 words; The-default-UDF-location section, Win32 row; 3 hits in the raw bytes — the sentence repeats verbatim across the platform tab sections; the Win32 section is this lane's surface) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author
spot-check remains the closure's duty):
ADMIT — S160 (raw-fetched this round, staged, quote verbatim in the staged
bytes; load-bearing for C2: it is the documentation of the exact exe-dir anchor
the round-open red control measured).
ADMIT — C1 (red 15 findings at round open on the inherited r48 generation,
receipt taken before any lane write; ledgers re-bound at one fresh snapshot
with 0 new adjudications; correction 1 head-raced (kotodama +
shokunin-binary-forensics advanced between snapshot and meter run) and
correction 2 head-raced (kasegi + kotodama again) — both under the frozen
correction flow, two cycles, within the two-cycle kill rule; GREEN at
`5fa18384`: exit 0, predicate true, 0 findings, counts {roster:16, mapRows:16,
auditRows:16, deltaLanes:12}; v9 selftest 16/16; v8→v9 diff 47 lines,
comment/const/schema hunks only).
ADMIT — C2 (v1-relative red on the frozen r48 bytes with the profile anchored
at the host exe dir exactly as S160 says; v2 same-shape invocation green at
`b026dc34` with the paths block recording given-vs-resolved; counter green 0
findings on the committed bytes; counter selftest 8/8 with the refusal
fixtures; `--path-selftest` 6/6; absolute-equivalence control counter-green —
the resolution is identity for the r48-documented invocation; symmetric
cross-refusals: the r49 counter refuses the r44 chrome receipt with 19
findings, the r48 counter refuses the r49 receipt with 4).
ADMIT — C3 (the r48 note's declared residual exercised at `36f8579b`:
anchor-click cross-page over an inline loopback HTTP fixture on an ephemeral
port, per-page URL/title/PNG evidence, invocation-bound nonce, Edg/ identity,
teardown sweep 0; counter green 0 findings with both nav legs; capability row
enters the table at the integration commit).
REJECT — the first draft of the counter shipped two real defects (a block-scoped
`norm` helper that crashed the paths checks, and a port-blind loopback-origin
comparison that false-refused the live nav receipt) — both caught by the
fixture selftest BEFORE any data relied on the counter, both fixed, and the
selftest re-run to 8/8 before the freeze (the fixture family is exactly the
harness that caught them; Mistakes rows 1–2).
REJECT — the pre-fix `--path-selftest` receipt (a failing draft, 5/6: the
sixth case asserted on the whole resolved path, which contains the CWD's own
letters — a test bug, not a resolver bug); superseded in place by the 6/6
receipt on the final driver bytes (`measure/c2-path-selftest-at-freeze.json`).
REJECT — this round's own ledger-summary misread: after correction-cycle 1 the
round's scratch summarizer printed `audit obs:` empty because it read `.obs`
off STRINGS (the generator's summary rows are strings, not objects); the
summary was wrong, the LEDGER was right — re-derived from the artifact
(`awk` over the committed audit-r49: 10 unchanged + 6 sibling-absent), never
from the summarizer (Mistakes row 3).

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-bind; measured at
  `5fa183842a9925b3e18ea5f9df039984d47d5666`):
  - Before: `node .ufo/waves/round-48/counters/c1-adjacency-host-v8.mjs --rev
    10ea3d96… --repo <lane> --fleet <fleet> --json` → exit 1, predicate=false,
    **findingCount 15** (11 lane-screen-head-mismatch, 2 lane-screen-sha-mismatch,
    2 lane-screen-lines-mismatch; kasegi + mado provinces changed bytes) —
    receipt `.ufo/waves/round-49/controls/c1-meter-red-at-round-open.json`
    (round open, before any lane write).
  - After: `node .ufo/waves/round-49/counters/c1-adjacency-host-v9.mjs --rev
    5fa18384… --repo <lane> --fleet <fleet> --json` → exit 0, predicate=true,
    **findingCount 0**, counts {roster:16, mapRows:16, auditRows:16,
    deltaLanes:12} — receipt `.ufo/waves/round-49/measure/c1-meter-green-at-data.json`;
    correction 1's raced receipt is committed (`measure/c1-meter-red-at-data.json`,
    2 findings); the initial data-time race at `eb89957f` (also 2 findings) was
    overwritten in place by the re-run — the receipt file holds the LATEST run
    (the lane's in-place supersession pattern); the overwrite is disclosed here.
  - Instrument: `--selftest` → exit 0, allPass=true, cases=16, pass=16
    (`.ufo/waves/round-49/measure/c1-meter-v9-selftest.json`); `diff` v8→v9
    committed (`.ufo/waves/round-49/controls/v8-v9-retarget.diff`, 47 lines).
  - Ledgers: `awk -F'\t' 'NR>1{n[$2]++} END{for(k in n) print k, n[k]}'
    corpus/adjacency-host-audit-r49.tsv` → `unchanged 10 / sibling-absent 6`;
    delta-r49 = 12 lane rows + 16 line rows; dispositions carried from delta-r48
    by exact whole-line quote match, 0 new adjudications (kasegi 197→199 lines
    and mado 221→241 changed bytes but their BG-hit line sets are unchanged;
    mado :16/:35 carried verbatim).
- C2 (operability — the routed foot-gun; measured at
  `b026dc34368e06eb46ebdd925b132595751ffa4c`):
  - Before (round-open, on the frozen r48 bytes): `node
    scripts/webview2-cdp-loopback-round48.mjs --scratch relscratch --out
    v1-rel-red-receipt.json` (cwd: scratch) → exit 1, failure
    `no-devtools-active-port` (waitedMs 15568), postKillSweepCount 0 — receipt
    `controls/c2-v1-relative-scratch-red-receipt.json` + stdout + the anchor
    listing `controls/c2-v1-relative-scratch-red-anchor.txt` (the real profile
    at `<cwd>/relscratch/relscratch/<token>-profile` with a live
    EBWebView/DevToolsActivePort).
  - After: `node scripts/webview2-cdp-loopback-round49.mjs --scratch relgreen
    --out rel-green-receipt.json` (same relative shape) → exit 0, ok=true,
    invocation-bound nonce, PNG 7,617 B, sweep 0 — committed at
    `corpus/evidence/round49/webview2-relscratch/` (receipt records
    `paths: {scratchGiven 'relgreen' → scratchResolved <cwd>\relgreen,
    relInvocation true}`).
  - Counter: `node .ufo/waves/round-49/counters/webview2-receipt-r49.mjs
    corpus/evidence/round49/webview2-relscratch/receipt.json --shot
    corpus/evidence/round49/webview2-relscratch/receipt.png --driver
    scripts/webview2-cdp-loopback-round49.mjs --hostsrc
    scripts/webview2-host-round48.cs` → exit 0, predicate true, **0 findings**
    (`.ufo/waves/round-49/measure/c2-counter-green-at-data.json`).
  - Absolute-equivalence control: the r49 runner with an absolute `--scratch`
    → exit 0, counter-clean, no `paths-absolute-not-identity` finding
    (`controls/c2-v2-absolute-equivalence-receipt.json` + counter output in the
    same control family).
  - Selftests: `--path-selftest` → exit 0, 6/6
    (`measure/c2-path-selftest-at-freeze.json`); counter `--selftest` → exit 0,
    8/8 (`measure/c3-counter-selftest.json`; refusal fixtures: missing paths
    block, resolution-not-applied, nav-one-page, cross-schema r48 receipt,
    tampered shot, chrome relabel).
  - Cross-refusals: the r49 counter on the r44 chrome receipt → exit 1, **19
    findings** (`measure/c2-counter-crossrefusal-r44.json`); the r48 counter on
    the r49 receipt → exit 1, **4 findings** (schema, nonce-shape,
    profile-prefix, driver-pin; `measure/c2-r48counter-refuses-r49.json`).
- C3 (coverage — the residual exercised; measured at
  `36f8579bf2fbabd71d8a15142e1c9cf29e27bb02`):
  - Evidence: `git ls-tree -r --name-only <REV> --
    corpus/evidence/round49/webview2-nav | wc -l` → baseline 0 → **3**
    (receipt.json + receipt-page-a.png + receipt-page-b.png).
  - Live run: inline loopback HTTP fixture on ephemeral port 61114;
    `Page.navigate` to `/a.html`; cross-page via the page's OWN anchor
    (`document.getElementById('next').click()`); pages `a.html` → `b.html`
    (same origin, distinct URLs), titles "tabi-r49 nav fixture A/B", PNGs
    6,781 B / 7,002 B, invocation-bound nonce, `Edg/156.0.4314.50` at
    `/json/version`, teardown postKillSweepCount 0 (fixture server closed
    before teardown accounting).
  - Counter: same command with `--shot …page-b.png --shot-a …page-a.png` →
    exit 0, predicate true, **0 findings**
    (`.ufo/waves/round-49/measure/c3-counter-green-at-data.json`).
  - Residual supersession: `grep -c 'cross-page navigation were not exercised'
    corpus/knowledge/webview2-cdp-loopback-round-48.md` → 1 at baseline; the
    round-49 append names it superseded with the evidence pointer.
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'
  corpus/SOURCES.md` 159 → **160** (S160). Knowledge notes stay 65 (the r48
  note grew a dated append; no new note file — the round's coverage move is
  the nav surface + the capability row).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| instrument defect: block-scoped helper crashed the counter's paths checks | the first counter draft referenced `norm` outside its `else` block — ReferenceError at the first selftest run (the fixture harness refused to pass anything) | the counter's own 8-case fixture selftest, run BEFORE the freeze and before any data | `norm` hoisted to the paths-block scope; selftest re-run 8/8; nothing was measured with the broken bytes (the crash, not a wrong verdict, is the fail-closed shape) |
| instrument defect: port-blind loopback-origin check false-refused the live nav receipt | `new URL('http://127.0.0.1:57665/a.html').origin` is `http://127.0.0.1:57665` — the check compared against the port-less `http://127.0.0.1`, so the LIVE green receipt read `nav-origin-not-loopback` | the fixture selftest's `green-nav-live` case (expected [] vs got [nav-origin-not-loopback]) | origin compared with the port included; the check still refuses non-loopback hosts; selftest 8/8 re-run before the freeze |
| producer slip: the ledger summarizer was read instead of the artifact | after correction-cycle 1 the round's scratch summarizer printed `audit obs:` empty (it read `.obs` off summary STRINGS), which briefly looked like an empty audit generation | this session's own re-derivation habit (awk over the committed file vs the summarizer's print) | the audit was re-derived from the artifact (10 unchanged + 6 sibling-absent, correct); summaries are treated as prints, receipts as evidence — the same rule the r47 lesson pinned for disclosure numbers |
| test bug inside an instrument: a `--path-selftest` case asserted on the whole resolved path | the dotdot case checked `resolved.includes('a')` — true for the CWD's own letters — so the pre-fix selftest read 5/6 (a failing draft receipt existed for minutes) | the selftest's own red (exit 1) before the freeze | the case rewritten to assert on path SEGMENTS; the 6/6 receipt on the final driver bytes supersedes the draft; the driver's other five cases never changed |
| host-infra crash: the selfassessment gate died on `rmSync` EPERM cleaning its own temp sandbox (`tabi-selfassessment-LPQyTc`) — a Windows temp file-lock race, not a verdict | the crashed run's receipt kept at `measure/selfassessment-at-integration-crashed-eperm.txt` (node EPERM stack at gateTally, exit 1 with no SELFASSESSMENT line) | the receipt itself: a crashed checker must not be quoted as a mismatch verdict (its own contract reads an undeclared nonzero as could-not-evaluate) | re-run to completion (exit 1 verdict=failed mismatches=1 could_not_evaluate=179 superseded=23 — the same single m3 index-artifact class as r44-r48); both receipts committed, the crashed one named as crashed; no number in this lesson quotes the crashed run |

## Census

Start (2026-11-01, round open): `bash <fleet>/scripts/sources-census.sh
validate --root <fleet> tabi` → exit 0, `tabi ok`, 22 pre-existing W04
duplicate-URL warnings (the same set disclosed r47/r48); receipt
`.ufo/waves/round-49/measure/census-start.txt` (committed at the freeze).
End (round close): same command → exit 0 (receipt
`.ufo/waves/round-49/measure/census-end.txt`), W04 set unchanged at 22 —
S160's URL is new to the registry and lands INSIDE the Registry table (the
r48 E12 lesson applied pre-emptively: the row was inserted after S159 by
script, never appended at file end).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-01). Shokuknow
register not reachable from this host. Assimilation: none — shokuknow
unreachable.
