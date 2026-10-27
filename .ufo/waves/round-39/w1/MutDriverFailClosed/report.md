# MutDriverFailClosed — round 39 mutation probe

## Inputs
- Frozen claims: `.ufo/waves/round-39/claims.json` (C1 requires owned tree nonempty; dual `ss` and `/proc` observations; both fail closed when unavailable).
- Frozen C1 counter: `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`.
- Frozen C2 counter: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`.
- Driver under examination: `scripts/playwright-firefox-egress-round39.mjs`.

## Probe / detector
Requested mutant: remove the empty-owned-set refusal and force the owned tree empty; separately make both observation surfaces unreadable. Expected behavioral detector: execute the live driver against loopback only and confirm both mutant cases do not yield a successful/green receipt (baseline should refuse or otherwise fail closed). Per mutation-tester constraints, I did not invoke another runtime, so no driver behavioral detector was run. These cases are **inconclusive**, not killed mutants.

## Commands and observed output
```
mkdir -p /fast/scratch/hyaku/tabi-r39/MutDriverFailClosed /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/w1/MutDriverFailClosed
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs /fast/scratch/hyaku/tabi-r39/MutDriverFailClosed/driver.mjs
sha256sum /fast/scratch/hyaku/tabi-r39/MutDriverFailClosed/driver.mjs
```
Output:
```
3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc  /fast/scratch/hyaku/tabi-r39/MutDriverFailClosed/driver.mjs
```
A pristine copy was saved in scratch; its hash and the original source hash were also `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc`. No mutation was applied, and thus there are no mutated/restored detector outputs. Source inspection observed empty tree refusal at driver lines 249–255 and unavailable-preflight refusal at lines 258–263; `sampleSockets` reports unavailable only when both surfaces return null (lines 218–226). This is code inspection, not behavioral verification.

## Evidence / restoration
No source or repo file was edited. Scratch was removed before reporting. No tools installed.

VERDICT could-not-evaluate — behavioral mutation probe not run because the assigned mutation-tester role prohibits invoking another runtime; mutant survival/killing is unobserved.
