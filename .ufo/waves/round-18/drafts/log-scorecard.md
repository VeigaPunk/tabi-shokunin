# Round 18 scribe draft: LOG.md entry and SCORECARD.md `## Round 18`

Drafted by TabiR18.DraftLogScorecard (wave 1, scribe). L1 (TabiR18) integrates; L1 is the only
committer. `L1 FILL` marks a value that exists only after the round-18 measured revision lands. Nothing
here is an observed result. Sources: `.ufo/waves/round-18/PLAN.md`, `LOG.md` round-17 entry (lines
1007-1040), `SCORECARD.md:776-817`.

---

## LOG.md: append after the round-17 entry

## Round 18 — hyaku, 2026-10-20 (source recheck, harness hazards, routed calibration defects)

- Motivation: `.ufo/waves/round-18/PLAN.md` claims C1–C3 against the lowest non-retired tie
  (depth/operability/freshness/adjacency at 8). Round 18 is window position 1 after the round-17
  capability; no waiver used. Baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`.
- C1 freshness: source rows re-verified against live sources. Receipts
  `corpus/evidence/round-18/source-recheck/S###.json` + `S###.excerpt.txt`, produced only by
  `.ufo/waves/round-18/recheck-fetch.mjs`. Superseded at B and not rechecked: S004, S039, S047, S049,
  S050, S053 (successors S028, S040, S054, S055, S056, S057). Counter 0 → L1 FILL (target 51 =
  57 − 6). Drifted rows: L1 FILL; superseding SOURCES rows opened: L1 FILL.
- C2 operability: harness and witness hazards closed in code, new files only:
  `scripts/webmcp-invoke-round18.mjs` (round-17 harness stays byte-frozen as a counted input) and
  `scripts/freshness-witness.mjs`. H1 SIGTERM/SIGINT/SIGHUP → exit 2 `run_aborted`; H2 run temp tree
  removed on every exit path; H3 no `--remote-debugging-port` (CDP over Playwright pipe); H4 downloads
  refused and recorded (case `invoke-download-refused`); S1 one `--enable-features=` and at most one
  `--disable-features=`; F6 witness refuses `HEAD`/non-40-hex and resolves the lane tip. Counter 0 →
  L1 FILL (target 6); red on B, green on REV (`measure-c2.mjs`, probes h1–h4, s1, f6).
- C3 calibration: round-17 outside-check routed defects closed with committed receipts under
  `corpus/evidence/round-18/routed/`: D1 `corpus/lessons/round-18.md` `## Corrections` (sibling count
  6, not 7, citing `corpus/lessons/round-17.md:116`); D2 harm-set receipt at 93bfead; D3
  `check-adjacency.mjs --self-test` receipt; D4 SOURCES S058 `supersedes S057 —`; D5 seven harness
  reruns with full 64-hex digests. Counter 0 → L1 FILL (target 5).
- Sources 57 → L1 FILL (start A46/B4/C7; mined42/queued8/rejected7). Census validate: start `tabi ok`
  exit 0; end L1 FILL. Knowledge notes 34 → L1 FILL.
- No-harm gates (L1 FILL per gate): ROUND_CONTRACT; USER round contract; freshness `--worktree`;
  SOURCES gate; harm-baseline (20 entries); `check-adjacency.mjs --self-test`; census validate.
- Author verdicts: L1 FILL.
- Tools installed/updated: L1 FILL (wave-1 seats: see `.ufo/waves/round-18/w1/DraftLogScorecard.md`
  for this seat's record: none).

---

## SCORECARD.md: append after `## Round 17` (`### Planned / saturation / retired — round17`)

## Round 18 — hyaku, 2026-10-20

Baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured revision `L1 FILL`. C1 targets
freshness 8, C2 targets operability 8, C3 targets calibration 9 (already 9 at B; claims routed-defect
closure, no 10). Round 18 is position 1 of the window after the round-17 capability; no waiver used.

| Axis | Scalar before → after | Round18 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; no round-18 claim targets depth |
| coverage | 9→9 | unchanged; no round-18 claim targets coverage (C2 adds hazard closure, not a held entry) |
| operability | 8→L1 FILL | improved C2: harness/witness hazards closed 0→L1 FILL (target 6; H1–H4, S1, F6); 9 withheld: USER red unless L1 FILL, no outside execution |
| freshness | 8→L1 FILL | improved C1: source rows rechecked 0→L1 FILL (target 51); 6 superseded rows not rechecked; drift rows L1 FILL |
| calibration | 9→L1 FILL | improved C3: routed outside-check defects closed 0→L1 FILL (target 5; D1–D5); QUALITY lesson-backed L1 FILL |
| adjacency | 8→8 | unchanged; no round-18 claim targets adjacency |

| Claim | Before → after | Counting command | Measured revision / counter sha256 / evidence |
|---|---|---|---|
| C1 freshness | 0→L1 FILL (target 51) | `node .ufo/waves/round-18/measure-c1.mjs REV` (`c1_rows_rechecked`) | 2bff864 → L1 FILL; counter sha256 L1 FILL; receipts `corpus/evidence/round-18/source-recheck/` |
| C2 operability | 0→L1 FILL (target 6) | `node .ufo/waves/round-18/measure-c2.mjs REV` (`c2_hazards_closed`) | 2bff864 (red) → L1 FILL (green); counter sha256 L1 FILL; artifacts `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs` |
| C3 calibration | 0→L1 FILL (target 5) | `node .ufo/waves/round-18/measure-c3.mjs REV` (`c3_routed_closed`) | d2/d3 at 93bfead; d1/d4/d5 at REV; counter sha256 L1 FILL; receipts `corpus/evidence/round-18/routed/` |

Binding: `node scripts/check-measurement-binding.mjs --check <round-18 binding receipt> --at <landed tip>
--reproduce` → exit L1 FILL, `claims=3 bound=L1 FILL` (receipt path not fixed by PLAN.md; L1 FILL).

Sources 57→L1 FILL (A L1 FILL/B L1 FILL/C L1 FILL; mined L1 FILL/queued L1 FILL/rejected L1 FILL);
census validate exit 0 at start (`tabi ok`) and end L1 FILL; knowledge notes 34→L1 FILL.

### Capabilities — round 18

None earned at draft time. A capability enters this table only with a first-working receipt; L1 FILL
confirms. `scripts/webmcp-invoke-round18.mjs` is a hardened replacement harness, not a capability.

### Planned / saturation / retired — round18

- planned (round 19): operability 9 still needs USER green or an L0 out-of-scope ruling, a non-author
  gate run at the landed tip, and a new runnable rung; adjacency 9 needs kaidoku citing tabi on its CDP
  row, the musketeer lease ruling, and a non-author map-checker run; round-17 self-test cases for
  mutation survivors (no `--no-recurse`, status 128, env inheritance, per-call tip) are not claimed in
  round 18 and carry forward; round-17 harness debt (DevTools port, SIGTERM, downloads, merged feature
  switches) is claimed by C2, closed or not: L1 FILL.
- saturation L1 FILL / window L1 FILL (round 18 = position 1 after the round-17 capability).
- retired: L1 FILL (none expected; PLAN.md retires no axis).
