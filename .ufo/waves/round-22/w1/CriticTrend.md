# CriticTrend — round22 W1 (TabiR22.CriticTrend)

Scope: trend-level attack on the round22 design, covering expansion, quality and discernment.
This is a read-only critique. I ran no tests, builds, oracles or counters. I ran no browser,
network or REA work, installed nothing, and edited no production files. The private clones
`.ufo/waves/round-22/clones/{BuildOracle,BuildSelftest,BuildDebt}` were still at baseline
`5f58577` with a clean status when I read them. So the design examined here is the declared
design, not built bytes:

- assignment text: `.ufo/waves/round-22/w1-spec.json` `context` and items;
- working-tree `SCORECARD.md:1043-1056` (uncommitted);
- working-tree `LOG.md:1496-1519` (uncommitted);
- `.ufo/waves/round-22/baseline.json`.

## Axes named

| Trend (LEARNING.md:31-35) | Round22 required verdict | Observable that decides it |
|---|---|---|
| expansion | unchanged (held ground) | No new SOURCES row, no new canonical admission, no frontier move, no capability row |
| quality | improved, bounded | The existing corrected entry gains a durable, revision-bound semantic recheck that a coherent all-silent or wrong-outcome set fails. Nothing old fails its recheck. |
| discernment | unchanged unless a non-author agrees | Admit/reject agreement must come from outside the lane (LEARNING.md:42-47). No TabiR22.* seat counts. |

Evidence I observed at baseline `5f585773…`:

- `git ls-tree` finds 40 knowledge `.md` files and 101 SOURCES `S###` rows.
- The old counter `.ufo/waves/round-21/measure-c1.mjs` has sha256 `8d99242316c3…fdf5eb`. This matches `round21-closure.json` `c1_remeasurement`.
- The retained receipt `corpus/evidence/round-21/runtime/receipt.json` contains:
  - one finite pending case, `na-pending`, with `after.responses: []`;
  - five Completed cases: `na-click`, `na-requestsubmit`, `na-native-submit`, `na-delayed` and `auto-positive`;
  - two Canceled cases: `na-reset` and `na-remove`;
  - four Error cases: `na-reject`, `na-throw`, `na-invalid-submit` and `auto-invalid`.
- These classes match the contract's category list exactly.
- `na-native-submit` has `output:[{"dummy":"landing"}]`, `submits:null` and 1 navigation.
- `auto-*` cases have `preAction.responseCount: 1` and `formActive: false`. Every `na-*` case has 0 and true.

## F1 — expansion: the new note raises the raw knowledge count while the ground is already held

**Counterexample.** The planned file `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` is a new `.md` under `corpus/knowledge/`.

- `.ufo/waves/round-20/counts.mjs` counts every such file (`ls-tree … corpus/knowledge/ | endsWith('.md')`), so `knowledge` goes 40→41.
- LEARNING.md:33 defines `expansion: improved` as "net new admitted entries on ground the coverage map did not hold".
- The ground is already held:
  - `corpus/README.md:466-496` (round21 block) already maps non-autosubmit runtime ground to `webmcp-nonautosubmit-round-21-corrected.md`;
  - `round21-closure.json` `trend_basis` already credited that expansion.
- If anything reads 41 as an admission, round21's frontier is counted twice. The things that could do this are a report, the lesson Gate, a README row framed as new ground, or a closure judge. This is a duplicate-authority / false-growth risk.

**Precedent supporting unchanged.** Round20 went knowledge37→38 on held ground while the author recorded `expansion unchanged` (SCORECARD.md:961, :968). Round21 recorded 38→40 as "not two admissions" (SCORECARD.md round21 curation paragraph).

**Falsifier.** Expansion is falsified by any of the following at the integrated revision:

- the report, lesson or SCORECARD says expansion improved;
- the 40→41 change is reported as an admission;
- `counts.mjs` rows ≠ 101, or tiers ≠ A88/B4/C9, or mined ≠ 73;
- any new `S###` row is added;
- a README `## Frontier` status moves an item from frontier to held, using the oracle as the basis. The items still open are listed at README.md:485-488: late settlement, repeated-run determinism, other builds, real sites, and absent activation;
- a capability row enters SCORECARD.md:383-385, which is still `— none yet —`.

**Acceptance boundary.** The round passes on expansion only if all of these hold:

- the knowledge count delta is exactly +1 and is labelled a re-verification/oracle note on held ground;
- the only SOURCES change, if any, is appending the new note to S101's mutable used-by cell;
- README gets an append-only correction/index row, not a new-ground row;
- expansion is recorded as `unchanged`.

**Impacted axes.** Expansion (false improvement) and coverage/adjacency (must stay 9/8).

