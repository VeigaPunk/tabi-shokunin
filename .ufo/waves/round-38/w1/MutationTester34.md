# W1-34 — C1 D5 census-count probe

## Result

**Inconclusive mutation probe; no claim verdict.** I inspected the frozen C1 counter at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, especially `.ufo/waves/round-38/counters/c1-routed-defects.mjs` lines 178–207. The D5 logic recomputes row counts and histograms from `corpus/SOURCES.md` at the requested REV and compares them with parsed counts in `census-end.txt` (lines 184–207). The frozen claims identify D5 as receipt-count equality.

I attempted the bounded detector against that frozen REV in an isolated clone using:

```sh
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /fast/scratch/hyaku/tabi-r38/MutationTester34/repo --json
```

The supervised process reported exit code 1, but its JSON/stdout was not available through the returned process handle. Therefore the pristine detector result and its D5 details cannot be established from observed output; under the mutation-testing rule, that prevents a valid killed/survived verdict. I did not make a mutation because the required pristine baseline observation could not be captured.

## Concrete falsification target

The D5 receipt parser at lines 193–207 does not require the `tier` or `status` fields to be present/nonempty. If the independently recomputed source histogram is empty, omitted/malformed histogram fields parse as `{}` and compare equal (`eq({}, {})`). A receipt containing only `rows: 0` can therefore satisfy the D5 histogram comparisons even though the receipt carries no parsed tier/status counts. This is a concrete counterexample to the broad reading that D5 guarantees the receipt *carries parsed counts*; confirm against a valid empty-source fixture and the frozen detector before treating it as a killed mutant or claim falsification.

## Evidence and cleanup

- Frozen source identity: claims digest recorded as `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`; source lines cited above.
- Detector command attempted as shown; supervised process exit code: 1; structured output unavailable, so no claim is made about its findings or predicate.
- No mutation was applied. The isolated scratch directory `/fast/scratch/hyaku/tabi-r38/MutationTester34/` was removed.
- C2 was not re-run; this probe was limited to the assigned primary focus, C1 D5.
