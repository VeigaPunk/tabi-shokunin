# L1Tabi24.RevClaimSizing — claim sizing review (round 24, attempt 1)

Scope: review the three frozen claims in `.ufo/waves/round-24/claims.json` (authoritative)
against the fleet claim-sizing rules in `.ufo/prompts/tabi-round-24.md` §9. Baseline rev
`573c99e4885382db38babc3a6fc90e77afeb42a6`. Lane state at review time (read-only):
`jj-lane.sh state` → `local=573c99e… ahead=0 behind=0`, `tracked=5 untracked=89`;
`git log --all -- .ufo/waves/round-24/` → empty (no commit contains round-24 bytes; claims,
wave spec, skip-control scratch are uncommitted). Every number below carries the command that
produced it.

## §9 rules and per-claim disposition

### Rule 1 — concrete after-state, one command over committed bytes
- **C1** ✓ after=0 via `node scripts/check-gate-registry.mjs --rev <REV> --json`
  (`nonconformant`). Minor: the before is a placeholder ("N … measured by the shipped gate"),
  not a concrete value in the frozen claim.
- **C2** ⚠ after=0 via `node scripts/check-selfassessment.mjs --rev <REV> --json`, but the
  m3 class measures the *working tree* (`git status --porcelain`), not committed bytes: a
  fresh checkout/closure at the same rev always yields m3=0, so the after-state is not
  re-derivable over committed bytes alone.
- **C3** ✓ after=1; the frozen command at baseline reproduces the before:
  `git grep -lE '^source: S10[45] ' 573c99e… -- corpus/knowledge | wc -l` → 0.

### Rule 2 — no universal clauses unless the command enumerates the full set
- **C1** ✗. "for every gate in the lane's gate-script set" is universal, and no enumerating
  mechanism is pinned. Baseline `SKILL.md` contains **0** mentions of `round-evidence-audit`
  (`git grep -c 'round-evidence-audit' 573c99e… -- SKILL.md` → 0). If the gate set is derived
  from registry rows ("plus the gate scripts it names"), the missing-row gate is invisible and
  the baseline reads 0 — vacuous, contradicting the claim's premise. Only a `scripts/` scan or
  an explicit manifest can observe it; neither is declared. The set enumeration must be frozen
  for the closure to re-derive the before→after.
- C2/C3: no universal clauses.

### Rule 3 — calibration counts mismatches (not an assertion)
- **C2** ✓ conceptually (self-assessment docs vs observed repo state), but the composition is
  not aligned with observable bytes — see Rules 1/7.

### Rule 6 — target unreachable by a do-nothing control; committed receipt before freeze
No claim satisfies the process half (committed receipt), and two claims' controls hit the
target as written:
- **C1**: skip control `scratch/ExecControlSkip/check-gate-registry-skip.mjs` prints
  `nonconformant:0, clean:true` unconditionally; the literal it greps occurs 0 times in the
  baseline SKILL.md, so the naive control reports exactly the target. The claim asserts the
  control "must fail" but no committed receipt demonstrates it: `.ufo/waves/round-24/control/
  control-receipt.json` does not exist (glob → Path not found), and no commit contains any
  round-24 file.
- **C2**: skip control `scratch/ExecControlSkip/check-selfassessment-skip.mjs` prints
  `mismatches:0, clean:true` unconditionally at the baseline where the stale figures sit; same
  missing receipt.
- **C3**: no receipt path at all. The counting command `git grep -lE '^source: S10[45] '`
  cannot distinguish an admitted, source-opened entry from a fabricated or appended line —
  round-23's own measurement bounds record exactly this (`corpus/evidence/round-23/
  c2-measurements.json` counterBounds: "appending such a line to an existing note would also
  read 1"). The narrative control relies on the Gate quote-check, which is outside the counter;
  a do-nothing control that commits a knowledge file containing `source: S104` reaches target 1.
- Contrast: round-23's committed `fixtures/skipwork-receipt.json` shows the required shape
  (schema, frozenTarget, counter, realAuditor, skipworkControl, verdict, why). That precedent
  is not followed this round despite the claims asserting it was.

### Rule 7 — one predicate identical in plan, counter and receipt; frozen before data
- Receipts are absent for all three claims ⇒ the receipt label half is unverifiable.
- **C2**: plan says "three stale `--selftest` 12/12 figures". Baseline `SCORECARD.md` holds
  four `12/12` strings (`git grep -c '12/12' 573c99e… -- SCORECARD.md` → 4; lines 77, 79,
  1139, 1151), of which exactly two are `--selftest` tallies (:1139, :1151). The third routed
  stale figure (spot-check defect 4) sits in the fleet report `.ufo/reports/round-23/tabi.md`
  :93 (`--selftest` → 12/12), outside the declared m1 surface (SCORECARD blocks + SHONEN.md)
  and outside the lane revision. As declared, the counter can observe ≤2 of the 3 figures, so
  the "before: 4" composition (3 m1 + 1 m3) is not reproducible from the declared surface.
  Also, routed defect 5 (receipt field contradicts its own command — `c1-measurements.json`
  before.exit 1 vs `git cat-file -e` exit 128) matches m2 but is silent in the claim; the kill
  rule allows disclosing null classes, none are disclosed.
- **C3**: metric label (`admitted_entries_citing_row_first_opened_this_round`) ≠ counter
  condition (presence of a line `^source: S104 `/`S105 `). Admission and first-opened-this-round
  are unobservable by the grep (id-literal proxy); no receipt pins the label.

## Other checks
- Axis naming (§9 last bullet): C1 operability (surface = gate-registry conformance — the
  routed defect 1), C2 calibration, C3 coverage (unheld browser-interaction surface; the
  command that shows it unmoved is the git grep). Consistent.
- PROTOCOL §Gate row fields (read `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/
  protocol/PROTOCOL.md:388-436`) = the claim's eight fields (name, gate|probe, entry command,
  verdict map code→class, self-test command and spelling, pinned-value path, write scope,
  owner). Match.
- 13-case matrix confirmed: `grep -c 'runFixtureCase('` in `scripts/round-evidence-audit.mjs`
  = 14 occurrences, 1 definition → 13 cases; inventory constant `cases.length ===
  CLASSES.length*2+1` = 13. So any remaining "12/12" tally is stale.

## Causal separability: C1 vs C2
- **Separable for verification.** Measurement surfaces are disjoint: C1 reads `SKILL.md`
  registry + gate scripts; C2 reads SCORECARD/SHONEN + receipts + working tree (+ the fleet
  report for the third stale figure). Each counter runs and is verifiable on the baseline
  without the other having landed; axes differ (operability vs calibration), so the
  "two claims on one axis = one claim" rule is not triggered.
- **Joint landing coherence (not verification dependency).** Once C1 lands, its new gate's
  SCORECARD capability row becomes an m1 input; C2's after=0 therefore requires that row's
  tally to be truthful (or C2 to correct it). This is a landing-order consistency constraint,
  not an interdependence of the measurements.

## Residual risk / verification gaps
- Frozen "before" values rest on instruments that do not yet exist and no round-24 file is
  committed (lane tip == baseline); the only verifiable "frozen before data" object is the
  claims text itself.
- If m1 is implemented literally over SCORECARD/SHONEN only, the claimed before=4 cannot be
  reproduced; the L1 must decide explicitly whether the fleet report's stale figure is in the
  m1 surface and record the resulting receipt.
