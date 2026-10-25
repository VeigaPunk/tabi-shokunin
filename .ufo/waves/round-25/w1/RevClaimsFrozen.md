# RevClaimsFrozen — round-25 frozen claims vs fleet claim-sizing rules (§9)

Seat: reviewer, wave 1, tabi round 25. Read-only. Godspeed axes for this review: (1) rule
coverage — every §9 rule checked against each claim; (2) evidence — every finding carries a
command or a path:line; (3) separation — observation, inference, and unknown kept apart.

Inputs:
- the frozen claims, `.ufo/waves/round-25/claims.json`, committed in `c8ef308`;
- the rules, `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-25.md` §6 item 9
  ("Claim sizing"), lines 367–389, plus §2 lines 9–40 and AXES.md lines 25–40;
- the baseline, `9e13666759bcf30665abec84dec13adefc1fa86a`.

No tools were installed or updated.

## Verdict summary

Both claims are on the right axes. They are on distinct axes, each can be verified without the
other landing, and the lowest-axis tie at 8 is honest. Both claims still violate §9 in ways that
matter for admission:

- **C1 (depth)** violates three rules:
  - **Control before data:** the counter did not exist at freeze, and the control was never
    scored.
  - **A do-nothing or skip-work control cannot reach the target:** a hand-written receipt
    reaches it.
  - **Same predicate in plan, counter, and receipt:** the plan names `Page.goBack`, a CDP
    command that does not exist in the pinned protocol.

  It partly violates two more: **before measured at baseline** and **one concrete
  after-state**.
- **C2 (freshness)** violates the same three rules:
  - **Control before data**, for the same reason as C1.
  - **Skip-work cannot reach the target:** as frozen, the quote location is self-reported.
  - **Same predicate:** the plan implies a network fetch at measure time, while the prototype
    counter reads committed bytes that the plan never requires.

  It also violates **one concrete after-state re-derivable over committed bytes** and partly
  violates **before measured at baseline**.

| §9 rule | C1 | C2 |
|---|---|---|
| One concrete after-state, re-derivable by one command over committed bytes | **partial** (F7, F2) | **violated** (F4, F5) |
| No universal clauses unless the counter enumerates the full set | pass | pass |
| ≥1 claim on the lowest non-retired axis | pass (depth 8) | pass (freshness 8) |
| A calibration claim counts mismatches | n/a (not calibration) | n/a |
| Target unreachable by a do-nothing or skip-work control | **violated** (F2) | **violated** (F4) |
| Predicate identical in plan, counter, and receipt | **violated** (F3; counter absent, F1) | **violated** (F4, F5; counter absent, F1) |
| Before measured at baseline | **partial** (F6) | **partial** (F6) |
| Control built, scored with the frozen counter, and receipt committed before freezing | **violated** (F1, F8) | **violated** (F1) |
| Axis named by the surface changed, not the number produced | contestable (F9) | pass |
| Distinct axes, causally separable | pass (see below) | pass |

## Findings by severity

### High

**F1 — C1 and C2: no frozen counter existed at freeze, and no control was scored before
data.** (Violates: control built, scored with the frozen counter, and committed before
freezing; predicate identical in counter.)

- Observed: neither counter is present at the baseline or at the freeze commit.
  - Command:
    `git ls-tree -r --name-only 9e13666… -- scripts | grep -E 'bfcache|reopen'`
  - Command:
    `git ls-tree -r --name-only HEAD -- scripts | grep -E 'bfcache|reopen'`
  - Both print nothing. HEAD = `c8ef308`.
- Observed: `claims.json` places the scoring after the freeze: "Both scored before claim data
  in wave 1".
- Observed: the wave-1 spec builds the counters as prototypes in scratch:
  - items `ExecCounterC1Proto`, `ExecCounterC2Proto`;
  - `ExecControlScore` scores the controls "against the prototype counters".
- Observed: the control fixtures exist; `c8ef308` adds `control/fake-receipt-bfcache.json`
  and `control/skipwork-freshness.json`. So "control built" holds, but "score it with the
  frozen counter, and commit that receipt" did not happen before freezing.
- Consequence: the only frozen predicate is prose. Whatever the counters become in wave 1 is a
  rule set after freezing. §9 says a rule changed after any seat has scored is not the claim's
  rule, and that applies to every clause the prototypes add (F3, F4).
