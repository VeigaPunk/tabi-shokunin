# CritProvince — axis & province fit for round-24 claims (C1/C2/C3)

Role: critic (read-only reporter). Sources read: `PROVINCE.md`, `AXES.md`, `PROTOCOL.md` (§Gate standard, §File contract), `claims.json` (frozen), `SCORECARD.md` (full), `SKILL.md` registry sections, `LOG.md`, baseline commit `573c99e4`, sibling lane reports (`kama`, `kumitate`, `.ufo/reports/round-{19..34}`), live worktree state.

## 1. Verdict summary

| Claim | Declared axis | Axis it actually moves | Honest? |
|---|---|---|---|
| C1 gate-registry conformance gate | operability (lowest non-retired tie 8) | protocol-conformance of the lane's gate registry (documentation state); partial operability at best | **partially** — the zero target cannot certify that any gate runs; see counterexample 3.1 |
| C2 self-assessment counter | calibration (score 9) | calibration *in kind* (SHONEN/SCORECARD vs observed state) but bundled with housekeeping; score 9 is left un-grounded | **partially** — classes are calibration-shaped, yet the claim conflicts with the very 9 it sits on; see counterexample 3.2 |
| C3 bfcache navigation-evidence entry | coverage | coverage (frontier knowledge entry) | **yes** — surface confirmed unheld (sweep below) |

## 2. Province fit

Per `PROVINCE.md:15-19` tabi refuses out-of-province work and "reports, never absorbs". C1/C2 are not browser craft — they are lane-governance meta-tooling. However, `PROTOCOL.md:398-406` makes every child lane itself the owner of its registry home (`SKILL.md`) and its gate conformance; `:420-421` grades no gate conformant until its registry row exists at the lane's registry home. So a lane-local registry checker is within the protocol-assigned lane obligation, not an exclusive protocol/kumitate surface. Sibling precedent confirms this is established fleet practice: kama built `tools/gate-registry-check.py` (rounds 28–34; v2 meaning-check per `round-31.md`/`round-32.md` kama reports), and kumitate's round-34 report invokes the same checker pattern.

The real province risks are two, both *adjacency*-shaped (AXES.md: "evidence belonging to another domain reported, not absorbed"):

1. **Duplicate authority / divergent schemas.** C1 re-implements a gate-registry conformance checker as `scripts/check-gate-registry.mjs` with its own `tabi-gate-registry-v1` schema while kama's already-audited `tools/gate-registry-check.py` v2 covers the same semantics (table-row presence, cell presence, non-empty exit map, cited-path existence). Nothing in the frozen claims names or reconciles with that precedent. If protocol later standardizes one fleet checker, these lane copies become redundant maintenance; worse, two independent readings of the same §Gate row schema invite inconsistent verdicts.
2. **Capability-table pre-claiming.** AXES.md:59-64 requires a capability to enter the table only through a round demonstrating it running. C1/C2 are declared "capability-acquisition" — acceptable — but the *capability acquired* is generic protocol-conformance tooling, not tabi craft; that deserves at minimum an adjacency paragraph in the round report pointing at kama's precedent and the aggregator ledger.

Verdict: C1/C2 are not "out of province" enough to refuse, but they are meta-tooling whose *generic* part converges on fleet-level machinery. The smallest safe posture: keep the (owed) row repairs, but report the checker duplication upward and state plainly that the new instruments are governance infrastructure, not a new browser-craft capability.

## 3. Counterexamples (strongest available from local evidence)

### 3.1 C1 — a fully conformant registry can certify a dead gate set

Operability signal (AXES.md): "A checklist item can be run and produces the stated outcome." C1 reads committed bytes and derives *fields*; per the freeze it never executes the registered entry commands. Construct the state: every row complete with all eight fields, every named script replaced by a file that crashes on invocation (e.g., syntax error, nonexistent path). C1's counter (nonconformant gates) reports `0`, `clean:true` — while zero gates run. C1 therefore measures *documentation conformance*, not operability; its before→after (N→0) can go green without any gate becoming runnable. This is exactly the gap between the freeze's metric and the axis definition.

Secondary design hazard: the gate population source is ambiguous in the freeze ("the lane's gate-script set" / "the gate scripts it names"). If the population were derived from registry rows, a missing row would make the gate invisible — the exact round-23 defect-1 shape (`round-evidence-audit.mjs` committed at baseline, `grep -c round-evidence-audit SKILL.md` → 0). The instrument must derive the population from the committed script inventory (`scripts/*.mjs`), not from rows, or defect 1 is uncatchable by construction.

### 3.2 C2 — the 9-score circularity, and m3's coupling to mandated work

