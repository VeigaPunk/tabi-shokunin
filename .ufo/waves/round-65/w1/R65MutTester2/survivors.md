# R65MutTester2 — survivors of exact-line mutants of v2 checkMatrix

Target: w1/R65Executor2/check-receipt-provenance-v2.mjs (sha256 49a7ec8a63f573aa0acf7b39852e22c8d346d6dad5bdc5a1bb7566802a3905ae), base 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162.
Mutants applied to scratch copies only; one line replaced per mutant. KILLED = (a) selftest not clean, or (b) forgery matrix-input count != 2, or (c) honest exit != 0, or (d) scored exit != 0.

## M4 — survived (line 82, format accepts uppercase or empty sha256) — low, detail only
- Missing case: selftest negative for an uppercase-hex pinned digest and for an empty sha256, asserting the matrix-input detail is exactly `no input path+sha256`.
- Why it survived: accept/reject is unchanged (the digest compare still fails for both), and the selftest format negatives check only the check id.
- Probe: uppercase-correct pin: pristine `no input path+sha256` -> M4 `input digest mismatch`; empty pin: same change. Exit 1 in both.

## M5 — survived (line 89, relative path resolves against matrix dir only) — high, false reject
- Missing case: selftest positive for a matrix whose relative input path resolves only under --repo with the correct sha256 (expect zero matrix-input findings); plus the negative where the same relative path is absent from both roots.
- Why it survived: no selftest case uses a relative path that exists under --repo; controls (b) and (c) use absolute paths; (d) exercises zero matrices (see calibration defect below).
- Probe: a valid relative-under-repo matrix: pristine no matrix-input finding (accept); M5 `input absent: instruments/a.mjs` (false reject).

## M7 — survived (line 91, absent detail gains a suffix) — low, detail only
- Missing case: selftest golden for the absent-input detail, equal to exactly `input absent: <rel>`.
- Why it survived: the selftest checks `f.detail.startsWith('input absent')`, so any suffix passes; counts and exits are unchanged.

## Calibration defect (not a mutant survivor, but it voids check (d))
- The scored r64 population exercises zero matrices: the inherited selector `/^matrix.*\.json$/` does not match `mutants-matrix.json` or `negatives-matrix.json`. Every mutant passed (d) with `matrices: 0`, so (d) cannot kill any binding mutant.
- Both files bind under pristine (input exists, sha256 equals pin), so widening the selector keeps the honest control green, and it then exercises the binding on real pinned inputs.
- Missing case: widen the selector (or pin the two named files) and rerun (d) with `matrices >= 2`, before the freeze.

Killed by at least one check: M1, M2, M3, M6, M8. Killed by (a) and (b) except M3 (killed by (a), (c)). See mutants.json for the per-check record.
