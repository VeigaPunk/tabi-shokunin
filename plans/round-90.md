# Round 90 — plan and records

Base `a9f1da08nbr27d0a0d26cefcce319883ea03d6f3c` (lane clean; the round-89 verifier
spot-check commit). Two claims: C1 coverage (`chromium-showpicker-linux` generation r90 —
the settle-evaluate requirement on domread legs, the round-89 `Planned (r90)` line 1 and
the r89 spot-check §5 reject "The settle re-read is counter-verified" flip condition);
C2 calibration (the six round-89 spot-check routed defects D1–D6, §7).

Instruments are the round-89 family retargeted to `round90`, schema
`tabi-chrome-cdp-showpicker-r90`, predicate `C1-SHOWPICKER-R90`, with the driver and
counter changed only where the claims require:

1. The driver gains a distinct settle re-read expression `window.__inputs(true)` on the
   four domread legs (the settle mark, after `window.__state()`), recorded in the send
   log; the fixture's bit-setter branch sets the settle mark too, so the leg's own
   events still qualify and `lateAfterClose` stays 0.
2. The counter's `plan-calls` check requires that call — and requires its ABSENCE on
   every non-domread leg — so the `accept-domread-law` leg now binds a call the leg
   itself made, not data the driver merely carries. The battery gains one
   `plan-calls` case that strips the settle re-read call from a domread leg's send log
   and expects exactly `plan-calls`; the kill-power list gains two mutants that drop the
   domread settle-call requirement (the binding) and that widen the call to accept the
   bare `window.__inputs()` (the absence side); the counter's isolated `--selftest`
   gains a fixture case that passes `domRead` binding but not the call, and asserts it
   is refused with `plan-calls`.
3. The drift gate is retargeted to the round-90 scored instruments (statements:
   `scorecard-tallies` — the r89 selftest tally 11/11 is sanctioned like r87/r88's 10/10,
   and the seven swept deltas hold; `gate-selftest` — the four r90 instruments expose
   `--selftest`; `quality161-sweep` — QUALITY 161 cites `check-record-drift-round90`;
   `r90-defects` — the six §7 routed-defect statements: claim sweep, narrowing
   pointers, census+source attribution, leak enforcement, revision naming, report
   author date). The drift `--selftest` fixture is bounded to ONE tree deleted in
   process (QUALITY 162); the battery gains a `selftest-fixture-cleanup-dropped`
   case whose allowlist includes `gate-selftest` but not `plan-calls`, and the kill run
   kills the binding mutant (D4).
4. `driverUri`-blind targets (`r88`/`r89` names) are never edited; only the
   `round90` family is new. The r89 span's file bytes stay as landed for the drift's
   before-state record.

## C1 — `chromium-showpicker-linux` generation r90 (the settle-evaluate requirement)

Round 89 left one accept-law frontier open: "a settle-evaluate requirement on domread
legs (the counter's `plan-calls` would have to require the `window.__inputs()`
evaluate)" (r89 SCORECARD `Planned (r90)` line 1; the r89 spot-check §5 reject flip
condition: "A plan-calls requirement for the settle evaluate on domread legs"). Every
leg of every earlier generation carried the `domRead` data as a driver-recorded field;
no check required the call that produced it on the leg's own send log.

This generation requires it: each of the four domread legs' send log carries a
`Runtime.evaluate` of the distinct settle expression `window.__inputs(true)` immediately
after the settle `window.__state()` call, and the counter's `plan-calls` requires that
call on domread legs and forbids it on all other legs. `accept-domread-law` is
unchanged; C1's new measurement is the binding, not the token list.

## C2 — calibration, the six round-89 spot-check routed defects

The r89 spot-check routes (§7): (1) claim sweep — `claims.json` C2 `type` item (3) and
leg (c)'s `tapi-r89-driftfix-*` glob, plus `plans/round-89.md` §C2 item 3, are false of
the final instruments; (2) narrowing pointers — C1 `falsifies-wording` rows point at the
nonexistent `plans/round-89.md §Narrowings`, the report cites `§Narrowings` /
`§Frozen-amendment note` that do not exist; (3) census + source attribution — the
census end row count (223 → 224), the "S223/S219 re-opened in place" line is the round-88
re-opening, S224 Gate quote over 25 words and search-log paraphrase; (4) leak
enforcement — bind the drift fixture-tree cleanup or narrow the claim; (5) revision
naming — the drift after-run predates the cited revision; (6) report author date —
the report commit's author date predates the cited lane work. C2's counted work is the
six statements.

## Declared limits (pre-freeze)

- **C1 binds a call, not a browser fact.** The distinct settle expression is a lane
  convention: the counter binds its presence in the send log against a 1–4-field call
  shape; the browser's own token parsing is not measured.
- **The same 41 legs, the same laws, the same fixture.** Generation r90 adds no new
  surface beyond the settle-call binding; the prior set is the scored r89 receipt plus
  the two probe priors.
- **The drift gate counts six statements, not every sentence.** A green gate means
  those six match observed state.

## Frontier carried (not moved)

- A same-element origin comparison (an input reachable from both origins via a
  `postMessage` proxy) — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP
  file-chooser event) — needs a UI-side probe or a source-side reading.

## Freeze

