# Mut02 — mutation test: C1 S106 evaluator revision-comparison removal (round 28, attempt 1)

Seat: `Mut02` (mutation-tester, leaf). Scope: read-only lane (no tracked changes); writes only this
report and `.ufo/waves/round-28/scratch/Mut02/`. No subagent dispatch. No tool installs (PACMAN
paused; nothing installed). Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (= HEAD).

## Frozen claim cited
`claims.json` line 11 (C1, depth): "at least 7 cases with revision mismatch rejected and matching
revision accepted; target receipt valid at its named revision" (12 words); kill rule: "If adding
revision binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim
misses". Counting command: `node scripts/check-s106-evidence.mjs --selftest`.

## Target of the mutation probe
C1 evaluator = `scripts/check-s106-evidence.mjs`. At baseline (evidence, command):
- `git show eb23c0b:corpus/evidence/round-26/sources/s106.json` → schema `tabi-s106-evidence-v1`,
  **no `revision`/`measured_rev` field** (observation);
- `node scripts/check-s106-evidence.mjs --selftest` → `verdict=clean cases=5 passed=5`, exit 0
  (observation; ids: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid,
  missing-bytes-CNE, missing-receipt-CNE — no revision case);
- `node scripts/check-s106-evidence.mjs --rev eb23c0b… --json` → `valid=true`, exit 0 (observation).

No committed or sibling-scratch evaluator yet implements the claim's revision comparison: the only
in-flight repaired draft (`scratch/Exec13/check-s106-evidence-binding.mjs`) reads bytes at the
receipt-declared revision and treats evaluation-at-a-later-commit as valid — it contains no
mismatch-rejection (observation of its selftest cases: 7/7 clean incl. `evaluate-at-later-commit-still-valid`;
no red revision-mismatch case). `[INFERENCE]` its behavior therefore equals the "accept mismatch" class.