**Smallest safe correction.** Add one sentence in the new note, the README append and the report: "knowledge 40→41 is an oracle/recheck note on round21-held ground; no admission, no frontier move."

## F2 — quality: the improvement is real only against the structural/silent class, and only if the expectations are pinned

**Counterexample.** QUALITY.md:263-268 (criterion 55) and LOG.md:1502-1503 set the bar: the old counter's silent structural positive is not an outcome oracle. The new oracle reads `corpus/evidence/round-22/semantic-expectations.json`, which is a mutable file in the same tree.

- Someone doing a coherent rewrite would mutate raw and summary, then relink the evidence digests, the receipt sha and `runtime-execution-finalized.json`.
- In the same commit they can also edit the expectations.
- Unless something outside that commit pins the expectations, the oracle is just as rewritable as the old counter's digest chain.
- In that case the "quality improved" claim reduces to "a second copy of the same bytes agrees with the first".

Independence has a second weak point. The fixed expectations will be transcribed from the same acquisition by lane authors. The author-side witness `.ufo/waves/round-21/final/semantic-contrast-witness.json` ("author-side, not independent closure") is the same kind of derivation. The non-author semantic remeasurement already happened in `round21-closure.json` `semantic_remeasurement`. So round22 adds mechanization and durability, not new truth.

**Falsifier.** Quality is falsified by any of the following:

- The final oracle at the integrated revision returns 12 for a coherent all-silent set, or for a coherent set with one wrong status class, when digests are relinked. That is the BuildSelftest mutation class.
- The oracle's expectations sha is not fixed inside `measure-c1.mjs`, or the expectations are not committed and digest-cited before measurement. Either way, the 12 is only self-consistency.
- The oracle imports or calls the round21 counter as its outcome source.
- The old counter's sha differs from `8d99242316c3…`, or the old counter's recheck at final is not clean 12. The second case means an admitted entry fails its own recheck, which is quality harmed per LEARNING.md:34.
- The bytes of `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` change. For example, someone repoints its `recheck:` line to the round22 oracle. That file is a counted input of the frozen counter (`NOTE` in `INPUT_PATHS`) and is immutable history.

**Acceptance boundary.** Quality counts as `improved` only with this wording: "the existing corrected entry gained a durable, revision-bound, finite semantic recheck over the same retained acquisition". The following must also hold:

- baseline returns 0 with exit 0;
- final returns 12, clean, exit 0;
- semantic mutations fail with the named `semantic_*` findings, not with incidental hash findings;
- the frozen counter is unchanged and still clean.

The claim must not include:

- authentication;
- independent verification;
- source-to-binary equivalence;
- new observations;
- repeated-run determinism.

Depth credit is checker strength on the same 12 observations, not 12 + 12.

**Impacted axes.** Depth (C1), quality, and calibration (overclaim risk).

**Smallest safe correction.**

1. Hardcode the per-case outcome class (pending/Completed/Canceled/Error) and the expectations-file sha256 in `measure-c1.mjs`. This matches the existing `PRODUCER_SHA` idiom.
2. Record the oracle sha in SCORECARD, as round21 did for its counter.

With that in place, editing the expectations requires an oracle-digest change that review can see.

## F3 — discernment: no in-lane seat or closure-derived debt counts as outside agreement

**Counterexample.** There are two failure paths.

The first is citing W1/W2 seats as a spot-check. This includes `Semantic01-12`, `Critic*`, `Attack*` and a seat named like `ReviewOutside` (as in round21 W2). LEARNING.md:45-46 says "A subagent the lane dispatched is still the lane." `corpus/lessons/round-21.md:62-64` already applied that rule correctly.

The second is subtler: using the W1 wake-history and W2 chronology debt as a "disagreement that becomes a lesson", which LEARNING.md:35 credits as discernment improved.

- The round21 closure's `outside_spotcheck` has two items, and both are `agree`.
- The debt is listed under `wave_conformance_debt`, which is report-completeness debt, not a gate admit/reject disagreement.
- So the disagreement→criterion route is not available from that evidence.
- A new QUALITY criterion added without a round22 lesson row behind it would be discernment harmed (LEARNING.md:35).

**Falsifier.** Discernment is falsified by any of the following:

- the round22 lesson Gate, report or SCORECARD records `discernment: improved`, or any agree/disagree, sourced from a TabiR22.* identity or from L1;
- the W1/W2 debt correction is framed as a resolved outside disagreement;
- a QUALITY criterion 56+ appears without a `corpus/lessons/round-22.md` citation;
- the debt classifier output, from `.ufo/waves/round-22/check-review-chronology.mjs`, is presented as `final-reviewed`, as authenticated settlement, or as complete event history. The contract forbids all three.

