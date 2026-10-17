# tabi-shokunin — 旅

Browser and web-interaction craft: driving a real browser against a real
site, and keeping enough evidence that a later reader can re-check the
claim.

The name is 旅, the journey. Probation builds the corpus from measured
surfaces. `SKILL.md` is written so a fresh agent can run a loopback
evidence capture from that file alone: commands, an evidence ladder,
settle-wait before the shutter, cleanup, and an approval table for every
interaction class.

## The job

`PROVINCE.md` owns the kimi-webbridge plugin
(`~/.kimi-code/plugins/managed/kimi-webbridge/`) as the primary substrate
documentation, a shape-only census of browsers and profiles, CDP session
discipline (endpoints, targets, screenshot and DOM evidence), and
interaction records: site-specific gotchas, rate and rights discipline,
login-session handling as shape only. Cookie and token values are never
read into a record.

It refuses reverse engineering as forensics (revenger, kaidoku), web
publishing (kake), and secrets (kagi). It does not perform consequential
actions on external sites — purchases, posts, deletions. Observation,
and interaction the operator has approved.

`scripts/` holds the round contracts and the seat/aggregate tools:
`check-freshness.mjs`, `check-round-contract.mjs`,
`check-user-round-contract.mjs`, `pstack-aggregate.mjs`,
`pstack-seat.mjs`, `user-aggregate.mjs`, `user-seat.mjs`. Each file's
header is the usage contract; they grade records this lane already
produced.

## Read this first

1. [`PROVINCE.md`](PROVINCE.md) — surfaces and the approval boundary.
2. [`SKILL.md`](SKILL.md) — the runbook, the evidence ladder, the approval table.
3. [`corpus/README.md`](corpus/README.md) — the coverage map.

## On disk

| Path | Role |
|---|---|
| `SKILL.md` | Runbook. Sufficient for a loopback capture, by its own contract. |
| `PROVINCE.md` | Owned surfaces and refusals. |
| `scripts/` | Freshness, round-contract, pstack, and user-round instruments. |
| `corpus/` | Knowledge and lessons. |
| `plans/`, `reports/` | Round plans and reports. |
| `MINT.md`, `SHONEN.md` | Mint record and promotion checklist. Rank is shonen. |
| `LOG.md`, `SCORECARD.md` | Audit trail and axis verdicts. |

## Fleet

Protocol and roster: [shokunin](https://github.com/VeigaPunk/shokunin).
This repository is a sibling lane. It is not an object in the fleet
root's `MANIFEST.json` `roster` array (13 ids, ending at `kaidoku`,
read 2026-10-17). Rank **shonen**.
