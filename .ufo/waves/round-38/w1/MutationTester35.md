# W1-35 — mutation probe findings

## C1 / D6 numstat endpoints — concrete counterexample

**Finding:** `c1-routed-defects.mjs` cannot discover a committed numstat receipt because its `git ls-tree --name-only REV <directory>` output is a full relative path, but the next filter accepts only a basename. At counter lines 213–215, `names` is derived from that output and the regex is `^numstat-at-…\.txt$`. In my isolated clone, after committing `.ufo/waves/round-38/measure/numstat-at-98239d0.txt`, the direct command

```
git ls-tree --name-only HEAD .ufo/waves/round-38/measure/
```

returned `.ufo/waves/round-38/measure/numstat-at-98239d0.txt`; the counter still emitted `FINDING d6-file no numstat receipt under .ufo/waves/round-38/measure`. Thus the frozen D6 check fails even with a committed receipt; it cannot establish the claimed window endpoints. **Falsifier for the claimed D6 evidence:** a reproducible counter run that recognizes such a committed file and evaluates its baseline/rev endpoints (the frozen counter does not).

At frozen claim commit `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, pristine counter exit was 1 / `predicate:false`, with `d6-file` plus other findings (`d1-correction`, `d1-results`, `d2-stated`, six `d3-hash`, `d3-freeze-landing`, `d4-lesson`, `d4-receipt`, `d5-receipt`). At `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a`, exit was also 1 / `predicate:false`, including `d6-file`. This is the observable state at both inspected revisions; it does not show the C1 predicate true at either revision.

The claim bytes at a8e7d50c state `baseline`/`frozenAt` = `98239d0396ff32c3feb14638b3214fe688e8b122`; the frozen C1 counter line 52 hardcodes `BASELINE = 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`. These are different commits (3f42a5c7 is an ancestor of 98239d03). The counter does not bind D6 to the claims file's baseline field. This is an additional endpoint ambiguity; the name-filter defect currently prevents reaching endpoint evaluation altogether.

## Mutation execution / verdict

Mutant: changed only the scratch copy's D6 `BASELINE` constant from `3f42a5c7…` to the claims.json value `98239d03…`. The same detector was run on the same scratch fixture revision (`6d87948024314b7d22a94ed8c32338a554891822`) on pristine, mutant, then restored bytes. All three returned exit 1 and the same D6 finding `d6-file`; the committed fixture receipt was listed by `git ls-tree` but not recognized. **Verdict: INCONCLUSIVE mutant** (baseline detector fails before it can exercise the mutated endpoint behavior). Mutant SHA-256: before mutation `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`; mutated `f7d682c1a2d7e97f5e6df8b86a1cc15b383f2750283284f84b8cf3b966d9ea59`; restored `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`. Production counter hash remained `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7` throughout.

## C2 — bounded evidence review, no finding

Receipt `corpus/evidence/round-38/playwright-firefox/receipt.json`: two runs; both first-shot SHA-256 values are `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`; top-level `binding:true`, `egressNonLoopback:0`, `survivors:0`. Each run reports `portClosed:true`, `firefoxSurvivorPids:0`, no errors, and egress `{samples:2, nonLoopback:0, lines:1}`. Run events include hydrated navigation, click effect, evaluation, and history traversal. The bounded receipt data is internally consistent; this does not independently establish that the runtime capture was complete.

Ran the frozen `c2-battery-mutants.mjs` in the scratch clone with `HYAKU_SCRATCH` under my assigned scratch root. It exited 0 with `verdict:pass`; m5 and m5b were killed (`status:1`, `clean:false`), m3 was classified as expected battery-survivor (`status:0`, `clean:true`), decoy stayed clean, and before/after counter hashes matched `6a14d8ca9200270e1fbd8537ddd74b986c181112eb97a9cfbc98dbb64047fecf`. No C2 counterexample found in these bounded checks.

## Scope and restoration

All mutation/fixture work was under `/fast/scratch/hyaku/tabi-r38/MutationTester35/`; no production files were edited. The scratch mutant was restored byte-for-byte (hash evidence above); scratch is removed before handoff.
