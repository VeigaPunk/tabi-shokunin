VERDICT: ISSUES

Attacked: r17 operability/adjacency scalar decision. Both counts reproduce; neither supports 8→9 at
M `6c97851`. Recommend six 0-deltas with "improved" verdicts; a raise would harm calibration.
Author-side review. Sandbox `/tmp/tabi-r17w2-CriticScalars-uheg` (clone at M, attached; removed). No installs.

## 1. Counts reproduced (sandbox clone, read-only on LANE)
- `node .ufo/waves/round-17/measure-c1.mjs 5859243…`: `c1_anchor_safe=0`.
  `… 6c97851…`: `c1_anchor_safe=4`, with `label_only=[round-contract-count-witness,
  user-contract-witness, user-contract-count-witness, user-contract-diagnostic-witness]`. Both exit 0.
- `node .ufo/waves/round-17/measure-c3.mjs <rev> --fleet-root /home/vgpnk/Projects/shokunin` → B 0,
  M 9 (ruled 1, refused-route 4, split-declared 2, contested-open 2; checker probe exit 0, verified 9).
  `check-adjacency.mjs --fleet …` → `verdict=clean rows=9 verified=9`, exit 0; selftest cases=51 clean.
- C2 (context only): `measure-c2.mjs` gives B `c2_invocation_held 0` and M `1` (cited S041–S048).
- SCORECARD/LOG/SKILL/QUALITY/PROVINCE/SHONEN byte-unchanged B→M (`git diff --stat` → only
  `corpus/README.md | 47 +`); no r17 scalar block exists yet, so this verdict is prospective for L1.

## 2. Operability 8→9: REJECT (BREAKS if asserted)
Both round-16 withholding reasons (SCORECARD.md:744 at M, "9 withheld (USER 6/10 red, no outside
execution)") still hold at M:
- **USER is still red.** `node scripts/check-user-round-contract.mjs` →
  `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`,
  exit 1. Fleet `.ufo/l0-questions.md` has no tabi line ruling USER out of scope (tabi lines are only
  :25, :34, :62). The r16 non-author closure agreed to the reject on exactly this basis
  (`corpus/lessons/round-16-verifier-spotcheck.md:119`, "USER 6/10 red").
- **No outside execution.** No non-author has run any r17 gate or counter. The only closure on record
  is round 16's (`round-16-verifier-spotcheck.md`). Every wave-1 and wave-2 seat is the lane, and
  dispatched subagents do not count (AXES.md:47-49).
- **The count is "anchor-safe", not "clean".** Counterexample: 2 of the 4 credited behavior entries are
  red gates at M (arm exits from the counter JSON at M):
  `user-contract-production {"a":1,"b":1,"b2":1,"c":1}` and
  `measurement-binding-round16-manifest {"a":1,"b":1,"b2":1,"c":1}`.
  - The second was green at B (`{"a":0,…}`). At M, the default `--at` lane tip reports
    `counted_input_changed`: C1 (`check-measurement-binding.mjs`, `selftest-…`) and C2
    (`README.md`, `SOURCES.md`).
  - This is drift-by-design, not a defect: the registry form `--at 1205d261…` is still
    `verdict=clean claims=2 bound=2`, exit 0, which I observed.
  - But production-clean gates at the lane tip went from 2/3 at B (round 0, user 1, binding 0) to
    1/3 at M. Nothing in C1 raises the axis signal "a checklist item … produces the stated outcome"
    (AXES.md:13).
- **It is a repair, not a new rung.** C1 re-anchors existing gates; it adds no new runnable artifact.
  This is the same class as r13 ("restoring compatibility is not two newly clean full gates") and r16
  (8→8). Kaika's 7→8 crossed a zero (no gate → gate) and was outside-admitted.
- **No threshold was pre-registered.** CriticLowestAxis A7 asked for the 9-threshold to be fixed
  before measuring. `drafts/scorecard.md:17` still reads "9 decided by L1 from the measured count",
  so any 9 chosen now is post hoc.

## 3. Adjacency 8→9: REJECT this round (BREAKS if asserted). Closest to eligible.
Steelman: C3 crosses a zero (B had no checked map; `measure-c3` B=0), and AXES.md:16 names exactly
this behavior. Counterexamples:
- **The AXES signal has two clauses: "Lane reports name contested scope; integrator arbitrates."
  Only 1 of 9 rows is arbitrated.** That row (`cdp-runtime-observation`) is one-sided. At kaidoku tip
  `b2aad08` (PROVINCE.md last touched in `da64646`), `PROVINCE.md:53` (Runtime observation (CDP)) has
  no tabi citation. `grep -i tabi` hits only `:142`, and that hit is the substring in "id-stability".
  Routed defect 5's kaidoku half (`round-16-verifier-spotcheck.md:152`) is open.
