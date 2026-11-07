FINDINGS

# R75Revenger — fresh-start audit: does round 75 repeat a rejected or routed root failure?

Seat R75Revenger (leaf; no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD
`061b10d0` (wave w1 in flight; legs (b) and (d) open at dispatch), base `c19a520f`, freeze
`b1ddabc5`, digests D `57f28cf1`. Every measurement below is read-only over committed bytes or a
copy in `/fast/scratch/hyaku/tabi-r75/R75Revenger/` (deleted before yield; receipts copied to this
directory). No lane, fleet, sibling or production file was written.

**Answer: yes — one routed root failure is repeated in the r75 generation, and one is only
partly closed.** The r74 routed defect 2 tolerance clause (F4/F5) is reproduced and is
misclassified in the lesson as "IME-counter cases". Every other root failure on the list is
closed, absent, or declared carried.

## 1. Executions (not just reads)

| # | command | exit | result |
|---|---|---|---|
| E1 | `node scripts/check-dragdrop-r75.mjs --receipt corpus/evidence/round75/chromium-drag-intercept/receipt.json --expect-driver-sha256 d604552e… --expect-nonce tabi-r75-l1-57f28cf128e6 <16 PRE --prior> --json` | 0 | `verdict clean`, `checkCount 146`, `findings []`, `priorSet` 16 rows, `maxAbs 0`, `maxGap 0.25` (`counter-a.rerun.json`) |
| E2 | r75 battery vs mutant `TOL = 0.05 → 0.045` (r74 F5 weakening 1) | 0 | `allOk true`, `passed 254/254`, `failed []`, `coverageGap []` (`mutant-tol-0.045.battery.json`) |
| E3 | r75 battery vs mutant grid `<= 1e-4 → <= 0.02` (r74 F5 weakening 2) | 0 | `allOk true`, `passed 254/254`, `failed []` (`mutant-grid-0.02.battery.json`) |
| E4 | zero-gap honest-shaped receipt (`drop-dz[2].at := drop-dz[3].at`) through the pinned counter | 0 | `verdict clean`, `findings []` (`f4-zero-gap.counter.json`) |
| E5 | the same receipt through the pinned battery | 1 | `allOk false`, `failed ["event-time-quantum-at"]`; case ids `["event-time-quantum","event-leg-window"]`, extra `["event-leg-window"]` (`f4-zero-gap.battery.json`) |

E2/E3 are exactly the two weakenings the r74 closure routed ("add the tolerance weakenings F4/F5
as battery cases", r74 spotcheck §5 item 2; R74Review2 F5 measured both surviving). Both still
survive r75, and neither is in the r75 semantic set: `kill-power-r75.mjs:52` mutates
`TOL = 0.05 → 1e-9`; `:56` mutates `<= 1e-4 → <= 1`. So "kill power holds" (40/40 semantic) is
silent about the two weakenings that matter, exactly F5's finding.

E4/E5 reproduce F4's pattern: `negatives-dragdrop-r75.mjs:109`
(`evsOf(r,'drop-dz')[2].at += 0.03`) has no `alsoAllowed` and no pre-asserted gap, so an
honest-shaped receipt with a zero gap at that position is counter-clean yet turns the battery red.
Measured margins on the 10 committed receipts (9 smokes + scored): gap `drop-dz[2]→[3]` is
0.3–2.2 ms, i.e. a 10× margin, not the 23× r74 measured; the minimum gap elsewhere in the same
leg is 0.0 ms on 5 of 9 smokes (`python3` over `controls/c1/smoke*.receipt.json`).

## 2. Root-failure determinations

| # | root failure (round) | r75 determination | evidence |
|---|---|---|---|
| 1 | K7 no-regression conjunct reading live sibling state (r60) | **not repeated (absent)** | `claims.json:34` predicate is (a)–(d) only, no regression conjunct; no K7 string in the r75 wave except the assignment text (`build-spec.py:69`); instruments read only receipt/priors/driver (`grep -nE 'fleet\|sibling\|Projects/shokunin' scripts/check-dragdrop-r75.mjs scripts/chrome-cdp-dragdrop-round75.mjs scripts/negatives-dragdrop-r75.mjs .ufo/waves/round-75/controls/c1/kill-power-r75.mjs` → no match). The one live read, `fixture-hash` (`check-dragdrop-r75.mjs:45,163`), is pinned by digest and fails closed. |
| 2 | frozen header rejected by the instrument's own rule (r61) | **not repeated** | no frozen TSV/snapshot exists; the frozen inputs are the 16 PRE receipts, pin and nonce, and the counter accepts them (E1 exit 0, 146 checks); independent schema enumeration at `d71951a7` returns 25 files, 16 with top-level receipt schema, `diff` against `prior-set.txt` empty (exit 0) |
| 3 | post-scoring recorder/interface changes (r61) | **closed** | 7/7 `freeze.txt` digests equal at HEAD (`git show HEAD:<path> \| sha256sum` per file); `git log 57f28cf1..HEAD -- <7 instruments>` → empty (exit 0); `git diff --stat b1ddabc5 57f28cf1 -- <7 instruments>` → empty; D adds only `freeze.txt`; receipt `startedAt 2026-11-07T05:47:54Z` = 10 s after D's `02:47:44-03:00` |
| 4 | M5 producer-verdict `&&`→`\|\|` survivor (r62) | **closed** | `kill-power-r75.mjs:41` names `M5-producer-verdict-and-to-or`; scored `semantic {mutants:40,killed:40}`, `crashed []` (`scored/c1-kill-power-a.json`); 10 polarity cases at `negatives-dragdrop-r75.mjs:164-167`, scored `producer-verdict-false-CONFIRMED` and `-true-REFUTED` both `ok` |
| 5 | contradictory duplicate / fabricated dispositions (r62) | **not repeated (surface absent)** | no disposition ledger in this generation; internal contradiction is caught by `legshape-consistency` (`check-dragdrop-r75.mjs:313`), per-leg seq, `leg-order`, `leg-marks`, `seq-monotonic`, send-log `c.id === i+1`; fabrication is a declared limit (`claims.json` `limit`). Residual: duplicate JSON keys (`JSON.parse` last-wins) are untested. |
| 6 | r71 leg-b relabel leak (event past its leg) | **closed** | `event-leg-domain` (`:198`), `event-leg-window` (`:213`, upper bound + non-decreasing order), `lateAfterClose === 0` (`:210`); battery `event-leg-domain`, `event-leg-window-late-label`, `event-leg-window-order` all `ok` (scored 254/254) |
| 7 | r72 relative battery case (mutation inside tolerance) | **partly repeated** | the sub-quantum bug was caught pre-freeze (lesson Mistakes row 2; `replay-timeline-sub-quantum` now un-rounded, `negatives:191`), but `event-time-quantum-at` (`negatives:109`) is still calibrated to the honest gap — E4/E5 reproduce the false red. F4's suggested fix (add `event-leg-window` to `alsoAllowed`, or assert the gap) is not applied. |
| 8 | r72 replay hole (replayed / nonce-rewritten receipt satisfies legs a/b) | **closed** | `controls-summary.json`: `replay-zeroedit-smoke1` exit 1 (`nonce-expected` + 3 replay ids), `-own-nonce` exit 1 (3 replay ids), `replay-forged-nonce-stamps` exit 1, `-fixture` exit 1, `replay-probe-p1-relabel` exit 1; `limit-nonuniform-retime` exit 0 is the declared limit |
| 9 | r73 prior-set limit (current-generation only) | **closed** | `prior-set.txt` 16 entries; independent enumeration diff empty (exit 0); counter output records `priorSet` (E1); no earlier drag generation exists (`git grep -l 'tabi-chrome-cdp-dragdrop' c19a520f -- '*.json'` → 0), so the cross-generation set is empty by construction, as `claims.json` `priorSet` states |
| 10 | r73 1e-12 timeline escape | **closed** | multiset comparison with 0.05 ms tolerance (`:175-184`); `replay-forged-1e-12` exit 1 `replay-event-timeline`; battery `replay-timeline-1e-12` `ok` exit 1 |
| 11 | r74 probe receipts outside PRE | **closed** | `p1`–`p4` are in `prior-set.txt` and passed as `--prior` (E1); `replay-probe-p1-relabel` exit 1 `replay-event-timeline` |
| 12 | r74 count-change near-match escape | **closed** | multiset (order- and count-free, `:176-184`); battery `replay-timeline-prior-has-extra-event` and `-prior-missing-event` both `ok`, exit 1 `replay-event-timeline` |
| 13 | r74 crash-as-kill | **closed** | `kill-power-r75.mjs:115` scores `killed` only on exit 1 + parsable summary + non-empty `failed`, else `crashed`; `:130` `holds` requires the unmutated battery exit 0 `survived` and every mutant killed; scored `crashed []` |
| 14a | r74 routed 1 — prior set by schema + near-match survives insert/delete | **closed** | rows 9 and 12 above |
| 14b | r74 routed 2 — crash-as-kill, laundered receipts, F4/F5 | **crash-as-kill closed; laundered closed; F4/F5 OPEN** | `negatives:36` usage exit 2 unless exactly the three degenerate kinds; E2/E3/E4/E5 |
| 14c | r74 routed 3 — fold the 19 R74Mut1 acceptance witnesses | **open, declared carried** | `corpus/lessons/round-75.md:23` and `claims.json:8` item 3 say carried. Count of witnessed aspects with an r75 case: 2–3 of 19 (typed conjuncts partly, `drag-call-params` later-call, window order). Not covered: host-chromium version suffix, devtools url port, `elapsedMs` absent, `ts/at > 0`, 1e-2 quantum, marks monotonic slack, non-integer `lateAfterClose`, window lower bound, duplicate `Browser.getVersion`, duplicate `setDeviceMetricsOverride`, `postKillCurl.devtools`, `portProbes.fixture`, `failures` non-array (`grep -n` over `negatives-dragdrop-r75.mjs`). |
| 14d | r74 routed 4 — counter output records prior set | **closed** | `priorSet` in every output (E1; `check-dragdrop-r75.mjs:318`) |

## 3. Calibration — self-assessment vs observed repo state

Counted mismatches: **2 substantive, 0 in SHONEN, 0 in the numeric counts.**

1. **MISMATCH — `corpus/lessons/round-75.md:21`:** "The tolerance-weakening cases F4/F5 are
   IME-counter cases and are carried with item 3." False for F5: the r75 counter carries the same
   `TOL = 0.05` (`check-dragdrop-r75.mjs:175`) and the same `1e-4` grid (`:185`), and the two r74
   weakenings survive the r75 battery (E2, E3, both exit 0). F4's case pattern is also reproduced
   in r75 (`negatives:109`; E4/E5). The sentence understates an open routed defect as an
   IME-only carry.
2. **MISMATCH — `claims.json:8`** item 2 lists only "kill power scores a crashed battery as
   crashed" and "the battery refuses to run without its three laundered receipts"; the F4/F5
   clause of the same routed defect is dropped from the claim's own account (the lesson mentions
   it, misclassified).
3. Consistent (no mismatch): `axesAtStart` all six 9 matches the lane's record from r70 on
   (`SCORECARD.md` r70–r74 sections, "Axes at start: all six at 9"); no `## Round 75` block exists
   (`grep -n '^## Round 75' SCORECARD.md` exit 1), which is correct for an in-flight round.
4. SHONEN: 4 boxes, all `[~]`, no `[x]`; 6/6 pointer targets resolve (`SKILL.md:697`,
   `SKILL.md:1598-1617`, `corpus/knowledge/multi-step-journey.md` §1/§2/§7, `LOG.md` round-3,
   `corpus/knowledge/executor-test-sufficiency.md` §0/§4, `PROVINCE.md:3-19`,
   `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt`). 0 mismatches.
5. Counts re-measured and matching: SOURCES rows 195 (base) → 200 (HEAD), matching S196–S200
   (`grep -cE '^\| S[0-9]{3} '`); knowledge 88 files, 1 citing the drag commands (the new note);
   capability row 0 at both revs (leg (d) open, correct); prefreeze 9/9 `allOk`; timeline proof
   156 pairs, `maxAbs 0`, `maxGap 0.25`, `honestPairsRefused 0`, `ownGapCounts` all 8,
   `firstChosenGapThreshold 0.5`, histogram `{0:120,1:32,2:4}` — all equal to
   `claims.json` `replayThresholdEvidence` and the lesson.

## 4. What this means for the round

- The claim's legs (a) and (c) as dispatched still hold on re-measurement (E1; scored kill power
  186/186, `crashed []`), and the freeze discipline is clean (row 3).
- The instrument's discriminating power is **not** better than r74's on the routed tolerance
  clause: two named weakenings pass the full battery and are absent from the semantic set. A
  kill-power run that included them would report `survives` and `holds: false`.
- The lesson's own record is otherwise accurate (mistakes rows 1–4 each cite a committed failing
  state; the four pre-freeze survivors it names are all in the frozen semantic set).

## 5. Confidence

High for E1–E5 (executed, receipts committed beside this report) and for the digest/prior-set
checks (plain commands, exit codes above). Medium for the "absent" determinations (rows 1, 2, 5):
they rest on grep over the frozen instruments and the claims text, which is checkable but is
absence rather than execution. The r74Mut1 aspect count in 14c is a manual mapping of 19 witnesses
to r75 cases; the direction (most not folded) is robust, the exact count is ±1.

## Receipts

- `counter-a.rerun.json` — E1
- `mutant-tol-0.045.battery.json` — E2
- `mutant-grid-0.02.battery.json` — E3
- `f4-zero-gap.counter.json`, `f4-zero-gap.battery.json`, `f4-zero-gap.receipt.json` — E4/E5
