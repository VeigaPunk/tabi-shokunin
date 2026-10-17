# tabi-shokunin — 旅

The question this lane answers is how to drive a real browser against a page and leave evidence that a later reader can re-check (`PROVINCE.md`).

**Rank:** `SHONEN.md` is titled a probation checklist. Its four boxes are `[x]`, checked by named non-author verifiers TABI-B4 (scribe) and TABI-R3-4 (document-only executor), with the evidence paths written under each box. The file still titles the lane probation. This README does not call that a promotion.

## Owns / refuses

Owns the kimi-webbridge plugin as primary substrate documentation, a shape-only browser and profile census, CDP session discipline, interaction records (gotchas, rate and rights, login-session rules with cookies and tokens shape-only), and dynamic-page evidence patterns (`PROVINCE.md`).

Refuses reverse engineering as forensics (revenger and kaidoku), web publishing (kake), and secrets (kagi: session material is shape-only, never content-read). It does not perform consequential actions on external sites. Observation and operator-approved interaction only (`PROVINCE.md`).

## Start here

The runbook the executor test followed is `SKILL.md` (the TABI-R3-4 note in `SHONEN.md`: steps 0–13, copy-paste commands, loopback only). Do not invent a live-site command from this page. Two in-repo aggregators fold seat results and refuse a missing seat:

```sh
node scripts/pstack-aggregate.mjs <round-id>
node scripts/user-aggregate.mjs <round-id>
```

Each script exits 2 unless `<round-id>` matches `pstack-20261015-r01` through `r10`, or `user-20261015-r01` through `r10` (`scripts/pstack-aggregate.mjs`, `scripts/user-aggregate.mjs`). They read `corpus/evidence/<round>/seats/sNN/result.json`. They do not launch a browser.

## How to read the corpus

`corpus/README.md` is the coverage map. It is line-cited (`corpus/README.md:5-9`, `:30`, `:51` from knowledge and lessons), so it was not reflowed. The header still records the round-3 census; later rows were appended in the file itself. `corpus/knowledge/` holds the webbridge, CDP, journey, and approval notes. `corpus/evidence/` holds round receipts. `corpus/QUALITY.md` is the admission bar. `corpus/handoffs/` and `corpus/lessons/` are the handoff and lesson piles.

## Map

| Path | What it is |
|---|---|
| `PROVINCE.md` | Browser-craft boundary |
| `SKILL.md` | Runbook, approval table, evidence ladder |
| `SHONEN.md` | Probation checklist, boxes checked by named verifiers |
| `MINT.md` | Mint cause |
| `LOG.md` | Append-only record |
| `SCORECARD.md` | Axis verdicts |
| `AGENTS.md` | Operating rules |
| `corpus/` | Knowledge, evidence, lessons, index |
| `scripts/` | Seat aggregators |
| `plans/` | Round plans |
| `reports/` | Round reports |
| `.ufo/` | Round machinery |

## Neighbors

revenger and kaidoku (forensics), kake (publishing), kagi (secrets), kama (endpoints). `MINT.md` records those rejected fits. Out of province is reported, not absorbed.

Fleet protocol: [VeigaPunk/shokunin](https://github.com/VeigaPunk/shokunin).