- **The 2 contested-open rows are self-filed but labeled external.** Their `ruling_ref` is
  `fleet@ebeb396…:.ufo/l0-questions.md:62`. `git log -1 ebeb396` gives author `tabi-shokunin`, subject
  "round-17: tabi L0 question (musketeer CDP lease …)". Yet `measure-c3` reports
  `ruling_authority:"external"` for both and counts them in `c3_adjacency_verified`. They are
  reported questions, not verified dispositions. This is the defect ConnAdjAxis §4.3 predicted.
- **The other 6 rows (4 refused-route, 2 split-declared) are tabi's own reading of sibling quotes.**
  They are verbatim-checked, but no sibling or integrator has agreed to the split.
- **No outside execution** of `check-adjacency.mjs` or `measure-c3.mjs`. Also, `PROVINCE.md` can carry
  no Adjacent section this round (census-frozen, PLAN amendments :201-204).
- **Re-derivability fragility, observed.** Run from a clone not named `tabi-shokunin`, `measure-c3`
  at M gives **8**: the ruled row fails `ruling_venue` because `ownToken` comes from
  `basename(laneRepo)` (`measure-c3.mjs:1100`, `:577`). It gives 9 only from a dir named
  `tabi-shokunin`. A verifier following the contract's `/tmp/…-XXXX` clone recipe gets a different
  count. This does not change the scalar, but it weakens "verified 9" as a reader-re-derivable number.

## 4. Lowest-axis rule and window
- The rule constrains claim choice, not scalar moves. C1 and C3 both sit on the 8-tie
  (depth/operability/freshness/adjacency), so it holds. If both axes stayed at 8 in r18, it still
  holds.
- If either axis moved to 9 now, the tie would shrink to depth/freshness. That would happen on a
  self-verdict that contradicts the non-author-endorsed r16 basis, so it is a calibration harm and not
  a free win.
- The permanent 8-tie (A7) is a real tradeoff for the operator or judge. Resolve it with
  pre-registered thresholds, not by raising post hoc.
- Window: if `webmcp-cdp-invocation` is admitted, it restarts the window (r18 = position 1). If it is
  not admitted, r18 = position 2. No waiver either way.

## 5. Recommended rows (exact)
| Axis | Scalar before → after | Round17 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged |
| coverage | 9→9 | improved C2: held WebMCP-invocation entry 0→1 (one build, flags, loopback); 10 withheld (r12/r13/r16 precedent; real-site and agent-side ground open) |
| operability | 8→8 | improved C1: jj-anchor-safe behavior entries 0→4 of 8 (4 label-only, uncredited; 2 credited entries carry red verdicts: USER 6/10, r16 binding drift at tip); 9 withheld (USER 6/10 red, no outside execution) |
| freshness | 8→8 | unchanged; S041–S048 opened this round, no existing claim re-verified; S049–S052 queued |
| calibration | 9→9 | unchanged; must not raise any axis above on a self-verdict |
| adjacency | 8→8 | improved C3: checked overlap map 0→9 rows (ruled 1, refused-route 4, split-declared 2, contested-open 2 tabi-filed and awaiting arbitration); 9 withheld (1/9 arbitrated and one-sided, kaidoku `PROVINCE.md:53` lacks a tabi cite; no outside execution) |

Claims-table wording: write C3 as "9 rows: 7 dispositions + 2 contested-open questions". Do not write
"9 verified".

Pre-register in the r17 planned block (fixes A7):
- **operability 9** only with all three: USER green, or ruled out of scope by the operator on an L0
  line; plus a non-author execution of the production gates at the delivered tip; plus a new runnable
  artifact, not a re-anchor.
- **adjacency 9** only with all three: kaidoku cites tabi on its CDP row (two-sided ruling); plus the
  musketeer lease moved contested-open → ruled by fleet/integrator; plus a non-author run of
  `check-adjacency.mjs`/`measure-c3.mjs` at the delivered tip.

## 6. Harm check (no axis harmed by the 0-delta block)
- At M: `check-round-contract.mjs` clean rounds=10 exit 0; `check-freshness.mjs --worktree` clean
  matched=34 exit 0; `check-sources.mjs` clean rows=53 findings=0; USER red as at B (no regression);
  r16 binding clean at its registered `--at 1205d26…`. A raise of either axis harms calibration
  (contradicts the r16 basis the non-author closure agreed to, `spotcheck.md:119`).

## Smallest safe corrections (fixable defects, not scalar)
1. `measure-c3.mjs`: count contested-open separately (`c3_adjacency_declared`). Label tabi-authored
   fleet lines `ruling_authority:"self-filed"`: check the `git log -1 --format=%an` of the cited fleet
   commit, already done for self venues at `:296-298`.
2. `measure-c3.mjs:1100`: derive `ownToken` from a constant/lane identity, not the clone dir basename.
   Add a counter probe that runs from a non-`tabi-shokunin` dir and expects the same count.
3. L1: land the §5 rows and the pre-registered thresholds. Never describe C1's 4 as "clean gates".

Files written:
- .ufo/waves/round-17/w2/CriticScalars.md
