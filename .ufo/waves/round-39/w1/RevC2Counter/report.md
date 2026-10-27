# RevC2Counter — round 39 C2 counter review

**Axes:** coverage, calibration. Scope: compare frozen round-39 `c2-routed-defects-v2.mjs` D1–D3 against frozen round-38 `c1-routed-defects.mjs`; inspect D4–D7 paths and bypasses.

## Finding — D7 does not bind the sentence to the C2 claim identity

`c2-routed-defects-v2.mjs:247-250` takes `d.claims[1]` and checks only its `predicate`; it never verifies that the selected claim has `id === "C2"` (nor that the claims document identifies the expected round/schema). A claims document whose second entry is some other claim but carries the frozen sentence therefore satisfies D7. The rest of evaluate may independently find unrelated defects, but D7's stated sentence-identity check itself passes, so it does not guarantee that C2's predicate is the frozen one. The probe below changed only `claims[1].id` to `NOT-C2`, retained the exact frozen predicate, and the observed result had `d7.sentenceMatch: true`.

## D1–D3 comparison

The D1, D2, and D3 evaluator code is byte-identical between the two frozen files, with only explanatory comment changes around those blocks. The source diff showed no changes inside those three blocks. Thus no semantic drift in the original checks was found.

## D4–D6 paths inspected

- D4 uses the round-39 lesson and mutant receipt paths (`corpus/lessons/round-38.md`; `.ufo/waves/round-39/baseline/c2-sentence-mutant.json`). It checks captured-by text, numeric nonzero exit, differing sentence, and distinct 64-hex sha strings. These are receipt-field checks; they do not independently authenticate execution of the claimed command.
- D5 reads `.ufo/waves/round-39/measure/census-end.txt` from the target REV and re-parses `corpus/SOURCES.md` at REV, comparing rows and histograms.
- D6 requires `.ufo/waves/round-39/measure/numstat-at-${REV.slice(0,8)}.txt`, names full baseline and REV strings, and compares its non-comment data to a re-derived `git diff --numstat BASELINE..REV`, excluding that receipt path.

## Evidence / commands

1. Read frozen claims: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/claims.json`. Observed `frozenAt=9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`, C2 sentence ending in the claims-predicate identity requirement, and frozen counter digest `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`.
2. Command: `git -C "$R" show 9c09ebb1e2ff594c70ce72093b5d4133c1734dca:.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs | sha256sum` and corresponding round-38 path; also `sha256sum` of both working files. Output: round-39 frozen and working both `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`; round-38 frozen and working both `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`.
3. Command: extracted both files with `git show` at freeze into the seat scratch and ran `git diff --no-index -- "$S/v1.mjs" "$S/v2.mjs"`. Output was the full diff; D1–D3 blocks had no changed lines (comment-only differences were explicitly marked `(v1 semantics)`). The command exited 1 because the files differ elsewhere.
4. Probe command (with seat scratch as `SCRATCH`, lane as `REPO`): `node --input-type=module -e 'import {readFileSync,writeFileSync} from "node:fs"; import {evaluate} from "file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs"; const c=JSON.parse(readFileSync(process.env.REPO+"/.ufo/waves/round-39/claims.json","utf8")); c.claims[1].id="NOT-C2"; writeFileSync(process.env.SCRATCH+"/claims.json",JSON.stringify(c)); const o=evaluate({repo:process.env.REPO,rev:"9c09ebb1e2ff594c70ce72093b5d4133c1734dca",claimsPath:process.env.SCRATCH+"/claims.json"}); console.log(JSON.stringify({d7:o.d7,findings:o.findings.map(x=>x.id),predicate:o.predicate}));'`. Output began `{"d7":{"source":"/fast/scratch/hyaku/tabi-r39/RevC2Counter/claims.json", ... "sentenceMatch":true}, ...` (tool output was truncated at 768 bytes). The probe also reported other findings because the freeze REV predates D5/D6 receipts; those do not affect the observed D7 match.

**Verification gap:** no end-to-end true-predicate run at a measured integration REV was performed; this review was limited to the frozen code, paths, and the D7 falsification probe. Scratch was removed by the command trap.

VERDICT finding — D7 accepts a matching sentence attached to a non-C2 claim; D1–D3 show no semantic drift.
