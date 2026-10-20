# AttackLowestAxis — tabi round-16 w2 (FALSIFY, leaf)

Seat: `TabiR16.AttackLowestAxis` · lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Measured revision attacked: `b444ca8e024f386124418169e8e400221524bba3`
(`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair). Baseline `e38d2599a922cb729186353830fff8e159b4fef0`.
Wrote only this file; everything else run read-only (harness output to `/tmp`). No tool installed or updated.

## Attack item — R16 lowest-axis rule and the capability window

> Is C1 (operability) a valid lowest-axis claim for round 16, and does C2's capability
> `webmcp-cdp-observation` reset the stagnation window?

**Verdict: HOLDS** for both halves, on the rules as written and the evidence at the measured
revision. One **must-fix record defect** and three landing obligations are named at the end; none
of them invalidates either claim.

The answer is robust to the one genuine ambiguity in the lane's record (the nudge's trigger
round): C1 is a tied-lowest axis claim and is admissible under both readings, and a capability
entry restarts the window whenever it lands, independent of which reading fixes the trigger.

## 1. C1 is a valid lowest-axis claim — HOLDS

### 1.1 Operability is a lowest non-retired axis at the measured revision

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git show b444ca8:SCORECARD.md | sed -n '671,676p'
```
Observed (round-15 table, scalar "after" = end state; `git diff --quiet HEAD -- SCORECARD.md` → exit 0):
```
| depth | 8→8 | ... |
| coverage | 9→9 | ... |
| operability | 8→8 | ... |
| freshness | 8→8 | ... |
| calibration | 9→9 | ... |
| adjacency | 8→8 | ... |
```
Lowest = 8, held by depth/operability/freshness/adjacency; coverage/calibration at 9. Retirements:
none (`SCORECARD.md:729` "no retirement"; earlier blocks "retired: none"). `AXES.md:33-34`:
"At least one claim works the lane's **lowest-scoring non-retired axis**". Operability is one of
those four; C1 names operability.

Tie selection is the one place a stricter reading exists, and it does not bind round16. The pstack
continuation lessons record a lane practice of alphabetical selection among tied lowest axes
(`corpus/lessons/pstack-20261015-r07.md:8` "Alphabetical order selects adjacency"; r03/r04/r05/r08/
r09/r10 the same). Alphabetical order over {adjacency, depth, freshness, operability} would pick
adjacency, not operability. But: (a) `AXES.md:33-34` names no tie-break, so any lowest-scoring axis
satisfies it; (b) the pstack lines describe selections made in those 2026-10-15 rounds, not a
standing rule, and they belong to a different continuation protocol and score trajectory; and
(c) the later non-author closures admitted C1 on operability at a tie without objection — r14
"C1 operability … verify in their declared bounded senses. No axis is harmed"
(`corpus/lessons/round-14-verifier-spotcheck.md:7`, table `:169`), and r15 likewise
(`corpus/lessons/round-15-verifier-spotcheck.md:7`, `:107`). The r12 block states the tie-set
reading explicitly (`SCORECARD.md:463`, "Lowest non-retired tied axes: depth, operability,
freshness, adjacency (8)"), and r13–r15 reuse it. Round16 should therefore name the tie-set
reading it uses (as r12–r15 did) so the pick is not silent; under that reading C1 is valid.

### 1.2 C1's counted object is the operability signal's shape: a script that runs to a stated outcome

```sh
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
# exit=0  c1_binding_contracts=0  failures=["gate or selftest absent at revision"]
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
# exit=0  c1_binding_contracts=1  failures=[]
```
The after-run's own fields (one JSON line): `selftest.exit=0`, `selftest.cases=43`,
`selftest.summary="MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13"`,
`legacy.exit=1` with exactly `C1{counter_digest_unrecorded, counted_inputs_undeclared,
counter_changed_since_measurement}` and `C2{counter_digest_mismatch, counted_inputs_undeclared}`
(as implemented in `measure.mjs:72-73`);
`gateSha256=5150611c…`, `selftestSha256=8c5426f2…` matching
`git show b444ca8:scripts/check-measurement-binding.mjs | sha256sum` and the selftest blob.
`AXES.md:13` operability signal: "checklists that are executable, commands that exist, scripts that
run … A checklist item can be run and produces the stated outcome." The counter does not trust the
selftest receipt: it materialises both blobs from REV and executes the selftest against isolated
temp repos, then runs the gate `--legacy` on real r15 bytes. That is a runnable artifact producing
the stated outcome, i.e. operability evidence, at its strongest available shape. Attribution of C1
to operability holds.

### 1.3 The stagnation nudge does not invalidate C1 under either reading

```sh
git show b444ca8:SCORECARD.md | sed -n '430,433p'
git show b444ca8:SCORECARD.md | grep -n "position1\|position2"
git show b444ca8:SCORECARD.md | sed -n '569,580p'
```
Observed:
- `:430-433` — "Saturation line **8**; stagnation window **N = 3** rounds. … at line 8 the nudge
  fires only after all six axes reach 8 and three consecutive rounds pass with no new capability row."
- `:658` — "round14 is position1 since that round13 capability"; `:729` — "position2 after round13".
- Last capability row: `aria-locator-template-loopback`, first-working 13 (`:574`); r14 `:657` and
  r15 `:728` both "capabilities unchanged".

All six axes (8,9,8,8,9,8) sit at or above line 8. Two readings:

- **Position reading (the lane's own counter, `:658`/`:729`):** round16 is position3 = N, so
  `AXES.md:68-73`'s precondition is met and the lowest-axis obligation is **waived**; the round
  "should be a frontier/capability move". That is a waiver of the obligation, not a prohibition:
  C1 as an additional claim on a tied-lowest axis remains admissible, and C2 supplies exactly the
  directed capability move.
- **Strict reading of `:432` ("three consecutive rounds pass"):** at round16 entry only rounds 14
  and 15 have passed capability-free, so the waiver becomes available at round17. Then the
  lowest-axis obligation is **not** waived, and C1 must satisfy it — which it does, per §1.1.

Either way C1 is admissible. The waiver, when available, is permissive
(`AXES.md:70-73` "should"), so it cannot convert a rule-satisfying claim into an invalid one.

## 2. C2's capability resets the window — HOLDS, conditional on the row landing

### 2.1 The rule

`AXES.md:62-64`: "Rows enter only through a round that demonstrates the capability running; a
capability without a passing demonstration in the round report is pre-claiming and does not enter
the table." `AXES.md:68-69`: the nudge counts "capability … entered the table within the lane's
stagnation window". Lane precedent: "the demonstrated capability restarts the stagnation window at
round13" (`SCORECARD.md:588-589`), yielding r14 = position1. So **entry → window restart**;
the only question is whether the demonstration is real.

### 2.2 The demonstration is real, and I reproduced it

```sh
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2
# exit=0  c2_webmcp_held=0  failures=["note, receipt or harness absent at revision"]
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
# exit=0  c2_webmcp_held=1  failures=[]
#   cited S020,S030..S036; 11 caseIds incl. flags-off-negative-control and declarative-form-tool

git show b444ca8:scripts/webmcp-loopback-round16.mjs | sha256sum
#   961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1
# receipt.json producerSha256 = same digest; summary {"cases":11,"passed":11,"failed":0,
#   "missing":0}; summary.caseSet.caseSetOk=true; schema tabi-round16-webmcp-v1; verdict pass.
# receipt-first-run-failed.json retained: verdict fail, cases 11, passed 8, failed 3
#   (navigation-clears-tools, frame-tools, opaque-sandboxed-iframe).

node scripts/webmcp-loopback-round16.mjs --out /tmp/tabi-r16-lowestaxis-3092.json
# WEBMCP_CASE id=flags-off-negative-control … data-url-declarative status=pass  (all 11)
# WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/…; EXIT=0
```
My independent loopback run (8.6 s, headless `/usr/bin/chromium`, output confined to `/tmp`; lane
`git status --short` unchanged before/after) reproduces the passing demonstration. The receipt's
producer digest is the harness blob at the measured revision, and the first failed 8/11 run is
retained rather than erased. The capability is not pre-claiming.

### 2.3 What the reset does and does not do

- It **does** restart the window: with the row entered at round16, the "rounds since the last
  capability" counter resets, so round17 is position1 (round13→14 precedent). This holds under
  either nudge-trigger reading, because the reset is driven by the capability entry, not by whether
  the nudge had fired.
- It does **not** retroactively waive round16's label. If the position reading applies, round16 was
  the nudge round and C2 is precisely the directed move; the waiver is still not "used" to excuse
  C1 because C1 satisfies the obligation anyway.
- It is **not yet recorded**. At `b444ca8`, `git show b444ca8:SCORECARD.md | grep -c "Round 16"` →
  `0` (file is 730 lines, ends at the round15 wrap); the only top-level capability table still reads
  `| — none yet — |` with "none enter through this rollout" (`:383-386`), and the row exists only as
  a draft (`drafts/DraftScorecard.md:37`, "first-working16 PENDING"). The reset therefore becomes a
  landed fact only when L1 writes the round16 block with the capability row. Evidence is done;
  recording is owed.

## 3. Findings, by severity

### F1 — MUST FIX before SCORECARD lands: the round16 draft contradicts itself on the nudge

`drafts/DraftScorecard.md:5`: "C1 works operability8, a lowest non-retired tie …; **no stagnation
waiver**."
`drafts/DraftScorecard.md:37`: "**Pre-entry position is 3** (… round16 position3) … with
`webmcp-cdp-observation` held the round16 position is 1."

These cannot both stand:
- If position3 completes the N=3 window, the nudge precondition is met and the lowest-axis
  obligation **is** waived (automatically; whether or not C1 relies on it). "No stagnation waiver"
  is then false as written.
- If the nudge condition is unmet (strict reading of `:432`), the pre-entry position is **2**, not 3.
- Separately, "round16 position is 1" is off by one against the lane's own precedent: the entry
  round is the restart (`:588-589`) and the following round is position1 (`:658`). It should read
  "round16 restarts the window; round17 = position1."

This is the correction wave-1 `RevLowestAxis.md:118-134` already recommended; the committed draft
still carries the defect. Severity is record/calibration, not claim invalidity: C1 and C2 remain
admissible as shown above, but a landed SCORECARD that asserts both sentences would misreport the
nudge state. Recommended wording: "position3 of 3 at round16 under the lane's position counter;
C1 independently discharges the lowest-axis obligation, so no waiver was relied on;
`webmcp-cdp-observation` entered and restarts the window (round17 = position1)."

### F2 — Landing obligation: record the claim type

`AXES.md:40-41`: a capability-acquisition claim "still lands a per-axis verdict, with the claim
type recorded in the round report." No round16 artifact contains the phrase (`grep -rn "capability
acquisition" .ufo/waves/round-16/` → no match); the report skeleton names the capability but not the
claim type. Add "capability acquisition" and the coverage per-axis verdict explicitly at integration.

### F3 — Residual structural risk (pre-existing): per-round capability tables vs "the table"

Capability rows live in per-round tables (`Capabilities — round 13` at `:569-580`), while the single
top-level `## Capabilities` table still says none (`:383-386`). The nudge's "entered the table" is
true only under the lane's per-round-table convention. This predates round16 (kaika and round13 both
did it) and does not break this round, but a strict auditor can read "the table" as the top-level
one, in which case the position1/2/3 arithmetic has no recorded basis. Either reconcile the top-level
table at round16 or state the convention in the saturation line.

### F4 — Ambiguity to state, not to hide

The nudge trigger is genuinely ambiguous between the position counter and `:432`'s "three
consecutive rounds pass"; the nudge has never fired in this lane, so no in-lane precedent settles it.
Both readings leave C1 valid and C2's reset valid; only the round label differs. The landed
SCORECARD must say which convention it uses.

## 4. Residual risk and verification gaps (scope-honest)

- Author-side only; this is not non-author certification, and a dispatched seat is not an outside
  reviewer.
- The harness re-run is a same-host, same-build runtime check (Chromium 154.0.8037.97 as the receipt
  records); it does not create a new capability or extend its limits (loopback only,
  `document.modelContext`, no real site, no agent integration).
- I did not run `check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json
  --reproduce`; the C1 binding content is a separate attack item, and my verdict concerns the axis
  rule, not the manifest's completeness (note: that file was untracked at review).
- The reset is contingent on the schema-valid row landing in the round16 SCORECARD with the passing
  demonstration; if that row is withheld, no reset is recorded and the nudge remains due for round17
  under the strict reading.

## Commands run (observed; nothing outside the lane was mutated)

- `git rev-parse HEAD` → `b444ca8e024f386124418169e8e400221524bba3`; `git diff --quiet HEAD -- SCORECARD.md` → exit 0.
- `node .ufo/waves/round-16/measure.mjs <rev> --claim C1|C2` at `e38d2599…` and `b444ca8…` → the four
  observed blocks above, all exit 0.
- `git show b444ca8:scripts/webmcp-loopback-round16.mjs | sha256sum` → `961874e4…`; matching
  `producerSha256` and worktree blob.
- `node scripts/webmcp-loopback-round16.mjs --out /tmp/tabi-r16-lowestaxis-3092.json` → 11/11 pass,
  exit 0.
- `git show b444ca8:SCORECARD.md` extracts: `:383-386`, `:428-433`, `:569-580`, `:658`, `:671-676`,
  `:729`; `grep -c "Round 16"` → 0.
- `grep -n … AXES.md` → rules at `:33-34`, `:40-41`, `:62-64`, `:68-73`.
- `grep -n "no stagnation waiver\|position is 3\|position is 1" .ufo/waves/round-16/drafts/DraftScorecard.md`
  → lines 5, 37.
- `grep -rn "Alphabetical order selects" corpus/lessons/*.md` → pstack r03/r04/r05/r07/r08/r09/r10;
  `grep -n "operability" corpus/lessons/round-14-verifier-spotcheck.md corpus/lessons/round-15-verifier-spotcheck.md`
  → r14 `:7`,`:169`; r15 `:7`,`:107` (non-author admissions of C1 on the tied axis).
- `git status --short` before and after the harness run → only the pre-existing
  `?? .ufo/waves/round-16/w2/` and `?? corpus/evidence/round-16/measurement-binding.json`.

Tools installed or updated: none. Pacman untouched.
