# RevCounterShape — frozen C1 counter-shape review (tabi r23 a1, baseline a89f1935)

Verdict: **C1's type is right (capability acquisition) and its metric name is honest, but the frozen
counter is not yet one command over one tree and its control cannot fail as written — four must-fix
items before `6` is a citable after-state.**

## Findings (severity; command that produced the evidence)

**F1 high — c4 and c6 have no lane-side citation bytes.** `--rev` resolves in the lane repo, which
holds no round-22 report copy, yet the *cited* half of c4 (the `Stale-lane` line) and c6 (row cites
`47bfb5f`) exists only in the fleet report.
`git -C …/tabi-shokunin ls-tree -r --name-only a89f1935 | grep -c '^\.ufo/reports/round-22/'` → `0`;
`grep -n 'Stale-lane' …/shokunin/.ufo/reports/round-22/tabi.md` → `3:`;
`grep -n '47bfb5f' …/tabi.md` → `85:`. Lane bytes prove only the derived half
(`git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'` → `0`). c1 survives on lane bytes
(`git show a89f1935:corpus/lessons/round-22.md | grep -c '23 whole-payload'` → 1 at `:130`;
`… SCORECARD.md` → 1 at `:1111`). Fix (specify, never narrow): add `--report <path>`/`--fleet-rev` to
the API *and* to C1's counting command, or commit a byte mirror of the report with the wave evidence.

**F2 high — c3's predicate is unpinned and its literal reading trips the round-21 control.**
`git show a89f1935:corpus/lessons/round-21.md | sed -n '/^## Gate/,/^### /p' | grep -ciE 'spot.?check'`
→ `0`; same on `round-22.md` → `0`. Round 21 has no spot-check lesson at all
(`git ls-tree -r --name-only a89f1935 -- corpus/lessons | grep -c 'round-21-verifier'` → `0`). "Gate
carries a spot-check row" therefore trips r21 too, contradicting the frozen control ("round-21 must
not yield the round-22 classes at all"); the kill rule then deletes c3 and the target is 5.
Fix: freeze c3 = *a committed `<round>-verifier-spotcheck.md` exists for the round AND its Gate omits
that result or an explicit owed-to-closure line naming it* — trips r22, clears r21.

**F3 high — the control has no receipt, and the frozen counter cannot fail it as written.**
`ls .ufo/waves/round-23 | grep -ci control` → `0`, so §9's "score the cheapest skip-work control with
the frozen counter and commit that receipt" is unmet before data. The cheapest skip-work input is
already inside the audited tree: `git cat-file -e a89f1935:corpus/lessons/round-22-verifier-spotcheck.md`
→ `0`, and that file states all six defects with their derived numbers
(`grep -cE '^[1-6]\. \*\*' corpus/lessons/round-22-verifier-spotcheck.md` → `6`). An auditor parsing
it returns 6; neither the clean fixture nor the green mutants can see it, because they run under
`--selftest`, a different command from the frozen counting command.
Fix: freeze an evidence-source exclusion (every `findings[].evidence` must resolve at `--rev` to a path
other than the spot-check lesson) plus one committed control-printer receipt scored by the frozen counter.

**F4 high — `classes:6` is a constant in the declared output.** `… --json | jq '.classes'` re-derives
`6` on an empty `findings` array. `counterField` is correct but the claim never pins the expression.
Fix: emit `classes: {known:6, detected:n}` and freeze `jq -c '[.findings[].class]|unique|length'`, with
expected exit codes stated (round-22 → `1`, clean fixture → `0`) so nonzero exit is not read as failure.

**F5 medium — `before: 0` ships no reproducing command.** It is absence, not a measurement:
`git cat-file -e a89f1935:scripts/round-evidence-audit.mjs` → exit `128`; the absence is real for these
labels (`git grep -lE 'refusal-arithmetic|wave-caps|gate-spotcheck|stale-attempts|registry-identities|landed-log-binding' a89f1935 -- scripts | wc -l` → `0`).

**F6 low — the round-21 control is vacuous for two classes**, and the claim should say so: 0 refusal
receipts (`git ls-tree -r --name-only a89f1935 -- .ufo/waves/round-21 | grep -c refusal` → `0`) and 0
attempt records (`… | grep -ciE 'attempt|respawn'` → `0`). c2 clears on evidence (two `maxLanes: 64`
specs, total 128); c5 clears on evidence (64 real `agentId`s per r21 registry).

**F7 low — `6/6` encodes a denominator the script defines.** State "the six routed labels, each present
in `findings[].class`, distinct-count = 6" and freeze the label list, not a fraction.

## Wording that reads universal (frozen text → narrower sentence)

1. "derives six defect classes from **a round's** committed wave bytes" → universal over rounds; only
   r22 is measured. → "derives the six named classes from **round-22's** committed bytes, and accepts
   round-21 bytes without emitting any of them."
2. "**every** check needs a red mutant … and a green mutant" / "one mutant per check in each direction"
   → universal not enumerated by the counting command. → "each of the six checks carries exactly one
   red and one green mutant, enumerated by `--selftest` (12 cases, exit 0); that arm supports the kill
   rule and is not the counted value."
3. "reproducing **the six defects** the round-22 non-author spot-check routed" → bind it: "one class per
   routed item at `corpus/lessons/round-22-verifier-spotcheck.md:198-226`."
4. `metric: defect_classes_detected` → keep only if derived; otherwise `defect_classes_derived`.

## Is "0 → 6 classes" a capability acquisition or an assertion?

**Capability acquisition** per AXES.md *Capabilities*: before is absence, the capability must run, and
the row enters the SCORECARD `capabilities` table (name → what it can do → evidence pointer →
first-working round) through this round's running demonstration. Not an axis-score assertion —
`notClaimed` forbids scalar promotion, and AXES still requires the per-axis verdict (operability) on
record as unchanged. Rule 8's "name the surface, not the number" is met: C1 names the script. It
degrades to an assertion if the value is read from `classes:6`, if the six labels are printed rather
than derived (F3), or if the SCORECARD row is written as an operability score delta (F4/F7).
