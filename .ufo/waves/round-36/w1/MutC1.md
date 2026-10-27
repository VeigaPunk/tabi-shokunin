# MutC1 — mutation test of the C1 counter (.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs)

Round: tabi 36 (attempt 1), wave w1. Seat: MutC1 (leaf; no subagents dispatched).
Tooling: no installs/upgrades needed — node v24.21.0 and git preinstalled; python3 used read-only for JSON inspection.

## Method

- Frozen counter copied to scratch (sha256 `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385`, equals frozenDigests). All mutations applied to scratch copies only; the lane byte stream was never written. Post-run re-hash of the lane counter: unchanged (`8a223faf…`).
- Fixture built exactly per baseline/controls.mjs: clone of the lane at `11c64b96f357de106c30a71c5e21ca44a3eacdc0` under the scratch root, the six round pre-data files copied in (drift ledger excluded), committed = CTRLBASE (`da7bb6de…`). Control commits on top of CTRLBASE (every git call named `-C <clone>`; toplevel asserted):
  - HONEST `67086094…` — honest derived ledger corpus/adjacency-screen-drift.tsv (304 unchanged / 3 moved :748,:784,:815; the c1-J5 floor).
  - J2 `…` — every drift row audited `unchanged` (c1-J2).
  - J3 `545d50e7…` — honest statuses but moved rows cite `verbatim at :1` (c1-J3).
  - J4 `6a6114e6…` — honest ledger + one junk corpus/adjacency-screen-delta.tsv row keyed at kama's frozen head (c1-J4).
  - STALECLAIM `927d3a8c…` — probe control: first honest row's status flipped `unchanged`→`stale` (a status lie; observed-stale cannot be fabricated honestly — delta heads and pins are verified against the real read-only fleet siblings, and at the frozen heads 0 rows are stale).
- Detector calibration: the pristine counter bytes reproduce the committed baseline receipts exactly — HONEST exit 0 predicate true; J2 exit 1 with 3× audit-status-mismatch; J3 exit 1 with 3× audit-moved-wrong-relocation (coverage 304, missing 3); J4 exit 1 with deltaScreenFindings=1; candidates 383, drift total 307, observed 304/3/0, delta pool 0. Baseline failure would have been inconclusive; none occurred.
- Run matrix (TMPDIR under the scratch root): pristine × {HONEST,J2,J3,J4,STALECLAIM}; m1,m2 × {HONEST,J2,J4}; m3 × {HONEST,J3}; m4 × {HONEST,STALECLAIM}; m5 × {HONEST,J4}; m6 × {HONEST,J2}; m6b × {HONEST,J2,J4}. Raw receipts: `evidence/*.json|stderr` in this seat dir.

## Mutant records

before-hash for every mutant = `8a223faf…` (frozen bytes); site and after-hash per mutant. "Killed" = the targeted detector reading flips vs pristine; junk readings must not flip.