## Method: parent and mutant (scratch only)
Synthesized the claim-satisfying parent from the **production** evaluator (one behavior-bearing
change per the claim + Crit08's smallest safe correction): (1) `parseReceipt` requires a 40-hex
`revision`; (2) `evaluate` resolves the bound revision and returns `valid:false, reason:"revision
mismatch"` (exit 1) when `bound !== rev`; byte checks then run at `bound`. Mutant **m6** = parent
with the comparison block **removed** (the smallest removal that "accepts mismatch"). Unified diffs
(observation, `diff -u`):

```
production -> eval-required.mjs:
+  if (typeof doc.revision !== "string" || !/^[0-9a-f]{40}$/.test(doc.revision)) {
+    throw new Refusal("receipt missing 40-hex revision");
+  }
+  const bound = resolveRev(repo, receipt.revision);
+  if (bound !== rev) {
+    return { schema: SCHEMA, rev, measured_revision: bound, bytes_path: receipt.bytes_path,
+             present: true, valid: false, reason: "revision mismatch" };
+  }
+  const bytesText = readBlob(repo, bound, receipt.bytes_path);
-  const bytesText = readBlob(repo, rev, receipt.bytes_path);

eval-required.mjs -> m6.mjs:
-  if (bound !== rev) {
-    return { schema: SCHEMA, rev, measured_revision: bound, bytes_path: receipt.bytes_path,
-             present: true, valid: false, reason: "revision mismatch" };
-  }
```

Hashes (sha256, observation): lane script `ef12a6fbe27068bf…`; parent `cbf184a003e01e72f…`;
mutant `8ef3587f11c9358869…`; Exec13 draft copy `548ad687878945bf34…`.

## Detector (independent, byte-identical fixtures)
Fixture repos under `scratch/Mut02/fx/{s1..s7}` (mktemp-style `git -C`, root verified before commit;
builder `build-fx.py`, runner `det.mjs`). Receipts: schema v1 + `revision` = byte commit. Probes:

| probe | scenario | parent eval-required | mutant m6 | Exec13 draft |
|---|---|---|---|---|
| F | s7@r1, receipt absent at r1 (receipt committed at r2) | 2 CNE | 2 CNE | 2 CNE |
| G | s7@r2, byte-identical mismatch | **1 invalid** reason=revision mismatch | **0 valid** | **0 valid** |
| A | s1@r2, byte-identical mismatch | **1 invalid** | **0 valid** | **0 valid** |
| D | s3@r3, receipt binds r2 (byte-identical) | **1 invalid** | **0 valid** | **0 valid** |
| B | s2@r3, mismatch + tampered bytes at eval rev | **1 invalid** (mismatch fires first) | **0 valid** (bound read sees good bytes) | **0 valid** |
| E | s4@r1, receipt absent | 2 CNE | 2 CNE | 2 CNE |
| H | s5@r2, bytes absent at bound | **1 invalid** (mismatch masks missing-bytes) | **2 CNE** | **2 CNE** |

All rows are observations of `node <eval> --repo <fx> --rev <rev> --json` + exit code.

## Verdicts
- **Mutant m6: KILLED** by G/A/D/B. Required failure = the claim's red revision-mismatch control
  (exit 1, `valid:false`); under the mutant the same four mismatch fixtures all return exit 0
  `valid:true` — mismatch accepted. Removing the revision comparison flips the required red controls
  green, exactly the kill-rule-forbidden direction.
- **Baseline production = surviving "accept mismatch" mutant.** Independent reproduction with my
  v1 receipt carrying `measured_rev` (s6, byte-identical, evaluated at a later commit):
  `node scripts/check-s106-evidence.mjs --repo scratch/Mut02/fx/s6 --rev HEAD --json` → `valid:true`,
  exit 0 (observation) — same falsification as `w1/Crit08.md`.
- **Coverage finding:** neither the baseline 5-case selftest nor the Exec13 draft's 7-case selftest
  contains a case that distinguishes bound-from-eval revision; both pass while the comparison is
  absent (surviving-mutant class). The claim's ≥7 target is only satisfiable if the new cases
  include an explicit mismatch-red control.
- **Missing-source CNE retained** under every evaluated path where the receipt is read at the
  evaluated/bound revision: E = 2 CNE everywhere; H = 2 CNE under mutant/draft (observation).
  Interaction note: under strict equality the combined “bound lacks bytes + evaluated elsewhere”
  case returns exit 1 (mismatch) not CNE — needs a target decision.
- `[INFERENCE]` a literal “matching revision” (equality) green control is unsatisfiable for a
  git-committed receipt: a receipt cannot reference the commit that contains it (probe F documents
  the structural gap); the green control must be defined via the bound read (Exec13 semantics) or
  via a co-committed receipt whose revision is the receipt's parent.

## Restoration / integrity
- Lane script hash unchanged across the whole probe (`ef12a6fbe27068bf…` before and after);
  `git status --porcelain` = only `?? .ufo/waves/round-28/` (untracked wave dir; no tracked edits).
- Restore proof (observation): `cp eval-required.mjs restored-from-m6.mjs` → sha256
  `cbf184a003e01e72f…` ≡ parent; `cp scripts/check-s106-evidence.mjs restored-lane-copy.mjs` →
  sha256 `ef12a6fbe27068bf…` ≡ lane; `cmp` both pairs identical.
- Probes re-run identical twice (deterministic).

## Final answer (≤6 lines)
Mutant m6 (revision comparison removed) KILLED: four independent byte-identical mismatch fixtures go
red under the required parent (exit 1 invalid) and green under the mutant (exit 0 valid) — removing
the binding accepts mismatch. Baseline production already behaves as this surviving mutant (s6
`measured_rev` fixture: valid=true exit 0); neither the 5-case nor Exec13's 7-case selftest detects
it. Missing-source CNE retained (exit 2) on all paths where receipt/bound is read. Strict equality
green control is unsatisfiable in git (receipt cannot bind its own commit) — needs a target decision.
No lane edits; hashes + restoration recorded above. Report: `.ufo/waves/round-28/w1/Mut02.md`.
