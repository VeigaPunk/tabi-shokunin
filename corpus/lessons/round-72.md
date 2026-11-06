# tabi — round 72 (attempt 2)

Attempt 1 (watchdog `lane-dead-no-report tabi round=72`, 20:22:49) ended before any freeze. It
left uncommitted the r72 pinch driver, counter and battery, census start and the C1 controls
(six smoke runs, three degenerate runs). Attempt 2 re-verified and reused them: each smoke
receipt's `driverSha256` equals the driver file's sha256 (`d007adec…7877`); the counter re-run
on the five completed smokes is clean 5/5 (`.ufo/waves/round-72/controls/c1/smoke-counter-summary.json`);
smoke4 is a driver usage refusal (exit 2, `free-port precheck: port 41704 busy`, no receipt) and
is kept as such. Nothing was discarded.

Round 71 was rejected as an honest stop (MANIFEST; spot-check
`corpus/lessons/round-71-verifier-spotcheck.md`): C1 leg (b) red on one trailing zero-scale
wheel (R1). Rounds 69 and 70 were admitted. Fresh-start reading (Amendments 46/47): the r71
spot-check and the r62 closure's M5 survivor (producer-verdict AND→OR) were read before the
claim and carried as executed controls (`kill-power-r72.mjs`, 12 source-location semantic
mutants including M5).

Base `4e4ac0800abf5ad19d2a12caf46f80a873ebba8d`. Pre-freeze instruments and executed controls
`0217f780`; freeze `8356a09e` (`.ufo/waves/round-72/claims.json`); digests `7366d45c`
(`.ufo/waves/round-72/freeze.txt`). Axes at start: all six at 9. Saturation 8 / window 3;
capability `chromium-synth-tap-gesture-linux` entered at r70: no stagnation nudge.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
exit 0, 178 rows (`.ufo/waves/round-72/census/start.txt` by attempt 1; `start-a2.txt` re-run by
attempt 2, same result).

Claim: C1 coverage — re-claim of capability `chromium-synth-pinch-gesture-linux` on generation
r72 (sourced: S179, new this round). One claim only.

Outcome: **honest stop on leg (c).** (a) clean; (b) clean (R72Exec1); (c) battery exit 1 on the
scored receipt, case `in-wheel-anchor-2px`; kill power `holds:false` because the unmutated
battery already exits 1 (all 94 force-true and 12 semantic mutants killed). The capability stays
withheld; the frozen instruments are not amended.

## Gate

### Sources — new rows

- **S179** — `components/input/touchpad_pinch_event_queue.cc` at Chromium 155.0.8059.84, fetched
  by the L1 on 2026-11-06 20:27 -03:00 from
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/components/input/touchpad_pinch_event_queue.cc?format=TEXT`
  (HTTP 200, base64 decoded; 239 lines, sha256
  `4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73`; transport and decoded copy
  in `.ufo/waves/round-72/sources/`, `FETCH.txt`). `grep -c touchpad_pinch_event_queue
  corpus/SOURCES.md` was 0 before the append.
  - Located quote (line 44): "delta_y = 100.0f * log(pinch_event.data.pinch_update.scale);"
  - Located quote (lines 39–40): "Note that 'wheel' event deltaY values have their sign inverted. So to convert a wheel deltaY back to a scale use Math.exp(-deltaY/100)."
  - Row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-72 note
    and this lesson.
- Rejected source path: `content/browser/renderer_host/input/touchpad_pinch_event_queue.cc` at
  the same tag answered HTTP 404 (the file moved to `components/input/`); no row.
- No status, recheck or used-by cell of an existing row changed.

### Admitted

- `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md` (cites S179; S173–S178 by
  reference to the r71 note): the ctrl+wheel delta law. Sourced part: one pinch update → one
  ctrl+wheel with deltaY −100 ln(update scale), precise pixels (S179:39–44, 54, 58). Measured
  part: on the scored receipt Σ deltaY × page scale = −100 ln(scaleFactor) to four decimals on
  in/out/clamp/default; the raw Σ deltaY matches only at page scale 1. The page-scale division
  is marked inference.

### Rejected (with flip conditions)

- **"Σ deltaY over a pinch equals −100 ln(scaleFactor)"** (the naive reading of S179 alone).
  Reject at page scale ≠ 1: the scored `in` leg sums to −48.992, not −69.315. Flip: a host where
  the page scale stays 1 during the gesture (the clamp leg is that case and does match).
- **"Pinch ctrl+wheels land exactly at the anchor"** — reject: 12/17 `in` and 6/9 `default`
  wheels on the scored receipt sit 1 px off (400,300); the clamp leg at scale 1 is exact 16/16.
  Flip: a receipt where every zooming-leg wheel is at the anchor.
- **Capability row `chromium-synth-pinch-gesture-linux`** — withheld: leg (c) of the frozen
  predicate is false (`.ufo/waves/round-72/scored/c1-negatives-a.json`). Flip: a new frozen
  generation whose legs (a)–(d) all hold.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register correction L0,
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a repetition control covered the counter but not the battery, and a battery case's mutation was relative to an honest value that jitters | pre-freeze: counter run on 5 smoke receipts (5/5 clean) but the battery on smoke1 only (218/218). Post-freeze the battery fails `in-wheel-anchor-2px` on the scored receipt (`scored/c1-negatives-a.json`), on R72Exec1's receipt (`w1/R72Exec1/negatives-b.json`), and — measured after the fact — on pre-freeze smoke3 and smoke6 (`lesson-proof/battery-smoke3.json`, `battery-smoke6.json`; smoke2 and smoke5 pass). The case adds +2 px to the first `in` wheel; at 399 it lands at 401, inside the counter's ±1 tolerance, so the honest counter accepts it | none at the time: the r71 Mistakes row 3 fix ("repeat the live run") was applied to the counter leg only; no rule named the battery or kill-power legs | QUALITY 135: every receipt-reading predicate leg runs over every pre-freeze repetition receipt, and a relative battery mutation must cross its tolerance on each. Shown able to fail: applied to the r72 pre-freeze state it fails (battery exit 1 on smoke3 and smoke6). Next-generation case proposal: R72Exec2 (below) |
| the same honest-stop class as round 71 recurred one layer down | r71 stopped on leg (b) (counter vs one run); r72 on leg (c) (battery vs the scored run). Both are "one clean pre-freeze sample read as a stable shape" | the r71 lesson named the class for the producer only | QUALITY 135 states the class over every receipt-reading leg, not per instrument |

## Round-71 routed defects (R1–R5)

- R1 (counter assumes every event ends inside its leg): closed in the r72 generation — the
  driver closes the record synchronously (`__closeRecord`, `lateAfterClose`), the counter binds
  each event to its leg mark window (`event-leg-window`, `leg-marks`); R72Exec1's cold run is
  clean. The r72 battery names cases for R71Review1 F1–F4 and R71Mut1 m09–m14, m36–m37, m42
  and section 6 (the 8 must-accept cases); whether all 15 R71Review1 false greens and all 24
  R71Mut1 killing cases are covered was not measured this round.
- R2 (verifier hand-off, execPath, NODE_COMPILE_CACHE, harness summary binding): not claimed this
  round; routed on.
- R3 (S173/S174 scope vs pinch lines): see R72Scout below.
- R4 (5 missing gate-registry rows; results status): routed on.
- R5 (evidence leg binds bytes not provenance; R70Review1 FG1–FG16): routed on.