| mutant | site (single-point edit) | after-hash | honest-floor flip? | junk-control flip? | verdict |
|---|---|---|---|---|---|
| m1 | predicate leg `out.drift.total >= 1` → `>= 9999` | `2befd7c6…` | **yes** — HONEST exit 0→1, predicate true→false, all other readings unchanged (cov 307/307, findings 0) | no — J2, J4 stay refused (exit 1, same findings as pristine) | killed by honest floor, as mandated |
| m2 | predicate leg `auditCoverage === out.drift.total` → `!==` | `1f859b2d…` | **yes** — HONEST exit 0→1, predicate true→false | no — J2, J4 stay refused with identical findings | killed by honest floor, as mandated |
| m3 | moved-relocation verification branch deleted (the whole `if (status === 'moved') {…}` note-check block in the audit-ledger pass) | `e4b3085c…` | no — HONEST stays true (relocation notes are correct; coverage leg untouched) | **yes** — J3 flips refused→admitted: exit 1→0, predicate false→true, findings 3→0, coverage 304→307 | killed by c1-J3, as mandated (wrong-relocation junk admitted) |
| m4 | `DRIFT_STATUSES = ['unchanged','moved','stale']` → `['unchanged','moved']` | `383d10a5…` | **no — survivor**: HONEST stays true (0 stale rows observed at the frozen heads); only reading change is `drift.observed` losing its `stale: 0` key | STALECLAIM probe: exit 1 (no crash — not could-not-evaluate); refusal class changes from `audit-status-mismatch` (pristine) to `audit-status-unknown` (m4); coverage 307→306 | survivor on the honest floor; stale claims still refused, degraded to the unknown-status class |
| m5 | predicate leg `&& deltaScreenFindings.length === 0` dropped | `a70f6058…` | no — HONEST stays true | **yes** — J4 flips refused→admitted: exit 1→0, predicate false→true; the JSON still reports `deltaScreenFindings: 1`, the predicate now ignores it | killed by c1-J4, as mandated |
| m6 | BG regex narrowed: first cut `webdriver\|selenium` → `selenium` | `5745aa9b…` | no — and **no reading moves at all**: candidates stays 383, all controls read byte-identical to pristine | no — J2 stays refused | **survivor (masked)** — see finding F2 |
| m6b | BG regex narrowed harder: `\|musketeer` dropped from BG | `59a662c4…` | reading flips as required — **candidate pool 383→353** (the 30 musketeer-exclusive lines); 30 screen-ledger rows become `screen-not-a-candidate` findings, yet HONEST predicate **stays true** (the 30 lines remain accounted via map rows; the frozen predicate gates completeness on `unaccounted == 0` and never on `completeness.screenFindings`) | no — J2, J4 stay refused | killed at reading level (pool shrink confirmed); no verdict flip — see finding F3 |

## Findings

- **F1 (m4 survivor — coverage gap, data-determined).** The `stale` audit vocabulary is undetectable this round: the honest derivation observes 0 stale rows at the frozen delta heads, and an observed-stale row cannot be fabricated without writing to a sibling repo (pins and heads are verified resolvable against the read-only fleet). Both pristine and m4 refuse a lying `stale` claim (exit 1, never exit 2); only the refusal *class* differs (`audit-status-mismatch` vs `audit-status-unknown`). A future round where a sibling edit removes cited text would discharge this leg.
- **F2 (m6 masking — regex redundancy).** Dropping `webdriver|` from BG changes no reading because `webdriver` matches 0 lines exclusively on this corpus. Measured exclusive-line counts per alternative: chromium 104, webbridge 88, cdp 81, burner-chrome 38, musketeer 30, playwright 16, remote-debugging 12, chrome devtools 3; webdriver, selenium, chromedriver, geckodriver, puppeteer, headless-*, devtools-protocol, chrome-devtools, browser-automation: 0. The meter's pool is robust to losing any zero-exclusive alternative — a calibration fact for wave-2 hand attacks that try to shrink the pool via single-word edits.
- **F3 (m6b — predicate blind spot, by design).** A genuine pool shrink (383→353) leaves the predicate true because the 30 affected screen rows' lines stay accounted via map rows and the predicate never gates on `completeness.screenFindings`. Screen-ledger validity findings only bite when they also leave a candidate unaccounted. Disclosed here as calibration data, not a defect claim.

## Restoration

Lane counter sha256 before = after = `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385`; no sibling repo, fleet-root file, or lane path outside the seat dir was touched; all fixture git calls named `-C <scratch clone>`. Scratch root `/fast/scratch/hyaku/tabi-r36/MutC1/` deleted after evidence was copied into this seat dir (`evidence/`).

VERDICT ok — all six assigned mutation probes recorded; m1, m2 killed by the honest floor, m3 killed by c1-J3 (junk admitted), m5 killed by c1-J4 (junk admitted), m6 pool-shrink confirmed via m6b (m6a masked by regex redundancy), m4 survives honestly (0 stale rows dischargeable this round; stale claims still refused, not crashed). No junk control was refused→admitted except on the exact leg each mutant targeted; the frozen counter's falsifiers fire where the claims file promised.
