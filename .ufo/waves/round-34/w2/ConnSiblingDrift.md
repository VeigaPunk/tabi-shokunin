# ConnSiblingDrift — sibling drift since frozen pins (round 34, w2, attempt 1)

Milestone: C1
Verdict: **holds** — no disposition-changing drift. 8 of 20 siblings drifted since their
frozen pins (all fast-forward: pin is an ancestor of tip, behind=0 in every case), and not one
new/changed line in `SKILL.md` or `corpus/knowledge` of any drifted lane names `tabi` or
touches the four round-34 boundaries (kake live-delivery-observation, kake
lab-performance-tool-runs, kotoba agent-facing-tool-text-craft, kasegi
authenticated-consequential-driving). The frozen sweep's pins remain sound; the out-of-pin
lines are excluded from the sweep by rule and are reported below as next-round frontier leads.

## Method

Pins: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/baseline/c1-pins.json`.
For each of the 20 sibling lanes: resolved the live tip (`master`, falling back to `main` —
audio, game-dev-2d/3d, kaidoku, kotodama, lore, revenger have no `master`), compared to the
pin, and for every drifted lane ran
`git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin diff <pin> <tip> -- SKILL.md corpus/knowledge`.
Diff receipts are copied to `.ufo/waves/round-34/w2/ConnSiblingDrift/*.diff`; the final tip
snapshot is `tip-snapshot.tsv` in the same dir.

## Drift table (tip snapshot at 2026-10-26 ~17:19 UTC; tips are live and moved mid-seat for
two lanes — kengaku 523b2780→fda71ae0, tsukuroi 87c4f7c6→78abb8b5; both re-diffed at newest tip)

| lane | pin | live tip | ahead | in-scope diff lines | names tabi? | touches a boundary? |
|---|---|---|---|---|---|---|
| kaidoku | 0b15c8b2c593… | 49096c7e6f22… (main) | 2 | 27 (SKILL.md round-40 instrument registry append) | no | no |
| kama | 0163fea2dab3… | 96d329186e77… | 3 | 0 | no | no |
| kasegi | d65d823e7c84… | 5006097a8430… | 6 | 186 (new `cisa-when-to-issue-vex.md`; round-39 dispositions append in `considerthese-proposals-ledger.md`) | no | no |
| kengaku | d7c77895752a… | fda71ae033224… | 6 | 44 (`tb2-constraints-scheduling-grader.md` round-41 wave-2 errata) | no | no |
| mado | ebdba13f7cb1… | b22ea56bff2f… | 5 | 126 (SKILL.md round-45 monitor-rule append; `hyprland-monitor-rule-r45.md`) | no | no |
| souji | c442b974fe27… | 9c76c7222a8a… | 1 | 0 | no | no |
| tameshi | c6295cb0473e… | 14d03ea4270c… | 4 | 0 | no | no |
| tsukuroi | a84fc9dec860… | 78abb8b5cdc9… | 3 | 339 (SKILL.md round-42 registry rows + census-pipefail lesson; 4 knowledge files) | no | no |

Unchanged (tip == pin): audio, chousa, game-dev-2d, game-dev-3d, kagi, kake, kotoba,
kotodama, kumitate, lore, mori, revenger (12 lanes).

Lanes with zero in-scope diff lines drifted only outside the swept surfaces:
kama → 17 files of round-46 seat tooling (`tools/round46-*`, `.ufo/waves/round-46/`);
souji → `corpus/lessons/round-33-verifier-spotcheck.md` (+154) only;
tameshi → 39 files (`SCORECARD.md`, `corpus/QUALITY.md`, `corpus/lessons/round-48*`).

## Evidence — commands and exit codes

All run read-only against the live sibling checkouts (no lane writes).

```
$ for lane in <20 lanes>; do git -C $lane-shokunin rev-parse master || rev-parse main; done
# exit 0 per lane; 7 lanes have no master (audio, game-dev-2d, game-dev-3d, kaidoku, kotodama, lore, revenger)

$ git -C kaidoku-shokunin diff 0b15c8b2c593b7954efda92249ef3fa895c79f99 49096c7e6f226af0c750c4b003be58883cb6049f -- SKILL.md corpus/knowledge
# exit 0; 27 lines (receipt kaidoku.diff). Note: first attempt used 'master' and failed with
# 'fatal: bad revision' inside the diff file — kaidoku has no master ref at all (rev-parse master
# echoes the arg then dies); redone with the explicit tip hash.

$ git -C <lane>-shokunin diff <pin> <tip> -- SKILL.md corpus/knowledge   # kama kasegi kengaku mado souji tameshi tsukuroi
# exit 0 each; receipts <lane>.diff (kama/souji/tameshi empty)

$ grep -inE 'tabi|live.?delivery|lab.?perf|agent.?facing|authenticated|consequential' diffs/*.diff
# grep exit 1 (no matches) — the desired result

$ grep -inwE 'tabi' diffs/*.diff
# grep exit 1 (no matches)

$ grep -inE 'live-delivery-observation|lab-performance-tool-runs|agent-facing-tool-text-craft|authenticated-consequential-driving|cdp-live-target-census|musketeer-cdp|browsingContext|webdriver-bidi' diffs/*.diff
# grep exit 1 (no matches)

$ git -C <lane>-shokunin merge-base --is-ancestor <pin> <tip>  # all 8 drifted lanes
# exit 0 each; rev-list --count tip..pin = 0 (pure fast-forward drift, no force-push)
```

Spot checks of content:
- kaidoku.diff — a `### Round-40 instrument registry` table (c1-counter.py … ledger-status.py,
  owner `kaidoku` throughout); no tabi token.
- kasegi.diff — CISA "When to Issue VEX Information" knowledge file (VEX publishing lifecycle)
  + a proposals-ledger round-39 dispositions append; the `authenticated`/`consequential` tokens
  do not occur, so the kasegi authenticated-consequential-driving boundary (map row 18) is untouched.
- tsukuroi.diff — round-42 gate registry rows (`scrub-record-r42`, `size-invariance-r42`) and a
  "Census early readers under pipefail" lesson; storage-integrity domain only.

## Would any change a disposition?

No. A disposition is a judgement about real overlap; every drifted line is either lane-internal
instrumentation (kaidoku, kama, tameshi), a same-lane domain lesson (mado hyprland monitor
rules, tsukuroi btrfs scrub/census, kengaku scheduling-grader errata, souji verifier
spotcheck), or a VEX publishing-policy document (kasegi) — none asserts or implies anything
about tabi's browser & web-interaction province, and none restates or contests any existing
map surface (cdp-runtime-observation, reverse-engineering-of-shipped-artifacts,
rea-browser-runtime-evidence, crawler-discipline-vs-publishing, musketeer-cdp-9222-profile-lease,
js-rendering-browser-execution, robots-txt-publisher-audit-vs-client-obedience,
accessibility-browser-at-execution, secrets-vault-ops, kimi-webbridge-plugin-internals,
cdp-live-target-census). No new overlap is claimed, so nothing must be mapped; nothing real is
concealed, so nothing must be screened.

## Operational observations (not defects of the commit under test)

1. Sibling repos mutate live: kengaku and tsukuroi each advanced one commit mid-seat
   (round-42 dispatch). Sweep scripts should resolve and record tip hashes up front.
2. `kaidoku-shokunin` has no `master` ref (main + detached HEAD); a script that assumes
   `master` gets a two-line rev-parse echo and a downstream `bad revision`. The C1 sweep's
   pinned-rev approach is immune; tip comparisons are not.

## Next-round frontier leads (out-of-pin, not part of the frozen sweep)

- kasegi `corpus/knowledge/cisa-when-to-issue-vex.md` (new, S057): publishing-policy layer for
  VEX status documents; only relevant to tabi if a future browser-side claim ever touches
  vulnerability-status consumption — none does now.
- tsukuroi round-42 census material (SKILL.md registry + `btrfs-scrub-record-r42.md`,
  `alpm-package-anatomy-r41.md`, `pacman-transaction-order-r39.md`,
  `adjacency-anchors-r19.json`): storage/arm-package domain; no browser overlap claimed.
- souji `corpus/lessons/round-33-verifier-spotcheck.md` (+154): a sibling-lane verifier
  spotcheck that grew after the pin; outside SKILL/knowledge sweep scope, worth a glance only
  if it ever cites tabi receipts (spot check: it does not name tabi — 0 hits in the diff).
- kama round-46 tooling (17 files under `tools/` and `.ufo/`): zero in-scope surface.

## Deliverables

- Report: `.ufo/waves/round-34/w2/ConnSiblingDrift.md` (this file).
- Receipts: `.ufo/waves/round-34/w2/ConnSiblingDrift/{kaidoku,kama,kasegi,kengaku,mado,souji,tameshi,tsukuroi}.diff`,
  `tip-snapshot.tsv`.

No lane tracked files were modified; no tools were installed (nothing needed). Scratch dir
`/fast/scratch/hyaku/tabi-r34/ConnSiblingDrift` removed after receipts were copied.
