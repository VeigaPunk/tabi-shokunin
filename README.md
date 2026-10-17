# tabi-shokunin — 旅

**Browser and web-interaction craft.** Driving a real browser against a
real page with evidence discipline — capture, settle-wait, hygiene,
approval — so a claim about a page can be re-verified.

A **shokunin lane**: an expert agent for one domain, minted and trained
under the [shokunin skill](https://github.com/VeigaPunk/shokunin).
Rank: **shonen**. Promotion is a named non-author review of
[`SHONEN.md`](SHONEN.md), never self-attestation.

This lane answers: *can this journey produce a packet a stranger can
grade against the evidence ladder, without performing a consequential
action on someone else's site?*

## Domain

From [`PROVINCE.md`](PROVINCE.md): the kimi-webbridge plugin as primary
substrate documentation; browser inventory + profile surfaces
(shape-only); CDP session discipline; site-specific gotchas; rate/rights
discipline; login-session handling (cookies/tokens **shape-only, never
values**); dynamic-page evidence patterns.

**Never** purchases, posts, or deletions on external sites. Observation
and operator-approved interaction only. The approval table in
[`SKILL.md`](SKILL.md) is load-bearing.

**Refuses:** reverse engineering as forensics (→
[kaidoku](https://github.com/VeigaPunk/shokunin-reverse-engineering) /
[revenger](https://github.com/VeigaPunk/shokunin-binary-forensics));
web *publishing* (→ [kake](https://github.com/VeigaPunk/kake-shokunin));
secrets (→ [kagi](https://github.com/VeigaPunk/kagi-shokunin)).

`SKILL.md` is written to be **executable alone**: a fresh agent can run
a loopback evidence capture start-to-finish from the runbook.

## What's here

| Path | Role |
|---|---|
| [`SKILL.md`](SKILL.md) | runbook, evidence ladder, settle-wait discipline, approval table |
| [`PROVINCE.md`](PROVINCE.md) | surfaces and the consequential-action fence |
| [`scripts/check-freshness.mjs`](scripts/check-freshness.mjs) | pin check against declared substrate hashes |
| [`scripts/check-round-contract.mjs`](scripts/check-round-contract.mjs) · [`scripts/check-user-round-contract.mjs`](scripts/check-user-round-contract.mjs) | round-contract gates |
| [`corpus/`](corpus/) | knowledge, lessons, evidence, handoffs |
| [`SCORECARD.md`](SCORECARD.md) · [`LOG.md`](LOG.md) · [`SHONEN.md`](SHONEN.md) | axes, trail, promotion |

## A first check

```sh
node scripts/check-freshness.mjs
```

If a hash in `SKILL.md` §Pins has moved, every citation is stale —
re-verify the note before reuse. Loopback capture commands live in the
runbook; they are copy-paste, not oral tradition.

## How a lane learns

Append-only corpus; every claim separates observation / inference /
unknown; rounds are non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme).
