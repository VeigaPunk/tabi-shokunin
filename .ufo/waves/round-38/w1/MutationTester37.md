# W1-37 — C1/C2 mutation probe

## C1 (primary: D1/D2 tally and scorecard)
- Frozen counter: `.ufo/waves/round-38/counters/c1-routed-defects.mjs`, SHA-256 `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`, matches `claims.json` frozen digest. Probe REV: `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.
- Pristine invocation: `node c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` exited 1. Output began `d1: stalePresent=true, supersedingCorrection=false`; `d2: stated=null, recomputed={ok:23,finding:11,error:0,none:0,reports:34}`. The command's bounded detector therefore fails on the frozen claim bytes; per mutation protocol, any kill conclusion from this baseline is **inconclusive**.
- Mutant in isolated scratch only: changed line 94's expected seat count from `out.d1.seats !== 34` to `!== 35`. Mutant SHA-256 `0c2a4a33ad8a2a4afe06b30a4aa527f5c5c6d3db1f000a2be6f3b3d7cc02643c`; invocation also exited 1 with the same visible D1/D2 failures. This does not establish a kill: baseline already fails and output does not distinguish the mutant's added D1 finding.
- Restored scratch file SHA-256 equals pristine (`209d86a0…`); restored invocation again exited 1 with same visible failures. **Verdict: inconclusive**, not killed or survived. Falsifiable issue: frozen C1's own counter does not accept the cited REV because it reports no superseding D1 correction and no stated D2 tally. A counterexample to this observation would be a repeat at this exact REV/repo producing `predicate:true` and a stated D2 tally.

## C2 mutation-battery check
- Copied both frozen C2 scripts to the seat scratch directory; counter SHA-256 matched frozen `6a14d8ca9200270e1fbd8537ddd74b986c181112eb97a9cfbc98dbb64047fecf`.
- `HYAKU_SCRATCH=$S node c2-battery-mutants.mjs` output: `verdict=pass`; m5 and m5b status 1 / `clean:false` (killed); m3 status 0 / `clean:true` (survives battery, classified live-leg-only); decoy status 0 / `clean:true`; all expectations true; `sha256Before == sha256After == 6a14d8ca…`.
- This checks battery classifications, not an independent Firefox runtime receipt/binding/egress/cleanup run. **No finding** on live C2 behavior from this bounded check; it cannot validate the full frozen C2 predicate.

## Restoration / scope
All mutations were in `/fast/scratch/hyaku/tabi-r38/MutationTester37/`. Scratch pristine/restored C1 hashes match exactly. No tools installed. Scratch cleaned before handoff.
