# Review07 — C2 claim fit review (round 28, w1)

Seat: Review07, item 47. Scope: C2 (calibration) claim fit against the actual LOG correction
matcher and the known false-clear; specify red/green controls. Frozen claims:
`.ufo/waves/round-28/claims.json` (C2 on line 12). Baseline/tip: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`
(HEAD == baseline; `git rev-parse HEAD` observed). Read-only lane; scratch none needed.
No LSP server answers in this session (no `lsp` device mounted) — verification was by direct
source reads plus executing the declared gates, not grep-as-proof.

## Verified before-state (observation, at tip = baseline, tracked files clean)

- `node scripts/check-selfassessment.mjs --rev HEAD --json` → exit 1; `mismatches: 1`;
  `counted` = one `m3-unlanded-paths` (observed 40 live porcelain paths — concurrent-agent
  scratch noise, NOT committed state); `superseded: 10`; and the finding
  `{class m1-selftest-tally, doc LOG.md, line 221, script check-freshness.mjs, claimed 8,
  observed 12, superseded: true}` — the known false-clear, reproduced.
- Oracle: `node scripts/check-freshness.mjs --self-test` → `cases=12`, exit 0 (so LOG.md:221
  claimed 8 is genuinely stale).
- `node scripts/check-selfassessment.mjs --selftest` → `cases=17 passed=17`, exit 0.
- LOG.md is byte-identical to round-27 (`git log ef8aa4a..HEAD -- LOG.md` → 0 commits), so the
  frozen `:221` line number still holds at tip: line 221 reads `FRESHNESS_SELFTEST verdict=clean
  cases=8` (observed via `read LOG.md:219-224`).
- Prior evidence citation checks out: `corpus/lessons/round-27-verifier-spotcheck.md:15` records
  exactly this false-clear (mismatches=0, superseded=10, LOG.md:221 claimed 8 observed 12
  superseded=true) and :46-47 prescribes this repair with unrelated-citation regression coverage.

## Defect mechanism (source, `scripts/check-selfassessment.mjs`)

- `paragraphs()` (:256-265) splits LOG text on blank lines only; the m1 LOG supersession loop
  (:333-348) clears an earlier stale tally when a later paragraph (a) names the same script,
  (b) matches `/supersed|correct/i`, (c) matches `/:\d+/.test(text)`, and (d) states the
  oracle-correct number. Clause (c) accepts ANY colon-number token — it never compares the
  cited number to `f.line`. That is the whole defect; the C2 declared repair ("only clears the
  exact stale tally it cites") maps 1:1 onto it.
- Concrete false-clear path at tip: the correction-bullets paragraph (LOG.md:1903-1928) names
  `scripts/check-freshness.mjs`, carries "Correction (supersedes …)", contains colon tokens
  `:335 :391 :1090 :1103 :1863` (none is 221), and states `cases: 12` — all four loose
  clauses true → LOG.md:221 superseded=true. The round-27 disclosure itself calls this out
  ("accepts any colon-number token as the cited superseded line", LOG.md:1929-1930).
- Same defect class exists in the SCORECARD window: `m1Findings` supersession (:235-244) also
  ends in `/:\d+/.test(g.lineText)` with no line comparison (line-granular, not paragraph).

## C2 claim-fit findings (by severity)

1. HIGH (metric hazard, repairable within claim): the runtime target "self-assessment mismatch
   count at tip is nonzero" is not discriminating. `mismatches` counts m1+m2+m3; today's dirty
   tree already yields mismatches=1 purely from m3 porcelain noise (observed above), so the
   do-nothing control worded as "count nonzero" can spuriously fail, and a dirty after-tree can
   pass without any m1 fix. The control must be pinned to JSON detail, not the integer:
   do-nothing ⇒ `findings[]` contains {doc LOG.md, line 221} with `superseded: true` and
   `counted` has no m1 entry for it; repaired ⇒ `counted` contains {m1-selftest-tally, LOG.md,
   221, claimed 8, observed 12} and `superseded` drops 10→9. Measure the after-state on a clean
   tree (or assert on `counted` detail) or the claim's counter is gameable by tree state.
2. MEDIUM (repair-shape trap, kill-rule interaction): a naive exact-line fix (`:221` token
   anywhere in paragraph) can still be re-cleared by prose that QUOTES the line. Sweep result:
   the only `:221` token in LOG.md is at :1931 (the falsification-disclosure paragraph), and
   that paragraph names no `scripts/*.mjs`, so `namesScript` keeps it inert today (observation).
   The repair must therefore KEEP the namesScript requirement and anchor the citation on both
   sides — e.g. `new RegExp(":" + f.line + "(?!\\d)")` plus a non-digit/left-boundary guard —
   so `:60` cannot clear `:6` and `:2210` cannot clear `:221`. Kill rule forbids touching LOG
   prose; the analysis above shows the target IS reachable matcher-only (no paragraph after 221
   both names check-freshness.mjs and cites :221), so no prose change is needed.
3. MEDIUM (scope ambiguity): the frozen declared text says "m1 supersession" generically, but
   the same loose `/:\d+/` lives in both windows (LOG :333-348, SCORECARD :235-244). A LOG-only
   repair satisfies the pinned kill rule (only LOG.md:221 is pinned) but leaves the identical
   attack open in SCORECARD (e.g. a later line citing `:1234` could clear an unrelated stale
   tally). Either repair both windows or record the LOG-only scope explicitly in the report;
   silently half-repairing is the failure mode to avoid.
4. LOW (doc rot): the script header pins "17 isolated cases"; adding red/green cases makes the
   comment, the `CASES` table, and the printed `cases=NN` drift apart. Update the header in the
   same change.
5. INFO (positive control already exists): baseline selftest case `m1-log-stale-then-corrected`
   is the green exact-citation control (its correction cites `LOG.md:6`, the tally's own line)
   and `m1-log-wrong-number-correction` already pins "exact cite + wrong number ⇒ no clear".
   C2's "selftest contains both … cases" is therefore satisfied by RETAINING these green plus
   adding the missing red; the regression risk is breaking the existing green, not its absence.

## Red/green control specification (selftest fixtures, `logDoc` shape)

Green (retained, must stay exit 0 after repair):
- G1 `m1-log-stale-then-corrected` (exists): stale `12/12` at :6; correction "supersedes
  LOG.md:6", same script, states oracle 13 ⇒ cleared, exit 0.
- G2 (optional explicit mirror of R1): identical to G1 but the citation appears mid-prose
  (`…which supersedes the figure at LOG.md:6 above…`) ⇒ still cleared. Pins that position and
  backticks do not matter, only exactness.

Red (new, required by C2; all must stay exit 1 with class m1-selftest-tally and
`superseded: false` in finding detail):
- R1 unrelated-citation (the named red, mirrors the real :221 attack): stale `12/12` at :6;
  later paragraph names the same script, carries "Correction (supersedes LOG.md:5):",
  states oracle 13, cites a DIFFERENT existing line (:5) ⇒ NOT cleared.
- R2 prefix/suffix boundary: same paragraph but cites `:60` (and/or `:6x` where x digit) ⇒ NOT
  cleared — pins the `(?!\\d)`/boundary behavior so the fix cannot be a substring match.
- R3 (retained) `m1-log-wrong-number-correction`: cites :6 exactly but states 12 ⇒ NOT cleared —
  pins that exact-cite alone is insufficient.
- R4 (cheap, recommended): the disclosure-quote shape — later paragraph contains the literal
  token `LOG.md:6` and the word "superseded" but names NO `scripts/*.mjs` ⇒ NOT cleared — pins
  the namesScript guard that finding 2 depends on.

Runtime controls (outside selftest, per claim control/killRule):
- Do-nothing control at tip: unchanged gate ⇒ findings[LOG.md:221].superseded === true
  (verified today, observation); selftest 17/17 green.
- After repair on a clean tree: counted == exactly one m1 finding {LOG.md, 221, 8 vs 12};
  exit 1; `superseded` == 9.
- Predicted tip delta (falsifiable acceptance, mutation-free): ONLY the LOG.md:221 finding
  flips. The other nine currently-superseded findings each already have exact-line citations in
  their superseders (LOG :335/:391/:1090/:1103 via bullets at :1904-1923; :1664 via
  "supersedes LOG.md:1664" at :1853; SCORECARD :410 via :1192, :1138/:1139/:1151 via :1193) —
  verified by reading those lines — so a repair that flips any OTHER finding to unsuperseded
  has over-tightened and violates no-harm.

## Residual risk and verification gaps

- Tree state: the 40-path m3 count is live working-tree noise from concurrent agents; all
  before-state numbers above are otherwise committed-state (tracked files clean vs HEAD).
- The SCORECARD window has no dedicated unrelated-citation red case today; if scope stays
  LOG-only (finding 3), that gap remains open and untested.
- Mechanical convention is syntactic: a future paragraph that names check-freshness.mjs, cites
  `:221`, states 12, and contains "supersed|correct" WILL clear — including a disclosure-style
  note. Accepted by the frozen convention; noted so a future "false-clear" is not re-read as a
  matcher regression.
- No LSP available; semantic claims above rest on direct execution of the gates plus line-level
  reads, not on grep-only inference.

## Tooling

No installs or updates performed (RULES.md directive recorded; pacman paused, untouched).
No builds/linters/formatters run; only the lane's declared read-only gate invocations and git
read commands listed above.

Report: .ufo/waves/round-28/w1/Review07.md