Single freeze intent: freeze only after the battery, kill-power, selftest, drift and the
four isolated `--selftest` modes are green once on the exact bytes (the r89 rule).
Probes `tabi-r90-probe1-probe0001` / `tabi-r90-probe2-probe0002` are the prior set;
the scored receipt is produced once at the frozen nonce. Do-nothing controls:
`.ufo/waves/round-90-controls/c1/nowork-settle-stripped.json` (a probe clone with the four settle
calls removed → exit 1, `plan-calls` on all four domread legs) and
`.ufo/waves/round-90/controls/c1/nowork-r89-under-r90.json` (the r89 receipt under the r90 counter
→ exit 1, `schema` first); the C2 before control is the `round90` drift gate on a base
`a9f1da08` worktree (8 claims, 7 mismatches).

## Re-freeze history (instrument family)

- **D1 `e573334c78fa`**: first freeze (six instruments at their r90 content + two probe pins;
  `.ufo/waves/round-90/freeze.txt`). Pre-freeze preflight on the probe receipt (prior1, prior-set =
  prior2): counter clean 107, battery 225 cases / 0 failed / coverage 107/107, and both probes score
  clean against each other's prior-set. The scored receipt is produced once at the D1-derived nonce
  `tabi-r90-l1-e573334c78fa`; every later freeze touches only non-receipt instruments.
- **D2 `18d06a3f3895`** (post-scoring, one batched repair): the kill-power insertion that added
  `domread-settle-call-dropped` / `domread-settle-order-any` replaced a three-line range and
  silently deleted the two adjacent r89 entries `replay-limit-printed-drift` and
  `text-leg-law-skip`; the pre-freeze sweep reported `mutants 72` where 74 were intended, and both
  are restored. The battery bytes also changed before scoring (`forgery()` rewrote the prior's
  schema to `-r89`, which made the replay-timeline case carry a `schema` finding; it now copies the
  real receipt's schema) and the prior-set file is now lane-relative so the battery's mirror-lane
  cases resolve the declared prior inside the mirror. No predicate, threshold, prior, receipt or
  kill rule changed; the scored receipt is untouched.

## Wave corrections (post-wave; the frozen claims are not amended)

- **C1 axis (R90Critic F1.3, R90Review2 §6).** The declared axis `coverage` is not moved: the
  driver's only substantive change is one argument (`window.__inputs(true)`) that the fixture's
  `__inputs` discards (it takes no parameters), with identical payload, legs, check set and
  `checkCount 107`. The surface moved is a checker obligation. C1 is reported NOT VERIFIED on its
  declared axis; the claim is not re-written.
- **C1 wording (R90Review1 item 5).** The "forbids it on every other leg" limb is enforced by
  `send-log-allowlist` (D3), not by `plan-calls`; the frozen sentence attributes both to
  `plan-calls`. Recorded, not amended.
- **C2 counted set (R90Critic F2.1).** Five of the six §7 defects are counted; §7 defect 6 (report
  author date) is not lane-measurable and three self-checks stand in. The frozen `type` sentence
  overstates the set; the SCORECARD row and the lesson carry the narrowed statement.
- **Gate repairs after the wave (D4 `85c4191706b3`).** The critic measured four false-greens in the
  first gate: the backticked pointer form was invisible, the census statement read prose instead of
  `corpus/SOURCES.md`, the leak statement was a source-text grep, and the `--selftest` fixture could
  not fail on missing files. The gate now: matches the pointer with optional backticks and across
  the ledger (marked-historical lines excepted), reads the row count from `corpus/SOURCES.md`
  (`sourcesRows === 224`) and the correction's own word annotation, reads the dead-branch leak
  witness artifact against the frozen pin, fails closed on a missing scanned file, and requires the
  correction to name the plan artifact. Before/after re-measured at D4: 7 → 0.
- **Kill-power mutants (D3).** `settle-order-any`, `settle-want-dropped`, `settle-want-always`,
  `settle-allow-any`; a single-conjunct count mutant was dropped as unkillable (the ordered
  sequence covers the same refusal) and 76/76 kill on the D3 bytes.
- **D5 `172cd6f6dedb`** (post-wave, the simplifier's P0 set): `selftest-r90-gates.mjs` no longer
  derives the driver/nonce/fixture expectations from the receipt under test — it reads the committed
  `.ufo/waves/round-90/expectations.json` (so a zeroed-driver copy is refused instead of scoring
  clean), gains an `expectations-present` gate and pins the two probes in `FILES`; `kill-power`
  refuses an `--only` that names nothing and a non-positive `--jobs`; the counter's `teardown-closure`
  check guards `portProbes`/`postKillCurl` before reading them (a missing field is a finding, not a
  TypeError), and the unreachable `window.__inputs(true)` entry is dropped from the allowlist list
  (the dedicated rule at the allowlist covers it). The scored receipt is untouched; counter 107 and
  battery/kill re-measured on the D5 bytes.
- **D6 `de591e7a416b`** (post-wave, the sentinel's F13): the D5 runner declared the new
  `expectations-present` gate before `const gate` and crashed on every invocation
  (`ReferenceError: Cannot access 'gate' before initialization`); the gate call is moved after the
  declaration. The D5 drift statement `gate-selftest` is a source-text grep and stayed green through
  the crash (recorded as a residual tautology, R90Sentinel F8); the D6 selftest runs **12/12** and
  `pins-match-freeze` covers it. Counter, battery and kill power bytes are unchanged since D5.