- Fix: before any claim data is scored, freeze one counter version per claim:
  1. land the counter at a named path and record its blob sha;
  2. score both controls with that exact blob;
  3. commit the receipt;
  4. record the step as a `revisions[]` entry in `claims.json`.

  Round 24 used the same pattern ("frozen before either instrument existed", SCORECARD.md at
  the baseline, `:1211`). That precedent does not satisfy the rule as written.

**F2 — C1: a skip-work forgery reaches the target, and the committed control is a straw
man.** (Violates: target unreachable by a do-nothing or skip-work control.)

- Observed: the committed control `control/fake-receipt-bfcache.json` has `"events": []`. It
  is the weakest possible forgery, and any counter that requires a non-empty array rejects it.
- Observed (sibling seat, not re-run by me): `w1/ExecCounterC1Proto.md:11` reports "The
  synthetic valid receipt is **clean** (exit 0, restores=1)". `:19` describes that receipt,
  `scratch/ExecCounterC1Proto/synthetic-valid-receipt.json`, as "hand-crafted, not observed".
- Observed: the prototype's digest is computed from the receipt itself:
  `digest === "sha256:" + hex(sha256(JSON.stringify(events)))`, at
  `scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs:9,48,91`.
- Inference: the cheapest skip-work control is a fabricated, self-consistent receipt, and it
  meets restores ≥ 1 with valid=true.
  - A counter over committed bytes cannot tell an observed CDP event from an authored one.
  - The plan also never requires committing the probe, so the closure has nothing to re-run.
- Fix:
  - Make the cheapest control the fabricated self-consistent receipt, score it, and state
    honestly that the counter checks consistency only.
  - Require the probe script to be committed at a named path.
  - Add a closure step that re-runs the probe and re-observes at least one
    `BackForwardCacheRestore`.

  Otherwise the target as frozen is reachable without doing the work.

**F3 — C1: the plan names a CDP command that does not exist in the pinned protocol.**
(Violates: predicate identical in plan, counter, and receipt.)

- Observed: the plan says "navigates fixture A -> B -> A via CDP Page.goBack". The pinned Page
  domain has no `goBack` command.
  - The committed copy matches S105's sha256, `e944a3b1…`. Command:
    `git show 9e13666…:corpus/evidence/round-24/sources/page.pdl | sha256sum`.
  - Command: `… | grep -c goBack` returns `0`.
  - The history commands are `getNavigationHistory` (`:850`), `resetNavigationHistory`
    (`:858`), and `navigateToHistoryEntry(entryId)` (`:913`).
- Consequences:
  - The plan sentence cannot be executed as written.
  - The receipt field `action:"goBack"` is a step label, and the prototype checks that label,
    not the CDP method used (`w1/ExecCounterC1Proto.md:41`). The plan's method and the
    counter's condition are therefore different predicates.
  - Any harness choice (`navigateToHistoryEntry`, or `Runtime.evaluate` of `history.back()`)
    is a substitution made after freezing.
- Fix:
  - Record a pre-scoring `revisions[]` entry naming the actual history-step mechanism.
  - Make the receipt carry the CDP method and `entryId` the probe sent.
  - Have the counter check that method, not a label.

**F4 — C2: as frozen, the target is reachable by self-report, and the committed control is a
straw man.** (Violates: skip-work control cannot reach the target; predicate identical in
plan, counter, and receipt.)

- Observed: the frozen text says what a resolved row "must carry": "this round's fetch digest
  and either a located held quote or a pointer". It never requires committing the fetched
  bytes.
  - Seat scratch is gitignored: `.gitignore:5` `.ufo/waves/*/scratch/`; confirmed with
    `git check-ignore -v`.
  - So bytes saved only to scratch are not committed.
- Observed: the committed control uses the literal string `"fetchDigest": "legacy-2026-10-19"`,
  not a 64-hex digest. A regular-expression check rejects it without testing whether the
  counter can detect stale bytes.
- Inference: under the frozen text, the cheapest skip-work receipt is six rows, each with
  `quote_located:true`, `fetched_at` 2026-10-25, and any 64-hex digest. That reaches
  reopened=6 and unresolved=0.
- Observed: the prototype closes this hole by requiring committed raw bytes under
  `corpus/evidence/round-25/freshness/` that are new since the baseline. It re-hashes them and
  re-locates the quote (`check-source-reopen-receipt.mjs:13,72,98-107`). That is a clause
  absent from the frozen predicate (see F1).
- Fix:
  - Revise the frozen predicate before scoring: committed raw bytes per row, the digest equal to
    the committed bytes, and the quote re-located by the counter.
  - Replace the control with a self-consistent forgery made from real but stale bytes.

