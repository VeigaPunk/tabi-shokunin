# tabi-shokunin — 旅

**Browser and web-interaction craft — a journey with evidence, or it
did not happen.**

A **shokunin lane** minted and trained under the
[shokunin](https://github.com/VeigaPunk/shokunin) skill. Tabi drives
real browsers against real sites under an evidence ladder and an
approval table.

**Wiki:** [lane overview](https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/tabi-shokunin?branch=master)

## Domain

From `PROVINCE.md` and `SKILL.md`:

- the kimi-webbridge plugin as primary substrate documentation
- browser inventory and profile surfaces (shape-only census)
- CDP session discipline — endpoints, targets, screenshot / DOM capture
- interaction records: site gotchas, rate/rights discipline, login-session
  rules (cookies/tokens shape-only, never values)
- dynamic-page evidence patterns so a claim about a page is re-verifiable

`SKILL.md` is written to be executable alone: a fresh agent can run a
loopback evidence capture start-to-finish from the runbook, grade it
against the four-rung evidence ladder, wait for the page to settle
before a shutter, and prove cleanup.

## What it refuses

| Out of province | Owner |
|---|---|
| reverse engineering as forensics | [kaidoku](https://github.com/VeigaPunk/shokunin-reverse-engineering) / [revenger](https://github.com/VeigaPunk/shokunin-binary-forensics) |
| web *publishing* | [kake](https://github.com/VeigaPunk/kake-shokunin) |
| secrets | [kagi](https://github.com/VeigaPunk/kagi-shokunin) |

Never performs consequential actions on external sites (purchases,
posts, deletions). Observation and operator-approved interaction only.

## In this repository

```
PROVINCE.md     surfaces + approval fence
SKILL.md        runbook, evidence ladder, settle-wait, hygiene
SHONEN.md  SCORECARD.md  LOG.md  MINT.md   (minted 2026-10-14)
corpus/         knowledge/, lessons/, evidence/, handoffs/, QUALITY.md
scripts/
  check-freshness.mjs
  check-round-contract.mjs
  check-user-round-contract.mjs
  pstack-aggregate.mjs  pstack-seat.mjs
  user-aggregate.mjs    user-seat.mjs
reports/
```

## Contract checks

```bash
node scripts/check-freshness.mjs
node scripts/check-round-contract.mjs
```

If a hash in `SKILL.md` §Pins has moved, every citation is stale —
re-verify the note before reuse.

## How a lane learns

Append-only corpus; every claim separates observation / inference /
unknown; rounds are non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme).
