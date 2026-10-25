# W2CounterShape — is the executed counter the declared one?

Bytes attacked: `claims.json` sha256 `5ed361773528…` (mtime 04:26:48), `scripts/round-evidence-audit.mjs` sha256 `bf0aff59c1b7aa22` (re-hashed after the live edits below), `corpus/lessons/round-23.md` sha256 `f9344bf8d4e1c2d8…` (04:29:38), `corpus/evidence/round-23/c1-measurements.json` sha256 `d3eb54cf9763…` (04:29:16). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

**Verdict: no.** The executed counter is not the declared one: the frozen `countingCommand` still refuses (exit 2), the frozen `control` is falsified by the lane's own archived run, and two of the six classes are decided by a fleet file that is not lane-committed at any revision. Every correction lives only in `revisions[]`; the fields were never rewritten.

## Findings

1. **Frozen command unrunnable; the executable form exists only in `revisions[0].to`.** `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --json` → exit **2**, `refused: --round-cap is required`; `claims.claims[0].countingCommand` is byte-for-byte that string (`python3 -c "json.load(open('…/claims.json'))['claims'][0]['countingCommand']"`). Two authorities, one artifact.
2. **Frozen `control` is false against the archived run.** `… --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --round-cap 128 --json` → `findingClasses: ["c3-gate-spotcheck"]`, `clean: false`, exit 1. The frozen sentence says round-21 "must not yield the round-22 classes at all"; `revisions[2]` says otherwise. A closure reading `claims[0].control` reads a control that failed.
3. **"round-22's committed wave bytes" is not what is read.** At fixed `--rev`, editing only the external fleet report clears two classes: `--report .ufo/waves/round-23/scratch/W2CounterShape/report-mut.md` → **5** classes (c4 gone); `--report …/report-mut-log.md` → **5** classes (c6 gone). `git ls-tree -r --name-only a89f1935 -- .ufo/reports | grep -c round-22` → **0**. c2 additionally reads the fleet policy; only c5 is pure lane bytes. `revisions[1]` admits this; `claims[0].declared` still says the opposite.
4. **`before: 0` is not a value of the counting command.** The receipt's before arm uses a *different* instrument: `{"command":"git cat-file -e a89f1935:scripts/round-evidence-audit.mjs","exit":128,"classes":0}` (`python3 -c "…['before']"`). Zero is entailed by the script's absence, not observed by the counter; no revision addresses this arm.
5. **Unscoped "0 classes mechanically detectable" is false at baseline.** Two of the six classes were already mechanical fleet predicates: `grep -n NOT_A_DISPATCH kumitate-shokunin/scripts/dispatch-evidence.mjs` → `:130`; `grep -n LOG_ENTRY_MISSING kumitate-shokunin/scripts/round-gate.mjs` → `:437`. True only as "lane-owned over tabi round bytes"; neither the claim nor the receipt note carries that scope.
6. **`classIds` is a constant six beside the derived `findingClasses`.** On evidence that yields one class: `… --round 21 … --json` → `findingClasses.len=1`, `classIds.len=6`, `findings.len=1`. A closure re-deriving the target from the wrong key gets 6 on a clean round.
7. **Lesson arm 1 is not round-22 evidence.** The lesson says "two arms, both on round-22 bytes: `--selftest` → 12 cases"; plain `--selftest` runs `baseFixture()` at `const round = 90` (`grep -n "const round = 90" scripts/round-evidence-audit.mjs` → 486-488). Only `--selftest --rev … --round 22` is rev-keyed (6/6 repairs, verified exit 0).
8. **"0 → 6" reads as a detection gain the lane did not make.** The six classes were already routed at baseline by the non-author spot-check (`sed -n '198,227p' corpus/lessons/round-22-verifier-spotcheck.md`, six items mapping 1:1 to the class names). The lane's real delta is rerunnability, not detection; the claim and lesson present 0 → 6 unqualified.
9. **"C1 is a capability on the lane's *own* evidence" contradicts the next clause of the same sentence.** `sed -n '166,170p' corpus/lessons/round-23.md` — "it audits tabi round bytes only, reads the fleet round report and the fleet policy by path". Findings 3 and 9 are the same defect at two layers.
10. **Live edit during this review (disclosure, not a defect).** The receipt's `before.exit` read **1** when first sampled and reads **128** now; the script sha moved `6eeaeda7…` → `bf0aff59…` mid-wave. Any before/after value cited without the run's `scriptSha256` is unbound to the bytes that produced it.

## Cleared (attacked, held)

- `findingClasses.length` **is** the right field for `defect_classes_detected`: 7 findings / 6 classes, per-class 1/1/1/1/1/2, stated in the lesson and the receipt; `findings.length` would report 7 against a class target. Only the constant `classIds` (finding 6) is a trap.
- The round-22 anchor is genuinely non-author: spot-check header `author: hyaku closure (non-author integrator, @m_flash)`, committed at `a89f193`.
- The after value is cap-insensitive for round 22 (`--round-cap` 4/128/129/130 → 6 classes), so `revisions[0]`'s 128 changes runnability, not the number.

## Smallest safe correction

Write `revisions[*].to` into the frozen fields (`countingCommand`, `declared`, `control`) so one authority exists; restate the before arm as "not measurable by this counter; 6 routed manually by the non-author spot-check; 2 already derived fleet-wide"; change lesson arm 1's label from "round-22 bytes" to "synthetic round-90 fixture"; and drop `classIds` from the JSON or rename it `enumeratedClasses`.