### Medium

**F5 — C2: the after-state is not one concrete value, and the kill rule implies a network
dependency.** (Violates: one concrete after-state re-derivable over committed bytes.)

- Observed: the frozen kill rule says "A row whose fetch fails at measure time … is
  could-not-evaluate … if more than one row is could-not-evaluate at the tip, the target misses
  honestly".
  - "At measure time" implies the counter fetches. Its result would then depend on the network
    and the date, so it is not re-derivable over committed bytes.
  - The tolerance allows one could-not-evaluate row while the target still reads "reopened=6,
    unresolved=0".
- Observed: the prototype encodes the tolerance:
  `met = reopened === 6 && unresolved === 0 && could_not_evaluate <= 1`, at `:142`.
- Inference: the target can be met with 5 resolved rows. The after-state is really
  "resolved ≥ 5", not 6.
- Fix: freeze the after-state as `resolved=6, unresolved=0, could_not_evaluate=0`, or state
  `resolved≥5` explicitly. Also delete "at measure time" in favour of a fetch status recorded
  in the committed receipt.

**F6 — C1 and C2: "before: 0" was not measured with the counting command, and it contradicts
C1's own kill rule.** (Partially violates: before measured at baseline.)

- Observed: the C1 kill rule says "A receipt missing at the measured revision is
  could-not-evaluate, never 0". At the baseline the receipt is absent:
  `git ls-tree -r --name-only 9e13666… -- corpus/evidence/round-25 | wc -l` returns `0`.
- So the counter's own baseline value is could-not-evaluate, not 0. The C1 prototype agrees:
  "counter reports could-not-evaluate (exit 2) at baseline" (`w1/ExecCounterC1Proto.md:13`).
- C2 has the same shape: "no receipt at baseline". The C2 prototype throws
  `receipt_absent … could-not-evaluate, never 0` (`:68`).
- The `ls-tree` measurement is real, but it is a different command from `countingCommand`.
- Fix: record the before value as "could-not-evaluate (receipt absent; ls-tree empty)", and
  run each frozen counter with `--rev 9e13666…` once it exists.

**F7 — C1: the after-state is a threshold.** (Partially violates: one concrete value.)

- `"after": "restores >= 1, valid=true"` is a predicate, not a single value.
- This is acceptable only if the counter field and threshold are pinned in code identical to
  the plan, which cannot be checked yet (F1). Severity is low on its own; it is listed here
  because it compounds F2.

**F8 — C1: the second declared control, a do-nothing run, was never built.** (Violates:
control built before data.)

- Observed: the C1 control text declares two controls. One is "a do-nothing run (no history
  step) must yield restores=0".
- `ls .ufo/waves/round-25/control` shows only `fake-receipt-bfcache.json` and
  `skipwork-freshness.json`. No no-history receipt or run exists at freeze.

**F9 — C1: the axis label is contestable.** (Rule: name the axis by the surface changed.)

- Observed:
  - The claim type is "frontier-entry runtime admission".
  - The surface it moves is a frontier row (`corpus/README.md:582` under
    `## Frontier — round 24` at `:578`): "docs-held, runtime open".
  - §9 lists "frontier → core" as a coverage surface.
- Inference: depth is defensible. The claim resolves U1 of
  `navigation-history-bfcache-evidence.md` (`:79-80`) with a measured observation, which is
  AXES "verifiable technical detail". Coverage is equally fitting.
- The lowest-axis obligation does not depend on this label: C2 (freshness 8) meets it alone.
  So C1 being depth is not needed to satisfy that rule. The report should say which surface
  justifies depth rather than coverage, so the label is not chosen by the number.

**F10 — C2 prototype risk (not the frozen claim): an unchanged page can be wrongly marked
stale.**

- Observed: `:96` flags a row `digest_is_legacy_2026-10-19` when
  `row.sha256 === held.digest`, with the held digest taken from
  `corpus/lessons/kaika-fleet-round-1.md` (`:15,55`).
- Inference: a genuinely fresh fetch of a byte-identical page would be marked unresolved. The
  fetch date cannot be read from a hash.
- If wave 1 carries this into the landed counter, it adds a predicate clause the plan never
  froze (F1). It should be decided in a pre-scoring revision.

### Low

**F11 — C1 cites U1 for a statement U1 does not make.**

- The claim says "round-24 entry U1 documents no committed probe performs a history step at
  all".