**Acceptance boundary.** The author records `discernment: unchanged pending outside agreement`. Only a parent/non-author closure may change it, with at least one admit and one reject sampled. Debt is recorded append-only as `review_scope_gap` or an equivalent class, with no relabelling of earlier W2 reviews as reviews of the finalized bytes.

**Impacted axes.** Discernment and calibration.

**Smallest safe correction.** Copy round21's lesson sentence verbatim into the round22 Gate: "No non-author admit/reject agreement is asserted. Every dispatched reviewer remains this lane's author-side verification."

## F4 — trend tradeoff, not a defect: a fresh-metric depth treadmill under an open stagnation nudge

**Evidence.**

C1 has been a depth claim with a fresh metric reset to 0 for four consecutive rounds, and the scalar stayed 8→8 each time:

| Round | Metric | Move | Source |
|---|---|---|---|
| r19 | `c1_validation_decisions` | 0→27 | SCORECARD.md:882 |
| r20 | `c1_lifecycle_decisions` | 0→12 | :950 |
| r21 | `c1_lifecycle_observations` | 0→12 | :1002 |
| r22 | `c1_semantically_checked_lifecycle_rows` | 0→12 | :1046 |

Rounds r21 and r22 cover the same 12 cases.

- All six axes are at or above saturation line 8 (coverage9, operability8, freshness8, calibration9, adjacency8, depth8).
- SCORECARD.md:385 has never had a capability row.
- So AXES.md:68-72's stagnation-nudge condition appears to hold [INFERENCE: window3 is evaluated against "no capability ever"].
- Under the nudge, "the round should be a frontier/capability move". LEARNING.md:86-87 also says to choose claims from the trend furthest behind. Quality has improved every round from r16 to r21 (`MANIFEST.json` tabi rounds). Expansion was unchanged in r18 and r20 and will be unchanged in r22.

**Classification.** This is a planner tradeoff that L1 owns, permitted because "should" and a waiver are not mandatory. It is not a defect that the canonical judge must reject. It is legitimate debt repayment: QUALITY55 and the round21 closure debt explicitly motivate it.

There is one fixable risk. Each fresh-0 metric makes "C1 improved" structurally guaranteed. That invites premature saturation of depth at 8 by accumulation of narratives, without the scalar ever being re-argued.

**Falsifier.** Any of the following falsifies the claim:

- the report sums r21 and r22 rows;
- the report treats r22 as evidence toward a depth scalar promotion;
- the report claims "no stagnation waiver needed" without stating that the nudge condition holds.

**Acceptance boundary.** The report states three things:

- why the lowest-axis move was chosen over the open nudge, which is to repay QUALITY55 and closure debt;
- that r22's 12 are the same r21 observations re-checked;
- that the next frontier candidates stay unclaimed. These are SCORECARD.md:1032-1034: browser-observation failure cleanup and the absent-user-activation contrast.

**Impacted axes.** Expansion (by stall) and the integrity of the depth scalar.

**Smallest safe correction.** Add one LOG/report sentence that acknowledges the nudge condition and the same-population re-check.

## Summary acceptance boundary for round22 trends

| Trend | Accept iff | Reject iff |
|---|---|---|
| expansion | `unchanged`; knowledge +1 labelled oracle note; rows/tiers/mined unchanged; no new S-row, frontier move or capability | Any expansion credit, or 41 read as an admission |
| quality | `improved` bounded to a durable semantic recheck of the same 12; baseline0 → clean12; semantic mutations fail with named findings; frozen counter `8d99242316c3…` unchanged and clean; corrected note bytes unchanged | Coherent silent/wrong-class relinked set scores 12; expectations unpinned; old entry fails its recheck; history rewritten |
| discernment | `unchanged pending outside agreement` | Any self-certified or in-lane agreement; debt relabelled as disagreement or settlement; criterion without a lesson |

## Record

- Tools installed or updated: none.
- Verification exercised (read-only):
  - `git ls-tree`/`git show` counts at HEAD: knowledge 40, rows 101;
  - `sha256sum` of the round21 counter;
  - Python read of the receipt summaries;
  - reads of the listed files.
- Main should run after integration:
  - `node .ufo/waves/round-22/measure-c1.mjs <baseline>` and `<final>`;
  - `node .ufo/waves/round-21/measure-c1.mjs <final>`;
  - `node .ufo/waves/round-20/counts.mjs <baseline>` and `<final>`;
  - the round22 selftest;
  - a byte diff of `.ufo/waves/round-21/**`, `corpus/lessons/round-2[01].md` and the two round21 notes, comparing baseline to final.
