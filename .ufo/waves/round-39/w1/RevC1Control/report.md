# RevC1Control — round 39 C1 do-nothing control

## Scope and frozen inputs

- Claims: `.ufo/waves/round-39/claims.json`; C1 predicate requires schema v2, two unrefused runs, identical first-shot SHA-256, per-run owned child tree, ≥8 samples and ≥1000 ms coverage, zero non-loopback observations on `ss` and `/proc` including final sweep, zero survivors, closed fixture port, session-bound Firefox version, and refusal of the round-38 v1 receipt.
- Freeze: `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; baseline: `5bc56a81d196caeb8d24551928b883802697aabb`.
- Frozen counter: `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`, SHA-256 `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` both at freeze and working tree. Claims' frozen digest agrees.
- Current measured tip: `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`; freeze is its ancestor. Round-38 receipt at freeze and tip is byte-identical; its sole recorded commit is `3bc0b10`.

## Control receipt and frozen counter result

Committed control: `corpus/evidence/round-38/playwright-firefox/receipt.json` (`tabi-pw-firefox-receipt-v1`). It has two runs, `firefoxVersion: null`; both records expose legacy `firefoxPids`, `egress.samples: 2`, and zero observed non-loopback connections, but no v2 `owned.tree` or `sampleCount` fields. The frozen counter run at current tip returned exit 0 and `predicate:false`; the C1 capability receipt at tip satisfies the counter's other measured fields, while the control is refused.

Exact counter-reported refusal reasons:
1. `schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2`
2. `run1 has no owned pid tree`
3. `run1 sampleCount undefined < 8`
4. `run2 has no owned pid tree`
5. `run2 sampleCount undefined < 8`

Counter JSON also reported `receipt.schemaOk=true`, `runs=2`, `binding=true`, `versionBound=true`, `refused=false`, control `v1Present=true`, `refused=true`, and `findings=[]` for the current round-39 receipt. Exit 0 means evaluation succeeded and the target predicate is met, not that the control itself was admitted.

## Legacy behavior assessment

The committed round-38 driver source contains global executable grep PID discovery (`ps ... | grep 'firefox-1555/firefox/firefox' | grep -v grep | awk ...`) at lines 74 and 138, an `ss` grep restricted to those PIDs, and a 400 ms interval at line 83. The receipt records two samples per run. Therefore its empty-set/weak-sampling design cannot reach this frozen C1 control predicate: even if an empty PID set yields no matching `ss` lines and zero egress, the serialized v1 schema fails the v2 schema test, missing `owned.tree` fails the owned-process test, and missing `sampleCount` fails the minimum-sample test on both runs. The counter explicitly derives these refusal reasons before determining predicate; empty `firefoxPids` alone is not interpreted as a valid owned set. The frozen control subcheck does not separately test `coverageMs`, but the observed v1 receipt is already refused by the three exact categories above; the v2 target checks ≥1000 ms per run.

## Exact commands and observed output

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
 git rev-parse HEAD
# 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4
 git rev-parse 9c09ebb1e2ff594c70ce72093b5d4133c1734dca
# 9c09ebb1e2ff594c70ce72093b5d4133c1734dca
 git rev-parse 5bc56a81d196caeb8d24551928b883802697aabb
# 5bc56a81d196caeb8d24551928b883802697aabb
 git merge-base --is-ancestor 9c09ebb1e2ff594c70ce72093b5d4133c1734dca HEAD
# exit 0; printed yes
 sha256sum .ufo/waves/round-39/counters/c1-egress-session-bound.mjs
# 75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e
```

A clean local clone was made at `/fast/scratch/hyaku/tabi-r39/RevC1Control/clone`, checked to have `git rev-parse --show-toplevel` equal that clone and HEAD equal current tip; scratch was removed by the command's EXIT trap.

```sh
node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs \
  --rev 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4 \
  --repo /fast/scratch/hyaku/tabi-r39/RevC1Control/clone --json
```

Observed JSON (formatted):
```json
{"schema":"tabi-r39-c1-egress-session-bound","rev":"1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4","receipt":{"schemaOk":true,"runs":2,"binding":true,"versionBound":true,"refused":false},"control":{"v1Present":true,"refusalReasons":["schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2","run1 has no owned pid tree","run1 sampleCount undefined < 8","run2 has no owned pid tree","run2 sampleCount undefined < 8"],"refused":true},"findings":[],"predicate":true}
```

Legacy-driver evidence command: `git show 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4:scripts/playwright-firefox-loopback-round38.mjs | grep -nE 'grep|400|sample|firefoxPids|pid'`; observed grep-PID discovery at 74/138, `ss` filtering at 79, and 400 ms interval at 83. Receipt field evidence: `node -e` read the committed JSON; both run summaries showed `egress.samples:2`, `survivors:0`, `firefoxSurvivorPids:0`, and legacy PID lists.

Evidence paths: claims `.ufo/waves/round-39/claims.json`; counter `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`; control receipt `corpus/evidence/round-38/playwright-firefox/receipt.json`; driver `scripts/playwright-firefox-loopback-round38.mjs`.

## Verification gaps

No live browser or fixture was run; this assignment checked the committed round-38 control and ran the frozen counter against the current committed tip. The current counter output itself records no findings.

VERDICT ok — the frozen counter refuses the committed v1 do-nothing control for five explicit schema/owned-tree/sample-count reasons; the legacy global-grep, 400 ms, and potentially empty-PID behavior cannot pass the frozen C1 control gate.
