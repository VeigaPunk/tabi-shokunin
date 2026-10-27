# CritC2ReceiptHonesty — C2 receipt authenticity

Axes: coverage, calibration. Finding concerns calibration (C2).

## Counterexample

The D4 check accepts receipt assertions, not evidence of the counter invocation or its output. Source lines 162–174 parse the committed receipt JSON and set `mutantRefused` solely from: `observedExit` is numeric and nonzero; `mutantPredicateSentence` is a string unequal to the frozen sentence; two 64-hex hash-shaped strings differ. No field is recomputed against the claims blobs, command/output, or a run transcript. A forger can write an arbitrary nonzero exit, invented different sentence, and arbitrary unequal hashes; these conditions pass D4 without running C2.

## Evidence / commands

From `/home/vgpnk/Projects/shokunin`:

```sh
node -e 'const fs=require("fs"); const p=process.argv[1]; const d=JSON.parse(fs.readFileSync(p,"utf8")); d.observedExit=1; d.mutantPredicateSentence="forged sentence different"; d.frozenClaimsSha256="0".repeat(64); d.mutantClaimsSha256="1".repeat(64); fs.writeFileSync(process.argv[2],JSON.stringify(d,null,2)+"\\n");' "$L/.ufo/waves/round-39/baseline/c2-sentence-mutant.json" "$S/forged.json"
```

Observed scratch forgery values: `observedExit=1`, sentence differs, hashes differ. Scratch was removed by EXIT trap. `c2-routed-defects-v2.mjs` lines 162–174 show those are precisely D4's checks. The counter loads the receipt through `blob(repo, REV, MUTANT_RECEIPT)`, so the scratch-only forgery was not itself consumed by a run; the source-level predicate makes the forgery's acceptance explicit. Existing committed receipt inspected at `baseline/c2-sentence-mutant.json`; it records exit 1, differing sentence and unequal hashes. The counter does not verify these correspond to actual execution.

The attempt to invoke an unnecessary one-line ESM dynamic import failed with `SyntaxError: Unexpected identifier 'process'`; this was not used as evidence. A separate actual counter invocation at REV `9c09ebb1e2ff594c70ce72093b5d4133c1734dca` reported D4 `{mutantExit:1, mutantSentenceDiffers:true, shaPair:true, mutantRefused:true}`. It reads the revision's committed receipt, not the scratch file.

## Smallest safe correction

Do not treat self-reported exit/hash/sentence fields as proof of a run. Either have the frozen counter itself execute the mutant fixture and check the resulting exit/output, or record a verifiable binding to immutable inputs and observed output (e.g. validate both hashes against actual frozen and mutant claims blobs, validate the mutant is exactly the intended predicate-only mutation, and independently establish nonzero exit plus the expected D7 refusal output). Merely adding more receipt fields remains forgeable.

Evidence paths: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` (D4 lines 162–174); `.ufo/waves/round-39/baseline/c2-sentence-mutant.json`; `.ufo/waves/round-39/w1/RevC2Receipt/report.md`.

VERDICT finding — D4 accepts a forged receipt with arbitrary unequal hashes and asserted nonzero exit, without proving any counter run.
