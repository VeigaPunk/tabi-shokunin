# tabi-shokunin — 旅

**Browser and web-interaction craft.** Driving real browsers against
real sites with evidence discipline — what to capture so a claim about
a page is re-verifiable.

Tabi (旅, journey) owns session hygiene, CDP discipline, settle-wait,
and the approval table that decides whether an interaction is even
allowed. It does not publish sites (kake) and it does not do binary
forensics (revenger / kaidoku).

This is a **shokunin lane** of the [shokunin fleet](https://github.com/VeigaPunk/shokunin).
Rank: **shonen** (probation; roster row withheld).

## The craft

[`SKILL.md`](SKILL.md) is written to be executable alone. A fresh agent
should be able to:

1. Run a loopback evidence capture start-to-finish (copy-paste runbook).
2. Grade the result on the evidence ladder (four rungs, including the
   network rung measured on a 3-navigation loopback journey).
3. Wait for a page to settle before a shutter.
4. Prove cleanup and closure.
5. Route every interaction class through the approval table.

Primary substrate documentation: the kimi-webbridge plugin
(`~/.kimi-code/plugins/managed/kimi-webbridge/`). Browser inventory and
profile surfaces are a **shape-only** census. Cookies and tokens are
shape-only, never values.

**Never** performs consequential actions on external sites (purchases,
posts, deletions). Observation and operator-approved interaction only.

## Province

Owns: kimi-webbridge as documentation surface; browser inventory +
profile shape; CDP session discipline (endpoints, targets,
screenshot/DOM evidence); site-specific gotchas; rate/rights
discipline; login-session *rules*; dynamic-page evidence patterns.

**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),
web publishing (→ kake), secrets (→ kagi). Out of province → report,
never absorb.

See [`PROVINCE.md`](PROVINCE.md).

## What's in this repository

```
tabi-shokunin/
├── SKILL.md                 runbook, evidence ladder, approval table, hygiene
├── PROVINCE.md
├── SHONEN.md                box 1 independently evidenced (TABI-B4 / TABI-R3-4)
├── LOG.md
├── SCORECARD.md
├── MINT.md
├── AGENTS.md
├── scripts/
│   ├── check-freshness.mjs
│   ├── check-round-contract.mjs
│   ├── check-user-round-contract.mjs
│   ├── pstack-aggregate.mjs / pstack-seat.mjs
│   └── user-aggregate.mjs / user-seat.mjs
├── reports/
├── plans/
└── corpus/
    ├── knowledge/           including network-evidence-rung, async-step, sufficiency
    ├── lessons/
    ├── evidence/
    └── handoffs/
```

## Start here

Read [`SKILL.md`](SKILL.md) §Approval table before touching a browser.
Loopback first. Then the contract checkers:

```sh
node scripts/check-round-contract.mjs
node scripts/check-freshness.mjs
```

If a hash in `SKILL.md` §Pins has moved, every citation is stale —
re-verify the note before reuse.

## How a round works

One axis-move. Lane identity: `tabi-shokunin <tabi@shokunin.local>`.

## Fleet

[VeigaPunk/shokunin](https://github.com/VeigaPunk/shokunin) ·
[kake-shokunin](https://github.com/VeigaPunk/kake-shokunin) ·
[kimi-shokunin](https://github.com/VeigaPunk/kimi-shokunin)