- U1 (`navigation-history-bfcache-evidence.md:79-80` at the baseline) says only "No restore has
  been observed on this host … unmeasured".
- The "no committed probe performs a history step at all" wording is in `corpus/README.md:582`.
  The entry's header (`:10-14`) gives the related `--disable-back-forward-cache` history.
- The substance holds; the citation should point to README:582.

**F12 — A universal clause in `notClaimed` conflicts with C2.**

- "no real-site interaction" sits beside C2's six external HTTP GETs to playwright.dev and
  webmachinelearning.github.io (`w1-spec.json` item `ScoutFreshnessReopen`).
- These are read-only GETs, the lane's third-party read-only class. The wording should say
  "no real-site interaction beyond the six read-only GETs C2 names".

## Distinct axes and causal separability

Both pass.

- **Distinct axes:** C1 is `depth` and C2 is `freshness` (`claims.json`, `claims[].axis`).
- **Separate receipts:** the prototype constants are disjoint:
  - C1 reads `corpus/evidence/round-25/bfcache/receipt.json`
    (`check-bfcache-receipt.mjs:20`);
  - C2 reads `corpus/evidence/round-25/freshness/reopened.json`
    (`check-source-reopen-receipt.mjs:12`).
- **Separate source rows:** C2's set is `DECLARED = [S013,S015,S016,S020,S023,S024]` (`:11`).
  C1's sourcing rows are S104, S105, and S106, which C2 does not count.
- **Separate verification:** neither counter reads the other's receipt, so each is verifiable
  without the other landing.
- **Residual coupling (registry, not verification):** C1 reserves S106, and C2's superseding
  rows are specified as "S107+" (`w1-spec.json`, item `ExecFreshnessReceipt`).
  - If S106 never lands, C2's rows leave an id gap.
  - If C2 appends first and takes S106, C1's citation dangles.
  - Ids must be allocated by document at append time, in a fixed order.

## Lowest-axis tie (depth/freshness at 8): honest

- Observed: SCORECARD.md at the baseline, round-24 header (`:1212`), reads "depth 8, coverage 9,
  operability 8, freshness 8, calibration 9, adjacency 8".
- The round-24 disposition kept every scalar unchanged:
  - C1 operability 8→8;
  - C2 calibration 9→9;
  - C3 coverage 9→9;
  - the row "depth, freshness, calibration(score), adjacency | unchanged".
- So the round-25 start values in `claims.json` are 8/9/8/8/9/8, and the tie at 8 among depth,
  operability, freshness, and adjacency is accurate.
- Stagnation nudge:
  - SCORECARD at the baseline records `:1214-1215` "Saturation 8 / window 3 retained; the
    stagnation nudge is inactive".
  - Capability rows record "First-working round: 24" for both round-24 gates.
  - AXES.md `:68-70` waives the lowest-axis rule only when no capability entered within the
    window. A round-24 capability is inside the window for round 25, so the nudge is inactive.
- No axis is retired: SCORECARD at the baseline, `:1117` and `:129`.

Freeze timing is clean:
- the freeze commit `c8ef308` is at 2026-10-25 09:14:55 −03;
- the earliest seat scratch, `scratch/ScoutOpenS106`, is at 09:15:24 −03;
- `git show c8ef308:.ufo/waves/round-25/claims.json | cmp - claims.json` shows no change, and
  `revisions` is `[]`.

## Residual risk

- [INFERENCE] Headless Chromium on this host may never emit `BackForwardCacheRestore` for a CDP
  history navigation. Without a frozen fallback, an honest miss is the expected outcome, which
  is fine. The risk is a substituted mechanism after scoring (F3).
- Once wave-1 seats score with the prototypes, any frozen-counter clause that differs from them
  is a post-scoring rule change (F1). The window to issue `revisions[]` is now.
- The S106 / S107+ id ordering (above).

## Verification gaps

- I did not run either prototype counter. The F2 "hand-crafted receipt is clean" result is a
  sibling report (`w1/ExecCounterC1Proto.md:11,19`), cited, not reproduced.
- I did not check whether the six C2 rows still hold their quotes. That is outside this seat
  and covered by `ScoutFreshnessReopen` / `CritC2Vacuity`.
- No browser was launched; the F3 claim rests on the pinned PDL bytes alone, not a live
  `/json/protocol` from the host binary.
- The `skill://godspeed` text was not resolvable from this seat's tools; the directive bytes in
  the assignment were followed.