(a) *Score honesty.* `claims.json` round-start scores: calibration 9. C2's own premise is that SHONEN/SCORECARD entries contradict observed state (4 mismatches). A 9 is not re-derivable from a state carrying 4 mismatches — the previous calibration score was itself an overreach, i.e., precisely the calibration failure mode the checker detects. The claim then keeps the score at 9 (delta 0, "no scalar promotion"). Without re-grounding, the checker will re-flag the same scorecard row next round (stale evidence pointer, m2-shaped) — C2 risks becoming self-defeating. The honest reading: the 9's basis is *repaired this round*, not merely confirmed.

(b) *m3 coupling.* m3 (unlanded paths while asserting landed rounds) is a property of the measuring moment, not of any revision — yet the counter's API is `--rev <40-hex>`. `git status --porcelain | wc -l` → 91 today (claim says 89; delta = round-24 wave dirs and round-23 scratch, both currently untracked). The same mandated cleanup ("the 89 unlanded paths are resolved") is separately required by the round brief, so C2's 4→0 on m3 is guaranteed by independent work even if the checker were vacuous. m3 is a census, not a calibration move; counting it inside the calibration target double-counts mandated work and makes the claim not causally separable from it.

(c) *m1 boundary.* m1 (selftest-tally drift) is registry truthfulness — the same surface C1 governs — not an introspection improvement. It is defensible as calibration only under the reading that a documented tally is an assertion about the tool; flag it as shared with C1's domain.

### 3.3 C3 — no counterexample found

Sweep: `grep -rci "bfcache" corpus/knowledge/` → 0 matches in every file (no output lines); corpus holds no back/forward-cache navigation-evidence entry. The admission rule (re-open sources, dated SOURCES rows with located quotes) matches C3's kill rule. No negative finding.

## 4. Evidence (exact commands)

- Baseline script inventory (round-evidence-audit.mjs committed, no row): `git ls-tree -r --name-only 573c99e4 -- scripts/` → 21 files incl. `scripts/round-evidence-audit.mjs`.
- Defect 1 confirmed at current tree: `grep -c "round-evidence-audit" SKILL.md` → 0.
- Stale 12/12 tallies (three, vs a 13-case matrix): `grep -n "12/12" SCORECARD.md LOG.md` → `SCORECARD.md:1139`, `SCORECARD.md:1151`, `LOG.md:1664`. Auditor matrix is now 13: `scripts/round-evidence-audit.mjs:731-732` ("the inventory is 13, not 12"); commit `43e9bb5` subject "c2 round-total red arm (13 selftest cases)".
- Calibration 9 at round start: `claims.json` `axisScoresAtRoundStart.calibration = 9`; `SCORECARD.md:1124` (round-23 block) and round-18..22 blocks all list 9.
- m3 population: `git status --porcelain | wc -l` → 91 (observation; claim's 89 was pre-round-24).
- Sibling checker precedent: `kama-shokunin/corpus/lessons/round-28.md`, `round-31.md` (tools/gate-registry-check.py; "registered 9 unregistered 0" occurrence-check refuted → v2 meaning-check), `round-32.md` v2, kama round-34 report.
- C3 surface unheld: `grep -rci "bfcache" corpus/knowledge/` → 0 (sweep over all files).
- Protocol row schema equals the claim's eight fields: `PROTOCOL.md:401-403` (name, gate|probe, entry command, verdict map code→class, self-test command and spelling, pinned-value path, write scope, owner) — C1's field list matches exactly.
- Workspace draft: `scripts/check-gate-registry.mjs` exists in the live worktree (`ls scripts/`) with `tabi-gate-registry-v1` schema — pre-data draft, not part of baseline measurement.

## 5. Impacted axes

- C1: declared operability — the metric cannot falsify a non-runnable gate set, so the *claimed* axis is not actually moved by the zero target; the moved quantity is protocol conformance. If forced onto an axis, the honest home is calibration-adjacent (documentation matching observed state) or a stated capability acquisition with no axis claim; at minimum the report must disclose that green ≠ runs.
- C2: declared calibration — in-kind honest, but incomplete: the 9 must be re-grounded to the counter as the row's evidence pointer, and m3 must be split out as housekeeping so the calibration number is only m1/m2.
- C3: coverage — honest, no harm.

## 6. Smallest safe corrections (for the L1/owner, not executed here)

1. C1: derive the gate population from the committed `scripts/` inventory, never from registry rows; add an execution class to the counter (or explicitly delegate it): for each registered `gate` (not probe), run its entry command against a committed clean fixture and require exit 0; failures count as nonconformant. This closes the paper-green counterexample and makes the operability label defensible.
2. C1/C2: in the round report, name the kama `tools/gate-registry-check.py` v2 precedent and propose a single shared schema/checker ownership ruling to protocol (adjacency report, not absorption).
3. C2: attach the new counter as the calibration row's evidence pointer in `SCORECARD.md` and record that the prior 9 had no traceable basis (the 4 mismatches are that admission). Split m3 out of the calibration target; report m1/m2 as the calibration count and m3 as a separately-mandated census.
4. C2: record that "before 4" includes one m3 item co-determined by the mandated cleanup, so the before/after is disclosed as partially non-causal.
