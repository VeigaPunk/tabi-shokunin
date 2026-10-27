# RevNoHarmScope — round 39 changed-path review

Read-only review. The frozen claims name C1 coverage and C2 calibration; the frozen C1 and C2 counters identify themselves as round-39 instruments. Baseline: `5bc56a81d196caeb8d24551928b883802697aabb`; instrument freeze: `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`.

Commands and observed output:

```text
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --name-status 5bc56a81d196caeb8d24551928b883802697aabb..HEAD
A .ufo/waves/round-39/{assimilation/*,baseline/*,claims.json,counters/*,gen-w1-spec.py,measure/*,w1*,...}
A corpus/evidence/round-39/playwright-egress/receipt.json
A scripts/playwright-firefox-egress-round39.mjs

(git status --short; git diff --name-status; git ls-files --others --exclude-standard)
Tracked worktree diff: empty
Untracked paths outside individual seat directories:
?? .ufo/waves/round-39/measure/c2-self-reference-probe.txt
?? .ufo/waves/round-39/w1.ready.partial
```

The full read-only status output also lists untracked wave reports/artifacts in other named seat directories (e.g. `w1/RevC1Control/`, `w1/CritFixture/`); these are within the wave's per-seat report/evidence layout, not this seat's write scope. The baseline-to-HEAD additions include planned round-39 instrument, measurement, receipt, and driver paths. Freeze-to-HEAD contains subsequent round-control/dispatch changes (21 paths, 4205 insertions, 14 deletions), within `.ufo/waves/round-39/`.

Finding: `measure/c2-self-reference-probe.txt` is an untracked artifact outside any seat directory and outside the declared report/evidence location; `w1.ready.partial` is likewise an untracked round-control artifact, not within this seat's allowed directory. Their authors/purpose are not established by this read-only review. No tracked live-tree modification was present in `git diff` at review time. These are scope-boundary artifacts; no mutation performed.

VERDICT finding: two untracked round-39 paths outside individual seat scopes (`.ufo/waves/round-39/measure/c2-self-reference-probe.txt`, `.ufo/waves/round-39/w1.ready.partial`); tracked worktree diff empty.
